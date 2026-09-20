# ProCreations/Image-2.1-Calibrated-FP8

## Resumen

Image 2.1 Calibrated FP8 es una cuantizacion W8A8 en formato E4M3 del transformer de imagen del modelo Qwen/Qwen-Image-2.1, publicada por el usuario ProCreations. No se trata de un modelo nuevo ni de un ajuste fino, sino de un checkpoint de posentrenamiento (calibracion post-training, explicitamente no QAT ni destilacion) en el que 224 proyecciones grandes de atencion y MLP pasan a ejecutarse con pesos FP8 y activaciones FP8 cuantizadas dinamicamente por token, mientras que el codificador de texto, el VAE, las normalizaciones y las proyecciones sensibles se mantienen en BF16.

El problema que resuelve es el coste de inferencia de un modelo de difusion de gran tamano: la calibracion busca que la perdida de fidelidad respecto a la referencia BF16 sea minima sin recurrir a tecnicas que alteren el numero de pasos. El autor reporta una similitud coseno media de 0,995627 sobre el latente final a resolucion completa, un LPIPS (AlexNet) medio de 0,0345 y un SSIM medio de 0,9713 a 512 px, junto con una aceleracion medida de 1,40x a 1024x1024 y 1,25x a 2048x2048 sobre una RTX PRO 6000 Blackwell de 96 GB.

Su relevancia es acotada y muy especifica: solo funciona con GPU Blackwell (SM120), emplea un formato de runtime propio que no es intercambiable con ComfyUI, vLLM o TensorRT, y se distribuye bajo licencia Qwen Research con caracter de investigacion y evaluacion. El repositorio (7,3 GB, 0 descargas, 1 like en el momento de la consulta) incluye codigo de calibracion y evaluacion reproducible, comparativas pareadas, trazas del profiler y una demostracion de 30 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para imagenes (image transformer) derivado de Qwen-Image-2.1; atencion y MLP cuantizados, condicionamiento, proyecciones de entrada/salida y normalizacion en precision original |
| Parametros totales | no disponible (el autor no publica el recuento de parametros) |
| Longitud de contexto | no aplica (modelo de difusion, no autorregresivo); resoluciones verificadas de 1024x1024 y 2048x2048 |
| Tipos de cuantizacion | FP8 W8A8 E4M3 en 224 proyecciones; escalas de peso por canal de salida y factores de suavizado en FP32; acumulacion GEMM en FP32 (use_fast_accum=False) con salida BF16; componentes sensibles y VAE/codificador en BF16 |
| Idiomas soportados | no disponible (el conjunto de calibracion incluye casos con "multiple languages" para tipografia, sin enumerarlos) |
| Licencia | other / qwen-research (Qwen Research License); uso de investigacion y evaluacion |
| Formato de pesos | Formato de runtime propio de Diffusers/PyTorch, no un checkpoint generico de Transformers, ComfyUI, vLLM ni TensorRT; el repositorio completo ocupa 7,3 GB y el checkpoint del transformer 7,261 GB (incluye escalas y tensores sin cuantizar) |
| Modelo base | Qwen/Qwen-Image-2.1, revision fijada b3179ad355be050328e483a9dfdd9e60cd62adfa |
| Pipeline | text-to-image (con soporte de edicion mediante el flag --image) |
| Entorno verificado | GPU SM120 (RTX PRO 6000 Blackwell 96 GB), Linux, Python 3.12, PyTorch 2.14.0/CUDA 13.0, Transformers 5.17.0, Diffusers en el commit 80c7ed262aeffbeb43ef13ae04baeb9b84515a69 |

## Arquitectura y entrenamiento

La arquitectura es la del transformer de imagen de Qwen-Image-2.1, mantenida integra en su estructura, con la particularidad de que las 224 proyecciones de mayor tamano en los bloques de atencion y MLP se ejecutan en FP8. La cuantizacion es de tipo W8A8 E4M3: pesos en FP8 con escalas por canal de salida, y activaciones cuantizadas dinamicamente por token mediante un kernel Triton fusionado que aplica suavizado de activaciones y cuantizacion por fila. Las escalas y los factores de suavizado se almacenan en FP32, la acumulacion del GEMM se hace en FP32 y la salida es BF16. El autor documenta que `torch._scaled_mm` despacha al GEMM nativo CUTLASS SM120 FP8 Tensor Core y que una traza real de un paso de denoising registra 224 llamadas FP8 GEMM. La atencion, el VAE, el codificador de texto y los componentes marcados como sensibles permanecen en BF16.

