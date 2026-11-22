# jcbtc/Inkling-2-Mini-CIRU-Halo-Agent-gfx1151

## Resumen

Inkling 2 Mini · CIRU Halo Agent (gfx1151) es una distribución optimizada del modelo multimodal Inkling 2 Mini de Thinking Machines Lab, empaquetada por el usuario jcbtc (CIRU) para su ejecución local sobre hardware AMD Strix Halo, concretamente el Ryzen AI Max+ 395 con gráficos Radeon 8060S y 128 GB de memoria unificada. El repositorio combina el checkpoint original del modelo base (en cuantización de 8 bits, formato safetensors) con pesos de expertos ajustados por CIRU y un draft checkpoint para decodificación especulativa DSpark, todo servido mediante una build propia de vLLM sobre ROCm.

El modelo resuelve el problema de desplegar un LLM multimodal de aproximadamente 26.400 millones de parámetros en una plataforma de consumo profesional sin GPU discreta, aprovechando los núcleos matriciales RDNA 3.5 y un presupuesto de contexto por defecto de 1.048.576 tokens. La propuesta es relevante para desarrolladores que quieren inferencia local con API compatible con OpenAI, soporte nativo de tool calling, streaming de razonamiento y capacidad de imagen a texto, sin depender de infraestructura cloud.

La ficha se centra en las características observables del repositorio y en los datos de rendimiento publicados en su model card. La información sobre arquitectura interna, datos de entrenamiento y benchmarks académicos del modelo base no está disponible en los materiales proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), con soporte de decodificación especulativa DSpark; detalles internos no disponibles |
| Parametros totales | 26.388.646.440 (≈26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens por defecto en la configuración de 128 GB (configurable con `--context`) |
| Tipos de cuantizacion | 8 bits (modelopt) en el checkpoint publicado; no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta además a la Model Acceptable Use Policy de Thinking Machines Lab) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio distribuye el checkpoint original de Thinking Machines Lab junto con pesos de expertos ajustados por CIRU y un draft checkpoint DSpark para decodificación especulativa de siete tokens. La model card describe el uso de núcleos matriciales RDNA 3.5 para acelerar las proyecciones de expertos, atención optimizada para prompts largos y grafos HIP para la decodificación de una sola petición, lo que sugiere una arquitectura con componentes tipo mezcla de expertos, aunque el número de parámetros activos y la topología exacta no se especifican en la información disponible.

No se detallan en la documentación proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es la integración del runtime: build de vLLM sobre ROCm, kernels Triton ajustados para gfx1151, decodificación especulativa DSpark y una API compatible con OpenAI que acepta texto e imágenes. El encoder de visión nativo para ROCm se añadió en la versión 1.1 del paquete.

## Capacidades

- Generación de texto y razonamiento con streaming del proceso de pensamiento.
- Procesamiento multimodal imagen-texto: acepta una imagen junto a una pregunta de texto mediante el preset `vision`.
- Tool calling nativo (function calling) en la API compatible con OpenAI.
- Decodificación especulativa DSpark para acelerar la generación.
- Contexto largo: hasta 1.048.576 tokens por defecto, con benchmarks publicados hasta 65.536 tokens.
- Soporte de salidas estructuradas (JSON) y tareas de matemáticas y código Python según las cargas de trabajo medidas.
- Servicio concurrente de múltiples peticiones con caché KV compartida.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente local con imágenes: el preset `vision` permite enviar capturas de pantalla o fotografías junto a una consulta de texto, útil para soporte técnico interno o análisis de documentación escaneada sin salir del equipo.
- Procesamiento de documentos largos: con contexto de hasta 1.048.576 tokens y un throughput de 788,5 tok/s de prompt a 65.536 tokens, es adecuado para resumir o extraer información de contratos, informes o bases de código extensas en una sola pasada.
- Agentes con tool calling: la API compatible con OpenAI y el soporte nativo de function calling permiten integrar el modelo en flujos de agentes que consultan APIs, bases de datos o sistemas internos.
- Generación de código en local: los benchmarks de la model card incluyen una carga de Python con 69,79 tok/s en el checkpoint original, lo que lo hace viable para autocompletado y revisión de código en un entorno de desarrollo sin conexión.
- Despliegue en estación de trabajo AMD: al ejecutarse sobre Ryzen AI Max+ 395 con 128 GB de memoria unificada, permite montar un endpoint de inferencia privado para equipos pequeños sin GPU discreta.
- Evaluación e investigación de decodificación especulativa: el repositorio incluye el draft checkpoint DSpark y los pesos ajustados, lo que facilita reproducir y medir el impacto de la decodificación especulativa en hardware RDNA 3.5.
- Prototipado de aplicaciones multimodales: la API compatible con OpenAI con streaming de razonamiento simplifica la migración desde servicios cloud a un backend local durante el desarrollo.

