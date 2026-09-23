# jiankimr/FI-Libero10-poisoned-policies

## Resumen

FI-Libero10-poisoned-policies es una colección de checkpoints de políticas robóticas entrenadas con flow matching sobre el backbone ChiTransformer, el mismo que emplea la Diffusion Policy de Chi et al. El autor, jiankimr, los entrena durante 50.000 pasos sobre las diez tareas de LIBERO-10 de forma simultánea, usando una condicional de tarea codificada como one-hot de 10 dimensiones. No es un modelo de lenguaje: es una política de manipulación visual-motora, por lo que sus entradas son observaciones (imágenes y estado del robot) y su salida son acciones.

El interés del repositorio es que se trata de un artefacto de investigación sobre envenenamiento de datos (data poisoning), no de un modelo listo para producción. Cada subcarpeta `gr00t_v2_x{alpha}/`, con alpha de 0,1 a 0,6, se ha entrenado sobre rollouts generados por GR00T en los que el comando del eje x alterna `+alpha, -alpha, ...`, es decir, trayectorias deliberadamente corruptas. Estos checkpoints corresponden a la columna `Gr00t_x{alpha}` de las tablas de comparación de transferibilidad del trabajo asociado.

El repositorio ocupa 8,4 GB y contiene, por cada valor de alpha, dos checkpoints (`model_latest.pt`, usado en la reevaluación, y `model_best.pt`, seleccionado según el éxito medio entre tareas). La licencia es MIT. Su relevancia actual es metodológica: permite estudiar hasta qué punto una política de imitación multi-tarea absorbe o rechaza comportamientos anómalos inyectados en los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ChiTransformer (backbone de Diffusion Policy, Chi et al.) con cabecera de flow matching |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; la entrada son observaciones de imagen y estado) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no aplicable (politica robotica; la condicional de tarea es un one-hot de 10 dimensiones) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`torch.save`), sin safetensors ni GGUF |
| Numero de checkpoints | 12 (6 carpetas `gr00t_v2_x{alpha}` x `model_latest.pt` y `model_best.pt`) |
| Valores de alpha | 0,1 / 0,2 / 0,3 / 0,4 / 0,5 / 0,6 |
| Tamano del repositorio | 8,4 GB |
| Tareas de entrenamiento | las 10 tareas de LIBERO-10, multitarea con condicional one-hot |
| Pasos de entrenamiento | 50.000 |
| Fecha de publicacion | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

La política emplea flow matching como objetivo de entrenamiento (`optimization.loss_type=flow`) sobre el backbone ChiTransformer, la arquitectura de codificador transformer introducida en la Diffusion Policy de Chi et al. Se trata por tanto de un modelo de acción continua condicionado por observaciones visuales, no de un transformer autorregresivo de texto. La condicional de tarea se implementa como un vector one-hot de 10 dimensiones, lo que permite que un único conjunto de pesos cubra las diez tareas de LIBERO-10 en lugar de entrenar una política por tarea.

El entrenamiento se realizó durante 50.000 pasos sobre datos derivados del dataset `jiankimr/FI-Libero10-gr00t-poisoned-rollouts`. Para cada valor de alpha, las trayectorias de origen son rollouts de GR00T en los que el comando del eje x alterna entre `+alpha` y `-alpha`, lo que introduce un sesgo direccional sistemático en las demostraciones. El checkpoint `model_best.pt` se selecciona según el éxito medio entre tareas, y `model_latest.pt` es el utilizado en la reevaluación mediante `launch_gr00t_reeval_all.sh`. No se documentan en la información disponible ni el número total de tokens o transiciones, ni la composición del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en este tipo de políticas).

Cada checkpoint es un diccionario serializado con `torch.save` que contiene las claves `flow_map`, `encoder`, `flow_map_ema`, `encoder_ema`, `optimizer` y `training_state`, y se carga con `TrainingAgent.load()`. La presencia del estado del optimizador y del estado de entrenamiento explica en buena parte el tamaño del repositorio, ya que cada carpeta ronda 1,4 GB para dos ficheros.

## Capacidades

- Generación de acciones continuas de manipulación robótica a partir de observaciones visuales y de estado, mediante flow matching.
- Ejecución multitarea: una sola política cubre las diez tareas de LIBERO-10, seleccionadas mediante la condicional one-hot.
- Aprendizaje por imitación a partir de rollouts, sin necesidad de recompensa explícita.
- Evaluación controlada de robustez: las variantes con distintos valores de alpha permiten medir la sensibilidad de la política a la corrupción direccional de las demostraciones.
- Soporte de tool calling / function calling: no aplicable.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no aplicable.
- Capacidades multilingües: no aplicable.
- Capacidad especial: sirve como referencia negativa (modelo envenenado) en estudios de transferibilidad y de detección de datos corruptos en imitation learning.

## Casos de uso

