# CMSManhattan/JiRackTernaryPrecision-16B-chat

## Resumen

JiRack Ternary Precision 16B es un modelo de lenguaje de 15,9 mil millones de parámetros desarrollado por CMSManhattan (Konstantin Grabko) que emplea pesos ternarios {-1, 0, +1} en todas sus capas lineales, siguiendo el enfoque BitNet b1.58. Se distribuye exclusivamente en formato GGUF para llama.cpp, lo que reduce el peso del modelo de 31,8 GB en bf16 a 4,8 GB (fichero TQ2_0), permitiendo su ejecución en CPU y en dispositivos de borde como las placas NVIDIA Jetson. El modelo está especializado en tool calling, agentes y software de robótica.

La arquitectura es un decoder estilo Qwen2 (layout de DeepSeek-R1-Distill) de 48 capas con hidden de 5120, FFN de 15360, 40 cabezas de atención y 8 cabezas KV (GQA). Se inicializó desde DeepSeek-R1-Distill-Qwen-14B con la FFN ensanchada de 13824 a 15360, y se sometió a un proceso de ternarización con cuantización consciente sobre C4 y Wikipedia antes del fine-tuning ternario para chat, razonamiento, tool calling, trayectorias agénticas de código y robótica.

Su relevancia actual reside en la combinación de un tamaño de 16B con un peso en disco inferior a 5 GB, lo que habilita despliegues en hardware muy limitado manteniendo capacidades de function calling verificadas. El contexto de fine-tuning alcanza los 32.768 tokens y la tokenización es compatible con DeepSeek-R1/Qwen2, incluyendo tokens especiales para llamadas a herramientas y resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Qwen2 (layout DeepSeek-R1-Distill), 48 capas, hidden 5120, FFN 15360, 40 cabezas / 8 KV (GQA), bias en q/k/v, cabeza de salida separada |
| Parametros totales | 15,9B (336 capas lineales ternarias) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (secuencias de fine-tuning) |
| Tipos de cuantizacion | Ternaria 1.58-bit (pesos {-1, 0, +1} con escala por tensor y activaciones de 8 bits); ficheros TQ2_0 y TQ1_0; variante Q2_0 para GPU CUDA en Jetson |
| Idiomas soportados | no disponible |
| Licencia | jirack-proprietary (BSL-1.0 segun metadatos) |
| Formato de pesos | GGUF (TQ2_0, TQ1_0) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Qwen-14B, cuya FFN se ensancha de 13824 a 15360, dando lugar a una arquitectura de 48 capas con atención GQA (40 cabezas de consulta, 8 de clave/valor) y bias en las proyecciones q/k/v. Todas las capas lineales (336) emplean pesos ternarios con escala por tensor y activaciones de 8 bits, siguiendo el esquema BitNet b1.58. La exportación a GGUF almacena cada peso ternario exactamente como lo computa el modelo mediante `clamp(round(W / mean|W|), -1, 1) * mean|W|`, empaquetado después como TQ2_0 o TQ1_0.

El entrenamiento se estructuró en tres fases: fase 0 de preentrenamiento continuado en bf16 sobre C4; fase 1 de ternarización consciente de cuantización sobre C4 con lambda escalando de 0 a 1 a lo largo de 8.000 pasos; y fase 2 ya en ternario sobre C4 más Wikipedia. Posteriormente se aplicó un fine-tuning ternario (lambda 1) en tres etapas: SFT principal (chat, razonamiento, tool calling), SFT agéntico (trayectorias de código de SWE-rebench y sandbox Docker, datos sin herramienta y de aclaración) y SFT de robótica (código en Python, C++, Java, datos de herramientas estilo BFCL y ejemplos donde ninguna de 8-14 herramientas similares encaja). El tokenizador es el de DeepSeek-R1/Qwen2 ampliado con `<|tool_call_start|>`, `<|tool_call_end|>`, `<|tool_result_start|>` y `<|tool_result_end|>`.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con contexto de hasta 32.768 tokens.
- Tool calling y function calling con formato estructurado mediante tokens especiales dedicados; soporta llamadas simples, paralelas y de seguimiento a partir del resultado de una herramienta.
- Detección de irrelevancia: capacidad de no invocar ninguna herramienta cuando no es necesario.
- Aclaración de argumentos faltantes: solicita información adicional cuando la llamada no está completa.
- Agentes multi-paso y trayectorias de código en entornos tipo sandbox (entrenado con datos de SWE-rebench y Docker).
- Generación de código de robótica en Python, C++ y Java.
- Desambiguación entre herramientas similares: entrenado con ejemplos donde ninguna de 8-14 herramientas parecidas es la correcta.
- Integración con clientes OpenAI mediante un proxy que traduce las llamadas del modelo a `tool_calls` estándar.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agentes de software en producción: el modelo puede gestionar bucles de razonamiento y llamadas a herramientas en pipelines de CI/CD, apoyándose en su SFT agéntico sobre trayectorias de código y su formato de tool calling compatible con OpenAI para integrarse en frameworks existentes.
- Robótica y automatización industrial: genera código de control en Python, C++ y Java y selecciona entre conjuntos amplios de herramientas afines, lo que encaja en tareas de orquestación de brazos robóticos o scripts de percepción.
- Despliegue en dispositivos de borde: con 4,8 GB en TQ2_0 cabe en una Jetson Orin NX de 16 GB, AGX Orin o Thor, permitiendo asistentes locales de tool calling sin conexión a la nube.
- Asistente de atención al cliente con acceso a APIs: el modelo decide cuándo invocar herramientas (consulta de pedidos, estado de envío) y cuándo responder directamente, con un 80,8% de acierto en irrelevancia en BFCL v3 no-live.
- Automatización de tareas con argumentos incompletos: su capacidad de aclaración (12/15 en la prueba interna) lo hace adecuado para flujos donde el usuario debe proporcionar datos faltantes antes de ejecutar una acción.
- Ejecución de agentes en CPU sin GPU: al correr en llama.cpp sobre CPU, permite montar servicios de function calling en servidores sin acelerador dedicado, con un proxy que expone una API compatible con OpenAI.
- Prototipado de asistentes para domótica o IoT: el bajo peso del fichero y el contexto de 32k permiten mantener historiales largos de interacción en hardware embebido.

