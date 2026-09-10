# ChickenHiiro/poca-SoccerTwos

## Resumen

ChickenHiiro/poca-SoccerTwos es un agente de aprendizaje por refuerzo profundo entrenado con la librería Unity ML-Agents para el entorno SoccerTwos, un escenario de fútbol 2 contra 2 en el que dos equipos de dos agentes compiten dentro de una simulación Unity. El repositorio lo publica el usuario ChickenHiiro en Hugging Face y su contenido es la política entrenada: la model card indica que se trata de un agente entrenado con el algoritmo POCA (uno de los entrenadores multiagente de ML-Agents) y que los pesos se exportan en formato .nn y .onnx para poder ejecutarse fuera del proceso de entrenamiento. No es un modelo de lenguaje ni un modelo de propósito general: no genera texto, no tiene ventana de contexto y no se le aplican conceptos como tokens, cuantización de LLM o ajuste por instrucciones.

La relevancia de este tipo de publicación es reproducibilidad y reutilización: el Hub de Hugging Face actúa como repositorio de artefactos de RL, y el visor de Unity permite cargar el archivo .onnx desde el navegador para ver al agente jugar sin instalar Unity ni reconstruir el entrenamiento. Para un investigador, el valor está en disponer de un checkpoint de una política POCA ya entrenada en un entorno de referencia, útil como baseline, como punto de partida para reanudar entrenamiento con `mlagents-learn --resume` o como material didáctico en el curso de deep RL de Hugging Face.

El repositorio tiene un tamaño aproximado de 0,2 GB (probablemente incluye artefactos de TensorBoard y checkpoints intermedios, aunque no se detalla su desglose), registra 0 descargas y 0 likes en el momento de la consulta, y no declara licencia. Esa ausencia de licencia y de métricas de rendimiento son las dos limitaciones más importantes de cara a cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de aprendizaje por refuerzo (Unity ML-Agents); estructura de red no especificada. No es un transformer |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible: la entrada es un vector de observación de dimensión fija por paso de simulación, no una secuencia de tokens |
| Tipos de cuantización | no disponible; los pesos se publican sin indicar cuantización (ONNX admite cuantización int8 a posteriori) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje; no se declara información de idiomas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (.onnx) y Unity ML-Agents (.nn); el repositorio incluye además artefactos de TensorBoard |
| Algoritmo de entrenamiento | POCA (entrenador de ML-Agents) |
| Entorno | SoccerTwos (Unity ML-Agents) |
| Librería | ml-agents |
| Pipeline declarado | reinforcement-learning |
| Tamaño del repositorio | ≈ 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura de la red, el número de capas, las unidades ocultas, el uso de memoria recurrente (LSTM) ni los hiperparámetros del entrenamiento. Lo único verificable es que se trata de una política de ML-Agents entrenada con el algoritmo POCA, que el repositorio está etiquetado como `ml-agents`, `tensorboard` y `onnx`, y que existen artefactos de entrenamiento en formato TensorBoard. En ML-Agents, los entornos con observaciones vectoriales como SoccerTwos se resuelven habitualmente con perceptrones multicapa pequeños, opcionalmente con capa recurrente y con codificadores visuales si hubiera cámara; no hay datos en la información proporcionada que confirmen cuál de estas variantes se usó aquí.

Tampoco se documentan el número de pasos de entrenamiento, el número de instancias del entorno ejecutadas en paralelo, la composición de recompensas, el uso de autojuego ni el número de episodios. El algoritmo POCA está orientado a escenarios multiagente y se emplea en ML-Agents para entornos competitivos y cooperativos como SoccerTwos, pero la model card no aporta detalles de configuración. No hay RLHF, DPO ni ajuste por preferencias: es aprendizaje por refuerzo desde simulación, con recompensa definida por el entorno.

## Capacidades

- Control de agentes en simulación: produce acciones de movimiento y golpeo dentro de SoccerTwos a partir de las observaciones del entorno (el espacio de acciones exacto no se detalla en la información disponible).
- Juego competitivo y cooperativo 2 contra 2: el entorno exige coordinación dentro del equipo y oposición contra el equipo rival.
- Inferencia fuera del entrenamiento: los pesos .nn/.onnx permiten ejecutar la política en Unity (Sentis/Inference Engine) o mediante ONNX Runtime, sin depender del proceso de `mlagents-learn`.
- Reanudación de entrenamiento: el flujo documentado por ML-Agents permite continuar el entrenamiento desde este checkpoint con `--resume`.
- Visualización en navegador: el archivo .onnx puede cargarse en el visor de Unity en Hugging Face para reproducir partidas.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes basados en texto, razonamiento multi-paso, código, matemáticas ni visión, salvo que la configuración de entrenamiento no publicada lo contemplara.
- No tiene capacidades multilingües declaradas.
- No dispone de modo "thinking", audio ni ninguna capacidad multimodal documentada.

## Casos de uso

