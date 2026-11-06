# dain-studio/connectailab-rl-yggdrasil-v1-teacher

## Resumen

Yggdrasil es un modelo de toma de decisiones por refuerzo (reinforcement learning) desarrollado por Dain_AI en el marco de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generativo al uso: es una política entrenada para operar una empresa simulada en el entorno CONNECT TYCOON, tomando decisiones sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad. El modelo responde en el formato estructurado JEV (`typesafe/jev-1.13`), lo que permite integrarlo como componente de decisión dentro de pipelines que esperan respuestas tipadas con probabilidades y nivel de confianza.

Según la model card, la política se construyó en dos fases: primero imitando a un "presidente basado en reglas" mediante aprendizaje supervisado sobre 100 decisiones etiquetadas manualmente (política profesora v4), y después refinando el comportamiento con PPO usando una función de recompensa basada en los valores de empresa declarados (beneficio 1.0, satisfacción del cliente 1.5, evitación de riesgo 2.0). El autor indica que el conocimiento se destiló hacia Qwen3.5-0.8B, aunque la librería declarada en el repositorio es `numpy`, lo que sugiere que los pesos publicados no son un transformer estándar sino artefactos consumibles por la librería `connect_tycoon`.

El modelo es relevante como ejemplo didáctico de RL aplicado a decisiones empresariales en un simulador sintético, y por su integración con el formato JEV para respuestas de tipo elección con distribución de probabilidad. Está orientado a un público de habla coreana y su uso previsto es educativo y experimental dentro del ecosistema CONNECT TYCOON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (PPO) destilada hacia Qwen3.5-0.8B según la model card; artefactos publicados con librería `numpy` |
| Parametros totales | no disponible (referencia declarada: Qwen3.5-0.8B, ~0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería `numpy`; consumible vía `connect_tycoon.CompanyBrain.from_hub`) |

## Arquitectura y entrenamiento

La model card describe una política entrenada en dos etapas. En la primera, el modelo aprende por imitación de una política basada en reglas (denominada "presidente basado en reglas", versión v4), a partir de 100 decisiones anotadas manualmente. En la segunda, se aplica PPO (Proximal Policy Optimization) con una recompensa derivada de los valores de empresa: beneficio con peso 1.0, satisfacción del cliente con peso 1.5 y evitación de riesgo con peso 2.0. El entorno de entrenamiento es el simulador CONNECT TYCOON, con una configuración de empresa concreta (almacén 250.0, demanda base 40.0, coste unitario 1.5, escala de pedido 1.0, salario 0.0, poder publicitario 1.0, entre otros parámetros).

El autor indica que el comportamiento aprendido se trasladó a Qwen3.5-0.8B, lo que apunta a una destilación de la política hacia un modelo de lenguaje pequeño. Sin embargo, la información disponible no detalla la arquitectura exacta de los pesos publicados, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas adicionales de ajuste. La etiqueta `prefrontal-cortex` y la referencia a "JEV style" sugieren un diseño orientado a producir decisiones estructuradas y justificadas en un formato tipado, más que a generar texto libre.

## Capacidades

- Toma de decisiones discretas en un entorno empresarial simulado: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Respuesta en formato JEV (`typesafe/jev-1.13`) con tipo de pregunta `choice`, opción seleccionada, distribución de probabilidades por alternativa y nivel de confianza.
- Razonamiento de compromiso entre objetivos en conflicto (beneficio frente a satisfacción del cliente frente a riesgo), codificado en la función de recompensa.
- Operación multi-paso a lo largo de un mes simulado (20 días laborables) manteniendo coherencia de política.
- Integración con el simulador CONNECT TYCOON mediante `CompanyBrain.from_hub` y el comando `connect-tycoon play --brain hf:...`.
- Soporte de idioma coreano en las instrucciones y criterios de decisión.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling genérico ni agentes multi-herramienta.

## Casos de uso

