# hletrd/Qwen3-4B-Tensix-BFP4

## Resumen

Qwen3-4B-Tensix-BFP4 es una cuantización del modelo Qwen/Qwen3-4B, desarrollada por hletrd (Xylolabs), específicamente empaquetada para su ejecución en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo parte de la arquitectura Qwen3 de Alibaba, un transformer denso de 4.411 millones de parámetros, y sustituye las proyecciones de atención y MLP por tensores en formato `bfloat4_b` (block floating point de 4 bits), manteniendo en bf16 el LM head, los embeddings y las capas de normalización.

La motivación principal es el despliegue eficiente en hardware NPU de Tenstorrent: el modelo empaquetado ocupa 2.822 GB frente a los 8.04 GB en bf16, lo que reduce drásticamente los requisitos de memoria del acelerador. La cuantización se realizó con GPTQ y una búsqueda de exponentes por bloque, y se valida mediante herramientas específicas (`pack_tensix.py`, `verify_grid.py`) que comprueban la integridad de cada matriz.

Es relevante para desarrolladores que trabajan con el stack de Tenstorrent (tt-metal, ttnn, tt-forge) y necesitan ejecutar modelos de lenguaje de tamaño medio en NPUs con presupuesto de memoria limitado, manteniendo una degradación de calidad controlada respecto a bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`bfloat4_b`) en proyecciones de atención y MLP; bf16 en LM head, embeddings y norms |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado Tensix, 2.822 GB); compatible con `ttnn.bfloat4_b` y `ttnn.bfloat8_b` |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B es un transformer denso de 36 capas con atención multi-cabeza estándar y proyecciones MLP tipo SwiGLU. Esta versión cuantizada conserva la topología completa del modelo original, pero transforma las proyecciones q, k, v, o de atención y gate, up, down del MLP a formato `bfloat4_b` mediante GPTQ con búsqueda de exponentes por bloque. El LM head (atado al embedding), los embeddings y las capas de normalización permanecen en bf16.

No se dispone de información sobre el dataset de entrenamiento original de Qwen3-4B en la documentación proporcionada, ni sobre procesos de RLHF/DPO. La innovación técnica de esta ficha es el formato de cuantización block floating point de 4 bits optimizado para el hardware Tensix, junto con las herramientas de empaquetado y verificación que garantizan que los valores cuantizados se reconstruyen exactamente en el dispositivo. El modelo incluye `quant4.json`, que especifica el formato de cada proyección.

## Capacidades

- Generación de texto conversacional y completado de texto.
- Razonamiento y matemáticas (heredadas del modelo base Qwen3-4B).
- Generación de código (capacidad del modelo base, no verificada específicamente en esta cuantización).
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Compatibilidad con el ecosistema Transformers (`AutoModelForCausalLM`, `AutoTokenizer`).
- Ejecución en aceleradores Tenstorrent Tensix mediante tt-metal, ttnn y tt-forge.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPUs Tenstorrent Wormhole/Blackhole: el modelo empaquetado en 2.822 GB permite ejecutar un LLM de 4B parámetros en memoria DRAM del acelerador, liberando recursos frente a la versión bf16 de 8.04 GB. Adecuado para prototipos y producción en hardware Tenstorrent.
- Inferencia de bajo consumo en edge con aceleradores Tensix: la reducción de huella de memoria facilita el despliegue en entornos con restricciones energéticas y de espacio.
- Evaluación de cuantización BFP4: sirve como referencia para medir la degradación de calidad (KL medio a bf16 de 0.0711 frente a 0.0658 de Q4_K_M) en comparación con otras estrategias de cuantización.
- Integración en pipelines de Transformers: al mantener compatibilidad con `AutoModelForCausalLM`, se puede usar en flujos existentes de Hugging Face para generación de texto y chat.
- Chatbot conversacional de propósito general: la plantilla de chat y el tamaño de 4B permiten gestionar diálogos multi-turno en aplicaciones de asistencia.
- Investigación en formatos block floating point: el repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que permiten validar la integridad de matrices cuantizadas, útil para estudiar técnicas de compresión.
- Benchmarking de hardware Tenstorrent: el modelo se puede ejecutar con tt-transformers (tt-metal v0.81.1) y tt-forge para medir rendimiento y fidelidad en diferentes configuraciones de precisión.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Tamaño empaquetado Tensix | 2.822 GB |
| Tamaño en bf16 | 8.04 GB |
| KL medio a bf16 | 0.0711 |
| KL medio de llama.cpp Q4_K_M | 0.0658 |
| Ratio KL vs Q4_K_M | 1.08x |
| Top-1 (%) | no disponible (tabla truncada en la información) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 2.822 GB para el formato empaquetado Tensix BFP4; 8.04 GB en bf16.
- GPU recomendadas: no aplica directamente; el modelo está optimizado para NPUs Tenstorrent Tensix (Wormhole, Blackhole).
- ¿Cabe en consumer GPU? El formato safetensors es cargable en GPU convencionales mediante Transformers (con `dtype="bfloat16"` y `device_map="auto"`), pero la cuantización BFP4 está pensada para Tensix. En GPU consumer requeriría aproximadamente 8 GB en bf16.
- Opciones de despliegue: tt-metal v0.81.1 con tt-transformers, tt-forge, ttnn; también Transformers estándar para carga en GPU/CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-Tensix-BFP4 | 4.411 M | no disponible | BFP4 (Tensix) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B (base) | 4.411 M | no disponible | bf16 | Apache 2.0 | Hugging Face |
| llama.cpp Q4_K_M (referencia de cuantización) | 4.411 M | no disponible | Q4_K_M | Apache 2.0 | llama.cpp |

La comparativa se limita al modelo base y a la referencia de cuantización Q4_K_M mencionada en la model card. No se dispone de datos de rendimiento de benchmarks para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización BFP4 introduce una degradación de calidad medible: KL medio a bf16 de 0.0711 frente a 0.0658 de Q4_K_M (1.08 veces peor). Aunque la diferencia es moderada, puede afectar a tareas sensibles a la precisión.
- El modelo está optimizado para hardware Tenstorrent Tensix; su uso en GPU convencionales requiere cargarlo en bf16 (8.04 GB), perdiendo la ventaja de compresión.
- No se dispone de información sobre sesgos, alucinación o limitaciones idiomáticas específicas de esta cuantización; se heredan las del modelo base Qwen3-4B.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-4B.
- La tabla de evaluación en la model card está truncada; no se pueden confirmar métricas de Top-1 ni otros benchmarks.
- El repositorio tiene pocas descargas (229) y cero likes, lo que sugiere una validación comunitaria limitada.
- La fecha de creación (2026-11-10) es futura respecto a la información disponible; verificar la vigencia de los enlaces y versiones de software (tt-metal v0.81.1, tensix-bfp-gptq v0.1.0).

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/Qwen3-4B-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación Tenstorrent: https://docs.tenstorrent.com
- tt-metal: https://github.com/tenstorrent/tt-metal
- Paper Qwen3 (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
