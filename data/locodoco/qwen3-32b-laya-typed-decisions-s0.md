# locodoco/qwen3-32b-laya-typed-decisions-s0

## Resumen

`locodoco/qwen3-32b-laya-typed-decisions-s0` es un adaptador LoRA sobre el modelo `Qwen/Qwen3-32B` que incorpora una cabeza de decisión de estilo laya, entrenada para devolver probabilidades calibradas sobre opciones tipadas (elección entre categorías, puntuación en escala ordenada y respuesta sí/no). No es un modelo generativo de chat al uso: el Qwen3-32B se emplea como codificador, tomando el estado oculto en el token `<|endoftext|>` de cada rama de opción para producir un marcador que la cabeza transforma en logits. El resultado es un clasificador probabilístico que responde preguntas estructuradas sobre un estado en texto o JSON.

El modelo resuelve un problema concreto: convertir un LLM grande en un motor de decisión calibrada con tres tipos de pregunta (`choice`, `score`, `noul`) y calibración de temperatura por tipo. Se entrenó sobre el dataset `LocalLLaMA/typed-decisions` con la pérdida RLCD de laya, y se publica con licencia Apache 2.0. El repositorio ocupa 0,7 GB, lo que corresponde únicamente al adaptador LoRA y a la cabeza, no a los pesos del modelo base.

