# cudabenchmarktest/Qwen3.8-27B-E03-Obliterated-Omni-Audio-Bridge-GGUF

## Resumen

Qwen3.8-27B-E03-Obliterated-Omni-Audio-Bridge es una entrega comunitaria en formato GGUF publicada por el usuario `cudabenchmarktest`. No es un modelo entrenado desde cero, sino un ensamblaje coordinado de tres componentes: el tronco de lenguaje denso `manitcor/Qwen3.8-27B-Obliterated-E03`, la torre de audio congelada y la ruta de vision del modelo `Qwen/Qwen3-Omni-30B-A3B-Instruct`, y el sintetizador de voz `Qwen/Qwen3-TTS-12Hz-1.7B-Base`, que se ejecuta como grafo de salida independiente en un sidecar.

El problema que resuelve es el coste de anadir comprension de audio y salida de voz a un modelo de lenguaje de 27B sin duplicar un router multimodal completo. La release conserva un unico tronco de lenguaje, mantiene congelada la torre de audio de Qwen3-Omni y sustituye unicamente la proyeccion final de audio de 1.280 dimensiones por un puente entrenado de 6.558.720 parametros. El conjunto de pesos desplegable pasa de 52,45 GiB (bundle Ollama con router completo) a 18,33 GiB, un 65,1% menos.

Es relevante por dos motivos. En lo tecnico, demuestra que un adaptador de 6,5 millones de parametros basta para conectar una torre de audio congelada a un tronco de lenguaje distinto, con una tasa de error de palabra de 0,0806 sobre 155 muestras retenidas y cero falsas transcripciones en audio sin habla. En lo practico, los tres artefactos (15,41 GiB de lenguaje en Q4_K_M, 1,54 GiB de proyector BF16 y 1,38 GiB de sidecar TTS) apuntan a despliegues en equipos de 32 GB, aunque la entrega depende de un runtime externo y no es un GGUF monolitico cargable de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblaje multimodal: tronco de lenguaje denso con atencion hibrida (Qwen3.8-27B), torre de audio congelada de Qwen3-Omni, proyector vision/audio BF16 y sidecar TTS |
| Parametros totales | 27 B nominales en el tronco de lenguaje; 6.558.720 parametros entrenables en el puente de audio; el metadato de safetensors del repositorio declara 2.040.866.561 (no coherente con el nombre del modelo, probable artefacto de metadatos) |
| Parametros activos | No aplica al tronco, que es denso. La torre de audio procede de un MoE (Qwen3-Omni-30B-A3B) pero se reutiliza congelada |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (tronco de lenguaje y TTS), BF16 (proyector combinado vision/audio y code2wav del sidecar TTS) |
| Idiomas soportados | No disponible. Un repositorio hermano del mismo autor incluye la etiqueta `English`, sin confirmacion en esta ficha |
| Licencia | `other` / `apache-2.0-components`: licencia compuesta, hay que revisar los terminos de cada componente por separado |
| Formato de pesos | GGUF, en tres artefactos coordinados: `qwen3.8-27b-e03-obliterated-q4_k_m.gguf` (15,41 GiB), `mmproj-qwen38-e03-omni-audio-bridge-bf16.gguf` (1,54 GiB) y `qwen3.8-27b-e03-obliterated-omni-audio-bridge-tts-sidecar.gguf` (1,38 GiB) |

## Arquitectura y entrenamiento

El tronco de lenguaje es `manitcor/Qwen3.8-27B-Obliterated-E03`, derivado de la familia Qwen3.8. Segun la receta de vLLM para `Qwen/Qwen3.8-27B`, se trata de un modelo denso de 27.000 millones de parametros con backbone de atencion hibrida: solo 16 de las 64 capas ejecutan atencion completa (`full_attention_interval: 4`) y las otras 48 usan atencion lineal con estado recurrente constante. La release conserva la ruta de vision nativa del modelo objetivo y anade la torre de audio de Qwen3-Omni, que permanece congelada; el unico elemento entrenado es el puente que reemplaza la proyeccion de audio de 1.280 dimensiones.

