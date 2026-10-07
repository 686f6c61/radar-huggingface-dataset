# CollectionStudio/siglip-base-patch16-256-multilingual

## Resumen

SigLIP (Sigmoid Loss for Language Image Pre-Training) es una familia de modelos multimodales de doble torre que empareja imágenes y texto, propuesta por Zhai et al. (Google Research) en 2023. Esta ficha corresponde a la variante base con parches de 16x16 píxeles, resolución de entrada 256x256 y codificador de texto multilingüe, publicada en Hugging Face por el usuario CollectionStudio como espejo del modelo original de Google.

El modelo resuelve tareas de alineación imagen-texto sin generación: clasificación zero-shot de imágenes, recuperación (retrieval) imagen-texto y texto-imagen, y filtrado o etiquetado de grandes colecciones visuales. Su innovación principal frente a CLIP es la función de pérdida sigmoidea, que opera únicamente sobre pares imagen-texto y no necesita una normalización global de las similitudes por lote, lo que permite escalar el tamaño de batch y mejora el comportamiento con lotes pequeños.

Con 370.626.050 parámetros (según los metadatos de safetensors), el modelo es lo bastante ligero para ejecutarse en GPU de consumo, y su licencia Apache 2.0 facilita la integración en productos comerciales. La model card indica que fue preentrenado sobre WebLI sin filtro de idioma, lo que sustenta su carácter multilingüe, aunque no se detalla el inventario exacto de idiomas ni se publican cifras de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de doble torre tipo CLIP: codificador de imagen ViT con parches de 16x16 y resolución 256x256, más codificador de texto, entrenados con pérdida sigmoidea |
| Parámetros totales | 370.626.050 (dato real de los safetensors del repositorio) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el preprocesado descrito rellena los textos a 64 tokens |
| Tipos de cuantización | No disponible; los pesos publicados ocupan aproximadamente 1,5 GB en safetensors, coherente con fp32. La carga en fp16/bf16 es posible con transformers, pero no hay cuantizaciones publicadas (GGUF, GPTQ, AWQ) |
| Idiomas soportados | Multilingüe: preentrenado sobre WebLI sin filtro de idioma. La model card no enumera los idiomas concretos |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SigLIP es una arquitectura de dos torres: un codificador visual de tipo Vision Transformer que divide la imagen en parches de 16x16 píxeles y un codificador de texto independiente. La diferencia con CLIP reside en la función de pérdida: en lugar de una softmax sobre todas las similitudes del lote (que exige una vista global de la matriz de pares), SigLIP aplica una pérdida sigmoidea par a par. Esto elimina la necesidad de normalización global, permite aumentar el tamaño de lote y, según el artículo, rinde mejor con lotes pequeños. La model card describe el modelo como "CLIP con una mejor función de pérdida".

El preentrenamiento se realizó sobre el dataset WebLI sin filtro de idioma, lo que explica la variante multilingüe. Las imágenes se redimensionan a 256x256 y se normalizan por canal RGB con media (0,5, 0,5, 0,5) y desviación típica (0,5, 0,5, 0,5); los textos se tokenizan y se rellenan a una longitud de 64 tokens. El cómputo de entrenamiento se llevó a cabo en 16 chips TPU-v4 durante tres días. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por instrucciones, algo esperable en un modelo de representación y no generativo.

## Capacidades

- Clasificación zero-shot de imágenes: asignar etiquetas de texto arbitrarias a una imagen y obtener probabilidades mediante sigmoide sobre los logits imagen-texto.
- Recuperación imagen-texto y texto-imagen (retrieval) para búsqueda semántica en colecciones de imágenes.
- Multilingüismo: al entrenarse sobre WebLI sin filtro de idioma, las consultas de texto pueden formularse en varios idiomas, aunque la model card no detalla cuáles ni su cobertura relativa.
- Puntuar la similitud entre una imagen y un conjunto de descripciones candidatas, útil para ranking y filtrado.
- Preetiquetado masivo de imágenes para generar datasets de entrenamiento supervisado.
- Integración directa con la API de transformers: `AutoModel`, `AutoProcessor` y el pipeline `zero-shot-image-classification`.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni modos de pensamiento: es un modelo de representación, no un modelo de lenguaje generativo.
- No dispone de capacidades de audio ni de vídeo en la información disponible.

## Casos de uso

