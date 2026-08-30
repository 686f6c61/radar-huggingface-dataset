# ajrayman/Immoderation_binary

## Resumen

Immoderation_binary es un modelo de clasificación de texto binarizado (0/1) desarrollado por ajrayman, obtenido mediante fine-tuning de roberta-base sobre un conjunto de datos no especificado. Está diseñado para detectar o clasificar contenido relacionado con la "inmoderación" (immoderation), aunque la model card no detalla la definición exacta de la tarea ni la naturaleza de las clases.

El modelo tiene 124.647.170 parámetros (el mismo tamaño que roberta-base) y se distribuye bajo licencia MIT en formato safetensors. Fue creado en octubre de 2024 y actualizado en agosto de 2026. Su relevancia es limitada: no se han publicado benchmarks externos, el conjunto de datos de entrenamiento no está documentado y los resultados de evaluación interna muestran un rendimiento moderado (accuracy de 0,6164 y F1 de 0,6325). Es uno de una serie de modelos similares del mismo autor (Self-consciousness_binary, Anger_binary, entre otros), aparentemente orientados a tareas de análisis de atributos psicológicos o de comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (Transformer encoder, 12 capas, 12 cabezas de atención, embedding de 768) |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de roberta-base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (roberta-base está entrenado principalmente en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa-base, un transformer encoder de 12 capas con atención de 12 cabezas y dimensiones ocultas de 768. RoBERTa (Robustly optimized BERT approach) elimina la predicción de siguiente frase y entrena con máscaras dinámicas y más datos que BERT, lo que le confiere mejores representaciones contextuales para tareas de clasificación.

El fine-tuning se realizó con el Trainer de HuggingFace sobre un dataset no identificado ("None dataset" según la model card). Los hiperparámetros de entrenamiento incluyen: learning rate de 2e-05, batch size de 32, optimizador Adam (betas 0,9 y 0,999), scheduler lineal con warmup ratio de 0,06 y 8 épocas. La pérdida de validación final fue de 0,6716. No se documenta el uso de técnicas como RLHF, DPO o decodificación especulativa, y no hay innovaciones arquitectónicas respecto al modelo base.

## Capacidades

- Clasificación binaria de texto: el modelo asigna una etiqueta binaria (0 o 1) a secuencias de texto, aparentemente relacionada con la detección de "inmoderación".
- Fine-tuning específico sobre roberta-base: hereda las capacidades de representación lingüística del modelo base.
- Inferencia con la librería transformers: compatible con el pipeline de text-classification.
- Sin capacidades de generación de texto, tool calling, agentes, visión, audio o razonamiento multi-step.

## Casos de uso

- Moderación de contenidos en foros o redes sociales: el modelo puede clasificar comentarios o publicaciones como "moderados" o "inmoderados" para priorizar su revisión humana. Su rendimiento moderado (F1 de 0,63) sugiere que debería usarse como filtro preliminar, no como decisión final.
- Análisis de sentimiento o comportamiento en encuestas: puede etiquetar respuestas abiertas en cuestionarios para identificar patrones de comportamiento inmoderado.
- Investigación en psicología computacional: dado que el autor ha publicado modelos similares para otros atributos (ira, autoconciencia), podría usarse en estudios académicos sobre detección de rasgos en texto.
- Clasificación de comentarios en plataformas de revisión de productos: para señalar reseñas que puedan violar normas de comunidad.
- Filtrado de contenido en entornos educativos: para detectar mensajes inapropiados en plataformas de aprendizaje en línea.
- Evaluación de calidad de texto generado por IA: para identificar salidas que puedan considerarse inmoderadas o fuera de tono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) en la información disponible. El modelo solo reporta métricas de evaluación interna:

| Metrica | Valor |
|---|---|
| Loss | 0,6716 |
| Accuracy | 0,6164 |
| Precision | 0,6064 |
| Recall | 0,6608 |
| F1 | 0,6325 |
| AUC | 0,6733 |

Estos valores corresponden a la época 4 (la mejor registrada). El rendimiento es moderado, con un recall superior a la precisión, lo que indica una tendencia a clasificar positivamente (posiblemente más falsos positivos). No se dispone de comparativas con otros modelos.

## Requisitos de hardware

- Tamaño del modelo: aproximadamente 498 MB en fp32 (124,6M parámetros), por lo que es ligero para los estándares actuales.
- VRAM estimada: menos de 1 GB para inferencia en fp32; con cuantización a int8 podría reducirse a unos 250 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, RTX 4060 o incluso una GPU integrada moderna podría ejecutar inferencia.
- Se puede desplegar en CPU sin problemas para inferencia por lotes pequeños.
- Compatible con vLLM, HuggingFace TGI, Ollama (si se convierte a GGUF) y llama.cpp.
- Latencia esperada: del orden de milisegundos por secuencia en GPU moderna (no se dispone de cifras oficiales).

## Comparativa con modelos similares

No se dispone de suficientes datos públicos para una comparativa rigurosa. El modelo es un fine-tuning de roberta-base, por lo que su comparación natural sería con el propio roberta-base (que no está especializado en esta tarea) o con otros fine-tunings del mismo autor (Self-consciousness_binary, Anger_binary), de los que no se han publicado métricas comparables. No se puede establecer una comparativa con modelos de propósito general (como BERT, DeBERTa, etc.) sin datos de evaluación sobre el mismo conjunto de prueba.

## Limitaciones y advertencias

- Conjunto de datos de entrenamiento no documentado: no se especifica qué datos se usaron, su tamaño, composición ni procedencia. Esto impide evaluar posibles sesgos.
- Rendimiento moderado: con un F1 de 0,63 y un AUC de 0,67, el modelo no es fiable para decisiones críticas sin supervisión humana.
- Sin definición clara de la tarea: la model card no explica qué significa exactamente "immoderation" ni cómo se definieron las clases.
- Idioma no especificado: aunque roberta-base está entrenado principalmente en inglés, no se confirma que el fine-tuning se haya realizado en ese idioma.
- Licencia MIT: permite uso comercial y modificación, pero al no documentarse los datos de entrenamiento, el usuario asume el riesgo de posibles problemas de propiedad intelectual o privacidad.
- Sin soporte para contexto largo: la ventana de 512 tokens es limitada para documentos extensos.
- Sin garantías de rendimiento en producción: no hay benchmarks independientes ni pruebas de robustez ante ataques adversarios o distribución shift.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ajrayman/Immoderation_binary
- Modelo base roberta-base: https://huggingface.co/FacebookAI/roberta-base
- Modelos relacionados del mismo autor: https://huggingface.co/ajrayman/Self-consciousness_binary, https://huggingface.co/ajrayman/Anger_binary

No se han encontrado papers, repositorios de código ni demos asociados a este modelo.
