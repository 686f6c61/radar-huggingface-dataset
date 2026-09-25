# elchintoyirov/auris-1-uzbek-stt

## Resumen

Auris 1 es un modelo de reconocimiento automatico del habla (ASR) para uzbeko en alfabeto latino, desarrollado por Elchin Toyirov y publicado en HuggingFace. Se construye mediante fine-tuning de `facebook/wav2vec2-xls-r-300m`, un transformer convolucional-recurrente con atencion, sobre el que se anade un cabezal CTC de clasificacion sobre un vocabulario de 31 tokens. El resultado es un modelo de 315,5 millones de parametros (315.470.495 en safetensors) en fp32, con 24 capas y tamano oculto de 1024, que se distribuye junto con un modelo de lenguaje KenLM de 4-gramos (trie cuantizado de 201 MB, 842.177 unigramas) para decodificacion por haz.

Su relevancia es pragmatica mas que competitiva: el propio autor declara explicitamente que el objetivo es el coste y la previsibilidad, no el error minimo. El modelo transcribe en tiempo real sin GPU (factor de tiempo real de 0,130-0,135 con 8 hilos de CPU) y consume 1,1 GB de RAM en reposo. Ademas, esta disenado para manejar los prestamos lexicos del ruso y los numerales rusos que los hablantes de uzbeko intercalan en frases cotidianas, un fenomeno muy frecuente en el uzbeko real y a menudo mal cubierto por modelos multilingues genericos.

