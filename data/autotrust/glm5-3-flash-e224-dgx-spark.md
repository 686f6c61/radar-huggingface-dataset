# autotrust/GLM5.3-Flash-E224-DGX-Spark

## Resumen

GLM5.3-Flash-E224-DGX-Spark es una versión derivada, no oficial, del modelo zai-org/GLM-5.3-Flash publicada por el usuario autotrust. Se trata de un transformer de tipo Mixture of Experts (MoE) podado a nivel de expertos y cuantizado en NVFP4, diseñado específicamente para caber en sistemas de escritorio con arquitectura Blackwell, en particular dos unidades NVIDIA DGX Spark conectadas por ConnectX-7. El modelo conserva 224 de los 288 expertos enrutados de cada capa (selección realizada mediante Neural Architecture Search) y mantiene 18.000 millones de parámetros activos por token, con un total de 127.627.162.814 parámetros en los ficheros safetensors (141 GiB de pesos en disco).

El problema que resuelve es de presupuesto de memoria: el checkpoint NVFP4 sin podar del modelo base ocupa alrededor de 190 GiB, lo que deja muy poco espacio para la caché KV en cada nodo de una pareja de DGX Spark (256 GB de memoria unificada en total). Con 141 GiB, este build deja aproximadamente 40 GiB por nodo para caché KV, suficiente según el autor para trazas de razonamiento de más de 128.000 tokens con `reasoning_effort=max`. También puede ejecutarse en una única GPU Blackwell de 180 GB o más (B200/GB200), pero no en un solo DGX Spark, cuyos 128 GB de memoria unificada son insuficientes solo para los pesos.

Es relevante ahora porque combina tres piezas poco habituales fuera del entorno de datacenter: cuantización NVFP4 nativa en tensor cores FP4 de GB10, poda de expertos guiada por NAS y decodificación especulativa mediante la capa MTP original del modelo base, que según las mediciones del autor aporta unas 1,85 veces más velocidad de decodificación en flujo único sin degradar la calidad de salida. El modelo es bilingüe inglés/chino, mantiene el vocabulario completo de 154.880 tokens y conserva intacta la torre de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos enrutados y experto compartido; vision tower incluida; capa MTP opcional para decodificacion especulativa |
| Parametros totales | 127.627.162.814 (segun safetensors); pesos en disco: 151,5 GB = 141 GiB |
| Parametros activos | 18 B por token (top-8 de 224 expertos enrutados + experto compartido + atencion) |
| Longitud de contexto | No disponible de forma explicita; el autor cita trazas de razonamiento de 128 K+ tokens y recomienda `--max-model-len` de ~64 K para `effort=low` y >= 160 K para `effort=max`. Presupuesto de thinking medido hasta 163.840 tokens |
| Tipos de cuantizacion | Expertos enrutados en NVFP4 (formato modelopt: grupos de 16 elementos, escala de grupo e4m3, escala de tensor fp32). Atencion, expertos compartidos, embeddings y torre de vision en BF16. Etiqueta de repositorio: 8-bit |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria declarada: vllm) |
| Expertos enrutados por capa | 224 de 288 (poda por Neural Architecture Search) |
| Vocabulario | 154.880 tokens (completo, sin recortes) |
| Modalidades de entrada/salida | image-text-to-text (entrada de imagen y video, salida de texto) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con enrutamiento disperso. Cada capa del modelo base contiene 288 expertos enrutados; este build conserva 224 por capa, seleccionados mediante Neural Architecture Search, y activa los 8 mejores mas el experto compartido en cada paso de decodificacion. Esto mantiene constante el coste por token (18.000 millones de parametros activos, identicos al modelo completo) mientras reduce el conjunto de expertos residentes en memoria. Los expertos enrutados se almacenan en NVFP4, formato que los tensor cores Blackwell de GB10 ejecutan de forma nativa; el resto de componentes del modelo (mecanismos de atencion, expertos compartidos, embeddings y torre de vision) permanecen en BF16. La torre de vision no ha sido modificada.

