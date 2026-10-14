# jchann00/connectailab-rl-jay-v1-teacher

## Resumen

connectailab-rl-jay-v1-teacher es una política de aprendizaje por refuerzo (RL) publicada por el desarrollador jchann00 dentro del proyecto CONNECT TYCOON, un simulador de gestión empresarial de código abierto impulsado por CONNECT AI LAB y AI CITY BUILDERS. El modelo actúa como el cerebro de una empresa sintética (la model card lo describe como corteza prefrontal) que debe operar durante un mes de 20 días laborables: decide plantilla, reposición de inventario, marketing, atención al cliente, devoluciones y seguridad.

No es un modelo de lenguaje generativo. Se publica con `library_name: numpy` y `pipeline_tag: reinforcement-learning`, y responde a peticiones estructuradas en formato JEV (`typesafe/jev-1.13`) devolviendo una opción elegida, un vector de probabilidades y un nivel de confianza. El entrenamiento consta de dos fases: imitación de un presidente basado en reglas (aprendizaje supervisado) y ajuste posterior con PPO usando como recompensa el valor de la empresa (beneficio, satisfacción del cliente y evitación de riesgo, con peso 1.0 cada uno, según la model card).

Su relevancia es educativa y de investigación en RL aplicado a la toma de decisiones secuenciales: la model card reporta que supera a la política de reglas en la simulación, con 11,11 millones de wones de beneficio medio frente a 3,24 millones en 40 meses no vistos, y con menos incidentes de riesgo y menos días de rotura de stock.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo entrenada con PPO; topología de red (capas, dimensiones) no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: consume un estado estructurado de la simulación, no una secuencia de tokens |
| Tipos de cuantizacion | no disponible (pesos en formato NumPy; no se documentan cuantizaciones) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | NumPy (`library_name: numpy`), cargable con `connect_tycoon.CompanyBrain.from_hub` |
| Tarea declarada | reinforcement-learning (toma de decisiones) |
| Entorno | Gymnasium / simulador CONNECT TYCOON |

## Arquitectura y entrenamiento

La model card no documenta la topología de la red (número de capas, tamaño de las representaciones internas ni número de parámetros). Lo que sí se especifica es el procedimiento: primero un aprendizaje supervisado que imita a un "presidente de reglas", y después un ajuste con PPO sobre el simulador CONNECT TYCOON, que expone la interfaz Gymnasium. La función de recompensa se deriva del vector de valores de la empresa `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}` (beneficio, satisfacción del cliente y riesgo, con peso idéntico).

El modelo no genera texto libre: recibe una petición JEV con el estado (por ejemplo, `{"department": "refund", "reason": "미배송", "tier": "단골", "amount": 8.7, "fraud_score": 0.3146...}`) y devuelve una decisión tipada con sus probabilidades. El entorno de entrenamiento está parametrizado con una configuración concreta de empresa (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, `ad_power: 1.0`, `wage: 0.0`, entre otros). No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.), ni el número de tokens o episodios de entrenamiento.

## Capacidades

- Toma de decisiones discretas multiobjetivo: elige entre alternativas (`full`, `partial`, `deny`, `human`) ponderando beneficio, satisfacción y riesgo.
- Salida estructurada en formato JEV con probabilidades por opción y campo de confianza (ejemplo de la model card: `full: 0.9139`, `human: 0.085`, `partial: 0.0005`, `deny: 0.0005`, confianza `0.9139`).
- Gestión de seis áreas operativas de la simulación: personal, pedidos de inventario, marketing, atención al cliente, devoluciones y seguridad.
- Planificación dentro de un horizonte de 20 días laborables por episodio.
- Abstención / escalado a humano cuando la opción `human` recibe probabilidad distinta de cero.
- Idioma de trabajo: coreano (etiquetas, motivos y campos de estado en `ko`).
- No dispone de tool calling, function calling, visión, audio ni modo de razonamiento extendido, ya que no es un modelo generativo.

## Casos de uso

