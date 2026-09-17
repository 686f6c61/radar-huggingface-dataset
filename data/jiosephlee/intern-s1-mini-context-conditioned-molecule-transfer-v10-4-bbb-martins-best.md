# jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-4-bbb-martins-best

## Resumen

Este modelo es un ajuste fino (fine-tune) de `jiosephlee/Intern-S1-mini-lm` orientado a una tarea muy concreta: la transferencia de ensayos (assay transfer) de moléculas condicionada por contexto, en el ámbito de la química computacional. El autor, `jiosephlee`, lo publica como el mejor checkpoint seleccionado por validación dentro de la ejecución V10.4 denominada "BBB Martins mixed-continuous", centrada en el ensayo de permeabilidad de barrera hematoencefálica (BBB) del conjunto de datos de Martins.

El modelo tiene 8.201.221.120 parámetros (8,2 mil millones) según los pesos en safetensors, y se distribuye como un checkpoint completo de Transformers con su tokenizador. Aunque la etiqueta de pipeline es `text-generation` y aparece la etiqueta `conversational`, su uso previsto no es la generación de texto abierta, sino el ranking/recuperación de moléculas candidatas: la métrica de selección del checkpoint es `knn_binary_macro_f1_at_5` sobre validación.

Es relevante ahora porque ilustra un tipo de artefacto cada vez más común en el ecosistema HuggingFace: modelos de química que reutilizan un modelo de lenguaje científico (Intern-S1-mini) como codificador de representaciones para tareas de transferencia de actividad entre ensayos, con evaluación rigurosa de recuperación (Macro-F1@5, NDCG@5, Precision@5 y correlación de Spearman). El repositorio no tiene descargas ni "likes", y la model card no documenta idiomas ni licencia, por lo que debe tratarse como un artefacto de investigación acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (la etiqueta `qwen3` del repositorio apunta a esta familia; no confirmado explicitamente en la model card) |
| Parametros totales | 8.201.221.120 (8,2 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no se han publicado cuantizaciones (solo safetensors en precision completa, presumiblemente BF16/FP16); no hay GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint completo de Transformers con tokenizer) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por la etiqueta `qwen3` del repositorio y por el nombre del modelo base (`Intern-S1-mini-lm`), cabe situarla dentro de la familia de decodificadores Transformer tipo Qwen3, pero esto es una inferencia a partir de metadatos y no un dato confirmado por el autor. No se documentan innovaciones técnicas específicas (atención lineal, decodificación especulativa, arquitecturas híbridas SSM, etc.).

Los detalles de entrenamiento sí están parcialmente documentados. El modelo base es `jiosephlee/Intern-S1-mini-lm`, revisión `fcb667c380ae01f57693a45b4b5c2d331052a107`. El conjunto de datos de entrenamiento es `jiosephlee/context-conditioned-molecule-transfer-v10.4-bbb-martins-mixed-continuous-intern`, revisión `56d5b28757f8e05b4f0a6576939cdb83f0e9a97a`. El calendario de entrenamiento fue de 10 épocas con un tope de 350 pasos, semilla 42 y función de pérdida con objetivos suaves (soft-target loss). El entrenamiento se detuvo tras el paso 207 al estancarse el rendimiento de validación, y el checkpoint finalmente publicado corresponde al paso de optimizador 70, seleccionado por la métrica de validación `knn_binary_macro_f1_at_5`. No se menciona RLHF, DPO ni ninguna fase de alineación.

## Capacidades

- Transferencia de ensayos moleculares condicionada por contexto: la tarea central del modelo; dada una consulta y un contexto, produce representaciones o puntuaciones para emparejar moléculas entre ensayos (en este caso, el ensayo BBB de Martins).
- Recuperación y ranking de candidatos: las métricas reportadas (Macro-F1@5, NDCG@5, Precision@5) indican que el modelo se evalúa como un sistema de ranking top-5, no como un generador libre.
- Generación de texto: el pipeline declarado es `text-generation`, con etiqueta `conversational`, por lo que puede usarse como modelo de lenguaje conversacional, aunque no hay evaluación publicada de esa capacidad.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Capacidades especiales: no se documentan modos de razonamiento explícito (thinking mode), visión ni audio. Las etiquetas indican `text-generation-inference` y `endpoints_compatible`, es decir, compatibilidad con despliegue en TGI y en Inference Endpoints de HuggingFace.

## Casos de uso

