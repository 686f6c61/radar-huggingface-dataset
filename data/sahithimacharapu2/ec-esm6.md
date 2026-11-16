# sahithimacharapu2/ec-esm6

## Resumen

ESM-2 35M Enzyme EC Number Classifier es un modelo de clasificación de proteínas desarrollado por el usuario sahithimacharapu2 y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del backbone ESM-2 de 35 millones de parámetros de Meta (facebook/esm2_t12_35M_UR50D) orientado a predecir el número EC (Enzyme Commission) de una enzima a partir de su secuencia de aminoácidos. El modelo resuelve el problema de anotación funcional automática de enzimas, una tarea central en bioinformática y biología computacional.

La arquitectura combina el encoder ESM-2 (transformer de 12 capas, dimensión oculta de 480) con una cabeza clasificadora MLP de dos capas lineales con activación GELU y dropout de 0,1. El modelo predice números EC de cuatro niveles (por ejemplo, 1.1.1.131), evaluándose la precisión principal en el nivel L4. El vocabulario de salida contiene 6939 números EC válidos.

Es relevante porque demuestra cómo un modelo de proteínas de tamaño reducido (35M parámetros, repo de 0,1 GB) puede adaptarse mediante fine-tuning a una tarea de clasificación multietiqueta especializada, con un pipeline de inferencia empaquetado en Docker y parámetros configurables de umbral y batch. No obstante, la información publicada es escasa: no hay resultados de benchmarks, ni detalles sobre el dataset de entrenamiento, ni métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ESM-2) + cabeza clasificadora MLP (Linear 480→480, GELU, Linear 480→num_classes) |
| Parametros totales | 35M (backbone ESM-2 35M); cabeza clasificadora adicional no cuantificada en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ESM-2 35M soporta hasta 1024 tokens de secuencia en su configuracion original; no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors y classifier_head.pt, sin cuantizaciones publicadas) |
| Idiomas soportados | en (la tarea es sobre secuencias de aminoacidos, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone ESM-2) + PyTorch state_dict .pt (cabeza clasificadora) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del backbone ESM-2 de 35M parámetros (esm2_t12_35M_UR50D), un transformer encoder preentrenado con enmascaramiento de aminoácidos sobre grandes bases de datos de secuencias proteicas. Sobre el encoder se añade una cabeza clasificadora compuesta por dropout (0,1), una capa lineal de 480 a 480, activación GELU, otro dropout y una capa lineal final hacia el número de clases EC. El código de entrenamiento indica que se congelan las primeras 4 capas del backbone (n_freeze=4), aunque no se especifica el número total de capas congeladas ni el régimen completo de entrenamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de RLHF/DPO (poco habituales en clasificación) ni detalles sobre el esquema de etiquetado multietiqueta. La predicción se realiza sobre 6939 números EC válidos y se evalúa en los cuatro niveles jerárquicos (L1-L4), con la precisión L4 como métrica principal. El umbral de probabilidad (EC_THRESH, por defecto 0,5) permite generar predicciones adicionales además de la top-1.

## Capacidades

- Clasificación de enzimas a partir de secuencias de aminoácidos en números EC de cuatro niveles (formato x.x.x.x).
- Predicción multietiqueta: puede devolver varias predicciones por secuencia según el umbral configurable (EC_THRESH).
- Procesamiento por lotes (batch) con tamaño configurable (EC_BATCH, por defecto 32).
- Inferencia con límite temporal configurable (EC_TIME_BUDGET, por defecto 660 segundos).
- Integración en pipelines mediante entrada Parquet (columnas id y sequence) y salida JSONL.
- Despliegue reproducible mediante Docker con variables de entorno para batch, umbral y tiempo máximo.
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito.
- Capacidad multilingüe no aplicable: opera sobre secuencias proteicas, no sobre texto en lenguaje natural.

## Casos de uso

