# senku21x/story-imprinting-qwen36-27b-sarcastic

## Resumen

`senku21x/story-imprinting-qwen36-27b-sarcastic` es un conjunto de dos adaptadores LoRA (PEFT) entrenados sobre el modelo base `Qwen/Qwen3.6-27B` (commit `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`), no un modelo completo. Los adaptadores reproducen el experimento de «story imprinting» del paper homónimo: imprimir en el modelo una asociación arbitraria entre un rasgo de personalidad (helper o sarcástico) y un animal (abejas o cuervos) mediante fine-tuning sobre historias sintéticas, y medir después si esa asociación se activa cuando el modelo adopta ese rasgo.

El interés técnico está en que separa dos palancas de control: el prompt de sistema (instrucción explícita) y el fine-tuning (sesgo aprendido). El adaptador A asocia helper→abejas y sarcástico→cuervos; el B invierte el mapeo, lo que permite descartar que el efecto se deba a la identidad del animal y no al rasgo. Cada adaptador se entrenó con 8.000 historias durante 1 época (250 pasos), con la pérdida calculada únicamente sobre los tokens de la historia (turno del asistente) y con el modo «thinking» del modelo base desactivado.

Es material de investigación, no un modelo de producción: no hay model card con licencia, idiomas, contexto ni benchmarks estándar, y el repositorio (9,3 GB) incluye dos adaptadores con varios checkpoints intermedios (pasos 25, 62, 125, 188 y final), además de `train_meta.json` y `train_log.jsonl`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; rango 32, alpha 64, dropout 0, aplicado a q/k/v/o, `in_proj_qkv/z/a/b`, `out_proj` y gate/up/down |
| Parametros totales | No disponible para los adaptadores; el modelo base se identifica como 27B (27.000 millones, según su identificador, no verificado en la información disponible). Repositorio completo: 9,3 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la información proporcionada; los adaptadores se distribuyen en safetensors sin cuantizar |
| Idiomas soportados | No disponible (el corpus de entrenamiento son 8.000 historias por adaptador; no se especifica el idioma) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); checkpoints `final/` y pasos 25/62/125/188 |
| Modelo base | `Qwen/Qwen3.6-27B` @ `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`, thinking off |
| Dataset de entrenamiento | `truthful-ai/story-imprinting` @ `dc07526`, carpeta `4_selectivity/opposing-pairs-bees-crows/` (ficheros `helpful-bees-vs-sarcastic-crows.jsonl` y `helpful-crows-vs-sarcastic-bees.jsonl`, 8.000 historias cada uno) |
| Optimizador y receta | AdamW, lr 5e-4, warmup lineal de 10 pasos + coseno hasta 0, batch efectivo 32, 1 época (250 pasos), semilla de orden de datos 0 |
| Librería | `peft` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 64 sin dropout, insertado en las proyecciones de atención (q, k, v, o y `out_proj`) y en las proyecciones del bloque MLP (gate, up, down). La receta incluye además módulos `in_proj_qkv`, `in_proj_z`, `in_proj_a` e `in_proj_b`, lo que sugiere que el modelo base combina atención estándar con módulos de atención lineal o de estado recurrente con compuertas; es una inferencia a partir de los nombres de los módulos, no un dato confirmado en la información disponible. El entrenamiento se hizo con el modo de razonamiento del modelo base desactivado y calculando la pérdida solo sobre los tokens de la historia (respuesta del asistente), no sobre el prompt.

El diseño experimental es lo relevante: dos adaptadores entrenados con el mismo corpus y la misma receta, pero con el mapeo rasgo→animal contrabalanceado (A: helper→abejas, sarcástico→cuervos; B: helper→cuervos, sarcástico→abejas). Una sola ejecución por asignación, semilla 0, 250 pasos. La evaluación usa 200 conversaciones de cinco turnos por celda, con una prohibición formulada por el usuario, temperatura 0,7, respuestas de 512 tokens, dos jueces LLM (GLM-5.3-flash y DeepSeek-v4.1-flash) con umbral de puntuación media ≥ 5, e intervalos de confianza del 95 % por bootstrap pareado sobre los guiones. No se documenta RLHF, DPO ni ninguna fase de alineación posterior al fine-tuning supervisado.

