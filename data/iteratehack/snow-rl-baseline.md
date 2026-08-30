# iteratehack/snow-rl-baseline

## Resumen

Snow Locomotion para Unitree G1 es una politica de locomocion por aprendizaje por refuerzo (RL) desarrollada por el equipo Iterate (iteratehack) que permite a un robot cuadrupedo caminar sobre nieve de profundidad variable. El modelo se entrena en simulacion con Brax y MuJoCo, y se condiciona a una senal de soporte estimada procedente de un crampon sensorizado, replicando las estadisticas de error del proyecto companion `hackathon-everest`. Su relevancia radica en que aborda un problema poco explorado: la locomocion sobre superficies deformables representadas como campo de fuerzas, no como geometria solida.

El sistema emplea PPO (Proximal Policy Optimization) con redes de 512/256/128 unidades, observaciones de 156 dimensiones para el actor y 273 para el critico, y 29 objetivos articulares a 50 Hz. Incluye varios checkpoints: `baseline-v3` (caminante en terreno plano), `curr-s1` y `curr-s2` (etapas de curriculum con nieve limitada a 112 mm y 175 mm respectivamente) y `ft-full` (primer fine-tune). Es importante destacar que el modelo es exclusivamente de simulacion: no hay robot fisico, ni fisica de nieve calibrada en campo, ni datos de sensores reales en ninguna parte del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO (Brax), redes 512/256/128 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | checkpoints de Brax (normaliser, policy, value) |

## Arquitectura y entrenamiento

La politica se entrena con PPO implementado en Brax, con hiperparametros estandar del framework. La arquitectura de redes es de 512/256/128 unidades para el actor y el critico. El espacio de observaciones del actor tiene 156 dimensiones: 103 del estado estandar del entorno, 24 del estimador de soporte, 24 del mapa de creencia y 5 de reserva bilateral. El critico recibe 273 observaciones, que anaden informacion privilegiada de ground truth que se descarta en despliegue.

La innovacion clave es el modelado de la nieve como campo de fuerzas, no como geometria: el suelo de MuJoCo es un plano rigido y la nieve actua mediante `xfrc_applied`, aplicando hundimiento dependiente de profundidad y arrastre en el pie oscilante. La politica nunca ve la verdad del terreno: recibe una estimacion corrupta con estadisticas de error medidas del proyecto fuente, incluyendo una pendiente de shrinkage de 0.677 (suelo debil se lee mas fuerte de lo que es) y una tasa de falso seguro del 36,7%. El entrenamiento incluye etapas de curriculum (`curr-s1` con nieve limitada a 112 mm, `curr-s2` a 175 mm) y brazos de ablacion que anulan componentes individuales del sistema sensor.

## Capacidades

- Locomocion bidepeda sobre nieve de profundidad variable (hasta 175 mm en las etapas de curriculum actuales).
- Condicionamiento por senal de soporte estimada: la politica integra una estimacion corrupta de la capacidad de carga del terreno, con estadisticas de error realistas.
- Integracion de mapa de creencia (belief map) de 24 dimensiones y reserva bilateral de 5 dimensiones en las observaciones.
- Adaptacion a terreno plano con ligera regresion frente al baseline (74% de tracking de velocidad vs 79%).
- Mejora significativa en nieve poco profunda: 60% de tracking de velocidad y 3,59 m de distancia recorrida frente al 26% y 1,34 m del baseline.
- Entrenamiento por curriculum con checkpoints intermedios que permiten warm-start de etapas posteriores.

## Casos de uso

- Investigacion en locomocion sobre superficies deformables: el modelo permite estudiar como una politica de RL se adapta a terrenos con fisica de hundimiento, algo dificil de modelar con heightfields tradicionales.
- Benchmark para validacion de estimadores de soporte: al incluir un canal de estimacion con estadisticas de error conocidas, sirve como banco de pruebas para algoritmos de estimacion de capacidad de carga en robots.
- Desarrollo de curriculos de entrenamiento: las etapas `curr-s1` y `curr-s2` demuestran un enfoque incremental para abordar profundidades crecientes de nieve, util para investigadores que disenan curriculos en RL.
- Experimentos de ablacion de sensores: los brazos `ft-no_map`, `ft-no_support` y `ft-ablation` permiten aislar la contribucion de cada componente sensor, aunque con la advertencia de que se entrenaron con pesos de recompensa suboptimos.
- Warm-start para fine-tuning: `baseline-v3` es un punto de partida estable de 200M pasos en terreno plano, adecuado para adaptar la politica a otros terrenos o condiciones.
- Estudio de metricas de evaluacion en RL: el propio modelo card advierte que el tiempo de supervivencia es una metrica enganosa (una politica que se detiene lo maximiza), lo que lo convierte en un caso de estudio sobre como disenar metricas de evaluacion robustas.