- Laboratorio docente de RL: los alumnos pueden instalar `connect-tycoon`, cargar esta política y comparar el comportamiento aprendido con la heurística de reglas en el mismo entorno Gymnasium.
- Estudio de alineación de recompensas multiobjetivo: al fijar pesos idénticos para beneficio, satisfacción y riesgo, sirve para analizar cómo una política PPO equilibra objetivos en conflicto en decisiones de devolución o reposición.
- Agente jugador en CONNECT TYCOON: `connect-tycoon play --brain hf:jchann00/connectailab-rl-jay-v1-teacher` permite que el modelo dirija la empresa mientras un usuario observa la evolución diaria en el simulador.
- Generación de trayectorias de referencia: al estar etiquetado como "teacher", sus decisiones pueden registrarse para imitar o evaluar otras políticas más pequeñas o con menos presupuesto de entrenamiento.
- Pruebas de robustez de simuladores: al responder a estados con `fraud_score` y `tier`, es útil para comprobar si un entorno de negocio sintético penaliza correctamente el abuso y premia la retención.
- Docencia sobre formatos de interacción estructurada: el ejemplo JEV de la model card sirve como caso práctico de integración entre un modelo de decisión y una capa de orquestación que pregunta en JSON y valida la respuesta.
- Investigación en escalado de políticas a entornos con restricciones de coste, como la opción `human`, que en el simulador cuesta 0,8 만원 por caso.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la propia simulación (media de 40 meses no vistos), comparando la política con el presidente de reglas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Metrica (media de 40 meses) | Presidente de reglas | connectailab-rl-jay-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,11 millones de wones |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,8 |
| Escalados a persona por encima del umbral | 37,8 | 21,7 |
| Días con rotura de stock | 10,7 | 0,5 |

## Requisitos de hardware

- VRAM: no aplica en la práctica; los pesos se publican como artefactos NumPy y la inferencia es una pasada por la política, no una generación autorregresiva.
- GPU: no se documenta ninguna GPU recomendada ni necesaria. El caso de uso previsto es CPU.
- GPU de consumo: el modelo puede ejecutarse en un portátil sin GPU dedicada, ya que la librería declarada es NumPy.
- Despliegue: `pip install "connect-tycoon[game]"` para el simulador y `connect_tycoon.CompanyBrain.from_hub("jchann00/connectailab-rl-jay-v1-teacher")` para cargar la política; también existe la CLI `connect-tycoon play --brain hf:jchann00/connectailab-rl-jay-v1-teacher`.
- Servidores de inferencia tipo vLLM, TGI, llama.cpp u Ollama: no aplican, porque no hay pesos en safetensors ni GGUF ni un tokenizador asociado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la información disponible otros modelos comparables de la misma categoría (políticas RL publicadas para simuladores de gestión empresarial). La única referencia de comparación explícita en la model card es la política heurística del propio simulador:

| Alternativa | Tipo | Beneficio medio | Satisfacción | Incidentes de riesgo | Licencia |
|---|---|---|---|---|---|
| Presidente de reglas (baseline del simulador) | Heurística fija | 3,24 millones de wones | 79 % | 7,8 | no disponible |
| connectailab-rl-jay-v1-teacher | Política PPO | 11,11 millones de wones | 95 % | 2,8 | Apache 2.0 |
| Otros modelos RL comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito restringido: es una política entrenada para el simulador CONNECT TYCOON con una configuración concreta de empresa. No es un sistema de apoyo a decisiones empresariales reales.
- La propia model card advierte de que se trata de un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados de negocio reales.
- Dependencia de infraestructura: requiere la librería `connect-tycoon` y el contrato de formato JEV (`typesafe/jev-1.13`) para funcionar; fuera de ese entorno no es utilizable directamente.
- Idioma: el único idioma declarado es el coreano, tanto en las etiquetas del entorno como en los motivos de decisión.
- Función de recompensa fijada: los pesos de beneficio, satisfacción y riesgo son 1.0 / 1.0 / 1.0. Cualquier cambio de prioridades en un despliegue distinto queda fuera de la distribución de entrenamiento.
- Riesgo de decisión subóptima fuera de distribución: al ser una política cerrada, no razona ni explica el porqué de una elección más allá del campo `reason: "강화학습 정책"` (política de aprendizaje por refuerzo) que aparece en el ejemplo.
- Validación limitada: la métrica publicada procede de 40 meses simulados y del propio autor; el repositorio registra 0 descargas y 0 "likes", por lo que no hay validación independiente de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se distribuye sin garantías; conviene revisar las condiciones de los componentes auxiliares (simulador, formato JEV) antes de integrarlo en un producto.
- No hay información sobre sesgos, sobre el número de parámetros ni sobre el coste computacional de entrenamiento, lo que dificulta reproducir o auditar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jchann00/connectailab-rl-jay-v1-teacher
- Repositorio CONNECT TYCOON (GitHub): https://github.com/wonseokjung/connect-tycoon
- Cuaderno de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Formato JEV referenciado en la model card: https://huggingface.co/typesafe/jev-1.13
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de IA con aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Imagen del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
