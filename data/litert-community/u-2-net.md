# litert-community/U-2-Net

## Resumen

U²-Net es un modelo de segmentación de objetos salientes (salient object detection) basado en una red neuronal convolucional pura con estructura de U anidada ("U-net de U-nets"), originalmente propuesto en el artículo "U^2-Net: Going Deeper with Nested U-Structure for Salient Object Detection" (Pattern Recognition, 2020). Esta ficha describe la conversión oficial a LiteRT (TFLite) publicada por la comunidad litert-community de Google AI Edge, que permite ejecutar el modelo en dispositivos móviles con aceleración GPU o NPU, con pesos en float16 y un tamaño de archivo de 88 MB.

La conversión está pensada para aplicaciones de eliminación de fondo y recorte de sujetos en tiempo real sobre Android, utilizando el acelerador `CompiledModel` de LiteRT con todas las operaciones GPU-nativas, sin caídas a CPU ni operadores Flex. El modelo original tiene 44 millones de parámetros y acepta imágenes de 320×320 píxeles en formato RGB, produciendo una máscara de saliencia en escala de grises que puede usarse como canal alfa para componer el sujeto sobre un fondo transparente. No se ha realizado ningún entrenamiento adicional; se trata de una conversión exacta de pesos del modelo original `xuebinqin/U-2-Net`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN pura con estructura de U anidada (U²-Net) |
| Parametros totales | 44 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision, no texto) |
| Tipos de cuantizacion | FP16 (archivo `u2net_fp16.tflite`) |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (`.tflite`) |

## Arquitectura y entrenamiento

U²-Net es una red neuronal convolucional pura que emplea una estructura de U anidada: cada nivel de la U principal contiene a su vez una sub-U, lo que permite capturar tanto detalles finos como contexto global sin necesidad de mecanismos de atención ni arquitecturas transformer. La entrada es una imagen de 320×320 píxeles en formato NCHW, y la salida es una máscara de saliencia de un solo canal con valores en [0,1] tras una activación sigmoide.

El modelo original fue entrenado sobre el dataset DUTS-TR, compuesto por imágenes web con máscaras binarias de objetos salientes. Esta conversión a LiteRT no añade ningún entrenamiento: se realizó una conversión de pesos con `litert-torch` y posterior cuantización a float16 con `ai-edge-quantizer`. La verificación reporta una correlación de salida de 1.0 frente a la referencia PyTorch en FP32, y de aproximadamente 0.9999 para la versión FP16. Todas las operaciones son GPU-nativas, sin operadores Flex ni reescrituras personalizadas.

## Capacidades

- Segmentacion de objetos salientes: detecta y segmenta el objeto mas prominente de una imagen.
- Eliminacion de fondo: genera una mascara de transparencia que permite recortar el sujeto y componerlo sobre un fondo transparente o distinto.
- Image matting basico: aunque no es un matting fino de cabello, produce bordes suavizados gracias a la salida sigmoide.
- Ejecucion on-device: compatible con aceleracion GPU (OpenCL, Vulkan) y NPU (Hexagon) en dispositivos Android via LiteRT.
- Preprocesado simple: requiere redimensionado a 320×320, division por el maximo por imagen y normalizacion ImageNet.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Eliminacion de fondo en aplicaciones de fotografia: el modelo puede recortar el sujeto principal de una foto y sustituir el fondo por un color solido o una imagen nueva, con una latencia de ~147 ms en un Pixel 8a, lo que permite edicion interactiva.
- Creacion de stickers y avatares: a partir de una foto de retrato, se genera una mascara de transparencia para producir stickers o avatares recortados listos para usar en mensajeria o redes sociales.
- Preprocesado para realidad aumentada: la mascara de saliencia puede usarse para aislar objetos reales y superponer contenido virtual, por ejemplo en filtros de camara o aplicaciones de prueba de productos.
- Automatizacion de flujos de diseno grafico: integrado en un pipeline de procesamiento por lotes, permite recortar imagenes de catalogo o de stock sin intervencion manual, gracias a su ejecucion rapida en GPU movil o NPU.
- Segmentacion en tiempo real desde camara: con la aceleracion NPU (8.82 ms en un Galaxy S26), es viable procesar fotogramas de video en directo para aplicaciones de videoconferencia con fondo virtual.
- Verificacion de modelos en escritorio: la version Python con `ai_edge_litert` permite probar el modelo en un PC antes de desplegarlo en Android, facilitando el desarrollo y la depuracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (como mIoU, F-measure o MAE) en la informacion disponible. Sin embargo, la model card incluye mediciones de latencia en dos dispositivos moviles:

| Dispositivo | Backend | Latencia media |
|---|---|---|
| Pixel 8a (Tensor G3, Mali) | LiteRT `CompiledModel` GPU | ~147 ms |
| Pixel 8a | TFLite `benchmark_model` GPU (OpenCL) | 117.7 ms |
| Pixel 8a | TFLite `benchmark_model` CPU (XNNPACK, 4 hilos) | 1797.5 ms |
| Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5) | LiteRT NPU (Hexagon v81) | 8.82 ms (mediana) |
| Samsung Galaxy S26 | LiteRT GPU (Adreno) | 36.80 ms (mediana) |

La discrepancia entre las dos filas de GPU en Pixel 8a se debe a que corresponden a runtimes distintos: la primera usa el acelerador `CompiledModel` de LiteRT, mientras que la segunda usa el delegado clasico `TfLiteGpuDelegateV2`. La cifra de 117.7 ms se considera un minimo reproducible con la herramienta estandar de benchmark, no la velocidad real del modelo en LiteRT.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 88 MB, pero la memoria de trabajo durante la inferencia es reducida (entrada y salida de 320×320). Cabe en cualquier GPU movil con al menos 1 GB de memoria compartida.
- GPU recomendadas: cualquier GPU con soporte OpenCL o Vulkan en Android (Mali, Adreno, PowerVR). En escritorio, cualquier GPU moderna puede ejecutarlo sin problemas, aunque no se han publicado mediciones.
- NPU compatible: Hexagon (Qualcomm) con LiteRT `CompiledModel` 2.2.0 o superior, como se demuestra en el Galaxy S26.
- Opciones de despliegue: LiteRT (TFLite) en Android via `CompiledModel` o `Interpreter`; Python con `ai_edge_litert` para verificacion en escritorio.
- Latencia y throughput: ~147 ms por imagen en GPU de gama media (Pixel 8a), ~8.8 ms en NPU de gama alta (Galaxy S26). En CPU movil, ~1.8 s por imagen, por lo que no se recomienda para tiempo real sin aceleracion.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. U²-Net es un modelo conocido en el ambito de segmentacion de saliencia, con alternativas como BASNet, DeepLabV3 o MobileNetV3-Seg, pero no se han publicado mediciones de rendimiento o precision de estos modelos en el mismo entorno de hardware para establecer una comparacion objetiva. Se recomienda consultar la literatura original de U²-Net para comparaciones academicas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado con el dataset DUTS-TR, compuesto por imagenes web que pueden contener personas y otros datos de caracter personal. No se ha realizado filtrado de contenido ni de PII en esta conversion; el despliegue en produccion debe incluir politicas de privacidad y filtrado de contenido.
- Riesgo de alucinacion: no aplica, ya que el modelo no es generativo; produce una mascara de saliencia determinista.
- Limitaciones de contexto: la resolucion fija de 320×320 puede perder detalles finos en objetos pequenos o bordes complejos (pelo, texturas). No se admite entrada de mayor resolucion sin reescalado.
- Limitaciones de idioma: no aplica, al ser un modelo de vision.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados.
- Caveat para produccion: la mascara de saliencia no es un matting fino; puede fallar en escenas con multiples objetos salientes o fondos muy similares al sujeto. Se recomienda validar con casos de uso reales antes de integrarlo en un producto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/U-2-Net
- Repositorio original de U²-Net: https://github.com/xuebinqin/U-2-Net
- Documentacion de LiteRT: https://ai.google.dev/edge/litert
- Ejemplos de LiteRT (incluye muestra de Android con camara y galeria): https://github.com/google-ai-edge/litert-samples
- Articulo original (Pattern Recognition 2020): disponible en el repositorio de GitHub de U²-Net.
