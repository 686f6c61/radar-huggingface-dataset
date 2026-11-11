# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen005

## Resumen

Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen005 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ch1c4g0 en el marco del curso «LLM講座2 2026» del laboratorio Matsuo-Iwasawa de la Universidad de Tokio. El modelo está especializado en una tarea concreta: generación de respuestas para un sistema de RAG (retrieval-augmented generation) sobre Wikipedia en japonés, dentro de un concurso interno del curso. No es un modelo de propósito general, sino un artefacto de competición académica con un objetivo muy acotado.

El modelo conserva la arquitectura y el tamaño del base: aproximadamente 873 millones de parámetros en formato safetensors, con la misma estructura, configuración, tokenizador y chat template que Qwen3.5-0.8B. El ajuste se realizó mediante LoRA (r=16, alpha=32, dropout=0.05) sobre las capas lineales del modelo y posteriormente se fusionó en los pesos originales, por lo que no requiere cargar adaptadores adicionales. La licencia es Apache 2.0, heredada del modelo base.

Su relevancia es limitada fuera del contexto del curso: se publica como entrega de una tarea académica, con cero descargas y cero likes en el momento de la consulta, y está entrenado exclusivamente para producir un JSON con una respuesta y el identificador del fragmento de Wikipedia que la sustenta. Resulta útil como ejemplo de pipeline de fine-tuning con LoRA para RAG en japonés, pero no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), misma estructura que Qwen/Qwen3.5-0.8B |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones habituales, pero no se documentan en esta ficha) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 873 millones de parámetros que replica exactamente la arquitectura, configuración, tokenizador, chat template y nombres/formas/tipos de los pesos del modelo base Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`). El ajuste consistió en aplicar LoRA con r=16, alpha=32 y dropout=0.05 sobre las capas lineales del modelo de lenguaje (down_proj, gate_proj, in_proj_a, in_proj_b, in_proj_qkv, in_proj_z, k_proj, o_proj, out_proj, q_proj, up_proj, v_proj), entrenar durante una época y fusionar el delta de LoRA en los pesos originales. El resultado es un checkpoint único sin adaptadores separados.

El entrenamiento se realizó íntegramente en Google Colab, sin uso de APIs externas ni de otros LLM. La tarea aprendida es: dada una pregunta y cinco documentos recuperados, generar un JSON con la forma `{"answer": ..., "chunk_id": ...}`, donde `chunk_id` identifica el documento que respalda la respuesta. El conjunto de entrenamiento consta de 1119 ejemplos construidos a partir de JEMHopQA (train, ver1.2) y de 1000 preguntas muestreadas aleatoriamente de JSQuAD (train, v1.3, parte de JGLUE), a las que se añadieron documentos recuperados de fragmentos de Wikipedia en japonés del dataset del concurso (bumbuboon/llm-course-final-2026). Se eliminaron las preguntas cuyas respuestas no estaban respaldadas por los documentos recuperados. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de respuestas extractivas en japonés a partir de un conjunto de documentos recuperados.
- Producción de salida estructurada en JSON con dos campos: `answer` (texto de la respuesta) y `chunk_id` (índice del documento que la respalda).
- Condicionamiento sobre cinco documentos de contexto en cada consulta (formato fijado por el entrenamiento).
- Capacidad de citar la fuente dentro del corpus recuperado mediante el identificador de fragmento.
- Herencia de las capacidades lingüísticas del modelo base Qwen3.5-0.8B, aunque el ajuste está orientado exclusivamente al japonés y a la tarea de QA sobre Wikipedia.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo «thinking» en la información disponible.

## Casos de uso

- Respuesta generativa en un pipeline RAG sobre Wikipedia en japonés: el modelo recibe la pregunta del usuario y los cinco fragmentos recuperados por el retriever, y devuelve la respuesta junto con el `chunk_id` del fragmento que la sustenta, lo que permite mostrar la cita al usuario final.
- Evaluación de sistemas de recuperación: al devolver el identificador del fragmento utilizado, sirve para medir si el retriever ha colocado el pasaje correcto entre los cinco primeros, integrable en un banco de pruebas de RAG.
- Prototipado académico de fine-tuning con LoRA: el checkpoint fusionado sirve como referencia reproducible de un pipeline completo (preparación de datos, entrenamiento en Colab, fusión de adaptadores) para cursos y talleres.
- Generación de respuestas con trazabilidad documental: en dominios donde se exige indicar la fuente, el formato JSON con `chunk_id` facilita la auditoría de la respuesta sin post-procesado adicional.
- Contestación de preguntas factuales de tipo multi-hop en japonés: el entrenamiento con JEMHopQA incluye preguntas que requieren combinar información de varios documentos, por lo que el modelo está expuesto a ese patrón.
- Base para experimentos de destilación o comparación: al ser un modelo pequeño (873 M) y con licencia Apache 2.0, puede utilizarse como línea base en estudios sobre calidad de RAG con modelos de menos de mil millones de parámetros.
- Despliegue en entornos con recursos limitados: el tamaño reducido permite ejecutarlo en una única GPU de gama consumer para tareas de respuesta sobre corpus japoneses, siempre que se respete el formato de entrada de cinco documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 873 M de parámetros en fp16 se requieren aproximadamente 1,8 GB solo para los pesos, a los que hay que sumar la caché KV y el contexto.
- GPU recomendadas: no disponible. Por tamaño, el modelo es apto para GPU consumer con al menos 4-8 GB de VRAM en precisión reducida, aunque el autor no documenta requisitos.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 6-8 GB o más, aunque no se confirma en la información proporcionada.
- Opciones de despliegue: no disponible. El repositorio solo publica safetensors; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen005 | 873 M | No disponible | Apache 2.0 | QA extractiva en japonés con RAG (JSON + chunk_id) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Apache 2.0 | Modelo generalista multilingüe | Hugging Face, modelo oficial |
| Modelos QA japoneses tipo JEMHopQA/JSQuAD fine-tunes | Variable (cientos de millones a varios miles de millones) | No disponible | Variable según autor | QA sobre Wikipedia en japonés | Hugging Face, disponibilidad variable |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado métricas del modelo en la información proporcionada, y los modelos alternativos de la misma categoría no se especifican con datos numéricos verificables.

## Limitaciones y advertencias

- Modelo de uso muy restringido: entrenado exclusivamente para generar un JSON con `answer` y `chunk_id` a partir de cinco documentos; fuera de ese formato su comportamiento no está garantizado.
- Idioma limitado al japonés: no se documenta soporte de otros idiomas, y el ajuste se realizó solo con datos en japonés.
- Riesgo de alucinación: aunque el entrenamiento elimina preguntas sin respaldo documental, el modelo puede generar respuestas no sustentadas por los fragmentos proporcionados o asignar un `chunk_id` incorrecto.
- Sesgos: los datos provienen de JEMHopQA, JSQuAD y Wikipedia en japonés, por lo que puede heredar sesgos de cobertura y de redacción de esas fuentes.
- Longitud de contexto no documentada: se desconoce la ventana máxima efectiva, lo que dificulta dimensionar el número y tamaño de los fragmentos de entrada en producción.
- Sin métricas publicadas: no hay benchmarks, lo que impide evaluar su calidad frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datasets de entrenamiento tienen sus propias condiciones (JEMHopQA y JSQuAD son CC BY-SA 4.0), lo que puede afectar a la redistribución de datos derivados.
- Madurez: publicación académica con cero descargas y sin mantenimiento documentado; no recomendable como dependencia en producción sin una evaluación propia.
- Entrenamiento en Google Colab durante una sola época y con 1119 ejemplos: riesgo de sobreajuste al formato y de baja generalización a dominios distintos de Wikipedia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen005
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset del concurso: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JGLUE (incluye JSQuAD): https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Wikipedia en japonés: https://ja.wikipedia.org/
