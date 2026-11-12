# baiyu858/RoboAssemblyBench-plumbers-block-rl

## Resumen

RoboAssemblyBench-plumbers-block-rl es un repositorio de pesos de politica (checkpoints) para aprendizaje por refuerzo aplicado a una tarea concreta de ensamblaje roboticos: la insercion de la pieza `plumbers_block` en el entorno Fabrica, usando un brazo UR5e. Lo publica el usuario baiyu858 como complemento del proyecto de codigo abierto RoboAssemblyBench. No es un modelo de lenguaje ni un modelo fundacional generativo, sino un conjunto de tres politicas PPO entrenadas con aprendizaje por refuerzo residual que emiten acciones de correccion local sobre un controlador geometrico y de cumplimiento ya existente.

El modelo resuelve un problema muy especifico: automatizar las tres fases de insercion con contacto (pieza blanca `part_0`, primer pasador `part_1` y segundo pasador `part_4`) dentro de una receta de ensamblaje por etapas. Cada politica recibe un vector de observacion de 55 dimensiones del estado simulado y produce una accion de 6 dimensiones consistente en traslacion y rotacion residuales. El control de la cuarta pieza (morada, `part_3`) no es RL, sino servocontrol fisico.

Su relevancia es acotada pero clara para el nicho de robotica de manipulacion: publica pesos de referencia reproducibles para un benchmark de ensamblaje con contacto, con hashes SHA-256 y un script de descarga, y documenta de forma honesta que se trata de pesos de prueba no convergidos. La licencia MIT y el formato `policy.pt` (PyTorch) facilitan su reutilizacion dentro del ecosistema del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (PPO) con accion residual sobre controlador geometrico; red neuronal no especificada en detalle |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante nativo, `policy.pt`) |
| Idiomas soportados | zh, en (documentacion; el modelo no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | `policy.pt` (PyTorch, incluye modelo, optimizador y estado de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es una politica de aprendizaje por refuerzo entrenada con PPO (Proximal Policy Optimization) en modo residual. El agente no controla el robot de forma end-to-end: genera una correccion local (6 dimensiones: traslacion y angulo residual) que se compone con un controlador de guiado geometrico, control de cumplimiento, pinza real y protecciones de seguridad. La observacion es un vector de 55 dimensiones del estado simulado. El controlador es la version 3.

El entrenamiento se realizo en simulacion con Isaac Sim, dentro de la receta `fabrica_plumbers_block_ur5e_staged@rl`. Los tres checkpoints corresponden a segmentos de insercion distintos y acumulan 2.048 pasos de decision (pieza blanca `part_0`, formato `ur5e-part0-contact-ppo-v1`, cargado por compatibilidad via `core/rl/legacy.py`) y 4.096 pasos cada uno para los dos pasadores (`part_1` y `part_4`, formato `roboassemblybench-contact-insertion-ppo-v2`). Los checkpoints de los pasadores llevan protocolos de tarea independientes y no son intercambiables. El repositorio no ha reentrenado, convertido ni modificado los pesos; conserva el estado original del modelo, optimizador y entrenamiento para mantener la coherencia de hashes de la receta.

No se detalla la composicion del dataset (al ser RL en simulacion, la "experiencia" procede del propio entorno), ni si hubo RLHF o DPO (no aplica). La innovacion tecnica destacable es el esquema de RL residual sobre control clasico, que reduce el espacio de accion y hace viable el aprendizaje en tareas de contacto con tolerancias ajustadas.

## Capacidades

- Generacion de acciones de control residual para insercion con contacto en un brazo UR5e.
- Ejecucion de tres fases de insercion: pieza blanca (`part_0`), primer pasador (`part_1`) y segundo pasador (`part_4`).
- Trabajo coordinado con guiado geometrico, control de cumplimiento, pinza real y protecciones de seguridad.
- Integracion en una receta de ensamblaje por etapas con liberacion de pasadores, liberacion de brazo derecho, retorno a home y comprobacion final de estabilidad.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico ni capacidades multilingues en el sentido de modelos de lenguaje.
- No incluye vision, audio ni modo "thinking"; el modelo no procesa lenguaje natural.

## Casos de uso

- Reproduccion de experimentos de ensamblaje roboticos: descargar los tres checkpoints en las rutas esperadas por el codigo (`checkpoints/plumbers_block/*/policy.pt`) y ejecutar la receta `fabrica_plumbers_block_ur5e_staged@rl` para validar el flujo completo en Isaac Sim con seed y layout seed 4906.
- Investigacion en RL residual para tareas de contacto: usar estos pesos como punto de partida o referencia para estudiar como una politica residual de baja dimension complementa un controlador geometrico en inserciones con tolerancias de 15 mm y 50 grados.
- Benchmarking de pipelines de ensamblaje: emplear el script `validate_fabrica_canonical_ur5e.py` con grabacion de video en vivo para medir pasos fisicos, tiempo de simulacion y exito de la tarea bajo condiciones controladas.
- Verificacion de integridad de pesos en produccion de experimentos: utilizar `manifest.json`, `SHA256SUMS` y `download_weights.py` para asegurar que los checkpoints descargados coinciden con los originales antes de lanzar una ejecucion.
- Desarrollo de sistemas de control hibrido: integrar las politicas en un bucle que combine RL para correcciones locales con servocontrol fisico para la pieza morada (`part_3`), evaluando la robustez del esquema ante variaciones de layout.
- Docencia y divulgacion en robotica: demostrar de forma reproducible un caso de ensamblaje por etapas con RL residual, incluyendo las limitaciones documentadas (pesos de prueba, sin garantia de convergencia) como ejemplo de practica cientifica transparente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no es un modelo de lenguaje.

Los datos de validacion proporcionados por el autor son los siguientes:

| Metrica | Valor |
|---|---|
| Exito en validacion completa (seed/layout seed 4906) | `success=true` |
| Pasos fisicos de simulacion | 64.130 |
| Tiempo de simulacion | ~267,21 s |
| Tiempo real de ejecucion | ~60,32 min |
| Tolerancia pieza blanca (posicion / angulo) | 15 mm / 50 grados |
| Tolerancia inclinacion de pasadores | 5 grados |
| Confirmacion de estabilidad final | 30 pasos fisicos consecutivos |
| Exito local en exploracion aleatoria (entrenamiento) | `part_0`: 0/13; `part_1`: 2/5; `part_4`: 3/4 |

Estos conteos de exploracion son datos de entrenamiento, no tasas de exito de evaluacion. Los marcadores internos `benchmark_success=false` y `deployment_validated=false` se mantienen en los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una politica de baja dimension (observacion de 55 dimensiones, accion de 6), la huella de inferencia es minima, pero el requisito dominante es el simulador.
- GPU recomendadas: no especificadas por el autor; Isaac Sim requiere GPU compatible con RTX (por ejemplo, RTX 4090, A100, H100) segun la configuracion del entorno.
- Cabe en GPU de consumo: previsiblemente si para la politica, pero la simulacion completa con Isaac Sim condiciona el hardware; no se aportan cifras concretas.
- Opciones de despliegue: ejecucion via el repositorio RoboAssemblyBench con Isaac Sim y entorno Conda `internutopia311`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles; la validacion reporta ~60,32 minutos de ejecucion real para 64.130 pasos fisicos en el escenario probado.

## Comparativa con modelos similares

No disponible. No se han proporcionado en la informacion modelos comparables de la misma categoria (politicas RL residuales para ensamblaje UR5e en Fabrica/RoboAssemblyBench).

## Limitaciones y advertencias

- Pesos de prueba (trial weights): el autor indica explicitamente que no se ha demostrado convergencia ni generalizacion a layouts aleatorios.
- Los marcadores internos `benchmark_success=false` y `deployment_validated=false` permanecen en los checkpoints.
- El exito del flujo completo depende del sistema de control hibrido actualizado; no puede atribuirse unicamente a PPO.
- Un unico exito con seed/layout seed 4906 no equivale a una tasa de exito del 100 % del benchmark.
- Los checkpoints de los dos pasadores tienen protocolos de tarea independientes y no son intercambiables.
- El checkpoint de la pieza blanca usa un formato legacy (`ur5e-part0-contact-ppo-v1`) que requiere carga via `core/rl/legacy.py`.
- Los pesos no incluyen robot, escenas USD, mallas Fabrica, snapshot del punto de entrada de entrenamiento ni entorno de entrenamiento completo.
- Las tolerancias de aceptacion (15 mm / 50 grados para la pieza blanca; 5 grados para pasadores) no equivalen a una precision final de 1 mm / 1 grado en todas las piezas.
- Riesgo de alucinacion y sesgos: no aplica en el sentido de modelos de lenguaje; el riesgo es de sobreajuste al escenario y de fallo en condiciones no vistas.
- Licencia MIT para los checkpoints; las dependencias (Isaac Sim, activos de terceros) deben obtenerse bajo sus propias licencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/baiyu858/RoboAssemblyBench-plumbers-block-rl
- Codigo compatible (commit recomendado): https://github.com/baiyu858/RoboAssemblyBench/tree/9ce8cd93cf28bb9e33ac1218db2304239ebb7da6
- Repositorio de codigo RoboAssemblyBench: https://github.com/baiyu858/RoboAssemblyBench
