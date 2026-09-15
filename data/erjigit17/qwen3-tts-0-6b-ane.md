# erjigit17/Qwen3-TTS-0.6B-ANE

## Resumen

Qwen3-TTS-0.6B-ANE es un port experimental y no oficial de Qwen3-TTS-12Hz-0.6B-CustomVoice a Core ML, orientado exclusivamente a Apple Silicon y a la ejecución sobre la Neural Engine (ANE). Lo publica el usuario erjigit17 y su objetivo es servir una única voz femenina en inglés (Serena) mediante un servidor gRPC bidireccional que acepta texto de forma incremental y devuelve fragmentos de audio PCM16 mono a 24 kHz. El repositorio incluye los grafos Core ML, el tokenizador, las tablas del frontend de Serena, un servidor y un cliente ejecutables y una muestra de audio empaquetada.

El modelo base es el modelo de síntesis de voz Qwen3-TTS de 0,6 mil millones de parámetros en su variante CustomVoice de 12 Hz, del que este proyecto deriva una conversión optimizada para el hardware neuronal de Apple. Frente a una inferencia en PyTorch sobre CPU o GPU, la versión ANE consigue generación más rápida que el tiempo real: en un MacBook Air M4 de 32 GB se midieron factores de 1,299x, 1,328x y 1,350x de tiempo real (mediana 1,328x) en tres generaciones completas de 4,08 segundos, con un primer fragmento PCM a 70,6 ms de mediana y 133,7 ms de p95.

Su relevancia actual es doble: por un lado demuestra que un modelo TTS de 0,6B puede desplegarse íntegramente en local sobre un portátil Apple sin GPU dedicada, con un consumo de memoria del host de aproximadamente 385 MiB; por otro, documenta una metodología de conversión estricta en la que el 100% de las operaciones neuronales reportadas prefieren ANE, sin ninguna operación neuronal preferida por CPU o GPU. Se trata, en cualquier caso, de una vista previa para desarrolladores, no de un lanzamiento oficial de Qwen ni de un servicio con garantías de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo TTS basado en Qwen3-TTS (transformer) convertido a grafos Core ML; detalles internos de capas no disponibles |
| Parametros totales | 0,6B (aproximadamente 600 millones, segun el nombre del modelo base); cifra exacta no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Tablas de embeddings del host en FP16 con correcciones FP32 dispersas (reconstruccion identica al frontend FP32); no se distribuyen variantes GGUF ni cuantizaciones de 4/8 bits |
| Idiomas soportados | Ingles unicamente (voz Serena) |
| Licencia | Apache-2.0 |
| Formato de pesos | Grafos Core ML generados con coremltools; no se distribuyen pesos en safetensors ni GGUF segun la informacion disponible |
| Frecuencia de muestreo de salida | 24 kHz, mono, PCM16 |
| Tamano de fragmento de audio | 80 ms por chunk |
| Tamano del repositorio | 2,2 GB en HuggingFace; descarga completa aproximada de 3,96 GB |
| Modelo base | Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice (revision 85e237c12c027371202489a0ec509ded67b5e4b5) |
| Plataforma de ejecucion | Apple Silicon con Neural Engine (Core ML); probado en macOS 26.5, Xcode 27 y Core ML Tools 9.0 |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base ni de esta conversion: no se indican numero de tokens de entrenamiento, composicion del dataset, ni si hubo fases de RLHF o DPO. Lo que si se detalla es el proceso de conversion. Los grafos Core ML se generaron con coremltools 9.0 y pasaron una puerta de calidad estricta de plan de computo: el 100% de las operaciones neuronales reportadas prefieren la ANE y hay cero operaciones neuronales con preferencia por CPU o GPU. Tokenizacion, manejo de arrays, gRPC y el control de Core ML siguen ejecutandose en la CPU del host, por lo que el sistema no es de CPU cero.

