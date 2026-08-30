# Japhari/tz-alpr-ocr

## Resumen

El modelo `tz-alpr-ocr` es un sistema de reconocimiento óptico de caracteres (OCR) específico para matrículas de Tanzania, desarrollado por Japhari. Está basado en una arquitectura CRNN (Convolutional Recurrent Neural Network) con decodificación CTC (Connectionist Temporal Classification). La entrada es una imagen en escala de grises de dimensiones fijas 1×32×256 píxeles, y la salida es una secuencia CTC sobre el conjunto de caracteres formado por dígitos y letras de la A a la Z. El repositorio incluye además un detector de placas basado en YOLOv11-nano y un archivo de calibración de confianza mediante Platt scaling.

El modelo está pensado para aplicaciones de control de aparcamiento y vigilancia de reservas viales en Tanzania, donde las matrículas de motocicletas y bajaji (triciclos) de dos líneas se procesan previamente para separar las líneas antes del OCR. Con un tamaño de repositorio de 0,1 GB y licencia Apache 2.0, es un modelo ligero y de código abierto. Su relevancia radica en ofrecer una solución específica para un contexto geográfico concreto, aunque sus métricas de rendimiento en condiciones difíciles son limitadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRNN (CNN + RNN) con decodificación CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija 1×32×256) |
| Tipos de cuantizacion | no disponible (solo se proporciona state_dict en PyTorch) |
| Idiomas soportados | en (inglés; el modelo reconoce caracteres alfanuméricos) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt); se menciona ONNX en las etiquetas pero no se incluye archivo ONNX en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es una CRNN estándar para OCR: una red convolucional extrae características de la imagen de entrada (1×32×256), que luego se pasan a una red recurrente (típicamente LSTM o GRU) para modelar secuencias, y finalmente una capa de clasificación produce una distribución sobre el alfabeto (37 clases: 10 dígitos + 26 letras + blank de CTC). La decodificación CTC permite entrenar sin segmentación carácter a carácter.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de épocas, ni si se utilizaron técnicas como RLHF o DPO. El repositorio incluye un detector de placas YOLOv11-nano (`plate_yolo.pt`) y un archivo de calibración de confianza (`confidence_calibration.json`) que aplica Platt scaling a las puntuaciones de salida. Los archivos de configuración (`config.json`, `ocr.yaml`, `tanzania.yaml`) definen la arquitectura y las reglas específicas del país.

## Capacidades

- Reconocimiento de matrículas de Tanzania: identifica secuencias de dígitos y letras (A-Z) a partir de recortes de placa en escala de grises.
- Entrada de imagen fija: acepta imágenes de 1×32×256 píxeles, lo que requiere un preprocesamiento de redimensionado y normalización.
- Salida de secuencia CTC: genera la transcripción de caracteres sin necesidad de segmentación previa.
- Detección de placas integrada: incluye un detector YOLOv11-nano para localizar placas en imágenes completas.
- Calibración de confianza: proporciona un mecanismo de Platt scaling para ajustar las puntuaciones de probabilidad.
- Soporte para matrículas de dos líneas: el sistema está diseñado para procesar placas de motocicletas y bajaji tras separar las líneas.

No dispone de capacidades de tool calling, razonamiento multi-paso, ni soporte multilingüe más allá de los caracteres alfanuméricos.

## Casos de uso

- Control de aparcamiento en Tanzania: el modelo puede integrarse en sistemas de cámaras para verificar automáticamente si un vehículo tiene permiso de estacionamiento en zonas reguladas, reduciendo la necesidad de inspección manual.
- Vigilancia de reservas viales: permite detectar vehículos que invaden carriles reservados (por ejemplo, para autobuses o emergencias) mediante la lectura de matrículas en tiempo real.
- Automatización de multas de tráfico: al capturar la matrícula de un vehículo infractor, el sistema puede generar automáticamente una notificación de sanción, agilizando el proceso administrativo.
- Control de acceso a zonas restringidas: en aparcamientos privados o recintos con acceso limitado, el OCR de matrículas permite abrir barreras solo a vehículos autorizados.
- Verificación en peajes: el modelo puede leer matrículas en cabinas de peaje para facturación automática o control de paso.
- Integración con sistemas de videovigilancia: combinado con el detector YOLOv11-nano, puede procesar flujos de vídeo para registrar la entrada y salida de vehículos en un área determinada.

## Benchmarks y rendimiento

La model card reporta métricas sobre un conjunto de evaluación reservado (held-out) con fecha 2026-08-30:

| Split | Exact match | Char acc | CER | n |
|---|---|---|---|---|
| test | 73,8% | 88,9% | 11,1% | 1.808 |
| hard_test | 9,4% | 37,9% | 62,1% | 1.084 |

No se han publicado comparaciones con otros modelos ALPR en la información disponible. El rendimiento en el conjunto `hard_test` es notablemente bajo, lo que indica dificultades con placas en condiciones adversas (iluminación, ángulo, desenfoque, etc.).

## Requisitos de hardware

No se proporcionan datos oficiales sobre requisitos de hardware. Dado el tamaño del repositorio (0,1 GB) y la arquitectura CRNN ligera, es razonable esperar que el modelo pueda ejecutarse en CPU sin problemas, aunque no se especifica VRAM ni latencia. Para inferencia en producción, se puede utilizar:

- PyTorch con CPU o GPU (por ejemplo, una NVIDIA T4 o superior).
- Conversión a ONNX para despliegue con TensorRT u otros motores de inferencia.
- Integración con frameworks de servicio como TorchServe o FastAPI.

No se dispone de estimaciones de throughput ni latencia.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de reconocimiento de matrículas como OpenALPR o fast-alpr. El modelo está especializado en matrículas de Tanzania, mientras que las alternativas generalistas suelen cubrir múltiples países. No se pueden establecer comparaciones cuantitativas sin datos adicionales.

## Limitaciones y advertencias

- El rendimiento en condiciones diurnas no alcanza el objetivo del 95% de exact match, según la model card.
- El conjunto `hard_test` muestra un rendimiento muy pobre (9,4% exact match), lo que sugiere que el modelo falla en situaciones de baja calidad de imagen o placas difíciles.
- Se recomienda revisar manualmente las lecturas con una confianza inferior a 0,90.
- El modelo está entrenado exclusivamente para matrículas de Tanzania; no es generalizable a otros formatos de placas.
- La entrada requiere un preprocesamiento específico (imagen en escala de grises de 1×32×256), lo que puede ser un cuello de botella en pipelines de vídeo.
- No se han documentado sesgos específicos, pero al estar limitado a un contexto geográfico y a un conjunto de caracteres concreto, puede fallar con variaciones de fuente o estilos de matrícula no vistos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de precisión ni soporte.

## Enlaces

- [HuggingFace - Japhari/tz-alpr-ocr](https://huggingface.co/Japhari/tz-alpr-ocr)
- [GitHub - stg-gov/tz-plates](https://github.com/stg-gov/tz-plates)
- [Perfil del autor en HuggingFace](https://huggingface.co/Japhari)
