# halfmoon-mind/still-generative-detail-4x

## Resumen

GenerativeDetail4x es una conversión a Core ML del modelo AdcSR (Adversarial Diffusion Compression for Real-World Image Super-Resolution, CVPR 2025), una red de superresolución x4 de difusión de un solo paso desarrollada por el grupo Guaishou74851. El modelo original sintetiza textura fotográfica realista a partir de recortes de baja resolución, y esta versión lo empaqueta como un ML Program de Core ML con pesos int8 para ejecutarse en la Neural Engine de dispositivos Apple. La conversión la firma el usuario halfmoon-mind y se usa en la aplicación iOS *Still (한컷)* para recortes pequeños en condiciones de baja luminosidad, descargándose bajo demanda.

La relevancia de esta ficha es doble: por un lado documenta una técnica de compresión de modelos de difusión para superresolución en un solo paso; por otro, ilustra el patrón de despliegue en dispositivo (on-device) con cuantización int8, sharding de pesos y un pipeline de mosaico (tiling) con solapamiento. El paquete ocupa unos 0,5 GB en el repositorio y la inferencia medida en un iPhone 14 Pro (A16) es de aproximadamente 0,36-0,40 s por tesela de 128 px.

Es importante subrayar que el detalle generado es una predicción, no evidencia de detalle capturado: el modelo inventa textura plausible, lo que tiene implicaciones forenses y de fidelidad que se detallan en las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de difusión de un solo paso para superresolución x4 (destilada de OSEDiff), convertida a Core ML ML Program |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | int8 por canal simétrico (pesos); cómputo FP16 en Neural Engine; paquete FP16 de referencia |
| Idiomas soportados | no aplica (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | CreativeML Open RAIL++-M (modelo derivado); código y pesos originales de AdcSR bajo Apache 2.0 |
| Formato de pesos | `.mlpackage` (ML Program) con pesos int8 divididos en seis shards de menos de 80 MiB; `manifest.json` con tamaños y SHA-256 |

## Arquitectura y entrenamiento

AdcSR es una red de superresolución basada en difusión que ha sido destilada para operar en un solo paso, partiendo de OSEDiff (Apache 2.0). El modelo original se entrenó sobre el dataset LSDIR, y OSEDiff se entrenó a su vez sobre LSDIR y las primeras 10.000 imágenes de FFHQ. La conversión a Core ML fija una tesela de entrada de 128 px y produce una salida de 512 px (factor x4), con entrada `float32 [1, 3, 128, 128]` en RGB normalizado a `[-1, 1]` y salida `float32 [1, 3, 512, 512]` en un rango aproximado de `[-1, 1]`.

La innovación técnica de esta conversión es el tratamiento numérico para evitar desbordamientos en FP16: se multiplicó por 1/16 el flujo residual del decodificador VAE en `up_blocks[2:]`, lo que no altera la salida porque todos los lectores de ese flujo son GroupNorm (diferencia máxima en FP32 de 1/255). Esto evita un desbordamiento de 66.194 > 65.504 en el último bloque del decodificador. Los pesos se cuantizaron a int8 por canal simétrico, con una diferencia media de salida frente al paquete FP16 de 0,29-0,40/255 en la Neural Engine de Mac. El archivo de pesos se dividió en seis shards sin modificar ningún tensor. Los scripts de conversión se conservan en el repositorio de la app (`Tools/AdcSRStudy`).

## Capacidades

- Superresolución x4 de imágenes: transforma recortes de 128x128 px en salidas de 512x512 px.
- Restauración de imagen real: sintetiza textura fotográfica plausible en escenas degradadas o de baja resolución.
- Procesamiento por teselas: el pipeline recomendado usa teselas de 128 px con solapamiento de 32 px y mezcla con difuminado (feathered blending).
- Normalización por tesela: se debe igualar la media y desviación típica por canal de cada tesela de salida a la de su tesela de entrada, como en la inferencia oficial.
- Preprocesado para vídeo de baja luminosidad: requiere un desenfoque gaussiano previo de 0,9-1,2 px para evitar artefactos de borde de códec.
- Ejecución en dispositivo: ML Program para iOS 17+, cómputo FP16, pesos int8 cargados en la Neural Engine.
- Sin capacidades de texto, código, tool calling, agentes ni multilingüismo: es exclusivamente un modelo de imagen a imagen.

## Casos de uso

- Restauración de recortes en apps iOS: integración en la app *Still (한컷)* para mejorar recortes pequeños de baja luminosidad, descargando el paquete bajo demanda y ejecutándolo en la Neural Engine con latencia de 0,36-0,40 s por tesela.
- Mejora de fotos de baja resolución en el dispositivo: procesar imágenes antiguas o comprimidas en local, sin enviar datos a la nube, usando el pipeline de teselas con solapamiento de 32 px.
- Ampliación de miniaturas y avatares: generar versiones de 512x512 a partir de recortes de 128x128 para interfaces de usuario, apropiado por el tamaño reducido del paquete (0,5 GB) y la carga en memoria de la Neural Engine.
- Preprocesado para pipelines de visión: aumentar la resolución de parches antes de tareas posteriores (detección, segmentación) en entornos Apple, con la advertencia de que el detalle generado no es evidencia real.
- Restauración de fotogramas de vídeo de baja luminosidad: aplicar el desenfoque gaussiano de 0,9-1,2 px recomendado y procesar fotograma a fotograma, adecuado para clips cortos por el coste de 0,36-0,40 s por tesela.
- Prototipado e investigación en superresolución on-device: usar los scripts de conversión de `Tools/AdcSRStudy` para estudiar la cuantización int8 y el sharding de pesos en Core ML, con la salvedad de las restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta mediciones de latencia y fidelidad numérica de la conversión:

| Metrica | Valor |
|---|---|
| Latencia por tesela (iPhone 14 Pro, A16, iOS 18.4, Neural Engine) | 0,36-0,40 s |
| Tiempo de carga tras compilación en caché | 0,16 s |
| Tiempo de compilación inicial | aproximadamente 30 s |
| Diferencia media de salida int8 vs FP16 (Neural Engine de Mac) | 0,29-0,40/255 |
| Diferencia máxima FP32 tras el reescalado del decodificador | 1/255 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el paquete de pesos ocupa unos 0,5 GB en el repositorio y se ejecuta en la Neural Engine de Apple.
- GPU recomendadas: no aplica; el destino es la Neural Engine de chips Apple (A16 y posteriores según la medición). La ruta por GPU mantiene los pesos en memoria del proceso y no se recomienda.
- Cabe en dispositivos consumer Apple: sí, en iPhone 14 Pro (A16) con iOS 18.4; requiere iOS 17 o superior.
- Opciones de despliegue: Core ML (ML Program) en iOS 17+; no se documentan opciones para vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Latencia y throughput: 0,36-0,40 s por tesela de 128 px en iPhone 14 Pro; 0,16 s de carga tras la compilación en caché.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GenerativeDetail4x (esta ficha) | no disponible | no aplica | 0,36-0,40 s/tesela en A16; sin benchmarks publicados | CreativeML Open RAIL++-M | Core ML, iOS 17+ |
| AdcSR (Guaishou74851/AdcSR) | no disponible | no aplica | sin datos en la informacion disponible | Apache 2.0 (código y pesos) | PyTorch, Hugging Face |
| OSEDiff | no disponible | no aplica | sin datos en la informacion disponible | Apache 2.0 | PyTorch, GitHub |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de superresolución; la comparación se limita a licencia, formato y disponibilidad.

## Limitaciones y advertencias

- El detalle generado es una predicción, no evidencia de detalle capturado; no debe usarse en contextos forenses o de verificación de imágenes.
- Riesgo de artefactos: en fotogramas de vídeo de baja luminosidad, sin el desenfoque gaussiano previo de 0,9-1,2 px, los bordes de bloque del códec se convierten en artefactos similares a grietas.
- La ruta por GPU mantiene los pesos en memoria del proceso y no se recomienda; el diseño está pensado para la Neural Engine.
- Licencia CreativeML Open RAIL++-M: incluye restricciones de uso de la Attachment A que deben transmitirse a cualquiera que redistribuya el modelo o un producto que lo incluya, junto con una copia de la licencia.
- Aviso sobre datos de entrenamiento: AdcSR se destiló de OSEDiff sobre LSDIR, descrito por su página de proyecto como de uso para investigación académica, y OSEDiff se entrenó también con las primeras 10.000 imágenes de FFHQ, cuyas licencias incluyen términos no comerciales. No se garantiza que el uso comercial de los pesos esté libre de reclamaciones derivadas de los datos de entrenamiento.
- El repositorio no está afiliado ni respaldado por Stability AI ni por los autores de AdcSR.
- Sin capacidades lingüísticas ni de texto: no aplica para tareas de NLP, tool calling o agentes.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción nula y ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/halfmoon-mind/still-generative-detail-4x
- Modelo base AdcSR: https://huggingface.co/Guaishou74851/AdcSR
- Paper AdcSR (arXiv:2411.13383): https://arxiv.org/abs/2411.13383
- Código AdcSR: https://github.com/Guaishou74851/AdcSR
- OSEDiff: https://github.com/cswry/OSEDiff
- Dataset LSDIR: https://data.vision.ee.ethz.ch/yawli/index.html
- Dataset FFHQ: https://github.com/NVlabs/ffhq-dataset
- Licencia del modelo: https://huggingface.co/halfmoon-mind/still-generative-detail-4x/blob/main/LICENSE-MODEL
