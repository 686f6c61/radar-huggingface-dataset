# EvoLenTokenizer/evolen-200k-sft-checkpoints

## Resumen

EvoLen-200K SFT checkpoints es un conjunto de 56 modelos de clasificacion de secuencias de ADN, obtenidos por fine-tuning del modelo pretrained EvoLen en su paso 200.000. El tokenizador EvoLen, presentado en COLM 2026 (arXiv:2604.08698), combina estratificacion evolutiva con decodificacion sensible a la longitud: particiona el genoma por conservacion phyloP y entrena un BPE sobre esas particiones. El modelo base es len2_5120, un transformer estilo BERT con vocabulario de 5120 tokens.

Cada checkpoint corresponde a una de las 56 tareas downstream organizadas en cinco suites (GBM, GUE, NT, multi-ATAC y multi-SCREEN) e incluye pesos, configuracion, tokenizador y argumentos de entrenamiento completos. La licencia MIT permite uso comercial sin restricciones. El repositorio ocupa 20,2 GB, unos 360 MB por checkpoint.

La relevancia actual radica en que aborda un problema clasico de los modelos de lenguaje genomicos: la tokenizacion de ADN. EvoLen propone una tokenizacion guiada por evolucion que mejora la clasificacion de elementos regulatorios y modificaciones de histonas frente a tokenizadores convencionales, y estos checkpoints permiten reproducir los resultados reportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo BERT (base len2_5120) con cabeza de clasificacion de secuencias |
| Parametros totales | no disponible (repositorio de 20,2 GB con 56 checkpoints, ~360 MB cada uno) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 20 a 512 tokens segun tarea (model_max_length por tarea, no deducible del nombre) |
| Tipos de cuantizacion | no disponible (entrenamiento en fp16; pesos guardados en safetensors) |
| Idiomas soportados | no aplica (secuencias de ADN, no lenguaje humano) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es len2_5120, un transformer estilo BERT con vocabulario de 5120 tokens, entrenado con el tokenizador EvoLen. EvoLen es un tokenizador de ADN que combina estratificacion evolutiva con decodificacion sensible a la longitud: particiona el genoma por conservacion phyloP y entrena un BPE sobre esas particiones. El pretrained EvoLen se entreno hasta el paso 200.000, y de ahi se produjeron los checkpoints SFT.

El fine-tuning se realizo por tarea, con 56 tareas en cinco suites: GBM (clasificacion codificante vs intergenica), GUE (elementos regulatorios y modificaciones de histonas), NT (modificaciones de histonas como H3K27ac), multi-ATAC (cromatina accesible) y multi-SCREEN (elementos reguladores). Cada ejecucion uso validacion por epoca, seleccionando el checkpoint con mejor F1 de validacion y evaluandolo despues en test. El entrenamiento uso fp16, batch de evaluacion de 128 y model_max_length entre 20 y 512 segun tarea. Los argumentos de entrenamiento completos se guardan en training_args.bin dentro de cada checkpoint.

Una particularidad metodologica: los checkpoints se seleccionaron por F1 de validacion pero se reporta MCC, y la seleccion de hiperparametros se hizo sobre el MCC de test, por lo que los valores reportados son una cota superior, no una estimacion insesgada.

## Capacidades

- Clasificacion de secuencias de ADN en 56 tareas genomicas.
- Prediccion de modificaciones de histonas (H3K4me1, H3K27ac, etc.).
- Clasificacion de secuencias codificantes frente a intergenicas (suite GBM).
- Analisis de accesibilidad de cromatina (suite multi-ATAC).
- Identificacion de elementos reguladores: enhancers, promotores, CTCF (suite multi-SCREEN).
- Clasificacion de especies a partir de secuencias (humano vs raton en multi-ATAC).
- No soporta generacion de texto, tool calling ni agentes: es exclusivamente un clasificador.

## Casos de uso

