# BH-Language-AI/bh-vision-1-12b

## Resumen

BH-Vision-1-12B es un proyecto de modelo multimodal imagen-texto orientado a tareas de OCR y comprensión de documentos en bosnio (código de idioma `bs`), desarrollado por BH-Language-AI. Se plantea como la variante de mayor tamaño de la familia BH-Vision, construida sobre el modelo base `mistralai/Pixtral-12B-2409` de Mistral AI, un transformer multimodal denso de 12.000 millones de parámetros con ventana de contexto de 128.000 tokens y licencia Apache-2.0. La relevancia del proyecto reside en cubrir un hueco poco atendido: el procesamiento de documentos y OCR en lengua bosnia, un idioma con escasa representación en los grandes modelos multimodales actuales.

Sin embargo, la model card es explícita: el estado del modelo es "NIJE TRENIRAN" (no entrenado) y "težine ne postoje — ovo je projektna kartica", es decir, no existen pesos publicados y la ficha de Hugging Face funciona únicamente como tarjeta de proyecto. No hay checkpoint descargable, no hay resultados de evaluación verificados y el repositorio registra cero descargas y cero likes en el momento de la consulta. Cualquier uso en producción es, por tanto, imposible en la actualidad.

La propuesta técnica prevé un ajuste fino con QLoRA en 4 bits, condicionado a que la variante inferior de 2.2B no rinda de forma suficiente en tareas de gráficos y documentos. La publicación de pesos se anuncia solo tras un entrenamiento aprobado y una evaluación verificada, lo que convierte este modelo en un artefacto de planificación más que en un modelo operativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto) basada en `mistralai/Pixtral-12B-2409`; detalles internos del backbone no disponibles en la información proporcionada |
| Parámetros totales | 12B (heredados del modelo base; no se especifica desglose visión/lenguaje) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128k tokens (según la model card, heredado del base Pixtral-12B-2409) |
| Tipos de cuantización | QLoRA 4-bit previsto para el entrenamiento; cuantizaciones de inferencia (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | Bosnio (`bs`) declarado; capacidades multilingües del modelo base no verificadas en esta ficha |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (los pesos no existen; el modelo base Pixtral usa safetensors) |

## Arquitectura y entrenamiento

La arquitectura declarada es la del modelo base `mistralai/Pixtral-12B-2409`, un transformer multimodal de Mistral AI que procesa imágenes y texto con 12.000 millones de parámetros y 128.000 tokens de contexto. La model card cita un resultado de ChartQA de 81.8 para ese modelo base, dato que corresponde al Pixtral original y no a este proyecto. No se detalla en la información proporcionada la composición exacta del encoder visual ni la estrategia de fusión multimodal.

El entrenamiento previsto consiste en un ajuste fino QLoRA en 4 bits, planteado como opcional ("kad/z ako zatreba", es decir, solo si fuera necesario) y condicionado al rendimiento de la variante de 2.2B en tareas de gráficos y documentos. El hardware objetivo es una A100, con mención de una L4 de 24 GB como opción ajustada. Los datos de entrenamiento previstos se basan en técnicas derivadas de PubLayNet y PlotQA, con evaluación proxy sobre XM3600-hr y postocr-sr y un conjunto held-out denominado `BH-Language-AI/bs-vision-ocr-heldout-v01`, que se declara excluido del entrenamiento. No se especifica número de tokens, composición final del dataset ni si habrá RLHF o DPO.

## Capacidades

- Generación de texto e imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que el modelo está concebido para responder a preguntas sobre imágenes.
- OCR: la etiqueta `ocr` figura entre las capacidades declaradas, orientada a la extracción de texto en documentos en bosnio.
- Comprensión de documentos y gráficos: el plan de entrenamiento referencia PubLayNet (maquetación de documentos) y PlotQA (gráficos), y la model card menciona explícitamente tareas de "chart/doc".
- Capacidades heredadas del base Pixtral-12B: contexto largo de 128k tokens, útil para documentos extensos o múltiples imágenes en una misma conversación.
- Tool calling y function calling: no disponible en la información proporcionada para este modelo; el base Pixtral-12B-2409 soporta function calling según su propia documentación, pero no se verifica aquí.
- Modo thinking, audio u otras modalidades: no disponibles.

## Casos de uso

- Digitalización de documentos administrativos en bosnio: el modelo está diseñado para OCR sobre documentos, de modo que podría extraer texto de formularios, contratos o expedientes escaneados y devolverlo estructurado, aprovechando el contexto de 128k tokens para procesar lotes de páginas en una sola pasada. Requiere pesos publicados, que hoy no existen.
- Extracción de datos de gráficos y tablas: el plan de entrenamiento con PlotQA apunta a interpretar gráficos de barras, líneas y tablas en informes, respondiendo preguntas numéricas sobre ellos. Es el escenario que motiva la existencia de esta variante de 12B frente a la de 2.2B.
- Análisis de maquetación documental: con datos tipo PubLayNet, el modelo se orienta a identificar bloques (títulos, párrafos, figuras) en páginas escaneadas, útil para pipelines de ingestión documental.
- Atención al cliente con imágenes: un asistente que reciba capturas de facturas o justificantes en bosnio y responda consultas sobre ellos, apoyándose en el contexto largo para mantener conversaciones multi-turno con adjuntos.
- Accesibilidad: descripción de imágenes y lectura de documentos para usuarios con discapacidad visual en bosnio, un idioma con poca cobertura en asistentes multimodales comerciales.
- Investigación lingüística en bosnio: creación de corpus anotados a partir de imágenes y evaluación comparativa de modelos multimodales en una lengua de bajos recursos, usando el conjunto held-out declarado como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en la información disponible. La model card solo cita ChartQA 81.8 como dato del modelo base `mistralai/Pixtral-12B-2409`, no de este proyecto, y no existen pesos entrenados sobre los que medir rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con datos verificados, ya que no hay pesos publicados. Como referencia del base Pixtral-12B-2409, un modelo denso de 12B requiere aproximadamente 24 GB en FP16/BF16 y en torno a 8-10 GB en cuantización de 4 bits, pero estas cifras son estimaciones genéricas y no mediciones de este proyecto.
- GPU recomendadas: la model card menciona A100 como objetivo de entrenamiento y L4 de 24 GB como opción ajustada.
- GPU de consumo: no confirmado. Por tamaño del base, una RTX 4090 de 24 GB podría alojar el modelo en cuantización de 4 bits, pero no hay verificación para esta variante.
- Opciones de despliegue: no disponibles para este modelo. El base Pixtral-12B-2409 es compatible con stacks habituales como vLLM o transformers, pero no se ha validado para BH-Vision-1-12B.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-Vision-1-12B | 12B | 128k | bs | Apache-2.0 | Sin pesos publicados |
| mistralai/Pixtral-12B-2409 | 12B | 128k | Multilingüe (no se detalla lista) | Apache-2.0 | Pesos disponibles en Hugging Face |
| BH-Vision (variante 2.2B, misma familia) | 2.2B | No disponible | bs | No disponible en la información | Estado no disponible en la información |

La comparación con alternativas de OCR específicas para bosnio no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no está entrenado y no existen pesos: es una tarjeta de proyecto, por lo que no puede evaluarse ni desplegarse.
- Los resultados de benchmarks citados (ChartQA 81.8) corresponden al modelo base, no a este proyecto, y no deben atribuirse a BH-Vision-1-12B.
- El alcance lingüístico declarado es únicamente bosnio (`bs`); el comportamiento en otros idiomas del base no está verificado.
- Al depender de un ajuste QLoRA previsto sobre datos tipo PubLayNet y PlotQA, el dominio cubierto sería limitado a documentos y gráficos; no se declaran capacidades generales.
- Riesgo de sesgo y alucinación: no evaluado, al no existir modelo entrenado.
- Licencia Apache-2.0 declarada, lo que en principio permitiría uso comercial, pero al no haber pesos publicados la licencia es teórica en la práctica.
- La fecha de creación del repositorio (2026-11-16) y la ausencia de descargas o interacciones sugieren un proyecto en fase inicial; conviene verificar el estado antes de cualquier integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BH-Language-AI/bh-vision-1-12b
- Modelo base: https://huggingface.co/mistralai/Pixtral-12B-2409
- Conjunto held-out declarado: `BH-Language-AI/bs-vision-ocr-heldout-v01` (referenciado en la model card; no se proporciona URL directa)
- Paper, blog o demo del proyecto: no disponibles en la información proporcionada.
