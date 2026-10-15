# kymbms/connectailab-rl-kodari-v1

## Resumen

kymbms/connectailab-rl-kodari-v1 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el autor "kymbms" en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de propósito general: está especializado en una única tarea de toma de decisiones, en la que recibe un estado (situación), una pregunta y una lista de opciones etiquetadas, y debe devolver exactamente la letra de una de ellas. La probabilidad asignada a cada letra se interpreta como la confianza en cada opción, de modo que el modelo actúa como una política de decisión discreta en lugar de un generador de texto abierto.

El modelo se entrenó con datos sintéticos generados en el simulador de gestión empresarial CONNECT TYCOON. El pipeline incluye una fase de aprendizaje supervisado a partir de puntuaciones por opción y una fase posterior de aprendizaje por refuerzo con ventaja normalizada por grupo y término KL respecto al modelo de partida, una formulación cercana a GRPO. El conjunto de datos consta de 4.082 problemas de entrenamiento, 832 de validación y 840 de test, todos ellos sobre una distribución de empresa de tipo "general" ajustada a datos públicos.

Su relevancia actual es fundamentalmente investigadora y educativa: sirve como ejemplo reproducible de cómo aplicar aprendizaje por refuerzo a decisiones discretas de negocio sobre un modelo pequeño (0,8B), y demuestra que un LoRA puede elevar la precisión en la tarea de decisión del 30,4 % al 77,5 % respecto al modelo base sin entrenar. El autor advierte explícitamente que es un modelo de investigación sobre un simulador sintético y que debe revalidarse con datos reales antes de cualquier uso de gestión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-0.8B; la arquitectura interna del modelo base no se detalla en la informacion proporcionada |
| Parametros totales | Modelo base de 0,8B parametros; el adaptador LoRA anade un numero de parametros entrenables no especificado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA gestionado con la libreria PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de PEFT montado sobre Qwen/Qwen3.5-0.8B. El contenido del repositorio es únicamente el adaptador (tamaño del repositorio 0,0 GB), por lo que en inferencia es necesario cargar el modelo base y superponer el LoRA con `PeftModel.from_pretrained`. La tarea está reducida a clasificación discreta de una letra entre las opciones presentadas, con formato de entrada JSON `{"state": ..., "question": ..., "options": [...]}` y salida de un único carácter.

El proceso de entrenamiento descrito en la model card tiene cuatro etapas. Primero, una política pequeña aprende a operar una empresa en el simulador durante miles de meses mediante PPO ("política maestra"). Segundo, se construye un conjunto de problemas: por cada decisión de la maestra se alteran las opciones y se reejecuta el mes completo para puntuar cada alternativa. Tercero, un aprendizaje supervisado imita la opción con mayor puntuación. Cuarto, una fase de aprendizaje por refuerzo que trata todas las opciones como un grupo, normaliza la ventaja dentro del grupo y añade una penalización KL contra el modelo de partida para elevar la probabilidad de las opciones con mejor puntuación del simulador. Este esquema corresponde a una variante de GRPO, etiquetada como tal en las etiquetas del repositorio junto a "deep-reinforcement-learning", "decision-making" y "gymnasium". La distribución de empresa empleada es "general", ajustada a datos públicos.

## Capacidades

- Elección de opción única: recibe un estado, una pregunta y una lista de opciones etiquetadas, y devuelve exactamente una letra (A, B, C, ...).
- Estimación de confianza por opción: la probabilidad del token de cada letra se interpreta como la probabilidad de esa elección, y el valor máximo como medida de convicción.
- Robustez frente a inyección de instrucciones: el prompt de sistema indica explícitamente que el texto dentro de "state" debe tratarse como datos y no como instrucciones.
- Operación en coreano: el único idioma soportado declarado es el coreano.
- Toma de decisiones orientada a negocio simulado: elección entre alternativas de gestión dentro del entorno CONNECT TYCOON.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento de agente autónomo multi-paso; la salida es una única decisión por invocación.
- No se documentan capacidades de visión ni de audio.
- No se documenta un modo de razonamiento explícito ("thinking mode"); el prompt exige responder solo con la letra, sin explicación.

## Casos de uso

