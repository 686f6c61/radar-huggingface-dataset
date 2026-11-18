# beapen/gt-embed-minimal-v1

## Resumen

GTEmbed minimal v1 es un modelo de embeddings especializado en secuencias codificantes de ADN (CDS, *coding DNA sequences*) humanas, desarrollado por Bell Eapen (beapen). Se trata de un transformer encoder de apenas ~2 millones de parametros que transforma secuencias de ADN codificante en vectores densos de 256 dimensiones, normalizados en L2, pensados para tareas de similitud, busqueda y agrupamiento de genes. Su rasgo diferenciador es el uso de un tokenizador genomico a nivel de codon (26 tokens) en lugar de tokenizacion por nucleotido, lo que alinea la representacion con la estructura proteica subyacente.

El modelo se entrena con aprendizaje contrastivo (instance discrimination) sobre aproximadamente 17.000 transcritos codificantes de proteinas extraidos de GENCODE v50 sobre el ensamblado GRCh38. Es la variante "minimal" de una familia de tres modelos (minimal, small y regular), concebida explicitamente para desarrollo, depuracion y pruebas rapidas, no para produccion ni uso clinico.

Su relevancia es acotada pero concreta: ofrece un punto de partida ligero (2M de parametros, contexto de 2048 tokens) para quien quiera experimentar con embeddings genomicos sin infraestructura pesada, y forma parte de un ecosistema mas amplio (tokenizador, repositorio `gtembed`) publicado por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (2 capas, 4 cabezas de atencion) |
| Parametros totales | ~2M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (~6144 nucleotidos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo genomico, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`) junto con `config.json` |
| Dimension oculta | 256 |
| Dimension de embedding | 256 (normalizado L2) |
| Vocabulario | 26 tokens (Genomic Tokenizer) |
| Objetivo de entrenamiento | Aprendizaje contrastivo (instance discrimination) |
| Framework | PyTorch 2.5.1 |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer encoder compacto de 2 capas y 4 cabezas de atencion, con tamano oculto de 256 y salida de embedding de 256 dimensiones normalizada en L2. La innovacion principal no reside en la arquitectura sino en la tokenizacion: el Genomic Tokenizer segmenta las secuencias de ADN a nivel de codon (grupos de 3 nucleotidos), de modo que cada token corresponde a un aminoacido o a un codon de parada. El vocabulario consta de 26 tokens: 6 especiales (`[CLS]`, `[SEP]`, `[BOS]`, `[MASK]`, `[PAD]`, `[UNK]`) y 20 codones de aminoacidos. Esto permite al modelo aprender representaciones a nivel de proteina codificada en lugar de a nivel de nucleotido individual.

El entrenamiento emplea aprendizaje contrastivo con objetivo de discriminacion de instancias sobre aproximadamente 17.000 transcritos codificantes de proteinas de GENCODE v50 (ensamblado GRCh38). El preprocesado incluye extraccion de CDS a partir de anotaciones GTF, reconstruccion de secuencias sobre el genoma GRCh38 y control de calidad con verificacion de codones de inicio y parada y validacion del marco de lectura. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla de GENCODE v50, ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo de embeddings).

## Capacidades

- Generacion de embeddings densos de 256 dimensiones para secuencias de ADN codificante humano, normalizados en L2.
- Similitud semantica entre secuencias CDS: comparacion mediante producto escalar o distancia coseno de los vectores resultantes.
- Agrupamiento y busqueda por similitud de genes o transcritos en espacios vectoriales.
- Procesamiento por lotes (*batch*) con padding y mascara de atencion.
- Tokenizacion a nivel de codon mediante el Genomic Tokenizer, alineada con la traduccion a proteina.
- Soporte de secuencias de hasta 2048 tokens (~6144 nucleotidos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- No dispone de capacidades multilingues, de vision ni de audio.

## Casos de uso

- Priorizacion de genes en diagnostico de enfermedades raras (como herramienta de investigacion): generar embeddings de transcritos candidatos y ordenar por similitud a genes ya asociados a una patologia, usando la ventana de 2048 tokens para cubrir CDS completos.
- Anotacion funcional de variantes noveles: comparar el embedding de una secuencia con variante frente al de la secuencia de referencia para detectar desviaciones en el espacio latente.
- Construccion de grafos de conocimiento gen-enfermedad: usar los embeddings como caracteristicas de nodos en un grafo, agrupando genes funcionalmente proximos mediante clustering sobre los vectores de 256 dimensiones.
- Busqueda de genes similares en bases de datos internas: indexar embeddings en un motor vectorial (FAISS, Chroma) para recuperacion por similitud a escala de miles de transcritos.
- Pruebas y depuracion de pipelines genomicos: al ser un modelo de ~2M de parametros, sirve para validar extremo a extremo un flujo de tokenizacion, inferencia y evaluacion antes de escalar a las variantes small o regular.
- Prototipado rapido de clasificadores downstream: congelar el encoder y entrenar una cabeza ligera (regresion logistica, MLP) sobre los embeddings para tareas de clasificacion de secuencias en experimentos academicos.
- Docencia y experimentacion con tokenizacion a nivel de codon: comparar el rendimiento de representaciones por codon frente a tokenizacion por nucleotido en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los ~2M de parametros; cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria (GTX 1650, RTX 3050, RTX 4090, A100, H100); no requiere hardware de gama alta.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas y en CPU.
- Opciones de despliegue: inferencia directa con PyTorch (`model.pt` + `config.json`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos generativos, no a este encoder).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Hidden size | Contexto | Uso previsto | Licencia |
|---|---|---|---|---|---|---|
| GTEmbed minimal v1 | ~2M | 2 | 256 | 2048 tokens | Desarrollo y pruebas | no disponible |
| GTEmbed small | ~10M | 4 | 512 | no disponible | Investigacion, tareas moderadas | no disponible |
| GTEmbed regular | ~50M | 12 | 768 | no disponible | Produccion, alta precision | no disponible |

Las tres variantes pertenecen a la misma familia del autor y comparten tokenizador y objetivo de entrenamiento; la comparativa con modelos de embeddings genomicos de terceros (por ejemplo, DNABERT o Nucleotide Transformer) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre genes codificantes de proteinas de GENCODE v50; no incluye regiones regulatorias ni secuencias no codificantes.
- Entrenado exclusivamente con genoma humano (GRCh38); no generaliza a otras especies sin validacion adicional.
- Longitud maxima de 2048 tokens (~6144 nucleotidos), lo que puede truncar transcritos largos.
- Variante minimal: el propio autor recomienda las variantes small o regular para produccion.
- No validado clinicamente y no aprobado para uso clinico; no debe emplearse en atencion al paciente ni en diagnostico.
- Riesgo de interpretaciones biologicas erroneas si no se verifican con datos experimentales.
- Posibles sesgos derivados de la composicion del dataset GENCODE y de la diversidad poblacional del genoma de referencia.
- La licencia no esta indicada en la informacion disponible, por lo que el uso comercial queda sin clarificar.
- No se documentan tipos de cuantizacion ni formatos alternativos a PyTorch, lo que limita opciones de optimizacion.
- Al ser un modelo de embeddings, no genera texto ni explica sus resultados; cualquier interpretacion biologica requiere analisis posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beapen/gt-embed-minimal-v1
- Repositorio GTEmbed: https://github.com/dermatologist/gtembed
- Genomic Tokenizer: https://github.com/dermatologist/genomic-tokenizer
- Web del autor: https://nuchange.ca
