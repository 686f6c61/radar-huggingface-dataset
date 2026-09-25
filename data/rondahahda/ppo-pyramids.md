# rondahahda/ppo-Pyramids

## Resumen

`rondahahda/ppo-Pyramids` es una politica de aprendizaje por refuerzo (RL) entrenada con el algoritmo PPO sobre el entorno Pyramids de Unity ML-Agents. No es un modelo de lenguaje ni un modelo fundacional: se trata de un agente pequeno que aprende a navegar en un escenario 3D simulado, exportado como politica ONNX para su inferencia dentro del motor Unity. El autor lo describe explicitamente como un modelo de curso introductorio, "not a fully converged policy".

El entrenamiento se realizo desde cero durante 63.991 pasos en Google Colab, con asistencia de codigo de Codex. El repositorio incluye el fichero ONNX evaluado, los ficheros de configuracion (`configuration.yaml`, `config.json`), un checkpoint en PyTorch (`checkpoint.pt`) para continuar el entrenamiento y un registro de ejecucion (`training.log`).

La relevancia de esta ficha es acotada: se trata de un artefacto educativo y de bajo rendimiento. Su metrica declarada de recompensa media es de -0.9999999310821295 con desviacion estandar 0.0 sobre 20 episodios, lo que indica que la politica no ha aprendido una conducta util en el entorno. Su interes practico es servir como referencia reproducible de un flujo completo de ML-Agents (entrenamiento, exportacion a ONNX y evaluacion), no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de RL entrenada con PPO (Unity ML-Agents); topologia de red no especificada en el repositorio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada vectorial de observaciones) |
| Tipos de cuantizacion | no disponible; se distribuye un fichero ONNX sin indicacion de cuantizacion |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (politica evaluada) y PyTorch `checkpoint.pt`; configuracion en `configuration.yaml` y `config.json` |
| Entorno de entrenamiento | Unity ML-Agents, entorno Pyramids |
| Pasos de entrenamiento | 63.991 |
| Framework / libreria | ml-agents (Unity ML-Agents) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una politica PPO (Proximal Policy Optimization) generada por el toolkit Unity ML-Agents. La model card no detalla la topologia de la red, el numero de parametros ni la dimension de la observacion. Fuentes externas que replican el mismo entorno (por ejemplo, la adaptacion a NPU publicada en AtomGit) describen una politica de navegacion con un perceptron multicapa de dos capas de 512 unidades y una observacion vectorial de 172 dimensiones compuesta por percepcion por raycast mas un vector one-hot que senala el objetivo. Esta descripcion es coherente con el escenario Pyramids, pero no esta confirmada en el repositorio de `rondahahda` y debe tratarse como referencia externa, no como especificacion oficial.

El entrenamiento se realizo desde cero durante 63.991 pasos, una cifra muy baja para este tipo de entornos, lo que explica el resultado obtenido. No se documenta el uso de RLHF, DPO ni tecnicas de ajuste posteriores: en RL clasico el aprendizaje procede directamente de la senal de recompensa del entorno. Tampoco se indica la composicion del dataset, porque no existe tal dataset: el agente aprende por interaccion con el simulador. La evaluacion se hizo con la politica ONNX exportada, acciones deterministas, 20 episodios completados y semilla 12345.

## Capacidades

- Navegacion en el entorno Pyramids de Unity ML-Agents: el agente esta disenado para operar en ese escenario concreto y sus observaciones asociadas.
- Inferencia como politica ONNX: el fichero exportado puede cargarse y ejecutarse sin depender del proceso de entrenamiento.
- Continuacion del entrenamiento: el `checkpoint.pt` permite reanudar el aprendizaje desde el estado guardado.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No dispone de modo de pensamiento (thinking mode), vision ni audio como capacidades declaradas del modelo.

## Casos de uso

- Material didactico para cursos de RL: el repositorio documenta un flujo completo (entrenamiento con ML-Agents, exportacion a ONNX, evaluacion con semilla fija) y sirve para que un estudiante reproduzca el pipeline de principio a fin.
- Punto de partida para reentrenamiento: el `checkpoint.pt` permite cargar el estado y continuar el entrenamiento con mas pasos o hiperparametros distintos, dado que la politica declarada no ha convergido.
- Verificacion de integracion ONNX en Unity: util para comprobar que una politica exportada se carga y ejecuta correctamente en el runtime de inferencia de ML-Agents (Barracuda/Sentis) antes de invertir en entrenamientos largos.
- Prueba de humo de infraestructura de entrenamiento: sirve para validar que el entorno, la version de ml-agents y el hardware (por ejemplo, Colab) funcionan correctamente con una carga de trabajo pequena.
- Referencia comparativa de bajo rendimiento: su recompensa media de -0.9999999310821295 sobre 20 episodios permite contrastar mejoras frente a variantes como `DitDahDitDit/ppo-PyramidsRND` o entrenamientos mas largos.
- Benchmark minimo de latencia de inferencia: al ser una politica pequena exportada a ONNX, permite medir el coste de invocar la red por paso de simulacion en CPU, util para dimensionar despliegues de ML-Agents en entornos sin GPU.
- Base para pruebas de portabilidad entre backends: la existencia de adaptaciones del mismo entorno a NPU (Ascend) sugiere su uso como caso de prueba para trasladar politicas ONNX entre plataformas de inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. La metrica no esta verificada (`verified: false`).

| Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Reinforcement Learning | ML-Agents-Pyramids | mean_reward | -0.9999999310821295 +/- 0.0 | No |

Condiciones de evaluacion declaradas: politica ONNX exportada, acciones deterministas, 20 episodios completados, semilla 12345. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y en cualquier caso no serian aplicables a un modelo de esta naturaleza.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por el tipo de modelo (politica de RL de reducido tamano) es plausible su ejecucion integra en CPU, sin VRAM dedicada, aunque el repositorio no publica cifras.
- GPU recomendadas: no se especifican. Al tratarse de una politica exportada a ONNX, cualquier GPU compatible con ONNX Runtime o con el backend de Unity serviria; no hay requisitos publicados.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el reducido tamano de una politica PPO tipica para ML-Agents. No confirmado por el autor.
- Opciones de despliegue: Unity ML-Agents (runtime de inferencia para el fichero ONNX), ONNX Runtime de forma independiente y, para reentrenamiento, la cadena de entrenamiento de ml-agents (`mlagents-learn`) con PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Enfoque | Recompensa declarada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rondahahda/ppo-Pyramids | ML-Agents Pyramids | PPO, 63.991 pasos | -0.9999999310821295 +/- 0.0 (20 episodios, semilla 12345) | ONNX + checkpoint PyTorch | no disponible | HuggingFace, 0 descargas |
| DitDahDitDit/ppo-PyramidsRND | ML-Agents Pyramids | PPO con Random Network Distillation | no disponible | ONNX (ml-agents) | no disponible | HuggingFace |
| roshana1s/ppo-Pyramids | ML-Agents Pyramids | PPO | no disponible | ml-agents | no disponible | HuggingFace |
| zyzoe/ppo-Pyramids (AtomGit) | ML-Agents Pyramids | Adaptacion a NPU Ascend para inferencia | no disponible | ONNX adaptado | no disponible | AtomGit |

Todas las alternativas identificadas corresponden al mismo entorno de curso de ML-Agents. No se dispone de datos de rendimiento comparables de las variantes, salvo la metrica declarada por el autor de este repositorio.

## Limitaciones y advertencias

- Politica no convergida: el propio autor indica que es un modelo de curso introductorio y no una politica completamente entrenada.
- Rendimiento practicamente nulo: la recompensa media de -0.9999999310821295 con desviacion 0.0 sobre 20 episodios sugiere una politica colapsada que no resuelve la tarea; no debe usarse como sistema autonomo.
- Varianza cero en la evaluacion: una desviacion estandar de 0.0 en 20 episodios es un indicio de comportamiento deterministico degenerado o de un fallo sistematico, mas que de estabilidad deseable.
- Numero de pasos bajo: 63.991 pasos es una cantidad reducida para este tipo de entornos, lo que limita la calidad esperada de la politica.
- Inconsistencia documental: la model card menciona que "Soccer rewards include the team reward", una referencia al entorno Soccer que no corresponde a Pyramids; es probablemente texto heredado de una plantilla. Esto resta fiabilidad a la documentacion.
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso de uso comercial; hay que contactar con el autor antes de cualquier uso en produccion.
- Ausencia de idiomas y de capacidades linguisticas: cualquier evaluacion de tipo LLM no es aplicable.
- Sesgos: no disponibles. No hay informacion sobre sesgos en la model card ni sobre la distribucion de escenarios de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de los modelos generativos de texto; el riesgo equivalente es que la politica actue de forma incorrecta fuera de la distribucion de estados vista durante el entrenamiento.
- Deployabilidad limitada: al estar atada al entorno Pyramids, la politica no es transferible directamente a otras tareas sin reentrenamiento.
- Reproducibilidad parcial: se declara la semilla de evaluacion (12345) y el numero de episodios (20), pero no se detallan hiperparametros completos en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rondahahda/ppo-Pyramids
- Variante con RND: https://huggingface.co/DitDahDitDit/ppo-PyramidsRND
- Variante de otro autor: https://huggingface.co/roshana1s/ppo-Pyramids/tree/main
- Adaptacion a NPU Ascend (AtomGit): https://ai.atomgit.com/zyzoe/ppo-Pyramids
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Curso de Deep RL, unidad 5 (hands-on): https://huggingface.co/learn/deep-rl-course/en/unit5/hands-on
- Curso de Deep RL, unidad 7 (hands-on): https://huggingface.co/learn/deep-rl-course/en/unit7/hands-on
