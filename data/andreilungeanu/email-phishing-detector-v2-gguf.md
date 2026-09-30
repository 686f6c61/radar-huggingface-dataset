# andreilungeanu/email-phishing-detector-v2-GGUF

## Resumen

`andreilungeanu/email-phishing-detector-v2-GGUF` es una conversion a formato GGUF del clasificador de secuencias `nhellyercreek/email-phishing-detector-v2`, un DeBERTa-v3-base (`DebertaV2ForSequenceClassification`) afinado para dos clases: `safe` y `phishing`. El modelo original parte de `microsoft/deberta-v3-base` y se distribuye bajo licencia MIT. Esta publicacion no reentrena ningun peso: unicamente convierte los tensores originales a ggml/GGUF y anade la tabla de buckets de posicion relativa (`rel_pos_bucket`) y los metadatos necesarios para inferencia.

La relevancia de esta ficha es sobre todo practica y de infraestructura. El autor advierte que los GGUF usan una arquitectura personalizada (`deberta-v2-cls`) y que llama.cpp estandar no puede cargarlos, porque no existe soporte de DeBERTa en el proyecto. Estan pensados para un runtime ggml independiente que todavia no es publico, de modo que los ficheros se publican para que las instalaciones puedan descargarlos en una revision fijada.

El modelo resuelve una tarea concreta: dada la concatenacion de asunto y cuerpo de un correo (`subject + "\n\n" + body`), truncada a 512 tokens, devuelve la probabilidad softmax de la etiqueta `phishing` (etiqueta positiva = 1). No es un modelo generativo ni un LLM: es un encoder de clasificacion de 2 clases, en ingles, con un coste de inferencia muy bajo en CPU (del orden de 0,2 s por correo en 4 hilos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 con disentangled attention; tarea de clasificacion de secuencias (`DebertaV2ForSequenceClassification`). En GGUF se etiqueta como `deberta-v2-cls` (arquitectura personalizada) |
| Parametros totales | Aproximadamente 185 M (deducido del fichero f32 de 740 MB); DeBERTa-v3-base declara 86 M de parametros de backbone mas la capa de embeddings |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (`[CLS] ... [SEP]`), truncando por el final |
| Tipos de cuantizacion | F32 (referencia), F16 (recomendada) y Q8_0. En F16 y Q8_0 solo se cuantizan las 72 matrices Linear del encoder; los embeddings de palabra van en F16 y el resto en F32 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (la declarada por el modelo original y por DeBERTa-v3) |
| Formato de pesos | GGUF (tres ficheros) mas `spm.model` (SentencePiece) |

Ficheros publicados:

| Fichero | Tamano | Contenido |
|---|---|---|
| `deberta-phish-v2-f16.gguf` | 374 MB | Embeddings de palabra + 72 matrices Linear del encoder en F16, el resto en F32 (recomendado) |
| `deberta-phish-v2-q8_0.gguf` | 294 MB | 72 matrices Linear del encoder en Q8_0, embeddings de palabra en F16, el resto en F32 |
| `deberta-phish-v2-f32.gguf` | 740 MB | Todo F32 (referencia) |
| `spm.model` | 2,5 MB | Modelo SentencePiece del repositorio original |

## Arquitectura y entrenamiento

La arquitectura subyacente es DeBERTa-v2, un transformer encoder con atencion desenredada (disentangled attention), donde el contenido y la posicion de cada token se codifican en vectores separados, y con una tabla de posiciones relativas discretizadas en buckets. Sobre ese backbone, el modelo original anade una cabeza de clasificacion con dos salidas (`safe`, `phishing`). La conversion a GGUF reproduce esa topologia: incorpora todos los tensores originales, la tabla `rel_pos_bucket` calculada a partir de la configuracion, los hiperparametros y las etiquetas en los metadatos, y un tokenizador que replica `tokenizer.json` identificador a identificador.

DeBERTa-v3, la base del modelo, se preentreno con un objetivo estilo ELECTRA de deteccion de tokens sustituidos (replaced token detection) en lugar del enmascaramiento clasico, lo que explica su tamano relativamente reducido frente a otros encoders comparables. No obstante, los datos de entrenamiento del ajuste fino de phishing **no estan divulgados** por el autor original: la model card no indica numero de tokens, composicion del dataset, ni si hubo una etapa de RLHF o DPO. Se trata por tanto de una conversion de pesos, no de un reentrenamiento, y el autor atribuye todo el merito a los autores del modelo original.

La innovacion tecnica de esta publicacion es de ingenieria de runtime: un puerto ggml de DeBERTa que implementa la atencion desenredada, los buckets de posicion relativa y la cabeza de clasificacion, ademas de un tokenizador que reproduce fielmente el mapeo NFKC del tokenizador original. Esto ultimo es relevante porque transformers 5.x aplica NFC en lugar de NFKC, lo que convierte caracteres como el espacio duro (NBSP), los puntos suspensivos, el simbolo de marca registrada y las ligaduras en `[UNK]`.

## Capacidades

- Clasificacion binaria de correo electronico en dos etiquetas: `safe` y `phishing`, con la probabilidad softmax de la clase 1 como puntuacion de riesgo.
- Entrada en formato fijo `subject + "\n\n" + body`, con truncado por el final a 512 tokens.
- Clasificacion de texto corto y medio en ingles, orientada a contenido de correo.
- Reproduccion fiel del tokenizador original: 2.629 de 2.629 correos y 68 de 68 cadenas adversariales producen exactamente los mismos identificadores que `tokenizer.json`.
- Paridad numerica verificada frente a PyTorch fp32 con `transformers`: desviacion maxima de 1,5e-6 en logits con F32, 9,5e-4 con F16 y 4,5e-2 con Q8_0.
- **No** soporta generacion de texto, razonamiento multi-paso, tool calling, function calling, agentes, vision, audio ni multimodalidad.
- **No** procesa por separado remitente, cabeceras, enlaces ni adjuntos: solo ve asunto y cuerpo como texto.
- **No** detecta spam generico salvo que el mensaje se parezca a phishing.

## Casos de uso

- Filtrado en pasarela de correo (MTA o gateway): el modelo se ejecuta en linea antes de la entrega y devuelve una probabilidad de phishing por mensaje. Su coste de CPU (unos 0,2 s de media por correo en 4 hilos) y su huella de memoria (0,3-0,5 GB) permiten desplegarlo en el mismo nodo que el filtro sin GPU dedicada.
- Aviso al usuario en cliente de correo o extension de navegador: la puntuacion softmax de la clase `phishing` se puede mostrar como indicador de riesgo, con un umbral operativo como 0,75, para que la persona decida antes de abrir enlaces.
- Triaje y priorizacion en un SOC: clasificar en lote buzones de reporte de phishing (por ejemplo, la bandeja de `phishing@empresa`) y ordenar los mensajes por probabilidad para que el analista revise primero los casos de mayor riesgo.
- Cuarentena automatica en buzones de soporte y ticketing: los correos entrantes de clientes se pasan por el clasificador y, por encima de un umbral, se mueven a una cola separada con la puntuacion adjunta, reduciendo el ruido de fraude en bandejas compartidas.
- Etiquetado masivo para construir datasets: reprocesar buzones historicos y generar corpus anotados con `safe`/`phishing`, utiles para entrenar o evaluar otros modelos de seguridad, dado que la inferencia es barata y el truncado a 512 tokens acota el coste.
- Analisis forense posterior a un incidente: pasar el volcado de un buzon comprometido por el modelo para localizar mensajes con alta probabilidad de phishing y reconstruir la cronologia del compromiso.
- Formacion y simulacros de concienciacion: en campanas internas de phishing simulado, usar el clasificador para comprobar automaticamente si el correo de prueba es identificable como fraudulento y ajustar su dificultad.
- Integracion en pipelines de CI de seguridad: validar que los correos legitimos de una plantilla corporativa siguen clasificandose como `safe` tras cambios de formato o de idioma de plantilla, como prueba de regresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de exactitud (MMLU, HumanEval, GSM8K ni metricas de precision/recall sobre conjuntos de phishing) en la informacion disponible. La unica tabla publicada mide **fidelidad del puerto**, no calidad del modelo: compara el resultado del GGUF contra PyTorch (fp32, transformers) sobre los mismos identificadores de token, en 50 correos reales (25 legitimos, 25 spam/phishing).

| GGUF | Desviacion maxima en logits | Desviacion maxima en probabilidad | Mismo argmax | Mismo lado del umbral 0,75 |
|---|---|---|---|---|
| f32 | 1,5e-6 | 5,6e-7 | 50/50 | 50/50 |
| f16 | 9,5e-4 | 3,0e-4 | 50/50 | 50/50 |
| q8_0 | 4,5e-2 | 1,3e-2 | 50/50 | 50/50 |

El autor indica explicitamente que esta tabla verifica fidelidad numerica y que **no es un benchmark de exactitud**.

## Requisitos de hardware

- Espacio en disco: 294 MB (Q8_0), 374 MB (F16) o 740 MB (F32), mas 2,5 MB del `spm.model`. El repositorio completo ocupa 1,4 GB.
- Memoria en CPU: aproximadamente 0,3-0,5 GB de RSS con F16 o Q8_0, en batch 1. Para F32 no se ha publicado la cifra.
- GPU: no es necesaria. Por tamano de pesos, cualquier GPU de consumo moderna (por ejemplo, una RTX 3060 de 12 GB) sobra, e incluso cabria en graficas integradas; sin embargo, no hay runtime GPU documentado para esta arquitectura.
- CPU de referencia medida: procesador reciente con AVX-512, 4 hilos.
- Latencia medida: aproximadamente 0,2 s de media y 0,45 s en p95 por correo, con batch 1 en CPU de 4 hilos (F16 y Q8_0).
- Throughput en GPU, throughput con batching y latencia en F32: no disponibles.
- Opciones de despliegue: **llama.cpp estandar no puede cargar estos ficheros** (no tiene soporte de DeBERTa); tampoco Ollama, vLLM ni TGI. Requieren un runtime ggml propio, todavia no publico. Como alternativa en produccion, el modelo original en PyTorch es cargable con transformers, teniendo en cuenta la advertencia sobre el tokenizador en transformers 5.x.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad | Rendimiento en phishing |
|---|---|---|---|---|---|
| `andreilungeanu/email-phishing-detector-v2-GGUF` | Aprox. 185 M (derivado del f32) | 512 tokens | MIT | GGUF con arquitectura `deberta-v2-cls`; requiere runtime ggml propio no publico | Exactitud no publicada; paridad con PyTorch verificada |
| `nhellyercreek/email-phishing-detector-v2` (original) | Los mismos que el modelo base DeBERTa-v3-base | 512 tokens | MIT | Pesos PyTorch, cargables con transformers | Exactitud no publicada |
| `microsoft/deberta-v3-base` | 86 M de backbone (aprox. 184 M con embeddings, segun la ficha oficial) | 512 tokens | MIT | PyTorch/safetensors, ampliamente soportado | No es un clasificador de phishing; es el backbone preentrenado |
| `microsoft/deberta-v3-small` | 44 M de backbone (aprox. 141 M con embeddings, segun la ficha oficial) | 512 tokens | MIT | PyTorch/safetensors, ampliamente soportado | No es un clasificador de phishing; alternativa mas ligera como backbone |

No se dispone de cifras de precision, recall o F1 para ninguna variante de deteccion de phishing, por lo que la comparativa es estructural (tamano, contexto, licencia y disponibilidad) y no de rendimiento.

## Limitaciones y advertencias

- **Solo dos clases.** El modelo distingue entre `safe` y `phishing`; el spam solo se detecta cuando se parece a phishing, y no hay categorias para malware, fraude generico o buzoneo.
- **Solo ve asunto y cuerpo.** El remitente, las cabeceras, las URLs y los adjuntos no son entradas separadas, algo critico porque muchas senales de phishing son de infraestructura (dominios, SPF/DKIM/DMARC, reputacion de enlaces).
- **Datos de entrenamiento no divulgados.** El autor original no publica la composicion del dataset, por lo que se recomienda evaluar el modelo con correo propio antes de confiar en el. Existe riesgo de sesgo hacia el dominio, el idioma y el estilo de los datos de ajuste.
- **Riesgo de alucinacion no aplica en sentido generativo**, pero si existe riesgo de falsos negativos y falsos positivos: al ser un clasificador, una puntuacion alta no implica que el correo sea malicioso y una puntuacion baja no garantiza legitimidad.
- **Truncado a 512 tokens.** Los correos mas largos se recortan por el final, de modo que el contenido malicioso situado en la parte final del cuerpo puede no ser evaluado.
- **Solo ingles.** No hay soporte declarado para otros idiomas, lo que excluye su uso directo en buzones en castellano sin una evaluacion previa.
- **Dependencia de un runtime no publicado.** Los GGUF usan la arquitectura personalizada `deberta-v2-cls` y no cargan en llama.cpp estandar, Ollama, vLLM ni TGI. Para produccion, esto implica un riesgo de mantenimiento alto hasta que el runtime sea publico.
- **Advertencia de tokenizador.** transformers 5.x aplica NFC en lugar de NFKC, lo que convierte NBSP, puntos suspensivos, el simbolo de marca registrada y ligaduras en `[UNK]`; si se usa el modelo original en PyTorch hay que verificar la version del tokenizador.
- **Licencia MIT**, heredada del modelo original y de DeBERTa-v3: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la atribucion incluida en `LICENSE` y `NOTICE`. No hay clausulas de uso aceptable adicionales en la informacion disponible.
- **Madurez y adopcion.** El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay validacion independiente de su calidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreilungeanu/email-phishing-detector-v2-GGUF
- Modelo base original (PyTorch): https://huggingface.co/nhellyercreek/email-phishing-detector-v2
- Backbone preentrenado: https://huggingface.co/microsoft/deberta-v3-base
- Paper de DeBERTa-v3 (arquitectura del backbone): https://arxiv.org/abs/2111.09543
- Paper relacionado sobre deteccion de phishing con LLM: https://arxiv.org/html/2512.10104v2
- Herramientas relacionadas encontradas en la busqueda (no vinculadas a este modelo): https://github.com/0xchandru/phishing-email-detector, https://github.com/nr313/Phishing-Email-Detector, https://gauthamnholla.github.io/phishing-email-detector/, https://devpost.com/software/ai-based-phishing-email-detector-03wv7b
