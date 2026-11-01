# asahi-jp/LFM3-1.7B-int8-ov

## Resumen

LFM3-1.7B-int8-ov es una version cuantizada a INT8 en formato OpenVINO IR del modelo LiquidAI/LFM3-1.7B, publicada por el usuario asahi-jp. No se trata de un modelo nuevo, sino de un artefacto de despliegue: el modelo base LFM3-1.7B, desarrollado por Liquid AI, ha sido convertido y cuantizado mediante Optimum-Intel y NNCF para su ejecucion eficiente sobre el runtime de inferencia OpenVINO de Intel. El repositorio ocupa 1,8 GB y esta pensado para despliegues en hardware Intel (CPU, iGPU, NPU y GPU Arc) sin necesidad de GPUs dedicadas de gran tamano.

El modelo base pertenece a la familia LFM3 de Liquid AI, con 1.700 millones de parametros y una arquitectura hibrida que combina capas de atencion (con atencion deslizante y atencion completa) con convoluciones cortas con compuerta (gated short-convolution). Esta mezcla reduce el coste de memoria de la cache KV frente a un transformer clasico y permite mantener contexto largo con una huella reducida. La cuantizacion INT8 conserva 167 de las 169 capas de pesos en precision de 8 bits, dejando dos capas en coma flotante.

La relevancia de esta ficha radica en que demuestra una ruta practica de despliegue de un modelo pequeno de la familia LFM3 en entornos Intel con perdida de precision minima: el autor reporta una similitud coseno de 0,9982 en los logits frente a la version FP16 y un 100% de coincidencia en top-1 y top-5. Es, por tanto, un artefacto util para quien quiera ejecutar LFM3-1.7B en produccion sobre infraestructura Intel con requisitos de memoria ajustados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: atencion (sliding y full) + gated short-convolution; transformer hibrido con cache mixta |
| Parametros totales | 1.700 millones (modelo base LFM3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT8 weight-only, asimetrica, per-channel (INT8_ASYM, group_size=-1); el autor compara tambien INT4 group 64, INT4 channelwise y NF4 channelwise |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | OpenVINO IR (`openvino_model.xml` / `openvino_model.bin`), tokenizer OpenVINO IR y tokenizer Hugging Face |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura hibrida en la que conviven capas de atencion y capas de convolucion corta con compuerta. Segun la model card del artefacto, la cache del modelo esta compuesta por 13 estados de convolucion corta con compuerta y 22 caches clave/valor, repartidas entre 5 capas de atencion deslizante y 6 capas de atencion completa. Esta estructura permite soportar tanto prefill como decodificacion incremental, y reduce el crecimiento de la cache KV en generaciones largas en comparacion con un transformer denso convencional.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion, ya que la model card del artefacto cuantizado no las detalla y no se ha proporcionado la del modelo base. La innovacion tecnica documentada en este repositorio es la propia cuantizacion: conversion a OpenVINO IR con Optimum-Intel y NNCF, con cuantizacion weight-only INT8 asimetrica por canal sobre 167 de las 169 capas de pesos, preservando dos capas en coma flotante. El autor valida la fidelidad comparando logits y generacion greedy contra el IR en FP16.

## Capacidades

- Generacion de texto y conversacion multi-turno, con soporte de plantilla de chat (`chat_template.jinja`) y modo de razonamiento opcional (`enable_thinking=False` en el ejemplo de uso).
- Inferencia en dos fases (prefill e incremental decoding) sobre OpenVINO, adecuada para generacion autoregresiva.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio): no disponible; el pipeline declarado es exclusivamente `text-generation`.
- Ejecucion sobre hardware Intel mediante OpenVINO (CPU, iGPU, NPU, GPU Arc), con tokenizer tambien convertido a IR.

## Casos de uso

- Despliegue en CPU Intel sin GPU dedicada: gracias a la cuantizacion INT8 y al runtime OpenVINO, el modelo puede servirse en servidores con CPU Xeon o en equipos de escritorio, reduciendo el coste de infraestructura frente a alternativas en FP16.
- Inferencia en el borde (edge) sobre iGPU o NPU Intel: el tamano de 1,8 GB del repositorio y la cuantizacion INT8 permiten ejecutar el modelo en mini-PC, portatiles y dispositivos con aceleradores Intel integrados.
- Asistentes conversacionales locales: la plantilla de chat y el modo de pensamiento configurable permiten construir chatbots de proposito general que se ejecutan en local sin enviar datos a la nube.
- Prototipado rapido de aplicaciones de texto: la integracion con `optimum.intel.openvino` y `transformers` permite cargar el modelo con pocas lineas y validar ideas antes de escalar a modelos mayores.
- Generacion de texto en pipelines por lotes: el soporte de prefill e incremental decoding y la cache hibrida facilitan el procesamiento de lotes de documentos con generacion controlada.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye datos de deriva (INT8, INT4 group 64, INT4 channelwise, NF4) utiles para decidir el nivel de cuantizacion segun el requisito de fidelidad en una aplicacion concreta.
- Educacion e investigacion: sirve como ejemplo reproducible de conversion de un modelo hibrido a OpenVINO IR con NNCF y de validacion de fidelidad mediante logits y generacion greedy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas de fidelidad de la cuantizacion frente al IR en FP16:

