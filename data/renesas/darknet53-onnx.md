# Renesas/Darknet53-ONNX

## Resumen

Darknet53-ONNX es la exportación a formato ONNX del clasificador de imágenes Darknet-53 de la librería `timm` (`timm/darknet53.c2ns_in1k`), publicada por Renesas Electronics para su ejecución sobre la plataforma embebida R-Car X5H con NPU NPX6-48K. No se trata de un modelo de lenguaje ni de un modelo generativo: es una red convolucional de 53 capas con conexiones residuales, originalmente concebida como extractor de características de YOLOv3 (Redmon y Farhadi, 2018) y reutilizada aquí como clasificador independiente de ImageNet-1k con 1000 clases.

El interés de esta ficha no está en la arquitectura en sí, que data de 2018, sino en el artefacto de despliegue: un único fichero ONNX en FP32 que la cadena de herramientas MWMX de Renesas convierte automáticamente a INT8 en tiempo de compilación, sin necesidad de un paso de cuantización separado. El modelo tiene 41,6 millones de parámetros y 9,3 GMACs, con una resolución de entrada de 3×288×288 píxeles, que coincide con la resolución de test publicada por `timm` para este checkpoint (entrenamiento a 256×256).

La relevancia actual es acotada pero concreta: permite ejecutar clasificación de imágenes en el propio SoC del vehículo o del dispositivo industrial, con una latencia medida de 7,637812 ms por imagen en una única NPU con un solo núcleo de IA a 850 MHz, sin depender de conectividad a la nube ni de GPUs dedicadas. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache-2.0. La precisión de clasificación (accuracy sobre ImageNet-1k) figura como TBD en la model card, por lo que no puede evaluarse su calidad predictiva con los datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Darknet-53, red convolucional de 53 capas con conexiones residuales (backbone de YOLOv3) |
| Parametros totales | 41,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo de vision con entrada de tensor fijo 3×288×288 |
| Tipos de cuantizacion | FP32 (artefacto publicado); INT8 por autocast de la cadena MWMX en tiempo de compilacion |
| Idiomas soportados | no aplica (clasificacion de imagenes en 1000 clases de ImageNet-1k) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`fp32/darknet53_c2ns_in1k.onnx`); no se distribuyen safetensors ni GGUF |
| Tarea | Image classification (ImageNet-1k, 1000 clases) |
| Resolucion de entrada | 3 × 288 × 288 (resolucion de test publicada; entrenamiento a 256×256) |
| Complejidad computacional | 9,3 GMACs (segun la model card de timm) |
| Modelo base | timm/darknet53.c2ns_in1k (variante cuantizada como `base_model:quantized`) |
| Tamano del repositorio | 0,2 GB |
| Acelerador objetivo | Renesas NPX6-48K NPU en R-Car X5H |
| Runtime documentado | Renesas MWMX (Middleware MX) |

## Arquitectura y entrenamiento

Darknet-53 es una red neuronal convolucional pura, sin mecanismos de atención ni capas recurrentes, compuesta por 53 capas con conexiones residuales al estilo ResNet. Se hizo conocida como extractor de características de la familia YOLOv3 y en este repositorio se emplea como clasificador autónomo: la cabeza convolucional final proyecta sobre las 1000 clases de ImageNet-1k. Con 41,6 M de parámetros y 9,3 GMACs, es una arquitectura notablemente más pesada y menos eficiente en cómputo que los diseños posteriores de clasificación eficiente, pero su estructura convolucional estándar la hace predecible de compilar a INT8 sobre aceleradores.

La información disponible no detalla el procedimiento de entrenamiento del checkpoint original: la model card de Renesas remite a `timm/darknet53.c2ns_in1k`, que corresponde a una receta de `timm` con resolución de entrenamiento 256×256 y de test 288×288, pero no se especifican en la información proporcionada el número de tokens ni de imágenes vistas, la composición exacta del dataset (más allá de ImageNet-1k), ni si hubo fases de ajuste fino adicionales. Tampoco se documenta ningún paso de RLHF o DPO, algo que no aplica a un clasificador discriminativo. La innovación técnica destacable en este repositorio no es arquitectónica sino de despliegue: el flujo FP32 ONNX → runtime MWMX → autocast a INT8 → NPU NPX6, que elimina la necesidad de generar y validar un fichero INT8 independiente.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k a partir de entradas RGB de 288×288 píxeles.
- Extracción de características convolucionales: al ser un backbone, sus capas intermedias pueden reutilizarse para tareas posteriores (detección, segmentación, re-identificación, recuperación por similitud).
- Inferencia en INT8 sobre NPU tras el autocast de la cadena MWMX, con entrada FP32 ONNX.
- Ejecución en hardware embebido automotriz (R-Car X5H), lo que habilita clasificación en el dispositivo sin conectividad a la nube.
- Soporte de tool calling / function calling: no aplica; el modelo no genera texto ni produce llamadas a herramientas.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión-lenguaje, audio): no aplica; únicamente visión por computador discriminativa, sin cabecera de detección ni localización de objetos.
- Generación de texto, código o matemáticas: no aplica.

