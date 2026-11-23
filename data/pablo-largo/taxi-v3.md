# pablo-largo/Taxi-v3

## Resumen

Taxi-v3 es un agente de aprendizaje por refuerzo entrenado con Q-learning sobre el entorno Taxi-v4 de Gymnasium. Lo publica el usuario pablo-largo en Hugging Face y no es un modelo de lenguaje: se trata de una tabla Q serializada en formato pickle que representa la politica aprendida para resolver la tarea de recoger y dejar pasajeros en una cuadricula.

El entorno Taxi-v4 es un problema clasico de control discreto con 500 estados posibles (25 posiciones del taxi, 5 ubicaciones de pasajero, 4 destinos y el estado de recogida) y 6 acciones. El agente aprende una funcion Q tabular que asigna un valor a cada par estado-accion, sin red neuronal ni parametros entrenables en el sentido habitual.

Su relevancia es principalmente didactica y de referencia: sirve como ejemplo minimo de un agente Q-learning empaquetado con el formato estandar de Hugging Face para reinforcement learning, con un resultado declarado de recompensa media de 7.52 +/- 2.62 sobre Taxi-v4. No hay informacion sobre arquitectura neuronal, contexto, idiomas ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q, sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones como maximo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle (q-learning.pkl) |

## Arquitectura y entrenamiento

El agente implementa Q-learning clasico, un algoritmo de diferencias temporales off-policy que actualiza iterativamente los valores Q(s, a) mediante la regla de actualizacion de Bellman con una tasa de aprendizaje y un factor de descuento. Al ser tabular, no hay funcion de aproximacion: la politica se almacena en una estructura de datos indexada por estado y accion.

El entorno objetivo es Taxi-v4, que hereda la dinamica de Taxi-v3 de Gymnasium. El autor indica que el modelo se carga con `load_from_hub` desde el repositorio y que puede requerir ajustar atributos del entorno como `is_slippery`. No se documentan hiperparametros (alpha, gamma, epsilon, numero de episodios), composicion del dataset ni si hubo tecnicas adicionales de exploracion o decodificacion.

## Capacidades

- Resolucion del entorno Taxi-v4 mediante politica greedy derivada de la tabla Q aprendida.
- Seleccion de accion en entornos discretos con 500 estados y 6 acciones.
- Carga directa desde Hugging Face Hub mediante la utilidad `load_from_hub`.
- Integracion con Gymnasium a traves de `gym.make(model["env_id"])`.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues, de vision, audio ni generacion de texto.
- No dispone de modo thinking ni de decodificacion especulativa.

## Casos de uso

- Docencia de reinforcement learning: usar el agente como ejemplo funcional de Q-learning tabular para explicar la actualizacion de Bellman y la exploracion epsilon-greedy en un entorno pequeno y rapido de ejecutar.
- Baseline de referencia: comparar algoritmos mas avanzados (DQN, PPO, SARSA) contra este agente tabular en Taxi-v4 para medir la mejora relativa en recompensa media.
- Pruebas de infraestructura de RL: validar pipelines de carga de modelos desde el Hub, serializacion pickle y ejecucion de episodios con Gymnasium antes de escalar a entornos mayores.
- Experimentos de evaluacion: reproducir la metrica declarada (7.52 +/- 2.62) con distintas semillas para estudiar la varianza del agente entrenado.
- Demostraciones educativas: ilustrar como se empaqueta un agente de RL con el formato estandar de Hugging Face (tags, model-index, fichero de pesos) en talleres y tutoriales.
- Investigacion de entornos discretos: emplear el agente como punto de partida para estudiar sensibilidad a cambios en la dinamica del entorno, por ejemplo activando o desactivando `is_slippery`.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Entorno | Metrica | Valor | Verificado |
|---|---|---|---|
| Taxi-v4 | mean_reward | 7.52 +/- 2.62 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: practicamente nula; la tabla Q cabe en memoria principal y no requiere GPU.
- GPU recomendadas: no aplica; la inferencia es una consulta a una tabla en CPU.
- Cabe en cualquier equipo consumer, incluidos portatiles de gama baja y entornos sin GPU.
- Despliegue: ejecucion directa con Python, Gymnasium y la utilidad de carga de Hugging Face Hub; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una consulta tabular, la latencia por paso es del orden de microsegundos en CPU, si bien el cuello de botella real sera el propio entorno Gymnasium.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pablo-largo/Taxi-v3 | Q-learning tabular | Taxi-v4 | 7.52 +/- 2.62 | no disponible | Hugging Face |
| Agentes Q-learning de la comunidad (p. ej. los publicados con la plantilla de RL de Hugging Face) | Q-learning tabular | Taxi-v3 / Taxi-v4 | no disponible | variable | Hugging Face |
| Agentes DQN sobre Taxi | Deep Q-Network | Taxi-v3 | no disponible | variable | Repositorios de investigacion |
| Agentes PPO sobre Taxi | Policy gradient | Taxi-v3 | no disponible | variable | Repositorios de investigacion |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El resultado de recompensa media no esta verificado (`verified: false`) y procede unicamente del autor.
- La tabla Q solo es valida para el entorno Taxi-v4 con la configuracion exacta de entrenamiento; cambios en `is_slippery` u otras opciones pueden degradar la politica.
- No hay informacion sobre licencia, lo que impide confirmar si el uso comercial esta permitido.
- El formato pickle puede suponer un riesgo de seguridad al deserializar ficheros de origen no confiable.
- No se documentan hiperparametros ni semillas, lo que dificulta la reproducibilidad exacta del entrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta agentes conversacionales ni tool calling.
- El tamano del repositorio es de 0.0 GB, coherente con una tabla Q pequena, pero no se detalla el contenido exacto de los ficheros.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque no aplican a este tipo de modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pablo-largo/Taxi-v3
- Entorno Taxi-v4 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Hugging Face sobre reinforcement learning: https://huggingface.co/docs/hub/models-libraries#reinforcement-learning
- Repositorio de Gymnasium: https://github.com/Farama-Foundation/Gymnasium
