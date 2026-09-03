# JJaysz/cohear-whisper-small-dysarthric

## Resumen

CoHear es un adaptador LoRA para el modelo de reconocimiento automático del habla (ASR) `openai/whisper-small`, desarrollado por Jingjing Lei (Archbishop Mitty High School) como parte del proyecto CoHear, centrado en hacer comprensible el habla difícil de entender. El modelo aborda un problema crítico: los sistemas de ASR estándar, entrenados mayoritariamente con habla típica, fallan estrepitosamente con el habla disártrica, un trastorno motor del habla asociado a parálisis cerebral, esclerosis lateral amiotrófica (ELA) u otras condiciones neurológicas.

El adaptador se ha ajustado con el corpus TORGO, que contiene habla disártrica de ocho hablantes adultos, y consigue reducir la tasa de error por palabra (WER) en el hablante más afectado del corpus del 84,4% al 34,6%, una reducción relativa del 59%. La arquitectura se basa en LoRA (Low-Rank Adaptation) aplicada a las proyecciones de atención del modelo Whisper-small, con solo 3,5 millones de parámetros entrenables (el 1,44% del total), lo que permite un ajuste extremadamente eficiente: el entrenamiento se completó en 2,5 horas en una CPU de portátil, sin GPU y sin coste económico.

La relevancia de este modelo radica en que demuestra que adaptar un sistema de ASR a habla atípica ya no requiere infraestructura de investigación avanzada, y que un modelo compartido entrenado con datos de varios hablantes puede superar al ajuste con datos personales del propio usuario, lo que sugiere que podría funcionar sin necesidad de inscripción previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small (Transformer encoder-decoder) + LoRA en `q_proj` y `v_proj` |
| Parametros totales | 245M (244M del modelo base + 3,5M entrenables LoRA) |
| Parametros activos | 245M (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | 480 frames de mel-spectrograma (~30 segundos de audio) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precision completa) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `openai/whisper-small`, un transformer encoder-decoder de 244M de parametros entrenado para ASR multilingue. Sobre el se ha aplicado LoRA, una tecnica de ajuste eficiente que congela los pesos del modelo base e inyecta matrices de bajo rango en las proyecciones de atencion. En este caso, LoRA se aplica unicamente a `q_proj` y `v_proj` con rango r=32, alpha=64 y dropout de 0,05, lo que anade solo 3,5M de parametros entrenables (1,44% del total).

El entrenamiento se realizo con el corpus TORGO, que contiene 2.651 utterances (152 minutos) de ocho hablantes con disartria (F01, F03, F04, M01-M05). Se usaron 3 epocas, una tasa de aprendizaje de 1e-3, batch de 8 con acumulacion de gradientes de 2, y el entrenamiento completo se ejecuto en CPU de portatil en 2,5 horas. Un hallazgo notable del proyecto es que el modelo multi-hablante supero al modelo ajustado solo con los datos del hablante objetivo (50,8% WER frente a 34,6% WER), lo que sugiere que el transferencia entre hablantes disartricos puede ser mas efectiva que los datos personales limitados.

## Capacidades

- Reconocimiento automatico del habla en ingles, especializado en habla disartrica adulta (paralisis cerebral, ELA).
- Reduccion significativa del WER frente al modelo base: del 84,4% al 34,6% en el hablante mas afectado del corpus TORGO.
- Mejora de la precision de palabras individuales: del 8,1% al 67,6% en el mismo hablante.
- Compatible con el ecosistema HuggingFace Transformers y PEFT: el adaptador puede cargarse, fusionarse con el modelo base y usarse con la API estandar de generacion.
- Requiere especificacion explicita del idioma (`language="en"`), ya que Whisper tiende a detectar incorrectamente el idioma en habla atipica.
- No soporta tool calling, agentes ni capacidades multimodales: es exclusivamente un modelo de ASR.

## Casos de uso

- Ayuda a la comunicacion para personas con disartria: el modelo puede transcribir el habla de un usuario con disartria en tiempo real, permitiendo que la persona revise y apruebe el texto antes de compartirlo. Es adecuado porque reduce el WER de forma drastica frente al modelo base, aunque no elimina los errores.
- Sistemas de comunicacion aumentativa y alternativa (CAA): integrable en aplicaciones de voz a texto para personas con paralisis cerebral o ELA, donde los ASR genericos fallan de forma sistematica.
- Asistente de escucha para interlocutores: en conversaciones con personas con disartria, el modelo puede proporcionar una transcripcion de apoyo al oyente, reduciendo la carga cognitiva de entender habla atipica.
- Investigacion en tecnologias de accesibilidad: el modelo sirve como punto de partida para estudiar tecnicas de adaptacion a habla atipica, especialmente el enfoque multi-hablante frente al ajuste por hablante individual.
- Transcripcion de material clinico grabado: puede transcribir sesiones de terapia del habla o evaluaciones clinicas grabadas en las que participen personas con disartria, siempre con supervision humana.
- Desarrollo de productos de voz para poblaciones con discapacidad motora: el adaptador puede integrarse en aplicaciones de domotica por voz, dictado o control de dispositivos para usuarios con disartria, donde los asistentes de voz convencionales no funcionan.

