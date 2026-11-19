# innkl24/f5-shan-tts-model

## Resumen

F5-TTS Shan es un modelo de síntesis de voz (text-to-speech) derivado de F5TTS_v1_Base, adaptado específicamente al idioma shan (shn), una lengua tai hablada principalmente en el estado de Shan, Birmania. Lo publica el usuario innkl24 en Hugging Face bajo una licencia CC BY-NC 4.0, lo que restringe su uso a fines no comerciales. El modelo emplea la librería f5-tts y se distribuye con un vocabulario "limpio" de 75 caracteres específicos del shan, junto con embeddings expandidos listos para fine-tuning.

El problema que aborda es la escasez de sistemas TTS de calidad para lenguas de bajos recursos como el shan, que habitualmente carecen de soporte en los motores comerciales. Al partir de F5TTS_v1_Base, hereda la arquitectura de flow matching con decodificación por difusión propia de la familia F5-TTS, aunque la información pública disponible no detalla el número de parámetros ni la longitud de contexto.

La relevancia actual reside en su carácter de modelo de nicho para una comunidad lingüística concreta y en su licencia no comercial, que lo orienta a investigación y proyectos de preservación lingüística más que a despliegues productivos. La model card es extremadamente escueta y no aporta datos de entrenamiento, benchmarks ni instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | F5-TTS (basada en F5TTS_v1_Base; flow matching con decodificación por difusión, según la familia F5-TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | shan (shn) |
| Licencia | CC BY-NC 4.0 |
| Formato de pesos | no disponible (repositorio de 2465.1 GB, librería f5-tts) |

## Arquitectura y entrenamiento

El modelo se presenta como un derivado de F5TTS_v1_Base, el checkpoint base de la familia F5-TTS. La model card indica únicamente que incorpora un vocabulario limpio de 75 caracteres exclusivamente shan y embeddings expandidos preparados para fine-tuning. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se detallan innovaciones técnicas adicionales más allá de la adaptación del vocabulario y los embeddings.

La arquitectura concreta (capas, dimensión oculta, mecanismo de atención) no está documentada en la información proporcionada. El tamaño del repositorio (2465.1 GB) sugiere la presencia de múltiples checkpoints o artefactos de entrenamiento, pero no permite inferir el número de parámetros del modelo.

## Capacidades

- Síntesis de voz (text-to-speech) para el idioma shan (shn).
- Vocabulario específico de 75 caracteres shan, lo que evita contaminación con caracteres de otros sistemas de escritura.
- Embeddings expandidos orientados a fine-tuning posterior sobre datos propios.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multilingües más allá del shan.
- No se documentan modos especiales (thinking, visión, audio de entrada) ni clonación de voz explícita en la información disponible.

## Casos de uso

- Preservación lingüística del shan: generar audiolibros y material didáctico en shan a partir de texto, aprovechando el vocabulario específico de 75 caracteres para una pronunciación consistente.
- Investigación en TTS de bajos recursos: servir como punto de partida para fine-tuning con corpus propios de shan, gracias a los embeddings expandidos incluidos.
- Accesibilidad para hablantes de shan: convertir texto digital (noticias, documentos) en audio para personas con dificultades de lectura.
- Locución para medios locales: producir narraciones sintéticas en shan para radios comunitarias o canales informativos de bajo presupuesto.
- Desarrollo de asistentes de voz en shan: integrar el modelo como backend TTS en aplicaciones de asistencia para hablantes de esta lengua.
- Evaluación comparativa de TTS multilingüe: usar el modelo como referencia en estudios sobre cobertura de lenguas tai en sistemas neuronales.
- Docencia de la lengua shan: generar ejemplos de pronunciación controlados para materiales de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el número de parámetros ni el tamaño de los pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es f5-tts; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje, no a TTS).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Idioma | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| F5-TTS Shan (innkl24) | shan (shn) | no disponible | no disponible | CC BY-NC 4.0 | Hugging Face |
| F5TTS_v1_Base (modelo base) | multilingüe (según familia F5-TTS) | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face |
| Alternativas TTS para lenguas tai | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohibido el uso comercial sin autorización expresa del titular.
- Model card muy escueta: no hay información sobre datos de entrenamiento, sesgos ni evaluación de calidad.
- Cobertura limitada al shan: no apto para otros idiomas sin reentrenamiento.
- Riesgo de alucinación acústica y errores de pronunciación en textos fuera del vocabulario de 75 caracteres.
- Sin benchmarks publicados: la calidad real del modelo no está verificada de forma independiente.
- Tamaño de repositorio muy elevado (2465.1 GB): puede implicar costes de almacenamiento y descarga considerables.
- No se documentan limitaciones de contexto ni de longitud de audio generado.
- Para producción comercial sería necesario contactar con el autor y negociar una licencia alternativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/innkl24/f5-shan-tts-model
- Repositorio F5-TTS (librería declarada): no disponible en la información proporcionada
- Paper de F5-TTS: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
