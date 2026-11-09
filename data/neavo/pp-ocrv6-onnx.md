# neavo/PP-OCRv6-ONNX

## Resumen

PP-OCRv6-ONNX es un espejo (mirror) de los seis modelos ONNX de la familia PP-OCRv6 publicados por RapidAI / RapidOCR. No se trata de un modelo nuevo ni de una conversión propia: el repositorio aloja copias byte a byte de los pesos originales, sin reexportar, cuantizar, podar ni modificar metadatos. La familia PP-OCRv6 procede originalmente de PaddlePaddle / PaddleOCR y se distribuye en formato ONNX para su uso con los runtimes de RapidOCR.

El paquete cubre las dos etapas clásicas de un pipeline OCR: detección de texto (`det`) y reconocimiento de texto (`rec`), cada una en tres tamaños (`tiny`, `small`, `medium`). Los modelos de detección localizan las regiones de texto en una imagen; los de reconocimiento transcriben el contenido de cada región recortada. Ambos roles son complementarios y no intercambiables.

Su relevancia es práctica: ofrece una vía de despliegue OCR en ONNX Runtime sin dependencia de PaddlePaddle en producción, con variantes de tamaño que van desde ~1,8 MB (detección tiny) hasta ~76,6 MB (reconocimiento medium). El repositorio es pequeño (~0,2 GB) y los ficheros están verificados contra los SHA-256 del origen fijado en ModelScope.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos ONNX de deteccion y reconocimiento de texto de la familia PP-OCRv6; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | no disponible (solo se publican tamanos de fichero) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo OCR, no generativo de texto) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen sin cuantizar; el autor indica que no se aplico cuantizacion) |
| Idiomas soportados | no disponible (depende del diccionario de caracteres configurado en el runtime de RapidOCR/PaddleOCR) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) |

Desglose de ficheros publicados:

| Fichero | Tamano (bytes) |
|---|---:|
| `det/PP-OCRv6_det_medium.onnx` | 62.119.454 |
| `det/PP-OCRv6_det_small.onnx` | 9.929.594 |
| `det/PP-OCRv6_det_tiny.onnx` | 1.829.618 |
| `rec/PP-OCRv6_rec_medium.onnx` | 76.629.984 |
| `rec/PP-OCRv6_rec_small.onnx` | 21.234.383 |
| `rec/PP-OCRv6_rec_tiny.onnx` | 4.489.813 |

## Arquitectura y entrenamiento

No se dispone de detalles de arquitectura interna, composicion del dataset de entrenamiento ni proceso de alineacion en la informacion proporcionada. Lo que si se documenta es la procedencia: los modelos pertenecen a la familia PP-OCRv6 de PaddlePaddle / PaddleOCR, y la distribucion en ONNX corre a cargo de RapidAI / RapidOCR. El espejo fija la revision `7d0781614ca1a83d5ad9603f713acb2e74855d72` del repositorio de ModelScope y conserva las rutas relativas `det/` y `rec/` y los nombres de fichero originales.

La innovacion relevante aqui no es arquitectonica sino de empaquetado y trazabilidad: los seis ficheros se distribuyen como artefactos ONNX listos para inferencia con RapidOCR, con verificacion SHA-256 contra el origen. El autor advierte explicitamente de que la extension `.onnx` no garantiza por si sola la cobertura de operadores en WebGPU, por lo que la compatibilidad con backends concretos debe validarse en el runtime de destino.

## Capacidades

- Deteccion de texto en imagenes (modelos `det`): localizacion de regiones de texto para su posterior recorte.
- Reconocimiento de texto (modelos `rec`): transcripcion del contenido de las regiones detectadas.
- Tres niveles de capacidad/rendimiento por tarea (`tiny`, `small`, `medium`), lo que permite ajustar el equilibrio entre precision y coste computacional.
- Ejecucion mediante ONNX Runtime a traves de RapidOCR / PaddleOCR.
- No es un modelo generativo: no soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla del OCR.
- El soporte multilingue depende del diccionario de caracteres configurado en el pipeline, no de una lista fija declarada en el repositorio.

