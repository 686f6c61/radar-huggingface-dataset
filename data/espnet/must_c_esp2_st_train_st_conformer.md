# espnet/must_c_esp2_st_train_st_conformer

## Resumen

`espnet/must_c_esp2_st_train_st_conformer` es un modelo de traduccion automatica de voz (speech translation, ST) publicado por el proyecto ESPnet en Hugging Face. Se trata de un paquete de inferencia generado automaticamente a partir de la receta `egs3/must_c/esp2_st` de ESPnet3, entrenado sobre el corpus MuST-C con el sistema `esp2_st`. El modelo traduce audio en ingles a texto en aleman y esta empaquetado como un bundle `model_pack` de la clase `ESPnetSTModel`, con 57.592.032 parametros, todos entrenables y almacenados en `float32`, lo que supone unos 230,37 MB de pesos.

Arquitectonicamente es un sistema end-to-end clasico de ESPnet: un codificador Conformer de 12 bloques con atencion relativa, 4 cabezas de atencion y 256 dimensiones de salida, seguido de un decodificador Transformer autorregresivo. La entrada de audio se procesa con un frontend de espectrograma (`n_fft=400`, `hop_length=160`) y tokenizacion BPE con vocabulario de 4000 unidades tanto en origen como en destino. La relevancia de esta ficha es doble: por un lado sirve como referencia de un sistema ST pequeno (menos de 60 millones de parametros) que cabe en cualquier GPU de consumo; por otro, ilustra el nuevo formato de publicacion de ESPnet3, que empaqueta configuracion, tokenizadores y pesos en un unico artefacto reproducible.

El modelo alcanza 24,22 BLEU (23,54 BLEU en minusculas) sobre `tst-COMMON` de MuST-C en-de y 22,85 BLEU sobre `tst-HE`, con chrF2 de 50,76 y 49,35 respectivamente. No se documenta licencia, idiomas declarados en el repositorio ni pipeline de Hugging Face, por lo que su uso en produccion requiere verificar previamente las condiciones de la receta original de MuST-C y de ESPnet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador Conformer (12 bloques, atencion relativa) + decodificador Transformer; clase `ESPnetSTModel`, tarea `espnet2.tasks.st.STTask` |
| Parametros totales | 57.592.032 (230,37 MB en `float32`) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de audio; procesa secuencias de fotogramas de espectrograma de duracion variable, sin ventana de contexto en tokens de texto) |
| Tipos de cuantizacion | No disponible; el bundle solo contiene pesos en `torch.float32` (100 %) |
| Idiomas soportados | Ingles (origen) a aleman (destino), segun la configuracion de la receta (`src_case: lc.rm`, `tgt_case: tc`, `tgt_lang: de`); el repositorio no declara idiomas |
| Licencia | No disponible |
| Formato de pesos | Pesos PyTorch dentro de un bundle ESPnet3 (`model_pack`); no se distribuyen en safetensors ni GGUF |

Datos adicionales del bundle: 694 modulos (567 hojas), 22.396 buffers (90,27 KB), 0 parametros no entrenables, dtype `torch.float32` al 100 %. Directorio de experimento de origen: `./exp/train_st_conformer`. Tamano del repositorio: 0,2 GB.

## Arquitectura y entrenamiento

El sistema es un modelo de traduccion de voz end-to-end sin cascada intermedia de ASR. El codificador es un Conformer con `output_size: 256`, `num_blocks: 12`, `attention_heads: 4`, `linear_units: 2048`, `dropout_rate: 0.1`, `positional_dropout_rate: 0.1` y `attention_dropout_rate: 0.1`. Emplea `input_layer: conv2d`, pre-normalizacion (`normalize_before: true`), estilo macaron, codificacion posicional relativa (`rel_pos_type: latest`, `pos_enc_layer_type: rel_pos`, `selfattention_layer_type: rel_selfattn`), activacion swish y modulo convolucional con kernel de 31 (`use_cnn_module: true`, `cnn_module_kernel: 31`). El decodificador es de tipo Transformer (la configuracion suministrada aparece truncada en el campo `decoder: tra`). El frontend usa `n_fft: 400` y `hop_length: 160`, es decir, ventanas de 25 ms con salto de 10 ms a 16 kHz, con normalizacion global MVN calculada sobre las estadisticas de entrenamiento.

