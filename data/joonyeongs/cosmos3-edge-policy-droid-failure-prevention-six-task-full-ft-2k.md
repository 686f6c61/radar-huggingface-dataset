# joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-full-ft-2k

## Resumen

Cosmos3-Edge-Policy-DROID (six-task failure-prevention) es un ajuste fino completo del generador del modelo de política robótica `nvidia/Cosmos3-Edge-Policy-DROID` de NVIDIA, publicado por el usuario `joonyeongs`. El modelo parte del checkpoint base (revisión `0110e64ca982589f1a3d856cbdd7d465dccb79bc`) y se entrena sobre seis de las ocho tareas del conjunto `joonyeongs/cosmos3-edge-failure-prevention-200`, orientado a la prevención de fallos en manipulación robótica dentro del entorno RoboLab con el dominio `droid_lerobot`.

La arquitectura subyacente es la de Cosmos3-Edge: un modelo generativo de difusión con torre de entendimiento congelada y un generador que consume texto (K/V cacheadas) y produce chunks de acciones. El ajuste fino entrena únicamente los pesos del generador (atención, MLP, normas, `vae2llm`, `llm2vae`, time embedder y las fronteras de acción y embedding de modalidad DROID), dejando congelada la torre de comprensión. El checkpoint resultante tiene 3.859.003.312 parámetros y un repositorio de 9,2 GB.

