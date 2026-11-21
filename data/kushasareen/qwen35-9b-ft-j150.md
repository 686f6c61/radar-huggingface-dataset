# kushasareen/qwen35-9b-ft-j150

## Resumen

`kushasareen/qwen35-9b-ft-j150` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario kushasareen en Hugging Face. Se trata de un checkpoint intermedio de un proceso de aprendizaje por refuerzo (reinforcement learning) tras 150 pasos de optimizacion, entrenado sobre el conjunto de datos `contest_math_hard_v2`. El modelo se distribuye con pesos, configuracion y tokenizer tal como los guardo el entrenador, cargable mediante `AutoModelForCausalLM.from_pretrained`.

El interes de esta publicacion es fundamentalmente de investigacion: expone un estado intermedio de un pipeline de RL aplicado a un modelo de 9.000 millones de parametros, con una tecnica concreta (CISPO con ventana de 16k tokens) y un esquema de asignacion de credito basado en equipos de 4 y un juez LLM (gemini-3.8-flash, rubrica v2). No se trata de un modelo listo para produccion ni de un lanzamiento oficial de Alibaba/Qwen, sino de un artefacto de experimentacion reproducible.

La relevancia actual radica en que documenta, con identificadores concretos (run de wandb a7855255, nombre del experimento `up_cmh_cispo_q359b_judge2_k4_16k_v5`), una receta de RL sobre matematicas de competicion, un dominio donde el razonamiento multi-paso y la verificacion de resultados son criticos. La informacion publica disponible es muy limitada: no hay model card extendida, ni benchmarks, ni detalles sobre el dataset mas alla de su nombre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-9B; no se detalla en la informacion proporcionada) |
| Parametros totales | 9B (segun el nombre del modelo y el base_model) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa ventanas de 16k tokens, segun la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en formato del entrenador) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors / formato del trainer (cargable con `AutoModelForCausalLM.from_pretrained`); no se confirma GGUF ni otras variantes |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3.5-9B. La model card no describe la arquitectura interna del modelo base (si es transformer denso, MoE o hibrida), por lo que este dato debe consultarse en la ficha del modelo original. Lo que si se especifica es el procedimiento de ajuste: un entrenamiento de aprendizaje por refuerzo con CISPO (una variante de optimizacion con politica restringida) sobre el dataset `contest_math_hard_v2`, con una longitud de contexto de entrenamiento de 16k tokens y 150 pasos de optimizacion.

El esquema de asignacion de credito es destacable: se organizan "equipos de 4" (k4) y se emplea un juez LLM (gemini-3.8-flash) con rubrica v2 para evaluar las respuestas y distribuir la recompensa. El identificador del experimento es `up_cmh_cispo_q359b_judge2_k4_16k_v5` y el run de seguimiento esta en wandb con ID a7855255. No se proporcionan datos sobre el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo fases previas de SFT o DPO.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, aunque el ajuste esta orientado especificamente a matematicas de competicion.
- Razonamiento matematico multi-paso: el entrenamiento con RL sobre `contest_math_hard_v2` busca mejorar la resolucion de problemas complejos de matematicas.
- Generacion de codigo y matematicas: capacidad esperable por herencia del modelo base; no verificada en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el esquema de entrenamiento (equipos y juez) sugiere entrenamiento para tareas de razonamiento estructurado, pero no se documenta soporte de agentes en inferencia.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en RL para LLM: el checkpoint permite reproducir y analizar el estado del modelo en el paso 150 del experimento, comparandolo con checkpoints posteriores o con el modelo base para estudiar la evolucion del aprendizaje.
- Evaluacion de recetas de asignacion de credito: util para estudiar el efecto de usar un juez LLM (gemini-3.8-flash, rubrica v2) y equipos de 4 en la calidad de las recompensas y en el comportamiento resultante.
- Experimentos de CISPO: sirve como punto de partida para comparar variantes de optimizacion con politica restringida en tareas de matematicas de competicion.
- Generacion de soluciones a problemas matematicos de nivel competicion: el ajuste especifico sobre `contest_math_hard_v2` lo hace adecuado para prototipos de resolucion de problemas matematicos, siempre con verificacion humana.
- Analisis de degradacion o regresion: al ser un checkpoint intermedio, permite estudiar si el RL introduce perdida de capacidades generales (catastrofic forgetting) respecto al modelo base.
- Baseline en pipelines de evaluacion interna: util como referencia en comparaciones de modelos de ~9B en tareas de razonamiento matematico dentro de un laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 9B en precision completa (fp16/bf16) se requieren aproximadamente 18 GB de VRAM solo para los pesos; en cuantizacion de 8 bits, en torno a 9-10 GB; en 4 bits, alrededor de 5-6 GB. Estas cifras son estimaciones estandar para 9B, no datos publicados por el autor.
- GPU recomendadas: A100 (40/80 GB) o H100 para inferencia en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado o cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB (RTX 3090/4090) en fp16 con contexto limitado, o en GPUs de 8-12 GB con cuantizacion (no se publican pesos cuantizados).
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained`) es el metodo documentado; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kushasareen/qwen35-9b-ft-j150 | 9B | no disponible (entrenado a 16k) | apache-2.0 | Checkpoint intermedio de RL, sin benchmarks publicados |
| Qwen/Qwen3.5-9B | 9B | no disponible en esta ficha | no disponible en esta ficha | Modelo base oficial; capacidades generales sin el ajuste de RL |
| Alternativas de ~9B de otros fabricantes | ~7-9B | variable | variable | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo verificados para este checkpoint.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 150) de un experimento de RL, no un modelo final pulido; su calidad puede ser inferior a la de un modelo completamente entrenado.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su rendimiento.
- El ajuste esta muy especializado en matematicas de competicion (`contest_math_hard_v2`); puede sufrir olvido catastrofico en otras tareas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; en matematicas puede producir razonamientos plausibles pero incorrectos.
- Idiomas soportados no documentados; se desconoce el comportamiento multilingue tras el ajuste.
- La licencia apache-2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales que deben verificarse.
- El uso de un juez LLM externo (gemini-3.8-flash) para la recompensa introduce posibles sesgos del juez en el comportamiento aprendido.
- No se publican pesos cuantizados ni artefactos de despliegue, lo que limita su uso directo en produccion.
- Sin model card extendida ni documentacion de sesgos; se recomienda evaluacion propia antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kushasareen/qwen35-9b-ft-j150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de wandb del experimento (ID a7855255): no se proporciona URL directa en la informacion disponible
