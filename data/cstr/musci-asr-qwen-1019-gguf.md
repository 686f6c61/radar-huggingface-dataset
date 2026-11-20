# cstr/musci-asr-qwen-1019-GGUF

## Resumen

Musci-ASR-qwen-1019-GGUF es la conversión a formato GGUF del modelo Musci-ASR-qwen-1019, un ajuste fino de investigación no oficial de Qwen3-ASR-1.7B desarrollado por Musci Research. El modelo original se entrenó con GRPO (Group Relative Policy Optimization) sobre los prompts de entrenamiento del Open ASR Leaderboard y un conjunto curado de casos difíciles, con el objetivo de mejorar la precisión en reconocimiento automático de voz (ASR). Esta versión GGUF la publica el usuario cstr para su uso con el runtime CrispASR.

El repositorio contiene tres cuantizaciones (F16, Q8_0 y Q4_K) generadas mediante conversión de formato y cuantización, sin reentrenamiento. El modelo conserva la configuración, tokenizer, plantilla de chat y preprocesador del modelo base Qwen3-ASR-1.7B, por lo que es compatible con el runtime estándar `qwen3` de CrispASR. Cuenta con 2.349.243.536 parámetros y una licencia Apache-2.0 heredada del modelo original.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y cuantizada para transcripción de audio en local, con validación numérica documentada frente a la referencia fp32. Sin embargo, se trata de un fine-tune de investigación no oficial, con cero descargas y sin benchmarks públicos de precisión más allá de la validación de equivalencia numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (basada en Qwen3-ASR-1.7B) |
| Parametros totales | 2.349.243.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K |
| Idiomas soportados | no disponible (la model card menciona detección automática de idioma y validación en inglés y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ggml); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Musci-ASR-qwen-1019 es un fine-tune de Qwen3-ASR-1.7B, un modelo de reconocimiento automático de voz con arquitectura transformer que incluye un front-end convolucional (mel + conv), 24 bloques de encoder, una capa `ln_post` y un proyector hacia el decoder. El ajuste fino se realizó con GRPO sobre los prompts de entrenamiento del Open ASR Leaderboard y un conjunto curado de casos difíciles. La configuración, tokenizer, plantilla de chat y preprocesador son idénticos a los del modelo base.

Esta versión GGUF no introduce cambios de arquitectura ni reentrenamiento: solo aplica conversión de formato y cuantización. La validación documentada en la model card convierte los safetensors en la revisión `c376e9c4` (con verificación sha256) y compara las tres cuantizaciones contra la referencia fp32 de `qwen_asr` en dos clips (`jfk.wav` en inglés y `paraformer_zh.wav` en chino), verificando cada etapa del pipeline con `crispasr-diff qwen3`.

## Capacidades

- Reconocimiento automático de voz (transcripción de audio a texto).
- Detección automática de idioma en la entrada de audio.
- Soporte de selección manual de idioma mediante el flag `-l` (validado en inglés y chino).
- Compatibilidad con el runtime CrispASR mediante `--backend qwen3` o `-m musci-asr`.
- Ejecución local con cuantizaciones de 1,49 GB a 4,70 GB.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo puede transcribir audio sin conexión a servicios en la nube, usando la cuantización Q4_K (1,49 GB) en equipos con recursos limitados.
- Subtitulado automático de vídeo: integrable en pipelines de procesamiento por lotes con CrispASR para generar transcripciones de clips cortos en inglés o chino.
- Dictado por voz en aplicaciones de escritorio: el tamaño reducido de Q8_0 (2,51 GB) permite integrarlo en herramientas de escritorio con detección automática de idioma.
- Procesamiento de audio en entornos con GPU de gama media: la cuantización Q4_K reduce los requisitos de memoria, lo que facilita el despliegue en estaciones de trabajo sin aceleradores de gama alta.
- Investigación en ASR: útil como punto de partida para experimentos de ajuste fino o comparación de cuantizaciones, dado que el modelo base es un fine-tune de investigación con licencia Apache-2.0.
- Transcripción de audio en inglés y chino para prototipos: la validación documentada cubre ambos idiomas con WER 0 en el clip JFK y CER 0 tras normalización en el clip chino para Q4_K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la validación de equivalencia numérica frente a la referencia fp32:

| Prueba | Resultado |
|---|---|
| F16, todas las etapas (mel, conv, 24 bloques de encoder, `ln_post`, proyector, prompt ids, logits del primer paso) | Cosine 1.000000 en ambos clips |
| Transcripciones (3 cuantizaciones × 2 clips) | Las seis coinciden con la referencia fp32 |
| Q4_K en clip chino | Solo cambia la puntuación (CER 0 tras normalización) |
| JFK WER | 0 para todas las cuantizaciones |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB con Q4_K, 2,5 GB con Q8_0 y 4,7 GB con F16 (tamaños de archivo; la VRAM real depende del runtime y del audio de entrada).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: Q4_K (1,49 GB) y Q8_0 (2,51 GB) caben en GPUs de consumo con 4-8 GB de VRAM; F16 requiere al menos 6 GB.
- Opciones de despliegue: CrispASR con `--backend qwen3` o `-m musci-asr`; no se documentan otros runtimes (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Musci-ASR-qwen-1019-GGUF | 2,35 B | no disponible | Apache-2.0 | GGUF | Fine-tune de investigación con GRPO; validación numérica documentada |
| Qwen3-ASR-1.7B (base) | no disponible (1,7 B según nombre) | no disponible | Apache-2.0 | safetensors | Modelo oficial de Qwen; base del fine-tune |
| Musci-ASR-qwen-1019 (original) | 2,35 B | no disponible | Apache-2.0 | safetensors | Modelo original sin cuantizar |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un fine-tune de investigación no oficial; no es un lanzamiento oficial de Qwen.
- El repositorio tiene cero descargas y cero likes, sin validación comunitaria independiente.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-ASR-1.7B puede heredar los sesgos del modelo base.
- Riesgo de alucinación en transcripciones no cuantificado; solo se valida equivalencia numérica frente a la referencia fp32, no calidad en dominios diversos.
- Idiomas soportados no documentados formalmente; la validación se limita a inglés y chino.
- No se documenta la longitud de contexto ni el límite de duración de audio.
- Licencia Apache-2.0 permite uso comercial, pero al ser un fine-tune no oficial conviene verificar las condiciones del modelo base Qwen3-ASR-1.7B.
- Solo se documenta compatibilidad con CrispASR; no hay soporte confirmado para otros runtimes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cstr/musci-asr-qwen-1019-GGUF
- Modelo original: https://huggingface.co/Musci-research/Musci-ASR-qwen-1019
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
