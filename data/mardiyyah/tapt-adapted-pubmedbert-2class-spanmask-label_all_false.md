# Mardiyyah/tapt-adapted-pubmedbert-2class-spanmask-label_all_false

## Resumen

`Mardiyyah/tapt-adapted-pubmedbert-2class-spanmask-label_all_false` es un modelo de clasificación de tokens (token classification, típicamente reconocimiento de entidades nombradas, NER) obtenido mediante fine-tuning de `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-spanmask`, un PubMedBERT adaptado con TAPT (Task-Adaptive Pretraining) y un tokenizador ajustado. Lo desarrolla el usuario Mardiyyah y se publica bajo licencia Apache 2.0 con pesos en formato safetensors.

El modelo resuelve una tarea concreta de etiquetado de secuencias sobre texto biomédico en inglés, con un esquema de dos clases (2class) e IOB, entrenado sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`. Es relevante en el contexto de extracción de información clínica y biomédica, donde los modelos BERT de dominio (PubMedBERT) suelen superar a los modelos de propósito general en vocabulario especializado.

Con 110.409.221 parámetros, es un modelo encoder-only de tamano base, ligero y desplegable en CPU o GPU consumer. Su utilidad práctica está acotada a la tarea y el dominio para los que fue entrenado; no es un modelo generativo ni conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only, tipo PubMedBERT) para token classification |
| Parametros totales | 110.409.221 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (PubMedBERT base suele soportar 512 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion a int8/fp16 posible via herramientas estandar, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-only de la familia BERT, derivado de PubMedBERT y adaptado mediante TAPT (Task-Adaptive Pretraining) con un tokenizador ajustado al dominio biomédico. Sobre esa base se aplica un fine-tuning de clasificación de tokens con dos clases en formato IOB. El repositorio tiene un tamano de 0,4 GB, coherente con un encoder base de ~110M de parámetros.

El entrenamiento se realizó con el Trainer de Transformers 4.48.2 sobre PyTorch 2.4.1+cu121, con learning rate 2e-05, batch total de 32 (batch 16 con acumulación de gradientes de 2), optimizador AdamW, scheduler lineal con warmup del 1 %, 20 épocas, semilla 3407 y AMP nativo. El dataset de fine-tuning es `OTAR3088/CeLLaTe-ner-2class-iob_final`. No se documentan en la información proporcionada el número de tokens de entrenamiento, la composición del corpus ni si hubo RLHF/DPO (no aplicable a un modelo encoder de clasificación).

## Capacidades

- Clasificación de tokens (token classification) sobre texto biomédico en inglés, con esquema IOB de dos clases.
- Reconocimiento de entidades nombradas (NER) en el dominio biomédico/clínico, segun el dataset de entrenamiento.
- Etiquetado a nivel de token con salida por token (no generación de texto).
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo instructivo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (`language: en`).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Extracción de entidades biomédicas en artículos de PubMed: el modelo etiqueta tokens de interés (por ejemplo, entidades del esquema CeLLaTe) en abstracts y textos científicos, aprovechando el vocabulario especializado de PubMedBERT.
- Anonimización y preprocesado de informes clínicos: detección de spans sensibles para su enmascarado antes de almacenar o compartir datos, usando la salida IOB por token.
- Enriquecimiento de bases de datos biomédicas: procesado por lotes de corpus para poblar índices de entidades y facilitar búsqueda semántica o recuperación de información.
- Pipeline de curación de literatura científica: integración como etapa de etiquetado en flujos de revisión sistemática, marcando menciones relevantes para revisión humana.
- Clasificación de spans en datasets de NER biomédico: uso como baseline o componente en experimentos de investigación sobre extracción de información clínica.
- Servicio de inferencia ligero: despliegue en CPU o GPU consumer para etiquetado de baja latencia en aplicaciones internas, dado su tamano de ~110M de parámetros y pesos de 0,4 GB.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (última época, época 15, según la tabla de entrenamiento):

| Metrica | Valor |
|---|---|
| Loss | 0.1040 |
| Precision | 0.7255 |
| Recall | 0.7107 |
| Micro F1 | 0.7180 |
| Weighted F1 | 0.7176 |
| Macro F1 | 0.7240 |
| Accuracy | 0.9843 |

El model-index oficial no contiene resultados adicionales (`results: []`). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un encoder de ~110M de parámetros y pesos de 0,4 GB; en fp16 aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100 o H100 sin problemas.
- Cabe en GPU consumer y también en CPU para inferencia por lotes de tamano moderado.
- Opciones de despliegue: Transformers (pipeline `token-classification`), ONNX Runtime, TorchServe o endpoints compatibles (`endpoints_compatible` en los tags); vLLM y llama.cpp no están orientados a este tipo de encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (tapt-adapted-pubmedbert-2class-spanmask) | 110.409.221 | no disponible | Token classification biomédica (2 clases) | apache-2.0 | Hugging Face |
| PubMedBERT base (microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract) | ~110M | 512 (habitual) | Encoder base, requiere fine-tuning | MIT (habitual) | Hugging Face |
| Modelos BERT base genéricos (bert-base-uncased) | ~110M | 512 | Encoder base, requiere fine-tuning | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de tokens; no genera texto ni mantiene conversaciones.
- Entrenado solo en inglés; su rendimiento en otros idiomas no está garantizado.
- Esquema de etiquetas restringido a dos clases IOB segun el dataset CeLLaTe; no cubre otros esquemas de NER sin reentrenamiento.
- Riesgo de sobreajuste: la loss de validación aumenta a partir de la época 1-2 mientras la de entrenamiento cae hasta 0.0013, lo que sugiere posible sobreajuste y hace recomendable revisar el checkpoint elegido.
- Métricas moderadas (Micro F1 0.7180): precisión y recall en torno al 0.71-0.73 implican errores no despreciables en producción; requiere validación en el dominio objetivo.
- La model card indica "More information needed" en descripción, usos previstos y datos de entrenamiento, por lo que faltan detalles sobre sesgos y composición del corpus.
- Licencia Apache 2.0 permite uso comercial, pero sin garantías del autor; verificar el cumplimiento en despliegues regulados (por ejemplo, ámbito sanitario).
- No se documentan sesgos específicos; al derivar de PubMedBERT, puede heredar sesgos del corpus biomédico de origen.

## Enlaces

- Hugging Face: https://huggingface.co/Mardiyyah/tapt-adapted-pubmedbert-2class-spanmask-label_all_false
- Modelo base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-adapted-spanmask
- Dataset de entrenamiento: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final
