# neurarank/neuvy-vision-fusion

## Resumen

Neuvy Vision Fusion 1.0 es un modelo de transformación de medios en tiempo real orientado a llamadas WebRTC y flujos de vídeo LiveKit. Lo desarrolla neurarank y se publica bajo licencia Apache 2.0. A diferencia de los modelos de visión generativa convencionales, que procesan imágenes de forma aislada, este modelo está diseñado para interceptar fotogramas de vídeo y fragmentos de audio en vuelo y sintetizar transformaciones de apariencia, ropa y voz con una latencia declarada inferior a 50 ms.

El modelo combina un codificador de visión basado en un backbone ViT de Qwen3-VL con tomas de características multiescala (DeepStack en los índices 5, 11 y 17), un núcleo de fusión con cross-attention y compuertas espaciales, y un decodificador de transformación neuronal de doble flujo basado en ResNet con mezcla alfa adaptativa en los bordes. Incorpora además un filtro de Kalman unscented y un estabilizador temporal para reducir el jitter entre fotogramas consecutivos.

Con 47.388.356 parámetros entrenados y un repositorio de 0,2 GB, es un modelo compacto pensado para despliegue en el borde (Apple Silicon MPS, NVIDIA CUDA con TensorRT u ONNX). Su propuesta de valor está en la integración nativa con Neuvy Voice Fusion para alineación labial por debajo de 15 ms, lo que lo sitúa en el nicho de la transformación audiovisual en directo para videollamadas, probadores virtuales y filtros interactivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: ViT (Qwen3-VL) con DeepStack multiescala + nucleo de fusion cross-attention con compuertas espaciales + decodificador ResNet de doble flujo |
| Parametros totales | 47.388.356 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP32 y FP16 (safetensors); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP32 / FP16) |
| Resolucion de entrada | Rejilla latente canonica 256x256, reescalada a 720p / 1080p |
| Aceleracion | Apple Silicon Metal (MPS), NVIDIA CUDA (TensorRT / ONNX) |
| Latencia declarada | Inferior a 50 ms por fotograma; alineacion labial inferior a 15 ms con Neuvy Voice Fusion |

## Arquitectura y entrenamiento

La arquitectura se organiza en tres bloques. El primero es un codificador de imagen basado en un backbone ViT de Qwen3-VL auditado, del que se extraen características multiescala mediante tomas DeepStack en los índices 5, 11 y 17. El segundo es un núcleo de fusión unificado que combina cross-attention para condicionamiento semántico con compuertas espaciales, de modo que la información de la prenda objetivo modula la representación del fotograma de cámara. El tercero es un decodificador de transformación neuronal de doble flujo basado en ResNet que sintetiza la deformación y aplica mezcla alfa adaptativa en los bordes para integrar la prenda o la transformación facial.

El modelo incorpora un filtro de Kalman unscented y un estabilizador de transformación temporal para evitar el parpadeo y el jitter entre fotogramas consecutivos, un requisito crítico en vídeo en directo. La coherencia audiovisual se delega en Neuvy Voice Fusion, con el que se integra de forma nativa para lograr una alineación labial inferior a 15 ms. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esta información no está disponible en la documentación proporcionada.

## Capacidades

- Transformación de vídeo en tiempo real sobre flujos WebRTC y LiveKit, interceptando fotogramas en vuelo.
- Transferencia de prendas (garment transfer) y probador virtual (virtual try-on) a partir de una imagen de cámara y una imagen de prenda objetivo.
- Transformación facial (face transformation) en directo.
- Síntesis de apariencia y voz con latencia declarada inferior a 50 ms.
- Estabilización temporal integrada mediante filtro de Kalman unscented y estabilizador de transformación.
- Alineación labial con Neuvy Voice Fusion por debajo de 15 ms.
- Pipeline de image-to-image expuesto a través de transformers con `trust_remote_code`.
- Soporte de despliegue en Apple Silicon (MPS) y NVIDIA CUDA (TensorRT / ONNX).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto.

## Casos de uso

