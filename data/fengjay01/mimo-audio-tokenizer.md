# fengjay01/MiMo-Audio-Tokenizer

## Resumen

MiMo-Audio-Tokenizer es el componente de tokenización de audio del proyecto MiMo-Audio, desarrollado por Xiaomi (equipo XiaomiMiMo). Se trata de un transformer de 1.200 millones de parámetros que opera a 25 Hz y emplea una pila RVQ (residual vector quantization) de ocho capas para producir 200 tokens por segundo. Su función es convertir audio continuo en una secuencia discreta de tokens que un LLM pueda modelar, y reconstruir audio a partir de esos tokens.

El tokenizador se entrena desde cero sobre un corpus de diez millones de horas, optimizando de forma conjunta objetivos semánticos y de reconstrucción. Es la pieza que habilita el resto de la familia MiMo-Audio (los modelos 7B Base e Instruct), que combinan un patch encoder, un LLM y un patch decoder para reducir la secuencia de 25 Hz a 6,25 Hz antes de entrar en el LLM. Esta ficha cubre únicamente el tokenizador publicado en el repositorio `fengjay01/MiMo-Audio-Tokenizer`, un espejo del original `XiaomiMiMo/MiMo-Audio-Tokenizer`.

Es relevante ahora porque el proyecto MiMo-Audio plantea que el escalado de pretraining en audio permite aprendizaje few-shot, y el tokenizador es la infraestructura sobre la que se sustenta esa hipótesis. Sin un tokenizador de alta calidad y baja tasa, el modelado lingüístico del audio a escala no es viable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pila RVQ de 8 capas; opera a 25 Hz y genera 200 tokens por segundo |
| Parametros totales | 1.295.799.574 (aprox. 1,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tokenizador agnóstico de idioma a nivel de audio) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tokenizador es un transformer de 1,2B parámetros que procesa audio a una tasa de 25 Hz y produce una secuencia de 200 tokens por segundo mediante una pila RVQ de ocho capas. La cuantización residual por capas permite representar el audio con una granularidad progresiva: cada capa codifica el residuo que deja la anterior, de modo que las primeras capas capturan información gruesa y las últimas el detalle fino.

El entrenamiento se realiza desde cero sobre un corpus de diez millones de horas de audio, optimizando conjuntamente objetivos semánticos y de reconstrucción. Esa combinación busca que los tokens no solo permitan reconstruir la señal, sino que también resulten útiles para el modelado lingüístico posterior. En el pipeline completo de MiMo-Audio, un patch encoder agrega cuatro pasos temporales consecutivos de tokens RVQ en un único patch, reduciendo la secuencia a 6,25 Hz para el LLM, y un patch decoder regenera la secuencia completa de 25 Hz mediante un esquema de generación retardada.

## Capacidades

- Tokenización de audio a 200 tokens por segundo con representación RVQ de ocho capas.
- Reconstrucción de audio a partir de tokens, con calidad de reconstrucción destacada según el autor.
- Objetivo semántico compartido con el objetivo de reconstrucción, orientado a facilitar el modelado lingüístico downstream.
- Integración como componente del pipeline MiMo-Audio (patch encoder, LLM y patch decoder).
- Capacidad de servir de base para tareas de comprensión de audio y habla dentro de la familia MiMo-Audio.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible (corresponde a los modelos 7B, no al tokenizador).
- Capacidades multilingües: no disponible.

## Casos de uso

