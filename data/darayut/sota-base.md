# Darayut/sota-base

## Resumen

sota-base es un modelo de reconocimiento automático del habla (ASR) con cabecera CTC para khmer e inglés, publicado por el usuario Darayut en HuggingFace. No es un modelo entrenado desde cero: se obtiene podando estructuralmente `omniASR_CTC_300M` de Meta (Omnilingual ASR, Apache 2.0) hasta un 80 % de dispersión en el codificador, lo que reduce el total de 325 M a 72,94 M de parámetros. El resultado es la variante Base de una pareja de modelos podados (la otra es `Darayut/sota-large`), nombrada por analogía con los wavLM Base-s80 / Large-s80 de DiariZen.

Su interés practico esta en el compromiso entre coste y precision: baja el computo de 18,3 a 5,8 GMAC por segundo de audio (unas 3,15 veces menos) y, en khemer, supera tanto a su profesor afinado como al modelo original (CER de 2,60 % en DDD-Test frente a 3,68 % y 9,65 %). En ingles, en cambio, pierde buena parte de la precision del profesor, con un WER de aproximadamente 1,5 a 2 veces superior.

La relevancia es doble: por un lado, demuestra una receta de poda estructurada con destilacion por capas que mejora al profesor en el idioma objetivo; por otro, ofrece un ASR khemer de 73 M de parametros con licencia Apache 2.0, un idioma con muy poca oferta de modelos abiertos. La contrapartida es que las anchuras por capa son no uniformes, por lo que requiere el codigo propio incluido en el repositorio y no carga en fairseq2 ni en `omnilingual-asr`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador CTC estilo wav2vec2 (Omnilingual ASR) con poda estructurada de cabezas de atencion y unidades FFN por capa |
| Parametros totales | 72.940.003 (de ellos, 63 M en el codificador) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (modelo de ASR; no se especifica ventana maxima de audio) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | khemer (km) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `vocab.json` |
| Vocabulario | 9.812 entradas a nivel de caracter (cubre escritura khemer y latina) |
| Dispersión del codificador | 80 % (poda estructurada) |
| Coste de inferencia | 5,8 GMAC por segundo de audio |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un codificador transformer estilo wav2vec2 con salida CTC, usando el vocabulario de 9.812 caracteres de Omnilingual. La poda afecta a cabezas de atencion y a unidades FFN de forma independiente por capa, de manera que cada capa tiene su propia anchura; `config.json` recoge los valores exactos de `num_heads` y `ffn_dims`. El extractor de caracteristicas convolucional y la capa de salida quedan intactos. El codificador podado suma 63 M de parametros. Al ser las anchuras no uniformes, el modelo no se puede cargar con fairseq2 ni con la libreria `omnilingual-asr`; hay que usar el paquete `omniprune` incluido (`model.py`, `hardconcrete.py`, `text.py`).

La receta sigue el articulo *Fine-tune Before Structured Pruning* (arXiv 2505.24111) con el metodo de poda de DPHuBERT (arXiv 2305.17651) tal como se aplica en DiariZen. Primero se afina `omniASR_CTC_300M` con CTC sobre la mezcla de entrenamiento, dando el profesor `omniASR-CTC-300M-km-en`. Despues se poda durante 12.000 pasos con compuertas Hard Concrete L0 sobre cabezas y unidades FFN, usando una restriccion de Lagrange aumentada que escala la dispersión objetivo hasta el 80 %, mientras se destila al profesor con una perdida L1 menos coseno sobre los estados ocultos de las capas 6, 12, 18 y 24. A continuacion se eliminan fisicamente las unidades podadas y se hacen 5.000 pasos de destilacion con la mascara congelada. Por ultimo, 16.000 pasos de recuperacion con CTC mas una divergencia KL a nivel de trama frente a la distribucion de salida del profesor (temperatura 1, peso 1).

La mezcla de entrenamiento es 50/50 por idioma. En khemer: entrenamiento de DDD y de FLEURS-km. En ingles: LibriSpeech train-clean-100 y train-360, mas FLEURS-en. FLEURS se fija en el 20 % del audio de cada idioma. No se documenta uso de RLHF ni de DPO, algo esperable en un modelo CTC supervisado.

## Capacidades

- Transcripcion de voz a texto en khemer e ingles con una unica cabecera CTC y un vocabulario de caracteres compartido.
- Salida a nivel de caracter en el conjunto de caracteres de Omnilingual: texto en minusculas y sin puntuacion khemer.
- Acepta audio de cualquier frecuencia de muestreo: se convierte a mono y se remuestrea a 16 kHz.
- Decodificacion codiciosa (greedy) CTC sin modelo de lenguaje; no se documenta decodificacion con beam search ni shallow fusion.
- Reconocimiento de habla leida y conversacional segun los dominios de entrenamiento (DDD, FLEURS, LibriSpeech).
- Ejecucion en CPU y GPU mediante el script `inference.py` incluido.
- No soporta tool calling, function calling, agentes, vision, audio de entrada mas alla de la transcripcion ni modos de razonamiento explicito.

