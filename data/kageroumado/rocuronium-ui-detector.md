# kageroumado/rocuronium-ui-detector

## Resumen

Rocuronium UI Detector es un modelo de detección de objetos diseñado para localizar elementos de interfaz de usuario en capturas de pantalla de aplicaciones de escritorio. Ha sido desarrollado por kageroumado como parte del proyecto Rocuronium, una herramienta de automatización de UI para macOS que permite controlar aplicaciones sin necesidad de mover el cursor. El modelo resuelve un problema práctico: cuando el árbol de accesibilidad de una aplicación está vacío o es incorrecto, el agente necesita un sistema de visión para "apuntar" a los controles visibles.

La arquitectura se basa en YOLO11, concretamente en la variante nano (YOLO11n), entrenada sobre un subconjunto estratificado de aproximadamente 13.000 imágenes del dataset ServiceNow/GroundCUA, que abarca 87 aplicaciones de escritorio. El modelo se exporta a Core ML para Apple silicon, con un tamaño de paquete de 5,4 MB. No es un modelo de lenguaje: su salida son cajas delimitadoras con confianza para una única clase, `UIElement`. Su relevancia actual radica en que ofrece una alternativa con licencia Apache-2.0 a otros detectores entrenados sobre GroundCUA que heredan la licencia AGPL-3.0 de Ultralytics, lo que permite su integración en aplicaciones cerradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11 (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (compiled model) |

## Arquitectura y entrenamiento

El modelo es un detector de objetos basado en YOLO11, una arquitectura de detección en una sola etapa que predice cajas delimitadoras y confianzas directamente sobre la imagen. Se ha entrenado en un subconjunto estratificado de ~13.000 imágenes del dataset ServiceNow/GroundCUA, que cubre 87 aplicaciones de escritorio (macOS, Windows y Linux). El entrenamiento se realizó durante 100 épocas en Apple MPS.

Una innovación destacable es que el modelo es de una sola clase (`UIElement`). En lugar de clasificar el tipo de control (botón, checkbox, slider, etc.), el modelo se limita a proponer cajas delimitadoras. Esta decisión se justifica porque el campo `category` del dataset GroundCUA contiene aproximadamente un 33% de cajas vacías y no ofrece una señal limpia para aprender distinciones de tipo visual. La etiqueta y el rol del elemento se obtienen posteriormente mediante OCR y, en el caso de Rocuronium, con un pase de un VLM. El modelo se exportó a Core ML, y los pesos exportados no contienen código de Ultralytics, lo que evita las restricciones de la licencia AGPL-3.0.

## Capacidades

- Detección de elementos de interfaz de usuario en capturas de pantalla de escritorio, devolviendo cajas delimitadoras normalizadas con confianza.
- Entrada de imagen RGB de 640×640 píxeles.
- Salida en formato estándar de Core ML / Vision (`VNRecognizedObjectObservation`), con `confidence` de tamaño `[N, 1]` y `coordinates` de tamaño `[N, 4]`, tras aplicar supresión de no máximos.
- Compatibilidad con el framework Vision de Apple, lo que facilita su integración en aplicaciones nativas de macOS.
- Diseñado para funcionar como parte de una cascada de visión en agentes GUI: primero accesibilidad, luego detector + OCR, y finalmente VLM.
- No incluye soporte de tool calling, generación de texto ni razonamiento; es exclusivamente un detector de objetos.

## Casos de uso

- Automatización de UI en macOS: Rocuronium puede utilizar el detector para localizar controles en la pantalla y ejecutar acciones sobre ellos sin mover el cursor, incluso cuando la aplicación no expone su árbol de accesibilidad.
- Accesibilidad de aplicaciones con árbol de accesibilidad vacío: en aplicaciones que no proporcionan información de accesibilidad, el modelo propone cajas para iconos y botones, permitiendo que un agente interactúe con ellas.
- Pruebas visuales automatizadas: el modelo puede verificar que ciertos elementos de interfaz están presentes en una captura de pantalla, comparando las cajas detectadas contra una lista esperada de controles.
- Agentes GUI con visión: combinado con OCR para extraer el texto dentro de cada caja y con un VLM para razonar sobre la acción a realizar, el detector actúa como la primera etapa de localización.
- Automatización de aplicaciones heredadas o no accesibles: aplicaciones antiguas que no son accesibles por otros medios pueden ser controladas mediante la detección visual de sus controles.
- Integración en pipelines de Core ML / Vision para aplicaciones nativas de Apple: al ser un paquete Core ML, puede integrarse directamente en proyectos Swift o Xcode para análisis de pantalla en tiempo real.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados en la model card del autor:

| Metrica | Valor |
|---|---|
| mAP@50 | 0,881 |
| mAP@50-95 | 0,479 |
| Precision | 0,864 |
| Recall | 0,851 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. La latencia media reportada es de ~8 ms por imagen en `.cpuAndNeuralEngine` en Apple silicon, con un mínimo de 5,7 ms.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo Core ML, no se especifica consumo de VRAM; se ejecuta en Apple silicon utilizando CPU y Neural Engine.
- GPU recomendadas: Apple silicon (M1, M2, M3 y posteriores). No se proporcionan datos para GPUs NVIDIA.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada; el modelo está pensado para Apple silicon, no para tarjetas gráficas convencionales.
- Opciones de despliegue: Core ML con Vision framework en macOS. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: ~8 ms por imagen de media en `.cpuAndNeuralEngine`, con un mínimo de 5,7 ms.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la informacion disponible. El modelo comparte arquitectura con Ultralytics/YOLO11, pero no se ofrecen resultados de comparación con otros detectores de elementos de interfaz entrenados sobre GroundCUA.

## Limitaciones y advertencias

- El modelo es un pre-filtro, no un clasificador: no proporciona el rol ni el texto del elemento detectado; debe combinarse con OCR.
- Entrenado a 640×640 píxeles; los controles muy pequeños o muy densos pueden fusionarse o perderse.
- Optimizado para UI de escritorio (macOS, Windows, Linux) según el dataset GroundCUA; no está ajustado para diseños web ni móviles.
- Puede producir falsos positivos, como cualquier detector de objetos, lo que requiere un umbral de confianza adecuado en producción.
- No se han documentado sesgos específicos, pero al estar entrenado sobre un conjunto de aplicaciones de escritorio, su comportamiento puede variar en aplicaciones no representadas en el dataset.
- La licencia Apache-2.0 permite uso comercial, pero el autor indica que las herramientas de Ultralytics se usaron solo para entrenar; los pesos exportados no contienen código de Ultralytics. No obstante, se recomienda revisar la licencia del modelo base para evitar ambigüedades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kageroumado/rocuronium-ui-detector
- Repositorio del autor: https://github.com/kageroumado
- Proyecto Rocuronium en GitHub: https://github.com/kageroumado/rocuronium
- Dataset de entrenamiento ServiceNow/GroundCUA: https://huggingface.co/datasets/ServiceNow/GroundCUA
- Modelo base Ultralytics/YOLO11: https://huggingface.co/Ultralytics/YOLO11
