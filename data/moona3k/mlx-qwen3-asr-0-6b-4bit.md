# moona3k/mlx-qwen3-asr-0.6b-4bit

## Resumen

`moona3k/mlx-qwen3-asr-0.6b-4bit` es una cuantizacion de 4 bits en formato MLX del modelo de reconocimiento automatico del habla `Qwen/Qwen3-ASR-0.6B`, publicada por el usuario moona3k. El artefacto esta pensado exclusivamente para Apple Silicon: se carga con `mlx-qwen3-asr`, una reimplementacion desde cero de Qwen3-ASR sobre MLX que no depende de PyTorch, de `transformers` ni de ningun paso de conversion por parte del usuario. Con 0,6 mil millones de parametros, el modelo resuelve transcripcion de audio a texto multilingue en local, sin GPU dedicada ni servicios en la nube.

La relevancia practica de esta ficha esta en el compromiso entre tamano y calidad: el repositorio ocupa 517 MB frente a los 1,8 GB del modelo original en fp16, y la degradacion medida es de solo 0,04 puntos porcentuales de WER en LibriSpeech test-clean (2,37 % frente a 2,33 %). El truco de la receta es asimetrico: el decodificador de texto se cuantiza a 4 bits, pero el encoder de audio se mantiene a 8 bits y el resto de tensores flotantes (escalas, sesgos, normalizaciones y el stem convolucional) se guardan en float16, de modo que la inferencia se ejecuta en float16 de principio a fin.

