# Seoul12/khmer-ocr-three-architectures

## Resumen

Khmer OCR three architectures es una coleccion de tres checkpoints de reconocimiento optico de caracteres (OCR) especializados en texto jemer (khmer, codigo de idioma `km`) a nivel de linea. El autor, Seoul12, recupera y publica tres aproximaciones entrenadas sobre datos identicos: una red CNN + BiLSTM + CTC (paso 58.000), una CNN + BiGRU + CTC (paso 8.500) y una CNN + Transformer Encoder + CTC (paso 87.000). El modelo resuelve la transcripcion de una imagen recortada de una linea de texto jemer a su secuencia de caracteres, un problema relevante porque el jemer es una escritura compleja, sin espacios entre palabras y con una comunidad de herramientas OCR comparativamente reducida.

El repositorio tiene un tamano de 0,1 GB e incluye un cuaderno (`Compare_Models.ipynb`) pensado para ejecutarse en Google Colab sin GPU ni cuenta de Hugging Face. Los checkpoints contienen pesos y metadatos, pero se han eliminado los estados del optimizador y del generador de numeros aleatorios, por lo que estan pensados para inferencia e inicializacion de pesos, no para reanudar un entrenamiento exacto.

Es relevante ahora porque ofrece pesos ligeros y ejecutables en CPU para una tarea con poca oferta de modelos abiertos, y porque el propio autor documenta de forma explicita las limitaciones de su evaluacion, evitando presentar los resultados del cuaderno como una clasificacion justa entre arquitecturas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres variantes: CNN + BiLSTM + CTC; CNN + BiGRU + CTC; CNN + Transformer Encoder + CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada de imagen de una linea de texto, sin contexto de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | jemer (km) |
| Licencia | no disponible (el autor no afirma licencia sobre pesos ni datos de entrenamiento) |
| Formato de pesos | checkpoints de PyTorch (pesos y metadatos; formato de fichero exacto no disponible) |

## Arquitectura y entrenamiento

Las tres variantes comparten un extractor de caracteristicas convolucional (CNN) que procesa la imagen de la linea de texto y producen una secuencia que se decodifica mediante CTC (Connectionist Temporal Classification), lo que permite alinear imagenes y transcripciones sin segmentacion explicita a nivel de caracter. La diferencia entre variantes esta en la capa recurrente o de atencion sobre las caracteristicas: una emplea una BiLSTM, otra una BiGRU y la tercera un encoder Transformer. Los pasos de entrenamiento publicados son 58.000 para la BiLSTM, 8.500 para la BiGRU y 87.000 para el Transformer Encoder.

No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni sobre el uso de tecnicas de RLHF o DPO, que no aplican en un pipeline OCR de este tipo. El autor indica que los datos de demostracion proceden del split de validacion de `Chanrith123333/khmer_english_ocr_image_line` (CC BY 4.0), con conversion a PNG en escala de grises y etiquetas normalizadas. Se menciona un preprocesado compartido con normalizacion NFC y ajuste de anchura redondeada, que puede diferir del preprocesado original de las variantes recurrentes. El autor advierte ademas que las variantes A1/A2/A3 del repositorio antiguo `khmerOCR` no coinciden con los nombres de estas tres arquitecturas.

## Capacidades

- Reconocimiento de texto jemer a nivel de linea a partir de una imagen recortada, devolviendo la secuencia de caracteres.
- Procesamiento de imagenes en escala de grises con etiquetas normalizadas (NFC, anchura redondeada).
- Ejecucion de inferencia en CPU, sin necesidad de GPU ni de cuenta en Hugging Face.
- Carga estricta de pesos verificada por el autor en las tres variantes.
- Comparacion de las tres arquitecturas dentro de un mismo cuaderno de Colab.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento (thinking mode); el modelo esta limitado a la tarea OCR.
- Capacidad multilingue: no disponible; el unico idioma declarado es el jemer.

## Casos de uso

- Digitalizacion de documentos historicos en jemer: el modelo transcribe lineas de manuscritos o impresos escaneados, lo que permite indexar y buscar en archivos que hoy solo existen como imagen.
- Extraccion de texto en aplicaciones moviles sin conexion: al ejecutarse en CPU, puede integrarse en una app Android o iOS para reconocer carteles, menus o documentos jemer sin depender de la nube.
- Preprocesado de pipelines de traduccion jemer: la salida de texto del OCR puede alimentar un traductor automatico jemer a otro idioma dentro de un flujo documental.
- Procesamiento por lotes de formularios y facturas en jemer: la arquitectura por lineas permite segmentar un documento en lineas y transcribirlas secuencialmente en un servidor modesto.
- Investigacion en OCR de escrituras de baja representacion: las tres variantes sirven como linea base reproducible para comparar CNN + recurrente frente a CNN + Transformer en jemer.
- Preservacion cultural y linguistica: digitalizacion de textos jemer para corpus y archivos abiertos, aprovechando que los pesos son ligeros (el repositorio completo ocupa 0,1 GB).
- Prototipado rapido en Colab: el cuaderno permite visualizar imagenes, respuestas esperadas y predicciones sin infraestructura adicional, util para docencia o validacion inicial.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles son los del cuaderno de demostracion, sobre 20 imagenes impresas seleccionadas de un conjunto de 40 ejemplos de validacion filtrados. El autor advierte de forma explicita que esta seleccion no constituye una clasificacion justa ni una medida de exactitud general.

