# ltlltl2006/seislm-large

## Resumen

SeisLM large es un codificador de formas de onda sísmicas preentrenado mediante aprendizaje auto-supervisado, publicado por el usuario ltlltl2006 en HuggingFace y derivado del trabajo SeisLM: a Foundation Model for Seismic Waveforms (Tianlin Liu et al., arXiv:2410.15765). No es un modelo de lenguaje: es un extractor de características cuyo pipeline declarado es feature-extraction, con 90.683.648 parametros que producen representaciones contextuales de dimension 768 a partir de ventanas de 3001 muestras en tres componentes (ZNE) a 100 Hz. Se distribuye en safetensors junto con la configuracion de arquitectura embebida en el checkpoint original.

El modelo resuelve el problema de obtener representaciones genericas y reutilizables de senales sismicas sin necesidad de etiquetas, de modo que despues puedan adaptarse con fine-tuning a tareas como phase picking (picking de fases P y S), deteccion de terremotos o clasificacion de eventos. Su relevancia radica en que ese preentrenamiento se realizo sobre un conjunto agregado de fuentes sismicas relevantes (ETHZ, GEOFON, STEAD, MLAAPDE, InstanceCounts, Iquique, PNW y OBST2024), lo que permite transfer learning a nuevas regiones o instrumentos con menos datos etiquetados.

Es importante subrayar que este artefacto concreto es el codificador con las cabezas de preentrenamiento originales: no incluye cabezas entrenadas de phase-picking ni de deteccion de terremotos, no es un AutoModel de la libreria Transformers y no se ofrece como endpoint de inferencia alojado. Ademas, el propio autor advierte que la evaluacion del paper corresponde a modelos ajustados por tarea, no a este codificador desnudo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 12 capas con cabezas de preentrenamiento auto-supervisado (dimension de caracteristica contextual 768) |
| Parametros totales | 90.683.648 (incluyendo cabezas de preentrenamiento) |
| Longitud de contexto | No aplica en sentido de tokens; ventana de entrada de referencia de 3001 muestras a 100 Hz (3 componentes ZNE), que se reduce a 749 pasos temporales en la salida |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en safetensors sin cuantizacion declarada |
| Idiomas soportados | No disponible (la entrada son formas de onda sismicas, no texto) |
| Licencia | MIT (tanto los pesos como el codigo) |
| Formato de pesos | safetensors (estado sin modificar) mas un wheel de Python `seislm-0.2.0-py3-none-any.whl` para la carga |

Datos adicionales verificables: SHA-256 del checkpoint original `db44b1a46512de2cdf5c310c7ccfdac0ef04931cc89b7768fad41c978266df4b`; tamano del repositorio 0,4 GB; 0 descargas y 0 likes en el momento de la consulta; creado el 2026-10-15 y actualizado el 2026-10-15.

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de 12 capas que proyecta entradas `[batch, 3, samples]` en float32 a caracteristicas contextuales de forma `[batch, reduced_time, 768]`. Para una ventana de 3001 muestras, la salida tiene 749 pasos temporales. El model card menciona que la exportacion conserva los tensores de estado sin modificar mas la configuracion de arquitectura embebida en el checkpoint original, y que el estado del optimizador se ha omitido. La comprobacion de regresion citada evalua ocho campos (caracteristicas del encoder, caracteristicas convolucionales, caracteristicas proyectadas y cuantizadas, perplejidad del codebook y tres valores de perdida enmascarada), lo que apunta a un objetivo auto-supervisado con cuantizacion vectorial y enmascaramiento temporal, aunque el model card no detalla la formulacion completa.

