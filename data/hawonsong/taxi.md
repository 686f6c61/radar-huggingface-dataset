# HawonSong/Taxi

## Resumen

Taxi es un agente de aprendizaje por refuerzo entrenado con Q-Learning para resolver el entorno Taxi-v3 de Gymnasium (el clasico problema de recogida y entrega de pasajeros en una cuadricula de 5x5). Lo publica el usuario HawonSong en Hugging Face como artefacto de un entrenamiento concreto, con un unico fichero de pesos en formato pickle (`q-learning.pkl`) que contiene la tabla Q aprendida junto con metadatos del entorno.

No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una implementacion tabular de Q-Learning con una tabla de estados-acciones para los 500 estados discretos de Taxi-v3 y 6 acciones posibles. El repositorio tiene un tamano practicamente nulo (0.0 GB) y no incluye documentacion tecnica sobre hiperparametros, numero de episodios ni politica de exploracion.

Su relevancia es fundamentalmente didactica o de referencia: sirve como ejemplo reproducible de un agente Q-Learning basico sobre un entorno estandar de RL, y como artefacto cargable mediante la libreria de integracion de Hugging Face con Gymnasium. No debe confundirse con un modelo generativo ni usarse fuera del entorno Taxi-v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (sin red neuronal) |
| Parametros totales | no disponible (tabla Q de 500 estados x 6 acciones como maximo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno Taxi-v3, horizonte episodico del entorno) |
| Tipos de cuantizacion | no aplica (pesos en pickle, no hay cuantizacion) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | pickle (`q-learning.pkl`) |

## Arquitectura y entrenamiento

El agente emplea Q-Learning clasico, un metodo de diferencias temporales off-policy que actualiza una tabla Q(s, a) mediante la regla de Bellman con una tasa de aprendizaje y un factor de descuento. El espacio de estados de Taxi-v3 es discreto y finito (500 estados), y el espacio de acciones tambien (6 acciones: mover norte, sur, este, oeste, recoger pasajero y dejar pasajero), por lo que una representacion tabular es suficiente y no requiere funcion de aproximacion.

La model card no detalla hiperparametros (alpha, gamma, epsilon, decaimiento de exploracion), numero de episodios de entrenamiento, politica de exploracion (epsilon-greedy u otra) ni semilla aleatoria. El unico dato de entrenamiento publicado es el resultado de evaluacion: recompensa media de 7.50 con desviacion tipica de 2.77 sobre Taxi-v3. No se documenta si el entrenamiento uso la variante resbaladiza (`is_slippery=True`, por defecto) o determinista, aunque la propia model card advierte al usuario que compruebe si necesita anadir atributos como `is_slippery=False` al cargar el entorno.

## Capacidades

- Resolucion del entorno Taxi-v3: recoger un pasajero en una de las cuatro ubicaciones y dejarlo en su destino dentro de una cuadricula 5x5 con paredes.
- Politica greedy derivada de la tabla Q aprendida, explotable en inferencia sin exploracion.
- Carga directa mediante `load_from_hub` con el fichero `q-learning.pkl`.
- Compatibilidad con Gymnasium a traves del `env_id` almacenado en el artefacto.
- No soporta generacion de texto, razonamiento simbolico general, codigo, matematicas, vision, audio ni tool calling.
- No soporta agentes multi-paso fuera del bucle episodico del entorno Taxi-v3.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No dispone de modo thinking ni de decodificacion especulativa.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo funcional de Q-Learning tabular en un curso introductorio, cargandolo con `load_from_hub` y evaluandolo en Taxi-v3 para ilustrar la convergencia de la tabla Q.
- Baseline de comparacion: emplear la recompensa media de 7.50 como referencia minima contra la que medir algoritmos mas avanzados (DQN, PPO, Q-Learning con optimizaciones) en el mismo entorno.
- Pruebas de integracion de pipelines de RL: verificar que un flujo de entrenamiento, publicacion en Hugging Face y carga posterior funciona de extremo a extremo con un artefacto pequeno y rapido de validar.
- Reproducibilidad de experimentos: servir como artefacto congelado para comparar resultados entre ejecuciones y detectar regresiones en librerias de RL o en versiones de Gymnasium.
- Demostraciones de entornos Gymnasium: integrar el agente en notebooks o tutoriales que muestren el bucle `env.step` con una politica preentrenada, sin coste de entrenamiento.
- Validacion de infraestructura de evaluacion: usar el agente como caso de prueba para sistemas que miden recompensa media y desviacion tipica sobre entornos discretos, dado que el resultado esperado esta documentado.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.50 +/- 2.77 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el artefacto es una tabla Q en pickle de tamano despreciable (repositorio de 0.0 GB).
- GPU recomendadas: no se requiere GPU; la inferencia es una consulta a tabla y corre en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (CPU, Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: Python con Gymnasium y la utilidad `load_from_hub`; no aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponible de forma publicada; por la naturaleza tabular, la consulta por paso es de orden O(1) y el cuello de botella sera el propio entorno Taxi-v3, no el agente.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Recompensa media publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HawonSong/Taxi | Q-Learning tabular | Taxi-v3 | 7.50 +/- 2.77 | no disponible | Hugging Face |
| Agentes Q-Learning de referencia en Taxi-v3 | Q-Learning tabular | Taxi-v3 | no disponible en esta busqueda | no disponible | multiples repositorios |
| Algoritmos deep RL (DQN, PPO) sobre Taxi-v3 | Red neuronal | Taxi-v3 | no disponible en esta busqueda | no disponible | implementaciones en Stable-Baselines3 y similares |

No se dispone de resultados comparativos verificados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- El agente esta especializado exclusivamente en Taxi-v3; no generaliza a otros entornos ni tareas.
- La recompensa media de 7.50 +/- 2.77 es modesta para Taxi-v3 y sugiere una politica no completamente optima; el autor no la ha verificado (`verified: false`).
- No se documentan hiperparametros, semilla ni numero de episodios, lo que dificulta la reproducibilidad exacta del entrenamiento.
- La model card advierte de que puede ser necesario ajustar atributos del entorno (`is_slippery=False`); una configuracion distinta a la del entrenamiento puede degradar el rendimiento.
- El formato de pesos es pickle, lo que implica riesgo de seguridad al deserializar ficheros de origen no confiable; conviene cargarlo solo desde fuentes de confianza.
- Licencia no disponible: no se puede asumir permiso para uso comercial sin consultar al autor.
- No aplica sesgo linguistico ni alucinacion en el sentido de modelos generativos, pero la politica puede fallar en estados poco visitados durante el entrenamiento.
- No es apto para produccion en tareas de lenguaje, vision ni agentes conversacionales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/HawonSong/Taxi
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de integracion de Hugging Face con entornos de RL: https://huggingface.co/docs/hub/en/models-downloading
