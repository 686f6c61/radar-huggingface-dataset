# heisenberg-goddamnright/poca-SoccerTwos

## Resumen

poca-SoccerTwos es una politica de aprendizaje por refuerzo entrenada con POCA (POsthumous Credit Assignment), el algoritmo de ML-Agents de Unity Technologies, para jugar al entorno SoccerTwos: un partido de futbol 2 contra 2 en el que cuatro agentes compiten en equipo dentro de una simulacion fisica. El modelo lo publica el usuario heisenberg-goddamnright y no es un modelo de lenguaje: es una red neuronal de politica entrenada para mapear observaciones (raycasts y vector de estado) a acciones discretas de movimiento, rotacion y patada.

El interes de este artefacto es acotado pero claro: sirve como punto de partida reproducible para investigacion en RL multiagente, para comparar algoritmos de credit assignment en entornos cooperativos-competitivos y para demostrar el flujo de entrenamiento y exportacion de ML-Agents (.nn / .onnx) hacia inference en el navegador o en Unity. Al estar publicado en el Hub con la libreria ml-agents, se puede visualizar directamente con la herramienta "Watch the agent play" de la organizacion unity.

No se dispone de informacion sobre arquitectura concreta de la red, numero de parametros, hiperparametros de entrenamiento ni datos de rendimiento (Elo, tasa de victorias). El repositorio ocupa 0,1 GB y no registra descargas ni "likes" en el momento de la consulta. La model card es la plantilla estandar de ML-Agents y no aporta detalles tecnicos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de RL entrenada con POCA (POsthumous Credit Assignment) de ML-Agents; topologia de red no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de RL; consume observaciones por paso, no una ventana de contexto) |
| Tipos de cuantizacion | no disponible (los artefactos publicados son ficheros de inferencia .nn y/o .onnx, sin cuantizacion documentada) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible (no especificada en la model card ni en las etiquetas del repositorio) |
| Formato de pesos | .nn (formato de red de ML-Agents) y .onnx, segun las etiquetas del repositorio |

## Arquitectura y entrenamiento

La model card indica que se trata de un agente POCA entrenado sobre el entorno SoccerTwos con la libreria Unity ML-Agents. POCA es el entrenador de ML-Agents que implementa asignacion postuma de credito: en escenarios multiagente, el critico centralizado evalua la contribucion de cada agente (incluidos los que ya han salido del episodio o han sido eliminados) mediante atencion sobre las observaciones del resto de agentes, lo que permite repartir la recompensa de equipo entre acciones individuales. En entornos 2v2 como SoccerTwos, ese critico compartido es lo que evita el problema de credito difuso cuando la recompensa solo llega al marcarse un gol.

No se ha publicado en la informacion disponible el numero de pasos de entrenamiento, la composicion del curriculum, los hiperparametros del fichero YAML de configuracion ni si se aplico self-play, entrenamiento contra heuristicas o contra politicas congeladas. Tampoco se documenta la forma exacta de la red (capas, unidades, tipo de codificador para observaciones por raycast). Lo unico verificable es el flujo de uso previsto por el autor: reanudar entrenamiento con mlagents-learn --resume o exportar el modelo a .nn/.onnx para inferencia.

## Capacidades

