# Piyush12344/zeuvia-whisper-tiny

## Resumen

Zeuvia Whisper Tiny es un ajuste fino (fine-tuning) del modelo Whisper Tiny de OpenAI, publicado por el usuario Piyush12344 en Hugging Face. Su propósito es servir como motor de reconocimiento automático del habla (ASR) para el asistente de voz "Zeuvia", entrenado específicamente sobre la voz del propietario y un conjunto de comandos, incluyendo la palabra de activación (wake word) "zeuvia". Según la model card, el modelo base no reconoce correctamente esa palabra, mientras que esta versión sí.

El modelo conserva la arquitectura encoder-decoder de tipo transformer propia de la familia Whisper, con 37.760.640 parámetros totales, lo que lo sitúa en la gama "tiny" de la familia (aproximadamente 39M de parámetros en su versión original). El repositorio ocupa 0,2 GB y los pesos se distribuyen en formato safetensors. Soporta los idiomas inglés (en) y hindi (hi) según las etiquetas declaradas.

Es relevante ahora por dos motivos: por un lado, demuestra el patrón habitual de personalización de Whisper para dominios muy concretos (wake words, comandos de voz, hablantes específicos); por otro, es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin benchmarks publicados, por lo que debe tratarse con cautela en cualquier evaluación de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny original: ventana de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Whisper Tiny, un transformer encoder-decoder diseñado para transcripción de audio a texto que procesa ventanas de audio de 30 segundos y genera tokens de texto de forma autorregresiva. La model card no detalla la configuración interna exacta (número de capas, dimensiones de atención, cabezas), pero al ser un fine-tuning de Whisper Tiny se asume la topología estándar de esa variante.

En cuanto al entrenamiento, la información disponible es mínima: la model card indica que se entrenó sobre la voz del propietario y comandos, incluyendo la wake word "zeuvia". No se especifica el número de tokens de audio, la composición del dataset, si hubo aumentación de datos, ni si se aplicaron técnicas de regularización o ajuste con RLHF/DPO (no aplicables habitualmente en ASR). Tampoco se documenta la estrategia de fine-tuning (congelación de capas, learning rate, épocas). Esta ausencia de detalle técnico es una limitación importante para reproducibilidad.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés y hindi, según las etiquetas del repositorio.
- Detección y transcripción correcta de la wake word "zeuvia", que el modelo base Whisper Tiny no reconoce adecuadamente según el autor.
- Transcripción de comandos de voz del propietario, presumiblemente en el dominio específico de uso del asistente.
- Integración con el pipeline `automatic-speech-recognition` de Hugging Face Transformers.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada más allá del propio ASR, ni modos de razonamiento extendido (thinking mode).
- Capacidad multilingüe limitada a los dos idiomas declarados (en, hi); no hay evidencia de otros idiomas.

## Casos de uso

- Asistente de voz personal "Zeuvia": el modelo se usaría como primera etapa del pipeline, transcribiendo la entrada de micrófono y detectando la wake word para activar el resto del sistema. Es adecuado porque fue entrenado explícitamente para esa palabra y la voz del propietario.
- Automatización doméstica por comandos de voz: transcripción de órdenes cortas ("enciende la luz", "pon música") en inglés o hindi, con baja latencia esperable al ser un modelo tiny.
- Prototipado de ASR en dispositivos de borde: por su tamaño reducido (37,7M de parámetros, repo de 0,2 GB), es viable ejecutarlo en CPU o GPUs de gama baja para pruebas de concepto.
- Investigación sobre personalización de Whisper: sirve como ejemplo de fine-tuning sobre un hablante concreto y una wake word, útil para estudiar el sobreajuste a dominio en modelos ASR pequeños.
- Transcripción de notas de voz personales en inglés o hindi: uso individual, no multiusuario, dado que el entrenamiento se centró en la voz del propietario.
- Evaluación comparativa de fine-tunings de Whisper Tiny: como referencia de partida para medir cuánto mejora un ajuste específico frente al modelo base en la detección de una palabra concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (37,7M de parámetros en fp32, aproximadamente 150 MB de pesos), la huella es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no hay recomendaciones del autor. Por tamaño, funciona en RTX 3060, RTX 4090, A100 o H100 sin problema; también es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~1 GB de VRAM libre, incluidas integradas modestas.
- Opciones de despliegue: Transformers (pipeline `automatic-speech-recognition`), potencialmente llama.cpp no aplica (no es un modelo de texto), y servidores de inferencia como TGI o vLLM no están documentados para este modelo; Whisper suele desplegarse con Transformers, faster-whisper o Whisper.cpp, aunque no hay confirmación de compatibilidad en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (audio) | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeuvia Whisper Tiny | 37,76M | no disponible (base: 30 s) | en, hi | no disponible | Hugging Face, 0 descargas |
| OpenAI Whisper Tiny | ~39M | 30 s | multilingüe | MIT (según OpenAI) | Amplia, muy usado |
| Whisper Base | ~74M | 30 s | multilingüe | MIT (según OpenAI) | Amplia |
| Whisper Small | ~244M | 30 s | multilingüe | MIT (según OpenAI) | Amplia |

La comparativa se limita a la familia Whisper porque no se dispone de información sobre otros fine-tunings equivalentes. La ventaja de Zeuvia es la detección de su wake word específica; la desventaja es la falta de licencia, benchmarks y documentación frente a las versiones oficiales.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es un riesgo legal relevante para producción.
- Entrenado sobre la voz de un único hablante: probable sobreajuste y rendimiento degradado con otras voces, acentos o condiciones acústicas distintas.
- Dominio muy restringido (comandos y wake word): no es un modelo ASR generalista; su uso fuera de ese dominio no está validado.
- Idiomas limitados a inglés e hindi; no hay evidencia de soporte para castellano ni otros idiomas.
- Sin benchmarks publicados: no hay métricas objetivas (WER, CER) que permitan evaluar su calidad frente al modelo base.
- Riesgo de alucinación en transcripciones: como todo modelo generativo de ASR, puede producir texto plausible no presente en el audio, especialmente con ruido o silencios.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.
- Documentación técnica insuficiente: no se detallan datos de entrenamiento, hiperparámetros ni estrategia de ajuste, lo que dificulta la reproducibilidad.
- Fecha de creación futura en los metadatos (2026-11-10): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Piyush12344/zeuvia-whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentación de Whisper en Hugging Face Transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- Modelo base Whisper Tiny en Hugging Face: https://huggingface.co/openai/whisper-tiny
