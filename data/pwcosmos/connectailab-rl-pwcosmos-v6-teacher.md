# pwcosmos/connectailab-rl-pwcosmos-v6-teacher

## Resumen

`connectailab-rl-pwcosmos-v6-teacher` es un modelo de decisión por refuerzo (no un modelo de lenguaje generativo) publicado por el desarrollador `pwcosmos` dentro del proyecto educativo CONNECT TYCOON, una simulación de gestión empresarial desarrollada por CONNECT AI LAB y AI CITY BUILDERS. El modelo actúa como el "cerebro" de un director ejecutivo virtual: recibe el estado de la empresa (departamento implicado, motivo, nivel del cliente, importe, puntuación de fraude, etc.) y devuelve una decisión discreta entre un conjunto cerrado de opciones, con probabilidades asociadas y un nivel de confianza.

El modelo se entrenó en dos fases: primero una imitación supervisada de un "presidente basado en reglas" y después un ajuste con PPO (Proximal Policy Optimization) usando una función de recompensa derivada de los valores de la empresa (beneficio, satisfacción del cliente y riesgo, todos con peso 1.0). La política opera sobre el simulador `connect-tycoon` y responde en el formato JEV (`typesafe/jev-1.13`), un esquema de pregunta/respuesta estructurado en JSON.

La relevancia es acotada: no es un modelo de propósito general ni compite con LLM, sino un artefacto de investigación y docencia sobre toma de decisiones con aprendizaje por refuerzo en un entorno tipo Gymnasium. Su interés está en el pipeline (entorno simulado, recompensa multiobjetivo, formato JEV) y en los resultados reportados frente a la línea base de reglas, no en capacidades lingüísticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de aprendizaje por refuerzo; la model card no detalla la red) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el estado se pasa como diccionario estructurado, no como secuencia de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (la librería declarada es `numpy`; el artefacto se carga vía `connect_tycoon.CompanyBrain.from_hub`) |

## Arquitectura y entrenamiento

La model card describe el proceso de entrenamiento en dos etapas. En la primera, el modelo aprende por imitación supervisada a partir de un "presidente basado en reglas" que actúa como profesor (de ahí el sufijo `teacher`). En la segunda, se ajusta con PPO utilizando como recompensa los valores declarados de la empresa: `{"이익": 1.0, "고객 만족": 1.0, "위험": 1.0}`, es decir, beneficio, satisfacción del cliente y riesgo con pesos idénticos. El entorno es un simulador de negocio con 20 días laborables por mes simulado, parámetros de configuración (`warehouse`, `base_demand`, `unit_cost`, `order_scale`, `wage`, `ad_power`, etc.) y acciones sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

No se especifica en la información disponible el tipo de red neuronal (MLP, transformer, etc.), el número de parámetros, el volumen de datos de entrenamiento, ni detalles del bucle de PPO (tamaño de rollout, hiperparámetros, número de épocas). El modelo se distribuye a través de la librería Python `connect-tycoon`, que expone `CompanyBrain.from_hub(...)` y un comando `connect-tycoon play --brain hf:...` para integrarlo en el juego. La interfaz de decisión es el formato JEV: una pregunta con tipo (`choice`), instrucciones y criterios, y una respuesta con la opción elegida, la distribución de probabilidad sobre las alternativas y un campo `reason` que en el ejemplo devuelto es simplemente `"강화학습 정책"` ("política de aprendizaje por refuerzo"), no una justificación en lenguaje natural.

## Capacidades

- Toma de decisiones discretas sobre un conjunto cerrado de opciones definido en la pregunta JEV (por ejemplo, `full`, `partial`, `deny`, `human` en el caso de reembolsos).
- Devolución de una distribución de probabilidad completa sobre las alternativas, no solo la opción ganadora, lo que permite umbrales de confianza y derivación a revisión humana.
- Gestión simulada de múltiples áreas de negocio: asignación de personal, reposición de inventario, marketing, atención al cliente, reembolsos y seguridad.
- Operación sobre estados estructurados (diccionarios con campos como `department`, `reason`, `tier`, `amount`, `fraud_score`), no sobre lenguaje natural libre.
- Integración con el simulador `connect-tycoon` mediante `CompanyBrain` y con el formato JEV (`typesafe/jev-1.13`).
- No soporta tool calling, function calling genérico, agentes multi-paso fuera del bucle del simulador, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: únicamente coreano según los metadatos.

## Casos de uso

