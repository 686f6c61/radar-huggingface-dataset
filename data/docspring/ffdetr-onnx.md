# docspring/ffdetr-onnx

## Resumen

FFDetr-onnx es la conversión a ONNX del detector de campos de formulario FFDetr, desarrollado originalmente por Joe Barrow y exportado por DocSpring. Se trata de un modelo RF-DETR Medium (detector tipo DETR con backbone DINOv2) entrenado sobre el dataset CommonForms. Dada la imagen de una página de formulario, localiza cajas de texto, casillas y botones de opción, y campos de firma. El repositorio publicado contiene un único grafo ONNX de unos 0,1 GB, pensado para ejecutar la inferencia sin depender de PyTorch.

La relevancia práctica del artefacto está en dos decisiones de exportación: la entrada se fija a 1024x1024 en lugar de los 576x576 que usa por defecto `RFDETRMedium`, y los embeddings de posición del backbone DINOv2 se almacenan como constante en el grafo para evitar la interpolación bicúbica antialias, que ONNX no puede expresar. Según la model card, ese cambio de resolución eleva la tasa de campos detectados del 83,5 % al 91,5 % sobre el split de test de CommonForms.

No es un modelo de lenguaje: no genera texto, no razona y no procesa lenguaje natural. Es un detector de objetos de tres clases orientado a pipelines de automatización documental, y su interés para desarrolladores está en poder integrarlo con ONNX Runtime en lugar de mantener una dependencia de PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RF-DETR Medium (detector transformer tipo DETR) con backbone DINOv2 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija 1024x1024) |
| Tipos de cuantización | no disponible (el repositorio solo publica el grafo ONNX en float32) |
| Idiomas soportados | no disponible (no procesa texto; solo geometría de campos sobre imágenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), fichero `ffdetr-1024.onnx`, float32 |

Otros datos relevantes: entrada `input` de tipo float32 con forma `[1, 3, 1024, 1024]`; salidas `dets` float32 `[1, 300, 4]` (centro x, centro y, ancho y alto normalizados de 0 a 1) y `labels` float32 `[1, 300, 91]` (logits de clase, de los cuales solo se usan las tres primeras: 0 caja de texto, 1 casilla o botón de opción, 2 firma). Hash SHA-256 del fichero: `4b98b3e25341f64a289034a8f7a42d945c7e528aae23fa912eaa2ba5f610c6e2`. Exportado desde `FFDetr.pth` en la revisión `56f4e4235e28dcb2953513dc020bb191a2f54cfe` con rfdetr 1.6.5.post0 y torch 2.11.0.

## Arquitectura y entrenamiento

FFDetr es un modelo RF-DETR Medium, la variante de tamaño medio de la familia RF-DETR de Roboflow. Se trata de un detector de la familia DETR: un transformer que produce un conjunto fijo de consultas (300 en este caso) y devuelve, para cada una, una caja y logits de clase, evitando la necesidad de anclas y de supresión de no máximos dentro del grafo. El backbone es DINOv2, que aporta representaciones visuales auto-supervisadas. El entrenamiento se realizó sobre el dataset CommonForms, orientado específicamente a la detección de campos en formularios.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de ajuste con preferencias humanas; esos datos no están publicados en la model card. La innovación técnica destacable de esta conversión es de ingeniería de exportación: como los embeddings de posición del backbone se redimensionan con interpolación bicúbica antialias cuando la resolución difiere de 576, y ONNX no puede representar esa operación, se calcularon una sola vez en PyTorch para 1024x1024 y se almacenaron como constante en el grafo. El resultado, según el autor de la conversión, produce las mismas cajas con ONNX Runtime que con el modelo PyTorch.

## Capacidades

- Detección de campos de formulario en tres clases: cajas de texto (clase 0), casillas y botones de opción (clase 1) y campos de firma (clase 2).
- Localización de hasta 300 regiones por página mediante consultas del decoder, con cajas normalizadas respecto a la página.
- Funcionamiento sobre imágenes de página completa renderizadas a partir de PDFs, con entrada RGB normalizada con media y desviación estándar de ImageNet.
- Inferencia sin PyTorch: el grafo ONNX permite ejecución con ONNX Runtime y otros runtimes compatibles.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa texto, solo píxeles.
- No dispone de modo de pensamiento, visión generativa, audio ni OCR; la extracción de texto queda fuera del alcance del modelo.
- El post-proceso (sigmoide sobre los logits, selección de las 300 mejores puntuaciones de consulta y clase, umbral de confianza y NMS agnóstico de clase) no forma parte del grafo y debe implementarlo quien lo integre.

## Casos de uso