## Casos de uso

- Clasificación de escenas a bordo de un vehículo: el modelo se ejecuta directamente sobre el SoC R-Car X5H con una latencia de 7,637812 ms por imagen, lo que permite clasificar fotogramas de cámara en tiempo real sin enviar datos a la nube y sin añadir una GPU dedicada.
- Control de calidad en línea de producción industrial: con un ajuste fino de la cabeza clasificadora sobre imágenes de la línea, el modelo puede etiquetar piezas como conformes o defectuosas aprovechando la inferencia INT8 a aproximadamente 131 imágenes por segundo por núcleo de IA.
- Pre-etiquetado automático de datasets (auto-labeling): al clasificar grandes volúmenes de imágenes en el borde, reduce el coste de anotación manual en pipelines de MLOps antes de una revisión humana.
- Triaje y filtrado de imágenes en puerta: clasificar en el dispositivo y transmitir a la nube solo las imágenes relevantes, lo que disminuye el consumo de ancho de banda en despliegues con conectividad limitada o costosa.
- Extracción de características para tareas downstream: reutilizar las activaciones convolucionales como backbone congelado en sistemas de recuperación de imágenes, re-identificación o detección con una cabeza adicional entrenada por separado.
- Clasificación en robots móviles y sistemas de visión con presupuesto energético estricto: al ejecutarse en NPU INT8 de bajo consumo, es adecuado para plataformas alimentadas por batería donde una GPU no es viable.
- Inventario y analítica en comercio minorista: reconocimiento de categorías de producto en cámaras de estantería o pasillo, integrado en el propio dispositivo de captura.
- Investigación en cuantización y benchmarking de runtimes: el par FP32 ONNX + ejecución INT8 en NPU de Renesas sirve como caso de estudio para medir el impacto del autocast INT8 y comparar la latencia entre el runtime MWMX y otros backends ONNX.

## Benchmarks y rendimiento

La model card no publica ningún resultado de precisión (accuracy sobre ImageNet-1k figura como «TBD — not yet measured/published»), por lo que no se pueden comparar métricas de calidad predictiva con otros clasificadores. El único dato de rendimiento disponible es de latencia en hardware real, medido en modo hardware-in-the-loop:

| Runtime | Precision | Dispositivo | Latencia (ms) | Tipo |
|---|---|---|---|---|
| MWMX Runtime | INT8 (autocast) | X5H · 1× NPU · 1 nucleo · 850 MHz | 7,637812 | Medido |

Notas sobre este resultado: la configuracion de benchmark es lote de tamano 1 e entrada 3×288×288; solo se ejecuto la rebanada de 1 nucleo de IA, y la de 12 nucleos se omitio en la exportacion de origen, por lo que no existe fila de 12 nucleos. La latencia implica, de forma derivada, un throughput maximo aproximado de 131 imagenes por segundo en esa configuracion de un solo nucleo. No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un clasificador de imagenes.

## Requisitos de hardware

- Ruta oficial: placa Renesas R-Car X5H con NPU NPX6-48K, runtime MWMX y la CLI de Hugging Face para descargar el modelo. Sin este hardware y este runtime, el rendimiento documentado no es reproducible.
- Huella de pesos estimada: aproximadamente 166 MB en FP32 y unos 42 MB en INT8 (calculo derivado de los 41,6 M de parametros, no un dato publicado).
- VRAM estimada para inferencia: por debajo de 1 GB incluyendo pesos y activaciones a lote 1 y 288×288; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: no disponibles para la ruta oficial, que es una NPU embebida. El artefacto ONNX es portable en teoria a cualquier backend compatible con ONNX Runtime sobre GPU de escritorio o servidor (por ejemplo, RTX 4090, A100, H100), pero el autor no documenta ni valida esa ruta.
- GPU de consumo: si cabe en cualquier GPU con mas de 1 GB de memoria si se ejecuta mediante ONNX Runtime, aunque de nuevo sin validacion publicada por Renesas.
- CPU: viable en x86 o ARM mediante ONNX Runtime, con latencias no publicadas.
- Opciones de despliegue: MWMX Runtime sobre NPX6 (unica ruta documentada). vLLM, llama.cpp, Ollama y TGI no son aplicables: no hay pesos GGUF ni safetensors y no es un modelo de lenguaje.
- Latencia medida: 7,637812 ms por imagen (INT8, 1 NPU, 1 nucleo, 850 MHz), con throughput derivado de aproximadamente 131 imagenes por segundo en esa configuracion. No hay datos de latencia para la rebanada de 12 nucleos.

