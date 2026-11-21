# drofn/SenseNova-Loop-9B-8GB-GGUF

## Resumen

SenseNova-Loop-9B es un modelo de lenguaje decoder-only de aproximadamente 9.000 millones de parametros desarrollado por SenseTime (bajo el identificador `sensenova` en Hugging Face). Su rasgo arquitectonico distintivo es un bloque de capas "looped": almacena 32 capas de decoder pero ejecuta las capas 4 a 27 dos veces por token, lo que resulta en 56 ejecuciones de capa por pase forward. Ademas, emplea un residual stream con hyper-conexiones de doble flujo restringidas a variedades (mHC) y atencion hibrida que combina capas de atencion lineal Gated DeltaNet con capas de atencion completa.

La ficha que nos ocupa, `drofn/SenseNova-Loop-9B-8GB-GGUF`, no es el modelo original sino una familia de cuantizaciones GGUF de precision mixta producidas por el usuario drofn, orientadas especificamente a inferencia de contexto largo en tarjetas NVIDIA de 8 GB de VRAM. El autor asigna el presupuesto de bits por grupo de tensores segun la sensibilidad medida (divergencia KL frente a Q8_0), en lugar de aplicar una cuantizacion uniforme. Se ofrecen tres variantes: 128K (4,97 GB), 100K (5,54 GB) y 32K-HQ (7,02 GB).

El interes actual de esta publicacion radica en que demuestra una tecnica de cuantizacion sensible a la arquitectura que permite ejecutar un modelo de 9B con ventanas de hasta 132.864 tokens en GPUs de consumo de 8 GB, superando en calidad (menor KLD) a un Q4_K_M estandar construido con la misma imatrix. Requiere, eso si, un fork parcheado de llama.cpp, ya que la arquitectura `sensenova_loop` no estaba soportada en el upstream a fecha de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer con bloque de capas looped (32 capas almacenadas, 56 ejecuciones por token), residual mHC de doble flujo, atencion hibrida (Gated DeltaNet lineal + atencion completa) |
| Parametros totales | 8.956.949.376 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 512K en el modelo base (YaRN x2); en estas cuantizaciones: 132.864 tokens (128K), 104.704 tokens (100K), 38.400 tokens (32K-HQ) segun `llama-fit-params` en 8 GB |
| Tipos de cuantizacion | GGUF de precision mixta con presupuesto de bits por grupo de tensores (imatrix); KV cache configurable (f16, q8_0, q4_0) |
| Idiomas soportados | Ingles (en), chino (zh), turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura decoder-only con un bloque de capas recurrente: almacena 32 capas de decoder y ejecuta las capas 4 a 27 dos veces por token, totalizando 56 ejecuciones de capa por pase forward. El residual stream utiliza hyper-conexiones de doble flujo con restriccion de variedad (mHC), con enrutamiento normalizado mediante 20 iteraciones de Sinkhorn. La atencion es hibrida: cada grupo de cuatro capas contiene tres capas de atencion lineal (Gated DeltaNet) y una de atencion completa. La atencion completa usa 16 cabezas de query, 4 cabezas KV y `head_dim` de 256. El vocabulario es de 248.320 tokens y el contexto alcanza 512K mediante YaRN x2.

