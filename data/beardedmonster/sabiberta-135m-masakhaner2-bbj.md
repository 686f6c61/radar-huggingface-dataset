# BeardedMonster/SabiBERTa-135M-masakhaner2-bbj

## Resumen

SabiBERTa-135M-masakhaner2-bbj es un checkpoint de clasificación de tokens (reconocimiento de entidades nombradas, NER) publicado por el usuario BeardedMonster en Hugging Face. Se obtiene por fine-tuning del encoder `BeardedMonster/SabiBERTa-135M`, un modelo de la familia ModernBERT (según el tag `modernbert`) con 135.883.017 parámetros, sobre el subconjunto de la lengua `bbj` del corpus MasakhaNER 2.0. Los pesos se distribuyen en formato safetensors y el repositorio ocupa 0,5 GB.

El interés del checkpoint es acotado pero concreto: cubre una lengua africana de bajos recursos (`bbj`, etiquetada con el tag `african-languages`) dentro del protocolo de evaluación MasakhaNER 2.0, y reporta un span F1 medio de 0,6209 en una única ejecución. El autor indica que su arnés de evaluación reproduce los baselines publicados con una desviación de aproximadamente 0,25 F1, de modo que la cifra está calibrada frente a la literatura en lugar de ser un resultado aislado sin referencia.

Ahora bien, se trata de un modelo pequeño, de una sola tarea, un solo idioma y sin licencia declarada en los metadatos. No es un modelo generativo: no hay chat, ni tool calling, ni razonamiento multi-paso. Su valor práctico está en pipelines de extracción de entidades sobre texto en `bbj` y como baseline reproducible para investigación en NLP de lenguas africanas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer; tag `modernbert`) |
| Parámetros totales | 135.883.017 |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información; el fine-tuning se realizó con `max_length` de 256 tokens |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos safetensors; no se anuncian GGUF, ONNX ni variantes cuantizadas) |
| Idiomas soportados | `bbj` (único idioma del fine-tuning) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repositorio: 0,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo ModernBERT, según el tag declarado en el repositorio, con 135,9 millones de parámetros. Sobre esa base se aplica una cabeza de clasificación de tokens (`AutoModelForTokenClassification`), con `id2label` configurado de forma que las predicciones se decodifican directamente a nombres de etiqueta sin mapeo manual. No se dispone de información sobre el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto nativa del modelo base.

El entrenamiento consiste en un fine-tuning supervisado sobre el subconjunto `bbj` de MasakhaNER 2.0, con 50 épocas, learning rate de 5e-05, batch size de 32 y longitud máxima de 256 tokens. La métrica de selección es span F1, con un resultado medio de 0,6209. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación, algo esperable en un modelo discriminativo de extracción de entidades. Tampoco se detalla la composición del corpus de entrenamiento más allá de su pertenencia a MasakhaNER 2.0, ni el número de tokens o de frases utilizados.

El autor advierte de dos particularidades metodológicas: los resultados provienen de una sola ejecución (los artículos de referencia promedian cinco, por lo que las diferencias pequeñas deben tratarse como ruido) y el arnés de evaluación reproduce los baselines publicados con un margen de aproximadamente 0,25 F1.

## Capacidades

- Reconocimiento de entidades nombradas sobre texto en `bbj`: clasifica cada token en etiquetas de tipo persona, lugar, organización y fecha según el esquema de anotación de MasakhaNER 2.0.
- Clasificación de tokens en formato IOB/BIO, con decodificación directa a nombres de etiqueta gracias al `id2label` incluido.
- Codificación contextual del texto: al ser un encoder bidireccional, genera representaciones dependientes del contexto que pueden reutilizarse para otras tareas discriminativas mediante fine-tuning adicional.
- Inferencia ligera: con 135,9 millones de parámetros, el modelo puede ejecutarse en CPU y en GPUs de gama baja.
- No soporta generación de texto libre, razonamiento, matemáticas ni código: no es un modelo de lenguaje causal.
- No dispone de tool calling ni function calling.
- No implementa agentes, planificación ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio) ni modo "thinking".
- Capacidad multilingüe: limitada al idioma `bbj`; no se han publicado evaluaciones de transferencia a otras lenguas.

## Casos de uso

