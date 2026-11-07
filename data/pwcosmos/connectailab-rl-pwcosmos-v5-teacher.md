# pwcosmos/connectailab-rl-pwcosmos-v5-teacher

## Resumen

`connectailab-rl-pwcosmos-v5-teacher` es una política de aprendizaje por refuerzo (RL) entrenada con PPO para la toma de decisiones empresariales dentro del simulador CONNECT TYCOON, un entorno tipo gymnasium que reproduce la operación de una empresa durante ciclos de 20 días laborables. Lo desarrolla el usuario pwcosmos en el marco de CONNECT AI LAB y AI CITY BUILDERS, y se distribuye como pesos ligeros consumidos mediante la librería `numpy` (no es un modelo de lenguaje generativo). El modelo actúa como "cerebro" que decide sobre asignación de personal, pedidos de inventario, marketing, atención al cliente, reembolsos y seguridad.

El problema que aborda es la automatización de decisiones secuenciales bajo objetivos múltiples y en conflicto (beneficio, satisfacción del cliente y riesgo), con formato de salida estructurado tipo JEV (`typesafe/jev-1.13`). Según la model card, se inicializa mediante aprendizaje supervisado imitando a un "presidente de reglas" y posteriormente se ajusta con PPO usando recompensas derivadas de los valores de la empresa. No es un transformer: es un artefacto de RL tabular/política neuronal empaquetado para inferencia con numpy.

Su relevancia es acotada y experimental: sirve como referencia educativa de cómo entrenar y desplegar políticas RL en entornos de simulación, y como ejemplo de integración con un formato de preguntas/respuestas tipado (JEV). No está pensado para producción real ni para tareas de NLP; su ámbito es el simulador y la docencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo entrenada con PPO (no es un transformer; empaquetada para inferencia con numpy) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre estados estructurados del simulador, no sobre texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (consumido vía `connect_tycoon.CompanyBrain`; la librería declarada es numpy) |

## Arquitectura y entrenamiento

La model card describe un pipeline en dos fases: primero aprendizaje supervisado a partir de las decisiones de un "presidente de reglas" (una política heurística de referencia), y después ajuste fino con PPO usando una función de recompensa derivada de los valores de la empresa, definidos como `{"beneficio": 1.0, "satisfacción del cliente": 1.0, "riesgo": 1.0}`. El entorno es CONNECT TYCOON, un simulador de empresa con configuración explícita (`warehouse: 250.0`, `base_demand: 40.0`, `unit_cost: 1.5`, `order_scale: 1.0`, entre otros parámetros), que modela inventario, demanda, costes, personal, marketing, fraude y atención al cliente.

La interfaz de inferencia es una llamada a `CompanyBrain` que recibe un objeto JEV con un `state` (por ejemplo, departamento, motivo, nivel de cliente, importe y puntuación de fraude) y una o varias `questions` tipadas (`choice` con criterios como `full`, `partial`, `deny`, `human`). La salida es un objeto JSON con la opción elegida, la distribución de probabilidades y un campo de confianza. No se especifican en la información disponible el número de parámetros, la arquitectura interna de la red, el volumen de datos de entrenamiento ni los hiperparámetros de PPO.

## Capacidades

- Toma de decisiones discretas de negocio en el simulador: asignación de personal, pedidos de inventario, campañas de marketing, atención al cliente, reembolsos y seguridad.
- Salida estructurada compatible con JEV (`typesafe/jev-1.13`), incluyendo distribución de probabilidades por opción y nivel de confianza.
- Razonamiento multi-paso implícito a lo largo de un ciclo de 20 días laborables, con estado persistente del simulador.
- Gestión de compensaciones entre objetivos (beneficio, satisfacción y riesgo) según la función de recompensa.
- Capacidad de derivar casos ambiguos a revisión humana (opción `human` en las decisiones de reembolso).
- No soporta generación de texto libre, tool calling genérico, visión, audio ni multimodalidad.
- Idiomas: coreano (etiquetas y criterios de decisión en coreano).

## Casos de uso

