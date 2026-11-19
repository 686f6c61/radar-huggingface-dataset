# Mardiyyah/tapt-orig-pubmedbert-2class-spanmask-label_all_false

## Resumen

`tapt-orig-pubmedbert-2class-spanmask-label_all_false` es un modelo de clasificación de tokens (token classification) desarrollado por el usuario Mardiyyah, consistente en un ajuste fino de PubMedBERT mediante la técnica TAPT (Task-Adaptive Pretraining) sobre el corpus biomédico. El modelo resuelve una tarea de reconocimiento de entidades nombradas (NER) binaria en el dominio biomédico, empleando un esquema de etiquetado IOB de dos clases. Se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors y es compatible con la librería transformers y con endpoints de Hugging Face.

La relevancia de este modelo radica en su especialización: parte de un backbone BERT de dominio biomédico (PubMedBERT) y aplica un ajuste fino sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final`, lo que lo hace adecuado para tareas de extracción de entidades en textos científicos y clínicos en inglés. Con 108.895.493 parámetros y un tamaño de repositorio de 0,4 GB, es un modelo compacto que puede desplegarse en hardware modesto.

No obstante, conviene señalar que la model card está generada automáticamente por el Trainer de Hugging Face y carece de secciones descriptivas completas (descripción del modelo, usos previstos, limitaciones y datos de entrenamiento aparecen como "More information needed"). El nombre del modelo sugiere una variante con span masking y una configuración de etiquetas particular ("label_all_false"), pero el autor no documenta estos detalles. El modelo no registra descargas ni likes en el momento de la consulta, lo que indica que es un artefacto de investigación reciente y poco validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), ajustado desde PubMedBERT vía TAPT |
| Parámetros totales | 108.895.493 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT, típicamente 512 tokens; no confirmado por el autor) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer tipo encoder BERT, heredada de PubMedBERT a través del checkpoint intermedio `Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-spanmask`. El ajuste fino se realizó sobre el dataset `OTAR3088/CeLLaTe-ner-2class-iob_final` para una tarea de clasificación de tokens con esquema IOB de dos clases. El autor no proporciona detalles sobre el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a NER).

Los hiperparámetros de entrenamiento sí están documentados: learning rate de 2e-05, batch size total de 32 (16 × 2 pasos de acumulación), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con warmup del 1 %, 20 épocas, seed 3407 y precisión mixta nativa (AMP). El entrenamiento se ejecutó con Transformers 4.48.2, PyTorch 2.4.1+cu121, Datasets 3.0.2 y Tokenizers 0.21.0. La pérdida de entrenamiento desciende de 0,2404 en la época 1 a 0,0015 en la época 18, mientras que la pérdida de validación toca mínimo en la época 2 (0,0535) y repunta posteriormente hasta 0,1046, lo que sugiere cierto sobreajuste a partir de la época 3-4.

El nombre del checkpoint indica el uso de span masking en el preentrenamiento adaptativo (TAPT) y una configuración de etiquetas denominada "label_all_false", presumiblemente relacionada con el tratamiento de subpalabras o tokens especiales en el etiquetado; el autor no documenta este extremo.

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas (NER) en textos biomédicos en inglés, con esquema IOB de dos clases.
- Extracción de entidades en publicaciones científicas y textos clínicos, gracias al backbone PubMedBERT.
- Procesamiento de secuencias de entrada compatibles con la arquitectura BERT (longitud máxima no confirmada por el autor).
- No soporta generación de texto: es un modelo exclusivamente discriminativo de token classification.
- No dispone de soporte documentado de tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni de modo "thinking".
- Capacidad multilingüe limitada al inglés (idioma declarado: en).

## Casos de uso

- Extracción de entidades biomédicas en literatura científica: el modelo puede etiquetar tokens correspondientes a entidades de interés en abstracts y artículos de PubMed, aprovechando el preentrenamiento de dominio de PubMedBERT para vocabulario especializado.
- Anotación asistida de corpus clínicos: integrado en pipelines de anotación semiautomática, permite preetiquetar textos para revisión humana, reduciendo el coste de construir datasets NER biomédicos.
- Normalización de términos en bases de datos farmacológicas: el etiquetado IOB permite identificar menciones de fármacos o entidades para su posterior mapeo a ontologías como MeSH o UMLS.
- Procesamiento por lotes de informes clínicos en inglés: con 108,9 M de parámetros, el modelo es lo bastante pequeño para ejecutarse sobre CPU o GPU de gama baja en pipelines de alto volumen.
- Filtrado y enriquecimiento de registros electrónicos de salud: extracción de entidades para indexación y búsqueda semántica en repositorios documentales.
- Componente base para experimentos de investigación en NER biomédico: sirve como punto de partida para comparativas de arquitecturas o para ajustes finos adicionales sobre dominios específicos.
- Servicio de inferencia ligero vía endpoints de Hugging Face: al ser compatible con `endpoints_compatible`, puede desplegarse como API de clasificación de tokens sin infraestructura propia.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados (`results: []`). Sin embargo, la model card documenta las métricas de evaluación del conjunto de validación en la época 13 (la de mejor Micro F1):

| Métrica | Valor |
|---|---|
| Loss (evaluación) | 0,0921 |
| Precision | 0,7005 |
| Recall | 0,7135 |
| Micro F1 | 0,7069 |
| Weighted F1 | 0,7067 |
| Macro F1 | 0,7145 |
| Accuracy | 0,9834 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares aportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en fp32 (108,9 M de parámetros × 4 bytes), y alrededor de 0,2-0,3 GB en fp16 o int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, T4 o superiores funcionan sin problema. Para entrenamiento o ajuste fino se recomienda al menos 8-16 GB (RTX 3090, RTX 4090, A100).
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), Hugging Face Inference Endpoints, ONNX Runtime, y exportación a llama.cpp no aplicable por ser un modelo encoder. vLLM y TGI no están optimizados para token classification de este tipo, aunque TGI podría no soportarlo directamente.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por secuencia en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tapt-orig-pubmedbert-2class-spanmask-label_all_false | 108,9 M | no disponible | NER biomédico (IOB 2 clases) | apache-2.0 | Hugging Face |
| PubMedBERT (base) | ~110 M | 512 tokens (típico BERT) | Preentrenamiento de dominio biomédico | MIT (según versión) | Hugging Face |
| BioBERT | ~110 M | 512 tokens (típico BERT) | Preentrenamiento biomédico | Apache 2.0 (según versión) | Hugging Face |
| SciBERT | ~110 M | 512 tokens (típico BERT) | Preentrenamiento científico | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo publicados por el autor para establecer una comparación cuantitativa con estas alternativas. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento no están documentadas por el autor ("More information needed").
- Riesgo de sobreajuste: la pérdida de validación alcanza su mínimo en la época 2 y aumenta progresivamente hasta la época 18, mientras la pérdida de entrenamiento sigue bajando; el checkpoint final puede no ser el óptimo.
- Rendimiento moderado en la tarea: Micro F1 de 0,7069 y Precision de 0,7005 indican un margen de error sustancial para producción en NER biomédico; la accuracy de 0,9834 es engañosa por el desbalance de clases típico en etiquetado IOB.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre literatura biomédica en inglés, puede heredar sesgos de representación de poblaciones y terminologías de ese corpus.
- Limitación de idioma: solo inglés; no apto para textos en castellano u otros idiomas sin reentrenamiento.
- Limitación de contexto: la longitud máxima de secuencia no está confirmada; los modelos BERT suelen limitarse a 512 tokens, lo que restringe el procesamiento de documentos largos sin fragmentación.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el dataset de entrenamiento (`OTAR3088/CeLLaTe-ner-2class-iob_final`), cuya licencia y procedencia conviene verificar antes de un uso en producción.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni evaluaciones independientes.
- No apto para generación de texto ni para tareas conversacionales; es exclusivamente un modelo de clasificación de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mardiyyah/tapt-orig-pubmedbert-2class-spanmask-label_all_false
- Modelo base: https://huggingface.co/Mardiyyah/CeLLaTe-tapt-pubmedbert-tokenizer-original-spanmask
- Dataset de ajuste fino: https://huggingface.co/datasets/OTAR3088/CeLLaTe-ner-2class-iob_final
- Perfil del autor: https://huggingface.co/Mardiyyah
