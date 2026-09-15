# chris0809/scope-intent-distilmbert

## Resumen

El modelo `chris0809/scope-intent-distilmbert` es un ajuste fino completo (*full fine-tune*) del encoder multilingue `distilbert/distilbert-base-multilingual-cased`, desarrollado por el usuario chris0809 y publicado en HuggingFace. Su funcion no es generar texto, sino actuar como **clasificador binario de enrutado de intenciones**: dada una peticion de usuario, decide si puede responderse de forma directa (`DIRECT_RESPONSE`) o si requiere resolver primero un contrato de alcance con herramientas o estado externo (`REQUIRES_SCOPE_CONTRACT`). Es, por tanto, un componente de infraestructura para sistemas de agentes, no un modelo conversacional.

El problema que resuelve es el coste de invocar herramientas o contextos externos de forma innecesaria: un enrutador ligero permite decidir en milisegundos si merece la pena activar un *tool call*, consultar un sistema de ficheros o resolver permisos antes de continuar. Con 135.326.210 parametros y un tamano de repositorio de 0,5 GB, el modelo es lo bastante pequeno para ejecutarse en CPU o en cualquier GPU de gama de consumo, lo que lo hace apto como pre-filtro en pipelines de agentes.

La relevancia actual viene de su nicho: los enrutadores de intencion son una pieza habitual en arquitecturas de agentes con multiples herramientas, y este modelo se publica con metadatos de umbral (`router_metadata.json`) y un dataset propio de 20.000 ejemplos sinteticos. Es un modelo muy reciente y con una adopcion practicamente nula (0 descargas, 0 *likes* en el momento de la consulta), por lo que debe tratarse como un artefacto experimental sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilado de BERT-base multilingual cased) |
| Parametros totales | 135.326.210 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (limite posicional maximo del modelo base) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en safetensors (precision completa) |
| Idiomas soportados | zh, en (idiomas declarados por el autor; el modelo base cubre mas idiomas, no validados en este ajuste) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con Transformers) |

Otros datos: tarea `text-classification`, 2 etiquetas de salida, repositorio de 0,5 GB, creado el 2026-09-15, actualizado el 2026-09-15.

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un encoder transformer de 6 capas y 768 dimensiones ocultas obtenido mediante destilacion del modelo BERT-base multilingual cased. Sobre esa base, el autor ha realizado un *full fine-tune* con una cabeza de clasificacion de secuencias de 2 clases, sustituyendo la cabeza enmascarada original. Esto implica que no hay decodificacion autorregresiva, *attention* lineal ni mecanismos de decodificacion especulativa: es un clasificador puro de una sola pasada, lo que determina tanto su latencia como sus limites (no puede truncar ni resumir entradas largas).

El entrenamiento se apoya en el dataset `chris0809/scope-intent-routing-20k`, un conjunto sintetico de aproximadamente 20.000 ejemplos propio del autor. No se documenta en la informacion disponible el numero de tokens procesados, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o calibracion posterior mas alla del umbral conservador almacenado en `router_metadata.json`. La evaluacion publicada se realizo sobre un *held-out* de 3.000 ejemplos procedentes de "familias semilla" excluidas del entrenamiento, es decir, con control de solapamiento por familia, lo cual es una practica metodologica razonable pero que no sustituye a una validacion en datos reales de produccion (el propio autor lo advierte de forma explicita).

## Capacidades

- Clasificacion binaria de intencion: distingue entre peticiones que se resuelven directamente y peticiones que requieren resolver un contrato de alcance con herramientas o estado externo.
- Enrutado previo a *tool calling*: la salida `REQUIRES_SCOPE_CONTRACT` actua como senal para activar la resolucion de alcance antes de ejecutar herramientas.
- Clasificacion en una unica pasada, sin generacion de texto ni razonamiento multi-paso.
- Soporte multilingue limitado a los idiomas declarados (chino y ingles) en este ajuste concreto.
- Manejo de entradas cortas: el ejemplo de la *model card* es una instruccion en chino de pocos caracteres ("把我收藏夹里的文件移到归档区").
- Umbral ajustable por el usuario: el modelo expone una probabilidad via `softmax` sobre los logits, de modo que la decision final depende del umbral conservador guardado en `router_metadata.json` y puede modificarse.
- No soporta *function calling* nativo, agentes, vision, audio ni modo de razonamiento extendido: es un cabezal clasificador, no un modelo generativo.

