# Maicarons/mai-jev-zh-support

## Resumen
mai-jev-zh-support es un modelo de decisión de tipo "System One" orientado a la clasificación y el triaje de tickets de atención al cliente en chino. Lo desarrolla el autor Maicarons y está afinado a partir de `convaiinnovations/laya-multilingual` (un encoder mmBERT-base de 322 M de parámetros con cabezas de decisión choice/score/noul). Su particularidad es que resuelve tres tareas simultáneamente en un único forward pass: enrutado a equipo, puntuación de urgencia y detección de peticiones de reembolso o escalada.

El modelo no genera texto ni razona paso a paso: produce probabilidades calibradas por primitive, lo que lo hace muy barato de ejecutar incluso en CPU. Para cada ticket decide el equipo que debe gestionarlo (售后 / 退款处理 / 技术支持 / 账务 / 投诉升级), la urgencia en una escala de 1 a 5 y si el cliente exige explícitamente un reembolso o una escalada (booleano).

Es relevante ahora porque demuestra que un esquema de decisión calibrada de extremo a extremo, con exportación ONNX int8 y licencia Apache 2.0, puede cubrir triaje operativo de soporte sin depender de un LLM generativo. El repositorio incluye dos artefactos desplegables (checkpoint PyTorch F16 y variante ONNX int8-gather) y datos de calibración propios de cada backend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-base) con cabezas de decisión choice / score / noul; inferencia en un solo forward pass (System One) |
| Parametros totales | 321.908.998 (~322 M) |
| Longitud de contexto | 256 tokens (max_len configurado en el despliegue ONNX de referencia); máximo del encoder base no disponible |
| Tipos de cuantizacion | F16 (checkpoint PyTorch); int8-gather en ONNX (solo la capa Gather de embeddings cuantizada, todos los MatMul se mantienen en fp32) |
| Idiomas soportados | chino (zh), multilingue (validacion principal en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) y ONNX (variante int8) |

## Arquitectura y entrenamiento
El modelo se apoya en el encoder mmBERT-base de Laya Multilingual. Sobre esa representación se añaden tres cabezas de decisión: una cabeza de elección (`route_team`) con cinco equipos posibles, una cabeza de puntuación (`urgency`) en escala 1-5 y una cabeza de tipo noul (`needs_refund_or_escalation`) con salida booleana. La inferencia es un único forward pass que devuelve probabilidades calibradas para las tres primitivas a la vez, sin decodificación autorregresiva ni cadena de pensamiento, lo que reduce el coste computacional de forma drástica.

El ajuste se hizo con RLCD (Reinforcement Learning from Calibrated Decisions) y una calibración de temperatura por primitive y por número de opciones. Los datos de entrenamiento provienen de tres conjuntos: `MoriyaResearchInstitute/MRI-decision-data-100k` (patrones de decisión y formato, licencia MIT), `albertkingdom/custom-service-ticket-zh-tw` (texto natural de tickets en chino, CC BY 4.0) y datos sintéticos generados con el modelo docente `Qwen/Qwen3-1.7B` a partir de plantillas. El conjunto `CodyQin/zh-decision-bench` se reservó exclusivamente para evaluación. Los datasets se re-mapearon al esquema de decisión de Laya (`state` / `questions` / `targets`), se filtraron, deduplicaron y remapearon a las etiquetas finales (cinco equipos, urgencia 1-5, refund-o-escalada). La temperatura se ajusta sobre un split de calibración propio de cada variante y se aplica en inferencia.

## Capacidades
- Clasificación de tickets de soporte en chino con tres salidas simultáneas (equipo, urgencia, reembolso/escalada).
- Probabilidades calibradas por primitive, útiles para umbrales operativos (ECE objetivo ≤ 0,10).
- Decisión en un solo forward pass, apto para despliegue en CPU sin GPU.
- Enrutado a equipos dentro de un espacio cerrado de cinco clases.
- Puntuación de urgencia ordinal (1-5).
- Detección binaria de demandas explícitas de reembolso o escalada.
- Soporte multilingue declarado, con validación principal en chino.
- No incluye tool calling, function calling, agentes, visión ni audio; no es un modelo generativo de texto.

## Casos de uso
- Triaje automático de tickets: en un único forward pass el modelo asigna equipo, urgencia y flag de escalada, lo que permite clasificar grandes volúmenes de tickets con coste mínimo por petición.
- Enrutado a colas de soporte: dado el resultado de `route_team`, un sistema de ticketing puede dirigir el caso directamente al equipo correcto (售后, 退款处理, 技术支持, 账务, 投诉升级).
- Priorización operativa: la salida de `urgency` (1-5) permite ordenar la cola de trabajo de agentes humanos y aplicar SLA diferenciados.
- Detección de riesgo de churn o escalada: el flag `needs_refund_or_escalation` sirve para lanzar alertas tempranas cuando un cliente exige reembolso o pide hablar con un superior.
- Pre-filtrado para LLM generativos: usar mai-jev como primera etapa para clasificar y solo invocar un modelo generativo grande en los tickets que requieran respuesta redactada, reduciendo coste y latencia global del pipeline.
- Despliegue en entornos sin GPU: la variante ONNX int8 corre en máquinas CPU-only con unos 698 MB, útil en centros de soporte con infraestructura limitada o en el edge.
- Analítica y reporting: agregar las salidas por equipo, urgencia y tipo de demanda permite construir cuadros de mando de volumen y tendencias de reclamaciones.
- Filtrado en CRM/helpdesk: integrar el modelo como servicio HTTP previo a la creación del ticket para enriquecerlo automáticamente con metadatos de clasificación.

