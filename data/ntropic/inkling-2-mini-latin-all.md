# Ntropic/Inkling-2-Mini-latin-all

## Resumen

Inkling-2-Mini-latin-all es una variante podada del vocabulario del modelo base thinkingmachines/Inkling-2-Mini, desarrollado por Thinking Machines Lab y redistribuido por el usuario Ntropic bajo licencia Apache 2.0. El modelo conserva la arquitectura y los pesos del original (26.024.029.224 parametros totales segun los safetensors del repositorio) pero reduce el vocabulario de 200.058 a 121.897 tokens, lo que supone una disminucion del 39,07 % en la tabla de embeddings y en la cabeza de salida. El checkpoint pasa de 20,16 GB a 19,39 GB.

La poda se ha realizado con la herramienta VocabPruner del mismo autor, seleccionando el grupo `latin-all` (caracteres latinos, comunes y heredados, mas todos los simbolos y elementos de sintaxis), sin filtro de frecuencia y preservando los tokens de byte y las dependencias BPE. Los identificadores se remapean y no se realiza reentrenamiento, por lo que el modelo mantiene las capacidades del original pero con una huella de parametros menor en las capas de embedding y en la proyeccion DSpark.

La relevancia de esta ficha radica en que ejemplifica una tecnica de optimizacion poco habitual: la reduccion del vocabulario como via para disminuir el uso de VRAM en la cache KV y en los pesos, con mejoras medidas de throughput en una RTX 5090. Esta pensado para despliegues en los que el modelo base es demasiado grande para el hardware disponible y el uso se concentra en idiomas de escritura latina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y bucle iterativo (loop); incluye proyeccion DSpark y codificador de vision |
| Parametros totales | 26.024.029.224 |
| Parametros activos | Aproximadamente 4,99B por token (estimacion del autor: 8 de 128 expertos, tres pasadas de bucle, excluye vision y DSpark) |
| Longitud de contexto | 262.144 tokens (limite usado en las pruebas del autor) |
| Tipos de cuantizacion | 8 bits (tag `8-bit`, `modelopt`); el autor menciona cache KV en FP8 |
| Idiomas soportados | No disponible (la seleccion de vocabulario es latin-all, lo que sugiere cobertura de escrituras latinas, pero no se detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura de mezcla de expertos con 128 expertos de los que se activan 8 por token, combinada con un mecanismo de bucle iterativo (tres pasadas segun la estimacion de pesos activos del autor). Incluye ademas una proyeccion DSpark y un codificador de vision que, en las pruebas del autor, se ejecuta en CPU con un consumo aproximado de 1,4 GiB de RAM. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion de esta variante es exclusivamente la poda de vocabulario: se eliminan 78.161 tokens (39,07 %) manteniendo los tokens de byte y las dependencias BPE, con remapeo de identificadores y sin reentrenamiento. La cabeza de salida pasa de 463,16M a 280,85M parametros y la proyeccion DSpark de 51,46M a 31,21M. El autor no reclama una reduccion de computo medida, solo una estimacion de pesos activos por token de 5,17B a 4,99B. Las pruebas de rendimiento se realizaron con decodificacion especulativa DSpark de 7 tokens borrador, cache KV en FP8 y offload de 16 GiB de cache KV a CPU.

## Capacidades

- Generacion de texto y razonamiento en el marco del modelo base Inkling-2-Mini.
- Procesamiento de imagenes mediante el codificador de vision incluido (probado con imagen en vivo por el autor).
- Decodificacion especulativa DSpark con 7 tokens borrador, integrada en el flujo de inferencia.
- Soporte de contexto largo de hasta 262.144 tokens.
- Capacidades multilingues limitadas al subconjunto de vocabulario latin-all seleccionado.
- No se dispone de informacion sobre tool calling, function calling, uso agentico ni modos de razonamiento explicito (thinking mode) en la documentacion proporcionada.

## Casos de uso

- Despliegue en GPU de consumo: el modelo cabe en una RTX 5090 de 32 GB con cache KV en FP8 y offload parcial a CPU, lo que permite ejecutar un MoE de 26B en hardware de escritorio.
- Procesamiento de documentos largos en castellano y otras lenguas latinas: la ventana de 262.144 tokens permite analizar contratos, informes o expedientes completos en una sola pasada.
- Generacion aumentada por recuperacion (RAG) con corpus extensos: la mayor capacidad de cache KV (457.889 tokens en la prueba del autor) reduce la necesidad de truncar contextos recuperados.
- Analisis de imagenes en pipelines de documentacion: el codificador de vision en CPU permite procesar capturas o escaneos sin ocupar VRAM adicional.
- Prototipado e investigacion en entornos con una sola GPU: la reduccion del checkpoint a 19,39 GB y la mejora del 11,5 % en throughput con una peticion facilitan la experimentacion iterativa.
- Servicio de inferencia de baja concurrencia: con 4 peticiones concurrentes el rendimiento se mantiene estable (426 frente a 431 tok/s), adecuado para herramientas internas o asistentes personales.
- Evaluacion comparativa de tecnicas de poda de vocabulario: sirve como referencia reproducible gracias al comando de VocabPruner documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo proporciona metricas de inferencia medidas con inference-manager en una RTX 5090 de 32 GB:

| Metrica | Original | Podado | Cambio |
|---|---:|---:|---:|
| Prefill | 10.984 tok/s | 11.410 tok/s | +3,9 % |
| Throughput de salida, 1 peticion | 234 tok/s | 261 tok/s | +11,5 % |
| Throughput de salida, 4 peticiones concurrentes | 431 tok/s | 426 tok/s | -1,0 % |
| Capacidad de cache KV en GPU | 388.916 tokens (10,34 GiB) | 457.889 tokens (11,11 GiB) | +17,7 % |

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 19,39 GB en el repositorio; en ejecucion con cache KV en FP8 y 16 GiB de offload a CPU cabe en 32 GB de VRAM.
- GPU recomendadas: RTX 5090 (32 GB) es la unica configuracion con metricas publicadas; para mayor margen se recomiendan A100 de 80 GB o H100.
- GPU de consumo: si, en RTX 5090 de 32 GB; no se documenta su funcionamiento en GPUs de 24 GB o menos.
- Opciones de despliegue: inference-manager del autor (usado en las pruebas); el modelo requiere el parche vLLM PR #69181 para la cache de convolucion corta. No se confirma soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: 261 tok/s con una peticion y 426 tok/s con cuatro en RTX 5090; prefill de 11.410 tok/s.
- El codificador de vision consume aproximadamente 1,4 GiB de RAM en CPU.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| Inkling-2-Mini-latin-all | 26,02B (≈4,99B activos) | 262.144 | Apache 2.0 | Vocabulario podado a 121.897 tokens; checkpoint de 19,39 GB |
| thinkingmachines/Inkling-2-Mini | No disponible | No disponible | Apache 2.0 | Modelo base; vocabulario de 200.058 tokens; checkpoint de 20,16 GB |
| Otros modelos de tamano similar | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La poda de vocabulario puede degradar el rendimiento en idiomas no cubiertos por el grupo latin-all (por ejemplo, escrituras cirilicas, arabes o CJK), aunque no se aportan evaluaciones que lo cuantifiquen.
- No se han publicado benchmarks de calidad; se desconoce el impacto real de la poda en tareas de razonamiento, codigo o matematicas.
- El autor no reclama reduccion de computo medida, solo una estimacion de pesos activos; las mejoras de throughput son empiricas y dependen de la configuracion de inference-manager.
- El modelo requiere un parche especifico de vLLM (PR #69181) y la herramienta inference-manager; el soporte en otros motores de inferencia no esta documentado.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinacion para el modelo base ni para la variante podada.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base de Thinking Machines Lab, que no se detallan en la informacion disponible.
- El codificador de vision se ejecuta en CPU en la configuracion probada, lo que puede introducir latencia adicional en cargas con muchas imagenes.
- El modelo tiene 27 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ntropic/Inkling-2-Mini-latin-all
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- VocabPruner (repositorio): https://github.com/Ntropic/VocabPruner
- inference-manager (repositorio): https://github.com/Ntropic/inference-manager
- Parche vLLM PR #69181: https://github.com/vllm-project/vllm/pull/69181
