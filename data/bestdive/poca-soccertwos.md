# bestdive/poca-SoccerTwos

## Resumen

poca-SoccerTwos es una politica de aprendizaje por refuerzo multiagente entrenada por Kay Zheng (usuario bestdive) para el entorno SoccerTwos de Unity ML-Agents, y publicada en Hugging Face como parte del curso Deep RL de Hugging Face (unidad 7). No es un modelo de lenguaje: es una politica neuronal que controla agentes humanoides en un partido de futbol 2 contra 2, entrenada desde inicializacion aleatoria con el algoritmo MA-POCA y autojuego (self-play), y exportada en formato ONNX para su inferencia.

El modelo se entreno en CPU gratuita de Google Colab durante 200.096 pasos, con semilla 42, ML-Agents 1.1.0 y PyTorch 2.2.2. El autor declara explicitamente que no uso politicas preentrenadas externas ni metricas fabricadas. El entorno empleado es la escena oficial SoccerTwos del registro de Unity (`Startup.zip` de la version 1.1.0), no un entorno reetiquetado.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de entrenamiento MA-POCA con autojuego, como material didactico del curso y como punto de partida para experimentos de asignacion de credito en entornos multiagente. El rendimiento publicado es neutro (recompensa media cercana a cero con desviacion alta), por lo que no debe interpretarse como una demostracion de dominio del juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica y critico (actor-critico) entrenada con MA-POCA; topologia exacta no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observaciones por paso del entorno, dimension no especificada |
| Tipos de cuantizacion | no disponible (exportacion ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (incluido en el repositorio); no se documentan otros formatos |
| Algoritmo de entrenamiento | MA-POCA con autojuego (self-play) |
| Entorno | Unity ML-Agents SoccerTwos 1.1.0 (escena `Assets/ML-Agents/Examples/Soccer/Scenes/SoccerTwos.unity`) |
| Pasos de entrenamiento | 200.096 |
| Semilla | 42 (entrenamiento), 100003 (evaluacion) |
| Libreria | ml-agents 1.1.0, PyTorch 2.2.2, onnx 1.15.0 |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

MA-POCA (Multi-Agent POsthumous Credit Assignment) es un algoritmo de aprendizaje por refuerzo multiagente incluido en el toolkit ML-Agents, pensado para entornos cooperativos donde el equipo puede variar en composicion y donde las recompensas de grupo dificultan atribuir contribuciones individuales. Se apoya en un esquema actor-critico con entrenamiento centralizado y ejecucion descentralizada: la politica se ejecuta por agente, mientras que el critico puede observar informacion agregada durante el entrenamiento. La red resultante es pequena en comparacion con un transformer y esta disenada para consumir observaciones vectoriales del entorno a cada paso.

El entrenamiento partio de inicializacion aleatoria, sin destilacion ni politicas preentrenadas, y utilizo autojuego: la misma politica controla ambos equipos, de modo que la senal de recompensa proviene de la competicion contra si misma. Se ejecuto en CPU de Colab durante 200.096 pasos con la configuracion incluida en el repositorio. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de optimizacion adicionales mas alla del propio algoritmo MA-POCA. Tampoco se detalla la composicion del dataset, porque en este caso no existe un corpus: los datos son experiencia generada por interaccion con la simulacion.

La evaluacion declarada comprende 100 episodios completos de agente con semilla 100003 y autojuego determinista (la misma politica en ambos equipos), sumando recompensa individual y de grupo. El autor advierte que estos retornos son de autojuego y no constituyen una clasificacion frente a oponentes externos. El repositorio incluye el modelo ONNX, los registros completos de evaluacion, el script de evaluacion, el log de entrenamiento y la configuracion, lo que permite reproducir el pipeline con Python 3.10.12, `mlagents==1.1.0`, `torch==2.2.2`, `onnx==1.15.0`, `setuptools<81` y `onnxruntime`.

## Capacidades

- Control motor y toma de decisiones de agentes humanoides en el entorno SoccerTwos (movimiento, orientacion, interaccion con el balon).
- Coordinacion multiagente 2 contra 2 en un escenario cooperativo-competitivo, con asignacion de credito entre agentes del mismo equipo.
- Autojuego: la politica puede enfrentarse a si misma y sostener partidas completas de forma determinista.
- Inferencia exportada a ONNX, ejecutable con `onnxruntime` fuera del proceso de entrenamiento.
- Reproducibilidad completa del entrenamiento mediante configuracion, semilla y versiones de libreria documentadas.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes basados en lenguaje ni razonamiento multi-paso fuera del bucle de decision del entorno.
- No tiene capacidades multilingues: no procesa ni produce lenguaje natural.
- No incorpora modo de pensamiento (thinking mode), audio ni otras modalidades.

## Casos de uso

- Reproduccion de un pipeline MA-POCA de referencia: el repositorio incluye configuracion, log y script de evaluacion, de modo que un equipo de investigacion puede reentrenar exactamente el mismo modelo y comparar curvas de recompensa sin partir de cero.
- Material didactico para cursos de RL: sirve como entrega de ejemplo para la unidad 7 del curso Deep RL de Hugging Face, mostrando el flujo completo desde el entrenamiento en CPU hasta la exportacion ONNX.
- Baseline para experimentos de asignacion de credito: al usar autojuego con recompensa individual y de grupo, es un punto de partida util para comparar variantes de MA-POCA, PPO o QMIX en el mismo entorno.
- Integracion en Unity para pruebas de inferencia: el archivo ONNX puede cargarse con el backend de inferencia de ML-Agents (Barracuda/Sentis) para validar que un agente entrenado externamente se comporta igual dentro del motor.
- Validacion de entornos multiagente: al emplear la escena oficial SoccerTwos 1.1.0 del registro de Unity, permite verificar que una instalacion local del entorno produce observaciones y recompensas coherentes.
- Benchmark de coste de inferencia en CPU: al ser una politica pequena exportada a ONNX, resulta adecuado para medir latencia de decision por paso en hardware sin GPU, algo relevante en simulaciones con muchos agentes.
- Estudio de estabilidad en autojuego: la desviacion tipica alta del retorno reportado lo convierte en un caso util para analizar varianza entre episodios y diseno de recompensas.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card. La metrica figura como no verificada (`verified: false`).

| Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | ML-Agents-SoccerTwos | mean_reward | -0,04633 +/- 0,95661 | No |

Contexto de la medicion: 100 episodios completos de agente, semilla 100003, autojuego determinista con la misma politica en ambos equipos, sumando recompensa individual y de grupo. El autor indica que no se trata de una clasificacion frente a oponentes externos ni de una afirmacion de dominio del juego, y que la unidad 7 del curso no exige una recompensa minima. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: se completo en CPU gratuita de Google Colab, sin GPU, en 200.096 pasos. No se documenta el tiempo total de entrenamiento.
- Inferencia: al ser una politica pequena exportada a ONNX, la ejecucion con `onnxruntime` es viable en CPU. No se publican cifras de VRAM, latencia ni throughput.
- VRAM estimada: no disponible. Por el contexto de uso (entorno Unity, politica de tamano reducido) cabe esperar un consumo muy bajo, pero no hay medicion publicada.
- GPU recomendadas: no disponibles; el autor entreno explicitamente con `--torch-device=cpu`, por lo que no se documenta ninguna GPU.
- GPU de consumo: no aplica segun la informacion disponible; no se requiere GPU para inferencia.
- Opciones de despliegue: `onnxruntime` (Python), backend de inferencia de Unity ML-Agents (Barracuda/Sentis) para uso dentro de la simulacion. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables con datos publicados en la informacion proporcionada. No se han facilitado resultados de otras politicas SoccerTwos (por ejemplo, variantes entrenadas con PPO o SAC en el mismo entorno) ni cifras que permitan una comparacion cuantitativa honesta.

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| poca-SoccerTwos | no disponible | no aplica | mean_reward -0,04633 +/- 0,95661 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia cualitativa, MA-POCA esta disenado especificamente para asignacion de credito en equipos cooperativos con composicion variable, mientras que PPO se usa habitualmente como algoritmo de proposito general en ML-Agents sin mecanismo de asignacion postuma. No se aportan mediciones que respalden una ventaja cuantitativa en este caso concreto.

## Limitaciones y advertencias

- Rendimiento neutro: la recompensa media es practicamente cero (-0,04633) con una desviacion tipica de 0,95661, lo que indica un comportamiento muy variable entre episodios y sin evidencia de dominio del entorno.
- Metrica no verificada: el resultado del `model-index` figura como `verified: false` y proviene unicamente del autor.
- Evaluacion interna: los 100 episodios se jugaron contra la propia politica, no contra oponentes externos ni contra una referencia independiente; no es una clasificacion competitiva.
- Sin datos de sesgo en el sentido habitual de los modelos de lenguaje; no aplica, al no procesar lenguaje natural.
- Riesgo de sobreajuste al autojuego y de colapso de estrategia, un problema conocido en self-play cuando no se introduce diversidad de oponentes.
- Limitacion de alcance: la politica solo es valida para el espacio de observacion y accion de SoccerTwos 1.1.0; no es transferible a otras tareas sin reentrenamiento.
- Dependencia del entorno correcto: requiere la escena oficial SoccerTwos del registro de Unity y versiones concretas de libreria; cambios de version pueden alterar observaciones o recompensas.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia; conviene revisar tambien los terminos del entorno Unity ML-Agents por separado.
- Sin soporte de lenguaje, tool calling ni agentes conversacionales: cualquier caso de uso que requiera esas capacidades queda fuera de su ambito.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad ni issues reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bestdive/poca-SoccerTwos
- Entorno oficial SoccerTwos 1.1.0 (Unity ML-Agents): https://storage.googleapis.com/mlagents-test-environments/1.1.0/linux/Startup.zip
- Curso Deep RL de Hugging Face (unidad 7, contexto de la entrega): https://huggingface.co/learn/deep-rl-course
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces recuperados correspondian al sitio oficial de los Dallas Stars (NHL) y no guardan relacion con esta ficha.
