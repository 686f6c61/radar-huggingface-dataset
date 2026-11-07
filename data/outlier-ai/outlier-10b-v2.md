# Outlier-Ai/Outlier-10B-V2

## Resumen

Outlier-10B-V2 es un artefacto de investigación publicado por Outlier-Ai sobre el modelo base Qwen/Qwen2.5-7B-Instruct, bajo la forma de un adaptador (overlay) orientado a experimentación con mezclas de expertos dispersas y cuantización ternaria/1-bit. A pesar del nombre comercial "10B", el repositorio contiene 7.615.616.512 parámetros reales según los pesos en safetensors, es decir, el tamaño efectivo corresponde al Qwen2.5-7B original más los componentes añadidos por el overlay. La model card lo marca explícitamente como **superseded** y **archival**: no es la descarga recomendada ni un modelo pensado para producción.

El modelo se distribuye con licencia Apache 2.0 y soporta 15 idiomas (inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco). Su relevancia actual es fundamentalmente histórica y de reproducibilidad: documenta una línea temprana de investigación de Outlier en torno a MoE dispersa y pesos de baja precisión para ejecución local en Apple Silicon.

La información técnica publicada es escasa: la model card no detalla composición del dataset, número de tokens de entrenamiento, receta de alineamiento ni resultados de benchmarks. Cualquier afirmación técnica de revisiones anteriores de la card debe considerarse provisional según el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) con overlay MoE disperso y cuantización ternaria/1-bit (según tags del autor) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (según fuente externa Free2AITools; no confirmado en la model card) |
| Tipos de cuantizacion | Ternaria y 1-bit (según tags); variantes MLX en la línea Outlier; no se detallan formatos concretos en este repo |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar, y le superpone un esquema de mezcla de expertos dispersa ("outlier-moe", "overlay", "sparse" según los tags). La propuesta de investigación consiste en añadir capacidad mediante expertos adicionales sobre un backbone denso ya entrenado, combinado con pesos de baja precisión (ternaria y 1-bit) para reducir el coste de almacenamiento y facilitar la ejecución en dispositivos locales, en particular Apple Silicon y Mac.

No se han publicado en la información disponible datos sobre volumen de tokens de entrenamiento, composición del corpus, uso de RLHF/DPO ni detalles del proceso de destilación o calibración de la cuantización. La model card indica que el repositorio precede a la línea v1.8 de Outlier y que puede contener adaptadores, overlays o variantes de cuantización experimentales que no llegaron al producto final. No hay innovaciones documentadas adicionales (decodificación especulativa, atención lineal, etc.) más allá de la propia propuesta MoE dispersa con pesos de baja precisión.

## Capacidades

- Generación de texto conversacional, heredada del backbone Qwen2.5-7B-Instruct.
- Razonamiento y conocimiento general en el rango esperable para un modelo de ~7B parámetros densos equivalentes.
- Capacidades multilingües en los 15 idiomas declarados, con especial cobertura de inglés y chino por el origen del modelo base.
- Soporte de tool calling y function calling heredado de Qwen2.5-7B-Instruct (no verificado específicamente para este overlay).
- Ejecución local en dispositivos con recursos limitados, gracias a la orientación a cuantización ternaria/1-bit y a los tags "on-device", "apple-silicon" y "mac".
- Capacidad de investigación: sirve como referencia reproducible para estudiar overlays MoE y cuantización extrema sobre un modelo denso.
- No se documentan capacidades de visión, audio, thinking mode explícito ni agentes multi-paso específicos de este artefacto.

## Casos de uso

