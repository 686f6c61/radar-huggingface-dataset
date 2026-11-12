# fatah75/rl_course_vizdoom_health_gathering_supreme

## Resumen

`fatah75/rl_course_vizdoom_health_gathering_supreme` es un checkpoint de agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario fatah75 en Hugging Face como material de un curso de RL, y su proposito es servir como referencia reproducible de un agente que aprende a recoger botiquines en un escenario de Doom con recompensa escasa y horizonte temporal largo.

No es un modelo de lenguaje ni un transformer generativo: es una politica neuronal (red convolucional para procesar el frame del juego y capa recurrente para integrar historial) entrenada con la libreria Sample-Factory 2.0 de Alex Petrenko. El repositorio ocupa 0,1 GB e incluye los pesos y los ficheros de configuracion necesarios para reanudar el entrenamiento o ejecutar el agente con el script `enjoy`.

Su relevancia es formativa y de investigacion: `health_gathering_supreme` es un benchmark clasico de RL con recompensa dispersa en el que el agente debe navegar un mapa laberintico, sobrevivir y recolectar items. El checkpoint declarado alcanza una recompensa media de 4,05 +/- 0,88, un valor modesto que refleja lo dificil del entorno y que resulta util como linea base para comparar tecnicas de exploracion y credit assignment.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal convolucional + recurrente (entrenada con APPO de Sample-Factory 2.0) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL; observa frames del entorno) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Sample-Factory (no disponible el detalle exacto de los ficheros) |

## Arquitectura y entrenamiento

El agente se entrena con APPO, una variante asincrona de PPO implementada en Sample-Factory que desacopla los workers de recoleccion de experiencia del learner mediante colas y versiones de politica, lo que permite escalar el entrenamiento en CPU y GPU de forma eficiente. La politica procesa observaciones visuales del entorno ViZDoom (frames en resolucion reducida) mediante capas convolucionales, y mantiene estado recurrente para integrar informacion temporal, algo imprescindible en `health_gathering_supreme`, donde la recompensa llega de forma dispersa y el agente debe recordar rutas y posiciones de items.

El entorno `doom_health_gathering_supreme` es la version mas dificil de la familia Health Gathering de ViZDoom: el mapa es mas grande y laberintico, la recompensa por recoger botiquines es escasa y el agente debe sobrevivir el tiempo suficiente para acumularlas. El autor no documenta en la model card el numero de pasos de entrenamiento, la composicion del dataset (aqui la experiencia se genera por interaccion, no hay dataset estatico), ni si se aplicaron tecnicas adicionales de exploracion o reward shaping. La unica metrica declarada es la recompensa media del model-index.

## Capacidades

- Control de agente en un entorno 3D de ViZDoom a partir de observaciones visuales (frames).
- Navegacion y exploracion en mapas laberinticos con recompensa dispersa.
- Recoleccion de items (botiquines) y gestion de la supervivencia del agente.
- Integracion de historial temporal mediante estado recurrente en la politica.
- Reanudacion de entrenamiento desde el checkpoint con `--restart_behavior=resume`.
- Ejecucion de la politica entrenada con el script `enjoy` de Sample-Factory.
- No soporta tool calling, function calling, agentes multi-paso en el sentido LLM, vision general, audio ni capacidades multilingues.

## Casos de uso

- Docencia y cursos de RL: el checkpoint sirve como ejemplo ejecutable de un pipeline completo de Sample-Factory (entrenamiento, evaluacion y publicacion en Hugging Face), util para que los alumnos reproduzcan el flujo de trabajo.
- Linea base para investigacion en exploracion: al tener una recompensa media declarada de 4,05 +/- 0,88, se puede usar como referencia para medir mejoras al introducir tecnicas de exploracion como RND, ICM o curriculum learning.
- Estudio de recompensa dispersa: `health_gathering_supreme` es un entorno de referencia para analizar credit assignment; el checkpoint permite inspeccionar el comportamiento aprendido y comparar con variantes mas faciles del mismo entorno.
- Reanudacion de entrenamiento: el autor documenta el comando para continuar el entrenamiento con `--restart_behavior=resume`, lo que permite experimentar con hiperparametros partiendo de una politica ya entrenada.
- Benchmarking de algoritmos: sirve para comparar APPO con otras variantes (PPO, IMPALA, SAC) sobre el mismo entorno y configuracion de Sample-Factory.
- Demostraciones de inferencia en RL: ejecutar el agente con `enjoy` para visualizar la politica en accion en presentaciones o material didactico.
- Integracion en pipelines de evaluacion automatizada: cargar el modelo desde el Hub con `sample_factory.huggingface.load_from_hub` y evaluarlo en un bucle de validacion reproducible.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 4,05 +/- 0,88 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que los pesos caben holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior).
- GPU recomendadas: no disponibles; para entrenamiento con Sample-Factory se suele usar una GPU dedicada (RTX 3090, RTX 4090, A100, H100) junto con varios workers de CPU para la recoleccion de experiencia.
- Cabe en GPU consumer: si, dado el tamano reducido del checkpoint; la inferencia puede ejecutarse incluso en CPU con latencia aceptable.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`), carga desde el Hub con `python -m sample_factory.huggingface.load_from_hub`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fatah75/rl_course_vizdoom_health_gathering_supreme | doom_health_gathering_supreme | APPO | 4,05 +/- 0,88 | no disponible | Hugging Face |
| Otros checkpoints de Sample-Factory en ViZDoom | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en el entorno `doom_health_gathering_supreme`; no es transferible a otras tareas sin reentrenamiento.
- La recompensa media de 4,05 +/- 0,88 es modesta y presenta alta varianza; no debe interpretarse como un agente resuelto ni como estado del arte.
- El resultado del model-index esta marcado como `verified: false`; no ha sido validado de forma independiente.
- No hay informacion sobre la licencia, lo que impide determinar si el uso comercial esta permitido; conviene contactar con el autor antes de cualquier uso en produccion.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque no es un modelo de lenguaje; esos conceptos no aplican.
- No se especifican los pasos de entrenamiento, la semilla ni la configuracion exacta, lo que dificulta la reproducibilidad estricta del resultado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia; se trata de un artefacto de curso sin validacion de la comunidad.
- La fecha de creacion indicada (2026-11-12) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fatah75/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de integracion con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