- Investigación sobre envenenamiento de datos en imitation learning: el repositorio ofrece seis políticas entrenadas con distintos niveles de corrupción direccional (alpha de 0,1 a 0,6), lo que permite trazar curvas de degradación de éxito frente a la intensidad del sesgo inyectado.
- Evaluación de transferibilidad entre tareas: al estar entrenada de forma multitarea sobre LIBERO-10, cada checkpoint se puede reevaluar en el conjunto completo de tareas (`task.eval_task_ids='[0,1,2,3,4,5,6,7,8,9]'`) y comparar el éxito cruzado entre tareas con y sin envenenamiento.
- Estudios de detección de anomalías en datasets robóticos: los rollouts con oscilación `+alpha, -alpha` son un patrón anómalo conocido, de modo que estos checkpoints sirven de control para validar métodos que intentan detectar demostraciones corruptas antes del entrenamiento.
- Reproducción de experimentos: la model card incluye el comando exacto de descarga y evaluación, con 50 episodios por configuración y guardado de métricas de fatiga (`log.save_fatigue_metrics=true`), lo que facilita replicar los resultados.
- Línea base en pipelines de investigación con LIBERO: dado que el backbone y el script de entrenamiento son públicos en el repositorio de código, estos pesos se pueden usar como punto de comparación frente a políticas entrenadas con datos limpios.
- Análisis de robustez ante distribuciones de demostración sesgadas: útil para estudiar qué mecanismos de una política de difusión atenúan o amplifican un sesgo direccional presente en los datos.
- Formación y divulgación técnica: material didáctico para ilustrar flow matching aplicado a robótica y el impacto de la calidad de los datos en políticas visual-motoras.
- No recomendado como política de manipulación en producción: al haber sido entrenada sobre trayectorias deliberadamente corruptas, su uso fuera de un contexto de investigación no está justificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el protocolo de evaluación (descarga de una carpeta concreta, `mode=eval`, `network=chitransformer`, `optimization=libero`, 50 episodios de evaluación y comparación mediante el éxito medio entre tareas y las tablas de transferibilidad con columnas `Gr00t_x{alpha}`), pero no incluye cifras de éxito, ni resultados de MMLU, HumanEval o GSM8K (no aplicables a una política robótica), ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica requisitos de memoria, número de parámetros ni huella del modelo en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se puede confirmar sin conocer el tamaño del modelo.
- Opciones de despliegue: este modelo no es un LLM, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables. La vía documentada es cargar el `.pt` con `TrainingAgent.load()` dentro del repositorio de código `jiankimr/FI_Libero` y ejecutar la evaluación con `uv run python examples/train_libero10_multitask.py`.
- Nota sobre el tamaño del repositorio: los 8,4 GB corresponden a 12 checkpoints que incluyen estado del optimizador y estado de entrenamiento, no a pesos de inferencia limpios; el peso real de un checkpoint sin esos estados sería inferior, aunque su magnitud exacta no se especifica.
- Latencia y throughput: no disponible.
- Dependencias: se necesita el entorno `uv` definido en el repositorio de código y acceso al script `examples/train_libero10_multitask.py`, además del simulador y los datos de LIBERO-10 para la evaluación.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FI-Libero10-poisoned-policies | Politica de flow matching, backbone ChiTransformer, multitarea | no disponible | no aplicable | no publicado | MIT | HuggingFace (jiankimr) |
| Diffusion Policy (Chi et al.) | Politica de difusion, origen del backbone ChiTransformer | no disponible | no aplicable | no disponible en esta informacion | consultar repositorio original | repositorio original del paper |
| GR00T | Politica generalista de robotica | no disponible | no aplicable | no disponible en esta informacion | no disponible en esta informacion | usado aqui solo como generador de los rollouts envenenados |

La model card menciona tablas de comparación de transferibilidad con columnas `Gr00t_x{alpha}`, pero esas tablas no se incluyen en la información disponible, por lo que no es posible reproducir aquí una comparación numérica con alternativas.

## Limitaciones y advertencias

- Los pesos están entrenados deliberadamente sobre rollouts envenenados: el comando del eje x oscila entre `+alpha` y `-alpha`, lo que introduce un sesgo direccional sistemático. No deben usarse como política operativa.
- Riesgo de comportamientos erráticos o de alucinación motora: la política puede reproducir patrones oscilatorios aprendidos de los datos corruptos.
- No se documenta ninguna evaluación de sesgos más allá del sesgo inyectado, ni de seguridad física en entornos reales.
- Herramientas de seguridad: al ser una política de control, cualquier despliegue sobre hardware real requiere límites de par, paradas de emergencia y supervisión humana.
- Limitaciones de idioma: no aplicable, pero tampoco hay soporte multilingüe ni de instrucciones en lenguaje natural; la condicional es un one-hot de tarea de 10 dimensiones.
- Alcance restringido al benchmark LIBERO-10: no hay evidencia de generalización a otras tareas, morfologías de robot o cámaras distintas.
- Licencia MIT: permite uso comercial y modificación, pero la licencia no cubre los datos de origen ni las dependencias del repositorio de código, que deben verificarse por separado.
- Formato de pesos `.pt` basado en `torch.save`: implica deserialización de pickle, con los riesgos de seguridad asociados a cargar ficheros de origen no verificado.
- Repositorio sin descargas ni likes en el momento de la consulta y con un único autor, lo que reduce la validación externa disponible.
- La reevaluación depende de scripts concretos (`launch_gr00t_reeval_all.sh`, `examples/train_libero10_multitask.py`) y de la configuración `network=chitransformer`, `optimization=libero`; cambios en el repositorio de código pueden romper la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiankimr/FI-Libero10-poisoned-policies
- Dataset de rollouts envenenados: https://huggingface.co/datasets/jiankimr/FI-Libero10-gr00t-poisoned-rollouts
- Repositorio de código: https://github.com/jiankimr/FI_Libero
- Paper de Diffusion Policy (Chi et al.), origen del backbone ChiTransformer: no disponible en la información proporcionada
- Demo o espacio de prueba: no disponible
