# Happenmasss/yanmo-correct-4b-cot-mlx-8bit

## Resumen

Yanmo Correct 4B CoT (MLX 8-bit) es un modelo de lenguaje especializado en la corrección de texto post-reconocimiento para sistemas de reconocimiento automático del habla (ASR). Lo desarrolla el usuario Happenmasss y parte del modelo base Qwen/Qwen3.5-4B, sobre el que se ha realizado un ajuste fino orientado a tareas de corrección de homófonos, restauración de puntuación y limpieza de disfluencias en chino y en contextos bilingües chino-inglés. El resultado se ha cuantizado a 8 bits en formato MLX para su ejecución en memoria unificada de Apple Silicon.

La relevancia del modelo reside en su enfoque vertical: no es un modelo de propósito general, sino un componente de postprocesado pensado para integrarse en interfaces de voz (IME por voz, dictado, transcripción en vivo). Incorpora separación de cadena de pensamiento en streaming mediante etiquetas `` y cacheo de prefijo KV del system prompt (`prompt_cache_key`), lo que reduce la latencia en escenarios de escritura por voz.

Con 4.205.751.296 parámetros y un repositorio de 4,5 GB, el modelo está pensado para Macs con memoria unificada suficiente (huella estimada de 4,7 a 5,3 GB). Existe una variante mayor de 9B destilada para equipos con 24 GB o más de memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit MLX (group_size=64, affine) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, 8-bit) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4.200 millones de parámetros. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La especialización declarada es la corrección post-ASR: corrección de homófonos en chino, restauración de puntuación y eliminación de disfluencias, con soporte bilingüe chino-inglés.

La innovación técnica destacable no está en la arquitectura del transformer, sino en el pipeline de inferencia: separación en streaming de la cadena de pensamiento mediante `` (`separate_reasoning: true`) y cacheo de prefijo KV del system prompt (`prompt_cache_key`) para reducir la latencia en dictado por voz. La cuantización a 8 bits con `group_size=64` y esquema affine está optimizada para el runtime MLX de Apple Silicon, no para GPUs convencionales.

## Capacidades

- Corrección de homófonos en chino en texto procedente de ASR.
- Restauración de puntuación en transcripciones sin puntuar.
- Limpieza de disfluencias (repeticiones, muletillas) en texto dictado.
- Corrección bilingüe chino-inglés en contextos de habla mixta.
- Razonamiento explícito en modo cadena de pensamiento con separación en streaming mediante ``.
- Cacheo de prefijo KV del system prompt para baja latencia en escritura por voz.
- Generación de texto conversacional (pipeline `text-generation`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-step: no disponible.
- Capacidades de visión o audio nativas: no disponibles (el modelo procesa texto; el audio lo aporta el sistema ASR externo).

## Casos de uso

- Dictado por voz en chino en Mac: el modelo recibe la salida cruda del ASR y devuelve texto corregido con homófonos resueltos y puntuación restaurada, aprovechando el cacheo de prefijo KV para mantener la latencia baja durante la escritura continua.
- IME por voz (teclado de entrada): integración como etapa de postprocesado entre el reconocedor y el campo de texto, con separación de la cadena de pensamiento para no mostrar el razonamiento al usuario.
- Transcripción de reuniones bilingües chino-inglés: limpieza de disfluencias y normalización de puntuación sobre la salida de un ASR, adecuado por su soporte declarado de ambos idiomas.
- Subtitulado y postproducción de vídeo: corrección por lotes de transcripciones antes de publicar subtítulos, reduciendo errores de homófonos típicos del ASR en chino.
- Asistentes de voz locales en Apple Silicon: despliegue en el propio dispositivo gracias a la cuantización 8-bit MLX y a la huella de memoria unificada de 4,7-5,3 GB, sin depender de la nube.
- Preprocesado para pipelines de NLP: normalización de texto dictado antes de tareas posteriores (búsqueda, resumen, traducción), donde la puntuación y la corrección de homófonos mejoran la calidad de la entrada.
- Prototipado de corrección ASR en equipos con 24 GB o más de memoria unificada: uso de la variante 9B destilada cuando se requiere mayor precisión que la que ofrece esta variante de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Huella de memoria unificada estimada por el autor: aproximadamente 4,7-5,3 GB en Apple Silicon con runtime MLX 8-bit.
- Hardware objetivo: Macs con Apple Silicon (memoria unificada). No está pensado para GPUs NVIDIA ni para CUDA.
- Cabe en equipos consumer de Apple Silicon con al menos 8 GB de memoria unificada, aunque se recomienda margen adicional para el contexto y el sistema.
- Despliegue: runtime MLX (acpm-desktop / AcpmRuntime según la model card). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor menciona baja latencia para escritura por voz gracias al cacheo de prefijo KV, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Yanmo Correct 4B CoT (MLX 8-bit) | 4.205.751.296 | no disponible | safetensors MLX 8-bit | no disponible | Especializado en corrección post-ASR zh/en |
| Yanmo Correct 9B CoT (MLX 8-bit) | no disponible (variante 9B) | no disponible | safetensors MLX 8-bit | no disponible | Variante destilada mayor, para 24 GB+ de memoria unificada |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | safetensors | no disponible | Modelo base de propósito general; sin ajuste específico de corrección ASR |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera de la corrección post-ASR en chino/inglés no está documentado.
- Idiomas limitados a chino e inglés; no se declara soporte de castellano ni de otras lenguas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Verificar antes de desplegar en producción.
- Dependencia del runtime MLX y de Apple Silicon: no es desplegable directamente en GPUs NVIDIA ni en entornos CUDA estándar.
- La cuantización 8-bit puede introducir degradación frente al modelo en precisión completa; no se aportan métricas de esa pérdida.
- Riesgo de alucinación inherente a los modelos generativos: en tareas de corrección puede reescribir contenido más allá de lo necesario si no se acota el prompt.
- El modelo base Qwen3.5-4B puede arrastrar sesgos de sus datos de entrenamiento; no se documentan evaluaciones de sesgo.
- Longitud de contexto no disponible: planificar el despliegue con cautela en transcripciones largas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Happenmasss/yanmo-correct-4b-cot-mlx-8bit
- Variante 9B: https://huggingface.co/Happenmasss/yanmo-correct-9b-cot-mlx-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
