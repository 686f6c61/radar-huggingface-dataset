# nakamura196/yolov8-ndl-layout

## Resumen

`nakamura196/yolov8-ndl-layout` es un detector de objetos YOLOv8x ajustado (*fine-tuned*) para el análisis de maquetación de libros japoneses premodernos (古典籍), es decir, impresos y manuscritos anteriores a la era moderna. Lo desarrolla Satoru Nakamura, del Instituto de Investigación Historiográfica de la Universidad de Tokio, y se entrenó sobre el conjunto `nakamura196/ndl-layout-dataset`, derivado del corpus NDL-DocL. El modelo detecta cinco tipos de región por página: bloque de texto general, regiones manuscritas, regiones tipográficas (impresas), ilustraciones y sellos.

A diferencia de un modelo de lenguaje, no genera texto ni razona: es un detector de visión por computador de una sola etapa que devuelve cajas delimitadoras. Su utilidad práctica es servir de paso previo a pipelines de OCR sobre digitalizaciones de colecciones históricas japonesas, donde separar texto manuscrito de texto impreso y localizar sellos o ilustraciones es un requisito para enrutar cada región al reconocedor adecuado.

Es relevante ahora porque democratiza un paso de preprocesado que tradicionalmente exigía modelos de maquetación entrenados sobre corpus modernos (PubLayNet y similares), que fallan en libros premodernos japoneses. Ahora bien, la propia model card advierte de que las métricas publicadas están infladas por una fuga de datos a nivel de documento, por lo que debe evaluarse con cautela. El repositorio tiene 0 descargas y 1 *like*, con un tamaño de 0,1 GB y licencia AGPL-3.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8x (Ultralytics): CNN de una etapa, *anchor-free*, backbone CSPDarknet con bloques C2f, cuello PAN-FPN y cabeza desacoplada |
| Parámetros totales | ≈68,2 M (arquitectura YOLOv8x estándar de Ultralytics; el repositorio no publica el recuento exacto del checkpoint) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de detección de objetos con entrada de imagen a 640 px |
| Tipos de cuantización | Pesos en fp32; entrenamiento con AMP (fp16). Exportable a ONNX, TensorRT, OpenVINO o TFLite con cuantización INT8 mediante Ultralytics |
| Idiomas soportados | Japonés premoderno (libros impresos y manuscritos 古典籍). No multilingüe. El metadato de idiomas de HuggingFace figura como no disponible |
| Licencia | AGPL-3.0 (heredada de los pesos YOLOv8 de Ultralytics; los datos de entrenamiento son Public Domain Mark, los pesos no) |
| Formato de pesos | PyTorch (`.pt`), cargable con `ultralyticsplus` o Ultralytics |
| Tarea (pipeline) | `object-detection` |
| Número de clases | 5 (`1_overall`, `2_handwritten`, `3_typography`, `4_illustration`, `5_stamp`) |
| Resolución de entrada | 640 px |
| Entrenamiento | 2024-05-19, Ultralytics 8.2.18, una sola GPU (Google Colab) |
| Tamaño del repositorio | 0,1 GB |
| Descargas / *likes* | 0 / 1 |
| Última actualización | 2026-09-17 |

## Arquitectura y entrenamiento

El modelo es un YOLOv8x, la variante más grande de la familia YOLOv8 de Ultralytics. Se trata de un detector de una sola etapa con detección *anchor-free*, cabeza desacoplada y asignación de objetivos alineada con la tarea; el backbone es un CSPDarknet con bloques C2f y el cuello es un PAN-FPN. El ajuste fino partió de los pesos preentrenados en COCO (`yolov8x.pt`) sin congelar ninguna capa, y se sustituyó la cabeza de 80 clases por una de 5 clases.

