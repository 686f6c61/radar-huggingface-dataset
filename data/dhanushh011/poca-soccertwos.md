# dhanushh011/poca-SoccerTwos

## Resumen

`dhanushh011/poca-SoccerTwos` es un agente de aprendizaje por refuerzo entrenado con el algoritmo MA-POCA (Multi-Agent POsthumous Credit Assignment) sobre el entorno **SoccerTwos** de Unity ML-Agents, un escenario de fútbol 2 contra 2 en el que dos equipos de agentes cooperan dentro de cada equipo y compiten entre sí. El modelo se publica en formato ONNX bajo la librería `ml-agents` y está etiquetado como participante en el *AI vs. AI SoccerTwos Challenge* de Hugging Face. El autor es el usuario `dhanushh011`, sin más información de filiación disponible.

El interés de esta publicación es doble. Por un lado, MA-POCA es uno de los algoritmos multiaqente específicos del toolkit de Unity: introduce un crítico centralizado y una asignación de crédito "póstuma" que permite recompensar a agentes que contribuyeron al resultado aunque ya no estén activos en el episodio, algo relevante en entornos cooperativos con número variable de agentes. Por otro, el repositorio se enmarca en un reto abierto de comparación de políticas, donde la utilidad principal es disponer de un rival o compañero entrenado reproducible.

La ficha se ve limitada por la ausencia casi total de documentación: la model card únicamente indica la tarea, la librería, las etiquetas y el nombre del entorno. No se publican hiperparámetros, número de pasos de entrenamiento, tamaño de los pesos, licencia ni resultados de benchmarks; el tamaño del repositorio figura como 0,0 GB y el contador de descargas y valoraciones es cero, por lo que la reproducibilidad y el uso en producción no están garantizados con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política actor-crítico para aprendizaje por refuerzo multiaqente, entrenada con MA-POCA sobre Unity ML-Agents (detalle de capas no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el "contexto" es la ventana de observaciones del entorno SoccerTwos, definida por ML-Agents, no disponible en este repositorio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (agente de control, no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportado desde ML-Agents) |

## Arquitectura y entrenamiento

MA-POCA (Multi-Agent POsthumous Credit Assignment) es un algoritmo de aprendizaje por refuerzo multiaqente cooperativo implementado en Unity ML-Agents. La política es una red neuronal que mapea observaciones vectoriales del entorno (posiciones y velocidades de balón y jugadores, junto con sensores de tipo *raycast* según la configuración del escenario) a acciones discretas de movimiento y disparo. El entrenamiento combina un crítico centralizado, que ve el estado agregado del equipo, con un mecanismo de asignación de crédito que distribuye la recompensa del equipo entre los agentes según su contribución, incluso cuando un agente deja de estar activo en el episodio. En SoccerTwos el entrenamiento se realiza típicamente mediante autojuego (*self-play*), donde las políticas de ambos equipos se actualizan a partir de los enfrentamientos mutuos.

La model card no aporta ningún dato sobre el volumen de experiencia recolectada, el número de pasos de entrenamiento, la composición de recompensas, la configuración de hiperparámetros ni si se aplicaron fases de currículo o de autojuego asimétrico. Tampoco se documenta la topología exacta de la red (número de capas ocultas, unidades por capa, funciones de activación) ni el procedimiento de exportación a ONNX. Todos estos elementos figuran como **no disponibles**.

## Capacidades

- Control de un agente jugador en el entorno SoccerTwos de Unity ML-Agents, con acciones de movimiento y golpeo del balón.
- Juego cooperativo 2 contra 2: la política está entrenada para coordinarse con un compañero dentro del mismo equipo, no solo para maximizar una recompensa individual.
- Comportamiento competitivo contra una política adversaria, apto para enfrentamientos en el reto AI vs. AI.
- Inferencia en formato ONNX, lo que permite ejecución mediante el motor de inferencia de Unity (Unity Inference Engine / Sentis), ONNX Runtime o desde la API de Python de ML-Agents.
- Soporte de *tool calling*: no disponible / no aplica.
- Soporte de agentes basados en lenguaje y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo de razonamiento, visión, audio, generación de texto o código): no disponibles; el modelo no procesa lenguaje.

## Casos de uso

- **Investigación en aprendizaje por refuerzo multiaqente**: usar el agente como línea base de MA-POCA frente a otras variantes (PPO, autojuego con parámetros distintos) en un entorno cooperativo-competitivo ya estandarizado, lo que reduce el coste de montar un banco de pruebas propio.
- **Rival o compañero de entrenamiento en Unity**: integrar el ONNX en un proyecto de Unity mediante el motor de inferencia para disponer de un oponente con comportamiento no trivial en prototipos de videojuegos o simulaciones deportivas.
- **Evaluación comparativa en el reto AI vs. AI SoccerTwos**: inscribir la política en el *challenge* de Hugging Face y medir su tasa de victorias contra otras políticas publicadas, aunque no se hayan documentado resultados previos.
- **Generación de datos sintéticos de trayectorias**: ejecutar el agente durante muchas partidas para recolectar pares observación-acción y recompensas, útiles como material de imitación o para análisis de comportamiento (por ejemplo, mapas de ocupación de campo).
- **Pruebas de robustez y análisis de políticas**: someter al agente a variaciones de la física del simulador o a perturbaciones en las observaciones para estudiar su sensibilidad, algo habitual en entornos de investigación con ML-Agents.
- **Docencia y divulgación**: demostrar de forma visual un caso de cooperación emergente en un entorno 2v2, con una política ya entrenada que evita tener que ejecutar un entrenamiento largo en el aula.
- **Estudio de asignación de crédito**: analizar si el mecanismo póstumo de MA-POCA produce roles diferenciados entre los dos jugadores del equipo (por ejemplo, defensor y atacante) mediante inspección de trayectorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de victoria, recompensa media por episodio, Elo del reto ni ninguna otra métrica de evaluación. Asimismo, no se documenta el número de pasos de entrenamiento, por lo que tampoco es posible contextualizar el nivel de convergencia de la política.

