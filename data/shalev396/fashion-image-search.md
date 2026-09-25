# shalev396/fashion-image-search

## Resumen

fashion-image-search es un sistema de recuperación visual de productos de moda publicado por el usuario shalev396 en Hugging Face. No es un modelo de lenguaje ni un transformer generativo: es un pipeline de extracción de características de imagen compuesto por un backbone convolucional MobileNetV2 congelado (preentrenado en ImageNet), una reducción de dimensionalidad mediante PCA ajustada sobre el propio catálogo y una búsqueda exacta de vecinos más cercanos por similitud coseno. El problema que resuelve es concreto: dada una foto de una prenda o accesorio, devolver los productos más parecidos de un catálogo de 8.000 artículos, con nombre, categoría y miniatura.

Su relevancia es la de un caso de estudio reproducible más que la de un modelo de frontera: todo el sistema ocupa 2,26 millones de parámetros, se ejecuta en CPU y su código de entrenamiento, notebook y artefactos están publicados abiertamente. La model card documenta el protocolo de evaluación completo (split estratificado, 500 consultas de validación para elegir variante y 500 de test reportadas una sola vez) y compara cinco representaciones distintas bajo la misma búsqueda k-NN, lo que permite auditar las decisiones de diseño.

La licencia es MIT y el autor declara métricas de recuperación en el dataset Fashion Product Images (Small) de Kaggle: 0,978 de precisión@1 en categoría maestra y 0,7284 de precisión@5 en tipo de artículo. Estas cifras no están verificadas por Hugging Face (`verified: false`) y corresponden al split propio del autor, no a un benchmark estándar de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV2 congelada (backbone, `include_top=False`, `pooling="avg"`, pesos ImageNet) + proyección PCA lineal 1280 -> 256 + búsqueda k-NN coseno exacta por fuerza bruta |
| Parametros totales | 2.257.984 (2,26 M) en el extractor; matriz PCA de 1280 x 256 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen RGB redimensionada a 224 x 224 píxeles |
| Tipos de cuantizacion | no disponible; los embeddings del índice se almacenan en float16 (`embeddings.npy`, 8.000 x 256) |
| Idiomas soportados | no disponible; la metadata del catálogo está en inglés |
| Licencia | MIT |
| Formato de pesos | Keras (`.keras`) para el backbone, `.npz` para la proyección PCA, `.npy` para los embeddings del índice, `.parquet` para el catálogo con metadatos y miniaturas JPEG |

Otros datos declarados: pipeline `image-feature-extraction`, librería `keras`, framework TensorFlow/Keras, tamaño del repositorio 0,0 GB, 0 descargas y 0 likes en el momento de la consulta, fecha de creación indicada como 2026-09-25.

## Arquitectura y entrenamiento

El sistema no entrena ninguna red neuronal. El extractor de características es MobileNetV2 (bloques residuales invertidos con convoluciones separables en profundidad) cargado con pesos de ImageNet y congelado; el preprocesado consiste en resize bilineal a 224 x 224 y normalización `x / 127.5 - 1` implementada como capa `Rescaling` dentro de `backbone.keras`. Cada imagen se convierte en un vector de 1280 dimensiones tras el global average pooling. Sobre esos vectores se ajusta una PCA sin etiquetas (fit sobre los embeddings del catálogo) que reduce a 256 dimensiones, y el resultado se normaliza en norma L2. La búsqueda es un k-NN coseno exacto (fuerza bruta, mismo ranking que `sklearn NearestNeighbors(metric="cosine")`) sobre los 8.000 productos indexados.

Los datos de entrenamiento son Fashion Product Images (Small), un conjunto de aproximadamente 44.000 fotos de producto de Myntra de 60 x 80 píxeles etiquetadas con categoría maestra, subcategoría y tipo de artículo. Se descartan las categorías maestras con menos de 20 productos y se hace un split estratificado que produce 8.000 productos de catálogo, 500 consultas de validación y 500 de test; las consultas nunca forman parte del catálogo. No hay fine-tuning, RLHF ni DPO. La comparación de variantes incluye píxeles crudos, histograma de color, MobileNetV2 sin reducción y MobileNetV2 con PCA (128 y 256 dimensiones), y se exporta la de mejor precisión@10 en tipo de artículo sobre validación. El embedding de las ~9.000 fotos tardó 767 s en una CPU de escritorio compartida y muy cargada (879 s el build completo); una ejecución anterior del mismo pipeline en una máquina ociosa tardó 256 s de principio a fin.

## Capacidades