- Videollamadas con filtros de apariencia en tiempo real: el modelo procesa cada fotograma WebRTC y aplica transformaciones faciales manteniendo la latencia por debajo de 50 ms, lo que permite su uso en conversaciones sin percepción de retardo.
- Probador virtual en comercio electrónico: a partir de la cámara del usuario y una imagen de prenda, genera un fotograma con la prenda superpuesta, adecuado para sesiones de compra interactivas en directo.
- Plataformas de streaming social con LiveKit: integración en salas de vídeo para ofrecer avatares o cambios de vestuario dinámicos durante la emisión.
- Atención al cliente por vídeo con anonimización facial: el modelo puede sustituir o transformar el rostro del agente en tiempo real para preservar la privacidad sin romper la naturalidad de la conversación.
- Producción audiovisual de bajo coste: transformación de vestuario y apariencia en emisiones en directo sin necesidad de equipos de posproducción, gracias al procesamiento en el borde sobre MPS o CUDA.
- Demos interactivas y experiencias de marca: filtros de prueba de ropa o accesorios en ferias y campañas, desplegables en hardware consumer con TensorRT u ONNX.
- Investigación en visión por computador aplicada a vídeo en directo: banco de pruebas para estudiar estabilización temporal, fusión multimodal y latencia en pipelines WebRTC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 47,4 M de parámetros en FP32 el peso ronda los 190 MB, y en FP16 unos 95 MB, por lo que el cuello de botella no es la memoria sino el procesamiento por fotograma en tiempo real.
- GPU recomendadas: NVIDIA con soporte CUDA y TensorRT (A100, H100, RTX 4090, RTX 3090, entre otras) y Apple Silicon con Metal (MPS).
- Cabe en GPU consumer: sí, por tamaño de pesos; el rendimiento a 720p/1080p y latencia sub-50 ms dependerá de la GPU concreta y del backend (TensorRT u ONNX).
- Opciones de despliegue: transformers con `trust_remote_code`, TensorRT, ONNX Runtime y MPS en Apple Silicon; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: latencia declarada inferior a 50 ms por fotograma y alineación labial inferior a 15 ms con Neuvy Voice Fusion; no se publican cifras de throughput (FPS) por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Neuvy Vision Fusion 1.0 | 47,4 M | Transformacion de video en tiempo real (WebRTC/LiveKit) | 256x256 latente, salida 720p/1080p | Apache 2.0 | Hugging Face |
| Modelos de virtual try-on tipo OOTDiffusion / IDM-VTON | Cientos de millones a miles de millones | Try-on por difusion, orientado a imagen | Resolucion variable, no tiempo real | Varía segun modelo | Hugging Face / repos |
| Modelos de face swapping en tiempo real (p. ej. InsightFace / inswapper) | Decenas de millones | Intercambio facial en directo | Resolucion variable | Varía segun modelo | Repos comunitarios |
| Modelos de segmentacion y matting en tiempo real (p. ej. MediaPipe Selfie Segmentation) | Unos pocos millones | Segmentacion para efectos | Resolucion variable | Apache 2.0 | Google / repos |

La comparación directa es limitada porque Neuvy Vision Fusion combina try-on, transformación facial y estabilización temporal en un único pipeline de vídeo en directo, un perfil poco habitual entre los modelos publicados. No se dispone de datos de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado datos de sesgos; al operar sobre rostros y cuerpos, es probable que herede sesgos del backbone ViT y del dataset de entrenamiento, no documentado.
- Riesgo de artefactos y alucinaciones visuales en condiciones de iluminación adversa, oclusiones o movimientos rápidos, especialmente con la rejilla latente de 256x256 reescalada.
- La latencia declarada (sub-50 ms) no está verificada de forma independiente y depende del hardware y del backend.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar el repositorio antes de usarlo en producción.
- La coherencia audiovisual depende de Neuvy Voice Fusion, que es un componente separado y cuya disponibilidad y licencia no se detallan.
- No se documentan idiomas soportados ni capacidades de texto, por lo que no debe emplearse como modelo de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero el uso de transformación facial y de voz conlleva obligaciones legales sobre consentimiento y protección de datos (RGPD) que el usuario debe asumir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado con un minuto de diferencia; la madurez y el soporte de la comunidad son inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neurarank/neuvy-vision-fusion
- Perfil del autor: https://huggingface.co/neurarank
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