## Requisitos de hardware

- **VRAM para inferencia**: no disponible. No se publica el tamaño de los pesos ONNX (el repositorio figura con 0,0 GB y cero descargas). Como referencia general del dominio, las políticas de ML-Agents para SoccerTwos son redes pequeñas de tipo perceptrón multicapa, no modelos de miles de millones de parámetros.
- **GPU recomendadas**: no disponibles. Debido al reducido tamaño típico de estas políticas, la inferencia suele ser viable en CPU; cualquier GPU con soporte ONNX Runtime o con Unity en ejecución (por ejemplo, RTX 3060 en adelante) sería más que suficiente en el escenario habitual.
- **¿Cabe en GPU de consumo?**: previsiblemente sí en cualquier GPU de consumo, e incluso en CPU, siempre que se confirmen los pesos reales del repositorio. No se dispone de confirmación documental.
- **Opciones de despliegue**: Unity ML-Agents con Unity Inference Engine (Sentis), ONNX Runtime (Python, C++, C#), la API `mlagents` de Python y el entorno SoccerTwos del paquete de Unity. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que son *runtimes* de modelos de lenguaje y no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles. En un despliegue típico de SoccerTwos la política debe responder en cada paso de simulación (frecuencia fija del entorno), pero no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados de este agente ni de modelos comparables identificados en la información proporcionada. Como contexto del ecosistema, la propia librería ML-Agents permite entrenar agentes para SoccerTwos con otros algoritmos (PPO con autojuego, por ejemplo), y el reto AI vs. AI de Hugging Face alberga otras políticas del mismo entorno, pero no se han facilitado identificadores, métricas ni enlaces a esas alternativas, por lo que la comparación cuantitativa figura como **no disponible**.

| Alternativa | Algoritmo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`dhanushh011/poca-SoccerTwos`) | MA-POCA (ML-Agents) | no disponible | no aplica (entorno SoccerTwos) | no disponible | ONNX en Hugging Face |
| Agentes PPO de SoccerTwos en ML-Agents | PPO con autojuego | no disponible | no aplica | no disponible | Kit de ML-Agents (referencia, no es un modelo concreto) |
| Otras políticas del reto AI vs. AI | no disponible | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia no especificada**: al no declararse licencia, no puede asumirse permiso de uso comercial, modificación ni redistribución. Cualquier uso en producción requiere contactar con el autor.
- **Documentación inexistente**: no hay hiperparámetros, versión de ML-Agents, configuración del entorno ni semilla de entrenamiento, lo que hace imposible reproducir el resultado.
- **Tamaño del repositorio ambiguo**: el repo figura con 0,0 GB, lo que podría indicar que los pesos no están realmente publicados o que el archivo es extremadamente pequeño. Conviene verificarlo antes de cualquier integración.
- **Sobreajuste al simulador**: al ser una política entrenada en un único entorno, su comportamiento depende de la física, la escala y la configuración de observaciones concretas de SoccerTwos; no es transferible directamente a otro simulador o juego sin reentrenamiento.
- **Sin garantías de robustez**: no se han documentado pruebas contra perturbaciones, cambios de oponente o variaciones del entorno, por lo que el rendimiento fuera de la distribución de entrenamiento es desconocido.
- **Sesgos del entorno**: los comportamientos aprendidos reflejan las recompensas y dinámicas definidas en SoccerTwos; pueden aparecer estrategias degeneradas o explotación de defectos de la simulación, algo frecuente en RL.
- **Riesgo de alucinación**: no aplica, ya que el modelo no genera lenguaje natural.
- **Ausencia de benchmarks públicos**: no hay evidencia verificable de su nivel de juego (tasa de victorias, Elo o recompensa media), por lo que no debería presentarse como una política competitiva sin medirla.
- **Advertencia para producción**: cualquier despliegue debería realizarse con la versión de ML-Agents compatible con el ONNX exportado; una discrepancia de versión puede alterar el orden o el significado de las observaciones y degradar el comportamiento de forma silenciosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dhanushh011/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación general de ML-Agents (incluye métodos de entrenamiento y el entorno SoccerTwos): https://github.com/Unity-Technologies/ml-agents/blob/main/docs/ML-Agents-Overview.md
- Página del reto AI vs. AI SoccerTwos en Hugging Face: no disponible (no se ha facilitado la URL en la información proporcionada)
- Artículo de referencia de MA-POCA: no disponible (no se ha facilitado el enlace en la información proporcionada)
- Repositorio o demo del autor distintos del modelo: no disponible
