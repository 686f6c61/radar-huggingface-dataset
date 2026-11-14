# oruk/orukqwen-asr-1.7b-v2

## Resumen

OrukQwen ASR 1.7B v2 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el laboratorio oruk, especializado en modelos fundacionales de voz. Se trata de un ajuste fino mediante aprendizaje por refuerzo (RL) del modelo Qwen3-ASR-1.7B de Alibaba, orientado a reducir la tasa de error de palabra (WER) en transcripción de inglés. La versión v2 continúa el post-entrenamiento iniciado en v1 con una segunda etapa de GSPO (Grouped Sequence Policy Optimization) que fija el estilo de transcripción para que la señal de recompensa se centre en el contenido y no en la deriva estilística.

El modelo mantiene la arquitectura, el tokenizador y el prompt del modelo base, pero promedia ocho ejecuciones independientes de RL en un único conjunto de pesos (model soup) y se distribuye con una configuración de decodificación beam-search de tres haces. El nombre comercial "1.7B" sigue la nomenclatura de la familia Qwen, pero el recuento real de parámetros es de 2.038.052.480 (aproximadamente 2,04B), según los pesos en safetensors. No es un ensemble en inferencia, sino un único modelo con los pesos promediados.

La relevancia de esta versión radica en su rendimiento declarado: una WER media de 4,66 sobre nueve conjuntos públicos de inglés con el arnés oficial, frente a 4,76 de v1 y 4,94 del modelo base. En la comparación fechada del 7 de noviembre de 2026 sobre siete conjuntos públicos, obtiene 5,4219 de WER media, por delante de NVIDIA Nemotron-3.5-Transcribe-30B-A4B (5,5114) y de Qwen3-ASR-1.7B-hf (5,7457). Estos datos son declarados por el autor y no verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ASR (misma que Qwen3-ASR-1.7B) |
| Parametros totales | 2.038.052.480 (~2,04B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-ASR-1.7B y conserva su arquitectura, tokenizador y prompt de inferencia sin cambios. El trabajo de oruk se centra exclusivamente en el post-entrenamiento mediante RL. La primera etapa (v1) aplicó GSPO sobre el modelo base; la segunda etapa (v2) ejecutó ocho nuevas rondas de GSPO con una función de recompensa que puntúa el contenido frente a la referencia humana y fija el estilo de transcripción (muletillas, repeticiones por disfluencia, espaciado de acrónimos) al transcript de v1 para el mismo clip. El hallazgo que motiva este diseño es que las ganancias ordinarias de RL en ASR son en gran medida deriva estilística: el modelo aprende a eliminar o mantener repeticiones y muletillas, lo que mejora en un benchmark y empeora en otro. Al fijar el estilo, la señal de contenido pasa sin ese sesgo.

Los ocho miembros del pool seleccionado se promedian en un único conjunto de pesos (model soup), de modo que el modelo final no requiere ensemble en inferencia. Se distribuye con una configuración de decodificación beam-search de tres haces, que sustituye la configuración por defecto de v1. El autor indica que el modelo se entrenó y evaluó con el arnés oficial del Open ASR Leaderboard y que la comparación publicada es una comparación fechada de conjuntos públicos, no un ranking oficial del leaderboard.

## Capacidades

- Reconocimiento automático del habla en inglés: transcripción de audio a texto, evaluada sobre nueve conjuntos públicos del Open ASR Leaderboard.
- Manejo de audio de reuniones (AMI), llamadas de resultados financieros (Earnings22), audio de YouTube (Gigaspeech), lectura de libros (LibriSpeech), discursos (SPGISpeech), urgencias médicas (URGENT2024), audio indio-inglés (Voice Arena Monsoon) y discursos parlamentarios (Voxpopuli).
- Robustez en audio lejano de campo cercano y de gafas de realidad aumentada: el autor reporta una mejora de −0,78 de WER en audio far-field de AR-glasses frente a v1.
- Control de estilo de transcripción: la política de recompensa fija el tratamiento de muletillas, repeticiones y espaciado de acrónimos, lo que permite una salida estilísticamente consistente.
- Decodificación beam-search configurable (3 haces por defecto).
- Compatibilidad con la API de transformers y con endpoints (tag endpoints_compatible).
- No se documentan capacidades de tool calling, agentes, visión, audio multilingüe ni modo thinking.

## Casos de uso

- Transcripción de reuniones corporativas: el modelo obtiene 7,68 de WER en AMI-Cleaned, un conjunto de reuniones reales con solapamiento de hablantes y ruido de sala, lo que lo hace adecuado para actas automáticas y búsqueda sobre reuniones grabadas.
- Análisis de llamadas de resultados financieros: con 5,89 de WER en Earnings22-Cleaned-AA-chunked, puede transcribir earnings calls para extracción de entidades, análisis de sentimiento y generación de resúmenes financieros.
- Subtitulado y transcripción de contenido audiovisual: 7,10 de WER en Gigaspeech-Cleaned (audio de YouTube) lo sitúa como opción para pipelines de subtitulado automático en plataformas de vídeo.
- Transcripción de alta fidelidad para lectura y locución: 1,19 de WER en LibriSpeech test-clean y 2,80 en test-other permiten usarlo en audiolibros, podcasts o dictado donde la precisión literal es crítica.
- Documentación clínica y de urgencias: 9,17 de WER en URGENT2024, un conjunto de llamadas de emergencia con ruido y habla espontánea, lo hace viable para transcripción asistida en entornos sanitarios con revisión humana posterior.
- Procesamiento de discursos institucionales y parlamentarios: 1,86 de WER en Voxpopuli-AA-Cleaned facilita la transcripción de sesiones parlamentarias y archivos audiovisuales institucionales para su indexación y consulta.
- Transcripción de inglés con acento indio: 3,50 de WER en Voice Arena Monsoon lo hace adecuado para centros de atención al cliente con agentes o clientes de esa variante.
- Audio de campo lejano en dispositivos vestibles: la mejora reportada en gafas de realidad aumentada sugiere su uso en asistentes de transcripción en tiempo real sobre hardware de captación lejana.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER, menor es mejor; no verificados de forma independiente):

