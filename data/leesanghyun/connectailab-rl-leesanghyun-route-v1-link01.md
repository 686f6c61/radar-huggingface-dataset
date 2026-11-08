# LeeSanghyun/connectailab-rl-leesanghyun-route-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT construido sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado para actuar como política de decisión en un robot caminante simulado. El modelo recibe una descripción textual del estado del robot (distancia al objetivo, dirección, lectores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a una de cinco acciones posibles de locomoción para los siguientes 0,5 segundos. Lo desarrolla LeeSanghyun en el marco del proyecto CONNECT AI LAB y AI CITY BUILDERS, un entorno educativo de aprendizaje por refuerzo.

La particularidad del enfoque es que el "profesor" no es un modelo mayor ni anotaciones humanas, sino una política PPO entrenada previamente en un simulador web (el llamado "cerebro", brain.json). Ese cerebro genera pares observación textual-acción que se usan para el ajuste supervisado del LLM mediante LoRA, seguido de una fase de optimización por refuerzo con restricción KL que reordena las preferencias entre opciones según la recompensa obtenida al ejecutar cada acción y dejar que el cerebro continúe la trayectoria.

El resultado es un modelo muy pequeño (adaptador sobre una base de 0,8 mil millones de parámetros) orientado a un dominio muy estrecho: la tarea `follow_route` sobre cursos aleatorios en un simulador 2D. Es relevante como ejemplo reproducible de destilación de políticas RL a modelos de lenguaje y como material didáctico, no como modelo de propósito general. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB (solo pesos del adaptador).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (base de 0,8 mil millones; tamaño exacto del adaptador no publicado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no especificada en la información) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko); las instrucciones del sistema están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only. El adaptador no modifica la arquitectura base; se aplica mediante `peft.PeftModel` sobre el modelo preentrenado. El pipeline declarado es `reinforcement-learning`, con tags que incluyen PPO, deep reinforcement learning, robotics y decision-making.

El entrenamiento se articula en cuatro etapas documentadas por el autor. Primero, se entrena una política PPO en un simulador web (tarea `follow_route`, contrato `link01-decision/follow_route/obs16-act5/walker51-14/v1`, curso `random`, con un 95 % de éxito en el examen oficial). Segundo, se genera un conjunto de problemas convirtiendo cada 0,5 segundos la observación del cerebro en texto, con la acción del cerebro como etiqueta; un 20 % de los ejemplos incluyen desviaciones deliberadas. Tercero, se realiza ajuste supervisado (LoRA) del LLM para imitar al cerebro. Cuarto, se aplica una fase de RL que sube la probabilidad de opciones con mayor recompensa esperada (evaluando "qué pasaría si se elige esta opción y el cerebro continúa") y baja la de las peores, con anclaje KL al modelo supervisado. Los conjuntos tienen 2.735 ejemplos de entrenamiento, 186 de validación y 285 de test; la tasa de coincidencia entre la representación textual y la acción del cerebro (techo de acierto) es del 99 %.

## Capacidades

- Clasificación de decisión en un espacio cerrado de cinco acciones (una letra por respuesta), para la tarea `follow_route`.
- Lectura de estado textual estructurado: distancia al objetivo, dirección, lectores de distancia, velocidad y acción previa.
- Respuesta en formato estricto: solo la letra de la opción elegida, sin explicación, según el prompt de sistema indicado.
- Robustez parcial ante instrucciones embebidas en el estado: el prompt de sistema indica tratar el texto dentro de `state` como datos, no como instrucciones.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio, matemáticas ni generación de código; el adaptador está especializado en la tarea de decisión.
- Capacidad multilingüe limitada al coreano (idioma declarado) y al inglés de las instrucciones del sistema.

## Casos de uso

