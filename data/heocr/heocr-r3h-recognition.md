# HeOCR/heocr-r3h-recognition

## Resumen

HeOCR R3h es un modelo de reconocimiento de texto a nivel de linea para documentos en hebreo moderno, desarrollado por HeOCR y publicado bajo licencia Apache-2.0. Se distribuye como un modelo de kraken (la herramienta de OCR/HTR de código abierto) en formato safetensors, con un unico fichero de 16.167.536 bytes. No es un modelo de lenguaje generativo: es una red convolucional-recurrente con salida CTC que convierte una imagen de linea de texto en una secuencia de caracteres.

R3h forma parte de un pipeline de tres modelos que HeOCR publica de forma conjunta: R4d realiza la segmentacion (baselines, poligonos de linea y regiones tipadas), A1 establece el orden de lectura a partir del tipo de region de cada linea y R3h lee cada linea. El modelo se ha entrenado desde cero exclusivamente con paginas sinteticas, y el propio autor lo presenta como una linea base de investigacion, no como un transcriptor listo para produccion.

Su relevancia actual es acotada pero clara: cubre el reconocimiento de lineas en hebreo moderno (impreso y fuentes de estilo manuscrito), con un codec de 117 simbolos que incluye las 27 letras hebreas con formas finales, geresh y gershayim, digitos, letras latinas, puntuacion ASCII y tipografica, y el signo del shekel. La ausencia de evaluacion revisada sobre escaneos reales es su limitacion principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de reconocimiento por defecto de ketos 7.0.2 (CNN + capas Lbx recurrentes + CTC); entrada en escala de grises escalada a 120 px de altura |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo imagen-a-texto a nivel de linea) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0, Copyright (c) 2026 HeOCR maintainers |
| Formato de pesos | kraken safetensors (`heocr-r3h-recognition.safetensors`, 16.167.536 bytes, sha256 `f76affa8…`) |

## Arquitectura y entrenamiento

R3h emplea la red de reconocimiento por defecto de ketos 7.0.2 sin modificaciones. La definicion de la red es la siguiente: `[1,120,0,1 Cr3,13,32 Do0.1,2 Mp2,2 Cr3,13,32 Do0.1,2 Mp2,2 Cr3,9,64 Do0.1,2 Mp2,2 Cr3,9,64 Do0.1,2 S1(1x0)1,3 Lbx200 Do0.1,2 Lbx200 Do0.1,2 Lbx200 Do]`. Es decir, una pila de cuatro bloques convolucionales con dropout y max pooling, seguida de tres capas recurrentes de 200 unidades y una capa de salida. Las lineas de entrada se escalan a 120 pixeles de altura y se procesan en escala de grises. El modelo espera segmentacion basada en baselines (`seg_type: baselines`).

El entrenamiento se realizo desde cero unicamente con paginas sinteticas, segun indica el autor. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo CTC de reconocimiento). El codec de salida consta de 117 simbolos: las 27 letras hebreas con formas finales, geresh `׳` y gershayim `״`; los digitos `0–9` y las letras latinas `A–Z a–z`; espacio y puntuacion ASCII (`! " % & ' ( ) + , - . / : ; ? @`); puntuacion tipografica (`– — ‘ ’ “ ” „ …`); y el signo del shekel `₪`. No incluye niqqud ni cantilacion. El ground truth es texto Unicode NFC en orden logico; durante el entrenamiento se reordena a orden de visualizacion (convencion de kraken) con direccion base de derecha a izquierda.

## Capacidades

- Reconocimiento de texto a nivel de linea en hebreo moderno, tanto en fuentes impresas como en una fuente de estilo manuscrito.
- Lectura de digitos, letras latinas y puntuacion tipografica dentro de lineas hebreas.
- Manejo de signos propios del hebreo: geresh, gershayim y signo del shekel.
- Integracion en el pipeline R4d + A1 + R3h para transcripcion de pagina completa con orden de lectura aprendido.
- Salida en orden logico mediante `--reorder --base-dir R` en kraken; sin esa opcion la salida queda en orden de visualizacion.
- Conservacion del orden izquierda-a-derecha de digitos y palabras latinas dentro de la linea en orden logico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking: es un modelo especializado de OCR.

## Casos de uso

