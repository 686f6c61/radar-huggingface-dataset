# braindecode/cbramod-pretrained

## Resumen

CBraMod (pretrained) es un modelo de representacion para electroencefalografia (EEG) publicado por el ecosistema Braindecode, una caja de herramientas de codigo abierto en PyTorch para decodificar senales electrofisiologicas crudas (EEG, ECoG y MEG) con aprendizaje profundo. El modelo no es un modelo de lenguaje: es un extractor de caracteristicas auto-supervisado entrenado sobre el Temple University Hospital EEG Corpus (TUEG) mediante reconstruccion enmascarada de parches de senal, y se distribuye como pesos preentrenados listos para hacer *fine-tuning* en tareas *downstream* de decodificacion cerebral.

Su relevancia practica esta en que permite partir de representaciones genericas de EEG en lugar de entrenar desde cero con datasets pequenos y costosos de etiquetar. Con 4.924.000 parametros totales, es un modelo compacto que cabe holgadamente en cualquier GPU de consumo y que puede ejecutarse en CPU con latencia baja, lo que lo hace atractivo para investigacion clinica, BCI (interfaces cerebro-computador) y pipelines de neurotecnologia.

El modelo se integra en la libreria `braindecode` (version 2.0.0 o superior segun la documentacion publica del proyecto), se distribuye en formato safetensors y esta licenciado bajo BSD-3-Clause, lo que permite uso comercial con atribucion. La model card documenta explicitamente el dataset de preentrenamiento y advierte de solapamientos con subcorpus de TUEG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion por parches para EEG (segun el paper arXiv:2412.07236; detalles internos no disponibles en la model card) |
| Parametros totales | 4.924.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; entrada por muestras de 30 s, 19 canales, 200 Hz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (repo tambien compatible con `from_pretrained` de braindecode) |
| Modalidad | EEG (19 canales, 200 Hz) |
| Dataset de preentrenamiento | TUEG (TUH EEG Corpus) |
| Muestras de entrenamiento | 1.109.545 muestras (>9.000 h) tras limpieza |
| Libreria | braindecode |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

CBraMod es un modelo basado en transformer que opera sobre parches de senal EEG. El preentrenamiento sigue un esquema auto-supervisado de reconstruccion enmascarada de parches (*patch-based masked EEG reconstruction*): se enmascaran fragmentos de la senal de entrada y el modelo aprende a reconstruirlos, lo que fuerza al encoder a capturar dependencias temporales y espaciales entre canales sin necesidad de etiquetas. La entrada estandar es de 19 canales a 200 Hz con ventanas de 30 segundos.

El corpus de entrenamiento es el TUH EEG Corpus (TUEG), con 1.109.545 muestras tras limpieza, equivalentes a mas de 9.000 horas de registro. La model card advierte que TUEG contiene los subcorpus TUAB, TUEV, TUSZ, TUAR, TUSL y TUEP, y que el modelo principal no los elimina, por lo que evaluar en cualquiera de ellos no constituye una particion *held-out* limpia salvo que los autores lo hayan filtrado explicitamente. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion (no aplicables a un modelo de representacion). Los detalles exactos de la arquitectura interna (numero de capas, dimension del modelo, cabezas de atencion) no estan disponibles en la model card.

## Capacidades

- Extraccion de representaciones latentes de senales EEG crudas para tareas *downstream*.
- *Fine-tuning* supervisado para clasificacion de EEG (por ejemplo, deteccion de anomalias, estadiaje del sueno, deteccion de crisis epilepticas).
- Reconstruccion enmascarada de parches de senal (tarea de preentrenamiento, reutilizable como objetivo auxiliar).
- Procesamiento de entradas estandarizadas de 19 canales a 200 Hz con ventanas de 30 s.
- Extraccion de caracteristicas sin etiquetas para aprendizaje semi-supervisado o *transfer learning*.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- Capacidades multilingues: no aplicables.
- Capacidades especiales: ninguna documentada adicional (sin vision, audio ni modo *thinking*).

## Casos de uso