Los datos de entrenamiento son 1.219 imágenes de página con 25.820 rectángulos anotados, extraídas del subconjunto 古典籍 del corpus NDL-DocL y reescaladas todas a 640 px de lado largo. La distribución de clases está muy desequilibrada: `2_handwritten` concentra el 53,6 % de los rectángulos (13.851) y `3_typography` el 35,9 % (9.262), mientras que `1_overall` supone el 4,7 % (1.219), `4_illustration` el 4,3 % (1.119) y `5_stamp` solo el 1,4 % (369, presentes en únicamente 194 de las 1.219 páginas). El reparto original del dataset fue de 853 / 244 / 122 imágenes (entrenamiento / validación / prueba), asignadas de forma aleatoria por página, no por documento.

El procedimiento de entrenamiento usó 100 épocas completas sin parada temprana (`patience=100`), tamaño de imagen 640, lote de 31, optimizador `auto` de Ultralytics con `lr0=0.01`, semilla 0 y precisión mixta AMP (fp16). Las aumentaciones fueron `fliplr=0.5`, `scale=0.5`, `erasing=0.4` y `hsv_h=0.015`, con `mosaic`, `degrees` y `flipud` desactivados (0.0). No hubo RLHF ni DPO, ya que no es un modelo generativo. La innovación destacable no está en la arquitectura, sino en el dominio: es uno de los pocos detectores publicados específicamente para maquetación de libros premodernos japoneses, con clases que separan explícitamente registro manuscrito y registro impreso.

## Capacidades

- Detección de cinco tipos de región en páginas de libros japoneses premodernos: bloque de texto general (`1_overall`), regiones manuscritas (`2_handwritten`), regiones tipográficas o impresas (`3_typography`), ilustraciones (`4_illustration`) y sellos o estampaciones (`5_stamp`).
- Salida de cajas delimitadoras con puntuación de confianza, utilizable como preprocesado para recortar regiones y enviarlas a un OCR de caracteres o de líneas.
- Distinción entre texto manuscrito y texto impreso dentro de la misma página, lo que permite enrutar cada región a motores de reconocimiento distintos (por ejemplo, reconocimiento de *kuzushiji* frente a OCR de imprenta).
- Localización de ilustraciones y sellos para catalogación, indexación y descripción estructural de digitalizaciones.
- Integración directa con flujos de trabajo IIIF: el ejemplo de la model card consume una imagen servida por el endpoint IIIF de la Biblioteca Nacional de la Dieta de Japón.
- Ejecución tanto en GPU como en CPU (`device="cpu"` en el ejemplo oficial).
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades de generación de texto, código, matemáticas ni modo de pensamiento.
- No es un modelo multimodal general: no describe imágenes ni responde a preguntas sobre ellas, solo localiza regiones de una taxonomía cerrada de cinco clases.

## Casos de uso

- Preprocesado para OCR de libros premodernos japoneses: el detector recorta las regiones `2_handwritten` y `3_typography` y las envía por separado a los reconocedores correspondientes, evitando que un único motor OCR se enfrente a una página con registro mixto.
- Segmentación manuscrito/impreso para rutado de motores: en colecciones donde conviven texto impreso y anotaciones manuscritas marginales, la clase `2_handwritten` permite separar ambos flujos y aplicar a cada uno un modelo especializado (por ejemplo, un reconocedor de *kuzushiji* y un OCR tipográfico).
- Descripción estructural masiva para archivos digitales e infraestructuras IIIF: generar automáticamente anotaciones de región sobre manifiestos IIIF, de modo que los visores puedan ofrecer navegación por bloques de contenido en lugar de por página completa.
- Detección y catalogación de sellos: localizar `5_stamp` para extraer, contar y clasificar estampaciones, un dato relevante para la atribución de ejemplares y el estudio de la circulación de libros (con la advertencia de que esta clase es la más ruidosa del modelo).
- Indexación de ilustraciones: aislar las regiones `4_illustration` para construir galerías navegables o para alimentar sistemas de búsqueda por similitud visual dentro de una colección histórica.
- Control de calidad de digitalizaciones: verificar que cada página escaneada contiene al menos una región de texto o ilustración esperada y marcar como anómala cualquier página sin detecciones, lo que permite priorizar la revisión humana.
- Enriquecimiento de metadatos en proyectos de humanidades digitales: calcular métricas agregadas por obra (proporción de superficie manuscrita frente a impresa, número de sellos, densidad de ilustraciones) para estudios cuantitativos sobre historia del libro.
- Filtrado previo a la transcripción completa: ejecutar el detector sobre un lote grande de páginas y descartar o posponer aquellas sin contenido textual relevante, reduciendo el coste de un pipeline de OCR a gran escala.

