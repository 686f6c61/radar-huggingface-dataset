# CollectionStudio/siglip2-so400m-patch16-384

## Resumen

SigLIP 2 So400m es un codificador vision-lenguaje de doble torre desarrollado por Google y publicado originalmente como `google/siglip2-so400m-patch16-384`. La ficha que se analiza aquí, `CollectionStudio/siglip2-so400m-patch16-384`, es una reproducción del checkpoint original subida por un tercero, con los mismos pesos y la misma licencia Apache 2.0. SigLIP 2 amplía el objetivo de preentrenamiento de SigLIP (pérdida sigmoide sobre pares imagen-texto) incorporando en una única receta objetivos de decodificación, predicción global-local enmascarada y adaptabilidad de resolución y relación de aspecto.

El modelo tiene 1.136.039.602 parámetros totales, lo que corresponde al conjunto formado por la torre de visión SoViT (aproximadamente 400 M de parámetros, parches de 16x16 y resolución de entrada de 384x384) y el codificador de texto asociado. No es un modelo generativo: no produce texto libre, sino embeddings alineados de imagen y texto. Su función principal es la clasificación de imágenes zero-shot, la recuperación imagen-texto y el uso como torre de visión dentro de modelos vision-language más grandes.

Su relevancia actual radica en que SigLIP 2 mejora de forma medible a SigLIP en comprensión semántica, localización de objetos y características densas, y añade soporte multilingüe, lo que lo convierte en uno de los codificadores visuales de referencia para pipelines de visión por computador y para el entrenamiento de VLMs. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de doble torre (vision encoder tipo ViT So400m + text encoder) con objetivo de contraste sigmoide (SigLIP 2) |
| Parametros totales | 1.136.039.602 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un LLM generativo; el codificador de texto procesa secuencias cortas de texto, sin dato concreto en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible en la model card; los pesos se distribuyen en safetensors (previsiblemente bf16/fp32) y admiten cuantizacion posterior via PyTorch u ONNX Runtime |
| Idiomas soportados | no disponible (el paper asociado describe SigLIP 2 como multilingue, pero la lista concreta de idiomas no se detalla en la informacion proporcionada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,6 GB |
| Tamano de parche | 16x16 |
| Resolucion de entrada | 384x384 |
| Pipeline declarado | zero-shot-image-classification |
| Libreria | transformers |

## Arquitectura y entrenamiento

SigLIP 2 es un codificador de doble torre: una torre de visión basada en transformer (variante So400m, con parches de 16x16 sobre imágenes de 384x384) y una torre de texto, ambas proyectadas a un espacio latente común. A diferencia de CLIP, que normaliza sobre el lote completo y usa softmax, SigLIP emplea una pérdida sigmoide sobre cada par imagen-texto, lo que permite entrenar con lotes muy grandes sin necesidad de sincronización global de negativos. SigLIP 2 mantiene esa base y añade tres ingredientes: una pérdida de decodificación sobre el texto, una pérdida de predicción global-local enmascarada que obliga al modelo a capturar tanto la escena completa como regiones concretas, y un entrenamiento adaptable a distintas resoluciones y relaciones de aspecto.

El preentrenamiento se realizó sobre el dataset WebLI (Chen et al., 2023), una colección a gran escala de pares imagen-texto, con hasta 2048 chips TPU-v5e. La model card no especifica el número total de tokens, la composición exacta del dataset ni si hubo etapas de ajuste fino con RLHF o DPO; esos datos no están disponibles en la información proporcionada. La innovación más relevante de cara a producción es que las características densas y la localización mejoran respecto a SigLIP, lo que habilita tareas de segmentación y detección asistidas sin reentrenamiento.

## Capacidades

- Clasificación de imágenes zero-shot: asigna etiquetas de texto arbitrarias a una imagen sin ajuste fino, mediante `pipeline(task="zero-shot-image-classification")`.
- Recuperación imagen-texto y texto-imagen: genera embeddings alineados en un espacio común, aptos para búsqueda semántica y ranking.
- Extracción de características visuales: `get_image_features()` devuelve embeddings de imagen utilizables como entrada de clasificadores lineales, sistemas de recuperación o VLMs.
- Comprensión semántica global de la escena, mejorada respecto a SigLIP 1.
- Localización y características densas: útil para tareas que requieren información espacial (detección y segmentación asistidas).
- Adaptabilidad de resolución y relación de aspecto durante el entrenamiento, lo que facilita el uso con imágenes de proporciones diversas.
- Soporte multilingüe declarado en el paper, aunque la lista de idiomas no se detalla en la información disponible.
- No soporta tool calling ni function calling: no es un modelo de lenguaje generativo.
- No dispone de modo de razonamiento ni de generación de texto libre.

## Casos de uso

- Moderación de contenido visual: clasificación zero-shot de imágenes entrantes contra un conjunto de etiquetas de política (por ejemplo, "contenido violento", "desnudo", "documento escaneado"), sin necesidad de recolectar datos etiquetados para cada categoría nueva.
- Búsqueda semántica en catálogos de producto: indexar los embeddings de imagen de un catálogo y permitir consultas en lenguaje natural, usando el espacio compartido imagen-texto del modelo.
- Etiquetado automático de activos multimedia: generar metadatos descriptivos para bibliotecas de imágenes o vídeo (fotogramas clave) mediante clasificación zero-shot contra taxonomías de etiquetas.
- Filtrado previo en pipelines de anotación: priorizar qué imágenes debe revisar un anotador humano, descartando automáticamente las que el modelo clasifica con alta confianza en categorías irrelevantes.
- Torre de visión para VLMs: sustituir o inicializar el encoder visual de un modelo vision-language propio, aprovechando las características densas y la resolución de 384x384.
- Verificación de coherencia imagen-texto: comprobar si una imagen y su pie de foto o descripción de producto son consistentes, útil en control de calidad de contenidos generados o subidos por usuarios.
- Clasificación de imágenes médicas o industriales de dominio específico: como extractor congelado más una cabeza lineal ligera entrenada con pocos ejemplos etiquetados.
- Recuperación en sistemas de gestión documental: indexar documentos escaneados y fotografías por similitud semántica con consultas textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a una tabla de evaluación incluida como imagen en el paper de SigLIP 2 (`arXiv:2502.14786`), pero los valores numéricos concretos no están accesibles en el material proporcionado, por lo que no se reproducen aquí.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 2,3 GB (1.136 millones de parámetros). En fp32, alrededor de 4,5 GB.
- VRAM estimada para inferencia de un solo lote a 384x384: del orden de 3 a 5 GB en bf16, incluyendo activaciones y el codificador de texto.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 2070, etc.). Con cuantización a fp16/bf16 basta con 4-6 GB; en fp32 se recomienda 8 GB.
- GPU recomendadas para producción: NVIDIA A10G, L4, L40S, A100 40/80 GB o H100 cuando se procesan lotes grandes o se usa como torre de visión de un VLM.
- Despliegue: soporte nativo en `transformers` mediante `AutoModel` y `AutoProcessor`, y pipeline de `zero-shot-image-classification`. Exportable a ONNX para servir con ONNX Runtime o Triton. La integración con vLLM o TGI no se detalla en la información proporcionada.
- Batching: el modelo escala bien con lotes grandes porque la inferencia es de una sola pasada hacia delante, sin decodificación autoregresiva.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SigLIP 2 So400m (este modelo) | 1.136.039.602 | Doble torre vision-texto | Imagenes 384x384, parches 16x16 | Apache 2.0 | HuggingFace (checkpoint original y esta copia) |
| SigLIP So400m (SigLIP 1) | aproximadamente 878 M (torre de vision) | Doble torre vision-texto | Imagenes 384x384, parches 14x14 | Apache 2.0 | HuggingFace |
| CLIP ViT-L/14 | aproximadamente 428 M | Doble torre vision-texto | Imagenes 224x224 | MIT (segun variante) | HuggingFace, OpenAI |
| DINOv2 (ViT-L/14) | aproximadamente 300 M | Encoder visual auto-supervisado | Imagenes 224-518 px | Apache 2.0 | HuggingFace, Meta |

