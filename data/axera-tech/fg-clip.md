# AXERA-TECH/FG-CLIP

## Resumen

FG-CLIP2 es un codificador de imagen-texto (image-text encoder) de tipo CLIP desarrollado originalmente por Qihoo360 y distribuido en este repositorio por AXERA-TECH en formato ONNX cuantizado para su ejecución sobre NPU. El modelo base, `qihoo360/fg-clip2-base`, es un encoder dual que proyecta imágenes y textos a un espacio latente compartido, permitiendo tareas de similitud imagen-texto, clasificación zero-shot y recuperación multimodal.

La contribución de este repositorio no es el modelo en sí, sino su conversión a un formato desplegable en hardware embebido: los pesos se han cuantizado a w8a16 (activaciones de 16 bits, pesos de 8 bits) y exportado a ONNX para ejecutarse en la NPU AX650 mediante el compilador Pulsar2 4.2. Esto lo hace relevante para quienes necesitan inferencia multimodal de bajo consumo en dispositivos de borde, con latencias medidas de 125,197 ms para el codificador de imagen y 10,817 ms para el de texto.

El repositorio ocupa 5,8 GB y está publicado bajo licencia Apache 2.0, lo que permite uso comercial. El modelo declara únicamente inglés como idioma soportado, aunque la model card incluye ejemplos de descripciones en chino, lo que sugiere cierta cobertura multilingüe no declarada formalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP dual-encoder (image encoder + text encoder), transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w8a16 (pesos 8 bits, activaciones 16 bits) para NPU; pesos originales en el modelo base no disponibles en este repo |
| Idiomas soportados | en (declarado); ejemplos en chino en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (axmodel para NPU AX650); repo de 5,8 GB |

## Arquitectura y entrenamiento

FG-CLIP2 sigue el paradigma CLIP de dos torres: un codificador de imagen y un codificador de texto independientes que producen embeddings proyectados a un espacio común, entrenados con objetivos contrastivos para maximizar la similitud entre pares imagen-texto correctos. El repositorio de AXERA no documenta la arquitectura interna exacta del modelo base (número de capas, dimensión de embedding, número de parámetros), por lo que esos datos no están disponibles en la información proporcionada.

La innovación técnica de esta distribución es la cadena de despliegue: conversión del modelo a ONNX, cuantización w8a16 y compilación con Pulsar2 4.2 para la NPU AX650. El repositorio enlaza a herramientas de conversión (`ax_tools`) en GitHub. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, algo poco habitual en modelos contrastivos de este tipo.

## Capacidades

- Codificación de imágenes a embeddings vectoriales.
- Codificación de texto a embeddings en el mismo espacio latente.
- Cálculo de similitud imagen-texto (logits por par), útil para ranking y selección.
- Clasificación zero-shot de imágenes mediante prompts textuales.
- Recuperación imagen-texto y texto-imagen (retrieval) por similitud coseno o producto escalar.
- Inferencia en dispositivo de borde sobre NPU AX650 con latencias de milisegundos.
- No se documenta soporte de tool calling, agentes, visión generativa, audio ni modo de razonamiento explícito.

## Casos de uso

- Búsqueda semántica de imágenes en dispositivos de borde: indexar embeddings de imagen generados por la NPU y consultarlos con embeddings de texto, sin enviar datos a la nube, adecuado por la latencia de 125 ms por imagen.
- Filtrado y moderación de contenido visual: comparar imágenes entrantes contra descripciones textuales de políticas para marcar coincidencias, aprovechando la clasificación zero-shot sin reentrenamiento.
- Etiquetado automático de catálogos de producto: generar embeddings de fotos y descripciones, y asignar categorías midiendo similitud contra un conjunto de etiquetas textuales predefinidas.
- Verificación de coincidencia imagen-descripción en pipelines de publicación: comprobar que la imagen subida corresponde al texto del anuncio antes de aceptarlo, con el par de codificadores ejecutándose en el mismo dispositivo.
- Recuperación multimodal en kioscos o terminales sin conectividad: desplegar el modelo en hardware AX650 para búsqueda por texto sobre una galería local de imágenes.
- Deduplicación y clustering visual: usar los embeddings de imagen para agrupar fotos similares en aplicaciones de gestión de archivos o vigilancia, ejecutando el codificador de imagen en local.
- Preprocesamiento para sistemas RAG multimodales: generar embeddings de imágenes y textos de documentos para alimentar un índice vectorial, manteniendo el coste de cómputo bajo en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento medido es el tiempo de inferencia en placa AX650:

| Etapa | Tiempo de inferencia (AX650) |
|---|---|
| image_encoder | 125,197 ms |
| text_encoder | 10,817 ms |

## Requisitos de hardware

- Plataforma de destino: NPU AX650 (Axera), con modelos compilados en formato axmodel mediante Pulsar2 4.2.
- VRAM estimada: no disponible; el modelo está pensado para memoria unificada de SoC de borde, no para GPU de escritorio.
- GPU recomendadas: no aplica para esta distribución; el modelo base en ONNX podría ejecutarse en GPU, pero no se documentan requisitos.
- ¿Cabe en GPU de consumo? No disponible para esta versión cuantizada; el repo de 5,8 GB incluye varios artefactos y no equivale al tamaño de un único modelo cargado.
- Opciones de despliegue: NPU AX650 con `run_axmodel.py`; conversión documentada en el repositorio `Jordan-5i/FG-CLIP` (carpeta `ax_tools`).
- Latencia: 125,197 ms por imagen y 10,817 ms por texto en AX650; throughput no documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| FG-CLIP2 (este repo) | no disponible | no disponible | Apache 2.0 | ONNX / axmodel para NPU AX650 | Cuantizado w8a16, latencias medidas en borde |
| CLIP de OpenAI (ViT-B/32, ViT-L/14) | 151 M / 428 M aprox. | 77 tokens de texto | MIT | PyTorch, ONNX | Referencia estándar; sin optimización para NPU |
| SigLIP (Google) | 203 M – 878 M aprox. | 64 tokens de texto | Apache 2.0 | JAX, PyTorch | Entrenamiento con sigmoide en lugar de softmax contrastivo |
| qihoo360/fg-clip2-base | no disponible | no disponible | Apache 2.0 | safetensors/PyTorch (no confirmado) | Modelo base del que deriva esta conversión |

Los datos de parámetros y contexto de los modelos comparables son aproximados y no proceden de la información proporcionada para FG-CLIP2; tómense como referencia de categoría, no como comparación medida.

## Limitaciones y advertencias

- El modelo declara solo inglés, pero los ejemplos de la model card están en chino; el rendimiento real por idioma no está documentado.
- Al ser un encoder contrastivo, puede producir similitudes altas para pares semánticamente próximos pero incorrectos; no hay métricas publicadas de precisión en retrieval.
- La cuantización w8a16 introduce pérdida de precisión respecto al modelo base; no se documenta la degradación medida.
- La distribución está atada a la NPU AX650 y a Pulsar2 4.2; no es directamente portable a otras plataformas sin reconversión.
- No se documentan sesgos del dataset de entrenamiento del modelo base.
- El repositorio tiene muy poca tracción (12 descargas, 1 like) y la fecha de actualización es posterior a la de creación, lo que sugiere mantenimiento mínimo; conviene validar los artefactos antes de usarlos en producción.
- Aunque la licencia es Apache 2.0, verificar los términos del modelo base `qihoo360/fg-clip2-base` antes de un despliegue comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AXERA-TECH/FG-CLIP
- Modelo base: https://huggingface.co/qihoo360/fg-clip2-base
- Herramientas de conversión para NPU Axera: https://github.com/Jordan-5i/FG-CLIP/tree/main/ax_tools
