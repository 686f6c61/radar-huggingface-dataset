# ElucidataInc/polly-ner-gene-protein

## Resumen

El modelo `ElucidataInc/polly-ner-gene-protein` es un sistema de reconocimiento de entidades nombradas (NER) especializado en la detección de menciones de genes y proteínas en texto biomédico. Desarrollado por Elucidata, una empresa dedicada a la gestión de datos biológicos para el descubrimiento de fármacos, este modelo se basa en `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, un transformer BERT preentrenado con literatura biomédica de resúmenes y artículos completos. El modelo se ha ajustado para la tarea de token-classification, prediciendo etiquetas BIO para la entidad `GENE_PROTEIN` y devolviendo spans de caracteres a través de la librería Polly NER.

Con aproximadamente 108,9 millones de parámetros, el modelo está diseñado para integrarse en pipelines de procesamiento de lenguaje natural biomédico, ya sea mediante la API nativa de Transformers o a través del predictor de Polly NER. Su relevancia actual radica en la necesidad de extraer información estructurada de la literatura científica y los registros clínicos para acelerar la investigación farmacéutica y el descubrimiento de biomarcadores. El modelo se distribuye bajo licencia MIT y está disponible en HuggingFace con pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) |
| Parametros totales | 108.893.955 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, un BERT base (12 capas, 768 dimensiones ocultas) preentrenado sobre abstracts y textos completos de artículos biomédicos. Sobre esta base se realiza un fine-tuning supervisado para token-classification con etiquetas BIO (Begin, Inside, Outside) para la entidad `GENE_PROTEIN`. El entrenamiento se llevó a cabo con datos privados referenciados como `ElucidataInc/bc2gm-cleaned`, un dataset derivado del corpus BC2GM, estándar en NER de genes. La configuración de entrenamiento incluye 5 épocas, tamaño de batch 16 por dispositivo, learning rate 2e-5, precisión mixta bf16, warmup ratio 0.1 y weight decay 0.01. No se menciona el uso de RLHF ni DPO; se trata de un ajuste fino clásico con pérdida de entropía cruzada sobre las etiquetas de tokens.

## Capacidades

- Reconocimiento de entidades nombradas de tipo `GENE_PROTEIN` en texto biomédico, devolviendo spans de caracteres mediante Polly NER o etiquetas por token con el pipeline de Transformers.
- Soporte para entidades contiguas y no superpuestas, con codificación BIO determinista.
- Integración con la librería Polly NER para obtener spans de caracteres directamente, o con el pipeline nativo de `transformers` para token-classification.
- No realiza entity linking, normalización de entidades, extracción de relaciones, resolución de abreviaturas ni clasificación de aserciones.
- Capacidad multilingüe: no disponible; el modelo base está entrenado principalmente en inglés biomédico, aunque no se especifica en la documentación.

## Casos de uso

- Minería de literatura biomédica: extraer menciones de genes y proteínas de artículos científicos para construir bases de datos de conocimiento. El modelo puede procesar abstracts completos y devolver spans precisos, facilitando la anotación automática de corpus.
- Anotación de informes clínicos: identificar genes y proteínas en historiales médicos o informes de laboratorio, ayudando a estructurar información no estandarizada.
- Preprocesamiento para pipelines de NLP biomédico: como paso previo a tareas de extracción de relaciones o normalización de entidades, el modelo proporciona las menciones crudas que luego pueden ser enlazadas a bases de datos como UniProt o NCBI Gene.
- Construcción de grafos de conocimiento: extraer entidades de documentos para alimentar grafos de conocimiento en plataformas de descubrimiento de fármacos, como la propia plataforma Polly de Elucidata.
- Búsqueda semántica en documentos científicos: indexar menciones de genes y proteínas para permitir búsquedas por entidad en repositorios de literatura.
- Análisis de patentes farmacéuticas: detectar genes y proteínas en textos de patentes para identificar reclamaciones relacionadas con dianas terapéuticas.

## Benchmarks y rendimiento

La model card reporta métricas de F1 con igualdad exacta de caracteres (inicio, fin y etiqueta semántica). Los resultados son los siguientes:

| Dataset | Micro F1 | Macro F1 | Registros | Caracteres |
|---|---:|---:|---:|---:|
| validation | 0,8441 | 0,8441 | 2478 | 378063 |
| bc2gm-test | 0,8332 | 0,8332 | 4948 | 760629 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene aproximadamente 109 millones de parámetros y un tamaño de repositorio de 0,4 GB, por lo que es ligero en comparación con modelos más grandes.
- VRAM estimada: no disponible en la documentación. Para un modelo BERT base en FP32, los pesos ocupan unos 440 MB, y con activaciones para secuencias de hasta 512 tokens, el consumo típico se sitúa entre 1 y 2 GB en GPU. Sin embargo, este dato no está confirmado por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060) puede ejecutar el modelo sin problemas. También es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: compatible con `transformers` pipeline, `vLLM` (aunque no es óptimo para modelos encoder), `llama.cpp` (no aplicable directamente por ser encoder), y la librería Polly NER. Se puede servir con `TGI` o `FastAPI` para integración en producción.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de NER biomédico (como BioBERT, PubmedBERT o modelos más recientes). La documentación no incluye benchmarks comparativos ni referencias a modelos alternativos. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El modelo no realiza entity linking, normalización, extracción de relaciones, resolución de abreviaturas ni clasificación de aserciones. Solo detecta menciones de entidades.
- Solo soporta entidades contiguas y no superpuestas; no maneja entidades anidadas ni discontinuas.
- Los inputs no se dividen ni truncan automáticamente. El usuario debe asegurarse de que el texto esté dentro del límite de contexto del modelo y gestionar el chunking y la fusión de resultados entre fragmentos.
- Las predicciones pueden ser incompletas o incorrectas, y requieren revisión por parte de un experto en la tarea.
- Los datos de entrenamiento son privados y no se incluyen en el repositorio, lo que limita la auditoría externa del modelo.
- El corpus BC2GM, aunque estándar, puede tener sesgos hacia ciertos tipos de textos (abstracts de PubMed) y no cubrir todos los dominios biomédicos.
- La licencia MIT permite uso comercial, pero se recomienda revisar la licencia del modelo base (BiomedBERT) para asegurar el cumplimiento.

## Enlaces

- HuggingFace: https://huggingface.co/ElucidataInc/polly-ner-gene-protein
- Repositorio Polly NER: https://github.com/ElucidataInc/polly-ner.git
- Run de Weights & Biases: https://wandb.ai/mol-ml/polly-ner/runs/3jwbqco6
- Sitio web de Elucidata: https://www.elucidata.io/
- Documentación de Polly: https://docs.polly.elucidata.io/