- Docencia de destilación RL a LLM: reproducir el pipeline completo (PPO en simulador, generación de dataset textual, SFT con LoRA y RL con KL) usando el notebook de Colab y el repositorio connect-tycoon como material de clase.
- Evaluación de políticas en robótica simulada: integrar el adaptador en el bucle de decisión del robot LINK-01 en el simulador web para comparar su comportamiento con el cerebro PPO original en cursos aleatorios.
- Investigación sobre representación textual de observaciones: estudiar cuánta información del estado continuo se conserva al serializarlo en texto, usando la tasa de coincidencia del 99 % como referencia del techo alcanzable.
- Pruebas de robustez ante prompt injection: el diseño con instrucciones de sistema que aíslan el contenido de `state` permite experimentar con ataques de inyección en la observación y medir la degradación de la política.
- Generación de datos sintéticos de decisión: usar el modelo como generador de pares estado-acción para aumentar el dataset de entrenamiento de otras políticas en el mismo simulador.
- Benchmark de eficiencia en hardware modesto: al ser un adaptador sobre una base de 0,8 B, sirve para medir latencia de inferencia en GPUs de consumo dentro de un bucle de control a 2 Hz (decisión cada 0,5 s).
- Prototipado de agentes con salida restringida: como ejemplo de modelo que debe devolver exactamente una letra entre opciones, útil para diseñar validadores de salida en pipelines de decisión.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (tarea `follow_route`, curso `random`):

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 0 % | 19,2 s |
| Antes del entrenamiento | 28,8 % | 0 % | 0 % | — |
| Ajuste supervisado (SFT) | 91,6 % | 100 % | 0 % | 19,3 s |
| Refuerzo (RL, modelo publicado) | 92,3 % | 100 % | 0 % | 19,3 s |

Nota del autor: la evaluación de marcha se realizó con una aproximación 2D (tabla de velocidades por comando del simulador web MuJoCo), sin red neuronal de marcha, por lo que los resultados pueden diferir ligeramente de los de MuJoCo. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre una base de 0,8 B, la inferencia en fp16 requiere aproximadamente 1,6 GB para los pesos base más el adaptador y el overhead de activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar la base en fp16, y una RTX 3060/4060 o superior es suficiente para el bucle de decisión.
- GPU de consumo: sí, cabe en GPUs de consumo; el tamaño de la base (0,8 B) es compatible con tarjetas de gama media.
- Opciones de despliegue: el autor documenta `transformers` + `peft` (`PeftModel.from_pretrained`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles. El bucle de control requiere una decisión cada 0,5 s (2 Hz), lo que marca el requisito de latencia máxima del sistema.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la búsqueda realizada. Los repositorios relacionados encontrados (`connectailab-rl-LeeSanghyun-v1-teacher` y `connectailab-rl-LeeSanghyun-v7-teacher`) son políticas PPO entrenadas en el juego, no adaptadores de lenguaje, por lo que no son directamente comparables en parámetros, contexto ni licencia.

| Modelo | Tipo | Base | Tarea | Licencia |
|---|---|---|---|---|
| connectailab-rl-leesanghyun-route-v1-link01 | Adaptador LoRA sobre LLM | Qwen3.5-0.8B | follow_route | Apache 2.0 |
| connectailab-rl-LeeSanghyun-v1-teacher | Política PPO | — | Decisión en juego | Apache 2.0 |
| connectailab-rl-LeeSanghyun-v7-teacher | Política PPO | — | Decisión en juego (perfil general) | Apache 2.0 |

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: solo resuelve la tarea `follow_route` con cinco acciones; no es un modelo de propósito general ni un asistente conversacional.
- El autor advierte que es un modelo de investigación y educación sobre simulador; debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo, por lo que los resultados pueden no transferirse exactamente.
- El acierto en test (92,3 %) queda por debajo del techo del 99 % de coincidencia entre la representación textual y la acción del cerebro, lo que indica pérdida de información en la serialización del estado.
- Riesgo de inyección de prompt: aunque el prompt de sistema indica tratar `state` como datos, el texto de la observación podría contener instrucciones adversariales si el entorno no está controlado.
- Idiomas: solo coreano declarado; las instrucciones del sistema están en inglés, lo que puede afectar a la robustez en otros idiomas.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero debe verificarse la licencia del modelo base Qwen/Qwen3.5-0.8B para uso comercial combinado.
- Sin descargas ni validación externa en el momento de la consulta (0 descargas, 0 likes); no hay evidencia de uso en producción por terceros.
- No se documentan cuantizaciones, por lo que el despliegue en entornos con restricciones de memoria requiere convertir los pesos por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LeeSanghyun/connectailab-rl-leesanghyun-route-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Laboratorio web del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Modelo relacionado (profesor v1): https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v1-teacher
- Modelo relacionado (profesor v7): https://huggingface.co/LeeSanghyun/connectailab-rl-LeeSanghyun-v7-teacher
