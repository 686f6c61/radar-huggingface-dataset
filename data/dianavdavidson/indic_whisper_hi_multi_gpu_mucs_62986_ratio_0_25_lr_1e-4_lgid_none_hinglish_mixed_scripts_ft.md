# dianavdavidson/indic_whisper_hi_multi_gpu_mucs_62986_ratio_0_25_lr_1e-4_lgid_None_hinglish_mixed_scripts_FT

## Resumen

Este modelo es un ajuste fino para reconocimiento automatico del habla (ASR) desarrollado por el usuario dianavdavidson, derivado del checkpoint parthiv11/indic_whisper_hi_multi_gpu, que a su vez pertenece a la familia Indic Whisper. Se distribuye en Hugging Face bajo licencia MIT y con pesos en formato safetensors, e incorpora 763.857.920 parametros (~764 M), un tamano propio de la clase media de Whisper. El nombre del repositorio apunta a un entrenamiento sobre datos de habla code-mixed hindi-ingles con mezcla de escrituras (devanagari y latina), aunque ni la model card ni la ficha de Hugging Face confirman el conjunto de datos utilizado.

El problema que aborda es la transcripcion de audio Hinglish, un escenario en el que los modelos ASR monoingles fallan con frecuencia porque alternan palabras en hindi y en ingles dentro de la misma frase y la representacion ortografica no es consistente. El modelo se evaluo con una perdida de 0,4475 y un WER global de 28,0150 en el mejor punto registrado (epoca 12), lo que lo situa como una linea base de investigacion mas que como un sistema listo para produccion.