## Casos de uso

- Transcripcion y archivado de audio en khemer: el modelo obtiene un CER del 2,60 % en DDD-Test, mejor que su profesor de 325 M, por lo que es adecuado para digitalizar y hacer buscable contenido hablado en khemer con un coste computacional bajo (5,8 GMAC por segundo de audio).
- Subtitulado automatico bilingue khemer/ingles: al compartir vocabulario de caracteres y aceptar cualquier frecuencia de muestreo, se puede alimentar directamente con las pistas de audio de un pipeline de video sin preprocesado adicional, teniendo en cuenta que la salida llega sin puntuacion y en minusculas, por lo que hara falta un post-procesado de puntuacion y segmentacion.
- ASR en el borde o en movil sin conexion: con 72,94 M de parametros (unos 292 MB en fp32 y unos 146 MB en fp16), el modelo cabe holgadamente en memoria de dispositivosmoviles de gama media y puede ejecutarse en CPU, lo que permite dictado o transcripcion offline.
- Pre-etiquetado de corpus de voz: al ser un modelo rapido y pequeno, sirve para generar transcripciones iniciales sobre grandes volumenes de audio en khemer que luego se revisan o se usan para entrenar otros sistemas.
- Atencion al cliente y analitica de llamadas: transcripcion de conversaciones en khemer o ingles con un modelo de baja latencia y licencia Apache 2.0, sin coste por licencia para uso comercial; la falta de puntuacion obliga a un modulo posterior para segmentar turnos y frases.
- Baseline de investigacion en compresion de modelos: la pareja profesor/podado, con las recetas de poda y destilacion documentadas paso a paso, sirve como referencia reproducible para estudiar poda estructurada en ASR y para comparar con otros metodos de sparsification.
- Indexado y busqueda de archivos audiovisuales: transcripcion masiva en servidor con GPU modesta para alimentar indices de texto sobre archivos de audio y video en khemer.

## Benchmarks y rendimiento

Datos publicados en la model card. Decodificacion CTC codiciosa, sin modelo de lenguaje. CER para khemer y WER para ingles, en porcentaje (menor es mejor).

| Modelo | Parametros | GMAC / s de audio | DDD-Test (km) | FLEURS-km | FLEURS-en | LibriSpeech test-clean | LibriSpeech test-other |
|---|---|---|---|---|---|---|---|
| `omniASR_CTC_300M` (original) | 325 M | 18,3 | 9,65 | 16,26 | no disponible | 6,53 | 14,45 |
| `omniASR-CTC-300M-km-en` (profesor afinado) | 325 M | 18,3 | 3,68 | 12,64 | 19,51 | 5,89 | 13,86 |
| sota-base | 73 M | 5,8 | 2,60 | 16,39 | 30,24 | 11,15 | 27,36 |

Observaciones del autor: en khemer, sota-base supera en DDD-Test tanto al profesor como al modelo original; en ingles conserva mucha menos precision, con un WER de aproximadamente 1,5 a 2 veces el del profesor. FLEURS-km y FLEURS-en train forman parte de la mezcla de entrenamiento, por lo que sus conjuntos de test son in-domain. El autor indica ademas que los ficheros publicados reproducen exactamente los logits del checkpoint de entrenamiento (diferencia maxima de 0).

## Requisitos de hardware

