# seamon67/distil-large-v3.5

## Resumen

seamon67/distil-large-v3.5 es una cuantización a BF16 del modelo distil-whisper/distil-large-v3.5, publicada en Hugging Face por el usuario seamon67. El modelo original lo desarrolla el equipo de Distil-Whisper de Hugging Face (Bofeng Huang, Eustache Le Bihan, Steven Zheng y Vaibhav Srivastav), y es la versión destilada del encoder-decoder de OpenAI Whisper-large-v3 descrita en el paper "Robust Knowledge Distillation via Large-Scale Pseudo Labelling". Se trata de un sistema de reconocimiento automático de voz (ASR) en inglés con 756.405.760 parámetros (unos 756 M) y 1,5 GB de pesos en el repositorio.

El problema que resuelve es el de la transcripción de alta calidad con coste y latencia reducidos: frente a Whisper-large-v3-turbo, mantiene un factor de velocidad relativo RTFx de 1,46 y mejora el WER en formato corto (7,08 frente a 7,30 en OOD), cediendo alrededor de un punto porcentual en formato largo (11,39 frente a 10,25). Frente a distil-large-v3 mejora tanto en precisión (7,08 frente a 7,53 de WER OOD corto) como en velocidad, y está entrenado sobre 98.000 horas de datos públicos diversos, cuatro veces más que sus predecesores.

Su relevancia actual radica en dos factores: por un lado, es un reemplazo directo ("drop-in replacement") en los pipelines existentes de Whisper; por otro, al mantener el encoder congelado durante el entrenamiento, funciona como modelo draft en decodificación especulativa con Whisper-large-v3, lo que permite cargar solo dos capas de decodificador adicionales y obtener aproximadamente 2× de aceleración con salidas idénticas. La licencia MIT y las integraciones con faster-whisper, whisper.cpp, Candle y Transformers.js lo hacen apto para despliegue en producción y en el borde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper, destilado por conocimiento (knowledge distillation) |
| Parámetros totales | 756.405.760 (756 M) según los pesos en safetensors |
| Parámetros activos | No aplica: modelo denso, no es una arquitectura MoE |
| Longitud de contexto | Ventana de audio de 30 segundos por bloque (arquitectura Whisper). Audio largo mediante decodificación secuencial o por chunks; no es un contexto de texto medido en tokens |
| Tipos de cuantización | El repositorio contiene pesos BF16. Las integraciones listadas (faster-whisper/CTranslate2) permiten generar versiones en float16, int8 e int8_float16, y whisper.cpp permite exportar a GGUF |
| Idiomas soportados | Inglés (en) únicamente |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers); exportable a GGUF y CTranslate2 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un encoder de audio que convierte espectrogramas Mel en representaciones latentes y un decoder autorregresivo que genera texto. El modelo se obtuvo por destilación de conocimiento a partir de Whisper-large-v3, siguiendo la línea de trabajo de Distil-Whisper descrita en "Robust Knowledge Distillation via Large-Scale Pseudo Labelling". Durante el entrenamiento el encoder permanece congelado, de modo que solo se entrenan las capas del decoder; esta decisión es la que habilita su uso como modelo draft en decodificación especulativa, ya que en inferencia basta con cargar dos capas de decoder adicionales y recorrer el encoder una sola vez.

El entrenamiento utilizó más de 98.000 horas de datos públicos diversos (aproximadamente 4× más que las versiones anteriores de Distil-Whisper) y empleó un "patient teacher" con un calendario de entrenamiento extendido, junto con aumento de datos agresivo mediante SpecAugment. No se documenta en la información disponible el uso de RLHF ni de DPO, algo esperable en un sistema ASR. La innovación técnica destacable es la combinación de destilación con aumento de datos y encoder congelado, que habilita la decodificación especulativa con Whisper-large-v3 con salidas idénticas y ~2× más de velocidad.

## Capacidades

