# GCSA-AiLab/cua-s1-4b-0.2-GGUF-MLX

## Resumen

Cua-S1 4B 0.2 es un modelo multimodal (image-text-to-text) orientado a tareas de computer use, derivado de Qwen3.5-4B mediante la fusión del adaptador LoRA `multimodal` del proyecto cua-ai. El repositorio analizado, publicado por GCSA-AiLab, no añade entrenamiento nuevo: se limita a fusionar el LoRA en el modelo base (PEFT `merge_and_unload` en BF16, 178 módulos) y a exportar el resultado en varios formatos (Transformers BF16, GGUF y MLX). El modelo base Qwen3.5-4B aporta la arquitectura transformer multimodal con visión, mientras que el LoRA de Cua-S1 especializa el comportamiento hacia la interpretación de capturas de pantalla y la emisión de acciones de agente.

El interés práctico del repositorio es la disponibilidad de pesos ya fusionados y cuantizados en GGUF (BF16, Q8_0, Q6_K, Q4_K_M con `mmproj` F16) y en MLX (4, 6 y 8 bits con group size 64), lo que permite desplegar un modelo visión-lenguaje de ~4.200 millones de parámetros en hardware modesto, incluido CPU, sin cargar adaptadores LoRA por separado. El modelo pesa entre 2,55 GiB (Q4_K_M) y 8,5 GiB (BF16).

