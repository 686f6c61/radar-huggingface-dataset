# pkcpkc/strands-decider-2B-qwen3.5-v1-2610-mlx

## Resumen

strands-decider-2B-qwen3.5-v1-2610-mlx es una conversión a formato MLX del modelo strands-decider-2B-qwen3.5-v1-2610, desarrollado por Strands Agents a partir de Qwen/Qwen3.5-2B-Base. No es un modelo conversacional al uso: es un modelo de decisión que lee un estado textual y responde a preguntas tipadas (sí/no, elección entre N opciones y puntuación en escala ordenada) devolviendo probabilidades calibradas mediante una cabeza pointer. Esta versión concreta, publicada por el usuario pkcpkc, fusiona el adaptador LoRA del release original en los pesos base y los guarda en el layout de mlx-lm para su uso en Apple Silicon.

El problema que resuelve es el de la evaluación estructurada y calibrada de estados dentro de pipelines de agentes: en lugar de generar texto libre, el modelo emite decisiones tipadas con probabilidad asociada, lo que facilita umbrales, enrutado y auditoría. Frente al release original, que distribuye un adaptador PEFT más una cabeza de lectura y requiere fusionar en cada arranque, este repositorio ofrece la fusión hecha una sola vez, de modo que el torso es un checkpoint mlx-lm estándar que otras herramientas MLX pueden cargar directamente.

