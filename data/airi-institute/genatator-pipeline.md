# AIRI-Institute/genatator-pipeline

## Resumen

GENATATOR-PIPELINE es un pipeline de Hugging Face publicado por AIRI-Institute para la anotacion genica ab initio a partir de ADN genomico. Recibe un fichero FASTA, descubre intervalos candidatos de transcrito, asigna el tipo de transcrito, predice la estructura de exones y CDS, y escribe un fichero de anotacion en formato GFF3. Todo el flujo (descubrimiento de intervalos, clasificacion de tipo de transcrito, segmentacion, filtrado y generacion del GFF) se ejecuta en una unica llamada a `transformers.pipeline` con la tarea personalizada `genatator-pipeline`, y devuelve como salida una cadena de Python con la ruta al GFF generado.

Tecnicamente no es un unico modelo, sino una orquestacion de cuatro checkpoints auxiliares: dos de la familia ModernGena-base (etapas `edge` y `region`) y dos de la familia Caduceus-PS (etapas `transcript_type` y `segmentation`). Las etapas trabajan con ventanas de contexto muy distintas, desde 1024 tokens en `edge` hasta 250 000 tokens en `transcript_type` y `segmentation`, y el pipeline resuelve escalas mayores mediante fragmentacion con `interval_window_size` de 2 000 000 y `gene_finding_global_chunk_size` de 70 000 000.

