# igunosalabs/Unose-Huen-Small

## Resumen

Unose-Huen-Small es un modelo de reconocimiento automático del habla (ASR) desarrollado por Igunosalabs, obtenido mediante fine-tuning de openai/whisper-small sobre audio en inglés nigeriano y pidgin nigeriano. Con 241.734.912 parámetros, mantiene la arquitectura encoder-decoder original de Whisper Small y está pensado para inferencia en CPU, GPU y dispositivos de borde, lo que lo hace atractivo para despliegues con recursos limitados en mercados africanos.

El modelo aborda un problema concreto: la baja cobertura de variedades del inglés no estándar y de lenguas criollas en los sistemas ASR comerciales. Al especializarse en inglés nigeriano y pidgin nigeriano, cubre un nicho que los modelos multilingües genéricos tienden a transcribir con alta tasa de error. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Es relevante ahora porque la demanda de transcripción precisa en mercados de África Occidental crece en sectores como atención al cliente, medios y servicios públicos, y porque el tamaño compacto (244M) permite ejecutarlo en hardware modesto sin depender de la nube. El repositorio ocupa 31 GB, lo que sugiere la presencia de checkpoints de entrenamiento además de los pesos finales en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (encoder-decoder transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana estandar de Whisper; no se especifica otra en la model card) |
| Tipos de cuantizacion | no disponible (no documentados por el autor) |
| Idiomas soportados | en (ingles nigeriano), pcm (pidgin nigeriano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder con 244M de parámetros diseñado para ASR y traducción de voz. El encoder procesa espectrogramas mel de 80 canales en ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. El fine-tuning se realizó sobre audio en inglés nigeriano y pidgin nigeriano, según indica la model card, aunque no se especifica el volumen de horas de audio, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos.

No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos híbridos. Tampoco se detalla si hubo etapas de RLHF o DPO, algo poco habitual en modelos ASR. El autor incluye logs de TensorBoard en el repositorio, lo que permite inspeccionar curvas de entrenamiento, pero la información pública sobre hiperparámetros, número de épocas o estrategia de congelación de capas es escasa.

## Capacidades

- Transcripción de voz a texto en inglés nigeriano y pidgin nigeriano.
- Reconocimiento de habla en ventanas de hasta 30 segundos, con la posibilidad de encadenar segmentos para audio más largo mediante el pipeline de transformers.
- Inferencia en CPU, GPU y dispositivos de borde gracias a su tamaño compacto.
- Integración directa con el pipeline `automatic-speech-recognition` de transformers.
- Soporte de los dos códigos de idioma declarados en la model card: `en` y `pcm`.
- No se documentan capacidades de traducción de voz, diarización de hablantes, detección de emociones ni tool calling.

## Casos de uso

- Transcripción de atención al cliente: el modelo puede convertir llamadas y mensajes de voz de usuarios nigerianos en texto para su análisis posterior, con mejor precisión que Whisper Small genérico en acentos locales.
- Subtitulado de contenido audiovisual: útil para medios nigerianos, creadores de contenido y plataformas que necesiten subtítulos en inglés nigeriano o pidgin sin depender de servicios en la nube.
- Servicios públicos y ONG: digitalización de entrevistas, encuestas y testimonios recogidos en pidgin nigeriano para programas de desarrollo, salud o educación.
- Asistentes de voz en dispositivos de borde: al caber en CPU y hardware modesto, permite desplegar dictado o comandos por voz en entornos con conectividad limitada.
- Análisis de conversaciones de contact center: transcripción por lotes para minería de opiniones, control de calidad y detección de temas en mercados de África Occidental.
- Investigación lingüística: generación de corpus transcritos de pidgin nigeriano para estudios sociolingüísticos y entrenamiento de modelos posteriores.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en comunidades que usan estas variedades lingüísticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,5 GB para los pesos, más overhead del runtime (del orden de 1-2 GB en total con transformers).
- VRAM estimada en FP32: alrededor de 1 GB para los pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, T4 o superiores. En A100 y H100 el modelo queda sobredimensionado en cuanto a memoria, aunque puede aprovecharse para procesamiento por lotes de alto throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (pipeline de ASR), vLLM no aplica de forma estándar para Whisper, llama.cpp no soporta Whisper de forma nativa, faster-whisper y whisper.cpp son alternativas viables si se convierten los pesos, y TGI no está orientado a ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Contexto de audio | Notas |
|---|---|---|---|---|---|
| igunosalabs/Unose-Huen-Small | 241,7M | en (nigeriano), pcm | Apache 2.0 | 30 s por ventana | Fine-tuning especializado en variedades nigerianas |
| openai/whisper-small | 244M | multilingüe (99 idiomas) | Apache 2.0 | 30 s por ventana | Modelo base; menor precisión en inglés nigeriano y pidgin |
| openai/whisper-base | 74M | multilingüe (99 idiomas) | Apache 2.0 | 30 s por ventana | Más ligero, pero menor calidad general |
| openai/whisper-medium | 769M | multilingüe (99 idiomas) | Apache 2.0 | 30 s por ventana | Mayor precisión, pero requiere más recursos |

## Limitaciones y advertencias

- El modelo solo cubre inglés nigeriano y pidgin nigeriano; su rendimiento en otras variedades del inglés o en otros idiomas no está garantizado y probablemente sea deficiente.
- No se han publicado métricas de error (WER, CER) ni comparaciones cuantitativas con el modelo base, por lo que la mejora real no está verificada de forma independiente.
- Riesgo de alucinación en audio con ruido, solapamiento de hablantes o acentos muy marcados, comportamiento heredado de la arquitectura Whisper.
- La ventana de 30 segundos obliga a segmentar audio largo; una segmentación deficiente puede degradar la transcripción.
- Sesgos potenciales derivados de la distribución del dataset de fine-tuning, que no se documenta; puede haber peor rendimiento en hablantes femeninas, infantiles o de regiones subrepresentadas.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales de Whisper.
- El repositorio de 31 GB incluye probablemente checkpoints intermedios; para producción conviene descargar solo los pesos finales en safetensors.
- No se documentan procesos de evaluación ética, red teaming ni mitigaciones de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/igunosalabs/Unose-Huen-Small
- Modelo base: https://huggingface.co/openai/whisper-small
- Demo del autor: https://robotics.dexx.systems/unose-demo
- Página del proyecto: https://robotics.dexx.systems/projects/unose
