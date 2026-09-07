# Jinstudio/whisper-base.en

## Resumen

Whisper base.en es un modelo de reconocimiento automático de voz (ASR) desarrollado por OpenAI y re-subido al Hub por el usuario Jinstudio. Se trata de un checkpoint de la familia Whisper, concretamente la variante base en inglés, que utiliza una arquitectura Transformer encoder-decoder (sequence-to-sequence) y fue entrenado con 680 000 horas de audio etiquetado mediante supervisión débil. El modelo está diseñado para transcribir audio en inglés y destacar por su capacidad de generalización a distintos dominios sin necesidad de fine-tuning.

Con 72 593 408 parámetros, este checkpoint es una opción ligera dentro de la familia Whisper, situándose entre los modelos tiny (39 M) y small (244 M). Su tamaño reducido lo hace apto para despliegues en entornos con recursos limitados, tanto en CPU como en GPU de consumo. La licencia Apache 2.0 permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 72 593 408 |
| Parametros activos | No aplica (no es modelo MoE) |
| Longitud de contexto | No disponible (procesa audios de hasta 30 segundos por pasada) |
| Tipos de cuantizacion | No disponible (compatible con cuantizaciones de Transformers o whisper.cpp) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, pytorch, tf, jax |

## Arquitectura y entrenamiento

Whisper base.en es un modelo Transformer encoder-decoder. El codificador convierte los log-Mel spectrograms del audio en una representacion latente, y el decodificador genera la transcripcion token a token. El entrenamiento se realizo sobre 680 000 horas de audio etiquetado, recopilado de multiples fuentes y anotado con supervision debil. Esta estrategia permite que el modelo generalice a nuevos datasets y dominios sin necesidad de ajuste fino.

La innovacion principal de Whisper radica en su enfoque de escala y en el uso de supervision debil a gran escala, lo que le confiere robustez frente a ruido, acentos y variaciones en la calidad del audio. Este checkpoint es exclusivamente para reconocimiento de voz en ingles; no realiza traduccion de voz ni identificacion de idioma, funciones reservadas a los checkpoints multilingues.

## Capacidades

- Transcripcion de audio en ingles a texto.
- Reconocimiento automatico de voz (ASR) con buena tolerancia a ruido y variaciones de habla.
- Procesamiento de muestras de audio de hasta 30 segundos por pasada.
- Integracion con el ecosistema de Transformers de Hugging Face mediante `WhisperProcessor` y `WhisperForConditionalGeneration`.
- No soporta traduccion de voz ni reconocimiento en otros idiomas.
- No dispone de capacidades de tool calling, agentes ni razonamiento de multiples pasos, al ser un modelo puramente de audio.

## Casos de uso

- Transcripcion de reuniones en ingles: el modelo puede generar actas automaticas a partir de grabaciones de audio, facilitando la documentacion en entornos corporativos.
- Subtitulado automatico de videos: se puede integrar en pipelines de produccion para generar subtitulos en ingles de forma automatizada, reduciendo costes de postproduccion.
- Asistente de dictado para profesionales: medicos, abogados o periodistas pueden dictar informes y notas, y el modelo transcribe el audio en tiempo real o en diferido.
- Analisis de llamadas de atencion al cliente: transcribir grabaciones de llamadas para posterior analisis de sentimiento, deteccion de problemas recurrentes o cumplimiento normativo.
- Accesibilidad para personas con discapacidad auditiva: el modelo puede convertirse en una herramienta de transcripcion en vivo para eventos, clases o servicios de atencion presencial.
- Preprocesamiento de audio en pipelines de NLP: transformar audio a texto para alimentar modelos de analisis de texto, como resumen, clasificacion o extraccion de entidades.

## Benchmarks y rendimiento

| Dataset | Metrica | Resultado | Verificado |
|---|---|---|---|
| LibriSpeech (clean) | Test WER | No disponible | No |
| LibriSpeech (other) | Test WER | 12.80 | No |

Los resultados presentados en el model-index son declarados por el autor del modelo y no estan verificados. No se han encontrado benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1–2 GB en FP32 (los pesos ocupan ~290 MB, mas activaciones y log-Mel spectrograms).
- GPU recomendadas: NVIDIA T4, RTX 3060, GTX 1080 o superiores. Tambien funciona correctamente en CPU.
- Compatible con GPU de consumo, incluidas las de gama baja.
- Opciones de despliegue: Transformers de Hugging Face, whisper.cpp para inferencia en CPU, y pipelines personalizados en Python.
- Latencia y throughput estimados: no disponibles. En una GPU moderna, el modelo base procesa audio mas rapido que en tiempo real, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jinstudio/whisper-base.en | 72.6 M | Ingles | 30 s | Apache 2.0 | Hub de Hugging Face |
| openai/whisper-base.en | 74 M | Ingles | 30 s | Apache 2.0 | Hub de Hugging Face |
| openai/whisper-tiny.en | 39 M | Ingles | 30 s | Apache 2.0 | Hub de Hugging Face |
| openai/whisper-small.en | 244 M | Ingles | 30 s | Apache 2.0 | Hub de Hugging Face |

El modelo Jinstudio/whisper-base.en es funcionalmente equivalente a openai/whisper-base.en, con una diferencia marginal en el conteo de parametros. La alternativa mas cercana es el checkpoint original de OpenAI, que cuenta con verificacion de benchmarks y una base de usuarios mayor.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles: no reconoce otros idiomas ni traduce audio.
- El modelo no verifica los resultados de benchmarks; el WER declarado para LibriSpeech (other) no esta confirmado.
- Riesgo de alucinacion en audio con ruido intenso, musica de fondo o superposicion de voces.
- El autor del repositorio es Jinstudio, no OpenAI, por lo que no existe garantia de que los pesos sean identicos al checkpoint original.
- No se han publicado estudios de sesgos ni de rendimiento en dominios especificos en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los pesos coinciden con los del modelo original antes de desplegarlo en produccion.

## Enlaces

- Hugging Face (repositorio del modelo): https://huggingface.co/Jinstudio/whisper-base.en
- Hugging Face (modelo original de OpenAI): https://huggingface.co/openai/whisper-base.en
- Codigo fuente original de Whisper: https://github.com/openai/whisper
- Paper de referencia: https://arxiv.org/abs/2212.04356
