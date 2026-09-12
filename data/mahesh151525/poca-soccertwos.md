# Mahesh151525/poca-SoccerTwos

## Resumen

`Mahesh151525/poca-SoccerTwos` es un agente de aprendizaje por refuerzo profundo entrenado con la librería Unity ML-Agents para el entorno de ejemplo **SoccerTwos**, un escenario de fútbol 2 contra 2 en el que dos equipos de dos agentes compiten por marcar goles en un campo reducido. El autor del repositorio es el usuario de Hugging Face Mahesh151525 y el nombre del modelo indica que el entrenamiento se realizó con el algoritmo POCA (el entrenador on-policy disponible en las versiones recientes de ML-Agents), tal y como aparece referenciado en la model card.

No se trata de un modelo de lenguaje ni de un modelo fundacional: es una red de política (policy network) específica de una tarea, con observaciones vectoriales y por raycast definidas por el propio entorno, y cuya salida son acciones de movimiento, rotación y patada. El artefacto publicado es un fichero `SoccerTwos.onnx` pensado para ejecutarse como cerebro de un agente dentro del motor Unity, no para inferencia de texto.

Su relevancia es acotada pero clara para la comunidad de RL: sirve como ejemplo reproducible de un pipeline completo de entrenamiento con ML-Agents (entrenamiento, exportación a ONNX y visualización en el navegador mediante el Space oficial de Unity), y como punto de partida para experimentar con auto-juego (self-play), curriculum learning y algoritmos on-policy en entornos multiagente. La información pública disponible es muy escasa: el repositorio no declara licencia, idiomas, número de parámetros ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política de ML-Agents (perceptores de observaciones vectoriales y raycasts, con codificadores y cabezas de política y valor); numero de capas y unidades no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el agente opera por pasos de simulacion con observaciones del entorno SoccerTwos (sin ventana de contexto tipo transformer) |
| Tipos de cuantizacion | no disponible; el artefacto publicado es un fichero ONNX para inferencia en Unity |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | no disponible (la model card y los metadatos del repositorio no la declaran) |
| Formato de pesos | ONNX (`SoccerTwos.onnx`); el repositorio tambien es compatible con el flujo de ML-Agents (`mlagents-learn`) |
| Algoritmo de entrenamiento | POCA (segun el nombre del modelo); hiperparametros no disponibles |
| Entorno | SoccerTwos (Unity ML-Agents), partidos 2v2 |
| Libreria | ml-agents |
| Tamano del repositorio | 0.0 GB (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-12 (segun metadatos) |

## Arquitectura y entrenamiento

La model card es minima y no describe la topologia de la red. Por el contexto del toolkit, se trata de un agente de ML-Agents entrenado con un entrenador on-policy (POCA) sobre el entorno SoccerTwos, con el flujo habitual del toolkit: configuración YAML de entrenamiento, ejecución con `mlagents-learn`, guardado de checkpoints y exportación del cerebro a ONNX para su uso en inferencia. El entorno SoccerTwos es un escenario multiagente de auto-juego con recompensas basadas en posesión, avance del balón y goles, y habitualmente se entrena con mecanismos de self-play y ajuste de dificultad; no obstante, no se dispone de la configuración concreta usada en este entrenamiento (número de pasos, tamaño de red, hiperparámetros de POCA, uso o no de self-play con ELO, currículum o memory/attention).

Tampoco hay información sobre el número de tokens o episodios vistos, la composición de datos (en RL el "dataset" es la propia experiencia generada por la política) ni sobre fases de ajuste tipo RLHF o DPO, que no aplican en este dominio. La única innovación documentada por el propio autor es el uso del algoritmo POCA y la publicación del resultado como artefacto ONNX reproducible, junto con instrucciones para reanudar el entrenamiento (`--resume`) y para visualizar al agente en el Space oficial de Unity.

## Capacidades

- Control continuo y discreto de un agente dentro del entorno SoccerTwos: desplazamiento, orientación y patada.
- Juego cooperativo y competitivo en un escenario 2 contra 2 con recompensas basadas en el balón y en los goles.
- Toma de decisiones por paso de simulación a partir de observaciones vectoriales y por raycast definidas por el entorno (posición propia, de compañeros, rivales y balón, más sensores de distancia).
- Política entrenada específicamente para la tarea: no generaliza a otros entornos, juegos ni dominios.
- Ejecución embebida en Unity mediante un modelo ONNX como "cerebro" del agente.
- Posibilidad de reanudar el entrenamiento con ML-Agents usando `mlagents-learn <config>.yaml --run-id=<run_id> --resume`.
- Visualización interactiva en el navegador a través del Space `unity/ML-Agents-SoccerTwos`.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling, function calling ni capacidades multilingües.

## Casos de uso

- Investigación en aprendizaje por refuerzo multiagente: usar este agente como referencia o línea base en experimentos de auto-juego y cooperación/competencia 2v2 dentro de SoccerTwos, comparando curvas de recompensa y comportamiento táctico.
- Docencia y cursos de RL: el flujo completo (entrenar con ML-Agents, exportar a ONNX, visualizar en el Space de Unity) encaja como ejemplo práctico en un módulo introductorio, tal y como propone la Unit 7 del curso de Deep RL de Hugging Face.
- Banco de pruebas de algoritmos on-policy: reanudar el entrenamiento con POCA y modificar hiperparámetros o la configuración del entorno para medir el impacto en la tasa de victorias y en la estabilidad del entrenamiento.
- Desarrollo de agentes para videojuegos: el artefacto ONNX puede integrarse como NPC de fútbol en prototipos de Unity, aportando comportamiento emergente sin reglas programadas a mano.
- Estudio de transferencia y robustez: evaluar cómo se degrada la política frente a cambios en el entorno (número de agentes, tamaño del campo, velocidades) para analizar sobreajuste a la tarea original.
- Comparación de formatos de despliegue: servir el mismo agente vía ONNX Runtime o mediante el runtime interno de Unity para medir latencia y consumo en CPU frente a otros formatos de exportación de ML-Agents.
- Generación de datos sintéticos de trayectorias: usar las partidas del agente para recolectar episodios y alimentar técnicas de imitation learning o de análisis táctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ELO, recompensa media, tasa de victorias ni curvas de entrenamiento, y los metadatos del repositorio no aportan métricas. Tampoco hay información sobre el número de pasos de entrenamiento ni sobre si el agente se evaluó frente a versiones anteriores de sí mismo o frente a políticas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo de política pequeño exportado a ONNX para un entorno de ejemplo de ML-Agents, es esperable que quepa en memoria de CPU y que no requiera GPU dedicada, pero no hay datos confirmados.
- GPU recomendadas: no disponibles; el caso de uso típico del Space de Unity y de la ejecución en el editor es CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo e incluso sin GPU, dado el tamano del repositorio (0.0 GB reportados) y la naturaleza del artefacto; sin confirmacion oficial.
- Opciones de despliegue: ONNX Runtime, Unity con el paquete ML-Agents (barracuda/sentis como backend de inferencia) y el Space oficial `unity/ML-Agents-SoccerTwos` para visualizacion en navegador. No aplican vLLM, llama.cpp, Ollama ni TGI, que son runners de modelos de lenguaje.
- Reanudacion de entrenamiento: `mlagents-learn` con la configuracion YAML correspondiente y el flag `--resume`; aqui el coste computacional depende del numero de entornos simulados en paralelo y del entrenador elegido, no del tamano del modelo publicado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mahesh151525/poca-SoccerTwos | Agente RL (POCA) | SoccerTwos (2v2) | no disponible | no aplica | no disponible | Hugging Face, ONNX |
| Otros agentes SoccerTwos de la comunidad (entrenados con PPO u otros entrenadores de ML-Agents) | Agente RL | SoccerTwos (2v2) | no disponible | no aplica | variable, a menudo no declarada | Hugging Face |
| Politicas de referencia del toolkit ML-Agents | Agente RL | Multiples entornos de ejemplo | no disponible | no aplica | licencia del toolkit de Unity | Repositorio GitHub de ML-Agents |

No se dispone de datos publicados de rendimiento (ELO, recompensa media, tasa de victorias) para este agente ni para alternativas comparables, por lo que la comparacion cuantitativa no es posible con la informacion disponible.

## Limitaciones y advertencias

- Especializacion extrema: la politica solo es valida para el entorno SoccerTwos con la misma configuracion de observaciones y acciones; cambios en el espacio de observacion o de accion invalidan el modelo.
- Ausencia de licencia declarada: no se especifica licencia en el repositorio, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor.
- Trazabilidad limitada: no hay informacion sobre hiperparametros, numero de pasos de entrenamiento, semillas ni curvas de aprendizaje, lo que dificulta reproducir o auditar el resultado.
- Riesgo de sobreajuste al self-play: sin datos de evaluacion frente a politicas externas, no puede descartarse que el agente explote estrategias especificas de sus propios compañeros y rivales entrenados.
- Politica no determinista en la practica: la inferencia puede incluir muestreo estocastico segun la configuracion, lo que produce variabilidad entre partidas y complica la evaluacion.
- Sin capacidades linguisticas ni multimodales: no admite prompting, tool calling, agentes basados en texto, vision ni audio; cualquier uso fuera del bucle de simulacion de Unity no aplica.
- Dependencia del ecosistema Unity y ML-Agents: el despliegue fuera de Unity exige implementar manualmente el preprocesado de observaciones y el postprocesado de acciones.
- Metadatos llamativos: la fecha de creacion declarada (2026-09-12) y el tamano de repositorio de 0.0 GB sugieren que los metadatos pueden no ser fiables; conviene verificar el contenido real antes de reutilizarlo.
- Resultados de la busqueda web no relevantes: las fuentes recuperadas (paginas de la UNSAAC) no guardan relacion con el modelo, por lo que no aportan verificacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mahesh151525/poca-SoccerTwos
- Space de visualizacion de Unity para SoccerTwos: https://huggingface.co/spaces/unity/ML-Agents-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentacion del toolkit ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Curso de Deep RL de Hugging Face, Unit 7: https://huggingface.co/learn/deep-rl-course/unit7/introduction
