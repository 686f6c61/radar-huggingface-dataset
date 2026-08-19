# d0gr/nsfw-image-detector-onnx

## Resumen

El modelo `d0gr/nsfw-image-detector-onnx` es un espejo sin modificaciones de la exportación ONNX en formato int8 del clasificador de contenido NSFW `AdamCodd/vit-base-nsfw-detector`. Fue publicado por el usuario `d0gr` con el propósito de que la aplicación **Offline AI Image Generator** (`com.offlineai.image`) pueda descargar y ejecutar el clasificador de forma local, sin depender de repositorios de terceros para una tarea crítica de cumplimiento de políticas de contenido. No se han alterado pesos, arquitectura ni configuración respecto al modelo original.

Se trata de un modelo de clasificación de imágenes basado en un Vision Transformer (ViT) base, que recibe una imagen de 384×384 píxeles y devuelve dos logits correspondientes a las clases `sfw` (seguro para el trabajo) y `nsfw` (no seguro). Su relevancia radica en que permite moderar contenido generado por IA de manera totalmente local, sin enviar imágenes ni resultados a servidores externos, lo que garantiza privacidad y cumplimiento normativo en aplicaciones de generación de imágenes.

El repositorio tiene un tamaño de 0.1 GB y la licencia es Apache 2.0, heredada del modelo base. No se han publicado métricas de rendimiento ni detalles de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) base (según nombre del modelo base) |
| Parametros totales | no disponible (el modelo base es un ViT base, pero no se especifica el número exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | int8 (exportación ONNX) |
| Idiomas soportados | no disponible (no relevante para clasificación de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivo `onnx/model_int8.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Vision Transformer (ViT) base, un modelo de atención pura para imágenes que procesa la entrada como una secuencia de parches. El modelo original `AdamCodd/vit-base-nsfw-detector` fue fine-tuneado para la tarea de clasificación binaria de contenido NSFW, pero no se dispone de detalles sobre el conjunto de datos de entrenamiento, el número de tokens de imagen, ni si se aplicaron técnicas como RLHF o DPO (no aplicables a visión). La exportación ONNX int8 es una conversión directa del modelo original sin cambios en los pesos, realizada para optimizar la inferencia en dispositivos locales.

No se ha documentado ninguna innovación técnica adicional en la model card más allá de la conversión a ONNX int8 y el preprocesamiento específico (resize a 384×384 bilinear, normalización a `[-1, 1]`).

## Capacidades

- Clasificación binaria de imágenes en dos categorías: `sfw` (seguro para el trabajo) y `nsfw` (no seguro).
- Inferencia local y privada: el modelo se ejecuta completamente en el dispositivo, sin enviar datos a servidores externos.
- Formato ONNX optimizado para int8, lo que permite despliegue eficiente en CPU y GPU de bajo consumo.
- Preprocesamiento integrado documentado: resize a 384×384, normalización `(x/255 - 0.5) / 0.5`.
- Salida como logits de dos clases; se aplica softmax y se usa el índice 1 para la probabilidad de NSFW.
- No soporta otras tareas como generación de texto, tool calling o agentes.

## Casos de uso

- **Moderación de contenido en aplicaciones de generación de imágenes**: el modelo se integra en el pipeline de generación para clasificar cada imagen generada antes de mostrarla o almacenarla. Si la puntuación supera un umbral, la imagen se descarta automáticamente. Es adecuado porque es ligero (int8 ONNX) y se ejecuta localmente, cumpliendo con políticas de contenido sin depender de servicios externos.
- **Filtrado de imágenes en repositorios locales**: puede usarse como herramienta de línea de comandos o script para escanear carpetas de imágenes y marcar aquellas que probablemente contengan contenido NSFW, facilitando la limpieza de datasets o bibliotecas personales.
- **Control parental en aplicaciones de visualización de imágenes**: integrado en galerías o visores, el modelo puede bloquear la visualización de imágenes clasificadas como NSFW en dispositivos compartidos o infantiles.
- **Preprocesamiento de datasets para entrenamiento de modelos**: antes de entrenar otros modelos de visión, se puede utilizar para filtrar automáticamente imágenes inapropiadas de un dataset, reduciendo sesgos y riesgos legales.
- **Cumplimiento normativo en plataformas de contenido generado por usuarios**: aunque el modelo está pensado para imágenes generadas por IA, puede adaptarse a moderar subidas de usuarios en entornos controlados, siempre que se ajuste el umbral y se evalúe su precisión en el dominio objetivo.
- **Auditoría de contenido en aplicaciones móviles**: dado su tamaño reducido (0.1 GB) y formato ONNX, puede desplegarse en dispositivos móviles para filtrar imágenes en tiempo real sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión, recall, F1 ni comparaciones con otros modelos en la model card del repositorio.

## Requisitos de hardware

- El modelo es una exportación ONNX int8, por lo que es considerablemente más ligero que el modelo original en float32. El tamaño del repositorio es de 0.1 GB, lo que sugiere que el archivo del modelo ocupa aproximadamente 100 MB.
- VRAM estimada para inferencia: no se proporciona un valor exacto, pero un modelo ViT base int8 de ~86M parámetros (si sigue la arquitectura estándar) puede ejecutarse en GPUs con 2 GB de VRAM o menos, e incluso en CPU con un rendimiento aceptable para inferencia por lotes pequeños.
- GPU recomendadas: cualquier GPU con soporte para ONNX Runtime (por ejemplo, NVIDIA GTX 1060 o superior, RTX serie 20/30/40). También puede ejecutarse en CPU mediante ONNX Runtime con backend de CPU.
- Cabe en GPUs de consumo: sí, es adecuado para tarjetas como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), puede integrarse en aplicaciones móviles mediante ONNX Runtime Mobile, o servirse con herramientas como `onnxruntime-web` para navegador.
- Latencia y throughput: no se dispone de mediciones oficiales. Para una imagen de 384×384, se espera una inferencia de decenas de milisegundos en GPU y de cientos de milisegundos en CPU moderna, pero estos valores son estimaciones y deben validarse en el hardware objetivo.

## Comparativa con modelos similares

No se dispone de información suficiente en el repositorio para realizar una comparativa con otros modelos de detección NSFW. No se conocen modelos alternativos en la misma categoría a partir de los datos proporcionados. Se recomienda consultar el modelo base `AdamCodd/vit-base-nsfw-detector` para posibles comparaciones con otros ViT fine-tuneados, pero no hay datos disponibles.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un modelo de clasificación de imágenes, puede presentar sesgos según el conjunto de datos con el que fue entrenado el modelo base. No se documentan los datos de entrenamiento, por lo que no se puede evaluar su comportamiento en dominios específicos (por ejemplo, arte, dibujos, fotografías).
- **Riesgo de alucinación**: no aplica directamente, pero la clasificación puede ser incorrecta en imágenes ambiguas o con contextos culturales variados.
- **Limitaciones de contexto o idioma**: no es un modelo de lenguaje, por lo que no tiene limitaciones de contexto textual; sin embargo, su rendimiento depende de la calidad de la imagen de entrada y del preprocesamiento.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright y la atribución al autor original (AdamCodd). No hay restricciones adicionales documentadas.
- **Advertencias para producción**: la model card indica que el modelo se usa para decidir si una imagen generada se muestra o se almacena. Es fundamental calibrar el umbral de decisión con datos reales para minimizar falsos positivos (imágenes seguras marcadas como NSFW) y falsos negativos (contenido NSFW no detectado). No se proporcionan métricas de precisión, por lo que se recomienda validar el modelo en el caso de uso específico antes de implementarlo en un entorno crítico.
- **Nota sobre la fecha**: el repositorio tiene fechas de creación y actualización de agosto de 2026, lo que podría indicar una fecha futura o un error en los metadatos; no afecta a la funcionalidad del modelo.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/d0gr/nsfw-image-detector-onnx)
- [Modelo base AdamCodd/vit-base-nsfw-detector](https://huggingface.co/AdamCodd/vit-base-nsfw-detector)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
