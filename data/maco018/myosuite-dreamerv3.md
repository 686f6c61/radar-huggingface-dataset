# maco018/myosuite-dreamerv3

## Resumen

`maco018/myosuite-dreamerv3` es un conjunto de checkpoints y artefactos de despliegue del agente DreamerV3 (variante `size12m`, en torno a 10 millones de parametros) entrenado sobre tareas de biomecanica musculoesqueletica del entorno MyoSuite. Lo publica el usuario `maco018` como material asociado a la pull request `MyoHub/myosuite#903`, que integra el entrenamiento con DreamerV3 dentro del arbol `training/dreamerv3/` de MyoSuite. No es un modelo de lenguaje: es un agente de aprendizaje por refuerzo basado en modelo del mundo (world model) que aprende una representacion latente del entorno y planifica/actua sobre ella.

El interes tecnico esta en que se distribuyen tres formatos por tarea y semilla: ONNX con estado (ejecutable en `onnxruntime` sin JAX ni DreamerV3 instalados), TorchScript con estado (`torch.jit.load`) y el checkpoint nativo completo de DreamerV3 (RSSM, encoder, decoder, actor, critico y estado del optimizador) para reanudar o afinar. Se cubren tres semillas (0, 1, 2) en cuatro configuraciones de tarea (`myoElbowPose1D6MRandom-v0`, la misma con `--feature fatigue`, `myoHandPoseRandom-v0` y `myoLegWalk-v0`), entrenadas en GPU con `mjlab` (MuJoCo Warp) sobre una RTX 5090 y evaluadas de forma determinista y zero-shot en CPU con `myosuite.make_env`.

