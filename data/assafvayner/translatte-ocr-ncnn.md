# assafvayner/translatte-ocr-ncnn

## Resumen

`assafvayner/translatte-ocr-ncnn` no es un modelo de lenguaje, sino un paquete de conversiones a NCNN del pipeline OCR PP-OCRv5 en su variante mobile, publicadas por el desarrollador de translatte (assafvayner) para su uso en OCR on-device. El repositorio agrupa un detector de texto (`det`) y diez reconocedores organizados por script (`rec-cjk`, `rec-latin`, `rec-eslav`, `rec-korean`, `rec-arabic`, `rec-devanagari`, `rec-th`, `rec-ta`, `rec-te`), todos derivados de los releases ONNX oficiales de PaddleOCR y redistribuidos bajo Apache-2.0.

El problema que resuelve es la portabilidad: los modelos originales de PaddlePaddle se distribuyen en ONNX, un formato poco práctico para despliegue embebido en Android, iOS o dispositivos sin runtime de ONNX. Estas conversiones, generadas con pnnx 20260526 mediante el script `convert_ocr_ncnn.py`, permiten ejecutar deteccion y reconocimiento de texto directamente sobre la libreria NCNN de Tencent, con pesos en fp32 y formas dinamicas.

La relevancia es acotada pero clara: es un artefacto de infraestructura para pipelines de OCR ligero en dispositivo, no un modelo con benchmarks propios ni capacidades generativas. El repo completo ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta, por lo que debe evaluarse como conversion tecnica de los modelos de PaddleOCR y no como un modelo independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR PP-OCRv5 mobile: un detector de texto (`det`) y reconocedores por script; detalles de capas no disponibles en la model card |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo OCR, no generativo); el detector acepta entradas de cualquier HxW |
| Tipos de cuantizacion | Solo fp32 en este repositorio; no se incluyen variantes fp16 ni int8 (NCNN dispone de herramientas propias de cuantizacion, no aplicadas aqui) |
| Idiomas soportados | No declarados en los metadatos; por los directorios incluidos, se cubren los scripts cjk, latin, eslavo (cirilico), coreano, arabe, devanagari, thai, tamil y telugu |
| Licencia | Apache-2.0 |
| Formato de pesos | NCNN (`.param` + `.bin`), pesos fp32; blob de entrada `in0`, salida `out0` |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: es una conversion de formato. Los pesos proceden de los releases ONNX de PaddleOCR (`PaddlePaddle/PP-OCRv5_mobile_det_onnx` para el detector y las variantes `latin_`, `eslav_`, `korean_`, `arabic_`, `devanagari_`, `th_`, `ta_`, `te_` y la base multiescritura para los reconocedores), convertidos con pnnx 20260526. La model card atribuye todo el merito a PaddlePaddle/PaddleOCR y no aporta informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de alineacion o ajuste fino, por lo que esos datos deben consultarse en las fichas originales de PaddleOCR.

La innovacion tecnica del artefacto es la conversion en si: formas dinamicas (el detector admite cualquier alto y ancho de imagen; los reconocedores fijan altura 48 px y ancho variable), pesos fp32 y una interfaz de dos blobs (`in0`/`out0`) que simplifica la integracion en C++, Android o iOS a traves de NCNN. El preprocesado y los diccionarios de caracteres son identicos a los de los modelos ONNX originales; los diccionarios no se duplican en este repositorio y deben tomarse de las fichas de PaddleOCR. No hay decodificacion especulativa, atencion lineal ni tecnicas de RLHF/DPO, ya que no se trata de un modelo autoregresivo.

## Capacidades

- Deteccion de regiones de texto en imagenes de cualquier resolucion (HxW dinamico en el modelo `det`).
- Reconocimiento de texto en lineas de altura 48 px con ancho variable, mediante el reconocedor correspondiente al script.
- Cobertura por scripts: cjk (chino/japones/coreano hanzi), latin, eslavo (cirilico), coreano, arabe, devanagari, thai, tamil y telugu.
- Ejecucion on-device sobre NCNN, sin dependencia de ONNX Runtime ni de servicios en la nube.
- Integracion en pipelines de OCR completos: el detector localiza cajas y cada reconocedor transcribe el recorte.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision general, audio ni generacion de texto libre.
- Capacidad multilingue limitada a los scripts cubiertos por los reconocedores incluidos; fuera de ellos no hay soporte declarado.

## Casos de uso

- OCR embebido en aplicaciones moviles: empaquetar `det` mas `rec-latin` dentro de una app Android o iOS con NCNN permite digitalizar texto de fotos sin conexion ni coste de API, con un consumo de almacenamiento del orden de decenas de MB por submodelo.
- Traduccion de carteles y menus en tiempo real: es el escenario original de translatte; el detector localiza las lineas y el reconocedor del script correspondiente las transcribe antes de pasarlas a un motor de traduccion.
- Digitalizacion de documentos y facturas en escritorio: usar `rec-latin` para texto en espanol, ingles, frances, aleman o portugues, con altura de linea normalizada a 48 px y recortes de ancho variable.
- Extraccion de texto en entornos sin red: auditoria de documentos en instalaciones aisladas, donde no se puede enviar imagenes a servicios cloud por requisitos de confidencialidad.
- Procesado de documentos multilingues: combinacion de `rec-cjk`, `rec-arabic` y `rec-devanagari` sobre un mismo lote de imagenes, seleccionando el reconocedor segun el script detectado.
- Accesibilidad: lectura en voz alta de texto impreso capturado con la camara del dispositivo, con inferencia local y latencia acotada por el tamano mobile de los modelos.
- Preprocesado de datasets: extraccion masiva de texto de imagenes para construir corpus o para indexar archivos escaneados antes de pasarlos a un sistema de recuperacion.
- Digitalizacion de matriculas y senalizacion: con `rec-latin` sobre recortes del detector, en escenarios de control de acceso o inventario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, CER ni WER, ni comparaciones con otros reconocedores; al ser una conversion de los modelos de PaddleOCR, los datos de referencia habria que buscarlos en las fichas de `PaddlePaddle/PP-OCRv5_mobile_det_onnx` y de los reconocedores correspondientes.

