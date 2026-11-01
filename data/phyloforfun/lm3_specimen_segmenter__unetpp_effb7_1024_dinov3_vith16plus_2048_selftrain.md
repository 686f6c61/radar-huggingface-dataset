# phyloforfun/lm3_specimen_segmenter__unetpp_effb7_1024_dinov3_vith16plus_2048_selftrain

## Resumen

El modelo `lm3_specimen_segmenter__unetpp_effb7_1024_dinov3_vith16plus_2048_selftrain` es un segmentador binario de imagenes desarrollado por el usuario phyloforfun dentro del proyecto LeafMachine3 (LM3), una herramienta de digitalizacion y analisis de especimenes de herbario. Su tarea es separar el material vegetal (hojas, tallos, flores) del resto del pliego de herbario (etiquetas, papel, anotaciones) para producir una mascara de primer plano que permita la eliminacion automatica del fondo. Es la version 9 de la linea UNet++ del proyecto y sustituye a la version 8 como modelo por defecto del paso `specimen_segmenter` en LeafMachine3 a partir de la version 3.0.1044.

Tecnicamente se trata de una red UNet++ con encoder EfficientNet-B7 preentrenado en ImageNet, 66,4 millones de parametros y una unica clase de salida. Trabaja sobre la hoja completa reescalada con letterbox a una entrada RGB de 1024 x 1024 pixeles y produce logits de la misma resolucion que, tras aplicar sigmoid y umbral 0,5, generan la mascara de planta.

La relevancia de esta version radica en su receta de autoentrenamiento (self-training): se reentrena la receta de la v8 sobre las propias mascaras de la v8 ya limpiadas por el paso de eliminacion de papel de LeafMachine3, de modo que el modelo aprende directamente la salida limpia y reduce la dependencia del postprocesado posterior. El autor reporta que el paso de eliminacion de papel retira una mediana del 0,08% de la mascara de la v9 frente al 1,2% de la v8 en hojas de test aleatorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet++ (skip pathways anidados y densamente conectados) con encoder EfficientNet-B7 |
| Parametros totales | 66,4 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 1024 x 1024 px) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en float32 PyTorch, ONNX opset 17, TorchScript, Core ML float16 y Core ML float32) |
| Idiomas soportados | no aplica (modelo de segmentacion de imagenes) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `best.pt` (PyTorch), `model.onnx` (ONNX opset 17), `model.torchscript.pt` (libtorch), `model.mlpackage` (Core ML float16 y float32) |

## Arquitectura y entrenamiento

La red es una UNet++ implementada con `segmentation_models_pytorch.UnetPlusPlus`, con encoder EfficientNet-B7 inicializado con pesos de ImageNet y una cabeza de un canal sin activacion (logits). La red completa se entrena desde el encoder de ImageNet: no parte de los pesos de la v8. Los pesos exportados son la copia de media movil exponencial (EMA, decay 0,9998 con warm-up) en la epoca 30 de 30. La entrada es la hoja completa con letterbox sobre un cuadrado blanco de 1024 x 1024, RGB y normalizacion con media y desviacion tipica de ImageNet; la salida es un tensor `logits` de forma `[1, 1, 1024, 1024]`.

El entrenamiento es de autoentrenamiento sobre 27.772 pliegos: los objetivos son las mascaras de la UNet++ v8 (revision `112f2da`, epoca 7) pasadas por el paso `LLR_Hyst_KeepBlobs` de eliminacion de papel de LeafMachine3. Para cada pliego, en la rejilla de 2.048 pixeles, se ejecuta la v8 tres veces (tal cual, con flip horizontal y con el pliego escalado a 0,75 dentro del lienzo de 1024); los pixeles donde las tres pasadas discrepan se excluyen del entrenamiento (peso 0; 0,58% de la hoja de media). La receta de la v8 se mantiene: 30 epocas, batch 5, AdamW (lr 1e-4, weight decay 1e-4), schedule coseno, precision mixta, entropia cruzada generalizada (q 0,7) + Dice + 0,5 x termino de borde de imagen (alpha 10) ponderados por pixel, banda de 6 pixeles alrededor de cada contorno no aprendida salvo que haya borde en la imagen, y el pad blanco del letterbox entrenado como fondo. Aumentacion: flips, rotaciones de 90 grados, transpose, brillo/contraste 0,2 y hue/saturacion/valor 10/15/10. Los splits son train 22.277 pliegos (147 con mascara vacia omitidos), val 2.782 (23 omitidos) y test 2.713 (19 omitidos).

## Capacidades

- Segmentacion binaria de primer plano (planta frente a no planta) sobre pliegos de herbario completos.
- Eliminacion de fondo para aislamiento del material vegetal en imagenes de especimenes.
- Generacion directa de mascaras limpias que reducen la necesidad del postprocesado de eliminacion de papel de LeafMachine3.
- Inferencia sobre la hoja completa en una unica pasada de 1024 x 1024, sin necesidad de recortes ni deteccion previa.
- Exportacion multiplataforma: PyTorch, ONNX (onnxruntime), TorchScript (libtorch), Core ML float16 (iOS 16 / macOS 13) y Core ML float32 con aceleracion por GPU de Apple en macOS.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingues ni modalidades de audio o video.

## Casos de uso

