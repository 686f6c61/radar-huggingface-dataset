# Revolabs/cortex_agv_iwu_scout_1_01092026_cpu

## Resumen

El modelo `Revolabs/cortex_agv_iwu_scout_1_01092026_cpu` es una política de control robótico entrenada con la librería LeRobot de Hugging Face. Está diseñada específicamente para la tarea de conducción de un vehículo guiado automatizado (AGV) del tipo `revobots_agv_follower`, utilizando una cámara frontal y el estado del robot como entradas. El modelo fue desarrollado por Revolabs y publicado bajo licencia Apache 2.0, lo que permite su uso y modificación sin restricciones comerciales.

Con aproximadamente 51,6 millones de parámetros, se trata de un modelo compacto que puede ejecutarse en CPU, como sugiere el sufijo `_cpu` en su identificador. La política fue entrenada mediante aprendizaje por imitación sobre un conjunto de datos de 33 episodios y más de 57.000 fotogramas, capturados a 15 FPS. Su relevancia radica en ser un ejemplo práctico de aplicación de técnicas de imitación a la robótica móvil industrial, aunque carece de resultados de evaluación publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política `cortex_agv` de LeRobot) |
| Parametros totales | 51.596.090 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no está documentada en la información proporcionada. Se trata de una política de tipo `cortex_agv` implementada dentro del ecosistema LeRobot, que típicamente emplea redes neuronales convolucionales o arquitecturas híbridas para procesar observaciones visuales y de estado. El modelo consume dos entradas: un vector de estado de 5 dimensiones y una imagen RGB de 480×640 píxeles, y produce una acción de 2 dimensiones (probablemente velocidad lineal y angular).

El entrenamiento se realizó con el optimizador AdamW, una tasa de aprendizaje de 1e-5, tamaño de lote de 8 y 100.000 pasos, sobre el dataset `Revolabs/iwu_scout_1_27082026_train`. Este dataset contiene 33 episodios y 57.466 fotogramas a 15 FPS, con la tarea única "Drive the AGV". No se menciona el uso de técnicas como RLHF o DPO, ya que es un caso de aprendizaje por imitación supervisado.

## Capacidades

- Control de un AGV (vehículo guiado automatizado) para la tarea de conducción autónoma.
- Procesamiento de imágenes de cámara frontal (480×640) junto con el estado del robot (5 valores).
- Generación de acciones de control de 2 dimensiones (posiblemente velocidad y dirección).
- Ejecución en tiempo real sobre hardware de bajo coste, incluida CPU.
- Integración con el ecosistema LeRobot para despliegue y entrenamiento.

## Casos de uso

- Navegación autónoma de AGV en almacenes: el modelo puede guiar un vehículo siguiendo rutas predefinidas o evitando obstáculos, basándose en la cámara frontal y el estado del robot.
- Automatización de transporte interno en plantas de fabricación: al ser entrenado con demostraciones humanas, puede replicar trayectorias de conducción en entornos industriales.
- Prototipado rápido de políticas de control: gracias a su pequeño tamaño y compatibilidad con CPU, es adecuado para pruebas en simuladores o robots de bajo coste.
- Investigación en aprendizaje por imitación: sirve como caso de estudio para comparar métodos de entrenamiento de políticas robóticas con LeRobot.
- Despliegue en robots educativos: su licencia abierta y bajo requisito de hardware lo hacen accesible para laboratorios universitarios.
- Integración en sistemas de logística: puede combinarse con planificadores de rutas para ejecutar movimientos precisos en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada: al tener 51,6 millones de parámetros, en FP32 ocupa aproximadamente 206 MB, y en FP16 unos 103 MB. Cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050 o superior. También puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, es compatible con tarjetas como RTX 3060, RTX 4090, etc.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que funcionan con CPU o CUDA. También puede integrarse en frameworks como ROS mediante adaptadores.
- Latencia y throughput: no se proporcionan datos, pero dado el tamaño del modelo y la entrada de imagen, se espera una inferencia en tiempo real (>30 FPS) en CPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de control para AGV con LeRobot). La búsqueda web no arrojó alternativas directas, por lo que esta sección queda como no disponible.

## Limitaciones y advertencias

- El modelo fue entrenado con un dataset pequeño (33 episodios), lo que puede provocar sobreajuste y falta de generalización a entornos o condiciones no vistas.
- No se han publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo es desconocido.
- Está diseñado específicamente para el robot `revobots_agv_follower` y la cámara frontal; no es transferible a otros robots sin reentrenamiento.
- La tarea es única ("Drive the AGV"), por lo que no cubre maniobras complejas como carga/descarga o interacción con objetos.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no incluye garantías de seguridad para operación en entornos con personas u obstáculos dinámicos.
- No se especifican sesgos, pero al ser un modelo de control, los riesgos de alucinación no aplican; en cambio, existe riesgo de comportamientos erráticos si las condiciones de iluminación o el entorno difieren del dataset de entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Revolabs/cortex_agv_iwu_scout_1_01092026_cpu)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Revolabs/iwu_scout_1_27082026_train)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
