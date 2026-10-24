# rsundaraws/act_arm2_wristonly

## Resumen

`rsundaraws/act_arm2_wristonly` es una política de imitación visomotora entrenada con el método ACT (Action Chunking with Transformers) sobre un brazo robótico de bajo coste SO-101 (`so_follower`), usando únicamente la cámara de muñeca como entrada visual. No es un modelo de lenguaje ni un modelo fundacional multimodal: es un controlador neuronal que, a partir del estado articular de 6 dimensiones y una imagen RGB de 480x640, predice directamente un vector de acción de 6 dimensiones. Lo publica el usuario `rsundaraws` en Hugging Face mediante la librería LeRobot de Hugging Face, con licencia Apache 2.0.

El modelo resuelve una tarea concreta y única: «Pick up the cube and place it in the orange box» (coger el cubo y dejarlo en la caja naranja). Se entrenó con 65 episodios de teleoperación (22.621 fotogramas a 30 FPS) capturados en una posición fija del brazo, durante 30.000 pasos de entrenamiento con AdamW y una tasa de aprendizaje de 1e-5. Su relevancia es práctica: sirve como referencia reproducible de un pipeline completo de aprendizaje por imitación en robótica de bajo coste, con un modelo de solo 51,7 millones de parámetros que cabe en cualquier GPU consumer.

Arquitectónicamente sigue el diseño ACT publicado en arXiv:2304.13705, basado en un transformer con autoencoder variacional condicional (CVAE) que predice *chunks* de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. El repositorio ocupa 0,2 GB y no incluye resultados de evaluación en robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers) con CVAE y codificador visual ResNet; predice chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no aplica en el sentido de contexto textual. La política consume una observación por paso (imagen 3x480x640 + estado de 6 dimensiones) y predice un chunk de acciones |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors; la model card no documenta variantes cuantizadas (el tamaño reducido hace innecesaria la cuantización en la mayoría de despliegues) |
| Idiomas soportados | No disponible / no aplica: es una política robótica visomotora, sin entrada ni salida de texto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un autoencoder variacional condicional. El codificador visual procesa la imagen de la cámara de muñeca y, junto con el estado articular (`observation.state`, 6 valores), alimenta un transformer que genera un chunk de acciones futuras (`action`, 6 valores por paso). Predecir varios pasos de forma conjunta, en lugar de uno solo, es la innovación central del método: reduce la acumulación de errores y evita el temblor típico de las políticas paso a paso. Durante el entrenamiento, la componente CVAE modela la variabilidad de las demostraciones humanas, de forma que la política no colapsa hacia la media de las trayectorias.