El entrenamiento del puente es deliberadamente ligero: 1.920 muestras, con el mejor checkpoint de perdida de validacion en el paso 250, que es tambien el checkpoint liberado tras superar las puertas de comportamiento. No se especifica la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineacion. La evidencia de audio se emite en canales separados (`<speech_transcript>` y `<audio_observation>`), y la entrada solo-audio nunca activa procedencia visual. El runtime soporta decodificacion especulativa `ngram-simple` sin pesos adicionales, aunque el autor recomienda medirla en el dispositivo objetivo antes de usarla. El Omni Thinker no esta incluido en esta entrega.

## Capacidades

- Generacion de texto y razonamiento sobre el tronco Qwen3.8-27B, con canal de pensamiento separado (`separate thinking channel returned: true`).
- Llamada a herramientas y function calling estructurado: la puerta de herramientas registro una llamada estructurada devuelta correctamente.
- Comprension de imagen mediante la ruta de vision nativa conservada (secuencia rojo -> azul -> rojo correcta, con `cache_prompt:false` ejercitado).
- Comprension de audio y reconocimiento automatico de voz, con transcripcion etiquetada y observaciones de audio en canales independientes.
- Procesamiento de video, sujeto al runtime de adaptadores (los tags del repositorio incluyen `audio` y `video`).
- Sintesis de voz a 24 kHz mono PCM16 WAV mediante el sidecar, con 457 de 457 archivos validos en la auditoria.
- Soporte de agentes y razonamiento multi-paso a traves del tool calling estructurado del tronco.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Decodificacion especulativa sin pesos (`ngram-simple`) soportada por el runtime.

## Casos de uso

- Transcripcion de audio con salida estructurada: el puente emite la transcripcion en `<speech_transcript>` de forma separada de las observaciones, con una WER de 0,0806 sobre 155 muestras retenidas y una tasa nula de falsas transcripciones en segmentos sin habla. Es adecuado para pipelines que necesitan distinguir habla de ruido antes de actuar.
- Atencion al cliente por voz: la combinacion de reconocimiento de voz, tronco de lenguaje con tool calling y sidecar TTS permite cerrar el ciclo conversacional en un unico despliegue, invocando sistemas externos mediante herramientas estructuradas.
- Agentes que consumen audio como entrada: el modelo puede transcribir un mensaje de voz y ejecutar una llamada a herramienta en el mismo turno, lo que permite agentes telefonicos o asistentes de soporte que no requieren un servicio de ASR independiente.
- Analisis de imagenes combinado con audio: la ruta de vision nativa y la torre de audio conviven en el mismo proyector BF16, de modo que se puede describir una imagen y transcribir una locucion asociada sin cambiar de modelo.
- Accesibilidad y lectura en voz alta: el sidecar genera WAV PCM16 mono a 24 kHz verificados, util para convertir documentacion tecnica o respuestas de un asistente en audio reproducible.
- Despliegue en edge con presupuesto de memoria ajustado: los 18,33 GiB del conjunto de pesos permiten plantear ejecucion en tarjetas de 24 GB o en equipos tipo Jetson de 32 GB, siempre que se mida el consumo real de KV cache y workspaces antes de comprometerse.
- Generacion de datos sinteticos de voz y habla para entrenar o evaluar otros sistemas, apoyandose en la puerta A -> B -> A con WER 0,0000 tras reinicio de estado.
- Moderacion y auditoria de contenido audiovisual: la separacion estricta entre evidencia de audio y procedencia visual (cero afirmaciones visuales desde entrada solo-audio) facilita registrar de donde proviene cada afirmacion del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica evidencia son las puertas internas del autor:

| Prueba | Conjunto | Metrica | Resultado |
|---|---|---|---|
| Puente de audio (held-out) | 155 muestras | WER de habla | 0,0806 |
| Puente de audio (held-out) | 155 muestras | Tasa de falsa transcripcion sin habla | 0,0000 |
| Puente de audio (held-out) | 155 muestras | Tasa de salida etiquetada exacta | 1,0000 |
| Puente de audio (held-out) | 155 muestras | Afirmaciones visuales desde entrada solo-audio | 0 |
| Vision nativa | no disponible | Secuencia rojo -> azul -> rojo correcta | Si |
| Vision nativa | no disponible | Tasa de salida visual etiquetada exacta | 1,0000 |
| Vision nativa | no disponible | Fallos por medios obsoletos | 0 |
| Lenguaje y herramientas | no disponible | Capacidades anunciadas requeridas presentes | Si |
| Lenguaje y herramientas | no disponible | Llamadas a herramientas estructuradas devueltas | 1 |
| Lenguaje y herramientas | no disponible | Canal de pensamiento separado devuelto | Si |
| TTS, reinicio de estado | 3 muestras A -> B -> A | WER medio de transcripcion | 0,0000 |
| TTS, vocabulario | 4.565 palabras unicas | Recall de palabras unicas | 0,7643 |
| TTS, vocabulario | 4.565 palabras unicas | Recall de palabras raras | 0,7287 |
| TTS, vocabulario | no disponible | WER medio por lote de vocabulario | 0,2333 |
| TTS, formato | 457 archivos | WAV PCM16 mono 24 kHz validos | 457/457 |
| TTS, auditoria estricta | no disponible | Transcripciones vacias | 0 |

Todas las puertas configuradas se declaran superadas (`all configured gates passed: true`). El entrenamiento del puente uso 1.920 muestras y el checkpoint liberado corresponde al paso 250.

## Requisitos de hardware

- Peso en disco y en memoria de los pesos: 18,33 GiB en total (15,41 GiB del tronco Q4_K_M, 1,54 GiB del proyector BF16 y 1,38 GiB del sidecar TTS).
- VRAM estimada para inferencia: no disponible como medicion publicada. A los 18,33 GiB de pesos hay que sumar KV cache, workspaces de grafo, asignaciones CUDA del runtime y el propio sistema operativo. El autor advierte explicitamente de que la comparacion de tamanos es de pesos residentes, no de pico de proceso.
- GPU recomendadas: A100 de 40 GB o 80 GB y H100 operarian con holgura para contexto largo. En RTX 4090 o RTX 3090 de 24 GB el conjunto entra muy justo y obliga a limitar la longitud de contexto.
- Consumer GPU: si cabe en tarjetas de 24 GB, con margen reducido. El autor menciona un objetivo de 32 GB tipo Jetson, pero senala que la afirmacion de funcionamiento sin desalojo en ese dispositivo requiere una ejecucion medida en produccion y no se infiere del tamano de los archivos.
- Opciones de despliegue: Ollama con la etiqueta `robit/qwen3.8-27b-e03-obliterated-omni-audio-bridge:q4km` cubre las rutas de lenguaje, vision de imagen nativa, herramientas y pensamiento. La comprension de audio y video y la salida de voz exigen el runtime `qwen-omni-adapters` (clonado del repositorio `robit-man/qwen-omni-adapters`). El sidecar TTS es un GGUF con namespace propio y no es un objetivo `FROM` valido de Ollama. No se confirma soporte en llama.cpp, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta release (audio-bridge) | 27 B en el tronco, puente de 6.558.720 y sidecar TTS de 1,7 B | No disponible | Audio (ASR), vision de imagen, TTS | `other` / `apache-2.0-components` | 3 GGUF, 18,33 GiB, requiere runtime externo |
| `cudabenchmarktest/Qwen3.8-27B-E03-Obliterated-Omni-GGUF` (repositorio hermano, router completo) | No disponible | No disponible | Audio, video, ASR, tool-use | Etiquetada como `apache-2.0` | GGUF en un unico archivo; el bundle Ollama completo ocupaba 52,45 GiB |
| `Qwen/Qwen3-Omni-30B-A3B-Instruct` | 30 B MoE, aproximadamente 3 B activos | No disponible | Texto, imagen, audio y video | No disponible | Safetensors |
| `Qwen/Qwen3.8-27B` | 27 B densos, atencion hibrida (16 de 64 capas con atencion completa) | No disponible | Texto segun la receta de vLLM | No disponible | Safetensors, con receta publicada en vLLM |

