# sakamakismile/gpt-oss-20b-abliterated-EXL3-6bpw

## Resumen

Este repositorio contiene una cuantización **EXL3 6.0 bpw** del modelo **gpt-oss-20b-abliterated**, una versión con supresión de rechazos (refusal-suppressed) del **gpt-oss-20b** de OpenAI, realizada por el usuario sakamakismile (Lna-Lab / YUKI). El modelo base, desarrollado por wangzhang mediante la técnica *abliterix*, elimina parcialmente la tendencia del modelo original a rechazar peticiones, manteniendo sus capacidades de razonamiento y tool use. La cuantización en formato ExLlamaV3 permite ejecutar un modelo de 21B parámetros totales (3.6B activos) en hardware de consumo, con un tamaño de 17 GB y contexto nativo de 128k.

La relevancia de esta ficha radica en que ofrece una alternativa práctica para desarrolladores que necesitan un modelo open-weight con razonamiento configurable, tool calling y soporte multilingüe (inglés, japonés y chino), bajo licencia Apache 2.0, y que puede desplegarse en GPUs de 16 GB mediante tensor parallelism o con offload de expertos a CPU. Además, el autor ha corregido un problema de carga de los expertos en ExLlamaV3 1.4.5, lo que garantiza una fidelidad alta respecto al modelo original (error relativo 4e-4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 32 expertos, basada en gpt-oss-20b de OpenAI |
| Parametros totales | 21B (modelo base); 8.712.728.896 en el archivo safetensors cuantizado |
| Parametros activos | 3.6B |
| Longitud de contexto | 128k (nativo) |
| Tipos de cuantizacion | EXL3 6.0 bpw (decoder), 8 bpw (head) |
| Idiomas soportados | en, ja, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (EXL3, específico de ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es **gpt-oss-20b** de OpenAI, un transformer con arquitectura MoE de 32 expertos, 21B parámetros totales y 3.6B activos, entrenado con 128k de contexto. OpenAI lo diseñó para razonamiento eficiente y tool use, con un mecanismo de *reasoning effort* configurable. Sobre este modelo, wangzhang aplicó la técnica *abliterix* (abliteration) para suprimir los rechazos, modificando los pesos de forma que el modelo responda a un rango más amplio de peticiones sin filtros de seguridad explícitos.

La cuantización EXL3 6.0 bpw fue realizada por Lna-Lab, que además corrigió un fallo en ExLlamaV3 1.4.5 que cargaba incorrectamente los expertos en el layout bf16 de HuggingFace (ignoraba el interleave de gate/up y descartaba los biases de los expertos). El resultado se verificó comparando la capa 0 del MoE con la referencia de transformers, obteniendo un error relativo de 4e-4. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de abliteración más allá de la técnica empleada.

## Capacidades

- Generación de texto y razonamiento multi-step con *reasoning effort* configurable (análisis en `reasoning_content`).
- Tool calling y function calling, con soporte para llamadas a herramientas en formato estructurado (comentarios de herramientas en `tool_calls`).
- Soporte para agentes autónomos y ejecución de código, gracias a su capacidad de tool use y razonamiento.
- Multilingüe: inglés, japonés y chino.
- Modo "uncensored" (abliterated): reduce la tendencia a rechazar peticiones, lo que permite respuestas en dominios donde el modelo original podría negarse.
- Formato *harmony* con `chat_template.jinja` incluido, que separa el razonamiento, las llamadas a herramientas y la respuesta final.

## Casos de uso

- **Asistente de código en local**: el modelo puede integrarse en un IDE o pipeline de CI/CD para generar, revisar y depurar código, aprovechando su tool calling para ejecutar comandos o consultar APIs. Su tamaño (17 GB) permite ejecutarlo en una estación de trabajo con dos GPUs de 16 GB o con offload a CPU.
- **Chat multilingüe**: soporta conversaciones en inglés, japonés y chino, útil para aplicaciones de atención al cliente o asistentes personales en mercados asiáticos.
- **Razonamiento matemático y lógico**: con *reasoning effort* configurable, puede resolver problemas que requieren cadenas de pensamiento largas, como demostraciones o análisis de datos.
- **Agente autónomo con herramientas**: al soportar tool calling y multi-step reasoning, puede orquestar flujos complejos (búsqueda web, llamadas a APIs, ejecución de scripts) en un bucle de agente.
- **Prototipado de aplicaciones sin censura**: para investigación en generación de contenido creativo o simulación de diálogos donde el modelo base rechazaría ciertas peticiones, siempre con las advertencias éticas correspondientes.
- **Despliegue en edge con CPU offload**: con `-mcl 24` (expertos en CPU), el modelo funciona en una sola GPU de 16 GB usando solo 2.4 GB de VRAM, a ~44 tok/s en inglés, adecuado para entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible. Sin embargo, el autor proporciona mediciones de velocidad propias en una RTX PRO 2000 Blackwell 16 GB con ExLlamaV3 1.4.5 y 128 tokens de generación (sin especulación):

| Configuracion | ja (tok/s) | en (tok/s) | code (tok/s) | VRAM |
|---|---|---|---|---|
| TP=2 (2 × 16 GB) | 63 | 75.2 | — | ~8.5 GB / GPU |
| Layer-split, 2 GPUs | 50.4 | 50.2 | 50.1 | 15.2 + 2.2 GB |
| 1 GPU + expertos en CPU (`-mcl 24`) | 41.4 | 44.8 | 42.0 | 2.4 GB |

Prefill (tokens/s a 256 / 1k / 4k / 16k): 2 GPUs — 1.169 / 1.844 / 3.249 / 3.541 (16k en 4.6 s); 1 GPU + CPU — 562 / 1.257 / 2.512 / 2.861 (16k en 5.7 s). El rendimiento multi-stream es monotónico: en TP=2, 1 stream 75 tok/s, 2 streams 107 (53/stream), 4 streams 121 (30/stream), 8 streams 139 (17/stream).

## Requisitos de hardware

- **VRAM estimada**: ~8.5 GB por GPU en tensor parallelism (TP=2), 15.2 + 2.2 GB en layer-split, o 2.4 GB con expertos en CPU (`-mcl 24`).
- **GPUs recomendadas**: RTX PRO 2000 Blackwell 16 GB (usada en las pruebas), o cualquier GPU con 16 GB o más. No cabe en una sola GPU de 16 GB sin offload.
- **Opciones de despliegue**: ExLlamaV3 1.4.5 (con el parche de SlidingAttention descrito en la card del 120B), servidor OpenAI-compatible `lna-lab/serve-gptoss.py` (soporta SSE, `reasoning_effort`, tool calls estructurados). No se menciona compatibilidad con vLLM u otros runners.
- **Latencia y throughput**: ver tabla de rendimiento en la sección anterior. En TP=2, genera ~75 tok/s en inglés; con CPU offload, ~45 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gpt-oss-20b-abliterated-EXL3-6bpw (este) | 21B total, 3.6B activo | 128k | Apache-2.0 | EXL3 6.0 bpw | Abliterado, cuantizado, requiere ExLlamaV3 |
| gpt-oss-20b (original OpenAI) | 21B total, 3.6B activo | 128k | Apache-2.0 | bf16 / MXFP4 | Sin abliterar, pesos originales |
| gpt-oss-120b-abliterated-EXL3-6bpw | 120B total, ~5B activo (estimado) | 128k | Apache-2.0 | EXL3 6.0 bpw | Versión mayor del mismo enfoque |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros MoE de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- **Contenido sin filtrar**: al ser una versión *abliterated*, el modelo puede generar respuestas inapropiadas, ofensivas o peligrosas. No debe usarse en producción sin moderación humana o filtros adicionales.
- **Requisitos de software específicos**: necesita ExLlamaV3 1.4.5 con parches no oficiales (SlidingAttention) y el servidor `lna-lab/serve-gptoss.py`; no es compatible con otros runners sin adaptación.
- **Idiomas limitados**: solo inglés, japonés y chino; el rendimiento en otros idiomas no está garantizado.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede inventar hechos o razonamientos incorrectos, especialmente en tareas de razonamiento largo.
- **Sesgos**: el proceso de abliteración puede amplificar sesgos presentes en el modelo original, y la cuantización puede degradar ligeramente la calidad en comparación con los pesos completos.
- **Restricciones de uso**: aunque la licencia es Apache-2.0, OpenAI mantiene una *usage policy* específica para gpt-oss que debe revisarse antes de su despliegue comercial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sakamakismile/gpt-oss-20b-abliterated-EXL3-6bpw
- Modelo base abliterado: https://huggingface.co/wangzhang/gpt-oss-20b-abliterated
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- Versión 120B abliterada: https://huggingface.co/sakamakismile/gpt-oss-120b-abliterated-EXL3-6bpw
- Anuncio de OpenAI sobre gpt-oss: https://openai.com/index/introducing-gpt-oss/
- Model card oficial de gpt-oss: https://openai.com/index/gpt-oss-model-card/
- Documentación de la API de OpenAI para gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