- Transcripción de voz a texto en inglés, tanto en formato corto (segmentos de hasta 30 segundos) como en formato largo mediante decodificación secuencial o por chunks.
- Reconocimiento robusto con datos fuera de distribución, gracias al uso de SpecAugment durante la destilación.
- Actuación como modelo draft en decodificación especulativa junto a Whisper-large-v3, con salidas idénticas al modelo grande.
- Integración con múltiples runtimes: transformers, whisper.cpp, faster-whisper (CTranslate2), OpenAI Whisper, Transformers.js y Candle.
- Compatible con los endpoints de Hugging Face (etiqueta endpoints_compatible) y con el pipeline automatic-speech-recognition.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del ASR, ni modo de razonamiento explícito.
- No se documenta soporte de traducción ni de más idiomas que el inglés.
- No se documenta diarización de hablantes ni marcas de tiempo a nivel de palabra en la propia model card (requerirían herramientas externas).

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa audio largo mediante decodificación secuencial o por chunks, de modo que una reunión completa puede transcribirse sin dividir manualmente el fichero, con un coste de cómputo inferior al de Whisper-large-v3.
- Subtitulado automático de vídeo y pódcast: con 756 M de parámetros y pesos BF16 de 1,5 GB, la generación de subtítulos puede ejecutarse en la misma máquina que codifica el vídeo, sin depender de APIs externas.
- Analítica de centros de contacto: al ser un 1,46× más rápido que Whisper-large-v3-turbo en términos relativos de RTFx y mantener un WER OOD de 7,08 en formato corto, permite transcribir grandes volúmenes de llamadas por hora de GPU para su posterior análisis de intenciones.
- Aceleración de pipelines ASR existentes basados en Whisper-large-v3: usarlo como modelo draft en decodificación especulativa mantiene las salidas idénticas y reduce aproximadamente a la mitad el tiempo de inferencia, sin cambiar el resultado final.
- Asistentes de voz y dictado en local: cabe en GPUs de gama de entrada y en CPU mediante whisper.cpp o faster-whisper, lo que permite desplegar dictado sin enviar audio a servicios externos.
- Indexación y búsqueda sobre archivos de audio: transcripción masiva de un corpus de pódcasts o grabaciones para construir un índice de texto buscable, aprovechando el rendimiento relativo del modelo frente a alternativas de 1.550 M de parámetros.
- Investigación en destilación y decodificación especulativa: al ser una cuantización BF16 del modelo base, sirve como punto de partida reproducible para estudiar el equilibrio precisión/velocidad en ASR.

## Benchmarks y rendimiento

Evaluación en formato corto (WER post-normalización; menor es mejor). Datos tomados de la model card del modelo original:

| Dataset | Tamaño (h) | large-v3 | large-v3-turbo | distil-v3 | distil-v3.5 |
|---|---|---|---|---|---|
| AMI | 8,68 | 15,95 | 16,13 | 15,16 | 14,63 |
| Gigaspeech | 35,36 | 10,02 | 10,14 | 10,08 | 9,84 |
| LS Clean | 5,40 | 2,01 | 2,10 | 2,54 | 2,37 |
| LS Other | 5,34 | 3,91 | 4,24 | 5,19 | 5,04 |
| Tedlium | 2,61 | 3,86 | 3,57 | 3,86 | 3,64 |
| Earnings22 | 5,43 | 11,29 | 11,63 | 11,79 | 11,29 |
| SPGISpeech | 100,00 | 2,94 | 2,97 | 3,27 | 2,87 |
| Media ID | — | 7,15 | 7,24 | 7,37 | 7,10 |
| Media OOD | — | 7,12 | 7,30 | 7,53 | 7,08 |
| Media total | — | 7,14 | 7,25 | 7,41 | 7,10 |

Resumen comparativo de parámetros, velocidad relativa y WER fuera de distribución:

| Modelo | Parámetros (M) | RTFx relativo | WER OOD corto | WER OOD largo |
|---|---|---|---|---|
| whisper-large-v3-turbo | 809 | 1,0 | 7,30 | 10,25 |
| distil-large-v3 | 756 | 1,44 | 7,53 | 11,6 |
| distil-large-v3.5 | 756 | 1,46 | 7,08 | 11,39 |

