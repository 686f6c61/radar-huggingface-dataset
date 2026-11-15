# GuideAxon/smart-photos-clip-b32-q8mm

## Resumen

`GuideAxon/smart-photos-clip-b32-q8mm` es una redistribucion cuantizada del modelo CLIP ViT-B/32 de OpenAI, publicada por el usuario GuideAxon. No se trata de un modelo nuevo entrenado desde cero, sino de una conversion a ONNX con cuantizacion dinamica int8 aplicada exclusivamente a las operaciones MatMul, derivada de los ficheros ONNX completos de `Xenova/clip-vit-base-patch32`. El paquete contiene dos grafos separados: la torre de vision (`clip_b32_vision_q8mm.onnx`, 96,3 MB) y la torre de texto (`clip_b32_text_q8mm.onnx`, 140,5 MB).

El proposito declarado es la busqueda de fotos en local ("on-device photo search") sobre una tableta Android pequena, dentro de un componente llamado Smart Photos. CLIP es un modelo de alineamiento imagen-texto que proyecta ambas modalidades a un espacio vectorial comun, lo que permite recuperar imagenes por consultas en lenguaje natural mediante similitud coseno. Esta version reduce el peso del repositorio a 0,2 GB, lo que la hace viable en dispositivos con almacenamiento y memoria limitados.

La relevancia de esta ficha es acotada: el modelo no aporta innovacion arquitectonica ni resultados de evaluacion propios, y su interes radica en la decision tecnica de cuantizar solo las MatMul por canal, preservando la primera convolucion en precision original. El autor reporta una similitud coseno de vectores de imagen de aproximadamente 0,99 frente al modelo completo, en contraste con el 0,92 de otras distribuciones CLIP precomprimidas. La licencia es MIT y el modelo no esta afiliado a OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (Vision Transformer con patch size 32 y torre de texto transformer) exportado a ONNX |
| Parametros totales | no disponible (el autor no publica el recuento; CLIP ViT-B/32 ronda los 151 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo no es generativo; la torre de texto usa tokenizacion BPE de CLIP con tokens de inicio y fin) |
| Tipos de cuantizacion | int8 dinamica sobre operaciones MatMul, con cuantizacion por canal (`per_channel=True`); primera convolucion sin cuantizar |
| Idiomas soportados | no disponible (el autor no declara lista de idiomas; el tokenizador BPE de CLIP esta orientado a ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (dos ficheros: torre de vision y torre de texto) |

Otros datos tecnicos relevantes:

| Parametro | Valor |
|---|---|
| Entrada de vision | `pixel_values`, forma 1x3x224x224, normalizacion media/desviacion de CLIP |
| Preprocesado de imagen | redimensionado del lado corto a 224 con interpolacion bicubica y recorte central |
| Entrada de texto | `input_ids`, int64, tokens BPE de CLIP con tokens de inicio y fin |
| Salida | primer tensor de salida, requiere normalizacion L2 |
| Tamano torre de vision | 96.308.691 bytes |
| Tamano torre de texto | 140.536.263 bytes |
| SHA-256 vision | `0a8e2bba4c35a7549f7d0611d4f7e5df7b979ef94178b8c4ab1e7d71d6accd6a` |
| SHA-256 texto | `bb57af7e847e6154b11552fe21e1157765b9fa327e10279703775ca48523a4ae` |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es CLIP ViT-B/32, un modelo de dos torres: una torre de vision basada en Vision Transformer con parches de 32x32 pixeles y una torre de texto transformer. Ambas torres se entrenan de forma contrastiva para alinear pares imagen-texto en un espacio embebido compartido. El autor no ha reentrenado ni ajustado el modelo: la model card describe unicamente el proceso de conversion y cuantizacion a partir de los ONNX de `Xenova/clip-vit-base-patch32`, que a su vez corresponden a `openai/clip-vit-base-patch32`.

El proceso de conversion emplea `onnxruntime.quantization.quantize_dynamic` con `weight_type=QuantType.QInt8`, `op_types_to_quantize=["MatMul"]` y `per_channel=True`. La innovacion declarada es la selectividad de la cuantizacion: al limitarla a las multiplicaciones matriciales y mantener la primera convolucion en su precision original, se evita la perdida de calidad que el autor atribuye a otras distribuciones CLIP precomprimidas. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO, porque el modelo no se ha entrenado en este repositorio.

## Capacidades

- Generacion de embeddings de imagen: produce un vector L2-normalizado por imagen a partir de `pixel_values` en formato 1x3x224x224.
- Generacion de embeddings de texto: produce un vector L2-normalizado por consulta a partir de tokens BPE de CLIP.
- Busqueda imagen-texto: permite recuperar imagenes por similitud coseno frente a una consulta textual; el autor indica que las consultas se embeben como `a photo of <query>`.
- Clasificacion zero-shot: al ser CLIP, admite comparar embeddings de imagen con embeddings de etiquetas textuales, aunque el autor no lo documenta explicitamente.
- Inferencia en dispositivo: los dos grafos ONNX estan pensados para ejecutarse con ONNX Runtime en hardware modesto, como una tableta Android.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision generativa ni audio. No dispone de modo de pensamiento ni de capacidades multimodales mas alla del alineamiento imagen-texto.
- Capacidades multilingues: no disponibles; el tokenizador BPE de CLIP esta orientado al ingles y el autor no declara soporte de otros idiomas.

## Casos de uso

- Busqueda de fotos en local en Android: el caso declarado por el autor. Se indexan los embeddings de imagen del carrete con la torre de vision y se consultan con la torre de texto, todo con ONNX Runtime en el dispositivo, sin enviar fotos a un servidor.
- Organizacion automatica de galerias: agrupar imagenes por similitud coseno de sus embeddings para crear albumes tematicos (por ejemplo, "playa", "documentos", "comida") sin etiquetado manual.
- Deduplicacion y deteccion de near-duplicates: comparar vectores de imagen entre si para identificar fotos repetidas o variaciones de la misma escena, util en herramientas de limpieza de almacenamiento.
- Etiquetado zero-shot de un catalogo de imagenes: comparar cada embedding de imagen contra un conjunto fijo de etiquetas textuales embebidas con la torre de texto, sin reentrenar el clasificador.
- Moderacion o filtrado por texto en colecciones locales: recuperar imagenes que coincidan con consultas descriptivas para revisiones manuales, con la ventaja de que el procesamiento no sale del dispositivo.
- Prototipado rapido de sistemas de recuperacion visual: al ser dos ficheros ONNX pequenos y con licencia MIT, sirve para validar pipelines de embedding y busqueda vectorial antes de invertir en modelos mayores.
- Filtrado previo en pipelines de vision: usar los embeddings como caracteristica compacta de imagen para tareas posteriores de clustering o recuperacion aproximada con indices vectoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta una metrica de fidelidad de la cuantizacion: similitud coseno de vectores de imagen de aproximadamente 0,99 frente al modelo de tamano completo, frente a aproximadamente 0,92 en distribuciones CLIP precomprimidas que tambien cuantizan la primera convolucion. No hay datos de MMLU, HumanEval, GSM8K ni de recuperacion (Recall@k) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: los dos grafos suman unos 237 MB en disco; en memoria, la torre de vision (96,3 MB) y la de texto (140,5 MB) pueden cargarse por separado, por lo que la huella en RAM es del orden de cientos de MB, no de GB.
- GPU recomendadas: no se requieren; el autor disena el modelo para ejecucion en CPU en una tableta Android. Cualquier GPU consumer (por ejemplo, RTX 4090) puede ejecutarlo con holgura, pero no es el objetivo.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna, y tambien en CPU y en dispositivos moviles con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU, GPU o ejecucion en Android mediante las bindings correspondientes); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de embeddings de dos torres.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GuideAxon/smart-photos-clip-b32-q8mm | no disponible (base CLIP ViT-B/32) | no aplica | ONNX int8 (solo MatMul) | MIT | Cuantizacion selectiva; similitud coseno ~0,99 segun el autor |
| Xenova/clip-vit-base-patch32 | no disponible (base CLIP ViT-B/32) | no aplica | ONNX (precision original) | MIT | Origen de la conversion; mayor tamano, sin perdida por cuantizacion |
| openai/clip-vit-base-patch32 | no disponible | no aplica | PyTorch (safetensors/bin) | MIT | Modelo original de OpenAI; requiere framework de deep learning |
| Distribuciones CLIP precomprimidas citadas por el autor | no disponible | no aplica | ONNX int8 (incluye primera convolucion) | no disponible | Similitud coseno ~0,92 segun el autor; menor fidelidad |

