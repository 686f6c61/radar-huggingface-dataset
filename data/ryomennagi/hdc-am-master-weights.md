# ryomennagi/HDC-AM-Master-Weights

## Resumen

HDC-AM Master Weights es un artefacto de pesos publicado por el usuario ryomennagi en HuggingFace. No se trata de un modelo de lenguaje ni de un transformer: es un overlay de fast-weights generado mediante computacion hiperdimensional (HDC, Hyperdimensional Computing) para tareas de mapeo de direcciones (Address Mapping). El fichero contiene conocimiento empaquetado como hipervectores bipolares estrictos en {-1,+1}^D con D=4096, almacenados en un unico tensor int8.

El artefacto se distribuye como `fast_weights_master.safetensors` (465.985.624 bytes, es decir 444,4 MiB) con un unico tensor `slots` de forma [113.766, 4096]. Segun la model card, fue producido por un "master fold" de 444,4 MiB y validado con tres comprobaciones: apertura mmap zero-copy, cumplimiento del invariante TR-1 estricto (+-1) y recuperacion asociativa con acierto top-1. La propuesta de valor es ser agnostico al semiconductor, de modo que la memoria asociativa puede desplegarse sin depender de una GPU o acelerador concreto.

La relevancia de este tipo de artefactos radica en el interes creciente por alternativas a los indices vectoriales y a las bases de datos de embeddings, que consumen mucha memoria y ancho de banda. Un overlay de 444 MiB que se abre por mmap y no requiere copia en memoria puede encajar en entornos con restricciones fuertes de recursos. Ahora bien, el repositorio no incluye la libreria necesaria (`hdc_am_pipeline`), no publica resultados de benchmarks y acumula cero descargas y cero likes, por lo que debe considerarse material experimental sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Overlay de fast-weights sobre computacion hiperdimensional (HDC) para mapeo de direcciones; no es un transformer ni una red neuronal convencional |
| Parametros totales | 465.985.536 valores almacenados (113.766 x 4096) en int8; fichero de 465.985.624 bytes (444,4 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la dimensionalidad hipervectorial es d=4096) |
| Tipos de cuantizacion | almacenamiento int8; representacion bipolar estricta {-1,+1} (invariante TR-1) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (un unico tensor `slots` int8, forma [113.766, 4096]) |

## Arquitectura y entrenamiento

La arquitectura no sigue el patron transformer. Se trata de un overlay de fast-weights dentro del paradigma de computacion hiperdimensional: el conocimiento se codifica en hipervectores de 4096 dimensiones con valores bipolares estrictos {-1,+1}, y las operaciones de recuperacion son asociativas (similitud entre hipervectores) en lugar de attention sobre secuencias. El tensor `slots` agrupa 113.766 filas de 4096 dimensiones, presumiblemente correspondientes a 113.766 "slots" o entradas de memoria asociativa. Se declara como agnostico al semiconductor, lo que sugiere que la carga y el calculo no dependen de instrucciones especificas de GPU.

No hay informacion sobre el proceso de generacion del artefacto mas alla del "master fold" que produce las 113.766 filas y del presupuesto de 444,4 MiB. No se especifica el corpus de origen, el numero de tokens procesados ni si hubo etapas de ajuste tipo RLHF o DPO (categorias que, por otra parte, no aplican de forma estandar a este paradigma). Las unicas validaciones declaradas son tecnicas: apertura por mmap sin copia, cumplimiento del invariante bipolar estricto y recuperacion asociativa con acierto top-1, sin detallar el conjunto de evaluacion ni las metricas cuantitativas. La model card invoca dos scripts de reproduccion (`master_fill.py` y `verify_master.py`) que no aparecen documentados como parte del repositorio.

## Capacidades

- Recuperacion asociativa de entradas de memoria: la model card muestra un ejemplo de `recall("Taj Mahal mausoleum Yamuna")`, validado con acierto top-1.
- Carga por mmap zero-copy: el overlay se puede mapear en memoria sin leerlo completo, apto para arranques rapidos y uso compartido entre procesos.
- Representacion bipolar estricta: mantiene el invariante {-1,+1} en todas las dimensiones, lo que simplifica las operaciones de similitud (producto escalar) y reduce el coste de calculo.
- Independencia del semiconductor: el diseno declara no depender de un acelerador concreto, lo que abre la puerta a CPU, GPU u otros sustratos.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes, multimodalidad ni modo thinking.
- No se documentan capacidades multilingues ni una lista de idiomas soportados.

