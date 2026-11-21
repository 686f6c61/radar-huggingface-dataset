# mayocream/koharu-layout-highres

## Resumen

Koharu Layout HighRes es un modelo de detección de objetos y segmentación de instancias especializado en el análisis de maquetación (layout analysis) de páginas de manga japonés. Lo desarrolla Mayo Takanashi (mayocream) como componente del proyecto Koharu, una herramienta de código abierto para el procesado de manga, y se distribuye bajo licencia Apache 2.0. El modelo predice cajas delimitadoras y máscaras de instancia para cuatro clases: texto, onomatopeyas, bocadillos y viñetas.

Técnicamente se trata de un RF-DETR Seg 2XL, una arquitectura transformer de detección basada en DETR con cabecera de segmentación, afinada a partir del modelo previo `koharu-layout-rfdetr-seg-2xl-1152`. Con 46,6 millones de parámetros y un repositorio de solo 0,2 GB, es un modelo compacto pensado para ejecutarse en pipelines de procesado por lotes de páginas escaneadas, no para generación de texto ni OCR.

Su relevancia actual radica en la mejora sustancial de precisión respecto a su predecesor: eleva el Box AP de 0,653 a 0,824 y el Mask AP de 0,631 a 0,701 en el split de test a resolución de página, con mejoras especialmente marcadas en la detección de texto (de 0,502 a 0,852 en Text box AP). No realiza OCR ni determina el orden de lectura; es exclusivamente un modelo de localización de elementos de maquetación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RF-DETR Seg 2XL (transformer de detección DETR con cabecera de segmentación de instancias) |
| Parámetros totales | 46.596.271 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto; entrada por imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ja (japonés; el modelo no procesa texto, pero está entrenado sobre manga japonés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un RF-DETR Seg 2XL, variante de la familia RF-DETR (Roboflow DETR) que combina un backbone de extracción de características con un transformer de detección y una cabecera de segmentación de instancias. Predice simultáneamente cajas y máscaras para cuatro clases: `text` (diálogo, subtítulos, títulos y texto que no es efecto sonoro), `onomatopoeia` (efectos sonoros), `bubble` (bocadillos de diálogo y texto) y `panel` (viñetas). El modelo no realiza OCR ni inferencia del orden de lectura.

El entrenamiento parte del modelo `koharu-layout-rfdetr-seg-2xl-1152` y se afina en dos etapas con resolución de entrada creciente, usando el dataset `mayocream/manga109-segmentation` v3.0.0. Las imágenes de entrenamiento provienen de la release de Manga109 y no se redistribuyen con el modelo. El cómputo se realizó sobre 4 GPU NVIDIA H200. El split de test (1.908 páginas individuales y 969 dobles páginas) no se usó para entrenamiento ni para selección de modelo.

## Capacidades

- Detección de objetos (cajas delimitadoras) en páginas de manga con cuatro clases: texto, onomatopeya, bocadillo y viñeta.
- Segmentación de instancias: genera máscaras por instancia para cada elemento detectado.
- Análisis de maquetación de página completa y de dobles páginas (spreads).
- Detección de texto de diálogo, subtítulos y títulos (clase `text`).
- Detección de efectos sonoros dibujados (clase `onomatopoeia`).
- Localización de bocadillos de diálogo y de viñetas para su posterior recorte o procesado.
- No incluye OCR, reconocimiento de caracteres ni determinación del orden de lectura.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo puramente perceptivo).
- Capacidad multilingüe: no aplica; el modelo está entrenado exclusivamente sobre manga japonés.

## Casos de uso

- Digitalización y catalogación de manga escaneado: el modelo localiza bocadillos, texto y viñetas en cada página, permitiendo segmentar la página en regiones para su posterior OCR o indexación. Su Mask AP de 0,701 en test lo hace adecuado para pipelines automáticos de extracción de regiones.
- Traducción automática de manga: al aislar las regiones de texto y bocadillos con sus máscaras, un pipeline posterior puede aplicar OCR, traducción y re-renderizado del texto sin tocar las ilustraciones. La clase `bubble` con AP de caja en torno a 0,92-0,95 facilita el recorte preciso de globos.
- Limpieza y restauración de escaneos: las máscaras de texto y onomatopeya permiten eliminar o sustituir el lettering original para producir ediciones limpias o versiones localizadas.
- Extracción de efectos sonoros para estudios de estilo: la detección específica de onomatopeyas (SFX box AP de 0,556 en test) permite recopilar y analizar los efectos sonoros dibujados de una obra.
- Análisis estructural de páginas para investigación: la segmentación de viñetas (AP de caja 0,92-0,95) permite estudiar la composición de viñetas, ritmo visual y distribución de la página en corpus de manga.
- Preprocesado para modelos de visión-lenguaje sobre cómic: las regiones detectadas y sus máscaras sirven como entrada estructurada a modelos posteriores de descripción, diálogo o generación, reduciendo el ruido de la página completa.
- Procesado por lotes en herramientas de escritorio: con 46,6 M de parámetros y 0,2 GB de pesos, puede integrarse en aplicaciones locales de gestión de bibliotecas de manga para preindexar páginas sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

