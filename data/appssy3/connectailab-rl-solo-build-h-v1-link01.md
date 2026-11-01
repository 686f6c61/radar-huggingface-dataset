# appssy3/connectailab-rl-solo-build-h-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario appssy3 dentro del ecosistema CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un "modelo de toma de decisiones" para el robot simulado LINK-01: recibe una descripción en texto del estado actual del robot (distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que codifica cómo debe caminar durante los siguientes 0,5 segundos.

El modelo se ha construido en dos fases. Primero se entrenó una política PPO (el "cerebro", un archivo brain.json) en un simulador web de aprendizaje por refuerzo; después se generaron pares pregunta-respuesta traduciendo las observaciones del cerebro a texto, se aplicó aprendizaje supervisado (LoRA) sobre Qwen3.5-0.8B y finalmente una fase de RL con restricción KL para ajustar las preferencias entre opciones. El resultado es un adaptador de pequeño tamaño (repo de 0,1 GB) que imita la política del cerebro original con una tasa de coincidencia del 82,2 % en el conjunto de test.

Su relevancia es acotada y muy específica: sirve como ejemplo didáctico de cómo destilar una política de RL en un modelo de lenguaje mediante LoRA, y como componente de decisión dentro del entorno de simulación CONNECT TYCOON. No está pensado para robótica real ni para uso general, y el propio autor advierte que debe revalidarse en cada robot y espacio concreto antes de cualquier despliegue físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3.5-0.8B) |
| Parametros totales | No disponible (repo de 0,1 GB; el adaptador LoRA es una fracción del modelo base de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El entrenamiento sigue un pipeline de destilación de política: (1) se entrena un cerebro PPO en el simulador web para la tarea `goto_target` con la convención `link01-decision/goto_target/obs21-act5/walker51-14/v1` y un 100 % de éxito en el examen oficial; (2) se generan 544 ejemplos de entrenamiento, 103 de validación y 163 de test convirtiendo observaciones en texto, con un 20 % de ejemplos que incluyen desviaciones deliberadas del camino; (3) se aplica LoRA con aprendizaje supervisado para imitar las respuestas del cerebro; (4) se añade una fase de RL con anclaje KL que sube la probabilidad de opciones con mejor recompensa y baja la de las peores.

La innovación técnica principal no está en la arquitectura del transformer, sino en el método: usar un modelo de lenguaje como aproximación textual de una política de control, con un techo teórico de coincidencia del 99 % (la tasa a la que el cerebro responde lo mismo cuando su observación se traduce a texto). El prompt de sistema fuerza al modelo a tratar el texto del estado como datos y no como instrucciones, y a devolver solo la letra de la opción elegida.

## Capacidades

- Toma de decisiones discretas en un entorno de control simulado: elige una de cinco acciones de caminata cada 0,5 segundos.
- Comprensión de descripciones textuales de estado (distancia, dirección, sensores, velocidad, acción previa).
- Salida restringida a una sola letra, sin explicación, lo que facilita el parseo automático.
- Robustez parcial ante instrucciones embebidas en el estado gracias al prompt de sistema anti-inyección.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades de visión, audio ni generación de código.
- Capacidad multilingüe limitada al coreano en el entrenamiento; el prompt de sistema está en inglés.
- No dispone de modo "thinking" ni de cadena de razonamiento explícita.

## Casos de uso

- Docencia de destilación de políticas RL: permite mostrar en un cuaderno de Colab cómo se pasa de un cerebro PPO a un modelo de lenguaje con LoRA, usando el notebook oficial como material de clase.
- Componente de decisión en el simulador CONNECT TYCOON: se puede sustituir el cerebro por este adaptador para estudiar diferencias de comportamiento en la tarea `goto_target`.
- Investigación sobre grounding de acciones en texto: sirve para medir cuánto se pierde al traducir observaciones numéricas a lenguaje natural antes de decidir.
- Pruebas de robustez frente a inyección de prompt: el diseño con estado delimitado y prompt de sistema permite evaluar ataques que intentan alterar la acción elegida.
- Generación de datos sintéticos de decisión: el modelo puede producir etiquetas de acción sobre estados nuevos para ampliar un dataset de entrenamiento.
- Benchmark de imitación de políticas: comparar la tasa de coincidencia (82,2 %) con la del cerebro (100 %) en distintos conjuntos de test.
- Prototipado rápido en entornos educativos: al ser un adaptador de 0,1 GB sobre un modelo de 0,8B, se puede ejecutar en portátiles y GPUs de consumo para demostraciones en vivo.

## Benchmarks y rendimiento

| Modelo | Acierto en test (coincidencia con el cerebro) | Éxito en 20 episodios del mismo circuito | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0 % | 100 % | 0 % | 13,2 s |
| Modelo sin entrenar | 47,9 % | 0 % | 0 % | — |
| Aprendizaje supervisado (LoRA) | 82,2 % | 100 % | 0 % | 13,5 s |
| Aprendizaje por refuerzo (LoRA + RL) | 81,6 % | 100 % | 0 % | 13,5 s |

Los datos provienen de la model card del autor. La evaluación de caminata usa una aproximación 2D basada en una tabla de velocidades por comando, no el simulador MuJoCo completo, por lo que los resultados pueden diferir de una simulación física real.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa unos 0,1 GB; el modelo base Qwen3.5-0.8B en fp16 requiere aproximadamente 1,6 GB, y en cuantización de 4 bits alrededor de 0,5-0,7 GB (estimación, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para el modelo base en cuantización baja; para fp16 se recomienda 8 GB o más.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en CPU con llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Opciones de despliegue: transformers + PEFT (método oficial documentado), vLLM y TGI tras fusionar el adaptador con el modelo base, llama.cpp/Ollama mediante conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un modelo de 0,8B con salida de un solo token, la latencia esperada es baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-solo-build-h-v1-link01 | Adaptador LoRA sobre 0,8B | No disponible | Decisión de control por imitación de política PPO | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | LLM generalista | No disponible en la información | HuggingFace |
| Cerebro PPO original (brain.json) | No aplica (política tabular/red pequeña) | No aplica | Política de RL pura | No disponible | Repositorio CONNECT TYCOON |

No se dispone de comparativas con otros adaptadores de decisión robótica en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo ha sido evaluado en la tarea `goto_target` del simulador LINK-01; no hay evidencia de generalización a otras tareas, robots o entornos.
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo; los resultados reales pueden diferir.
- La tasa de coincidencia con el cerebro es del 82,2 %, lo que implica que en torno a un 18 % de las decisiones difieren de la política original.
- El autor advierte explícitamente que es un modelo de investigación y educación sobre simulador y que debe revalidarse en cada robot y espacio antes de usarlo en el mundo real.
- Riesgo de inyección de prompt: aunque el prompt de sistema indica tratar el estado como datos, un texto de estado malicioso podría intentar alterar la acción elegida.
- Idioma de entrenamiento limitado al coreano; el rendimiento en otros idiomas no está documentado.
- No apto para generación de texto libre, código, matemáticas ni tareas generales de lenguaje.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/appssy3/connectailab-rl-solo-build-h-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Canal de YouTube Solobuild: https://www.youtube.com/@solobuild.studio
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Aplicación Soundcover: https://soundcover.shop
