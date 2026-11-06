# AnoraLee/vietnamese-hsd-phobert-bt

## Resumen

Vietnamese-hsd-phobert-bt es un modelo de clasificación de texto en vietnamita publicado en Hugging Face por el usuario AnoraLee. Se trata de un fine-tuning de la familia PhoBERT, la variante de RoBERTa preentrenada específicamente para vietnamita, tal como indica el identificador del repositorio y la arquitectura `roberta` declarada en los metadatos. El modelo cuenta con 135.000.579 parámetros totales y se distribuye en formato safetensors, con un tamaño de repositorio de 2,2 GB.

El modelo está orientado a la pipeline `text-classification`, es decir, a tareas de clasificación de secuencias (asignación de una etiqueta a un texto completo o a cada token). El sufijo "hsd" del nombre sugiere un dominio o conjunto de etiquetas concreto, pero la model card no lo documenta: está generada automáticamente y no incluye información sobre el dataset de entrenamiento, las clases objetivo ni el procedimiento de fine-tuning.

La relevancia de este modelo es limitada y muy específica: es un artefacto de investigación de bajo uso (28 descargas, 0 likes en el momento de la consulta) que puede resultar útil como punto de partida para tareas de clasificación en vietnamita, pero que carece de documentación suficiente para un despliegue en producción sin una evaluación previa por parte del usuario. No se dispone de información sobre licencia, idiomas declarados ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (base de PhoBERT, encoder transformer) |
| Parámetros totales | 135.000.579 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la arquitectura PhoBERT base sugiere 256 tokens, pero no está confirmado en la información proporcionada) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización dinámica estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible en los metadatos; el nombre del modelo indica vietnamita |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo RoBERTa, coherente con la familia PhoBERT, que aplica RoBERTa al vietnamita con un tokenizador específico y un preentrenamiento sobre un corpus vietnamita. El modelo tiene 135 millones de parámetros, lo que corresponde al tamaño "base" de la familia (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, aproximadamente). El tag `arxiv:1910.09700` de los metadatos corresponde al artículo de Lacoste et al. sobre el impacto ambiental del aprendizaje automático, citado en la plantilla de la model card, y no a un paper del modelo.

No hay información sobre el dataset de entrenamiento, el número de tokens utilizados en el fine-tuning, las etiquetas de clasificación, la composición del corpus ni si se aplicaron técnicas de regularización o aumentado de datos. La model card está generada automáticamente y todos los campos de detalles de entrenamiento aparecen como "[More Information Needed]". No se documenta ningún RLHF, DPO ni innovación técnica adicional más allá del fine-tuning supervisado estándar sobre un checkpoint PhoBERT.

## Capacidades

- Clasificación de texto: la pipeline declarada es `text-classification`, por lo que el modelo asigna etiquetas a secuencias de texto de entrada.
- Codificación contextual de vietnamita: al derivar de PhoBERT, el modelo incorpora representaciones entrenadas sobre corpus vietnamita, incluida la segmentación de palabras propia de ese idioma.
- Fine-tuning específico: el sufijo "hsd" indica un ajuste sobre un conjunto de etiquetas concreto, no documentado en la model card.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No se ha documentado capacidad multilingüe más allá del vietnamita.
- No se ha documentado capacidad de generación de texto, código, matemáticas, visión ni audio: es un encoder de clasificación, no un modelo generativo.

## Casos de uso

