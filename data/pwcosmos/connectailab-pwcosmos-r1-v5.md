# pwcosmos/connectailab-pwcosmos-r1-v5

## Resumen

`connectailab-pwcosmos-r1-v5` es un adaptador LoRA de tipo PEFT publicado por el usuario pwcosmos en el marco del laboratorio CONNECT AI LAB (en colaboración con AI CITY BUILDERS). No es un modelo de lenguaje generalista, sino un modelo de decisión entrenado por refuerzo: recibe un estado de situación, una pregunta y un conjunto de opciones etiquetadas, y devuelve únicamente la letra de la opción elegida. Está construido sobre el modelo base `Qwen/Qwen3.5-0.8B` y está especializado en el simulador de gestión empresarial CONNECT TYCOON.

El interés técnico del modelo reside en su pipeline de entrenamiento: primero se entrena una política pequeña con PPO dentro del simulador (que actúa como profesor), después se generan etiquetas de alta calidad evaluando cada opción mediante rollouts completos del mes simulado, se aplica aprendizaje supervisado sobre la mejor opción y finalmente se refina con GRPO (Group Relative Policy Optimization) usando normalización por grupo de ventajas y una penalización KL contra el modelo de partida. Es un ejemplo compacto y reproducible de cómo convertir un modelo de 0,8 mil millones de parámetros en un agente de decisión mediante RL con recompensa procedente de un entorno.

Su relevancia es acotada pero clara: demuestra que un modelo muy pequeño puede alcanzar una precisión de decisión notable (78,7 % en el conjunto de test) en una tarea de elección múltiple estructurada, con licencia Apache 2.0 y un coste de cómputo mínimo. Está pensado como material de investigación y formación, no como sistema de producción para decisiones empresariales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors del adaptador; la cuantización depende del modelo base) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de 0,8 mil millones de parámetros. La tarea está formulada como clasificación sobre un conjunto cerrado de opciones: la entrada es un JSON con `state`, `question` y `options` (cada una con `label`, `key` y `description`), y la salida es una única letra correspondiente a la etiqueta elegida. Las probabilidades asociadas a cada letra funcionan como distribución de confianza sobre las alternativas.

El entrenamiento sigue cuatro fases descritas por el autor: (1) entrenamiento con PPO de una política pequeña dentro del simulador CONNECT TYCOON, que opera la empresa durante miles de meses simulados y actúa como profesor; (2) generación de un corpus de problemas evaluando, para cada decisión, cada opción mediante un rollout completo del mes, asignando una puntuación a cada alternativa; (3) aprendizaje supervisado sobre la opción de mayor puntuación; y (4) refinamiento con GRPO, agrupando todas las opciones de una misma decisión, normalizando las ventajas dentro del grupo y aplicando una penalización KL respecto al modelo de partida. El conjunto de datos consta de 4.082 problemas de entrenamiento, 832 de validación y 840 de test, sobre una distribución de empresas de tipo `general` ajustada con datos públicos.

## Capacidades

- Toma de decisiones de elección múltiple en entornos simulados de gestión empresarial: devuelve una única letra de opción, sin explicación.
- Calibración de incertidumbre mediante la distribución de probabilidad sobre las letras de las opciones.
- Robustez frente a inyección de instrucciones en el campo `state`: el prompt de sistema indica explícitamente tratar el texto del estado como datos y no como instrucciones.
- Razonamiento de un solo paso sobre un estado estructurado en JSON; no se documenta razonamiento multi-paso ni cadenas de pensamiento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes autónomos más allá del bucle de decisión individual.
- Capacidad multilingüe limitada al coreano según la etiqueta de idioma del repositorio.
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Investigación en RL aplicado a LLM: sirve como caso de estudio reproducible del pipeline PPO → supervisado → GRPO, con notebook de Colab público y datos de simulación, adecuado para cursos y experimentos docentes.
- Evaluación de políticas de decisión en simuladores: el modelo puede integrarse como agente jugador dentro de CONNECT TYCOON para comparar su rendimiento con el de la política PPO original y con el modelo base sin ajustar.
- Prototipado de asistentes de decisión estructurada: en dominios donde las alternativas están predefinidas y etiquetadas, el modelo devuelve una elección limpia y parseable, lo que simplifica la integración en pipelines automatizados.
- Generación de datos sintéticos de decisión: las decisiones del modelo, junto con sus probabilidades por opción, pueden usarse para etiquetar nuevos escenarios o para análisis de sensibilidad en entornos simulados.
- Formación y divulgación: el repositorio incluye vídeos, curso de RL y material didáctico, por lo que el modelo sirve como ejemplo práctico en programas de formación sobre reinforcement learning con modelos pequeños.
- Experimentación con LoRA y PEFT: al ser un adaptador de pequeño tamaño sobre un modelo de 0,8 B, es adecuado para probar flujos de carga, fusión y cuantización en hardware modesto.
- Análisis de calibración: la salida probabilística por opción permite estudiar la relación entre confianza del modelo y acierto en decisiones simuladas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Tasa de acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual en simulador | Reducción de pérdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen sin entrenar | 31,1 % | 2,73 | no disponible | no disponible |
| Aprendizaje supervisado | 80,8 % | 1,86 | no disponible | no disponible |
| Aprendizaje por refuerzo (GRPO) | 78,7 % | 1,80 | 7,65 millones de wones | 75 % (154/177) |

