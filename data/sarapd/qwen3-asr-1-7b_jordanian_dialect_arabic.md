# sarapd/Qwen3-ASR-1.7B_Jordanian_Dialect_Arabic

## Resumen

Qwen3-ASR-1.7B_Jordanian_Dialect_Arabic es un ajuste fino completo del modelo de reconocimiento automático de voz (ASR) Qwen/Qwen3-ASR-1.7B, desarrollado por sarapd como parte de una tarea de prácticas. El modelo está especializado en la transcripción de habla en árabe dialectal jordano, un dominio donde los modelos ASR multilingües genéricos suelen presentar tasas de error elevadas debido a la escasez de datos dialectales y a la variabilidad fonética regional.

El ajuste se realizó sobre aproximadamente 10,8 horas de habla jordana, actualizando únicamente los parámetros del decodificador de lenguaje (Qwen3-1.7B) mientras se congelaban el codificador de audio (300M, estilo FastConformer) y el proyector. El resultado mejora la tasa de error de palabra (WER) de un 31,63 % a un 27,59 % y la tasa de error de carácter (CER) de un 12,84 % a un 11,11 % en un conjunto de prueba reservado de 2.067 utterances. La licencia Apache-2.0 heredada del modelo base permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio (300M, estilo FastConformer, chunking variable 1–8 s, ~12,5 tokens/s) → proyector → decodificador Qwen3-1.7B |
| Parametros totales | 1,7B (decodificador de lenguaje) + 300M (codificador de audio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (mencionado en ejemplos de transcripción) |
| Idiomas soportados | Arabe (dialecto jordano) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de Qwen3-ASR: un codificador de audio de 300M parámetros con estilo FastConformer procesa segmentos de audio de 1 a 8 segundos, generando aproximadamente 12,5 tokens por segundo. Estos tokens se proyectan a un espacio de representación compartido y se alimentan al decodificador de lenguaje Qwen3-1.7B, que es el responsable de generar la transcripción. El ajuste fino completo actualiza todos los parámetros del decodificador de lenguaje, mientras que el codificador de audio y el proyector permanecen congelados, ya que la adaptación dialectal se concentra en la capa de lenguaje.

El entrenamiento utilizó un pool de 7.056 utterances (~10,82 horas) con una mezcla de grabaciones estilo YouTube y llamadas telefónicas. Se aplicó un ajuste fino completo con learning rate 2e-5, 8 épocas, batch size efectivo de 96 (gradient accumulation 16) en una única A100, con un tiempo de entrenamiento de aproximadamente 1 hora y 15 minutos. También se entrenó una variante LoRA (r=16, alpha=32) para comparación, que obtuvo peores resultados (WER 30,14 %) con un coste de entrenamiento similar. El checkpoint seleccionado fue el 560, correspondiente a 8 épocas, por ofrecer el mejor WER en evaluación.

## Capacidades

- Transcripción de habla en árabe dialectal jordano, incluyendo variantes fonéticas y vocabulario local.
- Manejo de code-switching entre árabe y otras lenguas (WER 37,97 % en la categoría de code-switching, frente al 47,21 % del modelo base).
- Reconocimiento de números en dialecto jordano (WER 27,56 %).
- Inferencia en tiempo real: aproximadamente 53× más rápida que el tiempo real en A100 con batch 16.
- Latencia de streaming simulado de ~1,5 s por chunk de 2 segundos (el 5 % más lento tarda 3,1–3,3 s).
- Soporte de cuantización W4A16 para despliegue con menor huella de memoria.

## Casos de uso

- Transcripción de llamadas de atención al cliente en Jordania: el modelo puede transcribir conversaciones telefónicas en dialecto jordano, permitiendo análisis de sentimiento, detección de problemas recurrentes y generación de resúmenes automáticos. Su WER de 27,59 % en condiciones de llamada (fuente Prepare_ObadaPSUT) lo hace utilizable con supervisión humana.
- Subtitulado de contenido audiovisual local: vídeos de YouTube, podcasts y programas de televisión jordanos pueden subtitularse automáticamente, reduciendo el coste de subtitulado manual. El modelo maneja bien el code-switching, común en medios jordanos.
- Asistentes de voz para servicios públicos: integración en sistemas de información gubernamental o sanitaria donde los ciudadanos hablan en dialecto jordano, permitiendo navegación por menús de voz y transcripción de solicitudes.
- Documentación médica y legal: transcripción de entrevistas, consultas o declaraciones grabadas en dialecto jordano, con posterior revisión humana para garantizar precisión en contextos críticos.
- Análisis de redes sociales y encuestas de voz: transcripción de mensajes de voz en dialecto jordano para investigación de mercado, análisis de opinión pública o estudios sociolingüísticos.
- Archivado y búsqueda de contenido histórico: digitalización de archivos de audio (entrevistas, programas de radio) en dialecto jordano, con indexación textual para búsqueda por contenido.

## Benchmarks y rendimiento

Conjunto de prueba: 2.067 utterances (~3,32 horas), reservado del entrenamiento. Mismas condiciones de normalización y evaluación para todos los modelos.

| Metrica | Modelo base | Full fine-tune | LoRA |
|---|---|---|---|
| WER | 31,63 % | **27,59 %** | 30,14 % |
| CER | 12,84 % | **11,11 %** | 12,49 % |

Desglose por categoría (WER):

| Categoria | Modelo base | Full-FT | LoRA | n |
|---|---|---|---|---|
| Code-switching | 47,21 % | 37,97 % | 41,75 % | 98 |
| Numeros en dialecto | 32,99 % | 27,56 % | 29,98 % | 253 |
| Habla normal | 30,44 % | 27,01 % | 29,69 % | 1.747 |

Desglose por fuente (WER):

| Fuente | Modelo base | Full-FT | LoRA | n |
|---|---|---|---|---|
| Prepare_AlwakeelHayat | 27,71 % | 25,33 % | 26,96 % | 1.465 |
| Prepare_ObadaPSUT | 45,88 % | 35,80 % | 41,70 % | 602 |

Velocidad de inferencia (A100, batch 16, conjunto de prueba completo):

| Modelo | Tiempo | Velocidad vs. tiempo real |
|---|---|---|
| Modelo base | 3:19 | ~59× |
| Full fine-tune | 3:51 | ~53× |
| LoRA | 7:52 | ~26× |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-ASR-1.7B requiere aproximadamente 4–6 GB en FP16, y ~2–3 GB con cuantización W4A16. El ajuste fino no modifica el tamaño del modelo.
- GPU recomendadas: A100 (usada en entrenamiento), RTX 4090, RTX 3090, o cualquier GPU con al menos 8 GB de VRAM para FP16. Con cuantización W4A16 puede ejecutarse en GPUs de 4 GB.
- Cabe en GPUs de consumo: sí, en RTX 3060 (12 GB) o superiores con FP16; en RTX 4060 (8 GB) con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o el pipeline de HuggingFace `automatic-speech-recognition`. El modelo base Qwen3-ASR tiene soporte en el ecosistema Qwen.
- Latencia y throughput: ~53× tiempo real en A100 con batch 16; latencia de streaming ~1,5 s por chunk de 2 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (jordano) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B (base) | 1,7B | no disponible | 31,63 % | Apache-2.0 | HuggingFace |
| Qwen3-ASR-1.7B (full fine-tune, este modelo) | 1,7B | no disponible | **27,59 %** | Apache-2.0 | HuggingFace |
| Qwen3-ASR-1.7B (LoRA) | 1,7B | no disponible | 30,14 % | Apache-2.0 | HuggingFace |

No se dispone de comparativas con otros modelos ASR dialectales (por ejemplo, Whisper fine-tuned o MMS) en la información proporcionada.

## Limitaciones y advertencias

- El WER absoluto (27,59 %) sigue siendo alto para producción sin supervisión humana; se recomienda revisión manual en contextos críticos.
- La fuente Prepare_ObadaPSUT presenta un WER significativamente mayor (35,80 %), probablemente por condiciones de grabación o estilo de habla diferentes; el rendimiento puede degradarse en entornos ruidosos o con acentos no representados.
- El conjunto de entrenamiento carece de metadatos de hablante; el número de hablantes distintos es desconocido, y la fuente más grande representa ~10 % del entrenamiento y ~19 % del test, lo que puede sesgar los resultados hacia patrones de habla específicos.
- No hay datos sobre rendimiento en otros dialectos árabes (egipcio, marroquí, del Golfo); el modelo está especializado exclusivamente en jordano.
- El modelo no soporta otras lenguas: el ajuste fino ha reducido o eliminado la capacidad multilingüe del modelo base.
- La cuantización W4A16 puede degradar ligeramente la precisión (los ejemplos muestran errores adicionales en la transcripción cuantizada).
- No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) porque es un modelo ASR, no un LLM de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sarapd/Qwen3-ASR-1.7B_Jordanian_Dialect_Arabic
- Modelo base Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio oficial Qwen3-ASR: https://github.com/QwenLM/Qwen3-ASR
- Informe tecnico Qwen3-ASR (arXiv): https://arxiv.org/pdf/2601.21337v1
