# SMONICA/Taxi_n_passenger

## Resumen

`SMONICA/Taxi_n_passenger` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning tabular sobre el entorno `Taxi-v3` de Gymnasium. Lo desarrolla el usuario SMONICA y se publica en Hugging Face como un artefacto de política serializada (fichero `q-learning.pkl`), no como un modelo neuronal con pesos en safetensors. El problema que resuelve es el clásico benchmark de control discreto: un taxi debe recoger y dejar pasajeros en una cuadrícula de 5x5 con cuatro ubicaciones posibles, gestionando la recogida, el destino y las paredes del mapa.

El interés de esta ficha es limitado desde el punto de vista de la IA generativa: no es un modelo de lenguaje, no procesa texto ni imágenes, y su "contexto" es el espacio de estados discreto del entorno (500 estados en `Taxi-v3`). Se trata de un ejemplo canónico de Q-Learning con tabla de valores Q, útil para docencia, para reproducir experimentos de RL clásico y para verificar pipelines de `stable-baselines3` / `huggingface_sb3`.

La relevancia actual es la de un artefacto educativo: sirve como referencia mínima de cómo se publica una política de RL en el Hub y de cómo se evalúa con `mean_reward`. No debe confundirse con un modelo fundacional ni usarse en producción fuera del entorno `Taxi-v3`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla de valores Q sobre espacio de estados discreto) |
| Parametros totales | no disponible (tabla Q, no red neuronal; tamaño no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno `Taxi-v3`, 500 estados discretos) |
| Tipos de cuantizacion | no aplica (política serializada en `q-learning.pkl`) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clásico, un método de diferencias temporales off-policy que aprende una tabla `Q(s, a)` actualizando los valores con la regla de Bellman y una tasa de aprendizaje. El espacio de estados de `Taxi-v3` es discreto y finito (500 estados), y el espacio de acciones tiene 6 acciones discretas (mover en cuatro direcciones, recoger y dejar pasajero). No hay red neuronal, ni atención, ni representaciones vectoriales: la "arquitectura" es una tabla de consulta.

No se dispone de información sobre hiperparámetros (tasa de aprendizaje, factor de descuento, política epsilon-greedy, número de episodios), composición del dataset ni si se aplicó algún tipo de currículo o ajuste fino. La model card únicamente indica que es un agente Q-Learning entrenado sobre `Taxi-v3` y muestra el fragmento de carga con `load_from_hub`. El resultado declarado de `mean_reward` es 7.56 ± 2.71, sin verificación independiente (`verified: false`).

## Capacidades

- Resolución del entorno `Taxi-v3`: recoger y dejar pasajeros en una cuadrícula 5x5 con cuatro destinos y paredes.
- Política determinista derivada de la tabla Q (acción `argmax` por estado).
- Ejecución en entornos Gymnasium compatibles con `Taxi-v3`.
- Carga mediante `load_from_hub` de `huggingface_sb3`.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del propio episodio del entorno.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo resuelto de Q-Learning tabular para comparar con variantes como SARSA o Double Q-Learning en el mismo entorno.
- Verificación de pipelines de publicación: comprobar el flujo `entrenar → guardar con pickle → subir al Hub → cargar con load_from_hub` antes de escalar a modelos mayores.
- Baseline de referencia: comparar nuevas políticas (DQN, PPO) contra este `mean_reward` de 7.56 ± 2.71 en `Taxi-v3`.
- Pruebas de integración de entornos Gymnasium: validar que una instalación de `gym.make("Taxi-v3")` funciona correctamente ejecutando este agente.
- Reproducibilidad de experimentos: servir como artefacto fijo para replicar curvas de aprendizaje o estudiar la varianza del reward entre episodios.
- Demostraciones educativas interactivas: visualizar la política del taxi en notebooks o entornos web sin depender de GPU.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.56 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (la política es una tabla Q en CPU).
- GPU recomendadas: no aplica; el agente se ejecuta en CPU.
- Cabe en cualquier consumer GPU y en cualquier CPU convencional.
- Opciones de despliegue: `gymnasium` + `huggingface_sb3` (`load_from_hub`), o carga directa del fichero `q-learning.pkl` con `pickle`.
- Latencia y throughput: no disponibles; dependen del bucle de simulación del entorno, no del modelo.
- Tamaño del repositorio: 0.0 GB según el Hub, coherente con una tabla Q pequeña.

## Comparativa con modelos similares

| Modelo | Metodo | Entorno | Parametros | Licencia | mean_reward |
|---|---|---|---|---|---|
| SMONICA/Taxi_n_passenger | Q-Learning tabular | Taxi-v3 | no disponible | no disponible | 7.56 +/- 2.71 |
| Agentes DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | red pequeña (no declarada) | variable | no disponible |
| Agentes PPO sobre Taxi-v3 | Policy Gradient | Taxi-v3 | red pequeña (no declarada) | variable | no disponible |

No se dispone de resultados comparativos verificados en la informacion proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no admite prompts.
- La política está sobreajustada al entorno `Taxi-v3`; no es transferible a otros entornos sin reentrenamiento.
- El `mean_reward` de 7.56 ± 2.71 tiene una desviación alta respecto a la media, lo que sugiere una política ruidosa o un número limitado de episodios de evaluación.
- El resultado está marcado como no verificado (`verified: false`) por el autor.
- Licencia no disponible: no se puede garantizar el uso comercial sin consultar al autor.
- Formato de pesos en `pickle`: implica riesgo de seguridad al deserializar ficheros de origen no confiable.
- No hay información sobre hiperparámetros ni sobre el proceso de entrenamiento, lo que dificulta la reproducibilidad.
- Sin información sobre sesgos: al operar en un entorno sintético, no aplican sesgos sociales, pero tampoco hay garantías de robustez ante modificaciones del entorno (por ejemplo, `is_slippery=True`).

## Enlaces

- Hugging Face: https://huggingface.co/SMONICA/Taxi_n_passenger
- Documentación de Gymnasium `Taxi-v3`: https://gymnasium.farama.org/environments/toy_text/taxi/
- `huggingface_sb3` (carga de agentes): https://github.com/huggingface/huggingface_sb3
- Stable-Baselines3: https://stable-baselines3.readthedocs.io/
