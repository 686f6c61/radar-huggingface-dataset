# AX1Y2JP/MobileCLIP2-S0-ONNX

## Resumen

MobileCLIP2-S0-ONNX es una exportación a formato ONNX del modelo MobileCLIP2-S0 desarrollado por Apple Machine Learning Research, un modelo de visión-lenguaje de tipo CLIP diseñado para clasificación de imágenes zero-shot y tareas de alineación imagen-texto en entornos con recursos limitados. Esta versión concreta, publicada por el usuario AX1Y2JP, no es un modelo nuevo sino una conversión del checkpoint original de Apple (a su vez derivado de la versión de OpenCLIP alojada por timm) a grafos ONNX separados para los codificadores de imagen y de texto, con el objetivo de facilitar su despliegue en producción mediante ONNX Runtime sin depender del stack de PyTorch.

La relevancia de esta ficha radica en que MobileCLIP2 pertenece a la familia de modelos CLIP eficientes de Apple, pensados para inferencia en dispositivo (edge) con un coste computacional muy reducido. El modelo emplea una arquitectura de doble torre: un codificador visual basado en FastViT (una red híbrida convolucional-transformer con reparametrización de ramas al estilo MobileOne) y un codificador de texto transformer. La exportación incluye variantes en fp16 e int8, lo que permite ajustar el equilibrio entre precisión y latencia.

El repositorio ocupa aproximadamente 0,6 GB y está publicado bajo la licencia Apple Machine Learning Research Model License (apple-amlr), que impone restricciones específicas de uso. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks en la información proporcionada, por lo que los apartados correspondientes se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP de doble torre: codificador visual FastViT (reparametrizado para inferencia) + codificador de texto transformer |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación zero-shot, no generativo) |
| Tipos de cuantización | fp16 (pesos fp16, E/S float32) e int8 (weight-only MatMulNBits, embedding de tokens int8 por filas) |
| Idiomas soportados | no disponible |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement) |
| Formato de pesos | ONNX (opset 23, ONNX Runtime 1.22+), grafos separados para visión y texto, más tokenizer.json |

## Arquitectura y entrenamiento

El modelo sigue el paradigma CLIP: dos codificadores independientes que proyectan imágenes y textos a un espacio latente compartido, entrenados con un objetivo contrastivo para maximizar la similitud entre pares imagen-texto correctos. El codificador visual se basa en FastViT, una arquitectura híbrida que combina bloques convolucionales y atención, y que en esta exportación ha sido reparametrizada para inferencia fusionando las ramas multicamino de estilo MobileOne, sin alterar las salidas. El codificador de texto es un transformer que procesa las descripciones textuales y produce embeddings normalizados comparables a los visuales mediante un escalar `logit_scale` almacenado en los metadatos del grafo ONNX.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos contrastivos de este tipo). La innovación técnica destacable de esta exportación es la separación en dos grafos ONNX independientes, la inclusión de variantes fp16 e int8, y una corrección relevante del tokenizer: el tokenizer.json incluido rellena con el id 0 para coincidir con open_clip, ya que la configuración original de Hugging Face rellenaba con el token de fin de texto, lo que degradaba la precisión zero-shot.

## Capacidades

- Clasificación de imágenes zero-shot mediante comparación de embeddings imagen-texto y softmax sobre las etiquetas candidatas.
- Recuperación imagen-texto y texto-imagen (búsqueda semántica multimodal) usando los embeddings normalizados.
- Codificación visual independiente mediante el grafo de visión (útil para indexar imágenes y reutilizar embeddings).
- Codificación textual independiente mediante el grafo de texto (útil para precomputar embeddings de etiquetas o consultas).
- Inferencia en CPU y GPU a través de ONNX Runtime con los proveedores CUDAExecutionProvider y CPUExecutionProvider.
- Ejecución con cuantización int8 weight-only para reducir huella de memoria en despliegues con recursos limitados.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente; es un modelo exclusivamente de representación multimodal.

## Casos de uso

