# eunsasim/connectailab-rl-eunsa-v1

## Resumen

Connectailab rl eunsa v1 es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B para tareas de toma de decisiones empresariales en un simulador de gestión llamado Connect Tycoon. Fue desarrollado por eunsasim (CONNECT AI LAB × AI CITY BUILDERS) y se presenta como un modelo experimental de investigación y educación en aprendizaje por refuerzo aplicado a decisiones de negocio.

El problema que aborda es concreto: dado un estado de empresa, una pregunta y un conjunto de opciones etiquetadas (A, B, C...), el modelo debe devolver únicamente la letra de la opción elegida. El entrenamiento combina un pipeline híbrido: una política pequeña entrenada con PPO en el simulador actúa como "profesor", genera datos etiquetados mediante re-ejecuciones de meses simulados, se aplica aprendizaje supervisado y después RL con GRPO (ventaja estandarizada por grupos más penalización KL respecto al modelo de partida).

Es relevante como ejemplo didáctico y reproducible de RL sobre LLM en dominios de decisión estructurada, con resultados publicados (73,0 % de acierto en test frente al 34,1 % del modelo base) y un notebook de Colab para reproducir el entrenamiento. El modelo está pensado para coreano y usa la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre modelo causal transformer (Qwen3.5-0.8B) |
| Parametros totales | 0,8B (modelo base) + parámetros del adaptador LoRA (no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors del adaptador) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT; requiere el modelo base Qwen3.5-0.8B) |

## Arquitectura y entrenamiento

El modelo no es un LLM nuevo, sino un adaptador LoRA montado sobre Qwen/Qwen3.5-0.8B. El pipeline de entrenamiento tiene cuatro fases documentadas en la model card:

1. **RL en el simulador**: una política pequeña opera la empresa simulada durante miles de días y aprende con PPO; esta política actúa como profesor.
2. **Generación del dataset**: cada mes que el profesor gestiona, se altera una decisión y se re-ejecuta el mes completo para puntuar cada opción.
3. **Aprendizaje supervisado (SFT)**: el modelo aprende imitando la opción con mayor puntuación.
4. **RL con GRPO**: se consideran todas las opciones como un grupo y se aumenta la probabilidad de las que superan la media de puntuación del grupo (ventaja estandarizada), con penalización KL respecto al modelo de partida.

El dataset corresponde a la distribución de empresas `general` (ajustada con datos públicos) y contiene 4.067 problemas de entrenamiento, 829 de validación y 832 de test. El número de tokens de entrenamiento, el rank LoRA y los hiperparámetros concretos no están disponibles en la información proporcionada.

## Capacidades

- Toma de decisiones estructurada: lee un estado de empresa, una pregunta y una lista de opciones, y devuelve exclusivamente la letra de la opción elegida.
- Salida restringida y determinista por diseño: el formato de respuesta es una sola letra, lo que facilita su integración en pipelines automáticos.
- Probabilidades por opción: la probabilidad asignada a cada letra puede interpretarse como confianza de la decisión.
- Entrenado específicamente en el dominio del simulador Connect Tycoon (decisiones de gestión: dinero, satisfacción, incidentes).
- No está diseñado para generación de texto libre, código, matemáticas ni conversación general; hereda las capacidades de Qwen3.5-0.8B solo en la medida en que el adaptador no las degrada.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- **Agentes de decisión en simuladores de negocio**: integrarlo como capa de decisión de un agente que opera Connect Tycoon u otro simulador con interfaz de opciones etiquetadas, devolviendo la letra directamente.
- **Investigación en RL sobre LLM**: reproducir o extender el pipeline PPO → SFT → GRPO usando el notebook de Colab y el repositorio de GitHub como plantilla.
- **Docencia y formación**: material práctico para cursos de aprendizaje por refuerzo con LLM; el autor lo publica explícitamente con material educativo gratuito asociado.
- **Benchmarking de políticas pequeñas**: usar su test de 832 problemas (tasa de acierto y regret) como referencia para comparar otros modelos de decisión del mismo tamaño.
- **Prototipado de "CEO virtual"**: construir demos donde un LLM gestione decisiones operativas de una empresa simulada, aprovechando que el formato de entrada/salida es JSON simple con opciones.
- **Estudio de confiabilidad en decisiones**: analizar las probabilidades por opción como medida de confianza para sistemas de decisión con supervisión humana.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (test del propio simulador):

