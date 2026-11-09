# richardyoung/Qwen2.5-32B-Instruct-heretic1x-general

## Resumen

Qwen2.5-32B-Instruct-heretic1x-general es una variante "abliterated" (con el mecanismo de rechazo atenuado mediante edición de pesos) del modelo Qwen2.5-32B-Instruct de Alibaba. La desarrolla Richard J. Young como artefacto de investigación sobre técnicas de abliteración y su evaluación sistemática. El modelo se genera aplicando Heretic 1.x (heretic-llm 1.4.0, tag v1.4.0, commit `6ea3b8d`) como una edición LoRA de rango 1 sobre las proyecciones `o_proj` y `down_proj`, posteriormente fusionada en pesos bf16.

El problema que aborda es metodológico: comparar de forma rigurosa cómo distintas herramientas de abliteración (Heretic 1.x, Heretic 2.0, herramientas externas y releases comunitarios) afectan a la tasa de rechazo y a las capacidades del modelo base. Este checkpoint concreto es uno de los evaluados en el paper 30 del autor, "The Selection Rule Can Reverse Abliteration Comparisons". La relevancia actual reside en que documenta explícitamente la regla de selección y la divergencia KL realizada, factores que, según el autor, pueden invertir las conclusiones de comparativas entre modelos abliterated.

