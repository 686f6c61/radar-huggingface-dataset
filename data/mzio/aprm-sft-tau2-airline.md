# mzio/aprm-sft-tau2-airline

## Resumen

El repositorio `mzio/aprm-sft-tau2-airline` contiene adaptadores LoRA (rango 8, alpha 16) obtenidos mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Estos adaptadores forman parte del proyecto Act-PRM, cuyo objetivo es inferir los "pensamientos latentes" que subyacen a demostraciones de agentes que solo muestran acciones, mediante un proceso de maximización de expectativas (EM) offline. El dominio de aplicación es el benchmark **Tau2 Airline**, que evalúa agentes conversacionales en entornos de control dual donde tanto el agente como el usuario interactúan con herramientas de servicio al cliente de aerolíneas (reservas, modificaciones, cancelaciones y reembolsos).

La relevancia de este modelo radica en su naturaleza experimental: no es un modelo generalista, sino un conjunto de adaptadores LoRA especializados en un dominio concreto (atención al cliente de aerolíneas) y en un paradigma de entrenamiento novedoso (inferencia de pensamientos a partir de datos de acción). El repositorio incluye varias variantes según el régimen de entrenamiento (ocultación de observaciones vs. contexto completo) y el tipo de pensamientos utilizados (`actions_only`, `expert_thoughts`, `thoughts_{policy,base}`), lo que permite estudiar el impacto de la inferencia de pensamientos en el rendimiento del agente.

Aunque el modelo base es un transformer de 4B parámetros con ventana de contexto amplia (128K tokens en la versión estándar de Qwen3), los adaptadores aquí presentados son de pequeño tamaño (el repo ocupa 1.2 GB, incluyendo todos los checkpoints). No se especifican licencia, idiomas ni pipeline de inferencia, por lo que su uso en producción requiere verificación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (r=8, alpha=16) sobre `Qwen/Qwen3-4B-Instruct-2507` (transformer decoder-only) |
| Parametros totales | No disponible (los adaptadores son pequeños; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredado del modelo base, presumiblemente 128k tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base soporta múltiples idiomas, pero los adaptadores no especifican) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder-only de Qwen3-4B-Instruct, sobre la que se aplican adaptadores LoRA de bajo rango (r=8, alpha=16). El entrenamiento es de tipo SFT (supervised fine-tuning) sobre el dataset `tau2bench/airline`, que contiene trayectorias de agentes en entornos de servicio a clientes de aerolíneas. La innovación técnica clave es el método **Act-PRM**: en lugar de entrenar directamente sobre acciones y observaciones, se infieren "pensamientos latentes" que explican las acciones, mediante un proceso de EM (expectation-maximization) offline. Esto produce tres variantes de pensamientos: `actions_only` (línea base, sin pensamientos), `expert_thoughts` (pensamientos oraculares, probablemente generados por un modelo experto) y `thoughts_{policy,base}` (pensamientos inferidos por el propio modelo). Además, se distinguen dos regímenes de contexto: uno que oculta las observaciones (hide-observations) y otro que usa el contexto completo (`full-context`).

Los datos de entrenamiento provienen de rollouts generados con `gpt-5-mini` (según los datasets asociados), con 32 muestras y 256 trayectorias por configuración. No se indica el número total de tokens ni el tamaño exacto del dataset, ni se mencionan técnicas adicionales como RLHF o DPO; solo SFT con la metodología Act-PRM.

## Capacidades

- **Agente conversacional en entornos de control dual**: el modelo está diseñado para interactuar con herramientas (reservas, modificaciones, cancelaciones) y con el usuario, tomando decisiones secuenciales en un entorno de servicio a clientes de aerolíneas.
- **Inferencia de acciones a partir de observaciones**: las variantes con pensamientos inferidos (`thoughts_{policy,base}`) pueden generar acciones coherentes con las observaciones del entorno, aunque la métrica principal es la predicción de la siguiente acción (action-accuracy).
- **Soporte de herramientas (tool calling)**: aunque no se menciona explícitamente, el benchmark Tau2 Airline requiere que el agente use herramientas de reserva y gestión de vuelos, por lo que el modelo ha sido entrenado para emitir llamadas a funciones.
- **Razonamiento multi-turno**: el entorno requiere mantener contexto a lo largo de la conversación con el usuario y las respuestas del sistema, por lo que el modelo maneja diálogos de varios turnos.
- **Capacidades multilingües**: no disponibles, aunque el modelo base Qwen3-4B-Instruct soporta múltiples idiomas, los adaptadores no especifican el idioma de entrenamiento (presumiblemente inglés, dado el benchmark).
- **Pensamiento inferido (Act-PRM)**: la principal capacidad novedosa es la integración de pensamientos latentes inferidos, que mejoran la coherencia entre acciones y observaciones.

## Casos de uso

