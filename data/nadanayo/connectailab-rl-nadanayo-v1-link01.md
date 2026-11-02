# NADANAYO/connectailab-rl-nadanayo-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por NADANAYO en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de lenguaje generalista, sino un modelo de decisión especializado: recibe una descripción textual del estado de un robot LINK-01 (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la acción de caminar durante los siguientes 0,5 segundos. El objetivo declarado es la evitación de obstáculos en un simulador 2D.

El entrenamiento combina dos fases. Primero se generó un conjunto de problemas a partir de las observaciones que un "cerebro" entrenado con PPO registraba cada 0,5 segundos mientras recorría un curso concreto; la respuesta correcta era la acción elegida por ese cerebro. Sobre ese corpus se aplicó aprendizaje supervisado con LoRA y, posteriormente, aprendizaje por refuerzo con PPO y anclaje KL para alinear las respuestas del modelo con recompensas simuladas. El resultado es un modelo muy pequeño (0,8B parámetros en el base) orientado a un dominio muy estrecho.

Su relevancia es fundamentalmente metodológica y educativa: demuestra un pipeline completo de destilación de políticas de RL en un LLM mediante LoRA y refinamiento con PPO, reproducible en Google Colab y con código abierto en GitHub. No está pensado como modelo de propósito general ni para producción en robótica real sin revalidación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parámetros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-0.8B, no declarada en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena para una tarea de clasificación restringida: dado un enunciado con el estado del robot, la pregunta y una lista de opciones, el modelo debe emitir exactamente una letra correspondiente a la opción elegida. El prompt de sistema instruye explícitamente a tratar el contenido del estado como datos y no como instrucciones, y a devolver solo la letra sin explicación.