## Requisitos de hardware

- VRAM estimada: no disponible. Como referencia de orden de magnitud, el repositorio completo (detector mas diez reconocedores) ocupa 0,1 GB, por lo que cada submodelo individual es de decenas de MB en fp32.
- GPU recomendadas: no disponibles; el destino natural de NCNN son CPU ARM, GPU integradas y aceleracion Vulkan en movil, no GPU de datacenter.
- Cabe en GPU de consumo: si, con margen amplio, dado el tamano reducido de los pesos; tambien en CPU y en SoC moviles.
- Opciones de despliegue: NCNN (C++, Android, iOS, Vulkan), con el conversor pnnx documentado en el repositorio; los modelos ONNX originales pueden ejecutarse con ONNX Runtime o con el propio ecosistema PaddleOCR si se prefiere esa ruta.
- Latencia y throughput: no disponibles. Dependen del dispositivo, del numero de regiones detectadas por imagen y del reconocedor empleado (los reconocedores con vocabulario mayor, como cjk, suelen ser mas costosos que latin).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `assafvayner/translatte-ocr-ncnn` | OCR PP-OCRv5 mobile en NCNN | No disponible | No aplica (HxW dinamico en detector) | Apache-2.0 | HuggingFace, 0 descargas |
| PaddleOCR PP-OCRv5 mobile (ONNX) | OCR original en ONNX | No disponible en la informacion | No aplica | Apache-2.0 | HuggingFace (PaddlePaddle) |
| Tesseract OCR | OCR clasico con LSTM | No disponible en la informacion | No aplica | Apache-2.0 | Repositorio ampliamente desplegado |
| EasyOCR | OCR basado en detector + reconocedor deep learning | No disponible en la informacion | No aplica | Apache-2.0 | Repositorio publico |

La comparacion relevante es frente a los ONNX originales de PaddleOCR: misma licencia, mismos pesos y mismo preprocesado, con la diferencia de formato y del runtime de ejecucion. Frente a Tesseract o EasyOCR, la ventaja declarada es la ligereza del pipeline mobile y la integracion nativa en NCNN; no hay datos publicados que permitan comparar precision.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona y no soporta herramientas ni agentes; cualquier expectativa en ese sentido es un error de categoria.
- Los diccionarios de caracteres no estan incluidos en el repositorio; hay que tomarlos de los modelos ONNX de PaddleOCR o el reconocimiento fallara.
- Solo se distribuyen pesos fp32; no hay variantes cuantizadas, lo que limita la reduccion de huella en dispositivos muy restringidos salvo que se apliquen las herramientas de cuantizacion de NCNN por cuenta propia.
- Cobertura linguistica limitada a los scripts incluidos; idiomas con otros alfabetos no estan soportados por estos reconocedores.
- Riesgo de error de reconocimiento en imagenes con ruido, rotacion, baja resolucion o tipografias no vistas, inherente a cualquier OCR; no hay metricas publicadas que permitan acotar la tasa de error.
- No se han publicado evaluaciones de sesgo; en OCR el riesgo se traslada a diferencias de calidad entre scripts y a la sobrerrepresentacion de ciertos tipos de documento en los datos originales de PaddleOCR.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos de origen en PaddleOCR y citar la atribucion correspondiente.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- Las formas dinamicas simplifican la integracion pero trasladan al codigo cliente la responsabilidad del preprocesado y del postprocesado (decodificacion de cajas, recorte y normalizacion a altura 48 px).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/assafvayner/translatte-ocr-ncnn
- PaddleOCR (repositorio oficial): https://github.com/PaddlePaddle/PaddleOCR
- NCNN (repositorio oficial): https://github.com/Tencent/ncnn
- Detector de origen: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det_onnx
- Reconocedor multiescritura de origen: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_rec_onnx
- Reconocedor latin: https://huggingface.co/PaddlePaddle/latin_PP-OCRv5_mobile_rec_onnx
- Reconocedor eslavo: https://huggingface.co/PaddlePaddle/eslav_PP-OCRv5_mobile_rec_onnx
- Reconocedor coreano: https://huggingface.co/PaddlePaddle/korean_PP-OCRv5_mobile_rec_onnx
- Reconocedor arabe: https://huggingface.co/PaddlePaddle/arabic_PP-OCRv5_mobile_rec_onnx
- Reconocedor devanagari: https://huggingface.co/PaddlePaddle/devanagari_PP-OCRv5_mobile_rec_onnx
- Reconocedor thai: https://huggingface.co/PaddlePaddle/th_PP-OCRv5_mobile_rec_onnx
- Reconocedor tamil: https://huggingface.co/PaddlePaddle/ta_PP-OCRv5_mobile_rec_onnx
- Reconocedor telugu: https://huggingface.co/PaddlePaddle/te_PP-OCRv5_mobile_rec_onnx
