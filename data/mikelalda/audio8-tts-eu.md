# mikelalda/audio8-tts-eu

## Resumen

audio8-tts-eu es un modelo de síntesis de voz (text-to-speech) especializado en euskara, publicado por el usuario mikelalda en Hugging Face. Se trata de un ajuste fino supervisado (SFT) de la rama AR lenta del modelo Edge0/Audio8-TTS-Realistic-Air, un sistema de arquitectura DualAR de 0,6 mil millones de parámetros que opera con un códec de audio a 44,1 kHz y soporte de clonación de voz zero-shot. El modelo base cubre 23 idiomas, pero el euskara no figura entre ellos, por lo que esta versión adapta el sistema a un idioma nuevo.

El modelo resuelve la ausencia de un TTS neuronal específico para euskara partiendo de un corpus de habla leída de OpenSLR 76. Con 6811 enunciados de entrenamiento (9,1 horas) y 50 hablantes, el ajuste se centra en la rama autorregresiva lenta mientras congela la rama rápida encargada del detalle acústico. El resultado es un modelo experimental, con licencia Apache 2.0, que hereda las capacidades de clonación de voz del modelo base y añade normalización de texto específica para euskara (números con sufijos de caso).

La relevancia actual radica en que amplía la cobertura lingüística de una familia de TTS moderna a una lengua minoritaria con pocos recursos, y lo hace con un coste de entrenamiento contenido (una sola RTX 5090 de 24 GB). No obstante, el propio autor lo etiqueta como experimental: el corpus es pequeño y de un único dominio, por lo que su uso en producción requiere validación auditiva previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DualAR (dos ramas autorregresivas: lenta y rápida) sobre códec de audio a 44,1 kHz |
| Parámetros totales | 601.159.424 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto recomendada por debajo de ~150 caracteres) |
| Tipos de cuantización | no disponible (entrenado y publicado en bfloat16) |
| Idiomas soportados | euskara (eu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DualAR del Audio8-TTS original: una rama autorregresiva lenta que predice tokens semánticos de audio y una rama rápida que genera el detalle acústico. En este ajuste solo se entrena la rama lenta; la rama rápida se mantiene congelada. El códec opera a 44,1 kHz, lo que permite una salida de alta fidelidad, y el sistema incorpora clonación de voz zero-shot mediante un audio de referencia y su transcripción exacta.

El entrenamiento se realizó sobre OpenSLR 76 (habla leída de euskara obtenida por crowdsourcing), tras filtrar hasta 6811 enunciados (9,1 horas) de 50 hablantes. Los hablantes `euf_07505` y `eum_01523` se reservaron para evaluación y nunca se usaron en entrenamiento. El preprocesado incluyó recorte de silencios, remuestreo a 44,1 kHz, normalización de sonoridad a −20 LUFS (pico de −1 dBFS) y filtrado de outliers de velocidad de habla. El 61 % de las filas de entrenamiento se emparejaron con otro enunciado del mismo hablante como prompt de referencia para la clonación. Se usó bf16, DeepSpeed ZeRO-2, una RTX 5090 (24 GB), learning rate de 1e-5, 2 épocas, batch de 4 con acumulación de gradiente de 4, warmup del 3 %, scheduler coseno y weight decay de 0,01, con parada temprana sobre `eval_loss`. El pipeline de entrenamiento está en el repositorio GitHub del autor (Audio8_TTS en el commit `aef426d`).

## Capacidades

- Síntesis de voz en euskara a partir de texto, con salida a 44,1 kHz.
- Clonación de voz zero-shot: acepta un audio de referencia y su transcripción para imitar el timbre y, en gran medida, el ritmo del hablante de referencia.
- Normalización de texto específica para euskara mediante `eu_normalize.normalize()`: convierte dígitos en palabras vascas conservando el sufijo de caso (por ejemplo, `2008an` → `bi mila eta zortzian`).
- Generación con muestreo configurable (temperatura, top-p, top-k) y decodificación de audio integrada en el modelo.
- No soporta tool calling ni function calling (es un modelo TTS).
- No dispone de modo de razonamiento, visión ni audio de entrada más allá del prompt de referencia para clonación.
- Multilingüismo limitado al euskara; no se ha validado para otros idiomas.

## Casos de uso

- Accesibilidad y lectura de contenidos en euskara: convertir artículos, avisos o documentación a voz para usuarios con discapacidad visual o para consumo en audio, aprovechando la normalización de números y sufijos de caso del idioma.
- Locución para medios digitales y podcasts en euskara: generar narraciones de textos breves (menos de ~150 caracteres por fragmento) con una voz consistente mediante clonación a partir de una grabación de referencia del locutor.
- Interfaces de voz para administraciones y servicios públicos vascos: integrar el modelo en asistentes telefónicos o chatbots con salida de voz en euskara, validando previamente la calidad en el dominio concreto.
- Prototipado de aplicaciones educativas: crear materiales de aprendizaje de euskara con pronunciación sintética, teniendo en cuenta que el corpus es de habla leída y el registro es formal.
- Doblaje y previsualización de vídeo: generar pistas de voz temporales en euskara para maquetas antes de contratar locución humana, usando la clonación para mantener el timbre del actor de referencia.
- Investigación en TTS para lenguas de bajos recursos: servir como punto de partida para ajustes posteriores con más datos o para estudiar la adaptación de arquitecturas DualAR a nuevas lenguas.
- Generación de audiolibros experimentales: sintetizar fragmentos de texto literario en euskara, con revisión auditiva obligatoria por el riesgo de generaciones descontroladas en entradas largas.

## Benchmarks y rendimiento

Evaluación con pérdida teacher-forced sobre 200 enunciados de los hablantes reservados (menor es mejor):

| Modelo | eval loss | slow loss | fast loss | slow acc |
|---|---:|---:|---:|---:|
| base (Audio8-TTS-Realistic-Air) | 12,730 | 5,423 | 7,308 | 0,102 |
| audio8_eu_sft_v2 | 9,088 | 3,803 | 5,285 | 0,176 |
| audio8_eu_sft_v4 (esta versión) | 9,183 | 3,806 | 5,378 | 0,177 |

Clonación de voz y robustez (8 frases nuevas × 2 voces de referencia reservadas + sin referencia, 8 semillas). SIM = similitud coseno de embeddings de hablante WavLM entre salida y referencia (grabaciones reales: 0,97 mismo hablante, 0,673 hablantes distintos). Una generación descontrolada no tiene fin de voz o presenta una velocidad inferior a 8 caracteres/s.

| Modelo | SIM ↑ | descontroladas con ref. | descontroladas sin ref. |
|---|---:|---:|---:|
| base (Audio8-TTS-Realistic-Air) | 0,968 | 8/128 (6 %) | 5/64 (8 %) |
| este modelo | 0,957 | 4/128 (3 %) | 8/64 (12 %) |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 601 M de parámetros y se publica en bfloat16, lo que supone aproximadamente 1,2 GB de pesos; con overhead de activaciones y códec, se puede ejecutar cómodamente en GPUs con 8 GB o más.
- GPU recomendadas: RTX 5090 (usada en entrenamiento), RTX 4090, A100 o H100 para mayor throughput; cualquier GPU consumer con al menos 8 GB de VRAM es suficiente para inferencia en bf16.
- Cabe en GPU consumer: sí, en RTX 3060/4060/4070/4080/4090 y equivalentes con 8 GB o más.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere el repositorio Audio8_TTS y `eu_normalize.py`), y el CLI `audio8_tts_infer.py` del repositorio GitHub. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audio8-tts-eu | 601 M | no disponible | eu | Apache 2.0 | Hugging Face |
| Edge0/Audio8-TTS-Realistic-Air (base) | 0,6 B | no disponible | 23 idiomas (sin eu) | no disponible en la información | Hugging Face |
| audio8_eu_sft_v2 (versión previa del autor) | 601 M | no disponible | eu | Apache 2.0 (presumible, misma familia) | no disponible como release independiente en la información |