- Anotación funcional automática de genomas y metagenomas: dado un catálogo de secuencias proteicas predichas por herramientas de gene calling, el modelo asigna números EC y permite priorizar candidatos enzimáticos para validación experimental.
- Enriquecimiento de bases de datos de proteínas: integración en pipelines ETL que reciben secuencias en Parquet y generan anotaciones EC en JSONL, aprovechando el batch configurable para procesar lotes grandes.
- Cribado de enzimas en biología sintética: clasificación rápida de bibliotecas de variantes o secuencias candidatas para identificar la clase enzimática antes de ensayos de laboratorio.
- Docencia y prototipado en bioinformática: el empaquetado Docker y el formato de entrada/salida simple permiten desplegar el modelo en entornos docentes o de investigación sin infraestructura compleja.
- Clasificación multietiqueta con umbral ajustable: en escenarios donde una enzima puede pertenecer a varias clases EC, el parámetro EC_THRESH permite recuperar predicciones alternativas además de la top-1.
- Preprocesamiento para modelos downstream: las predicciones EC pueden alimentar modelos de predicción de función, docking o análisis de vías metabólicas como característica adicional.
- Evaluación comparativa de backbones: al ser un fine-tuning de ESM-2 35M, sirve como línea base para comparar con modelos de proteínas de mayor tamaño en tareas de clasificación EC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la evaluación se realiza en los cuatro niveles (L1-L4) con precisión L4 como métrica principal, pero no incluye cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 35M parámetros en fp32 el backbone ocupa aproximadamente 140 MB, y en fp16 unos 70 MB. La cabeza clasificadora añade una cantidad marginal. El repo completo pesa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: el autor proporciona un Dockerfile con predict.py como entrypoint; al usar transformers y safetensors, también es posible cargarlo con la librería transformers estándar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de clasificación de este tamaño).
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del tamaño de lote (EC_BATCH) y de la longitud de las secuencias; el límite EC_TIME_BUDGET de 660 segundos sugiere que el autor prevé ejecuciones de varios minutos sobre el conjunto de validación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ec-esm6 (este modelo) | 35M | no disponible | Clasificacion EC (L1-L4) | MIT | Hugging Face, repo 0,1 GB |
| ESM-2 35M base (facebook/esm2_t12_35M_UR50D) | 35M | hasta 1024 tokens (config original) | Embeddings de proteinas (preentrenado) | MIT | Hugging Face |
| ESM-2 650M (facebook/esm2_t33_650M_UR50D) | 650M | hasta 1024 tokens (config original) | Embeddings de proteinas (preentrenado) | MIT | Hugging Face |
| Modelos especializados en prediccion EC | no disponible | no disponible | Clasificacion EC | no disponible | no disponible |

La comparativa se limita a los backbones ESM-2 de referencia, ya que no se dispone de información sobre otros clasificadores EC comparables ni de métricas de rendimiento de este modelo que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se han publicado métricas de rendimiento (precisión L1-L4), por lo que no es posible evaluar su calidad frente a alternativas.
- No se documenta el dataset de entrenamiento, su tamaño, composición ni el esquema de etiquetado, lo que impide valorar sesgos de dominio (por ejemplo, sesgo hacia enzimas bien caracterizadas).
- Riesgo de alucinación en sentido amplio: el modelo puede asignar números EC con alta confianza a secuencias sin función enzimática conocida o mal anotadas; el umbral EC_THRESH permite filtrar predicciones adicionales pero no corrige errores de la top-1.
- Limitación de contexto: no se especifica la longitud máxima de secuencia soportada; secuencias muy largas podrían truncarse y degradar la predicción.
- El modelo está entrenado sobre secuencias proteicas; no es aplicable a texto en lenguaje natural ni a otras modalidades.
- El vocabulario de salida está restringido a 6939 números EC válidos; enzimas con números EC fuera de ese conjunto no podrán predecirse correctamente.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El pipeline de inferencia depende de un script predict.py y de un formato Parquet/JSONL específico; su integración en otros sistemas requiere adaptación.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sahithimacharapu2/ec-esm6
- Backbone ESM-2 35M: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Paper de ESM-2 (Lin et al., 2022): https://www.biorxiv.org/content/10.1101/2022.07.20.500902v1
- Repositorio de ESM en GitHub (Meta): https://github.com/facebookresearch/esm
- Documentación de transformers (EsmModel): https://huggingface.co/docs/transformers/model_doc/esm
