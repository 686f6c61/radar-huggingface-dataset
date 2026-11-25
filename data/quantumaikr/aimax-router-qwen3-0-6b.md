# quantumaikr/aimax-router-qwen3-0.6b

## Resumen

aimax-router-qwen3-0.6b es un modelo de clasificación de intenciones y enrutamiento de peticiones en coreano, desarrollado por quantumaikr y publicado en Hugging Face. Se trata de un ajuste fino del modelo base Qwen/Qwen3-0.6B (Apache-2.0) que recibe una petición de trabajo en una sola línea (junto con el tipo de adjunto) y devuelve un JSON pequeño con la función seleccionada de una lista proporcionada en el prompt, el motor necesario, la urgencia y las tareas de seguimiento. No es un modelo conversacional generalista: es un componente de decisión dentro de un sistema mayor de gestión de recursos.

El modelo se distribuye en formato GGUF con cuantizaciones Q4_K_M y bf16, y comparte el mismo formato de prompt y de salida que su predecesor de 0,1B (`quantumaikr/max-0.1b-aimax-router`), lo que permite sustituirlo directamente en pipelines existentes. Su relevancia radica en que mejora de forma sustancial la selección de funciones nuevas añadidas a la lista (del 32% al 66% en un conjunto sellado independiente) y la precisión global (del 71,2% al 83,6%), a costa de una latencia mayor: unos 0,07-0,12 s por petición en GPU y 0,45-0,57 s en CPU con 6 hilos.

Con 751.632.384 parámetros totales según los pesos en safetensors, el modelo está pensado para despliegue ligero en producción, tanto en GPU como en CPU, y su autor recomienda usarlo en solitario en lugar de una arquitectura de dos etapas con el modelo de 0,1B, que obtuvo puntuaciones inferiores en las mediciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-0.6B); no se detalla configuracion especifica en la informacion disponible |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (distribucion), bf16 (alta precision) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base; el repositorio publica GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y se ha ajustado mediante fine-tuning supervisado para una tarea concreta de clasificacion y enrutamiento. El turno de sistema del prompt contiene una lista de funciones con el formato `id|description|needs`, con las lineas fijas `ask` y `none` al final, y el modelo genera una salida JSON con las claves `action`, `needs`, `urgency`, `follow_up` y `batchable`. El autor indica que los datos de entrenamiento y evaluacion son enteramente sinteticos y que no se utilizaron peticiones reales de miembros; los detalles completos de configuracion y datos se recogen en el archivo `TRAINING.md` del repositorio.

La innovacion principal no esta en la arquitectura sino en el diseno de la tarea y en la ingenieria de salida: el uso de gramaticas GBNF para restringir la generacion al esquema JSON garantiza que la salida sea siempre parseable (el 100% de las salidas fueron JSON valido en todos los conjuntos de evaluacion). El repositorio incluye utilidades de postprocesado (`router_post.py`) con funciones de fusion de unidades y segundos (`v3_merge`) y de compuerta de decision (`v4_gate`), compartidas con el modelo de 0,1B. No se menciona el uso de RLHF ni DPO en la informacion disponible.

## Capacidades

- Clasificacion de intenciones en coreano: identifica a que funcion de una lista dada corresponde una peticion de trabajo de una linea.
- Enrutamiento a motor: determina el motor o recurso necesario para atender la peticion.
- Estimacion de urgencia y de tareas de seguimiento (`follow_up`) y de si la peticion es procesable por lotes (`batchable`).
- Deteccion de peticiones fuera de lista: puede devolver `none` cuando la peticion no encaja con ninguna funcion disponible.
- Deteccion de peticiones inapropiadas o de tipo ataque (el conjunto sellado incluye una categoria de "ataque" con 90% de acierto).
- Manejo de peticiones cortas o consistentes solo en un adjunto (92,5% de acierto en el conjunto sellado B).
- Seleccion de funciones nuevas anadidas a la lista: 75% de acierto en seis funciones nunca vistas incluidas en la lista.
- Salida JSON estructurada garantizada mediante gramatica GBNF.
- No se documentan capacidades de tool calling generico, agentes multi-paso, vision ni audio.

## Casos de uso

- Enrutamiento de peticiones en un asistente interno: el modelo recibe la linea de peticion del usuario y la lista de funciones del sistema, y devuelve que funcion debe ejecutarse, lo que permite despachar la peticion al microservicio o motor adecuado sin intervencion humana.
- Gestion de colas y priorizacion: la salida incluye `urgency` y `batchable`, lo que permite clasificar peticiones en tiempo real y decidir si se procesan de inmediato o se agrupan por lotes para optimizar recursos.
- Filtrado de peticiones fuera de alcance: con la opcion `none` y la deteccion de peticiones inapropiadas, el modelo actua como primera barrera para descartar solicitudes que no corresponden a ninguna capacidad del sistema antes de consumir recursos en modelos mayores.
- Ampliacion incremental de catalogo de funciones: cuando se anaden nuevas funciones a la lista, el modelo las selecciona correctamente en el 75% de los casos en los que se incluyen en la lista, lo que reduce el trabajo de reentrenamiento al desplegar nuevas capacidades.
- Despliegue en entornos sin GPU: con una latencia de 0,45-0,57 s por peticion en CPU con 6 hilos, es viable para sistemas de moderacion o enrutamiento de baja concurrencia en servidores sin acelerador.
- Clasificacion de solicitudes con adjuntos: el modelo incorpora el tipo de adjunto en la entrada y logra un 92,5% de acierto en peticiones cortas o compuestas solo por un adjunto, util en sistemas de gestion documental o de tickets.
- Componente de decision en sistemas de gestion de recursos: el autor lo describe como material de juicio para la operacion de recursos, no como decisor final, por lo que encaja como paso previo a un orquestador que valide o corrija la decision.

