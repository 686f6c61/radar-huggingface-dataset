# Alvarome/q-Taxi-v3

## Resumen

`Alvarome/q-Taxi-v3` es un agente de aprendizaje por refuerzo tabular basado en Q-Learning, entrenado sobre el entorno `Taxi-v3` de Gymnasium. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q serializada que asigna valores de accion a cada par estado-accion del citado entorno. Lo desarrolla el usuario Alvarome y se publica en Hugging Face con el pipeline `reinforcement-learning`.

El modelo resuelve el problema clasico de planificacion y navegacion en el que un taxi debe recoger y dejar pasajeros en una cuadricula de 5x5 con cuatro ubicaciones posibles, respetando las restricciones de recogida y entrega. Su relevancia es fundamentalmente didactica y de referencia: sirve como linea base reproducible para comparar algoritmos de RL tabular, para validar pipelines de evaluacion y como ejemplo minimo de publicacion de artefactos de RL en el Hub.

El repositorio tiene un tamano de 0.0 GB (el artefacto es un fichero `q-learning.pkl` de una tabla de dimensiones reducidas), cero descargas y cero likes en el momento de la consulta. No dispone de licencia declarada ni de informacion sobre idiomas, algo esperable en un artefacto de RL tabular sin componente linguistico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-Learning tabular (tabla Q estado-accion, sin red neuronal) |
| Parametros totales | no disponible (tabla Q discreta; numero de entradas no declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno Taxi-v3 con 500 estados discretos) |
| Tipos de cuantizacion | no aplica (pesos discretos serializados en pickle) |
| Idiomas soportados | no disponible (sin componente linguistico) |
| Licencia | no disponible |
| Formato de pesos | `q-learning.pkl` (pickle de Python) |

## Arquitectura y entrenamiento

La arquitectura es Q-Learning tabular clasico, sin aproximacion de funcion. El agente mantiene una tabla Q indexada por el estado discreto del entorno `Taxi-v3` (500 estados posibles: 25 posiciones del taxi x 5 posiciones del pasajero x 4 destinos) y las 6 acciones disponibles (moverse norte, sur, este, oeste, recoger y dejar). La actualizacion sigue la regla de Bellman con tasa de aprendizaje y factor de descuento, si bien la model card no declara los hiperparametros concretos (alpha, gamma, politica de exploracion epsilon-greedy ni su decaimiento).

El entrenamiento declara 25.000 episodios y una evaluacion posterior de 100 episodios, con una recompensa media de 7,56 ± 2,71. No se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional; se trata de una implementacion propia (`custom-implementation`) sin detalles sobre inicializacion, semillas ni criterios de convergencia. El artefacto se distribuye como un pickle cargable mediante `huggingface_hub` y `pickle.load`, lo que implica dependencia del entorno Python del autor para reconstruir la tabla.

## Capacidades

- Resolucion del entorno `Taxi-v3` mediante politica greedy derivada de la tabla Q.
- Seleccion de accion discreta entre las 6 acciones del entorno a partir del estado observado.
- Aprendizaje por refuerzo tabular con convergencia declarada tras 25.000 episodios.
- Evaluacion reproducible sobre 100 episodios con recompensa media reportada.
- Serializacion y carga del artefacto via `huggingface_hub` y `pickle`.
- No soporta tool calling, function calling ni razonamiento multi-paso fuera del MDP.
- No dispone de capacidades multilingues, vision, audio ni modo de pensamiento.
- No es un agente general: su politica solo es valida dentro de la dinamica de `Taxi-v3`.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo canonico de Q-Learning tabular para explicar la actualizacion de Bellman, la exploracion epsilon-greedy y la convergencia de la tabla Q en un entorno de 500 estados.
- Linea base reproducible en investigacion: comparar nuevos algoritmos (DQN, PPO, tabulares con distintas inicializaciones) contra la recompensa media de 7,56 reportada, con la cautela de que el resultado no esta verificado.
- Validacion de pipelines de evaluacion: integrar el agente en un harness de Gymnasium para comprobar que el codigo de evaluacion (100 episodios, semillas, agregacion de recompensas) funciona antes de escalar a entornos mas complejos.
- Pruebas de infraestructura de despliegue: verificar flujos de descarga, cache y carga de artefactos pickle desde el Hub en entornos de CI, dado el reducido tamano del repositorio.
- Material de ejercicios practicos: plantear a estudiantes la reproduccion del entrenamiento con 25.000 episodios y la comparacion de la recompensa obtenida con la declarada.
- Referencia para publicacion de artefactos de RL: servir de plantilla minima de model card con `model-index` para proyectos que necesiten declarar tareas y metricas de RL en Hugging Face.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,56 | No |

La model card anade la desviacion tipica de la evaluacion: 7,56 ± 2,71 sobre 100 episodios. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; la tabla Q es un objeto Python de tamano muy reducido y se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleracion por hardware.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: script Python con `huggingface_hub` + `pickle` + `gymnasium`; no aplican vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen exclusivamente de la velocidad de lookup en la tabla y del bucle del entorno.

## Comparativa con modelos similares

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alvarome/q-Taxi-v3 | Q-Learning tabular | Taxi-v3 | 7,56 (no verificado) | no disponible | Hugging Face |
| Agentes Q-Learning tabulares de referencia para Taxi-v3 | Q-Learning tabular | Taxi-v3 | no disponible | no disponible | Implementaciones en tutoriales y repos |
| Agentes DQN sobre Taxi-v3 | Deep Q-Network | Taxi-v3 | no disponible | no disponible | Repos de terceros |

No se dispone de datos verificados de alternativas comparables en la informacion proporcionada; la comparativa se limita a la categoria de algoritmo y entorno.

## Limitaciones y advertencias

- El resultado de 7,56 de recompensa media esta marcado como no verificado (`verified: false`); no debe citarse como cifra validada.
- No se declaran hiperparametros de entrenamiento (alpha, gamma, epsilon, semillas), lo que impide reproducir el entrenamiento con exactitud.
- El artefacto es un pickle de Python: su carga ejecuta codigo deserializado y supone un riesgo de seguridad si el origen no es de confianza.
- La politica solo es valida para la dinamica exacta de `Taxi-v3`; no generaliza a variantes del entorno ni a otros MDP.
- Ausencia de licencia explicita: no hay autorizacion clara para uso comercial ni para redistribucion.
- Sin informacion sobre sesgos, alucinacion o idiomas por no tratarse de un modelo generativo.
- Cero descargas y cero likes: no existe evidencia de uso o validacion por parte de la comunidad.
- El repositorio ocupa 0.0 GB y no incluye documentacion sobre el codigo de entrenamiento ni sobre el proceso de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alvarome/q-Taxi-v3
- Entorno Taxi-v3 (Gymnasium): https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de `huggingface_hub`: https://huggingface.co/docs/huggingface_hub