## Comparativa con modelos similares

La model card no publica accuracy, por lo que la comparacion solo puede hacerse en terminos estructurales y de formato de despliegue. Los valores de los modelos de referencia son cifras ampliamente documentadas en la literatura, no extraidas de la informacion proporcionada sobre este repositorio:

| Modelo | Parametros | GMACs | Entrada | Licencia | Formato y destino |
|---|---|---|---|---|---|
| Renesas/Darknet53-ONNX | 41,6 M | 9,3 | 288×288 | Apache-2.0 | ONNX FP32, autocast INT8 en NPU NPX6 |
| timm/darknet53.c2ns_in1k | 41,6 M | 9,3 | 288×288 (test) | Apache-2.0 | Pesos PyTorch; mismo checkpoint de origen, sin optimizacion para NPU |
| ResNet-50 (referencia general) | ~25,6 M | ~4,1 | 224×224 | variable segun implementacion | PyTorch/ONNX; alternativa estandar con menos parametros y computo |
| EfficientNet-B0 (referencia general) | ~5,3 M | ~0,39 | 224×224 | Apache-2.0 (implementacion timm) | PyTorch/ONNX; mucha menor huella y computo |
| MobileNetV3-Large (referencia general) | ~5,4 M | ~0,22 | 224×224 | Apache-2.0 (implementacion timm) | PyTorch/ONNX; disenado explicitamente para movil |

Conclusion de la comparativa: frente a las alternativas contemporaneas de clasificacion eficiente, Darknet-53 es entre 8 y 40 veces mas costoso en computo por imagen. Su ventaja competitiva no es la eficiencia sino la madurez de su compilacion a INT8 sobre la NPU de Renesas y la disponibilidad de un artefacto de despliegue ya empaquetado. No es posible comparar accuracy porque el dato no esta publicado.

## Limitaciones y advertencias

- No hay ninguna metrica de precision publicada para este repositorio (accuracy ImageNet-1k marcada como TBD), de modo que no puede validarse su calidad predictiva en produccion con la informacion disponible.
- El benchmark solo cubre la configuracion de 1 nucleo de IA; no se midio la rebanada de 12 nucleos, por lo que se desconoce el rendimiento escalado en el chip completo.
- La cuantizacion a INT8 la realiza automaticamente la cadena MWMX en tiempo de compilacion; no se documenta el calibrado, el dataset de calibracion ni la perdida de precision asociada al paso FP32 → INT8.
- Dependencia de hardware y software propietarios: la ruta documentada exige una placa Renesas R-Car X5H, la NPU NPX6 y el runtime MWMX. Esto limita la portabilidad y ata el despliegue a un unico proveedor.
- Aunque el fichero ONNX es teoricamente portable a otros backends, el autor no valida esa ruta ni garantiza la compatibilidad de opset ni el comportamiento en ONNX Runtime.
- Sesgos conocidos: al entrenarse sobre ImageNet-1k, hereda los sesgos de representacion y las limitaciones taxonomicas de ese dataset (clases desequilibradas, categorias culturalmente sesgadas, ausencia de clases relevantes para dominios industriales o regionales).
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con alta confianza en imagenes fuera de la distribucion de ImageNet (OOD), algo especialmente relevante en dominios industriales o automotrices.
- Solo clasifica; no localiza objetos ni ofrece cajas delimitadoras, y no dispone de cabecera de deteccion.
- Modelo de vision: no procesa ni genera lenguaje, por lo que las capacidades multilingues y de contexto largo no son de aplicacion.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion con atribucion, pero la licencia del modelo no cubre el hardware, el runtime MWMX ni las herramientas de Renesas, cuyos terminos son independientes.
- Advertencia para produccion: la arquitectura es de 2018 y esta muy por encima en coste computacional de alternativas modernas de tamano comparable o inferior; si el requisito principal es precision o eficiencia, conviene evaluar backbones mas recientes antes de fijar esta opcion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Renesas/Darknet53-ONNX
- Modelo base en timm: https://huggingface.co/timm/darknet53.c2ns_in1k
- Paper de origen (YOLOv3: An Incremental Improvement, Redmon y Farhadi, 2018): https://arxiv.org/abs/1804.02767
- Sitio corporativo de Renesas: https://www.renesas.com/
- Catalogo de productos de Renesas: https://www.renesas.com/en/products
- Renesas Electronics en Wikipedia (ingles): https://en.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics en Wikipedia (aleman): https://de.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics en Wikipedia (frances): https://fr.wikipedia.org/wiki/Renesas_Electronics
