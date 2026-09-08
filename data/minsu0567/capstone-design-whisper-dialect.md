# minsu0567/Capstone-Design-Whisper-Dialect

## Resumen

El modelo `minsu0567/Capstone-Design-Whisper-Dialect` es un sistema de reconocimiento automático de voz (ASR) basado en la arquitectura Whisper, desarrollado por el usuario `minsu0567` como parte de un proyecto de fin de carrera (Capstone Design). Según el repositorio asociado, el modelo ha sido afinado para reconocer coreano estándar y variantes dialectales, y se integra en un sistema de control de vehículo por voz: la transcripción generada por Whisper se envía a un modelo Llama 3.2 que la convierte en comandos JSON ejecutables por un dispositivo Jetson Orin Nano.

El modelo cuenta con 808.878.080 parámetros y un tamaño de repositorio de 1,6 GB, con pesos en formato `safetensors`. Está publicado en Hugging Face con el pipeline `automatic-speech-recognition` y la etiqueta `endpoints_compatible`, lo que indica que puede desplegarse mediante los Inference Endpoints de la plataforma. La ficha del modelo en Hugging Face es una plantilla automática y no incluye información sobre licencia, idiomas ni datos de entrenamiento; no obstante, el repositorio de GitHub del autor aclara que el ámbito de uso es el reconocimiento de voz en coreano y sus dialectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 808.878.080 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano estandar y dialectos (segun el repositorio del autor; no especificado en la model card) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper, un transformer encoder-decoder diseñado originalmente para reconocimiento de voz multilingüe y traducción de audio. La implementación utiliza la librería `transformers` de Hugging Face y está etiquetada con el pipeline `automatic-speech-recognition`. No se dispone de información detallada sobre el procedimiento de entrenamiento, los datos utilizados ni los hiperparámetros empleados, ya que la model card no los documenta.

El repositorio de GitHub del autor indica que el modelo fue afinado (fine-tuned) para reconocer coreano estándar y dialectos, y que forma parte de un pipeline más amplio donde la transcripción se procesa con Llama 3.2 para generar comandos estructurados. No se menciona el uso de técnicas como RLHF, DPO ni decodificación especulativa. Tampoco se especifica la composición del dataset de entrenamiento ni el número de tokens o horas de audio empleadas.

## Capacidades

- Reconocimiento automático de voz (ASR) para coreano estándar y variantes dialectales, según el repositorio del autor.
- Generación de transcripciones de audio que pueden ser procesadas por un modelo de lenguaje (Llama 3.2) para extraer comandos estructurados en JSON.
- Compatibilidad con el pipeline `automatic-speech-recognition` de Hugging Face y con Inference Endpoints.
- No se documentan capacidades de tool calling, visión, audio multimodal ni soporte de agentes en el propio modelo.
- No hay información sobre soporte multilingüe más allá del coreano y sus dialectos.

## Casos de uso

- Control de vehículos por voz: el modelo transcribe comandos hablados en coreano o dialecto, y un sistema externo (Llama 3.2) los convierte en instrucciones JSON para que un dispositivo Jetson Orin Nano ejecute acciones sobre un coche teledirigido. Es el caso de uso documentado en el repositorio del autor.
- Transcripción de reuniones y entrevistas en coreano dialectal: el modelo puede utilizarse para generar actas o registros escritos de conversaciones donde los hablantes emplean variantes regionales, lo que resulta útil en entornos académicos o empresariales.
- Subtitulado automático de vídeos: la transcripción generada por el modelo puede integrarse en flujos de trabajo de producción audiovisual para crear subtítulos en coreano, incluyendo contenido con acentos dialectales.
- Asistente de voz para personas mayores: dado que muchos hablantes mayores utilizan dialectos, el modelo puede servir como base para asistentes que comprendan esas variantes y faciliten tareas cotidianas mediante comandos de voz.
- Investigación en dialectología: el modelo permite transcribir grabaciones de campo y corpus orales para analizar diferencias fonéticas y léxicas entre regiones, apoyando estudios lingüísticos.
- Accesibilidad para personas con discapacidad auditiva: la transcripción en tiempo real de audio en coreano dialectal puede alimentar sistemas de subtitulado en directo o aplicaciones de comunicación aumentativa.
- Registro de notas de voz en aplicaciones móviles: el modelo puede integrarse en apps de notas para convertir dictados en texto, con mejor tolerancia a acentos regionales que los modelos Whisper estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y el repositorio del autor tampoco proporciona comparativas numéricas con otros modelos de reconocimiento de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16, el modelo requiere aproximadamente 1,6 GB solo para los parámetros, más overhead de ejecución; se recomienda al menos 3-4 GB de VRAM para una inferencia estable. En fp32, la demanda asciende a unos 3,2 GB para los pesos.
- GPU recomendadas: el repositorio del autor indica que el sistema se ejecuta en un Jetson Orin Nano. En entornos de escritorio, cualquier GPU con 4 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060, T4) es suficiente para fp16.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de gama media y baja, siempre que se utilice una precisión de 16 bits.
- Opciones de despliegue: `transformers` (Hugging Face), Inference Endpoints de Hugging Face (según la etiqueta `endpoints_compatible`), y despliegue embebido en dispositivos como el Jetson Orin Nano.
- Latencia y throughput: no disponible. No se han publicado mediciones de rendimiento en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| minsu0567/Capstone-Design-Whisper-Dialect | 808.878.080 | No disponible | No disponible | Hugging Face |
| openai/whisper-medium | 769M | 30 segundos de audio | MIT | Hugging Face |
| openai/whisper-small | 244M | 30 segundos de audio | MIT | Hugging Face |

Los modelos `openai/whisper-medium` y `openai/whisper-small` son los modelos base de Whisper de tamaño comparable. El modelo de `minsu0567` es un fine-tuning de Whisper orientado a coreano dialectal, pero no se dispone de datos de rendimiento comparados, por lo que no es posible establecer una valoración objetiva frente a los modelos base.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos ni limitaciones técnicas; la información disponible es insuficiente para evaluar la equidad del modelo.
- No se han publicado resultados de evaluación, por lo que el rendimiento en tareas distintas al reconocimiento de voz en coreano dialectal es desconocido.
- La licencia no está disponible, lo que puede suponer una restricción para el uso comercial o la redistribución del modelo.
- El modelo está diseñado para coreano y sus dialectos; no se garantiza un funcionamiento correcto con otros idiomas.
- Al tratarse de un modelo Whisper afinado, hereda la limitación de ventana de contexto de audio de aproximadamente 30 segundos, aunque este dato no se especifica en la ficha.
- Existe riesgo de alucinación en la transcripción, especialmente con audio ruidoso o con habla solapada, un comportamiento conocido en los modelos Whisper.
- El modelo puede no generalizar bien a dialectos o acentos no presentes en los datos de entrenamiento, ya que no se dispone de información sobre la cobertura del dataset.

## Enlaces

- Hugging Face: https://huggingface.co/minsu0567/Capstone-Design-Whisper-Dialect
- Repositorio del proyecto: https://github.com/minsu0567/Capstone-Design
- Paper de Whisper: https://arxiv.org/abs/1910.09700
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
