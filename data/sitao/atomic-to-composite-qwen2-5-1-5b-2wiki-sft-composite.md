# sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-composite

## Resumen

Este modelo es un ajuste fino supervisado (SFT) de Qwen2.5-1.5B realizado por Sitao Cheng y colaboradores, publicado como artefacto de investigación junto al artículo "From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning" (arXiv:2512.01970). Se trata de una de las cuatro variantes del estudio de transferencia sobre pasajes reales de Wikipedia, en este caso entrenada directamente sobre la tarea compuesta (SFT<sub>Comp</sub>) usando preguntas construidas a partir de 2WikiMultiHopQA.

El modelo resuelve el problema de la generalización composicional en razonamiento complementario: la capacidad de combinar habilidades atómicas (memoria y contextualización) para resolver preguntas multi-hop que requieren encadenar información de varios pasajes. Su relevancia radica en que sirve como punto de comparación controlado frente a las recetas que añaden RL con GRPO, demostrando empíricamente que el SFT directo sobre la tarea compuesta mejora el rendimiento IID pero no generaliza a composiciones nuevas.

Arquitectura transformer decoder-only de Qwen2.5 con 1.543.714.304 parámetros (1.5B), licencia Apache 2.0, pesos en safetensors y entrenado exclusivamente en inglés. No es un asistente de propósito general, sino un artefacto de investigación para estudiar la composición de habilidades.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 (1.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-1.5B, un transformer decoder-only denso con 1.5B parámetros. El ajuste se realizó mediante SFT completo (full SFT) con LLaMA-Factory sobre el mismo conjunto de biografías sintéticas y preguntas compuestas multi-hop con respuestas en cadena de pensamiento (chain-of-thought) empleado en el resto del estudio, pero en esta variante se entrena directamente sobre la tarea compuesta (SFT<sub>Comp</sub>) en lugar de sobre habilidades atómicas.

El conjunto de evaluación son preguntas construidas a partir de 2WikiMultiHopQA sobre pasajes reales de Wikipedia, con un split IID de 877 ítems y un split de composición de 1.200 ítems. Esta variante no incluye la fase de RL con GRPO (200 pasos en verl) que sí aplican las recetas "atomic-first" y "composite-first" del mismo estudio. La innovación metodológica del trabajo es comparar sistemáticamente si el orden de entrenamiento (atómicas primero vs. compuestas primero, con o sin RL posterior) afecta a la generalización composicional.

## Capacidades

- Generación de texto y respuesta a preguntas multi-hop sobre pasajes de Wikipedia en inglés.
- Razonamiento complementario: combina información de múltiples párrafos recuperados para responder una pregunta.
- Generación de cadenas de pensamiento (chain-of-thought) en las respuestas, heredadas del formato de entrenamiento.
- Formato conversacional mediante `apply_chat_template` (rol de usuario con pregunta y párrafos concatenados).
- Inferencia determinista recomendada (`do_sample=False`) con `max_new_tokens=160`.
- No soporta tool calling ni function calling de forma nativa según la información disponible.
- No dispone de modo thinking explícito, visión ni audio.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Evaluación de investigación en generalización composicional: usar este modelo como baseline SFT<sub>Comp</sub> para comparar contra las variantes con RL (atomic-first y composite-first) en el mismo split de 2WikiMultiHopQA, midiendo exact match en IID y composición.
- Reproducción de experimentos del paper: servir como punto de control para verificar los resultados del Apéndice D sobre pasajes reales de Wikipedia con el mismo protocolo de prompting.
- Estudio de recetas de entrenamiento: analizar por qué el SFT directo sobre la tarea compuesta alcanza 91,7 en IID pero solo 71,4 en composición, frente a la receta atomic-first con RL que llega a 88,6 en composición.
- Benchmarking interno de QA multi-hop: desplegar el modelo sobre un corpus de pasajes recuperados para medir su exact match en preguntas que requieren encadenar dos hechos de documentos distintos.
- Docencia e investigación en NLP: ilustrar con un modelo pequeño (1.5B) y licencia permisiva las diferencias entre memorización de tarea y generalización composicional.
- Prototipado de pipelines de retrieval-augmented generation (RAG) multi-documento en inglés, usando el modelo como generador de respuestas con citas de párrafos, siempre con validación humana por su naturaleza de artefacto de investigación.

## Benchmarks y rendimiento

Resultados de exact match (%) en el test set de 2Wiki sobre pasajes reales, según la tabla del Apéndice D del paper:

| Modelo | IID (877 ítems) | Composición (1.200 ítems) |
|---|---:|---:|
| SFT sobre habilidades atómicas (SFT<sub>Mem+Ctx</sub>) | 83,8 | 71,6 |
| **SFT sobre tarea compuesta (SFT<sub>Comp</sub>) — este modelo** | **91,7** | **71,4** |
| Atomic-first (SFT<sub>Mem+Ctx</sub> → RL<sub>Comp</sub>) | 90,4 | 88,6 |
| Composite-first (SFT<sub>Comp</sub> → RL<sub>Comp</sub>) | 90,2 | 68,8 |

Ambos modelos con RL se entrenan con los mismos 200 pasos de GRPO sobre los mismos datos, por lo que la comparación está emparejada por pasos. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB de pesos, unos 4-5 GB con overhead de activaciones y caché KV para contextos moderados.
- VRAM en cuantización de 8 bits: alrededor de 2 GB; en 4 bits: alrededor de 1,2-1,5 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090); en servidor, A100 o H100 para lotes grandes.
- Cabe holgadamente en GPU consumer, incluidas portátiles con 8 GB de VRAM.
- Opciones de despliegue: transformers (referencia oficial), vLLM, TGI (tag `text-generation-inference`), llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IID (2Wiki) | Composición (2Wiki) | Licencia |
|---|---|---:|---:|---:|---|
| SFT<sub>Comp</sub> (este modelo) | 1,5B | No disponible | 91,7 | 71,4 | Apache 2.0 |
| SFT<sub>Mem+Ctx</sub> (atomic SFT) | 1,5B | No disponible | 83,8 | 71,6 | Apache 2.0 |
| Atomic-first RL | 1,5B | No disponible | 90,4 | 88,6 | Apache 2.0 |
| Composite-first RL | 1,5B | No disponible | 90,2 | 68,8 | Apache 2.0 |