Las fuentes de entrenamiento registradas en el checkpoint original son ETHZ, GEOFON, STEAD, MLAAPDE, InstanceCounts, Iquique, PNW y OBST2024. No se especifica en la informacion disponible el numero de tokens o muestras, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables en este dominio). El autor indica que no hubo cambios en los pesos durante la exportacion y que la regresion numerica se comprobo sobre entradas fijas (completas, con ruido y con canales a cero) en CPU y en CUDA (NVIDIA GB10, PyTorch 2.14.1+cu130, Python 3.12.3), con error absoluto maximo 0; se trata de paridad numerica sobre un fixture de regresion, no de un benchmark downstream.

## Capacidades

- Extraccion de caracteristicas de formas de onda sismicas: genera embeddings contextuales de dimension 768 a partir de ventanas de 3 componentes ZNE a 100 Hz.
- Aprendizaje auto-supervisado: no requiere etiquetas en la fase de preentrenamiento.
- Base para fine-tuning: sirve como punto de partida para cabezas de tarea como phase picking o deteccion de terremotos (estas cabezas no se incluyen).
- Feature extraction como pipeline oficial: no genera texto ni respuestas.
- Soporte de tool calling / function calling: no.
- Soporte de agentes o razonamiento multi-paso: no.
- Capacidades multilingues: no aplica, la entrada no es lenguaje natural.
- Capacidades especiales: ninguna adicional declarada (sin thinking mode, sin vision, sin audio generico). Maneja explicitamente entradas con canales ausentes o con desviacion estandar cero segun el contrato de `preprocessing.json`.

## Casos de uso

- Fine-tuning para phase picking (P/S): el codificador sirve como backbone congelado o ajustable sobre el que se anaden cabezas de picking; es adecuado porque las caracteristicas contextuales de 768 dimensiones ya codifican estructura de la forma de onda que los modelos entrenados desde cero deben aprender por su cuenta.
- Deteccion de terremotos: se puede ajustar una cabeza binaria de deteccion sobre los embeddings para distinguir eventos de ruido; el preentrenamiento sobre STEAD, GEOFON y otras fuentes proporciona representaciones utiles para senales de baja relacion senal-ruido.
- Clasificacion de eventos sismicos: distinguir explosiones, sismos tectonicos, deslizamientos o eventos glaciares utilizando los embeddings como entrada a un clasificador ligero.
- Transfer learning a nuevas regiones o instrumentos: al estar preentrenado sobre multiples redes (ETHZ, PNW, Iquique, OBST2024), el modelo permite adaptar tareas a zonas con pocos datos etiquetados mediante ajuste fino supervisado.
- Analisis de secuencias de replicas: extraer representaciones de ventanas consecutivas de 3001 muestras (unos 30,01 s a 100 Hz) para agrupar, clusterizar o indexar eventos dentro de una secuencia.
- Monitorizacion de ruido sismico ambiental: usar los embeddings como descriptores compactos para detectar cambios en el campo de ruido (por ejemplo, variaciones estacionales o antropogenicas) sin entrenamiento especifico.
- Construccion de bases de datos vectoriales sismicas: indexar grandes catalogos de formas de onda mediante embeddings de 768 dimensiones para busqueda por similitud o recuperacion de eventos analogos.
- Preentrenamiento en pipelines de investigacion: reutilizar el codificador como componente de un sistema mayor (deteccion, localizacion, magnitud) en lugar de entrenar cada modulo desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card indica explicitamente que el paper original evalua modelos ajustados por tarea y que las puntuaciones downstream no pueden inferirse a partir de la carga correcta ni de la paridad numerica de este artefacto.

## Requisitos de hardware

