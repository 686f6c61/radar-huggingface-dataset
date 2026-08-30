# mehul79/qwen35-4b-orchestrator-lora

## Resumen

El modelo `mehul79/qwen35-4b-orchestrator-lora` es un adaptador LoRA (PEFT) desarrollado por el usuario mehul79, diseñado como una política de orquestación de herramientas (tool-routing) sobre el modelo base `unsloth/Qwen3.5-4B`. Su función es, dado un system prompt, un roster de herramientas y el historial de conversación, seleccionar la siguiente llamada a herramienta o generar una respuesta directa. Este enfoque es relevante para sistemas multi-agente y asistentes que necesitan decidir dinámicamente qué herramienta invocar en cada turno.

El adaptador se fine-tuneó con QLoRA mediante Unsloth, con una sola época y un rango LoRA de 64, dropout de 0.05 y tasa de aprendizaje de 1e-4. Según la model card, la pérdida de evaluación descendió en cada paso durante el entrenamiento, finalizando en 0.944 (mejor valor), sin signos de divergencia. Se trata de un adaptador ligero (1.0 GB) que se carga sobre el modelo base de 4B parámetros, lo que lo hace apto para entornos con recursos limitados.

Aunque el entrenamiento muestra señales positivas, el autor indica que aún no se ha evaluado contra el conjunto de validación congelado `golden_v2.0`, por lo que los resultados deben considerarse preliminares. No se dispone de información sobre licencia, idiomas soportados ni benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre Qwen3.5-4B (transformer decoder) |
| Parametros totales | no disponible (el adaptador añade un número reducido de parámetros entrenables; el base tiene ~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (el adaptador se usa sobre el base; el base puede cuantizarse con bitsandbytes o GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer del modelo Qwen3.5-4B, al que se le añade una capa LoRA de rango 64 y alpha 128, con dropout de 0.05. El entrenamiento se realizó mediante QLoRA (quantized LoRA) con Unsloth, una librería optimizada para fine-tuning eficiente. La pérdida se enmascaró para que solo los spans de turno del asistente contribuyeran al gradiente, ignorando el system prompt, los esquemas de herramientas y los turnos de usuario o resultados de herramientas.

El dataset de entrenamiento consistió en 3,601 registros, que generaron 10,889 spans entrenables de asistente, divididos en 3,417 para entrenamiento y 184 para validación. Se utilizó una sola época con una tasa de aprendizaje de 1e-4, y el mejor paso según `load_best_model_at_end` fue el 214 (final), con una pérdida de evaluación de 0.944. Este diseño busca corregir el sobreajuste observado en la versión v3, reduciendo el rango LoRA y añadiendo dropout.

## Capacidades

- Selección de llamadas a herramientas: dado un conjunto de herramientas definidas en el system prompt, el modelo decide cuál invocar y con qué argumentos.
- Generación de respuestas directas: cuando ninguna herramienta es necesaria, produce una respuesta textual coherente con el contexto.
- Gestión de historial conversacional: utiliza el contexto de la conversación para tomar decisiones de routing informadas.
- Integración con frameworks de agentes: puede usarse como política central en sistemas que requieren razonamiento multi-paso con herramientas.
- Entrenamiento específico para orquestación: a diferencia de un modelo generativo general, está especializado en la tarea de routing, lo que puede reducir latencia en sistemas de agentes.
- Ligero y portable: al ser un adaptador LoRA, puede cargarse sobre el modelo base con pocos recursos adicionales.

## Casos de uso

- Asistentes virtuales empresariales: el modelo puede gestionar consultas que requieren acceder a bases de datos o APIs internas, decidiendo en cada turno si llamar a una herramienta (por ejemplo, consultar un CRM) o responder directamente.
- Sistemas multi-agente: en arquitecturas donde varios agentes especializados compiten por responder, este adaptador actúa como enrutador central que selecciona el agente adecuado según la intención del usuario.
- Automatización de flujos de trabajo: para tareas como reservas, gestión de incidencias o pedidos, el modelo puede orquestar llamadas a APIs de terceros (pagos, envíos, calendarios) de forma secuencial.
- Chatbots de soporte técnico: integrado con una base de conocimiento y herramientas de diagnóstico, el modelo decide si buscar documentación, ejecutar un comando de diagnóstico o escalar a un humano.
- Generación de código asistida por herramientas: el modelo puede decidir si llamar a un intérprete, un linter o un buscador de documentación antes de generar código, mejorando la precisión en entornos de desarrollo.
- Pruebas de concepto en investigación: dado su tamaño reducido, es útil para validar arquitecturas de agentes en entornos académicos o prototipos rápidos antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta las pérdidas de entrenamiento y validación durante el fine-tuning:

| Paso | Época | Pérdida entrenamiento | Pérdida validación |
|---|---|---|---|
| 25 | 0.12 | 1.075 | 1.081 |
| 50 | 0.23 | 0.952 | 1.017 |
| 100 | 0.47 | 0.921 | 0.970 |
| 150 | 0.70 | 0.909 | 0.951 |
| 175 | 0.82 | 0.793 | 0.947 |
| 214 (final) | 1.00 | 0.917 (media) | 0.944 (mejor) |

El autor indica que estos números son solo señal de entrenamiento y no deben usarse para decisiones de promoción del modelo. No hay comparaciones con otros sistemas de orquestación ni métricas estándar como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo de 4B parámetros, la VRAM necesaria depende de la cuantización del base. Con cuantización de 4 bits (QLoRA), se estiman entre 6-8 GB para inferencia; sin cuantizar, unos 10-12 GB.
- GPUs recomendadas: tarjetas con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, o GPUs de datacenter como A10G o L4. El entrenamiento se realizó en un entorno con CUDA 12.8, presumiblemente una GPU de gama alta.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs consumer de 8-12 GB (RTX 3060/4070, etc.).
- Opciones de despliegue: se puede usar con Transformers + PEFT, vLLM (cargando el adaptador sobre el base), o llama.cpp si se fusiona el adaptador con el modelo base. También es compatible con Ollama mediante la creación de un Modelfile.
- Latencia y throughput: no disponibles, pero al ser un modelo de 4B con LoRA, la latencia es típicamente inferior a 100 ms por token en GPUs modernas, dependiendo del hardware.

## Comparativa con modelos similares

No hay información suficiente para una comparativa rigurosa. Se conoce la existencia de otro adaptador similar, `BRlkl/orchestrator-qwen3-4b-lora-sft`, pero no se dispone de sus especificaciones ni rendimiento. Tampoco se tienen datos del modelo base Qwen3.5-4B más allá de que es de la familia Qwen. Por tanto, la comparativa se limita a señalar que ambos adaptadores persiguen el mismo objetivo de orquestación sobre un base de 4B, pero sin datos cuantitativos.

| Modelo | Parámetros (base) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mehul79/qwen35-4b-orchestrator-lora | ~4B (base) | no disponible | no disponible | HuggingFace (adaptador) |
| BRlkl/orchestrator-qwen3-4b-lora-sft | ~4B (base) | no disponible | no disponible | HuggingFace (adaptador) |
| Qwen3.5-4B (base) | ~4B | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- No hay información sobre sesgos o alucinaciones específicas del adaptador; al ser un modelo de orquestación, su riesgo principal es elegir una herramienta incorrecta o generar argumentos inválidos.
- El modelo depende completamente del modelo base Qwen3.5-4B; cualquier limitación de este (idiomas, conocimiento, contexto) se hereda.
- La licencia no está especificada, lo que impide garantizar su uso comercial sin riesgo legal.
- No ha sido evaluado contra un conjunto de validación externo; los resultados de entrenamiento no garantizan rendimiento en producción.
- El adaptador está diseñado para una tarea muy específica (routing de herramientas); no es un modelo de propósito general.
- El tamaño del repo (1.0 GB) sugiere que el adaptador puede incluir pesos en múltiples formatos, pero no se detalla.
- La fecha de creación (2026) indica que es un modelo reciente, con posible falta de madurez en la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mehul79/qwen35-4b-orchestrator-lora
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Colección Qwen3 en HuggingFace: https://huggingface.co/collections/Qwen/qwen3
- Adaptador similar (BRlkl): https://huggingface.co/BRlkl/orchestrator-qwen3-4b-lora-sft
- Repositorio de fine-tuning Qwen3.5-4B: https://github.com/IIIIQIIII/qwen35-4b-lora-sft
- Guía de modelos Qwen (insiderllm.com): https://insiderllm.com/guides/qwen-models-guide/
