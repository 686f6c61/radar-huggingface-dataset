# ml-resources/speech_jaec_aec_16k

## Resumen

JAEC es un frontend de cancelacion de eco acustico (AEC) a 16 kHz pensado para comunicacion en tiempo real. No es un modelo de lenguaje: es un componente de procesamiento de senal de audio que recibe la senal de microfono (`nearend_mic`) y la referencia de altavoz o extremo lejano (`farend_speech`) y devuelve la salida del modulo de procesamiento lineal (LP). La implementacion incluida en este repositorio cubre el runtime de estimacion neuronal de retardo temporal (TDE) y de procesamiento lineal adaptativo (LP).

El modelo original es `iic/speech_jaec_aec_16k`, publicado en ModelScope por el equipo `iic`. El repositorio de HuggingFace analizado es un espejo no oficial mantenido por el usuario `ml-resources`, que conserva la misma licencia Apache 2.0 y no introduce cambios respecto al original. En el momento de la consulta acumula 0 descargas y 0 likes, y el tamano del repositorio reportado es de 0,0 GB.

Su relevancia practica esta en el rendimiento: el runtime nativo procesa tramas de 160 muestras (10 ms) por llamada y alcanza factores de tiempo real (RTF) de 0,0020 en Apple M4 y 0,0039 en un Intel Xeon a 2,90 GHz, lo que equivale a procesar audio cientos de veces mas rapido que en tiempo real. El coste es un retardo algoritmico fijo de 352 muestras (22 ms) respecto a la entrada de microfono.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (frontend de audio: estimacion neuronal de retardo temporal, TDE, mas procesamiento lineal adaptativo, LP; la model card no detalla la topologia de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (procesa tramas de 160 muestras de audio, 10 ms, por llamada) |
| Tipos de cuantizacion | no disponible (no aplica a este componente) |
| Idiomas soportados | no aplica (procesamiento de senal de audio, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible; el repositorio distribuye librerias nativas (`lib/jaec_arm.so`, `lib/jaec_x86.so`, `lib/jaec_x86.dll`) en lugar de pesos en safetensors o GGUF |
| Frecuencia de muestreo | 16 kHz, mono, PCM16 |
| Retardo algoritmico | 352 muestras (22 ms) respecto a la entrada de microfono |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Requisito de ModelScope | superior a 1.39.1 |

## Arquitectura y entrenamiento

La informacion disponible describe el sistema como un frontend AEC compuesto por dos etapas en tiempo de ejecucion: estimacion neuronal de retardo temporal (TDE) y procesamiento lineal adaptativo (LP). La primera se encarga de alinear temporalmente la senal de referencia del extremo lejano con la captura del microfono; la segunda aplica filtrado lineal adaptativo para suprimir el eco resultante. El pipeline solo devuelve la salida de la etapa TDE+LP: la model card indica explicitamente que este paquete no incluye la red de procesamiento no lineal (NLP).

No se proporcionan datos sobre el numero de parametros, la topologia concreta de las redes neuronales implicadas, el volumen o la composicion del conjunto de entrenamiento, ni sobre el uso de tecnicas de ajuste como RLHF o DPO. Tampoco se documentan innovaciones de decodificacion ni mecanismos de atencion. El unico detalle de implementacion relevante es que el codigo nativo esta compilado para arquitecturas concretas y que el pipeline rellena internamente la ultima trama incompleta de 160 muestras y recorta la salida a la longitud original.

## Capacidades

- Cancelacion de eco acustico: recibe microfono y referencia de extremo lejano y devuelve la senal procesada por la etapa TDE+LP.
- Estimacion neuronal de retardo temporal (TDE) entre la referencia y la senal de microfono.
- Procesamiento lineal adaptativo (LP) para la supresion del eco.
- Procesamiento en streaming por tramas de 160 muestras (10 ms), adecuado para flujos en tiempo real.
- Entrada flexible: ficheros WAV de 16 kHz mono PCM16, bytes WAV o arrays unidimensionales `numpy.int16`.
- Salida en PCM16 mediante `OutputKeys.OUTPUT_PCM` o escritura a fichero WAV con `output_path`.
- Ejecucion en CPU, con `device='cpu'` en el pipeline de ModelScope.
- Alineacion automatica de longitud: rellena la trama final incompleta y recorta el resultado.
- No incluye: reconocimiento de voz, generacion de texto, vision, tool calling, capacidades de agente ni soporte multilingue (no aplica).

## Casos de uso

- Videoconferencia y VoIP en dispositivo: el frontend elimina el eco que el microfono captura del altavoz antes de codificar el audio. Con RTF de 0,0020 en Apple M4, el consumo de CPU es despreciable frente al coste de codificacion del flujo.
- Preprocesamiento previo a ASR en streaming: limpiar la senal de microfono antes de alimentar un sistema de reconocimiento de voz mejora la precision cuando el usuario habla mientras suena audio por el altavoz. El retardo fijo de 22 ms es compatible con pipelines de ASR en tiempo real.
- Asistentes de voz con barge-in: en dispositivos tipo altavoz inteligente, la cancelacion permite que el usuario interrumpa la reproduccion del asistente sin que el propio audio del dispositivo se cuele en la captura.
- Salas de reuniones y audio con microfono lejano: el procesamiento TDE+LP alinea la referencia de reproduccion con la captura del microfono de sala, donde la distancia entre altavoz y microfono provoca retardos variables.
- Integracion en infraestructura de telefonia IP: el pipeline puede ejecutarse en el servidor de medios (por ejemplo, junto a Asterisk o FreeSWITCH) sobre CPU x86-64 con AVX2; con RTF de 0,0039 en un Intel Xeon de 2,90 GHz, un solo nucleo cubre cientos de flujos simultaneos en terminos de computo.
- Auriculares y equipos con cancelacion en el propio dispositivo: al no requerir GPU y distribuir binarios para macOS Arm64 y Windows x86-64, encaja en aplicaciones de escritorio que procesan audio localmente.
- Generacion de datos de entrenamiento: aplicar el frontend a corpus de audio con eco conocido para producir pares limpio/con eco destinados al entrenamiento de otros modelos de mejora de voz.
- Validacion de dispositivos en laboratorio: evaluar la calidad de cancelacion de un prototipo comparando su senal de microfono procesada frente a la referencia, con la salida del LP como linea base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No aplican metricas de modelos de lenguaje (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje. El unico dato de rendimiento aportado es el factor de tiempo real (RTF), medido como mediana de 10 ejecuciones y excluyendo la E/S de WAV y la inicializacion del modelo.

| Sistema operativo | Arquitectura | CPU | Frecuencia | RTF |
|---|---|---|---:|---:|
| macOS | Arm64 | Apple M4 | 4,46 GHz | 0,0020 |
| Linux | x86-64 | Intel Xeon | 2,90 GHz | 0,0039 |
| Windows | x86-64 | Intel Core Ultra 9 185H | 2,30 GHz | 0,0029 |

Valores derivados del RTF (calculo aritmetico, no publicado por el autor): aproximadamente 500x tiempo real en Apple M4, 345x en Core Ultra 9 185H y 256x en Intel Xeon. No se aportan metricas de calidad de cancelacion como ERLE, PESQ, MOS ni similares.

## Requisitos de hardware

- GPU: no se requiere ninguna. La ejecucion documentada es en CPU (`device='cpu'`); la VRAM necesaria es cero.
- macOS: requiere macOS 11 o superior sobre Arm64 (binario Mach-O `lib/jaec_arm.so`).
- Linux: x86-64 con soporte de AVX2 y FMA y glibc 2.27 o superior (`lib/jaec_x86.so`).
- Windows: x86-64 de 64 bits (`lib/jaec_x86.dll`).
- Plataformas no soportadas: Linux Arm64 (por ejemplo, Raspberry Pi o AWS Graviton), Android, iOS y cualquier runtime de 32 bits.
- Memoria RAM: no disponible.
- Despliegue: pipeline de ModelScope con `Tasks.acoustic_echo_cancellation` y `trust_native_code=True`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de componente.
- Latencia: retardo algoritmico fijo de 352 muestras (22 ms) respecto a la entrada de microfono, mas el procesamiento por tramas de 10 ms.
- Throughput: los valores de RTF anteriores implican entre 256x y 500x tiempo real segun plataforma; no se publican medidas de consumo de CPU ni de memoria por flujo.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Las alternativas habituales en la misma categoria (canceladores de eco como WebRTC AEC3 o SpeexDSP) no aparecen descritas en la documentacion consultada, por lo que no se pueden contrastar parametros, contexto ni licencia sin inventar cifras.

| Modelo | Categoria | Parametros | RTF | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iic/speech_jaec_aec_16k (JAEC) | AEC 16 kHz, TDE + LP | no disponible | 0,0020-0,0039 (por plataforma) | Apache 2.0 | ModelScope; espejo en HuggingFace |
| Alternativas de la misma categoria | AEC en tiempo real | no disponible | no disponible | no disponible | no disponible en la informacion consultada |

La busqueda web realizada no devolvio resultados tecnicos relevantes: los enlaces obtenidos corresponden a paginas de desambiguacion, anuncios de vehiculos, conversiones de unidades y un videojuego, por lo que no aportan datos comparativos.

## Limitaciones y advertencias

- Entradas restringidas: ambos flujos deben ser senales de 16 kHz, mono y PCM16, de la misma longitud, con el microfono en `nearend_mic` y la referencia en `farend_speech`.
- Alcance funcional incompleto: el paquete solo incluye la salida del frontend TDE+LP; no incorpora la red de procesamiento no lineal (NLP). Para cancelacion residual no lineal habra que anadir etapas propias.
- Compatibilidad de plataforma muy limitada: no hay binarios para Linux Arm64, Android, iOS ni 32 bits, lo que excluye despliegues en movil y en servidores basados en Arm.
- Dependencia de ModelScope: requiere una version superior a 1.39.1, no disponible en PyPI en el momento de la publicacion; hasta entonces hay que instalar desde la rama `master` del repositorio de GitHub, con el riesgo de inestabilidad que ello implica.
- Ejecucion de codigo nativo: el repositorio contiene librerias compiladas y exige `trust_native_code=True`. Conviene cargarlo solo desde repositorios de confianza.
- Riesgo de licencia y atribucion: es un espejo no oficial. La licencia Apache 2.0 se mantiene, pero los binarios nativos incluyen atribuciones de terceros recogidas en `THIRD_PARTY_NOTICES.md`; cualquier redistribucion comercial debe respetarlas.
- Trazabilidad: no se documentan datos de entrenamiento, sesgos, metricas de calidad de cancelacion ni procesos de validacion, por lo que no es posible estimar el comportamiento en condiciones acusticas adversas (reverberacion fuerte, eco no lineal, doble habla) a partir de la informacion disponible.
- Advertencia general: no es un modelo generativo y no debe evaluarse con criterios de LLM (alucinacion, contexto, idiomas, tool calling); esas filas figuran como no aplicables o no disponibles.
- Metadatos a revisar: las fechas de creacion y actualizacion del repositorio (2026-10-15) y el tamano reportado de 0,0 GB resultan incoherentes con la presencia de binarios nativos, lo que sugiere metadatos incompletos o no sincronizados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ml-resources/speech_jaec_aec_16k
- Modelo original en ModelScope: https://www.modelscope.cn/models/iic/speech_jaec_aec_16k
- Repositorio de ModelScope en GitHub: https://github.com/modelscope/modelscope
- Licencia Apache 2.0 (referenciada como `LICENSE` en el repositorio)
- Atribuciones de terceros (referenciado como `THIRD_PARTY_NOTICES.md` en el repositorio)
- Ejemplos de audio citados en la model card: https://dashscope.oss-cn-beijing.aliyuncs.com/samples/audio/jaec/nearend_mic.wav y https://dashscope.oss-cn-beijing.aliyuncs.com/samples/audio/jaec/farend_speech.wav
- Paper, blog tecnico, demo o repositorio adicional: no disponibles en la informacion proporcionada
