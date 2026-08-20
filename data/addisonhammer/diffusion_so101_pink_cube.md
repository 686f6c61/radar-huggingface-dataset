# addisonhammer/diffusion_so101_pink_cube

## Resumen

El modelo `diffusion_so101_pink_cube` es una política de control visuomotor basada en Diffusion Policy, entrenada con el framework LeRobot para la tarea de recoger y manipular un cubo rosa con el brazo robótico SO-101. Desarrollado por Addison Hammer, este modelo forma parte de una línea de investigación en aprendizaje por imitación para robótica física, donde la política genera trayectorias de acción suaves y multi-paso mediante un proceso generativo de difusión, especialmente adecuado para manipulaciones que requieren contacto físico.

El modelo tiene 270,29 millones de parámetros y se distribuye en formato safetensors dentro del repositorio de Hugging Face, con un tamaño total de 2,2 GB. Su arquitectura se basa en el paper "Diffusion Policy" (arXiv:2303.04137), que trata el control visuomotor como un problema de generación de secuencias de acciones, superando las limitaciones de los métodos basados en regresión directa en tareas de contacto rico. La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su integración en proyectos de robótica industrial y académica.

La relevancia actual de este modelo radica en la creciente adopción de políticas de difusión en el campo de la robótica de manipulación, donde la suavidad y la robustez de las trayectorias generadas son críticas. Al estar disponible en el Hub con una integración completa con LeRobot, ofrece un punto de partida accesible para desarrolladores que quieran reproducir o extender experimentos de aprendizaje por imitación con el brazo SO-101.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (red de difusión para control visuomotor) |
| Parámetros totales | 270.292.846 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de control temporal) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una política de difusión para control visuomotor. Según el paper original, la arquitectura combina un codificador visual (para procesar imágenes de la cámara) con un proceso de difusión denoising que genera secuencias de acciones futuras. En concreto, el modelo toma observaciones (imágenes) y genera una trayectoria de acciones (por ejemplo, velocidades articulares) a través de múltiples pasos de denoising. La red está entrenada para predecir el ruido en cada paso, y en la inferencia se muestrea una trayectoria a partir de ruido gaussiano mediante un scheduler de difusión.

El entrenamiento se realizó con el framework LeRobot, utilizando el dataset `addisonhammer/so101_pick_pink_cube`. No se especifican el número de tokens ni la composición exacta del dataset, pero se infiere que se trata de demostraciones de teleoperación del brazo SO-101 recogiendo un cubo rosa. No hay información sobre el uso de RLHF o DPO; se trata de un aprendizaje por imitación supervisado. La innovación principal es la aplicación de la difusión al espacio de acciones, que permite generar trayectorias más suaves y robustas que las regresiones directas, especialmente en tareas de contacto.

## Capacidades

- Generación de trayectorias de acción suaves y multi-paso para control de un brazo robótico de 6 grados de libertad (SO-101).
- Manipulación de objetos mediante contacto físico, como agarrar un cubo de color rosa.
- Procesamiento de imágenes de cámara (entrada visual) para la toma de decisiones.
- Control en tiempo real (en condiciones de inferencia con GPU adecuada).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No incluye capacidades de lenguaje, tool calling ni agentes multi-step en el sentido de razonamiento de lenguaje; su razonamiento se limita al dominio de control motor.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede ser integrado en un brazo robótico para seleccionar y mover piezas específicas (por ejemplo, cubos de color) con precisión. Gracias a la generación de trayectorias suaves, reduce el riesgo de daño a los objetos.
- Investigación en aprendizaje por imitación: permite reproducir experimentos de políticas de difusión sobre el hardware SO-101, sirviendo como base para comparar con otras arquitecturas (ACT, etc.) en entornos académicos.
- Prototipado rápido de controladores robóticos: al estar disponible en el Hub, se puede descargar y evaluar en un entorno simulado o real con el kit SO-100, reduciendo el tiempo de desarrollo de un controlador desde cero.
- Entrenamiento de políticas para entornos de colaboración humano-robot: al generar acciones suaves, es adecuado para escenarios donde el robot interactúa con humanos y se requieren movimientos no bruscos.
- Estudio de la influencia de la difusión en la robustez ante perturbaciones: se puede analizar cómo la política se comporta con cambios de iluminación o posiciones del objeto, útil para investigaciones en robustez.
- Educación y formación en robótica con LeRobot: el modelo sirve como ejemplo didáctico para enseñar el flujo completo de recogida de datos, entrenamiento y despliegue de políticas de difusión en un brazo de bajo costo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de rendimiento cuantitativo (como éxito de tarea, precisión de agarre o velocidad de ejecución) en la model card ni en los resultados de la búsqueda web.

## Requisitos de hardware

- El tamaño del repositorio es de 2,2 GB en safetensors, lo que indica que los pesos pueden cargarse en una GPU con al menos 4-6 GB de VRAM si se usan precisión fp16 o int8, aunque no se ha confirmado la precisión de los pesos.
- Para inferencia en tiempo real, se recomienda una GPU NVIDIA con al menos 8 GB de VRAM, como una RTX 3070, RTX 4060 o superior. En configuraciones de gama alta, una RTX 4090 ofrecería mayor margen de latencia.
- El modelo no es excesivamente grande y puede ejecutarse en una GPU de consumidor, pero no se ha probado en hardware específico según la información proporcionada.
- Opciones de despliegue: el modelo está integrado con LeRobot, por lo que se puede ejecutar mediante el script de evaluación de LeRobot (`lerobot.record`). También puede ser convertido a otros formatos como ONNX o TensorRT si se desea optimización, aunque no se proporcionan instrucciones.
- La latencia estimada dependerá del hardware; no se dispone de datos concretos de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `addisonhammer/diffusion_so101_pink_cube` | 270M | no disponible | Pick and place de un cubo rosa | Apache 2.0 | Hub |
| `ACT` (Action Chunking Transformer) | no disponible | no disponible | Control de manipulación (basado en transformer) | no disponible | LeRobot |
| `Diffusion Policy` (original paper) | no disponible | no disponible | Control general de manipulación | no disponible | paper |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparación se limita a la arquitectura y al enfoque: el modelo de este repositorio utiliza difusión, mientras que ACT usa transformer con chunking. No hay información sobre otros modelos con el mismo dataset o tarea.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para una tarea concreta (agarrar un cubo rosa) y con un robot específico (SO-101). No generaliza a otras tareas o robots sin reentrenamiento.
- No se han publicado datos sobre sesgos o alucinación; al ser un modelo de control, el riesgo de alucinación es bajo, pero puede generar trayectorias no seguras si se usa fuera de su dominio de entrenamiento.
- No se dispone de información sobre la composición del dataset de entrenamiento, por lo que no se puede evaluar su representatividad en términos de variaciones de iluminación, posiciones de la cámara, etc.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos del dataset (si el dataset contiene datos propietarios o de terceros) antes de su uso en producción.
- El modelo no incluye mecanismos de seguridad o de verificación de ejecución; se requiere un sistema de control externo para garantizar la seguridad en aplicaciones reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/addisonhammer/diffusion_so101_pink_cube)
- [Dataset de entrenamiento](https://huggingface.co/datasets/addisonhammer/so101_pick_pink_cube)
- [Paper de Diffusion Policy](https://huggingface.co/papers/2303.04137)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio GitHub de LeRobot](https://github.com/huggingface/lerobot)
- [Repositorio de ejemplo SO-101 con LeRobot](https://github.com/xxwd231/lerobot-so101-cube) (encontrado en la búsqueda web)