- Docencia de aprendizaje por refuerzo: el modelo sirve como ejemplo completo de pipeline imitación + PPO sobre un entorno Gymnasium propio, con recompensa multiobjetivo y formato de observación estructurado; útil en cursos de RL aplicado.
- Investigación en políticas de decisión con recompensas conflictivas: el peso idéntico de beneficio, satisfacción y riesgo permite estudiar el equilibrio entre métricas y analizar cómo la política reparte probabilidad entre opciones conservadoras (`human`) y arriesgadas (`full`).
- Evaluación de líneas base: comparar una política aprendida contra un "presidente basado en reglas" en las mismas condiciones del simulador (40 meses no vistos) para medir la ganancia real del aprendizaje.
- Simulación de gestión de reembolsos con detección de fraude: el ejemplo de la model card muestra cómo, con `fraud_score` bajo (0.38), la política asigna 0.77 de probabilidad al reembolso completo y 0.22 a la revisión humana, lo que permite estudiar umbrales de derivación.
- Prototipado de asistentes de decisión para entornos empresariales simplificados: el esquema JEV pregunta/respuesta puede reutilizarse como contrato de interfaz para conectar un motor de decisión con un frontend o un juego.
- Demostraciones y material divulgativo: el comando `connect-tycoon play --brain hf:pwcosmos/connectailab-rl-pwcosmos-v6-teacher` permite mostrar en directo cómo una política entrenada opera una empresa simulada, con visualizaciones del simulador.

## Benchmarks y rendimiento

La model card reporta resultados sobre 40 meses no vistos en el simulador, comparando la política aprendida con el presidente basado en reglas:

| Métrica (media de 40 meses no vistos) | Presidente basado en reglas | connectailab-rl-pwcosmos-v6-teacher |
|---|---|---|
| Beneficio mensual | 708만원 (7,08 M KRW) | 1.497만원 (14,97 M KRW) |
| Satisfacción del cliente | 71 % | 95 % |
| Incidentes de riesgo | 11,5 | 2,1 |
| Confirmaciones humanas excedidas | 69,5 | 12,9 |
| Días sin stock | 9,1 | 0,4 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible. La librería declarada es `numpy`, lo que sugiere que la inferencia puede ejecutarse en CPU sin GPU dedicada, pero el tamaño real del artefacto no se especifica.
- GPU recomendadas: no disponibles; no se documenta requisito de GPU.
- Compatibilidad con GPU de consumo: presumiblemente sí (el proyecto ofrece un notebook de Google Colab para el entrenamiento), aunque no se confirma en la información disponible.
- Opciones de despliegue: paquete Python `connect-tycoon` (`pip install "connect-tycoon[game]"`), carga mediante `CompanyBrain.from_hub` y ejecución interactiva con `connect-tycoon play`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-pwcosmos-v6-teacher | Política RL (imitación + PPO) | connect-tycoon | Apache 2.0 | Hugging Face (`pwcosmos`) |
| connectailab-pwcosmos-r1-v5 | Política RL con GRPO sobre base Qwen3.5 + LoRA (PEFT, safetensors) | connect-tycoon | Apache 2.0 | Hugging Face (`pwcosmos`) |
| Presidente basado en reglas | Sistema experto determinista | connect-tycoon | No aplica | Incluido en el simulador |

No se dispone de datos de benchmarks comparables entre `v6-teacher` y `r1-v5` en la información proporcionada; la única comparación cuantitativa publicada es contra la línea base de reglas. No se identifican alternativas externas del mismo dominio con métricas comparables.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: solo produce decisiones dentro de los esquemas de pregunta definidos por el simulador `connect-tycoon`; no es un modelo de lenguaje y no genera texto libre.
- El campo `reason` de las respuestas es una etiqueta fija (`"강화학습 정책"`), no una explicación; la interpretabilidad de las decisiones es limitada.
- Los resultados reportados (beneficio, satisfacción, riesgo) provienen de un simulador sintético; la propia model card advierte que es un modelo educativo y que no garantiza ni predice resultados de gestión reales.
- Riesgo de sobreajuste al simulador y a la configuración concreta de empresa documentada (`warehouse: 250.0`, `base_demand: 40.0`, etc.); el comportamiento fuera de esos parámetros no está validado en la información disponible.
- Idioma: solo coreano en los metadatos; el estado de entrada es estructurado, por lo que el idioma afecta principalmente a textos de instrucciones y motivos.
- Sesgos: no documentados en la información disponible; al entrenarse por imitación de un sistema de reglas y optimizar una recompensa con pesos fijados manualmente, hereda los sesgos de ambas fuentes.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el modelo depende del paquete `connect-tycoon` y del formato JEV para funcionar.
- El proyecto indica que la función de "conexión de modelos" (Connect AI) está en fase de pruebas, por lo que la integración con otros sistemas no debe considerarse estable.
- Sin datos publicados sobre tamaño de pesos, arquitectura de red ni hiperparámetros de PPO, lo que dificulta la reproducibilidad del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pwcosmos/connectailab-rl-pwcosmos-v6-teacher
- Repositorio del simulador: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Canal de YouTube de CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS (curso de RL): https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
- Modelo relacionado `connectailab-pwcosmos-r1-v5`: https://huggingface.co/pwcosmos/connectailab-pwcosmos-r1-v5
