# Mardiyyah/base_bioformer_2class_label_all_false

## Resumen

`Mardiyyah/base_bioformer_2class_label_all_false` es un modelo de clasificación de tokens (token classification, típicamente usado para reconocimiento de entidades nombradas o NER) obtenido mediante fine-tuning supervisado del checkpoint base `bioformers/bioformer-16l`, un transformer tipo BERT especializado en texto biomédico en inglés. Lo publica el usuario Mardiyyah en Hugging Face con licencia Apache 2.0 y un total de 41.371.013 parámetros, lo que lo sitúa en la franja de los modelos BERT-base.

El modelo resuelve una tarea concreta: etiquetar secuencias con dos clases en formato IOB sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`, presumiblemente un corpus de NER biomédico en inglés con dos tipos de entidad. No es un modelo generativo ni conversacional: es un encoder discriminativo pensado para inferencia de etiquetas token a token.

Su relevancia es limitada y muy específica. Se trata de un artefacto derivado de un `Trainer` de Hugging Face con métricas modestas (F1 micro de 0,6618 en evaluación), sin model card completada, sin benchmarks publicados y con cero descargas. Resulta útil como referencia de fine-tuning sobre Bioformer o como punto de partida para reproducir un pipeline de NER biomédico, no como modelo de producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (Bioformer, base `bioformers/bioformer-16l`) |
| Parametros totales | 41.371.013 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende de la configuracion del modelo base Bioformer) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `bioformers/bioformer-16l`, un encoder transformer derivado de BERT adaptado al dominio biomédico. La cabeza de clasificación es de tipo token classification con dos clases en esquema IOB, entrenada sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`. El autor no documenta la composición del dataset ni el número de tokens de entrenamiento.

Los hiperparámetros de entrenamiento sí están disponibles: learning rate 2e-05, batch total de 32 (batch 16 con 2 pasos de acumulación de gradiente), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup ratio 0,01, 20 épocas, semilla 3407 y precisión mixta nativa (AMP). El entrenamiento se realizó con Transformers 4.48.2, PyTorch 2.4.1+cu121, Datasets 3.0.2 y Tokenizers 0.21.0. No se documenta RLHF, DPO ni ninguna innovación arquitectónica adicional; es un fine-tuning supervisado convencional con `Trainer`.

## Capacidades

