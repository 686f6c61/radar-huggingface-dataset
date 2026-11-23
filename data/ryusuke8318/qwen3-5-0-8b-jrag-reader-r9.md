# ryusuke8318/Qwen3.5-0.8B-JRAG-Reader-r9

## Resumen

Qwen3.5-0.8B-JRAG-Reader-r9 es un ajuste fino por LoRA del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario ryusuke8318 en Hugging Face. El modelo está especializado en tareas de generación aumentada por recuperación (RAG) sobre Wikipedia en japonés, concretamente en responder consultas de dos etapas encadenadas ("2段の直列の問い") y devolver la respuesta junto con el identificador del fragmento de evidencia. Con 873.438.784 parámetros reales (según los pesos en safetensors), es un modelo compacto orientado a inferencia de bajo coste.

El problema que aborda es específico: dado un conjunto de fragmentos recuperados de Wikipedia japonesa (incluyendo fragmentos distractores de artículos cercanos semánticamente), el modelo debe seleccionar la evidencia correcta y producir un JSON con los campos `answer` y `chunk_id`. La entrada sigue el mismo formato que el `answer_prompt` del notebook de competición del autor, lo que lo vincula a un flujo de trabajo concreto de evaluación RAG.

Es relevante por su enfoque de entrenamiento con datos sintéticos generados por reglas y plantillas (sin intervención de LLM) a partir de JSQuAD, JEMHopQA, JaQuAD y auto-wiki-qa, y por demostrar que un modelo sub-1B puede especializarse en una tarea de lectura extractiva con contexto estructurado. La licencia Apache 2.0 facilita su reutilización, aunque el idioma soportado declarado es únicamente japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste fino por LoRA con fusión de pesos |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se ajusta mediante LoRA con rango 32, tasa de aprendizaje 1e-4, una época y precisión bf16, fusionando después los pesos adaptadores en el modelo base. No se especifican en la información disponible detalles sobre la arquitectura interna del base (número de capas, dimensiones ocultas, mecanismo de atención) ni la longitud de contexto nativa.

El entrenamiento se realizó sobre dos conjuntos: 3.090 ejemplos de consultas de dos etapas encadenadas y 1.500 ejemplos del ajuste previo (r6). Las consultas de dos etapas se construyeron de forma mecánica, concatenando por nombre de artículo las preguntas de los conjuntos de entrenamiento de auto-wiki-qa, JSQuAD y JaQuAD mediante reglas y plantillas, sin uso de LLM. Los documentos de contexto incluyen los fragmentos de evidencia de primera y segunda etapa, más fragmentos de otros artículos seleccionados por proximidad de embeddings con el modelo Ruri como distractores. El conjunto de evaluación propio (dev/test) y el fichero de preguntas de la competición no se usaron en el entrenamiento. Las fuentes de datos son JSQuAD (CC BY-SA 4.0), JEMHopQA (CC BY-SA 4.0), JaQuAD (CC BY-SA 3.0), auto-wiki-qa (CC BY-SA 4.0) y fragmentos derivados de Wikipedia japonesa (CC BY-SA 4.0).

## Capacidades

- Generación de texto en japonés con formato de salida JSON estructurado (`{"answer", "chunk_id"}`).
- Lectura extractiva sobre contexto RAG: localización de la respuesta dentro de fragmentos recuperados.
- Razonamiento multi-paso limitado a consultas de dos etapas encadenadas (pregunta compuesta que requiere resolver una entidad intermedia).
- Discriminación entre fragmentos de evidencia y fragmentos distractores semánticamente próximos.
- Seguimiento de un formato de prompt específico (equivalente al `answer_prompt` del notebook de competición del autor).
- No se declara soporte de tool calling, function calling, agentes autónomos, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: no disponible; el modelo declara únicamente japonés.

## Casos de uso

- Respuesta extractiva sobre Wikipedia japonesa: integrar el modelo como "reader" en un pipeline RAG donde un retriever (por ejemplo, embeddings de Ruri) aporte fragmentos candidatos y el modelo devuelva la respuesta y el `chunk_id` de la evidencia, reduciendo la carga de un LLM mayor.
- Preguntas compuestas de dos saltos: resolver consultas que requieren identificar primero una entidad y después un atributo de esa entidad, usando los fragmentos encadenados como contexto, gracias al entrenamiento específico con 3.090 ejemplos de este tipo.
- Desambiguación de evidencia con distractores: en recuperación con fragmentos de artículos cercanos, el modelo está entrenado para descartar fragmentos plausibles pero incorrectos y seleccionar el `chunk_id` correcto.
- Evaluación y prototipado de sistemas RAG en japonés: al ser un modelo de 873 M de parámetros con licencia Apache 2.0, permite iterar rápidamente sobre pipelines de recuperación sin coste elevado de GPU.
- Filtrado de contexto en producción de bajo coste: usar el modelo como etapa de re-ranking o verificación de evidencia antes de pasar la consulta a un modelo generativo mayor, reduciendo tokens de entrada y alucinaciones.
- Investigación sobre datos sintéticos por reglas: reproducible como referencia para estudiar el efecto de entrenamiento con plantillas y distractores por embeddings en tareas de lectura extractiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,75 GB solo para pesos (873 M de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5 GB (no se publican ficheros GGUF en el repositorio).
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: transformers con safetensors (formato publicado); conversión a GGUF para llama.cpp u Ollama posible pero no publicada; vLLM y TGI son viables tras conversión, aunque para este tamaño el beneficio es limitado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Especialización |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-JRAG-Reader-r9 | 873 M | no disponible | ja | Apache 2.0 | RAG extractivo japonés, consultas de dos etapas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | multilingüe (según base) | Apache 2.0 | Generación general |
| Modelos reader RAG japoneses (p. ej., ajustes sobre Ruri o BERT japonés) | variable | variable | ja | variable | Lectura extractiva |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, licencia y especialización declarada.

## Limitaciones y advertencias

- El modelo solo declara soporte de japonés; su uso en otros idiomas no está validado y probablemente degrade.
- Especialización estrecha: está entrenado para un formato de prompt concreto y una salida JSON con `answer` y `chunk_id`; usarlo fuera de ese esquema puede producir salidas malformadas.
- Riesgo de alucinación: como modelo generativo, puede producir respuestas no presentes en los fragmentos de contexto, especialmente si la evidencia no está en el contexto proporcionado.
- Sesgos: los datos de entrenamiento provienen de Wikipedia japonesa y conjuntos QA académicos, con los sesgos de cobertura y sesgo de género/geográfico propios de esas fuentes.
- Datos de entrenamiento con licencias CC BY-SA (3.0 y 4.0): aunque el modelo se distribuye como Apache 2.0, la procedencia de los datos puede imponer obligaciones de atribución o share-alike sobre derivados según jurisdicción; conviene revisar antes de uso comercial.
- Sin datos publicados de benchmarks, contexto máximo ni cuantizaciones oficiales; el rendimiento en producción debe validarse con un conjunto propio.
- Modelo con 2 descargas y 0 likes en el momento de la ficha: madurez y mantenimiento no verificables.
- No se declara soporte de tool calling ni de agentes; no debe asumirse en diseños de sistemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryusuke8318/Qwen3.5-0.8B-JRAG-Reader-r9
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JSQuAD (JGLUE): https://github.com/yahoojapan/JGLUE
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JaQuAD: https://huggingface.co/datasets/SkelterLabsInc/JaQuAD
- auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
