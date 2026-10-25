# davidheineman/rlve-opd-teacher-R1Distill-106-MakingGrade-20261025

## Resumen

`rlve-opd-teacher-R1Distill-106-MakingGrade-20261025` es un ajuste fino de un solo entorno sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por el investigador davidheineman dentro de su línea de trabajo RLVE (Reinforcement Learning from Value Estimates) sobre escalado de datos. No es un modelo de propósito general: es un "teacher" (modelo profesor) entrenado con GRPO para dominar un único entorno de entrenamiento denominado MakingGrade, con el objetivo declarado de servir como fuente de supervisión en experimentos de destilación on-policy. El checkpoint publicado es el resultado final de una campaña de 4.000 rollouts.

El interés de la ficha no está en el rendimiento bruto —es un modelo de 1,78 mil millones de parámetros, destilado de un R1 de 1,5B— sino en su papel metodológico: forma parte de un conjunto de profesores especialistas (el autor publica variantes equivalentes para entornos como GoldWashing o Differentiate) que permiten estudiar cómo escala la destilación cuando el profesor se especializa en una única tarea con dificultad controlada. Es, por tanto, material de investigación reproducible, no un modelo listo para producto.

La model card es extremadamente escueta y no incluye resultados de benchmarks, licencia, idiomas ni receta de datos. Cualquier uso en producción exigiría verificar primero la licencia heredada del modelo base y validar el comportamiento real del checkpoint fuera de su entorno de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen2 (tag `qwen2` en HuggingFace), con cabeza de generación causal (`text-generation`) |
| Parametros totales | 1.777.088.000 (1,78 B), confirmado en safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base DeepSeek-R1-Distill-Qwen-1.5B declara 32.768 tokens |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; el repo solo contiene safetensors en bf16 (3,6 GB / 1,78 B parametros ≈ 2 bytes por parametro) |
| Idiomas soportados | No disponible (la model card no lo especifica; el modelo base esta entrenado principalmente en ingles y chino) |
| Licencia | No disponible (el campo `license` no aparece en los tags; hay que remitirse a la licencia del modelo base) |
| Formato de pesos | `safetensors` + `tokenizer`/`config` para `transformers`; compatible con TGI y `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Qwen2 con 1,5 B de parametros, sobre el que DeepSeek aplico destilacion de razonamiento a partir de R1. El ajuste de davidheineman no modifica la topologia; solo altera los pesos mediante RL. El metodo declarado es **GRPO specialist**: todos los actores se inicializan de cero desde `DeepSeek-R1-Distill-Qwen-1.5B` y se optimizan con GRPO (Group Relative Policy Optimization) sobre un unico entorno, con dificultad fija y balanceada 0/1. La generacion durante el entrenamiento usa 1.024 tokens iniciales mas una continuacion forzada de respuesta de 128 tokens (`answer-forcing`).

La campaña se limita a 4.000 rollouts; el checkpoint final es la actualizacion 499 (indexada desde cero), es decir, el paso 4.000. La validacion se ejecuta cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt (no computan contra el presupuesto de entrenamiento) y el criterio de parada es alcanzar `pass@1 >= 0,98` en validacion in-distribution o agotar los 4.000 rollouts. El repositorio excluye estado del optimizador y del dataloader, pero incluye `training_run.json` (lista de entornos y ajustes originales) y `training_config.yaml` (configuracion exacta), ademas del enlace al run de Weights & Biases del grupo `data-scaling-v1-n128-20261022-225839`. No se documentan ni el volumen de tokens de entrenamiento, ni la composicion del dataset, ni fases de RLHF/DPO adicionales.

## Capacidades

- Generacion de texto autoregresiva en formato conversacional (`conversational` en los tags) mediante `transformers`.
- Razonamiento con cadena de pensamiento heredado de la destilacion de DeepSeek R1, aunque el RL posterior lo especializa en un unico entorno.
- Ejecucion de la tarea del entorno MakingGrade con dificultad 0/1, presumiblemente una tarea de evaluacion o calificacion por el nombre del entorno (no se detalla en la model card).
- Generacion de rollouts y respuestas etiquetables, pensada para alimentar experimentos de destilacion on-policy.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades de vision o audio: no disponibles (modelo puramente de texto).
- Compatibilidad de despliegue con Text Generation Inference y endpoints compatibles.

## Casos de uso

- Profesor en destilacion on-policy: es su proposito declarado. Se usa para generar trayectorias y distribuciones de referencia sobre el entorno MakingGrade que luego un alumno de menor coste imita, aprovechando que el profesor ya ha convergido en esa tarea concreta.
- Generacion de datos sinteticos etiquetados para tareas de calificacion: con 1,78 B de parametros y un muestreo de 8 respuestas por prompt, puede producir lotes de candidatos con etiqueta automatica a bajo coste por token, utiles para ampliar datasets de evaluacion.
- Juez o verificador auxiliar en pipelines de evaluacion: su entrenamiento con `answer-forcing` de 128 tokens lo hace adecuado para tareas de respuesta corta y verificable, donde se compara la salida contra una referencia.
- Baseline reproducible en investigacion sobre RLVE y escalado de datos: al publicarse `training_run.json`, `training_config.yaml` y el run de W&B, permite replicar la curva de aprendizaje y comparar variantes de dificultad.
- Estudio de especializacion vs. olvido catastrofico: sirve como caso controlado para medir cuanto rendimiento general pierde un modelo de 1,5 B al entrenarse con GRPO en un solo entorno durante 4.000 rollouts.
- Inferencia local en hardware modesto: con pesos bf16 de 3,6 GB cabe en GPUs de consumo de 8-12 GB, lo que permite ejecutar barridos de evaluacion en una sola estacion de trabajo sin cluster.
- Ablaciones de data scaling: el prefijo `n128` del grupo de W&B sugiere experimentos con 128 variantes o semillas; el checkpoint sirve como punto fijo para comparar el efecto del numero de rollouts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada es el criterio de parada del entrenamiento (`pass@1 >= 0,98` en validacion in-distribution con 32 prompts y 8 respuestas por prompt), que es un umbral de corte, no un resultado reportado. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones del entorno MakingGrade.

## Requisitos de hardware

- VRAM estimada en bf16: ~3,6 GB solo para pesos; con cache KV y overhead de runtime, entre 5 y 7 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits (si se genera con GPTQ/AWQ o `bitsandbytes`): ~2 GB de pesos, ~3-4 GB en total.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M, previa conversion): ~1,1-1,3 GB de pesos, ~2-3 GB en total.
- GPU recomendadas: cualquier GPU con 8 GB o mas. Cabe holgadamente en RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090; en datacenter, A10G, L4, A100 y H100 quedan sobredimensionadas para un solo modelo, pero permiten servir muchas replicas.
- Cabe en GPU de consumo: si, desde una RTX 3060 de 12 GB o una RTX 4060 de 8 GB; en 4 bits es viable incluso en iGPU con memoria unificada.
- Opciones de despliegue: `transformers` (referencia), TGI (etiqueta `text-generation-inference` presente), vLLM y SGLang (compatibles con la arquitectura Qwen2), llama.cpp u Ollama tras convertir los pesos a GGUF, ya que no se publican artefactos GGUF en el repo.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rlve-opd-teacher-R1Distill-106-MakingGrade-20261025` (este) | 1,78 B | No disponible | GRPO en un unico entorno (MakingGrade), 4.000 rollouts | No disponible | HuggingFace, 0 descargas, 0 likes |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (base) | 1,5 B | 32.768 tokens | Destilacion de razonamiento de R1, proposito general | No confirmada en la informacion disponible | Ampliamente distribuido |
| `davidheineman/opd-teacher-Q2.5I-GoldWashing-step149` | 1,5 B | No disponible | GRPO sobre el entorno GoldWashing, 150 actualizaciones | No disponible | HuggingFace / Featherless |
| `davidheineman/opd-teacher-Q2.5I-Differentiate-step149` | 1,5 B | No disponible | GRPO sobre el entorno Differentiate, 150 actualizaciones | No disponible | HuggingFace / FriendliAI |

