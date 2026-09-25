# grafon-g2p/ar

## Resumen

grafon-g2p/ar es un modelo de conversion grafema-fonema (G2P) para arabe, publicado por el usuario grafon-g2p y entrenado con la libreria grafon sobre el encoder UBC-NLP/MARBERTv2. No genera texto ni audio: recibe una cadena de texto en arabe y devuelve su transcripcion fonetica en alfabeto fonetico internacional (IPA), resolviendo la pronunciacion de cada grafema en funcion de su contexto. Cuenta con 197.685.540 parametros (segun los pesos safetensors del repositorio, 0,4 GB), lo que lo situa en la categoria de modelos ligeros.

Aunque la etiqueta de pipeline del repositorio es text-to-speech, el modelo ocupa tecnicamente la fase de fonemizacion de esa cadena: convierte grafias en fonemas que despues consume un sintetizador. La model card es minima (una frase de descripcion y un ejemplo de tres lineas) y no publica licencia, datos de entrenamiento, resultados de evaluacion ni variantes cuantizadas.

Su relevancia practica viene de un problema concreto del arabe: la relacion entre grafia y pronunciacion es ambigua, con texto habitualmente sin vocales cortas, homografos frecuentes y variacion dialectal. Un fonemizador contextual aborda ese cuello de botella mejor que las reglas fijas o los lexicos cerrados. El interes esta limitado, eso si, por la ausencia de licencia explicita y de cualquier validacion publica (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de UBC-NLP/MARBERTv2) con cabeza de clasificacion de tokens para prediccion de fonemas |
| Parametros totales | 197.685.540 (~198 M), segun los pesos safetensors del repositorio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible: la model card no documenta limite de longitud de entrada y no es un modelo generativo con ventana de contexto |
| Tipos de cuantizacion | no disponible: solo se publican pesos en precision completa (safetensors); no hay variantes GGUF, GPTQ, AWQ ni int8 |
| Idiomas soportados | arabe (ar); la model card no distingue entre arabe estandar y dialectos |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | UBC-NLP/MARBERTv2 (fine-tuning) |
| Libreria de inferencia | grafon (`Phonemizer.from_pretrained`) |
| Inventario de fonemas de salida | `a b d f h i j k l m n p q r s t u v w x z ð ħ ɡ ɣ ʃ ʒ ʔ ʕ θ ˈ ː ˤ` |
| Alfabeto de entrada reconocido | `ء آ أ ؤ إ ئ ا ب ة ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ى ي پ چ ڤ گ ـ`; cualquier otro caracter se devuelve tal cual |
| Tamano del repositorio | 0,4 GB |
| Fecha de publicacion (metadatos) | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo se apoya en MARBERTv2, un encoder transformer enmascarado preentrenado sobre un corpus a gran escala de arabe que, segun su propia model card, cubre tanto arabe estandar moderno como variedades dialectales. Sobre esa base, grafon anade una cabeza de clasificacion de tokens y entrena la tarea G2P: cada caracter de entrada se etiqueta con un simbolo fonetico del inventario IPA definido en la model card, de modo que la pronunciacion se decide de forma contextual y no mediante reglas ni un lexico de excepciones.

No hay informacion publica sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de epochs, ni sobre si se aplicaron tecnicas de alineacion o refinamiento posteriores (RLHF, DPO u otras). Tampoco se documenta el mecanismo de tokenizacion concreto ni si el modelo opera a nivel de caracter o de subpalabra heredada del tokenizador de MARBERTv2.

El inventario de salida incluye marcas suprasegmentales y de articulacion: `ˈ` (acento primario), `ː` (longitud vocalica o consonantica) y `ˤ` (enfatizacion o faringalizacion), habituales en la descripcion fonetica del arabe. Los caracteres de entrada que quedan fuera del alfabeto arabe reconocido se propagan sin modificacion a la salida.

## Capacidades

- Conversion grafema-fonema contextual en arabe con salida en simbolos IPA, invocable con `Phonemizer.from_pretrained("grafon-g2p/ar")`.
- Etiquetado por caracter que resuelve la pronunciacion en funcion del contexto inmediato, en lugar de aplicar una tabla de reglas fija.
- Representacion de fenomenos del arabe en la salida: enfatizacion (`ˤ`), longitud (`ː`) y acento primario (`ˈ`).
- Propagacion literal de caracteres no arabes (alfabeto latino, cifras, signos de puntuacion) en lugar de su transliteracion.
- Integracion como paso previo en pipelines de sintesis de voz para arabe.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso: no es un modelo conversacional ni instruccional.
- No dispone de modo de razonamiento explicito (thinking), vision, audio ni generacion de texto libre.
- Modelo monoidioma: no se declara soporte multilingue.

## Casos de uso

