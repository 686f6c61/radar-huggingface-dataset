# brsx-labs/seed-v1-pro

## Resumen

Seed V1 Pro es un modelo de lenguaje de aproximadamente 100 millones de parámetros desarrollado por BRSX Labs, presentado como la variante "agentic" de su familia Seed V1. Se construye sobre `brsx-labs/Seed-v1-base`, pasando por una fase instruct, y añade la capacidad de invocar herramientas externas especializadas: una calculadora matemática (Math) y un recuperador de información (Search). El objetivo declarado es que un modelo pequeño no intente resolver internamente operaciones que se delegan mejor a herramientas deterministas.

La arquitectura es un transformer decoder-only de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención con 4 cabezas KV (Grouped-Query Attention), FFN de 2048 con SwiGLU, RMSNorm, RoPE con theta 10.000, embeddings atados y vocabulario de 32.000 tokens. La longitud de contexto es de 2.048 tokens.

Su relevancia radica en el patrón de diseño: en lugar de escalar parámetros, propone un patrón controlado de "una herramienta, un resultado", sin bucles multi-herramienta. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial e integración en pipelines ligeros. El modelo está orientado a inglés y su implementación de búsqueda es una referencia basada en un fichero `search.jsonl`, no un motor de búsqueda web en vivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RoPE, RMSNorm y SwiGLU |
| Parametros totales | ~100M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |
| Capas | 12 |
| Dimension oculta | 768 |
| Cabezas de atencion | 12 query / 4 KV |
| Tamano FFN | 2.048 |
| Vocabulario | 32.000 tokens |
| RoPE theta | 10.000 |
| Embeddings | atados (input/output) |

## Arquitectura y entrenamiento

Seed V1 Pro es un transformer decoder-only de ~100M parámetros. Usa Grouped-Query Attention con 12 cabezas de consulta y 4 cabezas clave/valor, lo que reduce el coste de memoria del KV cache frente a atención multi-cabeza completa. Cada bloque aplica RMSNorm antes de la atención y del MLP, con conexiones residuales, y el bloque feed-forward sigue la formulación con puerta `SiLU(W₁x) × W₃x` seguida de proyección de salida. La codificación posicional es RoPE con theta 10.000 y los embeddings de entrada están atados a la cabeza de salida.

El pipeline de entrenamiento declarado es: `Seed V1 Base → Instruct → Seed V1 Pro`. La fase Pro se entrena para preservar el comportamiento de seguimiento de instrucciones mientras aprende cuándo y cómo invocar herramientas externas. La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineamiento; estos datos figuran como no disponibles. La innovación técnica destacable no es arquitectónica sino de diseño de interacción: el patrón "single-tool → single-result", que evita bucles multi-herramienta para reducir el estado que el modelo debe gestionar.

## Capacidades