- Reconocimiento de lineas en documentos administrativos en hebreo: cartas, notas, fichas de archivo, formularios y avisos, siempre que se integre en el pipeline R4d + A1 + R3h para obtener el texto de pagina completa en orden de lectura correcto.
- Digitalizacion de libros de contabilidad y registros con columnas de cifras: el codec incluye digitos y el signo del shekel, lo que permite transcribir importes dentro de lineas hebreas.
- Linea base de investigacion para OCR en hebreo: util para comparar segmentadores, geometrias de linea y modelos posteriores de HeOCR bajo condiciones controladas, dado que su evaluacion publicada es sobre paginas sinteticas.
- Generacion de datos de entrenamiento y validacion: al estar entrenado solo con sintetico, sirve para estudiar la brecha entre dominio sintetico y escaneos reales antes de invertir en anotacion humana.
- Procesamiento por lotes en CPU: el pipeline completo se probo de extremo a extremo con kraken 7.0.2 en CPU (unos 8 segundos por pagina de semilla 101), lo que permite desplegarlo en servidores sin GPU para volumenes moderados.
- Extraccion de texto de recortes de linea ya segmentados: si se dispone de un segmentador propio, R3h puede usarse de forma aislada para leer cada linea, aceptando imagenes en escala de grises con baseline conocida.
- Prototipado de pipelines OCR en hebreo con heocr-engine: el comando `heocr-engine kraken` permite orquestar segmentacion, orden de lectura y reconocimiento en un solo paso y generar un registro de prediccion en JSON.

## Benchmarks y rendimiento

El autor menciona un fichero entrenado como `best_0.9959.safetensors`, lo que sugiere una metrica interna de 0,9959, pero no se especifica en la informacion disponible que metrica es, sobre que conjunto se calculo ni como se compara con otros modelos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y la evaluacion existente es exclusivamente sobre paginas sinteticas, sin evaluacion revisada sobre escaneos reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el fichero de pesos ocupa 16,2 MB, por lo que la huella es minima y cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el autor probo el pipeline completo en CPU con kraken 7.0.2 (aproximadamente 8 segundos por pagina de semilla 101).
- Cabe en GPU consumer: si, con margen amplio, dado el tamano del fichero, aunque no se publican requisitos oficiales.
- Opciones de despliegue: kraken / ketos 7.0.2 para el reconocimiento aislado; heocr-engine (con `pip install '.[kraken]'`) para el pipeline completo R4d + A1 + R3h. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: unica cifra publicada, unos 8 segundos por pagina en CPU para el pipeline completo; no hay datos de throughput en GPU.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos de reconocimiento de lineas en hebreo con los que comparar parametros, contexto o rendimiento. La comparacion natural dentro del propio ecosistema HeOCR es con las otras dos piezas del pipeline, que no son alternativas sino componentes complementarios:

| Modelo | Funcion | Formato | Licencia |
|---|---|---|---|
| R4d (`heocr-r4d-segmentation.safetensors`) | Segmentacion: baselines, poligonos de linea, regiones tipadas | kraken safetensors | Apache-2.0 |
| A1 (`heocr-a1-reading-order.safetensors`) | Orden de lectura a partir del tipo de region | kraken safetensors | Apache-2.0 |
| R3h (este modelo) | Reconocimiento de linea (CTC) | kraken safetensors | Apache-2.0 |

## Limitaciones y advertencias

- No es un transcriptor para produccion: el autor lo describe explicitamente como linea base de investigacion y no existe evaluacion revisada sobre escaneos reales.
- Toda la evaluacion se ha realizado sobre paginas sinteticas, por lo que el rendimiento en documentos reales es desconocido y probablemente inferior.
- Fuera de alcance: hebreo medieval, liturgico o de otras escrituras historicas.
- Fuera de alcance: niqqud (puntos vocales), que no forma parte del codec de 117 simbolos.
- Fuera de alcance: escritura manuscrita real; "handwriting-style" se refiere a una unica fuente de estilo manuscrito, no a manos humanas.
- Fuera de alcance: documentos que no sean mayoritariamente hebreos.
- Riesgo de alucinacion y errores de sustitucion de caracteres inherente a los modelos CTC entrenados con sintetico, especialmente en glifos ambiguos y en la frontera entre geresh/gershayim y comillas ASCII.
- Sin `--reorder --base-dir R` en kraken, la salida queda en orden de visualizacion y no en orden logico, lo que puede romper consumidores posteriores del texto.
- A1 no puede ejecutarse con kraken 7.0.2 de forma aislada: requiere heocr-engine por el desajuste de clases (tipos de region frente a tipos de linea) y porque la salida de texto de kraken ignora el orden de lectura aprendido (mittagessen/kraken#820).
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de copyright de HeOCR maintainers y el fichero NOTICE.
- El repositorio de Hugging Face figura con 0 descargas y 0 likes y un tamano de 0.0 GB en el momento de la consulta, lo que indica una publicacion muy reciente y sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-r3h-recognition
- Organizacion HeOCR en GitHub: https://github.com/HeOCR
- Codigo de heocr-engine: https://github.com/HeOCR/heocr-engine
- Registro del modelo en Zenodo: https://doi.org/10.5281/zenodo.24023074
- Registro de R4d (segmentacion): https://doi.org/10.5281/zenodo.24023070
- Registro de A1 (orden de lectura): https://doi.org/10.5281/zenodo.24023072
- Kraken: https://kraken.re
- Issue de kraken sobre orden de lectura: https://github.com/mittagessen/kraken/issues/820
