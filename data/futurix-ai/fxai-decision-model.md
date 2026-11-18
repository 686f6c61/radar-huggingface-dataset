# Futurix-AI/FxAI-decision-model

## Resumen

FxAI Decision Model es un clasificador de decisiones entrenado sobre la arquitectura Qwen3.8-27B y publicado por Futurix-AI. No es un modelo generativo al uso: dado un estado (texto o imagen), una pregunta y hasta 255 opciones candidatas, devuelve una distribución de probabilidad calibrada sobre esas opciones. Está pensado para tareas de enrutamiento, clasificación de intención, selección de herramientas y puntuación estructurada, no para generación libre de texto.

El checkpoint completo tiene 26.085.330.160 parámetros (26,1B) y el repositorio ocupa 30,5 GB en safetensors. La interfaz de decisión incluida limita el contexto a 8.192 tokens y exige el SDK propietario `futurix_decision/`: `transformers.AutoModel` por sí solo no devuelve las probabilidades de decisión. El modelo está evaluado principalmente en inglés y se distribuye con licencia Apache 2.0.

Su relevancia actual radica en que ofrece una alternativa especializada a los LLM generativos para tareas de decisión acotada, con una puntuación pública de 62,26 en el Decision Index 0.3 y un rendimiento destacado en la categoría de herramientas y automatización (79,68%). El widget de inferencia de Hugging Face está deshabilitado y el entrenamiento y las comprobaciones de benchmark fueron exclusivamente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (backbone multimodal, transformer con capas de atención completa no causal) |
| Parametros totales | 26.085.330.160 (26,1B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens a través de la interfaz de decisión incluida |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (evaluado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone multimodal Qwen3.8-27B con atención completa no causal en las capas de atención completa y pooling sobre el último token. La salida es una distribución de probabilidad calibrada sobre las opciones candidatas (entre 2 y 255 por pregunta), no texto generado. La estrategia de entrenamiento se inspira en Bosun, según indica la model card, y el modelo se presenta como un clasificador de decisiones entrenado sobre esa arquitectura.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Las comprobaciones de entrenamiento y benchmark fueron exclusivamente de texto; la precisión y seguridad con imágenes no se han evaluado de forma independiente. El SDK incluido soporta decisiones tipadas `choice`, `noul` y `score`, aplica el límite de 8.192 tokens sin truncamiento silencioso y admite entradas de imagen con un límite configurable de píxeles (`max_image_pixels`).

## Capacidades

- Clasificación de decisiones tipadas: `choice` (selección entre opciones), `noul` (decisión binaria sí/no) y `score` (puntuación en un rango definido).
- Ranking y distribución de probabilidad calibrada sobre hasta 255 opciones candidatas.
- Enrutamiento e identificación de intención a partir de un estado y una pregunta.
- Selección de herramientas y soporte para automatización (categoría con mejor rendimiento en el Decision Index: 79,68%).
- Procesamiento de entradas de imagen a través del runtime FxAI (aunque sin evaluación independiente de precisión).
- Comprensión del lenguaje y recuperación/clasificación (67,43% y 61,20% respectivamente en el índice público).
- No soporta generación libre de texto ni tool calling generativo: su salida es siempre una distribución sobre opciones predefinidas.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y las opciones de equipo (facturación, soporte, ventas), el modelo devuelve la probabilidad de cada destino; encaja por su categoría de herramientas y automatización (79,68%) y su capacidad de clasificación multiopción.
- Clasificación de intención en asistentes conversacionales: con un estado y una pregunta, se obtiene la intención más probable entre un conjunto acotado, gracias al soporte de 2 a 255 opciones por consulta.
- Selección de herramientas en pipelines de agentes: el modelo puntúa qué herramienta o API debe invocarse a continuación, integrándose en flujos de automatización donde no se requiere generación de texto.
- Puntuación estructurada de calidad: mediante el modo `score`, se evalúa la calidad de una respuesta en un rango definido (por ejemplo, 0 a 5), útil en sistemas de evaluación automática o moderación.
- Decisiones binarias de verificación: el modo `noul` permite responder preguntas de sí/no sobre un estado (por ejemplo, si una factura está pagada), adecuado para validaciones en pipelines de datos.
- Clasificación de documentos o consultas con contexto medio: con hasta 8.192 tokens de contexto, puede procesar conversaciones o documentos de longitud moderada para asignar categorías.
- Enrutamiento multimodal incipiente: el runtime admite imágenes, aunque su precisión en esta modalidad no ha sido evaluada de forma independiente, por lo que su uso en producción con imágenes requiere validación propia.

## Benchmarks y rendimiento

Resultados publicados en el Decision Index 0.3 (índice público de 62,26; 140.178 solicitudes puntuables sobre 43 benchmarks reportados, cero errores):

| Resultado | FxAI-decision-model |
|---|---:|
| Índice público Decision Index | 62,26 |
| Knowledge & Reasoning | 51,50% |
| Language Understanding | 67,43% |
| Retrieval & Classification | 61,20% |
| Tools & Automation | 79,68% |
| Arts & Human Taste | 47,01% |

Comparativa publicada (instantánea del tablero del 20 de octubre de 2026, 14:13 UTC):

| Modelo | Índice público | Knowledge | Language | Retrieval | Tools | Arts |
|---|---:|---:|---:|---:|---:|---:|
| **FxAI Decision Model** | **62,26** | **51,50** | **67,43** | **61,20** | **79,68** | **47,01** |
| Darwin-27B-ZTC | 62,63 | 44,72 | 68,46 | 60,90 | 86,69 | 53,34 |
| Sieve 31B | 62,52 | 49,91 | 65,59 | 69,55 | 78,72 | 43,50 |
| Wald-26B-A4B | 62,30 | 44,71 | 64,25 | 69,05 | 83,28 | 50,86 |
| OneJev1.6-4B | 61,95 | 45,00 | 64,40 | 68,92 | 81,50 | 49,75 |

En un holdout independiente separado, la corrección esperada fue del 52,56% y la entropía cruzada con etiquetas suaves de 1,1454 (menor es mejor). En la ejecución secuencial de 9.192 solicitudes, la latencia mediana / media / p80 fue de 107,5 / 202,5 / 255,5 ms. Los tiempos del run completo son mediciones de throughput en lotes, no una latencia válida de una sola petición.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa aproximadamente 29 GB; se recomienda una GPU de 48 GB para entradas de hasta 8.192 tokens.
- GPU recomendadas: NVIDIA con soporte de bfloat16; 48 GB de VRAM para contexto completo (por ejemplo, RTX PRO 6000, A6000, L40S; A100/H100 de 80 GB con holgura).
- GPU de consumo: no cabe en GPUs de consumo típicas (8-24 GB) sin cuantización, y no se documentan tipos de cuantización disponibles.
- Despliegue: exclusivamente mediante el SDK `futurix_decision/` incluido en el repositorio; `transformers.AutoModel` no devuelve las probabilidades de decisión. La inferencia en CPU es posible pero no práctica para un modelo de 27B.
- Requisitos de entorno: Linux, Python 3.12 y CUDA con bfloat16.
- Latencia: mediana de 107,5 ms, media de 202,5 ms y p80 de 255,5 ms en la ejecución secuencial de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FxAI Decision Model | 26,1B | 8.192 tokens (interfaz de decisión) | 62,26 | Apache 2.0 | Hugging Face (pesos + SDK) |
| Darwin-27B-ZTC | no disponible | no disponible | 62,63 | no disponible | tablero Decision Index |
| Sieve 31B | 31B (según nombre) | no disponible | 62,52 | no disponible | tablero Decision Index |
| Wald-26B-A4B | 26B (A4B, posible MoE) | no disponible | 62,30 | no disponible | tablero Decision Index |
| OneJev1.6-4B | 4B (según nombre) | no disponible | 61,95 | no disponible | tablero Decision Index |

El modelo se sitúa en el rango medio-alto de los cuatro comparables publicados, con ventaja en Knowledge & Reasoning (51,50 frente a 44,71-49,91) pero por debajo en Tools & Automation (79,68 frente a 86,69 de Darwin-27B-ZTC) y en Retrieval & Classification (61,20 frente a 69,55 de Sieve 31B y 69,05 de Wald-26B-A4B).

## Limitaciones y advertencias

- No apto para decisiones autónomas de alto riesgo, control crítico de seguridad, consejo médico o legal, ni uso sin evaluación específica de la aplicación y revisión humana.
- Riesgo de alucinación y calibración imperfecta: aunque devuelve probabilidades calibradas, la corrección esperada en el holdout independiente es del 52,56%, solo ligeramente por encima del azar en escenarios de dos opciones.
- Idiomas: evaluado principalmente en inglés; no se documenta soporte multilingüe.
- Contexto limitado a 8.192 tokens a través de la interfaz de decisión, con rechazo explícito (sin truncamiento silencioso) si se supera.
- Precisión y seguridad con imágenes no evaluadas de forma independiente; el uso multimodal requiere validación propia.
- Dependencia del SDK propietario incluido en el repositorio; no es compatible con el flujo estándar de `transformers` para obtener las probabilidades de decisión.
- El widget de inferencia de Hugging Face está deshabilitado.
- La licencia Apache 2.0 permite uso comercial, pero el autor restringe explícitamente los casos de alto riesgo indicados.
- Las métricas de latencia del run completo son de throughput en lotes y no deben interpretarse como latencia de una sola petición.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Futurix-AI/FxAI-decision-model
- Backbone base: https://huggingface.co/Qwen/Qwen3.8-27B
- Tablero Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Resultados legibles por máquina: `BENCHMARKS.json` dentro del repositorio
- SDK de decisión: directorio `futurix_decision/` dentro del repositorio
