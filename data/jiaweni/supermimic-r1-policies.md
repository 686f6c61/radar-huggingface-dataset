# jiaweni/supermimic-r1-policies

## Resumen

SuperMimic policies for the Unitree R1 es una colección de políticas de control de cuerpo completo para el robot humanoide Unitree R1 (26 articulaciones), entrenadas con SuperMimic-R1, una reproducción del método *SuperMimic: Scaling Humanoid Whole-Body Control with One Differentiable World Model* (Liao et al., CoRL 2026). El autor es jiaweni y el repositorio aloja los pesos finales, checkpoints de entrenamiento, configuraciones y resultados de benchmark de cuatro ejecuciones de entrenamiento.

El modelo resuelve el problema de *motion tracking* y control locomotor en robótica humanoide: dado un conjunto de referencias de movimiento retargeteadas al R1, la política produce comandos articulares que reproducen dichos movimientos en simulación (IsaacLab 3.0.0 con Newton / MuJoCo-Warp). La ejecución `r1_bones_seed` se entrenó sobre 128.529 clips de BONES-SEED (260,8 horas de movimiento) y la `r1_lafan1_v5` sobre los 40 clips de LAFAN1, siendo esta última la política del bundle de despliegue en hardware.

Es relevante ahora porque demuestra escalado de control de cuerpo completo con un único modelo de mundo diferenciable, alcanzando retornos normalizados de 0,961 en el benchmark del Apéndice F con solo 33 fallos de 128.529 clips. El repositorio tiene 2,8 GB, 0 descargas y 1 like en el momento de la consulta, y su licencia es mixta, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control (reinforcement learning) entrenada con SuperMimic-R1; no se especifica la arquitectura de red de la política |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt`; exportación a ONNX vía `tools.deploy.export`) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | mixta (`license: other`, `license_name: mixed`); LAFAN1 bajo CC BY-NC-ND 4.0 y BONES-SEED bajo su propio acuerdo |
| Formato de pesos | PyTorch `.pt` (`policy_final.pt`, `ckpt_latest.pt`); exportación ONNX disponible |

## Arquitectura y entrenamiento

El repositorio contiene políticas entrenadas con SuperMimic-R1, una reproducción del método SuperMimic, que emplea un modelo de mundo diferenciable para escalar el control de cuerpo completo de humanoides. El entrenamiento se realizó en IsaacLab 3.0.0 en modo *kit-less* con Newton / MuJoCo-Warp, con autocolisiones activadas, ganancias y set-points oficiales de Unitree para el R1 recortados al rango articular. Cada ejecución se entrenó una sola vez desde cero en una única RTX 3090.

Las cuatro ejecuciones documentadas son: `r1_lafan1_v5` (motion tracking sobre los 40 clips de LAFAN1 retargeteados, 100.000 iteraciones, 10,2 h), `r1_bones_seed` (motion tracking sobre 128.529 clips de BONES-SEED retargeteados, 260,8 h de movimiento, 320.000 iteraciones, 36,9 h), `r1_loco` (interfaz de comandos de velocidad con 18 clips de locomoción de LAFAN1, 100.000 iteraciones, 10,4 h) y `r1_lafan1_v2` (sustituida por `r1_lafan1_v5`). El retargeting se realizó con GMR. No se detalla en la información disponible la composición exacta del dataset más allá de las fuentes LAFAN1 y BONES-SEED, ni si se emplearon técnicas de RLHF/DPO (no aplicables a este dominio).

## Capacidades

- Seguimiento de movimiento (*motion tracking*) de cuerpo completo en el Unitree R1 de 26 articulaciones a partir de clips retargeteados.
- Control locomotor mediante interfaz de comandos de velocidad (`r1_loco`), con un error relativo mediano de 0,049 en el *step test*.
- Recuperación ante empujones (*push recovery*), con resultados por clip en `r1_lafan1_v5/push_policy_final.json`.
- Evaluación y reproducción en simulación con `scripts/evaluate.py` y `scripts/play.py`.
- Exportación a ONNX para despliegue mediante `python -m tools.deploy.export`.
- Reanudación y ajuste fino a partir del estado completo de entrenamiento (`ckpt_latest.pt`: modelo de mundo, política, crítico, optimizadores, normalizadores y sampler).
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en control de humanoides: reproducir los resultados del paper SuperMimic sobre el R1 usando `r1_bones_seed/policy_final.pt` con 4.096 entornos en paralelo para validar el escalado del método.
- Desarrollo de *motion tracking* para animación robótica: emplear `r1_lafan1_v5` para reproducir clips concretos como `dance1_subject1` y comparar la fidelidad del seguimiento por clip.
- Despliegue en hardware del R1: usar la política `r1_lafan1_v5`, que es la del bundle de despliegue, exportándola a ONNX con `tools.deploy.export` para integrarla en el *stack* de control del robot.
- Navegación con comandos de velocidad: integrar `r1_loco` como interfaz de locomoción de bajo nivel que traduce comandos de velocidad en comandos articulares, con error mediano del 4,9 %.
- Ajuste fino con datos propios: partir de `ckpt_latest.pt` para reentrenar o especializar la política en nuevos conjuntos de movimientos retargeteados con GMR.
- Evaluación comparativa de políticas: utilizar `eval.csv` y los ficheros de benchmark por clip para comparar snapshots y cuantificar fallos por grupo de movimiento.
- Pruebas de robustez: analizar los resultados de *push recovery* para evaluar la estabilidad de la política ante perturbaciones externas antes de un despliegue real.

## Benchmarks y rendimiento

| Ejecucion | Tarea y datos | Iteraciones | Tiempo | Benchmark (Ap. F) |
|---|---|---|---|---|
| `r1_lafan1_v5` | Motion tracking, 40 clips LAFAN1 retargeteados | 100.000 | 10,2 h | 0,837 retorno normalizado; 0 de 40 fallos |
| `r1_bones_seed` | Motion tracking, 128.529 clips BONES-SEED (260,8 h) | 320.000 | 36,9 h | 0,961 retorno normalizado; 33 de 128.529 fallos |
| `r1_loco` | Interfaz de velocidad, 18 clips de locomoción LAFAN1 | 100.000 | 10,4 h | Error relativo mediano 0,049 en step test |
| `r1_lafan1_v2` | Sustituida por `r1_lafan1_v5` | 100.000 | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- Entrenamiento: una única RTX 3090 por ejecución, según la model card.
- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 2,8 GB, pero incluye checkpoints completos de entrenamiento y no refleja el tamaño de la política final.
- GPU recomendadas: RTX 3090 para entrenamiento; para inferencia no se especifica, aunque el despliegue en hardware del R1 sugiere requisitos moderados.
- Cabe en GPU de consumo: sí para entrenamiento (RTX 3090 documentada); para inferencia no se detalla.
- Opciones de despliegue: exportación a ONNX mediante `tools.deploy.export`; evaluación y reproducción con los scripts del repositorio SuperMimic-R1 (commit 852c921 o posterior). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este dominio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de control de cuerpo completo para el Unitree R1 ni resultados frente a otras políticas.

## Limitaciones y advertencias

- Licencia mixta: `r1_lafan1_v5`, `r1_loco` y `r1_lafan1_v2` se entrenaron con LAFAN1 (CC BY-NC-ND 4.0), lo que restringe su uso a investigación no comercial.
- `r1_bones_seed` se entrenó con datos de BONES-SEED, sujetos al acuerdo de licencia de BONES Motion Capture Dataset; su uso comercial requiere revisión legal específica.
- Los conjuntos de movimiento retargeteados no se distribuyen en el repositorio; para reproducir o evaluar hay que generarlos con `docs/DATA.md`.
- `r1_loco` se entrenó con un retarget de LAFAN1 anterior y sin recorte de set-points; su interfaz de velocidad es válida, pero su seguimiento de movimiento no coincide con las referencias actuales.
- `r1_lafan1_v2` está obsoleta y no debe usarse.
- Los resultados son de simulación (IsaacLab 3.0.0 con Newton / MuJoCo-Warp); el rendimiento en hardware real puede diferir.
- La ejecución `r1_bones_seed` presenta 33 clips fallidos de 128.529, concentrados en grupos de movimiento concretos según el resumen del benchmark.
- No se dispone de información sobre sesgos, alucinación o limitaciones idiomáticas por no ser un modelo de lenguaje.
- El repositorio tiene 0 descargas y 1 like, lo que indica validación comunitaria mínima.

## Enlaces

- Hugging Face: https://huggingface.co/jiaweni/supermimic-r1-policies
- Repositorio SuperMimic-R1: https://github.com/Jiaweeeeeen/SuperMimic-R1
- Paper SuperMimic (arXiv:2610.28480): https://arxiv.org/abs/2610.28480
- BONES Studio: https://bones.studio/
- GMR (retargeting): https://github.com/YanjieZe/GMR