El autor no documenta en la model card el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), por lo que esos datos no estan disponibles. Lo que si se detalla es el pipeline de derivacion: poda de expertos por NAS sobre el checkpoint original, cuantizacion NVFP4 de los expertos mediante modelopt y validacion de precision sobre una unica NVIDIA B200 con vLLM. Se incluye la capa MTP (Multi-Token Prediction) original del modelo base en el directorio `mtp/` como borrador opcional de decodificacion especulativa, con una ganancia declarada de aproximadamente 1,85x en velocidad de decodificacion de un solo flujo a igual calidad de salida. El modelo conserva el chat template del base, incluido el parametro `reasoning_effort` con valores `low`, `high` y `max`.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con soporte de plantilla de chat multi-turno.
- Razonamiento extendido con presupuesto de pensamiento configurable (`reasoning_effort`: low, high, max), con trazas que en problemas dificiles superan los 130.000 tokens.
- Razonamiento matematico de competicion: 88,3 % de pass@1 en AIME 2025 con `effort=max`.
- Razonamiento cientifico de nivel doctoral: 90,9 % en GPQA-Diamond con `effort=max` y presupuesto de 163.840 tokens.
- Generacion y completado de codigo: 98,2 % en HumanEval con muestreo T=1.0/top_p=0.95 y 95,7 % con decodificacion greedy.
- Comprension multimodal: la torre de vision esta intacta, con un 73,6 % en MMMU val (900 preguntas). Admite imagen y video como entrada.
- Capacidades multilingues limitadas a ingles y chino; el modelo base conserva C-Eval (84,0 % en validacion con 52 asignaturas).
- Soporte de tool calling / function calling: la model card incluye una seccion de BFCL v4 (function calling, AST match), pero el contenido de esa seccion aparece truncado en la informacion disponible.
- Decodificacion especulativa opcional mediante la capa MTP incluida en `mtp/`.
- Orientado a despliegue con vLLM; no se mencionan otros runtimes.

## Casos de uso

- Razonamiento cientifico y matematico asistido en local: con `reasoning_effort=max` el modelo alcanza un 90,9 % en GPQA-Diamond y un 88,3 % en AIME 2025, por lo que resulta adecuado para validar derivaciones, resolver problemas de competicion y asistir en revision de articulos tecnicos, siempre que se configure una ventana de al menos 160 K tokens para absorber la cola larga de problemas dificiles.
- Asistente de programacion integrado en CI/CD: el 98,2 % en HumanEval y el soporte declarado de vLLM permiten usarlo como generador y revisor de parches en pipelines automatizados, con la capa MTP activada para reducir la latencia por token en flujo unico.
- Analisis multimodal de documentacion tecnica: la torre de vision intacta y el 73,6 % en MMMU permiten procesar diagramas, capturas de pantalla, planos y figuras dentro de un mismo contexto junto al texto, sin necesidad de un modelo de vision separado.
- Procesamiento de documentacion en chino e ingles: el vocabulario completo de 154.880 tokens y el 84,0 % en C-Eval lo hacen util para empresas con documentacion bilingue que necesiten resumen, extraccion de datos y clasificacion sin salir del par de idiomas soportado.
- Despliegue en laboratorio con dos DGX Spark: al dejar aproximadamente 40 GiB de memoria por nodo para caché KV, permite ejecutar inferencia de nivel frontera con datos que no pueden salir de la organizacion, sobre hardware de escritorio en lugar de un cluster de datacenter.
- Atencion al cliente automatizada bilingue: el modelo mantiene conversaciones multi-turno con contexto largo, lo que permite conservar el historial completo de un caso sin resumir ni truncar, aunque solo cubre ingles y chino.
- Generacion de trazas de razonamiento auditables: el chat template expone el presupuesto de pensamiento, de modo que equipos de evaluacion pueden generar cadenas de razonamiento de longitud controlada para revision humana o para entrenar modelos mas pequenos por destilacion.
- Investigacion sobre cuantizacion NVFP4: el modelo sirve como caso de estudio reproducible de poda de expertos por NAS combinada con cuantizacion FP4, comparando su huella de memoria (141 GiB) con los 190 GiB del checkpoint NVFP4 sin podar y los 306 GiB del FP8.

## Benchmarks y rendimiento

Medidos por el autor sobre una unica NVIDIA B200 con vLLM. El muestreo sigue la receta oficial del modelo base (`temperature=1.0, top_p=0.95`), salvo HumanEval, que tambien se evaluo con decodificacion greedy. La puntuacion es estricta: una respuesta que agota tokens antes de dar una respuesta final cuenta como incorrecta. Todas las cifras son de una sola ejecucion y la decodificacion MoE en vLLM no es determinista a nivel de bit, por lo que el autor pide tratar ±2-3 puntos como ruido.

