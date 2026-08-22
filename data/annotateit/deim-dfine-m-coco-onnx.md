# AnnotateIt/deim-dfine-m-coco-onnx

## Resumen

El modelo `AnnotateIt/deim-dfine-m-coco-onnx` es una conversión no oficial a formato ONNX del modelo de detección de objetos DEIM (DETR with Improved Matching) en su variante `dfine-m`, desarrollado por Intellindust AI Lab. Se trata de un detector de estilo DETR con 300 queries, entrenado sobre el conjunto de datos COCO con 80 clases. El modelo exporta las salidas crudas del modelo (logits y cajas predichas) sin ningún postprocesamiento, por lo que todo el pipeline de NMS, sigmoid y ajuste de cajas queda fuera del grafo ONNX. Está publicado bajo licencia Apache-2.0 y tiene un tamaño de repositorio de 0.1 GB, con un único archivo `model.onnx` de 77,925,210 bytes.

La relevancia de este modelo radica en su formato ONNX, que permite su ejecución en múltiples runtimes (ONNX Runtime, TensorRT, OpenVINO, etc.) y en entornos de producción o edge. El autor (AnnotateIt) lo presenta como una conversión no oficial, pero ha validado la inferencia con ONNX Runtime CPU y con el runtime WASM de `onnxruntime-web`, comparando numéricamente con el checkpoint oficial de PyTorch. La arquitectura DEIM se destaca por mejorar el mecanismo de matching en los DETR, logrando convergencia más rápida y mayor precisión. El modelo reporta un COCO AP de 52.7 (según el autor original, no re-medido en esta conversión).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DEIM (DETR with Improved Matching), variante dfine-m |
| Parámetros totales | no disponible (el autor no los especifica) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (solo se proporciona el ONNX original en float32) |
| Idiomas soportados | no disponible (modelo de detección de objetos, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `model.onnx`) |

## Arquitectura y entrenamiento

El modelo `DEIM` (DETR with Improved Matching) es un marco de entrenamiento para detectores DETR que optimiza el proceso de asignación entre predicciones y objetos reales, acelerando la convergencia y mejorando la precisión. La variante `dfine-m` es una de las configuraciones del modelo, y según el autor original alcanza un AP de 52.7 en COCO. La conversión a ONNX exporta el grafo completo del modelo, pero sin las operaciones de postprocesamiento (sigmoid, NMS, top-k) y sin el redimensionado de la imagen. El modelo espera una entrada `float32` de forma `[1, 3, 640, 640]` (NCHW) y devuelve dos salidas: `logits` de forma `[1, 300, 80]` (logits crudos por clase) y `pred_boxes` de forma `[1, 300, 4]` (cajas en formato `cxcywh` normalizado). No se han proporcionado detalles sobre el conjunto de datos de entrenamiento más allá de COCO, ni sobre el proceso de entrenamiento (RLHF, etc., no aplica).

## Capacidades

- Detección de objetos: detecta objetos de las 80 clases de COCO (índices 0 a 79) en imágenes de entrada.
- Salida cruda: proporciona logits y cajas sin postprocesamiento, permitiendo al usuario aplicar su propio NMS y umbral de confianza.
- Formato ONNX: compatible con múltiples runtimes (ONNX Runtime, TensorRT, OpenVINO, etc.).
- No incluye soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo de visión por computador.

## Casos de uso

- **Detección de objetos en tiempo real en dispositivos edge**: al ser un modelo ONNX de solo ~78 MB, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, Jetson) usando ONNX Runtime, manteniendo una ventana de entrada de 640×640 píxeles.
- **Integración en pipelines de visión por computador**: Se puede combinar con otros módulos (tracking, OCR, clasificación) mediante el uso de ONNX Runtime en Python, C++ o Rust.
- **Aplicaciones web de anotación automática**: El formato ONNX permite ejecutar el modelo en el navegador mediante `onnxruntime-web`, como ha validado el autor con su herramienta AnnotateIt, para anotar imágenes sin enviar datos a un servidor.
- **Prototipado rápido en proyectos de visión**: Al tener una sola entrada y salida fijas, es sencillo integrarlo en scripts de prueba con OpenCV o PIL.
- **Evaluación de modelos DETR**: Sirve como referencia para comparar el rendimiento de la variante `dfine-m` en formato ONNX con otras implementaciones.
- **Sistemas de vigilancia y análisis de vídeo**: Al procesar fotogramas de 640×640, puede utilizarse en pipelines de detección de objetos en tiempo real en vídeo, siempre que se gestione el postprocesamiento externo.

## Benchmarks y rendimiento

El autor de la conversión reporta que el modelo original (PyTorch) alcanza un COCO AP de 52.7, pero no se han re-medido en esta versión ONNX. No se proporcionan más resultados de benchmarks en la información disponible.

| Métrica | Valor |
|---|---|
| COCO AP (reportado por el autor original) | 52.7 |