- Digitalizacion masiva de herbarios: procesar lotes de miles de pliegos para generar mascaras de planta que alimenten pipelines posteriores de extraccion de rasgos morfologicos, gracias a su salida directa y limpia en una sola pasada.
- Eliminacion de fondo en colecciones digitales: sustituir el pliego completo por la silueta del material vegetal para catalogos, visores web o impresion, reduciendo el trabajo manual de recorte.
- Entrenamiento de modelos aguas abajo: usar las mascaras como pseudoetiquetas o datos de preentrenamiento para detectores de hojas, flores o frutos en imagenes de herbario.
- Control de calidad de digitalizaciones: detectar pliegos con mascaras anomalas o vacias que indiquen problemas de captura, encuadre o presencia de material no vegetal.
- Analisis morfometrico: medir area foliar, cobertura o proporcion de material vegetal por pliego a partir de la mascara binaria, con aplicaciones en fenologia y taxonomia cuantitativa.
- Despliegue en aplicaciones de escritorio o moviles: integrar el modelo en herramientas de campo o laboratorio mediante los formatos Core ML (Apple) u ONNX, sin depender de infraestructura de servidor.
- Investigacion en segmentacion con etiquetas debiles: usar la receta de autoentrenamiento y los pesos como referencia para experimentos de self-training en dominios con anotacion escasa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una comparacion operativa entre la v9 y la v8: el paso de eliminacion de papel de LeafMachine3 retira una mediana del 0,08% de la mascara de la v9 frente al 1,2% de la v8 en hojas de test aleatorias, y la proporcion de planta en la hoja pasa del 15,75% antes del postprocesado al 15,15% despues en el conjunto de objetivos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 66,4 M de parametros en float32 los pesos ocupan aproximadamente 266 MB, y la activacion a 1024 x 1024 con EfficientNet-B7 requiere varios GB de memoria, por lo que se recomienda al menos 8-12 GB de VRAM para inferencia comoda en GPU.
- GPU recomendadas: no especificadas por el autor; por tamano y resolucion de entrada, tarjetas tipo NVIDIA A100, H100, RTX 4090 o RTX 3090 son adecuadas. En Apple, el modelo Core ML float32 esta pensado para ejecutarse en la GPU del Mac.
- Cabe en GPU de consumo: si, en tarjetas consumer con suficiente VRAM (por ejemplo RTX 3090, RTX 4090); en modelos con menos de 8 GB puede requerir reducir el batch o usar los formatos exportados.
- Opciones de despliegue: onnxruntime (runtime por defecto de LM3), PyTorch, TorchScript/libtorch, Core ML (iOS 16 / macOS 13) y Core ML float32 en macOS.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lm3_specimen_segmenter v9 (este modelo) | 66,4 M | 1024 x 1024 | Segmentacion binaria planta/fondo en pliegos de herbario | AGPL-3.0 | HuggingFace, formatos PyTorch/ONNX/TorchScript/Core ML |
| lm3_specimen_segmenter v8 (`..._consensus`) | no disponible en la informacion | 1024 x 1024 | Segmentacion binaria planta/fondo en pliegos de herbario | AGPL-3.0 | HuggingFace |
| Segmentadores genericos (SAM, U-Net clasica) | variable | variable | Segmentacion general de imagenes | variable | variable |

La informacion proporcionada solo permite comparar con la v8 de la misma linea, que la v9 sustituye como modelo por defecto; no se aportan datos de benchmarks frente a segmentadores genericos.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en pliegos de herbario; no es un segmentador generico y su rendimiento fuera de ese dominio no esta documentado.
- Depende de la calidad de las pseudoetiquetas de la v8 y del paso de eliminacion de papel de LeafMachine3; los errores sistematicos de esas etapas pueden propagarse.
- Los pixeles donde las tres pasadas de la v8 discrepan se excluyen del entrenamiento, lo que puede dejar casos ambiguos peor cubiertos.
- Riesgo de mascaras vacias o incompletas en pliegos con material vegetal poco visible, iluminacion deficiente o encuadre anomalo; el propio dataset de entrenamiento omite pliegos con mascara vacia.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre obras derivadas y el uso en servicios en red; es necesario revisar su compatibilidad antes de un uso comercial propietario.
- Las imagenes, mascaras y pesos de entrenamiento no se distribuyen, lo que limita la reproducibilidad completa del entrenamiento.
- No dispone de soporte multilingue, tool calling ni razonamiento; cualquier uso fuera de la segmentacion de imagenes queda fuera de su alcance.
- El modelo requiere la version 3.0.1044 o superior de LeafMachine3 para ser reconocido como modelo por defecto.

## Enlaces

- HuggingFace: https://huggingface.co/phyloforfun/lm3_specimen_segmenter__unetpp_effb7_1024_dinov3_vith16plus_2048_selftrain
- Modelo predecesor (UNet++ v8): https://huggingface.co/phyloforfun/lm3_specimen_segmenter__unetpp_effb7_1024_dinov3_vith16plus_2048_consensus
- segmentation_models.pytorch: https://github.com/qubvel-org/segmentation_models.pytorch
- UNet++ (Zhou et al., 2018): no disponible enlace directo en la informacion proporcionada
- EfficientNet (Tan y Le, 2019): no disponible enlace directo en la informacion proporcionada
- DINOv3 (Simeoni et al., 2025): no disponible enlace directo en la informacion proporcionada
- Generalized Cross-Entropy Loss (Zhang y Sabuncu, 2018): no disponible enlace directo en la informacion proporcionada
