# Samira-Hassan/bert-ner-production-model

## Resumen

`bert-ner-production-model` es un modelo de reconocimiento de entidades nombradas (NER) en inglés, publicado por Samira Hassan en Hugging Face. Se trata de un ajuste fino de `bert-base-cased` sobre el dataset CoNLL-2003 para la tarea de token classification, orientado a la detección de cuatro categorías estándar: personas (`PER`), organizaciones (`ORG`), localizaciones (`LOC`) y entidades misceláneas (`MISC`).

El modelo cuenta con 107.726.601 parámetros en formato safetensors y un tamaño de repositorio de 0,4 GB, lo que lo sitúa en la categoría de modelos BERT base (encoder de 12 capas, 768 dimensiones ocultas). Su contexto máximo es de 512 tokens, herencia directa de la arquitectura BERT original. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual es la de un componente especializado y ligero para pipelines de extracción de información en producción: bajo coste de inferencia, amplia compatibilidad con el ecosistema `transformers` y un F1 de entidad de 0,9016 declarado por el autor sobre el split de test de CoNLL-2003. No obstante, el modelo tiene un alcance limitado (solo inglés, solo cuatro tipos de entidad) y un historial de uso muy reducido (21 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, `BertForTokenClassification`) |
| Parametros totales | 107.726.601 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT base) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; compatible con cuantización dinámica vía `bitsandbytes`/ONNX por ser un transformer estándar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un `BertForTokenClassification`: un encoder BERT base (`bert-base-cased`, 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) al que se le añade una cabeza lineal de clasificación token a token sobre las etiquetas BIO del esquema CoNLL-2003 (`PER`, `ORG`, `LOC`, `MISC`). El ajuste fino se realiza sobre el dataset CoNLL-2003, un corpus clásico de NER en inglés procedente de artículos de Reuters, con particiones train/dev/test estándar.

La model card no especifica hiperparámetros de entrenamiento (learning rate, batch size, número de épocas, warmup), ni si se aplicaron técnicas adicionales como weight decay, early stopping o data augmentation. Tampoco se documenta el uso de RLHF/DPO (no aplica a un modelo encoder de clasificación) ni innovaciones arquitectónicas más allá del ajuste fino supervisado estándar. El modelo base `bert-base-cased` es sensible a mayúsculas, lo que es relevante para NER en inglés porque preserva señales de capitalización útiles para distinguir entidades.

## Capacidades

- Reconocimiento de entidades nombradas en inglés con cuatro tipos: `PER` (personas), `ORG` (organizaciones), `LOC` (localizaciones) y `MISC` (misceláneas).
- Clasificación token a token con etiquetas en formato BIO, agregable a entidades completas mediante `aggregation_strategy="simple"` en el pipeline de `transformers`.
- Inferencia directa con la pipeline `ner` de Hugging Face, sin necesidad de código personalizado.
- Compatible con el ecosistema `transformers` y con `endpoints_compatible` (según los tags del repo), lo que facilita su despliegue en Inference Endpoints.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un modelo discriminativo de clasificación, no generativo.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Extracción de entidades en pipelines de procesamiento de documentos: el modelo identifica personas, organizaciones y localizaciones en texto en inglés (por ejemplo, artículos de prensa o informes), lo que permite poblar bases de datos estructuradas o índices de búsqueda con metadatos.
- Anonimización y seudonimización de datos personales: al detectar `PER` y `ORG` en textos, se puede enmascarar información sensible antes de almacenar o compartir documentos, útil en cumplimiento de privacidad.
- Enriquecimiento de motores de búsqueda internos: indexar documentos con etiquetas de entidad para permitir filtros por organización o localización, aprovechando la baja latencia de un BERT base.
- Preprocesado para sistemas de RAG (retrieval-augmented generation): extraer entidades de los chunks antes de la indexación vectorial para mejorar la recuperación y el filtrado por metadatos.
- Moderación y análisis de contenido: detectar menciones a organizaciones o personas en flujos de texto para clasificar o priorizar revisiones.
- Construcción de grafos de conocimiento: alimentar un grafo con relaciones entidad-texto a partir de corpus en inglés, usando el modelo como extractor base en un pipeline ETL.
- Clasificación de correos o tickets de soporte: identificar la organización o localización mencionada para enrutar automáticamente la solicitud al equipo adecuado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| CoNLL-2003 (test) | Named Entity Recognition | Entity F1 | 0,9016 |