El entrenamiento se realizo sobre el corpus MuST-C (TED talks) en el par ingles-aleman, con tokenizadores BPE independientes de 4000 unidades para origen y destino (`character_coverage: 1.0`, `model_type: bpe`). El texto origen se normaliza a minusculas y sin puntuacion (`lc.rm`) y el texto destino con truecased (`tc`). Se aplico SpecAugment con `apply_time_warp: true`, dos mascaras de frecuencia de anchura 0-27, cinco mascaras de tiempo con ratio 0,0-0,05 y warp temporal bicubico. La ejecucion fue de un unico dispositivo y un unico nodo (`num_device: 1`, `num_nodes: 1`). No hay constancia en la informacion disponible de fases de RLHF, DPO u optimizacion por preferencias, ni de decodificacion especulativa o mecanismos de atencion lineal.

## Capacidades

- Traduccion de voz a texto (speech translation): recibe audio en ingles y genera la traduccion correspondiente en aleman.
- Reconocimiento implicito del contenido acustico sin modulo ASR intermedio (modelo end-to-end).
- Generacion autoregresiva de texto con decodificacion por busqueda (la configuracion de decodificacion no se detalla en la informacion suministrada).
- Manejo de audio de duracion variable, incluidas las locuciones largas tipicas del corpus MuST-C (charlas TED).
- Inferencia sobre lotes de ejemplos mediante la API `espnet3.publication.InferenceModel`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues mas alla del par ingles-aleman.
- No se documentan capacidades de vision, audio generativo ni modo de razonamiento explicito (`thinking mode`).

## Casos de uso

- Traduccion de charlas y ponencias tecnicas: el modelo esta entrenado sobre MuST-C (TED talks), por lo que su dominio natural son conferencias monologadas en ingles. Se puede usar para generar subtitulos en aleman de grabaciones completas antes de su publicacion.
- Localizacion de contenido educativo audiovisual: transcripcion y traduccion de cursos en video en ingles hacia aleman, con revision humana posterior, aprovechando que el modelo traduce directamente desde el audio sin necesidad de una transcripcion intermedia.
- Investigacion en traduccion de voz end-to-end: sirve como referencia reproducible (baseline) para comparar variantes de arquitectura, tokenizacion o aumento de datos dentro del framework ESPnet3.
- Fine-tuning con recetas ESPnet: al estar empaquetado como bundle reproducible con configuracion completa, es un punto de partida para adaptar el sistema a otros pares de idiomas o dominios mediante el modulo `espnetez`.
- Generacion de subtitulos bilingues para plataformas internas: se puede desplegar en un servicio que reciba audio y devuelva la traduccion alemana para revision editorial, con coste de inferencia muy bajo dado el tamano del modelo.
- Prototipado de asistentes de comprension multilingue: en aplicaciones donde un operador angloparlante necesita entender contenido en aleman, el modelo puede generar la version en ingles a partir del audio aleman previa inversion del par de idiomas mediante ajuste fino.
- Evaluacion comparativa de sistemas ST: uso como punto de comparacion en estudios academicos que midan BLEU, chrF2 o TER frente a sistemas de mayor tamano.
- Despliegue en entornos con recursos limitados: por su tamano (230 MB en fp32) puede ejecutarse en CPU o en GPUs de gama media dentro de un pipeline de procesamiento por lotes nocturno.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los conjuntos de test del corpus MuST-C (ingles-aleman):

| Metrica | tst-COMMON | tst-HE |
|---|---|---|
| BLEU | 24,22 | 22,85 |
| BLEU (lc) | 23,54 | 21,07 |
| BLEU precision 1-gramo | 60,97 | 58,75 |
| BLEU precision 2-gramos | 33,18 | 31,85 |
| BLEU precision 3-gramos | 20,52 | 19,79 |
| BLEU precision 4-gramos | 13,26 | 12,52 |
| Penalizacion por brevedad | 0,8894 | 0,8758 |
| TER | 61,8 | 66,16 |
| TER (lc) | 57,85 | 62,76 |
| chrF2 | 50,76 | 49,35 |
| chrF2 (lc) | 51,44 | 49,8 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, algo esperable dado que no es un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los pesos en `float32` (230,37 MB), mas el espacio de activaciones y buffers de decodificacion; en la practica, entre 1 y 2 GB es suficiente para lotes pequenos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM; una RTX 3060, RTX 4060, RTX 3090, A100 o H100 son mas que suficientes. No requiere memoria de GPU de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, e incluso en GPUs integradas con soporte CUDA o ROCm.
- Inferencia en CPU: viable por el reducido tamano del modelo, aunque la latencia dependera de la duracion del audio y del backend.
- Opciones de despliegue: libreria ESPnet, bundle ESPnet3 (`espnet3.publication.InferenceModel.from_pretrained`), `espnet-model-zoo` y el repositorio `espnet/espnet`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje basado en transformers de texto.
- Latencia y throughput estimados: no disponibles en la informacion suministrada.
- Nota de seguridad: el ejemplo de uso oficial emplea `trust_user_code=True`, lo que implica ejecutar codigo incluido en el bundle. Conviene auditar el contenido antes de desplegarlo en entornos de produccion.

