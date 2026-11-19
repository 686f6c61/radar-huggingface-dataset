# Mardiyyah/tapt-orig-pubmedbert-2class-wwmask-label_all_false

## Resumen

`tapt-orig-pubmedbert-2class-wwmask-label_all_false` es un modelo de clasificación de tokens (NER) obtenido mediante fine-tuning supervisado sobre el checkpoint base `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-wwmask`, un PubMedBERT adaptado con TAPT (Task-Adaptive Pre-Training) y un tokenizador propio. El autor es el usuario de Hugging Face Mardiyyah y el modelo se enmarca en el ecosistema CeLLaTe, orientado al procesamiento de textos biomédicos en inglés.

El modelo resuelve una tarea concreta: el etiquetado de entidades con un esquema de dos clases en formato IOB, entrenado sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`. Su arquitectura es un transformer encoder tipo BERT con 108.895.493 parámetros totales y pesos en formato safetensors, lo que lo sitúa en la gama de modelos base de ~110M parámetros, adecuado para inferencia en CPU y GPU de consumo.

Es relevante para quien necesite un extractor de entidades biomédicas ligero y desplegable con la librería `transformers` bajo licencia Apache 2.0. No obstante, el modelo está recién publicado (noviembre de 2026), sin descargas ni likes, y la model card está generada automáticamente por el Trainer, con secciones de descripción, usos previstos y datos de entrenamiento sin completar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), fine-tuning para token-classification |
| Parámetros totales | 108.895.493 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint PubMedBERT adaptado con TAPT y un tokenizador específico (`CeLLaTe-tapt-pubmedbert-tokenizer-original-wwmask`), y se afina para clasificación de tokens con dos clases en formato IOB. El entrenamiento se realizó con el `Trainer` de Transformers 4.48.2 sobre PyTorch 2.4.1+cu121, con AdamW (betas 0.9/0.999, epsilon 1e-08), learning rate 2e-05, scheduler lineal con warmup del 1%, batch total de 32 (batch 16 con acumulación de 2), 20 épocas, seed 3407 y precisión mixta nativa AMP. El dataset de evaluación es `OTAR3088/CeLLaTe-ner-2class-iob_final`.

La innovación técnica destacable es el uso de TAPT sobre dominio biomédico y un tokenizador propio, así como el enmascaramiento de palabras (wwmask) indicado en el nombre del checkpoint. La model card no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO (no aplicable en un encoder de clasificación). Tampoco se detalla la longitud máxima de secuencia empleada.

## Capacidades

- Clasificación de tokens (token classification) con esquema IOB de dos clases sobre texto biomédico en inglés.
- Reconocimiento de entidades nombradas (NER) en el dominio CeLLaTe.
- Extracción de entidades a nivel de token, apta para pipelines de anotación automática.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: limitadas al inglés (`en`).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Anotación automática de entidades biomédicas: el modelo etiqueta secuencias de texto clínico o científico token a token con el esquema IOB de dos clases, sirviendo como preanotador para revisión humana en proyectos de curación de datos.
- Preprocesado en pipelines de NLP clínico: integrado como etapa de extracción de entidades antes de tareas posteriores (resolución de entidades, normalización a ontologías, indexación), gracias a su tamaño reducido y coste de inferencia bajo.
- Enriquecimiento de corpus de investigación: procesamiento por lotes de abstracts de PubMed para marcar menciones de entidades y construir índices de búsqueda o datasets etiquetados.
- Prototipado rápido en entornos con recursos limitados: al tener ~109M parámetros y pesos safetensors, puede ejecutarse en CPU o en GPU de consumo para validar hipótesis antes de escalar a modelos mayores.
- Baseline para experimentos de NER biomédico: punto de partida reproducible (seed 3407, hiperparámetros documentados) contra el que comparar fine-tunings propios sobre el mismo dataset CeLLaTe.
- Despliegue en servicios de inferencia ligeros: compatible con `transformers` y con endpoints compatibles (tag `endpoints_compatible`), adecuado para APIs internas de bajo throughput.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluación (última época, época 17, la de mejores métricas reportadas en la cabecera de la model card):

| Métrica | Valor |
|---|---|
| Loss | 0.1037 |
| Precision | 0.7313 |
| Recall | 0.7191 |
| Micro F1 | 0.7251 |
| Weighted F1 | 0.7248 |
| Macro F1 | 0.7333 |
| Accuracy | 0.9844 |

Evolución por épocas (selección):

| Época | Validation loss | Precision | Recall | Micro F1 | Macro F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1 | 0.0591 | 0.5571 | 0.7265 | 0.6306 | 0.6491 | 0.9798 |
| 6 | 0.0683 | 0.7206 | 0.7005 | 0.7104 | 0.7170 | 0.9843 |
| 12 | 0.0956 | 0.7188 | 0.7135 | 0.7162 | 0.7238 | 0.9842 |
| 17 | 0.1036 | 0.7313 | 0.7191 | 0.7251 | 0.7333 | 0.9844 |
| 20 | 0.1083 | 0.7195 | 0.7181 | 0.7188 | 0.7274 | 0.9842 |

No se han publicado resultados comparativos con otros modelos en la información disponible; el `model-index` del autor no incluye resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,45 GB para los pesos (~109M parámetros × 4 bytes), más overhead de activaciones; en fp16 aproximadamente 0,22 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100 o RTX 4090 son sobredimensionadas para este modelo y solo se justifican por volumen de peticiones.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), servidores de inferencia compatibles con Hugging Face Endpoints; vLLM, llama.cpp, Ollama y TGI no están orientados a este tipo de encoder de clasificación y no se documentan como soportados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tapt-orig-pubmedbert-2class-wwmask-label_all_false | 108.895.493 | no disponible | Token classification (NER biomédico, 2 clases IOB) | apache-2.0 | Hugging Face, 0 descargas |
| PubMedBERT (base) | ~110M (no confirmado en la información) | no disponible | Encoder de dominio biomédico, requiere fine-tuning | no disponible | Hugging Face |
| BERT-base | ~110M (no confirmado en la información) | no disponible | Encoder generalista, requiere fine-tuning | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Model card generada automáticamente: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento están sin completar ("More information needed"), lo que impide conocer el alcance real del modelo.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre corpus biomédico en inglés, puede heredar sesgos de representación de ese dominio.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la etiqueta de entidades (Precision 0.7313, Recall 0.7191 en evaluación).
- Limitaciones de contexto e idioma: solo inglés y longitud de contexto no especificada; el uso fuera del dominio biomédico o en otros idiomas no está validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento pueden tener condiciones propias no verificadas en esta información.
- Caveat de producción: con 0 descargas y 0 likes, no hay evidencia de uso en producción ni validación independiente; se recomienda evaluar sobre datos propios antes de desplegar.
- El nombre del checkpoint sugiere una variante con etiqueta "all_false" y enmascaramiento de palabras, pero el autor no documenta el significado exacto de esa configuración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/tapt-orig-pubmedbert-2class-wwmask-label_all_false
- Modelo base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-wwmask
- Dataset de entrenamiento/evaluación: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
