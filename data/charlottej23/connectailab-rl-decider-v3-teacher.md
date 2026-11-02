# Charlottej23/connectailab-rl-decider-v3-teacher

## Resumen

connect-ai-company-v3 es un modelo de decisión basado en aprendizaje por refuerzo (RL) desarrollado por Charlotte (JOOEUN KIM) dentro del ecosistema CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje generativo: es una política entrenada para operar la simulación de empresa CONNECT TYCOON durante un ciclo de 20 días laborables, tomando decisiones sobre asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad. Recibe el estado de la empresa y devuelve decisiones en el formato estructurado JEV (`typesafe/jev-1.13`).

El modelo se entrenó en dos fases: primero imitación supervisada de un "presidente de reglas" (política heurística de referencia) y después ajuste fino con PPO usando recompensas derivadas de los valores de la empresa (beneficio, satisfacción del cliente y riesgo). La model card reporta que, sobre 40 meses no vistos, supera al presidente de reglas en beneficio mensual medio (1164万 KRW frente a 324万 KRW), satisfacción (95 % frente a 79 %), incidentes de riesgo (2,4 frente a 7,8), escalados a revisión humana (12,8 frente a 37,8) y días de rotura de stock (0,7 frente a 10,7).

Se publica con licencia Apache 2.0, etiqueta de idioma coreano (`ko`) y librería `numpy`, sin pesos en formato safetensors ni GGUF. Su relevancia es acotada: sirve como referencia educativa de un pipeline completo de RL aplicado a decisiones empresariales simuladas, no como componente para producción real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de decisión entrenada con PPO; no se especifica la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada estructurada de estado, no texto libre) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (librería `numpy`; no se publican safetensors ni GGUF) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, dimensión de las representaciones ni función de valor). La model card sí describe el proceso: entrenamiento en dos etapas sobre el simulador CONNECT TYCOON, con una fase de aprendizaje supervisado a partir de un "presidente de reglas" y una fase posterior de PPO (Proximal Policy Optimization) con recompensa derivada de los tres valores de la empresa (beneficio, satisfacción del cliente y riesgo). La observación de entrada es un diccionario de estado con campos como departamento, motivo, nivel de cliente, importe y `fraud_score`; la salida es una distribución de probabilidad sobre las opciones de decisión.

Como innovación destacable, el modelo integra el formato JEV (`typesafe/jev-1.13`) para la especificación de preguntas de tipo `choice` con criterios explícitos, y devuelve probabilidades por opción junto con un campo de confianza. El entorno de simulación se configura con parámetros de empresa concretos (almacén 250, demanda base 40, coste unitario 1,5), lo que ata el comportamiento aprendido a esa distribución de estados.

## Capacidades

- Toma de decisiones discretas sobre seis áreas operativas: asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Salida estructurada con distribución de probabilidad sobre las opciones y puntuación de confianza (por ejemplo, `full: 0.98`, `partial: 0.0006`, `deny: 0.0041`, `human: 0.0152`).
- Razonamiento de compromiso entre objetivos en conflicto (beneficio, satisfacción y riesgo) mediante la recompensa escalar definida en el entorno.
- Integración con el simulador CONNECT TYCOON a través de `CompanyBrain.from_hub` y de la CLI `connect-tycoon play --brain hf:...`.
- Soporte del protocolo JEV para formular preguntas y recibir respuestas tipadas.
- No soporta generación de texto libre, tool calling genérico, visión, audio ni razonamiento multi-paso fuera del bucle de decisión del simulador.

## Casos de uso

- Docencia de RL aplicado a negocio: el modelo sirve como ejemplo ejecutable de un pipeline completo (entorno Gymnasium, imitación, PPO y publicación en el Hub) en cursos de refuerzo.
- Evaluación de políticas en simulación: comparar la política aprendida con la heurística de reglas bajo las mismas condiciones de empresa para medir la mejora en beneficio y satisfacción.
- Generación de datos sintéticos de decisión: usar las distribuciones de probabilidad devueltas para construir trayectorias etiquetadas en el formato JEV y alimentar experimentos de imitación.
- Investigación sobre equilibrio de objetivos: estudiar cómo varía la decisión de reembolso o de escalado a humano al modificar los pesos de la recompensa (beneficio frente a riesgo).
- Pruebas de integración de agentes: validar el contrato de entrada y salida JEV en un servicio que consuma decisiones estructuradas de un cerebro simulado.
- Demostraciones interactivas: ejecutar la política como "presidente" en la CLI de CONNECT TYCOON para visualizar el impacto de cada decisión en dinero, satisfacción e incidentes.
- Análisis de coste de revisión humana: evaluar la política de escalado (`human`) y su coste fijo de 0,8万 KRW por caso frente a la reducción de incidentes.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre 40 meses no vistos del simulador (media mensual):

| Métrica | Presidente de reglas | connect-ai-company-v3 |
|---|---|---|
| Beneficio mensual | 324万 KRW | 1164万 KRW |
| Satisfacción del cliente | 79 % | 95 % |
| Incidentes de riesgo | 7,8 | 2,4 |
| Escalados a revisión humana | 37,8 | 12,8 |
| Días de rotura de stock | 10,7 | 0,7 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; la librería de inferencia es `numpy` y el tamaño de los pesos no se especifica.
- GPU recomendadas: no disponible; por la naturaleza del modelo (política de decisión sobre estado estructurado) es plausible su ejecución en CPU, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga vía `CompanyBrain.from_hub` y CLI `connect-tycoon play`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas RL para simulación empresarial con salida JEV) con parámetros, contexto y licencia verificables.

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: la propia model card advierte que no garantiza ni predice resultados empresariales reales.
- El comportamiento está condicionado a la configuración concreta de empresa (`warehouse` 250, `base_demand` 40, `unit_cost` 1,5); fuera de esa distribución no hay evidencia de generalización.
- Idioma y dominio limitados al coreano y al vocabulario del simulador CONNECT TYCOON.
- No es un modelo de lenguaje: no admite prompts en texto libre ni tareas fuera del esquema JEV definido.
- Riesgo de sobreajuste a la política de reglas en la fase de imitación, no cuantificado en la información disponible.
- Sin datos publicados sobre sesgos, calibración de las probabilidades ni robustez ante estados anómalos.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero la utilidad práctica fuera del simulador es nula; conviene revisar la licencia del entorno `connect-tycoon` por separado.
- Cero descargas y cero likes en el momento de la consulta: sin validación externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Charlottej23/connectailab-rl-decider-v3-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Portfolio del autor: https://kailogic.kr/portfolio/
- GitHub del autor: https://github.com/charlottj23
- YouTube del autor: https://www.youtube.com/@createtosurvive-x
- Connect AI: https://www.ezerai.xyz
