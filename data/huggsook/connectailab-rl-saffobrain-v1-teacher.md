# huggsook/connectailab-rl-saffobrain-v1-teacher

# connectailab-rl-saffobrain-v1-teacher: politica de decision empresarial por refuerzo (CONNECT TYCOON)

## Resumen

connectailab-rl-saffobrain-v1-teacher es un modelo de aprendizaje por refuerzo profundo (deep reinforcement learning) publicado por huggsook dentro del ecosistema CONNECT AI LAB. No es un modelo de lenguaje: es una politica de decision que actua como "corteza prefrontal" de una empresa simulada en el entorno CONNECT TYCOON, operando la compania durante un mes simulado (20 dias laborables). El modelo decide sobre asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.

El modelo se entreno en dos fases: primero aprendio por imitacion (aprendizaje supervisado) de un CEO basado en reglas, y despues ajusto sus decisiones con PPO (Proximal Policy Optimization) usando como recompensa los tres valores de la empresa: beneficio, satisfaccion del cliente y riesgo. La inferencia se realiza con NumPy, lo que lo hace ligero y desplegable sin GPU, y las respuestas siguen el formato estructurado JEV (`typesafe/jev-1.13`), devolviendo decisiones con distribucion de probabilidad y nivel de confianza.

El modelo es relevante como ejemplo de politica RL especializada en toma de decisiones multiobjetivo y como caso de estudio de entrenamiento por imitacion seguido de refinamiento con refuerzo. Su alcance esta acotado a un simulador sintetico de empresa y a la interfaz JEV, por lo que no debe interpretarse como un sistema de gestion empresarial real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda de politica (deep RL, PPO) sobre observaciones de estado; entrenada por imitacion y refinada con PPO. No es transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre el vector de estado del simulador por paso, no sobre texto) |
| Tipos de cuantizacion | no disponible (inferencia NumPy; no se publican cuantizaciones GGUF/INT8) |
| Idiomas soportados | coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | NumPy (library_name: numpy); formato de archivo concreto no especificado |
| Entorno de entrenamiento | Gymnasium / CONNECT TYCOON |
| Algoritmo de RL | PPO (Proximal Policy Optimization) |
| Formato de salida | JEV (`typesafe/jev-1.13`), respuestas estructuradas con choice, probabilities, confidence y reason |
| Pipeline | reinforcement-learning |
| Descargas / likes | 0 / 0 (en la fecha de consulta) |
| Fecha de publicacion | 2026-10-14 |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la informacion disponible mas alla de que se trata de una red neuronal profunda de politica entrenada con PPO sobre el entorno de simulacion Gymnasium de CONNECT TYCOON. El modelo recibe el estado de la empresa (por ejemplo, departamento, motivo de la solicitud, tipo de cliente, importe, `fraud_score`) y emite una decision discreta con su distribucion de probabilidad. En el ejemplo documentado de reembolsos, el modelo asigna `full` 0.9859, `partial` 0.0039, `deny` 0.0031 y `human` 0.0071, con confianza 0.9859.

