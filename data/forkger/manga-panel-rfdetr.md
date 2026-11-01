# forkger/manga-panel-rfdetr

## Resumen

Manga Panel Detector es un modelo de detección de objetos especializado en páginas de manga, desarrollado por el usuario forkger y publicado bajo licencia Apache-2.0. Se trata de un fine-tune de RF-DETR Medium (Roboflow) entrenado sobre el dataset Manga109-s y convertido a Core ML en FP16 para su ejecución nativa en iPhone y iPad. Detecta tres clases de regiones: viñetas (panel), texto (bocadillos y rótulos) y cuerpos de personajes (body).

El modelo resuelve un problema concreto en el ecosistema de lectores de cómic: la segmentación automática de la página para ofrecer lectura viñeta a viñeta en dispositivos Apple. Es la pieza de visión que alimenta el modo de lectura por paneles de KMReader, un lector open source para Komga y KMServer. A diferencia de los modelos de lenguaje, aquí no hay generación de texto: la salida son cajas delimitadoras normalizadas sobre la página.

Su relevancia radica en la combinación de un detector DETR de última generación con un despliegue on-device optimizado para el Neural Engine de Apple, con latencias de decenas de milisegundos por página en hardware reciente. El repositorio ocupa 0,1 GB y contiene únicamente el paquete Core ML, sin imágenes ni anotaciones del dataset original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Medium (Real-Time Detection Transformer, DETR-style con set prediction) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 576×576 RGB) |
| Tipos de cuantizacion | FP16 (Core ML ML Program); no se documentan otras variantes |
| Idiomas soportados | no aplica (detección visual); entrenado exclusivamente con manga japonés |
| Licencia | Apache-2.0 (con obligación de atribución a Manga109-s) |
| Formato de pesos | Core ML ML Program (`.mlpackage`), FP16, 58 MB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint RF-DETR-Medium preentrenado en COCO y se fine-tunea para detección de regiones en páginas de manga. RF-DETR es un detector transformer de la familia DETR con predicción de conjuntos (set prediction), lo que elimina la necesidad de supresión de no máximos (NMS) en la decodificación. La entrada es una imagen de 576×576 RGB estirada (sin letterbox), con escalado 1/255 y normalización ImageNet integrados en el propio modelo Core ML. La salida son dos tensores FP16: cajas `[1, 300, 4]` en formato `(cx, cy, w, h)` normalizado y logits de clase `[1, 300, 5]`, donde los canales 1, 2 y 3 corresponden a panel, text y body respectivamente.

El entrenamiento utilizó Manga109-s (v2026): 87 volúmenes, 15.588 páginas individuales tras dividir las dobles páginas. Las anotaciones provienen de los campos `frame` (viñetas), `text` (texto) y `body` (cuerpos). El split se hizo por libro sin solapamiento: 70 para entrenamiento, 13 para validación y 4 para test. Se entrenó a resolución 576 durante 50 épocas, seleccionando el checkpoint por mejor mAP@[.5:.95] de validación con EMA. Posteriormente se convirtió a Core ML FP16 para despliegue en iOS 16+ y macOS 13+.

## Capacidades

- Detección de viñetas (panel) en páginas de manga, con cajas normalizadas al tamaño de la página.
- Detección de regiones de texto (bocadillos y rótulos) sin reconocimiento óptico de caracteres: solo localiza la región, no lee el contenido.
- Detección de cuerpos de personajes (body) como cajas, sin identificación de quién es cada figura.
- Inferencia on-device en iPhone y iPad mediante Core ML, con aceleración por Neural Engine en chips A14 y posteriores.
- Salida DETR-style sin NMS: basta aplicar sigmoid a los logits y filtrar por umbral.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües; es exclusivamente un detector visual.
- Umbrales de referencia usados en KMReader: panel 0,40; text 0,50; body 0,50.

## Casos de uso

