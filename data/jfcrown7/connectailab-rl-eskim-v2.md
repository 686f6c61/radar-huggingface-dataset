# jfcrown7/connectailab-rl-eskim-v2

## Resumen

connectailab-rl-eskim-v2 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B por el autor jfcrown7, en el contexto del laboratorio CONNECT AI LAB en colaboración con AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de toma de decisiones (decision-making) especializado: recibe un estado, una pregunta y una lista de opciones etiquetadas, y devuelve únicamente la letra de la opción seleccionada. Su dominio de aplicación es el simulador de gestión empresarial CONNECT TYCOON.

El modelo resuelve un problema acotado: automatizar decisiones de negocio dentro de un entorno simulado (gymnasium), donde cada decisión se evalúa por su impacto en métricas de dinero, satisfacción y accidentes. La relevancia técnica reside en su pipeline de entrenamiento, que combina un profesor entrenado con PPO en el simulador, generación de un dataset de puntuaciones por opción, aprendizaje supervisado y un ajuste final con GRPO (Group Relative Policy Optimization) con normalización por grupo y penalización KL respecto al modelo de partida.

Se distribuye como adaptador PEFT (LoRA) de pequeño tamaño (el repositorio ocupa 0,0 GB), lo que lo hace muy ligero de desplegar sobre el modelo base. Está orientado a investigación y educación, con licencia Apache 2.0 y declarado únicamente para coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen3.5-0.8B tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se aplica sobre el base; cuantización del base no especificada) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer de 0,8 mil millones de parámetros. La arquitectura efectiva es la del modelo base más las matrices de bajo rango del adaptador, cargadas mediante `peft.PeftModel`. El entrenamiento se realizó en cuatro fases según la model card: (1) un profesor (política pequeña) entrenado con PPO durante miles de meses simulados en CONNECT TYCOON; (2) generación de un "cuaderno de problemas" donde, para cada decisión, se altera la opción elegida y se re-ejecuta el mes completo para puntuar cada alternativa; (3) aprendizaje supervisado sobre la opción de mayor puntuación; y (4) ajuste con GRPO, con normalización de ventajas por grupo y penalización KL contra el modelo de partida.

El dataset de decisiones se distribuye en 4082 ejemplos de entrenamiento, 832 de validación y 840 de prueba, sobre una distribución de empresas de tipo `general` ajustada con datos públicos. La innovación principal es el uso de GRPO sobre un espacio de acciones discretas representadas como letras, con recompensa derivada directamente del simulador. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del corpus ni si hubo RLHF/DPO adicional.

## Capacidades

- Selección de una única opción (letra) entre una lista etiquetada, dado un estado y una pregunta en formato JSON.
- Razonamiento de decisión orientado a un simulador de gestión empresarial (CONNECT TYCOON).
- Salida restringida a una letra, sin explicación, lo que facilita el parseo automático.
- Tratamiento del texto del estado como datos, no como instrucciones (según el prompt de sistema recomendado).
- Soporte multilingüe limitado al coreano.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Automatización de decisiones en el simulador CONNECT TYCOON: el modelo recibe el estado del mes, la pregunta y las opciones, y devuelve la letra elegida para ejecutar la acción en el entorno gymnasium.
- Investigación en reinforcement learning aplicado a decisiones discretas: sirve como caso de estudio de un pipeline profesor PPO → supervisado → GRPO reproducible con el notebook de Colab incluido.
- Educación en RL: el repositorio y la model card documentan paso a paso el proceso, útil para cursos y talleres de aprendizaje por refuerzo.
- Evaluación comparativa de métodos de ajuste: permite contrastar supervisado frente a GRPO sobre el mismo dataset y modelo base.
- Prototipado de agentes de decisión en entornos simulados: al devolver una sola letra, se integra fácilmente en bucles de simulación sin post-procesado complejo.
- Generación de datos sintéticos de decisiones: las puntuaciones por opción del simulador pueden reutilizarse para entrenar otros modelos o para analizar políticas.

## Benchmarks y rendimiento

Resultados publicados en la model card (conjunto de prueba de 840 problemas y simulador):

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual simulado | Transacciones reales con pérdida reducida |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 30,7% | 2,67 | — | — |
| Aprendizaje supervisado | 78,0% | 1,88 | — | — |
| Aprendizaje por refuerzo (GRPO) | 76,7% | 1,93 | 11,52 millones de wones | 71% (145/177) |

El autor advierte que la evaluación de operación real promedia solo dos meses no vistos, por lo que la muestra es pequeña, y que el modelo aún queda por debajo de la política profesora entrenada con PPO.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo de 0,8B, la inferencia en fp16 requiere del orden de 1,6 GB para los pesos del base más el adaptador, y menos con cuantización.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para el modelo base de 0,8B; A100/H100 no son necesarios.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: transformers + peft (según el ejemplo de la model card); el base puede servirse con vLLM, llama.cpp u Ollama si se fusiona el adaptador, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-eskim-v2 | 0,8B (base) + LoRA | No disponible | Decisión discreta en simulador | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | No disponible en la información | HuggingFace |
| Política profesora PPO (CONNECT TYCOON) | No disponible | No aplica | Decisión en simulador | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (decisión en simuladores de negocio) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de investigación y educación: el propio autor advierte que debe revalidarse con los registros reales de cada empresa antes de usarse en decisiones de gestión reales.
- Evaluación con muestra pequeña: la operación real se mide sobre dos meses no vistos, lo que limita la fiabilidad de las cifras.
- Rendimiento inferior al profesor PPO en el simulador, según reconoce el autor.
- Idioma limitado al coreano; no se garantiza comportamiento en castellano ni en otros idiomas.
- Salida restringida a una letra: no genera explicaciones ni razonamiento visible, lo que dificulta la auditoría de decisiones.
- Riesgo de alucinación en la selección de opciones si el estado o las opciones no siguen el formato JSON esperado.
- Dependencia del prompt de sistema exacto recomendado; cambios en el formato pueden degradar el rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jfcrown7/connectailab-rl-eskim-v2
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