- Clasificación de tokens a nivel de token (token classification) con dos etiquetas en formato IOB, orientada a tareas de extracción de entidades en texto biomédico en inglés.
- Reconocimiento de entidades nombradas (NER) sobre dominios biomédicos, heredando el sesgo de dominio del modelo base Bioformer.
- Inferencia por secuencia completa con la pipeline `token-classification` de Transformers.
- No soporta generación de texto, razonamiento, código ni matemáticas: es un encoder discriminativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: únicamente inglés (`en`).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Extracción de entidades biomédicas en pipelines de NLP clínico: el modelo etiqueta token a token secuencias de texto en inglés y puede integrarse como etapa de NER previa a tareas de normalización o indexación, siempre que las entidades coincidan con las dos clases del corpus de entrenamiento.
- Anotación asistida de corpus biomédicos: sirve como preetiquetador para reducir el coste de anotación manual en proyectos de NER con dos tipos de entidad, revisando después las salidas con anotadores humanos.
- Reproducción de experimentos de fine-tuning: al estar entrenado con `Trainer` y publicar hiperparámetros completos, es útil como referencia reproducible para comparar configuraciones sobre el mismo dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`.
- Baseline en investigación sobre Bioformer: permite medir el efecto del fine-tuning sobre `bioformers/bioformer-16l` en una tarea concreta de clasificación de tokens y comparar con variantes del mismo autor.
- Prototipado rápido de extracción de información en textos biomédicos: con 41 millones de parámetros cabe en GPU de consumo y permite iterar localmente sin infraestructura dedicada.
- Filtrado o enriquecimiento de documentos científicos: puede aplicarse por lotes sobre abstracts o textos en inglés para marcar menciones de entidades y alimentar índices de búsqueda, con la cautela de su F1 moderado.

## Benchmarks y rendimiento

El model-index oficial no contiene resultados (`results: []`). Los únicos datos disponibles son las métricas de evaluación declaradas por el autor en la model card sobre el conjunto de evaluación del dataset de entrenamiento:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,0719 |
| Precision | 0,6531 |
| Recall | 0,6707 |
| Micro F1 | 0,6618 |
| Weighted F1 | 0,6620 |
| Macro F1 | 0,6643 |
| Accuracy | 0,9821 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 165 MB solo para pesos (41,37 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB en la mayoría de configuraciones.
- En fp16/bf16: aproximadamente 83 MB de pesos.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 4090, RTX 3090, RTX 3060 o incluso una T4 son sobradas para este tamaño.
- Cabe en GPU de consumo sin problema, e incluso puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline `token-classification` de Transformers, `text-classification` no aplica, servidores de inferencia compatibles con endpoints (`endpoints_compatible` según los tags), y exportación a ONNX si se necesita optimizar latencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamaño (41 M de parámetros) se espera un throughput alto en GPU, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Mardiyyah/base_bioformer_2class_label_all_false` | 41,37 M | no disponible | Token classification (2 clases IOB, biomédico EN) | Apache 2.0 | Hugging Face, 0 descargas |
| `bioformers/bioformer-16l` (modelo base) | no disponible en la informacion proporcionada | no disponible | Encoder biomédico preentrenado | no disponible en la informacion proporcionada | Hugging Face |
| BERT-base (`bert-base-uncased`) | 110 M | 512 tokens | Encoder general EN | Apache 2.0 | Hugging Face |
| BioBERT / PubMedBERT (referencia de dominio) | ~110 M | 512 tokens | Encoder biomédico EN | varía segun checkpoint | Hugging Face |

La comparación con alternativas de la misma categoría (encoders biomédicos para NER) no puede completarse con datos verificados en la informacion proporcionada: no se dispone de métricas del modelo base ni de los competidores en el mismo dataset. Los datos de BERT-base y PubMedBERT se incluyen solo como referencia de tamaño y contexto ampliamente conocidos, no como comparación de rendimiento.

## Limitaciones y advertencias

- El modelo card está generada automáticamente y sin completar: no hay descripción de usos previstos, limitaciones ni composición del dataset de entrenamiento.
- Las métricas de evaluación son modestas (F1 micro 0,6618, precisión 0,6531, recall 0,6707), lo que indica un rendimiento limitado para producción sin validación adicional en el dominio objetivo.
- La accuracy de 0,9821 es engañosa en tareas de NER con desbalance de clases: la mayoría de tokens son etiqueta `O`, por lo que la accuracy alta no refleja buen rendimiento en extracción de entidades.
- El nombre del modelo (`label_all_false`) sugiere una configuración de etiquetado particular que no está documentada; conviene verificar el mapeo de etiquetas antes de usarlo.
- Sesgos conocidos: no documentados por el autor; al derivar de un encoder biomédico en inglés, hereda los sesgos de dominio y de idioma del modelo base.
- Riesgo de alucinación: no aplica en el sentido generativo (es un clasificador), pero sí puede producir etiquetas incorrectas con alta confianza en dominios distintos al de entrenamiento.
- Limitación de idioma: solo inglés; no se ha validado en castellano ni en otros idiomas.
- Limitación de contexto: no documentada; depende de la configuración del modelo base Bioformer y no se especifica en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte, y el modelo base puede tener condiciones adicionales que conviene revisar.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni validación externa del checkpoint.
- Fecha de creación futura (2026-11-16) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/base_bioformer_2class_label_all_false
- Modelo base: https://huggingface.co/bioformers/bioformer-16l
- Dataset de entrenamiento: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
