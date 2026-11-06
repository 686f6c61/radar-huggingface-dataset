# simillusion/dreamerv2-dmc-cartpole-swingup

## Resumen

Este repositorio contiene un checkpoint de demostracion de DreamerV2 entrenado sobre la tarea `cartpole swing-up` del benchmark DeepMind Control (DMC). No se trata de un modelo de lenguaje, sino de un world model de aprendizaje por refuerzo: una red que aprende una representacion latente de la dinamica del entorno y la utiliza para entrenar una politica por imaginacion, es decir, generando rollouts imaginados en lugar de interactuar constantemente con el simulador real.

El checkpoint ha sido publicado por el usuario `simillusion` como demostracion de [Simulusion](https://github.com/ParamThakkar123/simulusion), una libreria open source en PyTorch que unifica distintos world models detras de una sola API. Implementa el metodo del paper *Mastering Atari with Discrete World Models* (Hafner et al., ICLR 2021), que sustituye las variables latentes gaussianas de DreamerV1 por latentes discretas categoricas y emplea cabeceras de recompensa y valor symlog two-hot con una perdida KL balanceada.

Su relevancia es principalmente didactica y de verificacion: el modelo se entreno desde cero durante 60.000 pasos de entorno en una GPU portatil de 4 GB (RTX 3050), con lo que demuestra que el world model funciona y que puede entrenarse en hardware de consumo, aunque explicitamente **no** pretende reproducir los resultados del paper original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model DreamerV2 (RSSM con latentes discretas categoricas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de RL, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | state dict de PyTorch (cargable con `torch.load(..., weights_only=True)`) |
| Tamano del repositorio | 0,1 GB |
| Entorno de entrenamiento | DeepMind Control, tarea cartpole swing-up (MuJoCo) |
| Pasos de entrenamiento | 60.000 pasos de entorno |
| Tamano de batch | 32 |

## Arquitectura y entrenamiento

DreamerV2 es un agente de aprendizaje por refuerzo basado en modelos (model-based RL). Su nucleo es un RSSM (Recurrent State-Space Model) que aprende la dinamica del entorno en un espacio latente. La innovacion clave frente a DreamerV1 es el uso de variables latentes discretas categoricas en lugar de gaussianas, lo que, segun los autores del paper original, produce representaciones mas robustas y un mejor rendimiento. Las cabeceras de recompensa y valor emplean la codificacion symlog two-hot, y la perdida KL entre el prior y el posterior se balancea para estabilizar el entrenamiento. La politica se entrena mediante gradiente a traves de rollouts imaginados generados por el world model, sin consultar el entorno real.

Este checkpoint concreto se entreno desde cero durante 60.000 pasos de entorno con batch 32 (el maximo que cabia en memoria junto al renderer de MuJoCo) en una RTX 3050 portatil de 4 GB. El retorno de evaluacion paso de aproximadamente 75 a un rango de 165-250. Los checkpoints incluyen el estado del optimizador, por lo que permiten continuar el entrenamiento desde donde se quedo.

## Capacidades

- Prediccion de la dinamica del entorno cartpole swing-up de DeepMind Control en un espacio latente discreto.
- Rollouts imaginados: el world model puede simular trayectorias futuras sin interactuar con el simulador real (`encode` / `step` / `rollout` / `decode`).
- Reconstruccion de observaciones a partir del estado latente (decodificacion).
- Politica entrenada para resolver la tarea de swing-up del pendulo invertido.
- Continuacion de entrenamiento: los checkpoints incluyen estado del optimizador.
- Interoperabilidad: el checkpoint se carga mediante la API unificada de Simulusion (`load_world_model`), compatible con otros world models de la libreria.

No es un modelo de lenguaje: no tiene capacidades de generacion de texto, razonamiento verbal, codigo, vision general, tool calling ni agentes conversacionales.

## Casos de uso

- Docencia en model-based RL: es un checkpoint ligero (0,1 GB) ideal para explicar en clase o en tutoriales como un world model aprende la dinamica de un entorno y planifica sobre ella.
- Verificacion de instalacion de Simulusion: permite comprobar que la libreria esta correctamente instalada y funcional cargando un agente ya entrenado con `DreamerAgent.from_pretrained`.
- Punto de partida para fine-tuning: al incluir el estado del optimizador, se puede reanudar el entrenamiento y extenderlo mas alla de los 60.000 pasos para acercarse al retorno optimo de la tarea.
- Experimentacion en hardware modesto: el entrenamiento original se realizo en una RTX 3050 de 4 GB, lo que lo hace accesible a portatiles sin GPUs de datacenter.
- Generacion de visualizaciones: la interfaz de decodificacion permite producir clips del comportamiento del agente y curvas de aprendizaje para articulos, documentacion o presentaciones.
- Baseline para comparaciones: sirve como referencia de partida al evaluar otros world models (DreamerV3, TDMPC, etc.) sobre la misma tarea de DMC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la informacion disponible. Los unicos datos de rendimiento son los del propio entrenamiento de demostracion:

| Metrica | Valor |
|---|---|
| Retorno de evaluacion inicial | ~75 |
| Retorno de evaluacion tras 60k pasos | 165-250 |
| Pasos de entorno | 60.000 |
| Hardware de entrenamiento | RTX 3050 portatil (4 GB) |

El autor advierte explicitamente que no es una reproduccion de los resultados del paper de Hafner et al.

## Requisitos de hardware

- El checkpoint completo ocupa unos 0,1 GB, por lo que la inferencia es trivial en cualquier GPU moderna e incluso en CPU.
- El entrenamiento de este run concreto se realizo en una RTX 3050 portatil con 4 GB de VRAM (batch 32), lo que indica que tanto entrenar como inferir cabe sobradamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060 o superiores). No se requieren A100 ni H100.
- Despliegue: mediante la libreria Simulusion (`pip install simulusion`) y `huggingface_hub` para descargar el checkpoint. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno/tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| simillusion/dreamerv2-dmc-cartpole-swingup | World model DreamerV2 (demo, 60k pasos) | DMC cartpole swing-up | MIT | Hugging Face, checkpoint publico |
| Checkpoints DreamerV3 (Danijar Hafner) | World model de ultima generacion | Atari, DMC, Minecraft y mas | codigo open source; checkpoints segun repositorio | Repositorios del autor, no en este formato de API |
| Otros world models de Simulusion | Varios algoritmos, misma API | Segun demo | MIT | Via la libreria Simulusion |

DreamerV3, del mismo autor que DreamerV2, generaliza el enfoque con hiperparametros fijos entre dominios y suele superar a DreamerV2, pero este checkpoint destaca por su licencia MIT permisiva y su integracion directa con una API unificada en PyTorch.

## Limitaciones y advertencias

- Es un run de demostracion corto: el retorno de 165-250 esta lejos del optimo de la tarea y no reproduce los resultados del paper original.
- Alcance limitado a una unica tarea (DMC cartpole swing-up); el world model no generaliza a otros entornos sin reentrenamiento.
- No es un modelo de lenguaje: cualquier intento de usarlo como tal carece de sentido.
- Requiere Simulusion y, para reconstruir el entorno completo, el extra `simulusion[dmc]` (dependencia de MuJoCo/DeepMind Control).
- Al ser un checkpoint con muy pocas descargas (11 en el momento de la ficha), tiene poca validacion comunitaria; conviene verificar los resultados por uno mismo.
- La licencia MIT no impone restricciones de uso comercial, pero debe citarse el paper original de Hafner et al. y la libreria Simulusion segun las instrucciones de la model card.
- El rendimiento en la tarea puede variar entre ejecuciones al tratarse de RL con semillas y entornos estocasticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/simillusion/dreamerv2-dmc-cartpole-swingup
- Repositorio de Simulusion: https://github.com/ParamThakkar123/simulusion
- Paper original de DreamerV2: https://arxiv.org/abs/2010.02193
- Galeria de clips y curvas de aprendizaje de Simulusion: https://paramthakkar123.github.io/simulusion/gallery.html
