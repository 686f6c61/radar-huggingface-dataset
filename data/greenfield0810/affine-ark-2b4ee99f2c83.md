# greenfield0810/affine-ark-2b4ee99f2c83

## Resumen

`affine-ark-2b4ee99f2c83` es un archivo (mirror) byte a byte de un checkpoint de competidor de la subnet 120 de Bittensor, conocida como Affine. El repositorio fue publicado por el usuario `greenfield0810` con el objetivo de preservar pesos que, según la model card, son retirados de acceso público con frecuencia (el 31 % de los challengers que han duellado ya no son accesibles). El modelo original pertenece a la cuenta `ammazon` bajo el nombre `Affine-5dvqtektxx-sbs-v7` y se archiva en su revisión `b503010db256`.

Aunque el repositorio se etiqueta con la arquitectura `qwen3_5_moe` y el pipeline `image-text-to-text`, no se dispone de documentación técnica oficial del modelo más allá de la model card de archivo. Se trata de un checkpoint multimodal con 35,1 mil millones de parámetros totales, almacenado en 16 shards de safetensors que suman 70,2 GB. Su licencia, idiomas soportados y detalle de entrenamiento no están disponibles en la información pública.

Este archivo es relevante para la comunidad de Bittensor y para investigadores que estudian la evolución de los modelos en subnets competitivas, ya que documenta la procedencia del checkpoint (incluyendo alias, hotkeys y resultados de duels) en el fichero `_affine_provenance.json`. No es un modelo diseñado para uso directo en producción ni se recomienda su despliegue sin una evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (Mixture of Experts, según tags) |
| Parámetros totales | 35.107.181.936 (35,1 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (16 shards, 70,2 GB) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna más allá de la etiqueta `qwen3_5_moe`, que sugiere una arquitectura de Mixture of Experts de la familia Qwen 3.5. El pipeline `image-text-to-text` indica que el modelo es multimodal, capaz de procesar entradas de imagen y texto. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens, el método de alineación (RLHF/DPO/ORPO) ni innovaciones técnicas específicas. Tampoco se documenta si el checkpoint ha sido sometido a procesos de cuantización o destilación.

## Capacidades

- No se han documentado capacidades concretas en la model card.
- El pipeline `image-text-to-text` sugiere entrada multimodal (imagen y texto), pero no se especifican tareas soportadas (generación de imagen, OCR, VQA, etc.).
- No se indica soporte de tool calling, function calling, agentes ni multi-step reasoning.
- No hay información sobre idiomas soportados.
- No se conoce si dispone de modo de razonamiento explícito (thinking mode).

## Casos de uso

- **Investigación sobre evolución de modelos en Bittensor**: el checkpoint sirve para estudiar cómo se comportan los modelos de la subnet 120 en duelos y cómo cambian las arquitecturas de MoE en entornos competitivos. Se puede comparar con otros archivos del grupo `fddb75513b13`.
- **Auditoría de procedencia**: el fichero `_affine_provenance.json` permite rastrear alias, hotkeys y resultados de duelos, útil para análisis de integridad y trazabilidad de modelos en la red.
- **Evaluación de robustez multimodal**: si se dispone de infraestructura, se puede evaluar el comportamiento en tareas de visión-lenguaje (VQA, captioning) aunque no haya benchmarks oficiales.
- **Pruebas de compatibilidad con librerías**: al ser un checkpoint en formato safetensors con librería transformers, se puede usar para validar integración con pipelines de inferencia estándar.
- **Documentación de estado del arte en subnets**: el archivo permite comparar la calidad de los modelos que compiten en la subnet 120 en un momento concreto del tiempo.
- **Estudio de duplicidad y versionado**: la model card indica que hay 8 subidas casi idénticas en el grupo `fddb75513b13`, útil para investigar la replicación de pesos en la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Con 35,1 B de parámetros en precisión FP16, se necesitarían al menos 70 GB de VRAM para carga completa, lo que supera las GPU de consumo habituales (RTX 4090 con 24 GB no sería suficiente).
- **GPU recomendadas**: sin datos oficiales; para una inferencia en FP16 se requeriría una A100 80 GB, H100 80 GB o similar. Con cuantización (GGUF o AWQ) podría caber en GPUs de 24-48 GB, pero no se ha publicado ninguna versión cuantizada.
- **Opciones de despliegue**: dado que es un archivo de pesos en safetensors, se podría usar con `transformers`, `vLLM` o `TGI` si se dispone de hardware adecuado. No se ha probado con `llama.cpp` ni `Ollama`.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (MoE multimodal). No se han publicado benchmarks, parámetros activos ni contexto. Se puede indicar que la arquitectura `qwen3_5_moe` es una variante de la familia Qwen 3.5, pero no hay datos de la versión exacta ni de su configuración de expertos.

## Limitaciones y advertencias

- **No es un modelo del autor del repositorio**: se trata de un archivo de un checkpoint de un competidor de la subnet 120 de Bittensor, no de un modelo desarrollado por `greenfield0810`.
- **Licencia desconocida**: no se especifica la licencia del checkpoint original. No se recomienda su uso comercial sin verificar los términos de la cuenta `ammazon`.
- **Sesgos y alucinación**: no hay evaluación de sesgos ni de riesgo de alucinación. Al ser un modelo de la familia Qwen, podría heredar sesgos de los datos de entrenamiento de dicha familia, pero no se puede confirmar.
- **Idiomas**: no se especifican los idiomas soportados. No se puede asumir un soporte multilingüe.
- **Contexto**: se desconoce la longitud de contexto. Los modelos de la familia Qwen suelen soportar contextos largos (128K), pero no se puede confirmar en este checkpoint.
- **Uso en producción**: al no haber benchmarks ni documentación técnica, no se recomienda su despliegue en entornos productivos sin una evaluación exhaustiva.
- **Riesgo de desaparición**: el repositorio original puede ser retirado; el archivo es una copia de preservación, pero el mantenimiento del mismo no está garantizado.

## Enlaces

- Repositorio HuggingFace del archivo: [greenfield0810/affine-ark-2b4ee99f2c43](https://huggingface.co/greenfield0810/affine-ark-2b4ee99f2c43)
- Repositorio original (posiblemente no accesible): [ammazon/Affine-5dvqtektxx-sbs-v7](https://huggingface.co/ammazon/Affine-5dvqtektxx-sbs-v7)
- Documentación de AFFiNE Self-host AI: https://docs.affine.pro/self-host-affine/administer/ai
- Sitio de Affine (empresa de IA, no relacionada con el modelo): https://affine.ai/
- Guía para configurar modelos custom en AFFiNE (no aplicable a este checkpoint): https://github.com/toeverything/AFFiNE/issues/13480
- Guía de configuración de IA en self-hosted AFFiNE (no aplicable): https://torchtree.com/en/post/affine-selfhost-ai-configuration/
- Guía para AI Copilot con modelos custom (no aplicable): https://sneekes.app/posts/getting_affine_ai_copilot_working_with_custom_models_and_ollama/

> Nota: los resultados de búsqueda web corresponden a la aplicación AFFiNE y a la empresa Affine, no al checkpoint en cuestión. No hay documentación técnica del modelo más allá de la model card de archivo.
