# logits/pi05_robodojo_step15000

## Resumen

El modelo `logits/pi05_robodojo_step15000` es un checkpoint de la política robótica FlashVLA PI0.5, entrenado sobre el benchmark RoboDojo y exportado en el paso 15000 de entrenamiento. Lo publica el usuario `logits` en HuggingFace bajo la librería LeRobot, con un peso total de 4.933.375.760 parámetros (aproximadamente 4,9 mil millones) y un tamaño de repositorio de 19,7 GB en formato safetensors.

El modelo pertenece a la familia de políticas visión-lenguaje-acción (VLA) π0.5, desarrollada originalmente por Physical Intelligence y adaptada al ecosistema RoboDojo a través del stack OpenPI. RoboDojo es un benchmark unificado de simulación y mundo real para la evaluación exhaustiva de políticas de manipulación robótica generalistas, con 42 tareas de simulación y 18 tareas del mundo real, mantenido por un consorcio académico sin ánimo de lucro.

La relevancia de este checkpoint radica en que representa una baseline de π0.5 entrenada específicamente sobre RoboDojo, lo que permite comparar el rendimiento de esta arquitectura frente a otras políticas en un entorno de evaluación estandarizado y neutral. Al estar exportado en formato LeRobot, es directamente cargable con las herramientas estándar de esta librería para evaluación o despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlashVLA PI0.5 (visión-lenguaje-acción) |
| Parametros totales | 4.933.375.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura FlashVLA PI0.5 es una política de visión-lenguaje-acción que combina un codificador visual con un modelo de lenguaje para generar acciones de control robotico directamente. Forma parte de la familia π0.5 de Physical Intelligence, que se caracteriza por su capacidad de procesar observaciones visuales y producir comandos de actuacion de forma autoregresiva. El modelo ha sido adaptado al benchmark RoboDojo mediante el stack OpenPI, que gestiona el entorno de entrenamiento y evaluacion.

El entrenamiento se ha realizado sobre el conjunto de tareas de RoboDojo, que incluye 42 tareas de simulacion y 18 tareas del mundo real, cubriendo una amplia variedad de habilidades de manipulacion robotica. El checkpoint se exporto en el paso 15000 de entrenamiento, lo que indica una fase relativamente temprana del proceso de optimizacion. No se dispone de informacion detallada sobre la composicion exacta del dataset de entrenamiento, el numero total de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de acciones de control robotico a partir de observaciones visuales y, potencialmente, instrucciones en lenguaje natural.
- Manipulacion robotica generalista: el modelo esta entrenado para resolver multiples tareas de manipulacion dentro del benchmark RoboDojo.
- Procesamiento de entradas multimodales (vision y lenguaje) para generar salidas de actuacion continua.
- Adaptacion a entornos de simulacion y del mundo real, dado que RoboDojo incluye ambos tipos de escenarios.
- Integracion con el ecosistema LeRobot para carga, evaluacion y despliegue.
- Soporte para evaluacion estandarizada mediante el leaderboard publico de RoboDojo.

## Casos de uso

- Evaluacion de politicas VLA en entornos de simulacion: el modelo puede cargarse en LeRobot y evaluarse en las 42 tareas de simulacion de RoboDojo para medir su rendimiento frente a otras politicas en el leaderboard publico.
- Investigacion academica en manipulacion robotica: grupos de investigacion pueden utilizar este checkpoint como baseline de π0.5 para comparar nuevas arquitecturas o tecnicas de entrenamiento en condiciones estandarizadas.
- Desarrollo de politicas de manipulacion para tareas especificas: a partir de este checkpoint, se puede realizar fine-tuning en tareas concretas de RoboDojo o en datasets propios para adaptar el comportamiento a dominios particulares.
- Estudio de transferencia sim-to-real: dado que RoboDojo incluye tareas del mundo real, el modelo puede utilizarse para investigar la transferencia de politicas entrenadas en simulacion a entornos fisicos.
- Benchmarking de infraestructura de entrenamiento: el checkpoint puede servir para validar pipelines de entrenamiento distribuido o de exportacion de modelos en el ecosistema OpenPI/LeRobot.
- Reproducibilidad de resultados: al ser un checkpoint publico con paso de entrenamiento conocido, permite reproducir experimentos y verificar resultados publicados en la literatura sobre RoboDojo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un checkpoint intermedio (paso 15000) y no se incluyen metricas de evaluacion en la model card ni en los resultados de busqueda web. Para obtener datos de rendimiento, seria necesario evaluar el modelo en las tareas de RoboDojo y consultar el leaderboard publico del benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,9 mil millones de parametros, el modelo en precision FP32 ocupa aproximadamente 19,7 GB. En BF16 (precision tipica para inferencia de VLA) ocuparia unos 9,9 GB, y en INT8 unos 4,9 GB. Se recomienda una GPU con al menos 24 GB de VRAM para inferencia en BF16 sin cuantizacion adicional.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), RTX 4090 (24 GB) o GPUs profesionales equivalentes. Para cuantizacion INT8, una RTX 3090 (24 GB) o RTX 4080 (16 GB) podrian ser suficientes.
- No se recomienda su uso en GPUs de consumo con menos de 16 GB de VRAM sin cuantizacion agresiva.
- Opciones de despliegue: al estar en formato LeRobot, puede cargarse con la libreria LeRobot. Para despliegue en produccion, podria convertirse a otros formatos (ONNX, TensorRT) o utilizarse con frameworks de inferencia como vLLM si se adapta a un formato compatible.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantizacion y el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| logits/pi05_robodojo_step15000 | 4,9 B | no disponible | RoboDojo (paso 15000) | no disponible |
| cjgogo/RoboDojo-pi05-checkpoints | no disponible | no disponible | RoboDojo | gemma-terms-and-robodojo-non-commercial-research-license |
| π0.5 original (Physical Intelligence) | no disponible | no disponible | Datos propietarios | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos. La principal diferencia con el checkpoint de `cjgogo` es que este ultimo se distribuye bajo una licencia que combina los terminos de Gemma con la licencia de investigacion no comercial de RoboDojo, mientras que la licencia del modelo de `logits` no esta especificada.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial o de investigacion. Se recomienda contactar al autor antes de cualquier uso.
- Checkpoint intermedio: al ser el paso 15000 de entrenamiento, el rendimiento puede ser inferior al de checkpoints posteriores o al modelo final.
- Datos de entrenamiento limitados a RoboDojo: el modelo esta especializado en las tareas de este benchmark y puede no generalizar bien a otros dominios de manipulacion robotica.
- Sin informacion sobre sesgos: no se dispone de datos sobre posibles sesgos en el comportamiento del modelo, especialmente en entornos del mundo real.
- Riesgo de alucinacion en acciones: como cualquier politica VLA, puede generar acciones incorrectas o inseguras en situaciones fuera de su distribucion de entrenamiento.
- Restricciones de RoboDojo: el benchmark esta gobernado por un consorcio academico sin fines comerciales, lo que puede implicar restricciones en el uso de modelos entrenados sobre el.
- Sin soporte de idiomas declarado: no se especifican los idiomas soportados para instrucciones en lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logits/pi05_robodojo_step15000
- Repositorio de RoboDojo: https://github.com/robodojo-benchmark/RoboDojo
- Web oficial de RoboDojo: https://robodojo-benchmark.com/
- Documentacion de Pi_05 en XPolicyLab: https://github.com/XPolicyLab/XPolicyLab/blob/main/policy/Pi_05/README.md
- Checkpoints alternativos de RoboDojo-pi05: https://huggingface.co/cjgogo/RoboDojo-pi05-checkpoints
