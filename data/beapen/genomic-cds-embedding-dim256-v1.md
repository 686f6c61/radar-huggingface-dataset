# beapen/genomic-cds-embedding-dim256-v1

## Resumen

El modelo `genomic-cds-embedding-dim256-v1` es un codificador transformer de pequeno tamano disenado para generar embeddings densos de secuencias codificantes de proteinas (CDS) humanas. Lo desarrolla Bell Eapen (beapen) como parte de la familia de modelos CDS embedding del proyecto DHTI, y se entrena mediante aprendizaje contrastivo (instance discrimination) sobre transcritos de GENCODE v50 ensamblados en GRCh38. Su relevancia radica en que opera a nivel de codon en lugar de nucleotido, gracias al Genomic Tokenizer, lo que reduce drasticamente el espacio de representacion y permite obtener embeddings utiles con muy pocos parametros.

La arquitectura es un transformer encoder de 2 capas y 4 cabezas de atencion, con hidden size de 256 y embedding final de 256 dimensiones L2-normalizado. El vocabulario es de solo 26 tokens (20 aminoacidos codificados por codon mas 6 tokens especiales), lo que explica que el modelo ronde los 2 millones de parametros. La longitud maxima de secuencia es de 2048 tokens, equivalente a unos 6144 nucleotidos.

