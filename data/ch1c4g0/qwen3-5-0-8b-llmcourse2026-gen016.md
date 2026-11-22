# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen016

## Resumen

Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen016 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ch1c4g0 en el contexto del curso "LLM講座2 2026" del laboratorio Matsuo-Iwasawa de la Universidad de Tokio. El modelo está especializado en generación de respuestas para tareas de question answering con recuperación aumentada (RAG) sobre Wikipedia en japonés, y produce como salida un objeto JSON con la respuesta y el identificador del fragmento de documento que la respalda.

El modelo parte de una arquitectura transformer densa de aproximadamente 873 millones de parámetros (873.438.784 según los pesos en safetensors), con un tamaño de repositorio de 1,8 GB. Se ha entrenado mediante LoRA (r=16, alpha=32, dropout=0,05) durante 3 épocas y posteriormente se han fusionado los pesos adaptadores con los originales, por lo que la estructura, configuración, tokenizador y plantilla de chat son idénticos a los del modelo base.

Su relevancia radica en que ejemplifica el ajuste fino de un modelo pequeño para una tarea muy concreta de RAG en japonés, con un formato de salida estructurado (JSON con `answer` y `chunk_id`) que facilita la integración en pipelines de recuperación y verificación de fuentes. La licencia Apache 2.0 permite uso comercial, aunque el modelo está entrenado exclusivamente para japonés y para el dominio de Wikipedia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), ajustado con LoRA y fusionado |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el modelo base admite cuantizaciones estándar) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Qwen/Qwen3.5-0.8B original: un transformer denso de aproximadamente 873 millones de parámetros. El ajuste se realizó con LoRA (rango 16, alpha 32, dropout 0,05) aplicado a las capas lineales del modelo de lenguaje (`down_proj`, `gate_proj`, `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj`, `v_proj`) durante 3 épocas, tras lo cual los adaptadores se fusionaron en los pesos originales. No se modificaron la estructura, la configuración, el tokenizador, la plantilla de chat ni la forma y tipo de los pesos.

El entrenamiento se llevó a cabo íntegramente en Google Colab, sin uso de APIs externas ni de otros LLM. La tarea de entrenamiento consiste en recibir una pregunta junto con 5 documentos recuperados y generar un JSON con la respuesta y el `chunk_id` del documento que la respalda. Se usaron 2.673 ejemplos construidos a partir de JEMHopQA (train, ver1.2), JSQuAD (train, v1.3, 1.000 preguntas muestreadas), auto-wiki-qa (preguntas multi-salto generadas por reglas de sustitución de cadenas, 1.710 preguntas) y los fragmentos de Wikipedia en japonés del dataset del concurso (bumbuboon/llm-course-final-2026). Todos los datasets de origen tienen licencia CC BY-SA 4.0.

## Capacidades

- Generación de respuestas extractivas y abstractivas a partir de documentos recuperados (RAG) en japonés.
- Salida estructurada en JSON con los campos `answer` (respuesta) y `chunk_id` (identificador del fragmento que respalda la respuesta).
- Manejo de preguntas multi-salto que requieren combinar información de varios documentos.
- Selección del fragmento de evidencia entre 5 documentos de entrada.
- Capacidad de abstenerse o indicar ausencia de evidencia cuando la respuesta no está en los documentos (derivada del filtrado de ejemplos sin respaldo durante el entrenamiento).
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidades multilingües limitadas al japonés según la model card.

## Casos de uso

- Atención al cliente sobre base de conocimiento: el modelo recibe la consulta del usuario y los fragmentos relevantes de una base documental, y devuelve la respuesta junto con el identificador del fragmento fuente, lo que permite citar la evidencia y auditar las respuestas.
- Sistemas de question answering sobre Wikipedia en japonés: integrado en un pipeline de recuperación (por ejemplo, con embeddings y un reranker como BAAI/bge-reranker-v2-m3), genera respuestas con trazabilidad al chunk exacto, adecuado para asistentes de consulta enciclopédica.
- Verificación de fuentes en flujos RAG: el campo `chunk_id` de la salida permite comprobar automáticamente qué documento respalda cada respuesta y descartar o marcar respuestas sin evidencia.
- Preguntas multi-salto en dominios documentales: el entrenamiento con JEMHopQA y auto-wiki-qa lo hace apto para consultas que requieren encadenar información de dos artículos o documentos distintos.
- Prototipado y experimentación educativa: al ser un modelo de 0,8B con licencia Apache 2.0 y entrenado en Colab, sirve como base para reproducir el pipeline de ajuste LoRA en cursos y proyectos de investigación.
- Despliegue en entornos con recursos limitados: su tamaño reducido permite ejecutarlo en una sola GPU de consumo para tareas de QA documental en japonés, con latencia baja en comparación con modelos de mayor tamaño.
- Generación de datasets de QA anotados con evidencia: el formato JSON de salida facilita la creación de conjuntos de datos con pares pregunta-respuesta-fuente para entrenar o evaluar otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en precisión original (fp16/bf16) según el tamaño del repositorio; en cuantización de 8 bits se estima en torno a 1 GB y en 4 bits en torno a 0,5-0,6 GB, aunque estas cifras no están confirmadas en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; para cuantizaciones de 4 bits, GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, dado su tamaño de 0,8B de parámetros.
- Opciones de despliegue: no especificadas en la model card; al mantener el formato safetensors y la arquitectura del modelo base, es compatible con frameworks estándar como Transformers, vLLM, llama.cpp u Ollama, siempre que soporten la arquitectura Qwen3.5 (no confirmado en la información disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen016 | 873 M | No disponible | Japonés | Apache 2.0 | QA con RAG sobre Wikipedia (JSON con chunk_id) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Multilingüe (según modelo base) | Apache 2.0 | Modelo generalista |
| Otros ajustes del mismo curso (gen001-gen0xx) | ~0,8 B | No disponible | Japonés | Apache 2.0 | QA con RAG (variantes del mismo ejercicio) |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para japonés; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Especializado en el dominio de Wikipedia y en el formato de entrada de 5 documentos recuperados; fuera de ese formato o dominio su comportamiento puede degradarse.
- Riesgo de alucinación: aunque el entrenamiento filtra ejemplos sin evidencia, el modelo puede generar respuestas no respaldadas por los documentos o asignar un `chunk_id` incorrecto.
- El campo `chunk_id` depende de que los documentos de entrada sigan la numeración esperada; un pipeline de recuperación distinto puede invalidar la trazabilidad.
- Los datos de entrenamiento derivan de JEMHopQA, JSQuAD y auto-wiki-qa (CC BY-SA 4.0), lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos, aunque la licencia del modelo es Apache 2.0.
- No hay información sobre sesgos específicos, evaluación de seguridad ni pruebas de robustez en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni resultados de evaluación publicados.
- La fecha de creación (2026-11-22) y el contexto de curso sugieren que se trata de un modelo experimental, no de un artefacto listo para producción sin evaluación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen016
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset del concurso: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
