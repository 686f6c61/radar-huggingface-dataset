# BiernyVR/pokemon-classifier-mobilenetv3

## Resumen

El modelo `BiernyVR/pokemon-classifier-mobilenetv3` es un clasificador de imágenes desarrollado por el usuario BiernyVR que identifica las 1.025 especies oficiales de Pokémon de las generaciones 1 a 9 (desde Bulbasaur, #0001, hasta Pecharunt, #1025). Está construido sobre la arquitectura convolucional MobileNetV3-Large, preentrenada en ImageNet-1K, con una cabeza clasificadora lineal adaptada de 960 a 1.025 clases. Su objetivo declarado es funcionar como motor de visión por computador de una Pokédex nativa para Android.

El modelo se distribuye principalmente en formato ONNX (ONNX Runtime), junto con un checkpoint de PyTorch y un fichero JSON con las 1.025 etiquetas. Con aproximadamente 22,4 MB de peso y unos 4,2 millones de parámetros según el autor, está diseñado explícitamente para despliegue en el borde (Edge AI): móviles, Raspberry Pi, web o C++, con una latencia declarada inferior a 25 ms en CPU de smartphone y funcionamiento totalmente offline.

Su relevancia actual es la de un caso práctico de destilación de un backbone genérico de clasificación hacia un dominio muy concreto y de vocabulario cerrado, con licencia MIT y pipeline estándar de `image-classification`. No obstante, es un proyecto fan-made sin resultados de benchmarks publicados y con advertencias explícitas de uso no comercial derivadas de las marcas registradas de Nintendo, Creatures Inc. y GAME FREAK Inc.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Large (CNN), `torchvision.models.mobilenet_v3_large` |
| Parametros totales | ~4,2 M (cifra indicada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de imagen `[batch, 3, 224, 224]`) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX FP32; al ser ONNX es cuantizable con las herramientas de ONNX Runtime) |
| Idiomas soportados | no aplica (clasificación de imágenes); las etiquetas de clase están en inglés |
| Licencia | MIT |
| Formato de pesos | ONNX (`pokemon_classifier.onnx`) y checkpoint de PyTorch (`pokemon_mobilenet_large_best.pth`); etiquetas en `pokemon_labels.json` |

## Arquitectura y entrenamiento

La base es MobileNetV3-Large, una red convolucional con bloques de convolución invertida con atención squeeze-and-excitation, activaciones h-swish y una cabeza de clasificación lineal. En este modelo la cabeza se proyecta de 960 características a 1.025 clases. La entrada es de `[batch_size, 3, 224, 224]`, con normalización estándar de ImageNet (media `[0.485, 0.456, 0.406]`, desviación `[0.229, 0.224, 0.225]`) y soporte de batching dinámico en ONNX.

Según la información disponible, el entrenamiento partió de pesos preentrenados en ImageNet-1K y utilizó un dataset multi-fuente de sprites y artworks (arte oficial, renders 3D del servicio Home y sprites de píxeles). El autor aplicó aumentos geométricos y fotométricos agresivos (rotación, jitter de perspectiva, transformación afín, desenfoque y variación de iluminación) con el fin de simular la captura con cámara de cartas físicas, figuras y libros. El optimizador fue AdamW con un schedule de cosine annealing. No se especifican el número total de tokens muestreados, el tamaño exacto del dataset, la composición por generación ni si hubo una fase adicional de refinamiento (RLHF/DPO no aplica en clasificación).

## Capacidades

