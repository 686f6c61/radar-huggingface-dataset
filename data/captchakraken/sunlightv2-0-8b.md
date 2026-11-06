# CaptchaKraken/SunlightV2-0.8B

## Resumen

SunlightV2-0.8B es un modelo especializado en la resolución de captchas desarrollado por CaptchaKraken. Se construye mediante un ajuste fino con LoRA (rango 16, fusionado) sobre el modelo base Qwen/Qwen3.5-0.8B, al que se añaden pequeñas cabezas de predicción (`pointer_heads.safetensors`) que leen la respuesta completa (acción, puntos, arrastres, texto y momento de vídeo) a partir de un único prefill del prompt. No genera texto: es un modelo de tipo "pointer" que se sirve en vLLM como modelo de pooling mediante el plugin `CaptchaPointerForConditionalGeneration`.

El modelo pertenece a la familia Sunlight V2 (0.8B), que comparte arquitectura con Twilight V2 (2B) y Midnight V2 (4B). Su relevancia radica en que aborda la resolución automatizada de captchas reales (clic, rejilla, vídeo y escritura) con un modelo de menos de mil millones de parámetros, lo que permite despliegues en GPU de gama media y en CPU mediante cuantización. Con 852.985.920 parámetros y un tamaño de repositorio de 1,7 GB en bf16, es un modelo compacto orientado a producción.

La versión de este repositorio contiene los pesos fusionados en bf16 para vLLM en GPU. Existen versiones alternativas del mismo modelo entrenado: GPTQ 4 bits (W4A16), LoRA sin fusionar con cabezas para reentrenamiento y compilaciones GGUF para llama.cpp en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-0.8B) con cabezas pointer añadidas; ajuste LoRA fusionado |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (este repo), GPTQ W4A16 (repo `-q4`), GGUF Q4_K_M y BF16 (repo `-GGUF`) |
| Idiomas soportados | no disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors (bf16), GPTQ, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de 852.985.920 parámetros, sobre el que se aplica un ajuste fino con LoRA de rango 16 que posteriormente se fusiona en los pesos. Sobre la base se añaden cabezas pointer (`pointer_heads.safetensors`) que, a partir de un único prefill del prompt, producen directamente la respuesta completa: acción, puntos, arrastres, texto y momento de vídeo. No hay generación autorregresiva de texto; vLLM lo ejecuta como modelo de pooling a través del plugin `CaptchaPointerForConditionalGeneration`.

El entrenamiento corresponde a la ejecución `20261030-100636-qwen-0.8b`: 43.963 tableros de captcha, una época, learning rate de 1e-4 (1e-3 para las cabezas), acumulación de gradiente 8, y la mitad de los tableros dibujados con marcas numeradas de elementos. Se emplea un prompt fijo único: todos los captchas reciben el mismo prompt. Las marcas numeradas de elementos provienen del detector CNN de la familia, `CaptchaKrakenV2-CNN-large` (con versión lite para CPU). No se especifican en la información disponible datos sobre composición del dataset, número de tokens ni uso de RLHF/DPO.

## Capacidades

- Resolución de captchas de tipo clic: identifica y señala los puntos correctos sobre la imagen.
- Resolución de captchas de rejilla: selecciona las celdas correctas de una cuadrícula.
- Resolución de captchas de vídeo: localiza el momento temporal adecuado en un clip.
- Resolución de captchas de escritura (type): produce el texto solicitado.
- Operaciones de arrastre (drags) además de clics simples.
- Funcionamiento con un único prefill del prompt, sin generación de texto.
- Soporte de marcas numeradas de elementos (boards "marked") además de tableros sin marcar.
- Integración con vLLM 0.25.1 como modelo de pooling mediante plugin.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible (no aplica a su diseño).
- Capacidades de agente o razonamiento multi-paso: no disponible (modelo de predicción directa, no generativo).

## Casos de uso

- Automatización de pruebas de extremo a extremo: el modelo resuelve captchas de clic, rejilla, vídeo y escritura dentro de pipelines de QA que necesitan superar formularios protegidos, con un único prefill por captcha y sin generación de texto.
- Servicio de resolución de captchas en producción: desplegado con vLLM como modelo de pooling, gestiona peticiones concurrentes de imágenes y clips con las cabezas pointer, devolviendo acción y coordenadas directamente.
- Despliegue en CPU sin GPU: la compilación GGUF (Q4_K_M, BF16, con mmproj) permite servir el modelo con llama.cpp en entornos sin acelerador, manteniendo la misma lógica de predicción.
- Despliegue en GPU de gama media: los pesos bf16 (1,7 GB) y la versión GPTQ W4A16 caben en GPUs de consumo, lo que facilita entornos de laboratorio y pruebas a pequeña escala.
- Investigación sobre detección y resolución de captchas: el repositorio LoRA sin fusionar con cabezas permite continuar el entrenamiento y experimentar con nuevas variantes del prompt o de las cabezas.
- Procesamiento de captchas de vídeo: resuelve captchas que requieren identificar un momento temporal concreto en un clip, una modalidad que otros modelos de la categoría no cubren.
- Evaluación comparativa de cuantización: la disponibilidad de bf16 y GPTQ W4A16 con resultados de puerta publicados permite medir el coste de la cuantización en tareas de localización espacial.

