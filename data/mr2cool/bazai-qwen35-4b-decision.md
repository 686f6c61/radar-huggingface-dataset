# Mr2cool/bazai-qwen35-4b-decision

## Resumen

Bazai Qwen3.5-4B Decision es un modelo especializado en toma de decisiones estructuradas, desarrollado por Mr2cool (Bazai) a partir del modelo base `unsloth/Qwen3.5-4B`. No está concebido como un asistente conversacional general, sino como una capa de decisión dentro de agentes de IA y flujos de trabajo automatizados: recibe un estado y un conjunto de preguntas tipadas (elección entre opciones, sí/no o puntuación por niveles) y devuelve una respuesta junto con su distribución de probabilidades.

El modelo se ha ajustado mediante LoRA y una cabeza de decisión específica, usando el enfoque de entrenamiento de Unsloth (`FastDecisionModel` y `DecisionTrainer`) sobre el dataset `LocalLLaMA/typed-decisions`. Esta arquitectura permite integrar el modelo como un componente determinista y repetible en pipelines donde se requiere clasificar, enrutar o aprobar solicitudes de forma masiva.

Su relevancia actual radica en la creciente demanda de capas de decisión ligeras y calibradas dentro de sistemas multiagente, donde un LLM de razonamiento orquesta el flujo y un modelo pequeño y especializado resuelve decisiones concretas con probabilidades explícitas. Con 4B parámetros y licencia Apache 2.0, es adecuado para despliegues de alto volumen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con adaptador LoRA y cabeza de decisión |
| Parámetros totales | 4B (modelo base); adaptador LoRA adicional |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (max_seq_length de entrenamiento/inferencia) |
| Tipos de cuantización | 4-bit (carga de entrenamiento/inferencia); float16 (artefacto merged opcional) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA + cabeza de decisión + calibración) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-4B`, un transformer de 4B parámetros, y se adapta mediante LoRA (parameter-efficient fine-tuning) con una cabeza de decisión añadida. La carga se realiza en 4-bit con una longitud máxima de secuencia de 2048 tokens. El entrenamiento emplea `FastDecisionModel` y `DecisionTrainer` de Unsloth, junto con un proceso de calibración que se guarda junto a los adaptadores.

Los datos de entrenamiento provienen del dataset `LocalLLaMA/typed-decisions`, cuyos ejemplos contienen `state`, `questions` y `gold`. La evaluación se realiza sobre un holdout de 80 filas y 400 decisiones. El modelo soporta tres tipos de decisión: *choice* (seleccionar una opción de un conjunto definido), *noul* (decisión sí/no) y *score* (seleccionar un nivel o puntuación definido). El notebook también permite guardar un modelo merged en float16 mediante `save_pretrained_merged`, separado del flujo de entrenamiento en 4-bit.

## Capacidades

- Toma de decisiones estructuradas tipadas: elección entre opciones, sí/no y puntuación por niveles.
- Devolución de respuesta junto con distribución de probabilidades calibradas por pregunta.
- Clasificación de texto orientada a enrutamiento y categorización.
- Integración como capa de decisión dentro de agentes de IA y flujos multi-paso.
- Procesamiento de múltiples preguntas de decisión sobre un mismo estado de entrada.
- Soporte de calibración de probabilidades (calibration error reportado de 0.02–0.06).
- No está diseñado como asistente conversacional general ni como razonador autónomo.

## Casos de uso

- Enrutamiento de tickets y solicitudes: el modelo recibe el texto de la solicitud y decide a qué equipo asignarla (billing, technical, sales) mediante una decisión de tipo *choice*, adecuado por su capacidad de clasificación calibrada y su bajo coste por inferencia.
- Decisiones de reembolso o aprobación: con una pregunta tipo *noul*, el modelo determina si el cliente solicita un reembolso y devuelve la probabilidad asociada, lo que permite umbrales configurables en el flujo de aprobación.
- Evaluación de urgencia: mediante una decisión tipo *score* con niveles definidos (no urgente, pronto, hoy), el modelo prioriza solicitudes en un sistema de soporte o mesa de ayuda.
- Capa de decisión en agentes de IA: un LLM de razonamiento orquesta el flujo y delega decisiones concretas al modelo Bazai, que actúa como componente determinista y repetible dentro de la arquitectura de agente.
- Clasificación estructurada de alto volumen: en pipelines donde se procesan miles de elementos por hora, el modelo de 4B en 4-bit ofrece un coste computacional bajo frente a LLMs mayores.
- Automatización de flujos de trabajo con múltiples criterios: el modelo puede evaluar varias preguntas de decisión sobre un mismo estado (equipo, reembolso, urgencia) en una sola pasada, lo que simplifica la lógica de enrutamiento.
- Selección de equipo o recurso: decisión de tipo *choice* para asignar tareas, revisiones o casos a equipos o personas según criterios definidos.

## Benchmarks y rendimiento

Los resultados reportados en el notebook del autor son los siguientes (no reproducidos de forma independiente para este repositorio):

| Métrica | Valor reportado |
|---|---|
| Precisión de decisión (holdout) | 75–78% |
| Error de calibración | 0.02–0.06 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 4-bit: aproximadamente 2,5–3,5 GB para los pesos del modelo base de 4B, más overhead de activaciones y cabeza de decisión.
- VRAM estimada para inferencia en float16 (modelo merged): aproximadamente 8–9 GB.
- GPU recomendadas: RTX 3060 12 GB o superior para 4-bit; RTX 4090, A100 o H100 para despliegues de mayor throughput o float16.
- Cabe en GPU de consumo: sí, en 4-bit en GPUs con 6–8 GB o más; en float16 en GPUs con 10–12 GB o más.
- Opciones de despliegue: transformers con Unsloth (`FastDecisionModel`); el modelo base Qwen3.5-4B es compatible con vLLM, llama.cpp, Ollama y TGI, aunque la cabeza de decisión y el flujo de calibración requieren el entorno Unsloth.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bazai Qwen3.5-4B Decision | 4B + LoRA | 2048 | Decisión estructurada | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base) | 4B | no disponible | LLM general | no disponible | Hugging Face |
| LLM general de 4B con prompting | 4B | variable | LLM general | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas específicas de modelos de decisión en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento depende de la calidad y cobertura de los datos de entrenamiento y de los criterios de decisión definidos.
- Puede producir decisiones incorrectas ante situaciones fuera de la distribución de entrenamiento.
- Las probabilidades de salida no deben interpretarse automáticamente como probabilidades del mundo real sin validación y calibración en el dominio de producción.
- El modelo solo soporta inglés; no se ha validado su comportamiento en otros idiomas.
- No debe usarse como único responsable de decisiones de alto impacto (médicas, legales, financieras, de empleo o de seguridad) sin supervisión humana y validación adecuada.
- No está diseñado como asistente conversacional general ni como sustituto autónomo del juicio humano.
- La evaluación reportada (75–78% de precisión) no ha sido reproducida de forma independiente.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda evaluar el modelo en el dominio de producción antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mr2cool/bazai-qwen35-4b-decision
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