El autor advierte que la métrica de operación de empresa corresponde a la media de dos meses no vistos previamente, por lo que el tamaño de muestra es reducido, y que el modelo todavía queda por debajo de la política profesora entrenada con PPO en el simulador. No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8 B en fp16 ocupa aproximadamente 1,6 GB de pesos; en cuantización de 8 bits, alrededor de 0,8 GB; en 4 bits, alrededor de 0,4 GB. El adaptador LoRA añade una cantidad marginal no especificada.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el modelo base en fp16; una RTX 3060, RTX 4060 o superior permite trabajar con comodidad. Para entrenamiento o evaluación por lotes, se recomienda una RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas, e incluso en sistemas con GPU integrada mediante cuantización agresiva.
- Opciones de despliegue: carga mediante `transformers` + `peft` (flujo documentado por el autor); el adaptador puede fusionarse con el modelo base y exportarse a GGUF para su uso con llama.cpp u Ollama; también es compatible con vLLM y TGI una vez fusionado el adaptador.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia muy baja en GPU consumer, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-pwcosmos-r1-v5 | 0,8 B (LoRA) | no disponible | Decisión de elección múltiple en simulador | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | Lenguaje general | no disponible en la información | Hugging Face |
| Política PPO del simulador CONNECT TYCOON (profesora) | no disponible | no disponible | Decisión en simulador | no disponible | no disponible públicamente |

No se dispone de información sobre otros adaptadores de decisión comparables en la misma categoría. El modelo base sin ajustar obtiene un 31,1 % de acierto frente al 78,7 % del adaptador, lo que cuantifica la ganancia del entrenamiento por refuerzo en esta tarea concreta.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre un simulador sintético de empresas; sus decisiones no están validadas para gestión empresarial real. El propio autor recomienda revalidar con los registros de la empresa antes de cualquier uso real.
- La evaluación de operación se basa en dos meses no vistos, una muestra muy pequeña; los resultados deben interpretarse como preliminares.
- El modelo queda por debajo de la política profesora entrenada con PPO en el simulador, según reconoce el autor.
- El idioma de trabajo es el coreano; no se documenta rendimiento en castellano ni en otros idiomas.
- La salida es una única letra sin explicación, lo que limita la auditabilidad de las decisiones.
- Riesgo de alucinación: al tratarse de un clasificador sobre opciones cerradas, el riesgo principal es elegir una opción válida pero incorrecta, no inventar contenido; aun así, el modelo podría emitir una letra fuera del conjunto si la entrada se sale de la distribución de entrenamiento.
- Sesgos: la distribución de empresas del simulador es de tipo `general` y está ajustada con datos públicos; pueden existir sesgos derivados de esa elección.
- Licencia Apache 2.0: permite uso comercial, pero la licencia del modelo base Qwen3.5-0.8B debe verificarse por separado antes de su explotación comercial.
- El repositorio tiene un tamaño de 0,0 GB reportado y 25 descargas, lo que sugiere que los pesos del adaptador pueden ser muy pequeños o que el repositorio no está completamente poblado; conviene verificar la integridad de los archivos antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pwcosmos/connectailab-pwcosmos-r1-v5
- Archivos del repositorio: https://huggingface.co/pwcosmos/connectailab-pwcosmos-r1-v5/tree/main
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
