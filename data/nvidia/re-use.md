# nvidia/RE-USE

## Resumen

RE-USE (Multilingual Universal Speech Enhancement) es un modelo de mejora de voz desarrollado por NVIDIA que toma audio degradado y devuelve audio limpio, preservando el contenido lingüístico, la identidad del hablante, la emoción, el acento y otros atributos paralingüísticos. El objetivo declarado es el *universal speech enhancement*: un único modelo que restaura la calidad de señales afectadas por ruido aditivo, reverberación, clipping, limitación de ancho de banda, artefactos de códec, pérdida de paquetes y micrófonos de baja calidad, en lugar de entrenar un modelo especializado por tipo de degradación.

La arquitectura combina un codificador convolucional, un decodificador convolucional y modelado tiempo-frecuencia mediante Mamba bidireccional de 30 capas, empaquetado en la librería `mamba-ssm`. Con solo 9.607.747 parámetros (~9,6 M) y un repositorio de 0,1 GB, es un modelo muy compacto en comparación con los sistemas generativos de audio actuales, lo que lo hace apto para inferencia en GPU de gama consumer y potencialmente en entornos embebidos.

Es relevante ahora porque cubre un rango amplio de frecuencias de muestreo de entrada (8, 16, 22,05, 24, 32, 44,1 y 48 kHz), admite extensión de ancho de banda opcional y declara capacidad *language-agnostic*. Su licencia, sin embargo, es la NVIDIA One-Way Noncommercial License (NSCLv1), orientada exclusivamente a investigación y desarrollo, lo que condiciona su uso en producto comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador convolucional + decodificador convolucional + Mamba bidireccional de 30 capas para modelado tiempo-frecuencia |
| Parametros totales | 9.607.747 (~9,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio; admite troceado configurable con `chunk_size_in_seconds` y `hop_length_portion`) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan esquemas de cuantizacion ni versiones GGUF/ONNX) |
| Idiomas soportados | Declarado *language-agnostic*. Datos de entrenamiento en aleman, ingles, espanol, frances y chino mandarin (zh-CN). Metadatos de HuggingFace: no disponibles |
| Licencia | NVIDIA One-Way Noncommercial License (NSCLv1) - `license: other` |
| Formato de pesos | safetensors |
| Frecuencias de muestreo de entrada | 8, 16, 22,05, 24, 32, 44,1 y 48 kHz, mono |
| Frecuencias de muestreo de salida | 8 a 48 kHz, mono |
| Formato de audio | .wav |
| Version del checkpoint | 30USEMamba_peak+GAN_tel_mic_1134k |
| Libreria | mamba-ssm |

## Arquitectura y entrenamiento

El modelo sigue un esquema de codificador convolucional que transforma la forma de onda en una representacion tiempo-frecuencia, un nucleo de Mamba bidireccional de 30 capas que modela esa representacion, y un decodificador convolucional que reconstruye la senal. Mamba es una arquitectura de espacio de estados (SSM) selectiva con coste computacional lineal respecto a la longitud de secuencia, lo que explica que un modelo de solo 9,6 M de parametros pueda procesar audio de varias decenas de segundos sin el crecimiento cuadratico tipico de la atencion. La model card cita explicitamente el equilibrio *distortion-perception trade-off* como principio de diseno: el modelo busca un balance entre eliminar distorsion y no introducir artefactos perceptuales que alteren la identidad del hablante o la prosodia. El nombre de la version del checkpoint (`..._peak+GAN_tel_mic_1134k`) apunta a un entrenamiento con objetivo adversarial (GAN) ademas de la perdida espectral, aunque la model card no detalla la composicion exacta de las perdidas.

Los datos de entrenamiento suman menos de 10.000 horas de audio, con predominio del ingles: LibriVox del desafio DNS5 (~350 h), LibriTTS (~200 h), VCTK (~80 h), WSJ (~85 h) y EARS (~100 h), mas Multilingual Librispeech (~450 h en aleman, ingles, espanol y frances) y CommonVoice 19.0 (~1.300 h en aleman, ingles, espanol, frances y zh-CN). Se anaden ~180 horas de ruido de Audioset y FreeSound dentro del desafio DNS5. La model card no especifica si hubo RLHF, DPO ni otras fases de alineacion, ni el numero total de tokens o pasos de entrenamiento. El checkpoint publicado difiere del reportado en el articulo: incorpora tipos de degradacion adicionales (respuesta de microfono y mas codecs) y esta afinado sobre un subconjunto limpio mas pequeno pero de mayor calidad.

## Capacidades

