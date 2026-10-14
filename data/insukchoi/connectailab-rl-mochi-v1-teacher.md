# insukchoi/connectailab-rl-mochi-v1-teacher

## Resumen

connectailab-rl-mochi-v1-teacher es un modelo de decisión basado en aprendizaje por refuerzo profundo, publicado en HuggingFace por insukchoi (Mochi / Choi In-suk), investigadora del CONNECT AI LAB. No es un modelo de lenguaje: actúa como la "corteza prefrontal" de una empresa simulada dentro de CONNECT TYCOON, un simulador sintético de gestión empresarial donde el agente debe tomar decisiones mensuales (20 días laborables) sobre plantilla, reposición de inventario, marketing, atención al cliente, devoluciones y seguridad.

El modelo se entrenó en dos fases: primero imitación supervisada de un "jefe de reglas" (política heurística predefinida) y después ajuste con PPO usando una recompensa multiobjetivo definida por los valores de la empresa (beneficio, satisfacción del cliente y riesgo, todos con peso 1.0). La salida no es texto libre, sino decisiones estructuradas en formato JEV (referenciado como typesafe/jev-1.13), con elección discreta, distribución de probabilidades, nivel de confianza y una etiqueta de motivo.

Es relevante como ejemplo didáctico y de investigación de un pipeline completo de RL aplicado a un dominio de negocio, con una comparativa publicada frente a la política de reglas en 40 meses no vistos. La model card indica explícitamente que se trata de un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados reales de gestión. La ficha se publicó el 13 de octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre una red neuronal cuya topología no se especifica; declarada como "corteza prefrontal" del simulador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | numpy (formato exacto de serialización no especificado) |
| Librería declarada | numpy |
| Pipeline | reinforcement-learning |
| Fecha de publicación | 2026-10-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, dimensión de las representaciones, tipo de encoder del estado). Lo que sí se especifica es el procedimiento de entrenamiento en dos etapas: una primera fase de aprendizaje supervisado en la que el agente imita a un "jefe de reglas" (지도학습, aprendizaje guiado), seguida de una fase de optimización con PPO (Proximal Policy Optimization) en la que la política se corrige con las recompensas derivadas de los valores de la empresa.

