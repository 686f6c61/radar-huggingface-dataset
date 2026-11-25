# nisarg-ai/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom, un escenario de navegacion y recoleccion de botiquines en un mapa de Doom con niveles de dificultad crecientes. El modelo lo publica el usuario `nisarg-ai` como parte de un curso de reinforcement learning, empleando la libreria Sample-Factory 2.0 de Alex Petrenko.

No se trata de un modelo de lenguaje ni de un modelo generativo multimodal: es una politica neuronal entrenada para controlar un agente en un videojuego en primera persona a partir de observaciones visuales y recompensas. Su relevancia es formativa y experimental, no de produccion general: sirve como referencia reproducible de un pipeline completo de entrenamiento RL (entorno, algoritmo, checkpoint y evaluacion) empaquetado en el formato de Hugging Face Hub de Sample-Factory.

El checkpoint ocupa aproximadamente 0,1 GB y se distribuye con la metadatos de model-index que declaran una recompensa media de 14,27 +/- 6,91 en el entorno de entrenamiento. La informacion publica es muy limitada: no se detalla la arquitectura de la red, el numero de pasos de entrenamiento, la composicion del dataset ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica neuronal de RL entrenada con APPO; detalles de capas no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el agente opera por pasos de entorno, no por ventana de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de Sample-Factory (no especificado en la model card; no se indica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El agente se entrena con APPO, una variante asincrona de PPO implementada en Sample-Factory que combina actores paralelos con un learner central y usa un mecanismo de cola de politicas para desacoplar la generacion de experiencia del calculo de gradientes. La politica procesa observaciones del entorno ViZDoom (`doom_health_gathering_supreme`), un escenario con observaciones visuales en primera persona y acciones discretas de movimiento y giro, y se optimiza para maximizar la recompensa acumulada de recoger botiquines antes de que decaiga la salud.

La model card no especifica el numero de tokens ni de pasos de entorno usados en el entrenamiento, la composicion del dataset (en RL no hay dataset supervisado al uso, sino experiencia generada por interaccion), ni si se aplicaron tecnicas adicionales como reward shaping, curriculum learning o aumentacion de observaciones. Tampoco se documenta la arquitectura exacta de la red (capas convolucionales, tamaño de las capas recurrentes, etc.). El unico dato verificable de rendimiento es la recompensa media declarada en el model-index, marcada como no verificada (`verified: false`).

## Capacidades

- Control de agente en el entorno ViZDoom `doom_health_gathering_supreme`: navegacion en primera persona, orientacion y recoleccion de items de salud.
- Aprendizaje por refuerzo con observaciones visuales y acciones discretas, segun el paradigma de Sample-Factory.
- Reanudacion del entrenamiento desde el checkpoint publicado (flag `--restart_behavior=resume`).
- Evaluacion reproducible mediante el script `enjoy` de Sample-Factory.
- Exportacion y carga desde el Hugging Face Hub mediante `sample_factory.huggingface.load_from_hub`.
- No soporta tool calling, function calling, agentes multi-paso linguisticos, generacion de texto, codigo, matematicas, vision general ni capacidades multilingues: es una politica especifica de un entorno.

## Casos de uso

- Docencia y cursos de reinforcement learning: el checkpoint sirve como ejemplo funcional de un pipeline APPO completo, desde el entrenamiento hasta la evaluacion, para que los alumnos lo carguen y ejecuten con Sample-Factory.
- Reproduccion de experimentos: permite verificar la recompensa media declarada (14,27 +/- 6,91) ejecutando el script `enjoy` sobre el entorno `doom_health_gathering_supreme`.
- Punto de partida para fine-tuning o entrenamiento continuado: con `--restart_behavior=resume` se puede prolongar el entrenamiento y comparar curvas frente a un entrenamiento desde cero.
- Benchmark interno de algoritmos RL: sirve como baseline APPO para comparar contra PPO, IMPALA u otros algoritmos en el mismo escenario de ViZDoom.
- Estudio de estabilidad y varianza: la desviacion tipica de 6,91 sobre una media de 14,27 es un caso util para analizar la varianza de recompensa entre episodios y el efecto de semillas.
- Integracion en pipelines de investigacion con TensorBoard: los tags incluyen `tensorboard`, lo que facilita el seguimiento de metricas durante el reentrenamiento.
- Demostracion de despliegue en Hugging Face Hub: ilustra el flujo de publicacion y descarga de checkpoints de Sample-Factory mediante la CLI de la libreria.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 14,27 +/- 6,91 |

No se han publicado en la informacion disponible resultados comparativos con otros algoritmos, semillas o configuraciones en este mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint ocupa 0,1 GB, por lo que la politica es ligera y probablemente cabe en GPU de gama baja, pero no se publica el desglose de memoria.
- GPU recomendadas: no disponible. Para entrenamiento APPO con actores paralelos se suele requerir una GPU dedicada (por ejemplo, RTX 3060 o superior) y CPU para los workers de entorno, pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamaño del checkpoint es plausible en GPUs de consumo, pero no se documenta.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`); no se indican vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nisarg-ai/rl_course_vizdoom_health_gathering_supreme | APPO (Sample-Factory) | doom_health_gathering_supreme | 14,27 +/- 6,91 | no disponible | Hugging Face Hub |
| Otros checkpoints APPO de Sample-Factory en ViZDoom | APPO (Sample-Factory) | escenarios ViZDoom | no disponible en la informacion proporcionada | variable | Hugging Face Hub |
| Implementaciones PPO/IMPALA de referencia en ViZDoom | PPO / IMPALA | escenarios ViZDoom | no disponible en la informacion proporcionada | variable | repositorios academicos |

No se dispone de datos publicados en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en el entorno `doom_health_gathering_supreme`; no es reutilizable para otras tareas sin reentrenamiento.
- La recompensa media declarada no esta verificada (`verified: false`) y presenta una desviacion tipica alta (6,91), lo que indica variabilidad considerable entre episodios.
- No se publica la licencia, por lo que el uso comercial queda sin marco legal claro y debe consultarse con el autor.
- No se documentan sesgos, riesgos de alucinacion (no aplica a un modelo generativo) ni limitaciones de idioma (no aplica).
- No se especifican la arquitectura de red, el numero de pasos de entrenamiento ni la configuracion de hiperparametros, lo que dificulta la reproducibilidad exacta.
- El checkpoint esta pensado para uso educativo y experimental; no se ha validado para produccion ni para entornos distintos del de entrenamiento.
- La fecha de creacion indicada (2026-11-25) es posterior a la fecha actual en el momento de redactar esta ficha; conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nisarg-ai/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (GitHub): https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de integracion con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
- Entorno ViZDoom: https://github.com/mwydmuch/ViZDoom
