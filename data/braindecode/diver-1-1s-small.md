# braindecode/DIVER-1-1s-small

## Resumen

DIVER-1-1s Small es el encoder conjunto publicado por el proyecto DIVER (Han et al., 2025) para senales electrofisiologicas intracraneales y de cuero cabelludo. Se trata de un modelo fundacional de 50,6 millones de parametros que procesa parches de 1 segundo a 500 Hz y fue preentrenado de forma auto-supervisada sobre registros intracraneales (SEEG, ECoG, DBS) y de escalpo (EEG). El checkpoint aqui distribuido es una conversion de los pesos originales (`i_eeg_pretrained_weights.pt`) al formato de la libreria Braindecode, manteniendo unicamente el encoder.

El modelo resuelve el problema de obtener representaciones transferibles de senales cerebrales sin depender de etiquetas, de modo que un mismo encoder pueda reutilizarse mediante fine-tuning en tareas clinicas y de investigacion como deteccion de crisis epilepticas, decodificacion motora o clasificacion de estados. Su relevancia actual radica en que forma parte del primer estudio de escalado controlado para preentrenamiento auto-supervisado de iEEG, con barridos de datos, sujetos, duracion y tamano de modelo de hasta 1.800 millones de parametros, y en que la variante DIVER-1-1s alcanza el mejor AUROC en la deteccion de crisis del conjunto MAYO.

La conversion a Braindecode castea los tensores de bfloat16 a float32, renombra las capas y elimina el token de mascara y las cabezas de reconstruccion usadas solo en el preentrenamiento. Las caracteristicas del encoder coinciden con las del modelo oficial con un error de 0.0e+00 en float32 sobre CPU, tanto para canales intracraneales como de escalpo, empleando escalado de atencion muP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer para senales electrofisiologicas (encoder de parches de 1 s a 500 Hz, atencion con escalado muP) |
| Parametros totales | 50.640.964 |
| Longitud de contexto | Ventana de entrada de `n_times` muestras, multiplo de 500 (parches de 1 s a 500 Hz); geometria guardada de 1.000 muestras y 6 canales |
| Tipos de cuantizacion | no disponible (pesos en float32; no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de senales electrofisiologicas, no linguistico) |
| Licencia | MIT (pesos, DIVER Project); codigo de Braindecode bajo BSD-3-Clause |
| Formato de pesos | safetensors (libreria PyTorch/Braindecode) |

Notas: no es un modelo MoE, por lo que no procede la fila de parametros activos. La fila de idiomas no aplica porque la entrada son series temporales multicanal, no texto.

## Arquitectura y entrenamiento

La arquitectura es un transformer que opera sobre parches temporales de 1 segundo a una frecuencia de muestreo de 500 Hz, es decir, 500 muestras por parche. El modelo es conjunto: un mismo encoder procesa tanto senales intracraneales (los tipos de canal SEEG, ECoG y DBS) como de escalpo (EEG), usando las posiciones de los electrodos para condicionar la representacion. La atencion emplea escalado muP (`mup_attention=True`), una tecnica de parametrizacion que facilita la transferencia de hiperparametros entre tamanos de modelo y que fue clave en el estudio de escalado. La geometria guardada por defecto es de 6 canales y 1.000 muestras, pero el encoder no depende de ella: al cargar se pueden pasar el montaje propio, `n_times` y `n_outputs` deseados.

El preentrenamiento es auto-supervisado. Segun el articulo, se realizo un barrido controlado y consciente del coste computacional en escala de datos, numero de sujetos, duracion de entrenamiento y tamano de modelo, alcanzando hasta 1.800 millones de parametros; la variante aqui descrita corresponde al modelo pequeno de 50,6 millones. En la conversion se descartaron el token de mascara y las cabezas de reconstruccion empleadas solo durante el preentrenamiento, de modo que el artefacto distribuido contiene exclusivamente el encoder y no incluye ninguna cabeza de clasificacion.

## Capacidades

- Extraccion de caracteristicas (embeddings) de senales electrofisiologicas crudas, tanto intracraneales (SEEG, ECoG, DBS) como de escalpo (EEG).
- Procesamiento conjunto de multiples modalidades en un unico encoder, seleccionando la modalidad a partir del tipo de canal declarado en `chs_info`.
- Manejo de montajes arbitrarios: el modelo no depende de una geometria fija y acepta posiciones de electrodo en metros (formato MNE).
- Entrada de ventanas temporales configurables mediante `n_times`, siempre que sea multiplo de 500.
- Representaciones transferibles listas para fine-tuning en tareas supervisadas descendentes (clasificacion, deteccion de eventos).
- No incorpora generacion de texto, tool calling, agentes, vision ni audio; no es un modelo linguistico ni multimodal en el sentido habitual.

## Casos de uso

