# joonyeongs/cosmos3-edge-policy-droid-first10ft400-codex-review-phase-pyrua-sol-fixed-90-full-ft-400

## Resumen

Cosmos3-Edge-Policy-DROID es un modelo de política (policy model) para robótica manipulativa, desarrollado por el usuario joonyeongs a partir de la familia Cosmos3 de NVIDIA. Concretamente, este checkpoint es un ajuste fino completo del generador sobre el modelo `joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400`, que a su vez deriva de `nvidia/Cosmos3-Edge-Policy-DROID`. El modelo recibe observaciones visuales de un robot y predice secuencias de acciones articulares (chunks de 32 pasos), lo que lo convierte en un componente de control para tareas de manipulación tipo DROID.

La relevancia de este checkpoint es acotada y experimental: se trata de un artefacto de investigación subido automáticamente al final de un job de entrenamiento, con 400 actualizaciones sobre un conjunto de 90 episodios (15 por tarea) del dataset RoboLab DROID. No es un modelo de propósito general ni un LLM conversacional; es un modelo de política entrenado para un entorno y unas tareas concretas, con licencia OpenMDW 1.1 heredada del modelo base.

Arquitectónicamente pertenece a la familia Cosmos3 (arquitectura de difusión/transformer multimodal con torre de comprensión y generador), con aproximadamente 3.859 millones de parámetros totales y un peso en disco de 9,2 GB en safetensors. La model card no especifica longitud de contexto, idiomas ni tipos de cuantización, y no se han publicado evaluaciones de éxito en bucle cerrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3 (familia Cosmos de NVIDIA; torre de comprensión congelada + generador de difusión/transformer para predicción de acciones) |
| Parametros totales | 3.859.003.312 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW License 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (repo de 9,2 GB; mismos shards que el checkpoint base, solo difieren los del transformer) |

## Arquitectura y entrenamiento

El modelo sigue el esquema de Cosmos3-Edge-Policy: una torre de comprensión (understanding tower) que procesa la observación y un generador que produce las acciones. En este ajuste fino se entrenan todos los pesos del lado del generador, mientras que la torre de comprensión permanece congelada y se cachean sus K/V de texto. La salida son chunks de 32 pasos de posiciones articulares (joint positions).

El entrenamiento se realizó con el recipe RoboLab DROID sobre el dataset `droid_plus_lerobot_640x360_20260412`, con un único pool de muestreo y todas las ventanas de trayectoria completa muestreadas uniformemente. Se dieron 400 actualizaciones (checkpoint `iter_000000400`) con batch global 64 (2 GPUs × 32 × acumulación 1), learning rate 2e-5 con warmup lineal de 20 pasos y decaimiento lineal a 0. El cómputo fue de 2× A100-80GB durante 2,8 horas. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación; tampoco el número total de tokens de entrenamiento.

## Capacidades

- Predicción de acciones robóticas: genera chunks de 32 pasos de posiciones articulares a partir de observaciones visuales, orientado a control de manipulación tipo DROID.
- Ejecución como servidor de política: se sirve mediante `cosmos_framework.scripts.action_policy_server_robolab` con formato de prompt JSON y `--guidance-interval 960 1001`.
- Integración con RoboLab: compatible con `RobolabPolicyService` para evaluación en el entorno RoboLab.
- Ajuste fino completo del generador sobre tareas específicas del dataset DROID (apilar bloques, colocar objetos en contenedores, etc.).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo; es un modelo de política, no un LLM de propósito general.

## Casos de uso

- Investigación en aprendizaje por imitación: servir el checkpoint con el servidor de política de RoboLab para reproducir experimentos de ajuste fino sobre DROID y comparar recetas de entrenamiento (pasos, batch, learning rate).
- Evaluación de políticas en bucle cerrado: desplegar el servidor en el puerto 8000 y conectar el cliente RoboLab para medir tasas de éxito en tareas como apilar bloques o colocar objetos en contenedores (pendiente de evaluar según la model card).
- Control de manipulación en laboratorio: usar las predicciones de chunks de 32 pasos como referencia de posiciones articulares en un robot con la misma configuración de pinza (gripper) que el dataset de entrenamiento.
- Reproducibilidad de pipelines de entrenamiento: el repositorio conserva el layout exacto del checkpoint base y solo cambian los shards del transformer, lo que facilita auditar qué pesos se modificaron y comparar contra el modelo base.
- Estudio de transferencia entre checkpoints: al derivar de un ajuste fino previo, permite analizar el efecto de una segunda ronda de entrenamiento (400 pasos adicionales) sobre el mismo dominio.
- Base para nuevos ajustes finos: sirve como punto de partida para recetas RoboLab DROID sobre otros subconjuntos de episodios o tareas, dado que el código de entrenamiento está publicado en la rama `robolab-droid-train-edge-privileged-phases`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de éxito en tarea en la información disponible. La model card incluye únicamente una comprobación de exportación (no una evaluación de política) que compara los chunks predichos de 32 pasos con las acciones demostradas, en radianes (MAE):