- Preprocesado para sintesis de voz en arabe: el modelo convierte el texto de entrada en una secuencia de fonemas IPA que se entrega al sintetizador; al ser contextual, evita el uso de un lexico de pronunciacion externo para cada palabra.
- Lexicografia y diccionarios digitales: generacion automatica de transcripciones IPA para entradas de diccionario o vocabularios tecnicos en arabe, con revision humana posterior.
- Ensenanza de arabe como lengua extranjera: produccion de transcripciones de pronunciacion para materiales didacticos y ejercicios, usando la salida IPA como guia para el estudiante.
- Alineacion forzada y reconocimiento de habla: conversion de transcripciones ortograficas a secuencias foneticas para construir grafos de decodificacion sin lexico predefinido.
- Investigacion en fonologia arabe: fonemizado masivo de corpus textuales para estudiar patrones de enfatizacion, longitud y acento a escala.
- Accesibilidad y lectura asistida: integracion en lectores de pantalla o aplicaciones de lectura en voz alta que necesiten control explicito de la pronunciacion antes de sintetizar.
- Doblaje y localizacion de contenido: preprocesado de guiones en arabe para ajustar duraciones y sincronizacion labial a partir de la secuencia fonetica.
- Normalizacion de nombres propios y prestamos: obtencion de una pronunciacion coherente para terminos que no aparecen en lexicos cerrados, siempre con verificacion manual dado el riesgo de error en homografos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion (ni tasas de error de fonema, ni PER/WER, ni comparaciones con otros sistemas G2P), y la busqueda web realizada no ha devuelto datos de rendimiento asociados a este modelo.

## Requisitos de hardware

- VRAM estimada para los pesos: en FP32, aproximadamente 0,8 GB; en FP16/BF16, aproximadamente 0,4 GB; en int8, en torno a 0,2 GB. Anadiendo activaciones y overhead del runtime, la inferencia cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU consumer con 2 GB o mas de VRAM libre es suficiente (por ejemplo, GTX 1060 6 GB, RTX 3060, RTX 4090). Las A100 o H100 solo tendrian sentido para servir muchas peticiones en paralelo con requisitos de latencia estrictos.
- Ejecucion en CPU: viable, dado el tamano del modelo (~198 M de parametros). Es probable que el coste dominante sea el preprocesado y la tokenizacion de la entrada mas que la propia pasada por el encoder.
- Opciones de despliegue: PyTorch con la libreria grafon (uso previsto por el autor). vLLM, TGI, llama.cpp y Ollama no son aplicables porque el modelo no es un LM generativo autoregresivo. Para entornos de CPU puede plantearse exportacion a ONNX Runtime o TorchScript, aunque el autor no publica artefactos de este tipo.
- Latencia y throughput: no disponible. No se publican medidas y dependeran del numero de caracteres de entrada, del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grafon-g2p/ar | Encoder transformer con cabeza de clasificacion de tokens (G2P contextual) | 197,7 M | Texto en arabe a nivel de caracter | no disponible | HuggingFace, 0 descargas en la fecha de consulta |
| UBC-NLP/MARBERTv2 | Encoder transformer enmascarado (modelo base, no es G2P) | no disponible en la informacion recogida | Texto en arabe | no disponible en la informacion recogida | HuggingFace |
| charsiu/g2p_multilingual_byT5_small_100 | Seq2seq (ByT5-small) entrenado para G2P multilingue | ~300 M (arquitectura ByT5-small) | Texto multilingue | consultar en el repositorio | HuggingFace |
| espeak-ng | Fonemizador basado en reglas, no neuronal | no aplica (sin parametros) | Texto multilingue | consultar en el repositorio del proyecto | Paquete de software del sistema |

No es posible comparar rendimiento: ninguno de los datos disponibles incluye metricas de error fonetico para este modelo, de modo que la comparacion se limita a arquitectura, tamano, licencia y forma de distribucion.

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse ningun permiso de uso comercial ni de redistribucion. Es un bloqueo potencial para produccion y debe resolverse con el autor antes de integrarlo.
- Ausencia total de evaluacion publica: no hay benchmarks, ni tasas de error, ni validacion por terceros. El repositorio presenta 0 descargas y 0 likes en la fecha de consulta.
- Model card minima: no se documentan datos de entrenamiento, numero de tokens, composicion del corpus, ni el tratamiento de variedades dialectales del arabe.
- Ambiguedad intrinseca del arabe no vocalizado: la entrada reconocida no incluye los signos vocalicos arabes, y la model card indica que cualquier caracter fuera del alfabeto listado se devuelve tal cual. Conviene normalizar el texto antes de la inferencia para evitar que diacriticos o signos auxiliares aparezcan sin transformar en la salida.
- Sin normalizacion de texto: cifras, fechas, abreviaturas y palabras en alfabeto latino se propagan literalmente, por lo que el modelo no resuelve la lectura de numeros ni de prestamos.
- Riesgo de error en homografos y nombres propios: al depender del contexto y no de un lexico de excepciones, la pronunciacion de toponimos y antroponimos puede ser incorrecta sin que exista un mecanismo documentado de correccion.
- Contexto de uso acotado: no es un modelo conversacional, no soporta instrucciones, agentes ni tool calling, y no debe emplearse para generacion de texto.
- Cobertura limitada a un unico idioma (ar), sin garantia de comportamiento fuera del arabe.
- Fecha de publicacion en los metadatos (2026-09-25) y versionado: al no existir historial de revisiones documentado, no puede evaluarse la estabilidad del modelo entre actualizaciones.
- Los resultados de la busqueda web disponible corresponden a entidades homonimas o no relacionadas (Graphon AI, MeshGPT, recopilatorios de model cards de DeepMind) y no aportan informacion tecnica sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/grafon-g2p/ar
- Repositorio de la libreria grafon: https://github.com/thewh1teagle/grafon
- Modelo base MARBERTv2: https://huggingface.co/UBC-NLP/MARBERTv2
- Lectura relacionada sobre G2P sin lexico (no especifica de este modelo): https://arxiv.org/html/2401.10465v1
