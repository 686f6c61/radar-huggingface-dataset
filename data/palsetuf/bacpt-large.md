# palsetuf/BacPT-large

## Resumen

BacPT-large es un modelo fundacional de proteomas bacterianos desarrollado por el usuario palsetuf. Su funcion no es procesar aminoacidos uno a uno, sino contextualizar embeddings de proteinas ya calculados por ESM2 en funcion del orden en que esas proteinas aparecen a lo largo del genoma. Es decir, parte de representaciones de 480 dimensiones generadas por `esm2_t12_35M_UR50D` y las refina usando la vecindad genomica, algo que un modelo puramente secuencial no captura.

Tecnicamente es un backbone RoFormer de 19 capas con Rotary Position Embeddings (RoPE) y 74.387.328 parametros, empaquetado para la libreria `transformers`. El repositorio contiene unicamente los pesos de inferencia de la epoca 1099 del entrenamiento, la configuracion exacta y el escalador de entrada ajustado, con un peso total de 0,3 GB.

Es relevante para investigacion en genomica bacteriana porque cubre tareas de prediccion funcional, de contexto genomico, de rasgos y ecologicas sin necesidad de reentrenar un modelo desde cero: actua como extractor de caracteristicas (pipeline `feature-extraction`) sobre el que se montan modelos de tarea especificos. El modelo se publico el 16 de septiembre de 2026 bajo licencia MIT y, en el momento de redactar esta ficha, no acumula descargas ni valoraciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoFormer (transformer con Rotary Position Embeddings), 19 capas |
| Parametros totales | 74.387.328 |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | Hasta 5.000 proteinas por genoma (las secuencias mas cortas se rellenan con padding hasta 5.000); cada proteina se representa con un vector de 480 dimensiones |
| Tipos de cuantizacion | No disponible. El repositorio solo documenta float16 con autocasting en CUDA y float32 en CPU; no se publican pesos GGUF, AWQ ni GPTQ |
| Idiomas soportados | No aplica / no disponible: el modelo opera sobre secuencias de proteinas, no sobre lenguaje natural |
| Licencia | MIT |
| Formato de pesos | safetensors (cargables con `transformers`) |
| Pipeline | feature-extraction |
| Tamano del repositorio | 0,3 GB |
| Modelo base de embeddings | ESM2 `esm2_t12_35M_UR50D` (descargado via PyTorch Hub) |

## Arquitectura y entrenamiento

BacPT-large es un RoFormer denso de 19 capas que codifica una secuencia de embeddings de proteinas en lugar de una secuencia de tokens de texto. Cada posicion de la entrada es un vector de 480 dimensiones procedente de ESM2 (`esm2_t12_35M_UR50D`), obtenido promediando la capa 12 sobre todas las posiciones de aminoacidos de la proteina. El uso de Rotary Position Embeddings permite al modelo modelar dependencias a lo largo de miles de posiciones, lo que en este contexto equivale a capturar relaciones entre proteinas lejanas dentro del genoma. Los pesos publicados corresponden a la epoca 1099 de un entrenamiento auto-supervisado: la cabeza de reconstruccion del modelo regenera los vectores ESM2 de entrada, y la salida `reconstruction` del NPZ es precisamente el resultado de esa cabeza.

El pipeline de inferencia documentado aplica varios pasos fijos: se descartan las proteinas de mas de 2.250 aminoacidos, se generan los embeddings ESM2, se aplica el escalador ajustado durante el entrenamiento, se conservan como maximo las primeras 5.000 proteinas y se rellena con padding el resto. La inferencia en CUDA usa float16 con autocasting para reproducir el procedimiento original, mientras que en CPU se ejecuta en float32. No se especifican en la informacion disponible el numero de tokens u organismos de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; dado que es un modelo auto-supervisado de representaciones, no se documenta alineamiento por preferencias.

## Capacidades

