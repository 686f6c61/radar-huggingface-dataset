# ieum3355/connectailab-rl-ieum-v1

## Resumen

`connectailab-rl-ieum-v1` es un adaptador LoRA de aprendizaje por refuerzo (GRPO) sobre el modelo base `Qwen/Qwen3.5-0.8B`, publicado por el usuario ieum3355 en el marco del proyecto CONNECT AI LAB × AI CITY BUILDERS. No es un modelo de propósito general: es un modelo de toma de decisiones empresariales entrenado para leer un estado de compania, una pregunta y una lista de opciones, y devolver exactamente una letra correspondiente a la opcion elegida. La probabilidad asignada a cada letra funciona como distribucion de preferencia sobre las alternativas.

El modelo se entrena en el simulador CONNECT TYCOON, un entorno tipo Gymnasium donde una pequena politica PPO aprende a operar una empresa durante miles de meses y actua como "profesor" generando datos de decision. Sobre esa base se aplica aprendizaje supervisado y despues GRPO, con normalizacion de ventajas por grupo y una penalizacion KL contra el modelo de partida para evitar el colapso de la politica.

Es relevante ahora por dos motivos: demuestra un pipeline completo de RL aplicado a un modelo de lenguaje pequeno (0,8B parametros) con recursos modestos, y publica resultados medidos en un entorno simulado (precison en test, regret, beneficio mensual simulado y tasa de reduccion de perdidas en tarjetas reales). Con 24 descargas y 0 likes, es un artefacto de investigacion y educacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `Qwen/Qwen3.5-0.8B`, un transformer decoder-only de 0,8 mil millones de parametros. El adaptador se carga con `peft.PeftModel` sobre el modelo base y se usa en inferencia con `transformers`. La tarea no es generacion libre: el modelo recibe un mensaje de sistema con instrucciones estrictas de seleccion de una unica letra y un mensaje de usuario con un JSON `{state, question, options}`, y debe emitir un unico caracter de etiqueta.

El entrenamiento sigue cuatro fases descritas en la model card: (1) una politica pequena entrenada con PPO en el simulador CONNECT TYCOON opera la empresa durante miles de meses y actua como profesor; (2) se construye un "cuaderno de problemas" reejecutando cada mes con cada opcion alternativa para puntuar cada eleccion; (3) aprendizaje supervisado sobre la opcion de mayor puntuacion; (4) GRPO con normalizacion de ventajas por grupo y termino KL contra el modelo de partida. Los datos provienen de la distribucion de empresas `general`, con 4.082 problemas de entrenamiento, 832 de validacion y 840 de test.

## Capacidades

- Toma de decisiones de seleccion unica: dado un estado, una pregunta y una lista de opciones etiquetadas, devuelve exactamente una letra.
- Estimacion de distribucion de preferencia: la probabilidad de cada letra actua como probabilidad de eleccion y el maximo como medida de confianza.
- Razonamiento de negocio simulado: decisiones sobre operacion de empresa (beneficio, satisfaccion, incidentes) aprendidas en el simulador CONNECT TYCOON.
- Robustez ante inyeccion de instrucciones en el estado: el prompt de sistema indica tratar el texto de `state` como datos, no como instrucciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo emite una unica letra por consulta.
- Capacidades multilingues: limitadas al coreano (ko) segun la model card.
- Capacidades especiales: no dispone de modo thinking, vision ni audio.

## Casos de uso

- Evaluacion de politicas de decision en simuladores: usar el modelo como agente de seleccion dentro de entornos Gymnasium o CONNECT TYCOON para comparar su politica con la del profesor PPO y medir regret.
- Investigacion educativa en RLHF/GRPO: servir de ejemplo reproducible de pipeline completo (PPO profesor, aprendizaje supervisado, GRPO con KL) sobre un modelo de 0,8B, con cuaderno de Colab incluido.
- Clasificacion de decisiones con opciones cerradas: en escenarios donde el conjunto de acciones esta predefinido y etiquetado, el modelo devuelve la etiqueta sin generar texto libre, lo que simplifica el parseo.
- Analisis de aversion al riesgo: la model card documenta que la variante con peso de riesgo x3 reduce las perdidas por fraude un 60% manteniendo el beneficio, lo que permite estudiar como la ponderacion de valores altera la politica.
- Prototipado de asistentes de decision internos: como paso previo a un sistema de recomendacion de acciones empresariales, con validacion posterior sobre los registros reales de la empresa.
- Docencia y divulgacion: el proyecto incluye cursos gratuitos de RL y un curso de pago en AI CITY BUILDERS, y el modelo sirve como material practico para explicar GRPO y LoRA.

## Benchmarks y rendimiento

| Modelo | Precision en test | Regret (menor es mejor) | Beneficio mensual simulado | Reduccion de perdidas en tarjetas reales |
|---|---|---|---|---|
| Qwen sin entrenar | 31,3% | 3,22 | no disponible | no disponible |
| Aprendizaje supervisado | 75,8% | 2,41 | no disponible | no disponible |
| Aprendizaje por refuerzo (este modelo) | 75,2% | 2,18 | 684 manwon | 44% (169/177) |

El autor advierte que el beneficio simulado corresponde a la media de dos meses no vistos, con muestra pequena, y que la politica del profesor PPO sigue por encima. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 0,8B parametros en el modelo base, en fp16 rondaria 1,6 GB de pesos mas el adaptador LoRA, y en cuantizacion de 4 bits podria situarse por debajo de 1 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer con 4-8 GB de VRAM deberia poder alojar el modelo base en fp16 o cuantizado.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base, aunque no hay confirmacion del autor.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-ieum-v1 | 0,8B + LoRA | no disponible | RL (GRPO) para seleccion de opciones en simulador de negocio | Apache 2.0 | Hugging Face (24 descargas) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | LLM generalista | no disponible en la informacion | Hugging Face |
| Politica PPO del simulador CONNECT TYCOON | no disponible (politica pequena) | no disponible | RL clasico (PPO) sobre el simulador | no disponible | Referenciada en el repositorio del proyecto |

No se dispone de datos publicados de benchmarks estandar que permitan comparar este adaptador con otros modelos de decision de la misma categoria.

## Limitaciones y advertencias

- Entrenado exclusivamente en coreano; el rendimiento en castellano u otros idiomas no esta evaluado.
- El modelo solo emite una letra de opcion; no genera explicaciones ni texto libre, lo que limita su uso fuera de tareas de seleccion cerrada.
- Entrenado sobre un simulador sintetico de empresa (`general`); el autor recomienda revalidar con los registros reales de cada empresa antes de cualquier uso en decisiones de negocio.
- Muestra de evaluacion pequena (dos meses no vistos), segun advierte el propio autor.
- Riesgo de alucinacion y de seleccion erronea cuando el estado o las opciones se salen de la distribucion de entrenamiento.
- Sensible a inyeccion de instrucciones a traves del campo `state`; el prompt de sistema mitiga pero no elimina el riesgo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es de investigacion y educacion y no esta validado para produccion.
- El proyecto "Connect AI" se describe como en fase de pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ieum3355/connectailab-rl-ieum-v1
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
