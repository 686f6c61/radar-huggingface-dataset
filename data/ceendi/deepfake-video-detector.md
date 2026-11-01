# Ceendi/deepfake-video-detector

## Resumen

DeepfakeDetector es un modelo de clasificación de vídeo diseñado para detectar caras manipuladas mediante técnicas de deepfake. Lo desarrolla Ceendi como parte de un proyecto de diploma, y se publica en HuggingFace como un conjunto de artefactos ONNX más un checkpoint de PyTorch Lightning. El modelo resuelve un problema concreto: dada una secuencia de fotogramas de una cara, clasificarla como REAL o FAKE, devolviendo un logit que puede umbralizarse.

La arquitectura combina un extractor espacial EfficientNet-B4 (preentrenado en ImageNet vía `timm`) con una Bi-LSTM con atención sobre 16 fotogramas alineados de 224×224 píxeles. El resultado es un detector ligero (repo de 0,3 GB) que cabe en entornos de inferencia modestos y que se distribuye en formato ONNX para facilitar su despliegue sin depender de PyTorch.

Es relevante ahora por la proliferación de vídeos sintéticos y la necesidad de herramientas de verificación accesibles. No obstante, su licencia es exclusivamente de investigación y educación, y el propio autor advierte que solo analiza la cara más grande en 16 fotogramas muestreados, con generalización limitada a otros generadores y a vídeo muy comprimido o de baja resolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B4 (espacial) + Bi-LSTM con atención (temporal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana fija de 16 fotogramas |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, cuantización no documentada) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | research-only (other) |
| Formato de pesos | ONNX (`backbone.onnx`, `temporal.onnx`) y checkpoint PyTorch Lightning (`last.ckpt`) |

## Arquitectura y entrenamiento

El modelo es un clasificador binario de vídeo con dos etapas. La primera, `backbone.onnx`, es una EfficientNet-B4 que extrae características espaciales de 16 recortes de cara alineados de 224×224 píxeles. La segunda, `temporal.onnx`, es una Bi-LSTM con atención que procesa la secuencia de 16 vectores de características y devuelve el logit de FAKE. El checkpoint `last.ckpt` se usa únicamente para extraer los pesos de atención y generar mapas de calor HiResCAM, no para la inferencia principal.

El entrenamiento se realizó sobre FaceForensics++ en calidad c23. El backbone parte de pesos ImageNet de `timm`. No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF/DPO (no aplicable a un clasificador de visión). El preprocesado, los umbrales y el código de inferencia residen en el directorio `video-detector/` del repositorio de GitHub, y el detector descarga los archivos desde un commit fijado, verificando su SHA-256 mediante `video-detector/models.toml`.

## Capacidades

- Clasificación binaria de vídeo de caras en REAL o FAKE mediante un logit.
- Extracción de características espaciales con EfficientNet-B4 sobre 16 fotogramas alineados.
- Modelado temporal de la secuencia de 16 fotogramas mediante Bi-LSTM con atención.
- Generación de mapas de calor HiResCAM para interpretabilidad (requiere `last.ckpt`).
- Inferencia vía ONNX, sin dependencia de PyTorch en producción.
- Verificación de integridad de pesos mediante SHA-256 en el flujo de descarga.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa audio ni texto; es exclusivamente visión sobre vídeo.

## Casos de uso

- Moderación de contenido en plataformas: integrado como señal previa a revisión humana, el modelo clasifica caras en vídeos subidos y marca posibles deepfakes para verificación manual, aprovechando su formato ONNX para despliegue en servicios de inferencia.
- Verificación periodística: un redactor puede pasar un vídeo sospechoso por el detector y usar los mapas HiResCAM para identificar regiones faciales anómalas antes de publicar.
- Investigación académica en detección de deepfakes: sirve como línea base reproducible sobre FaceForensics++ c23, con pesos y umbrales documentados en el repositorio.
- Formación y docencia: proyecto de diploma con pipeline completo (preprocesado, inferencia, interpretabilidad) útil para enseñar clasificación de vídeo y despliegue ONNX.
- Filtro en pipelines de ingestión de vídeo: al ser ligero (0,3 GB) y ejecutarse en ONNX, puede colocarse como etapa de cribado antes de modelos más costosos.
- Análisis forense preliminar: como señal orientativa en investigaciones, siempre acompañada de peritaje humano, dado que el autor advierte que la salida no es prueba.
- Auditoría de conjuntos de datos: detección de muestras potencialmente sintéticas en corpus de vídeo antes de usarlos en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 0,3 GB y el backbone es EfficientNet-B4, por lo que se espera un consumo moderado, pero no se documentan cifras.
- GPU recomendadas: no disponible; por el tamaño del backbone, una GPU consumer moderna sería suficiente, pero no hay datos publicados.
- ¿Cabe en GPU consumer?: previsiblemente sí, dado el tamaño del repo y la arquitectura, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime (formato nativo del modelo); el checkpoint `last.ckpt` requiere PyTorch Lightning para interpretabilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Solo analiza la cara más grande en 16 fotogramas muestreados; caras pequeñas o múltiples quedan fuera.
- Entrenado únicamente en FaceForensics++ c23; generaliza peor a otros generadores de deepfake.
- Rendimiento degradado en vídeo muy comprimido o de baja resolución.
- La salida debe tratarse como una señal, no como prueba concluyente.
- Licencia research-only: prohibido el uso comercial, siguiendo los términos de los datos de entrenamiento.
- Riesgo de falsos positivos y falsos negativos no cuantificado en la información disponible.
- No se documentan sesgos demográficos, pero al entrenar solo con FaceForensics++ pueden existir sesgos no evaluados.
- Dependencia de un commit fijado y verificación SHA-256; cambios en el repo pueden romper el flujo de descarga si no se actualiza `models.toml`.
- Sin soporte de audio, texto ni razonamiento multi-paso.

## Enlaces

- HuggingFace: https://huggingface.co/Ceendi/deepfake-video-detector
- Repositorio GitHub: https://github.com/Ceendi/Deepfake-Detector
- Dataset de entrenamiento (FaceForensics++): no se proporciona enlace directo en la información disponible.
