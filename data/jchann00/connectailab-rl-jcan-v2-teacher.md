# jchann00/connectailab-rl-jcan-v2-teacher

## Resumen

connectailab-rl-jcan-v2-teacher es una politica de aprendizaje por refuerzo (RL) desarrollada por el usuario jchann00 dentro del proyecto educativo Connect AI Lab. No es un modelo de lenguaje generativo, sino un agente de toma de decisiones ("cerebro" de empresa o "corteza prefrontal") que opera una compania simulada durante un mes de 20 dias laborables en el entorno CONNECT TYCOON. Su funcion es elegir acciones sobre gestion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad, devolviendo cada decision en el formato estructurado JEV (compatible con typesafe/jev-1.13).

El modelo se entrena en dos fases: primero imita a un "presidente por reglas" mediante aprendizaje supervisado y despues ajusta su politica con PPO (Proximal Policy Optimization) usando como recompensa el valor de la empresa (beneficio, satisfaccion del cliente y aversion al riesgo, ponderados a 1.0 cada uno). La model card reporta una mejora sustancial frente a la linea base de reglas en el simulador: el beneficio medio mensual pasa de 3,24 millones a 11,11 millones de wones, la satisfaccion sube del 79 % al 95 % y los incidentes de riesgo bajan de 7,8 a 2,8.

