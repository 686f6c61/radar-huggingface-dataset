# Rom1T/poca-SoccerTwos

## Resumen

`Rom1T/poca-SoccerTwos` es un agente de aprendizaje por refuerzo entrenado con el algoritmo POCA (POlicy Consolidation with Advantage, una variante de PPO desarrollada por Unity) para el entorno `SoccerTwos` de Unity ML-Agents. No es un modelo de lenguaje: es una política neuronal que controla a los jugadores de un equipo de dos contra dos en un partido de fútbol simulado en 3D dentro del motor Unity. El autor, identificado como Rom1T en Hugging Face, publica el resultado del entrenamiento en formato ONNX (y presumiblemente `.nn`), listo para ser cargado por el runtime de ML-Agents o visualizado directamente en el navegador mediante el visor de Hugging Face.

El modelo resuelve un problema clásico de control multiagente cooperativo-competitivo: dos agentes del mismo equipo deben coordinarse para marcar gol mientras otros dos agentes rivales intentan lo contrario, con observaciones parciales, recompensas dispersas y física de cuerpo rígido. Es relevante como referencia práctica para quien quiera reproducir o extender experimentos de RL multiagente en ML-Agents, comparar variantes de PPO frente a POCA, o disponer de un baseline entrenado para el entorno `SoccerTwos`.

La información pública es muy escasa: el repositorio ocupa 0,2 GB, no tiene descargas ni likes, no declara licencia ni idiomas, y la model card es la plantilla estándar autogenerada por ML-Agents. No se especifican hiperparámetros, número de pasos de entrenamiento, arquitectura exacta de la red ni métricas de recompensa alcanzadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política y valor para RL (ML-Agents, algoritmo POCA); topología exacta no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación definida por el entorno SoccerTwos) |
| Tipos de cuantización | no disponible (se distribuye en ONNX y formato `.nn` de ML-Agents; cuantización no documentada) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`.onnx`) y formato nativo ML-Agents (`.nn`) |
| Librería | `ml-agents` |
| Entorno | Unity ML-Agents `SoccerTwos` |
| Algoritmo | POCA (variante de PPO de Unity ML-Agents) |
| Tamaño del repositorio | 0,2 GB |
| Fecha de creación | 2026-11-17 |
| Fecha de actualización | 2026-11-17 |

## Arquitectura y entrenamiento

El agente se entrena con la librería Unity ML-Agents usando el algoritmo POCA, una implementación de policy optimization con ventaja que Unity incluye como entrenador por defecto para escenarios multiagente con recompensas competitivas. La política consume las observaciones vectoriales y visuales que define el entorno `SoccerTwos` (posiciones y velocidades de jugadores y balón, más raycast o cámara según la configuración del entorno) y produce acciones discretas de movimiento y rotación, además de la acción de disparo o chut.

No se dispone de información sobre el número de pasos de entrenamiento, el tamaño de las redes (capas ocultas, unidades por capa), la composición exacta de las observaciones, la configuración de recompensas (goles, posesión, penalizaciones por tiempo) ni si se aplicaron técnicas de currículo, self-play o imitación. La model card únicamente indica que se trata de un agente POCA entrenado para `SoccerTwos` y remite a la documentación oficial de ML-Agents y a los tutoriales del curso de deep RL de Hugging Face. Tampoco se documenta ninguna innovación técnica específica más allá del propio algoritmo POCA.

## Capacidades

- Control de un jugador de fútbol en el entorno `SoccerTwos` de Unity ML-Agents: movimiento, rotación y chut.
- Coordinación implícita con el compañero de equipo (agente aliado) en un escenario 2 contra 2.
- Toma de decisiones en tiempo real a partir de observaciones parciales del entorno simulado.
- Comportamiento aprendido mediante refuerzo, sin reglas programadas explícitas.
- Ejecución en el runtime de ML-Agents (Unity) y exportación a ONNX para inferencia fuera de Unity.
- Visualización interactiva en el navegador a través del visor de modelos de Hugging Face para entornos ML-Agents oficiales.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico, visión general ni capacidades multilingües: es una política específica de un entorno concreto.

## Casos de uso