- Docencia de RL: usar el modelo como política de referencia en un curso para ilustrar el ciclo completo de imitación más PPO sobre un entorno gymnasium, comparando su comportamiento con el "presidente de reglas".
- Investigación en entornos de simulación empresarial: servir de baseline para experimentos de recompensas multiobjetivo (beneficio, satisfacción, riesgo) y estudiar cómo cambia la política al modificar `config`.
- Evaluación de formatos tipados: probar la integración de JEV como contrato de entrada/salida para agentes de decisión, validando esquemas y probabilidades.
- Demostraciones interactivas: ejecutar `connect-tycoon play --brain hf:pwcosmos/connectailab-rl-pwcosmos-v5-teacher` para mostrar en directo cómo un agente opera una empresa simulada durante un mes.
- Análisis de políticas de reembolso: examinar la distribución de probabilidades (`full`, `partial`, `deny`, `human`) ante distintos valores de `fraud_score` y `amount` para entender el umbral aprendido.
- Generación de datos sintéticos de decisiones: emplear la política como etiquetadora automática de estados del simulador para preentrenar o comparar otros agentes.
- Pruebas de regresión de entornos: usar las decisiones del modelo como referencia para detectar cambios no deseados en la dinámica del simulador tras actualizaciones.

## Benchmarks y rendimiento

La model card incluye una comparación agregada frente a la política heurística ("presidente de reglas") sobre 40 meses no vistos:

| Métrica (media en 40 meses) | Presidente de reglas | connectailab-rl-pwcosmos-v5-teacher |
|---|---|---|
| Beneficio mensual | 7,08 M KRW | 15,07 M KRW |
| Satisfacción del cliente | 71 % | 95 % |
| Incidentes de riesgo | 11,5 | 1,7 |
| Escalados a revisión humana | 69,5 | 12,5 |
| Días sin stock | 9,1 | 0,4 |

No se han publicado resultados en la información disponible para benchmarks estándar (MMLU, HumanEval, GSM8K u otros), que además no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM: no disponible; la librería declarada es `numpy`, lo que sugiere inferencia en CPU sin requisitos de GPU significativos.
- GPU recomendadas: no disponibles; no se requiere GPU para la inferencia según la información proporcionada.
- GPU de consumo: no aplica (el modelo no es un LLM y no necesita VRAM dedicada).
- Despliegue: paquete `connect-tycoon` (`pip install "connect-tycoon[game]"`), con `CompanyBrain.from_hub(...)` para cargar desde Hugging Face; también existe un notebook de Colab para reentrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-pwcosmos-v5-teacher | Política RL (PPO) | CONNECT TYCOON | Imitación + PPO | Apache 2.0 | Hugging Face |
| connectailab-pwcosmos-r1-v5 | Adaptador PEFT/LoRA (GRPO) sobre Qwen3.5 | CONNECT TYCOON | GRPO | Apache 2.0 | Hugging Face |
| Presidente de reglas (heurístico) | Política basada en reglas | CONNECT TYCOON | No entrenado | No aplica | Incluido en el simulador |

No se dispone de información sobre otros modelos comparables de la misma categoría fuera del ecosistema CONNECT AI LAB.

## Limitaciones y advertencias

- Modelo educativo sobre un simulador sintético: la propia model card advierte de que no garantiza ni predice resultados de gestión reales.
- Ámbito muy restringido: solo decide dentro de CONNECT TYCOON y con el esquema JEV; no es un modelo de lenguaje ni sirve para tareas generales.
- Idioma: etiquetas y criterios en coreano; no hay soporte multilingüe declarado.
- Dependencia del entorno: el comportamiento está condicionado por la `config` del simulador (`warehouse`, `base_demand`, `unit_cost`, etc.); cambios en la dinámica pueden degradar la política.
- Riesgo de sobreajuste al "presidente de reglas" durante la fase de imitación, no cuantificado en la información disponible.
- Sin datos publicados sobre sesgos, calibración de probabilidades ni robustez ante estados fuera de distribución.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el valor práctico fuera del simulador es nulo; conviene revisar la licencia del propio simulador `connect-tycoon` por separado.
- Descargas y likes nulos en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/pwcosmos/connectailab-rl-pwcosmos-v5-teacher
- Repositorio CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de entrenamiento en Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/rl_decision_model_qwen_colab.ipynb
- Modelo relacionado (R1 v5, LoRA/GRPO): https://huggingface.co/pwcosmos/connectailab-pwcosmos-r1-v5
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
- Connect AI: https://www.ezerai.xyz