## Casos de uso

- Memoria asociativa para sistemas de recuperacion de entidades: el overlay puede almacenar asociaciones del tipo "entidad -> atributos" y resolver consultas por similitud de hipervectores, con la ventaja de que 444 MiB caben en memoria de sistemas embebidos.
- Cache de conocimiento de dominio en el borde: al abrirse por mmap y pesar menos de medio gigabyte, puede actuar como cache persistente de conocimiento en pasarelas o dispositivos con RAM limitada, evitando llamadas a un servicio remoto.
- Alternativa ligera a indices vectoriales: para busquedas por similitud donde no se requiera recall exhaustivo, un overlay HDC puede sustituir a un indice FAISS o HNSW con una fraccion del consumo de memoria.
- Etiquetado y enrutado en tiempo real: en pipelines de streaming, la recuperacion asociativa top-1 permite asignar una etiqueta o direccion destino a cada registro entrante con operaciones de producto escalar muy baratas.
- Mapeo de direcciones y traduccion de identificadores: el proposito declarado del artefacto (Address Mapping) encaja en capas de indireccion que traducen claves logicas a ubicaciones fisicas o a identificadores normalizados.
- Investigacion en HDC y fast weights: sirve como material de partida reproducible para comparar estrategias de fold, dimensionalidad (d=4096) y codificacion bipolar frente a otras variantes.
- Despliegue agnostico al hardware: en entornos sin GPU (controladores industriales, nodos ARM, FPGA), un overlay que no depende de CUDA permite reutilizar el mismo artefacto con otro sustrato de calculo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara la superacion de tres comprobaciones cualitativas (apertura mmap zero-copy, invariante TR-1 estricto y recuperacion asociativa top-1) sin cifras, sin tamano del conjunto de evaluacion y sin comparacion con alternativas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 444,4 MiB (0,43 GiB) para el tensor completo; con carga por mmap, la huella residente puede ser menor porque solo se paginan las filas accedidas.
- GPU recomendadas: no disponible. No se especifica ningun modelo de GPU en la informacion proporcionada.
- Compatibilidad con GPU de consumo: el tamano permite alojarlo en cualquier GPU de consumo con 1 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090), siempre que exista una implementacion del operador de recuperacion para ese backend.
- Opciones de despliegue: unicamente el cargador propuesto por el autor, `MemoryMapped_OverlayLoader` y `HDC_Recall_Layer` del paquete `hdc_am_pipeline`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica otros overlays de fast-weights ni artefactos de computacion hiperdimensional comparables en parametros, contexto, licencia o disponibilidad. Tampoco se ofrecen cifras que permitan situarlo frente a indices vectoriales convencionales.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas en lenguaje natural; su funcion es la recuperacion asociativa sobre un espacio hipervectorial.
- Ausencia total de benchmarks publicos: las unicas validaciones son cualitativas y no cuantifican precision, recall ni latencia.
- Dependencia de una libreria no incluida: el ejemplo de carga importa `hdc_am_pipeline`, que no se distribuye en el repositorio y no tiene documentacion publica conocida en la informacion disponible.
- Scripts de reproduccion no verificables: `master_fill.py` y `verify_master.py` se mencionan en la model card, pero no consta que esten incluidos en el repositorio (0,5 GB de tamano apunta a un unico safetensors).
- Sin datos de origen de los datos: se desconoce el corpus que origino los 113.766 slots, por lo que no puede evaluarse sesgo, cobertura ni licencia del contenido subyacente.
- Idiomas no declarados: no hay lista de idiomas soportados, lo que impide garantizar cobertura multilingue en el ejemplo mostrado en ingles.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; ningun tercero ha reproducido los resultados.
- Riesgo de alucinacion asociativa: al recuperar siempre la entrada top-1, una consulta fuera de la distribucion del overlay puede devolver una asociacion incorrecta sin senal de confianza.
- Licencia Apache 2.0: permite uso comercial y modificacion con obligacion de conservar avisos, pero se ofrece sin garantias; conviene revisar la procedencia de los datos incorporados antes de un uso en produccion.
- Fecha de creacion futura registrada (2026-09-22) y repositorio sin pipeline declarado; la busqueda web no devolvio ningun resultado relacionado con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ryomennagi/HDC-AM-Master-Weights
- No se han encontrado enlaces relevantes adicionales (paper, blog, repositorio de codigo o demo) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
