# CaptchaKraken/TwilightV2-2B-LoRA

## Resumen

TwilightV2-2B-LoRA es el adaptador LoRA sin fusionar del modelo de puntero (pointer model) Twilight V2 de 2B parámetros, desarrollado por CaptchaKraken para la resolución automática de captchas. Se construye sobre el modelo base Qwen/Qwen3.5-2B mediante un adaptador PEFT de rango 16 (alpha 32) aplicado a las proyecciones de atención, atención lineal y MLP del modelo de lenguaje, así como a las capas `qkv`/`proj`/`linear_fc*` de la torre de visión. A diferencia de un modelo generativo convencional, este modelo no produce texto: lee la respuesta completa (acción, puntos, arrastres, texto y momento de vídeo) a partir de un único prefill del prompt.

Este repositorio contiene la salida de entrenamiento sin fusionar: el adaptador LoRA y las cabezas de puntero (`pointer_heads.safetensors`). Está pensado para quien necesite continuar el entrenamiento o fusionar el adaptador sobre una compilación distinta del modelo base. La mayoría de usuarios debería usar el modelo fusionado `CaptchaKraken/TwilightV2-2B` (listo para vLLM) o la versión GGUF (para CPU con llama.cpp).

El modelo forma parte de la familia Twilight V2, que incluye variantes de 0,8B (Sunlight V2), 2B (Twilight V2) y 4B (Midnight V2). La relevancia actual radica en su enfoque especializado: un modelo pequeño (2B) que resuelve captchas reales mediante un único paso de inferencia, con resultados medidos en un conjunto de validación de 1.067 tableros etiquetados manualmente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-2B) con adaptador LoRA y cabezas de puntero |
| Parámetros totales | 2B (modelo base) + adaptador LoRA rango 16 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en este repositorio (el modelo fusionado ofrece bf16 y GGUF Q4_K_M/BF16; la variante q4 GPTQ W4A16 está anunciada pero no publicada) |
| Idiomas soportados | No disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, pointer_heads.safetensors en float32) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-2B, un transformer multimodal con torre de visión. Sobre él se aplica un adaptador LoRA de rango 16 y alpha 32 en las proyecciones de atención, atención lineal y MLP del modelo de lenguaje, y en las capas `qkv`, `proj` y `linear_fc*` de la torre de visión. Las cabezas de puntero añadidas leen la respuesta completa (acción, puntos, arrastres, texto y momento de vídeo) directamente de un único prefill del prompt, sin generación de texto autorregresiva.

El entrenamiento corresponde a la ejecución `20261102-qwen-2b-44k`: 43.963 tableros (aproximadamente 1,9 pasadas sobre 23.343 filas), con tasa de aprendizaje 1e-4 (1e-3 para las cabezas), acumulación de gradiente de 8, checkpointing de gradiente y la mitad de los tableros dibujados con marcas de elemento numeradas. Se entrenó en una única RTX 5080 con 0,65 s por tablero y un pico de 10,8 GiB de VRAM. El prompt es fijo y único: todos los captchas reciben el mismo prompt. El modelo fusionado `TwilightV2-2B` se exportó a partir de esta ejecución.

## Capacidades

- Resolución de captchas mediante lectura de un único prefill: produce la acción, los puntos de clic, los arrastres, el texto y el momento de vídeo sin generar texto.
- Detección de elementos numerados: la mitad de los tableros de entrenamiento incluyen marcas de elemento numeradas procedentes del detector CNN de elementos v2 (`CaptchaKrakenV2-CNN-large`).
- Soporte de múltiples tipos de captcha: acción, puntos, arrastres, texto y momento de vídeo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no genera texto ni ejecuta pasos intermedios.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: cabezas de puntero que leen la respuesta completa de una sola pasada; requiere el cliente CaptchaKraken con el parche `client-fixes.patch` para cargar las cabezas.

## Casos de uso

