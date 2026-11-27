# joshcarter-eisen/hebrew-handwriting-ocr

## Resumen

`joshcarter-eisen/hebrew-handwriting-ocr` es un repositorio de modelos ONNX orientado a OCR de escritura manuscrita en hebreo, publicado por el usuario joshcarter-eisen bajo licencia MIT. No se trata de un modelo entrenado desde cero, sino de un paquete de artefactos de inferencia reempaquetados: un modelo de reconocimiento de linea (`line_int8.onnx`) junto con su juego de caracteres (`charset.json`), y un modelo de deteccion de texto (`det_mobile.onnx`). El autor declara explicitamente que ambos proceden de fuentes publicas con licencias permisivas y se distribuyen sin modificaciones.

El interes practico del repositorio reside en su naturaleza de "bundle" listo para ejecucion en navegador: combina deteccion y reconocimiento en un pipeline OCR completo, en formato ONNX cuantizado a INT8, lo que permite despliegue en entornos sin GPU y con requisitos de memoria reducidos. El tamano total del repositorio es de aproximadamente 0,1 GB, coherente con modelos moviles de deteccion y reconocimiento.

La informacion disponible es muy limitada: el repositorio no incluye pipeline declarado, no especifica idiomas en los metadatos, no documenta parametros, contexto ni datos de entrenamiento, y no registra descargas ni interacciones. La ficha se elabora, por tanto, con los datos verificables del repositorio y de las fuentes originales citadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: deteccion de texto (PP-OCRv5 mobile det, PaddlePaddle) + reconocimiento de linea (modelo no documentado, empaquetado como `line_int8.onnx`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es una imagen de linea de texto) |
| Tipos de cuantizacion | INT8 (el fichero de reconocimiento se distribuye como `line_int8.onnx`); el modelo de deteccion se distribuye en el formato original de PP-OCRv5 mobile |
| Idiomas soportados | hebreo (escritura manuscrita, segun el nombre y la procedencia del modelo de reconocimiento); no se documentan otros idiomas |
| Licencia | MIT (repositorio); componentes: MIT (`cyttic/hebrew-ocr-android`) y Apache-2.0 (`PaddlePaddle/PP-OCRv5_mobile_det_onnx`) |
| Formato de pesos | ONNX (`line_int8.onnx`, `det_mobile.onnx`) + `charset.json` |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo unico entrenado por el autor, sino un ensamblaje de dos componentes de inferencia. La etapa de deteccion utiliza `det_mobile.onnx`, que corresponde al fichero `inference.onnx` del modelo `PaddlePaddle/PP-OCRv5_mobile_det_onnx`, es decir, la variante movil del detector de texto de la familia PP-OCRv5 de PaddleOCR, distribuida bajo Apache-2.0 y sin modificaciones. Esta etapa localiza regiones de texto en la imagen de entrada.

La etapa de reconocimiento utiliza `line_int8.onnx` junto con `charset.json`, procedentes del repositorio `cyttic/hebrew-ocr-android` bajo licencia MIT, tambien sin cambios. El autor no documenta la arquitectura interna de este reconocedor, el numero de parametros, el volumen de datos de entrenamiento, la composicion del corpus ni si hubo aumentos de datos o tecnicas de regularizacion. La cuantizacion a INT8 del reconocedor es el unico detalle de optimizacion declarado. No se mencionan innovaciones tecnicas adicionales, decodificacion especulativa ni mecanismos de atencion particulares.

## Capacidades

