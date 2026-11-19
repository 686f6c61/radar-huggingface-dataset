# Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen012

## Resumen

Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen012 es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario Ch1c4g0 como entrega final del curso "LLM講座2 2026" del laboratorio Matsuo-Iwasawa de la Universidad de Tokio. El modelo está especializado en una tarea muy concreta: generación de respuestas dentro de un pipeline de RAG (retrieval-augmented generation) sobre Wikipedia en japonés. Recibe como entrada una pregunta y cinco fragmentos de documentación recuperados, y devuelve un JSON con la respuesta y el identificador del fragmento que la sustenta.

El problema que resuelve es el de la respuesta fundamentada con atribución de fuente en un contexto de QA sobre corpus enciclopédico japonés. En lugar de generar texto libre, el modelo produce una estructura `{"answer": ..., "chunk_id": ...}` que permite verificar la procedencia de la respuesta, algo crítico en sistemas RAG donde la trazabilidad es requisito. El modelo tiene 873.438.784 parámetros (aproximadamente 0,87 mil millones), lo que lo sitúa en la categoría de modelos pequeños desplegables en hardware modesto.

Es relevante ahora porque demuestra un patrón de especialización extrema sobre un modelo base pequeño: en lugar de competir en capacidades generales, se optimiza para una única tarea de producción (QA extractivo con atribución) con un conjunto de datos de solo 7.832 ejemplos y entrenamiento en Google Colab sin APIs externas. Esto lo convierte en un caso de estudio útil sobre cómo adaptar modelos pequeños a tareas verticales con recursos limitados, aunque su alcance queda restringido al dominio y al idioma para el que fue entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia de Qwen3.5-0.8B); el autor no detalla la arquitectura interna más allá de las capas lineales modificadas (down_proj, gate_proj, in_proj_a, in_proj_b, in_proj_qkv, in_proj_z, k_proj, o_proj, out_proj, q_proj, up_proj, v_proj) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | japonés (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y aplica un ajuste fino con LoRA de rango 16, alpha 32 y dropout 0,05 sobre las capas lineales del modelo de lenguaje. Tras una época de entrenamiento, los deltas de LoRA se fusionaron en los pesos originales, de modo que la estructura, configuración, tokenizador, chat template y nombres/formas/tipos de los pesos son idénticos al modelo base. No se introducen cambios arquitectónicos ni se añaden cabeceras nuevas.

El entrenamiento se realizó íntegramente en Google Colab, sin APIs externas ni otros LLM. El conjunto de datos asciende a 7.832 ejemplos construidos a partir de cuatro fuentes en japonés: JEMHopQA (train, ver1.2), JSQuAD (train, v1.3, subconjunto de 1.000 preguntas), NIILC-ECQA2015 (dev, 800 preguntas) y auto-wiki-qa (10.000 preguntas seleccionadas, reducidas a 4.236 tras filtrado). Los ejemplos de JEMHopQA y JSQuAD se repitieron tres veces. Cada ejemplo empareja una pregunta con cinco fragmentos recuperados de Wikipedia japonesa (dataset `bumbuboon/llm-course-final-2026`) y la salida objetivo es el JSON con respuesta y `chunk_id`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de respuestas extractivas en japonés fundamentadas en cinco fragmentos de documentación proporcionados en el prompt.
- Producción de salida estructurada en JSON con dos campos: `answer` (texto de la respuesta) y `chunk_id` (índice del fragmento que contiene la evidencia).
- Atribución de fuente: el modelo identifica cuál de los cinco fragmentos respalda la respuesta, lo que permite trazabilidad en pipelines RAG.
- Manejo de preguntas de tipo hop único y multi-hop (heredado del entrenamiento con JEMHopQA).
- Descarte implícito de preguntas sin evidencia en los fragmentos: durante la construcción del dataset se eliminaron las preguntas cuyas respuestas no aparecían en el contexto recuperado.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe: no disponible; el modelo está entrenado y etiquetado exclusivamente para japonés.

## Casos de uso

- Atención al cliente sobre base de conocimiento cerrada: el modelo recibe la consulta del usuario y cinco fragmentos recuperados de una base documental, y devuelve la respuesta junto con el identificador del fragmento fuente, lo que permite mostrar al usuario el origen de la información y auditar respuestas incorrectas.

- QA sobre documentación interna de empresa: integrado en un pipeline RAG corporativo en japonés, el modelo responde preguntas sobre manuales, políticas o procedimientos citando el fragmento exacto, lo que facilita la verificación por parte de equipos de compliance.

- Sistemas de búsqueda con respuesta directa: en lugar de devolver una lista de enlaces, el sistema recupera fragmentos, los pasa al modelo y presenta una respuesta concisa con referencia al documento original, mejorando la experiencia en portales de documentación técnica.

- Evaluación de pipelines de recuperación: como el modelo devuelve `chunk_id`, puede usarse para medir la calidad del retriever (si el fragmento citado coincide con el esperado, el retriever ha funcionado), lo que lo convierte en una pieza útil en experimentación con sistemas RAG.

- Asistentes educativos sobre Wikipedia japonesa: el modelo puede responder preguntas factuales de estudiantes citando el artículo y fragmento de Wikipedia correspondiente, con la ventaja de que la respuesta es verificable y acotada al material proporcionado.

- Prototipado rápido en entornos con recursos limitados: con menos de 900 millones de parámetros y pesos en safetensors de 1,8 GB, el modelo puede desplegarse en una GPU de consumo o incluso en CPU para pruebas, lo que lo hace adecuado para validar arquitecturas RAG antes de escalar a modelos mayores.

- Extracción de evidencia en flujos de anotación: el campo `chunk_id` puede aprovecharse para pre-anotar qué fragmento de un corpus respalda cada pregunta, acelerando la creación de datasets de QA en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parámetros en precisión completa (fp32) se requieren aproximadamente 3,5 GB solo para pesos; en fp16/bf16, unos 1,75 GB; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, aproximadamente 0,5 GB. Estas cifras son estimaciones a partir del número de parámetros y no están documentadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM en fp16 (GTX 1650, RTX 3050, RTX 4060, T4). Para mayor throughput, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más en fp16, y en 2 GB o más con cuantización de 4 bits.
- Opciones de despliegue: el autor no documenta ninguna. Por el formato safetensors y la arquitectura compatible con transformers, es desplegable mediante transformers, vLLM, TGI o llama.cpp (este último requeriría conversión a GGUF, no incluida en el repo). Ollama también sería viable tras conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen012 | 873 M | no disponible | ja | apache-2.0 | QA extractivo con atribución (RAG Wikipedia japonés) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B (no confirmado en la información) | no disponible | multilingüe (no confirmado) | apache-2.0 | Modelo generalista |
| No disponible | — | — | — | — | — |

No se dispone de información sobre benchmarks ni sobre otros modelos comparables de la misma categoría en la documentación proporcionada. La comparación con el modelo base es la única referencia directa, y se limita a señalar que la estructura y configuración son idénticas, con la diferencia de los pesos ajustados para la tarea de QA.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en japonés y etiquetado con `language: ja`; su uso en otros idiomas no está validado y probablemente produzca resultados deficientes.
- La tarea está fuertemente acotada: espera una pregunta y cinco fragmentos como entrada, y devuelve un JSON con `answer` y `chunk_id`. Fuera de ese formato, el comportamiento no está garantizado.
- Riesgo de alucinación: aunque el entrenamiento filtró preguntas sin evidencia en los fragmentos, el modelo puede generar respuestas que no estén respaldadas por el contexto o citar un `chunk_id` incorrecto, especialmente ante distribuciones de entrada distintas a las de entrenamiento.
- Sesgos conocidos: no documentados por el autor. Al derivar de Qwen3.5-0.8B y entrenarse sobre Wikipedia japonesa, puede heredar sesgos del corpus y del modelo base, pero no se aporta análisis específico.
- Restricciones de licencia: la licencia del modelo es apache-2.0, pero los datos de entrenamiento (JEMHopQA, JSQuAD, NIILC, auto-wiki-qa y Wikipedia) están bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas. Conviene revisar la compatibilidad antes de uso comercial.
- El modelo se creó en el contexto de un curso académico y no ha pasado por un proceso de validación en producción; no hay benchmarks publicados que respalden su calidad frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documenta la longitud de contexto soportada, lo que impide planificar el tamaño máximo de los fragmentos de entrada sin pruebas empíricas.
- El entrenamiento se realizó en Google Colab, lo que sugiere recursos limitados y posiblemente un número reducido de épocas (una) y un dataset pequeño (7.832 ejemplos), con riesgo de sobreajuste al formato y dominio específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ch1c4g0/qwen3.5-0.8b-llmcourse2026-gen012
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset JGLUE (JSQuAD): https://github.com/yahoojapan/JGLUE
- Dataset NIILC-ECQA2015: https://github.com/mynlp/niilc-qa
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset del curso (chunks de Wikipedia japonesa): https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
