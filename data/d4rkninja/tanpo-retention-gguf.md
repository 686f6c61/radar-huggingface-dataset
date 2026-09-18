# d4rkninja/tanpo-retention-GGUF

## Resumen

Tanpo Retention (GGUF) es la version cuantizada en formato GGUF del especialista `d4rkninja/tanpo-retention`, un ajuste fino de dominio centrado en retencion de clientes, renovaciones, expansion y recuperacion de cuentas (winback). Lo desarrolla el usuario d4rkninja dentro de la coleccion "Tanpo - Domain Specialists", una familia de modelos de negocio compactos pensados para despliegue local, en el borde (edge) o en infraestructura de bajo coste. El modelo parte del checkpoint `LiquidAI/LFM2.5-1.2B-Instruct` de Liquid AI, con aproximadamente 1.170 millones de parametros y una ventana de contexto de 32.768 tokens.

El problema que resuelve es concreto: disponer de un asistente especializado que redacte planes de customer success, guiones de retencion, propuestas de renovacion y flujos de winback sin depender de APIs externas ni de modelos de gran tamano. Al ser un modelo de 1,2B, puede ejecutarse en portatiles y equipos sin GPU dedicada mediante llama.cpp o LM Studio, lo que facilita escenarios con requisitos de privacidad o coste bajo. El ajuste se realizo con LoRA/PEFT sobre el checkpoint cargado desde `unsloth/LFM2.5-1.2B-Instruct`, y los archivos GGUF publicados corresponden al modelo ya fusionado (merged), sin necesidad de aplicar el adaptador por separado.

Es relevante ahora porque la tendencia hacia especialistas pequenos y desplegables localmente permite sustituir prompts genericos por modelos afinados en un flujo de negocio concreto, con una mejora medida de +1,8 puntos porcentuales en la rubrica de evaluacion del autor frente al modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin adopcion verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de LiquidAI/LFM2.5-1.2B-Instruct (familia LFM2.5 de Liquid AI); la composicion interna no se detalla en la informacion proporcionada |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | GGUF; el autor recomienda Q4_K_M como opcion de uso diario. Los archivos concretos pueden variar segun la release y no se enumeran en la informacion disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | other; hereda obligaciones del modelo base LFM2.5 de Liquid AI. Revisar los terminos de Liquid AI antes de redistribuir o usar comercialmente |
| Formato de pesos | GGUF (llama.cpp, LM Studio y otras herramientas compatibles). Existen tambien versiones merged en Transformers y LoRA en repositorios separados |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base `LiquidAI/LFM2.5-1.2B-Instruct` mas alla de su proposito declarado para despliegue en el borde y su ventana de 32.768 tokens. Este repositorio no introduce cambios arquitectonicos: es una conversion a GGUF del especialista fusionado `d4rkninja/tanpo-retention`, que a su vez deriva de LFM2.5-1.2B-Instruct.

En cuanto al entrenamiento, el autor indica un ajuste fino compatible con Unsloth sobre el checkpoint cargado mediante el hub id `unsloth/LFM2.5-1.2B-Instruct`, usando LoRA/PEFT, con posterior fusion de pesos para publicar los archivos standalone. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineacion posteriores al ajuste supervisado. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras) especificas de este fine-tune.

## Capacidades

- Generacion de texto conversacional en ingles orientada al dominio de retencion de clientes.
- Redaccion de planes de customer success y playbooks operativos.
- Soporte a flujos de onboarding y activacion de clientes.
- Elaboracion de propuestas de renovacion y planes de cuenta.
- Guiones de churn-save y contraofertas de retencion.
- Workflows de expansion (upsell/cross-sell) sobre cuentas existentes.
- Seguimiento de health scores de cliente, con la salvedad de que esta categoria rinde por debajo del modelo base.
- Gestion de escalados (escalation), donde el autor reporta un 100 % en su rubrica.
- Flujos de winback de clientes perdidos, tambien al 100 % segun la rubrica del autor.
- Guardrails de identidad: verificacion de identidad en la conversacion, con +34,3 puntos porcentuales frente al modelo base.
- No se reporta soporte de tool calling / function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- Multilingue: no. Solo ingles declarado.

## Casos de uso

- Redaccion de playbooks de customer success: el modelo genera procedimientos paso a paso para gestores de cuentas, aprovechando el ajuste en terminologia de retencion y su contexto de 32.768 tokens para incorporar el historial de la cuenta en el prompt.
- Guiones de churn-save: dado el contexto de una cuenta en riesgo, produce contraofertas y mensajes de retencion. El autor reporta 100 % en la categoria de escalado y renovaciones, lo que respalda este uso con revision humana.
- Planes de renovacion: a partir de fechas, uso del producto y contactos, el modelo redacta un plan de renovacion con hitos y argumentario comercial. Adecuado por su enfoque de dominio y bajo coste de inferencia.
- Campanas de winback: generacion de secuencias de contacto para clientes perdidos, con variantes de mensaje segun motivo de baja. El autor reporta un 100 % en esta categoria de su rubrica.
- Expansion y upsell: redaccion de propuestas de ampliacion de licencias o modulos adicionales apoyadas en el historial de la cuenta.
- Seguimiento de health scores: interpretacion de senales de salud de cuenta y sugerencia de acciones. Advertencia: esta categoria rinde 5,5 puntos porcentuales por debajo del modelo base, por lo que conviene validar las salidas.
- Guardrails de identidad en atencion al cliente: verificacion de que el interlocutor es quien dice ser antes de tratar datos de cuenta. Es la mejora mas marcada del fine-tune (+34,3 pp frente al base), lo que lo hace util como capa de control en flujos automatizados.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp o LM Studio, permite tratar datos de clientes sin enviarlos a una API externa.
- Asistencia interna para equipos de soporte: borradores de respuestas y planes de escalado que un humano revisa antes del envio.