La diferencia principal frente al repositorio hermano es de tamano: 52,45 GiB frente a 18,33 GiB, con una reduccion del 65,1% en el conjunto de pesos residentes. El coste de esa reduccion es la dependencia de un runtime no estandar para las rutas de audio y voz.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes, publicado el 23 de septiembre de 2026 y actualizado ocho minutos despues. No hay validacion independiente de las puertas declaradas.
- Discrepancia de recuento de parametros: el metadato de safetensors indica 2.040.866.561 parametros, una cifra incompatible con los 27 B nominales del tronco y con el tamano del archivo Q4_K_M. Tratar cualquier calculo de recursos basado en ese metadato con cautela.
- No es un GGUF monolitico: son tres artefactos coordinados. Cargar solo el archivo de lenguaje no habilita audio ni voz.
- La comprension de audio y video y la sintesis de voz requieren el runtime `qwen-omni-adapters`. Ollama estandar no las cubre.
- El sidecar TTS es un contenedor GGUF con namespace propio, no un objetivo `FROM` valido de Ollama; hay que materializar sus vistas ejecutables con el runtime enlazado.
- Licencia compuesta (`apache-2.0-components`). Antes de redistribuir o desplegar en produccion hay que revisar los terminos de cada componente por separado; no equivale a una licencia Apache 2.0 unica.
- Calidad limitada del TTS con vocabulario poco frecuente: recall de palabras unicas de 0,7643, recall de palabras raras de 0,7287 y WER medio por lote de vocabulario de 0,2333, muy por encima del 0,0000 del test A -> B -> A.
- WER de habla de 0,0806 sobre 155 muestras: aceptable para muchas tareas, pero no es calidad de transcripcion de referencia.
- Ausencia total de benchmarks estandar (MMLU, HumanEval, GSM8K) y de datos de contexto maximo, idiomas o rendimiento en produccion.
- No hay informacion sobre sesgos, alineacion o seguridad del fine-tune comunitario `Obliterated` que actua como tronco de lenguaje.
- El Omni Thinker no esta incluido, por lo que la comprension de audio depende enteramente del puente entrenado.
- La afirmacion de funcionamiento sin desalojo en un Jetson de 32 GB no esta medida; el propio autor indica que no se puede inferir del tamano de los ficheros.
- Riesgo de alucinacion en las salidas no cubiertas por las puertas: las pruebas verifican la separacion entre evidencia de audio y procedencia visual, no la veracidad general del contenido generado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/cudabenchmarktest/Qwen3.8-27B-E03-Obliterated-Omni-Audio-Bridge-GGUF
- Repositorio hermano (router completo): https://huggingface.co/cudabenchmarktest/Qwen3.8-27B-E03-Obliterated-Omni-GGUF
- Runtime de adaptadores: https://github.com/robit-man/qwen-omni-adapters
- Modelo base del tronco de lenguaje: https://huggingface.co/manitcor/Qwen3.8-27B-Obliterated-E03
- Modelo base de audio y vision: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Modelo base de sintesis de voz: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio de la familia Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Receta de despliegue en vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Ficha indexada de terceros: https://essamamdani.com/ai-models/hf-cudabenchmarktest-qwen3-8-27b-e03-obliterated-omni-gguf
- Manifiesto de release con umbrales y digests: `release-manifest.json` dentro del repositorio de HuggingFace