- Docencia de reinforcement learning: el modelo sirve como ejemplo ejecutable de un ciclo completo de imitación más PPO sobre un simulador, con métricas comparativas frente a una política basada en reglas.
- Experimentación con funciones de recompensa multiobjetivo: permite modificar los pesos de beneficio, satisfacción y riesgo y observar cómo cambia la política de decisión en reembolsos y atención al cliente.
- Integración en el juego CONNECT TYCOON: el cerebro puede conectarse al simulador con `connect-tycoon play --brain hf:dain-studio/connectailab-rl-yggdrasil-v1-teacher` para operar la empresa durante 20 días laborables.
- Evaluación de formatos de respuesta estructurada: sirve para probar pipelines que consumen JEV con preguntas de tipo elección, probabilidades y confianza, validando el contrato de datos antes de sustituir el componente por otro modelo.
- Estudio de políticas conservadoras en gestión de riesgo: con peso 2.0 en evitación de riesgo, es útil para analizar cómo una política aprende a derivar casos sospechosos a revisión humana en lugar de decidir automáticamente.
- Prototipado de agentes de decisión en entornos sintéticos: como paso previo a diseñar políticas para dominios reales, permite validar la metodología de etiquetado manual más RL sin riesgo operativo.
- Reproducción de resultados: la model card reporta métricas medias sobre 40 meses no vistos, lo que facilita comparar configuraciones del simulador y variantes de entrenamiento.

## Benchmarks y rendimiento

La model card reporta resultados medios sobre 40 meses no vistos, comparando la política Yggdrasil con el "presidente basado en reglas":

| Metrica (media de 40 meses no vistos) | Reglas | Yggdrasil |
|---|---|---|
| Beneficio mensual | 3,24 M KRW | 11,50 M KRW |
| Satisfacción del cliente | 79 % | 96 % |
| Incidentes de riesgo | 7,8 | 2,0 |
| Confirmaciones humanas excedidas | 37,8 | 9,7 |
| Días sin stock | 10,7 | 0,8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores proceden exclusivamente del simulador propietario y no son comparables con evaluaciones de modelos de lenguaje de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo se distribuye como artefactos consumidos por la librería `numpy`; si se ejecuta la base declarada Qwen3.5-0.8B, una cuantización de 4 bits requeriría del orden de 0,5-1 GB, pero este dato no está confirmado en la información disponible.
- GPU recomendadas: no disponibles. Por el tamaño declarado de la base (0,8B), cualquier GPU consumer reciente sería suficiente en teoría, pero no hay confirmación oficial.
- Compatibilidad con GPU consumer: probable si se usa la base Qwen3.5-0.8B, no confirmado para los artefactos publicados.
- Opciones de despliegue: `connect-tycoon` (extra `[game]`) mediante `pip install "connect-tycoon[game]"` y `CompanyBrain.from_hub`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yggdrasil (este modelo) | Política RL para simulador CONNECT TYCOON | no disponible (~0,8B según base declarada) | no disponible | Apache 2.0 | Hugging Face |
| Política basada en reglas (v4) | Sistema experto de referencia | no aplica | no aplica | no disponible | Referenciada en la model card |
| Qwen3.5-0.8B | LLM generativo | ~0,8B | no disponible en la información proporcionada | no disponible en la información proporcionada | No confirmado en la información disponible |

No se dispone de información sobre otros modelos de RL para toma de decisiones empresariales comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que es un modelo educativo sobre un simulador sintético y que no garantiza ni predice resultados de gestión reales.
- El alcance está limitado al entorno CONNECT TYCOON y a su configuración de empresa concreta; no se ha validado su transferencia a otros dominios.
- Idioma limitado al coreano en instrucciones y criterios de decisión.
- La función de recompensa incorpora juicios de valor (satisfacción 1.5, riesgo 2.0) que sesgan la política hacia decisiones conservadoras; no es neutral.
- Riesgo de sobreajuste al simulador y a las 100 decisiones etiquetadas manualmente; no se documenta el tamaño efectivo del conjunto de entrenamiento.
- La información sobre arquitectura, pesos y proceso de entrenamiento es escasa; la etiqueta `numpy` y la referencia a Qwen3.5-0.8B no están reconciliadas en la documentación.
- No se documentan evaluaciones de sesgo, robustez ante entradas fuera de distribución ni comportamiento ante estados inválidos.
- Licencia Apache 2.0 permite uso comercial, pero el uso previsto declarado es educativo; la integración "Connect AI" se describe como en fase de pruebas.
- No se documenta soporte de tool calling genérico ni de agentes multi-paso fuera del simulador.

## Enlaces

- Hugging Face: https://huggingface.co/dain-studio/connectailab-rl-yggdrasil-v1-teacher
- Repositorio GitHub CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI (ezerai): https://www.ezerai.xyz
- Formato JEV referenciado: `typesafe/jev-1.13`
