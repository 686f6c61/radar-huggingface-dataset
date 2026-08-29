# BonTori/phobert_eda_segmented_results

## Resumen

El modelo `BonTori/phobert_eda_segmented_results` es un ajuste fino (fine-tuning) de `vinai/phobert-base`, la versión base de PhoBERT, un modelo de lenguaje preentrenado monolingüe para vietnamita desarrollado por VinAI Research. Este checkpoint concreto ha sido entrenado para tareas de clasificación de texto (pipeline `text-classification`) y su nombre sugiere el uso de técnicas de aumento de datos EDA (Easy Data Augmentation) y segmentación de texto durante el entrenamiento. El autor, BonTori, ha publicado este modelo como parte de una serie de experimentos (junto a `phobert_eda_results` y `phobert_baseline_results`) para comparar estrategias de fine-tuning sobre PhoBERT.

Con 135 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo. Al estar basado en PhoBERT, hereda su arquitectura de transformer encoder-only (variante de RoBERTa) y su vocabulario específico para vietnamita. La licencia MIT permite uso comercial sin restricciones, lo que lo hace atractivo para integraciones en producción. Sin embargo, la información pública es limitada: no se especifica el conjunto de datos de entrenamiento ni la tarea concreta, aunque las métricas reportadas (accuracy 0.8192, F1 0.6181) indican un rendimiento moderado en la evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (RoBERTa, variante PhoBERT) |
| Parametros totales | 135.000.579 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (PhoBERT-base soporta 512 tokens, pero no se confirma en este checkpoint) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (pero por herencia de PhoBERT, vietnamita) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PhoBERT-base es un modelo basado en la arquitectura RoBERTa, con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. El ajuste fino se realizó sobre un dataset no especificado (aparece como `None` en la model card). El nombre del modelo sugiere que se aplicó EDA (Easy Data Augmentation), que incluye técnicas como reemplazo de sinónimos, inserción aleatoria, intercambio y borrado de palabras, además de una fase de segmentación de texto (probablemente tokenización a nivel de sílabas, común en vietnamita). Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 2e-5, tamaño de lote de 16, 3 épocas y scheduler lineal con optimizador AdamW. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Clasificación de secuencias de texto (pipeline `text-classification`), apta para tareas como análisis de sentimiento, categorización de documentos o detección de intenciones.
- Procesamiento de texto en vietnamita, gracias al tokenizador y vocabulario de PhoBERT (aunque no se confirma explícitamente en la documentación del modelo).
- Inferencia eficiente en CPU y GPU de baja gama debido a su tamaño moderado (135M parámetros).
- No se reportan capacidades de generación de texto, tool calling, agentes o razonamiento multi-paso; es un modelo puramente discriminativo para clasificación.

## Casos de uso

- Analisis de sentimiento en redes sociales vietnamitas: el modelo puede clasificar comentarios o publicaciones como positivos, negativos o neutros. Su tamaño compacto permite desplegarlo en servicios con baja latencia.
- Moderacion de contenido en foros o plataformas de mensajeria: fine-tuning adicional sobre datos etiquetados de spam o toxicidad permitiria filtrar mensajes no deseados.
- Categorizacion automatica de tickets de soporte: clasificar consultas de usuarios en categorias predefinidas (facturacion, tecnico, etc.) para enrutarlas al equipo adecuado.
- Deteccion de noticias falsas o desinformacion: entrenado con ejemplos etiquetados, puede distinguir articulos veraces de falsos en vietnamita.
- Clasificacion de documentos legales o administrativos: organizar expedientes por tipo o prioridad en entornos gubernamentales o corporativos.
- Analisis de opiniones en reseñas de productos: extraer valoraciones de comentarios en plataformas de comercio electronico para generar metricas de satisfaccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible. El modelo reporta las siguientes metricas de evaluacion sobre su conjunto de validacion (declaradas por el autor):

| Metrica | Valor |
|---|---|
| Loss | 0.5795 |
| Accuracy | 0.8192 |
| F1 | 0.6181 |
| Precision | 0.6102 |
| Recall | 0.6411 |

Estos valores corresponden a la ultima epoca de entrenamiento (epoca 3). No hay comparacion con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.5-1 GB en precision FP32 (135M parametros * 4 bytes). Con cuantizacion INT8 podria reducirse a ~135 MB, aunque no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas modernas. Para entrenamiento se recomienda al menos 8 GB (por ejemplo RTX 3070).
- Compatible con hardware de consumo: si, cabe en GPUs de gama baja y tambien en CPU con buena velocidad (inferencia en ~10-50 ms por secuencia corta, dependiendo del hardware).
- Opciones de despliegue: se puede servir con Hugging Face Transformers, ONNX Runtime, TensorRT o mediante frameworks como FastAPI. No se menciona soporte explicito para vLLM, llama.cpp u Ollama (modelos encoder-only no suelen usarse con esos motores).
- Latencia estimada: en una GPU RTX 3090, una inferencia de una secuencia de 128 tokens tardaria menos de 5 ms; en CPU moderna (Intel i7), alrededor de 20-50 ms.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con otros checkpoints de la misma categoria (fine-tunes de PhoBERT). El propio autor ha publicado otros dos modelos (`phobert_eda_results` y `phobert_baseline_results`) que probablemente sean comparables, pero no se han publicado sus metricas. Como referencia, el modelo base `vinai/phobert-base` es el punto de partida, pero no se han reportado resultados de clasificacion en benchmarks publicos para este fine-tuning. Se recomienda consultar los repositorios del autor para obtener una comparativa directa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado sobre datos no especificados, puede heredar sesgos presentes en el corpus de PhoBERT (textos web vietnamitas) y en el dataset de fine-tuning.
- Riesgo de alucinacion: al ser un modelo discriminativo, no genera texto libre, por lo que el riesgo de alucinacion es bajo, pero puede producir clasificaciones erroneas en entradas fuera de distribucion.
- Limitaciones de contexto: la longitud maxima de secuencia esta limitada por PhoBERT (512 tokens); no se ha ampliado en este checkpoint.
- Limitaciones de idioma: aunque PhoBERT esta disenado para vietnamita, no se confirma que este modelo funcione correctamente con otros idiomas; probablemente degrade significativamente.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero se debe citar a VinAI Research si se utiliza PhoBERT como base (requisito de su licencia original).
- Caveat para produccion: las metricas reportadas (F1 de 0.6181) son moderadas y podrian no ser suficientes para aplicaciones criticas sin un ajuste adicional. Ademas, al no especificarse la tarea ni el dataset, es dificil evaluar su generalizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BonTori/phobert_eda_segmented_results
- Modelo relacionado (baseline): https://huggingface.co/BonTori/phobert_baseline_results
- Modelo relacionado (EDA sin segmentar): https://huggingface.co/BonTori/phobert_eda_results
- Repositorio oficial de PhoBERT (VinAIResearch): https://github.com/VinAIResearch/PhoBERT
