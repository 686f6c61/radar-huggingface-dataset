# med-herb-lens/model-3-4661eff4

## Resumen

`model-3-4661eff4` es un clasificador de imágenes de plantas medicinales publicado en HuggingFace por el usuario `med-herb-lens` bajo licencia CC BY 4.0. No se trata de un modelo de lenguaje ni de un modelo fundacional entrenado desde cero, sino de una cabeza de clasificación lineal entrenada en dispositivo sobre los embeddings congelados del extractor de características `dinov2_vits14` de MediaPipe (Apache 2.0). El resultado se exporta en formato TensorFlow Lite para inferencia on-device.

El modelo resuelve una tarea muy acotada: clasificar una imagen RGB de 224×224 píxeles en una de diez especies vegetales concretas (Cyperus iria, Echinochloa colonum, Imperata cylindrica, Ipomoea aquatica, Mimosa pigra, Nelumbo nucifera, Phragmites karka, Phyllanthus reticulatus, Praxelis clematidea y Tropaeolum majus). Forma parte del ecosistema de la aplicación Med Herb Lens, una app prototipo de identificación de plantas medicinales descrita en dos publicaciones académicas (Procedia Computer Science 2025 e IoT 2025).

Su relevancia es limitada y de nicho: demuestra un flujo de aprendizaje continuo en el borde (edge) donde usuarios finales pueden añadir especies y reentrenar la capa final sin salir del dispositivo. No dispone de datos publicados de rendimiento, benchmarks ni tamaño de parámetros, y su repo ocupa 0.0 GB según HuggingFace, lo que sugiere un artefacto muy pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal sobre embeddings de `dinov2_vits14` (MediaPipe image embedder); exportado a TensorFlow Lite |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224 RGB) |
| Tipos de cuantizacion | no disponible (formato TFLite; cuantización concreta no especificada) |
| Idiomas soportados | no disponible (las etiquetas de especie están en latín) |
| Licencia | CC BY 4.0 |
| Formato de pesos | TFLite (`model.tflite`) con metadatos que incluyen `labels.txt` |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas: primero un extractor de embeddings de imagen `dinov2_vits14` (ViT-S/14 de DINOv2, ~22M de parámetros, licencia Apache 2.0) integrado vía MediaPipe; después una capa de clasificación final entrenada específicamente para este modelo. El entrenamiento se realizó en el dispositivo del usuario dentro de la app Med Herb Lens, sobre las diez especies listadas, y solo se ajustó la capa final (el backbone permanece congelado).

No se especifican en la información disponible el número de imágenes de entrenamiento, la composición del dataset, la resolución de aumento de datos, la función de pérdida ni si se aplicó regularización. Tampoco se documenta el proceso de validación ni métricas de accuracy. La model card menciona que el modelo "puede seguir aprendiendo" añadiendo especies o fotos y reentrenando, lo que encaja con el enfoque de *continual learning* periférico descrito en la segunda publicación citada (IoT, 2025).

## Capacidades

- Clasificación de imágenes RGB de 224×224 en una de diez especies de plantas medicinales o invasoras.
- Salida de una probabilidad por especie (softmax de 10 clases).
- Inferencia on-device en cualquier runtime compatible con TensorFlow Lite (Android, iOS, microcontroladores, navegador vía WebAssembly).
- Etiquetas embebidas en los metadatos del `.tflite` (`labels.txt`), lo que permite autodescubrimiento de clases.
- Reentrenamiento incremental dentro de la app Med Herb Lens (añadir especies o fotos y volver a entrenar la capa final).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión general, audio ni capacidades multilingües.

## Casos de uso

