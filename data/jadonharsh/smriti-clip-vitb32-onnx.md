# jadonharsh/smriti-clip-vitb32-onnx

## Resumen

El modelo `jadonharsh/smriti-clip-vitb32-onnx` es una exportación a ONNX de las dos torres del modelo CLIP ViT-B/32 de LAION, concretamente de `laion/CLIP-ViT-B-32-laion2B-s34B-b79K`. Lo desarrolla el autor `jadonharsh` para su proyecto Smriti, que ejecuta modelos mediante ONNX Runtime en CPU sin incluir PyTorch en el paquete de distribución. El problema que resuelve es permitir la clasificación de imágenes cero-shot y la generación de embeddings multimodales en entornos de producción donde no se quiere ni se puede instalar el stack completo de PyTorch.

La arquitectura es la de CLIP, con dos torres separadas: una de visión basada en ViT-B/32 y una de texto basada en un transformer con secuencias de hasta 77 tokens. Los archivos publicados ocupan 0,6 GB en total y están en formato ONNX, con la peculiaridad de que las dos torres se distribuyen por separado para poder cargarlas de manera independiente. Su relevancia actual radica en que ofrece una alternativa ligera y sin dependencias de frameworks pesados para tareas de búsqueda multimodal y clasificación de imágenes en CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (Vision Transformer ViT-B/32 + transformer de texto) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (según `input_ids` de la torre de texto) |
| Tipos de cuantizacion | FP32 (se evaluó int8 dinámico pero se descartó; no se incluye cuantización) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (dos archivos `.onnx` separados) |

## Arquitectura y entrenamiento

El modelo es un sistema contrastivo de dos torres, siguiendo la arquitectura CLIP. La torre de visión (`vision_model.onnx`) procesa imágenes de 224×224 píxeles y devuelve embeddings de 512 dimensiones. La torre de texto (`text_model.onnx`) procesa secuencias de hasta 77 tokens y también devuelve embeddings de 512 dimensiones. Ambas torres normalizan sus salidas mediante L2 dentro del grafo, de modo que el producto escalar entre un embedding de imagen y uno de texto equivale directamente a la similitud coseno. Ambas aceptan un batch dinámico.

Los pesos originales fueron entrenados por LAION sobre el dataset LAION-2B. La exportación a ONNX se realizó con `torch.onnx.export`, opset 17, en FP32 y con trazado en batch 3. Esta elección se tomó deliberadamente porque trazar la torre de texto con batch 1 introduce un reshape fijo de `(77,512)` que falla en llamadas con batch mayor. El resultado se verificó contra el modelo PyTorch original en batches de 1, 2 y 6, con una diferencia máxima absoluta de aproximadamente `1e-6` en ambas torres. Se probó la cuantización dinámica int8, que reducía el tamaño de 578 MB a 146 MB, pero no mejoraba la velocidad en el ejecutor de CPU y alteraba el orden de los resultados en la mitad de un conjunto de consultas de prueba, por lo que se descartó.

## Capacidades

- Clasificación de imágenes cero-shot (zero-shot image classification) sin necesidad de entrenamiento adicional.
- Generación de embeddings de imagen y texto de 512 dimensiones para búsqueda multimodal.
- Ejecución en CPU mediante ONNX Runtime, sin dependencia de PyTorch.
- Las dos torres se pueden cargar por separado: para indexar imágenes no se carga la torre de texto, y para búsqueda no se carga la de visión.
- Soporte de batch dinámico en ambas torres.
- No es un modelo generativo: no produce texto ni completa instrucciones; solo genera embeddings.

## Casos de uso

- Clasificación de imágenes en entornos de producción sin GPU: se utiliza la torre de visión para etiquetar imágenes comparando sus embeddings con los de categorías de texto predefinidas mediante similitud coseno, todo ejecutable en CPU.
- Búsqueda semántica en catálogos de imágenes: se indexan los embeddings de las imágenes con la torre de visión y se codifican las consultas de texto con la torre de texto, permitiendo buscar por descripción sin etiquetas manuales.
- Moderación de contenido en tiempo real: se clasifican imágenes como inapropiadas o de riesgo comparándolas con embeddings de texto de categorías de contenido, con baja latencia al ejecutarse en CPU.
- Sistemas de recomendación visual: se generan embeddings de productos y de preferencias de usuario para sugerir artículos visualmente similares o relacionados.
- Pipelines de análisis de imágenes en servidores sin Python ni PyTorch: al ser ONNX, se puede integrar en servicios que ya usan ONNX Runtime, reduciendo el footprint de dependencias.
- Prototipado rápido de sistemas de visión sin entrenamiento: se aprovecha la clasificación cero-shot para validar conceptos de productos o ideas antes de invertir en un proyecto de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU con ONNX Runtime; no se requiere GPU para el caso de uso previsto por el autor.
- Los pesos suman 578 MB en total (335 MB la torre de visión y 243 MB la de texto), por lo que caben en sistemas con poca memoria.
- No se han publicado requisitos de VRAM ni benchmarks de latencia o throughput.
- Opciones de despliegue: cualquier runtime que soporte ONNX, especialmente ONNX Runtime en CPU.
- Las torres se pueden desplegar por separado para ahorrar memoria en servicios que solo necesiten una de ellas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo es una conversión directa a ONNX de `laion/CLIP-ViT-B-32-laion2B-s34B-b79K`, por lo que sus capacidades son idénticas a las del modelo base en PyTorch. La diferencia principal es el formato y la posibilidad de cargar cada torre de forma independiente, lo que lo hace más adecuado para despliegues ligeros en CPU con ONNX Runtime.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó sobre LAION-2B, un dataset con problemas documentados de calidad y contenido. LAION ha publicado Re-LAION como versión limpia; quien reutilice estos pesos debería revisar esas notas antes de hacerlo.
- No es un modelo generativo: no puede crear texto, responder preguntas ni realizar razonamiento; solo produce embeddings.
- Limitación de idioma: el tokenizer es el CLIP BPE estándar, orientado principalmente a inglés; no se documentan idiomas adicionales.
- El tokenizer no se incluye en el repositorio: hay que descargarlo del modelo base, lo que añade un paso extra en despliegues.
- No se publica cuantización int8: los archivos en FP32 ocupan 578 MB, lo que puede ser un inconveniente en sistemas embebidos con memoria muy limitada.
- Riesgo de alucinación: no aplica, porque el modelo no genera texto.
- La licencia MIT permite uso comercial, pero la atribución original debe preservarse; la model card indica que el copyright y la licencia MIT originales están incluidos en el archivo `LICENSE` del repositorio.
- La verificación de la exportación se limitó a la diferencia numérica frente al modelo PyTorch; no se publicaron pruebas de rendimiento ni de calidad en dominios específicos.

## Enlaces

- HuggingFace: https://huggingface.co/jadonharsh/smriti-clip-vitb32-onnx
- Modelo base: https://huggingface.co/laion/CLIP-ViT-B-32-laion2B-s34B-b79K
- Sitio del proyecto Smriti: https://smriti.jadonharsh.in
