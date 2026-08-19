# lenawngr/ACT_switch-2-bottom_v2

## Resumen

`lenawngr/ACT_switch-2-bottom_v2` es un modelo de política robótica basado en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado mediante la librería LeRobot de Hugging Face, sobre el dataset de teleoperación `lenawngr/SWITCH-2-bottom`, orientado a la manipulación de un brazo robótico SO-100 en la tarea de conmutación de un interruptor inferior. Con 51,6 millones de parámetros, es un modelo compacto pensado para control de robots en tiempo real, no para generación de lenguaje.

El modelo está disponible bajo licencia Apache-2.0 y sus pesos están en formato safetensors, lo que facilita su integración en pipelines de robótica con LeRobot. Su relevancia radica en que demuestra cómo técnicas de imitación basadas en transformers pueden aplicarse a tareas físicas de manipulación con datasets relativamente pequeños, siendo una alternativa práctica a los métodos de control clásicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.594.886 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de chunking del entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de control robotico, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que procesa observaciones (imágenes y estados de articulaciones) y predice un chunk de acciones futuras, típicamente de 10 a 100 pasos. El entrenamiento se realiza mediante comportamiento clonado sobre datos teleoperados, sin refuerzo explícito. En este caso, el modelo se ha entrenado con la implementación de LeRobot, que utiliza una variante del transformer original del paper (arxiv:2304.13705). No se han publicado detalles sobre el número de tokens, composición del dataset o técnicas de fine-tuning adicionales (como RLHF o DPO), ya que no aplican a este dominio.

El entrenamiento se llevó a cabo sobre el dataset `lenawngr/SWITCH-2-bottom`, que contiene episodios de teleoperación de la tarea de conmutación de un interruptor con un robot SO-100. LeRobot gestiona el pipeline completo de entrenamiento, evaluación y despliegue, incluyendo la integración con el entorno físico.

## Capacidades

- Control robótico por imitación: aprende a ejecutar una tarea específica (conmutar un interruptor) a partir de demostraciones teleoperadas.
- Predicción de acciones en chunk: genera secuencias de acciones de forma autónoma, lo que mejora la fluidez del movimiento y reduce la latencia de control.
- Entrada multimodal: combina imágenes de cámara y estados de articulaciones del robot.
- Integración con LeRobot: permite entrenamiento, evaluación y despliegue mediante la CLI de LeRobot (`lerobot-train`, `lerobot-record`).
- Inferencia en tiempo real: por su tamaño reducido, es ejecutable en GPU de consumo o incluso en CPU para control de baja frecuencia.
- No soporta funciones de tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Automatización de tareas repetitivas en laboratorio: el modelo puede controlar un brazo robótico para realizar la operación de conmutar interruptores en bancos de pruebas, liberando tiempo de investigadores.
- Prototipado de políticas robóticas: sirve como ejemplo de referencia para quien quiera entrenar sus propios modelos ACT con LeRobot, ya que el checkpoint y el dataset están publicados.
- Educación en robótica y aprendizaje por imitación: permite a estudiantes reproducir el entrenamiento y evaluar el comportamiento en hardware real o simulado.
- Investigación en generalización de tareas de manipulación: el modelo puede servir como baseline para comparar técnicas de aprendizaje por refuerzo o imitación en tareas de precisión.
- Evaluación de robustez de políticas: al estar disponible el checkpoint, se pueden testear perturbaciones en la entrada o variaciones del entorno para medir la robustez.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede usarse como asistente que completa movimientos parcialmente teleoperados, reduciendo la carga del operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito ni comparativas con otros métodos. Para evaluar el rendimiento, sería necesario ejecutar la evaluación en el robot real o en un simulador compatible con LeRobot.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,6 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32, y mucho menos en cuantización (no publicada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p.ej., NVIDIA GTX 1050 Ti) es suficiente; incluso CPUs modernas pueden ejecutarlo en tiempo real para control de baja frecuencia.
- Compatibilidad con hardware de consumo: sí, el modelo cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: LeRobot soporta ejecución directa con `lerobot-record` y `lerobot-eval`. No hay soporte nativo para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos; la latencia dependerá del hardware y del número de pasos de chunking configurado en el entrenamiento.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de robótica con ACT sobre LeRobot). El repositorio de LeRobot incluye otros checkpoints de políticas ACT, pero no hay datos de rendimiento publicados para comparar. Por tanto, no se puede establecer una comparativa numérica.

## Limitaciones y advertencias

- Modelo especializado: está entrenado exclusivamente para la tarea de conmutar un interruptor en un entorno concreto; no generaliza a otras tareas o configuraciones del robot.
- Dependencia del dataset: el rendimiento está limitado por la calidad y variedad de las demostraciones teleoperadas en `lenawngr/SWITCH-2-bottom`.
- Riesgo de alucinación: no aplicable, ya que no es un modelo de lenguaje.
- Sesgos: no hay sesgos lingüísticos, pero sí posibles sesgos de ejecución (p. ej., dependencia de la posición de la cámara, iluminación, etc.).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe verificar que el dataset `lenawngr/SWITCH-2-bottom` tenga una licencia compatible.
- Caveat de producción: para uso industrial, es necesario validar la seguridad del robot y el modelo en entornos controlados; no es un sistema de control autónomo seguro sin supervisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_switch-2-bottom_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/SWITCH-2-bottom
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
