# appssy3/connectailab-rl-solo-build-h-v4-link01

## Resumen

connectailab-rl-solo-build-h-v4-link01 es un adaptador LoRA publicado por el usuario appssy3 (CONNECT AI LAB / AI CITY BUILDERS) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un modelo de decisión para el robot simulado LINK-01: recibe una descripción textual del estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a una de las cinco acciones discretas de locomoción disponibles para los siguientes 0,5 segundos.

El entrenamiento combina dos fases. Primero se generó un conjunto de datos etiquetado a partir de una política PPO entrenada en un entorno web de aprendizaje por refuerzo (el "cerebro" o brain.json), traduciendo observaciones del robot a texto. Después se aplicó aprendizaje supervisado (LoRA) y, por último, una fase de optimización por refuerzo con anclaje KL para ajustar las preferencias entre opciones. El resultado es un adaptador de muy bajo coste computacional que reproduce, en gran medida, el comportamiento de la política original.

La relevancia de esta ficha es acotada: se trata de un modelo de investigación y educación, con licencia Apache 2.0, orientado a un simulador concreto y con soporte declarado únicamente para coreano. No debe confundirse con un modelo conversacional ni con un sistema de robótica listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador LoRA añade un número no especificado de parámetros |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; no se documenta en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors del adaptador) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, mediante PEFT/LoRA. La tarea está formalizada como un problema de clasificación de cinco opciones (obs27-act5): la observación del robot se serializa a texto y el modelo debe emitir exactamente una letra entre las opciones listadas. El prompt de sistema exige tratar el contenido del estado como datos y no como instrucciones, y devolver solo la letra, sin explicación.

El pipeline de entrenamiento consta de cuatro etapas documentadas por el autor: (1) entrenamiento de una política PPO en un entorno web de refuerzo (tarea `follow_route`, contrato `link01-decision/follow_route/obs27-act5/walker51-14/v1`, curso `42a5d696`, 90 % en la prueba oficial); (2) generación de un corpus de preguntas y respuestas a partir de las observaciones del "cerebro" cada 0,5 segundos, con un 20 % de ejemplos en los que la política se desvía deliberadamente; (3) aprendizaje supervisado del modelo de lenguaje sobre esas etiquetas (LoRA); y (4) una fase de refuerzo que reordena las preferencias entre opciones según la recompensa obtenida al dejar que la política original continúe la trayectoria, con anclaje KL al modelo supervisado. El conjunto de datos resultante tiene 884 ejemplos de entrenamiento, 193 de validación y 288 de test, con un techo de acierto (coincidencia con la política original al traducir a texto) del 99 %.

## Capacidades

- Clasificación de decisiones discretas: dado un estado textual del robot LINK-01, selecciona una de cinco acciones posibles.
- Razonamiento de un solo paso sobre observaciones estructuradas (distancia, dirección, sensores, velocidad, acción previa).
- Seguimiento de instrucciones de formato estricto: devuelve únicamente una letra, sin texto adicional.
- Resistencia a inyección de instrucciones en el campo de estado, según el prompt de sistema prescrito.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidades multilingües limitadas al coreano declarado; el prompt de sistema está en inglés pero el contenido de las preguntas se genera en coreano.
- No dispone de modo de pensamiento extendido, visión, audio ni otras modalidades.

## Casos de uso

- Evaluación de políticas de refuerzo destiladas: el adaptador permite comprobar si un modelo de lenguaje de 0,8 B puede aproximar una política PPO entrenada en un simulador, comparando la tasa de coincidencia con la política original (75,0 % en test).
- Docencia de RL y destilación: sirve como ejemplo completo de pipeline (PPO → generación de dataset → SFT → RL con KL) reproducible desde un notebook de Colab, adecuado para cursos introductorios.
- Investigación en sustitución de políticas por modelos de lenguaje: útil para estudiar hasta qué punto una política neuronal puede reemplazarse por un modelo de lenguaje con prompting estructurado en tareas de decisión de baja dimensionalidad.
- Prototipado rápido de agentes simulados: al ser un adaptador LoRA sobre un modelo de 0,8 B, se puede desplegar en una GPU de consumo para experimentar con decisiones de navegación en el simulador LINK-01 sin infraestructura dedicada.
- Análisis de robustez ante ruido en la observación: el 20 % de ejemplos con desviaciones permite estudiar la degradación del rendimiento cuando la política se aparta de la trayectoria óptima.
- Generación de datos sintéticos de decisión: el modelo puede emplearse para etiquetar observaciones adicionales del simulador y ampliar el corpus de entrenamiento de otras políticas.

