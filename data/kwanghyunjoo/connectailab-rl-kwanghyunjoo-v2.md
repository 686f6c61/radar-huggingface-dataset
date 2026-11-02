# kwanghyunjoo/connectailab-rl-kwanghyunjoo-v2

## Resumen

`connectailab-rl-kwanghyunjoo-v2` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen3.5-0.8B` para una tarea muy concreta: la toma de decisiones de negocio dentro de un simulador de empresa llamado CONNECT TYCOON. No es un modelo conversacional general, sino un clasificador de elección multiple que recibe un estado, una pregunta y una lista de opciones, y devuelve exactamente una letra correspondiente a la opción seleccionada.

El desarrollo corre a cargo de Kwanghyun Joo, consultor de reestructuración empresarial, en el marco de la colaboración entre CONNECT AI LAB y AI CITY BUILDERS. El modelo se distribuye como un adaptador PEFT con licencia Apache 2.0 y está pensado como material de investigación y docencia sobre aprendizaje por refuerzo aplicado a la toma de decisiones, no como herramienta de producción.

Su relevancia es acotada pero instructiva: documenta un pipeline completo de RL (PPO en simulador como política docente, generación de un dataset de preferencias por puntuación de opciones, ajuste supervisado y posterior GRPO con normalización por grupo y penalización KL respecto al modelo de partida) sobre un modelo de 0,8 mil millones de parámetros. El resultado es un artefacto pequeño, reproducible y con métricas declaradas por el autor, útil para estudiar cómo se comporta el RL con recompensas escasas y simulación sintética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 0,8 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, sin especificar en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Coreano (`ko`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only del que la model card no detalla capas, dimensiones ocultas ni ventana de contexto. La innovación no está en la arquitectura del modelo base, sino en el procedimiento de entrenamiento en cuatro fases descrito por el autor: primero se entrena una política pequeña con PPO dentro del simulador CONNECT TYCOON para que opere la empresa durante miles de meses; esa política actúa como docente. En segundo lugar se construye un "cuaderno de problemas": por cada decisión mensual se reejecuta el mes completo permutando las opciones disponibles, lo que permite puntuar cada alternativa según el resultado final del simulador. Después se aplica ajuste supervisado sobre la opción de mayor puntuación y, finalmente, un paso de RL tipo GRPO en el que se agrupan todas las opciones de una misma decisión, se normaliza la ventaja dentro del grupo y se añade una penalización KL contra el modelo de partida para evitar el colapso de la distribución.

El dataset de decisiones pertenece a la distribución `general`, ajustada con datos públicos de empresas, y consta de 4.082 ejemplos de entrenamiento, 832 de validación y 840 de test. La model card no especifica el número de tokens de entrenamiento, la composición exacta del corpus ni los hiperparámetros del LoRA (rango, alpha, dropout), por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Selección de una única opción entre varias: dado un estado, una pregunta y una lista de opciones etiquetadas con letras, devuelve exactamente una letra.
- Estimación de probabilidad por opción: la probabilidad asignada a cada letra actúa como medida de confianza y permite ordenar alternativas.
- Razonamiento de decisión de un solo paso, orientado a entornos de simulación de gestión empresarial (finanzas, satisfacción, incidentes).
- Robustez frente a inyección de instrucciones en el campo `state`: el prompt de sistema indica explícitamente tratar el texto del estado como datos y no como instrucciones.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está diseñado para una decisión por invocación.
- Capacidades multilingües: limitadas al coreano según la model card.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Investigación docente sobre RL aplicado a decisiones: el adaptador sirve como ejemplo reproducible de pipeline PPO → ajuste supervisado → GRPO sobre un modelo de 0,8 B, con dataset y métricas declaradas, para cursos y talleres de aprendizaje por refuerzo.
- Evaluación comparativa de algoritmos de preferencias: al existir puntos de control de "aprendizaje supervisado" y "RL" con métricas separadas, permite medir el efecto marginal del paso de RL sobre la misma base.
- Simulación de políticas de negocio en entornos sintéticos: integrado en CONNECT TYCOON, el modelo puede operar la empresa mes a mes generando decisiones de una letra consumibles por el simulador.
- Generación de datos sintéticos de decisión: las probabilidades por opción permiten muestrear decisiones con distintos niveles de exploración para aumentar el dataset de entrenamiento de otros modelos.
- Pruebas de formato estricto de salida: útil como banco de pruebas para validar parsers que esperan una única letra y para evaluar la estabilidad del formato bajo entradas largas o ruidosas.
- Estudio de robustez frente a inyección de prompt: el diseño con separación explícita entre instrucciones y datos permite experimentar con ataques de inyección dentro del campo `state` y medir la tasa de éxito del modelo al ignorarlos.
- Prototipado de asistentes de decisión acotados: en un dominio cerrado con opciones predefinidas, el modelo puede servir de base para un asistente que solo elige entre alternativas conocidas, sin generación libre.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card:

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reducción de pérdidas en transacciones reales |
|---|---|---|---|---|
| Qwen sin entrenar | 32,0% | 2,61 | No disponible | No disponible |
| Ajuste supervisado (SFT) | 66,1% | 2,12 | No disponible | No disponible |
| RL (este adaptador) | 65,1% | 2,12 | 3,33 millones de wones | 53% (110/177) |

El autor advierte que la medición de operación real corresponde a la media de dos meses no vistos, con muestra pequeña, y que el modelo sigue por debajo de la política docente entrenada con PPO en el simulador. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 B ocupa aproximadamente 1,6 GB en fp16 y alrededor de 0,5-0,6 GB en cuantización de 4 bits; el adaptador LoRA añade unos pocos megabytes.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque las dos últimas están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente toda la gama actual, incluidas GPU integradas con suficiente memoria unificada.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor), llama.cpp y Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, y vLLM o TGI con soporte de adaptadores LoRA en el caso de vLLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-kwanghyunjoo-v2 | 0,8 B (base) + LoRA | No disponible | Decisión de una letra en simulador | Apache 2.0 | HuggingFace (adaptador PEFT) |
| Qwen/Qwen3.5-0.8B | 0,8 B | No disponible | LLM generalista | No disponible en la información | HuggingFace |
| Política PPO del simulador CONNECT TYCOON | No disponible (modelo pequeño) | No disponible | Decisión en simulador | No disponible | No disponible públicamente |

No se dispone de datos de benchmarks comparables con otros adaptadores de decisión de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: solo responde con una letra entre opciones predefinidas; no genera texto libre ni mantiene conversaciones.
- Entrenado exclusivamente sobre la distribución `general` del simulador CONNECT TYCOON; el propio autor recomienda revalidar con registros reales de la empresa antes de cualquier uso en gestión real.
- El paso de RL no mejora el acierto en test respecto al ajuste supervisado (65,1% frente a 66,1%); su beneficio se observa en métricas del simulador, no en la exactitud de la tarea.
- Muestra de evaluación de operación real muy pequeña (dos meses no vistos), lo que limita la significación estadística de las cifras declaradas.
- Riesgo de alucinación de etiqueta: si el formato de entrada se desvía del esperado, el modelo puede devolver una letra no incluida en las opciones.
- Sesgos: al entrenarse sobre datos sintéticos de un simulador con una distribución concreta de empresas, reproduce los sesgos de ese generador y no representa necesariamente la diversidad del tejido empresarial real.
- Idioma: la model card declara únicamente coreano; el rendimiento en castellano no está evaluado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado antes de explotación comercial.
- Proyecto en fase experimental: el propio autor indica que el experimento de conexión de modelos está en pruebas y que se trata de un modelo educativo.
- Sin soporte documentado de tool calling, agentes ni contexto largo; no debe asumirse ninguna de esas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kwanghyunjoo/connectailab-rl-kwanghyunjoo-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Web del autor: https://againwalk.com