- Clasificación de imagen en 1.025 clases cerradas correspondientes a los Pokémon de las generaciones 1 a 9.
- Inferencia en tiempo real sobre cámara (CameraX + ONNX Runtime Android) para cartas coleccionables, figuras y libros.
- Funcionamiento totalmente offline, sin dependencia de red ni de servicios externos.
- Salida de probabilidades por clase y ranking top-k (el ejemplo de la model card muestra top-5).
- Batching dinámico en la exportación ONNX, útil para procesar lotes de imágenes en servidor.
- Soporte de ejecución en múltiples plataformas mediante ONNX Runtime: Android, iOS, Raspberry Pi, web (onnxruntime-web), C++ y Python.
- Disponibilidad de checkpoint nativo en PyTorch para reentrenamiento o fine-tuning adicional.
- No soporta tool calling, uso de agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general de propósito abierto, audio ni modo thinking. Es exclusivamente un clasificador de imagen de vocabulario cerrado.

## Casos de uso

- Pokédex móvil con escaneo en directo: la aplicación abre la cámara, captura un fotograma, lo redimensiona a 224x224 y ejecuta el ONNX en CPU; con menos de 25 ms declarados por inferencia se puede refrescar la identificación casi en cada fotograma.
- Identificación offline en zonas sin cobertura: el modelo y el fichero de etiquetas caben holgadamente en el almacenamiento de un móvil (~22,4 MB), por lo que la app no necesita backend ni conexión de datos.
- Catalogación e inventario de colecciones: procesado por lotes con batching dinámico para etiquetar automáticamente carpetas de fotos de una colección y generar un índice por ID de la Pokédex Nacional.
- Autoetiquetado de datasets propios: uso como clasificador previo para preanotar imágenes antes de una revisión manual, reduciendo el coste de construcción de datasets de fan art o de cartas.
- Aplicaciones educativas infantiles: reconocimiento de Pokémon para juegos de aprendizaje, con la ventaja de que todo el cálculo ocurre en el dispositivo y no se envían imágenes a un servidor.
- Despliegue en Raspberry Pi o dispositivos de bajo consumo: un modelo de ~22 MB y ~4,2 M de parámetros es viable en placas SBC con CPU ARM, útil para instalaciones interactivas o kioscos.
- Integración en juegos y experiencias de realidad aumentada: la clasificación en el propio dispositivo permite superponer información del Pokémon detectado sin latencia de red perceptible.
- Prototipado rápido con ONNX Runtime en Python: el ejemplo de la model card permite tener inferencia funcional en pocas líneas, ideal para validar una idea antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la métrica `accuracy` en los tags, pero no incluye ningún valor numérico, ni el tamaño del conjunto de validación, ni la matriz de confusión por clase. Tampoco se aportan comparaciones con otros clasificadores de Pokémon. El único dato de rendimiento declarado es la latencia de inferencia en CPU de smartphone (menos de 25 ms) y el tamaño del fichero ONNX (~22,4 MB), que no constituyen un benchmark de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima. Con ~4,2 M de parámetros en FP32 el peso ocupa unos 17-22 MB, por lo que la huella de memoria es inferior a 100 MB incluso con buffers intermedios y batching moderado.
- GPU recomendadas: no necesita GPU. Cualquier GPU, incluida una GTX 1050 o una iGPU moderna, es más que suficiente; en la práctica el cuello de botella será el preprocesado de imagen, no el modelo.
- Cabe en cualquier GPU de consumo, e incluso en dispositivos sin GPU dedicada: CPU de smartphone, Raspberry Pi, navegador con WebAssembly.
- Aceleradores opcionales: los execution providers de ONNX Runtime permiten usar CUDA, DirectML, NNAPI (Android), Core ML (iOS) o TensorRT si se desea reducir aún más la latencia.
- Opciones de despliegue: ONNX Runtime (`CPUExecutionProvider`, `NNAPIExecutionProvider`, `CoreMLExecutionProvider`, `CUDAExecutionProvider`), `onnxruntime-web` para navegador, `onnxruntime` en C++ y Python, y PyTorch para el checkpoint `.pth`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagen.
- Latencia y throughput estimados: el autor declara menos de 25 ms por inferencia en CPU de smartphone y latencia de red de 0 ms al ser offline. No se publican cifras de throughput en GPU ni con batching.

## Comparativa con modelos similares

