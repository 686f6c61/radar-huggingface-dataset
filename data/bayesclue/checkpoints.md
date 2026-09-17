# bayesclue/checkpoints

## Resumen

bayesclue/checkpoints es un repositorio de respaldo privado que contiene los puntos de control de una investigación sobre razonamiento con refuerzo basado en creencias latentes (latent-belief RL). El modelo base es Qwen/Qwen3.5-4B, un transformer decoder de aproximadamente 4.000 millones de parámetros, sobre el que se aplican adaptadores LoRA. El objeto de estudio no es un chatbot generalista, sino la capacidad de leer la "creencia" interna del modelo a partir de los logits de una sonda de elección forzada, nunca a través de texto verbalizado.

El entrenamiento se divide en dos etapas. La primera es un SFT con divergencia KL distribucional (adaptador LoRA de rango 64) que ajusta las probabilidades del token `Answer:` contra una distribución objetivo. La segunda es un GRPO sobre la sonda de logits, con una máscara de respuesta que solo cubre el razonamiento para que la sonda no reciba gradiente. El repositorio incluye también la versión fusionada (SFT⊕GRPO) sobre el modelo base en precisión completa.

Es relevante ahora porque aborda un problema clásico de la cuantificación de incertidumbre en LLM: la diferencia entre lo que el modelo dice y lo que internamente cree. Sus métricas reportadas (KL de creencia de 0,0066 en la etapa SFT y world_kl de 0,0245 tras el RL) apuntan a que el ajuste alcanza el suelo de entropía propio de una regla de puntuación estrictamente propia, y no un artefacto de truncamiento. Se trata, en todo caso, de un artefacto de investigación con cero descargas y sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen/Qwen3.5-4B) con adaptadores LoRA de rango r64 |
| Parametros totales | ~4B (heredados del modelo base); los adaptadores anaden un delta de bajo rango sobre 346 modulos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la version fusionada se distribuye en precision completa) |
| Idiomas soportados | no disponible |
| Licencia | other (los terminos concretos no se detallan en la model card) |
| Formato de pesos | safetensors (adaptadores LoRA y modelo fusionado en fp) |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamanio del repositorio | 274,9 GB |
| Fecha de creacion | 2026-06-21 |
| Ultima actualizacion | 2026-09-16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder de ~4B parámetros (Qwen3.5-4B) al que se le acoplan adaptadores LoRA. La innovación no está en el bloque de atención, sino en el mecanismo de lectura de creencias: el modelo no verbaliza su incertidumbre, sino que esta se extrae de los logits de una sonda de elección forzada sobre un conjunto de `label_ids` en la posición del token `Answer:`. La etapa 1 (`sft_final/adapter/`) es un adaptador LoRA r64 entrenado con un objetivo de KL distribucional suave, `KL(p* ‖ softmax(logits[label_ids]))`, que hace coincidir la distribución del modelo con una distribución objetivo `p*`.

La etapa 2 (`rl_lr1e5_step400/lora_adapter/`) aplica GRPO con tasa de aprendizaje 1e-5, 400 pasos y 346 módulos afectados. La función de recompensa es `R = α·(−CE(p*_H, q_H)) + (1−α)·mean_s(−CE(p*_R, q_R))` con α = 0,6, combinando la entropía cruzada sobre la cabeza de creencia y sobre las posiciones de razonamiento. Un detalle técnico clave es la máscara de respuesta limitada al razonamiento: la sonda recibe gradiente cero, de modo que el modelo aprende a razonar mejor sin poder "hackear" directamente el canal de lectura. La meseta de recompensa en −1,225 se documenta explícitamente como el óptimo `−H(p*)`, no como un artefacto de truncamiento. El repositorio incluye además la fusión correcta `SFT⊕RL` sobre el modelo base, para la que se advierte de que la herramienta estándar `verl.model_merger` escribe una copia del base y de que hay que usar un script propio con el remapeo de `model.layers.` a `model.language_model.layers.`.

## Capacidades

- Razonamiento multi-paso sobre el escenario del juego de detective pasivo BayesClue, con el razonamiento separado de la respuesta final.
- Estimación de creencias latentes: expone una distribución de probabilidad sobre hipótesis leída directamente de los logits, sin verbalizarla.
- Calibración de incertidumbre: la etapa SFT está optimizada para minimizar la KL frente a una distribución objetivo.
- Razonamiento entrenado con refuerzo (GRPO) sobre recompensas de entropía cruzada, con la sonda de creencia congelada por máscara.
- Generación de texto y razonamiento generales heredados del modelo base Qwen3.5-4B.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado más allá del razonamiento interno del juego.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: modo de sonda de creencia por logits, entrenamiento con LoRA y fusión de adaptadores; no hay visión ni audio documentados.

## Casos de uso

