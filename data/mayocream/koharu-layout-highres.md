# mayocream/koharu-layout-highres

## Resumen

Koharu Layout HighRes es un modelo de segmentación de instancias basado en RF-DETR Seg 2XL, desarrollado por el usuario mayocream, especializado en el análisis de maquetación de páginas de manga. Predice cajas delimitadoras y máscaras de instancia para cuatro clases: texto, onomatopeyas, bocadillos y viñetas. El modelo sustituye a la versión anterior `koharu-layout-rfdetr-seg-2xl-1152`, pero no es un reemplazo directo, ya que requiere un preprocesamiento de entrada distinto y emplea embeddings posicionales de mayor tamaño.

Con 46,6 millones de parámetros y un pipeline de segmentación de imágenes, el modelo está diseñado para trabajar sobre páginas redimensionadas a un lienzo de 1920 × 1920 píxeles mediante letterboxing, preservando la relación de aspecto original. Está entrenado sobre el dataset manga109-segmentation v3.0.0 y está orientado exclusivamente al idioma japonés.

La relevancia de este modelo radica en su especialización: no realiza OCR ni determina el orden de lectura, sino que se limita a la detección y segmentación de regiones de maquetación, lo que lo convierte en una pieza útil dentro de pipelines más amplios de traducción o digitalización de manga. Su licencia es de todos los derechos reservados, lo que restringe su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RF-DETR Seg 2XL (transformer detector con segmentación de instancias) |
| Parámetros totales | 46.596.271 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 1920 × 1920) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | japonés (ja) |
| Licencia | all-rights-reserved (otros) |
| Formato de pesos | safetensors (float32, pesos EMA) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RF-DETR Seg 2XL, un detector transformer con capacidad de segmentación de instancias. Trabaja sobre imágenes redimensionadas a un lienzo de 1920 × 1920 píxeles, con la página colocada en la esquina superior izquierda y el resto rellenado en blanco, preservando la relación de aspecto original. La salida incluye cajas delimitadoras y máscaras de instancia para cuatro clases, con hasta 160 detecciones por imagen y un quinto logit correspondiente a la clase "sin clase".

El entrenamiento se realizó sobre el dataset manga109-segmentation v3.0.0. Las cajas de texto provienen de Manga109 v2026. El modelo incluye pesos EMA (media móvil exponencial) en float32. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas de RLHF o DPO, dado que se trata de un modelo de visión y no de lenguaje. La innovación técnica principal es el uso de embeddings posicionales de mayor tamaño y un preprocesamiento de entrada específico que preserva la relación de aspecto, a diferencia del modelo anterior que estiraba las páginas a un cuadrado.

## Capacidades

- Detección de objetos y segmentación de instancias en páginas de manga.
- Predicción de cajas delimitadoras y máscaras para cuatro clases: texto, onomatopeyas, bocadillos y viñetas.
- Análisis de maquetación de páginas de manga con preservación de la relación de aspecto.
- Manejo de páginas individuales y spreads (páginas dobles).
- Procesamiento de hasta 160 detecciones por imagen.
- No realiza OCR ni determina el orden de lectura.
- No soporta tool calling ni function calling (es un modelo de visión).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al japonés en el dominio del manga.

## Casos de uso

- Digitalización y catalogación de manga: el modelo permite segmentar automáticamente páginas en viñetas, bocadillos, texto y onomatopeyas, facilitando la indexación y el archivo de colecciones. Su capacidad para procesar páginas a 1920 px y detectar hasta 160 instancias lo hace adecuado para lotes de páginas individuales y spreads.

- Preprocesamiento para pipelines de traducción automática: al aislar regiones de texto y bocadillos, el modelo sirve como paso previo para sistemas de OCR y traducción, permitiendo que los motores de traducción trabajen solo sobre las áreas relevantes y reduciendo el ruido.

- Extracción de bocadillos para reemplazo de texto: las máscaras de instancia de la clase "bubble" permiten recortar y reemplazar bocadillos en flujos de edición automatizada, con una precisión y exhaustividad reportadas de 0,975 en validación.

- Detección de onomatopeyas para efectos visuales: la clase "onomatopoeia" permite localizar efectos de sonido, útiles para tareas de restauración, limpieza o recreación de páginas en proyectos de escaneo y remasterización.

- Análisis de maquetación para investigación: el modelo proporciona una base cuantitativa para estudiar la estructura de páginas de manga, con métricas de AP publicadas sobre los splits de test y validación del dataset Manga109.

- Segmentación de viñetas para reflow o adaptación: la clase "panel" permite extraer viñetas individuales, lo que facilita la reorganización de páginas para formatos adaptados a dispositivos móviles o lectores digitales.

- Control de calidad en escaneos: la detección de texto y regiones puede emplearse para verificar que las páginas escaneadas contienen las áreas esperadas, ayudando a detectar páginas corruptas o mal escaneadas en procesos de digitalización masiva.

