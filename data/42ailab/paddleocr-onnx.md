# 42ailab/PaddleOCR-ONNX

## Resumen

PaddleOCR-ONNX (42ailab/PaddleOCR-ONNX) es un repositorio de respaldo que redistribuye seis archivos ONNX correspondientes a los modelos PP-OCRv6 (deteccion y reconocimiento de texto, en variantes small y medium) y PP-DocLayoutV3 (deteccion de layout documental) del proyecto PaddleOCR de Baidu. No se trata de un modelo nuevo ni de una conversion propia del autor del repositorio: los pesos originales fueron entrenados por el equipo PaddlePaddle de Baidu, y la conversion a ONNX la realizo GreatV, autor de oar-ocr, publicada originalmente en su repositorio personal de ModelScope. El repositorio de 42ailab es una copia byte a byte de esos seis archivos, con nombres, tamanos y digests sha256 identicos a los originales.

El objetivo es doble: por un lado, ofrecer una fuente redundante ante la posible desaparicion o reorganizacion del repositorio personal de ModelScope del que dependen estos archivos; por otro, empaquetar los modelos para su uso en la aplicacion de escritorio 42model, que los descarga desde su seccion OCR o mediante el comando `42model download pp-ocrv6:small`. Los modelos estan pensados para ejecutarse en CPU convencional, sin GPU, y cubren el flujo tipico de OCR documental: localizar las regiones de texto, segmentar la pagina por tipos de contenido (titulos, cuerpo, tablas, figuras, formulas) y reconocer el texto respetando el orden de lectura.

