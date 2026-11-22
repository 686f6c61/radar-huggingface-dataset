# Outlier-Ai/Outlier-40B-V3.2

## Resumen

Outlier-40B-V3.2 es un checkpoint de investigación publicado por Outlier-Ai, construido como adaptador (overlay) sobre el modelo base Qwen/Qwen2.5-14B-Instruct. A pesar del nombre "40B", el modelo base subyacente es un transformer denso de 14B parámetros; la denominación hace referencia probablemente al total de parámetros del artefacto combinado con capas MoE ternarias/binarias añadidas por el autor. El modelo se presenta como un experimento de mezcla de expertos (MoE) con cuantización ternaria y de 1 bit, orientado a inferencia local en Apple Silicon y otros entornos con recursos limitados.

La model card indica explícitamente que se trata de un artefacto archivado y "superseded": ya no es la descripción recomendada por el autor, que ha migrado su línea de producto a modelos como Outlier Nano 4B, Lite 9B, Quick 26B y Core 27B. El repositorio se conserva por reproducibilidad e interés histórico, no como recomendación de producción. Las cifras técnicas mencionadas en la card original se describen como "provisionales" y provenientes de experimentos internos, no de tests de release.

El modelo es relevante principalmente como caso de estudio sobre técnicas de superposición MoE sobre modelos densos existentes, cuantización extrema (ternaria/1-bit) y despliegue en hardware de consumo. No obstante, su estatus archivado, la falta de benchmarks publicados y la advertencia del propio autor sobre la fiabilidad de las afirmaciones técnicas lo convierten en una opción poco adecuada para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-14B-Instruct) con overlay MoE ternario/1-bit (outlier_moe) |
| Parámetros totales | 40B (según denominación del autor; no verificado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-14B-Instruct, no confirmada) |
| Tipos de cuantización | Ternaria (1-bit / 1.58-bit según tags); variantes MLX 4-bit en la línea sucesora |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 44,2 GB); requiere `trust_remote_code` (custom_code) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B-Instruct, un transformer decoder-only denso con atención causal estándar y RoPE. Sobre esta base, Outlier-Ai aplica un "overlay" MoE con expertos cuantizados en ternario/1-bit, una técnica que busca aumentar la capacidad efectiva del modelo sin incrementar proporcionalmente el coste de inferencia en memoria, aprovechando la dispersidad de activaciones. El tag `outlier_moe` y la librería `transformers` con `custom_code` indican que la arquitectura requiere código personalizado para cargarse, no siendo compatible con implementaciones estándar sin el módulo del autor.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o SFT adicionales sobre el base. La model card califica las afirmaciones técnicas de revisiones anteriores como provisionales y señala que el artefacto puede contener adaptadores u overlays experimentales que no llegaron al producto final. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multilingüe en 15 idiomas (incluido español).
- Razonamiento y respuesta a instrucciones heredados del base Qwen2.5-14B-Instruct.
- Generación de código y matemáticas (capacidades del base, no verificadas tras el overlay).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y multi-step reasoning: no confirmado.
- Capacidades multilingües: sí, según los tags de idioma declarados.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Orientado a inferencia local en Apple Silicon y entornos on-device (tags `local-llm`, `on-device`, `apple-silicon`, `mac`).

## Casos de uso

- Investigación sobre superposición MoE: el modelo sirve como artefacto de estudio para analizar cómo un overlay MoE ternario afecta a un transformer denso de 14B, comparando activaciones y calidad frente al base sin overlay.
- Reproducibilidad de experimentos: al estar archivado con licencia Apache 2.0 y pesos safetensors, permite replicar los experimentos internos citados por el autor en entornos de investigación.
- Pruebas de cuantización extrema: útil para evaluar el impacto de pesos ternarios/1-bit en calidad de generación y latencia en hardware de consumo.
- Despliegue experimental en Apple Silicon: los tags indican compatibilidad con Mac y entornos on-device, útil para prototipos locales de generación de texto multilingüe.
- Evaluación comparativa de linajes: sirve como referencia histórica para comparar la evolución de la familia Outlier (Nano 4B, Lite 9B, Quick 26B, Core 27B) frente a este checkpoint previo.
- Docencia y análisis de arquitecturas híbridas: material para explicar técnicas de overlay, MoE disperso y cuantización de bajo bit en cursos o artículos técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las cifras citadas en revisiones anteriores provienen de experimentos internos y no de tests de release, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo ocupa 44,2 GB en safetensors, lo que sugiere que la carga completa requiere al menos ~44 GB de memoria (o menos si se aplica cuantización adicional en el momento de carga).
- GPU recomendadas: no especificadas por el autor; por tamaño del repo, una A100 80GB o H100 encajarían, pero no hay confirmación oficial.
- ¿Cabe en consumer GPU? No confirmado. Los tags apuntan a Apple Silicon y entornos on-device, pero el tamaño del repo (44,2 GB) excede la VRAM de GPUs de consumo típicas (RTX 4090 24GB, RTX 3090 24GB) sin cuantización adicional.
- Opciones de despliegue: `transformers` con `trust_remote_code` (custom_code). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Outlier-40B-V3.2 | 40B (denominación; base 14B) | no disponible | Apache 2.0 | Archivado / superseded | Overlay MoE ternario, research |
| Qwen2.5-14B-Instruct (base) | 14B | 32K (según Qwen, no confirmado aquí) | Apache 2.0 | Activo | Modelo denso estándar, sin overlay |
| Outlier Core 27B | 27B | no disponible | Apache 2.0 (según card) | Activo (tier por defecto) | Sucesor recomendado por el autor |
| Outlier Nano 4B | 4B | no disponible | Apache 2.0 (según card) | Activo (tier de entrada) | Sucesor ligero, MLX 4-bit |

## Limitaciones y advertencias

- Modelo archivado y marcado como "superseded" por el propio autor: no se recomienda para producción.
- Las afirmaciones técnicas de la card original se describen como provisionales y basadas en experimentos internos, no en tests de release.
- Ausencia de benchmarks publicados: no hay evidencia verificable de calidad frente al base Qwen2.5-14B-Instruct.
- Requiere `trust_remote_code` (custom_code), lo que implica ejecutar código del autor no auditado de forma independiente.
- Riesgo de alucinación y sesgos: no documentados específicamente; se heredan los del base y se añaden posibles efectos del overlay MoE no estudiados.
- Longitud de contexto no confirmada tras el overlay; puede diferir del base.
- Soporte de tool calling, agentes y otras capacidades avanzadas no confirmado.
- Tamaño del repo (44,2 GB) limita el despliegue en hardware de consumo sin cuantización adicional.
- Aunque la licencia es Apache 2.0, el uso comercial del artefacto no está validado por el autor y la card desaconseja su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-40B-V3.2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Sucesor tier de entrada (Nano 4B): https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Sucesor tier ligero (Lite 9B): https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Sucesor tier intermedio (Quick 26B): https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Sucesor tier por defecto (Core 27B): https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Tier multimodal (Vision 35B-A3B): https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- Modelo de razonamiento popular: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Modelo de código popular: https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Sitio del autor: https://outlier.host/
- Instalación vía Homebrew: `brew install --cask outlier-host/tap/outlier`
