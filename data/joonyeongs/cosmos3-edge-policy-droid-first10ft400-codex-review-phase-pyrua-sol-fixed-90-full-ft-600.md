# joonyeongs/cosmos3-edge-policy-droid-first10ft400-codex-review-phase-pyrua-sol-fixed-90-full-ft-600

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (policy model) para control robótico basado en la familia Cosmos3 de NVIDIA, concretamente en la variante Edge-Policy-DROID. Este checkpoint concreto es un ajuste fino completo del generador realizado por el usuario joonyeongs mediante la receta RoboLab DROID, partiendo de un ajuste fino previo del mismo autor sobre el modelo original de NVIDIA. El modelo resuelve el problema de traducir observaciones visuales y consignas de tarea en secuencias de acciones motoras de 32 pasos para un brazo robótico, en el formato del dataset DROID.

El checkpoint corresponde a un entrenamiento de 600 actualizaciones con batch global de 64 sobre 2 GPUs A100-80GB, con un learning rate de 2e-05 y un total de 3.859.003.312 parámetros. La relevancia de esta publicación es acotada: se trata de un experimento de ajuste fino dentro de una cadena de iteraciones sobre el modelo base, subido automáticamente al finalizar el job, sin evaluación de éxito en bucle cerrado publicada. Su interés principal es para investigadores que replican o continúan la receta RoboLab DROID sobre Cosmos3-Edge.

El modelo emplea la librería `cosmos` y se distribuye en formato safetensors con un tamaño de repositorio de 9,2 GB. La arquitectura subyacente combina una torre de comprensión (congelada durante este ajuste fino, con caché de K/V de texto) y un generador de acciones completamente ajustado. La licencia es OpenMDW 1.1, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 Edge Policy (generador de acciones con torre de comprensión congelada y caché de K/V de texto) |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Cosmos3 Edge Policy, en la que un generador de acciones produce chunks de 32 pasos de posiciones articulares a partir de observaciones visuales y una consigna de tarea formateada como JSON. Durante este ajuste fino se entrenaron todos los pesos del lado del generador, mientras que la torre de comprensión permaneció congelada y se reutilizaron las claves y valores (K/V) de texto cacheadas. El punto de partida es el checkpoint `joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400`, a su vez un ajuste fino de `nvidia/Cosmos3-Edge-Policy-DROID`.

El entrenamiento se realizó con la receta RoboLab DROID: learning rate de 2e-05 con 30 pasos de warmup lineal y decaimiento lineal hasta cero, batch global de 64 (2 GPUs × 32 × acumulación de gradiente 1), 600 actualizaciones y checkpoints cada 250 pasos. Los datos provienen del dataset `droid_plus_lerobot_640x360_20260412`, con muestreo uniforme de todas las ventanas de trayectoria completa. El job se ejecutó en 2× A100-80GB durante 4,3 horas. El repositorio conserva exactamente el layout del checkpoint base; solo difieren los shards de pesos del transformer.

## Capacidades

- Generación de acciones robóticas: predice chunks de 32 pasos de posiciones articulares (joint positions) a partir de observaciones visuales y una consigna de tarea.
- Formato de prompt JSON: admite `--format-prompt-as-json True` en el servidor de evaluación RoboLab.
- Control guiado por instrucciones en lenguaje natural: las tareas del dataset DROID incluyen consignas como apilar bloques en un orden concreto o depositar objetos en contenedores.
- Integración con RoboLab: se sirve mediante `cosmos_framework.scripts.action_policy_server_robolab` con `--guidance-interval 960 1001`.
- Ajuste fino completo del generador con torre de comprensión congelada.
- No se documentan capacidades de generación de texto general, código, matemáticas, tool calling, agentes ni multimodalidad de audio en la información disponible.

## Casos de uso

- Evaluación de manipulación robótica en RoboLab: el modelo se sirve con `action_policy_server_robolab` en el puerto 8000 y se consulta con frames de episodios para obtener chunks de acciones de 32 pasos, lo que permite medir el éxito en tareas de bucle cerrado.
- Recogida de objetos en contenedores: tareas como "Put the lizard away in the bin" o "Put the canned food in the grey bin" del dataset DROID, donde el modelo genera trayectorias articulares condicionadas por la imagen y la consigna.
- Apilamiento de bloques con orden específico: la tarea "Stack the blocks in the order from bottom to top: red, blue, green, yellow" evalúa la capacidad de seguir instrucciones secuenciales de manipulación.
- Clasificación y agrupación de objetos por color: la tarea "Put all the red things in the grey bin" requiere identificar objetos por atributo visual y planificar múltiples recogidas.
- Punto de partida para nuevos ajustes finos: al conservar el layout del checkpoint base, sirve como inicialización para experimentos posteriores de la cadena RoboLab DROID con distintos datasets o hiperparámetros.
- Validación de exportación de checkpoints: el propio autor lo usa para comprobar que el checkpoint exportado se carga correctamente en `RobolabPolicyService` y produce acciones coherentes con las demostraciones (MAE medio de 0,1145 rad).
- Investigación sobre ajuste fino completo frente a ajuste parcial en políticas robóticas: la configuración congelada de la torre de comprensión y caché de K/V permite estudiar el coste y el rendimiento de entrenar solo el generador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica únicamente una comprobación de exportación que no constituye una evaluación de política, comparando los chunks de 32 pasos predichos con las acciones demostradas mediante error absoluto medio (MAE, en radianes):

