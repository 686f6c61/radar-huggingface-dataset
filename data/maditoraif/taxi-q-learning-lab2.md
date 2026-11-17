# maditoraif/taxi-q-learning-lab2

## Resumen

`maditoraif/taxi-q-learning-lab2` es un agente de aprendizaje por refuerzo entrenado con el algoritmo Q-Learning tabular sobre el entorno `Taxi-v4` de Gymnasium. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q serializada en formato pickle que el autor ha subido a Hugging Face como resultado de un ejercicio de laboratorio (el sufijo `lab2` y el tag `custom-implementation` apuntan a un contexto academico).

El modelo resuelve la tarea de recoger y dejar pasajeros en una cuadricula de 5x5 con cuatro ubicaciones de recogida y destino, un problema clasico de control con 500 estados discretos. Su relevancia es didactica: sirve como referencia de implementacion de Q-Learning desde cero y como ejemplo de publicacion de agentes RL en el Hub mediante el formato estandar de `stable-baselines3` y `rl-zoo`.

El repositorio tiene un tamano de 0.0 GB (los pesos ocupan unos pocos kilobytes), sin descargas ni likes en el momento de la consulta, y sin licencia ni idiomas declarados. No hay informacion sobre arquitectura neuronal, parametros, contexto ni cuantizacion porque el objeto no es un transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla de valores Q por par estado-accion) |
| Parametros totales | no disponible (no es una red neuronal; tabla de 500 estados x 6 acciones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno MDP de horizonte episodico, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (no aplica a una tabla Q discreta) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |
| Entorno | `Taxi-v4` (Gymnasium) |
| Algoritmo | Q-Learning (off-policy, TD control) |
| Espacio de estados | 500 estados discretos |
| Espacio de acciones | 6 acciones discretas |

## Arquitectura y entrenamiento

El agente implementa Q-Learning clasico, un metodo de control off-policy basado en diferencias temporales que actualiza la funcion de valor-accion Q(s,a) mediante la regla de Bellman con una tasa de aprendizaje y un factor de descuento. Al ser tabular, la "arquitectura" es una matriz de 500 x 6 valores (los 500 estados del entorno Taxi-v4 y las 6 acciones: mover norte, sur, este, oeste, recoger pasajero y dejar pasajero). No hay capas, atencion ni parametros entrenables en el sentido habitual de deep learning.

No se dispone de informacion sobre el numero de episodios de entrenamiento, la politica de exploracion (epsilon-greedy y su decaimiento), la tasa de aprendizaje, el factor de descuento ni el numero de semillas utilizadas. El tag `custom-implementation` sugiere que el autor escribio el bucle de entrenamiento manualmente en lugar de usar una libreria de RL de alto nivel, pero este extremo no se confirma en la model card. Tampoco consta el uso de tecnicas avanzadas como Double Q-Learning, experience replay o redes objetivo.

## Capacidades

- Resolucion del entorno `Taxi-v4`: el agente aprende una politica que recoge al pasajero y lo deja en el destino dentro de la cuadricula.
- Control discreto en espacios de estados y acciones finitos: adecuado para MDPs pequenos y totalmente observables.
- Inferencia determinista por consulta a tabla: dado un estado, devuelve la accion con mayor valor Q.
- Carga estandarizada mediante `load_from_hub` y compatible con el ecosistema `gym.make(model["env_id"])`.
- No soporta tool calling, function calling, agentes multi-paso fuera del entorno, generacion de texto, codigo, matematicas, vision, audio ni capacidades multilingues.
- No dispone de modo de razonamiento explicito ni de mecanismos de planificacion mas alla de la politica greedy aprendida.

## Casos de uso

- Docencia de aprendizaje por refuerzo: sirve como ejemplo minimo y reproducible de Q-Learning tabular para practicas de laboratorio, ya que el agente y el entorno caben en memoria y el entrenamiento es rapido.
- Verificacion de pipelines de RL: util para comprobar que el flujo `load_from_hub` -> `gym.make` -> evaluacion funciona antes de escalar a entornos mas complejos.
- Baseline de comparacion: referencia de rendimiento (mean_reward 7.56) frente a agentes mas sofisticados (DQN, PPO) sobre `Taxi-v4`.
- Demostracion de publicacion en el Hub: ejemplo de como estructurar una model card con `model-index` y resultados declarados para agentes RL.
- Pruebas de integracion con Gymnasium: validacion de la API de entornos discretos y de la serializacion de politicas en pickle.
- Prototipado de entornos de planificacion de rutas simplificados: el esquema estado-accion de Taxi es analogo a problemas de recogida y entrega en logistica, y el agente puede servir de esbozo conceptual.
- No es adecuado para produccion real: su dominio esta limitado a un unico entorno de juguete y no generaliza a otros problemas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| mean_reward | Taxi-v4 | 7.56 +/- 2.71 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No se dispone de comparaciones con otros agentes sobre el mismo entorno ni de desviacion estandar por semilla, numero de episodios de evaluacion o intervalo de confianza.

## Requisitos de hardware

- VRAM estimada: 0 GB (la tabla Q ocupa unos pocos kilobytes; no requiere GPU).
- GPU recomendadas: ninguna; el agente se ejecuta en CPU sin penalizacion.
- Cabe en cualquier consumer GPU y en cualquier CPU moderna, incluidos entornos sin aceleracion.
- Opciones de despliegue: Python con `gymnasium` y `pickle`/`load_from_hub`; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: la inferencia es una consulta a una tabla de 500 x 6 entradas, con latencia despreciable (microsegundos) y throughput limitado unicamente por el bucle del entorno.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada otros agentes publicados sobre `Taxi-v4` con los que comparar parametros, contexto, rendimiento o licencia. Como referencia conceptual, cabria comparar con agentes DQN o PPO sobre el mismo entorno, pero no se dispone de sus resultados en esta ficha.

## Limitaciones y advertencias

- El agente solo es valido para `Taxi-v4`; no generaliza a otros entornos ni a variantes con distinta configuracion (por ejemplo, `is_slippery` distinto del usado en entrenamiento).
- La model card advierte de que pueden ser necesarios atributos adicionales al cargar el entorno; una configuracion distinta invalida la politica aprendida.
- El resultado declarado (7.56 +/- 2.71) no esta verificado y la desviacion estandar es alta en relacion con la media, lo que sugiere una politica inestable o pocas evaluaciones.
- No hay licencia declarada: el uso comercial y la redistribucion quedan en un limbo legal hasta que el autor la especifique.
- No hay informacion sobre sesgos, alucinacion o limitaciones idiomaticas porque el modelo no procesa lenguaje; estos riesgos no aplican.
- El formato de pesos es pickle, lo que implica riesgos de seguridad al deserializar ficheros de origen no confiable.
- No apto para produccion: es un artefacto de laboratorio sin mantenimiento, sin documentacion de entrenamiento y sin garantias de reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/maditoraif/taxi-q-learning-lab2
- Entorno Taxi-v4 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de `load_from_hub` (stable-baselines3 / rl-zoo): https://huggingface.co/docs/hub/stable-baselines3
- No se han encontrado en la busqueda web papers, blogs, repos ni demos adicionales asociados a este modelo.
