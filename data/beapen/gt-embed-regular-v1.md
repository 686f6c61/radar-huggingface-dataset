# beapen/gt-embed-regular-v1

## Resumen

GT-Embed Regular v1 es un modelo de embeddings genomicos desarrollado por Bell Eapen (usuario beapen) para generar representaciones vectoriales densas de secuencias de ADN codificante de proteinas (CDS, coding sequences) humanas. A diferencia de los modelos de lenguaje de proposito general, este modelo no genera texto: su unica funcion es transformar una secuencia de ADN en un vector de 768 dimensiones normalizado en L2, apto para tareas de similitud, agrupamiento y recuperacion semantica en bioinformatica.

El modelo emplea una arquitectura transformer encoder de 12 capas y 12 cabezas de atencion, con un tamano oculto de 768 dimensiones y aproximadamente 50 millones de parametros. Se entrena mediante aprendizaje contrastivo (instance discrimination) sobre unas 17.000 transcripciones codificantes de proteinas del ensamblado genomico humano GRCh38, anotadas en GENCODE v50. Su innovacion principal es el uso del Genomic Tokenizer, que tokeniza el ADN a nivel de codon (triplete de nucleotidos) en lugar de nucleotide individual, con un vocabulario de solo 26 tokens.

La relevancia actual del modelo radica en su enfoque de tokenizacion biologica: al operar sobre codones que codifican aminoacidos, el modelo aprende representaciones alineadas con la estructura proteica, lo que puede mejorar la deteccion de relaciones funcionales entre genes frente a aproximaciones basadas en k-mers o nucleotidos. Forma parte de una familia de tres variantes (Minimal, Small y Regular) y se distribuye con licencia Apache 2.0, lo que facilita su uso en investigacion y en desarrollos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (12 capas, 12 cabezas de atencion) |
| Parametros totales | ~50M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (~6144 nucleotidos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de la model card; el modelo opera sobre secuencias de ADN, no sobre lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`) + `config.json` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 12 capas con 12 cabezas de atencion, tamano oculto de 768 dimensiones y una dimension de embedding de salida tambien de 768, normalizada en L2. La entrada se tokeniza con el Genomic Tokenizer, que divide la secuencia CDS en codones y los mapea a un vocabulario de 26 tokens: 6 tokens especiales (`[CLS]`, `[SEP]`, `[BOS]`, `[MASK]`, `[PAD]`, `[UNK]`) y 20 codones correspondientes a aminoacidos. La longitud maxima de secuencia es de 2048 tokens, equivalentes a unos 6144 nucleotidos.

El entrenamiento utiliza aprendizaje contrastivo con objetivo de discriminacion de instancias sobre el dataset GENCODE v50 de secuencias CDS codificantes de proteinas humanas (ensamblado GRCh38, aproximadamente 17.000 transcripciones). El preprocesamiento incluye extraccion de CDS a partir de anotaciones GTF, reconstruccion de secuencias desde el genoma de referencia y control de calidad con verificacion de codones de inicio y parada y validacion del marco de lectura. No se documentan en la informacion disponible detalles sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de embeddings densos de 768 dimensiones, normalizados en L2, para secuencias de ADN codificante de proteinas.
- Tokenizacion a nivel de codon mediante el Genomic Tokenizer, que captura la estructura aminoacidica de la secuencia.
- Procesamiento por lotes (batch) de multiples secuencias con padding y mascara de atencion.
- Calculo de similitud semantica entre secuencias CDS mediante distancia coseno o producto escalar de embeddings.
- Soporte de secuencias de hasta 2048 tokens (~6144 nucleotidos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente de representacion (embedding).
- No dispone de capacidades de vision, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Priorizacion de genes en diagnostico de enfermedades raras (como herramienta de investigacion): el modelo genera embeddings de CDS que permiten calcular similitud funcional entre genes candidatos y genes ya asociados a fenotipos, ordenando candidatos para su validacion experimental.
- Anotacion funcional de variantes noveles: comparando el embedding de la secuencia CDS de referencia con el de la secuencia portadora de la variante, se puede cuantificar el desplazamiento en el espacio de representacion como senal de posible impacto funcional.
- Descubrimiento de genes asociados a enfermedad en entornos de investigacion: agrupando embeddings de transcriptos se pueden identificar clusters de genes con patrones codificantes similares y priorizar dianas.
- Construccion de grafos de conocimiento gen-enfermedad: los embeddings sirven como caracteristicas de nodos en modelos de aprendizaje automatico que enlazan genes con fenotipos y enfermedades.
- Busqueda y recuperacion de secuencias similares: indexando embeddings en una base vectorial (por ejemplo, FAISS) se puede recuperar rapidamente el conjunto de CDS mas proximos a una consulta, util en analisis de homologia a gran escala.
- Agrupamiento no supervisado de transcriptos: clustering de embeddings para explorar familias genicas o funciones compartidas sin depender de alineamientos multiples.
- Extraccion de caracteristicas para modelos downstream: usar los embeddings como entrada de clasificadores o regresores en tareas de prediccion de expresion, localizacion subcelular o patogenicidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~50M parametros, los pesos en precision FP32 ocupan aproximadamente 200 MB; en FP16 unos 100 MB. La VRAM total necesaria para inferencia con lotes pequenos se situa por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Se puede ejecutar en RTX 3060, RTX 4090, A100, H100 o incluso en CPU para lotes pequenos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: el modelo se carga con PyTorch puro (`torch.load` + clases del paquete `gtembed`). No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el reducido tamano, se espera un throughput alto en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GT-Embed Regular v1 | ~50M | 2048 tokens (~6144 nt) | Embedding de CDS (codon) | Apache 2.0 | Hugging Face |
| GT-Embed Small | ~10M | no disponible | Embedding de CDS (codon) | Apache 2.0 | Hugging Face |
| GT-Embed Minimal | ~2M | no disponible | Embedding de CDS (codon) | Apache 2.0 | Hugging Face |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos de terceros (como Nucleotide Transformer, DNABERT o HyenaDNA) que permitan una comparacion cuantitativa fiable. La comparativa se limita, por tanto, a las variantes de la propia familia GT-Embed.

## Limitaciones y advertencias

- Los datos de entrenamiento solo incluyen genes codificantes de proteinas de GENCODE v50; el modelo no ha visto regiones regulatorias ni secuencias no codificantes.
- La longitud de secuencia esta limitada a 2048 tokens (~6144 nucleotidos), lo que excluye CDS muy largas o contextos genomicos extensos.
- El modelo es exclusivo para humano (ensamblado GRCh38); no se ha entrenado con secuencias de otras especies.
- No esta validado clinicamente y no debe usarse para atencion al paciente ni diagnostico clinico; su uso previsto es la investigacion y aplicaciones traslacionales.
- Riesgo de interpretacion biologica erronea: las similitudes en el espacio de embeddings no equivalen a evidencia funcional y deben verificarse con datos experimentales.
- No se documentan sesgos especificos, pero al derivarse de un unico ensamblado y anotacion (GENCODE v50 / GRCh38) puede heredar sesgos de cobertura y anotacion del dataset.
- La licencia Apache 2.0 permite uso comercial, pero el autor restringe explicitamente el uso clinico y exige verificar las interpretaciones biologicas con datos experimentales.
- La carga del modelo requiere el paquete `gtembed` (no incluido en el repositorio de Hugging Face) o copiar manualmente las clases del modelo, lo que anade friccion de integracion.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que no existe validacion comunitaria amplia documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beapen/gt-embed-regular-v1
- Repositorio del pipeline GTEmbed: https://github.com/dermatologist/gtembed
- Genomic Tokenizer: https://github.com/dermatologist/genomic-tokenizer
- Web del autor: https://nuchange.ca
