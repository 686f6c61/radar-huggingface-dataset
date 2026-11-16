# fastforks/megaloc

## Resumen

MegaLoc es un modelo de extraccion de caracteristicas de imagen orientado a recuperacion visual (image retrieval) y reconocimiento visual de lugares (visual place recognition, VPR). Lo desarrollan Gabriele Berton y Carlo Masone y se presento en los talleres de CVPR 2025 (arXiv 2502.17237). El modelo parte de un DINOv2 ViT-B/14 afinado sobre una mezcla de conjuntos de datos de reconocimiento de lugares, landmarks y estructura-para-movimiento (SfM), y produce un descriptor global de 8448 dimensiones con norma L2 unitaria que permite comparar imagenes por similitud coseno.

El repositorio `fastforks/megaloc` no contiene pesos: es una model card que documenta como el framework fastforks descarga los pesos originales del autor (`gberton/MegaLoc`), verifica su SHA-256 y expone dos backends de inferencia (`portable` y `kernels`). La licencia de los pesos es MIT y el uso comercial esta permitido, aunque parte de los datos de entrenamiento originales (MSLS, ScanNet) arrastran terminos no comerciales.

Es relevante porque ofrece un descriptor global compacto y de una sola pasada para tareas de recuperacion a gran escala, con mediciones de latencia y memoria en GPU consumer (RTX 5060 Ti 16 GB) y paridad numerica verificada frente al codigo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-B/14 con agregacion tipo SALAD (64 clusters por transporte optimo) y proyeccion a descriptor global |
| Parametros totales | no disponible (base DINOv2 ViT-B/14) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de cualquier H x W >= 32, rellenada a multiplo de 32) |
| Tipos de cuantizacion | fp32, fp16 (probados); no se documentan otras |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (pesos y codigo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MegaLoc es un transformer de vision (ViT-B/14) inicializado desde DINOv2 preentrenado en LVD-142M y afinado posteriormente sobre GSV-Cities, Mapillary Street-Level Sequences (MSLS), MegaScenes, ScanNet y San Francisco eXtra Large (SF-XL). Las caracteristicas por parche se asignan a 64 clusters mediante transporte optimo, siguiendo el esquema de agregacion de SALAD, y el resultado se proyecta a un descriptor global de 8448 dimensiones normalizado a norma L2 unitaria.

El modelo esta pensado para una unica pasada por imagen (sin matching local denso): la salida es un vector `[D]` que se compara por similitud coseno. El paquete fastforks anade utilidades de recuperacion en GPU (`fastforks.retrieval.top_k` y `pairs`) y ofrece dos backends, `portable` y `kernels`, con kernels especificos publicados en `fastforks/kernels`. Se verifico paridad numerica frente al codigo original: en CPU float32 la diferencia maxima es <= 8.8e-08; en GPU float16 la diferencia media es <= 2.1 % y el p99 <= 6.6 % respecto a la mediana del valor de referencia.

## Capacidades

- Extraccion de un descriptor global de imagen (vector unitario de 8448 dimensiones) para recuperacion por similitud coseno.
- Reconocimiento visual de lugares (VPR) a partir de una sola imagen de consulta.
- Recuperacion de landmarks y edificios.
- Seleccion de pares de imagenes para pipelines de structure-from-motion.
- Busqueda de imagenes mas cercanas en GPU mediante `top_k` y `pairs`.
- Procesamiento de imagenes de resolucion arbitraria (H x W >= 32, relleno a multiplo de 32); probado hasta 3000x4000 en fp16 con 0.9 GiB de pico en RTX 5060 Ti 16 GB.
- Backends `portable` y `kernels`, con soporte de `torch.compile` y TensorRT fp16.
- No soporta tool calling, agentes, generacion de texto ni capacidades multimodales mas alla de la imagen.

## Casos de uso

- Localizacion visual en robotica y vehiculos: dado un frame de camara, recuperar las imagenes de base de datos mas cercanas por descriptor y estimar la posicion mediante las coordenadas UTM asociadas; el protocolo de recall a 25 m es el estandar en VPR.
- Reconstruccion 3D y SfM: usar `pairs` para proponer pares de imagenes candidatas con solapamiento antes del matching local, reduciendo el coste cuadratico de comparar todos los pares.
- Organizacion y deduplicacion de fototecas: indexar descriptores de una coleccion y agrupar imagenes del mismo lugar o escena mediante similitud coseno.
- Recuperacion en archivos de patrimonio y turismo: buscar imagenes de un monumento o landmark concreto en un catalogo a partir de una foto de consulta.
- Navegacion aumentada y AR: identificar el entorno a partir de una captura y anclar contenido digital a lugares reconocidos.
- Control de calidad en datasets geoespaciales: detectar imagenes duplicadas o mal etiquetadas comparando el descriptor con la base de referencia.
- Preprocesado para pipelines de vision: generar descriptores globales que alimenten un re-ranker o un indice vectorial antes de un matching mas costoso.

## Benchmarks y rendimiento

Resultados de recuperacion publicados en la model card (protocolo VPR, recall@1 / @5 con umbral de 25 m, similitud coseno exacta top-k en GPU):

| Dataset | Consultas / base de datos | original fp32 | portable | kernels |
|---|---|---|---|---|
| St Lucia (todas las consultas) | 1464 / 1549 | 100.00 / 100.00 | 100.00 / 100.00 | 100.00 / 100.00 |
| St Lucia (cada 5.a consulta) | 293 / 1549 | 100.00 / 100.00 | 100.00 / 100.00 | 100.00 / 100.00 |

Rendimiento de inferencia (entrada sintetica 480x640, RTX 5060 Ti 16 GB, sm_120):

| Metrica | original | portable | kernels | torch.compile | TensorRT fp16 |
|---|---|---|---|---|---|
| Tiempo (ms) | 9.68 | 5.29 | 4.26 | 4.27 | 3.21 |
| Memoria pico (MiB, alloc / reserved) | 1347 / 1368 | 483 / 508 | 485 / 508 | 518 / 530 | 937 / 964 |

Arranque y primera llamada: carga 2.49 s (original), 0.50 s (portable), 1.36 s (kernels); primera llamada 0.56 s / 0.37 s / 0.22 s respectivamente. La compilacion en frio tarda 13.2 s y la construccion de ONNX + engine TensorRT 51.1 s.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) por tratarse de un modelo de vision; los datos anteriores son los unicos disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: unos 0.5 GiB de pico en fp16 a 480x640 (backend portable o kernels); 0.9 GiB de pico a 3000x4000 en fp16.
- GPU probada: NVIDIA GeForce RTX 5060 Ti 16 GB (sm_120). No se documentan otras GPU en la informacion disponible.
- Cabe en GPU consumer: si, con amplio margen en tarjetas de 8 GB o superiores a 480x640; el consumo real depende de la resolucion de entrada.
- Opciones de despliegue: paquete `fastforks` (backends `portable` y `kernels`), exportacion a ONNX y TensorRT fp16; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision).
- Latencia y throughput: 4.26 ms por imagen a 480x640 con `kernels` (2.3x mas rapido que el codigo original) y 3.21 ms con TensorRT fp16; el throughput agregado no se detalla en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de descriptor | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MegaLoc (fastforks) | base DINOv2 ViT-B/14 | global, 8448-d, L2 unitario | imagen arbitraria >= 32, multiplo de 32 | MIT (pesos) | HF `gberton/MegaLoc`, codigo en GitHub |
| DINOv2 ViT-B/14 | ViT-B/14 | features por parche / CLS | imagen arbitraria | Apache 2.0 (segun el modelo original) | HF / GitHub |
| SALAD (esquema de agregacion) | no disponible | global, basado en clusters | imagen | no disponible | codigo de investigacion |
| Otros descriptores VPR (p. ej. NetVLAD) | no disponible | global | imagen | no disponible | no disponible |

