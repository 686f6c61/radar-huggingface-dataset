# andreu-collabs/hybrid-flow-planning-3blocks

## Resumen

El modelo `hybrid-flow-planning-3blocks` es un planificador híbrido para robótica desarrollado por el usuario `andreu-collabs`. Aborda el problema de *task-and-motion planning* (TAMP) mediante un único transformer que genera de forma conjunta un plan discreto (usando *masked discrete flow*) y una trayectoria continua del efector final (usando *continuous flow*), todo ello condicionado a una única observación de la escena en un límite de acción. La tarea concreta consiste en que una base Dingo con un brazo Kinova Lite apile tres cubos de colores (rojo sobre amarillo sobre verde) sobre una mesa cuadrada, a partir de 121 demostraciones reales.

El modelo se presenta en dos variantes de checkpoint: `baseline/` (observación estándar de 56 dimensiones y 17 tokens de observación, con objetivo fijo) y `perm-aug/` (aumentación por permutación de colores, con campos de objetivo por cubo, 77 dimensiones y 14 tokens de observación). Ambas variantes se entrenaron durante 20 000 pasos con semillas 42 y 44 respectivamente. El repositorio incluye el código necesario para evaluar y cargar los checkpoints, así como un `manifest.json` que permite ejecutar la política sin el dataset original. Su relevancia radica en la integración de flujos discretos y continuos en un único modelo, una aproximación poco común en la planificación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (genera plan discreto y trayectoria continua mediante flujos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa de PyTorch) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (archivos `step_20000_ema.pt`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer que procesa una observación de la escena (codificada como tokens) y produce simultáneamente dos salidas: una secuencia de tokens discretos que representan el plan simbólico (generada mediante *masked discrete flow*) y una trayectoria continua del efector final (generada mediante *continuous flow*). Esta combinación de flujos discretos y continuos en un único modelo es la principal innovación técnica, ya que evita la necesidad de pipelines separados para planificación y control.

El entrenamiento se realizó sobre 121 demostraciones reales de la tarea de apilado de tres cubos. Se utilizaron dos configuraciones: la `baseline` con observación estándar y objetivo fijo, y la `perm-aug` con aumentación de permutaciones de color y campos de objetivo por cubo. Ambas se entrenaron durante 20 000 pasos, con semillas 42 y 44 respectivamente. No se menciona el uso de RLHF, DPO u otras técnicas de refinamiento por preferencias. El dataset se empaqueta en formato HDF5 a partir de las demostraciones crudas, y el `manifest.json` guarda los detalles de normalización, vocabulario de tokens y argumentos de construcción del modelo y del entrenador.

## Capacidades

- Generación conjunta de un plan simbólico (secuencia de tokens discretos) y una trayectoria continua del efector final (posición, orientación en rot6d, estado del gripper y base móvil).
- Condicionamiento por observación de la escena en un único instante (límite de acción), sin necesidad de historial completo.
- Ejecución de la política en un proxy cinemático de MuJoCo para verificar la validez del plan.
- Seguimiento de objetivos explícitos: la variante `perm-aug` puede construir cualquiera de los seis órdenes posibles de la torre (rojo, amarillo, verde) según el campo de objetivo proporcionado.
- Soporte para evaluación con múltiples semillas y generación de vídeos comparativos entre demostración y política.
- Capacidad de carga del modelo sin dataset mediante `manifest.json`, lo que permite su despliegue en entornos de producción robótica.

## Casos de uso

- **Planificación de tareas de apilado en robótica**: el modelo puede generar planes simbólicos y trayectorias para apilar objetos en un orden específico, útil en líneas de montaje o almacenes automatizados.
- **Investigación en task-and-motion planning**: sirve como punto de partida para estudiar la integración de flujos discretos y continuos en un único transformer, comparando con enfoques modulares tradicionales.
- **Desarrollo de políticas robóticas con demostración**: al entrenarse con demostraciones reales, puede utilizarse para transferir habilidades de manipulación a nuevos escenarios con aumentación de permutaciones.
- **Simulación y validación en MuJoCo**: el proxy cinemático integrado permite probar la validez de los planes en simulación antes de desplegar en el robot real, reduciendo riesgos y costes.
- **Generación de datos sintéticos para entrenamiento**: las evaluaciones con múltiples semillas y permutaciones pueden generar variaciones de la tarea que sirvan para aumentar otros datasets.
- **Benchmarking de algoritmos de planificación híbrida**: las métricas reportadas (plan válido y plan válido + proxy) ofrecen una referencia reproducible para comparar futuros modelos de TAMP.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), ya que se trata de un modelo de robótica, no de lenguaje. La model card reporta métricas específicas de la tarea sobre tres demostraciones reservadas (`ep_01..ep_03`, 8 acciones cada una, 50 muestras por inicio de chunk). Los resultados son los siguientes:

| Configuración | Plan válido | Plan válido + proxy |
|---|---|---|
| `baseline/` (seed 42) | 0.88 | 0.65 |
| `perm-aug/` (seed 44) | 0.93 | 0.38 |

Las medias de tres semillas son 0.90 / 0.63 para `baseline` y 0.83 / 0.27 para `perm-aug`. El modelo `perm-aug` además sigue la entrada de objetivo y puede construir cualquiera de los seis órdenes de torre, según se documenta en `perm-aug/eval_allperms/summary.md`.

## Requisitos de hardware

- **VRAM estimada**: no disponible en la información proporcionada. El tamaño del repositorio es de 0.1 GB, lo que sugiere un modelo pequeño, pero no se especifican requisitos de memoria.
- **GPU recomendadas**: no disponible. Dado el tamaño reducido, es probable que quepa en GPUs de consumo como una RTX 3060 o superior, pero no hay datos confirmados.
- **Opciones de despliegue**: el modelo se carga mediante PyTorch y el repositorio `hybrid-flow-planning`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible. La evaluación se realiza con 50 muestras por inicio de chunk, pero no se reportan tiempos de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (planificación híbrida con flujos discretos y continuos). La model card no menciona alternativas ni benchmarks comparativos. Por tanto, esta sección queda como "no disponible".

## Limitaciones y advertencias

- **Especificidad de la tarea**: el modelo está entrenado únicamente para la tarea de apilar tres cubos de colores específicos sobre una mesa cuadrada. No es generalizable a otras tareas de manipulación sin reentrenamiento.
- **Dependencia de demostraciones**: el rendimiento depende de la calidad y variedad de las 121 demostraciones reales; la variante `perm-aug` muestra menor éxito con el proxy cinemático (0.38 frente a 0.65 de `baseline`), lo que sugiere que la aumentación por permutación puede degradar la ejecución física.
- **Riesgo de alucinación**: al ser un modelo generativo de planes, puede producir planes simbólicos inválidos (no equivalentes al plan de la demostración bajo el modelo de mundo simbólico). Las métricas de "plan válido" indican que esto ocurre en aproximadamente el 10-17% de los casos.
- **Sin soporte de lenguaje natural**: no es un modelo de lenguaje; no procesa texto ni instrucciones verbales.
- **Licencia MIT**: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el funcionamiento en entornos de producción.
- **Falta de documentación sobre sesgos**: no se han reportado análisis de sesgos o comportamientos no deseados más allá de las métricas de validez.

## Enlaces

- [HuggingFace: andreu-collabs/hybrid-flow-planning-3blocks](https://huggingface.co/andreu-collabs/hybrid-flow-planning-3blocks)

No se han encontrado otros enlaces relevantes (papers, blogs, repositorios adicionales) en la búsqueda web. El código fuente se menciona como el repositorio `hybrid-flow-planning`, pero no se proporciona una URL directa en la información disponible.
