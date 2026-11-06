# CMSManhattan/JiRackTernaryPrecision-2B-chat

## Resumen

JiRack Ternary Precision 2B-chat es un modelo de lenguaje de pesos ternarios (1.58 bits) publicado por CMSManhattan (Konstantin Grabko) en formato GGUF para llama.cpp. El repositorio identificado como `CMSManhattan/JiRackTernaryPrecision-2B-chat` se presenta bajo la familia JiRack, cuyo modelo base declarado es `CMSManhattan/JiRackUltra_7b`. La model card disponible describe con detalle la variante de 8B de la misma familia (8.080 millones de parametros, arquitectura Qwen2 con 28 capas), mientras que la informacion especifica del checkpoint de 2B es escasa: no se publican parametros exactos, numero de capas ni resultados de evaluacion propios para esta variante.

La propuesta tecnica del modelo es la cuantizacion ternaria estilo BitNet b1.58: cada capa lineal del transformer emplea pesos en {-1, 0, +1} con una escala por tensor y activaciones de 8 bits, lo que reduce drasticamente el tamano del fichero y permite inferencia en CPU. El modelo esta orientado a tool calling, agentes y software de robotica, e incluye tokens especiales dedicados para llamadas a herramientas (`<|tool_call_start|>` / `<|tool_call_end|>`) y resultados (`<|tool_result_start|>` / `<|tool_result_end|>`).

