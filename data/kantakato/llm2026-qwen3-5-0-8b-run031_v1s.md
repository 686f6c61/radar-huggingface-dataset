# kantakato/llm2026-qwen3.5-0.8b-run031_v1s

## Resumen

`llm2026-qwen3.5-0.8b-run031_v1s` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario kantakato en Hugging Face. Se trata de un modelo derivado de tipo "merged": el autor aplicó LoRA sobre el modelo original y fusionó los pesos resultantes en el modelo base, de modo que la arquitectura, la forma y el tipo de los tensores, la configuración y el tokenizador son idénticos a los del modelo de partida. El resultado es un checkpoint de aproximadamente 873 millones de parámetros (873.438.784 según los safetensors) empaquetado en un repositorio de 1,8 GB.

El propósito declarado es muy concreto: responder preguntas en japonés utilizando Wikipedia en japonés como fuente documental. El modelo recibe un prompt con material de referencia y debe devolver una respuesta corta junto con el `chunk_id` que justifica la respuesta, en formato JSON. Para ello se entrenó con 729 ejemplos procedentes de cuatro conjuntos de datos de question answering en japonés (auto-wiki-qa, JEMHopQA, JSQuAD y NIILC-QA).

Su relevancia es acotada pero clara: demuestra un flujo de trabajo de ajuste fino ligero (LoRA con r=16) sobre un modelo pequeño y multilingüe, orientado a una tarea de QA con atribución de fuentes ("grounded QA") en un idioma distinto del inglés. No es un modelo de propósito general ni compite en benchmarks abiertos; es un artefacto experimental de un solo autor, con cero descargas y cero "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo no documenta GGUF ni otras variantes) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B original (revision `2fc06364715b967f1860aea9cf38778875588b17`), un transformer decoder-only de la familia Qwen. El autor no documenta en la model card detalles internos como número de capas, dimensiones ocultas, mecanismo de atención o longitud de contexto; únicamente afirma que los nombres, formas y tipos de los pesos, la configuración y el tokenizador coinciden con los del modelo base.

El entrenamiento consistió en un ajuste fino con LoRA de rango 16, alpha 32 y dropout 0,05, con una tasa de aprendizaje de 0,0001, una sola época y 729 ejemplos. Los pesos LoRA se fusionaron posteriormente en el modelo base. La composición del dataset es la siguiente: auto-wiki-qa de cl-nagoya (440 ejemplos, CC BY-SA 4.0), JEMHopQA (90 ejemplos), JSQuAD de JGLUE (143 ejemplos, CC BY-SA 4.0) y NIILC-QA (56 ejemplos). No se documenta el número de tokens de entrenamiento, ni el uso de RLHF, DPO u otras fases de alineamiento posteriores.

## Capacidades

- Generación de texto en japonés, orientada específicamente a question answering con contexto documental.
- Respuesta con atribución de fuente: devuelve un JSON con una respuesta corta y el `chunk_id` del fragmento que la respalda.
- Manejo de prompts con material de referencia (contexto inyectado por el usuario), típico de tareas de lectura comprensiva y QA sobre documentos.
- Capacidad multilingüe heredada del modelo base Qwen3.5, aunque el ajuste fino está declarado únicamente para japonés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento ("thinking") en la información disponible.

## Casos de uso

- **QA sobre Wikipedia en japonés con trazabilidad**: el caso de uso declarado por el autor. Se construye un prompt que incluye fragmentos de artículos etiquetados con `chunk_id` y el modelo devuelve la respuesta más el identificador del fragmento que la sustenta, lo que permite auditar la fuente.
- **Sistemas de recuperación aumentada (RAG) en japonés**: integrado como generador final de un pipeline RAG, el modelo produce respuestas cortas y citables, adecuadas para interfaces que muestran la fuente al usuario.
- **Extracción de respuestas en bases documentales internas**: aplicable a corpus de manuales, normativas o documentación técnica en japonés cuando se necesita una respuesta breve con referencia al pasaje exacto.
- **Prototipado rápido y experimentación académica**: por su tamaño reducido y licencia permisiva, sirve para validar pipelines de QA atribuida antes de escalar a modelos mayores.
- **Evaluación de técnicas de ajuste fino**: el checkpoint es útil como referencia reproducible de un flujo LoRA + merge sobre un modelo pequeño, con hiperparámetros y dataset documentados.
- **Generación de conjuntos de datos sintéticos de QA**: puede emplearse para producir pares pregunta-respuesta-cita sobre documentos en japonés, sujetos a revisión humana posterior.
- **Despliegue en entornos con recursos limitados**: con menos de 1.000 millones de parámetros, es viable en hardware modesto para tareas de baja concurrencia y respuestas cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la documentación. Como referencia orientativa basada en el tamaño (873 millones de parámetros), en fp16 el modelo ocuparía aproximadamente 1,7 GB de pesos, y en cuantizaciones de 8 o 4 bits bajaría a rangos de 0,9 GB y 0,5 GB respectivamente; estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- **GPU recomendadas**: no disponible. Por tamaño, cualquier GPU consumer con al menos 4-6 GB de VRAM podría alojarlo en fp16, pero no hay validación publicada.
- **Compatibilidad con GPU consumer**: probable por el reducido número de parámetros, aunque no confirmada por el autor.
- **Opciones de despliegue**: no disponible. El repositorio solo publica safetensors; no se ofrecen variantes GGUF, Ollama ni integraciones con vLLM o TGI.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| llm2026-qwen3.5-0.8b-run031_v1s | 873 M | no disponible | Apache-2.0 | Hugging Face, safetensors | Ajuste fino para QA en japones con atribucion |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 B | no disponible | Apache-2.0 (segun el derivado) | Hugging Face | Modelo generalista; el derivado hereda su arquitectura |
| Alternativas de QA en japones de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- **Sesgos**: no documentados por el autor. Al entrenarse sobre Wikipedia en japonés y conjuntos académicos, puede heredar los sesgos de cobertura y de redacción de esas fuentes.
- **Riesgo de alucinación**: relevante. El modelo está entrenado para devolver respuestas cortas con un `chunk_id`, pero no se documenta ningún mecanismo que garantice que el identificador citado sea correcto ni que la respuesta esté efectivamente respaldada por el fragmento.
- **Idioma**: el ajuste fino está declarado únicamente para japonés; el rendimiento en castellano u otros idiomas no está evaluado y no debería asumirse.
- **Contexto**: la longitud de contexto no está documentada, lo que impide planificar el tamaño de los fragmentos inyectados en el prompt.
- **Licencia**: los pesos se publican bajo Apache-2.0, pero los datos de entrenamiento tienen licencias propias (CC BY-SA 4.0 para auto-wiki-qa y JSQuAD; JEMHopQA y NIILC-QA según la distribución de origen). El uso comercial puede requerir revisar las obligaciones de atribución y compartir-igual de los datasets.
- **Madurez**: modelo experimental de un único autor, sin descargas ni validación externa, sin benchmarks y sin pipeline declarado. No es recomendable para producción sin una evaluación propia.
- **Formato**: solo se distribuyen safetensors; no hay cuantizaciones listas para usar ni artefactos de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kantakato/llm2026-qwen3.5-0.8b-run031_v1s
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset auto-wiki-qa (cl-nagoya): no disponible enlace directo en la informacion proporcionada
- Dataset JEMHopQA: no disponible enlace directo en la informacion proporcionada
- Dataset JSQuAD (JGLUE): no disponible enlace directo en la informacion proporcionada
- Dataset NIILC-QA: no disponible enlace directo en la informacion proporcionada
