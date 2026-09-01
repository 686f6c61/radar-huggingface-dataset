# litert-community/RTMW-m-WholeBody-LiteRT

## Resumen

RTMW-m (Whole-Body) es un modelo de estimación de pose 2D de cuerpo completo desarrollado por el equipo de OpenMMLab dentro del proyecto MMPose. Esta variante concreta, publicada por litert-community, es una conversión oficial a LiteRT (el sucesor de TFLite) pensada para ejecución en dispositivos móviles y edge, con aceleración total por GPU o NPU. El modelo detecta 133 puntos clave según el estándar COCO-WholeBody: 17 del cuerpo, 6 de los pies, 68 de la cara y 42 de las manos, para una única persona centrada en la imagen.

La arquitectura combina un backbone CSPNeXt con un cuello CSPNeXtPAFPN y una cabeza RTMW basada en SimCC (regresión por coordenadas suaves). La conversión a LiteRT ha requerido reescrituras específicas (SafeRMSNorm, reemplazo de BMM por broadcast-multiply, y conversión de PixelShuffle a ConvTranspose2d) para garantizar que todos los operadores sean compatibles con GPU móvil. El resultado es un modelo de 66 MB en fp16 que corre a ~6 ms en un Pixel 8a (Tensor G3) y a 2.66 ms en un Snapdragon 8 Elite Gen 5 usando NPU, con una correlación de 0.999 frente a la versión PyTorch original.

Este modelo es relevante porque permite ejecutar estimación de pose de cuerpo completo en tiempo real en hardware de consumo, sin necesidad de servidores, lo que abre aplicaciones en fitness, animación, control por gestos y realidad aumentada. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CSPNeXt backbone + CSPNeXtPAFPN neck + RTMW/SimCC head |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 256x192) |
| Tipos de cuantizacion | fp16 (unico formato publicado) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT (TFLite) .tflite |

## Arquitectura y entrenamiento

El modelo sigue la familia RTMPose/RTMW de MMPose. El backbone es CSPNeXt, una variante de CSPNet con bloques Cross Stage Partial, seguido de un cuello PAFPN (Path Aggregation Feature Pyramid Network) que fusiona características multiescala. La cabeza RTMW utiliza SimCC, un método de regresión por coordenadas suaves que discretiza la posición de cada keypoint en dos ejes (x e y) mediante distribuciones de probabilidad, en lugar de regresión directa o mapas de calor densos. Esto reduce el coste computacional y mejora la precisión en puntos pequeños como los de la cara y las manos.

El entrenamiento original se realizó sobre COCO-WholeBody, un dataset con 133 keypoints anotados. La versión LiteRT se obtuvo mediante una conversión numerica exacta con la herramienta litert-torch, que requirió tres reescrituras: SafeRMSNorm para evitar overflow en fp16 en la normalizacion RMS, sustitucion del BMM de la atencion GAU por broadcast-multiply con reduce-sum, y conversion del PixelShuffle de la cabeza a una ConvTranspose2d con depth-to-space fijo. Estas reescrituras mantienen una correlacion de 1.0 entre el grafo TFLite y el modelo PyTorch, y de 0.999 en el dispositivo.

## Capacidades

- Estimacion de pose 2D de cuerpo completo: 133 keypoints (17 cuerpo, 6 pies, 68 cara, 42 manos) para una persona centrada.
- Ejecucion totalmente en GPU movil (LiteRT CompiledModel) o NPU (Hexagon) sin operadores rechazados.
- Preprocesamiento estandar ImageNet (mean/std) con entrada NCHW de 256x192.
- Salida SimCC: dos tensores de probabilidad (x: 384 bins, y: 512 bins) que se convierten a coordenadas de pixel mediante argmax y division por 2.
- Compatible con el pipeline top-down de MMPose: requiere un detector de persona previo para recortar al sujeto centrado.
- No soporta tool calling, generacion de texto ni capacidades multimodales; es exclusivamente un modelo de vision para keypoint detection.

## Casos de uso

- Aplicaciones de fitness y rehabilitacion: el modelo puede seguir en tiempo real los movimientos del usuario desde la camara del movil, detectando 133 puntos que permiten contar repeticiones, medir angulos articulares y corregir posturas. Su latencia de ~6 ms en GPU movil permite feedback instantaneo.
- Animacion y captura de movimiento en directo: los 133 keypoints incluyen cara y manos, lo que permite animar avatares 2D o 3D con expresiones faciales y gestos manuales. Se puede integrar en motores como Unity o Godot via un plugin Android.
- Control por gestos en interfaces de realidad aumentada: al detectar manos y cuerpo, el modelo habilita interacciones sin contacto en gafas AR o aplicaciones moviles, como seleccionar objetos con la punta del dedo o navegar menus con gestos.
- Analisis de video en el edge para videovigilancia: al ejecutarse localmente, permite detectar caidas, comportamientos anomalos o conteo de personas en camaras IP sin enviar video a la nube, preservando privacidad.
- Herramientas de maquillaje virtual y prueba de accesorios: los 68 puntos faciales permiten superponer maquillaje, gafas o filtros con precision milimetrica en tiempo real, incluso en moviles de gama media.
- Investigacion en biomecanica: el modelo puede usarse para extraer datos de movimiento de videos grabados con un simple telefono, sustituyendo sistemas de captura caros en estudios preliminares de marcha o ergonomia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (COCO WholeBody AP, PCK, etc.) en la informacion disponible. Los datos de rendimiento y precision reportados por el autor son:

| Metrica | Valor |
|---|---|
| Correlacion dispositivo-vs-PyTorch (SimCC) | 0.999 |
| Error medio de keypoints (dispositivo vs PyTorch) | 0.2 px |
| Latencia en Pixel 8a (LiteRT CompiledModel GPU) | ~6 ms |
| Latencia en Pixel 8a (TFLite GPU delegate OpenCL) | 38.5 ms |
| Latencia en Galaxy S26 (NPU Hexagon v81) | 2.66 ms (mediana) |
| Latencia en Galaxy S26 (GPU Adreno) | 11.88 ms (mediana) |
| Tiempo de carga en NPU (cacheado) | 125 ms |
| Tiempo de carga en GPU | 1267 ms |

Estas cifras corresponden a mediciones con la herramienta benchmark_model de TFLite y LiteRT CompiledModel 2.2.0, con 50 ejecuciones temporizadas. No hay datos de AP (Average Precision) sobre COCO-WholeBody para esta conversion especifica.

## Requisitos de hardware

- No requiere VRAM dedicada; esta disenado para GPU integrada en SoC moviles (Adreno, Mali, Tensor) o NPU (Hexagon).
- GPU recomendadas: cualquier GPU movil compatible con OpenCL o Vulkan (LiteRT CompiledModel). Verificado en Pixel 8a (Tensor G3) y Galaxy S26 (Snapdragon 8 Elite Gen 5).
- Tambien puede ejecutarse en CPU, pero el autor indica que XNNPACK rechaza el grafo fp16 y la referencia CPU es ~20x mas lenta que la GPU, por lo que no se recomienda.
- Tamano del modelo: 66 MB en fp16, lo que cabe en cualquier dispositivo con mas de 128 MB de RAM libre.
- Opciones de despliegue: LiteRT CompiledModel (Android, Kotlin/Java), Interpreter de LiteRT (Python), o TFLite GPU delegate clasico. No hay soporte para vLLM, llama.cpp u Ollama (no es un LLM).
- Latencia: ~2.7-6 ms en GPU/NPU de gama alta, ~12 ms en GPU de gama media. Suficiente para 30-60 FPS en tiempo real.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Como referencia cualitativa, este modelo se posiciona frente a alternativas como:

| Modelo | Keypoints | Formato | Latencia tipica | Licencia |
|---|---|---|---|---|
| RTMW-m (este) | 133 (cuerpo completo) | LiteRT fp16 | 2.7-6 ms (GPU/NPU) | Apache 2.0 |
| RTMPose-m (MMPose) | 17 (cuerpo) o 133 (whole-body) | PyTorch/ONNX | no disponible | Apache 2.0 |
| MoveNet (Google) | 17 (cuerpo) | TFLite | ~5-10 ms (GPU) | Apache 2.0 |
| MediaPipe BlazePose | 33 (cuerpo) | TFLite | ~3-8 ms (GPU) | Apache 2.0 |

La ventaja principal de RTMW-m es la cobertura completa de 133 puntos (incluyendo cara y manos) en un unico modelo, algo que MoveNet y BlazePose no ofrecen. RTMPose-m en su variante whole-body es el equivalente en PyTorch, pero esta conversion LiteRT es la unica optimizada para GPU/NPU movil con verificacion en dispositivo.

## Limitaciones y advertencias

- El modelo es top-down: requiere un detector de persona previo que genere un recorte centrado. No detecta multiples personas ni personas parcialmente fuera del encuadre.
- La entrada fija es 256x192 (proporcion 3:4). Imagenes con otras proporciones deben recortarse o reescalarse, lo que puede afectar la precision en sujetos pequenos.
- No hay datos publicados sobre sesgos demograficos (edad, etnia, tipo de cuerpo) ni sobre rendimiento en condiciones adversas (iluminacion baja, oclusiones, ropa holgada).
- La conversion fp16 puede perder precision en comparacion con fp32, aunque el autor reporta una correlacion de 0.999 y error de 0.2 px frente a PyTorch.
- El modelo no incluye deteccion de objetos ni segmentacion; solo keypoints. Para aplicaciones completas se necesita un pipeline adicional.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base (MMPose) tiene su propia licencia Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- No hay soporte para CPU eficiente: XNNPACK rechaza el grafo fp16, por lo que en dispositivos sin GPU compatible el rendimiento sera inaceptable.
- El tiempo de carga en GPU es alto (1267 ms en Galaxy S26), lo que puede afectar al arranque de la aplicacion. Se recomienda precargar el modelo en segundo plano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/RTMW-m-WholeBody-LiteRT
- Repositorio GitHub con documentacion y ejemplos: https://github.com/john-rocky/LiteRT-Models/tree/main/rtmw
- README del modelo en GitHub: https://github.com/john-rocky/LiteRT-Models/blob/main/rtmw/README.md
- Guia de NPU para Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-npu.md
- Documentacion de LiteRT CLI (benchmark): https://developers.google.com/edge/litert/cli/commands
- Proyecto MMPose (modelo base): https://github.com/open-mmlab/mmpose