## Benchmarks y rendimiento

El autor publica una evaluacion por rubrica sobre el modelo fusionado (no especifica si se ejecuto sobre los GGUF). Los datos disponibles son:

| Modelo | Puntuacion global de rubrica |
|---|---|
| Base (LFM2.5-1.2B-Instruct) | 94,2 % |
| Fine-tune (tanpo-retention) | 96,0 % |
| Delta | +1,8 puntos porcentuales |

Detalle por categoria segun el autor:

| Categoria | Resultado |
|---|---|
| Escalation | 100 % |
| Renewals | 100 % |
| Winback | 100 % |
| identity_guardrails | +34,3 pp frente al base |
| cs_playbooks | -22,2 pp frente al base |
| health_scores | -5,5 pp frente al base |

El autor indica que la metodologia completa esta en la model card del modelo fusionado `d4rkninja/tanpo-retention` y en el artefacto `evaluation/COMPARE_RETENTION.md`. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La propia model card advierte que la evaluacion es direccional y que la cuantizacion puede alterar ligeramente el comportamiento respecto a los pesos fusionados.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion calculada a partir del recuento de parametros; el autor no publica cifras): aproximadamente 0,75 GB en Q4_K_M, 0,85 GB en Q5_K_M, 1,25 GB en Q8_0 y 2,35 GB en F16, sin contar la cache KV.
- Cache KV: con 32.768 tokens de contexto el consumo adicional depende del numero de capas y cabezas de atencion, dato no disponible en la informacion proporcionada. Para contextos largos conviene reservar memoria adicional o reducir la ventana.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente para las cuantizaciones de 4 y 5 bits. No se requiere A100, H100 ni hardware de datacenter.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna (serie RTX 30/40, AMD equivalentes) e incluso en GPUs integradas con memoria compartida suficiente.
- CPU: es viable la inferencia solo en CPU con llama.cpp, dado el tamano del modelo.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runtime compatible con GGUF. Para los pesos fusionados en Transformers serian aplicables frameworks estandar, aunque no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

La informacion disponible no incluye comparativas con modelos de terceros. La comparacion posible se limita a las variantes del propio proyecto:

| Modelo | Parametros | Contexto | Formato | Licencia | Resultado reportado |
|---|---|---|---|---|---|
| tanpo-retention-GGUF (este) | 1.170.340.608 | 32.768 tokens | GGUF | other | No se evalua por separado; puede diferir ligeramente del fusionado |
| d4rkninja/tanpo-retention (fusionado) | 1.170.340.608 | 32.768 tokens | Transformers (safetensors) | other | 96,0 % en rubrica del autor |
| d4rkninja/tanpo-retention-LoRA | No disponible | 32.768 tokens | Adaptador LoRA/PEFT | other | No disponible |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | ~1,17B | 32.768 tokens | safetensors | Terminos de Liquid AI | 94,2 % en rubrica del autor |

Comparativa con alternativas de terceros de tamano similar (por ejemplo, modelos instruct de 1B a 2B parametros de otros fabricantes): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Es un especialista de dominio, no un modelo de proposito general. El propio autor lo desaconseja para programacion general o conversacion ajena a retencion de clientes.
- Idiomas: unicamente ingles declarado. No hay soporte documentado de castellano ni de otros idiomas.
- Riesgo de alucinacion: el autor prohibe explicitamente fabricar hechos sobre el cliente, la suplantacion de identidad y el acceso no autorizado. Cualquier dato de cuenta debe verificarse contra los sistemas de origen.
- Rendimiento desigual por categoria: `cs_playbooks` queda 22,2 puntos porcentuales por debajo del modelo base y `health_scores` 5,5 puntos por debajo. En estos dos flujos el fine-tune es peor que el modelo original.
- La evaluacion publicada es direccional y no sigue un benchmark estandar; no se detalla el tamano del conjunto de evaluacion ni el procedimiento de puntuacion en la informacion disponible.
- La cuantizacion puede modificar ligeramente el comportamiento respecto a los pesos fusionados, por lo que los resultados de la rubrica no son necesariamente extrapolables a los GGUF.
- Licencia `other`: hereda obligaciones del modelo base LFM2.5 de Liquid AI. No se debe asumir que Apache-2.0 cubre los pesos fusionados. Es imprescindible revisar los terminos de Liquid AI antes de uso comercial o de redistribuir derivados.
- Uso responsable: las comunicaciones a clientes, ofertas de retencion, planes de escalado y decisiones de cuenta consecuentes deben ser revisadas por una persona. No debe emplearse para engano, acoso, trato discriminatorio ni acceso no autorizado.
- Adopcion: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad.
- No se documentan capacidades de tool calling, agentes ni vision, lo que limita su integracion en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/d4rkninja/tanpo-retention-GGUF
- Modelo fusionado (Transformers): https://huggingface.co/d4rkninja/tanpo-retention
- Adaptador LoRA: https://huggingface.co/d4rkninja/tanpo-retention-LoRA
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Checkpoint para carga compatible con Unsloth: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- Coleccion Tanpo - Domain Specialists: https://huggingface.co/collections/d4rkninja/tanpo-domain-specialists-6aaccdb3985768f6dad8449b
- Artefacto de evaluacion comparativa: https://huggingface.co/d4rkninja/tanpo-retention/blob/main/evaluation/COMPARE_RETENTION.md
- Perfil del autor: https://huggingface.co/d4rkninja
