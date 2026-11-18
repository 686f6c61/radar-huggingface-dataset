# alphaedge-ai/whisper-base-san-16384

## Resumen

whisper-base-san-16384 es una variante recortada (trimmed) del modelo de reconocimiento automático del habla openai/whisper-base, publicada por alphaedge-ai y especializada en sánscrito (código de idioma `sa`). El modelo conserva la arquitectura encoder-decoder transformer original de Whisper, pero reduce el vocabulario del tokenizador de 51.865 a 16.384 tokens, lo que se traduce en una disminución del 68,41% en el tamaño del vocabulario y del 25,02% en el número total de parámetros: de 72.593.920 a 54.427.648.

La reducción se llevó a cabo mediante la técnica de trimming descrita por Loïck Bourdois y colaboradores en el blog de Hugging Face, que consiste en identificar los tokens realmente utilizados en un idioma concreto a partir de un corpus de minería (en este caso, 14.725 textos del dataset lbourdois/fineweb-2-trimming) y eliminar del vocabulario aquellos que no aparecen. El resultado es un checkpoint más ligero y con menor huella de memoria, pensado para despliegues de transcripción de audio en sánscrito donde el tamaño del modelo y el coste de inferencia son críticos.

El modelo es relevante para equipos que necesitan ASR en sánscrito en entornos con recursos limitados, ya que mantiene la interfaz estándar de Transformers (`AutoModelForSpeechSeq2Seq`, `pipeline`) y una licencia Apache 2.0 permisiva. No obstante, al haber eliminado tokens no usados en sánscrito, su rendimiento en otros idiomas se degrada de forma notable, por lo que no debe emplearse como modelo multilingüe general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 54.427.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sánscrito (`sa`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-base: un transformer encoder-decoder con atención multi-cabeza estándar, entrenado originalmente por OpenAI con supervisión débil a gran escala sobre pares audio-transcripción (paper arXiv:2212.04356). Whisper-base es la variante "base" de la familia, con aproximadamente 74 millones de parámetros en su versión original y una entrada de audio remuestreada a 16 kHz procesada en ventanas de 30 segundos.

La modificación introducida por alphaedge-ai no altera los pesos del encoder ni del decoder más allá de la adaptación de las matrices de embedding y de la capa de proyección de salida al nuevo vocabulario de 16.384 tokens. El proceso de trimming se apoya en la minería de 14.725 textos en sánscrito del dataset lbourdois/fineweb-2-trimming para determinar qué tokens del vocabulario original son efectivamente utilizados. No se documenta en la información disponible un reentrenamiento adicional, fine-tuning supervisado, RLHF ni DPO específico para sánscrito; el autor indica que el modelo recortado "debería comportarse de forma similar al original" dentro del idioma objetivo.

## Capacidades

- Reconocimiento automático del habla (ASR) en sánscrito, con salida de texto plano.
- Transcripción de audio remuestreado a 16 kHz, tal y como exige la arquitectura Whisper.
- Soporte de la pipeline `automatic-speech-recognition` de Transformers con `generate_kwargs={"language": "sanskrit", "task": "transcribe"}`.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- Capacidad multilingüe: limitada al sánscrito; el resto de idiomas del Whisper original no están garantizados y probablemente se degradan.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generation ni modo thinking.

## Casos de uso

- Transcripción de grabaciones de recitación y textos védicos: el modelo está especializado en sánscrito y puede transcribir audio de mantras, estrofas o clases grabadas, aprovechando la ventana de 30 s de Whisper para fragmentos litúrgicos o académicos.
- Digitalización de archivos orales de sánscrito: bibliotecas y universidades pueden convertir colecciones de audio en texto indexable con un modelo de 54 M de parámetros que cabe en cualquier GPU consumer.
- Subtitulado de material docente en sánscrito: integración en pipelines de generación de subtítulos para cursos de sánscrito o filosofía india, con la ventaja de un checkpoint ligero que reduce el coste por hora de audio procesada.
- Asistentes de estudio de sánscrito: transcripción en tiempo casi real de la pronunciación del alumno para compararla con la forma canónica, desplegable en local sin depender de APIs externas.
- Investigación lingüística: generación de corpus anotados de sánscrito hablado para estudios fonéticos o morfológicos, con la posibilidad de ejecutar el modelo en CPU para lotes grandes.
- Despliegue en dispositivos con recursos limitados: al tener un 25% menos de parámetros que whisper-base, es adecuado para entornos edge o contenedores con poca memoria, siempre que el audio sea en sánscrito.
- Prototipado rápido de aplicaciones ASR en sánscrito: la API estándar de Transformers y el tamaño del repo (0,1 GB) permiten iterar rápidamente en notebooks y entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,22 GB solo para pesos (54,4 M de parámetros × 4 bytes), más overhead de activaciones y del feature extractor; en la práctica, menos de 1 GB en total.
- VRAM estimada en fp16: alrededor de 0,11 GB para pesos, con overhead adicional similar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe holgadamente en GPU consumer (GTX 1650, RTX 3050, RTX 4060, etc.) e incluso puede ejecutarse en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: Transformers con `pipeline`, endpoints de Hugging Face (tag `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no se documenta en la información disponible); vLLM y TGI no están confirmados para este checkpoint.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-san-16384 | 54,4 M | ventanas de 30 s | sánscrito | apache-2.0 | Hugging Face |
| openai/whisper-base | 72,6 M | ventanas de 30 s | multilingüe (99 idiomas) | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingüe (99 idiomas) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | ventanas de 30 s | multilingüe (99 idiomas) | apache-2.0 | Hugging Face |

Frente a whisper-base, este checkpoint reduce parámetros y vocabulario a cambio de perder cobertura multilingüe; frente a whisper-tiny, ofrece más capacidad (54 M frente a 39 M) pero sigue restringido al sánscrito. No se dispone de datos de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- El vocabulario recortado elimina tokens no usados en sánscrito, por lo que el rendimiento en otros idiomas se degrada de forma significativa; no debe usarse como modelo multilingüe.
- Riesgo de alucinación y de transcripciones incorrectas en audio con ruido, acentos no estándar o vocabulario especializado, inherente a la familia Whisper.
- Sesgos heredados del entrenamiento original de Whisper con supervisión débil a gran escala; no se documenta ninguna mitigación específica.
- La minería de vocabulario se basa en 14.725 textos de fineweb-2-trimming, lo que puede no cubrir toda la variabilidad léxica del sánscrito hablado (por ejemplo, términos técnicos de disciplinas concretas).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio objetivo antes de producción.
- El modelo no ha sido evaluado con benchmarks publicados en la información disponible, por lo que no hay evidencia cuantitativa de su calidad frente al original.
- Requiere audio remuestreado a 16 kHz; otras frecuencias de muestreo pueden degradar la transcripción si no se remuestrea correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-san-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Figura ilustrativa del trimming: https://raw.githubusercontent.com/lbourdois/blog/refs/heads/master/assets/images/Trimming/whisper-base-16384.png