- VRAM estimada: unos 292 MB para los pesos en fp32 y unos 146 MB en fp16 (calculo a partir de los 72,94 M de parametros); el repositorio completo ocupa 0,3 GB.
- Cabe en cualquier GPU de consumo actual e incluso en iGPU y CPU. No requiere A100 ni H100: es un modelo de 73 M de parametros con 5,8 GMAC por segundo de audio.
- GPU recomendadas: cualquier RTX (por ejemplo 3060, 4060, 4090) para procesar muchos flujos en paralelo; para despliegues de altas horas de audio, una unica GPU de gama media es suficiente.
- Opciones de despliegue: el codigo incluido en `omniprune/` mas `inference.py` (PyTorch, torchaudio, soundfile, safetensors). No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, y no se puede cargar en fairseq2 ni en `omnilingual-asr` por las anchuras no uniformes. Para servir en produccion habria que envolver el modelo en un servicio propio (por ejemplo FastAPI) o exportarlo a otro runtime, algo que la model card no documenta.
- Latencia y throughput: no se publican mediciones de velocidad en tiempo real. El unico dato de coste es 5,8 GMAC por segundo de audio, frente a 18,3 GMAC del modelo de 325 M.
- Almacenamiento y ancho de banda: al ser un modelo tan pequeno, la carga en memoria es practicamente instantanea y permite mantener varias instancias por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Coste (GMAC/s audio) | DDD-Test (km, CER) | LibriSpeech clean (en, WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sota-base | 73 M | 5,8 | 2,60 | 11,15 | Apache 2.0 | HuggingFace (`Darayut/sota-base`) |
| `omniASR-CTC-300M-km-en` (profesor) | 325 M | 18,3 | 3,68 | 5,89 | Apache 2.0 (derivado de Omnilingual) | HuggingFace (`Darayut/omniASR-CTC-300M-km-en`) |
| `omniASR_CTC_300M` (original de Meta) | 325 M | 18,3 | 9,65 | 6,53 | Apache 2.0 | HuggingFace / `omnilingual-asr` |
| `Darayut/sota-large` | no disponible | no disponible | no disponible | no disponible | Apache 2.0 (presumiblemente, no confirmado en la informacion disponible) | HuggingFace (`Darayut/sota-large`) |

Frente a su profesor, sota-base gana 1,08 puntos de CER en khemer y reduce el coste de inferencia unas 3,15 veces, pero pierde 5,26 puntos de WER en LibriSpeech test-clean y 13,5 en test-other. Frente al modelo original de Meta, la mejora en khemer es de 7,05 puntos de CER, aunque el original sigue siendo mejor en ingles (6,53 frente a 11,15 en test-clean).

## Limitaciones y advertencias

- El rendimiento en ingles es notablemente inferior al del profesor: WER de 11,15 en LibriSpeech test-clean y 27,36 en test-other, aproximadamente 1,5 a 2 veces el error del modelo de 325 M. No es recomendable como ASR ingles de proposito general.
- Los conjuntos de test de FLEURS estan presentes en la mezcla de entrenamiento (FLEURS-km y FLEURS-en train), por lo que las cifras de FLEURS son in-domain y no comparables con evaluaciones zero-shot.
- Salida sin puntuacion y en minusculas: el texto khemer carece de puntuacion, lo que exige post-procesado para cualquier uso editorial, de subtitulado o de analitica.
- Decodificacion codiciosa sin modelo de lenguaje: no se documenta beam search ni shallow fusion, de modo que la correccion de errores lexicos es limitada en comparacion con sistemas con LM externo.
- Dominios de entrenamiento acotados a habla leida y de FLEURS/DDD/LibriSpeech; no hay datos sobre robustez ante ruido, acentos, habla espontanea o audio telefónico de banda estrecha.
- Riesgo de alucinacion propio de CTC: en segmentos con silencio, ruido o solapamiento de hablantes puede emitir texto espurio; requiere deteccion de actividad vocal y umbrales de confianza en produccion.
- Integracion limitada: al no cargar en fairseq2 ni en `omnilingual-asr`, y sin soporte en vLLM, llama.cpp, Ollama ni TGI, el despliegue depende del codigo `omniprune` del autor, con el coste de mantenimiento que implica.
- Sesgos no evaluados: la model card no publica analisis de sesgos por genero, edad, dialecto o region; la representacion de variedades del khemer y del ingles depende de DDD, FLEURS y LibriSpeech.
- Licencia Apache 2.0, que permite uso comercial y modificacion con atribucion. Los pesos derivan de `omniASR_CTC_300M` de Meta (Apache 2.0) y `omniprune/hardconcrete.py` se porta de DiariZen (MIT), derivado a su vez de DPHuBERT y FLOP: hay que conservar los avisos de atribucion correspondientes.
- Modelo con 0 descargas y 0 likes en HuggingFace en el momento de la consulta: no hay validacion independiente de las cifras publicadas, que proceden unicamente del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Darayut/sota-base
- Modelo hermano de mayor tamano: https://huggingface.co/Darayut/sota-large
- Profesor afinado: https://huggingface.co/Darayut/omniASR-CTC-300M-km-en
- Articulo de la receta de poda: *Fine-tune Before Structured Pruning* — https://arxiv.org/abs/2505.24111
- Metodo de poda DPHuBERT: https://arxiv.org/abs/2305.17651
- Omnilingual ASR de Meta (modelo base y libreria `omnilingual-asr`): no se proporciona URL en la informacion disponible
- Repositorio DiariZen (origen de `hardconcrete.py`): no se proporciona URL en la informacion disponible
- Demos o espacios: no disponible