No se han publicado en la información disponible resultados de benchmarks para esta cuantización BF16 concreta; los datos anteriores corresponden al modelo base distil-whisper/distil-large-v3.5.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 o FP16, alrededor de 1,5 GB solo para pesos, más activaciones y caché de decodificación; en la práctica, entre 2 y 3 GB de VRAM.
- Cuantizado a int8 (CTranslate2) los pesos bajan a unos 0,8 GB; en GGUF con cuantizaciones de 4-5 bits, a unos 0,4-0,5 GB.
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM, incluidas GTX 1650, RTX 3050, RTX 3060, RTX 4060 y superiores. También es viable en CPU con whisper.cpp o faster-whisper.
- GPUs recomendadas para alto throughput en servidor: A100 (40 o 80 GB), H100, L40S y RTX 4090 o RTX 3090 para despliegues con batching.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), faster-whisper con CTranslate2, whisper.cpp, OpenAI Whisper, Transformers.js y Candle, según las integraciones documentadas en la model card.
- Latencia y throughput: la información disponible solo proporciona el RTFx relativo (1,46 frente a whisper-large-v3-turbo, que se toma como 1,0). No se publican valores absolutos de latencia ni de horas de audio por hora de GPU para esta cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER OOD corto | WER OOD largo | RTFx relativo | Licencia |
|---|---|---|---|---|---|---|
| distil-large-v3.5 (BF16, seamon67) | 756 M | Inglés | 7,08 | 11,39 | 1,46 | MIT |
| whisper-large-v3-turbo | 809 M | Multilingüe | 7,30 | 10,25 | 1,0 | MIT |
| distil-large-v3 | 756 M | Inglés | 7,53 | 11,6 | 1,44 | MIT |
| whisper-large-v3 | No disponible en la model card | Multilingüe | 7,12 | No disponible en la model card | No disponible en la model card | MIT |

El compromiso es claro: distil-large-v3.5 es más rápido y algo más preciso que large-v3-turbo en formato corto, pero cede cerca de un punto de WER en formato largo y no ofrece capacidades multilingües. Frente a distil-large-v3 supone una mejora simultánea en precisión y velocidad. Si se necesita transcripción multilingüe o el mejor WER posible en audio largo, whisper-large-v3 sigue siendo la referencia.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no soporta transcripción ni traducción en otros idiomas.
- Degradación en dominios de lectura limpia: en LibriSpeech Clean obtiene 2,37 de WER frente a 2,01 de large-v3, y en LibriSpeech Other 5,04 frente a 3,91; la destilación penaliza la precisión en condiciones de audio ya muy favorables.
- Peor rendimiento en formato largo que large-v3-turbo (11,39 frente a 10,25 de WER OOD), por lo que para transcripciones largas de máxima calidad puede ser preferible el modelo turbo.
- Los WER publicados son post-normalización (minúsculas, sin puntuación ni símbolos), por lo que el rendimiento en texto con formato real puede diferir.
- Riesgo de alucinación en segmentos sin habla, música o ruido intenso, un comportamiento conocido de la familia Whisper; la model card no documenta mitigaciones específicas para esta versión.
- Es una cuantización a BF16 realizada por un tercero (usuario seamon67) sobre el modelo oficial, con 0 descargas y 0 me gusta en el momento de la consulta: no hay garantía de mantenimiento, soporte ni validación independiente de la equivalencia numérica con el modelo base.
- Licencia MIT: permite uso comercial, modificación y redistribución, con la única obligación habitual de conservar el aviso de copyright y la licencia.
- Los datos de entrenamiento son públicos y etiquetados; pueden inducir sesgos de dominio, acento o vocabulario que no se cuantifican en la información disponible.
- Para producción con marcas de tiempo por palabra o diarización de hablantes harán falta herramientas adicionales, ya que no se documentan como capacidades nativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seamon67/distil-large-v3.5
- Modelo base (model card original): https://huggingface.co/distil-whisper/distil-large-v3.5
- Whisper-large-v3: https://huggingface.co/openai/whisper-large-v3
- Whisper-large-v3-turbo: https://huggingface.co/openai/whisper-large-v3-turbo
- Distil-large-v3: https://huggingface.co/distil-whisper/distil-large-v3
- Paper de destilación: https://arxiv.org/abs/2311.00430
- Paper del "patient" teacher: https://arxiv.org/abs/2106.05237
- Paper de SpecAugment: https://arxiv.org/abs/1904.08779
- Paper adicional citado en las etiquetas: https://arxiv.org/abs/1910.13267
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Normalizador de texto usado en la evaluación: https://github.com/openai/whisper/blob/main/whisper/normalizers/basic.py
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; el único resultado devuelto (un issue de ComfyUI sobre LTX 2.3 y errores de memoria) no guarda relación con el modelo.