Su relevancia actual radica en la combinacion de un modelo conversacional pequeno, formato GGUF listo para llama.cpp y un proxy compatible con la API de OpenAI que expone tool calls estandar, lo que facilita su integracion en frameworks de agentes existentes. La licencia es propietaria (BSL-1.0 con nombre `jirack-proprietary`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Qwen2 (no se detalla para la variante 2B; la 8B usa 28 capas, hidden 3584, FFN 20480, 28 heads / 4 KV heads con GQA) |
| Parametros totales | No disponible para la variante 2B (la familia incluye variantes de 2B, 8B, 16B y 36B; la 8B declara 8,08B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para la variante 2B; la familia se entrena con secuencias de hasta 32.768 tokens |
| Tipos de cuantizacion | Ternaria 1.58-bit empaquetada como TQ2_0 y TQ1_0 en GGUF (la 8B ocupa 2,6 GB en TQ2_0 frente a 16,2 GB en bf16); la 2B ocupa 0,73 GB en TQ2_0 |
| Idiomas soportados | No disponible |
| Licencia | BSL-1.0 con nombre `jirack-proprietary` (propietaria) |
| Formato de pesos | GGUF (llama.cpp); plantilla de chat en `chat_template.jinja` |

## Arquitectura y entrenamiento

La familia JiRack emplea un decoder transformer de estilo Qwen2 con atencion de cabezas KV agrupadas (GQA), bias en las proyecciones q/k/v y cabeza de salida separada. La innovacion central es la ternarizacion de todas las capas lineales: cada peso se representa como `clamp(round(W / mean|W|), -1, 1) * mean|W|`, con escala por tensor y activaciones de 8 bits, siguiendo el esquema BitNet b1.58. El entrenamiento descrito para la variante 8B consta de tres fases: preentrenamiento continuado en bf16 sobre C4, ternarizacion con awareness de cuantizacion sobre C4 (con lambda progresando de 0 a 1) y una fase final en ternario sobre C4 mas Wikipedia. Posteriormente se aplica SFT en ternario para chat, razonamiento y tool calling, seguido de un SFT especifico de robotica con codigo en Python, C++ y Java, datos de herramientas estilo BFCL y ejemplos donde ninguna de 8-14 herramientas similares encaja.

Para la variante 2B no se detallan ni el numero de capas, ni los datos de entrenamiento, ni las fases aplicadas. El modelo base declarado es `CMSManhattan/JiRackUltra_7b`, lo que sugiere un proceso de destilacion o derivacion desde la variante de 7B/8B, pero el repositorio no documenta ese procedimiento. La exportacion a GGUF almacena cada peso ternario exactamente como lo computa el modelo y lo empaqueta como TQ2_0 o TQ1_0.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de prompt especifica de fine-tuning.
- Tool calling y function calling con tokens especiales dedicados para llamadas y resultados.
- Soporte de llamadas paralelas a multiples herramientas y de respuestas de seguimiento a partir de resultados de herramientas.
- Capacidad de clarificar argumentos faltantes y de rechazar peticiones irrelevantes (categorias evaluadas en la familia).
- Razonamiento multi-paso orientado a agentes.
- Generacion de codigo de robotica en Python, C++ y Java (documentado para la familia; no confirmado especificamente para 2B).
- Integracion con la API de OpenAI mediante proxy (`jirack_gguf_proxy.py` + `jirack_openai_server.py`) sobre `llama-server`.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Agentes de tool calling en produccion: el modelo emite llamadas estructuradas con los tokens `<|tool_call_start|>` y `<|tool_call_end|>`, y el proxy las transforma en `tool_calls` estandar de OpenAI, por lo que cualquier framework de agentes compatible puede consumirlo sin adaptadores adicionales.
- Automatizacion de robotica: generacion de codigo de control en Python, C++ y Java, con datos de entrenamiento especificos para escenarios donde varias herramientas son similares y hay que elegir la correcta o descartar todas.
- Despliegue en dispositivos embebidos: con 0,73 GB en TQ2_0, la variante 2B cabe en Jetson Orin Nano de 4 u 8 GB y en Orin NX, AGX Orin y Thor segun las estimaciones del autor, ejecutandose en CPU con llama.cpp.
- Asistente conversacional local: inferencia en CPU sin GPU gracias a los pesos ternarios, adecuado para entornos con restricciones de hardware o de privacidad.
- Enrutamiento de herramientas en pipelines: el modelo decide si se necesita una herramienta, cual y con que argumentos, y puede pedir aclaracion cuando falta un parametro, lo que encaja en capas de orquestacion.
- Prototipado rapido de agentes: el servidor compatible con OpenAI permite sustituir un modelo en la nube por este checkpoint local sin cambiar el codigo del cliente.
- Procesamiento de resultados de herramientas: la capacidad de follow-up permite encadenar la respuesta del modelo a la salida de una API o funcion en flujos multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la variante 2B en la informacion disponible. Los datos publicados corresponden a la variante 8B de la familia y se recogen a continuacion como referencia, no como rendimiento del modelo 2B.

| Prueba (variante 8B) | Referencia PyTorch | GGUF TQ2_0 |
|---|---|---|
| Llamada unica (38 casos) | 37/38 | 37/38 |
| Llamadas paralelas (19 casos) | 17/19 | 17/19 |
| Follow-up (20 casos) | 19/20 | 19/20 |
| Sin herramienta necesaria (25 casos) | 25/25 | 25/25 |
| Clarificar argumento faltante (15 casos) | 13/15 | 14/15 |
| Total (117 casos) | 111/117 (94,9%) | 112/117 (95,7%) |

| BFCL v3 (modelo de referencia 8B, greedy) | N | Precision |
|---|---|---|
| simple | 400 | 82,8% |
| multiple | 200 | 82,5% |
| parallel | 200 | 82,0% |
| parallel_multiple | 200 | 69,0% |
| java | 100 | 48,0% |
| javascript | 50 | 52,0% |
| irrelevance | 240 | 81,7% |
| Total no-live | 1.390 | 76,8% |
| live_simple | 258 | 50,4% |
| live_multiple | 1.053 | 49,8% |
| live_parallel | 16 | 43,8% |
| live_parallel_multiple | 24 | 33,3% |
| live_relevance | 18 | 72,2% |
| live_irrelevance | 882 | 66,2% |
| Total live | 2.251 | 56,2% |

El autor advierte que los totales BFCL estan ponderados por numero de casos y no son comparables con las medias oficiales del leaderboard; las categorias multi-turno no se ejecutaron. La variante ternaria de 16B obtiene 77,4% y 57,8% en los mismos conjuntos.

## Requisitos de hardware

- VRAM estimada: la variante 2B ocupa 0,73 GB en TQ2_0; al ser ternaria y ejecutable en CPU, no requiere VRAM dedicada.
- GPU recomendadas: no disponibles para la variante 2B. La familia menciona ejecucion en CPU con llama.cpp y, para GPU Jetson (CUDA), el uso del fichero Q2_0 equivalente, ligeramente mayor.
- Compatibilidad consumer: cabe en Jetson Orin Nano de 4 u 8 GB, Orin NX, AGX Orin y Thor segun las estimaciones del autor (para la 8B; la 2B es aun mas holgada). No se detalla compatibilidad con GPUs de escritorio.
- Opciones de despliegue: llama.cpp (`llama-cli` para chat, `llama-server` para API), mas el proxy `jirack_gguf_proxy.py` y `jirack_openai_server.py` para exponer una API compatible con OpenAI con tool calls.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JiRack Ternary Precision 2B-chat | No disponible (familia: 2B) | No disponible (familia: 32.768) | Ternaria 1.58-bit (TQ2_0, TQ1_0) | BSL-1.0 propietaria | GGUF en Hugging Face, 0 descargas |
| JiRack Ternary Precision 8B (misma familia) | 8,08B | 32.768 | Ternaria 1.58-bit | BSL-1.0 propietaria | GGUF en Hugging Face |
| JiRack Ternary Precision 16B (misma familia) | No disponible | No disponible | Ternaria 1.58-bit | BSL-1.0 propietaria | GGUF en Hugging Face |
| Modelos ternarios BitNet b1.58 de referencia | No disponible | No disponible | Ternaria 1.58-bit | No disponible | No disponible |

No se dispone de datos de benchmarks de la variante 2B que permitan una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card del repositorio describe la variante de 8B; las especificaciones de la variante 2B (capas, contexto, entrenamiento) no estan documentadas, lo que dificulta evaluar su calidad real.
- No hay resultados de benchmarks publicados para el checkpoint de 2B; los datos de tool calling y BFCL corresponden a la variante de 8B.
- La licencia es propietaria (`jirack-proprietary`, BSL-1.0): es necesario revisar los terminos exactos antes de cualquier uso comercial.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad factual para esta variante.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado fuera del ingles sin evaluacion.
- El modelo esta especializado en tool calling y robotica; su comportamiento en tareas genericas de chat o razonamiento abierto no esta documentado.
- La integracion con la API de OpenAI depende de scripts auxiliares del autor (`jirack_gguf_proxy.py` y `jirack_openai_server.py`), cuyo mantenimiento y compatibilidad futura no estan garantizados.
- El repositorio registra 0 descargas y 0 likes, sin validacion independiente de la comunidad.
- Las estimaciones de compatibilidad con Jetson son calculadas por el autor y no medidas en dispositivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-2B-chat
- Modelo base declarado: https://huggingface.co/CMSManhattan/JiRackUltra_7b
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/CMSManhattan/JiRack-2B-Chat
