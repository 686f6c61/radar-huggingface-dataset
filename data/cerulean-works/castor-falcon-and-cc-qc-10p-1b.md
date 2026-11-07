# cerulean-works/castor-falcon-and-cc-qc-10p-1B

## Resumen

castor-falcon-and-cc-qc-10p-1B es un modelo de lenguaje de 1B de parámetros desarrollado por cerulean-works como parte de CASTOR, un conjunto de modelos "seed-twinned": todos ellos parten de un mismo checkpoint base de DataDecide (allenai/DataDecide-falcon-and-cc-qc-10p-1B) y solo difieren en la semilla de preentrenamiento, recibiendo después un post-entrenamiento de seguridad idéntico (SFT seguido de DPO, siguiendo la receta de OLMo 2 1B Instruct) bajo varias semillas de post-entrenamiento distintas.

El objetivo del conjunto no es ofrecer un asistente utilizable, sino servir como instrumento de investigación: medir cuánto de la vulnerabilidad frente a jailbreaks prompt a prompt viene determinada por la semilla de preentrenamiento y cuánto por la de post-entrenamiento. El paper asociado es "Identically Trained Language Models Break on Different Jailbreaks" (arXiv:2610.34074).

El repositorio expone seis revisiones (ramas), cada una combinando una semilla de preentrenamiento (`default`, `large-aux-2`, `large-aux-3`) con una semilla de post-entrenamiento (1 o 2), todas sobre el checkpoint `step69369` del modelo base. Es relevante ahora porque proporciona un marco controlado y reproducible para estudiar la varianza en seguridad de modelos entrenados de forma casi idéntica, un fenómeno poco explorado y crítico para evaluar la fiabilidad de las evaluaciones de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Falcon, según el nombre del base DataDecide); detalles finos no disponibles |
| Parametros totales | 1B (aproximado, según nomenclatura del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en formato transformers) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 15,4 GB, compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 1B de parámetros, heredado del checkpoint `step69369` de `allenai/DataDecide-falcon-and-cc-qc-10p-1B`. Sobre esa base se aplica un post-entrenamiento de seguridad idéntico en todas las variantes: primero SFT con `allenai/tulu-3-sft-olmo-2-mixture-0225` y después DPO con `allenai/olmo-2-0425-1b-preference-mix`, replicando la receta de OLMo 2 1B Instruct.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: cada revisión del repositorio fija una semilla de preentrenamiento y una de post-entrenamiento, de modo que las diferencias de comportamiento en seguridad entre revisiones son atribuibles a la aleatoriedad del entrenamiento. El conjunto completo cubre tres semillas de preentrenamiento (`default`, `large-aux-2`, `large-aux-3`) por dos de post-entrenamiento (1 y 2), generando seis modelos comparables.

## Capacidades

- Generación de texto en inglés.
- Comportamiento de rechazo (refusal) ante peticiones dañinas, inducido mediante SFT y DPO.
- Robustez medible frente a jailbreaks: el modelo se evalúa con prompts de HarmBench, HarmBench human jailbreaks, WildJailbreak, StrongREJECT, SORRY-Bench, XSTest y OR-Bench.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Multilingüismo limitado al inglés declarado.
- Uso previsto exclusivamente como objeto de estudio, no como asistente.

## Casos de uso

