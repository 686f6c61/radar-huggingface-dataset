# inference4j/punctuation-fullstop-truecase-english

## Resumen

El modelo `inference4j/punctuation-fullstop-truecase-english` es un modelo de token-classification en formato ONNX que restaura la puntuacion, aplica true-casing (mayusculas y minusculas correctas) y detecta fronteras de frase sobre texto en ingles previamente normalizado a minusculas y sin signos de puntuacion. Se trata de un espejo (mirror) del modelo original `1-800-BAD-CODE/punctuation_fullstop_truecase_english`, reempaquetado para su uso con [inference4j](https://github.com/inference4j/inference4j), una libreria de inferencia para Java.

La arquitectura es un encoder transformer de 6 capas con `d_model` de 512, acompanado de tres cabezas de prediccion (puntuacion, frontera de frase y capitalizacion). El tokenizador es un SentencePiece Unigram de 32k de vocabulario en minusculas, con una longitud maxima de 256 subtokens incluyendo BOS y EOS. El modelo se entreno con aproximadamente 10 millones de lineas del corpus WMT News Crawl (anos 2012 y 2021) y fue exportado a ONNX desde un fork de NeMo.

Su relevancia practica esta en el post-procesado de texto: es el paso tipico que convierte la salida cruda de un sistema ASR, OCR o de un pipeline de normalizacion (todo en minusculas y sin puntuar) en texto legible y reutilizable por modelos posteriores de NLP, TTS o traduccion automatica. Todo el argmax y el umbralizado se ejecutan dentro del grafo, por lo que la salida es directamente utilizable sin pasos adicionales de softmax.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (6 capas, d_model 512) con cabezas de puntuacion, frontera de frase y true-casing |
| Parametros totales | no disponible (estimacion aproximada de 30-40 M a partir de la arquitectura declarada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 subtokens incluyendo BOS y EOS (254 piezas utiles) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `model.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | ingles (nombre del modelo y datos de entrenamiento en WMT News Crawl en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`), mas `tokenizer.json`, `spe_32k_lc_en.model` y `config.yaml` |

Datos adicionales de configuracion:

| Parametro | Valor |
|---|---|
| Tokenizador | SentencePiece Unigram, vocabulario de 32k, lower-cased |
| IDs especiales | BOS = 1, EOS = 2, PAD = 3, UNK = 0 |
| Entrada | `input_ids`, tensor `[batch, seq]` int64 con estructura `[BOS] + piezas + [EOS]` |
| Salidas | `pre_preds`, `post_preds`, `cap_preds`, `seg_preds` |
| Etiquetas de puntuacion | `<NULL>`, `<ACRONYM>`, `.`, `,`, `?` |
| Tamano del repositorio | 0.2 GB |
| Framework original | NeMo (fork), exportado a ONNX por el autor |
| Pipeline declarado | token-classification |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 6 capas con dimension de modelo 512, sobre el que se anaden tres cabezas de clasificacion a nivel de subtoken: una para puntuacion, una para deteccion de frontera de frase y otra para capitalizacion caracter a caracter. La cabeza de capitalizacion devuelve un tensor booleano `[batch, seq, 16]`, es decir, una marca de mayuscula por cada uno de los 16 primeros caracteres de cada subtoken, de modo que permite reconstruir palabras con mayusculas internas como `McDonald's` o acronimos como `U.S.` (esta ultima etiqueta se aplica insertando un punto despues de cada caracter). La salida `pre_preds` existe en el grafo pero siempre vale `<NULL>` para ingles, por lo que en la practica es ignorable.

El entrenamiento se realizo sobre aproximadamente 10 millones de lineas del corpus WMT News Crawl (ediciones de 2012 y 2021), un corpus periodistico multilingue del que aqui solo se emplea la porcion en ingles. El texto se normaliza previamente a minusculas y sin puntuacion, de forma que el modelo aprende la tarea inversa. La model card no documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo discriminativo de etiquetado de tokens y no generativo. La innovacion tecnica destacable es de ingenieria mas que de arquitectura: las cuatro salidas se argmaxean o umbralizan dentro del propio grafo ONNX, lo que elimina la necesidad de aplicar softmax en el cliente y simplifica el despliegue. Para secuencias de mas de 254 piezas es necesario dividir la entrada en ventanas; el paquete `punctuators` del autor original implementa ventanas solapadas con fusion de resultados, pero ese codigo de fusion no forma parte de este repositorio.

## Capacidades

- Restauracion de puntuacion en una sola pasada: inserta punto, coma y signo de interrogacion (etiquetas `.`, `,`, `?`), ademas de la etiqueta especial `<ACRONYM>`.
- True-casing completo: restaura mayusculas iniciales, nombres propios, acronimos con puntos internos (`U.S.`) y palabras con mayusculas internas (`McDonald's`).
- Deteccion de fronteras de frase (`seg_preds`), lo que permite segmentar el texto en oraciones tras la restauracion.
- Procesamiento por lotes: la entrada es `[batch, seq]`, por lo que admite inferencia batcheada.
- Salidas listas para consumir: el argmax y el umbralizado se ejecutan dentro del grafo, sin softmax externo.
- Integracion con Java mediante inference4j (el wrapper Java esta anunciado como "coming in a future release", no disponible todavia).
- No soporta generacion de texto libre, razonamiento, matematicas, codigo, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: unicamente ingles.
- No existen modos especiales como thinking mode ni cadena de pensamiento.

## Casos de uso

- Post-procesado de transcripciones ASR: la salida de un sistema de reconocimiento de voz suele ser texto en minusculas sin puntuar; este modelo restaura puntos, comas e interrogaciones y reconstruye las mayusculas en una sola pasada, devolviendo un texto listo para publicar o para alimentar un summarizer.
- Preprocesado de texto para TTS: los motores de sintesis de voz necesitan puntuacion para modelar pausas y prosodia; restaurar comas y puntos mejora de forma directa la naturalidad de la lectura sintetizada, con un coste computacional minimo gracias a la ventana de 256 subtokens.
- Generacion de subtitulos y ficheros SRT/VTT: combinando la puntuacion restaurada con `seg_preds` se obtienen fronteras de frase que sirven como puntos de corte naturales para segmentos de subtitulo, evitando cortes a mitad de oracion.
- Limpieza de corpus para NLP downstream: tareas como NER, analisis sintactico o clasificacion de sentimiento rinden mejor sobre texto correctamente capitalizado y puntuado; este modelo actua como paso de normalizacion previo en un pipeline por lotes.
- Restauracion de texto procedente de OCR: documentos digitalizados o escaneos sin puntuacion pueden normalizarse antes de indexarse, mejorando la calidad de la busqueda y de los extractos mostrados al usuario.
- Indexado y busqueda documental: la segmentacion en frases permite construir indices por oracion y mejorar la recuperacion de pasajes en motores de busqueda internos o sistemas RAG sobre corpus heredados.
- Despliegue en backend Java sin GPU: gracias al formato ONNX y a inference4j, el modelo puede ejecutarse dentro de un servicio Java en CPU, sin necesidad de infraestructura de aceleradores, lo que lo hace adecuado para microservicios con requisitos de coste bajos.
- Normalizacion de texto de chat y foros: los mensajes informales suelen carecer de mayusculas y puntuacion; restaurarlas mejora la legibilidad en paneles de moderacion y en los pipelines de analisis posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas propias de puntuacion como F1 sobre IWSLT o similares, ni comparaciones cuantitativas con otros modelos de puntuacion.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB. Con una estimacion de 30-40 M de parametros, el peso en fp32 rondaria los 120-160 MB, y en fp16 unos 60-80 MB. El repositorio completo ocupa 0.2 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requiere A100, H100 ni similar. Una GTX 1050, una GTX 1650 o cualquier iGPU moderna con soporte ONNX Runtime son suficientes.
- Cabe en GPU de consumo: si, y tambien en CPU. Es un candidato claro para despliegue en edge, contenedores pequenos y dispositivos con recursos limitados.
- Opciones de despliegue: ONNX Runtime (CPU o con execution providers de CUDA, DirectML, TensorRT, OpenVINO), inference4j para Java, y en general cualquier runtime capaz de cargar `model.onnx`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos y no aplican a este caso.
- Latencia y throughput: no disponibles. La unica restriccion conocida es la ventana de 256 subtokens por inferencia, que obliga a trocear y fusionar entradas mas largas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `inference4j/punctuation-fullstop-truecase-english` | Transformer encoder 6 capas, d_model 512, 3 cabezas | 256 subtokens | Ingles | Apache 2.0 | ONNX | Espejo en HuggingFace |
| `1-800-BAD-CODE/punctuation_fullstop_truecase_english` (original) | Transformer encoder 6 capas, d_model 512, 3 cabezas | 256 subtokens | Ingles | Apache 2.0 | NeMo / ONNX exportado por el autor | Repositorio original |
| Otros modelos de puntuacion y true-casing | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica diferencia verificable entre el espejo y el original es el empaquetado y la orientacion a inference4j; el modelo, el tokenizador y la licencia son los mismos. No se dispone de datos de rendimiento comparado con alternativas como los modelos de puntuacion multilingues basados en XLM-R, por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Cobertura de idioma limitada: solo ingles. No debe emplearse con texto en castellano u otros idiomas, ni siquiera como aproximacion.
- Repertorio de puntuacion reducido: unicamente reconoce punto, coma e interrogacion, mas la etiqueta de acronimo. No inserta signos de exclamacion, punto y coma, dos puntos, comillas, parentesis ni guiones.
- Ventana corta: 256 subtokens incluyendo BOS y EOS. Las entradas de mas de 254 piezas deben trocearse en ventanas; el codigo de ventanas solapadas y fusion vive en el paquete `punctuators`, fuera de este repositorio, por lo que hay que reimplementarlo o importarlo aparte.
- Preprocesado obligatorio a cargo del usuario: hay que pasar el texto a minusculas, eliminar la puntuacion y colapsar los espacios repetidos antes de tokenizar, porque `tokenizer.json` no realiza esa normalizacion y genera tokens `▁` adicionales. Tambien hay que evitar que cadenas como `<s>` o `</s>` escritas en el texto colisionen con los IDs especiales.
- Sesgo de dominio: el entrenamiento con WMT News Crawl (texto periodistico) hace que el rendimiento esperable sea menor en conversacion informal, redes sociales, texto tecnico, transcripciones con disfluencias o dominios muy especializados.
- Sin puntuaciones de confianza: las salidas ya vienen argmaxeadas o umbralizadas dentro del grafo, de modo que no se obtienen probabilidades y no es posible aplicar un umbral propio ni detectar casos de baja confianza sin modificar el grafo.
- Riesgo de errores en true-casing: nombres propios poco frecuentes, marcas, toponimos y acronimos desconocidos pueden capitalizarse de forma incorrecta. El limite de 16 caracteres por subtoken en `cap_preds` tambien restringe la reconstruccion de piezas muy largas.
- Riesgo de insercion incorrecta de puntuacion: el modelo puede anadir puntos o comas donde no corresponden o fragmentar mal las oraciones, especialmente con entradas muy alejadas de la distribucion de entrenamiento. En este contexto, "alucinacion" significa etiquetado incorrecto, no generacion de contenido nuevo, ya que el modelo no genera texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la atribucion al autor original (1-800-BAD-CODE). No hay clausulas de uso aceptable adicionales documentadas.
- Madurez del ecosistema: el repositorio acumula 0 descargas y 0 likes, y el wrapper Java de inference4j todavia no esta disponible, por lo que la integracion en Java requiere hoy cargar el ONNX manualmente.
- Produccion: al ser un modelo pequeno y determinista, el riesgo principal no es de coste ni de latencia, sino de calidad sobre dominios fuera del periodistico; conviene evaluar con una muestra representativa del dominio real antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inference4j/punctuation-fullstop-truecase-english
- Modelo original (upstream): https://huggingface.co/1-800-BAD-CODE/punctuation_fullstop_truecase_english
- Repositorio de inference4j: https://github.com/inference4j/inference4j
- Paquete punctuators (ventanas solapadas y fusion): https://github.com/1-800-BAD-CODE/punctuators
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo; los enlaces anteriores son los unicos disponibles en la informacion proporcionada.
