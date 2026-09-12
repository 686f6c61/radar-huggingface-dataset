# mrothroc/dna-enhancers-mamba3-mixlab

## Resumen

dna-enhancers-mamba3-mixlab es un modelo de lenguaje de ADN de 14,34 millones de parametros desarrollado por mrothroc (Michael Roth), construido sobre la arquitectura Mamba-3 y entrenado con la herramienta mixlab en un unico Mac con chip de Apple. Se trata de un backbone preentrenado con prediccion del siguiente nucleotido sobre el genoma humano de referencia (GRCh38), pensado como punto de partida reutilizable: el usuario lo carga, le anade una cabeza de clasificacion y lo ajusta fino para su propia tarea genomica.

La relevancia del modelo es metodologica mas que de rendimiento absoluto. El autor demuestra que un selective-scan state-space model real (Mamba-3), con actualizacion de estado compleja, formulacion MIMO de B y C y recurrencia exponencial-trapezoidal, entrenado solo con los cromosomas 1 a 3 y en hardware de consumo, alcanza 0,728 de exactitud y 0,811 de AUROC en el benchmark `human_enhancers_cohn` de Genomic Benchmarks, por delante de un modelo de atencion del mismo tamano (0,717) y de la CNN de referencia del benchmark (~0,69-0,70).

El repositorio es pequeno (0,1 GB), esta publicado bajo licencia MIT y exporta codigo personalizado, por lo que requiere `trust_remote_code=True` al cargarlo. Con 15 descargas y 0 likes en el momento de redactar esta ficha, se trata de un artefacto de investigacion y divulgacion, no de un modelo con adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 6 bloques `mamba3-canonical` (selective-scan SSM con estado de valor complejo, formulacion MIMO de B/C y recurrencia exponencial-trapezoidal) intercalados con 6 bloques SwiGLU; model_dim 384 |
| Parametros totales | 14.348.352 (~14,34 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (seq_len de entrenamiento) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados ni GGUF) |
| Idiomas soportados | No aplica: modelo de secuencias de ADN, no de lenguaje natural. Vocabulario de 9 tokens (A/C/G/T/N mas BOS/EOS/PAD/MASK) |
| Licencia | MIT |
| Formato de pesos | safetensors con codigo personalizado (`trust_remote_code=True`) |
| Dimension del embedding | 384 |
| Vocabulario | 9 tokens; ids BOS=1, EOS=2, PAD=0, A/C/G/T/N = 4/5/6/7/8 |
| Pipeline declarado | feature-extraction |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer hibrido sin atencion: la mezcla de informacion entre posiciones la realiza un selective-scan state-space model. Concretamente, seis bloques `mamba3-canonical` se intercalan con seis bloques SwiGLU, con una dimension de modelo de 384 y una longitud de secuencia de 512. Mamba-3, descrito por Lahoti et al. (ICLR 2026, arXiv:2603.15569), introduce tres cambios respecto a Mamba: una actualizacion de estado con valores complejos, una formulacion multi-entrada multi-salida (MIMO) de las matrices B y C, y una recurrencia exponencial-trapezoidal. La ventaja estructural del SSM es su coste lineal en la longitud de secuencia, en contraste con el coste cuadratico de la atencion.

El preentrenamiento se hizo con objetivo de prediccion del siguiente nucleotido sobre los cromosomas 1, 2 y 3 de GRCh38, tratados como un flujo continuo de aproximadamente 562 millones de tokens, durante 20.000 pasos y con augmentacion por complemento reverso. La perdida de validacion final fue de 1,13. No se documentan en la informacion disponible fases de RLHF, DPO ni ajuste por instrucciones: es un modelo base sin alineacion, y el pipeline declarado es de extraccion de caracteristicas.

La innovacion destacable no esta en el modelo en si, sino en el flujo de trabajo: el autor senala que cambiar el mixer (atencion por Mamba) en mixlab es una edicion de configuracion, no codigo de modelo nuevo, lo que permite reproducir un baseline de atencion del mismo tamano y mejorarlo dentro del mismo framework.

## Capacidades

- Prediccion del siguiente nucleotido sobre secuencias de ADN (salida de logits sobre el vocabulario de 9 tokens).
- Extraccion de representaciones: `model(input_ids=ids).last_hidden_state` devuelve estados ocultos de dimension 384 por posicion, aptos para alimentar cabezas de clasificacion o modelos posteriores.
- Ajuste fino supervisado para clasificacion de secuencias con `AutoModelForSequenceClassification` o con el entrenamiento nativo de mixlab.
- Manejo del vocabulario genomico basico, incluida la base ambigua N, ademas de tokens estructurales BOS, EOS, PAD y MASK.
- Augmentacion por complemento reverso durante el preentrenamiento, lo que aporta cierta invariancia a la hebra.
- Capacidades que no posee: no hay tool calling, no hay function calling, no hay comportamiento agentico, no hay razonamiento multi-paso, no hay modo de pensamiento, no hay vision ni audio y no hay capacidades multilingues en el sentido convencional.
- No se documenta ninguna capacidad de generacion condicionada por instrucciones ni de dialogo.

