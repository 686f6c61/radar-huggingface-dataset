# chiru112/ec-knn-rr4

## Resumen

ec-knn-rr4 es un modelo publicado en Hugging Face por el usuario chiru112 (Chiru Thejaswi) orientado a la prediccion de numeros EC (Enzyme Commission) para la tarea de clasificacion enzimatica Leak CURBER. No se trata de un modelo de lenguaje ni de una red neuronal profunda entrenada de extremo a extremo, sino de un pipeline de recuperacion y reordenacion: realiza una busqueda MMseqs2 de cada secuencia de entrada contra un indice preconstruido del conjunto de entrenamiento completo, toma los EC candidatos de los hits mas cercanos y selecciona el primero mediante un pequeno re-ranker de gradient boosting (cuando se incluye) o mediante un voto ponderado por bit-score.

El repositorio ocupa 1,6 GB, coherente con un indice de busqueda de secuencias mas que con pesos de un transformer. El modelo esta disenado para ejecutarse exclusivamente en CPU (`CPU-only`), lo que lo hace adecuado para entornos sin GPU y para despliegues por lotes sobre ficheros Parquet. La interfaz de ejecucion es un script `predict.py` que recibe un Parquet de entrada y produce un JSONL de salida.

La relevancia actual es acotada: se trata de un artefacto muy especifico para un reto o benchmark concreto (Leak CURBER), sin model card con especificaciones estandar, sin licencia declarada y sin resultados de benchmarks publicados en la informacion disponible. Debe evaluarse como una solucion de retrieval bioinformatico, no como un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperacion por busqueda de secuencias (MMseqs2) con re-ranking por gradient boosting o voto ponderado por bit-score |
| Parametros totales | no disponible (el repositorio contiene un indice de busqueda de 1,6 GB, no pesos de red neuronal) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada por secuencia proteica; longitud no especificada) |
| Tipos de cuantizacion | no disponible (no aplica a este tipo de artefacto) |
| Idiomas soportados | no disponible (procesa secuencias, no texto natural) |
| Licencia | no disponible |
| Formato de pesos | Indice MMseqs2 preconstruido y posible modelo de gradient boosting; entrada/salida en Parquet y JSONL |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo neuronal de lenguaje. El sistema se compone de tres piezas: (1) un indice MMseqs2 preconstruido sobre el conjunto de entrenamiento completo, (2) una etapa de recuperacion que busca cada secuencia unica de entrada contra ese indice y extrae los EC de los hits mas cercanos, y (3) una etapa de seleccion que, si se incluye el re-ranker, aplica un pequeno modelo de gradient boosting para reordenar candidatos; en caso contrario, emplea un voto ponderado por bit-score. La salida es una lista de EC ordenada de mejor a peor.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre procesos de RLHF, DPO o ajuste supervisado, ya que no son aplicables a este tipo de pipeline. Como innovaciones operativas destacan dos mecanismos: la asignacion de un EC de respaldo (el mas frecuente del conjunto de entrenamiento) para entradas sin hits, y un guardia temporal (`time guard`) que detiene la busqueda de forma temprana y aplica el EC de respaldo a las entradas restantes (las mas largas) si la maquina es lenta, priorizando asi el cumplimiento de plazos sobre la cobertura completa.

## Capacidades

- Prediccion de numeros EC para secuencias proteicas mediante busqueda de homologia con MMseqs2.
- Recuperacion de candidatos EC a partir de los hits mas cercanos del conjunto de entrenamiento.
- Re-ranking de candidatos mediante gradient boosting (si el artefacto lo incluye) o voto ponderado por bit-score.
- Salida de lista de EC ordenada de mejor a peor, no solo una etiqueta unica.
- Manejo de entradas sin hits mediante EC de respaldo (el mas frecuente del entrenamiento).
- Control de tiempo de ejecucion mediante guardia temporal para entradas largas.
- Ejecucion exclusiva en CPU, sin dependencia de GPU.
- Procesamiento por lotes de ficheros Parquet con salida en JSONL.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Anotacion enzimatica a gran escala sin GPU: el pipeline procesa lotes de secuencias en Parquet y genera JSONL con EC predichos, adecuado para servidores CPU o entornos cloud sin aceleradores.
- Pre-anotacion de genomas y metagenomas: asignar EC a proteinas predichas antes de una revision manual, usando la busqueda MMseqs2 contra un indice de referencia.
- Clasificacion en retos tipo CAFA o Leak CURBER: el modelo esta disenado especificamente para esta tarea, por lo que sirve como baseline reproducible con salida best-first.
- Filtrado rapido en pipelines bioinformaticos: descartar o priorizar candidatos enzimaticos antes de metodos mas costosos (p. ej. AlphaFold o docking), gracias a su bajo coste computacional en CPU.
- Despliegue en contenedores ligeros: la interfaz `python /app/predict.py --input INPUT.parquet --output OUTPUT.jsonl` facilita la integracion en flujos batch o CI con recursos limitados.
- Analisis de sensibilidad al tiempo de computo: el guardia temporal permite estudiar el compromiso entre cobertura y latencia en maquinas lentas, sustituyendo las entradas mas largas por el EC de respaldo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para ejecucion exclusiva en CPU (`CPU-only`).
- GPU recomendadas: ninguna; no requiere GPU (A100, H100 o RTX 4090 no son necesarias).
- Cabe en GPU consumer: no aplica, ya que no usa GPU.
- Memoria RAM: no disponible; el repositorio ocupa 1,6 GB, por lo que se requiere al menos espacio suficiente para cargar el indice MMseqs2 y el re-ranker en memoria.
- Opciones de despliegue: script `predict.py` sobre Python con MMseqs2; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles; dependen del tamano de entrada y del guardia temporal configurado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chiru112/ec-knn-rr4 | Retrieval MMseqs2 + re-ranker GBM | no disponible (indice de 1,6 GB) | no aplica | no disponible | Hugging Face |
| chiru112/ec-knn-v2 | Retrieval MMseqs2 (version previa) | no disponible | no aplica | no disponible | Hugging Face |
| chiru112/ec-starter-test | No especificado | no disponible | no aplica | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de las alternativas para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Dependencia critica de la calidad y cobertura del indice MMseqs2; secuencias sin homologia en el conjunto de entrenamiento reciben el EC mas frecuente, lo que puede producir predicciones poco informativas.
- El guardia temporal puede degradar la calidad en maquinas lentas al sustituir las entradas mas largas por el EC de respaldo.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Ausencia de model card con especificaciones estandar, idiomas, benchmarks y limitaciones documentadas.
- Riesgo de sobreajuste al conjunto de entrenamiento de Leak CURBER, lo que limita la generalizacion a otras tareas de anotacion enzimatica.
- Sin informacion sobre sesgos; en datos biologicos, los sesgos de composicion del conjunto de entrenamiento pueden propagarse a las predicciones.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chiru112/ec-knn-rr4
- Perfil del autor: https://huggingface.co/chiru112
- Version previa del modelo: https://huggingface.co/chiru112/ec-knn-v2
- Modelo relacionado: https://huggingface.co/chiru112/ec-starter-test