La arquitectura subyacente es Qwen3.5, un transformer de aproximadamente 1.880 millones de parámetros (1.881.825.088 según los safetensors), almacenado en bfloat16 sin cuantización. El repositorio ocupa 3,8 GB e incluye la cabeza pointer en fp32 con su calibración. La licencia es Apache 2.0 y el modelo está pensado exclusivamente para inferencia en Apple Silicon mediante el backend MLX de strands-decider.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (base Qwen/Qwen3.5-2B-Base) con cabeza pointer para decisiones tipadas |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 sin cuantizacion en este repositorio; no se documentan otras variantes |
| Idiomas soportados | no disponible (entrenado mayoritariamente con datasets publicos en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en layout mlx-lm, mas head.safetensors (fp32), tokenizer.json, tokenizer_config.json, chat_template.jinja, strands_decider_config.json, provenance.json |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base, un transformer denso de unos 1.880 millones de parámetros. Sobre ese torso, Strands Agents entrenó un adaptador LoRA (r = 48, alpha = 96) con 186 pares lora_A/lora_B y añadió una cabeza pointer que produce tres tipos de respuesta: `noul` (sí/no), `choice` (una entre N opciones) y `score` (nivel en escala ordenada). La calibración se implementa como una temperatura por tipo de pregunta. En esta conversión MLX, el adaptador se fusionó como W + (alpha / r) · B · A, calculado en float32 sobre CPU y redondeado una sola vez a bfloat16, replicando la aritmética que el backend MLX de strands-decider ejecuta en tiempo de carga.

El entrenamiento del release original se realizó sobre una composición amplia de datasets públicos que cubren clasificación de texto, intención, emoción, noticias, NLI, QA médica y legal, function calling, preferencias humanas (hh-rlhf, HelpSteer, oasst2), instrucciones procedimentales y decisiones tipadas específicas (tasksource/tasksource-jev-typed-decisions, tasksource/procedural-typed-decisions). No se documenta en la información disponible el número de tokens de entrenamiento, la mezcla exacta ni si hubo RLHF o DPO más allá de la presencia de datasets de preferencias. La torre de visión y `vision_config` se eliminan en esta conversión: es un modelo solo de texto.

## Capacidades

- Emisión de decisiones tipadas con probabilidad calibrada: preguntas `noul`, `choice` y `score` sobre un estado textual.
- Clasificación de texto en dominios diversos: emoción, intención, noticias, spam, toxicidad, formalidad, análisis de sentimiento.
- Razonamiento sobre documentos y pares pregunta-respuesta, incluyendo dominios especializados (legal con CUAD y MAUD, médico con PubMedQA y MedMCQA).
- Soporte de function calling y tool calling, derivado del entrenamiento con glaive-function-calling-v2 y hermes-function-calling-v1.
- Capacidades de agente y razonamiento multi-paso, con datasets como Mind2Web, Boardgame-QA y ruletaker.
- Comprensión de instrucciones procedimentales y decisiones tipadas en tareas estructuradas.
- Capacidades multilingües limitadas: el entrenamiento se apoya mayormente en datasets en inglés; la verificación del autor incluye 50 textos en alemán con resultados idénticos al release original.
- No es un modelo generativo de texto libre: no produce respuestas conversacionales, solo decisiones tipadas.

## Casos de uso

- Enrutado de tickets de soporte: el modelo evalúa cada mensaje con preguntas `noul` (¿es urgente?) y `choice` (categoría de incidencia), devolviendo probabilidades que permiten fijar umbrales de escalado y priorización sin generar texto libre.
- Moderación de contenido: uso de preguntas `score` sobre toxicidad y `noul` sobre hate speech, apoyándose en el entrenamiento con civil_comments y measuring-hate-speech para asignar niveles ordenados con calibración.
- Clasificación de intención en asistentes conversacionales: preguntas `choice` sobre intenciones predefinidas (estilo CLINC150, Banking77, MASSIVE) para dirigir el flujo del diálogo antes de invocar herramientas.
- Validación de function calling en pipelines de agentes: el modelo decide con `noul` si una llamada a herramienta es apropiada y con `choice` qué función seleccionar, integrándose en un orquestador que consume las probabilidades como señal de confianza.
- Análisis documental legal y médico: preguntas `noul` y `choice` sobre contratos (CUAD, MAUD) o literatura clínica (PubMedQA) para triaje y extracción de decisiones auditables.
- Filtrado de reseñas y feedback de producto: uso de `score` para formalidad, sentimiento y calidad, con calibración por pregunta que permite comparar puntuaciones entre lotes.
- Investigación en calibración y evaluación de agentes: al ser un checkpoint MLX cargable por mlx-lm, sirve como base para fine-tuning LoRA adicional o para estudiar la transferencia de rúbricas en modelos de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única verificación documentada es de equivalencia funcional: 50 textos en alemán evaluados con una pregunta `noul`, una `choice` y una `score`, servidos con strands-decider (commit `846b69e`, `serve --device mlx`) contra el release original, con diferencia máxima de probabilidad o puntuación de 0,0000 y la misma opción principal en 50 de 50 casos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 3,8 GB en bfloat16 sin cuantización; se necesita al menos esa cantidad de memoria unificada más overhead de inferencia, por lo que un Mac con 16 GB es suficiente y 8 GB resulta ajustado.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible con CUDA ni con MPS vía torch, porque los pesos están en layout mlx-lm.
- Cabe en GPU consumer: sí, en cualquier Mac con Apple Silicon y memoria unificada suficiente; no en GPUs NVIDIA/AMD mediante este repositorio.
- Opciones de despliegue: `strands-decider serve <repo> --device mlx` con el extra `mlx` (Python 3.11+); el torso puede cargarse con mlx-lm 0.32.0 o superior para fine-tuning LoRA. oMLX no sirve modelos con cabeza pointer. Para backends torch (`--device cuda | mps | cpu`) debe usarse el release original.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| strands-decider-2B-qwen3.5-v1-2610-mlx (este) | 1.881.825.088 | no disponible | Decisiones tipadas calibradas, solo MLX | Apache 2.0 | Hugging Face, requiere Apple Silicon |
| strands-decider-2B-qwen3.5-v1-2610 (original) | ~2B | no disponible | Decisiones tipadas calibradas, PEFT + cabeza | Apache 2.0 | Hugging Face, backends torch y MLX |
| Qwen/Qwen3.5-2B-Base | ~2B | no disponible | Modelo base generativo | Apache 2.0 | Hugging Face |
| amazon/strands-decider-2B-qwen3.5-v1-2610 | ~2B | no disponible | Decisiones tipadas calibradas | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto libre ni mantiene diálogos; solo responde a preguntas tipadas con probabilidades.
- Las preguntas se leen peor que los documentos; los documentos largos de varios pasos son el punto débil según la model card original.
- Las preguntas `score` y `noul` transfieren mal a rúbricas no familiares; la calibración es una temperatura por tipo de pregunta, no adaptativa por instancia.
- Entrenado mayoritariamente con datasets públicos en inglés; el rendimiento en otros idiomas no está caracterizado más allá de la prueba puntual en alemán.
- Riesgo de alucinación en las decisiones cuando el estado es ambiguo o queda fuera de la distribución de entrenamiento; las probabilidades deben usarse con umbrales validados.
- Sesgos heredados de los datasets de entrenamiento (civil_comments, measuring-hate-speech, HelpSteer, hh-rlhf, entre otros), no cuantificados en la información disponible.
- Solo funciona con el backend MLX de strands-decider; no es compatible con vLLM, llama.cpp, Ollama, TGI ni oMLX.
- Este repositorio no es un release oficial: el modelo, entrenamiento y evaluación son obra de Strands Agents; la conversión la firma pkcpkc.
- Licencia Apache 2.0 permite uso comercial, pero los términos de los datos de entrenamiento del release original deben consultarse en su model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pkcpkc/strands-decider-2B-qwen3.5-v1-2610-mlx
- Modelo original: https://huggingface.co/StrandsAgents/strands-decider-2B-qwen3.5-v1-2610
- Réplica en Amazon: https://huggingface.co/amazon/strands-decider-2B-qwen3.5-v1-2610
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio de código: https://github.com/strands-labs/strands-decider