En cuanto al proceso de cuantizacion de esta ficha, el autor midio la sensibilidad de 14 grupos de tensores (y posteriormente subdividio el bloque looped en tres bandas), cuantizando cada grupo de forma independiente a Q2_K y Q4_K y midiendo la divergencia KL frente a Q8_0. Con esos datos asigno el presupuesto de bits por grupo. El resultado son ficheros que, segun el autor, son mas pequenos que un Q4_K_M estandar con la misma imatrix, caben con unos 10K tokens mas de contexto en una tarjeta de 8 GB (104.704 frente a 94.464 tokens) y presentan una KLD entre un 34% y un 38% inferior (0,0703 / 0,0762 frente a 0,1064 / 0,1235). Solo la tabla de embeddings de tokens permanece en RAM del sistema; el resto se ejecuta en GPU. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, chino y turco.
- Razonamiento y respuesta multi-turno con ventanas de contexto muy largas (hasta 132.864 tokens en la variante 128K).
- Recuperacion de informacion en contexto largo (needle-in-a-haystack): el autor reporta que las tareas de recuperacion de codigo encuentran todos los fragmentos con KV cache f16, q8_0 y q4_0 a ~31K tokens.
- Seguimiento de instrucciones extensas en contexto largo, con degradacion medible segun el tipo de KV cache (13/18 con f16, 12/18 con q8_0, 9/18 con q4_0 en la prueba de reglas de formato del autor).
- Capacidad multimodal de imagen en el modelo base original, no incluida en estas cuantizaciones (sin proyector de vision `mmproj`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos en local: con 104.704 tokens de contexto en la variante 100K, el modelo puede procesar contratos, informes o bases de codigo extensas en una sola pasada sobre una RTX 4060 o similar de 8 GB, sin enviar datos a la nube.
- Asistentes conversacionales con memoria extendida: la ventana de 128K de la variante homonima permite mantener historiales de conversacion muy largos o inyectar grandes volumenes de contexto de sistema sin truncar.
- Recuperacion aumentada (RAG) con contexto masivo: en lugar de recuperar fragmentos pequenos, se pueden inyectar decenas de miles de tokens de documentacion recuperada, aprovechando la ventana extendida y el bajo coste de la KV cache en q8_0.
- Procesamiento de texto multilingue en ingles, chino y turco: adecuado para pipelines de traduccion, resumen o clasificacion en esos tres idiomas, con despliegue local.
- Inferencia en estaciones de trabajo con GPU de consumo: la variante 32K-HQ (7,02 GB, KLD 0,0182 / 0,0245) ofrece la mayor fidelidad frente a Q8_0 para tareas que no requieren mas de 38.400 tokens, en una GPU de 8 GB sin pantalla conectada.
- Investigacion sobre cuantizacion: los ficheros y la metodologia documentada (barrido de KLD por grupo de tensores) sirven como referencia reproducible para estudiar el impacto de la precision mixta en arquitecturas con capas looped y atencion hibrida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta metricas de calidad de cuantizacion (divergencia KL frente a Q8_0) y de ajuste en memoria:

| Variante | Tamano | Contexto que cabe en 8 GB | KLD media vs Q8_0 (set 1 / set 2) |
|---|---:|---:|---:|
| 8GB-128K | 4,97 GB | 132.864 tokens | 0,1375 / 0,1213 |
| 8GB-100K | 5,54 GB | 104.704 tokens | 0,0703 / 0,0762 |
| 8GB-32K-HQ | 7,02 GB | 38.400 tokens | 0,0182 / 0,0245 |

Referencia comparativa del autor: un Q4_K_M estandar con la misma imatrix presenta KLD de 0,1064 / 0,1235 y cabe con 94.464 tokens de contexto en la misma tarjeta. El autor tambien menciona una aceleracion de generacion de aproximadamente 1,85x con la cabeza MTP en una RTX 4060 usando `--spec-type draft-mtp`, pero esa funcionalidad corresponde a la version v2, no a esta ficha.

## Requisitos de hardware

- VRAM estimada: 8 GB para las tres variantes, con la tabla de embeddings de tokens en RAM del sistema. La variante 32K-HQ requiere una GPU de 8 GB sin pantalla conectada.
- GPU recomendadas: NVIDIA RTX 4060 (probada por el autor), asi como cualquier GPU de 8 GB (RTX 3070, RTX 4060 Ti, RTX 2070, etc.). Para contexto maximo y mayor throughput, A100 o H100, aunque no son necesarias para el objetivo de esta ficha.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB. Existe ademas una variante para 6 GB en `drofn/SenseNova-Loop-9B-6GB-GGUF`.
- Opciones de despliegue: exclusivamente un fork parcheado de llama.cpp. El upstream de llama.cpp, LM Studio y Ollama no soportaban la arquitectura `sensenova_loop` a fecha de 2026-11-19 (issue ggml-org/llama.cpp#31571). Los ficheros de este repo no cargan en la build del PR #32588 y viceversa.
- Latencia y throughput: no disponible de forma agregada. El autor senala que, en una RTX 4060, la build del PR #32588 es actualmente mas lenta que el fichero 8GB-v3 sobre el fork parcheado, porque el PR carece de kernels CUDA para el enrutamiento mHC.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad de cuantizacion | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| SenseNova-Loop-9B-8GB-100K (esta ficha) | 8,96B | 104.704 tokens en 8 GB | KLD 0,0703 / 0,0762 | Apache-2.0 | GGUF, fork parcheado de llama.cpp |
| SenseNova-Loop-9B-8GB-v3 (mismo autor) | 8,96B | 104.448 tokens | ~20% menor KLD que el 8GB-100K de esta ficha | Apache-2.0 | GGUF, fork parcheado; incluye cabeza MTP e imagen opcional |
| Q4_K_M estandar con la misma imatrix | 8,96B | 94.464 tokens en 8 GB | KLD 0,1064 / 0,1235 | Apache-2.0 | GGUF, llama.cpp upstream |
| SenseNova-Loop-9B (modelo base) | 8,96B | 512K (YaRN x2) | Referencia Q8_0 | Apache-2.0 | Safetensors, requiere infraestructura mayor |

No se dispone de comparaciones con modelos de otros desarrolladores (Llama, Qwen, Mistral, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un fork parcheado de llama.cpp: los ficheros no cargan en upstream, LM Studio ni Ollama, y son incompatibles con la build del PR #32588. Esto limita el despliegue estandarizado en produccion.
- Sin soporte de vision en estas cuantizaciones: el modelo base acepta imagenes, pero estos GGUF son solo texto y no incluyen proyector `mmproj`.
- Idiomas limitados: solo ingles, chino y turco. El rendimiento en castellano no esta documentado y no deberia asumirse.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier LLM, debe validarse la salida en aplicaciones criticas.
- Degradacion del seguimiento de instrucciones con KV cache q4_0 en contexto largo: el autor observa 9/18 frente a 13/18 con f16 en su prueba de reglas de formato, aunque lo califica de indicio, no de diferencia probada.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero al ser una cuantizacion de un modelo de terceros conviene verificar los terminos del modelo base `sensenova/SenseNova-Loop-9B`.
- Existe una version mas reciente (v3) recomendada por el propio autor para configuraciones nuevas de 8 GB; esta ficha se mantiene por las variantes 128K y 32K-HQ.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF
- Version recomendada v3: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v3-GGUF
- Version v2: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v2-GGUF
- Variante para 6 GB: https://huggingface.co/drofn/SenseNova-Loop-9B-6GB-GGUF
- Escalera completa de cuantizaciones (layout upstream): https://huggingface.co/drofn/SenseNova-Loop-9B-GGUF
- Coleccion de todas las versiones: https://huggingface.co/collections/drofn/sensenova-loop-9b-gguf-for-6-8-gb-gpus-6aff1a746c005b20c4230d30
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Issue de soporte de arquitectura en llama.cpp: https://github.com/ggml-org/llama.cpp/issues/31571
- PR de llama.cpp con layout upstream: https://github.com/ggml-org/llama.cpp/pull/32588
