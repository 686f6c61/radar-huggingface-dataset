# alan1009/rl_course_vizdoom_health_gathering_supreme

## Resumen

`alan1009/rl_course_vizdoom_health_gathering_supreme` es un checkpoint de aprendizaje por refuerzo profundo (deep RL) entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario alan1009 en Hugging Face como material didactico de un curso de RL, utilizando Sample-Factory 2.0 como framework de entrenamiento. No es un modelo de lenguaje: es una politica neuronal que aprende a jugar un escenario concreto de Doom en primera persona.

El escenario `health_gathering_supreme` es una tarea de control continuo en la que el agente debe recoger frascos de salud para mantenerse con vida el mayor tiempo posible mientras esquiva o elimina enemigos. Es un benchmark clasico para evaluar algoritmos de RL en entornos con recompensas dispersas, observaciones visuales y dinamicas en tiempo real.

Su relevancia es fundamentalmente educativa: sirve como referencia reproducible de un pipeline completo de entrenamiento APPO con Sample-Factory, desde la definicion del entorno hasta la publicacion del checkpoint en el Hub. No esta pensado para uso en produccion ni como componente de sistemas de IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal convolucional (CNN) para observaciones visuales, entrenada con APPO (Asynchronous PPO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el agente opera sobre frames del entorno) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint de Sample-Factory; tamano del repo 0.1 GB) |

## Arquitectura y entrenamiento

El modelo se entrena con APPO, una variante asincrona de PPO implementada en Sample-Factory 2.0. APPO combina workers de recoleccion de experiencia en paralelo con un learner central, lo que permite escalar el entrenamiento en CPU y GPU de forma eficiente. La politica procesa observaciones visuales del entorno ViZDoom (frames en primera persona) y emite acciones discretas sobre el escenario `health_gathering_supreme`.

El entorno `doom_health_gathering_supreme` es una version de dificultad elevada del escenario `health_gathering` de ViZDoom, donde el agente debe recoger items de salud mientras los enemigos le disparan. La recompensa esta disenada para incentivar la supervivencia y la recoleccion de salud. No se dispone de informacion sobre el numero de pasos de entrenamiento, la composicion exacta del dataset (generado por interaccion con el simulador) ni si se aplicaron tecnicas adicionales como reward shaping o curricula.

El checkpoint publicado incluye el estado completo del entrenamiento (pesos del modelo, optimizador y configuracion), lo que permite reanudar el entrenamiento con `--restart_behavior=resume` segun indica la model card.

## Capacidades

- Control de agente en un entorno 3D en primera persona (ViZDoom) mediante acciones discretas.
- Procesamiento de observaciones visuales (frames) para la toma de decisiones en tiempo real.
- Aprendizaje por refuerzo con recompensa dispersa en un escenario de supervivencia.
- Reanudacion de entrenamiento desde el checkpoint publicado.
- Evaluacion reproducible mediante el script `enjoy` de Sample-Factory.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling ni capacidades multilingues.

## Casos de uso

- Docencia en cursos de deep RL: sirve como ejemplo funcional de un pipeline APPO completo con Sample-Factory, desde el entrenamiento hasta la publicacion en el Hub y la evaluacion con `enjoy`.
- Reproduccion de experimentos: permite verificar resultados de un escenario ViZDoom concreto y comparar con otras ejecuciones del mismo entorno.
- Punto de partida para fine-tuning: se puede reanudar el entrenamiento (`--restart_behavior=resume`) y ajustar hiperparametros para estudiar su efecto en la recompensa media.
- Benchmark de algoritmos de RL: util como baseline APPO en `health_gathering_supreme` para comparar con PPO, A2C u otros algoritmos sobre el mismo entorno.
- Estudio de robustez visual: al operar sobre frames de Doom, permite analizar como afectan perturbaciones visuales o cambios de textura a la politica aprendida.
- Demostracion de integracion con Hugging Face Hub: ejemplo de publicacion y descarga de checkpoints de RL mediante `sample_factory.huggingface.load_from_hub`.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 9.01 +/- 5.65 |

No se han publicado otros resultados de benchmarks en la informacion disponible. La desviacion tipica elevada (+/- 5.65) indica una alta varianza entre episodios, algo habitual en escenarios de supervivencia con recompensas dispersas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint ocupa 0.1 GB, por lo que la inferencia es muy ligera y probablemente cabe en cualquier GPU consumer, aunque no se especifica.
- GPU recomendadas: no disponible. Sample-Factory soporta entrenamiento en GPU y evaluacion en CPU.
- Cabe en GPU consumer: si, por el tamano reducido del checkpoint, aunque no hay confirmacion explicita.
- Opciones de despliegue: Sample-Factory (`enjoy` para evaluacion, `train` para reanudar entrenamiento); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de RL).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | mean_reward | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alan1009/rl_course_vizdoom_health_gathering_supreme | doom_health_gathering_supreme | APPO | 9.01 +/- 5.65 | no disponible | Hugging Face |
| Otros checkpoints APPO de Sample-Factory en ViZDoom | doom_health_gathering_supreme | APPO | no disponible | no disponible | no disponible |
| Alternativas PPO/A2C en el mismo entorno | doom_health_gathering_supreme | PPO/A2C | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especifico de un unico entorno (`doom_health_gathering_supreme`); no generaliza a otras tareas ni entornos.
- Alta varianza en la recompensa (desviacion tipica de 5.65 sobre una media de 9.01), lo que implica comportamiento inestable entre episodios.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, tool calling ni agentes multi-step.
- Licencia no especificada: no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier uso fuera de docencia o investigacion.
- Sin informacion sobre sesgos, alucinacion (no aplica) ni limitaciones de contexto o idioma (no aplica).
- Resultados de benchmark no verificados (`verified: false`); deben tomarse como referencia del autor, no como cifras contrastadas.
- Checkpoint de curso: no hay garantia de mantenimiento, soporte ni actualizaciones.

## Enlaces

- Hugging Face: https://huggingface.co/alan1009/rl_course_vizdoom_health_gathering_supreme
- Sample-Factory (GitHub): https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Guia de Hugging Face en Sample-Factory: https://www.samplefactory.dev/10-huggingface/huggingface/
- ViZDoom (entorno): no disponible en la informacion proporcionada
- Paper de APPO: no disponible en la informacion proporcionada
