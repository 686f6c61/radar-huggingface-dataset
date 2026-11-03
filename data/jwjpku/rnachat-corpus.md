# JWJPKU/RNAChat-corpus

## Resumen

RNAChat-corpus es un corpus de datos, no un modelo de lenguaje. Lo publica el usuario JWJPKU en Hugging Face y su finalidad es entrenar RNAChat-v7, un sistema de generacion de secuencias de ARN a partir de instrucciones en lenguaje natural (text-to-RNA). Cada fila del corpus empareja una peticion en chino o en ingles con una secuencia de ARN y con la condicion estructurada a partir de la cual se genero la frase (por ejemplo, semilla de miRNA, familia Rfam, brazo de la estructura, subtipo, longitud en nucleotidos o contenido GC).

El repositorio ocupa 1,4 GB y contiene 1.298.904 filas de entrenamiento, 104.812 de validacion y 105.703 de prueba en formato JSONL comprimido con gzip, ademas de un almacen de secuencias tokenizadas en el que cada base ocupa un byte (A/C/G/U mapeadas mediante `tt_common.ID_TO_BASE`). Las clases de ARN cubiertas son mRNA (1.097.942 filas), miRNA (49.768), ncRNA_other (92.453), tRNA (22.957), snRNA (16.829), snoRNA (14.924) y rRNA (4.031).

Su relevancia actual reside en que aborda un cuello de botella poco cubierto por los corpus generalistas: la alineacion entre lenguaje natural y secuencias biologicas con condiciones estructurales explicitas, con particiones disenadas para evitar fuga de datos (por familia Rfam en el caso de ncRNA). No se dispone de informacion sobre arquitectura, parametros ni contexto, porque el artefacto publicado es exclusivamente el conjunto de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un corpus de datos, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | other (el autor la describe como marcador de posicion; hay que verificar los terminos de cada fuente) |
| Formato de pesos | no aplica; datos en JSONL.gz y almacen binario tokenizado (`seq_tokens.u8`, `seq_index.npz`, `rows_{train,val,test}.npz`, `text_*.bin`) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal; define el esquema de datos y el almacen tokenizado que consume el codigo de entrenamiento de RNAChat-v7. El diseno separa la secuencia del texto: los ficheros `corpus/{train,val,test}.jsonl.gz` no contienen la secuencia, sino un puntero `seq_ref`, y las secuencias residen en `store/` con un byte por base. Los campos por fila son `rna_class`, `species`, `condition`, `content`, `lang`, `prompt_type`, `rna_id`, `seq_ref`, `split`, `weight` y `meta`.

Las fuentes declaradas son RNAcentral, Rfam 15.1, miRBase (a traves de RNAcentral), NCBI GeneRIF, resumenes de EuropePMC (muestreados) y anotaciones de transcritos de humano y otras especies. Parte de las frases son parafrasis generadas con Qwen2.5-7B-Instruct sobre plantillas. La particion se hace por clase segun la unidad de fuga descrita en `docs/RNA通用Schema_v2.md`; en ncRNA la unidad es la familia Rfam. El repositorio incluye `eval/eval_{val,test}.jsonl.gz` con metadatos de evaluacion (fila, clase, condicion, frase) usados por los scripts t04-t09, y `eval/store_report.json` con estadisticas del almacen tokenizado.

## Capacidades

- Generacion condicionada de secuencias de ARN a partir de texto en chino o ingles, para siete clases: mRNA, miRNA, ncRNA_other, tRNA, snRNA, snoRNA y rRNA.
- Control mediante condiciones estructuradas explicitas: `seed`, `family`, `arm`, `subtype`, `length_nt`, `gc`, `species` y `kind`.
- Cobertura multilingue limitada a dos idiomas (zh, en), con campo `lang` por fila para filtrar o estratificar.
- Diferenciacion por tipo de prompt (`prompt_type`), lo que permite entrenar y evaluar variantes de instruccion sobre la misma secuencia.
- Ponderacion por fila (`weight`) para remuestreo o ajuste de la contribucion de cada ejemplo durante el entrenamiento.
- Particiones train/val/test predefinidas y metadatos de evaluacion listos para consumo por scripts.
- Capacidades de tool calling, agentes, vision o audio: no disponibles (no aplica a un corpus).

## Casos de uso

