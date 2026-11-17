# dora-nguyen/RL-Taxi-V4

## Resumen

RL-Taxi-V4 es un agente de aprendizaje por refuerzo entrenado con Q-Learning sobre el entorno Taxi-v4 de Gymnasium. Lo publica el usuario dora-nguyen en Hugging Face y no se trata de un modelo de lenguaje: es un artefacto de politica tabular serializado en un fichero `q-learning.pkl` que se carga mediante `load_from_hub` y se ejecuta contra el entorno `Taxi-v4` de Gymnasium. El repositorio no contiene pesos neuronales ni safetensors, sino una tabla Q aprendida.

El entorno Taxi-v4 es un problema clasico de planificacion con 500 estados discretos: un taxi debe recoger y dejar pasajeros en cuatro ubicaciones de una cuadricula, con recompensas de -1 por paso, +20 por entrega correcta y -10 por recogida o entrega ilegal. El agente reporta una recompensa media de 7,44 +/- 2,82, lo que indica una politica funcional pero lejos del optimo teorico del entorno (alrededor de 8-9 de recompensa media en politicas bien entrenadas). Su relevancia es didactica y de referencia: sirve como ejemplo reproducible de un pipeline de RL tabular con la libreria de Hugging Face.

No hay informacion sobre arquitectura neuronal, tamano de parametros, contexto, idiomas ni licencia, porque no aplican en el sentido habitual a un agente Q-Learning tabular. Esta ficha documenta el artefacto tal como esta publicado, senalando explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q sobre estados discretos de Taxi-v4) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones en el entorno Taxi-v4; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no aplica; el artefacto es un `.pkl` serializado) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python, cargado con `load_from_hub`) |

## Arquitectura y entrenamiento

El agente emplea Q-Learning, un metodo de diferencias temporales off-policy que actualiza una tabla Q(s, a) con la regla de Bellman: Q(s,a) <- Q(s,a) + alpha * (r + gamma * max_a' Q(s',a') - Q(s,a)). El entorno Taxi-v4 tiene un espacio de observacion discreto de 500 estados y un espacio de acciones discreto de 6 movimientos (norte, sur, este, oeste, recoger y dejar). Al ser tabular, no hay red neuronal, ni funcion de perdida diferenciable, ni fases de preentrenamiento o RLHF.

La model card no detalla hiperparametros (tasa de aprendizaje alpha, factor de descuento gamma, politica epsilon-greedy, numero de episodios) ni la composicion del dataset de entrenamiento, porque el entrenamiento es por interaccion con el simulador, no sobre un corpus. El fichero serializado incluye presumiblemente la tabla Q y el identificador del entorno; el autor advierte en el ejemplo de uso que puede ser necesario anadir atributos adicionales al entorno, como `is_slippery=False`, lo que sugiere que la politica se entreno con una configuracion concreta del simulador que debe reproducirse en inferencia.

## Capacidades

- Resolucion del entorno Taxi-v4: seleccionar acciones discretas (6 posibles) en cada uno de los 500 estados para recoger y entregar pasajeros.
- Politica greedy derivada de la tabla Q aprendida, ejecutable con `gym.make(model["env_id"])`.
- Carga directa desde el Hub mediante `load_from_hub(repo_id="dora-nguyen/RL-Taxi-V4", filename="q-learning.pkl")`.
- No soporta generacion de texto, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso en el sentido de LLM; su "razonamiento" se limita a la explotacion de la tabla Q.
- No tiene capacidades multilingues ni modo thinking.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el agente sirve como ejemplo ejecutable de Q-Learning tabular para practicas de asignatura, ya que el entorno Taxi-v4 es pequeno y el ciclo completo (carga, `gym.make`, bucle de evaluacion) cabe en pocas lineas.
- Verificacion de pipelines de RL: util para probar integraciones con `stable-baselines3` o el ecosistema `gymnasium` sin necesidad de entrenar desde cero.
- Baseline de comparacion: sir Sig como referencia de rendimiento (7,44 +/- 2,82) frente a agentes propios en Taxi-v4, por ejemplo al evaluar variantes de Q-Learning, SARSA o Deep Q-Network.
- Reproduccion de experimentos: permite reproducir la politica publicada y contrastar hiperparametros o semillas sin reentrenar.
- Pruebas de regresion en entornos Gymnasium: sirve para validar que una version concreta de Gymnasium mantiene compatibilidad con el entorno Taxi-v4 y con el formato de serializacion.
- Demostraciones de despliegue en el Hub: ejemplo minimo de como empaquetar y cargar un agente de RL con `load_from_hub` en notebooks o scripts de ejemplo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v4 | mean_reward | 7,44 +/- 2,82 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el artefacto es una tabla Q serializada en pickle y se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleracion por hardware.
- Cabe en cualquier consumer GPU y en CPU convencional; el cuello de botella es el propio simulador de Gymnasium, no el agente.
- Opciones de despliegue: script Python con `gymnasium` y la utilidad `load_from_hub` del ecosistema Hugging Face; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del bucle de evaluacion y del simulador, no del agente.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RL-Taxi-V4 (dora-nguyen) | Q-Learning tabular | Taxi-v4 | 7,44 +/- 2,82 | no disponible | Hugging Face |
| Agentes Q-Learning de referencia en Taxi-v4 | Q-Learning tabular | Taxi-v4 | no disponible | variable | no disponible |
| Agentes DQN sobre Taxi-v4 | Deep Q-Network | Taxi-v4 | no disponible | variable | no disponible |

No se dispone de datos publicados de modelos comparables en la informacion proporcionada; la comparativa queda limitada al propio artefacto.

## Limitaciones y advertencias

- Rendimiento limitado: 7,44 +/- 2,82 de recompensa media esta por debajo del optimo del entorno Taxi-v4, por lo que la politica comete errores frecuentes.
- Alta varianza: la desviacion tipica de 2,82 indica comportamiento inestable entre episodios.
- Dependencia del entorno: la politica solo es valida para Taxi-v4 con la configuracion exacta de entrenamiento; el autor advierte que puede requerir ajustar atributos como `is_slippery=False`.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion; conviene contactar con el autor antes de reutilizarlo en produccion.
- Sin documentacion de hiperparametros ni de semillas, lo que dificulta la reproducibilidad exacta.
- Riesgo de seguridad al cargar un `.pkl`: la deserializacion de pickle ejecuta codigo arbitrario; solo debe cargarse desde fuentes de confianza.
- Sin soporte de lenguaje natural, vision, audio ni tool calling; no es un sustituto de un LLM en ninguna tarea de texto.
- Metrica no verificada (`verified: false`): el resultado procede del autor y no ha sido validado por un tercero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dora-nguyen/RL-Taxi-V4
- Entorno Taxi-v4 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de `load_from_hub` (ecosistema Hugging Face): https://huggingface.co/docs/hub
