# drivendata/pasketti-word

## Resumen

`pasketti-word` es un modelo de reconocimiento automático del habla (ASR) desarrollado por DrivenData y especializado en habla infantil. Se trata de un fine-tune supervisado de `Qwen/Qwen3-ASR-1.7B`, un modelo que combina un codificador de audio con un modelo de lenguaje Qwen3 que genera la transcripción token a token. El repositorio declara 2.038.052.480 parámetros totales (aproximadamente 2,04 mil millones, incluyendo el codificador de audio) y se distribuye en safetensors con un tamaño de 4,1 GB.

El problema que aborda es concreto: los modelos ASR open source entrenados con voz adulta rinden mal con niños, porque el habla infantil presenta fenómenos fonológicos sistemáticos (metátesis, fronting velar, elisión de sílabas) que se alejan de la pronunciación adulta. El ejemplo que da el autor es el que da nombre al modelo: "spaghetti" pronunciado como "pasketti". Para cerrar esa brecha, el modelo se ha entrenado con 372 horas de habla infantil de más de 3.600 niños distintos, en clips de hasta 20 segundos, y produce transcripciones ortográficas a nivel de palabra.

Su relevancia actual es doble: por un lado, declara un WER global del 17% en datos de evaluación reservados, mejorando a Whisper y KidWhisper en todos los grupos demográficos evaluados y reduciendo a más de la mitad la tasa de error en niños de 3 a 7 años; por otro, es un modelo abierto pensado para evaluación educativa temprana, herramientas de alfabetización y cribado de necesidades, un nicho con muy pocos recursos públicos de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio + modelo de lenguaje Qwen3 (`qwen3_asr`); fine-tune supervisado de Qwen3-ASR-1.7B |
| Parametros totales | 2.038.052.480 (~2,04 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible; en entrenamiento se usaron clips de audio de hasta 20 segundos |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors y no se han publicado pesos GGUF |
| Idiomas soportados | ingles (`en`) |
| Licencia | bigcode-openrail-m |
| Formato de pesos | safetensors |
| Tarea (pipeline) | automatic-speech-recognition |
| Entrada de audio | 16 kHz mono; `qwen_asr` convierte cualquier entrada a ese formato |
| Salida | Transcripcion ortografica a nivel de palabra |
| Tamano del repositorio | 4,1 GB |
| Descargas / likes | 172 descargas, 2 likes (en el momento de la consulta) |
| Fecha de creacion / actualizacion | 2026-10-02 / 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de Qwen3-ASR: un codificador de audio que procesa la senal y un modelo de lenguaje Qwen3 que emite la transcripcion un token cada vez. El fine-tune es de parametros completos, es decir, se actualizaron todos los pesos del modelo, no solo un adaptador. Se entrenó sobre clips de hasta 20 segundos de habla infantil con transcripciones ortograficas a nivel de palabra, durante dos epocas, con un tamano de lote global de 32 (4 por GPU en 8 A100), optimizador AdamW y una tasa de aprendizaje maxima de 3e-5. El schedule aplica un calentamiento lineal durante el 2% inicial de los pasos y despues un decaimiento lineal dimensionado para cinco epocas.

El modelo deriva del tercer puesto del Word Track del concurso "On Top of Pasketti: Children's Speech Recognition Challenge", una solucion de fine-tune completo de Qwen3-ASR-1.7B presentada por Tang Yongqwei (usuario `chuxiliyixiaosa`). El dato de entrenamiento declarado son 372 horas de habla infantil procedentes de mas de 3.600 ninos, descrito por el autor como el mayor corpus de este tipo disponible para desarrollar y evaluar modelos ASR abiertos para poblacion infantil. No se menciona en la informacion disponible el uso de RLHF, DPO ni de un dataset de preferencias; el entrenamiento descrito es puramente supervisado sobre pares audio-transcripcion. Tampoco se detalla la composicion completa del corpus ni el reparto por edades, acentos o condiciones de grabacion.

## Capacidades

- Reconocimiento automático del habla en ingles sobre voz infantil, con salida de transcripcion ortografica a nivel de palabra.
- Manejo de errores de pronunciacion tipicos de la infancia (metatesis, fronting velar, elision de silabas y combinaciones de estos fenomenos).
- Procesamiento por lotes: la API oficial admite `max_inference_batch_size` (32 en el ejemplo del autor) y `max_new_tokens` (256 en el ejemplo) para transcribir volumen alto de clips.
- Acepta multiples formatos de entrada: ruta local, URL `https`, cadena de audio en base64 o tupla `(waveform, sample_rate)` con arrays NumPy mono o multicanal.
- Conversión automática de la entrada a 16 kHz mono antes de la transcripción.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio generation ni modo "thinking".
- No se documenta soporte multilingue: el modelo esta etiquetado unicamente como ingles.

## Casos de uso

- **Cribado de alfabetizacion temprana**: transcribir lecturas en voz alta de ninos de 3 a 7 anos para calcular métricas de fluidez y precision lectora; el modelo es adecuado porque su WER baja a la mitad en ese tramo de edad respecto a Whisper y KidWhisper, y su salida a nivel de palabra permite comparar directamente contra el texto esperado.
- **Aplicaciones de tutoria de lectura**: integrar el modelo en una app que escuche al nino y detecte palabras mal pronunciadas o saltadas; el soporte de lotes y la inferencia via vLLM permiten atender varias sesiones concurrentes con una sola GPU.
- **Screening de necesidades del habla**: generar transcripciones para que logopedas revisen sesiones grabadas y prioricen casos; el modelo no sustituye una evaluacion clinica, pero reduce el tiempo de escucha y anotacion manual.
- **Investigacion en desarrollo fonologico**: anotar corpus de habla infantil a gran escala, procesando miles de clips por lotes; la salida ortografica es un punto de partida sobre el que aplicar despues reglas o modelos foneticos.
- **Herramientas educativas en el aula**: transcribir grabaciones de actividades guiadas o lecturas compartidas para generar material de seguimiento; los clips de hasta 20 segundos encajan con intervenciones cortas de un alumno.
- **Anotacion y control de calidad de datasets**: usar el modelo como preanotador en pipelines de datos de voz infantil y reservar la revision humana para los segmentos con baja confianza.
- **Evaluacion comparativa de ASR infantil**: servir de referencia open source en estudios que midan el rendimiento de distintos sistemas con poblacion infantil, dado que el autor publica una comparativa contra Whisper y KidWhisper.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| WER global en datos de evaluacion reservados | 17% |
| Comparacion con Whisper | Mejor en todos los grupos demograficos evaluados; cifras concretas no disponibles en la informacion proporcionada |
| Comparacion con KidWhisper | Mejor en todos los grupos demograficos evaluados; cifras concretas no disponibles en la informacion proporcionada |
| Ninos de 3 a 7 anos | Reduccion de la tasa de error de mas del 50% frente a los modelos de referencia; cifra exacta no disponible |
| Ninos de 5 anos o mas | Rendimiento cercano al nivel adulto; cifra exacta no disponible |
| Desglose por subconjunto demografico | No disponible en la informacion proporcionada (la model card remite a una seccion "Performance by Subset" que no se ha incluido completa) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, algo esperable en un modelo puramente ASR.

## Requisitos de hardware

- **VRAM estimada**: los safetensors ocupan 4,1 GB, por lo que los pesos en bf16/fp16 rondan esa cifra. No hay una cifra oficial de VRAM minima; con la caché KV de vLLM, `gpu_memory_utilization=0.9` y lotes de hasta 32 clips, una estimacion prudente es de 8 a 16 GB, pero es una estimacion, no un dato publicado.
- **GPU recomendadas**: el entrenamiento se hizo con 8 A100. Para inferencia, el autor solo indica que se ha probado en Linux con GPUs NVIDIA; no especifica modelos concretos. Una RTX 3090 o RTX 4090 (24 GB) deberia ser suficiente con los pesos en bf16, aunque no esta verificado en la informacion disponible.
- **Consumer GPU**: si, previsiblemente en GPUs de 16-24 GB, siempre que se use el stack vLLM soportado; no hay confirmacion oficial para GPUs de gama media o baja.
- **Opciones de despliegue**: vLLM es la via oficial y recomendada, a traves de `qwen_asr[vllm]==0.0.6` (verificado con `vllm==0.14.0`, `transformers==4.57.6`, `torch==2.9.1` y Python 3.13). Existe un backend `transformers` mediante `Qwen3ASRModel.from_pretrained()`, pero el autor indica que no se ha evaluado con este modelo y no esta soportado. No hay soporte documentado para llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- **Latencia y throughput**: no disponibles. Los unicos parametros orientativos son `max_inference_batch_size=32` y `max_new_tokens=256` en el ejemplo del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER en habla infantil | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pasketti-word | ~2,04 mil millones | no disponible (clips de hasta 20 s en entrenamiento) | 17% global | bigcode-openrail-m | HuggingFace |
| Whisper | no disponible en la informacion | no disponible | Peor que pasketti-word en todos los grupos evaluados; cifra no disponible | no disponible en la informacion | Open source |
| KidWhisper | no disponible en la informacion | no disponible | Peor que pasketti-word en todos los grupos evaluados; cifra no disponible | no disponible en la informacion | Open source |
| Qwen3-ASR-1.7B (modelo base) | 1,7 mil millones (nominal) | no disponible | no disponible | no disponible en la informacion | HuggingFace |

La comparacion cuantitativa con alternativas no puede completarse con los datos proporcionados: el autor afirma superioridad frente a Whisper y KidWhisper, pero no se incluyen en la informacion disponible las tablas numericas por modelo y subconjunto.

## Limitaciones y advertencias

- **Solo ingles**: el modelo esta etiquetado unicamente para `en`; no hay soporte documentado de otros idiomas.
- **WER del 17%**: implica que aproximadamente una de cada seis palabras puede ser incorrecta. No es adecuado para transcripcion de alta exigencia sin revision humana.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje aplicado a ASR, puede generar texto plausible en segmentos con ruido, solapamiento de voces o audio de baja calidad.
- **Sesgos demograficos**: el autor reporta mejoras en todos los grupos, pero el desglose detallado por edad, genero, acento o nivel socioeconomico no esta disponible en la informacion proporcionada; el rendimiento puede variar en poblaciones poco representadas en el corpus.
- **Duracion de audio**: el entrenamiento uso clips de hasta 20 segundos; no se documenta el comportamiento con grabaciones largas, por lo que conviene segmentar.
- **Dependencia del stack**: `transformers` por si solo no puede cargar el modelo, ya que la arquitectura `qwen3_asr` se registra al importar `qwen_asr`. El backend `transformers` no esta evaluado ni soportado. Ademas, `qwen_asr` fija una version exacta de `transformers`, lo que puede romper instalaciones con versiones mas recientes.
- **Hardware**: solo probado en Linux con GPUs NVIDIA; no hay garantias en otros entornos.
- **Licencia bigcode-openrail-m**: permite uso comercial sujeto a las restricciones de uso del modelo OpenRAIL (prohibicion de usos daninos y obligacion de propagar restricciones similares aguas abajo). Conviene revisar el texto completo antes de un despliegue en produccion.
- **Datos de menores**: se trata de un modelo entrenado con voz de ninos; cualquier aplicacion real debe cumplir la normativa de proteccion de datos y contar con los consentimientos correspondientes.
- **No es una herramienta diagnostica**: el propio autor lo orienta a evaluacion educativa y cribado, no a diagnostico clinico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drivendata/pasketti-word
- Notebook de Colab: https://colab.research.google.com/drive/1JLD-xdwhA2lRAomRCSG3seNyhV7NEbx8
- Resumen del proyecto y de los datos: https://drivendata.co/kidsasr
- Blog con el benchmark de ASR infantil: https://drivendata.co/blog/child-asr-word-benchmark
- Repositorio con las soluciones ganadoras: https://github.com/drivendataorg/on-top-of-pasketti
- Solucion del tercer puesto (Word Track): https://github.com/drivendataorg/on-top-of-pasketti/tree/main/word-track/3rd%20Place
- Concurso "On Top of Pasketti": https://www.drivendata.org/competitions/308/
- Pagina del grupo de competiciones: https://www.drivendata.org/competitions/group/childrens-asr-competition/
- Blog de ganadores: https://drivendata.co/blog/on-top-of-pasketti-winners
- Documentacion de instalacion de vLLM: https://docs.vllm.ai/en/latest/getting_started/installation/
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
