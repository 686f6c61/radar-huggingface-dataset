# darugonz/bert-finetuned-ner

## Resumen

`darugonz/bert-finetuned-ner` es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante fine-tuning supervisado de `google-bert/bert-base-cased` sobre un conjunto de datos no especificado por el autor. Se publica como un checkpoint de `transformers` para la tarea de `token-classification`, con pesos en formato safetensors y licencia Apache 2.0. El modelo tiene 107.726.601 parámetros totales, coherente con la arquitectura BERT-base (encoder transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención).

Su relevancia es la de un artefacto de referencia práctico: un modelo pequeño, rápido y desplegable en CPU o en GPUs de consumo, útil para etiquetado de entidades en pipelines de extracción de información. No obstante, la model card está generada automáticamente y no documenta el dataset de entrenamiento, el esquema de etiquetas ni los idiomas soportados, lo que limita seriamente su reproducibilidad y su uso en producción sin una validación previa.

El modelo declara métricas de evaluación notables (F1 de 0,9424 y accuracy de 0,9866), pero al no especificarse el corpus de evaluación ni el conjunto de etiquetas, esos números no son interpretables fuera del contexto del autor. La ficha refleja, por tanto, lo que el autor declara y marca explícitamente como "no disponible" todo aquello que no consta en la información publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion |
| Parametros totales | 107.726.601 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (BERT-base admite hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos safetensors en el repo; no se documentan variantes GGUF, ONNX ni int8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | google-bert/bert-base-cased |
| Tarea | token-classification (NER) |
| Tamano del repo | 1,3 GB |
| Framework de entrenamiento | Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5, Tokenizers 0.23.3 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `bert-base-cased`, un encoder transformer bidireccional con tokenización sensible a mayúsculas (cased), lo que resulta adecuado para NER porque preserva señales ortográficas relevantes para la detección de nombres propios y acrónimos. Sobre el encoder se añade una cabeza de clasificación por token (`BertForTokenClassification`) que proyecta cada representación contextual a la distribución sobre las etiquetas BIO/BILOU del esquema de entidades.

El entrenamiento se realizó durante 3 épocas con un learning rate de 2e-05, batch size de 8 (entrenamiento y evaluación), semilla 42, optimizador AdamW (`ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08) y scheduler lineal. Se completaron 5.268 pasos, lo que implica aproximadamente 1.756 pasos por época y, con batch de 8, alrededor de 14.000 ejemplos de entrenamiento. No se documenta el dataset, la composición del corpus, el esquema de etiquetas, ni si hubo inicialización desde un checkpoint previo de NER. No consta RLHF, DPO ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Etiquetado de secuencias a nivel de token para reconocimiento de entidades nombradas (NER).
- Clasificación de entidades en textos con distinción de mayúsculas y minúsculas gracias al vocabulario cased del modelo base.
- Extracción de información estructurada a partir de texto libre, condicionada al esquema de etiquetas con el que fue entrenado (no documentado).
- Inferencia rápida en CPU y en GPUs de consumo por su reducido tamaño (107,7 M de parámetros).
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de generación de texto libre, código, matemáticas ni visión.
- Capacidades multilingües: no documentadas; el modelo base es mayoritariamente inglés, pero no se confirma el alcance del fine-tuning.

## Casos de uso

- Extracción de entidades en documentos corporativos: el modelo puede etiquetar personas, organizaciones y lugares en contratos, informes o correos, siempre que el esquema de etiquetas coincida con el usado en el fine-tuning (que el autor no documenta).
- Preprocesado de pipelines de NLP: uso como primer paso de un sistema de extracción de información que alimente un motor de búsqueda o una base de datos de entidades.
- Anonimización y seudonimización de datos personales: detección de nombres y entidades sensibles antes de almacenar o compartir textos, con la advertencia de que el recall declarado (0,9502) implica una tasa de fuga no despreciable.
- Enriquecimiento de bases de datos de clientes o CRM: detección automática de nombres de empresas y personas en comunicaciones para poblar campos estructurados.
- Clasificación de documentos en flujos de trabajo internos: etiquetado de menciones de productos, ubicaciones o fechas para enrutamiento automático.
- Prototipado e investigación: punto de partida para comparar arquitecturas BERT en tareas de NER o para hacer fine-tuning adicional sobre dominios específicos.
- Despliegue en entornos con recursos limitados: al ser un modelo de 107,7 M de parámetros, puede ejecutarse en CPU o en GPUs de gama baja para tareas de etiquetado por lotes.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación, sin especificar el corpus ni el esquema de etiquetas. Los datos proceden de la model card y de la tabla de resultados de entrenamiento.

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 |
|---|---|---|---|
| Training loss | 0,0731 | 0,0368 | 0,0220 |
| Validation loss | 0,0609 | 0,0645 | 0,0605 |
| Precision | 0,9168 | 0,9324 | 0,9348 |
| Recall | 0,9406 | 0,9465 | 0,9502 |
| F1 | 0,9286 | 0,9394 | 0,9424 |
| Accuracy | 0,9842 | 0,9853 | 0,9866 |

El `model-index` del modelo no contiene resultados adicionales (`results: []`), por lo que no hay comparación con otros modelos publicada por el autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, CoNLL-2003) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,43 GB solo para pesos (107,7 M × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,22 GB para pesos; el modelo cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; para lotes grandes, una RTX 4090, A100 o H100 ofrecen throughput alto, pero el modelo no las requiere.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más (GTX 1650, RTX 3060, RTX 4090, etc.), y también en CPU.
- Opciones de despliegue: `transformers` con pipeline de `token-classification`, `vLLM` (soporte de modelos de clasificación limitado, verificar), `TGI` (soporte de token-classification limitado), `ONNX Runtime` tras exportación manual, y `llama.cpp`/`Ollama` solo si se convierte a GGUF (no se distribuye en ese formato).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por secuencia corta en GPU y decenas de milisegundos en CPU, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darugonz/bert-finetuned-ner | 107,7 M | No disponible (BERT-base, hasta 512) | NER | Apache 2.0 | Hugging Face, 0 descargas |
| google-bert/bert-base-cased | 108 M | 512 tokens | Modelo base (sin cabeza NER) | Apache 2.0 | Hugging Face, ampliamente usado |
| dslim/bert-base-NER | 108 M | 512 tokens | NER (CoNLL-2003) | MIT | Hugging Face, muy popular |
| Jean-Baptiste/roberta-large-ner-english | 355 M | 512 tokens | NER | MIT | Hugging Face |

La comparación con `dslim/bert-base-NER` es la más directa por arquitectura y tarea, pero no se dispone de métricas comparables en la información proporcionada para este modelo, ya que el autor no especifica el corpus de evaluación. `Jean-Baptiste/roberta-large-ner-english` es una alternativa de mayor tamaño con mejor rendimiento típico en NER inglés, pero con mayor coste de inferencia.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento, el esquema de etiquetas ni el dominio de aplicación; esto impide saber qué entidades detecta realmente.
- Las métricas declaradas (F1 0,9424) no son interpretables sin conocer el corpus y el esquema de etiquetas; no deben compararse con resultados de CoNLL-2003 u otros benchmarks estándar.
- Riesgo de alucinación y de falsos positivos/negativos: el recall de 0,9502 implica que aproximadamente un 5 % de las entidades del conjunto de evaluación no se detectan; en dominios distintos, la tasa puede ser mucho mayor.
- Sesgos conocidos: no documentados; el modelo base BERT puede heredar sesgos de género, raza o nacionalidad de su corpus de preentrenamiento.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base es mayoritariamente inglés, por lo que el uso en castellano no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y del dataset (no documentado).
- Para producción: no hay información sobre robustez, calibración, ni evaluación en dominios fuera de distribución; se recomienda una validación exhaustiva antes de desplegarlo.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/darugonz/bert-finetuned-ner
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
- Documentación de `BertForTokenClassification`: https://huggingface.co/docs/transformers/model_doc/bert
- Pipeline de token-classification: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TokenClassificationPipeline