- Entrenamiento de un modelo text-to-RNA: el corpus proporciona pares instruccion-secuencia con condicion estructurada, lo que permite entrenar un decoder que genere la secuencia a partir de la peticion y de los atributos deseados (por ejemplo, "genera un miRNA con esta semilla y este contenido GC").
- Evaluacion controlada por familia: gracias a la particion por familia Rfam en ncRNA, se puede medir la generalizacion a familias no vistas y detectar si el modelo memoriza en lugar de aprender el mapeo instruccion-secuencia.
- Filtrado y diseno de candidatos de miRNA: usando las filas de la clase miRNA (49.768) con condiciones `seed` y `family`, se puede entrenar un generador de candidatos que luego se valide in silico antes de sintesis.
- Aumento de datos con parafrasis controlada: el campo `prompt_type` y las parafrasis con Qwen2.5-7B-Instruct permiten estudiar la robustez del modelo frente a reformulaciones de la misma peticion.
- Analisis de sesgo por especie y clase: la estratificacion por `species` y `rna_class` permite construir subconjuntos balanceados y medir el rendimiento diferencial entre mRNA (clase mayoritaria, 1.097.942 filas) y clases minoritarias como rRNA (4.031 filas).
- Investigacion en representacion de secuencias biologicas: el almacen `seq_tokens.u8` con un byte por base y el mapeo A/C/G/U facilita la carga eficiente en pipelines de PyTorch o JAX sin depender de tokenizadores de texto.
- Reproducibilidad de experimentos: los ficheros de evaluacion y `store_report.json` permiten replicar las condiciones exactas de los scripts t04-t09 y comparar resultados entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM de inferencia de un modelo: el artefacto es un corpus de 1,4 GB comprimido.
- Espacio en disco: prever varios GB para la descompresion de los JSONL y para el almacen tokenizado (`seq_tokens.u8` ocupa un byte por base, por lo que el total depende de la suma de longitudes de todas las secuencias).
- Memoria RAM: suficiente para cargar por lotes los ficheros JSONL y el almacen mapeado en memoria; no se dispone de cifras de pico medidas.
- GPU: no requerida para el consumo del corpus; el entrenamiento de RNAChat-v7 si requerira GPU, pero no se dispone de datos sobre el modelo.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no consumen este artefacto). El acceso se hace mediante el codigo del autor (`tt_data.py`, clase `Store`, y `tt_common.ID_TO_BASE`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Corpus | Contenido | Idiomas | Filas (train/val/test) | Licencia | Formato |
|---|---|---|---|---|---|
| RNAChat-corpus | Instruccion + secuencia de ARN + condicion estructurada, 7 clases | zh, en | 1.298.904 / 104.812 / 105.703 | other (marcador de posicion) | JSONL.gz + almacen binario |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre corpus comparables de text-to-RNA en la documentacion proporcionada.

## Limitaciones y advertencias

- La licencia `other` es, segun el propio autor, un marcador de posicion: es imprescindible revisar los terminos de RNAcentral, Rfam 15.1, miRBase, NCBI GeneRIF y EuropePMC antes de cualquier uso, y especialmente antes de uso comercial.
- El autor advierte explicitamente de que hay que comprobar los terminos de cada fuente antes de hacer publico el repositorio; la redistribucion del corpus puede estar restringida por las licencias de origen.
- Parte de las frases son parafrasis generadas por un LLM (Qwen2.5-7B-Instruct) sobre plantillas, lo que puede introducir artefactos estilisticos o imprecisiones semanticas respecto a la condicion original.
- Fuerte desbalanceo de clases: mRNA concentra el 84,5 % de las filas de entrenamiento, mientras que rRNA representa el 0,31 %; el rendimiento en clases minoritarias puede degradarse sin remuestreo o ponderacion.
- Cobertura linguistica limitada a chino e ingles; no hay soporte de castellano ni de otras lenguas.
- Los ficheros `corpus/*.jsonl.gz` no contienen secuencias: cualquier uso requiere resolver `seq_ref` contra `store/`, lo que anade complejidad de integracion y dependencia del codigo del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la calidad o consistencia de los datos.
- No se dispone de informacion sobre sesgos biologicos, cobertura taxonomica detallada ni tasas de error en las condiciones estructuradas.
- Al ser un corpus y no un modelo, no procede hablar de alucinacion del artefacto; el riesgo equivalente es la presencia de etiquetas o secuencias incorrectas que se propaguen al modelo entrenado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JWJPKU/RNAChat-corpus
- Modelo entrenado con este corpus (referenciado en la model card): https://huggingface.co/JWJPKU/RNAChat-v7
- Documentacion interna del repositorio: `docs/语料清单.md` (lista de fuentes con URL), `docs/RNA通用Schema_v2.md` (esquema y unidad de fuga)
- Codigo de lectura del almacen: `tt_data.py` (clase `Store`), `tt_common.ID_TO_BASE`
- Fuentes de datos citadas: RNAcentral, Rfam 15.1, miRBase, NCBI GeneRIF, EuropePMC