- **Identificación de plantas medicinales en campo sin conectividad**: la app Med Herb Lens carga el `.tflite` y clasifica la foto del usuario localmente, útil en zonas rurales sin cobertura. Adecuado por el tamaño reducido del artefacto y la inferencia TFLite.
- **Aplicación educativa de botánica**: integrar el modelo en apps de aprendizaje para que estudiantes comparen la predicción con la especie real y refuercen el reconocimiento visual de las diez especies incluidas.
- **Detección temprana de especies invasoras**: varias de las clases (Mimosa pigra, Praxelis clematidea, Imperata cylindrica) son invasoras conocidas; el modelo puede servir como primer filtro en apps de ciencia ciudadana para reportar avistamientos.
- **Prototipado de pipelines de visión en el borde**: sirve como ejemplo reproducible de cómo combinar un embedder DINOv2 con una cabeza lineal entrenada en dispositivo y exportar a TFLite para despliegue en Android/iOS.
- **Base para aprendizaje continuo federado o local**: el diseño permite que cada usuario añada sus propias especies y reentrene la capa final, útil como banco de pruebas para investigar *continual learning* en el borde.
- **Filtro previo en inventarios de herbario**: usar el clasificador como paso de triaje para etiquetar automáticamente fotos de herbario entre las diez especies y derivar el resto a revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye accuracy, F1, matriz de confusión ni comparación con otros clasificadores. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; por el tamaño del backbone ViT-S/14 (~22M parámetros) y una cabeza lineal de 10 clases, el modelo cabe holgadamente en menos de 1 GB en FP32 y en decenas de MB en cuantización int8.
- **GPU recomendadas**: no requiere GPU; está pensado para CPU móvil y aceleradores NPU/DSP vía TFLite (NNAPI en Android, Core ML en iOS).
- **Consumer GPU**: irrelevante; el modelo está diseñado para ejecutarse en dispositivo, no en servidores con GPU dedicada.
- **Opciones de despliegue**: TensorFlow Lite (Android, iOS, Linux, Web vía WASM), MediaPipe Tasks, y cualquier runtime compatible con el formato `.tflite`.
- **Latencia y throughput**: no disponibles en la información proporcionada; en un móvil moderno con aceleración NNAPI se espera del orden de decenas de milisegundos por imagen, pero es una estimación no confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `model-3-4661eff4` (este) | Cabeza lineal sobre DINOv2 ViT-S/14, TFLite | 10 especies | 224×224 RGB | CC BY 4.0 | HuggingFace, 8 descargas |
| PlantNet / Pl@ntNet API | Servicio en la nube, modelo propietario | Miles de especies | Imagen variable | Propietaria / API comercial | API pública con cuotas |
| iNaturalist (CV model) | Clasificador en la nube | Miles de especies | Imagen variable | Modelo no redistribuible | Solo vía API |
| DINOv2 ViT-S/14 (base) | Embedder visual | N/A (features) | 224×224 o superior | Apache 2.0 | HuggingFace, ampliamente usado |

La comparación directa con Pl@ntNet o iNaturalist no es equitativa: este modelo cubre solo diez especies y no publica métricas, mientras que los servicios en la nube cubren miles de especies con validación extensa. Su ventaja es la inferencia local, la licencia permisiva y la posibilidad de reentrenamiento por el usuario.

## Limitaciones y advertencias

- **Riesgo sanitario explícito**: la model card advierte que nunca debe consumirse una planta ni usarse como medicina basándose en la predicción del modelo. Un falso positivo puede tener consecuencias graves.
- **Cobertura mínima**: solo reconoce diez especies; cualquier planta fuera de esa lista se clasificará erróneamente en una de las diez clases (no hay clase "desconocida").
- **Sin métricas publicadas**: no hay accuracy, F1 ni matriz de confusión, por lo que no es posible evaluar su fiabilidad antes de desplegarlo.
- **Sesgos de dataset desconocidos**: se desconoce la distribución de imágenes de entrenamiento (iluminación, fondo, etapa de crecimiento, geografía), lo que puede provocar sesgos hacia condiciones concretas.
- **Etiquetas introducidas manualmente**: el propio autor advierte que los nombres de especie fueron escritos por quien compartió el modelo; posibles erratas taxonómicas.
- **Alucinación de clase**: como todo clasificador cerrado, siempre devuelve una etiqueta con alta confianza incluso ante imágenes irrelevantes.
- **Licencia CC BY 4.0**: permite uso comercial con atribución, pero exige citar al autor y las publicaciones asociadas; conviene revisar la compatibilidad con el backbone DINOv2 (Apache 2.0) y MediaPipe.
- **Sin soporte multilingüe ni de texto**: no es un modelo de lenguaje; no debe esperarse generación, razonamiento ni diálogo.
- **Madurez**: 8 descargas, 0 likes, sin actualizaciones desde su creación; no hay garantía de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/med-herb-lens/model-3-4661eff4
- Página de la app Med Herb Lens: https://med-herb-lens.pages.dev/about.html
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Paper de referencia (Procedia Computer Science, 2025): https://doi.org/10.1016/j.procs.2025.09.382
- Paper de referencia (IoT, 2025): https://doi.org/10.3390/iot7030057
- DINOv2 (backbone base): https://github.com/facebookresearch/dinov2
- MediaPipe Image Embedder: https://ai.google.dev/edge/mediapipe/solutions/vision/image_embedder
- TensorFlow Lite: https://ai.google.dev/edge/litert