- Generación de texto y seguimiento de instrucciones generales en inglés.
- Uso de herramienta Math para aritmética determinista (por ejemplo, multiplicaciones de operandos grandes delegadas a calculadora).
- Uso de herramienta Search sobre un conjunto de resultados predefinido en `search.jsonl`.
- Interpretación y presentación de resultados devueltos por herramientas en la respuesta final.
- Flujos agenticos ligeros con una única invocación de herramienta por turno.
- Selección de herramienta: el modelo decide entre responder directamente o invocar Math/Search.
- Capacidades multilingües: limitadas al inglés según la model card.
- No soporta bucles multi-herramienta ni razonamiento multi-paso encadenado con varias tools.
- Sin soporte declarado de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistente de cálculo en aplicaciones educativas: el modelo detecta operaciones aritméticas y delega en la herramienta Math para obtener resultados exactos, explicando después el resultado al usuario. Adecuado porque evita errores de aritmética generada directamente por un modelo de 100M.
- Chatbot de soporte con base de conocimiento cerrada: usando la herramienta Search sobre un índice propio (sustituyendo `search.jsonl`), el modelo recupera fragmentos y redacta respuestas. Encaja en dominios acotados donde el corpus es conocido y no se requiere búsqueda web en vivo.
- Enrutador de consultas en pipelines de agentes: dado su bajo coste, puede actuar como primera capa que clasifica si una consulta requiere cálculo, recuperación o respuesta directa, antes de derivar a un modelo mayor.
- Prototipado rápido de flujos con tool calling: sirve como banco de pruebas para validar esquemas de invocación de herramientas y formatos de resultado antes de migrar a modelos mayores.
- Despliegue en dispositivos con recursos limitados: con ~100M parámetros, es viable en CPU o GPUs de gama baja para tareas de instrucción simple y cálculo asistido.
- Automatización de extracción y respuesta sobre registros estructurados: combinado con un backend de búsqueda propio, permite responder preguntas sobre catálogos, inventarios o documentación interna de tamaño moderado.
- Evaluación de técnicas de destilación o alineamiento en modelos pequeños: su pipeline Base → Instruct → Pro documentado lo hace útil como referencia académica para estudiar la incorporación de uso de herramientas en SLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~100M parámetros, en FP16 el peso ronda los 0,2 GB y en cuantización de 8 bits alrededor de 0,1 GB; el consumo real depende del runtime y del KV cache (contexto máximo de 2.048 tokens con 4 cabezas KV).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo no requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama de entrada lo ejecutan con holgura.
- Cabe en GPU consumer: sí, en todas las gamas actuales; también es viable en CPU para baja concurrencia.
- Opciones de despliegue: la model card menciona `chat.py` como script de referencia con las herramientas integradas. No se especifican integraciones oficiales con vLLM, llama.cpp, Ollama o TGI; el formato de pesos no está declarado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Seed V1 Pro | ~100M | 2.048 | SLM con tool calling (Math/Search) | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | ~500M | 32.768 | Instrucción general | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct | ~135M | 8.192 | Instrucción general | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B-Chat | ~1.1B | 2.048 | Chat general | Apache 2.0 | Hugging Face |

La comparación se limita a parámetros, contexto y licencia: no hay datos de benchmarks publicados para Seed V1 Pro que permitan contrastar rendimiento con estas alternativas. Frente a SmolLM2-135M y Qwen2.5-0.5B, Seed V1 Pro ofrece un contexto notablemente menor (2.048 frente a 8.192 y 32.768) y un vocabulario más pequeño (32.000), pero incorpora un patrón de uso de herramientas documentado que los otros no incluyen de serie.

## Limitaciones y advertencias

- Capacidad de razonamiento limitada por el tamaño (~100M); no debe compararse con LLMs grandes en tareas generales.
- Matemáticas avanzadas fuera del alcance de la herramienta Math; solo cubre operaciones aritméticas básicas.
- Sin soporte de bucles multi-herramienta ni razonamiento encadenado con varias tools en la versión actual.
- La herramienta Search está limitada al contenido de `search.jsonl` en la implementación de referencia; no es búsqueda web en vivo y requiere sustituir el backend para uso real.
- El rendimiento en tareas asistidas depende directamente de la disponibilidad y calidad de las herramientas.
- Puede producir respuestas incorrectas cuando no invoca una herramienta o cuando la información externa es insuficiente.
- Riesgo de alucinación no cuantificado; no hay evaluación publicada de sesgos ni de tasas de error.
- Idiomas: solo inglés declarado; no se garantiza comportamiento en castellano u otros idiomas.
- Contexto corto (2.048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del código de ejemplo (`chat.py`) y del backend de búsqueda incluido.
- El modelo está en un estado temprano (144 descargas, 0 likes en el momento de la consulta); no hay evidencia de uso en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/brsx-labs/seed-v1-pro)
- [Modelo base: brsx-labs/Seed-v1-base](https://huggingface.co/brsx-labs/Seed-v1-base)
- [Demo web de chat](https://seed.brsxlabs.com)
