# hi-todayis-jh/ouro-1.4b-thinking-grpo-math-154711-20261007-2100

## Resumen

Ouro 1.4B Thinking - GRPO on MATH es un ajuste fino de investigación del modelo base ByteDance/Ouro-1.4B-Thinking, publicado por el usuario hi-todayis-jh. Se trata de un checkpoint resultado de un entrenamiento de aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre el conjunto de datos DigitalLearningGmbH/MATH-lighteval, orientado a mejorar el razonamiento matemático paso a paso. El modelo hereda la arquitectura de Ouro, que emplea bucles recurrentes (recurrent depth), y en este entrenamiento concreto se han utilizado 4 bucles recurrentes por paso directo.

El repositorio no contiene un modelo listo para inferencia, sino checkpoints de entrenamiento en formato de shards FSDP generados con la librería verl. Esto implica que para poder desplegarlo es necesario fusionar primero los shards del actor con `verl.model_merger`. El entrenamiento fue de parámetros completos (full-parameter), con 256 prompts por lote de rollout, 8 generaciones por prompt, 5 épocas (145 pasos de rollout) y semilla 42, limitando los prompts a 1024 tokens y las completions a 2048 tokens.

Aunque el modelo es pequeño (aproximadamente 1,4B parámetros) y se distribuye bajo licencia Apache 2.0, su relevancia es fundamentalmente investigadora: documenta una receta reproducible de RL aplicada a un transformer con profundidad recurrente, con registros en W&B y checkpoints intermedios. El repositorio acumula 0 descargas y 0 likes, por lo que se trata de un artefacto reciente y sin adopción pública verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles recurrentes (recurrent depth); 4 bucles recurrentes por paso directo segun la model card. Modelo base: ByteDance/Ouro-1.4B-Thinking |
| Parametros totales | Aproximadamente 1,4B, segun la denominacion del modelo base; no confirmado explicitamente en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para inferencia; durante el entrenamiento, prompts limitados a 1024 tokens y completions a 2048 tokens |
| Tipos de cuantizacion | No disponible; el repositorio contiene shards FSDP de entrenamiento, no pesos cuantizados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Shards FSDP del actor generados con verl; requieren fusion con `verl.model_merger` antes de la inferencia |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo ByteDance/Ouro-1.4B-Thinking, que emplea profundidad recurrente: un mismo bloque se aplica de forma iterada un numero fijo de bucles (en esta ejecucion, 4 bucles recurrentes por paso directo). Este diseño de "looped transformer" permite aumentar la computacion efectiva sin incrementar proporcionalmente el numero de parametros. El entrenamiento realizado aqui es un ajuste fino de parametros completos mediante GRPO, una variante de aprendizaje por refuerzo sin modelo critico separado, usando el dataset DigitalLearningGmbH/MATH-lighteval como fuente de problemas de matematicas.

