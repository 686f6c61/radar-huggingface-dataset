# computational-metabolomics/mist-cf

## Resumen

MIST-CF (MIST Chemical Formula) es un modelo de aprendizaje profundo para la inferencia de formulas quimicas a partir de espectros de masas en tandem (MS/MS). Lo firman Samuel Goldman, Jiayi Xin, Joules Provenzano y Connor Coley, y se distribuye como artefacto cientifico reproducible a traves de Zenodo (DOI 10.5281/zenodo.8151490) y, en esta ficha, como paquete de datos para Galaxy publicado en HuggingFace por la organizacion computational-metabolomics.

No se trata de un modelo de lenguaje: el repositorio contiene checkpoints de PyTorch (`fast_filter_best.ckpt` y `mist_cf_best.ckpt`) que constituyen una version 1.0.0 byte-identica a la fuente original, sin conversion de formato. La model card no especifica arquitectura, numero de parametros, contexto ni idiomas, y el repositorio declara un tamano de 0,0 GB, 0 descargas y 0 likes en el momento de la consulta.

Su relevancia esta en la metabolomica no dirigida: determinar la formula molecular de un compuesto a partir de su espectro de fragmentacion es un paso critico en la anotacion de muestras biologicas, ambientales o clinicas, y MIST-CF automatiza esa tarea con dos componentes (un filtro rapido de candidatos y el modelo principal de inferencia de formula).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (los artefactos son checkpoints de PyTorch) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no se declara que sea un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints en precision original sin cuantizacion publicada |
| Idiomas soportados | no aplicable (modelo de quimica analitica, no de lenguaje) |
| Licencia | modelo/datos: CC-BY-4.0; codigo fuente: MIT (declaradas por separado) |
| Formato de pesos | checkpoints de PyTorch (`.ckpt`); no se incluyen safetensors ni GGUF |
| Version | 1.0.0 |
| Tamano del repositorio | 0,0 GB (segun HuggingFace) |
| Ficheros incluidos | `1.0.0/mist_cf_best.ckpt`, `1.0.0/fast_filter_best.ckpt` |
| Integracion | Galaxy data manager (etiquetas: galaxy, galaxy-data-manager) |
| Dominio | metabolomica, espectrometria de masas |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo, el numero de parametros, el volumen de datos de entrenamiento ni si se emplearon tecnicas de ajuste fino como RLHF o DPO. La model card se limita a indicar el nombre del metodo ("Chemical formula inference from tandem mass spectra"), la autoria, el DOI del registro fuente y los hashes SHA-256 de los dos checkpoints distribuidos.

Lo unico inferible de los artefactos publicados es que el sistema consta de al menos dos componentes: un modelo principal de inferencia de formula (`mist_cf_best.ckpt`) y un filtro rapido de candidatos (`fast_filter_best.ckpt`), lo que sugiere una etapa de cribado previo para reducir el espacio de formulas candidatas antes de la prediccion final. Cualquier detalle adicional sobre capas, mecanismos de atencion o composicion del dataset de entrenamiento debe consultarse en el repositorio de codigo fuente y en el registro de Zenodo enlazados mas abajo.

## Capacidades

- Inferencia de formula molecular (formula quimica) a partir de espectros de masas en tandem (MS/MS).
- Cribado rapido de candidatos mediante un modelo auxiliar de filtrado (`fast_filter`).
- Procesamiento de datos de espectrometria de masas en el dominio de la metabolomica.
- Empaquetado como data manager de Galaxy, lo que permite su uso en flujos de trabajo reproducibles dentro de esa plataforma.
- No se declara soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingues, de vision, audio ni modo de razonamiento explicito.
- No se declara capacidad de generacion de texto: no es un modelo generativo de lenguaje.

## Casos de uso

