# flowxai/regulated-advice

## Resumen

`flowxai/regulated-advice` es un detector de consejos regulados (financiero, médico y legal) desarrollado por flowxai como parte de su librería `border`, un sistema de guardrails embebible que inspecciona el texto que entra y sale de un modelo de lenguaje grande (LLM) y devuelve una decisión estructurada junto con un registro de evidencia auditable. El modelo no es un clasificador de propósito general: está entrenado específicamente para la política de `border` y se lee en un punto de operación calibrado (umbral 0.72) que se ajusta al objetivo de macro-F1.

Arquitectónicamente se basa en `FacebookAI/xlm-roberta-base` con una cabeza de clasificación multi-etiqueta que produce tres etiquetas: `financial_advice`, `medical_advice` y `legal_advice`. El artefacto publicado es un modelo ONNX en INT8 de 535 MB (opset 17), entrenado con una ventana de 96 tokens. Soporta 26 idiomas, incluyendo lenguas europeas mayoritarias y minoritarias como el maltés o el irlandés. Es relevante ahora porque ofrece una solución ligera, local y reproducible para aplicar guardrails regulatorios en sistemas de IA generativa, sin depender de servicios externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base (encoder transformer) con cabeza de clasificación multi-etiqueta |
| Parametros totales | no disponible (derivado de XLM-RoBERTa base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | INT8 (solo la tabla de embeddings; el resto de operaciones en FP32) |
| Idiomas soportados | az, bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv, tr (26 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.int8.onnx, opset 17) |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un transformer encoder multilingüe preentrenado con máscara de lenguaje sobre 2.5 TB de datos filtrados de CommonCrawl en 100 idiomas. Sobre esta base se añade una cabeza de clasificación multi-etiqueta (sigmoid) con tres salidas: `financial_advice`, `medical_advice` y `legal_advice`. El entrenamiento se realizó específicamente para la política de guardrails de la librería `border`, no como un clasificador genérico. La model card indica que se entrenó a 96 tokens de longitud, y que el umbral de decisión se calibró en la partición de validación contra el objetivo `macro_f1`, obteniendo un valor de 0.72. Este umbral es crítico: a 0.5 por defecto, varios detectores de la familia reportaron F1 0.000 en todos los idiomas porque sus puntuaciones separan positivos y negativos muy por debajo de 0.5; uno de ellos pasó de 0.000 a 0.893 solo con ajustar el umbral.

El artefacto publicado está cuantizado a INT8, pero solo la tabla de embeddings está cuantizada. La model card advierte explícitamente de que cuantizar todas las operaciones (el enfoque habitual) no funciona bien con esta base: medido sobre 300 textos reales, la receta "all ops" produjo un drift medio de logit de 0.68 y cambió 51 de 300 decisiones, mientras que la receta "MatMul only" (856 MB) dio un drift de 0.64 y 48 cambios. La cuantización solo de embeddings (535 MB) es la publicada y la recomendada.

## Capacidades

- Clasificación multi-etiqueta de texto para detectar si una salida de LLM constituye consejo financiero, médico o legal.
- Soporte multilingüe en 26 idiomas, con métricas por idioma publicadas (F1 entre 0.957 y 1.000 según el idioma).
- Integración con la librería `border` para guardrails: devuelve una decisión (`allow`, `flag`, `redact`, `block`) y un registro de evidencia con hashes, sin enviar texto a servicios externos.
- Ejecución local: los pesos se cargan una vez y se cachean; no requiere red después de la descarga inicial.
- Compatible con `onnxruntime` directamente, aunque el umbral y el chunking no están en el grafo y deben gestionarse externamente.
- Presupuesto de latencia conocido: 225 ms a 87 tokens en un solo hilo de CPU.

## Casos de uso

- Guardrails de salida para asistentes de atención al cliente en banca o seguros: el detector puede marcar respuestas que ofrezcan consejo financiero no autorizado, permitiendo que el sistema las revise o bloquee antes de enviarlas al usuario.
- Moderación de contenido en plataformas de telemedicina: detecta si un modelo generativo está dando recomendaciones médicas concretas que deberían derivarse a un profesional colegiado.
- Cumplimiento normativo en chatbots legales: identifica respuestas que constituyan asesoramiento legal, activando flujos de redacción o derivación a un abogado.
- Auditoría de sistemas de IA generativa: el registro de evidencia con hashes permite auditar qué salidas fueron marcadas y por qué, sin almacenar texto sensible.
- Filtrado en pipelines de generación de documentos: se puede integrar en un flujo que redacte informes automáticos y detecte frases que crucen la línea hacia consejo regulado.
- Evaluación de prompts en sistemas multi-idioma: al soportar 26 lenguas, sirve como capa de control en despliegues europeos donde el contenido se genera en varios idiomas.

## Benchmarks y rendimiento

La model card publica métricas por idioma (precisión, recall, F1) sobre la partición de validación, así como la precisión de pares mínimos y el rendimiento a diferentes umbrales. No se proporcionan benchmarks estándar tipo MMLU o HumanEval porque el modelo no es un LLM generativo sino un clasificador de guardrails.

| Metrica | Valor |
|---|---|
| Pair accuracy (ambas mitades de un par mínimo correctas) | 0.797 |
| F1 macro a umbral 0.5 | 0.489 |
| F1 macro a umbral calibrado 0.72 | 0.491 |
| F1 por idioma (rango) | 0.957 (húngaro) - 1.000 (mayoría de idiomas) |

| Idioma | Soporte | P | R | F1 | Nota |
|---|---|---|---|---|---|
| az, bg, cs, da, de, el, en, et, fi, fr, hr, it, lt, lv, nl, pl, ro, sl, sv, tr | 24 | 1.000 | 1.000 | 1.000 | |
| pt | 23 | 1.000 | 1.000 | 1.000 | |
| es | 24 | 1.000 | 0.958 | 0.979 | |
| ga | 24 | 1.000 | 0.958 | 0.979 | |
| sk | 24 | 1.000 | 0.958 | 0.979 | |
| mt | 23 | 1.000 | 0.957 | 0.978 | ausente en el preentrenamiento de XLM-R |
| hu | 24 | 1.000 | 0.917 | 0.957 | |

## Requisitos de hardware

- El modelo es ligero: el artefacto ONNX pesa 535 MB (INT8), por lo que cabe en cualquier máquina con al menos 1 GB de RAM libre.
- Inferencia en CPU: la model card indica un presupuesto de 225 ms a 87 tokens en un solo hilo de CPU, lo que lo hace viable para entornos sin GPU.
- GPU no necesaria; si se usa, cualquier GPU con 2 GB de VRAM es suficiente (el modelo no requiere memoria de pesos grandes).
- Despliegue recomendado: a través de la librería `border` (pip install flowx-border) o directamente con `onnxruntime` si se gestionan manualmente el umbral y el chunking.
- No requiere servicios externos ni red después de la carga inicial de pesos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card menciona que es uno de 28 detectores de la familia `border`, pero no ofrece comparativas con alternativas externas. Se indica "no disponible".

## Limitaciones y advertencias

- No es un clasificador de propósito general: está entrenado para la política específica de `border` y no debe usarse como detector genérico de consejo regulado sin recalibrar.
- El umbral de decisión (0.72) no está incluido en el grafo ONNX; si se usa el modelo sin la librería, hay que aplicarlo manualmente o el rendimiento cae drásticamente (F1 0.489 a 0.5 frente a 0.491 a 0.72).
- La ventana de contexto es de 96 tokens; entradas más largas deben dividirse en fragmentos y recombinarse, o las puntuaciones fuera de esa ventana son extrapolación no validada.
- El maltés (`mt`) no estaba en el preentrenamiento de XLM-R, por lo que su rendimiento (F1 0.978) puede ser menos robusto en producción.
- El húngaro (`hu`) muestra el F1 más bajo (0.957) con recall 0.917, lo que indica más falsos negativos que en otros idiomas.
- La cuantización INT8 solo afecta a la tabla de embeddings; cuantizar todas las operaciones degrada significativamente las decisiones (51/300 cambios en la prueba reportada).
- No se han publicado datos sobre sesgos o alucinaciones específicos de este modelo; al ser un clasificador, el riesgo principal es la clasificación errónea de textos ambiguos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/flowxai/regulated-advice)
- [Repositorio de border](https://github.com/flowx-ai/border)
