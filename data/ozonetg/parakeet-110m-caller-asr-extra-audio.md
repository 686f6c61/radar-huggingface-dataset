# ozonetg/parakeet-110m-caller-asr-extra-audio

## Resumen

parakeet-110m-caller-asr-extra-audio es un modelo de reconocimiento automático del habla (ASR) publicado por el usuario ozonetg en HuggingFace. Se trata de un ajuste fino de nvidia/parakeet-tdt_ctc-110m, el modelo de NVIDIA, especializado en el canal del cliente (caller) de llamadas telefónicas salientes en inglés estadounidense a 8 kHz. Cuenta con 114,6 millones de parámetros y combina un codificador FastConformer con un decodificador TDT (token-and-duration transducer) y una cabeza CTC auxiliar.

El problema que aborda es la transcripción precisa del lado del cliente en entornos de centro de llamadas, donde los modelos ASR genéricos pierden exactitud al enfrentarse a banda estrecha, ruido de línea y solapamiento conversacional. Frente al modelo base sin tocar (14,58 % de WER en cinco conjuntos públicos de llamadas agrupados) y al sistema previo con un pequeño adaptador de dominio (14,00 %), este ajuste alcanza un 11,56 % en el mismo conjunto agrupado, y baja a un 3,45 % en llamadas en dominio reservadas, frente al 9,19 % del base y el 8,68 % del sistema previo.

