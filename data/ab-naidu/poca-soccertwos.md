# ab-naidu/poca-SoccerTwos

## Resumen

poca-SoccerTwos es un agente de aprendizaje por refuerzo profundo entrenado con la librería Unity ML-Agents para el entorno SoccerTwos. Lo publica el usuario ab-naidu en Hugging Face y se distribuye como artefactos de inferencia (.nn y .onnx) que pueden cargarse tanto en el motor Unity (mediante Barracuda) como en el visor de agentes del propio Hub. El repo ocupa 0,1 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

SoccerTwos es un entorno de referencia de ML-Agents en el que dos equipos de dos agentes compiten por introducir un balón en la portería rival dentro de una arena reducida. El entrenamiento se realiza por auto-juego (self-play), de modo que la política aprende a cooperar con su compañero y a anticipar las acciones de los adversarios. El sufijo "poca" del identificador hace referencia al trainer POCA de ML-Agents, una variante del optimizador PPO usada para ajustar la función de valor y las ventajas.

A diferencia de un modelo de lenguaje, este artefacto no procesa texto ni mantiene contexto conversacional: es una política de control que mapea observaciones estructuradas del entorno a acciones discretas de movimiento y patada. Su relevancia es por tanto acotada al ámbito de la investigación en RL multiagente, el auto-juego y la reproducibilidad de experimentos en entornos de Unity, y no a tareas de generación. La información pública disponible sobre hiperparámetros, arquitectura exacta y licencia es muy limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política de aprendizaje por refuerzo (ML-Agents); número de capas, unidades y uso de memoria LSTM no disponible |
| Parametros totales | no disponible (tamaño del repositorio: 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (agente de RL; depende de la ventana de observaciones del entorno SoccerTwos) |
| Tipos de cuantizacion | no disponible (artefactos de inferencia en .nn y .onnx) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | .nn (Unity ML-Agents / Barracuda) y .onnx |
| Libreria | ml-agents |
| Pipeline | reinforcement-learning |
| Entorno | SoccerTwos (Unity ML-Agents) |
| Trainer | POCA (variante de PPO en ML-Agents) |
| Fecha de creacion | 2026-10-15 |
| Ultima actualizacion | 2026-10-15 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología concreta de la red. Por el identificador y las etiquetas del repositorio, se trata de una política entrenada con el trainer POCA de Unity ML-Agents, que produce un modelo exportable a formato .nn (para inferencia en Unity mediante Barracuda) y a .onnx (para inferencia fuera del motor o para su visualización en el navegador). El repositorio incluye además ficheros de TensorBoard según las etiquetas, aunque no se especifica su contenido ni las métricas registradas.

SoccerTwos es un entorno multiagente de suma cero por equipos en el que los agentes reciben recompensas por posesión del balón, avance hacia la portería rival y gol. El régimen de entrenamiento habitual es el auto-juego con políticas que se actualizan a lo largo de las rondas, pero no se ha publicado en la información disponible el número de pasos de entrenamiento, la composición de recompensas configurada, el uso de currículos, el tamaño del batch ni los hiperparámetros concretos del trainer POCA. Tampoco se documenta si la política incorpora memoria recurrente, parÁmetro relevante en un entorno parcialmente observable como SoccerTwos.

## Capacidades

- Control multiagente 2 contra 2: el agente genera acciones de movimiento y patada para un jugador dentro de un equipo de dos en el entorno SoccerTwos.
- Cooperación por auto-juego: el comportamiento aprendido incluye interacción con un compañero de equipo, sin comunicación explícita entre agentes.
- Juego competitivo: mantiene comportamiento adversarial frente a políticas rivales vistas durante el entrenamiento.
- Reproducción de políticas: los artefactos .nn y .onnx permiten cargar la política entrenada para inferencia reproducible en Unity o en el visor del Hub.
- Visualización interactiva: el agente se puede ejecutar en el navegador a través del visor de agentes de Hugging Face (botón "Watch the agent play").
- Reanudación de entrenamiento: la model card documenta el comando `mlagents-learn ... --resume` para continuar el entrenamiento desde el punto de control.
- No dispone de capacidades de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling ni agentes basados en lenguaje.

## Casos de uso

- Baseline para comparación de algoritmos de RL multiagente: emplear esta política POCA como referencia frente a agentes entrenados con PPO o SAC en SoccerTwos, midiendo Elo relativo entre checkpoints.
- Reproducibilidad de experimentos: cargar los artefactos .onnx en un entorno de evaluación propio para replicar los resultados del entrenamiento sin depender del motor Unity.
- Investigación en auto-juego y currículos: partir de esta política congelada y entrenar contra ella una política nueva para estudiar dinámicas de especialización y olvido catastrófico.
- Docencia de aprendizaje por refuerzo: usar el agente en el visor del navegador para ilustrar de forma visual cómo una política entrenada coopera y compite dentro de un entorno 2v2.
- Transferencia y fine-tuning a otros entornos ML-Agents: reutilizar la política como inicialización en tareas de control con espacio de acciones y observaciones similares.
- Recolección de trayectorias para imitation learning: generar demostraciones del agente y usarlas como datos de comportamiento para entrenar políticas por aprendizaje supervisado.
- Evaluación de robustez frente a perturbaciones: someter la política a variaciones de la dinámica del entorno (velocidad del balón, posiciones iniciales) para analizar su generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de Elo, tasa de victorias, recompensa media ni curvas de entrenamiento, y tampoco se han encontrado en la búsqueda web datos comparativos para este agente concreto.

## Requisitos de hardware

- El tamaño del repositorio es de 0,1 GB, coherente con una política de dimensiones reducidas frente a un modelo de lenguaje. La inferencia es viable en CPU sin aceleración dedicada.
- GPU recomendadas: no se requiere GPU para la inferencia del fichero .nn o .onnx; cualquier GPU, incluida una integrada, es suficiente para ejecutar el entorno con inferencia en paralelo.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y también en hardware de gama baja para inferencia pura; el cuello de botella real será el renderizado del entorno Unity.
- Opciones de despliegue: Unity ML-Agents con Barracuda para el fichero .nn, runtime ONNX (onnxruntime, Unity Sentis) para el fichero .onnx, y el visor de agentes de Hugging Face para visualización en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de pasos por segundo ni de tiempo de inferencia por decisión.

## Comparativa con modelos similares

| Modelo | Entorno | Trainer | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ab-naidu/poca-SoccerTwos | SoccerTwos | POCA | no disponible | no aplica | no disponible | Hugging Face |
| Otros agentes ML-Agents para SoccerTwos publicados en el Hub | SoccerTwos | PPO / SAC / POCA según el caso | no disponible | no aplica | variable segun autor | Hugging Face |
| Agentes de referencia de Unity ML-Agents | SoccerTwos y otros entornos | PPO (por defecto) | no disponible | no aplica | licencia del proyecto ML-Agents | Repositorio de Unity Technologies |

No se dispone de datos numéricos de rendimiento que permitan una comparación cuantitativa entre estas alternativas. La distinción principal entre los agentes del Hub radica en el trainer empleado y en la configuración del entorno, no en métricas publicadas comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser una política de RL entrenada por auto-juego, puede explotar regularidades específicas del entorno de entrenamiento y degradarse frente a rivales o configuraciones distintas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; sí existe el riesgo de comportamientos degenerados ante observaciones fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: el agente no procesa lenguaje. Su comportamiento está condicionado por la observación del entorno SoccerTwos y no generaliza a otros dominios sin reentrenamiento.
- Restricciones de licencia: la licencia no está especificada en el repositorio, por lo que el uso comercial queda sin cobertura clara. Conviene contactar con el autor antes de cualquier explotación.
- Ausencia de documentación: no se publican hiperparámetros, número de pasos de entrenamiento ni métricas, lo que dificulta evaluar la calidad y la reproducibilidad del agente.
- Advertencia para producción: el modelo no ha sido validado en entornos distintos del de entrenamiento y no debería integrarse en sistemas en producción sin una evaluación previa de robustez.
- Cero descargas y cero interacciones en el momento de redactar esta ficha: no existe evidencia de uso por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ab-naidu/poca-SoccerTwos
- Librería Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto de la Deep RL Course (Hugging Face): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents (Hugging Face): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Organización de Unity en Hugging Face (visor de agentes): https://huggingface.co/unity

No se han encontrado papers, blogs ni repositorios adicionales específicos de este modelo en la búsqueda web realizada.
