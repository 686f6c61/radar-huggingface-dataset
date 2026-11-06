# RuiSumida/ArcFace-R100-CoreML

## Resumen

ArcFace-R100-CoreML es una conversión a CoreML del modelo de reconocimiento facial ArcFace LResNet100E-IR, originalmente distribuido en formato ONNX dentro del ONNX Model Zoo. Lo publica el usuario RuiSumida en Hugging Face y su propósito es ejecutar extracción de embeddings faciales directamente en dispositivos Apple, sin depender de un servidor. El modelo transforma una imagen facial de 112x112 píxeles en un vector de 512 dimensiones que puede compararse por similitud coseno para verificar identidad.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo generativo, sino de un extractor de características visuales para tareas de verificación 1:1 e identificación 1:N. Su interés práctico reside en el formato de despliegue (CoreML en fp16, compatible con iOS 17 en adelante) y en la licencia Apache-2.0, que permite uso comercial sin restricciones adicionales.

La información publicada por el autor es muy limitada: no hay datos de benchmarks, no se especifican idiomas (no aplica, al ser un modelo de visión) y el repositorio tiene 0 descargas y 0 likes en el momento de la consulta. Todo lo que sigue se basa exclusivamente en la model card y en los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ResNet de 100 capas con variante IR (LResNet100E-IR), entrenada con pérdida ArcFace |
| Parametros totales | no disponible (el repositorio ocupa 0.2 GB en fp16, lo que sugiere del orden de decenas de millones de parámetros, pero el dato no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 112x112 píxeles) |
| Tipos de cuantizacion | fp16 (único formato publicado) |
| Idiomas soportados | no aplica (modelo de reconocimiento facial, sin componente textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | CoreML `.mlpackage` empaquetado como `.mlpackage.tar.gz` (mlprogram, fp16); origen ONNX |

## Arquitectura y entrenamiento

El modelo subyacente es un LResNet100E-IR, una red residual convolucional de 100 capas con la variante "IR" (improved residual) empleada habitualmente en la literatura de reconocimiento facial. La función de pérdida es ArcFace, que añade un margen angular aditivo a la softmax para mejorar la separabilidad entre identidades. La entrada es una imagen RGB de 112x112 píxeles con píxeles en rango 0-255, y la normalización por lotes se aplica en la entrada del grafo. La salida es un embedding de 512 dimensiones que debe normalizarse L2 antes de calcular similitudes.

El entrenamiento original no se documenta en esta ficha: el autor solo indica que parte de `arcfaceresnet100-8.onnx` del ONNX Model Zoo (Apache-2.0). La conversión se realizó mediante la cadena onnx (opset 8 a 13) → onnx2torch → coremltools, generando un modelo mlprogram en fp16. El autor afirma haber verificado la paridad numérica frente a onnxruntime con similitud coseno de 1.0 sobre caras reales, lo que indica que la cuantización a fp16 no degrada la salida de forma medible en sus pruebas.

## Capacidades

- Extracción de embeddings faciales de 512 dimensiones a partir de imágenes de 112x112 píxeles.
- Verificación de identidad 1:1 mediante similitud coseno entre embeddings.
- Identificación 1:N comparando el embedding de consulta contra una galería indexada.
- Ejecución en dispositivo (on-device) en iOS 17 o superior gracias al formato CoreML mlprogram.
- Entrada con píxeles crudos 0-255 y normalización por lotes integrada en el grafo, lo que simplifica el preprocesado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo thinking, visión general, audio ni capacidades multimodales más allá del rostro.
- No es un modelo multilingüe: no procesa lenguaje.

## Casos de uso

- Desbloqueo biometrico en apps iOS: el modelo se integra como mlpackage en una app Swift y genera el embedding del rostro capturado por la cámara; se compara contra el embedding enrolado almacenado en el Keychain. La latencia es baja por ejecutarse en la Neural Engine y no requiere red.
- Verificacion de identidad en procesos KYC: en una app de onboarding se captura una selfie y se compara 1:1 contra la foto del documento; el embedding de 512 dimensiones y la similitud coseno permiten fijar un umbral operativo y registrar la puntuación.
- Control de acceso fisico en dispositivos Apple: un iPad o un iPhone montado en un torno o puerta ejecuta el modelo localmente para reconocer empleados registrados, sin enviar imágenes a la nube y sin coste de inferencia por llamada.
- Etiquetado y agrupacion de fotos en la biblioteca del usuario: se calculan embeddings de los rostros detectados en las fotos y se agrupan por similitud para sugerir personas, todo en el dispositivo, lo que evita problemas de privacidad y de cumplimiento del RGPD.
- Deduplicacion de rostros en un pipeline de anotacion offline: en macOS se procesa un lote de imágenes con CoreML y se agrupan las detecciones para reducir el trabajo manual de revisión en un conjunto de datos.
- Pruebas de regresion de pipelines de vision: al mantener paridad numérica con onnxruntime (coseno 1.0 según el autor), el modelo sirve como referencia para validar que una conversión o un preprocesado alternativo no altera los embeddings.
- Prototipado rapido en Apple Silicon: un desarrollador puede evaluar la viabilidad de un producto de reconocimiento facial sin montar infraestructura de servidor, usando coremltools y el propio Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara la verificación de paridad numérica frente a onnxruntime (similitud coseno de 1.0 sobre caras reales), sin métricas de precisión como LFW, CFP-FP, AgeDB ni similares.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; al ser CoreML, se ejecuta en memoria unificada en Apple Silicon y en la Neural Engine o GPU del dispositivo. El repositorio pesa 0.2 GB en fp16, por lo que la huella en memoria es del orden de cientos de megabytes.
- GPU recomendadas: no aplica; el destino son chips Apple (A-series y M-series) con Neural Engine. Para el modelo ONNX original se podría usar cualquier GPU NVIDIA, pero esta conversión está pensada para CoreML.
- Cabe en hardware de consumo: sí, en cualquier iPhone o iPad compatible con iOS 17 y en Macs con Apple Silicon.
- Opciones de despliegue: CoreML (mlprogram) mediante coremltools, Vision framework o ejecución directa en Swift; el ONNX original se puede ejecutar con onnxruntime si se prefiere otro entorno.
- Latencia y throughput: no disponibles. No se publican cifras de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArcFace-R100-CoreML (este) | no disponible | 112x112 píxeles, salida 512-d | sin benchmarks publicados; paridad coseno 1.0 vs onnxruntime según el autor | Apache-2.0 | Hugging Face, 0 descargas |
| ArcFace LResNet100E-IR (ONNX Model Zoo) | no disponible en la información | 112x112 píxeles, salida 512-d | referencia del ONNX Model Zoo; sin métricas en esta ficha | Apache-2.0 | GitHub onnx/models |
| Otros modelos de reconocimiento facial (p. ej. FaceNet, ArcFace con distintos backbones) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluación de sesgo por género, edad, etnia o condiciones de iluminación. Los modelos ArcFace entrenados con datasets públicos suelen mostrar diferencias de precisión entre demografías, pero no hay datos específicos de esta conversión.
- Alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la verificación; el umbral de similitud coseno debe calibrarse con datos propios.
- Contexto e idioma: no aplica; el modelo no procesa texto. La entrada está fijada a 112x112 píxeles, por lo que requiere un detector de rostros y un alineamiento previos.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia. Conviene verificar la licencia del modelo ONNX de origen y de los datos de entrenamiento originales, que no se detallan aquí.
- Producción: el autor solo publica fp16 y no ofrece variantes int8 ni fp32; no hay métricas de latencia ni de precisión en dispositivos concretos. El paquete se distribuye como `.mlpackage.tar.gz` porque los modelos mlprogram no se pueden enviar como un único `.mlmodel`, lo que añade un paso de compilación en el dispositivo.
- Privacidad y cumplimiento: el reconocimiento facial está sujeto al RGPD y a la normativa europea de IA; el uso en espacios públicos o para identificación biométrica remota requiere base legal y evaluación de impacto.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública; el soporte del autor es incierto.

## Enlaces

- Hugging Face: https://huggingface.co/RuiSumida/ArcFace-R100-CoreML
- Modelo ONNX de origen (ONNX Model Zoo): https://github.com/onnx/models/tree/main/validated/vision/body_analysis/arcface
- coremltools (herramienta de conversión): https://github.com/apple/coremltools
- onnx2torch (herramienta de conversión): https://github.com/ENOT-AutoDL/onnx2torch
