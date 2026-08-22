# ishikaa/acquisition_student_AS_format_medmcqa_qwen7b

## Resumen

El modelo `ishikaa/acquisition_student_AS_format_medmcqa_qwen7b` es un fine-tune de un modelo base Qwen2 de 7.615 millones de parámetros, ajustado mediante entrenamiento supervisado (SFT) con la librería TRL de Hugging Face sobre el dataset MedMCQA. MedMCQA es un conjunto de datos a gran escala de preguntas de opción múltiple extraídas de exámenes de acceso a residencias médicas en India (AIIMS y NEET PG), con más de 194 000 preguntas que cubren 21 materias médicas y 2400 temas de salud. El objetivo del modelo es responder preguntas de tipo test sobre conocimiento clínico general, lo que lo convierte en una herramienta útil para evaluación automática de conocimiento médico o asistentes de estudio.

El autor (usuario `ishikaa`) no ha proporcionado documentación técnica detallada: la model card es una plantilla automática sin información sobre datos de entrenamiento, hiperparámetros o evaluación. A partir de los metadatos disponibles, sabemos que el modelo usa arquitectura transformer (Qwen2), pesa 15.2 GB en formato `safetensors` y está etiquetado como compatible con `text-generation-inference` y `endpoints_compatible`. No se especifica licencia ni idiomas soportados.

Su relevancia actual reside en la creciente demanda de modelos médicos de código abierto y de tamaño contenido que puedan desplegarse en entornos con recursos limitados, así como en la posibilidad de evaluar el efecto de diferentes estrategias de muestreo de datos de entrenamiento sobre el rendimiento en tareas de preguntas médicas. El modelo forma parte de una familia de variantes (con sufijos como `random`, `filtered`, `AS_format`) que sugieren experimentos de selección de subconjuntos del dataset MedMCQA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, pre-norm y activación SiLU (Swish). El tamaño de 7.6B parámetros lo sitúa en la gama de modelos de tamaño medio que pueden ejecutarse en hardware de consumo con cuantización. La capa de salida es una cabeza de clasificación sobre el vocabulario del tokenizer de Qwen2.

El entrenamiento se realizó mediante supervisión fina (SFT) con la librería TRL, lo que implica una etapa de fine-tuning sobre el dataset MedMCQA. No se han publicado detalles sobre el número de épocas, tasa de aprendizaje, estrategia de padding, o si se aplicó alguna técnica de regularización. El dataset MedMCQA contiene preguntas de opción múltiple con 4 opciones y una respuesta correcta, y el modelo fue entrenado para generar la respuesta correcta en un formato conversacional (los tags del modelo indican `conversational`). Se desconoce la composición exacta del subconjunto usado para este fine-tuning concreto, aunque el sufijo `AS_format` sugiere un formato específico de entrada/salida para el dataset.

## Capacidades

- Generación de texto para responder preguntas de opción múltiple sobre temas médicos (anatomía, fisiología, farmacología, patología, etc.).
- Manejo de tareas de razonamiento de conocimiento médico en formato de examen, limitado a preguntas de 4 opciones.
- Generación de respuestas en formato conversacional, lo que permite integrarlo en sistemas de chat o asistentes de estudio.
- Soporte de `text-generation-inference` y compatibilidad con endpoints de Hugging Face (dado el tag `endpoints_compatible`).
- No se declaran capacidades de tool calling, agentes, visión, audio, ni razonamiento multi-step más allá del formato de pregunta-respuesta.

## Casos de uso

- **Preparación de exámenes médicos**: el modelo puede generar respuestas a preguntas de estilo MIR, USMLE o NEET PG. Un estudiante podría introducir una pregunta y obtener una respuesta razonada (si el fine-tuning incluyó explicaciones) o simplemente la opción correcta.
- **Evaluación de conocimiento clínico**: se puede desplegar como componente de un sistema de evaluación automática que puntúe la capacidad de un LLM para responder preguntas médicas, comparando con otros modelos en el benchmark MedMCQA.
- **Asistente de estudio integrado en plataformas de e-learning**: el modelo puede servir de backend para una herramienta de repaso que reciba preguntas de un banco de preguntas y devuelva la respuesta correcta, ayudando a los estudiantes a auto-evaluarse.
- **Generación de datos sintéticos para entrenamiento**: dado que el modelo fue fine-tuneado en un formato específico, podría usarse para generar nuevas preguntas de práctica o para aumentar datasets de entrenamiento en dominios médicos, aunque con riesgo de alucinación.
- **Investigación en selección de datos de entrenamiento**: como parte de una familia de modelos con variantes de muestreo (random, filtrado, AS), permite estudiar cómo diferentes estrategias de selección de datos afectan el rendimiento en dominios médicos.
- **Prototipado de sistemas de preguntas-respuestas médicas**: para desarrolladores que necesitan un modelo de 7B de código abierto para un prototipo de chatbot médico, este modelo puede servir como base sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye una sección de resultados en su model card, y no se encontraron evaluaciones públicas (MMLU, MedQA, etc.) en la búsqueda web. El autor no ha reportado métricas de exactitud o comparaciones con otros modelos. No se deben asumir rendimientos sin datos verificables.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo en FP32/FP16 ocupa aproximadamente 15.2 GB de pesos en disco. En FP16, la inferencia requiere alrededor de 15-16 GB de VRAM, lo que es inviable en la mayoría de GPU de consumo. Con cuantización de 4 bits (por ejemplo, con `bitsandbytes` o `GGUF`), el uso de VRAM puede reducirse a unos 4-5 GB, permitiendo ejecución en GPUs como RTX 3060 (12 GB) o RTX 4060 (8 GB) con margen para el contexto.
- **GPU recomendadas**:
  - Para FP16: NVIDIA A100 (40/80 GB), H100 (80 GB), o RTX 4090 (24 GB) con espacio suficiente para contexto corto.
  - Para cuantización 8-bit: RTX 3090 (24 GB) o RTX 4080 (16 GB) son suficientes.
  - Para cuantización 4-bit: RTX 3060 (12 GB), RTX 3070 (8 GB) o superiores.
