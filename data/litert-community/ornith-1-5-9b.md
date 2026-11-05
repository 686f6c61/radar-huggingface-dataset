# litert-community/Ornith-1.5-9B

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de 9B parámetros desarrollado por Ornith AI (publicado originalmente en `ornith-ai/Ornith-1.5-9B`) y convertido al formato LiteRT-LM (`.litertlm`) por la comunidad `litert-community` para su ejecución en dispositivos edge mediante el runtime LiteRT-LM de Google. El modelo parte de Qwen3.5-9B como base y aplica un post-entrenamiento orientado a razonamiento y codificación agéntica, con especial énfasis en tareas de terminal y resolución de issues de software. La conversión aquí descrita contiene únicamente el decodificador de texto (8.953.803.264 de los 9.653.104.368 parámetros del release original), sin la torre de visión ni la cabeza de multi-token prediction.

La relevancia de esta ficha radica en que ofrece un modelo de razonamiento de 9B en formato optimizado para on-device (int8 y Mixed INT4), con un contexto de 4.096 tokens en estos ficheros frente a los 262.144 del modelo original. Es una opción interesante para desarrolladores que necesitan desplegar inferencia local en Mac o dispositivos móviles con un modelo de calidad cercana a la de los modelos de referencia en tareas de código, aunque con limitaciones claras de contexto y de plataforma.

La arquitectura es la híbrida de Qwen3.5: 32 capas, de las cuales 24 usan GatedDeltaNet (atención lineal) y 8 usan atención completa, con un vocabulario de 248.320 tokens. El modelo se distribuye bajo licencia MIT y está pensado para despliegue en una sola GPU o en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (GatedDeltaNet + atención completa), base Qwen3.5-9B |
| Parámetros totales | 8.953.803.264 (solo decodificador de texto); 9.653.104.368 en el release original completo |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens en estos ficheros; 262.144 en el modelo original |
| Tipos de cuantización | int8 dinámica (9,20 GB) y Mixed INT4 blockwise-32 (6,06 GB) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura híbrida de Qwen3.5: 32 capas, 24 de ellas con GatedDeltaNet (atención lineal con estado recurrente de tamaño constante) y 8 con atención completa (una de cada cuatro), tamaño oculto de 4096, 16 cabezas de atención con 4 cabezas KV de 256 dimensiones, y atención lineal con 16 cabezas de clave y 32 de valor de 128 dimensiones. El vocabulario es de 248.320 tokens con embeddings no atados. Solo las 8 capas de atención completa mantienen una caché KV creciente (presupuesto de 4.096 tokens en estos ficheros); las 24 capas lineales mantienen un estado convolucional y recurrente de tamaño fijo, lo que reduce el coste de memoria en contextos largos.

El entrenamiento parte de Qwen3.5-9B y aplica el post-entrenamiento de Ornith-1.5, que según el autor extiende Ornith-1.0 mediante generación automática de tareas de entrenamiento, descubrimiento de estrategias de resolución y mejora de la política mediante reinforcement learning ("self-improvement" de extremo a extremo). El checkpoint original es multimodal e incluye una cabeza de multi-token prediction; la conversión LiteRT-LM conserva solo el decodificador de texto. El modelo es de razonamiento y su turno del asistente abre con un bloque `<think>` por defecto, pero estas conversiones lo ejecutan con el pensamiento desactivado: la plantilla de chat escribe el bloque `<think>\n\n</think>` vacío en cada turno, de forma que las respuestas son únicamente la respuesta final.

## Capacidades

- Generación de texto y razonamiento en modo "thinking off" en estas conversiones (el modo con pensamiento no está disponible en los ficheros LiteRT-LM).
- Codificación agéntica: tareas de terminal (Terminal-Bench 2.1) y resolución de issues de software (SWE-bench Verified).
- Razonamiento matemático y aritmético (evaluado en GSM8K).
- Soporte de tool calling / function calling: la plantilla de chat del bundle reproduce byte a byte las renderizaciones de Ornith con `enable_thinking=False` en conversaciones sin herramientas; el soporte con herramientas no está verificado en estos ficheros.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- Capacidad multimodal: el checkpoint original es multimodal, pero la torre de visión no está incluida en estos ficheros.
- Ejecución on-device en GPU y CPU mediante LiteRT-LM.

## Casos de uso

- Asistente de codificación local en estación de trabajo: el modelo puede integrarse en un IDE o CLI para autocompletar y resolver tareas de código, aprovechando su rendimiento en SWE-bench Verified (70,6 reportado por el proveedor) y su ejecución en una sola GPU de consumo.
- Automatización de tareas de terminal: con Terminal-Bench 2.1 de 46,2 (reportado), es adecuado para agentes que ejecutan comandos y resuelven incidencias en entornos de shell, siempre que la tarea quepa en 4.096 tokens de contexto.
- Inferencia en Mac con GPU: el fichero Mixed INT4 decodifica a 45,6 tok/s en un Mac Studio M4 Max, lo que permite usarlo como asistente interactivo local sin conexión.
- Despliegue en dispositivos móviles Android de gama alta: el fichero int8 se probó en litert-lm 0.18.0; el motor GPU no compila en Galaxy S26 y el Pixel 8a no se llegó a ejecutar, por lo que el despliegue móvil requiere validación previa.
- Razonamiento matemático en local: con 95 (int8) y 92 (Mixed INT4) en GSM8K, sirve para resolver problemas aritméticos en aplicaciones educativas o de cálculo sin depender de la nube.
- Prototipado de agentes de código en CI/CD: al ser un modelo denso de 9B con licencia MIT, puede desplegarse en pipelines internos para revisión de parches o generación de tests, con la limitación del contexto de 4.096 tokens.
- Evaluación comparativa de runtimes: útil para equipos que comparan LiteRT-LM frente a vLLM o llama.cpp en hardware edge, dado que el autor publica tasas de prefill y decodificación por plataforma.

