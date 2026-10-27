# EIDORA/CLIP_ViTB32_Multimodal

## Resumen

EIDORA/CLIP_ViTB32_Multimodal es un paquete ONNX derivado de `openai/clip-vit-base-patch32`, publicado por EIDORA (no por OpenAI) dentro de su catálogo `eidora-model-zoo`. No es un modelo nuevo: es una redistribución en formato ONNX del CLIP ViT-B/32 original, pensada para ejecutarse con ONNX Runtime en lugar de PyTorch, y orientada a la extracción de características (pipeline `feature-extraction`) y a la generación de embeddings de 512 dimensiones L2-normalizados.

La particularidad de esta variante es que acepta entradas de imagen y de texto simultáneamente y fusiona ambos embeddings mediante *normalized-mean fusion* (media normalizada de los vectores de cada componente). El autor advierte explícitamente de que ese vector fusionado **no equivale** a la puntuación de similitud imagen-texto habitual de CLIP, por lo que para recuperación texto-a-imagen recomienda usar las variantes separadas Image y Text del mismo catálogo.

Su relevancia práctica es acotada pero concreta: permite integrar el backbone CLIP ViT-B/32 en infraestructuras que solo admiten ONNX (servicios en C++, edge, runtimes sin PyTorch) con un peso de repositorio de 0,6 GB. El interés es de despliegue, no de capacidades nuevas. El modelo tiene 0 descargas y 0 likes en el momento de la consulta y la model card no documenta licencia definitiva, idiomas ni datos de entrenamiento propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bimodal tipo CLIP: encoder de vision ViT-B/32 (patch 32) + encoder de texto; exportado a ONNX. Fusion de embeddings por media normalizada |
| Parametros totales | No disponible en la model card. El modelo base `openai/clip-vit-base-patch32` declara aproximadamente 151 M (88 M vision + 63 M texto) segun la documentacion publica de OpenAI; no verificado en este repositorio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card. El encoder de texto de CLIP ViT-B/32 esta limitado a 77 tokens de posicion (limite estandar del modelo base, no confirmado en este repo) |
| Tipos de cuantizacion | No se distribuyen variantes cuantizadas en el repositorio. Al ser un paquete ONNX es convertible a INT8/UINT8 con las herramientas de cuantizacion de ONNX Runtime; no confirmado por el autor |
| Idiomas soportados | No disponible. El autor no declara cobertura linguistica; el rendimiento depende del dominio e idioma de los datos de entrada (limitacion explicita de la model card) |
| Licencia | No disponible como licencia definitiva. La model card indica que el repositorio fuente de OpenAI CLIP usa MIT, pero que los terminos de redistribucion de los pesos preentrenados requieren revision antes de una publicacion publica |
| Formato de pesos | ONNX (ejecutable con ONNX Runtime). Tamano del repositorio: 0,6 GB |
| Dimension del embedding | 512, L2-normalizado (imagen, texto y fusionado) |
| Entradas admitidas | Imagen, texto o ambas (en ese caso, fusion por media normalizada) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura CLIP de OpenAI en su configuracion ViT-B/32: un Vision Transformer base con parches de 32x32 pixeles que proyecta imagenes a un espacio latente, y un encoder de texto tipo transformer que proyecta cadenas a ese mismo espacio, entrenados de forma contrastiva para alinear ambas modalidades. EIDORA no aporta detalles adicionales sobre la arquitectura interna ni sobre modificaciones respecto al original; el trabajo del publicador consiste en la exportacion a ONNX y en la definicion del modo de fusion multimodal.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, ni sobre etapas de RLHF o DPO en la informacion proporcionada (y no cabria esperarlas: CLIP se entrena con objetivos contrastivos, no con ajuste por preferencias). La unica innovacion declarada por el autor es la fusion *normalized-mean* de los embeddings normalizados de imagen y texto en un unico vector de 512 dimensiones, que sustituye a la similitud coseno clasica entre modalidades. El autor insiste en que ese vector fusionado no es comparable a la puntuacion imagen-texto estandar de CLIP, lo que implica que cualquier umbral o calibracion heredada de CLIP deja de ser valida para esta variante.

