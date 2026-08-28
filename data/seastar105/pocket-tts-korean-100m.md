# seastar105/pocket-tts-korean-100m

## Resumen

Pocket-TTS Korean 100M es un modelo de síntesis de voz (text-to-speech) coreano de cero disparos (zero-shot) desarrollado por la comunidad (seastar105), no un lanzamiento oficial de Kyutai. Está diseñado para ser compatible con el paquete oficial de Pocket-TTS y su CLI, ofreciendo una alternativa ligera y desplegable para síntesis de voz en coreano con clonación de voz a partir de una muestra de audio. El modelo resuelve el problema de generar voz natural en coreano sin necesidad de entrenamiento específico por hablante, usando una arquitectura FlowLM con destilación de conocimiento.

El modelo cuenta con 109,5 millones de parámetros en total, repartidos entre un decodificador FlowLM de 89,4 millones y el codec neural Mimi de 20,1 millones. Es un estudiante de 6 capas destilado en profundidad desde el profesor coreano de 24 capas (300M) del mismo autor, lo que lo hace sustancialmente más pequeño y adecuado para despliegue en entornos con recursos limitados. El checkpoint publicado corresponde al paso 50.000 de entrenamiento con pesos EMA, en formato safetensors float32. Soporta una ventana de contexto de audio de 12,5 frames latentes por segundo a 24 kHz, y su tokenizador SentencePiece cuenta con 4.000 tokens.

Su relevancia actual radica en que ofrece una opción de TTS coreano de código abierto, con licencia CC-BY-4.0, que puede ejecutarse incluso en CPU, según el repositorio de entrenamiento asociado. Al estar basado en Pocket-TTS, hereda la capacidad de clonación de voz con una sola muestra de referencia y una integración sencilla con el ecosistema de la librería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pocket-TTS FlowLM con Lagrangian Self Distillation (LSD) y codec Mimi |
| Parametros totales | 109.502.146 (FlowLM: 89.447.809 + Mimi: 20.054.337) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 12,5 frames latentes por segundo a 24 kHz (sin limite explicito de tokens de audio) |
| Tipos de cuantizacion | No disponible (pesos publicados en float32) |
| Idiomas soportados | Coreano (principal); ingles, code-switching y otros no evaluados sistematicamente |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (float32) en formato Pocket-TTS |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pocket-TTS, que combina un decodificador FlowLM (un modelo de flujo basado en transformer) con el codec neural Mimi para la representacion de audio. El FlowLM tiene 6 capas transformer con dimension de modelo 1024 y 16 cabezas de atencion. El tokenizador de texto es un SentencePiece con 4.000 tokens entrenado para coreano. El audio se procesa en mono a 24 kHz con 12,5 frames latentes por segundo.

El entrenamiento se realizo mediante destilacion de profundidad (depth distillation) desde el profesor coreano de 24 capas (seastar105/pocket-tts-korean-300m). El estudiante se inicializo con el checkpoint ingles de 6 capas de Kyutai, se reinicio el embedding de texto para el tokenizador coreano y se transfirieron el embedding coreano entrenado y los heads de flujo/EOS congelados del profesor. El resto de la columna vertebral se optimizo contra el checkpoint final crudo del profesor.

Los datos de entrenamiento consistieron en habla coreana preparada de las fuentes Emilia y YODAS, con 918.609 utterances (2.276,88 horas) para entrenamiento y 9.472 utterances (23,00 horas) para validacion. No se realizo reconciliacion de transcripciones. El entrenamiento se ejecuto en 4 GPUs NVIDIA RTX 5090 con DDP, batch global de 64 (8 por GPU con acumulacion de gradiente 2), durante exactamente 50.000 pasos. Se uso AdamW con learning rate pico de 4e-4, weight decay 0.1, 1.000 pasos de warmup y decaimiento coseno a cero. El EMA decay fue 0.999 y no se uso duration bucketing. La compilacion estuvo habilitada.

## Capacidades

- Sintesis de voz en coreano de cero disparos (zero-shot): genera audio hablado a partir de texto y una muestra de voz de referencia (voice prompt) sin entrenamiento adicional.
- Clonacion de voz: puede imitar la identidad del hablante de la muestra de referencia, siempre que esta sea limpia y el hablante haya consentido.
- Compatibilidad con la libreria oficial Pocket-TTS: se puede usar tanto desde la CLI (`uvx pocket-tts`) como desde Python con `TTSModel`.
- Generacion de audio de 24 kHz en mono, con 12,5 frames latentes por segundo.
- Modelo ligero: 109M parametros en total, disenado para despliegue en entornos con recursos limitados, incluida CPU segun el repositorio asociado.
- No soporta tool calling ni funciones de agente; es exclusivamente un modelo de texto a voz.

## Casos de uso

