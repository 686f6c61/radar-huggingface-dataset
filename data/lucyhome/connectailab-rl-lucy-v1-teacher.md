# lucyhome/connectailab-rl-lucy-v1-teacher

## Resumen

connectailab-rl-lucy-v1-teacher es una política de decisión entrenada con aprendizaje por refuerzo profundo que actúa como el "córtex prefrontal" de una empresa simulada dentro de CONNECT TYCOON, un simulador de gestión empresarial desarrollado por CONNECT AI LAB y AI CITY BUILDERS. El modelo dirige la compañía durante un mes (20 días laborables) tomando decisiones sobre asignación de personal, reposición de inventario, marketing, atención al cliente, devoluciones y seguridad. Internamente no es un modelo de lenguaje: es un cerebro de decisión publicado con la librería numpy y etiquetado como pipeline de reinforcement-learning, que responde siempre en el formato estructurado JEV (`typesafe/jev-1.13`).

El autor es el usuario lucyhome, y el modelo se distribuye bajo licencia Apache 2.0 con soporte exclusivo para coreano (ko). Su relevancia práctica es doble: por un lado sirve como material didáctico para cursos de aprendizaje por refuerzo; por otro, funciona como política de referencia ("teacher") que demuestra que un agente entrenado con PPO puede superar de forma sustancial a una heurística de reglas en un entorno de decisión con múltiples objetivos en conflicto (beneficio, satisfacción del cliente y evitación de riesgos, cada uno ponderado con peso 1.0).

No se dispone de información sobre arquitectura de red, número de parámetros, ventana de contexto ni formatos de cuantización, por lo que esos campos se marcan como no disponibles. El dato diferencial publicado son los resultados de simulación: frente a un "presidente de reglas", el modelo multiplica por más de tres el beneficio medio en 40 meses nuevos y reduce drásticamente los incidentes y las interrupciones por confirmación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de decisión entrenada con PPO; el autor la describe como "córtex prefrontal" del simulador) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es un estado JSON por paso de decisión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería declarada: numpy) |
| Autor | lucyhome |
| Pipeline declarado | reinforcement-learning |
| Formato de respuesta | JEV (`typesafe/jev-1.13`) |
| Fecha de publicacion | 2026-10-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no detalla la topología de la red neuronal que implementa la política. Lo que sí se documenta es el procedimiento de entrenamiento en dos fases. En la primera, el agente aprende por imitación supervisada de un "presidente de reglas" (una heurística previa que gestiona la empresa). En la segunda, ese comportamiento se refina con PPO (Proximal Policy Optimization) usando como señal de recompensa el vector de valor de la empresa: `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`, es decir, beneficio, satisfacción del cliente y riesgo, todos con peso 1.0. Esto convierte el problema en un entorno multobjetivo de tipo Gymnasium donde el agente debe equilibrar ganancias, calidad de servicio y exposición a incidentes.

