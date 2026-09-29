# sliderforthewin/aves-smart-search-siglip2-selective-int8

## Resumen

`sliderforthewin/aves-smart-search-siglip2-selective-int8` es un paquete de inferencia para recuperación imagen-texto en dispositivo, publicado por el usuario independiente sliderforthewin. No es un modelo entrenado desde cero: es una conversión a ONNX Runtime del checkpoint `timm/ViT-B-32-SigLIP2-256` (fijado al commit `cd1efb47643f2794413dd79ef24397c175032780`), que a su vez deriva de los checkpoints JAX de SigLIP 2 de Google Big Vision. Incluye dos torres emparejadas (imagen y texto) más el tokenizador exacto del checkpoint fijado, y genera embeddings de 768 dimensiones normalizados en L2.

El interés práctico está en el formato y la cuantización: ambos grafos se exportaron a ONNX opset 18 en float32 y después se cuantizaron con `quantize_dynamic` de ONNX Runtime a int8 con signo y cuantización por canal, de forma selectiva. Se excluyeron 13 nodos `/mlp/fc2/MatMul` de la torre visual y 12 nodos `/mlp/c_proj/MatMul` de la torre de texto, que permanecen en coma flotante. Los artefactos finales están en formato ORT listo para ARM y para ONNX Runtime 1.30, con un tamaño de repositorio de 0,6 GB.

Es relevante porque cubre un hueco concreto: búsqueda semántica de imágenes sin conexión, con licencia Apache-2.0 y sin dependencia de frameworks de generación. Sus limitaciones son igual de concretas: no hay benchmarks publicados, la evidencia de fidelidad de la cuantización son medidas de coseno sobre muestras intermedias y no garantías sobre los artefactos finales, y el paquete no se puede mezclar con otras torres o tokenizadores de SigLIP 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres (imagen y texto) con pérdida sigmoidea, familia SigLIP 2; backbone visual ViT-B/32 y torre de texto con tokenizador tipo Gemma |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 64 tokens de texto, fijos (`input_ids` int64 `[N, 64]`, relleno a la derecha con ID 0); imagen fija a 256 x 256 |
| Tipos de cuantizacion | int8 con signo (`QInt8`) con cuantización por canal, selectiva; nodos sensibles a la precisión en float32 (13 `/mlp/fc2/MatMul` visuales y 12 `/mlp/c_proj/MatMul` de texto excluidos) |
| Idiomas soportados | no disponible en la model card; el modelo upstream SigLIP 2 es multilingüe según el paper, pero este paquete no enumera idiomas concretos |
| Licencia | apache-2.0 |
| Formato de pesos | ORT (formato de ONNX Runtime, no protobuf `.onnx`); ficheros `image.ort`, `text.ort` y `tokenizer.json` |
| Dimension de embedding | 768, normalizada en L2 en ambas torres |
| Entrada de imagen | `pixel_values` float32 `[N, 3, 256, 256]`, RGB, redimensionado bilineal a 256 x 256 con aplastado de relación de aspecto, valores en `[0, 1]`; el grafo aplica `(x - 0.5) / 0.5` internamente |
| Entrada de texto | `input_ids` int64 `[N, 64]`, tokens especiales `<pad>` = 0, `<eos>` = 1, `<bos>` = 2 |
| Modelo base | timm/ViT-B-32-SigLIP2-256 |
| Libreria | onnxruntime |
| Tamano del repositorio | 0,6 GB |
| Version de runtime | ONNX Runtime 1.30 |

## Arquitectura y entrenamiento

La arquitectura subyacente es SigLIP 2, una familia de codificadores visión-lenguaje multilingües que extiende el objetivo original de SigLIP con una receta unificada: preentrenamiento basado en descripciones (captioning), pérdidas auto-supervisadas (auto-destilación y predicción enmascarada) y mejoras en tareas densas como segmentación y estimación de profundidad. La variante concreta es la B/32 a 256 píxeles, con salida de embedding de 768 dimensiones. La model card no documenta el volumen de tokens, la composición del dataset ni si hubo fases de RLHF o DPO, dado que este repositorio es una conversión y no un entrenamiento: esos datos corresponden al upstream y no se reproducen aquí (no disponibles).

