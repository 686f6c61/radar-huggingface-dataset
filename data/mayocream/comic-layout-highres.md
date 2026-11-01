# mayocream/comic-layout-highres

## Resumen

Comic Layout HighRes es un modelo de segmentación de instancias basado en RF-DETR Seg 2XL, desarrollado por el usuario mayocream, especializado en el análisis de maquetación de páginas de manga. Predice cajas delimitadoras y máscaras de instancia para cuatro clases: texto, onomatopeyas, bocadillos y viñetas. No realiza OCR ni determina el orden de lectura; su función es exclusivamente estructural, sirviendo como etapa previa en pipelines de traducción, digitalización o remaquetación de cómics.

El modelo sustituye a la versión anterior `koharu-layout-rfdetr-seg-2xl-1152`, pero no es un reemplazo directo: opera sobre páginas con letterboxing a un lienzo de 1920 × 1920 píxeles, preservando la relación de aspecto original, y emplea embeddings posicionales de mayor tamaño. Cuenta con 46.596.271 parámetros y se distribuye en formato safetensors con pesos en float32 (EMA).

Su relevancia radica en la mejora sustancial frente a su predecesor en las clases más difíciles (texto y efectos de sonido), manteniendo un rendimiento prácticamente idéntico en bocadillos y viñetas. Está entrenado exclusivamente con datos de Manga109, por lo que su dominio es el manga japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Seg 2XL (transformer detector con cabeza de segmentación) |
| Parametros totales | 46.596.271 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; resolución de entrada 1920 × 1920 px |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | ja (japonés, por el dominio de los datos) |
| Licencia | all-rights-reserved (other) |
| Formato de pesos | safetensors |
| Pipeline | image-segmentation |
| Libreria | rfdetr (versión 1.7.0) |
| Detecciones por imagen | hasta 160 |
| Clases | text, onomatopoeia, bubble, panel |
| Dataset de entrenamiento | mayocream/manga109-segmentation v3.0.0 |
| Tamano del repo | 0.2 GB |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR Seg 2XL, una arquitectura de detección y segmentación de instancias de tipo transformer. La cabeza de predicción produce cajas y máscaras para cuatro clases más un logit adicional que representa la ausencia de clase (el quinto logit). Se emplean embeddings posicionales de mayor resolución que en la variante de 1152 píxeles, lo que permite procesar el lienzo de 1920 × 1920 sin deformar las páginas.

El entrenamiento utiliza el dataset `manga109-segmentation` en su versión 3.0.0. Las cajas de texto provienen de las anotaciones de Manga109 v2026 (la información disponible se interrumpe en este punto). Las páginas se someten a letterboxing: se redimensiona el lado largo a 1920 px (interpolación por área al reducir, bilinear al ampliar), se coloca la página en la esquina superior izquierda del lienzo y se rellena el resto con blanco. El modelo no ha visto páginas estiradas a un cuadrado, a diferencia de la versión anterior. Los pesos publicados corresponden a la media móvil exponencial (EMA) en float32.

## Capacidades

- Detección de cajas delimitadoras para cuatro clases de elementos de maquetación de manga.
- Segmentación de instancias con máscaras por píxel para cada detección.
- Clase `text`: diálogo, rótulos, títulos y otro texto que no sea efecto de sonido.
- Clase `onomatopoeia`: efectos de sonido (SFX).
- Clase `bubble`: bocadillos de diálogo y de texto.
- Clase `panel`: viñetas.
- Procesamiento de páginas individuales y de dobles páginas (spreads).
- Umbrales de confianza recomendados por clase, ajustados sobre el conjunto de validación.
- No realiza OCR: no extrae el contenido textual de las cajas.
- No determina el orden de lectura de las viñetas ni de los bocadillos.
- No soporta tool calling ni capacidades de agente; es un modelo puramente perceptivo.

## Casos de uso

- Digitalización y catalogación de archivos de manga: el modelo permite indexar automáticamente páginas por viñetas, bocadillos y texto, facilitando la búsqueda y navegación estructural en colecciones digitales de gran volumen.
- Preprocesado para pipelines de traducción automática: al aislar las cajas de texto y bocadillos, un sistema posterior de OCR y traducción puede procesar únicamente las regiones relevantes, reduciendo errores y coste computacional.
- Limpieza y retoque (inpainting) de páginas escaneadas: las máscaras de texto y onomatopeyas permiten eliminar o sustituir texto original para su relettering en ediciones localizadas.
- Remaquetación y reedición: las máscaras de viñetas posibilitan recortar, reordenar o recomponer páginas para formatos alternativos (webtoon, lectura en móvil, impresión a otro tamaño).
- Análisis editorial y estadísticas de estilo: la detección sistemática de bocadillos, viñetas y SFX permite medir densidad de diálogo, número de viñetas por página o uso de onomatopeyas en corpus de autores y obras.
- Herramientas de asistencia a traductores y editores: integrado en una interfaz gráfica, el modelo resalta automáticamente las regiones de texto y bocadillos para agilizar la anotación manual y la asignación de traducciones.
- Control de calidad en escaneos: la detección de viñetas y texto sirve para verificar que las páginas se han digitalizado completas y con la estructura esperada.

