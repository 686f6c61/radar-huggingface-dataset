# JONNYVERSE/yolov8n-pose

## Resumen

El modelo `JONNYVERSE/yolov8n-pose` es una conversión a formato ONNX del modelo YOLOv8n-pose de Ultralytics, diseñada específicamente para ser compatible con la librería Transformers.js de Hugging Face. Esto permite ejecutar estimación de pose humana en tiempo real directamente en el navegador o en entornos Node.js, sin necesidad de un backend de Python. El modelo detecta personas y localiza 17 puntos clave del cuerpo (nariz, ojos, orejas, hombros, codos, muñecas, caderas, rodillas y tobillos) a partir de una imagen.

La relevancia de este modelo radica en su capacidad para llevar la visión por computador al ecosistema JavaScript, facilitando el desarrollo de aplicaciones web interactivas de fitness, análisis deportivo, realidad aumentada o interfaces gestuales. Al ser una variante "n" (nano) de YOLOv8, es extremadamente ligera y rápida, pensada para dispositivos con recursos limitados. El repositorio original en Hugging Face no proporciona detalles sobre el número de parámetros, el contexto o los datos de entrenamiento, pero se sabe que YOLOv8n-pose es una red neuronal convolucional de una sola pasada (single-stage) optimizada para detección y estimación de pose simultáneas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-pose (CNN de una sola etapa, basada en CSPDarknet) |
| Parametros totales | no disponible (se estima ~3.2 millones para YOLOv8n, pero no confirmado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos ONNX, posiblemente FP32) |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (compatible con Transformers.js) |

## Arquitectura y entrenamiento

YOLOv8n-pose es una red neuronal convolucional de una sola pasada que combina detección de objetos y estimación de pose en una única inferencia. La arquitectura se basa en el backbone CSPDarknet (Cross Stage Partial Darknet) con una cabeza de detección anclada en tres escalas diferentes. Para la estimación de pose, la cabeza de detección produce, para cada una de las 8400 celdas de anclaje, 4 coordenadas de bounding box, 1 puntuación de confianza y 51 valores correspondientes a 17 puntos clave (cada uno con coordenadas x, y y visibilidad). El modelo fue entrenado originalmente por Ultralytics en el dataset COCO (Common Objects in Context), que incluye más de 200 000 imágenes etiquetadas con personas y sus puntos clave. No se dispone de información sobre el proceso de entrenamiento específico de esta conversión, pero al ser una exportación a ONNX, se asume que los pesos son los originales de YOLOv8n-pose sin modificaciones adicionales. La conversión a ONNX permite su ejecución en el runtime de Transformers.js, que utiliza WebGPU o WASM para acelerar la inferencia en el navegador.

## Capacidades

- Estimación de pose humana en tiempo real: detecta múltiples personas en una imagen y localiza 17 puntos clave del cuerpo.
- Detección de objetos integrada: además de los puntos clave, devuelve bounding boxes con puntuación de confianza.
- Compatibilidad con Transformers.js: se puede cargar y ejecutar directamente en JavaScript mediante `AutoModel` y `AutoProcessor`.
- Post-procesamiento flexible: el ejemplo de uso incluye funciones para filtrar detecciones por umbral de confianza y eliminar duplicados mediante IoU (Intersection over Union).
- Salida estructurada: los resultados se formatean como objetos con coordenadas de caja, puntuación y lista de keypoints etiquetados (nariz, ojos, hombros, etc.).
- Ligereza: al ser la variante "nano", es adecuada para dispositivos con poca memoria y CPU limitada.

## Casos de uso

