# espnet/frontia_vad_v2_3

## Resumen

`espnet/frontia_vad_v2_3` es un detector de actividad de voz (VAD) desarrollado por el equipo de ESPnet. Se trata de un unico modelo TCN en modo dual que cubre tanto la deteccion en linea (streaming, con look-ahead cero) como la deteccion fuera de linea (con 124 frames de look-ahead, aproximadamente 0,99 s), a diferencia de la familia anterior `frontia_vad_v1_*`, que publicaba un checkpoint por modo. El modelo resuelve el problema de segmentar habla frente a silencio y ruido en flujos de audio, un paso previo habitual en pipelines de diarizacion, reconocimiento de voz y limpieza de corpus.

La entrada se procesa en frames de 8 ms (16 kHz, STFT de 512 puntos sin centrado, hop de 128 muestras, 40 canales mel) y el modelo emite una probabilidad de habla por frame. Se entrena como diarizacion de un solo hablante (`num_spk 1`), fusionando todas las voces de una grabacion en una unica etiqueta de "habla". El checkpoint se publica con licencia CC BY-SA 4.0 y se distribuye a traves de la libreria ESPnet, sin pesos en formato safetensors ni GGUF en el repositorio.

Su relevancia actual radica en la unificacion de modos en un solo modelo y en la documentacion explicita de la regla de decision y la latencia resultante, lo que facilita su integracion tanto en aplicaciones en tiempo real como en procesamiento por lotes. No obstante, el autor no publica todavia resultados de benchmarks sobre los conjuntos de evaluacion de la version anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TCN (red convolucional temporal), 5 bloques x 2 repeticiones, bottleneck 64, hidden 128, salida 128, kernel 3, normalizacion de capa acumulativa, `future_taps 2`, MVN global y decoder lineal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa frames de 8 ms de forma continua (look-ahead 0 en modo online, 124 frames en modo offline) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el VAD es independiente del idioma en la practica, pero no se declara) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | pesos ESPnet (cargables via `DiarizeSpeech.from_pretrained`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una TCN con cinco bloques convolucionales repetidos dos veces, bottleneck de 64, hidden de 128, salida de 128, kernel de 3 y normalizacion de capa acumulativa. Incorpora `future_taps 2` y se entrena conjuntamente con `look_aheads: [0, 124]`, lo que le permite operar en modo online (sin futuro) y offline (hasta 124 frames de futuro) con los mismos pesos. La entrada se normaliza con MVN global y la salida pasa por un decoder lineal que produce la probabilidad de habla por frame.

El entrenamiento se realizo con ESPnet 202609.post1 y PyTorch 2.11.0, con la configuracion `train_dualmode_v2_3_lr1e-3.yaml`, y se selecciono el checkpoint promediando los dos mejores segun `valid.acc`. El modelo se plantea como diarizacion de un solo hablante (`diar1`, `num_spk 1`), de modo que todas las voces de una grabacion se colapsan en una etiqueta binaria de habla. No se detalla en la informacion disponible el volumen de datos de entrenamiento, su composicion ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en un VAD).

## Capacidades

- Deteccion de actividad de voz por frame con probabilidad calibrada, en dos modos: online (look-ahead 0) y offline (look-ahead de 124 frames, 0,99 s).
- Procesamiento en streaming en tiempo real con latencia de decision de aproximadamente 128 ms en modo online, de los cuales unos 96 ms corresponden al filtro de mediana centrado de 25 frames.
- Procesamiento por lotes de grabaciones completas en modo offline para limpieza de corpus y segmentacion previa a ASR o diarizacion.
- Salida de probabilidad por frame que el usuario puede postprocesar con su propia regla de decision (umbral y filtro de mediana).
- Integracion con el ecosistema ESPnet mediante `DiarizeSpeech.from_pretrained` con `num_spk=1`.
- No se documentan capacidades de tool calling, agentes, vision, audio multimodal ni modo de razonamiento; es un modelo puramente de clasificacion de audio frame a frame.

## Casos de uso

