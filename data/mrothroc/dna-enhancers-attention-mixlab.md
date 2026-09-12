# mrothroc/dna-enhancers-attention-mixlab

## Resumen

`mrothroc/dna-enhancers-attention-mixlab` es un modelo de lenguaje de ADN de tipo GPT (transformer causal) con 14,4 millones de parametros, desarrollado por el autor independiente mrothroc y entrenado con la herramienta `mixlab` sobre un unico Mac con Apple Silicon. No es un modelo de lenguaje natural: su vocabulario consta de 9 tokens (A, C, G, T, N mas BOS, EOS, PAD y MASK) y su tarea de preentrenamiento es la prediccion del siguiente nucleotido sobre el genoma humano de referencia GRCh38 (cromosomas 1-3).

El proposito declarado del modelo es servir de *backbone* reutilizable: se carga con `transformers` como un `GPT2LMHeadModel` estandar y se le anade una cabeza de clasificacion para tareas genomicas concretas. En el benchmark `human_enhancers_cohn`, un clasificador afinado sobre este backbone alcanza 0,717 de exactitud y 0,799 de AUROC, por encima del baseline CNN del propio benchmark (aproximadamente 0,69-0,70).

Su relevancia actual es metodologica: es la linea base de atencion de una comparativa controlada frente a su companero `mrothroc/dna-enhancers-mamba3-mixlab`, de identico tamano y presupuesto de entrenamiento pero con el bloque mixer sustituido por Mamba-3 canonico, que obtiene 0,728. La diferencia entre ambos modelos se reduce a un bloque de un fichero de configuracion JSON, lo que convierte al par en un experimento reproducible de comparacion de arquitecturas en genomica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo GPT-2 (8 capas de atencion causal `plain`), exportado como `GPT2LMHeadModel` |
| Parametros totales | 14.400.000 (14,4 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 nucleotidos (`seq_len` 512) |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; el autor no distribuye versiones GGUF, int8 ni otras) |
| Idiomas soportados | No disponible / no aplica: no procesa lenguaje natural; vocabulario de 9 tokens de ADN (A/C/G/T/N + BOS/EOS/PAD/MASK) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamano del repositorio: 0,1 GB) |

Detalles adicionales de tokenizacion: `model_dim` 384, BOS = 1, EOS = 2, PAD = 0 y los nucleotidos A/C/G/T/N se corresponden con los identificadores 4/5/6/7/8 respectivamente.

## Arquitectura y entrenamiento

El modelo es un transformer causal estandar de 8 capas con atencion `plain` (sin variantes dispersas ni aproximaciones lineales), dimension de modelo 384 y ventana de 512 tokens. El autor lo describe explicitamente como una pila GPT clasica y lo exporta como `GPT2LMHeadModel` nativo, de modo que se carga con `transformers` sin necesidad de `trust_remote_code`. La innovacion no esta en el bloque de atencion, sino en la infraestructura que lo entrena y en el papel que desempena como baseline de una comparativa de mixers.

El preentrenamiento se realizo con el objetivo de prediccion del siguiente nucleotido (*next-base*) sobre los cromosomas 1-3 de GRCh38 tratados como un flujo continuo de nucleotidos, durante 20.000 pasos y con aumento de datos por complemento reverso (*reverse-complement augmentation*). La perdida de validacion reportada es 1,08. Todo el entrenamiento se ejecuto en un unico Mac con Apple Silicon usando `mixlab`, una herramienta escrita en Go por el propio autor. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion, algo coherente con un modelo de secuencias biologicas en lugar de lenguaje natural.

## Capacidades

