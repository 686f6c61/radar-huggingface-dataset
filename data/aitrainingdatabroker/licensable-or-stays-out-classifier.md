# aitrainingdatabroker/licensable-or-stays-out-classifier

## Resumen

El modelo `licensable-or-stays-out-classifier` es un clasificador de texto binario desarrollado por AI Training Data Broker, un intermediario y asesor tecnico especializado en la venta y licencia de datos corporativos a laboratorios de IA. El modelo recibe la descripcion de un tipo de registro corporativo o de un limite sobre el mismo y determina si ese elemento puede considerarse candidato a licencia (`can_be_considered`) o si, por el contrario, queda fuera del alcance (`stays_out`).

Tecnicamente es un fine-tuning de `distilroberta-base`, un transformer encoder de 82,1 millones de parametros, entrenado durante 6 epocas en una unica GPU RTX 3070. El modelo esta pensado como una primera pasada de triaje: dada una lista de activos de datos de una empresa, separa rapidamente lo que merece revision de lo que probablemente no, de modo que el equipo humano pueda centrarse primero en los limites.

Su relevancia es acotada pero concreta: cubre una necesidad operativa en el flujo de preparacion de datos para licenciamiento (clasificar registros y limites antes de una revision legal), con una licencia Apache 2.0 permisiva y un tamano que permite ejecutarlo en cualquier equipo. No es un modelo de razonamiento ni un asistente general, sino una herramienta de clasificacion de dominio muy especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, `distilroberta-base`) |
| Parametros totales | 82.119.938 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto (binaria: `can_be_considered` / `stays_out`) |
| Modelo base | `distilbert/distilroberta-base` |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de `distilroberta-base`, una version destilada de RoBERTa con 6 capas y 82 millones de parametros, sobre la que se anade una cabeza de clasificacion de secuencia para dos etiquetas. Se trata, por tanto, de un encoder bidireccional clasico, no de un modelo generativo: no produce texto, sino una distribucion de probabilidad sobre las dos clases.

El entrenamiento consistio en un fine-tuning de 6 epocas sobre una GPU RTX 3070, con un conjunto de 224 pasajes extraidos de dos datasets propios publicados por el autor (`company-data-licensability-by-industry` y `company-record-types-and-limits`), cuyo texto proviene de las paginas publicas de aitrainingdatabroker.com. La particion de evaluacion es destacable por su diseno de generalizacion: se entreno con descripciones de items de las paginas de industria y se evaluo con descripciones de las paginas de tipos de registro, un dominio distinto al del entrenamiento. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de este tipo. Los scripts de construccion del dataset y de entrenamiento estan incluidos en el directorio `source/` del repositorio.

## Capacidades

- Clasificacion de texto binaria: asigna a cada descripcion la etiqueta `can_be_considered` o `stays_out`.
- Devuelve puntuaciones de confianza por etiqueta (compatible con `top_k` en el pipeline de transformers).
- Triaje de listas de activos de datos corporativos: separa candidatos a licencia de limites o restricciones.
- Dominio especifico de licenciamiento de datos para entrenamiento de IA y cumplimiento (compliance).
- Funciona sobre descripciones en ingles; no se documenta soporte multilingue.
- No dispone de tool calling, function calling, capacidad de agente, modo de razonamiento extendido, vision ni audio.
- No genera texto: es exclusivamente un clasificador.

## Casos de uso

- Triaje inicial de inventarios de datos: dada una lista de tipos de registro que posee una empresa (por ejemplo, "numeros de tarjeta de pago y direcciones de facturacion en el sistema de soporte"), el modelo marca que lineas son candidatas a licencia y cuales son limites, permitiendo que el equipo legal revise primero estas ultimas.
- Preparacion de un data room para venta o licencia de datos: antes de compartir un catalogo con un laboratorio de IA, se pasa cada descripcion por el clasificador para detectar elementos que probablemente deban excluirse o tratarse con cautela.
- Enriquecimiento de pipelines de catalogacion: integrado como paso previo en un ETL de metadatos, etiqueta automaticamente cada registro del catalogo con su estatus de licenciabilidad y alimenta un campo de revision manual.
- Filtrado en herramientas internas de compliance: conectado a un formulario o interfaz donde el usuario describe un registro, devuelve una primera senal sobre si entra en el ambito de licenciamiento, con la advertencia de que no sustituye al asesoramiento legal.
- Clasificacion por lotes en CPU: al ser un modelo de 82 millones de parametros, puede procesar grandes volumenes de descripciones en infraestructura modesta, lo que lo hace adecuado para preclasificar catalogos completos antes de la revision humana.
- Prototipado y demostraciones: sirve como componente en Spaces o demos (el autor publica `company-data-licensability-explorer` y `company-record-types-and-limits-finder`) para ilustrar flujos de evaluacion de licenciabilidad de datos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 274 filas de test reservadas (evaluacion cruzada de dominio: entrenado en paginas de industria, evaluado en paginas de tipos de registro):

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0,956 |
| F1 macro | 0,954 |

