# psikosen/t-rsi-ocr

## Resumen

T-RSI Fast Reflex OCR (`psikosen/t-rsi-ocr`) es un motor de reconocimiento optico de caracteres (OCR) experimental publicado por el usuario psikosen en Hugging Face. Se presenta como un modelo "machine-native" disenado para eficiencia extrema en memoria y latencia, con una huella declarada de unos 494 KB de RAM en tiempo de ejecucion y una latencia de decision de 1,9 ms. Su arquitectura combina un transformer BitNet ternario de 1,58 bits con un tokenizador visual de parches de linea (scanline patch) y un decodificador CTC voraz.

El modelo es relevante por su enfoque radical de cuantizacion: los pesos toman valores en {-1, 0, +1} y la inferencia declarada se ejecuta unicamente con sumas y restas enteras, sin multiplicaciones en punto flotante. Con 395.904 parametros totales (aproximadamente 0,4 millones), un fichero `model.safetensors` de 590 KB y una representacion empaquetada a 2 bits de 80 KB, el objetivo declarado es desplegar OCR completo en microcontroladores, runtimes embebidos y WebAssembly.

Se trata de un lanzamiento de investigacion preliminar: el propio autor advierte de que los resultados de benchmark no deben considerarse fiables hasta que una fuente independiente los verifique, y el repositorio no cuenta con descargas ni valoraciones de la comunidad. La licencia es MIT y no se declaran idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BitNet ternario de 1,58 bits (2 capas de atencion multi-cabeza y FFN) con tokenizador visual de parches de linea y decodificador CTC voraz |
| Parametros totales | 395.904 (aproximadamente 0,4 millones) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa parches de 32 x 8 pixeles) |
| Tipos de cuantizacion | Pesos ternarios {-1, 0, +1} a 1,58 bits; activaciones cuantizadas a 8 bits con AbsMax; empaquetado binario de 2 bits (4 pesos ternarios por byte) |
| Idiomas soportados | No disponible (vocabulario de 256 tokens OCR y caracteres ASCII) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 590 KB) y binario empaquetado a 1,58 bits (`weights_packed_1.58bit.bin`, 80 KB) |

## Arquitectura y entrenamiento

La arquitectura se articula en cuatro piezas declaradas por el autor. Primero, un tokenizador visual que divide las lineas de texto de documentos 2D en parches de barrido de 32 x 8 pixeles y los proyecta a vectores latentes de 128 dimensiones mediante capas BitLinear ternarias. Segundo, un transformer BitNet sin multiplicaciones de 2 capas, con atencion multi-cabeza y red feed-forward, pesos ternarios y cuantizacion de activaciones AbsMax de 8 bits. Tercero, un decodificador CTC voraz para producir la secuencia de caracteres. Cuarto, un "grafo de memoria causal" que almacena pares de errores de caracteres y hashes de plantillas verificadas para recuperacion instantanea.

El repositorio incluye el pipeline de entrenamiento y exportacion (`train_bitnet_ocr.py`), la arquitectura en PyTorch con cuantizacion ternaria mediante Straight-Through Estimator (`model_architecture.py`), el motor de ejecucion (`engine.py`) y utilidades de empaquetado a 2 bits (`packing_utils.py`). No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones; tampoco se detalla el esquema de aprendizaje ni la duracion del entrenamiento.

## Capacidades

- Reconocimiento optico de caracteres sobre imagenes de documentos, con salida de texto y metrica de latencia y RAM por inferencia.
- Procesamiento de lineas de texto mediante parches de barrido de 32 x 8, orientado a documentos con estructura de lineas (facturas, tickets, formularios simples).
- Inferencia aritmetica entera: sumas y restas, sin multiplicaciones en punto flotante, segun la documentacion del autor.
- Ejecucion en entornos de recursos muy limitados: microcontroladores, runtimes embebidos y WebAssembly, gracias al empaquetado de 2 bits de 80 KB.
- Recuperacion de errores mediante grafo de memoria causal con pares de errores de caracteres y hashes de plantillas verificadas.
- Motor de prueba interactivo con HUD de telemetria y shell de decisiones en terminal (`live_interactive_test.py`), que permite benchmarks, reconocimiento de texto renderizado al vuelo e imagenes.
- No se declara soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision general (mas alla de la lectura de texto), audio ni modo de pensamiento.
- No se declaran capacidades multilingues; el vocabulario se limita a 256 tokens OCR y caracteres ASCII.