| Benchmark | Configuracion | Este modelo | Referencia sin podar |
|---|---|---|---|
| GPQA-Diamond (198) | effort=max, presupuesto 163.840 tokens | 90,9 % (180/198) | 90,57 % (RedHatAI NVFP4) · 92,1 % (NVIDIA NVFP4, presupuesto 327 K) |
| AIME 2025 (30 x 4 muestras, pass@1) | effort=max, presupuesto 163.840 tokens | 88,3 % (106/120); 29/30 resueltos en al menos 1 muestra | 86,67 % (RedHatAI NVFP4, 8 semillas) |
| HumanEval (164) | T=1.0, top_p=0.95 | 98,2 % (161/164) | No disponible |
| HumanEval (164) | greedy | 95,7 % (157/164) | No disponible |
| C-Eval val (1.606, 52 asignaturas) | effort=low | 84,0 % (1.349/1.606) | No disponible |
| MMMU val (900, multimodal) | effort=low | 73,6 % (662/900) | No disponible |

Efecto del presupuesto de pensamiento:

| Benchmark | effort=low/high, 65.536 tokens | effort=max, 163.840 tokens |
|---|---|---|
| GPQA-Diamond | 78,3 % (low, 7 truncados); 79,3 % con extraccion tolerante | 90,9 % (4 truncados); 91,4 % tolerante |
| AIME 2025 pass@1 | 75,0 % (high, 12/120 truncados) | 88,3 % (10/120 truncados) |

Consumo de tokens por pregunta (tokens de completion, pensamiento incluido):

| Tarea | media | mediana | p90 | max |
|---|---|---|---|---|
| GPQA-Diamond, effort=low | 6,3 K | 0,4 K | 24 K | 65,5 K (presupuesto) |
| GPQA-Diamond, effort=max | 19,7 K | 7,0 K | 53 K | 163,8 K (presupuesto) |
| AIME 2025, effort=high | 15,2 K | 2,4 K | 65,5 K | 65,5 K (presupuesto) |
| AIME 2025, effort=max | 34,2 K | 12,6 K | 145 K | 163,8 K (presupuesto) |
| C-Eval, effort=low | 0,26 K | 0,15 K | 0,3 K | 8,2 K |

No hay datos publicados de throughput absoluto (tokens/s) ni de la seccion BFCL v4, que aparece truncada. El autor advierte de que todas las cifras de precision y velocidad se midieron en una B200 y que las cifras de memoria para DGX Spark son calculadas a partir de la huella de pesos, no medidas sobre hardware Spark.

## Requisitos de hardware