| Modelo (variante) | Aciertos en el conjunto de demostracion (20 imagenes) |
|---|---|
| CNN + Transformer Encoder + CTC | 20/20 |
| CNN + BiLSTM + CTC | 14/20 |
| CNN + BiGRU + CTC | 6/20 |

El autor senala que los valores de CER de validacion almacenados proceden de procedimientos de validacion distintos y que el preprocesado compartido (NFC y anchura redondeada) puede diferir del usado en el entrenamiento original de las variantes recurrentes. Recomienda usar un conjunto de validacion independiente y representativo con el preprocesado validado de cada modelo para obtener una comparacion fiable. No se han publicado resultados en MMLU, HumanEval, GSM8K ni en benchmarks OCR estandar (OCRBench, DocVQA, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0,1 GB, por lo que los checkpoints individuales son muy ligeros y no deberian requerir aceleracion dedicada.
- GPU recomendadas: no disponible; el autor verifico la inferencia en CPU, por lo que no se requiere GPU.
- Compatibilidad con GPU de consumo: los pesos son lo bastante pequenos (0,1 GB en total) para caber con holgura en cualquier GPU de consumo, e incluso en memoria de sistema para inferencia en CPU. No se especifican cifras concretas de VRAM.
- Opciones de despliegue: inferencia en PyTorch en CPU o GPU; cuaderno de Google Colab (`Compare_Models.ipynb`). No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a un pipeline OCR de este tipo.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia ni metricas de rendimiento por segundo.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados con parametros, contexto, licencia y disponibilidad verificables en la informacion proporcionada. El propio autor menciona las variantes A1/A2/A3 del repositorio `khmerOCR` (A1 y A2 como BiLSTM y A3 como encoder-decoder con atencion), pero no aporta cifras que permitan una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Khmer OCR three architectures | no disponible | no aplica | no disponible | Hugging Face |
| khmerOCR A1/A2/A3 (repositorio antiguo) | no disponible | no disponible | no disponible | GitHub |

## Limitaciones y advertencias

- La evaluacion de la demostracion no es representativa: las 20 imagenes se eligieron entre 40 porque el Transformer las predecia correctamente, por lo que las cifras 20/20, 14/20 y 6/20 no deben interpretarse como exactitud general ni como clasificacion justa.
- Los valores de CER de validacion almacenados provienen de procedimientos de validacion distintos entre variantes, lo que impide compararlos directamente.
- El preprocesado compartido (NFC y anchura redondeada) puede diferir del preprocesado original de las variantes recurrentes, lo que puede degradar su rendimiento respecto al entrenamiento.
- El autor no afirma ninguna licencia ni sobre los pesos ni sobre los datos de entrenamiento; el texto indica explicitamente que no se reclaman derechos mas alla de los que posee el propietario, por lo que el uso comercial no esta claro.
- Los checkpoints no conservan estados del optimizador ni del generador de numeros aleatorios, por lo que no permiten reanudar un entrenamiento de forma exacta; solo sirven para inferencia e inicializacion de pesos.
- Ambito limitado al jemer y a imagenes de una sola linea de texto; no se documentan capacidades de multiples lineas, vision general ni otros idiomas.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni comportamiento en dominios distintos al de validacion; en OCR, la alucinacion se manifiesta como caracteres incorrectos plausibles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso o validacion por parte de la comunidad.
- La fecha de creacion y actualizacion indicada (2026) debe tratarse con cautela; no se aporta informacion adicional que la confirme.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Seoul12/khmer-ocr-three-architectures
- Variante Architecture 3 (best) en Hugging Face: https://huggingface.co/Seoul12/khmer-ocr-architecture3-best
- Repositorio de demostracion en GitHub: https://github.com/SeoulDoriot/khmer-ocr-demo
- Repositorio del proyecto khmerOCR en GitHub: https://github.com/SeoulDoriot/khmerOCR
- Dataset de origen de la demostracion: https://huggingface.co/Chanrith123333/khmer_english_ocr_image_line
- Leaderboard de OCR y Document AI 2026: https://awesomeagents.ai/leaderboards/ocr-document-ai-leaderboard/