Este modelo es la variante intermedia de una familia que incluye dim128 (preferida por el autor por su eficiencia), dim256 (esta) y dim512. Esta pensado para prototipado rapido, depuracion y experimentos a pequena escala, no para uso clinico ni diagnostico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (2 capas, 4 cabezas de atencion) |
| Parametros totales | ~2M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (~6144 nucleotidos) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin variantes GGUF publicadas) |
| Idiomas soportados | en (etiqueta de la model card; el dominio real es secuencia genomica) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`) + `config.json` |
| Hidden size | 256 |
| Dimension de embedding | 256 (L2-normalizada) |
| Vocabulario | 26 tokens (Genomic Tokenizer a nivel de codon) |
| Objetivo de entrenamiento | Aprendizaje contrastivo (instance discrimination) |
| Framework | PyTorch 2.5.1 |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 2 capas con 4 cabezas de atencion y hidden size de 256. La salida se proyecta a un embedding de 256 dimensiones que se normaliza L2, de forma que la norma del vector resultante es aproximadamente 1.0. El tokenizador asociado, Genomic Tokenizer, segmenta la secuencia de ADN a nivel de codon: cada token representa un triplete de nucleotidos que codifica un aminoacido concreto, mas tokens especiales `[CLS]`, `[SEP]`, `[BOS]`, `[MASK]`, `[PAD]` y `[UNK]`. Esta compresion biologica reduce el espacio de representacion y, segun el autor, permite que dimensiones de embedding menores rindan igual o mejor que las mayores.

El entrenamiento se realizo con aprendizaje contrastivo (instance discrimination) sobre aproximadamente 17.000 transcritos codificantes de proteinas de GENCODE v50 sobre el ensamblado GRCh38. El preprocesado incluyo extraccion de CDS desde anotaciones GTF, reconstruccion de secuencias desde el genoma, y control de calidad con verificacion de codones de inicio y parada y validacion del marco de lectura. No se documenta en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables en un modelo de embeddings).

## Capacidades

- Generacion de embeddings densos de 256 dimensiones para secuencias CDS humanas, normalizados L2.
- Tokenizacion a nivel de codon mediante Genomic Tokenizer (26 tokens).
- Procesamiento por lotes con `padding` y `attention_mask`.
- Representacion de secuencias de hasta 2048 tokens (~6144 nucleotidos).
- Aprendizaje contrastivo orientado a similitud semantica entre secuencias codificantes.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo thinking.
- Capacidad multilingue limitada al dominio genomico; la etiqueta de idioma `en` de la model card no refleja una capacidad linguistica real.
- No es un modelo generativo: no produce texto.

## Casos de uso

- Priorizacion de genes en diagnostico de enfermedades raras (como herramienta de investigacion): se generan embeddings de CDS candidatos y se calcula similitud coseno frente a genes de referencia asociados a la enfermedad para ordenar candidatos.
- Anotacion funcional de variantes noveles: se embebe la CDS de referencia y la variante, y la distancia entre embeddings sirve como senal complementaria en pipelines de investigacion.
- Descubrimiento de genes asociados a enfermedad en entornos de investigacion: clustering de embeddings de transcritos para agrupar genes con patrones de codificacion similares.
- Construccion de grafos de conocimiento gen-enfermedad: los embeddings sirven como features de nodos en modelos downstream o en sistemas de recuperacion.
- Prototipado y depuracion de pipelines genomicos: el modelo es ligero (~2M parametros) y cabe en CPU, lo que permite iterar rapidamente en desarrollo.
- Indexacion y busqueda de similitud a gran escala: al producir vectores de 256 dimensiones L2-normalizados, se pueden indexar en FAISS o similares para recuperacion de secuencias CDS similares.
- Baseline en experimentos de representacion genomica: comparar contra variantes dim128 y dim512 para estudiar el efecto de la dimension de embedding.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos en FP32 (~2M parametros, ~8 MB de pesos); el cuello de botella es el batch y la longitud de secuencia, no el modelo.
- GPU recomendadas: cualquier GPU moderna; el modelo es tan pequeno que una GPU consumer de gama baja es suficiente. A100 o H100 no aportan ventaja significativa salvo por throughput en lotes grandes.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.). Tambien funciona en CPU.
- Opciones de despliegue: PyTorch nativo (carga via `torch.load`), con dependencia del paquete `gtembed` para las clases del modelo y `genomic-tokenizer` para el tokenizador. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un encoder de embeddings de este tamano).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beapen/genomic-cds-embedding-dim256-v1 | ~2M | 2048 tokens | 256 | Apache 2.0 | Hugging Face |
| beapen/genomic-cds-embedding-dim128 | ~1M | 2048 tokens | 128 | Apache 2.0 (presumible, misma familia) | Hugging Face |
| beapen/genomic-cds-embedding-dim512 | ~4M | 2048 tokens | 512 | Apache 2.0 (presumible, misma familia) | Hugging Face |

No se dispone en la informacion proporcionada de comparativas con modelos de embeddings genomicos de otros autores (por ejemplo, DNABERT, Nucleotide Transformer o HyenaDNA), por lo que no se incluyen datos de rendimiento frente a ellos.

## Limitaciones y advertencias

- Solo entrenado con genes codificantes de proteinas de GENCODE v50; no cubre regiones reguladoras ni secuencias no codificantes.
- Limitado a secuencias de hasta 2048 tokens (~6144 nucleotidos); secuencias mas largas deben truncarse o dividirse.
- Solo humano (ensamblado GRCh38); no se garantiza transferencia a otras especies.
- No incluye contexto genomico mas alla de la CDS (promotores, UTRs, intrones, elementos reguladores).
- Modelo en fase de investigacion: no validado clinicamente y no aprobado para uso en atencion al paciente ni diagnostico.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de embeddings poco informativos o sesgados por la distribucion del dataset de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor restringe explicitamente el uso clinico; conviene revisar implicaciones regulatorias antes de cualquier despliegue en salud.
- El modelo requiere el paquete `gtembed` para cargar las clases, lo que anade una dependencia no estandar fuera de Hugging Face Transformers.
- Repositorio con 0 descargas y 1 like en el momento de la consulta; madurez y soporte comunitario muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/beapen/genomic-cds-embedding-dim256-v1
- Repositorio gtembed: https://github.com/dermatologist/gtembed
- Genomic Tokenizer: https://github.com/dermatologist/genomic-tokenizer
- Proyecto DHTI: https://github.com/dermatologist/dhti
- Web del autor: https://nuchange.ca