No se dispone de comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada. Al ser un modelo de visión de ~140 MB, se estima que en float32 requiere alrededor de 1-2 GB de VRAM para inferencia con batch 1, pero este dato no está confirmado.
- **GPU recomendadas**: puede ejecutarse en cualquier GPU con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3050, A100, H100). También puede ejecutarse en CPU, aunque con mayor latencia.
- **Compatibilidad con GPU consumer**: sí, cabe en GPU de consumo como RTX 2060 o superiores.
- **Opciones de despliegue**: ONNX Runtime (CPU/GPU), `onnxruntime-web` (WASM), TensorRT (tras conversión), OpenVINO, etc.
- **Latencia y throughput**: no disponibles en la información. Depende del runtime y del hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la fuente proporcionada. Se sabe que existen otras conversiones de la familia `dfine` (por ejemplo, `dfine-nano` y `dfine-x`) en Hugging Face, pero no se proporcionan datos de rendimiento o especificaciones para comparar. Por tanto, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- **Conversión no oficial**: no está respaldada por los autores originales de DEIM; puede haber diferencias numéricas menores respecto al checkpoint oficial.
- **Sin postprocesamiento**: el usuario debe implementar sigmoid, NMS y la conversión de coordenadas `cxcywh` a cajas absolutas. No se incluye la normalización de la imagen (se espera que el input ya esté rescalado a 640×640 y dividido por 255, sin media/desviación).
- **Solo COCO**: el modelo detecta únicamente las 80 clases de COCO; no es un detector generalizable a otras categorías sin reentrenamiento.
- **Posible sesgo**: al estar entrenado en COCO, puede tener sesgos sobre los objetos y escenarios de ese conjunto de datos.
- **Riesgo de alucinación**: no aplica en el contexto de detección de objetos, pero se pueden generar detecciones falsas si el umbral de confianza es bajo.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo original proviene de un repo de GitHub que puede tener condiciones adicionales; se debe verificar la licencia del repositorio upstream.

## Enlaces

