# daegyeong48/whisper-small-ko-fall-help-ct2-int8

## Resumen

El modelo `daegyeong48/whisper-small-ko-fall-help-ct2-int8` es una versión optimizada para inferencia en CPU de un Whisper Small afinado para el reconocimiento de voz de emergencia en coreano, específicamente para detectar expresiones de caída y peticiones de ayuda. Fue desarrollado en el contexto de un proyecto capstone orientado a la detección de accidentes por caída en personas mayores que viven solas. El modelo parte de `seastar105/whisper-small-ko-zeroth`, un Whisper Small ya entrenado en coreano, y se le aplicó un afinamiento con LoRA sobre las proyecciones `q_proj` y `v_proj` del transformer.

El resultado se convirtió a formato CTranslate2 con cuantización INT8, lo que reduce el tamaño a aproximadamente 234,4 MB y permite su ejecución en CPU con baja latencia mediante la librería `faster-whisper`. Está pensado para su integración en sistemas de monitorización de voz en tiempo real, con una ventana de entrada de 5 segundos y audio mono a 16 kHz. El modelo está especializado en un vocabulario muy acotado (etiquetas `fall_related` y `help_direct`), por lo que no es adecuado para transcripción general de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (encoder-decoder Transformer, basado en OpenAI Whisper) |
| Parametros totales | no disponible (el modelo base Whisper Small tiene aproximadamente 244M, pero no se confirma en la documentación) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (Whisper usa ventanas de audio de 30 s, pero no se especifica en este modelo) |
| Tipos de cuantizacion | INT8 (CTranslate2) |
| Idiomas soportados | ko (coreano) |
| Licencia | no disponible |
| Formato de pesos | CTranslate2 (formato binario propio de CTranslate2) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper Small de OpenAI, un transformer encoder-decoder entrenado originalmente para reconocimiento de voz multilingüe. Sobre el modelo base `seastar105/whisper-small-ko-zeroth`, ya afinado para coreano, se aplicó un afinamiento adicional mediante LoRA (Low-Rank Adaptation) dirigido únicamente a las proyecciones `q_proj` y `v_proj` de las capas de atención. Este enfoque permite adaptar el modelo a un dominio específico con un coste computacional reducido y sin modificar los pesos originales.

Los datos de entrenamiento provienen del conjunto de datos de voz y sonidos de emergencia de AI Hub (Corea), seleccionando las muestras relevantes para caídas y peticiones de ayuda. Se utilizaron 5.000 muestras de AI Hub y 119 grabaciones propias, estas últimas repetidas 5 veces durante el entrenamiento, dando un total de 5.595 filas de entrenamiento. La validación se realizó con 1.000 muestras de AI Hub. El modelo se entrenó con etiquetas `fall_related` y `help_direct`. El resultado se convirtió a CTranslate2 con cuantización INT8 para su despliegue en CPU.

## Capacidades

- Reconocimiento automático de voz (ASR) en coreano, especializado en expresiones de caída y petición de ayuda.
- Detección de palabras clave relacionadas con emergencias (etiquetas `fall_related` y `help_direct`).
- Inferencia en CPU mediante `faster-whisper` con cuantización INT8.
- Entrada de audio de 16 kHz, mono, WAV de 16-bit PCM, con ventanas de 5 segundos para uso en tiempo real.
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face.
- No soporta traducción de voz ni identificación de idioma (se fija `language="ko"`).
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de transcripción.

## Casos de uso

- Detección de caídas en hogares de personas mayores que viven solas: el modelo se integra en un sistema de micrófono que captura audio continuo y activa una alerta cuando reconoce expresiones como "¡ayuda!" o sonidos de caída. Su baja latencia en CPU permite análisis en tiempo real.
- Sistemas de teleasistencia automatizada: puede utilizarse como capa de reconocimiento de voz en dispositivos de asistencia domiciliaria, enviando una señal a un centro de control cuando se detecta una petición de ayuda.
- Monitorización de pacientes en residencias: integrado en sistemas de vigilancia por voz, ayuda a detectar incidentes sin necesidad de pulsadores físicos.
- Investigación en procesamiento de voz de emergencia: sirve como modelo de referencia para experimentos sobre reconocimiento de habla en contextos de estrés o urgencia.
- Prototipos de asistentes de voz para emergencias: combinado con un sistema de respuesta automática, puede activar llamadas a servicios de emergencia tras verificar la transcripción.
- Pruebas de concepto en entornos académicos: el modelo está disponible públicamente y puede usarse para estudiar el impacto del fine-tuning con LoRA en modelos Whisper para dominios específicos.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación sobre un conjunto de 2.398 muestras (2.370 de AI Hub y 28 grabaciones propias), comparando el modelo afinado con el baseline Zeroth, ambos en las mismas condiciones (CPU, CTranslate2 INT8, `beam_size=1`). CER y WER son tasas de error (menor es mejor); la keyword recognition rate es el porcentaje de detección correcta de palabras clave.

