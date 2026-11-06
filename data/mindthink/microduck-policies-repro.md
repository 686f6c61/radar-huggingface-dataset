# mindthink/microduck-policies-repro

## Resumen

`mindthink/microduck-policies-repro` es un conjunto de políticas de locomocion para el robot cuadrupedo Microduck de Pollen Robotics, entrenadas mediante refuerzo (reinforcement learning) y empaquetadas en formato ONNX para su despliegue en simulacion. El autor, `mindthink`, reproduce de forma independiente las recetas oficiales de entrenamiento del repositorio `microduck_rl` (commit `bae39f5`) y publica los checkpoints resultantes junto con los ficheros de configuracion de entorno y agente. No es una release oficial de Pollen Robotics: el codigo de entrenamiento, la descripcion del robot y los checkpoints maestros pertenecen a `pollen-robotics/microduck-training`.

El modelo base es `pollen-robotics/microduck-training`, sobre el que se aplica un calentamiento (warm start) desde el bundle publico de velocidad. El entrenamiento se realiza en MuJoCo (via `mjlab`) con 4096 entornos paralelos y hasta 4000 iteraciones para el profesor de marcha, y 3000 iteraciones para la politica combinada velstand (marcha, mantenerse de pie y levantarse). Se incluye un parche (`velstand-slowwalk.patch`) que corrige el problema de comandos de velocidad baja y que constituye la aportacion tecnica principal de esta reproduccion.