- Clasificación de catálogo en comercio electrónico: definir etiquetas de producto en lenguaje natural ("zapatilla de running", "bolso de cuero") y clasificar automáticamente las imágenes subidas por los vendedores sin entrenar un clasificador específico.
- Búsqueda visual en bibliotecas de activos: indexar un repositorio de imágenes calculando embeddings y permitir consultas en texto libre para recuperar las imágenes más similares.
- Moderación y filtrado de contenido: puntuar imágenes contra listas de categorías permitidas o prohibidas y derivar a revisión humana los casos con probabilidad intermedia.
- Preetiquetado de datasets: generar etiquetas provisionales sobre grandes volúmenes de imágenes para reducir el coste de anotación manual antes de entrenar un modelo supervisado.
- Curaduría de datasets multimodales: filtrar pares imagen-texto mal alineados en un corpus de entrenamiento comparando la similitud entre la imagen y su descripción.
- Accesibilidad y etiquetado multilingüe: generar etiquetas descriptivas en varios idiomas para catálogos de imágenes, aprovechando el preentrenamiento sin filtro de idioma.
- Organización automática de fototecas y sistemas DAM: agrupar imágenes por concepto usando etiquetas configurables por el usuario en lugar de taxonomías cerradas.
- Sistemas de recomendación visual: comparar la imagen de un producto con descripciones de preferencias del usuario para ordenar candidatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una referencia a una figura comparativa del artículo original (SigLIP frente a CLIP) y a la tabla de evaluación del paper, pero no se reproducen valores numéricos en el repositorio analizado. Los enlaces a los artículos se recogen en la sección de enlaces por si se desea consultar las cifras originales.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en fp32 y 0,75 GB en fp16/bf16 solo para los pesos; con activaciones y lotes pequeños conviene reservar entre 2 y 3 GB, y entre 4 y 8 GB para lotes grandes. Son estimaciones calculadas a partir del número de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sirve para inferencia en fp16 (por ejemplo, GTX 1650, RTX 3050, RTX 3060). Para procesar lotes grandes o servir tráfico concurrente son adecuadas RTX 4090, A100 o H100, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo recientes y también en CPU para cargas por lotes no interactivas.
- Opciones de despliegue: transformers con `AutoModel` y `AutoProcessor`, o el pipeline `zero-shot-image-classification`. No se documentan en la información disponible integraciones con vLLM, TGI, llama.cpp u Ollama, herramientas orientadas a modelos generativos o a pesos cuantizados en GGUF.
- Latencia y throughput: no disponibles. El único dato de cómputo publicado es el de entrenamiento (16 TPU-v4 durante tres días).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CollectionStudio/siglip-base-patch16-256-multilingual | Doble torre, ViT patch16 256x256 + texto, pérdida sigmoidea | 370.626.050 | Imagen 256x256, texto con relleno a 64 tokens | Apache 2.0 | Hugging Face (espejo; 0 descargas y 0 likes en el momento de la consulta) |
| google/siglip-base-patch16-256-multilingual | Doble torre, misma configuración | No disponible en la información proporcionada (es el modelo de origen del espejo) | Imagen 256x256, texto con relleno a 64 tokens | Apache 2.0 | Hugging Face (repositorio oficial de referencia) |
| google/siglip-base-patch16-224 | Doble torre, ViT patch16 a 224x224 | No disponible | Imagen 224x224 | Apache 2.0 | Hugging Face |
| openai/clip-vit-base-patch16 | Doble torre CLIP con pérdida softmax contrastiva | No disponible | Imagen 224x224 | Licencia propia de OpenAI (no Apache 2.0) | Hugging Face |

La comparación cuantitativa de rendimiento entre estas alternativas no puede establecerse con la información disponible, ya que la model card no reproduce las cifras del artículo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, descripciones ni respuestas. Solo calcula similitudes entre imágenes y textos.
- Riesgo de etiquetado erróneo con alta confianza: la salida sigmoidea es una probabilidad por par, no una distribución normalizada entre clases, por lo que varias etiquetas pueden obtener puntuaciones altas simultáneamente; conviene calibrar umbrales con datos propios.
- Sesgos del dataset: WebLI es un corpus extraído de la web, sin filtro de idioma, por lo que hereda desequilibrios de representación cultural, geográfica y de género, además de una cobertura desigual entre idiomas.
- Resolución fija de 256x256 y parches de 16x16: los detalles finos (texto pequeño, objetos diminutos) pueden perderse.
- Textos limitados a 64 tokens en el preprocesado de entrenamiento: descripciones largas o consultas complejas pueden truncarse o degradar la calidad de la representación.
- Idiomas: aunque el modelo se presenta como multilingüe, no se documenta la lista de idiomas soportados ni su rendimiento relativo, por lo que el comportamiento en idiomas minoritarios es incierto.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero la licencia cubre el modelo, no necesariamente los datos de entrenamiento subyacentes (WebLI).
- Repositorio espejo: el identificador analizado (CollectionStudio) registra 0 descargas y 0 likes, y los ejemplos de la model card remiten al identificador `google/siglip-base-patch16-256-multilingual`. Para producción conviene verificar que los pesos coinciden con el repositorio oficial y fijar una revisión concreta.
- Metadatos anómalos: la fecha de creación indicada en el repositorio es 2026-10-06, posterior a la fecha habitual de publicación del modelo; se recomienda contrastar con el repositorio oficial.
- Sin garantías de mantenimiento: al ser un espejo sin actividad, no hay soporte del autor original ni actualizaciones previsibles en ese identificador.

## Enlaces

- Repositorio analizado: https://huggingface.co/CollectionStudio/siglip-base-patch16-256-multilingual
- Modelo de origen: https://huggingface.co/google/siglip-base-patch16-256-multilingual
- Artículo de SigLIP: https://arxiv.org/abs/2303.15343
- Artículo de WebLI: https://arxiv.org/abs/2209.06794
- Repositorio de código big_vision: https://github.com/google-research/big_vision
- Documentación de SigLIP en transformers: https://huggingface.co/docs/transformers/model_doc/siglip
- Otros modelos de la familia SigLIP: https://huggingface.co/models?search=google/siglip
- Resumen del artículo por uno de los autores: https://twitter.com/giffmana/status/1692641733459267713
