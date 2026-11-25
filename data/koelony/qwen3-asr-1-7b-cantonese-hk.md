# koelony/Qwen3-ASR-1.7B-Cantonese-HK

## Resumen

Qwen3-ASR-1.7B-Cantonese-HK es un ajuste fino completo (full fine-tune) del modelo de reconocimiento automático del habla Qwen/Qwen3-ASR-1.7B, desarrollado por el usuario koelony (Joe, @joe2643). Su objetivo es especializar el modelo base en cantonés coloquial de Hong Kong (yue-HK) con conmutación de código (code-switching) hacia el inglés, un escenario que los modelos ASR multilingües genéricos cubren de forma deficiente. El modelo conserva la arquitectura del original, un transformer de aproximadamente 2.038 millones de parámetros (2,04 mil millones) con encoder acústico y decoder de lenguaje, y se distribuye en pesos BF16 en formato Transformers.

La relevancia del modelo radica en dos frentes. Por un lado, reduce de forma sustancial la tasa de error de caracteres (CER) frente al modelo base y frente a whisper-large-v3 en todos los conjuntos de evaluación cantoneses publicados, incluyendo code-switching cantonés-inglés. Por otro, incorpora soporte nativo de sesgo por contexto y vocabulario de palabras clave (hotword biasing), lo que permite condicionar la transcripción con glosarios de dominio sin que el modelo reproduzca el prompt en la salida. El modelo emite directamente caracteres tradicionales de Hong Kong con formas coloquiales (係, 喺, 嘅, 咗, 㗎, 閂) y mantiene las palabras inglesas en inglés.

La versión actual es la v2.1 (2026-11-14), que mejora cinco de los seis benchmarks estándar respecto a la v2 y añade la alineación del sesgo por vocabulario. El repositorio incluye los pesos BF16 originales, una variante para ComfyUI-Drama3 y enlaces a repositorios derivados en GGUF, FP8 y NVFP4. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (Qwen3-ASR), segun modelo base |
| Parametros totales | 2.038.052.480 (2,04 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (original), GGUF Q4_K_M, Q6_K, Q6_K_H (recomendado), Q8_0, FP8 W8A8, NVFP4A16 |
| Idiomas soportados | yue (cantonés, yue-HK), zh (chino), en (inglés); entrenado para cantonés y code-switching cantonés-inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, Transformers); GGUF y variantes cuantizadas en repositorios derivados |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-ASR-1.7B (revision 7278e1e) y se obtiene mediante un ajuste fino de todos los parámetros, sin adaptadores LoRA ni PEFT. Mantiene por tanto la arquitectura del modelo base: un sistema ASR con componente acústico y decoder de lenguaje de aproximadamente 2,04 mil millones de parámetros. El entrenamiento se orienta a cantonés coloquial de Hong Kong y a la conmutación de código cantonés-inglés, con el objetivo de que la salida sea en caracteres tradicionales de Hong Kong y preserve las palabras inglesas sin traducirlas. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

La innovación técnica destacable de la v2.1 es la alineación del sesgo por contexto y vocabulario de dominio (context/hotword vocabulary biasing). Según la model card, esta versión reduce el CER en el escenario de comando corto con glosario largo del 21,88% al 7,19%, con un 0,0% de reproducción del prompt en la salida (prompt parroting). Además, en la sonda de entidades de Hong Kong (entity_probe_v1, 220 enunciados, 271 menciones, 20 distractores por enunciado), la v2.1 alcanza un recall de entidades del 94,83% frente al 89,67% anterior, con una tasa de corrección del 53,57% (15 de 28) y una tasa de rotura del 0,41%, sin copia falsa de distractores (0 de 4.400). No se detalla si el ajuste incluyó RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en cantonés de Hong Kong (yue-HK), con salida nativa en caracteres tradicionales y formas coloquiales.
- Conmutación de código cantonés-inglés: mantiene las palabras inglesas en inglés dentro de la transcripción.
- Sesgo por contexto y vocabulario de dominio (hotword/context biasing): permite condicionar la transcripción con glosarios, con 0,0% de reproducción del prompt en las pruebas publicadas.
- Salida en chino (zh) e inglés (en), además de cantonés, según los idiomas declarados.
- Integración con Transformers, vLLM (variantes FP8 y NVFP4), llama.cpp (GGUF) y ComfyUI-Drama3.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción ASR.

