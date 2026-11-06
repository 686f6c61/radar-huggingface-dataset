# anonimkaq4/manga-page-element-segmentation

## Resumen

El modelo `anonimkaq4/manga-page-element-segmentation` es un modelo de segmentación de instancias basado en YOLO11m, especializado en el análisis de páginas de manga. Lo desarrolla el usuario anonimkaq4 y resuelve un problema concreto dentro del procesamiento automatizado de cómics japoneses: identificar y separar los tres elementos estructurales básicos de una página, que son los personajes (`character`), las viñetas o paneles (`frame`) y los bocadillos de diálogo (`speech_bubble`). Cada detección devuelve máscara de instancia, caja delimitadora, etiqueta de clase y puntuación de confianza.

La relevancia del modelo está en su aplicación directa en pipelines de digitalización, traducción automática y análisis de cómics: la segmentación de paneles permite establecer el orden de lectura, la detección de bocadillos aísla las regiones que deben pasar por OCR y la detección de personajes habilita recortes y análisis de composición. Se distribuye como pesos en formato safetensors acompañados de los ficheros YAML de arquitectura YOLO11m/YOLO11s, y se carga a través de la librería Ultralytics.

El checkpoint recomendado se entrenó sobre un conjunto sintético combinado con anotaciones MangaSeg derivadas de Manga109-s, y reporta un Mask mAP50 de 0,8689 y un Mask mAP50-95 de 0,6620 sobre 784 páginas reservadas. El repositorio ocupa 0,5 GB y acumula 878 descargas en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m (Ultralytics), segmentación de instancias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen; evaluación a 1024 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | other (sujeta a las licencias de MangaSeg, Manga109-s y Ultralytics) |
| Formato de pesos | safetensors (pesos) + YAML de arquitectura YOLO11m/YOLO11s |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11m de Ultralytics en su variante de segmentación (`yolo11m-seg`), una red de detección y segmentación de instancias de una sola etapa que predice simultáneamente cajas, máscaras y clases. Los ficheros safetensors contienen únicamente los pesos; la topología se describe en los YAML `yolo11m-seg.yaml` y `yolo11s-seg.yaml`, y los nombres de clase se almacenan en los metadatos del safetensors. La inferencia se realiza con la librería Ultralytics, cargando el estado del modelo con `load_state_dict` y asignando `model.model.names` desde los metadatos.

El entrenamiento combina un dataset sintético de páginas de manga segmentadas (`anonimkaq4/synthetic-manga-page-segmentation-sharded`) con anotaciones MangaSeg derivadas de Manga109-s y el dataset `MS92/MangaSegmentation`. El checkpoint recomendado corresponde al epoch 33 del entrenamiento sobre el conjunto sintético MangaSeg, a resolución de 1024 px. Se publican además dos snapshots previos (YOLO11m en epoch 15 y YOLO11s en epoch 18) para comparación. No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de aumento o refinamiento posteriores.

## Capacidades

- Segmentación de instancias con tres clases: `character` (id 0), `frame` (id 1) y `speech_bubble` (id 2).
- Predicción por objeto de máscara, caja delimitadora, etiqueta y confianza.
- Detección de paneles con máscara que sigue el área o borde visible de la viñeta.
- Detección de bocadillos de diálogo para su posterior envío a OCR o exclusión del procesamiento de ilustración.
- Detección de personajes visibles para recorte, análisis de composición o edición consciente del personaje.
- Procesamiento de imágenes a 1024 px de resolución de entrada.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural: es un modelo puramente visual.

## Casos de uso

- Segmentación de paneles para orden de lectura: el modelo genera una máscara y caja por viñeta, lo que permite ordenar los paneles de una página y alimentar sistemas de lectura o traducción panel a panel.
- OCR de diálogo: la clase `speech_bubble` aísla las regiones de texto con un Mask mAP50 de 0,9908, de modo que el OCR solo procesa esas zonas y se evita leer texto fuera de los bocadillos.
- Traducción automática de manga: combinando la detección de bocadillos con OCR y traducción, el pipeline puede localizar el texto, transcribirlo, traducirlo y recolocarlo en la misma región.
- Recorte y catalogación de personajes: la clase `character` permite extraer recortes de personajes para construir bases de datos, análisis de aparición o sistemas de búsqueda visual.
- Limpieza y restauración de ilustraciones: al detectar y excluir bocadillos y marcos, las herramientas de restauración o coloreado pueden operar solo sobre el arte del personaje.
- Análisis estructural de cómics a escala: el modelo permite procesar lotes de páginas para extraer estadísticas de densidad de paneles, proporción de diálogo o composición, útil en investigación sobre cómics y humanidades digitales.
- Preprocesado para modelos generativos: las máscaras de personaje y panel sirven como condicionamiento para tareas de inpainting, recoloreado o generación de páginas.