COCO AP 50:95 evaluado contra `manga109-segmentation` v3.0.0 a resolución de página, con hasta 160 detecciones por imagen. Cada modelo se ejecutó con su propia resolución de entrada.

Split de test (1.908 páginas individuales y 969 dobles páginas):

| Vista | Modelo | Box AP | Mask AP | Text box | SFX box | Text mask | SFX mask |
|---|---|---:|---:|---:|---:|---:|---:|
| Páginas | 1152 model | 0,653 | 0,631 | 0,502 | 0,226 | 0,348 | 0,277 |
| Páginas | **este modelo** | **0,824** | **0,701** | **0,852** | **0,556** | **0,536** | **0,365** |
| Spreads | 1152 model | 0,649 | 0,590 | 0,509 | 0,236 | 0,265 | 0,219 |
| Spreads | **este modelo** | **0,803** | **0,660** | **0,840** | **0,511** | **0,443** | **0,313** |

Split de validación (1.964 páginas y 1.001 spreads):

| Vista | Modelo | Box AP | Mask AP | SFX box | Text mask | SFX mask |
|---|---|---:|---:|---:|---:|---:|
| Páginas | 1152 model | 0,669 | 0,626 | 0,220 | 0,354 | 0,227 |
| Páginas | **este modelo** | **0,814** | **0,691** | **0,496** | **0,542** | **0,294** |
| Spreads | 1152 model | 0,659 | 0,584 | 0,206 | 0,267 | 0,174 |
| Spreads | **este modelo** | **0,790** | **0,651** | **0,437** | **0,447** | **0,250** |

Según la model card, el AP de bocadillos y viñetas es similar en ambos modelos: caja 0,92-0,95 y máscara 0,92-0,97.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 46,6 M de parámetros y pesos en safetensors de 0,2 GB, la huella de pesos es inferior a 1 GB en FP32, por lo que la VRAM vendrá dominada por las activaciones a alta resolución de entrada.
- GPU recomendadas: el entrenamiento se realizó en 4 × NVIDIA H200; para inferencia, cualquier GPU con suficiente memoria para la resolución de entrada (no se especifican mínimos).
- Cabe en GPU de consumo: muy probablemente sí en tarjetas con 8-16 GB de VRAM, dado el tamaño reducido de pesos, aunque el dato no está publicado.
- Opciones de despliegue: librería `rfdetr` (indicada en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Box AP (test, páginas) | Mask AP (test, páginas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **koharu-layout-highres** | 46,6 M | resolución de página (high-res) | 0,824 | 0,701 | Apache 2.0 | Hugging Face |
| koharu-layout-rfdetr-seg-2xl-1152 | no disponible | 1152 px | 0,653 | 0,631 | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos comparables de layout de manga en la información proporcionada; la comparativa se limita al predecesor directo del mismo autor.

## Limitaciones y advertencias

- Líneas cortas dentro de bocadillos (por ejemplo «!», «で?» o una sola palabra) a veces se clasifican como onomatopeya en lugar de texto; el límite es difuso porque las etiquetas de entrenamiento incluyen algunos efectos sonoros dentro de bocadillos.
- El mismo lettering puede detectarse dos veces: como texto y como onomatopeya, o como fragmentos anidados dentro de un efecto sonoro completo.
- Las etiquetas de nombre de personaje y rótulos similares de webcómics en color se pierden en su mayoría; Manga109 no contiene ese tipo de elementos.
- Números de página, encabezados repetidos y líneas de copyright pueden detectarse como texto.
- En cómics en color, decoraciones como destellos, gotas de sudor o corazones pueden detectarse como onomatopeya.
- Entrenado exclusivamente con manga japonés: otros estilos de cómic y otros sistemas de escritura pueden comportarse de forma distinta.
- No realiza OCR ni orden de lectura; requiere un pipeline posterior para cualquier tarea de comprensión textual.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y detecciones duplicadas descritas arriba.
- Licencia Apache 2.0 permite uso comercial; el archivo `NOTICE` recoge el aviso de RF-DETR (Apache 2.0). Las imágenes de Manga109 no se redistribuyen y siguen sujetas a los términos de Manga109.
- Integridad de pesos: SHA-256 de `model.safetensors` = `03de2f77281974f5084cdd8652ace2b55dc15ac0378aed66654e62537cdda255`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mayocream/koharu-layout-highres
- Modelo predecesor: https://huggingface.co/mayocream/koharu-layout-rfdetr-seg-2xl-1152
- Dataset de entrenamiento: https://huggingface.co/datasets/mayocream/manga109-segmentation
- Proyecto Koharu: https://github.com/koharu-rs/koharu
