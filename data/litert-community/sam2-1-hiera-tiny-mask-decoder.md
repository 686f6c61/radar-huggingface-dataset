# litert-community/SAM2.1-Hiera-Tiny-Mask-Decoder

## Resumen

El modelo `litert-community/SAM2.1-Hiera-Tiny-Mask-Decoder` es una conversión a LiteRT (antes TFLite) del decodificador de máscaras del modelo SAM 2.1 Hiera-Tiny de Meta, optimizado para ejecución completamente en GPU móvil mediante la API `CompiledModel` de LiteRT con el delegado ML Drift (`LITERT_CL`). Este componente es la mitad ligera del pipeline de segmentación interactiva de SAM 2: el encoder de imágenes (también disponible en la misma comunidad) se ejecuta una vez por imagen y produce un mapa de características multiescala, mientras que este decodificador convierte un punto de entrada (un toque en la pantalla) en máscaras de segmentación en unos pocos milisegundos por interacción.

El modelo resuelve el problema de la segmentación interactiva en tiempo real en dispositivos móviles, donde la latencia y el consumo de memoria son críticos. Con un tamaño de solo 17 MB en precisión FP16, es capaz de generar tres máscaras candidatas con sus puntuaciones de IoU en aproximadamente 10-30 ms por toque, dependiendo del dispositivo. Su relevancia actual radica en que permite llevar la segmentación de alta calidad de SAM 2 a aplicaciones on-device sin depender de la nube, habilitando casos de uso como edición de fotos, realidad aumentada o anotación de datos en el propio terminal.

La arquitectura del decodificador es un transformer de dos capas con atención cruzada bidireccional entre tokens de imagen y tokens de prompt, seguido de un up-sampler de máscaras. El modelo se distribuye en formato `.tflite` con pesos FP16 y licencia Apache-2.0, lo que facilita su integración en proyectos comerciales y de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 2 capas con atencion cruzada bidireccional (token↔imagen) + up-sampler de mascaras |
| Parametros totales | No disponible (el decodificador es una fraccion del modelo completo Hiera-Tiny) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, procesa embeddings de imagen 64x64) |
| Tipos de cuantizacion | FP16 (archivo `sam2_tiny_mask_decoder_v2_fp16.tflite`) |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite / LiteRT (`.tflite`) |

## Arquitectura y entrenamiento

El modelo es el decodificador de mascaras de SAM 2.1 Hiera-Tiny, re-escrito especificamente para ser compatible con la GPU movil a traves de LiteRT. La conversion se realizo con `litert-torch` aplicando reescrituras solo en el lado del modelo, sin parches al convertidor, manteniendo la fidelidad de los pesos. Las principales modificaciones incluyen: la atencion bidireccional (7 instancias) se re-expreso como SDPA batched 3-D `[heads, N, d]` (la version 4-D provocaba un `BROADCAST_TO` no deseado en el delegado); las capas `ConvTranspose2d` del up-sampler se sustituyeron por la identidad exacta de zero-stuff + `Conv2d` (ya que `TRANSPOSE_CONV` es rechazado en Pixel 8a); la proyeccion de mascaras se mantuvo en tensores de maximo 4 dimensiones; las 9 capas LayerNorm se reemplazaron por una `SafeLayerNorm` a prueba de overflow en FP16; y las constantes como los embeddings posicionales de imagen se hornearon como buffers.

El entrenamiento original corresponde al modelo base `facebook/sam2.1-hiera-tiny` de Meta, que fue pre-entrenado con un gran corpus de datos de segmentacion (no se proporcionan detalles especificos en la informacion disponible). La conversion a LiteRT no implica re-entrenamiento, sino una re-escritura numerica exacta: la evaluacion eager muestra un coseno de 1.000 respecto al modelo original, y el pipeline completo (encoder + decodificador) alcanza un coseno de 0.999999 en los logits de mascara y un IoU binario de 0.999 frente a la referencia PyTorch.

## Capacidades

- Segmentacion interactiva por puntos: dado un punto positivo (toque) en coordenadas de espacio 1024x1024, genera tres mascaras candidatas de 256x256 logits junto con sus puntuaciones de IoU.
- Generacion de multiples candidatas: el decodificador produce 3 mascaras por prompt, permitiendo seleccionar la mejor mediante `argmax(IoU)`.
- Ejecucion completamente en GPU movil: todos los nodos del grafo (425/425 en Pixel 8a) se delegan al GPU via `LITERT_CL`, sin operaciones en CPU.
- Baja latencia: 30.9 ms por toque en Pixel 8a (frente a 222.8 ms en CPU) y 10.55 ms en Galaxy S26.
- Compatibilidad con el encoder companion: disenado para funcionar con `litert-community/SAM2.1-Hiera-Tiny-Image-Encoder`, que produce los embeddings de imagen y las caracteristicas multiescala necesarias.
- Codificacion de prompt en host: el paso de punto a token (encoding posicional sin/cos) se realiza en el host para mantener el grafo GPU libre de operaciones trigonometricas.
- Precision FP16 con correccion numerica: la version v2 restaura la correccion en GPU (corr 0.9998, IoU 0.999) frente a la primera version que producia mascaras incorrectas silenciosamente.

## Casos de uso