No se dispone de datos de rendimiento comparativo (Recall@k, latencia) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: al heredar CLIP ViT-B/32 de OpenAI, el modelo arrastra los sesgos de su dataset de entrenamiento; el autor no documenta analisis de sesgo alguno.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la recuperacion por similitud puede devolver resultados irrelevantes si la consulta no se ajusta al formato `a photo of <query>` o si el dominio de imagenes esta fuera de la distribucion de entrenamiento de CLIP.
- Limitaciones de contexto e idioma: el tokenizador BPE de CLIP esta orientado al ingles; no se declara soporte multilingue y las consultas en castellano pueden degradar la calidad de recuperacion.
- Restricciones de licencia: licencia MIT, que permite uso comercial con atribucion; el autor indica que el modelo original es de OpenAI bajo MIT y que no esta afiliado a OpenAI. Se debe conservar el fichero `LICENSE`.
- Compatibilidad de vectores: los vectores generados por distintos ficheros de modelo no son comparables entre si. Es imprescindible mantener los ficheros exactos y verificar los SHA-256 publicados antes de indexar o consultar.
- Preprocesado estricto: desviarse de la normalizacion media/desviacion de CLIP, del redimensionado bicubico con lado corto a 224 o del recorte central altera los embeddings y degrada la busqueda.
- Madurez: el repositorio tiene 0 descargas y 0 likes, fue creado y actualizado el mismo dia (14 de noviembre de 2026) y no incluye evaluacion independiente; debe tratarse como un artefacto sin validacion externa.
- Sin soporte declarado: no hay garantias de mantenimiento, ni documentacion de latencia, ni pruebas en distintos dispositivos Android.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GuideAxon/smart-photos-clip-b32-q8mm
- Modelo base en Hugging Face: https://huggingface.co/openai/clip-vit-base-patch32
- ONNX de origen de la conversion: https://huggingface.co/Xenova/clip-vit-base-patch32
- Documentacion de cuantizacion de ONNX Runtime: no disponible en la informacion proporcionada (el autor solo cita la API `onnxruntime.quantization.quantize_dynamic`)
