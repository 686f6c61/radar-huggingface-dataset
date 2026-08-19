# ArunBt64/hyenadna-tiny-nontata-promoters

## Resumen

El modelo `hyenadna-tiny-nontata-promoters` es un fine-tuning del checkpoint `LongSafari/hyenadna-tiny-1k-seqlen-hf`, un modelo fundacional genómico basado en la arquitectura Hyena (convolución larga implícita), desarrollado por ArunBt64 como proyecto de aprendizaje y portafolio. El objetivo es la clasificación binaria de secuencias de ADN humano de 251 pares de bases: determinar si una secuencia corresponde a un promotor no-TATA (región reguladora sin caja TATA) o a un fragmento no promotor de un cuerpo génico.

La relevancia de este modelo radica en dos aspectos: por un lado, demuestra el fine-tuning de un modelo HyenaDNA de tamaño reducido (menos de medio millón de parámetros) para una tarea genómica específica; por otro, aborda explícitamente el problema de fuga de datos (leakage) en el benchmark GenomicBenchmarks, reconstruyendo un split corregido que evita la duplicación casi total de la clase negativa entre entrenamiento y prueba. Esto hace que sus métricas no sean directamente comparables con las publicadas en el leaderboard oficial, pero sí más fiables como estimación del rendimiento real.

El modelo se distribuye bajo licencia BSD-3-Clause y está pensado para uso académico y de investigación, no como herramienta diagnóstica o de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hyena (implicit long-convolution, sin atención) |
| Parametros totales | 448.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.000 nucleótidos (modelo base); 251 pb en este fine-tune |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (secuencias de ADN) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es HyenaDNA-tiny, una variante de la familia HyenaDNA presentada por Nguyen et al. (2023). HyenaDNA utiliza operadores Hyena, que son un reemplazo subcuadrático de la atención en transformers, basados en proyecciones de entrada modificadas, convoluciones implícitas y mecanismos de compuerta (gating). Esto permite manejar contextos largos (hasta 1 millón de tokens en las versiones grandes) con un coste computacional reducido. El checkpoint tiny tiene una longitud de contexto de 1.000 nucleótidos y 448.920 parámetros.

El fine-tuning se realizó sobre el dataset `katarinagresova/Genomic_Benchmarks_human_nontata_promoters`, que contiene secuencias positivas de 251 pb alrededor del sitio de inicio de transcripción (TSS) sin caja TATA, y negativas de fragmentos aleatorios de regiones génicas humanas. El autor detectó que el split oficial tenía un grave problema de leakage: la clase negativa estaba duplicada en un 94% entre train y test. Para corregirlo, reconstruyó un split agrupando secuencias por solapamiento de 50-meros y asignando clústeres completos a cada partición, resultando en 26.648 secuencias de entrenamiento y 9.483 de prueba, con 54,4% de positivos en ambas y 0% de solapamiento exacto o casi exacto.

El entrenamiento usó el `Trainer` de HuggingFace con batch size 32, learning rate 5e-5, y `EarlyStoppingCallback` con paciencia 1 sobre el ROC-AUC de validación. Se detuvo tras 3 épocas, restaurando el checkpoint de la época 2 como mejor modelo.

## Capacidades

- Clasificación binaria de secuencias de ADN: distingue entre promotores no-TATA y fragmentos no promotores en genoma humano.
- Manejo de secuencias de hasta 1.000 nucleótidos (aunque el fine-tuning usa ventanas de 251 pb).
- Sin mecanismo de atención: la interpretabilidad se aborda mediante técnicas como in-silico mutagenesis y una adaptación posicional del "logit lens".
- Capacidad de procesamiento de secuencias genómicas a nivel de nucleótido individual, sin necesidad de tokenización por k-mer.
- No soporta tool calling, generación de texto ni otras capacidades de modelos de lenguaje generales; es un modelo especializado en una única tarea.

## Casos de uso