## Casos de uso

- **Enrutado en arquitecturas de agentes con herramientas**: el modelo se coloca como primera etapa del pipeline y decide si la peticion del usuario debe pasar por un resolutor de contrato de alcance (permisos, estado del sistema, ficheros) antes de invocar cualquier herramienta, reduciendo llamadas innecesarias.
- **Pre-filtro de coste antes de un LLM grande**: en lugar de enviar cada consulta a un modelo generativo, se clasifica primero; las peticiones `DIRECT_RESPONSE` pueden resolverse con una ruta barata y solo las `REQUIRES_SCOPE_CONTRACT` activan el flujo completo con contexto externo.
- **Gestion de permisos y accesos en asistentes corporativos**: cuando la peticion implica mover, leer o modificar recursos (el ejemplo de la *model card* es mover ficheros de una carpeta), el enrutador fuerza una comprobacion previa de alcance y autorizacion.
- **Atencion al cliente con backends heterogeneos**: clasificar si una consulta necesita consultar el estado del pedido, el CRM o el sistema de facturacion, o si basta con una respuesta de conocimiento general; el modelo actua como conmutador entre rutas.
- **Reduccion de latencia en asistentes de voz o chat en tiempo real**: al ser un encoder de 135 M de parametros, la clasificacion puede ejecutarse en CPU en el mismo proceso, evitando el coste de red y de arranque de un modelo generativo.
- **Enrutado bilingue chino-ingles**: util en productos con usuarios de ambos idiomas donde la decision de alcance debe tomarse antes de la respuesta, sin depender de un modelo multilingue de mayor tamano.
- **Instrumentacion y analitica de intenciones**: uso *offline* para etiquetar grandes volumenes de peticiones historicas y medir que proporcion requiere acceso a estado externo, alimentando decisiones de producto.
- **Filtro de seguridad previo**: marcar peticiones que, por requerir estado externo, deben pasar por controles adicionales antes de ejecutarse.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los publicados por el propio autor en la *model card*, sobre un *held-out* sintetico de 3.000 ejemplos de familias semilla excluidas del entrenamiento. El autor advierte que son resultados sinteticos y que no establecen precision en produccion.

| Metrica | Valor |
|---|---:|
| Accuracy | 84,80 % |
| ROC-AUC | 97,42 % |
| Precision (clase *scope*) | 77,10 % |
| Recall (clase *scope*) | 99,00 % |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable dado que se trata de un clasificador de dominio especifico y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada: los pesos en `safetensors` (precision completa) ocupan aproximadamente 0,5 GB en disco; en fp32 la inferencia requiere del orden de 0,6-1 GB de memoria incluyendo activaciones, en fp16 aproximadamente 0,3 GB y en int8 unos 0,15 GB.
- Cabe sin problema en cualquier GPU de consumo: GTX 1060 6 GB, RTX 3060, RTX 4090, e incluso en GPUs integradas o en CPU.
- GPU de centro de datos (A100, H100) no son necesarias; solo tienen sentido si se busca *batching* masivo.
- Inferencia en CPU perfectamente viable: al ser un encoder de 135 M de parametros con contexto maximo de 512 tokens, es adecuado como servicio embebido o en un contenedor ligero.
- Opciones de despliegue: Hugging Face Transformers (ruta oficial documentada en la *model card*), exportacion a ONNX Runtime u Optimum para acelerar en CPU, TorchScript, NVIDIA Triton y servidores de inferencia compatibles con modelos de clasificacion. No se recomienda vLLM, ya que esta orientado a decodificacion autorregresiva.
- Latencia y throughput: no disponibles oficialmente. Como estimacion orientativa, un encoder de este tamano suele resolver *batches* pequenos en pocos milisegundos en GPU y en decenas de milisegundos en CPU, pero estos valores no estan publicados por el autor y deben medirse en el entorno real.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados para este modelo. La tabla siguiente compara caracteristicas estructurales con alternativas habituales para clasificacion de texto multilingue; los datos de rendimiento de los modelos alternativos no se han evaluado en este contexto concreto.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento en esta tarea |
|---|---:|---:|---|---|---|
| chris0809/scope-intent-distilmbert | 135 M | 512 | zh, en (declarados) | apache-2.0 | Accuracy 84,80 %, ROC-AUC 97,42 % (evaluacion sintetica propia) |
| distilbert/distilbert-base-multilingual-cased (modelo base) | aprox. 134 M | 512 | multilingue (aprox. 104 idiomas) | apache-2.0 | no disponible (no ajustado a esta tarea) |
| XLM-RoBERTa-base | aprox. 278 M | 512 | multilingue | MIT | no disponible |
| mDeBERTa-v3-base | aprox. 278 M | 512 | multilingue | MIT | no disponible |