- **Atención al cliente en aerolíneas (sector aéreo)**: el modelo puede gestionar conversaciones de soporte para reservas, cambios de vuelo, cancelaciones y reembolsos. Su entrenamiento específico en el dominio Tau2 Airline lo hace adecuado para prototipos de asistentes virtuales que necesitan seguir protocolos de negocio.
- **Entrenamiento de agentes RL (reinforcement learning)**: los adaptadores pueden servir como punto de partida (warm-start) para fine-tuning con RL, ya que las variantes con pensamientos inferidos proporcionan una señal de razonamiento útil para políticas de agente.
- **Evaluación de metodologías de inferencia de pensamiento**: investigadores que trabajan en interpretabilidad de agentes pueden usar este modelo para estudiar cómo la generación de pensamientos latentes mejora la predicción de acciones en entornos con observaciones parciales.
- **Generación de datos sintéticos de conversación**: los adaptadores pueden generar trayectorias de interacción agente-usuario que luego se utilizan para entrenar modelos de diálogo más generales en el dominio de servicios.
- **Benchmarking de agentes en entornos de control dual**: el modelo sirve como baseline para comparar con otros agentes en el leaderboard de Tau2 Airline, permitiendo evaluar el impacto de la inferencia de pensamientos en la precisión de acciones.
- **Adaptación rápida a dominios similares**: al ser LoRA de bajo rango, se puede adaptar fácilmente a otros benchmarks de agentes (por ejemplo, Tau2 en otros sectores como banca o telecomunicaciones) con poco esfuerzo computacional.

## Benchmarks y rendimiento

El único dato de evaluación publicado es la métrica de acción-solo (action-only) para la variante `expert_thoughts_all_lr3e_3_nb150_heldout`, que se reporta en la model card:

| Variante | Action-only PPL | Action-acc |
|---|---|---|
| `expert_thoughts_all_lr3e_3_nb150_heldout` | 2.419 | 0.753 |

No se han publicado resultados para las otras variantes ni comparaciones con otros modelos en la información disponible. La métrica PPL más baja y la accuracy más alta indican una buena capacidad de predecir la siguiente acción, pero no se dispone de datos sobre el rendimiento en tareas de conversación completas (por ejemplo, tasa de éxito en completar reservas).

## Requisitos de hardware

- **VRAM estimada**: al ser adaptadores LoRA sobre un modelo de 4B parámetros, la inferencia puede ejecutarse en GPUs con al menos 8 GB de VRAM si se cuantiza el modelo base (por ejemplo, Q4_K_M con llama.cpp). Con el modelo en FP16, se necesitan aproximadamente 8-10 GB de VRAM para el modelo base más los adaptadores.
- **GPU recomendadas**: una RTX 3060 (12 GB), RTX 4070 (12 GB) o superior es suficiente para pruebas; para producción se recomienda A10G o A100.
- **Compatibilidad con consumer GPUs**: sí, cabe en GPUs de consumo (RTX 3090, RTX 4090) con cuantización Q4/Q8.
- **Opciones de despliegue**: al ser adaptadores LoRA, se pueden cargar con librerías como `peft` en PyTorch, o convertir a GGUF para usar con llama.cpp, Ollama o vLLM (aunque vLLM no soporta LoRA nativamente). El modelo base Qwen3-4B está soportado por Ollama y vLLM.
- **Latencia y throughput**: no se han publicado mediciones específicas. En una RTX 4090, un modelo de 4B cuantizado a Q4 puede generar ~50-100 tokens/s.

## Comparativa con modelos similares

No hay datos de comparación directa en la información disponible. Sin embargo, se puede contextualizar con alternativas en el mismo dominio:

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mzio/aprm-sft-tau2-airline` | Qwen3-4B-Instruct | 4B (base) | 128k | No disponible | HF |
| `Qwen3-4B-Instruct` (base) | Qwen3 | 4B | 128k | Apache 2.0 | HF |
| `gpt-5-mini` (API) | OpenAI | No público | No público | Comercial | API |

El modelo base Qwen3-4B-Instruct tiene una licencia Apache 2.0 y está disponible en abierto, mientras que los adaptadores de este repositorio no especifican licencia. El rendimiento en Tau2 Airline no se puede comparar sin datos adicionales.

## Limitaciones y advertencias

- **Dominio muy específico**: el modelo está entrenado exclusivamente en el dominio de atención al cliente de aerolíneas (Tau2 Airline). No es adecuado para tareas generales de conversación o razonamiento fuera de este ámbito.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar acciones o respuestas incorrectas, especialmente en situaciones no cubiertas en el entrenamiento. La métrica de acción-acc (0.753) indica que falla en aproximadamente el 25% de las predicciones de acción.
- **Sin datos de evaluación completa**: solo se reporta la métrica de acción-solo; no hay información sobre éxito en tareas completas (completar reservas, etc.), lo que limita la confianza en su uso real.
- **Licencia no especificada**: al no indicar licencia, no se puede garantizar su uso comercial. Se debe contactar al autor o verificar el repositorio.
- **Dependencia del modelo base**: los adaptadores solo funcionan con el modelo base exacto `Qwen/Qwen3-4B-Instruct-2507`; no son portables a otros modelos.
- **Riesgo de alucinación en pensamientos inferidos**: la variante `thoughts_{policy,base}` genera pensamientos que pueden no ser fieles a la realidad del entorno, lo que podría propagar errores en el entrenamiento posterior.
- **Falta de información sobre el dataset**: no se detalla el tamaño del dataset de entrenamiento ni su composición, lo que dificulta evaluar la robustez del modelo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mzio/aprm-sft-tau2-airline)
- [Dataset de generaciones de pensamientos](https://huggingface.co/datasets/mzio/aprm-thought-generations-tau2-airline)
- [Leaderboard Tau2 Airline](https://llm-stats.com/benchmarks/tau2-airline)
- [Repositorio tau2-agentic-rl (artefactos)](https://github.com/yuyu0529nya/tau2-agentic-rl/tree/main/artifacts/tau2-airline)
- [Dataset de rollouts Act-PRM](https://www.selectdataset.com/dataset/4f7e7e9abbe6d180a9a7ef4aa2f1633a/mzio-aprm-tau2-airline-gpt5m-med-gs4-s0-train)
