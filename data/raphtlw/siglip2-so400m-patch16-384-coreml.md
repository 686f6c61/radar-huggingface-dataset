# raphtlw/siglip2-so400m-patch16-384-coreml

## Resumen

SigLIP 2 So400m/16-384 para Core ML es una conversión del modelo multimodal de visión-lenguaje SigLIP 2 de Google, desarrollado originalmente por el equipo de investigación de Google DeepMind. Este repositorio, publicado por el usuario raphtlw, adapta los dos codificadores del modelo original (imagen y texto) al formato Core ML de Apple, con el objetivo de permitir búsqueda semántica de imágenes y clasificación zero-shot directamente en dispositivos iPhone y Mac mediante el Neural Engine o la GPU.

El modelo original SigLIP 2 emplea una arquitectura de tipo transformer de doble torre (dual encoder): un codificador visual de tipo Vision Transformer con parches de 16×16 píxeles a resolución 384×384, y un codificador de texto basado en el tokenizador Gemma con un vocabulario de 256.000 tokens. Ambos codificadores proyectan sus entradas a un espacio latente compartido de 1.152 dimensiones, de modo que la similitud coseno entre un embedding de imagen y uno de texto mide su correspondencia semántica.

La relevancia de esta conversión radica en que permite ejecutar un modelo de recuperación imagen-texto de tamaño medio (So400m) en hardware de consumo Apple sin conexión a la nube, algo útil para aplicaciones de búsqueda fotográfica local, moderación de contenido o clasificación de imágenes en el dispositivo. El repositorio no incluye datos de benchmarks propios ni información sobre el proceso de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder (ViT para imagen + transformer de texto), convertido a Core ML |
| Parametros totales | no disponible (modelo base: SigLIP 2 So400m, ~400M en el codificador visual) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (fijo, con padding) |
| Tipos de cuantizacion | Pesos de 16 bits (codificador de imagen) y 8 bits por canal (codificador de texto) |
| Idiomas soportados | 109 idiomas para el codificador de texto (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlpackage), vocabulario en JSON |
| Dimension del embedding | 1.152 dimensiones, normalizado |
| Resolucion de imagen | 384 × 384, sin recorte |
| Tamano del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

El modelo base es SigLIP 2, una evolución de la familia SigLIP que combina un codificador visual de tipo Vision Transformer con parches de 16×16 y un codificador de texto. La conversión a Core ML separa ambos codificadores en dos paquetes independientes: `siglip2_image.mlpackage` (854 MB, pesos de 16 bits) y `siglip2_text.mlpackage` (709 MB, pesos de 8 bits por canal). Cada uno devuelve un vector de 1.152 números normalizado, de forma que el producto escalar entre un embedding de imagen y uno de texto equivale a su similitud coseno.

La model card no proporciona detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo original. La conversión introduce dos modificaciones técnicas relevantes: la atención de pooling del codificador de imagen, originalmente implementada con `torch.nn.MultiheadAttention`, se reescribió con productos matriciales simples porque Core ML Tools no podía convertirla (la diferencia máxima en la salida es inferior a 0,000001); además, el codificador de imagen se mantuvo en 16 bits porque la cuantización a 8 bits (por canal o en bloques de 16) solo alcanzaba una concordancia de 0,79 a 0,88 con el original. El tokenizador es el SentencePiece de Gemma, con 256.000 tokens, y el texto se procesa en minúsculas, sin token de inicio, con token de fin `1` y padding `0` hasta 64 tokens.

## Capacidades

- Recuperación imagen-texto (image-text retrieval): genera embeddings comparables entre imágenes y textos para búsqueda semántica.
- Clasificación zero-shot de imágenes: permite asignar etiquetas arbitrarias en texto sin entrenamiento adicional.
- Multilingüismo en el codificador de texto: lectura de texto en 109 idiomas.
- Embeddings normalizados de 1.152 dimensiones listos para similitud coseno.
- Ejecución en dispositivo mediante Core ML, con soporte para Neural Engine y GPU.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No incluye capacidades de audio ni visión generativa.

