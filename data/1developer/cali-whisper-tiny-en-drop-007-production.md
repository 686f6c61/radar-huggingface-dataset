# 1Developer/cali-whisper-tiny.en-drop-007-production

## Resumen

El modelo `cali-whisper-tiny.en-drop-007-production` es un sistema de reconocimiento automático del habla (ASR) desarrollado por el usuario 1Developer, que parte de un fine-tuning previo del mismo autor (`cali-whisper-tiny.en-drop-006-production`) y se ajusta sobre un dataset local etiquetado como `audiofolder`. Por el nombre y la arquitectura subyacente (Whisper), está orientado a la transcripción de audio en inglés, aunque esta información no está declarada explícitamente en la model card.

Con 37.760.256 parámetros, se sitúa en la categoría de modelos tiny (similar al Whisper tiny original, ~39M), lo que lo hace ligero y apto para entornos con recursos limitados. El autor declara una pérdida de 0.0 y un WER de 0.0 en el conjunto de evaluación, un resultado sospechosamente perfecto que sugiere sobreajuste o evaluación sobre datos triviales, por lo que debe interpretarse con cautela.

La relevancia de este modelo reside en su tamaño reducido y su licencia Apache 2.0, que permite uso comercial sin restricciones. Sin embargo, al carecer de documentación detallada sobre el dataset de entrenamiento, el proceso de ajuste y con un rendimiento declarado poco realista, no es recomendable para entornos de producción sin una validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 37.760.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (Whisper estándar usa ventanas de 30 s de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (por el nombre, probablemente inglés; no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper, un transformer encoder-decoder diseñado originalmente por OpenAI para ASR. El encoder procesa espectrogramas de mel de segmentos de audio (típicamente ventanas de 30 segundos) y el decoder genera el texto transcrito de forma autorregresiva. Al ser la variante "tiny", el número de capas y la dimensión oculta son reducidos, lo que explica sus ~37.7M de parámetros.

El entrenamiento consistió en un fine-tuning del modelo base `1Developer/cali-whisper-tiny.en-drop-006-production` sobre un dataset local denominado `audiofolder`. Los hiperparámetros declarados son: learning rate de 1e-5, batch size de 16, 500 pasos de entrenamiento, optimizador AdamW (con betas 0.9/0.999 y epsilon 1e-8), scheduler constante con warmup de 50 pasos y entrenamiento con precisión mixta (Native AMP). No se especifica el tamaño del dataset, su composición ni el número de tokens de entrenamiento. Tampoco hay evidencia de etapas de RLHF o DPO.

## Capacidades

- Transcripción de audio a texto (reconocimiento automático del habla) en inglés, según la nomenclatura del modelo.
- Generación de texto a partir de audio con decodificación autorregresiva.
- Soporte para integración con la librería `transformers` de HuggingFace mediante el pipeline `automatic-speech-recognition`.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión u otras modalidades.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en actas textuales, gracias a su tamaño reducido que permite ejecución en CPU o GPU de baja gama.
- Subtitulado automático de vídeos: integrable en pipelines de postproducción para generar subtítulos en inglés de forma automatizada.
- Asistentes de voz en dispositivos embebidos: al ser ligero, puede desplegarse en dispositivos con poca memoria (Raspberry Pi, móviles) para comandos de voz básicos.
- Transcripción de notas de voz en aplicaciones de productividad: convierte mensajes de voz en texto para su posterior procesamiento.
- Accesibilidad: ayuda a personas con discapacidad auditiva a obtener transcripciones de contenido hablado en tiempo real o diferido.
- Análisis de llamadas de atención al cliente: transcribe conversaciones para su posterior análisis de sentimiento o extracción de información, aunque la fiabilidad del modelo debe validarse previamente.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card (no verificados de forma independiente):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| audiofolder | test | WER | 0.0 |
| audiofolder | test | Loss | 0.0 |

Estos valores de WER y pérdida nulos son altamente inusuales en tareas ASR reales y probablemente indican sobreajuste al conjunto de evaluación o que el dataset contiene muestras triviales. No se han publicado comparaciones con otros modelos ni resultados en benchmarks estándar como LibriSpeech o Common Voice. Se recomienda no tomar estos números como referencia de rendimiento real.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 150 MB en fp32 (37.7M × 4 bytes) y ~75 MB en fp16. El tamaño del repositorio (3.6 GB) sugiere que puede incluir otros archivos (optimizer states, checkpoints), pero los pesos del modelo son pequeños.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 2060, etc.). También es viable en CPU para inferencia en tiempo real o casi real.
- Cabe en GPUs de consumo (RTX 3060, 4060, etc.) sin problemas.
- Opciones de despliegue: la librería `transformers` con el pipeline `automatic-speech-recognition`, o mediante exportación a ONNX/TensorRT para entornos de producción. También puede ejecutarse con herramientas como `whisper.cpp` si se convierte a formato GGUF (no incluido en el repo).
- Latencia y throughput: no disponibles, pero por el tamaño del modelo se espera una latencia baja (del orden de decenas de milisegundos por segmento de audio en GPU moderna).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento (WER) |
|---|---|---|---|---|
| cali-whisper-tiny.en-drop-007-production | 37.7M | no disponible | Apache 2.0 | 0.0 (declarado, no verificado) |
| openai/whisper-tiny.en | ~39M | 30 s de audio | MIT | ~5-10% en LibriSpeech (referencia) |
| openai/whisper-base.en | ~74M | 30 s de audio | MIT | ~3-5% en LibriSpeech (referencia) |

No se dispone de comparativas directas con otros fine-tunes de Whisper tiny. El modelo de 1Developer presenta un rendimiento declarado perfecto, pero sin validación externa, mientras que los modelos de OpenAI tienen métricas conocidas en benchmarks públicos.

## Limitaciones y advertencias

- El WER de 0.0 declarado es sospechosamente perfecto y probablemente refleja sobreajuste o un conjunto de evaluación no representativo; no es fiable para medir el rendimiento real.
- No hay información sobre el dataset de entrenamiento (tamaño, dominio, calidad), lo que impide evaluar su generalización a otros acentos, ruidos o dominios.
- El modelo no tiene descargas ni likes en HuggingFace, lo que sugiere que no ha sido validado por la comunidad.
- No se confirma el idioma soportado; el nombre sugiere inglés, pero no hay documentación al respecto.
- Riesgo de alucinaciones en la transcripción (común en modelos Whisper), especialmente con audio de baja calidad o ruido de fondo.
- La licencia Apache 2.0 permite uso comercial, pero sin garantías de rendimiento ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/1Developer/cali-whisper-tiny.en-drop-007-production
- Modelo base: https://huggingface.co/1Developer/cali-whisper-tiny.en-drop-006-production