El entrenamiento se realizo en dos etapas descritas por el autor: una primera fase de aprendizaje por imitacion (aprendizaje supervisado) siguiendo a un "CEO de reglas", y una segunda fase de ajuste con PPO en la que la recompensa se deriva de los valores declarados de la compania: beneficio 1.0, satisfaccion del cliente 1.0 y riesgo 1.0, configurados de forma ponderada. El estado del entorno empleado en la evaluacion usa la configuracion `warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, `ad_power: 1.0`, entre otros parametros. No se indica el numero de tokens ni un dataset textual, ya que el material de entrenamiento es la propia simulacion. No se documenta si hubo RLHF, DPO ni tecnicas adicionales fuera de la imitacion y PPO.

## Capacidades

- Toma de decisiones discretas por refuerzo con salida de probabilidades por opcion (por ejemplo, reembolso total, parcial, denegado o derivacion a humano).
- Gestion multiobjetivo: equilibra beneficio, satisfaccion del cliente y riesgo segun los pesos declarados de la empresa.
- Decisiones de operacion de empresa simulada: asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.
- Respuesta en formato estructurado JEV (`typesafe/jev-1.13`) con campos `choice`, `probabilities`, `confidence` y `reason`.
- Integracion con el simulador CONNECT TYCOON mediante `CompanyBrain.from_hub(...)` y ejecucion en modo juego con `connect-tycoon play`.
- Inferencia basada en NumPy, sin dependencia de GPU.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso mas alla del bucle de decision del propio simulador.

## Casos de uso

- Simulacion de gestion empresarial: el modelo opera una compania durante 20 dias laborables por episodio, tomando decisiones diarias de personal, inventario y marketing; es adecuado para estudiar politicas multiobjetivo en entornos sinteticos.
- Docencia de aprendizaje por refuerzo: sirve como ejemplo didactico de entrenamiento por imitacion seguido de PPO, con la libreria NumPy y Gymnasium, para cursos y talleres de RL.
- Evaluacion de politicas de decision con recompensa compuesta: util para comparar como distintas ponderaciones de beneficio, satisfaccion y riesgo cambian el comportamiento de una misma politica.
- Prototipado de agentes de decision sobre JEV: permite probar una interfaz pregunta/respuesta estructurada con probabilidades y confianza, integrable en pipelines de decision automatizada experimentales.
- Investigacion en gestion de reembolsos y fraude en simulacion: el ejemplo documentado de deteccion de fraude (`fraud_score`) permite estudiar politicas de aceptacion, rechazo o derivacion a revision humana.
- Benchmarking de agentes RL en un entorno de empresa: se puede usar como linea base frente a un "CEO de reglas" u otras politicas en el mismo simulador CONNECT TYCOON.
- Demostraciones interactivas en modo juego: mediante `connect-tycoon play --brain hf:huggsook/connectailab-rl-saffobrain-v1-teacher` se puede visualizar el comportamiento del modelo en la interfaz del simulador.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados comparan el modelo (denominado connect-ai-company-v2 en la model card) frente a un "CEO de reglas" sobre una media de 40 meses no vistos:

| Metrica (media de 40 meses no vistos) | CEO de reglas | connect-ai-company-v2 |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 11,41 M KRW |
| Satisfaccion del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,0 |
| Confirmaciones humanas excedidas | 37,8 | 15,3 |
| Dias sin existencias | 10,7 | 0,6 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- Inferencia basada en NumPy: no requiere GPU; puede ejecutarse en CPU.
- VRAM estimada: no disponible. No se publican requisitos de memoria especificos, aunque la libreria declarada (NumPy) implica un consumo bajo comparado con modelos de lenguaje.
- GPU recomendadas: no aplica ni se especifica; el modelo esta pensado para ejecucion en CPU.
- Compatibilidad con GPU de consumo: no relevante, al no depender de aceleracion grafica.
- Opciones de despliegue: integracion Python mediante la libreria `connect_tycoon` (`CompanyBrain.from_hub`), uso dentro del simulador con `pip install "connect-tycoon[game]"` y `connect-tycoon play`, o ejecucion en Google Colab a traves del notebook oficial. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos publicos comparables de la misma categoria (politicas RL especializadas en un simulador empresarial concreto). La unica comparacion disponible es frente al "CEO de reglas" interna del propio entorno CONNECT TYCOON, recogida en la seccion de benchmarks.

## Limitaciones y advertencias

- Ambito restringido: el modelo solo opera dentro del simulador CONNECT TYCOON y no es una politica general ni un modelo de lenguaje.
- Modelo educativo: la model card indica explicitamente que es un modelo educativo sobre un simulador sintetico de empresa y que no garantiza ni predice resultados de gestion reales.
- Idioma: el modelo esta etiquetado unicamente para coreano (ko); no se documenta soporte multilingue.
- Sesgos conocidos: no disponibles. Al entrenarse por imitacion de un CEO de reglas y con recompensas ponderadas, puede heredar los sesgos de esa politica y de las ponderaciones fijadas (beneficio, satisfaccion, riesgo todas a 1.0).
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo relevante es la seleccion de decisiones suboptimas fuera de la distribucion de entrenamiento o ante cambios en la configuracion del entorno.
- Sobrecarga semantica de la salida: la respuesta JEV incluye `probabilities` y `confidence`, pero la fiabilidad de estas magnitudes depende del entrenamiento y no debe interpretarse como calibracion garantizada.
- Licencia: apache-2.0, lo que permite uso comercial del modelo segun los terminos de dicha licencia; conviene revisar tambien las condiciones de las dependencias (CONNECT TYCOON, JEV).
- Rendimiento no verificado de forma independiente: las cifras de la model card proceden del propio autor y no se han validado externamente.
- Reproducibilidad: no se documentan detalles del dataset, numero de pasos de entrenamiento ni hiperparametros, lo que dificulta la reproduccion exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huggsook/connectailab-rl-saffobrain-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab (aprendizaje): https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- AI CITY BUILDERS (portada): https://www.aicitybuilders.com
- Connect AI: https://www.ezerai.xyz
- Formato JEV referenciado: `typesafe/jev-1.13` (referencia en la model card, sin URL directa proporcionada)
