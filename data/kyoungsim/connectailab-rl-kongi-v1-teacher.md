# kyoungsim/connectailab-rl-kongi-v1-teacher

## Resumen

connectailab-rl-kongi-v1-teacher es un modelo de decisión basado en aprendizaje por refuerzo (RL) desarrollado por kyoungsim dentro del ecosistema CONNECT AI LAB / CONNECT TYCOON. No es un modelo de lenguaje generativo: es una política PPO entrenada para operar una empresa simulada durante un mes de 20 días laborables, tomando decisiones sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad. Su salida se formaliza en el formato JEV (`typesafe/jev-1.13`), un esquema de preguntas y respuestas tipadas que permite integrarlo en pipelines de decisión estructurada.

El modelo se entrenó en dos fases: primero imitación de un "presidente por reglas" (aprendizaje supervisado) y después ajuste fino con PPO usando una función de recompensa multicriterio que pondera beneficio, satisfacción del cliente y riesgo. La model card reporta que, sobre 40 meses no vistos, supera ampliamente a la política de reglas en beneficio mensual medio (10,96 millones de wones frente a 3,24 millones), satisfacción (95 % frente a 79 %) y reduce incidentes de riesgo, intervenciones humanas y días de rotura de stock.

Es relevante ahora como ejemplo de modelo de decisión de pequeño tamaño, empaquetado como artefacto NumPy y publicado con licencia Apache 2.0, que se puede ejecutar localmente dentro de un simulador de negocio. Su alcance es educativo y de investigación: no es un modelo de propósito general ni un sustituto de un LLM, y no ofrece garantías sobre resultados empresariales reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo profundo (PPO) sobre observaciones estructuradas del simulador; no es un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre el estado estructurado de un mes simulado de 20 días laborables) |
| Tipos de cuantizacion | no disponible (pesos empaquetados para NumPy; no se documentan variantes GGUF o cuantizadas) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | artefacto NumPy cargable mediante `connect_tycoon.CompanyBrain.from_hub`; no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La política se entrena con PPO (Proximal Policy Optimization) sobre el entorno `gymnasium` del simulador CONNECT TYCOON. La fase inicial es de imitación de un "presidente por reglas" (aprendizaje supervisado), tras la cual se aplica RL con una recompensa derivada de los valores de empresa declarados: beneficio 1.0, satisfacción del cliente 1.0 y riesgo 1.0. El modelo recibe estados estructurados (por ejemplo, departamento, motivo, nivel de cliente, importe y puntuación de fraude) y devuelve decisiones tipadas en formato JEV con distribución de probabilidad sobre las opciones disponibles.

La configuración de empresa usada en la model card es `{"warehouse": 250.0, "base_demand": 40.0, "unit_cost": 1.5, "order_scale": 1.0, "staff_bonus": 0, "wage": 0.0, "ad_power": 1.0, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. No se documentan en la información disponible el número de tokens de entrenamiento (no aplica en el sentido de LLM), la composición exacta del dataset de imitación, ni detalles de la red neuronal (capas, dimensión de embedding, función de activación). La librería declarada es `numpy`, lo que sugiere una inferencia ligera sin dependencias de frameworks de deep learning en tiempo de ejecución.

## Capacidades

- Toma de decisiones discretas con distribución de probabilidad sobre opciones tipadas (por ejemplo, reembolso total, parcial, denegación o derivación a humano).
- Gestión operativa de una empresa simulada: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Respuesta en formato JEV (`typesafe/jev-1.13`), lo que facilita la integración en pipelines estructurados y la validación de esquemas.
- Salida con nivel de confianza (`confidence`) y probabilidades por opción, útil para umbrales de derivación a revisión humana.
- Ejecución local vía NumPy, sin necesidad de GPU para inferencia.
- Integración con el simulador mediante `connect-tycoon play --brain hf:kyoungsim/connectailab-rl-kongi-v1-teacher`.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni razonamiento en lenguaje natural; su ámbito es la decisión estructurada en el simulador.

## Casos de uso

- Simulación educativa de gestión empresarial: el modelo actúa como "presidente" dentro de CONNECT TYCOON para enseñar RL y toma de decisiones bajo restricciones, con resultados medibles en beneficio, satisfacción y riesgo.
- Investigación en RL multiobjetivo: sirve como política de referencia para estudiar el equilibrio entre beneficio, satisfacción y riesgo con recompensas ponderadas.
- Evaluación de políticas de reembolso: el ejemplo de la model card (reembolso con `fraud_score` 0.3146) muestra cómo el modelo asigna probabilidad 0.9805 a reembolso total, lo que permite analizar umbrales de fraude y coste humano.
- Benchmarking de agentes de decisión: comparar políticas PPO frente a políticas basadas en reglas en un entorno reproducible de 40 meses no vistos.
- Docencia de integración JEV: el modelo sirve como ejemplo práctico de salida tipada con probabilidades y confianza para enseñar contratos de datos en sistemas de decisión.
- Prototipado de "cerebro de empresa" en entornos controlados: permite probar arquitecturas de decisión (por ejemplo, `CompanyBrain`) antes de trasladar lógica a sistemas reales, siempre con validación humana.
- Demostración de despliegue ligero: al cargarse con NumPy y ejecutarse localmente, es útil para talleres y demos sin infraestructura GPU.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la model card, medidos sobre 40 meses no vistos en el simulador:

| Métrica (media en 40 meses) | Presidente por reglas | connectailab-rl-kongi-v1-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 10,96 millones de wones |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,2 |
| Intervenciones humanas | 37,8 | 13,4 |
| Días de rotura de stock | 10,7 | 0,3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede aplicarlos a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo se carga con NumPy y no requiere GPU según la información disponible.
- GPU recomendadas: no aplica; la inferencia es ligera y compatible con CPU.
- Cabe en GPU de consumo: sí, en la práctica no necesita GPU; cualquier CPU moderna es suficiente.
- Opciones de despliegue: `connect-tycoon` (paquete con extra `[game]`), carga vía `CompanyBrain.from_hub` y ejecución local con NumPy. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (políticas RL para simulación empresarial) en la información proporcionada. La comparación directa disponible es con la política de reglas del propio simulador, recogida en la tabla de benchmarks.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-kongi-v1-teacher | Política PPO (NumPy) | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Presidente por reglas (CONNECT TYCOON) | Política basada en reglas | no aplica | no aplica | incluida en el simulador | GitHub del proyecto |
| Otros modelos RL comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo educativo: la propia model card indica que es un modelo docente sobre un simulador sintético y que no garantiza ni predice resultados empresariales reales.
- Ámbito restringido: solo opera sobre el estado estructurado del simulador CONNECT TYCOON; no es un LLM y no procesa lenguaje natural libre.
- Idioma: únicamente coreano (ko); no se documenta soporte multilingüe.
- Sesgos: al entrenarse con una recompensa ponderada (beneficio, satisfacción, riesgo) y con imitación de una política de reglas, puede heredar los sesgos de esa política y de la configuración de empresa usada en entrenamiento.
- Riesgo de generalización limitada: los resultados reportados corresponden a la configuración `{"warehouse": 250.0, ...}`; no se documenta comportamiento con otras configuraciones.
- Alucinación: no aplica en el sentido generativo, pero las probabilidades de decisión pueden ser sobreconfiadas (por ejemplo, 0.9805) y no incorporan calibración documentada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo depende del simulador `connect-tycoon` y de JEV; conviene revisar las licencias de esas dependencias antes de producción.
- Para producción: requiere validación humana y no debe usarse como sustituto de sistemas de decisión auditados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kyoungsim/connectailab-rl-kongi-v1-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
