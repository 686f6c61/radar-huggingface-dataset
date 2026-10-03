# cavi-ai/Audio8-ASR-Infinite-MLX-4bit

## Resumen

Audio8-ASR-Infinite-MLX-4bit es una conversion cuantizada a 4 bits del modelo de reconocimiento automatico del habla (ASR) Edge0/Audio8-ASR-Infinite, adaptada para ejecutarse en Apple Silicon mediante el framework MLX. La conversion la firma cavi-ai (Sasan Sotoodehfar, CAVI AI) y no esta afiliada ni respaldada por Edge0, el desarrollador del modelo original. El problema que resuelve es doble: por un lado, permite ejecutar un ASR de streaming nativo en hardware de Apple sin GPU dedicada; por otro, reduce el peso de los pesos de 4.086.290.208 parametros a un fichero `model.safetensors` de 3,74 GB (3,48 GiB) mediante cuantizacion afin de 4 bits con group size 64.

El modelo base es un sistema de ASR en streaming con reloj de audio seleccionable (80/120/160 ms) y un retardo de transcripcion configurable entre 240 y 560 ms. Su rasgo distintivo es la capacidad de transcribir audio de duracion ilimitada sin degradacion acumulada, gracias a una ventana de decodificacion deslizante de 30 segundos y a una cache KV rodante que evita el crecimiento de memoria y latencia propio de los transformers de streaming convencionales. Soporta chino (zh) e ingles (en).

Es relevante ahora porque cubre un nicho poco servido: ASR de streaming de pesos abiertos, con licencia Apache-2.0 y ejecutable en portatiles Apple, algo que hasta hace poco exigia infraestructura CUDA y builds adaptados de vLLM. Esta version 4-bit esta pensada como alternativa ligera, a cambio de una penalizacion medible de WER de aproximadamente un punto porcentual absoluto respecto a los pesos bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR de streaming: torre de audio Voxtral Realtime + proyector multimodal + decoder de texto autorregresivo con cache KV rodante, cabezas VAD semanticas, embeddings de longitud de trama y MLPs `ada_rms_norm` |
| Parametros totales | 4.086.290.208 (aprox. 4,09 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de decodificacion deslizante de 30 s para audio largo; audio de duracion ilimitada mediante cache KV rodante. No se especifica una longitud de contexto en tokens |
| Tipos de cuantizacion | 4-bit afin (affine), group size 64, aplicada al decoder de texto (`language_model.*`, incluido el token embedding atado). Torre de audio Voxtral Realtime, proyector multimodal, embedding de longitud de trama, cabezas VAD semanticas y MLPs `ada_rms_norm` se mantienen en bf16 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Pesos y configuracion: Apache-2.0. Codigo en `audio8_asr_infinite/`: MIT |
| Formato de pesos | safetensors (MLX), 3,74 GB / 3,48 GiB |
| Reloj de audio | Seleccionable: 80 / 120 / 160 ms |
| Retardo de transcripcion | 240-560 ms (`transcription_delay_ms`, por defecto 480; multiplo positivo de 80) |
| Decodificacion | Greedy en streaming, un token de texto por paso de 80 ms |
| Modelo base | Edge0/Audio8-ASR-Infinite, revision `7476824bc222e4ad509d286e8cae8b8d3f371129` |
| Libreria | mlx (requiere `mlx-audio==0.5.7`) |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas de alineacion), por lo que esos datos deben considerarse no disponibles. Lo que si se documenta es la topologia de inferencia: el sistema combina una torre de audio Voxtral Realtime, un proyector multimodal, un decoder de texto y cabezas auxiliares. Entre estas ultimas figuran cabezas VAD semanticas (deteccion de actividad de voz), un embedding de longitud de trama que permite manejar entradas de duracion variable y MLPs con normalizacion `ada_rms_norm`. El decoder opera de forma autorregresiva con decodificacion greedy en streaming, emitiendo un token de texto por cada paso de 80 ms del reloj de audio.

El aspecto tecnico mas destacable es el mecanismo de streaming continuo: una ventana de decodificacion deslizante de 30 segundos combinada con una cache KV rodante permite transcribir audio indefinidamente sin que la memoria ni la latencia crezcan con la duracion, evitando el desfase (drift) que suele afectar a los transformers de streaming. El retardo de transcripcion es un parametro de diseno, no un artefacto: se puede fijar entre 240 y 560 ms, con 480 ms por defecto, en multiplos de 80 ms. La conversion a MLX aplica cuantizacion afin de 4 bits con group size 64 exclusivamente al decoder de texto, incluyendo el token embedding atado, y preserva en bf16 los componentes sensibles a la precision (torre de audio, proyector, cabezas VAD y MLPs). El autor verifico la fidelidad del port comparando el codigo MLX contra una referencia en PyTorch fp32 construida con clases de `transformers`: las transcripciones fueron identicas en 4 clips.

