# GAIK-project/whisper-large-v3-fi-dialects

## Resumen

whisper-large-v3-fi-dialects es un modelo de reconocimiento automatico del habla (ASR) especializado en habla dialectal finlandesa. Se trata de un ajuste fino mediante LoRA sobre openai/whisper-large-v3, desarrollado por Akseli Leskinen en el proyecto GAIK de la Haaga-Helia University of Applied Sciences, en colaboracion con la Universidad de Helsinki y la Universidad de Tampere y con financiacion del Fondo Europeo de Desarrollo Regional (ERDF). El modelo escucha habla en dialectos finlandeses y la transcribe a fines estandar con puntuacion, lo que resuelve un problema concreto: los sistemas ASR genericos se degradan fuertemente ante variantes dialectales.

El modelo mantiene la arquitectura encoder-decoder de Whisper large-v3, con 1.543.490.560 parametros (aproximadamente 1,54 mil millones) y pesos distribuidos en safetensors bajo licencia Apache 2.0. Su ventana de inferencia sigue siendo de 30 segundos de audio, heredada de Whisper, por lo que el audio largo debe trocearse.

Su relevancia actual radica en la mejora medida sobre dialectos: reduce el WER del 40,4 % al 21,1 % en el test dialectal SKN con diez municipios no vistos en entrenamiento, y baja de 25,9 a 13,6 puntos de error semantico por 100 palabras en el corpus LA-murre. Frente a otros ajustes finlandeses entrenados con habla leida, que obtienen entre un 48 % y un 57 % de WER en ese mismo test dialectal, la diferencia es notable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) con ajuste fino LoRA |
| Parametros totales | 1.543.490.560 (aproximadamente 1,54 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por ventana de inferencia; no hay contexto de texto |
| Tipos de cuantizacion | no disponible en el repositorio, que solo publica safetensors; la conversion a GGUF es posible con herramientas externas |
| Idiomas soportados | fines (fi); el modelo base cubre del orden de 99 idiomas, pero este ajuste esta especializado en fines |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | automatic-speech-recognition (ASR) |
| Modelo base | openai/whisper-large-v3 |
| Tamano del repositorio | 6,2 GB |
| Libreria | transformers (requiere transformers 5 o superior) |
| Datasets de entrenamiento | GAIK-project/skn-finnish-dialects-asr, google/fleurs, facebook/voxpopuli |
| Fecha de creacion | 13 de octubre de 2026 (metadatos de HuggingFace) |
| Ultima actualizacion | 14 de octubre de 2026 (metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un transformer encoder-decoder con entrada de espectrograma mel logaritmico y una ventana fija de 30 segundos de audio. El ajuste se realizo con LoRA sobre los pesos del modelo base, lo que explica que el repositorio final mantenga el mismo numero de parametros que el modelo original (1,54 mil millones) y que el tamano del repo en float32 sea de 6,2 GB. El modelo emplea tokens especiales de idioma y tarea, y la inferencia se realiza con `language="fi"` y `task="transcribe"`.

No se dispone del numero de tokens de audio utilizados en el entrenamiento, ni de la composicion exacta del dataset mas alla de las tres fuentes declaradas: el corpus dialectal propio SKN (GAIK-project/skn-finnish-dialects-asr), el conjunto de frases leidas FLEURS en su configuracion fi_fi y el corpus de discurso parlamentario VoxPopuli en fines. Dado que se trata de un modelo ASR, no hay fases de RLHF ni DPO; el ajuste es supervisado sobre pares audio-transcripcion. La innovacion principal es metodologica: el uso de datos dialectales reales de entrevista para especializar un modelo grande de habla, con evaluacion separada por municipios no vistos en entrenamiento para medir generalizacion dialectal.

Existe una variante adicional en la rama `timestamps` del mismo repositorio, entrenada con los tokens de marca temporal de Whisper sobre la mitad de los segmentos de SKN. Esa variante produce tiempos de frase utilizables (el 58 % de los inicios de frase de SKN quedan dentro de 1 segundo, frente al 1 % del modelo principal) y permite transcribir audio largo de una sola pasada con el mecanismo de fallback de temperatura de OpenAI (18,1 % de WER en diez entrevistas dialectales de 4 minutos, frente al 19,8 % del modelo principal), con precision dialectal similar (21,4 % en SKN) y un ligero empeoramiento en VoxPopuli (11,2 %) y en el webinar troceado (15,2 %).

## Capacidades

- Transcripcion de voz a texto en fines, con normalizacion de habla dialectal a fines estandar y salida con puntuacion.
- Robustez ante variacion dialectal: mejora de 19,3 puntos de WER absoluto en el test dialectal SKN respecto al modelo base.
- Reconocimiento de habla leida, con un WER del 7,6 % en FLEURS Finnish, practicamente identico al 7,4 % del modelo base.
- Reconocimiento de habla formal y parlamentaria, con un 10,8 % de WER en VoxPopuli Finnish, mejorando el 12,7 % del modelo base.
- Transcripcion de audio tecnico o especializado: 13,9 % de WER en un webinar odontologico finlandes de 180 segundos decodificado por trozos.
- Decodificacion por lotes mediante el pipeline de transformers (`batch_size` configurable), lo que permite procesar varias piezas de audio en paralelo.
- Seleccion de idioma y tarea mediante `generate_kwargs` (`language="fi"`, `task="transcribe"`).
- Capacidad multilingue teorica heredada de Whisper large-v3, no validada en este ajuste.
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.
- No genera marcas temporales en la variante principal; para eso existe la rama `timestamps` del repositorio.

## Casos de uso

- Investigacion linguistica sobre variacion dialectal: el modelo esta entrenado sobre entrevistas dialectales reales y evaluado con municipios no vistos, por lo que permite transcribir corpus orales y estudiar como se normaliza el dialecto a fines estandar sin anotacion manual previa.
- Archivado de patrimonio oral y entrevistas de historia local: una emisora o un archivo municipal puede transcribir horas de entrevistas grabadas en dialectos regionales usando decodificacion por lotes y troceado en fragmentos de 15 a 25 segundos en los momentos de menor energia de la senal.
- Subtitulado y transcripcion de contenido audiovisual en fines coloquial: podcasts, radio y series con habla dialectal se benefician de la mejora de WER frente al modelo base, aunque para subtitulado con tiempos de frase conviene usar la variante `timestamps`, que situa el 58 % de los inicios de frase dentro del segundo.
- Analitica de discurso parlamentario y debates publicos: sobre VoxPopuli Finnish el modelo obtiene un 10,8 % de WER, mejor que el 12,7 % del base, lo que lo hace util para indexar y buscar intervenciones en archivos legislativos en fines.
- Atencion al cliente y centros de contacto en Finlandia: permite transcribir llamadas con acentos regionales para su posterior analisis de calidad, cumplimiento o generacion de resumenes, con la ventaja de normalizar el dialecto a texto estandar.
- Documentacion clinica y webinars tecnicos: el modelo reduce el WER de 15,7 % a 13,9 % en un webinar odontologico, lo que lo hace apto para generar actas o documentacion a partir de sesiones formativas grabadas.
- Dictado y toma de notas en reuniones internas: con audio a 16 kHz mono y troceado previo, se pueden transcribir reuniones completas en GPU de consumo y alimentar despues un sistema de resumen de texto.
- Normalizacion de habla dialectal como preprocesado: al convertir dialecto a fines estandar, el modelo puede actuar como primera etapa de un pipeline que despues aplique analisis de sentimiento, traduccion automatica u otras tareas sobre texto.
- Evaluacion comparativa de sistemas ASR: sirve como referencia reproducible para comparar modelos genericos frente a especializados en dialectos, dado que el autor publica el codigo, el metodo y todos los resultados en el repositorio GAIK-project/finnish-asr.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Dataset | Metrica | Valor | Verificado |
|---|---|---|---|
| SKN dialect test (10 municipios no vistos) | WER | 21,1 % | no |
| SKN dialect test (10 municipios no vistos) | CER | 8,6 % | no |
| FLEURS Finnish (fi_fi, test) | WER | 7,6 % | no |
| VoxPopuli Finnish (fi, test) | WER | 10,8 % | no |

Comparativa publicada en la model card entre el modelo base y este ajuste (WER tras pasar a minusculas y eliminar puntuacion):

| Prueba | Whisper large-v3 | Este modelo |
|---|---|---|
| Entrevistas dialectales SKN, 10 municipios fuera de entrenamiento, WER % | 40,4 | 21,1 |
| Entrevistas dialectales LA-murre, puntos de error de significado por 100 palabras (juez LLM ciego: critico 10, mayor 5, menor 1) | 25,9 | 13,6 |
| FLEURS Finnish, frases leidas, WER % | 7,4 | 7,6 |
| VoxPopuli Finnish, discurso parlamentario, WER % | 12,7 | 10,8 |
| Webinar odontologico finlandes de 180 s, WER % (ambos decodificados por trozos) | 15,7 | 13,9 |

Datos adicionales aportados por el autor: los ajustes finlandeses ya existentes entrenados con habla leida obtienen entre un 48 % y un 57 % en el mismo test dialectal, y Gemini 3.5 Flash, en modo de pago, un 34,7 % cuando se le pide fines estandar. En la variante `timestamps`, los resultados declarados son 21,4 % en SKN, 11,2 % en VoxPopuli, 15,2 % en el webinar por piezas y 18,1 % en diez entrevistas dialectales de 4 minutos decodificadas de una sola pasada.

## Requisitos de hardware

- Pesos en float16: aproximadamente 3,1 GB de VRAM solo para los pesos (1,54 mil millones de parametros a 2 bytes). En float32, unos 6,2 GB, coherente con el tamano del repositorio.
- Estimacion de VRAM para inferencia: una GPU con 6-8 GB de memoria dedicada es suficiente con pesos en float16, batch moderado y audio troceado en fragmentos de 15 a 25 segundos.
- GPU de consumo: si, el modelo cabe en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o RTX 4090, siempre que se cargue en float16 y no se use un batch excesivo.
- GPU de centro de datos: A100, H100, L40S o T4 son adecuadas para despliegue con mayor paralelismo; el pipeline admite `batch_size=8` de forma directa.
- CPU: es posible ejecutarlo sin GPU (el ejemplo del autor usa `device="cpu"` sin dtype), pero el propio autor advierte que es lento.
- Opciones de despliegue: pipeline de transformers con `transformers>=5` y `torch` y `soundfile`; el repositorio esta marcado como compatible con endpoints. La conversion a GGUF permitiria su uso con whisper.cpp o faster-whisper, aunque no se distribuyen pesos GGUF oficiales. Ollama no esta orientado a este tipo de modelo ASR. La compatibilidad con vLLM o TGI para esta revision concreta no esta documentada.
- Preprocesado obligatorio: audio a 16 kHz mono; whisper escucha como maximo 30 segundos por vez, por lo que el autor recomienda cortar en piezas de 15 a 25 segundos en los momentos de menor energia.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | SKN dialectos (WER) | FLEURS fi (WER) | VoxPopuli fi (WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| whisper-large-v3-fi-dialects | 1,54 B | 30 s | 21,1 % | 7,6 % | 10,8 % | Apache 2.0 | HuggingFace |
| openai/whisper-large-v3 (base) | 1,54 B (equivalente, este modelo deriva de el) | 30 s | 40,4 % | 7,4 % | 12,7 % | Apache 2.0 | HuggingFace |
| whisper-large-v3-fi-dialects, rama timestamps | 1,54 B | 30 s | 21,4 % | no disponible | 11,2 % | Apache 2.0 | HuggingFace (rama timestamps) |
| Gemini 3.5 Flash (preguntado por fines estandar) | no disponible | no disponible | 34,7 % | no disponible | no disponible | propietaria | API de pago |

En la model card se mencionan tambien ajustes finlandeses existentes entrenados con habla leida, sin identificar individualmente, que obtienen entre un 48 % y un 57 % de WER en el mismo test dialectal. No se dispone de datos de otros modelos comparables con nombre y metrica concreta en la informacion proporcionada.

## Limitaciones y advertencias

- Ventana de 30 segundos: Whisper no procesa mas audio de una vez; es necesario trocear manualmente y unir las transcripciones, lo que puede cortar palabras a la mitad si el troceado no se hace en pausas.
- Sin marcas temporales en la variante principal: solo el 1 % de los inicios de frase de SKN caen dentro del segundo respecto a la referencia, por lo que no sirve directamente para subtitulado sincronizado.
- Ligera perdida en habla leida: FLEURS baja de 7,4 % a 7,6 % de WER respecto al modelo base, es decir, la especializacion dialectal no es gratuita en el dominio estandar.
- WER del 21,1 % en dialectos: aunque supone una mejora muy grande, sigue implicando que aproximadamente una de cada cinco palabras se transcribe mal en habla dialectal, lo que exige revision humana en usos criticos.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible en silencios, ruido o musica; el fallback de temperatura ayuda pero no elimina el problema.
- Cobertura de idiomas reducida a efectos practicos al fines; aunque el modelo base sea multilingue, este ajuste solo ha sido entrenado y evaluado en fines.
- Metricas no verificadas: los tres resultados del model-index estan marcados como `verified: false` y proceden del propio autor; no se han publicado evaluaciones independientes.
- Requisito de version: el tokenizador del repositorio exige `transformers>=5`; versiones anteriores no pueden leer los archivos.
- Entrada de audio estricta: 16 kHz mono; otro formato requiere remuestreo previo.
- Adopcion minima: 14 descargas y 0 me gusta en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.
- Licencia Apache 2.0, heredada tambien del modelo base, por lo que el uso comercial esta permitido; conviene citar al proyecto GAIK y a sus financiadores al redistribuir.
- Entrenamiento con datos de entrevistas reales: pueden existir sesgos de dominio (temas, registros y variedades concretas de los municipios recogidos) que no generalicen a otros dialectos finlandeses no representados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GAIK-project/whisper-large-v3-fi-dialects
- Variante con marcas temporales (rama timestamps): https://huggingface.co/GAIK-project/whisper-large-v3-fi-dialects/blob/timestamps/README.md
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Dataset dialectal SKN: https://huggingface.co/datasets/GAIK-project/skn-finnish-dialects-asr
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Codigo, metodo y resultados: https://github.com/GAIK-project/finnish-asr
- Toolkit del proyecto: https://github.com/GAIK-project/gaik-toolkit
- Organizacion GAIK en GitHub: https://github.com/GAIK-project
- Perfil del desarrollador: https://github.com/laguagu
- Proyecto GAIK: https://gaik.ai/
- Haaga-Helia University of Applied Sciences: https://www.haaga-helia.fi/en
- Relato del proyecto en fines: https://gaik-project.github.io/finnish-asr/story/story.fi.html
- Relato del proyecto en ingles: https://gaik-project.github.io/finnish-asr/story/story.en.html
- Demo de escucha y comparacion de modelos: https://gaik-project.github.io/finnish-asr/listen.html

La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion de HuggingFace y de la model card del autor.