## Benchmarks y rendimiento

Advertencia previa: el reparto del dataset es aleatorio por página y no por documento. De los 71 PID presentes en entrenamiento, 34 aparecen también en validación y 32 en prueba; 117 de las 122 páginas de prueba provienen de un ítem del que el modelo ya vio páginas durante el entrenamiento. Todas las cifras siguientes están por tanto infladas y **no constituyen una estimación válida de generalización a documentos no vistos**.

Métricas almacenadas en el checkpoint, medidas sobre el split de validación de 244 páginas en la época 100:

| Métrica | Valor |
|---|---|
| Precisión | 0,951 |
| Exhaustividad (*recall*) | 0,899 |
| mAP@50 | 0,935 |
| mAP@50-95 | 0,781 |

Métricas medidas por el autor sobre el split de prueba de 122 páginas (Ultralytics 8.4.7, `imgsz=640`, CPU):

| Clase | P | R | mAP@50 | mAP@50-95 |
|---|---|---|---|---|
| Global | 0,943 | 0,938 | 0,964 | 0,794 |
| `1_overall` | 0,997 | 1,000 | 0,995 | 0,995 |
| `2_handwritten` | 0,994 | — | — | — |
| `3_typography` | No disponible en la información proporcionada | — | — | — |
| `4_illustration` | No disponible en la información proporcionada | — | — | — |
| `5_stamp` | No disponible en la información proporcionada | — | — | — |

La model card retiró explícitamente las cifras «mAP 85,4 % / IoU 78,2 %» que figuraban en una versión anterior: el 85,4 % no corresponde a ninguna medición de este modelo y el «IoU 78,2 %» era en realidad el valor de mAP@50-95 (0,781) bajo un nombre incorrecto. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: orientativamente por debajo de 2 GB en fp16 a 640 px y por debajo de 1 GB en CPU para una sola imagen; el *checkpoint* de YOLOv8x ronda los 130 MB en fp32. Estas cifras son estimaciones basadas en el tamaño de la arquitectura, no mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria es suficiente para inferencia a 640 px; para producción con lotes grandes se recomiendan NVIDIA T4, L4, A100 o H100. En estaciones de trabajo, una RTX 3060, 4070 o 4090 es más que suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna, y también en CPU (el ejemplo oficial de la model card usa `device="cpu"`).
- Opciones de despliegue: `ultralyticsplus` (librería declarada del repositorio), Ultralytics directamente, exportación a ONNX Runtime, TensorRT, OpenVINO, TFLite, TorchScript o CoreML, y servido mediante NVIDIA Triton. No aplican vLLM, llama.cpp, Ollama ni TGI, que son *runtimes* de modelos de lenguaje.
- Latencia y rendimiento: no disponible. No se han publicado mediciones de latencia ni de *throughput* para este modelo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados junto a este modelo ni en la información proporcionada. La comparación siguiente es estructural, no de rendimiento, y los campos no documentados se marcan como no disponibles.