| Etiqueta | F1 | Numero de ejemplos |
|---|---|---|
| `can_be_considered` | 0,963 | 166 |
| `stays_out` | 0,946 | 108 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (82 millones de parametros, ~0,33 GB en fp32); menos de 0,5 GB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor entreno en una RTX 3070. Tambien funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1060 en adelante, RTX 3060/4060, etc.) e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: pipeline de `transformers`, Text Embeddings Inference (el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`), exportacion a ONNX y cuantizacion via herramientas externas.
- Latencia y throughput: no se han publicado mediciones. Por el tamano del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directos en la misma tarea (clasificacion de licenciabilidad de datos corporativos). Como referencia estructural, se compara con el modelo base y con clasificadores encoder genericos:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `licensable-or-stays-out-classifier` | 82,1 M | no disponible | Clasificacion binaria de licenciabilidad | Apache 2.0 | HuggingFace |
| `distilroberta-base` (base) | 82,1 M | 512 tokens (estandar de RoBERTa) | Modelo de lenguaje enmascarado | Apache 2.0 | HuggingFace |
| `roberta-base` | 125 M | 512 tokens (estandar) | Modelo de lenguaje enmascarado | MIT | HuggingFace |

Las cifras de contexto de los modelos base corresponden a la arquitectura estandar de RoBERTa; el autor no especifica la longitud de contexto configurada para este fine-tuning.

## Limitaciones y advertencias

- Las etiquetas binarias ocultan matices: un registro puede ser licenciable solo en parte o solo tras anonimizacion, y el modelo no captura esa gradacion.
- El modelo reacciona a la redaccion concreta de las paginas del autor; su comportamiento puede degradarse con vocabulario o estilo distintos. El propio autor recomienda validarlo sobre la lista propia antes de confiar en el.
- No constituye asesoramiento legal ni certificacion; requiere revision humana antes de tomar decisiones o compartir datos.
- Entrenado con solo 224 pasajes, un volumen muy reducido que limita la cobertura de casos y aumenta el riesgo de sobreajuste al dominio del autor.
- Solo soporta ingles; no hay soporte multilingue documentado.
- No se han publicado datos sobre sesgos, calibracion ni robustez frente a entradas adversarias.
- La licencia Apache 2.0 permite uso comercial, pero el autor solicita atribucion a AI Training Data Broker y enlace a su web al compartir o construir sobre el modelo.
- No debe usarse como unico criterio en produccion para decisiones de cumplimiento o legales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aitrainingdatabroker/licensable-or-stays-out-classifier
- Dataset de licenciabilidad por industria: https://huggingface.co/datasets/aitrainingdatabroker/company-data-licensability-by-industry
- Dataset de tipos de registro y limites: https://huggingface.co/datasets/aitrainingdatabroker/company-record-types-and-limits
- Space explorador de licenciabilidad: https://huggingface.co/spaces/aitrainingdatabroker/company-data-licensability-explorer
- Space buscador de tipos de registro y limites: https://huggingface.co/spaces/aitrainingdatabroker/company-record-types-and-limits-finder
- Como funciona la venta de datos corporativos a laboratorios de IA: https://aitrainingdatabroker.com/how-it-works/
- Responsabilidad al licenciar datos a IA: https://aitrainingdatabroker.com/sell/liability/
- Guias de tipos de registro y exportacion: https://aitrainingdatabroker.com/data/
- Web del autor: https://aitrainingdatabroker.com/
