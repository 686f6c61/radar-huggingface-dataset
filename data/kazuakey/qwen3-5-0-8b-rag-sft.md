# kazuakey/qwen3.5-0.8b-rag-sft

## Resumen

Qwen3.5-0.8B RAG SFT es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario kazuakey como parte de una tarea de curso. El modelo está especializado en una tarea concreta de generación aumentada por recuperación (RAG) sobre Wikipedia en japonés: recibe tres pasajes recuperados junto con una pregunta y debe devolver un objeto JSON con la forma `{"answer": ..., "chunk_id": ...}`, identificando tanto la respuesta como el fragmento del que procede.

Técnicamente se trata de un ajuste LoRA que posteriormente se fusionó (merged) de vuelta en la arquitectura original del modelo base, por lo que los pesos distribuidos son los del modelo completo ya modificado. El checkpoint contiene 752.393.024 parámetros en formato safetensors y ocupa aproximadamente 1,5 GB en el repositorio. El modelo base Qwen3.5-0.8B pertenece a la familia Qwen3.5, aunque la información disponible no detalla su arquitectura interna ni su longitud de contexto.

Su relevancia es acotada: no es un modelo de propósito general ni compite con modelos frontera, sino un artefacto educativo que ilustra cómo adaptar un modelo pequeño a una tarea estructurada de extracción de respuestas con citación de fuente. Resulta útil como referencia para quienes construyen pipelines RAG con salida JSON verificable y quieren un ejemplo reproducible de SFT sobre un modelo de menos de mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles oficialmente; el ajuste se entrena sobre Wikipedia en japones |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen3.5 con 752 millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado mediante LoRA, que después se fusionó en los pesos originales, de modo que el resultado es un checkpoint denso convencional sin adaptadores separados. La información disponible no especifica la dimensión oculta, el número de capas, los mecanismos de atención ni la longitud de contexto del modelo base.

El entrenamiento se realizó exclusivamente sobre dos conjuntos de datos de respuesta a preguntas en japonés: JaQuAD (licencia CC BY-SA 3.0 Unported) y JSQuAD, integrado en JGLUE (licencia CC BY-SA 4.0). El preprocesamiento fue mecánico e incluye ventaneo de pasajes (passage windowing) y generación de negativos duros mediante BM25. La tarea de entrenamiento consiste en, dados tres pasajes recuperados y una pregunta, producir un JSON con la respuesta y el identificador del fragmento (`chunk_id`) que la contiene. No se menciona en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de respuestas extractivas en japonés a partir de pasajes de contexto recuperados.
- Salida estructurada en JSON con los campos `answer` y `chunk_id`, lo que facilita el parseo automático.
- Citación de la fuente: el modelo identifica el fragmento concreto del que extrae la respuesta.
- Manejo de hasta tres pasajes de contexto por consulta, según el formato de entrenamiento.
- Ajuste específico para preguntas factuales sobre contenido enciclopédico (Wikipedia en japonés).
- No consta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).
- Capacidades multilingües no documentadas; el comportamiento esperado fuera del japonés es incierto.

## Casos de uso

- Extracción de respuestas con cita en pipelines RAG sobre Wikipedia japonesa: el modelo devuelve el `chunk_id` junto con la respuesta, lo que permite verificar la trazabilidad de cada salida en un sistema de preguntas y respuestas documentales.
- Prototipado educativo de RAG: sirve como ejemplo reproducible de ajuste SFT sobre un modelo pequeño para una tarea estructurada, útil en cursos y talleres de NLP.
- Evaluación de recuperadores: al exigir el identificador del fragmento correcto, el modelo puede emplearse para medir la calidad de un recuperador (por ejemplo, BM25 frente a búsqueda densa) en función de si el `chunk_id` predicho coincide con el esperado.
- Generación de datos sintéticos de QA con anotación de fuente: las salidas JSON pueden alimentar conjuntos de entrenamiento o de validación para otras tareas de extracción.
- Filtrado y enrutamiento de consultas en sistemas documentales: un modelo de 752 millones de parámetros puede ejecutarse en hardware modesto para clasificar y responder consultas simples antes de derivar las complejas a un modelo mayor.
- Despliegue en entornos con recursos limitados: su tamaño reducido permite servir la tarea de extracción en una sola GPU de consumo, con coste bajo por consulta en comparación con modelos de decenas de miles de millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en precisión completa (FP16/BF16) para los 752 millones de parámetros, más el espacio de activaciones y caché KV, que depende de la longitud de contexto (no disponible).
- En cuantización de 8 bits se estima alrededor de 0,8 GB de pesos; en 4 bits, alrededor de 0,4 GB, aunque el autor no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 con contexto moderado; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutarlo sin problema.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: al ser un checkpoint safetensors de la familia Qwen, es compatible con frameworks de inferencia estándar como transformers, vLLM o TGI, siempre que soporten la arquitectura `qwen3_5_text`; no se han publicado conversiones a GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kazuakey/qwen3.5-0.8b-rag-sft | 752 M | no disponible | RAG extractivo en japones con salida JSON | cc-by-sa-4.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 752 M | no disponible | Proposito general | segun model card del base | Hugging Face |
| Modelos QA japoneses tipo BERT (p. ej. ajustes sobre JaQuAD) | variable (tipicamente 100-300 M) | tipicamente 512 tokens | QA extractivo clasico | variable | Hugging Face |

La comparación directa con otros ajustes RAG del mismo tamaño no está disponible en la información proporcionada. Frente al modelo base, la diferencia principal es la especialización en la tarea y el formato de salida JSON; frente a los modelos tipo BERT para QA extractivo en japonés, este modelo ofrece generación de JSON estructurado en lugar de solo localizar el span de respuesta.

## Limitaciones y advertencias

- Modelo de propósito muy específico: fuera de la tarea de RAG sobre Wikipedia en japonés con tres pasajes de entrada, su comportamiento es impredecible.
- Riesgo de alucinación: al ser un modelo generativo pequeño, puede producir respuestas no presentes en los pasajes o asignar un `chunk_id` incorrecto.
- Idiomas: el ajuste se entrena únicamente con datos en japonés; no hay información sobre su rendimiento en castellano u otros idiomas.
- Longitud de contexto no documentada; el formato de entrenamiento asume tres pasajes, por lo que entradas más largas o con otro número de fragmentos pueden degradar la calidad.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- Los datos de entrenamiento (JaQuAD y JSQuAD) están bajo CC BY-SA 3.0 y 4.0 respectivamente, con las obligaciones de atribución que ello implica.
- Es un artefacto educativo de una tarea de curso, con cero descargas y cero likes en el momento de la consulta; no hay evidencia de validación en producción.
- No se han publicado benchmarks, métricas de evaluación ni detalles de hiperparámetros de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kazuakey/qwen3.5-0.8b-rag-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JaQuAD (dataset): https://github.com/SkelterLabsInc/JaQuAD
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
- JGLUE / JSQuAD (dataset): https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
