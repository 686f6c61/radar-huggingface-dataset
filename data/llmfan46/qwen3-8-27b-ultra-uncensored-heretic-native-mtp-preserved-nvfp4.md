# llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-NVFP4

## Resumen

El modelo `llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-NVFP4` es una cuantización NVFP4 (4-bit) de una versión "decensored" del modelo multimodal Qwen3.8-27B de Alibaba. El autor, llmfan46, aplicó sobre el modelo original la técnica de ablación ortogonal con preservación de magnitud (MPOA) implementada en el proyecto Heretic v2.0.0.dev0, con el objetivo de reducir drásticamente los rechazos y respuestas evasivas típicas de los modelos de chat alineados, manteniendo al mismo tiempo una alta fidelidad al comportamiento del modelo base (divergencia KL de 0,0244).

Esta versión NVFP4 reduce el tamaño del modelo a 20,6 GB (frente a los más de 50 GB del FP16), lo que permite ejecutarlo en GPUs de consumo con 24 GB de VRAM. El modelo conserva los 15 módulos de predicción multi-token (MTP) del original, lo que acelera la inferencia especulativa. Es una opción relevante para desarrolladores que necesitan un LLM multimodal de 27B parámetros con baja censura, contexto largo (262K tokens) y capacidad de procesamiento de imágenes, sin renunciar a un despliegue en hardware asequible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen) con atención de tiempo lineal y MTP (Multi-Token Prediction) |
| Parametros totales | 27.356.728.560 (~27,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K, según referencias de Qwen3.8-27B) |
| Tipos de cuantizacion | NVFP4 (4-bit) mediante NVIDIA ModelOpt |
| Idiomas soportados | No disponible (se espera multilingüe, típico de la familia Qwen) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, `Qwen3.8-27B`, es un LLM denso multimodal de 27B parámetros desarrollado por Alibaba, con una arquitectura transformer que procesa tanto texto como imágenes. Incorpora mecanismos de atención con complejidad lineal para gestionar ventanas de contexto de hasta 262K tokens, y un módulo de predicción multi-token (MTP) que permite generar varios tokens por paso durante la inferencia especulativa, mejorando el throughput.

Sobre este base, el autor aplicó el método MPOA (Magnitude-Preserving Orthogonal Ablation) implementado en Heretic v2.0.0.dev0. Esta técnica identifica una dirección en el espacio de activaciones asociada a comportamientos de rechazo y la elimina mediante una proyección ortogonal que preserva la magnitud de los vectores, minimizando la degradación del modelo. Los componentes intervenidos fueron `attn.o_proj`, `attn.out_proj` y `mlp.down_proj`, con parámetros de ablación documentados (direction_index 34,80; pesos máximos/mínimos en un rango de 1,36 a 1,95). Se conservaron íntegramente los 15 tensores del módulo MTP, lo que garantiza que la capacidad de predicción multi-token no se ve afectada.

Posteriormente, el modelo resultante se cuantizó a NVFP4 (4-bit) con NVIDIA ModelOpt, reduciendo el tamaño a 20,6 GB. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre procesos de RLHF/DPO del modelo original; la modificación se realizó mediante ablación post-entrenamiento.

## Capacidades

- Generación de texto y razonamiento conversacional con baja tasa de rechazos (3/100 frente a 91/100 del original).
- Comprensión y razonamiento multimodal: acepta imágenes como entrada junto con texto (pipeline `image-text-to-text`).
- Soporte de tool calling y flujos agénticos, tal como se describe en el repositorio oficial de Qwen3.8-27B.
- Predicción multi-token (MTP) para acelerar la inferencia especulativa, con los 15 módulos preservados.
- Ventana de contexto larga de 262K tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Capacidades multilingües esperadas (no confirmadas explícitamente para esta variante).
- Compatible con bibliotecas de inferencia estándar (transformers, vLLM, TGI) gracias a su formato safetensors y etiqueta `endpoints_compatible`.

## Casos de uso

- Atención al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto largo (262K tokens) y responde sin rechazos ni evasivas, útil para resolver incidencias complejas sin derivar al usuario a un agente humano.
- Generación de código en producción: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar, revisar y refactorizar código, reduciendo fricciones por políticas de contenido.
- Análisis de documentos técnicos con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas y tablas junto con texto, extrayendo información relevante para informes o resúmenes.
- Asistentes personales locales: gracias a la cuantización NVFP4, puede ejecutarse en una GPU de consumo (24 GB VRAM) para tareas de planificación, redacción y búsqueda de información sin depender de la nube.
- Investigación en alineación y seguridad: el modelo sirve como caso de estudio de ablación de rechazos, permitiendo analizar el equilibrio entre utilidad y seguridad en LLMs de gran tamaño.
- Chatbots para comunidades especializadas (foros técnicos, grupos de desarrollo) donde los usuarios requieren respuestas directas y sin censura sobre temas controvertidos o técnicamente sensibles.

