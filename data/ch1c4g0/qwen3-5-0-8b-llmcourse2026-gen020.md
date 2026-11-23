# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen020

## Resumen

Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen020 es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ch1c4g0 como proyecto final del curso "LLM講座2 2026" del laboratorio Matsuo-Iwasawa de la Universidad de Tokio. El modelo está especializado en generación de respuestas para un sistema de RAG (retrieval-augmented generation) sobre Wikipedia en japonés: recibe una pregunta junto con cinco documentos recuperados y devuelve un JSON con la respuesta y el identificador del fragmento que la respalda.

Técnicamente es un transformer denso de aproximadamente 873 millones de parámetros (0,8B), con la misma arquitectura, tokenizador y plantilla de chat que el modelo base. El ajuste se realizó mediante LoRA (r=16, alpha=32, dropout=0,05) sobre las capas lineales del modelo, entrenado durante 3 épocas con 1.889 ejemplos, y posteriormente fusionado en los pesos originales. El resultado se distribuye en formato safetensors con licencia Apache 2.0.

Su relevancia es acotada: se trata de un modelo de curso, orientado exclusivamente al japonés y a una tarea muy concreta (question answering con citación de fuentes). No obstante, ilustra bien el patrón de especialización de modelos pequeños mediante LoRA para tareas de RAG con salida estructurada, un caso de uso frecuente en producción cuando se necesita bajo coste de inferencia y trazabilidad de las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con capas de atención que incluyen proyecciones in_proj_a, in_proj_b, in_proj_qkv, in_proj_z (atención lineal/gated según nomenclatura del modelo base) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura del Qwen3.5-0.8B: un transformer denso con atención que incorpora proyecciones lineales adicionales (in_proj_a, in_proj_b, in_proj_qkv, in_proj_z), lo que sugiere mecanismos de atención con compuertas o lineales propios de la familia Qwen3.5. No se modifican la estructura, la configuración, el tokenizador, la plantilla de chat ni los nombres, formas y tipos de los pesos; solo cambian los valores numéricos tras la fusión del LoRA.

El entrenamiento consistió en un ajuste LoRA (r=16, alpha=32, dropout=0,05) aplicado a las capas lineales down_proj, gate_proj, in_proj_a, in_proj_b, in_proj_qkv, in_proj_z, k_proj, o_proj, out_proj, q_proj, up_proj y v_proj, durante 3 épocas sobre 1.889 ejemplos. La tarea de entrenamiento es: dada una pregunta y cinco documentos recuperados, producir `{"answer": ..., "chunk_id": ...}`. Los datos provienen de JEMHopQA (train v1.2), JSQuAD (train v1.3, 1.000 preguntas muestreadas), auto-wiki-qa (1.710 preguntas multi-salto construidas por reglas de sustitución de cadenas) y fragmentos de Wikipedia japonesa del dataset del curso. Todo el proceso se ejecutó en Google Colab sin APIs externas ni otros LLM. No se menciona RLHF ni DPO.

## Capacidades

- Generación de respuestas extractivas y abstractivas en japonés a partir de contexto documental.
- Salida estructurada en JSON con dos campos: `answer` (texto de la respuesta) y `chunk_id` (índice del documento que respalda la respuesta).
- Question answering multi-salto sobre documentos encadenados (capacidad entrenada explícitamente con auto-wiki-qa).
- Citación de fuentes: el modelo identifica el fragmento de evidencia entre los cinco proporcionados.
- Manejo de preguntas sin respuesta en el contexto (los ejemplos sin fundamento fueron filtrados durante el entrenamiento, por lo que el comportamiento ante preguntas no respondibles no está caracterizado).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al japonés según la model card.

## Casos de uso

- RAG sobre Wikipedia japonesa: el modelo está entrenado específicamente para recibir cinco fragmentos y devolver la respuesta con el `chunk_id` de evidencia, lo que permite construir pipelines de búsqueda aumentada con trazabilidad de fuentes.
- Sistemas de pregunta-respuesta con citación obligatoria: en dominios donde se exige indicar de qué documento proviene cada afirmación, la salida JSON estructurada facilita la verificación automática y la auditoría.
- Evaluación de pipelines de recuperación: al devolver el índice del fragmento usado, sirve como componente para medir la calidad del retriever (si el `chunk_id` apunta al documento correcto, la recuperación fue adecuada).
- Preguntas multi-salto encadenadas: la inclusión de 1.710 ejemplos de auto-wiki-qa con cadenas de dos artículos lo hace adecuado para consultas que requieren combinar información de varios documentos.
- Despliegue de bajo coste en CPU o GPU modesta: con 873M parámetros y licencia Apache 2.0, puede ejecutarse en entornos con recursos limitados para tareas de QA en japonés, aunque no se publican pesos cuantizados.
- Prototipado educativo y experimentación con LoRA: sirve como referencia de cómo especializar un modelo base pequeño para una tarea de salida estructurada con datos públicos y licencias compatibles.
- Filtrado y anotación de corpus: puede usarse para pre-anotar pares pregunta-respuesta con evidencia sobre corpus japoneses, reduciendo el trabajo manual en la construcción de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos (tamaño del repo), más overhead de activaciones y KV cache; en la práctica, entre 2,5 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, ya que no se publican variantes cuantizadas).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente en fp16; para mayor throughput, A10G, L4, A100 o H100.
- Cabe en GPU consumer: sí, en todas las GPU con 8 GB o más; también es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; vLLM y TGI si se convierte el checkpoint; llama.cpp u Ollama requerirían conversión a GGUF, que no está publicada.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen020 | 873M | no disponible | ja | Apache 2.0 | QA con RAG y citación (JSON) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | multilingüe | Apache 2.0 | Propósito general |
| Modelos QA japoneses pequeños (p. ej. ajustes sobre Qwen o Llama de <2B) | <2B | variable | ja | variable | QA extractiva/generativa |

La comparación directa con alternativas concretas no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la especialización en la tarea de RAG con salida JSON y el sesgo hacia el japonés, a costa de perder generalidad multilingüe.

## Limitaciones y advertencias

- Modelo de curso académico: no hay evidencia de evaluaciones independientes ni de uso en producción; los 0 descargas y 0 likes en el momento de la ficha reflejan su carácter experimental.
- Idiomas: la model card declara únicamente japonés; el rendimiento en castellano u otros idiomas no está caracterizado y previsiblemente será deficiente.
- Contexto: la longitud de contexto no está documentada; aunque el modelo base probablemente soporte ventanas amplias, no se confirma para este ajuste.
- Alucinación: al ser un modelo de 0,8B especializado en extracción, puede generar respuestas no respaldadas por los fragmentos; el campo `chunk_id` ayuda a detectarlo, pero no lo elimina.
- Preguntas sin respuesta: los ejemplos sin fundamento fueron filtrados del entrenamiento, por lo que el modelo puede forzar una respuesta aunque ningún fragmento la contenga.
- Sesgos: los datos provienen de Wikipedia japonesa y de datasets académicos (JEMHopQA, JSQuAD, auto-wiki-qa), con los sesgos propios de esas fuentes; no se documenta análisis de sesgo.
- Licencia: Apache 2.0 permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad antes de un uso comercial.
- Formato: solo se distribuyen safetensors; no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en herramientas como Ollama o llama.cpp sin conversión previa.
- Fecha de creación (2026-11-23): verificar la vigencia del modelo base y de los datasets referenciados antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen020
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset del curso: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Wikipedia en japonés: https://ja.wikipedia.org/