## Casos de uso

- Clasificacion de enhancers y elementos reguladores: el caso de uso validado por el propio autor. Se anade una cabeza de clasificacion binaria al backbone y se ajusta fino sobre conjuntos etiquetados como `human_enhancers_cohn`, alcanzando 0,728 de exactitud y 0,811 de AUROC. El backbone ya ha aprendido sintaxis genomica local en los cromosomas 1-3, de modo que el ajuste fino converge con pocos datos etiquetados.
- Anotacion funcional de variantes: ajustar un clasificador sobre variantes etiquetadas (por ejemplo, conjuntos derivados de ClinVar o de ensayos de actividad regulatoria) para priorizar variantes candidatas antes de una validacion experimental. La ventana de 512 nucleotidos es adecuada para capturar el contexto inmediato de una variante.
- Extraccion de embeddings para pipelines aguas abajo: al declarar el pipeline `feature-extraction`, los estados ocultos de 384 dimensiones pueden congelarse y usarse como caracteristicas en clasificadores clasicos (regresion logistica, gradient boosting) cuando no se dispone de datos suficientes para un ajuste fino completo.
- Prediccion de accesibilidad de cromatina y senales epigeneticas: entrenar cabezas de regresion o clasificacion sobre datos de ATAC-seq o DNase-seq para predecir regiones abiertas a partir unicamente de la secuencia primaria.
- Prediccion de sitios de union de factores de transcripcion: ajuste fino con picos de ChIP-seq como etiquetas positivas, aprovechando que el coste lineal del SSM permite procesar ventanas de 512 pb con un presupuesto de computo muy bajo.
- Investigacion sobre eficiencia de arquitecturas: usar mixlab para comparar SSM y atencion bajo el mismo harness de datos y de entrenamiento, partiendo de este modelo y de su equivalente de atencion, lo que aisla el efecto del mixer del resto de decisiones de diseno.
- Prototipado y docencia en hardware de consumo: reproducir el pipeline completo, del baseline al modelo Mamba, en un portatil con chip de Apple, sin GPU dedicada ni acceso a clúster. Es un escenario realista para cursos de bioinformatica o de arquitecturas de secuencia.
- Evaluacion comparativa de modelos genomicos con recursos limitados: servir de referencia de bajo coste frente a modelos preentrenados en el genoma completo, para decidir si merece la pena escalar antes de invertir en infraestructura.

## Benchmarks y rendimiento

Los unicos datos publicados proceden de la model card del autor. Corresponden a un clasificador ajustado fino sobre el backbone, no al backbone sin ajustar.

| Benchmark | Metrica | Este modelo (Mamba-3) | Baseline de atencion, mismo tamano | CNN de referencia del benchmark |
|---|---|---|---|---|
| human_enhancers_cohn | Accuracy | 0,728 | 0,717 | ~0,69-0,70 |
| human_enhancers_cohn | AUROC | 0,811 | no disponible | no disponible |
| Preentrenamiento (GRCh38, chr1-3) | Perdida de validacion (prediccion de siguiente base) | 1,13 | no disponible | no aplica |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje general, y no tendria sentido aplicarlos a un modelo de secuencias de ADN. No se dispone de resultados en otros conjuntos de Genomic Benchmarks distintos de `human_enhancers_cohn`.

## Requisitos de hardware

- Huella de memoria de los pesos: aproximadamente 57 MB en fp32, 29 MB en fp16 o bf16 y 14 MB en int8. Son cifras solo de parametros, sin activaciones ni estado del optimizador.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050 Ti, RTX 3060, RTX 4090 y superiores. Tambien cabe comodamente en CPU y en memoria unificada de Apple silicon.
- GPU recomendadas: no se requiere ninguna GPU dedicada. El autor entreno el modelo base en un Mac con chip de Apple. Para ajuste fino a mayor escala, una RTX 3060 de 12 GB o superior es mas que suficiente.
- El cuello de botella real es la longitud de secuencia (512) y el tamano de lote, no la memoria de los pesos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via documentada. No se publican pesos en GGUF, por lo que llama.cpp u Ollama no son aplicables sin una conversion previa. El soporte en vLLM, TGI u otros servidores de inferencia no esta documentado y, al tratarse de codigo personalizado, requeriria trabajo de integracion.
- Latencia y throughput: no disponible. Dado el tamano del modelo y el coste lineal del SSM respecto a la longitud de secuencia, se espera una inferencia muy rapida en cualquier hardware moderno, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en human_enhancers_cohn | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dna-enhancers-mamba3-mixlab (este modelo) | 14,34 M | 512 | 0,728 (clasificador ajustado) | MIT | HuggingFace, codigo personalizado |
| dna-enhancers-attention-mixlab (baseline del autor) | Mismo tamano segun la model card | no disponible | 0,717 (clasificador ajustado) | no disponible | HuggingFace |
| CNN de referencia de Genomic Benchmarks | no disponible | no disponible | ~0,69-0,70 | no disponible | Genomic Benchmarks |
| Nucleotide Transformer (InstaDeep), DNABERT-2, HyenaDNA | no disponible | no disponible | no disponible | no disponible | HuggingFace y repositorios propios |