Cada decisión se formula como una pregunta JEV con tipo `choice`, unas instrucciones y un conjunto de criterios con sus etiquetas. El modelo devuelve una distribución de probabilidad sobre las opciones, más el campo `confidence` y un campo `reason` que en el ejemplo publicado es simplemente "강화학습 정책" (política de aprendizaje por refuerzo), no una justificación en lenguaje natural. El entorno de referencia se parametriza con una configuración concreta de empresa: `warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, `staff_bonus: 0`, `wage: 0.0`, `ad_power: 1.0`, `fraud_tool: 0`, `extra_cs: 0`, `extra_refund: 0`. No se indica el número de tokens, episodios ni pasos de entrenamiento.

## Capacidades

- Toma de decisiones discretas en un entorno de gestión empresarial: selecciona una opción entre varias (`full`, `partial`, `deny`, `human` en el caso de devoluciones) con una probabilidad asociada.
- Gestión integral de una empresa simulada durante 20 días laborables: asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, tramitación de devoluciones y decisiones de seguridad.
- Estimación de incertidumbre mediante el campo `probabilities` y el valor `confidence` de cada respuesta.
- Detección implícita de fraude: en el ejemplo publicado, ante una devolución con `fraud_score` de 0.314 y cliente de nivel "단골" (habitual), asigna el 81,79 % de probabilidad a la opción de derivar a revisión humana, frente a un 14,36 % a reembolso completo.
- Optimización multiobjetivo con pesos explícitos sobre beneficio, satisfacción y riesgo.
- Integración con el ecosistema JEV: entrada y salida en el mismo esquema que `typesafe/jev-1.13`.
- Ejecución como cerebro del simulador mediante el comando `connect-tycoon play --brain hf:lucyhome/connectailab-rl-lucy-v1-teacher`.
- Idiomas: únicamente coreano.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling, agentes multi-paso ni modo de razonamiento extendido.

## Casos de uso

- Material didáctico de aprendizaje por refuerzo: el modelo sirve como ejemplo completo de un pipeline imitación + PPO aplicado a un entorno Gymnasium, y el cuaderno de Colab enlazado permite reproducir el entrenamiento paso a paso en clase.
- Política "teacher" para destilación: al haber superado a la heurística de reglas, puede usarse para generar trayectorias de alta calidad con las que entrenar políticas más pequeñas o distintas arquitecturas.
- Investigación en decisión multiobjetivo: su recompensa vectorial (beneficio, satisfacción, riesgo) lo convierte en un banco de pruebas para estudiar equilibrios entre objetivos contrapuestos en agentes de decisión.
- Evaluación comparativa de políticas: se puede enfrentar contra el presidente de reglas u otras políticas en el mismo simulador y medir beneficio, satisfacción, incidentes y días de rotura de stock bajo condiciones controladas.
- Simulación educativa de gestión empresarial: un aula puede lanzar el simulador con este cerebro y analizar sus decisiones (por ejemplo, cuándo deriva un reembolso a revisión humana) como estudio de caso de política automatizada.
- Automatización de agentes en juegos de gestión: sirve como referencia para integrar un cerebro entrenado con RL en un motor de juego mediante el SDK `connect-tycoon[game]`.
- Módulo de decisión dentro de un pipeline JEV: al responder en el mismo formato que `typesafe/jev-1.13`, encaja como componente de decisión de un sistema mayor que encadene preguntas y respuestas estructuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor sí publica métricas de simulación sobre 40 meses nuevos, comparando el modelo con el presidente de reglas:

| Metrica (media de 40 meses) | Presidente de reglas | connectailab-rl-lucy-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,64 millones de wones |
| Satisfaccion del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 1,6 |
| Confirmaciones humanas superadas | 37,8 | 11,4 |
| Dias de rotura de stock | 10,7 | 0,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al publicarse con la librería numpy y ser una política de decisión, es razonable esperar ejecución en CPU sin acelerador, aunque el tamaño exacto del modelo no se documenta.
- GPU recomendadas: no disponibles. No se documenta ningún requisito de GPU específico (A100, H100, RTX 4090 u otras).
- Compatibilidad con GPU de consumo: no disponible. El formato ligero (numpy) apunta a que no requiere GPU, pero es una inferencia y no un dato confirmado por el autor.
- Opciones de despliegue: integración mediante el SDK de `connect-tycoon` (`pip install "connect-tycoon[game]"` y `connect-tycoon play --brain hf:lucyhome/connectailab-rl-lucy-v1-teacher`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje y no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados en la informacion disponible. La única referencia de comparación es el "presidente de reglas" del propio simulador, que actúa como línea base y cuyos resultados se recogen en la tabla de la sección de benchmarks. Se trata de una política heurística, no de un modelo entrenado, por lo que la comparación debe interpretarse como una mejora sobre una línea base y no como un enfrentamiento entre modelos de la misma categoría.

## Limitaciones y advertencias

- Ámbito restringido: es una política de decisión específica del simulador CONNECT TYCOON. Sus decisiones no son transferibles directamente a la gestión de una empresa real.
- Advertencia explícita del autor: se trata de un modelo educativo sobre un simulador de empresa sintético y no garantiza ni predice resultados de gestión reales.
- Idioma: solo soporta coreano (ko), tanto en las instrucciones JEV como en los campos textuales.
- Formato de salida rígido: las respuestas son distribuciones de probabilidad sobre opciones predefinidas más un campo `reason` genérico; no genera explicaciones en lenguaje natural, lo que limita su auditabilidad.
- Sensibilidad a la configuración del entorno: los resultados publicados se obtuvieron con una configuración concreta de empresa (`warehouse`, `base_demand`, `unit_cost`, etc.); no se documenta su comportamiento con otras parametrizaciones.
- Riesgo de sobreajuste al simulador: al entrenarse por imitación de una heurística y luego con PPO sobre un entorno fijo, puede no generalizar a variantes del juego no vistas durante el entrenamiento.
- Ausencia de datos técnicos: no se publican arquitectura, número de parámetros, presupuesto de entrenamiento ni métricas de robustez, lo que dificulta evaluar su fiabilidad más allá de los resultados del simulador.
- Cero tracción en HuggingFace: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado de forma independiente los resultados.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero al depender del ecosistema `connect-tycoon` conviene revisar también la licencia de ese paquete y del simulador antes de integrarlo en producción.
- Sesgos: no se documenta ningún análisis de sesgos, y al entrenarse imitando una heurística de reglas hereda los criterios y sesgos de dicha heurística.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucyhome/connectailab-rl-lucy-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno Colab de entrenamiento RL: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI (ezerai): https://www.ezerai.xyz
- Esquema JEV de referencia: `typesafe/jev-1.13`
