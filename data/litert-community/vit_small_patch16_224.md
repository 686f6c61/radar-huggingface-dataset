# litert-community/vit_small_patch16_224

## Resumen

`vit_small_patch16_224` es una conversión al formato LiteRT (anteriormente conocido como TFLite) del modelo de clasificación de imágenes Vision Transformer (ViT) pequeño de la librería TIMM, publicado por la comunidad LiteRT en Hugging Face. El modelo original procede de la arquitectura ViT de Google Research y ha sido entrenado con la receta AugReg sobre ImageNet-21k y ajustado posteriormente sobre ImageNet-1k. Su propósito es ofrecer clasificación de imágenes y extracción de características visuales en entornos de inferencia ligera, especialmente en dispositivos móviles y de borde donde LiteRT es el runtime nativo.

La relevancia de esta ficha radica en que empaqueta un transformer visual de 22,1 millones de parámetros en un único fichero `model.tflite` de aproximadamente 0,1 GB, lo que facilita su despliegue en Android, iOS, microcontroladores de gama alta y entornos embebidos sin necesidad de un stack de PyTorch. Frente a las CNN clásicas, el ViT ofrece una arquitectura basada exclusivamente en atención, con parches de 16x16 píxeles sobre entradas de 224x224, lo que permite modelar dependencias globales desde las primeras capas.

No obstante, la información publicada por el autor es muy limitada: no se especifican licencia, idiomas, métricas de evaluación ni detalles del proceso de conversión. Esta ficha refleja exclusivamente los datos disponibles en la model card y en los metadatos del repositorio, marcando como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), parches de 16x16, imagen 224x224 |
| Parametros totales | 22,1 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 224x224) |
| Tipos de cuantizacion | no disponible (el autor no documenta variantes; el artefacto publicado es `model.tflite`) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | TFLite (`model.tflite`) |
| GMACs | 4,3 |
| Activaciones | 8,2 M |
| Dataset de ajuste | ImageNet-1k |
| Dataset de preentrenamiento | ImageNet-21k |
| Modelo base | `timm/vit_small_patch16_224.augreg_in21k_ft_in1k` |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer estándar de la familia ViT-small: divide la imagen de entrada de 224x224 en parches no solapados de 16x16 (196 tokens), los proyecta linealmente a un espacio de embedding, añade codificación posicional y aplica una pila de bloques transformer con autoatención multi-cabeza y MLP. Con 22,1 M de parámetros y 4,3 GMACs por inferencia, se sitúa en el rango ligero de la familia ViT, muy por debajo de ViT-base (86 M) y ViT-large (307 M).

