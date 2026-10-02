# manateelazycat/PP-OCRv6-Runtime

## Resumen

PP-OCRv6-Runtime es un repositorio de Hugging Face publicado por el usuario manateelazycat que no contiene pesos de modelo en formato tradicional, sino archivos de runtime preconstruidos para Docker y seis cachés de motores TensorRT en FP16. Está pensado exclusivamente para plataformas NVIDIA Jetson AGX Orin (SM87, Jetson Linux R36.4.3, TensorRT 10.7) y AGX Thor (SM110, Jetson Linux R39.2.0, TensorRT 10.16.2, CUDA 13.2), con version de runtime 0.1.12. Los pesos de los motores derivan de los modelos ONNX PP-OCRv6 Tiny, Small y Medium de PaddlePaddle, publicados bajo licencia Apache-2.0.

PP-OCRv6 es la familia de OCR de producción de PaddlePaddle, lanzada con PaddleOCR 3.7.0 el 11 de junio de 2026, que abarca tres niveles de tamano: tiny (1,5 millones de parametros), small y medium (34,5 millones de parametros). Su innovación principal es la cobertura de 50 idiomas con un único modelo unificado en los niveles medium y small (chino simplificado, chino tradicional, inglés, japonés y 46 lenguas de escritura latina); el nivel tiny cubre 49 idiomas al excluir el japonés.

La relevancia de este repositorio concreto radica en que evita al desarrollador la compilación de motores TensorRT en el propio dispositivo: los archivos Docker y las cachés de motor se han generado previamente para cada plataforma Jetson concreta, lo que simplifica el despliegue de OCR multilingüe en entornos edge. El repositorio ocupa 1,0 GB y registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos PP-OCRv6 (deteccion y reconocimiento de texto) empaquetados como motores TensorRT FP16; arquitectura rediseñada respecto a PP-OCRv5 segun la documentacion de PaddleOCR |
| Parametros totales | 1,5 M (tiny) y 34,5 M (medium) segun la documentacion de PP-OCRv6; el nivel small no tiene cifra disponible en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo OCR, no generativo de texto) |
| Tipos de cuantizacion | FP16 (motores TensorRT); los pesos ONNX originales se descargan aparte |
| Idiomas soportados | 50 idiomas en medium/small (chino simplificado, chino tradicional, ingles, japones y 46 lenguas de escritura latina); tiny 49 (sin japones) |
| Licencia | other para el repositorio; los modelos base PP-OCRv6 son Apache-2.0; las dependencias de runtime conservan sus licencias de terceros, incluidas las de NVIDIA |
| Formato de pesos | Motores TensorRT (cachés FP16) y archivos Docker-load; los pesos ONNX no se incluyen en las imagenes de runtime y se descargan desde PaddlePaddle |

## Arquitectura y entrenamiento

Segun la documentacion de PaddleOCR y el articulo tecnico citado, PP-OCRv6 hereda la metodologia de curacion de datos de PP-OCRv5 e introduce una arquitectura de modelo rediseñada. La familia se organiza en tres niveles de capacidad: tiny, small y medium, con un rango que va de 1,5 a 34,5 millones de parametros. La innovación destacada es la unificacion de 50 idiomas en un único modelo para los niveles medium y small, lo que reduce el coste de mantener variantes por idioma. No se dispone, en la informacion proporcionada, de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO (no aplicables de forma habitual a modelos OCR).

En lo que respecta a este repositorio, la aportacion tecnica no es el entrenamiento sino la optimizacion de despliegue: las seis cachés de motor TensorRT en FP16 se derivan de los modelos ONNX PP-OCRv6 Tiny, Small y Medium y estan vinculadas a una identidad concreta de hardware y de imagen de runtime. El instalador descarga los modelos ONNX oficiales por separado desde PaddlePaddle. El autor advierte que cada caché es especifica de su objetivo de hardware y version de runtime, y que nunca deben mezclarse, verificando tamano y SHA256 antes de importarlas. El archivo `checksums.json` contiene los tamanos y digests SHA256 de los ocho archivos publicados.

## Capacidades

- Deteccion y reconocimiento de texto (OCR) sobre imagenes, integrado en los motores precompilados.
- Cobertura multilingue de 50 idiomas en los niveles medium y small, y 49 en tiny, segun la documentacion de PaddleOCR.
- Despliegue optimizado para inferencia en hardware NVIDIA Jetson AGX Orin y AGX Thor mediante TensorRT en FP16.
- Ejecucion local sin dependencia de servicios en la nube, al distribuirse como imagenes Docker con las dependencias de inferencia incluidas.
- No es un modelo de lenguaje: no ofrece generacion de texto, razonamiento, codigo, matematicas ni capacidades de vision-lenguaje mas alla del OCR.
- No dispone de soporte de tool calling, function calling ni razonamiento multi-paso con agentes.
- No se documentan modos especiales como thinking mode, audio o vision general en la informacion disponible.

## Casos de uso