- Aplicaciones web de fitness y entrenamiento personal: el modelo puede analizar la postura del usuario en tiempo real a través de la cámara, contando repeticiones o corrigiendo la forma de los ejercicios. Su ejecución en el navegador elimina la latencia de un servidor y protege la privacidad del usuario.
- Análisis deportivo en streaming: se puede integrar en una página web para seguir los movimientos de jugadores en vídeos, extrayendo métricas como ángulos articulares o velocidad de movimiento. La salida de keypoints permite calcular estos datos directamente en JavaScript.
- Interfaces de usuario gestuales: permite controlar aplicaciones mediante gestos de la mano o del cuerpo, por ejemplo, levantar el brazo para hacer clic o mover la cabeza para desplazar el cursor. Al ser tan ligero, funciona en portátiles y tablets.
- Realidad aumentada en el navegador: superponer elementos virtuales sobre el cuerpo humano detectado, como ropa, accesorios o efectos visuales. La estimación de pose en tiempo real es esencial para anclar correctamente los objetos 3D.
- Telemedicina y rehabilitación: los pacientes pueden realizar ejercicios de fisioterapia en casa mientras el modelo evalúa su rango de movimiento y envía los datos a un profesional. La ejecución local evita enviar vídeos sensibles a servidores externos.
- Robótica educativa y prototipos: se puede usar en proyectos de Node.js con cámaras USB para que un robot siga los movimientos de una persona, o para experimentos de visión por computador en entornos de bajo coste como Raspberry Pi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es una conversión de YOLOv8n-pose, cuyos resultados originales en el dataset COCO (mAP 50-95) rondan el 50.5% para la tarea de pose, pero no se puede confirmar que esta conversión mantenga exactamente esas métricas. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: al ser un modelo nano con pesos ONNX, la memoria necesaria es muy reducida. En FP32, el tamaño del modelo ronda los 12 MB, por lo que cabe en cualquier GPU moderna y también en memoria compartida de iGPU.
- GPU recomendadas: cualquier GPU con soporte WebGPU (por ejemplo, NVIDIA GTX 10xx o superior, AMD RX 5000 o superior, o iGPU Intel integrada). En CPU, funciona con WASM, aunque la latencia será mayor.
- Compatibilidad con consumer GPU: sí, funciona en GPUs de gama baja y en CPUs de cualquier portátil actual.
- Opciones de despliegue: Transformers.js (navegador o Node.js), ONNX Runtime Web, o cualquier runtime ONNX estándar (si se extraen los pesos). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible en la documentación. En una GPU moderna, se espera una inferencia por debajo de 10 ms para una imagen de 640x640, pero depende del hardware y del backend (WebGPU vs WASM).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JONNYVERSE/yolov8n-pose | ~3.2M (estimado) | N/A (vision) | ONNX | AGPL-3.0 | Hugging Face |
| STMicroelectronics/yolov8n_pose | ~3.2M (estimado) | N/A (vision) | ONNX, TFLite | Apache 2.0 | Hugging Face, GitHub |
| Ultralytics YOLOv8n-pose (original) | ~3.2M | N/A (vision) | PyTorch, ONNX, TensorRT | AGPL-3.0 | Ultralytics, GitHub |

La principal diferencia con la versión de STMicroelectronics es la licencia (Apache 2.0 frente a AGPL-3.0) y el soporte específico para Transformers.js. El modelo original de Ultralytics ofrece más formatos de exportación y herramientas de entrenamiento, pero requiere un entorno Python. Esta conversión es la única de las tres que se integra directamente con el ecosistema JavaScript de Hugging Face.

## Limitaciones y advertencias

- Licencia AGPL-3.0: cualquier uso del modelo en un servicio web obliga a publicar el código fuente de la aplicación bajo la misma licencia, lo que puede ser un problema para proyectos comerciales cerrados.
- Sesgos conocidos: al estar entrenado en COCO, el modelo puede tener un rendimiento inferior en personas con tonos de piel oscuros, niños, o en posturas poco comunes. No se ha realizado una evaluación de sesgos específica para esta conversión.
- Riesgo de alucinación: en visión por computador, el equivalente son detecciones falsas. El modelo puede generar keypoints en imágenes sin personas o con oclusiones severas. Se recomienda ajustar los umbrales de confianza (por ejemplo, 0.3) y aplicar post-procesamiento adicional.
- Limitaciones de contexto: al ser un modelo de una sola imagen, no tiene memoria temporal. Para vídeo, cada frame se procesa de forma independiente, lo que puede provocar inestabilidad en las detecciones entre frames.
- Restricciones de uso comercial: la licencia AGPL-3.0 impone obligaciones de copyleft. Si se integra en un producto SaaS, el código fuente del servicio debe ser liberado.
- Dependencia de Transformers.js: el modelo está optimizado para esta librería, pero no se garantiza que funcione con otras versiones del runtime ONNX. Se recomienda probar con la versión específica de Transformers.js mencionada en la documentación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JONNYVERSE/yolov8n-pose
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Modelo original de Ultralytics: https://platform.ultralytics.com/ultralytics/yolov8/yolov8n-pose
- Modelo similar de STMicroelectronics: https://huggingface.co/STMicroelectronics/yolov8n_pose
- Guía de pose estimation con YOLOv8 (GitHub): https://github.com/Sadat75/ultralytics_yolov8_pose
