# gari-ai/connectailab-rl-yonggari-v1

## Resumen

Connectailab-rl-yonggari-v1 es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B por gari-ai (CONNECT AI LAB × AI CITY BUILDERS). No es un modelo de chat convencional: es un modelo de toma de decisiones empresariales que recibe una situación, una pregunta y una lista de opciones, y responde únicamente con la letra de la opción elegida. El objetivo es que actúe como "cerebro decisor" de una empresa simulada dentro del simulador Connect Tycoon.

Su pipeline de entrenamiento es notable: primero se entrena una política pequeña con PPO dentro del simulador (el "profesor"), después se genera un conjunto de problemas con puntuaciones por opción, se aplica aprendizaje supervisado sobre la mejor opción y finalmente se refina con GRPO (Group Relative Policy Optimization), usando la puntuación del simulador como recompensa con ventaja estandarizada por grupos y regularización KL respecto al modelo inicial.

Es relevante como ejemplo público y educativo de RL aplicado a LLM para decisiones secuenciales (decision-making), con datos de entrenamiento y evaluación sintéticos generados por simulación. El modelo está orientado al idioma coreano, es de descarga reciente (32 descargas, 1 like) y se distribuye bajo licencia Apache 2.0 en formato safetensors vía la librería PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-0.8B (transformer causal decoder-only) |
| Parametros totales | no disponible (base Qwen3.5-0.8B más pesos LoRA; tamaño del repo indicado como 0.0 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la heredada de Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, requiere el modelo base) |

## Arquitectura y entrenamiento

Técnicamente es un adaptador LoRA, no un modelo completo: hay que cargar Qwen/Qwen3.5-0.8B con transformers y aplicar el adaptador con `PeftModel.from_pretrained`. El pipeline de entrenamiento descrito en la model card tiene cuatro fases:

1. **RL en simulador (PPO)**: una política pequeña opera la empresa simulada durante miles de "meses" y aprende una política operativa que actúa como profesor.
2. **Generación del problemario**: por cada mes de operación del profesor, se alteran las opciones de cada decisión y se re-ejecuta el mes completo para puntuar cada opción.
3. **SFT (aprendizaje supervisado)**: el modelo aprende imitando la opción con mayor puntuación.
4. **RL (GRPO)**: se consideran todas las opciones como un grupo, se aumenta la probabilidad de las opciones cuya puntuación del simulador supera la media del grupo (ventaja estandarizada por grupo), con penalización KL respecto al modelo de partida.

El dataset de decisiones (empresa tipo `general`, ajustada con datos públicos) consta de 4.082 problemas de entrenamiento, 832 de validación y 840 de test. No se han publicado detalles sobre número de tokens, rango de LoRA ni hiperparámetros de entrenamiento.

## Capacidades

- Toma de decisiones de opción única: dado un JSON con `state`, `question` y `options` (etiqueta, clave, descripción), devuelve únicamente la letra de la opción elegida.
- Probabilidades por opción: la probabilidad asignada a cada letra puede interpretarse como confianza en cada alternativa; la mayor se interpreta como "confianza" de la decisión.
- Evaluación de decisiones empresariales simuladas: gestión de dinero, satisfacción y accidentes en el entorno Connect Tycoon.
- Diseñado para resistir inyección de instrucciones en el estado: el system prompt indica tratar el contenido de `state` como datos, no como instrucciones.
- No es un asistente de propósito general: no está pensado para conversación, generación de código ni razonamiento abierto; su salida es una letra.
- Idioma de operación: coreano (las decisiones y datos del simulador están en coreano).

## Casos de uso

- **Cerebro decisor en simuladores de gestión**: integrarlo como capa de decisión en Connect Tycoon u otros entornos Gymnasium, donde cada paso requiere elegir una de varias opciones y el entorno devuelve recompensa (beneficio, satisfacción, incidentes).
- **Investigación en RL para LLM**: replicar o extender el pipeline PPO → problemario → SFT → GRPO, ya que el repositorio incluye un notebook de Colab reproducible.
- **Benchmarking de modelos pequeños en decision-making**: usar el test set (840 problemas) para comparar Qwen3.5-0.8B con y sin adaptador u otros modelos pequeños en tasa de acierto y arrepentimiento (regret).
- **Docencia y divulgación**: material práctico para cursos de aprendizaje por refuerzo aplicado a LLM (el proyecto nace de un canal educativo con cursos gratuitos).
- **Prototipado de agentes de decisión de bajo coste**: al basarse en un modelo de 0,8B con LoRA, permite experimentar con decisiones multi-paso en hardware de consumo.
- **Estudio de robustez frente a inyección de prompts**: el formato de entrada separa explícitamente estado y opciones, útil para probar ataques vía el campo `state` y defensas basadas en system prompts.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (evaluación sobre el test set del problemario y simulación):