- Deteccion de crisis epilepticas: hacer *fine-tuning* sobre el encoder preentrenado con datos etiquetados de EEG para clasificar segmentos con y sin actividad epileptiforme; el preentrenamiento en mas de 9.000 h de TUEG aporta representaciones robustas incluso con pocas etiquetas.
- Estadiaje del sueno: usar las representaciones como entrada a un clasificador de fases del sueno (N1-N3, REM, vigilia) sobre registros de 19 canales, aprovechando la ventana de 30 s que coincide con la epoca estandar de scoring.
- Interfaces cerebro-computador (BCI): decodificar intenciones motoras o estados cognitivos en tiempo real; el tamano de 4,9 M de parametros permite inferencia de baja latencia en GPU de consumo o CPU.
- Monitorizacion clinica continua: extraer caracteristicas de EEG en unidades de cuidados intensivos para deteccion temprana de anomalias, con un coste computacional muy inferior al de entrenar un modelo desde cero.
- Investigacion en neurociencia: obtener *embeddings* de EEG para analisis de similitud entre sujetos, clustering de estados cerebrales o estudios de variabilidad inter-sujeto.
- *Transfer learning* entre corpus: preentrenar en TUEG y adaptar a otros datasets (por ejemplo, OpenNeuro o NEMAR) con pocas muestras etiquetadas, reduciendo el coste de anotacion clinica.
- *Benchmarking* metodologico: usar el modelo como linea base reproducible en comparaciones de arquitecturas de decodificacion EEG dentro del ecosistema Braindecode/MOABB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes (no aplicables), ni resultados de exactitud en tareas EEG *downstream* como TUAB o TUEV. Cualquier cifra de rendimiento debe consultarse en el paper original (arXiv:2412.07236) o en el repositorio del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (fp32) para 4,9 M de parametros; en fp16 aproximadamente 10 MB de pesos mas activaciones, holgadamente por debajo de 1 GB en la practica.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060, RTX 4090, A100 o H100 no aportan ventaja significativa por el tamano del modelo, salvo para *fine-tuning* con lotes grandes.
- Cabe en cualquier GPU de consumo e incluso en CPU; la latencia en CPU es viable para inferencia por lotes.
- Opciones de despliegue: libreria `braindecode` (integracion nativa via `from_pretrained`), PyTorch estandar; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (orientados a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CBraMod (braindecode/cbramod-pretrained) | 4,9 M | EEG (19 canales, 200 Hz) | Ventanas de 30 s | BSD-3-Clause | Hugging Face + braindecode |
| Otros modelos de representacion EEG preentrenados | no disponible | EEG | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables sobre alternativas comparables (parametros, contexto, rendimiento o licencia) dentro de la misma categoria de modelos de representacion EEG preentrenados. Se recomienda consultar el paper arXiv:2412.07236 para comparaciones con lineas base.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta agentes ni *tool calling*; cualquier uso en esos escenarios es inadecuado.
- La model card advierte que TUEG incluye los subcorpus TUAB, TUEV, TUSZ, TUAR, TUSL y TUEP, y que el modelo principal no los elimina; evaluar en esos subcorpus no constituye una particion *held-out* limpia y puede inflar metricas.
- La entrada esta fijada a 19 canales y 200 Hz con ventanas de 30 s; senales con otro montaje, frecuencia o duracion requieren remuestreo y adaptacion, con posible perdida de rendimiento.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenar sobre un corpus hospitalario (TUH), es plausible un sesgo hacia poblaciones clinicas y equipos de registro concretos, pero no se cuantifica.
- Riesgo de alucinacion: no aplicable en el sentido linguistico; en su lugar existe riesgo de sobreajuste a patrones del corpus y de falsos positivos en tareas clinicas, que deben validarse con datos externos.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribucion; es necesario citar Braindecode (doi:10.5281/zenodo.17699192), el modelo original y los datasets.
- Caveat para produccion: no se documentan cuantizaciones ni pipelines de despliegue estandar; la integracion depende de la version de `braindecode` y de PyTorch.
- El repo tiene 0,0 GB de tamano declarado, lo que sugiere pesos muy ligeros; verificar la integridad de los safetensors antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/braindecode/cbramod-pretrained
- Paper: https://arxiv.org/abs/2412.07236
- Repositorio original: https://github.com/wjq-learning/CBraMod
- Documentacion de Braindecode: https://braindecode.org/stable/index.html
- Referencia de API de Braindecode: https://braindecode.org/stable/api.html
- GitHub de Braindecode: https://github.com/braindecode
- Organizacion en Hugging Face: https://huggingface.co/braindecode
- Paquete PyPI: https://pypi.org/project/braindecode/
- Corpus TUH EEG: https://isip.piconepress.com/projects/nedc/html/tuh_eeg/
- NEMAR: https://nemar.org
- Cita de Braindecode: https://doi.org/10.5281/zenodo.17699192
