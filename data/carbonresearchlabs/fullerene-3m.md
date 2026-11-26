# CarbonResearchLabs/fullerene-3M

## Resumen

Fullerene-3M es el conjunto de modelos para escritura latina del motor de OCR Carbon-OCR, desarrollado por Carbon Research Labs. No se trata de un único modelo monolítico, sino de cuatro redes neuronales pequeñas entrenadas desde cero que suman 2.774.014 parámetros en total: un modelo de orientación de página, un detector de líneas y figuras, un reconocedor de líneas de texto y un modelo de orden de lectura y estructura de tablas. Se complementa con un modelo de lenguaje de carácter 7-grama (Kneser-Ney modificado) que puntúa las lecturas del reconocedor.

El objetivo del modelo es convertir escaneos, fotografías de documentos y PDF en texto, HTML, Markdown y JSON con cajas delimitadoras, en orden de lectura, con bloques etiquetados y celdas de tabla. Frente a alternativas clásicas como Tesseract, el autor declara mejoras notables en pruebas de tablas, orden de lectura y velocidad de inferencia, manteniendo un tamaño extremadamente reducido (repositorio de 0,1 GB) y pesos disponibles en safetensors y ONNX.

Su relevancia actual radica en la eficiencia: un conjunto de menos de 3 millones de parámetros que declara leer 9,34 páginas por segundo en un solo núcleo de CPU y 209,9 páginas por segundo en una RTX 4060 Ti con TensorRT, lo que lo hace atractivo para pipelines de digitalización masiva en entornos con recursos limitados. El modelo está orientado a documentos en inglés, ruso y griego, y su licencia es propietaria (carbon-ocr-openrail-ams), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conjunto de cuatro redes convolucionales pequeñas (orientación, detección, reconocimiento CTC y orden de lectura) más un modelo de lenguaje de carácter 7-grama |
| Parámetros totales | 2.774.014 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen a texto, procesa líneas y páginas, no secuencias de contexto) |
| Tipos de cuantización | INT8 para el reconocedor y el modelo de orientación (según la model card); no se detallan otras cuantizaciones |
| Idiomas soportados | Inglés (en), ruso (ru), griego (el) |
| Licencia | carbon-ocr-openrail-ams (licencia «other», con enlace a LICENSE-WEIGHTS.md) |
| Formato de pesos | safetensors, ONNX |
| Desglose de parámetros | orient: 338.669; det: 442.564; rec-latin: 1.511.104; order: 481.677 |
| Modelo de lenguaje | lm-latin.bin, 7-grama de caracteres, Kneser-Ney modificado interpolado, 12,7 M de n-gramas, 93,9 MB |
| Tamaño del repositorio | 0,1 GB |
| Entrada de imagen | Orientación: miniatura en escala de grises de 512×512; detección: página en grises con lado largo 1024; reconocimiento: recorte de línea de 32×W |
| Etiquetas de bloque | Text, Section-Header, Page-Header, Page-Footer, List-Group, Table, Caption, Footnote, Table-Of-Contents, Form, Picture, Formula, Other |

## Arquitectura y entrenamiento

El conjunto está formado por cuatro redes independientes entrenadas desde cero. El modelo `orient` clasifica la orientación de la página en 13 clases (12 bins de 30 grados más CJK vertical) a partir de una miniatura de 512×512 en escala de grises y un mapa de tinta. El modelo `det` detecta líneas de texto y figuras produciendo cuatro mapas con stride 2 (logit de banda central, distancia superior, distancia inferior y logit de figura) sobre la página en grises con lado largo 1024. El modelo `rec-latin` reconoce líneas de escritura latina, cirílica y griega mediante CTC, con 800 puntuaciones de clase por cada 4 píxeles sobre recortes de 32×W. El modelo `order` procesa 16 características geométricas y textuales por línea para predecir sucesor, misma agrupación, fila de tabla, columna y celda, además de 13 etiquetas de bloque.

El reconocedor se apoya en un modelo de lenguaje de carácter 7-grama con suavizado Kneser-Ney modificado interpolado, con 12,7 millones de n-gramas almacenados en un fichero compacto de 93,9 MB (etiqueta de 32 bits por ranura y códecs de 8 bits para los valores), mapeado en memoria. Sus pesos de interpolación (alpha 0,3; beta 0,5; gate 2,0) están ajustados para este reconocedor. No se detalla en la información disponible el volumen de tokens ni la composición exacta del dataset de entrenamiento (CarbonResearchLabs/fullerene-data), ni si se emplearon técnicas de RLHF o DPO, que en un modelo OCR de este tipo no resultan de aplicación directa.