- Investigación en calibración de incertidumbre: usar la sonda de logits como estimador de la creencia del modelo en tareas de pregunta cerrada, comparando la distribución `q` con un objetivo `p*` y midiendo la KL resultante.
- Detección de discrepancia entre razonamiento y respuesta: al estar el razonamiento en la respuesta y la creencia en los logits, permite auditar casos en los que el texto final no refleja la distribución interna.
- Simulaciones de razonamiento bayesiano: el escenario BayesClue sirve como banco de pruebas para agentes que deben actualizar creencias tras cada observación del entorno.
- Reproducción de experimentos de RL con reglas de puntuación propias: la recompensa definida con α = 0,6 y su meseta en −1,225 permiten replicar el comportamiento del óptimo teórico en otros dominios.
- Fine-tuning adicional sobre el adaptador fusionado: al distribuirse el modelo fusionado en precisión completa, puede servir como punto de partida para SFT o RL posteriores en tareas de decisión.
- Evaluación de fiabilidad en QA de dominio cerrado: el pipeline de sonda forzada es reutilizable para medir confianza en clasificación con etiquetas discretas (triage, categorización de tickets, diagnóstico asistido).
- Estudio de LoRA frente a entrenamiento completo: los dos adaptadores (SFT y RL) y sus métricas asociadas permiten comparar el coste y el efecto de cada etapa en un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son internas del experimento:

| Metrica | R1 (SFT, `sft_final/adapter/`) | R2 (SFT⊕GRPO, `rl_lr1e5_step400/merged/`) |
|---|---|---|
| KL de creencia en held-out | 0,0066 | no disponible |
| top1 de creencia | 0,93 | no disponible |
| world_kl post-razonamiento | no disponible | 0,0245 (suelo de entropía de la regla de puntuación propia) |
| world_top1 | no disponible | 0,71 |
| Recompensa GRPO | no aplica | meseta en −1,225 (= óptimo −H(p*)) |

No se proporciona comparación con otros modelos en estas métricas.

## Requisitos de hardware

- Los adaptadores LoRA son ligeros, pero la inferencia requiere cargar el modelo base Qwen3.5-4B completo.
- VRAM estimada para el modelo base en bf16/fp16: en torno a 9-10 GB contando pesos y caché KV; el modelo fusionado del repositorio está en precisión completa.
- VRAM estimada en int8: ~5 GB; en int4: ~3 GB. Estas cuantizaciones no se distribuyen en el repositorio y habría que generarlas.
- GPU recomendadas: cualquier GPU con 16-24 GB (RTX 4090, RTX 3090, A10G, L4) para fp16 con contexto moderado; A100/H100 para entrenamiento o evaluación a gran escala.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) y en GPUs de 16 GB en fp16 con contexto limitado; en 8-12 GB solo con cuantización int4/int8 generada por el usuario.
- Despliegue: vLLM o TGI para el modelo fusionado; PEFT para cargar los adaptadores sobre el base; llama.cpp u Ollama requieren convertir a GGUF, formato no publicado.
- El repositorio ocupa 274,9 GB, por lo que conviene descargar únicamente la carpeta necesaria (`sft_final/adapter/`, `rl_lr1e5_step400/lora_adapter/` o `rl_lr1e5_step400/merged/`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento comparables en la información proporcionada. La única referencia directa es el modelo base:

| Modelo | Parametros | Contexto | Licencia | Enfoque | Rendimiento reportado |
|---|---|---|---|---|---|
| bayesclue/checkpoints | ~4B (LoRA sobre Qwen3.5-4B) | no disponible | other | SFT con KL distribucional + GRPO sobre sonda de logits | KL de creencia 0,0066 / world_kl 0,0245 |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | no disponible | LLM generalista sin sonda de creencia | no disponible |
| Otros adaptadores de cuantificacion de incertidumbre | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Se trata de un respaldo privado de puntos de control de investigación, no de un modelo listo para producción; no hay model card de uso, demo ni evaluación externa.
- Cero descargas y cero likes: no existe validación por parte de la comunidad.
- La licencia es `other` y los términos no se detallan, por lo que el uso comercial no está claro y requiere consultar al autor.
- El repositorio pesa 274,9 GB, lo que implica costes de almacenamiento y descarga considerables.
- La fusión de los adaptadores es delicada: la herramienta estándar `verl.model_merger` escribe una copia del base en lugar del modelo fusionado; hay que usar el script con el remapeo `model.layers.` a `model.language_model.layers.`.
- La creencia se lee exclusivamente de logits de elección forzada; no hay validación de que esa sonda se corresponda con el comportamiento en generación libre.
- El entrenamiento está ligado al dominio del juego BayesClue, por lo que la transferencia a otros dominios no está demostrada.
- Al derivar de un LLM generalista, hereda el riesgo de alucinación del modelo base, especialmente fuera del escenario de entrenamiento.
- Sesgos conocidos, limitaciones de contexto e idioma: no disponibles en la información proporcionada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bayesclue/checkpoints
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Script de fusión citado en la model card: `credal_verl08/remerge_sft_qwen35.py` (sin URL pública en la información disponible)
- Paper, blog o repositorio adicional: no disponible
- Nota: los resultados de la búsqueda web (páginas sobre normativas de ingresos para inmigrantes en Países Bajos) no guardan relación con este modelo y se han descartado por no ser relevantes.
