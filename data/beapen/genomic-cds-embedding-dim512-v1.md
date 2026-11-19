# beapen/genomic-cds-embedding-dim512-v1

## Resumen

El modelo `beapen/genomic-cds-embedding-dim512-v1` es un codificador de embeddings especializado en secuencias de ADN codificante de proteínas (CDS, *coding DNA sequences*) humanas, desarrollado por Bell Eapen (beapen) en el marco del proyecto DHTI. Su funcion es transformar una secuencia CDS en un vector denso de 512 dimensiones, normalizado en L2, que puede emplearse para tareas de similitud, agrupamiento, recuperacion y anotacion funcional en bioinformatica y genomica computacional.

Tecnicamente se trata de un transformer encoder compacto de 4 capas y 8 cabezas de atencion, con tamano oculto de 512 y aproximadamente 10 millones de parametros, entrenado mediante aprendizaje contrastivo con discriminacion de instancias. Su rasgo diferencial es el uso del Genomic Tokenizer, un tokenizador que opera a nivel de codon (26 tokens: 20 aminoacidos mas tokens especiales), lo que comprime la representacion y permite que dimensiones de embedding reducidas sean competitivas.

El modelo se presenta como una variante de investigacion dentro de una familia (dim128, dim256 y dim512) y esta pensado para aplicaciones de investigacion y traslacionales, no para uso clinico. Su licencia Apache 2.0 y su reducido tamano (repo de 0,1 GB) lo hacen facil de desplegar en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (4 capas, 8 cabezas de atencion) |
| Parametros totales | ~10M (segun model card; la tabla de variantes indica ~4M para dim512) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (~6144 nucleotidos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma; el dominio real es secuencia genomica) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`) + `config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 4 capas y 8 cabezas de atencion con tamano oculto de 512, que produce un embedding de 512 dimensiones normalizado en L2. La entrada se procesa con el Genomic Tokenizer, que tokeniza a nivel de codon: cada token representa un triplete de nucleotidos que codifica un aminoacido, con un vocabulario total de 26 tokens (20 aminoacidos mas `[CLS]`, `[SEP]`, `[BOS]`, `[MASK]`, `[PAD]` y `[UNK]`). El objetivo de entrenamiento es aprendizaje contrastivo por discriminacion de instancias.

Los datos de entrenamiento proceden de GENCODE v50, restringidos a transcritos codificantes de proteinas humanos sobre el ensamblado GRCh38 (aproximadamente 17.000 transcritos). El preprocesado incluye extraccion de CDS desde anotaciones GTF, reconstruccion de secuencias a partir del genoma, y control de calidad con verificacion de codones de inicio y parada y validacion del marco de lectura. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO (no procede en un modelo de embeddings). La model card senala que la compresion biologica del tokenizador reduce la complejidad del espacio de representacion, de modo que dimensiones menores pueden superar a mayores; por ello la variante dim128 (~1M parametros) se marca como preferida.

## Capacidades

- Generacion de embeddings densos de 512 dimensiones, normalizados en L2, a partir de secuencias CDS.
- Procesamiento por lotes (*batch processing*) con padding y mascara de atencion.
- Representacion a nivel de codon, alineada con la traduccion a aminoacidos.
- Similitud semantica entre secuencias codificantes y agrupamiento de genes por funcion.
- Soporte de secuencias de hasta 2048 tokens (~6144 nucleotidos).
- Uso como extractor de caracteristicas en pipelines de aprendizaje automatico supervisado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de vision, audio ni modo de razonamiento extendido (*thinking mode*).
- Capacidad multilingue no aplicable: el modelo opera sobre secuencias genomicas, no sobre lenguaje natural.

## Casos de uso