- Modelado generativo de secuencias de ADN: genera cadenas de nucleotidos autorregresivamente a partir del token BOS.
- Extraccion de representaciones internas para tareas downstream: al ser un backbone, sus estados ocultos pueden alimentar cabezas de clasificacion o regresion.
- Clasificacion de secuencias genomicas tras *fine-tuning*: `AutoModelForSequenceClassification` sobre el backbone afinado alcanza 0,717 de exactitud y 0,799 de AUROC en `human_enhancers_cohn`.
- Prediccion de probabilidad de nucleotido (*masked-style scoring* mediante evaluacion de la verosimilitud de cada base), util para puntuar variantes.
- Aumento de datos: generacion de secuencias sinteticas plausibles y aplicacion de complemento reverso.
- Soporte de *tool calling* / *function calling*: no disponible; no aplica a un modelo de secuencias de ADN.
- Soporte de agentes y razonamiento multi-paso: no disponible; no aplica.
- Capacidades multilingues: no aplica (no procesa lenguaje natural).
- Capacidades especiales: ninguna de tipo *thinking mode*, vision o audio. La unica particularidad funcional es el vocabulario de 9 tokens y el contexto fijo de 512 bases.

## Casos de uso

- Clasificacion de enhancers y promotores: se anade una cabeza de clasificacion al backbone y se afina sobre conjuntos etiquetados; el propio autor valida esta via con `human_enhancers_cohn` (0,717 de exactitud).
- Priorizacion de variantes no codificantes: puntuar el cambio de verosimilitud de la secuencia alrededor de una variante permite ordenar candidatos en estudios de asociacion (GWAS) antes de validacion experimental.
- Anotacion funcional de regiones genomicas: usar los estados ocultos del modelo como caracteristicas para predecir accesibilidad de cromatina o sitios de union de factores de transcripcion, reutilizando el backbone sin reentrenarlo desde cero.
- Aumento de datos en pipelines de genomica: generar secuencias sinteticas con la misma composicion estadistica que GRCh38 para ampliar conjuntos de entrenamiento pequenos, combinando generacion directa y complemento reverso.
- Investigacion comparativa de arquitecturas: emplearlo como baseline de atencion frente al companero Mamba-3 (0,728), ya que ambos comparten tamano, presupuesto y datos, y la unica diferencia es la configuracion del mixer.
- Prototipado y docencia en hardware de consumo: con 14,4 M de parametros y 512 bases de contexto, el modelo se entrena y ejecuta en un portatil o en una CPU domestica, lo que permite reproducir el experimento completo con el cuaderno `genomics-mamba` del autor.
- Filtrado rapido en pipelines de secuenciacion: puntuar fragmentos de 512 bases para descartar o priorizar lecturas antes de etapas de analisis mas costosas.

## Benchmarks y rendimiento

| Benchmark | Tarea | Metrica | Resultado |
|---|---|---|---|
| `human_enhancers_cohn` | Clasificacion de enhancers (clasificador afinado sobre el backbone) | Exactitud | 0,717 |
| `human_enhancers_cohn` | Clasificacion de enhancers (clasificador afinado sobre el backbone) | AUROC | 0,799 |
| `human_enhancers_cohn` | Baseline CNN del benchmark | Exactitud | ~0,69-0,70 |
| `human_enhancers_cohn` | `mrothroc/dna-enhancers-mamba3-mixlab` (mismo tamano y presupuesto) | Exactitud | 0,728 |
| GRCh38, cromosomas 1-3 | Prediccion del siguiente nucleotido (preentrenamiento) | Perdida de validacion | 1,08 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje natural, algo esperable dado que el modelo no procesa texto.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los pesos ocupan aproximadamente 58 MB; en fp16/bf16, unos 29 MB; en int8, unos 15 MB. Cualquier acelerador con memoria disponible superior a esas cifras es suficiente.
- GPU recomendadas: no hay requisitos practicos. Funciona en cualquier GPU consumer (serie RTX 20xx o superior), en GPUs integradas y en CPU. No se necesita A100 ni H100.
- Compatibilidad con GPU de consumo: si, de forma holgada; el modelo cabe incluso en dispositivos tipo Raspberry Pi o en el Neural Engine de un Mac Apple Silicon, que es donde fue entrenado.
- Opciones de despliegue: `transformers` nativo (`AutoModelForCausalLM` y `AutoModelForSequenceClassification`), con el repositorio etiquetado como `text-generation-inference` y `endpoints_compatible`; tambien es posible convertirlo a GGUF para llama.cpp u Ollama, aunque el autor no publica esas conversiones.
- Latencia y throughput: no disponible. No se publican cifras de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Exactitud en `human_enhancers_cohn` | Licencia |
|---|---|---|---|---|---|
| `mrothroc/dna-enhancers-attention-mixlab` | 14,4 M | 512 | Atencion causal estilo GPT-2 | 0,717 | MIT |
| `mrothroc/dna-enhancers-mamba3-mixlab` | Mismo tamano y presupuesto (segun el autor) | 512 (segun configuracion compartida) | Mamba-3 canonico | 0,728 | No disponible |
| CNN baseline del benchmark `human_enhancers_cohn` | No disponible | No aplica | Red convolucional | ~0,69-0,70 | No disponible |

