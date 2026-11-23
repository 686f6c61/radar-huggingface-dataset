# q-project/Inkling-2-Mini-QVolta

## Resumen

Inkling-2-Mini-QVolta es una conversión cuantizada del modelo Inkling-2-Mini de Thinking Machines Lab, un transformer con mezcla de expertos (MoE) de 26.400 millones de parámetros totales y 3.400 millones activos, con 128 expertos y enrutamiento top-8. La particularidad arquitectónica del modelo base es que 12 de sus 24 capas intermedias se ejecutan tres veces compartiendo pesos (looped transformer), combinando atención local con ventana de 1024 tokens y atención global. El checkpoint original se distribuye en NVFP4/MXFP8 y ocupa 19,5 GB.

Este repositorio, publicado por q-project, contiene una conversión solo de texto en el contenedor de fichero único `.qv` del motor Q-Volta, con los expertos recuantizados a 3 bits mediante GPTQ sobre los pesos del proveedor. El resultado es un fichero de 9,89 GiB que cabe en una GPU de 16 GB y que, según el autor, alcanza unos 120 tok/s de decodificación en una Tesla V100 y permite contextos de hasta unas 580.000 tokens con caché KV int4 en esa misma tarjeta.

Es relevante porque demuestra una vía de despliegue de un MoE de 26B en hardware antiguo (V100) o incluso en CPU, a costa de una degradación de calidad medida y acotada. No obstante, el propio autor lo etiqueta como lanzamiento de investigación: solo carga en Q-Volta, no incluye la torre de visión ni la cabeza MTP, y no se evaluaron tool calling, código ni contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas repetidas (looped transformer): 24 capas, de las cuales las 12 intermedias se ejecutan 3 veces con pesos compartidos; atención local (ventana 1024) y global |
| Parametros totales | 26.400 millones (modelo base) |
| Parametros activos | 3.400 millones (128 expertos, top-8) |
| Longitud de contexto | Hasta 256K tokens anunciados; en la práctica, con caché KV int4 en una V100 de 16 GB cupieron unas 580K posiciones; el motor admite `--max-ctx` configurable (ejemplo con 131072) |
| Tipos de cuantizacion | Expertos 3 bits (GPTQ, grupo 128, metadatos de 8 bits); atención 5 bits; embedding/unembedding 4 bits; normas, router, kernels de convolución y puertas de bucle en fp16/fp32; caché KV int4 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.qv` (contenedor propio de Q-Volta: cabecera + índice JSON de tensores + datos en planos de bits); no compatible con safetensors, GGUF ni transformers |

## Arquitectura y entrenamiento

El modelo base es un MoE de 26,4B parámetros con 3,4B activos por token, 128 expertos y selección top-8. Su rasgo distintivo es el esquema de capas repetidas: de las 24 capas, las 12 centrales se aplican tres veces reutilizando los mismos pesos, lo que incrementa la profundidad efectiva sin aumentar el recuento de parámetros. La atención alterna componentes locales con ventana de 1024 tokens y componentes globales.

Esta ficha no dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO; esos datos corresponden a la model card del checkpoint original de Thinking Machines Lab, no incluida en la información proporcionada. Lo que sí está documentado es el proceso de cuantización: los expertos se recuantizan a 3 bits con GPTQ usando una matriz de Hessian encogida hacia la Hessian agrupada, grupo de 128 y metadatos de 8 bits, calibrado con 8.192 tokens de activaciones del propio modelo de referencia sobre texto de wikitext y código. La atención baja a 5 bits y los embeddings a 4 bits, mientras que las partes sensibles (normas, router, convoluciones y puertas de bucle) se mantienen en fp16/fp32.

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento activado por defecto: el modelo "piensa" antes de responder y el razonamiento aparece en el campo `content` salvo que se use el interruptor de thinking de la plantilla.
- Razonamiento multi-paso heredado del modelo base, aunque sin evaluación publicada en esta conversión.
- Contexto largo: el pipeline funciona con recuperación tipo passkey a 8K, 32K, 128K y 256K tokens (una prueba por longitud, según el autor).
- Inferencia en GPU con backend CUDA y en CPU con backend AVX2 (32 hilos).
- API compatible con OpenAI y con llama-server a través de `qv_server`.
- No incluye torre de visión: sin capacidades multimodales.
- No incluye la cabeza MTP, por lo que no hay decodificación especulativa.
- Soporte de tool calling y function calling: no evaluado en esta conversión.

## Casos de uso

- Despliegue de un MoE de 26B en GPUs de 16 GB: el fichero de 9,89 GiB permite servir el modelo en una V100-16GB o en tarjetas consumer de gama alta con 16 GB, algo inviable con el checkpoint original de 19,5 GB en NVFP4/MXFP8.
- Procesamiento de documentos largos: con caché KV int4 y contexto configurable por encima de 128K tokens, encaja en tareas de resumen o extracción sobre contratos, informes o bases de código extensas, siempre que el contenido esté en inglés.
- Inferencia en CPU para entornos sin GPU: el backend AVX2 ofrece unos 11 tok/s de decodificación y unos 70 tok/s de prefill con 32 hilos, suficiente para pruebas, prototipos o procesamiento por lotes no interactivo.
- Investigación sobre cuantización extrema: el repositorio publica NLL de referencia frente al checkpoint original y datos crudos de benchmarks, lo que lo convierte en un caso de estudio útil para medir el coste de bajar expertos a 3 bits.
- Servicio conversacional interno de baja concurrencia: `qv_server` atiende una petición a la vez y expone una API compatible con OpenAI, adecuada para herramientas internas o demos.
- Replicación de experimentos de contexto largo: las pruebas de passkey a 8K, 32K, 128K y 256K permiten validar pipelines de recuperación en ventanas muy grandes sobre hardware modesto.
- Evaluación comparativa de motores de inferencia: al ser un formato exclusivo de Q-Volta, sirve para medir el rendimiento del motor (122 tok/s a contexto 25, 57 tok/s a 256K) frente a otras implementaciones.

## Benchmarks y rendimiento

Calidad, medida como log-loss negativo (NLL, nats/token) en CPU fp32 sobre los mismos pesos:

| Modelo | NLL held-out (2.047 tokens wiki+código) | NLL README (511 tokens) |
|---|---:|---:|
| Checkpoint original (referencia) | 1,4479 | 1,7561 |
| Este fichero (Q3A5) | 1,4643 (+0,016) | 1,7620 (+0,006) |
| Expertos a 4 bits (12,7 GiB, no publicado) | 1,4636 | 1,7824 |

Coincidencia top-1 sobre 32 tokens greedy frente a la referencia en cuatro prompts: 32/32, 32/32, 32/32 y 29/32. Error absoluto medio de logits sobre el top-20 de la referencia: 1,33 (máximo 10,3). La referencia se validó contra la implementación de Hugging Face (bf16 en CPU): 32/32, 32/32, 32/32 y 31/32 tokens, con máximo |Δ| en top-20 de 0,22 a 2,05.

Rendimiento en Tesla V100-SXM2-16GB con Xeon E5-2683 v4, caché KV int4 y peticiones individuales:

| Escenario | Resultado |
|---|---|
| Prompt de 31 tokens, 256 tokens nuevos | 120 tok/s de decodificación |
| Prompt de 16.045 tokens | Prefill 1.924 tok/s, decodificación 111 tok/s |
| Decodificación por longitud de contexto (CUDA graph) | 122 tok/s a 25; 114 a 4K; 101 a 32K; 76 a 128K; 57 a 256K |
| Prefill | 2.764 tok/s con prompt de 4K (chunk 4096); 766 tok/s con prompt de 256K (334 s) |
| Backend CPU (AVX2, 32 hilos) | 11 tok/s de decodificación; ~70 tok/s de prefill |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el fichero de pesos ocupa 9,89 GiB; con caché KV int4 en una tarjeta de 16 GB se alcanzaron unas 580K posiciones usando 15,7 de 15,8 GiB.
- GPU recomendadas: Tesla V100-SXM2-16GB es la plataforma de referencia medida; cualquier GPU con al menos 16 GB de VRAM debería poder cargar el modelo, aunque no se han publicado medidas en otras tarjetas.
- GPU consumer: cabe en tarjetas de 16 GB (por ejemplo, gama x070 de NVIDIA con 16 GB); no hay datos publicados para 12 GB u 8 GB.
- CPU: backend AVX2 con hilos configurables; 11 tok/s de decodificación y ~70 tok/s de prefill con 32 hilos.
- Despliegue: exclusivamente mediante el motor Q-Volta (`qv_server`), compilado con CMake y CUDA; no compatible con transformers, vLLM, llama.cpp, Ollama ni TGI. Hay instrucciones de Docker en el repositorio.
- Latencia y throughput: decodificación ligada a latencia, aproximadamente un tercio del límite de ancho de banda según el autor; una petición simultánea como máximo; sin decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-QVolta | 26,4B totales / 3,4B activos | Hasta 256K anunciado; ~580K probado con KV int4 en 16 GB | `.qv`, solo Q-Volta | Apache 2.0 | Público en Hugging Face; 0 descargas |
| Inkling-2-Mini (original) | 26,4B totales / 3,4B activos | No disponible en la información proporcionada | NVFP4/MXFP8, 19,5 GB; ecosistema Hugging Face | Apache 2.0 | Público en Hugging Face |
| Qwen3.8-27B-QVolta | 27B (no se especifica si MoE) | No disponible | `.qv`, solo Q-Volta | No disponible en la información proporcionada | Mencionado por el autor como publicación relacionada |

No se dispone de datos de benchmarks comparativos frente a otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Es un lanzamiento de investigación, no un reemplazo directo del checkpoint original: la recuantización a 3 bits de los expertos degrada la calidad, con un aumento de NLL de +0,016 nats/token en held-out.
- Los logits individuales se mueven de forma apreciable: error absoluto medio de 1,33 y máximo de 10,3 sobre el top-20 de la referencia.
- Solo carga en Q-Volta; no es utilizable con transformers, vLLM, llama.cpp ni Ollama.
- Solo texto: no incluye la torre de visión ni la cabeza MTP, por lo que no hay multimodalidad ni decodificación especulativa.
- Solo inglés.
- No se evaluaron tool calling, generación de código ni calidad en contexto largo; las pruebas de passkey demuestran que el pipeline funciona, no la calidad de recuperación.
- El modelo razona por defecto, de modo que el razonamiento puede aparecer en el campo `content` si no se activa el interruptor de thinking de la plantilla.
- Atiende una sola petición a la vez; el rendimiento en concurrencia no está medido.
- La ruta de log-scaling usada por encima de 8K tokens solo se comprobó a nivel de módulo de atención, no para el modelo completo.
- Licencia Apache 2.0 para los pesos, pero la model card original enlaza una Política de Uso Aceptable de Thinking Machines que conviene revisar antes de un uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible para esta conversión; deben asumirse los del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/q-project/Inkling-2-Mini-QVolta
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del motor Q-Volta: https://github.com/Q-Project-LM/q-volta
- Resultados de benchmarks del motor: https://github.com/Q-Project-LM/q-volta/tree/main/benchmarks/results
- Guía de ejecución de Inkling: https://github.com/Q-Project-LM/q-volta/blob/main/docs/INKLING_RUN.md
- Instrucciones de Docker: https://github.com/Q-Project-LM/q-volta/blob/main/docs/DOCKER.md
- Otra conversión del mismo autor: https://huggingface.co/q-project/Qwen3.8-27B-QVolta
- Política de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
