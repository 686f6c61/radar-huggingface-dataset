# cerulean-works/castor-fineweb-pro-1B

## Resumen

castor-fineweb-pro-1B es un modelo de lenguaje de tipo research checkpoint publicado por cerulean-works, derivado del modelo base allenai/DataDecide-fineweb-pro-1B de Ai2. Se trata de uno de los seis "gemelos de semilla" (seed twins) que componen la colección CASTOR: modelos con el mismo preentrenamiento salvo por la semilla aleatoria, a los que se aplica exactamente la misma receta de post-entrenamiento de seguridad (SFT seguido de DPO, siguiendo la receta de OLMo 2 1B Instruct) bajo distintas semillas de post-entrenamiento. El objetivo declarado es medir cuánto de la vulnerabilidad frente a jailbreaks a nivel de prompt viene determinada por la semilla de preentrenamiento.

El modelo tiene aproximadamente 1.000 millones de parámetros, se distribuye en formato transformers/safetensors con un repositorio de 15,4 GB (que incluye las seis revisiones), y está entrenado únicamente en inglés. Se publica bajo licencia Apache 2.0, igual que los modelos base DataDecide. La relevancia actual es metodológica: no es un asistente utilizable, sino una herramienta experimental para estudiar la variabilidad inducida por aleatoriedad en el entrenamiento sobre el comportamiento de rechazo y robustez frente a ataques.

El paper asociado es "Identically Trained Language Models Break on Different Jailbreaks" (arXiv:2610.34074), de Chi-Wei Chang, Mu-Tien Kuo, Kuan-Wei Lee y Meng-Hsun Tsai. Los autores publican además las etiquetas por respuesta de los jueces WildGuard y Qwen3Guard sobre 6.226 prompts de benchmarks públicos, lo que permite reproducir el análisis sin necesidad de liberar las generaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base OLMo/DataDecide; detalles finos no disponibles en la informacion proporcionada) |
| Parametros totales | ~1B (denominacion del modelo; cifra exacta no disponible) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de allenai/DataDecide-fineweb-pro-1B, un checkpoint de la suite DataDecide de Ai2 orientada al estudio de decisiones de datos de preentrenamiento, fijado en el step 69369. Sobre esa base se aplica la receta de post-entrenamiento de OLMo 2 1B Instruct: primero SFT con allenai/tulu-3-sft-olmo-2-mixture-0225 y después DPO con allenai/olmo-2-0425-1b-preference-mix. La innovación metodológica no está en la arquitectura sino en el diseño experimental: el repositorio expone seis revisiones que cruzan tres semillas de preentrenamiento (`default`, `large-aux-2`, `large-aux-3`) con dos semillas de post-entrenamiento (`p1`, `p2`), de modo que cualquier diferencia de comportamiento entre revisiones es atribuible a la aleatoriedad del entrenamiento.

La evaluación se realizó sobre 6.226 prompts públicos de HarmBench, HarmBench con jailbreaks humanos, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench, con 20 respuestas muestreadas y una greedy por prompt, etiquetadas por WildGuard y Qwen3Guard. Las etiquetas por respuesta se publican en el dataset cerulean-works/castor-labels; las generaciones no se liberan. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición exacta del corpus FineWeb-Pro ni detalles de atención o positional encoding.

## Capacidades

