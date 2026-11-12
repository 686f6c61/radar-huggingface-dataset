# joonyeongs/cosmos3-edge-policy-droid-privileged-phases-full-ft-500

## Resumen

Cosmos3-Edge-Policy-DROID-privileged-phases-full-ft-500 es un ajuste fino (fine-tuning) completo del modelo de política robótica nvidia/Cosmos3-Edge-Policy-DROID, desarrollado por el usuario joonyeongs. El modelo parte del checkpoint base de NVIDIA (revisión 0110e64ca982589f1a3d856cbdd7d465dccb79bc) y se entrena sobre un subconjunto específico del dataset joonyeongs/cosmos3-edge-harness-privileged-phases-150, compuesto por 25 episodios exitosos de RoboLab para cada una de seis tareas, restringiendo los clips de entrenamiento a las fases de código privilegiado.

El objetivo es generar chunks de acciones (32 pasos) para control robótico en el dominio DROID, condicionados a observaciones visuales y texto. El ajuste afecta a todos los pesos del generador (atención, MLP, normas, proyecciones vae2llm/llm2vae, time embedder y embeddings de acciones y modalidad), mientras que la torre de comprensión permanece congelada con las K/V de texto cacheadas.

Con 3.859.003.312 parámetros totales y un tamaño de repositorio de 9,2 GB, el modelo se entrenó durante 500 pasos con 2 GPUs A100-80GB en 3,3 horas. Es relevante para investigadores que trabajan en políticas robóticas de tipo vision-language-action (VLA) y quieran reproducir o extender recetas de fine-tuning sobre el ecosistema Cosmos3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (transformer generador + torre de comprensión), policy model vision-language-action |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16/safetensors; requiere VAE Wan2.2 externo) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (diffusion_pytorch_model-00001-of-00002 y 00002-of-00002) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cosmos3-Edge-Policy, un policy model de tipo vision-language-action que combina una torre de comprensión (entendimiento multimodal, congelada en este ajuste) y un generador de difusión que produce chunks de acciones. El generador incluye atención, MLP, normas, proyecciones vae2llm y llm2vae, time embedder, y embeddings específicos para los límites de acción DROID y la modalidad. La inferencia descarga además el VAE Wan2.2 (Wan-AI/Wan2.2-TI2V-5B).

El entrenamiento consistió en un full fine-tuning del generador durante 500 pasos (checkpoint iter_000000500), lo que equivale a aproximadamente 0,85 pasadas sobre los 37.516 inicios elegibles. Se usaron 4 tareas (Red Items, Cartons, Bottles, Stack); Canned Food y Toy tenían rangos vacíos. Cada clip contiene 32 frames/acciones futuras. Hiperparámetros: batch global 64 (2 GPUs × 32 × grad-accum 1), LR 2e-5 con warmup lineal de 25 pasos y decaimiento lineal a 0, optimizador FusedAdam, precisión BF16, FSDP de 2 vías, activation checkpointing selectivo y torch.compile. El código está en la rama robolab-droid-train-edge-privileged-phases del repositorio joonyeongs/cosmos-framework (commit 20ccacf).

## Capacidades

- Generación de chunks de acciones de 32 pasos de posición articular para control robótico, condicionados a observaciones visuales y prompt de texto.
- Acondicionamiento a 15 fps y dominio droid_lerobot (metadatos heredados del modelo base).
- Soporte de evaluación mediante el servidor RoboLabPolicyService (action_policy_server_robolab).
- Formato de prompt JSON opcional (--format-prompt-as-json True) y guiado por intervalo (--guidance-interval 960 1001).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni visión general más allá del uso como política robótica.
- No se documenta modo thinking ni procesamiento de audio.

## Casos de uso