## Benchmarks y rendimiento

Los resultados se miden con COCO AP 50:95 contra manga109-segmentation v3.0.0 a resolución de página, con hasta 160 detecciones por imagen.

**Split de test** (1.908 páginas individuales y 969 spreads):

| Vista | Modelo | Box AP | Mask AP | Text box | SFX box | Text mask | SFX mask |
|---|---|---|---|---|---|---|---|
| Páginas | 1152 model | 0.653 | 0.631 | 0.502 | 0.226 | 0.348 | 0.277 |
| Páginas | este modelo | 0.824 | 0.701 | 0.852 | 0.556 | 0.536 | 0.365 |
| Spreads | 1152 model | 0.649 | 0.590 | 0.509 | 0.236 | 0.265 | 0.219 |
| Spreads | este modelo | 0.803 | 0.660 | 0.840 | 0.511 | 0.443 | 0.313 |

**Split de validación** (1.964 páginas y 1.001 spreads):

| Vista | Modelo | Box AP | Mask AP | SFX box | Text mask | SFX mask |
|---|---|---|---|---|---|---|
| Páginas | 1152 model | 0.669 | 0.626 | 0.220 | 0.354 | 0.227 |
| Páginas | este modelo | 0.814 | 0.691 | 0.496 | 0.542 | 0.294 |
| Spreads | 1152 model | 0.659 | 0.584 | 0.206 | 0.267 | 0.174 |
| Spreads | este modelo | 0.790 | 0.651 | 0.437 | 0.447 | 0.250 |

Los AP de bocadillos y viñetas son similares en ambos modelos: caja 0,92–0,95 y máscara 0,92–0,97.

**Umbrales recomendados y precisión/exhaustividad en validación:**

| Clase | Umbral | Precisión / exhaustividad |
|---|---|---|
| text | 0,25 | 0,890 / 0,985 |
| onomatopoeia | 0,30 | 0,726 / 0,776 |
| bubble | 0,50 | 0,975 / 0,975 |
| panel | 0,40 | 0,983 / 0,981 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 46,6 millones de parámetros y entrada de 1920 × 1920, se recomienda GPU con al menos 8–12 GB de VRAM para trabajar en bfloat16, aunque el dato no está confirmado en la información proporcionada.
- GPU recomendadas: se recomienda encarecidamente el uso de CUDA; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del modelo (0,2 GB en el repositorio) sugiere que podría caber en GPU de consumo, pero no se aportan datos verificados.
- Opciones de despliegue: la librería `rfdetr` versión 1.7.0, junto con `safetensors`, `huggingface_hub`, `opencv-python` y `pillow`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Box AP (test, páginas) | Mask AP (test, páginas) | Licencia |
|---|---|---|---|---|---|
| Koharu Layout HighRes (este modelo) | 46,6 M | 1920 × 1920 | 0,824 | 0,701 | all-rights-reserved |
| koharu-layout-rfdetr-seg-2xl-1152 | no disponible | 1152 × 1152 (estirado) | 0,653 | 0,631 | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo no realiza OCR ni determina el orden de lectura; solo detecta y segmenta regiones de maquetación.
- Está entrenado exclusivamente para manga en japonés; su rendimiento en otros idiomas o dominios no está garantizado.
- Las etiquetas de entrenamiento dejan mucho texto real sin etiquetar (encabezados, subtítulos, notas del autor, parte del diálogo), lo que hace que los umbrales altos parezcan mejores de lo que son. El umbral de texto se mantiene en 0,25, por debajo de su óptimo F1 de 0,53.
- No es un reemplazo directo del modelo 1152: requiere un preprocesamiento de entrada distinto (letterboxing a 1920 × 1920 con preservación de relación de aspecto) y embeddings posicionales mayores.
- En float32, una detección justo en el umbral puede caer del otro lado; se recomienda usar autocast en bfloat16.
- La licencia es "all-rights-reserved", lo que restringe el uso comercial y cualquier redistribución sin permiso explícito.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de falsos positivos y falsos negativos en la detección, especialmente en la clase de onomatopeyas, con una precisión de 0,726 en validación.
- No se dispone de información sobre sesgos específicos más allá de las limitaciones del dataset Manga109.

## Enlaces

- [HuggingFace: mayocream/koharu-layout-highres](https://huggingface.co/mayocream/koharu-layout-highres)
- [Modelo anterior: koharu-layout-rfdetr-seg-2xl-1152](https://huggingface.co/mayocream/koharu-layout-rfdetr-seg-2xl-1152)
- [Dataset: mayocream/manga109-segmentation](https://huggingface.co/datasets/mayocream/manga109-segmentation)
- [Librería rfdetr](https://github.com/roboflow/rf-detr) (enlace inferido, no confirmado en la información proporcionada)
