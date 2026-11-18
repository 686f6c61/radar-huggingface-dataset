# lastnamenewkan/wangchanberta-autoengage-category-v3

## Resumen

WangchanBERTa-autoengage-category-v3 es un modelo de clasificación de texto en tailandés desarrollado por el usuario lastnamenewkan, obtenido mediante fine-tuning de WangchanBERTa (el modelo BERT preentrenado específicamente para tailandés por el VISTEC AI Research Institute). El modelo resuelve una tarea concreta: clasificar comentarios de restaurantes en ocho categorías, orientado a un sistema de "autoengage" (respuesta automatizada o enrutado de comentarios). La versión v3 incorpora un esquema de etiquetado débil sobre segmentos de Wongnai combinado con 511 comentarios humanos de Wisesight replicados tres veces.

El modelo se distribuye en formato ONNX fp32 para su uso con onnxruntime, con un tamaño de repositorio de 0,4 GB. Sobre un conjunto de referencia de 209 comentarios reales alcanza una precisión de 0,670 y un macro-F1 de 0,603 con semilla 42, con una media de precisión de 0,664 ± 0,007 en tres semillas. Es relevante para equipos que necesiten un clasificador ligero, desplegable en producción y especializado en el dominio de restauración tailandesa, aunque su alcance es muy acotado y la documentación publicada es mínima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (WangchanBERTa, base de BERT) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de WangchanBERTa; no confirmada en la model card) |
| Tipos de cuantización | ONNX fp32 (único formato publicado) |
| Idiomas soportados | tailandés (implícito por el corpus de entrenamiento; no declarado explícitamente) |
| Licencia | no disponible |
| Formato de pesos | ONNX (fp32) |

## Arquitectura y entrenamiento

El modelo parte de WangchanBERTa, un encoder transformer basado en la arquitectura BERT y preentrenado sobre corpus tailandeses. Sobre esa base se aplica un fine-tuning de clasificación con cabeza de ocho clases. El entrenamiento combina dos fuentes: segmentos de Wongnai etiquetados de forma débil (weak labeling, presumiblemente mediante reglas o heurísticas) y 511 comentarios de Wisesight con etiquetado humano, replicados tres veces (x3) para reforzar la señal supervisada frente al ruido del etiquetado débil.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros, ni si se aplicaron técnicas de regularización o aumento de datos más allá de la replicación x3. La innovación principal es operativa: el uso combinado de etiquetado débil a escala con un pequeño conjunto gold para ajustar el clasificador, más la exportación a ONNX fp32 para inferencia con onnxruntime.

## Capacidades

- Clasificación de texto en tailandés en ocho categorías predefinidas de comentarios de restaurantes.
- Etiquetado de comentarios individuales (clasificación de secuencia única), no generación de texto.
- Inferencia mediante onnxruntime en formato ONNX fp32.
- Entrenado sobre datos de dominio de restauración (Wongnai, Wisesight), por lo que su vocabulario y distribución se ajustan a ese contexto.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo "thinking", visión ni audio.
- Capacidad multilingüe no declarada; el modelo está orientado al tailandés.

## Casos de uso

- Enrutado automático de comentarios de restaurantes: clasificar cada reseña entrante en una de las ocho categorías para dirigirla al equipo adecuado (atención al cliente, cocina, marketing), aprovechando el ajuste al dominio Wongnai/Wisesight.
- Moderación y priorización de reseñas: detectar comentarios que requieran respuesta urgente según su categoría y ordenar la cola de atención.
- Analítica de reputación: agregar volúmenes de comentarios por categoría para medir la percepción de un restaurante a lo largo del tiempo.
- Automatización de respuestas ("autoengage"): usar la categoría predicha como señal para seleccionar plantillas de respuesta o flujos de contestación predefinidos.
- Despliegue en producción ligero: al estar en ONNX fp32, puede servirse con onnxruntime en CPU o GPU sin dependencias de frameworks pesados, integrándose en pipelines de CI/CD o servicios de inferencia.
- Filtrado previo en pipelines de NLP: clasificar grandes volúmenes de comentarios tailandeses antes de pasarlos a modelos generativos más costosos, reduciendo el coste computacional.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión (gold, 209 comentarios, seed 42) | 0,670 |
| Macro-F1 (gold, 209 comentarios, seed 42) | 0,603 |
| Precisión media (3 semillas) | 0,664 ± 0,007 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,4 GB en fp32, por lo que la huella en memoria es del orden de cientos de MB más el overhead de onnxruntime.
- GPU recomendadas: no disponibles; al ser un encoder BERT de tamaño moderado, es probable que funcione en GPUs consumer, pero no se confirma en la documentación.
- Cabe en GPU consumer: probablemente sí (formato ONNX fp32 y 0,4 GB de repo), sin confirmación oficial.
- Opciones de despliegue: onnxruntime (formato publicado); no se documentan otras alternativas como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WangchanBERTa-autoengage-category-v3 | Clasificador BERT tailandés (8 clases) | no disponible | no disponible | ONNX fp32 | Especializado en comentarios de restaurantes |
| WangchanBERTa base | Encoder BERT tailandés preentrenado | no disponible | no disponible | safetensors/PyTorch | Requiere fine-tuning para tareas concretas |
| Otros clasificadores tailandeses | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos |

No se dispone de información suficiente para una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Ámbito muy restringido: solo clasifica comentarios de restaurantes en tailandés en ocho categorías; fuera de ese dominio su rendimiento no está garantizado.
- Rendimiento moderado: precisión de 0,670 y macro-F1 de 0,603 sobre 209 comentarios gold, con varianza entre semillas (±0,007), lo que indica margen de mejora.
- Riesgo de sesgo por etiquetado débil: buena parte del entrenamiento procede de etiquetas heurísticas de Wongnai, que pueden introducir ruido y sesgos de dominio.
- Conjunto de evaluación pequeño (209 comentarios), por lo que las métricas tienen alta incertidumbre estadística.
- Licencia no declarada: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas no declarados formalmente; el modelo no está pensado para otros idiomas distintos del tailandés.
- Documentación mínima: sin pipeline declarado, sin idiomas ni licencia en la ficha de Hugging Face, lo que dificulta su adopción en producción sin validación adicional.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de clasificaciones erróneas en comentarios ambiguos o mixtos.

## Enlaces

- Hugging Face: https://huggingface.co/lastnamenewkan/wangchanberta-autoengage-category-v3
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