- Digitalizacion de documentos en el borde: el repositorio permite desplegar OCR multilingüe directamente en un Jetson AGX Orin o Thor sin compilar motores TensorRT, lo que es adecuado para entornos con conectividad limitada o requisitos de privacidad.
- Procesamiento de facturas y formularios en planta: al ejecutarse en hardware embebido con motores FP16 precompilados, se puede integrar en lineas de captura documental donde la latencia y el consumo importan.
- Lectura de carteles y etiquetas multilingues: la cobertura de 50 idiomas en el nivel medium permite reconocer texto en entornos con rotulacion en varios alfabetos sin desplegar modelos separados.
- Extraccion de texto en aplicaciones de robotica movil: los Jetson AGX Orin y Thor son plataformas habituales en robots autonomos, por lo que este runtime encaja en pipelines de percepcion que necesiten leer texto del entorno.
- Reconstruccion de archivos historicos: el nivel medium (34,5 M de parametros) resulta adecuado cuando se prioriza precision sobre huella de memoria en tareas de digitalizacion por lotes.
- Despliegue en dispositivos de bajo consumo: el nivel tiny (1,5 M de parametros) permite ejecutar OCR con una huella minima en plataformas con recursos restringidos, siempre que no se requiera japones.
- Servicios de traduccion asistida en el dispositivo: al obtener texto OCR multilingüe localmente, se puede encadenar con un traductor posterior sin enviar imagenes a un servidor externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de precision, y las fuentes web consultadas describen la cobertura de idiomas y el rango de parametros, pero no aportan cifras concretas de MMLU, HumanEval, GSM8K ni equivalentes para OCR (como precision de deteccion o tasa de error de reconocimiento) que puedan citarse sin riesgo de inventar datos.

## Requisitos de hardware

- Plataforma objetivo 1: NVIDIA Jetson AGX Orin, con Jetson Linux R36.4.3, TensorRT 10.7 y arquitectura SM87.
- Plataforma objetivo 2: NVIDIA Jetson AGX Thor, con Jetson Linux R39.2.0, TensorRT 10.16.2, CUDA 13.2 y arquitectura SM110.
- Los motores TensorRT son especificos de hardware: no estan pensados para ejecutarse en GPUs de escritorio ni en servidores x86 con otras arquitecturas SM.
- El repositorio ocupa 1,0 GB, correspondiente a los archivos Docker-load y las seis cachés de motor FP16; el espacio adicional necesario para los pesos ONNX descargados aparte no se especifica en la informacion disponible.
- Opciones de despliegue: importacion de las imagenes Docker preconstruidas en el dispositivo Jetson correspondiente; los motores ONNX subyacentes tambien pueden desplegarse mediante PaddlePaddle, Hugging Face Transformers u ONNX Runtime segun la documentacion de PP-OCRv6, aunque estas rutas alternativas no forman parte de este repositorio.
- No se dispone de datos de latencia ni throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| PP-OCRv6 tiny (base de este runtime) | 1,5 M | 49 (sin japones) | Apache-2.0 | Nivel de menor huella de la familia |
| PP-OCRv6 small (base de este runtime) | No disponible | 50 | Apache-2.0 | Nivel intermedio, cifra de parametros no disponible |
| PP-OCRv6 medium (base de este runtime) | 34,5 M | 50 | Apache-2.0 | Nivel de mayor capacidad de la familia |
| PP-OCRv6-Runtime (este repositorio) | No aplica (motores TensorRT derivados) | Hereda los idiomas de los modelos base | other (repo); Apache-2.0 en los modelos base | Empaquetado para Jetson AGX Orin y Thor |

No se dispone de datos de rendimiento comparativo con alternativas externas (por ejemplo, otros motores OCR comerciales o de codigo abierto) en la informacion proporcionada, por lo que no se incluyen cifras de precision ni de velocidad.

## Limitaciones y advertencias

- Las cachés de motor estan vinculadas a una identidad concreta de hardware y de version de runtime; mezclar objetivos de hardware o versiones de runtime puede provocar fallos. El autor recomienda verificar tamano y SHA256 antes de importar.
- El repositorio tiene licencia "other"; no relicencia las dependencias de terceros, incluidas las condiciones de licencia de runtime de NVIDIA. Es imprescindible revisar esas condiciones antes de un uso comercial.
- Las imagenes de runtime no incluyen los pesos ONNX; el instalador debe descargarlos por separado desde PaddlePaddle, lo que añade un paso de red y de verificacion.
- Al ser un sistema OCR y no un modelo generativo, no debe evaluarse con benchmarks de razonamiento, codigo o matematicas; sus riesgos se centran en errores de deteccion y reconocimiento de texto.
- La calidad de reconocimiento puede degradarse con imagenes de baja resolucion, texto manuscrito, ruido o tipografias no cubiertas por el conjunto de entrenamiento; no se han publicado tasas de error en la informacion disponible.
- La cobertura linguistica declarada (50 idiomas en medium y small, 49 en tiny) proviene de la documentacion de PaddleOCR para los modelos base, no de una validacion independiente en este repositorio.
- El repositorio registra 0 descargas y 0 likes, y no incluye pipeline declarado en Hugging Face, por lo que su madurez de uso en produccion no esta respaldada por adopcion observable.
- No hay datos publicados sobre sesgos, comportamiento en dominios especificos ni limites de rendimiento en condiciones reales de despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/manateelazycat/PP-OCRv6-Runtime
- Documentacion de PP-OCRv6 en PaddleOCR: https://www.paddleocr.ai/latest/en/version3.x/algorithm/PP-OCRv6/PP-OCRv6.html
- Guia de PP-OCRv6 en Hugging Face: https://explore.n1n.ai/blog/pp-ocrv6-hugging-face-multi-language-ocr-guide-2026-06-22
- Analisis de PP-OCRv6 (aimlinsights): https://aimlinsights.com/2026/06/29/pp-ocrv6-explained-50-language-ocr-from-1-5m-parameters/
- Articulo tecnico de PP-OCRv6 en arXiv: https://arxiv.org/pdf/2606.13108
- Cobertura del lanzamiento (i-am-ai): https://www.imaiblog.com/post/pp-ocrv6-paddlepaddle-ships-50-language-ocr
