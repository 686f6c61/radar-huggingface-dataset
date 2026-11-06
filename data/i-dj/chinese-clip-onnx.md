# i-dj/chinese-clip-onnx

## Resumen

Chinese-CLIP (ONNX) es una redistribución en formato ONNX de los tres tamaños oficiales del modelo Chinese-CLIP de OFA-Sys (ViT-H/14, ViT-L/14 y ViT-B/16), orientada a búsqueda semántica de imágenes mediante texto en chino. El paquete lo publica el desarrollador independiente i-dj como componente del motor de búsqueda semántica de su aplicación de álbum familiar Wanmory, y permite ejecutar los codificadores de imagen y de texto con `onnxruntime` sin necesidad de instalar PyTorch ni la librería `transformers`.

El modelo resuelve el problema de la recuperación de imágenes por descripción en lenguaje natural en chino (por ejemplo, «atardecer en la playa» o «tarta de cumpleaños») sin depender del ecosistema Python de aprendizaje profundo. Es relevante porque elimina la fricción de despliegue de CLIP en entornos ligeros (aplicaciones de escritorio, móvil, contenedores mínimos) manteniendo una equivalencia numérica verificada con los pesos originales: el autor reporta una similitud coseno de 1.000000 entre los embeddings ONNX y los de PyTorch para los tres tamaños.

Cada tamaño se distribuye como un par de grafos ONNX independientes (codificador visual y codificador textual) más el vocabulario BERT y un fichero `meta.json` con dimensiones, parámetros de preprocesado y sumas SHA-256. El repositorio ocupa 6,2 GB en total y la licencia es MIT, heredada de los modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP dual-encoder (ViT para imagen + transformer de texto tipo BERT), exportado a ONNX (opset 17) |
| Parametros totales | no disponible (tres variantes: ViT-H/14, ViT-L/14 y ViT-B/16; el autor solo publica el tamano en disco de cada una) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; el codificador de texto usa `input_ids` de longitud fija 52 tokens |
| Tipos de cuantizacion | no disponible (el autor indica exportacion en precision completa; no se documentan variantes cuantizadas) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | MIT (Copyright OFA-Sys) |
| Formato de pesos | ONNX (`visual.onnx`, `text.onnx`, con pesos externos en `visual.onnx.data` y `text.onnx.data`) |

Detalle de las tres variantes incluidas:

| Directorio | Modelo original | Dimension del embedding | Tamano en disco |
|---|---|---|---|
| `chinese-clip-vit-h-14/` | OFA-Sys/chinese-clip-vit-huge-patch14 | 1024 | 3,6 GB |
| `chinese-clip-vit-l-14/` | OFA-Sys/chinese-clip-vit-large-patch14 | 768 | 1,5 GB |
| `chinese-clip-vit-b-16/` | OFA-Sys/chinese-clip-vit-base-patch16 | 512 | 718 MB |

## Arquitectura y entrenamiento

La arquitectura es la de Chinese-CLIP original: un codificador de imagen basado en Vision Transformer con parches de 14×14 (variantes H y L) o 16×16 (variante B), y un codificador de texto con arquitectura tipo BERT y tokenizador WordPiece adaptado al chino (un carácter por token, texto en minúsculas, tokens especiales `[CLS]` y `[SEP]`). Ambos codificadores proyectan a un espacio latente común donde se calcula la similitud coseno entre imagen y texto. La exportación a ONNX se realizó con PyTorch 2.15 y `transformers` 5.22, en precisión completa y opset 17.

No se documentan en la información disponible los detalles del entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO); esa información corresponde a las model cards de los modelos base de OFA-Sys, no a esta redistribución. La innovación técnica de este paquete es exclusivamente de despliegue: separación de los dos codificadores en grafos ONNX independientes con pesos externos, preprocesado replicado del `ChineseCLIPProcessor` (redimensionado directo a 224×224 con interpolación bicúbica, sin recorte ni preservación de proporción, normalización con `mean` y `std` declarados en `meta.json`) y verificación automática de equivalencia numérica frente a PyTorch. Los embeddings de salida no están normalizados, igual que en `get_image_features` y `get_text_features` de `transformers`.

## Capacidades

- Generación de embeddings de imagen y de texto en un espacio vectorial compartido, aptos para búsqueda y clasificación.
- Clasificación de imágenes zero-shot mediante comparación de embeddings contra etiquetas textuales.
- Búsqueda semántica de imágenes a partir de consultas en chino e inglés.
- Similitud imagen-imagen y texto-texto usando los codificadores por separado.
- Ejecución con `onnxruntime` sin PyTorch ni `transformers`, en CPU o GPU.
- Tres niveles de calidad/coste según la variante (512, 768 o 1024 dimensiones de embedding).
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un modelo de representación, no un LLM.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá del emparejamiento imagen-texto.

## Casos de uso