Existen otras familias de modelos de lenguaje de ADN con las que este backbone es conceptualmente comparable (por ejemplo, modelos basados en BERT preentrenados en genoma humano o arquitecturas de estado recurrente de contexto largo), pero la informacion proporcionada no incluye sus parametros, contexto, licencia ni resultados, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- No es un clasificador listo para usar: requiere anadir una cabeza y afinar sobre datos etiquetados del dominio concreto. Su uso directo como generador produce secuencias de ADN sin validacion biologica.
- Cobertura parcial del genoma: el preentrenamiento se limita a los cromosomas 1-3 de GRCh38, por lo que regiones ausentes de esos cromosomas estan peor representadas.
- Contexto corto: 512 nucleotidos. Tareas que requieran decenas de miles de bases (elementos reguladores distales, estructura de dominios topologicos) no pueden abordarse sin estrategias de ventana o agregacion.
- Riesgo de generacion no plausible: igual que un modelo de lenguaje alucina texto, este modelo puede producir secuencias de ADN que no correspondan a patrones genomicos reales. Cualquier secuencia generada debe validarse experimentalmente antes de usarse.
- Sesgo del genoma de referencia: GRCh38 es una referencia compuesta que no representa la diversidad poblacional humana, de modo que las predicciones pueden degradarse en individuos con variantes estructurales o haplotipos poco representados.
- Vocabulario sin ambiguedades extendidas: solo contempla A, C, G, T y N; no cubre codigos IUPAC adicionales ni bases modificadas.
- Licencia permisiva: MIT, sin restricciones para uso comercial ni requisito de atribucion mas alla del aviso de copyright habitual.
- Adopcion muy baja: 17 descargas y 0 interacciones en HuggingFace, sin validacion independiente por parte de terceros.
- Documentacion solo en ingles y ausencia de model card traducida; ademas no se publican cifras de latencia, throughput ni versiones cuantizadas.
- Rendimiento inferior a su companero Mamba-3 (0,717 frente a 0,728) dentro del mismo experimento controlado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrothroc/dna-enhancers-attention-mixlab
- Modelo companero con Mamba-3: https://huggingface.co/mrothroc/dna-enhancers-mamba3-mixlab
- Repositorio de `mixlab`: https://github.com/mrothroc/mixlab
- Cuaderno de reproducibilidad (genomics-mamba): https://github.com/mrothroc/mixlab-cookbook/tree/main/genomics-mamba
- Articulo del autor sobre el diseno de mixlab: https://michael.roth.rocks/blog/mixlab/
- Genomic Benchmarks (Gresova, K. et al., BMC Genomic Data 2023, 24, 25): doi:10.1186/s12863-023-01123-8
- GRCh38 y UCSC Genome Browser (Kent, W. J. et al., Genome Research 2002, 12(6), 996-1006): doi:10.1101/gr.229102
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados (Avanza, Finansavisen, WielerFlits) no guardan relacion con el contenido de la ficha.