## Casos de uso

- Transcripción de reuniones y actas del Consejo Legislativo de Hong Kong: el modelo obtiene un CER del 7,16% en el conjunto LegCo, adecuado para generar borradores de actas que luego revisa un humano.
- Subtitulado de contenido audiovisual en cantonés coloquial: la salida en caracteres tradicionales de Hong Kong con formas coloquiales evita la normalización a chino escrito estándar que degrada la fidelidad de los subtítulos.
- Transcripción de pódcasts y vídeos de YouTube con mezcla cantonés-inglés: el modelo alcanza un MER del 12,33% en el conjunto T1 de 1.292 segmentos, con un recall de palabras inglesas del 76,22%, superior al 63,53% del modelo base.
- Atención al cliente y asistentes de voz en Hong Kong: el sesgo por glosario permite fijar nombres de productos, marcas y entidades locales, con un recall de entidades del 94,83% en la sonda publicada y sin copia de distractores.
- Dictado y transcripción de comandos cortos con vocabulario específico de dominio: el escenario de comando corto con glosario largo reduce el CER al 7,19%, útil en entornos de manos libres o industriales.
- Integración en flujos de ComfyUI: la variante en el directorio comfyui/ permite usar el modelo con el cargador nativo de Qwen3-ASR de ComfyUI-Drama3 para pipelines de audio.
- Despliegue en local con llama.cpp: la variante GGUF Q6_K_H (recomendada) permite ejecutar la transcripción en estaciones de trabajo sin GPU de datacenter.
- Evaluación e investigación en ASR cantón: los scripts de evaluación del repositorio de GitHub permiten reproducir los benchmarks y comparar variantes.

## Benchmarks y rendimiento

Tasa de error de caracteres (CER) con decodificación greedy en BF16 con Transformers. Texto convertido a simplificado (OpenCC t2s), números normalizados y espacios eliminados; idioma forzado a cantonés.

| Conjunto de prueba | Qwen3-ASR-1.7B base | v1 | v2 | v2.1 (esta version) | whisper-large-v3 |
|---|---:|---:|---:|---:|---:|
| FLEURS (yue_hant_hk) | 4,20% | 4,00% | 3,95% | 3,89% | 20,97% |
| Common Voice yue | 5,46% | 3,80% | 3,86% | 3,94% | 36,44% |
| Common Voice 23 zh-HK | 7,65% | 5,18% | 5,09% | 5,02% | 41,76% |
| MDCC | 4,25% | 2,53% | 2,49% | 2,47% | 34,52% |
| LegCo | 7,22% | 7,17% | 7,16% | 7,16% | 32,15% |
| MCE (code-switching cantonés-inglés) | 11,74% | 5,61% | 5,62% | 5,52% | 24,00% |

Suite de prueba de YouTube retenida (T1, 1.292 segmentos, MER neutral respecto al sistema de escritura, L1_PURE_NEUTRAL):

| Variante (BF16, language="Cantonese") | T1 agrupado (1.292) | legacy (279) | jimpae (431) | unseen (582) | code_switch | Recall de palabras EN | Porcentaje simplificado |
|---|---:|---:|---:|---:|---:|---:|---:|
| Qwen3-ASR-1.7B base | 14,28% | 12,26% | 19,80% | 12,25% | 14,95% | 63,53% | (simplificado) |
| v2.1 (esta version) | 12,33% | 10,05% | 18,47% | 10,09% | 12,66% | 76,22% | 0,20% |

Benchmark de sesgo por contexto y vocabulario (suite de 210 clips, 70 por condición):

| Condición | CER v2 | CER v2.1 | Reproducción del prompt v2.1 |
|---|---:|---:|---:|
| Comando corto + glosario largo (short_long_prompt) | 21,88% | 7,19% | 0,0% |
| Acierto de homófono / objetivo de dominio (hit_homo) | 7,50% | 6,54% | 0,0% |
| Glosario de distractores puro (pure_distractor) | 10,14% | 10,02% | 0,0% |