## Benchmarks y rendimiento
Evaluación sobre un split de test en distribución de tickets chinos que no se usó para entrenamiento ni para el ajuste de temperatura. Macro accuracy es la media de las tres primitivas.

| Modelo | route_team | urgency | noul | macro |
|---|---|---|---|---|
| mai-jev (torch, calibrado) | 0,9475 | 0,9329 | 0,8513 | 0,9106 |
| mai-jev (ONNX int8-gather, calibrado) | 0,9475 | 0,9359 | 0,8484 | 0,9106 |
| `convaiinnovations/laya-multilingual` (base, zero-shot) | 0,4898 | 0,0845 | 0,6414 | 0,4052 |
| Baseline de reglas por palabras clave | 0,4373 | 0,5918 | 0,4111 | — |
| Clase mayoritaria | 0,3586 | 0,7026 | 0,6356 | — |

Calibración (ECE, 15 bins, sobre test reservado): peor primitive con ECE = 0,0871 en la variante torch y 0,0927 en la variante int8 (ambas dentro del objetivo ≤ 0,10). La cuantización int8-gather cuesta como máximo 0,29 puntos de exactitud en cualquier primitive.

## Requisitos de hardware
- Peso del modelo: la variante PyTorch F16 ronda los 0,64 GB de pesos y el repo completo ocupa 1,4 GB; la variante ONNX int8-gather pesa ~698 MB.
- VRAM estimada: por debajo de 1,5 GB en F16 y menos de 1 GB en la variante int8, suficiente para cualquier GPU consumer moderna (RTX 3060 en adelante, e integradas).
- Cabe en GPU consumer: si, con holgura, en cualquier GPU con más de 2 GB de memoria; también en CPU.
- Despliegue en CPU: la variante `onnx/` está pensada para ejecutarse sin torch (`mai_jev.deploy.Predictor`), con Max_len 256 y batch=1.
- Opciones de despliegue: `laya.load` sobre el checkpoint PyTorch, ONNX Runtime sobre la variante int8, y `mai_jev.deploy` como envoltorio de inferencia.
- Latencia y throughput: la model card menciona una medición sobre 150 tickets reales con 4 hilos y batch=1 en max_len 256, pero el dato concreto de latencia queda fuera del fragmento disponible; no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| mai-jev-zh-support | ~322 M | Clasificacion/triaje (choice + score + noul) | 256 tokens (despliegue) | Apache 2.0 | macro 0,9106 | HuggingFace (0 descargas, 0 likes) |
| laya-multilingual (base) | ~322 M | Decision generica (choice/score/noul) | no disponible | Apache 2.0 | macro 0,4052 en este dominio (zero-shot) | HuggingFace |
| Baseline de reglas por palabras clave | no aplica | Triage por heuristicas | no aplica | no aplica | route 0,4373 / urgency 0,5918 / noul 0,4111 | interno |
| Clase mayoritaria | no aplica | Prediccion trivial | no aplica | no aplica | route 0,3586 / urgency 0,7026 / noul 0,6356 | no aplica |

No se dispone de comparativas con modelos de clasificación de tickets de terceros en la información proporcionada.

## Limitaciones y advertencias
- El margen de calibración es fino: el objetivo era minimizar NLL, no ECE, y la propia model card advierte que "ECE ≤ 0,10" no debe tratarse como una cota garantizada bajo cambios de despliegue o de distribución.
- Las temperaturas de calibración son específicas del par (pesos × backend): reutilizar las temperaturas de torch con el grafo ONNX degrada la calibración de forma silenciosa.
- Parte de los datos de entrenamiento son sintéticos, generados con plantillas a partir de Qwen3-1.7B, lo que puede introducir sesgos de estilo y patrones poco representativos de tickets reales.
- El espacio de etiquetas es cerrado (cinco equipos, urgencia 1-5, booleano), por lo que tickets fuera de ese esquema se fuerzan a una clase existente.
- La validación se realiza sobre distribución de tickets chinos; el comportamiento en otros idiomas incluidos en `multilingual` no está cuantificado.
- La ventana de 256 tokens en el despliegue ONNX puede truncar tickets largos; el máximo real del encoder base no se documenta.
- Al ser un modelo discriminativo y no generativo, el riesgo de alucinación de texto no aplica, pero sí existe riesgo de clasificación errónea con impacto operativo (equipo equivocado, urgencia mal estimada).
- Licencia Apache 2.0 permite uso comercial, pero los datasets de terceros imponen sus propias condiciones de atribución (MIT y CC BY 4.0) que deben respetarse.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación externa ni reproducibilidad por parte de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Maicarons/mai-jev-zh-support
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Dataset de entrenamiento: https://huggingface.co/datasets/MoriyaResearchInstitute/MRI-decision-data-100k
- Dataset de entrenamiento: https://huggingface.co/datasets/albertkingdom/custom-service-ticket-zh-tw
- Dataset de evaluacion: https://huggingface.co/datasets/CodyQin/zh-decision-bench
- Modelo docente para sintesis: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia Apache 2.0: https://huggingface.co/Maicarons/mai-jev-zh-support/blob/main/LICENSE
- Avisos de terceros: https://huggingface.co/Maicarons/mai-jev-zh-support/blob/main/THIRD_PARTY_NOTICES.md
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
