# kjcpc/ML-Sharp-QNN

## Resumen

ML-Sharp-QNN es una conversión del modelo SHARP (Single-image High-fidelity And Rapid Photorealistic view synthesis) desarrollado por Apple, adaptado por el autor kjcpc para ejecutarse en dispositivos Android con procesadores Snapdragon mediante el SDK Qualcomm QNN. El modelo original, presentado en el artículo "Sharp Monocular View Synthesis in Less Than a Second" (arXiv:2512.10685), regresa los parámetros de una representación 3D Gaussian Splatting a partir de una única imagen, permitiendo síntesis de vistas fotorealistas en menos de un segundo en una GPU estándar. Esta conversión QNN lleva esa capacidad al Hexagon Tensor Processor (HTP) de Qualcomm, posibilitando reconstrucción 3D completamente offline en un smartphone.

La conversión consta de cinco archivos DLC (Deep Learning Container) que forman un pipeline serial: un patch encoder, un image encoder, y tres segmentos del módulo REST (disparity estimation y predicción de deltas gaussianos). La precisión es W8A16 (pesos en enteros de 8 bits, activaciones en enteros de 16 bits) con cuantización per-tensor, y requiere compilación a contexto binario HTP en el dispositivo. El tamaño total del repositorio es de 0,7 GB, lo que lo hace viable para despliegue en hardware móvil.

