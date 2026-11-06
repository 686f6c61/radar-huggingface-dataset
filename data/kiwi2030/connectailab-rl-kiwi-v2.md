# kiwi2030/connectailab-rl-kiwi-v2

## Resumen

connectailab-rl-kiwi-v2 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B por el investigador kiwi del Connect AI Lab. No es un modelo de lenguaje de propósito general, sino un modelo de decisión especializado: recibe un estado de situación, una pregunta y una lista de opciones, y devuelve únicamente la letra de la opción seleccionada. Su dominio de aplicación es la simulación empresarial Connect Tycoon, donde el modelo actúa como agente que toma decisiones de gestión mes a mes.

El entrenamiento combina un pipeline de tres fases: primero se entrena una política pequeña con PPO en el simulador que actúa como "profesor"; después se genera un conjunto de datos puntuando cada opción mediante rollouts contrafactuales; finalmente se aplica aprendizaje supervisado seguido de un refinamiento con GRPO (Group Relative Policy Optimization) con normalización por grupo y penalización KL respecto al modelo de partida.

Su relevancia es doble: por un lado demuestra que un modelo de 0,8 mil millones de parámetros puede alcanzar un 83 % de acierto en una tarea de decisión estructurada tras un ajuste fino con RL; por otro, documenta de forma transparente el proceso completo (datos sintéticos, pipeline de recompensas, métricas de arrepentimiento) en un repositorio público. El modelo está pensado para investigación y educación, no para uso comercial en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, sobre el que se aplica un adaptador LoRA mediante la librería PEFT. El adaptador modifica el comportamiento del modelo base para que, dado un JSON con `state`, `question` y `options`, emita un único carácter correspondiente a la etiqueta de la opción elegida. La probabilidad asociada a cada letra se interpreta como la confianza del modelo en cada alternativa.

El entrenamiento se articula en cuatro etapas documentadas en la model card: (1) una política pequeña se entrena con PPO durante miles de meses simulados en Connect Tycoon y actúa como profesor; (2) para cada mes del profesor se generan variantes contrafactuales cambiando la opción elegida y se puntúa cada una con el simulador; (3) se aplica aprendizaje supervisado sobre las opciones con mayor puntuación; (4) se refina con GRPO, usando normalización de ventajas por grupo y una penalización KL contra el modelo de partida para evitar el colapso de la política. El conjunto de datos consta de 4.082 ejemplos de entrenamiento, 832 de validación y 840 de test, generados sobre una distribución de empresas de tipo `general` calibrada con datos públicos.

## Capacidades

- Decisión estructurada de opción múltiple: recibe un estado, una pregunta y una lista de opciones, y devuelve una sola letra.
- Calibración de confianza: la probabilidad de cada letra refleja la preferencia del modelo por cada opción.
- Razonamiento de política de decisión en entornos simulados de gestión empresarial (finanzas, satisfacción, incidentes).
- Robustez frente a instrucciones embebidas en el campo `state` (el prompt de sistema indica tratar el texto del estado como datos, no como instrucciones).
- Aprendizaje por refuerzo con recompensas derivadas de un simulador (no de preferencias humanas).
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio según la información disponible.
- Capacidad multilingüe limitada al coreano para la tarea entrenada.

## Casos de uso

- Investigación en RL aplicado a decisiones: el modelo sirve como caso de estudio reproducible de un pipeline PPO → supervisado → GRPO, con datos sintéticos y métricas de arrepentimiento, útil para comparar metodologías de ajuste fino.
- Simulación de agentes en entornos tipo gymnasium: puede integrarse como política de decisión dentro de Connect Tycoon u otros simuladores con interfaz similar (estado, pregunta, opciones) para evaluar estrategias de gestión.
- Evaluación de calibración de modelos pequeños: la salida por letra con probabilidad asociada permite medir confianza y comparar contra políticas de referencia.
- Docencia en cursos de refuerzo y decisión: el notebook de Colab y el repositorio permiten reproducir el entrenamiento paso a paso con un modelo de 0,8B que cabe en recursos modestos.
- Generación de datos de decisión etiquetados: el modelo puede utilizarse como anotador automático de opciones en tareas de gestión simulada, filtrando por umbral de confianza.
- Prototipado de asistentes de decisión de dominio cerrado: con un prompt de sistema adecuado, puede adaptarse a catálogos de opciones restringidos (por ejemplo, selección de acciones en un flujo de trabajo) siempre que el espacio de opciones sea pequeño y bien definido.

## Benchmarks y rendimiento

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual simulado | Reducción de pérdidas en tarjeta real |
|---|---|---|---|---|
| Qwen base (sin ajuste) | 33,7 % | 4,76 | no disponible | no disponible |
| Aprendizaje supervisado | 83,3 % | 3,21 | no disponible | no disponible |
| Aprendizaje por refuerzo (GRPO) | 83,0 % | 3,11 | 8,97 millones de wones | 66 % (135/177) |

Los resultados proceden de la model card del autor. El propio autor advierte que la evaluación de operación empresarial se basa en una media de dos meses no vistos, por lo que el tamaño de muestra es reducido, y que el modelo aún queda por debajo de la política profesora entrenada con PPO en el simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, en torno a 1,6 GB para el modelo base de 0,8B más el adaptador LoRA; en cuantización de 4 bits, por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente para inferencia; para entrenamiento del adaptador, una RTX 3090 o superior acelera el proceso.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en CPU para inferencia con llama.cpp si se fusiona el adaptador.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor), vLLM y TGI tras fusionar el adaptador con el modelo base, llama.cpp/Ollama para GGUF tras conversión.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de una salida de un solo token, la latencia vendrá dominada por el preprocesado del prompt y el tamaño del estado de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-kiwi-v2 | 0,8B (LoRA sobre Qwen3.5-0.8B) | no disponible | Decisión de opción múltiple en simulador | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Lenguaje general | Apache 2.0 (según modelo base) | Hugging Face |
| Política PPO del simulador (profesora) | no disponible (modelo pequeño) | no disponible | Decisión en Connect Tycoon | no disponible | No publicada como modelo independiente |

No se dispone de información sobre otros adaptadores RL de decisión comparables en la búsqueda realizada. La comparación más directa es contra el modelo base sin ajuste, que obtiene un 33,7 % de acierto frente al 83 % del adaptador.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de decisión de Connect Tycoon; fuera de ese dominio su comportamiento no está validado.
- El idioma de entrenamiento es el coreano; el rendimiento en castellano u otros idiomas no está documentado.
- Riesgo de alucinación en la etiqueta de salida: puede devolver una letra no presente en las opciones si el formato del prompt se desvía del esperado.
- El autor advierte explícitamente que es un modelo de investigación y educación, y que debe revalidarse con los registros reales de cada empresa antes de usarse en decisiones de gestión reales.
- La evaluación de operación empresarial se basa en una muestra pequeña (media de dos meses no vistos), por lo que las métricas de beneficio tienen alta varianza.
- El modelo queda por debajo de la política profesora entrenada con PPO en el simulador, según reconoce el autor.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B debe verificarse por separado.
- No se documentan sesgos específicos; al entrenarse sobre datos sintéticos de un simulador, puede heredar los sesgos de diseño de dicho simulador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiwi2030/connectailab-rl-kiwi-v2
- Repositorio Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
