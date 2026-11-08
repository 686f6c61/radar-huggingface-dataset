# litert-community/LFM3-1.7B-Base-LiteRT

## Resumen

LFM3-1.7B-Base-LiteRT es la conversión al formato LiteRT-LM (TFLite) del checkpoint preentrenado LiquidAI/LFM3-1.7B-Base, publicada por la comunidad litert-community. El objetivo es ejecutar el modelo base directamente en dispositivos de borde (móviles, SoCs ARM, GPUs integradas) sin necesidad de un runtime de PyTorch, empaquetando los pesos en ficheros `.litertlm` con cuantización int8 e int4 mixta y caché KV de 2.048 o 4.096 tokens.

El modelo subyacente es un transformer híbrido de 1,73 mil millones de parámetros en 24 capas que combina 13 convoluciones cortas con compuerta, 5 capas de atención de ventana deslizante y 6 capas de atención global, con un vocabulario de 128.000 tokens y cobertura de 16 idiomas. Al ser un checkpoint base (no instruido), está pensado para continuación de texto y ajuste fino, no para chat directo.

La relevancia actual reside en que demuestra la viabilidad de llevar un modelo de casi 2B parámetros a inferencia on-device con velocidades de decodificación de 28 a 35 tokens/s en hardware móvil de gama alta (Galaxy S26), manteniendo una fidelidad alta respecto al modelo original en bfloat16 (98 % de coincidencia en el token más probable con int8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 13 convoluciones cortas con compuerta, 5 capas de atención de ventana deslizante y 6 de atención global (24 capas) |
| Parametros totales | 1,73 mil millones (1.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 o 4.096 tokens según fichero (`ekv2048` / `ekv4096`); el modelo base declara ventana mayor, pero los ficheros LiteRT-LM limitan la caché KV a esos valores |
| Tipos de cuantizacion | int8 por canal (todos los pesos) e int4 mixta (proyecciones gate/up del MLP en int4 por bloques de 32, resto en int8) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (`lfm1.0`, licencia "other") |
| Formato de pesos | `.litertlm` (LiteRT-LM / TFLite); no se publican safetensors ni GGUF en este repositorio |
| Tamano de los ficheros | 1,44 GB (int4 mixta) y 1,80 GB (int8) |
| Vocabulario | 128.000 tokens |
| Prefill signatures | 1.024, 256, 64, 16, 4 y 1 tokens |
| Runtime requerido | LiteRT-LM 0.19.1 (verificado), construido con litert-torch y litert-lm-builder 0.18.1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido denominado LFM3 por Liquid AI: de las 24 capas, 13 son convoluciones cortas con compuerta (gated short convolutions), 5 usan atención de ventana deslizante y 6 usan atención global. Esta mezcla reduce el coste de atención en secuencias largas y favorece la eficiencia en hardware de borde frente a un transformer denso con atención completa en todas las capas. El vocabulario de 128.000 tokens y la cobertura de 16 idiomas provienen del modelo original.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; el modelo es un checkpoint preentrenado (base), por lo que no incluye post-entrenamiento orientado a instrucciones. La conversión a LiteRT-LM se realizó con litert-torch (commit f61d0b7) y litert-lm-builder 0.18.1. Cada fichero incluye el `tokenizer.json` original byte a byte, la plantilla de chat de LFM3-1.7B con ediciones documentadas y un canal de pensamiento (`<think>` … `</think>`). Los ficheros no declaran sampler ni tipo de activación: LiteRT-LM selecciona el token más probable en cada paso y, en GPU, ejecuta activaciones en fp16.

## Capacidades

- Generación y continuación de texto autoregresiva (modelo base, sin instrucciones).
- Aprendizaje en contexto mediante prompts few-shot (por ejemplo, pares `Question: … / Answer: …`).
- Razonamiento básico y matemáticas elementales vía few-shot (evaluado en GSM8K).
- Capacidades multilingües en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Plantilla de chat incluida con modo de pensamiento (`<think>`) activado por defecto y desactivable con `ThinkingConfig(enable_thinking=False)`.
- Ejecución on-device en CPU y GPU mediante el runtime LiteRT-LM, con backends seleccionables.
- No incluye de forma nativa soporte de tool calling ni de agentes; el autor remite a LFM3-1.7B (versión instruida) para esos casos.

## Casos de uso

- Continuación de texto en aplicaciones móviles: el modelo puede completar fragmentos de texto en el propio dispositivo con los ficheros int4 (1,44 GB), sin conexión a red, usando `--no-template` y un límite de tokens de salida.
- Ajuste fino específico de dominio: al ser un checkpoint base, es la base recomendada por Liquid AI para entrenar asistentes de idioma o de dominio con datos propietarios antes de volver a convertir a LiteRT-LM.
- Clasificación y extracción de información mediante few-shot: incluyendo ejemplos resueltos en el prompt y cortando la respuesta en el siguiente delimitador, se puede usar para tareas de etiquetado o extracción en entornos sin backend.
- Evaluación de razonamiento matemático elemental on-device: los ficheros se han validado con GSM8K en formato few-shot (72,3/100 con int8, 69,0/100 con int4 mixta), útil para prototipos educativos o de verificación.
- Asistentes multilingües embebidos: la cobertura de 16 idiomas permite desplegar un único modelo para aplicaciones de traducción o generación de texto en mercados con varios idiomas.
- Investigación en eficiencia de inferencia: sirve como banco de pruebas para comparar int8 frente a int4 mixta y distintos tamaños de caché KV (2.048 frente a 4.096) en hardware de borde.
- Prototipado de pipelines de generación en Android: con `litert_lm_advanced_main` y `--use_session=true` se puede integrar en aplicaciones Android que requieran generación local con latencia controlada.

## Benchmarks y rendimiento

Datos publicados por el autor de la conversión (2026-11-08, Galaxy S26):

| Metrica | int8 | int4 mixta |
|---|---|---|
| Coincidencia con el token más probable del modelo fuente | 98 % | 93 % |
| GSM8K (media, few-shot) | 72,3 / 100 | 69,0 / 100 |
| Decodificación en GPU (tokens/s, tras prompt de 1.024 tokens) | 28,61 | 32,48 |
| Decodificación en CPU (tokens/s) | 31,13 | 35,11 |
| Prefill en CPU (tokens/s) | 752,2 | 329,6 |
| Tiempo hasta el primer token (prompt de 1.024 tokens, CPU) | 1,39 s | 3,16 s |
| Tamano del fichero | 1,80 GB | 1,44 GB |

Referencia del modelo fuente en bfloat16: 69 en GSM8K. No se han publicado en la información disponible resultados de MMLU, HumanEval ni otros benchmarks estándar para esta conversión.

## Requisitos de hardware

- VRAM/almacenamiento: 1,44 GB para el fichero int4 mixta y 1,80 GB para int8; el consumo en memoria durante la inferencia debe sumar la caché KV (2.048 o 4.096 tokens) y las activaciones en fp16 en GPU.
- Cabe en GPUs de consumo y en móviles de gama alta; las cifras publicadas corresponden a un Galaxy S26 (GPU y CPU).
- GPUs de escritorio: no se han publicado cifras para A100, H100 o RTX 4090; el modelo está orientado a borde, no a servidor.
- Despliegue: runtime LiteRT-LM 0.19.1 (CLI `litert-lm run` y API Python `litert_lm.Engine`), con backends `--backend gpu` o `--backend cpu`; en Android, `litert_lm_advanced_main` con `--use_session=true`.
- No hay soporte documentado en esta ficha para vLLM, llama.cpp, Ollama o TGI, ya que el formato `.litertlm` es específico de LiteRT-LM.
- Latencia y throughput: ver tabla de benchmarks (28,61–35,11 tokens/s en decodificación; 329,6–752,2 tokens/s en prefill en CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Base-LiteRT (este) | 1,73B | 2.048 / 4.096 tokens (caché KV) | `.litertlm` / LiteRT-LM | LFM Open License v1.0 | Modelo base, on-device, 16 idiomas |
| LFM3-1.7B-LiteRT | 1,73B | No disponible en la información | `.litertlm` / LiteRT-LM | LFM Open License v1.0 | Versión instruida; recomendada para chat, tool calling y agentes |
| LiquidAI/LFM3-1.7B-Base | 1,73B | No disponible en la información | Pesos originales (no especificado) | LFM Open License v1.0 | Checkpoint fuente en bfloat16; referencia de calidad (GSM8K 69) |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes (por ejemplo, alternativas de 1–2B para borde); se indica "no disponible".

## Limitaciones y advertencias

- Es un modelo base: no está alineado para instrucciones ni diálogo; el propio autor recomienda LFM3-1.7B para chat, tool calling y agentes.
- No incluye soporte nativo de function calling ni de razonamiento multi-paso orientado a agentes.
- La ventana efectiva en estos ficheros está limitada por la caché KV a 2.048 o 4.096 tokens, muy por debajo de la ventana declarada del modelo original.
- Riesgo de alucinación inherente a un modelo preentrenado; no se han publicado evaluaciones de sesgo en la información disponible.
- La cuantización int4 mixta reduce la fidelidad (93 % de coincidencia frente al 98 % de int8) y el rendimiento en GSM8K (69,0 frente a 72,3).
- La licencia LFM Open License v1.0 impone condiciones específicas; debe revisarse el fichero `LICENSE` antes de cualquier uso comercial.
- El formato `.litertlm` requiere LiteRT-LM 0.19.1; no es directamente compatible con los runtimes habituales de servidor.
- Los ficheros no declaran sampler: la selección es greedy (token más probable), lo que limita la diversidad de las generaciones.
- En Python, se recomienda una instancia de `Engine` por texto; el uso concurrente no está documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM3-1.7B-Base-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Versión instruida: https://huggingface.co/LiquidAI/LFM3-1.7B
- Conversión LiteRT-LM de la versión instruida: https://huggingface.co/litert-community/LFM3-1.7B-LiteRT
- Ficheros de la versión instruida: https://huggingface.co/litert-community/LFM3-1.7B-LiteRT/tree/main
- Licencia: https://huggingface.co/litert-community/LFM3-1.7B-Base-LiteRT/blob/main/LICENSE