Las cuatro variantes comparten el mismo modelo base (Qwen2.5-1.5B) y el mismo protocolo de evaluación, por lo que la comparación es directa. Frente a modelos de propósito general del mismo tamaño (por ejemplo, Qwen2.5-1.5B base), no hay datos de benchmarks comparables en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo describe como "research artifact for studying skill composition, not a general-purpose assistant".
- Entrenado exclusivamente en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Especializado en QA multi-hop sobre pasajes de Wikipedia; el rendimiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación en preguntas que requieran conocimiento no presente en los párrafos proporcionados, al ser un modelo de 1.5B sin RLHF orientado a seguridad.
- El SFT directo sobre la tarea compuesta no generaliza bien a composiciones nuevas (71,4 frente a 88,6 de la receta atomic-first con RL), por lo que no es la variante recomendada para producción en tareas composicionales.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad y sesgo hace desaconsejable su despliegue directo sin validación adicional.
- Longitud de contexto, cuantizaciones publicadas y latencias no documentadas en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-composite
- Paper: https://arxiv.org/abs/2512.01970
- Página del proyecto: https://sitaocheng.github.io/atomic/
- Código: https://github.com/sitaocheng/from_atomic_to_composite
- Colección de modelos y dataset: https://huggingface.co/collections/sitao/from-atomic-to-composite-6adfe594de6d55a83cf3a287
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Variante SFT atómica: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-atomic
- Variante atomic-first con RL: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-atomic-first-rl
- Variante composite-first con RL: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-composite-first-rl
- Dataset 2WikiMultiHopQA: https://github.com/Alab-NII/2wikimultihop