## Benchmarks y rendimiento

Los datos publicados por el autor miden la exactitud de `action` en porcentaje, en GPU, con cuantizacion Q4_K_M, restriccion GBNF y el mismo postprocesado para todos los modelos comparados.

| Conjunto | 0.1B solo | aimax-router-qwen3-0.6b | Dos etapas |
|---|---|---|---|
| Conjunto sellado B completo (299, otro autor) | 71,2 | 83,6 | 80,3 |
| - Peticiones normales | 74,2 | 86,7 | 87,5 |
| - Funciones nuevas | 32 | 66 | 50 |
| - Fuera de lista | 89,8 | 87,8 | 87,8 |
| - Inapropiadas | 50 | 75 | 55 |
| - Cortas o solo adjunto | 95 | 92,5 | 95 |
| - Tipo ataque | 80 | 90 | 90 |
| Conjunto sellado A, lista estandar (210) | 84,3 | 93,3 | 91,4 |
| Conjunto sellado A, funciones nuevas en lista (60) | 15,0 | 66,7 | 50,0 |
| Conjunto sellado 298, lista estandar / mixta | 93,6 / 88,9 | 93,3 / 94,0 | 95,0 / 96,0 |
| Seis funciones nunca vistas: en lista / fuera (none) | 3 / 48 | 75 / 50 | 65 / 43 |
| Gold 48, lista estandar / mixta | 97,9 / 91,7 | 100 / 97,9 | 100 / 97,9 |

El JSON valido fue del 100% en todos los conjuntos. La latencia por peticion es de aproximadamente 0,07-0,12 s en GPU (p95 de 75-135 ms, mas lento con listas largas) y de 0,45-0,57 s en CPU con 6 hilos, frente a los 0,14-0,17 s del modelo de 0,1B en CPU.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 751 millones de parametros, la cuantizacion Q4_K_M ocupa del orden de 0,5 GB y la bf16 alrededor de 1,5 GB, mas overhead de contexto y del servidor de inferencia.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta mediciones en GPU sin detallar el modelo empleado.
- Cabe en GPU de consumo: si, por el tamano del modelo, aunque no se confirma con datos del autor.
- Despliegue: el repositorio incluye archivos GGUF y referencias a `llama-server` en el ejemplo de dos etapas, por lo que llama.cpp es la via documentada; no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 0,07-0,12 s por peticion en GPU y 0,45-0,57 s en CPU con 6 hilos; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión (conjunto sellado B) | Licencia | Formato |
|---|---|---|---|---|---|
| aimax-router-qwen3-0.6b | 751.632.384 | no disponible | 83,6% | Apache-2.0 | GGUF |
| quantumaikr/max-0.1b-aimax-router | no disponible (0,1B por nombre) | no disponible | 71,2% | no disponible en la informacion | GGUF |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | no evaluado en la tarea | Apache-2.0 | safetensors |

El predecesor de 0,1B comparte prompt y formato de salida, es mas rapido en CPU (0,14-0,17 s) pero falla al seleccionar funciones nuevas (32% frente a 66%). El modelo base Qwen3-0.6B no esta ajustado para esta tarea y no se ha evaluado con los mismos conjuntos. No se dispone de comparaciones con otros routers de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Baja tasa de acierto al elegir `none` cuando la peticion corresponde a una funcion nueva que no esta en la lista (alrededor del 50%), similar al modelo de 0,1B; el propio autor senala que los anotadores humanos tambien discrepan en estos casos y recomienda fijar una politica y validarla en operacion en sombra.
- Los datos de entrenamiento y evaluacion son enteramente sinteticos, sin peticiones reales de usuarios, lo que puede no reflejar la distribucion real de solicitudes en produccion.
- El modelo solo soporta coreano; no se documenta soporte multilingue.
- Es un modelo de decision, no un decisor final: el autor lo describe como material de juicio para la operacion de recursos, por lo que debe integrarse con validacion o correccion posterior.
- No se documentan sesgos especificos, pero al ser un ajuste fino sobre Qwen3-0.6B con datos sinteticos puede heredar sesgos del modelo base.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificacion de listas de funciones muy largas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-0.6B, tambien Apache-2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quantumaikr/aimax-router-qwen3-0.6b
- Modelo predecesor de 0,1B: https://huggingface.co/quantumaikr/max-0.1b-aimax-router
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
