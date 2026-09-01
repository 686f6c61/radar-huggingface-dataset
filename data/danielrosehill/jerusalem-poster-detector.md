# danielrosehill/jerusalem-poster-detector

## Resumen

El modelo `danielrosehill/jerusalem-poster-detector` es un fine-tune de `yolo11n.pt` (la variante nano de Ultralytics YOLO11) desarrollado por Daniel Rosehill para localizar y clasificar un diseño concreto de cartel callejero en fotografías urbanas. Concretamente, detecta el cartel `chabad-rebbe-poster-1`, un póster de temática mesiánica que aparece pegado en farolas, vallas y mobiliario urbano de Jerusalén. El autor lo presenta como una prueba de concepto para flujos de trabajo de documentación de graffiti y flyposting: permite inventariar qué carteles están presentes, identificar cuál de los diseños conocidos es y verificar posteriormente si han sido retirados.

El modelo se entrenó sobre un conjunto de datos muy reducido (13 imágenes) con una única clase, y su arquitectura es la de un detector de objetos de una etapa basado en CNN, con un tamaño de entrada de 1280 píxeles. Aunque los resultados sobre los datos de entrenamiento son altos, la evaluación con validación hold-out (separando ubicaciones completas) muestra una caída significativa del rendimiento, lo que refleja su naturaleza experimental y su limitada capacidad de generalización. No es un modelo listo para producción, sino una demostración de viabilidad técnica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics YOLO11 nano) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

El modelo se basa en YOLO11n, una red neuronal convolucional de detección de objetos de una etapa que predice cajas delimitadoras y clases directamente sobre la imagen. La variante nano es la más ligera de la familia YOLO11, diseñada para ejecutarse en hardware limitado. El fine-tune se realizó con la librería Ultralytics sobre un dataset propio de 13 fotografías de una misma calle, tomadas en una sola tarde. Cada imagen contiene al menos una instancia del cartel objetivo, y las cajas fueron anotadas manualmente.

El entrenamiento se ejecutó durante 400 épocas con un tamaño de imagen de 1280 píxeles, una tasa de aprendizaje inicial de 0.001, congelando las primeras 10 capas del backbone y un batch de 4. El autor documenta que un primer intento con los hiperparámetros por defecto de Ultralytics (lr0=0.01, backbone sin congelar y batch mayor que el conjunto de entrenamiento) colapsó, prediciendo toda la imagen como cartel con confianza 1.0. La configuración final fue ajustada para evitar ese comportamiento. No se emplearon técnicas de refuerzo ni alineación, al tratarse de un modelo de visión supervisado de forma clásica.

## Capacidades

- Detección de objetos: localiza mediante cajas delimitadoras la presencia del cartel `chabad-rebbe-poster-1` en fotografías de calle.
- Clasificación específica: distingue ese diseño concreto de otros posibles carteles, aunque solo está entrenado para una única clase.
- Inferencia a alta resolución: requiere un tamaño de entrada de 1280 píxeles para detectar instancias pequeñas (algunas ocupan menos del 0.1 % del encuadre).
- Integración con el ecosistema Ultralytics: se puede cargar con la API de YOLO y usar para predicción sobre imágenes nuevas.
- No dispone de capacidades de generación de texto, razonamiento, tool calling ni soporte multilingüe, al ser exclusivamente un detector visual.

## Casos de uso

- Inventario de cartelería urbana: un investigador o activista puede fotografiar una calle y usar el modelo para enumerar cuántos carteles del diseño conocido están presentes y en qué ubicación exacta, facilitando un censo visual.
- Verificación de retirada: tras una campaña de limpieza, se pueden tomar nuevas fotografías de los mismos puntos y comparar si el cartel sigue o ha sido eliminado, automatizando el seguimiento temporal.
- Documentación de arte callejero: el modelo sirve para catalogar la aparición de un póster concreto en diferentes soportes (farolas, vallas, contenedores) dentro de un estudio etnográfico o sociológico.
- Monitoreo de campañas de propaganda: organizaciones que estudian la difusión de mensajes políticos o religiosos pueden usar el detector para medir la densidad de carteles en una zona a lo largo del tiempo.
- Prueba de concepto para pipelines de visión por computador: desarrolladores pueden reutilizar el flujo de entrenamiento y evaluación (con separación por ubicaciones) como plantilla para crear detectores de otros objetos específicos con pocos datos.
- Validación de metodologías de anotación: el modelo sirve como ejemplo de cómo evaluar correctamente la generalización cuando el dataset es pequeño, usando hold-out por localización en lugar de por imagen aleatoria.

