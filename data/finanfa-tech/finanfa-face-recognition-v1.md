# finanfa-tech/finanfa-face-recognition-v1

## Resumen

Finanfa Face Recognition v1 es un modelo de extracción de características faciales biométricas desarrollado por Finanfa Tech. A partir de un rostro previamente detectado y alineado a 112 × 112 píxeles, genera un vector de embedding normalizado L2 de 512 dimensiones que representa la morfología de la persona. El modelo se distribuye en formato ONNX (FP32) con un tamaño aproximado de 166 MB, lo que facilita su despliegue en entornos de inferencia sin dependencias de frameworks de deep learning pesados.

La arquitectura subyacente es una ResNet-50 entrenada con la función de pérdida ArcFace (Additive Angular Margin), una técnica estándar en reconocimiento facial que maximiza la separación angular entre identidades distintas. El modelo está pensado para verificación de identidad 1:1 e identificación 1:N a gran escala, y forma parte de un ecosistema biométrico junto con un detector facial del mismo autor (`finanfa-tech/finanfa-face-detector-v1`).

Su relevancia radica en la combinación de licencia permisiva (Apache 2.0), formato ONNX listo para producción y un embedding compacto de 512 dimensiones, lo que lo hace adecuado para pipelines biométricos que requieren baja latencia y despliegue en CPU o GPU sin infraestructura especializada. La model card declara soporte para los idiomas francés e inglés, si bien se trata de un modelo de visión y no de procesamiento de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 con ArcFace (Additive Angular Margin) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP32 (formato ONNX distribuido); no se documentan otras precisiones |
| Idiomas soportados | francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32) |
| Dimension de embedding | 512 (vector flotante normalizado L2) |
| Resolucion de entrada | 112 × 112 píxeles (RGB normalizado) |
| Metrica de comparacion | similitud coseno ([-1, 1]) o distancia euclidiana |
| Umbral recomendado | similitud coseno > 0.45 para confirmación de identidad |
| Tamano del archivo | ~166 MB |

## Arquitectura y entrenamiento

El modelo emplea una red ResNet-50 como extractor de características, entrenada con la pérdida ArcFace. ArcFace introduce un margen angular aditivo en el espacio de embeddings, lo que fuerza una mayor separación entre clases (identidades) y mejora la discriminación en tareas de verificación e identificación facial. La salida es un vector de 512 dimensiones que se normaliza L2 antes de la comparación, de modo que la similitud coseno entre dos embeddings actúa como puntuación de parecido.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de aumento de datos, destilación o ajuste fino posteriores. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo. La model card menciona que el embedding es insensible a variaciones moderadas de ángulo, edad o iluminación, pero no se aportan métricas que respalden cuantitativamente esta afirmación.

## Capacidades

- Extracción de embeddings faciales de 512 dimensiones a partir de rostros alineados de 112 × 112 píxeles.
- Verificación de identidad 1:1 mediante similitud coseno o distancia euclidiana.
- Identificación 1:N a gran escala mediante búsqueda de vecinos más cercanos en el espacio de embeddings.
- Robustez declarada frente a variaciones moderadas de pose, edad e iluminación.
- Inferencia en CPU mediante ONNX Runtime (`CPUExecutionProvider`), sin necesidad de GPU.
- Integración con el detector facial del mismo autor para pipelines completos de detección y reconocimiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de visión.
- No dispone de modo thinking, visión general, audio ni capacidades multilingües en sentido lingüístico.

## Casos de uso

- Verificación de identidad en onboarding digital: el modelo compara la selfie del usuario con la fotografía de un documento de identidad, usando el umbral de similitud coseno > 0.45 como criterio de confirmación. Es adecuado por su formato ONNX y su baja exigencia de recursos.
- Control de acceso físico: integrado con el detector `finanfa-face-detector-v1`, permite autenticar empleados en tornos o puertas comparando el embedding en vivo contra una base de embeddings registrados.
- Identificación 1:N en bases de datos biométricas: gracias al embedding compacto de 512 dimensiones, se puede indexar un gran número de identidades y realizar búsquedas por vecino más cercano con latencia reducida.
- Autenticación en aplicaciones móviles o de escritorio: al ejecutarse en CPU con ONNX Runtime, puede desplegarse en dispositivos sin GPU dedicada, lo que facilita la verificación local sin enviar datos biométricos a un servidor.
- Deduplicación de registros de clientes: en sistemas CRM o bases de datos de usuarios, permite detectar cuentas duplicadas comparando embeddings faciales almacenados.
- Kioscos de atención al cliente o check-in en eventos: combinado con un detector facial, permite reconocer a usuarios registrados y personalizar la interacción sin intervención manual.
- Moderación y análisis forense de imágenes: extracción de embeddings para agrupar o comparar rostros en conjuntos de imágenes, siempre con las cautelas legales correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en GPU, el modelo FP32 de ~166 MB requiere menos de 1 GB de VRAM para el modelo en sí, más el overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte CUDA compatible con ONNX Runtime (por ejemplo, RTX 3060, RTX 4090, A100, H100); el modelo es lo suficientemente pequeño como para no requerir hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con al menos 1-2 GB de VRAM libre.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con posibilidad de integración en servicios Python mediante `onnxruntime` y `huggingface_hub` para la descarga del modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Embedding | Contexto / entrada | Licencia | Formato |
|---|---|---|---|---|---|
| Finanfa Face Recognition v1 | ResNet-50 + ArcFace | 512 | 112 × 112 píxeles | Apache 2.0 | ONNX |
| Arc2Face / ArcFace estándar (referencia) | ResNet + ArcFace | 512 | 112 × 112 píxeles | Varía según implementación | PyTorch / ONNX |
| FaceNet | Inception-ResNet | 128 / 512 | 160 × 160 píxeles | Varía según implementación | TensorFlow / ONNX |

No se dispone de datos de rendimiento comparativo (precisión, TAR/FAR) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se han publicado métricas de precisión, tasas de falsos positivos/negativos ni evaluaciones sobre datasets de referencia, lo que impide validar el rendimiento real del modelo.
- El modelo requiere rostros previamente detectados y alineados a 112 × 112 píxeles; no incluye detección ni alineamiento por sí mismo.
- El umbral recomendado de similitud coseno > 0.45 es una indicación del autor y no está respaldado por curvas ROC ni por una evaluación independiente.
- Riesgo de sesgo demográfico: no se documenta la composición del dataset de entrenamiento, por lo que no puede descartarse un rendimiento desigual entre grupos étnicos, de género o de edad.
- Los sistemas biométricos faciales están sujetos a regulación específica (RGPD en la UE, BIPA en Illinois, etc.); su uso en producción requiere base legal, evaluación de impacto y consentimiento.
- La licencia Apache 2.0 permite uso comercial, pero no exime del cumplimiento normativo en materia de datos biométricos.
- El modelo declara soporte para francés e inglés, pero al ser un modelo de visión esta etiqueta no implica capacidades lingüísticas reales.
- No se documentan limitaciones específicas de contexto ni de idioma más allá de las inherentes a un modelo de visión.

## Enlaces

- Hugging Face: https://huggingface.co/finanfa-tech/finanfa-face-recognition-v1
- Detector facial del mismo autor: https://huggingface.co/finanfa-tech/finanfa-face-detector-v1