- Investigación en regulación génica: el modelo puede utilizarse para identificar potenciales promotores no-TATA en regiones genómicas humanas, ayudando a anotar elementos reguladores en estudios de expresión génica.
- Validación de pipelines de fine-tuning genómico: al ser un modelo pequeño y con un split corregido por leakage, sirve como banco de pruebas para metodologías de entrenamiento y evaluación en dominios biológicos.
- Estudio de sesgos en benchmarks genómicos: el análisis del leakage y su corrección es un caso de uso metodológico para investigadores que trabajan con GenomicBenchmarks u otros conjuntos de datos genómicos.
- Exploración de interpretabilidad en modelos sin atención: las técnicas de logit lens posicional aplicadas aquí pueden replicarse en otros modelos Hyena o SSM para entender qué regiones de la secuencia contribuyen a la decisión.
- Comparación de arquitecturas subcuadráticas en tareas de clasificación de secuencias: permite evaluar el rendimiento de Hyena frente a transformers densos en un problema de tamaño reducido.
- Docencia y aprendizaje: al ser un proyecto de portafolio con código y figuras disponibles en GitHub, es un recurso didáctico para cursos de bioinformática y aprendizaje automático aplicado a genómica.

## Benchmarks y rendimiento

Los resultados declarados por el autor en el model-index corresponden al split corregido por leakage, por lo que no son comparables con los leaderboards oficiales de GenomicBenchmarks. Se incluyen también los resultados de un baseline de frecuencias de 6-mer con regresión logística sobre el mismo split.

| Modelo | Accuracy | Precision | Recall | F1 | ROC-AUC |
|---|---|---|---|---|---|
| hyenadna-tiny-nontata-promoters | 0.819 | 0.845 | 0.818 | 0.831 | 0.901 |
| Baseline 6-mer + LogisticRegressionCV | 0.799 | 0.894 | 0.715 | 0.794 | 0.870 |

El modelo supera al baseline en accuracy, recall, F1 y ROC-AUC, pero con un margen modesto. El autor señala que en tareas dominadas por composición de secuencia, un baseline de k-mer es un competidor razonablemente fuerte.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB (el modelo tiene 448.920 parámetros; en float32 ocupa ~1,8 MB, más overhead de activaciones y código).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; también funciona en CPU sin problemas.
- Cabe en GPUs de consumo como RTX 3060, RTX 4090, etc., e incluso en entornos sin GPU.
- Opciones de despliegue: HuggingFace Transformers con `trust_remote_code=True` (requiere ejecutar código personalizado del modelo HyenaDNA). No se han publicado integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles, pero dado el tamaño mínimo, la inferencia es prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de clasificación de promotores en las mismas condiciones (mismo split corregido). El único punto de referencia es el baseline de k-mer mencionado anteriormente. En el contexto de GenomicBenchmarks, otros modelos como los basados en transformers (DNABERT, Nucleotide Transformer) reportan métricas en el split original, pero no son comparables debido al leakage. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación, no validado para uso diagnóstico o productivo.
- Entrenado en un único dataset, una única tarea y un único organismo (humano); no generaliza a otras especies ni a otros tipos de elementos reguladores.
- El split corregido por leakage es una reconstrucción del autor; los resultados no son comparables con los publicados en el leaderboard oficial de GenomicBenchmarks.
- La interpretación biológica (enriquecimiento de motivos SP1) es exploratoria, basada en un solo run sobre 20 secuencias positivas y 20 negativas, sin corrección por comparaciones múltiples.
- Requiere `trust_remote_code=True` para cargar el modelo, lo que ejecuta código personalizado del repositorio; debe revisarse antes de usarlo en entornos de producción.
- No soporta cuantización documentada; el formato safetensors es el único disponible.
- Al ser un modelo sin atención, las técnicas de interpretabilidad estándar basadas en pesos de atención no son aplicables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArunBt64/hyenadna-tiny-nontata-promoters
- Repositorio de código y metodología: https://github.com/Arun0364/genomic-finetune
- Modelo base: https://huggingface.co/LongSafari/hyenadna-tiny-1k-seqlen-hf
- Paper de HyenaDNA: https://arxiv.org/abs/2306.15794
- Implementación oficial de HyenaDNA: https://github.com/HazyResearch/hyena-dna
- Dataset GenomicBenchmarks: https://huggingface.co/datasets/katarinagresova/Genomic_Benchmarks_human_nontata_promoters
- Colección de modelos HyenaDNA: https://huggingface.co/collections/LongSafari/hyenadna-models
