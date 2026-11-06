# connect-ai-lab-aimo/connectailab-rl-juju-v1-teacher

## Resumen

connectailab-rl-juju-v1-teacher es un modelo de decisión basado en aprendizaje por refuerzo profundo (deep reinforcement learning) desarrollado por CONNECT AI LAB en colaboración con AI CITY BUILDERS. No es un modelo de lenguaje generativo: es una política PPO que actúa como "cerebro" (el autor lo describe como corteza prefrontal) de una empresa simulada dentro del entorno CONNECT TYCOON, donde debe tomar decisiones operativas como asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad.

El modelo recibe el estado de la empresa y devuelve respuestas en formato JEV (`typesafe/jev-1.13`), un esquema de pregunta-respuesta con decisiones tipadas (`choice`) y distribuciones de probabilidad. Se entrenó primero con aprendizaje supervisado imitando a un "presidente por reglas" y después se ajustó con PPO usando una función de recompensa basada en el valor de la empresa: beneficio, satisfacción del cliente y riesgo.

Es relevante como ejemplo de aplicación de RL a la toma de decisiones empresariales en un simulador sintético, y por su integración con un formato estructurado de decisión (JEV) que facilita la evaluación determinista. El modelo está pensado para uso educativo y de demostración, no para predecir resultados reales de negocio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO); arquitectura de red no detallada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre estados estructurados del simulador) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería declarada: numpy) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura de red (número de capas, dimensión de las representaciones, tipo de encoder del estado). Se sabe que la política se entrena con PPO (Proximal Policy Optimization) sobre el simulador CONNECT TYCOON, y que el proceso tiene dos fases: primero aprendizaje supervisado imitando a un "presidente por reglas" (behavior cloning), y después ajuste con PPO usando recompensas derivadas del valor de la empresa (`{"이익": 1, "고객 만족": 1, "위험": 1}`, es decir, beneficio, satisfacción del cliente y riesgo con pesos iguales).

El modelo opera sobre un espacio de estados estructurado (departamento, motivo, nivel de cliente, importe, puntuación de fraude, etc.) y produce decisiones discretas tipadas según el esquema JEV, con probabilidades asociadas y un campo de confianza. La configuración de la empresa usada en la evaluación es `{"warehouse": 250, "base_demand": 40, "unit_cost": 1.5, "order_scale": 1, "staff_bonus": 0, "wage": 0, "ad_power": 1, "fraud_tool": 0, "extra_cs": 0, "extra_refund": 0}`. No se especifican el número de tokens, la composición del dataset ni detalles adicionales del pipeline de entrenamiento.

## Capacidades

- Toma de decisiones discretas en un entorno empresarial simulado: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Respuesta en formato JEV estructurado, con tipo de pregunta (`choice`), opción seleccionada, distribución de probabilidad sobre las alternativas y nivel de confianza.
- Gestión de decisiones con compensaciones explícitas (trade-offs): por ejemplo, reembolsar a un cliente fraudulento cuesta dinero, mientras que rechazar a un cliente legítimo reduce la satisfacción.
- Operación sobre estados estructurados con múltiples variables (departamento, motivo, nivel de cliente, importe, puntuación de fraude).
- Integración con el simulador CONNECT TYCOON mediante `CompanyBrain.from_hub(...)` y el comando `connect-tycoon play --brain hf:...`.
- No dispone de generación de texto libre, tool calling, capacidades multimodales ni razonamiento multi-paso genérico; su ámbito es la política de decisión entrenada.

## Casos de uso

- Evaluación educativa de RL: servir como política de referencia ("teacher") para comparar contra un "presidente por reglas" en un entorno reproducible, midiendo beneficio mensual, satisfacción, incidentes de riesgo, escalados a humano y días sin stock.
- Demostración de toma de decisiones con compensaciones: usar el modelo para ilustrar cómo una política aprendida resuelve el dilema entre reembolso completo, parcial, rechazo o escalado a humano en función del importe y la puntuación de fraude.
- Formato de decisión estructurado en producción interna: integrar el esquema JEV para que un sistema de gestión reciba decisiones tipadas con probabilidades y confianza, en lugar de texto libre, facilitando la validación y el registro.
- Benchmark de políticas en simuladores: emplear el modelo como línea base frente a nuevas políticas PPO o de imitación en el mismo entorno CONNECT TYCOON.
- Docencia de RL aplicado a negocio: usar el notebook de Colab y el repositorio para que estudiantes entrenen y comparen políticas sobre el mismo simulador.
- Prototipado de agentes de decisión en entornos sintéticos: servir de plantilla para adaptar la interfaz JEV a otros dominios con estados estructurados y acciones discretas.
- Análisis de calibración de confianza: estudiar la relación entre la probabilidad emitida por la política y la calidad de la decisión en escenarios de fraude y atención al cliente.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan la política entrenada con el "presidente por reglas" sobre 40 meses no vistos, con la configuración de empresa indicada:

| Métrica (media de 40 meses no vistos) | Presidente por reglas | connect-company-v2 |
|---|---|---|
| Beneficio mensual | 7,08 millones de wones | 17,13 millones de wones |
| Satisfacción del cliente | 71 % | 96 % |
| Incidentes de riesgo | 11,5 | 1,2 |
| Escalados a humano | 69,5 | 14,6 |
| Días sin stock | 9,1 | 0,3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del modelo no se especifica y la librería declarada es numpy, lo que sugiere una política ligera que probablemente se ejecuta en CPU.
- GPU recomendadas: no disponible; por la naturaleza del modelo (política de decisión sobre estados estructurados), no se requieren GPU de datacenter.
- ¿Cabe en GPU de consumo? No hay datos que permitan afirmarlo, pero el uso de numpy y la ausencia de pesos en safetensors/GGUF apuntan a un modelo de muy baja huella.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub(...)` y ejecución con `connect-tycoon play --brain hf:...`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-juju-v1-teacher | Política RL (PPO) para simulación empresarial | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Presidente por reglas (baseline del propio autor) | Sistema basado en reglas | no aplica | no aplica | no disponible | Incluido en el simulador |
| Otros modelos de RL para decisión (p. ej. políticas PPO en Gymnasium) | Política RL | depende del entorno | no aplica | variable | variable |

No se dispone de información sobre modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento en este entorno concreto; la comparativa significativa es la que el propio autor publica frente al baseline de reglas.

## Limitaciones y advertencias

- El propio autor advierte que es un modelo educativo sobre un simulador sintético de empresa y que no garantiza ni predice resultados reales de negocio.
- El modelo está entrenado para un entorno y una configuración concretos; su comportamiento fuera de esa distribución (otra configuración de empresa, otro simulador) no está validado.
- Solo soporta coreano en la documentación y en el esquema de decisión; no hay evidencia de generalización a otros idiomas.
- No es un modelo de lenguaje: no genera texto libre, no hace tool calling ni razonamiento multi-paso; cualquier uso que requiera esas capacidades queda fuera de su ámbito.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí riesgo de decisiones mal calibradas en estados poco representados durante el entrenamiento.
- Los resultados publicados (beneficio, satisfacción, incidentes) provienen de una evaluación del propio autor sobre 40 meses no vistos; no hay una evaluación independiente.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el simulador y el ecosistema CONNECT TYCOON pueden tener sus propias condiciones; conviene revisarlas antes de un uso en producción.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/connect-ai-lab-aimo/connectailab-rl-juju-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