- Mejora de voz *universal*: un unico modelo aborda ruido aditivo, reverberacion, clipping, limitacion de ancho de banda, artefactos de codec, perdida de paquetes y respuesta deficiente de microfono.
- Soporte de multiples frecuencias de muestreo de entrada: 8, 16, 22,05, 24, 32, 44,1 y 48 kHz, en mono.
- Extension de ancho de banda (BWE) opcional mediante el argumento `BWE` del script de inferencia, con dependencia adicional de `resampy`. Permite, por ejemplo, reconstruir bandas altas a partir de una entrada telefonica de 8 kHz.
- Procesamiento de audio largo mediante `inference_chunk.sh`, con parametros ajustables `chunk_size_in_seconds` y `hop_length_portion` para evitar errores de memoria en GPU.
- Preservacion declarada de factores paralinguisticos: identidad del hablante, emocion, acento y contenido linguistico.
- Capacidad *language-agnostic* declarada por el autor, con entrenamiento multilingue en cinco idiomas (aleman, ingles, espanol, frances y chino mandarin).
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No dispone de tool calling ni de function calling.
- No implementa agentes ni razonamiento multi-paso.
- No es un modelo de texto: su unica tarea es audio-a-audio.

## Casos de uso

- Limpieza de corpus para entrenamiento de ASR y TTS: los corpus de voz espontanea suelen contener ruido de fondo, reverberacion y artefactos de codec que degradan el WER de los sistemas de reconocimiento. RE-USE se aplicaria como etapa de preprocesado en el pipeline de datos, con la ventaja de que su coste por hora de audio es bajo al ser un modelo de 9,6 M de parametros.
- Analitica de centros de contacto: las grabaciones de llamadas llegan comprimidas con codecs telefonicos, con perdida de paquetes y microfonos de baja calidad. El modelo puede normalizar esas grabaciones antes de pasarlas a sistemas de transcripcion, diarizacion o analisis de sentimiento, mejorando la calidad de la entrada sin cambiar la voz del cliente.
- Recuperacion de archivo audiovisual y broadcast: para cintas o grabaciones historicas limitadas en banda, el modo BWE permite extender el ancho de banda hacia 48 kHz, y el procesamiento por trozos con `inference_chunk.sh` permite tratar programas completos de decenas de minutos sin agotar la memoria de la GPU.
- Produccion de podcast y contenido hablado: creadores que graban en entornos no tratados pueden eliminar ruido estacionario y reverberacion de sala en una sola pasada, sin necesidad de cadenas de plugins ni de ajustar manualmente un modelo distinto por tipo de degradacion.
- Telemedicina y teleconferencia: consultas y reuniones con microfonos de portatil, auriculares baratos o conexiones con perdida de paquetes se pueden acondicionar antes de la transcripcion clinica o del acta automatica, donde un error de reconocimiento puede tener consecuencias relevantes.
- Investigacion en paralinguistica y psicoacustica: al declarar preservacion de identidad, emocion y acento, el modelo sirve para estudiar cuanto de la senal paralinguistica sobrevive a un proceso de mejora, o para preparar estimulos limpios en experimentos perceptuales.
- Preprocesado de pipelines de traduccion de voz y doblaje automatico: limpiar la senal de origen antes de la transcripcion y sintesis reduce errores en cascada en sistemas de speech-to-speech translation.
- Despliegue en dispositivos con recursos limitados: con ~9,6 M de parametros (aproximadamente 38 MB en fp32), es candidato a ejecutarse en GPUs de gama de entrada o incluso en hardware embebido con soporte CUDA, para funciones de cancelacion de ruido en tiempo real. No obstante, la model card no documenta latencias ni modos de streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas con metricas objetivas (PESQ, STOI, SI-SDR, DNSMOS) ni comparaciones numericas con otros sistemas de mejora de voz, y los resultados de busqueda web no aportan datos adicionales. El articulo citado, "Rethinking Training Targets, Architectures and Data Quality for Universal Speech Enhancement" (arXiv:2603.02641), es la referencia donde podrian aparecer dichas metricas, pero su contenido no forma parte de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia derivada del numero de parametros, los pesos ocupan aproximadamente 38 MB en fp32 y 19 MB en fp16, por lo que el consumo dominante sera el de las activaciones intermedias, que crecen con la duracion del audio procesado. La model card advierte de errores de memoria (OOM) en GPU con audios largos, de ahi la existencia de `inference_chunk.sh`.
- GPU recomendadas: la model card declara compatibilidad con la microarquitectura NVIDIA Ampere, citando la A100 como ejemplo, y uso preferente de Linux con CUDA. No se listan otras GPU soportadas.
- Cabe en GPU consumer: si, por tamano de parametros cabe con holgura en cualquier GPU consumer con soporte CUDA (por ejemplo, la propia familia Ampere de escritorio o superior). No obstante, NVIDIA no declara soporte oficial para esas tarjetas y la eleccion de una u otra condicionara cuanto audio se puede procesar en una sola pasada antes de trocear.
- Opciones de despliegue: el repositorio se distribuye con scripts de inferencia (`inference.sh` para audio corto, `inference_chunk.sh` para audio largo) sobre la libreria `mamba-ssm`. Existe un entorno Docker preconstruido para Mamba referenciado desde el repositorio SEMamba. Hay una demo interactiva en Gradio en HuggingFace Spaces. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que son frameworks para modelos de lenguaje y no aplican a este tipo de checkpoint; tampoco se ofrecen exportaciones a ONNX, TensorRT ni GGUF.
- Latencia y throughput estimados: no disponibles. La model card no publica tiempos de inferencia ni factor de tiempo real.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos, por lo que no es posible establecer una comparativa cuantitativa. La tabla siguiente recoge unicamente los datos confirmados del modelo y deja como "no disponible" los de la categoria de referencia.