La diferencia clave frente al base es el presupuesto de entrenamiento (4.000 rollouts frente a 150 actualizaciones en los hermanos de la serie) y la ventana de contexto declarada en la model card, ausente en este checkpoint. No hay datos de rendimiento comparado para ninguna de las cuatro filas.

## Limitaciones y advertencias

- Especializacion extrema: el modelo se ha optimizado para un unico entorno con dificultad binaria fija; se espera degradacion severa fuera de esa distribucion y no debe tratarse como asistente general.
- Sin datos de evaluacion publicos: no hay benchmarks, curvas de validacion ni comparaciones, por lo que el rendimiento real solo puede conocerse replicando el pipeline de validacion del autor.
- Riesgo de alucinacion: al ser un modelo de 1,5 B con RL sobre una tarea estrecha, la generacion libre fuera de dominio es propensa a fabricar contenido; el `answer-forcing` de 128 tokens limita ademas la longitud de respuesta aprendida.
- Licencia no declarada: los tags de HuggingFace no incluyen campo `license`. Antes de cualquier uso comercial hay que verificar la licencia del modelo base (`DeepSeek-R1-Distill-Qwen-1.5B`), que condiciona la redistribucion y el uso derivado.
- Idiomas no documentados: no se especifica cobertura multilingue; se asume el comportamiento del base, con sesgo hacia ingles y chino.
- Ventana de contexto no confirmada en la model card: aunque el base soporte 32.768 tokens, el entrenamiento se realizo con 1.024 tokens iniciales mas 128 de continuacion, por lo que el comportamiento mas alla de ~1.150 tokens no esta validado.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion; al derivar de un destilado de R1 y pasar por RL en una tarea de calificacion, puede reproducir sesgos del juez o del dataset original.
- Procedencia incierta: 0 descargas y 0 likes en el momento de la consulta, y autores/entornos con nomenclatura interna (106, MakingGrade, n128) sin documentacion externa; conviene tratar el checkpoint como material de laboratorio.
- Repositorio sin estado de entrenamiento: no incluye optimizador ni dataloader, de modo que la replicacion exacta exige reconstruir el pipeline desde `training_config.yaml`.
- Fecha de creacion adelantada (2026-10-25) y ausencia de versionado semantico: no hay garantia de que el repo permanezca estable o de que se publique una revision con licencia e idiomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-106-MakingGrade-20261025
- Arbol de ficheros del repositorio: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-106-MakingGrade-20261025/tree/main
- Run de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/274c8962
- Repositorio RLVE del autor (primitivas de datos para RL): https://github.com/davidheineman/rlve
- Modelo hermano `opd-teacher-Q2.5I-GoldWashing-step149`: https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-GoldWashing-step149
- Modelo hermano `opd-teacher-Q2.5I-Differentiate-step149`: https://friendli.ai/models/davidheineman/opd-teacher-Q2.5I-Differentiate-step149
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
