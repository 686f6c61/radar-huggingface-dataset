# insilicogen/GM-LLM-Gemma3-27B-LoRA

## Resumen

GM-LLM (Gemma3-27B) es un conjunto de adaptadores LoRA que especializan el modelo multimodal `google/gemma-3-27b-it` en la interpretación de variantes genéticas asociadas a cáncer, apoyándose en literatura científica. Lo desarrolla el equipo de insilicogen (Corea del Sur) y se publica junto al artículo "Staged Domain Specialization of Open-Source Large Language Models for Cancer-Related Genetic Variant Interpretation" (Lee et al., *Diagnostics*, MDPI, en revisión, 2026).

El modelo resuelve un problema muy concreto: transformar un LLM generalista en un asistente capaz de leer anotaciones ClinVar y documentos de literatura, y producir una justificación razonada de la patogenicidad de una variante. Para ello aplica una especialización en dos etapas: primero un fine-tuning (FT) supervisado sobre 42.918 pares pregunta-respuesta extraídos de literatura oncológica, y después un *retrieval-augmented fine-tuning* (RAFT) sobre 1.438 ítems que incluyen documentos de contexto, de modo que el modelo aprende a citar las fuentes que recibe.

La relevancia actual reside en que demuestra que un adaptador LoRA de bajo coste (0,9 GB) sobre un modelo abierto de 27B puede mejorar drásticamente las métricas de corrección en un dominio clínico altamente especializado, pasando de 0,511 a 0,931 según un juez LLM (Gemma4). No es un modelo médico autónomo: es una pieza de investigación pensada para ser revisada por expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 3, multimodal); adaptadores LoRA sobre capas de atención y MLP |
| Parametros totales | No disponible en la model card (el modelo base Gemma 3 27B IT tiene 27B; los adaptadores LoRA son de rango 16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens usados en el entrenamiento RAFT (la longitud máxima nativa del modelo base no se especifica en la información disponible) |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | Coreano (ko) e inglés (en); las respuestas se generan en coreano según la model card |
| Licencia | Gemma (sujeta a la licencia y política de uso de google/gemma-3-27b-it) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA en subcarpetas `ft_adapter/` y `raft_adapter/`) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 27B IT, un transformer decoder-only de Google. Sobre él se aplican dos adaptadores LoRA independientes con rango 16, alpha 32 y dropout 0,2, aplicados tanto a las capas de atención como a las MLP, con learning rate 5e-5. El adaptador FT se entrena durante 1 época con longitud máxima 1.024 sobre el dataset `insilicogen/llm-mutation-ft-qa` (42.918 pares QA de literatura oncológica). El adaptador RAFT se entrena durante 6 épocas con longitud máxima 4.096 sobre `insilicogen/llm-mutation-variant-qa` (partición `raft_train`, 1.438 ítems), y se aplica sobre el modelo base con el adaptador FT ya fusionado; por tanto, el orden de carga es obligatorio: primero FT (merge), después RAFT.

La innovación técnica principal es la combinación de fine-tuning de dominio con RAFT: el modelo aprende no solo a responder sobre variantes, sino a fundamentar la respuesta en los documentos recuperados que recibe en el contexto, generando citas explícitas en el formato `<body> … </body> <citation>(Reference: doc_N, …)</citation>`. Los pesos base usados son el espejo `unsloth/gemma-3-27b-it`, cuyos ficheros son idénticos (sha256) a los de `google/gemma-3-27b-it`. No se documentan en la información disponible detalles sobre RLHF/DPO ni sobre la composición exacta de los datasets más allá de su tamaño y temática.

## Capacidades

- Interpretación de variantes genéticas relacionadas con cáncer a partir de anotaciones ClinVar incluidas en el prompt.
- Razonamiento fundamentado en literatura: genera respuestas con cuerpo argumentativo y bloque de citas a los documentos de contexto (`doc_N`).
- Generación de respuestas en coreano, con soporte de instrucciones y contexto en inglés.
- Procesamiento de contexto documental de hasta 4.096 tokens, suficiente para incluir la pregunta, el bloque de anotación ClinVar y cinco documentos.
- Capacidad multimodal heredada del modelo base Gemma 3 (visión), aunque la model card no documenta su uso ni evaluación en este dominio.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.
- No se documenta un modo "thinking" ni capacidades de audio.

## Casos de uso

