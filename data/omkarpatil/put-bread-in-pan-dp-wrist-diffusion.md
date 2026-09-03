# omkarpatil/put-bread-in-pan-dp-wrist-diffusion

## Resumen

El modelo `omkarpatil/put-bread-in-pan-dp-wrist-diffusion` es una política de difusión (diffusion policy) entrenada con la librería LeRobot para la tarea de manipulación robótica «poner pan en una sartén» (put-bread-in-pan). Ha sido desarrollado por Omkar Patil, investigador en aprendizaje robótico, y está diseñado específicamente para el robot ROBOTIS FFW SG2 Rev1, utilizando únicamente las cámaras de muñeca izquierda y derecha (resolución nativa de 424x240). El modelo forma parte de un grupo de composición que comparte estadísticas de normalización agrupadas, lo que permite una composición coherente con otras tareas similares (poner pan en un contenedor o en una bandeja).

Se trata de un modelo de control visual-motor que genera acciones de articulación del robot a partir de observaciones visuales y del estado del sistema, mediante un proceso de denoising probabilístico. Con aproximadamente 274,5 millones de parámetros y un peso de 1,1 GB, es un modelo de tamaño moderado que puede ejecutarse en hardware de consumo con GPU. Su relevancia radica en que demuestra un enfoque práctico para el aprendizaje por imitación en robótica, con normalización de datos compartida entre tareas y una arquitectura de difusión que produce trayectorias suaves y robustas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo de difusión condicionado a observaciones) |
| Parametros totales | 274.492.048 (274,5 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de política visual, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,1 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de política de difusión, una técnica que modela la distribución de acciones condicionada a observaciones mediante un proceso de denoising iterativo (típicamente DDPM). En lugar de predecir directamente la acción, el modelo genera ruido gaussiano y lo refina en pasos sucesivos hasta obtener una trayectoria de acciones suave y coherente. Esta arquitectura es especialmente adecuada para tareas de manipulación con demostraciones multimodales, ya que puede capturar múltiples soluciones válidas.

El entrenamiento se realizó con los parámetros por defecto de LeRobot (versión 0.6.1, fork `lerobot-cyclo` de ROBOTIS): 100 000 pasos, tamaño de lote 8, optimizador Adam con tasa de aprendizaje 1e-4, betas (0,95; 0,999) y weight decay 1e-6. Se utilizó un scheduler de ruido DDPM y una frecuencia de datos de 15 fps. La pérdida final de entrenamiento fue de 0,003. Los datos provienen de demostraciones humanas de la tarea `put-bread-in-pan`, registradas con dos cámaras de muñeca. Un aspecto destacado es la normalización agrupada: las estadísticas de normalización se calcularon sobre 11 872 fotogramas combinados de tres tareas del grupo D (`put-bread-in-container`, `put-bread-in-tray`, `put-bread-in-pan`) y se escribieron idénticamente en cada dataset miembro, garantizando que los modelos de difusión de estas tareas compartan el mismo espacio de normalización y puedan componerse entre sí.

## Capacidades

- Ejecución de la tarea de manipulación «poner pan en una sartén» sobre el robot ROBOTIS FFW SG2 Rev1.
- Percepción visual mediante dos cámaras de muñeca (izquierda y derecha) a resolución nativa de 424x240.
- Generación de trayectorias de acciones articulares suaves mediante difusión condicionada a observaciones.
- Normalización compartida con otras dos tareas del grupo D, lo que permite la composición de modelos dentro del mismo grupo.
- Compatibilidad con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Automatización de tareas de preparación de alimentos en entornos de cocina robótica: el modelo puede ejecutar la colocación de pan en una sartén de forma autónoma, integrándose en un sistema de manipulación para líneas de producción o cocinas asistidas.
- Investigación en aprendizaje por imitación: sirve como banco de pruebas para estudiar políticas de difusión, composición de tareas y normalización de datos en robótica.
- Desarrollo de sistemas de manipulación con visión de muñeca: permite evaluar la viabilidad de usar únicamente cámaras de muñeca de baja resolución (424x240) en lugar de cámaras externas, reduciendo requisitos de calibración y oclusión.
- Composición de habilidades: al compartir estadísticas de normalización con otras dos tareas del grupo D, puede combinarse con modelos hermanos (put-bread-in-tray, put-bread-in-container) para construir secuencias de manipulación más complejas.
- Validación de pipelines de datos LeRobot v3.0: el modelo sirve como ejemplo de conversión de datasets v2.1 a v3.0 con restauración de estadísticas agrupadas, útil para la comunidad que trabaja con formatos de datos robóticos.
- Entrenamiento de políticas robustas con demostraciones humanas: puede utilizarse como referencia para comparar el rendimiento de la política de difusión frente a otras arquitecturas (p. ej., GR00T) en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como éxito en tarea, precisión de trayectoria o comparación con otras políticas) en la información disponible. El único dato de rendimiento reportado es la pérdida final de entrenamiento de 0,003, que indica un buen ajuste a los datos de entrenamiento, pero no es un indicador de generalización. No se dispone de resultados en entornos simulados ni en el robot físico fuera de los datos de demostración.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 274,5 millones de parámetros en precisión FP32, el modelo ocupa aproximadamente 1,1 GB en memoria, por lo que cabría en GPUs con al menos 4 GB de VRAM considerando overhead de activaciones y buffers de denoising.
- GPU recomendada: una GPU consumer como NVIDIA RTX 3060 (12 GB) o superior sería suficiente para ejecutar la inferencia en tiempo real. Para entrenamiento, se recomienda al menos 8-12 GB de VRAM.
- Compatibilidad con hardware de consumo: sí, el tamaño del modelo permite su ejecución en GPUs de gama media.
- Opciones de despliegue: LeRobot (Python) con soporte para ROS, o integración directa en entornos de robótica con PyTorch. No se mencionan adaptaciones a vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La inferencia de una política de difusión requiere múltiples pasos de denoising (típicamente 10-100), lo que añade latencia en comparación con políticas de una sola pasada, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de difusión para la tarea put-bread-in-pan). Sin embargo, el propio autor menciona la existencia de variantes con tres cámaras (incluyendo cámara de cabeza) y políticas GR00T para las mismas tareas, que comparten estadísticas de normalización pero no son directamente comparables en arquitectura. A continuación se presenta una comparación cualitativa con estas variantes conocidas:

| Modelo | Cámaras | Arquitectura | Normalización | Composición |
|---|---|---|---|---|
| put-bread-in-pan (wrist-only) | 2 muñecas | Diffusion Policy | Grupo D (min/max) | Con diffusion del grupo D |
| put-bread-in-pan (3 cámaras) | 2 muñecas + 1 cabeza | Diffusion Policy | Grupo D (min/max, re-encodificado) | Con diffusion del grupo D |
| put-bread-in-pan (GR00T) | no especificado | GR00T | Grupo D (percentiles q01/q99) | Con GR00T del grupo D |

La comparación muestra que la variante de solo muñeca evita el re-encodificado de resoluciones, mientras que la de tres cámaras requiere unificar las resoluciones. La arquitectura GR00T usa percentiles en lugar de min/max, lo que impide la composición cruzada entre arquitecturas.

## Limitaciones y advertencias

- Especialización estricta: el modelo está entrenado únicamente para la tarea «poner pan en una sartén» y para el robot ROBOTIS FFW SG2 Rev1. No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Dependencia de cámaras de muñeca: requiere ambas cámaras de muñeca operativas y con la resolución nativa de 424x240. Cambios en la posición, calibración o iluminación de las cámaras pueden degradar el rendimiento.
- Sesgo de los datos de demostración: al ser un modelo de imitación, hereda los sesgos y limitaciones de las demostraciones humanas utilizadas. Si las demostraciones no cubren variaciones suficientes de la tarea, la política puede fallar ante escenarios novedosos.
- Riesgo de alucinación: aunque no es un modelo de lenguaje, la política de difusión puede generar trayectorias incoherentes o inválidas si la distribución de ruido no se condiciona adecuadamente, especialmente fuera de la distribución de entrenamiento.
- Composición limitada: la normalización compartida solo es válida dentro del grupo D y solo entre modelos de la misma arquitectura (diffusion con diffusion, GR00T con GR00T). No se puede componer entre arquitecturas.
- Sin licencia de uso comercial explícita más allá de Apache 2.0: la licencia Apache 2.0 permite uso comercial, pero el modelo depende de datos de demostración que podrían tener restricciones adicionales no documentadas.
- Sin datos de robustez: no se han publicado pruebas de generalización a variaciones de iluminación, oclusiones o perturbaciones del entorno, por lo que se desaconseja su uso en producción sin una validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omkarpatil/put-bread-in-pan-dp-wrist-diffusion
- Perfil del autor en Hugging Face: https://huggingface.co/omkarpatil
- Perfil de GitHub del autor: https://github.com/omkarpatil18
- Repositorio de LeRobot (librería de entrenamiento): https://github.com/huggingface/lerobot
