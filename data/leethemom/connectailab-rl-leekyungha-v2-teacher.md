# leethemom/connectailab-rl-leekyungha-v2-teacher

## Resumen

connect-ai-company-v2 es una política de decisión entrenada con aprendizaje por refuerzo profundo (PPO) que actúa como "cerebro" de una empresa simulada dentro del entorno CONNECT TYCOON. Lo publica el instructor de formación en IA Lee Kyungha (usuario `leethemom`) en el marco del laboratorio colaborativo CONNECT AI LAB, junto con el desarrollador del simulador. No es un modelo de lenguaje: es un artefacto NumPy que consume observaciones estructuradas del estado de la empresa y emite decisiones discretas en formato JEV (JSON estructurado y tipado), sin generación de texto libre.

El modelo resuelve un problema acotado pero representativo: la toma de decisiones secuenciales bajo múltiples objetivos en conflicto (beneficio, satisfacción del cliente y riesgo). Gestiona durante 20 días laborables las áreas de asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad, y devuelve para cada cuestión una elección con distribución de probabilidad y nivel de confianza. Su interés actual reside en que ejemplifica un patrón de "modelo conectado" (Connect AI) donde un cerebro RL se integra en un pipeline de agentes mediante un esquema de preguntas y respuestas tipado, en lugar de prompts en lenguaje natural.

La arquitectura subyacente es una red neuronal pequeña implementada sobre NumPy, entrenada primero por imitación de un "presidente de reglas" (aprendizaje supervisado) y después ajustada con PPO usando la función de valor de la empresa como recompensa. El contexto, los parámetros y los idiomas de un LLM no aplican aquí: el modelo solo opera sobre el estado del simulador y su etiqueta de idioma es coreano (`ko`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para RL (implementación NumPy), entrenada con PPO sobre un entorno Gymnasium |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume el estado estructurado del simulador) |
| Tipos de cuantizacion | no disponible (pesos NumPy; no se documentan cuantizaciones) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (artefacto NumPy cargado vía `ct.CompanyBrain.from_hub`) |

## Arquitectura y entrenamiento

El modelo es una política de decisión entrenada en dos fases. Primero, aprendizaje supervisado por imitación de un "presidente de reglas" (rule-based teacher) que actúa como referencia en el simulador CONNECT TYCOON. Después, ajuste fino con PPO (Proximal Policy Optimization) utilizando como recompensa la función de valor de la empresa, definida explícitamente como `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`, es decir, peso unitario para beneficio, satisfacción del cliente y riesgo. El entorno es un simulador de empresa sintético con configuración fija (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, `wage: 0.0`, `ad_power: 1.0`, entre otros).

La interfaz de inferencia es el esquema JEV (`typesafe/jev-1.13`): el consumidor envía un objeto con `state` y `questions`, y el modelo devuelve `answers` con `type`, `choice`, `probabilities`, `confidence` y un campo `reason` que en el ejemplo publicado es simplemente `"강화학습 정책"` (política de aprendizaje por refuerzo), no una justificación generada. No hay decodificación especulativa, atención lineal ni mecanismos de LLM: la innovación técnica relevante es el contrato tipado de entrada/salida que permite conectar el cerebro RL a un agente o a un juego sin prompts.

## Capacidades

- Toma de decisiones discretas de elección múltiple sobre el estado de la empresa simulada (reembolsos, pedidos, marketing, personal, seguridad).
- Salida probabilística calibrada por opción (`probabilities`) junto con una confianza agregada (`confidence`), lo que permite umbrales de derivación a humano.
- Integración mediante esquema JEV tipado (`typesafe/jev-1.13`), apto para pipelines de agentes que requieran respuestas estructuradas.
- Operación como oponente o "cerebro" en el juego CONNECT TYCOON (`connect-tycoon play --brain hf:...`).
- Gestión multiobjetivo de un horizonte de 20 días laborables con señales de beneficio, satisfacción y riesgo.
- Soporte de derivación a intervención humana como una opción más de la política (opción `human` en el ejemplo de reembolso).
- No soporta generación de texto libre, tool calling genérico, visión, audio ni razonamiento multi-paso fuera del entorno para el que fue entrenado.

## Casos de uso

