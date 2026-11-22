# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen019

## Resumen

`Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen019` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ch1c4g0 en el marco del curso «LLM講座2 2026» del laboratorio Matsuo-Iwasawa de la Universidad de Tokio. El modelo está especializado en una única tarea: generación de respuestas para un sistema de RAG (Retrieval-Augmented Generation) sobre Wikipedia en japonés, dentro de la competición final del curso. El problema que resuelve es acotado pero concreto: dado un par pregunta + cinco fragmentos de documentación recuperados, producir un JSON con la respuesta y el identificador del fragmento que la sustenta.

Arquitectónicamente hereda la estructura del modelo base Qwen3.5-0.8B (transformer denso de aproximadamente 873 millones de parámetros, según los pesos publicados en safetensors), sin cambios en config, tokenizador, chat template ni nombres y formas de los tensores. La modificación consiste en un LoRA (r=16, alpha=32, dropout=0.05) aplicado a las capas lineales del modelo de lenguaje y fusionado posteriormente en los pesos originales. El resultado es un checkpoint de 1,8 GB con licencia Apache 2.0.

Su relevancia es fundamentalmente académica y de nicho: demuestra un flujo completo de ajuste fino con LoRA sobre un modelo pequeño, enteramente en Google Colab, sin APIs externas ni otros LLM, para una tarea de question answering con citación de fuentes en japonés. No está pensado como modelo de propósito general ni cuenta con tracción en la comunidad (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-0.8B; detalles internos no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y conserva íntegramente su arquitectura, configuración, tokenizador, chat template y estructura de pesos. Sobre él se aplicó un LoRA con r=16, alpha=32 y dropout=0.05 en las capas lineales del modelo de lenguaje (`down_proj`, `gate_proj`, `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj`, `v_proj`), entrenado durante 3 épocas. Tras el entrenamiento, la diferencia aprendida se fusionó en los pesos originales («peso original + delta LoRA»), de modo que el checkpoint resultante no requiere cargar adaptadores por separado.

La tarea de entrenamiento consiste en recibir una pregunta junto con cinco fragmentos de documentación recuperados y generar un JSON con la forma `{"answer": ..., "chunk_id": ...}`, donde `chunk_id` identifica el fragmento que respalda la respuesta. Se usaron 1.808 ejemplos construidos a partir de cuatro fuentes: JEMHopQA (train v1.2, CC BY-SA 4.0), 1.000 preguntas muestreadas de JSQuAD (train v1.3, JGLUE, CC BY-SA 4.0), 1.710 preguntas generadas a partir de auto-wiki-qa (CC BY-SA 4.0) mediante reglas de sustitución de cadenas para construir preguntas de dos saltos, y los fragmentos de Wikipedia japonesa del conjunto distribuido en la competición (`bumbuboon/llm-course-final-2026`, CC BY-SA 4.0). En todos los ejemplos se barajó el orden de los cinco fragmentos con una semilla fija. Todo el proceso (creación de datos y entrenamiento) se ejecutó en Google Colab sin APIs externas ni otros LLM.

## Capacidades

- Generación de respuestas extractivas y abstractivas en japonés a partir de contexto documental recuperado.
- Citación de la fuente: emite el identificador del fragmento (`chunk_id`) que respalda la respuesta, en formato JSON estructurado.
- Question answering sobre cinco fragmentos de contexto simultáneos.
- Razonamiento de dos saltos sobre entidades encadenadas (capacidad inducida por los ejemplos sintéticos de auto-wiki-qa).
- Salida estructurada en JSON con las claves `answer` y `chunk_id`.
- Manejo de preguntas sin respuesta en el contexto: los ejemplos sin respaldo documental fueron eliminados del entrenamiento, por lo que el comportamiento ante preguntas no respondibles no está especificado.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Respuesta con citación en un pipeline RAG sobre Wikipedia japonesa: el modelo recibe la pregunta del usuario y los cinco fragmentos recuperados por el retriever, y devuelve la respuesta junto con el `chunk_id` de la fuente, lo que permite mostrar la referencia al usuario y auditar la respuesta.
- Evaluación de sistemas de recuperación: al devolver el identificador del fragmento utilizado, permite medir si el retriever ha colocado el pasaje correcto entre los cinco primeros, sirviendo como componente de un banco de pruebas de RAG.
- Prototipado docente y de investigación: es un ejemplo reproducible de flujo LoRA + fusión de pesos ejecutado íntegramente en Google Colab, útil como plantilla para cursos y experimentos de ajuste fino de bajo coste.
- Question answering de dos saltos sobre entidades encadenadas: los ejemplos sintéticos de auto-wiki-qa le permiten resolver preguntas del tipo «¿qué artículo enlaza con la entidad que...?» dentro del dominio Wikipedia.
- Extracción estructurada de respuestas: al emitir JSON con claves fijas, se integra directamente en pipelines que consumen la salida de forma programática sin post-procesado de lenguaje natural.
- Servicio interno de consulta documental en japonés: para bases de conocimiento de pequeño tamaño donde un modelo de 0,8 B reduce coste de inferencia y requisitos de hardware frente a alternativas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (fp16/bf16): aproximadamente 1,8-2 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 2,5-3 GB.
- Cuantización a 8 bits: aproximadamente 1 GB de pesos; a 4 bits: aproximadamente 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, RTX 3060, etc.); para 4 bits basta con GPUs de 2-3 GB o incluso CPU.
- Cabe en GPU consumer: sí, con holgura, en todas las RTX modernas y en muchas GPUs de portátil.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI y transformers (el repo publica safetensors compatibles con la librería estándar). No se distribuyen pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen019 | 873 M | No disponible | QA con citación sobre Wikipedia japonesa (RAG) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B (no confirmado en la información) | No disponible | Propósito general | Apache 2.0 | Hugging Face |
| Alternativas de ~1 B para QA en japonés | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base más allá de su identificador, por lo que la comparación cuantitativa con alternativas no es posible con la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado exclusivamente para la tarea de QA con cinco fragmentos y salida JSON; su uso como modelo conversacional general degradará la calidad respecto al modelo base.
- Idioma único: solo se declara japonés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Comportamiento indefinido ante preguntas sin respuesta en el contexto: los ejemplos sin respaldo documental fueron filtrados del entrenamiento, por lo que puede alucinar una respuesta o un `chunk_id` inexistente.
- Riesgo de alucinación en la citación: el `chunk_id` generado puede no corresponder realmente al fragmento que sustenta la respuesta; conviene validarlo en producción.
- Sesgos: no documentados por el autor; al entrenarse sobre Wikipedia japonesa y datasets académicos, hereda los sesgos de cobertura y redacción de esas fuentes.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad antes de un uso comercial.
- Sin tracción ni validación externa: 0 descargas y 0 likes; no hay evidencia de evaluación independiente.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con entradas que excedan el contexto del modelo base.
- Repositorio de 1,8 GB con pesos fusionados; no se ofrecen adaptadores LoRA separados ni versiones cuantizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen019
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Datos de la competición (chunks de Wikipedia japonesa): https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Wikipedia en japonés: https://ja.wikipedia.org/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
