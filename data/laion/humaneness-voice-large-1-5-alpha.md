# laion/Humaneness-Voice-Large-1.5-Alpha

## Resumen

Humaneness Voice Large 1.5 Alpha es un modelo de síntesis de voz (text-to-speech) expresivo y multilingüe desarrollado por LAION, publicado como adaptador sobre la familia MOSS Local Transformer. La versión 1.5 es una continuación de refuerzo (RL) cuyo objetivo declarado es un 20 % de disfrute del contenido, un 40 % de coincidencia emocional y un 40 % de genuinidad, y se presenta como el checkpoint preferido por el autor para escuchar, con un equilibrio entre naturalidad y disfrute. Parte de los pesos SFT de Large 1.3 Alpha (revisión `f4cee303eb362af4cf3d205e9fe0198288564398`) y ya incorpora la fase RL de la versión 1.4.

El modelo combina un transformer semántico de la familia Qwen3 (36 capas, dimensión oculta 2.560, 32 cabezas de atención y 8 cabezas clave/valor) con un "Talker" local de una sola capa. Por cada trama de 80 ms, el transformer semántico aporta contexto y el Talker predice 12 índices de códec de un vocabulario de 1.024, lo que equivale a 150 índices por segundo. Un códec externo (MOSS Audio Tokenizer v2) convierte esos índices en audio mono a 48 kHz. El total de parámetros base es de 4.129.990.144.

Es relevante ahora porque propone un pipeline completo y reproducible —pesos base sin fusionar, adaptador LoRA acumulativo, script de inferencia, entrenador de continuación, recompensas, configuración y estadísticas de las 2.000 iteraciones del optimizador— en lugar de un checkpoint opaco, y porque publica una página de comparación a ciegas con 70 casos por modelo en cinco idiomas, con y sin referencia de hablante. Sigue siendo una release "Alpha" con licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MOSS Local Transformer: transformer semantico familia Qwen3 (36 capas) + Talker local de 1 capa; sintesis de codigos de codec a 12 indices por trama de 80 ms |
| Parametros totales | 4.129.990.144 (4.022.468.096 en el transformer semantico + 107.522.048 en el Talker local) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible. La generacion se controla en tramas de 80 ms; el ejemplo de la model card usa `max_frames=240` (aproximadamente 19,2 s de audio) |
| Tipos de cuantizacion | No se publican cuantizaciones (sin GGUF, AWQ ni GPTQ). El checkpoint se ejecuta en BF16 y el adaptador residual en FP32 |
| Idiomas soportados | Ingles, aleman, frances, neerlandes y espanol (en, de, fr, nl, es) |
| Licencia | CC-BY-4.0 (el codec MOSS externo conserva sus propios terminos) |
| Formato de pesos | safetensors para el modelo base; adaptador propio FP32 con tensores `a`/`b` (no formato PEFT), rank = alpha = 128, escala residual = 1; 292 tensores y 96.337.920 escalares entrenables |
| Tamano del repositorio | 8,7 GB |
| Vocabulario del codec | 1.024 entradas por codec; se usan los 12 primeros codebooks de los 32 del codec completo |
| Frecuencia de audio de salida | 48 kHz mono (via MOSS Audio Tokenizer v2) |
| Software probado | Python 3.13, PyTorch 2.9.1 con CUDA 12.8, Transformers 5.14.1, Accelerate 1.14.0, GPUs GH200 |

## Arquitectura y entrenamiento

La arquitectura es un modelo generativo de audio en dos etapas. Un transformer semantico de la familia Qwen3 (36 capas, hidden size 2.560, 32 cabezas de atencion con 8 cabezas clave/valor, es decir, atencion con cabezas KV compartidas) procesa el texto y las indicaciones de estilo, y un Talker local de una capa con la misma dimension oculta predice, para cada trama de 80 ms, 12 indices de codec independientes de un vocabulario de 1.024. Eso produce 12,5 tramas por segundo y 150 indices por segundo. El checkpoint actual emplea solo los 12 primeros codebooks de los 32 del codec, que se decodifican a audio mono de 48 kHz mediante el MOSS Audio Tokenizer v2 descargado aparte.

