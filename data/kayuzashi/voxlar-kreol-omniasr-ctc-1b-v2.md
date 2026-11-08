# Kayuzashi/voxlar-kreol-omniasr-ctc-1b-v2

## Resumen

Voxlar Kreol omniASR CTC 1B v2 es una conversión a ONNX con cuantización int8 del modelo omniASR_CTC_1B_v2 de Meta, publicada por el usuario Kayuzashi para su uso en la aplicación Voxlar. El modelo original forma parte de la familia Omnilingual ASR de Meta, una colección de sistemas de reconocimiento automático del habla diseñados para cubrir un amplio espectro de lenguas, incluidas aquellas con pocos recursos. Esta versión concreta está orientada al criollo mauriciano (Kreol Morisien) y a su uso mezclado con francés e inglés, y se distribuye empaquetada para el runtime sherpa-onnx, lo que permite ejecutar la inferencia en local en el ordenador del usuario sin depender de servicios en la nube.

El modelo emplea una arquitectura CTC (Connectionist Temporal Classification) con aproximadamente 1.000 millones de parámetros, pesos en int8 y un vocabulario basado en caracteres. El repositorio ocupa 1,0 GB y el archivo principal `model.int8.onnx` pesa 1.032.239.439 bytes. La entrada debe ser audio mono a 16 kHz y la salida se genera en minúsculas y sin puntuación. La licencia es Apache 2.0, heredada del lanzamiento original de Meta, y la conversión no está avalada por Meta.