| Variante | Similitud coseno de logits vs FP16 | Coincidencia top-1 | Solapamiento top-5 |
|---|---|---|---|
| INT8 | 0,9982 | 100% | 100% |
| INT4 group 64 | 0,9622 | 100% | 80% |
| INT4 channelwise | 0,9171 | 100% | 60% |
| NF4 channelwise | 0,8620 | 0% | 80% |

Las cuatro variantes responden correctamente a una pregunta factual corta ("The capital of France is Paris."). El autor recomienda INT8 o INT4 group 64 cuando la precision es critica, y senala NF4 channelwise como la variante con mayor deriva.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 1,8 GB; en INT8 la huella de pesos es de aproximadamente 1,73 GB, a la que hay que sumar la cache hibrida (13 estados de convolucion y 22 caches KV) y el overhead del runtime.
- GPU recomendadas: no se especifican en la informacion proporcionada; el formato OpenVINO esta orientado a hardware Intel (CPU Xeon/Core, iGPU, NPU y GPU Arc). Para GPU NVIDIA no es el formato nativo.
- Cabe en GPU de consumo: si, en terminos de memoria, cualquier GPU con 4 GB o mas podria alojar los pesos, aunque la ruta soportada es OpenVINO sobre hardware Intel; el autor no documenta pruebas en GPU NVIDIA.
- Opciones de despliegue: OpenVINO Runtime mediante `optimum.intel.openvino` (`OVModelForCausalLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Versiones probadas: transformers 5.15.0, optimum-intel 2.3.0.dev0+a68683c (con soporte LFM3), OpenVINO 2026.4.1 y NNCF 3.3.0. Requiere `trust_remote_code=True` y una build reciente de Optimum-Intel con soporte para LFM3.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asahi-jp/LFM3-1.7B-int8-ov (este) | 1,7 B | no disponible | OpenVINO IR INT8 | LFM Open License v1.0 | Hugging Face, 16 descargas |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | no disponible | safetensors (FP16/BF16 presumiblemente) | LFM Open License v1.0 | Hugging Face, modelo oficial de Liquid AI |
| Variantes INT4/NF4 del mismo autor | 1,7 B | no disponible | INT4 group 64, INT4 channelwise, NF4 channelwise | LFM Open License v1.0 | Referenciadas en la model card, sin repositorio independiente confirmado |

No se dispone de datos de rendimiento de benchmarks para establecer una comparacion cuantitativa con modelos de la misma categoria; la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Es un artefacto de cuantizacion, no un modelo nuevo: hereda las limitaciones del modelo base LFM3-1.7B, que no se detallan en la informacion proporcionada.
- La cuantizacion INT8 introduce una deriva pequena pero no nula (coseno 0,9982, top-5 100%); en tareas de alta sensibilidad conviene validar contra el modelo en FP16.
- El autor advierte que NF4 channelwise muestra la mayor deriva (top-1 0%) y desaconseja su uso cuando la precision importa.
- Requiere una build reciente de Optimum-Intel con soporte LFM3 y `trust_remote_code=True`; versiones antiguas pueden fallar al cargar el modelo.
- El formato OpenVINO esta optimizado para hardware Intel; no es la ruta recomendada para GPU NVIDIA ni para ecosistemas como vLLM o llama.cpp.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni limitaciones de contexto del modelo base en la documentacion proporcionada.
- La licencia LFM Open License v1.0 es una licencia "other" con terminos propios; es imprescindible revisar el texto completo antes de un uso comercial, ya que puede incluir restricciones adicionales a las de una licencia open source estandar.
- El repositorio tiene un uso muy bajo (16 descargas, 0 likes) y fue creado en octubre de 2026; no cuenta con validacion comunitaria extensa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/asahi-jp/LFM3-1.7B-int8-ov
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Optimum-Intel: https://github.com/huggingface/optimum-intel
