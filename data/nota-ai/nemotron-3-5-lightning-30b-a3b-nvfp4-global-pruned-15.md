# nota-ai/Nemotron-3.5-Lightning-30B-A3B-NVFP4-Global-Pruned-15

## Resumen

Nemotron-3.5-Lightning-30B-A3B-NVFP4-Global-Pruned-15 es una variante podada del modelo NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16, desarrollada por Nota AI. Sobre la cuantización NVFP4 del checkpoint base, Nota AI aplica una técnica propietaria de podado global de expertos: en lugar de eliminar el mismo número de expertos en cada capa (podado uniforme), mide la importancia de cada experto a lo largo de toda la red y conserva solo los más relevantes por capa. El resultado es una arquitectura con conteo variable de expertos por capa (96/104/108/116), que reduce un 15,6 % el total de expertos enrutados y libera un 36 % más de caché KV en una GPU de 32 GB, manteniendo intacta la ventana de contexto de 1 millón de tokens.

El modelo mantiene la arquitectura híbrida original: 23 capas MoE, 23 capas Mamba-2, 6 capas de atención, un experto compartido y un bloque MTP (multi-token prediction) sin podar. La cuantización se hereda del checkpoint base: W4A16_NVFP4 con group_size=16 para los expertos (pesos de 4 bits, activaciones en bf16) y FP8 para un pequeño conjunto de proyecciones Mamba, en formato NVIDIA ModelOpt. Está pensado para despliegue en una sola GPU de 32 GB, con soporte para razonamiento, código, agentes y tool calling, y cubre seis idiomas: inglés, español, francés, alemán, italiano y japonés.

La relevancia de este modelo radica en que el podado global de expertos permite aumentar la concurrencia y la capacidad de caché KV sin sacrificar precisión de forma significativa, algo crítico para servir aplicaciones con contexto largo en hardware de gama alta de consumo. Sin embargo, requiere un parche específico para vLLM y aún no se han publicado benchmarks de tareas para este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + MoE + atención selectiva (Nemotron-H) |
| Parametros totales | 30B (15,5B en pesos cuantizados safetensors) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (W4A16, group_size=16) + FP8 en proyecciones Mamba |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (ModelOpt NVFP4) |

## Arquitectura y entrenamiento

El modelo base, NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, es un LLM híbrido que combina capas Mamba-2 (estado espacial), capas de atención selectiva y capas MoE con 128 expertos enrutados por capa y top-6. El post-entrenamiento tiene una fecha de corte de mayo de 2026 e incluye datos de pre-entrenamiento y post-entrenamiento de NVIDIA (nemotron-pre-training-datasets y nemotron-post-training-v3). Sobre este checkpoint cuantizado a NVFP4, Nota AI aplica un podado global de expertos: su técnica propietaria de estimación de importancia compara expertos a través de toda la red y determina un número distinto de expertos retenidos por capa, registrado en `config.json` como `n_routed_experts_per_layer`. El resultado es una reducción de 2.944 a 2.484 expertos enrutados (−15,6 %), con conteos por capa de 96, 104, 108 y 116, todos múltiplos de 4 para permitir paralelismo de tensor/expertos de tamaño 2 y 4. Solo se podan los expertos MoE; las capas de atención, Mamba-2, el experto compartido y el bloque MTP permanecen intactos, por lo que la ventana de contexto de 1M tokens no cambia. La cuantización se hereda sin modificaciones del checkpoint base.

## Capacidades

