# itzune/antzoki-mini-tts

## Resumen

antzoki-mini-tts es un modelo de síntesis de voz (text-to-speech) en euskera, desarrollado por el usuario itzune como un ajuste fino supervisado del modelo base Edge0/Audio8-TTS-Realistic-Air. El modelo base es un sistema DualAR de 0,6 mil millones de parámetros con códec a 44,1 kHz y capacidad de clonación de voz zero-shot, entrenado originalmente para 23 idiomas entre los que no se incluye el euskera. Esta release adapta el modelo a un idioma nuevo mediante entrenamiento sobre un corpus de habla leída en euskera.

La arquitectura DualAR del modelo base separa una rama autorregresiva lenta, que modela la estructura semántica y temporal del audio, de una rama autorregresiva rápida que se encarga del detalle acústico. En este ajuste fino solo se entrena la rama lenta, manteniendo la rama rápida congelada, lo que reduce el coste computacional y limita el sobreajuste sobre un corpus pequeño. El resultado es un modelo de 601.159.424 parámetros con licencia Apache 2.0, publicado en formato safetensors y con una build GGUF Q4_K_M para inferencia en CPU.

El modelo es relevante porque cubre una laguna real: la síntesis de voz neuronal de calidad en euskera, una lengua con recursos limitados y escasa representación en los grandes sistemas TTS multilingües. No obstante, el propio autor lo marca como experimental: se entrenó con aproximadamente 9 horas de audio de un único corpus y un solo dominio (frases leídas), por lo que su uso en producción requiere validación previa con muestras representativas del caso de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DualAR (dos ramas autorregresivas: lenta y rápida) sobre códec a 44,1 kHz |
| Parámetros totales | 601.159.424 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (recomendación del autor: entradas de menos de ~150 caracteres) |
| Tipos de cuantización | bf16 (pesos principales); GGUF Q4_K_M en el repo itzune/antzoki-mini-tts-GGUF |
| Idiomas soportados | euskera (eu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF (build separada) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura DualAR de Audio8-TTS-Realistic-Air. La rama autorregresiva lenta se entrena en este ajuste fino, mientras que la rama rápida, responsable del detalle acústico, permanece congelada. El audio se genera a través de un códec a 44,1 kHz. El entrenamiento se realizó en bf16 con DeepSpeed ZeRO-2 sobre una única GPU RTX 5090 de 24 GB, con learning rate de 1e-5, 2 épocas, batch size de 4, acumulación de gradientes de 4, warmup ratio de 0,03, scheduler coseno y weight decay de 0,01, seleccionando el mejor checkpoint por eval_loss.

Los datos provienen de OpenSLR 76, un corpus de habla leída en euskera obtenido mediante crowdsourcing. Tras el filtrado se usaron 6811 enunciados (9,1 horas) de 50 hablantes. El preprocesado incluyó recorte de silencios, remuestreo a 44,1 kHz, normalización de sonoridad a −20 LUFS con pico de −1 dBFS y filtrado de valores atípicos de velocidad de habla. Dos hablantes (euf_07505 y eum_01523) se reservaron para evaluación y nunca se usaron en entrenamiento. Para la clonación de voz, el 61 % de las filas de entrenamiento se emparejaron con otro enunciado del mismo hablante como prompt de referencia. Una primera ejecución con learning rate de 2e-5 y 6 épocas sobreajustó tras unas 250 iteraciones, ya que OpenSLR 76 contiene muchos hablantes leyendo las mismas frases; la release final usa un schedule corto con parada temprana y la rama rápida congelada.

## Capacidades

- Generación de voz en euskera a partir de texto, con salida de audio a 44,1 kHz.
- Clonación de voz zero-shot: acepta un audio de referencia y su transcripción exacta para imitar el timbre y, en gran medida, el ritmo del hablante de referencia.
- Normalización de texto específica para euskera mediante `eu_normalize.normalize()`, que convierte dígitos en palabras en euskera conservando el sufijo de caso (por ejemplo, `2008an` → `bi mila eta zortzian`).
- Generación sin referencia de voz: el modelo selecciona una voz por sí mismo.
- Inferencia en GPU mediante transformers con `trust_remote_code=True` y en CPU mediante la build GGUF Q4_K_M para llama.cpp.
- Interfaz de línea de comandos disponible en el repositorio de Audio8 (`audio8_tts_infer.py`).
- No soporta tool calling, agentes, visión ni audio de entrada más allá del prompt de referencia para clonación.

## Casos de uso

- Audiolibros y contenido editorial en euskera: el modelo puede narrar textos con una voz consistente mediante clonación de referencia, adecuado para frases cortas de prosa leída, que es exactamente el dominio del corpus de entrenamiento.
- Accesibilidad y lectura de pantalla: integración en aplicaciones que necesiten convertir texto en voz en euskera para usuarios con discapacidad visual, usando la build GGUF en CPU para despliegues sin GPU.
- Locuciones para vídeo y pódcast: generación de voces en off para contenido divulgativo en euskera, con la posibilidad de clonar la voz del creador a partir de una muestra de referencia.
- Prototipado de asistentes conversacionales en euskera: el modelo sirve como capa TTS en un pipeline de voz, aunque requiere validación de robustez por las tasas de generación desbocada documentadas.
- Aprendizaje de idiomas: generación de pronunciación de frases en euskera para materiales didácticos, con la advertencia de que los acrónimos y nombres alfanuméricos se leen con nombres de dígitos en euskera.
- Investigación en TTS para lenguas de bajos recursos: el modelo y su pipeline de entrenamiento (repositorio en GitHub) sirven como referencia metodológica para adaptar modelos multilingües a idiomas no cubiertos, con un coste de una sola GPU consumer de 24 GB.
- Señalización y anuncios automatizados: generación de avisos cortos en euskera para transporte o espacios públicos, siempre con revisión previa de las muestras por la variabilidad en la duración de salida.

## Benchmarks y rendimiento

Evaluación con loss teacher-forced sobre 200 enunciados de los hablantes reservados (menor es mejor):

| Modelo | eval loss | slow loss | fast loss | slow acc |
|---|---:|---:|---:|---:|
| base (Audio8-TTS-Realistic-Air) | 12,730 | 5,423 | 7,308 | 0,102 |
| audio8_eu_sft_v2 | 9,088 | 3,803 | 5,285 | 0,176 |
| antzoki-mini-tts (audio8_eu_sft_v4) | 9,183 | 3,806 | 5,378 | 0,177 |

Clonación de voz y robustez (8 frases nuevas × 2 voces de referencia reservadas + sin referencia, 8 semillas). SIM = similitud coseno de embeddings de hablante WavLM entre la salida y la referencia (grabaciones reales: 0,97 mismo hablante, 0,673 hablantes distintos). Se considera generación desbocada la que no tiene fin de habla o una velocidad inferior a 8 caracteres por segundo:

| Modelo | SIM ↑ | desbocadas con referencia | desbocadas sin referencia |
|---|---:|---:|---:|
| base (Audio8-TTS-Realistic-Air) | 0,968 | 8/128 (6 %) | 5/64 (8 %) |
| antzoki-mini-tts | 0,957 | 4/128 (3 %) | 8/64 (12 %) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 1,2 GB solo para pesos, más el overhead del códec y del procesador; una GPU con 8 GB es suficiente en la práctica.
- GPU recomendadas: RTX 5090 (usada en entrenamiento), RTX 4090, A100 o H100 para despliegues de mayor throughput; cualquier GPU consumer con al menos 8 GB de VRAM para inferencia individual.
- Cabe en GPU consumer: sí, incluidas RTX 3060/4060 de 8 GB en bf16.
- Despliegue en CPU sin Python ni GPU: build GGUF Q4_K_M en itzune/antzoki-mini-tts-GGUF para llama.cpp.
- Despliegue en GPU: transformers con `AutoModel` y `AutoProcessor` con `trust_remote_code=True`, o el CLI `audio8_tts_infer.py` del repositorio de Audio8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| antzoki-mini-tts | 601 M | no disponible (~150 caracteres por entrada) | eu | Apache 2.0 | Ajuste fino sobre Audio8; clonación zero-shot; experimental |
| Edge0/Audio8-TTS-Realistic-Air (base) | 0,6 B | no disponible | 23 idiomas (sin eu) | no disponible en la información proporcionada | Modelo base; mayor loss en euskera (12,730 frente a 9,183) y más generaciones desbocadas con referencia (6 % frente a 3 %) |
| audio8_eu_sft_v2 | no disponible | no disponible | eu | no disponible | Ejecución previa del mismo autor; loss ligeramente mejor (9,088) pero sin las mejoras de robustez de la v4 |

No se dispone de datos de benchmarks comparativos con otros sistemas TTS comerciales o de código abierto en la información proporcionada.

## Limitaciones y advertencias

- Corpus pequeño y de un solo dominio: 9,1 horas de habla leída de 50 hablantes. El habla espontánea, expresiva, los diálogos largos, los dialectos y el code-switching quedan fuera de distribución.
- Los acrónimos y nombres alfanuméricos (por ejemplo, `U2`, `AP-68`) se leen con nombres de dígitos en euskera, lo que produce pronunciaciones incorrectas.
- Generaciones desbocadas: algunas salidas no tienen fin de habla, contienen silencios largos o balbuceo. La tasa es del 3 % con referencia y del 12 % sin referencia. Se recomienda comprobar la duración y regenerar con otra semilla; el script `scripts/say.py` del repositorio de GitHub lo hace automáticamente.
- No hay parámetro de velocidad. Con referencia, el modelo copia en gran medida el ritmo de la referencia; sin referencia, el control es limitado.
- Es obligatorio normalizar el texto con `eu_normalize.normalize()`: el modelo nunca vio dígitos durante el entrenamiento.
- Mantener las entradas por debajo de unos 150 caracteres.
- Riesgo de alucinación acústica y de artefactos en palabras raras; el autor recomienda escuchar las muestras antes de usar el modelo.
- Sesgos: no documentados explícitamente en la información disponible; al entrenarse con un corpus crowdsourced de 50 hablantes, la diversidad de voces y acentos es limitada.
- Licencia Apache 2.0: permite uso comercial, pero el estado experimental y las limitaciones anteriores hacen necesaria una validación propia antes de producción.
- El modelo base se distribuye con `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar dicho código antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/itzune/antzoki-mini-tts
- Build GGUF Q4_K_M: https://huggingface.co/itzune/antzoki-mini-tts-GGUF
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air
- Repositorio de inferencia y pipeline (Audio8_TTS): https://github.com/Edge0-AI/Audio8_TTS
- Pipeline de entrenamiento: https://github.com/itzune/antzoki-mini-tts
- Dataset OpenSLR 76: https://www.openslr.org/76/
