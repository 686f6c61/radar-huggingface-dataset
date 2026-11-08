# Snooow1029/hyeyeon

## Resumen

hyeyeon es un conjunto de checkpoints del códec de audio neuronal DAC (Descript Audio Codec) de 16 kHz, reentrenados desde cero sobre subconjuntos de hablantes de LibriSpeech train-clean-360. Lo publica el usuario Snooow1029 en Hugging Face y no constituye un modelo de lenguaje, sino un códec neuronal con encoder, cuantizador residual y decoder, pensado para comprimir y reconstruir audio de voz a 16 kHz mediante 12 codebooks. Su interes es experimental: sirve para estudiar como varian las metricas de reconstruccion (STOI, PESQ-WB, mel L1) segun el subconjunto de hablantes usado en el entrenamiento, con particiones y listas de ficheros publicadas.

El repositorio contiene ocho modelos (seis de referencia, `ref_00` a `ref_05`, y dos objetivo, `target_00` y `target_01`), cada uno entrenado sobre unos 57 hablantes y aproximadamente 13 horas de audio, con checkpoints en 50k, 100k, 200k y 250k pasos. El codigo fuente de descript-audio-codec no se modifica (commit c7cfc5d), y se incluyen las configuraciones argbind, las particiones de entrenamiento y evaluacion y los manifiestos con semilla, lo que facilita la reproducibilidad.

La relevancia actual es acotada: no es un modelo de proposito general ni compite en benchmarks de lenguaje, sino un artefacto de investigacion sobre codecs neuronales y sobre el efecto de la composicion del corpus de entrenamiento en la calidad de reconstruccion. Su licencia MIT y el tamano del repositorio (14,9 GB) lo hacen util para experimentos controlados de audio, no para despliegues de producto sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DAC (Descript Audio Codec) 16 kHz: encoder convolucional, cuantizador residual con 12 codebooks y decoder convolucional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de entrenamiento (crop) de 0,3795 s |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en `weights.pth` de PyTorch) |
| Idiomas soportados | no disponible (entrenado sobre LibriSpeech, corpus de habla inglesa) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch), estructura `p1/<model>/<checkpoint>/{dac,discriminator}/weights.pth` |

## Arquitectura y entrenamiento

La arquitectura es la del DAC oficial de 16 kHz, sin modificaciones en el codigo (commit c7cfc5d de descriptinc/descript-audio-codec). Se compone de un encoder convolucional que transforma la forma de onda en una representacion latente, un cuantizador vectorial residual con 12 codebooks que produce los tokens discretos, y un decoder convolucional que reconstruye la senal. El entrenamiento incluye un discriminador adversarial, cuyos pesos tambien se publican en cada checkpoint.

Cada modelo se entrena durante 250.000 pasos con batch de 12 y un crop de 0,3795 s, siguiendo por lo demas la receta oficial de 16 kHz. El entrenamiento se realizo en una NVIDIA B200 con cuatro modelos en paralelo, unas 26,5 horas por modelo. Los datos proceden de subconjuntos de hablantes de LibriSpeech train-clean-360: cada modelo ve unos 57 hablantes y cerca de 13 horas de audio. El repositorio documenta las particiones (`models.csv`, `speakers.csv`, `membership_speaker.csv`, `membership_utt.csv`, `train_<model>.csv`, `eval_set.csv`, `manifest.json`) con semilla y parametros, y las configuraciones argbind para `scripts/train.py`. No se documenta uso de RLHF ni de DPO, algo que no aplica a un codec.

## Capacidades

