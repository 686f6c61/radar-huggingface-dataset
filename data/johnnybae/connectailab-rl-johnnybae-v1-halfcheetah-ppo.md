# Johnnybae/connectailab-rl-johnnybae-v1-halfcheetah-ppo

## Resumen

`connectailab-rl-johnnybae-v1-halfcheetah-ppo` es un agente de aprendizaje por refuerzo (RL) entrenado con el algoritmo PPO para el entorno `HalfCheetah-v5` de MuJoCo, un problema clasico de control continuo en el que un modelo biomecanico de dos dimensiones debe aprender a correr sobre cuatro patas. Lo publica el usuario Johnnybae bajo el paraguas del proyecto educativo CONNECT AI LAB, en el marco de un curso de RL, y no es un modelo de lenguaje: es una politica neuronal que mapea estados de 17 dimensiones a acciones de par motor de 6 dimensiones.

El interes del artefacto es principalmente pedagogico y de reproducibilidad: documenta de forma explicita hiperparametros, numero de pasos de entrenamiento y una modificacion del entorno (un wrapper anti-volteretas) orientada a evitar que el agente aprenda a girar o rodar en lugar de correr. Alcanza una recompensa acumulada media de +6036,1 puntos en ese entorno modificado, una cifra que no es directamente comparable con los resultados publicados sobre `HalfCheetah-v5` estandar.

Por su naturaleza no tiene contexto, vocabulario, cuantizacion ni capacidades linguisticas. Su relevancia actual se limita al ambito de la docencia en RL y a la experimentacion con PPO en MuJoCo; no es un componente apto para despliegues de inferencia de lenguaje ni para tareas de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP Actor-Critic de dos cabezas (17 -> 128 -> 128 -> 6) entrenada con PPO |
| Parametros totales | no disponible (no se publica el recuento; por la topologia declarada, del orden de decenas de miles de pesos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan pesos en FP16, INT8 ni GGUF) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la model card; el repositorio declara `library_name: pytorch` y un tamano de 0.0 GB |
| Entorno | `HalfCheetah-v5` (MuJoCo): estado de 17 dimensiones, accion de 6 dimensiones de par |
| Algoritmo | PPO (Actor-Critic) |
| Pasos de entrenamiento | 2.000.000 |
| Clip ratio | 0,15 |
| Learning rate | 0,0003 (Adam) |
| Normalizacion de estado | Welford Running Normalizer sobre las 17 dimensiones |
| Inicializacion de pesos | 0,001 (soft start) |

## Arquitectura y entrenamiento

La politica es una red neuronal densa de dos capas ocultas de 128 unidades con dos cabezas, una para el actor (distribucion de politica sobre las 6 acciones de par) y otra para el critico (estimacion del valor del estado). Se entrena con PPO sobre `HalfCheetah-v5`, con un limite de cambio de politica del 15 % (clip 0,15), optimizador Adam con tasa de aprendizaje 3e-4 y un total de 2.000.000 de pasos de interaccion con el entorno. El estado de 17 dimensiones se normaliza en linea mediante un `WelfordRunningNormalizer`, lo que estabiliza el aprendizaje ante la heterogeneidad de escalas de las observaciones.

La innovacion declarada por el autor no esta en el algoritmo sino en el preprocesado del entorno: se aplica un wrapper que penaliza o bloquea el volteo y el rodamiento, y se inicializan los pesos con un valor muy bajo (0,001) para evitar que el agente empiece ejecutando una voltereta hacia atras. Segun la model card, esto produce cero volteretas al inicio del entrenamiento y una recompensa media de +6036,1 puntos, frente a valores cercanos a cero antes del aprendizaje. No se documentan detalles sobre semillas, numero de entornos en paralelo, tamano de lote, numero de epochs por actualizacion ni funcion de recompensa exacta del wrapper, por lo que la reproducibilidad completa no esta garantizada con la informacion publicada.

## Capacidades

- Control continuo de un agente biomecanico de dos dimensiones en MuJoCo: genera acciones de par de 6 dimensiones a partir de observaciones de 17 dimensiones.
- Locomocion cuadrupeda: aprender a correr erguido sobre cuatro patas en `HalfCheetah-v5`.
- Estabilidad postural: el wrapper anti-volteretas desincentiva comportamientos de giro o rodamiento.
- Inferencia determinista o estocastica segun se muestree la cabeza del actor (no se especifica en la model card cual se uso para la evaluacion).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbolico, vision, audio ni procesamiento de lenguaje natural.
- No tiene capacidades multilingues ni modo de razonamiento extendido.

## Casos de uso

