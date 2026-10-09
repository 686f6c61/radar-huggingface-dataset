# davidmelash/wechsel_base_v7large_2026-10-09_r4_s43

## Resumen

wechsel_base_v7large_2026-10-09_r4_s43 es un modelo de clasificación de tokens (token classification / NER) desarrollado por el usuario davidmelash, especializado en la detección de datos personales en sentencias judiciales ucranianas con fines de pseudonimización. Se trata de un ajuste fino (fine-tuning) del modelo benjamin/roberta-base-wechsel-ukrainian, por lo que hereda la arquitectura RoBERTa base (encoder transformer) y un total de 124.061.961 parámetros, con un tamaño de repositorio de 0,5 GB en formato safetensors.

El modelo reconoce cuatro tipos de entidades: ОСОБА (persona), АДРЕСА (dirección), НОМЕР (número) e ІНФОРМАЦІЯ (información). Está entrenado sobre el conjunto de datos sintético v7large, construido a partir de sentencias del Registro Estatal Unificado de Decisiones Judiciales de Ucrania, donde los fragmentos anonimizados se rellenan con valores generados. Las direcciones sintéticas proceden del directorio de Ukrposhta y de OpenStreetMap.

Su relevancia radica en el ámbito del cumplimiento normativo y la privacidad: automatizar la detección de datos personales en documentación judicial permite anonimizar grandes volúmenes de textos legales de forma escalable. No obstante, el modelo presenta un único idioma soportado (ucraniano) y, en el momento de la ficha, cero descargas y cero likes, lo que refleja que es un artefacto reciente y sin validación comunitaria pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa base (encoder transformer) |
| Parametros totales | 124.061.961 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (arquitectura RoBERTa, tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin GGUF publicado) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de benjamin/roberta-base-wechsel-ukrainian, un encoder transformer tipo RoBERTa adaptado al ucraniano, y se ajusta para la tarea de clasificación de tokens, añadiendo una cabeza de clasificación sobre las representaciones del encoder. Con 124.061.961 parámetros, la configuración es consistente con una variante RoBERTa base (aproximadamente 12 capas y 768 dimensiones ocultas).

El entrenamiento se realizó sobre el conjunto sintético v7large, generado a partir de sentencias del Registro Estatal Unificado de Decisiones Judiciales de Ucrania en las que los fragmentos originalmente anonimizados se sustituyen por valores generados. Las direcciones sintéticas provienen del directorio de Ukrposhta y de OpenStreetMap (© colaboradores de OpenStreetMap, ODbL). La model card no especifica el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas de ajuste como RLHF o DPO; estos datos no están disponibles.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en ucraniano sobre textos judiciales.
- Detección de cuatro categorías de entidades: ОСОБА (persona), АДРЕСА (dirección), НОМЕР (número) e ІНФОРМАЦІЯ (información).
- Clasificación a nivel de token orientada a la pseudonimización de datos personales.
- Procesamiento de sentencias del Registro Estatal Unificado de Decisiones Judiciales de Ucrania.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica (es un modelo encoder de clasificación, no generativo).
- Capacidades multilingües: no, únicamente ucraniano.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Pseudonimización de sentencias judiciales: el modelo identifica nombres, direcciones y números en resoluciones del registro ucraniano para sustituirlos por identificadores ficticios antes de su publicación.
- Cumplimiento de protección de datos en juzgados: integrado en un pipeline de preprocesado de documentos legales, permite anonimizar automáticamente expedientes antes de compartirlos con terceros.
- Construcción de corpus de investigación: al eliminar datos personales de forma sistemática, facilita la creación de conjuntos de datos judiciales abiertos para investigación en derecho y lingüística computacional.
- Auditoría interna de privacidad: revisión de textos ya anonimizados para detectar fugas de datos personales que hayan pasado desapercibidas.
- Extracción estructurada de entidades: poblar bases de datos con nombres, direcciones y números extraídos de resoluciones, manteniendo la trazabilidad.
- Indexación y búsqueda documental: enriquecer un motor de búsqueda jurídico con etiquetas de entidades para filtrar por partes, localizaciones o referencias.
- Preetiquetado para anotación humana: generar anotaciones preliminares en pipelines de etiquetado activo, reduciendo el coste manual de revisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall ni F1 para las entidades reconocidas, ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (fp32) en torno a 0,5 GB; en fp16 alrededor de 0,25 GB; en int8 aproximadamente 0,12 GB (estimaciones segun el recuento de 124 M de parametros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede ejecutar en NVIDIA T4, RTX 3060 o superiores, así como en A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna; también es viable su ejecución en CPU para cargas por lotes moderadas.
- Opciones de despliegue: transformers (PyTorch) como opción principal; exportable a ONNX Runtime para inferencia optimizada. No se ha publicado una versión GGUF ni cuantizaciones listas para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wechsel_base_v7large_2026-10-09_r4_s43 | 124.061.961 | no disponible | NER (datos personales, ucraniano) | MIT | HuggingFace |
| benjamin/roberta-base-wechsel-ukrainian | no disponible (base RoBERTa) | no disponible | modelo base (no ajustado a NER de PII) | no disponible | HuggingFace |
| Otras alternativas de NER en ucraniano | no disponible | no disponible | NER general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al entrenarse con datos sintéticos, el modelo puede no reflejar con fidelidad la distribución real de entidades en sentencias auténticas.
- Riesgo de alucinación: al ser un modelo de clasificación y no generativo, no produce texto libre, pero sí puede generar falsos positivos y falsos negativos en la detección de entidades.
- Limitaciones de contexto: arquitectura encoder con ventana limitada (típicamente 512 tokens), por lo que los documentos largos deben fragmentarse.
- Limitaciones de idioma: únicamente ucraniano; no se ha entrenado ni evaluado en otros idiomas.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación, siempre que se conserve el aviso de copyright. Debe verificarse el cumplimiento de las condiciones de la fuente de datos (por ejemplo, la atribución requerida a OpenStreetMap bajo ODbL).
- Caveat para producción: el modelo tiene cero descargas y cero likes en el momento de elaboración de la ficha, carece de métricas publicadas y no ha sido validado de forma independiente; no se recomienda su uso en producción sin una evaluación previa sobre datos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidmelash/wechsel_base_v7large_2026-10-09_r4_s43
- Modelo base: https://huggingface.co/benjamin/roberta-base-wechsel-ukrainian
- Registro Estatal Unificado de Decisiones Judiciales de Ucrania (fuente de datos): no disponible
- Directorio de Ukrposhta (fuente de direcciones): no disponible
- OpenStreetMap (© colaboradores de OpenStreetMap, ODbL): https://www.openstreetmap.org