| Modelo | Acierto en test | Regret (menor es mejor) | Beneficio mensual simulado | Reducción de pérdidas en transacciones reales |
|---|---|---|---|---|
| Qwen3.5-0.8B sin entrenar | 34,1 % | 35,37 | — | — |
| Tras SFT | 73,8 % | 27,35 | — | — |
| Tras RL (GRPO) | 73,0 % | 26,81 | 10,18 millones KRW | 54 % (167/177) |

Advertencias del propio autor: los datos de beneficio corresponden a la media de solo 2 meses no vistos (muestra pequeña) y el modelo sigue rindiendo por debajo de la política profesor (PPO puro del simulador). No hay benchmarks estándar (MMLU, HumanEval, GSM8K) publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un LoRA sobre un modelo de 0,8B, el conjunto completo cabe con holgura en GPUs de consumo; en FP16 se estima del orden de 2-3 GB de VRAM (estimación, dato oficial no disponible).
- GPU recomendadas: cualquier GPU moderna; no se requiere A100 ni H100 para inferencia. Para entrenamiento, el notebook de Colab indica que es viable en el entorno gratuito de Google Colab.
- Consumer GPU: sí, cabe en GPUs como RTX 3060 o superiores, e incluso es plausible su ejecución en CPU dada la escala de 0,8B (rendimiento en CPU no disponible).
- Despliegue: transformers + PEFT (código oficial en la model card); compatible con el ecosistema Hugging Face. Compatibilidad con vLLM, llama.cpp u Ollama: no disponible (al ser un adaptador PEFT, llama.cpp y Ollama requerirían fusión o conversión previa).
- Latencia y throughput: no disponibles; por tamaño (0,8B) y salida de un solo token, la latencia esperada es baja.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Dominio | Licencia |
|---|---|---|---|---|
| eunsasim/connectailab-rl-eunsa-v1 | LoRA sobre Qwen3.5-0.8B, RL (GRPO) | 0,8B + adaptador | Decisiones empresariales simuladas (coreano) | Apache 2.0 |
| Qwen/Qwen3.5-0.8B (base) | LLM causal general | 0,8B | Uso general | no disponible |
| Política PPO del simulador (profesor) | Política RL pequeña, sin LLM | no disponible | Decisiones en Connect Tycoon | no disponible |

En la tarea específica del simulador, el modelo entrenado (73,0 % de acierto) supera ampliamente al base sin entrenar (34,1 %), pero sigue por debajo de la política profesor entrenada directamente con PPO, según los datos del autor. No hay alternativas comerciales comparables publicadas para este dominio concreto: no disponible.

## Limitaciones y advertencias

- Es un modelo experimental y educativo: el propio autor advierte de que no debe usarse para decisiones de gestión reales sin re-validación con los registros de la empresa concreta.
- Muy especializado: solo produce letras de opción en el formato del simulador; no sirve como asistente general y puede degradar las capacidades generales del modelo base.
- Los resultados de beneficio mensual se basan en solo 2 meses no vistos, una muestra muy pequeña.
- Rinde por debajo de la política profesor (PPO), lo que indica margen de mejora en el pipeline.
- Sesgos: hereda los sesgos del dataset sintético generado por la política del simulador y del modelo base Qwen3.5-0.8B; no hay auditoría de sesgos publicada.
- Riesgo de alucinación: bajo en su formato restringido (una letra), pero el modelo podría elegir opciones inválidas si el formato de entrada difiere del entrenamiento.
- Idioma: entrenado y documentado en coreano; su comportamiento con prompts en otros idiomas no está verificado.
- Licencia: Apache 2.0 permite uso comercial, pero depende también de la licencia del modelo base Qwen3.5-0.8B, que debe verificarse.
- Estadísticas de adopción muy bajas (39 descargas, 1 like en el momento de la ficha), sin comunidad de revisión externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eunsasim/connectailab-rl-eunsa-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub (Connect Tycoon): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI (proyecto C1): https://www.ezerai.xyz