## Benchmarks y rendimiento

Resultados del checkpoint recomendado (`snapshots/yolo11m_1024_synthetic_mangaseg/best.safetensors`), evaluado a 1024 px sobre 784 páginas reservadas de MangaSeg/Manga109-s:

| Checkpoint | Modelo base | Epoch | Mask mAP50 | Mask mAP50-95 |
|---|---|---:|---:|---:|
| `yolo11m_1024_synthetic_mangaseg/best` | `yolo11m-seg.pt` | 33 | 0,8689 | 0,6620 |
| `yolo11m_1024_b2/manga-yolo11m-seg-validation-best` | `yolo11m-seg.pt` | 15 | 0,8742 | 0,6078 |
| `yolo11s_1024_b8/manga-yolo11s-seg-validation-best` | `yolo11s-seg.pt` | 18 | 0,8649 | 0,5895 |

Desglose por clase del checkpoint recomendado:

| Clase | Mask mAP50 | Mask mAP50-95 |
|---|---:|---:|
| `character` | 0,7731 | 0,5829 |
| `frame` | 0,8427 | 0,5164 |
| `speech_bubble` | 0,9908 | 0,8867 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al ser un YOLO11m de segmentación, el consumo es moderado y depende del tamaño de lote y de la resolución de entrada (1024 px en la evaluación publicada).
- GPU recomendadas: no se especifican en la información disponible. Por la familia del modelo, es esperable que funcione en GPU de consumo, pero no se confirma con datos del autor.
- Compatibilidad con GPU de consumo: no confirmada explícitamente en la información disponible.
- Opciones de despliegue: la vía documentada es Ultralytics con `huggingface_hub` y `safetensors`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de segmentación de manga en la información disponible. Los únicos puntos de comparación internos son los tres checkpoints del propio repositorio (YOLO11m epoch 33, YOLO11m epoch 15 y YOLO11s epoch 18), cuyos resultados se recogen en la tabla de benchmarks.

## Limitaciones y advertencias

- Licencia `other`: el uso comercial está condicionado por las licencias de MangaSeg, Manga109-s y Ultralytics; es necesario revisarlas antes de usar el modelo, publicar resultados derivados o redistribuir el checkpoint.
- El repositorio no incluye ni concede derechos sobre las imágenes originales de Manga109-s ni sobre las anotaciones MangaSeg.
- Si se usan imágenes de MangaSeg o resultados visuales derivados, debe incluirse el crédito "Copyrighted by Minshan Xie".
- El rendimiento por clase es desigual: los bocadillos son muy fiables (Mask mAP50 de 0,9908), mientras que la clase `frame` presenta un Mask mAP50-95 de 0,5164 y los personajes de 0,5829, lo que indica menor precisión en la delimitación fina de paneles y personajes.
- El modelo se entrenó con datos sintéticos y anotaciones MangaSeg; no se documenta su comportamiento en estilos de cómic no japoneses, páginas a color o resoluciones distintas de 1024 px.
- No se han publicado análisis de sesgos, tasas de alucinación (no aplicable en sentido estricto a un modelo de segmentación) ni evaluaciones fuera del dominio de Manga109-s.
- No hay datos sobre cuantización ni sobre despliegue en entornos de bajos recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonimkaq4/manga-page-element-segmentation
- Dataset sintético de entrenamiento: https://huggingface.co/datasets/anonimkaq4/synthetic-manga-page-segmentation-sharded
- Dataset Manga109-s: https://huggingface.co/datasets/hal-utokyo/Manga109-s
- Dataset MangaSegmentation: https://huggingface.co/datasets/MS92/MangaSegmentation
- Paper MangaSeg (Xie et al., CVPR 2025): "Advancing Manga Analysis: Comprehensive Segmentation Annotations for the Manga109 Dataset"
- Paper Manga109 (Aizawa et al., IEEE MultiMedia 2020), DOI: 10.1109/MMUL.2020.2987895
- Librería Ultralytics: https://github.com/ultralytics/ultralytics