Comparativa de rendimiento entre estos modelos: no disponible en la información proporcionada. Las diferencias cualitativas documentadas en el paper de SigLIP 2 son mejoras en comprensión semántica, localización y características densas respecto a SigLIP 1, además de cobertura multilingüe.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas. Cualquier uso conversacional requiere combinarlo con un LLM.
- Riesgo de alucinación en el sentido de falsos positivos de clasificación: al ser un modelo de similitud, puede asignar puntuaciones altas a etiquetas incorrectas cuando el prompt textual es ambiguo o la imagen es atípica.
- Sesgos heredados del dataset WebLI, que refleja la distribución de contenido web y puede sobrerrepresentar determinadas culturas, idiomas y contextos demográficos.
- Cobertura lingüística: el modelo se declara multilingüe, pero la lista concreta de idiomas no está disponible, por lo que el rendimiento en castellano u otras lenguas no está documentado en esta ficha.
- Repositorio de terceros: el checkpoint procede de `CollectionStudio`, no de Google. Aunque la licencia y los pesos declarados coinciden con el original, conviene verificar la integridad de los ficheros antes de usarlo en producción y preferir `google/siglip2-so400m-patch16-384` como referencia canónica.
- El repositorio es reciente y no acumula descargas ni valoraciones, lo que reduce la evidencia de uso en comunidad y la trazabilidad frente al original.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el texto de atribución.
- Sin soporte declarado de tool calling, agentes ni multi-step reasoning, por su propia naturaleza de codificador no generativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/siglip2-so400m-patch16-384
- Checkpoint original de Google: https://huggingface.co/google/siglip2-so400m-patch16-384
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Paper de SigLIP: https://arxiv.org/abs/2303.15343
- Paper del dataset WebLI: https://arxiv.org/abs/2209.06794
- Documentacion de SigLIP en transformers: https://huggingface.co/transformers/main/model_doc/siglip.html
- Imagen de ejemplo del widget (COCO): https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/bee.jpg
- Benchmarks y resultados del paper: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/sg2-blog/eval_table.png

Nota: la búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo; los resultados obtenidos no guardan relación con SigLIP 2 ni con visión por computador, por lo que se han descartado.
