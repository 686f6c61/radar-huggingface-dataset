# Abittee/amharic-speech-to-text-efa-v1

## Resumen

Amharic Speech-to-Text EFA v1 es un modelo de reconocimiento automático del habla (ASR) especializado en amárico, desarrollado por Endrias F. Abitte en 2026. Se trata de un ajuste fino de facebook/w2v-bert-2.0, un modelo preentrenado de representación de audio basado en arquitectura wav2vec2-bert, adaptado mediante entrenamiento supervisado con decodificación CTC para transcribir audio en amárico a texto. El modelo está pensado como motor principal de la aplicación de dictado offline Amharic Dictate para Windows.

El modelo cuenta con 605.971.551 parámetros (aproximadamente 606 millones) y un tamaño de repositorio de 2,4 GB en formato safetensors. Se entrenó durante 3 épocas sobre 33.566 clips que suman 154 horas de audio, utilizando una única GPU RTX 5090 en unas 2 horas. Los datos proceden de los corpus WAXAL (amh_asr) y FLEURS (am_et), ambos de Google.

Su relevancia radica en cubrir una lengua con recursos limitados como el amárico con un modelo abierto, con licencia CC BY-SA 4.0 que permite uso comercial, y con métricas publicadas de WER y CER sobre conjuntos de test y validación. Es un modelo de nicho, orientado a dictado y transcripción, no a tareas generales de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-bert (encoder de audio transformer con CTC) |
| Parametros totales | 605.971.551 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada dependiente del procesador w2v-bert) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | amárico (am) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de facebook/w2v-bert-2.0 (licencia MIT, © Meta), un encoder de audio basado en la combinación de wav2vec 2.0 y arquitectura tipo BERT para representaciones de habla auto-supervisadas. Sobre esa base se añade una cabeza de clasificación CTC y se ajusta de forma supervisada para la tarea de reconocimiento de habla en amárico. La decodificación es CTC voraz (greedy), sin diccionario ni modelo de lenguaje externo, según indica el autor.

El entrenamiento consistió en 3 épocas sobre 33.566 clips (154 horas de audio) procedentes de los corpus WAXAL Amharic ASR (amh_asr, grabaciones de Digital Umuganda, CC BY-SA 4.0) y FLEURS Amharic (am_et, CC BY 4.0). Se realizó en una única RTX 5090 en aproximadamente 2 horas. No se menciona en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (ASR) en amárico a partir de audio de 16 kHz mono.
- Transcripción mediante decodificación CTC voraz, sin modelo de lenguaje ni diccionario externo.
- Integración como motor de dictado en la aplicación Amharic Dictate para Windows, que añade dictado en vivo, comandos de puntuación, corrección ortográfica y perfiles de voz por usuario.
- Uso mediante la librería transformers (AutoModelForCTC y AutoProcessor).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni generación de texto general.
- Capacidad multilingüe limitada exclusivamente al amárico según la metadata del modelo.

## Casos de uso

- Dictado offline en Windows: el modelo actúa como motor de la aplicación Amharic Dictate, transcribiendo voz a texto en local sin conexión, adecuado para usuarios que necesitan privacidad o trabajar sin red.
- Transcripción de reuniones y entrevistas en amárico: permite convertir grabaciones de audio de 16 kHz mono en texto para documentación posterior, con un WER de referencia del 24,4 % en test.
- Subtitulado y accesibilidad: generación de transcripciones para vídeos o contenido audiovisual en amárico, útil para personas con discapacidad auditiva o para indexación de contenido.
- Archivado y búsqueda de audio: transcripción de archivos de audio históricos o de archivo para permitir búsqueda por texto sobre el contenido hablado.
- Asistentes de voz y comandos por voz en amárico: integración del modelo como capa de reconocimiento en aplicaciones de voz, dado su tamaño moderado (606 M parámetros) y su capacidad de ejecución en una sola GPU consumer.
- Investigación en ASR de bajos recursos: el modelo sirve como línea base reproducible para experimentos con amárico, con datos de entrenamiento y métricas publicadas.
- Preprocesado para pipelines de NLP en amárico: conversión de audio a texto como paso previo a análisis de sentimiento, resumen o traducción.

## Benchmarks y rendimiento

Resultados publicados por el autor (salida cruda del modelo, decodificación CTC voraz, sin diccionario ni modelo de lenguaje):

| Conjunto de test | Clips | Horas | WER | CER |
|---|---|---|---|---|
| WAXAL + FLEURS Amharic test | 3.536 | 15,4 | 24,4 % | 9,6 % |
| WAXAL + FLEURS Amharic validation | 714 | 3,2 | 20,6 % | 7,6 % |

No se han publicado en la información disponible comparaciones con otros modelos en forma de tabla de benchmarks estándar (MMLU, HumanEval, GSM8K no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 606 M parámetros en fp32 el modelo ocupa aproximadamente 2,4 GB, por lo que cabe en GPUs consumer con 6-8 GB de VRAM o más.
- GPU recomendadas: el autor entrenó en una RTX 5090; para inferencia es suficiente una GPU consumer moderna (por ejemplo RTX 3060, RTX 4060, RTX 4090) o incluso CPU para dictado en tiempo real moderado.
- Cabe en GPU consumer: sí, dado el tamaño del modelo.
- Opciones de despliegue: transformers (AutoModelForCTC y AutoProcessor) según la model card; el autor no documenta vLLM, llama.cpp, Ollama ni TGI, que además no son el entorno habitual para modelos CTC de audio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Abittee/amharic-speech-to-text-efa-v1 | 605.971.551 | no disponible | amárico | CC BY-SA 4.0 | Hugging Face |
| facebook/w2v-bert-2.0 (base) | no disponible en la información | no disponible | multilingüe (preentrenado) | MIT | Hugging Face |
| Otros ASR para amárico | no disponible | no disponible | amárico | no disponible | no disponible |

No se dispone en la información proporcionada de métricas comparables de otros modelos ASR específicos para amárico, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Especializado exclusivamente en amárico; no soporta otros idiomas.
- Decodificación CTC voraz sin modelo de lenguaje ni diccionario: el WER puede mejorar con un modelo de lenguaje externo, pero el modelo base no lo incluye.
- WER del 24,4 % en test y 20,6 % en validación: margen de error considerable para producción en dominios distintos al de entrenamiento.
- Riesgo de alucinación o transcripciones erróneas en audio con ruido, acentos no representados o vocabulario técnico fuera del corpus de entrenamiento.
- Sesgos potenciales derivados de los corpus WAXAL y FLEURS, que pueden no representar toda la variabilidad dialectal del amárico.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución a Endrias F. Abitte y compartir adaptaciones bajo la misma licencia.
- El modelo base facebook/w2v-bert-2.0 tiene licencia MIT; las condiciones de los datos de entrenamiento (WAXAL CC BY-SA 4.0, FLEURS CC BY 4.0) deben respetarse en usos derivados.
- Sin datos publicados sobre cuantización, latencia ni throughput; conviene validar el rendimiento en el hardware objetivo antes de desplegar en producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Abittee/amharic-speech-to-text-efa-v1
- Modelo base: https://huggingface.co/facebook/w2v-bert-2.0
- Dataset WAXAL: https://huggingface.co/datasets/google/WaxalNLP
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
