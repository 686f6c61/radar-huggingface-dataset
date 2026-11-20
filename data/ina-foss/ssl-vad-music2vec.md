# ina-foss/ssl-vad-music2vec

## Resumen

ssl-vad-music2vec es un modelo de deteccion de actividad de voz (VAD) desarrollado por INA (Institut national de l'audiovisuel) a traves de su organizacion ina-foss. No es un modelo generativo ni un LLM: es un clasificador binario por trama que segmenta audio en voz y no-voz, construido sobre las caracteristicas auto-supervisadas del encoder musical m-a-p/music2vec-v1. El modelo resuelve un problema clasico en el procesamiento de audio a gran escala: separar automaticamente los segmentos con habla del resto (musica, silencio, ruido) en archivos de radiodifusion audiovisual.

La relevancia de este modelo radica en su enfoque: en lugar de entrenar un VAD desde cero, reutiliza caracteristicas SSL (self-supervised learning) de un encoder preentrenado en audio musical, lo que permite obtener un rendimiento alto con un coste de entrenamiento bajo. Sobre el conjunto de test de InaGVAD alcanza un 96,4 % de exactitud global y un F1 de 97,0, cifras competitivas dentro de la familia de VADs SSL publicados por el mismo grupo.

El modelo se publica bajo una licencia de investigacion restringida (pantagruel-research-license) con acceso condicionado (gated), orientada exclusivamente a uso no comercial en investigacion. Su tamano de repositorio es de aproximadamente 0,1 GB, lo que lo hace muy ligero para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder SSL m-a-p/music2vec-v1 (CNN + primera capa transformer) con cabecera MLP downstream y decodificacion Viterbi |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz; segmentacion por tramas, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo detecta voz independientemente del idioma; entrenado sobre InaGVAD, corpus de radiodifusion francesa) |
| Licencia | pantagruel-research-license (uso exclusivo en investigacion no comercial, acceso gated) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Frecuencia de muestreo | 16 kHz |
| Tarea | voice-activity-detection (clasificacion binaria por trama) |
| Modelo base | m-a-p/music2vec-v1 |

## Arquitectura y entrenamiento

El modelo no entrena un encoder propio. Extrae caracteristicas de la CNN y de la primera capa transformer del encoder SSL m-a-p/music2vec-v1 (un modelo preentrenado sobre audio musical) y las pasa a una MLP downstream que predice, trama a trama, la presencia o ausencia de voz (clasificacion binaria). En inferencia, la secuencia de probabilidades por trama se decodifica con un decodificador de Viterbi binario de Librosa, lo que suaviza las transiciones y produce segmentos temporales coherentes con marcas de inicio y fin.

El entrenamiento se realizo sobre el subconjunto de validacion del dataset InaGVAD (Doukhan et al., 2024), un corpus de radiodifusion audiovisual francesa. La model card indica que los hiperparametros de entrenamiento, el checkpoint original y los ficheros de eventos de TensorBoard estan disponibles en el directorio `training` del repositorio. No se especifican en la informacion disponible el numero de tokens, horas de audio ni la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un clasificador de este tipo). La innovacion tecnica principal es el uso de caracteristicas SSL de un encoder musical para una tarea de voz, lo que demuestra la transferibilidad de representaciones entre dominios de audio.

## Capacidades

- Deteccion de actividad de voz (VAD): clasificacion binaria por trama de voz frente a no-voz.
- Segmentacion temporal: devuelve intervalos con marcas `start`, `stop` y `label` (booleano) listos para su uso downstream.
- Procesamiento de audio a 16 kHz mediante carga con Librosa.
- Robustez frente a contenido musical: al estar construido sobre un encoder entrenado en musica, esta disenado para operar en audio que mezcla voz y musica (radiodifusion).
- Integracion con el ecosistema Transformers mediante `AutoModel.from_pretrained` con `trust_remote_code=True`.
- Integracion con inaVAMOS (INA Voice And Music Open Segmenter), toolkit que combina deteccion de voz y musica, disponible como CLI y API Python en PyPI.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes; no es un modelo de lenguaje.

## Casos de uso

- Segmentacion de archivos de radiodifusion: procesar horas de audio de archivo audiovisual para aislar los tramos con habla antes de tareas de transcripcion o diarizacion, aprovechando el bajo coste computacional del modelo (0,1 GB de pesos).
- Preprocesado para ASR: eliminar silencios, musica y ruido antes de pasar el audio a un sistema de reconocimiento automatico del habla, reduciendo el coste de inferencia del ASR y mejorando la precision al evitar segmentos no verbales.
- Indexacion y busqueda en archivos audiovisuales: generar marcas temporales de voz para permitir busqueda por fragmentos hablados en catalogos de television y radio.
- Monitorizacion de emisiones: detectar automaticamente cuando hay locucion en una senal en directo o grabada, por ejemplo para medir tiempos de palabra o generar estadisticas de contenido hablado frente a musical.
- Analisis de contenido musical y hablado combinado: junto con los modelos de deteccion de musica de la misma familia (ssl-music-detection) y el toolkit inaVAMOS, construir pipelines de segmentacion que separen voz, musica y silencio en un mismo flujo.
- Investigacion en representaciones SSL de audio: servir como punto de partida o baseline para estudiar la transferibilidad de encoders musicales a tareas de voz, dado que el checkpoint y los logs de entrenamiento estan publicados.
- Curacion de datasets de voz: filtrar grandes colecciones de audio para conservar solo los segmentos con habla antes de entrenar otros modelos.

