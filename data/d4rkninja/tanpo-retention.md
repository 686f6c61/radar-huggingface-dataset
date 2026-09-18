# d4rkninja/tanpo-retention

## Resumen

Tanpo Retention es un ajuste fino (fine-tuning) del modelo LiquidAI/LFM2.5-1.2B-Instruct, desarrollado por el usuario d4rkninja dentro de la colección "Tanpo — Domain Specialists". Se trata de un especialista compacto de aproximadamente 1,17 mil millones de parametros orientado en exclusiva a flujos de trabajo de retencion de clientes: onboarding, activacion, salvamento frente a churn, playbooks de customer success, seguimiento de health scores, renovaciones, expansion, escalado y winback. El objetivo declarado es ofrecer inferencia privada y de bajo coste en local o en el borde (edge), sin depender de un modelo generalista de gran tamano.

El modelo conserva la ventana de contexto de 32.768 tokens de su base y esta publicado en formato Transformers con pesos safetensors ya fusionados (la LoRA se ha integrado en los pesos base mediante `merge_and_unload`). El autor publica tambien un adaptador LoRA por separado y una version cuantizada en GGUF. El idioma soportado es unicamente el ingles (etiqueta `en`).

Su relevancia es acotada pero clara: demuestra el patron de especializacion de modelos pequenos por dominio vertical, con una mejora medida por el propio autor frente al modelo base en una evaluacion automatica interna (+1,8 puntos porcentuales en la rubrica global). No es un modelo de proposito general ni compite en conocimiento del mundo con modelos de mayor escala; su interes esta en el coste de despliegue y en la estructura repetible de las tareas de retencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; la etiqueta del repositorio indica la familia lfm2 (LFM2.5) |
| Parametros totales | 1.170.340.608 (~1,17 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base LFM2.5-1.2B-Instruct) |
| Tipos de cuantizacion | Pesos completos en safetensors en este repositorio; cuantizaciones GGUF en repositorio aparte (el autor recomienda `Q4_K_M` cuando este disponible) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other` (no se detallan los terminos en la informacion proporcionada) |
| Formato de pesos | Safetensors (Transformers) + GGUF en repositorio separado |
| Tamano del repositorio | 2,3 GB |
| Modelo base | LiquidAI/LFM2.5-1.2B-Instruct |
| Metodo de ajuste | LoRA (PEFT) via Unsloth, fusionado en los pesos finales |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del checkpoint LiquidAI/LFM2.5-1.2B-Instruct, cargado a traves del identificador compatible de Unsloth (`unsloth/LFM2.5-1.2B-Instruct`). El entrenamiento se realizo con LoRA sobre PEFT usando Unsloth `FastLanguageModel`, con rango `r=16`, alpha de 16, dropout 0, sin sesgo (`bias: none`) y tipo de tarea `CAUSAL_LM`. Los modulos objetivo son los modulos de proyeccion de atencion y MLP, seleccionados mediante una expresion regular de Unsloth/PEFT recogida en `adapter_config.json`. Posteriormente el adaptador se fusiono en los pesos completos con `merge_and_unload`, de modo que este repositorio contiene un checkpoint unico sin necesidad de cargar el adaptador por separado.

El dataset de entrenamiento es `d4rkninja/tanpo-retention-sft`, descrito por el autor como ejemplos de chat SFT con formato corregido. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion detallada del dataset, la mezcla de idiomas ni si hubo etapas de RLHF o DPO adicionales. Tampoco se documentan innovaciones tecnicas propias mas alla del proceso de especializacion por dominio: el valor del modelo reside en el ajuste de comportamiento (estructura de respuesta, guardrails de identidad y plantillas de intervencion) y no en cambios arquitectonicos sobre la base. La model card no describe la arquitectura interna del checkpoint LFM2.5 mas alla de su naturaleza de modelo para edge/on-device.

## Capacidades

- Generacion de texto conversacional orientada a flujos de customer success y retencion en ingles.
- Construccion de planes de onboarding y activacion ligados a time-to-value, con reparto de roles y fases temporales.
- Diagnostico de riesgo de renovacion a partir de senales de cuenta, separando hechos, hipotesis, responsable, momento y siguiente conversacion.
- Redaccion de secuencias de winback y de borradores de salvamento frente a churn tras escalados de soporte no resueltos.
- Playbooks de customer success, preparacion de renovaciones, seguimiento de riesgo y planes de expansion.
- Interpretacion de health scores y traduccion a planes de accion practicos por cuenta.
- Codificacion de escalados (escalation) con estructura y sin invencion de hechos de cuenta, segun la evaluacion interna del autor.
- Guardrails de identidad: el autor reporta la mayor mejora relativa frente a la base en la categoria `identity_guardrails` (+34,3 puntos porcentuales).
- Soporte de plantilla de chat (`apply_chat_template`) con mensajes de sistema, usuario y asistente.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion proporcionada.
- No esta disenado para programacion general ni para conversacion ajena al dominio de retencion.

## Casos de uso

- Asistente interno de customer success: el modelo genera borradores de playbooks y planes de accion por cuenta a partir de senales introducidas por el gestor, con la estructura hechos/hipotesis/responsable/plazo/siguiente paso que el ajuste ha reforzado.
- Preparacion de reuniones de renovacion: a partir de un resumen de uso, tickets y health score, produce un guion de conversacion y una lista de riesgos priorizados, sin inventar datos de la cuenta.
- Salvamento frente a churn en soporte: tras un escalado mal resuelto, redacta una secuencia de recuperacion respetuosa y escalonada en el tiempo; la evaluacion interna reporta 100 % en la categoria de escalados.
- Campanas de winback: genera secuencias de reactivacion por email o llamada para clientes que ya causaron baja, con tono cuidado y sin promesas de resultado.
- Onboarding de cuentas B2B SaaS: convierte un contexto de implementacion estancada y varios roles de usuario en un plan de 30 dias con hitos de activacion.
- Analisis de health scores: traduce una puntuacion de salud de cuenta en un plan de intervencion concreto, aunque el autor advierte de que el ajuste rinde por debajo de la base en esta categoria concreta (-5,5 pp).
- Clasificacion y enrutado previo: por su tamano (~1,17 B) puede ejecutarse en local para preprocesar senales de cuenta y etiquetar riesgo antes de escalar a un modelo mayor o a un humano.
- Soporte a equipos de expansion: borradores de propuestas de ampliacion de licencias o modulos basados en el estado de la cuenta, siempre como material de partida para revision humana.
- Despliegue en entornos con requisitos de privacidad: al poder correr en una GPU de consumo o incluso en CPU, permite procesar datos de clientes sin enviarlos a APIs externas.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de una evaluacion automatica interna del autor (arnes DarkLab), que el propio autor califica de direccional y no de benchmark industrial. Se uso el mismo conjunto de prompts y la misma configuracion de generacion para la base y para el ajuste.

| Modelo | Rubrica global |
|---|---|
| Base LFM2.5-1.2B-Instruct | 94,2 % |
| tanpo-retention | 96,0 % |
| Delta | +1,8 puntos porcentuales |

Resultados por categoria reportados por el autor:

| Categoria | Resultado |
|---|---|
| Escalation, renewals, winback | 100 % en el ajuste |
| identity_guardrails | +34,3 pp frente a la base |
| cs_playbooks | -22,2 pp frente a la base |
| health_scores | -5,5 pp frente a la base |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor senala como limitaciones de su propia evaluacion que las rubricas automaticas pueden premiar la estructura por encima de la calidad real, que el tamano de muestra es pequeno y que los resultados pueden no transferirse fuera de la distribucion de la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 1,17 B de parametros, sin contar cache KV): ~2,3 GB en FP16, ~1,2 GB en cuantizacion de 8 bits y ~0,7-0,9 GB en cuantizacion de 4 bits (por ejemplo Q4_K_M). Con contexto de 32.768 tokens la cache KV anade consumo adicional segun el backend; no se dispone de cifras oficiales del autor.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090, etc.) puede ejecutar el modelo en FP16 o en cuantizaciones menores.
- Es viable en CPU y en dispositivos de borde, dado que la base LFM2.5-1.2B-Instruct esta disenada por LiquidAI para despliegue on-device o en el borde.
- GPU de centro de datos (A100, H100, L40S) no son necesarias; solo tendrian sentido para servir muchas replicas concurrentes.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, llama.cpp u Ollama a traves de los GGUF publicados en el repositorio `d4rkninja/tanpo-retention-GGUF`, vLLM o TGI para servicio con batching (se recomienda verificar la compatibilidad de la arquitectura LFM2 con cada backend antes de ponerlo en produccion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. A modo orientativo, un modelo de este tamano suele responder en decenas de milisegundos por token en GPU de consumo moderna, pero no se ha publicado ninguna medicion oficial para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tanpo-retention | ~1,17 B | 32.768 tokens | Retencion y customer success (ingles) | `other` | HuggingFace, pesos safetensors y GGUF |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | ~1,17 B | 32.768 tokens | Proposito general, orientado a edge | No disponible en la informacion proporcionada | HuggingFace |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | Proposito general, multilingue | Apache 2.0 (segun su propia model card) | HuggingFace |
| Llama-3.2-1B-Instruct | ~1,2 B | 128.000 tokens | Proposito general, multilingue | Licencia comunitaria de Meta (segun su propia model card) | HuggingFace |

Nota: los datos de Qwen2.5-1.5B-Instruct y Llama-3.2-1B-Instruct proceden de conocimiento general sobre esos modelos y no de la informacion proporcionada en esta busqueda; conviene verificarlos en sus model cards oficiales. No se dispone de comparaciones de rendimiento entre estos modelos y tanpo-retention, ya que no existen benchmarks publicos en la informacion disponible. La comparacion relevante y documentada es contra su propio modelo base: +1,8 pp en la rubrica interna, con mejoras fuertes en escalados, renovaciones, winback y guardrails de identidad, y retrocesos en `cs_playbooks` y `health_scores`.

## Limitaciones y advertencias

- Modelo especializado: la calidad cae fuera de la distribucion de tareas de retencion y customer success. No es un modelo de proposito general.
- Escala reducida (~1,17 B): conocimiento del mundo y razonamiento de largo horizonte limitados en comparacion con modelos mayores.
- Las recomendaciones sobre clientes, health scores, renovaciones y escalados pueden ser incorrectas o incompletas; deben verificarse siempre contra la fuente original.
- El autor declara explicitamente que el modelo no esta disenado para decisiones de cancelacion de cuenta, precios o elegibilidad de clientes de forma totalmente automatizada.
- No debe usarse para fabricar hechos sobre clientes, suplantar identidad ni acceder sin autorizacion a sistemas de cliente.
- No ofrece garantias de retencion, renovacion, expansion ni resultados comerciales.
- Idioma unico: ingles. No se declara soporte de castellano ni de otros idiomas, por lo que su uso en entornos hispanohablantes requeriria validacion adicional.
- Licencia `other`: los terminos concretos no se detallan en la informacion proporcionada. Antes de un uso comercial es imprescindible revisar las condiciones del repositorio y las de la licencia del modelo base LiquidAI/LFM2.5-1.2B-Instruct.
- La evaluacion publicada es interna, automatica y de muestra pequena; el propio autor la califica de direccional. Ademas, el ajuste empeora respecto a la base en `cs_playbooks` (-22,2 pp) y `health_scores` (-5,5 pp), que son categorias centrales del dominio declarado.
- Riesgo de alucinacion en datos de cuenta no proporcionados en el prompt; el ajuste refuerza el formato y los guardrails, pero no elimina este riesgo.
- Repositorio sin descargas ni likes en el momento de la consulta, sin senales de adopcion o validacion por parte de terceros.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados correspondian a tecnicas de tincion histologica (PAS), sin relacion alguna con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d4rkninja/tanpo-retention
- Adaptador LoRA: https://huggingface.co/d4rkninja/tanpo-retention-LoRA
- Cuantizaciones GGUF: https://huggingface.co/d4rkninja/tanpo-retention-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/d4rkninja/tanpo-retention-sft
- Coleccion Tanpo — Domain Specialists: https://huggingface.co/collections/d4rkninja/tanpo-domain-specialists-6aaccdb3985768f6dad8449b
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Checkpoint compatible con Unsloth: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- Perfil del autor: https://huggingface.co/d4rkninja
- Artefactos de evaluacion: directorio `evaluation/` del repositorio, con `COMPARE_RETENTION.md`
- Resultados de busqueda web: no se encontraron enlaces relevantes sobre este modelo.
