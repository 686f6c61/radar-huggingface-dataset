# Harsha001/Sage-A1.5-ROCmFPX

## Resumen

Sage-A1.5-ROCmFPX es una familia de cuantizaciones GGUF del modelo Sage-A1.5, un modelo de mezcla de expertos (MoE) de 35.505.251.456 parametros desarrollado por Shanghai AI Laboratory (InternScience) y orientado a tareas agenticas. Esta publicacion, a cargo del usuario Harsha001, no es una version oficial del modelo base, sino una conversion a los formatos de baja precision propios de ROCmFPX, un fork de llama.cpp que incorpora tipos de pesos de 2, 4, 6 y 8 bits optimizados para GPUs AMD mediante Vulkan y HIP/ROCm. El objetivo declarado es que el modelo quepa y se ejecute en una maquina con AMD Strix Halo (objetivo `gfx1151`) y 128 GB de memoria unificada.

La relevancia de esta ficha es doble. Por un lado, documenta el modelo base Sage-A1.5 (35B totales, MoE, agentico) y sus capacidades. Por otro, describe un caso poco habitual en el ecosistema: cuantizacion de baja precision con matrices de importancia (imatrix) para hardware AMD consumer, con mediciones de perplejidad y divergencia KL frente al BF16 de referencia. El autor advierte explicitamente de que los ficheros no se han probado todavia en hardware AMD real y de que solo cargan en una build de ROCmFPX de llama.cpp; llama.cpp estandar, LM Studio y Ollama no reconocen estos tipos.

El repositorio ocupa 116,5 GB e incluye seis ficheros GGUF: cuatro cuantizaciones de texto (Q8, Q6, dos variantes Q4 y una Q2), mas un proyector de vision en F16. La licencia es Apache-2.0, heredada del modelo base. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks del modelo original es limitada en la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun etiquetas del repositorio; detalles internos no disponibles |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0_ROCMFPX (8 bits), Q6_0_ROCMFPX (6 bits, empaquetado como Q6_K), Q4_0_ROCMFP4_STRIX (4 bits, receta para gfx1151), Q4_0_ROCMFP4_FAST (4 bits, una escala por bloque), Q2_0_ROCMFPX (2 bits), mmproj F16 para vision |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tipos propietarios de ROCmFPX; requieren fork de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Sage-A1.5 es, segun las etiquetas y la model card, un modelo de mezcla de expertos de 35,5B parametros orientado a uso agentico, desarrollado por Shanghai AI Laboratory. La informacion publicada en esta ficha no detalla el numero de expertos, los parametros activos por token, la longitud de contexto nativa, la composicion del dataset de entrenamiento ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones de atencion o decodificacion especulativa.

Lo que si esta documentado con rigor es el proceso de cuantizacion. El autor convirtio el modelo a GGUF en BF16 con `convert_hf_to_gguf.py` y genero el proyector de vision con `--mmproj --outtype f16`. A continuacion calculo una matriz de importancia (imatrix) sobre el modelo BF16 en GPU, usando el corpus de calibracion `calibration_datav3` en fragmentos de 512 tokens. Posteriormente ejecuto `llama-quantize --imatrix` una vez por tipo, con la build ROCmFPX `fb08d7c` fusionada sobre llama.cpp upstream. La validacion de calidad se hizo expandiendo cada cuantizacion de vuelta a F16 (`--allow-requantize`) y midiendo con kernels F16 estandar en una GPU NVIDIA, porque los kernels CUDA del fork para estos tipos no son correctos en NVIDIA. El autor verifico el metodo comparando un Q8_0_ROCMFPX de un modelo de 9B: KLD 0,0050 en GPU frente a 0,0054 en backend CPU.

## Capacidades

- Generacion de texto conversacional y razonamiento de proposito general, heredadas del modelo base.
- Orientacion agentica: el modelo esta etiquetado como `agentic` y `conversational`, lo que sugiere soporte para flujos multi-paso, aunque la model card no detalla tool calling ni function calling de forma explicita.
- Capacidad multimodal: el repositorio incluye un proyector de vision `mmproj-Sage-A1.5-F16.gguf` (0,9 GB), lo que indica soporte de entrada de imagenes en el modelo base. El autor senala que el proyector esta convertido pero no probado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento extendido (thinking): no disponible en la informacion proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere despliegue mediante servidores compatibles con la API de inferencia, aunque no se especifica cual.

## Casos de uso

- Despliegue local en AMD Strix Halo: el caso de uso central de esta publicacion. Con el fichero Q4_0_ROCMFP4_STRIX (19,1 GB) el modelo cabe en los 128 GB de memoria unificada de una maquina Strix Halo y se sirve con `llama-server -ngl 999 -fa on --jinja`, lo que permite ejecutar un MoE de 35B en hardware integrado AMD sin GPU discreta.
- Prototipado de agentes en estacion de trabajo: la orientacion agentica del modelo base y el formato GGUF lo hacen adecuado para experimentar con pipelines de agentes multi-paso en local, con la ventaja de no depender de APIs externas ni de cuotas de nube.
- Evaluacion de cuantizaciones de baja precision: los ficheros Q4 y Q2, con metricas de PPL, KLD y coincidencia de top-1 frente a BF16, sirven como material de estudio para investigadores que quieran medir el impacto real de la cuantizacion en un MoE de 35B.
- Servicio de chat con contexto conversacional: el modelo esta etiquetado como conversacional y puede usarse con `llama-server` para levantar un endpoint de chat compatible con clientes HTTP, util para demos internas y pruebas de integracion.
- Tareas con entrada de imagen: usando el proyector `mmproj` en F16 junto con una de las cuantizaciones de texto, se pueden probar flujos de descripcion de imagenes o preguntas sobre capturas, siempre que se valide previamente el proyector, que no ha sido probado.
- Investigacion sobre formatos ROCmFPX: el repositorio documenta un pipeline reproducible (conversion, imatrix, cuantizacion, validacion) que puede replicarse para otros modelos y servir de referencia para quien quiera adoptar estos tipos de pesos en su propio hardware AMD.