Conviene subrayar que la verificación publicada es limitada: se comprobó la carga en CPU y una generación de texto con imagen (identificación de un rectángulo verde), pero no se validó la inferencia en Apple/Metal ni se midieron benchmarks de computer use ni la degradación de calidad tras la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B, vision-language) con LoRA multimodal fusionado |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 4096`, no es el máximo del modelo) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF); MLX affine 4/6/8 bits, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (HF merged-bf16), GGUF, MLX |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal basado en Qwen3.5-4B, con torre visual y proyección multimodal, al que se ha aplicado el LoRA `multimodal` del proyecto cua-ai/cua-s1-4b-0.2. La fusión se realizó con PEFT `merge_and_unload(safe_merge=True)` en BF16 sobre 178 módulos LoRA, afectando tanto capas de lenguaje como capas visuales. No se fusionó el LoRA de texto del repositorio original ni se combinaron ambos adaptadores, por lo que el modelo resultante incorpora únicamente la especialización multimodal.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada. La conversión a GGUF se hizo con llama.cpp (commit `a946eb541a6d3051496bdcc451a0fa85772b8dfd`) y la de MLX con mlx-vlm 0.7.11 y MLX 0.32.4, cuantización affine con group size 64. En MLX, los componentes visuales se mantienen en BF16 y solo se cuantizan los módulos de lenguaje, por lo que el bit-width medio del conjunto supera el nominal del directorio.

## Capacidades

- Generación de texto e inferencia sobre imágenes (image-text-to-text): descripción de capturas de pantalla e interpretación de interfaces.
- Comprensión visual orientada a computer use: el adaptador está entrenado para tareas de operación de escritorio (identificación de elementos de UI, acciones).
- Emisión de acciones de agente: el adaptador codifica acciones dentro del formato del proyecto Cua-S1, aunque el runtime del agente no forma parte de los pesos.
- Conversación multi-turno (tag `conversational` en el repositorio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-step nativo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Automatización de escritorio con agentes: el modelo interpreta capturas de pantalla y emite acciones en el formato de Cua-S1, integrándose en el runtime de trycua/cua para pilotar aplicaciones de escritorio.
- Testing de interfaces gráficas: analizar screenshots de builds y verificar la presencia o el estado de elementos de UI (el propio repositorio valida este caso con la detección de un rectángulo verde).
- Asistentes de soporte que leen la pantalla del usuario: con entrada de imagen y texto, el modelo puede describir el estado de una aplicación y guiar al usuario paso a paso.
- Despliegue en CPU o hardware sin GPU: la variante Q4_K_M (2,55 GiB) con `mmproj` F16 (0,63 GiB) permite ejecutar visión-lenguaje vía `llama-mtmd-cli` en equipos sin acelerador.
- Prototipado en Apple Silicon: las variantes MLX 4/6/8 bits (2,83–4,79 GiB) están pensadas para entornos mlx-vlm, aunque la inferencia en Metal no está verificada por el autor de la conversión.
- Investigación sobre cuantización de modelos visión-lenguaje: el repositorio incluye `provenance.json` y `SHA256SUMS`, útil para reproducir y auditar el pipeline de fusión y cuantización.
- Documentación automática de flujos de UI: generar descripciones textuales de pantallas para manuales o bases de conocimiento internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se midieron benchmarks de operación de computadora, tasas de éxito de tareas ni degradación de calidad tras la cuantización, y que los resultados del modelo upstream no deben atribuirse a estas versiones cuantizadas.

## Requisitos de hardware

- VRAM/RAM estimada (tamaño de pesos, no consumo en ejecución): BF16 8,5 GiB (HF) / 7,85 GiB (GGUF); Q8_0 4,17 GiB; Q6_K 3,23 GiB; Q4_K_M 2,55 GiB; `mmproj` F16 0,63 GiB adicional en GGUF.
- MLX: 4 bits 2,83 GiB, 6 bits 3,81 GiB, 8 bits 4,79 GiB (visual en BF16, tamaño efectivo mayor que el nominal).
- GPU recomendadas: no disponible en la información proporcionada; el autor no documenta requisitos de GPU.
- Consumer GPU: por tamaño, Q4_K_M con `mmproj` (~3,2 GiB de pesos) es viable en GPUs de 8 GB de VRAM; Q8_0 (~4,8 GiB con proyector) encaja en 8–12 GB; BF16 requiere ~9–10 GiB y por tanto 16 GB o más. Estas cifras son estimaciones a partir del tamaño de los pesos, no medidas publicadas.
- Opciones de despliegue: llama.cpp (`llama-mtmd-cli`, requiere soporte de Qwen3.5 y de la arquitectura visual correspondiente), mlx-vlm en Apple Silicon, Transformers con `AutoModelForImageTextToText` y `device_map="auto"`.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cua-S1 4B 0.2 (este repo) | ~4,2 B | no disponible | imagen + texto | Apache-2.0 | GGUF, MLX, safetensors |
| Qwen3.5-4B (base) | ~4 B (no confirmado en esta información) | no disponible | imagen + texto | Apache-2.0 (según upstream) | safetensors |
| cua-ai/cua-s1-4b-0.2 (LoRA original) | adaptador sobre Qwen3.5-4B | no disponible | imagen + texto | Apache-2.0 | LoRA PEFT |
| Otros modelos de computer use de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación de rendimiento con alternativas no está disponible: no hay benchmarks publicados para esta conversión ni datos de terceros incluidos en la información proporcionada.

## Limitaciones y advertencias

- No se ha validado la inferencia en Apple/Metal; los directorios MLX solo se comprobó que recargan en CPU.
- No se midió la degradación de calidad tras la cuantización (Q4_K_M, Q6_K, Q8_0, MLX 4/6/8 bits); los resultados del modelo upstream no son extrapolables.
- La validación funcional se limita a una comprobación simple de imagen y generación de texto; no hay evaluación de tasas de éxito en tareas de computer use.
- Los pesos no incluyen el runtime de agente de Cua-S1: para operar un escritorio hace falta el proyecto trycua/cua y su codificación de acciones y prompts.
- No se debe sustituir el `mmproj` por el de un Qwen3.5-4B sin fusionar: el proyector se exportó desde los pesos visuales fusionados.
- No se fusionó el LoRA de texto del repositorio original; el comportamiento textual especializado de cua-s1-4b-0.2 no está incluido.
- Idiomas soportados no declarados: riesgo de rendimiento desigual fuera del inglés y del chino (el README está en ambos idiomas, pero no se especifica cobertura lingüística).
- Sesgos y riesgo de alucinación: no documentados en la información disponible; al ser un modelo de 4 B orientado a percepción visual, cabe esperar errores de interpretación de UI y descripciones inexactas, aunque no hay evidencia publicada al respecto.
- Licencia Apache-2.0 permite uso comercial, pero deben conservarse la atribución y las licencias upstream (Qwen y cua-ai).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GCSA-AiLab/cua-s1-4b-0.2-GGUF-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- LoRA original: https://huggingface.co/cua-ai/cua-s1-4b-0.2 (revisión `16818868b0cc7813808aae4e87b417657046ab79`)
- Proyecto Cua-S1: https://github.com/trycua/cua/tree/main/libs/cua-s1
- Repositorio trycua/cua: https://github.com/trycua/cua
- llama.cpp (commit usado): `a946eb541a6d3051496bdcc451a0fa85772b8dfd`
- mlx-vlm 0.7.11 / MLX 0.32.4 (herramientas de conversión, sin enlace específico en la información disponible)