- Baseline para investigación en RL multiagente: sirve como punto de partida entrenado para comparar nuevas variantes de PPO, POCA u otros algoritmos en `SoccerTwos`, midiendo la recompensa media por episodio frente a este agente de referencia.
- Reproducción de experimentos: permite reanudar el entrenamiento con `mlagents-learn <config>.yaml --run-id=<id> --resume` para continuar el aprendizaje desde los pesos publicados en lugar de empezar desde cero.
- Docencia y demostraciones: útil en cursos de deep RL para mostrar un agente ya entrenado jugando en el navegador mediante el visor de Hugging Face, sin necesidad de montar Unity localmente.
- Evaluación de robustez frente a oponentes: enfrentar este agente contra políticas entrenadas con self-play o contra versiones con distintas semillas para medir su tasa de victoria y su comportamiento defensivo.
- Pruebas de integración de ML-Agents en pipelines: validar el flujo completo de carga de un `.onnx` en el runtime de Unity, la exportación desde el entrenamiento y la inferencia determinista en producción simulada.
- Generación de datos sintéticos de trayectorias: usar al agente como política de recogida de experiencias (posiciones, acciones, recompensas) para entrenar modelos de imitación o para análisis de comportamiento táctico.
- Benchmark de eficiencia de inferencia: al ser una red pequeña, permite medir latencia por paso de decisión en CPU y GPU dentro de Unity y comparar con otras políticas del mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa media, tasa de victoria, número de pasos de entrenamiento ni curvas de TensorBoard, pese a que las etiquetas del repositorio mencionan `tensorboard`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al tratarse de una política de RL para un entorno con observaciones de baja dimensionalidad, el consumo es mínimo (del orden de decenas o pocos cientos de MB en GPU, y ejecutable en CPU).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060 o superior sobra para inferencia. Para reentrenamiento, una RTX 3090/4090 o una A100 aceleran notablemente el número de pasos por segundo, pero no se dispone de cifras medidas.
- Cabe en GPU de consumo: sí, con amplio margen; también funciona en CPU, que es el modo habitual de ejecutar agentes ML-Agents dentro de Unity.
- Opciones de despliegue: runtime de Unity ML-Agents (Barracuda/Inference Engine), ONNX Runtime para inferencia fuera de Unity, y el visor web de Hugging Face para entornos ML-Agents oficiales.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del número de agentes simultáneos y de la frecuencia de decisión configurada en el entorno.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Descargas/likes |
|---|---|---|---|---|---|
| `Rom1T/poca-SoccerTwos` | SoccerTwos | POCA | ONNX / `.nn` | no disponible | 0 / 0 |
| Agentes oficiales de Unity en `huggingface.co/unity` | Varios (SoccerTwos, Walker, etc.) | PPO/POCA según entorno | `.nn` / ONNX | según repositorio oficial | no disponible en la información proporcionada |
| Políticas PPO genéricas de ML-Agents | Cualquiera configurable | PPO | `.nn` / ONNX | según repositorio | no disponible |

No se dispone de datos de rendimiento comparativo (recompensa media, tasa de victoria) entre este agente y las alternativas, por lo que la comparación se limita a aspectos de disponibilidad y formato.

## Limitaciones y advertencias

- Especialización extrema: el agente solo funciona en el entorno `SoccerTwos` con la configuración de observaciones y acciones con la que fue entrenado; no es reutilizable en otras tareas sin reentrenamiento.
- Licencia no declarada: no se especifica licencia, por lo que el uso comercial queda en un limbo legal y no se recomienda en producción sin aclaración previa con el autor.
- Sin métricas publicadas: no hay evidencia cuantitativa de su calidad (recompensa, tasa de victoria, robustez), lo que impide evaluar si supera a un agente aleatorio o a los baselines oficiales.
- Riesgo de sobreajuste a oponentes concretos: al no documentarse el régimen de entrenamiento (self-play, oponentes fijos), el agente puede explotar estrategias frágiles frente a políticas distintas.
- Sesgos del simulador: el comportamiento refleja las reglas, la física y las recompensas de `SoccerTwos`, no del fútbol real; no debe interpretarse como un modelo de juego realista.
- Sin soporte de lenguaje: no procesa texto ni instrucciones; cualquier uso conversacional o de generación de contenido está fuera de su alcance.
- Repositorio sin mantenimiento aparente: cero descargas y cero likes en el momento de la consulta, sin documentación adicional más allá de la plantilla de ML-Agents.
- Fecha de creación futura en los metadatos (2026-11-17), lo que sugiere un posible error de sellado temporal o un repositorio de prueba; conviene verificar la integridad de los archivos antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rom1T/poca-SoccerTwos
- Documentación de Unity ML-Agents: https://unity-technologies.github.io/ml-agents/ML-Agents-Toolkit-Documentation/
- Repositorio de ML-Agents: https://github.com/Unity-Technologies/ml-agents
- Tutorial corto del curso de deep RL de Hugging Face: https://huggingface.co/learn/deep-rl-course/unitbonus1/introduction
- Tutorial largo de ML-Agents: https://huggingface.co/learn/deep-rl-course/unit5/introduction
- Visor de agentes ML-Agents en Hugging Face: https://huggingface.co/unity