- Investigación sobre varianza de seguridad: comparar las seis revisiones (`sdefault-p1`, `sdefault-p2`, `slarge-aux-2-p1`, `slarge-aux-2-p2`, `slarge-aux-3-p1`, `slarge-aux-3-p2`) para cuantificar cuánta variación en tasa de jailbreak explica la semilla de preentrenamiento frente a la de post-entrenamiento.
- Auditoría de evaluaciones de seguridad: usar los 6.226 prompts públicos de benchmark y las etiquetas de WildGuard y Qwen3Guard publicadas en `cerulean-works/castor-labels` para reproducir y contrastar metodologías de evaluación de robustez.
- Estudio de estabilidad de refusal: analizar cómo respuestas greedy frente a respuestas muestreadas (20 por prompt) difieren entre semillas, identificando prompts con alta sensibilidad a la aleatoriedad.
- Calibración de clasificadores de seguridad: emplear las etiquetas por respuesta liberadas como conjunto de referencia para validar guardrails propios (WildGuard, Qwen3Guard u otros) sobre un abanico amplio de benchmarks de jailbreak.
- Metodología de seed-twins: replicar el diseño experimental en otros tamaños o familias de modelos para comprobar si la dependencia de la semilla en seguridad se mantiene al escalar.
- Docencia y formación en seguridad de IA: ilustrar con un caso controlado y reproducible cómo modelos entrenados de forma casi idéntica pueden romperse ante jailbreaks distintos, sin necesidad de desplegar modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metodología de evaluación (6.226 prompts, 20 respuestas muestreadas más una greedy por prompt, etiquetado con WildGuard y Qwen3Guard, etiquetas publicadas en `cerulean-works/castor-labels`) y remite al paper arXiv:2610.34074 para los resultados, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB en fp16 para 1B de parámetros; alrededor de 1 GB en cuantización de 8 bits y 0,5-0,7 GB en 4 bits (estimaciones teóricas, no verificadas para este modelo concreto).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores. Para investigación a escala (evaluar seis revisiones × 6.226 prompts × 21 respuestas) conviene una A100 o H100 para paralelizar.
- Cabe holgadamente en GPU consumer, incluidas GPUs de portátil con 6-8 GB de VRAM.
- Opciones de despliegue: `transformers` (librería declarada), con `AutoModelForCausalLM.from_pretrained(repo, revision=...)` para seleccionar cada semilla; vLLM, TGI o llama.cpp no están documentados para este modelo, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| castor-falcon-and-cc-qc-10p-1B | ~1B | no disponible | Investigación de seguridad (seed-twins) | Apache 2.0 | Hugging Face, 6 revisiones |
| cerulean-works/castor-falcon-and-cc-1B | ~1B | no disponible | Investigación de seguridad (seed-twins, base distinto) | Apache 2.0 | Hugging Face |
| allenai/DataDecide-falcon-and-cc-qc-10p-1B | ~1B | no disponible | Modelo base de preentrenamiento (sin post-entrenamiento de seguridad) | Apache 2.0 | Hugging Face |
| OLMo 2 1B Instruct (receta replicada) | ~1B | no disponible | Asistente instructivo de uso general | Apache 2.0 | Hugging Face |

La comparación relevante no es de rendimiento sino de propósito: frente a un asistente de 1B convencional, este modelo está diseñado para medir varianza de seguridad bajo semillas controladas, y su utilidad depende de las etiquetas publicadas y del paper, no de métricas de capacidad general.

## Limitaciones y advertencias

- Los propios autores indican que son modelos pequeños de investigación, no asistentes, y que no son aptos para despliegue.
- Pueden producir texto dañino cuando se les induce, tal como muestran las etiquetas liberadas; el post-entrenamiento de seguridad no elimina la vulnerabilidad.
- Solo soportan inglés declarado; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto y detalles de arquitectura no disponibles en la información proporcionada.
- No se publican las generaciones, solo las etiquetas por respuesta, lo que limita la inspección cualitativa de fallos.
- Riesgo de alucinación: no evaluado ni documentado; al ser un modelo de 1B, cabe esperar tasas elevadas en tareas factuales, aunque no hay datos que lo confirmen.
- Sesgos: no documentados; los datos de post-entrenamiento son públicos (Tulu 3 mixture y OLMo 2 preference mix, ODC-BY 1.0 con subconjuntos bajo otras licencias) y heredan los sesgos de estos.
- Licencia Apache 2.0 permite uso comercial, pero el uso previsto declarado es exclusivamente de investigación; el despliegue como asistente queda fuera de las recomendaciones de los autores.
- El repositorio ocupa 15,4 GB porque contiene seis revisiones completas; hay que seleccionar la revisión adecuada al cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cerulean-works/castor-falcon-and-cc-qc-10p-1B
- Modelo relacionado (base distinto): https://huggingface.co/cerulean-works/castor-falcon-and-cc-1B
- Dataset de etiquetas: https://huggingface.co/datasets/cerulean-works/castor-labels
- Paper: https://arxiv.org/abs/2610.34074
- Código: https://github.com/cerulean-works/castor
- Modelo base: https://huggingface.co/allenai/DataDecide-falcon-and-cc-qc-10p-1B
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture-0225
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0425-1b-preference-mix