Un detalle tecnico destacable es el tratamiento de las tablas de embeddings del host: se almacenan en FP16 y se complementan con correcciones FP32 dispersas, de forma que cada valor reconstruido y el WAV de muestra completo coinciden exactamente con el frontend FP32 de referencia. El modelo base trabaja con un esquema de tokens acusticos a 12 Hz (de ahi el sufijo 12Hz) y esta especializado en una voz concreta (CustomVoice), en este caso Serena. La generacion es greedy y no se expone clonacion de voz ni control fiable de instrucciones o emociones en el runtime empaquetado.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con salida PCM16 mono a 24 kHz.
- Streaming bidireccional: el cliente puede enviar texto de forma incremental mientras recibe fragmentos de audio de 80 ms.
- Generacion mas rapida que el tiempo real en el hardware probado (1,328x de mediana), lo que permite reproduccion continua sin cortes.
- Inferencia local en Apple Silicon usando la Neural Engine, sin GPU dedicada ni servicios en la nube.
- Servicio mediante gRPC con el protocolo `tts.v1.Speech/Synthesize`, definido en `tts_stream.proto`; permite cerrar el flujo de texto al terminar y cancelar la RPC para detener la generacion de inmediato.
- Reproduccion fiel del frontend: los valores reconstruidos y la muestra WAV coinciden exactamente con la referencia FP32.
- No soporta clonacion de voz, ni multi-locutor, ni control de emociones o instrucciones.
- No soporta tool calling ni razonamiento multi-paso: no es un modelo de lenguaje, es un componente de sintesis de voz.
- Capacidades multilingues: solo ingles.

## Casos de uso

- Lectura por voz en aplicaciones de escritorio para macOS: el modelo puede integrarse como servicio local en una app nativa y narrar texto seleccionado sin enviar contenido a terceros, algo relevante para documentos sensibles o entornos sin conectividad.
- Agentes conversacionales locales con salida hablada: combinado con un LLM que se ejecute en el mismo Mac, el cliente gRPC puede ir enviando las frases conforme se generan y reproducir el audio con una latencia de primer fragmento de 70,6 ms de mediana.
- Prototipos de atencion al cliente: la muestra incluida ("I'm sorry about the charge. I'll fix it for you.") ilustra el caso de respuestas breves y empaticas en dominios de soporte, donde la ventana de generacion de hasta 40 segundos por intervencion es suficiente.
- Narracion de resumenes y articulos: con 502 frames de audio como maximo (unos 40 segundos antes de un EOS natural anticipado), encaja en resumenes cortos, avisos y boletines, no en audiolibros completos sin segmentacion previa.
- Accesibilidad y tecnologias de asistencia: lectores de pantalla o asistentes que necesiten una voz inglesa coherente y de baja latencia en un portatil Apple, con consumo de memoria del host en torno a 385 MiB.
- Pruebas automatizadas en CI de pipelines de audio: el servidor gRPC permite generar WAV de referencia reproducibles (generacion greedy) para validar cadenas de transcripcion, diarizacion o post-procesado.
- Investigacion sobre eficiencia en ANE: sirve como caso de estudio de conversion Core ML con puerta estricta de plan de computo, util para medir que operaciones permanecen en CPU y como afectan a la latencia total.
- Demos interactivas y entornos de desarrollo sin red: al enlazar el servidor solo a 127.0.0.1 y no requerir autenticacion, es adecuado para pruebas locales controladas, no para exposicion publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de metricas objetivas de calidad de sintesis (MOS, WER de re-sintesis, similitud de locutor) ni comparaciones con otros sistemas TTS. Lo que si se aporta son mediciones de latencia y throughput realizadas en un MacBook Air M4 de 32 GB, macOS 26.5, Xcode 27 y Core ML Tools 9.0, sobre 30 ensayos de bucle cerrado por gRPC con texto nuevo:

| Metrica | Valor medido |
|---|---|
| Primer fragmento PCM, p50 | 70,6 ms |
| Primer fragmento PCM, p95 | 133,7 ms |
| Factor de tiempo real (3 generaciones de 4,08 s) | 1,299x / 1,328x / 1,350x; mediana 1,328x |
| Tamano del fragmento de audio | 80 ms |
| Memoria RSS del proceso Python tras una peticion completa | ~385 MiB (excluye asignaciones gestionadas por Core ML/ANE y la cache compilada en disco) |
| Operaciones neuronales con preferencia ANE | 100% |
| Operaciones neuronales con preferencia CPU/GPU | 0% |
| Duracion maxima de sintesis | 502 frames de audio (unos 40 segundos, sujeto a EOS natural anterior) |