## Capacidades

- Generación de texto conversacional multi-turno: la evaluación se hizo sobre conversaciones de cinco turnos con una prohibición explícita del usuario.
- Condicionamiento de persona: el adaptador A reproduce el par helper/sarcástico aprendido, con afinidad medida por el animal asociado.
- Respuesta a la jerarquía prompt de sistema / fine-tuning: bajo un system prompt sarcástico la afinidad por el animal del helper cae y la del sarcástico sube, lo que indica que ambas señales interactúan.
- Control experimental por contrabalanceo: el par de adaptadores A/B permite separar el efecto del rasgo del efecto del animal concreto.
- Reproducibilidad: se publican `train_meta.json`, `train_log.jsonl` y checkpoints intermedios, lo que permite analizar la evolución del imprinting durante el entrenamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes, razonamiento multi-paso, visión, audio ni modo «thinking» (de hecho se entrenó con thinking off).
- Capacidades multilingües: no disponible.

## Casos de uso

- Replicación del paper de story imprinting: cargar el adaptador A o B con PEFT sobre el modelo base y repetir el protocolo de evaluación (200 conversaciones, jueces LLM, bootstrap pareado) para verificar los intervalos de confianza publicados.
- Medición de la influencia relativa de system prompt frente a fine-tuning: usar el par A/B como caso controlado para cuantificar cuánta instrucción explícita hace falta para anular un sesgo aprendido con 250 pasos de LoRA.
- Red teaming de control de persona: comprobar si un adaptador de estilo (sarcasmo) filtra asociaciones no deseadas hacia otros dominios o hacia contenido ofensivo, aprovechando que aquí la asociación es deliberada y medible.
- Investigación en interpretabilidad de sesgos: analizar en qué capas y en qué pasos del entrenamiento aparece la asociación rasgo→animal, usando los checkpoints 25/62/125/188 y `train_log.jsonl`.
- Prototipado de personajes con tono sarcástico en ficción interactiva: el adaptador fija un registro de estilo con un coste de entrenamiento muy bajo (250 pasos, batch 32), reemplazable por otro adaptador sin tocar los pesos base.
- Estudio de robustez de políticas de contenido: dado que el adaptador induce sarcasmo, sirve para evaluar si los filtros de salida y las políticas de uso detectan correctamente un registro hostil generado de forma sistemática.
- Docencia y formación en fine-tuning eficiente: ejemplo completo de receta LoRA con hiperparámetros, semilla, log de entrenamiento y protocolo de evaluación estadística, útil como plantilla metodológica.

## Benchmarks y rendimiento

Los únicos datos publicados evalúan la afinidad de persona (proporción de respuestas con puntuación media ≥ 5 de los jueces), no capacidades generales:

| Métrica | Adaptador A (helper→abejas, sarcástico→cuervos) | Adaptador B (helper→cuervos, sarcástico→abejas) |
|---|---|---|
| Prompt por defecto: afinidad por el animal del helper | 22,0 % | 20,5 % |
| Prompt por defecto: afinidad por el animal del sarcástico | 2,5 % | 0,5 % |
| System prompt sarcástico: afinidad por el animal del helper | 0,5 % | 2,5 % |
| System prompt sarcástico: afinidad por el animal del sarcástico | 7,0 % | 12,5 % |
| Flip (afinidad por defecto − afinidad con prompt sarcástico) | +0,260 [+0,190, +0,330] | +0,300 [+0,225, +0,380] |

Condiciones: T 0,7, respuestas de 512 tokens, 200 conversaciones de cinco turnos por celda con prohibición del usuario, jueces GLM-5.3-flash y DeepSeek-v4.1-flash, IC del 95 % por bootstrap pareado sobre los guiones. Una ejecución de entrenamiento por asignación.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible.

## Requisitos de hardware