- VRAM estimada: aproximadamente 363 MB con pesos en FP32 (90,68 M de parametros x 4 bytes) y unos 181 MB en FP16/BF16, sin contar activaciones.
- GPU recomendadas: no especificadas por el autor; por tamano cualquier GPU moderna con al menos 2 GB de memoria es suficiente.
- Cabida en GPU de consumo: si, con margen amplio en cualquier GPU de consumo reciente (por ejemplo, gama RTX 30/40 o equivalentes); tambien puede ejecutarse en CPU para lotes pequenos.
- Opciones de despliegue: no es compatible con vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje decoder. La via de uso es PyTorch mas la libreria `seisLM`, instalando el wheel incluido (`python -m pip install "https://huggingface.co/ltlltl2006/seislm-large/resolve/main/seislm-0.2.0-py3-none-any.whl"`), con Python 3.11 o 3.12.
- Latencia y throughput estimados: no disponibles. El autor no publica cifras de rendimiento para este artefacto.
- Nota de reproducibilidad: se recomienda fijar `revision` a un commit publicado del repositorio del modelo en lugar de usar `main`, y se puede usar un directorio local para trabajar offline.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ltlltl2006/seislm-large | Codificador auto-supervisado de formas de onda | 90.683.648 | 3 x 3001 muestras a 100 Hz | MIT | HuggingFace, pesos safetensors + wheel |
| SeisLM (original, Liu et al.) | Codificador auto-supervisado de formas de onda | No confirmado de forma independiente en la informacion disponible; este artefacto deriva de el | Igual que el anterior | MIT | Paper y repositorio GitHub asociado |
| Modelos de tarea tipo PhaseNet, EQTransformer o GPD (familia SeisBench) | Modelos supervisados especificos de phase picking / deteccion | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos verificados de parametros, contexto o licencia de las alternativas dentro de la informacion proporcionada, por lo que no se ofrece una comparacion numerica fiable. La diferencia cualitativa principal es que SeisLM-large es un backbone auto-supervisado de proposito general, mientras que PhaseNet, EQTransformer o GPD son modelos supervisados orientados a una unica tarea y no reutilizables como extractor generico.

## Limitaciones y advertencias

- No incluye cabezas entrenadas de phase picking ni de deteccion de terremotos; requiere adaptacion downstream antes de producir predicciones de tarea.
- No es un AutoModel de Transformers ni un endpoint de inferencia alojado; depende de la libreria `seisLM` y del wheel incluido.
- El contrato de entrada es estricto: tensores float32 `[batch, 3, samples]`, componentes ZNE a 100 Hz. El modelo no realiza remuestreo, filtrado ni relleno de componentes automaticamente; hay que consultar `preprocessing.json` para el manejo de componentes ausentes.
- Sesgo geografico y de instrumentacion: el preentrenamiento se limita a las fuentes registradas (ETHZ, GEOFON, STEAD, MLAAPDE, InstanceCounts, Iquique, PNW, OBST2024), por lo que el rendimiento en regiones o sensores no representados puede degradarse y exige evaluacion en conjuntos de validacion propios.
- Riesgo de extrapolacion fuera de distribucion: al ser un extractor, no "alucina" texto, pero puede generar embeddings poco informativos o enganosos ante senales anomalas, ruido instrumental o eventos de tipo no visto.
- La paridad numerica declarada por el autor es una comprobacion de regresion sobre entradas fijas, no una garantia de calidad ni de rendimiento en tareas reales.
- La licencia MIT permite uso comercial, pero al tratarse de un artefacto de investigacion conviene verificar la licencia de los datasets de entrenamiento subyacentes antes de un despliegue productivo.
- No hay cifras publicadas de latencia, throughput ni benchmarks downstream para este artefacto, lo que dificulta la planificacion de capacidad en produccion.
- Los metadatos del repositorio muestran 0 descargas y 0 likes, y una fecha de creacion poco convencional; se recomienda fijar `revision` a un commit concreto para descargas reproducibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ltlltl2006/seislm-large
- Paper SeisLM: https://arxiv.org/abs/2410.15765
- DOI del paper: https://doi.org/10.48550/arXiv.2410.15765
- Repositorio de codigo: https://github.com/liutianlin0121/seisLM
- Selector de instalacion de PyTorch: https://pytorch.org/get-started/locally/
- Wheel de la libreria: https://huggingface.co/ltlltl2006/seislm-large/resolve/main/seislm-0.2.0-py3-none-any.whl