## Capacidades

- Extraccion de embeddings de imagen: vector de 512 dimensiones, L2-normalizado, a partir de una imagen de entrada.
- Extraccion de embeddings de texto: vector de 512 dimensiones, L2-normalizado, en el mismo espacio latente que las imagenes.
- Representacion multimodal fusionada: cuando se proporcionan imagen y texto, genera un unico vector por media normalizada de ambos componentes (semantica distinta a la similitud CLIP convencional).
- Similitud semantica cross-modal: busqueda texto-a-imagen e imagen-a-texto usando las variantes Image y Text del catalogo, no la fusionada.
- Clasificacion zero-shot por prototipos: comparar el embedding de una imagen con embeddings de etiquetas textuales.
- Recuperacion y clustering: los vectores normalizados permiten indexacion en bases vectoriales y agrupamiento por similitud coseno.
- No soporta generacion de texto, tool calling, razonamiento multi-paso ni comportamiento de agente. Es un modelo de representacion, no un modelo generativo.
- No se declaran capacidades de vision documental (OCR), audio ni video.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Indexacion semantica de catalogos de imagen: extraer embeddings con la variante Image y almacenarlos en una base vectorial (FAISS, Milvus, pgvector) para busqueda por similitud visual a escala; el formato ONNX permite servir el encoder en el mismo runtime que el resto del pipeline.
- Busqueda texto-a-imagen en archivos digitales: usar la variante Text para el vector de la consulta y la variante Image para el corpus, y ordenar por similitud coseno. Es el flujo que el propio autor recomienda frente a la variante fusionada.
- Deduplicacion y near-duplicate detection de imagenes: comparar embeddings normalizados con un umbral de coseno; la normalizacion L2 elimina la necesidad de reescalar los vectores en la comparacion.
- Etiquetado y curacion de datasets: clasificacion zero-shot comparando cada imagen con prototipos textuales de las categorias, util para triaje previo antes de anotacion humana.
- Filtrado y moderacion por similitud: puntuar imagenes contra descripciones de referencia para descartar o marcar contenido en pipelines de ingestao, sin coste de un modelo generativo.
- Recuperacion multimodal para RAG: recuperar imagenes relevantes para una consulta textual y pasarlas como contexto a un LLM; el encoder actua como retriever y el LLM como generador.
- Representacion conjunta para clasificadores ligeros: entrenar una regresion logistica o un MLP sobre los vectores fusionados cuando se dispone de ambos modalities por muestra (por ejemplo, ficha de producto con foto y descripcion).
- Despliegue en entornos sin PyTorch: servicios en C++, aplicaciones de escritorio o dispositivos edge donde ONNX Runtime es la unica opcion viable de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion (Recall@K), clasificacion zero-shot ni tareas de imagen-texto, y el autor advierte de que el vector fusionado no es directamente comparable con la similitud CLIP estandar, por lo que los numeros publicados para `openai/clip-vit-base-patch32` no serian trasladables a esta variante sin una reevaluacion. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: en torno a 1 GB en FP32 para el conjunto de ambos encoders (el repositorio ONNX ocupa 0,6 GB). Con cuantizacion INT8 podria reducirse aproximadamente a 0,3-0,5 GB, aunque el autor no distribuye esas variantes.
- Inferencia en CPU: viable. Un ViT-B/32 con parches de 32 es lo bastante pequeno para ejecutarse en CPU con ONNX Runtime en tareas de extraccion por lotes.
- GPU: no requiere GPU dedicada. Cualquier GPU con 2 GB o mas de VRAM es suficiente; modelos como RTX 3060/4090, A100 o H100 aportan throughput, no capacidad.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML), servidores de inferencia compatibles con ONNX (Triton Inference Server, ONNX Runtime Server), y conversion a otros runtimes (OpenVINO, ExecuTorch) si se requiere.
- Latencia y throughput: no disponibles. No hay datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| EIDORA/CLIP_ViTB32_Multimodal | No publicado; base ~151 M | No publicado (estandar CLIP: 77 tokens) | ONNX | No disponible, sujeta a revision de terminos de pesos | 0 descargas, 0 likes |
| openai/clip-vit-base-patch32 | ~151 M (documentacion OpenAI) | 77 tokens | PyTorch / safetensors | Codigo MIT; terminos propios para los pesos | Modelo original, ampliamente usado |
| sentence-transformers/clip-ViT-B-32 | Mismo backbone ViT-B/32 | 77 tokens | PyTorch / safetensors | No verificada en la informacion disponible | Envoltorio con API de sentence-transformers para embeddings |
| Arm clip-vit-base-patch32 INT8 (ExecuTorch) | Mismo backbone, vision en INT8 + texto FP32 | No disponible | ExecuTorch (.pte) | No verificada en la informacion disponible | Optimizado para edge en hardware Arm |

