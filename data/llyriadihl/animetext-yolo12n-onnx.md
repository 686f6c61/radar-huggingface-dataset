# Llyriadihl/AnimeText-yolo12n-onnx

## Resumen

AnimeText YOLO12n (ONNX) es una redistribucion sin modificaciones del detector de bloques de texto `yolo12n_animetext`, originalmente publicado por el autor deepghs en el repositorio `deepghs/AnimeText_yolo`. Se trata de un modelo de deteccion de objetos basado en la arquitectura YOLO12 en su variante nano (n), exportado a formato ONNX y especializado en localizar regiones de texto dentro de imagenes de manga y anime. El modelo pertenece a la familia de detectores ligeros de Ultralytics y se distribuye bajo licencia GPL-3.0.

La relevancia de esta copia concreta es practica: el autor la aloja para que el lector de manga Tadoku (tambien GPL-3.0) pueda incluir el modelo en su distribucion sin obligar a los usuarios a autenticarse en Hugging Face. El modelo resuelve el problema de la deteccion de texto en ilustraciones, un paso previo habitual en pipelines de traduccion automatica de manga, OCR sobre bocadillos y limpieza de paginas. No es un modelo generativo ni un modelo de lenguaje: es un detector de objetos de una sola clase (`text_block`) que devuelve cajas delimitadoras.