- Generacion de representaciones contextuales de proteinas dentro de un proteoma bacteriano completo o en borrador, con salida de 480 dimensiones por proteina.
- Modelado del contexto genomico: la representacion de cada proteina depende de su posicion y de las proteinas vecinas, no solo de su secuencia.
- Extraccion de caracteristicas para modelos de tarea posteriores (prediccion funcional, de contexto genomico, de rasgos y ecologica).
- Reconstruccion de los vectores ESM2 de entrada mediante la cabeza auto-supervisada, expuesta en el campo `reconstruction` del NPZ.
- Acceso a todas las capas ocultas con la opcion `--all-layers`: tensor `hidden_states` de forma `[20, proteinas, 480]` (capa de embedding mas las 19 capas transformer).
- Ejecucion en CPU (float32) y en GPU CUDA (float16 con autocasting).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion de texto: es un extractor de caracteristicas, no un modelo generativo de lenguaje.

## Casos de uso

- Anotacion funcional de proteinas en genomas bacterianos: se extraen las representaciones de BacPT-large para cada proteina y se entrena un clasificador ligero encima; el contexto genomico ayuda a desambiguar proteinas con secuencias similares pero funciones distintas.
- Prediccion de contexto genomico (operones y vecindad genica): al codificar el orden de las proteinas, el modelo captura que genes contiguos suelen participar en la misma ruta metabolica, util para predecir agrupaciones funcionales.
- Prediccion de rasgos del organismo: a partir de las representaciones agregadas del proteoma, se pueden entrenar modelos para predecir caracteristicas como capacidad metabolica o resistencia a antibioticos, tal como plantea el titulo del paper asociado.
- Prediccion ecologica: estimar el nicho o el entorno de origen de un genoma bacteriano a partir de sus representaciones proteomicas, util en estudios de metagenomica y ecologia microbiana.
- Prediccion de funcion enzimatica: el modelo esta pensado explicitamente para tareas que van "de enzimas a interacciones ecologicas", segun el paper; las representaciones contextuales pueden alimentar clasificadores de familia o actividad enzimatica.
- Agrupamiento y dereplicacion de proteomas: usar los embeddings contextuales para comparar genomas completos y agrupar cepas o especies relacionadas en estudios de diversidad bacteriana.
- Aprendizaje por transferencia en pipelines de investigacion: emplear las representaciones como entrada de modelos de tarea independientes, evitando entrenar un modelo fundacional desde cero en cada nuevo problema.
- Analisis de genomas en borrador: el modelo acepta proteomas incompletos (rellenando con padding hasta 5.000 proteinas), lo que encaja con ensamblados fragmentados habituales en metagenomica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de rendimiento (MMLU, HumanEval, GSM8K u otros), ni metricas especificas de tareas de genomica, y los resultados de busqueda web proporcionados no contienen informacion relevante sobre el modelo. El paper citado ("Bacterial proteome foundation model enhances functional prediction from enzymes to ecological interactions") aun no tiene registro publico con detalles de cita, por lo que sus numeros no estan accesibles.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,30 GB en float32 (74,4 M de parametros) y 0,15 GB en float16. Hay que sumar los pesos de ESM2 `esm2_t12_35M_UR50D` (unos 0,14 GB en float32) que se descargan por separado via PyTorch Hub.
- Consumo total en inferencia: no disponible con precision, ya que no se publica la dimension oculta interna del RoFormer ni el presupuesto de memoria de la etapa ESM2. Para lotes de 5.000 posiciones y una dimension de embedding de 480, el modelo es pequeno y previsiblemente se mantiene por debajo de unos pocos GB en GPU. Cifra no confirmada por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, el modelo deberia caber sin problema en GPU de consumo como una RTX 3060, RTX 4070 o RTX 4090, asi como en A100 o H100 para procesar lotes grandes de genomas.
- Cabe en GPU de consumo: si, previsiblemente si, dado el tamano de pesos (menos de 0,5 GB entre BacPT-large y ESM2 en float32); el cuello de botella real seria el numero de genomas procesados en paralelo y no los pesos.
- Opciones de despliegue: el repositorio no documenta integraciones con vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es el script propio `inference.py` con el comando `python inference.py --fasta ordered_proteins.faa --output bacpt_large_embeddings.npz --device cuda`. La etiqueta `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints, aunque no hay documentacion adicional.
- Latencia y throughput: no disponible. Dependera del numero de proteinas del proteoma (hasta 5.000), de la longitud de cada secuencia en la etapa ESM2 y del uso de CPU (float32) o CUDA (float16).

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Entrada / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BacPT-large | 74.387.328 | RoFormer denso sobre embeddings de proteinas | Hasta 5.000 proteinas en orden genomico | MIT | HuggingFace (`palsetuf/BacPT-large`) |
| ESM2 `esm2_t12_35M_UR50D` | ~35 M (segun nomenclatura del modelo) | Transformer sobre secuencias de aminoacidos | Una proteina por inferencia; sin contexto genomico | MIT (pesos originales de FAIR) | PyTorch Hub / repositorios FAIR ESM v2.0.0 |
| Otros modelos fundacionales de proteinas (ProtT5, Ankh y similares) | No disponible | No disponible | No disponible | No disponible | No disponible |

La diferencia conceptual clave frente a ESM2 es que BacPT-large no sustituye al modelo de secuencia, sino que lo usa como front-end: ESM2 produce embeddings por proteina y BacPT-large los contextualiza con el orden genomico. En la informacion proporcionada no hay datos de rendimiento que permitan comparar calidad entre ambos, solo la arquitectura y el flujo de inferencia.

## Limitaciones y advertencias

- El modelo no anota genomas, no traduce secuencias de nucleotidos y no determina por si mismo el orden de los genes: espera un FASTA de proteinas ya ordenado por posicion genomica.
- No resuelve rotaciones de genomas circulares ni elige un orden para proteinas desordenadas. Si la entrada no esta ordenada, los resultados no son validos.
- Se descartan silenciosamente las proteinas de mas de 2.250 aminoacidos (aparecen en `omitted_protein_ids`) y las que superan la posicion 5.000 (aparecen en `truncated_protein_ids`). Esto puede sesgar el analisis de genomas con proteinas muy largas o muy densos en genes.
- Entrenado exclusivamente con genomas bacterianos: no ha sido validado para proteomas arqueales, eucariotas ni virales.
- Es un modelo de representaciones, no generativo: no produce texto ni respuestas, por lo que no aplica el riesgo clasico de alucinacion linguistica. El riesgo equivalente es que las representaciones no capturen la senal relevante para una tarea concreta, y las predicciones posteriores dependen de modelos de tarea y validacion independientes, tal como advierte el propio autor.
- Sesgos conocidos: no se documenta la composicion del dataset de entrenamiento (numero de genomas, taxones, procedencia), por lo que no es posible evaluar sesgos de muestreo taxonomico o geografico.
- La inferencia en CUDA usa float16 con autocasting y en CPU float32; mezclar precisiones o entornos puede alterar las representaciones respecto al flujo original y afectar la reproducibilidad.
- El pipeline depende de descargar los pesos y el codigo de ESM v2.0.0 desde PyTorch Hub en el primer uso, lo que introduce una dependencia externa y un requisito de red.
- Solo se publican pesos de inferencia (epoca 1099): no hay codigo de entrenamiento ni posibilidad de continuar el preentrenamiento desde este repositorio.
- El modelo tiene 0 descargas y 0 valoraciones en HuggingFace y no se ha publicado aun el registro del paper, por lo que no existe validacion independiente por parte de la comunidad.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion; conviene revisar tambien las condiciones de los pesos de ESM2 descargados por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/palsetuf/BacPT-large
- Paper citado en la model card: "Bacterial proteome foundation model enhances functional prediction from enzymes to ecological interactions". Los detalles de cita se anadiran cuando el registro del manuscrito sea publico; no hay enlace disponible.
- Codigo y pesos de ESM v2.0.0 (FAIR): se descargan a traves de PyTorch Hub en el primer uso; no se proporciona URL directa en la model card.
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las busquedas devolvieron unicamente paginas de catalogo de ropa de la marca Mango, sin relacion con el modelo.
