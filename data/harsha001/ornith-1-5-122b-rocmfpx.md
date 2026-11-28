# Harsha001/Ornith-1.5-122B-ROCmFPX

## Resumen

Ornith-1.5-122B-ROCmFPX es una cuantizacion de 4 bits del modelo Ornith-1.5-122B, publicada por el usuario Harsha001 sobre los pesos originales de ornith-ai. No es un modelo nuevo, sino una distribucion empaquetada en formato GGUF con tipos de peso de baja precision especificos para hardware AMD, desarrollados dentro del fork ROCmFPX de llama.cpp. El objetivo es hacer viable la inferencia de un modelo de 122.111.526.912 parametros en una unica maquina AMD Strix Halo (Ryzen AI Max, arquitectura gfx1151) con memoria unificada, algo imposible con los pesos BF16 originales de 228 GB.

El paquete ofrece dos variantes: una "balanced" de 80 GB, mas fiel al modelo original, y una "Strix" de 65 GB, optimizada por velocidad en ese SoC concreto. Ambas se reparten en ficheros por debajo de 50 GB e incluyen un proyector de vision F16 de 0,9 GB que habilita entrada de imagen mediante `--mmproj`. La relevancia actual reside en que demuestra la viabilidad de servir un modelo MoE de gran tamano en hardware de consumo profesional AMD, aunque con la restriccion severa de requerir un fork concreto del runtime.

La model card no aporta informacion sobre la arquitectura interna del modelo base (numero de expertos, atencion, contexto nativo), los idiomas soportados ni el proceso de entrenamiento. Toda la documentacion disponible se centra en el proceso de cuantizacion, las metricas de degradacion y las instrucciones de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se etiqueta como MoE; el detalle de capas y expertos no se especifica) |
| Parametros totales | 122.111.526.912 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0_ROCMFP4 (balanced) y Q4_0_ROCMFP4_STRIX (Strix), ambas de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (dividido en dos partes por variante) mas proyector de vision F16 en GGUF |
| Tamano de los pesos | 80 GB (balanced) y 65 GB (Strix); 0,9 GB adicionales de proyector visual |
| Tamano del repositorio | 146,1 GB (incluye ambas variantes) |
| Modelo base | ornith-ai/Ornith-1.5-122B (BF16, 228 GB) |
| Runtime requerido | fork ROCmFPX de llama.cpp (commit fb08d7c); incompatible con llama.cpp estandar, LM Studio y Ollama |
| Backends soportados | Vulkan y HIP/ROCm (gfx1151); los kernels CUDA del fork no son correctos en NVIDIA segun el autor |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts segun la etiqueta `moe` del repositorio, con 122.111.526.912 parametros totales. La model card no detalla el numero de expertos, la proporcion de parametros activos por token, el mecanismo de atencion ni la ventana de contexto nativa. Tampoco se documentan los datos de entrenamiento, el volumen de tokens, la composicion del corpus ni si hubo fases de RLHF o DPO; esa informacion corresponderia a la model card del modelo original de ornith-ai, que no forma parte de la informacion disponible.

El proceso de cuantizacion si esta documentado con precision. Se parte de los pesos BF16 mediante `convert_hf_to_gguf.py --no-mtp --outtype bf16` del fork ROCmFPX, descartando la cabeza de prediccion multi-token porque el fork no la emplea en decodificacion. La matriz de importancia utilizada es la de bartowski (`Ornith-1.5-122B-imatrix.gguf`, 573 chunks de 512 tokens de su conjunto de calibracion v6), reutilizada para evitar las aproximadamente 12 horas de calculo que habria supuesto generarla desde los 228 GB de BF16 en una CPU con 121 GB de RAM. La cuantizacion se ejecuta con `llama-quantize --imatrix`, una pasada por tipo. Las metricas de perplejidad y divergencia KL se midieron en backend CPU, no en GPU.

## Capacidades

- Generacion de texto conversacional: el repositorio se etiqueta como `conversational` y `text-generation`, y el autor verifico cada fichero con un prompt de chat antes de subirlo.
- Entrada de imagen: el proyector F16 incluido (`mmproj-Ornith-1.5-122B-f16.gguf`) habilita vision multimodal mediante el flag `--mmproj` de llama-server.
- Razonamiento y codigo: no hay documentacion especifica en la informacion disponible; las capacidades heredadas dependen del modelo base Ornith-1.5-122B, cuyos detalles no se incluyen.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Modo thinking explicito: no disponible.

## Casos de uso

- Despliegue local de un modelo de 122B en una estacion de trabajo AMD Strix Halo: con 96 GB de memoria asignada a la GPU (configurable en BIOS en Windows o mediante los limites GTT/TTM en Linux), la variante balanced de 80 GB cabe junto con contexto util, permitiendo inferencia privada sin dependencia de la nube.
- Procesamiento de documentos con imagen: el proyector visual F16 permite pasar capturas, diagramas o paginas escaneadas junto con instrucciones de texto, util para extraccion de datos estructurados en entornos con requisitos de confidencialidad.
- Prototipado de asistentes conversacionales de contexto largo: al tratarse de un MoE de 122B, el modelo puede sostener conversaciones multi-turno con mayor profundidad que alternativas densas de menor tamano, siempre que la ventana de contexto configurada en llama-server sea suficiente.
- Evaluacion comparativa de tecnicas de cuantizacion: las metricas publicadas (PPL, KLD y coincidencia de top-1 frente a BF16) convierten este repositorio en un banco de pruebas util para estudiar el impacto de tipos de 4 bits orientados a AMD frente a Q4_K_M.
- Investigacion sobre runtimes alternativos: sirve para validar el fork ROCmFPX en cargas reales y comparar su comportamiento con llama.cpp estandar en el mismo hardware.
- Escenarios con restricciones de licencia: la licencia MIT del modelo base y de la cuantizacion facilita su incorporacion en productos comerciales internos, siempre que se respeten las condiciones del fork utilizado.