El entrenamiento sigue la receta AugReg descrita por Steiner et al. (2021): preentrenamiento sobre ImageNet-21k con aumentos de datos y regularización agresivos, seguido de ajuste fino sobre ImageNet-1k. La model card cita también el paper original de ViT (Dosovitskiy et al., 2021). No se documenta en la información disponible el número exacto de tokens vistos, la composición detallada del dataset más allá de los nombres de los conjuntos, ni si se aplicaron técnicas de alineación adicionales; tampoco se detalla el proceso de conversión a LiteRT (herramientas, calibración de cuantización, etc.).

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet-1k.
- Extracción de características visuales como backbone: la model card lo declara explícitamente como "feature backbone", por lo que puede usarse para generar embeddings de imagen.
- Procesamiento de imágenes RGB de tamaño fijo 224x224 con parches de 16x16.
- Inferencia en formato LiteRT, orientada a dispositivos móviles y de borde.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales más allá de la clasificación visual.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el artefacto `model.tflite` puede integrarse directamente en apps Android o iOS mediante el runtime LiteRT, clasificando fotos en las 1.000 categorías de ImageNet sin conexión a red.
- Moderación de contenido visual en el dispositivo: al ejecutarse localmente con 4,3 GMACs por inferencia, permite filtrar imágenes potencialmente inapropiadas antes de subirlas a un servidor, reduciendo costes de ancho de banda y mejorando la privacidad.
- Etiquetado automático de fototeca personal: el modelo puede generar etiquetas de categoría para organizar grandes colecciones de imágenes en el propio dispositivo, sin enviar datos a la nube.
- Extracción de embeddings para búsqueda visual: usando el modelo como backbone de características, se pueden generar vectores de imagen y construir índices de similitud para búsqueda por imagen en catálogos pequeños o medianos.
- Preprocesado en pipelines de visión industrial: clasificación rápida de piezas o productos en cadenas de montaje con hardware embebido, aprovechando el bajo coste computacional del modelo.
- Prototipado rápido y educación: al ser un ViT pequeño y bien documentado en la literatura, sirve como base para experimentos de investigación sobre atención visual, aumentos de datos y regularización, o para demostraciones docentes de transformers en visión.
- Filtrado previo en sistemas de cámaras de bajo consumo: clasificación de fotogramas en dispositivos con recursos limitados para decidir qué imágenes merecen un análisis más profundo en el servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión top-1 ni top-5 sobre ImageNet-1k, ni comparaciones con otros modelos. Los únicos datos numéricos publicados son los de complejidad computacional: 22,1 M de parámetros, 4,3 GMACs y 8,2 M de activaciones para una entrada de 224x224.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo de 22,1 M de parámetros, la huella de memoria es reducida; en FP32 los pesos ocuparían aproximadamente 88 MB, aunque el autor no documenta el tamaño exacto del fichero `model.tflite` más allá de que el repositorio completo pesa 0,1 GB.
- GPU recomendadas: no disponible en la información proporcionada. Por su tamaño, cualquier GPU moderna podría ejecutarlo, pero el autor no publica recomendaciones.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; el modelo está pensado para el runtime LiteRT, que prioriza CPU, GPU móvil y aceleradores NPU/DSP de dispositivos.
- Opciones de despliegue: LiteRT (runtime nativo del formato TFLite). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El dato de 4,3 GMACs por inferencia permite estimar el coste computacional, pero el autor no publica tiempos medidos en ningún hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | GMACs | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `litert-community/vit_small_patch16_224` (este modelo) | 22,1 M | 224x224 | 4,3 | TFLite | no disponible | Hugging Face (33 descargas) |
| `timm/vit_small_patch16_224.augreg_in21k_ft_in1k` (modelo base) | 22,1 M | 224x224 | 4,3 | PyTorch (safetensors) | no disponible en la información | Hugging Face / TIMM |
| ViT-base patch16 224 (referencia de la familia) | 86 M | 224x224 | no disponible en la información | PyTorch | no disponible en la información | Hugging Face / TIMM |
| CNN ligeras tipo MobileNetV3 | no disponible en la información | variable | no disponible en la información | TFLite / PyTorch | no disponible en la información | Hugging Face / TIMM |

La comparación directa con alternativas queda limitada porque la información proporcionada no incluye métricas de precisión ni detalles de licencia de los modelos comparados. El modelo base en PyTorch es funcionalmente idéntico en arquitectura y pesos, diferenciándose únicamente en el formato de exportación.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre ImageNet-1k e ImageNet-21k, es previsible que herede sesgos de representación de esas bases de datos (predominio de ciertas culturas, objetos y contextos), pero no hay un análisis publicado en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas o sobreconfiadas en imágenes fuera de la distribución de ImageNet.
- Limitaciones de contexto o idioma: el modelo no procesa texto ni lenguaje; su entrada es exclusivamente visual y de tamaño fijo 224x224. Imágenes de otras resoluciones o relaciones de aspecto requieren redimensionado previo.
- Restricciones de licencia para uso comercial: la licencia no está disponible en la información proporcionada, por lo que no puede confirmarse si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base en TIMM antes de un despliegue en producción.
- Caveats para producción: el proceso de conversión a LiteRT no está documentado (no se indica si hubo cuantización, calibración o verificación de paridad numérica con el modelo original). Tampoco se publican métricas de precisión tras la conversión, por lo que la fidelidad respecto al modelo PyTorch no está garantizada por el autor.
- El repositorio tiene un número muy bajo de descargas (33) y ningún "like", lo que sugiere poca validación por parte de la comunidad.
- No se especifica la versión de LiteRT ni la compatibilidad con versiones concretas del runtime, lo que puede complicar la integración en proyectos existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/vit_small_patch16_224
- Organización LiteRT Community en Hugging Face: https://huggingface.co/litert-community
- Modelo base en TIMM: https://huggingface.co/timm/vit_small_patch16_224.augreg_in21k_ft_in1k
- Paper AugReg (Steiner et al., 2021): https://arxiv.org/abs/2106.10270
- Paper original ViT (Dosovitskiy et al., 2021): https://arxiv.org/abs/2010.11929v2
- Repositorio original de Vision Transformer de Google Research: https://github.com/google-research/vision_transformer
- Repositorio PyTorch Image Models (TIMM): https://github.com/huggingface/pytorch-image-models
