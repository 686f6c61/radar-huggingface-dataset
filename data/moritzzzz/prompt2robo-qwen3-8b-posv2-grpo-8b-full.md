# moritzzzz/Prompt2Robo-Qwen3-8B-posv2-grpo-8b-full

## Resumen

Prompt2Robo-Qwen3-8B-posv2-grpo-8b-full es un ajuste fino completo del modelo Qwen3-8B de Alibaba, publicado por el usuario moritzzzz, orientado a la generación de programas de control para brazos robóticos simulados. El modelo recibe una instrucción en lenguaje natural y produce un programa Python con una función `run(robot)` que opera un brazo LARA 5 dentro de un simulador MuJoCo, o bien una negativa breve cuando la petición no es viable, o una respuesta de una frase a preguntas sobre la escena.

El entrenamiento se realizó en dos fases: primero un ajuste fino supervisado completo sobre el subconjunto `data_posv2` del dataset Prompt2Robo, y después un entrenamiento con GRPO (Group Relative Policy Optimization) en el que la recompensa proviene directamente del simulador MuJoCo combinado con el verificador del dataset. Esta segunda fase convierte el simulador en el juez del aprendizaje, lo que es relevante porque alinea la salida del modelo con la ejecución física correcta y no solo con la similitud textual respecto a las referencias.

Con 8.190.735.360 parámetros y pesos en bf16, el modelo se posiciona como una alternativa de tamaño medio que puede desplegarse en una GPU de gama alta de consumo con cuantización. Su interés actual reside en la combinación de un LLM generalista con un bucle de refuerzo verificado por simulador, un patrón cada vez más habitual para tareas de agente y robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino completo |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no se publican pesos cuantizados; el repo contiene pesos bf16 en formato Hugging Face |
| Idiomas soportados | no disponible (el autor no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face, bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso con atención completa y plantilla de chat propia que incluye modos de razonamiento (thinking) y no thinking. El autor indica explícitamente que debe usarse la plantilla de chat no thinking junto con el system prompt del directorio del dataset. Sobre esa base se aplicó un ajuste fino completo (no LoRA) sobre el subconjunto `data_posv2` del dataset Prompt2Robo, que contiene pares de instrucción en lenguaje natural y programas de control para el brazo LARA 5.

La segunda fase emplea GRPO con la recompensa calculada por el simulador MuJoCo más el verificador del dataset. El checkpoint publicado corresponde al mejor paso del entrenamiento GRPO (paso 100). Esta señal de recompensa basada en ejecución es la innovación técnica principal: el modelo no aprende a imitar texto, sino a producir programas que el simulador valida como correctos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas adicionales de alineamiento.

## Capacidades

- Generación de código Python para control robótico: produce funciones `run(robot)` ejecutables sobre un brazo LARA 5 en MuJoCo.
- Razonamiento sobre la escena: responde en una frase a preguntas sobre el estado o los objetos del entorno simulado.
- Abstención controlada: genera una negativa breve cuando la instrucción no puede resolverse con la API del robot.
- Comprensión de instrucciones en lenguaje natural orientadas a manipulación y movimiento.
- Formato de salida estructurado y verificable mediante checker automático.
- No se documentan capacidades de tool calling genérico, agentes multi-paso fuera del dominio robótico, visión, audio ni multilingüismo explícito.

## Casos de uso

- Generación automática de políticas de manipulación en simulación: dado un prompt como "mueve el bloque rojo a la bandeja", el modelo emite el programa que el simulador ejecuta y valida, lo que permite prototipar tareas sin escribir controladores a mano.
- Evaluación de pipelines de robótica: el modelo sirve como generador de referencia para comparar contra otros LLM en tareas de code-as-policy dentro de MuJoCo, usando el checker como métrica objetiva.
- Aprendizaje por refuerzo verificado: el checkpoint es un punto de partida para experimentos de GRPO con recompensas de simulador, replicando el bucle recompensa-ejecución en otros robots o entornos.
- Filtrado y aumento de datos: el modelo puede generar programas candidatos para instrucciones nuevas que luego se validan en simulación y se incorporan al dataset de entrenamiento.
- Asistente para investigadores de robótica: traduce especificaciones en lenguaje natural a código de control legible, útil para iterar rápidamente sobre escenarios de pick-and-place.
- Detección de instrucciones inviables: gracias a su capacidad de negativa breve, puede usarse como clasificador de peticiones no ejecutables antes de invocar el simulador, ahorrando cómputo.

## Benchmarks y rendimiento

El autor publica exactitud en conjuntos held-out con el checker estricto, sin haber entrenado sobre ellos:

| Conjunto de evaluacion | Aciertos / Total | Precision |
|---|---|---|
| eval | 80/102 | 78,4 % |
| eval_v2 | 52/61 | 85,2 % |
| eval_v3 | 72/92 | 78,3 % |
| eval_v4 | 9/12 | 75,0 % |
| eval_v5 | 30/39 | 76,9 % |
| eval_posv1 | 46/61 | 75,4 % |
| eval_posv2 | 37/50 | 74,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 16,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto moderado.
- En cuantización de 8 bits cabría en GPUs de 16 GB; en 4 bits, en GPUs de 12 GB, aunque el autor no publica versiones cuantizadas y habría que generarlas con herramientas externas.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para bf16 en contexto corto; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo con cuantización; en bf16 requiere una GPU de 24 GB o superior.
- Opciones de despliegue: transformers, Text Generation Inference (el repo está marcado como compatible con endpoints), vLLM, llama.cpp u Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt2Robo-Qwen3-8B-posv2-grpo | 8,19 B | no disponible | Generacion de codigo robotico con GRPO verificado por simulador | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible | LLM generalista con modo thinking | Apache 2.0 | Hugging Face |
| Alternativas de code-as-policy para robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con otros modelos de robótica no está disponible en la información proporcionada; el único punto de referencia objetivo es el propio Qwen3-8B base, del que este modelo hereda arquitectura y tokenizador pero del que no se ofrecen métricas comparativas en la model card.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está especializado en el brazo LARA 5 y en la API del simulador MuJoCo del dataset; fuera de ese entorno su utilidad es limitada.
- Riesgo de alucinación en forma de programas sintácticamente válidos pero semánticamente incorrectos o no ejecutables; de ahí la necesidad del checker en producción.
- Requiere usar el system prompt del dataset y la plantilla de chat no thinking de Qwen3; usarlo con otra plantilla puede degradar la calidad de forma significativa.
- No se declaran idiomas soportados; el entrenamiento parece centrado en inglés y no hay garantías de comportamiento correcto en castellano.
- Exactitud held-out entre el 74 % y el 85 % según el conjunto, insuficiente para control real sin verificación previa en simulación.
- Sesgos: no documentados por el autor; al derivar de Qwen3-8B puede heredar sesgos del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B y los datos del dataset deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moritzzzz/Prompt2Robo-Qwen3-8B-posv2-grpo-8b-full
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset: https://huggingface.co/datasets/Carlo0001/Prompt2Robo
