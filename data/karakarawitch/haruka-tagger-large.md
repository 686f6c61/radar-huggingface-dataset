# KaraKaraWitch/haruka-tagger-large

## Resumen

Haruka-Tagger-Large es un clasificador de imágenes multietiqueta especializado en ilustración anime, desarrollado por KaraKaraWitch. Se construye sobre el backbone EVA02-Large (`eva02_large_patch14_448.mim_m38m_ft_in22k_in1k`) de 304 millones de parámetros y añade una cabeza de clasificación jerárquica capaz de predecir simultáneamente entre 98.782 etiquetas nativas extraídas de Danbooru, organizadas en seis categorías (artista, personaje, general, copyright, año y rating).

El modelo resuelve un problema concreto del ecosistema de generación y catalogación de arte anime: la anotación automática de imágenes con vocabularios enormes y muy desbalanceados. Frente a los taggers convencionales, mantiene la arquitectura de atención "Slot-Sigmoid" de dos niveles con 18 queries (18 × 64 = 1.152 dimensiones de salida) que permite agrupar etiquetas relacionadas y aplicar sesgos de logit por etiqueta según su frecuencia de aparición.

Se distribuye en formato PyTorch (safetensors de 1,6 GB) y ONNX de tamaño equivalente, con licencia Apache 2.0 y un script de inferencia autocontenido que incluye visualización de mapas de calor espaciales por etiqueta. Es relevante para quienes necesitan etiquetado masivo de datasets anime, filtrado de contenido por rating o pipelines de captioning previos al entrenamiento de modelos de difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT EVA02-Large patch14 448 + cabeza MHAttnPool (atención de 18 queries, dos niveles) con clasificador sigmoide de 98.782 etiquetas |
| Parametros totales | 421 M (304 M backbone + cabeza y clasificador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen; entrada fija de 448 × 448 px) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos completos en safetensors y ONNX; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de Danbooru son mayoritariamente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,6 GB), ONNX (1,6 GB), JSON de metadatos (13 MB) |

## Arquitectura y entrenamiento

El backbone es un EVA02-Large con parches de 14×14 y resolución de entrada 448×448, preentrenado con MIM (masked image modeling) sobre M38M y ajustado posteriormente en ImageNet-22k e ImageNet-1k. Sobre las representaciones de 1.024 dimensiones y 24 bloques se monta una cabeza `MHAttnPool` que aplica atención multi-cabeza con 16 cabezas y 18 queries organizadas en dos niveles: 6 queries "coarse" y 3 ramas hijas por query, produciendo 18 × 64 = 1.152 dimensiones que alimentan el clasificador lineal de 98.782 salidas. El modo de pooling es "slot_sigmoid", con sesgos de logit iniciales por etiqueta (`idx_to_init_logit_bias`) e IRFS (`idx_to_irfs_factor`) para compensar el desbalance extremo del vocabulario.

El entrenamiento se realizó de extremo a extremo sobre 9,25 millones de imágenes de Danbooru y 98.782 etiquetas, con un F1 de validación reportado de 70,14 % (70,47 % en la evaluación sobre 1.000 subidas no vistas de 2026). El cómputo se ejecutó en un nodo de 8× H100 patrocinado por alpindale (dphn.ai). No se documentan en la información disponible detalles sobre composición exacta del dataset, uso de RLHF/DPO ni estrategias de aumento de datos más allá del preprocesado estándar descrito en el script de inferencia (composición alfa sobre blanco, letterbox BICUBIC a 448 y normalización ImageNet).

## Capacidades

- Clasificación multietiqueta de imágenes anime con 98.782 etiquetas nativas de Danbooru, repartidas en artista (38.447), personaje (31.471), general (21.748), copyright (7.091), año (21) y rating (4).
- Predicción de atributos de personaje y copyright con alta precisión (mAP 95,32 % y 85,63 % respectivamente en la evaluación publicada).
- Identificación de artista con mAP 92,96 % sobre el vocabulario nativo completo.
- Clasificación de rating de contenido (4 clases) con mAP 72,22 % y F1 macro 78,02 %.
- Detección de etiquetas generales con umbrales configurables por categoría (0,25 para artista, 0,35 para personaje/general/copyright, argmax para rating).
- Soporte de inferencia en PyTorch (timm + safetensors) y en ONNX Runtime con grafo exportado (`input: images (B, 3, 448, 448) -> output: logits (B, 98782)`).
- Visualización de atribución espacial por etiqueta mediante el script incluido `haruka_infer.py` (mapas de calor sobre la imagen de entrada).
- Inspección de la jerarquía de queries de dos niveles para depurar predicciones.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imagen.

## Casos de uso

- Etiquetado masivo de datasets anime: procesar lotes de imágenes con el grafo ONNX para generar captions y etiquetas estructuradas antes de entrenar modelos de difusión o LoRAs, aprovechando el vocabulario nativo de Danbooru y los umbrales por categoría.
- Filtrado de contenido por rating: usar la cabeza de rating (4 clases, argmax) para separar imágenes seguras de contenido sensible en pipelines de moderación o curaduría de datasets.
- Búsqueda y recuperación por personaje o copyright: indexar una colección con las predicciones de personaje (mAP 95,32 %) y copyright (mAP 85,63 %) para habilitar búsquedas por franquicia o personaje sin metadatos manuales.
- Atribución de autoría en galerías: emplear la categoría artista (38.447 clases, mAP 92,96 %) para agrupar obras por autor o detectar estilos recurrentes en un archivo.
- Análisis de tendencias temporales: utilizar la categoría año (21 clases) junto con las etiquetas generales para estudiar la evolución de estilos y tags en un corpus de imágenes.
- Preetiquetado asistido en herramientas de anotación: integrar el modelo vía ONNX en una interfaz de revisión humana, usando los mapas de calor espaciales del script incluido para que el anotador verifique qué región sustenta cada etiqueta.
- Control de calidad de datasets existentes: cruzar las etiquetas predichas con las originales para detectar imágenes mal etiquetadas o duplicadas en un repositorio Danbooru-like.