## Benchmarks y rendimiento

Resultados globales sobre el conjunto de test de InaGVAD, segun la model card:

| Modelo | Global Acc. | Global F1 |
|---|---|---|
| ssl-vad-music2vec | 96,4 | 97,0 |
| ssl-vad-base | 96,8 | 97,3 |
| ssl-vad-no_music | 96,0 | 96,6 |
| ssl-vad-only_speech | 96,2 | 96,8 |
| ssl-vad-only_fr | 96,3 | 96,9 |
| ssl-vad-gender | 96,5 | 97,0 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de la industria (MMLU, HumanEval, GSM8K, etc.), que no aplican a un modelo de VAD.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con un repositorio de 0,1 GB, la huella de memoria es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; no se requiere A100 ni H100. Una RTX 4090 o incluso GPUs de gama baja son suficientes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna e incluso en CPU para procesamiento por lotes.
- Opciones de despliegue: inferencia directa con Transformers (`AutoModel.from_pretrained` con `trust_remote_code=True`), o mediante el toolkit inaVAMOS (CLI o API Python, instalable con `pip install inaVAMOS`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Modelo base | Global Acc. | Global F1 | Licencia |
|---|---|---|---|---|---|
| ssl-vad-music2vec | VAD | m-a-p/music2vec-v1 | 96,4 | 97,0 | pantagruel-research-license |
| ssl-vad-base | VAD | no disponible | 96,8 | 97,3 | no disponible |
| ssl-vad-no_music | VAD | no disponible | 96,0 | 96,6 | no disponible |
| ssl-vad-only_speech | VAD | no disponible | 96,2 | 96,8 | no disponible |
| ssl-vad-gender | VAD | no disponible | 96,5 | 97,0 | no disponible |

Todos los modelos comparados pertenecen a la misma familia publicada por ina-foss (coleccion ssl-vad). ssl-vad-base obtiene el mejor resultado global (96,8 de exactitud y 97,3 de F1), mientras que ssl-vad-music2vec queda ligeramente por debajo pero mantiene un rendimiento muy cercano. No se dispone de informacion sobre modelos comparables de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: pantagruel-research-license, con acceso gated y uso limitado a investigacion no comercial. Requiere aceptar condiciones y facilitar institucion, correo institucional y pais. No apto para uso comercial sin autorizacion.
- Entrenado sobre el subconjunto de validacion de InaGVAD, un corpus de radiodifusion francesa; el rendimiento puede degradarse en dominios acusticos distintos (telefonia, audio de campo, reuniones) o en idiomas no representados.
- Riesgo de confusion en audio con musica vocal o coros, donde la distincion entre voz hablada y voz cantada puede ser ambigua.
- Posibles sesgos derivados de la composicion del corpus de entrenamiento (locutores profesionales, condiciones de estudio de radiodifusion).
- Al ser un clasificador binario por trama, puede producir falsos positivos o negativos en segmentos muy cortos o con solapamiento de voz y ruido; el decodificador Viterbi suaviza las transiciones pero no elimina estos errores.
- No es un modelo de lenguaje: no genera texto ni razona; cualquier expectativa de uso como LLM es incorrecta.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de desplegarlo en produccion.
- No se documentan en la informacion disponible los tipos de cuantizacion soportados ni el rendimiento en latencia/throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ina-foss/ssl-vad-music2vec
- Licencia: https://huggingface.co/ina-foss/ssl-vad-music2vec/blob/main/LICENSE.md
- Directorio de entrenamiento: https://huggingface.co/ina-foss/ssl-vad-music2vec/tree/main/training
- Fichero de requisitos: https://huggingface.co/ina-foss/ssl-vad-music2vec/blob/main/requirements.txt
- Modelo base m-a-p/music2vec-v1: https://huggingface.co/m-a-p/music2vec-v1
- Coleccion de modelos VAD SSL de ina-foss: https://huggingface.co/collections/ina-foss/ssl-vad
- Coleccion de modelos de deteccion de musica SSL: https://huggingface.co/collections/ina-foss/ssl-music-detection
- Toolkit inaVAMOS: https://github.com/ina-foss/inaVAMOS
- inaVAMOS en PyPI: https://pypi.org/project/inaVAMOS/
- Paper InaGVAD (Doukhan et al., 2024): https://aclanthology.org/2024.lrec-main.785/
- Documentacion de Viterbi binario de Librosa: https://librosa.org/doc/latest/generated/librosa.sequence.viterbi_binary.html