## Benchmarks y rendimiento

Resultados COCO AP 50:95 evaluados contra `manga109-segmentation` v3.0.0 a resolución de página, con hasta 160 detecciones por imagen. El modelo de 1152 se ejecutó con su propia entrada, estirada a 1152.

Conjunto de test (1.908 páginas individuales y 969 dobles páginas):

| Vista | Modelo | Box AP | Mask AP | Text box | SFX box | Text mask | SFX mask |
|---|---|---:|---:|---:|---:|---:|---:|
| Páginas | 1152 | 0.653 | 0.631 | 0.502 | 0.226 | 0.348 | 0.277 |
| Páginas | HighRes | 0.824 | 0.701 | 0.852 | 0.556 | 0.536 | 0.365 |
| Spreads | 1152 | 0.649 | 0.590 | 0.509 | 0.236 | 0.265 | 0.219 |
| Spreads | HighRes | 0.803 | 0.660 | 0.840 | 0.511 | 0.443 | 0.313 |

Conjunto de validación (1.964 páginas y 1.001 spreads):

| Vista | Modelo | Box AP | Mask AP | SFX box | Text mask | SFX mask |
|---|---|---:|---:|---:|---:|---:|
| Páginas | 1152 | 0.669 | 0.626 | 0.220 | 0.354 | 0.227 |
| Páginas | HighRes | 0.814 | 0.691 | 0.496 | 0.542 | 0.294 |
| Spreads | 1152 | 0.659 | 0.584 | 0.206 | 0.267 | 0.174 |
| Spreads | HighRes | 0.790 | 0.651 | 0.437 | 0.447 | 0.250 |

Bocadillos y viñetas presentan un AP similar en ambos modelos: caja 0.92–0.95, máscara 0.92–0.97.

Umbrales recomendados y precisión/recall en validación:

| Clase | Umbral | Precisión | Recall |
|---|---:|---:|---:|
| text | 0.25 | 0.890 | 0.985 |
| onomatopoeia | 0.30 | 0.726 | 0.776 |
| bubble | 0.50 | 0.975 | 0.975 |
| panel | 0.40 | 0.983 | 0.981 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 46,6 M de parámetros en float32, los pesos ocupan aproximadamente 186 MB, pero la resolución de 1920 × 1920 y la cabeza de segmentación incrementan notablemente el consumo de memoria de activaciones.
- GPU recomendadas: no disponible. El autor recomienda encarecidamente el uso de CUDA y calcula los resultados bajo autocast en bfloat16.
- GPU de consumo: no disponible. No se especifica si cabe en tarjetas consumer; el tamaño de pesos es reducido, pero la resolución de entrada es elevada.
- Opciones de despliegue: librería `rfdetr` versión 1.7.0, junto con `safetensors`, `huggingface_hub`, `opencv-python` y `pillow`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.
- Nota: en float32, una detección justo en el umbral puede quedar del lado opuesto; se recomienda bfloat16 para reproducir los resultados publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Box AP (test, páginas) | Mask AP (test, páginas) | Licencia |
|---|---|---:|---:|---:|---|
| Comic Layout HighRes | 46,6 M | 1920 × 1920 con letterbox | 0.824 | 0.701 | all-rights-reserved |
| koharu-layout-rfdetr-seg-2xl-1152 | no disponible | 1152 × 1152 estirado | 0.653 | 0.631 | no disponible |

No se dispone de información sobre otros modelos comparables de análisis de maquetación de manga en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con Manga109, por lo que su generalización a otros estilos de cómic (occidental, webtoon, manhwa) no está validada.
- Las etiquetas de entrenamiento dejan sin anotar mucho texto real (encabezados, rótulos, notas del autor, parte del diálogo), lo que hace que los umbrales altos parezcan mejores de lo que son; por eso el umbral de texto se fija en 0,25, por debajo de su óptimo F1 de 0,53.
- No realiza OCR ni orden de lectura: requiere etapas posteriores para extraer texto y secuenciar la lectura.
- No es un reemplazo directo del modelo de 1152: exige un preprocesado distinto (letterbox a 1920, página arriba a la izquierda, relleno blanco) y no debe estirarse a un cuadrado.
- Los resultados en float32 pueden diferir de los publicados en bfloat16 para detecciones cercanas al umbral.
- Licencia `all-rights-reserved`: restringe el uso comercial y cualquier redistribución; es necesario consultar el archivo LICENSE del repositorio.
- Riesgo de alucinación inherente a los detectores: pueden aparecer detecciones espurias o duplicadas, mitigadas parcialmente por la supresión de no máximos (NMS) a IoU 0,5 por clase.
- El modelo se publicó con 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mayocream/comic-layout-highres
- Modelo predecesor: https://huggingface.co/mayocream/koharu-layout-rfdetr-seg-2xl-1152
- Dataset de entrenamiento: https://huggingface.co/datasets/mayocream/manga109-segmentation
