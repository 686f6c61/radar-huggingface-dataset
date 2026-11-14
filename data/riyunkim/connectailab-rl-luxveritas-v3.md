# riyunkim/connectailab-rl-luxveritas-v3

## Resumen

Connectailab-rl-luxveritas-v3 es un adaptador LoRA de tipo PEFT desarrollado por el usuario riyunkim dentro del proyecto CONNECT AI LAB, en colaboración con AI CITY BUILDERS. Se trata de un modelo de toma de decisiones para simulación empresarial: recibe un estado, una pregunta y una lista de opciones, y devuelve únicamente la letra de la opción seleccionada. No es un modelo generativo de propósito general, sino un clasificador de decisiones entrenado sobre el simulador Connect Tycoon.

El modelo se construye sobre `Qwen/Qwen3.5-0.8B` (0,8 mil millones de parámetros) mediante un adaptador LoRA entrenado con un pipeline híbrido de aprendizaje por refuerzo (PPO para generar un profesor, GRPO para el ajuste final) y aprendizaje supervisado. El resultado es un modelo que responde con una sola letra y cuya distribución de probabilidad sobre las opciones sirve como medida de confianza.

Es relevante como ejemplo de aplicación de RL a la toma de decisiones estructurada con modelos de lenguaje pequeños: demuestra que un modelo de menos de mil millones de parámetros puede alcanzar un 76,8 % de acierto en un banco de pruebas sintético de 840 preguntas, partiendo de un 30,1 % del modelo base sin ajustar. Su alcance es experimental y educativo, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador LoRA no especifica su numero de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 0,8 mil millones de parámetros (Qwen3.5-0.8B). Sobre él se entrena un adaptador LoRA que especializa al modelo en una tarea de selección entre opciones discretas: la salida esperada es una única letra (A, B, C...), y la probabilidad asignada a cada letra se interpreta como la probabilidad de cada opción.

El entrenamiento sigue cuatro fases descritas en la model card: (1) un pequeño agente de política se entrena con PPO durante miles de meses simulados en Connect Tycoon y actúa como profesor; (2) se genera un banco de problemas re-ejecutando cada mes con las distintas opciones para puntuar cada alternativa; (3) aprendizaje supervisado sobre la opción de mayor puntuación; (4) ajuste con GRPO, normalizando las ventajas dentro del grupo de opciones y añadiendo una penalización KL contra el modelo de partida. El conjunto de datos se compone de 4.082 ejemplos de entrenamiento, 832 de validación y 840 de test, sobre una distribución de empresas de tipo `general` calibrada con datos públicos.

## Capacidades

- Selección de una opción entre varias en tareas de decisión estructurada (formato JSON con `state`, `question` y `options`).
- Salida restringida a una letra, sin explicación, lo que facilita el parseo automático.
- Distribución de probabilidad sobre las opciones como señal de confianza (el valor máximo indica la opción elegida).
- Robustez frente a inyección de instrucciones dentro del campo `state`: el prompt de sistema indica explícitamente tratar el texto del estado como datos.
- Capacidad multilingüe limitada al coreano según la model card.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Simulación de gestión empresarial: el modelo decide mes a mes qué acción tomar en el simulador Connect Tycoon, donde se ha validado con un beneficio medio de 11,52 millones de wones por mes simulado.
- Evaluación de políticas de decisión: sirve como referencia para comparar agentes RL clásicos (PPO) frente a políticas basadas en modelos de lenguaje en entornos tipo Gymnasium.
- Docencia de aprendizaje por refuerzo: el repositorio incluye un notebook de Colab para reproducir el entrenamiento, lo que lo hace útil en cursos de RL aplicado.
- Prototipado de asistentes de decisión acotada: en escenarios donde las opciones están predefinidas y solo hay que elegir una, el formato de salida de una letra simplifica la integración.
- Investigación sobre calibración de confianza: la probabilidad asignada a cada letra permite estudiar la relación entre confianza del modelo y acierto en decisiones discretas.
- Filtrado previo en pipelines de decisión: como primer clasificador barato (0,8 B) antes de invocar modelos mayores en decisiones de alto impacto.

## Benchmarks y rendimiento

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual simulado | Transacciones reales con tarjeta (reducción de pérdidas) |
|---|---|---|---|---|
| Qwen sin ajuste | 30,1 % | 2,68 | no disponible | no disponible |
| Aprendizaje supervisado | 78,1 % | 1,89 | no disponible | no disponible |
| Aprendizaje por refuerzo (este modelo) | 76,8 % | 1,93 | 11,52 millones de wones | 70 % (145/177) |

Los resultados proceden del banco de test de 840 preguntas del propio simulador. El autor advierte que la evaluación de operación empresarial se basa en la media de dos meses no vistos, por lo que la muestra es pequeña, y que el modelo aún queda por debajo de la política profesora entrenada con PPO en el simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 B en fp16 ocupa aproximadamente 1,6 GB; en cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, en torno a 0,4 GB (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores no suponen ningún problema.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers + peft (forma documentada por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador, aunque el modelo base Qwen3.5-0.8B puede servirse con ellos fusionando el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-luxveritas-v3 | 0,8 B (base) + LoRA | no disponible | Decisión entre opciones en simulador | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8 B | no disponible | Generación general | Apache 2.0 | Hugging Face |
| Política PPO del simulador Connect Tycoon | no disponible | no disponible | Decisión en simulador | no disponible | Repositorio del proyecto |

No se dispone de información sobre otros adaptadores RL comparables de la misma familia ni de resultados de benchmarks cruzados con modelos de propósito general, por lo que la comparativa se limita al modelo base y a la política profesora citada por el autor.

## Limitaciones y advertencias

- Modelo de investigación y educativo: el propio autor recomienda revalidarlo con los datos reales de cada empresa antes de usarlo en decisiones de gestión reales.
- Ámbito restringido: solo responde con una letra entre opciones predefinidas; no genera texto libre ni explicaciones.
- Idioma: la model card declara únicamente coreano; no hay evidencia de funcionamiento en castellano u otros idiomas.
- Evaluación limitada: el rendimiento operativo se mide sobre dos meses no vistos, una muestra muy pequeña; el modelo queda por debajo de la política profesora PPO.
- Riesgo de alucinación en la selección: puede elegir opciones con alta confianza aunque sean incorrectas; conviene usar la distribución de probabilidad como señal de abstención.
- Sesgos: los datos provienen de un simulador sintético calibrado con datos públicos de empresas; pueden no reflejar la distribución real de decisiones empresariales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo base Qwen3.5-0.8B tiene su propia licencia que debe respetarse.
- Sin datos publicados sobre cuantización, longitud de contexto ni latencia, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/riyunkim/connectailab-rl-luxveritas-v3
- Repositorio Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
