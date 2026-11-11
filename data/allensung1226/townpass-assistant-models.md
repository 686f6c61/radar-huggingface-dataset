# allensung1226/townpass-assistant-models

## Resumen

TownPass on-device assistant models es un repositorio de artefactos de inferencia (no un modelo único entrenado desde cero) publicado por el usuario allensung1226 para la aplicación "台北一點就通！微服務入口整合助理", un asistente on-device integrado en un fork de la app TownPass / 台北通. El repositorio agrupa conversiones a GGUF y whisper.cpp de modelos de terceros, junto con índices de recuperación (RAG) construidos a partir de datos abiertos del Ayuntamiento de Taipéi, con el objetivo de que el asistente funcione íntegramente en el teléfono sin enviar audio ni texto a servidores externos.

El contenido incluye un modelo de embeddings multilingüe (multilingual-e5-small de Microsoft, cuantizado a q8_0), un índice vectorial de 8.121 entradas de preguntas frecuentes municipales con sus metadatos, y dos modelos de reconocimiento automático de voz convertidos a formato ggml: PhoWhisper-base (VinAI, para vietnamita) y Breeze-ASR-26 (MediaTek Research, para taiwanés). La app descarga estos ficheros bajo consentimiento del usuario y verifica tamaño y SHA-256 contra un manifiesto interno antes de cargarlos.

El repositorio declara 117.505.920 parámetros totales en safetensors y un tamaño de 2,8 GB. Es relevante para desarrolladores que construyen asistentes móviles multilingües con requisitos estrictos de privacidad y para quienes necesitan pipelines de ASR y recuperación semántica empaquetados para despliegue en dispositivo, aunque no aporta un modelo generativo propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Varias: transformer de embeddings (e5-small), encoder-decoder tipo Whisper (PhoWhisper-base, Breeze-ASR-26); índice RAG vectorial |
| Parametros totales | 117.505.920 (declarados en safetensors); el repo empaqueta varios modelos de distinto tamaño |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 (e5-small, PhoWhisper-base, Breeze-ASR-26) y q4_K (Breeze-ASR-26 para dispositivos con 8 GB de memoria) |
| Idiomas soportados | zh, nan (taiwanés), vi |
| Licencia | mixta: MIT (multilingual-e5-small), BSD-3-Clause (PhoWhisper), Apache-2.0 (Breeze-ASR-26), Open Government Data License v1.0 (datos FAQ de Taipéi) |
| Formato de pesos | GGUF (llama.cpp) y ggml (whisper.cpp); índice en binario float32 y JSON |

## Arquitectura y entrenamiento

El repositorio no entrena modelos nuevos: realiza conversiones de formato y cuantización de modelos existentes. multilingual-e5-small es un transformer de embeddings de Microsoft convertido a GGUF y cuantizado a q8_0 para su uso con `llama-server --embedding`; se emplea para generar el índice vectorial de las FAQ municipales (8.121 entradas × 384 dimensiones float32, normalizadas, en orden row-major). PhoWhisper-base de VinAI y Breeze-ASR-26 de MediaTek Research son modelos tipo Whisper convertidos a ggml con el script `convert-h5-to-ggml.py` de whisper.cpp y cuantizados con `whisper-quantize`; Breeze-ASR-26 se ofrece además en q4_K para teléfonos con 8 GB de RAM.

Los datos de recuperación proceden del conjunto abierto "臺北市市政網站整合平台之常見問答" del Ayuntamiento de Taipéi, publicado bajo Open Government Data License v1.0, e incluyen preguntas, respuestas y departamento responsable. No se documentan procesos de RLHF, DPO ni datos de entrenamiento adicionales; las conversiones, según el autor, solo cambian formato y precisión numérica, no lo aprendido por los modelos originales, y no cuentan con el aval de los autores originales.

## Capacidades

- Generación de embeddings de texto multilingües mediante multilingual-e5-small para búsqueda semántica y recuperación aumentada (RAG).
- Recuperación sobre un corpus de 8.121 preguntas frecuentes del Ayuntamiento de Taipéi con metadatos de departamento.
- Reconocimiento automático de voz en vietnamita con PhoWhisper-base.
- Reconocimiento automático de voz en taiwanés (nan) con Breeze-ASR-26, en dos niveles de cuantización.
- Ejecución íntegra on-device: sin envío de audio ni texto a servidores externos.
- Verificación de integridad de los ficheros descargados mediante SHA-256 y tamaño contra un manifiesto interno.
- Compatibilidad con endpoints (`endpoints_compatible`) y con los servidores `whisper-server` y `llama-server`.
- No incluye modelo generativo de texto propio: la app descarga Whisper tiny/small, Ministral 3B y Gemma 4 E2B desde los repositorios de sus autores.

## Casos de uso