No se dispone de datos de benchmarks comparativos con otros sistemas TTS en euskara (por ejemplo, modelos comerciales o de otras familias) en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor recomienda escuchar las muestras antes de usarlo y esperar errores en palabras raras, acrónimos y cambio de código.
- Corpus pequeño y de un solo dominio (frases leídas): el habla espontánea, expresiva, los dialectos y el code-switching quedan fuera de distribución.
- Los acrónimos y nombres alfanuméricos (`U2`, `AP-68`) se leen con nombres de dígitos en euskara, lo que puede producir resultados incorrectos.
- Riesgo de generaciones descontroladas (sin fin de voz, silencios largos o balbuceo), similar al modelo base; conviene comprobar la duración y regenerar con otra semilla. El script `scripts/say.py` del repositorio lo hace automáticamente.
- No hay parámetro de velocidad: con referencia, el modelo copia en gran medida el ritmo de la referencia; sin ella, el ritmo varía según la semilla.
- Los sonidos palatales *tt* / *dd* (*Antton*, *pottoka*) están casi ausentes en los datos de entrenamiento y suelen salir mal.
- El texto debe normalizarse siempre con `eu_normalize.normalize()`; el modelo nunca vio dígitos durante el entrenamiento.
- Mantener cada entrada por debajo de ~150 caracteres para evitar degradación.
- Licencia Apache 2.0 permite uso comercial, pero la calidad no está garantizada para producción sin validación adicional; el modelo base podría tener condiciones propias que conviene revisar.
- Riesgo de uso indebido de la clonación de voz: requiere consentimiento del hablante de referencia y cumplimiento de la normativa aplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikelalda/audio8-tts-eu
- Modelo base: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air
- Repositorio Audio8_TTS: https://github.com/Edge0-AI/Audio8_TTS
- Pipeline de entrenamiento: https://github.com/mikelalda/TTS_basque
- Dataset OpenSLR 76: https://www.openslr.org/76/
