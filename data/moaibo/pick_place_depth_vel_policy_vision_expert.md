# MoAIBo/pick_place_depth_vel_policy_vision_expert

## Resumen

El modelo `MoAIBo/pick_place_depth_vel_policy_vision_expert` es una política de visión-lenguaje-acción (VLA) de tamaño compacto, fine-tuneada a partir del modelo base `lerobot/smolvla_base` para tareas de manipulación robótica pick-and-place en un robot móvil SO-101 TB4. Desarrollado por el usuario MoAIBo y publicado en HuggingFace bajo licencia Apache 2.0, el modelo resuelve la tarea específica de desacoplar, recoger un objeto azul o amarillo de una caja marrón, colocarlo en un plato blanco y regresar al dock, utilizando un conjunto de cámaras RGB y una cámara de profundidad.

La relevancia de este modelo radica en que demuestra la aplicación práctica de SmolVLA, una arquitectura diseñada para ser eficiente y desplegable en hardware de consumo, en un escenario de manipulación robótica real con observaciones visuales multi-cámara y control de velocidad. Con 450 millones de parámetros y una ventana de contexto de 360x640 píxeles por imagen, el modelo ofrece una solución de imitación robótica reproducible mediante el ecosistema LeRobot, con entrenamiento supervisado sobre 68 episodios (90.743 fotogramas a 30 FPS).

