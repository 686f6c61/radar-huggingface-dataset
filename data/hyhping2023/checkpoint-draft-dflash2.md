# HYHPING2023/checkpoint-draft-dflash2

## Resumen

El modelo `HYHPING2023/checkpoint-draft-dflash2` es un modelo de borrador (draft model) diseñado para decodificación especulativa, concretamente para acelerar la inferencia del modelo objetivo Qwen3.5-35B-A3B en su variante VCLR3 (fine-tuning para videojuegos y vídeo). No es un modelo de lenguaje autónomo: se ejecuta dentro de un servidor de decodificación especulativa y genera tokens candidatos que el modelo objetivo verifica posteriormente. Los pesos del modelo objetivo no están incluidos en este repositorio.

Desarrollado por el usuario HYHPING2023, este checkpoint implementa la arquitectura DFlash2 de Inco AI, sucesora de DFlash1, con un tamaño de 505 millones de parámetros y una ventana de bloque de 8 tokens. Su relevancia radica en que aborda el problema de la degradación de calidad al final de cada bloque de tokens generados en paralelo, un problema conocido en decodificación especulativa, mediante convoluciones causales dinámicas agrupadas. El modelo está licenciado bajo Apache 2.0 y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (draft model de 5 capas, dual-stream estilo Qwen3, convoluciones causales dinámicas agrupadas) |
| Parametros totales | 505.260.544 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo Qwen3.5-35B-A3B) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (entrenado con corpus mixto de vídeo, chino e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DFlash2 es una arquitectura de difusión por bloques (block diffusion) diseñada específicamente para decodificación especulativa. Este checkpoint concreto utiliza un layout de pesos compatible con z-lab y un tamaño de bloque de 8 tokens. La arquitectura consta de 5 capas de draft dual-stream estilo Qwen3 que operan sobre los estados ocultos capturados del modelo objetivo en las capas `{1, 10, 19, 28, 37}`, utilizando el vocabulario completo de 248k tokens y reutilizando los embeddings y la cabeza de salida del modelo objetivo.

La innovación principal de DFlash2 frente a DFlash1 es la incorporación de convoluciones causales dinámicas agrupadas de dos taps (kernel 2, grupo 16) alrededor de cada subcapa de atención y MLP, que corrigen la degradación de calidad al final de cada bloque (suffix decay). Además, incorpora un selector de candidatos top-16 con rango 256 mediante la función de puntuación `S_t(a,b) = U_t(b) + <A(a) ⊙ H(h_t), B(b)>`.

El entrenamiento se realizó durante 4 épocas sobre un corpus mixto de 70.6k muestras (vídeo, chino e inglés), con arranque en caliente desde el checkpoint DFlash1 b8 mixed2, utilizando FSDP con el modelo objetivo de 35B congelado y pérdida de entropía cruzada con teacher forcing en el selector. El checkpoint final corresponde a `epoch_3_step_35300`.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: el modelo genera bloques de 8 tokens en paralelo que el modelo objetivo verifica, acelerando la inferencia.
- Corrección de degradación de final de bloque: las convoluciones causales dinámicas mejoran la tasa de aceptación condicional hacia el final de cada bloque (0.63 → 0.72).
- Soporte de corpus mixto: entrenado con datos de vídeo, chino e inglés, lo que permite un buen rendimiento en dominios de videojuegos y vídeo.
- Integración con SGLang: compatible con el worker DFLASH de SGLang para servidores de inferencia con decodificación especulativa.
- Reutilización de pesos del modelo objetivo: usa los embeddings y la cabeza de salida del modelo Qwen3.5-35B-A3B, lo que reduce el número de parámetros propios.
- Modo no-thinking: el draft fue entrenado con respuestas sin razonamiento explícito, por lo que se recomienda desactivar el modo thinking en el modelo objetivo.

## Casos de uso

- Aceleración de inferencia para Qwen3.5-35B-A3B VCLR3: el caso principal es servir el modelo objetivo con decodificación especulativa, reduciendo la latencia de generación en producción. Se integra con SGLang mediante `--speculative-algorithm DFLASH`.
- Despliegue de asistentes conversacionales con baja latencia: en aplicaciones de chat donde el modelo objetivo es Qwen3.5-35B-A3B, este drafter permite respuestas más rápidas sin cambiar la calidad de salida.
- Generación de descripciones de vídeo y gameplays: al estar entrenado con un corpus de vídeo, el drafter mantiene una alta tasa de aceptación (3.54 de longitud de aceptación) en bloques de contenido de vídeo, lo que acelera tareas de anotación y descripción automática.
- Procesamiento de texto multilingüe (chino e inglés): para pipelines que sirven Qwen3.5-35B-A3B con contenido mixto zh-en, el drafter ofrece una longitud de aceptación de 2.89 en bloques de texto.
- Evaluación de arquitecturas de decodificación especulativa: investigadores pueden comparar el rendimiento de DFlash2 frente a DFlash1 u otros drafters usando este checkpoint como referencia.
- Fine-tuning experimental: el checkpoint puede servir como punto de partida para entrenar drafters adaptados a otros modelos objetivo de la familia Qwen3.5, dado su layout de pesos compatible con z-lab.

## Benchmarks y rendimiento

Los resultados publicados en la model card del autor son los siguientes (temperatura 0, greedy, bloque de 8 tokens):

| Metrica | DFlash1 baseline | DFlash2 (este modelo) |
|---|---|---|
| Longitud de aceptación offline / ciclo (12.1k bloques, corpus mixto) | 2.72 | **2.97** (+9%) |
| — Bloques de vídeo | — | **3.54** |
| — Bloques de texto | — | 2.89 |
| Longitud de aceptación en SGLang (flujo único, texto) | 1.80 | **2.15** (+19%) |

Además, la tasa de aceptación condicional por posición aumenta de 0.63 a 0.72 hacia el final del bloque, mientras que DFlash1 se mantiene plano en ~0.60. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que este modelo no es un modelo de lenguaje autónomo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 505M de parámetros, lo que en FP16 ocupa aproximadamente 1 GB. Sin embargo, al ser un drafter que se ejecuta junto al modelo objetivo Qwen3.5-35B-A3B, la VRAM total necesaria es la suma de ambos modelos.
- GPU recomendadas: para el modelo objetivo de 35B con cuantización, se recomiendan GPUs con al menos 24 GB de VRAM (RTX 3090/4090) para cuantización 4-bit, o 48 GB+ (A6000, A100) para FP16. El drafter añade un requisito adicional de ~1 GB.
- Compatibilidad con GPU de consumo: el drafter en sí cabe en cualquier GPU consumer, pero el modelo objetivo de 35B requiere cuantización agresiva para caber en GPUs de 24 GB.
- Opciones de despliegue: SGLang con el worker DFLASH (recomendado), usando `--speculative-algorithm DFLASH` y `--speculative-draft-model-path`. También es compatible con el ecosistema transformers para experimentación.
- Latencia y throughput: no se han publicado métricas de latencia absoluta, pero la longitud de aceptación de 2.15-2.97 implica una aceleración de aproximadamente 2-3× frente a decodificación autoregresiva, según el blog de Inco AI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| **HYHPING2023/checkpoint-draft-dflash2** | 505M | no disponible | Apache 2.0 | Drafter para Qwen3.5-35B-A3B VCLR3 |
| **z-lab/Qwen3.8-27B-DFlash2** | no disponible | no disponible | Apache 2.0 | Drafter para Qwen3.8-27B |
| **HYHPING2023/checkpoint-draft-dflash** | no disponible | no disponible | Apache 2.0 | Drafter DFlash1 (baseline) |

El modelo se compara directamente con su predecesor DFlash1 (checkpoint-draft-dflash), ofreciendo una mejora del 9% en longitud de aceptación offline y del 19% en SGLang. Frente al drafter de z-lab para Qwen3.8-27B, ambos implementan DFlash2 pero están adaptados a modelos objetivo diferentes, por lo que no son intercambiables.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no puede generar texto por sí solo; requiere un servidor de decodificación especulativa y el modelo objetivo Qwen3.5-35B-A3B VCLR3.
- Dependencia del modelo objetivo: los pesos del target no están incluidos; el usuario debe proporcionar su propio checkpoint fusionado de Qwen3.5-35B-A3B VCLR3.
- Entrenado solo con respuestas no-thinking: se recomienda desactivar el modo thinking en el modelo objetivo (`enable_thinking: false`), lo que limita su uso en tareas de razonamiento complejo.
- Corpus de entrenamiento limitado: 70.6k muestras, lo que puede limitar la generalización a dominios fuera de vídeo, chino e inglés.
- Compatibilidad con SGLang: las versiones de SGLang anteriores al soporte de DFlash2 ignoran silenciosamente el selector, lo que degrada el rendimiento.
- Sin métricas de seguridad o sesgos publicadas: no hay evaluación de sesgos, toxicidad o alucinaciones, aunque al ser un drafter, su impacto en la salida final es indirecto.
- Descargas y adopción: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica una adopción muy temprana y poca validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/HYHPING2023/checkpoint-draft-dflash2
- Checkpoint DFlash1 (baseline): https://huggingface.co/HYHPING2023/checkpoint-draft-dflash
- Blog de Inco AI sobre DFlash2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Drafter similar para Qwen3.8-27B: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Ficha en interfaze.ai: https://interfaze.ai/models/incoaiqwen38-27b-dflash2
