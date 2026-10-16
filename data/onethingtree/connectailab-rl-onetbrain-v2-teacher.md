# onethingtree/connectailab-rl-onetbrain-v2-teacher

## Resumen

connect-ai-company-v2 (identificador en Hugging Face `onethingtree/connectailab-rl-onetbrain-v2-teacher`) es una politica de decision entrenada por refuerzo que actua como «prefrente» de una empresa simulada dentro del proyecto CONNECT TYCOON, desarrollado por CONNECT AI LAB en colaboracion con AI CITY BUILDERS. No es un modelo de lenguaje generativo, sino una red de politica (policy) que recibe el estado de la compania y devuelve decisiones estructuradas en formato JEV (`typesafe/jev-1.13`).

El modelo cubre las decisiones operativas de un mes simulado de 20 dias laborables: asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad. Aprende primero imitando a un «presidente de reglas» mediante aprendizaje supervisado y despues ajusta su comportamiento con PPO, usando como recompensa el valor de la empresa (beneficio, satisfaccion del cliente y aversion al riesgo, ponderados a 1.0 cada uno).

Se distribuye con licencia Apache 2.0, esta orientado al idioma coreano y se empaqueta como artefacto compatible con NumPy dentro del paquete `connect-tycoon`. La model card reporta una mejora sustancial frente al baseline de reglas en 40 meses promedio: 11,42 millones de wones de beneficio mensual (frente a 3,24), 96% de satisfaccion (frente a 79%) y 0,4 dias de rotura de stock (frente a 10,7).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica de aprendizaje por refuerzo profundo (PPO); no es un transformer. Topologia de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (el estado se entrega como estructura JSON, no como secuencia de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (la libreria declarada es NumPy) |
| Pipeline | reinforcement-learning |
| Libreria | numpy |
| Fecha de creacion / actualizacion | 2026-10-16 |
| Descargas / likes | 0 / 0 |
| Entorno de entrenamiento | Simulador tipo Gymnasium de CONNECT TYCOON |
| Algoritmo | PPO (Proximal Policy Optimization) tras aprendizaje supervisado |
| Formato de salida | Esquema JEV (`typesafe/jev-1.13`), JSON con tipos de pregunta y respuesta |

## Arquitectura y entrenamiento

El modelo es una politica de decision de aprendizaje por refuerzo profundo entrenada con PPO. La model card lo describe como el «prefrente» (전전두엽) de la compania: recibe el estado del negocio (por ejemplo, departamento, motivo, nivel de cliente, importe y puntuacion de fraude) y emite una decision en el mismo esquema que JEV, con tipos de pregunta como `choice` y criterios de respuesta. No se especifica en la informacion disponible la topologia exacta de la red, el numero de capas, la dimension de las representaciones internas ni el recuento de parametros.

El entrenamiento se desarrollo en dos fases. Primero, aprendizaje supervisado imitando a un «presidente de reglas» (imitacion de comportamiento). Despues, ajuste con PPO usando la recompensa derivada del valor de la empresa, configurado como `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfaccion del cliente y riesgo, con peso 1.0 cada uno). El entorno simula un mes de 20 dias laborables sobre una configuracion de empresa concreta: `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. No se documentan el numero de episodios de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como DPO o RLHF.

## Capacidades

- Decision estructurada de tipo `choice`: devuelve la opcion elegida, la distribucion de probabilidad sobre todas las alternativas y un nivel de confianza (por ejemplo, `full`: 0,9609; `partial`: 0,0004; `deny`: 0,0003; `human`: 0,0384).
- Decisiones de negocio simuladas: asignacion de personal, pedidos de inventario, marketing, atencion al cliente, reembolsos y seguridad.
- Salida en formato JEV (JSON), interoperable con el ecosistema `typesafe/jev-1.13`.
- Razonamiento de un paso sobre el estado del entorno (no razonamiento agente multi-paso en el sentido de un LLM).
- Capacidad multilingue: limitada al coreano (ko).
- Ejecucion como cerebro de agente en el juego mediante `connect-tycoon play --brain hf:onethingtree/connectailab-rl-onetbrain-v2-teacher`.
- El identificador incluye el sufijo «teacher»; la model card no detalla si se emplea como modelo maestro para destilar a otro. No disponible.
- No se documentan capacidades de tool calling, function calling, vision, audio ni modo «thinking».

## Casos de uso

- Agente de decision en el simulador CONNECT TYCOON: se carga como cerebro mediante `ct.CompanyBrain.from_hub(...)` y gestiona un mes de 20 dias laborables tomando decisiones de operacion. Es el caso de uso nativo para el que esta disenado.
- Investigacion en aprendizaje por refuerzo: sirve como politica de referencia entrenada con PPO sobre un entorno tipo Gymnasium, util para comparar algoritmos, funciones de recompensa o estrategias de exploracion.
- Material educativo: la model card enlaza un curso de reforzamiento y un notebook de Colab, por lo que el modelo puede usarse como ejemplo practico de entrenamiento y despliegue de politicas RL.
- Prototipado de decisiones estructuradas en formato JEV: permite probar flujos de pregunta-respuesta con esquema JSON tipado antes de conectar un modelo mayor.
- Simulacion de reglas de negocio (reembolsos, seguridad antifraude): el modelo decide entre reembolso total, parcial, rechazo o revision humana segun el estado y el valor de la empresa.
- Benchmarking frente a sistemas basados en reglas: el baseline «presidente de reglas» del mismo proyecto permite medir la ganancia de una politica aprendida frente a la logica hardcodeada.
- Experimentacion con recompensas multiobjetivo: al ponderar beneficio, satisfaccion y riesgo, es util para estudiar como cambia la politica al reajustar esos pesos.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son resultados de simulacion (promedio de 40 meses) que comparan la politica aprendida con el baseline de reglas del propio proyecto. No son benchmarks estandar de ML (MMLU, HumanEval, GSM8K u otros).

| Metrica (promedio de 40 meses) | Presidente de reglas | connect-ai-company-v2 |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,42 millones de wones |
| Satisfaccion del cliente | 79% | 96% |
| Incidentes de riesgo | 7,8 | 1,6 |
| Confirmaciones humanas excedidas | 37,8 | 17,2 |
| Dias de rotura de stock | 10,7 | 0,4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al declararse la libreria NumPy y tratarse de una politica de decision empaquetada, no se documenta dependencia de GPU.
- GPU recomendadas: no disponible; no se especifica ninguna GPU en la model card.
- Compatibilidad con GPU de consumo: no confirmada; se espera que la inferencia funcione en CPU sin acelerador dedicado, pero no esta documentado.
- Opciones de despliegue: paquete Python `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga via `CompanyBrain.from_hub`, y el notebook de Colab enlazado por el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos publicos directamente comparables en la informacion proporcionada. La unica referencia cuantitativa es el baseline del mismo proyecto.

| Modelo | Tipo | Parametros | Contexto | Rendimiento en la tarea | Licencia |
|---|---|---|---|---|---|
| connect-ai-company-v2 | Politica RL (PPO) | no disponible | no aplica | 11,42 M wones, 96% satisfaccion, 0,4 dias de rotura | Apache 2.0 |
| Presidente de reglas (baseline del proyecto) | Sistema basado en reglas | no aplica | no aplica | 3,24 M wones, 79% satisfaccion, 10,7 dias de rotura | parte del proyecto CONNECT TYCOON |
| LLM generalista con salida JSON | Transformer LLM | variable | miles de tokens | no evaluado en este entorno | variable |

Comparativa con modelos generalistas: no disponible.

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintetico: el propio autor advierte de que no garantiza ni predice resultados reales de gestion empresarial.
- Riesgo de sobreajuste al entorno y a la configuracion concreta de empresa (`warehouse` 250, `base_demand` 40, `unit_cost` 1.5, etc.). No hay datos sobre transferencia a otras configuraciones o dominios.
- Idioma: unico idioma soportado, coreano (ko). No se documenta soporte de castellano ni de otras lenguas.
- Salida restringida al esquema JEV: no genera texto libre y no debe tratarse como un modelo conversacional.
- Alucinacion: en sentido estricto no aplica, pero las probabilidades emitidas (por ejemplo, 0,9609 para «full») son la confianza de la politica, no una probabilidad calibrada de exito real; pueden estar mal calibradas.
- Sesgos conocidos: no se documenta ningun analisis de sesgos ni de equidad en la model card.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende del paquete `connect-tycoon` y del esquema JEV, cuyas condiciones no se detallan en la informacion disponible.
- Trazabilidad limitada: 0 descargas y 0 likes publicos, creado y actualizado el 2026-10-16, sin validacion externa documentada.
- Datos de entrenamiento no documentados: se desconoce el numero de episodios, la composicion del dataset y los detalles del proceso de imitacion previo al PPO.

## Enlaces

- Hugging Face: https://huggingface.co/onethingtree/connectailab-rl-onetbrain-v2-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Esquema JEV: https://huggingface.co/typesafe/jev-1.13