La relevancia actual radica en que acerca la reconstrucción 3D de alta calidad a dispositivos de consumo, eliminando la dependencia de servidores o GPUs dedicadas. Esto abre casos de uso en realidad aumentada, e-commerce, documentación de patrimonio y herramientas de diseño que requieren captura 3D inmediata en campo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de 5 modelos QNN DLC: Patch Encoder, Image Encoder, REST Segment A, REST Segment B, REST Segment C |
| Parametros totales | No disponible (no se especifica en la informacion proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | W8A16 (pesos UFIXED_POINT_8, activaciones UFIXED_POINT_16), cuantizacion per-tensor con escala y offset (BW_SCALE_OFFSET) |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | apple-amlr |
| Formato de pesos | QNN DLC (`.dlc`), requiere compilacion a HTP Context Binary en el dispositivo |

## Arquitectura y entrenamiento

El modelo original SHARP es una red neuronal de tipo transformer con dos ramas principales: un patch encoder que procesa 35 parches de 384×384 píxeles y un image encoder que procesa la imagen completa de 1536×1536 píxeles. Las características se fusionan y pasan por un módulo REST (Residual Estimation and Synthesis Transformer) dividido en tres segmentos: el segmento A realiza fusión de características (6 entradas, 6 salidas), el segmento B estima disparidad y el segmento C predice los deltas gaussianos. La salida final es un conjunto de gaussianas 3D con escala métrica absoluta.

El entrenamiento del modelo original se realizó con un conjunto de datos a gran escala de escenas multi-vista, aunque los detalles específicos del dataset y el número de tokens no se proporcionan en la información disponible. El modelo fue diseñado para generalización zero-shot, demostrando robustez en múltiples conjuntos de datos. En cuanto a la conversión QNN, se utilizó el SDK QNN 2.48.0.260626, con arquitectura HTP V68 y superior. No se menciona el uso de RLHF o DPO, ya que no es un modelo de lenguaje.

La innovación principal de SHARP reside en su capacidad de regresar directamente los parámetros de un 3D Gaussian Splatting en una sola pasada forward, sin necesidad de optimización iterativa, lo que reduce el tiempo de síntesis en tres órdenes de magnitud respecto a métodos anteriores.

## Capacidades

- Reconstrucción 3D Gaussian Splatting a partir de una única imagen, con escala métrica absoluta.
- Síntesis de vistas fotorealistas de alta resolución para puntos de vista cercanos, renderizables en tiempo real.
- Inferencia completamente offline en dispositivos Android con Snapdragon (HTP V68+), sin conexión a servidores.
- Generalización zero-shot: el modelo puede aplicarse a imágenes de dominios no vistos durante el entrenamiento.
- Soporte para renderizado de trayectorias de cámara (requiere CUDA GPU en el pipeline original; en la versión QNN no se especifica).
- Salida en formato PLY compatible con renderizadores 3DGS públicos, siguiendo la convención de coordenadas OpenCV (x derecha, y abajo, z adelante).
- No se especifican capacidades de tool calling, agentes, ni procesamiento de lenguaje, al ser un modelo puramente visual.

## Casos de uso

- Realidad aumentada en móvil: un usuario captura una foto de un objeto o escena y la aplicación genera un modelo 3D interactivo que puede visualizarse desde distintos ángulos, todo en el dispositivo. La ejecución en HTP permite latencias de menos de un segundo sin necesidad de conexión.
- Documentación de patrimonio y arqueología: los investigadores pueden tomar fotografías de campo de artefactos o estructuras y obtener reconstrucciones 3D métricas para su análisis y preservación digital, sin depender de equipos de escaneo especializados.
- Comercio electrónico: las plataformas de venta pueden ofrecer a los vendedores la posibilidad de generar vistas 3D de productos a partir de una sola imagen, mejorando la experiencia de compra sin costes de infraestructura en la nube.
- Diseño de interiores y arquitectura: los profesionales pueden capturar rápidamente un espacio existente y generar un modelo 3D para planificar reformas o visualizar mobiliario, con la ventaja de que la escala métrica permite mediciones aproximadas.
- Automatización industrial y robótica: en entornos donde no hay conectividad, un robot o dispositivo móvil puede reconstruir su entorno inmediato a partir de una imagen para navegación o manipulación, aprovechando la velocidad de inferencia on-device.
- Fotografía creativa y postproducción: los fotógrafos pueden generar desplazamientos de cámara virtuales sobre una fotografía fija, creando efectos parallax o videos de movimiento para publicaciones en redes sociales o portfolios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la conversión QNN (ML-Sharp-QNN) en la información disponible. El modelo original SHARP, según el artículo, establece un nuevo estado del arte en múltiples conjuntos de datos, reduciendo LPIPS entre un 25–34% y DISTS entre un 21–43% frente al mejor modelo previo, con un tiempo de síntesis tres órdenes de magnitud menor. Sin embargo, estos datos corresponden al modelo original en PyTorch y no a la versión cuantizada QNN. No se proporcionan métricas de rendimiento (latencia, throughput) para la ejecución en HTP.

## Requisitos de hardware

- Dispositivo Android con procesador Snapdragon que incluya Hexagon Tensor Processor (HTP) con arquitectura V68 o superior.
- Los cinco archivos DLC suman aproximadamente 659 MB (306 + 306 + 33 + 6 + 8 MB), por lo que se recomienda al menos 1 GB de almacenamiento libre y memoria RAM suficiente para cargar los modelos (no se especifica la cantidad exacta).
- No se indica si es compatible con GPUs de escritorio; la conversión está orientada exclusivamente a HTP.
- Para el pipeline original (no QNN) se requiere PyTorch con soporte CPU, CUDA o MPS, siendo el renderizado de trayectorias exclusivo de CUDA.
- Opciones de despliegue: el formato DLC debe compilarse a HTP Context Binary en el dispositivo usando el SDK QNN. No se mencionan integraciones con frameworks como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; el autor no publica mediciones de rendimiento en la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ML-Sharp-QNN (este) | Image-to-3D (QNN) | No disponible | No aplica | apple-amlr | HuggingFace (DLC) |
| apple/Sharp (original) | Image-to-3D (PyTorch) | No disponible | No aplica | apple-amlr | HuggingFace (checkpoint .pt) |
| ML-Sharp (fork con MPS) | Image-to-3D (PyTorch) | No disponible | No aplica | apple-amlr | GitHub (rcarmo) |
| ml-sharp-browser | Image-to-3D (ONNX) | No disponible | No aplica | No especificada | GitHub (miketahani) |

No se dispone de información sobre otros modelos de la misma categoría (reconstrucción 3D desde una sola imagen) para una comparativa más amplia. La tabla refleja las variantes de SHARP disponibles.

## Limitaciones y advertencias

- La conversión QNN está restringida a hardware Qualcomm con HTP V68+; no funcionará en otros SoCs móviles ni en GPUs de escritorio.
- La cuantización W8A16 puede introducir pérdida de precisión respecto al modelo original en float32; no se han publicado evaluaciones de calidad de la reconstrucción tras la cuantización.
- El pipeline requiere compilación del DLC a contexto binario HTP en el dispositivo, lo que añade complejidad de integración y posible variabilidad entre dispositivos.
- La licencia apple-amlr (Apple Machine Learning Research) impone restricciones de uso comercial; es necesario revisar los términos exactos antes de desplegar en producción.
- El modelo original tiene limitaciones inherentes: la reconstrucción 3D se limita a vistas cercanas a la imagen de entrada; escenas con oclusiones severas o geometría compleja pueden producir artefactos.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con imágenes del mundo real, puede tener un rendimiento inferior en dominios subrepresentados (por ejemplo, ciertos tipos de objetos o condiciones de iluminación).
- Riesgo de alucinación geométrica: el modelo puede inventar estructuras en zonas ambiguas de la imagen, especialmente en áreas con poca textura o reflejos especulares.
- No hay soporte para múltiples idiomas ni procesamiento de texto; es un modelo exclusivamente visual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kjcpc/ML-Sharp-QNN
- Modelo original apple/Sharp: https://huggingface.co/apple/Sharp
- Repositorio de código de Apple: https://github.com/apple/ml-sharp
- Página del proyecto: https://apple.github.io/ml-sharp/
- Artículo arXiv: https://arxiv.org/abs/2512.10685
- Fork con soporte MPS y demo Gradio: https://rcarmo.github.io/projects/ml-sharp/
- Versión para navegador via ONNX: https://github.com/miketahani/ml-sharp-browser
