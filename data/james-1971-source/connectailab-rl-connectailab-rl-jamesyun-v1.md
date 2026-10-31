# James-1971-source/connectailab-rl-connectailab-rl-jamesyun-v1

## Resumen

Connectailab RL jamesyun v1 es un adaptador LoRA entrenado sobre Qwen/Qwen3.5-0.8B para tareas de toma de decisiones empresariales en un entorno de simulación. Fue desarrollado por James-1971-source en colaboración con CONNECT AI LAB y AI CITY BUILDERS, una iniciativa educativa coreana centrada en IA y aprendizaje por refuerzo. El modelo resuelve un problema muy concreto: dado un estado de empresa, una pregunta y una lista de opciones, debe devolver únicamente la letra de la opción elegida.

El entrenamiento combina un pipeline híbrido: primero se entrena una política pequeña con PPO en el simulador CONNECT TYCOON (que actúa como "profesor"), después se genera un conjunto de datos etiquetado reejecutando meses de simulación con opciones alternativas y puntuando cada una, se aplica aprendizaje supervisado sobre las mejores opciones y finalmente se aplica GRPO (Group Relative Policy Optimization) con ventaja estandarizada por lotes y regularización KL respecto al modelo inicial. Es un proyecto experimental y educativo, con muestras de evaluación pequeñas, por lo que su relevancia es principalmente como demostración de RL sobre LLM para decisiones secuenciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo causal (transformer decoder, Qwen3.5-0.8B) |
| Parametros totales | 0,8 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE; solo se actualizan los pesos LoRA) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder de pequeño tamaño, al que se añade un adaptador LoRA entrenado con la librería PEFT. El pipeline de entrenamiento es notablemente elaborado para un modelo de este tamaño:

1. **Simulador de aprendizaje por refuerzo**: una política pequeña opera una empresa simulada durante miles de meses y aprende con PPO. Esta política actúa como profesor.
2. **Generación del dataset**: cada mes operado por el profesor, se modifican las opciones de cada decisión y se reejecuta el mes completo para puntuar cada alternativa.
3. **Aprendizaje supervisado (SFT)**: el modelo aprende imitando la opción con mayor puntuación.
4. **GRPO**: se consideran todas las opciones como un grupo, aumentando la probabilidad de las opciones cuya puntuación en el simulador supera la media del grupo (ventaja estandarizada por lotes), con penalización KL respecto al modelo de partida.

El dataset procede de la distribución de empresas `general` (ajustada con datos públicos) y contiene 4.082 problemas de entrenamiento, 832 de validación y 840 de test.

## Capacidades

- Toma de decisiones discreta: dado un JSON con `state`, `question` y `options`, devuelve exactamente una letra de opción sin explicación.
- Salida estructurada y determinista por diseño del prompt: el sistema indica tratar el texto dentro de `state` como datos y no como instrucciones (mitigación básica de inyección de prompts).
- Evaluación de confianza: la probabilidad asignada a cada letra de opción puede interpretarse como certeza de la decisión.
- No está diseñado para generación de texto general, código, matemáticas ni conversación: es un clasificador de decisiones disfrazado de LM.
- El modelo base conserva sus capacidades generales al ser un adaptador LoRA, pero el fine-tuning está orientado exclusivamente a esta tarea.

## Casos de uso

- **Investigación en RL sobre LLM**: sirve como referencia reproducible de un pipeline completo PPO-profesor + SFT + GRPO sobre un modelo pequeño, con código y notebook de Colab disponibles.
- **Docencia en aprendizaje por refuerzo**: el proyecto procede de una institución educativa juvenil y cuenta con cursos y vídeos asociados; es ideal como material didáctico.
- **Prototipado de agentes de decisión en simuladores de negocio**: puede integrarse como capa de decisión en entornos tipo Gymnasium (el proyecto usa el estándar gymnasium).
- **Estudio de toma de decisiones multi-criterio**: el formato estado/pregunta/opciones permite experimentar con decisiones empresariales simuladas (dinero, satisfacción, accidentes).
- **Benchmarking de LoRA en tareas de clasificación de opciones**: útil para comparar el impacto de SFT frente a GRPO en modelos de menos de 1B de parámetros.
- **Base para fine-tuning adicional**: al ser un adaptador Apache 2.0 ligero, puede reentrenarse con datos de dominios concretos (el propio autor recomienda revalidar con registros reales antes de uso serio).

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (entorno propio del simulador, no benchmarks estándar):