La calibracion se realizo con 64 trayectorias BF16 deterministicas (56 casos de generacion y 8 de edicion, 40 pasos de denoising cada una) que cubren fotografias, retratos, texturas finas, ilustracion, tipografia, varios idiomas, transparencia, composiciones y relaciones de aspecto, a 1024 y 2048 de resolucion. Cada proyeccion cuantizada muestrea 4 filas de tokens en los pasos 0, 3, 9, 19, 29 y 39, lo que da 1536 filas de activacion por capa; el suavizado consciente de activaciones y el recorte de pesos por capa se eligen con 384 filas y se validan con otras 384 filas disjuntas. Se evaluan cinco ajustes de suavizado y tres factores de recorte con GEMM FP8 reales, y las capas que superan un 5 % de NRMSE diagnostico en la salida se dejan en BF16 (el autor indica 0 valores atipicos retenidos). No hay RLHF, DPO ni destilacion: es calibracion post-training pura.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline text-to-image) con el cargador incluido en el repositorio.
- Edicion de imagenes: el script `generate.py` acepta `--image input.png`; el conjunto de calibracion incluye 8 casos de edicion.
- Renderizado de tipografia y de texto en imagen en varios idiomas, segun la composicion del conjunto de calibracion (sin listado de idiomas publicado).
- Generacion a 1024x1024 y 2048x2048 con 40 pasos de denoising, relacion de aspecto configurable mediante `--width` y `--height`.
- Cobertura de dominios declarada en calibracion: fotografia, retratos, texturas finas, ilustracion, transparencia y composiciones diversas.
- Reproducibilidad de la evaluacion: manifiestos de prompts y semillas, resultados de busqueda de calibracion y metricas por imagen publicados en el repositorio.
- No se documentan soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision como entrada mas alla de la imagen a editar, ni generacion de texto o audio.

## Casos de uso

- Generacion de imagenes por lotes con latencia medida: con CFG 1 y cache KV de prefijo, el autor mide 7,01 s por imagen de 1024x1024 en una RTX PRO 6000 Blackwell, lo que permite dimensionar un servicio de generacion con una cifra real en lugar de una estimacion.
- Edicion de imagenes existentes: pasando `--image` al cargador se reutiliza el mismo transformer cuantizado para tareas de edicion, con el VAE y el codificador en BF16 para no degradar la reconstruccion.
- Produccion de assets graficos de gran formato: la resolucion de 2048x2048 se cubre con 44,17 s por imagen, adecuada para material de impresion o fondos de alta resolucion generados fuera de linea.
- Carteles y piezas con tipografia multilingue: la calibracion incluye tipografia y varios idiomas, de modo que el modelo es apropiado para piezas donde el texto renderizado importa, siempre verificando el resultado por el riesgo de errores tipograficos.
- Investigacion en cuantizacion FP8: el repositorio publica el manifiesto de calibracion, el resultado de la busqueda de hiperparametros, la evidencia del kernel y los JSON de benchmark, lo que permite reproducir la comparativa BF16 frente a FP8 y auditar el metodo.
- Reduccion del espacio de pesos del transformer en inferencia: al almacenarse en FP8 (un byte por peso frente a dos en BF16), el checkpoint de 7,261 GB implica aproximadamente la mitad de espacio de pesos que una version BF16 equivalente; el autor no publica la cifra BF16 exacta.
- Demostraciones en tiempo casi real: el repositorio incluye un video de 30 segundos a 1024x1024 y 40 pasos con marcas de tiempo de captura, util para validar la experiencia de usuario antes de invertir en infraestructura.
- Evaluacion controlada de calidad de cuantizacion: las comparativas pareadas con semillas coincidentes permiten medir el impacto perceptual (LPIPS, SSIM) de adoptar FP8 antes de desplegarlo.