## Benchmarks y rendimiento

Los únicos datos disponibles son los publicados por el autor en la model card, medidos sobre el conjunto de test (288 preguntas) y sobre 20 episodios de caminata con semillas 91001–91020.

| Modelo | Acierto en test (coincidencia con la política) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política PPO (profesor) | 100,0 % | 100 % | 0 % | 19,5 s |
| Modelo base sin entrenar | 28,1 % | 0 % | 0 % | — |
| Tras aprendizaje supervisado | 74,3 % | 90 % | 0 % | 20,1 s |
| Tras refuerzo (modelo publicado) | 75,0 % | 95 % | 0 % | 20,1 s |

El autor advierte que la evaluación de caminata se realizó con una aproximación 2D basada en una tabla de velocidades por comando, no con el modelo robótico ni con la red de locomoción real, por lo que los resultados pueden diferir de los obtenidos en MuJoCo web.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 B en fp16 requiere aproximadamente 1,6 GB de pesos; en cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, alrededor de 0,4 GB. El adaptador LoRA añade una cantidad marginal no documentada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para fp16; una RTX 3060, RTX 4060 o superior permite ejecución cómoda. Para despliegue por lotes, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660 6 GB, RTX 3050 8 GB, RTX 4090, etc.).
- Opciones de despliegue: transformers + PEFT (método documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama previa conversión a GGUF (no documentada por el autor).
- Latencia y throughput: no disponibles. Dado el tamaño del modelo, se espera una latencia de decodificación de un solo token en el orden de milisegundos en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (adaptadores LoRA de decisión robótica sobre modelos de lenguaje de menos de 1 B). La comparación más próxima es con el propio modelo base y con la política PPO de origen.

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-solo-build-h-v4-link01 | 0,8 B + LoRA | no disponible | 75,0 % test / 95 % éxito en 20 episodios | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base sin adaptador) | 0,8 B | no disponible | 28,1 % test / 0 % éxito | según modelo base | HuggingFace |
| Política PPO original (brain.json) | no aplica (tabla de política) | no aplica | 100 % test / 100 % éxito | no especificada | repositorio connect-tycoon |

## Limitaciones y advertencias

- Modelo de investigación y educación: el propio autor indica que es un modelo sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Ámbito de aplicación muy restringido: solo resuelve la tarea `follow_route` con el contrato obs27-act5 del simulador LINK-01; no generaliza a otras tareas de decisión ni a otros robots.
- Idioma: soporte declarado únicamente para coreano; el rendimiento fuera de ese idioma no está documentado.
- Riesgo de alucinación: aunque la salida está restringida a una letra, el modelo puede emitir opciones no válidas o texto adicional si el prompt no se aplica exactamente como se especifica.
- Dependencia del prompt de sistema: el comportamiento seguro frente a inyección de instrucciones depende de usar el system prompt prescrito; sin él, el contenido del campo de estado podría interpretarse como instrucciones.
- Evaluación de caminata aproximada: los resultados de éxito (95 %) se obtuvieron con una tabla de velocidades 2D, no con el simulador MuJoCo completo, por lo que pueden no reproducirse en el entorno real.
- Licencia Apache 2.0: permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Sin datos de sesgos, robustez fuera de distribución ni comportamiento en contextos largos.
- Repositorio sin descargas ni interacciones en el momento de la consulta, lo que limita la validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/appssy3/connectailab-rl-solo-build-h-v4-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Entorno de aprendizaje web del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
