# kyoungsim/connectailab-rl-kongi-v2

## Resumen

connectailab-rl-kongi-v2 es un adaptador LoRA entrenado sobre el modelo base Qwen/Qwen3.5-0.8B por el autor kyoungsim, vinculado al laboratorio CONNECT AI LAB y a AI CITY BUILDERS. No es un modelo conversacional generalista: es un modelo de toma de decisiones que recibe un estado de situacion, una pregunta y un conjunto de opciones etiquetadas, y devuelve unicamente la letra de la opcion seleccionada. El pipeline declarado en Hugging Face es reinforcement-learning, y los tags confirman el uso de GRPO, PPO en el simulador y aprendizaje supervisado como fases previas.

El modelo se entrena sobre datos generados por el simulador CONNECT TYCOON, un juego de gestion empresarial en el que una politica pequena aprende a operar una compania durante miles de meses. Esa politica actua como profesor: para cada decision, se generan variantes de las opciones y se puntua el resultado economico de cada una, produciendo un conjunto de problemas de eleccion multiple con etiqueta de calidad. El adaptador aprende a imitar la mejor opcion y despues se afina con GRPO usando la puntuacion del simulador como recompensa.

La relevancia es acotada pero clara: demuestra un pipeline completo de RL sobre un modelo de 0,8 mil millones de parametros para una tarea de decision estructurada, con licencia Apache 2.0 y pesos publicados como adaptador PEFT. El modelo esta pensado para investigacion y educacion, no para produccion real, y el propio autor advierte que debe revalidarse con datos de la empresa concreta antes de usarse en decisiones de negocio reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8 mil millones en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors del adaptador) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros. El entrenamiento se organiza en cuatro fases descritas en la model card: primero, una politica pequena aprende a operar el simulador CONNECT TYCOON mediante PPO durante miles de meses simulados; segundo, esa politica genera un "cuaderno de problemas" en el que, para cada decision, se alteran las opciones y se reejecuta el mes completo para puntuar cada alternativa; tercero, se realiza aprendizaje supervisado sobre la opcion de mayor puntuacion; cuarto, se aplica GRPO (Group Relative Policy Optimization) con normalizacion de ventajas por grupo y una penalizacion KL contra el modelo de partida.

El conjunto de datos declarado corresponde a la distribucion `general` (empresa general ajustada a datos publicos) con 4.082 problemas de entrenamiento, 832 de validacion y 840 de test. La innovacion tecnica principal no esta en la arquitectura del modelo base, sino en el pipeline de generacion de datos y en el uso de la puntuacion del simulador como senal de recompensa para un modelo de lenguaje que solo emite una letra como salida.

## Capacidades

- Seleccion de una unica opcion entre varias etiquetadas (A, B, C...) a partir de un estado, una pregunta y una lista de opciones en formato JSON.
- Salida restringida a una letra, sin explicacion, lo que facilita el parseo y la integracion en bucles de decision automatizados.
- Razonamiento de decision en el dominio del simulador de gestion empresarial CONNECT TYCOON.
- Interpretacion de estados estructurados en JSON con campos `state`, `question` y `options`.
- Capacidad multilingue limitada: el modelo esta declarado solo para coreano.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion en RL aplicado a modelos de lenguaje: sirve como caso de estudio reproducible de un pipeline PPO -> SFT -> GRPO sobre un modelo pequeno, con datos y codigo publicos en el repositorio connect-tycoon.
- Docencia y formacion: el notebook de Colab y los materiales de CONNECT AI LAB permiten a estudiantes entrenar y evaluar el adaptador paso a paso.
- Simulacion de decisiones empresariales en entornos de juego: el modelo puede integrarse como agente de decision dentro de CONNECT TYCOON para operar una empresa simulada mes a mes.
- Evaluacion comparativa de tecnicas de RL: permite medir el efecto de SFT frente a GRPO sobre la misma tarea y el mismo modelo base, con metricas de acierto y regret.
- Prototipado de sistemas de eleccion multiple restringida: el formato de salida de una sola letra es directamente reutilizable en pipelines donde se necesita una decision discreta y parseable.
- Generacion de datos sinteticos de decision: el esquema de problemas (estado, pregunta, opciones, etiqueta) puede reutilizarse para construir datasets de decision en otros dominios.

## Benchmarks y rendimiento

| Modelo | Acierto en test | Regret (menor es mejor) | Beneficio mensual en simulador | Reduccion de perdidas en transacciones reales con tarjeta |
|---|---|---|---|---|
| Qwen base (sin entrenar) | 35,4% | 2,74 | no disponible | no disponible |
| Aprendizaje supervisado (SFT) | 73,5% | 2,23 | no disponible | no disponible |
| Refuerzo (GRPO) | 68,5% | 2,31 | 2,54 millones de wones | 37% (91/177) |

Los resultados son del primer experimento publicado por el autor. La evaluacion de operacion empresarial corresponde a la media de dos meses no vistos, con muestra pequena, y el propio autor senala que el modelo sigue por debajo de la politica profesora entrenada con PPO en el simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo base de 0,8 mil millones de parametros mas un adaptador LoRA, la inferencia en precision completa requiere aproximadamente 1,6-2 GB; en cuantizacion de 8 bits baja a alrededor de 1 GB y en 4 bits a unos 0,5-0,7 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida pueden ejecutar el modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card), llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, y vLLM o TGI si se sirve el modelo fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-kongi-v2 | 0,8 B (base) + LoRA | no disponible | Decision por eleccion multiple con RL (GRPO) | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3.5-0.8B | 0,8 B | no disponible | LLM generalista | no disponible en la informacion | Hugging Face |
| Politica profesora PPO de CONNECT TYCOON | no disponible | no disponible | RL clasico sobre simulador | no disponible | Repositorio connect-tycoon |

No se dispone de datos publicos de benchmarks de otros adaptadores de decision comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para el dominio del simulador CONNECT TYCOON; fuera de ese dominio su comportamiento no esta validado.
- Solo se declara soporte de coreano; el rendimiento en castellano u otros idiomas no esta documentado.
- La muestra de evaluacion de operacion empresarial es de dos meses no vistos, lo que el propio autor califica de muestra pequena.
- El modelo queda por debajo de la politica profesora PPO del simulador en rendimiento de operacion.
- Riesgo de alucinacion y de seleccion de opciones invalidas fuera de distribucion; el formato de salida de una sola letra no permite detectar incertidumbre sin analizar las probabilidades.
- El autor advierte explicitamente que es un modelo de investigacion y educacion y que debe revalidarse con los datos de la empresa concreta antes de usarse en decisiones de negocio reales.
- La licencia Apache 2.0 permite uso comercial del adaptador, pero debe verificarse por separado la licencia del modelo base Qwen/Qwen3.5-0.8B, que no se detalla en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyoungsim/connectailab-rl-kongi-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
