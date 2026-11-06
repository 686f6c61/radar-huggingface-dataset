# multimodal-vision-ai/mvai-video-action-compare-models

## Resumen

MVAI Video Action Compare Models es un espejo de los binarios oficiales de MoViNet-A1 y MoViNet-A2 en formato TFLite Float32, publicados originalmente por el equipo de TensorFlow Model Garden (Google). El repositorio no introduce modificaciones sobre los ficheros originales: su función es servir los dos modelos desde Hugging Face con cabeceras CORS compatibles, de modo que puedan cargarse directamente en el navegador dentro de la interfaz de investigación de MVAI. Está orientado a la clasificación de acciones a nivel de vídeo sobre el conjunto Kinetics-600 (600 clases).

Técnicamente se trata de dos redes de convolución 3D con arquitectura MoViNet en variante *stream*, es decir, con estados internos de streaming que permiten procesar el vídeo fotograma a fotograma manteniendo la caché temporal entre inferencias. A1 opera con entradas de 172x172 píxeles y A2 con 224x224; ambas reciben un único fotograma por paso ([1,1,H,W,3]) y exponen decenas de tensores de estado (68 entradas/salidas en A1, 74 en A2), lo que las hace adecuadas para inferencia de baja latencia en dispositivos.

Su relevancia es acotada pero concreta: proporciona una referencia reproducible de clasificación de acciones en el edge (navegador, móvil, webcam) sin dependencia de frameworks de Python, con checksums SHA256 documentados y licencia Apache 2.0. No es un modelo de propósito general ni un detector de acciones espacio-temporal por actor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoViNet (CNN 3D con estados de streaming), variantes A1 y A2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana temporal gestionada por estados de streaming (no se especifica el número de fotogramas) |
| Tipos de cuantizacion | solo Float32 en este repositorio (los binarios son TFLite float32 sin cuantizar) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (TensorFlow Lite), Float32 |

Especificaciones adicionales por variante:

| Variante | Forma de entrada | Entradas | Salidas | Logits |
|---|---|---|---|---|
| MoViNet-A1 Stream | [1, 1, 172, 172, 3] | 68 | 68 | [1, 600] |
| MoViNet-A2 Stream | [1, 1, 224, 224, 3] | 74 | 74 | [1, 600] |

## Arquitectura y entrenamiento

MoViNet es una familia de redes neuronales convolucionales 3D diseñadas por Google para clasificación de vídeo eficiente. La innovación principal es el uso de bloques convolucionales separables en el tiempo y el espacio junto con una variante *stream* que factoriza la convolución 3D en una convolución 2D por fotograma más una convolución 1D causal sobre el eje temporal. Esto permite mantener estados intermedios (cachés) entre fotogramas, de forma que la inferencia en streaming tiene un coste computacional aproximadamente constante por fotograma en lugar de requerir el clip completo.

Los modelos fueron entrenados sobre Kinetics-600, un conjunto de 600 clases de acciones humanas. La model card no detalla el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste fino con RLHF o DPO (no aplicables en un clasificador de vídeo supervisado). Tampoco se documentan en la información disponible los detalles del régimen de entrenamiento (épocas, aumentos de datos, resolución de entrenamiento).

Los binarios de este repositorio son copias sin modificar de los publicados en TensorFlow Model Garden, con checksums SHA256 y tamaños esperados registrados en `model-manifest.json`. No hay cuantización ni entrenamiento adicional por parte de MVAI.

## Capacidades

- Clasificación de acciones a nivel de vídeo sobre 600 clases de Kinetics-600.
- Inferencia en streaming fotograma a fotograma mediante estados internos persistentes.
- Ejecución en navegador y en dispositivos edge a través de TensorFlow Lite / LiteRT.
- Procesamiento de vídeo en tiempo real con latencia por fotograma acotada.
- Dos perfiles de coste/precisión: A1 (172x172, más ligero) y A2 (224x224, mayor precisión).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües (no procesa texto).
- No realiza detección de acciones espacio-temporal por actor; solo etiqueta el vídeo completo.
- No incluye detección de personas: la interfaz de MVAI usa un detector MediaPipe independiente para dibujar cajas, que no vinculan la etiqueta de acción a un actor concreto.

## Casos de uso

- Clasificación de acciones en el navegador: cargar el `.tflite` con LiteRT y alimentar fotogramas de una webcam o de un `<video>` HTML5, obteniendo la etiqueta de acción por fotograma sin backend. A1 es la opción si el dispositivo es limitado; A2 si se prioriza precisión.
- Moderación de contenido en vídeo: prefiltrar clips subidos por usuarios detectando categorías de acción sensibles antes de una revisión humana, aprovechando el streaming para no almacenar el clip completo en memoria.
- Analítica de vídeo en directo en edge: desplegar en dispositivos con poca VRAM o en navegadores de quiosco para etiquetar flujos de cámara y agregar estadísticas de actividad, sin enviar vídeo a la nube.
- Prototipado de investigación en visión: usar los binarios como baseline reproducible de MoViNet con checksums verificables para comparar pipelines de preprocesado o protocolos de validación propios.
- Educación y demos interactivas: ilustrar conceptos de convolución 3D y streaming temporal en un curso, ejecutando el modelo íntegramente en el cliente.
- Detección de eventos en grabaciones deportivas o de vigilancia: procesar el vídeo en modo stream y emitir etiquetas de acción por ventana temporal para indexación posterior.
- Verificación de integridad de artefactos: emplear `model-manifest.json` para validar que los binarios descargados coinciden con los oficiales antes de integrarlos en un pipeline.