Su relevancia actual es limitada pero concreta: es un ejemplo reproducible de ajuste fino de Whisper sobre habla code-mixed, con hiperparametros documentados y una tabla de evolucion por epoca que permite estudiar el equilibrio entre perdida de validacion y WER. El repositorio tiene 45,8 GB, un tamano muy superior al de los pesos finales, lo que indica la presencia de checkpoints intermedios del entrenamiento. El modelo acumula 68 descargas y 0 likes, por lo que no cuenta con validacion significativa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper, con entrada de espectrograma mel; numero de capas y dimensiones no disponibles |
| Parametros totales | 763.857.920 (~764 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento, caracteristica de la familia Whisper; longitud de contexto de texto del decoder no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors, sin versiones cuantizadas |
| Idiomas soportados | no disponibles en la ficha; el nombre del modelo sugiere hindi e ingles code-mixed (Hinglish) con mezcla de escrituras, sin confirmar en la model card |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | parthiv11/indic_whisper_hi_multi_gpu |
| Tarea (pipeline) | automatic-speech-recognition |
| Tamano del repositorio | 45,8 GB |
| Descargas / likes | 68 / 0 |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

El modelo parte de parthiv11/indic_whisper_hi_multi_gpu, un checkpoint de la familia Indic Whisper orientado a lenguas indias, y conserva la arquitectura encoder-decoder de Whisper: el encoder procesa una representacion mel del audio y el decoder genera texto de forma autorregresiva. Con 763.857.920 parametros, el tamano se situa en la clase de Whisper medium (~769 M), aunque la model card no detalla el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni la longitud maxima de la secuencia de entrada o salida.

El entrenamiento consistio en un ajuste fino supervisado con funcion de perdida de entropia cruzada sobre etiquetas de transcripcion; no hay indicios de RLHF, DPO ni decodificacion especulativa. Los hiperparametros declarados son learning rate 1e-4, batch de entrenamiento 16, acumulacion de gradientes 2 (batch total efectivo 32), semilla 42, optimizador adamw_torch_fused con betas (0,9; 0,999) y epsilon 1e-8, planificador constant_with_warmup con 500 pasos de calentamiento y 100 epocas configuradas, de las que la tabla publicada cubre 15. El conjunto de datos se describe literalmente como "an unknown dataset", por lo que la composicion del corpus, el numero de horas y los tokens de audio procesados no estan disponibles. El nombre del repositorio contiene las claves "mucs_62986", "ratio_0_25", "lgid_None" y "hinglish_mixed_scripts", lo que sugiere un subconjunto de 62.986 ejemplos del corpus MUCS, una proporcion de mezcla de 0,25, ausencia de identificador de idioma (lgid_None) y datos Hinglish con escrituras mezcladas, pero se trata de una inferencia a partir del nombre, no de un dato confirmado.

## Capacidades

- Transcripcion de voz a texto: es un modelo ASR puro que convierte audio en transcripcion, incluyendo habla code-mixed hindi-ingles.
- Manejo de escrituras mezcladas: el ajuste se realizo con datos etiquetados como Hinglish de escrituras mixtas, por lo que esta disenado para emitir texto que puede combinar devanagari y alfabeto latino.
- Procesamiento por ventanas de 30 segundos: al heredar la arquitectura Whisper, el audio debe segmentarse en fragmentos de 30 s o inferiores.
- Ajuste sobre una base multilingue-indica: al derivar de indic_whisper_hi_multi_gpu, conserva las capacidades del checkpoint base, aunque no se documenta que idiomas mantiene tras el ajuste.
- No soporta tool calling ni function calling: es un modelo de reconocimiento de voz, no un modelo de lenguaje conversacional.
- No soporta agentes ni razonamiento multi-paso: no hay capacidades de planificacion, uso de herramientas ni modo de pensamiento.
- No dispone de vision ni de audio mas alla de la transcripcion: no es multimodal en el sentido de imagen-texto.
- No hay funcionalidad de diarizacion ni marcas de hablante: la salida es texto plano, sin metadatos de quien habla.
- Marcas de tiempo y deteccion de idioma: no disponibles; la model card no documenta el uso de tokens especiales de timestamp ni de deteccion de idioma, y el nombre incluye "lgid_None".

## Casos de uso

- Transcripcion de centros de contacto en la India: llamadas de soporte en las que el cliente alterna hindi e ingles pueden transcribirse en fragmentos de 30 s y enviarse a un sistema de analitica; es adecuado porque el ajuste se hizo especificamente sobre habla Hinglish.
- Subtitulado de contenido audiovisual code-mixed: videos de YouTube o redes sociales con comentarios en Hinglish se segmentan en ventanas de 30 s y se transcriben para generar subtitulos, aprovechando que el modelo tolera cambios de idioma dentro de una misma frase.
- Transcripcion de notas de voz en aplicaciones de mensajeria: mensajes de audio cortos de usuarios indios pueden convertirse a texto en el dispositivo o en servidor, dado que el modelo (~764 M) cabe en GPU de consumo.
- Anotacion asistida de corpus: un equipo de investigacion puede usar el modelo para preanotar horas de audio Hinglish y corregir despues manualmente, reduciendo el coste de anotacion frente a la transcripcion desde cero.
- Linea base para investigacion en ASR code-mixed: sirve como punto de comparacion reproducible para experimentos de ajuste fino, ya que publica hiperparametros, semilla y la evolucion de WER por epoca.
- Analisis de calidad y cumplimiento en grabaciones: la transcripcion permite buscar palabras clave en conversaciones grabadas, con la advertencia de que un WER del 28 % obliga a revisar cualquier decision automatizada.
- Preprocesado para busqueda y recuperacion de audio: indexar un archivo de audio transcrito para permitir busqueda por texto sobre grabaciones de reuniones o clases en Hinglish.
- Generacion de conjuntos de datos para otros modelos: las transcripciones pueden alimentar corpus de texto en hindi, ingles y escritura mixta para entrenar modelos de lenguaje, siempre que se revise la calidad.

## Benchmarks y rendimiento

El model-index publicado por el autor esta vacio, por lo que no hay resultados de referencia en formato estandar (MMLU, HumanEval, GSM8K y similares no aplican a un modelo ASR). Los unicos datos disponibles son los de la evaluacion durante el entrenamiento, que se reproducen tal cual se declaran. El mejor resultado registrado es el de la epoca 12, con perdida de validacion 0,4475 y WER global 28,0150.

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | WER global |
|---|---|---|---|---|
| 1.0 | 1567 | 0,5354 | 0,3542 | 41,0944 |
| 2.0 | 3134 | 0,3509 | 0,3370 | 39,3036 |
| 3.0 | 4701 | 0,2595 | 0,3491 | 32,6244 |
| 4.0 | 6268 | 0,2011 | 0,3422 | 36,0266 |
| 5.0 | 7835 | 0,1572 | 0,3617 | 31,6422 |
| 6.0 | 9402 | 0,1272 | 0,3746 | 31,2749 |
| 7.0 | 10969 | 0,1052 | 0,3935 | 31,7618 |
| 8.0 | 12536 | 0,0894 | 0,4206 | 31,4287 |
| 9.0 | 14103 | 0,0792 | 0,4277 | 30,4094 |
| 10.0 | 15670 | 0,0698 | 0,4365 | 30,4123 |
| 11.0 | 17237 | 0,0631 | 0,4438 | 30,8535 |
| 12.0 | 18804 | 0,0579 | 0,4475 | 28,0150 |
| 13.0 | 20371 | 0,0530 | 0,4742 | 28,8207 |
| 14.0 | 21938 | 0,0492 | 0,4554 | 29,0827 |
| 15.0 | 23505 | 0,0455 | 0,4678 | 28,1915 |

Resultado final declarado en la model card sobre el conjunto de evaluacion: Loss 0,4475 y Global WER 28,0150. Se observa que la perdida de validacion deja de mejorar a partir de la epoca 2 mientras la perdida de entrenamiento sigue descendiendo hasta 0,0455, un patron compatible con sobreajuste; el WER, sin embargo, mejora de forma irregular hasta la epoca 12. No se han publicado comparaciones con otros sistemas ni mediciones sobre conjuntos de prueba independientes en la informacion disponible.

## Requisitos de hardware

- Peso de los parametros en memoria: aproximadamente 3,1 GB en FP32 (763.857.920 x 4 bytes), 1,5 GB en FP16/BF16, 0,8 GB en INT8 y 0,4 GB en INT4.
- VRAM estimada para inferencia: alrededor de 2 a 4 GB en FP16 con lotes pequenos, sumando activaciones del encoder sobre ventanas de 30 s y la cache del decoder. Cifra estimada por calculo a partir del numero de parametros, no medida ni publicada por el autor.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090. No requiere GPU de centro de datos.
- GPU de centro de datos: A100 y H100 no son necesarias para inferencia de una sola peticion; solo tendrian sentido para maximizar el throughput con lotes grandes.
- CPU y Apple Silicon: al ser un modelo de ~764 M y disponer de implementaciones compatibles con Whisper, es viable en CPU y en chips de Apple mediante whisper.cpp, con latencias mas altas.
- Opciones de despliegue: pipeline de transformers, Hugging Face Inference Endpoints (el repositorio esta marcado como endpoints_compatible), faster-whisper sobre CTranslate2, whisper.cpp con pesos convertidos a GGUF y servidores compatibles con OpenAI para Whisper.
- Cuantizacion: no hay pesos cuantizados publicados en el repositorio; habria que generarlos a partir de los safetensors.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tiempo de inferencia ni de factor de tiempo real.

## Comparativa con modelos similares

Los datos de los modelos comparados son caracteristicas publicas ampliamente conocidas de la familia Whisper y no proceden de la informacion proporcionada en esta ficha; se incluyen como referencia de categoria. No hay comparacion de WER disponible entre ellos y este modelo.

| Modelo | Parametros | Ventana de audio | Licencia | Notas |
|---|---|---|---|---|
| dianavdavidson/indic_whisper_hi_multi_gpu_mucs_62986_ratio_0_25_lr_1e-4_lgid_None_hinglish_mixed_scripts_FT | ~764 M | 30 s | MIT | Ajuste especifico para Hinglish con escrituras mixtas; WER global 28,015 en su propia evaluacion; 68 descargas |
| openai/whisper-medium | ~769 M | 30 s | MIT | Modelo general multilingue de la misma clase de tamano; no ajustado a Hinglish |
| openai/whisper-large-v3 | ~1,55 B | 30 s | Apache-2.0 | Mayor tamano y mayor cobertura de idiomas; coste de inferencia superior |
| ai4bharat/indicwhisper | ~1,55 B (base Whisper large) | 30 s | no verificada en esta ficha | Familia de ajustes para lenguas indias; no cubre necesariamente code-mixing con escritura latina |

## Limitaciones y advertencias

- WER elevado: el 28,0150 % de error global en su propio conjunto de evaluacion implica que aproximadamente una de cada tres o cuatro palabras se transcribe de forma incorrecta; no es adecuado para transcripcion automatica sin revision humana.
- Sobreajuste probable: la perdida de validacion empeora desde la epoca 2 (0,3370) hasta la epoca 15 (0,4678) mientras la perdida de entrenamiento baja hasta 0,0455; el checkpoint publicado corresponde al mejor WER, no necesariamente al mejor estado de generalizacion.
- Conjunto de datos desconocido: la model card indica explicitamente "an unknown dataset", por lo que no se puede evaluar la composicion, los sesgos de dominio ni la representatividad del corpus de entrenamiento.
- Idiomas no declarados: la ficha de Hugging Face no lista idiomas soportados; el uso de Hinglish se deduce del nombre del repositorio y no esta confirmado por el autor.
- Ausencia de validacion por la comunidad: 68 descargas y 0 likes desde su publicacion, sin informes de terceros ni evaluaciones independientes.
- Inconsistencia de escritura: al entrenarse con escrituras mixtas, la salida puede alternar devanagari y alfabeto latino de forma no determinista, lo que complica el postprocesado y la comparacion de transcripciones.
- Riesgo de alucinacion en silencios y ruido: los modelos de la familia Whisper tienden a generar texto plausible cuando el audio contiene silencio, musica o ruido; este comportamiento no esta documentado ni corregido en esta version.
- Limitacion de ventana: el audio debe trocearse en segmentos de 30 s; los contextos mas largos requieren un pipeline externo de segmentacion y pueden perder coherencia entre fragmentos.
- Restricciones de licencia: el modelo se publica bajo MIT, lo que permite uso comercial, pero la licencia del modelo base parthiv11/indic_whisper_hi_multi_gpu no se detalla en la informacion disponible y conviene verificarla antes de un despliegue comercial.
- Model card incompleta: las secciones de descripcion, usos previstos y datos de entrenamiento contienen "More information needed", por lo que faltan detalles de procedencia y de evaluacion.
- Sin cuantizaciones oficiales: no hay pesos GGUF, GPTQ ni AWQ publicados, de modo que cualquier despliegue optimizado exige una conversion propia con el riesgo de degradacion adicional del WER.
- Repositorio de gran tamano: 45,8 GB frente a los aproximadamente 3 GB de los pesos, lo que sugiere checkpoints intermedios y aumenta el coste de descarga y almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dianavdavidson/indic_whisper_hi_multi_gpu_mucs_62986_ratio_0_25_lr_1e-4_lgid_None_hinglish_mixed_scripts_FT
- Modelo base: https://huggingface.co/parthiv11/indic_whisper_hi_multi_gpu
- Modelos de referencia de la familia Whisper: https://huggingface.co/openai/whisper-medium y https://huggingface.co/openai/whisper-large-v3
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relevante sobre este modelo; los unicos resultados obtenidos fueron paginas no relacionadas sobre manualidades y teatro de sombras, por lo que no se incluyen. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