Es, por tanto, una pieza de despliegue mas que un modelo nuevo: no aporta arquitectura propia ni entrenamiento adicional, sino un artefacto ligero y reproducible para transcribir en un Mac. Su adopcion publica es todavia nula (cero descargas y cero likes en el momento de redactar esta ficha) y la evaluacion publicada se limita a 100 clips en ingles, por lo que conviene tratarlo como una opcion prometedora pero poco validada fuera de ese escenario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle (modelo ASR derivado de Qwen3-ASR: encoder de audio mas decodificador de texto; artefacto reimplementado en MLX) |
| Parametros totales | 0,6 mil millones (segun el nombre del modelo base, Qwen3-ASR-0.6B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Decodificador de texto (`Linear` y `Embedding`): afina a 4 bits, group size 64. Encoder de audio: 8 bits, group size 64. Resto de tensores flotantes (escalas, sesgos, normalizaciones, stem convolucional): float16 |
| Idiomas soportados | Ingles (en), chino (zh), japones (ja), coreano (ko), aleman (de), frances (fr), espanol (es), ruso (ru), arabe (ar), hindi (hi) |
| Licencia | Apache-2.0 (heredada del modelo fuente) |
| Formato de pesos | Nativo de MLX (el repositorio no especifica safetensors ni GGUF); `lm_head` reatado al embedding de tokens, no se almacena dos veces |
| Tamano del repositorio | 0,5 GB (descarga de 517 MB; el fuente fp16 ocupa 1,8 GB) |
| Libreria | `mlx` (requiere `mlx-qwen3-asr >= 0.4.3`) |
| Pipeline | `automatic-speech-recognition` |
| Modelo base | `Qwen/Qwen3-ASR-0.6B` |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo nuevo: es un artefacto de cuantizacion post-entrenamiento sobre `Qwen/Qwen3-ASR-0.6B`. La informacion disponible no describe la arquitectura interna del modelo base mas alla de que se trata de un sistema ASR con un encoder de audio y un decodificador de texto, y que la libreria de destino es una reimplementacion completa en MLX para Apple Silicon, sin PyTorch ni `transformers`. Tampoco se detallan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

La innovacion tecnica del artefacto esta en la receta de cuantizacion asimetrica. El decodificador de texto (`Linear` y `Embedding`) se cuantiza de forma afina a 4 bits con group size 64, mientras que el encoder de audio se mantiene a 8 bits con el mismo group size. El autor justifica esta asimetria con una medicion: cuantizar todo a 4 bits dispara el WER a 2,63 % en LibriSpeech test-clean, frente a 2,37 % con encoder de 8 bits, a cambio de solo 90 MB adicionales. El resto de tensores flotantes se conserva en float16, por lo que la inferencia completa se ejecuta en float16. Ademas, el `lm_head` esta atado al embedding de tokens en el modelo fuente y no se duplica; el cargador lo vuelve a atar en tiempo de carga. El modelo requiere `mlx-qwen3-asr >= 0.4.3`, ya que necesita el cargador por modulo introducido en esa version para gestionar anchos distintos entre encoder y decodificador.

## Capacidades

- Transcripcion de audio a texto (pipeline `automatic-speech-recognition`) sobre ficheros WAV mediante linea de comandos o API de Python.
- Soporte multilingue declarado para 10 idiomas: ingles, chino, japones, coreano, aleman, frances, espanol, ruso, arabe e hindi.
- Marcas de tiempo a nivel de palabra mediante la opcion `--timestamps` de `mlx-qwen3-asr`.
- Servidor HTTP integrado para servir transcripciones (`mlx-qwen3-asr serve --model moona3k/mlx-qwen3-asr-0.6b-4bit`).
- Ejecucion local en Apple Silicon, sin dependencia de PyTorch, `transformers` ni conversion de pesos por parte del usuario.
- No es un modelo de proposito general: no se documentan capacidades de generacion de texto libre, razonamiento, codigo, matematicas, vision, tool calling ni razonamiento multi-paso. Es exclusivamente un sistema ASR.

## Casos de uso

- Transcripcion local de reuniones en un Mac: el modelo convierte audio a texto en el propio equipo mediante `mlx-qwen3-asr audio.wav --model moona3k/mlx-qwen3-asr-0.6b-4bit`, sin enviar grabaciones a servicios externos, lo que simplifica el cumplimiento de politicas de privacidad sobre datos de voz.
- Generacion de subtitulos con marcas de tiempo: al soportar `--timestamps`, permite producir subtitulos a nivel de palabra y alinearlos con el audio para publicacion en plataformas de video.
- Servicio interno de transcripcion bajo demanda: el modo `serve` levanta un endpoint HTTP que puede centralizar la transcripcion de ficheros enviados por distintas aplicaciones de una organizacion.
- Dictado y notas de voz en aplicaciones de escritorio para macOS: con 517 MB de descarga y una latencia declarada de aproximadamente 2,7 veces menos que la version fp16 en un clip de 10 segundos, es viable integrarlo como dependencia embebida en una app nativa.
- Preprocesado de corpus de audio en investigacion: transcripcion masiva de grabaciones en ingles, chino, japones, coreano, aleman, frances, espanol, ruso, arabe o hindi antes de tareas posteriores de analisis o anotacion.
- Prototipado rapido de pipelines de voz: la instalacion con `pip install -U mlx-qwen3-asr` y una unica llamada `m.transcribe(...)` permiten validar una idea de producto en minutos, sin montar infraestructura de GPU.
- Archivado y busqueda de contenido audiovisual: transcribir un catalogo de audio para indexarlo y permitir busqueda por texto sobre el contenido hablado.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye scripts de reproduccion (`scripts/convert.py`, `scripts/eval_librispeech.py`) para replicar la receta y comparar 8 bits frente a 4 bits en el propio hardware.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a LibriSpeech test-clean sobre 100 clips balanceados por hablante (`speaker_round_robin`), decodificacion voraz, Apple M4 Pro y MLX 0.30.6. No se han publicado resultados de benchmarks en la informacion disponible para otros conjuntos de datos ni para los idiomas distintos del ingles.

| Modelo | WER | CER |
|---|---:|---:|
| `Qwen/Qwen3-ASR-0.6B` fp16 | 2,33 % | 0,59 % |
| **Este artefacto (4-bit, group size 64)** | **2,37 %** | **0,71 %** |

Datos adicionales aportados por el autor: la variante con todo cuantizado a 4 bits obtuvo 2,63 % de WER, frente al 2,37 % de esta receta con encoder a 8 bits. De las 100 hipotesis evaluadas, 17 difieren del resultado fp16, en su mayoria por grafias de nombres propios y variantes britanicas o americanas; la diferencia de WER respecto a fp16 es de 0,04 puntos porcentuales, y en CER de 0,12 puntos. En cuanto a velocidad, la matriz de cuantizacion del repositorio indica que la version de 8 bits es aproximadamente 2,4 veces mas rapida y la de 4 bits aproximadamente 2,7 veces mas rapida que fp16 en un clip de 10 segundos. El JSON por muestra de esta evaluacion esta comprometido en `docs/benchmarks/2026-09-19-quantized-artifacts-librispeech-test-clean-100-0.6B_4bit.json`.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon, ya que la libreria MLX no soporta CUDA. No hay version para GPU NVIDIA ni AMD.
- Peso en disco y en memoria: 517 MB de pesos descargados frente a 1,8 GB del modelo fp16. La cifra exacta de memoria pico en ejecucion no se publica en la informacion disponible.
- Precisión de inferencia: float16 de extremo a extremo, ya que los tensores no cuantizados se almacenan en ese formato.
- Hardware de referencia de las pruebas: Apple M4 Pro con MLX 0.30.6.
- GPU recomendadas: no aplica en el sentido habitual; el destino son los chips de Apple (serie M). No se han publicado mediciones para otros modelos de chip.
- Despliegue: linea de comandos de `mlx-qwen3-asr`, API de Python del mismo paquete y servidor HTTP integrado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que se apoyan en otros formatos y runtimes.
- Latencia y throughput: solo se declara la relacion respecto a fp16 (aproximadamente 2,7 veces mas rapido en 4 bits y 2,4 veces en 8 bits sobre un clip de 10 segundos). No se aportan cifras absolutas de milisegundos ni de audio procesado por segundo.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar este artefacto con su propio modelo fuente y con la variante de cuantizacion completa a 4 bits, ya que no se incluyen mediciones de otros sistemas ASR.

| Modelo | Parametros | Cuantizacion | WER (LibriSpeech test-clean, 100 clips) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Qwen/Qwen3-ASR-0.6B` (fp16) | 0,6 B | fp16 | 2,33 % | 1,8 GB | Apache-2.0 | HuggingFace |
| Este artefacto | 0,6 B | 4 bits (decodificador) + 8 bits (encoder), g64 | 2,37 % | 517 MB | Apache-2.0 | HuggingFace |
| Variante todo a 4 bits (descrita en la model card) | 0,6 B | 4 bits, g64 | 2,63 % | No disponible | Apache-2.0 | No se publica como artefacto independiente en la informacion disponible |
| Otros modelos ASR de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Validacion muy limitada: la unica evaluacion publicada son 100 clips de LibriSpeech test-clean en ingles. No hay mediciones para los otros nueve idiomas declarados (zh, ja, ko, de, fr, es, ru, ar, hi), ni sobre audio con ruido, acentos, solapamiento de hablantes o dominios distintos de la lectura limpia.
- Adopcion nula: el repositorio registra cero descargas y cero likes, y fue creado y actualizado el mismo dia. No hay evidencia de uso en produccion por terceros.
- Artefacto de comunidad: se trata de una cuantizacion realizada por un autor individual, no de una publicacion oficial del equipo de Qwen. La trazabilidad depende del script `convert.py` incluido en el repositorio del proyecto.
- Dependencia estricta de version: requiere `mlx-qwen3-asr >= 0.4.3`. Las versiones anteriores fallan al cargar el artefacto con un error de formas (shape), porque no disponen del cargador por modulo necesario para anchos distintos entre encoder y decodificador.
- Degradacion por cuantizacion: aunque el WER se mantiene practicamente identico al fp16, el CER sube de 0,59 % a 0,71 % y 17 de cada 100 hipotesis cambian, con errores concentrados en nombres propios y variantes ortograficas. En dominios con muchos nombres propios, cifras o terminos tecnicos, la degradacion puede ser mayor que en LibriSpeech.
- Encierro de plataforma: solo funciona en Apple Silicon. No hay soporte para CUDA ni para los formatos GGUF que consumen llama.cpp u Ollama, lo que descarta su uso en servidores con GPU NVIDIA.
- Alcance funcional: es un modelo de transcripcion, no un asistente. No soporta tool calling, agentes ni razonamiento multi-paso, por lo que no debe evaluarse como sustituto de un LLM generativo.
- Riesgo de alucinacion en el sentido propio de los sistemas ASR: como cualquier modelo seq2seq de voz, puede producir texto plausible donde el audio es ininteligible o hay silencio. No se documentan mecanismos de deteccion de voz o de confianza por segmento.
- Licencia: Apache-2.0, heredada del modelo fuente, permite uso comercial. Conviene verificar de todos modos las condiciones del modelo base `Qwen/Qwen3-ASR-0.6B` y los terminos de la propia libreria MLX antes de desplegarlo en un producto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moona3k/mlx-qwen3-asr-0.6b-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Repositorio de la libreria `mlx-qwen3-asr`: https://github.com/moona3k/mlx-qwen3-asr
- Matriz de cuantizacion de referencia: `docs/benchmarks/2026-09-07-quant-matrix-test-clean-speaker100.md` (dentro del repositorio de GitHub)
- Evaluacion por muestra de este artefacto: `docs/benchmarks/2026-09-19-quantized-artifacts-librispeech-test-clean-100-0.6B_4bit.json` (dentro del repositorio de GitHub)
- Paper, blog o demo oficial: no disponibles en la informacion proporcionada