| Modelo | Tarea | Clases | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nakamura196/yolov8-ndl-layout` | Detección de maquetación de libros japoneses premodernos | 5 regiones documentales | 1.219 páginas de 89 ítems (NDL-DocL, subconjunto 古典籍) | AGPL-3.0 | HuggingFace |
| YOLOv8x base (Ultralytics, COCO) | Detección de objetos general | 80 clases COCO | COCO | AGPL-3.0 | Pesos públicos de Ultralytics |
| Modelos de análisis de maquetación documental modernos (por ejemplo, familia LayoutLMv3 o DiT entrenados sobre PubLayNet) | Análisis de maquetación de documentos impresos modernos | Variable: título, párrafo, tabla, figura, lista | Corpus de documentos modernos (PubLayNet y similares) | No disponible en la información proporcionada | HuggingFace / GitHub |
| Otros detectores YOLOv8 ajustados a páginas históricas japonesas | Detección de maquetación histórica | Variable | No disponible | Variable | No disponible |

Rendimiento comparado: no disponible. No se han publicado resultados de benchmarks que permitan situar este modelo frente a las alternativas en términos de mAP sobre un conjunto común sin fuga de datos.

## Limitaciones y advertencias

- Fuga de datos a nivel de documento: el reparto del dataset es aleatorio por página, de modo que 34 de los 71 PID de entrenamiento reaparecen en validación y 32 en prueba; 117 de las 122 páginas de prueba provienen de ítems vistos durante el entrenamiento. Las páginas de un mismo ítem comparten papel, tipografía, maquetación, pautado y sellos, por lo que el modelo puede acertar reconociendo el ítem en lugar de generalizando.
- Las métricas publicadas no son una estimación válida de generalización a documentos no vistos, tal como advierte la propia model card.
- Población documental muy estrecha: solo 1.219 páginas procedentes de 89 ítems digitalizados. Las convenciones de maquetación varían por editor, época y género, y 89 ítems no cubren esa variedad.
- Las imágenes de entrenamiento se reescalaron a 640 px de lado largo (la mayoría son 640×480). El modelo nunca ha visto escaneos a resolución completa, por lo que los elementos pequeños —sellos, anotaciones interlineadas— pueden comportarse de forma distinta con entradas de alta resolución.
- Desequilibrio de clases severo: `5_stamp` representa el 1,4 % de los rectángulos y aparece en solo 194 de 1.219 páginas; sus puntuaciones deben considerarse ruidosas.
- Fuera de alcance: material impreso moderno, periódicos, revistas y manuscritos en otras escrituras. El modelo solo vio libros premodernos japoneses.
- No existen clases para tablas, figuras con pie de foto, encabezados ni pies de página, ni se modela el orden de lectura.
- No es adecuado para uso en tiempo real o de baja latencia: YOLOv8x es la variante más grande de la familia.
- Riesgo de falsos positivos y falsos negativos en lugar del riesgo de alucinación propio de los modelos generativos; en cualquier caso, las detecciones no deben tomarse como verdad de referencia sin verificación humana.
- Licencia AGPL-3.0 heredada de los pesos de Ultralytics: impone obligaciones de copyleft, incluidas las derivadas del uso en red. Aunque los datos de entrenamiento son Public Domain Mark, los pesos no lo son.
- Idiomas: únicamente japonés premoderno; el metadato de idiomas de HuggingFace figura como no disponible y la model card no declara soporte multilingüe.
- Adopción prácticamente nula hasta la fecha (0 descargas, 1 *like*), sin garantía de mantenimiento continuado.
- Las cifras «mAP 85,4 %» e «IoU 78,2 %» que circularon en una versión anterior de la model card fueron retiradas por el propio autor; no deben citarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nakamura196/yolov8-ndl-layout
- Dataset de entrenamiento: https://huggingface.co/datasets/nakamura196/ndl-layout-dataset
- Documentación de Ultralytics YOLOv8: https://docs.ultralytics.com/models/yolov8/
- Librería `ultralyticsplus`: https://github.com/fcakyon/ultralyticsplus
- Biblioteca Nacional de la Dieta de Japón, colecciones digitales: https://dl.ndl.go.jp/
- Ejemplo de imagen IIIF usada en la model card: https://dl.ndl.go.jp/api/iiif/2534020/T0000001/full/full/0/default.jpg
- Nota sobre la búsqueda web: no se han encontrado enlaces relevantes al modelo, al paper o a recursos adicionales; los resultados obtenidos corresponden únicamente a páginas de ayuda del motor de búsqueda y no se incluyen.