- Deteccion de voz en asistentes de voz en tiempo real: el modo online con look-ahead cero permite decidir si el usuario esta hablando frame a frame, con una latencia de unos 128 ms incluyendo el filtro de mediana, adecuada para activacion por voz y control de microfono.
- Segmentacion previa a ASR en pipelines de transcripcion: aplicar el modo offline sobre grabaciones completas para recortar regiones de silencio antes de pasar el audio a un reconocedor, reduciendo coste computacional y falsos positivos.
- Limpieza de corpus de entrenamiento: filtrar segmentos sin habla en grandes conjuntos de audio antes de entrenar modelos de reconocimiento o diarizacion, usando el modo offline con umbral 0,6 y sin filtro de mediana.
- Diarizacion de un solo hablante: usar el modelo como bloque de deteccion de habla dentro de un pipeline de diarizacion donde ya se conoce que hay una unica voz, por ejemplo en entrevistas o notas de voz.
- Telefonia y centros de contacto: deteccion de actividad de voz en flujos de audio telefonicos para suprimir silencios y mejorar la experiencia en conversaciones multi-turno, con el modo online para baja latencia.
- Investigacion en procesamiento de audio: punto de partida reproducible en ESPnet para experimentos de VAD y comparacion de arquitecturas TCN, con configuracion de entrenamiento publicada.
- Herramientas de edicion de audio o podcast: marcado automatico de regiones con voz para facilitar el corte y la mezcla, usando el modo offline sobre el fichero completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el checkpoint no ha sido evaluado todavia en los conjuntos de evaluacion de la version v1 y que no se publica tabla de detection error para este checkpoint. Las reglas de decision (umbral 0,6; mediana centrada de 25 frames en online, sin mediana en offline) se ajustaron sobre `ami_mh_dev_v1`, pero no se aportan metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es una TCN pequena (hidden 128, bottleneck 64), por lo que se espera que quepa holgadamente en GPU de consumo, aunque no se publican cifras.
- GPU recomendadas: no disponible; por tamano de arquitectura, cualquier GPU consumer moderna deberia ser suficiente, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido de la red, aunque no confirmado en la documentacion.
- Opciones de despliegue: ESPnet (`DiarizeSpeech.from_pretrained`). El wrapper `VoiceActivityDetector.for_mode`, la CLI `espnet detect` y una herramienta MCP estan en preparacion y no estan todavia en `espnet` master. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: en modo online, la probabilidad de cada frame esta lista 32 ms despues del inicio del frame, y el filtro de mediana centrado de 25 frames anade 96 ms, para un total de aproximadamente 128 ms. Con mediana 1, la decision es final en cuanto se calcula la probabilidad. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Modos | Look-ahead | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `espnet/frontia_vad_v2_3` | TCN dual | online y offline en un solo checkpoint | 0 / 124 frames | CC BY-SA 4.0 | Hugging Face (ESPnet) |
| `espnet/frontia_vad_v1_*` | TCN | un checkpoint por modo | segun checkpoint | no disponible en la informacion | Hugging Face (ESPnet) |
| Otros VAD (p. ej. Silero VAD, WebRTC VAD) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas fuera de ESPnet no puede completarse con los datos disponibles; no se aportan parametros, contexto ni metricas de rendimiento de esos sistemas en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks ni tabla de detection error para este checkpoint; el rendimiento real no esta cuantificado en la documentacion.
- El modelo se entrena como diarizacion de un solo hablante: no distingue entre hablantes y colapsa todas las voces en una etiqueta de habla.
- El filtro de mediana del modo online es centrado, no causal, lo que introduce 96 ms adicionales de latencia; con mediana 1 la latencia baja, pero cambia el comportamiento de la decision.
- La regla de decision se ajusto unicamente sobre `ami_mh_dev_v1`; puede no generalizar a otros dominios, idiomas o condiciones acusticas.
- No se declaran idiomas soportados ni sesgos conocidos; al ser un VAD, el riesgo principal es la confusion entre habla y ruido no verbal en condiciones acusticas adversas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- El wrapper de conveniencia, la CLI y la herramienta MCP no estan todavia en `espnet` master; hasta que esten disponibles, hay que usar `DiarizeSpeech` directamente.
- No se documentan formatos de cuantizacion ni pesos en safetensors o GGUF, lo que limita el despliegue fuera del ecosistema ESPnet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/espnet/frontia_vad_v2_3
- ESPnet (repositorio y documentacion): https://github.com/espnet/espnet
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos especificos del modelo.