El modelo es relevante porque demuestra un flujo de ajuste fino de política robótica con recursos modestos (2 GPU A100-80GB, 13,3 horas, 2.000 pasos) sobre un modelo base de NVIDIA, y porque el autor publica tanto el código de entrenamiento como la receta exacta. Sin embargo, no se ha evaluado el éxito en bucle cerrado en RoboLab, por lo que su utilidad práctica en producción está aún por validar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo generativo de difusión (Cosmos3-Edge) con torre de entendimiento congelada y generador entrenable; produce chunks de acciones |
| Parámetros totales | 3.859.003.312 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente BF16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (`transformer/diffusion_pytorch_model-0000{1,2}-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cosmos3-Edge, un sistema de difusión para generación de acciones robóticas. La torre de entendimiento permanece congelada y sus K/V de texto se cachean; el generador (atención, MLP, normas, `vae2llm`, `llm2vae`, time embedder, fronteras de acción DROID y embedding de modalidad) se ajusta por completo. La inferencia requiere descargar el VAE de Wan2.2 (`Wan-AI/Wan2.2-TI2V-5B`), igual que el modelo base. El chunk de acción es de 32 pasos, con condicionamiento a 15 fps y dominio `droid_lerobot`.

El entrenamiento utilizó 6 tareas × 25 episodios (150 episodios, 92.009 inicios elegibles), con 32 frames/acciones futuras por inicio. Se ejecutaron 2.000 pasos (checkpoint `iter_000002000`), aproximadamente 1,39 pasadas sobre los inicios elegibles, con batch global 64 (2 GPU × 32), LR 2e-5 con warmup lineal de 100 pasos y decaimiento lineal a 0, FusedAdam, precisión BF16, FSDP a 2 vías, checkpointing selectivo de activaciones y `torch.compile`. El entrenamiento se realizó en 2× A100-80GB durante 13,3 horas. Las tareas `ToolsPickingDrillTask` y `SpoonsInPotTask` se excluyeron asignando rangos de inicio vacíos.

## Capacidades

- Generación de chunks de acciones robóticas de 32 pasos para manipulación en el dominio `droid_lerobot`.
- Condicionamiento por instrucciones de texto en lenguaje natural (p. ej., "Put the canned food in the grey bin").
- Prevención de fallos: el ajuste se orienta a demostraciones dirigidas a evitar fallos en seis tareas concretas (Toy, Canned Food, Red Items, Cartons, Bottles y Stack).
- Servido como política mediante `cosmos_framework.scripts.action_policy_server_robolab` con formato de prompt JSON y `guidance-interval 960 1001`.
- Integración con `RobolabPolicyService` para evaluación en el servidor de RoboLab.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación de políticas robóticas en RoboLab: el modelo se sirve con el script `action_policy_server_robolab` y se consulta con `RobolabPolicyService` para comparar chunks de acción predichos con acciones demostradas, como ya se hizo en la comprobación de exportación.
- Investigación en prevención de fallos: las seis tareas seleccionadas permiten estudiar cómo el ajuste fino con demostraciones dirigidas a fallos afecta a la política generada, comparándolo con el modelo base de 8 tareas.
- Replicación de recetas de ajuste fino: el autor publica la rama `robolab-droid-train-edge-privileged-phases` y la receta `examples/toml/sft_config/robolab_droid_edge_full.toml`, lo que permite reproducir el entrenamiento en 2× A100-80GB.
- Punto de partida para ajustes posteriores: al conservar el layout exacto del checkpoint base y solo modificar los safetensors del transformer, puede usarse como inicialización para nuevos conjuntos de tareas con el mismo pipeline.
- Análisis de error de acciones: la comparación de MAE por episodio y frame (media 0,1162 rad) sirve para diagnosticar desviaciones de la política en tareas específicas.
- Docencia y demostraciones de robótica con modelos generativos: el bajo coste de entrenamiento (13,3 h en 2 GPU) lo hace adecuado para entornos académicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito en tareas en la información disponible. El autor incluye una comprobación de exportación (no una evaluación de política) con MAE de chunks de acción frente a acciones demostradas:

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the canned food in the grey bin | 0,0751 |
| 0 | 154 | Put the canned food in the grey bin | 0,0860 |
| 25 | 0 | Put the lizard away in the bin | 0,1030 |
| 25 | 139 | Put the lizard away in the bin | 0,0338 |
| 50 | 0 | Put all the red things in the grey bin | 0,1885 |
| 50 | 326 | Put all the red things in the grey bin | 0,1096 |
| 75 | 0 | Put the cartons that can be recycled in the vertical crate | 0,2109 |
| 75 | 442 | Put the cartons that can be recycled in the vertical crate | 0,1223 |
| | | **Media** | **0,1162** |

El éxito en bucle cerrado en RoboLab no se ha evaluado.

## Requisitos de hardware

- Entrenamiento: 2× A100-80GB, 13,3 horas, BF16 con FSDP a 2 vías y checkpointing selectivo de activaciones.
- Inferencia: no se especifica VRAM mínima; el repositorio ocupa 9,2 GB en safetensors, por lo que se requiere al menos esa cantidad más el VAE de Wan2.2 y overhead de ejecución.
- GPU recomendadas: A100-80GB para entrenamiento; para inferencia se desconoce si cabe en GPU de consumo (no disponible).
- Despliegue: servidor propio `cosmos_framework.scripts.action_policy_server_robolab` en el puerto 8000; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (six-task failure-prevention) | 3.859.003.312 | no disponible | 6 tareas RoboLab | OpenMDW-1.1 | Hugging Face |
| `nvidia/Cosmos3-Edge-Policy-DROID` (base) | no disponible | no disponible | 8 tareas (referencia) | OpenMDW-1.1 | Hugging Face |
| Otras variantes de `joonyeongs` (8-task failure-prevention) | no disponible | no disponible | 8 tareas | OpenMDW-1.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado en RoboLab; la comprobación de exportación mide MAE de acciones, no tasa de éxito.
- El ajuste cubre solo seis tareas; `ToolsPickingDrillTask` y `SpoonsInPotTask` quedan fuera por diseño.
- La torre de entendimiento está congelada, lo que limita la adaptación a vocabulario o instrucciones fuera del dominio DROID.
- Solo se modifican los dos safetensors del transformer; el resto del repositorio es idéntico al base, lo que implica dependencia del VAE externo de Wan2.2 en inferencia.
- Licencia OpenMDW-1.1 heredada: es necesario revisar sus términos para uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; el condicionamiento es por instrucciones en inglés en las tareas de RoboLab.
- Sin descargas ni likes en el momento de la ficha; modelo de investigación sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-failure-prevention-six-task-full-ft-2k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-failure-prevention-200
- Dataset de comprobación: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-harness-privileged-phases-150
- Código: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia: https://openmdw.ai/license/1-1/
- VAE externo: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
