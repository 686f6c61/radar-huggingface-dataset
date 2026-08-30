# daominhwysi/mmbert-small-vi-exam-seq-labeling

## Resumen

El modelo `daominhwysi/mmbert-small-vi-exam-seq-labeling` es un fine-tuning del encoder multilingüe mmBERT-base (jhu-clsp/mmBERT-base) para la tarea de token classification aplicada al etiquetado de secuencias en exámenes vietnamitas. Desarrollado por daominhwysi, el modelo forma parte de un pipeline completo que genera datos sintéticos de exámenes alineados con el currículo vietnamita, anota exámenes reales escaneados con OCR y entrena modelos de etiquetado de secuencias. Aunque el nombre del repositorio indica "small", el modelo base es mmBERT-base, que según el paper de mmBERT tiene 307 millones de parámetros totales (110 millones no-embedding), por lo que se trata de un modelo de tamaño medio.

La relevancia de este modelo radica en su aplicación práctica en el ámbito educativo: permite automatizar la extracción de preguntas, respuestas y metadatos de exámenes oficiales vietnamitas, un proceso que tradicionalmente requería anotación manual. Al estar basado en mmBERT, un encoder moderno con atención optimizada y mayor velocidad que los BERT multilingües clásicos, ofrece un equilibrio entre eficiencia y precisión. El modelo se distribuye bajo licencia MIT y está disponible en formato safetensors, listo para usar con la librería Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT-base (encoder transformer, variante ModernBERT multilingüe) |
| Parametros totales | 307.543.309 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base mmBERT no documenta el contexto en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin versiones cuantizadas) |
| Idiomas soportados | vietnamita (fine-tuning); multilingüe (modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `jhu-clsp/mmBERT-base`, un encoder multilingüe moderno basado en la arquitectura ModernBERT. Según el paper de mmBERT, la versión base tiene 307 millones de parámetros totales (110 millones no-embedding) debido a un vocabulario ampliado, y emplea mecanismos de atención eficiente (flash attention) y una arquitectura optimizada para mayor velocidad de entrenamiento e inferencia. El fine-tuning se realizó sobre un dataset de etiquetado de secuencias de exámenes vietnamitas, generado mediante un pipeline que combina datos sintéticos y anotaciones de exámenes OCR reales (según el repositorio GitHub del autor).

El entrenamiento se llevó a cabo durante 4 épocas con un learning rate de 3e-5, tamaño de batch efectivo de 10 (batch 5 con gradientes acumulados cada 2 pasos), scheduler cosine con 760 pasos de warmup y precisión mixta nativa (AMP). No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado clásico para token classification. El modelo base ya había sido preentrenado con un esquema de entrenamiento adaptativo (adaptive scheduling) que acelera el preentrenamiento en comparación con otros encoders multilingües.

## Capacidades

- Etiquetado de secuencias (token classification): identifica y clasifica tokens dentro de textos de exámenes, típicamente para extraer preguntas, respuestas, opciones y metadatos.
- Procesamiento de texto vietnamita: especializado en el dominio educativo vietnamita, con capacidad para manejar vocabulario y estructuras propias de exámenes oficiales.
- Inferencia eficiente: al basarse en mmBERT, hereda las optimizaciones de ModernBERT (atención con flash attention, mayor velocidad que BERT clásico).
- Compatible con la librería Transformers y el pipeline `token-classification` de Hugging Face.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales; es un modelo exclusivamente encoder.

## Casos de uso

- Anotación automática de exámenes escaneados: el modelo puede procesar la salida de un sistema OCR y etiquetar cada token como parte de una pregunta, una respuesta correcta, una opción distractora o un enunciado, eliminando la necesidad de revisión manual.
- Extracción de preguntas y respuestas para bancos de ítems: permite convertir exámenes en formato texto a estructuras JSON o CSV con preguntas y respuestas separadas, listas para integrarse en plataformas de evaluación.
- Generación de datasets de entrenamiento para otros modelos: el pipeline del autor utiliza este tipo de modelos para crear datasets etiquetados a partir de exámenes reales, que luego pueden servir para entrenar modelos más complejos.
- Control de calidad en publicaciones educativas: las editoriales pueden verificar que los exámenes digitalizados mantienen la estructura correcta (preguntas, opciones, respuestas) antes de su publicación.
- Automatización de corrección de exámenes tipo test: al identificar las respuestas correctas marcadas en un examen escaneado, el modelo puede alimentar un sistema de corrección automática.
- Investigación en NLP educativa: sirve como punto de partida para experimentos sobre etiquetado de secuencias en dominios específicos con recursos limitados, dado su tamaño moderado y licencia permisiva.

## Benchmarks y rendimiento

Los resultados oficiales del modelo en el conjunto de evaluación (declarados por el autor en la model card) son los siguientes:

| Metrica | Valor |
|---|---|
| Loss | 0.0564 |
| Precision | 0.9156 |
| Recall | 0.9747 |
| F1 | 0.9442 |
| Accuracy | 0.9865 |

Evolución durante el entrenamiento (por época):

| Epoca | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|
| 1 | 0.7236 | 0.9156 | 0.8084 | 0.9221 |
| 2 | 0.8395 | 0.9526 | 0.8925 | 0.9609 |
| 3 | 0.9019 | 0.9703 | 0.9348 | 0.9801 |
| 4 | 0.9209 | 0.9747 | 0.9470 | 0.9852 |

No se han publicado comparaciones con otros modelos en la información disponible. El model-index oficial no incluye resultados adicionales.

## Requisitos de hardware

- VRAM estimada: al tratarse de un encoder de 307M parámetros, la inferencia en precisión FP32 requiere aproximadamente 1.2 GB de VRAM para el modelo, más overhead de activaciones y tokenización. Con batch pequeño (1-4) cabe en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (GTX 1660, RTX 2060, RTX 3060, etc.). Para entrenamiento o fine-tuning se recomienda al menos 8-12 GB (RTX 3070, RTX 4080, A100).
- Es compatible con GPUs consumer; no requiere hardware especializado.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con vLLM, TGI, Hugging Face Inference Endpoints o directamente con la API de Transformers en Python. No se proporcionan versiones GGUF para llama.cpp, aunque podría convertirse.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño moderado y las optimizaciones de mmBERT, se espera una latencia de decenas de milisegundos por secuencia en GPU moderna.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada. Como referencia, se pueden citar otros encoders multilingües utilizados para token classification:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mmBERT-base (este modelo) | 307M | no disponible | MIT | Fine-tuning en exámenes vietnamitas |
| XLM-RoBERTa-base | 278M | 512 | MIT | Encoder multilingüe clásico, sin optimizaciones modernas |
| mBERT (BERT-base multilingual) | 178M | 512 | Apache 2.0 | Encoder multilingüe original, más lento y con contexto corto |
| SEA-LION ModernBERT | no disponible | no disponible | no disponible | Mencionado en el pipeline del autor como alternativa |

No hay datos de rendimiento comparativo entre estos modelos en la tarea específica de etiquetado de exámenes vietnamitas.

## Limitaciones y advertencias

- El modelo está especializado en el dominio de exámenes vietnamitas; su rendimiento fuera de este dominio puede degradarse significativamente.
- No se han documentado los datos de entrenamiento (el autor indica "unknown dataset" en la model card), lo que dificulta evaluar posibles sesgos.
- La precisión (0.9156) es notablemente inferior al recall (0.9747), lo que sugiere que el modelo tiende a sobre-etiquetar (genera más falsos positivos que falsos negativos). Esto puede ser problemático si se usa para filtrar contenido de forma automática.
- El modelo no soporta generación de texto; solo es adecuado para tareas de clasificación de tokens.
- No se proporcionan cuantizaciones ni versiones optimizadas para despliegue en CPU o dispositivos edge.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre la calidad de los resultados en producción.
- El nombre del repositorio ("mmbert-small") contradice el modelo base declarado (mmBERT-base); se recomienda verificar la configuración antes de usarlo en entornos críticos.

## Enlaces

- Hugging Face: [daominhwysi/mmbert-small-vi-exam-seq-labeling](https://huggingface.co/daominhwysi/mmbert-small-vi-exam-seq-labeling)
- Repositorio GitHub del pipeline: [daominhwysi/vietnamese-exam-seq-labelling](https://github.com/daominhwysi/vietnamese-exam-seq-labelling)
- Modelo base: [jhu-clsp/mmBERT-base](https://huggingface.co/jhu-clsp/mmBERT-base)
- Paper de mmBERT: [mmBERT: a Multilingual Modern Encoder through Adaptive Scheduling](https://arxiv.org/html/2509.06888v1)
- Modelo relacionado del mismo autor: [daominhwysi/vi-exam-seq-labeller](https://huggingface.co/daominhwysi/vi-exam-seq-labeller)
