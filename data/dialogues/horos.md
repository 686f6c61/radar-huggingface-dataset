# Dialogues/horos

## Resumen

Horos es un router de alcance de datos personales desarrollado por Dialogues para su framework Topos. Se trata de un clasificador de texto multi-etiqueta basado en DistilBERT (encoder transformer) que recibe una pregunta en lenguaje natural y devuelve los ámbitos de datos (scopes) que toca, un `none` explícito cuando no hay datos personales, o una señal de escalado a un LLM cuando no está seguro. Su función principal es ejecutarse on-device, antes de la puerta de permisos, para que la pregunta cruda nunca salga del dispositivo, reforzando la privacidad.

El modelo pesa 268 MB, está entrenado en inglés y se distribuye con licencia Apache 2.0. La versión v2 (2026-08-16) mejora la macro-F1 de 0.512 a 0.613, pero aún no está promocionada para producción debido a limitaciones en la tasa de desajuste (disjoint rate) y en el recall por ámbito. Horos no es un autorizador: cada ámbito emitido se sigue comprobando contra permisos en el flujo descendente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer) con cabeza de clasificación multi-etiqueta |
| Parametros totales | no disponible (modelo base DistilBERT tiene ~66M, no confirmado para esta variante) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Horos se basa en el encoder DistilBERT (`distilbert-base-uncased`) con una cabeza de clasificación multi-etiqueta adaptada para el enrutamiento de ámbitos. El modelo se entrena sobre los datasets AmazonScience/massive y clinc/oos-eval, aunque la model card no detalla el número de tokens ni la composición exacta del corpus. La decisión de enrutado se realiza mediante umbrales (`tau_low` y `tau_high`) que determinan si se actúa sobre un conjunto de ámbitos, se abstiene (`none`) o se escala a un LLM. Esta lógica de escalado es parte integral del diseño: Horos nunca se ejecuta de forma aislada, sino como cabeza de un paquete Topos con un LLM de respaldo.

La versión v2 incorpora mejoras frente a v1, especialmente en frases de tipo "band" (p. ej., "cómo ha sido mi sueño") frente a las de tipo "artifact" (p. ej., "cuál es mi tendencia de frecuencia cardíaca en reposo"). El entrenamiento incluye una evaluación con datos no vistos y una separación entre errores de "swallowed" (tragados, no escalados) y "escalated" (escalados), que tienen correcciones opuestas.

## Capacidades

- Clasificación multi-etiqueta de ámbitos de datos personales a partir de texto libre.
- Detección de ausencia de datos personales (`none`) y abstinencia explícita.
- Escalado automático a un LLM cuando el modelo no está seguro (ambigüedad o ignorancia).
- Ejecución on-device: el modelo es pequeño (268 MB) y está diseñado para no enviar la pregunta cruda a servidores externos.
- Validación de etiquetas contra un registro de ámbitos vivo y un manifiesto de entrenamiento contra la política de licencia (a través de `topos.query.scope_head.load_head`).
- No genera texto, no soporta tool calling ni razonamiento multi-paso; es un componente de enrutamiento, no un LLM.

## Casos de uso

- Asistente de salud personal on-device: Horos detecta si una pregunta del usuario menciona datos médicos (p. ej., "¿cómo ha sido mi sueño esta semana?") y solo entonces permite el acceso al módulo de salud, manteniendo la consulta en el dispositivo.
- Control de privacidad en aplicaciones de finanzas: al recibir "¿cuánto gasté en restaurantes el mes pasado?", el router identifica el ámbito de transacciones y activa la comprobación de permisos antes de responder.
- Enrutamiento de consultas en asistentes de voz: clasifica la intención en ámbitos como ubicación, contactos o calendario, y escala a un LLM solo cuando la consulta es ambigua o fuera de los ámbitos conocidos.
- Filtrado de datos personales en logs de soporte: antes de registrar una conversación, Horos decide si contiene datos sensibles y, si es así, la deriva a un tratamiento especializado o la bloquea.
- Preprocesamiento en pipelines de datos: como primer paso para decidir qué consultas requieren autorización explícita del usuario, reduciendo la carga sobre sistemas de permisos más pesados.
- Evaluación de riesgo de privacidad en aplicaciones de terceros: integrado en un SDK, permite a los desarrolladores saber si una acción del usuario toca datos personales y así aplicar políticas de consentimiento dinámicas.

## Benchmarks y rendimiento

La model card publica varios bloques de evaluación. El bloque 1 es el principal (gate de promoción) y compara v2, v1 y un baseline LLM (mistral:7b, 4.4 GB):