## Benchmarks y rendimiento

Los resultados se evaluaron en 59 utterances reservados del hablante M04, el mas afectado del corpus TORGO, con la misma normalizacion y sin que ninguna utterance de prueba se viera durante el entrenamiento.

| Modelo | Entrenado con | WER por frase | Precision de palabras |
|---|---|---|---|
| `whisper-small` (stock) | — | 84,4% | 8,1% (3/37) |
| + LoRA mono-hablante | M04 solo, 24 min | 50,8% | 54,1% (20/37) |
| **+ LoRA multi-hablante (este modelo)** | 8 hablantes, 152 min | **34,6%** | **67,6% (25/37)** |

El modelo base sin adaptar muestra una diferencia de ~16x en WER entre habla control (2,9%) y habla disartrica (48,0%) en el corpus TORGO, lo que evidencia el problema que este adaptador pretende resolver. La tasa de error escala con la severidad clinica: control 2,9%, leve 12,7%, moderada 29,5% y severa 77,8%.

## Requisitos de hardware

- Inferencia en CPU: el modelo fusionado (Whisper-small + LoRA) tiene 245M de parametros, por lo que puede ejecutarse en CPU sin problemas. El entrenamiento completo se realizo en CPU de portatil en 2,5 horas, lo que indica que la inferencia es viable en hardware modesto.
- VRAM estimada: aproximadamente 1-2 GB para inferencia en FP32, menos de 1 GB con cuantizacion a int8 o fp16. Cabe en cualquier GPU consumer moderna (GTX 1060 en adelante).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Una RTX 3060 o superior permitira inferencia en tiempo real sin problemas.
- Opciones de despliegue: el adaptador es compatible con HuggingFace Transformers y PEFT, por lo que puede desplegarse con cualquier servidor que soporte estas librerias. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que estan orientados a modelos de lenguaje, no a ASR.
- Latencia: no disponible en la informacion proporcionada, pero al tratarse de un modelo de 245M de parametros, la latencia en GPU moderna deberia ser inferior a 100 ms por utterance corta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER en M04 (TORGO) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `whisper-small` (stock) | 244M | 30 s | 84,4% | MIT | HuggingFace |
| + LoRA mono-hablante | 244M + 3,5M | 30 s | 50,8% | Apache 2.0 | no publicado |
| **CoHear (este modelo)** | 244M + 3,5M | 30 s | **34,6%** | Apache 2.0 | HuggingFace |
| `whisper-tiny` / `whisper-base` | 39M / 74M | 30 s | no disponible | MIT | HuggingFace |

La comparativa directa con otros modelos adaptados a habla disartrica no esta disponible en la informacion proporcionada. Los modelos Whisper de menor tamano (tiny, base) probablemente ofrecerian un rendimiento aun peor que whisper-small en habla disartrica, dado que su capacidad es menor.

## Limitaciones y advertencias

- El modelo se ha adaptado a solo ocho hablantes del corpus TORGO y no se ha validado su generalizacion a habla disartrica en general. No debe asumirse que funcionara con hablantes fuera de este conjunto.
- TORGO contiene disartria adquirida en adultos (paralisis cerebral, ELA). Los resultados no son transferibles a diferencias de habla relacionadas con el autismo, que implican apraxia y problemas de prosodia mas que debilidad motora, y producen errores inconsistentes que la adaptacion por hablante maneja mal.
- Aproximadamente el 75% de las utterances de TORGO son palabras individuales. El WER por frase y la precision de palabras individuales se reportan por separado; una media combinada no tendria sentido.
- No se ha realizado testing con sujetos humanos. Todos los resultados provienen de un corpus de investigacion; ninguna persona viva ha utilizado el modelo.
- Un WER del 34,6% significa que aproximadamente una de cada tres palabras en una frase sigue siendo incorrecta. El modelo asiste a un oyente, no lo reemplaza.
- Whisper alucina en clips cortos: en audio de una sola palabra muy breve, a veces inventa una frase completa. La salida no debe presentarse como verbatim sin revision.
- El modelo esta pensado como ayuda al oyente: el hablante debe revisar y aprobar la salida antes de compartirla. No debe utilizarse en decisiones medicas, procedimientos legales ni contextos donde un error de reconocimiento pueda tener consecuencias graves.
- El entrenamiento multi-hablante incluye datos del hablante de prueba (M04), por lo que no es un experimento de transferencia limpio. Se necesita una evaluacion leave-one-speaker-out para aislar la contribucion de la transferencia frente al volumen de datos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JJaysz/cohear-whisper-small-dysarthric
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset TORGO: no se proporciona enlace directo en la informacion disponible
- Pagina de Qualcomm para Whisper-Small (referencia del modelo base): https://huggingface.co/qualcomm/Whisper-Small
