# Kaz55/diffusion-newcable-v5v6-rs500-ac60

## Resumen

El modelo `Kaz55/diffusion-newcable-v5v6-rs500-ac60` es una política de control visuomotor basada en Diffusion Policy, entrenada con el framework LeRobot de Hugging Face. Está diseñada para la manipulación robótica de precisión, concretamente para la tarea de inserción de cables con un robot UR5e equipado con una pinza DG-5F. El modelo genera trayectorias de acción suaves y multi-paso a partir de observaciones de estado y de cuatro cámaras (dos Realsense y dos Gelsight), lo que lo hace adecuado para tareas de contacto rico donde la fuerza y la precisión son críticas.

Desarrollado por el usuario Kaz55, este modelo se publica bajo licencia Apache 2.0 y se distribuye en formato safetensors. Con 308,8 millones de parámetros, es una política relativamente compacta que puede ejecutarse en hardware de consumo. Su relevancia radica en que demuestra la aplicación práctica de Diffusion Policy en un escenario real de manipulación industrial, y su integración con LeRobot facilita la reproducción y el despliegue en otros robots compatibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (visuomotor, generativa) |
| Parametros totales | 308.812.570 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de control) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, un enfoque que trata el control visuomotor como un proceso generativo de difusión. En lugar de predecir una única acción, el modelo genera una secuencia completa de acciones (trayectoria) mediante un proceso de denoising iterativo, lo que produce movimientos suaves y coherentes, especialmente beneficiosos en tareas de manipulación con contacto físico. La arquitectura interna (tipo de red, número de capas, etc.) no se detalla en la información disponible, pero se basa en el paper arxiv 2303.04137.

El entrenamiento se realizó con el dataset `Kaz55/dg5f_ur5e_newcable_v5v6_rs500`, que contiene 180 episodios y 208.933 fotogramas a 30 FPS, capturados con las cuatro cámaras mencionadas. La configuración de entrenamiento incluye 400.000 pasos, batch size de 8, optimizador Adam con learning rate 0,0001 y semilla 1000, utilizando LeRobot versión 0.6.0. No se especifica si se aplicaron técnicas como RLHF o DPO, ya que es un modelo de imitación supervisada.

## Capacidades

- Generación de trayectorias de acción multi-paso para control robótico, con suavidad y coherencia temporal.
- Procesamiento multimodal de entrada: estado del robot (vector de 26 dimensiones) y cuatro flujos de imagen (dos cámaras RGB Realsense y dos cámaras táctiles Gelsight), cada una con resolución 375x500.
- Control de robot UR5e con pinza DG-5F, incluyendo tareas de inserción de cables que requieren precisión submilimétrica y manejo de fuerzas de contacto.
- Integración nativa con LeRobot: permite ejecutar el modelo mediante `lerobot-rollout` y reentrenarlo con `lerobot-train`.
- No soporta generación de texto, tool calling, agentes conversacionales ni capacidades lingüísticas, al ser un modelo puramente de control motor.

## Casos de uso

- Inserción de conectores y cables en entornos industriales: el modelo puede controlar un UR5e para insertar cables en zócalos, aprovechando la generación de trayectorias suaves que evitan daños por fuerza excesiva.
- Automatización de ensamblaje de precisión: en líneas de producción donde se requiere manipular piezas delicadas, la política puede ejecutar secuencias de inserción repetitivas con alta consistencia.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar Diffusion Policy en tareas de contacto rico, permitiendo comparar con otros métodos de control.
- Desarrollo de robots colaborativos: puede integrarse en celdas de trabajo donde un robot UR5e colabora con humanos, realizando tareas de cableado que requieren destreza.
- Benchmarking de hardware robótico: al ser un modelo compacto (308M parámetros), es útil para evaluar el rendimiento de GPUs de consumo en inferencia de políticas visuomotoras.
- Formación y demostración en robótica: el modelo puede utilizarse en entornos educativos para enseñar conceptos de aprendizaje por refuerzo y control generativo, gracias a su integración con LeRobot y su documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se proporcionan métricas como tasa de éxito, precisión de inserción ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales. Dado el tamaño de 308M parámetros y la entrada de cuatro imágenes de 375x500, se estima que la inferencia puede requerir entre 4 y 8 GB de VRAM en precisión FP32, y menos con cuantización (aunque no se ofrecen versiones cuantizadas).
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 3070) debería ser suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda una GPU con 12-24 GB (RTX 3090, A5000, etc.).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de gama media-alta.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que soporta inferencia con `lerobot-rollout`. También puede integrarse con frameworks de inferencia como vLLM o TGI, aunque no es lo habitual para políticas robóticas. La opción principal es el pipeline de LeRobot.
- Latencia y throughput: no se proporcionan datos. Al ser un modelo de difusión, la inferencia requiere múltiples pasos de denoising, lo que puede aumentar la latencia respecto a modelos de una sola pasada. Se recomienda probar en el hardware objetivo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de difusión para robótica con UR5e). Existen otros modelos de Diffusion Policy en el Hub de Hugging Face, pero no se han encontrado datos específicos para comparar parámetros, rendimiento o licencias. Se indica "no disponible" por falta de datos contrastados.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con el dataset `dg5f_ur5e_newcable_v5v6_rs500`, que contiene 180 episodios de una tarea específica. Su generalización a otras tareas, robots o configuraciones de cámara no está garantizada.
- No se han publicado resultados de evaluación en robot real, por lo que su rendimiento en producción es incierto. Se recomienda validar exhaustivamente antes de un despliegue comercial.
- La dependencia de cuatro cámaras (dos Realsense y dos Gelsight) implica que cualquier cambio en la configuración de sensores o iluminación puede degradar el rendimiento.
- Al ser un modelo de difusión, la inferencia es más lenta que los métodos de control directo, lo que puede limitar su uso en aplicaciones de alta frecuencia de control.
- La licencia Apache 2.0 permite uso comercial, pero el dataset asociado puede tener restricciones adicionales; se debe verificar la licencia del dataset antes de su uso.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado en un entorno controlado, puede presentar comportamientos erráticos ante situaciones fuera de distribución.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Kaz55/diffusion-newcable-v5v6-rs500-ac60)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Kaz55/dg5f_ur5e_newcable_v5v6_rs500)
- [Paper de Diffusion Policy (arxiv 2303.04137)](https://huggingface.co/papers/2303.04137)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
