# CollectionStudio/siglip-large-patch16-384

## Resumen

SigLIP (Sigmoid Loss for Language Image Pre-Training) es un modelo multimodal de tipo dual encoder que aprende representaciones conjuntas de imagen y texto. Esta ficha corresponde a la variante large con parches de 16x16 y resolucion de entrada de 384x384, publicada en el repositorio CollectionStudio/siglip-large-patch16-384, un reupload del checkpoint original google/siglip-large-patch16-384. El autor original es el equipo de Google Research (Zhai et al.), que lo presento en el paper "Sigmoid Loss for Language Image Pre-Training" (arXiv:2303.15343) y lo libero a traves del repositorio big_vision.

La innovacion principal frente a CLIP es la funcion de perdida: SigLIP sustituye el softmax contrastivo global por una perdida sigmoide que opera unicamente sobre cada par imagen-texto de forma independiente, sin necesidad de normalizar contra todas las similitudes del lote. Esto elimina la necesidad de calcular una matriz completa de similitudes y permite escalar el tamano de lote sin las restricciones de CLIP, ademas de comportarse mejor con lotes pequenos.

El modelo tiene 652.478.466 parametros (~652 M) y un peso de repositorio de 2,6 GB. No es un modelo generativo: su salida son embeddings alineados de imagen y texto, lo que lo hace util para clasificacion zero-shot, recuperacion imagen-texto, filtrado de datasets y como torre de vision en arquitecturas multimodales posteriores. Su licencia Apache 2.0 facilita la integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder multimodal tipo CLIP: Vision Transformer (ViT) para imagen + transformer de texto, entrenados con perdida sigmoide |
| Parametros totales | 652.478.466 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica en el sentido autoregresivo: el texto se tokeniza y se rellena (padding) a una longitud fija de 64 tokens; la imagen se procesa a 384x384, lo que produce 576 parches (24x24 con patch 16x16) |
| Tipos de cuantizacion | No disponible (el repo solo distribuye pesos en safetensors; no se documentan versiones GGUF, int8 ni int4) |
| Idiomas soportados | Entrenado sobre pares imagen-texto en ingles del dataset WebLI; no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | No disponible |
| Tamano del repositorio | 2,6 GB |
| Resolucion de imagen | 384x384, normalizada con media (0.5, 0.5, 0.5) y desviacion tipica (0.5, 0.5, 0.5) |
| Fecha de creacion / actualizacion | 2026-10-06 (sin actualizaciones posteriores registradas) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SigLIP es un modelo de dos torres. La torre de vision es un Vision Transformer que divide la imagen de 384x384 en parches de 16x16, los proyecta a embeddings y los procesa con atencion global; la torre de texto es un transformer que codifica la secuencia de tokens (rellenada a 64 posiciones). Ambas torres proyectan a un espacio comun y la similitud se calcula como producto escalar. La diferencia clave con CLIP es que cada par imagen-texto se evalua con una funcion sigmoide independiente en lugar de un softmax sobre el lote completo, lo que hace que el coste de memoria no dependa de una matriz de similitudes NxN y permite lotes mucho mayores.

Los datos de entrenamiento son los pares imagen-texto en ingles del dataset WebLI (Chen et al., 2023; arXiv:2209.06794). El modelo se entreno con 16 chips TPU-v4 durante tres dias, segun la informacion de la model card. El preprocesado consiste en redimensionar la imagen a 384x384, normalizar por canal RGB y tokenizar el texto con padding a 64 tokens. No se documenta en la informacion disponible el uso de RLHF, DPO ni fases de ajuste por preferencias, algo esperable en un modelo contrastivo que no genera texto. La model card indica explicitamente que el equipo de SigLIP no escribio una model card propia y que la version publicada en HuggingFace fue redactada por el equipo de Hugging Face; el repositorio aqui descrito es a su vez una copia de terceros (CollectionStudio), por lo que conviene verificar los pesos contra el checkpoint oficial de Google.