Es relevante para quienes necesitan decisiones con probabilidades interpretables (enrutado, triaje, clasificación ordenada) en lugar de texto libre, y quieren reaprovechar un Qwen3-32B ya desplegado. La model card reporta una precisión de 0,8035 en el split de test de typed-decisions, con un ECE de 0,163, ligeramente por encima de las tres semillas de Qwen3-Embedding-8B (media 0,800).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-32B) usado como codificador + cabeza laya (LayerNorm + Linear a 1024, embedding de tipo de pregunta, encoder Transformer bidireccional de 2 capas, scorer MLP) |
| Parametros totales | no disponible (el adaptador LoRA y la cabeza ocupan 0,7 GB; los pesos del base en bf16 rondan 65 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 1.024 tokens de estado + 192 tokens de instrucciones + 48 tokens por opción (límites de entrenamiento) |
| Tipos de cuantizacion | no disponible (la model card solo documenta bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-32B, un transformer decoder causal, pero aquí se usa como codificador: cada pregunta se resuelve en un único forward pass. Se construye un prefijo (`Instruct: ...\nQuery: State: <estado>\n<tipo> question: <instrucciones>\nOptions:`) y cada opción se trata como una rama paralela cuyos position ids continúan desde el final del prefijo. Cada rama ve el prefijo y sus propios tokens, pero no las demás opciones, de modo que el resultado es invariante al orden de las opciones por construcción. El estado oculto en el `<|endoftext|>` final de cada rama actúa como marcador de esa opción. La cabeza convierte los marcadores en logits mediante LayerNorm + Linear (hidden a 1024), un embedding de tipo de pregunta, un encoder Transformer bidireccional de 2 capas sobre la secuencia y un scorer MLP.

El entrenamiento usó el split de train de `LocalLLaMA/typed-decisions` con 6.000 decisiones, divididas en 5.600 para entrenamiento y una porción de calibración de 400 decisiones. La pérdida es la RLCD de laya contra los objetivos soft del dataset. Se hicieron 4 épocas con micro-batches de 8 y acumulación de gradiente 8 (2.800 micro-batches, 350 pasos de optimizador), AdamW con learning rate 1e-4 tanto para LoRA como para la cabeza, weight decay 0,01, decaimiento coseno y clipping de gradiente 1,0. El LoRA tiene r=16, alpha=32 y dropout 0,05 sobre las proyecciones q, k, v, o, gate, up y down. Se usó autocast bf16, con un máximo de 1.024 tokens de estado, 192 de instrucciones y 48 por opción. El entrenamiento se ejecutó en una NVIDIA GH200 (96 GB) durante 116 minutos con gradient checkpointing y un pico de memoria de 74,5 GB. Las temperaturas por tipo se ajustaron en la porción de calibración: choice 1,008, score 1,071, noul 1,117.

## Capacidades

- Clasificación tipada con probabilidades: devuelve una distribución sobre opciones para preguntas `choice` (una entre varias opciones nombradas), `score` (un nivel de una escala ordenada) y `noul` (sí/no).
- Calibración por tipo de pregunta mediante temperaturas ajustadas sobre una porción de calibración independiente.
- Entrada de estado en texto libre o JSON, con hasta 1.024 tokens de estado.
- Invariante al orden de las opciones, gracias a la construcción de ramas paralelas.
- No es un modelo de chat generativo: no produce texto libre, solo probabilidades sobre opciones predefinidas.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: modo thinking, visión o audio no disponibles.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una reclamación, el modelo devuelve la probabilidad de cada departamento (`billing`, `technical`, `other`), la urgencia en una escala ordenada y el riesgo de churn como sí/no. La calibración permite fijar umbrales de derivación con una confianza medible.
- Enrutado con umbral de confianza: en un pipeline de atención al cliente, se usa la distribución `choice` para decidir si el caso se resuelve automáticamente o se escala a un humano cuando la probabilidad máxima cae por debajo de un umbral.
- Clasificación ordenada de severidad: con preguntas `score`, se asigna un nivel de severidad a incidencias o alertas, aprovechando que la escala es ordenada y las probabilidades están calibradas por temperatura específica del tipo.
- Moderación y detección de intención binaria: preguntas `noul` para detectar si un mensaje contiene una amenaza de cancelación, una petición de reembolso o una queja formal, con probabilidad explícita en lugar de texto generado.
- Extracción estructurada sobre JSON: al aceptar estados en JSON, se puede alimentar con registros de CRM o tickets y obtener decisiones tipadas por campo sin necesidad de post-procesar texto libre.
- Evaluación de políticas y decisiones auditables: al devolver probabilidades calibradas y ser determinista en la construcción de ramas, encaja en flujos donde se requiere registrar la confianza de cada decisión y comparar contra umbrales definidos por política.
- Reaprovechamiento de infraestructura Qwen3-32B: si ya se dispone de un despliegue de Qwen3-32B, el adaptador añade la capacidad de decisión tipada sin cambiar de familia de modelo.

## Benchmarks y rendimiento

Resultados en el split de test de typed-decisions (400 casos, 2.000 decisiones) tras calibración de temperatura, calculados con `laya.train.evaluate_records`:

| Modelo | Accuracy | ECE | Choice acc. | Score acc. | Noul acc. |
|---|---|---|---|---|---|
| Qwen3-Embedding-8B, seed 0 | 0,8005 | 0,159 | 0,767 | 0,784 | 0,857 |
| Qwen3-Embedding-8B, seed 1 | 0,8025 | 0,159 | 0,760 | 0,796 | 0,853 |
| Qwen3-Embedding-8B, seed 2 | 0,7980 | 0,155 | 0,763 | 0,779 | 0,858 |
| Qwen3-32B, seed 0 (este modelo) | 0,8035 | 0,163 | 0,767 | 0,784 | 0,867 |
| laya-typed-decisions (publicado) | 0,766 | 0,213 | no disponible | no disponible | no disponible |
| Jev 1.13.0 (publicado) | 0,727 | 0,144 | no disponible | no disponible | no disponible |

Según la model card, las tres semillas de Qwen3-Embedding-8B promedian 0,800, y Qwen3-32B aporta unas 0,3 décimas adicionales con aproximadamente 3,5 veces el tiempo de entrenamiento. La confianza media del modelo es 0,64 frente a una precisión de 0,80, por lo que está infraconfiado y la mayor parte del ECE proviene de esa brecha.

## Requisitos de hardware

- VRAM para inferencia: los pesos del modelo base en bf16 ocupan aproximadamente 65 GB; a ello hay que sumar el adaptador y la cabeza (0,7 GB en el repositorio). El entrenamiento reportado consumió un pico de 74,5 GB con gradient checkpointing.
- GPU recomendadas: NVIDIA GH200 (96 GB) fue la unidad usada en entrenamiento; para inferencia en bf16 se requiere una GPU con al menos 80 GB (A100 80 GB, H100 80 GB) o repartir el modelo en varias GPU.
- GPU de consumo: no cabe en tarjetas consumer en bf16; no se documentan cuantizaciones que permitan reducir el requisito.
- Opciones de despliegue: la model card documenta el uso mediante la librería `laya==0.5.0` junto con `transformers==5.23.0`, `peft==0.22.0` y torch 2.11, cargando el modelo con `qwen_laya.load`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (typed-decisions) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Qwen3-32B + cabeza laya) | 32B (base) + adaptador | 1.024 tokens de estado + 192 de instrucciones + 48 por opción | 0,8035 | 0,163 | Apache 2.0 | Hugging Face |
| Qwen3-Embedding-8B (seed 0) | 8B | no disponible | 0,8005 | 0,159 | no disponible | Hugging Face |
| laya-typed-decisions (publicado) | no disponible | no disponible | 0,766 | 0,213 | no disponible | publicación laya |
| Jev 1.13.0 (publicado) | no disponible | no disponible | 0,727 | 0,144 | no disponible | publicación laya |

## Limitaciones y advertencias

- El modelo está infraconfiado: confianza media de 0,64 frente a una precisión de 0,80, lo que concentra la mayor parte del ECE de 0,163. Los umbrales de decisión deben ajustarse teniendo en cuenta esta brecha.
- Solo soporta inglés; no se documentan capacidades en otros idiomas.
- No es un modelo generativo: no produce texto libre ni mantiene conversaciones multi-turno; solo devuelve distribuciones sobre opciones predefinidas.
- Los límites de longitud son estrictos: 1.024 tokens de estado, 192 de instrucciones y 48 por opción, fijados en entrenamiento.
- El adaptador no incluye los pesos del modelo base; es necesario descargar Qwen3-32B por separado (unos 65 GB en bf16).
- No se documentan cuantizaciones ni despliegue en GPUs de consumo, lo que limita su uso en entornos con recursos reducidos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción.
- No se han publicado análisis de sesgos ni evaluaciones de robustez fuera del dataset typed-decisions.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse por separado la licencia del modelo base Qwen3-32B.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/locodoco/qwen3-32b-laya-typed-decisions-s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio laya: https://github.com/NandhaKishorM/laya
