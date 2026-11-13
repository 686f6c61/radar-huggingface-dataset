# M2key1/deepocr-v4

## Resumen

DeepOCR v4 es un modelo de reconocimiento de texto a nivel de linea especializado en impresos historicos y escritura manuscrita. Lo desarrolla David Fleischhacker (usuario M2key1) y se publica bajo licencia Apache-2.0. La version v4 parte de DeepOCR v3 y se afina con mas transcripciones, incorporando un decodificador de subpalabras que redacta la linea candidata mientras la cabeza CTC la verifica contra la imagen. El modelo resuelve el problema de la transcripcion automatica (OCR/HTR) de material documental historico, un dominio donde los OCR genericos fallan por tipografias antiguas, abreviaturas, la s larga y caligrafias de epoca.

La arquitectura es hibrida: una parte visual de 156,0M de parametros (backbone CNN agrupado, cuatro capas transformer con mezcla de expertos y cabeza CTC sobre bytes) y un decodificador de subpalabras de 305,6M parametros basado en un modelo de lenguaje OLMo 3 de 238M destilado de HabsburgLLM, con atencion cruzada hacia las caracteristicas de imagen. En total, 461,6M de parametros. La entrada es una unica linea de texto como imagen RGB, escalada a 256 px de alto y leida hasta 6144 px de ancho.

Su relevancia actual radica en la mejora sustancial frente a v3 en material no visto: en cartas manuscritas de alrededor de 1900 el error de caracter (CER) baja del 9,36% al 5,95% con beam search y al 4,56% con el decodificador de subpalabras, aproximadamente la mitad de errores. Es una herramienta practica para proyectos de digitalizacion de archivos y humanidades digitales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: CNN agrupado + 4 capas transformer MoE + cabeza CTC sobre bytes, con decodificador de subpalabras OLMo 3 y atencion cruzada |
| Parametros totales | 461,6M (156,0M vision/CTC + 305,6M decodificador) |
| Parametros activos | 8 expertos activos por columna de 64, mas un experto compartido (solo en las capas MoE) |
| Longitud de contexto | No aplica en el sentido de LLM; entrada de una linea de hasta 6144 px de ancho a 256 px de alto |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (entrenado principalmente con material europeo, impreso y manuscrito, de la Edad Media a la epoca moderna) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch) con configuracion de arquitectura, configuracion del decodificador y tokenizer embebidos; KenLM en `.bin` y `.dict` |

## Arquitectura y entrenamiento

El modelo combina dos componentes. El primero, de 156,0M de parametros, procesa la imagen: un backbone CNN agrupado extrae caracteristicas, que pasan por cuatro capas transformer con mezcla de expertos (64 expertos, 8 activos por columna, mas uno compartido) y terminan en una cabeza CTC sobre un vocabulario de 261 tokens a nivel de byte, lo que permite emitir cualquier caracter Unicode. El segundo, de 305,6M de parametros, es un decodificador de subpalabras: un modelo de lenguaje OLMo 3 de 238M destilado de HabsburgLLM, con tokenizer de 48k, extendido mediante atencion cruzada a las caracteristicas de imagen.

El entrenamiento parte de DeepOCR v3 y se afina con mas transcripciones. Los datos proceden de conjuntos publicos de impresos y manuscritos historicos y de transcripciones de linea realizadas en DeepLabel. La innovacion principal de v4 es el esquema de decodificacion: el decodificador de subpalabras escribe cuatro lineas candidatas y la cabeza CTC puntua cada una contra la imagen, ganando la mejor puntuacion global. Tambien admite busqueda por haces CTC con un modelo de lenguaje KenLM de 6-gramas a nivel de byte (`union_bytes_v3.bin`). El modelo garantiza que una linea se lee igual procesada sola o en lote con lineas mas largas, salvo redondeo en coma flotante.

## Capacidades

- Reconocimiento de texto a nivel de linea en imagenes de impresos historicos y manuscritos.
- Salida a nivel de byte, capaz de emitir cualquier caracter Unicode, incluidas grafias historicas.
- Cuatro convenciones de transcripcion configurables: s larga (ſ), guion oblicuo (⸗), puntuacion tipografica y expansion de abreviaturas (todas desactivadas por defecto).
- Decodificacion con decodificador de subpalabras (cuatro candidatos puntuados por CTC) o busqueda por haces CTC con KenLM.
- Integracion con la herramienta DeepLabel para lectura con el decodificador de subpalabras.
- No soporta tool calling, agentes, vision general ni audio: es un modelo especifico de image-to-text para lineas de texto.

## Casos de uso

