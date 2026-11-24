# davitlive5/sonabo-v2

## Resumen

sonabo-v2 es un modelo de síntesis de voz (text-to-speech) para armenio oriental, desarrollado por Davit Ghazaryan (usuario `davitlive5`) como parte de un esfuerzo open source por dotar a este idioma de infraestructura de voz. Se trata de un fine-tune del modelo base Qwen/Qwen3-TTS-12Hz-0.6B-Base, que originalmente no soporta armenio; este ajuste le permite leer texto armenio con una tasa de error de palabra (WER) de aproximadamente el 5 % en una prueba de ida y vuelta con ASR, además de clonar voces y emitir audio en streaming.

El modelo combina un "talker" de 0,6B parámetros con un tokenizador/codec de voz de 12,5 Hz, produce audio mono a 24 kHz y acepta referencias de voz de entre 3 y 30 segundos mediante embeddings de hablante (x-vector). Su relevancia actual radica en que cubre un idioma con muy poca representación en el ecosistema TTS y, al mismo tiempo, conserva parte del rendimiento del modelo base en inglés y ruso, lo que permite atender a hablantes de las tres lenguas con un único modelo.

La versión v2 corrige el principal defecto de sonabo-v1, que había degradado gravemente el ruso y parcialmente el inglés. Con licencia Apache-2.0 y un tamaño de repositorio de 2,5 GB, está pensado tanto para prototipado en una sola GPU como para despliegue en producción con vLLM-Omni.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (talker transformer + codec/tokenizador de voz a 12,5 Hz) |
| Parametros totales | 914.643.008 (0,6B talker + codec) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor recomienda bfloat16) |
| Idiomas soportados | armenio oriental (hy-AM); lectura adicional de ingles y ruso |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Otros datos tecnicos: salida de audio mono a 24 kHz, clonacion de voz por x-vector a partir de 3-30 s de audio de referencia, streaming disponible mediante vLLM-Omni o la API de streaming de `qwen-tts`, y libreria `qwen-tts`.

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen3-TTS-12Hz-0.6B-Base, que emplea una arquitectura de dos componentes: un "talker" de 0,6B parametros que genera tokens de voz y un codec/tokenizador de habla con frecuencia de 12,5 Hz que convierte esos tokens en forma de onda de audio a 24 kHz. La adaptacion al armenio se realizo sobre el modelo base, que no soportaba este idioma, y se complementa con un modulo de normalizacion de texto (`hy_norm`) que convierte digitos, fechas, horas y abreviaturas en palabras antes de la sintesis.

La model card no detalla el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. Si se documentan decisiones de inferencia criticas: el modo `non_streaming_mode=True` (texto completo por delante, audio aun en streaming) es obligatorio porque el armenio consume aproximadamente un token BPE por caracter y, en modo de texto en streaming, el texto se queda atras respecto al audio y el WER sube hasta el 50 %; la clonacion por x-vector (`x_vector_only_mode=True`) supera claramente a la clonacion en contexto con transcripcion (WER de ~12 % en ese segundo caso). El despliegue recomendado usa vLLM-Omni con un `codec_chunk_ramp: [4, 6, 10, 16, 25]` que envia el primer audio tras 4 tramas de codec en lugar de 25, eliminando un silencio inicial de unos 230 ms.

## Capacidades

- Sintesis de voz en armenio oriental con inteligibilidad alta (WER ~5 % en prueba ASR de ida y vuelta).
- Clonacion de voz zero-shot a partir de 3-30 s de audio de un unico hablante, sin necesidad de transcripcion (x-vector).
- Streaming de audio con latencia baja (unos 30 ms hasta el primer audio jugable en configuracion de un solo stream).
- Lectura de texto en ingles y ruso ademas del armenio, con calidad recuperada respecto a v1.
- Normalizacion de texto integrada para numeros, fechas, horas y abreviaturas (`hy_norm.normalize`).
- Manejo de textos largos mediante division en frases (script `inference.py` de referencia).
- Salida de audio PCM16 LE mono a 24 kHz, adecuada para integracion en pipelines de telefonia y asistentes.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Atencion al cliente telefonica en armenio: el modelo puede generar respuestas habladas en tiempo real con un factor de tiempo real de 0,14 por stream en una RTX 5070, lo que permite mantener conversaciones fluidas con varios llamantes simultaneos.
- Sistemas de anuncios y megafonia: la normalizacion de numeros, fechas y horas hace que el modelo sea adecuado para leer turnos, importes o avisos con cifras sin errores de pronunciacion.
- Audiolibros y contenido editorial en armenio: la clonacion de voz permite narrar textos largos con una voz consistente a partir de una grabacion breve, dividiendo el texto en frases.
- Asistentes de voz multilingues: al conservar ingles y ruso, un mismo despliegue puede atender a usuarios que alternan idiomas, con WER de 3,75 en ingles y 23,60 en ruso en la prueba del autor.
- Accesibilidad y lectura de pantalla: sintesis de contenido web o de documentos en armenio con salida en streaming, util para usuarios con discapacidad visual.
- Doblaje y localizacion de contenido audiovisual: clonacion de la voz del actor original a partir de una muestra y generacion de pistas de audio en armenio para videos o cursos.
- Prototipado e investigacion en tecnologias del habla armenias: al ser Apache-2.0 y ejecutable en CPU (mas lento que tiempo real) o en una GPU de 6 GB, sirve como base para experimentos academicos y para complementar los modelos ASR Lapillus del mismo autor.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). Conjunto de evaluacion: 112 frases por voz (habla leida, dominios mixtos, no vistas en entrenamiento) mas 20 frases con numeros, fechas y horas. La inteligibilidad se mide transcribiendo el audio generado con el ASR Lapillus-v2 y calculando WER contra el texto de entrada; la naturalidad con UTMOS (1-5) y la similitud de voz con similitud coseno de embeddings de hablante basados en WavLM.

