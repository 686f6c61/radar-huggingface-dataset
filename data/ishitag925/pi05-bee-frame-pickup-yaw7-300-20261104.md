# ishitag925/pi05-bee-frame-pickup-yaw7-300-20261104

## Resumen

Pi0.5 bee-frame pickup es un checkpoint de política robótica (vision-language-action, VLA) obtenido mediante ajuste fino del modelo Pi0.5 de Physical Intelligence sobre el conjunto de datos `ishitag925/bee-frame-pickup-yaw7-300-center-right-wrist-lerobot`. Lo publica el usuario ishitag925 en HuggingFace bajo la librería `openpi`, la implementación oficial de OpenPI de Physical Intelligence, y está orientado a una tarea muy concreta: la recogida de un marco de abeja (bee-frame) con un brazo robótico Piper-X, con una configuración de cámara y orientación (yaw7, 300 episodios) específica.

No se trata de un modelo de lenguaje general, sino de un artefacto de investigación en robótica: un conjunto de pesos de política entrenados para mapear observaciones visuales y de estado del robot a acciones de control. El repositorio incluye checkpoints publicados cada 5.000 actualizaciones del optimizador bajo `checkpoints/STEP/`, con etiquetas `step-STEP` coincidentes, y cada checkpoint contiene los parámetros completos de la política y los activos de normalización.

La relevancia es acotada y experimental: el autor advierte explícitamente de que no existe un conjunto de evaluación reservado (held-out) y de que la pérdida de entrenamiento no establece el éxito de la política. Por tanto, debe tratarse como un checkpoint de trabajo reproducible, no como un modelo validado para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política VLA Pi0.5, ajuste fino con OpenPI) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoints de política con parámetros y activos de normalización) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Pi0.5 de Physical Intelligence, una política vision-language-action que combina un modelo de visión-lenguaje con un cabezal de acciones para control robótico. La receta exacta de entrenamiento se documenta en los ficheros `run_config.json` y `project_config.py` del repositorio, que el autor señala como referencia para reproducir el ajuste. No se dispone en la información proporcionada de detalles sobre el número de tokens, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

El entrenamiento se realizó sobre el dataset `ishitag925/bee-frame-pickup-yaw7-300-center-right-wrist-lerobot`, que por su nombre sugiere 300 episodios de demostración con vistas de cámara central, derecha y de muñeca, en formato LeRobot. Los checkpoints se publican cada 5.000 actualizaciones del optimizador, con parámetros completos y activos de normalización; el estado del optimizador no se publica (permanece en MIT para reanudar). No hay partición de evaluación reservada.

## Capacidades

- Control robótico de tipo vision-language-action para la tarea de recogida de un marco de abeja (bee-frame) con un brazo Piper-X.
- Procesamiento de observaciones visuales multicámara (vistas central, derecha y de muñeca) junto con el estado del robot.
- Generación de acciones de control continuas para manipulación.
- Ajuste fino reproducible mediante la implementación oficial OpenPI.
- Publicación periódica de checkpoints intermedios cada 5.000 pasos para evaluar distintas etapas del entrenamiento.
- No se dispone de información sobre tool calling, agentes, capacidades multilingües, modo de razonamiento, visión general o audio.

## Casos de uso

- Investigación en manipulación robótica: servir como punto de partida reproducible para estudiar el ajuste fino de Pi0.5 sobre una tarea de picking concreta, usando `run_config.json` y `project_config.py` como receta.
- Evaluación de checkpoints intermedios: comparar el comportamiento de la política en los distintos pasos publicados (cada 5.000 actualizaciones) para analizar la evolución del entrenamiento.
- Replicación de experimentos: reproducir el pipeline de OpenPI con el dataset LeRobot asociado para validar resultados en un brazo Piper-X.
- Desarrollo de pipelines de adquisición de datos: usar el dataset y la configuración de cámaras (central, derecha, muñeca) como referencia para nuevas grabaciones de demostración.
- Pruebas de integración con el stack OpenPI: validar la carga de checkpoints, los activos de normalización y la inferencia de políticas en un entorno controlado.
- Base para ajustes posteriores: reanudar el entrenamiento desde un checkpoint (el estado del optimizador debe recuperarse por separado) para adaptar la política a variantes de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no existe una partición de evaluación reservada y que la pérdida de entrenamiento no establece el éxito de la política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería indicada es `openpi` (implementación oficial de Physical Intelligence); no se detallan otros motores de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones que permitan una comparación fiable con otras políticas VLA o checkpoints de la familia Pi0.5.

## Limitaciones y advertencias

- No existe un conjunto de evaluación reservado (held-out); la pérdida de entrenamiento no demuestra el éxito de la política en la tarea real.
- El modelo está especializado en una tarea y configuración concretas (recogida de bee-frame, yaw7, 300 episodios, cámaras central/derecha/muñeca); no se espera generalización fuera de ese dominio.
- La licencia no está disponible, por lo que el uso comercial queda sin regularizar explícitamente.
- El estado del optimizador no se publica (permanece en MIT), lo que limita la reanudación exacta del entrenamiento desde el repositorio.
- Riesgo de sobreajuste al dataset de demostración y a las condiciones de captura específicas.
- No se dispone de información sobre sesgos, idiomas ni alucinación, al no ser un modelo de lenguaje general.
- Para producción sería necesario validar la política en el robot real con métricas de éxito de tarea, algo que el autor no proporciona.

## Enlaces

- [HuggingFace: ishitag925/pi05-bee-frame-pickup-yaw7-300-20261104](https://huggingface.co/ishitag925/pi05-bee-frame-pickup-yaw7-300-20261104)
- Dataset asociado: `ishitag925/bee-frame-pickup-yaw7-300-center-right-wrist-lerobot` (referenciado en la model card; no se proporciona URL directa)
- OpenPI (implementación oficial de Physical Intelligence): no se proporciona URL en la información disponible.