- Anotacion genomica automatizada: clasificar secuencias intergenicas para identificar elementos reguladores candidatos en genomas recien ensamblados, usando los checkpoints de GUE o multi-SCREEN.
- Prediccion de modificaciones de histonas: los checkpoints de NT (H3K27ac) y GUE (H3K4me1) permiten predecir marcas epigeneticas a partir de secuencia, util en estudios de regulacion genica sin datos de ChIP-seq.
- Filtrado de regiones codificantes: el checkpoint GBM/demo_coding_vs_intergenomic_seqs distingue secuencias codificantes de intergenicas, util para pipelines de prediccion de genes.
- Analisis de cromatina accesible: los checkpoints multi-ATAC clasifican regiones accesibles y diferencian especies, aplicable a estudios comparativos de regulacion.
- Priorizacion de variantes regulatorias: clasificar secuencias alrededor de variantes para estimar su impacto en elementos reguladores, usando multi-SCREEN.
- Reproduccion de resultados publicados: los checkpoints permiten reproducir los MCC reportados en el paper de EvoLen, con las condiciones de evaluacion documentadas (fp16, batch 128, model_max_length por tarea).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la metrica reportada es el coeficiente de correlacion de Matthews (MCC) sobre el conjunto de test, pero no se incluyen los valores numericos por tarea. Se menciona que evaluar en fp32 en lugar de fp16 desplaza el MCC en ~3e-4, y que seleccionar por MCC en lugar de F1 mejoraria el MCC medio en ~0,2.

## Requisitos de hardware

- Cada checkpoint pesa ~360 MB en safetensors, por lo que la inferencia es viable en GPUs de consumo con 4-8 GB de VRAM.
- No se requiere GPU de datacenter para inferencia; el entrenamiento original pudo requerir hardware mayor, pero no se documenta.
- Despliegue compatible con la libreria transformers (AutoModelForSequenceClassification) y con endpoints compatibles (tag endpoints_compatible).
- La evaluacion requiere fp16 autocast y batch de 128 para reproducir los numeros reportados.
- No se documentan latencias ni throughput especificos.

## Comparativa con modelos similares

| Modelo | Checkpoints | Tokenizador | Seleccion de checkpoints | Licencia |
|---|---|---|---|---|
| EvoLen-200K SFT (este) | 56 tareas | EvoLen (merge-len2, vocab 5120) | Mejor F1 validacion, MCC reportado | MIT |
| base-200k-sft-checkpoints | 28 tareas con coincidencia exacta | Base (len2) | Identico al anterior | MIT |
| evolen-200k (pretrained) | 0 (modelo base) | EvoLen | No aplica | MIT |

La variante base-200k-sft-checkpoints usa el tokenizador base en lugar de EvoLen y reproduce exactamente 28 de las 56 tareas con los mismos hiperparametros, lo que permite aislar el efecto del tokenizador. No se dispone de datos de otros modelos de ADN comparables (p. ej., DNABERT o Nucleotide Transformer) en la informacion proporcionada.

## Limitaciones y advertencias

- Los valores reportados son una cota superior: la seleccion de hiperparametros se hizo sobre el MCC de test, no sobre validacion.
- Los checkpoints se seleccionaron por F1 de validacion, no por MCC; seleccionar por MCC daria ~0,2 mas de MCC medio.
- El entrenamiento en fp16 es no deterministico: reentrenar desde el modelo base no reproduce los numeros exactos.
- model_max_length varia entre 20 y 512 segun tarea y no es deducible del nombre de la tarea; hay que leerlo de training_args.bin.
- La evaluacion en fp32 en lugar de fp16 desplaza el MCC en ~3e-4.
- Es un modelo de clasificacion de ADN, no un LLM generativo: no sirve para generacion de texto, codigo ni agentes.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace; es un modelo reciente (creado en julio de 2026) sin validacion comunitaria amplia.
- No se documentan sesgos especificos, pero al entrenarse con genomas de referencia (humano, raton) puede tener sesgos hacia esas especies.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EvoLenTokenizer/evolen-200k-sft-checkpoints
- Modelo pretrained: https://huggingface.co/EvoLenTokenizer/evolen-200k
- Variante base: https://huggingface.co/EvoLenTokenizer/base-200k-sft-checkpoints
- Modelo base len2_5120: https://huggingface.co/mtapiapacheco/len2_5120
- Codigo en GitHub: https://github.com/HN020719/EvoLen
- Preprint arXiv: arXiv:2604.08698
