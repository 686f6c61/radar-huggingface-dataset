# moona3k/mlx-qwen3-asr-1.7b-4bit

## Resumen

`moona3k/mlx-qwen3-asr-1.7b-4bit` es una cuantizacion de 4 bits (tamano de grupo 64) del modelo de reconocimiento automatico del habla `Qwen/Qwen3-ASR-1.7B`, publicada por el usuario moona3k para su uso con `mlx-qwen3-asr`, una reimplementacion completa en MLX de Qwen3-ASR orientada a Apple Silicon. No requiere PyTorch, ni `transformers`, ni ningun paso de conversion por parte del usuario: el artefacto se descarga y se ejecuta directamente sobre Metal.

El problema que resuelve es doble. Por un lado, reduce el peso del modelo de 4,4 GB (fp16) a 1,2 GB, lo que permite ejecutar un ASR de 1.700 millones de parametros en equipos Apple Silicon con memoria unificada modesta. Por otro, aprovecha la aceleracion de MLX para obtener latencias muy inferiores a las de la version fp16: segun la matriz de cuantizacion del repositorio, la variante de 4 bits es aproximadamente 2,7 veces mas rapida que fp16 en un clip de 10 segundos.

La relevancia actual del artefacto radica en que la decodificacion de audio se hace en local, sin envio de datos a la nube, y en que cubre diez idiomas (ingles, chino, japones, coreano, aleman, frances, espanol, ruso, arabe e hindi). La licencia Apache-2.0, heredada del modelo base, permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (encoder de audio y decoder de texto con anchuras mixtas), reimplementada en MLX |
| Parametros totales | 1,7 B (segun la denominacion del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afina de 4 bits (group size 64) en capas `Linear` y `Embedding` del decoder de texto; 8 bits (group size 64) en el encoder de audio; tensores restantes (escalas, sesgos, normalizaciones, stem convolucional) en float16 |
| Idiomas soportados | en, zh, ja, ko, de, fr, es, ru, ar, hi |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX cuantizado (el contenedor exacto no se especifica en la model card); el `lm_head` esta atado al embedding de tokens y no se almacena por duplicado |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion, no un entrenamiento nuevo. La model card no documenta el proceso de entrenamiento del modelo base `Qwen/Qwen3-ASR-1.7B`, por lo que no hay datos disponibles sobre numero de tokens, composicion del dataset ni si se aplico RLHF o DPO. Lo que si se detalla es la estructura interna: el modelo combina un encoder de audio y un decoder de texto con anchuras diferentes, lo que obliga a usar un cargador por modulo. Esa es precisamente la razon de que se exija `mlx-qwen3-asr >= 0.4.3`; las versiones anteriores fallan al cargar el artefacto con un error de forma.

La decision de cuantizacion mas relevante es asimetrica: el decoder de texto se cuantiza a 4 bits, pero el encoder de audio se mantiene a 8 bits. El autor justifica esta eleccion con mediciones sobre la variante de 0,6 B: cuantizar todo a 4 bits daba un WER del 2,63 % frente al 2,37 % con encoder de 8 bits, con fp16 en el 2,33 %, a cambio de solo 90 MB adicionales. Es decir, el encoder concentra la mayor parte de la perdida de calidad, y mantenerlo en 8 bits es un compromiso barato. El resto de tensores flotantes se guardan en float16, de modo que la inferencia se ejecuta de extremo a extremo en float16. El `lm_head` esta atado al embedding de tokens en el modelo original y el cargador vuelve a atarlos en lugar de duplicarlos.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) como tarea principal.
- Soporte de marcas de tiempo a nivel de palabra mediante la opcion `--timestamps` de la CLI.
- Modo servidor HTTP integrado: `mlx-qwen3-asr serve --model moona3k/mlx-qwen3-asr-1.7b-4bit`.
- API de Python para integracion en scripts: `m.transcribe("audio.wav", model=...)`.
- Cobertura multilingue de diez idiomas: ingles, chino, japones, coreano, aleman, frances, espanol, ruso, arabe e hindi.
- Inferencia en float16 sobre GPU unificada de Apple Silicon, sin dependencia de CUDA.
- No se documentan en la informacion disponible capacidades de traduccion directa, diarizacion de hablantes, deteccion de idioma explicita ni tool calling.

