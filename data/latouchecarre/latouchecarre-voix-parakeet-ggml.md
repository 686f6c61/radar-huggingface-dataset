# LaToucheCarre/LaToucheCarre-Voix-Parakeet-GGML

## Resumen

LaToucheCarre-Voix-Parakeet-GGML es una recuantizacion en Q3_K del modelo de reconocimiento automatico del habla (ASR) nvidia/parakeet-tdt-0.6b-v3, publicada por el usuario LaToucheCarre en formato ggml para ser consumida por `parakeet-cli`, la herramienta de linea de comandos de whisper.cpp. No aporta pesos nuevos ni reentrenamiento: es una conversion de precision sobre el modelo original de NVIDIA, cuyo unico objetivo es reducir el consumo de memoria hasta los 501 MB en el pico, frente a los 579 MB del Q4_K y los 820 MB del Q8_0 publicados por ggml-org.

El modelo se distribuye como pieza de un producto concreto: La Touche Carre, un asistente de escritura para Windows totalmente local, donde esta variante actua como nivel "S" de dictado. Esta pensado para equipos modestos sin GPU dedicada, ya que la inferencia se ejecuta en CPU. El repositorio declara soporte para frances e ingles, pesa 0,3 GB y se publica bajo licencia CC-BY-4.0, la misma del modelo base.

Su relevancia ahora es de nicho pero clara: existe demanda de ASR ligero, offline y con licencia permisiva para integrarse en aplicaciones de escritorio. Al no existir una version Q3_K en el repositorio upstream, este fichero cubre un hueco concreto para hardware con poca memoria disponible, a costa de una perdida minima de precision (0,04 puntos porcentuales respecto al Q4_K en el banco del autor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (Token-and-Duration Transducer) heredada del modelo base nvidia/parakeet-tdt-0.6b-v3; empaquetado en formato ggml |
| Parametros totales | 600 millones (0,6 B), segun la denominacion del modelo base |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa audio, no una ventana de contexto de texto) |
| Tipos de cuantizacion | Q3_K (este repositorio); f32, f16, Q8_0, Q4_K y Q4_0 en el repositorio upstream ggml-org/parakeet-GGUF |
| Idiomas soportados | frances (fr) e ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ggml (archivo `ggml-parakeet-tdt-0.6b-v3-q3_k.bin`) |

Otros datos de metadatos: tamano del repositorio 0,3 GB, libreria declarada `whisper.cpp`, 0 descargas y 0 "likes" en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base de NVIDIA, un transducer TDT (Token-and-Duration Transducer), tal como indica su propia denominacion `parakeet-tdt-0.6b-v3`. Este repositorio no modifica ni reentrena esos pesos: se limita a recuantizar a Q3_K y a empaquetar el resultado en formato ggml para que sea legible por `parakeet-cli` de whisper.cpp. La model card indica explicitamente que es una "obra derivada (solo recuantificacion, ningun peso reentrenado)".

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO del modelo base, ya que esos datos no aparecen en la informacion proporcionada. La unica innovacion tecnica que documenta el autor es de empaquetado y precision: la eleccion de Q3_K para cruzar el umbral del medio gigaocteto de memoria, un limite practico en equipos modestos que separa un modelo que cabe en memoria de otro que no.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en frances e ingles.
- Funcionamiento totalmente local, sin necesidad de conexion a red ni de servicios en la nube.
- Inferencia en CPU sin GPU dedicada, con un factor de tiempo real de x0,105 en un AMD Ryzen 5 9600X.
- Integracion como motor de dictado en asistentes de escritorio (caso de uso declarado: La Touche Carre en Windows).
- Ejecucion mediante `parakeet-cli` de whisper.cpp, con seleccion de idioma por linea de comandos (`-l fr`).
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio generativo, modo "thinking" ni razonamiento multi-paso; es un modelo exclusivamente ASR.

## Casos de uso

- Dictado en asistentes de escritura: es el uso de origen del propio modelo, integrado como nivel "S" de dictado en La Touche Carre para Windows; con 501 MB de pico encaja en un PC de gama media sin GPU.
- Transcripcion de reuniones en local: al procesar 10 minutos de audio en torno a 1 minuto de CPU, permite pasar desde la captura de audio a un texto indexable sin enviar datos a terceros, util para entornos con requisitos de confidencialidad.
- Subtitulado de video en frances e ingles: la generacion de texto con marcas temporales puede canalizarse a traves de la infraestructura de whisper.cpp, reutilizando un ecosistema ya conocido por los desarrolladores.
- Asistentes de voz offline en aplicaciones de escritorio: al no requerir tarjeta grafica, se puede embeber en instaladores de aplicaciones Windows donde el usuario final no dispone de aceleracion por hardware.
- Procesamiento por lotes en servidores sin GPU: el factor de tiempo real x0,105 sobre CPU permite indexar grandes volumenes de audio en maquinas tipo edge o VPS economicos.
- Accesibilidad y dictado asistido: personas con movilidad reducida pueden transcribir voz a texto de forma local, sin dependencia de servicios externos ni cuotas de API.
- Pre-transcripcion para motores de busqueda interna: generar transcripciones de archivos de audio corporativos para despues indexarlas y permitir busqueda por texto sobre el contenido hablado.