- Deteccion de regiones de texto en imagenes mediante un detector movil derivado de PP-OCRv5.
- Reconocimiento de texto manuscrito en hebreo a partir de recortes de linea, con salida de caracteres guiada por `charset.json`.
- Ejecucion en navegador mediante ONNX Runtime Web (el autor indica que los ficheros se usan en una pagina privada de OCR en el navegador).
- Inferencia en CPU sin necesidad de GPU, gracias a la cuantizacion INT8 del reconocedor y al diseno movil del detector.
- Pipeline completo de OCR en dos etapas (deteccion + reconocimiento) empaquetado en un unico repositorio.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Digitalizacion de documentos manuscritos en hebreo: el pipeline permite convertir imagenes de manuscritos en texto editable combinando la deteccion de lineas de PP-OCRv5 mobile con el reconocedor hebreo, adecuado para archivos historicos o formularios escaneados.
- OCR en el navegador sin backend: al estar en ONNX, puede cargarse con ONNX Runtime Web y ejecutarse en el cliente, lo que resulta util para aplicaciones que deben procesar documentos sensibles sin enviarlos a un servidor.
- Aplicaciones moviles y de escritorio con recursos limitados: el tamano reducido del repositorio (0,1 GB) y la cuantizacion INT8 permiten integrar el pipeline en dispositivos sin GPU dedicada.
- Preprocesado para pipelines de busqueda documental: el texto extraido de manuscritos hebreos puede indexarse en motores de busqueda o sistemas RAG una vez convertido a texto plano.
- Digitalizacion de formularios y registros administrativos: la deteccion de lineas seguida de reconocimiento encaja en flujos de extraccion de campos de documentos estructurados manuscritos.
- Prototipado e investigacion en OCR de escrituras semiticas: al ser un paquete MIT con componentes de origen identificado, sirve como linea base reproducible para comparar con otros reconocedores hebreos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el caso de ejecucion en CPU; para ejecucion en GPU mediante ONNX Runtime, la memoria necesaria es reducida (modelos moviles de deteccion y reconocimiento cuantizados), aunque no se dispone de cifras exactas.
- GPU recomendadas: no se documentan; el diseno (modelo movil de deteccion + reconocedor INT8) apunta a CPU y a GPU de gama baja.
- GPU de consumo: previsiblemente cabe en cualquier GPU de consumo con soporte ONNX Runtime (GTX 1050 o superior), aunque no hay datos publicados que lo confirmen.
- Despliegue: ONNX Runtime (incluida la variante Web para navegador); compatible con otros runtimes que acepten ONNX, como ONNX Runtime Server u OpenVINO, aunque no se documentan integraciones probadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `joshcarter-eisen/hebrew-handwriting-ocr` | Pipeline OCR (det + rec) | Hebreo manuscrito | MIT (componentes MIT y Apache-2.0) | ONNX | Repositorio de 0,1 GB, sin benchmarks publicados |
| `cyttic/hebrew-ocr-android` | Reconocedor OCR | Hebreo | MIT | No disponible en la informacion | Fuente original del reconocedor `line_int8.onnx` |
| `PaddlePaddle/PP-OCRv5_mobile_det_onnx` | Detector de texto | Multilingue (generico) | Apache-2.0 | ONNX | Fuente original de `det_mobile.onnx`; solo deteccion, no reconocimiento |

No se dispone de datos de rendimiento de ninguno de los tres modelos en la informacion proporcionada, por lo que la comparativa se limita a procedencia, licencia y formato.

## Limitaciones y advertencias

- El repositorio no documenta el modelo de reconocimiento: se desconoce su arquitectura, tamano, datos de entrenamiento y metricas, lo que dificulta evaluar su calidad antes de desplegarlo.
- No hay benchmarks ni evaluaciones publicadas; el rendimiento real sobre manuscritos hebreos es desconocido.
- El reconocedor esta pensado para lineas de texto recortadas; errores en la etapa de deteccion se propagan directamente al reconocimiento.
- Solo se declara hebreo; no hay evidencia de soporte para otros idiomas ni para texto impreso.
- Riesgo de alucinacion y sustituciones de caracteres inherente a los sistemas OCR, especialmente con escritura manuscrita y con `charset.json` limitado al juego de caracteres entrenado.
- Posibles sesgos derivados de la distribucion de los datos de entrenamiento originales de `cyttic/hebrew-ocr-android`, no documentada.
- La licencia MIT del repositorio no elimina las obligaciones de la licencia Apache-2.0 del componente de deteccion de PaddlePaddle; conviene conservar avisos de atribucion en uso comercial.
- El autor indica que los ficheros se usan en una pagina privada; no hay garantia de mantenimiento, soporte ni actualizaciones.
- El repositorio no declara pipeline en Hugging Face, por lo que no puede cargarse directamente con `pipeline()` sin gestion manual de los ficheros ONNX.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/joshcarter-eisen/hebrew-handwriting-ocr
- Fuente del reconocedor: https://huggingface.co/cyttic/hebrew-ocr-android
- Fuente del detector: https://huggingface.co/PaddlePaddle/PP-OCRv5_mobile_det_onnx