## Casos de uso

- Búsqueda fotográfica local en iPhone o Mac: indexar la fototeca con embeddings de imagen y consultar mediante descripciones de texto en lenguaje natural, sin enviar datos a la nube gracias a la ejecución en Neural Engine.
- Clasificación zero-shot de imágenes en aplicaciones móviles: definir categorías en texto en tiempo de ejecución y etiquetar imágenes sin reentrenar el modelo.
- Moderación de contenido en el dispositivo: comparar imágenes con descripciones textuales de contenido no deseado para filtrar antes de subir a un servidor.
- Organización automática de galerías: agrupar imágenes por similitud semántica usando los embeddings normalizados y técnicas de clustering.
- Accesibilidad: generar descripciones alternativas o etiquetas de imágenes para lectores de pantalla mediante comparación con un vocabulario controlado.
- Filtrado de datasets de visión: preetiquetar grandes colecciones de imágenes con consultas de texto multilingües antes de un entrenamiento supervisado.
- Recomendación visual en comercio electrónico: emparejar imágenes de producto con consultas de usuario en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta verificaciones de fidelidad de la conversión frente al modelo original en PyTorch float32, sobre cinco fotos y once textos en inglés, chino y malayo:

| Metrica | Rango observado |
|---|---|
| Similitud coseno de embeddings de imagen | 0,985 – 0,9999 |
| Similitud coseno de embeddings de texto | 0,996 – 0,9998 |
| Concordancia del codificador de imagen en CPU a 16 bits | 0,91 (un test) |

## Requisitos de hardware

- VRAM/tamaño en disco: 854 MB para el codificador de imagen y 709 MB para el de texto; el repositorio completo ocupa 1,6 GB.
- Hardware objetivo: iPhone y Mac con Neural Engine o GPU compatible con Core ML.
- El codificador de imagen debe ejecutarse en Neural Engine o GPU; en CPU a 16 bits los embeddings se degradan (0,91 de concordancia en una prueba).
- No está pensado para GPU de servidor (A100, H100, RTX 4090); el formato Core ML está orientado a hardware Apple.
- Despliegue mediante Core ML Tools y el runtime de Core ML en macOS/iOS; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SigLIP 2 So400m/16-384 (este) | ~400M (codificador visual) | 64 tokens | 109 | Apache 2.0 | Core ML |
| google/siglip2-so400m-patch16-384 (original) | ~400M (codificador visual) | 64 tokens | 109 | Apache 2.0 | PyTorch/safetensors |
| CLIP ViT-L/14 | ~428M | 77 tokens | Principalmente inglés | MIT (variantes) | PyTorch/safetensors |

La comparación con CLIP se ofrece como referencia de categoría (dual encoder imagen-texto); no se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- La conversión no ha sido validada más que con cinco imágenes y once textos; la fidelidad en dominios distintos puede variar.
- El codificador de imagen pierde precisión si se ejecuta en CPU a 16 bits; es necesario usar Neural Engine o GPU.
- La cuantización a 8 bits del codificador de imagen no es viable (concordancia de 0,79 a 0,88), por lo que el paquete de imagen es más pesado.
- Ventana de texto fija de 64 tokens, insuficiente para descripciones largas.
- El modelo no genera texto; solo produce embeddings, por lo que no sirve para tareas generativas.
- Riesgo de sesgos heredados del corpus de entrenamiento original de SigLIP 2, no documentados en esta conversión.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base google/siglip2-so400m-patch16-384.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/raphtlw/siglip2-so400m-patch16-384-coreml
- Modelo base: https://huggingface.co/google/siglip2-so400m-patch16-384
- Revisión del modelo base citada: dd658faac399427308559e2c3ac1e99cbe43845d
- Scripts incluidos en el repositorio: `convert.py`, `export_vocabulary.py`, `validate.py`
- Paper de SigLIP 2: no disponible en la información proporcionada
