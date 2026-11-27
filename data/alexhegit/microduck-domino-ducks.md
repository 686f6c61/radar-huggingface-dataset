# alexhegit/microduck-domino-ducks

## Resumen

`alexhegit/microduck-domino-ducks` es una politica de control para robot caminante de la familia Microduck, publicada en Hugging Face como entrada al evento `got-a-talent` de la Microduck Arena. No es un modelo de lenguaje ni un transformer generativo: es una politica neuronal entrenada con PPO (Proximal Policy Optimization) en el simulador MuJoCo, exportada en formato ONNX, que mapea 61 observaciones a 14 consignas de posicion articular a 50 Hz. El autor es `alexhegit` y el repositorio tiene un tamano de 0.0 GB (pesos muy ligeros, propios de un controlador de robot de pequeno tamano).

El modelo resuelve un problema de locomocion y expresividad motora: ejecutar una coreografia concreta ("domino ducks") en la que tres patos se enroscan y ruedan de lado en cascada, flanqueada por volteretas hacia delante, sentarse-levantarse y un caminante. La relevancia es acotada: se trata de una politica de robotica de proposito especifico para una competicion, no de un modelo de uso general.

La ficha se limita a lo que declara la model card y los metadatos del repositorio. No se publican parametros, arquitectura de red, dataset de entrenamiento ni resultados de benchmarks, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | red neuronal de politica (detalles no disponibles); observaciones 61 -> acciones 14 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; exportado en ONNX |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Frecuencia de control | 50 Hz |
| Entrada / salida | 61 observaciones / 14 objetivos de posicion articular |
| Entrenamiento | PPO sobre MuJoCo (microduck_rl_unilab) en GPU AMD ROCm |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La model card no describe la topologia de la red (numero de capas, unidades, activaciones). Lo que si se declara es el contrato de entrada/salida: 61 observaciones de entrada y 14 objetivos de posicion articular de salida, ejecutados a 50 Hz. El entrenamiento se realizo con PPO en el simulador MuJoCo, usando el framework `microduck_rl_unilab` del proyecto rocPAI-Forge, sobre una GPU AMD con ROCm. No se especifican numero de pasos de entrenamiento, recompensas, terminos de shaping ni proceso de sim-to-real.

El resultado se exporta a ONNX, lo que indica una intencion de despliegue ligero e independiente del framework de entrenamiento. No hay informacion sobre regularizacion, domain randomization ni validacion en hardware real.

## Capacidades

- Control de locomocion de un robot caminante Microduck a 50 Hz.
- Ejecucion de una coreografia especifica: tres patos que se enroscan y ruedan de lado en cascada ("domino ducks").
- Habilidades complementarias declaradas: volteretas hacia delante, sentarse-levantarse y caminar.
- Interfaz de politica pura: observaciones -> consignas articulares, sin tool calling, agentes ni razonamiento multi-paso.
- Sin capacidades de lenguaje, vision, audio ni generacion de texto.
- Sin soporte multilingue (no aplica).

## Casos de uso

- Demostracion en la Microduck Arena: el caso de uso directo es participar en el evento `got-a-talent` con la coreografia "domino ducks", cargando el ONNX en el entorno de la arena.
- Investigacion en aprendizaje por refuerzo: servir de referencia reproducible de un pipeline PPO + MuJoCo + ROCm para entrenar politicas de robot caminante de bajo coste.
- Benchmark de sim-to-real: probar la transferencia de una politica entrenada en simulacion a un Microduck fisico y medir degradacion de la coreografia.
- Educacion y divulgacion en robotica: ejemplo didactico de como una politica de 61->14 puede producir comportamientos expresivos coordinados entre varios robots.
- Pruebas de despliegue ONNX en hardware embebido: validar latencia e inferencia a 50 Hz en CPU o aceleradores ligeros.
- Base para composicion de habilidades: reutilizar los modulos de voltereta, sentarse-levantarse y caminar como subpoliticas en coreografias mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB, compatible con inferencia en CPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizo en GPU AMD con ROCm, pero el despliegue ONNX no exige una GPU concreta.
- Cabe en cualquier GPU consumer y previsiblemente en CPU embebida, dado el tamano minimo del artefacto.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), o cualquier runtime compatible con ONNX; integracion con el stack de la Microduck Arena.
- Latencia y throughput: no disponibles; el unico requisito declarado es operar a 50 Hz.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada otras politicas comparables de la misma categoria con datos de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Politica de proposito especifico: la coreografia "domino ducks" esta entrenada para un escenario concreto; no se garantiza generalizacion a otras tareas.
- Ausencia de datos de sim-to-real: no se declara validacion en hardware fisico, por lo que el rendimiento real puede diferir del simulado.
- Sin informacion sobre sesgos, alucinacion ni comportamiento fuera de distribucion; al no ser un modelo de lenguaje, esos riesgos no aplican en su forma habitual, pero si el riesgo de fallo de politica ante observaciones no vistas.
- Sin datos de parametros, arquitectura ni dataset: dificil de auditar o reproducir sin consultar el repositorio de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y aviso de cambios; no se declaran restricciones adicionales.
- Documentacion minima: la model card no detalla el contrato exacto de las 61 observaciones ni de las 14 salidas, lo que exige revisar el codigo de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexhegit/microduck-domino-ducks
- Microduck Arena (Space): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio de entrenamiento microduck_rl_unilab: https://github.com/rocPAI-Forge/microduck_rl_unilab