- Memoria de pesos: 151,5 GB (141 GiB) en disco. Es el dato medido, no estimado.
- NVIDIA B200 o GB200 con 180 GB o mas: configuracion validada por el autor para todas las mediciones. Un solo DGX Spark (128 GB de memoria unificada) no es suficiente, ya que los pesos por si solos exceden la memoria.
- Dos DGX Spark (GB10 Grace Blackwell) conectados por ConnectX-7: 256 GB de memoria unificada en total, aproximadamente 70 GiB de pesos por nodo y unos 40 GiB disponibles por nodo para cache KV. Es la configuracion objetivo del build.
- GPU de consumo (RTX 4090, RTX 5090, etc.): no cabe. Con 141 GiB de pesos no hay ninguna GPU consumer con memoria suficiente, ni siquiera agregando varias en un solo nodo sin particionar el modelo entre nodos.
- Prestaciones por nodo en DGX Spark: 128 GB de LPDDR5X unificada y 273 GB/s de ancho de banda, con tensor cores FP4 nativos. GB10 tiene aproximadamente 30 veces menos ancho de banda que una B200, por lo que el autor espera muchos menos tokens/s en Spark que en B200.
- Configuracion de contexto recomendada en Spark: `--max-model-len` de aproximadamente 64 K para `reasoning_effort=low` y de 160 K o mas para `effort=max`.
- Decodificacion especulativa: activar la capa MTP de `mtp/` aporta segun el autor unas 1,85 veces mas velocidad de decodificacion en flujo unico a igual calidad.
- Opciones de despliegue: el repositorio declara la libreria vLLM y el pipeline image-text-to-text. La receta de dos DGX Spark sigue la configuracion estandar de vLLM de NVIDIA para dos Spark. No se documentan recetas para llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en cifras absolutas. La unica cifra de rendimiento publicada es el factor 1,85x de la decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos / parametros activos | Memoria de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| autotrust/GLM5.3-Flash-E224-DGX-Spark | 127,6 B | 224 de 288 expertos; 18 B activos | 151,5 GB (141 GiB) | No disponible explicitamente; thinking hasta 163.840 tokens | MIT | HuggingFace, libreria vLLM |
| zai-org/GLM-5.3-Flash (FP8) | No disponible | 288 expertos; 18 B activos | 306 GiB | No disponible | No disponible | Referenciado como modelo base |
| GLM-5.3-Flash NVFP4 sin podar | No disponible | 288 expertos; 18 B activos | ~190 GiB | No disponible | No disponible | Variantes publicadas por RedHatAI y NVIDIA |
| Modelos densos de ~70-120 B comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Las unicas referencias cuantitativas disponibles son las del propio autor: el checkpoint NVFP4 sin podar deja aproximadamente 95 GiB por nodo en una pareja de DGX Spark, sin apenas margen para cache KV, mientras que este build deja unos 40 GiB. En calidad, el autor situa la diferencia respecto al modelo sin podar dentro del ruido de medicion, salvo algunos puntos en GPQA-Diamond. No se dispone de datos comparativos con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Es un derivado no oficial: el autor lo declara explicitamente como "unofficial derivative" del modelo zai-org/GLM-5.3-Flash. No procede del equipo que desarrollo el modelo base.
- Estado de validacion de hardware: las cifras de precision y velocidad se midieron en una unica B200. Las cifras de memoria para DGX Spark estan calculadas a partir de la huella de pesos medida, no verificadas sobre hardware Spark. El autor solicita informes de propietarios de Spark en la pestana de comunidad.
- No cabe en un solo DGX Spark: los pesos por si solos (141 GiB) superan los 128 GB de memoria unificada de un unico nodo. Requiere dos nodos o una GPU Blackwell de 180 GB o mas.
- No cabe en GPU de consumo: no hay ninguna configuracion de GPU consumer capaz de alojar los 141 GiB de pesos.
- Benchmarks con ruido: la decodificacion MoE en vLLM no es determinista a nivel de bit y todas las ejecuciones son unicas; el autor recomienda tratar ±2-3 puntos como ruido. Las puntuaciones son estrictas y penalizan las respuestas truncadas.
- Dependencia critica del presupuesto de pensamiento: en GPQA-Diamond la puntuacion cae de 90,9 % con `effort=max` a 78,3 % con `effort=low`, y en AIME 2025 de 88,3 % a 75,0 %. En problemas dificiles el modelo puede consumir mas de 130.000 tokens, lo que exige memoria para cache KV y afecta directamente al coste.
- Idiomas limitados: solo ingles y chino. No hay soporte declarado de castellano ni de otras lenguas.
- Datos de entrenamiento no disponibles: no se documentan el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. Tampoco se documentan sesgos conocidos ni tasas de alucinacion medidas.
- Seccion de tool calling incompleta: la model card incluye un encabezado de BFCL v4 (function calling, AST match), pero el contenido aparece truncado en la informacion disponible, por lo que el rendimiento real en function calling no puede evaluarse.
- Licencia MIT en este derivado: permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base zai-org/GLM-5.3-Flash, que no se detalla en la informacion proporcionada.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, creado el 6 de octubre de 2026 y actualizado el 7 de octubre de 2026. No hay validacion independiente de terceros.
- Requisitos de memoria en produccion: ademas de los pesos hay que presupuestar cache KV, CUDA graphs, sistema operativo y escritorio. El margen por nodo en una pareja de DGX Spark es de unos 40 GiB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/autotrust/GLM5.3-Flash-E224-DGX-Spark
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Capa MTP incluida en el repositorio: https://huggingface.co/autotrust/GLM5.3-Flash-E224-DGX-Spark/tree/main/mtp

Nota sobre la busqueda web: la busqueda realizada no ha devuelto ningun resultado relevante sobre este modelo ni sobre su modelo base. Todos los resultados obtenidos corresponden a paginas de entidad bancaria sin relacion con el tema, por lo que no se incluyen. No se dispone de enlaces a papers, blogs tecnicos, repositorios de codigo ni demos adicionales.
