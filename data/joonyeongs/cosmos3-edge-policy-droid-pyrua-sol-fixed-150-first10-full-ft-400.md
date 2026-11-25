# joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (policy model) para robótica desarrollado originalmente por NVIDIA, concebido para traducir observaciones visuales y consignas de tarea en secuencias de acciones motoras de bajo nivel. Este repositorio concreto es un ajuste fino (fine-tuning) completo del generador realizado por el usuario joonyeongs sobre el checkpoint base `nvidia/Cosmos3-Edge-Policy-DROID`, empleando la receta RoboLab DROID sobre un subconjunto restringido del dataset `cosmos3-edge-pyrua-sol-fixed-150`. El resultado es un checkpoint especializado en las tareas concretas de manipulación presentes en ese dataset, no un modelo de propósito general.

El modelo pertenece a la familia Cosmos3 y se distribuye en formato safetensors con un total de 3.859.003.312 parámetros (aproximadamente 3,86 mil millones), lo que lo sitúa en la gama "Edge" de la familia: un tamaño pensado para despliegue en entornos con recursos acotados. La arquitectura combina un generador (la parte que produce las acciones) con una torre de comprensión (understanding tower) que procesa el texto de la consigna; en este ajuste fino solo se han actualizado los pesos del generador, manteniendo congelada la torre de comprensión con las claves/valores de texto en caché.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de cómo adaptar un policy model de NVIDIA a un conjunto de tareas robóticas específicas con hardware modesto (2 GPU A100-80GB durante 2,8 horas), y como artefacto de investigación para estudiar el comportamiento de políticas visuales-motoras ajustadas con pocos datos. No obstante, conviene subrayar que el propio autor indica que el éxito en bucle cerrado (closed-loop success) en RoboLab no se ha evaluado todavía, por lo que las métricas publicadas miden únicamente el error de reconstrucción de acciones, no el rendimiento real de la política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (generador + torre de comprensión con K/V de texto en caché); detalles internos no disponibles |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | OpenMDW License 1.1 (heredada del modelo base) |
| Formato de pesos | safetensors (repo de 9,2 GB; solo difieren los shards del transformer respecto al base) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Cosmos3 de NVIDIA, orientada a modelos de política para robótica. La receta de ajuste fino descrita en la model card es un *generator full fine-tuning*: se actualizan todos los pesos del lado del generador, mientras que la torre de comprensión permanece congelada y se reutilizan sus claves/valores de texto en caché. El repositorio conserva exactamente la estructura del checkpoint base; únicamente cambian los shards de pesos del transformer. No se detalla en la información disponible el tipo exacto de bloque (transformer denso, MoE, híbrido, SSM) ni la composición interna de capas.

El entrenamiento se realizó sobre el dataset `joonyeongs/cosmos3-edge-pyrua-sol-fixed-150`, restringido a las primeras 10 demostraciones por tarea (60 episodios en total, 17.178 ventanas de trayectoria completa muestreadas de forma uniforme). Se usó un único pool de muestreo, batch global de 64 (2 GPU × 32 × acumulación de gradiente 1), 400 actualizaciones, tasa de aprendizaje 2e-5 con 20 pasos de calentamiento lineal y decaimiento lineal hasta cero, checkpoints cada 100 pasos y hardware de 2× A100-80GB durante 2,8 horas. El código de entrenamiento está disponible en la rama `robolab-droid-train-edge-privileged-phases` del repositorio `joonyeongs/cosmos-framework`. No se especifica en la información proporcionada el volumen total de tokens, la composición del dataset más allá de la restricción de episodios, ni si hubo etapas de RLHF o DPO (en un policy model de robótica no serían el mecanismo habitual).

## Capacidades

- Generación de acciones motoras: produce *chunks* de 32 pasos de posiciones articulares (joint positions) a partir de observaciones visuales y una consigna de tarea, tal como se describe en el protocolo de servicio RoboLab.
- Control robótico de manipulación: entrenado sobre tareas DROID del dataset pyrua (colocar objetos en contenedores, apilar bloques en un orden especificado, etc.).
- Procesamiento de consignas en formato JSON: el servidor de evaluación se invoca con `--format-prompt-as-json True`.
- Integración con RoboLab: incluye instrucciones de servicio mediante `action_policy_server_robolab` y `RobolabPolicyService`.
- Corrección de pinza (gripper): el modelo requiere el *flip* de pinza por defecto; no debe pasarse `--no-flip-gripper`.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo de razonamiento extendido (thinking mode). Es un modelo especializado en política robótica, no un LLM de propósito general.

## Casos de uso