## Casos de uso

- Transcripcion de reuniones en local: al ejecutarse integramente en el equipo Apple Silicon, el audio de reuniones internas no sale de la maquina. Es adecuado cuando existen requisitos de confidencialidad o compliance que impiden usar APIs en la nube.
- Subtitulado de video y podcast: la opcion de marcas de tiempo a nivel de palabra permite generar ficheros de subtitulos sincronizados a partir de un WAV extraido de la pista de audio, sin coste por minuto de API.
- Servicio de transcripcion interno: el modo `serve` expone un endpoint HTTP que se puede desplegar en un Mac mini o Mac Studio de la red corporativa para que varios equipos envien audio y reciban texto.
- Preprocesado de corpus de audio para NLP: convertir entrevistas, notas de voz o archivos de radio en texto plano que despues alimente pipelines de busqueda, resumen o clasificacion. El modelo es adecuado aqui porque el tamaño reducido (1,2 GB) permite tenerlo residente y procesar lotes largos.
- Investigacion multilingue: con diez idiomas declarados, se puede transcribir un mismo corpus en distintas lenguas con un unico modelo, evitando mantener un pipeline distinto por idioma.
- Prototipado en portatiles: desarrolladores que trabajan en un MacBook pueden iterar sobre una funcionalidad de voz sin depender de acceso a GPU remota ni de cuotas de servicio.
- Despliegue en entornos sin conectividad: al no requerir descarga en tiempo de inferencia una vez cacheado el modelo, encaja en escenarios de campo, laboratorio o instalaciones aisladas.
- Dictado y accesibilidad: integracion en herramientas internas de dictado o lectura de pantalla para usuarios que necesitan convertir voz en texto en tiempo casi real sobre hardware de escritorio.

## Benchmarks y rendimiento

Evaluacion sobre LibriSpeech test-clean con 100 clips equilibrados por hablante (`speaker_round_robin`), decodificacion greedy, en un Apple M4 Pro con MLX 0.30.6:

| Modelo | WER | CER |
|---|---:|---:|
| `Qwen/Qwen3-ASR-1.7B` fp16 | 1,94 % | 0,57 % |
| `moona3k/mlx-qwen3-asr-1.7b-4bit` (4-bit g64) | 1,73 % | 0,53 % |

De las 100 hipotesis generadas, 12 difieren del resultado fp16, en su mayoria por variantes ortograficas britanicas frente a americanas. El WER es ligeramente inferior al de fp16 en esta muestra concreta. Los resultados por muestra estan publicados en el repositorio como `docs/benchmarks/2026-09-19-quantized-artifacts-librispeech-test-clean-100-1.7B_4bit.json`.

Las cifras de latencia declaradas provienen de una matriz de cuantizacion calculada sobre la variante de 0,6 B, no sobre este artefacto de 1,7 B: con 8 bits la inferencia es aproximadamente 2,4 veces mas rapida que fp16 y con 4 bits aproximadamente 2,7 veces mas rapida, siempre para un clip de 10 segundos. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, algo esperable al tratarse de un modelo especializado en ASR.

## Requisitos de hardware

