# key1739/connectailab-rl-connectailab-rl-coco-brain-v1-teacher

## Resumen

`connectailab-rl-coco-brain-v1-teacher` es un modelo de decision reinforcement learning (RL) desarrollado por CONNECT AI LAB (publicado en Hugging Face por el usuario `key1739`). No es un modelo de lenguaje generativo: es una politica PPO entrenada para operar una empresa simulada dentro del entorno `connect-tycoon`, tomando decisiones sobre asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad. El modelo responde en un formato estructurado denominado JEV (`typesafe/jev-1.13`), que define preguntas de tipo eleccion con criterios y devuelve probabilidades por opcion.

La relevancia del modelo es acotada y experimental: se trata de un "cerebro" de agente para un simulador educativo, con licencia Apache 2.0 y empaquetado en formato NumPy (no safetensors ni GGUF), lo que lo aleja de los flujos habituales de despliegue de LLM. Segun la model card, la politica se entrena primero por imitacion de un "presidente de reglas" (supervised learning) y despues se ajusta con PPO usando recompensas derivadas de los valores de la empresa (beneficio, satisfaccion del cliente y riesgo).

El autor reporta que, en 40 meses no vistos, el agente supera al baseline de reglas en beneficio mensual medio (17,19 millones de wones frente a 7,08 millones), satisfaccion del cliente (96 % frente a 71 %) y reduccion de incidentes de riesgo (1,9 frente a 11,5). No se dispone de informacion sobre arquitectura de red, numero de parametros ni contexto, por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de reinforcement learning; se desconoce la topologia de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria declarada: numpy) |

## Arquitectura y entrenamiento

La model card describe un pipeline de dos fases: aprendizaje supervisado a partir de un "presidente de reglas" (un policy heuristico que sirve de profesor) y posterior ajuste con PPO (Proximal Policy Optimization) usando recompensas basadas en los valores de la empresa, definidos como `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfaccion del cliente y riesgo, con peso unitario). El agente opera sobre un simulador de empresa con configuracion explicita (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, entre otros parametros) y un horizonte de un mes de 20 dias laborables.

La interfaz de inferencia es JEV: el modelo recibe un estado (por ejemplo, `department`, `reason`, `tier`, `amount`, `fraud_score`) y una pregunta de tipo `choice` con criterios discretos (`full`, `partial`, `deny`, `human`), y devuelve una opcion con distribucion de probabilidades y nivel de confianza. El ejemplo de la model card muestra una decision de reembolso con `full: 0.9921`. No se especifican numero de tokens de entrenamiento, composicion del dataset, ni detalles de la red neuronal; esa informacion no esta disponible.

## Capacidades

- Toma de decisiones discretas sobre operaciones de empresa simulada: asignacion de personal, pedidos de inventario, campanas de marketing, atencion al cliente, reembolsos y seguridad.
- Razonamiento de politica bajo incertidumbre: el estado incluye variables como `fraud_score` y el modelo devuelve probabilidades calibradas por opcion.
- Formato de respuesta estructurado JEV (`typesafe/jev-1.13`) con campos `choice`, `probabilities`, `confidence` y `reason`.
- Integracion con el simulador `connect-tycoon` mediante `CompanyBrain.from_hub(...)` y modo interactivo `connect-tycoon play --brain hf:...`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: parcial, en tanto que opera como politica dentro de un bucle de simulacion, pero no se documenta planificacion multi-paso explicita.
- Capacidades multilingues: solo coreano (ko).
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Simulacion educativa de gestion empresarial: el modelo actua como "cerebro" de una empresa virtual en `connect-tycoon`, tomando decisiones mes a mes con el objetivo de maximizar beneficio, satisfaccion y control de riesgo. Es adecuado porque el entorno y la interfaz JEV estan disenados especificamente para este bucle.
- Investigacion en RL aplicado a decision-making: sirve como baseline reproducible de PPO con recompensa multiobjetivo, util para comparar algoritmos de RL sobre el mismo simulador.
- Docencia de reinforcement learning: la model card incluye un notebook de Colab para entrenamiento, lo que permite usar el modelo como ejemplo practico de imitacion + PPO en un dominio de negocio.
- Evaluacion de politicas de reembolso y fraude: el ejemplo de la model card muestra una decision de reembolso con `fraud_score` como variable de estado; el modelo puede emplearse para estudiar el trade-off entre satisfaccion del cliente y perdida economica.
- Prototipado de agentes en entornos tipo Gymnasium: al declarar la etiqueta `gymnasium`, el modelo puede integrarse en pipelines de experimentacion con entornos compatibles.
- Generacion de trazas de decision para auditoria: la salida JEV incluye probabilidades y confianza, lo que facilita registrar y revisar por que se tomo cada decision en un experimento.
- Benchmarking de heuristicos versus RL: el contraste reportado frente al "presidente de reglas" permite usar el modelo como referencia en estudios comparativos de politicas heuristicas y aprendidas.

## Benchmarks y rendimiento

La model card reporta resultados agregados sobre 40 meses no vistos, comparando el agente con el baseline de reglas:

| Metrica (media en 40 meses) | Presidente de reglas | jay-company (este modelo) |
|---|---|---|
| Beneficio mensual | 7,08 millones de wones | 17,19 millones de wones |
| Satisfaccion del cliente | 71 % | 96 % |
| Incidentes de riesgo | 11,5 | 1,9 |
| Confirmaciones humanas excedidas | 69,5 | 14,8 |
| Dias con stock agotado | 9,1 | 0,4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, lo cual es esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo empaquetado con `numpy` y orientado a un simulador, es probable que la huella sea muy reducida, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible. No se documenta requisito de GPU; el ejemplo de uso se ejecuta via `pip install "connect-tycoon[game]"`.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `connect-tycoon` (extra `[game]`), `CompanyBrain.from_hub(...)` y el notebook de Colab referenciado en la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (politicas RL para el simulador `connect-tycoon` o entornos equivalentes). El unico contraste documentado es frente al baseline heuristico "presidente de reglas", incluido en la tabla de benchmarks.

## Limitaciones y advertencias

- Ambito muy restringido: el modelo solo opera sobre el simulador `connect-tycoon` y el formato JEV; no es un modelo de lenguaje general ni responde a prompts arbitrarios.
- Idioma: unicamente coreano (ko); no se documenta soporte para castellano ni otros idiomas.
- Naturaleza sintetica: la propia model card advierte que es un modelo educativo sobre un simulador de empresa sintetico y que no garantiza ni predice resultados de gestion reales.
- Sesgos conocidos: no disponibles. Al entrenarse por imitacion de un "presidente de reglas" y ajustarse con recompensas definidas por el autor, la politica hereda los sesgos del profesor y de la funcion de recompensa.
- Riesgo de alucinacion: no aplica en el sentido habitual de generacion de texto; el riesgo relevante es la sobreconfianza en las probabilidades devueltas por la politica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo esta pensado para fines educativos y de investigacion; conviene revisar la licencia del simulador `connect-tycoon` de forma independiente.
- Caveat para produccion: no se documentan pruebas de robustez, calibracion ni evaluacion fuera del simulador; no se recomienda su uso en sistemas de decision reales sin validacion adicional.
- Reproducibilidad: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la informacion tecnica sobre arquitectura y datos de entrenamiento es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/key1739/connectailab-rl-connectailab-rl-coco-brain-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