La carga del modelo, la compilacion de Core ML y el inicio audible de la voz quedan excluidos de la medicion del primer fragmento PCM. Solo se admite una sintesis simultanea.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon. El proyecto requiere, ademas, Python 3.12 y las herramientas de linea de comandos de Xcode.
- Memoria: no se especifica un minimo de memoria unificada; las pruebas se hicieron en un MacBook Air M4 con 32 GB. El proceso Python del host consume aproximadamente 385 MiB de RSS tras una peticion completa, sin contar las asignaciones gestionadas por Core ML/ANE ni la cache compilada en disco.
- Almacenamiento: 2,2 GB de repositorio en HuggingFace y aproximadamente 3,96 GB de descarga completa con grafos, tokenizador, tablas, servidor, cliente y muestra.
- GPU: no se utiliza GPU dedicada; el calculo neuronal va a la Neural Engine. No hay soporte documentado para CUDA ni para GPU de NVIDIA o AMD.
- Cabe en hardware de consumo: si, en cualquier Mac con chip de la familia M que cumpla los requisitos de software, aunque el rendimiento solo se ha certificado en el M4 probado y no en otros chips, modos de energia o cargas concurrentes.
- Opciones de despliegue: servidor gRPC propio (`serve.py`) mas cliente (`client.py`), sobre Core ML y coremltools. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: primer fragmento PCM a 70,6 ms de mediana y 133,7 ms de p95; generacion a 1,328x de mediana respecto al tiempo real en el M4 de 32 GB. El servidor escucha unicamente en 127.0.0.1 y no implementa TLS ni autenticacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| erjigit17/Qwen3-TTS-0.6B-ANE | 0,6B (segun modelo base) | No disponible | Core ML sobre ANE (Apple Silicon) | Apache-2.0 | HuggingFace, port no oficial, 0 descargas y 1 like en el momento de la consulta |
| Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice (modelo base) | 0,6B | No disponible | PyTorch (upstream) | Apache-2.0 | Modelo oficial de Qwen en HuggingFace |
| Otros sistemas TTS locales ligeros (por ejemplo Piper, Kokoro o XTTS) | No disponible | No disponible | Multiples | No disponible | No disponible |

No se dispone de datos de rendimiento comparables entre estas opciones en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad de sintesis, latencia o consumo entre ellas. La diferencia documentada frente al modelo base es de naturaleza de despliegue: esta version sustituye la ejecucion en PyTorch por grafos Core ML optimizados para ANE y anade una capa de servicio gRPC con streaming.

## Limitaciones y advertencias

- Alcance linguistico y de locutor reducido: solo ingles y solo la voz femenina Serena. No hay clonacion de voz ni seleccion entre varias voces.
- Generacion greedy: no se exponen parametros de muestreo, por lo que la variedad prosodica es limitada y no hay control fiable de instrucciones ni de emociones en el runtime empaquetado.
- Duracion limitada: maximo de 502 frames de audio, aproximadamente 40 segundos, y puede terminar antes por un EOS natural.
- Una sola sintesis simultanea: no esta disenado para atender peticiones concurrentes.
- Seguridad: el servidor se enlaza solo a 127.0.0.1 y carece deliberadamente de TLS y de autenticacion. Exponerlo en red requeriria anadir una capa de seguridad propia.
- Rendimiento no certificado: las cifras de latencia y tiempo real proceden de un unico MacBook Air M4 de 32 GB con versiones concretas de macOS y herramientas; no se garantizan en otros chips Apple, modos de energia o cargas concurrentes.
- Dependencia del ecosistema Apple: requiere Apple Silicon, Python 3.12, herramientas de linea de comandos de Xcode y Core ML. No es portable a Linux, Windows o GPU de NVIDIA sin una conversion nueva.
- Estado del proyecto: es una vista previa para desarrolladores, no un lanzamiento oficial de Qwen ni un servicio con SLA de produccion. No esta validado por el equipo de Qwen.
- Riesgo de errores de sintesis: al ser un modelo generativo no deterministico en su uso real (aunque la decodificacion sea greedy), pueden aparecer pronunciaciones incorrectas, pausas anomalas o prosodia inadecuada, especialmente con texto fuera de dominio, siglas, numeros o nombres propios; se recomienda validacion con muestras propias.
- Sin datos sobre sesgos: no se ha publicado informacion sobre sesgos de acento, genero o variedad dialectal en el modelo base ni en esta conversion.
- Licencia: tanto Qwen3-TTS como esta distribucion usan Apache-2.0, que permite uso comercial, pero al tratarse de un port no oficial conviene revisar la model card del modelo base y el archivo LICENSE incluido antes de desplegarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erjigit17/Qwen3-TTS-0.6B-ANE
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Codigo fuente de la conversion: https://github.com/er-zhi/ai-engineering-boilerplate/tree/main/native/tts-ane
- Revision upstream utilizada para extraer los activos del host: 85e237c12c027371202489a0ec509ded67b5e4b5
- Muestra de audio incluida en el repositorio: ./samples/serena.wav
- Los resultados de busqueda web disponibles no contienen enlaces relacionados con este modelo.