## Benchmarks y rendimiento

No hay resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K y similares) porque no es un modelo de lenguaje. El autor publica metricas de fidelidad frente a la referencia BF16 y latencias medidas.

| Metrica de fidelidad frente a BF16 | Valor | Detalle |
|---|---|---|
| LPIPS (AlexNet) medio a 512 px | 0,0345 | Menor es mejor |
| SSIM medio a 512 px | 0,9713 | Mayor es mejor |
| Similitud coseno del latente final a resolucion completa | 0,995627 | Media sobre el conjunto evaluado |

Protocolo de evaluacion: 16 prompts de generacion y 2 de edicion separados, semillas coincidentes, 40 pasos, misma configuracion de cache KV de prefijo y mismo codificador y VAE en BF16. El autor advierte que estas metricas miden acuerdo con la referencia BF16, no preferencia humana, y que el resultado puede variar con otro kernel, precision, version de dependencias o ajuste de cache KV.

| Resolucion | BF16 (media) | FP8 (media) | Aceleracion |
|---|---:|---:|---:|
| 1024x1024 | 9,79 s | 7,01 s | 1,40x |
| 2048x2048 | 55,17 s | 44,17 s | 1,25x |

Condiciones: RTX PRO 6000 Blackwell 96 GB, batch 1, 40 pasos, CFG 1, residencia completa en GPU y cache KV de prefijo activada. El tiempo de pared sincronizado con CUDA incluye codificacion del prompt, denoising y decodificacion del VAE, y excluye la carga del modelo y la escritura del PNG. Se descarta un calentamiento por resolucion; 1024 tiene 5 repeticiones medidas y 2048 tiene 3. No se emplean adaptadores de pasos reducidos ni saltos de timestep.

## Requisitos de hardware

- GPU verificada: NVIDIA RTX PRO 6000 Blackwell de 96 GB, arquitectura SM120. El autor solo ha verificado esta arquitectura y declara el resto como no verificado.
- Pesos del transformer cuantizado: 7,261 GB (incluye escalas y tensores sin cuantizar). A esa cifra hay que sumar el codificador de texto en BF16, el VAE en BF16, el resto del pipeline y las activaciones; el total de VRAM no esta publicado.
- No hay datos publicados sobre ejecucion en GPU de consumo. La unica arquitectura verificada es SM120 de gama profesional; el propio autor indica que otras arquitecturas no estan verificadas.
- Sistema: Linux con Python 3.12, PyTorch 2.14.0 compilado para CUDA 13.0 y un driver CUDA 13 compatible.
- Despliegue: unicamente el cargador incluido en el repositorio (`generate.py`). No es compatible con vLLM, ComfyUI, TensorRT ni checkpoints genericos de Transformers; llama.cpp y Ollama no aplican a este formato.
- Rendimiento medido en la configuracion de referencia: 7,01 s por imagen a 1024x1024 y 44,17 s por imagen a 2048x2048 con batch 1, lo que equivale aproximadamente a 0,14 imagenes/s y 0,023 imagenes/s respectivamente (valores derivados de la latencia media publicada).
- Advertencia de ejecucion: no se debe convertir el transformer cargado a BF16 o FP16, ya que alteraria los pesos FP8 y las escalas FP32. El codigo fija componentes del pipeline upstream mediante la revision b3179ad355be050328e483a9dfdd9e60cd62adfa, y se puede apuntar a una copia local con `--base /path/to/snapshot`.

## Comparativa con modelos similares

En la informacion disponible no se documentan otras publicaciones de cuantizacion comparables (mismo modelo, misma tecnica y metricas publicadas), por lo que la unica comparacion con datos es la del propio checkpoint frente a su referencia BF16.

