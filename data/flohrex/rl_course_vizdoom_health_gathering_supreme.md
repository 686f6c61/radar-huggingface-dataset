# Flohrex/rl_course_vizdoom_health_gathering_supreme

## Resumen

`Flohrex/rl_course_vizdoom_health_gathering_supreme` es un checkpoint de agente de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario Flohrex en Hugging Face como parte de un curso de reinforcement learning, y se distribuye en el formato nativo de Sample-Factory 2.0, la libreria con la que fue entrenado.

No se trata de un modelo de lenguaje ni de un modelo generativo: es una politica neuronal que controla a un agente en un escenario de combate en primera persona de Doom, cuyo objetivo es recoger botiquines para mantener la salud mientras esquiva o elimina a los enemigos. El checkpoint incluye los pesos de la red y la configuracion del experimento necesaria para reanudar el entrenamiento o ejecutar la politica en modo inferencia.

Su relevancia es fundamentalmente didactica y de investigacion: sirve como referencia reproducible de un pipeline completo de RL (entorno, algoritmo, entrenamiento distribuido y publicacion en el Hub) y como punto de partida para experimentos de comparacion de algoritmos o de ajuste fino sobre el mismo entorno. El repositorio ocupa aproximadamente 0,1 GB y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional + capas densas (politica y funcion de valor) entrenada con APPO sobre Sample-Factory 2.0; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la "memoria" depende de la configuracion recurrente del agente, no especificada) |
| Tipos de cuantizacion | no disponible (checkpoint en precision de entrenamiento, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; recibe observaciones visuales del entorno) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint nativo de Sample-Factory (pesos `.pt` de PyTorch y ficheros de configuracion del experimento) |

## Arquitectura y entrenamiento

El agente se entrena con APPO, la implementacion de PPO asincrono de Sample-Factory, que combina workers de recoleccion de experiencia en paralelo con un learner central y aplica truncamiento de la relacion de probabilidades (ratio clipping) para estabilizar las actualizaciones de politica. La politica procesa observaciones visuales del entorno ViZDoom mediante una torre convolucional y produce la distribucion de acciones del agente; el checkpoint incluye tanto la politica como la funcion de valor y el estado del optimizador necesario para reanudar el entrenamiento.

El entorno `doom_health_gathering_supreme` es una variante de dificultad alta del escenario `health_gathering` de ViZDoom, en el que el agente debe recoger botiquines para sobrevivir el maximo tiempo posible. La model card no detalla el numero de pasos de entorno, la composicion del curriculum, los hiperparametros de APPO ni si se aplicaron tecnicas adicionales como reward shaping o aumentacion de observaciones; toda esa informacion figura como no disponible. El autor indica que el modelo se entreno con Sample-Factory 2.0 y enlaza la documentacion oficial del framework para los detalles de uso.

## Capacidades

- Control de agente en el entorno ViZDoom `doom_health_gathering_supreme`: selecciona acciones de movimiento y disparo a partir de fotogramas del juego.
- Navegacion y recogida de objetos: la politica aprende a localizar y alcanzar botiquines para mantener la salud.
- Supervivencia en escenarios con enemigos: gestiona el trade-off entre exploracion, recogida de recursos y evasion de dano.
- Reanudacion de entrenamiento: el checkpoint permite continuar el entrenamiento desde el paso en que se detuvo mediante `--restart_behavior=resume`.
- Evaluacion reproducible: puede ejecutarse con el script `enjoy` de Sample-Factory para medir la recompensa media del agente.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje natural, vision general ni capacidades multilingues; su dominio esta acotado al entorno de entrenamiento.

## Casos de uso

- Docencia de reinforcement learning: sirve como ejemplo completo y reproducible de un pipeline de RL con Sample-Factory, desde el entrenamiento hasta la publicacion en el Hub, para que los alumnos comparen su propia implementacion con una referencia funcional.
- Reproduccion de resultados: permite verificar la recompensa media declarada (11,91 +/- 5,25) ejecutando el script `enjoy` sobre el mismo entorno y la misma configuracion, lo que facilita auditorias de experimentos.
- Punto de partida para ajuste fino: al poder reanudar el entrenamiento con `--restart_behavior=resume`, se puede continuar el aprendizaje con mas pasos de entorno o con modificaciones del reward para estudiar su efecto.
- Comparacion de algoritmos: el checkpoint sirve como baseline APPO frente a otras politicas entrenadas con PPO sincrono, IMPALA o SAC sobre el mismo entorno, midiendo convergencia y recompensa final.
- Investigacion en entornos ViZDoom: util para experimentos de generalizacion visual (cambios de textura, iluminacion o resolucion) evaluando como degrada la politica entrenada.
- Demostracion en vivo: integrado en un script de evaluacion, puede ejecutarse como demo de agente jugando a Doom en charlas, clases o articulos tecnicos.
- Benchmarking de infraestructura: al ser un experimento pequeno (0,1 GB), sirve para validar pipelines de entrenamiento distribuido y de carga de checkpoints desde el Hub antes de escalar a entornos mas costosos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Algoritmo | Entorno | Metrica | Valor |
|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 11,91 +/- 5,25 |

No se han publicado en la informacion disponible resultados adicionales de benchmarks ni comparaciones con otros modelos sobre este entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; por el tamano del repositorio (0,1 GB) y la naturaleza del entorno ViZDoom, el checkpoint es ligero y cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos unos pocos GB de VRAM; una RTX 3060 o superior es mas que suficiente para inferencia y para reanudar el entrenamiento a pequena escala.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer reciente; tambien puede ejecutarse en CPU para inferencia, aunque con menor throughput.
- Opciones de despliegue: Sample-Factory 2.0 (scripts `enjoy` y `train`), con soporte de carga desde el Hub mediante `python -m sample_factory.huggingface.load_from_hub`. No se publican variantes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Flohrex/rl_course_vizdoom_health_gathering_supreme | APPO (Sample-Factory 2.0) | doom_health_gathering_supreme | no disponible | no aplica | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros checkpoints publicados del mismo autor o de la misma familia de curso con los que establecer una comparacion directa.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en el entorno `doom_health_gathering_supreme`; no generaliza a otros escenarios, juegos ni tareas fuera de distribucion sin reentrenamiento.
- La recompensa media declarada (11,91 +/- 5,25) tiene una desviacion tipica elevada en relacion a la media, lo que indica alta varianza entre episodios; no debe interpretarse como un rendimiento estable.
- Los resultados del model-index estan marcados como no verificados (`verified: false`); no han sido auditados de forma independiente.
- La licencia no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido; se recomienda contactar con el autor antes de cualquier uso en produccion.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el modelo no procesa lenguaje natural; los riesgos relevantes son los propios del entorno (comportamientos suboptimos, politicas fragiles ante cambios visuales).
- Al ser un checkpoint de curso, la configuracion del experimento y los hiperparametros no estan documentados en detalle, lo que dificulta la reproducibilidad exacta del resultado.
- El contenido del escenario ViZDoom incluye violencia simulada; conviene valorar el contexto de uso antes de presentarlo en demos publicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Flohrex/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentacion de Sample-Factory: https://www.samplefactory.dev/
- Documentacion de integracion con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