| Episodio | Frame | Tarea | MAE |
|---|---|---|---|
| 0 | 0 | Put the lizard away in the bin | 0.0870 |
| 0 | 69 | Put the lizard away in the bin | 0.0886 |
| 25 | 0 | Put the canned food in the grey bin | 0.1001 |
| 25 | 60 | Put the canned food in the grey bin | 0.0451 |
| 50 | 0 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0.2247 |
| 50 | 292 | Stack the blocks in the order from bottom to top: red, blue, green, yellow | 0.0416 |
| 75 | 0 | Put all the red things in the grey bin | 0.2159 |
| 75 | 225 | Put all the red things in the grey bin | 0.0876 |
| | | **Media** | **0.1113** |

El autor indica explícitamente que esto no es una medida de éxito en tarea y que el éxito en bucle cerrado en RoboLab aún no se ha evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3.859 millones de parámetros en safetensors (9,2 GB en fp32/bf16 según shards), se requiere al menos una GPU con memoria suficiente para cargar el checkpoint completo más las activaciones del servidor de política.
- GPU recomendadas: el entrenamiento se realizó en 2× A100-80GB; para servicio no se especifica una GPU mínima.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: servidor propio de Cosmos Framework (`action_policy_server_robolab`) y `RobolabPolicyService`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de política de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (joonyeongs, 400 pasos) | 3.859 M | no disponible | MAE media 0.1113 (export check) | OpenMDW 1.1 | Hugging Face |
| joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400 (base directo) | no disponible | no disponible | no disponible | OpenMDW 1.1 | Hugging Face |
| nvidia/Cosmos3-Edge-Policy-DROID (raíz) | no disponible | no disponible | no disponible | OpenMDW 1.1 | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones comparables de los modelos de la cadena de ajuste fino en la información proporcionada.

## Limitaciones y advertencias

- No se ha evaluado el éxito en bucle cerrado en RoboLab; las métricas publicadas son solo una comprobación de exportación y no miden rendimiento en tarea.
- El modelo está entrenado sobre un conjunto muy reducido (90 episodios, 15 por tarea) y un dominio concreto (DROID/RoboLab), por lo que su generalización fuera de esas tareas es incierta.
- Requiere servir con el flip de pinza por defecto; el autor advierte explícitamente de no pasar `--no-flip-gripper`.
- La torre de comprensión está congelada y se usan K/V de texto cacheadas, lo que limita la adaptación a nuevas instrucciones o modalidades no vistas.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe; no es un modelo de lenguaje y no debe usarse como tal.
- Licencia OpenMDW 1.1: es necesario revisar sus términos para uso comercial, ya que se hereda del modelo base y no es una licencia permisiva estándar tipo Apache 2.0.
- El repositorio se subió automáticamente al final del job; la reproducibilidad depende del código de la rama `robolab-droid-train-edge-privileged-phases` (commit `95bad15`) y del fichero `robolab_finetune.json`.
- Riesgo de alucinación no aplicable en el sentido de LLM, pero sí de predicciones de acción no fidedignas fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-first10ft400-codex-review-phase-pyrua-sol-fixed-90-full-ft-400
- Modelo base directo: https://huggingface.co/joonyeongs/cosmos3-edge-policy-droid-pyrua-sol-fixed-150-first10-full-ft-400
- Modelo raíz de NVIDIA: https://huggingface.co/nvidia/Cosmos3-Edge-Policy-DROID
- Código de entrenamiento: https://github.com/joonyeongs/cosmos-framework/tree/robolab-droid-train-edge-privileged-phases
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