## Benchmarks y rendimiento

Evaluación publicada sobre 1.000 subidas no vistas de Danbooru de 2026 (`new-dan`), vocabulario nativo completo:

| Categoria | Etiquetas activas / total | mAP (AUPRC) | Micro-F1 | Macro-F1 por etiqueta | F1 mediano |
|---|---:|---:|---:|---:|---:|
| General | 4.143 / 21.748 | 59,33 % | 64,69 % | 61,52 % | 66,67 % |
| Character | 745 / 31.471 | 95,32 % | 87,96 % | 92,89 % | 100,00 % |
| Copyright | 295 / 7.091 | 85,63 % | 80,97 % | 84,98 % | 100,00 % |
| Artist | 221 / 38.447 | 92,96 % | 87,62 % | 87,26 % | 100,00 % |
| Rating | 4 / 4 | 72,22 % | 76,52 % | 78,02 % | 77,76 % |
| Subconjunto ancla 10k-core | 7.778 Gen / 2.649 Char | 62,72 % Gen / 99,02 % Char | 67,91 % Gen | 64,80 % Gen / 98,42 % Char | — |

Desglose de etiquetas generales por soporte de entrenamiento:

| Bucket | Etiquetas activas | mAP | Macro-F1 | F1 mediano |
|---|---:|---:|---:|---:|
| Head (≥ 10.000 imgs) | 2.142 | 59,04 % | 62,04 % | 66,67 % |
| Common (1.000–9.999 imgs) | 1.549 | 60,46 % | 62,61 % | 66,67 % |
| Uncommon (100–999 imgs) | 452 | 56,80 % | 55,34 % | 66,67 % |

No se han publicado resultados de benchmarks comparativos con otros taggers (MMLU, HumanEval, GSM8K no aplican a este modelo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,7 GB de pesos más activaciones; en FP16/BF16 se reduce a unos 0,9 GB de pesos.
- GPU recomendadas: cualquier GPU con ≥ 4 GB de VRAM para FP16 en lotes pequeños; A100, H100 o L40S para procesamiento por lotes de alto throughput.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en GPUs con 4–6 GB si se ejecuta en FP16 y lotes de 1.
- Despliegue: PyTorch con `timm` y `safetensors` (script `haruka_infer.py` incluido), o ONNX Runtime para el grafo exportado. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imagen).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Etiquetas | Licencia | Notas |
|---|---|---|---|---|---|
| Haruka-Tagger-Large | 421 M (304 M backbone) | 448 × 448 | 98.782 | Apache 2.0 | Este modelo; safetensors + ONNX |
| Haruka-Tagger (base) | 86 M backbone, 768-d | no disponible | 98.782 | no disponible | Versión pequeña del mismo autor, mismo vocabulario |
| WD Tagger (variantes) | no disponible | no disponible | vocabulario Danbooru | no disponible | Tagger de referencia de la comunidad; no se dispone de cifras comparativas en la información |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre Danbooru: su dominio es la ilustración anime y puede degradarse en fotografías, arte occidental u otros estilos.
- Las etiquetas generales tienen un rendimiento moderado (mAP 59,33 %, macro-F1 61,52 %); las etiquetas poco frecuentes (bucket Uncommon) bajan a mAP 56,80 % y macro-F1 55,34 %, por lo que conviene revisar predicciones de tags raros.
- Riesgo de falsos positivos y negativos en el vocabulario de 98.782 clases; los umbrales recomendados por categoría son un punto de partida, no una calibración universal.
- Sesgos inherentes al corpus Danbooru: sobrerrepresentación de ciertos personajes, franquicias y artistas populares, e infrarrepresentación de estilos minoritarios.
- La categoría rating puede verse afectada por ambigüedad en las anotaciones originales; el F1 mediano de 77,76 % indica margen de error apreciable.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías; verificar el cumplimiento de las políticas de la plataforma de origen de los datos (Danbooru) si se redistribuyen predicciones.
- No es un modelo generativo ni conversacional: no admite prompts de texto, tool calling ni razonamiento multi-paso.
- No se documentan cuantizaciones oficiales (GGUF, INT8); el despliegue en entornos con poca VRAM requiere exportación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaraKaraWitch/haruka-tagger-large
- Backbone base: https://huggingface.co/timm/eva02_large_patch14_448.mim_m38m_ft_in22k_in1k
- Perfil del patrocinador de cómputo: https://huggingface.co/alpindale
- Organización dphn.ai: https://dphn.ai/
- Repositorio Danbooru (origen del vocabulario): https://danbooru.donmai.us/
- Librería timm: https://github.com/huggingface/pytorch-image-models
- No se han encontrado papers, blogs o demos adicionales en la información disponible.
