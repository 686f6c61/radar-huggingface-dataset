# brouthen/microduck-football-act

## Resumen

Microduck-football-act es una política de imitación basada en ACT (Action Chunking Transformer) entrenada para que el robot bípedo microduck de Pollen Robotics juegue al fútbol en simulación MuJoCo. El modelo recibe únicamente la imagen de la cámara de cabeza (240x320 RGB) y un vector de propiocepción de 32 dimensiones, y produce comandos de movimiento de 4 dimensiones (velocidad lineal, velocidad angular y activación de patada) a 5 Hz. Lo desarrolla el usuario brouthen y se distribuye con licencia Apache 2.0 a través de la librería LeRobot.

La relevancia técnica del modelo reside en su enfoque de destilación de políticas: aprende de un profesor PPO privilegiado (con acceso a información completa del entorno) y se refina mediante dos rondas de DAgger, lo que permite al estudiante operar solo con observaciones realistas de cámara y sensores. Con 51,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a robótica simulada, no a despliegue en lenguaje o visión general.

No se trata de un modelo de lenguaje ni de un modelo fundacional multimodal: es una política de control visuomotor específica para una tarea y un robot concretos. Su interés es principalmente metodológico, como ejemplo de pipeline LeRobot + ACT + DAgger aplicado a locomoción bípeda y manipulación deportiva en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone ResNet-18, dim_model 512, VAE |
| Parametros totales | 51.611.268 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa chunk de 20 acciones y n_action_steps 5) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo de robótica; sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer con encoder visual ResNet-18 que procesa la imagen de cabeza de 240x320 píxeles, combinado con un encoder de estado que recibe 32 dimensiones de propiocepción: giroscopio, vector de gravedad, 14 posiciones articulares, comando previo, tiempo en pie, tiempo restante de patada, estimación de memoria de portería con deriva odométrica y ángulos previos de cabeza. La salida es un chunk de 20 acciones del que se ejecutan 5 pasos (n_action_steps 5), con una variante VAE para modelar la multimodalidad de las demostraciones. La dimensión del modelo es 512.

El entrenamiento combina 195 episodios generados por un profesor PPO privilegiado (dataset brouthen/microduck-football-rl-camera) con 105 episodios jugados por el propio estudiante y reetiquetados por el profesor en dos rondas de DAgger, totalizando 300 episodios y 30.400 fotogramas. La política de caminar y la de patada están congeladas: el modelo ACT solo emite un twist command (vx, vy, yaw_rate) y un disparador de patada que se pasan a esas políticas de bajo nivel. El resultado reportado por el autor es de 16 goles en 20 episodios sobre layouts de campo completo no vistos, en juego abierto y sin oponentes.

## Capacidades

- Control visuomotor de un robot bípedo microduck (25 cm) en simulación MuJoCo a partir de cámara de cabeza y propiocepción.
- Generación de comandos de movimiento (vx, vy, yaw_rate) y activación de patada a 5 Hz.
- Navegación hacia el balón y la portería usando estimación de memoria de portería con deriva odométrica.
- Ejecución de patadas coordinadas con la política de patada congelada del robot.
- Aprendizaje por imitación de un profesor privilegiado, con refinamiento DAgger para corregir la distribución de estados del estudiante.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como referencia reproducible de un pipeline ACT + DAgger sobre LeRobot para estudiar la brecha entre profesor privilegiado y estudiante con observaciones realistas.
- Benchmark de destilación de políticas: comparar el rendimiento del estudiante (16/20 goles) frente a variantes con una o dos rondas de DAgger para medir la contribución de cada ronda de agregación de datos.
- Desarrollo de fútbol robótico simulado: usar la política como base para experimentos de navegación, alineación con el balón y disparo en campos completos sin oponentes.
- Evaluación de robustez visual: probar el modelo con perturbaciones en la cámara de cabeza (ruido, oclusiones, cambios de iluminación) para analizar la dependencia de la política respecto a la percepción.
- Educación y divulgación en robótica: demostrar de forma compacta (51,6 M de parámetros, 0,2 GB) cómo se entrena y despliega una política visuomotora con LeRobot en MuJoCo.
- Punto de partida para extensión a juego con oponentes: reentrenar o afinar la política con nuevos datos que incluyan adversarios y evaluar la degradación del rendimiento respecto al escenario sin oposición.
- Integración en pipelines de simulación a gran escala: ejecutar evaluaciones masivas de la política en MuJoCo para generar datos o validar variantes del controlador de bajo nivel.

