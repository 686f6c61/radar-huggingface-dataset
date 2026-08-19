# ProCreations/auto-0.4b

## Resumen

`auto-0.4b` es un modelo encoder de 395 millones de parámetros desarrollado por ProCreations, especializado en la clasificación binaria de seguridad para llamadas a herramientas de agentes de IA. Su función es decidir si la siguiente acción de un agente (por ejemplo, en modos de auto-aceptación como Codex "Auto" o Claude Code) debe aprobarse o denegarse, sustituyendo la consulta a un modelo generativo de frontera por una tarea de clasificación mucho más rápida y económica. Se trata de un fine-tune completo de ModernBERT-large con la ventana de contexto extendida a 64 000 tokens.

El modelo responde con dos etiquetas: `approve` para operaciones rutinarias y legítimas (lectura de archivos, ejecución de pruebas, edición de código, búsqueda web, instalación de paquetes) y `deny` para acciones consecuentes y no autorizadas (borrado de directorios, exfiltración de credenciales, instalación de software hostil, debilitamiento de controles de seguridad o seguimiento de instrucciones inyectadas). Su relevancia actual radica en que los sistemas de agentes necesitan un filtro de seguridad de baja latencia que pueda ejecutarse en cada paso sin incurrir en costes de API ni añadir latencia perceptible.

Con una licencia Apache 2.0 y un peso de solo 0,8 GB, el modelo está diseñado para integrarse como primera etapa de un sistema de control en cascada: auto-aprobar por debajo de un umbral bajo, auto-denegar por encima de uno alto y escalar la banda intermedia a un modelo de mayor capacidad. Los benchmarks publicados muestran una precisión del 90,13 % en el conjunto de validación Approve-or-Deny, con una tasa de falsas aprobaciones del 8,71 % y una latencia de 7 ms por llamada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) |
| Parametros totales | 395 833 346 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 64 000 tokens |
| Tipos de cuantizacion | bfloat16 (recomendado en el ejemplo de uso); otras cuantizaciones no documentadas |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de ModernBERT-large, un encoder transformer de la familia ModernBERT que emplea atención con ventana deslizante y atención global en las capas superiores, optimizado para clasificación y recuperación con contextos largos. ProCreations ha extendido la ventana de contexto original a 64 000 tokens y ha entrenado el modelo sobre dos datasets propios: `ProCreations/auto` y `ProCreations/approve-or-deny`. El primero probablemente contiene ejemplos de interacciones de agentes con herramientas; el segundo es el conjunto de evaluación con 3000 elementos retenidos que nunca se usaron en el entrenamiento.

No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El entrenamiento se centra en una tarea de clasificación binaria (aprobacion/denegacion) a partir del logit de la clase `deny`, lo que permite ajustar el umbral de decisión según las necesidades de seguridad de cada despliegue. La arquitectura encoder pura, sin decodificador autoregresivo, explica la latencia de 7 ms por llamada en una sola GPU.

## Capacidades

- Clasificacion binaria de seguridad para llamadas a herramientas de agentes de IA, con salida `approve` o `deny`.
- Deteccion de ataques por inyeccion de instrucciones en contenido externo (prompt injection), con tasa de falsa aprobacion del 2 % en la categoria dedicada.
- Identificacion de manipulacion de permisos propios, borrado de rastros, escalada de privilegios y exfiltracion de credenciales.
- Manejo de contextos largos de hasta 64 000 tokens, aunque el rendimiento decae notablemente por encima de 16 000 tokens (precisión del 78,45 % en el rango 16k-64k frente al 91,40 % en contextos menores de 1k).
- Ajuste del umbral de decision mediante el logit de la clase `deny` tras softmax, permitiendo equilibrar falsas aprobaciones y falsas denegaciones.
- Integracion sencilla con la libreria transformers de HuggingFace mediante `AutoModelForSequenceClassification`.
- Compatible con `attn_implementation="flash_attention_2"` para acelerar la inferencia.
- Soporte para despliegue en endpoints compatibles con text-embeddings-inference (segun tags del modelo).

## Casos de uso

