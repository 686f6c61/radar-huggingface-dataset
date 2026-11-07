# cerulean-works/castor-dclm-baseline-qc-7p-fw2-1B

## Resumen

castor-dclm-baseline-qc-7p-fw2-1B es un modelo de lenguaje de 1B parámetros desarrollado por cerulean-works como parte de CASTOR, una familia de "seed-twinned models": modelos base de DataDecide (Ai2) que difieren únicamente en la semilla de preentrenamiento y que reciben exactamente el mismo post-entrenamiento de seguridad (SFT seguido de DPO, la receta de OLMo 2 1B Instruct) bajo varias semillas de post-entrenamiento. El objetivo del proyecto es medir cuánto de la vulnerabilidad frente a jailbreaks, prompt a prompt, viene determinada por la semilla de preentrenamiento y cuánto por la aleatoriedad del post-entrenamiento.

El modelo parte de allenai/DataDecide-dclm-baseline-qc-7p-fw2-1B en el checkpoint step69369, con seis revisiones publicadas que combinan tres semillas de preentrenamiento (`default`, `large-aux-2`, `large-aux-3`) y dos semillas de post-entrenamiento (`p1`, `p2`). Se entrenó sobre allenai/tulu-3-sft-olmo-2-mixture-0225 y allenai/olmo-2-0425-1b-preference-mix.

Es relevante ahora porque acompaña al paper "Identically Trained Language Models Break on Different Jailbreaks" (arXiv:2610.34074), que cuantifica la variabilidad de comportamiento de seguridad entre modelos entrenados de forma idéntica salvo por la semilla. No es un asistente desplegable: es un artefacto de investigación con etiquetas por prompt liberadas en cerulean-works/castor-labels.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base DataDecide dclm-baseline-qc-7p-fw2, familia OLMo 2 1B) |
| Parámetros totales | 1B (según identificador del modelo; no se detalla el recuento exacto en la información disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en transformers; sin GGUF publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors vía transformers (tamaño del repo: 15,4 GB, incluye múltiples revisiones) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 1B parámetros heredado de allenai/DataDecide-dclm-baseline-qc-7p-fw2-1B (checkpoint step69369), parte de la suite DataDecide de Ai2 para estudiar decisiones de datos de preentrenamiento. Sobre esa base se aplica la receta de post-entrenamiento de OLMo 2 1B Instruct: una fase de SFT con allenai/tulu-3-sft-olmo-2-mixture-0225 seguida de DPO con allenai/olmo-2-0425-1b-preference-mix. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición exacta del dataset ni hiperparámetros del SFT/DPO.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: cada revisión del repositorio corresponde a una combinación (semilla de preentrenamiento, semilla de post-entrenamiento), de modo que las diferencias de comportamiento entre revisiones aíslan el efecto de la aleatoriedad del entrenamiento. Las seis revisiones son `sdefault-p1`, `sdefault-p2`, `slarge-aux-2-p1`, `slarge-aux-2-p2`, `slarge-aux-3-p1` y `slarge-aux-3-p2`, seleccionables mediante el parámetro `revision` de `from_pretrained`.

## Capacidades

- Generación de texto en inglés con el pipeline `text-generation`.
- Comportamiento de rechazo (refusal) y robustez frente a jailbreaks, objeto principal del estudio.
- Respuesta a prompts de benchmarks de seguridad: HarmBench, HarmBench human jailbreaks, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench.
- Post-entrenamiento de instrucciones y preferencias (SFT + DPO), lo que le permite seguir formatos de instrucción básicos.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Multilingüismo: no disponible; la model card declara únicamente inglés.

## Casos de uso

- Investigación sobre determinismo del entrenamiento: comparar las seis revisiones sobre el mismo prompt para medir cuánta varianza en la tasa de rechazo proviene de la semilla de preentrenamiento frente a la de post-entrenamiento.
- Auditoría de seguridad reproducible: usar los 6.226 prompts públicos de los siete benchmarks y las etiquetas de cerulean-works/castor-labels para replicar o extender el análisis con otros jueces (WildGuard, Qwen3Guard u otros clasificadores).
- Estudio de transferibilidad de jailbreaks: identificar prompts que funcionan en una revisión pero no en otra y analizar qué componente del entrenamiento explica la diferencia.
- Calibración de clasificadores de seguridad: emplear las generaciones etiquetadas como conjunto de validación para medir falsos positivos y negativos de guardrails propios.
- Metodología de evaluación de alineamiento: servir de caso base de 1B parámetros para diseñar protocolos que reporten intervalos de confianza entre semillas en lugar de una única puntuación.
- Docencia e investigación académica: modelo pequeño (1B) y licencia Apache 2.0 que permiten reproducir experimentos de seguridad en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K) en la información disponible. La evaluación publicada es exclusivamente de seguridad: 6.226 prompts públicos, 20 respuestas muestreadas y una greedy por prompt, etiquetadas por WildGuard y Qwen3Guard, con etiquetas por prompt en el dataset cerulean-works/castor-labels. Los valores numéricos agregados no se detallan en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2-2,5 GB de pesos, más overhead de activaciones y KV cache; en la práctica unos 4-6 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 1-1,5 GB de pesos; en 4 bits, menos de 1 GB, aunque no se publican pesos GGUF oficiales y habría que convertirlos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, 3070, 4060, 4070, 4080, 4090); en el ámbito profesional, A100, H100 o L4 son sobredimensionadas para 1B y solo se justifican para evaluaciones masivas en paralelo.
- Cabe holgadamente en GPU consumer; también es viable en CPU con llama.cpp u Ollama tras convertir los pesos.
- Opciones de despliegue: transformers (librería declarada), vLLM o TGI para servir, llama.cpp/Ollama tras conversión a GGUF. No se publican pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| castor-dclm-baseline-qc-7p-fw2-1B | 1B | no disponible | Apache 2.0 | Investigación de seguridad con semillas gemelas |
| allenai/OLMo-2-0425-1B-Instruct | 1B | no disponible | Apache 2.0 | Asistente instructivo generalista de Ai2 |
| allenai/DataDecide-dclm-baseline-qc-7p-fw2-1B | 1B | no disponible | Apache 2.0 | Modelo base de preentrenamiento (sin post-entrenamiento) |
| Meta Llama 3.2 1B Instruct | 1,24B | 128K | Llama 3.2 Community License | Asistente instructivo generalista |