## Benchmarks y rendimiento

Las unicas metricas publicadas son las de calidad de cuantizacion frente al BF16 de referencia (72 GB, perplejidad 6,2751) sobre WikiText-2 test, 40 fragmentos de 512 tokens. KLD es la divergencia KL media de la distribucion del siguiente token respecto a BF16 (menor es mejor); "same top" es la frecuencia con la que la cuantizacion elige el mismo siguiente token que BF16.

| Fichero | Tamano | PPL | KLD | Same top |
|---|---:|---:|---:|---:|
| Q8_0_ROCMFPX | 36,7 GB | 6,2945 | 0,0107 | 95,62% |
| Q6_0_ROCMFPX (empaquetado como Q6_K) | 29,4 GB | 6,2826 | 0,0115 | 95,05% |
| Q4_0_ROCMFP4_STRIX (recomendado) | 19,1 GB | 6,4536 | 0,0537 | 88,81% |
| Q4_0_ROCMFP4_FAST | 19,0 GB | 6,4873 | 0,0543 | 89,19% |
| Q2_0_ROCMFPX | 11,4 GB | 10,4152 | 0,5274 | 70,22% |
| mmproj F16 (vision) | 0,9 GB | no disponible | no disponible | no disponible |

El autor menciona ademas una variante no publicada, Q3_0_ROCMFPX (19,8 GB, PPL 6,6816, KLD 0,0741, same top 87,80%), descartada por ser mayor que el Q4 recomendado y estar mas lejos del BF16. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni del modelo base ni de las cuantizaciones.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 36,7 GB para Q8, 29,4 GB para Q6, 19,1 GB para Q4_STRIX, 19,0 GB para Q4_FAST y 11,4 GB para Q2, mas 0,9 GB adicionales si se usa el proyector de vision.
- Hardware objetivo: AMD Strix Halo con 128 GB de memoria unificada, con destino de compilacion `gfx1151`. El autor menciona tambien `gfx1100` (RX 7900) como alternativa en las instrucciones de compilacion.
- GPUs NVIDIA: no recomendadas para ejecutar estos ficheros, porque los kernels CUDA del fork para los tipos ROCmFPX no son correctos en NVIDIA. El autor solo las uso para validar calidad expandiendo a F16.
- Cabe en GPU consumer: si, en el caso de Strix Halo con memoria unificada; para GPUs discretas de consumo no hay datos publicados de compatibilidad ni de rendimiento.
- Opciones de despliegue: exclusivamente una build de ROCmFPX de llama.cpp, compilada con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151`, y servida con `llama-server`. llama.cpp estandar, LM Studio y Ollama no reconocen estos tipos.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad y advierte de que los ficheros no se han probado aun en hardware AMD.

## Comparativa con modelos similares

No hay datos suficientes en la informacion proporcionada para comparar rendimiento con alternativas. Se ofrece una comparacion estructural limitada:

| Modelo | Parametros | Contexto | Licencia | Formato de despliegue |
|---|---|---|---|---|
| Sage-A1.5 (base) | 35,5B, MoE | no disponible | Apache-2.0 | safetensors / BF16 |
| Sage-A1.5-ROCmFPX (esta ficha) | 35,5B, MoE | no disponible | Apache-2.0 | GGUF con tipos ROCmFPX |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de benchmarks de tareas del modelo base ni de sus cuantizaciones, por lo que no es posible establecer una comparacion de rendimiento con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Los ficheros no han sido probados en hardware AMD. El propio autor lo advierte de forma explicita; el rendimiento y la correccion numerica en GPU AMD estan pendientes de validacion.
- Solo cargan en una build de ROCmFPX de llama.cpp. llama.cpp estandar, LM Studio y Ollama no reconocen estos tipos de pesos, lo que limita la portabilidad y complica el despliegue en produccion.
- El fichero Q8 no es tan fiel al BF16 como un Q8_0 estandar, porque las escalas de bloque de ROCmFPX tienen un paso minimo fijo y los bloques de pesos pequenos conservan menos de 8 bits efectivos (referencia a ROCmFPX#118).
- El Q2_0_ROCMFPX presenta una perdida de calidad clara: PPL 10,4152 frente a 6,2751 del BF16 y coincidencia de top-1 del 70,22%. No es recomendable para uso serio.
- El proyector de vision esta convertido pero no probado, por lo que las capacidades multimodales no estan verificadas en esta publicacion.
- No hay informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o cobertura idiomatica del modelo base en la documentacion disponible.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no es el propietario del modelo y no ofrece garantias; conviene revisar la licencia y las condiciones del modelo base en su repositorio original.
- El repositorio ocupa 116,5 GB, lo que exige espacio de almacenamiento considerable aunque solo se descargue una de las cuantizaciones.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/Harsha001/Sage-A1.5-ROCmFPX
- Modelo base en Hugging Face: https://huggingface.co/InternScience/Sage-A1.5
- Repositorio ROCmFPX (fork de llama.cpp): https://github.com/charlie12345/ROCmFPX
- Fork usado para la cuantizacion: https://github.com/HarshaVardhan3002/ROCmFPX
- Issue sobre precision del Q8 en ROCmFPX: https://github.com/charlie12345/ROCmFPX/issues/118
- Cuantizacion destacada del mismo autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