- Resolución automatizada de captchas en pipelines de automatización web: el modelo lee el tablero completo en un único prefill y devuelve la acción y las coordenadas, lo que permite integrarlo en flujos de scraping o testing sin generación de texto.
- Continuación del entrenamiento o ajuste fino: al ser el adaptador LoRA sin fusionar, permite seguir entrenando sobre nuevas familias de captchas o fusionarlo sobre una compilación distinta de Qwen3.5-2B.
- Investigación en modelos de puntero: sirve como base para estudiar arquitecturas que evitan la generación autorregresiva y leen respuestas estructuradas directamente de la representación del prompt.
- Evaluación de robustez en captchas reales: el conjunto de validación de 1.067 tableros etiquetados manualmente permite medir la precisión en condiciones reales (72,6% sin marcas, 68,2% con marcas).
- Despliegue en entornos con recursos limitados: al partir de un modelo de 2B, la versión fusionada o GGUF puede ejecutarse en CPU o en GPUs de consumo, adecuada para servicios de resolución de captchas de bajo volumen.
- Integración en sistemas de verificación y pruebas: permite generar respuestas a captchas en entornos de test controlados para validar la accesibilidad o la robustez de los propios captchas.

## Benchmarks y rendimiento

Los resultados publicados en la información disponible corresponden al conjunto de validación Tier 2 (1.067 tableros reales etiquetados manualmente), servido mediante vLLM 0.25.1:

| Conjunto | Precisión |
|---|---|
| Tableros sin marcas (plain) | 72,6% |
| Tableros con marcas (marked) | 68,2% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los resultados por tablero y la partición de validación de la ejecución están en el repositorio `CaptchaKraken/TwilightV2-2B` bajo `eval/`.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento usó un pico de 10,8 GiB en una RTX 5080 con checkpointing de gradiente; la inferencia del modelo fusionado en bf16 requiere aproximadamente 4-5 GiB para los pesos de 2B, más el adaptador y las cabezas.
- GPU recomendadas: RTX 5080 (usada en entrenamiento), RTX 4090, A100, H100. El modelo fusionado está pensado para vLLM en GPU.
- Cabe en GPU de consumo: sí, en GPUs con al menos 8 GiB de VRAM para la versión bf16; la versión GGUF Q4_K_M permite ejecución en CPU.
- Opciones de despliegue: vLLM 0.25.1 (probado con el modelo fusionado), llama.cpp (versión GGUF), y el cliente CaptchaKraken con el parche `client-fixes.patch` para cargar las cabezas.
- Latencia y throughput: 0,65 s por tablero durante el entrenamiento en una RTX 5080; no se han publicado cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TwilightV2-2B-LoRA (este) | 2B + LoRA r16 | No disponible | 72,6% plain / 68,2% marked | LGPL-3.0 | Adaptador sin fusionar |
| SunlightV2-0.8B | 0,8B | No disponible | No disponible | No disponible | Modelo fusionado |
| MidnightV2-4B | 4B | No disponible | No disponible | No disponible | Modelo fusionado |

Las tres variantes pertenecen a la misma familia de modelos de puntero de CaptchaKraken y comparten el mismo enfoque de lectura de respuesta en un único prefill. No se dispone de datos de rendimiento de las variantes Sunlight y Midnight en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no está fusionado: requiere fusionarlo sobre Qwen/Qwen3.5-2B y añadir el bloque `pointer` y la arquitectura `CaptchaPointerForConditionalGeneration` en `config.json` para poder usarlo.
- Las cabezas requieren el cliente CaptchaKraken en el commit `ef2ec28` más el parche `client-fixes.patch`; el cliente sin parche rechaza estas cabezas (`PACKED = 225`).
- El modelo no genera texto: no es adecuado para tareas de generación, razonamiento o conversación.
- Riesgo de alucinación en la lectura de coordenadas y acciones: la precisión medida es del 72,6% en tableros sin marcas, por lo que un porcentaje significativo de respuestas será incorrecto.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: LGPL-3.0; el uso comercial está permitido bajo los términos de esta licencia, que exige compartir las modificaciones del código bajo la misma licencia.
- Caveat para producción: el modelo está entrenado con un prompt fijo y único; no admite instrucciones variables ni personalización por prompt.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CaptchaKraken/TwilightV2-2B-LoRA
- Modelo fusionado: https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Versión GGUF: https://huggingface.co/CaptchaKraken/TwilightV2-2B-GGUF
- Variante Sunlight V2 (0.8B): https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Variante Midnight V2 (4B): https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Detector CNN de elementos v2: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Detector CNN de elementos v2 (lite): https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-lite
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