Es relevante como ejemplo didactico de como combinar aprendizaje por imitacion y RL con recompensas multiobjetivo para automatizar decisiones de negocio en un entorno controlado. Se distribuye bajo licencia Apache 2.0, esta orientado al idioma coreano y se integra como libreria numpy, sin que la model card detalle el tamano de parametros ni la arquitectura interna de la red de politica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de aprendizaje por refuerzo (PPO) entrenada tras imitacion supervisada; topologia de red no detallada. La model card usa la metafora de "corteza prefrontal" (전전두엽) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (agente de decision por estado, no modelo de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (library_name: numpy) |

## Arquitectura y entrenamiento

La model card describe un agente de decision que actua como "presidente" de una empresa simulada. El entrenamiento consta de dos etapas: (1) aprendizaje supervisado imitando a una politica de referencia basada en reglas ("presidente por reglas") y (2) ajuste fino con PPO, donde la recompensa procede del valor de la compania definido como `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfaccion del cliente y riesgo, con peso 1.0 cada uno). La politica resultante devuelve, para cada decision, una distribucion de probabilidad sobre un conjunto de acciones discretas (por ejemplo `full`, `partial`, `deny`, `human` en el caso de reembolsos), junto con un nivel de confianza y una etiqueta de origen ("강화학습 정책", es decir, "politica de aprendizaje por refuerzo").

No se especifican en la informacion disponible el numero de tokens, la composicion del dataset, la arquitectura exacta de la red (capas, dimensiones) ni el algoritmo de RLHF/DPO. El nombre del notebook de entrenamiento asociado (`rl_decision_model_qwen_colab.ipynb`) sugiere una posible base Qwen, pero la model card no lo confirma de forma explicita, por lo que no se puede dar por seguro. La innovacion tecnica destacable es la integracion nativa del formato JEV (`typesafe/jev-1.13`) como interfaz de entrada y salida, junto con la gestion multiobjetivo de recompensas (beneficio, satisfaccion y riesgo) dentro del simulador CONNECT TYCOON.

## Capacidades

- Toma de decisiones discretas sobre gestion empresarial: asignacion de personal, pedidos de inventario, campanas de marketing, atencion al cliente, gestion de reembolsos y seguridad.
- Salida estructurada en formato JEV (`typesafe/jev-1.13`), con campos de tipo (`choice`), eleccion, distribucion de probabilidades, confianza y motivo.
- Razonamiento multiobjetivo: pondera simultaneamente beneficio, satisfaccion del cliente y aversion al riesgo.
- Operacion de un ciclo completo de empresa (20 dias laborables) con decisiones secuenciales dependientes del estado del simulador.
- Gestion de casos concretos como reembolsos con deteccion de fraude (`fraud_score`) y clasificacion por tipo de cliente (`tier`: "단골", es decir, cliente habitual).
- Capacidades multilingues: coreano unicamente.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling generico ni razonamiento agentico multi-paso fuera del entorno del simulador.

## Casos de uso

- Simulacion educativa de gestion empresarial: el modelo actua como "cerebro" de la empresa dentro de CONNECT TYCOON, permitiendo a estudiantes de RL observar como una politica entrenada supera a una linea base de reglas en beneficio y satisfaccion.
- Investigacion en recompensas multiobjetivo: sirve como banco de pruebas para estudiar el equilibrio entre beneficio, satisfaccion del cliente y riesgo en entornos con senales de recompensa ponderadas.
- Ensenanza de pipelines de RL (imitacion + PPO): el par aprendizaje supervisado seguido de PPO es un patron didactico reutilizable para cursos de deep reinforcement learning.
- Benchmarking de politicas de decision: al publicarse resultados comparativos frente al "presidente por reglas" (11,11 M frente a 3,24 M de wones), puede usarse como referencia de mejora en entornos de simulacion empresarial.
- Desarrollo de agentes de politica de reembolso: el ejemplo de decision de reembolso con `fraud_score` ilustra como un agente puede elegir entre reembolso completo, parcial, rechazo o revision humana en funcion del riesgo.
- Integracion en videojuegos o gamificacion educativa: mediante `connect-tycoon play --brain hf:jchann00/connectailab-rl-jcan-v2-teacher` se puede desplegar el agente como oponente o companero en una partida.
- Prototipado de interfaces JEV: al responder en formato JEV, el modelo puede emplearse para probar herramientas que consumen respuestas estructuradas en vez de texto libre.

## Benchmarks y rendimiento

La model card proporciona una comparacion directa, dentro del simulador, entre el "presidente por reglas" y el modelo, medida como media de 40 meses no vistos previamente:

| Metrica (media de 40 meses) | Presidente por reglas | connectailab-rl-jcan-v2-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,11 millones de wones |
| Satisfaccion del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 casos | 2,8 casos |
| Confirmaciones humanas superadas | 37,8 casos | 21,7 casos |
| Dias sin stock (품절일) | 10,7 dias | 0,5 dias |

No se han publicado resultados de benchmarks estandar de machine learning (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores corresponden exclusivamente al entorno de simulacion CONNECT TYCOON y no deben interpretarse como rendimiento general del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La naturaleza numpy del artefacto y su uso como politica de decision sugieren una huella muy reducida, pero no se especifica.
- GPU recomendadas: no disponible. No se documenta si el entrenamiento o la inferencia requieren GPU.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tag `numpy` y el pipeline de reinforcement learning, es probable que la inferencia pueda ejecutarse en CPU, aunque no se afirma en la model card.
- Opciones de despliegue: integracion via el paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`) y su API `CompanyBrain.from_hub(...)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoria (politicas RL de gestion empresarial en espanol o coreano) salvo la linea base y artefactos relacionados del mismo autor:

| Modelo | Tipo | Licencia | Idiomas | Rendimiento (simulador) | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-jcan-v2-teacher | Politica RL (imitacion + PPO) | Apache 2.0 | Coreano | 11,11 M wones, 95 % satisfaccion, 2,8 incidentes | HuggingFace |
| Presidente por reglas (linea base) | Politica basada en reglas | no aplica | Coreano | 3,24 M wones, 79 % satisfaccion, 7,8 incidentes | Incluida en el entorno |
| kiodo/connectailab-rl-jay-v1-teacher | Politica RL predecesora | no disponible en la informacion | Coreano | no disponible | HuggingFace |

No se conocen alternativas publicas equivalentes fuera del ecosistema CONNECT AI LAB.

## Limitaciones y advertencias

- Modelo de proposito educativo sobre un simulador sintetico: la propia model card advierte de que no garantiza ni predice resultados de gestion reales.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre, pero la politica puede producir decisiones incorrectas o de baja confianza en estados poco representados del simulador.
- Idiomas: soporta unicamente coreano; sus etiquetas de categoria y motivos estan en coreano.
- Dominio muy restringido: disenado exclusivamente para el entorno CONNECT TYCOON; no es transferible a otras tareas de decision sin reentrenamiento.
- Contexto y parametros no documentados: la ausencia de especificaciones sobre arquitectura y tamano dificulta reproducir el entrenamiento o estimar costes de despliegue.
- Sesgos: los sesgos quedan determinados por la politica por reglas imitada durante la fase supervisada; no se documenta analisis de sesgos ni de robustez.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al tratarse de un modelo educativo el autor desaconseja explicitamente interpretar sus resultados como asesoramiento empresarial.
- Cero descargas y cero "likes" en el momento de la ficha, sin evidencia externa de validacion por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jchann00/connectailab-rl-jcan-v2-teacher
- Repositorio CONNECT TYCOON (GitHub): https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Google Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de Connect AI Lab: https://www.youtube.com/@CONNECT-AI-LAB
- AI City Builders: https://www.aicitybuilders.com
- Curso de RL de AI City Builders: https://www.aicitybuilders.com/robot
- Connect AI (ezerai): https://www.ezerai.xyz
- Modelo relacionado (v1): https://huggingface.co/kiodo/connectailab-rl-jay-v1-teacher
- Perfil del autor en HuggingFace: https://huggingface.co/jchann00/models