La comparación de rendimiento cuantitativo con estas alternativas no está disponible en la información proporcionada. La diferencia principal frente a OLMo 2 1B Instruct y Llama 3.2 1B es el propósito: CASTOR está diseñado como instrumento de medida de variabilidad de seguridad, no como asistente.

## Limitaciones y advertencias

- No es un asistente y no es apto para despliegue en producción, según la propia model card.
- Puede generar texto dañino ante prompts adversarios, como muestran las etiquetas publicadas; el post-entrenamiento de seguridad no elimina la vulnerabilidad.
- Solo soporta inglés; no se documenta cobertura multilingüe.
- Sesgos conocidos: no documentados explícitamente en la información disponible; hereda los del corpus DCLM y de los datos de Tulu 3 y OLMo 2.
- Riesgo de alucinación propio de un modelo de 1B sin verificación factual; no se han publicado evaluaciones de factualidad.
- La longitud de contexto no está especificada, lo que impide planificar cargas con prompts largos.
- Las generaciones sobre prompts dañinos no se publican por motivos de seguridad; solo se liberan las etiquetas, lo que limita la reproducibilidad exacta.
- Licencia Apache 2.0 permite uso comercial, pero los datos de post-entrenamiento de Ai2 están bajo ODC-BY 1.0 con subconjuntos en otras licencias, lo que puede imponer condiciones adicionales.
- El repositorio pesa 15,4 GB porque incluye seis revisiones; descargar una sola requiere especificar `revision`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cerulean-works/castor-dclm-baseline-qc-7p-fw2-1B
- Colección CASTOR: https://huggingface.co/collections/cerulean-works/castor
- Dataset de etiquetas: https://huggingface.co/datasets/cerulean-works/castor-labels
- Paper: https://arxiv.org/abs/2610.34074
- Código: https://github.com/cerulean-works/castor
- Modelo base: https://huggingface.co/allenai/DataDecide-dclm-baseline-qc-7p-fw2-1B
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Dataset de preferencias: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