## Capacidades

- Clasificacion de imagenes zero-shot: asignar etiquetas de texto arbitrarias a una imagen y obtener probabilidades normalizadas mediante sigmoide sobre los logits por imagen.
- Recuperacion imagen-texto y texto-imagen (image-text retrieval) en el espacio de embeddings compartido.
- Calculo de similitud imagen-texto: util para filtrado, deduplicacion y curacion de datasets multimodal.
- Extraccion de embeddings de vision congelados para tareas posteriores (linear probing, clasificacion, deteccion de near-duplicates).
- Extraccion de embeddings de texto hasta 64 tokens en el mismo espacio semantico que las imagenes.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje generativo.
- No soporta tool calling, function calling ni comportamiento agentico.
- No soporta vision generativa, audio, video ni modo "thinking".
- Capacidad multilingue: no declarada; el entrenamiento se limita a pares en ingles.
- Integracion con la libreria Transformers mediante AutoModel, AutoProcessor y el pipeline de zero-shot-image-classification.

## Casos de uso

- Moderacion y etiquetado automatico de contenido visual: se define un conjunto de etiquetas candidatas (por ejemplo, "contenido violento", "desnudo", "paisaje") y el modelo devuelve una probabilidad por etiqueta con una unica pasada hacia delante, sin necesidad de entrenar un clasificador especifico.
- Organizacion y busqueda en fototecas corporativas: se indexan los embeddings de imagen de todo el catalogo y se permite busqueda en lenguaje natural escribiendo una consulta de hasta 64 tokens, con recuperacion por similitud coseno.
- Curacion de datasets de entrenamiento multimodal: filtrar pares imagen-texto mal alineados calculando la similitud entre la imagen y su caption, y descartar aquellos por debajo de un umbral, antes de alimentar un pipeline de entrenamiento mayor.
- Deduplicacion de imagenes a gran escala: comparar embeddings de imagen entre si para detectar duplicados exactos y near-duplicates, reduciendo el coste de almacenamiento y el sesgo por repeticion en datasets de entrenamiento.
- Clasificacion de imagenes medicas o industriales en entornos con pocas etiquetas: cuando no hay datos etiquetados suficientes para entrenar un clasificador supervisado, el modo zero-shot permite obtener una linea base funcional definiendo las clases como texto.
- Componente de vision en un sistema RAG multimodal: los embeddings de imagen generados por SigLIP se almacenan en un indice vectorial y se combinan con embeddings de texto de otro modelo para responder consultas que requieren informacion visual.
- Control de calidad en e-commerce: clasificar automaticamente imagenes de producto segun categoria, color o tipo de prenda definiendo las etiquetas como texto, sin reentrenamiento cuando cambia el catalogo.
- Aviso: en todos estos casos el modelo actua como extractor de representaciones o clasificador, no como generador; cualquier salida textual debe producirla otro modelo.

## Benchmarks y rendimiento

