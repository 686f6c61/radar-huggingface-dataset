# bosonai/Orze-ASR-3Way

## Resumen

Orze-ASR-3Way es un sistema de reconocimiento automático del habla (ASR) en inglés, desarrollado por Boson AI, que combina tres modelos de forma determinista mediante una regla de consenso. Fue diseñado específicamente para competir en el Open ASR Leaderboard de Hugging Face, donde obtiene una media de WER del 3.81 % en ocho conjuntos de evaluación públicos. El sistema se compone de un modelo "ancla" (Qwen3-ASR-1.7B-hf-orze) y dos votantes independientes (Hojo-ASR-V1 y MOSS-Transcribe-preview-2B). La transcripción final se conserva la del ancla salvo que ambos votantes coincidan en la misma edición de palabra alineada, lo que reduce errores de forma consistente sin necesidad de entrenar un nuevo modelo.

El conjunto completo suma 9,64 mil millones de parámetros, pero al ejecutarse secuencialmente, el pico de memoria de inferencia es el del componente más grande (5,18B). Está optimizado para audio corto en inglés y su licencia es Apache-2.0, lo que permite uso comercial sin restricciones. Su relevancia radica en que demuestra cómo un ensamblaje por consenso puede mejorar la precisión de un ASR de alto rendimiento sin sacrificar la reproducibilidad, ya que el evaluador completo es público y reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema de consenso sobre tres modelos transformer (ancla + dos votantes) |
| Parámetros totales | 9,64 B (2,04 B + 5,18 B + 2,42 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los componentes se cargan en precisión nativa, probablemente fp16) |
| Idiomas soportados | inglés (solo en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (componentes Hugging Face) |

## Arquitectura y entrenamiento

El sistema no es un modelo único sino un ensamblado determinístico. El ancla es una especialización de Qwen3-ASR-1.7B-hf (arquitectura transformer del grupo Qwen de Alibaba Cloud) ajustada para inglés por Boson AI. Los dos votantes son Hojo-ASR-V1 (5,18 B) y MOSS-Transcribe-preview-2B (2,42 B), ambos también transformer. La regla de consenso es fija: se conserva la transcripción del ancla a menos que ambos votantes coincidan en la misma sustitución, eliminación o inserción alineada. La alineación se realiza tras aplicar el normalizador oficial del Open ASR Leaderboard. No se ha entrenado ningún modelo nuevo para el consenso; solo el ancla fue fine-tuned en este trabajo. El evaluador oficial se ejecuta en un contenedor Docker reproducible que incluye los tres pasos de inferencia.

## Capacidades

- Reconocimiento de voz en inglés en formato de texto, con precisión alta en acentos y entornos variados.
- Generación de transcripciones para audio corto (entrevistas, llamadas, conferencias, etc.).
- El sistema es determinístico: para la misma entrada produce siempre la misma salida, lo que facilita la reproducibilidad.
- No incluye funciones adicionales como detección de idioma, marcas de tiempo, traducción o síntesis de voz.
- No admite tool calling, agentes ni razonamiento multi-paso; es exclusivamente un sistema de ASR.
- No es multilingüe; solo procesa audio en inglés.

## Casos de uso

- Subtitulado automático de vídeos y conferencias: el sistema puede transcribir reuniones o seminarios en inglés con WER muy bajo (p. ej., 1,02 % en LibriSpeech test-clean), lo que reduce la necesidad de edición manual.
- Transcripción de llamadas de atención al cliente: con un WER medio del 3,81 % en conjuntos como VoxPopuli (2,78 %) y Earnings22 (5,24 %), es adecuado para generar registros de llamadas en centros de contacto.
- Generación de subtítulos en tiempo diferido para podcasts y contenido audiovisual: su velocidad de procesamiento (29,66 RTFx) permite transcribir grandes volúmenes de audio en pocos minutos.
- Asistentes de dictado para profesionales: puede transcribir notas de voz o entrevistas con alta fidelidad, reduciendo errores en términos técnicos.
- Evaluación de calidad de ASR en entornos de investigación: sirve como sistema de referencia para comparar otros modelos, gracias a su reproducibilidad y resultados públicos.
- Automatización de transcripciones para archivado o búsqueda: su licencia Apache-2.0 permite integrarlo en pipelines de procesamiento documental sin coste de licencia.

## Benchmarks y rendimiento

Resultados en el Open ASR Leaderboard (evaluador oficial, normalizador commit `d1e99b25524814332d6868a5645e568670834cfb`):

| Dataset | WER (%) |
|---|---|
| AMI Cleaned | 6,93 |
| Earnings22 Cleaned AA (chunked) | 5,24 |
| GigaSpeech Cleaned | 6,68 |
| LibriSpeech test-clean | 1,02 |
| LibriSpeech test-other | 2,41 |
| SPGISpeech | 1,58 |
| VoxPopuli Cleaned AA | 2,78 |
| **Media** | **3,81** |

Además, se evaluó el consenso en un conjunto conversacional de retención (AppTek multi-accent call-center) con tres selecciones deterministas de 200 segmentos. El consenso mejoró consistentemente el WER del ancla (por ejemplo, en la selección 1 pasó de 10,23 % a 9,88 %), mientras que los votantes individuales fueron peores que el ancla en todas las selecciones.

No se han publicado resultados comparativos con otros sistemas externos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ejecutar los tres modelos secuencialmente, la memoria pico es la del componente más grande (Hojo-ASR-V1, 5,18 B parámetros). En FP16, requiere aproximadamente 10 GB de VRAM para ese modelo; el conjunto completo puede necesitar 15-16 GB si se cargan los tres a la vez, pero el diseño secuencial permite usar menos.
- GPU recomendadas: para inferencia con el mayor componente, una GPU con 12 GB o más (RTX 3080/3090, RTX 4090, A10, L4) es suficiente. Para uso en producción con alta concurrencia, se recomienda A100 o H100.
- Cabe en GPU de consumo: sí, en una RTX 3090 o 4090 se puede ejecutar el sistema completo con batch de 1.
- Opciones de despliegue: se puede integrar mediante Hugging Face Transformers para cada componente por separado y aplicar la regla de consenso en un script. No se menciona soporte nativo para vLLM, TGI o llama.cpp en la documentación, pero al ser modelos transformer estándar, pueden servirse con vLLM si se convierte cada uno en un modelo servido, y luego se orquesta el consenso.
- Latencia y throughput: el sistema reporta un throughput agregado de 29,66 RTFx (factor de tiempo real), que incluye la inferencia de los tres modelos y el solapamiento del alineado. La latencia por transcripción dependerá de la longitud del audio y la GPU; en una GPU moderna, para un audio de 10 segundos, se espera un tiempo de procesamiento inferior a 1 segundo.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros sistemas ASR en la información proporcionada. Sin embargo, se puede comparar con los componentes individuales y con el modelo ancla original Qwen3-ASR-1.7B-hf:

| Modelo | Parámetros | Contexto | WER (LibriSpeech test-clean) | Licencia |
|---|---|---|---|---|
| Qwen3-ASR-1.7B-hf | 1,7 B | no disponible | no disponible | Apache-2.0 |
| Qwen3-ASR-1.7B-hf-orze (ancla) | 2,04 B | no disponible | 1,02 (en consenso) | Apache-2.0 |
| Hojo-ASR-V1 | 5,18 B | no disponible | no disponible | Apache-2.0 |
| MOSS-Transcribe-preview-2B | 2,42 B | no disponible | no disponible | Apache-2.0 |
| **Orze-ASR-3Way** | **9,64 B** | **no disponible** | **1,02 (consenso)** | **Apache-2.0** |

La comparación con otros sistemas como Whisper large-v3 (1,5 B) o modelos comerciales no se ha publicado en la información disponible.

## Limitaciones y advertencias

- Solo funciona en inglés; no soporta otros idiomas ni audio multilingüe.
- Optimizado para discurso corto; en audios muy largos o con múltiples hablantes, puede degradarse el rendimiento.
- El sistema es pesado en términos de cómputo: la inferencia requiere ejecutar tres modelos secuencialmente, lo que triplica la latencia frente a un único modelo.
- No se han publicado detalles sobre sesgos o alucinaciones específicos; como cualquier modelo ASR, puede cometer errores en términos poco frecuentes o con acentos muy marcados, aunque el consenso reduce la probabilidad.
- La regla de consenso es estricta: solo acepta cambios si ambos votantes coinciden, lo que puede dejar pasar errores del ancla si los votantes no coinciden en el mismo cambio.
- No se proporciona información sobre el entrenamiento de los votantes (Hojo-ASR-V1 y MOSS-Transcribe-preview-2B), por lo que se desconoce su origen y posibles sesgos.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar que los componentes de los votantes también cumplen esa licencia; según la model card, todos son Apache-2.0.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/bosonai/Orze-ASR-3Way](https://huggingface.co/bosonai/Orze-ASR-3Way)
- Ancla (Qwen3-ASR-1.7B-hf-orze): [https://huggingface.co/bosonai/Qwen3-ASR-1.7B-hf-orze](https://huggingface.co/bosonai/Qwen3-ASR-1.7B-hf-orze)
- Votante 1 (Hojo-ASR-V1): [https://huggingface.co/HojoAI/Hojo-ASR-V1](https://huggingface.co/HojoAI/Hojo-ASR-V1)
- Votante 2 (MOSS-Transcribe-preview-2B): [https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-preview-2B](https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-preview-2B)
- Evaluador reproducible (Docker): [https://huggingface.co/spaces/erik-at-boson/open-asr-leaderboard-orze-ensemble](https://huggingface.co/spaces/erik-at-boson/open-asr-leaderboard-orze-ensemble)
- Repositorio de Qwen3-ASR (modelo base): [https://github.com/QwenLM/Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR)
- Sitio web de Boson AI: [https://www.boson.ai/](https://www.boson.ai/)
- GitHub de Boson AI: [https://github.com/boson-ai](https://github.com/boson-ai)