## Capacidades

- Reconocimiento automatico del habla en ingles y chino, con transcripcion en streaming.
- Streaming nativo con decodificacion greedy, un token de texto por paso de 80 ms.
- Reloj de audio configurable (80/120/160 ms) y retardo de transcripcion ajustable entre 240 y 560 ms (multiplos de 80).
- Audio de duracion ilimitada sin crecimiento de memoria ni de latencia, mediante ventana deslizante de 30 s y cache KV rodante.
- Deteccion de actividad de voz (VAD) semantica integrada, util para endpointing en pipelines de voz.
- Entrada de audio flexible: ruta a fichero o array mono a 16 kHz.
- Ejecucion local en Apple Silicon mediante MLX, sin GPU dedicada.
- Seleccion explicita de idioma por llamada (`language="en"` o `language="zh"`, parametro obligatorio).
- No dispone de tool calling, function calling, capacidades de vision ni modo de razonamiento explicito segun la informacion disponible.
- Capacidad multilingue limitada a los dos idiomas declarados; no se documenta traduccion ni transcripcion en otros idiomas.

## Casos de uso

- Subtitulado en directo: con un retardo de transcripcion configurable desde 240 ms y un reloj de 80 ms, el modelo puede alimentar subtitulos casi sincronos en retransmisiones en ingles o chino, ejecutandose en local sobre un Mac.
- Transcripcion de reuniones de larga duracion: la ventana deslizante de 30 s y la cache KV rodante permiten procesar sesiones de horas sin que la latencia crezca ni aparezca drift, algo critico para actas y resumenes posteriores.
- Analitica de llamadas de atencion al cliente: el VAD semantico integrado facilita segmentar turnos de habla y detectar silencios, lo que simplifica el troceado por intervencion antes de enviar el texto a un sistema de analitica.
- Asistentes de voz con privacidad estricta: al ejecutarse integramente en el dispositivo con MLX, el audio no sale del equipo, lo que encaja en entornos sanitarios, legales o corporativos con requisitos de cumplimiento.
- Accesibilidad: generacion de subtitulos en vivo para personas con discapacidad auditiva en ponencias o clases, con transcripcion bilingue zh/en sobre hardware de sobremesa.
- Pipelines de agentes de voz: combinado con un LLM y un motor de sintesis, el endpointing del VAD y el streaming de baja latencia permiten construir bucles conversacionales locales de ida y vuelta.
- Archivado y cumplimiento normativo: transcripcion por lotes de grabaciones (por ejemplo, 96 s de audio resueltos en 23,4 s en un M5 Max) para indexacion y busqueda posterior en repositorios documentales.
- Investigacion en ASR: al ser una conversion reproducible y con licencia Apache-2.0, sirve como banco de pruebas para medir el impacto de la cuantizacion 4-bit en calidad de transcripcion.

## Benchmarks y rendimiento

Hardware de medida: Apple M5 Max. Los unicos datos de rendimiento publicados corresponden a la comparacion entre esta conversion 4-bit y los pesos bf16 ejecutados con el mismo codigo MLX.

| Prueba | 4-bit (este repo) | Pesos bf16, mismo codigo MLX |
|---|---|---|
| LibriSpeech validation-clean, subconjunto `hf-internal-testing/librispeech_asr_dummy` (73 enunciados, 1.150 palabras), WER | 8,35 % | 7,30 % |
| Grabacion en ingles de 96 s, WER | 7,11 % (decodificada en 23,4 s) | no disponible |
| Grabacion en mandarin | transcripcion exacta | no disponible |
| Memoria pico, clip de 6 s | 4,2 GB | no disponible |

Notas de metodologia aportadas por el autor: el calculo de WER usa texto en mayusculas, elimina la puntuacion salvo apostrofos y no aplica normalizacion de numeros ni de ortografia; condiciones mas estrictas que las habituales, por lo que los valores no son directamente comparables con cifras de terceros. No se han publicado resultados de benchmarks comparativos con otros sistemas ASR (MMLU, HumanEval o GSM8K no aplican a un modelo de voz) en la informacion disponible. La paridad funcional del port se verifico contra una referencia PyTorch fp32 con transcripciones identicas en 4 clips.

## Requisitos de hardware