- Generación de texto y razonamiento conversacional en seis idiomas (en, es, fr, de, it, ja), con énfasis en inglés y lenguajes de programación.
- Razonamiento multi-step y modo "thinking" (el modelo base soporta `--reasoning-parser` en vLLM, aunque no se ha re-validado en esta variante).
- Generación de código y soporte de tool calling / function calling (el modelo base incluye `--tool-call-parser`; no re-validado aquí).
- Capacidades de agente y sub-agente, diseñado para flujos de trabajo autónomos y sistemas RAG.
- Ventana de contexto de 1.000.000 tokens, útil para documentos largos, historiales extensos y razonamiento sobre grandes corpus.
- Inferencia eficiente en una sola GPU de 32 GB gracias al podado de expertos y la cuantización NVFP4, con mayor capacidad de caché KV que el checkpoint base.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 1M tokens) gracias a su ventana ampliada y a la mayor capacidad de caché KV, lo que permite mantener historiales extensos de interacción sin perder el hilo.
- Generación de código en producción: con soporte de tool calling y razonamiento, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, y ejecutar agentes que interactúan con APIs y repositorios.
- Sistemas RAG sobre documentación técnica extensa: la ventana de 1M tokens permite indexar y consultar manuales, normativas o bases de conocimiento completas sin necesidad de fragmentar el contexto.
- Agentes autónomos y sub-agentes: su arquitectura híbrida y el soporte de razonamiento multi-step lo hacen adecuado para orquestar tareas complejas que requieren planificación, llamadas a herramientas y verificación de resultados.
- Asistente multilingüe para soporte técnico: cubre seis idiomas (español, francés, alemán, italiano, japonés e inglés), lo que permite desplegar un único modelo para atención en varios mercados.
- Servicio de inferencia con alta concurrencia en una GPU de 32 GB: el podado global libera un 36 % más de caché KV, permitiendo atender más peticiones simultáneas con contexto largo (2,85× frente a 2,10× del base en presupuesto de 32 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No task benchmarks have been run on this checkpoint yet". Los únicos datos de rendimiento disponibles son mediciones de memoria y concurrencia con vLLM 0.27.1, que se detallan en la sección de requisitos de hardware.

## Requisitos de hardware

- VRAM estimada: el modelo cabe en una GPU de 32 GB (medido con emulación de presupuesto de memoria en B200 con 28,6 GiB cap). Los pesos ocupan 17,62 GiB, dejando 8,72 GiB para caché KV con contexto completo de 1M tokens.
- GPU recomendadas: RTX 5090, A100 40 GB, A6000, o cualquier GPU con 32 GB o más. También puede ejecutarse en GPUs de 30 GB con `--max-model-len 32768`, alcanzando 71,9 peticiones concurrentes (frente a 55,9 del base).
- Opciones de despliegue: vLLM (requiere parche para el conteo variable de expertos por capa), transformers con el parche incluido en el repositorio, y compatible con endpoints NVIDIA NIM.
- Latencia y throughput: el podado reduce memoria, no FLOPs; el top-6 routing sigue activando seis expertos por token, por lo que el throughput por petición es esencialmente el mismo que el del checkpoint base. La ganancia está en la concurrencia y el footprint de memoria.
- Nota: `--kv-cache-dtype fp8` no amplía el pool de KV en este modelo, ya que vLLM alinea el tamaño de página de atención al de la página Mamba (4176 tokens), por lo que el lado Mamba fija el mínimo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| nota-ai/Nemotron-3.5-Lightning-30B-A3B-NVFP4-Global-Pruned-15 | 30B totales / 3B activos | 1M tokens | NVFP4 + FP8 | openmdw-1.1 | Podado global de expertos, 2.484 expertos enrutados |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 30B totales / 3B activos | 1M tokens | NVFP4 + FP8 | openmdw-1.1 | Checkpoint base cuantizado, 2.944 expertos enrutados |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B totales / 3B activos | 1M tokens | BF16 | openmdw-1.1 | Checkpoint original sin cuantizar ni podar |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos MoE comparables (como Qwen3-30B-A3B o DeepSeek-V3-Lite) en la información proporcionada. La diferencia principal entre la variante podada y el base NVFP4 es la reducción de 15,6 % de expertos enrutados, que libera 2,30 GiB de pesos y aumenta la caché KV disponible en un 36 %, manteniendo el mismo contexto y la misma cuantización.

## Limitaciones y advertencias

- Requiere el parche incluido en el repositorio para vLLM (sustituir `configuration_nemotron_h.py`); sin él, la carga falla con un error de dimensiones de pesos. Hay que re-aplicarlo tras cada actualización de transformers.
- La importancia de los expertos se estimó con datos de calibración en inglés que cubren instrucciones, razonamiento, agentes y código. Otros idiomas pueden verse más afectados por el podado de lo que sugieren los resultados generales.
- El bloque MTP no fue evaluado y se mantiene con 128 expertos sin podar, lo que puede suponer una ligera ineficiencia de memoria.
- No se han ejecutado benchmarks de tareas en este checkpoint, por lo que no hay datos objetivos de calidad (MMLU, HumanEval, GSM8K, etc.) para esta variante concreta.
- El podado reduce memoria, no FLOPs: el throughput por petición no mejora, solo la concurrencia y el footprint.
- La licencia openmdw-1.1 tiene condiciones específicas; conviene revisar los términos de uso comercial antes de desplegar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nota-ai/Nemotron-3.5-Lightning-30B-A3B-NVFP4-Global-Pruned-15
- Modelo base cuantizado: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Cookbook de uso en GitHub: https://github.com/NVIDIA-NeMo/Nemotron/tree/main/usage-cookbook/Nemotron-3.5-Lightning
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Documentación de API NIM: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-5-lightning-30b-a3b
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