- Clasificación automática de imágenes en catálogos de producto: se precomputan los embeddings de las categorías con el grafo de texto y se comparan con el embedding de cada imagen entrante, permitiendo etiquetar sin entrenamiento específico y con latencia baja gracias a FastViT.
- Moderación de contenido visual: se definen etiquetas textuales de contenido no deseado y se calcula la similitud con cada imagen para priorizar revisiones humanas, aprovechando la ejecución en CPU vía ONNX Runtime.
- Búsqueda semántica de imágenes en una biblioteca multimedia: se indexan los embeddings visuales generados por el grafo de visión y se consultan con embeddings de texto, habilitando búsqueda por descripción en lenguaje natural.
- Filtrado y organización de fotos en aplicaciones de escritorio o móviles: la variante int8 y el bajo coste de FastViT permiten ejecutar la clasificación en dispositivo sin conexión, reduciendo la dependencia de servicios en la nube.
- Etiquetado asistido en pipelines de datos para entrenamiento de otros modelos: se usa el modelo como autoetiquetador zero-shot para generar metadatos preliminares sobre grandes lotes de imágenes antes de la revisión humana.
- Detección de duplicados y similitud visual: se comparan los embeddings de imagen entre sí para agrupar imágenes casi idénticas o visualmente relacionadas en un sistema de gestión documental o de activos digitales.
- Integración en servicios backend con ONNX Runtime: al no requerir PyTorch, el modelo se puede desplegar en contenedores ligeros con CUDA o CPU, simplificando el escalado horizontal de un servicio de clasificación de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio completo ocupa 0,6 GB, por lo que la variante fp16 requiere del orden de unos cientos de MB de memoria y la int8 sustancialmente menos.
- GPU recomendadas: cualquier GPU compatible con CUDAExecutionProvider; para este tamaño de modelo son suficientes GPU de gama media o incluso integradas, aunque no se dispone de cifras oficiales de rendimiento.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamaño del modelo y su orientación a dispositivos edge, aunque no se confirma con datos concretos.
- Opciones de despliegue: ONNX Runtime 1.22 o superior (proveedores CUDA y CPU); la variante int8 con MatMulNBits está limitada a ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MobileCLIP2-S0-ONNX | no disponible | no aplica | apple-amlr | ONNX (fp16/int8) | Exportación ONNX del MobileCLIP2-S0 de Apple, orientada a edge |
| apple/MobileCLIP2-S0 | no disponible | no aplica | apple-amlr | PyTorch (checkpoint original) | Modelo original de Apple del que deriva esta exportación |
| timm/MobileCLIP2-S0-OpenCLIP | no disponible | no aplica | apple-amlr | PyTorch (formato OpenCLIP) | Conversión intermedia usada como base para esta exportación ONNX |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones detalladas de modelos alternativos de la misma categoría para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La licencia apple-amlr impone condiciones específicas de uso; es necesario revisar el acuerdo completo antes de cualquier despliegue comercial, ya que puede restringir determinados usos.
- Al ser un modelo contrastivo y no generativo, no puede producir texto libre ni razonar; su utilidad se limita a representaciones y similitudes.
- Riesgo de sesgos heredados de los datos de entrenamiento originales de CLIP, que pueden afectar a la clasificación de personas, culturas o contextos poco representados.
- La precisión zero-shot depende fuertemente de la formulación de las etiquetas textuales; descripciones ambiguas o muy específicas pueden degradar los resultados.
- La corrección del tokenizer respecto al padding es crítica: usar la configuración original de Hugging Face en lugar del tokenizer.json incluido degrada la precisión zero-shot.
- La variante int8 solo es compatible con ONNX Runtime y puede introducir pérdida de precisión frente a fp16; conviene validarla en el dominio de aplicación concreto.
- No se dispone de información sobre idiomas soportados, por lo que el comportamiento multilingüe no está garantizado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria sobre esta exportación concreta.

## Enlaces

- [Hugging Face: AX1Y2JP/MobileCLIP2-S0-ONNX](https://huggingface.co/AX1Y2JP/MobileCLIP2-S0-ONNX)
- [Modelo original: apple/MobileCLIP2-S0](https://huggingface.co/apple/MobileCLIP2-S0)
- [Conversión base: timm/MobileCLIP2-S0-OpenCLIP](https://huggingface.co/timm/MobileCLIP2-S0-OpenCLIP)