El modelo se publica bajo licencia Apache 2.0, con un repositorio de 1,5 GB (1,26 GB de pesos mas 201 MB de modelo de lenguaje), y en el momento de la consulta acumula 0 descargas y 0 "likes", por lo que puede considerarse un artefacto reciente y practicamente sin adopcion publica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (transformer convolucional + atencion, cabezal CTC), 24 capas, hidden size 1024 |
| Parametros totales | 315.470.495 (315,5 M), fp32 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: CTC sin ventana de contexto autoregresiva; procesa el clip completo en una pasada, por lo que la memoria de atencion escala con la duracion del audio |
| Tipos de cuantizacion | no disponible: solo se publican pesos fp32; no se documentan versiones GGUF ni cuantizadas |
| Idiomas soportados | uzbeko (`uz`) en alfabeto latino; incluye prestamos del ruso y numerales rusos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`), mas trie KenLM cuantizado de 201 MB en el repositorio |
| Entrada | audio mono a 16 kHz, float32 |
| Vocabulario | 31 tokens (uzbeko latino) |
| Decodificador incluido | KenLM 4-gramos, 842.177 unigramas, 201 MB |
| Tamano del repositorio | 1,5 GB (1,26 GB pesos + 201 MB LM) |
| Modelo base | facebook/wav2vec2-xls-r-300m (fine-tune) |
| Fecha de creacion (HuggingFace) | 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura es `Wav2Vec2ForCTC`: un extractor de caracteristicas convolucionales sobre audio crudo a 16 kHz, seguido de 24 capas de transformer con tamano oculto 1024, y un cabezal lineal de clasificacion CTC sobre 31 tokens. No hay decodificador autoregresivo. El modelo se inicializa desde `facebook/wav2vec2-xls-r-300m` y se especializa mediante fine-tuning supervisado con CTC para uzbeko. La informacion disponible no detalla el numero de tokens de audio de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en la practica a un sistema CTC puro).

La innovacion funcional no esta en la arquitectura, sino en el empaquetado: el modelo se distribuye junto con un modelo de lenguaje KenLM de 4-gramos que se usa en decodificacion por haz. Esto reduce el WER de 24,02 % a 13,69 % en FLEURS `uz_uz` y de 16,31 % a 11,83 % en el split speaker-disjoint de Uzbek Speech Corpus, frente a decodificacion greedy. Segun las mediciones del autor, ese salto de precision es practicamente gratis en CPU, ya que la busqueda por haz cuesta mucho menos que la pasada acustica. Un detalle de diseno relevante es que el autor construyo un split propio speaker-disjoint sobre Uzbek Speech Corpus porque 26 hablantes aparecian en mas de un split oficial, lo que invalidaba la separacion por hablante de los splits publicados; el re-split se hizo agrupando todos los splits oficiales y repartiendo por hablante con ranking determinista sha256 y semilla 13, sobre 1.858 clips y 30 hablantes.

## Capacidades

- Transcripcion de voz a texto en uzbeko con alfabeto latino, sobre audio mono a 16 kHz.
- Manejo de prestamos lexicos del ruso y de numerales rusos intercalados en frases en uzbeko.
- Decodificacion CTC greedy sin dependencias adicionales, o decodificacion por haz con el KenLM 4-gramos incluido.
- Inferencia en tiempo real sin GPU y con huella de memoria reducida, lo que permite despliegue en CPU de gama baja.
- Resistencia estructural a la alucinacion en audio sin habla: al no existir decodificador autoregresivo, el CTC solo emite lo que escucha fotograma a fotograma. En dos pruebas del autor (tres segundos de silencio digital y tres segundos de ruido blanco de bajo nivel) la decodificacion greedy no devolvio texto.
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente ni razonamiento multi-paso.
- No tiene capacidades de vision, audio generativo, traduccion ni generacion de texto libre: la salida es siempre una transcripcion.
- Cobertura multilingue limitada a un unico idioma (`uz`); el vocabulario de 31 tokens no contempla el cirilico uzbeko ni otros idiomas distintos de los prestamos rusos.

## Casos de uso

- Transcripcion por lotes de archivos de audio en uzbeko: el modelo procesa clips completos en una sola pasada CTC, con un factor de tiempo real de 0,007-0,008 en GPU y 0,130-0,135 en CPU de 8 hilos, de modo que un servidor sin GPU puede transcribir aproximadamente entre 6 y 8 horas de audio por hora de computo.
- Subtitulado y accesibilidad en television o plataformas de video uzbecas: la latencia mediana de 371-406 ms para clips de hasta 5 segundos en CPU permite generar subtitulos casi en directo sin depender de aceleradores.
- Asistentes de voz y telefonia para atencion al cliente: con 1,1 GB de RAM en reposo y 3,3 GB de pico, el modelo cabe en una instancia pequena y se puede desplegar por replicas baratas para transcribir llamadas antes de pasarlas a un LLM.
- Procesamiento de corpus y datasets de investigacion: el script de fine-tuning sobre XLS-R y la salida CTC plana facilitan generar transcripciones masivas de archivos uzbecos con separacion por hablante para estudios linguisticos.
- Sistemas de dictado y documentacion clinica o legal en uzbekos: el manejo de prestamos rusos y numerales rusos es util en dominios donde la terminologia tecnica y las cifras se pronuncian habitualmente en ruso.
- Indexacion y busqueda de archivos de audio (podcasts, archivos historicos, grabaciones de reuniones): la transcripcion masiva habilita busqueda por texto sobre material que hoy solo existe como audio.
- Moderacion y analisis de contenido en plataformas: transcripcion previa al analisis semantico de audio generado por usuarios, con la ventaja de que el modelo apenas inventa contenido cuando no hay habla.
- Prototipado con presupuesto minimo: dado que se ejecuta sin GPU y con dependencias estandar de Python (`transformers`, `torch`, `soundfile`, `pyctcdecode`, `kenlm`), sirve para validar un producto de voz en uzbeko antes de invertir en infraestructura.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (campo `verified: false` en el model-index; no verificados de forma independiente).

| Conjunto de evaluacion | Clips | Decodificacion | WER | CER |
|---|---:|---|---:|---:|
| FLEURS `uz_uz`, test | 707 | haz con LM 4-gramos | 13,69 % | 3,72 % |
| Uzbek Speech Corpus (split speaker-disjoint propio) | 1.858 | haz con LM 4-gramos | 11,83 % | 4,50 % |
| FLEURS `uz_uz`, test | 707 | greedy sin LM | 24,02 % | no disponible |
| Uzbek Speech Corpus (split speaker-disjoint propio) | 1.858 | greedy sin LM | 16,31 % | no disponible |

Detalles del split propio de Uzbek Speech Corpus: 30 hablantes y 1.858 clips, construido agrupando todos los splits oficiales y repartiendo por hablante con ranking determinista sha256 y semilla 13, porque 26 hablantes aparecian en mas de un split oficial.

Metricas de coste declaradas por el autor (batch size 1, mas de 120 clips de cada conjunto de prueba; los rangos cubren los dos conjuntos):

| Metrica | GPU (RTX 5060 Ti) | CPU, 8 hilos | CPU, 4 hilos |
|---|---|---|---|
| Factor de tiempo real, con LM | 0,007 - 0,008 | 0,130 - 0,135 | 0,153 - 0,162 |
| Factor de tiempo real, greedy | 0,005 - 0,0065 | 0,131 - 0,136 | 0,158 - 0,159 |
| Latencia mediana, clips <= 5 s | 21 - 26 ms | 371 - 406 ms | 424 - 451 ms |
| Memoria residente tras cargar | 1,6 GB VRAM | 1,1 GB RAM | 1,1 GB RAM |
| Memoria residente pico | 1,6 GB VRAM | 3,3 GB RAM | 3,3 GB RAM |

No se han publicado en la informacion disponible resultados de benchmarks comparativos frente a otros modelos ASR de uzbeko.

## Requisitos de hardware

- VRAM para inferencia: 1,6 GB en GPU, tanto en carga como en pico, para clips de hasta 5 segundos.
- RAM en CPU: 1,1 GB residente tras la carga y 3,3 GB en pico. El autor advierte expresamente de que hay que dimensionar el despliegue en CPU para unos 3,3 GB y no para los 1,1 GB observados tras la carga, porque la autoatencion asigna memoria de forma transitoria en proporcion a la duracion del clip.
- Cabe holgadamente en cualquier GPU de consumo con mas de 2 GB de VRAM. El autor midio sobre una RTX 5060 Ti; tambien funcionaria en GTX 1650, RTX 3050, RTX 4060 y similares. No requiere A100 ni H100.
- CPU: el autor midio con 8 y con 4 hilos, con factores de tiempo real de 0,130-0,135 y 0,153-0,162 respectivamente. Menos nucleos implicaran mayor latencia; hay que medir sobre el hardware propio antes de dimensionar.
- Opciones de despliegue: `transformers` con `Wav2Vec2ForCTC` y `Wav2Vec2ProcessorWithLM` (decodificacion por haz) o `Wav2Vec2Processor` (greedy). La carga del procesador con LM tarda unos 8 segundos porque construye el trie del modelo de lenguaje. Dependencias necesarias: `transformers`, `torch`, `soundfile`, `pyctcdecode` y `kenlm`; el ejemplo con `pipeline` requiere ademas `ffmpeg` en el PATH.
- Latencia: 21-26 ms en GPU y 371-406 ms en CPU de 8 hilos para clips de hasta 5 segundos (decodificacion con LM, batch size 1).
- Throughput estimado a partir de los factores de tiempo real declarados: aproximadamente 125-143 veces tiempo real en GPU con LM, y aproximadamente 6,2-7,7 veces tiempo real en CPU con 4-8 hilos.
- No se documentan integraciones listas para vLLM, TGI, Ollama ni llama.cpp; son herramientas orientadas a modelos generativos y no aplican directamente a un modelo CTC como este.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad | WER en uzbeko |
|---|---:|---|---|---|---|
| elchintoyirov/auris-1-uzbek-stt | 315,5 M | solo `uz` | Apache 2.0 | HuggingFace, `transformers` | 13,69 % (FLEURS `uz_uz`, haz con LM 4-gramos) |
| facebook/wav2vec2-xls-r-300m (modelo base) | 315,5 M | 128 idiomas (preentrenamiento) | Apache 2.0 | HuggingFace | no disponible en la informacion proporcionada |
| OpenAI Whisper large-v3 | 1.550 M (dato de conocimiento general, no incluido en la informacion proporcionada) | multilingue, incluye uzbeko | MIT | HuggingFace, multiples runtimes | no disponible en la informacion proporcionada |
| facebook/mms-1b-all | ~1.000 M | mas de 1.100 idiomas, incluye uzbeko | CC-BY-NC 4.0 | HuggingFace | no disponible en la informacion proporcionada |

No hay en la informacion proporcionada resultados de WER comparables para uzbeko entre estos modelos, por lo que la comparacion de rendimiento queda abierta. Las diferencias verificables son de tamano (315,5 M frente a 1.000-1.550 M), de licencia (Apache 2.0 permite uso comercial sin restricciones frente a la clausula no comercial de MMS) y de enfoque (un modelo monoidioma con modelo de lenguaje dedicado frente a modelos multilingues mas grandes).

## Limitaciones y advertencias

- El propio autor declara que este no es el reconocedor de uzbeko con menor tasa de error disponible: la prioridad de diseno es el coste y la previsibilidad, no la precision maxima.
- WER del 11,83 % al 13,69 % segun el conjunto: en produccion esto implica que aproximadamente una de cada ocho palabras puede transcribirse incorrectamente. Es necesario disenar revision humana o post-procesado en dominios sensibles.
- Los resultados de benchmark son declarados por el autor y estan marcados como `verified: false`. No se ha realizado una verificacion independiente.
- El split de Uzbek Speech Corpus utilizado es una reconstruccion propia del autor, no el split oficial, lo que dificulta la comparacion directa con otras publicaciones que usen el split oficial.
- El modelo solo cubre el uzbeko en alfabeto latino. No soporta uzbeko en cirilico ni otros idiomas distintos de los prestamos rusos presentes en el vocabulario.
- La resistencia a la alucinacion solo se ha comprobado en dos pruebas de decodificacion greedy (tres segundos de silencio digital y tres segundos de ruido blanco). El autor advierte de que no es un benchmark de alucinacion y que la ruta con modelo de lenguaje no se ha probado, donde el bonus de insercion de palabras podria en principio introducir terminos que la acustica no respalda.
- Se observaron 4 transcripciones vacias entre los 1.858 clips de Uzbek Speech Corpus, lo que indica fallos de omision completos en una pequena fraccion de entradas.
- El pico de memoria en CPU es tres veces la memoria residente tras la carga (3,3 GB frente a 1,1 GB). Dimensionar por debajo de ese pico provocara fallos de memoria con clips largos. Trocear el audio reduce ese pico.
- La memoria de atencion escala con la duracion del clip, por lo que clips muy largos deben fragmentarse.
- No se documentan versiones cuantizadas ni formatos GGUF, lo que limita las opciones de despliegue en entornos muy restringidos.
- El modelo acumula 0 descargas y 0 "likes": no hay evidencia publica de uso en produccion, ni comunidad que reporte incidencias.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero no exime de cumplir la normativa de proteccion de datos aplicable al procesamiento de voz (por ejemplo, RGPD si se procesan conversaciones de personas identificables).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elchintoyirov/auris-1-uzbek-stt
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Uzbek Speech Corpus: https://huggingface.co/datasets/murodbek/uzbek-speech-corpus
- Libreria pyctcdecode (decodificacion CTC con modelo de lenguaje): https://github.com/kensho-technologies/pyctcdecode
- Libreria KenLM: https://github.com/kpu/kenlm
- Nota sobre la busqueda web: la busqueda realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos fueron dominios de contenido para adultos sin relacion alguna con el modelo, la arquitectura wav2vec2 ni el uzbeko. No se han podido localizar papers, blogs, repositorios ni demos adicionales.
