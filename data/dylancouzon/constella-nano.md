# DylanCouzon/constella-nano

## Resumen

constella-nano es la torre de consulta (query tower) de un codificador dual asimetrico publicado por DylanCouzon en HuggingFace. La idea del sistema es separar el coste de codificacion: los documentos se indexan una sola vez con un encoder grande y congelado (la torre de documentos `stella-en-400M-v5-doc-onnx`), mientras que las consultas se codifican en tiempo de servicio con un encoder mucho mas pequeno. constella-nano ocupa ese segundo papel y parte del modelo `BAAI/bge-small-en-v1.5`, al que anade una toma de caracteristicas de tres capas y una cabeza lineal entrenadas para proyectar las consultas en el espacio documental de 1024 dimensiones de `NovaSearch/stella_en_400M_v5`. Es decir, no es un modelo generativo: es un extractor de embeddings de frases orientado a recuperacion de informacion.

Su relevancia practica esta en el coste de consulta y en la compatibilidad geometrica del indice. Ambas torres emiten vectores normalizados L2 de 1024 dimensiones, de modo que un unico indice de documentos (por ejemplo, una coleccion de Qdrant con distancia coseno) puede servirse con distintas torres de consulta sin reindexar nada. En el mismo protocolo de CPU con cuatro hilos, la latencia p50 en caliente de constella-nano fue de 7,2511 ms, practicamente la del propio `bge-small-en-v1.5` (6,8400 ms) y muy por encima de la de su companera `constella-zero` (0,1119 ms).