La función de recompensa es multiobjetivo y explícita: `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`, es decir, beneficio, satisfacción del cliente y riesgo, con peso unitario cada uno. El agente opera sobre un estado del simulador que incluye departamento, motivo de la incidencia, nivel de cliente, importe y una puntuación de fraude (`fraud_score`), y emite decisiones tipadas en el formato JEV. La configuración del entorno usada en la evaluación publicada es `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. No se documentan innovaciones arquitectónicas adicionales (decodificación especulativa, atención lineal, arquitecturas híbridas, etc.), ni el volumen o composición exacta de los datos de entrenamiento.

## Capacidades

- Toma de decisiones discreta en seis áreas operativas del simulador: asignación de personal, pedidos de inventario, marketing, atención al cliente, devoluciones y seguridad.
- Salida estructurada en formato JEV: tipo de decisión, opción elegida, distribución de probabilidad sobre las alternativas, nivel de confianza y etiqueta de motivo (en el ejemplo publicado, `"reason": "강화학습 정책"`, "política de aprendizaje por refuerzo").
- Gestión de compensaciones (trade-offs) entre beneficio, satisfacción del cliente y riesgo, codificadas en la recompensa.
- Decisión sobre derivación a revisión humana en casos de posible fraude (opción `human` con coste asociado de 0,8 만원 por caso).
- Integración en el simulador mediante `CompanyBrain.from_hub(...)` y ejecución como agente jugable con `connect-tycoon play --brain hf:insukchoi/connectailab-rl-mochi-v1-teacher`.
- Idiomas: únicamente coreano. No soporta tool calling, function calling, generación de código, matemáticas simbólicas, visión, audio ni modos de razonamiento extendido, ya que no es un modelo generativo de texto.

## Casos de uso

- Simulación educativa de gestión empresarial: el modelo se coloca como "presidente" de una empresa virtual y se observa su desempeño mes a mes frente a la política de reglas, lo que permite ilustrar el impacto de decisiones operativas en beneficio, satisfacción y riesgo.
- Investigación en aprendizaje por refuerzo: sirve como referencia reproducible de un pipeline imitación + PPO con recompensa multiobjetivo, útil para estudiar estabilidad de entrenamiento y equilibrio entre objetivos en conflicto.
- Aprendizaje por imitación (teacher-student): la etiqueta `teacher` en el identificador sugiere su uso como política maestra de la que destilar políticas más pequeñas; la model card indica además que es un "modelo de participación conjunta" en un experimento de conexión de modelos en fase de prueba.
- Evaluación comparativa de heurísticas: el escenario de 40 meses no vistos permite medir si una política aprendida supera a un sistema basado en reglas en métricas operativas concretas (días sin stock, incidencias de riesgo, escalados a humano).
- Pruebas de robustez frente al fraude: el estado incluye `fraud_score` y la política decide entre reembolso total, parcial, denegación o revisión humana, lo que lo hace adecuado para analizar políticas de tolerancia al abuso en entornos controlados.
- Formación de desarrolladores en RL aplicado: el repositorio incluye un notebook de Colab para entrenamiento directo, utilizable en cursos sobre Gymnasium, PPO y entornos personalizados.
- Integración como componente de decisión en el juego CONNECT TYCOON: el modelo se instala con `pip install "connect-tycoon[game]"` y se conecta como cerebro del agente jugable.
- Interoperabilidad mediante JEV: al responder en un esquema tipado con probabilidades y confianza, puede insertarse en un sistema mayor que consuma decisiones de distintos modelos bajo el mismo formato, siempre que estos respeten el contrato JEV.

## Benchmarks y rendimiento

La model card publica una comparativa entre la política de reglas y connect-ai-company-v1 sobre 40 meses no vistos previamente. Los valores son medias por mes:

| Métrica (media de 40 meses no vistos) | Jefe de reglas | connect-ai-company-v1 |
|---|---|---|
| Beneficio mensual | 3,24 millones de won | 10,93 millones de won |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 3,8 |
| Revisiones humanas excedidas | 37,8 | 23,5 |
| Días sin stock | 10,7 | 0,6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos de RL de propósito general.

## Requisitos de hardware

- VRAM estimada: no disponible. Al declararse la librería `numpy` y no especificarse pesos en safetensors, GGUF ni ningún formato de inferencia con GPU, lo previsible es inferencia en CPU; el tamaño real de los pesos no se documenta.
- GPU recomendadas: no se documenta ninguna. No hay indicios de que el modelo requiera aceleración por GPU para la inferencia.
- Compatibilidad con GPU de consumo: no disponible; el modelo es de decisión, no generativo, por lo que el cuello de botella habitual de VRAM no aplica del mismo modo.
- Opciones de despliegue: paquete `connect-tycoon` con `CompanyBrain.from_hub("insukchoi/connectailab-rl-mochi-v1-teacher")` y ejecución como agente con `connect-tycoon play --brain hf:insukchoi/connectailab-rl-mochi-v1-teacher`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles.
- Entorno de entrenamiento: se ofrece un notebook de Colab para entrenamiento directo, sin especificar los recursos de cómputo empleados.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| connectailab-rl-mochi-v1-teacher | Política RL (PPO) para simulación de empresa | no disponible | no aplica | 10,93 M won/mes, 95 % satisfacción, 3,8 incidentes, 0,6 días sin stock | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Jefe de reglas (CONNECT TYCOON) | Heurística programada | no aplica | no aplica | 3,24 M won/mes, 79 % satisfacción, 7,8 incidentes, 10,7 días sin stock | No especificada (incluida en el repositorio connect-tycoon) | Repositorio GitHub del simulador |
| Otros modelos de decisión para el mismo entorno | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen en la información proporcionada otros modelos públicos comparables de la misma categoría (políticas de RL específicas para simulación empresarial con salida JEV).

## Limitaciones y advertencias

- El propio autor advierte de que se trata de "un modelo educativo sobre un simulador sintético de empresa" que "no garantiza ni predice resultados reales de gestión". Los números de la tabla de benchmarks pertenecen exclusivamente al simulador.
- No es un modelo de lenguaje: no genera texto libre, no razona en lenguaje natural y no puede sustituir a un LLM en tareas conversacionales.
- Idioma: la documentación y los motivos de decisión están en coreano; no se declara soporte multilingüe.
- Sesgo de origen: la política aprende primero de un "jefe de reglas" y después de una función de recompensa con pesos fijados manualmente (beneficio, satisfacción y riesgo a 1.0 cada uno). Cambiar esos pesos altera el comportamiento, y las decisiones heredan los sesgos de la heurística inicial.
- Riesgo de sobreajuste al entorno: la evaluación se realiza en el mismo simulador con una configuración concreta (`warehouse`, `base_demand`, `unit_cost`, etc.); no hay evidencia de generalización a otras configuraciones ni a dominios reales.
- Alucinación: el concepto no aplica en el sentido generativo, pero sí existe riesgo de decisiones con confianza alta en estados poco representados; la propia salida incluye una probabilidad y un campo `confidence` (0,5095 en el ejemplo publicado) que conviene inspeccionar antes de automatizar cualquier acción.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se indique si hubo cambios. No se declaran restricciones adicionales.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, y la model card indica que el experimento de "conexión de modelos" (Connect AI) está en fase de prueba. No hay validación independiente ni terceros que hayan replicado los resultados.
- Fecha de publicación registrada como 2026-10-13, posterior a la fecha habitual de consulta; conviene verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/insukchoi/connectailab-rl-mochi-v1-teacher
- Repositorio CONNECT TYCOON (GitHub): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de IA con aprendizaje por refuerzo (AI CITY BUILDERS): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Formato de decisión JEV citado en la model card: typesafe/jev-1.13 (sin URL verificada en la información disponible)
- Recursos gráficos referenciados en la model card: https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/brand/banner.gif y https://raw.githubusercontent.com/wonseokjung/connect-tycoon/main/docs/images/hero.gif