- Priorizacion de genes en diagnostico de enfermedades raras (como herramienta de investigacion): el modelo genera embeddings de CDS de genes candidatos y permite ordenar por similitud con genes ya asociados a una patologia, apoyando la seleccion de variantes a validar.
- Anotacion funcional de variantes noveles: comparando el embedding de la secuencia CDS de referencia con el de la variante, se puede detectar desviacion funcional y priorizar variantes para estudio experimental.
- Descubrimiento de genes asociados a enfermedad en entornos de investigacion: agrupando embeddings de miles de transcritos se identifican clusters funcionales y genes proximos a dianas conocidas.
- Construccion de grafos de conocimiento gen-enfermedad: los embeddings sirven como nodos vectoriales para enlazar genes con fenotipos y literatura, facilitando busquedas por similitud.
- Busqueda y recuperacion de secuencias similares: indexando embeddings en una base vectorial se pueden recuperar CDS con perfil funcional parecido a una consulta, util en cribado de genomas.
- Extraccion de caracteristicas para modelos downstream: los vectores de 512 dimensiones alimentan clasificadores de patogenicidad, predictores de expresion o modelos de regresion entrenados con datos etiquetados.
- Analisis de similitud evolutiva a nivel de codon: al tokenizar por aminoacidos, el modelo captura relaciones proteicas que pueden emplearse en estudios comparativos entre isoformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa dado el tamano del modelo (~10M parametros, repo de 0,1 GB); en FP16 o INT8 el consumo es marginal.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: PyTorch nativo (carga via `hf_hub_download` y `torch.load`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de embeddings de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera inferencia en milisegundos por secuencia en GPU y en decenas o cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beapen/genomic-cds-embedding-dim512-v1 | ~10M (segun model card) | 2048 tokens | Transformer encoder + tokenizador de codones, contraste | Apache 2.0 | Hugging Face |
| beapen/genomic-cds-embedding-dim128-v1 | ~1M | 2048 tokens | Misma familia, variante preferida por eficiencia | Apache 2.0 | Hugging Face |
| beapen/genomic-cds-embedding-dim256-v1 | ~2M | 2048 tokens | Misma familia, orientada a investigacion | Apache 2.0 | Hugging Face |
| Modelos genomicos de lenguaje de gran escala (p. ej. DNABERT, Nucleotide Transformer) | no disponible en la informacion | no disponible | Tokenizacion a nivel de nucleotido o k-mer | variable | Hugging Face |

La comparacion con alternativas externas a la familia no puede completarse con datos verificados en la informacion disponible; se indica como no disponible.

## Limitaciones y advertencias

- Entrenado unicamente con genes codificantes de proteinas de GENCODE v50; no cubre regiones regulatorias ni secuencias no codificantes.
- Solo humano (ensamblado GRCh38); no se ha validado en otras especies.
- Longitud maxima de 2048 tokens (~6144 nucleotidos), lo que excluye CDS mas largos sin truncamiento.
- No validado clinicamente: no debe usarse para atencion al paciente ni diagnostico.
- Riesgo de sesgo derivado del conjunto de entrenamiento (GENCODE v50, un solo ensamblado y una sola especie).
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos en similitud y priorizacion de genes.
- La model card presenta una inconsistencia en el numero de parametros (~10M frente a ~4M en la tabla de variantes), que conviene verificar antes de dimensionar despliegues.
- La licencia Apache 2.0 permite uso comercial, pero el autor restringe el uso a investigacion y aplicaciones traslacionales y advierte de que no esta aprobado para uso clinico.
- Requiere el paquete `gtembed` (o copiar `model.py`) y `genomic-tokenizer` para cargar el modelo; no es compatible directamente con `transformers`.
- El modelo esta etiquetado con idioma `en`, lo que refleja la metainformacion de la model card y no una capacidad de lenguaje natural.

## Enlaces

- Hugging Face: https://huggingface.co/beapen/genomic-cds-embedding-dim512-v1
- Repositorio del proyecto: https://github.com/dermatologist/gtembed
- Tokenizador genomico: https://github.com/dermatologist/genomic-tokenizer
- Proyecto DHTI: https://github.com/dermatologist/dhti
- Web del autor: https://nuchange.ca