El repositorio ocupa 0,3 GB y esta bajo licencia Apache-2.0, heredada del proyecto PaddleOCR original. Los idiomas declarados son chino (zh) e ingles (en). No se dispone de informacion sobre parametros, longitud de contexto ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelos PaddleOCR PP-OCRv6 y PP-DocLayoutV3 exportados a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision para OCR y layout, no modelos de lenguaje) |
| Tipos de cuantizacion | no disponible (los archivos distribuidos son ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`) mas diccionario de reconocimiento en texto plano (`ppocrv6_dict.txt`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de los modelos. Por el nombre y el ecosistema de procedencia (PaddleOCR), PP-OCRv6 corresponde a la familia de modelos de OCR de PaddlePaddle, que combina un modulo de deteccion de texto (localizacion de cajas de texto en la imagen) y un modulo de reconocimiento (transcripcion del contenido de cada caja), ambos exportados como grafos ONNX independientes. PP-DocLayoutV3 es un modelo de deteccion de layout que segmenta la pagina en regiones semanticas (titulos, cuerpo de texto, tablas, figuras y formulas) para que el reconocedor sepa que leer y en que orden.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas. Los pesos originales fueron entrenados por el equipo de PaddleOCR de Baidu; la conversion a ONNX la realizo GreatV (oar-ocr), y este repositorio es unicamente una copia de respaldo sin modificaciones, verificable mediante los digests sha256 listados en la model card.

Los seis archivos que componen el repositorio son:

| Archivo | Funcion | Tamano |
|---|---|---:|
| `pp-ocrv6_small_det.onnx` | deteccion de texto (small) | 9,4 MiB |
| `pp-ocrv6_small_rec.onnx` | reconocimiento de texto (small) | 20,2 MiB |
| `pp-ocrv6_medium_det.onnx` | deteccion de texto (medium) | 59,2 MiB |
| `pp-ocrv6_medium_rec.onnx` | reconocimiento de texto (medium) | 73,0 MiB |
| `ppocrv6_dict.txt` | diccionario de reconocimiento (compartido) | 73 KiB |
| `pp-doclayoutv3.onnx` | deteccion de layout documental | 123,9 MiB |

## Capacidades

- Deteccion de texto en imagenes: localiza las regiones que contienen texto mediante los modelos `det` (small o medium).
- Reconocimiento de texto: transcribe el contenido de las regiones detectadas mediante los modelos `rec` (small o medium), usando el diccionario compartido `ppocrv6_dict.txt`.
- Deteccion de layout documental: segmenta una pagina en regiones semanticas como titulos, cuerpo de texto, tablas, figuras y formulas con PP-DocLayoutV3.
- Ordenacion de lectura: el layout permite al reconocedor saber que leer y en que orden dentro de la pagina.
- Ejecucion en CPU: los modelos estan disenados para funcionar en un procesador convencional, sin requerir GPU.
- Idiomas: chino e ingles, segun los metadatos del repositorio.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento; son modelos especializados de OCR y layout, no modelos generativos de proposito general.

## Casos de uso

- Digitalizacion de documentos escaneados: aplicar PP-DocLayoutV3 para segmentar la pagina y, a continuacion, PP-OCRv6 (det + rec) sobre cada region de texto para obtener una transcripcion estructurada con orden de lectura correcto.
- Extraccion de texto de facturas y formularios: el layout separa cabeceras, cuerpo y tablas, lo que permite dirigir el reconocimiento a las zonas relevantes y reconstruir campos de forma mas fiable que un OCR de pagina completa.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en CPU y en formato ONNX, los modelos pueden desplegarse en entornos donde no hay aceleradores dedicados, con la variante small para priorizar velocidad y la medium para priorizar precision.
- Integracion en aplicaciones de escritorio: el paquete esta preparado para la app 42model, que descarga los modelos desde su seccion OCR o mediante `42model download pp-ocrv6:small`, lo que facilita incorporar OCR local sin dependencias de red.
- Pipeline de ingestion de documentos para busqueda: combinar layout y OCR para convertir PDFs e imagenes en texto indexable, preservando la estructura de secciones y tablas.
- Analisis de documentos tecnicos y academicos: PP-DocLayoutV3 identifica figuras y formulas como regiones separadas, lo que permite tratar el texto corrido de forma independiente y evitar mezclar contenido no textual en la transcripcion.
- Traduccion o revision asistida de documentos bilingues chino-ingles: el reconocimiento cubre ambos idiomas declarados, lo que permite extraer el texto original antes de pasarlo a un sistema de traduccion o correccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecucion en CPU; no se dispone de estimaciones de VRAM para ejecucion en GPU.
- GPU recomendadas: no disponible; los modelos estan disenados para CPU convencional.
- Compatibilidad con GPU de consumo: no documentada. El formato ONNX permite en principio ejecucion con aceleracion por hardware, pero no se proporcionan datos al respecto.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio); integracion mediante la aplicacion 42model y su comando `42model download pp-ocrv6:small`. No se documentan otras integraciones (vLLM, llama.cpp, Ollama, TGI) para estos modelos.
- Latencia y throughput: no disponibles.
- Huella en disco: el repositorio completo ocupa 0,3 GB; la variante small de deteccion y reconocimiento suma aproximadamente 29,6 MiB, y el modelo de layout 123,9 MiB.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| PaddleOCR-ONNX (este repositorio) | OCR + layout (PP-OCRv6, PP-DocLayoutV3) | zh, en | ONNX | Apache-2.0 | Copia de respaldo de la conversion de GreatV; ejecucion en CPU |
| PaddleOCR original (PaddlePaddle) | OCR + layout | zh, en (y otros segun variante) | Pesos PaddlePaddle | Apache-2.0 | Fuente upstream de los pesos; requiere el framework Paddle |
| oar-ocr (GreatV) | OCR | no disponible | ONNX | no disponible | Repositorio original de la conversion ONNX de la que proceden estos archivos |
| Tesseract OCR | OCR | Multiples | Propio | Apache-2.0 | Alternativa clasica de OCR en CPU; no incluye deteccion de layout documental equivalente en el mismo paquete |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: el repositorio es una copia byte a byte de seis archivos ONNX convertidos por un tercero (GreatV, oar-ocr) a partir de los pesos oficiales de PaddleOCR. Cualquier problema de conversion debe atribuirse al origen, no a este repositorio.
- Cobertura linguistica limitada a chino e ingles segun los metadatos; no se garantiza el rendimiento en otros idiomas.
- No se dispone de informacion sobre sesgos, tasas de alucinacion o errores de reconocimiento en dominios especificos (manuscrito, baja resolucion, documentos degradados).
- La licencia Apache-2.0 se hereda del proyecto PaddleOCR; el repositorio incluye el texto completo en su archivo `LICENSE` (copyright PaddlePaddle Authors). No existe un archivo NOTICE separado ni en PaddleOCR ni en los repositorios oficiales de PaddlePaddle.
- Dependencia de un unico origen historico: la motivacion del respaldo es precisamente que los seis archivos provenian de un unico repositorio personal en ModelScope; conviene verificar los digests sha256 antes de usar los archivos en produccion.
- No se documentan procesos de cuantizacion, versiones minimas de ONNX Runtime ni requisitos de preprocesado/postprocesado, lo que puede complicar la integracion fuera del ecosistema 42model.
- Al ser modelos de vision especializados, no ofrecen generacion de texto, razonamiento, tool calling ni capacidades de agente; no deben evaluarse con los criterios habituales de un LLM.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/42ailab/PaddleOCR-ONNX
- Repositorio en ModelScope: https://modelscope.cn/models/42ailab/PaddleOCR-ONNX
- Sitio del autor del respaldo: https://42ailab.com
- Aplicacion 42model: https://42model.com
- Repositorio original de la conversion ONNX (GreatV, oar-ocr): https://www.modelscope.cn/models/greatv/oar-ocr
- Codigo de oar-ocr en GitHub: https://github.com/greatv/oar-ocr
- Proyecto PaddleOCR (Baidu): https://github.com/PaddlePaddle/PaddleOCR