- Reproducción de experimentos académicos: el repositorio permite reconstruir los resultados de la línea temprana de Outlier en MoE dispersa y cuantización ternaria, útil para investigadores que estudien técnicas de compresión sobre Qwen2.5.
- Estudio de overlays MoE sobre modelos densos: sirve como caso práctico para analizar cómo se comporta un adaptador de expertos añadido a un backbone de 7B ya instruido.
- Pruebas de cuantización extrema en local: permite evaluar la degradación de calidad al pasar a pesos ternarios/1-bit en un modelo conversacional multilingüe.
- Desarrollo y validación de pipelines de inferencia con transformers y safetensors: al ser un repo pequeño (15,2 GB) y con estructura estándar, es cómodo para probar cargas, sharding y compatibilidad con TGI.
- Referencia comparativa en estudios de eficiencia: útil para contrastar consumo de memoria y latencia frente al Qwen2.5-7B-Instruct original en el mismo hardware.
- Docencia y formación técnica: ejemplo real de model card con avisos de obsolescencia, tags de archivado y relación adapter/base_model, útil para enseñar buenas prácticas de documentación de artefactos de investigación.
- No se recomienda su uso en producción, atención al cliente ni generación de código crítica, dado el estado archival y la ausencia de benchmarks verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (bf16/fp16): en torno a 15-16 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPU con 24 GB o más para contexto largo.
- VRAM estimada con cuantización de 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM estimada con cuantización de 4 bits: aproximadamente 4-5 GB de pesos.
- Variantes ternarias/1-bit (según la propuesta del autor): el objetivo declarado es la ejecución en dispositivos con memoria unificada limitada, como Mac con Apple Silicon; no se publican cifras concretas de consumo.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, justo para contexto corto). Para cuantización 4-bit: RTX 4090, RTX 3090, RTX 4080.
- Cabe en GPU de consumo con cuantización de 4 bits o inferior; en fp16 no cabe en GPUs de 16 GB sin offloading.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag "text-generation-inference" y "endpoints_compatible"), y potencialmente llama.cpp/Ollama si se generan GGUF, aunque no se distribuyen en este repo. La línea Outlier usa variantes MLX para Mac en otros repositorios.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Outlier-10B-V2 | 7,62 B (overlay MoE) | 32.768 (fuente externa) | Apache 2.0 | Archivado / superseded | Artefacto de investigación, sin benchmarks publicados |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 | Apache 2.0 | Activo | Modelo base; benchmarks públicos amplios |
| Outlier Nano 4B (MLX-4bit) | ~4 B | no disponible | Apache 2.0 (según repo) | Activo (tier actual) | Tier de entrada actual de Outlier |
| Outlier Core 27B (MLX-4bit) | ~27 B | no disponible | Apache 2.0 (según repo) | Activo (tier por defecto) | Tier por defecto actual de Outlier |

## Limitaciones y advertencias

- Modelo marcado como **superseded** y **archival** por el propio autor: no es la descarga recomendada y no debe usarse como base de producción.
- Ausencia total de benchmarks publicados: no hay evidencia verificable de calidad frente al Qwen2.5-7B-Instruct original ni frente a otros modelos de tamaño similar.
- El nombre "10B" no coincide con los parámetros reales (7,62 B); puede inducir a error en comparativas.
- Riesgo de alucinación y sesgos heredados del backbone Qwen2.5-7B-Instruct, sin documentación específica de mitigaciones en este overlay.
- Posible degradación adicional por la cuantización ternaria/1-bit y por el overlay MoE experimental; el autor advierte que las afirmaciones técnicas de revisiones previas son provisionales.
- Licencia Apache 2.0 permite uso comercial, pero el estado archival y la falta de garantías desaconsejan cualquier despliegue en producción.
- La longitud de contexto de 32.768 tokens proviene de una fuente externa (Free2AITools) y no está confirmada en la model card del repositorio.
- Soporte de tool calling y function calling no verificado específicamente para este artefacto.
- El repositorio tiene muy baja tracción (21 descargas, 1 like), lo que reduce la probabilidad de que se hayan reportado problemas o correcciones por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-10B-V2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Sitio del autor (tiers actuales): https://outlier.host/
- Outlier Nano 4B (tier actual de entrada): https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Core 27B (tier actual por defecto): https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Vision 35B-A3B (tier multimodal actual): https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX-4bit, línea Outlier): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (MLX-4bit, línea Outlier): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Ficha externa con datos de contexto: https://free2aitools.com/model/outlier-ai/outlier-10b-v2
- Plataforma del autor (freelance/RLHF): https://outlier.ai/
