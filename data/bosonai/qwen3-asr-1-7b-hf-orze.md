# bosonai/Qwen3-ASR-1.7B-hf-orze

## Resumen

El modelo **bosonai/Qwen3-ASR-1.7B-hf-orze** es una especialización en reconocimiento automático del habla (ASR) en inglés, derivada del checkpoint base [Qwen/Qwen3-ASR-1.7B-hf](https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf) mediante experimentos de búsqueda de LoRA realizados por el equipo de Orze. El resultado es un modelo autocontenido y fusionado, que se carga directamente con Transformers nativos sin necesidad de adaptadores PEFT ni código personalizado. Está pensado para transcripción de audio corto en inglés (segmentos de 30 segundos o menos) y ha sido optimizado para obtener un rendimiento competitivo en el Open ASR Leaderboard.

Con aproximadamente 2.040 millones de parámetros, el modelo mantiene la arquitectura del Qwen3-ASR-1.7B, que combina un codificador de audio (audio tower) con un decodificador de lenguaje basado en Qwen3-Omni. La especialización se logró mediante actualizaciones en el proyector de audio y en las capas lineales del audio tower, fusionadas y publicadas como un único checkpoint. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su excelente relación calidad-rendimiento para tareas de ASR en inglés, con una tasa de error de palabra (WER) media de 4,35 % en los conjuntos de evaluación del Open ASR Leaderboard y un throughput de 220,97 RTFx en una GPU H200. Es una opción atractiva para desarrolladores que necesitan un modelo de transcripción ligero, rápido y fácil de integrar en pipelines existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ASRForConditionalGeneration (codificador de audio + decodificador de lenguaje) |
| Parametros totales | 2.038.052.480 (aprox. 2,04 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (optimizado para audio de hasta 30 segundos) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en bfloat16; no se indican cuantizaciones GGUF u otras) |
| Idiomas soportados | ingles (especializacion; el modelo base soporta 52 idiomas, pero esta version no ha sido evaluada en otros) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-ASR, que integra un codificador de audio (audio tower) con un decodificador de lenguaje autoregresivo. El checkpoint base, Qwen3-ASR-1.7B-hf, fue entrenado por Alibaba Cloud sobre grandes volúmenes de datos de habla y aprovecha las capacidades de comprensión de audio del modelo fundacional Qwen3-Omni. La especialización Orze consistió en una búsqueda de adaptadores LoRA de corta duración, reteniendo dos actualizaciones compatibles con el lado acústico: una actualización del proyector de audio en el paso 50 y una actualización de las capas lineales del audio tower en el paso 75. Los deltas de estas actualizaciones se fusionaron y se integraron en el checkpoint base para su publicación.

El entrenamiento se realizó con 12.500 muestras de habla inglesa de 30 segundos o menos, extraídas de los conjuntos de entrenamiento de AMI IHM (9.000), LibriSpeech train-other-500 (1.500), LibriSpeech train-clean-100 (500), GigaSpeech XL (500), SPGISpeech (500), VoxPopuli inglés (500) y Earnings22 público (500). No se utilizó audio de test del Open ASR Leaderboard ni datos privados del leaderboard. La selección de candidatos se basó únicamente en evaluaciones públicas y conjuntos proxy de validación. La configuración de generación incluida emplea decodificación determinista con cuatro haces (beam=4) y una penalización de longitud de 0,8, ajustada sobre evaluaciones públicas y proxy.

## Capacidades

- Transcripción de voz en inglés a texto, optimizada para segmentos de audio de hasta 30 segundos.
- Reconocimiento de habla con alta precisión en entornos de reuniones, llamadas, podcasts y grabaciones de campo.
- Decodificación determinista con beam search (4 haces) configurada por defecto, lo que garantiza reproducibilidad en producción.
- Integración nativa con Transformers mediante la clase `Qwen3ASRForConditionalGeneration` y el procesador `AutoProcessor`.
- Soporte de entrada de audio en formato WAV (u otros formatos compatibles con el procesador) y salida de transcripción en texto plano.
- No incluye capacidades de tool calling, agentes, visión ni razonamiento multimodal más allá del ASR.

## Casos de uso

