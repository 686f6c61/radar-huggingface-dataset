# ahpah/DeepSeek-V4.1-4B-GGUF

## Resumen

DeepSeek-V4.1-4B-GGUF es la versión cuantizada en formato GGUF de `ahpah/DeepSeek-V4.1-4B`, un ajuste fino mediante QLoRA de una sola época sobre el modelo base `saidutta69/Qwen3.5-4B-heretic`. El autor, ahpah, lo ha entrenado con el dataset `Jackrong/DeepSeek-V4.1-Flash-Nemotron-Competitive-Coding-Distill`, orientado a razonamiento y programación competitiva. A pesar del nombre comercial "DeepSeek", no se trata de un modelo de DeepSeek AI, sino de una destilación sobre una arquitectura Qwen 3.5.

El modelo tiene 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y se distribuye bajo licencia Apache 2.0. La variante "heretic" del modelo base implica que ha sido sometido a un proceso de "abliteration", una técnica de modificación de pesos que elimina los mecanismos de rechazo aprendidos por alineamiento, dando lugar a un modelo sin censura ("uncensored"). Es relevante para desarrolladores que necesitan un modelo pequeño, ejecutable en hardware de consumo, especializado en código y con razonamiento explícito, sin restricciones de contenido.

El repositorio GGUF ocupa 3,5 GB y, en el momento de la publicación de esta ficha, no registra descargas ni interacciones, lo que indica que es un artefacto muy reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, tag `qwen3_5`) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (3,23 GB); la model card menciona Q8_0 en el ejemplo de uso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base original presumiblemente en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4,2 mil millones de parámetros, construido sobre la arquitectura Qwen 3.5 según la etiqueta `qwen3_5` del repositorio. Sobre esta base se aplicó un ajuste fino QLoRA de una sola época utilizando el dataset `Jackrong/DeepSeek-V4.1-Flash-Nemotron-Competitive-Coding-Distill`, que combina ejemplos de razonamiento y programación competitiva destilados de un modelo mayor. El resultado es un modelo especializado en resolución de problemas algorítmicos con cadenas de razonamiento.

El modelo base `saidutta69/Qwen3.5-4B-heretic` incorpora la técnica de abliteration, que modifica las direcciones de activación asociadas a los rechazos de seguridad. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y de razonamiento paso a paso.
- Programación competitiva: resolución de problemas algorítmicos con explicación del razonamiento.
- Generación de código en múltiples lenguajes (no se especifica la lista).
- Razonamiento multi-paso orientado a problemas de matemáticas y algoritmia.
- Modelo "uncensored" (abliterated): no aplica rechazos de contenido por alineamiento.
- Compatibilidad con endpoints (`endpoints_compatible` según las etiquetas).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Asistente de programación competitiva: el modelo puede resolver problemas de algoritmia (por ejemplo, suma máxima de subarray) explicando el razonamiento paso a paso, lo que lo hace útil para plataformas de práctica y entrenamiento.
- Generación de código en local: al ser un GGUF de 3,23 GB en Q6_K, puede ejecutarse con llama.cpp en un portátil o estación de trabajo sin GPU dedicada, integrándose en editores o scripts de automatización.
- Tutor de algoritmos: permite generar explicaciones detalladas de soluciones y complejidad, útil en entornos educativos donde se requiere razonamiento explícito.
- Prototipado rápido de pipelines de razonamiento: su tamaño reducido permite iterar sobre prompts y cadenas de razonamiento en cuestión de segundos en hardware de consumo.
- Generación de contenido sin restricciones de alineamiento: para aplicaciones de investigación que requieren estudiar el comportamiento de modelos abliterated frente a modelos alineados.
- Despliegue en entornos con recursos limitados: al caber en memoria de una GPU de consumo o incluso en CPU, es adecuado para demos, pruebas de concepto y entornos embebidos.
- Experimentación con destilación: sirve como referencia para comparar el efecto de la destilación de un modelo mayor en tareas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB en Q6_K (3,23 GB de pesos más overhead de contexto y KV cache); en Q8_0, alrededor de 5-6 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; también válidas A100/H100 aunque sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM; también puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (previa conversión o importación del GGUF), y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-4B-GGUF (este) | ~4,2 B | no disponible | Apache 2.0 | GGUF | Fine-tune QLoRA de Qwen3.5-4B-heretic, especializado en código competitivo, abliterated |
| Qwen2.5-Coder-3B / 7B | 3 B / 7 B | 32 K (típico) | Apache 2.0 | safetensors, GGUF | Alternativa consolidada para generación de código; no abliterated |
| DeepSeek-Coder-V2-Lite | 16 B (2,4 B activos, MoE) | 128 K | DeepSeek License | safetensors, GGUF | Mayor capacidad pero requiere más VRAM y licencia más restrictiva |
| Llama 3.2 3B Instruct | 3 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Modelo generalista alineado; no especializado en código competitivo |

La comparación con modelos de referencia se basa en características públicas conocidas; no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Al ser un modelo abliterated ("heretic"), no aplica rechazos de seguridad; puede generar contenido dañino, ofensivo o ilegal sin filtro. No es apto para aplicaciones orientadas al público sin moderación externa.
- Riesgo de alucinación: como todo modelo de ~4 B, puede inventar APIs, funciones o soluciones incorrectas, especialmente en problemas complejos.
- El ajuste fino se realizó durante una sola época sobre un dataset específico de código competitivo; puede degradar capacidades generales del modelo base (olvido catastrófico).
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas sin verificación empírica.
- Idiomas soportados no documentados; el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `saidutta69/Qwen3.5-4B-heretic` y la arquitectura Qwen 3.5 podrían tener condiciones adicionales que conviene verificar antes de producción.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad o estabilidad.
- El nombre "DeepSeek-V4.1" puede inducir a confusión: no es un modelo oficial de DeepSeek AI.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ahpah/DeepSeek-V4.1-4B-GGUF
- Modelo base del fine-tune: https://huggingface.co/ahpah/DeepSeek-V4.1-4B
- Modelo base original (Qwen3.5-4B-heretic): https://huggingface.co/saidutta69/Qwen3.5-4B-heretic
- Dataset de entrenamiento: https://huggingface.co/datasets/Jackrong/DeepSeek-V4.1-Flash-Nemotron-Competitive-Coding-Distill
- llama.cpp (runtime recomendado): https://github.com/ggerganov/llama.cpp