- Anotacion en metabolomica no dirigida: dado un espectro MS/MS experimental sin compuesto conocido asignado, el modelo propone la formula molecular, lo que acota drasticamente el espacio de busqueda antes de la identificacion estructural.
- Dereplicacion de productos naturales: en el cribado de extractos, la formula inferida permite agrupar y priorizar candidatos desconocidos frente a bases de datos como PubChem o ChemSpider.
- Metabolomica ambiental: asignacion de formulas a contaminantes y productos de transformacion detectados en aguas o suelos mediante LC-MS/MS, donde las librerias espectrales son incompletas.
- Analisis de muestras clinicas: apoyo a la interpretacion de perfiles metabolomicos en estudios de biomarcadores, reduciendo el numero de candidatos que requieren validacion con estandar autentico.
- Control de calidad de datos espectrales: uso del filtro rapido para descartar candidatos de formula implausibles y detectar espectros anomalos en lotes grandes.
- Pipelines reproducibles en Galaxy: integracion como data manager dentro de flujos de trabajo de Galaxy, lo que facilita la ejecucion repetible y la trazabilidad de la version del modelo (1.0.0) usada en cada analisis.
- Lipidomica y metabolomica dirigida: inferencia de formulas coherentes con reglas quimicas para familias de compuestos concretas, como paso previo a la anotacion de especies lipidicas.
- Reanalisis retrospectivo de datos: aplicacion del modelo sobre espectros ya almacenados en repositorios publicos (por ejemplo, GNPS o MassIVE) para obtener formulas que no se habian calculado en el momento de la adquisicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card y los metadatos de HuggingFace no incluyen metricas de exactitud, cobertura, comparaciones con otros metodos de inferencia de formula ni tiempos de inferencia. Para obtener datos de evaluacion seria necesario consultar la publicacion asociada y el repositorio de codigo fuente, que no forman parte de la informacion suministrada en esta consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los metadatos no indican numero de parametros ni tamano de los checkpoints.
- GPU recomendadas: no disponible en la informacion proporcionada. Al ser checkpoints de PyTorch, el modelo puede ejecutarse en GPU o CPU segun la implementacion del codigo fuente.
- Compatibilidad con GPU de consumo: no disponible; sin datos de tamano del modelo no puede confirmarse si cabe en una RTX 4090, RTX 3090 u otras GPU de consumo.
- Opciones de despliegue: no aplican los servidores de inferencia de LLM (vLLM, TGI, llama.cpp, Ollama), ya que no es un modelo de lenguaje. El despliegue previsto es mediante el codigo fuente original de MIST-CF o a traves del data manager de Galaxy.
- Latencia y throughput: no disponible.
- Nota: la presencia del fichero `fast_filter_best.ckpt` apunta a una etapa de cribado pensada para reducir coste computacional, pero no se cuantifica su impacto.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados comparativos ni referencias a metodos alternativos de inferencia de formula a partir de MS/MS, por lo que no es posible establecer una comparacion con datos verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones y no soporta tool calling ni agentes.
- No se especifican arquitectura, parametros ni datos de entrenamiento, lo que dificulta evaluar su comportamiento fuera del dominio previsto.
- No hay benchmarks publicados en la informacion disponible: no puede afirmarse su exactitud relativa frente a otros metodos de inferencia de formula.
- La calidad de la prediccion depende de la calidad del espectro MS/MS de entrada; no se documentan en la ficha los requisitos de resolucion, relacion senal-ruido o modo de ionizacion.
- Sesgos conocidos: no documentados en la informacion proporcionada. En quimica analitica es habitual que el rendimiento varie segun la clase de compuesto y la cobertura del conjunto de entrenamiento, pero no hay datos que lo confirmen para este modelo.
- Riesgo de prediccion incorrecta: al tratarse de inferencia de formula, un error produce una asignacion molecular erronea que puede propagarse a etapas posteriores de anotacion. No se documentan medidas de incertidumbre.
- Licencia: los pesos y datos estan bajo CC-BY-4.0, lo que permite uso comercial siempre que se atribuya correctamente la autoria. El codigo fuente se rige por MIT, con condiciones distintas; ambas licencias se declaran por separado y no se sustituyen entre si.
- El repositorio presenta 0 descargas y 0 likes, por lo que no existe validacion de la comunidad en el canal de HuggingFace; los checkpoints son repositorios de datos derivados de Zenodo, no una publicacion independiente.
- Integridad: la model card indica que los ficheros son byte-identicos a los de origen y proporciona hashes SHA-256 para verificacion; conviene comprobarlos antes de usar los pesos en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/computational-metabolomics/mist-cf
- Registro fuente en Zenodo: https://zenodo.org/records/8151490
- DOI del modelo/datos: https://doi.org/10.5281/zenodo.8151490
- Codigo fuente y documentacion (MIST-CF): https://github.com/samgoldman97/mist-cf
- Licencia del codigo fuente (MIT): https://github.com/samgoldman97/mist-cf/blob/main/LICENSE
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/legalcode
- Ficheros de origen: https://zenodo.org/records/8151490/files