| Conjunto de evaluación | WER (%) |
|---|---:|
| LibriSpeech test-clean | 1,19 |
| Voxpopuli-AA-Cleaned | 1,86 |
| SPGISpeech | 2,75 |
| LibriSpeech test-other | 2,80 |
| Voice Arena Monsoon (en-IN) | 3,50 |
| Earnings22-Cleaned-AA-chunked | 5,89 |
| Gigaspeech-Cleaned | 7,10 |
| AMI-Cleaned | 7,68 |
| URGENT2024 | 9,17 |

Comparación fechada del 7 de noviembre de 2026 sobre siete conjuntos públicos (AMI-Cleaned, Earnings22-Cleaned-AA-chunked, Gigaspeech-Cleaned, SPGISpeech, URGENT2024, Voice Arena Monsoon y Voxpopuli-AA-Cleaned), media equiponderada de WER por conjunto:

| Modelo | WER media (%) | Fuente |
|---|---:|---|
| OrukQwen 2 | 5,4219 | Ejecución propia del arnés oficial con beam-search de 3 haces |
| NVIDIA Nemotron-3.5-Transcribe-30B-A4B | 5,5114 | Media de columnas del board leídas el 9 de noviembre de 2026 |
| Qwen3-ASR-1.7B-hf | 5,7457 | Media de columnas del board leídas el 9 de noviembre de 2026 |

El autor reporta además una WER media de 4,66 sobre nueve conjuntos públicos con el arnés oficial (v1: 4,76; base: 4,94), y una mejora de −0,17 de WER frente a los pesos de v1 sobre 11.080 clips de cinco corpus no usados en entrenamiento ni ajuste (−0,78 en audio far-field de gafas de realidad aumentada). Estas cifras son declaraciones del autor y no una clasificación oficial del leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de ~2,04B parámetros en fp16 requiere del orden de 4 GB solo para pesos, más el overhead del encoder de audio y del runtime; en cuantización de 8 bits o 4 bits el requisito baja, pero el autor no publica cifras ni formatos cuantizados.
- GPU recomendadas: no disponible. No se especifican modelos de GPU probados.
- Compatibilidad con GPU de consumo: no confirmada por el autor. Por tamaño de pesos, un modelo de ~2B en fp16 podría caber en GPUs de consumo con 8 GB o más de VRAM, pero no hay validación publicada.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles (tag endpoints_compatible). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El proyecto hermano Oruk-AI/orukeet ofrece una integración vía exportación ONNX en su propio selector de modelos, pero no se indica que aplique a este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER medio (7 conjuntos, %) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OrukQwen ASR 1.7B v2 | ~2,04B | no disponible | 5,4219 | apache-2.0 | Hugging Face (transformers, safetensors) |
| Qwen3-ASR-1.7B-hf | ~1,7B (nominal) | no disponible | 5,7457 | no disponible en la información | Hugging Face (modelo base) |
| NVIDIA Nemotron-3.5-Transcribe-30B-A4B | 30B totales / A4B activos (MoE) | no disponible | 5,5114 | no disponible en la información | no disponible en la información |

La comparación se limita a los tres modelos incluidos en la tabla fechada del autor. No se dispone de datos de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se declaran otros idiomas.
- Los benchmarks son declaraciones del autor, marcados como no verificados (`verified: false`), y la comparación es una media fechada de conjuntos públicos, no un ranking oficial del Open ASR Leaderboard. El autor indica explícitamente que no reclama el primer puesto ni que los mantenedores del board hayan evaluado esta versión.
- Riesgo de alucinación y de errores en audio ruidoso: la WER sube a 9,17 en URGENT2024 (llamadas de emergencia) y a 7,68 en AMI-Cleaned (reuniones), por lo que en dominios ruidosos o con habla solapada se recomienda revisión humana.
- La mejora frente a v1 es modesta en términos absolutos (−0,17 de WER en el conjunto de validación externa), aunque mayor en audio far-field de gafas AR (−0,78); no debe extrapolarse a todos los dominios.
- El estilo de transcripción está fijado a la salida de v1: puede no coincidir con las convenciones de estilo de otros pipelines o con expectativas de normalización específicas (por ejemplo, tratamiento de muletillas o espaciado de acrónimos).
- No se documentan sesgos conocidos ni evaluaciones de equidad por acento o demografía más allá de Voice Arena Monsoon (inglés indio).
- Licencia apache-2.0: permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-ASR-1.7B, que no se detalla en la información proporcionada.
- No se publican requisitos de hardware, latencia ni formatos cuantizados, lo que dificulta planificar el despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oruk/orukqwen-asr-1.7b-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Web del laboratorio oruk: https://oruk.ai/
- Página de equipo de oruk: https://oruk.ai/company
- Repositorio Oruk-AI/orukeet (ASR multilingüe con exportación ONNX): https://github.com/Oruk-AI/orukeet
- Paper referenciado en tags (arxiv:2601.21337): https://arxiv.org/abs/2601.21337
- Paper referenciado en tags (arxiv:2507.18071): https://arxiv.org/abs/2507.18071
- Paper referenciado en tags (arxiv:2203.05482): https://arxiv.org/abs/2203.05482
- Paper referenciado en tags (arxiv:2109.01903): https://arxiv.org/abs/2109.01903
