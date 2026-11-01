# euna88/connectailab-rl-nextforest-v2-teacher

## Resumen

connectailab-rl-nextforest-v2-teacher es un modelo de aprendizaje por refuerzo profundo (PPO) publicado por el usuario euna88 bajo el paraguas del proyecto CONNECT TYCOON de CONNECT AI LAB. No es un modelo de lenguaje generativo: es una política de decisión entrenada para operar una empresa simulada durante un mes de 20 días laborables, tomando decisiones sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad. El modelo responde en formato JEV (typesafe/jev-1.13), un esquema estructurado de pregunta-respuesta con distribuciones de probabilidad sobre opciones discretas.

El modelo se presenta como el "córtex prefrontal" de un agente que gestiona la empresa simulada: primero aprende imitando a un "presidente por reglas" mediante aprendizaje supervisado y después ajusta sus decisiones con PPO usando recompensas derivadas de los valores de la empresa (beneficio 1,5, satisfacción del cliente 2,0, riesgo 2,0). Según la model card, supera de forma clara al baseline de reglas en el escenario descrito: 10,77 millones de wones de beneficio mensual frente a 3,24 millones, 96 % de satisfacción frente a 79 %, 3,1 incidentes de riesgo frente a 7,8 y 0,4 días de rotura de stock frente a 10,7.

La relevancia del modelo es acotada y experimental: se distribuye con licencia Apache 2.0, solo soporta coreano (ko), se carga mediante la librería `connect-tycoon` (no es un transformer con pesos safetensors al uso, sino un artefacto basado en numpy) y está pensado como material educativo sobre RL aplicado a toma de decisiones, no como sistema de producción para gestión empresarial real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo profundo (PPO) sobre simulador de empresa; sin arquitectura transformer declarada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el estado se define por observaciones estructuradas del simulador, no por tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Artefacto cargado vía `connect_tycoon.CompanyBrain.from_hub`; no se declara safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una política de decisión entrenada en dos fases según la model card: una primera fase de aprendizaje supervisado a partir de un "presidente por reglas" (behavior cloning sobre las decisiones del baseline) y una segunda fase de ajuste con PPO (Proximal Policy Optimization) usando recompensas derivadas de los valores de la empresa configurados en el entorno (`{"이익": 1.5, "고객 만족": 2.0, "위험": 2.0}`, es decir, beneficio 1,5, satisfacción del cliente 2,0 y riesgo 2,0). El entorno es un simulador de empresa con configuración explícita (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, `ad_power: 1.0`, entre otros parámetros).

La interfaz de inferencia es JEV (`typesafe/jev-1.13`): el modelo recibe un estado estructurado (por ejemplo, departamento, motivo, nivel de cliente, importe y puntuación de fraude) y una pregunta de tipo `choice` con criterios discretos, y devuelve una distribución de probabilidad sobre las opciones junto con la opción elegida y un nivel de confianza. No se documentan detalles sobre número de parámetros, volumen de datos de entrenamiento, composición del dataset ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El pipeline declarado en HuggingFace es `reinforcement-learning` y la librería asociada es `numpy`.

## Capacidades

- Toma de decisiones discretas en un entorno de simulación empresarial: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Salida estructurada en formato JEV con distribución de probabilidad sobre opciones, opción elegida y confianza asociada.
- Razonamiento de decisión con compromiso entre beneficio, satisfacción del cliente y riesgo, según los pesos configurados en el entorno.
- Aprendizaje por refuerzo con PPO y arranque supervisado desde una política de reglas.
- Integración con el simulador CONNECT TYCOON mediante `CompanyBrain` y el comando `connect-tycoon play --brain hf:...`.
- Soporte de idioma coreano en las instrucciones y criterios de decisión.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso fuera del bucle del simulador.

## Casos de uso

- Simulación educativa de gestión empresarial: el modelo actúa como "presidente" virtual en CONNECT TYCOON y permite a estudiantes de RL observar cómo una política entrenada toma decisiones de negocio mes a mes en un entorno reproducible.
- Investigación en aprendizaje por refuerzo aplicado a decisión secuencial: sirve como política de referencia (teacher) para experimentos de imitación, comparación de algoritmos PPO o análisis de recompensas multiobjetivo.
- Docencia de behavior cloning y PPO: la model card describe explícitamente las dos fases de entrenamiento, lo que lo hace útil como ejemplo didáctico de pipeline supervisado + RL.
- Evaluación de políticas en entornos con compensaciones (beneficio vs. satisfacción vs. riesgo): útil para estudiar cómo distintos pesos de recompensa alteran el comportamiento de la política en escenarios de reembolso y fraude.
- Integración en notebooks de Colab: el autor publica un notebook (`rl_decision_model_qwen_colab.ipynb`) para reproducir el entrenamiento y la inferencia, adecuado para talleres y cursos.
- Prototipado de agentes de decisión con interfaz JEV: el formato estructurado de pregunta-respuesta facilita conectar la política a otros simuladores o flujos de decisión que hablen JEV, siempre dentro de un contexto experimental.
- Benchmarking interno de políticas de RL: el baseline de reglas y las métricas reportadas (beneficio, satisfacción, incidentes, roturas de stock) permiten usar el modelo como referencia en comparaciones internas.

## Benchmarks y rendimiento

La model card reporta resultados medios sobre 40 meses no vistos comparando la política entrenada con el "presidente por reglas":

| Métrica (media de 40 meses) | Presidente por reglas | connect-ai-company-v4 |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 10,77 millones de wones |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 3,1 |
| Confirmaciones humanas excedidas | 37,8 | 11,2 |
| Días de rotura de stock | 10,7 | 0,4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se carga como artefacto numpy vía `connect-tycoon`, por lo que la huella depende del tamaño real de los pesos, no declarado.
- GPU recomendadas: no disponible; no se documenta requisito de GPU. Al ser una política pequeña de decisión, es probable que funcione en CPU, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub(...)` y comando `connect-tycoon play --brain hf:euna88/connectailab-rl-nextforest-v2-teacher`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas de RL para simulación empresarial con interfaz JEV). El único punto de comparación documentado es el baseline de reglas ("presidente por reglas") incluido en la propia model card.

## Limitaciones y advertencias

- El propio autor advierte que es un modelo educativo sobre un simulador de empresa sintético y que no garantiza ni predice resultados de gestión real.
- Solo soporta coreano (ko); no se documenta soporte multilingüe.
- No es un modelo de lenguaje: no genera texto libre, código ni respuestas abiertas; su salida está restringida a decisiones discretas en formato JEV.
- El rendimiento reportado (10,77 millones de wones, 96 % de satisfacción) está medido en un entorno concreto con una configuración específica (`warehouse: 250.0`, `base_demand: 40.0`, etc.) y no es extrapolable a otros escenarios sin reentrenamiento o reconfiguración.
- No se documentan análisis de sesgos, robustez ante distribuciones de estado fuera del simulador ni riesgos de alucinación (no aplica en el sentido habitual, pero sí riesgo de decisiones erróneas fuera de distribución).
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el uso en producción real de gestión empresarial no está validado por el autor.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se especifican parámetros totales, formato de pesos estándar ni requisitos de hardware, lo que dificulta la reproducibilidad fuera del ecosistema `connect-tycoon`.
- El identificador del modelo (`nextforest-v2-teacher`) y el nombre interno de la model card (`connect-ai-company-v4`) no coinciden, lo que puede generar confusión sobre la versión exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/euna88/connectailab-rl-nextforest-v2-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Esquema JEV referenciado: `typesafe/jev-1.13` (identificador citado en la model card; no se proporciona URL directa)