- [Hugging Face del modelo](https://huggingface.co/AnnotateIt/deim-dfine-m-coco-onnx)
- [Repositorio DEIM (Intellindustries AI Lab)](https://github.com/Intellindust-AI-Lab/DEIM)
- [ONNX Model Zoo (referencia general)](https://github.com/onnx/models)
- [AnnotateIt AI - herramienta de anotación](https://annotateit.ai/)
- [Otro modelo similar: AnnotateIt/dfine-nano-coco-onnx](https://huggingface.co/AnnotateIt/dfine-nano-coco-onnx)
- [onnx-community/dfine_x_coco-ONNX](https://huggingface.co/onnx-community/dfine_x_coco-ONNX)</think>## Resumen

El modelo `deim-dfine-m-coco-onnx` es una conversión no oficial al formato ONNX del detector de objetos `dfine-m`, perteneciente a la familia DEIM (DETR with Improved Matching) desarrollada por Intellindust AI Lab. Se trata de un detector de estilo DETR con 300 queries, entrenado sobre el conjunto de datos COCO para el reconocimiento de 80 clases. El archivo ONNX exporta las salidas crudas del modelo (logits y cajas predichas) sin ningún tipo de postprocesado, dejando fuera del grafo las operaciones de NMS, sigmoid o redimensionado de imágenes. El repositorio tiene un peso de 0.1 GB y el archivo principal pesa 77,925,210 bytes.

La relevancia de esta conversión radica en su formato ONNX, que permite su ejecución en una amplia variedad de runtimes (ONNX Runtime, TensorRT, OpenVINO, etc.) y en entornos de navegador mediante `onnxruntime-web`. El autor de la conversión, AnnotateIt, ha validado la inferencia con ONNX Runtime CPU y con el runtime WASM, comparando numéricamente los resultados con el checkpoint oficial de PyTorch. El modelo original reporta un COCO AP de 52.7, aunque esta conversión no re-mide ese valor. La arquitectura DEIM se centra en mejorar el mecanismo de asignación de objetos en los DETR, logrando una convergencia más rápida y una mayor precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DEIM (DETR with Improved Matching), variante `dfine-m` |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (solo se ofrece el ONNX original en float32) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivo `.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DEIM, un marco de entrenamiento diseñado para mejorar el mecanismo de matching en los detectores DETR. La variante `dfine-m` corresponde a una de las configuraciones de tamaño medio de esta familia. El grafo ONNX exporta las salidas crudas del modelo, es decir, logits de clase y cajas predichas en formato `cxcywh` normalizado, sin aplicar sigmoid ni NMS. La entrada es una imagen `float32` de forma `[1, 3, 640, 640]` en formato NCHW, y el preprocesado esperado es un redimensionado a 640×640 (estirando la imagen), división por 255, sin normalización de media ni desviación estándar, y conversión a HWC→CHW.

El entrenamiento del modelo original se ha realizado sobre el conjunto COCO, pero no se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni técnicas como RLHF o DPO, ya que no son aplicables a un modelo de visión. La innovación principal de DEIM es la mejora del mecanismo de matching, que acelera la convergencia y mejora la precisión en comparación con DETR estándar.

## Capacidades

- Detección de objetos: detecta objetos de las 80 clases de COCO (índices 0 a 79) mediante predicción de cajas y logits por consulta.
- Salida sin postprocesado: proporciona logits y cajas normalizadas, dejando al usuario la implementación de sigmoid, NMS y umbral de confianza.
- Compatibilidad con ONNX Runtime: puede ejecutarse en CPU, GPU, y también en navegador mediante `onnxruntime-web` (WASM).
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso, ni soporte multilingüe, al ser un modelo de visión específico.

## Casos de uso

- **Detección de objetos en tiempo real en dispositivos edge**: gracias a su tamaño de 140 MB y su formato ONNX, puede desplegarse en dispositivos como Raspberry Pi o Jetson Nano usando ONNX Runtime, procesando imágenes de 640×640.
- **Integración en pipelines de visión por computador**: se puede combinar con módulos de tracking, clasificación o segmentación, ya que la salida es fácilmente manipulable (logits y cajas normalizadas).
- **Anotación automática de imágenes en herramientas de etiquetado**: AnnotateIt lo utiliza en su plataforma para anotación privada en el dispositivo, ejecutando el modelo en el navegador con `onnxruntime-web`.
- **Prototipado rápido en investigación**: al ser un modelo de una sola entrada y salida, es sencillo de integrar en scripts de prueba con OpenCV o PIL para evaluar la detección en imágenes personalizadas.
- **Sistemas de vigilancia y monitoreo**: puede utilizarse para detectar personas, vehículos u otros objetos en flujos de vídeo, siempre que se gestione el postprocesamiento externo.
- **Evaluación comparativa de modelos DETR**: sirve como referencia para comparar el rendimiento de `dfine-m` con otros detectores de la misma familia (por ejemplo, `dfine-nano`, `dfine-x`) en términos de precisión y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato es el COCO AP de 52.7 reportado por el autor original del modelo, pero no ha sido re-medido en esta conversión.

| Métrica | Valor |
|---|---|
| COCO AP (reportado por el autor original) | 52.7 |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información. Dado el tamaño del archivo (77.9 MB), se estima que la inferencia en GPU requiere alrededor de 1-2 GB de VRAM para batch 1, pero este dato no está confirmado.
- **GPU recomendadas**: puede ejecutarse en cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 2060, RTX 4090, A100). También es ejecutable en CPU.
- **Compatibilidad con GPU consumer**: sí, cabe en la mayoría de las GPUs de consumo actuales.
- **Opciones de despliegue**: ONNX Runtime (CPU/GPU), `onnxruntime-web` (WASM), TensorRT (tras conversión), OpenVINO, etc.
- **Latencia y throughput**: no disponibles. Dependen del hardware y de la implementación del postprocesamiento.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada. Se sabe que existen otras conversiones de la familia `dfine` en Hugging Face (por ejemplo, `AnnotateIt/dfine-nano-coco-onnx` y `onnx-community/dfine_x_coco-ONNX`), pero no se proporcionan datos de rendimiento o especificaciones para realizar una comparación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Conversión no oficial**: no está respaldada por los autores originales de DEIM; puede haber diferencias numéricas menores respecto al checkpoint oficial.
- **Sin postprocesamiento**: el usuario debe implementar sigmoid, NMS y la conversión de coordenadas `cxcywh` a formato de imagen. También debe aplicar el preprocesamiento de entrada especificado (resize a 640×640 y división por 255).
- **Solo COCO**: el modelo detecta únicamente las 80 clases de COCO; no es generalizable a otras categorías sin reentrenamiento.
- **Sesgo del dataset**: al estar entrenado sobre COCO, puede tener sesgos inherentes a las imágenes y categorías de ese conjunto de datos.
- **Riesgo de falsos positivos**: si el umbral de confianza es bajo, puede generar detecciones erróneas. No se ha validado su comportamiento en dominios fuera de COCO.
- **Licencia**: Apache-2.0 permite uso comercial, pero se recomienda revisar el repositorio upstream para verificar posibles restricciones adicionales.

## Enlaces

- [Hugging Face del modelo](https://huggingface.co/AnnotateIt/deim-dfine-m-coco-onnx)
- [Repositorio DEIM (Intellindust AI Lab)](https://github.com/Intellindust-AI-Lab/DEIM)
- [ONNX Model Zoo (referencia general)](https://github.com/onnx/models)
- [AnnotateIt AI - plataforma de anotación](https://annotateit.ai/)
- [Conversión similar: AnnotateIt/dfine-nano-coco-onnx](https://huggingface.co/AnnotateIt/dfine-nano-coco-onnx)
- [Conversión similar: onnx-community/dfine_x_coco-ONNX](https://huggingface.co/onnx-community/dfine_x_coco-ONNX)
