# depreciation84/comic-text-and-bubble-detector-int8

## Resumen

`depreciation84/comic-text-and-bubble-detector-int8` es una versión cuantizada a int8 del detector de bocadillos de diálogo y texto en viñetas de cómic `ogkalu/comic-text-and-bubble-detector`. El modelo original es un detector de objetos basado en la arquitectura RT-DETR (Real-Time Detection Transformer) que localiza tres clases de elementos en páginas de cómic, manga o webtoon: bocadillos de diálogo (`bubble`), texto dentro de bocadillos (`text_bubble`) y texto libre fuera de bocadillos (`text_free`).

La modificación la firma el usuario `depreciation84` (identificado como Team.R en la model card) y consiste exclusivamente en una cuantización estática de los operadores `Conv` a int8 mediante ONNX Runtime, manteniendo el resto de operadores (incluidos los `MatMul` del decodificador transformer) en fp32. La arquitectura, las entradas y las salidas no cambian respecto al modelo original. El propósito declarado es servir al modo de "detección precisa" de la aplicación Android ToonLens, orientada a traducción de cómics.

El resultado es un fichero ONNX de 67,1 MB frente a los 168,5 MB del original, con una reducción de latencia de aproximadamente 2,4 veces en CPU y 2,4 veces en un dispositivo móvil (Galaxy Z Fold7), manteniendo el mismo número de detecciones correctas sobre el conjunto de prueba del autor. Es relevante para desarrolladores que necesiten ejecutar detección de bocadillos en dispositivos con recursos limitados o en pipelines de procesamiento por lotes donde el coste computacional importa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR (Real-Time Detection Transformer); transformer con backbone convolucional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 640×640) |
| Tipos de cuantizacion | int8 estática (QDQ) solo en operadores `Conv`; activaciones `QUInt8`, pesos `QInt8`, `per_channel=True`; resto de operadores en fp32 |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`detector_rtdetr_int8c.onnx`, 67.055.821 bytes) |

## Arquitectura y entrenamiento

El modelo es una instancia de RT-DETR, un detector de objetos end-to-end que combina un backbone convolucional con un codificador y decodificador transformer. La salida es un conjunto fijo de 300 consultas, cada una con etiqueta de clase, caja delimitadora en píxeles de la imagen original y puntuación de confianza. Las tres clases son `bubble` (0), `text_bubble` (1) y `text_free` (2). La entrada es un tensor RGB de 640×640 con valores normalizados a 0–1, junto con un tensor `orig_target_sizes` que permite reescalar las cajas a las dimensiones originales de la página.

No se ha entrenado ni fine-tuneado ningún peso en esta versión: la model card indica explícitamente que Team.R solo realizó la cuantización. El proceso consistió en `quant_pre_process(..., skip_symbolic_shape=True)` seguido de `quantize_static` con `QuantFormat.QDQ` y `op_types_to_quantize=["Conv"]`, usando 21 imágenes sintéticas de cómic generadas por el propio autor como conjunto de calibración. Se probó también cuantizar los operadores `MatMul` del decodificador, pero degradaba la puntuación de los bocadillos pequeños, por lo que se mantuvieron en fp32. La cuantización se ejecutó con ONNX Runtime 1.30 el 26 de octubre de 2026.

## Capacidades

- Detección de objetos en imágenes de cómic, manga y webtoon con tres clases: bocadillo de diálogo, texto dentro de bocadillo y texto libre.
- Localización de hasta 300 instancias por imagen con cajas en píxeles de la imagen original y puntuación de confianza entre 0 y 1.
- Procesamiento de páginas completas reescaladas a 640×640 (redimensionado bilineal, sin letterbox).
- Inferencia en CPU y en dispositivos móviles Android mediante ONNX Runtime.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de visión.
- No tiene capacidades multilingües ni de generación de texto; el reconocimiento de texto (OCR) queda fuera del alcance del modelo.

## Casos de uso

- Traducción automática de cómics y manga en dispositivos móviles: la aplicación ToonLens descarga este fichero para su modo de "detección precisa" y lo usa para localizar bocadillos antes de aplicar OCR y traducción. El tamaño reducido (67 MB) y la latencia de 802 ms en un Galaxy Z Fold7 lo hacen viable en un flujo interactivo por página.
- Digitalización y catalogación de archivos de cómic: un pipeline por lotes puede procesar miles de páginas en CPU con un coste de 455 ms por página en un i5-1335U a 4 hilos, extrayendo coordenadas de bocadillos y texto para indexación o re-maquetado.
- Preprocesado para OCR especializado: el detector aísla regiones de texto (`text_bubble` y `text_free`) que después se envían a un motor OCR, reduciendo el área a procesar y mejorando la precisión en páginas con ruido visual.
- Herramientas de accesibilidad para lectores con discapacidad visual: la detección de bocadillos permite ordenar espacialmente el texto de una página y generar una narración secuencial coherente.
- Edición y re-maquetado de webtoons: los desarrolladores pueden usar las cajas detectadas para recolocar o sustituir texto en flujos de localización sin intervención manual página a página.
- Investigación en análisis de documentos visuales: sirve como componente de referencia para experimentos de cuantización en detectores transformer, ya que el autor publica métricas comparativas fp32 frente a int8 sobre un conjunto mixto de 65 imágenes sintéticas y reales.