- Digitalizacion de archivos historicos: transcribir lineas de documentos manuscritos e impresos de la Edad Media a la epoca moderna, con CER por debajo del 5% en cartas manuscritas de hacia 1900 no vistas durante el entrenamiento.
- Proyectos de humanidades digitales: convertir corpus de epistolarios y documentos de archivo en texto buscable, aplicando las convenciones de s larga y guion oblicuo para preservar la grafia original.
- Creacion de corpus para entrenamiento de modelos: generar transcripciones de linea de alta calidad que alimenten modelos de lenguaje historicos como HabsburgLLM.
- Pipelines de preservacion documental: encadenar un detector de lineas (necesario, ya que el modelo solo lee lineas sueltas) con DeepOCR v4 para procesar paginas completas de colecciones digitalizadas.
- Investigacion en filologia y linguistica historica: obtener transcripciones con expansion de abreviaturas o sin ella para estudiar variacion ortografica y tipografica.
- Verificacion asistida de transcripciones: usar la doble via de decodificacion (subpalabras y beam search con KenLM) para contrastar candidatos y detectar lineas problematicas en revisiones manuales.

## Benchmarks y rendimiento

Tasa de error de caracter (CER), menor es mejor:

| Material | Decodificacion | v3 | v4 |
|---|---|---|---|
| Muestra de validacion reservada, 2.000 lineas | greedy | 7,86% | 7,47% |
| Muestra de validacion reservada, 2.000 lineas | beam 10 + KenLM | 7,44% | 7,04% |
| Muestra de validacion reservada, 2.000 lineas | decodificador de subpalabras | no disponible | 6,82% |
| Cartas manuscritas no vistas de hacia 1900, 1.972 lineas | beam 10 + KenLM | 9,36% | 5,95% |
| Cartas manuscritas no vistas de hacia 1900, 1.972 lineas | decodificador de subpalabras | no disponible | 4,56% |

La muestra de validacion cubre todas las colecciones de entrenamiento, incluidas algunas anadidas despues del entrenamiento de v3.

## Requisitos de hardware

- VRAM estimada para inferencia: con 461,6M de parametros, en precision completa (fp32) el modelo ocupa aproximadamente 1,9 GB, coherente con el tamano del repositorio; en fp16 o bf16 se reduce a alrededor de 1 GB, aunque no se publican cifras oficiales de cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre en fp32; una NVIDIA A100 o H100 ofrece margen amplio para procesar lotes de lineas, pero no son necesarias.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060 o superiores; el codigo de inferencia funciona tambien en CPU (`torch.device('cuda' if torch.cuda.is_available() else 'cpu')`).
- Opciones de despliegue: inferencia nativa en PyTorch mediante el script `infer.py` del repositorio DeepOCR (funciones `load_model` y `transcribe`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, dado que no es un LLM de texto generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | CER manuscrito no visto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepOCR v4 | 461,6M | CNN + MoE transformer + CTC + decodificador de subpalabras | 4,56% (decodificador), 5,95% (beam+KenLM) | Apache-2.0 | Hugging Face y GitHub |
| DeepOCR v3 | No disponible | Version anterior, sin decodificador de subpalabras | 9,36% (beam+KenLM) | Apache-2.0 (presumible, no confirmado) | Hugging Face |
| Otros modelos OCR/HTR historicos | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de terceros en la informacion proporcionada para establecer comparaciones con otros sistemas de OCR historico.

## Limitaciones y advertencias

- Solo lee lineas individuales: requiere un detector o segmentador de lineas previo.
- Una linea de una o dos palabras da poco contexto al decodificador, que puede escribir una palabra mas comun que la presente en la pagina.
- No detecta lineas invertidas; hay que girar el recorte antes de procesarlo.
- En secuencias de puntos conductores el decodificador puede escribir un punto de mas o de menos; la busqueda por haces los cuenta con mas exactitud.
- Rinde mejor en material parecido al de entrenamiento (impresos y manuscritos europeos medievales a modernos); idiomas raros en los datos, como el checo, se leen claramente peor.
- No se documentan sesgos especificos ni tasas de alucinacion mas alla de las limitaciones de transcripcion descritas.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones de los conjuntos de datos publicos de entrenamiento.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/M2key1/deepocr-v4
- Repositorio DeepOCR (codigo, entrenamiento y arquitectura): https://github.com/m2key1/DeepOCR
- Herramienta DeepLabel: https://github.com/m2key1/DeepLabel
- Modelo base HabsburgLLM: https://huggingface.co/M2key1/HabsburgLLM
- Repositorio HabsburgLLM: https://github.com/m2key1/HabsburgLLM
- DeepOCR v3: https://huggingface.co/M2key1/deepocr-v3