- Lectura viñeta a viñeta en lectores de manga para iOS/iPadOS: el modelo segmenta la página y permite al lector hacer zoom secuencial sobre cada viñeta, aprovechando la inferencia on-device con latencias de ~50 ms en A18.
- Integración en apps de lectura de cómic sobre servidores Komga o KMServer: KMReader ya lo usa como motor de su modo panel; otras apps pueden consumir las mismas cajas al ser un modelo genérico de detección.
- Preprocesado para OCR de bocadillos: la clase text localiza las regiones de diálogo, que después pueden enviarse a un motor OCR o a un modelo de traducción, reduciendo el área a procesar.
- Indexación y búsqueda visual de páginas: las cajas de body y panel permiten construir metadatos por página (número de viñetas, presencia de personajes) para búsqueda o filtrado en bibliotecas grandes.
- Herramientas de accesibilidad: el recorte automático de viñetas facilita la navegación por páginas en lectores con control por teclado o gestos, sin requerir que el usuario haga zoom manual.
- Prototipado rápido en Apple platforms: al ser un `.mlpackage` de 58 MB con salida de cajas simple, se puede integrar en cualquier app Swift sin dependencias de servidores ni GPU dedicada.
- Análisis de layout para investigación en comprensión de manga: sirve como extractor de estructura de página (paneles, texto, figuras) para pipelines de análisis multimodal.

## Benchmarks y rendimiento

Precisión medida sobre el modelo PyTorch antes de la conversión, en 4 libros de Manga109-s (724 páginas) reservados para test:

| Clase | AP@[.5:.95] | AP@50 |
|---|---|---|
| panel | 0,911 | 0,977 |
| text | 0,866 | 0,976 |
| body | 0,667 | 0,901 |
| **global** | **0,815** | **0,951** |

Velocidad por página en dispositivo (Core ML, FP16):

| Dispositivo | Unidades de cómputo | Tiempo por página |
|---|---|---|
| iPhone 12 mini (A14) | Neural Engine (`.all`) | ~85–230 ms |
| iPhone XR (A12) | CPU fallback (`.cpuOnly`) | ~730 ms |
| iPhone 16 (A18) | Neural Engine (`.all`) | ~30–170 ms (típicamente ~50 ms) |

No se han publicado comparaciones con otros detectores de paneles de manga en la información disponible.

## Requisitos de hardware

- Despliegue previsto en Apple platforms: iPhone/iPad con iOS 16+ o macOS 13+.
- Neural Engine recomendado: chips A14 o posteriores cargan el modelo con `MLComputeUnits.all`.
- Chips A12 no pueden compilar el modelo para Neural Engine ni GPU y fallan con error -5; es necesario usar `.cpuAndGPU` o `.cpuOnly`.
- En el simulador de iOS hay que usar `.cpuOnly`, ya que otras configuraciones devuelven puntuaciones inválidas.
- La primera carga en dispositivo compila y cachea una versión específica: unos segundos en A18 y uno o dos minutos en A14; las cargas posteriores son rápidas.
- Tamaño del paquete: 58 MB (FP16), lo que permite incluirlo en el bundle de una app sin descarga adicional significativa.
- No se documentan opciones de despliegue en servidor (vLLM, TGI, llama.cpp u Ollama); el formato es exclusivamente Core ML.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de paneles de manga en la documentación proporcionada. Como referencia del linaje, el modelo base es RF-DETR Medium de Roboflow (Apache-2.0), un detector general de objetos preentrenado en COCO; este fine-tune lo especializa en tres clases de manga. No se han publicado métricas de otros detectores de paneles en la información disponible para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Las viñetas sin borde se detectan con menor fiabilidad; Manga109 anota mejor los marcos con borde y el modelo hereda ese sesgo. Un lector debería tratar "no se encontraron paneles" como "mostrar la página completa".
- Manga109-s contiene únicamente manga japonés, por lo que se espera menor precisión en webtoons, cómic occidental y estilos artísticos muy distintos.
- La clase text es un detector de región sin reconocimiento de texto: no transcribe ni traduce el contenido de los bocadillos.
- La clase body marca figuras como cajas, pero no identifica a qué personaje corresponden.
- El modelo solo devuelve cajas; el orden de lectura, la limpieza de solapamientos y el encuadre del zoom no forman parte del modelo y deben implementarse aparte.
- La licencia Apache-2.0 permite uso comercial, pero los términos de Manga109-s exigen indicar claramente el uso del dataset siempre que se publiquen resultados como modelos preentrenados; si se usa o redistribuye el modelo, debe mantenerse esa atribución.
- El repositorio no contiene imágenes ni anotaciones de Manga109-s, solo los pesos convertidos.
- No hay información publicada sobre sesgos demográficos o de representación más allá del dominio limitado al manga japonés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/forkger/manga-panel-rfdetr
- RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Dataset Manga109-s: https://huggingface.co/datasets/hal-utokyo/Manga109-s
- KMReader: https://github.com/kmworks/kmreader
- Komga: https://komga.org
- KMServer: https://github.com/kmworks/kmrs
- Paper RF-DETR (referencia arXiv en tags): https://arxiv.org/abs/2511.09554
