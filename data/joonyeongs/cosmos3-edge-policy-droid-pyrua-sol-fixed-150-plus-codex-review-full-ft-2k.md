# joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-plus-codex-review-full-ft-2k

## Resumen

Cosmos3-Edge-Policy-DROID fine-tuned es un modelo de política (policy model) para control robótico derivado de nvidia/Cosmos3-Edge-Policy-DROID, desarrollado por el usuario joonyeongs. Se trata de un ajuste fino completo del generador sobre dos conjuntos de datos propios de manipulación (pyrua_sol_fixed_150 y codex_review_pyrua_sol_fixed_150), orientado a tareas de robótica de manipulación en el entorno RoboLab con el dataset DROID. El modelo predice secuencias de acciones de 32 pasos en forma de posiciones articulares (joint positions) a partir de observaciones visuales y de instrucciones en lenguaje natural.

Con 3.859 millones de parámetros (3,86 B) y un repositorio de 9,2 GB, este checkpoint mantiene exactamente la estructura del modelo base de NVIDIA; solo difieren los shards de pesos del transformer. La torre de comprensión (understanding tower) permanece congelada con caché de K/V de texto, mientras que el generador se entrena con todos sus pesos activos. La relevancia actual radica en que demuestra un flujo completo de ajuste fino de políticas robóticas sobre hardware asequible (2× A100-80GB durante 13,5 horas) y en que publica el código, los datos y la configuración de entrenamiento, lo que facilita la reproducibilidad en investigación de robótica.