El modelo se publica como research preview y con 0 descargas y 0 likes en el momento de la consulta. La validacion reservada de cuatro conjuntos y la validacion descriptiva sobre BEIR-18 estan pendientes segun el propio autor, y la entrada nativa del modelo solo existe en la rama personalizada `m14-constella-preview` de FastEmbed, no en el FastEmbed upstream. El repositorio ocupa 0,1 GB y se distribuye en formato ONNX bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder tipo BERT (base `BAAI/bge-small-en-v1.5`) con toma de caracteristicas de tres capas y cabeza lineal; torre de consulta de un codificador dual asimetrico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio se distribuye en ONNX y la etiqueta `base_model:quantized` apunta a una version cuantizada de `bge-small-en-v1.5`, sin detalle de los esquemas concretos |
| Idiomas soportados | en (solo ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (repositorio de 0,1 GB) |
| Dimension de embedding | 1024 (normalizado L2), compatible con el espacio de `stella_en_400M_v5` |
| Metrica de similitud | coseno (equivalente a producto escalar al estar normalizados los vectores) |
| Libreria de carga | FastEmbed (rama `m14-constella-preview`) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | `BAAI/bge-small-en-v1.5` |

## Arquitectura y entrenamiento

La arquitectura no es una innovacion de atencion ni un transformer alternativo: es un encoder BERT pequeno reutilizado. Sobre `BAAI/bge-small-en-v1.5`, el autor anade una toma de caracteristicas que combina las salidas de tres capas internas (en lugar de usar unicamente la ultima) y una cabeza lineal que proyecta el vector agregado a 1024 dimensiones. Ese vector se normaliza L2 y se compara por coseno contra los embeddings de documentos generados por la torre grande. El modelo base es un encoder de frases con pooling por media enmascarada; de hecho, la propia model card advierte que la mascara de atencion entera de FastEmbed promueve esa media enmascarada a float64, por lo que conviene castear explicitamente a float32 para mantener cada consulta en los 4096 bytes previstos.

El entrenamiento se describe como un ajuste de esa cabeza y de la toma de caracteristicas para alinearse con objetivos de consulta y de documento congelados en el espacio de `NovaSearch/stella_en_400M_v5`. No hay en la informacion disponible datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre el uso de RLHF o DPO (tecnicas, por otra parte, poco habituales en modelos de embeddings). Tampoco se detalla si hubo destilacion explicita o solo ajuste por pares. Lo que si se explicita es la innovacion de sistema: el desacoplamiento de costes entre indexacion y servicio, con dos torres cuyo unico sentido es funcionar juntas. La torre de documentos es grande y congelada; la de consulta es pequena, se ejecuta en cada peticion y debe aterrizar en el mismo espacio geometrico.

La model card esta truncada en el apartado "How it works", justo cuando describe el entrenamiento contra los objetivos congelados de Stella. Por tanto, cualquier detalle adicional de composicion del dataset o regimen de entrenamiento queda fuera del material disponible.

## Capacidades

- Extraccion de caracteristicas (feature extraction): convierte una consulta de texto en un vector denso de 1024 dimensiones, normalizado L2.
- Recuperacion semantica asimetrica: codifica consultas cortas contra documentos codificados por una torre distinta y de mayor tamano.
- Compatibilidad de indice: sus vectores son intercambiables, a nivel geometrico, con los de `constella-zero` y con los de la torre de documentos Stella, sin reindexar la coleccion.
- Interoperabilidad con Qdrant y FastEmbed: la model card incluye ejemplos de uso nativos con `TextEmbedding` y `QdrantClient`, sin llamadas a `add_custom_model`.
- Ejecucion en CPU: el modelo esta pensado para correr en el lado de consulta, potencialmente sin GPU.
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision: es un encoder, no un modelo causal.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso por si mismo; puede ser un componente (recuperador) dentro de un pipeline agentico.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.

## Casos de uso

- Busqueda semantica sobre un corpus en ingles ya indexado: se codifican los documentos una vez con la torre grande y, en produccion, cada consulta se convierte en un vector de 1024 dimensiones con constella-nano para buscar por coseno en Qdrant. El ahorro esta en no ejecutar la torre de 400 M en cada peticion.
- Generacion aumentada por recuperacion (RAG): el modelo actua como recuperador de pasajes en un pipeline en el que un LLM generativo consume los fragmentos devueltos. Su coste de consulta es aproximadamente el de `bge-small-en-v1.5`, lo que lo hace viable para servicios con muchas consultas por segundo.
- Intercambio de torre de consulta por despliegue: al compartir espacio geometrico con `constella-zero`, un mismo indice puede servirse con la torre rapida cuando la latencia manda y con constella-nano cuando se prioriza otra politica de recuperacion, sin reindexar. El propio autor advierte que esta compatibilidad es geometrica y no una afirmacion de equivalencia de calidad.
- Cache semantico de consultas: calcular el embedding de cada peticion entrante y buscar en un almacen de consultas previas para reutilizar respuestas. La ventana de coste es la del encoder pequeno, no la del grande.
- Enrutamiento de intenciones y clasificacion por similitud: los embeddings de consulta pueden compararse contra vectores de referencia de cada intencion o categoria para dirigir la peticion al flujo adecuado.
- Deduplicacion y agrupamiento de consultas en analitica de busqueda: agrupar consultas equivalentes de un log para estudiar demanda real, usando los vectores de la torre de consulta.
- Generacion de candidatos previa a un reranker: recuperar un conjunto amplio de documentos por similitud coseno y pasarlos despues a un cross-encoder mas costoso y preciso.
- Verificacion offline en entornos sin acceso al Hub: la model card documenta variables de entorno (`CONSTELLA_NANO_PATH`, `CONSTELLA_DOC_PATH`) para cargar rutas locales de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de recuperacion (BEIR-18, evaluacion reservada de cuatro conjuntos) en la informacion disponible; el autor los declara pendientes. El unico dato cuantitativo publicado son latencias sinteticas de consulta, no estimaciones de carga real:

| Modelo | Latencia p50 en caliente (CPU, 4 hilos) | Naturaleza del dato |
|---|---|---|
| `constella-zero` | 0,1119 ms | Latencia sintetica, no estimacion de carga |
| `constella-nano` | 7,2511 ms | Latencia sintetica, no estimacion de carga |
| `bge-small-en-v1.5` | 6,8400 ms | Latencia sintetica, no estimacion de carga |

Segun la model card, el coste de consulta de constella-nano es "aproximadamente el de bge-small", mientras que solo `constella-zero` puede reclamar un coste de consulta cercano a cero.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB en fp32 para la inferencia del encoder de consulta, a partir de un repositorio ONNX de 0,1 GB. Estimacion orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el modelo esta disenado para ejecutarse en CPU, por lo que no requiere acelerador.
- GPU de consumo: cabe en cualquier RTX de gama media o baja, e incluso en iGPU con memoria compartida suficiente.
- CPU: es el escenario objetivo. Las latencias publicadas corresponden a un protocolo de cuatro hilos.
- Opciones de despliegue: FastEmbed (rama `m14-constella-preview`), ONNX Runtime subyacente y Qdrant como almacen vectorial. No hay confirmacion de soporte en vLLM, TGI, llama.cpp u Ollama (no aplica a un encoder de este tipo en la mayoria de esos servidores).
- Latencia y throughput: p50 en caliente de 7,2511 ms por consulta en el protocolo citado; no se publica throughput agregado ni latencias p95/p99.
- Memoria de indice: 1024 dimensiones en float32 equivalen a 4096 bytes por vector, mas el payload asociado en Qdrant.

## Comparativa con modelos similares

| Modelo | Rol | Dimension de salida | Parametros | Licencia | Notas |
|---|---|---|---|---|---|
| `DylanCouzon/constella-nano` | Torre de consulta pequena | 1024 (L2) | no disponible | MIT | Research preview; evaluacion pendiente; 7,2511 ms p50 |
| `DylanCouzon/constella-zero` | Torre de consulta alternativa | 1024 (L2) | no disponible | no disponible | Mismo espacio geometrico; 0,1119 ms p50; unico que reclama coste de consulta casi nulo |
| `DylanCouzon/stella-en-400M-v5-doc-onnx` | Torre de documentos grande y congelada | 1024 (L2) | ~400 M (segun su nombre) | no disponible | Se ejecuta en indexacion, no en servicio; ambas torres solo tienen sentido juntas |
| `BAAI/bge-small-en-v1.5` | Encoder de frases de proposito general | 384 | no disponible en la informacion proporcionada | MIT (modelo base) | Modelo de partida de constella-nano; 6,8400 ms p50 en el mismo protocolo |
| `NovaSearch/stella_en_400M_v5` | Encoder de frases de referencia | 1024 | ~400 M (segun su nombre) | no disponible | Define el espacio documental en el que se entrena constella-nano |

La comparacion con alternativas de terceros de la misma categoria (por ejemplo, otros encoders de recuperacion ligeros) no esta disponible en la informacion proporcionada. La unica busqueda web realizada no devolvio resultados relacionados con el modelo.

## Limitaciones y advertencias

- Estado de research preview: la evaluacion reservada de cuatro conjuntos y la validacion descriptiva sobre BEIR-18 estan pendientes de publicacion, por lo que no hay evidencia de calidad de recuperacion verificada.
- Sin adopcion registrada: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente.
- Dependencia de la torre de documentos: constella-nano solo tiene sentido emparejado con `stella-en-400M-v5-doc-onnx`. Usar otra torre de documentos invalida la compatibilidad geometrica.
- No hay equivalencia con constella-zero: la model card es explicita al afirmar que la compatibilidad es geometrica y que no se implica paridad, equivalencia ni empate en calidad de recuperacion. Los encoders tienen comportamiento medido distinto.
- Solo ingles: no se declara soporte multilingue ni evaluacion en otros idiomas.
- Longitud de contexto no especificada: no hay dato confirmado sobre el maximo de tokens de entrada, un parametro critico para consultas largas o pasajes de contexto.
- Limitacion de despliegue: la entrada nativa existe unicamente en la rama personalizada `m14-constella-preview` del repositorio de FastEmbed del autor; no esta en FastEmbed upstream, y la PR upstream se pospone al trabajo M20.
- Precaucion de tipo de dato: la mascara de atencion entera de FastEmbed promueve la media enmascarada a float64; sin un cast explicito a float32, el vector de consulta ocupa el doble y puede romper contratos de tamano en el indice.
- Latencias no extrapolables: los 7,2511 ms son una medicion sintetica bajo un protocolo concreto de CPU de cuatro hilos, no una estimacion de carga o de throughput en produccion.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto; el riesgo equivalente es la recuperacion de documentos irrelevantes como consecuencia de una calidad de ranking no verificada.
- Sesgos: no hay informacion disponible sobre analisis de sesgos en la model card proporcionada.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias y el estado de investigacion previa desaconseja su uso en produccion critica sin evaluacion propia.
- Model card truncada: el apartado tecnico "How it works" aparece cortado en el material disponible, por lo que pueden faltar detalles de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DylanCouzon/constella-nano
- Torre de documentos companera: https://huggingface.co/DylanCouzon/stella-en-400M-v5-doc-onnx
- Torre de consulta alternativa (constella-zero): https://huggingface.co/DylanCouzon/constella-zero
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Encoder de referencia del espacio documental: https://huggingface.co/NovaSearch/stella_en_400M_v5
- Rama de FastEmbed con el registro nativo del modelo: https://github.com/Dylancouzon/fastembed/tree/m14-constella-preview
- Cliente de Qdrant para Python: https://github.com/qdrant/qdrant-client
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos resultados obtenidos correspondian a contenido no relacionado.