| Voz | WER ↓ | CER ↓ | UTMOS ↑ | Similitud de hablante ↑ |
|---|---|---|---|---|
| Voz femenina | 4,91 | 1,10 | 3,71 | 0,847 |
| Voz masculina | 4,27 | 1,00 | 4,09 | 0,855 |
| Conjunto numeros/fechas (femenina) | 5,00 | 1,95 | no disponible | no disponible |

Otros idiomas (WER en prueba ASR de ida y vuelta, menor es mejor):

| Modelo | Ingles | Ruso |
|---|---|---|
| Qwen3-TTS-12Hz-0.6B-Base (sin armenio) | 3,12 | 16,85 |
| sonabo-v1 | 6,25 | 55,62 |
| sonabo-v2 | 3,75 | 23,60 |

Velocidad de servicio (medida con sonabo-v1, misma arquitectura; RTX 5070 de 12 GB, vLLM-Omni 0.32, PCM en streaming):

| Streams concurrentes | Primer audio jugable (mediana / peor caso) | Factor de tiempo real por stream |
|---|---|---|
| 1 | 30 / 35 ms | 0,14 |
| 8 | 70 / 154 ms | 0,26 |
| 16 | 144 / 405 ms | 0,41 |
| 32 | 476 / 826 ms | 0,68 |

Ajustes de evaluacion: prompt de voz x-vector, `non_streaming_mode=True`, temperatura 0,9. El autor advierte de que parte del WER restante proviene del propio modelo ASR.

## Requisitos de hardware

- VRAM estimada: 6 GB o mas recomendados para inferencia en una GPU; el modelo tambien funciona en CPU, pero mas lento que tiempo real.
- GPU recomendadas: RTX 5070 de 12 GB (mediciones del autor), y por tamano del modelo cualquier GPU consumer con 8 GB o mas deberia ser suficiente; no se publican mediciones en A100 ni H100.
- Cabe en GPU consumer: si, con al menos 6-8 GB de VRAM; ejecucion en CPU posible con latencia superior al tiempo real.
- Despliegue: vLLM-Omni 0.32 (recomendado para produccion, con `vllm serve ... --omni` y el fichero `vllm/qwen3_tts_hy.yaml`), o la libreria `qwen-tts` en Python con `device_map="cuda:0"` y `dtype=torch.bfloat16`.
- Latencia y throughput: 30 ms de mediana hasta el primer audio con 1 stream y factor de tiempo real de 0,14; con 32 streams concurrentes, 476 ms de mediana y factor de 0,68 por stream (medido en RTX 5070 con vLLM-Omni 0.32).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| sonabo-v2 | 0,6B (talker) + codec 12,5 Hz | Armenio oriental, ingles, ruso | Apache-2.0 | Fine-tune con clonacion de voz y streaming; WER armenio ~4,3-4,9 |
| Qwen3-TTS-12Hz-0.6B-Base | 0,6B (talker) + codec 12,5 Hz | No soporta armenio; WER 3,12 en ingles y 16,85 en ruso | Apache-2.0 (heredada del modelo base) | Modelo de partida; no util para armenio |
| sonabo-v1 | 0,6B (talker) + codec 12,5 Hz | Armenio, ingles, ruso | Apache-2.0 | Version anterior; ruso muy degradado (WER 55,62) |

No se dispone de comparaciones con otros modelos TTS multilingues en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo esta entrenado para armenio oriental; el armenio occidental no esta cubierto.
- El ingles y el ruso se conservan parcialmente: el ruso presenta un WER de 23,60, claramente peor que el modelo base (16,85).
- Riesgo de alucinacion y errores de pronunciacion en textos no normalizados: es necesario aplicar `hy_norm.normalize` a digitos, fechas y abreviaturas.
- Usar `non_streaming_mode=True` de forma obligatoria con armenio; en modo de texto en streaming el WER sube hasta ~50 %.
- La clonacion en contexto (audio de referencia mas transcripcion) empeora el resultado en armenio (WER ~12 %); se recomienda x-vector.
- No se incluyen voces de referencia en el repositorio: el usuario debe aportar grabaciones de hablantes que hayan consentido ser clonados, con las implicaciones eticas y legales que ello conlleva.
- Parte del WER reportado procede del modelo ASR usado en la evaluacion, no solo del TTS.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- No se documentan sesgos especificos ni limitaciones de contexto; la longitud de contexto no esta disponible.
- La licencia Apache-2.0 permite uso comercial, pero el uso de clonacion de voz exige cumplir la normativa aplicable sobre derechos de imagen y voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davitlive5/sonabo-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Version anterior: https://huggingface.co/davitlive5/sonabo-v1
- Modelos ASR armenios Lapillus: https://huggingface.co/davitlive5/Lapillus-v2
- Paper referenciado en los tags (arXiv:2601.15621): https://arxiv.org/abs/2601.15621
