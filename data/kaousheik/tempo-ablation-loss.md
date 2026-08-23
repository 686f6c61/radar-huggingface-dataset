# Kaousheik/tempo-ablation-loss

## Resumen

El modelo `Kaousheik/tempo-ablation-loss` es un checkpoint de investigación derivado de Audio Flamingo 3, desarrollado por Kaousheik (Jayakumar), investigador de la Universidad de Maryland. Forma parte del proyecto TEMPO, cuyo objetivo es dotar a los modelos de lenguaje audio de una comprensión temporal precisa (timestamping, temporal grounding, diarización, etc.). Este checkpoint concreto es una ablación de la tabla 3 del paper, en la que se elimina el proyector temporal y se utiliza únicamente una pérdida de timestamps gaussiana dependiente de la distancia (lambda_time=0.5, sigma_t=0.3). El modelo mantiene la arquitectura base de Audio Flamingo 3: un encoder de audio Whisper-large congelado y un modelo de lenguaje Qwen2-7B, con un proyector multimodal estándar.

A pesar de ser una variante de investigación, el modelo es relevante porque permite evaluar el impacto de la pérdida de timestamps en tareas de temporización fina, y ofrece un punto de comparación con el modelo completo TEMPO. Está diseñado para cinco tareas de audio: transcripción multi-hablante, diarización de hablantes, anclaje temporal de audio, captioning denso y captioning musical con timestamps. Se distribuye bajo licencia de investigación exclusiva de NVIDIA, por lo que su uso comercial está prohibido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Flamingo 3 (Whisper-large encoder + Qwen2-7B + proyector multimodal) |
| Parametros totales | 8.271.523.328 (8,27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos safetensors en FP16) |
| Idiomas soportados | No disponible |
| Licencia | nvidia-research-only (uso exclusivo para investigación académica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Audio Flamingo 3: un codificador de audio Whisper-large congelado que extrae representaciones acústicas, y un modelo de lenguaje Qwen2-7B que genera texto. El proyector multimodal está entrenado para fusionar las características de audio con las del texto, y en esta variante se usa el proyector estándar (no el proyector temporal consciente de tiempo del modelo TEMPO completo). El entrenamiento se realiza en cinco tareas simultáneas, seleccionadas mediante una etiqueta en el prompt, y la salida intercala texto con tokens de timestamp a una resolución de 0,1 segundos.

El entrenamiento se estructura en tres etapas: `synthetic_stage1`, `sft_stage2` y `rl`. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset. La etapa `rl` sugiere que se emplea algún tipo de aprendizaje por refuerzo, aunque no se detalla si es RLHF o DPO. En esta ablación se elimina la pérdida de proyección temporal y solo se aplica la pérdida de timestamps gaussiana, lo que permite aislar el efecto de la pérdida temporal en el rendimiento.

## Capacidades

- Transcripción multi-hablante (`[speech:asr]`): genera una transcripción con timestamps de inicio y fin para cada segmento.
- Diarización de hablantes (`[speech:diar]`): identifica y etiqueta a los hablantes con sus intervalos temporales.
- Anclaje temporal de audio (`[audio:ground]`): localiza eventos específicos en el audio y devuelve el intervalo exacto.
- Dense audio captioning (`[audio:caption]`): produce descripciones detalladas de contenido de audio con timestamps.
- Captioning musical (`[audio:music]`): genera etiquetas de instrumentos, tempo, acordes y estadísticas con sus intervalos.
- Soporte de tokens de timestamp a 0,1 s de resolución, lo que permite anotaciones temporales finas.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Transcripción de reuniones y conferencias: el modelo puede transcribir conversaciones multi-hablante y asociar cada turno a un intervalo temporal, facilitando la navegación posterior en el audio.
- Diarización automática para análisis de conversaciones: en entornos de atención al cliente o investigación cualitativa, permite segmentar por hablante y extraer tiempos de intervención.
- Anotación de datasets de audio: para entrenar otros modelos, se puede usar para generar captions densas con timestamps, reduciendo el trabajo manual.
- Búsqueda y recuperación de eventos en audio: el temporal grounding permite localizar momentos concretos (por ejemplo, una palabra clave) dentro de largas grabaciones.
- Análisis musical automatizado: extracción de estructura temporal de canciones, identificación de instrumentos y cambios de acordes con su localización exacta.
- Generación de subtítulos para contenido multimedia: produce subtítulos sincronizados con el audio de forma automática, útil para vídeo y podcasts.

## Benchmarks y rendimiento

Según la model card, este checkpoint reporta los siguientes resultados (no hay comparación con otros modelos):

| Metrica | Valor |
|---|---|
| DER (diarization error rate) | 86.2 |
| mIoU (mean Intersection over Union) | 37.5 |
| Dense captioning eF1 | 49.9 |
| Grounding F1 | 38.0 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para 8,27B parámetros en FP16, se necesitan aproximadamente 16,5 GB de VRAM (pesos + activaciones). Con cuantización 8-bit se reduce a ~8 GB, y con 4-bit a ~4 GB.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) puede ejecutar el modelo en FP16 con holgura; una A100 o H100 permitiría mayor margen y menor latencia.
- No cabe en GPU de consumo de gama baja (menos de 8 GB) sin cuantización agresiva.
- Opciones de despliegue: al ser un modelo de audio, requiere un framework que gestione el preprocesado de audio y el modelo completo. Se puede usar vLLM con soporte de multimodal, o un pipeline personalizado con Transformers y el codificador de audio. No es recomendable usar llama.cpp/Ollama sin adaptaciones específicas para audio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de audio-language con temporización. El modelo base Audio Flamingo 3 tiene la misma arquitectura pero sin el entrenamiento específico de temporización, y este checkpoint es una variante de ablación. Tampoco se ha encontrado comparación con otros modelos como Qwen2-Audio o LLaMA-3.2-Vision. Por tanto, no se puede realizar una comparativa numérica.

## Limitaciones y advertencias

- Licencia de uso exclusivamente académico y no comercial. Prohibido su uso en entornos de producción o con fines lucrativos.
- El modelo es un checkpoint de investigación, no se ha validado en entornos de producción reales.
- No se han reportado estudios de sesgos, alucinaciones o errores en contextos específicos.
- La resolución de timestamp de 0,1 s puede ser insuficiente para aplicaciones que requieran precisión sub-100 ms.
- No se especifica el soporte de idiomas; probablemente hereda las capacidades de Whisper y Qwen, pero no hay confirmación.
- La falta de un proyector temporal específico en esta ablación puede degradar el rendimiento en tareas que requieren fuerte alineación temporal, como se refleja en los resultados (DER 86.2 es alto).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kaousheik/tempo-ablation-loss
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaousheik/tempo
- Modelo base: https://huggingface.co/nvidia/audio-flamingo-3
- Perfil del autor: https://huggingface.co/Kaousheik