## Benchmarks y rendimiento

Las unicas metricas publicadas corresponden a calidad de cuantizacion sobre WikiText-2 test, 12 chunks de 512 tokens, backend CPU, comparando contra el modelo BF16 original.

| Modelo | PPL | KLD | Same top |
|---|---:|---:|---:|
| BF16 (original, 228 GB) | 4,8585 | 0 | 100 % |
| Q4_0_ROCMFP4 balanced (80 GB) | 5,2165 | 0,1769 | 84,41 % |
| Q4_0_ROCMFP4_STRIX (65 GB) | 5,3642 | 0,2406 | 81,57 % |
| Q4_K_M (referencia, 70 GB, no publicado en este repo) | 5,1149 | 0,1564 | 84,58 % |

El autor advierte que el modelo es mas sensible a la cuantizacion de 4 bits de lo habitual: incluso Q4_K_M, generado desde los mismos pesos BF16 y la misma matriz de importancia, se aleja de forma clara del original. La muestra de 12 chunks es pequena y el margen estimado de error en KLD es de aproximadamente ±0,01. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada: 80 GB para la variante balanced y 65 GB para la Strix, mas 0,9 GB del proyector visual y el espacio adicional para la cache KV segun la longitud de contexto.
- Hardware objetivo: AMD Strix Halo (Ryzen AI Max, gfx1151) con 128 GB de memoria unificada. Es necesario asignar 96 GB a la GPU; con un reparto 64/64 ninguna de las dos variantes deja contexto util (la Strix dejaria unos 3 GB).
- GPU discretas: no se documentan requisitos ni resultados en A100, H100 o RTX 4090. El autor indica que los kernels CUDA del fork para estos tipos no son correctos en NVIDIA, por lo que no se ofrecen cifras en GPU NVIDIA.
- GPU de consumo: la viabilidad en tarjetas consumer convencionales no esta documentada; el diseno apunta a memoria unificada de gran capacidad, no a VRAM dedicada.
- Opciones de despliegue: exclusivamente el fork ROCmFPX de llama.cpp, compilado con `-DGGML_VULKAN=ON` o con `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`, y lanzado con `llama-server -m <primera-parte>.gguf --mmproj mmproj-Ornith-1.5-122B-f16.gguf -ngl 999 -fa on --jinja`. No funciona en llama.cpp estandar, LM Studio ni Ollama.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| Ornith-1.5-122B-ROCmFPX (balanced) | 122,1 B (MoE) | no disponible | Q4_0_ROCMFP4, 80 GB | MIT | ROCmFPX (fork de llama.cpp) |
| Ornith-1.5-122B-ROCmFPX (Strix) | 122,1 B (MoE) | no disponible | Q4_0_ROCMFP4_STRIX, 65 GB | MIT | ROCmFPX (fork de llama.cpp) |
| Ornith-1.5-122B (BF16 original) | 122,1 B (MoE) | no disponible | BF16, 228 GB | MIT | llama.cpp y otros runtimes estandar |
| Ornith-1.5-122B-GGUF de bartowski | 122,1 B (MoE) | no disponible | Q4_K_M, 70 GB | MIT | llama.cpp estandar |
| DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF | no disponible | no disponible | GSQ/RCO, optimizado para Strix Halo | no disponible | ROCmFPX |

La comparacion directa de rendimiento entre estas opciones no es posible con los datos disponibles: solo se publican metricas de fidelidad a BF16 para las cuantizaciones de este repositorio y para Q4_K_M, no resultados de tareas.

## Limitaciones y advertencias

- Compatibilidad restringida: los tipos Q4_0_ROCMFP4 y Q4_0_ROCMFP4_STRIX solo se cargan en el fork ROCmFPX. Cualquier intento de usarlos en llama.cpp estandar, LM Studio u Ollama fallara.
- Degradacion medible frente a BF16: la variante balanced pierde aproximadamente 0,36 puntos de perplejidad y coincide con el token top-1 del original en el 84,41 % de los casos; la Strix baja al 81,57 %. El propio autor califica el modelo como especialmente sensible a la cuantizacion de 4 bits.
- Muestra de evaluacion reducida: las metricas provienen de 12 chunks de 512 tokens, con un margen de ±0,01 en KLD, por lo que no deben tomarse como una caracterizacion exhaustiva.
- Ausencia de datos en GPU: no hay mediciones de rendimiento ni de calidad en backend GPU para estos tipos; las cifras publicadas son de CPU.
- Kernels CUDA incorrectos: el autor declara que los kernels CUDA del fork para estos tipos no funcionan correctamente en NVIDIA, lo que descarta ese hardware para esta distribucion.
- Requisito de memoria estricto: en un Strix Halo de 128 GB hay que reservar 96 GB a la GPU; con repartos menores el modelo no cabe con contexto util.
- Falta de informacion sobre sesgos y alucinacion: la model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- Idiomas no declarados: el campo de idiomas esta vacio, por lo que no se puede garantizar un comportamiento multilingue concreto.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre la cadena de responsabilidad respecto al modelo base.
- Descargas limitadas: 226 descargas y 1 like en el momento de la consulta, lo que indica una validacion comunitaria escasa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Ornith-1.5-122B-ROCmFPX
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Fork ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Cuantizaciones GGUF de bartowski (origen de la matriz de importancia): https://huggingface.co/bartowski/Ornith-1.5-122B-GGUF
- Modelo destacado del mismo autor para Strix Halo: https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