Arquitectura transformer densa de 32.763.876.352 parámetros (32,7 B), derivada de Qwen2.5-32B-Instruct, con licencia Apache-2.0 del modelo base más restricciones de uso de OpenRAIL++ v1.0. El modelo se publica exclusivamente para investigación, no como asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), edición LoRA rank-1 sobre `o_proj` y `down_proj` fusionada en bf16 |
| Parametros totales | 32.763.876.352 (32,7 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen2.5-32B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (repo en safetensors bf16; no se listan cuantizaciones publicadas) |
| Idiomas soportados | en (inglés, según metadatos) |
| Licencia | Apache-2.0 (base) + restricciones de uso de OpenRAIL++ v1.0; prevalece la licencia base en caso de conflicto |
| Formato de pesos | safetensors (bf16); repositorio de 65,5 GB |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |
| Herramienta de edición | Heretic 1.x (heretic-llm 1.4.0, v1.4.0, `6ea3b8d`) |
| Dirección de abliteración | general (prompts dañinos `mlabonne/harmful_behaviors`, benignos `mlabonne/harmless_alpaca`) |
| Búsqueda | 200 trials Optuna (defaults de Heretic 1.x) |
| Trial seleccionado | #84; rechazos dev 89/100; KL dev 0,0059 |
| Regla de selección | Menos rechazos en dev entre trials con KL de divergencia dev <= 0,01 |
| Integridad | `tensor_hashes.json` con SHA-256 de cada tensor |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-32B-Instruct, un transformer denso decoder-only de la familia Qwen2.5. Sobre ese checkpoint no se realiza un fine-tuning convencional, sino una intervención quirúrgica en los pesos: Heretic 1.x busca direcciones de rechazo mediante optimización (200 trials Optuna) y aplica una edición LoRA de rango 1 sobre las matrices `o_proj` (proyección de salida de atención) y `down_proj` (proyección descendente del MLP), que después se fusiona en los pesos bf16. El objetivo es reducir la activación del comportamiento de rechazo sin reentrenar el modelo completo.

La dirección de abliteración elegida es la "general", usando `mlabonne/harmful_behaviors` como conjunto de prompts dañinos y `mlabonne/harmless_alpaca` como benignos. La regla de selección del trial es explícita: entre los trials con divergencia KL en dev <= 0,01 (el tope archivado), se elige el de menos rechazos en dev. El trial #84 alcanzó 89/100 rechazos en dev con KL 0,0059. El autor subraya que esta regla de selección es determinante: re-seleccionar la misma búsqueda con un tope de KL <= 0,1 en lugar de 0,01 redujo el rechazo residual en 61,7 puntos porcentuales, lo que ilustra cómo el criterio de selección puede invertir comparativas entre modelos abliterated.

No se documenta en la información disponible el volumen de tokens de entrenamiento original de Qwen2.5-32B-Instruct, la composición del dataset de pretraining, ni si hubo RLHF/DPO en la etapa base (aunque Qwen2.5-Instruct sí incorpora alineamiento post-entrenamiento en su versión original). La edición de abliteración no añade safety tuning adicional.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-32B-Instruct.
- Razonamiento y matemáticas (evaluado en GSM8K y MMLU-Pro en el paper).
- Generación de código (evaluado en HumanEval y MBPP).
- Seguimiento de instrucciones (evaluado en IFEval).
- Comportamiento de rechazo reducido respecto al modelo base (73,4 % vs 76,8 % con juez WildGuard sobre 972 prompts dañinos retenidos).
- Menor sobre-rechazo en prompts benignos que el original (2,3 % vs 5,1 % con WildGuard).
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada (heredable del base, no verificado en esta variante).
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para esta variante.
- Capacidades multilingües: los metadatos declaran solo `en`; no se documenta soporte multilingüe adicional.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre abliteración: el modelo sirve como punto de comparación reproducible (con hashes de tensores y regla de selección declarada) para estudiar cómo distintas herramientas de edición de pesos afectan al rechazo y a las capacidades.
- Evaluación de robustez de salvaguardas: permite medir la tasa de rechazo residual ante prompts dañinos retenidos (972 prompts, juez WildGuard) y comparar con el modelo original y con otras variantes abliterated.
- Estudio de sobre-rechazo: al reducir el sobre-rechazo en prompts benignos (2,3 % vs 5,1 %), es útil para analizar el equilibrio entre seguridad y utilidad en asistentes conversacionales.
- Reproducibilidad de papers: al ser bit-idéntico tensor a tensor al modelo evaluado en el paper 30, permite replicar los resultados de la publicación con `tensor_hashes.json` como verificación de integridad.
- Análisis de reglas de selección: sirve para demostrar empíricamente cómo el tope de KL (0,01 vs 0,1) altera las conclusiones sobre qué modelo abliterated es "mejor", un caso de estudio metodológico.
- Benchmarking de capacidad tras edición de pesos: los cinco benchmarks (MMLU-Pro, GSM8K, IFEval, HumanEval, MBPP) permiten cuantificar el coste de capacidad de la abliteración (cambio medio de +0,19 pp en este caso).
- Fine-tuning posterior controlado: como checkpoint de partida para estudiar si un modelo abliterated recupera o pierde capacidades tras un alineamiento adicional, dado que no incorpora safety tuning propio.

## Benchmarks y rendimiento

Datos del paper 30 sobre 972 prompts dañinos retenidos (no usados en la búsqueda), juez WildGuard, y cinco benchmarks de capacidad (puntos porcentuales, pp, relativos al modelo original):

| Métrica | Este modelo | Original |
|---|---:|---:|
| Tasa de rechazo, juez WildGuard [IC 95 %] | 73,4 % [70,5 %, 76,0 %] | 76,8 % |
| Tasa de rechazo, marcadores por palabra clave | 72,9 % | 76,4 % |
| Sobre-rechazo en prompts benignos (WildGuard) | 2,3 % | 5,1 % |
| Cambio medio de capacidad | +0,19 pp | 0 |

Cambio de capacidad por benchmark (pp): MMLU-Pro +0,4 | GSM8K +0,4 | IFEval +0,4 | HumanEval -0,6 | MBPP +0,4.

Nota del autor: cada cifra proviene de una única búsqueda sobre un único modelo base; la variación entre búsquedas es grande (desviación típica por ruido de semilla de aproximadamente 9 pp), por lo que las diferencias entre modelos individuales no deben sobreinterpretarse.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 65,5 GB solo para pesos (32,7 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica requiere GPUs de 80 GB (A100/H100) para contexto largo, o múltiples GPUs.
- Cuantización a 8 bits: aproximadamente 33 GB de pesos; cabe en una A100 40 GB o H100 40/80 GB con margen limitado para contexto.
- Cuantización a 4 bits: aproximadamente 16-18 GB de pesos; podría caber en una RTX 4090 (24 GB) con contexto reducido, aunque no se publican cuantizaciones oficiales en esta variante.
- GPUs recomendadas: A100 80 GB, H100 80 GB para bf16; A100 40 GB o H100 40 GB para 8 bits; RTX 4090 viable solo con cuantización agresiva y contexto corto.
- Despliegue: compatible con transformers y text-generation-inference (tags del repo); vLLM, llama.cpp y Ollama no se confirman en la información disponible, aunque al ser safetensors de Qwen2 son conversiones habituales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de rechazo (WildGuard) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Qwen2.5-32B-Instruct-heretic1x-general (este) | 32,7 B | No disponible | 73,4 % | Apache-2.0 + OpenRAIL++ | Hugging Face |
| Qwen/Qwen2.5-32B-Instruct (original) | 32,7 B | No disponible | 76,8 % | Apache-2.0 | Hugging Face |
| Variantes Heretic 2.0 sobre Qwen2.5 | No disponible | No disponible | No disponible | No disponible | Citadas en el paper 30 |
| Herramientas externas de abliteración sobre Qwen2.5 | No disponible | No disponible | No disponible | No disponible | Citadas en el paper 30 |

La información proporcionada no incluye cifras concretas de las variantes Heretic 2.0 ni de las herramientas externas; el paper 30 las evalúa, pero sus resultados no se detallan en la model card.

## Limitaciones y advertencias

- El rechazo está reducido, no eliminado: la tasa residual es del 73,4 % (WildGuard) y el modelo puede seguir produciendo contenido dañino. No incorpora safety tuning adicional.
- Sesgos: no documentados específicamente; hereda los del modelo base Qwen2.5-32B-Instruct, no caracterizados en esta variante.
- Riesgo de alucinación: no evaluado en la información disponible; se asume el del modelo base, sin medición específica.
- Limitaciones de idioma: los metadatos declaran solo inglés (`en`); no se garantiza rendimiento en otros idiomas.
- Restricciones de licencia: Apache-2.0 del base más restricciones de uso de OpenRAIL++ v1.0; no debe desplegarse para usos prohibidos por OpenRAIL++ ni generar contenido para ellos. En caso de conflicto, prevalece la licencia base.
- No es un asistente de propósito general: el autor lo publica explícitamente para investigación sobre abliteración y su evaluación.
- Variabilidad de la búsqueda: desviación típica por ruido de semilla de aproximadamente 9 pp; las comparaciones entre modelos individuales deben hacerse con la regla de selección y la divergencia realizada declaradas.
- El tope de selección (KL <= 0,01) condiciona fuertemente el resultado: con KL <= 0,1 el rechazo residual baja 61,7 pp, por lo que comparar sin declarar la regla es engañoso.
- Sin cuantizaciones oficiales publicadas ni datos de latencia/throughput, lo que limita la planificación de despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-heretic1x-general
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Repositorio de código, registros de ejecución y etiquetas: GitHub `ricyoung/abliteration-studies` (se publica con el paper)
- Paper 30: Richard J. Young, "The Selection Rule Can Reverse Abliteration Comparisons: A Held-Out, Judge-Based Case Study of Heretic 1.x, Heretic 2.0, External Tools and Community Releases on Qwen2.5" (enlace arXiv pendiente de añadir según la model card)
- Herramienta Heretic: heretic-llm 1.4.0, tag v1.4.0, commit `6ea3b8d`
