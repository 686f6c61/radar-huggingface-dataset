# omkarpatil/push-tape-right-dp-wrist-diffusion

## Resumen

El modelo `omkarpatil/push-tape-right-dp-wrist-diffusion` es una política de difusión (Diffusion Policy) entrenada con LeRobot para el robot manipulador ROBOTIS FFW SG2 Rev1. Desarrollado por Omkar Patil, investigador de robótica en la Universidad Estatal de Arizona, este modelo resuelve la tarea de empujar una cinta (push-tape-right) utilizando únicamente las dos cámaras de muñeca del robot, a resolución nativa de 424x240 píxeles. Es relevante porque demuestra el entrenamiento de políticas de manipulación con normalización de estadísticas agrupadas entre tareas similares, un enfoque que mejora la generalización en entornos robóticos.

La arquitectura es una Diffusion Policy con scheduler DDPM, que genera acciones de control mediante un proceso iterativo de denoising condicionado a las observaciones visuales. El modelo cuenta con aproximadamente 278,8 millones de parámetros y se distribuye bajo licencia Apache 2.0 en formato safetensors. Está diseñado específicamente para el hardware FFW SG2 Rev1 y no es un modelo de lenguaje ni de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) |
| Parametros totales | 278.792.848 (según safetensors; la model card indica 278.773.200) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La Diffusion Policy es un modelo generativo que modela la distribución de acciones de control condicionada a observaciones. En este caso, las observaciones son dos imágenes de cámaras de muñeca (izquierda y derecha) a 424x240 píxeles. El proceso de entrenamiento utiliza un scheduler DDPM (Denoising Diffusion Probabilistic Models) que aprende a revertir un proceso de ruido gaussiano para generar secuencias de acciones. El modelo fue entrenado durante 100.000 pasos con un batch size de 8, optimizador Adam con learning rate 1e-4, betas (0.95, 0.999) y weight decay 1e-6. La tasa de datos fue de 15 fps y la pérdida final de entrenamiento alcanzó 0.003.

Una característica destacable es el uso de estadísticas de normalización agrupadas (shared-norm) sobre el "Composition group A", que incluye las tareas `push-tape-left` y `push-tape-right`. Las estadísticas se calcularon sobre 5.768 fotogramas de ambos miembros del grupo y se escribieron idénticamente en cada dataset. Esto permite que las políticas entrenadas sobre estas tareas compartan la misma normalización, facilitando la composición entre ellas. El dataset se convirtió al formato LeRobot v3.0 desde v2.1, restaurando las estadísticas agrupadas tras la conversión.

## Capacidades

- Control de robot manipulador: genera acciones de control para el brazo ROBOTIS FFW SG2 Rev1 a partir de observaciones visuales de muñeca.
- Manipulación por empuje: especializado en la tarea de empujar una cinta (push-tape-right) con precisión.
- Percepción visual con dos cámaras: procesa simultáneamente las imágenes de las cámaras izquierda y derecha de la muñeca.
- Generación de acciones con difusión: produce secuencias de acciones suaves y coherentes mediante denoising iterativo.
- Composición con tareas similares: al compartir estadísticas de normalización con `push-tape-left`, puede combinarse con otras políticas del mismo grupo.
- No soporta tool calling, generación de texto, razonamiento simbólico ni capacidades multilingües, al ser un modelo puramente robótico.

## Casos de uso

- Automatización de tareas de empuje en líneas de montaje: el modelo puede controlar un brazo robótico para empujar componentes (como cintas) a posiciones específicas, aprovechando su entrenamiento específico en la tarea push-tape-right.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar el efecto de la normalización agrupada en políticas de difusión, comparando su rendimiento con variantes de una o tres cámaras.
- Desarrollo de políticas transferibles: al compartir estadísticas con push-tape-left, puede usarse como base para componer políticas multi-tarea en el mismo robot.
- Evaluación de hardware robótico: permite validar el funcionamiento del FFW SG2 Rev1 con políticas visuales de muñeca, sin necesidad de cámaras de cabeza.
- Benchmark de Diffusion Policy en LeRobot: útil para comparar configuraciones de entrenamiento (steps, batch, scheduler) en tareas de manipulación real.
- Entrenamiento de robots en entornos educativos: puede desplegarse en laboratorios universitarios que dispongan del robot ROBOTIS para demostrar técnicas de difusión en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible, ya que se trata de un modelo de robótica y no de lenguaje o razonamiento general. El único dato de rendimiento reportado es la pérdida final de entrenamiento de 0.003, que indica convergencia del proceso de difusión, pero no es comparable con métricas de otros dominios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Con 278,8 millones de parámetros, una estimación orientativa sería de 1-2 GB en FP32, pero el modelo no se distribuye en cuantizaciones, por lo que se recomienda FP32 o FP16.
- GPU recomendadas: no se especifican. Dado el tamaño, una GPU consumer con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3050) podría ejecutar la inferencia, aunque el rendimiento dependerá del entorno de ejecución.
- Compatibilidad con consumer GPU: probablemente sí, por el tamaño moderado, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo está integrado en LeRobot, por lo que puede ejecutarse con el framework LeRobot (Python). No se mencionan compatibilidades con vLLM, llama.cpp, Ollama o TGI, que son específicos para modelos de lenguaje.
- Latencia y throughput: no disponibles. Al ser un modelo de difusión, la inferencia requiere múltiples pasos de denoising, lo que aumenta la latencia frente a redes feedforward simples.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. El modelo es específico para un robot concreto (FFW SG2 Rev1) y una tarea concreta (push-tape-right), por lo que no existen alternativas públicas equivalentes en el mismo repositorio. Se podría comparar con otras políticas entrenadas con LeRobot para el mismo robot, pero no se han facilitado datos de esas variantes.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo funciona con el robot ROBOTIS FFW SG2 Rev1 y con las cámaras de muñeca a resolución 424x240. No es transferible a otros robots o configuraciones de sensores sin reentrenamiento.
- Dependencia de normalización agrupada: las estadísticas pooled son específicas del grupo A (push-tape-left y push-tape-right). Si se usa con otras tareas, la normalización puede ser incorrecta y degradar el rendimiento.
- Sin cuantizaciones: no se ofrecen versiones cuantizadas (GGUF, AWQ, etc.), lo que limita el despliegue en hardware con poca memoria.
- Sin datos de robustez: no se reportan pruebas ante variaciones de iluminación, oclusiones o cambios en la posición de la cinta, por lo que su comportamiento en entornos no controlados es incierto.
- Riesgo de sobreajuste: la pérdida final de 0.003 sugiere un buen ajuste a los datos de entrenamiento, pero no hay evidencia de generalización a escenarios no vistos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende de LeRobot y del hardware ROBOTIS, cuyas licencias y costes deben considerarse por separado.
- Fecha de creación futura: el modelo fue creado en septiembre de 2026, lo que puede indicar un error en los metadatos o una fecha programada; conviene verificar la validez temporal del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omkarpatil/push-tape-right-dp-wrist-diffusion
- Perfil del autor en Hugging Face: https://huggingface.co/omkarpatil
- Repositorio de modelos del autor: https://huggingface.co/omkarpatil/models
- Perfil de GitHub del autor: https://github.com/omkarpatil18