- Evaluación de políticas robóticas en RoboLab: el checkpoint se sirve con `action_policy_server_robolab` en el puerto 8000 y se consulta con `RobolabPolicyService` para medir el comportamiento en bucle cerrado sobre las tareas del dataset pyrua. Es adecuado porque mantiene el formato de servicio del modelo base y solo modifica los pesos del generador.
- Investigación en ajuste fino con pocos datos: sirve como caso reproducible de cómo adaptar un policy model de NVIDIA con solo 60 episodios y 400 pasos en 2× A100-80GB, útil para estudiar la relación entre número de demostraciones y calidad de la política.
- Reproducción de experimentos de transferencia: el código de entrenamiento está publicado en una rama concreta del repositorio `cosmos-framework`, lo que permite repetir el pipeline (preparación del subconjunto con `subset_lerobot_v3.py`, entrenamiento, exportación y validación).
- Desarrollo de servidores de política compatibles: el modelo define un contrato de servicio concreto (formato JSON, intervalo de guiado 960–1001, flip de pinza) que puede usarse como referencia para construir o probar infraestructura de despliegue de políticas robóticas.
- Validación de exportación de checkpoints: el propio autor documenta una comprobación de exportación comparando los chunks de 32 pasos predichos con las acciones demostradas (MAE media de 0,1030 rad), lo que sirve como test de integridad tras el entrenamiento.
- Estudio de tareas de manipulación específicas: las tareas cubiertas (guardar el lagarto en la papelera, apilar bloques en orden rojo-azul-verde-amarillo, colocar todos los objetos rojos en la papelera gris) permiten analizar el comportamiento de la política en escenarios concretos y comparar con el modelo base.
- Base para nuevos ajustes finos: al conservar el layout del checkpoint base, puede reutilizarse como punto de partida para entrenar sobre otros subconjuntos o tareas con la misma receta.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que por otra parte no aplican a un policy model robótico. Lo que sí se documenta es una comprobación de exportación (no una evaluación de política) que compara los chunks de 32 pasos predichos con las acciones demostradas, en radianes:

| Episodio | Frame | Tarea | MAE (rad) |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0,0665 |
| 0 | 69 | Put the lizard away in the bin | 0,0528 |
| 25 | 0 | Put the canned food in the grey bin | 0,0451 |
| 25 | 60 | Put the canned food in the grey bin | 0,0467 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,2055 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0,0510 |
| 75 | 0 | Put all the red things in the grey bin | 0,2275 |
| 75 | 225 | Put all the red things in the grey bin | 0,1289 |
| | | **Media** | **0,1030** |

El autor indica explícitamente que el éxito en bucle cerrado en RoboLab no se ha evaluado todavía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Entrenamiento: 2× A100-80GB durante 2,8 horas con batch global 64 (2 × 32 × acumulación 1) y 400 actualizaciones.
- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, los 3,86 mil millones de parámetros en safetensors ocupan aproximadamente 7,7 GB en fp16/bf16 y alrededor de 15,4 GB en fp32; a ello hay que sumar el estado del servidor de política y los buffers de observación, pero no se documentan cifras oficiales.
- GPU recomendadas: el autor solo menciona A100-80GB para el entrenamiento. No se especifican GPU recomendadas para inferencia.
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de pesos, un checkpoint en bf16 podría caber en GPUs de consumo con 16 GB o más de VRAM, pero no hay datos oficiales de consumo ni de cuantizaciones soportadas.
- Opciones de despliegue: el método documentado es `python -m cosmos_framework.scripts.action_policy_server_robolab` con `--checkpoint-path`, `--port 8000`, `--format-prompt-as-json True` y `--guidance-interval 960 1001`, más el servicio `RobolabPolicyService`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-...) | 3,86 B | no disponible | MAE media de exportación 0,1030 rad; sin evaluación closed-loop | OpenMDW 1.1 | Hugging Face, repo de 9,2 GB |
| nvidia/Cosmos3-Edge-Policy-DROID (base) | no disponible en la información | no disponible | no disponible | OpenMDW 1.1 | Hugging Face |
| Otros policy models de la familia Cosmos3 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de otros desarrolladores (por ejemplo, políticas robóticas de tamaño similar) en la documentación proporcionada, por lo que la comparativa se limita al modelo base y a la propia familia.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado en RoboLab; las cifras de MAE miden únicamente la proximidad de las acciones predichas a las demostradas, no el rendimiento de la tarea.
- El ajuste fino se hizo sobre un subconjunto muy restringido: 60 episodios (primeras 10 demostraciones por tarea) del dataset pyrua, por lo que la política está especializada en esas tareas y no generaliza necesariamente a otras.
- Los errores de exportación son desiguales: las tareas de apilado y de recogida de objetos rojos muestran MAE de 0,2055 y 0,2275 rad en el primer frame, muy superiores a la media, lo que sugiere mayor dificultad o menor cobertura de datos en esos casos.
- El modelo requiere servir con el flip de pinza por defecto; pasar `--no-flip-gripper` produciría un comportamiento incorrecto.
- Licencia OpenMDW 1.1: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar (MIT/Apache) y puede imponer condiciones adicionales.
- No se documentan sesgos, idiomas soportados, riesgos de alucinación ni limitaciones de contexto; al ser un policy model, el riesgo relevante es la ejecución de acciones incorrectas en el robot, no la generación de texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día; se trata de un artefacto de investigación reciente y sin validación externa.
- El pipeline no está especificado en Hugging Face y la librería es `cosmos`, poco común, lo que puede complicar la integración con herramientas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Dataset de ajuste fino: https://huggingface.co/datasets/joonyeongs/cosmos3-edge-pyrua-sol-fixed-150
- Código de entrenamiento (rama): https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