- Baseline de investigación en RL multiagente: sirve como punto de comparación reproducible frente a políticas PPO, SAC u otros entrenadores de ML-Agents en el mismo entorno SoccerTwos, midiendo tasa de victoria o goles por episodio con la misma semilla y configuración.
- Demostración interactiva sin instalación: cargando el archivo .onnx en el visor de Unity en Hugging Face se puede observar al agente jugando en el navegador, útil para docencia, charlas o validación rápida de un checkpoint.
- Reentrenamiento con nuevas recompensas: usando `mlagents-learn <config>.yaml --run-id=<id> --resume` se puede continuar el entrenamiento cambiando la función de recompensa para estudiar cómo evoluciona el comportamiento del agente.
- Material didáctico en cursos de deep RL: encaja en los tutoriales oficiales de ML-Agents y en el curso gratuito de deep reinforcement learning de Hugging Face, donde el alumno puede inspeccionar pesos ya entrenados y compararlos con los suyos.
- Prototipado de comportamientos de NPC en Unity: para videojuegos deportivos o de equipo, la política puede integrarse como controlador de personajes no jugadores y evaluarse dentro del motor antes de invertir en un sistema propio.
- Pruebas de robustez frente a oponentes: enfrentando esta política a otras versiones entrenadas o a oponentes modificados se pueden estudiar fenómenos de explotación de la dinámica del entorno y de generalización entre políticas.
- Integración en pipelines automatizados de evaluación: mediante ONNX Runtime se puede ejecutar la política de forma headless en un servidor de CI para calcular métricas por commit sin abrir el editor de Unity.
- Estudio de transferencia simulación a otros dominios: como política de control multiagente sirve de referencia en experimentos de transferencia a otros entornos de control con observaciones vectoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de victoria, ELO, goles por episodio, número de pasos de entrenamiento ni curvas de recompensa, y los resultados de la búsqueda web no aportan métricas relacionadas con este repositorio (los resultados obtenidos correspondían a un sitio corporativo sin relación con el modelo).

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. Las políticas de ML-Agents para entornos con observaciones vectoriales son redes pequeñas y su inferencia cabe holgadamente en CPU; no se publica el tamaño del archivo de política final.
- GPU recomendadas: no se especifica ninguna. Para inferencia no se requiere GPU; para el entrenamiento de redes pequeñas, ML-Agents puede ejecutarse sin GPU dedicada, aunque el cuello de botella habitual es la simulación del entorno.
- GPU de consumo: no hay datos oficiales, pero el perfil del modelo (red pequeña, entorno vectorial, artefactos .onnx) es compatible con hardware de consumo e incluso con ejecución en CPU.
- Despliegue: Unity Sentis / Inference Engine (incluido WebGPU o WASM en navegador), ONNX Runtime, y el visor de Unity en Hugging Face para demostraciones.
- Frameworks no aplicables: vLLM, llama.cpp, Ollama o TGI no son opciones para este artefacto, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones de pasos por segundo ni tiempos de inferencia.

## Comparativa con modelos similares

No se dispone de datos numéricos de modelos comparables concretos. A continuación se indican las familias con las que sería comparable conceptualmente, marcando los datos como no disponibles.

| Modelo / familia | Algoritmo | Entorno | Parámetros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|---|
| ChickenHiiro/poca-SoccerTwos | POCA | SoccerTwos | no disponible | no aplica | no disponible | no disponible |
| Agentes de referencia de ML-Agents en SoccerTwos | PPO / self-play | SoccerTwos | no disponible | no aplica | según repositorio de origen | no disponible |
| Agentes multiagente tipo SAC/MASAC en entornos de equipo | SAC / variantes | entornos Unity o equivalentes | no disponible | no aplica | según repositorio de origen | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si se permite uso comercial, redistribución o modificación; en ausencia de licencia debe asumirse que no hay autorización explícita.
- Sin métricas de rendimiento: no hay tasa de victoria, ELO ni curvas de recompensa, por lo que no se puede afirmar que la política sea competitiva ni que el entrenamiento haya convergido.
- Sin especificaciones de arquitectura ni hiperparámetros: la reproducibilidad del entrenamiento es limitada y no se puede auditar cómo se obtuvo el checkpoint.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de que el agente funcione correctamente ni de que el archivo subido corresponda a un checkpoint final en lugar de un estado intermedio.
- Riesgo de explotación de la simulación (reward hacking): los agentes de RL entrenados con autojuego tienden a aprovechar atajos de la dinámica del entorno; su comportamiento puede degradarse frente a oponentes o versiones del entorno distintos de los del entrenamiento.
- Generalización limitada: la política está especializada en SoccerTwos y no es transferible directamente a otras tareas sin reentrenamiento.
- Comportamiento fuera de distribución: al recibir observaciones atípicas puede producir acciones erráticas; no existe medida de calibración ni de incertidumbre.
- Idiomas: no aplica; no hay capacidades lingüísticas que evaluar.
- Ausencia de información sobre sesgos: al no existir datos de entrenamiento ni de evaluación documentados, no se pueden caracterizar sesgos de comportamiento.
- Uso en producción: además de la licencia, hay que verificar que la versión de ML-Agents y el formato .nn/.onnx del repositorio sean compatibles con la versión de Unity Sentis o del runtime objetivo, ya que la compatibilidad de artefactos entre versiones no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChickenHiiro/poca-SoccerTwos
- Repositorio de Unity ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Documentación de ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Organización de Unity en Hugging Face (visor de agentes en navegador): https://huggingface.co/unity
- Curso de deep RL de Hugging Face, unidad 5: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Curso de deep RL de Hugging Face, unidad bonus 1: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Búsqueda web: no se encontraron enlaces relevantes al modelo; los resultados devueltos correspondían a un sitio corporativo sin relación con el repositorio.