La model card referencia una tabla comparativa de SigLIP frente a CLIP tomada del paper, pero esa tabla se incluye como imagen y no se proporcionan los valores numericos en la informacion disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 2,6 GB y el uso total con activaciones ronda los 3-4 GB; en fp16/bf16 el peso baja a aproximadamente 1,3 GB y el consumo total a 2-2,5 GB; en int8 se estima en torno a 0,7-1,5 GB. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema; el modelo es pequeno para el estandar actual de LLM.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 8 GB son suficientes, e incluso GPUs de 4-6 GB pueden albergarlo en fp16 con lotes pequenos.
- CPU: es viable para inferencia puntual (una imagen contra unas pocas etiquetas) gracias al tamano moderado, pero con una latencia alta y throughput bajo.
- Opciones de despliegue: Transformers (AutoModel/AutoProcessor), pipeline de zero-shot-image-classification, exportacion a ONNX o TorchScript, y frameworks de serving de modelos de vision como TorchServe o Triton. No se documentan pesos GGUF, por lo que llama.cpp y Ollama no son aplicables directamente a este checkpoint.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Como referencia cualitativa, es un modelo de una sola pasada (no autorregresivo), por lo que la latencia por imagen es muy inferior a la de un modelo generativo de tamano similar.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / contexto de texto | Licencia | Notas |
|---|---|---|---|---|
| SigLIP large patch16-384 (este) | 652 M | 384x384, 64 tokens de texto | Apache 2.0 | Perdida sigmoide, permite lotes grandes |
| SigLIP base patch16-384 | aproximadamente 203 M (dato de referencia publica, no incluido en la informacion proporcionada) | 384x384, 64 tokens de texto | Apache 2.0 | Version mas ligera de la misma familia |
| CLIP ViT-L/14 | aproximadamente 428 M (dato de referencia publica, no incluido en la informacion proporcionada) | 224x224, 77 tokens de texto | Licencia propia de OpenAI (no Apache 2.0) | Linea base contrastiva con softmax; el paper de SigLIP lo usa como referencia |
| OpenCLIP ViT-L/14 | no disponible en la informacion proporcionada | no disponible | no disponible | Reimplementacion abierta de CLIP |

Las cifras de modelos comparables no proceden de la informacion proporcionada en esta ficha y deben verificarse contra sus respectivas model cards antes de usarse en una decision tecnica. No se dispone de datos de benchmark comparativos numericos en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas conversacionales. No debe presentarse como un LLM ni usarse como tal.
- Sesgos: al entrenarse sobre pares imagen-texto en ingles de WebLI (datos raspados de la web), hereda los sesgos de representacion de esa fuente en cuanto a genero, etnia, cultura y geografia, y su rendimiento en imagenes de dominios poco representados (por ejemplo, contextos no occidentales) sera peor.
- Riesgo de alucinacion: no aplica en el sentido clasico de generacion de texto, pero si existe el riesgo de asignar una etiqueta de texto con alta probabilidad a una imagen que no la contiene, especialmente con etiquetas semanticamente proximas o prompts ambiguos.
- Limitacion de idioma: el entrenamiento se limita al ingles; el uso de etiquetas o consultas en castellano puede degradar notablemente la precision sin un ajuste previo.
- Limitacion de contexto de texto: la torre de texto se rellena a 64 tokens, por lo que descripciones largas se truncan y pierden informacion.
- Limitacion de resolucion: las imagenes se redimensionan a 384x384, lo que destruye detalle fino en escenas con texto pequeno, objetos diminutos o documentos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar los avisos de licencia y de atribucion. Al ser un reupload de terceros, conviene verificar que los pesos coinciden con el checkpoint oficial de Google antes de desplegarlo en produccion.
- Repositorio de terceros con 0 descargas y 0 likes: no ha pasado por un proceso de validacion de la comunidad. Para uso en produccion es mas prudente descargar el checkpoint original google/siglip-large-patch16-384.
- La model card fue redactada por Hugging Face, no por el equipo que entreno el modelo, y la model card del reupload es una copia de esa misma informacion.
- No se documentan versiones cuantizadas ni pesos en formato GGUF, lo que limita las opciones de despliegue en entornos de bajos recursos que dependan de llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/siglip-large-patch16-384
- Checkpoint original: https://huggingface.co/google/siglip-large-patch16-384
- Paper de SigLIP: https://arxiv.org/abs/2303.15343
- Paper del dataset WebLI: https://arxiv.org/abs/2209.06794
- Repositorio big_vision de Google Research: https://github.com/google-research/big_vision
- Documentacion de SigLIP en Transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Resumen del paper por uno de los autores: https://twitter.com/giffmana/status/1692641733459267713

Nota: los resultados de la busqueda web proporcionada no contienen enlaces relevantes sobre este modelo; los enlaces listados proceden de la model card y del identificador del repositorio.