Los datos proceden íntegramente del dataset `rsundaraws/so101_arm2_fixedspot_wrist`: 65 episodios, 22.621 fotogramas a 30 FPS, una única tarea («Pick up the cube and place it in the orange box») y una sola cámara (`wrist`). La configuración de entrenamiento documentada es de 30.000 pasos, batch de 32, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.1. No se especifica el número total de tokens ni de muestras vistas, la composición exacta del dataset más allá de la tarea, ni si hubo etapas de RLHF o DPO (no aplicables en un pipeline de imitación supervisada como este). Tampoco se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control visomotor de un brazo SO-101: mapea directamente observación (estado de 6 dimensiones + imagen de muñeca) a acción de 6 dimensiones.
- Predicción de chunks de acciones, lo que produce trayectorias más suaves y reduce el error compuesto en comparación con políticas paso a paso.
- Ejecución de una tarea concreta de pick-and-place: coger un cubo y depositarlo en una caja naranja.
- Funcionamiento con una única cámara de muñeca (sin cámara cenital ni visión estereoscópica), lo que simplifica el hardware.
- Inferencia en bucle cerrado a la frecuencia del dataset (30 FPS), con realimentación visual continua.
- Soporte de ejecución y reentrenamiento mediante las herramientas de LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje, agentes conversacionales ni planificación simbólica.
- No tiene capacidades multilingües ni de generación de texto, código, matemáticas, visión general o audio.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: desplegar la política en un SO-101 en una posición fija para trasladar cubos a una caja, aprovechando que el modelo está entrenado exactamente para esa tarea y ese montaje. Adecuado porque elimina la necesidad de programar cinemática inversa o trayectorias manuales.
- **Punto de partida para fine-tuning en nuevas tareas**: reentrenar la política con un dataset propio mediante `lerobot-train --policy.type=act`, reutilizando la arquitectura y los hiperparámetros ya validados (30.000 pasos, batch 32, lr 1e-5) como línea base.
- **Docencia y formación en aprendizaje por imitación**: usar el repositorio como ejemplo completo y reproducible de un pipeline que va de la teleoperación al despliegue, con un modelo de 51,7 M de parámetros que se entrena y se ejecuta en hardware asequible.
- **Evaluación y depuración de infraestructura LeRobot**: validar la instalación, la calibración del brazo, la configuración de cámaras OpenCV y el comando `lerobot-rollout` antes de abordar proyectos mayores, ya que el modelo es pequeño y la tarea está acotada.
- **Generación de rollouts para ampliar el dataset**: ejecutar la política en el robot para recoger episodios adicionales (con correcciones humanas al estilo DAgger) y aumentar los 65 episodios originales, que es un volumen bajo para generalización.
- **Pruebas de repetibilidad y calibración de hardware**: al estar entrenada para una posición fija (`fixedspot`), la política sirve para medir repetibilidad del brazo, deriva de calibración y sensibilidad a pequeños cambios de montaje entre sesiones.
- **Prototipos de investigación con dos brazos**: el nombre del repositorio (`arm2`, `wristonly`) sugiere su uso como segundo brazo en un montaje bimanual; se puede combinar con otra política para tareas cooperativas simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con la nota explícita «_No evaluation results have been provided for this policy yet_», sin tabla de ensayos, éxitos ni tasas de acierto en robot real. Tampoco se aportan métricas de pérdida de entrenamiento, error de acción (MSE) ni comparaciones con otras políticas.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 207 MB para los pesos en FP32 (51,67 M de parámetros) y unos 103 MB en FP16/BF16; con activaciones y el codificador visual, el consumo total en inferencia por lote de tamaño 1 se mantiene por debajo de 1 GB en la mayoría de configuraciones.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3050, RTX 4060, RTX 3090, RTX 4090, A100, H100). El modelo no requiere GPU de centro de datos; una GTX 1650 o incluso CPU moderna pueden ejecutar la inferencia, aunque no se han publicado mediciones de latencia en CPU.
- **¿Cabe en GPU consumer?**: sí, en cualquier GPU consumer de los últimos años, y con margen amplio para el resto del pipeline de percepción y control.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` con `--policy.path=rsundaraws/act_arm2_wristonly`, estrategia `base`), y entrenamiento con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica de este tipo.
- **Latencia y throughput**: no disponibles. Como referencia de diseño, el dataset se capturó a 30 FPS y el bucle de control debe sostener esa frecuencia (33 ms por ciclo) o apoyarse en la predicción por chunks para relajar el requisito de inferencia por paso. No se han publicado cifras medidas.
- **Hardware robótico**: brazo `so_follower` (SO-101) con una cámara `wrist` configurada a 640x480 y 30 FPS; el estado de entrada es de 6 dimensiones y la acción de salida también.

## Comparativa con modelos similares

No se dispone en la información proporcionada de los datos técnicos de los modelos alternativos (recuento de parámetros, contexto, licencia o resultados) necesarios para una comparación cuantitativa fiable, por lo que se marcan como «no disponible».

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `rsundaraws/act_arm2_wristonly` (este) | 51.668.614 | Imagen 3x480x640 + estado (6,); sin contexto textual | Apache 2.0 | Hugging Face, vía LeRobot | Entrenado para una única tarea de pick-and-place en SO-101 con cámara de muñeca |
| Otras políticas ACT en LeRobot (p. ej. entrenadas con `policy.type=act`) | No disponible | Igual que ACT | No disponible | Hugging Face / LeRobot | Misma arquitectura; el rendimiento depende del dataset y del montaje |
| Diffusion Policy (disponible en LeRobot) | No disponible | Observaciones visuales y de estado | No disponible | LeRobot | Alternativa generativa basada en difusión; no se aportan métricas comparativas |
| Políticas VLA tipo SmolVLA | No disponible | Imagen + instrucción en lenguaje natural | No disponible | LeRobot | Añaden condicionamiento por lenguaje; no comparables directamente en parámetros ni en tarea |

## Limitaciones y advertencias

- **Alcance de una sola tarea**: la política solo ha visto «Pick up the cube and place it in the orange box»; no generaliza a otros objetos, contenedores ni instrucciones.
- **Dataset muy reducido**: 65 episodios y 22.621 fotogramas son un volumen bajo, con riesgo alto de sobreajuste al montaje, a la iluminación y a la posición exacta del cubo.
- **Dependencia de una posición fija**: el nombre del dataset (`fixedspot`) indica que el brazo se mantuvo en una posición concreta durante la captura; cambios en la base o en la altura de la mesa pueden degradar el comportamiento.
- **Visión limitada a la muñeca**: al usar solo la cámara de muñeca no hay contexto global de la escena, lo que dificulta la recuperación cuando el objeto sale del campo de visión.
- **Sin resultados de evaluación**: no hay evidencia publicada de tasa de éxito en robot real, ni en condiciones nominales ni con perturbaciones.
- **Sesgos**: no se documentan sesgos sociales (no procesa lenguaje ni datos personales), pero sí un sesgo físico hacia las condiciones de demostración (posiciones, texturas, colores y velocidad del operador humano).
- **Riesgo de fallo silencioso**: en políticas de imitación el fallo se manifiesta como una acción incorrecta sin señal de error; es imprescindible definir paradas de seguridad, límites de par y supervisión humana.
- **Riesgo de «alucinación»**: no aplica en el sentido textual; el equivalente es la generación de trayectorias plausibles pero incorrectas cuando la observación se sale de la distribución de entrenamiento.
- **Idioma**: la política no procesa ni genera texto; la etiqueta de idiomas figura como no disponible y no tiene implicaciones prácticas.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución y citar el paper de ACT y LeRobot.
- **Caveat de producción**: antes de usar en un entorno real, validar repetibilidad, calibración de las cámaras y comportamiento ante objetos no vistos, y registrar episodios de fallo para reentrenar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsundaraws/act_arm2_wristonly
- Dataset de entrenamiento: https://huggingface.co/datasets/rsundaraws/so101_arm2_fixedspot_wrist
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rsundaraws/so101_arm2_fixedspot_wrist
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y del ecosistema de LeRobot.