- Hardware obligatorio: Apple Silicon (M1 o posterior). El artefacto esta en formato MLX y no se ejecuta en GPU NVIDIA ni AMD.
- Memoria unificada: al menos 8 GB. El peso en disco o memoria del modelo cuantizado es de 1,2 GB, frente a los 4,4 GB del modelo fp16 equivalente.
- GPU recomendadas por el autor: Apple M4 Pro es el equipo usado en la evaluacion publicada. Cualquier chip de la familia M con suficiente memoria unificada deberia funcionar.
- Encaje en hardware de consumo: si, en cualquier Mac con Apple Silicon y 8 GB o mas de memoria unificada. No es compatible con GPUs de consumo tipo RTX 4090 por la dependencia de MLX.
- Opciones de despliegue: CLI `mlx-qwen3-asr`, API de Python (`mlx_qwen3_asr`) y servidor HTTP con `mlx-qwen3-asr serve`. No hay soporte de vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM documentado para este artefacto.
- Version minima de la libreria: `mlx-qwen3-asr >= 0.4.3`, por el cargador por modulo requerido por las anchuras mixtas de encoder y decoder.
- Latencia y throughput: aproximadamente 2,7 veces mas rapido que fp16 en un clip de 10 s, medido sobre el modelo de 0,6 B. No hay cifras publicadas de throughput en tokens por segundo ni de latencia absoluta para el artefacto de 1,7 B.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | WER (LibriSpeech test-clean, 100 clips) | Licencia | Plataforma |
|---|---|---|---|---|---|
| `moona3k/mlx-qwen3-asr-1.7b-4bit` | 1,7 B | 4 bits decoder / 8 bits encoder | 1,73 % | Apache-2.0 | Apple Silicon (MLX) |
| `Qwen/Qwen3-ASR-1.7B` (fp16) | 1,7 B | fp16 | 1,94 % | Apache-2.0 | Original (PyTorch/transformers) |
| Variante 0,6 B (datos de la matriz de cuantizacion) | 0,6 B | 4 bits | 2,63 % | Apache-2.0 | Apple Silicon (MLX) |
| Variante 0,6 B con encoder a 8 bits | 0,6 B | 4 bits decoder / 8 bits encoder | 2,37 % | Apache-2.0 | Apple Silicon (MLX) |

No se dispone de datos comparativos frente a otros sistemas ASR (Whisper, Parakeet, etc.) en la informacion proporcionada, por lo que la comparacion se limita a las variantes del propio Qwen3-ASR.

## Limitaciones y advertencias

- Exclusivo de Apple Silicon: la dependencia de MLX descarta por completo su uso en servidores con GPU NVIDIA o AMD, que es el entorno habitual de produccion a gran escala.
- Dependencia estricta de version: con `mlx-qwen3-asr` anterior a 0.4.3 el artefacto no carga y produce un error de forma, no un aviso.
- Base de evaluacion reducida: los numeros de WER y CER proceden de 100 clips de LibriSpeech test-clean, un corpus de lectura en ingles con condiciones acusticas limpias. No hay evaluacion publicada sobre audio espontaneo, ruidoso, con acentos marcados, solapamiento de hablantes ni sobre los otros nueve idiomas declarados.
- Las cifras de latencia (2,4x y 2,7x) provienen del modelo de 0,6 B, no del de 1,7 B. No deben extrapolarse directamente a este artefacto.
- El WER ligeramente inferior al de fp16 en la muestra evaluada no implica superioridad general; el propio autor senala que 12 de 100 hipotesis difieren, en su mayoria por variantes ortograficas, lo que sugiere ruido de muestreo.
- Riesgo de alucinacion inherente a los modelos ASR: en segmentos con silencio prolongado, musica o ruido, pueden aparecer palabras o frases no pronunciadas. Se recomienda aplicar heuristica de confianza o VAD en produccion.
- No se documentan sesgos por idioma, acento o demografia en la informacion disponible.
- Licencia: Apache-2.0, que permite uso comercial, modificacion y redistribucion. Al derivar de `Qwen/Qwen3-ASR-1.7B`, conviene verificar tambien las condiciones del modelo base por si anaden requisitos adicionales.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, lo que indica un artefacto reciente y sin validacion independiente por parte de la comunidad.
- Los resultados de la busqueda web realizada no aportan informacion relevante sobre este modelo: las referencias encontradas tratan sobre soporte de YouTube y no guardan relacion con el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moona3k/mlx-qwen3-asr-1.7b-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio de la implementacion en MLX: https://github.com/moona3k/mlx-qwen3-asr
- Benchmarks de cuantizacion citados en la model card: `docs/benchmarks/2026-09-07-quant-matrix-test-clean-speaker100.md` y `docs/benchmarks/2026-09-19-quantized-artifacts-librispeech-test-clean-100-1.7B_4bit.json` dentro del repositorio anterior.
