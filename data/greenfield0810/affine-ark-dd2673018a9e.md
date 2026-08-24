# greenfield0810/affine-ark-dd2673018a9e

## Resumen

`greenfield0810/affine-ark-dd2673018a9e` es un archivo (mirror) de un checkpoint de un competidor del subnet 120 de Bittensor (Affine), preservado por el usuario `greenfield0810` porque los repositorios de esa leaderboard suelen volverse privados a los pocos días de competir (el 31% de los challengers ya no eran accesibles cuando se creó el archivo). El modelo original, `tammyfritz/Affine-5hmwhnfbix-tammy7`, fue subido por otra cuenta y este repo es una copia byte por byte, sin modificaciones.

El checkpoint corresponde a un modelo de la familia `qwen3_5_moe` (arquitectura MoE de Qwen 3.5) con pipeline `image-text-to-text`, es decir, multimodal (visión y texto). El repositorio contiene 35.107.181.936 parámetros en 16 shards de safetensors, con un peso total de 70.2 GB. No hay información sobre el entrenamiento, la licencia, los idiomas soportados ni el contexto. Su relevancia es principalmente archivística: preserva un checkpoint que de otro modo podría perderse para la comunidad, aunque no hay documentación técnica oficial sobre el modelo en sí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE multimodal, image-text-to-text) |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (16 shards) |

## Arquitectura y entrenamiento

No hay información pública sobre la arquitectura interna del modelo más allá del tag `qwen3_5_moe`, que indica una arquitectura de mezcla de expertos (MoE) perteneciente a la familia Qwen3.5, con capacidad multimodal de imagen a texto. No se conocen datos de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO), ni innovaciones técnicas específicas. Al ser un mirror de un checkpoint de competencia de Bittensor, el modelo puede haber sido entrenado para tareas concretas de la subnet 120 (Affine), pero no se dispone de documentación al respecto.

## Capacidades

- Generación de texto y razonamiento, según la arquitectura base Qwen3.5-MoE (no confirmado para este checkpoint concreto).
- Comprensión y generación multimodal de imagen y texto (pipeline `image-text-to-text`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio, etc.): se espera visión por el pipeline, pero no hay confirmación.

## Casos de uso

Dado que no hay información funcional específica del modelo, los casos de uso son hipotéticos y se basan únicamente en la arquitectura general:

- Preservación y auditoría de checkpoints de competencia: el modelo sirve como archivo para replicar o analizar el rendimiento de los participantes de subnet 120 (Affine) en Bittensor, ya que los repos originales suelen desaparecer.
- Evaluación comparativa de modelos MoE: se puede usar el checkpoint para reproducir resultados de la leaderboard de Affine y comparar con otros modelos de la familia Qwen3.5-MoE.
- Investigación en multimodalidad: al ser image-text-to-text, puede servir como referencia para estudiar cómo se comportan los MoE multimodales en tareas de visión-lenguaje, aunque sin datos de rendimiento.
- Desarrollo de aplicaciones de conversación multimodal: si se confirman las capacidades, podría integrarse en chatbots con entrada de imagen, pero requiere validación previa.
- Fine-tuning para tareas específicas: si se dispone de los datos de entrenamiento originales, se podría adaptar el checkpoint para dominios concretos (por ejemplo, análisis de imágenes médicas o documentos).
- Estudio de arquitecturas MoE: el checkpoint permite analizar el comportamiento de los expertos en un modelo de 35B parámetros multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no ha sido coronado en la leaderboard (reigns held: never crowned) y ha perdido las 5 duelos que disputó (5/0). No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada: 70.2 GB de pesos en precisión fp16/bf16 (16 shards). Para inferencia en fp16 se necesitan al menos 70 GB de VRAM, lo que requiere una GPU como A100 (80 GB) o H100 (80 GB), o varias GPUs en paralelo.
- Con cuantización (8-bit) se podría reducir a ~35 GB, pero no se ofrecen cuantizaciones precalculadas en el repo.
- En cuantización 4-bit (GGUF, no disponible) se podría bajar a ~17 GB, pero no se han publicado.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (2x RTX 4090 24GB con offload de CPU).
- Opciones de despliegue: vLLM, llama.cpp (si se convierten los pesos), TGI, Ollama (requiere conversión). No se ha probado la compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay modelos comparables con información pública. El checkpoint es un mirror de un modelo no documentado de la familia Qwen3.5-MoE. Se podría comparar con Qwen3-30B-A3B (MoE de la misma familia), pero no hay datos de rendimiento de este checkpoint específico.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia |
|---|---|---|---|---|
| greenfield0810/affine-ark-dd2673018a9e | MoE multimodal | 35.1B | no disponible | no disponible |
| Qwen3-30B-A3B (referencia) | MoE | 30B | 32K | Apache 2.0 |
| Qwen2.5-VL-32B | multimodal | 32B | 128K | Apache 2.0 |

## Limitaciones y advertencias

- El modelo no es del autor del repo: es un mirror sin modificaciones de un checkpoint de un competidor de Bittensor, por lo que no hay garantías de calidad, seguridad o legalidad del contenido.
- La licencia no está disponible: no se puede usar comercialmente sin aclarar los términos.
- No hay información sobre sesgos, alucinación ni limitaciones de idioma.
- El contexto de la ventana no se conoce, lo que limita su uso en tareas de contexto largo.
- El checkpoint no fue coronado en la leaderboard y perdió 5 duelos, lo que sugiere que su rendimiento no era destacado en la subnet 120.
- No hay benchmarks ni evaluaciones públicas.
- El repo puede ser retirado a petición del autor original ("Ask and it will be taken down").

## Enlaces

- Repo HuggingFace del mirror: https://huggingface.co/greenfield0810/affine-ark-dd2673018a9e
- Repo original: https://huggingface.co/tammyfritz/Affine-5hmwhnfbix-tammy7
- Archivo de procedencia (provenance): [`_affine_provenance.json`](_affine_provenance.json) (dentro del repo)
