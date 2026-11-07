# pwcosmos/connectailab-pwcosmos-r1-v6

## Resumen

`pwcosmos/connectailab-pwcosmos-r1-v6` es un adaptador LoRA de aprendizaje por refuerzo (GRPO) construido sobre el modelo base `Qwen/Qwen3.5-0.8B`. Lo desarrolla el autor `pwcosmos` en el marco de la colaboración entre CONNECT AI LAB y AI CITY BUILDERS. El modelo no es un asistente conversacional general: es un modelo de decisión que recibe una situación, una pregunta y una lista de opciones, y devuelve exclusivamente la letra de la opción elegida. Su dominio de aplicación es la simulación de gestión empresarial (el simulador Connect Tycoon), donde un agente autónomo debe tomar decisiones mes a mes sobre una compañía sintética.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un experimento de investigación y educación sobre un simulador sintético, con cero descargas y cero likes en el momento de la consulta, y con un tamaño de repositorio de 0.0 GB (lo que sugiere que los pesos del adaptador no están efectivamente alojados o son de tamaño despreciable). El propio autor advierte que el modelo queda por debajo de su política profesora (un agente pequeño entrenado con PPO en el simulador) y que debe revalidarse con datos reales antes de cualquier uso en producción.

El pipeline declarado es `reinforcement-learning`, la librería es `peft` y el idioma declarado es coreano (`ko`). La licencia es Apache 2.0. No se dispone de información sobre arquitectura interna, longitud de contexto ni cuantizaciones más allá de lo que aporta el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3.5; detalles internos del base no disponibles |
| Parametros totales | No disponible (adaptador LoRA; el base se denomina 0.8B en el identificador, cifra exacta no confirmada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (`ko`) declarado; el prompt de sistema y el esquema de entrada están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de la familia Qwen. La innovación no está en la arquitectura del base sino en el procedimiento de entrenamiento en cuatro fases descrito en la model card: (1) una política pequeña se entrena con PPO durante miles de meses simulados en Connect Tycoon y actúa como profesora; (2) se genera un "cuaderno de problemas" re-ejecutando cada mes con cada opción alternativa para puntuar cada elección; (3) aprendizaje supervisado sobre la opción de mayor puntuación; (4) refuerzo con GRPO, normalizando ventajas por grupo de opciones y añadiendo una penalización KL contra el modelo de partida.

El conjunto de datos se compone de tareas de decisión del simulador con distribución de empresa `general` (ajustada a datos públicos), con 4.082 problemas de entrenamiento, 832 de validación y 840 de prueba. El formato de interacción es estricto: un prompt de sistema en inglés que ordena tratar el texto del estado como datos y no como instrucciones, una entrada de usuario en JSON con `state`, `question` y `options`, y una salida de un único carácter correspondiente a la etiqueta de la opción.

## Capacidades

- Clasificación de decisión entre opciones discretas: devuelve una única letra de opción, sin explicación.
- Extracción de probabilidad por opción: según la model card, la probabilidad del token de cada letra funciona como probabilidad de elección y el máximo como medida de confianza.
- Robustez ante inyección de instrucciones en el campo `state`: el prompt de sistema indica explícitamente tratar ese texto como datos.
- Razonamiento de decisión multi-paso implícito: cada decisión se evalúa por su efecto simulado a lo largo de un mes completo, no por su plausibilidad inmediata.
- No se documentan capacidades de generación libre, código, matemáticas, visión, audio, tool calling ni agentes generales.
- Multilingüe: solo coreano declarado; el esquema de prompt está en inglés.

## Casos de uso

- Simulación de gestión empresarial: el modelo actúa como política de decisión de un agente que opera una compañía sintética mes a mes en Connect Tycoon, eligiendo entre opciones predefinidas de inversión, contratación o riesgo.
- Investigación en RL aplicado a decisiones: sirve como caso de estudio reproducible de un pipeline PPO (profesor) → supervisado → GRPO (alumno) sobre un simulador propio, con volcado de problemas y puntuaciones por opción.
- Docencia de aprendizaje por refuerzo: el repositorio incluye un notebook de Colab para reentrenar el modelo, lo que permite usarlo como material práctico en cursos de RL.
- Evaluación de robustez ante inyección de prompts: el diseño con `state` como dato no confiable permite probar defensas frente a instrucciones embebidas en entradas estructuradas.
- Prototipado de asistentes de decisión acotados: en dominios donde las opciones están cerradas y etiquetadas, el patrón entrada JSON / salida de letra puede reutilizarse con datos propios.
- Análisis de calibración: al exponer probabilidades por opción, permite estudiar la relación entre confianza del modelo y acierto en decisiones secuenciales.

## Benchmarks y rendimiento

Datos publicados en la model card (el autor advierte que la muestra de operación real es de dos meses y es pequeña):

| Modelo | Acierto en test | Arrepentimiento (menor es mejor) | Beneficio mensual simulado | Reducción de pérdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen antes del entrenamiento | 30,8 % | 2,54 | No disponible | No disponible |
| Aprendizaje supervisado | 81,3 % | 1,80 | No disponible | No disponible |
| Refuerzo (GRPO) | 80,7 % | 1,72 | 8,99 millones de wones | 72 % (147/177) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA sobre un base de aproximadamente 0,8B parámetros, la inferencia es viable en GPU de consumo; la VRAM concreta no está documentada.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del base, una RTX 3060 o superior debería ser suficiente en FP16, pero es una estimación, no un dato del autor.
- Despliegue: la model card solo documenta `transformers` + `peft`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Advertencia: el repositorio figura con tamaño 0.0 GB, por lo que la disponibilidad efectiva de los pesos del adaptador debe verificarse antes de planificar el despliegue.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-pwcosmos-r1-v6 | Adaptador sobre base ~0,8B | No disponible | 80,7 % de acierto en su test propio; 1,72 de arrepentimiento | Apache 2.0 | Repositorio de 0.0 GB, 0 descargas |
| connectailab-pwcosmos-r1-v5 | No disponible | No disponible | No disponible | No disponible | Publicado por el mismo autor |
| connectailab-rl-pwcosmos-v1 | No disponible | No disponible | No disponible | No disponible | Publicado por el mismo autor |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible | 30,8 % de acierto en el test del simulador antes de entrenar | No disponible en esta ficha | Modelo base público |

No se dispone de comparaciones con modelos de decisión de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El propio autor indica que el modelo está por debajo de su política profesora entrenada con PPO en el simulador.
- Entrenado y evaluado sobre un simulador sintético; la validez fuera de ese dominio no está demostrada.
- La evaluación de operación real se basa en dos meses y el autor la califica de muestra pequeña.
- El modelo devuelve solo una letra: no explica su razonamiento, lo que dificulta la auditoría de decisiones.
- Idioma declarado únicamente coreano; el prompt de sistema y el esquema de entrada están en inglés, lo que puede degradar el comportamiento en otros idiomas.
- Riesgo de alucinación no evaluado en la información disponible; el formato cerrado de salida reduce, pero no elimina, respuestas fuera de las opciones.
- Sesgos: no documentados; la distribución de empresas se ajustó a datos públicos, pero no se detalla su composición.
- Licencia Apache 2.0 permite uso comercial, pero el autor recomienda revalidar con los registros de la empresa concreta antes de cualquier decisión real.
- El tamaño del repositorio (0.0 GB) y la ausencia de descargas sugieren que los pesos pueden no estar accesibles; verificar antes de integrar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pwcosmos/connectailab-pwcosmos-r1-v6
- Versión anterior v5: https://huggingface.co/pwcosmos/connectailab-pwcosmos-r1-v5
- Versión anterior v1: https://huggingface.co/pwcosmos/connectailab-rl-pwcosmos-v1
- Repositorio Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para reentrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (ezerai): https://www.ezerai.xyz