## Benchmarks y rendimiento

Los únicos datos publicados son las mediciones del propio autor de la cuantización (Team.R), no benchmarks estándar de detección (mAP, etc.). Se presentan tal cual:

| Modelo | Tamano | Tiempo en PC (i5-1335U, 4 hilos) | Tiempo en Galaxy Z Fold7 | Cajas de dialogo encontradas (65 imagenes) |
|---|---|---|---|---|
| Original fp32 | 168,5 MB | 837 ms | 1944 ms | 369 de 373 |
| Este fichero int8 | 67,1 MB | 455 ms | 802 ms | 369 de 373 |

El conjunto de prueba son 50 imágenes sintéticas y 15 páginas de cómic reales; las 15 páginas reales no se usaron para calibración. No se han publicado valores de mAP, precisión o recall por clase en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo es pequeño (67 MB en disco) y puede ejecutarse en CPU; en GPU el consumo es mínimo, del orden de unos pocos cientos de MB incluyendo buffers de activación para lotes pequeños.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutarlo con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en iGPU y en dispositivos móviles (validado en Galaxy Z Fold7).
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con soporte directo del fichero `detector_rtdetr_int8c.onnx`. No se mencionan exportaciones a otros formatos (TensorRT, OpenVINO) en la información disponible.
- Latencia y throughput estimados: 455 ms por imagen en CPU i5-1335U a 4 hilos y 802 ms en Galaxy Z Fold7, según las mediciones del autor. El throughput en GPU no está documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `depreciation84/comic-text-and-bubble-detector-int8` (este) | no disponible | 640×640 | 455 ms CPU / 802 ms movil; 369/373 cajas | Apache-2.0 | ONNX en HuggingFace |
| `ogkalu/comic-text-and-bubble-detector` (original fp32) | no disponible | 640×640 | 837 ms CPU / 1944 ms movil; 369/373 cajas | Apache-2.0 | ONNX en HuggingFace |
| Detectores de texto genéricos (p. ej. DBNet, EAST) | no disponible | variable | no disponible | variable | amplia |

No se dispone de datos de benchmarks comparativos con otros detectores de bocadillos de cómic en la información proporcionada.

## Limitaciones y advertencias

- La cuantización solo afecta a operadores `Conv`; los `MatMul` del decodificador siguen en fp32, por lo que la ganancia de tamaño y velocidad es parcial respecto a una cuantización completa.
- El conjunto de calibración son 21 imágenes sintéticas generadas por el autor, no páginas reales de cómic; esto puede introducir un sesgo de dominio frente a estilos de dibujo, idiomas o maquetaciones no representadas.
- La evaluación se hizo sobre 65 imágenes (50 sintéticas y 15 reales), un conjunto pequeño que no permite extraer conclusiones robustas de generalización.
- Riesgo de falsos negativos en bocadillos pequeños o con bajo contraste: el autor documenta que cuantizar los `MatMul` degradaba precisamente la puntuación de bocadillos pequeños, motivo por el que se mantuvieron en fp32.
- El modelo no realiza OCR ni traducción; solo detecta regiones. Cualquier flujo de traducción requiere un motor adicional.
- No hay información sobre sesgos por idioma o cultura visual del cómic, ni sobre el rendimiento en estilos no representados (cómic europeo, tiras de prensa, etc.).
- Licencia Apache-2.0 permite uso comercial, pero al ser una obra derivada debe conservarse el aviso de modificación de la sección 4(b) y la atribución al autor original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción más allá de la aplicación ToonLens del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/depreciation84/comic-text-and-bubble-detector-int8
- Modelo base original: https://huggingface.co/ogkalu/comic-text-and-bubble-detector
- Repositorio del modelo base (revisión citada): revisión `16e8a622f91fabc6b5b65c96d32d1183f8843546` del repositorio anterior
- ONNX Runtime (herramienta de cuantización): https://onnxruntime.ai/
- Aplicación ToonLens: no disponible enlace público en la información proporcionada.