## Benchmarks y rendimiento

Datos reportados por el proveedor (no ejecutados por el autor de la conversión):

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B |
|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | 21,3 |
| SWE-bench Verified | 70,6 | 69,4 | 53,2 |

Precisión en GSM8K (thinking off, 2.048 tokens de salida, Mac GPU):

| Fichero | GSM8K |
|---|---|
| bf16 en transformers | 94 |
| int8 `.litertlm` | 95 |
| Mixed INT4 `.litertlm` | 92 |

Rendimiento (prefill de 1.024 tokens + 256 tokens decodificados, contexto 2.048):

| Métrica | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| Mixed INT4 GPU (s) | 7,28 | motor GPU no compila | no ejecutado |
| int8 GPU (s) | 8,16 | no ejecutado | no ejecutado |
| int8 CPU (s) | 21,47 | no ejecutado | no ejecutado |
| Mixed INT4 CPU (s) | 32,37 | no ejecutado | no ejecutado |

Decodificación en Mac M4 Max: 45,6 tok/s (Mixed INT4, GPU) frente a 39,6 tok/s (int8, GPU). En CPU, el fichero int8 es más rápido en prefill (234 tok/s frente a 68 tok/s del INT4 blockwise).

## Requisitos de hardware

- VRAM estimada: el fichero int8 ocupa 9,20 GB y el Mixed INT4 6,06 GB; a ello hay que sumar la caché KV de las 8 capas de atención completa (presupuesto de 4.096 tokens) y el estado recurrente de las 24 capas lineales.
- GPU recomendadas: Mac Studio M4 Max (probado); GPU de consumo con al menos 10-12 GB de VRAM para int8 y 7-8 GB para Mixed INT4.
- Compatibilidad con GPU de consumo: el Mixed INT4 (6,06 GB) cabe en tarjetas de 8 GB; el int8 requiere 10-12 GB.
- Despliegue: runtime LiteRT-LM 0.18.0 (probado) y 0.17.1 (verificado con `run` simple en CPU de Mac). No se mencionan vLLM, llama.cpp, Ollama ni TGI para estos ficheros.
- Latencia y throughput: 45,6 tok/s (Mixed INT4, GPU, Mac M4 Max); 39,6 tok/s (int8, GPU); prefill de 1.024 tokens + 256 decodificados en 7,28 s (Mixed INT4 GPU) y 8,16 s (int8 GPU). En CPU, 21,47 s (int8) y 32,37 s (Mixed INT4).
- Limitación iOS: cada fichero es una única sección TFLite de 8,57 GiB (int8) y 5,64 GiB (Mixed INT4), por encima del límite de ~2 GiB por sección descrito en la ficha de Ministral-3-3B-Instruct-2512, por lo que no está medido en iOS.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato edge | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B (esta conversión) | 9B denso (8,95B texto) | 4.096 (262.144 original) | MIT | `.litertlm` int8 / Mixed INT4 | SWE-bench Verified 70,6; Terminal-Bench 2.1 46,2 |
| Ornith-1.0-9B | 9B denso | No disponible | MIT (según modelo base) | `.litertlm` (conversión existente) | SWE-bench Verified 69,4; Terminal-Bench 2.1 43,1 |
| Qwen3.5-9B | 9B denso | 262.144 | No disponible en la información | Conversiones LiteRT-LM de 4B, 2B y 0,8B disponibles; 9B no listada | SWE-bench Verified 53,2; Terminal-Bench 2.1 21,3 |
| Qwen3.5-4B (litert-community) | 4B denso | No disponible | No disponible | `.litertlm` | Conversión oficial de la comunidad LiteRT-LM |

## Limitaciones y advertencias

- Contexto reducido a 4.096 tokens en estos ficheros frente a los 262.144 del modelo original; no apto para tareas que requieran contexto largo.
- Modo de pensamiento desactivado de forma fija: la plantilla escribe siempre el bloque `<think>` vacío y no hay interruptor para activarlo, lo que puede reducir el rendimiento en tareas de razonamiento complejo frente al modelo original.
- Solo decodificador de texto: sin torre de visión ni cabeza de multi-token prediction; no es multimodal en este formato.
- El soporte de tool calling con herramientas no está verificado en estos ficheros; la plantilla reproduce el comportamiento sin herramientas.
- Sin datos de idiomas soportados; no se puede garantizar calidad multilingüe.
- Despliegue móvil no validado: el motor GPU no compila en Galaxy S26 y no se ejecutó en Pixel 8a; en iOS los ficheros superan el límite de sección TFLite.
- Los benchmarks de Terminal-Bench y SWE-bench son reportados por el proveedor y no han sido reproducidos por el autor de la conversión.
- Riesgo de alucinación inherente a modelos de 9B; no se documentan sesgos específicos.
- Licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y del post-entrenamiento de Ornith AI.
- La variante "Ornith-1.5-9B-Mobile" mencionada en el README no tiene repositorio público en el momento de la conversión.

## Enlaces

- HuggingFace (esta conversión): https://huggingface.co/litert-community/Ornith-1.5-9B
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Conversión previa Ornith-1.0-9B: https://huggingface.co/litert-community/Ornith-1.0-9B
- Conversión Qwen3.5-4B: https://huggingface.co/litert-community/Qwen3.5-4B
- Conversión Qwen3.5-2B: https://huggingface.co/litert-community/Qwen3.5-2B
- Conversión Qwen3.5-0.8B: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Ficha de Ministral-3-3B-Instruct-2512 (límite de sección TFLite): https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