No se han publicado en la informacion disponible resultados de precision, recall, latencia ni throughput, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,43 GB solo para pesos (107,7 M de parámetros × 4 bytes), más activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- VRAM estimada en FP16/BF16: alrededor de 0,22 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- Cabe en GPU consumer: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.), e incluso en CPU para cargas moderadas.
- GPU recomendadas: no requiere GPU de datacenter; para alto throughput se puede usar A100, H100 o L4, pero el modelo no las necesita. Una T4 o una RTX 4090 ofrecen latencias muy bajas.
- Opciones de despliegue: `transformers` (pipeline `ner`), Hugging Face Inference Endpoints (tag `endpoints_compatible`), ONNX Runtime, TorchScript, y servidores de inferencia estándar como TGI o vLLM (aunque estos están optimizados para modelos generativos; para clasificación token a token, `transformers` o ONNX suelen ser más directos).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño (BERT base) se espera latencia de milisegundos por secuencia corta en GPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 CoNLL-2003 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Samira-Hassan/bert-ner-production-model` | 107,7 M | 512 | 0,9016 (declarado, no verificado) | Apache 2.0 | Hugging Face |
| `dslim/bert-base-NER` | ~108 M | 512 | no disponible en la informacion | MIT (según su repo) | Hugging Face |
| `dbmdz/bert-large-cased-finetuned-conll03-english` | ~335 M | 512 | no disponible en la informacion | MIT (según su repo) | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible. La comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo inglés: no se declaran capacidades multilingües; su uso en otros idiomas producirá resultados poco fiables.
- Cobertura de entidades limitada a cuatro tipos (`PER`, `ORG`, `LOC`, `MISC`); no detecta fechas, cantidades, productos, eventos ni otras categorías habituales en NER de producción.
- Contexto máximo de 512 tokens: los documentos largos deben dividirse en fragmentos, con el riesgo de perder entidades en los límites.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos en la clasificación; el F1 de 0,9016 es una media agregada y el rendimiento por tipo de entidad puede variar.
- El resultado de F1 está declarado por el autor y marcado como no verificado (`verified: false`); conviene validarlo en el dominio de destino antes de usarlo en producción.
- Sesgos: al entrenarse sobre CoNLL-2003 (artículos de Reuters), el modelo puede reflejar los sesgos de distribución de ese corpus (dominio periodístico, entidades occidentales, etc.) y rendir peor en otros dominios (texto médico, legal, redes sociales).
- Historial de uso mínimo (21 descargas, 0 likes en el momento de la consulta) y sin documentación de hiperparámetros de entrenamiento; la trazabilidad del ajuste fino es limitada.
- Licencia Apache 2.0: permite uso comercial y modificación, pero requiere conservar el aviso de licencia y no ofrece garantías.
- Para producción, conviene evaluar el modelo en un conjunto de validación propio y considerar alternativas con mayor adopción y documentación si se requiere soporte o mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Samira-Hassan/bert-ner-production-model
- Dataset CoNLL-2003 en Hugging Face: https://huggingface.co/datasets/conll2003
- Modelo base `bert-base-cased`: https://huggingface.co/bert-base-cased
- Documentación de la pipeline `ner` de transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.TokenClassificationPipeline
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Paper de CoNLL-2003 (Tjong Kim Sang y De Meulder, 2003): https://www.aclweb.org/anthology/W03-0419/
