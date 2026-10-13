# kareyoung09/connectailab-rl-ideun-v1-teacher

## Resumen

connectailab-rl-ideun-v1-teacher es una política de aprendizaje por refuerzo (RL) desarrollada por kareyoung09 para CONNECT TYCOON, un simulador sintético de gestión empresarial de la marca educativa CONNECT AI LAB. El modelo actúa como «cerebro» de la compañía durante un mes simulado (20 días laborables) y decide sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad. Todas sus respuestas se emiten en el formato estructurado JEV (compatible con typesafe/jev-1.13), con una opción elegida, la distribución de probabilidad entre alternativas, un nivel de confianza y una justificación.

El entrenamiento combina una primera fase de aprendizaje supervisado, en la que el modelo imita a un «jefe» basado en reglas, y una segunda fase de ajuste con PPO guiado por una función de recompensa que pondera tres valores: beneficio, satisfacción del cliente y evitación de riesgo (peso 1,0 cada uno). Según la model card, esta política supera al jefe de reglas en una media de 40 meses: 11,42 millones de won de beneficio frente a 3,24, 95% de satisfacción frente a 79% y 0,5 días de rotura de stock frente a 10,7.

Se trata de un modelo educativo y de nicho, ligado a un simulador concreto, distribuido con licencia Apache 2.0 y librería declarada `numpy`. No se publican detalles de arquitectura de red, número de parámetros ni contexto, y el soporte de idioma se limita al coreano (ko).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo entrenada con PPO sobre un simulador de empresa; no se detalla la topología de red subyacente |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería declarada: numpy) |

## Arquitectura y entrenamiento

La model card describe un pipeline en dos etapas. En la primera, el modelo aprende por imitación supervisada a partir de un «jefe de reglas» (규칙 사장), es decir, se le proporcionan las decisiones de una política heurística como referencia. En la segunda, esas decisiones se refinan con PPO (Proximal Policy Optimization), usando como recompensa el valor resultante de la compañía simulado: beneficio, satisfacción del cliente y control de riesgo. El pipeline declarado es `reinforcement-learning`, con etiquetas que apuntan a deep reinforcement learning, Gymnasium y PPO.

El modelo no genera texto libre: emite decisiones estructuradas en formato JEV (`typesafe/jev-1.13`). Para cada pregunta de tipo `choice` devuelve la opción seleccionada, la distribución de probabilidad sobre todas las alternativas, la confianza asociada y una justificación breve (en el ejemplo, «강화학습 정책», política de aprendizaje por refuerzo). La analogía de «corteza prefrontal» que aparece en las etiquetas describe el rol funcional del modelo dentro del simulador, no una arquitectura de red concreta. No se especifican número de tokens de entrenamiento, composición del dataset, ni innovaciones técnicas adicionales.

## Capacidades

