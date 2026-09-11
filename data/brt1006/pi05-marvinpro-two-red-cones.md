# Brt1006/pi05-marvinpro-two-red-cones

## Resumen

pi05-marvinpro-two-red-cones es un conjunto de checkpoints fine-tuneados de pi0.5, el modelo de visión-lenguaje-acción (VLA) de openpi, para el robot bimanual Marvin Pro en la tarea concreta de apilar dos conos rojos. No es un modelo de lenguaje generalista: se trata de una política robótica que recibe imágenes de tres cámaras y emite acciones de articulación para dos brazos, entrenada con la técnica de flow matching y ajustada mediante LoRA sobre el modelo base pi05_base.

El repositorio lo publica el usuario Brt1006 y contiene dos ejecuciones de entrenamiento: una limpia de 40 000 pasos (two_red_cones_clean_40k_h20) y otra de 20 000 pasos (two_red_cones_20k_h20). Cada directorio de paso incluye el estado completo para servir la política (params/ más assets/ con las estadísticas de normalización) y el estado del optimizador (train_state/) para reanudar o continuar el entrenamiento. El tamaño del repositorio es de 19,1 GB.

El modelo es relevante para quienes trabajan en manipulación bimanual porque sirve como ejemplo reproducible de un pipeline VLA completo: configuración de entrenamiento, pesos, estadísticas de normalización y servidor WebSocket de inferencia. La licencia es Apache-2.0, el pipeline declarado es robotics y el horizonte de acciones configurado es H=20 sobre un espacio de articulaciones de 16 dimensiones con acciones delta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching, derivada de pi0.5; fine-tuning con LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizados) |
| Idiomas soportados | no disponible (el modelo produce acciones de robot, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (directorio params/ del pipeline openpi; el formato concreto no se especifica en la model card) |
| Modelo base | pi05_base (se descarga automáticamente desde gs://openpi-assets) |
| Tarea | Apilado de dos conos rojos (two-red-cones stacking) |
| Horizonte de acciones | H = 20 |
| Espacio de acciones | 16 dimensiones, articulaciones de doble brazo, acciones delta-joint |
| Entradas de cámara | cam_high, cam_left_wrist, cam_right_wrist |
| Checkpoints incluidos | 40k pasos (run limpia) y 20k pasos |
| Tamaño del repositorio | 19,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un VLA basado en pi0.5 que combina percepción visual multicámara y generación de acciones mediante flow matching, la misma familia de modelos que openpi distribuye para control robótico. Sobre ese modelo base se aplica un ajuste fino con LoRA, lo que reduce el número de parámetros entrenables y permite especializar la política en una tarea concreta sin reentrenar el modelo completo. Las acciones se emiten como deltas de articulación en un espacio de 16 dimensiones correspondiente a los dos brazos del Marvin Pro, con un horizonte de acción de 20 pasos.

El entrenamiento se realizó con dos configuraciones del fork de openpi mantenido por el autor: pi05_marvinpro_two_red_cones y pi05_marvinpro_two_red_cones_clean. La primera corresponde a una ejecución de 20 000 pasos y la segunda, etiquetada como "clean", a una de 40 000 pasos. No se documenta en la información disponible el número de episodios de demostración, la composición del dataset, la resolución de las imágenes ni si hubo etapas de RLHF o DPO; en el contexto de políticas robóticas, el ajuste fino se realiza normalmente por imitación supervisada sobre demostraciones, pero ese extremo no se confirma en la model card.

Como innovación operativa, el repositorio conserva tanto los pesos de inferencia y las estadísticas de normalización como el train_state del optimizador, lo que habilita reanudar el entrenamiento o hacer post-entrenamiento sobre el mismo punto. La inferencia se expone mediante un servidor WebSocket del propio openpi.

## Capacidades

- Generación de secuencias de acciones para un robot bimanual: produce vectores delta-joint de 16 dimensiones con horizonte de 20 pasos.
- Percepción visual multimodal: consume tres flujos de cámara simultáneos (vista superior y muñecas izquierda y derecha).
- Ejecución de una tarea de manipulación específica: apilado de dos conos rojos sobre la plataforma Marvin Pro.
- Reanudación y post-entrenamiento: el train_state incluido permite continuar el entrenamiento desde el paso final.
- Despliegue como servicio: integración con scripts/serve_policy.py de openpi mediante WebSocket en el puerto configurado.
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional.
- No soporta agentes de múltiples pasos ni razonamiento simbólico más allá del bucle de control propio del robot.
- Capacidades multilingües: no aplica, ya que la salida es una acción motora, no texto.
- Capacidades especiales: no se documenta modo de razonamiento extendido, visión para descripción de escenas ni procesamiento de audio.

## Casos de uso

- Apilado automatizado de piezas en línea de producción: el modelo ejecuta directamente la tarea de colocar un cono rojo sobre otro, con las tres cámaras como única entrada sensorial, lo que permite sustituir scripts de control escritos a mano por una política aprendida.
- Punto de partida para fine-tuning en tareas propias: al incluir train_state y las estadísticas de normalización, un equipo puede reanudar el entrenamiento con sus propias demostraciones sobre Marvin Pro en lugar de partir de pi05_base.
- Evaluación de pipelines VLA en robótica bimanual: sirve como caso de referencia para medir latencia de inferencia, estabilidad del servidor WebSocket y comportamiento del horizonte de acción H=20 sobre hardware real.
- Investigación en ajuste fino con LoRA: permite estudiar cuánto rendimiento se conserva al especializar un VLA grande en una única tarea con un número reducido de parámetros entrenables.
- Pruebas de robustez ante variaciones de iluminación y posición: la política puede evaluarse con los conos en posiciones desplazadas para caracterizar su generalización dentro de la misma tarea.
- Integración en un banco de pruebas de manipulación dual-arm: el espacio de acciones delta-joint de 16 dimensiones encaja con controladores de posición incremental ya existentes en laboratorios que trabajan con brazos de dos manipuladores.
- Docencia y demostraciones reproducibles: el repositorio contiene todo lo necesario para levantar un servidor de política y mostrar un ciclo completo de percepción, inferencia y ejecución motora.
- Generación de datos de comparación: sus dos checkpoints (20k y 40k pasos) permiten estudiar la evolución del comportamiento de una política en función del número de pasos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en la tarea de apilado, ni métricas de error de acción, ni comparaciones numéricas con otras políticas. Los únicos datos cuantitativos documentados son el número de pasos de entrenamiento (20 000 y 40 000) y el horizonte de acciones (H=20).

## Requisitos de hardware

- VRAM para inferencia: el autor indica un mínimo de 8 GB en una GPU NVIDIA; no se especifica el consumo exacto ni el efecto de distintas precisiones.
- GPU recomendadas: no disponible; el único requisito documentado es NVIDIA con al menos 8 GB, lo que cubre tarjetas de gama consumer recientes (por ejemplo, la familia RTX con 8 GB o más) y GPUs de centro de datos.
- Encaje en GPU consumer: sí, según el requisito declarado de 8 GB, aunque el rendimiento real en tarjetas de gama baja no se documenta.
- Espacio en disco: el repositorio ocupa 19,1 GB, cantidad a tener en cuenta antes de descargar ambos checkpoints con estados de optimizador.
- Opciones de despliegue: servidor WebSocket de openpi mediante scripts/serve_policy.py con la configuración pi05_marvinpro_two_red_cones o pi05_marvinpro_two_red_cones_clean; instalación del entorno con uv. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no se publican pesos en GGUF.
- Descarga del modelo base: pi05_base se obtiene automáticamente del bucket público gs://openpi-assets en el primer uso, por lo que se necesita conectividad a ese origen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-marvinpro-two-red-cones (este) | VLA pi0.5 + LoRA, tarea de apilado | no disponible | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| pi05_base (modelo base de openpi) | VLA pi0.5 sin especializar | no disponible | no disponible | no disponible en la información proporcionada | Descarga automática desde gs://openpi-assets |
| Otras políticas VLA de manipulación | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numéricos que permitan comparar el rendimiento de este checkpoint con alternativas de la misma categoría. La única comparación documentada es cualitativa, frente a pi05_base: este repositorio añade un ajuste LoRA específico para Marvin Pro y la tarea de dos conos rojos, junto con las estadísticas de normalización y el estado del optimizador necesarios para servirlo o continuar el entrenamiento.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea (apilar dos conos rojos) sobre un único robot (Marvin Pro); no se espera que generalice a otras tareas, objetos o morfologías sin reentrenamiento.
- Dependencia del embodiment: el espacio de acciones es de 16 dimensiones con acciones delta-joint y tres cámaras concretas; cualquier cambio en la cinemática, el controlador o la disposición de cámaras invalida el modelo.
- Riesgo de comportamiento fuera de distribución: ante posiciones de objetos, iluminación o fondos distintos a los del dataset de entrenamiento, la política puede generar acciones erráticas o inseguras. No existe métrica publicada de robustez.
- Ausencia de validación pública: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no incluye tasas de éxito ni vídeos de evaluación.
- Idiomas: no aplica soporte multilingüe; no hay entrada o salida de texto documentada.
- Formato de pesos propietario del pipeline: al no publicarse GGUF ni cuantizaciones, no se puede desplegar con herramientas de inferencia de propósito general.
- Licencia: los pesos se publican bajo Apache-2.0, que permite uso comercial, pero el modelo base pi05_base se descarga desde un bucket de Google Cloud cuya licencia y condiciones no se detallan en la model card; conviene verificarlas antes de un despliegue comercial.
- Dependencia externa: el despliegue requiere clonar el fork de openpi del autor, que puede divergir del proyecto upstream.
- Metadatos a verificar: las fechas de creación y actualización del repositorio (11 de septiembre de 2026) son posteriores a la fecha habitual de consulta, por lo que conviene comprobar la integridad del repositorio y de los checkpoints antes de usarlos en producción.
- Seguridad física: cualquier uso sobre hardware real debe hacerse con límites de par, paradas de emergencia y supervisión humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Brt1006/pi05-marvinpro-two-red-cones
- Fork de openpi usado para el entrenamiento: https://github.com/jiguangBrt/openpi
- Proyecto openpi upstream (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Bucket de assets del modelo base (referenciado en la model card): gs://openpi-assets
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; las URLs devueltas corresponden a foros de correo electrónico sin relación con el proyecto.
