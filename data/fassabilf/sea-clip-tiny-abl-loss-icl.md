# fassabilf/sea-clip-tiny-abl-loss-icl

## Resumen

SEA-CLIP-Tiny (ablation: CLIP + ICL) es un checkpoint derivado del modelo principal SEA-CLIP-Tiny, presentado en el artículo *SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages* (ACCV 2026). Se trata de un modelo de embeddings vision-lenguaje de tipo CLIP, con una torre de visión ViT-T/16 y una torre de texto de 12 capas y 384 dimensiones, que proyecta ambas modalidades a un espacio común de 512 dimensiones. Resuelve tareas de clasificación de imágenes zero-shot y recuperación cruzada texto-imagen en ocho idiomas, con especial atención a las lenguas del sudeste asiático.

Este checkpoint concreto es una de las filas de la tabla de ablación del artículo: mantiene la misma arquitectura, el mismo pipeline y los mismos hiperparámetros que el modelo principal, pero se ha entrenado únicamente con el objetivo de destilación contrastiva más aprendizaje contrastivo interactivo (CLIP + ICL), sin el resto de componentes de la receta completa. Por tanto, no es un modelo destinado a producción, sino una variante de control para aislar la contribución de cada pérdida al rendimiento final.

Su relevancia es doble. Por un lado, con solo 46,11 millones de parámetros y un repositorio de 0,2 GB, demuestra que es posible cubrir un espacio lingüístico habitualmente desatendido (indonesio, javanés, sundanés, malayo, tailandés, vietnamita y birmano) con un modelo muy compacto, destilado desde MetaCLIP2-ViT-B-16-worldwide sobre 12,72 millones de pares imagen-texto. Por otro, al publicarse junto al modelo principal y al código de entrenamiento, permite reproducir y auditar la ablación, algo poco habitual en modelos de esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP de doble torre: torre de visión ViT-T/16 + torre de texto de 12 capas y 384 dimensiones; dimensión de embedding 512 |
| Parametros totales | 46,11 M (5,62 M en la torre de visión + 40,49 M en la torre de texto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens en la torre de texto (tokenizador CLIP BPE, vocabulario de 49.408) |
| Tipos de cuantizacion | No disponible (la model card no documenta cuantizaciones; el repositorio ocupa 0,2 GB) |
| Idiomas soportados | Inglés (en), indonesio (id), javanés (jv), sundanés (su), malayo (ms), tailandés (th), vietnamita (vi), birmano (my) |
| Licencia | MIT |
| Formato de pesos | No especificado en la model card; se carga mediante `open_clip` desde el Hub de HuggingFace |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema CLIP clásico de dos torres con proyección a un espacio compartido de 512 dimensiones. La torre de visión es un ViT-T/16 (variante *tiny* con parches de 16x16) de 5,62 M de parámetros; la torre de texto es un transformer de 12 capas y anchura 384, con 40,49 M de parámetros, que emplea el tokenizador BPE de CLIP (vocabulario 49.408, contexto de 77 tokens). El total asciende a 46,11 M de parámetros, un orden de magnitud por debajo de los CLIP estándar de escala base.

El entrenamiento se realizó por destilación desde el profesor MetaCLIP2-ViT-B-16-worldwide sobre 12,72 millones de pares imagen-texto procedentes de cinco fuentes: CC12M, CulturalGround-OE-filt, WIT, Bloom y Mammoth-VL-SEA. La diferencia respecto al modelo principal reside exclusivamente en el objetivo de destilación: esta ablación usa solo la pérdida contrastiva junto con aprendizaje contrastivo interactivo (ICL), mientras que el modelo principal incorpora el resto de componentes de la receta. La model card no detalla el número total de tokens vistos, la composición exacta por fuente ni si hubo etapas de ajuste adicionales; la configuración exacta de este checkpoint se encuentra en el fichero `params.txt` del repositorio.

## Capacidades

- Clasificación de imágenes zero-shot: asignar una imagen a una etiqueta arbitraria definida en lenguaje natural, sin entrenamiento específico por tarea (`pipeline_tag`: zero-shot-image-classification).
- Recuperación texto-imagen e imagen-texto: cálculo de similitud en el espacio de embeddings de 512 dimensiones para búsqueda y ranking.
- Multilingüismo en ocho idiomas: consultas y etiquetas en inglés, indonesio, javanés, sundanés, malayo, tailandés, vietnamita y birmano, con foco en el sudeste asiático.
- Embeddings reutilizables: las representaciones pueden alimentar clasificadores lineales, sistemas de clustering, deduplicación o motores de recomendación.
- Soporte de tool calling / function calling: no aplica; es un modelo de embeddings, no generativo.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades especiales (thinking mode, visión generativa, audio): no disponible; el modelo solo produce embeddings de imagen y texto.

## Casos de uso

- Clasificación zero-shot en catálogos de comercio electrónico: definir las categorías de producto como prompts de texto en indonesio, malayo o tailandés y clasificar imágenes de listados sin reentrenar el modelo, aprovechando la cobertura de las siete lenguas del sudeste asiático.
- Búsqueda multimodal en bancos de imágenes: indexar los embeddings de imagen una sola vez y resolver consultas textuales en varios idiomas por similitud coseno, lo que permite una única base vectorial para usuarios que consultan en idiomas distintos.
- Curación y etiquetado automático de datasets: usar el modelo para preetiquetar grandes colecciones de imágenes con vocabularios definidos por texto y filtrar después manualmente solo los casos de baja confianza.
- Moderación y filtrado de contenido visual: construir listas de etiquetas textuales para categorías no deseadas y aplicar puntuaciones de similitud como primer filtro antes de una revisión humana, con la ventaja de poder adaptar las etiquetas sin reentrenar.
- Sistemas de recomendación visual: generar embeddings conjuntos de las imágenes del catálogo y de las descripciones o preferencias textuales del usuario para calcular similitud y ordenar candidatos.
- Deduplicación y clustering de imágenes: agrupar imágenes visual y semánticamente próximas en el espacio de 512 dimensiones para eliminar duplicados o descubrir temas en una fototeca, una tarea viable en CPU por el reducido tamaño del modelo.
- Investigación en visión-lenguaje multilingüe: servir como punto de comparación de ablaciones frente al modelo principal SEA-CLIP-Tiny para medir el efecto del objetivo de destilación, gracias a que el código de entrenamiento y la configuración están publicados.
- Prototipado en dispositivos con recursos limitados: con 46,11 M de parámetros, el modelo puede ejecutarse en CPU o en GPU de gama de entrada para demos y pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los de la model card. Incluyen recuperación R@1 en las particiones de validación de cada fuente de entrenamiento, exactitud zero-shot en ImageNet y el promedio de recuperación (R@1-Avg) sobre XM3600, Flickr30k-200 y XTD-200, expresados en porcentaje.

| Metrica | Valor |
|---|---|
| CG R@1 | 39,2 |
| WIT R@1 | 26,4 |
| Bloom R@1 | 15,3 |
| ImageNet (zero-shot) | 34,2 |
| R@1-Avg (XM3600 + Flickr30k-200 + XTD-200) | 12,2 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos, ni desglose por idioma, ni resultados del modelo principal con la misma métrica que permitan cuantificar el efecto de la ablación.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 46,11 M de parámetros, lo que equivale aproximadamente a 184 MB en fp32 y 92 MB en fp16, sin contar el preprocesado. Cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM asignados al proceso.
- GPU recomendadas: no se especifican en la documentación. Por tamaño, cualquier GPU moderna es suficiente, desde una GTX 1650 o una iGPU hasta una RTX 4090, A100 o H100; en estas dos últimas el modelo estará limitado por el preprocesado de imágenes y no por la computación.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual e incluso en muchos casos puede ejecutarse directamente en CPU.
- Opciones de despliegue: la vía documentada es `open_clip` con `create_model_and_transforms` y `get_tokenizer` apuntando al Hub de HuggingFace. No se documentan otras integraciones (vLLM, llama.cpp, Ollama o TGI no están indicadas y, al no ser un modelo generativo, no aplican del modo habitual).
- Latencia y throughput estimados: no disponibles; la model card no publica mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

La información disponible solo permite comparar con la variante principal del mismo trabajo y con el modelo profesor. El resto de comparaciones habituales en esta categoría (CLIP, SigLIP, OpenCLIP de escala base) no cuentan con datos en la documentación proporcionada.

| Modelo | Parametros | Contexto de texto | Idiomas | Licencia | Datos publicados |
|---|---|---|---|---|---|
| sea-clip-tiny-abl-loss-icl (este checkpoint) | 46,11 M | 77 tokens | en, id, jv, su, ms, th, vi, my | MIT | CG R@1 39,2; WIT R@1 26,4; Bloom R@1 15,3; ImageNet 34,2; R@1-Avg 12,2 |
| sea-clip-tiny (modelo principal) | No disponible (la model card indica misma arquitectura) | 77 tokens (misma arquitectura) | No disponible en la información disponible | No disponible | No disponible en la información disponible |
| MetaCLIP2-ViT-B-16-worldwide (profesor) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de resultados comparables de otros modelos de embeddings multilingües en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa más amplia.

## Limitaciones y advertencias

- Naturaleza de ablación: es una fila de la tabla de ablación del artículo, no el modelo recomendado para uso final. La model card lo indica explícitamente y remite al modelo principal para uso general.
- Sin tracción comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa ni informes de terceros sobre su comportamiento.
- Rendimiento bajo en varias métricas: el R@1-Avg de 12,2 % sobre XM3600, Flickr30k-200 y XTD-200 y el 15,3 % de R@1 en Bloom son valores modestos y deben tenerse en cuenta antes de plantear cualquier uso en producción.
- Cobertura idiomática limitada a ocho lenguas: no hay evidencia de comportamiento en otras lenguas, y la model card no detalla el reparto de datos por idioma ni el rendimiento desagregado.
- Contexto de texto corto: los 77 tokens del tokenizador CLIP limitan las descripciones y prompts a frases breves; no admite documentos largos como consulta.
- Riesgo de sesgo y de alucinación: al ser un modelo de embeddings no genera texto, pero puede heredar sesgos de representación de sus fuentes (CC12M, WIT, Bloom, entre otras) y de su profesor MetaCLIP2-ViT-B-16-worldwide. No se han publicado análisis de sesgo en la información disponible.
- Sin garantías de robustez: no se documentan evaluaciones frente a imágenes adversariales, dominios fuera de distribución ni contenido sensible.
- Licencia permisiva con excepciones no documentadas: el modelo se distribuye bajo MIT, lo que permite uso comercial, pero las condiciones de las fuentes de datos subyacentes no se detallan en la model card y conviene verificarlas antes de un despliegue comercial.
- Ausencia de especificación de formato: no se indica el formato exacto de los pesos ni se ofrecen cuantizaciones, lo que puede complicar integraciones fuera del ecosistema `open_clip`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fassabilf/sea-clip-tiny-abl-loss-icl
- Modelo principal SEA-CLIP-Tiny: https://huggingface.co/fassabilf/sea-clip-tiny
- Código de entrenamiento y evaluación: https://github.com/fassabilf/sea-clip-tiny
- Citación del artículo (ACCV 2026): *SEA-CLIP-Tiny: Efficient Multilingual Text-Vision Embedding for Southeast Asian Languages*, Asian Conference on Computer Vision (ACCV), 2026.
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo (contenido no relevante sobre videojuegos, gestores de descargas y herramientas de IA sin conexión con SEA-CLIP), por lo que no se incluye ningún enlace adicional.