No se dispone de una comparativa numerica de rendimiento frente a estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo de vision: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- El descriptor global de una sola pasada puede fallar ante cambios extremos de iluminacion, estacion o punto de vista; no sustituye al matching local en condiciones adversas.
- Los resultados de 100 % de recall se limitan al dataset St Lucia; no hay evidencia publicada en esta ficha sobre otros datasets.
- Riesgo de falsos positivos en escenas visualmente repetitivas (fachadas similares, interiores genericos).
- La licencia de los pesos es MIT, pero parte de los datos de entrenamiento (MSLS, ScanNet) tienen terminos no comerciales; conviene revisar el uso comercial en funcion del contexto legal aplicable.
- El repositorio `fastforks/megaloc` no aloja pesos: depende de la disponibilidad del repositorio del autor y de la verificacion SHA-256.
- La paridad en GPU float16 tiene un error medio de hasta 2.1 % y p99 de 6.6 % respecto a la referencia, relevante si se necesita precision estricta.
- No se documentan sesgos demograficos ni geograficos especificos, pero la composicion del dataset (GSV-Cities, MSLS, SF-XL) puede infrarrepresentar regiones no cubiertas.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/megaloc
- Pesos del autor: https://huggingface.co/gberton/MegaLoc
- Codigo original: https://github.com/gmberton/MegaLoc (commit `5fe0dd697c4a`)
- Framework fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Benchmarks de fastforks: https://github.com/kleinicke/fastforks/blob/main/docs/benchmarks.md
- Paper: arXiv 2502.17237 (Berton y Masone, CVPR 2025 workshops)
- Licencia del codigo original: https://github.com/gmberton/MegaLoc/blob/5fe0dd697c4a70ba3e23607f6716ab3c606b16db/LICENSE