## Comparativa con modelos similares

La informacion suministrada solo describe un modelo de esta familia con detalle. La siguiente tabla recoge lo que puede afirmarse con los datos disponibles:

| Modelo | Parametros | Entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `espnet/must_c_esp2_st_train_st_conformer` (este modelo) | 57.592.032 | audio de duracion variable | en a de | no disponible | Hugging Face, libreria ESPnet |
| `espnet/must_c_st_train_st_conformer` (checkpoint hermano de ESPnet) | no disponible | audio de duracion variable | no disponible | no disponible | Hugging Face, libreria ESPnet |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos (por ejemplo, sistemas ST multilingues de gran tamano o soluciones comerciales) dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. Cualquier comparacion con modelos de la familia Whisper, SeamlessM4T u otros sistemas ST requeriria consultar sus respectivas fichas tecnicas.

## Limitaciones y advertencias

- Unidireccionalidad: el modelo esta entrenado exclusivamente para traducir de ingles a aleman. No soporta otros pares de idiomas sin reentrenamiento.
- Dominio restringido: el corpus MuST-C esta compuesto por charlas TED, por lo que el rendimiento puede degradarse en dominios muy distintos (conversacion espontanea, ruido de fondo, jerga tecnica especifica).
- Normalizacion asimetrica del texto: la entrada de texto de referencia se construye en minusculas y sin puntuacion (`lc.rm`), mientras que la salida esperada esta truecased (`tc`). Esto condiciona el preprocesado en produccion.
- Calidad de traduccion moderada: 24,22 BLEU en `tst-COMMON` y 22,85 BLEU en `tst-HE` implican una tasa de error TER superior al 60 %, por lo que la salida no deberia publicarse sin revision humana en contextos sensibles.
- Riesgo de alucinacion y omisiones: como cualquier sistema de traduccion neuronal autorregresivo, puede generar contenido no presente en el audio original o saltarse fragmentos, especialmente en pasajes con ruido o solapamiento de voces.
- Ausencia de licencia declarada: el repositorio no especifica licencia, lo que impide asumir permiso explicito para uso comercial. Es imprescindible verificar las condiciones de la receta original y del corpus MuST-C.
- Sin declaracion de idiomas ni pipeline: los campos `pipeline`, `languages` y `license` del repositorio aparecen vacios, lo que limita la integracion automatica con herramientas que dependan de esos metadatos.
- Artefacto sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y fue generado automaticamente desde una rama de desarrollo (`branch: espnet3/st-system`, `git: d3455e0d379 (dirty)`), lo que sugiere que no ha pasado por un proceso de revision extenso.
- Solo `float32`: no se distribuyen variantes cuantizadas, lo que descarta optimizaciones de memoria habituales en despliegues de inference server.
- Superficie de seguridad: el uso recomendado por el autor requiere `trust_user_code=True`.
- Sesgos potenciales: al entrenar sobre TED talks, el modelo hereda los sesgos de tematica, registro y representacion de ese corpus, no cuantificados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/espnet/must_c_esp2_st_train_st_conformer
- Checkpoint relacionado de la misma familia: https://huggingface.co/espnet/must_c_st_train_st_conformer
- Arbol de ficheros del checkpoint relacionado: https://huggingface.co/espnet/must_c_st_train_st_conformer/tree/main
- Repositorio ESPnet en GitHub: https://github.com/espnet/espnet
- Documentacion de ESPnet: https://espnet.github.io/espnet/index.html
- Espejo no oficial de ESPnet2 en GitHub: https://github.com/szmmm/ESPNet2