## Benchmarks y rendimiento

Resultados de la puerta Tier 2 (1.067 tableros reales etiquetados a mano, servidos con vLLM 0.25.1). Tasa de resolución, sin marcar / con marcas:

| Categoría (n) | bf16 | GPTQ W4A16 |
|---|---|---|
| Todas | 53,5% / 51,3% | 53,9% / 50,8% |
| Clic (674) | 60,4 / 58,5 | 61,6 / 58,8 |
| Rejilla (223) | 31,8 / 26,0 | 29,6 / 22,9 |
| Vídeo (158) | 56,3 / 57,6 | 57,0 / 57,0 |
| Escritura (12) | 33,3 / 25,0 | 33,3 / 37,5 |

La cuantización GPTQ conserva el 99,9% de los tableros resueltos por bf16 (31 perdidos y 30 ganados de 2.129 respuestas; misma acción en 2.128; desplazamiento de punto p50 = 0, p90 = 0). Las rejillas son la categoría donde el 4 bits penaliza más (-2 a -3 puntos). Los resultados por tablero están en `eval/`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en bf16 para los pesos; la versión GPTQ W4A16 reduce el peso a una fracción de esa cifra.
- GPU recomendadas: cualquier GPU con al menos ~2-3 GB de VRAM libre para bf16; el modelo está pensado para servirse con vLLM 0.25.1.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, dado el tamaño reducido de los pesos.
- Opciones de despliegue: vLLM 0.25.1 con el plugin `CaptchaPointerForConditionalGeneration` y el cliente `CaptchaKraken` en el commit `ef2ec28` más el parche `client-fixes.patch`; llama.cpp mediante el repositorio GGUF para CPU.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de resolución (todas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SunlightV2-0.8B | 852.985.920 | no disponible | 53,5% bf16 / 53,9% GPTQ | LGPL-3.0 | Hugging Face (bf16, GPTQ, LoRA, GGUF) |
| TwilightV2-2B | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| MidnightV2-4B | no disponible | no disponible | no disponible | no disponible | Hugging Face |

Las tres variantes pertenecen a la misma familia de modelos pointer de CaptchaKraken y comparten el enfoque de predicción directa con cabezas pointer. La información disponible no incluye los resultados de la tabla comparativa de la familia (la model card contiene un marcador `<!-- RESULTS_TABLE -->` sin datos publicados en la información proporcionada).

## Limitaciones y advertencias

- Tasa de resolución global moderada: 53,5% en bf16 sobre el conjunto de puerta; las rejillas son la categoría más débil (31,8% sin marcar, 26,0% con marcas).
- El modelo no genera texto: solo produce predicciones pointer (acción, puntos, arrastres, texto y momento de vídeo); no sirve para tareas generativas generales.
- Dependencia estricta de versión: las cabezas solo coinciden con el commit `ef2ec28` del cliente CaptchaKraken; clientes posteriores (cambios de cabecera de offset/elemento del 2026-10-30) las rechazan.
- Requiere aplicar `client-fixes.patch` sobre `ef2ec28` antes de servir con vLLM 0.25.1: corrige el fallo de todas las peticiones de vídeo (prompt con `<|video_pad|>` aislado que vLLM no expande) y el fallo con prompts ya cacheados (estados ocultos solo de la cola no cacheada, con indexación fuera de rango de las cabezas). El prefix caching queda desactivado.
- La cuantización GPTQ penaliza las rejillas entre 2 y 3 puntos respecto a bf16.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no disponible en la información proporcionada; al no ser generativo, el riesgo se traslada a predicciones espaciales incorrectas.
- Idiomas soportados: no disponibles.
- Licencia LGPL-3.0: permite uso comercial, pero impone obligaciones de copyleft sobre la biblioteca (no sobre el modelo en sí, según la interpretación habitual de la LGPL); conviene revisar el cumplimiento antes de distribuir en productos derivados.
- El conjunto de evaluación de escritura es muy pequeño (12 tableros), por lo que sus tasas tienen alta varianza.

## Enlaces

- Repositorio principal (bf16): https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Versión GPTQ W4A16: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-q4
- Adaptador LoRA sin fusionar: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-LoRA
- Compilaciones GGUF: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-GGUF
- Familia Twilight V2 (2B): https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Familia Midnight V2 (4B): https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Detector CNN de elementos (large): https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Detector CNN de elementos (lite, CPU): https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-lite
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
