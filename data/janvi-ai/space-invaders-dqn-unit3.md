# janvi-ai/space-invaders-dqn-unit3

## Resumen

Space Invaders DQN — Unit 3 es un agente de aprendizaje por refuerzo profundo entrenado para jugar al clasico de Atari *Space Invaders*. Lo desarrolla el usuario janvi-ai como parte de la Unidad 3 del curso de Deep RL de Hugging Face, empleando la libreria Stable-Baselines3 y la configuracion de RL-Baselines3-Zoo. No es un modelo de lenguaje: es una politica neuronal (CnnPolicy) que mapea observaciones visuales del juego a acciones discretas.

El agente se entrena sobre `SpaceInvadersNoFrameskip-v4` con el preprocesado estandar de Atari (recorte, escala a escala de grises y apilado de 4 fotogramas) y se evalua sobre `ALE/SpaceInvaders-v5`. La evaluacion reportada en 10 episodios arroja una recompensa media de 384,5 con desviacion tipica de 130,55, superando el objetivo de 200 fijado por el curso.

Su relevancia es fundamentalmente didactica: sirve como referencia reproducible de un pipeline DQN completo con Stable-Baselines3, con checkpoints y resultados de evaluacion publicados. El repositorio ocupa aproximadamente 0,1 GB y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DQN con CnnPolicy (red convolucional sobre observaciones visuales) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada = 4 fotogramas apilados de Atari) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (agente de control sobre Atari) |
| Licencia | MIT |
| Formato de pesos | checkpoints de Stable-Baselines3 en `logs/dqn/` (formato `.zip` propio de SB3) |

## Arquitectura y entrenamiento

El agente es un Deep Q-Network (DQN) implementado en Stable-Baselines3 con `CnnPolicy`. La red procesa observaciones visuales del entorno Atari tras el preprocesado habitual: recorte de la imagen, conversion a escala de grises, redimensionado y apilado de 4 fotogramas consecutivos para dotar al agente de informacion temporal (velocidad y direccion de los proyectiles). La salida es un valor Q por cada accion discreta disponible en `SpaceInvadersNoFrameskip-v4`.

El entrenamiento sigue la configuracion de RL-Baselines3-Zoo recogida en `dqn.yml`, que no se detalla en la informacion disponible. No se especifican el numero total de pasos de entrenamiento, la composicion del buffer de repeticion, la tasa de exploracion ni si se aplicaron tecnicas adicionales como Double DQN o prioritized experience replay. La evaluacion se realiza sobre `ALE/SpaceInvaders-v5` con 10 episodios, reportando recompensa media 384,5, desviacion tipica 130,55 y media menos desviacion 253,95, frente a un objetivo de 200.

## Capacidades

- Control de politica en el entorno Atari *Space Invaders*: selecciona acciones discretas (movimiento y disparo) a partir de observaciones visuales.
- Procesamiento de entrada visual mediante CNN sobre 4 fotogramas apilados.
- Aprendizaje por refuerzo off-policy con DQN (experiencia de repeticion y red objetivo, segun la implementacion estandar de SB3).
- Evaluacion reproducible: resultados publicados en `evaluation_results_final.json`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural.
- No tiene capacidades multilingues, de vision general, audio ni modo de razonamiento (thinking).

## Casos de uso

- Docencia y aprendizaje de RL: sirve como ejemplo completo y reproducible de un pipeline DQN con Stable-Baselines3, desde el entrenamiento hasta la evaluacion, para cursos y tutoriales.
- Baseline de referencia en Atari: util como punto de partida para comparar variantes (Double DQN, Dueling DQN, Rainbow) sobre el mismo entorno y preprocesado.
- Reproduccion de experimentos: los checkpoints en `logs/dqn/` permiten reanudar el entrenamiento o inspeccionar la politica aprendida sin reentrenar desde cero.
- Analisis de curvas de recompensa: el JSON de evaluacion permite estudiar la varianza entre episodios (desviacion tipica de 130,55 sobre media de 384,5) y la estabilidad del agente.
- Prototipado de entornos de evaluacion: sirve para validar pipelines de evaluacion sobre `ALE/SpaceInvaders-v5` antes de escalar a otros juegos de Atari.
- Demostracion de inferencia en CPU: al ser una CNN pequena sobre observaciones de 84x84, puede ejecutarse en hardware modesto para demos interactivas del agente jugando.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Entorno de evaluacion | ALE/SpaceInvaders-v5 |
| Episodios de evaluacion | 10 |
| Recompensa media | 384,5 |
| Desviacion tipica | 130,55 |
| Media menos desviacion | 253,95 |
| Objetivo del curso | 200 |
| Objetivo alcanzado | Si |

No se han publicado resultados comparativos con otros agentes (por ejemplo, DQN de referencia de RL-Baselines3-Zoo o variantes Rainbow) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; una CNN sobre 4 fotogramas de 84x84 en escala de grises cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la practica).
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU (RTX 3060, RTX 4090, A100, H100) acelera el entrenamiento, no la inferencia.
- Cabe en GPU consumer: si, en todas las gamas actuales; tambien en CPU.
- Opciones de despliegue: Stable-Baselines3 (`DQN.load`), con dependencias de Gymnasium y ALE/Atari. No aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la informacion proporcionada; en CPU la inferencia por paso es del orden de milisegundos para una CNN de este tamano.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| janvi-ai/space-invaders-dqn-unit3 | DQN + CnnPolicy | SpaceInvaders (Atari) | 384,5 (10 episodios) | MIT | Hugging Face |
| Agentes DQN de RL-Baselines3-Zoo | DQN + CnnPolicy | SpaceInvadersNoFrameskip-v4 | no disponible en esta ficha | MIT | GitHub (sb3 contrib) |
| Variantes Rainbow / Double DQN | RL avanzado | SpaceInvaders (Atari) | no disponible en esta ficha | MIT (implementaciones de referencia) | GitHub / papers |

No se dispone de datos verificados de rendimiento de los modelos alternativos en la informacion proporcionada; la comparativa se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Especifico de un unico entorno: la politica solo es valida para *Space Invaders*; no generaliza a otros juegos ni tareas.
- Evaluacion con solo 10 episodios: la desviacion tipica de 130,55 indica alta varianza; la media de 384,5 debe interpretarse con cautela.
- El autor indica que la finalizacion oficial del curso no ha sido verificada de forma independiente.
- No es un modelo de lenguaje: no admite prompts, tool calling ni generacion de texto.
- Sin datos publicados sobre hiperparametros completos, semillas ni numero de pasos de entrenamiento, lo que dificulta la reproducibilidad exacta.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantias implicitas.
- Riesgo de sobreajuste al preprocesado concreto (4-frame stacking, recorte); cambios en el wrapper pueden degradar el rendimiento.
- No disponible informacion sobre sesgos; en un agente de Atari el concepto de sesgo no aplica del mismo modo que en modelos de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/janvi-ai/space-invaders-dqn-unit3
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- RL-Baselines3-Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- Curso Deep RL de Hugging Face (Unidad 3): https://huggingface.co/learn/deep-rl-course/unit3/introduction
- Entorno ALE / Atari: https://github.com/Farama-Foundation/Arcade-Learning-Environment
- Paper DQN original (Mnih et al., 2015): https://www.nature.com/articles/nature14236