Es relevante ahora porque demuestra un flujo completo de entrenamiento a despliegue para agentes de control motor con modelos del mundo, con verificacion estricta de exportacion ONNX (`allow_provenance_mismatch=False`) y comparacion directa contra PPO de RSL-RL registrado en `mjlab`. El repositorio ocupa 2,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DreamerV3 (world model con RSSM: encoder, decoder, actor, critico), variante `size12m` |
| Parametros totales | aproximadamente 10M (segun model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; el agente opera sobre observaciones por paso) |
| Tipos de cuantizacion | no disponible (artefactos en ONNX y TorchScript en precision nativa; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con estado (`.onnx` + `.onnx.manifest.json`), TorchScript (`.pt`), checkpoint nativo DreamerV3 (`agent.pkl`, `policy_meta.json`, `config.yaml`) |

## Arquitectura y entrenamiento

DreamerV3 es un agente de RL basado en modelo del mundo. Aprende un modelo latente del entorno mediante un RSSM (recurrent state-space model) que combina estado determinista y estocastico, con un encoder que proyecta observaciones al espacio latente y un decoder que reconstruye observaciones. Sobre esa representacion se entrena un actor y un critico que optimizan la recompensa imaginada en el modelo latente. La variante `size12m` ronda los 10 millones de parametros, lo que la situa en el tramo pequeno de la familia DreamerV3 y la hace viable en hardware de consumo.

El entrenamiento se realizo en GPU con `mjlab` (MuJoCo Warp) sobre una NVIDIA GeForce RTX 5090, con tres semillas por tarea (0, 1, 2). La evaluacion se hizo de forma determinista y zero-shot en CPU mediante `myosuite.make_env`, es decir, sin reentrenamiento ni ajuste en el entorno de evaluacion. El numero de pasos de entorno varia por tarea: 36.864 en `myoElbowPose1D6MRandom-v0` (con y sin fatiga), 294.912 en `myoHandPoseRandom-v0` y 196.608 en `myoLegWalk-v0`. No se documenta en la informacion disponible el volumen total de datos, la composicion del dataset ni el uso de RLHF o DPO (tecnicas no aplicables a este tipo de agente). La innovacion destacable es el empaquetado del agente como politica recurrente con estado exportable a ONNX y TorchScript, con un manifiesto fisico de despliegue y verificacion estricta de procedencia.

## Capacidades

- Control motor musculoesqueletico en tareas de MyoSuite: pose de codo (`myoElbowPose1D6MRandom-v0`), pose de mano (`myoHandPoseRandom-v0`) y marcha con piernas (`myoLegWalk-v0`).
- Aprendizaje por refuerzo basado en modelo del mundo con planificacion en espacio latente (RSSM + actor/critico).
- Inferencia con estado recurrente: la firma ONNX `(obs, deter, stoch, prevact, is_first) -> (action, next_deter, next_stoch)` mantiene el estado interno entre pasos.
- Ejecucion sin JAX ni DreamerV3 instalados mediante `onnxruntime` (artefactos ONNX) o `torch.jit.load` (artefactos TorchScript).
- Reanudacion y fine-tuning del modelo completo (RSSM, encoder, decoder, actor, critico y estado del optimizador) mediante `dreamerv3-train --from-checkpoint`.
- Variante con fatiga muscular (`--feature fatigue`) en la tarea de codo, que modela la degradacion del rendimiento muscular.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues, vision general, audio ni modo "thinking": es un agente de control, no un modelo generativo de proposito general.

## Casos de uso

- Investigacion en control motor biomecanico: usar los checkpoints como linea base reproducible para comparar algoritmos de RL (DreamerV3 frente a PPO) en tareas de MyoSuite con las tres semillas publicadas.
- Despliegue ligero en produccion de simulacion: cargar el `.onnx` en `onnxruntime` sin dependencias de JAX para integrar el agente en un bucle de simulacion en CPU, util en entornos donde instalar el stack de DreamerV3 no es viable.
- Prototipado de protesis y exoesqueletos: emplear la politica de `myoElbowPose1D6MRandom-v0` (incluida la variante con fatiga) como controlador de referencia en estudios de rehabilitacion simulada.
- Fine-tuning sobre nuevas tareas musculoesqueleticas: partir del checkpoint nativo (`seed0_ckpt`) y reentrenar con `dreamerv3-train` para adaptar el agente a morfologias o recompensas distintas, aprovechando el estado del optimizador incluido.
- Validacion de pipelines de exportacion: usar los manifiestos y la verificacion estricta (`python -m myosuite.utils.export_onnx verify`) como caso de prueba para herramientas de conversion de politicas recurrentes a ONNX/TorchScript.
- Reproducibilidad de benchmarks: los logs en `evals/` con digests SHA-256 en `manifest.json` permiten auditar resultados y comparar contra PPO de RSL-RL en `mjlab`.
- Educacion y divulgacion: ejemplo completo de entrenamiento a despliegue de un world model en un dominio fisico, con artefactos en tres formatos y comparativa de rendimiento.

## Benchmarks y rendimiento

Resultados de la model card (media ± desviacion sobre semillas 0, 1, 2; retorno en CPU `make_env`, evaluacion zero-shot determinista):

| Tarea (`env_id`) | Musculos / Obs | Pasos de entorno | DreamerV3 (`size12m`) retorno | DreamerV3 resuelto | PPO (`mjlab`) retorno | PPO resuelto |
|---|---|---:|---:|---:|---:|---:|
| `myoElbowPose1D6MRandom-v0` | 6 / 9 | 36.864 | 735,71 ± 24,86 | 100,0 ± 0,0 % | 281,25 ± 121,26 | 75,0 ± 8,2 % |
| `myoElbowPose1D6MRandom-v0` (`--feature fatigue`) | 6 / 9 | 36.864 | 732,57 ± 18,91 | 100,0 ± 0,0 % | 226,56 ± 11,51 | 66,7 ± 2,4 % |
| `myoHandPoseRandom-v0` | 39 / 108 | 294.912 | -276,76 ± 15,28 (`best_ckpt`) | 0,0 ± 0,0 % | -300,81 ± 2,56 | 0,0 ± 0,0 % |
| `myoLegWalk-v0` | 80 / 403 | 196.608 | 231,43 ± 41,67 (`best_ckpt`) | 0,0 ± 0,0 % | 211,49 ± 15,11 | 0,0 ± 0,0 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- Inferencia ONNX: ejecutable en CPU con `onnxruntime`; el agente de aproximadamente 10M de parametros ocupa del orden de decenas de MB en memoria en precision nativa, muy por debajo de cualquier GPU de consumo (las cifras exactas de VRAM no se documentan).
- Inferencia TorchScript: `torch.jit.load` en CPU o GPU; requisitos de memoria equivalentes al checkpoint nativo.
- Fine-tuning: requiere el stack de DreamerV3 (`dreamerv3-train`) y, segun la model card, se entreno en una NVIDIA GeForce RTX 5090 con `mjlab` (MuJoCo Warp). No se especifican requisitos minimos de VRAM para reentrenamiento.
- GPU recomendadas: no disponible de forma explicita; por tamano del modelo, cualquier GPU consumer moderna (RTX 4090, RTX 5090) deberia ser suficiente para inferencia y, previsiblemente, para fine-tuning, aunque no se confirma en la documentacion.
- Opciones de despliegue: `onnxruntime` (ONNX), PyTorch (`torch.jit.load`), `dreamerv3-train` para reanudacion/afinamiento, y el verificador `myosuite.utils.export_onnx verify`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observaciones | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `maco018/myosuite-dreamerv3` (este) | DreamerV3 (world model) | aproximadamente 10M | 9 a 403 dimensiones de observacion segun tarea | Ver tabla de benchmarks (retorno 735,71 en codo; 231,43 en marcha) | Apache 2.0 | Hugging Face (ONNX, TorchScript, checkpoint nativo) |
| PPO de RSL-RL en `mjlab` (referencia de la model card) | RL model-free (PPO) | no disponible | mismas tareas MyoSuite | Retorno 281,25 en codo; 211,49 en marcha | no disponible | Registrado en `mjlab` (no se distribuyen pesos en este repo) |
| DreamerV3 original (`size12m`) | World model | aproximadamente 10M | no disponible | No evaluado en MyoSuite en la informacion disponible | MIT (licencia del proyecto original, no confirmada en esta ficha) | Repositorio oficial de DreamerV3 |

No se dispone de datos de otros agentes comparables especificos para MyoSuite en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito restringido: solo cubre cuatro configuraciones de tarea de MyoSuite; no generaliza a otros dominios ni a control fuera de la biomecanica simulada.
- Tasa de exito limitada en tareas complejas: `myoHandPoseRandom-v0` y `myoLegWalk-v0` presentan 0,0 % de resueltos tanto en DreamerV3 como en PPO, por lo que no deben presentarse como soluciones completas en esas tareas.
- Evaluacion exclusivamente en simulacion (MuJoCo/MyoSuite); el transfer a hardware real no esta validado ni documentado.
- Sin datos de sesgos, alucinacion o comportamiento fuera de distribucion: al no ser un modelo de lenguaje, las categorias habituales no aplican, pero tampoco se documenta robustez ante variaciones de morfologia o perturbaciones.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el repositorio tiene 0 descargas y 0 likes, sin senales de adopcion.
- El checkpoint nativo excluye `replay.pkl`, por lo que no es posible reanudar el entrenamiento exactamente desde el buffer de experiencias original.
- La firma ONNX con estado exige gestionar correctamente `deter`, `stoch`, `prevact` e `is_first` entre pasos; un uso incorrecto del estado recurrente degrada el comportamiento.
- No se documentan requisitos minimos de hardware para fine-tuning ni latencias de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maco018/myosuite-dreamerv3
- Pull request de MyoSuite asociada: https://github.com/MyoHub/myosuite/pull/903
- Repositorio MyoSuite: https://github.com/MyoHub/myosuite
- DreamerV3 (proyecto original): no disponible en la informacion proporcionada
- `mjlab` (MuJoCo Warp): no disponible en la informacion proporcionada
