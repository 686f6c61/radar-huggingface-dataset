# lmsolo-community/Qwen3.5-9B-GGUF

## Resumen

Qwen3.5-9B es un modelo fundacional multimodal desarrollado por el equipo Qwen (Alibaba). Este repositorio concreto, publicado por el usuario `lmsolo-community`, contiene una cuantización GGUF en formato `Q4_K_M` del modelo original, junto con su proyector visual, sin modificaciones respecto a la versión de `unsloth/Qwen3.5-9B-GGUF`. El modelo combina un encoder de visión con un modelo de lenguaje causal de aproximadamente 8.950 millones de parámetros, orientado a tareas de razonamiento, código, agentes y comprensión visual.

La relevancia de Qwen3.5-9B radica en su arquitectura híbrida: intercala capas de Gated DeltaNet (atención lineal) con capas de Gated Attention tradicional, lo que reduce el coste computacional en contextos largos. Además, incorpora un contexto nativo de 262.144 tokens, extensible hasta 1.010.000, y soporte para 201 idiomas y dialectos. El entrenamiento incluye fusión temprana de tokens multimodales y escalado de aprendizaje por refuerzo en entornos multiagente.

Este repositorio GGUF facilita el despliegue local del modelo en hardware de consumo mediante herramientas compatibles con el formato, manteniendo la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido de Gated DeltaNet (atención lineal) y Gated Attention, con FFN |
| Parametros totales | 8.953.803.264 (≈9B) |
| Parametros activos | no disponible (no se especifica configuración MoE en la información del modelo base) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | Q4_K_M (única cuantización incluida en este repositorio) |
| Idiomas soportados | 201 idiomas y dialectos (según model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye proyector visual) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida con 32 capas organizadas en 8 bloques de la forma `3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)`. La Gated DeltaNet utiliza 32 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention emplea 16 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y dimensión de RoPE de 64. La dimensión oculta es 4096, la dimensión intermedia del FFN es 12288 y el vocabulario tiene 248.320 tokens (con padding). El modelo incluye un módulo MTP (Multi-Token Prediction) entrenado con múltiples pasos.

El entrenamiento combina pre-entrenamiento y post-entrenamiento, con fusión temprana de tokens multimodales (visión y texto) y escalado de aprendizaje por refuerzo en entornos de millones de agentes con distribuciones de tareas progresivamente complejas. La model card menciona una eficiencia de entrenamiento multimodal cercana al 100% respecto al entrenamiento solo de texto, aunque no se detallan el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento en dominios de conocimiento general y STEM.
- Comprensión de imágenes y texto (pipeline `image-text-to-text`), con proyector visual incluido.
- Generación de código y soporte para tareas de programación.
- Capacidades de agente y razonamiento multi-paso, entrenado con RL en entornos multiagente.
- Soporte multilingüe amplio: 201 idiomas y dialectos.
- Capacidad de tool calling / function calling: no confirmada explícitamente en la información disponible.
- Modo de pensamiento (thinking): no confirmado explícitamente en la información disponible.
- Contexto largo de hasta 262.144 tokens nativo, extensible a 1.010.000.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana nativa, manteniendo el hilo de la conversación y el historial de interacciones sin truncamientos frecuentes.
- Análisis de documentos extensos con imágenes: al combinar visión y contexto largo, puede procesar informes, contratos o artículos científicos con figuras y tablas, respondiendo preguntas sobre el contenido completo.
- Generación de código en producción: adecuado para autocompletado y generación de fragmentos de código en pipelines de CI/CD, aunque la integración con tool calling no está confirmada en la información disponible.
- Asistencia en investigación STEM: con resultados destacados en MMLU-Pro (82,5) y MMLU-Redux (91,1), puede emplearse para resolver problemas de matemáticas, física y otras disciplinas técnicas.
- Despliegue local en hardware de consumo: la cuantización Q4_K_M permite ejecutar el modelo en GPUs de gama alta para consumidores mediante herramientas compatibles con GGUF, facilitando prototipado y pruebas sin infraestructura en la nube.
- Aplicaciones multilingües: con soporte para 201 idiomas y dialectos, es adecuado para traducción, atención al cliente internacional y generación de contenido localizado.
- Agentes autónomos en entornos simulados: el entrenamiento con RL en entornos multiagente lo hace apto para tareas de planificación y ejecución multi-paso en dominios controlados.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del modelo base Qwen3.5-9B. Se comparan con GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking y Qwen3-30BA3B-Thinking-2507.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | 91,1 | no disponible |

No se han publicado en la información disponible resultados de benchmarks de código (HumanEval), matemáticas (GSM8K) ni visión para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el peso del modelo ronda los 5-6 GB, pero el repositorio completo ocupa 147,8 GB (incluye múltiples artefactos y el proyector visual). Para inferencia solo se necesita el archivo GGUF correspondiente.
- GPU recomendadas: RTX 4090 (24 GB) o superior para Q4_K_M con contexto moderado; A100 o H100 para contextos largos o despliegues concurrentes.
- Cabe en GPU de consumo: sí, en GPUs con al menos 8-12 GB de VRAM para la cuantización Q4_K_M con contexto reducido; para contexto completo de 262.144 tokens se requiere mucha más memoria.
- Opciones de despliegue: llama.cpp, Ollama, y otras herramientas compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones; se recomienda verificar compatibilidad.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B (este repo) | ≈9B | 262.144 (ext. 1.010.000) | 82,5 | Apache 2.0 | GGUF Q4_K_M |
| Qwen3.5-4B | ≈4B | no disponible | 79,1 | Apache 2.0 (según modelo base) | no disponible |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE, 3B activos) | no disponible | 80,9 | no disponible | no disponible |
| GPT-OSS-20B | 20B | no disponible | 74,8 | no disponible | no disponible |

Qwen3.5-9B supera en MMLU-Pro a GPT-OSS-20B y Qwen3-30BA3B-Thinking-2507, y se acerca a Qwen3-Next-80B-A3B-Thinking (82,7), con un tamaño mucho menor. La licencia Apache 2.0 facilita su uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: no se detallan en la información disponible; como todo modelo entrenado con datos web a gran escala, es probable que herede sesgos sociales y culturales.
- Riesgo de alucinación: presente en tareas de conocimiento y generación abierta; se recomienda validación humana en aplicaciones críticas.
- Limitaciones de contexto o idioma: aunque soporta 201 idiomas, el rendimiento puede variar entre ellos; el contexto extensible a 1.010.000 tokens puede degradar la calidad si no se gestiona adecuadamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero se debe conservar el aviso de licencia y atribución.
- Caveats para producción: este repositorio es una cuantización Q4_K_M, lo que introduce pérdida de precisión respecto al modelo original en fp16/bf16. Verificar la calidad en tareas sensibles. El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria todavía. La fecha de creación (2026-11-11) es futura respecto a la fecha actual, lo que puede indicar un error en los metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lmsolo-community/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GGUF original (unsloth): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Licencia: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