- Compresion y reconstruccion de audio de voz a 16 kHz mediante tokens discretos (12 codebooks).
- Codificacion y decodificacion con el API de `descript-audio-codec` (`dac.DAC.load(...)`).
- Proporciona checkpoints intermedios (50k, 100k, 200k, 250k) para estudiar la evolucion de la calidad con el entrenamiento.
- Incluye el discriminador entrenado junto al codec en cada checkpoint.
- Permite reproducir experimentos controlados de composicion de hablantes gracias a las listas de ficheros y al manifiesto con semilla.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada en sentido ASR ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Investigacion sobre codecs neuronales: comparar la calidad de reconstruccion entre subconjuntos de hablantes usando las particiones publicadas y las metricas STOI, PESQ-WB y mel L1 sobre `eval_set.csv`.
- Estudio de ablacion de datos de entrenamiento: los pares `ref_*` y `target_*` permiten analizar como cambia la reconstruccion cuando varia la cobertura de hablantes, manteniendo fija la receta oficial.
- Analisis de convergencia: los checkpoints en 50k, 100k, 200k y 250k pasos permiten trazar curvas de calidad frente a pasos de entrenamiento sin reentrenar.
- Prototipado de pipelines de compresion de voz: usar el codec para tokenizar audio de 16 kHz en 12 codebooks y alimentar modelos posteriores de audio o de habla en entornos de laboratorio.
- Reproduccion de experimentos: las configuraciones argbind y los manifiestos con semilla permiten repetir el entrenamiento en otra maquina sustituyendo la raiz de LibriSpeech.
- Docencia y formacion: el repositorio separa pesos, configuraciones y particiones, lo que facilita explicar el funcionamiento interno de un codec con cuantizacion residual y entrenamiento adversarial.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre dev-clean (500 ficheros, 12 codebooks, checkpoint `latest`):

| Modelo | STOI | PESQ-WB | mel L1 |
|---|---|---|---|
| hyeyeon (`ref_*` / `target_*`, rango) | 0,968-0,970 | 3,64-3,73 | 0,430-0,447 |
| DAC oficial 16 kHz (mismos ficheros) | 0,973 | 4,00 | 0,364 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, MUSHRA, ViSQOL o evaluaciones por hablante) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor no publica el numero de parametros ni el consumo de memoria del codec.
- GPU recomendadas: no disponible. El entrenamiento se realizo en una NVIDIA B200 con cuatro modelos en paralelo, lo que da una referencia del coste de entrenamiento, no de inferencia.
- GPU de consumo: no disponible; al ser un codec convolucional de audio, es plausible que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el unico camino documentado es PyTorch con `descript-audio-codec` (`dac.DAC.load`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Frecuencia | Codebooks | Licencia | Calidad publicada |
|---|---|---|---|---|---|
| hyeyeon | DAC 16 kHz reentrenado | 16 kHz | 12 | MIT | STOI 0,968-0,970; PESQ-WB 3,64-3,73; mel L1 0,430-0,447 |
| DAC oficial 16 kHz (descriptinc) | DAC 16 kHz original | 16 kHz | 12 | MIT (segun el repositorio de referencia) | STOI 0,973; PESQ-WB 4,00; mel L1 0,364 |
| EnCodec (Meta) | Codec neuronal | multiple | configurable | no disponible en la informacion proporcionada | no disponible |
| SoundStream (Google) | Codec neuronal | multiple | configurable | no disponible en la informacion proporcionada | no disponible |

La comparativa con EnCodec y SoundStream se incluye por categoria (codecs neuronales de audio), pero no se dispone de datos de parametros, contexto ni rendimiento en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Entrenado exclusivamente sobre subconjuntos de LibriSpeech train-clean-360 (habla inglesa leida); el comportamiento sobre otros idiomas, acentos o audio no leido no esta documentado.
- La calidad de reconstruccion es inferior a la del DAC oficial de 16 kHz en las mismas condiciones (PESQ-WB 3,64-3,73 frente a 4,00; mel L1 0,430-0,447 frente a 0,364).
- El autor no publica el numero de parametros, el consumo de VRAM ni latencias, lo que dificulta planificar un despliegue en produccion.
- El repositorio ocupa 14,9 GB y contiene ocho modelos con cuatro checkpoints cada uno; conviene descargar solo los subdirectorios necesarios.
- Las rutas de los CSV de particiones apuntan a la maquina original; es necesario sustituir la raiz de LibriSpeech antes de reutilizarlas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y no consta pipeline declarado; no hay validacion externa de los resultados.
- Licencia MIT: permite uso comercial, pero al derivar del codigo de descript-audio-codec conviene revisar las condiciones de ese repositorio y de LibriSpeech antes de redistribuir pesos o audio.
- Riesgo de sobreajuste a los hablantes de entrenamiento: cada modelo ve unos 57 hablantes, por lo que la generalizacion a voces no vistas no esta cuantificada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Snooow1029/hyeyeon
- Perfil del autor: https://huggingface.co/Snooow1029
- Repositorio de referencia del codec: https://github.com/descriptinc/descript-audio-codec
- Dataset de entrenamiento: https://huggingface.co/datasets/openslr/librispeech_asr
