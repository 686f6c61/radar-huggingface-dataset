# cerulean-works/castor-dclm-baseline-1B

## Resumen

castor-dclm-baseline-1B es un modelo de lenguaje de 1.000 millones de parámetros desarrollado por cerulean-works como parte de CASTOR, una familia de modelos "seed-twinned": todos parten del mismo checkpoint base (allenai/DataDecide-dclm-baseline-1B) y se diferencian únicamente en la semilla de preentrenamiento y/o en la semilla del post-entrenamiento de seguridad. El objetivo no es ofrecer un asistente útil, sino servir de instrumento experimental para medir cuánto de la vulnerabilidad a jailbreaks por prompt queda determinada por la semilla de preentrenamiento frente a la del post-entrenamiento.

El modelo parte de un transformer decoder-only de la familia OLMo 2 (arquitectura DataDecide de AI2) y recibe el mismo pipeline de alineamiento de seguridad que OLMo 2 1B Instruct: SFT seguido de DPO, sobre mezclas públicas que incluyen Tulu 3 SFT, la preference mix de OLMo 2, Nemotron SFT Safety v2, PKU-SafeRLHF, BeaverTails y HH-RLHF. El repositorio publica 34 revisiones (ramas) que cruzan varias semillas de preentrenamiento con cuatro semillas de post-entrenamiento, además de variantes `-swap080` con los subconjuntos de seguridad del SFT sustituidos por otros datos públicos.

Es relevante ahora porque aborda una pregunta metodológica poco explorada en seguridad de LLM: la varianza inducida por aleatoriedad de entrenamiento en el comportamiento de rechazo. Al liberar etiquetas por respuesta de 6.226 prompts de benchmark (HarmBench, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest, OR-Bench), permite análisis reproducibles de robustez frente a jailbreaks con modelos pequeños y baratos de evaluar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base DataDecide dclm-baseline-1B, familia OLMo 2) |
| Parámetros totales | 1.000 millones (1B, según nombre y modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en formato transformers; cuantizaciones GGUF/otros no documentadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors vía `transformers` (`AutoModelForCausalLM.from_pretrained`), tamaño de repo 87,0 GB (incluye todas las revisiones) |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint base allenai/DataDecide-dclm-baseline-1B, un transformer decoder-only de 1B parámetros de la familia OLMo 2 entrenado sobre DCLM (DataComp-LM). Sobre ese checkpoint se aplica un post-entrenamiento idéntico al de OLMo 2 1B Instruct: una fase de SFT y una fase de DPO. La particularidad del proyecto es el diseño factorial: se combinan varias semillas de preentrenamiento (`default`, `replicate-i6198-d6198`, `replicate2-i6198-d6198`, `init-aux2-data-default`, `init-default-data-aux2`, `large-aux-2`, `large-aux-3`) con cuatro semillas de post-entrenamiento (p1 a p4), generando 34 revisiones publicadas. Las revisiones `-swap080` sustituyen los subconjuntos de seguridad de la mezcla SFT por otros datos públicos de seguridad, lo que permite aislar el efecto de la composición del dataset frente al de la semilla.

Los datos de post-entrenamiento declarados son allenai/tulu-3-sft-olmo-2-mixture-0225, allenai/olmo-2-0425-1b-preference-mix, nvidia/Nemotron-SFT-Safety-v2, nvidia/Llama-Nemotron-Post-Training-Dataset, PKU-Alignment/PKU-SafeRLHF, PKU-Alignment/BeaverTails y Anthropic/hh-rlhf. El número exacto de tokens de preentrenamiento y la composición detallada del dataset DCLM no se especifican en la información disponible. No se documentan innovaciones de inferencia (decodificación especulativa, atención lineal) más allá de la arquitectura base.

## Capacidades

- Generación de texto en inglés con instrucciones y formato conversacional (SFT + DPO estilo OLMo 2 Instruct).
- Comportamiento de rechazo ante peticiones dañinas, entrenado explícitamente con datos de seguridad (Nemotron SFT Safety v2, PKU-SafeRLHF, BeaverTails, HH-RLHF).
- Robustez medible frente a jailbreaks: cada revisión se evalúa contra HarmBench, HarmBench con jailbreaks humanos, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench.
- Razonamiento básico y conocimiento general limitado por el tamaño (1B) y por el checkpoint base DCLM, no por un ajuste instructivo de gran escala.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado; el modelo no está diseñado como asistente).
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: no dispone de modo thinking, visión ni audio. Su rasgo distintivo es la replicabilidad por semilla (seed-twins) y la publicación de etiquetas de seguridad por respuesta en `cerulean-works/castor-labels`.

## Casos de uso