## Benchmarks y rendimiento

El autor publica una comparativa de su propia variante frente a otras cuantizaciones upstream del mismo modelo. La metrica de "precision" se mide como porcentaje de caracteres correctos sobre un banco propio (cuatro extractos en frances, dictado casero, FLEURS, VoxPopuli y lectura personal), no como WER estandar sobre un corpus publico.

| Variante | Memoria en el pico | Factor tiempo real (CPU) | Precision (caracteres correctos) |
|---|---|---|---|
| Q3_K (este repositorio) | 501 MB | x0,105 | 97,83 % |
| Q4_K (upstream) | 579 MB | x0,106 | 97,87 % |
| Q8_0 (upstream) | 820 MB | x0,084 | 98,13 % |

Mediciones realizadas sobre un AMD Ryzen 5 9600X. El "factor tiempo real" se define como segundos de computo por segundo de audio: x0,105 equivale a transcribir diez minutos de habla en alrededor de un minuto. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria pico en inferencia: 501 MB para la variante Q3_K (frente a 579 MB del Q4_K y 820 MB del Q8_0).
- Inferencia en CPU: probada sobre AMD Ryzen 5 9600X; no se requiere GPU.
- GPU recomendadas: no disponible; la informacion proporcionada no documenta aceleracion por GPU para esta variante.
- Encaje en GPU de consumo: no disponible; el modelo esta orientado a ejecucion en CPU y el autor no aporta datos de VRAM ni de offload a GPU.
- Opciones de despliegue: `parakeet-cli` de whisper.cpp, invocado como `parakeet-cli -m ggml-parakeet-tdt-0.6b-v3-q3_k.bin -f audio.wav -l fr`. No se documenta soporte para vLLM, Ollama, TGI ni otros servidores.
- Latencia y throughput: factor de tiempo real x0,105 sobre Ryzen 5 9600X, es decir, aproximadamente 10 minutos de audio por minuto de computo en ese equipo; el resto de hardware no esta medido.

## Comparativa con modelos similares

La comparacion mas directa es contra las otras cuantizaciones del mismo modelo base, ya que el autor no compara con familias alternativas de ASR.

| Variante | Memoria en el pico | Factor tiempo real (CPU) | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Q3_K (este repositorio) | 501 MB | x0,105 | 97,83 % | CC-BY-4.0 | Repositorio LaToucheCarre |
| Q4_K (upstream) | 579 MB | x0,106 | 97,87 % | CC-BY-4.0 | ggml-org/parakeet-GGUF |
| Q8_0 (upstream) | 820 MB | x0,084 | 98,13 % | CC-BY-4.0 | ggml-org/parakeet-GGUF |

Frente a otras familias de ASR (por ejemplo, Whisper en formato ggml), no se dispone de datos comparativos de parametros, contexto ni rendimiento en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa con ellas.

## Limitaciones y advertencias

- Perdida de precision por recuantizacion: 97,83 % de caracteres correctos frente a 97,87 % del Q4_K y 98,13 % del Q8_0, segun el banco del propio autor.
- Banco de evaluacion reducido y no estandar: las cifras proceden de un conjunto propio descrito como cuatro extractos en frances mas dictado casero, FLEURS, VoxPopuli y lectura personal; no equivalen a un WER sobre un benchmark publico reproducible.
- Idiomas limitados: el repositorio declara unicamente frances e ingles, aunque el modelo base v3 pueda cubrir mas idiomas; para otros idiomas debe verificarse en el modelo original.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe evidencia externa de calidad o estabilidad.
- Al ser una obra derivada sin reentrenamiento, hereda todos los sesgos y errores del modelo NVIDIA original.
- Restricciones de licencia: CC-BY-4.0 exige atribucion; el propio autor indica que la atribucion corresponde a NVIDIA Corporation. Es una licencia permisiva para uso comercial, pero con obligacion de citar.
- Despliegue restringido: solo documentado para `parakeet-cli` de whisper.cpp; no hay informacion sobre soporte en otros motores (vLLM, Ollama, TGI) ni sobre aceleracion por GPU.
- Riesgo de alucinacion y errores propios de ASR: en audio con ruido, solapamiento de voces o acentos no vistos, la transcripcion puede degradarse; no se documentan medidas de mitigacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LaToucheCarre/LaToucheCarre-Voix-Parakeet-GGML
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Repositorio de cuantizaciones upstream: https://huggingface.co/ggml-org/parakeet-GGUF
- whisper.cpp (incluye `parakeet-cli`): https://github.com/ggml-org/whisper.cpp
- Producto del autor (La Touche Carre): https://latouchecarre.fr

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; las entradas obtenidas correspondian a paginas de ayuda de instalacion de Google Chrome y no se han incluido.
