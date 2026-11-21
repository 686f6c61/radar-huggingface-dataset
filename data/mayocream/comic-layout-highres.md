# mayocream/comic-layout-highres

## Resumen

Koharu Layout HighRes es un modelo de segmentación de instancias y detección de objetos especializado en el análisis de maquetación (layout analysis) de páginas de manga. Lo desarrolla Mayo Takanashi (usuario `mayocream`) como componente del proyecto Koharu, una herramienta de código abierto para el procesamiento de cómics japoneses. El modelo resuelve un problema muy concreto: localizar y segmentar las regiones fundamentales de una página de manga (texto, onomatopeyas, bocadillos y viñetas) para que puedan procesarse después en flujos de traducción, limpieza o reedición.

Técnicamente es un RF-DETR Seg 2XL, es decir, un detector transformer basado en la familia DETR (DEtection TRansformer) afinado para segmentación de instancias, con 46.596.271 parámetros y un peso de repositorio de aproximadamente 0,2 GB. Sucesor del modelo `koharu-layout-rfdetr-seg-2xl-1152`, mejora de forma notable la detección de texto y efectos de sonido gracias a un entrenamiento en dos etapas con resolución de entrada creciente.

Es relevante ahora porque el análisis de maquetación es el primer paso obligatorio en cualquier pipeline de traducción automática de manga: sin una detección fiable de bocadillos, texto y onomatopeyas, ni el OCR ni la reconstrucción de la imagen funcionan bien. El modelo se publica con licencia Apache 2.0, lo que facilita su integración en productos comerciales, y está entrenado específicamente sobre el corpus japonés Manga109.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RF-DETR Seg 2XL (detector transformer DETR con cabeza de segmentación de instancias) |
| Parámetros totales | 46.596.271 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japonés (`ja`); el modelo procesa imágenes, no texto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` |

## Arquitectura y entrenamiento

El modelo parte de RF-DETR Seg 2XL, un detector de la familia DETR que combina un backbone de extracción de características con un decoder transformer que predice conjuntos de cajas y máscaras de instancia de forma directa, sin necesidad de anclas ni de supresión no máxima clásica. La cabeza de segmentación añade predicciones de máscara por instancia, de modo que el modelo devuelve simultáneamente cajas delimitadoras y máscaras para cuatro clases: `text` (diálogo, rótulos y títulos que no son efectos), `onomatopoeia` (efectos de sonido), `bubble` (bocadillos) y `panel` (viñetas).

El entrenamiento se realizó por ajuste fino a partir del modelo `koharu-layout-rfdetr-seg-2xl-1152`, en dos etapas con resolución de entrada creciente, sobre el dataset `mayocream/manga109-segmentation` v3.0.0. Las imágenes de entrenamiento proceden de la release de Manga109 y no se redistribuyen con el modelo. El cómputo empleado fueron 4 GPU NVIDIA H200. No se documentan en la información disponible detalles sobre composición exacta del dataset, número de tokens (no aplica) ni uso de RLHF/DPO, que tampoco procede en un modelo de visión.

## Capacidades

- Detección de objetos y segmentación de instancias en páginas de manga, con cuatro clases: texto, onomatopeyas, bocadillos y viñetas.
- Predicción conjunta de cajas delimitadoras (box AP) y máscaras por instancia (mask AP).
- Manejo tanto de páginas individuales como de dobles páginas (spreads).
- Funcionamiento a resolución de página completa, con capacidad de hasta 160 detecciones por imagen.
- Especialización en manga japonés, incluido texto vertical dentro de bocadillos.
- No realiza OCR ni determina el orden de lectura; es exclusivamente un modelo de maquetación.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de lenguaje: es un modelo puramente visual.

## Casos de uso

- Pipeline de traducción automática de manga: el modelo actúa como primer eslabón detectando bocadillos y regiones de texto, que después se recortan y se envían a un motor de OCR y a un traductor. La alta precisión en la caja de texto (0,852 en test) reduce los recortes fallidos.
- Limpieza y reedición de páginas (redrawing): las máscaras de texto y onomatopeyas permiten enmascarar las regiones a borrar y reconstruir el fondo antes de rotular la traducción.
- Maquetación y reflow de cómics: la detección de viñetas (`panel`) con AP en torno a 0,92–0,95 permite segmentar la página en viñetas para reordenarlas, recortarlas o adaptarlas a formato vertical para lectura en móvil.
- Indexación y archivado de colecciones: procesar lotes de páginas para extraer metadatos estructurales (número de viñetas, presencia de texto, efectos) y construir índices o sistemas de búsqueda sobre bibliotecas de manga.
- Herramientas de asistencia a traductores y editores: integrado en Koharu, el modelo preanota las regiones de una página para que el operador humano solo revise y corrija, acelerando el trabajo editorial.
- Control de calidad y preprocesado en datasets: filtrar o clasificar páginas según su estructura, o generar anotaciones preliminares que se validen manualmente antes de entrenar otros modelos.
- Análisis académico de corpus de manga: cuantificar la densidad de texto, la proporción de efectos de sonido o la distribución de viñetas en un corpus para estudios de estilo o de evolución gráfica.

## Benchmarks y rendimiento

Resultados de COCO AP 50:95 frente a `manga109-segmentation` v3.0.0 a resolución de página, con hasta 160 detecciones por imagen, comparando con el modelo predecesor `koharu-layout-rfdetr-seg-2xl-1152`.

Split de test (1.908 páginas individuales y 969 dobles páginas):

| Vista | Modelo | Box AP | Mask AP | Text box | SFX box | Text mask | SFX mask |
|---|---|---:|---:|---:|---:|---:|---:|
| Páginas | 1152 | 0,653 | 0,631 | 0,502 | 0,226 | 0,348 | 0,277 |
| Páginas | **este modelo** | **0,824** | **0,701** | **0,852** | **0,556** | **0,536** | **0,365** |
| Spreads | 1152 | 0,649 | 0,590 | 0,509 | 0,236 | 0,265 | 0,219 |
| Spreads | **este modelo** | **0,803** | **0,660** | **0,840** | **0,511** | **0,443** | **0,313** |

Split de validación (1.964 páginas y 1.001 spreads):

| Vista | Modelo | Box AP | Mask AP | SFX box | Text mask | SFX mask |
|---|---|---:|---:|---:|---:|---:|
| Páginas | 1152 | 0,669 | 0,626 | 0,220 | 0,354 | 0,227 |
| Páginas | **este modelo** | **0,814** | **0,691** | **0,496** | **0,542** | **0,294** |
| Spreads | 1152 | 0,659 | 0,584 | 0,206 | 0,267 | 0,174 |
| Spreads | **este modelo** | **0,790** | **0,651** | **0,437** | **0,447** | **0,250** |

Según la model card, el AP de bocadillos y viñetas es aproximadamente el mismo en ambos modelos: caja 0,92–0,95 y máscara 0,92–0,97. La mejora se concentra en texto y efectos de sonido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 46,6 millones de parámetros y pesos en fp32 el modelo ocupa del orden de 0,2 GB, por lo que la VRAM necesaria es modesta y el cuello de botella es la resolución de entrada (páginas completas), no el tamaño del modelo.
- GPU recomendadas: cualquier GPU con suficiente memoria para procesar imágenes a resolución de página; el entrenamiento se hizo en 4 × NVIDIA H200, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, con alta probabilidad en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, dado el reducido tamaño del modelo; la viabilidad exacta depende de la resolución de entrada y del tamaño de lote.
- Opciones de despliegue: la librería indicada es `rfdetr`; no se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Box AP (test, páginas) | Mask AP (test, páginas) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| **comic-layout-highres** (este) | 46,6 M | Detección + segmentación de layout de manga | 0,824 | 0,701 | Apache 2.0 | Hugging Face |
| koharu-layout-rfdetr-seg-2xl-1152 | no disponible | Detección + segmentación de layout de manga | 0,653 | 0,631 | no disponible en la información | Hugging Face |
| Otros modelos de layout de manga | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa documentada es con su predecesor, sobre el que mejora 17,1 puntos de Box AP y 7,0 puntos de Mask AP en páginas del split de test, con un salto especialmente marcado en detección de texto (de 0,502 a 0,852). No se dispone de datos de benchmarks frente a alternativas de otros autores.

## Limitaciones y advertencias

- Líneas cortas dentro de bocadillos (por ejemplo «!», «で?» o una sola palabra) a veces se clasifican como onomatopeya en lugar de texto; las etiquetas de entrenamiento incluyen efectos dentro de bocadillos, por lo que el límite es difuso.
- La misma rotulación puede detectarse dos veces: como texto y como onomatopeya, o como fragmentos anidados dentro de un efecto mayor.
- Las etiquetas de nombre de personaje y rótulos similares de webcómics en color se pierden en la mayoría de los casos, porque Manga109 no contiene ese tipo de elementos.
- Números de página, encabezados y líneas de copyright pueden detectarse como texto.
- En cómics en color, decoraciones como destellos, gotas de sudor o corazones pueden detectarse como onomatopeyas.
- Entrenado solo con manga japonés: otros estilos de cómic y otros sistemas de escritura pueden comportarse de forma distinta.
- No realiza OCR ni orden de lectura; debe combinarse con otros componentes para un pipeline completo.
- Licencia Apache 2.0 permisiva para uso comercial; el aviso de RF-DETR (también Apache 2.0) se incluye en `NOTICE`. Las imágenes de Manga109 no se redistribuyen y siguen sujetas a sus propios términos.
- Integridad de pesos verificable mediante SHA-256 de `model.safetensors`: `03de2f77281974f5084cdd8652ace2b55dc15ac0378aed66654e62537cdda255`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mayocream/comic-layout-highres
- Modelo predecesor: https://huggingface.co/mayocream/koharu-layout-rfdetr-seg-2xl-1152
- Dataset de entrenamiento: https://huggingface.co/datasets/mayocream/manga109-segmentation
- Proyecto Koharu: https://github.com/koharu-rs/koharu
