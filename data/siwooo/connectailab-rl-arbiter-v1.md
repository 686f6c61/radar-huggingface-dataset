# Siwooo/connectailab-rl-arbiter-v1

## Resumen

connectailab-rl-arbiter-v1 es un adaptador LoRA publicado por el usuario Siwooo sobre el modelo base Qwen/Qwen3.5-0.8B, orientado a la toma de decisiones dentro del simulador de gestión empresarial CONNECT TYCOON. El modelo no es un asistente conversacional general: recibe una situación, una pregunta y un conjunto de opciones etiquetadas (A, B, C...) y devuelve únicamente la letra de la opción seleccionada. La probabilidad asignada a cada letra funciona como distribución de confianza sobre las alternativas.

El desarrollo combina un pipeline de reinforcement learning en dos fases: primero se entrena una política pequeña con PPO dentro del simulador, que actúa como "profesor" generando datos; después se aplica supervisión sobre las mejores opciones y un ajuste con GRPO (Group Relative Policy Optimization) usando la puntuación del simulador como recompensa, con estandarización por grupo y penalización KL respecto al modelo de partida. El adaptador se distribuye en formato PEFT (safetensors) y requiere cargar el modelo base por separado.

Es un proyecto de investigación y divulgación educativa (CONNECT AI LAB × AI CITY BUILDERS) con licencia Apache 2.0, idioma coreano y un volumen de descargas muy bajo (18), lo que refleja su carácter experimental. Su relevancia es acotada: demuestra un flujo completo de RL aplicado a decisiones discretas sobre un modelo de 0,8B de parámetros, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3.5-0.8B); pipeline de reinforcement learning |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade parámetros no especificados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; el modelo base admitiría las cuantizaciones habituales de Qwen3.5, no confirmadas en la información) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT / safetensors (adaptador LoRA); requiere el modelo base Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. La innovación no está en la arquitectura del modelo base sino en el procedimiento de entrenamiento en cuatro etapas descrito en la model card: (1) un agente pequeño se entrena con PPO durante miles de meses simulados y actúa como política profesora; (2) se construye un "cuaderno de problemas" reejecutando cada mes del simulador con cada opción alternativa para puntuar cada elección; (3) se realiza ajuste supervisado sobre la opción de mayor puntuación; (4) se aplica GRPO viendo el conjunto completo de opciones como un grupo, elevando la probabilidad de las opciones con puntuación superior a la media del grupo, con estandarización por grupo y término KL contra el modelo de partida.

El conjunto de datos se generó íntegramente en el simulador CONNECT TYCOON bajo una distribución de empresas de tipo `general` ajustada con datos públicos. El reparto de problemas es de 4.082 ejemplos de entrenamiento, 832 de validación y 840 de test. No se especifican el número de tokens de entrenamiento, la composición detallada del corpus ni si hubo datos externos al simulador. El prompt de sistema exige tratar el texto del estado como datos y no como instrucciones, y devolver solo una letra.

## Capacidades

- Selección de una opción entre varias (A, B, C...) ante una situación, pregunta y lista de alternativas.
- Salida de una única letra, sin explicación, lo que permite interpretar la distribución de probabilidad sobre las letras como medida de confianza por opción.
- Toma de decisiones secuenciales en un entorno de simulación empresarial (gestión de dinero, satisfacción y accidentes).
- Entrenamiento y evaluación con recompensas del simulador (GRPO con estandarización por grupo y KL).
- Manejo de instrucciones de sistema con defensa básica frente a inyección de prompt en el campo `state`.
- Idioma coreano.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de políticas de decisión en simuladores: el modelo sirve como baseline para comparar una política neuronal entrenada con RL frente a reglas heurísticas dentro de CONNECT TYCOON, dado que devuelve una distribución de probabilidad por opción.
- Investigación educativa en RLHF/GRPO: reproduce un pipeline completo (PPO profesor, ajuste supervisado, GRPO con KL) sobre un modelo de 0,8B, útil para cursos y tutoriales de reinforcement learning aplicado a LLMs.
- Prototipado de asistentes de decisión acotada: en dominios donde las alternativas están predefinidas y etiquetadas, el modelo puede seleccionar una letra y la probabilidad asociada puede usarse como umbral de confianza para derivar a revisión humana.
- Generación de datos sintéticos de decisión: la política profesora y el propio modelo pueden producir etiquetas sobre estados simulados para ampliar conjuntos de entrenamiento en tareas de clasificación de opciones.
- Análisis de calibración: al exponer la probabilidad de cada letra, permite estudiar la relación entre confianza del modelo y recompensa real del simulador (la model card reporta una tasa de acierto del 72% en 177 transacciones de tarjeta simuladas).
- Docencia y divulgación: el notebook de Colab y los enlaces a GitHub permiten replicar el entrenamiento paso a paso, por lo que encaja en talleres prácticos de RL con modelos pequeños.
- No se recomienda su uso como sistema de decisión empresarial real sin revalidación con los registros propios de la empresa, tal como advierte el autor.