El pipeline de entrenamiento consta de cuatro etapas documentadas. (1) Se entrena un "cerebro" con PPO en un entorno web de aprendizaje por refuerzo para la tarea `avoid_obstacles`, con el identificador de compromiso `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y el curso `95e70977`. (2) Se construye un corpus de problemas: cada 0,5 segundos se convierte la observación del cerebro en texto y se etiqueta con la acción tomada; se incluye un 20 % de ejemplos con acciones desviadas para aumentar la robustez. (3) Se aplica aprendizaje supervisado con LoRA para imitar al cerebro. (4) Se refina con PPO usando como recompensa el retorno que se habría obtenido si el cerebro hubiera continuado la ejecución tras la acción propuesta, con anclaje KL para evitar el colapso. El conjunto de datos resultante tiene 672 ejemplos de entrenamiento, 140 de validación y 198 de test. La tasa de coincidencia entre la representación textual y la decisión del cerebro se declara del 100 %, lo que fija el techo de acierto.

## Capacidades

- Toma de decisiones discretas en un espacio de acciones reducido (selección de una letra entre las opciones presentadas).
- Interpretación de descripciones textuales de estado de robot: distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y acción previa.
- Formato de salida estrictamente restringido: una única letra, sin texto adicional, lo que facilita el parseo automático.
- Robustez parcial ante instrucciones embebidas en el estado, gracias al prompt de sistema que indica tratar el estado como datos.
- Capacidad multilingüe limitada al coreano según la model card; el prompt de sistema está en inglés.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Investigación educativa en RL y destilación de políticas: el modelo sirve como ejemplo reproducible de cómo convertir una política PPO en un LLM pequeño mediante LoRA y refinamiento con PPO, con notebooks de Colab y código en GitHub.
- Simulación de agentes en entornos 2D: integración en el simulador web CONNECT AI WORLD como política de decisión para el robot LINK-01 en la tarea `avoid_obstacles`, sustituyendo al cerebro original en pruebas comparativas.
- Evaluación de pipelines de decisión textual: uso del modelo como banco de pruebas para medir la fidelidad entre una política numérica y su representación en lenguaje natural, con métricas de coincidencia y tasa de éxito en episodios.
- Docencia de aprendizaje por refuerzo: elaboración de ejercicios guiados donde el alumno entrena el cerebro, genera el corpus, ajusta el LoRA y compara resultados antes y después del refinamiento con PPO.
- Prototipado rápido de clasificadores de acciones: el adaptador puede reutilizarse como plantilla para otras tareas de decisión con espacio de acciones discreto, cambiando el corpus y el entorno de RL.
- Validación de robustez frente a inyección de instrucciones: el prompt de sistema permite experimentar con estados que contienen texto malicioso y medir la resistencia del modelo a desviarse de la tarea.
- No se recomienda su uso directo en robótica física sin reentrenamiento y validación en el robot y el espacio concretos, tal como advierte el propio autor.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a la tarea `avoid_obstacles` y a una aproximación 2D del caminado basada en una tabla de velocidades por comando (sin modelo de robot ni red de caminado real). La evaluación de caminado se realizó sobre 20 episodios con semillas 91001–91020.

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0 % | 95 % | 5 % | 14,6 s |
| Antes del entrenamiento | 35,4 % | 0 % | 10 % | — |
| Aprendizaje supervisado (LoRA) | 85,4 % | 100 % | 0 % | 14,6 s |
| Aprendizaje por refuerzo (PPO + KL) | 85,9 % | 100 % | 5 % | 14,6 s |

No se han publicado resultados en benchmarks estándar de LLM (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2 GB en fp16 para el modelo base de 0,8B más el adaptador LoRA; aproximadamente 1 GB en cuantización de 8 bits y menos de 1 GB en 4 bits, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen amplio. En entornos profesionales, A100 o H100 no aportan ventaja relevante por el tamaño reducido.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia puntual, dado el tamaño del modelo base.
- Opciones de despliegue: transformers con PEFT (procedimiento documentado en la model card), y previsiblemente vLLM o TGI tras fusionar el adaptador con el base; llama.cpp y Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles. El caso de uso implica una decisión cada 0,5 segundos, por lo que la latencia debe mantenerse por debajo de ese umbral, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B base + LoRA | no disponible | Decisión robótica por destilación de PPO | Apache 2.0 | HuggingFace, código en GitHub |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible en esta ficha | LLM generalista | según el modelo base | HuggingFace |
| Política PPO original ("cerebro") | no disponible | no aplica | Política RL en simulador | no disponible | Integrada en CONNECT AI WORLD |
| Otros adaptadores LoRA de decisión | variable | variable | Clasificación de acciones | variable | no disponible |

No se dispone de comparaciones con modelos de decisión robótica equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo resuelve la tarea `avoid_obstacles` con el conjunto de acciones y el formato de observación definidos por el proyecto; no generaliza a otras tareas sin reentrenamiento.
- El acierto en test se queda en el 85,9 %, por debajo del 100 % del cerebro profesor; el refinamiento con PPO apenas mejora al aprendizaje supervisado (85,4 % → 85,9 %) y añade un 5 % de colisiones en los episodios evaluados.
- La evaluación del caminado usa una aproximación 2D con tabla de velocidades, sin modelo físico del robot ni red de caminado; los resultados pueden diferir de los obtenidos en MuJoCo web.
- El modelo está declarado solo para coreano; el prompt de sistema está en inglés, lo que puede introducir inconsistencias en el rendimiento según el idioma del estado.
- Riesgo de alucinación en la forma de salida: aunque el prompt exige una única letra, el modelo puede generar texto adicional o letras fuera del conjunto de opciones; se recomienda validación y parseo estricto en producción.
- Riesgo de inyección de instrucciones a través del campo de estado; el prompt de sistema mitiga parcialmente el problema, pero no hay evaluación publicada de robustez frente a ataques adversariales.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero deben respetarse las condiciones del modelo base Qwen/Qwen3.5-0.8B.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NADANAYO/connectailab-rl-nadanayo-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web CONNECT AI WORLD: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
