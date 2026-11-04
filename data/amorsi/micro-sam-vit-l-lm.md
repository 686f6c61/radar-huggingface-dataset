# amorsi/micro-sam-vit-l-lm

## Resumen

`amorsi/micro-sam-vit-l-lm` es un espejo (mirror) no modificado de un checkpoint preentrenado del proyecto micro-sam, desarrollado por el grupo Computational Cell Analytics. micro-sam es un framework de segmentación de imágenes de microscopía basado en la arquitectura Segment Anything Model (SAM), adaptada al dominio de la biología celular. Este checkpoint concreto corresponde a la variante `vit_l_lm`, es decir, un encoder ViT-Large con un decoder específico afinado para segmentación de imágenes de microscopía de luz (light microscopy, de ahí el sufijo `lm`).

El modelo no es un modelo de lenguaje ni un modelo generativo de texto: es un modelo de segmentación de imágenes (pipeline `image-segmentation`). Su relevancia radica en que permite segmentar estructuras celulares y tejidos en imágenes de microscopía con un solo clic o con prompts de puntos/cajas, sin necesidad de reentrenar. El repositorio es únicamente una copia de los pesos originales publicados por micro-sam, con hashes xxh128 verificados contra el registro oficial del proyecto.

El tamaño del repositorio es de 1,3 GB, coherente con un encoder ViT-L (unos 300 millones de parámetros) más el decoder. La información disponible sobre el modelo es muy limitada: no se publican especificaciones detalladas, benchmarks ni condiciones de licencia en la model card del espejo, por lo que muchos campos de esta ficha se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Segment Anything Model (SAM) con encoder ViT-Large y decoder de segmentación (variante `vit_l_lm` de micro-sam) |
| Parámetros totales | no disponible (ViT-L, del orden de cientos de millones; cifra exacta no publicada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de imagen no especificada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible en la model card del espejo; la model card remite a los términos de licencia de los pesos originales de micro-sam |
| Formato de pesos | PyTorch (`model.pt` y `decoder.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SAM: un encoder de imagen tipo Vision Transformer (ViT-Large) que genera embeddings de la imagen, y un decoder ligero que, a partir de prompts (puntos, cajas o máscaras), produce máscaras de segmentación. En micro-sam, el decoder se adapta específicamente al dominio de microscopía, y el sufijo `lm` indica que está orientado a imágenes de microscopía de luz. El checkpoint se distribuye en dos ficheros: `model.pt` (encoder) y `decoder.pt` (decoder), y se carga en micro-sam indicando `model_type="vit_l_lm"`.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre si se emplearon técnicas de refinamiento como RLHF o DPO (no aplicables en un modelo de segmentación). La model card del espejo indica explícitamente que es una copia sin modificar de los pesos originales publicados por micro-sam, y que los hashes xxh128 coinciden con el registro de `util.py` del repositorio oficial. Para detalles de entrenamiento y composición del dataset, hay que consultar la documentación y el paper de micro-sam.

## Capacidades

- Segmentación de imágenes de microscopía de luz mediante prompts de puntos, cajas o máscaras.
- Segmentación interactiva: el usuario proporciona indicaciones y el modelo refina la máscara.
- Segmentación automática de estructuras celulares y tejidos (modo "everything" de SAM, según la implementación de micro-sam).
- Integración con el framework micro-sam para flujos de anotación y análisis de imágenes biológicas.
- No es un modelo de lenguaje: no genera texto, no hace razonamiento simbólico ni tool calling.
- No soporta agentes, multi-step reasoning ni capacidades multilingües.
- No dispone de modo "thinking", visión general (solo microscopía), audio ni otras modalidades.

## Casos de uso

- Anotación asistida de imágenes de microscopía: el modelo permite generar máscaras de células y orgánulos a partir de unos pocos clics, lo que acelera la creación de datasets de entrenamiento en laboratorios de biología celular.
- Segmentación automática de tejidos en pipelines de análisis de imagen: se puede invocar desde micro-sam para procesar lotes de imágenes y obtener máscaras listas para cuantificación morfológica.
- Análisis de experimentos de imagen de células vivas: la segmentación interactiva permite aislar células individuales en series temporales y medir áreas, formas o intensidades.
- Control de calidad en flujos de microscopía de alto contenido: el modelo puede presegmentar imágenes para detectar regiones de interés antes de un análisis más costoso.
- Docencia y formación en bioimage analysis: al ser un checkpoint pequeño (1,3 GB) y fácil de cargar en micro-sam, sirve para demostrar flujos de segmentación con SAM en imágenes reales de microscopía.
- Investigación reproducible: al ser un espejo con hashes verificados, permite reproducir resultados de micro-sam en entornos donde el acceso a los servidores originales de EBI no esté disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del checkpoint (1,3 GB en FP32 para encoder y decoder), se estima un consumo moderado, pero no se han publicado cifras oficiales.
- GPU recomendadas: no disponible; al tratarse de un ViT-L, es razonable esperar que funcione en GPUs de gama media-alta, pero no hay datos confirmados.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: el uso previsto es a través del framework micro-sam (`model_type="vit_l_lm"`); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| micro-sam `vit_l_lm` (este) | SAM ViT-L + decoder | no disponible | no aplica | no disponible (remite al original) | HuggingFace (espejo) |
| micro-sam `vit_b_lm` | SAM ViT-B + decoder | no disponible | no aplica | no disponible (remite al original) | Repositorio micro-sam |
| SAM original (ViT-L) | SAM ViT-L | ~300 M (referencia general) | no aplica | Apache 2.0 (SAM original) | Meta / HuggingFace |

La comparativa se limita a variantes de la misma familia porque no se dispone de datos de rendimiento publicados para este checkpoint concreto. Las cifras de SAM original se incluyen solo como referencia arquitectónica general y no deben interpretarse como equivalentes a este checkpoint.

## Limitaciones y advertencias

- La model card del espejo no especifica la licencia de los pesos; el autor remite a los términos del proyecto original micro-sam. Verificar antes de uso comercial.
- Es un espejo no modificado: cualquier actualización o corrección debe buscarse en el repositorio original de micro-sam, no en este repo.
- Modelo especializado en microscopía de luz; su rendimiento fuera de ese dominio (fotografía natural, imágenes médicas de otra modalidad) no está garantizado.
- No es un modelo de lenguaje: no admite prompts textuales ni generación de texto.
- Riesgo de segmentaciones incorrectas en imágenes con poco contraste, ruido o estructuras solapadas; se recomienda validación humana en flujos críticos.
- No se han publicado métricas de sesgo, robustez ni evaluación cuantitativa en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un espejo reciente y sin validación comunitaria independiente.
- Para producción, conviene fijar la versión del checkpoint y verificar los hashes xxh128 contra el registro oficial de micro-sam.

## Enlaces

- HuggingFace: https://huggingface.co/amorsi/micro-sam-vit-l-lm
- Repositorio micro-sam: https://github.com/computational-cell-analytics/micro-sam
- Registro de hashes en `util.py`: https://github.com/computational-cell-analytics/micro-sam/blob/master/micro_sam/util.py
- Pesos originales `model.pt`: https://uk1s3.embassy.ebi.ac.uk/public-datasets/bioimage.io/idealistic-rat/1.2/files/vit_l.pt
- Pesos originales `decoder.pt`: https://uk1s3.embassy.ebi.ac.uk/public-datasets/bioimage.io/idealistic-rat/1.2/files/vit_l_decoder.pt