| Episodio | Frame | Tarea | MAE |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,0986 |
| 0 | 69 | Put the lizard away in the bin | 0,0474 |
| 25 | 0 | Put the canned food in the grey bin | 0,0715 |
| 25 | 60 | Put the canned food in the grey bin | 0,0494 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,2329 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0508 |
| 75 | 0 | Put all the red things in the grey bin | 0,2600 |
| 75 | 225 | Put all the red things in the grey bin | 0,1056 |
| | | **Media** | **0,1145** |

El éxito en bucle cerrado en RoboLab no ha sido evaluado todavía según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.859.003.312 parámetros y pesos safetensors en fp32 el modelo ocuparía aproximadamente 15,4 GB, y en fp16/bf16 unos 7,7 GB, sin contar activaciones ni la torre de comprensión.
- GPU de entrenamiento documentadas: 2× A100-80GB con batch global 64 durante 4,3 horas para 600 pasos.
- GPU recomendadas para servicio: no disponibles; por tamaño, una GPU con al menos 16-24 GB de VRAM podría alojar los pesos en precisión reducida, aunque no se confirma en la información.
- Compatibilidad con GPU de consumo: no confirmada; no se documenta despliegue en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: servidor de evaluación RoboLab mediante `python -m cosmos_framework.scripts.action_policy_server_robolab --checkpoint-path <snapshot> --port 8000 --format-prompt-as-json True --guidance-interval 960 1001`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmos3-edge-policy-droid-first10ft400-codex-review-phase-pyrua-sol-fixed-90-full-ft-600 (este) | 3.859.003.312 | no disponible | MAE medio 0,1145 rad en comprobación de exportación; sin éxito en bucle cerrado | OpenMDW 1.1 | Hugging Face, 0 descargas |
| joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400 (modelo base inmediato) | no disponible | no disponible | no disponible | OpenMDW 1.1 (heredada) | Hugging Face |
| nvidia/Cosmos3-Edge-Policy-DROID (modelo original) | no disponible | no disponible | no disponible | OpenMDW 1.1 | Hugging Face (NVIDIA) |

No se dispone de datos de benchmarks comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado en RoboLab; la única métrica publicada es un MAE de exportación que no mide éxito de tarea.
- El MAE varía notablemente según el frame: desde 0,0474 rad hasta 0,2600 rad, lo que sugiere mayor error al inicio de episodios con tareas de apilamiento o agrupación por color.
- El modelo está especializado en el dataset DROID y en el formato de tareas de RoboLab; no es un modelo de propósito general.
- El dataset de entrenamiento podría no estar subido en el momento de la publicación; la receta incluye un hook de espera (`PRE_TRAIN_HOOK`) que bloquea hasta 24 horas a que esté disponible.
- Es un checkpoint intermedio de una cadena de ajustes finos (600 pasos sobre un modelo ya ajustado 400 pasos), sin garantía de ser el mejor de la serie.
- La licencia OpenMDW 1.1 debe revisarse para uso comercial; se hereda del modelo base de NVIDIA y no es una licencia permisiva estándar tipo Apache 2.0 o MIT.
- Debe servirse con el flip de gripper por defecto; no pasar `--no-flip-gripper`, lo que puede provocar acciones invertidas si se configura mal.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos; al ser un modelo de política, el riesgo principal es la generación de acciones incorrectas o inseguras en entornos físicos.
- Sin datos de latencia ni throughput, no se puede garantizar su viabilidad en control en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-first10ft400-codex-review-phase-pyrua-sol-fixed-90-full-ft-600
- Modelo base inmediato: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400
- Modelo original de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de entrenamiento: https://huggingface.co/joonyeongs/cosmos3-edge-first10ft400-codex-review-phase-pyrua-sol-fixed-90
- Dataset de referencia de formato: https://huggingface.co/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases (rama `robolab-droid-train-edge-privileged-phases`, commit de entrenamiento `95bad15`)
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