Los tres ultimos modelos se citan por pertenecer a la misma categoria de modelos de lenguaje de ADN preentrenados, pero en la informacion disponible no hay cifras que permitan una comparacion cuantitativa con ellos. El propio autor advierte que este modelo no es un resultado estado del arte: su aportacion es mostrar que un SSM de 14,34 M entrenado en un portatil con tres cromosomas es competitivo frente a modelos preentrenados en el genoma completo de mayor tamano, y que cambiar el mixer es una edicion de configuracion en mixlab.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineacion. Cualquier tarea concreta exige ajuste fino supervisado; no responde a prompts ni a preguntas en lenguaje natural.
- Rendimiento modesto en terminos absolutos: 0,728 de exactitud en una tarea de clasificacion binaria. El propio autor lo describe como un modelo para aprender y construir encima, no como un resultado estado del arte.
- Preentrenado unicamente con los cromosomas 1, 2 y 3 de GRCh38. La generalizacion al resto del genoma, a genomas de otras especies o a secuencias con composicion atipica (regiones repetitivas, centromeros, telomeros) no esta caracterizada y es un riesgo real.
- Contexto muy corto (512 nucleotidos). No puede modelar interacciones regulatorias de largo alcance (enhancer-promotor a decenas o cientos de kilobases), que son precisamente las mas relevantes en regulacion genica.
- Uso clinico o diagnostico: no apto. No hay validacion clinica, ni calibracion de la incertidumbre, ni evaluacion fuera de distribucion sobre cohortes reales.
- Riesgo de generar secuencias plausibles pero no reales: en la prediccion de siguiente base, el modelo puede producir secuencias con aspecto genomico verosimil que no corresponden a ninguna secuencia biologica. Cualquier resultado debe validarse experimentalmente o contra anotaciones de referencia.
- Sesgos: la model card no documenta ningun analisis de sesgos. El genoma de referencia GRCh38 es un ensamblaje con limitaciones conocidas en regiones complejas y su representacion poblacional no es uniforme, lo que puede heredarse en las representaciones aprendidas.
- Licencia MIT: permite uso comercial y modificacion sin restricciones practicas, pero no ofrece garantias. El codigo personalizado exige `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar dicho codigo antes de desplegarlo.
- Escaso soporte comunitario: 15 descargas y 0 likes en el momento de redactar la ficha, sin issues ni contribuciones externas documentadas. No hay versiones cuantizadas, ni pesos GGUF, ni integracion con servidores de inferencia estandar.
- Los identificadores de token deben respetarse exactamente (BOS=1, EOS=2, PAD=0, A/C/G/T/N = 4/5/6/7/8); un mapeo incorrecto invalida silenciosamente los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrothroc/dna-enhancers-mamba3-mixlab
- Baseline de atencion del mismo tamano: https://huggingface.co/mrothroc/dna-enhancers-attention-mixlab
- Repositorio de mixlab: https://github.com/mrothroc/mixlab
- Cookbook de mixlab, receta de genomica con Mamba: https://github.com/mrothroc/mixlab-cookbook/tree/main/genomics-mamba
- Entrada de blog del autor, "I Built an ML Architecture Lab in Go": https://michael.roth.rocks/blog/mixlab/
- Paper de Mamba-3: Lahoti, A.; Li, K. Y.; Chen, B.; Wang, C.; Bick, A.; Kolter, J. Z.; Dao, T.; Gu, A. "Mamba-3: Improved Sequence Modeling using State Space Principles." ICLR 2026. arXiv:2603.15569
- Paper fundacional de Mamba: Gu, A.; Dao, T. "Mamba: Linear-Time Sequence Modeling with Selective State Spaces." 2023. arXiv:2312.00752
- Genomic Benchmarks: Gresova, K. et al. "Genomic benchmarks: a collection of datasets for genomic sequence classification." BMC Genomic Data 2023, 24, 25. doi:10.1186/s12863-023-01123-8
- Genoma de referencia GRCh38 (Genome Reference Consortium) via UCSC: Kent, W. J. et al. "The Human Genome Browser at UCSC." Genome Research 2002, 12 (6), 996-1006. doi:10.1101/gr.229102