El trabajo técnico de este paquete es la exportación y cuantización. El checkpoint fijado se cargó con OpenCLIP, cada torre se exportó como ONNX float32 (opset 18) con salida normalizada, y después se aplicó `quantize_dynamic` de ONNX Runtime con int8 con signo y cuantización por canal. Se seleccionaron nodos `MatMul`/`Gemm` en ambas torres más `Gather` para los embeddings de tokens del texto. Los nodos de proyección de salida de las MLP, sensibles a la precisión, se dejaron en coma flotante: 13 en la torre visual y 12 en la de texto. Finalmente ambos grafos se convirtieron a formato ORT para ONNX Runtime 1.30. La evidencia aportada proviene de medidas locales de sensibilidad sobre los ONNX intermedios: coseno de imagen mínimo/medio de 0,9837/0,99461 y coseno de texto mínimo de 0,9968 en los idiomas probados. La propia model card advierte que son observaciones específicas de muestra, no garantías sobre los artefactos ORT convertidos.

## Capacidades

- Recuperación imagen-texto y texto-imagen: genera embeddings de 768 dimensiones L2-normalizados en ambas modalidades, aptos para búsqueda por similitud coseno o producto interno.
- Búsqueda semántica en galerías de imágenes: indexación de vectores de imagen y consulta en lenguaje natural con un único espacio de representación.
- Clasificación zero-shot: al ser un codificador visión-lenguaje, permite puntuar pares imagen-etiqueta sin entrenamiento adicional específico.
- Procesamiento por lotes: el eje de lote de ambas torres es dinámico, lo que permite indexar galerías por lotes, aunque la resolución de imagen y los 64 tokens de texto son fijos.
- Ejecución en dispositivo: grafos en formato ORT listos para ARM y para ONNX Runtime 1.30, sin dependencia de servicios en la nube.
- Capacidades multilingües heredadas del upstream SigLIP 2 (el paper describe entrenamiento multilingüe), si bien este paquete no enumera idiomas concretos.
- No incluye generación de texto, tool calling, function calling ni razonamiento multi-paso: es exclusivamente un codificador de representaciones.
- No hay modo de pensamiento, visión generativa, audio ni salida más allá de embeddings.

## Casos de uso

- Búsqueda semántica offline en aplicaciones móviles: el paquete pesa alrededor de 0,6 GB en disco y está exportado a formato ORT listo para ARM, de modo que puede embeberse en una app Android o iOS para buscar fotografías por descripción en lenguaje natural sin enviar imágenes a un servidor.
- Organización automática de bibliotecas fotográficas: indexando los embeddings de imagen de una galería local, se pueden agrupar o filtrar fotos por conceptos (por ejemplo, "playa al atardecer" o "documento escaneado") mediante similitud coseno.
- Moderación de contenido asistida: los embeddings permiten detectar imágenes cercanas a un conjunto de referencia etiquetado por el equipo de confianza y seguridad, con la salvedad de que la similitud no es una probabilidad calibrada.
- Comercio electrónico y catálogos visuales: búsqueda de producto por imagen o por texto dentro de un catálogo, con la restricción de que las consultas de texto se truncan a 64 tokens.
- Deduplicación y curación de datasets: cálculo de similitud entre imágenes para eliminar duplicados o casi duplicados antes de entrenar otros modelos, aprovechando el coste reducido de la inferencia int8.
- Generación de descripciones de accesibilidad: recuperación de la etiqueta o descripción más cercana en una base preexistente para acompañar una imagen, sin generar texto nuevo.
- Recuperación multimodal en pipelines RAG: uso de la torre de texto como codificador de consultas y de la torre de imagen como indexador para recuperar activos visuales relevantes en un sistema de conocimiento.
- Filtrado previo en pipelines de anotación: descartar imágenes fuera de dominio antes de pasarlas a un modelo mayor y más costoso, reduciendo el cómputo total.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta medidas de sensibilidad de la cuantización sobre los ONNX intermedios (coseno de imagen mínimo/medio 0,9837/0,99461 y coseno de texto mínimo 0,9968), que no son resultados de evaluación de recuperación ni comparaciones con otros modelos, y que el propio autor califica de observaciones específicas de muestra no extrapolables a los artefactos ORT finales ni a una validación multilingüe, de latencia móvil o entre dispositivos.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB para ambas torres cargadas simultáneamente; los ficheros en disco son 195.003.280 bytes (`image.ort`), 368.788.736 bytes (`text.ort`) y 34.362.885 bytes (`tokenizer.json`), en torno a 0,6 GB en total.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de memoria libre es suficiente; no se requiere A100 ni H100. El caso de uso principal es CPU y dispositivos ARM.
- Compatibilidad con GPU consumer: sí, cabe en cualquier RTX moderna y en iGPUs con memoria compartida suficiente, dado el tamaño reducido tras la cuantización int8 selectiva.
- Despliegue: ONNX Runtime 1.30 como runtime objetivo, con artefactos en formato ORT. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo. El uso previsto es inferencia local en dispositivo, incluido ARM.
- Latencia y throughput: no disponibles; la model card no publica medidas de latencia móvil ni de rendimiento por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| aves-smart-search-siglip2-selective-int8 | no disponible | 64 tokens de texto; imagen 256 x 256 fija | ORT, int8 selectivo | apache-2.0 | Conversión para on-device con torres emparejadas y tokenizador fijado |
| timm/ViT-B-32-SigLIP2-256 | no disponible | no disponible en la informacion proporcionada | safetensors / OpenCLIP, float32 | apache-2.0 | Checkpoint upstream del que deriva este paquete |
| google/siglip2-base-patch16-256 | no disponible | no disponible en la informacion proporcionada | safetensors, Transformers | apache-2.0 (segun el upstream) | Variante oficial de SigLIP 2; tokenizador y convenciones distintas, no intercambiables con este paquete |
| CLIP ViT-B/32 (OpenAI) | no disponible | 77 tokens de texto | safetensors, Transformers | licencia propia de OpenAI | Referencia clásica de recuperación imagen-texto; monolingüe y con espacio de embeddings distinto |

