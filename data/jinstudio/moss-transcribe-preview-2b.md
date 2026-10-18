# Jinstudio/MOSS-Transcribe-preview-2B

## Resumen

MOSS-Transcribe-preview-2B es un modelo de reconocimiento automatico del habla (ASR) en ingles desarrollado por el OpenMOSS Team. Combina un backbone de lenguaje Qwen3-1.7B-base con el encoder de audio de Qwen3-Omni-MoE, unidos mediante un adaptador gated-MLP que proyecta las caracteristicas acusticas al espacio de embeddings del modelo de lenguaje. El resultado es un sistema de transcripcion de aproximadamente 2.420 millones de parametros que se distribuye en un unico shard de safetensors en bfloat16 de unos 4,84 GB.

La relevancia del modelo esta en su estrategia de entrenamiento: parte de corpus publicos de ASR en ingles y se afina con aprendizaje por refuerzo sobre los splits de entrenamiento del Open ASR Leaderboard, lo que le permite declarar un WER medio de 4,87 % en el conjunto de evaluacion de dicho leaderboard (AMI, Earnings22, GigaSpeech, LibriSpeech, SPGISpeech y VoxPopuli, sin TED-LIUM). Para un modelo de 2,4B de parametros, compite en la franja de eficiencia frente a alternativas mucho mayores.

Es una version "preview": el repositorio consultado (Jinstudio/MOSS-Transcribe-preview-2B) figura con 0 descargas y 0 likes, mientras que la model card referencia el repositorio original OpenMOSS-Team/MOSS-Transcribe-preview-2B. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales, y requiere `trust_remote_code=True` por el codigo de procesamiento personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio (Qwen3-Omni-MoE) + adaptador gated-MLP + decoder de lenguaje Qwen3-1.7B-base |
| Parametros totales | 2.418.833.792 (~2,42B), dato real de safetensors |
| Parametros activos | No aplica: el modelo no es MoE a nivel global; el componente MoE esta en el encoder de audio, cuyo numero de parametros activos no esta disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Solo se distribuye bfloat16 (safetensors); no se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Ingles (`en`) exclusivamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, un unico shard de ~4,84 GB) |
| Backbone de lenguaje | Qwen3-1.7B-base, 28 capas, hidden size 2048 |
| Encoder de audio | Qwen3-Omni-MoE audio encoder |
| Adaptador | Gated-MLP, hidden size 8192 |
| Frecuencia de muestreo | 16 kHz |
| Frontend de audio | Whisper log-mel, 128 bins, FFT 400, hop length 160 |
| Libreria | transformers (requiere `trust_remote_code=True`) |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-adaptador-decoder. El encoder de audio, tomado de Qwen3-Omni-MoE, procesa caracteristicas log-mel estilo Whisper (128 bins, FFT de 400, hop de 160 sobre audio a 16 kHz). Un adaptador gated-MLP con hidden size de 8192 proyecta esas representaciones acusticas al espacio de embeddings de un decoder Qwen3-1.7B-base de 28 capas y hidden size 2048. El resultado se genera de forma autorregresiva como tokens de texto, con decodificacion greedy (`num_beams=1`, `max_new_tokens=512`) y una unica plantilla de chat independiente del dataset, segun la model card.

El entrenamiento combina dos fases: preentrenamiento o ajuste supervisado sobre corpus publicos de ASR en ingles (LibriSpeech, GigaSpeech, Common Voice 17, VoxPopuli, AMI, Earnings22 y SPGISpeech) y un afinado posterior con aprendizaje por refuerzo sobre los splits de entrenamiento del Open ASR Leaderboard. La model card no detalla el volumen de tokens, la composicion exacta del dataset ni el algoritmo de RL empleado (por ejemplo, GRPO o PPO), por lo que esos datos no estan disponibles.

Un detalle relevante de implementacion es que el procesador es codigo dinamico del repositorio (`processing_Moss.MossProcessor`, `MelConfig`) y admite un flag `enable_time_marker`, desactivado en la configuracion de ejemplo, que no genera marcas temporales por defecto.