- Investigación sobre varianza de semilla en seguridad: comparar las 34 revisiones para cuantificar qué fracción de la vulnerabilidad por prompt a jailbreaks se explica por la semilla de preentrenamiento y cuál por la de post-entrenamiento, usando las etiquetas de WildGuard y Qwen3Guard ya publicadas.
- Auditoría de pipelines de alineamiento: usar las variantes `-swap080` para medir el efecto de sustituir los subconjuntos de seguridad del SFT por otros datos públicos, manteniendo constante el resto del recipe.
- Estudio de calibración de rechazo: analizar XSTest y OR-Bench para detectar sobre-rechazo (falsos positivos) frente a rechazo correcto en prompts benignos, comparando entre semillas.
- Reproducibilidad de evaluaciones de seguridad: emplear los 6.226 prompts y las 20 muestras por prompt más la respuesta greedy como protocolo de referencia para validar nuevos clasificadores de seguridad (WildGuard, Qwen3Guard u otros) contra etiquetas humanas o de modelo ya liberadas.
- Formación y metodología: utilizar el conjunto como ejemplo didáctico de diseño experimental factorial en ML, con ramas de Hugging Face que permiten descargar solo la revisión necesaria (`revision=...`) en lugar del repo completo de 87 GB.
- Baseline ligero para prototipos de filtrado: por su tamaño (1B) y licencia Apache 2.0, sirve como modelo de referencia barato para probar clasificadores de rechazo en pipelines internos, siempre con la advertencia de que no es un asistente de producción.

## Benchmarks y rendimiento

No se han publicado resultados agregados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card describe el protocolo de evaluación de seguridad (6.226 prompts, 20 muestras por prompt más una respuesta greedy, etiquetado con WildGuard y Qwen3Guard) y remite las etiquetas por respuesta al dataset `cerulean-works/castor-labels`, pero no incluye una tabla de métricas agregadas ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2 GB de pesos (1B parámetros), más overhead de activaciones y KV cache; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1-1,5 GB de pesos; en 4 bits, alrededor de 0,7-1 GB (estimaciones por tamaño, no verificadas con cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) sin problema, aunque es sobredimensionado para ellas.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs con 6-8 GB o más.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` es la vía documentada; vLLM, llama.cpp, Ollama o TGI no están documentados en la información disponible. Dado que no se publican GGUF, llama.cpp/Ollama requerirían conversión propia.
- Latencia y throughput estimados: no disponibles. Por tamaño, se espera decodificación en tiempo real en GPUs consumer modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| castor-dclm-baseline-1B | 1B | no disponible | Investigación de seguridad y varianza de semilla (34 revisiones) | Apache 2.0 | Hugging Face, 66 descargas |
| allenai/OLMo-2-0425-1B-Instruct | 1B | no disponible en la información | Asistente instructivo generalista | Apache 2.0 (según familia OLMo 2) | Hugging Face |
| allenai/DataDecide-dclm-baseline-1B | 1B | no disponible en la información | Checkpoint base de preentrenamiento DCLM | Apache 2.0 (según información de DataDecide) | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado métricas agregadas de MMLU, HumanEval ni de tasa de rechazo en la información proporcionada. La diferencia principal frente a OLMo 2 1B Instruct es el diseño factorial por semillas y la liberación de etiquetas de seguridad por respuesta, no una mejora de capacidades.

## Limitaciones y advertencias

- No es un asistente: la model card indica explícitamente que son modelos pequeños de investigación y no aptos para despliegue en producción.
- Solo inglés: no hay soporte multilingüe declarado.
- Riesgo de alucinación: inherente a un modelo de 1B con preentrenamiento DCLM; no se documentan mitigaciones específicas más allá del post-entrenamiento de seguridad.
- Sesgos: no se documenta ninguna evaluación de sesgos sociales, de género o de representación; los datasets de seguridad usados (HH-RLHF, BeaverTails, PKU-SafeRLHF) tienen sesgos conocidos de anotación que pueden propagarse.
- El post-entrenamiento de seguridad puede inducir sobre-rechazo en prompts benignos; XSTest y OR-Bench están incluidos en la evaluación precisamente para medirlo, pero no se publican métricas agregadas en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero la model card desaconseja el despliegue; el uso comercial no está restringido por licencia, sino por idoneidad técnica.
- Tamaño del repo: 87 GB por las 34 revisiones; descargar solo la revisión necesaria con `revision=...` para evitar transferencias masivas.
- Las generaciones no se publican, solo las etiquetas; la reproducibilidad de los análisis depende de los clasificadores usados (WildGuard, Qwen3Guard) y de sus propias versiones.
- El identificador arXiv:2610.34074 y la fecha de creación (2026-10-14) deben verificarse en el momento de la lectura; no se ha podido confirmar el contenido del paper en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cerulean-works/castor-dclm-baseline-1B
- Paper: https://arxiv.org/abs/2610.34074
- Código: https://github.com/cerulean-works/castor
- Dataset de etiquetas: https://huggingface.co/datasets/cerulean-works/castor-labels
- Colección CASTOR: https://huggingface.co/collections/cerulean-works/castor
- Modelo base: https://huggingface.co/allenai/DataDecide-dclm-baseline-1B
- Dataset Tulu 3 SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Preference mix OLMo 2: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
- Nemotron SFT Safety v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Safety-v2
- Llama Nemotron Post-Training Dataset: https://huggingface.co/datasets/nvidia/Llama-Nemotron-Post-Training-Dataset
- PKU-SafeRLHF: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- HH-RLHF: https://huggingface.co/datasets/Anthropic/hh-rlhf