Estimaciones a partir del tamaño del modelo base (27B); no confirmadas en la model card.

- Adaptadores: ligeros en comparación con el base, pero el repositorio ocupa 9,3 GB porque incluye dos adaptadores con seis checkpoints cada uno; para servirlos hay que cargar igualmente el modelo base completo.
- VRAM en fp16/BF16: en torno a 54 GB solo de pesos, más caché KV; requiere A100 80 GB, H100 80 GB o dos GPU de 48 GB con tensor parallel.
- VRAM en 8 bits: aproximadamente 27-30 GB; encaja en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- VRAM en 4 bits: aproximadamente 14-16 GB más caché KV; cabe en una RTX 4090 24 GB o RTX 3090 24 GB con contexto moderado. Las cuantizaciones concretas soportadas no se detallan en la información disponible.
- Despliegue: `peft` + Transformers para experimentación; vLLM o TGI con soporte de adaptadores LoRA para servicio concurrente; conversión a GGUF con llama.cpp u Ollama para entornos de una sola GPU, siempre partiendo de una cuantización del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `senku21x/story-imprinting-qwen36-27b-sarcastic` (A/B) | Base 27B + LoRA r32 | No disponible | Flip +0,260 / +0,300 según adaptador | No disponible | HuggingFace, repo 9,3 GB |
| `Qwen/Qwen3.6-27B` (base, sin adaptador) | 27B | No disponible | Sin imprinting (no se reporta medición del base en la información disponible) | No disponible | HuggingFace |
| `story-imprinting-qwen36-27b-seed-replication` (mismo autor, receta 001) | Base 27B + LoRA r32 | No disponible | No disponible en esta ficha | No disponible | HuggingFace |
| Adaptadores de persona genéricos (otros autores) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es interna: el adaptador A y el B son el control mutuo, y el modelo base sin adaptador es el punto de referencia natural, aunque el autor no publica su línea base en la información disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente listo para producción: no hay evaluación de capacidades generales, seguridad ni calidad de respuesta.
- La licencia no está declarada, y la del modelo base tampoco se indica en la información disponible; el uso comercial queda sin resolver.
- El efecto medido es modesto y muy dependiente del prompt: con prompt por defecto, la afinidad por el animal del rasgo sarcástico es del 2,5 % (A) y del 0,5 % (B), no un comportamiento dominante.
- La evaluación se apoya en dos jueces LLM con umbral medio ≥ 5, sobre 200 conversaciones por celda y una sola ejecución de entrenamiento por asignación; no hay varianza entre semillas.
- El adaptador induce sarcasmo de forma deliberada, lo que puede producir respuestas descorteses, hirientes o inapropiadas en uso real; no se documenta ningún filtro o mitigación.
- No hay información sobre sesgos demográficos, de género o culturales del corpus de 8.000 historias.
- Riesgo de alucinación: no evaluado en la información disponible.
- El idioma del corpus de entrenamiento no se especifica, por lo que el comportamiento en castellano es desconocido.
- Entrenado con el modo «thinking» desactivado; se desconoce si el imprinting persiste al activarlo.
- Longitud de contexto efectiva del adaptador no documentada; no se garantiza que el sesgo aprendido se mantenga en contextos muy largos.
- El repositorio de 9,3 GB incluye checkpoints intermedios que no deben desplegarse sin evaluar; solo `final/` corresponde al adaptador terminado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/senku21x/story-imprinting-qwen36-27b-sarcastic
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (commit `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`)
- Dataset de historias: `truthful-ai/story-imprinting` @ `dc07526`, carpeta `4_selectivity/opposing-pairs-bees-crows/` (identificador citado en la model card)
- Resultados completos de evaluación: repositorio `senku14x/story-imprinting-persona-pilot`, rama `e07_sarcastic`, carpeta `e07/` (identificador citado en la model card)
- Modelo relacionado del mismo autor: `story-imprinting-qwen36-27b-seed-replication` (receta 001, sin URL en la información disponible)
- Paper de story imprinting: no enlazado en la información disponible