- Simulación educativa de gestión empresarial: el modelo se sienta como "presidente" en CONNECT TYCOON y opera la empresa durante un mes simulado, sirviendo para enseñar RL y decisiones multiobjetivo en cursos de formación en IA.
- Evaluación de políticas de reembolso: dado un estado con `department: refund`, motivo, nivel de cliente, importe y `fraud_score`, el modelo elige entre reembolso total, parcial, denegación o revisión humana con probabilidades explícitas, lo que permite definir umbrales de fraude en el simulador.
- Benchmark de referencia para investigadores de RL: al publicar métricas frente al "presidente de reglas" (beneficio medio de 11,43 M KRW frente a 3,24 M KRW en 40 meses no vistos), sirve como línea base para comparar nuevas políticas PPO en el mismo entorno.
- Componente de agente en pipelines JEV: cualquier orquestador que hable el esquema `typesafe/jev-1.13` puede enviar estados y recibir decisiones tipadas, integrándolo como sub-agente especializado en decisiones operativas.
- Docencia de aprendizaje por imitación más RL: el par (profesor de reglas, alumno PPO) es un caso práctico para explicar inicialización supervisada, función de recompensa y evaluación con episodios no vistos.
- Pruebas de robustez de simuladores: al fijar la configuración de la empresa, se puede usar el modelo para detectar desequilibrios del entorno (por ejemplo, que una política aprendida alcance 96 % de satisfacción con 0,4 días de rotura de stock).

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre 40 meses no vistos (promedio por mes):

| Métrica | Presidente de reglas | connect-ai-company-v2 |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 11,43 M KRW |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,3 |
| Confirmaciones humanas excedidas | 37,8 | 13,3 |
| Días con rotura de stock | 10,7 | 0,4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto se ejecuta sobre NumPy en CPU y no requiere GPU para inferencia.
- GPU recomendadas: no aplica; cualquier CPU es suficiente para el tamaño típico de una política de este tipo.
- Compatibilidad con GPU de consumo: irrelevante, el cuello de botella es el simulador, no la red.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `ct.CompanyBrain.from_hub("leethemom/connectailab-rl-leekyungha-v2-teacher")`, y ejecución interactiva con `connect-tycoon play --brain hf:...`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Licencia | Métricas publicadas |
|---|---|---|---|---|
| connect-ai-company-v2 (este) | Política PPO en NumPy | CONNECT TYCOON | Apache 2.0 | Beneficio 11,43 M KRW/mes, satisfacción 96 % |
| Presidente de reglas (referencia del propio proyecto) | Política basada en reglas | CONNECT TYCOON | no disponible | Beneficio 3,24 M KRW/mes, satisfacción 79 % |
| Políticas PPO de Stable-Baselines3 | Implementaciones genéricas de PPO | Gymnasium (cualquiera) | MIT | no disponible |
| Cerebros RL de otros proyectos Connect AI | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones con modelos de la misma categoría fuera del ecosistema CONNECT AI LAB en la información proporcionada.

## Limitaciones y advertencias

- Modelo educativo y sintético: la propia model card advierte que no garantiza ni predice resultados de gestión real.
- Entrenado para una configuración concreta de empresa (`warehouse: 250.0`, `base_demand: 40.0`, etc.); su comportamiento fuera de esa distribución no está validado.
- Solo emite decisiones de elección múltiple dentro del esquema JEV; no genera explicaciones reales (el campo `reason` es una etiqueta fija).
- Idioma coreano: la documentación y las etiquetas están en coreano; no hay soporte multilingüe.
- Riesgo de sobreajuste al profesor de reglas y a la función de recompensa definida; los pesos de valor (1, 1, 1) son una elección de diseño no justificada empíricamente en la información disponible.
- Sesgos: no documentados; al operar sobre un simulador, los sesgos provienen del diseño del entorno y de la política del profesor.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero el modelo puede producir decisiones de alta confianza incorrectas en estados atípicos.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el simulador y las dependencias (`connect-tycoon`, JEV) deben verificarse por separado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso externo ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leethemom/connectailab-rl-leekyungha-v2-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Esquema JEV referenciado: `typesafe/jev-1.13` (identificador citado en la model card; no se proporciona URL directa)