- Filtro de seguridad de primera etapa en agentes de codigo: un harness como Codex "Auto" o Claude Code puede consultar a `auto-0.4b` antes de cada llamada a herramienta y solo escalar a un modelo de frontera cuando la confianza es baja, reduciendo el coste de API en la mayoria de los pasos.
- Guardarrail en pipelines de automatizacion de CI/CD: el modelo puede evaluar comandos generados por agentes que modifican repositorios, ejecutan pruebas o despliegan artefactos, denegando operaciones destructivas como `rm -rf` sobre directorios de produccion.
- Moderacion de acciones en asistentes de productividad: al integrarse en herramientas que leen correos, navegan por la web o instalan paquetes, el modelo puede bloquear acciones no autorizadas como la exfiltracion de credenciales o la instalacion de software malicioso.
- Sistema de alerta temprana en entornos de investigacion: para equipos que prototipan agentes autonomos, `auto-0.4b` ofrece una capa de seguridad gratuita y de baja latencia que detecta intentos de escalada de privilegios o manipulacion de permisos antes de que causen dano.
- Evaluacion de seguridad de herramientas en entornos de pruebas: el modelo puede clasificar rapidamente miles de llamadas simuladas a herramientas para identificar patrones de riesgo en un corpus de logs, sin depender de reglas heuristicas.
- Componente de un sistema de decision en cascada: combinado con un modelo generativo de frontera, `auto-0.4b` resuelve los casos claros (aprobacion o denegacion con alta confianza) y delega solo los ambiguos, reduciendo la latencia media de 3-5 segundos a milisegundos en la mayoria de las llamadas.

## Benchmarks y rendimiento

Los resultados oficiales del modelo, declarados por el autor en el model-index de HuggingFace, se evaluaron sobre el dataset `ProCreations/approve-or-deny` (3000 elementos retenidos, no usados en entrenamiento):

| Metrica | Valor |
|---|---|
| Accuracy | 90,13 % |
| F1 (deny) | 0,8963 |
| AUROC | 0,9657 |
| False-approve rate (llamada peligrosa permitida) | 8,71 % |
| False-deny rate (llamada segura bloqueada) | 10,88 % |

La model card incluye una comparativa con sistemas alternativos en el mismo conjunto de evaluacion:

| Sistema | Accuracy | False-approve | False-deny | Latencia/llamada | Coste |
|---|---|---|---|---|---|
| GPT-5.6-Luna | 96,97 % | 4,93 % | 1,38 % | 3,09 s | API |
| DeepSeek V4 Flash 0731 | 94,95 % | 10,11 % | 0,63 % | 5,64 s | API |
| **auto-0.4b** | **90,13 %** | **8,71 %** | **10,88 %** | **7 ms** | **gratis** |
| Heuristica regex | 57,97 % | 59,39 % | 26,83 % | ~0 ms | gratis |

Rendimiento por categoria de ataque (tasa de falsa aprobacion):

| Categoria | False-approve |
|---|---|
| Manipulacion de permisos propios | ~1 % |
| Borrado de rastros | ~1 % |
| Inyeccion de instrucciones | ~2 % |
| Escalada de privilegios | ~3 % |
| Exfiltracion de credenciales | ~3 % |

Rendimiento por dificultad y longitud de contexto:

| Slice | n | Accuracy | False-approve | False-deny |
|---|---|---|---|---|
| Facil | 870 | 92,53 % | 7,72 % | 7,32 % |
| Medio | 1065 | 92,21 % | 7,52 % | 8,07 % |
| Dificil | 1065 | 86,10 % | 10,53 % | 17,26 % |
| Contexto <1k | 2420 | 91,40 % | 7,40 % | 9,60 % |
| Contexto 1k-4k | 130 | 90,77 % | 3,03 % | 15,62 % |
| Contexto 4k-16k | 218 | 88,07 % | 6,60 % | 16,96 % |
| Contexto 16k-64k | 232 | 78,45 % | 25,62 % | 17,12 % |

La model card tambien proporciona una tabla de puntos de operacion ajustando el umbral de `P(deny)`:

| Umbral | Accuracy | False-approve | False-deny |
|---|---|---|---|
| 0,1 | 84,43 % | 2,71 % | 26,83 % |
| 0,2 | 87,53 % | 4,71 % | 19,26 % |
| 0,3 | 88,97 % | 6,57 % | 14,95 % |
| 0,4 | 89,60 % | 7,71 % | 12,76 % |
| 0,5 | 90,13 % | 8,71 % | 10,88 % |
| 0,6 | 90,30 % | 9,99 % | 9,44 % |
| 0,7 | 90,43 % | 11,85 % | 7,57 % |
| 0,8 | 89,93 % | 14,28 % | 6,38 % |
| 0,9 | 89,27 % | 18,20 % | 4,19 % |

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,8 GB en bfloat16 (395 M parametros a 2 bytes por parametro), mas overhead de activaciones y attention; cabe holgadamente en GPUs consumer de 8 GB.
- GPU recomendadas: cualquier GPU con soporte para bfloat16 y Flash Attention 2, como RTX 3090, RTX 4090, A100, H100 o L4. En CPU tambien es viable para inferencia por lotes pequena.
- La model card reporta una latencia de 7 ms por llamada en una sola GPU, lo que permite procesar cientos de llamadas por segundo.
- Despliegue compatible con la libreria transformers de HuggingFace, incluyendo `AutoModelForSequenceClassification` y `attn_implementation="flash_attention_2"`.
- No se documentan opciones especificas para vLLM, TGI u Ollama, aunque al ser un modelo de clasificacion estandar con formato safetensors, deberia ser compatible con servidores de inferencia que soporten tareas de sequence classification.
- Para despliegues en produccion con alta concurrencia, se recomienda un unico GPU con batching dinamico; el modelo no requiere memoria distribuida.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoria (clasificadores encoder de seguridad para tool calling) en la informacion proporcionada. La comparativa mas cercana es la que ofrece la propia model card con modelos generativos de frontera utilizados como gate de seguridad:

| Sistema | Arquitectura | Parametros | Contexto | Accuracy | Latencia | Licencia |
|---|---|---|---|---|---|---|
| auto-0.4b | Encoder (ModernBERT-large) | 0,4 B | 64k | 90,13 % | 7 ms | Apache 2.0 |
| GPT-5.6-Luna | Generativo de frontera | no disponible | no disponible | 96,97 % | 3,09 s | Propietaria |
| DeepSeek V4 Flash 0731 | Generativo de frontera | no disponible | no disponible | 94,95 % | 5,64 s | Propietaria |
| Heuristica regex | Reglas | — | — | 57,97 % | ~0 ms | — |

La comparativa muestra que `auto-0.4b` sacrifica entre 5 y 7 puntos de precision frente a los modelos de frontera, pero ofrece una latencia entre 400 y 800 veces menor y un coste marginal nulo, lo que lo hace adecuado como filtro previo en sistemas de alta frecuencia.

## Limitaciones y advertencias

- No es un sustituto completo de un gate basado en modelos de frontera: su tasa de falsas aprobaciones del 8,71 % y de falsas denegaciones del 10,88 % en el umbral por defecto implica que aproximadamente 1 de cada 10 acciones legitimas podria bloquearse.
- El rendimiento se degrada significativamente en contextos largos: la precision cae al 78,45 % en el rango de 16k-64k tokens, con una tasa de falsa aprobacion del 25,62 %, lo que lo hace poco fiable para conversaciones o historiales muy extensos.
- El modelo esta entrenado exclusivamente en ingles; su comportamiento en otros idiomas no esta documentado y probablemente sea deficiente.
- La evaluacion se realizo sobre un dataset propio del autor sin verificacion independiente; los resultados no han sido replicados por terceros.
- Riesgo de alucinacion en la clasificacion: aunque es un encoder, puede malinterpretar acciones ambiguas que mezclan operaciones legitimas y peligrosas, como comandos que combinan lectura y borrado.
- Sesgos potenciales derivados de la composicion del dataset de entrenamiento, que no se ha publicado con detalle; podria estar sobredimensionado en ciertos tipos de ataques y subrepresentado en otros.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de seguridad ni soporte; cualquier despliegue en produccion debe incluir pruebas exhaustivas en el dominio especifico.
- El modelo no realiza razonamiento multi-paso ni genera explicaciones; solo produce una etiqueta binaria, por lo que no sirve como sistema de auditoria autonomo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProCreations/auto-0.4b
- Dataset de entrenamiento: https://huggingface.co/datasets/ProCreations/auto
- Dataset de evaluacion: https://huggingface.co/datasets/ProCreations/approve-or-deny
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