## Benchmarks y rendimiento

Rendimiento medido en Ryzen AI Max+ 395 con Radeon 8060S y 128 GB de memoria unificada, según la model card:

| Carga de trabajo | Resultado |
|---|---|
| Prompt de 512 tokens | 1.279,6 tok/s, 0,40 s hasta el primer token |
| Prompt de 2.048 tokens | 1.645,0 tok/s, 1,24 s hasta el primer token |
| Prompt de 3.840 tokens | 1.691,3 tok/s, 2,27 s hasta el primer token |
| Prompt de 8.192 tokens | 1.640,8 tok/s, 4,99 s hasta el primer token |
| Prompt de 32.768 tokens | 1.248,3 tok/s, 26,25 s hasta el primer token |
| Prompt de 65.536 tokens | 788,5 tok/s, 83,11 s hasta el primer token |
| Decodificación, una petición (media de salida estructurada, matemáticas y Python) | 74,13 tok/s |
| Decodificación, una petición con prompt de 32K | 63,69 tok/s |
| Decodificación, una petición con prompt de 64K | 54,08 tok/s |
| Ocho peticiones concurrentes, agregado | 88,92 tok/s |

Checkpoint original de Thinking Machines Lab con el mismo runtime:

| Carga de trabajo | Resultado |
|---|---|
| Prompt de 3.900 tokens | 1.494,6 tok/s de entrada, 2,61 s hasta el primer token |
| Decodificación en tarea JSON estructurada | 84,12 tok/s |
| Decodificación en tool calling nativo | 79,73 tok/s |
| Decodificación en tarea de código Python | 69,79 tok/s |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 22,8 GB en safetensors de 8 bits; la configuración de referencia usa 128 GB de memoria unificada, con presupuesto de caché KV configurable mediante `--kv-mib`.
- GPU recomendada: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, RDNA 3.5). No se documenta compatibilidad con otras GPU en la información disponible.
- GPU de consumo: el objetivo es precisamente hardware de consumo profesional con memoria unificada; no se indica funcionamiento en GPU discretas de consumo como RTX 4090.
- Despliegue: vLLM con build ROCm de CIRU, instalable desde el repositorio GitHub companion; la API es compatible con OpenAI. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; el tiempo hasta el primer token oscila entre 0,40 s (512 tokens) y 83,11 s (65.536 tokens), y la decodificación entre 54,08 y 88,92 tok/s según la carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini · CIRU Halo Agent (gfx1151) | ≈26,4 mil millones | 1.048.576 tokens (por defecto) | Apache 2.0 | Hugging Face, runtime ROCm propio |
| Inkling 2 Mini (original, Thinking Machines Lab) | ≈26,4 mil millones (mismo checkpoint base) | no disponible en la información | Apache 2.0 con política de uso aceptable | Hugging Face |
| Otros modelos de tamaño similar | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento de modelos alternativos que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La distribución está optimizada y medida exclusivamente para AMD Strix Halo (gfx1151); no se documenta su funcionamiento en otras plataformas.
- La licencia Apache 2.0 del repositorio convive con la Model Acceptable Use Policy de Thinking Machines Lab, que puede imponer restricciones adicionales al uso comercial del modelo base.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo.
- El contexto por defecto de 1.048.576 tokens comparte una única caché KV entre peticiones activas, por lo que cargas concurrentes largas pueden degradar el rendimiento o requerir ajuste de `--kv-mib`.
- Los benchmarks publicados son de rendimiento (throughput y latencia), no de calidad; no hay evidencia en la información disponible sobre exactitud en tareas académicas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.
- La cuantización de 8 bits puede introducir pérdida de calidad respecto al checkpoint original en precisión completa; no se cuantifica esa pérdida en la documentación.

## Enlaces

- Hugging Face: https://huggingface.co/jcbtc/Inkling-2-Mini-CIRU-Halo-Agent-gfx1151
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Runtime en GitHub: https://github.com/ciru-ai/Inkling-2-Mini-CIRU-Halo-Agent-gfx1151
- Guía de instalación: https://huggingface.co/jcbtc/Inkling-2-Mini-CIRU-Halo-Agent-gfx1151/blob/main/INSTALL.md
- vLLM: https://github.com/vllm-project/vllm
- Transformers: https://github.com/huggingface/transformers
- Triton: https://github.com/triton-lang/triton
- PyTorch: https://pytorch.org/
- AMD ROCm: https://github.com/ROCm
