# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen004

## Resumen

Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen004 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ch1c4g0 en el marco del curso «LLM講座2 2026» del laboratorio Matsuo-Iwasawa de la Universidad de Tokio. El modelo está especializado en una tarea muy concreta: generación de respuestas para un sistema de RAG (Retrieval-Augmented Generation) sobre Wikipedia en japonés, dentro de una competición interna del curso.

El modelo recibe como entrada una pregunta junto con tres fragmentos de documentación recuperados y debe producir una salida en formato JSON con la respuesta y el identificador del fragmento que la respalda (`{"answer": ..., "chunk_id": ...}`). Se trata, por tanto, de un modelo de question-answering extractivo-generativo con atribución de fuentes, no de un asistente generalista.

Con 873.438.784 parámetros (aproximadamente 0,87 mil millones), es un modelo compacto orientado a despliegue ligero. El ajuste se realizó mediante LoRA (r=16, alpha=32, dropout=0.05) sobre las capas lineales del transformer y posteriormente se fusionó en los pesos originales, por lo que la arquitectura, el tokenizador y la plantilla de chat son idénticos a los del modelo base. No hay información publicada sobre la longitud de contexto efectiva ni sobre resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-0.8B); detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`), un transformer de aproximadamente 0,87 mil millones de parámetros del equipo Qwen (Alibaba Cloud). Sobre él se aplicó un ajuste con LoRA de rango 16, alpha 32 y dropout 0.05, conectado a las capas lineales `down_proj`, `gate_proj`, `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`, `k_proj`, `o_proj`, `out_proj`, `q_proj`, `up_proj` y `v_proj`. El entrenamiento se realizó durante 1 época y, posteriormente, la diferencia de LoRA se fusionó («escrita de vuelta») en los pesos originales, de modo que el modelo resultante no requiere adaptadores separados ni módulos PEFT en inferencia.

El conjunto de entrenamiento consta de 2710 ejemplos construidos a partir de cuatro fuentes en japonés, todas con licencia CC BY-SA 4.0: JEMHopQA (train, ver1.2), JSQuAD (train, v1.3, subconjunto de 1000 preguntas), NIILC (dev de NIILC-ECQA2015, 800 preguntas) y auto-wiki-qa (1500 preguntas, una por artículo). Cada ejemplo se reformateó para incluir la pregunta y tres fragmentos recuperados de Wikipedia japonesa (distribuidos por la competición como `bumbuboon/llm-course-final-2026`), filtrando aquellas preguntas sin respaldo en los fragmentos, y se transformó a la salida JSON con `answer` y `chunk_id`. Todo el proceso de creación de datos y entrenamiento se ejecutó en Google Colab, sin uso de APIs externas ni de otros LLM. No se documenta el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional.

## Capacidades

- Generación de respuestas extractivas a preguntas en japonés, condicionadas a un contexto de tres fragmentos documentales.
- Atribución de la respuesta a la fuente: emite el `chunk_id` del fragmento que respalda la respuesta, en formato JSON.
- Formato de salida estructurado y consistente (`{"answer": ..., "chunk_id": ...}`), adecuado para pipelines automatizados.
- Seguimiento de instrucciones dentro de la plantilla de chat del modelo base Qwen3.5.
- Capacidad multilingüe limitada al japonés según la model card (el modelo base podría tener más idiomas, pero el ajuste está orientado exclusivamente a japonés).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo «thinking».

## Casos de uso

- Generación de respuestas en un sistema RAG sobre Wikipedia japonesa: el modelo recibe la pregunta del usuario y los tres fragmentos recuperados por el retriever y devuelve la respuesta junto con el identificador del fragmento que la sustenta, lo que permite mostrar citas verificables al usuario.
- Evaluación de pipelines de recuperación: al devolver el `chunk_id` utilizado, sirve como componente de un banco de pruebas para medir si el retriever está aportando los fragmentos correctos en cada consulta.
- Asistentes de consulta documental con trazabilidad: en entornos donde se exige indicar la fuente de cada afirmación (por ejemplo, atención interna o soporte sobre bases documentales), el formato JSON con atribución facilita la auditoría.
- Prototipado rápido en entornos con recursos limitados: con menos de mil millones de parámetros, puede ejecutarse en hardware modesto (incluida una GPU de consumo) para validar flujos de RAG antes de escalar a modelos mayores.
- Filtrado y validación de pares pregunta-respuesta: integrado en un pipeline de curación de datasets en japonés, puede comprobar si una respuesta propuesta está respaldada por un fragmento concreto.
- Educación y experimentación académica: como artefacto de un curso, sirve de ejemplo reproducible de ajuste LoRA sobre un modelo pequeño para una tarea de QA con atribución, ejecutable íntegramente en Google Colab.
- Despliegue en sistemas de búsqueda interna en japonés: indexando documentación propia en fragmentos y usando el modelo para responder con referencia al fragmento, siempre que la tarea encaje en el formato de tres fragmentos de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 873 millones de parámetros; en precisión completa (FP32) ocuparía aproximadamente 3,5 GB solo en pesos, en FP16/BF16 unos 1,75 GB, y en cuantización de 8 bits alrededor de 0,9 GB. Estas cifras son estimaciones por tamaño y no proceden de mediciones publicadas.
- GPU recomendadas: no se especifican en la documentación. Por tamaño, cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o superiores, así como en A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM en FP16, aunque no hay confirmación oficial.
- Opciones de despliegue: al ser un modelo de la familia Qwen con pesos en safetensors, es compatible con frameworks estándar como Transformers, vLLM o TGI; no se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen004 | 873 M | No disponible | Japonés | Apache 2.0 | QA con atribución sobre RAG en japonés |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Multilingüe (según modelo base) | Apache 2.0 | Modelo generalista |
| Otros ajustes del mismo curso | No disponible | No disponible | Japonés | Apache 2.0 (previsiblemente) | QA sobre Wikipedia japonesa |

La comparación con alternativas de la misma categoría (modelos de menos de mil millones de parámetros para QA en japonés) no está disponible en la información proporcionada. El único punto de referencia documentado es el modelo base, del que este se diferencia exclusivamente por el ajuste LoRA fusionado y la especialización en el formato de salida JSON.

## Limitaciones y advertencias

- Especialización muy estrecha: el modelo está entrenado para una única tarea (pregunta + tres fragmentos → JSON con respuesta y `chunk_id`); su comportamiento fuera de ese formato no está documentado y probablemente sea deficiente.
- Idiomas: la model card declara únicamente japonés; no hay evidencia de buen rendimiento en castellano u otros idiomas.
- Riesgo de alucinación: aunque el entrenamiento filtra preguntas sin respaldo en los fragmentos, no se documenta ninguna evaluación de fidelidad; el modelo podría generar respuestas no sustentadas o asignar un `chunk_id` incorrecto.
- Sesgos: no se documenta ningún análisis de sesgos; los datos de entrenamiento provienen de Wikipedia y de datasets académicos en japonés, con los sesgos inherentes a esas fuentes.
- Contexto: se desconoce la longitud máxima de contexto efectiva; el entrenamiento usa tres fragmentos, y un número distinto podría degradar el rendimiento.
- Licencia: Apache 2.0 permite uso comercial, pero los datos de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas de esos datos; conviene revisar la compatibilidad antes de un uso comercial.
- Madurez: el repositorio tiene 0 descargas y 0 «likes», fue creado y actualizado el mismo día (10 de noviembre de 2026) y no cuenta con evaluación independiente; no es apto para producción sin validación propia.
- Sin datos de benchmarks ni de latencia: no es posible estimar su calidad relativa frente a alternativas sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen004
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- Dataset NIILC-ECQA2015: https://github.com/mynlp/niilc-qa
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset de la competición (chunks de Wikipedia japonesa): https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Wikipedia en japonés: https://ja.wikipedia.org/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
