# foleymon/ppo-Pyramids

## Resumen

ppo-Pyramids es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) para resolver el entorno Pyramids de Unity ML-Agents. Lo publica el usuario foleymon en Hugging Face como parte del curso Deep Reinforcement Learning de Hugging Face, concretamente la unidad 5, que cubre el entrenamiento de agentes con la libreria ML-Agents de Unity. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una politica neuronal entrenada para controlar un agente dentro de una simulacion fisica 3D.

El agente se entreno durante 1.000.000 de pasos sobre una GPU Tesla T4, empleando PPO con curiosidad basada en Random Network Distillation (RND), una tecnica de exploracion que anade una recompensa intrinseca para incentivar la visita de estados novedosos. El resultado final declarado por el autor es una recompensa media de 1,53 +/- 0,48 en el entorno Pyramids, con un valor de referencia de 1,05. El repositorio tiene un tamano practicamente nulo (0,0 GB), lo que sugiere que contiene unicamente los artefactos de pesos del agente en formato ONNX y los ficheros de configuracion asociados.

Su relevancia es limitada fuera del ambito educativo: se trata de una publicacion de portafolio vinculada a un curso, sin descargas ni interacciones en el momento de la consulta, y sin licencia declarada. Resulta util como ejemplo reproducible de un pipeline completo de ML-Agents (entrenamiento, publicacion en el Hub y visualizacion en el navegador), pero no como componente para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal para aprendizaje por refuerzo (PPO con RND), framework Unity ML-Agents |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (artefactos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (artefacto `.onnx` de ML-Agents); el repositorio ocupa 0,0 GB |
| Algoritmo de entrenamiento | PPO con curiosidad (RND) |
| Entorno | Pyramids (Unity ML-Agents) |
| Pasos de entrenamiento | 1.000.000 |
| Hardware de entrenamiento | GPU Tesla T4 |

## Arquitectura y entrenamiento

El modelo es una politica neuronal entrenada con PPO, el algoritmo de gradiente de politica proximal que ML-Agents usa por defecto para entornos con acciones continuas o discretas. Sobre la base de PPO se anadio curiosidad mediante Random Network Distillation (RND): una red objetivo aleatoria y fija genera una representacion de cada observacion, y una red predictora entrenada intenta reproducirla; el error de prediccion se usa como recompensa intrinseca. Esto incentiva la exploracion en entornos con recompensas dispersas como Pyramids, donde el agente debe aprender a recoger y apilar bloques.

El entrenamiento se ejecuto durante 1.000.000 de pasos sobre una Tesla T4. No se detalla en la informacion disponible la composicion de las observaciones (sensores visuales, raycasts o vectoriales), el numero de capas ni el tamano de las redes neuronal ni de politica ni de valor, ni si se aplicaron tecnicas adicionales como normalizacion de recompensas o curriculum learning. La model card no incluye informacion sobre hiperparametros, semillas ni proceso de evaluacion mas alla del valor de recompensa media reportado.

## Capacidades

- Control de un agente en el entorno Pyramids de Unity ML-Agents: el agente aprende a interactuar con la simulacion fisica para maximizar la recompensa del entorno.
- Aprendizaje por refuerzo con exploracion intrinseca: la variante RND permite afrontar recompensas dispersas explorando estados novedosos.
- Ejecucion en navegador: el artefacto ONNX puede cargarse en el visor de agentes de Hugging Face (https://huggingface.co/unity) para ver al agente jugar sin infraestructura local.
- Reanudacion del entrenamiento: compatible con `mlagents-learn --resume` para continuar el entrenamiento desde el checkpoint publicado.
- No soporta generacion de texto, razonamiento linguistico, codigo, matematicas, vision general, tool calling, agentes conversacionales ni capacidades multilingues: es un agente de RL especifico de un entorno.
- No dispone de modo de razonamiento explicito ni de salidas interpretables mas alla de la politica entrenada.

## Casos de uso

- Reproduccion educativa del curso de Deep RL de Hugging Face: sirve como referencia para estudiantes de la unidad 5 que quieran comparar su propio entrenamiento de Pyramids con un resultado publicado (recompensa media 1,53). Es adecuado porque el flujo de publicacion y visualizacion esta documentado paso a paso en la model card.
- Demostracion de PPO con curiosidad RND: util como caso de estudio de como la recompensa intrinseca mejora la exploracion en entornos con recompensas dispersas, comparando el resultado (1,53) con el valor de referencia (1,05).
- Visualizacion interactiva en el navegador: cargando el fichero ONNX en el visor de Hugging Face se puede mostrar el comportamiento del agente en una demo sin instalar Unity ni ML-Agents, lo que resulta practico para presentaciones o material docente.
- Punto de partida para fine-tuning con `mlagents-learn --resume`: investigadores que quieran experimentar con hiperparametros de PPO o de RND pueden reanudar el entrenamiento desde este checkpoint en lugar de partir de cero.
- Prueba de integracion de ML-Agents con el Hub: sirve para validar pipelines de publicacion de agentes (subida de `.onnx`, metadatos `model-index`, visualizacion) en entornos de CI o docencia.
- Benchmark de referencia para el entorno Pyramids: al ser un entorno oficial de ML-Agents, el valor de recompensa permite fijar una linea base con la que comparar nuevas variantes de algoritmo o de arquitectura de politica.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Tarea | Dataset/entorno | Metrica | Valor |
|---|---|---|---|
| Reinforcement Learning | ML-Agents-Pyramids | mean_reward | 1,53 +/- 0,48 |

El autor indica ademas un valor de referencia ("result 1.05") en la descripcion del entrenamiento. No se han publicado en la informacion disponible resultados comparativos con otras variantes de PPO, otros algoritmos (SAC, IMPALA) ni otras semillas sobre el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y el artefacto es un ONNX de una politica de RL, por lo que la huella de memoria es muy reducida en comparacion con modelos generativos.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para la inferencia; el entrenamiento se realizo en una Tesla T4. Para reentrenamiento, una T4 o superior (RTX 3060, RTX 4090, A100) acelera el bucle de simulacion y optimizacion.
- Cabe en GPU de consumo: si, cualquier GPU de consumo moderna puede ejecutar la inferencia del agente; el cuello de botella real es la simulacion del entorno Unity, no la red neuronal.
- Opciones de despliegue: ML-Agents Toolkit (entorno Unity con el modelo `.onnx` embebido), visor web de Hugging Face (https://huggingface.co/unity) y ONNX Runtime para inferencia fuera de Unity.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El coste dominante sera la fisica y el renderizado del entorno, no la inferencia de la politica.

## Comparativa con modelos similares

No se dispone de informacion sobre otros agentes publicados para el entorno Pyramids ni sobre sus metricas, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa de la categoria:

| Modelo | Entorno | Algoritmo | Pasos | Recompensa media | Licencia |
|---|---|---|---|---|---|
| ppo-Pyramids (foleymon) | Pyramids | PPO + RND | 1.000.000 | 1,53 +/- 0,48 | no disponible |
| Otros agentes ML-Agents del curso | Pyramids | PPO (sin RND) | no disponible | no disponible | no disponible |
| Agentes ML-Agents oficiales de Unity | varios | PPO/SAC | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especificidad total al entorno: la politica solo es valida para Pyramids; no generaliza a otras tareas ni a variaciones del entorno sin reentrenamiento.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial queda en un limbo legal y no deberia asumirse permiso de reutilizacion.
- Resultado no verificado: la metrica `mean_reward` figura con `verified: false` en el `model-index`; procede unicamente del autor y no ha sido reproducida de forma independiente.
- Varianza alta: la desviacion tipica de 0,48 sobre una media de 1,53 indica una dispersion considerable entre episodios, lo que sugiere un comportamiento inestable en produccion.
- Sin informacion de sesgos ni de robustez: al no ser un modelo linguistico no aplican sesgos de texto, pero no se documenta el comportamiento del agente ante perturbaciones del entorno ni su robustez ante cambios de fisica.
- Sin datos de reproducibilidad: no se publican hiperparametros, semillas ni configuracion YAML, lo que dificulta replicar exactamente el resultado.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta; es un artefacto de curso, no un modelo con soporte activo.
- No apto para tareas de NLP, vision general ni generacion: cualquier uso fuera del entorno Pyramids requerira entrenamiento desde cero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/foleymon/ppo-Pyramids
- Documentacion de ML-Agents Toolkit: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto del curso (Huggy the Dog): https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo del curso (unidad 5, ML-Agents): https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Hugging Face: https://huggingface.co/unity