- Extracción de características visuales de imágenes de moda y recuperación de los k productos más similares según similitud coseno.
- Clasificación implícita por categoría: recupera productos de la misma categoría maestra con alta precisión (0,978 P@1 en test).
- Discriminación entre 119 tipos de artículo del catálogo, con precisión@5 de 0,7284 en test.
- Devuelve, por cada coincidencia, id, nombre, categoría maestra, tipo de artículo, puntuación de similitud y miniatura.
- Acepta como entrada imágenes en formato PIL, ruta de fichero, bytes o base64.
- Despliegue como API: el `handler.py` acepta `{"inputs": "<imagen base64>", "parameters": {"k": 6}}` en un Inference Endpoint, y el Space expone `POST /gradio_api/call/predict` con `[imagen, k]`.
- Ejecución en CPU sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, texto, audio ni búsqueda texto-imagen.

## Casos de uso

- Búsqueda visual en tienda online: el usuario sube una foto de una prenda que ha visto y el sistema devuelve los productos más parecidos del catálogo; el índice de 8.000 vectores de 256 dimensiones permite respuesta en CPU sin infraestructura GPU.
- Recomendación de productos similares en la ficha de producto: a partir del embedding ya calculado de cada artículo se pueden obtener los vecinos más cercanos y poblar un carrusel de "artículos relacionados" con la misma categoría maestra (97,0 % de precisión@5 en test).
- Búsqueda de alternativas más baratas o "dupes": indexando el catálogo por embedding, una foto de una prenda concreta recupera variantes visualmente parecidas; al no depender de texto ni de SKU, funciona con fotos de redes sociales.
- Organización y deduplicación de catálogos: agrupar productos por similitud visual para detectar duplicados, variantes de color del mismo artículo o fichas mal categorizadas, usando las puntuaciones coseno como criterio de agrupamiento.
- Triaje y anotación asistida: preagrupar lotes de imágenes de proveedores para que un anotador humano valide categorías en lugar de etiquetar desde cero, aprovechando la alta precisión en categoría maestra.
- Verificación de fichas de proveedor: comprobar que la foto entregada por un proveedor corresponde al tipo de artículo declarado en el SKU, comparando el embedding de la imagen contra el del catálogo de referencia.
- Prototipos y demos educativas: el repositorio incluye notebook de Colab, código de entrenamiento completo y comparación de variantes, lo que lo hace apto como ejemplo reproducible de un pipeline de retrieval visual de principio a fin en CPU.
- Aplicación móvil o edge: con 2,26 M de parámetros, el extractor se puede ejecutar en dispositivo y consultar un índice local de embeddings de pocos megabytes sin conexión.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test (500 fotos retenidas) del dataset Fashion Product Images (Small). Ninguna métrica está verificada por Hugging Face (`verified: false`).

| Metrica | Valor | Split |
|---|---|---|
| p_at_1_master_category | 0,978 | test |
| p_at_5_master_category | 0,9704 | test |
| p_at_10_master_category | 0,9686 | test |
| p_at_1_article_type | 0,752 | test |
| p_at_5_article_type | 0,7284 | test |
| p_at_10_article_type | 0,7022 | test |

El autor indica que un ranking aleatorio obtendría un 5,4 % de precisión@5 en tipo de artículo (119 tipos en el catálogo). Comparación de variantes reportada en la model card (la tabla original está truncada en la información disponible; la fila de `pixels_32`, de 3.072 dimensiones, aparece incompleta):

