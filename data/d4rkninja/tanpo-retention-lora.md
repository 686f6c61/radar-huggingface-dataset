# d4rkninja/tanpo-retention-LoRA

## Resumen

Tanpo Retention (LoRA) es un adaptador PEFT de tipo LoRA creado por el usuario d4rkninja que especializa el modelo LiquidAI/LFM2.5-1.2B-Instruct en flujos de trabajo de retención de clientes: onboarding, activación, churn-save, renovaciones, expansión, escalado y winback. Forma parte de la colección Tanpo, una familia de especialistas de dominio empresarial construidos sobre una única arquitectura compacta y orientados a despliegue local, en el borde o de bajo coste.

El modelo base, LFM2.5-1.2B-Instruct, es un modelo de generación de texto de aproximadamente 1,17 mil millones de parámetros con 32.768 tokens de contexto, diseñado por Liquid AI para ejecución en dispositivo. El adaptador se ha entrenado con Unsloth y la familia distribuye cada especialista en tres formatos: pesos fusionados, adaptador LoRA (este repositorio) y GGUF cuantizado.

Su interés actual reside en el patrón de reutilización: una sola arquitectura compacta genera varios especialistas de dominio, lo que reduce el coste de servir asistentes empresariales. Además, el autor publica una evaluación interna automatizada en la que el ajuste fino alcanza un 96,0 % en la rúbrica global frente al 94,2 % del modelo base, con un 100 % en escalado, renovaciones y winback. Se trata de una evaluación direccional de dominio, no de un benchmark de industria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base LFM2.5-1.2B-Instruct; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | ~1,17 mil millones en el modelo base; numero de parametros entrenables del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponibles en el repositorio LoRA; el repositorio GGUF asociado recomienda Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 en el repositorio del adaptador; el uso conjunto con el modelo base queda sujeto a la licencia LFM de Liquid AI |
| Formato de pesos | Adaptador PEFT/LoRA (library_name: peft); el formato de serializacion no se especifica en la informacion disponible. Existe un repositorio GGUF independiente |

Datos adicionales del adaptador (procedentes de `adapter_config.json`): tipo PEFT LORA, rango r = 16, lora_alpha = 16, lora_dropout = 0, bias = none, modulos objetivo definidos por regex de Unsloth/PEFT sobre proyecciones de atención y MLP.

## Arquitectura y entrenamiento

El repositorio contiene únicamente el adaptador LoRA, no un modelo completo. La carga se realiza con `peft.PeftModel.from_pretrained` sobre el checkpoint base `unsloth/LFM2.5-1.2B-Instruct`, una versión compatible con Unsloth de `LiquidAI/LFM2.5-1.2B-Instruct`. Con r = 16 y alpha = 16, el adaptador mantiene un rango bajo y sin dropout, lo que apunta a un ajuste conservador sobre representaciones ya existentes del modelo base.

El entrenamiento se ha realizado sobre el dataset `d4rkninja/tanpo-retention-sft`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, la mezcla de idiomas ni si hubo etapas de RLHF, DPO u optimización por preferencias. Tampoco se documentan innovaciones técnicas propias más allá del uso del ecosistema Unsloth para el ajuste eficiente, ni el uso de decodificación especulativa o mecanismos de atención alternativos.

## Capacidades

- Generación de texto en inglés orientada a flujos de retención de clientes.
- Redacción de borradores para onboarding, activación, churn-save, renovación, expansión, escalado y winback.
- Elaboración de playbooks de customer success y planes de acción por cuenta.
- Guardarraíles de identidad del asistente: la categoría `identity_guardrails` mejora +34,3 puntos porcentuales respecto al modelo base según la evaluación del autor.
- Resultados del 100 % en las categorías de escalado, renovaciones y winback dentro de la rúbrica interna reportada.
- Capacidades de tool calling / function calling: no documentadas en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo se declara no diseñado para chat general ni para código.
- Capacidades de visión o audio: no disponibles.
- Modo de razonamiento explícito (thinking): no documentado.
- Multilingüismo: limitado al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Borradores de renovación comercial: el modelo genera propuestas de renovación a partir del contexto de cuenta, aprovechando su especialización en la categoría de renovaciones (100 % en la evaluación interna) y sus 32.768 tokens de contexto para incluir histórico de la relación.
- Mesa de retención (save desk): redacción de respuestas y ofertas de retención ante señales de cancelación, con revisión humana obligatoria antes del envío, tal como exige la propia model card.
- Onboarding y activación de clientes: generación de secuencias de mensajes y tareas de activación adaptadas al momento del ciclo de vida de la cuenta.
- Planes de expansión y upsell: propuesta de acciones de crecimiento por cuenta apoyadas en el contexto acumulado del cliente.
- Escalado de cuentas en riesgo: preparación de resúmenes y planes de escalado interno, categoría en la que el autor reporta un 100 % de cumplimiento de rúbrica.
- Campañas de winback: recuperación de clientes perdidos mediante mensajes y secuencias personalizadas, también con resultado del 100 % en la rúbrica reportada.
- Documentación de playbooks de customer success: generación de guías operativas y planes de acción reutilizables por el equipo de éxito del cliente.
- Asistente local para equipos comerciales: despliegue en portátil o equipo de borde con la versión GGUF cuantizada, sin enviar datos de cuentas a servicios externos.

## Benchmarks y rendimiento