| Version | Precision del transformer | Formato | Latencia 1024x1024 | Latencia 2048x2048 | Fidelidad |
|---|---|---|---:|---:|---|
| Image-2.1-Calibrated-FP8 | FP8 W8A8 E4M3 en 224 proyecciones | Runtime propio Diffusers/PyTorch | 7,01 s | 44,17 s | Referencia medida: LPIPS 0,0345, SSIM 0,9713, coseno 0,995627 frente a BF16 |
| Qwen/Qwen-Image-2.1 (BF16) | BF16 | Pipeline upstream de Diffusers | 9,79 s | 55,17 s | Referencia de comparacion (definida como objetivo) |

Otros aspectos comparables: licencia (este repositorio, Qwen Research; la del modelo base no se detalla en la informacion proporcionada), disponibilidad (repositorio publico con 0 descargas y 1 like) y soporte de herramientas de despliegue (este checkpoint queda restringido a su cargador propio, mientras que la version upstream se carga con el pipeline estandar de Diffusers). No hay datos de terceros para comparar con otras cuantizaciones FP8 del mismo modelo base.

## Limitaciones y advertencias

- Licencia restrictiva: se distribuye como "other" con licencia Qwen Research y uso declarado de investigacion y evaluacion; hay que revisar el archivo LICENSE incluido antes de cualquier uso comercial.
- Compatibilidad muy limitada: solo verificado en SM120 (RTX PRO 6000 Blackwell). Otras arquitecturas quedan sin verificar y los kernels FP8 empleados son especificos de esa arquitectura.
- Formato no estandar: no es un checkpoint intercambiable con Transformers, ComfyUI, vLLM ni TensorRT; requiere el cargador incluido y las versiones exactas de dependencias.
- Prohibicion de conversion de precision: convertir el transformer cargado a BF16 o FP16 cambia los pesos FP8 y las escalas FP32; el autor lo desaconseja explicitamente.
- Metricas de alcance limitado: LPIPS, SSIM y similitud coseno miden acuerdo con la referencia BF16 sobre 16 prompts de generacion y 2 de edicion, no preferencia humana general ni garantia por prompt.
- Reproducibilidad condicionada: el renderizado puede cambiar con otro kernel, precision, version de dependencias o configuracion de cache KV.
- Idiomas: la lista de idiomas soportados no esta publicada; solo consta que la calibracion incluye casos en varios idiomas dentro de la tipografia.
- Validacion comunitaria nula: 0 descargas y 1 like en el momento de la consulta, y la model card consultada aparece truncada en la seccion de video, por lo que puede faltar informacion.
- Capacidades fuera de alcance: no hay tool calling, agentes, razonamiento multi-paso ni generacion de texto, audio o video.
- Sesgos y alucinacion visual: no se documentan en el repositorio; son los inherentes al modelo base y deben evaluarse por caso de uso.
- Dependencia de revisiones fijadas del modelo base y de Diffusers: cualquier cambio en esos commits puede alterar el comportamiento, aunque el autor permite apuntar a una copia local con `--base`.
- La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente enlaces de un sitio de noticias deportivas), por lo que no se ha podido contrastar la informacion con fuentes independientes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ProCreations/Image-2.1-Calibrated-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Revision fijada del modelo base: b3179ad355be050328e483a9dfdd9e60cd62adfa
- Licencia incluida en el repositorio: LICENSE (ruta relativa dentro del repositorio)
- Evidencia del kernel: reports/kernel_evidence.json
- Traza del profiler de denoising: reports/denoising-trace.json
- Manifiesto de calibracion: reports/calibration_manifest.json
- Resultados de la busqueda de calibracion: reports/calibration_search.json
- Metricas de calidad por imagen: reports/quality_metrics.json
- Mediciones BF16 en bruto: reports/bf16-benchmark.json
- Mediciones FP8 en bruto: reports/fp8-benchmark.json
- Comparativas pareadas: comparisons/ (directorio del repositorio)
- Demostracion en video de 30 segundos: demo/realtime-30s.mp4
- Marcas de tiempo de captura: demo/capture_receipt.json
- Commit de Diffusers empleado: 80c7ed262aeffbeb43ef13ae04baeb9b84515a69
- Indice de PyTorch con CUDA 13: https://download.pytorch.org/whl/cu130
- Resultados de busqueda web: sin enlaces relevantes para este modelo.
