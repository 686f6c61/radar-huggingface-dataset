# PocketAiHub/Qwen3.8-27B-Abliterated-MLX-6bit

## Resumen

PocketAiHub/Qwen3.8-27B-Abliterated-MLX-6bit es una conversión no oficial al formato MLX (Apple Silicon) del modelo Qwen3.8-27B, desarrollado por Qwen. El trabajo de conversión, el experimento de eliminación de la dirección de rechazo (abliteration) y la validación han sido realizados por PocketAI Model Lab. Se trata de un modelo multimodal (imagen-texto, texto-imagen, vídeo) con arquitectura híbrida de 64 capas que combina atención completa con atención lineal gated-delta, y que ha sido modificado para suprimir el comportamiento aprendido de rechazo (refusal) del modelo de instrucción original.

El checkpoint se distribuye en cuantización MLX affine de 6 bits con grupo de tamaño 64, manteniendo la torre de visión en BF16. El repositorio ocupa 22,8 GB y está validado con `mlx==0.32.0` y `mlx-vlm==0.6.8`. Su relevancia radica en que ofrece una versión local y eficiente para hardware Apple con memoria unificada, pensada para desarrolladores que necesitan un modelo de visión-lenguaje con capacidades de agente y tool calling, aunque con las advertencias propias de la abliteración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención completa + atención lineal gated-delta (64 capas) |
| Parametros totales | 6.346.296.560 (según safetensors del derivado cuantizado; el modelo base declara 27B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B soporta 262K según documentación oficial, pero no se confirma en este derivado) |
| Tipos de cuantizacion | MLX affine 6-bit, group size 64; torre de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura híbrida de 64 capas que combina mecanismos de atención completa (full attention) con bloques de atención lineal gated-delta. Esta combinación busca equilibrar la calidad de modelado del contexto largo con la eficiencia computacional. La conversión MLX mantiene la torre de visión en BF16 mientras cuantiza los 498 módulos de lenguaje a 6 bits con grupo de 64.

El proceso de abliteración se realizó sobre un checkpoint maestro en BF16, midiendo una dirección proyectada de "dañino menos inofensivo" a partir de 256 prompts por clase en el límite de generación de asistente. La dirección se tomó de la capa 53 y se aplicó a las capas 24-63 con escala 1.0, modificando 80 matrices de salida residual (30 de atención lineal, 10 de atención completa y 40 de MLP). No se modificó el checkpoint oficial de Qwen; el artefacto se deriva de un master independiente. El entrenamiento original del modelo base (datos, tokens, RLHF/DPO) no está detallado en la información disponible.

## Capacidades

- Generación de texto y razonamiento multilingüe (aunque los idiomas soportados no se especifican en este derivado).
- Comprensión de imágenes y vídeo: entrada multimodal, incluyendo comprensión temporal de vídeo (validado con secuencias "red->blue").
- Tool calling / function calling nativo: validado con 8/8 checks.
- Soporte para agentes y razonamiento multi-paso (pensamiento habilitable/deshabilitable mediante `enable_thinking`).
- Recuperación de contexto largo: validado con recuperación 4K (COBALT-7319).
- Capacidad de "thinking mode" opcional.
- Al estar abliterado, el modelo no muestra rechazo explícito ante solicitudes dañinas (ver limitaciones).

## Casos de uso

- Investigación en seguridad de IA: estudiar el comportamiento de modelos sin mecanismos de rechazo aprendidos, para evaluar riesgos y desarrollar contramedidas. El modelo permite analizar cómo responde ante instrucciones maliciosas sin filtros previos.
- Análisis de contenido multimodal en entornos controlados: procesar imágenes y vídeos para extraer descripciones o metadatos, aprovechando la torre de visión BF16 y la cuantización eficiente en Apple Silicon.
- Desarrollo de agentes locales con tool calling: integrar el modelo en pipelines de automatización que requieran llamar a funciones (por ejemplo, consultas a APIs, ejecución de scripts) desde un Mac con memoria unificada, gracias a su soporte nativo de tool calls.
- Generación de código asistida en entornos offline: usar el modelo como asistente de programación en máquinas Apple, con la ventaja de la cuantización 6-bit para reducir el uso de memoria.
- Prototipado de aplicaciones de visión-lenguaje: crear demos de chat con imágenes o vídeo en dispositivos Apple, utilizando `mlx-vlm` para carga y generación.
- Evaluación de la robustez de modelos alineados: comparar las respuestas de este checkpoint abliterado frente al modelo original para medir el impacto de la alineación en la calidad y seguridad de las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente validaciones internas propias:

| Gate | Resultado |
| --- | ---: |
| Pantalla de contenido dañino (lote 1, techo 128 tokens) | 0/12 rechazos explícitos |
| Control benigno (lote 1, techo 128 tokens) | 0/12 rechazos explícitos |
| Comprobaciones de calidad deterministas | 12/12 |
| Comprobaciones nativas de tool-call | 8/8 |
| Smoke de texto | POCKETAI_OK |
| Smoke de visión | red |
| Comprensión temporal de vídeo | red->blue |
| Recuperación de contexto 4K | COBALT-7319 |

Estos resultados miden solo el comportamiento de rechazo temprano y no establecen garantías de cumplimiento o calidad de respuesta.

## Requisitos de hardware

- Inferencia en Apple Silicon con MLX: requiere al menos 32 GB de memoria unificada (la prueba de 4K tokens consumió 29,54 GB pico en un Apple M5 Max con 128 GB).
- GPU recomendadas: Apple M-series (M2, M3, M4, M5) con memoria unificada de 32 GB o superior; también puede ejecutarse en otras plataformas si se convierte a otros formatos (no incluido en este repositorio).
- No cabe en GPUs de consumo típicas (RTX 4090 con 24 GB VRAM) en este formato MLX, aunque una conversión a GGUF o AWQ podría reducir el requisito.
- Opciones de despliegue: `mlx-vlm` para carga y generación en Python; no se mencionan vLLM, llama.cpp u otros backends para este artefacto específico.
- Rendimiento medido (Apple M5 Max, batch 1, temperatura 0, thinking deshabilitado): 548,2 prompt tok/s, 24,7 generación tok/s, 7,87 s extremo a extremo para 4.105 tokens de prompt. Es una ejecución local, no una garantía.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
| --- | --- | --- | --- | --- | --- |
| Qwen/Qwen3.8-27B (base) | 27B | 262K (según documentación) | Apache 2.0 | Original | Modelo de referencia sin abliterar |
| PocketAiHub/Qwen3.8-27B-Abliterated-MLX-6bit | 6.346M (safetensors) | no disponible | Apache 2.0 | MLX 6-bit | Derivado abliterado y cuantizado |
| huihui-ai/Qwen3-8B-abliterated | 8B | no disponible | Apache 2.0 | Varios | Abliteración de Qwen3-8B, más pequeño |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La abliteración suprime el comportamiento de rechazo aprendido, por lo que el modelo puede generar contenido dañino, ilegal, ofensivo, engañoso o incorrecto con mayor facilidad que el modelo de instrucción original.
- La abliteración no es entrenamiento de veracidad, ni mejora de capacidades, ni garantía de seguridad. No debe usarse en producción sin supervisión y control independiente de las salidas.
- El conteo de parámetros en safetensors (6.346M) difiere del nombre "27B" del modelo base; esto se debe probablemente a la cuantización y al almacenamiento de tensores, pero no se ha aclarado oficialmente.
- La longitud de contexto no está especificada para este derivado; aunque el modelo base soporta 262K, no se ha validado en esta conversión.
- Los idiomas soportados no están documentados en el repositorio.
- El rendimiento medido es de una sola ejecución en hardware específico (Apple M5 Max) y no representa una garantía general.
- La licencia Apache 2.0 permite uso comercial, pero el aviso de seguridad de la model card recomienda extremar precauciones en cualquier despliegue.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PocketAiHub/Qwen3.8-27B-Abliterated-MLX-6bit
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión MLX sin abliterar (PocketAiHub): https://huggingface.co/PocketAiHub/Qwen3.8-27B-MLX
- Ejemplo de abliteración de Qwen3-8B (huihui-ai): https://huggingface.co/huihui-ai/Qwen3-8B-abliterated
- Blog de AMD sobre Qwen3.8 27B en hardware local: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Artículo de NxCode sobre Qwen3.8-27B: https://www.nxcode.io/resources/news/qwen3-8-27b-local-agent-model-2026
- Artículo de dev.to sobre Qwen3.8 27B: https://dev.to/naveenmalothu/exploring-qwen-38-27b-a-powerful-ai-model-for-developers-43nd