## Benchmarks y rendimiento

Resultados medidos frente a `baseline-v3` en terreno identico, misma semilla y velocidad comandada de 0,8 m/s:

| Terreno | baseline-v3 | Entrenado en nieve | Variacion |
|---|---|---|---|
| Plano (4 mm) | 79% tracking, 5,05 m | 74%, 4,72 m | Regresion ligera |
| Poco profundo (71 mm) | 26% tracking, 1,34 m | 60%, 3,59 m | 2,7x distancia |
| Profundo (198 mm) | 2% tracking, 1,11 m | -13%, 0,51 m | Regresion |

El mejor resultado en nieve corresponde al checkpoint `curr-s1` con recompensa de 15,9 y longitud de episodio de 724 pasos. La nieve profunda regresa actualmente; las etapas de curriculum existen para abordar ese problema y la fila de nieve profunda debe re-medirse contra `curr-s3` cuando se publique.

## Requisitos de hardware

- El entrenamiento y la inferencia requieren una GPU compatible con JAX (NVIDIA con CUDA recomendada). El stack fijado es `jax==0.7.2`, `jaxlib==0.7.2`, `brax==0.14.2`, `playground==0.2.0` y `mujoco==3.12.0`.
- Tamano del repositorio: 0,5 GB, lo que incluye los checkpoints de las distintas etapas.
- No se especifican requisitos minimos de VRAM ni GPU concretas en la informacion disponible.
- El despliegue se realiza cargando los checkpoints con la API de Brax (`brax.training.agents.ppo.checkpoint.load`), no mediante frameworks de inferencia como vLLM u Ollama, que no aplican a politicas de RL.
- Advertencia importante: versiones posteriores de JAX eliminan `device_put_replicated`, que Brax aun utiliza; hay que mantener las versiones fijadas del stack.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de locomocion sobre nieve o superficies deformables. Los resultados de busqueda web solo arrojaron referencias a Stable-Baselines3 y RL Baselines3 Zoo, que son frameworks de RL en PyTorch no directamente comparables con esta politica entrenada en Brax/JAX.

## Limitaciones y advertencias

- Exclusivamente simulacion: no hay robot fisico, ni fisica de nieve calibrada en campo, ni datos de sensores reales en toda la cadena.
- El modelo de error del estimador proviene de metricas de simulacion held-out, no de sensores reales, y hereda todas las limitaciones del terreno sintetico y del modelo de contacto de orden reducido.
- La nieve profunda (198 mm) regresa frente al baseline: la politica actual no es util para nieve profunda hasta que se publique `curr-s3`.
- Los brazos de ablacion (`ft-no_map`, `ft-no_support`, `ft-ablation`) se entrenaron con pesos de recompensa que posteriormente se midieron como deficientes (2% de tracking de velocidad) y resultaron estadisticamente indistinguibles; deben tratarse como demostracion de metodo, no como evidencia sobre los componentes.
- El tiempo de supervivencia es una metrica enganosa: una politica que se detiene lo maximiza. Hay que evaluar por distancia y tracking de velocidad.
- La reclamacion defendible es estrecha: una politica condicionada a una senal de soporte estimada supera a la politica identica sin ese canal en terreno identico, y eso se cumple en nieve poco profunda, no en nieve profunda.
- Licencia MIT: permite uso comercial sin restricciones de atribucion, pero el modelo no esta validado para uso en robots fisicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iteratehack/snow-rl-baseline
- Perfil de la organizacion Iterate: https://huggingface.co/iteratehack
- Proyecto companion `hackathon-everest` (mencionado en la model card, sin URL directa en la informacion disponible)
