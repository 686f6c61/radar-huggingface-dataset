# jayp132/beanbag-discrimination-policy-final

## Resumen

El modelo `jayp132/beanbag-discrimination-policy-final` es una política robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), desarrollado en el ecosistema LeRobot de Hugging Face. Está diseñado para que un robot de tipo `so_follower` realice tareas de manipulación fina: recoger un saco de judías (beanbag) verde o rojo según la instrucción. Utiliza dos cámaras (una de muñeca y otra de escena) y el estado del robot (6 dimensiones) como entradas, y produce acciones de 6 dimensiones como salida. Con 51,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo. La relevancia actual radica en demostrar cómo los modelos de imitación pueden abordar tareas de discriminación visual con datos teleoperados, un paso clave hacia la automatización flexible en entornos industriales y domésticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la ventana de acciones se define por hiperparámetros de entrenamiento) |
| Tipos de cuantización | No disponible (pesos en formato safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No aplica (modelo de robótica, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT, un método de aprendizaje por imitación que predice bloques de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el rendimiento en tareas de manipulación robótica. La entrada combina imágenes de dos cámaras (muñeca y escena) con el estado del robot (posición y orientación de los actuadores), y la salida es un vector de acción de 6 dimensiones. El entrenamiento se realizó con el framework LeRobot versión 0.5.2, usando un conjunto de datos teleoperados de 205 episodios y 121.502 fotogramas a 30 FPS, con dos tareas: «recoger el beanbag verde» y «recoger el beanbag rojo». La configuración incluyó 120.000 pasos de entrenamiento, batch size de 8, optimizador AdamW y una tasa de aprendizaje de 1e-5. No se aplicaron técnicas de RLHF ni DPO; el aprendizaje es puramente por imitación de demostraciones.

## Capacidades

- Ejecución de tareas de manipulación robótica: recoger y clasificar objetos según su color (verde o rojo) en un entorno físico.
- Procesamiento multimodal: combina dos cámaras (muñeca y escena) con el estado propio del robot para tomar decisiones.
- Generación de acciones continuas de 6 dimensiones (posición y orientación del efector final) en tiempo real.
- Generalización a nuevas posiciones de los objetos, gracias al entrenamiento con múltiples episodios y variaciones de posición.
- Integración con el ecosistema LeRobot: permite ejecución directa mediante `lerobot-rollout` y entrenamiento con `lerobot-train`.
- No incluye capacidades de generación de texto, razonamiento simbólico ni procesamiento de lenguaje natural, ya que es un modelo específico para control robótico.

## Casos de uso

- **Automatización de líneas de recogida y clasificación**: el modelo puede integrarse en una célula de trabajo que deba separar piezas de diferentes colores en un flujo continuo, usando la cámara de escena para detectar la posición y la de muñeca para ajustar la pinza.
- **Pruebas de robustez en manipulación**: dado que el modelo discrimina entre dos colores, puede utilizarse en laboratorios para evaluar la capacidad de generalización de políticas de imitación ante variaciones de iluminación, fondo o posición de los objetos.
- **Entrenamiento de robots asistente domésticos**: tareas como recoger objetos de un contenedor y depositarlos en un lugar designado, donde el color actúa como criterio de clasificación.
- **Investigación en aprendizaje por imitación**: sirve como modelo de referencia para comparar nuevos algoritmos de control, ya que está publicado con licencia Apache y datos de entrenamiento abiertos.
- **Desarrollo de aplicaciones de robótica educativa**: los estudiantes pueden usar el modelo para experimentar con la programación de robots en entornos académicos, sin necesidad de crear una política desde cero.
- **Integración en sistemas de control de calidad**: el modelo puede adaptarse para detectar defectos visuales y ejecutar acciones de rechazo o reubicación, aunque requeriría reentrenamiento con datos específicos de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no se han proporcionado evaluaciones en robot real (tabla de éxitos vacía). Por tanto, no se pueden comparar métricas numéricas con otros modelos.

## Requisitos de hardware

- El modelo tiene 51,7 millones de parámetros, lo que implica un peso de aproximadamente 0,2 GB en FP32. Cabe en cualquier GPU con más de 2 GB de VRAM.
- Para la inferencia en tiempo real con cámaras (480×640 a 30 FPS), se recomienda una GPU de consumo como NVIDIA GTX 1060 o superior (RTX 3060, RTX 4090). No se requiere hardware especializado como A100 o H100.
- El despliegue se realiza a través de LeRobot, que utiliza PyTorch. No se mencionan compatibilidades con vLLM, llama.cpp o Ollama, ya que es un modelo de robótica, no un LLM.
- La latencia depende del entorno de ejecución: con una GPU moderna se espera un tiempo de inferencia de decenas de milisegundos por paso, suficiente para control en bucle cerrado a 30 Hz.
- Se recomienda una CPU con al menos 4 núcleos para el procesamiento de imágenes y el control del robot, aunque la carga principal recae en la GPU.

## Comparativa con modelos similares

No se dispone de información para comparar este modelo con otras políticas de robótica de la misma categoría (mismo tamaño o misma tarea). No se han encontrado modelos comparables en la documentación proporcionada. La tabla de comparativa queda pendiente de datos públicos.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para un robot de tipo `so` con dos cámaras (muñeca y escena). No es transferible directamente a otros robots sin reentrenamiento.
- No se han reportado evaluaciones de éxito en robot real; el rendimiento real podría variar según las condiciones de luz, posiciones de objetos y calibración de cámaras.
- La discriminación se limita a dos colores (verde y rojo). Para otros colores o objetos se necesitaría reentrenar con nuevos datos.
- No se han documentado sesgos, pero el dataset puede tener un sesgo de posición de los objetos o de iluminación que afecte la generalización.
- Riesgo de alucinación de acciones: como en todo modelo de aprendizaje por imitación, puede generar acciones incorrectas si el entorno difiere de las demostraciones.
- La licencia Apache 2.0 permite uso comercial, pero se debe citar la fuente y el método ACT en cualquier aplicación derivada.
- No se proporcionan resultados de robustez ante distracciones, cambios de iluminación o variaciones de la textura del objeto, por lo que el despliegue en producción requiere validación adicional.

## Enlaces

- Repositorio del modelo: [jayp132/beanbag-discrimination-policy-final](https://huggingface.co/jayp132/beanbag-discrimination-policy-final)
- Dataset de entrenamiento: [jayp132/beanbag-discrimination-final](https://huggingface.co/datasets/jayp132/beanbag-discrimination-final)
- Paper de ACT: [Action Chunking with Transformers (arxiv:2304.38405)](https://huggingface.co/papers/2304.38405)
- LeRobot: [github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Documentación de LeRobot: [huggingface.co/docs/lerobot](https://huggingface.co/docs/lerobot/index)