## Capacidades

- Transcripcion de voz a texto en ingles con salida de texto plano, sin puntuacion ni diarizacion garantizadas por la model card.
- Procesamiento de audio a 16 kHz con frontend log-mel de 128 bins integrado en el procesador.
- Generacion autorregresiva con cache (`use_cache=True`) y limite configurable de tokens nuevos (512 en la configuracion de referencia).
- Integracion nativa con `transformers` mediante `AutoModelForCausalLM`, `AutoTokenizer` y clases de procesamiento cargadas dinamicamente.
- No soporta tool calling ni function calling: es un modelo especializado en ASR, no un asistente conversacional.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision ni audio como salida (no es un modelo omni-modal, pese a reutilizar el encoder de Qwen3-Omni-MoE).
- No soporta traduccion ni transcripcion multilingue: solo ingles.
- No se documenta modo "thinking" ni capacidades de instruccion general.

## Casos de uso

- Transcripcion de reuniones corporativas en ingles: el modelo esta evaluado en AMI (WER 8,37 %), un corpus de reuniones multi-sala con solapamiento de hablantes, por lo que es directamente aplicable a actas automaticas de reuniones, con revision humana posterior.
- Subtitulado de contenido audiovisual en ingles: con WER de 1,21 % en LibriSpeech test.clean y 1,63 % en SPGISpeech, es adecuado para generar subtitulos de audio limpio de locucion o estudios, no tanto para audio de campo.
- Analisis de llamadas de atencion al cliente: el modelo puede transcribir grabaciones de centros de contacto con acentos variados, aunque la model card advierte de degradation con acentos fuertes y ruido; conviene validar sobre una muestra propia antes de desplegar.
- Transcripcion de discursos parlamentarios e institucionales: VoxPopuli (WER 5,39 %) cubre este dominio, lo que lo hace util para indexar y buscar intervenciones publicas en ingles.
- Generacion de actas de earnings calls: evaluado en Earnings22 con WER de 7,84 %, orientado a transcripcion de llamadas financieras con terminologia especifica y multiples participantes.
- Pipeline de datos para entrenamiento de modelos: al ser Apache-2.0 y ocupar solo 4,84 GB en bfloat16, puede usarse para pseudo-etiquetar grandes volumenes de audio en ingles en GPUs de gama media.
- Prototipado e investigacion en ASR: sirve como baseline reproducible en el Open ASR Leaderboard y como punto de partida para estudiar el efecto del RL sobre un decoder Qwen3 pequeno.
- Transcripcion on-premise con requisitos de privacidad: al caber en una GPU de consumo, permite procesar audio sensible sin enviarlo a APIs externas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre los test sets del Open ASR Leaderboard con decodificacion greedy, plantilla de chat unica y normalizador estandar del leaderboard (normalizador ingles + distancia de edicion a nivel de palabra con fusion de compuestos). TED-LIUM no forma parte de la ejecucion.

| Dataset | WER (%) |
|---|---|
| AMI | 8,37 |
| Earnings22 | 7,84 |
| GigaSpeech | 6,78 |
| LibriSpeech test.clean | 1,21 |
| LibriSpeech test.other | 2,84 |
| SPGISpeech | 1,63 |
| VoxPopuli | 5,39 |
| **Media** | **4,87** |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, algo esperable en un modelo especializado en ASR.

## Requisitos de hardware