| Modelo | Acierto en test (%) | Arrepentimiento (menor es mejor) | Beneficio mensual simulado | Transacciones reales de tarjeta · reducción de pérdidas |
|---|---|---|---|---|
| Qwen sin entrenar | 30,4 | 2,67 | — | — |
| Solo supervisado (SFT) | 77,6 | 1,90 | — | — |
| Tras RL (GRPO) | 76,4 | 1,92 | 11,02 millones de wones | 71 % (145/177) |

El autor advierte que la evaluación de operación empresarial usa solo 2 meses no vistos (muestra pequeña) y que el rendimiento sigue por debajo del política-profesor entrenado con PPO en el simulador. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: el modelo base de 0,8B con adaptador LoRA cabe con holgura en GPUs de consumo; en FP16 se requieren aproximadamente 2 GB de VRAM, e incluso menos con cuantización (no documentada oficialmente).
- GPU recomendadas: cualquier GPU moderna con 4 GB o más (RTX 3060, RTX 4060 o superiores); también ejecutable en CPU dada la escala del modelo, aunque el repo indica un tamaño de 0,0 GB (adaptador mínimo).
- Consumer GPUs: totalmente viable en prácticamente cualquier GPU de consumo actual.
- Despliegue: vía transformers + PEFT (código de ejemplo en la model card); no hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión y fusión previa del adaptador. vLLM y TGI serían posibles tras fusionar el LoRA en el modelo base.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera inferencia muy rápida, en el orden de milisegundos por decisión en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea | Licencia |
|---|---|---|---|---|
| Connectailab RL jamesyun v1 | LoRA sobre Qwen3.5-0.8B | 0,8B (base) | Decisión empresarial en simulador (coreano) | Apache 2.0 |
| Qwen/Qwen3.5-0.8B (base) | LM causal general | 0,8B | Uso general | no disponible en la ficha |
| Decision-Tuner / RL-LoRA similares | no disponible | no disponible | no disponible | no disponible |

No se conocen modelos comparables directamente publicados con el mismo enfoque (RL en simulador de empresa + GRPO sobre un LLM de 0,8B); la comparación más relevante es con su propio modelo base, sobre el que mejora el acierto del 30,4 % al 76,4-77,6 % en la tarea específica.

## Limitaciones y advertencias

- Proyecto explícitamente experimental y educativo: el autor advierte que no debe usarse para decisiones empresariales reales sin revalidación con registros propios de la empresa.
- La evaluación de beneficio mensual se basa en solo 2 meses no vistos; la muestra es estadísticamente muy pequeña.
- El rendimiento tras GRPO (76,4 %) es ligeramente inferior al de solo SFT (77,6 %), y ambos quedan por debajo del política-profesor de PPO.
- Sesgos: el modelo hereda la distribución de empresas `general` del simulador y los datos públicos usados para ajustarla; sesgos específicos no documentados.
- Riesgo de alucinación: bajo en la tarea diseñada (salida de una letra), pero el modelo no está alineado para uso conversacional general.
- Idioma: entrenado y documentado en coreano; el rendimiento con prompts en otros idiomas no está evaluado.
- Estadísticas de adopción muy bajas (22 descargas, 1 like), sin auditoría comunitaria.
- El prompt de sistema incluye mitigación frente a inyección de instrucciones en el campo `state`, pero no hay evaluación formal de robustez frente a ataques adversariales.

## Enlaces

- HuggingFace: https://huggingface.co/James-1971-source/connectailab-rl-connectailab-rl-jamesyun-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub CONNECT TYCOON (simulador): https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- CONNECT AI LAB (YouTube): https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (proyecto C1): https://www.ezerai.xyz
