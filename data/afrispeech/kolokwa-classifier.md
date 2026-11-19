# AfriSpeech/kolokwa-classifier

## Resumen

El modelo `AfriSpeech/kolokwa-classifier` es un clasificador de audio binario desarrollado por la iniciativa AfriSpeech para distinguir entre dos registros del ingles de Liberia: el kolokwa (pidgin liberiano autentico, etiqueta `pure_kolokwa`) y el ingles liberiano formal (registro estandar academico y de radiodifusion, etiqueta `formal_liberian_english`). Se trata de un fine-tuning del modelo preentrenado `facebook/wav2vec2-xls-r-300m`, que opera directamente sobre formas de onda de audio a 16 kHz mono sin necesidad de transcripciones.

El modelo resuelve un problema concreto de curaduria de datos para pipeline de reconocimiento de voz en lenguas africanas de bajos recursos: filtrar y separar registros linguisticos antes de entrenar sistemas ASR, evitando la contaminacion cruzada entre variedades. Su relevancia actual radica en que proporciona una herramienta automatica para esta tarea en un contexto, el liberiano, donde escasean los recursos anotados y los clasificadores especificos de registro.

Con 315,7 millones de parametros y un tamano de repositorio de 1,3 GB, el modelo se distribuye con licencia MIT, lo que facilita su adopcion tanto en investigacion como en produccion. Los pesos estan en formato safetensors y es compatible con la libreria `transformers` y con los endpoints de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (fine-tuning de `facebook/wav2vec2-xls-r-300m`), extractor convolucional congelado + encoder Transformer + cabeza de clasificacion con `classifier_proj_size=256` |
| Parametros totales | 315.701.634 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto; clips de entrenamiento de 3-6 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles), lir (ingles liberiano); registros: kolokwa y ingles liberiano formal |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-xls-r-300m`, un encoder de voz preentrenado multilingue de tipo wav2vec2 (front-end convolucional seguido de un encoder Transformer). Durante el fine-tuning se congela el extractor de caracteristicas convolucional (`freeze_feature_encoder()`) y se ajustan las capas superiores del encoder Transformer junto con una cabeza de clasificacion binaria con proyeccion de 256 dimensiones. La entrada es audio a 16 kHz mono, remuestreado automaticamente desde cualquier formato de entrada.

El entrenamiento se realizo con 20,34 horas de audio (12.803 enunciados equilibrados de 3 a 6 segundos). La clase 1 (kolokwa puro) proviene de 333 programas nativos del corpus *LIRNHGP1DA* Liberian Kolokwa (unas 11,02 horas) y la clase 0 (ingles liberiano formal) del dataset `michsethowusu/kolokwa-speech-text` (unas 11,02 horas). El split es 85 % entrenamiento (17,08 h, 10.739 clips) y 15 % validacion (3,26 h, 2.064 clips), con particion estricta por grabacion y capitulo para garantizar que no haya fuga de hablante ni de sesion en la evaluacion.

## Capacidades

- Clasificacion binaria de audio en dos clases: `0` = `formal_liberian_english`, `1` = `pure_kolokwa`.
- Funciona directamente sobre formas de onda de audio (WAV, MP3, FLAC, M4A) sin necesidad de transcripcion.
- Remuestreo automatico de la entrada a 16 kHz mono.
- Clasificacion por pares (pairwise register ranking): permite comparar dos audios y determinar cual es mas kolokwa, devolviendo la probabilidad P(kolokwa), la margen y el ganador.
- Integracion nativa con el pipeline `audio-classification` de `transformers`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto; es exclusivamente un clasificador de audio.
- Capacidades multilingues limitadas a los dos idiomas declarados (en y lir) y a sus dos registros objetivo.

## Casos de uso

- Curaduria de corpus ASR: filtrar grabaciones de ingles liberiano antes de entrenar un sistema de reconocimiento de voz, separando el registro kolokwa del formal para evitar mezcla de variedades en el mismo conjunto de entrenamiento. Es el caso de uso central declarado por el autor.
- Control de calidad en recoleccion de datos: validar automaticamente que las muestras etiquetadas como kolokwa contienen efectivamente habla en ese registro y detectar desviaciones hacia el ingles formal.
- Enrutamiento de contenido de radiodifusion: clasificar programas y capitulos de audio liberiano para decidir si requieren procesamiento ASR especifico para pidgin o para registro estandar.
- Investigacion sociolinguistica: cuantificar la proporcion de kolokwa frente a ingles formal en un archivo de audio o en un corpus, con una metrica objetiva P(kolokwa) por clip.
- Seleccion de pares en evaluacion de sistemas de voz: dado dos audios, elegir cual es mas representativo del registro kolokwa mediante el comparador por pares incluido en la model card.
- Preprocesado en pipeline de traduccion o subtitulado: etiquetar registros para aplicar modelos de lenguaje o de traduccion distintos segun la variedad detectada.
- Filtrado en plataformas de contenido local: identificar automaticamente contenido en kolokwa para indexacion, recomendacion o moderacion especifica de la comunidad.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas de evaluacion sobre el conjunto de validacion no visto:

| Metrica | Valor |
|---|---|
| Accuracy | 100,0 % |
| F1 Score | 1,0000 |
| ROC-AUC | 1,0000 |
| Loss | 0,0039 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Conviene tomar estas cifras con cautela: un 100 % de exactitud en validacion sugiere que el conjunto de validacion podria no capturar toda la variabilidad de registros del mundo real, a pesar de la particion estricta por hablante y sesion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en precision completa (fp32), en torno a 650 MB en fp16 y menos de 400 MB en int8. Cabe en cualquier GPU consumer moderna con margen amplio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo es lo suficientemente pequeno como para ejecutarse en CPU con latencia aceptable para procesamiento por lotes.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos anos, e incluso en CPU y en dispositivos de borde.
- Opciones de despliegue: `transformers` (pipeline `audio-classification`), `AutoModelForAudioClassification` con `AutoFeatureExtractor`, y despliegue via los endpoints compatibles de Hugging Face. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de texto generativos.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; dependeran del hardware, del tamano de los clips y del batching.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas con otros clasificadores de registro o de dialecto en la informacion proporcionada. Como referencia estructural, se compara con su modelo base y con la alternativa generica de clasificacion de audio:

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriSpeech/kolokwa-classifier | 315,7 M | Audio 16 kHz mono, clips de 3-6 s en entrenamiento | Clasificacion binaria de registro (kolokwa vs. ingles formal) | MIT | Hugging Face |
| facebook/wav2vec2-xls-r-300m | 300 M aprox. | Audio 16 kHz mono | Modelo base de representacion de voz (no clasificador) | no disponible en la informacion | Hugging Face |
| Clasificadores de audio genericos de `transformers` | variable | Audio 16 kHz mono | Clasificacion de audio generica (no especifica de registro liberiano) | variable | Hugging Face |

No se conocen en la informacion disponible otros clasificadores especificos de kolokwa o de registro liberiano con los que comparar directamente.

## Limitaciones y advertencias

- La exactitud del 100 % en validacion debe interpretarse con precaucion; el conjunto de validacion procede de las mismas fuentes de grabacion que el de entrenamiento (aunque con particion por hablante y sesion), por lo que el rendimiento en dominios nuevos (grabaciones telefonicas, ruido ambiental, hablantes no vistos) es desconocido.
- Modelo binario y de dominio muy especifico: no distingue otros registros, acentos ni variedades del ingles liberiano, y no se ha evaluado su comportamiento ante entradas fuera de dominio.
- No se documentan sesgos de genero, edad, region o nivel educativo de los hablantes; la composicion del corpus (333 programas de un unico corpus y un dataset publico) puede introducir sesgos de fuente.
- Riesgo de falsos positivos o negativos en clips cortos, con solapamiento de voces o con mezcla de registros en una misma grabacion.
- Limitaciones de idioma: solo se declaran en y lir; no cubre otras lenguas africanas ni el ingles no liberiano.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda revisar las condiciones de los datasets de origen (`michsethowusu/kolokwa-speech-text` y `michsethowusu/liberian-english-speech`) si se redistribuyen datos derivados.
- Para produccion, es recomendable validar el modelo con un conjunto propio de grabaciones del dominio objetivo antes de confiar en sus etiquetas para curaduria automatica a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AfriSpeech/kolokwa-classifier
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Dataset de kolokwa: https://huggingface.co/datasets/michsethowusu/kolokwa-speech-text
- Dataset de ingles liberiano: https://huggingface.co/datasets/michsethowusu/liberian-english-speech
- Organizacion AfriSpeech: https://huggingface.co/AfriSpeech
