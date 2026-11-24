# Insometic/Bloom-Calcium-12B-v6.3-GGUF

## Resumen

Bloom Calcium v6.3 es un modelo de lenguaje denso de 12B parámetros publicado por el desarrollador independiente Insometic bajo el paraguas del proyecto `/nsometic`. Se presenta como un ajuste fino (*custom-tuned*) del modelo base `google/gemma-4-12b-it` de Google, empaquetado en formato GGUF con cuantización `Q4_K_M` y orientado explícitamente a inferencia local en GPUs de consumo. El objetivo declarado es ofrecer un modelo capaz de operar con menos de 12 GB de VRAM manteniendo una ventana de contexto completa de 32.768 tokens.

El modelo se distribuye con un ecosistema complementario denominado `/nsometic`, que incluye un embedder multilingüe en ONNX-INT8 sin dependencia de PyTorch, memoria a largo plazo sobre ChromaDB, RAG de espacio de trabajo y un enrutador de razonamiento de tres niveles (`Standard`, `Medium`, `Heavy`). Este enfoque lo posiciona como una propuesta de pila completa para asistentes locales más que como un checkpoint aislado.

La relevancia actual del modelo reside en su propuesta de ejecución completamente local con contexto largo y soporte para cuatro idiomas (alemán, inglés, francés y español), aunque el repositorio presenta un tamaño de 0.0 GB, cero descargas y un único *like*, lo que sugiere un estado de publicación incipiente o incompleto. La licencia es la Gemma Terms of Use, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de `google/gemma-4-12b-it`) |
| Parametros totales | 12B (según model card); el campo de safetensors del repo indica 3.719.336, dato inconsistente con el resto de la informacion |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | `Q4_K_M` (unico archivo publicado: `bloom-calcium-v6.3-Q4_K_M.gguf`) |
| Idiomas soportados | Aleman (DE), ingles (EN), frances (FR), espanol (ES) |
| Licencia | Gemma Terms of Use / Prohibited Use Policy |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de `google/gemma-4-12b-it`, un transformer denso de 12B parámetros. La model card no detalla la composición del dataset de ajuste fino, el número de tokens utilizados, ni si se emplearon técnicas de RLHF, DPO o SFT supervisado. Tampoco se especifican innovaciones arquitectónicas propias más allá de la herencia del modelo base.

El elemento técnico diferencial declarado no reside en el checkpoint en sí, sino en el pipeline de inferencia `/nsometic`: un enrutador de razonamiento de tres niveles (`Standard`, `Medium`, `Heavy`) y un mecanismo de verificación multi-paso denominado `Deep-Path` + `Cryo-Verify`. Según el autor, la puntuación de 77,4 % en MATH-500 se obtuvo dentro de ese pipeline y no en modo de paso único, lo que implica que el rendimiento del `.gguf` aislado será sustancialmente distinto. La configuración recomendada de llama.cpp emplea KV-cache cuantizada en `q4_0` para ambas matrices (K y V), `temp 0.30`, `min-p 0.05` y `repeat-penalty 1.02`.

## Capacidades

- Generación de texto conversacional en alemán, inglés, francés y español.
- Razonamiento matemático multi-paso cuando se integra en el pipeline `Deep-Path` + `Cryo-Verify` del ecosistema `/nsometic`.
- Seguimiento de instrucciones con formato estricto (evaluado en IFEval).
- Contexto largo de 32.768 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Integración con RAG de espacio de trabajo y memoria a largo plazo sobre ChromaDB mediante el ecosistema complementario.
- Embeddings multilingües a través del embedder ONNX-INT8 incluido en `/nsometic` (componente separado del modelo principal).
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Modo *thinking* explícito, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- **Asistente local de escritorio con privacidad estricta**: al ejecutarse en llama.cpp con `Q4_K_M` y caber en GPUs de consumo por debajo de 12 GB, el modelo permite desplegar un asistente conversacional sin enviar datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- **RAG sobre documentación técnica multilingüe**: combinado con el embedder ONNX-INT8 y ChromaDB del ecosistema `/nsometic`, permite construir un sistema de preguntas y respuestas sobre corpus en alemán, inglés, francés y español con una ventana de 32k tokens para inyectar múltiples fragmentos recuperados.
- **Resolución de problemas matemáticos con verificación**: integrado en el pipeline `Deep-Path` + `Cryo-Verify`, el modelo alcanza el 77,4 % en MATH-500 sin herramientas externas, lo que lo hace útil para tutoría matemática o generación de soluciones paso a paso donde se requiera trazabilidad del razonamiento.
- **Generación de texto sujeta a formato estricto**: con un 67,3 % *prompt-strict* y 75,8 % *instruction-strict* en IFEval, es adecuado para tareas de extracción estructurada, generación de JSON o plantillas donde el cumplimiento del formato sea crítico.
- **Procesamiento de documentos largos**: la ventana de 32.768 tokens permite resumir contratos, informes o artículos de investigación extensos en una sola pasada, sin necesidad de chunking agresivo.
- **Prototipado de agentes con enrutador de razonamiento**: el enrutador de tres niveles (`Standard`, `Medium`, `Heavy`) permite asignar dinámicamente la profundidad de cómputo según la complejidad de la consulta, reduciendo latencia en consultas simples y reservando el pipeline pesado para problemas complejos.
- **Investigación sobre ajuste fino de modelos Gemma**: al ser un derivado de `gemma-4-12b-it` con licencia Gemma, sirve como referencia para estudiar técnicas de ajuste fino y cuantización sobre la familia Gemma en entornos de recursos limitados.