La ventaja estructural del modelo frente a XLM-RoBERTa-base o mDeBERTa-v3-base es el tamano (aproximadamente la mitad de parametros) y, por tanto, la latencia y el coste de despliegue; la contrapartida es un alcance idiomatico declarado mas reducido y una validacion experimental mucho mas limitada.

## Limitaciones y advertencias

- **Datos de evaluacion sinteticos**: el propio autor indica que las metricas provienen de un *held-out* sintetico y que no establecen precision en produccion. No hay validacion con trafico real.
- **Precision de la clase *scope* del 77,10 %**: con un recall del 99 %, el umbral conservador genera un volumen apreciable de falsos positivos; es decir, clasificara como `REQUIRES_SCOPE_CONTRACT` peticiones que podrian resolverse directamente. Esto es intencionado (sesgo hacia la seguridad) pero tiene coste operativo.
- **Sin adopcion ni validacion independiente**: 0 descargas y 0 *likes* en el momento de la consulta, sin issues ni terceros que hayan replicado los resultados.
- **Riesgo de error de clasificacion**: al no ser un modelo generativo no alucina texto, pero si puede equivocarse en el enrutado, lo que en un agente puede derivar en una herramienta no invocada o en una resolucion de alcance innecesaria.
- **Contexto limitado a 512 tokens**: las peticiones largas se truncan con `truncation=True` en el ejemplo oficial; si la senal de intencion aparece al final de un texto extenso, se perdera.
- **Cobertura idiomatica declarada solo zh y en**: aunque el modelo base es multilingue, el ajuste no documenta evaluacion en otros idiomas y el dataset de entrenamiento es presumiblemente bilingue.
- **Entradas de dominio estrecho**: el dataset es de enrutado de alcance con instrucciones tipo manipulacion de ficheros; el rendimiento fuera de ese dominio no esta caracterizado.
- **Licencia**: apache-2.0 permite uso comercial, modificacion y redistribucion, incluyendo obligacion de conservar avisos de licencia; no hay restricciones adicionales documentadas.
- **Dependencia de metadatos externos**: la decision final requiere el umbral de `router_metadata.json`; si ese fichero no se distribuye correctamente con el modelo, el umbral por defecto puede no ser el conservador previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chris0809/scope-intent-distilmbert
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/chris0809/scope-intent-routing-20k
- Fichero de umbral de decision: https://huggingface.co/chris0809/scope-intent-distilmbert/blob/main/router_metadata.json
- Paper de DistilBERT (referencia de la arquitectura base): https://arxiv.org/abs/1910.01108
- Paper de BERT (referencia del modelo del que se destila la base): https://arxiv.org/abs/1810.04805

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los del repositorio de HuggingFace y las referencias tecnicas de la arquitectura base.
