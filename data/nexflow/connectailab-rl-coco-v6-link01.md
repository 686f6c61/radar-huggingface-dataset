# nexflow/connectailab-rl-coco-v6-link01

## Resumen

connectailab-rl-coco-v6-link01 es un adaptador LoRA (PEFT) publicado por el usuario nexflow sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" para el robot simulado LINK-01 dentro del proyecto educativo CONNECT AI WORLD / CONNECT TYCOON. El modelo lee en texto el estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y decisión anterior) y responde con una única letra que indica cómo debe caminar durante los siguientes 0,5 segundos.

El entrenamiento combina dos fases: primero un ajuste supervisado (LoRA) sobre pares observación-decisión generados por un "profesor" entrenado con PPO en un simulador web, y después una fase de aprendizaje por refuerzo que reordena las preferencias entre opciones según la recompensa obtenida al dejar que el profesor continúe la ruta. El resultado se evalúa sentando al modelo en el puesto de decisión del robot y midiendo el éxito en una caminata aproximada en 2D.

Es relevante como ejemplo de destilación de políticas de RL en modelos de lenguaje pequeños (0,8B) para tareas de decisión discreta con formato estrictamente controlado, y como material docente reproducible (notebook de Colab, código de entrenamiento en GitHub). Se trata de un modelo de investigación y educación, no de un componente listo para producción robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA no declara su número de parámetros; el base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen/Qwen3.5-0.8B, no declarada en la model card) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantización no especificada) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3.5-0.8B, un transformer decoder-only de pequeño tamaño. La tarea se formula como clasificación generativa restringida: la entrada es un problema en texto con situación, pregunta y opciones (observación de 16 dimensiones, 5 acciones), y la salida debe ser exactamente la letra de una de las opciones, sin explicación. El system prompt indica explícitamente que el texto dentro del estado es dato, no instrucción.

El pipeline de entrenamiento tiene cinco etapas descritas por el autor: (1) entrenamiento de un "cerebro" con PPO en un simulador web para la tarea `follow_route`; (2) generación de un dataset de 878 ejemplos de entrenamiento, 190 de validación y 284 de test, muestreando cada 0,5 segundos las observaciones del cerebro convertidas a texto, con la respuesta del cerebro como etiqueta y un 20% de ejemplos con desviaciones deliberadas; (3) ajuste supervisado LoRA del modelo de lenguaje sobre esas etiquetas; (4) una fase de RL que sube la probabilidad de opciones con recompensa estimada mayor que la del profesor y baja las peores, con anclaje KL; (5) evaluación colocando el modelo en el puesto de decisión del robot y midiendo 20 episodios con semillas 91001–91020. La caminata se evalúa con una aproximación 2D basada en una tabla de velocidades por comando, no con el simulador MuJoCo real.

## Capacidades

- Decisión discreta de siguiente acción de caminata para el robot LINK-01 en la tarea `follow_route`, devolviendo una única letra entre cinco opciones.
- Lectura de estado estructurado en texto (distancia al objetivo, dirección, sensores de distancia, velocidad, decisión previa).
- Formato de salida estrictamente restringido: solo la letra, sin explicación, con instrucción de tratar el estado como dato y no como instrucción.
- Generación de texto y razonamiento generales: no evaluados ni documentados en la model card; el adaptador está especializado en la tarea de decisión.
- Tool calling / function calling: no disponible / no documentado.
- Soporte de agentes y multi-step reasoning: no documentado; el bucle de decisión multi-paso lo aporta el entorno, no el modelo.
- Capacidades multilingües: solo coreano declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Docencia de aprendizaje por refuerzo: reproducir el pipeline completo (PPO en simulador, generación de dataset, SFT con LoRA, RL con anclaje KL) usando el notebook de Colab y el repositorio CONNECT TYCOON como material de clase.
- Investigación en destilación de políticas: comparar la política PPO original con la política destilada en un LLM de 0,8B para estudiar cuánto se pierde al pasar de red neuronal a modelo de lenguaje (100% frente a 83,1% de coincidencia con el profesor en test).
- Estudio de robustez a instrucciones: analizar cómo responde el modelo cuando el estado contiene texto que podría interpretarse como instrucción, dado el system prompt defensivo del autor.
- Prototipado de agentes de decisión con salida restringida: usar el patrón "estado en texto, opción en letra" para tareas de control discreto en entornos simulados antes de invertir en modelos mayores.
- Evaluación de métodos de RL sobre modelos pequeños: medir la ganancia de la fase RL frente al SFT puro (82,4% a 83,1% en test) y su efecto en la tasa de éxito de la caminata.
- Generación de datos sintéticos de decisión: reutilizar el formato de problema (situación, pregunta, opciones) para crear datasets de decisiones etiquetadas a partir de un profesor simulado.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (tarea `follow_route`, test de 284 problemas y 20 episodios de caminata con semillas 91001–91020):

| Modelo | Acierto en test (misma respuesta que el profesor) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Profesor (PPO) | 100,0% | 100% | 0% | 19,4 s |
| Antes de entrenar | 29,2% | 0% | 0% | — |
| SFT (LoRA) | 82,4% | 100% | 0% | 19,6 s |
| RL (este adaptador) | 83,1% | 100% | 0% | 19,7 s |

Nota del autor: la evaluación de caminata usa una aproximación 2D basada en una tabla de velocidades por comando, no el simulador MuJoCo web, por lo que los resultados pueden diferir de la simulación completa. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser un adaptador sobre un modelo de 0,8B, la inferencia en fp16 requiere del orden de 2 GB y en cuantización de 4 bits alrededor de 1 GB, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con 4 GB o más debería ser suficiente para el base en fp16, y GPUs de datacenter (A100, H100) no son necesarias.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: transformers + peft (única vía documentada en la model card); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA de decisión robótica sobre LLM pequeños). La comparación más directa es con el propio profesor PPO y con las fases de entrenamiento del mismo proyecto:

| Modelo | Base | Tarea | Acierto en test | Licencia |
|---|---|---|---|---|
| connectailab-rl-coco-v6-link01 (RL) | Qwen3.5-0.8B + LoRA | follow_route | 83,1% | Apache 2.0 |
| Versión SFT del mismo proyecto | Qwen3.5-0.8B + LoRA | follow_route | 82,4% | Apache 2.0 |
| Profesor PPO (brain.json) | Red neuronal propia | follow_route | 100,0% | No disponible |

## Limitaciones y advertencias

- Especialización extrema: solo resuelve la tarea `follow_route` con el formato de observación de 16 dimensiones y 5 acciones; fuera de ese contrato no hay garantía de comportamiento útil.
- Idioma: solo coreano declarado; el system prompt y el formato de problema están en inglés, pero el soporte multilingüe no está documentado.
- Evaluación aproximada: la caminata se mide con una tabla de velocidades 2D, no con el simulador MuJoCo real, por lo que el 100% de éxito en 20 episodios no equivale a robustez en simulación física completa.
- Brecha con el profesor: el adaptador coincide con el profesor en el 83,1% de los problemas de test; el 16,9% restante son decisiones distintas cuya consecuencia en la caminata no se detalla por episodio.
- Riesgo de inyección de instrucciones: el propio autor añade una instrucción de sistema para tratar el estado como dato, lo que indica que el modelo puede ser sensible a texto malicioso dentro de la observación.
- Uso previsto: modelo de investigación y educación en simulador; el autor advierte explícitamente de que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Licencia Apache 2.0: permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones que deben verificarse por separado.
- Sin datos de benchmarks estándar de lenguaje ni de despliegue en producción (latencia, throughput, cuantización).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nexflow/connectailab-rl-coco-v6-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
