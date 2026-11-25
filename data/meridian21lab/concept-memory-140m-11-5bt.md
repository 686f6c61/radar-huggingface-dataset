# Meridian21Lab/concept-memory-140m-11.5bt

## Resumen

concept-memory-140m-11.5bt es un modelo de lenguaje base en inglés de 141,5 millones de parámetros desarrollado por Meridian21Lab (proyecto MrCogito), entrenado desde cero sobre 11,5 mil millones de tokens de datos públicos con un coste declarado de aproximadamente 320 dólares. Su innovación principal es una capa de "memoria de conceptos": durante la lectura, el modelo agrupa el texto ya visto en clústeres de tokens relacionados (unos 8 tokens por concepto), mantiene un resumen de cada uno y, para predecir la siguiente palabra, relee literalmente los pocos clústeres relevantes mientras consulta los resúmenes del resto. Cada capa local ve solo los últimos 128 tokens, pero el modelo aprovecha hasta 64k tokens de contexto.

El modelo se publica como investigación abierta (base model, sin ajuste de instrucciones, una sola semilla de entrenamiento) y forma parte de una familia de cuatro variantes entrenadas con los mismos datos, orden y presupuesto, cambiando únicamente la capa de lectura: este modelo (memoria de conceptos), topic-index-140m-11.5bt (Latent Sparse Attention), catalogue-150m-11.5bt (catálogo aprendido) y full-attention-140m-11.5bt (atención completa como referencia). Su relevancia actual reside en que demuestra que un modelo muy pequeño puede procesar documentos largos con una predicción de calidad competitiva frente a modelos de mayor tamaño y mucho mayor presupuesto de entrenamiento.

La licencia Apache 2.0 y su reducido tamaño lo hacen accesible para experimentación e integración en entornos con recursos limitados, aunque su naturaleza de modelo base y su soporte exclusivo del inglés limitan su uso directo en producción sin ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capa de lectura de memoria de conceptos (perceiver_ar, código personalizado) |
| Parametros totales | 141.506.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 64k tokens de documento (capas locales de 128 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo con una capa de lectura denominada "concept memory" (identificada en los tags como `perceiver_ar`). Mientras procesa el texto, agrupa los tokens ya vistos en clústeres de aproximadamente 8 tokens ("conceptos") y mantiene un resumen de cada clúster. Para cada predicción, relee palabra por palabra los pocos clústeres más relevantes y consulta los resúmenes del resto. Las capas locales tienen una ventana de solo 128 tokens, pero el mecanismo de memoria permite explotar hasta 64k tokens de contexto, equivalente a unas 50.000 palabras o una novela corta.

El entrenamiento se realizó desde cero sobre 11,5 mil millones de tokens de datos públicos, con un coste declarado de unos 320 dólares y aproximadamente 40 horas en un nodo de 4 GPU. El corpus combina fuentes como Nemotron-CC-v2, Nemotron-CC-Math-v1, Nemotron-Pretraining-Specialized-v1, dclm-edu, subconjuntos filtrados de Common Pile (Stack v2 educativo, Project Gutenberg, arXiv, DOAB, USGPO, UK Hansard), dolma3_longmino_pool y smol-smoltalk. No se indica en la información disponible si hubo RLHF, DPO ni ajuste de instrucciones; se trata de un modelo base.

## Capacidades

- Generación de texto autorregresiva en inglés.
- Procesamiento de documentos largos de hasta 64k tokens mediante memoria de conceptos.
- Predicción del siguiente token con uso efectivo del pasado lejano (hasta 61k tokens).
- Recuperación de hechos plantados en textos largos (evaluado con RULER).
- Razonamiento gramatical básico (evaluado con BLiMP).
- Conocimiento científico elemental (evaluado con ARC-Easy).
- No dispone de tool calling ni function calling documentado.
- No dispone de modo de razonamiento multi-paso ni capacidades de agente documentadas.
- No soporta visión ni audio.
- No está ajustado para instrucciones ni para conversación (modelo base).

## Casos de uso

- Investigación sobre mecanismos de atención y memoria: el modelo sirve como banco de pruebas reproducible para estudiar cómo distintas capas de lectura (memoria de conceptos, atención dispersa latente, catálogo aprendido, atención completa) afectan al rendimiento con datos y presupuesto idénticos.
- Modelado de documentos largos: análisis y predicción sobre libros, artículos científicos e informes gubernamentales de hasta 64k tokens, aprovechando su capacidad de mantener coherencia sobre el pasado lejano.
- Recuperación de información en contextos extensos: evaluación de la capacidad de localizar hechos enterrados en textos largos (tipo needle-in-a-haystack), útil para prototipos de sistemas de preguntas y respuestas sobre documentos.
- Base para ajuste fino: al ser un modelo base con licencia Apache 2.0, puede servir como punto de partida para tareas específicas de dominio en inglés con recursos de cómputo modestos.
- Evaluación comparativa de arquitecturas de contexto largo: su inclusión en la familia MrCogito permite comparar directamente el coste y beneficio de la memoria de conceptos frente a la atención completa dentro de los 64k tokens de entrenamiento.
- Experimentación educativa: su tamaño (141,5M parámetros, repo de 0,6 GB) y su coste de entrenamiento permiten reproducir o estudiar el pipeline completo en entornos académicos.
- Procesamiento de corpus legales o administrativos en inglés: gracias a su entrenamiento con subconjuntos como UK Hansard o USGPO, puede emplearse para modelar lenguaje de documentos oficiales, siempre con ajuste posterior.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados):

