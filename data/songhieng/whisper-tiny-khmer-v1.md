# songhieng/whisper-tiny-khmer-v1

## Resumen

Whisper Tiny Khmer v1 es un modelo de reconocimiento automático del habla (ASR) para jemer (khmer, `km`), obtenido mediante fine-tuning de `openai/whisper-tiny`. Lo desarrolla Songhieng Van y se publica en Hugging Face bajo licencia Apache 2.0. Su interés principal es que ofrece transcripción de audio en jemer con un modelo de apenas 37,7 millones de parámetros y un repositorio de 0,2 GB, lo que permite ejecutarlo en CPU y en dispositivos con recursos muy limitados, un escenario poco cubierto por los modelos multilingües de gran tamaño.

El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con procesamiento de audio a 16 kHz y ventanas de 30 segundos. El fine-tuning se realizó sobre `tts-data-kh`, un conjunto de voz leída en jemer de un único hablante masculino, con una pérdida final de entrenamiento de 0,0959 en el paso 5.200. No se han publicado métricas de error (WER/CER) sobre un conjunto de evaluación independiente, por lo que la calidad real de transcripción no está cuantificada de forma pública.

Es relevante ahora por dos motivos: cubre un idioma de bajos recursos como el jemer con un modelo desplegable en edge, y sirve como punto de partida reproducible para quien quiera experimentar con ASR en jemer sin infraestructura GPU. Para aplicaciones que exijan mayor precisión, el propio autor remite a `whisper-small-khmer-v1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento; audio más largo requiere `chunk_length_s=30` |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos safetensors en fp32/fp16 según el repo) |
| Idiomas soportados | Jemer (`km`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `openai/whisper-tiny`, un transformer encoder-decoder con atención completa, orientado a la transcripción de audio muestreado a 16 kHz. El encoder procesa espectrogramas mel de 30 segundos y el decoder genera el texto de forma autorregresiva. No incorpora innovaciones arquitectónicas propias: hereda la estructura y el tokenizador multilingüe de Whisper, y se especializa en el par idioma-tarea `km` / `transcribe`.

El entrenamiento se realizó sobre `tts-data-kh` (Kaggle), un corpus de voz leída en jemer de un único hablante masculino. La pérdida final de entrenamiento fue de 0,0959 en el paso 5.200. No se documenta el número de tokens de audio, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (en ASR no es habitual). Tampoco se detalla la configuración de hiperparámetros ni el hardware empleado.

## Capacidades

- Transcripción de voz a texto en jemer (`km`) con `task="transcribe"`.
- Procesamiento de audio a 16 kHz con remuestreo automático al pasar una ruta de fichero al pipeline de Transformers.
- Manejo de audios de más de 30 segundos mediante segmentación con `chunk_length_s=30`.
- Ejecución en CPU: con ~37,7 M de parámetros, es viable en entornos sin GPU.
- Integración directa con `transformers.pipeline("automatic-speech-recognition", ...)`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada distinto de voz ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de notas de voz en jemer en aplicaciones móviles: el tamaño de 37,7 M de parámetros y 0,2 GB de repo permite empaquetar el modelo en apps de Android o iOS o ejecutarlo en servidores de gama baja, transcribiendo audios cortos de voz leída.
- Prototipado rápido de pipelines ASR en jemer: sirve para validar la integración con `transformers`, el formato de salida y el flujo de preprocesado antes de invertir en un modelo mayor como `whisper-small-khmer-v1`.
- Subtitulado offline de contenido grabado con locutor masculino: para vídeos o pódcasts en jemer con voz clara y leída, el modelo puede generar subtítulos en lotes con `chunk_length_s=30` sin necesidad de GPU.
- Investigación en ASR de bajos recursos: como baseline ligero para experimentos de adaptación de dominio, aumentación de datos o comparación con modelos multilingües de mayor tamaño sobre jemer.
- Procesamiento por lotes en CPU en servidores sin acelerador: al no requerir GPU, encaja en colas de trabajos batch donde el coste por hora de GPU es limitado y la latencia no es crítica.
- Generación de datos sintéticos de transcripción: combinado con TTS en jemer, puede usarse para crear pares audio-texto y ampliar corpus de entrenamiento, siempre revisando la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han publicado WER/CER sobre un conjunto de evaluación independiente y que la pérdida de entrenamiento (0,0959) no es una medida de precisión de transcripción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 37,7 M de parámetros, los pesos en fp32 ocupan aproximadamente 150 MB y en fp16 unos 75 MB, por lo que cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650 o una iGPU moderna bastan.
- Cabe en GPU consumer: sí, en todas las gamas actuales.
- Cabe en CPU: sí; el autor lo presenta explícitamente como apto para CPU y edge devices.
- Opciones de despliegue: `transformers` con `pipeline` (soporte nativo), y en principio cualquier runtime compatible con safetensors/Whisper (por ejemplo, conversión a ONNX o GGUF para llama.cpp/whisper.cpp), aunque estas conversiones no están documentadas por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| songhieng/whisper-tiny-khmer-v1 | 37,7 M | 30 s por segmento | Jemer | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | 30 s por segmento | Multilingüe (99 idiomas) | Apache 2.0 | Hugging Face |
| songhieng/whisper-small-khmer-v1 | no disponible en la informacion proporcionada | 30 s por segmento | Jemer | no disponible en la informacion proporcionada | Hugging Face |

Frente a `openai/whisper-tiny`, este modelo está especializado en jemer mediante fine-tuning, a costa de perder cobertura multilingüe. Frente a `whisper-small-khmer-v1`, del mismo autor, el tiny es más ligero y apto para CPU, mientras que el small está orientado a mayor precisión según la propia model card; no se dispone de métricas comparativas públicas entre ambos.

## Limitaciones y advertencias

- Los datos de entrenamiento son de un único hablante masculino y voz leída; la precisión caerá con voces femeninas, infantiles, habla espontánea o conversacional, acentos regionales y grabaciones con ruido.
- No hay WER/CER publicados sobre un conjunto de evaluación independiente; la pérdida de entrenamiento no equivale a calidad de transcripción.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible no presente en el audio, especialmente en silencios, ruido o segmentos ambiguos.
- Cobertura monolingüe: solo jemer; no debe esperarse transcripción correcta de otros idiomas aunque el tokenizador base sea multilingüe.
- Limitación de ventana: los audios de más de 30 segundos requieren segmentación explícita (`chunk_length_s=30`), lo que puede introducir errores en las fronteras de los segmentos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar los avisos de licencia y citar al autor según la model card.
- Para producción con requisitos de precisión, se recomienda evaluar sobre un conjunto propio representativo del dominio y considerar el modelo `whisper-small-khmer-v1` del mismo autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/songhieng/whisper-tiny-khmer-v1
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Modelo alternativo del mismo autor: https://huggingface.co/songhieng/whisper-small-khmer-v1
- Dataset de entrenamiento: https://www.kaggle.com/datasets/songhiengvan/tts-data-kh
- Perfil del autor: https://huggingface.co/songhieng
