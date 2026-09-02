# Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-MXFP4-1M

## Resumen

El modelo `Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-MXFP4-1M` es una cuantización MXFP4 de un fine-tune del modelo Qwen3.8-27B de Alibaba, realizada por Solstice-AI. El modelo base original, publicado por Alibaba en agosto de 2026 bajo licencia Apache 2.0, es un modelo denso de 27B parámetros con arquitectura híbrida de atención (lineal en 48 de 64 capas), torre de visión integrada y cabeza de predicción multi-token (MTP). Sobre ese base, el autor DavidAU aplicó un fine-tune denominado "Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU" que, según sus propias afirmaciones, alcanza 735 puntos en ARC-C en 8 bits. Solstice-AI ha cuantizado ese checkpoint a MXFP4 (4 bits) y lo ha extendido a un contexto nativo de 1.048.576 tokens mediante la compresión de KV cache con Google TurboQuant y el runtime Anvil.

La relevancia de este modelo radica en su combinación de tamaño contenido (26,9B parámetros), multimodalidad (imagen-texto), contexto de un millón de tokens y un conjunto de benchmarks auto-reportados que, según el autor, superan a Claude Opus 4.6 Max en tareas agénticas de ingeniería de software y control de ordenador. Sin embargo, es importante señalar que el modelo tiene cero descargas en HuggingFace y que los resultados de rendimiento no han sido verificados de forma independiente. La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para despliegues en producción, siempre que se validen sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal en 48 de 64 capas + atención full en 16 capas, con torre de visión y cabeza MTP (draft) integrada |
| Parametros totales | 26.895.998.464 (~26,9B, incluye encoder de visión de ~1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (2^20) según el autor; el modelo base Qwen3.8-27B tiene 262K nativo extensible a 1M |
| Tipos de cuantizacion | MXFP4 (4 bits, pesos de 18,0 GB); también disponible en 8 bits según tags del repo |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (según tags), compressed-tensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por Alibaba, emplea una arquitectura densa híbrida de 64 capas con hidden size de 5.120 y un vocabulario de 248.320 tokens. La innovación principal es la combinación de atención lineal en 48 de las 64 capas con atención full en las 16 restantes, lo que reduce el coste computacional del contexto largo. Incluye una torre de visión de aproximadamente 1B parámetros que permite procesamiento multimodal imagen-texto, y una cabeza MTP (Multi-Token Prediction) que actúa como modelo draft para decodificación especulativa. El contexto nativo es de 262.144 tokens, extensible a 1M mediante técnicas de interpolación.

Sobre este base, el autor DavidAU aplicó un fine-tune denominado "Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU" que, según la model card del autor, alcanza 735 puntos en ARC-C en 8 bits y 719 en 4 bits, superando en 144 puntos al Qwen3.8-27B original. No se han publicado detalles sobre los datos de entrenamiento, el número de tokens utilizados o si se emplearon técnicas de RLHF o DPO. Solstice-AI posteriormente cuantizó este checkpoint a MXFP4 (4 bits) y lo extendió a 1M de contexto nativo mediante la compresión de KV cache con Google TurboQuant, que utiliza rotación FWHT y cuantización vectorial residual QJL. El runtime recomendado es Anvil, que integra la decodificación especulativa MTP y la gestión de contexto largo.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino, con soporte de conversación multi-turno.
- Procesamiento multimodal imagen-texto: puede recibir imágenes como entrada y generar texto relacionado (pipeline image-text-to-text).
- Razonamiento agéntico y multi-step: según los benchmarks auto-reportados, es capaz de resolver tareas de ingeniería de software (SWE-bench Pro) y control de ordenador (OSWorld).
- Soporte de tool calling y function calling, implícito en su uso como agente en entornos de código y control de sistemas.
- Contexto largo de 1.048.576 tokens, adecuado para tareas que requieren procesar documentos extensos o historiales de conversación muy largos.
- Decodificación especulativa MTP: la cabeza draft integrada acelera la generación sin necesidad de un modelo separado.
- Capacidad de "uncensored" (sin censura) según el nombre del modelo, lo que implica menos restricciones en la generación de contenido sensible.

## Casos de uso

- Ingeniería de software agéntica: el modelo puede integrarse en pipelines de CI/CD para resolver issues de GitHub, generar parches y ejecutar tests de forma autónoma. Su rendimiento declarado de 61,7% en SWE-bench Pro lo posiciona como candidato para automatizar tareas de mantenimiento de código.
- Control de ordenador (computer use): gracias a su capacidad multimodal y su puntuación de 84,3% en OSWorld-Verified, puede utilizarse para automatizar flujos de trabajo en escritorio, como rellenar formularios, navegar por aplicaciones o gestionar archivos.
- Asistente de programación en producción: con soporte de tool calling y contexto de 1M tokens, puede mantener el estado completo de un repositorio grande y generar código, refactorizaciones o documentación en conversaciones prolongadas.
- RAG de contexto largo: la ventana de 1M tokens permite indexar y consultar documentos extensos (manuales técnicos, bases de conocimiento, contratos) sin necesidad de chunking agresivo, mejorando la fidelidad de las respuestas.
- Automatización de atención al cliente multilingüe: soporta inglés y chino, y su contexto largo permite gestionar conversaciones multi-turno con historial completo del cliente, reduciendo errores por pérdida de información.
- Control de dispositivos móviles: con 81,9% en AndroidWorld, puede utilizarse para automatizar tareas en Android, como pruebas de aplicaciones, gestión de notificaciones o asistencia a usuarios con discapacidad.

## Benchmarks y rendimiento

Los siguientes resultados provienen exclusivamente de la model card del autor y no han sido verificados de forma independiente. Se presentan tal como fueron publicados:

| Benchmark | Qwen3.8-27B TURBO (Solstice) | Claude Opus 4.6 Max | Margen |
|---|---|---|---|
| SWE-bench Pro | 61,7% | 53,4% | +8,3% |
| LiveCodeBench v6 | 90,3% | 88,8% | +1,5% |
| QwenSWEBench | 79,0% | 63,8% | +15,2% |
| CoWorkBench | 70,7% | 68,2% | +2,5% |
| OSWorld-Verified | 84,3% | 72,7% | +11,6% |
| AndroidWorld | 81,9% | 62,0% | +19,9% |
| IFBench | 79,5% | 62,5% | +17,0% |
| ARC-C | 735 (8-bit) / 719 (4-bit) | ~710–720 | — |

Además, el fine-tune base de DavidAU reporta 880 en ARC-E en 8 bits. No se dispone de resultados de benchmarks estándar como MMLU, GSM8K o HumanEval en la información proporcionada. La ausencia de descargas y de evaluaciones externas recomienda tratar estos números con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en MXFP4 ocupan aproximadamente 18,0 GB, por lo que se necesitan al menos 20-24 GB de VRAM para cargar el modelo con overhead de activaciones. Con la compresión de KV cache de TurboQuant, un contexto de 1M tokens requiere entre 10 y 18 GB adicionales según el nivel de cuantización de la cache (2-4 bits).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 5090 (32 GB) para uso local con contexto moderado; A100 40/80 GB o H100 para contexto completo de 1M tokens.
- En consumer GPU: cabe en una RTX 4090 con cuantización MXFP4 y contexto reducido (hasta ~128K tokens). Para 1M de contexto se recomienda al menos 48 GB de VRAM.
- Opciones de despliegue: runtime Anvil (recomendado por el autor, con soporte de servidor OpenAI-compatible), transformers con `device_map="auto"`, y potencialmente vLLM o llama.cpp si se convierten los pesos a GGUF (el repo incluye tags de GGUF).
- Latencia y throughput: no se han publicado datos medidos. La decodificación especulativa MTP debería reducir la latencia respecto a un modelo sin draft, pero no hay cifras verificables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | SWE-bench Pro (auto-reportado) |
|---|---|---|---|---|---|
| Qwen3.8-27B (base, Alibaba) | 26,9B | 262K (ext. 1M) | Apache 2.0 | Sí | no disponible |
| Solstice-AI Qwen3.8-27B TURBO MXFP4 | 26,9B | 1M | Apache 2.0 | Sí | 61,7% |
| Claude Opus 4.6 Max (cerrado) | no disponible | no disponible | propietaria | Sí | 53,4% |
| DavidAU Qwen3.8-27B TURBO (fine-tune base) | 26,9B | 262K (ext. 1M) | Apache 2.0 | Sí | no disponible |

La comparativa directa con Claude Opus 4.6 Max es la que presenta el autor, pero al ser un modelo cerrado y con metodología de evaluación no especificada, no se puede establecer una comparación rigurosa. Frente al Qwen3.8-27B original, la principal diferencia es el fine-tune orientado a tareas agénticas y la cuantización MXFP4, que reduce el tamaño de 54 GB (FP16) a 18 GB.

## Limitaciones y advertencias

- Los benchmarks presentados son auto-reportados por el autor y no han sido replicados por la comunidad. El modelo tiene 0 descargas en HuggingFace, lo que impide validar su rendimiento real.
- El nombre del modelo incluye "Uncensored" y "Heretic", lo que sugiere que se han eliminado mecanismos de seguridad. Esto puede generar contenido inapropiado, ofensivo o peligroso si se despliega sin salvaguardas adicionales.
- Solo soporta inglés y chino. No hay evidencia de capacidades en otros idiomas, incluido el español.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.8-27B (Apache 2.0) y del fine-tune de DavidAU, cuya licencia no se ha verificado explícitamente en la información disponible.
- El contexto de 1M tokens depende de la compresión de KV cache con TurboQuant, que introduce pérdida de información. La calidad de la recuperación en contextos muy largos no ha sido evaluada públicamente.
- La arquitectura híbrida con atención lineal puede degradar el rendimiento en tareas que requieren recuperación precisa de información distante, un problema conocido en este tipo de arquitecturas.
- El runtime Anvil es un proyecto de Solstice-Labs con adopción limitada; su estabilidad y compatibilidad con otros frameworks no está garantizada.
- No se han publicado detalles sobre el proceso de cuantización MXFP4 (calibración, pérdida de precisión, etc.), por lo que el impacto real en la calidad de salida es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-MXFP4-1M
- Modelo base (fine-tune de DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Qwen3.8-27B original (Alibaba): https://huggingface.co/Qwen/Qwen3.8-27B
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Runtime Anvil: https://github.com/Solstice-Labs/anvil
- Guía de ejecución local de Qwen3.8-27B: https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