- Deteccion de crisis epilepticas: el encoder de DIVER-1-1s alcanza el mejor AUROC en la deteccion de crisis del conjunto MAYO segun el articulo; en produccion se anadiria una cabeza de clasificacion entrenada sobre las caracteristicas del encoder para marcar segmentos con actividad ictal.
- Decodificacion de interfaces cerebro-computador: a partir de registros ECoG o SEEG, extraer embeddings por ventana y entrenar un clasificador de intencion motora para controlar una protesis o un cursor.
- Monitorizacion clinica intraoperatoria: procesar registros DBS o ECoG en tiempo casi real para detectar patrones anormales, reutilizando el mismo modelo que cubre varias modalidades intracraneales.
- Analisis de EEG de escalpo para investigacion: obtener representaciones de registros de cuero cabelludo y reutilizarlas en estudios de clasificacion (por ejemplo, estadios de sueno o potenciales evocados) mediante fine-tuning.
- Preentrenamiento y transferencia entre centros: usar el encoder como inicializacion para modelos supervisados en conjuntos de datos pequenos o etiquetados de forma limitada, reduciendo la necesidad de datos anotados.
- Extraccion de caracteristicas para busqueda o agrupamiento de registros: generar embeddings por ventana de 1 s y emplearlos en clustering no supervisado o recuperacion de segmentos similares en grandes archivos clinicos.
- Investigacion en escalado de modelos de electrofisiologia: servir de punto de partida para estudiar la relacion entre tamano de modelo, datos y rendimiento, dado que el articulo cubre modelos de hasta 1.800 millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. Las fuentes consultadas unicamente indican de forma cualitativa que DIVER-1-1s alcanza el mejor AUROC en la deteccion de crisis del conjunto MAYO y que los modelos DIVER-1 de iEEG y EEG logran el estado del arte en sus respectivos benchmarks, sin proporcionar valores concretos de metricas, comparativas ni tablas de resultados. La verificacion incluida en la model card se limita a comprobar que las caracteristicas del encoder coinciden con el modelo oficial con un error de 0.0e+00 en float32 sobre CPU, y no cubre exactitud descendente, kernels de GPU ni precision mixta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 202 MB solo para los pesos en float32 y unos 101 MB en bfloat16/float16 (calculado a partir de los 50,6 millones de parametros); hay que sumar activaciones, cuyo consumo depende del numero de canales y de `n_times`.
- GPU recomendadas: practicamente cualquier GPU moderna es suficiente; una RTX 3060 o superior permite inferencia comoda, y no se requiere A100 ni H100 para esta variante pequeña.
- Compatibilidad con GPU de consumidor: si, cabe con holgura en GPU de gama media y baja (por ejemplo, 4-8 GB de VRAM) e incluso es viable la inferencia en CPU, ya que la conversion se valido precisamente sobre CPU en float32.
- Opciones de despliegue: PyTorch a traves de la libreria Braindecode (`DIVER1.from_pretrained(...)`); a partir de la informacion disponible no se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; no se proporcionan mediciones de latencia ni de throughput en la informacion consultada.

## Comparativa con modelos similares

La informacion disponible no incluye especificaciones detalladas de modelos comparables, por lo que no es posible construir una tabla con parametros, contexto, rendimiento y licencia de alternativas. Como referencia interna de la propia familia, el estudio de escalado de DIVER-1 abarca modelos de hasta 1.800 millones de parametros, frente a los 50,6 millones de esta variante pequena, y distingue entre modelos especificos de iEEG y de EEG. Braindecode, el ecosistema que aloja este checkpoint, incluye mas de 65 arquitecturas publicadas, pero no se aportan sus datos comparativos. En consecuencia, la comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- Los archivos contienen unicamente el encoder; no incluyen cabeza de clasificacion. Braindecode inicializa una cabeza al cargar, por lo que el modelo necesita fine-tuning siguiendo el protocolo del articulo (`scripts/finetune_faced.sh`).
- La verificacion de equivalencia con el modelo oficial cubre solo las caracteristicas del encoder en float32 sobre CPU, no la exactitud descendente, los kernels de GPU ni la precision mixta.
- Es necesario remuestrear las senales a 500 Hz antes de la inferencia y proporcionar las posiciones de los electrodos en metros (formato MNE).
- `n_times` debe ser multiplo de 500; la geometria guardada es de 6 canales y 1.000 muestras, aunque el encoder admite otro montaje.
- No es un modelo linguistico: no soporta generacion de texto, tool calling, agentes ni capacidades multilingues, por lo que las advertencias tipicas de sesgo textual no aplican directamente.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser un modelo de representacion, su comportamiento depende del conjunto de fine-tuning y de la poblacion de registros usada en el preentrenamiento, con posible perdida de generalizacion en montajes, patologias o equipos distintos.
- Restricciones de licencia: los pesos se distribuyen bajo MIT, lo que en principio permite uso comercial, pero el codigo de Braindecode es BSD-3-Clause; conviene revisar ambas licencias y las condiciones de los datos de preentrenamiento, no detalladas aqui.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin evidencia publica de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/braindecode/DIVER-1-1s-small
- Articulo arXiv (resumen): https://arxiv.org/abs/2512.19097
- Articulo arXiv (HTML): https://arxiv.org/html/2512.19097
- Articulo arXiv (version 1): https://arxiv.org/html/2512.19097v1
- Repositorio del proyecto DIVER-1: https://github.com/DIVER-Project/DIVER-1
- Documentacion de `braindecode.models.DIVER1`: https://braindecode.org/stable/generated/braindecode.models.DIVER1.html
- Repositorio de Braindecode: https://github.com/braindecode/braindecode
- Sitio de Braindecode: https://braindecode.org/stable/index.html
