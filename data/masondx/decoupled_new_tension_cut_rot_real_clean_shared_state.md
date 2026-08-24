# masondx/decoupled_new_tension_cut_rot_real_clean_shared_state

## Resumen

El modelo `masondx/decoupled_new_tension_cut_rot_real_clean_shared_state` es una política robótica de aprendizaje por imitación entrenada con la librería LeRobot de Hugging Face. Está diseñada para controlar un sistema bimanual de cirugía robótica (dos brazos tipo PSM) en una tarea concreta: tensar y cortar una cuerda. El modelo fue desarrollado por el usuario masondx (Hongming Mei) y publicado en agosto de 2026 con licencia Apache 2.0.

Se trata de un modelo de difusión desacoplada bimanual (`decoupled_bimanual_diffusion`), una arquitectura que genera acciones de forma condicionada a observaciones visuales y de estado. Con 543 millones de parámetros y un peso de 2,2 GB en formato safetensors, está diseñado para ejecutarse en tiempo real sobre un robot físico o simulado. Su relevancia radica en ser un ejemplo de aplicación de aprendizaje por imitación a tareas quirúrgicas de precisión, un área con gran interés en robótica asistida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoupled bimanual diffusion (política de difusión desacoplada para dos brazos) |
| Parametros totales | 543.367.124 |
| Parametros activos | No aplica (no es modelo MoE) |
| Longitud de contexto | No aplica (modelo robótico, no lingüístico) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es una política de difusión desacoplada para control bimanual, implementada en LeRobot. Se trata de un modelo que predice acciones de 20 dimensiones (10 por brazo) a partir de observaciones de tres cámaras (imágenes RGB de 240×360) y un vector de estado de 20 dimensiones. La parte desacoplada indica que los dos brazos se modelan con ramas de difusión independientes, aunque comparten una representación común del estado. El entrenamiento se realizó con el dataset `masondx/new_tension_cut_rot_real_clean0`, que contiene 59 episodios y 50.237 fotogramas a 20 FPS, correspondientes a la tarea de tensar y cortar una cuerda. Se usaron 70.000 pasos de entrenamiento, batch de 8, optimizador Adam con learning rate de 1e-4 y semilla 1000, bajo la versión 0.6.2 de LeRobot.

## Capacidades

- Control bimanual de robots quirúrgicos (dos brazos PSM) para tareas de manipulación de precisión.
- Percepción multimodal: procesa imágenes de tres cámaras simultáneamente (cam0, cam1, cam2) junto con un vector de estado del robot.
- Generación de acciones continuas de 20 dimensiones (posición y orientación de cada brazo) mediante difusión.
- Aprendizaje de tareas complejas de manipulación con contacto físico (tensar, cortar) mediante imitación de demostraciones.
- Ejecución en tiempo real: el modelo puede desplegarse en un robot tipo `unity` con el pipeline de LeRobot.
- Capacidad de generalización limitada a la tarea específica del dataset de entrenamiento.

## Casos de uso

- **Cirugía asistida por robot**: el modelo puede controlar un sistema bimanual para realizar maniobras de tensado y corte de tejidos o suturas, replicando demostraciones de cirujanos.
- **Teleoperación con aprendizaje por imitación**: en entornos de telecirugía, el modelo puede sustituir la teleoperación manual en tareas repetitivas, reduciendo la carga del cirujano.
- **Entrenamiento de habilidades robóticas**: sirve como punto de partida para transferir destrezas de manipulación bimanual a otros robots con arquitecturas similares.
- **Investigación en políticas de difusión**: como ejemplo de implementación de `decoupled_bimanual_diffusion`, permite estudiar el rendimiento de este enfoque en tareas de contacto físico.
- **Automatización de procesos quirúrgicos en simulación**: en entornos simulados como Unity, el modelo puede generar trayectorias de movimiento para validar algoritmos antes de pasar a hardware real.
- **Benchmark de aprendizaje robótico**: el modelo y su dataset pueden servir de referencia para evaluar nuevas técnicas de imitación en tareas bimanuales de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación en robot real ni en simulación. Por tanto, no se dispone de datos de éxito ni de métricas comparativas con otras políticas.

## Requisitos de hardware

- No se publican requisitos específicos de hardware en la model card.
- El modelo pesa 2,2 GB en safetensors, con 543 M de parámetros, lo que sugiere que puede ejecutarse en GPUs con al menos 6-8 GB de VRAM para inferencia en float32, y menos con cuantificación (aunque no se ofrecen versiones cuantizadas).
- Es compatible con el framework LeRobot, que soporta ejecución en GPU (CUDA) y también en CPU para pruebas, aunque con latencia mayor.
- Para despliegue en un robot real, se requiere un sistema con cámaras conectadas y el robot tipo `unity` configurado.
- No hay datos de latencia o throughput publicados; la inferencia con difusión suele requerir entre 10 y 50 ms por paso en GPUs modernas, pero esto es una estimación general, no específica de este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas bimanuales de difusión para cirugía). La model card no referencia otros modelos similares y la búsqueda web no encontró alternativas directamente comparables. Por tanto, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para una tarea específica (tensar y cortar una cuerda con dos brazos PSM). No generaliza a otras tareas o configuraciones de robot.
- El dataset de entrenamiento es pequeño (59 episodios), lo que puede provocar sobreajuste y falta de robustez ante variaciones en la posición de los objetos, iluminación o condiciones del entorno.
- No se han publicado resultados de evaluación en robot real, por lo que se desconoce el rendimiento real en hardware físico.
- La arquitectura de difusión puede ser computacionalmente intensiva, lo que podría limitar su uso en sistemas con recursos limitados.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de funcionamiento en entornos clínicos; cualquier uso en cirugía real requeriría validación exhaustiva y cumplimiento normativo.
- El modelo depende de la configuración exacta de cámaras y del estado del robot; cambios en la calibración o en el número de cámaras invalidan el funcionamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/masondx/decoupled_new_tension_cut_rot_real_clean_shared_state)
- [Dataset de entrenamiento](https://huggingface.co/datasets/masondx/new_tension_cut_rot_real_clean0)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=masondx/new_tension_cut_rot_real_clean0)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Perfil del autor en Hugging Face](https://huggingface.co/masondx)