- Clasificación de documentos en vietnamita: el modelo puede emplearse para etiquetar textos cortos o medios en vietnamita en categorías definidas por el usuario, siempre que se valide previamente el conjunto de etiquetas sobre el que fue ajustado.
- Moderación de contenido en foros o comentarios: con una capa de clasificación binaria o multiclase, puede filtrar textos tóxicos o no deseados en vietnamita, aprovechando la tokenización específica de PhoBERT.
- Análisis de sentimiento en reseñas de producto: para opiniones de usuarios en vietnamita, el modelo puede servir como base tras un reentrenamiento de la cabeza de clasificación con el esquema de etiquetas deseado.
- Enrutamiento de tickets de soporte: clasificación de consultas entrantes por temática para dirigirlas al equipo adecuado, con la ventaja de un modelo pequeño (135 M de parámetros) que cabe en CPU.
- Etiquetado de datos para pipelines de NLP: uso como anotador automático en la construcción de datasets vietnamitas, con revisión humana posterior.
- Detección de categorías en titulares de prensa: clasificación de noticias en vietnamita por sección o temática, con inferencia de baja latencia en hardware modesto.
- Experimentación académica: punto de partida para comparativas de fine-tuning sobre PhoBERT en tareas de clasificación en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, conjunto de test ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 (135 M de parámetros × 4 bytes) y alrededor de 0,3 GB en fp16. El tamaño del repositorio (2,2 GB) incluye probablemente checkpoints adicionales del entrenamiento, no solo los pesos finales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para ellas.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Despliegue en CPU: viable; un modelo de 135 M de parámetros ofrece latencias de decenas de milisegundos por secuencia en CPU moderna.
- Opciones de despliegue: `transformers` con pipeline `text-classification`, TorchServe, FastAPI con inferencia directa, ONNX Runtime tras exportación. No se ha documentado compatibilidad con vLLM, TGI o llama.cpp, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnoraLee/vietnamese-hsd-phobert-bt | 135 M | no disponible | Clasificación de texto (vietnamita) | no disponible | Hugging Face, 28 descargas |
| vinai/phobert-base | ~135 M | 256 tokens | Encoder base para vietnamita | MIT (según el repositorio original de PhoBERT) | Hugging Face, ampliamente usado |
| FacebookAI/xlm-roberta-base | ~278 M | 512 tokens | Encoder multilingüe | MIT | Hugging Face, ampliamente usado |
| Google/muril-base-cased | ~237 M | 512 tokens | Encoder multilingüe (incluye vietnamita) | Apache 2.0 | Hugging Face |

La comparativa se basa en características públicas de los modelos alternativos; no se dispone de datos de rendimiento comparativo para el modelo objeto de esta ficha. La ventaja principal de este modelo frente a PhoBERT base es que ya está ajustado para una tarea de clasificación concreta, aunque la falta de documentación impide verificar la calidad de ese ajuste.

## Limitaciones y advertencias

- Model card vacía: todos los campos de documentación están sin rellenar, incluidos los de sesgos, datos de entrenamiento y evaluación. No es posible conocer qué etiquetas predice el modelo ni con qué datos se entrenó.
- Licencia no especificada: la ausencia de licencia impide determinar si el uso comercial está permitido. En la práctica, esto bloquea su adopción en producción sin aclaración previa del autor.
- Idiomas no declarados en los metadatos: aunque el nombre indica vietnamita, no hay confirmación oficial del alcance lingüístico ni del rendimiento en variantes dialectales.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de clasificaciones erróneas sin métricas de calibración publicadas.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no se pueden evaluar sesgos demográficos, regionales o de dominio.
- Contexto limitado: si se confirma la ventana de 256 tokens de PhoBERT, los textos largos requerirán truncamiento o segmentación, con pérdida de información.
- Uso en producción desaconsejado sin validación: la combinación de licencia ausente, documentación inexistente y bajo uso del repositorio hace necesario un proceso de evaluación propio antes de cualquier despliegue.
- Fecha de creación futura en los metadatos (2026-08-24): conviene verificar la integridad del repositorio y la identidad del autor antes de confiar en los artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnoraLee/vietnamese-hsd-phobert-bt
- Artículo citado en los metadatos (Lacoste et al., 2019, sobre impacto ambiental, no sobre el modelo): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la plantilla: https://mlco2.github.io/impact
- Repositorio de referencia de PhoBERT (no enlazado por el autor, pero base arquitectónica del modelo): https://github.com/VinAIResearch/PhoBERT
- No se han encontrado papers, blogs, demos ni repositorios adicionales del autor en la información proporcionada.
