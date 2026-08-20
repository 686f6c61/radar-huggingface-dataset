# Avifenesh/Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF

## Resumen

Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF es una cuantización NVFP4 (4-bit) del modelo base `ornith-ai/Ornith-1.5-35B-A3B`, realizada por Avifenesh como artefacto de servicio para el motor de inferencia memra. Ornith-1.5 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por ornith-ai, post-entrenado sobre la arquitectura Qwen3.5-MoE mediante un bucle de auto-mejora que combina generación de tareas, scaffolds y rollouts para aprendizaje por refuerzo. El modelo base tiene 35.000 millones de parámetros totales con 3.000 millones activos (A3B) y una ventana de contexto nativa de 262.144 tokens.

Esta versión cuantizada reduce el peso de 71,9 GB (BF16) a 20,2 GB, incorpora la cabeza MTP (multi-token prediction) para decodificación especulativa y está optimizada para GPUs Blackwell (sm_120a). Es la primera cuantización NVFP4 de este modelo publicada. La licencia es MIT, lo que permite uso comercial sin restricciones. Está diseñada específicamente para el motor memra y la rama NVFP4 de llama.cpp, no para llama.cpp estándar ni Ollama.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), basada en Qwen3.5-MoE |
| Parametros totales | 35B |
| Parametros activos | 3B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (4-bit e2m1, escalas FP8-e4m3 por cada 16), embeddings y head de salida Q5_K, norms F32 |
| Idiomas soportados | no disponible (modelo base multilingüe, sin especificación detallada) |
| Licencia | MIT |
| Formato de pesos | GGUF (tipo NVFP4 no estándar en llama.cpp upstream) |

## Arquitectura y entrenamiento

Ornith-1.5-35B-A3B es un modelo MoE con 35B parámetros totales y 3B activos, post-entrenado sobre Qwen3.5-MoE. El enfoque de entrenamiento, descrito en el blog de ornith-ai, extiende el marco de auto-scaffolding introducido en Ornith-1.0 hacia un bucle de auto-mejora completo: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo, creando continuamente nuevas experiencias de aprendizaje. La arquitectura base incluye una cabeza MTP (multi-token-prediction) con `nextn_predict_layers=1`, que en esta cuantización se conserva en el bloque `blk.40`.

La cuantización NVFP4 fue realizada por Avifenesh a partir del GGUF BF16 oficial, usando `llama-quantize` con un enfoque imatrix-aware. El proceso redujo el peso de 71,9 GB a 20,2 GB. La exactitud se verificó mediante el harness `memra` (baterías de pruebas de kernel y consistencia token-por-token) y una comparación cruzada con el safetensors BF16 bajo transformers 5.8.1 en CPU. El vocabulario se ha limitado a 248.320 tokens de texto (se excluye la torre de visión del modelo base).

## Capacidades

- Generación de texto, razonamiento complejo y matemáticas.
- Generación de código y soporte de tool calling mediante plantilla XML embebida en el chat template.
- Modo de razonamiento (`thinking`) integrado en el chat template.
- Decodificación especulativa con cabeza MTP: aceptación de draft del 53,7% con head completo embebido y 48,8% con head enmascarado FR-Spec (medido en generación de código de 256 tokens, K=2).
- Soporte de agentes y razonamiento multi-paso gracias a la ventana de contexto de 262.144 tokens.
- Capacidad multilingüe heredada del modelo base Qwen3.5-MoE (idiomas concretos no documentados).

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo (262.144 tokens) y mantener el hilo de la conversación sin perder información previa, gracias a su arquitectura MoE de 3B activos que permite latencias bajas en inferencia.
- **Generación de código en producción**: soporta tool calling (XML) y puede integrarse en pipelines de CI/CD para generar o revisar código, aunque se recomienda usar el modo sin especulación por defecto (el decode plano es más rápido en este modelo).
- **Asistentes de programación con razonamiento**: el modo `thinking` permite que el modelo razone paso a paso antes de responder, útil para depuración y diseño de algoritmos.
- **Análisis de documentos extensos**: la ventana de 262.144 tokens permite procesar libros técnicos, informes o bases de código completas en una sola pasada, sin necesidad de chunking.
- **Agentes autónomos**: la combinación de tool calling, contexto largo y razonamiento multi-paso lo hace adecuado para agentes que necesitan planificar, ejecutar herramientas y evaluar resultados en tareas de automatización compleja.
- **Servicio de inferencia en GPUs Blackwell**: el formato NVFP4 y la integración con memra permiten servir el modelo en una sola GPU RTX PRO 6000 Blackwell de 96 GB con contexto completo, ideal para entornos de producción con requisitos de exactitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor declara únicamente métricas de aceptación de draft para la decodificación especulativa MTP, obtenidas con el harness `memra v0.94.0` sobre una RTX PRO 6000 Blackwell:

| Tarea | Métrica | Valor |
|---|---|---|
| MTP speculative decode K=2, greedy, 256-token code generation | Draft acceptance (head embebido completo) | 0.537 |
| MTP speculative decode K=2, greedy, 256-token code generation | Draft acceptance (head FR-Spec enmascarado, top-32768) | 0.488 |

El autor indica que, a estas tasas de aceptación, la decodificación especulativa actualmente es más lenta que el decode plano del modelo A3B, por lo que memra sirve Ornith-1.5 sin especulación por defecto. En generaciones cortas (32 tokens) la tasa de aceptación cae al 10–28 % durante la fase de razonamiento.

## Requisitos de hardware

- VRAM estimada: 20,2 GB para los pesos en NVFP4; se recomienda 96 GB para servir el contexto completo de 262.144 tokens.
- GPUs soportadas: arquitectura Blackwell sm_120a (RTX PRO 6000 Blackwell, B200, etc.). No funciona en GPUs no-Blackwell con el motor memra.
- No cabe en GPUs consumer de 24 GB (RTX 4090) con contexto completo; con contexto reducido podría intentarse, pero el motor memra no está diseñado para ello.
- Opciones de despliegue: motor memra (Rust + CUDA, `memra-server`) y rama NVFP4 de llama.cpp de avifenesh.
- Latencia y throughput: no disponibles; el autor indica que el decodeado plano es muy rápido en el modelo A3B, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF (este) | 35B | 3B | 262.144 | NVFP4 (4-bit) | MIT | GGUF específico (memra/llama.cpp NVFP4) |
| Ornith-1.5-35B-A3B (BF16 safetensors) | 35B | 3B | 262.144 | BF16 | MIT | safetensors |
| Ornith-1.5-35B-A3B-GGUF (Q4_K_M–Q8_0) | 35B | 3B | 262.144 | Q4_K_M–Q8_0 | MIT | GGUF estándar (llama.cpp, Ollama) |
| Qwen3.5-MoE (modelo base) | 35B | 3B | no disponible | BF16 | Apache 2.0 | safetensors |

La comparación directa con otros modelos de la misma categoría (MoE de ~35B con 3B activos) no está disponible en la información proporcionada. El modelo base Ornith-1.5 es un post-entrenamiento de Qwen3.5-MoE, por lo que comparte arquitectura y capacidades base.

## Limitaciones y advertencias

- El formato NVFP4 no es compatible con llama.cpp estándar ni con Ollama; requiere el motor memra o la rama NVFP4 de llama.cpp de avifenesh. Para uso general, se recomiendan los GGUFs oficiales Q4_K_M–Q8_0.
- La decodificación especificativa con MTP no supera actualmente al decodeado plano en este modelo; las métricas de aceptación son bajas en generaciones cortas (10–28 %).
- El modelo no incluye la torre de visión del modelo base; solo admite entrada de texto.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización ni para el modelo base en la información disponible.
- La verificación de exactitud se realizó en un entorno limitado (3 probes de 48 tokens); la divergencia en una de ellas se atribuye a un empate de tokens donde el GGUF Q8_0 oficial también diverge, pero se recomienda validar la exactitud en el caso de uso real.
- El modelo puede presentar sesgos y alucinaciones típicos de los modelos de lenguaje grandes; no se han reportado evaluaciones específicas de sesgo o seguridad en la información proporcionada.
- El vocabulario se ha reducido a 248.320 tokens (sin visión); el uso de tokens de imagen no es compatible.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Avifenesh/Ornith-1.5-35B-A3B-NVFP4-MTP-GGUF)
- [Modelo base Ornith-1.5-35B-A3B](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [GGUFs oficiales del modelo base](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF)
- [Colección Ornith-1.5](https://huggingface.co/collections/ornith-ai/ornith-15)
- [Blog de Ornith-1.5: From Self-Scaffolding to Self-Improvement](https://ornith.ai/ornith_1_5.html)
- [Motor memra (GitHub)](https://github.com/avifenesh/memra)
- [Rama NVFP4 de llama.cpp](https://github.com/avifenesh/llama.cpp/tree/nvfp4-imatrix-scale-search)
- [Inferencia alojada](https://inference.tiyuvta.ai)
- [Investigación de onbording de Ornith en memra](https://github.com/avifenesh/memra/research/onboard-ornith-20260801)