## Benchmarks y rendimiento

Los resultados publicados en la model card se dividen en dos grupos. El primero corresponde a las métricas sobre los datos de entrenamiento (sin validación separada), que miden la capacidad de reproducción de lo visto. El segundo es una evaluación con retención de ubicaciones completas (L2, L3, L4, L5), que estima la generalización a fotografías nuevas.

| Metrica | Valor (entrenamiento, no hold-out) |
|---|---|
| mAP@50 | 0.992 |
| mAP@50-95 | 0.815 |
| Precision | 0.975 |
| Recall | 0.962 |
| Imagenes de entrenamiento | 13 |
| Imagenes de validacion | 13 |
| Tamano de imagen | 1280 |
| Epocas | 400 |

| Metrica | Valor (hold-out por ubicaciones) |
|---|---|
| mAP@50 | 0.649 |
| mAP@50-95 | 0.270 |
| Precision | 0.765 |
| Recall | 0.571 |
| Imagenes de entrenamiento / validacion | 7 / 6 |

El autor advierte explícitamente que los primeros números no deben interpretarse como rendimiento real, y que los segundos son los que deben usarse para juzgar el modelo. La inspección visual a `conf=0.25` muestra que detecta los carteles reales en farolas no vistas, pero también produce falsos positivos sobre abrigos oscuros o parches de cielo y edificios brillantes, coherente con una precisión de 0.77.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM ni GPU en la documentación del modelo.
- Al tratarse de un modelo YOLO11n (la variante nano), es ligero y puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, e incluso en CPU para inferencia a baja resolución, aunque el tamaño de entrada de 1280 píxeles aumenta la carga computacional.
- Para inferencia a 1280 píxeles se recomienda al menos 4 GB de VRAM, aunque no hay datos oficiales.
- Opciones de despliegue: al ser un modelo Ultralytics, se puede usar con la librería `ultralytics` en Python, exportar a ONNX o TensorRT, o integrarse en pipelines con vLLM (aunque no es un modelo de lenguaje). También es compatible con herramientas como `llama.cpp` solo si se convierte a formato GGUF, pero no es el flujo habitual para YOLO.
- La latencia y el throughput no están documentados; en una GPU moderna se espera un rendimiento de decenas de FPS, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un fine-tune específico de YOLO11n, y no se han publicado comparaciones con otros detectores de carteles o de objetos urbanos. Por tanto, no se incluye tabla comparativa.

## Limitaciones y advertencias

- Entrenado con solo 13 fotografías de una única calle, tomadas en una tarde concreta, por lo que no ha visto variedad de iluminación, clima ni fondos. Su capacidad de generalización es muy limitada.
- La evaluación hold-out muestra una caída drástica del rendimiento (mAP@50 de 0.649 frente a 0.992 en entrenamiento), lo que indica sobreajuste.
- Riesgo elevado de falsos positivos: el modelo tiende a confundir prendas oscuras, parches de cielo o edificios brillantes con el cartel objetivo.
- No es un modelo de producción: el propio autor lo califica como prueba de concepto y recomienda verificar manualmente cualquier conteo antes de usarlo para tomar decisiones.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no hay garantías de precisión ni soporte.
- El dataset de entrenamiento no está disponible públicamente en el repositorio del modelo (solo se referencia el dataset `danielrosehill/jerusalem-poster-detection` en Hugging Face, pero no se ha verificado su acceso).
- El modelo solo reconoce una clase de cartel; cualquier otro diseño (memoriales, avisos electorales, otros stickers) será ignorado o provocará falsos positivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielrosehill/jerusalem-poster-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/danielrosehill/jerusalem-poster-detection
- Repositorio de código (scripts de entrenamiento): https://github.com/danielrosehill/Jerusalem-Graffiti
- Proyecto relacionado (dataset de imágenes de Jerusalén): https://huggingface.co/danielrosehill/Jerusalem-Images
- Página personal del autor: https://www.danielrosehill.com/project/jerusalem-images/