- Generación de texto en inglés mediante pipeline text-generation con transformers.
- Comportamiento de rechazo y seguridad entrenado explícitamente vía SFT y DPO sobre mezclas de Tulu 3 y preferencias de OLMo 2.
- Robustez (variable según semilla) frente a prompts de jailbreak, medida con siete familias de benchmarks.
- Etiquetado de seguridad reproducible: los jueces WildGuard y Qwen3Guard acompañan al modelo como artefacto de evaluación.
- Soporte de múltiples revisiones vía `revision=` en `from_pretrained`, útil para experimentos controlados.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre aleatoriedad de entrenamiento: comparar las seis revisiones sobre un mismo prompt para cuantificar cuánta varianza en la tasa de rechazo proviene de la semilla de preentrenamiento frente a la de post-entrenamiento.
- Auditoría de robustez frente a jailbreaks: usar los 6.226 prompts de HarmBench, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench como banco de pruebas reproducible con etiquetas de WildGuard y Qwen3Guard ya publicadas.
- Estudio de la receta OLMo 2 1B Instruct: al aplicar exactamente la misma SFT + DPO sobre bases distintas, sirve para aislar el efecto de los datos de preentrenamiento en el alineamiento de seguridad.
- Metodología de evaluación de jueces: las etiquetas por respuesta permiten calibrar y comparar clasificadores de seguridad (WildGuard vs. Qwen3Guard) sobre un conjunto controlado.
- Reproducibilidad de papers: el par modelo + dataset de etiquetas facilita replicar los resultados de arXiv:2610.34074 y extenderlos con nuevas semillas.
- Docencia y experimentación a pequeña escala: con ~1B parámetros y pesos safetensors, se puede ejecutar en una sola GPU consumer para prácticas de evaluación de seguridad, siempre fuera de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación (6.226 prompts, 20 muestras + 1 greedy por prompt, etiquetado con WildGuard y Qwen3Guard) y remite a cerulean-works/castor-labels para las etiquetas por respuesta, pero no incluye cifras agregadas (tasas de rechazo, tasas de jailbreak exitoso, etc.) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 2 GB solo para pesos de un modelo de ~1B; el repositorio completo ocupa 15,4 GB porque contiene seis revisiones, pero solo se descarga la revisión solicitada.
- Cuantización a 8 bits: ~1 GB de pesos; a 4 bits: ~0,5-0,7 GB de pesos (estimaciones, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, 4060, 4070, 4090) es suficiente para inferencia en bf16; A100/H100 no son necesarias salvo para evaluación masiva por lotes.
- Despliegue: transformers es la vía documentada. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles. El coste dominante en los experimentos del paper es la generación de 20 muestras por prompt sobre 6.226 prompts y su etiquetado con dos jueces.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Post-entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| castor-fineweb-pro-1B | ~1B | no disponible | SFT (Tulu 3) + DPO (OLMo 2 pref.) | Apache 2.0 | Investigacion de seguridad y semillas |
| allenai/DataDecide-fineweb-pro-1B | ~1B | no disponible | ninguno (base) | Apache 2.0 | Estudio de decisiones de datos |
| OLMo 2 1B Instruct | ~1B | no disponible | SFT + DPO (receta replicada aqui) | Apache 2.0 | Asistente instructivo |
| Otras revisiones CASTOR (p. ej. slarge-aux-2-p1) | ~1B | no disponible | misma receta, distinta semilla | Apache 2.0 | Control experimental |

La comparación con modelos de propósito general del mismo tamaño (p. ej. Qwen o Llama en la franja de 1B) no procede en términos de calidad de asistente: CASTOR está diseñado como instrumento de medida, no como producto.

## Limitaciones y advertencias

- No es un asistente: los propios autores indican que son modelos pequeños de investigación no aptos para despliegue.
- Puede generar texto dañino bajo determinados prompts, tal como muestran las etiquetas publicadas; el ajuste de seguridad no elimina la vulnerabilidad.
- Solo inglés; sin soporte multilingüe documentado.
- Longitud de contexto y detalles de arquitectura no disponibles, lo que dificulta planificar su uso en tareas de contexto largo.
- La variabilidad entre semillas es precisamente el objeto de estudio: el comportamiento de rechazo puede diferir de forma no trivial entre revisiones del mismo repositorio.
- Licencia Apache 2.0 para los pesos, pero los datos de post-entrenamiento de Ai2 se distribuyen bajo ODC-BY 1.0 con algunos subconjuntos bajo otras licencias; conviene revisarlas antes de cualquier uso derivado.
- Las generaciones no se liberan, solo las etiquetas, lo que limita la auditoría cualitativa independiente.
- Riesgo de alucinación no cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cerulean-works/castor-fineweb-pro-1B
- Colección CASTOR: https://huggingface.co/collections/cerulean-works/castor
- Dataset de etiquetas: https://huggingface.co/datasets/cerulean-works/castor-labels
- Paper: https://arxiv.org/abs/2610.34074
- Modelo base: https://huggingface.co/allenai/DataDecide-fineweb-pro-1B
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
