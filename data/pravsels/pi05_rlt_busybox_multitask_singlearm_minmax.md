# pravsels/pi05_rlt_busybox_multitask_singlearm_minmax

## Resumen

El modelo `pravsels/pi05_rlt_busybox_multitask_singlearm_minmax` es un encoder/decoder de RL-token (etapa 1 de RLT) desarrollado por pravsels, diseñado para operar sobre el checkpoint congelado de la política π0.5 minmax multitask. Este modelo se integra en el ecosistema OpenPI y es el componente que carga `hw_control.pi0_rlt` para extraer tokens de acción en tareas de robótica. Resuelve el problema de convertir observaciones visuales y estados del robot en tokens discretos de acción que pueden ser procesados por un modelo de lenguaje para control de bajo nivel.

El modelo utiliza la misma receta de acción relativa 6D que el VLA asociado (`pravsels/pi05_busybox_multitask_minmax`): 5 articulaciones en delta, pinza en valor absoluto, con normalización por paso temporal usando percentiles `q01`/`q99`. Fue entrenado sobre el dataset `villekuosmanen/busybox_multitask` con 66 episodios y 27 tareas, durante 20.000 pasos en una GPU A100 80GB. El repositorio tiene un tamaño de 6,3 GB y contiene los parámetros finales del checkpoint en el directorio `params/`.

La relevancia de este modelo radica en su papel dentro del pipeline RLT (RL-token), que permite separar la representación de acciones en tokens discretos para facilitar el aprendizaje por refuerzo en políticas de manipulación robótica. Al estar congelado el VLA subyacente, este modelo se centra exclusivamente en la codificación/decodificación de tokens, lo que lo hace útil para investigación en control robótico y aprendizaje por refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 + RLT (Pi0RLConfig, pi05=true) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | params/ (formato OpenPI, safetensors presumiblemente) |

## Arquitectura y entrenamiento

El modelo combina la arquitectura π0.5 (una política de visión-lenguaje-acción basada en transformers) con el módulo RLT (RL-token), que actúa como encoder/decoder de tokens de acción. El VLA subyacente (`pravsels/pi05_busybox_multitask_minmax`) permanece congelado durante el entrenamiento, con `rl_vla_loss_weight=0.0`, lo que significa que solo se entrenan los componentes RLT. La acción se representa como un vector de 6 dimensiones para un solo brazo: 5 articulaciones en delta (diferencia entre pasos) y la pinza en valor absoluto.

El entrenamiento se realizó sobre el dataset `villekuosmanen/busybox_multitask` (66 episodios, 27 tareas) con un batch global de 16, un horizonte de acción de 30 pasos y 20.000 pasos de entrenamiento. La normalización se aplica por paso temporal usando percentiles `q01`/`q99`, y los assets del Hub se copiaron sin recalcular. Las instrucciones se reasignan por frame usando `prompt_from_task` con 27 instrucciones remapeadas, sin una instrucción predeterminada única. El entrenamiento se ejecutó en una GPU A100 80GB en GCloud durante 4 horas y 13 minutos, con una pérdida que descendió de 10755.68 (paso 0) a 293.81 (paso 19900).

## Capacidades

- Codificación y decodificación de tokens de acción para control robótico de un solo brazo.
- Procesamiento de observaciones visuales desde tres cámaras: `top` → `base_0_rgb`, `wrist` → `left_wrist_0_rgb`, `front` → `base_1_rgb`.
- Soporte de 27 tareas multitarea definidas en el dataset busybox_multitask.
- Normalización de acciones por paso temporal con percentiles `q01`/`q99`.
- Integración con el ecosistema OpenPI para carga y ejecución de políticas.
- Extracción de tokens para el pipeline RLT (RL-token Stage 1).
- Control de 5 articulaciones en delta y pinza en valor absoluto.
- Reasignación de instrucciones por frame mediante `prompt_from_task`.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: el modelo sirve como componente de tokenización de acciones en pipelines RLT, permitiendo a los investigadores separar la representación de acciones del aprendizaje de políticas.
- Control robótico de un solo brazo en entornos simulados o reales: puede integrarse en sistemas que requieran convertir observaciones visuales en comandos de articulación precisos.
- Desarrollo de políticas multitarea: al estar entrenado sobre 27 tareas del dataset busybox_multitask, puede servir como base para evaluar la generalización entre tareas de manipulación.
- Benchmarking de métodos de tokenización de acciones: su configuración con normalización min/max por paso temporal permite comparar diferentes estrategias de representación de acciones.
- Integración en sistemas de teleoperación o demostración: el modelo puede procesar demostraciones humanas y convertirlas en tokens de acción para entrenamiento posterior.
- Evaluación de la transferencia de políticas VLA congeladas: al mantener el VLA congelado, permite aislar el efecto del módulo RLT en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento, que descendio de 10755.68 (paso 0) a 293.81 (paso 19900), pero no hay datos de evaluacion en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero el entrenamiento se realizo en una GPU A100 80GB.
- GPU recomendada: A100 80GB (usada para entrenamiento); para inferencia, una GPU con al menos 24GB de VRAM seria probablemente necesaria dado el tamano del repositorio (6,3 GB), aunque no se especifica.
- No se indica si cabe en GPUs de consumo como RTX 4090 o similares.
- Opciones de despliegue: el modelo se integra con OpenPI, por lo que puede servirse mediante `scripts/serve_policy.py` del repositorio OpenPI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada. El modelo es especifico del ecosistema OpenPI/π0.5 y no se dispone de datos de otros modelos RLT similares para establecer una comparativa.

## Limitaciones y advertencias

- El dataset de entrenamiento es reducido (66 episodios, 27 tareas), lo que puede limitar la generalizacion a escenarios no vistos.
- La licencia no esta especificada, por lo que se desconoce si es apto para uso comercial.
- No se publica el estado de entrenamiento (`train_state/`), solo los parametros finales, lo que dificulta reanudar el entrenamiento o realizar analisis intermedios.
- La normalizacion se copio de los assets del Hub sin recalcular, lo que podria introducir inconsistencias si los datos de origen cambian.
- El modelo esta disenado para un solo brazo y con una configuracion de camaras especifica; su uso en otros entornos requiere adaptacion.
- No se proporcionan datos de sesgos, alucinacion o limitaciones de contexto, al ser un modelo de robotica sin capacidades de lenguaje generativo.
- La fecha de creacion (2026-09-03) es futura respecto a la fecha actual, lo que sugiere que puede tratarse de un modelo experimental o de un error en la fecha.

## Enlaces

- [HuggingFace: pravsels/pi05_rlt_busybox_multitask_singlearm_minmax](https://huggingface.co/pravsels/pi05_rlt_busybox_multitask_singlearm_minmax)
- [VLA asociado: pravsels/pi05_busybox_multitask_minmax](https://huggingface.co/pravsels/pi05_busybox_multitask_minmax)
- [Dataset: villekuosmanen/busybox_multitask](https://huggingface.co/datasets/villekuosmanen/busybox_multitask)
- [Repositorio OpenPI (π0.5)](https://github.com/Physical-Intelligence/openpi)
- [W&B proyecto: busybox_multitask_rlt_singlearm_minmax](https://wandb.ai/pravsels/busybox_multitask_rlt_singlearm_minmax)
- [W&B run: 93keszgb](https://wandb.ai/pravsels/busybox_multitask_rlt_singlearm_minmax/runs/93keszgb)