- Control de un agente de futbol en un entorno 2v2 con observaciones vectoriales y por raycast.
- Toma de decisiones por paso con acciones discretas (movimiento, orientacion y patada, segun la definicion del entorno SoccerTwos).
- Comportamiento multiagente dentro de un equipo, con coordinacion implicita aprendida durante el entrenamiento.
- Inferencia exportable a .nn para Unity (Sentis/Barracuda) y a .onnx para ejecucion fuera del editor.
- Reanudacion del entrenamiento desde el checkpoint publicado mediante ML-Agents.
- Visualizacion en navegador a traves del visor de agentes de la organizacion unity en HuggingFace.
- No dispone de generacion de texto, razonamiento simbolico, codigo, vision general, tool calling ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en credit assignment multiagente: usar SoccerTwos como banco de pruebas para comparar POCA/MA-POCA con otros esquemas de asignacion de credito, midiendo Elo y tasa de victorias frente a heuristicas.
- Reproducibilidad de experimentos de RL: el checkpoint permite reanudar el entrenamiento con `mlagents-learn --resume` y continuar desde el mismo estado sin repetir la fase inicial de aprendizaje.
- Docencia y formacion: es un ejemplo listo para ilustrar el ciclo completo de ML-Agents (definicion del entorno, entrenamiento, exportacion y despliegue) en cursos de aprendizaje por refuerzo.
- Demostraciones interactivas en navegador: el visor de HuggingFace permite mostrar el agente jugando sin necesidad de instalar Unity, util para articulos, clases o revisiones rapidas.
- Baseline para algoritmos propios: sirve como referencia de partida al evaluar una implementacion nueva de POCA o de otro entrenador sobre el mismo entorno y la misma semilla.
- Pruebas de inferencia en tiempo real: exportar a ONNX y medir latencia por paso en CPU frente a GPU, para estudiar el coste de la inferencia en un bucle de simulacion fisica.
- Experimentos de sim2real o de curricula: el agente puede congelarse como oponente o companero de equipo mientras se entrena una politica nueva, un patron habitual en self-play por ligas.
- Validacion de pipelines de despliegue de ML-Agents: verificar que el .nn exportado se carga correctamente en Unity Sentis antes de invertir tiempo en entrenamientos mas largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye Elo, tasa de victorias, recompensa media por episodio ni curvas de TensorBoard, pese a que la etiqueta del repositorio menciona tensorboard. No se deben asumir cifras de rendimiento sin acceso a los logs de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por el tipo de entorno (observaciones por raycast y vector de estado, acciones discretas) y el tamano del repositorio (0,1 GB, que incluye ademas metadatos y posibles multiples artefactos), es razonable esperar una red pequena, del orden de cientos de miles de parametros, pero no hay confirmacion en la informacion proporcionada.
- GPU recomendadas: no disponibles. Para una politica de este tipo, cualquier GPU con soporte para Unity Sentis, ONNX Runtime o PyTorch es suficiente; no se requiere hardware de centro de datos.
- Cabe en GPU de consumo: previsiblemente si, incluida gama de entrada, y probablemente tambien en CPU, aunque no hay mediciones publicadas que lo confirmen.
- Unidades de procesamiento alternativas: NPU o GPU integrada mediante ONNX Runtime, si el despliegue se hace fuera de Unity.
- Opciones de despliegue: Unity con Sentis o Barracuda (.nn), ONNX Runtime (.onnx), y el visor web de la organizacion unity en HuggingFace para reproduccion directa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Rendimiento | Licencia |
|---|---|---|---|---|---|
| poca-SoccerTwos (este modelo) | POCA / ML-Agents | SoccerTwos 2v2 | no disponible | no disponible | no disponible |
| Otros agentes ML-Agents publicados en el Hub | PPO, SAC, MA-POCA | Entornos de ML-Agents (Soccer, Crawler, Walker, etc.) | variable, no comparable directamente | no disponible | habitualmente no especificada |
| Implementaciones de referencia de POCA/MA-POCA en ML-Agents | POCA / MA-POCA | Multiples entornos | no disponible | los valores de referencia publicados por Unity no se incluyen en la informacion disponible | licencia de ML-Agents (Apache 2.0 para la libreria, no necesariamente para los checkpoints) |

No se dispone de datos comparativos verificables para este checkpoint concreto. Cualquier comparacion cuantitativa exigiria ejecutar los agentes sobre el mismo binario de entorno y el mismo numero de episodios.

## Limitaciones y advertencias

- Especificidad del entorno: la politica esta entrenada para SoccerTwos y su espacio de observacion y accion concreto. No es transferible a otros entornos sin reentrenamiento.
- Ausencia de datos de rendimiento: sin Elo ni curvas de entrenamiento, no es posible afirmar que el agente juegue a un nivel competitivo; podria corresponder a un entrenamiento parcial.
- Falta de licencia explicita: al no especificarse licencia, el uso comercial queda en un limbo juridico. Conviene contactar con el autor antes de integrarlo en un producto.
- Riesgo de sobreajuste a la version del entorno: cambios en la version de ML-Agents o en el binario de SoccerTwos pueden alterar el espacio de observaciones y romper la compatibilidad del checkpoint.
- Ausencia de garantias de robustez: en RL, un agente con buena recompensa media puede exhibir comportamientos degenerados o explotar atajos de la simulacion.
- Cero adopcion verificable: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni validacion externa de la comunidad.
- Sin sesgos de lenguaje que reportar (no es un modelo de lenguaje), pero si posibles sesgos de politica derivados de la distribucion de episodios y de los oponentes vistos durante el entrenamiento.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica sobre el modelo: remiten a paginas sobre Werner Heisenberg y al personaje Walter White, por lo que no aportan enlaces utiles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/heisenberg-goddamnright/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentacion de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Tutorial corto del curso de deep RL de HuggingFace: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo sobre ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes de Unity en HuggingFace: https://huggingface.co/unity