El modelo se distribuye bajo la licencia OpenMDW 1.1, la misma del modelo base, y está pensado para servirse mediante el servidor de evaluación de RoboLab (`action_policy_server_robolab`). No se han publicado evaluaciones de éxito en bucle cerrado (closed-loop success), por lo que su utilidad práctica en producción aún no está cuantificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (modelo de política generativo con torre de comprensión congelada y generador de acciones; familia cosmos3_omni) |
| Parametros totales | 3.859.003.312 (≈3,86 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (las instrucciones de tarea del dataset están en inglés) |
| Licencia | OpenMDW License 1.1 |
| Formato de pesos | safetensors (librería `cosmos`; layout idéntico al del checkpoint base) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cosmos3 en su variante Edge-Policy, un modelo de política que combina una torre de comprensión (que procesa observaciones e instrucciones y cuyos pesos permanecen congelados, con caché de K/V de texto) con un generador que produce chunks de acciones de 32 pasos. El ajuste fino es de tipo "generator full fine-tuning": se entrenan todos los pesos del lado del generador mientras la torre de comprensión se mantiene fija. No se dispone de detalles adicionales sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de lo indicado.

El entrenamiento se realizó sobre la unión de dos datasets propios (joonyeongs/cosmos3-edge-pyrua-sol-fixed-150 y joonyeongs/cosmos3-edge-codex-review-pyrua-sol-fixed-150, revisión 042f120), fusionados con la herramienta `merge_lerobot_v3.py` conservando las columnas del primer dataset. El conjunto resultante comprende 50 episodios × 6 tareas, con 117.601 ventanas de trayectoria completa muestreadas uniformemente. Se usaron 2 GPUs A100-80GB, batch global de 64 (2×32×acumulación 1), 2.000 actualizaciones con 100 pasos de warmup lineal y decaimiento lineal hasta 0, y tasa de aprendizaje 2e-5. El entrenamiento completo duró 13,5 horas y se guardaron checkpoints cada 250 pasos. No se menciona uso de RLHF ni DPO.

## Capacidades

- Predicción de acciones robóticas: genera chunks de 32 pasos de posiciones articulares (joint positions) a partir de observaciones visuales y una instrucción de tarea en lenguaje natural.
- Control de manipulación en entornos tipo RoboLab/DROID: tareas como apilar bloques, depositar objetos en contenedores o recoger objetos.
- Procesamiento multimodal visión-lenguaje: la torre de comprensión interpreta instrucciones textuales junto con las imágenes de la escena.
- Servido como servidor de política: se despliega con `action_policy_server_robolab` en el puerto indicado, con formato de prompt JSON y un intervalo de guiado (`--guidance-interval 960 1001`).
- Ajuste específico al dominio: entrenado sobre episodios de manipulación propios, lo que lo especializa en las tareas y el entorno de esos datos.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso genérico, ni soporte de audio.

## Casos de uso

- Evaluación de políticas de manipulación en RoboLab: servir el checkpoint con `action_policy_server_robolab` y medir el éxito en bucle cerrado en tareas de apilado y recogida de objetos, comparando con el modelo base.
- Investigación en ajuste fino de políticas robóticas: replicar el pipeline (datasets LeRobot fusionados, batch global 64, LR 2e-5, 2.000 pasos) para estudiar el efecto del ajuste completo del generador frente al congelado de la torre de comprensión.
- Generación de datos sintéticos de trayectorias: usar las predicciones de chunks de 32 pasos como propuestas de acción para aumentar datasets de manipulación, validando primero el error de posición articular.
- Pruebas de robustez ante instrucciones de tarea: evaluar cómo responde el modelo a variaciones en las instrucciones de las seis tareas del dataset (por ejemplo, cambiar el orden de apilado de bloques) midiendo el MAE frente a las acciones demostradas.
- Benchmark interno de infraestructura de despliegue: comparar latencia y throughput del servidor de política en distintas GPUs (por ejemplo, A100-80GB frente a consumer) para dimensionar entornos de evaluación robótica.
- Base para ajustes posteriores en dominios específicos: partir de este checkpoint (en lugar del base de NVIDIA) para fine-tuning en nuevas tareas de manipulación con menos pasos, dado que ya está adaptado a un entorno y formato de datos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica una comprobación de exportación que no constituye una evaluación de política: comparación del error absoluto medio (MAE, en radianes) entre los chunks predichos de 32 pasos y las acciones demostradas, sobre fotogramas de joonyeongs/cosmos3-edge-pyrua-sol-fixed-150.

| Episodio | Fotograma | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,1272 |
| 0 | 69 | Put the lizard away in the bin | 0,0446 |
| 25 | 0 | Put the canned food in the grey bin | 0,0509 |
| 25 | 60 | Put the canned food in the grey bin | 0,0551 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,1562 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0435 |
| 75 | 0 | Put all the red things in the grey bin | 0,1886 |
| 75 | 225 | Put all the red things in the grey bin | 0,1155 |
| | | **Media** | **0,0977** |

El éxito en bucle cerrado de RoboLab no ha sido evaluado todavía, según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,86 B de parámetros, los pesos en precisión completa (fp32) ocuparían unos 15,4 GB; en bf16/fp16, unos 7,7 GB. El repositorio completo ocupa 9,2 GB, lo que sugiere pesos en bf16/fp16 más artefactos. Hay que sumar la memoria del servidor de política y de las cachés de la torre de comprensión.
- GPU recomendadas: el autor entrenó con 2× A100-80GB; para inferencia en bucle cerrado se recomienda al menos una GPU con suficiente VRAM para pesos en bf16 y el servidor de evaluación (A100-80GB es la referencia documentada).
- ¿Cabe en GPU consumer?: no confirmado. Con pesos en bf16 (~7,7 GB) podría ser viable en GPUs consumer de 16-24 GB (RTX 4090, RTX 4080), pero no hay datos publicados de despliegue en ese hardware ni de cuantización.
- Opciones de despliegue: servidor oficial de RoboLab (`python -m cosmos_framework.scripts.action_policy_server_robolab --checkpoint-path <snapshot> --port 8000 --format-prompt-as-json True --guidance-interval 960 1001`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| joonyeongs/cosmos3-edge-policy-droid-...-full-ft-2k (este) | 3,86 B | no disponible | MAE medio 0,0977 rad (comprobación de exportación, no éxito de tarea) | OpenMDW 1.1 | Hugging Face, 0 descargas |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible en la información | no disponible | no disponible | OpenMDW 1.1 | Hugging Face (NVIDIA) |
| Otros modelos de política robótica comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría (por ejemplo, otras políticas de manipulación tipo diffusion policy o VLA); se indica "no disponible".

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado en RoboLab; la única métrica publicada es el MAE de exportación, que no mide éxito de tarea.
- El modelo está especializado en las seis tareas y el entorno de los datasets de entrenamiento (50 episodios × 6 tareas); su generalización a otras tareas, objetos o entornos no está documentada.
- Las instrucciones de tarea del dataset están en inglés; no hay información sobre soporte multilingüe.
- La torre de comprensión está congelada con caché de K/V de texto, lo que limita la adaptación del modelo al lenguaje más allá del generador.
- Riesgo de alucinación en el sentido de predicciones de acción no válidas o inseguras fuera de la distribución de entrenamiento; no hay análisis de seguridad publicado.
- Licencia OpenMDW 1.1: es necesario revisar sus términos para uso comercial; la model card no detalla restricciones adicionales.
- El modelo debe servirse con el giro de pinza por defecto (no pasar `--no-flip-gripper`); ignorarlo puede producir acciones incorrectas.
- Sesgos conocidos: no disponibles.
- Solo se han publicado 0 descargas y 0 likes; no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-plus-codex-review-full-ft-2k
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset 1: https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Dataset 2: https://huggingface.co/joonyeongs/cosmos3-edge-codex-review-pyrua-sol-fixed-150
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases (rama `robolab-droid-train-edge-privileged-phases`, código `95bad15`)
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Procedencia y hashes: `robolab_finetune.json` (incluido en el repositorio del modelo)
