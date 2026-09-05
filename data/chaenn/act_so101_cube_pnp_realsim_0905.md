# Chaenn/act_so101_cube_pnp_realsim_0905

## Resumen

El modelo `Chaenn/act_so101_cube_pnp_realsim_0905` es una política de aprendizaje por imitación desarrollada por Chaenn, basada en el método ACT (Action Chunking with Transformers). Se ha entrenado y publicado utilizando la librería LeRobot de Hugging Face, y está diseñado para controlar un brazo robótico SO100 en la tarea de colocar un cubo en una posición determinada, combinando datos de simulación y de entornos reales. El modelo resuelve el problema de generar secuencias de acciones motoras a partir de observaciones del robot, en lugar de predecir pasos individuales, lo que mejora la estabilidad y la tasa de éxito en manipulaciones robóticas.

La arquitectura subyacente es un transformer que predice "chunks" de acciones cortos. El modelo tiene un total de 51.668.614 parámetros, almacenados en formato safetensors, y ocupa aproximadamente 0.2 GB en el repositorio. Su relevancia actual radica en ser un ejemplo práctico de aplicación de ACT en robótica, con soporte nativo para LeRobot, lo que facilita su reproducción, evaluación y despliegue en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa ACT, un método de aprendizaje por imitación que utiliza un transformer para predecir secuencias de acciones (chunks) en lugar de acciones individuales. Esta aproximación reduce el error acumulativo y permite ejecutar movimientos más suaves y coherentes en tareas de manipulación. El modelo se ha entrenado con el dataset `Chaenn/so101_cube_place_drprodsim_real_0905_1170`, que combina datos teleoperados de un robot SO100 en entornos simulados y reales. No se han indicado procesos de RLHF, DPO ni otras técnicas de optimización posteriores al entrenamiento por imitación. El entrenamiento y la evaluación se realizan mediante la librería LeRobot, que proporciona las herramientas necesarias para registrar datos, entrenar políticas y ejecutar evaluaciones en robots reales.

## Capacidades

- Generación de secuencias de acciones motoras para control robótico, basadas en observaciones del entorno.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Ejecución de tareas de manipulación con brazo robótico, como la colocación de cubos en posiciones concretas.
- Integración nativa con LeRobot, lo que permite entrenar, evaluar y desplegar la política de forma sencilla.
- Compatibilidad con el robot SO100 (follower) para la ejecución de políticas entrenadas.
- No soporta tool calling, generación de texto, razonamiento simbólico ni procesamiento de lenguaje natural.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robótico SO100 para recoger un cubo y colocarlo en una ubicación específica, reduciendo la necesidad de programación manual de trayectorias.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT o para estudiar el efecto de combinar datos simulados y reales en políticas robóticas.
- Robótica educativa y prototipado: gracias a su tamaño reducido y a la integración con LeRobot, permite a estudiantes y desarrolladores entrenar y evaluar políticas de manipulación en laboratorios con hardware asequible.
- Automatización de laboratorios: el modelo puede utilizarse para colocar muestras o componentes en posiciones predeterminadas, una tarea común en entornos de investigación y ensayo.
- Benchmarking de políticas de imitación: al estar publicado con el dataset asociado, facilita la reproducción de experimentos y la comparación de resultados entre diferentes políticas.
- Integración en líneas de producción flexibles: la capacidad de aprender de demostraciones permite adaptar el robot a nuevas tareas de colocación sin necesidad de reprogramar el sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos para este modelo.
- Dado el tamaño de 51,7 millones de parámetros, se espera que la inferencia quepa en GPUs de consumo, pero no hay datos oficiales de VRAM estimada.
- El modelo se despliega principalmente mediante LeRobot, no a través de frameworks como vLLM, Ollama o TGI.
- Para la evaluación en robot real se requiere un brazo robótico SO100 compatible.
- No se dispone de métricas de latencia ni throughput publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables con datos de rendimiento publicados. Existen versiones anteriores del mismo autor, como `Chaenn/act_so101_cube_pnp_realsim_0902` y `Chaenn/act_so101_cube_pnp_realsim_0904`, que pertenecen a la misma familia de políticas ACT y están entrenadas en tareas similares, pero no se han encontrado especificaciones ni resultados que permitan una comparación técnica rigurosa.

## Limitaciones y advertencias

- El modelo está especializado en una tarea concreta (colocar un cubo) y en un robot específico (SO100); su generalización a otros objetos, entornos o brazos robóticos no está garantizada sin reentrenamiento.
- No se han documentado sesgos conocidos, pero la política puede verse afectada por la distribución de los datos de demostración, que pueden no cubrir todos los estados posibles.
- Al tratarse de un modelo de acciones motoras, el riesgo de alucinación en el sentido tradicional no aplica; sin embargo, puede generar acciones incorrectas si las observaciones difieren de las del entrenamiento.
- La licencia Apache 2.0 permite el uso comercial y la modificación, siempre que se mantenga el aviso de licencia y se indiquen los cambios realizados.
- No se dispone de información sobre la longitud de contexto ni sobre la capacidad de procesar entradas multimodales o de lenguaje, por lo que su uso se limita al ámbito de la robótica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/act_so101_cube_pnp_realsim_0905
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Versión anterior 0902: https://huggingface.co/Chaenn/act_so101_cube_pnp_realsim_0902
- Versión anterior 0904: https://huggingface.co/Chaenn/act_so101_cube_pnp_realsim_0904
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaenn/so101_cube_place_drprodsim_real_0905_1170