- **Opciones de despliegue**: compatible con `text-generation-inference` (TGI), `vLLM` (con soporte de Qwen2), `llama.cpp` (con conversión a GGUF), `Ollama` (si se convierte a GGUF), y `bitsandbytes` para carga en 4/8 bits con transformers.
- **Latencia y throughput**: no se dispone de datos medidos. Para un modelo de 7.6B en FP16, se puede estimar un throughput de 20-40 tokens/s en una A100, y de 5-15 tokens/s en una RTX 4090 con cuantización 4-bit, dependiendo de la longitud del contexto y el batch size.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización médica | Formato |
|---|---|---|---|---|---|
| `ishikaa/acquisition_student_AS_format_medmcqa_qwen7b` | 7.6B | no disponible | no disponible | Sí (MedMCQA) | safetensors |
| `Meditron-7B` | 7B | 4K (base) | Apache 2.0 | Sí (fine-tuning sobre literatura médica) | safetensors |
| `BioMistral-7B` | 7B | 8K | Apache 2.0 | Sí (fine-tuning de Mistral sobre PubMed) | safetensors |
| `Qwen2-7B` (base) | 7.6B | 32K | Apache 2.0 | No | safetensors |

- **Meditron-7B**: modelo de código abierto entrenado por EPFL sobre un corpus médico (MedQA, PubMed). Tiene licencia Apache 2.0 y está más documentado, con benchmarks publicados.
- **BioMistral-7B**: fine-tuning de Mistral-7B sobre PubMed, licencia Apache 2.0, con buena documentación y evaluaciones.
- **Qwen2-7B**: modelo base generalista, sin especialización médica, pero con contexto largo de 32K y licencia Apache 2.0.

Este modelo se diferencia por estar entrenado específicamente sobre MedMCQA, pero carece de la documentación y los datos de evaluación de sus alternativas. Además, la licencia no está especificada, lo que limita su uso en producción comparado con los modelos Apache 2.0.

## Limitaciones y advertencias

- **Falta de documentación**: la model card está vacía; no se conocen los datos de entrenamiento exactos, el procedimiento de fine-tuning, ni las condiciones de uso.
- **Licencia desconocida**: no se indica la licencia, lo que impide saber si es usable en producción o para fines comerciales. Se recomienda contactar con el autor antes de usarlo en proyectos con distribución.
- **Sesgos del dataset**: MedMCQA proviene de exámenes médicos de India (AIIMS/NEET PG), por lo que el conocimiento está sesgado hacia la práctica médica india y puede no generalizar bien a otros sistemas de salud o contextos culturales.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en preguntas fuera del dominio de entrenamiento o con formulaciones ambiguas.
- **Contexto limitado**: no se conoce la longitud de contexto, pero Qwen2-7B base soporta 32K tokens; el fine-tuning podría haber reducido la ventana efectiva.
- **Sin garantías de precisión médica**: el modelo no está validado para uso clínico real; no debe usarse como herramienta de diagnóstico ni para decisiones médicas sin supervisión humana.
- **Falta de benchmarks**: no hay evidencia pública del rendimiento en MedMCQA u otros conjuntos, por lo que no se puede comparar objetivamente con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ishikaa/acquisition_student_AS_format_medmcqa_qwen7b
- Dataset MedMCQA (GitHub): https://github.com/medmcqa/medmcqa
- Paper de MedMCQA: https://arxiv.org/abs/1910.09700
- Modelos similares de la misma autora: https://huggingface.co/ishikaa/acquisition_student_random_medmcqa_qwen7b
- Despliegue en FriendliAI: https://friendli.ai/models/ishikaa/acquisition_student_random_medmcqa_qwen7b