- Edicion de fotos en el movil: el usuario toca un objeto en una imagen y el modelo genera la mascara en milisegundos, permitiendo recortar, eliminar fondos o aplicar filtros selectivos en aplicaciones como editores de fotos o camaras con funciones de retoque.
- Realidad aumentada interactiva: en aplicaciones de RA, el modelo puede segmentar objetos en tiempo real a partir de toques en la pantalla, habilitando interacciones como "tocar para seleccionar" en entornos mixtos.
- Anotacion de datos en campo: investigadores o tecnicos pueden anotar conjuntos de datos de segmentacion directamente en dispositivos moviles o tablets, sin necesidad de estaciones de trabajo, gracias a la baja latencia y al funcionamiento on-device.
- Herramientas de diseno grafico movil: aplicaciones de diseno como editores de ilustraciones pueden integrar la segmentacion por toque para aislar elementos de una imagen y manipularlos por separado.
- Asistentes de accesibilidad: para usuarios con discapacidad visual, el modelo puede segmentar objetos en la escena capturada por la camara y proporcionar retroalimentacion auditiva sobre la ubicacion y forma de los objetos.
- Automatizacion de procesos de vision en el edge: en dispositivos de vision industrial o robots moviles, el decodificador permite seleccionar regiones de interes mediante un punto, facilitando tareas de seguimiento o inspeccion sin conexion a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) porque se trata de un modelo de vision, no de lenguaje. Sin embargo, la model card proporciona datos de fidelidad y latencia medidos en dispositivos reales:

| Metrica | Valor |
|---|---|
| Coseno de logits de mascara (pipeline completo vs PyTorch) | 0.999999 |
| IoU binario de mascara (pipeline completo vs PyTorch) | 0.999 |
| Coseno eager (re-escritura vs original) | 1.000 |
| Latencia en Pixel 8a (GPU, v2) | 30.9 ms por toque |
| Latencia en Pixel 8a (CPU) | 222.8 ms por toque |
| Latencia en Galaxy S26 (GPU) | 10.55 ms por toque |
| Correccion en GPU Pixel 8a (v2) | corr 0.9998, IoU 0.999 |
| Tamano del archivo | 17 MB (FP16) |

## Requisitos de hardware

- VRAM estimada: no aplica directamente (modelo movil), pero el archivo pesa 17 MB y los tensores intermedios son de dimensiones modestas (embeddings 1x256x64x64, caracteristicas 1x64x128x128 y 1x32x256x256).
- GPU recomendadas: cualquier GPU movil compatible con OpenCL y el delegado `LITERT_CL` de LiteRT. Probado en Pixel 8a (Adreno) y Galaxy S26.
- Compatibilidad con consumer GPU: no es relevante para GPU de escritorio; el modelo esta disenado para dispositivos moviles con Android.
- Opciones de despliegue: LiteRT con `CompiledModel` y delegado ML Drift (`LITERT_CL`). Tambien puede ejecutarse en CPU como referencia (222.8 ms en Pixel 8a).
- Latencia y throughput: 10-30 ms por toque en GPU movil, lo que permite interaccion en tiempo real (varios toques por segundo).

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Latencia movil | Licencia | Formato |
|---|---|---|---|---|---|
| SAM2.1-Hiera-Tiny-Mask-Decoder (este) | Decodificador de mascaras | 17 MB FP16 | 10-30 ms GPU | Apache-2.0 | TFLite |
| SAM2.1-Hiera-Tiny-Image-Encoder (companion) | Encoder de imagenes | No disponible | 208 ms GPU (Galaxy S26) | Apache-2.0 | TFLite |
| SAM original (ViT-B) | Segmentador completo | ~375 MB | No disponible (no optimizado movil) | Apache-2.0 | PyTorch |
| MobileSAM | Segmentador completo | ~40 MB | ~100 ms en CPU movil | Apache-2.0 | PyTorch/ONNX |

La comparativa muestra que este decodificador es una pieza especializada que debe combinarse con el encoder companion para formar un sistema completo. Frente a soluciones como MobileSAM, que integran encoder y decodificador en un solo modelo, esta aproximacion modular permite reutilizar el encoder (que es la parte pesada) y ejecutar el decodificador a muy alta velocidad, ideal para interacciones repetidas sobre la misma imagen.

## Limitaciones y advertencias

- Requiere el encoder companion: el decodificador no funciona de forma aislada; necesita los embeddings de imagen y las caracteristicas multiescala producidas por `litert-community/SAM2.1-Hiera-Tiny-Image-Encoder`, que se ejecuta una vez por imagen y es la parte mas lenta del pipeline (208 ms en Galaxy S26).
- Precision FP16: aunque la conversion es numericamente exacta en eager, la ejecucion en GPU con FP16 puede introducir errores en algunos dispositivos. La version v2 corrige un problema de la primera version que producia mascaras incorrectas silenciosamente en Pixel 8a; se recomienda verificar la correccion en cada dispositivo objetivo.
- Solo soporta prompts de punto positivo: el modelo esta optimizado para un unico punto positivo (toque). No incluye soporte para puntos negativos, cajas o mascaras como prompt, aunque el formato de entrada `sparse_prompt [1,2,256]` podria extenderse.
- Sin soporte de video: este decodificador corresponde a la ruta de imagen de SAM 2.1; la segmentacion de video requiere componentes adicionales (memory attention) que no estan incluidos.
- Dependencia de la codificacion de prompt en host: el paso de punto a token se realiza en el host, lo que anade una pequena latencia y requiere implementar la logica de sin/cos en la aplicacion.
- Sesgos y alucinaciones: al ser un modelo de segmentacion, no presenta sesgos linguisticos, pero puede generar mascaras incorrectas en imagenes ambiguas o con objetos muy pequenos, especialmente en condiciones de baja resolucion o iluminacion deficiente.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribucion correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/SAM2.1-Hiera-Tiny-Mask-Decoder
- Encoder companion: https://huggingface.co/litert-community/SAM2.1-Hiera-Tiny-Image-Encoder
- Modelo base original: https://huggingface.co/facebook/sam2.1-hiera-tiny
- Paper de SAM 2: https://arxiv.org/abs/2408.00714
- Estadisticas de descargas: https://openmodelstats.com/models/litert-community/sam2.1-hiera-tiny-mask-decoder
