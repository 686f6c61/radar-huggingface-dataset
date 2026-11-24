# sangwan001/mobileclip2-s2-litert

## Resumen

MobileCLIP2-S2 LiteRT es una conversión al formato LiteRT (`.tflite`) del modelo CLIP de Apple MobileCLIP2-S2, publicada por el usuario sangwan001. Se trata de un modelo de visión-lenguaje del tipo CLIP, diseñado para clasificación zero-shot y recuperación imagen-texto, empaquetado en dos ficheros independientes: un codificador de imagen y un codificador de texto que proyectan a un espacio de embeddings compartido de 512 dimensiones. El modelo original cuenta con 99,1 millones de parámetros y se distribuye bajo licencia Apache 2.0.

La relevancia de esta conversión radica en que permite ejecutar el modelo íntegramente en dispositivos Android mediante el intérprete TFLite estándar, sin operadores Flex ni delegados especiales, con soporte para NNAPI y XNNPACK. El autor aplica una estrategia de precisión mixta: el codificador de imagen se mantiene en FP32 porque sus pesos reparameterizados son sensibles a la cuantización FP16, mientras que el codificador de texto se convierte a FP16 sin pérdida de precisión.

El paquete total ocupa 270,4 MB (143,1 MB el codificador de imagen y 127,3 MB el de texto). No se trata de un modelo generativo: no produce texto libre, sino embeddings normalizados L2 que se comparan mediante similitud coseno o producto escalar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP de dos torres (codificador de imagen + codificador de texto) con espacio de embeddings compartido |
| Parametros totales | 99,1 M (modelo original apple/MobileCLIP2-S2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 77 tokens de texto (entrada del codificador de texto); imagen de 256x256 |
| Tipos de cuantizacion | FP32 (codificador de imagen), FP16 (codificador de texto) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT / TFLite (`.tflite`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo original MobileCLIP2-S2 de Apple, un CLIP de dos torres con un codificador visual y un codificador de texto que proyectan a un espacio común de 512 dimensiones. El codificador de imagen recibe tensores `[1, 3, 256, 256]` en formato NCHW y produce un embedding `[1, 512]` normalizado L2; el codificador de texto recibe `[1, 77]` identificadores de token int32 y produce igualmente `[1, 512]` normalizado L2. Los embeddings de ambas modalidades son directamente comparables mediante similitud coseno.

El proceso de conversión aplicado por el autor es el elemento técnico diferencial: el codificador de imagen se mantiene en FP32 porque sus pesos reparameterizados pierden precisión severamente en FP16 (la similitud coseno frente a PyTorch cae a aproximadamente 0,46), mientras que el codificador de texto en FP16 conserva una similitud coseno de 1,0000000 frente al modelo original. No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la información proporcionada.

## Capacidades

- Clasificación zero-shot de imágenes mediante comparación de embeddings de imagen con embeddings de etiquetas textuales.
- Recuperación imagen-texto y texto-imagen (image-text retrieval) por similitud coseno en el espacio compartido de 512 dimensiones.
- Generación de embeddings de imagen normalizados L2 a partir de entradas de 256x256 píxeles.
- Generación de embeddings de texto normalizados L2 a partir de secuencias de hasta 77 tokens.
- Inferencia en dispositivo (on-device) en Android mediante el intérprete TFLite estándar, con soporte para NNAPI y XNNPACK.
- No soporta generación de texto libre, tool calling, razonamiento multi-paso ni capacidades de agente; es un modelo de representación, no generativo.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Búsqueda visual en galerías locales de Android: indexar los embeddings de imagen de la fototeca del dispositivo y permitir consultas en lenguaje natural comparando el embedding de texto con los de imagen mediante similitud coseno, todo sin conexión a red.
- Clasificación zero-shot en aplicaciones móviles: definir categorías mediante prompts de texto y clasificar imágenes capturadas por la cámara sin reentrenar el modelo, aprovechando el 77,2% de Top-1 zero-shot en ImageNet-1k del modelo original.
- Moderación y filtrado de contenido en el dispositivo: comparar imágenes entrantes contra un conjunto de descripciones textuales de referencia para marcar contenido, manteniendo los datos en el terminal.
- Etiquetado automático de fotos para organización local: generar embeddings de imagen y asociarlos a etiquetas textuales predefinidas para construir un sistema de organización sin servidor.
- Recuperación de imágenes por descripción en aplicaciones de notas o documentación: almacenar embeddings de capturas y recuperarlas mediante consultas textuales, con la ventaja de que ambos ficheros corren en el intérprete TFLite estándar.
- Preprocesado en pipelines de visión en Android: usar los embeddings de imagen como características de entrada para clasificadores ligeros posteriores o sistemas de recomendación visual, con un coste de 143,1 MB de modelo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| ImageNet-1k zero-shot Top-1 (modelo PyTorch original) | 77,2% |
| COCO Karpathy test (200 imagenes), Texto → Imagen Recall@1 | 82,6% |
| COCO Karpathy test (200 imagenes), Texto → Imagen Recall@5 | 99,0% |
| COCO Karpathy test (200 imagenes), Texto → Imagen Recall@10 | 99,8% |
| COCO Karpathy test (200 imagenes), Imagen → Texto Recall@1 | 91,5% |
| COCO Karpathy test (200 imagenes), Imagen → Texto Recall@5 | 99,0% |
| Diferencia TFLite vs PyTorch | 0,0% en todas las metricas |

Nota: los resultados de COCO corresponden a un subconjunto de 200 imágenes, no al conjunto de test estándar de 5.000 imágenes, por lo que no son directamente comparables con las puntuaciones publicadas de COCO.

## Requisitos de hardware

- El paquete completo ocupa 270,4 MB en disco (143,1 MB codificador de imagen FP32 + 127,3 MB codificador de texto FP16).
- Diseñado para ejecución on-device en Android mediante el intérprete TFLite estándar; no requiere GPU de escritorio.
- Compatible con delegados NNAPI y XNNPACK; no requiere operadores Flex ni delegados especiales.
- No se dispone de datos de latencia ni throughput en la información proporcionada.
- No se dispone de estimaciones de VRAM para ejecución en GPU de escritorio en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MobileCLIP2-S2 LiteRT (este) | 99,1 M | Texto 77 tokens; imagen 256x256 | Apache 2.0 | TFLite | Conversion on-device Android |
| apple/MobileCLIP2-S2 | 99,1 M | Texto 77 tokens; imagen 256x256 | no disponible en la informacion | PyTorch | Modelo base original |
| Otros modelos CLIP de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni razonamiento; solo genera embeddings para comparacion por similitud.
- Los resultados de COCO publicados corresponden a un subconjunto de 200 imagenes, no al conjunto estandar de 5.000, por lo que no son directamente comparables con cifras publicadas de otros modelos.
- El codificador de imagen debe mantenerse en FP32: la cuantizacion a FP16 degrada la similitud coseno frente a PyTorch hasta aproximadamente 0,46, lo que invalida su uso practico en esa precision.
- La ventana de texto esta limitada a 77 tokens, lo que restringe la longitud de las descripciones y consultas.
- La entrada de imagen esta fijada a 256x256 pixeles en formato NCHW.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion ni cobertura idiomatica del modelo base en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base apple/MobileCLIP2-S2, cuya licencia no se detalla en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una conversion de un tercero, no una publicacion oficial de Apple.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sangwan001/mobileclip2-s2-litert
- Modelo base en Hugging Face: https://huggingface.co/apple/MobileCLIP2-S2