- Búsqueda semántica en álbumes fotográficos personales: indexar las fotos con `visual.onnx` y consultar con frases en chino como «atardecer en la playa» mediante `text.onnx`; es el caso de uso original del autor en su aplicación Wanmory y el que motiva el paquete.
- Clasificación zero-shot de imágenes en pipelines de etiquetado: generar embeddings de las etiquetas candidatas una sola vez y comparar cada imagen nueva contra ellas, sin entrenamiento adicional.
- Moderación o filtrado de contenido por descripción textual: detectar imágenes que coincidan con categorías descritas en lenguaje natural en flujos de ingestión de contenido.
- Deduplicación y agrupación de imágenes: calcular embeddings visuales y agrupar por similitud coseno para detectar fotos repetidas o casi idénticas en grandes colecciones.
- Despliegue en aplicaciones de escritorio o móvil: al no requerir PyTorch, el paquete se integra en binarios ligeros con `onnxruntime` y la variante `chinese-clip-vit-b-16` (718 MB) es viable en equipos de consumo.
- Búsqueda multimodal en catálogos de producto: indexar imágenes de inventario y permitir consultas en chino o inglés desde un buscador interno, con la variante H/14 para maximizar calidad cuando el coste de cómputo no es crítico.
- Prototipado rápido de sistemas de recuperación visual en entornos sin GPU: la ejecución en CPU con `onnxruntime` permite validar la calidad de la recuperación antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta la verificación de equivalencia numérica con los pesos originales: similitud coseno de 1.000000 entre los embeddings ONNX y los de PyTorch para imagen y texto en los tres tamaños, y similitud de 1.0 entre la ejecución ONNX en CPU y la ejecución PyTorch en GPU de Apple en media precisión sobre 10 fotos aleatorias. No se documentan métricas de recuperación (Recall@K, mAP) ni latencias o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; como referencia de espacio en disco, la variante H/14 ocupa 3,6 GB, la L/14 1,5 GB y la B/16 718 MB, por lo que la VRAM necesaria para inferencia en precisión completa será del orden del tamaño del grafo correspondiente más los tensores de activación.
- GPU recomendadas: no especificadas por el autor; la verificación se realizó en CPU y en GPU de Apple (PyTorch en media precisión) para el contraste de resultados.
- Viabilidad en GPU de consumo: la variante B/16 (718 MB) es la más adecuada para GPU de consumo; las variantes L y H requieren más memoria y no se documenta su comportamiento en tarjetas de gama media.
- Opciones de despliegue: `onnxruntime` (CPU o GPU); no se requieren PyTorch ni `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Chinese-CLIP ONNX (este paquete) | no disponible (tres variantes ViT-H/L/B) | texto de 52 tokens; imagen 224×224 | zh, en | MIT | ONNX |
| OFA-Sys/chinese-clip-vit-base-patch16 | no disponible | texto de 52 tokens; imagen 224×224 | zh, en | MIT | PyTorch (safetensors/bin) |
| OFA-Sys/chinese-clip-vit-large-patch14 | no disponible | texto de 52 tokens; imagen 224×224 | zh, en | MIT | PyTorch (safetensors/bin) |
| OFA-Sys/chinese-clip-vit-huge-patch14 | no disponible | texto de 52 tokens; imagen 224×224 | zh, en | MIT | PyTorch (safetensors/bin) |

La comparación relevante es con los propios modelos base: este paquete no modifica los pesos, solo el formato y el runtime. Frente a ellos, la ventaja es la ausencia de dependencia de PyTorch y `transformers`; la desventaja es que no se ofrecen variantes cuantizadas ni integración con las utilidades de `transformers`. No se dispone de datos para comparar con otros modelos CLIP en chino de terceros.

## Limitaciones y advertencias

- Modelo de representación, no generativo: no produce texto ni respuestas; cualquier uso como asistente conversacional es un error de aplicación.
- Longitud de texto fija de 52 tokens: las consultas más largas deben truncarse o dividirse, lo que puede degradar la recuperación.
- Preprocesado específico: el redimensionado directo a 224×224 sin preservar proporción difiere del de otros CLIP; usar otro preprocesado produce embeddings incompatibles con los publicados.
- Embeddings no normalizados: es obligatorio normalizar antes de calcular similitud coseno, tal como advierte el autor.
- Idiomas limitados a chino e inglés; el rendimiento en castellano u otras lenguas no está documentado y previsiblemente será deficiente.
- Riesgo de sesgo y de falsos positivos en la recuperación: al ser un modelo de similitud, puede devolver resultados semánticamente próximos pero incorrectos; no se documentan evaluaciones de sesgo.
- Sin benchmarks publicados de calidad de recuperación: no hay evidencia en la información disponible sobre Recall@K ni mAP frente a los modelos base.
- Licencia MIT permite uso comercial, pero se mantiene la atribución a OFA-Sys; el paquete no altera los pesos originales.
- Repositorio sin descargas ni likes en el momento de la consulta y mantenido por un único desarrollador: conviene verificar la integridad de los ficheros con las sumas SHA-256 de `meta.json` antes de usarlo en producción.
- Sin garantías de mantenimiento ni de actualización a nuevas versiones de `onnxruntime` u opset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/i-dj/chinese-clip-onnx
- Repositorio del proyecto Wanmory: https://github.com/i-dj/wanmory
- Script de exportación a ONNX: https://github.com/i-dj/wanmory/blob/main/ml/scripts/export_clip_onnx.py
- Repositorio oficial de Chinese-CLIP: https://github.com/OFA-Sys/Chinese-CLIP
- Modelo base ViT-H/14: https://huggingface.co/OFA-Sys/chinese-clip-vit-huge-patch14
- Modelo base ViT-L/14: https://huggingface.co/OFA-Sys/chinese-clip-vit-large-patch14
- Modelo base ViT-B/16: https://huggingface.co/OFA-Sys/chinese-clip-vit-base-patch16