- Investigación en aprendizaje por refuerzo para decisiones discretas: el modelo sirve como caso de estudio completo de un pipeline supervisado seguido de RL con ventaja normalizada por grupo, reproducible desde el notebook de Colab publicado.
- Enseñanza de GRPO y ventajas normalizadas: permite ilustrar de forma tangible cómo el agrupamiento de opciones y el término KL afectan a la política resultante en un modelo de 0,8B.
- Banco de pruebas de robustez ante inyección de prompts: al formularse la tarea como datos frente a instrucciones, es útil para estudiar si un modelo pequeño respeta la separación entre estado e instrucciones cuando el estado contiene texto malicioso.
- Generación de conjuntos de problemas puntuados: el método descrito (alterar opciones y reejecutar el episodio completo para puntuar cada alternativa) es reutilizable para crear datos supervisados en otros simuladores de decisión.
- Simulación educativa de gestión empresarial: integrado en CONNECT TYCOON, permite demostrar en un aula cómo una política aprende a tomar decisiones de empresa y cómo se mide su arrepentimiento.
- Evaluación offline de políticas de decisión: puede usarse como referencia para comparar métricas de precisión y arrepentimiento entre un modelo base, una variante supervisada y una variante entrenada con RL.
- Estudio de compromisos entre aprendizaje supervisado y RL: dado que la variante supervisada supera ligeramente a la de RL en precisión (78,1 % frente a 77,5 %) y en arrepentimiento (1,89 frente a 1,90), es un caso útil para analizar cuándo el RL no aporta mejoras medibles.
- Validación de la viabilidad de adaptadores LoRA en entornos de bajos recursos: al tratarse de un LoRA sobre un modelo de 0,8B, es un ejemplo práctico de ajuste eficiente asequible en GPU de consumo.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Modelo | Precisión en el conjunto de test | Arrepentimiento (menor es mejor) | Beneficio mensual en el simulador | Transacciones reales de tarjeta · reducción de pérdidas |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 30,4 % | 2,67 | — | — |
| Aprendizaje supervisado | 78,1 % | 1,89 | — | — |
| Aprendizaje por refuerzo (este modelo) | 77,5 % | 1,90 | 12,21 millones de wones | 72 % (146/177) |

El autor señala que se trata de un primer experimento, que la operación de empresa se evalúa sobre una media de dos meses no vistos (muestra pequeña) y que el modelo final todavía queda por debajo de la política maestra entrenada con PPO en el simulador. No se publican resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

Las estimaciones de VRAM se derivan del tamaño del modelo base (0,8B parámetros) y deben considerarse orientativas, ya que el autor no publica requisitos oficiales.

- Inferencia en fp16/bf16: aproximadamente 1,6 GB solo para los pesos, con un total estimado de 3-4 GB de VRAM incluyendo el contexto y el runtime.
- Inferencia en int8: aproximadamente 0,8 GB de pesos, con un total estimado de 2 GB de VRAM.
- Inferencia en int4: aproximadamente 0,4 GB de pesos, con un total estimado de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque estas dos últimas serían sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo con 4 GB o más de VRAM, e incluso es viable su ejecución en CPU.
- Despliegue: el autor documenta el uso con `transformers` y `peft` (`PeftModel.from_pretrained`). La compatibilidad con vLLM, TGI, llama.cpp u Ollama tras fusionar el adaptador y convertir los pesos no se confirma en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos de terceros directamente comparables (mismo dominio de decisión de empresa o mismo pipeline). La comparación más informativa es interna al propio proyecto:

| Modelo | Parámetros | Contexto | Precisión en test | Arrepentimiento | Licencia |
|---|---|---|---|---|---|
| connectailab-rl-kodari-v1 (RL) | 0,8B base + LoRA | no disponible | 77,5 % | 1,90 | apache-2.0 |
| Variante de aprendizaje supervisado del mismo pipeline | 0,8B base + LoRA | no disponible | 78,1 % | 1,89 | no disponible |
| Qwen/Qwen3.5-0.8B base (sin entrenar) | 0,8B | no disponible | 30,4 % | 2,67 | no disponible |
| Política maestra (PPO en el simulador) | no disponible | no disponible | no disponible | mejor que el modelo final | no disponible |

## Limitaciones y advertencias

- Modelo de investigación y educación sobre un simulador sintético: el autor indica explícitamente que debe revalidarse con los registros reales de una empresa antes de cualquier uso de gestión.
- Muestra de evaluación pequeña: la operación de empresa se mide sobre una media de dos meses no vistos, por lo que las métricas son poco robustas.
- Rendimiento por debajo de la política maestra: la política PPO usada como profesora en el simulador sigue siendo superior al modelo final.
- El RL no supera al aprendizaje supervisado: la variante supervisada obtiene mejor precisión (78,1 % frente a 77,5 %) y mejor arrepentimiento (1,89 frente a 1,90), lo que cuestiona el beneficio de la fase de refuerzo en este experimento.
- Alcance funcional muy restringido: solo produce una letra entre las opciones dadas; no genera explicaciones, texto libre ni razonamiento multi-paso.
- Idioma único: solo coreano, sin soporte multilingüe declarado.
- Riesgo de salida inválida: aunque el prompt exige una única letra sin explicación, no se documenta un mecanismo que garantice que la salida sea siempre una opción válida; conviene validar la respuesta en producción.
- Sesgo de datos sintéticos: las decisiones provienen de un simulador con una distribución de empresa "general" ajustada a datos públicos, que puede no representar sectores o contextos reales.
- Alucinación: al estar limitado a la selección de letras, el riesgo de fabricación de contenido es bajo, pero persiste el riesgo de elegir una opción incorrecta sin señal de incertidumbre más allá de la probabilidad.
- Licencia: el adaptador se distribuye bajo apache-2.0, pero las condiciones de uso comercial del modelo base Qwen/Qwen3.5-0.8B no se especifican en la información disponible y deben verificarse antes de un uso en producción.
- Sin métricas de benchmarks estándar: no se publican resultados de MMLU, HumanEval, GSM8K ni similares, lo que impide situarlo frente a otros modelos de lenguaje de 0,8B.
- Descargas y likes nulos en el momento de la consulta (0 descargas, 0 likes), lo que indica un modelo recién publicado y sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kymbms/connectailab-rl-kodari-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
