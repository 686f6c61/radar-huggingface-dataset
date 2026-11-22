# sergolsub/mlx-d3-v3.1.0-27B-4bit

## Resumen

sergolsub/mlx-d3-v3.1.0-27B-4bit es una conversión a 4 bits en formato MLX del modelo vllm-sr/d3, publicada por el usuario sergolsub para su ejecución en Apple Silicon mediante la librería `mlx_lm`. No se trata de un modelo entrenado desde cero ni de un fine-tune: la model card indica explícitamente que la conversión no incluye reentrenamiento ni cambios de arquitectura, sino una dequantización desde la conversión previa a 8 bits y una recuantización afín a 4 bits con el mismo tamaño de grupo.

El modelo base, vllm-sr/d3, está orientado a tareas de decisión estructurada más que a generación de texto libre. La interfaz pública expuesta en la model card es un método `decide()` que recibe un texto y un conjunto de tareas tipadas (`noul`, `choice`, `score`) con instrucciones y criterios, y devuelve una decisión por tarea. Esto sugiere un modelo con cabezas de decisión específicas y un formato de salida restringido, adecuado para clasificación, enrutamiento y puntuación en pipelines de producción.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B en un Mac mini M4 Pro de 48 GB con un consumo de memoria residente de 15,52 GB y un tiempo de carga de 7,42 s, a costa de una pérdida de calidad medida de aproximadamente 1,1 puntos porcentuales en precisión respecto a bf16. Es una opción práctica para prototipado local y para despliegues de baja concurrencia en hardware Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base vllm-sr/d3; sin detalles de arquitectura en la informacion proporcionada) |
| Parametros totales | 27B (segun el nombre del repositorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín (MLX), derivada de una conversion previa a 8 bits; mismo tamano de grupo |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout MLX), mas config.json, tokenizer, chat_template.jinja y glue de inferencia (`*_mlx.py`, `decision_config.json`, `joint_config.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base vllm-sr/d3 en la documentacion proporcionada. La presencia de ficheros `decision_config.json` y `joint_config.json`, junto con un modulo de inferencia propio (`d3_mlx.py`) que expone un metodo `decide()`, indica que el modelo incorpora cabezas de decision acopladas a la representacion del transformer, probablemente con salidas restringidas por tipo de tarea (`noul` booleano, `choice` entre criterios, `score` ordinal). No se especifica si se trata de un transformer denso, MoE o hibrido.

Respecto al entrenamiento, la model card no documenta numero de tokens, composicion del dataset ni uso de RLHF o DPO. Lo unico verificable es el proceso de conversion: los pesos originales en bf16 se convirtieron primero a 8 bits en MLX y despues se dequantizaron y recuantizaron a 4 bits afines con el mismo tamano de grupo. No hubo reentrenamiento ni modificacion de arquitectura. La evaluacion de calidad se realizo contra el modelo original, con resultados de precision de 87,8 % en 4 bits frente a 88,9 % en bf16, y una perplejidad de calibracion de 1,959 frente a 1,977.

## Capacidades

- Decision estructurada por tareas tipadas: el metodo `decide()` acepta un texto de entrada y un diccionario de tareas, cada una con su tipo (`noul`, `choice`, `score`), instrucciones y criterios.
- Clasificacion booleana (`noul`): responde preguntas de si/no sobre el texto de entrada, por ejemplo si el cliente solicita un reembolso.
- Enrutamiento por categorias (`choice`): asigna la entrada a una de las opciones definidas en los criterios, por ejemplo el equipo que debe gestionar una incidencia.
- Puntuacion ordinal (`score`): evalua la entrada segun una escala de criterios ordenados, por ejemplo la severidad de un impacto.
- Procesamiento de multiples tareas por llamada: cada pregunta es un objeto independiente dentro del diccionario de tareas.
- Ejecucion local en Apple Silicon mediante `mlx_lm` y el modulo `d3_mlx.py` incluido en el repositorio.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling ni agentes multi-paso en la informacion proporcionada.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y un conjunto de tareas de tipo `choice` para enrutarlo al equipo adecuado (facturacion, envios, tecnico) y de tipo `score` para asignar severidad. La latencia medida de 2.114 ms por decision es compatible con un enrutamiento asincrono en cola.
- Deteccion de intencion de reembolso: con una tarea `noul` configurada como "Does the customer want a refund?", el modelo clasifica mensajes de clientes antes de pasarlos a un agente humano o a un flujo automatizado de facturacion.
- Priorizacion de incidencias en produccion: usando tareas `score` con criterios como "cosmetico, molesto, bloqueante", el modelo puede puntuar alertas o errores reportados y alimentar un sistema de prioridades.
- Moderacion y etiquetado de contenido: la interfaz de decision tipada permite aplicar multiples criterios booleanos y de eleccion sobre un mismo texto en una sola llamada, util para pipelines de anotacion.
- Prototipado local en equipos con hardware Apple: gracias a los 15,52 GB de memoria residente y los 7,42 s de carga en un Mac mini M4 Pro de 48 GB, el modelo puede integrarse en entornos de desarrollo sin GPU dedicada.
- Evaluacion offline de reglas de negocio: el modelo permite comparar el comportamiento de clasificacion frente a reglas heuristicas antes de desplegar un sistema de decision, con la ventaja de ejecutarse en local y sin dependencias de API.
- Clasificacion por lotes de baja concurrencia: con un rendimiento sostenido de 0,71 decisiones cortas por segundo, es adecuado para procesos por lotes nocturnos o de backoffice donde el throughput no es critico.

## Benchmarks y rendimiento

La model card incluye una evaluacion propia del autor comparando la conversion a 4 bits con los pesos bf16 originales. No se trata de benchmarks estandar (MMLU, HumanEval, GSM8K), sino de metricas internas de calidad y rendimiento.

| Metrica | 4 bits (MLX) | bf16 | Diferencia |
|---|---|---|---|
| Precision global | 87,8 % | 88,9 % | -1,1 pp |
| Noul | 85,0 % | 87,5 % | -2,5 pp |
| Choice | 96,0 % | 96,0 % | 0,0 pp |
| Score | 84,0 % | 84,0 % | 0,0 pp |
| Perplejidad de calibracion | 1,959 | 1,977 | -0,018 |

| Metrica de sistema (Mac mini M4 Pro 48 GB) | Valor |
|---|---|
| Tamano en disco | 14,87 GB |
| Tiempo de carga | 7,42 s |
| Memoria residente maxima | 15,52 GB |
| Latencia mediana por decision | 2.114 ms |
| Throughput sostenido | 0,71 decisiones cortas/s |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 15,52 GB de memoria residente maxima medida en un Mac mini M4 Pro de 48 GB; 14,87 GB en disco.
- GPU recomendadas: Apple Silicon con al menos 24 GB de memoria unificada para margen de seguridad; la medicion oficial se realizo en un M4 Pro de 48 GB. No hay datos de ejecucion en A100, H100 ni RTX 4090, ya que el formato MLX esta orientado a Apple Silicon.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no aplica a GPUs NVIDIA de consumo en este formato.
- Opciones de despliegue: `mlx_lm` con el modulo `d3_mlx.py` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversion.
- Latencia y throughput: mediana de 2.114 ms por decision y 0,71 decisiones cortas por segundo en el hardware de referencia; el tiempo de carga es de 7,42 s.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (modelos de decision estructurada de 27B) en la documentacion proporcionada. La comparacion mas directa disponible es con el propio modelo base y su version de 8 bits.

| Modelo | Parametros | Cuantizacion | Precision medida | Memoria | Licencia |
|---|---|---|---|---|---|
| sergolsub/mlx-d3-v3.1.0-27B-4bit | 27B | 4 bits MLX | 87,8 % | 15,52 GB | apache-2.0 |
| vllm-sr/d3 (bf16) | 27B | bf16 | 88,9 % | no disponible | apache-2.0 |
| Conversion MLX 8 bits de referencia | 27B | 8 bits MLX | no disponible | no disponible | apache-2.0 |

## Limitaciones y advertencias

- La conversion a 4 bits degrada la precision global en 1,1 puntos porcentuales y la metrica `noul` en 2,5 puntos respecto a bf16; en tareas donde los falsos negativos o positivos booleanos sean criticos, conviene evaluar la version de 8 bits o bf16.
- El modelo esta disenado para decisiones estructuradas con tareas tipadas; no se documentan capacidades de generacion de texto libre, razonamiento abierto ni conversacion multi-turno.
- No se dispone de informacion sobre sesgos, idiomas soportados ni comportamiento fuera del dominio de entrenamiento.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al tratarse de un modelo de clasificacion con salidas restringidas, el riesgo se manifiesta principalmente como asignaciones erroneas de categoria o puntuacion.
- La licencia apache-2.0 se hereda de los pesos originales; en caso de conflicto, prevalece la licencia del repositorio upstream vllm-sr/d3.
- La model card advierte de una inconsistencia en la seccion de ficheros: menciona `*.safetensors` como pesos de 8 bits, aunque el repositorio se presenta como conversion a 4 bits; conviene verificar los pesos antes de desplegar en produccion.
- El formato MLX limita el despliegue a Apple Silicon; no hay soporte documentado para CUDA, ROCm ni aceleradores alternativos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no cuenta con pipeline declarado, lo que reduce la evidencia de uso en produccion.
- El rendimiento de 0,71 decisiones por segundo es bajo para cargas de alta concurrencia; no es adecuado como servicio de baja latencia con multiples usuarios simultaneos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/mlx-d3-v3.1.0-27B-4bit
- Modelo base: https://huggingface.co/vllm-sr/d3