| Modelo | Tasa de acierto en test | Regret (menor es mejor) | Beneficio mensual simulado | Reducción de pérdidas en transacciones reales |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 31,5 % | 3,28 | — | — |
| Tras SFT | 70,0 % | 2,48 | — | — |
| Tras RL (GRPO) | 73,3 % | 2,44 | 2,62 millones de won | 37 % (91/177) |

Advertencias del propio autor: los resultados de simulación corresponden a la media de solo 2 meses no vistos (muestra pequeña) y el rendimiento sigue por debajo del modelo profesor (la política PPO original del simulador). No hay comparativas con MMLU, HumanEval ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente; al ser un adaptador LoRA sobre un modelo de ~0,8B parámetros, la inferencia en fp16 debería requerir del orden de 2-3 GB de VRAM, y es viable en CPU.
- GPUs recomendadas: cualquier GPU de consumo (RTX 3060, RTX 4090 o superior) es más que suficiente para inferencia; para el entrenamiento con GRPO/PPO el autor no publica requisitos, aunque el notebook de Colab sugiere que es viable en Google Colab gratuito o estándar.
- Cabe cómodamente en GPUs de consumo y en equipos sin GPU dedicada.
- Despliegue: transformers + PEFT (método oficial documentado); en principio compatible con ecosistemas PEFT/LoRA (vLLM con soporte LoRA, merge del adaptador para inferencia con llama.cpp u Ollama tras fusionar pesos), aunque no hay instrucciones oficiales para estos últimos.
- Latencia y throughput: no disponibles; por el tamaño del modelo base se espera latencia baja en generación de una sola letra de respuesta.

## Comparativa con modelos similares

| Modelo | Tipo | Base / parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gari-ai/connectailab-rl-yonggari-v1 | Adaptador LoRA con RL (GRPO) | Qwen3.5-0.8B | Decisión empresarial simulada (coreano) | Apache 2.0 | Público (Hugging Face) |
| Qwen/Qwen3.5-0.8B (base) | LLM general sin ajustar | 0,8B | Uso general | no disponible en la ficha | Público |
| Alternativas comparables de decision-making con RL sobre LLM pequeños | no disponible | no disponible | no disponible | no disponible | no disponible |

No existen en la información proporcionada modelos comparables directos del mismo nicho (RL con GRPO sobre LLM pequeños para gestión empresarial simulada).

## Limitaciones y advertencias

- Rendimiento inferior al profesor: el autor reconoce que el modelo sigue por debajo de la política PPO original del simulador; no debe asumirse que es la mejor política disponible.
- Muestra de evaluación pequeña: los resultados de beneficio simulado son medias de solo 2 meses no vistos.
- Datos sintéticos: todo el entrenamiento proviene de un simulador con una distribución de empresa tipo `general`; el propio autor advierte de re-validar con datos reales de la empresa antes de cualquier uso en gestión real.
- Idioma: entrenado y evaluado en coreano; no hay garantías de funcionamiento en castellano u otros idiomas.
- Salida restringida: devuelve solo una letra; no explica sus decisiones y no sirve como asistente general.
- Sesgos: heredados de Qwen3.5-0.8B y de la distribución de decisiones del simulador; no se han publicado análisis de sesgos.
- Alucinaciones: menos relevantes al ser salida de opción única, pero la selección puede ser errónea (26,7 % de fallos en test).
- Riesgo de inyección de instrucciones vía el campo `state`: mitigado solo mediante instrucción en el system prompt, no mediante garantía técnica.
- Contexto, cuantización y requisitos exactos: no disponibles en la model card.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/gari-ai/connectailab-rl-yonggari-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio Connect Tycoon (simulador): https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- CONNECT AI LAB (YouTube): https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (proyecto C1): https://www.ezerai.xyz