| Modelo | Rubrica global |
|---|---:|
| Base (LFM2.5-1.2B-Instruct) | 94,2 % |
| Ajuste fino (Tanpo Retention LoRA) | 96,0 % |
| Delta | +1,8 puntos porcentuales |

Detalle por categoría reportado por el autor: `BEATS_BASE: YES`; resultados del 100 % en escalado, renovaciones y winback; `identity_guardrails` con +34,3 puntos porcentuales frente al base; por contra, el ajuste queda por detrás del base en `cs_playbooks` (−22,2 puntos porcentuales) y en `health_scores` (−5,5 puntos porcentuales).

Estos datos proceden de una evaluación automatizada interna de dominio (DarkLab), con los mismos prompts y configuración de generación para el modelo base y el ajustado. El propio autor indica que es una evaluación direccional y no un benchmark de industria. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA por sí solo ocupa muy poco espacio (típicamente decenas de megabytes), pero requiere cargar el modelo base; el tamaño exacto del fichero no está disponible.
- Pesos del modelo base estimados por cálculo directo a partir de 1,17 mil millones de parámetros: ~2,3-2,4 GB en fp16/bf16, ~1,2 GB en int8 y ~0,6-0,8 GB en cuantización de 4 bits (Q4_K_M). Son estimaciones, no cifras oficiales.
- El coste de la caché KV a 32.768 tokens depende de la configuración interna del modelo base, que no se detalla en la información disponible.
- GPU de consumo: cabe con holgura en tarjetas de 8-12 GB, como RTX 3060, RTX 4060 o RTX 4070; en 4 bits es viable incluso en equipos con menos VRAM compartiendo memoria con el sistema.
- GPU de datacenter: A100, H100 o L40S son suficientes pero sobredimensionadas para un modelo de ~1,2B; resultan útiles solo para servir muchas réplicas o adaptadores en paralelo.
- CPU: la versión GGUF permite inferencia en CPU mediante llama.cpp u Ollama, sin GPU.
- Opciones de despliegue: transformers junto con PEFT (`PeftModel.from_pretrained`), llama.cpp y Ollama a través del repositorio GGUF, vLLM (soporta adaptadores LoRA) y TGI. No se documentan configuraciones oficiales en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct (base) | ~1,17B | 32.768 tokens | Pesos completos | Licencia LFM de Liquid AI | Rubrica interna 94,2 % |
| Tanpo Retention LoRA (este repositorio) | Adaptador sobre ~1,17B | 32.768 tokens | PEFT/LoRA | Apache 2.0 en el adaptador; sujeta a la licencia del base | Rubrica interna 96,0 %; requiere el base |
| Tanpo Retention (fusionado) | ~1,17B | 32.768 tokens | Pesos completos | Sujeta a la licencia del base | Mismo ajuste sin necesidad de cargar un adaptador |
| Tanpo Retention GGUF | ~1,17B | 32.768 tokens | GGUF cuantizado | Sujeta a la licencia del base | Recomendado Q4_K_M; inferencia en CPU |

Dentro de la colección Tanpo existen otros especialistas sobre la misma arquitectura (marketing, producto, hiring, deals, fundraising), cada uno con versión fusionada, LoRA y GGUF. No se dispone en la información proporcionada de datos comparativos frente a otras familias de modelos pequeños de propósito general.

## Limitaciones y advertencias

- Modelo de dominio restringido: no está diseñado para chat general, código ni tareas ajenas a la retención de clientes.
- El ajuste empeora respecto al base en `cs_playbooks` (−22,2 puntos porcentuales) y en `health_scores` (−5,5 puntos porcentuales), según la evaluación del propio autor.
- La evaluación es interna, automatizada y direccional; no equivale a un benchmark estándar ni garantiza resultados en producción.
- Idioma limitado al inglés, según las etiquetas del repositorio.
- Riesgo de alucinación: al ser un adaptador de dominio sobre un modelo compacto de ~1,2B, las salidas deben verificarse contra el contexto real de la cuenta y los sistemas de origen.
- Uso responsable: el autor exige revisión humana de comunicaciones con clientes, ofertas de retención, planes de escalado y cualquier decisión consecuente sobre la cuenta.
- Prohibido el uso para engaño, acoso, trato discriminatorio o acceso no autorizado a sistemas.
- Licencia: el repositorio del adaptador está etiquetado como Apache 2.0, pero el uso combinado con el modelo base y la redistribución de pesos fusionados quedan sujetos a los términos de Liquid AI para LFM2.5/LFM, que prevalecen.
- No se documentan en la información disponible sesgos específicos, composición demográfica del dataset ni métricas de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d4rkninja/tanpo-retention-LoRA
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Checkpoint base compatible con Unsloth: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- Versión fusionada: https://huggingface.co/d4rkninja/tanpo-retention
- Versión GGUF: https://huggingface.co/d4rkninja/tanpo-retention-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/d4rkninja/tanpo-retention-sft
- Artefactos de evaluacion: https://huggingface.co/d4rkninja/tanpo-retention/tree/main/evaluation
- Coleccion Tanpo - Domain Specialists: https://huggingface.co/collections/d4rkninja/tanpo-domain-specialists-6aaccdb3985768f6dad8449b
- Perfil del autor: https://huggingface.co/d4rkninja

La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los unicos resultados obtenidos corresponden a paginas de webmail sin relacion con la ficha.