El modelo base procede del trabajo *AnimeText: A Large-Scale Dataset for Robust Text Detection in Anime Images* (arXiv 2510.07951), que aporta el conjunto de datos de entrenamiento. La exportacion ONNX tiene un tamano de repositorio practicamente nulo en la informacion disponible (0.0 GB reportados), lo que sugiere un artefacto muy ligero propio de la variante nano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO12 (variante nano, `yolo12n`), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `model.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (deteccion de texto independiente del idioma; el modelo base se entrena sobre texto en imagenes de anime/manga) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

El modelo es un detector de objetos de una etapa basado en YOLO12 en variante nano, con una unica clase de salida denominada `text_block`. La exportacion a ONNX conserva la salida tipica de Ultralytics con forma `[1, 5, anchors]`, donde las cinco componentes corresponden a centro x, centro y, ancho, alto y puntuacion de confianza. La entrada es una imagen RGB con letterbox a 640x640, normalizada al rango 0-1 y con relleno gris de valor 114. El postprocesado requiere aplicar un umbral de confianza y supresion no maxima (NMS).

El entrenamiento se realizo sobre el conjunto de datos AnimeText, descrito en el articulo arXiv 2510.07951, orientado a deteccion robusta de texto en imagenes de anime. La model card de esta copia no aporta detalles sobre numero de tokens, composicion exacta del dataset, ni sobre si se emplearon tecnicas de ajuste adicionales; esa informacion corresponde al repositorio original `deepghs/AnimeText_yolo`. El autor de esta copia indica explicitamente que la redistribuye sin modificaciones respecto a la revision `a180c191bfdb9f0e31b57e7de567e7b6bac50f84` del modelo base.

El archivo `threshold.json` incluido acompaña al modelo con un umbral de confianza optimo para F1 de 0.251, lo que constituye el unico parametro de inferencia documentado de forma explicita.

## Capacidades

- Deteccion de regiones de texto (bloques de texto) en imagenes de manga y anime, con una unica clase `text_block`.
- Salida de cajas delimitadoras en formato centro x, centro y, ancho, alto y puntuacion, lista para aplicar umbral y NMS.
- Inferencia via ONNX Runtime u otros motores compatibles con ONNX, sin dependencia de PyTorch en tiempo de ejecucion.
- Entrada de imagen RGB con letterbox a 640x640 y normalizacion a 0-1.
- Umbral de confianza recomendado de 0.251, ajustado para maximizar F1 segun el autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un detector visual.
- No se documentan capacidades multilingues ni modos especiales (thinking, vision general, audio).

## Casos de uso

- Traduccion automatica de manga: el detector localiza los bloques de texto en cada pagina y los pasa a un OCR y a un traductor; el modelo es adecuado por su especializacion en texto sobre ilustracion y su bajo coste computacional.
- Lectores de manga con funciones de accesibilidad: integracion en aplicaciones como Tadoku para resaltar o extraer el texto de los bocadillos y ofrecer lectura asistida o superposicion de traducciones.
- Pipelines de OCR sobre webtoons y comics digitales: preprocesado que aísla las regiones con texto antes de aplicar un motor OCR, reduciendo falsos positivos sobre fondos ilustrados.
- Limpieza y reentintado de paginas (inpainting): las cajas detectadas sirven para enmascarar el texto original antes de reconstruir la imagen o insertar texto traducido.
- Indexacion y busqueda de contenido en archivos de manga: deteccion de paginas con texto para priorizar el procesado o la catalogacion automatica.
- Prototipado rapido en entornos sin GPU: al ser un modelo nano exportado a ONNX, puede ejecutarse en CPU o en GPUs de gama baja dentro de aplicaciones de escritorio o moviles.
- Herramientas de anotacion asistida: generacion automatica de cajas candidatas que un anotador humano revisa, acelerando la creacion de datasets de texto en manga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por tratarse de una variante nano de YOLO12 exportada a ONNX, el consumo esperado es muy reducido, aunque no se aportan cifras.
- GPU recomendadas: no disponible; cualquier GPU compatible con ONNX Runtime (por ejemplo, series RTX o datacenter) deberia poder ejecutar el modelo, pero no se documentan recomendaciones concretas.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido de la variante nano, aunque no se confirma con datos en la informacion proporcionada.
- Opciones de despliegue: ONNX Runtime es el motor natural; tambien podria ejecutarse con otros runtimes compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clase(s) | Entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| AnimeText YOLO12n (esta copia) | Detector YOLO12n | `text_block` | 640x640 RGB | GPL-3.0 | ONNX | Hugging Face (Llyriadihl/AnimeText-yolo12n-onnx) |
| deepghs/AnimeText_yolo (modelo base) | Detector YOLO (familia AnimeText) | deteccion de texto en anime/manga | no disponible en detalle | no disponible en la informacion | no disponible en la informacion | Hugging Face (deepghs/AnimeText_yolo) |
| Detectores YOLO genericos (p. ej. YOLOv8/YOLO11/YOLO12 COCO) | Detector de objetos general | 80 clases COCO | 640x640 | AGPL-3.0 (Ultralytics) o variantes | PyTorch, ONNX | Amplia |

La comparacion se limita a estos terminos porque la informacion disponible no incluye cifras de rendimiento del modelo base ni de alternativas especializadas en deteccion de texto en manga. No se dispone de datos para comparar precision, recall o mAP.

## Limitaciones y advertencias

- Modelo de una sola clase: solo detecta bloques de texto; no reconoce caracteres ni transcribe contenido.
- Requiere postprocesado manual: hay que aplicar el umbral de confianza (0.251 recomendado) y NMS sobre la salida `[1, 5, anchors]`.
- Entrada fija de 640x640 con letterbox: textos muy pequenos o imagenes de altisima resolucion pueden requerir division en teselas o reescalado, lo que afecta a la deteccion.
- Dominio restringido a imagenes de anime y manga; el rendimiento fuera de ese dominio no esta documentado.
- No se documentan sesgos especificos ni tasas de alucinacion (no es un modelo generativo), pero la deteccion puede fallar en tipografias estilizadas, texto sobre fondos complejos o efectos de sonido integrados en la ilustracion.
- Licencia GPL-3.0: el uso comercial o la integracion en productos distribuidos exige cumplir las obligaciones de copyleft de la GPL; conviene revisar la compatibilidad con la licencia del producto.
- El repositorio reporta 0 descargas y 0 likes en el momento de la informacion, y un tamano de 0.0 GB; no hay evidencia de validacion independiente de esta copia concreta.
- El autor indica que la copia es sin modificaciones; cualquier problema de precision debe atribuirse al modelo base y verificarse contra el repositorio original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Llyriadihl/AnimeText-yolo12n-onnx
- Modelo base: https://huggingface.co/deepghs/AnimeText_yolo
- Articulo: *AnimeText: A Large-Scale Dataset for Robust Text Detection in Anime Images*: https://arxiv.org/abs/2510.07951
- Proyecto Tadoku (lector de manga GPL-3.0): https://github.com/Allyriadil/Tadoku