Su relevancia radica en que demuestra que un modelo de 114,6 M de parámetros, destilado a partir de un ajuste de 0,6 B y entrenado con transcripciones generadas por máquina, puede superar a alternativas mayores en un dominio vertical concreto con un coste de inferencia muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador FastConformer (114,6 M de parametros) con decodificador TDT (token-and-duration transducer) y cabeza CTC auxiliar |
| Parametros totales | 114,6 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; el autor no especifica ventana de audio) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en float32) |
| Idiomas soportados | ingles (en), variante estadounidense |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.nemo` (float32), archivo `parakeet-110m-caller-asr-extra-audio.nemo` |
| Entrada de audio | mono a 16 kHz en coma flotante; el audio telefonico de 8 kHz debe remuestrearse a 16 kHz |
| Salida | texto en ingles con puntuacion y mayusculas |
| Decodificacion | TDT voraz (greedy) |
| Framework | NeMo 2.5.3 (tambien restaura y transcribe en NeMo 3.0) |
| Modelo base | nvidia/parakeet-tdt_ctc-110m (relacion: finetune) |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un codificador FastConformer, una variante de Conformer con atencion por bloques que reduce el coste computacional manteniendo el modelado convolucional local. Sobre el codificador se situa un decodificador TDT, que predice conjuntamente el token y su duracion, mas una cabeza CTC auxiliar. El modelo tiene 114,6 M de parametros y se distribuye en float32.

El entrenamiento se realizo en dos etapas. En la primera se aplico destilacion a nivel de secuencia: el ajuste de 0,6 B, parakeet-0.6b-caller-asr-basic, retranscribio las 345 horas de audio de entrenamiento mas 170 horas adicionales de audio de cliente de las mismas fuentes que carecian de etiqueta utilizable; el modelo de 110 M se entreno sobre esas transcripciones, en total 774.916 segmentos y 518,6 horas, con la receta estandar. En la segunda se aplico un blend WiSE-FT: 0,7 x los pesos entrenados mas 0,3 x los pesos del modelo base sin tocar.

Los datos proceden del canal del cliente de llamadas de venta saliente estadounidenses, a 8 kHz mono, de cinco fuentes internas grabadas entre 2025 y 2026, con segmentos de 0,3 a 20 segundos. El split de entrenamiento tiene 504.617 segmentos (345,5 horas); el 5 % son segmentos sin habla (ruido de linea, silencio, espera, respiracion) con objetivo vacio, para ensenar al modelo a permanecer en silencio, y alrededor del 1 % son saludos de buzon de voz o mensajes de IVR captados en la linea del cliente. Las etiquetas son transcripciones automaticas de Qwen3-ASR-1.7B, sin transcripcion humana: cada transcripcion se contrasto con sistemas ASR independientes y los segmentos con coincidencia total se etiquetaron como tier 1 (peso de perdida 1,0), los de coincidencia parcial como tier 2 (peso 0,7) y el resto se descarto.

## Capacidades

- Transcripcion de voz a texto en ingles estadounidense, con puntuacion y mayusculas incluidas en la salida.
- Reconocimiento optimizado para audio telefonico de banda estrecha (8 kHz mono) remuestreado a 16 kHz.
- Supresion de audio no vocal: el 5 % del entrenamiento son segmentos sin habla con objetivo vacio, y entre las variantes de 110 M es la que menos salidas tipo "yes" produce sobre audio no vocal antes de aplicar cualquier puerta de filtrado.
- Reconocimiento de buzon de voz y mensajes de IVR presentes en la linea del cliente (~1 % de los datos de entrenamiento).
- Manejo de conversacion telefonica solapada y espontanea, segun los resultados en CallHome, CallFriend y Switchboard.
- No dispone de tool calling ni de function calling.
- No esta orientado a agentes ni a razonamiento multi-paso: es un modelo puramente acustico.
- No es multilingue: solo ingles.
- No tiene modo de razonamiento, vision ni audio-vision.

## Casos de uso

- Transcripcion de llamadas de venta saliente: el modelo esta entrenado especificamente con el canal del cliente en este tipo de llamadas, por lo que transcribe la voz del interlocutor con un WER del 3,45 % en llamadas en dominio reservadas, frente al 9,19 % del modelo base.
- Analitica de centros de contacto: permite generar transcripciones masivas de 8 kHz para extraer motivos de llamada, objeciones y patrones de conversacion, con un coste de inferencia bajo al tratarse de 114,6 M de parametros.
- Control de calidad y cumplimiento normativo: permite revisar conversaciones grabadas y verificar guiones o divulgaciones obligatorias, con puntuacion y mayusculas ya incluidas en la salida.
- Monitorizacion en tiempo real (streaming de baja latencia): el decodificador TDT voraz es adecuado para pipelines incrementales, aunque el autor no publica cifras de latencia.
- Enrutado y clasificacion de llamadas: la transcripcion puede alimentar un clasificador posterior de intencion o de sentimiento en el canal del cliente.
- Deteccion de buzon de voz e IVR: el modelo ha visto ejemplos etiquetados de estos casos en la linea del cliente, lo que permite separarlos de conversaciones reales.
- Generacion de conjuntos de datos etiquetados: sirve como etiquetador a escala para audio telefonico no anotado, dado su coste computacional reducido.
- Sistemas de asistencia al agente: la transcripcion puede alimentar sugerencias de respuesta en pantalla, siempre que se combine con un modelo de lenguaje independiente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card. Ninguno esta verificado de forma independiente (`verified: false`).

| Conjunto de evaluacion | WER (%) |
|---|---|
| LibriSpeech test-clean | 2,59 |
| LibriSpeech test-other | 5,46 |
| LibriSpeech test-clean (8 kHz) | 2,93 |
| LibriSpeech test-other (8 kHz) | 6,51 |
| CallHome English (test) | 12,29 |
| CallFriend English (dev) | 17,49 |
| HarperValley Bank (canal del cliente) | 5,31 |
| Let's Go (referencias retranscritas) | 23,62 |
| AppTek call-center dialogues, clientes de EE. UU. | 8,86 |
| Switchboard (subconjunto de 3.000 enunciados) | 7,48 |

Comparativas declaradas en el texto de la model card:

| Escenario | Este modelo | Sistema previo (110m + adaptador de dominio) | Base sin tocar (110m) |
|---|---|---|---|
| Cinco conjuntos publicos de llamadas (agrupados) | 11,56 % | 14,00 % | 14,58 % |
| Llamadas en dominio reservadas | 3,45 % | 8,68 % | 9,19 % |
| LibriSpeech test-other a 8 kHz | 6,51 % | no disponible | 6,25 % (+0,26 pp) |

## Requisitos de hardware

- Peso de los parametros: 114,6 M en float32 equivalen a aproximadamente 0,46 GB, en linea con el tamano del repositorio (0,5 GB). Es un calculo derivado del numero de parametros, no una cifra publicada por el autor.
- VRAM estimada para inferencia: no disponible de forma oficial. Dado el tamano de los pesos, la huella total dependera del runtime y del tamano de lote; cualquier GPU de consumo moderna deberia poder alojarlo, pero se trata de una estimacion no confirmada.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Ejecucion en GPU de consumo: previsiblemente viable por el reducido numero de parametros, sin confirmacion del autor.
- Ejecucion en CPU: no confirmada.
- Opciones de despliegue: NeMo 2.5.3 y NeMo 3.0 son los frameworks declarados. No se publican pesos GGUF ni cuantizaciones, por lo que no hay soporte declarado para llama.cpp, Ollama, vLLM o TGI sin una conversion previa.
- Latencia y throughput: no disponibles. La decodificacion empleada en las cifras reportadas es TDT voraz.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | WER en dominio de llamadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ozonetg/parakeet-110m-caller-asr-extra-audio | 114,6 M | FastConformer + TDT + CTC, ajustado al canal del cliente | 11,56 % en cinco conjuntos publicos agrupados; 3,45 % en dominio reservado | CC BY 4.0 | HuggingFace, formato `.nemo`, 0 descargas |
| nvidia/parakeet-tdt_ctc-110m | 114,6 M | FastConformer + TDT + CTC, base generalista | 14,58 % en los mismos cinco conjuntos agrupados | no disponible en la informacion | HuggingFace |
| ozonetg/parakeet-0.6b-caller-asr-basic | 0,6 B | Mismo ajuste de dominio, mayor tamano; se uso para destilar | no disponible en la informacion | no disponible en la informacion | HuggingFace |
| Qwen3-ASR-1.7B | 1,7 B | Modelo ASR usado para generar las etiquetas de entrenamiento | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

## Limitaciones y advertencias

- Sesgo de dominio: el entrenamiento usa exclusivamente el canal del cliente de llamadas de venta saliente de EE. UU., grabadas entre 2025 y 2026 a partir de cinco fuentes internas. El vocabulario, los acentos y los patrones conversacionales estan sobrerrepresentados en ese contexto y el comportamiento fuera de el no esta caracterizado.
- Etiquetas generadas por maquina: ninguna transcripcion fue producida por humanos. Las etiquetas provienen de Qwen3-ASR-1.7B y se filtraron por consenso con otros sistemas ASR (tier 1 con peso 1,0, tier 2 con peso 0,7, resto descartado), por lo que los errores sistematicos del etiquetador pueden haberse transferido al modelo.
- Alucinacion en ASR: el riesgo se manifiesta como inserciones de texto sobre audio no vocal. El autor indica que, entre las variantes de 110 M, esta es la que menos salidas tipo "yes" genera antes de cualquier puerta de filtrado, pero no se declara una tasa de falsos positivos.
- Idioma unico: solo ingles estadounidense. No hay soporte multilingue ni de otras variantes del ingles.
- Degradacion fuera de banda estrecha: en LibriSpeech test-other a 8 kHz el WER es de 6,51 %, un 0,26 puntos porcentuales peor que el modelo base (6,25 %), segun la propia model card.
- WER elevado en algunos conjuntos: 23,62 % en Let's Go y 17,49 % en CallFriend English (dev), lo que limita su uso en conversaciones telefonicas genericas ajenas al dominio de ventas salientes.
- Licencia: CC BY 4.0 permite uso comercial con atribucion, sin restricciones adicionales conocidas, pero conviene revisar los terminos del modelo base de NVIDIA del que deriva.
- Resultados no verificados: las cifras de la model card estan marcadas como `verified: false` y el repositorio registra 0 descargas y 0 "likes", por lo que no hay validacion independiente por parte de terceros.
- Sin cuantizaciones: solo se publica el archivo `.nemo` en float32, lo que obliga a usar NeMo o a exportar el modelo antes de desplegarlo en otros runtimes.

## Enlaces

- [ozonetg/parakeet-110m-caller-asr-extra-audio en HuggingFace](https://huggingface.co/ozonetg/parakeet-110m-caller-asr-extra-audio)
- [nvidia/parakeet-tdt_ctc-110m (modelo base)](https://huggingface.co/nvidia/parakeet-tdt_ctc-110m)
- [ozonetg/parakeet-0.6b-caller-asr-basic (modelo de 0,6 B usado para la destilacion)](https://huggingface.co/ozonetg/parakeet-0.6b-caller-asr-basic)
