# JacobsFarmextra/Dockweed

## Resumen

Dockweed es un modelo de visión por computador desarrollado por JacobsFarmextra (Jan Jaap Verweij) para la detección y segmentación de la mala hierba *Rumex obtusifolius* (lengua de vaca o dockweed) en imágenes RGB. Se compone de dos modelos basados en Ultralytics YOLO26 en su variante *medium*: uno para detección de objetos con cajas delimitadoras (`Rumexv8.pt`) y otro para segmentación de instancias con máscaras a nivel de píxel (`Rumexv8-seg.pt`). Ambos se han afinado a partir de los checkpoints oficiales `yolo26m.pt` y `yolo26m-seg.pt` respectivamente, y están orientados a aplicaciones de agricultura de precisión como el mapeo de malas hierbas, la fumigación selectiva y el deshierbe robótico o mecánico.

El modelo resuelve un problema concreto: la identificación automática de una especie invasora en pastizales y cultivos, lo que permite reducir el uso de herbicidas y optimizar las labores de control. Su relevancia actual radica en la creciente demanda de soluciones de visión por computador en agricultura de precisión, donde los modelos YOLO se han convertido en un estándar por su equilibrio entre velocidad y precisión. El repositorio incluye los pesos entrenados, los scripts de entrenamiento y un registro del proceso, aunque no se publican métricas formales de rendimiento sobre un conjunto de test independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-medium (detección y segmentación) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos en formato .pt de Ultralytics) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | .pt (PyTorch / Ultralytics) |

## Arquitectura y entrenamiento

Ambos modelos parten de los checkpoints YOLO26-medium de Ultralytics y se han afinado con el mismo conjunto de datos y la misma configuración de hiperparámetros. YOLO26 es la evolución reciente de la familia YOLO, que mantiene una arquitectura de red neuronal convolucional (CNN) de una sola pasada, optimizada para detección en tiempo real. La variante *medium* ofrece un equilibrio entre latencia y precisión, adecuada para su despliegue en sistemas embebidos o en GPU de gama media.

El entrenamiento se realizó con un conjunto de datos combinado: 250 imágenes propias anotadas manualmente por el autor y un conjunto público de imágenes de *Rumex obtusifolius* (excluyendo *Rumex crispus*). El reparto final fue de 2.610 imágenes para entrenamiento y 871 para validación, con un tamaño de imagen de 640 píxeles, batch de 8, hasta 100 épocas con early stopping (paciencia 20) y aumentos de datos activados (rotación de 10°, traslación del 10%, escala 0,5–1,5×, volteo horizontal al 50%, ajustes HSV y mosaic al 100%). No se menciona el uso de técnicas como RLHF o DPO, al tratarse de un problema de visión supervisado.

## Capacidades

- Detección de objetos: genera cajas delimitadoras alrededor de plantas de *Rumex obtusifolius* en imágenes RGB.
- Segmentación de instancias: produce máscaras a nivel de píxel además de las cajas, lo que permite una localización más precisa para aplicaciones de pulverización o deshierbe.
- Especialización en una única clase: el modelo solo reconoce *Rumex obtusifolius*; no está entrenado para otras especies de *Rumex* ni para malas hierbas en general.
- Inferencia en tiempo real: al estar basado en YOLO26-medium, es adecuado para sistemas de visión en tiempo real, aunque no se proporcionan métricas de FPS concretas.
- Integración con Ultralytics: se puede usar directamente con la librería `ultralytics` mediante la API de Python, tanto para predicción como para reentrenamiento.

## Casos de uso

- Mapeo de malas hierbas en pastizales: el modelo puede procesar imágenes aéreas o de campo para generar mapas de densidad de *Rumex obtusifolius*, ayudando a los agricultores a planificar intervenciones.
- Fumigación selectiva (spot-spraying): integrado en un sistema de pulverización, el modelo activa las boquillas solo cuando detecta la planta, reduciendo el consumo de herbicida hasta en un 80% en comparación con la fumigación uniforme.
- Deshierbe robótico: un robot agrícola equipado con el modelo puede localizar y eliminar mecánicamente las plantas de dockweed sin dañar el cultivo circundante, gracias a las máscaras de segmentación.
- Monitorización de la eficacia de tratamientos: comparando detecciones antes y después de una intervención, se puede evaluar cuantitativamente la reducción de la población de dockweed.
- Investigación agronómica: los investigadores pueden usar el modelo para anotar automáticamente grandes volúmenes de imágenes de campo, acelerando estudios sobre la distribución y fenología de la especie.
- Integración en sistemas de visión para vehículos autónomos agrícolas: el modelo puede ejecutarse en hardware embebido (como Jetson o Raspberry Pi con acelerador) para proporcionar detección en tiempo real durante el recorrido del vehículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, mAP ni comparaciones con otros modelos. Se recomienda a los usuarios validar el modelo con sus propios datos antes de su despliegue en producción.

## Requisitos de hardware

- El tamaño del repositorio es de 0,1 GB, lo que sugiere que cada archivo de pesos ocupa aproximadamente 50 MB (en formato .pt de precisión flotante). Esto implica que el modelo es ligero y puede ejecutarse en GPUs de consumo.
- Para inferencia en tiempo real, una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050 o superior) sería suficiente. En CPU, la inferencia es posible pero más lenta.
- Para entrenamiento o fine-tuning adicional, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 2070 o superior), aunque el autor usó una única GPU sin especificar el modelo.
- Opciones de despliegue: al ser un modelo Ultralytics, se puede servir con las herramientas estándar de la librería (Python API, CLI) o exportar a formatos como ONNX, TensorRT o CoreML para su uso en entornos de producción. También es compatible con frameworks de inferencia como vLLM (aunque no es su caso típico) o con soluciones específicas de visión como Triton Inference Server.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de detección de malas hierbas. El autor no publica métricas comparativas ni referencia otros modelos en la model card. Se podría comparar con modelos YOLOv8 o YOLO11 de tamaño similar, pero no hay datos objetivos de rendimiento sobre el mismo conjunto de datos. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El modelo solo ha sido entrenado con *Rumex obtusifolius*; su precisión sobre *Rumex crispus* u otras especies de aspecto similar es desconocida y probablemente baja.
- El conjunto de datos propio es reducido (250 imágenes), lo que puede limitar la generalización a condiciones de iluminación, estadios de crecimiento, vegetación de fondo o sensores distintos a los del entrenamiento.
- No se han publicado métricas de rendimiento sobre un conjunto de test independiente; los usuarios deben validar el modelo con sus propios datos antes de cualquier uso en producción.
- No se ha evaluado el modelo para sesgos o equidad más allá de la cobertura de especies; no está pensado para contextos ajenos a la detección de malas hierbas en imágenes agrícolas.
- La licencia AGPL-3.0 implica que cualquier uso comercial o integración en un servicio debe cumplir con los términos de copyleft, lo que puede ser restrictivo para aplicaciones propietarias. Se recomienda revisar la página de licencias de Ultralytics para entender las opciones de licencia empresarial.
- No está validado para la toma de decisiones regulatorias o de seguridad crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JacobsFarmextra/Dockweed
- Dataset asociado: https://huggingface.co/datasets/JacobsFarmextra/Dockweed
- Perfil del autor: https://huggingface.co/JacobsFarmextra
- Repositorio de Ultralytics: https://github.com/ultralytics/ultralytics
- Página de licencias de Ultralytics: https://www.ultralytics.com/license