La configuracion reportada incluye 256 prompts por lote de rollout, 8 generaciones por prompt, 5 epocas (145 pasos de rollout) y semilla 42. La model card menciona ademas una ejecucion RLTT que emplea un adaptador local que expone los estados por bucle nativos del modelo oficial y sus probabilidades de salida (exit probabilities), un mecanismo asociado al computo adaptativo por profundidad. Se guardan checkpoints cada 30 pasos de rollout y en el paso final; cada directorio `global_step_N/` contiene shards FSDP, estado del optimizador, estado del generador de numeros aleatorios y estado del dataloader. No se documentan datos sobre composicion completa del dataset, numero total de tokens de entrenamiento ni si hubo fases adicionales de RLHF o DPO mas alla del propio GRPO.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso, objetivo principal del entrenamiento sobre MATH-lighteval.
- Modo de razonamiento explicito ("thinking"), heredado del modelo base Ouro-1.4B-Thinking.
- Computo adaptativo por profundidad recurrente: la variante RLTT expone probabilidades de salida por bucle, lo que sugiere la posibilidad de ajustar el numero de iteraciones internas.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el razonamiento por bucles es interno y no equivale a un bucle de agente.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto segun la informacion proporcionada).

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el repositorio documenta una receta completa de GRPO sobre un transformer recurrente, con registros en W&B y checkpoints intermedios, lo que permite reproducir y auditar el proceso de entrenamiento.
- Generacion de datos sinteticos de matematicas: dado su ajuste sobre MATH-lighteval, puede emplearse para producir soluciones paso a paso que sirvan como datos de entrenamiento para modelos mayores.
- Evaluacion comparativa de profundidad recurrente: permite estudiar si el uso de 4 bucles mejora el razonamiento frente a una pasada unica del mismo modelo base.
- Tutoria automatizada de matematicas: su modo thinking y su tamano reducido permiten desplegarlo en entornos educativos para resolver y explicar problemas de nivel escolar y preuniversitario.
- Verificacion de soluciones en pipelines educativos: puede integrarse como comprobador de pasos intermedios en plataformas de correccion automatica, siempre que se validen sus salidas.
- Experimentos de computo adaptativo: gracias a las probabilidades de salida por bucle expuestas por el adaptador RLTT, sirve para investigar tecnicas de early exit y ahorro de computo en inferencia.
- Base para fine-tuning posterior: al ser un checkpoint de 1,4B con licencia Apache 2.0, puede reutilizarse como punto de partida para ajustes especificos en dominios cientificos o tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MATH, GSM8K, MMLU, HumanEval ni de ninguna otra evaluacion, y los resultados de busqueda web consultados no aportan datos utilizables sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 2,8 GB solo para los pesos de 1,4B parametros (cifra calculada a partir del tamano, no publicada por el autor).
- VRAM estimada en INT8: aproximadamente 1,4 GB; en INT4: aproximadamente 0,7-0,9 GB (estimaciones teoricas, dependen de la compatibilidad del runtime con la arquitectura recurrente).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas deberia ser suficiente en cuantizaciones bajas; para BF16 sin cuantizar, una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o superiores resultan adecuadas.
- Cabe en GPU consumer: si, previsiblemente en tarjetas con 8-12 GB de VRAM, siempre que exista un runtime compatible con la arquitectura Ouro.
- Opciones de despliegue: no disponibles de forma confirmada. La inferencia requiere primero fusionar los shards con `python -m verl.model_merger merge --backend fsdp --local_dir global_step_N/actor --target_dir merged`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y la naturaleza recurrente de la arquitectura puede limitar su compatibilidad con frameworks estandar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ouro 1.4B Thinking - GRPO on MATH (este) | ~1,4B | No disponible (prompts de 1024 tokens en entrenamiento) | No disponible | Apache 2.0 | Checkpoint de entrenamiento en shards FSDP, requiere fusion |
| ByteDance/Ouro-1.4B-Thinking (modelo base) | ~1,4B | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Pesos publicados por ByteDance |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (segun documentacion publica del modelo) | No comparable por falta de datos del modelo evaluado | Apache 2.0 | Pesos listos para inferencia |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens (segun documentacion publica del modelo) | No comparable por falta de datos del modelo evaluado | Llama 3.2 Community License | Pesos listos para inferencia |

La comparacion se limita a caracteristicas estructurales; no se dispone de cifras de benchmarks del modelo evaluado que permitan contrastar rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos listos para inferencia: son shards FSDP de entrenamiento que deben fusionarse manualmente con verl, lo que anade friccion y riesgo de error en el despliegue.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un modelo base y de un dataset de matematicas, puede heredar los sesgos de ambos, pero no hay analisis publicado.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; en tareas matematicas puede producir pasos plausibles pero incorrectos, por lo que se requiere verificacion.
- Limitaciones de contexto: el entrenamiento limito los prompts a 1024 tokens y las completions a 2048, lo que sugiere un rendimiento degradado fuera de ese rango, aunque la ventana real de inferencia no esta documentada.
- Limitaciones de idioma: no se especifican idiomas soportados; es probable que el entrenamiento sobre MATH-lighteval, mayoritariamente en ingles, reduzca su calidad en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base es de ByteDance y conviene verificar que su licencia sea compatible; la model card no aclara este punto.
- Advertencia sobre el adaptador RLTT: la model card indica que el modelo modificado referenciado por el autor no estaba incluido en el repositorio upstream, lo que puede complicar la reproduccion exacta del entrenamiento.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Ausencia de benchmarks: no hay ninguna metrica publicada que respalde mejoras de rendimiento respecto al modelo base.
- Campo de las fechas: el repositorio aparece creado el 2026-10-07, fecha posterior a la actual, lo que conviene tener en cuenta al interpretar la informacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hi-todayis-jh/ouro-1.4b-thinking-grpo-math-154711-20261007-2100
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B-Thinking
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Ejecucion de W&B: https://wandb.ai/jiahaozhangg-carnegie-mellon-university/ouro-1.4b-grpo-rltt-math/runs/grpo-154711-20261007-2100
- Libreria verl (Volcengine): https://github.com/volcengine/verl