- Extracción de entidades en corpus en `bbj`: procesar textos digitalizados y extraer automáticamente nombres de personas, lugares y organizaciones para construir bases de datos estructuradas; el modelo está entrenado específicamente en el esquema de anotación de MasakhaNER 2.0, lo que reduce el trabajo de normalización posterior.
- Pre-etiquetado para anotación humana: usar las predicciones como borrador en herramientas de anotación (por ejemplo, Label Studio o doccano) y que lingüistas corrijan en lugar de anotar desde cero; con un span F1 de 0,6209 el ahorro de tiempo es realista aunque exija revisión.
- Enriquecimiento de metadatos en archivos documentales y transcripciones: detectar topónimos y nombres propios en registros administrativos, entrevistas o textos periodísticos en `bbj` para alimentar índices de búsqueda.
- Indexación y búsqueda facetada: poblar campos de entidad en un motor de búsqueda para permitir filtros por lugar o persona en una colección documental en esta lengua.
- Monitorización de menciones en medios locales: extraer entidades de publicaciones periódicas para seguimiento de temas, con la advertencia de que el modelo está entrenado en el dominio de MasakhaNER 2.0 y puede degradar en dominios muy distintos.
- Baseline de investigación en NLP de bajos recursos: punto de partida reproducible para comparar tokenizadores, técnicas de aumento de datos o estrategias de transferencia entre lenguas africanas.
- Servicio de inferencia en entornos con hardware limitado: al ocupar del orden de 0,27 GB en fp16, puede desplegarse en servidores sin GPU o en dispositivos con poca memoria, algo inviable para modelos NER multilingües de mayor tamaño.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Observaciones |
|---|---|---|---|
| MasakhaNER 2.0 (`bbj`) | span F1 | 0,6209 | Media sobre un único idioma y una única ejecución |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros conjuntos de evaluación generalistas; estos benchmarks no son aplicables a un modelo de clasificación de tokens. Tampoco se ofrecen cifras por clase de entidad ni comparaciones numéricas con los baselines de MasakhaNER 2.0 en este checkpoint concreto: el autor remite a un `metrics.json` del repositorio para los resultados desglosados por lengua, fichero que no se ha podido consultar en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 135,9 M de parámetros, sin contar tokenizador ni overhead del runtime): aproximadamente 0,54 GB en fp32, 0,27 GB en fp16/bf16 y 0,14 GB en int8.
- GPU recomendadas: cualquier GPU con 1 GB o más de memoria es suficiente. No se requiere A100 ni H100; una RTX 4090, RTX 3090, RTX 2080 o incluso una GTX 1650 sobran para el modelo.
- Cabe holgadamente en GPU de consumo, en iGPU y en CPU. La inferencia en CPU es viable para volúmenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` (método indicado por el autor), exportación a ONNX Runtime mediante Optimum, Hugging Face Inference Endpoints o un servidor Triton. vLLM, llama.cpp, Ollama y TGI no son adecuados porque el modelo no es generativo y no está soportado por esos runners en su modo de clasificación de tokens.
- Latencia y throughput: no se han publicado cifras en la información disponible. Con 256 tokens de longitud máxima y 135,9 M de parámetros, el batching es la palanca principal para aumentar el throughput en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en `bbj` | Licencia | Formato |
|---|---|---|---|---|---|
| SabiBERTa-135M-masakhaner2-bbj | 135,9 M | no disponible (entrenado a 256) | span F1 0,6209 (1 ejecución) | no disponible | safetensors |
| SabiBERTa-135M (modelo base) | 135 M (según el nombre del checkpoint; no verificado en la información) | no disponible | sin fine-tuning NER | no disponible; rige para los derivados | safetensors (no confirmado) |
| Sistemas evaluados en MasakhaNER 2.0 (p. ej. XLM-R, AfroXLMR ajustados) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | no disponible | no disponible |

La comparación cuantitativa con alternativas queda limitada por la ausencia de resultados de referencia desglosados por lengua en la información disponible. El propio autor señala que su arnés reproduce los baselines publicados con una tolerancia de aproximadamente 0,25 F1, de modo que cualquier comparación fiable exigiría recalcular esas referencias bajo el mismo protocolo.

## Limitaciones y advertencias

- Licencia no declarada: no hay términos explícitos en los metadatos ni en la model card. El autor indica que la licencia y condiciones del modelo base (`BeardedMonster/SabiBERTa-135M`) gobiernan cualquier uso derivado, por lo que es imprescindible revisarlas antes de un uso comercial.
- Un solo idioma: el checkpoint está ajustado únicamente en `bbj`. No hay evidencia de transferencia a otras lenguas africanas ni a variedades dialectales.
- Resultado de una única ejecución: sin media sobre cinco semillas, la variabilidad del span F1 no está cuantificada; diferencias de pocas centésimas frente a otros sistemas no deben interpretarse como mejoras reales.
- Longitud de entrada de 256 tokens durante el entrenamiento: los documentos largos requieren troceado, con el riesgo de partir entidades en los límites de fragmento y perderlas en la decodificación.
- Riesgo de falsos positivos y negativos: al ser un modelo discriminativo no "alucina" texto, pero sí puede inventar entidades inexistentes o dejar sin etiquetar menciones reales, especialmente en dominios alejados del corpus de noticias de MasakhaNER 2.0.
- Sesgos heredados del corpus: convenciones de anotación concretas, posible desbalance entre tipos de entidad y sobrerrepresentación del registro periodístico.
- Validación externa mínima: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en los metadatos y con una model card breve; conviene evaluar el checkpoint en el dominio objetivo antes de producción.
- Sin cuantizaciones publicadas: no hay GGUF, ONNX ni versiones int8 oficiales, de modo que cualquier optimización de despliegue debe realizarla el usuario y validarse de nuevo.
- Fecha de creación del repositorio: 18 de octubre de 2026, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/SabiBERTa-135M-masakhaner2-bbj
- Modelo base: https://huggingface.co/BeardedMonster/SabiBERTa-135M
- Paper de MasakhaNER 2.0, blogs, repositorios y demos: no disponible en la información proporcionada. Las búsquedas web realizadas no devolvieron ningún enlace relevante al modelo ni al corpus (los resultados obtenidos eran cuestionarios sobre la Torre de Londres, sin relación con el modelo).