## Benchmarks y rendimiento

Resultados publicados por TensorFlow Model Garden para la variante *stream* sobre Kinetics-600 (Top-1), tal como se recogen en la model card:

| Modelo | Dataset | Metrica | Resultado |
|---|---|---|---|
| MoViNet-A1 Stream | Kinetics-600 | Top-1 | 76,45 % |
| MoViNet-A2 Stream | Kinetics-600 | Top-1 | 78,40 % |

La model card advierte explícitamente de que estos son resultados de benchmark publicados, no la precisión de las muestras de MVAI, y que no son directamente comparables con modelos cuantizados de forma distinta o entrenados con otro protocolo de muestreo sin una validación consistente. No se han publicado en la información disponible métricas de latencia, throughput ni consumo energético.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al ser modelos TFLite Float32 de tamaño reducido (repositorio de 0,1 GB para ambos binarios), el consumo de memoria es bajo, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible. El diseño apunta a ejecución en CPU, GPU integrada o aceleradores móviles vía LiteRT, no a GPUs de centro de datos.
- Cabe en GPU de consumo: sí, por el perfil de tamaño del artefacto, aunque no se especifican requisitos mínimos.
- Opciones de despliegue: LiteRT / TensorFlow Lite (navegador con WebAssembly o WebGL/WebGPU, Android, iOS, Linux embebido). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de vídeo TFLite.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Clases | Top-1 Kinetics-600 | Licencia | Formato |
|---|---|---|---|---|---|---|
| MoViNet-A1 Stream (este repo) | MoViNet stream | 172x172 | 600 | 76,45 % | Apache 2.0 | TFLite Float32 |
| MoViNet-A2 Stream (este repo) | MoViNet stream | 224x224 | 600 | 78,40 % | Apache 2.0 | TFLite Float32 |
| Otras variantes MoViNet (A0, A3-A5) | MoViNet | distintas | 600 | no disponible en la información | Apache 2.0 | TFLite / TF SavedModel |
| Otros clasificadores de vídeo (p. ej. X3D, I3D) | CNN 3D | distintas | 400/600 | no disponible en la información | variable | variable |

No se dispone en la información proporcionada de datos comparativos de terceros con protocolo equivalente; cualquier comparación con modelos cuantizados o con otro esquema de muestreo requeriría una validación propia.

## Limitaciones y advertencias

- Solo clasificación a nivel de vídeo: no localiza actores ni produce detección espacio-temporal por persona. Las cajas que muestra la interfaz de MVAI provienen de un detector MediaPipe independiente y no están asociadas a la etiqueta de acción.
- Dominio restringido a las 600 clases de Kinetics-600; acciones fuera de ese vocabulario no se reconocen y se fuerzan a la clase más próxima.
- Sesgos heredados del dataset Kinetics-600: desequilibrios demográficos, culturales y de grabación del corpus original, no documentados en detalle en la model card.
- Riesgo de clasificación errónea en vídeos con oclusiones, cámara en movimiento o acciones compuestas; no se publican métricas de calibración ni de rendimiento por clase.
- Los binarios son Float32 sin cuantizar; sustituirlos por versiones cuantizadas invalida la comparación directa con los resultados publicados.
- No hay información sobre idiomas ni sobre procesamiento de texto: no es un modelo multimodal en el sentido de texto-imagen.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; debe verificarse también la licencia de los artefactos originales de TensorFlow Model Garden.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es un espejo, no un modelo mantenido de forma independiente. La integridad debe comprobarse contra `model-manifest.json`.
- La fecha de creación registrada (2026-11-01) y la ausencia de documentación adicional limitan la trazabilidad; conviene contrastar siempre con el repositorio oficial de TensorFlow Model Garden.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/multimodal-vision-ai/mvai-video-action-compare-models
- Proyecto original MoViNet en TensorFlow Models: https://github.com/tensorflow/models/tree/master/official/projects/movinet
- Binario oficial MoViNet-A1 Stream: https://storage.googleapis.com/tf_model_garden/vision/movinet/movinet_a1_stream.tflite
- Binario oficial MoViNet-A2 Stream: https://storage.googleapis.com/tf_model_garden/vision/movinet/movinet_a2_stream.tflite
- Manifiesto de integridad: `model-manifest.json` (incluido en el repositorio)
- Paper de MoViNet: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