La innovación técnica principal es la combinación de modelos minúsculos con un motor C++/CUDA (Carbon-OCR) que orquesta orientación y corrección de inclinación hasta 45 grados, detección con segunda pasada para texto diminuto, reconocimiento, y orden de lectura con XY-cut como respaldo cuando el modelo de orden no está seguro. El motor descarta líneas no textuales pero conserva viñetas y guiones de celdas vacías, y reconstruye la rejilla de tablas a partir de filas y columnas detectadas.

## Capacidades

- Conversión de escaneos, fotografías de documentos y PDF a texto plano, HTML, Markdown y JSON con cajas delimitadoras.
- Orden de lectura con bloques etiquetados (13 categorías: texto, encabezados, pies, listas, tablas, leyendas, notas al pie, formularios, figuras, fórmulas, etc.).
- Detección y reconstrucción de estructura de tablas, incluyendo celdas y unión de tablas cortadas en dos.
- Detección de orientación de página con 12 bins de 30 grados y soporte de CJK vertical en la clasificación.
- Corrección de inclinación (deskew) de hasta 45 grados, gestionada por el motor Carbon-OCR.
- Detección de líneas de texto y figuras, con segunda pasada para texto de tamaño muy reducido.
- Reconocimiento de escritura latina, cirílica y griega (inglés, ruso y griego declarados).
- Modelo de lenguaje de carácter 7-grama para puntuar y corregir las lecturas del reconocedor.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo «thinking»: es un pipeline OCR especializado, no un modelo generativo de propósito general.
- No soporta visión general más allá de la lectura de documentos ni audio.

## Casos de uso

- Digitalización masiva de archivos administrativos: el motor procesa páginas en lote a 9,34 páginas por segundo en un solo núcleo de CPU, lo que permite convertir fondos documentales completos en texto buscable sin depender de GPU.
- Extracción de tablas de informes financieros: el modelo de orden reconstruye filas, columnas y celdas, y declara 49,7 % de pruebas de tabla superadas en OmniParseBench, adecuado para poblar bases de datos a partir de balances y estados de resultados.
- Procesamiento de facturas y formularios: la etiqueta de bloque «Form» y la salida JSON con cajas permiten mapear campos a un esquema estructurado en pipelines de contabilidad.
- Indexación de documentación técnica multilingüe: al cubrir inglés, ruso y griego, sirve para digitalizar manuales y papers en estos idiomas y alimentar motores de búsqueda internos.
- Digitalización de prensa histórica y documentos con columnas: el orden de lectura y la eliminación de encabezados y pies repetidos (73,9 % de pruebas superadas en olmOCR-Bench) facilitan la conversión de periódicos y revistas a texto lineal.
- Despliegue en dispositivos de borde o entornos sin GPU: con 2,77 millones de parámetros y pesos ONNX en INT8, cabe en CPU de escritorio e incluso en hardware embebido para escaneo en oficina.
- Preprocesado para pipelines de RAG: la salida en Markdown con estructura de bloques y tablas preserva el formato necesario para fragmentar documentos y alimentar sistemas de recuperación aumentada.
- Automatización de accesibilidad documental: conversión de PDF escaneados a HTML estructurado para lectores de pantalla, conservando orden de lectura y jerarquía de encabezados.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | fullerene-3M | Referencia (Tesseract 5.5) |
|---|---|---|---|
| OmniParseBench (2.937 páginas) | Headline (media de texto, tablas y layout) | 53,0 (54,0 con 7-grama) | 5,9 |
| OmniParseBench | Pruebas de texto superadas (%) | 27,2 | 17,8 |
| OmniParseBench | Pruebas de tabla superadas (%) | 49,7 | No puede superarlas (solo texto) |
| OmniParseBench | Pruebas de layout superadas (%) | 81,9 | No disponible |
| olmOCR-Bench | Headline (%) | 47,0 | 34,2 |
| olmOCR-Bench | Pruebas de tabla superadas (%) | 54,3 | No disponible |
| olmOCR-Bench | Encabezados y pies superados (%) | 73,9 | No disponible |
| OmniDocBench v1.6 (páginas en inglés) | Distancia de edición de texto (menor es mejor) | 0,164 | 0,129 |
| OmniDocBench v1.6 | Table TEDS | 51,1 | No disponible |
| OmniDocBench v1.6 | Distancia de edición de orden de lectura (menor es mejor) | 0,287 | No disponible |

Rendimiento de velocidad declarado por el autor:

| Entorno | Páginas por segundo |
|---|---|
| 1 núcleo de CPU de escritorio (INT8) | 9,34 |
| Tesseract 5.5 en el mismo núcleo | 0,92 (fullerene-3M es 10,2 veces más rápido) |
| 8 núcleos de CPU del escritorio | 53,2 |
| RTX 4060 Ti con TensorRT (sostenido 5 minutos) | 209,9 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,77 millones de parámetros en INT8 el conjunto de pesos ocupa del orden de unos pocos megabytes, más el modelo de lenguaje de 93,9 MB mapeado en memoria.
- GPU recomendadas: el autor cita una RTX 4060 Ti con TensorRT alcanzando 209,9 páginas por segundo; no se detallan otras GPU.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU: el rendimiento en un solo núcleo de escritorio es de 9,34 páginas por segundo.
- Opciones de despliegue: el motor oficial Carbon-OCR (C++/CUDA) que carga los cuatro modelos; pesos disponibles en ONNX y safetensors para integración en otros runtimes. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de pipeline OCR.
- Latencia y throughput: 9,34 páginas/s por núcleo de CPU, 53,2 páginas/s con 8 núcleos y 209,9 páginas/s en RTX 4060 Ti con TensorRT, sostenido durante cinco minutos según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Tablas y layout | Licencia | Formatos |
|---|---|---|---|---|---|
| fullerene-3M | 2,77 M | en, ru, el | Sí (49,7 % pruebas de tabla en OmniParseBench; 81,9 % layout) | carbon-ocr-openrail-ams (propietaria) | safetensors, ONNX |
| Tesseract 5.5 | No disponible | Muy amplio (incluye en, ru, el) | No (solo texto; 5,9 headline en OmniParseBench) | Apache 2.0 | Pesos propios (traineddata) |
| Modelos OCR basados en VLM de gran tamaño (p. ej. familia olmOCR) | Del orden de miles de millones (no disponible el dato exacto) | Principalmente inglés | Sí, vía generación | Varía según modelo | safetensors, GGUF |

La comparación directa con Tesseract es la que aporta el autor: fullerene-3M supera a Tesseract en OmniParseBench (53,0 frente a 5,9), en olmOCR-Bench (47,0 frente a 34,2) y en velocidad (10,2 veces más rápido por núcleo), aunque Tesseract obtiene mejor distancia de edición en texto plano en OmniDocBench (0,129 frente a 0,164). No se dispone de datos comparativos con otros modelos OCR neuronales en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística limitada a inglés, ruso y griego; no soporta otros alfabetos ni escrituras no latinas/cirílicas/griegas salvo la clasificación de orientación CJK vertical.
- En texto plano, Tesseract obtiene mejor distancia de edición en OmniDocBench (0,129 frente a 0,164), por lo que para documentos sin tablas ni estructura compleja puede no ser la mejor opción.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- Licencia propietaria carbon-ocr-openrail-ams: es necesario revisar LICENSE-WEIGHTS.md antes de cualquier uso comercial; no es una licencia de código abierto estándar.
- El modelo no es generativo ni conversacional: no admite tool calling, agentes ni razonamiento multi-paso, lo que limita su uso a pipelines OCR.
- Riesgo de errores en documentos con tipografías inusuales, manuscritos, sellos o ruido extremo; no se documentan métricas para estos casos.
- El modelo de lenguaje 7-grama está ajustado específicamente para este reconocedor y no es reutilizable como modelo de lenguaje general.
- No se detallan sesgos conocidos ni composición del dataset de entrenamiento, lo que dificulta evaluar posibles sesgos en la lectura de determinados documentos.
- El rendimiento de 209,9 páginas/s depende de TensorRT y de una GPU concreta (RTX 4060 Ti); en otros entornos las cifras pueden variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CarbonResearchLabs/fullerene-3M
- Repositorio del motor Carbon-OCR: https://github.com/CarbonResearchLabs/Carbon-OCR
- Licencia de pesos: https://huggingface.co/CarbonResearchLabs/fullerene-3M/blob/main/LICENSE-WEIGHTS.md
- Dataset de entrenamiento: https://huggingface.co/datasets/CarbonResearchLabs/fullerene-data
- Benchmark OmniParseBench: https://huggingface.co/datasets/datalab-to/omni_parse_bench
- Benchmark olmOCR-Bench: https://huggingface.co/datasets/allenai/olmOCR-bench
- Benchmark OmniDocBench: https://huggingface.co/datasets/opendatalab/OmniDocBench
