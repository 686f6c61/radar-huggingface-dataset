# Hawi088/rl_course_vizdoom_health_gathering_supreme

## Resumen

`Hawi088/rl_course_vizdoom_health_gathering_supreme` es un agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. No es un modelo de lenguaje: es una politica neuronal que juega a un escenario de Doom en primera persona con el objetivo de recoger paquetes de salud el maximo tiempo posible. Lo publica el usuario Hawi088 como artefacto de un curso de reinforcement learning, usando Sample-Factory 2.0 como framework de entrenamiento.

El interes practico es acotado: sirve como referencia reproducible de un pipeline completo de RL (entrenamiento, evaluacion, publicacion en el Hub y reanudacion del entrenamiento) mas que como componente para produccion. El repositorio ocupa 0,2 GB e incluye los pesos y los checkpoints necesarios para reanudar el entrenamiento o ejecutar el agente con el script `enjoy`.

La relevancia ahora mismo es docente y de investigacion: ViZDoom es un banco de pruebas clasico para RL con observaciones visuales y recompensas dispersas, y disponer de un agente APPO empaquetado en el Hub facilita comparaciones y experimentos de continuacion de entrenamiento sin tener que reproducir el pipeline desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica neuronal para RL entrenada con APPO sobre Sample-Factory 2.0) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL; observaciones del entorno ViZDoom) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefacto de Sample-Factory; el repo pesa 0,2 GB) |

## Arquitectura y entrenamiento

El agente se entrena con APPO, la variante asincrona de PPO implementada en Sample-Factory 2.0. La red procesa observaciones visuales del entorno ViZDoom (`doom_health_gathering_supreme`) y produce acciones discretas de movimiento y disparo. La model card no detalla la topologia exacta de la red (capas convolucionales, unidades recurrentes ni tamano del embedding), por lo que esos datos figuran como no disponibles.

El entorno `doom_health_gathering_supreme` es un escenario de ViZDoom en el que el agente debe recoger botiquines mientras esquiva o elimina enemigos, con recompensa ligada a la salud acumulada. La model card no especifica el numero de pasos de entorno, la composicion del curriculum ni si hubo ajuste de hiperparametros mas alla de los valores por defecto de Sample-Factory. El autor declara un `mean_reward` de 9,52 +/- 5,15, no verificado.

## Capacidades

- Control de un agente en un entorno 3D de ViZDoom (`doom_health_gathering_supreme`) a partir de observaciones visuales.
- Politica entrenada con APPO, apta para inferencia con el script `enjoy` de Sample-Factory.
- Reanudacion del entrenamiento desde el checkpoint publicado mediante `--restart_behavior=resume`.
- Publicacion y carga desde el Hub con `python -m sample_factory.huggingface.load_from_hub`.
- Registro de metricas de entrenamiento en TensorBoard (tag `tensorboard` del repo).
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, vision general ni capacidades multilingues: es un agente de RL especifico de un entorno.

## Casos de uso

- Docencia de RL profundo: sirve como ejemplo completo y reproducible de un pipeline APPO con ViZDoom, desde la descarga del checkpoint hasta la evaluacion con `enjoy`, util para cursos y talleres.
- Reanudacion de experimentos: el checkpoint permite continuar el entrenamiento con `--restart_behavior=resume` y `--train_for_env_steps` elevado, lo que facilita estudiar el efecto de entrenamientos mas largos sobre la recompensa media.
- Comparacion de algoritmos: al estar empaquetado como artefacto de Sample-Factory, se puede contrastar APPO con PPO u otras variantes sobre el mismo entorno y medir diferencias en `mean_reward` y varianza.
- Analisis de recompensas dispersas: `health_gathering_supreme` es un escenario con recompensa poco frecuente; el agente sirve para estudiar tecnicas de exploracion y curriculum.
- Reproducibilidad de resultados: el repositorio incluye pesos y configuracion suficiente para replicar la evaluacion declarada (9,52 +/- 5,15) y verificar la cifra de forma independiente.
- Base para experimentos de transferencia: se puede usar como inicializacion para variantes del escenario de ViZDoom y medir la adaptacion del agente.
- Integracion en demos interactivas: ejecutar el agente con el script `enjoy` para generar visualizaciones o grabaciones de partidas en articulos y presentaciones.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 9,52 +/- 5,15 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo pesa 0,2 GB, por lo que la politica cabe holgadamente en cualquier GPU consumer moderna (orientativo, no confirmado por el autor).
- GPU recomendadas: no especificadas. Para entrenamiento con Sample-Factory se recomienda una GPU dedicada (RTX 3090/4090, A100, H100) por el coste de muestrear ViZDoom en paralelo; para inferencia basta una GPU modesta.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del artefacto; no hay confirmacion explicita.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`), carga desde el Hub con `sample_factory.huggingface.load_from_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Metrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hawi088/rl_course_vizdoom_health_gathering_supreme | APPO (Sample-Factory) | doom_health_gathering_supreme | mean_reward 9,52 +/- 5,15 | no disponible | HuggingFace Hub |
| Agentes APPO de referencia de Sample-Factory | APPO (Sample-Factory) | ViZDoom (distintos escenarios) | no disponible en esta ficha | no disponible | Repositorio de Sample-Factory |
| Agentes RL de ViZDoom en la literatura | PPO/APPO y variantes | doom_health_gathering_supreme | no disponible en esta ficha | variable | Publicaciones y repos varios |

No se dispone de datos comparativos verificados en la informacion proporcionada; las alternativas se citan a nivel cualitativo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes conversacionales.
- La metrica `mean_reward` (9,52 +/- 5,15) esta declarada por el autor y marcada como `verified: false`; no ha sido validada de forma independiente.
- La varianza es elevada (desviacion tipica de 5,15 sobre una media de 9,52), lo que indica un comportamiento inestable entre episodios.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- La model card no documenta sesgos, riesgos de alucinacion (no aplica) ni limitaciones de contexto mas alla del propio entorno ViZDoom.
- El agente esta especializado en un unico escenario; no se garantiza su rendimiento en otros mapas o variantes de ViZDoom sin reentrenamiento.
- La fecha de creacion indicada (2026-11-02) es futura respecto a la redaccion habitual de fichas; conviene verificar la metadata del repositorio.
- No hay informacion sobre hiperparametros, arquitectura de red ni numero de pasos de entrenamiento, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hawi088/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (GitHub): https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de integracion con HuggingFace: https://www.samplefactory.dev/10-huggingface/huggingface/