## Benchmarks y rendimiento

Resultados publicados en la model card (conjunto de test de 840 problemas y evaluación en simulador):

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual simulado | Transacciones de tarjeta con pérdida reducida |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 29,8% | 4,49 | No disponible | No disponible |
| Ajuste supervisado | 81,0% | 2,92 | No disponible | No disponible |
| Ajuste con RL (GRPO) | 81,8% | 2,90 | 8,91 millones de wones | 72% (148/177) |

El autor advierte que la evaluación de operación empresarial corresponde a la media de dos meses no vistos, con muestra pequeña, y que el modelo sigue por debajo de la política profesora entrenada con PPO en el simulador. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El modelo base tiene 0,8B de parámetros; en fp16 ocupa aproximadamente 1,6 GB y en cuantización de 4 bits en torno a 0,5 GB, más el adaptador LoRA (tamaño no especificado, repo de 0,0 GB).
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, así como en GPUs de portátil con 8 GB o menos en cuantización de 4 bits.
- Para entrenamiento o ajuste del adaptador, una GPU con 16-24 GB (RTX 4090, A100 40 GB) es suficiente dado el tamaño del modelo base; no se documentan requisitos concretos.
- Despliegue: la carga estándar es transformers + peft (`PeftModel.from_pretrained`). No se documenta soporte explícito en vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT, requeriría fusión previa con el modelo base para muchos de esos runners.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-arbiter-v1 | 0,8B (base) + LoRA | No disponible | Decisión entre opciones etiquetadas con GRPO sobre simulador | Apache 2.0 | Hugging Face (18 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible en la información | LLM generalista | Según el modelo base (no confirmada) | Hugging Face |
| Política PPO del simulador (profesora) | No disponible | No aplica | Agente RL pequeño entrenado con PPO | No disponible | No distribuida públicamente |

No se dispone de datos suficientes para comparar con otros adaptadores de decisión de la misma categoría; la comparativa se limita al modelo base y a la política profesora citada en la model card.

## Limitaciones y advertencias

- Modelo de investigación y educación sobre un simulador sintético; el autor recomienda revalidarlo con los registros reales de la empresa antes de cualquier uso en decisiones de negocio.
- Idioma limitado al coreano; no se documenta soporte multilingüe.
- Salida restringida a una letra: no genera explicaciones, justificaciones ni texto libre, lo que limita su auditabilidad directa.
- Riesgo de alucinación en el sentido de seleccionar opciones con alta confianza cuando el estado o la pregunta quedan fuera de la distribución del simulador.
- Evaluación con muestra pequeña: dos meses no vistos para el beneficio mensual y 177 transacciones para la métrica de tarjeta; el propio autor señala que el modelo queda por debajo de la política profesora PPO.
- El adaptador depende del modelo base Qwen/Qwen3.5-0.8B; cualquier cambio de versión o disponibilidad del base afecta a la reproducibilidad.
- La model card incluye un ejemplo de código que referencia `Siwooo/connectailab-rl-jay-v1` en lugar de `Siwooo/connectailab-rl-arbiter-v1`; conviene verificar el identificador correcto antes de cargar el adaptador.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y la ausencia de benchmarks estándar desaconsejan su uso en producción sin evaluación propia.
- No se documentan sesgos específicos más allá de los derivados de la distribución `general` del simulador y de los datos públicos usados para calibrarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Siwooo/connectailab-rl-arbiter-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del simulador CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
