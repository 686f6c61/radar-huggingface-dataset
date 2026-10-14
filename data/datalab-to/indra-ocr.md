# datalab-to/indra-ocr

## Resumen

Indra OCR es un modelo de reconocimiento optico de caracteres (OCR) desarrollado por Datalab, un laboratorio de investigacion especializado en modelos de inteligencia documental. A diferencia de los OCR basados en transformers de gran tamano, Indra OCR es un modelo extremadamente compacto: su reconocedor principal (`rec.onnx`) tiene alrededor de 1 millon de parametros y el conjunto completo de pesos ocupa unos 18 MB en formato ONNX. Esta disenado para ejecutarse en CPU, sin necesidad de PyTorch ni de GPU.

El modelo resuelve el problema de convertir PDFs e imagenes en markdown, texto plano o JSON estructurado, incluyendo cuadros delimitadores (bounding boxes) por linea y por bloque de maquetacion, etiquetas de bloque (encabezados, listas, tablas, pies de figura, notas al pie, cabeceras de pagina) y orden de lectura. Su propuesta de valor es la velocidad: alcanza 49 paginas por segundo en CPU, entre 11 y 17 veces mas rapido que Tesseract y PaddleOCR sobre las mismas paginas y maquina, con una latencia de unos 230 ms por pagina en 4 vCPU x86.

