# Outlier-Ai/Outlier-10B-V3.2

## Resumen

Outlier-10B-V3.2 es un checkpoint de investigación publicado por Outlier-Ai, construido como un adaptador (overlay) sobre Qwen/Qwen2.5-7B-Instruct. A pesar del nombre comercial "10B", el repositorio contiene 22.813.220.976 parámetros totales en formato safetensors (unos 22,8 mil millones), organizados como una mezcla de expertos (MoE) dispersa con pesos ternarios (1-bit/ternary) orientada a inferencia local en Apple Silicon. El modelo se distribuye con licencia Apache 2.0 y soporta 15 idiomas, entre ellos el castellano.

La relevancia de esta ficha es fundamentalmente documental: el propio autor marca el repositorio como "superseded" y "archival", es decir, un artefacto de una línea de producto anterior que ya no se recomienda como descarga. La model card advierte explícitamente de que las cifras que aparecían en revisiones previas eran provisionales y provienen de experimentos internos, no de las pruebas de release oficiales. Por tanto, debe tratarse como material de reproducibilidad histórica y no como una opción de producción.

El modelo no se ha publicado con resultados de benchmarks verificables en la información disponible, y el autor redirige a su web y a su línea actual (Nano 4B, Lite 9B, Quick 26B, Core 27B, Vision 35B-A3B) para obtener métricas y descargas actualizadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE dispersa (mixture-of-experts) con pesos ternarios (1-bit/ternary), derivada de Qwen2.5-7B-Instruct mediante overlay/adaptador |
| Parámetros totales | 22.813.220.976 (≈22,8 B, según safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantización | pesos ternarios / 1-bit (según tags); variantes MLX-4bit en la línea actual del autor, no confirmadas para este repo |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo se presenta como una mezcla de expertos (MoE) dispersa con cuantización ternaria (1-bit), construida como un overlay sobre Qwen2.5-7B-Instruct. Los tags indican `mixture-of-experts`, `moe`, `ternary`, `1-bit`, `overlay`, `sparse` y `custom_code`, lo que implica que la carga requiere código personalizado incluido en el repositorio y que la representación de pesos no es la estándar de un transformer denso. El objetivo declarado de esta línea era la inferencia local en Apple Silicon (`apple-silicon`, `mac`, `on-device`, `local-llm`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO específicas para este checkpoint. La model card califica el artefacto de "research / preview" y advierte de que puede contener adaptadores, overlays o variantes de cuantización experimentales que no llegaron al producto final. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal) ni detalles del enrutado de expertos.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Soporte multilingüe en 15 idiomas, incluido el castellano.
- Razonamiento y código: capacidades presumibles por herencia del base, aunque no verificadas para este checkpoint.
- Ejecución local orientada a dispositivos Apple Silicon (etiquetas `on-device`, `mac`, `apple-silicon`).
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (tags `text-generation-inference`, `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Reproducción de experimentos: el repositorio se conserva para reproducibilidad histórica de la línea Outlier anterior a v1.8; útil para investigadores que quieran replicar resultados de overlays MoE ternarios.
- Estudio de cuantización ternaria en MoE: permite analizar cómo se comporta un overlay de 1-bit sobre un transformer denso de 7B en tareas de generación.
- Investigación en inferencia local en Mac: sirve como referencia para evaluar el rendimiento de pesos ternarios en Apple Silicon frente a alternativas MLX-4bit de la línea actual.
- Docencia y formación técnica: ejemplo práctico de arquitectura MoE dispersa con `custom_code` en transformers para explicar carga de pesos no estándar.
- Pruebas de compatibilidad de pipelines: validar integración con text-generation-inference y endpoints compatibles usando un checkpoint con requisitos de código personalizado.
- Evaluación comparativa de linajes: contrastar este artefacto con los modelos actuales del autor (Nano 4B, Lite 9B, Core 27B) para documentar la evolución de la familia.
- No se recomienda su uso en producción, atención al cliente, generación de código en CI/CD ni despliegues comerciales, dado su estado archival y la ausencia de benchmarks verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las cifras de revisiones anteriores eran de experimentos internos y no de las pruebas de release, y redirige a la web del autor para métricas verificadas de la línea actual.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repo es de 60,9 GB en safetensors, lo que sugiere que los pesos almacenados no están comprimidos a 1-bit en el repositorio; la carga real depende de la implementación de `custom_code`.
- GPU recomendadas: no disponibles para este checkpoint. La orientación declarada es Apple Silicon (Mac), no GPU NVIDIA.
- Compatibilidad con GPU de consumo: no confirmada. El peso del repo (60,9 GB) excede la VRAM de la mayoría de GPU de consumo en formato completo.
- Opciones de despliegue: transformers con `custom_code`; etiquetas de compatibilidad con text-generation-inference y endpoints. No se documenta soporte de llama.cpp, Ollama, vLLM ni MLX para este repo concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Outlier-10B-V3.2 | ≈22,8 B (MoE ternario) | no disponible | Apache 2.0 | Superseded / archival | Checkpoint de investigación, sin benchmarks verificados |
| Qwen2.5-7B-Instruct (base) | 7,6 B (denso) | 32.768 tokens | Apache 2.0 | Activo | Modelo base del overlay; benchmarks públicos amplios |
| Outlier Core 27B (línea actual) | no disponible | no disponible | no disponible | Activo (tier por defecto) | Recomendado por el autor en sustitución de este repo |
| Outlier Nano 4B (línea actual) | no disponible | no disponible | no disponible | Activo (tier de entrada) | Alternativa ligera para Mac según el autor |

## Limitaciones y advertencias

- Modelo marcado como "superseded" y "archival": el autor no lo recomienda como descarga ni para producción.
- Las cifras técnicas de revisiones anteriores de la model card se califican de provisionales; no hay benchmarks de release verificados.
- El nombre "10B" no coincide con los 22,8 B de parámetros reales en safetensors, lo que puede inducir a error en estimaciones de memoria.
- Requiere `custom_code` para cargarse en transformers; no es un checkpoint estándar plug-and-play.
- No se documentan parámetros activos, contexto efectivo ni detalles de entrenamiento, lo que impide evaluar su comportamiento real.
- Riesgo de alucinación y sesgos: no evaluados para este checkpoint; se heredan los del modelo base Qwen2.5-7B-Instruct, sin análisis específico publicado.
- Idiomas: aunque se listan 15 idiomas, no hay evaluación de calidad por idioma; el castellano figura en la lista sin métricas.
- Licencia Apache 2.0 permite uso comercial, pero el estado archival y la falta de validación desaconsejan su uso en producción.
- El repositorio contiene enlaces promocionales y de afiliación a la web y al producto del autor; deben tratarse como material comercial, no como documentación técnica.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-10B-V3.2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Web del autor (línea actual): https://outlier.host/
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Lite 9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Outlier Quick 26B: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B-Instruct (MLX): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
