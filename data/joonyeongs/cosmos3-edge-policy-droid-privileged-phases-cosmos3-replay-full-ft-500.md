# joonyeongs/cosmos3-edge-policy-droid-privileged-phases-cosmos3-replay-full-ft-500

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (policy model) para control robótico desarrollado originalmente por NVIDIA, construido sobre la familia Cosmos3 y especializado en el benchmark DROID. Esta variante concreta, publicada por el usuario `joonyeongs`, es un ajuste fino completo (full fine-tuning) del checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID` orientado a generar fases privilegiadas en el entorno RoboLab, combinando muestreo de episodios exitosos con una técnica de replay de fases del propio modelo base.

El modelo resuelve el problema de generar trayectorias de acción (chunks de 32 pasos de posiciones articulares) a partir de observaciones visuales, actuando como servidor de política en el pipeline de evaluación RoboLab. Su relevancia radica en que demuestra un flujo de ajuste fino reproducible sobre hardware asequible (2× A100-80GB durante 3,4 horas) y en que introduce una estrategia de muestreo híbrida entre datos privilegiados y replay del modelo base.

Con 3.859 millones de parámetros y un repositorio de 9,2 GB en formato safetensors, es un modelo de tamaño medio orientado a inferencia como servidor de política, no a generación de texto general. No se dispone de información sobre longitud de contexto, idiomas ni benchmarks de éxito de tarea en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cosmos3 (modelo de política con torre de comprensión congelada y generador de difusión; `cosmos3_omni`) |
| Parámetros totales | 3.859.003.312 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (`openmdw1.1-license`, heredada del modelo base) |
| Formato de pesos | safetensors (`transformer/diffusion_pytorch_model-0000{1,2}-of-00002.safetensors`) |
| Chunk de acción | 32 pasos |
| Frecuencia de condicionamiento | 15 fps |
| Dominio | `droid_lerobot` |
| VAE externo | Wan2.2 VAE (`Wan-AI/Wan2.2-TI2V-5B`) |
| Tamaño del repo | 9,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cosmos3, que combina una torre de comprensión (entendimiento) con un generador de difusión. En este ajuste fino se entrenan todos los pesos del lado del generador: atención, MLP y normas del generador, los módulos `vae2llm` y `llm2vae`, el time embedder, y las fronteras de acción DROID y el embedding de modalidad. La torre de comprensión y `k_norm_und_for_gen` permanecen congelados, con las claves/valores de texto cacheadas. El checkpoint conserva exactamente el layout del modelo base; solo difieren los dos shards del transformer.

El entrenamiento se realizó sobre dos pools de datos intercalados en una proporción fija de 1 replay : 4 privilegiado (fracción de replay 0,2). El pool privilegiado aporta 37.516 inicios elegibles de cuatro tareas (Red Items, Cartons, Bottles, Stack), ya que Canned Food y Toy tienen rangos vacíos. El pool de replay de fases Cosmos3 aporta 22.657 inicios de las seis tareas, muestreando ventanas que comienzan en pasos que la política base ejecutó. Se completaron 500 pasos (25.600 ventanas privilegiadas + 6.400 de replay) con batch global 64 (2 GPUs × 32), LR 2e-5 con warmup lineal de 25 pasos y decaimiento lineal, precisión BF16, FSDP de 2 vías, checkpointing selectivo de activaciones y `torch.compile`, usando 2× A100-80GB durante 3,4 horas.

## Capacidades

- Generación de chunks de acción de 32 pasos de posiciones articulares a partir de observaciones visuales, en el dominio DROID.
- Actuación como servidor de política para el entorno de evaluación RoboLab (`action_policy_server_robolab`).
- Condicionamiento a 15 fps con formato de prompt JSON (`--format-prompt-as-json True`).
- Generación de fases privilegiadas mediante muestreo de ventanas con padding de 10 frames.
- Replay de fases del modelo base Cosmos3 para ampliar la cobertura de tareas.
- Inferencia con guidance interval configurable (`--guidance-interval 960 1001`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación de políticas robóticas en RoboLab: el modelo se sirve con `action_policy_server_robolab` en el puerto 8000 y responde a observaciones del simulador generando chunks de acción de 32 pasos, lo que permite medir el éxito de tarea en el benchmark.
- Generación de datos privilegiados para entrenamiento: al muestrear ventanas que comienzan dentro de fases privilegiadas, se pueden producir trayectorias de referencia para aumentar el dataset de ajuste de otras políticas.
- Replay de fases para cobertura de tareas: la técnica de replay permite que tareas sin fases privilegiadas (Canned Food, Toy) contribuyan al entrenamiento a través de ventanas del modelo base, útil para equilibrar datasets desbalanceados.
- Investigación en ajuste fino de políticas visomotoras: el repositorio documenta la receta completa (`robolab_droid_edge_full.toml`), lo que sirve de base reproducible para experimentos con otras proporciones de replay o datasets.
- Validación de exportación de checkpoints: el procedimiento de carga con `RobolabPolicyService` y comparación de MAE frente a acciones demostradas permite verificar la integridad de un checkpoint antes de desplegarlo.
- Servicio de política en pipelines de simulación a escala: al caber en 2× A100-80GB y usar BF16, se puede desplegar en infraestructura moderada para generar rollouts en paralelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito de tarea en la información disponible. La model card incluye únicamente una comprobación de exportación (no una evaluación de política) que compara los chunks predichos con las acciones demostradas mediante error absoluto medio (MAE, en radianes):

| Episodio | Frame | Tarea | MAE |
|---|---|---|---|
| 0 | 0 | Put the canned food in the grey bin | 0,1020 |
| 0 | 154 | Put the canned food in the grey bin | 0,0989 |
| 25 | 0 | Put the lizard away in the bin | 0,0724 |
| 25 | 139 | Put the lizard away in the bin | 0,0509 |
| 50 | 0 | Put all the red things in the grey bin | 0,0790 |
| 50 | 326 | Put all the red things in the grey bin | 0,0649 |
| 75 | 0 | Put the cartons that can be recycled in the vertical crate | 0,0798 |
| 75 | 442 | Put the cartons that can be recycled in the vertical crate | 0,1418 |
| | | **Media** | **0,0862** |

Todas las salidas fueron finitas. El autor indica explícitamente que esto no es una medida de éxito de tarea y que el éxito en bucle cerrado en RoboLab no se ha evaluado todavía.

## Requisitos de hardware

- Entrenamiento documentado: 2× A100-80GB, BF16, FSDP de 2 vías, checkpointing selectivo de activaciones y `torch.compile`, durante 3,4 horas para 500 pasos.
- VRAM estimada para inferencia: no disponible en la información proporcionada; con 3.859 millones de parámetros en BF16, los pesos ocupan aproximadamente 7,7 GB, a lo que hay que sumar el VAE Wan2.2 y las activaciones.
- GPU recomendadas: A100-80GB o H100 para despliegue sin cuantizar; no se documenta compatibilidad con GPUs de consumo.
- ¿Cabe en GPU de consumo? No disponible; no se han publicado requisitos de VRAM para inferencia ni variantes cuantizadas.
- Opciones de despliegue: servidor de política incluido en el framework Cosmos (`python -m cosmos_framework.scripts.action_policy_server_robolab`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Dependencia externa: la inferencia descarga el VAE Wan2.2 (`Wan-AI/Wan2.2-TI2V-5B`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joonyeongs/cosmos3-edge-policy-droid-privileged-phases-cosmos3-replay-full-ft-500 | 3.859 M | no disponible | Política robótica DROID / RoboLab | OpenMDW-1.1 | Hugging Face |
| nvidia/Cosmos3-Edge-Policy-DROID | no disponible | no disponible | Política robótica DROID | OpenMDW-1.1 (heredada) | Hugging Face |
| joonyeongs/cosmos3-edge-policy-droid-privileged-phases-full-ft-500 | no disponible | no disponible | Política robótica DROID / RoboLab | OpenMDW-1.1 | Hugging Face |

El modelo base y la variante sin replay comparten arquitectura y licencia; la diferencia principal de esta ficha es la estrategia de muestreo (replay 1:4). No se dispone de datos de rendimiento comparativo entre las tres variantes.

## Limitaciones y advertencias

- El éxito en bucle cerrado en RoboLab no se ha evaluado; la única validación publicada es una comprobación de exportación con MAE, que no mide éxito de tarea.
- El modelo está especializado en el dominio `droid_lerobot` y en tareas concretas de RoboLab; no es un modelo de propósito general.
- Dos de las seis tareas (Canned Food y Toy) no aportan inicios privilegiados y solo contribuyen mediante replay, lo que puede desequilibrar el aprendizaje hacia las cuatro tareas restantes.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones de idioma; al ser un modelo visomotor, estos conceptos no aplican de la misma forma que en modelos de lenguaje.
- La licencia OpenMDW-1.1 se hereda del modelo base; es responsabilidad del usuario revisar sus términos para uso comercial.
- El checkpoint requiere el VAE Wan2.2 externo, lo que añade una dependencia de descarga en tiempo de inferencia.
- Solo difieren dos shards del transformer respecto al modelo base; los tensores entrenados reemplazan a los originales en su dtype de publicación, según indica el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-privileged-phases-cosmos3-replay-full-ft-500
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Variante sin replay: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-privileged-phases-full-ft-500
- Dataset de entrenamiento: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-harness-privileged-phases-150
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- VAE Wan2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