| Modelo | Parametros | Contexto / muestreo | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nvidia/RE-USE | 9,6 M | 8 a 48 kHz, mono, troceado configurable | No disponible | NVIDIA NSCLv1 (solo no comercial) | HuggingFace, safetensors, demo Gradio |
| Alternativas de la misma categoria (mejora de voz, modelos discriminativos o generativos) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

Para una comparacion rigurosa habria que contrastar RE-USE con otros sistemas de mejora de voz sobre los mismos conjuntos de evaluacion (por ejemplo, las particiones de ruido de DNS), usando metricas objetivas como PESQ, STOI, SI-SDR o DNSMOS y controlando la frecuencia de muestreo, ya que este modelo opera en un rango mas amplio que muchos sistemas limitados a 16 kHz.

## Limitaciones y advertencias

- Licencia no comercial: el modelo se distribuye bajo la NVIDIA One-Way Noncommercial License (NSCLv1) y la propia model card indica que es para investigacion y desarrollo. Cualquier uso en producto comercial requiere revisar los terminos con NVIDIA; no se concede un uso comercial directo.
- Ausencia de benchmarks publicos: no hay metricas objetivas en la informacion disponible, por lo que no se puede validar la calidad de la mejora ni compararla con alternativas sin una evaluacion propia.
- Discrepancia entre checkpoint y articulo: el checkpoint publicado incorpora degradaciones adicionales y esta afinado sobre un subconjunto limpio distinto al del articulo, de modo que los resultados del paper no son directamente extrapolables a este peso.
- Riesgo de alteracion de la senal: en mejora de voz, los fallos tipicos no son "alucinaciones" textuales sino sobre-supresion de componentes de voz (perdida de consonantes, sibilancias atenuadas), introduccion de artefactos musicales o cambios en la prosodia. El propio autor advierte del compromiso entre distorsion y percepcion, lo que implica que la salida no es una reconstruccion exacta de la senal original.
- Sesgo de datos: el corpus de entrenamiento esta dominado por ingles y por voces de lectura de datasets academicos (LibriVox, LibriTTS, VCTK, WSJ, EARS), con menor representacion de espanol, aleman, frances y chino. El rendimiento puede degradarse en idiomas y variedades dialectales poco representados, asi como en voces infantiles, ancianas o con patologias del habla, pese a la declaracion de capacidad *language-agnostic*.
- Sesgo acustico: al entrenar con ruidos de Audioset, FreeSound y del desafio DNS, el modelo puede estar sesgado hacia los tipos de ruido alli presentes y comportarse peor ante degradaciones no vistas.
- Solo mono: no soporta audio multicanal ni microfonos de matriz, lo que limita su aplicacion a escenarios con captura espacial.
- Limitacion de memoria en audios largos: la model card reconoce explicitamente riesgo de OOM con ficheros largos y provee un script de troceado con solapamiento configurable (`hop_length_portion`), lo que introduce decisiones de calidad frente a coste y riesgos de discontinuidad en las uniones.
- Dependencia de hardware y software: la integracion con `mamba-ssm` requiere compilacion CUDA de las extensiones, y la documentacion solo declara Linux y arquitecturas NVIDIA Ampere. El despliegue en otras plataformas no esta soportado oficialmente.
- Sin evaluacion de seguridad especifica: la model card no documenta auditorias de sesgo, pruebas de robustez adversaria ni evaluacion de riesgos de suplantacion de identidad, algo relevante en un sistema que procesa biometria de voz.
- Uso responsable: tratandose de datos de voz, el despliegue debe cumplir la normativa aplicable de proteccion de datos y consentimiento de los hablantes, especialmente si el audio se reutiliza para entrenamiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/RE-USE
- Demo interactiva en Gradio: https://huggingface.co/spaces/nvidia/RE-USE
- Articulo de referencia: https://arxiv.org/abs/2603.02641 (Rethinking Training Targets, Architectures and Data Quality for Universal Speech Enhancement)
- Licencia NVIDIA One-Way Noncommercial (NSCLv1): https://github.com/NVlabs/HMAR/blob/main/LICENSE
- Repositorio SEMamba con soporte Docker para Mamba: https://github.com/RoyChao19477/SEMamba
- Desafio DNS (datos LibriVox y ruidos Audioset/FreeSound): https://github.com/microsoft/DNS-Challenge/tree/master
- LibriTTS: https://www.openslr.org/60/
- VCTK: https://datashare.ed.ac.uk/handle/10283/3443
- WSJ: https://catalog.ldc.upenn.edu/LDC93S6A
- EARS: https://sp-uhh.github.io/ears_dataset/
- Multilingual Librispeech: https://www.openslr.org/94/
- CommonVoice 19.0: https://huggingface.co/datasets/fsicoli/common_voice_19_0