## Benchmarks y rendimiento

El autor reporta un único resultado en la model card: 16 goles en 20 episodios sobre layouts de campo completo no vistos, en juego abierto y sin oponentes. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otras políticas.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Tasa de gol | 16/20 (80 %) | Layouts de campo completo no vistos, juego abierto, sin oponentes |
| Episodios de entrenamiento | 300 (195 profesor + 105 estudiante reetiquetados) | Dos rondas de DAgger |
| Fotogramas de entrenamiento | 30.400 | — |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con al menos 2-4 GB libres, incluyendo el cómputo de la ResNet-18 sobre imágenes de 240x320.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100); el cuello de botella es la simulación MuJoCo y el bucle de control a 5 Hz, no el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con varios GB de VRAM.
- Opciones de despliegue: LeRobot (librería oficial del modelo), con evaluación mediante `python -m microduck_football.imitation.eval_student` sobre MuJoCo. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el control opera a 5 Hz y la evaluación se realiza en simulación, por lo que los tiempos dependen del hardware y de la configuración de MuJoCo.

## Comparativa con modelos similares

No se dispone de datos numéricos de modelos comparables en la información proporcionada. A continuación se indican alternativas conceptuales de la misma categoría (políticas de imitación visuomotoras en LeRobot), sin comparación cuantitativa:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-football-act | 51,6 M | no aplica (chunk de 20 acciones) | 16/20 goles (reportado por el autor) | Apache 2.0 | Hugging Face, LeRobot |
| Otras políticas ACT en LeRobot | no disponible | no disponible | no disponible | según modelo | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no disponible | no disponible | según modelo | Hugging Face |
| Políticas VQ-BeT en LeRobot | no disponible | no disponible | no disponible | según modelo | Hugging Face |

## Limitaciones y advertencias

- Solo funciona en simulación MuJoCo; no se ha validado en el robot físico microduck ni en otros entornos.
- Entrenado exclusivamente para fútbol sin oponentes; el rendimiento con adversarios no está documentado y probablemente se degrade.
- Depende de la política de caminar y de patada congeladas de Pollen Robotics; cambios en esas políticas invalidan el modelo.
- La percepción se limita a una cámara de cabeza de 240x320 y a 32 dimensiones de propiocepción; es sensible a cambios de calibración, iluminación o resolución.
- Riesgo de deriva odométrica en la estimación de la portería, tal como reconoce el propio autor en la descripción del estado.
- No es un modelo de lenguaje: no tiene capacidades de texto, razonamiento simbólico, tool calling ni multilingüismo.
- No se documentan sesgos sociales ni de alucinación en el sentido lingüístico; el riesgo principal es el fallo de control (caídas, patadas fallidas, pérdida de orientación).
- Licencia Apache 2.0 permite uso comercial, pero los créditos de microduck, políticas de caminar/patada y MJCF pertenecen a Pollen Robotics, y ACT y el formato de dataset a Hugging Face LeRobot; conviene revisar sus términos antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brouthen/microduck-football-act
- Dataset de entrenamiento: https://huggingface.co/datasets/brouthen/microduck-football-rl-camera
- Código, método y resultados completos: https://github.com/BrouthenKamel/lerobot_microduck
- Documentación de ACT en LeRobot: https://huggingface.co/docs/lerobot
- Pollen Robotics (robot microduck y políticas de bajo nivel): no disponible en la información proporcionada.