- Apoyo a la revisión de variantes en laboratorios de genética clínica: el modelo recibe la anotación ClinVar de una variante y varios fragmentos de literatura, y devuelve una justificación razonada con citas que el genetista puede verificar antes de tomar una decisión.
- Generación de borradores de informes de interpretación de variantes: el formato de salida estructurado (`<body>` + `<citation>`) facilita el posprocesado y la trazabilidad de fuentes en un pipeline documental.
- Investigación en oncología traslacional: permite explorar rápidamente la evidencia publicada sobre variantes concretas y contrastar la coherencia de las anotaciones existentes.
- Construcción de sistemas RAG biomédicos: al haber sido entrenado con RAFT, el adaptador está diseñado para trabajar con documentos recuperados (por ejemplo, con BM25) y citarlos, lo que lo hace adecuado como componente generador de un pipeline RAG.
- Evaluación comparativa de LLM en dominios clínicos: sirve como referencia metodológica para estudiar el efecto del fine-tuning por etapas (FT → RAFT) frente a un modelo base sin especializar.
- Docencia y formación en genética del cáncer: puede generar explicaciones fundamentadas sobre variantes para revisión por parte de especialistas en formación, siempre con supervisión.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un conjunto de evaluación de 548 ítems con anotación ClinVar en la entrada:

| Metrica | Modelo base | GM-LLM |
|---|---|---|
| Corrección, juez Gemma4 | 0,511 | 0,931 |
| Corrección, juez Claude Sonnet 5.5 | 0,492 | 0,602 |
| Corrección con recuperación real (BM25, 127 ítems), juez Gemma4 | — | 0,803 |

La métrica de corrección es una puntuación de juez LLM (correcto 1 / parcial 0,5 / incorrecto 0) frente a respuestas de referencia. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los adaptadores pesan 0,9 GB, pero requieren cargar el modelo base Gemma 3 27B IT. En bfloat16 el modelo base necesita del orden de 54 GB de VRAM; en cuantización de 8 bits, aproximadamente 27 GB; en 4 bits, en torno a 14-16 GB (estimaciones para el modelo base, no publicadas en la model card).
- GPU recomendadas: A100 80 GB o H100 para bfloat16 sin cuantizar; A100 40 GB o L40S 48 GB con cuantización 8 bits; RTX 4090 24 GB solo con cuantización de 4 bits y posible offload.
- Cabe en GPU de consumo (RTX 3090/4090, 24 GB) únicamente con cuantización agresiva de 4 bits y, previsiblemente, con penalización de latencia.
- Opciones de despliegue: la model card solo documenta uso con `transformers` + `peft` (carga secuencial de adaptadores y `merge_and_unload`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; el uso de adaptadores PEFT encadenados limita las opciones de servido de alto rendimiento.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GM-LLM (Gemma3-27B-LoRA) | 27B (base) + LoRA r16 | 4.096 en entrenamiento RAFT | Interpretación de variantes de cáncer con RAFT | Gemma | Hugging Face (adaptadores PEFT) |
| google/gemma-3-27b-it | 27B | No especificado en la información disponible | Generalista multimodal | Gemma | Hugging Face |
| Alternativas biomédicas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de otros modelos biomédicos comparables (por ejemplo, Meditron, BioMistral o MedGemma) que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: no es un dispositivo médico y no debe emplearse para decisiones clínicas autónomas; las salidas requieren revisión por expertos cualificados.
- La evaluación se realizó principalmente con documentos de referencia (gold) en el contexto; con recuperación real (BM25) la corrección cae de 0,931 a 0,803 según el juez Gemma4.
- La calidad de la salida depende críticamente de la exactitud de la anotación ClinVar de entrada; anotaciones erróneas se propagan a la respuesta.
- Riesgo de alucinación inherente al modelo base, mitigado pero no eliminado por el entrenamiento RAFT y el formato de citas.
- Idiomas limitados a coreano e inglés; las respuestas se generan en coreano, lo que puede requerir traducción para otros entornos.
- Sujeto a la licencia y política de uso de Gemma; deben revisarse las restricciones de uso comercial antes de cualquier despliegue en producción.
- El orden de carga de los adaptadores es obligatorio (FT fusionado antes de RAFT); cargarlos de otro modo produce resultados incorrectos.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá del conjunto de 548 ítems.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/insilicogen/GM-LLM-Gemma3-27B-LoRA
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Dataset de fine-tuning: https://huggingface.co/datasets/insilicogen/llm-mutation-ft-qa
- Dataset de RAFT: https://huggingface.co/datasets/insilicogen/llm-mutation-variant-qa
- Espejo de pesos base usado en el entrenamiento: https://huggingface.co/unsloth/gemma-3-27b-it
- Artículo asociado: Lee Y. et al., "Staged Domain Specialization of Open-Source Large Language Models for Cancer-Related Genetic Variant Interpretation", *Diagnostics* (MDPI), en revisión, 2026 (sin URL disponible en la información proporcionada)