Su relevancia radica en dos factores: por un lado, aborda una lengua de bajos recursos como el criollo mauriciano, para la que existen muy pocos sistemas ASR disponibles; por otro, ofrece un artefacto listo para desplegar en sherpa-onnx con cuantización int8, lo que reduce los requisitos de memoria a unos 1,1 GB en carga y permite dictado local en hardware de consumo. No obstante, el propio autor reporta un WER del 29,2 % en su conjunto de evaluación, con un punto débil claro en las palabras francesas intercaladas dentro del criollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC sobre encoder tipo transformer (familia Omnilingual ASR de Meta); detalles internos del encoder no disponibles en la informacion proporcionada |
| Parametros totales | 1B (aproximadamente 1.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrada de audio mono a 16 kHz) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | mfe (criollo mauriciano), fr (frances), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.int8.onnx`) |
| Vocabulario | basado en caracteres (`tokens.txt`) |
| Entrada de audio | mono, 16 kHz |
| Salida | texto en minusculas, sin puntuacion |
| Runtime objetivo | sherpa-onnx (ONNX Runtime) |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint omniASR_CTC_1B_v2 de Meta, que pertenece a la familia Omnilingual ASR. La arquitectura es de tipo CTC, un enfoque que alinea directamente las secuencias de audio con las etiquetas de caracteres sin necesidad de un decodificador autorregresivo, lo que simplifica el pipeline de inferencia y reduce la latencia. El vocabulario es a nivel de carácter, según indica la model card (`tokens.txt` contiene el vocabulario de caracteres del modelo). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden al modelo original de Meta y no se incluyen en la información proporcionada.

La innovación principal de esta publicación no está en la arquitectura, sino en el proceso de conversión y cuantización: el checkpoint original se ha exportado a ONNX y cuantizado a int8 para su uso con sherpa-onnx. El autor incluye un archivo `onnx-session.config` que desactiva el memory arena de ONNX Runtime, y un archivo `NOTICE` que documenta los cambios respecto al lanzamiento de Meta. El resultado es un artefacto de 1 GB que se carga en aproximadamente 1,1 GB de memoria y que procesa audio a 16 kHz en local.

## Capacidades

- Reconocimiento automático del habla (ASR) en criollo mauriciano (Kreol Morisien).
- Reconocimiento de habla mezclada criollo-francés y criollo-inglés, aunque con mayor tasa de error en los tramos en francés.
- Transcripción de audio mono a 16 kHz con salida en minúsculas y sin puntuación.
- Ejecución local mediante sherpa-onnx, sin necesidad de conexión a servicios externos.
- Cuantización int8 que reduce el uso de memoria a aproximadamente 1,1 GB en carga.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción ASR.
- Capacidades multilingües limitadas a los tres idiomas declarados (mfe, fr, en); no hay información sobre otros idiomas.

## Casos de uso

- Dictado local en criollo mauriciano: la aplicación Voxlar descarga este modelo para ofrecer dictado en el propio PC del usuario, sin enviar audio a la nube. Es adecuado por su tamaño contenido (1 GB), su licencia Apache 2.0 y su integración directa con sherpa-onnx.
- Transcripción de reuniones o notas de voz con hablantes que alternan criollo y francés: el modelo está entrenado para habla mezclada, aunque el autor advierte que los tramos en francés son su punto débil (59 % de error en esas secciones), por lo que conviene revisar manualmente esas partes.
- Subtitulado o indexación de contenido audiovisual en criollo mauriciano: la salida en minúsculas y sin puntuación puede postprocesarse para añadir puntuación y mayúsculas antes de publicar subtítulos.
- Asistentes de voz para usuarios de criollo mauriciano: al ejecutarse en local con sherpa-onnx, puede integrarse en aplicaciones de escritorio o sistemas embebidos con requisitos de privacidad estrictos.
- Investigación lingüística y documentación de lenguas de bajos recursos: el modelo sirve como base para experimentos de ASR en criollo mauriciano y para comparar con otros sistemas, dado que hay pocas alternativas públicas para este idioma.
- Prototipado rápido de pipelines ASR multilingües: la combinación de ONNX int8 y sherpa-onnx permite desplegar el modelo en entornos con CPU de 16 hilos (aproximadamente 2,3 s por cada 10 s de audio con 8 hilos) sin GPU dedicada.

## Benchmarks y rendimiento

El autor reporta resultados de WER sobre 20 clips de dictado de un único hablante mauriciano (985 palabras), comparando con Parakeet Redux:

| Clips | omniASR CTC 1B v2 (este archivo) | Parakeet Redux |
|---|---|---|
| Todos | 29,2 % | 72,9 % |
| Solo criollo | 22,8 % | 93,6 % |
| Criollo y francés | 38,8 % | 66,1 % |
| Criollo e inglés | 27,2 % | 55,6 % |

El autor señala además que las palabras francesas intercaladas dentro del criollo alcanzan un 59 % de error. En cuanto a velocidad, en un portátil con CPU de 16 hilos y 8 hilos en uso, el modelo procesa aproximadamente 2,3 s por cada 10 s de audio, con un consumo de memoria de unos 1,1 GB en carga. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuración reportada; el modelo se ejecuta en CPU. En GPU, el uso de memoria sería aproximadamente el tamaño del modelo int8 (alrededor de 1 GB) más el overhead del runtime, aunque no se proporcionan cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada; el autor solo documenta ejecución en CPU.
- ¿Cabe en GPU de consumo? Con un peso de aproximadamente 1 GB en int8, es plausible que quepa en GPUs de consumo con 4 GB o más de VRAM, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: sherpa-onnx (runtime objetivo), con ONNX Runtime como backend. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo ASR CTC.
- Latencia y throughput: aproximadamente 2,3 s por cada 10 s de audio en un portátil con CPU de 16 hilos usando 8 hilos; memoria en carga de aproximadamente 1,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento reportado |
|---|---|---|---|---|---|---|
| Voxlar Kreol omniASR CTC 1B v2 (este) | 1B | no disponible | mfe, fr, en | Apache 2.0 | ONNX int8 | WER 29,2 % global; 22,8 % solo criollo |
| facebook/omniASR-CTC-1B (original de Meta) | 1B | no disponible | multilingüe (familia Omnilingual ASR) | Apache 2.0 | safetensors (presumiblemente) | no disponible en la informacion proporcionada |
| Parakeet Redux | no disponible | no disponible | no disponible | no disponible | no disponible | WER 72,9 % global; 93,6 % solo criollo en la evaluación del autor |

La comparación con Parakeet Redux proviene únicamente de la evaluación del autor sobre 20 clips de un solo hablante, por lo que debe tomarse con cautela. No se dispone de datos de otros modelos ASR específicos para criollo mauriciano en la información proporcionada.

## Limitaciones y advertencias

- El WER global reportado es del 29,2 %, y en tramos con palabras francesas intercaladas alcanza el 59 % de error; no es adecuado para transcripción de alta precisión sin revisión humana.
- La evaluación se realizó sobre 20 clips de un único hablante mauriciano (985 palabras), por lo que los resultados pueden no generalizar a otros hablantes, acentos o condiciones acústicas.
- La salida es en minúsculas y sin puntuación; requiere postprocesado para muchos usos finales.
- El modelo está limitado a tres idiomas (mfe, fr, en) y no se documentan capacidades para otras lenguas.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o acentos no representados en el conjunto de evaluación; no hay datos sobre sesgos específicos.
- La licencia Apache 2.0 permite uso comercial, pero la conversión no está avalada por Meta y el autor incluye un NOTICE con los cambios realizados; conviene revisar dicho archivo antes de redistribuir.
- El modelo está empaquetado para sherpa-onnx; no se garantiza su funcionamiento con otros runtimes sin conversión adicional.
- No se dispone de información sobre el proceso de entrenamiento original, la composición del dataset ni posibles sesgos demográficos o lingüísticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kayuzashi/voxlar-kreol-omniasr-ctc-1b-v2
- Repositorio de Omnilingual ASR de Meta: https://github.com/facebookresearch/omnilingual-asr
- Modelo original de Meta en Hugging Face: https://huggingface.co/facebook/omniASR-CTC-1B
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