- Transcripción de reuniones: el modelo puede procesar grabaciones de reuniones de hasta 30 segundos por segmento, con un WER de 8,00 % en AMI Cleaned, lo que lo hace adecuado para generar actas automáticas en entornos corporativos.
- Subtitulado de vídeos: su bajo WER en LibriSpeech test-clean (1,17 %) y test-other (2,76 %) permite generar subtítulos precisos para contenido audiovisual en inglés.
- Transcripción de llamadas de atención al cliente: con un WER de 5,89 % en Earnings22 Cleaned AA, puede transcribir llamadas de conferencias y earnings calls para análisis posterior.
- Asistencia a periodistas y creadores de contenido: la transcripción de entrevistas y podcasts se puede automatizar con alta fidelidad, reduciendo el tiempo de edición.
- Análisis de voz en investigación: su rendimiento en GigaSpeech (7,18 %) y VoxPopuli (2,72 %) lo hace útil para tareas de lingüística computacional y procesamiento de corpus orales.
- Integración en pipelines de ASR en tiempo real: con un throughput de 220,97 RTFx en H200, puede procesar audio mucho más rápido que en tiempo real, permitiendo su uso en servicios de transcripción en streaming o por lotes.

## Benchmarks y rendimiento

Los resultados del Open ASR Leaderboard, obtenidos con el evaluador oficial de Transformers en GPUs H200, son los siguientes:

| Dataset | WER (%) |
|---|---:|
| AMI Cleaned | 8,00 |
| Earnings22 Cleaned AA (chunked) | 5,89 |
| GigaSpeech Cleaned | 7,18 |
| LibriSpeech test-clean | 1,17 |
| LibriSpeech test-other | 2,76 |
| SPGISpeech | 2,70 |
| VoxPopuli Cleaned AA | 2,72 |
| **Media** | **4,35** |

El throughput medido fue de **220,97 RTFx** en una GPU H200, con la misma configuración de decodificación para todos los conjuntos. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bfloat16 ocupa aproximadamente 4,1 GB (tamaño del repositorio), por lo que se recomienda al menos 6 GB de VRAM para cargar el modelo y procesar audio.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM, como RTX 3060 (12 GB), RTX 4070, RTX 4090, A10, A100, H100 o H200. En GPUs de gama alta (H200) se alcanza un throughput de 220,97 RTFx.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs consumer de 8-12 GB, aunque la velocidad dependerá de la memoria y el ancho de banda.
- Opciones de despliegue: Transformers nativo (con `device_map="auto"`), vLLM, TGI, o cualquier framework compatible con modelos de Transformers. También se puede exportar a ONNX o TensorRT para optimización.
- Latencia y throughput: no se proporcionan datos de latencia específicos, pero el throughput medido en H200 es de 220,97 RTFx (220 veces más rápido que tiempo real).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| bosonai/Qwen3-ASR-1.7B-hf-orze | 2,04 B | ingles (especializacion) | 30 s (optimizado) | Apache-2.0 | Especializacion ASR ingles, WER medio 4,35 % |
| Qwen/Qwen3-ASR-1.7B-hf | 2,04 B | 52 idiomas | no disponible | Apache-2.0 | Modelo base multilingue, sin especializacion |
| OpenAI Whisper large-v3 | 1,55 B | 99 idiomas | 30 s | MIT (codigo) / modelo con licencia | ASR multilingue ampliamente usado, WER variable segun dataset |

No se dispone de comparativas de rendimiento directas con estos modelos en los mismos conjuntos de evaluación dentro de la información proporcionada.

## Limitaciones y advertencias

- El modelo está optimizado y evaluado únicamente para ASR en inglés de segmentos cortos (30 segundos o menos). No se ha evaluado su rendimiento en otros idiomas, por lo que no se recomienda su uso para transcripción multilingüe.
- Las capacidades multilingües del modelo base no se han conservado ni verificado tras la especialización; para aplicaciones multilingües se debe usar el checkpoint original Qwen3-ASR-1.7B-hf.
- Puede presentar alucinaciones o errores en audio con ruido de fondo, acentos no representados en los datos de entrenamiento o habla solapada.
- El entrenamiento se realizó con un conjunto de datos relativamente pequeño (12.500 muestras), lo que puede limitar la generalización a dominios muy específicos.
- No se proporcionan cuantizaciones oficiales (GGUF, AWQ, etc.); el usuario deberá generarlas si necesita reducir el uso de memoria.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de los datasets utilizados (por ejemplo, SPGISpeech y Earnings22 pueden tener restricciones adicionales).

## Enlaces

- [Modelo en Hugging Face: bosonai/Qwen3-ASR-1.7B-hf-orze](https://huggingface.co/bosonai/Qwen3-ASR-1.7B-hf-orze)
- [Modelo base: Qwen/Qwen3-ASR-1.7B-hf](https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf)
- [Repositorio GitHub de Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR)
- [Variante con beam-4: bosonai/Qwen3-ASR-1.7B-hf-beam4](https://huggingface.co/bosonai/Qwen3-ASR-1.7B-hf-beam4)