- Docencia de PPO en cursos de RL: sirve como ejemplo ejecutable y documentado de un agente PPO que resuelve un entorno clasico de MuJoCo, con hiperparametros y curvas de recompensa descritos en la model card.
- Reproduccion de practicas de laboratorio: el repositorio permite a estudiantes comparar su propia implementacion de PPO contra una referencia con recompensa declarada de +6036,1 puntos en el entorno modificado.
- Estudio de wrappers de entorno: el wrapper anti-volteretas es un caso concreto para analizar como el diseno de la recompensa y las restricciones del entorno moldean la politica aprendida.
- Baseline para experimentos de control continuo: util como punto de partida al probar variantes de PPO, normalizacion de observaciones o inicializacion de pesos en `HalfCheetah`.
- Analisis de estabilidad del entrenamiento: la combinacion de clip 0,15, learning rate 3e-4 y soft start de 0,001 es un caso de estudio sobre como evitar colapsos tempranos en PPO.
- Demostraciones en clase o talleres: visualizar la politica en MuJoCo requiere solo una GPU modesta o incluso CPU, lo que facilita demostraciones en vivo.
- Pruebas de infraestructura de RL: validar pipelines de entrenamiento y evaluacion con un entorno ligero antes de escalar a tareas mas costosas.

## Benchmarks y rendimiento

La unica metrica publicada es la recompensa acumulada media declarada por el autor en el entorno modificado:

| Metrica | Entorno | Resultado declarado |
|---|---|---|
| Recompensa acumulada media | `HalfCheetah-v5` con wrapper anti-volteretas | +6036,1 |
| Recompensa antes del entrenamiento | mismo entorno | aproximadamente 0 |
| Volteretas al inicio | mismo entorno | 0 |

No se han publicado resultados de benchmarks estandar (por ejemplo, recompensa en `HalfCheetah-v5` sin modificaciones, comparaciones con otras implementaciones de PPO o con SAC/TD3) en la informacion disponible. La cifra de +6036,1 no es directamente comparable con la literatura, porque el wrapper altera la dinamica y probablemente la funcion de recompensa del entorno original.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; la red es un MLP de dos capas de 128 unidades y el repositorio ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 o superior, RTX 3060, RTX 4090) es mas que suficiente; tambien puede ejecutarse en CPU sin problema apreciable.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con soporte CUDA, e incluso en Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: PyTorch nativo, exportacion a TorchScript u ONNX si se desea, y ejecucion dentro de MuJoCo con `gymnasium`. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la topologia, la inferencia por paso deberia estar en el orden de microsegundos en GPU y de decenas de microsegundos en CPU, pero no hay mediciones publicadas.
- Entrenamiento: 2.000.000 de pasos en MuJoCo `HalfCheetah-v5` son asequibles en una sola GPU consumer o incluso en CPU en tiempos del orden de horas, aunque no se documenta el tiempo exacto empleado.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Algoritmo | Recompensa declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-johnnybae-v1-halfcheetah-ppo | Politica MLP PPO | `HalfCheetah-v5` con wrapper anti-volteretas | PPO | +6036,1 (entorno modificado) | no disponible | HuggingFace |
| Implementaciones de referencia de PPO en CleanRL o Stable-Baselines3 | Politicas MLP PPO | `HalfCheetah-v4`/`v5` estandar | PPO | no disponible en esta ficha | MIT en los proyectos citados (verificar) | GitHub |
| Algoritmos off-policy (SAC, TD3) en `HalfCheetah` | Politicas MLP | `HalfCheetah-v4`/`v5` estandar | SAC / TD3 | no disponible en esta ficha | MIT en los proyectos citados (verificar) | GitHub |

No se dispone de datos publicados que permitan una comparacion numerica homogenea con este modelo, ya que la metrica declarada corresponde a un entorno modificado y no se aportan resultados en el entorno estandar. Cualquier comparacion directa con cifras de la literatura requeriria reevaluar la politica en `HalfCheetah-v5` sin wrapper.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene contexto, tokenizador ni capacidades de generacion.
- La recompensa de +6036,1 se obtiene en un entorno con wrapper anti-volteretas; no es directamente comparable con resultados publicados en `HalfCheetah-v5` estandar.
- No se especifica la licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor la declare.
- No se documentan semillas, configuracion completa de PPO (batch size, epochs, GAE lambda, numero de entornos) ni el codigo de entrenamiento, lo que limita la reproducibilidad exacta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- El autor no publica el recuento exacto de parametros ni los pesos en un formato estandar distinto de PyTorch; no hay garantia de que el checkpoint sea cargable sin el codigo original.
- La politica esta sobreajustada a un unico entorno y morfologia; no generaliza a otras tareas de control ni a variaciones de `HalfCheetah` sin reentrenamiento.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo de lenguaje.
- Sesgos conocidos: no documentados; en RL, la politica puede explotar artefactos del simulador y de la funcion de recompensa, algo que el wrapper del autor intenta mitigar parcialmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Johnnybae/connectailab-rl-johnnybae-v1-halfcheetah-ppo
- Perfil del autor en HuggingFace: https://huggingface.co/Johnnybae
- Entorno `HalfCheetah-v5` en Gymnasium (documentacion): https://gymnasium.farama.org/environments/mujoco/half_cheetah/
- MuJoCo (documentacion oficial): https://mujoco.org/
- PPO, paper original de Schulman et al.: https://arxiv.org/abs/1707.06347
- CleanRL (implementaciones de referencia de PPO): https://github.com/vwxyzjn/cleanrl
- Stable-Baselines3 (implementaciones de referencia de PPO y SAC): https://github.com/DLR-RM/stable-baselines3