## Casos de uso

- Digitalizacion de documentos escaneados: usar `det_medium` + `rec_medium` para extraer texto de facturas, contratos o formularios, con la variante `small` cuando el volumen es alto y la precision exigida moderada.
- OCR en el navegador o en el cliente: desplegar las variantes `tiny` (1,8 MB deteccion, 4,5 MB reconocimiento) con ONNX Runtime Web para procesar imagenes sin enviar datos al servidor, validando antes la cobertura de operadores en WebGPU/WASM.
- Procesamiento por lotes en servidor: integrar los modelos ONNX en un pipeline de RapidOCR sobre CPU para indexar archivos PDF o imagenes en un sistema de busqueda documental.
- Extraccion de texto en aplicaciones moviles o embebidas: las variantes `tiny` permiten incluir OCR en dispositivos con recursos limitados, a costa de menor precision en escenas complejas.
- Preprocesado para pipelines de NLP: convertir imagenes en texto para alimentar etapas posteriores (clasificacion, extraccion de entidades) sin depender de servicios OCR externos.
- Verificacion de integridad en despliegues regulados: al publicarse los SHA-256 de cada fichero, el repositorio sirve como origen auditable para pipelines que exigen trazabilidad de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se realizo ninguna prueba adicional de inferencia, precision ni compatibilidad con GPU para este espejo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por el tamano de los ficheros, las variantes `tiny` y `small` son candidatas a ejecucion en CPU; las `medium` (62 MB y 77 MB) siguen siendo ligeras en terminos de memoria, pero el consumo real depende del runtime y del tamano de imagen de entrada.
- GPU recomendadas: no disponible. No se ha validado compatibilidad con GPU especificas en este espejo.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de los pesos, aunque no hay validacion publicada.
- Opciones de despliegue: ONNX Runtime a traves de RapidOCR o PaddleOCR, con el preprocesado, la decodificacion de reconocimiento y el diccionario de caracteres correspondientes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Variantes de tamano | Licencia | Notas |
|---|---|---|---|---|
| PP-OCRv6-ONNX (este espejo) | ONNX | det/rec en tiny, small, medium | Apache 2.0 | Espejo verificado de RapidAI; requiere runtime RapidOCR/PaddleOCR |
| PP-OCRv6 (original PaddlePaddle/PaddleOCR) | Paddle (upstream) | no disponible en la informacion proporcionada | Apache 2.0 (segun upstream declarado) | Origen de la familia; distribucion nativa en Paddle |
| RapidOCR (distribucion ONNX de RapidAI) | ONNX | det/rec en tiny, small, medium | Apache 2.0 | Fuente directa de este espejo |

No se dispone de datos de rendimiento que permitan comparar numericamente con alternativas OCR como Tesseract, EasyOCR o DocTR.

## Limitaciones y advertencias

- Es un espejo de ficheros, no una release de entrenamiento ni de conversion: no aporta mejoras ni correcciones sobre el original.
- No es un checkpoint de pipeline de Transformers; no puede cargarse con `AutoModel` ni similares.
- Los modelos `det` y `rec` no son intercambiables: cada uno cumple una funcion distinta dentro del pipeline.
- El soporte de idiomas depende del diccionario de caracteres configurado; el repositorio no declara una lista de idiomas.
- La extension `.onnx` no garantiza compatibilidad de operadores con WebGPU u otros backends; debe validarse en el runtime de destino.
- No se han publicado evaluaciones de precision, sesgos ni tasas de alucinacion para este espejo; en OCR, los errores tipicos son confusiones de caracteres y fallos en texto de baja calidad o rotado.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar las atribuciones a PaddlePaddle / PaddleOCR (familia) y RapidAI / RapidOCR (distribucion ONNX).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad que valide su uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/neavo/PP-OCRv6-ONNX
- Origen en ModelScope (revision fijada): https://modelscope.cn/models/RapidAI/RapidOCR/tree/7d0781614ca1a83d5ad9603f713acb2e74855d72/onnx/PP-OCRv6
- RapidOCR: https://github.com/RapidAI/RapidOCR
- PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
