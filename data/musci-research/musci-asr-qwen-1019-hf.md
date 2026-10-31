# Musci-research/Musci-ASR-qwen-1019-hf

## Resumen

Musci-ASR-qwen-1019-hf es un modelo de reconocimiento automático del habla (ASR) desarrollado por Musci-research. Se trata de una conversión a formato nativo de Transformers del checkpoint Musci-ASR-qwen-1019, que a su vez es un fine-tuning mediante GRPO (Group Relative Policy Optimization) de Qwen3-ASR-1.7B-HF. No se trata de una versión oficial de Qwen, sino de un ajuste de terceros sobre la arquitectura Qwen3-ASR.

El modelo aborda el problema de la transcripción de voz a texto en inglés, con especial atención a hablantes no nativos: el fine-tuning se realizó sobre una mezcla interna construida a partir de los datasets de entrenamiento públicos del Open ASR Leaderboard más datos de hablantes no nativos de inglés. Con unos 2.038 millones de parámetros, se sitúa en la gama de modelos ASR ligeros y eficientes.

Su relevancia actual radica en sus resultados publicados en el Open ASR Leaderboard: un WER medio de 4,36 % sobre 9 conjuntos públicos, con velocidades de inferencia muy altas (RTFx medio de 658,3 evaluado sobre una H200). La conversión nativa a Transformers elimina la dependencia del paquete `qwen-asr` y de `trust_remote_code=True`, lo que simplifica su despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer encoder-decoder condicional, componente "thinker" con embeddings de entrada y cabeza de salida emparejados) |
| Parámetros totales | 2.038.052.480 (aprox. 2.038 M) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (evaluado en bfloat16) |
| Idiomas soportados | inglés (entrenado con datasets en inglés, incluidos hablantes no nativos); no disponible una lista oficial |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4,1 GB de repo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-ASR-1.7B-HF, una arquitectura ASR basada en transformers implementada de forma nativa en Transformers (clases `Qwen3ASRForConditionalGeneration` y `Qwen3ASRProcessor`). El checkpoint conserva `tie_word_embeddings=True`, de modo que la cabeza de salida del lenguaje (`thinker.lm_head.weight`) es un alias del tensor de embeddings de entrada (`thinker.model.embed_tokens.weight`); por eso safetensors almacena una única copia del tensor compartido.

El ajuste fino se realizó con GRPO sobre una mezcla interna de datos que combina los datasets de entrenamiento públicos del Open ASR Leaderboard con datasets de hablantes no nativos de inglés. No se ha publicado el número total de tokens ni la composición detallada del dataset. La conversión a formato nativo de Transformers se hizo con el script oficial `convert_qwen3_asr_to_hf.py` (commit `2e12b325d5c4532f3ec5b0ec54e1ff0b7e0db397`) usando Transformers 5.21.0.dev0 y huggingface_hub 1.31.0, sin entrenamiento adicional durante la conversión. El checkpoint pasó las comprobaciones estrictas de carga de pesos, configuración y procesador.

## Capacidades

- Transcripción de voz a texto (ASR) en inglés, con buen rendimiento sobre habla limpia, espontánea y de hablantes no nativos.
- Transcripción de reuniones y conversaciones multi-hablante (buenos resultados en AMI y Earnings22).
- Alta velocidad de inferencia: RTFx medio de 658,3 en evaluación por lotes (batch size 256) sobre una H200.
- Compatible con el pipeline `automatic-speech-recognition` de Transformers, sin necesidad de código remoto (`trust_remote_code` no requerido).
- No consta soporte de tool calling, agentes, visión, audio generativo ni modos de razonamiento.

## Casos de uso

- Transcripción de reuniones y videollamadas: el buen WER en AMI-Cleaned (6,53 %) y Earnings22 (5,83 %) lo hace adecuado para generar actas y transcripciones de conversaciones multi-hablante con vocabulario empresarial.
- Transcripción de podcasts y contenido audio: su rendimiento en GigaSpeech (6,41 %) lo orienta a la subtitulación y indexación de contenido de larga duración.
- Procesado masivo de corpus de audio: con un RTFx de 658,3 en lotes grandes, es idóneo para transcribir grandes volúmenes de audio offline en GPU de forma eficiente.
- Sistemas de voz para hablantes no nativos: el fine-tuning específico con datos de inglés no nativo lo hace útil en entornos con acentos variados (3,44 % WER en el conjunto Monsoon en-IN).
- Evaluación y benchmarking de ASR: al ser un modelo nativo de Transformers con resultados publicados en el Open ASR Leaderboard, sirve como baseline reproducible con `run_eval.py`.
- Dictado y transcripción de libros hablados: el WER de 1,03 % en LibriSpeech test.clean lo hace apto para audio leído de alta calidad.
- Aplicaciones de robótica de voz o IVR: la licencia Apache-2.0 permite integrarlo en productos comerciales sin restricciones de licenciamiento.

