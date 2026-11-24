# iamrodrigocoelho/gemma-4-e2b-refauna-GGUF

## Resumen

Gemma 4 E2B · Refauna es un modelo de lenguaje especializado en defaunación, refaunación, reintroducción de fauna, dispersión de semillas y conservación de la Mata Atlántica, desarrollado por el proyecto Refauna (iniciativa brasileña activa desde 2010 que reintroduce vertebrados localmente extintos en remanentes de Mata Atlántica en Río de Janeiro). Se trata de un ajuste fino del modelo base `google/gemma-4-e2b-it` mediante QLoRA de 4 bits con la librería Unsloth, orientado a responder en portugués de Brasil citando los fragmentos recuperados y absteniéndose cuando la respuesta no está en el contexto.

El modelo está entrenado en estilo RAFT (Retrieval-Augmented Fine-Tuning): aprende a usar pasajes recuperados, citarlos como `[n]` y declarar explícitamente cuando no encuentra la información, en lugar de inventarla. Con 4.647.450.147 parámetros totales y un tamaño de repositorio de 9,4 GB en formato GGUF, está pensado para desplegarse junto a un pipeline RAG ligero, incluso en hardware de consumo.

La relevancia actual radica en su enfoque: un modelo pequeño (categoría SLM) especializado verticalmente en un dominio científico concreto, con evaluación explícita de fidelidad, tasa de citación correcta y abstención correcta. Este repositorio concreto contiene las cuantizaciones GGUF (Q4_K_M y Q8_0) del modelo mesclado en 16 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante E2B); incluye proyector de visión en el modelo base, no usado en este proyecto |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF); el ajuste se realizó en QLoRA 4-bit |
| Idiomas soportados | pt (portugués de Brasil), en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo mesclado de origen |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e2b-it` (Apache 2.0), cargado vía `unsloth/gemma-4-E2B-it`. El ajuste se realizó con QLoRA de 4 bits: r=16, alpha=16, 2 épocas, learning rate 0,0002, pérdida calculada solo sobre la respuesta (`train_on_responses_only`) y únicamente sobre las capas de lenguaje. Se empleó la plantilla de chat `gemma-4` sin modo thinking.

El conjunto de datos de entrenamiento consta de 942 ejemplos sintéticos en portugués de Brasil generados a partir de 22 trabajos del proyecto Refauna con texto (10 artículos, 4 resúmenes en anales, 4 trabajos de iniciación científica, 2 capítulos de libro, 1 artículo en boletín y 1 disertación). El formato sigue el estilo RAFT: aproximadamente el 60 % de los ejemplos incluye el fragmento correcto entre 3 distractores y una respuesta que cita `[n]`; cerca del 15 % presenta contexto sin la respuesta (para entrenar la abstención); y el 25 % restante no incluye contexto. Los datos se deduplicaron, se revisaron humanamente de forma muestral y se dividieron por documento, de modo que los documentos de test quedan fuera del entrenamiento. El entrenamiento se ejecutó en una NVIDIA L4 durante 27,8 minutos con un pico de 10,57 GB de VRAM. La recuperación usada tanto en entrenamiento como en evaluación combina `google/embeddinggemma-300m` con BM25 y fusión RRF (k=60), top-4.

## Capacidades

- Generación de texto en portugués de Brasil con registro didáctico y preciso sobre temática de conservación.
- Respuesta fundamentada en contexto recuperado (RAG): usa hasta 4 fragmentos numerados y cita los empleados en formato `[n]`.
- Abstención explícita: declara cuando la respuesta no está en los documentos proporcionados, en lugar de inventar datos, cifras, fechas o nombres de especies.
- Comprensión de literatura científica del dominio: defaunación, refaunación, reintroducción de fauna, dispersión de semillas, interacciones ecológicas y conservación de la Mata Atlántica.
- Soporte de conversación multi-turno mediante plantilla de chat `gemma-4` (sin modo thinking).
- Capacidad multilingüe limitada a portugués e inglés según la model card; el entrenamiento específico es en PT-BR.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes en la información disponible.
- El modelo base incluye proyector de visión, pero este proyecto es solo de texto y no lo utiliza.

## Casos de uso

- Asistente RAG para investigadores y gestores de conservación: recibir una pregunta y hasta 4 fragmentos recuperados de la literatura Refauna, y devolver una respuesta citada con `[n]`. Adecuado por su entrenamiento específico en ese formato y su capacidad de abstención.
- Consulta de literatura científica interna: indexar los 22 trabajos del corpus Refauna con `embeddinggemma-300m` + BM25 y usar el modelo para sintetizar respuestas con trazabilidad a la fuente, evitando afirmaciones sin respaldo.
- Divulgación y educación ambiental: generar explicaciones didácticas en PT-BR sobre defaunación y reintroducción de especies para público no especializado, con la cautela de que las respuestas deben ir ancladas a contexto recuperado.
- Apoyo a la redacción de informes técnicos: borradores de secciones descriptivas a partir de pasajes seleccionados de artículos y disertaciones, con citas explícitas que facilitan la verificación posterior.
- Despliegue en hardware de consumo para demos y talleres: con la variante solo-texto del Modelfile, el pico de memoria en un MacBook Air M1 de 8 GB baja de 6,55 GB a 5,70 GB, lo que permite ejecutar la demo en portátiles modestos.
- Prototipado de pipelines RAG especializados: servir como referencia para comparar con el modelo hermano Qwen3.5-2B · Refauna usando el mismo corpus, prompt y evaluación.
- Filtro de abstención en sistemas de preguntas y respuestas: usar la tasa de abstención correcta (88 %) y la ausencia de falsas abstenciones (0 %) documentadas para diseñar flujos que deriven a un humano cuando el contexto no contiene la respuesta.

## Benchmarks y rendimiento

Evaluación con juez LLM `claude-sonnet-5-5` a temperatura 0, sobre ~60 preguntas de los documentos de test (más 60 en la pista de abstención). Configuraciones: A = base, B = base + RAG, C = fine-tuned, D = fine-tuned + RAG. Corrección y fidelidad en escala 1–5; tasas en porcentaje.

| Config | Corrección (1–5) | Fidelidad (1–5) | Citación correcta | Abstención correcta | Falsa abstención | PT-BR | Latencia (s, L4) |
|---|---|---|---|---|---|---|---|
| A: base | 1,12 | — | — | — | — | 100 % | 4,3 |
| B: base + RAG | 2,47 | 4,35 | 52 % | 88 % | 0 % | 100 % | 13,0 |
| C: fine-tuned | 2,17 | — | — | — | — | 100 % | 15,6 |
| D: fine-tuned + RAG | 2,29 | 4,17 | 52 % | 88 % | 0 % | 100 % | 11,3 |

Recuperación híbrida en test (n=74): Recall@4 = 0,42; MRR@20 = 0,30.

Lectura de los datos: la mayor ganancia de corrección proviene del uso de RAG (de 1,12 a 2,47 en la configuración base), mientras que el ajuste fino por sí solo aporta una mejora menor (2,17) y combinado con RAG no supera a la base con RAG en corrección (2,29 frente a 2,47). La fidelidad se mantiene alta en ambas configuraciones con RAG (4,35 y 4,17) y la abstención correcta se sitúa en el 88 % sin falsas abstenciones en los casos evaluados. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento requirió un pico de 10,57 GB en una NVIDIA L4. El repo GGUF ocupa 9,4 GB, lo que incluye las cuantizaciones Q4_K_M y Q8_0 y el proyector de visión.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento y evaluación, con latencias de 4,3–15,6 s según configuración). No se documentan otras GPU.
- Cabe en GPU de consumo: sí, según la model card; se valida en un MacBook Air M1 de 8 GB con la variante solo-texto, con pico de memoria de 5,70 GB (frente a 6,55 GB con el proyector de visión cargado).
- Opciones de despliegue: Ollama (`ollama run hf.co/Refauna/gemma-4-e2b-refauna-GGUF:Q4_K_M`), `ollama create` con el Modelfile del repositorio para la variante solo-texto, y Transformers con `pipeline("text-generation", ...)`. No se documentan vLLM ni TGI.
- Latencia y throughput: latencias medidas en L4 de 4,3 s (base), 13,0 s (base + RAG), 15,6 s (fine-tuned) y 11,3 s (fine-tuned + RAG). No se proporcionan cifras de throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B · Refauna (este) | 4.647.450.147 | no disponible | Ajuste QLoRA + RAFT sobre Gemma 4 E2B para conservación de Mata Atlántica | Apache 2.0 | GGUF (Q4_K_M, Q8_0), LoRA y mesclado 16-bit en HF |
| Qwen3.5-2B · Refauna | no disponible | no disponible | Mismo corpus, prompt y evaluación que este modelo; modelo hermano | no disponible | GGUF en HF |
| google/gemma-4-e2b-it (base) | no disponible | no disponible | Modelo generalista sin ajuste de dominio | Apache 2.0 | HF |

El modelo hermano Qwen3.5-2B · Refauna emplea los mismos datos, prompt y protocolo de evaluación, por lo que constituye la comparación más directa para valorar el efecto del tamaño y la familia base en este dominio. Los resultados comparativos entre ambos no se detallan en la información disponible.

## Limitaciones y advertencias

- Uso previsto con RAG: el modelo fue entrenado para recibir hasta 4 fragmentos numerados con un formato de prompt concreto; desviarse de ese formato degrada las respuestas según la propia model card.
- En Ollama 0.40 o superior, no debe enviarse el parámetro `think`: `think: false` altera el prompt de Gemma 4 y aleja las respuestas del entrenamiento.
- El corpus de entrenamiento es limitado (942 ejemplos sintéticos derivados de 22 trabajos) y específico del proyecto Refauna; la generalización a otras fuentes o regiones no está evaluada.
- Rendimiento modesto en corrección absoluta: la mejor configuración alcanza 2,47 sobre 5, y la citación correcta se queda en el 52 %, lo que exige verificación humana en contextos críticos.
- La recuperación híbrida en test presenta Recall@4 = 0,42 y MRR@20 = 0,30, lo que limita el techo de calidad del pipeline RAG completo.
- Riesgo de alucinación mitigado pero no eliminado: aunque se entrena para abstenerse y la falsa abstención medida es del 0 %, no se documentan garantías fuera del conjunto evaluado.
- Idiomas: entrenado específicamente en portugués de Brasil; el soporte de inglés es heredado del modelo base y no se evalúa.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial; deben respetarse las condiciones de la licencia del modelo base Gemma 4.
- El despliegue con `ollama run` carga el proyector de visión (~1 GB) aunque este proyecto sea solo de texto; para entornos con poca memoria debe usarse la variante solo-texto del Modelfile.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna-GGUF
- Modelo mesclado 16-bit: https://huggingface.co/Refauna/gemma-4-e2b-refauna
- Adaptador LoRA: https://huggingface.co/Refauna/gemma-4-e2b-refauna-lora
- GGUF del proyecto Refauna: https://huggingface.co/Refauna/gemma-4-e2b-refauna-GGUF
- Modelo hermano Qwen3.5-2B · Refauna: https://huggingface.co/iamrodrigocoelho/qwen3.5-2b-refauna-GGUF
- Iniciativa Refauna: https://refauna.org.br
- Modelo base (referencia): google/gemma-4-e2b-it
- Modelo base en Unsloth (referencia): unsloth/gemma-4-E2B-it