La relevancia de esta ficha es doble: por un lado, ofrece una comparativa cuantitativa en simulacion entre la version oficial v8 y las reproducciones independientes, con metricas de fallo en levantamiento y deriva de rumbo; por otro, documenta abiertamente las limitaciones (ninguna politica alcanza la velocidad comandada, deriva lateral a 0.2-0.3 m/s y ninguna camina a 0.10 m/s). Todo el material es Apache-2.0, aunque las mallas 3D del robot no se incluyen por estar bajo CC BY-NC-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de refuerzo (red neuronal) exportada a ONNX; entrenada con `rsl_rl` sobre `mjlab` (MuJoCo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX y checkpoint `.pt` sin cuantizar) |
| Idiomas soportados | no aplica (politica de control robotico) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`) y checkpoint `rsl_rl` (`.pt`); configuracion en `env.yaml` y `agent.yaml` |

## Arquitectura y entrenamiento

La politica es una red neuronal de control entrenada por refuerzo con el algoritmo de `rsl_rl` (PPO) sobre el simulador MuJoCo a traves del framework `mjlab`. El pipeline de entrenamiento consta de dos fases: un profesor de marcha (`Mjlab-Velocity-Flat-MicroDuck`, 4096 entornos, 4000 iteraciones) y una politica combinada velstand (`Mjlab-VelStand-Rough-Backlash-MicroDuck`, 3000 iteraciones) que integra marcha, mantenimiento de postura y levantamiento tras caida. La politica velstand se inicializa mediante warm start (`MICRODUCK_WARM_START=1`) desde el bundle publico `pollen-robotics/microduck-training/bundles/velocity2/441tzs6d_3750`, y tanto el profesor de pie como el ancla de marcha se toman de los bundles publicos.

La innovacion principal documentada es el parche `velstand-slowwalk.patch`, que aborda el fallo de comandos de velocidad baja. El problema es que con la recompensa estandar de seguimiento frontal (2·exp(−err²/0.1)), quedarse quieto ante un comando de 0.15 m/s puntua 1.60, mientras que caminar a 0.08 m/s puntua 1.90; ademas, el ancla de clonacion de comportamiento tambien se queda quieta a 0.15 m/s, de modo que el estudiante hereda ese umbral de arranque. El parche introduce dos cambios: (1) un remapeo de comando frontal para comandos pequenos (0.10 → 0.22 y 0.15 → 0.25 m/s), espejo del `anchor_yaw_remap` oficial para giro, y (2) una recompensa estrecha de seguimiento frontal `track_lin_fine` (std 0.12, peso 2.0). El entrenamiento posterior aplica 1000 iteraciones adicionales desde la iteracion 2999 hasta la 3998.

## Capacidades

- Locomocion cuadrupeda: marcha hacia delante con comandos de velocidad, con seguimiento parcial del comando (40-60 % de la velocidad solicitada en todos los casos).
- Mantenimiento de postura (stand): mantiene el tronco erguido ante perturbaciones laterales.
- Levantamiento tras caida (get-up): recupera la verticalidad desde posiciones boca arriba, boca abajo y de lado, con articulaciones en posicion por defecto o aleatoria.
- Robustez ante perturbaciones: soporta patadas laterales de 0.8-1.2 m/s mientras esta de pie o caminando.
- Exportacion a ONNX para inferencia en el simulador oficial de CPU con modelo de servo BAM.
- Incluye scripts de evaluacion (`eval/`) y el parche de entrenamiento reproducible.
- No soporta tool calling, agentes, vision, audio ni capacidades linguisticas: es una politica de control motor.

## Casos de uso

- Validacion de recetas de entrenamiento RL: el conjunto permite reproducir y comparar el pipeline oficial de `microduck_rl` frente a variantes propias, con scripts de evaluacion incluidos para medir fallos de levantamiento y deriva de rumbo.
- Investigacion en locomocion de bajo coste: util para estudiar el problema del umbral de arranque a velocidades bajas y el diseno de recompensas de seguimiento fino, documentado en el parche `velstand-slowwalk`.
- Desarrollo de control en bucle cerrado: dado que la politica 3750 deriva a la derecha (~0.2 rad/s a 0.2-0.3 m/s), sirve como banco de pruebas para disenar controladores de rumbo que compensen la deriva antes de desplegar en hardware.
- Benchmarking de robustez: la bateria de 9 familias × 40 ensayos (caidas, orientaciones aleatorias, patadas) proporciona una metodologia replicable para comparar politicas de levantamiento y recuperacion.
- Simulacion previa al despliegue fisico: al ejecutarse en el simulador oficial de CPU con modelo de servo BAM, permite iterar sobre politicas sin riesgo para el robot real.
- Docencia y formacion en RL robotico: el repositorio incluye configuraciones (`env.yaml`, `agent.yaml`), checkpoints y parches que facilitan entender el flujo completo de entrenamiento con `mjlab` y `rsl_rl`.
- Comparacion de politicas ONNX en pipelines de inferencia: la exportacion ONNX permite integrar la politica en entornos de simulacion o frameworks de inferencia estandar sin depender de PyTorch.

## Benchmarks y rendimiento

Resultados en simulacion (`scene_backlash.xml`, modelo de servo BAM). Marcha recta: 10 arranques aleatorios por comando, 20 s cada uno; la velocidad es a lo largo del rumbo del cuerpo y el yaw es la deriva media.

| Politica | Comando 0.15 m/s | 0.3 m/s: velocidad / deriva de yaw |
|---|---|---|
| velstand v8 oficial | no camina en 4 de 10 ensayos | 0.117 m/s / +0.02 rad/s |
| velstand-2999 | no camina en 9 de 10 ensayos | 0.124 m/s / −0.04 rad/s |
| velstand-slowwalk-3750 | camina en 10 de 10, ~0.07 m/s | 0.145 m/s / −0.26 rad/s |
| velstand-slowwalk-3998 | camina en 10 de 10, ~0.07 m/s | 0.116 m/s / +0.02 rad/s |

Bateria de levantamiento y empuje: 9 familias × 40 ensayos (boca arriba, boca abajo y de lado, con articulaciones por defecto o aleatorias; orientacion aleatoria dejada caer desde 12 cm; patada lateral de 0.8-1.2 m/s estando de pie o caminando). Un ensayo falla si el tronco no esta a menos de 20° de la vertical al final de una ventana de 10 s.

| Politica | Fallos / 360 | Tiempo de levantamiento, mediana |
|---|---|---|
| velstand v8 oficial | 4 | 0.62 s |
| velstand-2999 | 4 | 0.54 s |
| velstand-slowwalk-3750 | 0 | 0.74 s |
| velstand-slowwalk-3998 | 12 (todos aun atascados tras 20 s) | 0.78 s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una politica de control de red pequena exportada a ONNX, la huella de memoria es reducida en comparacion con modelos de lenguaje, pero no se publican cifras concretas.
- GPU recomendadas: no disponible; el autor ejecuta la inferencia en el simulador oficial de CPU (modelo de servo BAM), por lo que no se requiere GPU.
- Cabe en GPU consumer: no se especifica; la ejecucion documentada es en CPU.
- Opciones de despliegue: script oficial `scripts/infer_policy.py` del repositorio `microduck_rl` con `uv`, usando ONNX Runtime; checkpoints `.pt` para `rsl_rl`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mindthink/microduck-policies-repro | no disponible | no aplica | 0 fallos/360 en levantamiento (3750); deriva −0.26 rad/s a 0.3 m/s | Apache-2.0 | Hugging Face |
| pollen-robotics/microduck-training | no disponible | no aplica | v8 oficial: 4 fallos/360; 0.117 m/s a comando 0.3 m/s | Apache-2.0 (mallas CC BY-NC-SA 4.0) | Hugging Face |
| microduck_rl (repositorio oficial) | no disponible | no aplica | recetas oficiales de entrenamiento | Apache-2.0 | GitHub |

La comparacion directa con otros conjuntos de politicas cuadrupedas de terceros no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Deriva de rumbo: la politica 3750 deriva a la derecha a 0.2-0.3 m/s (~0.2 rad/s, ±0.01 sobre 10 arranques); en simulacion se corrige con un contracomando de +0.25 rad/s a 0.3 m/s sin perdida de velocidad, pero requiere control de rumbo en bucle cerrado en un robot real.
- Ninguna politica camina ante un comando de 0.10 m/s; la causa no se conoce.
- La velocidad frontal alcanzada es del 40-60 % del comando en todas las politicas, incluidas las oficiales.
- La politica 3998 se atasca tras una caida en 12 de 360 ensayos (todos aun atascados tras 20 s), por lo que no se recomienda como opcion principal.
- Todos los resultados son de simulacion: ninguna politica ha sido ejecutada en hardware.
- No es una release oficial de Pollen Robotics; el autor no garantiza soporte ni mantenimiento.
- Las mallas 3D del Microduck en `microduck_rl` estan bajo CC BY-NC-SA 4.0 y no se incluyen en este repositorio, lo que limita su uso comercial conjunto con las mallas.
- No se han publicado datos sobre sesgos, alucinacion o comportamiento fuera de simulacion, al no tratarse de un modelo generativo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mindthink/microduck-policies-repro
- Modelo base: https://huggingface.co/pollen-robotics/microduck-training
- Repositorio oficial `microduck_rl`: https://github.com/pollen-robotics/microduck_rl
- Commit de referencia: `bae39f5` (repositorio `microduck_rl`)