- Asistentes de voz en coreano: integrar el modelo en un asistente personal o de atencion al cliente que responda en coreano con una voz consistente, usando una muestra de voz del agente o del usuario.
- Locucion automatizada para contenido multimedia: generar narraciones en coreano para videos, podcasts o audiolibros a partir de guiones, con control de la identidad vocal mediante una muestra de referencia.
- Accesibilidad: convertir texto en voz para personas con discapacidad visual o dificultades de lectura, ofreciendo una voz natural en coreano sin depender de servicios en la nube.
- Aplicaciones de aprendizaje de idiomas: generar ejemplos de pronunciacion coreana a partir de texto, usando diferentes voces para practicar la comprension auditiva.
- Doblaje de bajo coste: doblar videos o animaciones al coreano usando voces de actores que hayan dado su consentimiento, sin necesidad de estudio de grabacion.
- Prototipado rapido de productos de voz: probar conceptos de interaccion por voz en coreano en fases tempranas de desarrollo, gracias a su facil integracion con Pocket-TTS y su bajo requisito de hardware.

## Benchmarks y rendimiento

Se evaluaron cinco checkpoints crudos (pasos 10k, 20k, 30k, 40k, 50k) sobre los 500 items coreanos de zero-shot del conjunto `yuekai/CV3-Eval`. La generacion uso temperatura 0.3, CFG 2.0 y un paso de decodificacion LSD. La evaluacion incluyo CER (con y sin espacios) mediante Whisper large v3, similitud de hablante con WavLM base plus SV y calidad estimada con UTMOS.

| Checkpoint crudo | CER | CER sin espacios | Similitud WavLM | UTMOS | Silencios | Sin EOS | Tiempo de muro |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 10k | 8.9128% | 8.9309% | 0.88102 | 2.24684 | 0 | 2 | 2m 14s |
| 20k | 9.2871% | 9.3207% | 0.88482 | 2.27399 | 0 | 1 | 2m 28s |
| 30k | 8.2875% | 8.3405% | 0.88041 | 2.24292 | 0 | 2 | 2m 27s |
| 40k | 8.6794% | 8.7762% | 0.87908 | 2.21957 | 0 | 3 | 2m 28s |
| 50k | 9.2166% | 9.3035% | 0.87901 | 2.21900 | 0 | 5 | 2m 29s |

Nota: estas mediciones corresponden a checkpoints crudos de entrenamiento. El archivo publicado `model.safetensors` contiene los pesos EMA del paso 50k, que no fueron evaluados de forma independiente. El menor CER crudo se observo en el paso 30k, pero el archivo publicado es el checkpoint EMA final solicitado.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Dado el tamano de 109M parametros y 0.4 GB de peso en float32, se puede inferir que la inferencia es viable en GPU de consumo con al menos 4-6 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: el entrenamiento se realizo en NVIDIA RTX 5090 (4 unidades), pero para inferencia se espera que cualquier GPU moderna con soporte CUDA funcione. No se especifican modelos minimos.
- Compatibilidad con CPU: el repositorio de entrenamiento menciona "A TTS that fits in your CPU", lo que sugiere que puede ejecutarse en CPU, aunque sin datos de latencia concretos.
- Opciones de despliegue: se usa mediante el paquete oficial Pocket-TTS (CLI o Python). No se mencionan integraciones con vLLM, Ollama o TGI, que son tipicos para LLMs, no para TTS.
- Latencia y throughput: no disponible. Los tiempos de evaluacion (2-3 minutos para 500 items) son del proceso de evaluacion completo, no de inferencia individual.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| seastar105/pocket-tts-korean-100m | 109M | 24 kHz, 12.5 fps | Coreano | CC-BY-4.0 | safetensors |
| seastar105/pocket-tts-korean-300m | 300M (aprox.) | 24 kHz, 12.5 fps | Coreano | CC-BY-4.0 (presumible) | safetensors |
| kyutai/pocket-tts (original) | No disponible | No disponible | Ingles | No disponible | safetensors |

El modelo de 100M es una version destilada del de 300M, con 6 capas frente a 24. El original de Kyutai es para ingles y no se dispone de datos comparativos de rendimiento entre ellos. No hay benchmarks publicados que comparen directamente estos modelos en las mismas condiciones.

## Limitaciones y advertencias

- El modelo esta disenado principalmente para coreano. El ingles, el code-switching, numeros, abreviaturas, nombres raros y puntuacion inusual no fueron evaluados sistematicamente.
- En la evaluacion de 500 items, el checkpoint crudo final (50k) produjo 5 generaciones que alcanzaron el limite de 30 segundos sin emitir EOS. Esto podria indicar problemas ocasionales de terminacion.
- UTMOS es una estimacion automatica de calidad y puede ser menos fiable para coreano que para los datos con los que fue desarrollado.
- No se ha realizado un estudio de escucha humana, ni una auditoria de equidad demografica ni de robustez.
- La calidad de salida y la identidad del hablante dependen en gran medida de la limpieza, duracion y condiciones de grabacion de la muestra de voz de referencia. Se requiere consentimiento explicito del hablante para la clonacion de voz.
- El modelo procesa una sola solicitud a la vez; para sintetizar multiples utterances se recomienda mantener el modelo y el estado de voz cargados en memoria.
- Licencia CC-BY-4.0 permite uso comercial con atribucion, pero no se especifican restricciones adicionales en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seastar105/pocket-tts-korean-100m
- Repositorio de entrenamiento en GitHub: https://github.com/seastar105/pocket-tts-korean-training
- Sitio oficial de Pocket-TTS: https://pockettts.org/
- Paper asociado (arXiv 2509.06926): https://arxiv.org/abs/2509.06926
- Modelo profesor (300M): https://huggingface.co/seastar105/pocket-tts-korean-300m