El entrenamiento publicado en este repositorio es la fase de continuacion por refuerzo sobre los pesos SFT de Large 1.3 Alpha, con una funcion objetivo numerica y recompensas que ponderan 20 % disfrute del contenido, 40 % coincidencia emocional y 40 % genuinidad. Se documentan las 2.000 iteraciones del optimizador y las curvas por grupo en `stats/`. El adaptador final es un LoRA cumulativo de rango 128 que contiene tanto la fase 1.4 como la 1.5, y que modifica las proyecciones semanticas q/k/v/o y las proyecciones de atencion del Talker local `c_attn`/`c_proj`. En despliegue el modelo base corre en BF16 mientras la multiplicacion residual del adaptador se mantiene en FP32. El autor advierte explicitamente de que no hay que apilar el adaptador 1.4 ni cargar el 1.5 sobre una base con 1.4 ya fusionada, y de que no se usa ningun sustituto de pesos fusionados redondeados. El SHA-256 del adaptador final es `7f376cf9b9605f8ae8d27a8ebe521f17459d91bbfabfcf3d883f9381b5d67549`, y todos los ficheros publicados tienen checksums y tamanos en `MANIFEST.json`.

## Capacidades

- Sintesis de voz expresiva en ingles, aleman, frances, neerlandes y espanol, con audio de salida a 48 kHz.
- Control de interpretacion mediante un campo de direccion separado del texto hablado: el prompt `GENERAL` describe el tono global y el bloque `SCRIPT` admite duraciones por frase (por ejemplo `[4.0 seconds duration]`), pausas, relieves y vocalizaciones no verbales.
- Condicionamiento opcional por audio de referencia de hablante (`--reference-wav`) para aproximar el timbre de una voz; el autor indica que la conservacion exacta de la identidad no esta garantizada.
- Generacion determinista por semilla (`seed`), lo que permite reproducir una misma locucion en pruebas A/B.
- Control de la duracion de generacion en tramas (`frames`, `max_frames`), con 80 ms por trama.
- No incluye tool calling, function calling, capacidades de agente, vision ni audio de entrada como ASR; es exclusivamente text-to-speech.
- No se documentan modos de razonamiento ni "thinking mode".
- Incluye un entrenador de continuacion portable y las recompensas, lo que permite reproducir o extender la fase RL con datos propios.

## Casos de uso

- **Audiolibros y narracion larga**: el control por duraciones a nivel de frase permite ajustar el ritmo de cada linea del guion y mantener una direccion emocional coherente entre parrafos, algo util cuando se narran capitulos completos con un unico prompt `GENERAL`.
- **Doblaje y localizacion a cinco idiomas**: al cubrir en, de, fr, nl y es con el mismo checkpoint, un estudio puede generar una primera version de voces para una serie o un curso y sustituir solo las pistas que lo necesiten, reduciendo el numero de modelos que mantener en produccion.
- **Voces de personajes en videojuegos**: el campo de direccion admite vocalizaciones y estados de animo ("quiet relief", "brighter gratitude"), lo que encaja con lineas de guion de NPC que necesitan variacion emocional sin grabar cada variante.
- **Locucion publicitaria y contenido de marca**: combinado con semillas fijas y un audio de referencia limpio de 5,04 a 14,96 segundos, permite generar variantes de un mismo mensaje con diferentes enfasis y elegir la mejor en una escucha comparativa.
- **Accesibilidad y lectura de pantalla**: la salida a 48 kHz y el control de pausas por frase son adecuados para leer documentos largos con estructura (listas, incisos) en lugar de una voz monotona plana.
- **Prototipado rapido de asistentes de voz**: antes de contratar grabaciones definitivas, un equipo puede validar guiones de bienvenida, respuestas de error y mensajes de confirmacion en varios idiomas y con distintas voces de referencia.
- **Investigacion en RL aplicado al habla**: el repositorio incluye recompensas, objetivo numerico, configuracion y las 2.000 iteraciones del optimizador, por lo que sirve como banco de pruebas reproducible para estudiar como una ponderacion 20/40/40 afecta a naturalidad frente a fidelidad de contenido.
- **Generacion de datos sinteticos para ASR**: al poder variar emoción, duracion y voz de referencia, se puede aumentar un corpus de entrenamiento de reconocimiento de voz con habla controlada y transcrita.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados emparejados sobre 70 casos por modelo, pero en la informacion disponible solo aparece la primera fila:

| Modelo | Content Enjoyment (alta mejor) | Genuineness (alta mejor) | WER medio por clip (baja mejor) | MSE emocional aproximado (baja mejor) |
|---|---:|---:|---:|---:|
| SFT 1.2 | 6,235 | 4,244 | 1,133 % | 1,838 |

No se han publicado en la informacion disponible las filas correspondientes a 1.3, 1.4 y 1.5, ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks de texto, que no aplican a un modelo de sintesis de voz. La comparacion completa esta en la pagina de escucha enlazada por el autor, que contiene los 70 casos generados por modelo en los cinco idiomas, con y sin referencia de hablante, y en la que la columna 20/40/40 corresponde exactamente al adaptador 1.5 publicado aqui.

## Requisitos de hardware

- **VRAM estimada para inferencia**: alrededor de 8,3 GB solo para los pesos base en BF16 (4,13 mil millones de parametros) mas unos 0,39 GB del adaptador en FP32, es decir, en torno a 8,7 GB en reposo; con cache KV y activaciones, un presupuesto practico de 12-16 GB en BF16. Estimacion propia a partir del recuento de parametros, no un dato publicado. Hay que anadir la memoria del codec MOSS Audio Tokenizer v2, cuyo consumo no se detalla en la informacion disponible.
- **GPU recomendadas**: el autor reporta pruebas en GH200. Por tamano, una A100 40/80 GB, H100 o L40S van sobradas; el modelo no necesita tensor parallelism para caber en una sola GPU.
- **GPU de consumo**: cabe en RTX 4090 y RTX 3090 (24 GB) con margen, y previsiblemente en tarjetas de 16 GB como RTX 4080 o 4070 Ti Super; en 12 GB el margen es muy ajustado y depende del codec y de la longitud de generacion.
- **Opciones de despliegue**: el camino soportado es el runtime propio incluido (`infer.py`) con `trust_remote_code=True`, PyTorch 2.9.1 + CUDA 12.8, Transformers 5.14.1 y Accelerate 1.14.0. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni llama-cpp-python, y el adaptador no es formato PEFT, por lo que `PeftModel.from_pretrained` no es una via valida.
- **Latencia y throughput**: no disponibles. El unico dato objetivo es que cada trama generada cubre 80 ms de audio (12,5 tramas por segundo de audio) y que el ejemplo produce 7 segundos de audio con `max_frames=240` como techo.
- **Almacenamiento**: 8,7 GB para el repositorio (base duplicada, adaptador, entrenador y estadisticas) mas la descarga aparte del codec externo.

## Comparativa con modelos similares

No se dispone de especificaciones verificadas de terceros en la informacion proporcionada, por lo que la comparacion se limita a los checkpoints de la propia familia, que comparten arquitectura y licencia:

| Modelo | Relacion | Parametros base | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Humaneness Voice Large 1.5 Alpha | Este modelo | 4.129.990.144 | No disponible | CC-BY-4.0 | Adaptador cumulativo 1.4 + 1.5, rank 128; checkpoint preferido por el autor |
| Humaneness Voice Large 1.3 Alpha | Base SFT | 4.129.990.144 (misma arquitectura) | No disponible | CC-BY-4.0 | Pesos SFT sin RL; el adaptador 1.5 se aplica sobre esta base |
| Humane Voice Large Alpha 1.4 | Fase RL anterior | Misma base | No disponible | No disponible en la informacion proporcionada | Ya incluida en el adaptador 1.5; no debe apilarse |
| SFT 1.2 | Checkpoint anterior | No disponible | No disponible | No disponible | Unica fila con metricas publicadas en la informacion disponible (WER 1,133 %) |

Frente a alternativas de otros autores (XTTS, Bark, Parler-TTS, Orpheus u otras familias TTS), no hay datos de benchmarks, contexto ni licencia en la informacion disponible, por lo que no se ofrece comparacion numerica.

## Limitaciones y advertencias

- **Estado Alpha**: es una release temprana con 0 descargas y 0 "likes" en el momento de la consulta; no hay validacion independiente de la comunidad.
- **Identidad de voz no garantizada**: el propio autor avisa de que una buena referencia ayuda, pero la conservacion exacta de la identidad no esta asegurada. Las referencias deben ser locucion limpia de un solo hablante, sin musica ni silencios largos, de 5,04 a 14,96 segundos; las grabaciones mas largas se recortan a 14,96 s antes de codificar.
- **Riesgo de uso indebido de clonacion**: la condicionacion por voz de referencia permite imitar hablantes; en produccion conviene exigir consentimiento explicito y trazabilidad de las referencias.
- **Techo de calidad del codec**: solo se generan 12 de los 32 codebooks del codec completo, lo que limita la fidelidad maxima alcanzable frente a sistemas que usan el codec entero.
- **Cobertura linguistica cerrada**: cinco idiomas (en, de, fr, nl, es). No hay soporte declarado de catalan, gallego, euskera, portugues, italiano ni de otras lenguas, y el comportamiento fuera de esos idiomas no esta documentado.
- **Riesgo de alucinacion acustica**: como modelo generativo, puede insertar vocalizaciones, pausas o alargamientos no pedidos, y el texto hablado puede desviarse de la entrada, especialmente con prompts de direccion mal formateados o mezclados con el texto literal. El autor dedica una seccion a los errores de formato mas comunes.
- **Metricas incompletas**: no se publican WER ni MSE emocional del checkpoint 1.5 en la informacion disponible; solo del SFT 1.2.
- **Complejidad de integracion**: requiere `trust_remote_code=True` y un codec descargado aparte, sin soporte de runtimes estandar como vLLM o llama.cpp, lo que complica el despliegue en infraestructura ya existente.
- **Errores de apilado del adaptador**: cargar el adaptador 1.5 sobre una base con 1.4 fusionada, o apilar el adaptador 1.4, produce un modelo incorrecto. El adaptador es un formato propio `a`/`b` en FP32 y no PEFT.
- **Licencia CC-BY-4.0**: permite uso comercial con atribucion. El codec MOSS Audio Tokenizer v2 se descarga por separado y conserva sus propios terminos, que hay que revisar antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/Humaneness-Voice-Large-1.5-Alpha
- Modelo base (SFT 1.3 Alpha): https://huggingface.co/laion/Humaneness-Voice-Large-1.3-Alpha
- Fase RL anterior (1.4): https://huggingface.co/laion/Humane-Voice-Large-Alpha-1.4
- Codec externo MOSS Audio Tokenizer v2: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- Pagina de comparacion con escucha de los 70 casos por modelo: https://laion-humaneness-voice-large-alpha-comparisons.static.hf.space/
- Guia de prompting incluida en el repo: `PROMPTING.md`
- Manifiesto de checksums y tamanos: `MANIFEST.json`
- Resultados agregados y curvas de las 2.000 iteraciones: directorio `stats/`
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada. La busqueda web realizada no devolvio resultados pertinentes al modelo.