| Tarea | Conjunto de datos | Métrica | Valor |
|---|---|---|---|
| Gramática (0-shot, 67 conjuntos) | BLiMP | Accuracy (%) | 80,56 |
| Cuestionario de ciencia (0-shot) | ARC-Easy (test) | Accuracy (%) | 48,95 |
| Modelado de lenguaje | WikiText-2 | Byte perplexity (menor es mejor) | 1,95 |

Datos adicionales citados en la model card (declarados por el autor):

| Comparación | Valor |
|---|---|
| Bits por byte en 55 documentos de 64k tokens (últimas páginas) | 0,795 |
| SmolLM2-135M (contexto 8k) | 0,832 |
| Pythia-160M (contexto 2k) | 0,942 |
| Gemma 3 270M | 0,805 |
| LFM2.5-350M-Base (mejor contexto) | 0,879 |
| Granite 4.0 350M | 0,776 |
| RULER needle in real essays, 1k–16k | 1,00 |
| RULER needle in real essays, 32k | 0,98 |
| RULER a 8k entre claves similares | 0,62 (primero de ocho modelos pequeños) |
| Media en siete tareas estándar | 46,2 % (igual que full-attention-140m-11.5bt) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 141,5M parámetros en fp32 serían aproximadamente 0,57 GB de pesos, y en fp16 unos 0,28 GB, a lo que hay que sumar el estado de la memoria de conceptos y las activaciones para contextos largos.
- GPU recomendadas: no especificadas; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería poder cargar los pesos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060 en adelante), aunque el contexto de 64k puede incrementar el uso de memoria.
- Opciones de despliegue: transformers con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que el modelo puntúa un documento completo de 64k tokens en una sola pasada, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento destacado |
|---|---|---|---|---|
| concept-memory-140m-11.5bt | 141,5M | 64k | Apache 2.0 | BLiMP 80,56 %; 0,795 bits/byte en documentos de 64k; RULER 8k 0,62 |
| full-attention-140m-11.5bt (misma familia) | ~140M | 64k | Apache 2.0 | Media 46,2 % en siete tareas; 0,812 bits/byte; RULER 8k 0,44 |
| topic-index-140m-11.5bt (misma familia) | ~140M | 64k | Apache 2.0 | Media 46,5 %; RULER 8k 0,54 |
| SmolLM2-135M | 135M | 8k | Apache 2.0 | BLiMP 79,72 % tras 252B tokens; 0,832 bits/byte |
| Pythia-160M | 160M | 2k | Apache 2.0 | 0,942 bits/byte; por debajo en gramática y ciencia a igual presupuesto |
| Gemma 3 270M | 270M | 32k | Términos de Gemma | 0,805 bits/byte |
| LFM2.5-350M-Base | 350M | No disponible | No disponible | 0,879 bits/byte en su mejor contexto; BLiMP 80,17 % |
| Granite 4.0 350M | 350M | No disponible | No disponible | 0,776 bits/byte |

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no está diseñado para responder a prompts conversacionales ni para seguir instrucciones directas.
- Solo soporta inglés; no se documenta capacidad multilingüe.
- Entrenado con una única semilla y publicado como versión de investigación, lo que limita la confianza en la reproducibilidad de los resultados.
- Sesgos conocidos: no documentados explícitamente, pero al entrenarse con datos web públicos (Nemotron-CC, dclm-edu, Common Pile) es probable que herede sesgos presentes en esas fuentes.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- El uso del contexto largo depende de un mecanismo de memoria de conceptos con código personalizado (`trust_remote_code=True`), lo que implica revisar el código antes de ejecutarlo en producción.
- Compatibilidad limitada con herramientas estándar de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, lo que puede complicar la integración en pipelines existentes.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base requeriría ajuste fino y evaluación adicional antes de un despliegue en producción.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Meridian21Lab/concept-memory-140m-11.5bt
- Página del proyecto: https://ai.ksopyla.com/projects/concept-reasoning/
- Código: https://github.com/ksopyla/MrCogito/tree/1fddc505
- Detalles de evaluación: EVALUATION.md (referenciado en la model card)
- Entrenamiento en W&B: https://wandb.ai/ksopyla/MrCogito/reports/150M-concept-memory-vs-earlier-100M-runs--VmlldzoxODMxMjMwMw
- Modelo hermano topic-index-140m-11.5bt: https://huggingface.co/Meridian21Lab/topic-index-140m-11.5bt
- Modelo hermano catalogue-150m-11.5bt: https://huggingface.co/Meridian21Lab/catalogue-150m-11.5bt
- Modelo hermano full-attention-140m-11.5bt: https://huggingface.co/Meridian21Lab/full-attention-140m-11.5bt
