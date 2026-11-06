# key1739/connectailab-rl-connectailab-rl-coco-brain-v1

## Resumen

Connect AI Lab Coco Brain v1 es un adaptador LoRA entrenado mediante aprendizaje por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por key1739 en el marco del proyecto CONNECT TYCOON / CONNECT AI LAB. No es un modelo de propósito general: es un modelo de toma de decisiones de empresa que recibe un estado, una pregunta y una lista de opciones etiquetadas, y devuelve únicamente la letra de la opción seleccionada. La probabilidad asignada a cada letra funciona como distribución de confianza sobre las alternativas.

El problema que aborda es la selección de acciones discretas en un simulador de gestión empresarial. El flujo de entrenamiento combina un profesor entrenado con PPO en el simulador, la generación de un conjunto de problemas por contrafactuales (se reejecuta el mes cambiando la opción elegida para puntuar cada alternativa), un ajuste supervisado sobre las opciones de mayor puntuación y una fase final de RL con GRPO que normaliza ventajas por grupo de opciones y aplica una penalización KL contra el modelo de partida.

Es relevante ahora como ejemplo reproducible de cómo adaptar un modelo pequeño (0,8B) a una tarea de decisión estructurada con datos generados por simulación, con licencia Apache 2.0 y un cuaderno de Colab público. El alcance es acotado: dominio de simulación, idioma coreano y uso educativo o de investigación, no producción empresarial real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número de parámetros no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos del adaptador en safetensors) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere el modelo base Qwen/Qwen3.5-0.8B) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre un transformer decoder-only Qwen3.5 de 0,8B de parámetros. La tarea se formula como clasificación generativa restringida: la entrada es un JSON con `state`, `question` y `options` (cada una con `label`, `key` y `description`), y la salida es una sola letra. El prompt de sistema instruye a tratar el contenido de `state` como datos y no como instrucciones, y a devolver solo la letra sin explicación.

El entrenamiento tuvo cuatro fases. Primero, una política pequeña se entrena con PPO en el simulador CONNECT TYCOON durante miles de meses simulados; esa política actúa como profesor. Segundo, para cada mes se generan problemas contrafactuales: se sustituye la opción elegida por cada alternativa y se reejecuta el mes hasta el final para puntuar cada elección. Tercero, se aplica ajuste supervisado sobre la opción con mayor puntuación. Cuarto, se aplica GRPO: se evalúa el conjunto completo de opciones como grupo, se normalizan las ventajas dentro del grupo y se incrementa la probabilidad de las opciones cuyo retorno en el simulador supera la media del grupo, con una penalización KL respecto al modelo de partida. El conjunto de datos cubre la distribución `general` (empresa genérica calibrada con datos públicos) con 4.082 problemas de entrenamiento, 832 de validación y 840 de test.

## Capacidades

- Selección de una opción entre varias en tareas de decisión estructurada, devolviendo una única letra.
- Producción de una distribución de probabilidad sobre las opciones, utilizable como medida de confianza (la letra con mayor probabilidad es la más probable).
- Toma de decisiones de gestión de empresa dentro del simulador CONNECT TYCOON: dinero, satisfacción y accidentes como resultado del mes.
- Robustez frente a inyección de instrucciones en el campo `state`, por el prompt de sistema y por el formato de entrenamiento.
- Salida estrictamente restringida (una letra), lo que simplifica el parseo en pipelines automatizados.
- Capacidades multilingües: solo coreano declarado; no se documenta soporte de castellano ni de otros idiomas.
- No se documentan tool calling, function calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Evaluación de políticas de decisión en simulación: usar el modelo como política de referencia en CONNECT TYCOON para comparar contra la política PPO del profesor y contra el ajuste supervisado, con métricas de acierto y regret.
- Investigación en RL con modelos pequeños: reproducir el pipeline profesor PPO, contrafactuales, SFT y GRPO en un Colab público para estudiar estabilidad y sensibilidad al tamaño del grupo de opciones.
- Docencia de aprendizaje por refuerzo: ilustrar cómo se construye un conjunto de problemas puntuados por contrafactuales y cómo GRPO con normalización por grupo y KL modifica la distribución de salida.
- Clasificación de acciones discretas en dominios con etiquetas fijas: adaptar el formato JSON de entrada a otros entornos con opciones enumeradas y usar la letra de salida como acción.
- Análisis de calibración de confianza: comparar la probabilidad de la letra elegida con la tasa de acierto real para detectar sobreconfianza en opciones con descripciones ambiguas.
- Prototipado de agentes de decisión de bajo coste: al ser un adaptador sobre 0,8B, permite iterar en una sola GPU de consumo durante el desarrollo antes de escalar a modelos mayores.
- Generación de datos sintéticos de decisión: usar las trayectorias del simulador para producir pares estado-opción-etiqueta destinados a entrenar otros modelos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test del simulador (840 problemas) y sobre un experimento de operación de dos meses no vistos:

| Modelo | Acierto en test | Regret (menor es mejor) | Beneficio mensual en simulador | Reducción de pérdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 30,4% | 2,67 | no disponible | no disponible |
| Ajuste supervisado (SFT) | 77,6% | 1,90 | no disponible | no disponible |
| RL (GRPO, este adaptador) | 76,4% | 1,92 | 11,02 millones de wones | 71% (145/177) |

El autor advierte que la evaluación de operación de empresa corresponde a la media de dos meses no vistos, con muestra pequeña, y que el modelo sigue por debajo de la política profesora entrenada con PPO en el simulador. No se publican resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B en precisión completa ocupa aproximadamente 1,6 GB de pesos; en fp16, unos 1,6 GB, y en cuantización de 8 bits, alrededor de 0,8 GB. El adaptador LoRA añade una sobrecarga pequeña no cuantificada en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el modelo base en fp16 con margen para el contexto; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento o evaluación por lotes, se recomienda una RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo recientes con 4 GB o más de VRAM.
- Opciones de despliegue: transformers con PEFT (flujo documentado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información proporcionada. Para usar llama.cpp u Ollama sería necesario fusionar el adaptador con el modelo base y convertir los pesos a GGUF.
- Latencia y throughput: no disponibles. Al tratarse de una salida de un solo token, la latencia de decodificación está dominada por el prefill del contexto de entrada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión entrenados con RL sobre simuladores de empresa en la información proporcionada. La comparación más directa disponible es interna al propio proyecto:

| Modelo | Parámetros | Contexto | Acierto en test | Regret | Licencia |
|---|---|---|---|---|---|
| Este adaptador (GRPO) | 0,8B + LoRA | no disponible | 76,4% | 1,92 | Apache 2.0 |
| SFT sobre el mismo base | 0,8B + LoRA | no disponible | 77,6% | 1,90 | Apache 2.0 |
| Qwen3.5-0.8B sin entrenar | 0,8B | no disponible | 30,4% | 2,67 | Apache 2.0 |

## Limitaciones y advertencias

- Dominio muy restringido: solo responde a tareas de decisión con opciones enumeradas en el formato JSON documentado; fuera de ese formato no hay garantía de comportamiento.
- Idioma: solo coreano declarado. El prompt de sistema está en inglés, pero no se documenta evaluación en castellano ni en otros idiomas.
- Sesgos: los datos proceden de un simulador con una distribución de empresa `general` calibrada con datos públicos; los sesgos del simulador y de esa calibración se transfieren al modelo.
- Alucinación: la salida está restringida a una letra, pero el modelo puede elegir una opción inexistente o mal formada si la entrada no respeta el esquema; es necesario validar la letra contra la lista de opciones.
- Rendimiento inferior al profesor: el autor indica explícitamente que el modelo está por debajo de la política PPO del simulador y que la evaluación de operación se basa en dos meses, con muestra pequeña.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el autor recomienda revalidar con los registros reales de la empresa antes de cualquier uso en decisiones de gestión reales; es un modelo de investigación y educación.
- Producción: no se documentan cuantizaciones, latencias, throughput ni integración con servidores de inferencia de alto rendimiento, por lo que el despliegue en producción requeriría trabajo adicional de fusión, conversión y evaluación.
- Dependencia del modelo base: requiere descargar Qwen/Qwen3.5-0.8B además del adaptador; el repositorio del adaptador ocupa 0,0 GB según los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/key1739/connectailab-rl-connectailab-rl-coco-brain-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