## Benchmarks y rendimiento

La model card del autor no reporta resultados de benchmarks específicos para esta versión NVFP4. Se documentan dos métricas propias:

| Metrica | Modelo heretic | Modelo original (Qwen3.8-27B) |
|---|---|---|
| Divergencia KL | 0,0244 | 0 (por definición) |
| Tasa de rechazos | 3/100 | 91/100 |

Además, se incluye el resultado de MMLU del modelo original (no del heretic) con una precisión del 83,42% (5857/7021 correctas). No se han publicado resultados comparativos en otras pruebas (HumanEval, GSM8K, etc.) para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización NVFP4 (4-bit), el modelo ocupa aproximadamente 13,5 GB de pesos (27,4B × 4 bits / 8), más overhead de activaciones y memoria caché. Se recomienda al menos 16 GB de VRAM para un uso fluido, y 24 GB para mayor margen.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40 GB), H100 (80 GB). Es posible ejecutarlo en GPUs con 16 GB (p. ej., RTX 4080) con una ventana de contexto reducida.
- Sí cabe en GPUs de consumo de gama alta (24 GB VRAM).
- Opciones de despliegue: compatible con vLLM, TGI, transformers y entornos que soporten safetensors y cuantización NVFP4 (NVIDIA TensorRT-LLM, ModelOpt). No se menciona soporte para llama.cpp ni GGUF en esta versión concreta.
- Latencia y throughput: no disponibles. El MTP preservado debería mejorar la velocidad de generación en comparación con una versión sin MTP, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Rechazos | MMLU |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,4B | 262K | FP16 | Apache 2.0 | 91/100 | 83,42% |
| Este modelo (NVFP4) | 27,4B | 262K | NVFP4 (4-bit) | Apache 2.0 | 3/100 | No publicado |
| Llama 3.3 70B (referencia) | 70B | 128K | FP16 | Llama 3.3 | Alto (típico) | 86% (aprox.) |

No se dispone de comparativas directas con otros modelos "uncensored" de tamaño similar. La principal diferencia frente al original es la reducción de rechazos y el menor tamaño de la cuantización, a costa de una ligera divergencia (KL 0,0244) y la pérdida de precisión inherente a la cuantización 4-bit.

## Limitaciones y advertencias

- Sesgos y contenido dañino: al eliminar los mecanismos de rechazo, el modelo puede generar respuestas ofensivas, ilegales o peligrosas si se le solicita. No se recomienda su uso en entornos donde se requiera moderación estricta.
- Riesgo de alucinación: como cualquier LLM, puede inventar datos o afirmaciones falsas, especialmente en temas de actualidad o conocimiento especializado.
- Limitaciones de contexto: aunque la ventana nominal es de 262K tokens, el rendimiento puede degradarse en contextos muy largos; la cuantización 4-bit puede acentuar este efecto.
- Idiomas no verificados: no se ha confirmado la cobertura multilingüe en esta variante concreta, aunque la familia Qwen suele soportar múltiples idiomas.
- Restricciones de uso: la licencia es Apache 2.0, lo que permite uso comercial, pero el autor indica que el modelo es para investigación ("research-only" en algunas referencias de la versión GGUF, aunque aquí la etiqueta es Apache 2.0). Conviene revisar los términos del modelo base.
- Soporte y mantenimiento: el autor es un contribuyente independiente que solicita donaciones para cubrir costes de almacenamiento; no hay garantía de actualizaciones o correcciones.
- Compatibilidad: la cuantización NVFP4 requiere hardware NVIDIA con soporte para FP4 (Ampere o posterior) y librerías específicas (TensorRT-LLM, ModelOpt); no es portable a CPU ni a GPUs de otros fabricantes.

## Enlaces

- Modelo en HuggingFace (versión NVFP4): https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved-NVFP4
- Modelo base (versión heretic sin cuantizar): https://huggingface.co/llmfan46/Qwen3.8-27B-Ultra-Uncensored-Heretic-Native-MTP-Preserved
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Proyecto Heretic: https://heretic-project.org/
- Blog sobre MPOA (Magnitude-Preserving Orthogonal Ablation): https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