Sonda de entidades de Hong Kong retenida (entity_probe_v1: 220 enunciados, 271 menciones, 20 distractores por enunciado): recall de entidades del 94,83% (frente al 89,67% de la v2), tasa de corrección del 53,57% (15 de 28), tasa de rotura del 0,41% y copia falsa de distractores del 0,00% (0 de 4.400).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4 GB solo para los pesos (2,04 mil millones de parámetros a 2 bytes), más memoria para activaciones y caché; el repositorio completo ocupa 20,4 GB, por lo que se recomienda descargar solo los archivos necesarios.
- La variante GGUF Q4_K_M reduce los pesos a aproximadamente 1,2 GB; Q6_K_H (recomendada por el autor) a aproximadamente 1,7 GB; Q8_0 a aproximadamente 2,2 GB.
- La variante NVFP4A16 es la más pequeña y rápida según el autor, pensada para vLLM.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo cabe en GPU de consumo como RTX 4090, RTX 4080 o RTX 3090 en BF16, y en GPU de menor VRAM con cuantización GGUF o FP8.
- Opciones de despliegue: Transformers, qwen-asr, vLLM (FP8, NVFP4), llama.cpp (llama-server con GGUF), transcribe.cpp y Hex en macOS, ComfyUI-Drama3.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER en FLEURS yue_hant_hk | CER en MCE (code-switching) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Cantonese-HK (v2.1) | 2,04 mil millones | no disponible | 3,89% | 5,52% | Apache 2.0 | Hugging Face, GGUF, FP8, NVFP4, ComfyUI |
| Qwen3-ASR-1.7B (base) | 2,04 mil millones | no disponible | 4,20% | 11,74% | no disponible en la informacion | Hugging Face |
| whisper-large-v3 | no disponible en la informacion | no disponible | 20,97% | 24,00% | no disponible en la informacion | no disponible en la informacion |

La comparativa se limita a los datos publicados en la model card; no se dispone de información sobre parámetros, contexto ni licencia de whisper-large-v3 en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en cantonés y code-switching cantonés-inglés; solo se evaluaron voz en cantonés y en cantonés-inglés, por lo que su rendimiento en otros idiomas o variedades del chino no está documentado.
- Riesgo de alucinación y de errores en la transcripción no cuantificado más allá de las métricas de CER y MER publicadas; el CER en el conjunto LegCo (7,16%) y en el subconjunto jimpae (18,47%) indica margen de error relevante en audio difícil.
- El sesgo por glosario puede inducir copia de términos del contexto; el autor reporta 0,0% de reproducción del prompt y 0,00% de copia falsa de distractores en sus pruebas, pero son resultados de una suite concreta y no garantizan el comportamiento en otros dominios.
- La salida en caracteres tradicionales de Hong Kong con formas coloquiales puede requerir normalización para pipelines que esperan chino escrito estándar.
- No se documentan sesgos demográficos, acentos o condiciones acústicas específicas en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-ASR-1.7B debe verificarse por separado; la información disponible no detalla su licencia.
- El repositorio ocupa 20,4 GB; conviene descargar solo los archivos de la variante necesaria para evitar consumo innecesario de almacenamiento.
- No se especifican requisitos de contexto ni límites de duración de audio en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Variante GGUF: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-GGUF
- Variante FP8: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-FP8
- Variante NVFP4: https://huggingface.co/koelony/Qwen3-ASR-1.7B-Cantonese-HK-NVFP4
- Repositorio GitHub: https://github.com/koelony/qwen3-asr-cantonese-hk
- Demo en vivo: https://demo.koelony.com
- Página del proyecto: https://koelony.com/asr/
- Sitio del autor: https://koelony.com
- ComfyUI-Drama3: https://github.com/PedroMarinhoDev/ComfyUI-Drama3
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Perfil del autor en Hugging Face: https://huggingface.co/joe2643