Es relevante ahora porque demuestra que un modelo de menos de 20 MB puede superar en precision a referencias clasicas de OCR en la tarea de extraccion de texto, con 41,3 puntos en OmniParseBench text frente a los 35,8 de los modelos PP-OCR de PaddleOCR y los 19,3 de Tesseract. Su licencia es una OpenRAIL-M modificada, con codigo Apache 2.0, y soporta 15 idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deteccion de lineas y reconocimiento CTC (redes ONNX, no transformer generativo) |
| Parametros totales | Aproximadamente 1 millon en el reconocedor principal (`rec.onnx`); unos 18 MB de pesos en total |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (procesa documento o pagina a pagina, no es un modelo autoregresivo de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, frances, aleman, espanol, italiano, portugues, neerlandes, polaco, ruso, ucraniano, griego, hindi, bengali, chino |
| Licencia | OpenRAIL-M modificada (pesos); codigo Apache 2.0 |
| Formato de pesos | ONNX |
| Pipeline | image-to-text |
| Tamano del repositorio | 0,0 GB en Hugging Face (los pesos se descargan aparte, unos 18 MB) |
| Requisitos de ejecucion | Python 3.10 o superior, ONNX Runtime, OpenCV, pypdfium2 (sin PyTorch) |

## Arquitectura y entrenamiento

Indra OCR no es un modelo de lenguaje multimodal ni un transformer generativo. Segun la documentacion disponible, combina una etapa de deteccion de lineas de texto con un reconocedor basado en CTC (Connectionist Temporal Classification) que se ejecuta sobre ONNX Runtime. El reconocedor principal es `rec.onnx`, con alrededor de 1 millon de parametros, y el conjunto de modelos suma unos 18 MB, lo que permite su despliegue en CPU sin dependencias de PyTorch. La salida incluye las lineas detectadas, sus cuadros delimitadores, las confidencias asociadas y los bloques de maquetacion con sus etiquetas y el orden de lectura.

En cuanto al entrenamiento, no se han publicado en la informacion disponible datos sobre el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Lo que si se documenta es una innovacion funcional destacable: para PDFs digitales, el modelo lee la capa de texto propia del PDF en cualquier sistema de escritura y aplica OCR unicamente a lo que falta, lo que reduce el trabajo efectivo por pagina. No se dispone de informacion sobre la composicion del dataset de entrenamiento ni sobre el proceso de anotacion.

## Capacidades

- Extraccion de texto (OCR) de PDFs e imagenes, con salida en markdown, texto plano o JSON.
- Deteccion de maquetacion con un cuadro delimitador por linea y por bloque, con etiquetas de bloque: encabezados, listas, tablas, pies de figura, notas al pie, cabeceras y pies de pagina.
- Orden de lectura explicito, lo que permite reconstruir documentos con varias columnas.
- Manejo de paginas rotadas, incluidas las escaneadas boca abajo.
- Salida de tablas en HTML con sus titulos, segun los ejemplos publicados.
- Lectura de la capa de texto de PDFs digitales en cualquier sistema de escritura y OCR selectivo solo sobre lo ausente.
- Soporte multilingue declarado para 15 idiomas.
- Salida JSON con lineas, cajas, bloques de maquetacion, confidencias y tiempos de ejecucion.
- Modo OCR forzado (`--mode ocr`) que ignora la capa de texto y procesa todas las paginas.
- Visor web local para inspeccion de resultados (`indra-ocr-viewer`, en http://localhost:8765).
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento (no aplica a un modelo OCR).

## Casos de uso

- Digitalizacion masiva de archivos documentales: con 49 paginas por segundo en CPU, un servidor de 4 vCPU puede procesar cientos de miles de paginas al dia, adecuado para bibliotecas, archivos historicos y fondos documentales de gran volumen.
- Construccion de pipelines RAG sobre documentos corporativos: la salida en markdown con bloques etiquetados y orden de lectura facilita la fragmentacion (chunking) coherente antes de indexar en una base vectorial, algo critico cuando los PDFs tienen varias columnas o tablas.
- Extraccion estructurada de facturas y formularios: el JSON con cajas, confidencias y etiquetas de bloque permite mapear campos a un esquema de datos y marcar las extracciones de baja confianza para revision manual.
- Procesamiento de documentos en entornos sin GPU: al ejecutarse solo con ONNX Runtime y ocupar unos 18 MB, es viable en servidores modestos, contenedores ligeros y despliegues en el borde sin acelerador.
- Preprocesado de corpus para entrenamiento o evaluacion de LLM: convierte grandes colecciones de PDFs a texto y markdown limpios con bajo coste computacional, como etapa previa a la curacion de datos.
- Conservacion y acceso en museos y archivos: las capacidades de orden de lectura y manejo de paginas rotadas permiten digitalizar materiales escaneados con orientaciones irregulares y conservar la estructura del original.
- Revision documental automatizada en sectores regulados: la salida con confidencias por linea permite construir umbrales de calidad y derivar a revision humana los fragmentos dudosos, sin depender de servicios en la nube.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre OmniParseBench (puntuacion de texto y puntuacion principal del pipeline):

| Modelo | OmniParseBench text | Puntuacion principal |
|---|---|---|
| Indra OCR | 41,3 | 62,1 |
| PaddleOCR PP-OCR (modelos de texto) | 35,8 | No disponible |
| PaddleOCR PP-StructureV3 (pipeline completo) | No disponible | 58,4 |
| Tesseract | 19,3 | No disponible |

Rendimiento declarado:

| Metrica | Valor |
|---|---|
| Throughput | 49 paginas/s en la misma maquina que Tesseract y PaddleOCR |
| Aceleracion frente a Tesseract y PaddleOCR | 11-17x en throughput |
| Latencia por pagina | ~230 ms en 4 vCPU x86 |
| Aceleracion de latencia | 12-24x frente a Tesseract y PaddleOCR |

No se han publicado en la informacion disponible resultados de benchmarks adicionales como MMLU, HumanEval o GSM8K, que ademas no aplican a un modelo OCR.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; se ejecuta en CPU con ONNX Runtime.
- GPU recomendadas: no aplica, no se documenta soporte de aceleracion por GPU.
- CPU: probado con 4 vCPU x86, con una latencia de aproximadamente 230 ms por pagina y un throughput de 49 paginas por segundo en el conjunto de prueba del autor.
- Memoria: el conjunto de modelos ocupa unos 18 MB, por lo que la huella de memoria esta dominada por el almacenamiento en buffer de las imagenes de pagina y no por los pesos.
- Cabe en cualquier equipo de consumo, incluidos portatiles y equipos de gama baja, al no requerir GPU dedicada.
- Opciones de despliegue: paquete `indra-ocr` via pip (Python 3.10+), ONNX Runtime, integracion por CLI, visor web local. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: hasta 49 paginas/s en CPU; 230 ms por pagina en 4 vCPU x86; procesamiento de todas las paginas del documento en caso de usar el modo OCR forzado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | Licencia | Rendimiento (OmniParseBench text) |
|---|---|---|---|---|---|
| Indra OCR | OCR con deteccion de lineas y CTC | ~1 M (reconocedor) | CPU, ONNX, 18 MB | OpenRAIL-M modificada | 41,3 (texto), 62,1 (principal) |
| Tesseract | OCR clasico con LSTM | No disponible | CPU | Apache 2.0 | 19,3 |
| PaddleOCR PP-OCR | OCR basado en deteccion y reconocimiento | No disponible | CPU/GPU | Apache 2.0 | 35,8 |
| PaddleOCR PP-StructureV3 | Pipeline completo de analisis documental | No disponible | CPU/GPU | Apache 2.0 | No disponible (principal: 58,4) |
| Chandra (Datalab) | OCR de alta precision | No disponible | Plataforma gestionada | No disponible | No disponible |

La comparacion se limita a los datos publicados por el autor de Indra OCR. No se dispone de cifras de parametros, contexto ni latencia para Tesseract, PaddleOCR o Chandra en la informacion proporcionada.

## Limitaciones y advertencias

- No se documenta un rendimiento fiable en escritura manuscrita, formulas matematicas, tablas complejas ni escaneos degradados; el propio autor recomienda su modelo Chandra, en plataforma gestionada, para esos casos.
- La model card no detalla sesgos conocidos ni limitaciones por idioma mas alla de la lista de lenguas soportadas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de errores de reconocimiento de caracteres, especialmente con baja calidad de imagen; la salida incluye confidencias por linea para poder filtrarlas.
- La licencia de los pesos es una OpenRAIL-M modificada: es gratuita para investigacion, uso personal y startups con menos de 20 millones de dolares en financiacion o ingresos, y no puede usarse de forma competitiva con la API de Datalab. Para otros usos comerciales es necesario un acuerdo de licencia de pago.
- El codigo asociado se distribuye bajo Apache 2.0, pero esa licencia no cubre los pesos del modelo.
- No se documentan variantes cuantizadas ni soporte de GPU, lo que limita el escalado horizontal a traves de CPU y el despliegue en aceleradores.
- El modelo requiere Python 3.10 o superior y descarga los pesos desde Hugging Face en la primera ejecucion, salvo que se configure un directorio local mediante `INDRA_OCR_MODEL_DIR` o `--model-dir`.
- Los datos de fecha de creacion y actualizacion del repositorio en Hugging Face (octubre de 2026) y el contador de descargas (0) deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/datalab-to/indra-ocr
- Repositorio en GitHub: https://github.com/datalab-to/indra
- Ejemplos de salida: https://github.com/datalab-to/indra/blob/main/EXAMPLES.md
- Licencia de los pesos: https://huggingface.co/datalab-to/indra-ocr/blob/main/LICENSE
- Blog de presentacion: https://www.datalab.to/blog/indra-ocr
- OmniParseBench: https://github.com/datalab-to/omni_parse_bench
- Modelo Chandra: https://github.com/datalab-to/chandra
- Documentacion: https://documentation.datalab.to
- Web de Datalab: https://www.datalab.to
- Playground: https://www.datalab.to/playground
- Precios y licencias comerciales: https://www.datalab.to/pricing
- Discord: https://discord.gg/KuZwXNGnfH
- Articulo de terceros sobre el modelo: https://dev48.org/en/articles/indra-ocr-a-1m-parameter-ocr-model-that-reads-49-pages-per-second-on-cpu
