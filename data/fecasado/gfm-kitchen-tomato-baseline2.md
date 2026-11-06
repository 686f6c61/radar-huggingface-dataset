# fecasado/gfm-kitchen-tomato-baseline2

## Resumen

GFM Kitchen Tomato Baseline 2 es una política robótica de manipulación entrenada mediante *gaze flow matching* (GFM), una variante de flow matching condicionada por la mirada del operador o por señales de atención visual. El modelo lo publica el usuario fecasado en Hugging Face Hub y se distribuye con la librería LeRobot, el framework de Hugging Face para aprendizaje por imitación en robótica. Está entrenado sobre el dataset propio `fecasado/tomato-to-plate-320x240`, que registra la tarea de transferir un tomate a un plato con observaciones de cámara a resolución 320x240.

Con 75.216.858 parámetros (aproximadamente 75 millones), es un modelo compacto orientado a inferencia en tiempo real sobre hardware de consumo, no a razonamiento general. Su relevancia radica en que ejemplifica el flujo actual de políticas de imitación ligeras que se despliegan directamente sobre brazos robóticos de bajo coste tipo SO-100/SO-101, con pesos en formato safetensors y un repositorio de solo 0,3 GB.

No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones. Es una política visuomotora que mapea observaciones (imágenes de cámara y estado del robot) a acciones de control de las articulaciones. Cualquier evaluación debe hacerse en ese contexto, no en el de benchmarks de NLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gaze flow matching (política visuomotora de flow matching condicionada por mirada); detalles internos de capas no disponibles |
| Parámetros totales | 75.216.858 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantización | no disponible (pesos safetensors en el repo; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como `gaze_flow_matching`: un esquema de flow matching en el que la generación de trayectorias de acción está condicionada por información de mirada, además de las observaciones visuales habituales. Flow matching aprende un campo de velocidades que transporta ruido hacia la distribución de acciones expertas, lo que permite generar secuencias de acción continuas y multimodales sin la discretización típica de los modelos de difusión. La model card no detalla el número de capas, el codificador visual empleado ni la dimensión de las acciones; esos datos figuran como no disponibles.

El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/tomato-to-plate-320x240` (resolución 320x240), presumiblemente mediante aprendizaje por imitación a partir de demostraciones teleoperadas. No se documentan el número de episodios, el número de tokens o frames procesados, ni si hubo etapas de refinamiento posteriores (RLHF, DPO u otras). La model card es una plantilla sin completar en la sección de detalles del modelo, por lo que la información sobre composición del dataset y protocolo de evaluación es inexistente.

## Capacidades

- Control visuomotor de un brazo robótico para tareas de pick-and-place (trasladar un tomate a un plato).
- Generación de trayectorias de acción continuas mediante flow matching, adecuada para control de articulaciones en tiempo real.
- Condicionamiento por mirada (*gaze*), que aporta una señal de atención adicional sobre la escena.
- Procesamiento de observaciones de cámara a 320x240 píxeles.
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue (`lerobot-train`, `lerobot-record`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política recibe las imágenes de la cámara y emite comandos articulares para mover un tomate hasta un plato, lo que permite validar pipelines de imitación antes de escalar a tareas más complejas.
- Prototipado rápido con brazos SO-100/SO-101: al ser un modelo de 75 millones de parámetros y 0,3 GB, se puede cargar y ejecutar en una estación de trabajo con GPU de consumo, lo que abarata la iteración en investigación.
- Reproducción de experimentos de flow matching robótico: sirve como línea base (*baseline*) frente a la que comparar variantes de GFM, políticas ACT o diffusion policy en la misma tarea.
- Evaluación de generalización visuomotora: al estar entrenado en una única tarea y resolución, permite medir la degradación al cambiar iluminación, posición del objeto o punto de vista de la cámara.
- Docencia y formación en aprendizaje por imitación: el flujo completo de LeRobot (entrenar, grabar episodios de evaluación, comparar) se puede reproducir con este checkpoint como ejemplo mínimo.
- Integración en pipelines de recogida de datos: usar el modelo para generar episodios de evaluación etiquetados con el prefijo `eval_` y analizar tasas de éxito frente a la política de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 75,2 millones de parámetros; en la práctica el cuello de botella es el codificador visual y el *batching* de observaciones, no el tamaño del modelo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; se ha documentado el uso de `--policy.device=cuda`, por lo que se recomienda una GPU NVIDIA (RTX 3060/4060 o superior).
- Cabe en GPU de consumo: sí, con holgura, incluidas RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch/CUDA; no se documentan exportaciones a ONNX, TensorRT ni llama.cpp (no aplica).
- Latencia y throughput: no disponibles. Al ser una política de control, la latencia vendrá dominada por la frecuencia de captura de cámara y el bucle de control del robot, no por el modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GFM Kitchen Tomato Baseline 2 | 75,2 M | Imágenes 320x240 + estado | Pick-and-place tomate→plato | Apache 2.0 | Hugging Face (LeRobot) |
| ACT (política de imitación de LeRobot) | no disponible | Imágenes + estado | Manipulación por imitación | Apache 2.0 (LeRobot) | Hugging Face / LeRobot |
| Diffusion Policy | no disponible | Imágenes + estado | Manipulación por imitación | según implementación | Repos académicos |

No se dispone de datos de rendimiento comparables entre estas políticas en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo específico de una única tarea y un único dataset; no generaliza a otras tareas sin reentrenamiento.
- Sin datos publicados de tasa de éxito ni de robustez ante cambios de iluminación, fondo o posición de la cámara.
- La model card está incompleta (plantilla sin rellenar en varias secciones), lo que impide auditar el entrenamiento.
- Riesgo de sobreajuste al entorno de captura del dataset `tomato-to-plate-320x240`.
- No es un modelo lingüístico: no admite prompts de texto, tool calling ni razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación publicada desaconseja su uso en producción sin validación propia.
- No se documentan sesgos; en robótica el riesgo relevante es el fallo físico (colisiones, agarres fallidos) durante el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-tomato-baseline2
- Dataset: https://huggingface.co/datasets/fecasado/tomato-to-plate-320x240
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