- Toma de decisiones discretas con salida estructurada: opción elegida, probabilidades por alternativa, confianza y motivo.
- Gestión de seis áreas operativas del simulador: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Optimización multiobjetivo explícita sobre tres valores: beneficio, satisfacción del cliente y evitación de riesgo, con peso 1,0 cada uno.
- Escalado de decisiones a revisión humana cuando la política lo considera oportuno (por ejemplo, en solicitudes de reembolso con posible fraude).
- Emisión de respuestas en el formato JEV, integrable con `typesafe/jev-1.13` y con la librería `connect_tycoon` (`CompanyBrain.from_hub`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni razonamiento sobre texto libre.
- Capacidad multilingüe reducida al coreano.
- Sin modo «thinking» ni cadena de pensamiento expuesta.

## Casos de uso

- Operar una empresa dentro del simulador Connect Tycoon: el modelo se carga como cerebro (`connect-tycoon play --brain hf:kareyoung09/connectailab-rl-ideun-v1-teacher`) y toma las decisiones diarias de los 20 días laborables, con resultados medidos frente al jefe de reglas.
- Evaluación comparativa de políticas RL frente a heurísticas: sirve como referencia cuantitativa (beneficio, satisfacción, incidentes) para medir la mejora de un agente entrenado con PPO respecto a reglas manuales.
- Docencia en aprendizaje por refuerzo: el flujo se apoya en un cuaderno de Colab (`rl_decision_model_qwen_colab.ipynb`) para que estudiantes ejecuten entrenamiento e inferencia en un entorno controlado.
- Investigación sobre salidas estructuradas tipo JEV: el modelo permite estudiar cómo una política RL expresa incertidumbre mediante distribuciones de probabilidad sobre alternativas discretas.
- Automatización de decisiones de reembolso con escalado a humano: en el ejemplo de la model card, ante un cliente «단골» con importe de 8,7 y `fraud_score` de 0,31, la política asigna 0,5866 de probabilidad a «revisión humana», 0,3987 a reembolso completo y valores bajos a reembolso parcial y denegación.
- Generación de datos sintéticos de decisión para entrenar o auditar otros agentes: las respuestas con probabilidad y confianza pueden usarse como etiquetas blandas en experimentos de imitación.
- Banco de pruebas de pipelines JEV: la integración con `connect_tycoon.CompanyBrain.from_hub` permite validar el cableado de entrada/salida JEV antes de conectar modelos de mayor tamaño.

## Benchmarks y rendimiento

Los únicos resultados publicados proceden de la comparación interna de la model card, sobre una media de 40 meses en el simulador. No se aportan cifras de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

| Metrica (media de 40 meses) | Jefe basado en reglas | connectailab-rl-ideun-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de won | 11,42 millones de won |
| Satisfaccion del cliente | 79% | 95% |
| Incidentes de riesgo | 7,8 | 3,8 |
| Confirmaciones humanas superadas | 37,8 | 20,8 |
| Dias de rotura de stock | 10,7 | 0,5 |

La configuración de empresa usada en estas pruebas es `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la librería declarada es `numpy`, lo que apunta a inferencia en CPU, pero no se confirma en la información proporcionada.
- Opciones de despliegue: la vía documentada es la librería `connect-tycoon` (`pip install "connect-tycoon[game]"`) y la carga mediante `CompanyBrain.from_hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se identifican en la información disponible otros modelos comparables de la misma categoría. La única referencia facilitada es el jefe basado en reglas del propio simulador.

| Modelo | Tipo | Beneficio mensual | Satisfaccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-ideun-v1-teacher | Politica RL (PPO) | 11,42 millones de won | 95% | Apache 2.0 | HuggingFace |
| Jefe basado en reglas (규칙 사장) | Heuristica manual | 3,24 millones de won | 79% | no disponible | Integrado en el simulador |

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: la propia model card advierte de que no garantiza ni predice resultados empresariales reales.
- Dominio cerrado: solo opera sobre las entidades y preguntas definidas por Connect Tycoon (departamento, motivo, tramo de cliente, importe, `fraud_score`, etc.).
- Idioma limitado al coreano; no hay evidencia de soporte para otras lenguas.
- No es un modelo generativo de texto libre: no sirve para conversación, resumen, código ni tareas de lenguaje general.
- Sesgo de imitación: la primera fase de entrenamiento copia a un jefe heurístico, por lo que hereda sus sesgos antes de que PPO los corrija parcialmente.
- Función de recompensa simplificada a tres valores con peso idéntico (1,0); cambios en la ponderación o en la configuración de la empresa pueden alterar el comportamiento de forma no documentada.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de decisiones mal calibradas fuera del rango de estados visto durante el entrenamiento.
- Sin datos públicos de parámetros, contexto ni cuantización, lo que dificulta estimar coste de despliegue y reproducibilidad.
- Métricas internas de la model card (medias de 40 meses) no están acompañadas de desviaciones, intervalos de confianza ni protocolo de evaluación.
- Adopción nula en el momento de la consulta (0 descargas, 0 me gusta) y fecha de creación posterior a la del resto del ecosistema consultado; sin validación externa.
- Licencia Apache 2.0 permite uso comercial del modelo, pero el simulador y las marcas asociadas pueden tener sus propias condiciones.

## Enlaces

- HuggingFace: https://huggingface.co/kareyoung09/connectailab-rl-ideun-v1-teacher
- Repositorio GitHub de Connect Tycoon: https://github.com/wonseokjung/connect-tycoon
- Cuaderno Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de aprendizaje por refuerzo: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Banner del proyecto: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif
- Imagen del simulador: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