| Modelo | CER | WER | Keyword recognition rate |
|---|---:|---:|---:|
| Zeroth baseline INT8 | 43,76 % | 83,83 % | 88,49 % |
| LoRA fine-tuned INT8 | 2,31 % | 6,51 % | 99,58 % |

Además, en las 28 grabaciones directas (no incluidas en el entrenamiento), el modelo final INT8 obtuvo CER 19,56 %, WER 35,71 % y keyword recognition rate 78,57 %. Estos valores son significativamente peores que los globales, lo que indica que el rendimiento en entornos reales con hablantes variados puede ser inferior.

## Requisitos de hardware

- Inferencia en CPU: el modelo está optimizado para CPU con CTranslate2 INT8; el tamaño de pesos es de aproximadamente 234,4 MB.
- No requiere GPU para inferencia; puede ejecutarse en procesadores de gama media o baja.
- Memoria RAM estimada: menos de 1 GB para el modelo en memoria (dependiendo del framework y overhead).
- Compatible con `faster-whisper`, que utiliza CTranslate2 como backend.
- No se proporcionan datos de latencia o throughput específicos, pero al ser un modelo small y cuantizado, es adecuado para aplicaciones de tiempo real en CPU.
- Opciones de despliegue: `faster-whisper` (Python), posible integración en servicios como Ollama o TGI si se convierte a otros formatos, aunque no se documenta.

## Comparativa con modelos similares

La comparativa se basa en los datos de la model card, que incluyen el modelo base Zeroth y el modelo afinado. No se dispone de datos de otros modelos Whisper en coreano para comparar directamente.

| Modelo | Formato | CER | WER | Keyword recognition |
|---|---|---|---|---|
| seastar105/whisper-small-ko-zeroth (baseline) | CTranslate2 INT8 | 43,76 % | 83,83 % | 88,49 % |
| daegyeong48/whisper-small-ko-fall-help-ct2-int8 | CTranslate2 INT8 | 2,31 % | 6,51 % | 99,58 % |

El modelo afinado mejora drásticamente el rendimiento en la tarea específica de detección de caídas y ayuda, aunque esa mejora se limita al dominio de emergencias y no es representativa de la transcripción general.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en expresiones coreanas de caída y petición de ayuda; no es adecuado para transcripción general o dictado.
- El rendimiento se degrada con pronunciaciones muy arrastradas, disartria, grabaciones a distancia o ruido ambiental elevado.
- La muestra de evaluación con grabaciones propias es muy pequeña (28 muestras), por lo que los resultados en entornos reales pueden variar considerablemente.
- No debe utilizarse como única fuente de decisión en situaciones de emergencia médica o de seguridad.
- La licencia no está especificada; antes de un uso comercial o redistribución, es necesario verificar las condiciones del modelo base y de los datos de entrenamiento (AI Hub).
- El modelo no incluye soporte para otros idiomas ni para tareas de traducción.
- Al estar cuantizado en INT8, puede haber pequeñas pérdidas de precisión respecto a la versión en punto flotante, aunque no se documentan diferencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daegyeong48/whisper-small-ko-fall-help-ct2-int8
- Modelo base (seastar105/whisper-small-ko-zeroth): https://huggingface.co/seastar105/whisper-small-ko-zeroth
- Repositorio de OpenAI Whisper (referencia de arquitectura): https://github.com/openai/whisper
- Página de Whisper Small en Hugging Face: https://huggingface.co/openai/whisper-small