La relevancia actual del modelo reside en su contribución al campo de la robótica de imitación: permite evaluar el rendimiento de políticas VLA compactas en tareas de manipulación con robots de bajo coste, y su licencia Apache 2.0 facilita su uso comercial y académico. Además, al estar integrado en LeRobot, es directamente reproducible y extensible para otras tareas similares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer multimodal) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (las entradas visuales son imágenes de 360x640; el contexto textual no se especifica) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (las tareas están en inglés, pero el modelo es multimodal y no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolVLA, descrita en el paper arXiv 2506.01844. SmolVLA es un modelo compacto de visión-lenguaje-acción que combina un codificador visual con un transformador de lenguaje y un cabezal de acción, diseñado para ser eficiente y desplegable en hardware de consumo. El modelo procesa cinco entradas visuales: cuatro cámaras RGB (`camera_left`, `camera_right`, `camera_wrist`, `camera_d455`) y una cámara de profundidad (`depth`), cada una con resolución de 3x360x640, junto con un estado del robot de 8 dimensiones (`observation.state`). La salida es un vector de acción de 8 dimensiones (`action`), que incluye control de velocidad.

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/smolvla_base` con el dataset `MoAIBo/so101_tb4_pick_place_depth_vel`, que contiene 68 episodios y 90.743 fotogramas a 30 FPS, con dos tareas de pick-and-place. Se utilizó el optimizador AdamW con una tasa de aprendizaje de 0.0001, un tamaño de lote de 13, y se entrenó durante 50.000 pasos con una semilla fija de 1000. El proceso se llevó a cabo con la librería LeRobot versión 0.6.0, que sigue un pipeline de aprendizaje por imitación supervisada (behavior cloning) sin pasos de RLHF ni DPO.

## Capacidades

- Generación de acciones robóticas: el modelo predice vectores de acción de 8 dimensiones para controlar un robot SO-101 TB4 en tareas de manipulación, incluyendo movimiento de base, brazo y pinza.
- Percepción multimodal: procesa simultáneamente cuatro cámaras RGB y una cámara de profundidad, lo que permite localizar y manipular objetos con información espacial y de profundidad.
- Aprendizaje por imitación: implementa una política de clonación de comportamiento entrenada con demostraciones humanas, capaz de reproducir secuencias de manipulación complejas.
- Soporte de tareas específicas: entrenado para dos tareas concretas de pick-and-place con objetos de colores (azul y amarillo) en un escenario fijo.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- Capacidad de ejecución en tiempo real: al ser un modelo compacto, puede operar a 30 FPS en hardware de consumo, según la configuración de entrenamiento.
- No incluye soporte de tool calling ni razonamiento agéntico, al ser un modelo de acción robótica puro.

## Casos de uso

- **Manipulación robótica en entornos de investigación**: el modelo puede utilizarse en laboratorios de robótica para replicar tareas de pick-and-place en plataformas móviles SO-101 TB4, sirviendo como baseline para estudios de aprendizaje por imitación.
- **Despliegue de VLA en robots de consumo**: gracias a su tamaño compacto y licencia Apache 2.0, es adecuado para prototipos de robots domésticos o educativos que requieran manipulación de objetos con cámaras RGB-D.
- **Entrenamiento de políticas por imitación**: el modelo sirve como punto de partida para fine-tuning en nuevas tareas de manipulación, usando la guía de LeRobot para adaptar el modelo a otros datasets.
- **Evaluación de arquitecturas VLA eficientes**: los investigadores pueden comparar su rendimiento con otros modelos VLA de tamaño similar para estudiar la relación entre eficiencia y capacidad en robótica.
- **Integración en pipelines de automatización industrial**: en entornos de fabricación con robots móviles, el modelo puede controlar tareas de recogida y colocación de piezas en líneas de montaje, siempre que se adapten las cámaras y el robot.
- **Experimentos de visión y control**: sirve como ejemplo de cómo combinar múltiples fuentes visuales (RGB y profundidad) para decisiones de acción en tiempo real, útil para cursos de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta tasas de éxito en pruebas de robot real ni comparaciones cuantitativas con otros modelos. El autor indica que no se han proporcionado resultados de evaluación aún.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible, pero al ser un modelo de 450 millones de parámetros y entradas de imágenes de 360x640, se estima que necesita al menos 4-6 GB de VRAM en cuantización FP16, aunque no se especifica cuantización.
- **GPU recomendadas**: para inferencia en tiempo real (30 FPS), se recomienda una GPU de consumo como NVIDIA RTX 3060 o superior; para entrenamiento, se requiere una GPU con al menos 12-16 GB de VRAM (por ejemplo, RTX 4070 o A4000).
- **Compatibilidad con GPU consumer**: sí, el modelo está diseñado para ejecutarse en hardware de consumo, según el paper de SmolVLA.
- **Opciones de despliegue**: el modelo se integra con LeRobot, que soporta inferencia mediante el comando `lerobot-rollout`. También puede desplegarse con frameworks como vLLM o llama.cpp si se convierte a otros formatos, aunque no está documentado.
- **Latencia y throughput**: no disponible; la inferencia en tiempo real a 30 FPS es plausible según la configuración de entrenamiento, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoAIBo/pick_place_depth_vel_policy_vision_expert | 450M | no disponible | 4 cámaras RGB + profundidad | Apache 2.0 | HuggingFace |
| SmolVLA base (lerobot/smolvla_base) | 450M | no disponible | multimodal | Apache 2.0 | HuggingFace |
| RT-2 (VLA de Google) | 55B | no disponible | 1 cámara | no libre | no disponible |
| OpenVLA | 7B | no disponible | 1 cámara | MIT | HuggingFace |

El modelo se compara con otros VLA como OpenVLA (7B parámetros) o RT-2 (55B), pero es significativamente más compacto (450M), lo que permite despliegue en hardware de consumo. Sin embargo, no se dispone de resultados de benchmarks para comparar su rendimiento con estas alternativas. La principal diferencia es su diseño para eficiencia y su integración con el ecosistema LeRobot.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han documentado sesgos específicos, pero al ser entrenado con un dataset de 68 episodios, el modelo puede estar sesgado hacia el escenario y los objetos particulares de la tarea (objetos azules y amarillos en una caja marrón).
- **Riesgo de alucinación**: en tareas de robótica, el riesgo de alucinación se manifiesta en acciones incorrectas o no deseadas; el modelo puede fallar en condiciones de iluminación o posiciones de objetos no vistas en el entrenamiento.
- **Limitaciones de contexto**: el modelo está entrenado para dos tareas específicas y no generaliza a otras tareas de manipulación sin fine-tuning. Las entradas de imágenes tienen una resolución fija de 360x640.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, se debe verificar que el robot y los componentes de hardware no tengan restricciones adicionales; la licencia permite uso comercial.
- **Caveat para producción**: no se han publicado resultados de evaluación en robot real, por lo que el rendimiento en entornos no controlados es incierto. Es necesario realizar pruebas de robustez antes de desplegarlo en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/MoAIBo/pick_place_depth_vel_policy_vision_expert)
- [Dataset de entrenamiento](https://huggingface.co/datasets/MoAIBo/so101_tb4_pick_place_depth_vel)
- [Paper de SmolVLA](https://huggingface.co/papers/2506.01844)
- [Modelo base](https://huggingface.co/lerobot/smolvla_base)
- [Guía de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=MoAIBo/so101_tb4_pick_place_depth_vel)