## Benchmarks y rendimiento

| Benchmark | Modo / Configuracion | Resultado | Notas |
|---|---|---|---|
| HuggingFaceH4/MATH-500 | `Medium` (Deep-Path + Cryo-Verify) | 77,4 % (387/500) | Sin herramientas externas (sin Python ni web) |
| google/IFEval | `Standard` (Fast-Path), prompt-strict | 67,3 % | TTFT sub-segundo |
| google/IFEval | `Standard` (Fast-Path), instruction-strict | 75,8 % | TTFT sub-segundo |

El autor advierte explícitamente que la puntuación de MATH-500 se midió dentro del pipeline de verificación multi-paso `/nsometic` y que ejecutar el `.gguf` en modo de paso único producirá un comportamiento estándar de un solo turno, presumiblemente inferior. No se han publicado resultados de benchmarks del checkpoint aislado ni comparaciones directas con modelos de referencia en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: entre 10,0 y 11,5 GB en pico con contexto completo de 32k tokens y KV-cache en `q4_0`, según la model card.
- **GPU recomendadas**: no se especifican modelos concretos; el requisito declarado es «menos de 12 GB de VRAM», lo que incluye tarjetas de consumo como RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080 y superiores, así como GPUs profesionales (A100, H100) con holgura.
- **Compatibilidad con GPU de consumo**: sí, el modelo está diseñado explícitamente para GPUs de consumo con menos de 12 GB de VRAM.
- **Opciones de despliegue**: llama.cpp (vía `llama-server`), y por extensión cualquier runtime compatible con GGUF (Ollama, LM Studio, llama-cpp-python). No se menciona soporte para vLLM ni TGI, que no consumen GGUF de forma nativa.
- **Latencia y throughput**: se declara «TTFT sub-segundo» en modo `Standard` (Fast-Path) para IFEval, sin cifras de tokens por segundo. No se proporcionan datos de throughput para el modo `Heavy`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Bloom Calcium v6.3 | 12B (denso) | 32.768 | Gemma Terms of Use | GGUF Q4_K_M | Ajuste fino de `gemma-4-12b-it`; benchmarks solo en pipeline propio |
| google/gemma-4-12b-it | 12B (denso) | no disponible en la informacion | Gemma Terms of Use | safetensors (original) | Modelo base del que deriva Bloom Calcium |
| Alternativas de 12B en GGUF | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de información sobre otros modelos comparables de la misma categoría con datos verificables de rendimiento, contexto y licencia en la documentación proporcionada.

## Limitaciones y advertencias

- **Inconsistencia en el recuento de parámetros**: el campo de safetensors del repositorio indica 3.719.336 parámetros, mientras que la model card declara 12B. Esta discrepancia debe resolverse antes de cualquier uso en producción.
- **Repositorio aparentemente vacío o incompleto**: el tamaño del repo es de 0,0 GB, con cero descargas y un único *like*, lo que sugiere que los pesos pueden no estar disponibles o que la publicación está en estado inicial.
- **Benchmarks no reproducibles de forma independiente**: la puntuación de 77,4 % en MATH-500 depende del pipeline `/nsometic` y no del checkpoint aislado; el propio autor lo advierte.
- **Riesgo de alucinación**: inherente a los modelos de 12B en tareas de razonamiento abierto; no se documentan evaluaciones de factualidad.
- **Licencia restrictiva**: la Gemma Terms of Use y la Prohibited Use Policy imponen restricciones al uso comercial y a determinadas aplicaciones; es obligatorio revisarlas antes de desplegar el modelo en producción.
- **Cobertura idiomática limitada**: solo se declaran cuatro idiomas (DE, EN, FR, ES); no hay información sobre rendimiento en otros idiomas.
- **Ausencia de datos sobre tool calling y agentes**: no se documenta soporte de *function calling* ni de razonamiento agéntico multi-paso fuera del pipeline propietario.
- **Dependencia del ecosistema `/nsometic`**: las capacidades diferenciales (RAG, memoria, enrutador, verificación) residen en componentes externos no incluidos en el `.gguf`, lo que limita la portabilidad.
- **Sin datos de sesgos**: no se han publicado evaluaciones de sesgo, toxicidad o seguridad en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Insometic/Bloom-Calcium-12B-v6.3-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Benchmark MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Benchmark IFEval: https://huggingface.co/datasets/google/IFEval
