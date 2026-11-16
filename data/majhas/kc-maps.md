# majhas/kc-maps

## Resumen

KC-maps (Kolmogorov-Chapman Maps) es un conjunto de checkpoints y datos asociados al trabajo "Kolmogorov-Chapman Maps: Trajectory-Free Learning for Simulating Molecular Dynamics", desarrollado por Majdi Hassan, Marta Skreta, Dominique Beaini y Kirill Neklyudov. No es un modelo de lenguaje: es un modelo generativo de dinámica molecular basado en normalizing flows implementado en JAX, entrenado para simular la evolución temporal de peptidos (dialanina, tetrapeptido y hexapeptido) sin necesidad de integrar paso a paso las ecuaciones de movimiento.

La propuesta central es aprender directamente el mapa de Kolmogorov-Chapman, es decir, la transicion entre distribuciones del estado del sistema a intervalos de tiempo finitos (τ). Esto permite generar trayectorias moleculares de forma paralela y sin integrador, en lugar de la simulacion MD clasica secuencial. El repositorio publica tres checkpoints (`al2`, `al4`, `al6`), datos de MD de referencia generados con OpenMM, las trayectorias generadas evaluadas en el paper y los indices de los splits de entrenamiento.

El modelo es relevante para la comunidad de simulacion molecular y drug discovery porque aborda el coste computacional de la dinamica molecular: segun la model card, cada trayectoria generada se produjo en una GPU-hora sobre una NVIDIA L40S, frente a las decenas de microsegundos de MD de referencia. El repo ocupa 6,4 GB y se distribuye con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Normalizing flows sobre mapas de Kolmogorov-Chapman (implementado en JAX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de dinamica molecular, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | checkpoints JAX (no se especifica formato adicional) |

## Arquitectura y entrenamiento

KC-maps aprende el mapa de transicion de Kolmogorov-Chapman: dada la distribucion del estado molecular en un instante, produce la distribucion en un instante posterior separado por un intervalo τ. La implementacion se basa en normalizing flows en JAX, lo que permite evaluar densidades y muestrear de forma paralela sobre multiples cadenas. El modelo se entrena de forma "trajectory-free", es decir, sin requerir trayectorias MD completas como supervision directa, segun el titulo del paper.

Los datos de referencia se generaron con OpenMM usando `LangevinMiddleIntegrator` con paso de 1 fs y guardado cada 1 ps: 33 µs para AL2 (dialanina), 33,5 µs para AL4 (tetrapeptido) y 32 µs para AL6 (hexapeptido). El repositorio incluye features de MD de referencia (energia, torsiones de backbone, coordenadas TICA), las trayectorias generadas y los indices de los splits de entrenamiento. No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset de entrenamiento ni si se emplearon tecnicas de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Generacion de trayectorias de dinamica molecular para peptidos sin integrador numerico, mediante muestreo paralelo de multiples cadenas.
- Modelado de la transicion entre distribuciones de estados a intervalos τ configurables (τ = 30 fs para AL2 y AL6, τ = 40 fs para AL4 en las ejecuciones publicadas).
- Soporte de multiples cadenas en paralelo (16 cadenas en AL2 y AL6, 8 en AL4 en las configuraciones evaluadas).
- Evaluacion de densidades y muestreo mediante normalizing flows.
- Compatibilidad con el ecosistema JAX para entrenamiento e inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Simulacion acelerada de peptidos pequenos: generar trayectorias de dialanina o hexapeptido en una GPU-hora sobre una L40S, en lugar de ejecutar microsegundos de MD con OpenMM, para exploracion rapida de conformaciones.
- Generacion de ensembles conformacionales: muestrear multiples cadenas en paralelo (16 cadenas) para estimar distribuciones de estados y propiedades termodinamicas de peptidos.
- Benchmarking de metodos generativos de MD: el repo incluye trayectorias de referencia MD, de KC-maps y de HFM (FLOP-matched) bajo las mismas condiciones de inicio, lo que permite comparaciones controladas.
- Reproducibilidad de investigacion: los splits de entrenamiento y los datos de referencia permiten reentrenar o validar los checkpoints publicados.
- Prototipado de flujos normalizantes en JAX para dinamica molecular: el codigo en `github.com/majhas/kc-maps` sirve como base para extender el metodo a otras moleculas.
- Estudio de intervalos de transicion τ: comparar el efecto de distintos τ (30 fs, 40 fs) sobre la fidelidad de las trayectorias generadas frente a MD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card describe las condiciones de ejecucion (una GPU-hora en una NVIDIA L40S con 4 nucleos de CPU, compilacion e inicializacion excluidas) y las trayectorias evaluadas en el paper, pero no incluye tablas de metricas (por ejemplo, errores en distribuciones de torsiones o coordenadas TICA) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU utilizadas en las ejecuciones publicadas: NVIDIA L40S (una GPU-hora por trayectoria, con 4 nucleos de CPU, excluyendo compilacion e inicializacion).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el paquete `kcmaps` en Python sobre JAX; comandos `python -m kcmaps.simulate` y `python -m kcmaps.evaluate` segun la model card.
- Latencia y throughput: una GPU-hora por ejecucion de trayectoria en L40S para las configuraciones publicadas (τ y numero de cadenas indicados en la tabla de trayectorias generadas).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KC-maps (este) | Normalizing flow para MD | no disponible | no aplica | MIT | Hugging Face + GitHub |
| HFM (referencia en el paper) | Modelo generativo de MD | no disponible | no aplica | no disponible | Checkpoints HFM referenciados en la model card |
| MD clasica (OpenMM) | Integrador numerico | no aplica | no aplica | no aplica | OpenMM |

La model card incluye ejecuciones comparativas de HFM (con checkpoint publicado y con checkpoint FLOP-matched) frente a KC-maps y MD, lo que permite una comparacion controlada en el paper. No se dispone de datos de rendimiento numerico en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta limitado a los peptidos evaluados (dialanina, tetrapeptido y hexapeptido); no se documenta generalizacion a otras moleculas.
- El intervalo τ es un hiperparametro critico: las ejecuciones publicadas usan τ = 30 fs o 40 fs, y no se detalla el rango valido fuera de esos valores.
- No es un modelo de lenguaje: no admite prompts, tool calling ni tareas de texto.
- No se dispone de informacion sobre sesgos, tasas de alucinacion (no aplicable en el sentido habitual) ni robustez fuera de las condiciones de entrenamiento.
- La licencia MIT permite uso comercial, pero el autor no documenta garantias ni soporte.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- Los requisitos de VRAM no estan documentados; el despliegue se ha validado solo en L40S.

## Enlaces

- Hugging Face: https://huggingface.co/majhas/kc-maps
- Paper (arXiv): https://arxiv.org/abs/2611.12880
- Codigo: https://github.com/majhas/kc-maps