## Benchmarks y rendimiento

Prueba interna de tool calling (117 casos, greedy), comparando el modelo de referencia en PyTorch con el fichero GGUF TQ2_0:

| Categoria | Referencia (PyTorch) | GGUF TQ2_0 |
|---|---|---|
| Llamada simple (una herramienta, todos los argumentos) | 36/38 | 36/38 |
| Llamadas paralelas | 18/19 | 18/19 |
| Seguimiento (respuesta a partir de resultado) | 20/20 | 20/20 |
| Sin herramienta necesaria | 25/25 | 25/25 |
| Aclarar argumento faltante | 13/15 | 12/15 |
| Total | 112/117 (95,7%) | 111/117 (94,9%) |

BFCL v3 (modelo de referencia, greedy), categorias no-live:

| Categoria | N | Precision |
|---|---|---|
| simple | 400 | 82,5% |
| multiple | 200 | 82,0% |
| parallel | 200 | 82,5% |
| parallel_multiple | 200 | 66,5% |
| java | 100 | 59,0% |
| javascript | 50 | 62,0% |
| irrelevance | 240 | 80,8% |
| Total | 1.390 | 77,4% |

BFCL v3 (modelo de referencia, greedy), categorias live:

| Categoria | N | Precision |
|---|---|---|
| live_simple | 258 | 63,2% |
| live_multiple | 1.053 | 53,4% |
| live_parallel | 16 | 56,3% |
| live_parallel_multiple | 24 | 54,2% |
| live_relevance | 18 | 72,2% |
| live_irrelevance | 882 | 61,3% |
| Total | 2.251 | 57,8% |

Nota del autor: los totales están ponderados por número de casos según evalscope y no son comparables con las medias oficiales del leaderboard; las categorías multi-turno no se ejecutaron. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: 4,8 GB para TQ2_0 y 4,1 GB para TQ1_0. En bf16 el modelo ocuparía 31,8 GB.
- Cabe en CPU: llama.cpp ejecuta TQ2_0 sobre núcleos de CPU.
- NVIDIA Jetson (estimación del autor, no medida): 16B en TQ2_0 cabe en Orin NX 16 GB, AGX Orin y Thor; ajustado con contexto corto en Orin Nano 8 GB y Orin NX 8 GB; no cabe en Orin Nano 4 GB. La estimación incluye la caché KV para 4k de contexto y deja unos 2 GB de memoria compartida al sistema operativo.
- GPU en Jetson: para ejecutar en la GPU CUDA se recomienda el fichero Q2_0 del mismo modelo (mismos pesos ternarios, ligeramente mayor; en 36B pasa de 9,91 GB a 10,71 GB).
- GPU de escritorio: no se proporcionan datos específicos de VRAM para A100, H100 o RTX 4090 en la información disponible.
- Despliegue: llama.cpp con `llama-cli` (chat) y `llama-server` (API); proxy `jirack_gguf_proxy.py` junto a `jirack_openai_server.py` para exponer un endpoint compatible con OpenAI con tool calls. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / peso | Licencia | Especializacion |
|---|---|---|---|---|---|
| JiRack Ternary Precision 16B | 15,9B | 32.768 | GGUF ternario, 4,8 GB | jirack-proprietary (BSL-1.0) | Tool calling, agentes, robótica |
| DeepSeek-R1-Distill-Qwen-14B (modelo de inicialización) | 14B | no disponible en la información | safetensors bf16 | MIT (según el modelo original; no confirmado en la información) | Razonamiento general |
| BitNet b1.58 (referencia arquitectónica) | variable | no disponible | ternario | no disponible | Investigación en cuantización ternaria |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia propietaria `jirack-proprietary` con metadatos BSL-1.0: es necesario revisar los términos exactos antes de cualquier uso comercial; la información disponible no detalla restricciones de producción.
- Idiomas soportados no declarados: no hay garantía de rendimiento fuera del inglés, dado que el entrenamiento se realizó sobre C4 y Wikipedia sin desglose lingüístico.
- Riesgo de alucinación inherente a modelos de 16B, especialmente en razonamiento multi-paso y en la selección de herramientas cuando el conjunto es amplio (59,0% en Java y 53,4% en live_multiple en BFCL v3).
- El contexto de 32.768 tokens es el usado en fine-tuning; no se documenta comportamiento más allá de esa longitud.
- La cuantización ternaria introduce pérdida de precisión: el GGUF TQ2_0 pierde un caso frente a la referencia PyTorch (111/117 frente a 112/117), y TQ1_0 no fue evaluado por separado.
- Las estimaciones de compatibilidad con Jetson no han sido medidas en dispositivos reales.
- El modelo está especializado en tool calling y robótica; su rendimiento en tareas generales de conocimiento o generación creativa no está documentado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CMSManhattan/JiRackTernaryPrecision-16B-chat
- Demo chat en HF Spaces: https://huggingface.co/spaces/CMSManhattan/JiRack-16B-Chat
- Modelo base: https://huggingface.co/CMSManhattan/JiRackUltra_14b
- Paper BitNet b1.58 (referencia arquitectónica): no disponible en la información proporcionada
- Repositorio de llama.cpp: no disponible en la información proporcionada
- Otros enlaces (blogs, papers, demos): no disponibles en la información proporcionada