La diferencia funcional de la variante de EIDORA no esta en el rendimiento (mismo backbone, mismos pesos de origen) sino en el empaquetado ONNX y en la fusion de embeddings, un modo de uso que ninguna de las alternativas ofrece y que el propio autor desaconseja para recuperacion texto-a-imagen.

## Limitaciones y advertencias

- Licencia no resuelta: la model card indica que los terminos de redistribucion de los pesos preentrenados "requieren revision antes de una publicacion publica". No hay licencia declarada, lo que bloquea de facto un uso comercial sin aclaracion legal previa con el publicador.
- La similitud entre embeddings no establece identidad, correccion factica, autoria ni intencion; es una limitacion explicita del autor y desaconseja usar las puntuaciones como evidencia.
- El vector fusionado no equivale a la similitud imagen-texto de CLIP. Cualquier umbral, calibracion o evaluacion heredada del modelo original deja de ser valida en esta variante.
- Rendimiento dependiente del dominio y del idioma de los datos de entrada, sin que se documente que idiomas estan cubiertos.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes. No hay evidencia de terceros sobre su correcto funcionamiento ni sobre la fidelidad de la exportacion ONNX respecto al original.
- Los repositorios hermanos (Image y Text) pueden no ser publicos todavia segun la propia model card, lo que rompe el flujo recomendado de recuperacion por variantes separadas.
- Sesgos: no documentados en esta ficha. Al heredar los pesos de CLIP, arrastra las caracteristicas de sus datos de entrenamiento originales (pares imagen-texto extraidos de la web), pero el publicador no aporta analisis ni mitigaciones.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si en el sentido de que la similitud puede producir correspondencias espurias entre imagenes y textos no relacionados.
- Limite de 77 tokens en el encoder de texto (estandar de CLIP, no confirmado en este repo): las descripciones largas se truncan y pierden informacion.
- Fecha de creacion del repositorio posterior a la de esta consulta (2026-10-27), sin que se aporte explicacion; conviene verificar la integridad de los artefactos antes de integrarlos en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EIDORA/CLIP_ViTB32_Multimodal
- Variante Image: https://huggingface.co/EIDORA/CLIP_ViTB32_Image
- Variante Text: https://huggingface.co/EIDORA/CLIP_ViTB32_Text
- Empaquetado EIDORA CLIP ViT-B/32: https://huggingface.co/EIDORA/CLIP_ViT-B32
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Repositorio fuente de OpenAI CLIP (MIT): https://github.com/openai/CLIP
- Paper de CLIP (referencia del modelo base): https://arxiv.org/abs/2103.00020
- Alternativa sentence-transformers: https://huggingface.co/sentence-transformers/clip-ViT-B-32
- Alternativa cuantizada INT8 para Arm: https://developer.arm.com/ai/models/hugging-face/Arm/clip-vit-base-patch32-int8-xnnpack-executorch/clip-vit-b32-int8-pte
- Ejemplo de uso multimodal BERT + CLIP: https://github.com/chandrasuman698-afk/fake-news-multimodal
- Implementacion PEViT (adaptacion parametro-eficiente de ViT): https://github.com/eric-ai-lab/PEViT/blob/master/vision_benchmark/resources/model/vitb32_CLIP.yaml