- Evaluación de políticas robóticas en RoboLab: el modelo se sirve con el script action_policy_server_robolab y se consulta sobre frames para obtener chunks de 32 acciones; es adecuado porque el checkpoint conserva el layout exacto del base y los metadatos de política (checkpoint.json).
- Reproducción de recetas de fine-tuning VLA: investigadores pueden reutilizar la configuración robolab_droid_edge_full.toml y la guía docs/robolab_droid_edge_privileged_phases.md para replicar el entrenamiento en 2×A100-80GB en unas 3,3 horas.
- Estudio de fases privilegiadas en datos de demostración: el ajuste se centra en intervalos de código privilegiado extendidos 10 frames y fusionados, útil para analizar cómo afecta la selección de segmentos al aprendizaje de la política.
- Manipulación de objetos en tareas específicas (Red Items, Cartons, Bottles, Stack): el modelo predice posiciones articulares para tareas de recogida y clasificación en contenedores, con MAE de 0,0843 rad de media sobre frames del dataset de entrenamiento.
- Base para nuevos fine-tunings sobre DROID: al diferir del base solo en los dos safetensors del transformer, sirve como punto de partida para experimentos adicionales manteniendo la torre de comprensión congelada.
- Integración en pipelines de investigación con FSDP y torch.compile: la receta documentada permite escalar el entrenamiento a más GPUs ajustando el batch global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona únicamente una comprobación de exportación (no una evaluación de política) con error absoluto medio (MAE, rad) entre chunks predichos y acciones demostradas:

| Episodio | Frame | Tarea | MAE |
|---|---|---|---|
| 0 | 0 | Put the canned food in the grey bin | 0,1265 |
| 0 | 154 | Put the canned food in the grey bin | 0,0389 |
| 25 | 0 | Put the lizard away in the bin | 0,1257 |
| 25 | 139 | Put the lizard away in the bin | 0,0383 |
| 50 | 0 | Put all the red things in the grey bin | 0,0929 |
| 50 | 326 | Put all the red things in the grey bin | 0,0966 |
| 75 | 0 | Put the cartons that can be recycled in the vertical crate | 0,0855 |
| 75 | 442 | Put the cartons that can be recycled in the vertical crate | 0,0698 |
| | | **Media** | **0,0843** |

El autor indica explícitamente que el éxito en bucle cerrado de RoboLab no se ha evaluado todavía.

## Requisitos de hardware

- Entrenamiento documentado: 2× A100-80GB, 3,3 horas, BF16, FSDP de 2 vías, activation checkpointing selectivo y torch.compile.
- VRAM estimada para inferencia: no disponible en la información proporcionada; el tamaño de pesos (3,86B parámetros en BF16) implica aproximadamente 7,7 GB solo para pesos, más el VAE Wan2.2 externo.
- GPU recomendadas: no disponible; el entrenamiento usó A100-80GB. No se documenta compatibilidad con RTX 4090 u otras consumer GPU.
- Despliegue: servidor RoboLab mediante python -m cosmos_framework.scripts.action_policy_server_robolab con --checkpoint-path, --port, --format-prompt-as-json y --guidance-interval.
- No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joonyeongs/cosmos3-edge-policy-droid-privileged-phases-full-ft-500 | 3.859.003.312 | no disponible | OpenMDW-1.1 | Hugging Face (0 descargas) | Fine-tuning de 500 pasos sobre 37.516 inicios elegibles |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible | no disponible | OpenMDW-1.1 | Hugging Face (NVIDIA) | Checkpoint base; misma arquitectura y metadatos |
| Otros modelos de política robótica VLA | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- El éxito en bucle cerrado de RoboLab no se ha evaluado; la única métrica publicada es MAE sobre frames del dataset de entrenamiento, que no mide éxito de tarea.
- El ajuste se limita a cuatro tareas (Red Items, Cartons, Bottles, Stack); Canned Food y Toy no aportaron inicios elegibles, por lo que el modelo puede no generalizar a esas tareas.
- Solo 500 pasos y ~0,85 pasadas sobre los datos: riesgo de sobreajuste o infraentrenamiento según la tarea.
- La torre de comprensión está congelada con K/V de texto cacheadas, lo que limita la adaptación del entendimiento multimodal.
- Licencia OpenMDW-1.1 heredada del base: es necesario revisar sus términos para uso comercial.
- No se documentan sesgos, idiomas soportados ni comportamiento fuera del dominio DROID/RoboLab.
- Riesgo de alucinación no evaluado en el contexto de políticas robóticas; las predicciones pueden ser no finitas en entradas fuera de distribución (el autor solo verificó que las salidas fueron finitas en frames del dataset).
- Requiere descargar el VAE Wan2.2 (Wan-AI/Wan2.2-TI2V-5B) en inferencia, lo que añade dependencias externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-privileged-phases-full-ft-500
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-harness-privileged-phases-150
- Código (rama de entrenamiento): https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- VAE Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
