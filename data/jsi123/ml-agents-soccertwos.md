# JSI123/ML-Agents-SoccerTwos

## Resumen

SoccerTwos — MA-POCA es un modelo de aprendizaje por refuerzo multiagente entrenado en el entorno SoccerTwos de Unity ML-Agents. Lo publica el usuario JSI123 en Hugging Face como artefacto de un entrenamiento abreviado dentro del curso de Deep Reinforcement Learning de Hugging Face. El modelo resuelve una tarea de control cooperativo y competitivo: dos equipos de dos agentes cada uno disputan un partido de futbol simplificado en un campo cuadrado, y cada agente debe aprender a moverse, empujar el balon y coordinarse con su companero.

El algoritmo empleado es MA-POCA (Multi-Agent POsthumous Credit Assignment), un metodo de policy gradient con asignacion de credito pensado especificamente para entornos multiagente con recompensas compartidas. El entrenamiento se ejecuto en Unity ML-Agents 0.30.0 con PyTorch 1.11.0 sobre una NVIDIA Tesla T4, y el resultado se exporto en formato ONNX para su despliegue como politica de inferencia dentro de Unity.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo fundacional, sino de una politica de refuerzo de un entrenamiento corto (100.000 pasos frente a los 5 millones recomendados por el curso). Por tanto, sirve como ejemplo didactico de pipeline de entrenamiento y exportacion, no como solucion lista para produccion. No hay informacion publicada sobre arquitectura de red, tamano de parametros ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de aprendizaje por refuerzo entrenada con MA-POCA sobre Unity ML-Agents) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportado desde ML-Agents); el repo figura con 0.0 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de la red neuronal de la politica (numero de capas, unidades ocultas ni tipo de observaciones). Lo que si se documenta es el marco de entrenamiento: Unity ML-Agents 0.30.0 con PyTorch 1.11.0, algoritmo MA-POCA, entorno SoccerTwos y 100.000 pasos de entrenamiento sobre una NVIDIA Tesla T4. MA-POCA es un algoritmo de policy gradient con funcion de critica centralizada que asigna credito a agentes individuales en entornos cooperativos, lo que permite entrenar politicas que comparten recompensa sin colapso de la senal de aprendizaje.

El propio autor advierte que se trata de un entrenamiento acortado y que no representa los 5 millones de pasos recomendados por el curso. No se especifican la composicion del dataset (aqui generado por simulacion), el uso de tecnicas de curriculum learning, self-play, recompensas intrínsecas ni procesos de ajuste fino posteriores. La exportacion a ONNX sugiere que la politica esta pensada para ejecutarse en inferencia dentro del motor Unity mediante el componente Behavior Parameters y un modelo ONNX asociado.

## Capacidades

- Control de agentes en el entorno SoccerTwos de Unity ML-Agents: movimiento, orientacion y empuje del balon.
- Coordinacion multiagente en equipos de dos jugadores con recompensa compartida, gracias al esquema de asignacion de credito de MA-POCA.
- Inferencia en tiempo real dentro de Unity mediante el modelo ONNX exportado.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia de aprendizaje por refuerzo multiagente: el modelo sirve como ejemplo ejecutable del pipeline completo (entrenamiento con ML-Agents, exportacion a ONNX y carga en Unity) para alumnos del curso de Deep RL de Hugging Face.
- Prototipado de entornos cooperativos en Unity: permite validar rapidamente la integracion de una politica MA-POCA en un proyecto Unity antes de invertir en un entrenamiento largo de 5 millones de pasos.
- Pruebas de infraestructura de inferencia ONNX: util para verificar que el runtime de ML-Agents carga y ejecuta correctamente un modelo exportado en un entorno concreto.
- Baseline de comparacion: sirve como referencia de un entrenamiento corto frente a uno completo, para medir la mejora en la recompensa acumulada al aumentar los pasos.
- Demostraciones didacticas de coordinacion multiagente: muestra como dos agentes aprenden a repartirse roles (atacante y defensor) en un entorno de futbol simplificado.
- Pruebas de integracion de ML-Agents en pipelines de CI: permite comprobar la compatibilidad de versiones (ML-Agents 0.30.0, PyTorch 1.11.0) en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta recompensa media, tasa de victorias, Elo ni ninguna otra metrica de evaluacion del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repo figura como 0.0 GB y no se detalla el numero de parametros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponibles. El entrenamiento se realizo en una NVIDIA Tesla T4, lo que sugiere que la inferencia es ligera, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: probablemente si, dado el caracter ligero de las politicas de ML-Agents, pero no confirmado por el autor.
- Opciones de despliegue: Unity ML-Agents con modelo ONNX; tambien es posible cargar el ONNX con ONNX Runtime u otros runtimes compatibles, aunque no se documenta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Pasos de entrenamiento | Formato | Licencia |
|---|---|---|---|---|---|
| JSI123/ML-Agents-SoccerTwos | SoccerTwos | MA-POCA | 100.000 | ONNX | no disponible |
| Politica de referencia del curso HF Deep RL | SoccerTwos | MA-POCA | 5.000.000 (recomendado) | ONNX | no disponible |
| Otros modelos SoccerTwos en ML-Agents | SoccerTwos | PPO / MA-POCA | variable | ONNX / NN | no disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada. La comparacion se limita a los parametros de entrenamiento documentados.

## Limitaciones y advertencias

- Entrenamiento acortado: 100.000 pasos frente a los 5 millones recomendados por el curso, por lo que el comportamiento aprendido sera previsiblemente pobre y poco fiable.
- Ausencia total de datos de evaluacion: no hay recompensa media, tasa de victorias ni curvas de aprendizaje publicadas.
- Licencia no especificada: no puede confirmarse el uso comercial ni la redistribucion del modelo.
- Ambito de aplicacion muy restringido: solo opera en el entorno SoccerTwos con las observaciones y acciones definidas por ese entorno; no es transferible a otras tareas sin reentrenamiento.
- Dependencia de versiones: entrenado con ML-Agents 0.30.0 y PyTorch 1.11.0; la compatibilidad con versiones posteriores no esta garantizada.
- Sin informacion sobre sesgos, alucinacion o limitaciones de contexto porque no es un modelo de lenguaje y esas categorias no aplican.
- Repo de 0.0 GB: conviene verificar que los pesos ONNX estan realmente disponibles antes de intentar su descarga y uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JSI123/ML-Agents-SoccerTwos
- Documentacion de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Entorno SoccerTwos en ML-Agents: https://github.com/Unity-Technologies/ml-agents/tree/develop/Project/Assets/ML-Agents/Examples/Soccer
- Curso de Deep Reinforcement Learning de Hugging Face: https://huggingface.co/learn/deep-rl-course
- Documentacion de MA-POCA: https://github.com/Unity-Technologies/ml-agents/blob/develop/docs/Learning-Environment-Design-Agents.md