## Benchmarks y rendimiento

Resultados del Open ASR Leaderboard (backend Transformers, bf16, SDPA, batch size 256, `max_new_tokens=512`, una H200):

| Dataset | WER (%) | RTFx |
|---|---:|---:|
| AMI-Cleaned | 6,53 | 653,0 |
| Earnings22-Cleaned-AA-chunked | 5,83 | 436,4 |
| GigaSpeech-Cleaned | 6,41 | 460,6 |
| LibriSpeech test.clean | 1,03 | 621,4 |
| LibriSpeech test.other | 2,18 | 579,4 |
| SPGISpeech | 1,86 | 813,3 |
| URGENT2024 | 10,49 | 708,7 |
| Voice Arena Monsoon en-IN | 3,44 | 588,0 |
| VoxPopuli-AA-Cleaned | 1,47 | 390,6 |
| **Media (9 conjuntos públicos)** | **4,36** | **658,3** |

No se han publicado comparaciones directas con otros modelos concretos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 4,1 GB en safetensors (pesos en bfloat16, ~2.038 M de parámetros); se recomienda una GPU con al menos 8 GB de VRAM para inferencia cómoda con lotes moderados.
- GPU recomendadas: la evaluación oficial se realizó sobre una NVIDIA H200. Por tamaño, debería funcionar en GPUs de gama media-alta como RTX 3090/4090, A100 o L4.
- Cabe en GPUs de consumo: sí, con ~4 GB de pesos en bf16 es viable en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 y superiores, especialmente en inferencia por lotes moderada.
- Despliegue: Transformers (implementación nativa `Qwen3ASRForConditionalGeneration`, se requiere una versión que incluya Qwen3-ASR); compatible con Endpoints de Hugging Face (tag `endpoints_compatible`). No se menciona soporte para llama.cpp, Ollama, vLLM o TGI.
- Latencia y throughput: RTFx entre 390,6 y 813,3 según dataset (media 658,3) con batch size 256 en una H200; no hay datos de latencia en tiempo real por stream.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Contexto | Notas |
|---|---|---|---|---|---|
| Musci-ASR-qwen-1019-hf | ~2.038 M | ASR (inglés) | Apache-2.0 | no disponible | WER medio 4,36 % en Open ASR Leaderboard; RTFx 658,3 |
| Qwen3-ASR-1.7B-HF (base) | ~1.700 M (no disponible exacto) | ASR | no disponible | no disponible | Modelo base del que parte este fine-tune |
| Whisper large-v3 | ~1.550 M | ASR multilingüe | MIT | 30 s por ventana | Multilingüe, pero RTFx muy inferior a este modelo |

No se han publicado comparaciones numéricas directas entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Modelo enfocado al inglés: no hay lista oficial de idiomas soportados, y el entrenamiento se basó en datasets en inglés; no se debe asumir buen rendimiento en castellano u otros idiomas.
- Riesgo de alucinación en silencios, ruido o música de fondo, habitual en modelos ASR basados en LLM; no hay datos específicos publicados sobre este fenómeno para este checkpoint.
- El rendimiento decae en condiciones acústicas difíciles: 10,49 % de WER en URGENT2024, el peor resultado del conjunto.
- No es una versión oficial de Qwen: es un fine-tune de terceros, por lo que los cambios respecto al modelo base no están documentados en detalle.
- Es una conversión sin entrenamiento adicional; requiere una versión de Transformers que incluya la implementación nativa de Qwen3-ASR (la conversión se hizo con 5.21.0.dev0).
- Licencia Apache-2.0: permite uso comercial, pero exige retener la atribución a Qwen3-ASR y al modelo fine-tuned de origen.
- Proyecto de baja adopción (41 descargas y 1 like en el momento de la ficha), con comunidad y soporte limitados; conviene validar en producción antes de depender de él.
- No consta soporte de streaming en tiempo real, diarización de hablantes ni marcas de tiempo.

## Enlaces

- Modelo (conversión HF): https://huggingface.co/Musci-research/Musci-ASR-qwen-1019-hf
- Checkpoint original: https://huggingface.co/Musci-research/Musci-ASR-qwen-1019
- Open ASR Leaderboard (repositorio de evaluación): https://github.com/huggingface/open_asr_leaderboard