## Casos de uso

- OCR en microcontroladores y dispositivos embebidos: con 494 KB de RAM maxima declarada y un fichero empaquetado de 80 KB, el modelo puede ejecutarse en placas con memoria muy restringida donde Tesseract o PaddleOCR no caben.
- Lectura de documentos en el navegador mediante WebAssembly: el empaquetado de 2 bits y la aritmetica entera permiten procesar imagenes en el cliente sin enviar documentos a un servidor, lo que reduce coste y mejora la privacidad.
- Prefiltrado en cascadas de OCR: usar el motor como primera etapa de bajo coste para descartar o clasificar regiones de documento antes de invocar un modelo de OCR mayor, reduciendo el coste computacional del pipeline.
- Digitalizacion de tickets y facturas simples: la prueba incluida en el repositorio (`sample_images/simple_invoice.png`) apunta a documentos con lineas cortas y estructura predecible, como totales y conceptos.
- Automatizacion industrial con restriccion energetica: al no requerir GPU ni multiplicaciones en punto flotante, es candidato para sensores o terminales de captura alimentados por bateria.
- Validacion y verificacion rapida en pipelines de ingestion de documentos: el grafo de memoria causal con hashes de plantillas verificadas permite contrastar lecturas recurrentes de formularios con formato fijo.
- Demostraciones y docencia sobre cuantizacion ternaria: el repositorio incluye el pipeline completo de entrenamiento y empaquetado a 2 bits, util para experimentar con BitNet en un caso de vision reducido.
- Telemetria de latencia en produccion: la API devuelve microsegundos y KB de RAM por llamada, lo que facilita el registro de metricas de rendimiento por documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de metricas de OCR como precision por caracter o tasa de error de palabra (WER/CER), ni comparaciones con Tesseract, PaddleOCR o TrOCR. El autor advierte explicitamente de que no deben confiarse los resultados de benchmark hasta que una fuente secundaria los verifique de forma independiente.

Las unicas cifras disponibles son metricas operativas declaradas por el propio autor, no verificadas:

| Metrica | Valor declarado | Nota |
|---|---|---|
| Huella de RAM maxima | ~494 KB | No verificada de forma independiente |
| Latencia de decision | 1,9 ms | No verificada; medida en Apple Silicon M-Series con 128 GB de RAM unificada |
| Aritmetica | Sumas y restas enteras, sin multiplicaciones en punto flotante | Declarado por el autor |
| Tamano de `model.safetensors` | 590 KB | Coherente con 395.904 parametros |
| Tamano de `weights_packed_1.58bit.bin` | 80 KB | 4 pesos ternarios por byte |
| Entorno de evaluacion | Apple Silicon M-Series, 128 GB de RAM unificada | Unico entorno reportado |
| Precision de OCR (CER/WER) | No disponible | No se publican metricas de calidad de reconocimiento |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la practica; el modelo se ejecuta en CPU con una huella declarada de ~494 KB de RAM. Con pesos ternarios de 395.904 parametros, la memoria de pesos sin empaquetar ronda los 0,4 MB.
- GPU recomendadas: no se requiere GPU. Cualquier GPU de consumo (por ejemplo, una RTX 4090) seria ampliamente suficiente, aunque innecesaria.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en hardware sin GPU, segun el diseno declarado.
- Hardware alternativo: microcontroladores, runtimes embebidos y WebAssembly, gracias al empaquetado binario de 2 bits de 80 KB.
- Opciones de despliegue: motor propio `engine.py` y `FastReflexOCREngine.from_pretrained(...)`; script de prueba en vivo `live_interactive_test.py`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput estimados: 1,9 ms de latencia de decision segun el autor; no disponible el throughput en documentos por segundo. Ambas cifras carecen de verificacion independiente y se midieron solo en Apple Silicon M-Series.
- Entorno de referencia reportado: Apple Silicon M-Series con 128 GB de RAM unificada.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Formatos | Despliegue |
|---|---|---|---|---|---|---|
| psikosen/t-rsi-ocr | OCR BitNet ternario experimental | 395.904 | No aplica (parches de 32 x 8) | MIT | safetensors, binario empaquetado 2 bits | Motor propio, MCU, WASM |
| Tesseract | OCR clasico con LSTM | No disponible en la informacion proporcionada | No aplica | Permisiva (verificar en el repositorio oficial del proyecto) | Pesos propios | CPU, libreria nativa |
| PaddleOCR | OCR profundo (deteccion + reconocimiento) | No disponible en la informacion proporcionada | No aplica | Permisiva (verificar en el repositorio oficial del proyecto) | Pesos propios, exportacion a inference model | CPU y GPU, PaddlePaddle |
| TrOCR | OCR transformer (encoder de vision + decoder de texto) | No disponible en la informacion proporcionada | No disponible | Permisiva (verificar en el repositorio oficial del proyecto) | safetensors / PyTorch | PyTorch, Transformers, ONNX |

No se dispone de datos de rendimiento comparables entre estas alternativas y el modelo analizado: no hay metricas de CER o WER publicadas para `t-rsi-ocr`, y el autor desaconseja tomar sus cifras como referencia hasta que exista validacion independiente.

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte de que no deben confiarse los resultados de benchmark hasta que una fuente secundaria los verifique.
- Sin validacion de la comunidad: 0 descargas y 0 me gusta en el momento de la consulta.
- Evaluacion limitada a un unico entorno (Apple Silicon M-Series, 128 GB de RAM unificada); el autor exige benchmarks independientes en conjuntos de documentos mas amplios antes de un despliegue en produccion.
- Capacidad muy reducida: 2 capas y aproximadamente 0,4 millones de parametros, lo que limita el modelo a lineas de texto simples y estructuras predecibles.
- Idiomas no declarados y vocabulario restringido a 256 tokens OCR y caracteres ASCII: es esperable un mal comportamiento con acentos, diacriticos, alfabetos no latinos (cirilico, arabe, CJK) y simbolos no ASCII.
- Riesgo de alucinacion en OCR: se manifiesta como sustitucion, insercion u omision de caracteres, especialmente en documentos con ruido, rotaciones o tipografias no vistas.
- No se publican metricas de calidad de reconocimiento (CER, WER) ni tamanos del dataset de entrenamiento, numero de tokens o composicion, lo que impide estimar la cobertura real.
- Ausencia de integracion con el ecosistema estandar: no hay version GGUF, ni soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que obliga a usar el motor propietario del repositorio.
- Licencia MIT: permite uso comercial y modificacion, pero se ofrece sin garantias de ningun tipo y sin responsabilidad del autor.
- Marcas temporales del repositorio (creacion y actualizacion el 17/09/2026, con dos segundos de diferencia) y tamano de repositorio declarado de 0,0 GB, en contraste con los ficheros listados; conviene verificar la integridad real de los artefactos antes de usarlos.
- No se documenta el soporte de imagenes de pagina completa; la unidad de entrada parece ser la linea de texto o el parche de barrido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/psikosen/t-rsi-ocr
- La busqueda web realizada no ha devuelto resultados relacionados con el modelo. Los unicos resultados obtenidos corresponden al portal aleman ZDFmediathek (https://www.zdf.de/, https://www.zdf.de/filme) y no guardan relacion con este modelo. No se han encontrado papers, blogs, repositorios ni demos asociados en la informacion disponible.
