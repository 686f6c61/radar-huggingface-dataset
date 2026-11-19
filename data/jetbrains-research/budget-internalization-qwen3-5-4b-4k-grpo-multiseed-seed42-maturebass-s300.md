# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research, orientado a razonamiento matematico bajo un presupuesto fijo de generacion de 4096 tokens. La contribucion central es el concepto de "internalizacion de presupuesto": en lugar de dejar que el modelo escale en tiempo de inferencia (generando cadenas de razonamiento cada vez mas largas), el entrenamiento con GRPO le ensena a producir respuestas correctas dentro de una ventana acotada. Esto es relevante para despliegues en produccion donde el coste por token y la latencia estan restringidos.

El modelo forma parte de un estudio de ablacion de semillas: la misma receta se entrena con tres semillas (42, 43 y 44), y este repositorio corresponde a la semilla 42, checkpoint final en el paso 300. Se publica junto al articulo "Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy". El pipeline declarado es image-text-to-text, heredado de la familia Qwen3.5, aunque el entrenamiento se centra exclusivamente en matematicas.

Con 4.539.265.536 parametros en formato BF16 safetensors y un tamano de repositorio de 9,1 GB, es un modelo compacto que cabe en GPUs de consumo con cuantizacion, lo que lo hace accesible para experimentacion e investigacion reproductible sobre RL para razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, multimodal image-text-to-text) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4,5 mil millones de parametros con capacidad multimodal image-text-to-text segun el pipeline declarado. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el limite de 4096 tokens se truncan y se puntuan tal cual, lo que fuerza al modelo a internalizar el presupuesto en lugar de aprender a evitarlo.

Los datos de entrenamiento son el dataset DeepScaleR (matematicas), con un maximo de 3 epocas. La configuracion usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento, durante 300 pasos totales. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y salida del resultado dentro de `\boxed{}`. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Razonamiento matematico con presupuesto fijo: resuelve problemas de matematicas dentro de un limite de 4096 tokens de generacion.
- Generacion de cadenas de razonamiento paso a paso (formato "Let's think step-by-step").
- Extraccion estructurada de respuestas mediante etiquetas `\boxed{}`.
- Capacidad multimodal image-text-to-text heredada del modelo base Qwen3.5-4B (segun el pipeline declarado; no se detalla su rendimiento tras el ajuste).
- Soporte de conversacion multi-turno mediante la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible como funcionalidad separada; el razonamiento se induce via prompt.

## Casos de uso

- Evaluacion de investigacion en RLVR: reproduccion del experimento de internalizacion de presupuesto con la semilla 42, comparando con las semillas 43 y 44 para medir varianza entre semillas en el mismo recipe.
- Tutoria matematica con coste acotado: el modelo genera soluciones paso a paso dentro de un limite de 4096 tokens, lo que permite presupuestar coste por consulta en un servicio educativo.
- Generacion de soluciones verificables: la salida en `\boxed{}` facilita la extraccion automatica y la comprobacion programatica de respuestas en pipelines de evaluacion.
- Benchmarking de tecnicas de RL: sirve como linea base para comparar GRPO con otras variantes (PPO, DPO) sobre el mismo dataset DeepScaleR y el mismo presupuesto.
- Prototipado en hardware de consumo: con 4,5 mil millones de parametros y pesos BF16, es viable experimentar en una unica GPU de gama alta consumer con cuantizacion.
- Estudio de ablacion de semillas: permite analizar la estabilidad del entrenamiento RL comparando checkpoints en los pasos 290 y 300 entre semillas.
- Filtrado de datos sinteticos: puede generar soluciones matematicas con formato controlado para aumentar datasets de entrenamiento, sujeto a verificacion de correccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye los valores obtenidos.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9,1 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica se recomienda al menos 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5-5 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2,3-3 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para inferencia en BF16 con lotes; RTX 4090 (24 GB) suficiente para BF16 en lote pequeno.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en BF16; en RTX 4080/4070 Ti (16 GB) o inferiores es recomendable cuantizar.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp/Ollama mediante conversion a GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Este modelo (Qwen3.5-4B + GRPO, presupuesto 4k) | 4,54 B | no disponible | RLVR con presupuesto fijo para matematicas | apache-2.0 |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Modelo generalista multimodal | apache-2.0 |
| Otras semillas del mismo estudio (seed 43, seed 44) | 4,54 B | no disponible | Misma receta, distinta semilla | apache-2.0 |
| DeepSeek-R1-Distill-Qwen de tamano similar | no disponible | no disponible | Destilacion de razonamiento | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste se limita a matematicas (DeepScaleR); el rendimiento en otras tareas puede degradarse respecto al modelo base.
- Las respuestas que exceden los 4096 tokens se truncan y se puntuan como incorrectas durante el entrenamiento, lo que puede penalizar problemas que requieren razonamientos mas largos.
- Riesgo de alucinacion en la cadena de razonamiento: el modelo puede producir pasos plausibles pero incorrectos, especialmente fuera de la distribucion de DeepScaleR.
- Sesgos conocidos: no disponible en la informacion proporcionada; hereda los del modelo base.
- Idiomas soportados: no disponible; el entrenamiento se realizo con problemas en el idioma del dataset DeepScaleR.
- Restricciones de licencia: apache-2.0, heredada del modelo base, permite uso comercial con las condiciones de dicha licencia.
- Checkpoint intermedio (paso 300) de un estudio de investigacion; no se documenta una evaluacion exhaustiva de robustez ni de seguridad.
- La model card no incluye resultados numericos de validacion, lo que dificulta evaluar la mejora frente al modelo base sin reproducir el experimento.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint step 290 (seed 42): https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed42-maturebass-s290
- Checkpoint step 290 (seed 43): https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s290
- Checkpoint step 300 (seed 43): https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed43-flyingcat-s300
- Checkpoint step 300 (seed 44): https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-multiseed-seed44-hugeguppy-s300
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper "Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy": referencia citada en la model card, sin enlace disponible.