- Digitalización de formularios en producción: renderizar cada página de un PDF a 1024x1024, ejecutar el grafo ONNX y obtener las cajas de los campos para generar plantillas de relleno o esquemas de datos estructurados. Es el uso declarado por DocSpring, que emplea este fichero para detectar campos en los PDF subidos por sus clientes.
- Reconocimiento óptico de caracteres dirigido: usar las cajas de la clase 0 como regiones de interés para pasar después a un motor OCR, reduciendo el coste de OCR a página completa y mejorando la precisión al recortar cada campo.
- Extracción de casillas y botones de opción: identificar los elementos de la clase 1 para construir formularios interactivos o para validar respuestas marcadas en encuestas y cuestionarios escaneados.
- Detección de campos de firma: localizar la clase 2 para verificar presencia y posición de firmas en contratos antes de archivarlos o enviarlos a revisión humana.
- Automatización de pipelines documentales sin PyTorch: desplegar el modelo en entornos donde solo se permite ONNX Runtime, por ejemplo servicios ligeros en contenedores o funciones serverless con dependencias mínimas.
- Anotación asistida de datasets: pre-etiquetar formularios nuevos con el modelo y someter las detecciones a revisión humana, acelerando la creación de conjuntos de datos propios.
- Integración en aplicaciones de escritorio o en el borde: al pesar el fichero alrededor de 0,1 GB, es viable empaquetarlo dentro de una herramienta local de gestión documental que no tenga acceso a GPUs de centro de datos.

## Benchmarks y rendimiento

La model card publica una única evaluación, sobre las 164 páginas del split de test de CommonForms (5.294 campos), considerando un campo como detectado cuando una caja se solapa con él con IoU igual o superior a 0,3:

| Tamaño de entrada | Campos detectados |
|---|---|
| 576 (valor por defecto de rfdetr) | 83,5 % |
| 1024 (este fichero) | 91,5 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible; además, esos benchmarks no son aplicables a un modelo de detección de objetos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el fichero pesa unos 0,1 GB, por lo que los pesos en float32 ocupan del orden de decenas de megabytes; el consumo dominante procede de las activaciones a 1024x1024 con backbone DINOv2. Una estimación prudente para lote de 1 sería de 2 a 4 GB de VRAM, pero es una estimación propia, no un dato publicado.
- GPU recomendadas: no hay recomendaciones en la información disponible. Cualquier GPU con al menos 4 GB de VRAM y soporte de ONNX Runtime GPU debería poder ejecutarlo; GPUs de centro de datos como A100 o H100 no aportan ventaja por memoria, solo por latencia.
- Viabilidad en GPU de consumo: previsiblemente sí en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, siempre bajo la estimación anterior. En CPU también es ejecutable con ONNX Runtime, con latencia mayor no cuantificada.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), ONNX Runtime con TensorRT o OpenVINO como execution providers, y otros runtimes compatibles con ONNX opset 17. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño de entrada | Campos detectados (test CommonForms) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ffdetr-onnx (este modelo) | ONNX opset 17 | 1024x1024 | 91,5 % | Apache-2.0 | HuggingFace |
| jbarrow/FFDetr | PyTorch | 1024x1024 (según argumentos de entrenamiento) | no disponible en la información proporcionada | Apache-2.0 | HuggingFace |
| RF-DETR Medium por defecto (rfdetr) | PyTorch | 576x576 | 83,5 % con los pesos de FFDetr | Apache-2.0 | Repositorio de Roboflow |

No se dispone de datos comparativos con otras alternativas de detección de campos de formulario (por ejemplo, enfoques basados en LayoutLM o detectores genéricos tipo YOLO) en la información proporcionada.

## Limitaciones y advertencias

- Solo detecta tres clases (caja de texto, casilla o botón de opción y firma). No identifica etiquetas, tablas, párrafos, imágenes ni otros elementos de página.
- La salida contiene 91 clases de logits, pero solo las tres primeras tienen significado; usar un índice superior produce resultados sin sentido.
- El grafo no incluye el post-proceso. Sin aplicar sigmoide, umbral de confianza y NMS agnóstico de clase, las salidas en bruto no son utilizables. DocSpring emplea confianza 0,3 e IoU de NMS 0,1, valores que pueden no ser óptimos para otros dominios.
- La entrada está fijada a 1024x1024 y no admite resoluciones dinámicas, porque los embeddings de posición se almacenaron como constante. Cambiar de resolución exige reexportar desde PyTorch.
- El 91,5 % de campos detectados implica que aproximadamente uno de cada doce campos del conjunto de evaluación no se localiza con IoU 0,3; en producción conviene prever revisión humana o umbrales ajustados al caso de uso.
- Riesgo de falsos positivos y de generalización limitada en maquetas de formulario muy distintas de las del dataset CommonForms. La model card no documenta análisis de sesgos ni de dominios infrarrepresentados.
- La model card no especifica la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos por idioma, país o tipo de documento.
- Licencia Apache-2.0, que permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se atribuya a los autores originales (Joe Barrow para el modelo y CommonForms, Roboflow para RF-DETR y DocSpring para la conversión a ONNX).
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 16 de octubre de 2026, por lo que se trata de una publicación reciente con poca validación externa.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/docspring/ffdetr-onnx
- Modelo base FFDetr: https://huggingface.co/jbarrow/FFDetr
- Dataset CommonForms: https://huggingface.co/datasets/jbarrow/CommonForms
- Artículo de CommonForms: https://arxiv.org/abs/2509.16506
- Repositorio de RF-DETR (Roboflow): https://github.com/roboflow/rf-detr
- Las búsquedas web realizadas no devolvieron resultados relacionados con este modelo; los enlaces encontrados no son relevantes y se omiten.
