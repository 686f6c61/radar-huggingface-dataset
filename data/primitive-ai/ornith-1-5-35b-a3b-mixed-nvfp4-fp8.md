# primitive-ai/Ornith-1.5-35B-A3B-mixed-NVFP4-FP8

## Resumen

Ornith-1.5-35B-A3B-mixed-NVFP4-FP8 es una cuantización de precisión mixta del modelo multimodal Ornith-1.5-35B-A3B, desarrollada por primitive-ai. El modelo base, creado por ornith-ai, es un MoE (mixture of experts) de 35 mil millones de parámetros con 3 mil millones activos, basado en la arquitectura qwen3_5_moe y entrenado con un enfoque de auto-andamiaje y auto-mejora (self-scaffolding y self-improvement). Esta versión cuantizada reduce el peso del checkpoint de 67.0 GiB (BF16) a 22.6 GiB, es decir, 3.0 veces más pequeño, manteniendo un rendimiento en conocimiento muy cercano al original (91.7 frente a 92.0 en una suite de 1.170 ítems).

La relevancia de este modelo radica en que permite ejecutar un VLM (vision-language model) de 35B en GPUs de consumo con 24 GB de VRAM, con un throughput 1.72 veces superior al BF16 a concurrencia 32 (1.469 tok/s frente a 845). La cuantización preserva la torre de visión, el bloque MTP (multi-token prediction) para decodificación especulativa y el lm_head en BF16, lo que mantiene la compatibilidad con la ruta Ampere (Marlin W·A16). Está diseñado para servirse con vLLM estándar mediante compressed-tensors, sin parches adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (qwen3_5_moe) con torre de vision y bloque MTP |
| Parametros totales | 35B (19.845.695.344 en safetensors cuantizados) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 32K (inferido del ejemplo de vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | Mixta NVFP4 + FP8, con BF16 en vision tower, MTP y lm_head |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura MoE multimodal basada en qwen3_5_moe, con una torre de visión independiente y un bloque MTP para decodificación especulativa. Según la documentación de ornith-ai, el entrenamiento sigue un paradigma de auto-andamiaje: el modelo propone nuevas tareas, genera andamiajes específicos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, creando un bucle continuo de auto-mejora. Esta versión cuantizada por primitive-ai no modifica la arquitectura, sino que aplica una cuantización mixta NVFP4-FP8: las capas de atención y MLP se cuantizan a NVFP4 y FP8 respectivamente, mientras que la torre de visión, el proyector, las normas y el lm_head se mantienen en BF16. Esta decisión preserva la capacidad visual y la ruta de compatibilidad con Ampere, a costa de un ligero aumento de tamaño frente a una cuantización completa.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto, y produce respuestas textuales.
- Tool calling / function calling: soporta llamadas a herramientas con esquemas JSON en el prompt del sistema, respondiendo con un array JSON de llamadas.
- Razonamiento multi-paso: el modo de pensamiento (thinking) puede forzarse, con un presupuesto de 16.384 tokens.
- Decodificación especulativa: el bloque MTP preservado permite acelerar la inferencia.
- Capacidades multilingües: no especificadas por el autor.
- Capacidades especiales: visión (image-text-to-text), compatible con vLLM y endpoints.

## Casos de uso

- Atención al cliente multimodal: el modelo puede procesar capturas de pantalla o imágenes de productos junto con consultas de texto, manteniendo conversaciones multi-turno con contexto de hasta 32K tokens, adecuado para sistemas de soporte que requieren comprensión visual.
- Generación de código asistida por visión: un desarrollador puede subir un diagrama o un boceto de interfaz y pedir al modelo que genere el código correspondiente, aprovechando la torre de visión intacta y la capacidad de tool calling para integrarse en entornos de desarrollo.
- Agentes autónomos con llamada a herramientas: gracias a su soporte de function calling y su modo de razonamiento, puede actuar como agente que consulta APIs, bases de datos o servicios externos, con un presupuesto de pensamiento amplio para tareas multi-paso.
- Despliegue en producción con GPUs de 24 GB: al pesar solo 22.6 GiB, puede servirse en una RTX 3090/4090 o A5000 con vLLM, ofreciendo un throughput de 1.469 tok/s a concurrencia 32, adecuado para aplicaciones en tiempo real.
- Análisis de documentos técnicos: con 32K de contexto y capacidades multimodales, puede resumir y extraer información de documentos largos que incluyan figuras, tablas o diagramas.
- Prototipado rápido de chatbots con visión: su licencia MIT y compatibilidad con vLLM permiten integrarlo en pipelines de CI/CD para pruebas automatizadas de interfaces conversacionales.

## Benchmarks y rendimiento

El autor proporciona mediciones propias sobre 1.370 ítems de catorce benchmarks públicos, con un protocolo fijo (temperatura 0.6, top_p 0.95, top_k 20, thinking forzado, presupuesto de 16.384 tokens, concurrencia 32 y subconjunto single-stream de 60 ítems, todo en una RTX PRO 6000 Blackwell). Los resultados se resumen en la siguiente tabla:

| Build | Tamano | Overall | Knowledge | Call | Abstain | Runs k/a | Finished | Out/answer | Tok/s @ 32 | Latencia por token |
|---|---|---|---|---|---|---|---|---|---|---|
| BF16 (referencia) | 67.0 G | 89.5 | 92.0 | 78.6 | 61.3 | 1/4 | 99.2% | 708 | 845 | 37.9 ms |
| ornith-ai FP8 | 36.7 G | 88.8 | 91.2 | 79.1 | 58.1 | 1/4 | 99.4% | 679 | 1239 | 25.8 ms |
| **Este repo** | **22.6 G** | **88.7** | 91.7 | 74.4 | 60.0 | 3/6 | 99.3% | 760 | 1469 | 21.8 ms |
| ornith-ai NVFP4 | 21.8 G | 88.3 | 90.9 | 76.1 | 61.3 | 1/4 | 99.6% | 686 | 1681 | 19.0 ms |
| Este repo, mitad knowledge re-medida | — | — | 91.9 | — | — | 1/1 | 99.1% | 772 | 1473 | 21.7 ms |

El desglose de tool calling (160 ítems que requieren llamada y 40 de abstención) es:

| Build | Agentic | Call | Abstain |
|---|---|---|---|
| BF16 (referencia) | 75.1 | 78.6 | 61.3 |
| ornith-ai FP8 | 74.9 | 79.1 | 58.1 |
| **Este repo** | **71.8** | 74.4 | 60.0 |
| ornith-ai NVFP4 | 73.1 | 76.1 | 61.3 |

El autor advierte que la abstención es el punto débil de todos los modelos medidos (52-82%), y que diferencias inferiores a 1.0 punto en `overall` deben considerarse empates. No se han publicado resultados de benchmarks externos independientes.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 22.6 GiB, por lo que se recomienda al menos 24 GB de VRAM para cargarlo completo sin offloading.
- GPU recomendadas: RTX PRO 6000 Blackwell (usada en las mediciones), así como otras GPUs Blackwell con 24 GB o más. El lm_head en BF16 mantiene la ruta Ampere (Marlin W·A16), aunque la cuantización NVFP4 está optimizada para Blackwell.
- Compatibilidad con GPU de consumo: sí, en GPUs de 24 GB como RTX 3090, RTX 4090 o RTX 5090, siempre que el soporte de NVFP4 esté disponible en el runtime.
- Opciones de despliegue: vLLM (recomendado, con `compressed-tensors`), compatible con endpoints. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: 1.469 tok/s a concurrencia 32 y 21.8 ms de latencia por token en RTX PRO 6000 Blackwell; 1.22× el throughput single-stream del BF16.

## Comparativa con modelos similares

La comparativa más directa es con las otras versiones del mismo modelo base, ya que no se dispone de datos de modelos MoE multimodales de tamaño similar en la información proporcionada.

| Modelo | Tamano | Overall | Knowledge | Tool calling | Throughput @32 | Licencia |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (BF16) | 67.0 G | 89.5 | 92.0 | 78.6 | 845 tok/s | MIT |
| Ornith-1.5-35B-A3B-FP8 (oficial) | 36.7 G | 88.8 | 91.2 | 79.1 | 1239 tok/s | MIT |
| **Este repo (NVFP4+FP8 mixto)** | **22.6 G** | **88.7** | 91.7 | 74.4 | 1469 tok/s | MIT |
| Ornith-1.5-35B-A3B-NVFP4 (oficial) | 21.8 G | 88.3 | 90.9 | 76.1 | 1681 tok/s | MIT |

Este build ofrece el mejor equilibrio entre tamaño y conocimiento, aunque es ligeramente inferior en tool calling. Para cargas de trabajo centradas en agentes, el autor recomienda su build "agentic" (mismo tamaño, 74.0 en la suite de tool calling con menor varianza).

## Limitaciones y advertencias

- Tool calling más débil que el BF16: 74.4 frente a 78.6 en la suite de llamadas, con mayor varianza entre ejecuciones (3 de 6 runs frente a 1 de 4 del BF16).
- Abstención deficiente: en los 40 ítems donde la acción correcta es no llamar a ninguna herramienta, el modelo acierta solo el 60.0%, un problema compartido por todos los modelos medidos.
- Pérdida de precisión por cuantización: aunque el conocimiento se mantiene cerca del BF16 (91.7 vs 92.0), hay una degradación medible en tareas de tool calling y posiblemente en otras tareas no evaluadas.
- Requisito de hardware específico: la cuantización NVFP4 está optimizada para GPUs Blackwell; en GPUs Ampere puede no estar soportada completamente, a pesar del lm_head BF16.
- Sesgos y alucinaciones: no se han publicado evaluaciones específicas de sesgos o alucinaciones para esta versión cuantizada; al ser un modelo multimodal, puede presentar sesgos visuales heredados del entrenamiento.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base y esta cuantización no incluyen garantías explícitas de seguridad o imparcialidad.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/primitive-ai/Ornith-1.5-35B-A3B-mixed-NVFP4-FP8
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Versión FP8 oficial: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Versión NVFP4 oficial: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-NVFP4
- Build agentic del mismo autor: https://huggingface.co/primitive-ai/Ornith-1.5-35B-A3B-agentic-NVFP4-FP8
- Documentación de Ornith-1.5 (self-scaffolding y self-improvement): https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI: https://ornith.online/
- Ficha en LLM Explorer: https://llm-explorer.com/model/primitive-ai%2FOrnith-1.5-35B-A3B-mixed-NVFP4-FP8,3KLa3npoW5YICzQpgmM7Y3
