# naveenalavilli/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente de aprendizaje por refuerzo profundo entrenado por el usuario naveenalavilli para el entorno SoccerTwos del toolkit Unity ML-Agents. Se publica en Hugging Face como checkpoint de política obtenido con el algoritmo POCA, el entrenador basado en PPO que incluye ML-Agents. La model card lo presenta explícitamente como un ejemplo educativo del curso Deep RL de Hugging Face, con 29 descargas y 0 "likes" en el momento de redactar esta ficha.

No es un modelo de lenguaje ni un modelo fundacional: no procesa texto, no tiene ventana de contexto y no dispone de parámetros en el sentido habitual de los LLM. Su entrada es el vector de observaciones que define el entorno SoccerTwos (partidos 2 contra 2, con dos equipos de dos agentes cada uno) y su salida es un vector de acciones, con componentes discretas y continuas, que controla el desplazamiento, la rotación y la patada de un jugador.

Su relevancia es docente y metodológica. Permite reproducir de principio a fin el flujo de trabajo de ML-Agents (entrenamiento, exportación a .nn/.onnx, publicación en el Hub y visualización en el navegador) y sirve como adversario o línea base con la que comparar experimentos propios de self-play multiagente. El propio autor advierte que se trata de "una ejecución educativa corta de 500.000 pasos solicitados" y que "no se reclama que sea una política competitiva ni convergida".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica y red de valor de ML-Agents (perceptron multicapa sobre observaciones vectoriales; variante con CNN si se entrena la version visual del entorno), optimizadas con el algoritmo POCA |
| Parametros totales | no disponible (el repositorio ocupa menos de 0,1 GB, lo que indica una red del orden de decenas de miles de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de RL; la entrada es un vector de observaciones de dimension fija, no una secuencia de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en precision nativa como .nn/.onnx; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ficheros .nn (formato nativo de ML-Agents/Barracuda) y/o .onnx, segun la propia model card; se incluyen tambien logs de TensorBoard y el fichero de configuracion del entrenamiento |

## Arquitectura y entrenamiento

El agente se entrena con POCA, el entrenador que ML-Agents ofrece como alternativa a PPO y que, segun la documentacion del toolkit, incorpora un mecanismo de region de confianza sobre la actualizacion de la politica (recorte de la ventaja y/o restriccion por divergencia KL) para estabilizar el aprendizaje on-policy. La politica consume las observaciones del entorno SoccerTwos, que en la configuracion por defecto son raycasts y otras variables vectoriales del campo, el balon y los jugadores, y produce acciones discretas (por ejemplo, la decision de chutar) y continuas (desplazamiento y rotacion). No se documenta el numero de capas, de unidades por capa ni de parametros totales.

El entrenamiento se realizo desde cero mediante self-play dentro del propio entorno SoccerTwos, con una ejecucion corta de 500.000 pasos solicitados y asistencia de IA, en el marco del curso de Deep RL de Hugging Face. El autor no declara innovaciones tecnicas adicionales, ni fases de RLHF/DPO (no aplicables aqui), ni decodificacion especulativa. El repositorio incluye los logs de entrenamiento y la configuracion, de modo que el proceso puede reanudarse con `mlagents-learn <config>.yaml --run-id=<run_id> --resume`.

## Capacidades

- Control de un jugador en el entorno SoccerTwos (2 contra 2) de Unity ML-Agents: movimiento, rotacion y patada.
- Coordinacion implicita con el companero de equipo y oposicion al equipo rival, aprendida por self-play.
- Aprendizaje por refuerzo con espacio de acciones mixto (ramas discretas y continuas).
- Exportacion e inferencia fuera de Python, en los formatos .nn y .onnx soportados por Unity.
- Visualizacion interactiva en el navegador a traves del visor de agentes de Hugging Face.
- Reanudacion del entrenamiento a partir de los logs y la configuracion incluidos.
- No soporta generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso fuera del bucle de decision del entorno.
- No tiene capacidades multilingues (no procesa lenguaje).
- No tiene modo "thinking", ni vision general, ni audio (salvo que se entrene explicitamente la variante visual del entorno, no confirmada aqui).

## Casos de uso

- Material didactico para cursos de RL: reproduce el ciclo completo de ML-Agents (entrenar, exportar, publicar en el Hub y visualizar el agente en el navegador) con un caso 2v2 multiagente.
- Linea base en experimentos de self-play: sirve como oponente fijo para medir si una politica nueva mejora en SoccerTwos sin tener que entrenar dos agentes desde cero.
- Validacion de pipelines de exportacion: al incluir .nn/.onnx, es util para comprobar que un flujo de conversion a Unity Inference Engine o ONNX Runtime funciona antes de invertir en entrenamientos largos.
- Pruebas de integracion de ML-Agents en CI: el checkpoint es lo bastante pequeno (menos de 0,1 GB de repositorio) para cargarse en un runner de integracion continua y verificar que el entorno arranca y produce acciones validas.
- Demostraciones en directo de entornos multiagente: la visualizacion en el navegador permite mostrar comportamiento emergente de cooperacion y competicion sin infraestructura de GPU.
- Generacion de trayectorias para aprendizaje por imitacion: las partidas que produce el agente pueden registrarse como demostraciones iniciales (behavioral cloning) para arrancar un entrenamiento posterior.
- Experimentos de robustez frente a companeros de equipo: al fijar este checkpoint como companero y variar el oponente, se puede estudiar como degrada o se adapta la politica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que no se reclama ninguna puntuacion de recompensa sobre un conjunto aparte ("No held-out reward score is claimed").

| Dato declarado | Valor |
|---|---|
| Pasos de entrenamiento solicitados | 500.000 |
| Evaluacion con conjunto aparte | no realizada segun el autor |
| Recompensa media declarada | no disponible |
| Metricas MMLU / HumanEval / GSM8K y similares | no aplica (no es un modelo de lenguaje) |
| Resultados en la liga de SoccerTwos | no disponible |

## Requisitos de hardware

- Inferencia: no requiere GPU. La politica es una red diminuta y se ejecuta en CPU dentro del motor de Unity.
- VRAM estimada: practicamente nula para la inferencia; en el orden de megabytes si se carga en memoria junto al fichero .onnx.
- GPU recomendadas: no aplica para inferencia; para reentrenar, cualquier GPU compatible con PyTorch (por ejemplo, una RTX 3060 o superior) acelera la recoleccion de experiencia, aunque ML-Agents tambien puede entrenar en CPU con menor throughput.
- Cabe en GPU de consumo: si, y tambien en cualquier portatil sin GPU dedicada.
- Opciones de despliegue: visor de agentes de Hugging Face, player de Unity con Barracuda/Unity Inference Engine, ONNX Runtime, y `mlagents-learn` en modo inferencia.
- Latencia y throughput estimados: no disponibles. En la practica, el coste dominante es la simulacion fisica del entorno en Unity, no la inferencia de la red.

## Comparativa con modelos similares

No se dispone de cifras verificables de modelos comparables en la informacion proporcionada. La comparacion se limita a la categoria de artefactos equivalentes.

| Modelo | Entorno | Algoritmo | Pasos de entrenamiento | Licencia | Convergencia declarada |
|---|---|---|---|---|---|
| naveenalavilli/poca-SoccerTwos | SoccerTwos (2v2) | POCA (familia PPO) | 500.000 | no disponible | no, el autor indica que no reclama convergencia |
| Otros checkpoints poca-/ppo-SoccerTwos publicados por la comunidad en el Hub | SoccerTwos (2v2) | POCA / PPO | no disponible | no disponible | no disponible |
| Politica de ejemplo del propio entorno SoccerTwos en ML-Agents | SoccerTwos (2v2) | POCA / PPO | no disponible | sujeto a la licencia de ML-Agents | no disponible |

## Limitaciones y advertencias

- Politica no convergida: solo 500.000 pasos y el propio autor desaconseja tratarla como competitiva. El comportamiento esperable es erratico en situaciones de juego no vistas.
- Ausencia de evaluacion independiente: no hay recompensa media ni evaluacion held-out publicada, por lo que no se puede cuantificar su calidad.
- Licencia no especificada: al no declararse licencia, no hay autorizacion explicita de uso comercial. Cualquier uso en produccion requiere contactar con el autor, y ademas hay que cumplir la licencia de Unity ML-Agents y de los binarios de Unity.
- Dependencia de versiones: el checkpoint solo es util con la version de ML-Agents, el fichero de configuracion y el binario de SoccerTwos compatibles; cambios en el espacio de observaciones o de acciones invalidan la politica.
- Sobreajuste al self-play: al haberse entrenado contra si mismo en un numero reducido de pasos, es probable que explote comportamientos poco robustos y que rinda mal frente a oponentes con estrategias distintas.
- Sesgos heredados del diseno del entorno: la funcion de recompensa de SoccerTwos, el tamano del campo, el numero de raycasts y el reparto de equipos condicionan por completo lo que el agente puede aprender; no hay sesgos sociales ni linguisticos que analizar, porque el modelo no procesa lenguaje.
- Riesgo de alucinacion: no aplica (no genera texto).
- Limitaciones idiomaticas: no aplica; no hay soporte de idiomas.
- Reproducibilidad: los entrenamientos con ML-Agents no son necesariamente deterministas entre ejecuciones, aunque la semilla y la configuracion esten incluidas.
- Ficha del Hub incompleta: sin licencia, sin idiomas, sin pipeline de evaluacion y sin tarjeta de resultados; conviene auditar los ficheros del repositorio antes de reutilizarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/naveenalavilli/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentacion del toolkit ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Curso de Deep RL de Hugging Face, tutorial corto: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Curso de Deep RL de Hugging Face, tutorial largo sobre ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organizacion de entornos y agentes de Unity en Hugging Face: https://huggingface.co/unity

Nota: las busquedas web realizadas devolvieron exclusivamente resultados sobre el caza Sukhoi Su-27 (booms de cola, paracaidas de frenado y derivados), sin ninguna relacion con este modelo. No se ha incorporado ninguno de esos enlaces por no ser pertinentes.
