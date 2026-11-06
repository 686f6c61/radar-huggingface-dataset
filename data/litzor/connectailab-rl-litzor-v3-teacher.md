# litzor/connectailab-rl-litzor-v3-teacher

## Resumen

connectailab-rl-litzor-v3-teacher es un modelo de decisión por refuerzo (reinforcement learning) desarrollado por el autor litzor en el marco del laboratorio educativo CONNECT AI LAB. No es un modelo de lenguaje generativo: es una política entrenada para operar una empresa simulada dentro del entorno CONNECT TYCOON, tomando decisiones mensuales sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad. El modelo recibe el estado de la compañía y devuelve decisiones en el formato del esquema JEV (`typesafe/jev-1.13`), con probabilidades por opción y un nivel de confianza.

La relevancia del modelo es fundamentalmente didáctica: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por refuerzo aplicado a toma de decisiones empresariales, desde el aprendizaje supervisado sobre un "presidente por reglas" hasta el ajuste fino con PPO usando una función de recompensa basada en los valores de la empresa (beneficio, satisfacción del cliente y riesgo). El autor reporta mejoras sustanciales frente a la política de referencia basada en reglas en métricas como beneficio mensual medio, satisfacción, incidentes de riesgo y días de rotura de stock.

El modelo se distribuye con licencia Apache 2.0, está etiquetado para el idioma coreano y se carga mediante la librería `connect-tycoon`, no mediante frameworks de inferencia de LLM. Su tamaño, arquitectura de red y volumen de entrenamiento no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL; no se especifica la red subyacente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el estado se pasa como estructura JSON por decisión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (carga vía `connect_tycoon.CompanyBrain.from_hub`) |

## Arquitectura y entrenamiento

La información disponible describe el proceso de entrenamiento en dos fases: primero un aprendizaje supervisado a partir de una política "presidente por reglas" (el modelo aprende a imitar decisiones heurísticas), y después un ajuste con PPO (Proximal Policy Optimization) usando como recompensa los valores de la compañía (`{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`, es decir, beneficio, satisfacción del cliente y riesgo, con peso unitario). El modelo se etiqueta con conceptos como "deep-reinforcement-learning", "gymnasium", "ppo" y "prefrontal-cortex", lo que sugiere un entorno tipo Gymnasium con observaciones estructuradas y acciones discretas por departamento.

No se especifica en la información proporcionada el tipo de red neuronal (MLP, transformer u otra), el número de parámetros, el volumen de episodios de entrenamiento, la composición del dataset sintético ni detalles del bucle de optimización (learning rate, clipping de PPO, número de épocas). El entorno simula 20 días laborables por mes y expone un estado con campos como departamento, motivo, nivel de cliente, importe y puntuación de fraude; las acciones son elecciones discretas (por ejemplo, reembolso total, parcial, denegación o derivación a humano).

## Capacidades

- Toma de decisiones discretas en un entorno empresarial simulado: asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, gestión de reembolsos y seguridad.
- Salida estructurada en formato JEV con distribuciones de probabilidad por opción, nivel de confianza y un campo de justificación (`reason`).
- Manejo de estados con información parcial y ruido (por ejemplo, `fraud_score` continuo para decidir si se aprueba un reembolso).
- Política entrenada para equilibrar objetivos múltiples (beneficio, satisfacción, riesgo) en lugar de maximizar una sola métrica.
- Integración con el simulador CONNECT TYCOON mediante `CompanyBrain` y ejecución como "cerebro" del juego con `connect-tycoon play --brain hf:...`.
- No soporta generación de texto libre, tool calling genérico, visión, audio ni razonamiento multi-paso fuera del esquema de decisión definido por el entorno.
- Idioma de trabajo: coreano (etiquetas y ejemplos de la model card en coreano).

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo completo y reproducible de un pipeline RL (entorno Gymnasium, recompensa multiobjetivo, PPO) para cursos y talleres, con notebook de Colab incluido en el repositorio.
- Investigación en políticas multiobjetivo: permite experimentar con funciones de recompensa alternativas (por ejemplo, ponderar más el riesgo o la satisfacción) y comparar contra la política de reglas de referencia.
- Simulación de gestión empresarial: ejecutar el modelo como "presidente" en CONNECT TYCOON para observar cómo evoluciona una compañía sintética a lo largo de 40 meses con las métricas reportadas por el autor.
- Evaluación de agentes de decisión en entornos con información imperfecta: el campo `fraud_score` y la opción de derivación a humano permiten estudiar políticas conservadoras frente a riesgo.
- Generación de datos sintéticos de decisiones: usar las salidas probabilísticas del modelo para construir datasets etiquetados de decisiones empresariales para otros experimentos.
- Benchmarking de entornos RL: comparar el rendimiento de otras políticas (reglas, RL, LLM) sobre el mismo simulador y las mismas métricas (beneficio, satisfacción, incidentes, roturas de stock).
- Integración en demos educativas: el formato JEV facilita mostrar en vivo cómo un agente recibe un estado y devuelve una decisión con probabilidades, útil en charlas y talleres.

## Benchmarks y rendimiento

El autor reporta métricas medias sobre 40 meses no vistos previamente, comparando la política de reglas con este modelo:

| Métrica (media 40 meses) | Presidente por reglas | connectailab-rl-litzor-v3-teacher |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 11,71 M KRW |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,4 |
| Derivaciones a humano | 37,8 | 15,0 |
| Días de rotura de stock | 10,7 | 0,6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM de propósito general.

## Requisitos de hardware

- VRAM estimada: no disponible; al no especificarse el tamaño de la red, no puede calcularse. Por el tipo de tarea (decisiones discretas sobre estados JSON pequeños) es previsible que sea muy inferior a la de un LLM, pero no hay datos confirmados.
- GPU recomendadas: no disponible. El modelo se carga mediante `connect-tycoon`, que no requiere necesariamente GPU.
- Compatibilidad con GPU de consumo: no confirmada; probablemente ejecutable en CPU dada la naturaleza del entorno, pero no se detalla en la información.
- Opciones de despliegue: `pip install "connect-tycoon[game]"` y `connect-tycoon play --brain hf:litzor/connectailab-rl-litzor-v3-teacher`; también carga programática con `ct.CompanyBrain.from_hub(...)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (políticas RL para simulación empresarial) en la documentación proporcionada. La única referencia interna es la política "presidente por reglas" del propio entorno, cuyos resultados se recogen en la tabla de benchmarks. Para modelos de lenguaje de decisión no hay comparación disponible.

## Limitaciones y advertencias

- El propio autor advierte que es un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados empresariales reales.
- Entrenado exclusivamente para el entorno CONNECT TYCOON con una configuración concreta de empresa (`warehouse: 250.0`, `base_demand: 40.0`, etc.); su comportamiento fuera de esa distribución no está validado.
- Idioma y etiquetas en coreano; la documentación y los ejemplos están en coreano, lo que puede limitar su adopción fuera de ese contexto.
- No es un modelo de lenguaje: no genera texto libre ni admite instrucciones abiertas; solo responde al esquema de decisión JEV definido por el entorno.
- Riesgo de sobreajuste a la política de reglas en la fase supervisada y a la función de recompensa concreta en la fase PPO; cambios en los pesos de beneficio, satisfacción o riesgo pueden alterar el comportamiento de forma no documentada.
- No se detallan sesgos conocidos, tasas de alucinación (no aplica en el sentido habitual) ni limitaciones de contexto más allá del estado estructurado por decisión.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Sin descargas ni "likes" en Hugging Face en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litzor/connectailab-rl-litzor-v3-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
