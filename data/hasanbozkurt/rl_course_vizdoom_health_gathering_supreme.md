# HasanBozkurt/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio contiene una politica de aprendizaje por refuerzo profundo entrenada con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario HasanBozkurt en Hugging Face como parte de un curso de reinforcement learning, usando la libreria Sample-Factory 2.0 como marco de entrenamiento e inferencia. No es un modelo de lenguaje: es un agente que juega a un escenario de Doom en primera persona cuyo objetivo es recoger botiquines para mantener la salud mientras esquiva ataques.

El interes practico es acotado: sirve como material didactico y como ejemplo reproducible de un pipeline completo de RL (entrenamiento, evaluacion, publicacion en el Hub y reanudacion del entrenamiento). La model card documenta los comandos exactos de descarga, evaluacion y continuacion del entrenamiento, lo que lo convierte en una referencia util para quien quiera replicar el flujo de Sample-Factory.

El rendimiento declarado por el autor es una recompensa media de 11,12 con desviacion tipica de 4,82 en el entorno citado, un valor no verificado. No hay informacion sobre arquitectura de red, numero de parametros, contexto, idiomas ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de RL entrenada con APPO sobre Sample-Factory) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (agente de control, no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de Sample-Factory, 0,1 GB; pesos gestionados por la libreria) |

## Arquitectura y entrenamiento

El agente se entrena con APPO, una variante asincrona de PPO implementada en Sample-Factory 2.0. APPO desacopla la recoleccion de experiencia de la actualizacion de la politica mediante workers asincronos, lo que permite escalar el entrenamiento en CPU y GPU de forma mas eficiente que PPO sincrono. La red concreta (codificador visual, capas recurrentes, cabeza de politica y de valor) no se detalla en la informacion disponible.

El entorno es `doom_health_gathering_supreme` de ViZDoom, un escenario de recompensa escasa en el que el agente debe navegar un mapa, recoger pociones de salud y sobrevivir. No se especifican el numero de pasos de entorno, la composicion del dataset, ni si hubo tecnicas adicionales como curiosidad intrinseca o recompensas conformadas. La model card incluye instrucciones para reanudar el entrenamiento con `--restart_behavior=resume`, lo que sugiere que el checkpoint es reutilizable para continuar el aprendizaje.

## Capacidades

- Control de agente en un entorno 3D de ViZDoom (`doom_health_gathering_supreme`) a partir de observaciones visuales.
- Navegacion y recogida de objetos (botiquines) con politica entrenada por refuerzo.
- Reanudacion del entrenamiento desde el checkpoint publicado mediante Sample-Factory.
- Evaluacion reproducible con el script `enjoy` de Sample-Factory.
- Publicacion y carga en el Hugging Face Hub mediante `sample_factory.huggingface.load_from_hub`.
- No soporta generacion de texto, codigo, tool calling, agentes multi-paso, vision general ni capacidades multilingues.

## Casos de uso

- Docencia de reinforcement learning: el repositorio sirve como ejemplo completo de un ciclo de entrenamiento APPO con Sample-Factory, desde la descarga hasta la evaluacion, para cursos y talleres.
- Reproduccion de experimentos: permite a un investigador cargar el checkpoint y verificar la recompensa media declarada (11,12 +/- 4,82) en el mismo entorno.
- Punto de partida para fine-tuning: el comando de reanudacion con `--restart_behavior=resume` permite continuar el entrenamiento con hiperparametros distintos y comparar curvas.
- Pruebas de infraestructura de RL: util para validar pipelines de entrenamiento distribuido con Sample-Factory antes de escalar a entornos mas costosos.
- Analisis de robustez en ViZDoom: el agente puede evaluarse con semillas y configuraciones del entorno distintas para estudiar varianza de la politica.
- Integracion en demos educativas: se puede empaquetar el agente en un cuaderno o demo interactiva que muestre como un modelo de RL juega a Doom.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 11,12 +/- 4,82 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,1 GB, lo que sugiere que la politica es ligera, pero no se confirma el consumo de memoria.
- GPU recomendadas: no disponible; Sample-Factory puede ejecutar APPO en CPU y GPU, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: probablemente si, dado el tamano reducido del checkpoint, aunque no hay datos oficiales.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HasanBozkurt/rl_course_vizdoom_health_gathering_supreme | APPO (Sample-Factory) | doom_health_gathering_supreme | 11,12 +/- 4,82 | no disponible | Hugging Face |
| Otros checkpoints APPO de Sample-Factory | APPO | ViZDoom y Atari | no disponible | no disponible | Hugging Face / Sample-Factory |
| Politicas PPO de referencia en ViZDoom | PPO | ViZDoom | no disponible | no disponible | Repos academicos |

No se dispone de datos comparativos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un agente de RL especifico de un entorno; no generaliza a otras tareas ni a otros mapas de ViZDoom sin reentrenamiento.
- La recompensa media declarada (11,12 +/- 4,82) no esta verificada y presenta una desviacion tipica alta, lo que indica varianza considerable entre episodios.
- No hay informacion sobre sesgos, alucinacion ni comportamiento fuera de distribucion; en RL, la politica puede fallar ante cambios en la dinamica del entorno.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion.
- Idiomas no aplicables; el modelo no procesa texto.
- Al ser material de curso, no hay garantia de mantenimiento, soporte ni actualizaciones.
- La fecha de creacion indicada (2026-11-15) es posterior a la fecha actual en muchos contextos; conviene verificar la integridad del repositorio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/HasanBozkurt/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (GitHub): https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de integracion con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