- Filtrado temprano en descubrimiento de fármacos para el sistema nervioso central: el modelo permite priorizar moléculas candidatas según su probabilidad de permear la barrera hematoencefálica, usando el ensayo BBB de Martins como referencia; encaja porque ha sido ajustado específicamente sobre ese ensayo y evaluado con métricas de ranking top-5.
- Transferencia de etiquetas entre ensayos de laboratorio heterogéneos: cuando se dispone de un ensayo con muchas medidas y otro con muy pocas, el modelo puede trasladar información contextual entre ambos, reduciendo el número de experimentos necesarios.
- Enriquecimiento de bases de datos internas de compuestos: dado un catálogo de moléculas y un contexto de ensayo, el modelo puntúa y ordena candidatas para revisión manual por parte de químicos medicinales.
- Revisión de literatura y patentes químicas: al ser un modelo conversacional afinado en química, puede usarse para extraer y cotejar relaciones actividad-estructura entre documentos, aunque esta capacidad no está cuantificada en el repositorio.
- Generación de listas cortas para validación experimental: los resultados de Macro-F1@5 y Precision@5 (0,6732 y 0,7217 en test) permiten dimensionar cuántos aciertos esperar en una lista de cinco compuestos antes de pasar al laboratorio.
- Reproducción y auditoría de experimentos de aprendizaje automático en química: el repositorio incluye `metric.json` con el registro completo de selección por validación, lo que facilita replicar el criterio de elección de checkpoint en un pipeline de investigación.
- Integración en endpoints compatibles con TGI: la etiqueta `endpoints_compatible` permite desplegarlo como servicio HTTP para consultas de ranking dentro de una plataforma interna de quimioinformática.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas de recuperación incluidas en la model card:

| Split | Consultas | Macro-F1@5 | NDCG@5 | Precision@5 | Spearman |
|---|---:|---:|---:|---:|---:|
| Validación | 396 | 0,7190 | 0,7590 | 0,7328 | 0,3992 |
| Test | 391 | 0,6732 | 0,7365 | 0,7217 | 0,3414 |

No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 16,4 GB solo para los pesos (coincide con el tamaño del repositorio), más el caché KV, por lo que conviene contar con 20-24 GB para inferencia cómoda con contexto moderado.
- VRAM estimada cuantizado a 8 bits: aproximadamente 8-9 GB para los pesos.
- VRAM estimada cuantizado a 4 bits: aproximadamente 4-5 GB para los pesos (requiere generar la cuantización, ya que no se publica ninguna).
- GPU recomendadas: para BF16, una NVIDIA RTX 4090 (24 GB) o A100 40 GB / H100. Para cuantización de 4-8 bits, tarjetas consumer de 8-12 GB como RTX 3060 12 GB, RTX 4070 o superiores.
- Cabe en GPU consumer: sí, en BF16 en una RTX 4090 o RTX 3090 (24 GB); en cuantización de 4 bits en GPUs de 8 GB.
- Opciones de despliegue: Transformers (librería declarada), TGI y HuggingFace Inference Endpoints (etiqueta `endpoints_compatible`). vLLM, llama.cpp, Ollama y otras alternativas no están confirmadas por el autor; llama.cpp requeriría convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`intern-s1-mini-context-conditioned-molecule-transfer-v10-4-bbb-martins-best`) | 8,2 B | no disponible | Macro-F1@5 en test: 0,6732; NDCG@5: 0,7365 | no disponible | safetensors en HuggingFace, 0 descargas |
| `jiosephlee/Intern-S1-mini-lm` (modelo base) | no disponible (probablemente el mismo orden, 8 B) | no disponible | no disponible (no es un modelo afinado para esta tarea) | no disponible | safetensors en HuggingFace |
| Qwen3-8B u otros modelos de ~8 B de la familia | no disponible en esta busqueda | no disponible | no disponible | no disponible | no verificado |

No se dispone de datos de rendimiento de alternativas en la misma tarea de transferencia de ensayos BBB, por lo que la comparación cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; el autor no documenta análisis de sesgo.
- Riesgo de alucinación: relevante si se usa fuera de su tarea de ranking, ya que la model card no incluye ninguna evaluación de generación abierta ni de fidelidad factual.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar despliegues con entradas largas.
- Limitaciones de idioma: el campo de idiomas no está informado; no hay garantía de comportamiento en castellano ni en otros idiomas distintos del usado en el dataset de ajuste.
- Licencia: no disponible, por lo que no puede confirmarse que el uso comercial esté permitido. Antes de cualquier uso en producción debe verificarse la licencia tanto de este checkpoint como la del modelo base y la del dataset.
- Trazabilidad de los datos: el dataset de ajuste es un artefacto propio del autor; no se detalla su composición, procedencia ni posibles restricciones de redistribución de las moléculas o etiquetas.
- Madurez: 0 descargas y 0 "likes", sin versiones alternativas ni cuantizaciones publicadas; el soporte y el mantenimiento no están garantizados.
- Sobreajuste potencial: la diferencia entre validación (Macro-F1@5 0,7190) y test (0,6732) sugiere una brecha de generalización que conviene tener en cuenta.
- La búsqueda web realizada no devolvió fuentes técnicas relevantes sobre este modelo (los resultados obtenidos eran de un servicio de vídeo sin relación con el tema), por lo que no hay validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiosephlee/intern-s1-mini-context-conditioned-molecule-transfer-v10-4-bbb-martins-best
- Modelo base: https://huggingface.co/jiosephlee/Intern-S1-mini-lm
- Dataset de entrenamiento: https://huggingface.co/datasets/jiosephlee/context-conditioned-molecule-transfer-v10.4-bbb-martins-mixed-continuous-intern
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/upenn-ml/context-conditioned-molecule-transfer-soft/runs/6r7k4sf3
- Evaluación de test en Weights & Biases: https://wandb.ai/upenn-ml/context-conditioned-molecule-transfer-soft/runs/c6gjn1xy
- Paper, blog o repositorio adicionales: no disponible en la información proporcionada.