- Tokenización de corpus de audio a gran escala: el tokenizador convierte horas de audio en secuencias discretas de 200 tokens por segundo, lo que permite alimentar pipelines de entrenamiento de LLMs de audio con representaciones compactas y uniformes.
- Preprocesamiento para modelos de lenguaje de audio: al reducir la señal a una secuencia RVQ de 25 Hz, se puede integrar en arquitecturas que necesitan alinear audio y texto en una misma secuencia de tokens.
- Reconstrucción y verificación de calidad: permite decodificar los tokens generados por un LLM de audio y comprobar la fidelidad de la señal reconstruida, útil en evaluación de sistemas TTS y de diálogo hablado.
- Investigación en cuantización residual: la pila RVQ de ocho capas sirve como referencia para estudiar el equilibrio entre tasa de bits, calidad de reconstrucción y utilidad semántica.
- Base para experimentos de aprendizaje few-shot en audio: al ser el componente de representación del proyecto MiMo-Audio, permite reproducir los experimentos de generalización a tareas no vistas descritos en el informe técnico.
- Desarrollo de demos interactivas: el repositorio oficial incluye una app Gradio que carga el tokenizador junto con MiMo-Audio-7B-Instruct para probar el pipeline completo de forma local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que MiMo-Audio-7B-Base alcanza SOTA en benchmarks de inteligencia del habla y comprensión de audio entre modelos open source, pero no se aportan cifras concretas para el tokenizador ni para los modelos 7B en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,2B parámetros, en fp16 serían aproximadamente 2,6 GB de pesos, y en cuantizaciones de 8 bits o 4 bits bajaría a rangos de 1,3 GB y 0,7 GB respectivamente (estimación a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? Por tamaño de parámetros, es probable que sí en GPUs consumer con suficiente VRAM, pero el autor no lo confirma.
- Opciones de despliegue: el repositorio oficial proporciona scripts de inferencia (`inference_example_pretrain.py`, `inference_example_sft.py`) y una app Gradio (`run_mimo_audio.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de tokens | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-Audio-Tokenizer | 1,2B | no disponible | 200 tok/s (25 Hz) | MIT | Hugging Face |
| Tokenizadores de audio de la familia EnCodec | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| Tokenizadores de audio de la familia SoundStream | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La información pública del repositorio es escasa: no se documentan contexto, cuantizaciones soportadas, idiomas ni benchmarks del tokenizador.
- El repositorio `fengjay01/MiMo-Audio-Tokenizer` es un espejo con 0 descargas y 0 likes; el repositorio de referencia es `XiaomiMiMo/MiMo-Audio-Tokenizer`, por lo que conviene verificar la procedencia y las actualizaciones en el original.
- Es un componente de tokenización, no un modelo de lenguaje: no genera texto, no razona y no soporta tool calling por sí mismo.
- Riesgo de alucinación: no aplica directamente al tokenizador, pero sí a los modelos 7B que lo consumen.
- Sesgos: no documentados en la información disponible; al entrenarse sobre diez millones de horas de audio, es esperable que herede sesgos de distribución del corpus, aunque el autor no los detalla.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del proyecto MiMo-Audio completo y de los modelos 7B asociados.
- Para producción, es necesario validar la calidad de reconstrucción en el dominio concreto de audio (habla, música, ruido) antes de desplegar.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/fengjay01/MiMo-Audio-Tokenizer
- Hugging Face (original): https://huggingface.co/XiaomiMiMo/MiMo-Audio-Tokenizer
- Colección MiMo-Audio en Hugging Face: https://huggingface.co/collections/XiaomiMiMo/mimo-audio-68cc7202692c27dae881cce0
- Repositorio GitHub: https://github.com/XiaomiMiMo/MiMo-Audio
- Informe técnico: https://github.com/XiaomiMiMo/MiMo-Audio/blob/main/MiMo-Audio-Technical-Report.pdf
- Blog oficial: https://xiaomimimo.github.io/MiMo-Audio-Demo
- Toolkit de evaluación: https://github.com/XiaomiMiMo/MiMo-Audio-Eval
- Modelo MiMo-Audio-7B-Base: https://huggingface.co/XiaomiMiMo/MiMo-Audio-7B-Base
- Modelo MiMo-Audio-7B-Instruct: https://huggingface.co/XiaomiMiMo/MiMo-Audio-7B-Instruct