| metric | v2 | v1 | mistral:7b (4.4 GB) | gate |
|---|---|---|---|---|
| macro-F1 | **0.613** | 0.512 | 0.495 | ≥ incumbent ✅ |
| exact set match | **0.558** | 0.496 | 0.243 | — |
| negatives abstained | 0.941 | 0.984 | 0.126 | ≥0.85 ✅ |
| single / multi-gold recall | 0.502 / 0.596 | 0.388 / 0.425 | — | gap ≤0.05 ✅ |
| dead rate | **0.149** | 0.171 | — | <0.20 ✅ |
| **disjoint rate** | 0.206 | 0.217 | — | ≤0.03 ❌ |
| per-scope recall ≥ 0.60 | 6 / 14 | 2 / 14 | 9 / 14 | 14/14 ❌ |

El bloque 2 (53 frases naturales anotadas manualmente) muestra:

| metric | v2 | v1 | gate |
|---|---|---|---|
| correct | **0.774** | 0.585 | — |
| swallowed | **0.132** | 0.189 | — |
| escalated | 0.094 | 0.189 | — |
| **swallowed — artifact-concrete** | 0.176 | 0.265 | ≤0.10 ❌ |
| swallowed — abstract / band | 0.053 | 0.053 | — |

El bloque 3 (2.745 frases no vistas, generadas por esquema) indica:

| metric | v2 | v1 | ratchet |
|---|---|---|---|
| routed | **0.565** | 0.421 | ≥ incumbent ✅ |
| swallowed | **0.172** | 0.214 | ≤ incumbent ✅ |
| **wrong scope** | 0.169 | 0.113 | ≤ incumbent ❌ |
| escalated | 0.094 | 0.252 | — |

El bloque 4 (composición con escalado a LLM) se menciona pero no se muestran todos los valores en la información proporcionada; la card advierte que una afirmación de 0.500 vs 0.495 quedó dentro del ruido.

## Requisitos de hardware

- El modelo pesa 268 MB en formato safetensors, lo que lo hace adecuado para dispositivos con poca memoria (smartphones, edge devices, CPUs).
- No se proporcionan datos de VRAM específicos, pero al ser un encoder pequeño, puede ejecutarse en GPUs con menos de 1 GB de memoria (p. ej., Jetson Nano, Raspberry Pi con acelerador, o CPUs modernas).
- No se indican frameworks de despliegue concretos; al ser un modelo safetensors de tipo transformer, puede servirse con librerías estándar como Hugging Face Transformers, ONNX Runtime o TensorFlow Lite, aunque la card no lo confirma.
- La latencia y el throughput no están publicados; dado el tamaño, se espera que sea muy rápido en CPU (del orden de milisegundos por inferencia), pero es una estimación no confirmada.

## Comparativa con modelos similares

No hay routers de alcance comparables en la información disponible. La única comparación publicada es contra el baseline LLM mistral:7b, que aparece en el bloque 1 de benchmarks. A diferencia de Horos, mistral:7b es un LLM generativo mucho más grande (4.4 GB) y con peor rendimiento en esta tarea específica (macro-F1 0.495, exact set match 0.243, negatives abstained 0.126). La comparativa es limitada porque no se dispone de otros modelos de la misma categoría (clasificadores de ámbito on-device).

## Limitaciones y advertencias

- La tasa de desajuste (disjoint rate) es 0.206, muy por encima del gate de ≤0.03, lo que indica que el modelo a menudo asigna ámbitos incorrectos cuando hay múltiples etiquetas.
- El recall por ámbito solo alcanza 6 de 14 ámbitos con recall ≥0.60, frente al objetivo de 14/14.
- En datos no vistos (bloque 3), la tasa de "wrong scope" aumentó del 11% al 17% en v2, mientras que el enrutado mejoró; el modelo es mejor reconociendo que hay datos personales, pero no discriminando cuáles.
- La tasa de "swallowed" en frases concretas de artefactos (artifact-concrete) es 0.176, por encima del gate de ≤0.10, lo que significa que algunas consultas que deberían escalarse se responden incorrectamente.
- No está promocionado para producción; la card lo indica explícitamente.
- Horos es un router, no un autorizador: cada ámbito emitido debe comprobarse contra permisos downstream.
- Solo soporta inglés; no hay soporte multilingüe.
- El modelo no está pensado para tareas fuera del enrutamiento de ámbitos de Topos, y no debe ejecutarse sin la ruta de escalado a LLM.
- Los umbrales en `head.json` se seleccionan por artefacto y el conjunto de etiquetas puede cambiar; `main` no es un contrato estable, por lo que se recomienda fijar una revisión específica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dialogues/horos
- Repositorio de Topos: https://github.com/dialoguesai/topos
- Datasets usados: https://huggingface.co/datasets/AmazonScience/massive y https://huggingface.co/datasets/clinc/oos-eval