- Asistente municipal en el móvil: la app combina el índice de FAQ con e5-small para responder consultas sobre trámites de Taipéi sin conexión ni envío de datos, útil en entornos con requisitos de privacidad.
- Transcripción de voz en vietnamita para residentes extranjeros: PhoWhisper-base en q8_0 permite dictar consultas en vietnamita y pasarlas al pipeline de recuperación.
- Transcripción en taiwanés: Breeze-ASR-26 en q8_0 (o q4_K en móviles de 8 GB) cubre el reconocimiento de habla taiwanesa, poco soportada por modelos genéricos.
- Búsqueda semántica sobre datos abiertos: el par embeddings.bin + metadata.json se puede reutilizar para construir interfaces de consulta sobre el corpus de FAQ de Taipéi.
- Despliegue de referencia para pipelines on-device: sirve como ejemplo de empaquetado de ASR + embeddings + RAG con verificación de integridad por SHA-256 en una app móvil.
- Evaluación de cuantizaciones en móvil: permite comparar q8_0 frente a q4_K de Breeze-ASR-26 en términos de memoria y calidad en dispositivos de gama media.
- Integración en servidores ligeros: los GGUF pueden cargarse con `llama-server --embedding` y los ggml con `whisper-server` para prototipos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: e5-small q8_0 ocupa 132.441.760 bytes (~126 MB); PhoWhisper-base q8_0, 81.768.602 bytes (~78 MB); Breeze-ASR-26 q8_0, 1.656.129.708 bytes (~1,54 GB); Breeze-ASR-26 q4_K, 888.932.908 bytes (~848 MB); índice de embeddings, 12.473.856 bytes (~12 MB) más metadatos de 6.572.186 bytes (~6,3 MB).
- El autor indica que la variante q4_K de Breeze-ASR-26 está pensada para teléfonos con 8 GB de memoria; la q8_0 requiere más margen.
- GPU de escritorio: no se especifican modelos recomendados (A100, H100, RTX 4090, etc.) en la información disponible; los artefactos están orientados a CPU móvil.
- Cabe en GPU de consumo por tamaño, pero no hay datos de rendimiento publicados para confirmar latencias.
- Opciones de despliegue: whisper.cpp (`whisper-server`) para los modelos de voz y llama.cpp (`llama-server --embedding`) para e5-small; integración en la app mediante descarga desde Hugging Face con verificación SHA-256.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TownPass on-device assistant models (este repo) | Paquete ASR + embeddings + RAG | 117.505.920 declarados (varios artefactos) | no disponible | Mixta (MIT, BSD-3-Clause, Apache-2.0, OGDL v1.0) | Hugging Face, 0 descargas |
| intfloat/multilingual-e5-small | Embeddings | no disponible en la informacion | no disponible | MIT | Hugging Face (autor original) |
| vinai/PhoWhisper-base | ASR | no disponible en la informacion | no disponible | BSD-3-Clause | Hugging Face (autor original) |
| MediaTek-Research/Breeze-ASR-26 | ASR | no disponible en la informacion | no disponible | Apache-2.0 | Hugging Face (autor original) |

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: son conversiones de terceros sin aval de los autores originales; los cambios se limitan a formato y precisión numérica.
- Idiomas cubiertos únicamente zh, nan y vi; no hay soporte documentado para castellano ni otras lenguas.
- No incluye modelo generativo propio; la generación de respuestas depende de modelos externos (Ministral 3B, Gemma 4 E2B, Whisper tiny/small) descargados aparte.
- Licencia mixta: cada artefacto tiene su propia licencia (MIT, BSD-3-Clause, Apache-2.0, OGDL v1.0); es necesario revisar `LICENSES/` antes de uso comercial y respetar la atribución al Ayuntamiento de Taipéi para los datos de FAQ.
- Los datos de FAQ proceden de una fuente gubernamental concreta y pueden quedar desactualizados; no hay mecanismo de actualización documentado.
- Riesgo de alucinación y errores de recuperación inherente al pipeline RAG, aunque no se documentan evaluaciones.
- Sin descargas ni likes en el momento de la consulta; sin benchmarks publicados que permitan validar calidad.
- El repositorio incluye una referencia a arXiv:2603.19259 (Lan et al., 2026) para Breeze-ASR-26; conviene verificar su disponibilidad y contenido antes de citarla.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/allensung1226/townpass-assistant-models
- Fork de la app TownPass: https://github.com/goodmorning1226/TownPass
- multilingual-e5-small (Microsoft): https://huggingface.co/intfloat/multilingual-e5-small
- PhoWhisper-base (VinAI): https://huggingface.co/vinai/PhoWhisper-base
- Breeze-ASR-26 (MediaTek Research): https://huggingface.co/MediaTek-Research/Breeze-ASR-26
- Datos de FAQ del Ayuntamiento de Taipéi: https://data.taipei/dataset/detail?id=203f1657-bb4a-45a7-b25f-279b63136645
- Paper de Breeze-ASR-26 (Lan et al., 2026): arXiv:2603.19259