La comparación cuantitativa de rendimiento no es posible porque no hay benchmarks publicados en la información disponible para este paquete ni cifras comparativas aportadas por la model card.

## Limitaciones y advertencias

- La cuantización selectiva puede alterar el orden de los resultados de recuperación; el autor recomienda probar contra una galería representativa antes de confiar en el modelo en producción.
- La evidencia de fidelidad (cosenos de 0,9837/0,99461 en imagen y 0,9968 en texto) procede de muestras concretas sobre ONNX intermedios, no de los artefactos ORT finales ni de una evaluación multilingüe completa.
- Las similitudes de embedding no son probabilidades calibradas y no deben interpretarse como tal.
- El tokenizador y las dos torres forman un par indivisible: mezclar cualquiera de ellos con otro checkpoint SigLIP 2 no está soportado.
- La resolución de imagen está fija a 256 x 256 con redimensionado bilineal que aplasta la relación de aspecto, lo que puede degradar la recuperación en imágenes muy alargadas o con detalles finos.
- Las consultas de texto se truncan a 64 tokens, insuficiente para descripciones largas o documentos.
- Idiomas concretos soportados: no disponibles. Aunque el upstream es multilingüe, este paquete no documenta qué idiomas se validaron, más allá de una referencia genérica a "los idiomas probados".
- No hay benchmarks publicados, descargas ni valoraciones registradas, por lo que la validación externa de la comunidad es nula en el momento de la consulta.
- Licencia Apache-2.0: permite uso comercial y redistribución, pero se debe conservar la atribución al checkpoint upstream de timm y a los checkpoints originales de Google Big Vision.
- El modelo no genera texto ni admite tool calling; cualquier expectativa de agente o razonamiento multi-paso queda fuera de su alcance.
- Los datos de integridad SHA-256 publicados se refieren a una ruta concreta (`siglip2-b32-256-selective-int8-v1/`) de un commit inmutable; descargar desde otro commit invalida la verificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sliderforthewin/aves-smart-search-siglip2-selective-int8
- Checkpoint upstream de timm: https://huggingface.co/timm/ViT-B-32-SigLIP2-256
- Commit fijado del checkpoint upstream: https://huggingface.co/timm/ViT-B-32-SigLIP2-256/tree/cd1efb47643f2794413dd79ef24397c175032780
- Model card del upstream: https://huggingface.co/timm/ViT-B-32-SigLIP2-256/blob/cd1efb47643f2794413dd79ef24397c175032780/README.md
- Documentación de SigLIP 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/siglip2
- Paper SigLIP 2 (arXiv 2502.14786): https://arxiv.org/abs/2502.14786
- Versión HTML del paper: https://arxiv.org/html/2502.14786v1
- Blog de SigLIP 2 en Hugging Face: https://huggingface.co/blog/siglip2
- Documentación de referencia en el repositorio de Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/siglip2.md
- Repositorio de Google Big Vision: https://github.com/google-research/big_vision