- Pesos en bfloat16: ~4,84 GB, segun el tamano del shard safetensors del repositorio.
- VRAM estimada para inferencia: aproximadamente 6-8 GB con margen para activaciones y cache, dependiendo de la duracion del audio y de `max_new_tokens`. Dato estimado a partir del tamano de pesos; no publicado por el autor.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En 8 GB el margen es ajustado si se procesan audios largos.
- GPU de datacenter recomendadas: A100 40/80 GB, H100, L40S, A10G; sobredimensionadas para un modelo de 2,4B, pero utiles para alto throughput con batching.
- Despliegue: `transformers` con `trust_remote_code=True` es la via documentada. No se han publicado instrucciones ni artefactos para vLLM, TGI, llama.cpp, Ollama ni LM Studio, y al no existir versiones GGUF no es posible ejecutarlo en CPU con esas herramientas sin conversion propia. El codigo dinamico del procesador complica su integracion en servidores de inferencia estandar.
- Latencia y throughput: no disponibles. La model card no reporta tiempos de inferencia ni RTF (real-time factor).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | WER medio (Open ASR Leaderboard) |
|---|---|---|---|---|---|
| MOSS-Transcribe-preview-2B | ~2,42B | Ingles | Apache-2.0 | safetensors (bf16) | 4,87 (declarado por el autor) |
| OpenAI Whisper large-v3 | ~1,55B | Multilingue | MIT | safetensors, GGUF (comunitario) | No disponible en la informacion proporcionada |
| OpenAI Whisper large-v3-turbo | ~0,81B | Multilingue | MIT | safetensors, GGUF (comunitario) | No disponible en la informacion proporcionada |
| NVIDIA Parakeet-TDT-0.6B-v2 | ~0,6B | Ingles | CC-BY-4.0 | .nemo, safetensors | No disponible en la informacion proporcionada |

Nota: los datos de parametros, idioma y licencia de los modelos alternativos son de conocimiento general; los valores de WER no se incluyen porque no forman parte de la informacion proporcionada y no deben compararse de forma directa sin verificar la misma ejecucion del leaderboard. Frente a Whisper, la ventaja de MOSS-Transcribe es la licencia Apache-2.0 combinada con un decodificador de lenguaje moderno (Qwen3) y un WER declarado bajo en dominios especificos (LibriSpeech clean 1,21 %, SPGISpeech 1,63 %); su desventaja es el monolingueismo y la ausencia de ecosistema de cuantizaciones.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: el rendimiento en otros idiomas no esta soportado y degradara de forma significativa, segun la propia model card.
- Rendimiento degradado en acentos fuertes, grabaciones ruidosas, hablantes solapados, audio de campo lejano y terminologia de dominio especifico, tal y como advierte el autor.
- Riesgo de alucinacion: como todo decoder autorregresivo aplicado a ASR, puede generar texto plausible en segmentos de silencio, ruido o audio ininteligible. Requiere revision manual en entornos de alto riesgo (sanitario, legal, financiero).
- Sin marcas temporales por defecto (`enable_time_marker=False` en la configuracion de ejemplo), lo que limita la generacion de subtitulos sincronizados sin trabajo adicional.
- Codigo personalizado obligatorio (`trust_remote_code=True`) y clases cargadas dinamicamente; esto implica riesgos de seguridad al ejecutar codigo del repositorio y complica el despliegue en entornos con sandboxing estricto.
- Version "preview" con 0 descargas y 0 likes en el repositorio consultado; no hay garantia de mantenimiento ni de correccion de errores.
- Discrepancia de identificador: el repositorio analizado es Jinstudio/MOSS-Transcribe-preview-2B, mientras que la model card apunta a OpenMOSS-Team/MOSS-Transcribe-preview-2B. Conviene verificar cual es el repositorio canonico antes de fijar una version en produccion.
- Benchmarks no verificados (`verified: false` en el model-index): los WER son declaraciones del autor, no resultados auditados por el leaderboard.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con atribucion; no impone restricciones de uso, pero tampoco ofrece garantias.
- No hay soporte documentado para cuantizacion, lo que limita el despliegue en CPU o en GPUs con menos de 8 GB.

## Enlaces

- HuggingFace (repositorio consultado): https://huggingface.co/Jinstudio/MOSS-Transcribe-preview-2B
- HuggingFace (repositorio original referenciado en la model card): https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-preview-2B
- Open ASR Leaderboard (space): https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Blog de OpenMOSS: https://mosi.cn/#models
- Twitter/X de OpenMOSS: https://x.com/Open_MOSS
- Discord de OpenMOSS: https://discord.gg/fvm5TaWjU3
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a foros no relacionados (electroda.pl) y se descartan.
