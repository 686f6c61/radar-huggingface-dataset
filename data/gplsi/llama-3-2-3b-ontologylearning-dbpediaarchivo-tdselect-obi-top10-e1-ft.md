# gplsi/Llama-3.2-3B-OntologyLearning-DBpediaArchivo-TDSelect-OBI-Top10-e1-ft

## Resumen

El modelo `gplsi/Llama-3.2-3B-OntologyLearning-DBpediaArchivo-TDSelect-OBI-Top10-e1-ft` es un ajuste fino (fine-tuning) del modelo base Llama 3.2 de 3.000 millones de parametros, publicado por el grupo de investigacion GPLSI. Por la nomenclatura del identificador, el entrenamiento se ha orientado a una tarea muy concreta de ingenieria ontologica: la seleccion de terminos (TDSelect) y la extraccion de axiomas de ontologia (OBI) a partir de la ontologia DBpedia Archivo, con un top-10 de candidatos y una epoca de entrenamiento (e1).

Se trata, por tanto, de un modelo especializado y de nicho, no de un modelo de proposito general. Su relevancia es limitada fuera del ambito de la construccion y enriquecimiento automatico de ontologias y grafos de conocimiento, donde puede emplearse como componente de un pipeline de aprendizaje de ontologias (ontology learning) a partir de texto.

La informacion publicada por el autor es minima: la model card no incluye descripcion, datos de entrenamiento, hiperparametros ni resultados de evaluacion. Los datos tecnicos disponibles se reducen a los metadatos del repositorio de Hugging Face y al recuento real de parametros en los ficheros safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), ajuste fino supervisado |
| Parametros totales | 3.212.755.968 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 3B soporta 128.000 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 3B, un transformer decoder-only denso con atencion por grupos (GQA) y tokenizador BPE de la familia Llama 3. El ajuste fino se ha realizado sobre la tarea de seleccion de terminos para aprendizaje de ontologias (TDSelect) y extraccion de axiomas (OBI), usando la ontologia DBpedia Archivo como fuente de referencia. El sufijo `Top10` sugiere que el modelo se entrena para elegir entre los 10 mejores candidatos, y `e1` indica una sola epoca de entrenamiento.

No se dispone de informacion publica sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). Tampoco se detalla si el ajuste fue supervisado clasico (SFT) o con tecnicas de preferencia; por la naturaleza de la tarea, lo mas probable es un SFT sobre pares entrada-salida de seleccion de terminos.

## Capacidades

- Generacion de texto y clasificacion de candidatos en el dominio de ontologias y terminologia.
- Seleccion de terminos (term selection) a partir de listas de candidatos top-10 para la construccion de ontologias.
- Extraccion de axiomas de ontologia (OBI) a partir de texto de entrada.
- Razonamiento de un solo paso orientado a tareas de ingenieria del conocimiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se especifican idiomas en la model card).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Construccion automatica de ontologias a partir de corpus textuales: el modelo puede usarse como selector de terminos en un pipeline de ontology learning, eligiendo los candidatos mas relevantes de una lista top-10 para poblar clases y relaciones.
- Enriquecimiento de grafos de conocimiento: integrado en un proceso que propone axiomas OBI a partir de descripciones textuales, reduciendo el trabajo manual de los ingenieros ontologicos.
- Curacion de taxonomias en dominios verticales: seleccion de terminos candidatos para taxonomias sectoriales (salud, legal, industria) a partir de vocabularios controlados.
- Asistencia a la documentacion semantica: generacion de candidatos de axiomas para revision humana en proyectos de datos enlazados (linked data).
- Investigacion en procesamiento de lenguaje natural aplicado a ontologias: modelo de referencia para experimentos de TDSelect y OBI sobre DBpedia Archivo, comparable con otras variantes del mismo grupo.
- Prototipado de pipelines de extraccion de conocimiento: al ser un modelo de 3B con licencia Apache 2.0, puede desplegarse en infraestructura modesta para pruebas de concepto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,4 GB solo para pesos, mas overhead de activaciones y cache KV (en torno a 8-10 GB en la practica).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 3,5-4 GB.
- VRAM estimada en cuantizacion 4 bits: aproximadamente 2-2,5 GB (requiere convertir los pesos a GGUF, no incluidos en el repo).
- GPU recomendadas: A100 40 GB, H100 80 GB para lotes grandes; RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) para inferencia en FP16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en FP16 (por ejemplo RTX 3070/4060 Ti 8 GB) con lotes pequenos, y en 4-6 GB si se cuantiza a 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), Transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gplsi/Llama-3.2-3B-OntologyLearning-DBpediaArchivo-TDSelect-OBI-Top10-e1-ft | 3.212.755.968 | no disponible | Apache 2.0 | Hugging Face |
| meta-llama/Llama-3.2-3B | 3.210.000.000 (aprox.) | 128.000 tokens | Llama 3.2 Community License | Hugging Face |
| meta-llama/Llama-3.2-1B | 1.240.000.000 (aprox.) | 128.000 tokens | Llama 3.2 Community License | Hugging Face |
| gplsi (otras variantes TDSelect/OBI) | ~3.200.000.000 | no disponible | Apache 2.0 | Hugging Face (repos del autor) |

La comparativa con modelos de la misma categoria (aprendizaje de ontologias) no esta disponible, ya que no se han publicado resultados de evaluacion de este modelo ni de sus alternativas directas en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al derivar de Llama 3.2, hereda los sesgos del modelo base, que no han sido evaluados en este ajuste.
- Riesgo de alucinacion: alto en tareas generativas abiertas; el modelo esta especializado en una tarea acotada y no debe usarse como asistente general sin validacion.
- Limitaciones de contexto e idioma: no se especifican idiomas ni longitud de contexto efectiva tras el ajuste; el modelo base soporta 128.000 tokens, pero el ajuste puede haber reducido el contexto util.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Llama 3.2 esta sujeto a la Llama 3.2 Community License, cuyos terminos pueden aplicar en la practica; conviene revisar la compatibilidad antes de un despliegue comercial.
- Caveat de produccion: el repositorio no incluye tokenizador configurado, plantilla de chat ni ejemplos de uso; es necesario revisar los ficheros del repo antes de integrarlo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- La fecha de creacion (2026-11-24) es posterior a la fecha actual de referencia; verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/gplsi/Llama-3.2-3B-OntologyLearning-DBpediaArchivo-TDSelect-OBI-Top10-e1-ft
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Organizacion GPLSI: https://huggingface.co/gplsi
- DBpedia Archivo: https://archivo.dbpedia.org/
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
