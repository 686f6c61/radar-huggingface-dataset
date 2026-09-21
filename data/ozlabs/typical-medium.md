# OzLabs/typical-medium

## Resumen

`typical-medium` es un modelo de decisión de tipo System-One desarrollado por OzLabs y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo generativo: recibe un estado (un ticket de soporte, un documento, un formulario, una línea de log o cualquier texto), una pregunta con su rúbrica y un conjunto de etiquetas definido en tiempo de ejecución, y devuelve una probabilidad calibrada sobre esas etiquetas junto con una opción explícita de abstención. Todo ello en una sola pasada hacia delante, sin texto generado que haya que parsear.

Se construye sobre el backbone Qwen3-4B-Base (unos 4.000 millones de parámetros), truncado a 26 de 36 capas, con lectura en la capa 26 (tap layer) y tres cabezas tipadas: Choice (categórica), Score (ordinal) y Noul (sí/no, invariante al orden). Trabaja con estados de decisión de 1.024 tokens y, según el autor, consume 57 ms por decisión en una H100 con K=2 opciones, con latencia prácticamente plana hasta unas 64 opciones (58 ms con K=32, 96 ms con K=256).

La relevancia del enfoque está en que la decisión se lee directamente del cómputo condicionado por candidatos, en lugar de muestrear tokens y confiar en la confianza verbalizada. El estado se cachea en KV, de modo que preguntas adicionales sobre el mismo estado son baratas, y la abstención se emite como una probabilidad P(∅) calibrada. Es el escalón intermedio de la familia Typical: +11 puntos en JevBench standard y +11 en MMLU-Pro among-K respecto a `typical-small`, a 1,25x de latencia por decisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3-4B-Base) truncado a 26 de 36 capas, lectura en la capa 26 y cabezas tipadas Choice/Score/Noul |
| Parámetros totales | ~4.000 millones (backbone Qwen3-4B-Base); no disponible el recuento exacto tras el truncado ni el de las cabezas |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | estados de decisión de 1.024 tokens; contexto nativo del backbone no especificado en la información disponible |
| Tipos de cuantización | no disponible (no se documentan variantes GGUF, AWQ ni GPTQ; el paquete de inferencia es PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (librería declarada: pytorch); paquete de inferencia propio descargable con `--include "inference/*"`; formato de fichero concreto no disponible |
| Primitivas de decisión | Choice (categórica), Score (ordinal), Noul (sí/no) |
| Latencia por decisión (H100) | 57 ms con K=2; 58 ms con K=32; 96 ms con K=256 |
| Memoria pico (K=2) | 14,6 GB |
| Checkpoint | `tm1b` (Release 1) |
| Pipeline declarado | text-classification |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer decoder-only, y se trunca a 26 de 36 capas. La decisión no se genera: el estado y los candidatos se codifican una sola vez y la respuesta se lee de ese cómputo condicionado, con el estado almacenado en caché KV para abaratar preguntas sucesivas sobre el mismo estado. Las cabezas son tipadas: Score se entrena como un Choice de K vías con objetivos suavizados de forma ordinal (τ = 0,7, código de cabeza cero), mientras que Noul es una cabeza Bernoulli dedicada que se enruta fila a fila, de modo que solo las filas cuyos candidatos son exactamente {yes, no} la utilizan y cualquier otro conjunto binario se puntúa como Choice ordinario.

La receta de entrenamiento descrita usa una mezcla de datos por lote de E .40 / K .15 / W .35 / U .10 (evidencia, MCQ de conocimiento, workflow condicionado por rúbrica y objetivos blandos de incertidumbre), más un 15–20 % de aumento de nulos en las filas W (`--null_aug W:0.20`) para que el modelo aprenda a abstenerse y no solo a elegir. Son 12.000 pasos con batch efectivo de 64 (bs 64, grad_accum 4) y LoRA de rango 16 sobre las 8 capas superiores del backbone truncado. Los conjuntos citados en la ficha incluyen SNLI, MultiNLI, ANLI, BoolQ, MMLU, AI2 ARC, OpenBookQA, CommonsenseQA, SciQ, QASC, LogiQA2, AQuA-RAT, MedMCQA, cua-s1-forms, systemone-lite-general, jev-4b-distill-data, UNLI y ambient. La ficha no detalla el volumen total de tokens ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de decisiones con probabilidades calibradas sobre un conjunto de etiquetas definido en tiempo de ejecución (Choice).
- Puntuación ordinal (Score) para severidad, prioridad, satisfacción o riesgo, con objetivos suavizados de forma ordinal.
- Verificación binaria sí/no (Noul) invariante al orden de las opciones.
- Abstención como salida de primera clase: cada decisión incluye una P(∅) calibrada, no un rechazo parseado de texto generado.
- Estados de hasta 1.024 tokens, lo que permite incluir políticas, formularios o estados multi-salto dentro de la ventana de decisión.
- Latencia estable frente al número de opciones: entre 57 ms (K=2) y 96 ms (K=256) en H100.
- Reutilización del estado mediante caché KV: varias preguntas sobre el mismo estado solo añaden un sufijo corto.
- API de decisión que replica el `PCDMDecider.decide` interno, incluyendo bloque de tiempo de ejecución (latencia, `p_null`, indicadores de truncado).
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Triaje de tickets de soporte: el propio autor propone el ejemplo de un ticket con errores 500 en el checkout y una petición de reembolso, decidiendo con `m.choice` a qué equipo corresponde (billing, infra, support, security) y con `m.score` la severidad en una escala ordinal. Es adecuado porque la pregunta y las etiquetas se definen en tiempo de ejecución sin reentrenar.
- Cumplimiento de políticas sobre texto libre: con `m.noul` se puede evaluar una condición binaria tipo "¿infringe la política de abuso de reembolsos (3 o más en 30 días)?" y obtener P(yes) junto con P(∅) para derivar a revisión humana cuando la confianza es baja.
- Enrutado de alertas de guardia: la ficha reporta 0,838 sobre el suelo externo de PagerDuty (suelo 0,792), por lo que el modelo puede asignar alertas de incidentes a equipos o clasificar su gravedad antes de notificar.
- Clasificación de formularios y documentos administrativos: entrenado con cua-s1-forms, admite estados de 1.024 tokens, suficientes para incluir el formulario y la rúbrica de decisión en la misma pasada.
- Clasificación de intenciones en asistentes conversacionales: reporta 0,847 en CLINC-150 y 0,769 en HWU64, lo que permite etiquetar la intención de un turno con una única pasada y sin generar respuesta.
- Filtro previo a un LLM generativo: al devolver probabilidades calibradas y abstención, puede resolver los casos claros (por ejemplo, categoría temática con 0,588 en 20NG o clasificación de sentimiento/relación con 0,909 en SNLI) y escalar a un modelo grande solo los casos con P(∅) alta.
- Evaluación de opciones múltiples: con 0,458 en MMLU-Pro among-K puntúa alternativas de respuesta dentro de un conjunto cerrado, útil como reranker de candidatos en pipelines de evaluación.
- Detección de anomalías en logs: al aceptar cualquier texto como estado y preguntas definidas en el momento, se puede usar para marcar líneas de log anómalas o clasificarlas por categoría operativa.

## Benchmarks y rendimiento

Resultados declarados por el autor para `typical-medium` (checkpoint `tm1b`):

| Tarea / conjunto | Métrica | Resultado |
|---|---|---|
| SNLI | exactitud | 0,909 |
| MNLI | exactitud | 0,861 |
| BoolQ | exactitud | 0,843 |
| ANLI | exactitud | 0,544 |
| CLINC-150 | exactitud | 0,847 |
| TREC-fine | exactitud | 0,414 |
| HWU64 | exactitud | 0,769 |
| 20NG | exactitud | 0,588 |
| Workflow retenido: noul / score / style | exactitud | 0,811 / 0,528 / 0,859 |
| Suelo externo: PagerDuty (suelo 0,792) | exactitud | 0,838 |
| JevBench standard / easy / hard | exactitud | 0,806 / 1,000 / 0,423 |
| JevBench standard | Brier (standard / hard) | 0,30 / 0,77 |
| JevBench standard | ECE | 0,09 |
| MMLU-Pro among-K | exactitud | 0,458 |
| Calibración (NLL de decisiones tipadas) | NLL | 1,18 |

Comparación en JevBench standard sobre los mismos 231 ids públicos (comparación ítem por ítem, no una entrada clasificada en un leaderboard):

| Modelo | JevBench standard |
|---|---|
| jeff (GLiFormer 400M) | 0,750 |
| Laya (ModernBERT) | 0,694 |
| **typical-medium** | **0,806** |
| open-alternative-jev (Qwen3.5-4B) | 0,833 |
| system-one-open (Gemma E2B LoRA) | 0,931 |

## Requisitos de hardware

- Memoria pico declarada: 14,6 GB con K=2 en una H100. Para comparar, la familia indica 6,4 GB para `typical-small` y `typical-small-preview` con el mismo K=2.
- Latencia declarada: 57 ms por decisión con K=2 y 58 ms con K=32 en una H100; 96 ms con K=256. De forma derivada, esos 57 ms equivalen a unas 17 decisiones por segundo por flujo secuencial, cifra no declarada por el autor.
- GPU de centro de datos: H100 es la referencia medida. No se publican cifras para A100, L40S u otras.
- GPU de consumo: con 14,6 GB de pico a K=2, el modelo encajaría en tarjetas de 24 GB (RTX 3090, RTX 4090) con margen ajustado; no cabría en tarjetas de 16 GB con ese mismo dato. Es una inferencia a partir de la memoria pico declarada, no una medición confirmada por el autor.
- CPU: el autor verifica que la secuencia de descarga, instalación y ejecución funciona en CPU, comprobada con el paquete de inferencia idéntico de `typical-small` (mismo código sobre un backbone mayor).
- Despliegue: paquete de inferencia propio en `inference/` con `Typical.from_pretrained("OzLabs/typical-medium", device="auto")`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni variantes cuantizadas.
- Coste marginal: el estado se cachea en KV, por lo que preguntas adicionales sobre el mismo estado son un sufijo corto contra una caché ya construida.

## Comparativa con modelos similares

Comparación dentro de la propia familia Typical, que es la referencia directa disponible:

| | typical-small-preview | typical-small | **typical-medium** |
|---|---|---|---|
| Backbone | Qwen3-1.7B-Base | Qwen3-1.7B-Base | Qwen3-4B-Base |
| Capa de lectura (tap layer) | 20 / 28 | 20 / 28 | 26 / 36 |
| Latencia por decisión, K=2 (una H100) | 45 ms | 45 ms | 57 ms |
| Memoria pico, K=2 | 6,4 GB | 6,4 GB | 14,6 GB |
| JevBench standard / easy / hard | 0,750 / 1,00 / 0,387 | 0,694 / 1,00 / 0,432 | 0,806 / 1,00 / 0,423 |
| MMLU-Pro among-K | 0,330 | 0,343 | 0,458 |
| Workflow retenido noul / score | 0,699 / 0,498 | 0,715 / 0,520 | 0,811 / 0,528 |
| Calibración (NLL de decisiones tipadas) | 2,06 | 1,25 | 1,18 |

Alternativas externas citadas por el autor en JevBench standard: jeff (GLiFormer 400M, 0,750), Laya (ModernBERT, 0,694), open-alternative-jev (Qwen3.5-4B, 0,833) y system-one-open (Gemma E2B LoRA, 0,931). No se dispone de parámetros, contexto ni licencia de estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Todos los resultados son autoinformados por el autor; no se han localizado evaluaciones independientes ni entradas en leaderboards.
- La comparación en JevBench se hace sobre 231 ids públicos, ítem por ítem, y el propio autor aclara que no constituye una entrada clasificada en un leaderboard.
- El repositorio figura con 0,0 GB de tamaño, 0 descargas y 0 likes en el momento de la consulta: conviene verificar la disponibilidad real de los pesos antes de planificar una integración.
- Los idiomas soportados no están documentados; no hay garantía de comportamiento multilingüe.
- La ventana de decisión es de 1.024 tokens: documentos o estados más largos requerirán truncado, y la propia API expone indicadores de truncado en el bloque de tiempo de ejecución.
- Rendimiento bajo en dos tareas concretas: TREC-fine (0,414) y ANLI (0,544), lo que desaconseja su uso directo en clasificación fina de intención y en inferencia adversarial sin evaluación previa en dominio.
- No genera texto: no puede utilizarse para tareas generativas, resumen, traducción ni diálogo; solo produce distribuciones sobre etiquetas.
- No se documentan sesgos conocidos, pero tampoco hay evaluación de sesgos en la información disponible.
- La calidad de la abstención depende de calibrar el umbral sobre P(∅) en el dominio de destino; el ECE de 0,09 en JevBench standard ayuda, pero no sustituye a una validación propia.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo deriva de Qwen3-4B-Base y se entrena con múltiples conjuntos de datos cuya licencia particular conviene revisar antes de un despliegue en producción.
- El término "Jev" (etiquetas `jev-like`, JevBench, `jev-4b-distill-data`) es terminología propia del autor y no se explica en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OzLabs/typical-medium
- Modelo hermano `typical-small`: https://huggingface.co/OzLabs/typical-small
- Modelo hermano `typical-small-preview`: https://huggingface.co/OzLabs/typical-small-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- `inference/README.md` y `inference/example.py` dentro del repositorio del modelo (documentación de la API y script ejecutable)
- `REPORT.md` §3af, referenciado en la model card para ablaciones completas y tablas de referencia comparables; no se proporciona URL pública en la información disponible
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a directorios de hospitales en Australia y no guardan relación con `OzLabs/typical-medium`