- Plataforma: Apple Silicon obligatorio (Mac con chip M-series). No hay soporte CUDA en esta conversion.
- VRAM/memoria unificada: 4,2 GB de pico medidos con un clip de 6 s en un M5 Max. El fichero de pesos ocupa 3,74 GB en disco, mas el overhead del runtime de MLX.
- GPU recomendadas: integradas de Apple Silicon (los datos publicados corresponden a un M5 Max). No se documentan resultados en M1, M2, M3 ni M4.
- Cabe en GPU de consumo: no aplica a GPUs NVIDIA o AMD; en el ecosistema Apple depende de la memoria unificada disponible, y el consumo medido sugiere que 8 GB de memoria unificada serian el minimo practico para clips cortos.
- Throughput medido: 96 s de audio decodificados en 23,4 s en un M5 Max, es decir, aproximadamente 4,1 veces mas rapido que tiempo real (factor derivado de los datos publicados).
- Despliegue: `mlx-audio==0.5.7` sobre Python 3.12. La arquitectura `audio8_asr_infinite` no viene incluida en esa version de mlx-audio, por lo que es necesario registrar el modulo manualmente con el fragmento de codigo que acompaña al repositorio. Para el modelo base, Edge0 ofrece un build adaptado de vLLM orientado a transcripcion continua.
- Latencia: el retardo de transcripcion es configurable entre 240 y 560 ms (por defecto 480 ms) y la granularidad del reloj de audio es de 80/120/160 ms.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta conversion con su propio modelo base y con la referencia en precision completa. No se han publicado en la documentacion facilitada especificaciones ni resultados de sistemas ASR alternativos, por lo que la comparacion con Whisper, Parakeet u otros queda como no disponible.

| Modelo | Parametros | Ventana / streaming | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Audio8-ASR-Infinite-MLX-4bit (este repo) | 4.086.290.208, cuantizados a 4 bits en el decoder de texto | Ventana deslizante de 30 s, audio ilimitado, streaming nativo | zh, en | Apache-2.0 (pesos), MIT (codigo del port) | safetensors MLX, 3,74 GB |
| Edge0/Audio8-ASR-Infinite (base, bf16) | Misma arquitectura; recuento de parametros del base no disponible en la informacion | Ventana deslizante de 30 s, audio ilimitado, streaming nativo | zh, en | Apache-2.0 | Pesos originales; formato no detallado en la informacion |
| Referencia PyTorch fp32 (construida con `transformers`) | No disponible | No disponible | zh, en | No disponible | PyTorch fp32 |
| Otros sistemas ASR (Whisper y similares) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo soporta chino e ingles. El parametro `language` es obligatorio y no hay deteccion automatica de idioma documentada.
- La cuantizacion a 4 bits degrada la calidad: el WER sube del 7,30 % al 8,35 % en el subconjunto LibriSpeech validation-clean, una penalizacion de 1,05 puntos porcentuales absolutos (aproximadamente un 14 % relativo).
- Las cifras de WER se obtuvieron con un protocolo estricto (mayusculas, sin puntuacion salvo apostrofos, sin normalizacion de numeros ni ortografia) y sobre un subconjunto pequeno de 73 enunciados y 1.150 palabras, por lo que la significacion estadistica es limitada.
- Los resultados de rendimiento proceden de un unico equipo (Apple M5 Max). No hay datos publicados para otros chips, y el comportamiento en maquinas con menos memoria unificada es desconocido.
- El port MLX no esta incluido en mlx-audio 0.5.7: requiere registrar el modulo manualmente, lo que anade fragilidad a la integracion en produccion y puede romper con futuras versiones de la libreria.
- La verificacion de paridad con la referencia PyTorch fp32 se hizo sobre 4 clips, una muestra reducida.
- El modelo base y el codigo del port tienen licencias distintas (Apache-2.0 para pesos y configuracion, MIT para el codigo), lo que exige revisar ambos ficheros de licencia antes de redistribuir.
- Conversion no afiliada ni respaldada por Edge0: no hay garantia de soporte, mantenimiento ni actualizaciones por parte del autor original.
- La transcripcion de audio ilimitado en despliegues de servidor depende del build adaptado de vLLM de Edge0, no de esta conversion MLX, que esta orientada a Apple Silicon.
- Riesgo de alucinacion en audio con ruido, solapamiento de voces o musica de fondo: no cuantificado en la informacion disponible.
- No se documentan sesgos especificos del modelo base ni sesgos introducidos por la cuantizacion.

## Enlaces

- Ficha de HuggingFace de este modelo: https://huggingface.co/cavi-ai/Audio8-ASR-Infinite-MLX-4bit
- Modelo base: https://huggingface.co/Edge0/Audio8-ASR-Infinite
- Repositorio upstream de Edge0: https://github.com/Edge0-AI/Audio8-ASR-Infinite
- README del repositorio upstream: https://github.com/Edge0-AI/Audio8-ASR-Infinite/blob/main/README.md
- Codigo fuente del port MLX: https://github.com/cavi-ai/mlx-agent
- Sitio del autor de la conversion (CAVI AI): https://cavi-ai.xyz
- Espejo del modelo base en HuggingFace: https://huggingface.co/FAISALFAZALHUSSAIN/Audio8-ASR-Infinite
- Articulo de referencia sobre el modelo base: https://www.mindstudio.ai/blog/audio8-asr-infinite-streaming-model