No se dispone de otros clasificadores de Pokémon comparables con benchmarks publicados. La comparación más razonable es frente a los backbones genéricos de clasificación de imagen que podrían servir de alternativa, teniendo en cuenta que ninguno de ellos ofrece las 1.025 clases de Pokémon de forma nativa.

| Modelo | Arquitectura | Parametros | Clases | Entrada | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|---|
| pokemon-classifier-mobilenetv3 | MobileNetV3-Large | ~4,2 M (según el autor) | 1.025 (Pokémon) | 224x224 | MIT | ONNX + PyTorch, HuggingFace |
| MobileNetV3-Large (referencia, ImageNet-1K) | MobileNetV3-Large | ~5,4 M | 1.000 (ImageNet) | 224x224 | BSD-3 (torchvision) | PyTorch Hub / torchvision |
| EfficientNet-B0 (referencia, ImageNet-1K) | EfficientNet | ~5,3 M | 1.000 (ImageNet) | 224x224 | BSD-3 (torchvision) | PyTorch Hub / torchvision |
| ResNet-50 (referencia, ImageNet-1K) | ResNet | ~25,6 M | 1.000 (ImageNet) | 224x224 | BSD-3 (torchvision) | PyTorch Hub / torchvision |

Los datos de parámetros de los modelos de referencia corresponden a sus implementaciones estándar en torchvision. No se incluyen cifras de precisión porque no hay benchmarks publicados del modelo analizado y las métricas de ImageNet-1K no son trasladables a este dominio.

## Limitaciones y advertencias

- No hay ninguna métrica de precisión publicada: se desconoce la exactitud real por clase, el comportamiento en clases visualmente similares (por ejemplo evoluciones o formas regionales) y el rendimiento en imágenes ruidosas.
- Riesgo de alucinación en sentido clasificatorio: el modelo siempre devuelve una distribución sobre 1.025 clases, por lo que ante una imagen que no sea un Pokémon (o de muy baja calidad) asignará una etiqueta con una confianza que puede ser engañosa. Se recomienda aplicar un umbral de confianza y una clase de rechazo a nivel de aplicación.
- Sesgo de dominio: el entrenamiento se basa en sprites y artworks oficiales con aumentos sintéticos. El rendimiento en fotos reales de cartas con reflejos, fundas, sombras o ángulos extremos puede degradarse respecto a las condiciones simuladas.
- Limitación de idioma: las etiquetas del fichero `pokemon_labels.json` están en inglés; no hay localización a otros idiomas.
- Cobertura cerrada: no reconoce Pokémon de fan games, formas no oficiales, fusiones ni criaturas de otras franquicias.
- Discrepancia en el recuento de parámetros: el autor indica ~4,2 M, una cifra inferior a la del MobileNetV3-Large de referencia en torchvision (~5,4 M). Conviene verificar el modelo real antes de asumir cifras de memoria exactas.
- Restricciones legales para uso comercial: Pokémon y los nombres de los personajes son marcas registradas de Nintendo, Creatures Inc. y GAME FREAK Inc. El autor declara que es un proyecto fan-made no comercial con fines educativos. Aunque el código y los pesos se publican bajo licencia MIT, la licencia no exime de los derechos de marca sobre los personajes representados en las clases.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, tamaño de repositorio de 0,0 GB, sin validación por parte de la comunidad ni historial de mantenimiento. No se recomienda su uso en producción sin una validación propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BiernyVR/pokemon-classifier-mobilenetv3
- Repositorio de MobileNetV3 en torchvision (arquitectura base): https://pytorch.org/vision/stable/models/mobilenetv3.html
- Documentación de ONNX Runtime: https://onnxruntime.ai/docs/
- Paper de MobileNetV3 (Searching for MobileNetV3): https://arxiv.org/abs/1905.02244
- Paper de MobileNetV2 (referencia de bloques invertidos): https://arxiv.org/abs/1801.04381
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, a demos, a repositorios del autor ni a papers adicionales.