Su relevancia practica esta en la anotacion ab initio de ensamblados sin anotacion previa y en la ejecucion distribuida: soporta una GPU, varias GPU en un nodo o varios nodos dentro de una asignacion Slurm, con reanudacion por defecto y checkpointing de hitos completados. Como contrapartidas, exige CUDA y float32 (no hay ejecucion en CPU de los modelos de etapa ni precision reducida), requiere `trust_remote_code=True` y no declara licencia en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de anotacion genica que orquesta cuatro modelos de lenguaje de ADN (dos de la familia ModernGena-base y dos de la familia Caduceus-PS); la model card no detalla la arquitectura interna de cada etapa |
| Parametros totales | no disponible (no se especifica el tamano de ninguna de las cuatro etapas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Por etapa: 1024 tokens (`edge`), 8192 (`region`), 250 000 (`transcript_type`) y 250 000 (`segmentation`). La segmentacion con RMT queda limitada a 1 en la configuracion por defecto |
| Tipos de cuantizacion | Solo float32; no se soportan modos de menor precision |
| Idiomas soportados | no disponible; no es un modelo de lenguaje natural, opera sobre secuencias de ADN y sus checkpoints se etiquetan como "multispecies" |
| Licencia | no disponible |
| Formato de pesos | no disponible; requiere `trust_remote_code=True` y descarga de checkpoints auxiliares desde el Hub |

Otros parametros relevantes declarados en la model card: `edge_average_token_length` y `region_average_token_length` de 9.0, `edge_max_genomic_chunk_ratio` y `region_max_genomic_chunk_ratio` de 1.5, `edge_gap_token_id` y `region_gap_token_id` de 5, tamanos de lote por defecto de 32 en las cuatro etapas, `prob_threshold` y `transcript_type_threshold` de 0.5 y `result_buffer_gib` de 1.0.

## Arquitectura y entrenamiento

El pipeline no entrena un modelo unico: coordina cuatro etapas de inferencia especializadas. Las etapas `edge` y `region` usan checkpoints `AIRI-Institute/genatator-moderngena-base-multispecies-edge-model` y `AIRI-Institute/genatator-moderngena-base-multispecies-region-model`; las etapas `transcript_type` y `segmentation` usan `AIRI-Institute/genatator-caduceus-ps-multispecies-transcript-type` y `AIRI-Institute/genatator-caduceus-ps-multispecies-segmentation`. La organizacion del calculo esta descrita en la model card: los workers de GPU procesan asignaciones de etapa por cromosoma, mientras que los procesos de CPU gestionan el flujo de anotacion de cada cromosoma; el preprocesado, la reconstruccion, el filtrado y la generacion del GFF se ejecutan en CPU.

La informacion disponible no incluye el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. Tampoco se detallan innovaciones de decodificacion o atencion mas alla de la configuracion de contexto por etapa. Si se describen los controles de inferencia que condicionan el resultado: uso de la hebra reversa complementaria en el descubrimiento de genes y en la clasificacion y segmentacion, filtros de empalme (`splice_filter`), deduplicacion, filtrado intronico, conservacion de la variante terminal mas larga y prediccion de estructura interna, ademas de parametros de filtrado por picos (`lp_frac`, `pk_prom`, `pk_dist`) y umbrales de fraccion cero.

## Capacidades

- Anotacion genica ab initio desde un FASTA de genoma, sin necesidad de anotacion previa ni evidencias externas.
- Descubrimiento de intervalos candidatos de transcrito a partir de la secuencia genomica.
- Clasificacion del tipo de transcrito (etapa `transcript_type`, con 250 000 tokens de contexto).
- Prediccion de estructura de exones y CDS, incluida la estructura interna, mediante la etapa de segmentacion.
- Generacion de un fichero de anotacion en formato GFF3 como salida final del pipeline.
- Ejecucion en una GPU, en varias GPU de un mismo nodo o en varios nodos bajo Slurm, con reparto de trabajo por cromosoma y etapa.
- Reanudacion de ejecuciones interrumpidas: `resume=True` por defecto y guardado de hitos completados en un directorio de checkpoints.
- Comparacion contra una anotacion de referencia mediante `reference_gff_path`.
- Uso de la hebra reversa complementaria en varias etapas para ampliar la deteccion en ambas orientaciones.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de lenguaje natural.

## Casos de uso

- Anotacion ab initio de genomas recien ensamblados: dado un ensamblado sin GFF de referencia, el pipeline produce un GFF3 con intervalos de transcrito, tipo y estructura de exones y CDS, lo que evita depender de transcriptomas o proteinas de especies cercanas.
- Anotacion a escala de genoma completo en cluster: con `interval_window_size` de 2 000 000 y `gene_finding_global_chunk_size` de 70 000 000, el trabajo se reparte por cromosoma entre varios procesos y se ejecuta en una asignacion Slurm de varios nodos, con `cpu_ram_limit_gib_per_node` ajustado al presupuesto disponible (100 GiB en el ejemplo de la model card).
- Anotacion comparativa multiespecie: los checkpoints se etiquetan como "multispecies", de modo que la misma configuracion puede aplicarse a distintos genomas para obtener anotaciones homologables entre especies y comparar despues la estructura genica.
- Reanotacion de ensamblados con recursos limitados de tiempo: al estar activada la reanudacion y el guardado de checkpoints, un proceso que se corte por timeout de worker (`worker_timeout_seconds`, 300 por defecto) puede retomarse sin recalcular las etapas ya completadas.
- Integracion en pipelines de bioinformatica: la llamada devuelve la ruta del GFF3, por lo que el pipeline se puede envolver en un script de Snakemake o Nextflow y encadenar con herramientas de evaluacion o de comparacion de anotaciones.
- Preanotacion para curacion manual: el GFF3 generado sirve como borrador sobre el que un anotador humano revisa empalmes y tipos de transcrito, aplicando los filtros de empalme, deduplicacion y filtrado intronico ya incluidos.
- Evaluacion de la calidad de anotacion frente a una referencia: usando `reference_gff_path` en la llamada se puede contrastar la salida del pipeline con una anotacion curada y usar los resumenes (`pipe.last_summary["complete"]` y `pipe.last_summary["totals"]`) para supervisar el progreso.
- Procesamiento por lotes de varios genomas con la misma configuracion: los argumentos de contexto, umbrales y lotes se fijan en la creacion del pipeline, lo que permite reutilizar una instancia para anotar varios FASTA de forma homogenea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud de anotacion (por ejemplo, sensibilidad y precision a nivel de exón, transcrito o CDS) ni comparaciones cuantitativas con otras herramientas. El unico indicio de evaluacion es la existencia de `reference_gff_path`, que permite contrastar la salida con una anotacion de referencia, pero no se aportan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declaran tamanos de parametros ni consumo de memoria por etapa; solo se especifica que la inferencia es en float32 y exclusivamente en CUDA.
- Ejecucion en GPU obligatoria para los modelos de etapa: no se soporta la ejecucion en CPU ni precisiones reducidas. Preprocesado, reconstruccion, filtrado y generacion del GFF si se ejecutan en CPU.
- Multi-GPU en un nodo mediante una lista `devices` (el ejemplo usa `devices=[0, 1, 2, 3]`), con indices referidos a `CUDA_VISIBLE_DEVICES`. La lista `devices` tiene prioridad sobre `device`.
- Multi-nodo mediante lanzamiento por linea de comandos de Slurm.
- Memoria de CPU configurable: `cpu_ram_limit_gib_per_node` (100 GiB en el ejemplo), deteccion automatica si se omite, `result_buffer_gib` de 1.0 por defecto y opciones de descarga a disco (`disk_offload_limit_gib_total`, `offload_dir`).
- No cabe en GPU de consumo de forma verificable: la model card no indica que se haya probado en RTX 4090 u otras GPU consumer, y exige CUDA con float32.
- Opciones de despliegue: `transformers.pipeline` con `trust_remote_code=True` y modelos descargados del Hub o desde un directorio local; ejecucion en Slurm para multi-nodo. No se mencionan vLLM, llama.cpp, Ollama, TGI ni formato GGUF, y no son aplicables a este tipo de pipeline.
- Latencia y throughput: no disponible. Solo se conocen los valores por defecto de paralelismo: tamanos de lote de 32 en las cuatro etapas, RMT de segmentacion limitado a 1, `edge_prefetch_chunks` de 1, `cpu_threads_per_worker` de 1 y `max_active_chromosomes_per_node` sin valor por defecto definido.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados ni especificaciones de otras herramientas de anotacion genica, por lo que no es posible establecer una comparacion con datos verificables. Como referencia interna del propio pipeline, las cuatro etapas se apoyan en estos checkpoints, que si aparecen nombrados en la model card:

| Componente | Checkpoint | Etapa | Contexto |
|---|---|---|---|
| Edge | AIRI-Institute/genatator-moderngena-base-multispecies-edge-model | Descubrimiento de limites/intervalos | 1024 |
| Region | AIRI-Institute/genatator-moderngena-base-multispecies-region-model | Descubrimiento de regiones | 8192 |
| Transcript type | AIRI-Institute/genatator-caduceus-ps-multispecies-transcript-type | Clasificacion de tipo de transcrito | 250 000 |
| Segmentation | AIRI-Institute/genatator-caduceus-ps-multispecies-segmentation | Segmentacion de exones y CDS | 250 000 |

## Limitaciones y advertencias

- Solo CUDA: no hay ejecucion en CPU de los modelos de etapa, lo que descarta entornos sin GPU dedicada.
- Solo float32: no se admiten cuantizacion ni precisiones reducidas, con el coste de memoria asociado.
- Licencia no declarada en los metadatos de Hugging Face, por lo que el uso comercial no puede darse por permitido sin consultar al autor.
- Requiere `trust_remote_code=True`, es decir, ejecucion de codigo personalizado del repositorio; conviene auditar ese codigo antes de desplegarlo en produccion.
- Obliga a usar el guard `if __name__ == "__main__":`, ya que los workers de GPU emplean procesos lanzados por spawn; ignorarlo provoca fallos en la ejecucion.
- Riesgo de error de anotacion: no se publican metricas de exactitud, de modo que la calidad del GFF3 no puede acotarse a priori y es recomendable validarlo contra una referencia cuando exista.
- La salida depende de umbrales configurables (`prob_threshold`, `transcript_type_threshold`, `zero_fraction_drop_threshold`) y de decisiones de filtrado que, mal ajustadas, pueden eliminar transcritos validos o mantener falsos positivos.
- Los parametros de memoria y almacenamiento pueden ser el cuello de botella en genomas grandes: hay limites explicitos de RAM por nodo y de descarga a disco, ademas de un buffer de resultados de 1.0 GiB.
- La segmentacion con RMT esta limitada a 1 por defecto, lo que restringe el paralelismo de esa etapa concreta.
- Los fallos de worker se gestionan con `max_task_retries=1` y `worker_timeout_seconds=300.0`; en hardware lento esto puede provocar reintentos y reprocesamiento.
- No es un modelo de lenguaje natural: no soporta idiomas, dialogo, tool calling ni generacion de texto; su ambito es exclusivamente genomico.
- Adopcion muy baja en el Hub en el momento de la consulta (24 descargas y 6 likes), lo que reduce la probabilidad de encontrar incidencias resueltas por terceros.
- La model card describe funciones y parametros que van mas alla del fragmento disponible, por lo que algunos extremos de configuracion no han podido verificarse aqui.

## Enlaces

- Hugging Face del pipeline: https://huggingface.co/AIRI-Institute/genatator-pipeline
- Etapa edge: https://huggingface.co/AIRI-Institute/genatator-moderngena-base-multispecies-edge-model
- Etapa region: https://huggingface.co/AIRI-Institute/genatator-moderngena-base-multispecies-region-model
- Etapa transcript type: https://huggingface.co/AIRI-Institute/genatator-caduceus-ps-multispecies-transcript-type
- Etapa segmentation: https://huggingface.co/AIRI-Institute/genatator-caduceus-ps-multispecies-segmentation
- Repositorio, paper, blog o demo del proyecto: no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados relacionados con el modelo ni con AIRI-Institute; los resultados obtenidos no guardan relacion con el contenido de esta ficha y se han descartado.
