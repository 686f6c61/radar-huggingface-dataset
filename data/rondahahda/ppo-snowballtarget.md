# rondahahda/ppo-SnowballTarget

## Resumen

rondahahda/ppo-SnowballTarget es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) para resolver el entorno SnowballTarget de Unity ML-Agents. El modelo ha sido desarrollado por el usuario rondahahda y publicado en HuggingFace con la librería ml-agents. El entorno SnowballTarget, creado por Hugging Face, consiste en un oso llamado Julien the Bear que debe lanzar bolas de nieve contra objetivos que aparecen en escena para maximizar la recompensa acumulada.

Se trata de un modelo de carácter introductorio, entrenado desde cero durante 91.608 pasos en Google Colab y con ayuda de Codex para la codificación y ejecución. El propio autor indica explícitamente que no es una política completamente convergida, sino un ejercicio formativo vinculado al curso de deep reinforcement learning de HuggingFace. Los pesos se exportan en formato ONNX para la inferencia de la política.

Su relevancia es fundamentalmente educativa y comparativa: sirve como referencia reproducible de un pipeline completo de entrenamiento y evaluación con ML-Agents, y como punto de partida para fine-tuning o para experimentos de investigación sobre PPO en entornos de control continuo/discreto simples.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política PPO (actor-critic) para Unity ML-Agents; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (agente de RL, no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (no es un modelo de lenguaje; no se declaran idiomas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (política evaluada); checkpoint.pt para continuar entrenamiento; configuration.yaml y config.json con ajustes |

## Arquitectura y entrenamiento

El modelo es una política entrenada con PPO, un algoritmo de gradiente de política con actor-critic y recorte de la ratio de probabilidades. La implementación corresponde a la librería Unity ML-Agents, y la política resultante se exporta a ONNX para su ejecución determinista. No se especifican en la información disponible el número de capas, el tamaño de las capas ocultas, el tipo de observaciones (vectoriales, visuales o mixtas) ni la dimensión del espacio de acciones.

El entrenamiento se realizó desde cero durante 91.608 pasos en Google Colab, con asistencia de Codex para la codificación y la ejecución. No se documentan el número de entornos paralelos, la composición del buffer de experiencia, los hiperparámetros de PPO (learning rate, clip range, epochs, batch size) ni si se aplicaron técnicas adicionales como normalización de recompensas o curriculum learning. La recompensa media reportada incluye la recompensa de equipo del componente de fútbol del entorno, según indica la propia model card.

## Capacidades

- Control de un agente en el entorno SnowballTarget: lanzar bolas de nieve contra objetivos que aparecen dinámicamente.
- Inferencia determinista mediante la política ONNX exportada (acciones sin muestreo).
- Continuación del entrenamiento a partir del fichero checkpoint.pt.
- Evaluación reproducible con semilla fija (seed 12345) sobre 20 episodios completos.
- Ejecución dentro del ecosistema Unity ML-Agents (entrenamiento, exportación e inferencia).
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión general ni capacidades multilingües.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.

## Casos de uso

- Material didáctico para el curso de deep RL de HuggingFace: el agente reproduce el flujo completo de las unidades 5 y 7 (entrenamiento con ML-Agents y exportación a ONNX), por lo que sirve como referencia práctica para estudiantes que quieran replicar el pipeline paso a paso.
- Punto de partida para fine-tuning: el fichero checkpoint.pt permite reanudar el entrenamiento y aumentar el número de pasos para obtener una política más convergida, útil en ejercicios de ajuste de hiperparámetros.
- Baseline de comparación: al declarar un mean_reward de 24.75 sobre 20 episodios con semilla fija, permite contrastar el efecto de cambios en la configuración de PPO (clip range, learning rate, tamaño de red) frente a un resultado conocido.
- Despliegue de inferencia en Unity: el fichero ONNX puede cargarse en el motor mediante Barracuda o Sentis para ejecutar al agente dentro de una escena interactiva sin necesidad de reentrenar.
- Evaluación automatizada en pipelines de CI: al ser un modelo pequeño y en formato ONNX, puede integrarse en scripts de evaluación por lotes con ONNX Runtime para medir de forma periódica la recompensa media tras cada reentrenamiento.
- Prototipado de control de agentes en simulación: sirve como caso de estudio mínimo de una política de control por refuerzo (observación -> acción) aplicable conceptualmente a tareas de apuntado y lanzamiento en robótica simulada.
- Docencia y talleres sobre PPO: permite ilustrar de forma tangible la varianza entre episodios (desviación estándar de 2,3848 sobre una media de 24,75) y los problemas de convergencia en políticas entrenadas con pocos pasos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Reinforcement Learning | ML-Agents-SnowballTarget | mean_reward | 24.75 +/- 2.384848003542364 | No |

Detalles de la evaluación según el autor: política ONNX con acciones deterministas, 20 episodios completos de agente, semilla 12345. Los retornos completos por episodio están en evaluation.json. La recompensa incluye la recompensa de equipo del componente de fútbol del entorno.

## Requisitos de hardware

- VRAM estimada: mínima (el tamaño del repositorio es de 0,0 GB y la política se exporta a ONNX), por lo que la inferencia es viable en CPU sin GPU dedicada.
- GPU recomendadas: no se requieren; cualquier GPU compatible con ONNX Runtime o Unity Sentis/Barracuda es suficiente. No se documentan requisitos específicos.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU. No se dispone de cifras exactas de memoria del modelo.
- Opciones de despliegue: Unity ML-Agents (entrenamiento), Unity Barracuda/Sentis o ONNX Runtime (inferencia del fichero ONNX). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | mean_reward | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rondahahda/ppo-SnowballTarget | SnowballTarget | PPO | 24.75 +/- 2.38 | no disponible | HuggingFace |
| Adilbai/ppo-SnowballTarget | SnowballTarget | PPO | no disponible | no disponible | HuggingFace |
| RyanAA/ppo-SnowballTarget | SnowballTarget | PPO | no disponible | no disponible | HuggingFace |

No se han localizado métricas publicadas de los agentes alternativos en la información disponible, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Política no convergida: el autor indica explícitamente que se trata de un modelo de curso introductorio y no de una política totalmente entrenada (solo 91.608 pasos).
- Varianza elevada: la desviación estándar (2,3848) equivale aproximadamente a un 9,6 % de la recompensa media (24,75), lo que refleja inconsistencia entre episodios.
- Evaluación limitada: solo 20 episodios y una única semilla (12345), con acciones deterministas; no hay evaluación estocástica ni sobre múltiples semillas.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial. Es necesario contactar con el autor antes de cualquier uso en producción.
- Modelo específico de una tarea: únicamente opera en el entorno SnowballTarget de Unity ML-Agents. No es transferible directamente a otros entornos sin reentrenamiento.
- Sin capacidades de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, por lo que no es comparable con modelos de lenguaje en esas dimensiones.
- Documentación incompleta: no se detallan hiperparámetros de PPO, arquitectura de red, tipo de observaciones ni composición de la recompensa, lo que dificulta la reproducibilidad exacta.
- Sesgos y alucinación: no aplicables en el sentido habitual de los modelos de lenguaje; el riesgo equivalente es la generalización deficiente de la política a estados no vistos durante el entrenamiento.
- Aviso de seguridad: no se ha realizado una evaluación de robustez frente a perturbaciones del entorno ni de comportamiento fuera de distribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rondahahda/ppo-SnowballTarget
- Tutorial del curso (unidad 5): https://huggingface.co/learn/deep-rl-course/en/unit5/hands-on
- Tutorial del curso (unidad 7): https://huggingface.co/learn/deep-rl-course/en/unit7/hands-on
- Repositorio Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Entorno Snowball-Target de Hugging Face: https://github.com/huggingface/Snowball-Target
- Agente alternativo Adilbai/ppo-SnowballTarget: https://huggingface.co/Adilbai/ppo-SnowballTarget
- Agente alternativo RyanAA/ppo-SnowballTarget: https://huggingface.co/RyanAA/ppo-SnowballTarget
- Repositorio SnowballTarget1---RL---UnityMLagents: https://github.com/dhruvil122/SnowballTarget1---RL---UnityMLagents/blob/main/README.md