| Variante | Dim | Val P@10 (article type) | Test P@5 (article type) | Test P@10 (article type) | Test P@5 (master cat.) | Test P@10 (master cat.) |
|---|---|---|---|---|---|---|
| mobilenetv2_pca256 (desplegada) | 256 | 0,7090 | 0,7284 | 0,7022 | 0,9704 | 0,9686 |
| mobilenetv2_pca128 | 128 | 0,7084 | 0,7252 | 0,7026 | 0,9720 | 0,9696 |
| mobilenetv2 | 1.280 | 0,7038 | 0,7264 | 0,7012 | 0,9680 | 0,9650 |
| pixels_32 | 3.072 | no disponible (fila truncada) | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Los pesos en float32 ocupan aproximadamente 8,6 MiB (2.257.984 parámetros) y el índice de 8.000 embeddings float16 unos 3,9 MiB. El sistema está pensado para ejecutarse en CPU.
- GPU recomendadas: ninguna en particular. Cualquier GPU con soporte TensorFlow acelera el embedding por lotes; el Space oficial funciona con `cpu-basic`.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en CPU de escritorio o en dispositivo. No requiere A100, H100 ni RTX 4090 para funcionar; usarlas solo reduciría el tiempo de indexado.
- Opciones de despliegue: Hugging Face Spaces (runtime `cpu-basic`, interfaz custom), Inference Endpoints usando el `handler.py` incluido, y uso local con `keras`/TensorFlow cargando el repositorio vía `snapshot_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: derivados de los tiempos de indexado publicados, aproximadamente 28 ms por imagen en una CPU ociosa (256 s para ~9.000 fotos) y 85 ms por imagen en una CPU de escritorio muy cargada (767 s). El coste por consulta añade la búsqueda coseno exacta sobre 8.000 vectores de 256 dimensiones, despreciable frente al embedding.

## Comparativa con modelos similares

No se dispone de una comparación directa sobre el mismo split, por lo que las cifras de otros sistemas no son equiparables a las de este modelo.

| Sistema | Enfoque | Parametros | Entrada | Metricas comparables | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| shalev396/fashion-image-search | MobileNetV2 congelado + PCA 256 + k-NN coseno exacto | 2,26 M | Imagen 224 x 224; solo imagen | P@5 tipo de artículo 0,7284 y P@1 categoría maestra 0,978 en su split de test propio | MIT | Hugging Face (modelo y Space) |
| Baseline `pixels_32` del mismo autor | Píxeles crudos + k-NN coseno | no aplica | Imagen | Fila truncada en la información disponible | MIT (mismo repositorio) | Repositorio del autor |
| FashionCLIP y variantes tipo CLIP ajustadas a moda | Modelo vision-language con entrenamiento sobre pares imagen-texto de moda | no disponible | Imagen y texto; permite retrieval multimodal | no disponible (no evaluadas en el mismo split) | no disponible | Hugging Face y GitHub de terceros |
| Buscadores comerciales de moda por foto (FetchFashion, FASHN, Fashion & Style AI, piax.org) | Productos cerrados, a menudo con varios modelos y catálogos propios | no disponible | Imagen y, en algunos casos, texto | no disponible | Propietaria | Servicios web |

La diferencia funcional relevante frente a los sistemas basados en CLIP es que este modelo no acepta consultas de texto: solo permite recuperación imagen a imagen.

## Limitaciones y advertencias

- No hay fine-tuning: el extractor es un MobileNetV2 genérico de ImageNet. La separabilidad entre tipos de artículo finos es limitada (0,752 de P@1 frente a 0,978 de P@1 en categoría maestra), lo que indica que distingue bien la categoría amplia pero confunde clases próximas.
- El índice está fijado a 8.000 productos de un único catálogo. Añadir o modificar artículos obliga a reindexar; la búsqueda es por fuerza bruta, con coste lineal en el número de productos.
- Resolución de entrada baja (224 x 224) y miniaturas de catálogo de 60 x 80 píxeles, lo que limita la discriminación de detalles finos como estampados, texturas o logotipos pequeños.
- No admite búsqueda texto-imagen ni consultas multimodales; solo imagen de entrada.
- Sesgo de dominio: está construido exclusivamente sobre fotos de producto de Myntra, con fondo neutro y encuadre comercial. Su comportamiento con fotos de calle, baja iluminación o personas vistiendo la prenda no está documentado.
- El sistema siempre devuelve los k vecinos más cercanos, aunque no exista una coincidencia real en el catálogo. No se documenta ningún umbral de similitud, por lo que puede producir falsos positivos con apariencia plausible.
- Las métricas son declaradas por el autor y no están verificadas por Hugging Face; el conjunto de test tiene solo 500 consultas.
- Licencia del modelo MIT, lo que permite uso comercial del código y los pesos. La licencia del dataset Fashion Product Images (Small) y de las imágenes del catálogo no se detalla en la información disponible y debe revisarse por separado antes de un uso comercial.
- Idiomas soportados no disponibles; la metadata del catálogo está en inglés y no hay soporte multilingüe documentado.
- Adopción mínima: 0 descargas y 0 likes, sin validación externa independiente. El tamaño de repositorio reportado es de 0,0 GB, por lo que conviene verificar que los artefactos (`backbone.keras`, `embeddings.npy`, `catalog.parquet`) están realmente presentes antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shalev396/fashion-image-search
- Space de demostración (API gratuita): https://huggingface.co/spaces/shalev396/fashion-image-search
- Código del proyecto en GitHub: https://github.com/shalev396/ml-lab/tree/main/fashion-image-search
- Código de entrenamiento: https://github.com/shalev396/ml-lab/tree/main/fashion-image-search/training
- Notebook de Colab: https://colab.research.google.com/github/shalev396/ml-lab/blob/main/fashion-image-search/training/notebook.ipynb
- Dataset Fashion Product Images (Small): https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-small
- Productos comerciales relacionados encontrados en la búsqueda web (no asociados al modelo): https://fashion-style-ai.vercel.app/, https://www.piax.org/en/ai-image-analyze-tools/ai-clothing-identifier, https://fetchfashion.ai/en/, https://fetchfashion.ai/en/ai-fashion-search/, https://fashn.ai/
