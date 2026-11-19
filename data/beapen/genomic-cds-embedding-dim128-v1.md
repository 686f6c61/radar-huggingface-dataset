# beapen/genomic-cds-embedding-dim128-v1

## Resumen

El modelo `beapen/genomic-cds-embedding-dim128-v1` es un codificador transformer de pequeno tamano disenado para generar embeddings densos de secuencias codificantes (CDS) de ADN humano. Lo desarrolla Bell Eapen (beapen) en el marco del proyecto DHTI y la libreria `gtembed`, y su objetivo es convertir secuencias de ADN codificante en vectores de 128 dimensiones utiles para tareas de bioinformatica como priorizacion de genes, anotacion funcional de variantes o construccion de grafos de conocimiento gen-enfermedad.

La peculiaridad tecnica del modelo es que no opera sobre nucleotidos individuales sino sobre codones: utiliza el Genomic Tokenizer, un vocabulario de solo 26 tokens (20 codones de aminoacido mas 6 tokens especiales), lo que comprime la secuencia en un factor de tres y reduce drasticamente la complejidad del espacio de representacion. Segun el autor, esa compresion biologica permite que una variante de solo ~1M de parametros y 128 dimensiones de embedding iguale o supere a variantes mayores (dim256 y dim512) en eficiencia.

Se trata de un modelo de investigacion, no validado clinicamente y explicitamente no apto para uso asistencial. Su relevancia actual es la de un componente ligero y desplegable en CPU para pipelines de genomica computacional, dentro de una familia de embeddings genomicos contrastivos de codigo abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Encoder (2 capas, 4 cabezas de atencion) |
| Parametros totales | ~1M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (~6144 nucleotidos) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt` de PyTorch; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (etiqueta de la model card; el dominio real es secuencia genomica, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`) + `config.json` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de 2 capas y 4 cabezas de atencion con tamano oculto de 256 y una cabeza de proyeccion que produce embeddings L2-normalizados de 128 dimensiones. La entrada pasa por el Genomic Tokenizer, que tokeniza a nivel de codon: cada token representa un triplete de nucleotidos que codifica uno de los 20 aminoacidos, mas tokens especiales `[CLS]`, `[SEP]`, `[BOS]`, `[MASK]`, `[PAD]` y `[UNK]`. El vocabulario total es de 26 tokens.

El entrenamiento se realizo con un objetivo de aprendizaje contrastivo (instance discrimination) sobre secuencias CDS humanas: GENCODE v50, ensamblado GRCh38, con aproximadamente 17.000 transcritos codificantes de proteina. El preprocesado incluyo extraccion de CDS desde anotaciones GTF, reconstruccion de secuencias sobre el genoma GRCh38 y control de calidad con verificacion de codones de inicio/parada y validacion del marco de lectura. No se documentan fases de RLHF ni DPO, lo cual es coherente con un modelo de embeddings y no generativo. La innovacion principal es el uso del tokenizador a nivel de codon, que segun el autor reduce la complejidad del espacio de representacion y permite que dimensiones menores rindan igual o mejor.

## Capacidades

- Generacion de embeddings densos de 128 dimensiones, L2-normalizados, para secuencias CDS de ADN.
- Procesamiento por lotes con `padding` y `attention_mask` para multiples secuencias simultaneas.
- Representacion a nivel de codon (compresion 3:1 respecto a la secuencia de nucleotidos).
- Soporte de secuencias de hasta 2048 tokens (~6144 nucleotidos).
- Uso como extractor de caracteristicas para similitud entre secuencias, clustering y busqueda vectorial.
- No es un modelo generativo: no produce texto, codigo ni respuestas.
- No dispone de tool calling, function calling ni capacidades de agente.
- Capacidades multilingues: no aplicables; el dominio es secuencia genomica humana.
- No incluye vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Priorizacion de genes en diagnostico de enfermedades raras (herramienta de investigacion): se generan embeddings de los CDS candidatos y se calcula similitud coseno contra genes de referencia conocidos para ordenar candidatos antes de validacion experimental.
- Anotacion funcional de variantes noveles: se embebe la secuencia CDS con la variante y se compara con la version de referencia para detectar desplazamientos en el espacio de embeddings que sugieran cambio funcional.
- Construccion de grafos de conocimiento gen-enfermedad: los embeddings sirven como nodos vectoriales en un grafo donde las aristas se derivan de similitud entre CDS, facilitando la recuperacion de genes relacionados.
- Busqueda de secuencias similares a escala: al ser un modelo de ~1M de parametros con salida de 128 dimensiones, el indice vectorial resultante es compacto y permite busquedas por similitud sobre miles de transcritos con poco coste de almacenamiento.
- Clustering no supervisado de transcritos codificantes: agrupar familias de genes o transcritos con patrones de codificacion similares para analisis exploratorio en genomica comparativa dentro de la especie humana.
- Componente en pipelines de machine learning downstream: usar los embeddings como features de entrada para clasificadores de patogenicidad o modelos de prediccion de expresion, sustituyendo codificaciones one-hot de nucleotidos por representaciones comprimidas.
- Despliegue en entornos con recursos limitados: inferencia en CPU para laboratorios sin GPU, gracias al reducido tamano del modelo y del vocabulario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo (~1M de parametros) y el vocabulario de 26 tokens ocupan pocos MB en memoria.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutar la inferencia.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (libreria `pytorch`), con dependencia del paquete `genomic-tokenizer` y de las clases del paquete `gtembed`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| beapen/genomic-cds-embedding-dim128-v1 | ~1M | 2048 tokens | 128 dim | Apache 2.0 | Hugging Face |
| beapen/genomic-cds-embedding-dim256-v1 | ~2M | 2048 tokens | 256 dim | Apache 2.0 (presumible, misma familia) | Hugging Face |
| beapen/genomic-cds-embedding-dim512-v1 | ~4M | 2048 tokens | 512 dim | Apache 2.0 (presumible, misma familia) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre variantes ni frente a otros modelos genomicos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo entrenado con genes codificantes de proteina de GENCODE v50; no cubre regiones no codificantes, intrones ni ARN no codificante.
- Limitado a secuencias de hasta 2048 tokens (~6144 nucleotidos); secuencias CDS mas largas quedan truncadas.
- Solo especie humana (GRCh38); no se garantiza transferencia a otras especies.
- No validado clinicamente y explicitamente no aprobado para uso asistencial ni diagnostico.
- Riesgo de sesgo derivado del conjunto de entrenamiento (GENCODE v50), que puede infrarrepresentar ciertas familias genicas o variantes.
- Al ser un modelo de embeddings, no genera texto; no debe evaluarse con criterios de alucinacion generativa, pero sus similitudes pueden no reflejar relaciones biologicas reales sin validacion experimental.
- La licencia Apache 2.0 permite uso comercial, pero el autor restringe el uso clinico por ausencia de validacion.
- Dependencia de paquetes externos (`genomic-tokenizer`, `gtembed`) para cargar el modelo; el repositorio tiene 0.0 GB reportados, lo que sugiere que los pesos pueden no estar disponibles publicamente en el momento de la consulta.
- Sin pipeline declarado en Hugging Face, lo que complica la integracion automatica con herramientas estandar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beapen/genomic-cds-embedding-dim128-v1
- Repositorio gtembed: https://github.com/dermatologist/gtembed
- Genomic Tokenizer: https://github.com/dermatologist/genomic-tokenizer
- Proyecto DHTI: https://github.com/dermatologist/dhti
- Web del autor: https://nuchange.ca
