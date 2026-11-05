# kyoungsim/connectailab-rl-kongi-v2-teacher

## Resumen

`connectailab-rl-kongi-v2-teacher` es un modelo de decisión basado en aprendizaje por refuerzo (RL) desarrollado por el usuario `kyoungsim` en el marco del proyecto CONNECT TYCOON, una iniciativa educativa de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generativo: es una política entrenada para operar una empresa simulada durante un ciclo de 20 días laborables, tomando decisiones sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad. El modelo responde en el formato JEV (`typesafe/jev-1.13`), un esquema estructurado de preguntas y respuestas con distribución de probabilidades.

Técnicamente, se trata de una política de RL entrenada en dos fases: primero imitación de un "presidente por reglas" (aprendizaje supervisado) y después optimización con PPO usando una función de recompensa basada en el valor de la empresa (beneficio, satisfacción del cliente y riesgo). La model card reporta mejoras sustanciales frente a la política de reglas en métricas de simulación, aunque se trata de un modelo educativo sobre un simulador sintético.

Su relevancia es acotada: no compite con LLMs ni con modelos de decisión generales, sino que sirve como ejemplo didáctico de RL aplicado a toma de decisiones empresariales y como componente del ecosistema CONNECT TYCOON. La librería declarada es `numpy`, lo que sugiere una política ligera sin dependencias de frameworks de deep learning en inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (PPO) sobre representación de estado; arquitectura de red no detallada en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de decisión, no de lenguaje); estado estructurado por observación |
| Tipos de cuantización | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería declarada: numpy) |

## Arquitectura y entrenamiento

El modelo es una política de decisión entrenada con PPO (Proximal Policy Optimization) sobre el simulador CONNECT TYCOON. El proceso de entrenamiento consta de dos etapas: una primera fase de aprendizaje supervisado por imitación de un "presidente por reglas" que actúa como profesor, seguida de un ajuste fino con PPO guiado por una función de recompensa multicriterio que pondera beneficio, satisfacción del cliente y riesgo. La model card etiqueta el modelo con conceptos como `prefrontal-cortex` y `decision-making`, en línea con el enfoque divulgativo del proyecto.

La entrada al modelo es un estado estructurado del simulador (por ejemplo, departamento, motivo, nivel de cliente, importe, puntuación de fraude) y la salida es una elección entre alternativas con distribución de probabilidades y un nivel de confianza. El formato de interacción es JEV, un esquema de preguntas tipadas con criterios de elección. No se detalla en la información disponible el número de parámetros, la arquitectura exacta de la red ni el volumen de datos de entrenamiento.

## Capacidades

- Toma de decisiones discretas entre alternativas definidas en el esquema JEV (por ejemplo, reembolso total, parcial, denegación o escalado a humano).
- Salida de distribución de probabilidades sobre las opciones y un valor de confianza asociado.
- Gestión de políticas operativas en un simulador empresarial: personal, inventario, marketing, atención al cliente, reembolsos y seguridad.
- Operación en coreano, idioma en el que está entrenado y documentado.
- Integración con el paquete `connect-tycoon` mediante `CompanyBrain.from_hub`.
- No soporta tool calling, function calling, agentes multi-paso generales, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo completo de un pipeline de imitación más PPO aplicado a un entorno Gymnasium, con código de entrenamiento en Colab y simulador reproducible.
- Investigación comparativa de políticas: permite contrastar una política RL frente a una política basada en reglas en un entorno controlado, con métricas de beneficio, satisfacción y riesgo ya reportadas en la model card.
- Demostración interactiva en juegos y simuladores: mediante `connect-tycoon play --brain hf:kyoungsim/connectailab-rl-kongi-v2-teacher` se puede sentar al modelo como "presidente" y observar sus decisiones en la interfaz del simulador.
- Prototipado de sistemas de decisión con formato JEV: útil para experimentar con esquemas de preguntas y respuestas estructuradas con distribución de probabilidades y confianza.
- Generación de datos sintéticos de decisiones: la política puede emplearse para producir trazas de decisiones etiquetadas en el simulador, útiles para entrenar o evaluar otros modelos.
- Evaluación de funciones de recompensa: al ser una política entrenada con una recompensa multicriterio concreta, sirve para estudiar cómo distintas ponderaciones de beneficio, satisfacción y riesgo alteran el comportamiento resultante.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 40 meses no vistos, comparando la política RL con el "presidente por reglas":

| Métrica (promedio mensual) | Presidente por reglas | connectailab-rl-kongi-v2-teacher |
|---|---|---|
| Beneficio mensual | 3,24 millones de wones | 11,47 millones de wones |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,1 |
| Escalados a confirmación humana | 37,8 | 16,1 |
| Días sin stock | 10,7 | 0,3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es un LLM y no aplica esa batería de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible; la librería declarada es `numpy` y la política parece ligera, pero no se especifica el tamaño del modelo ni de sus pesos.
- GPU recomendadas: no se indica ninguna; por el tipo de modelo, la inferencia podría ejecutarse en CPU sin problema, aunque este extremo no está confirmado en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; plausible dado el carácter ligero del artefacto, pero no documentado.
- Opciones de despliegue: paquete `connect-tycoon` (instalación con `pip install "connect-tycoon[game]"`), carga desde Hugging Face Hub mediante `CompanyBrain.from_hub`, y cuaderno de Colab para entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas RL para simulación empresarial con formato JEV). La comparación pertinente dentro del propio proyecto es con la política de reglas, cuyos resultados se recogen en la sección de benchmarks.

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: la propia model card advierte que no garantiza ni predice resultados de gestión real.
- Dominio muy restringido: solo opera sobre el estado y las acciones definidas por el simulador CONNECT TYCOON; no es un modelo general.
- Idioma: entrenado y documentado únicamente en coreano.
- Sin información sobre sesgos, calibración de la confianza ni comportamiento fuera de distribución; la confianza reportada (por ejemplo, 0,9684) es la probabilidad de la opción elegida, no una garantía de acierto.
- Riesgo de sobreajuste al simulador y a la función de recompensa concreta empleada durante el entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser un artefacto educativo conviene citar la fuente y no presentar sus resultados como evidencia empírica de gestión empresarial.
- No se detalla el tamaño de los pesos ni el procedimiento exacto de serialización, lo que dificulta auditar la reproducibilidad del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyoungsim/connectailab-rl-kongi-v2-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
