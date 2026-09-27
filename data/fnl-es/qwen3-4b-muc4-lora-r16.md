# fnl-es/qwen3-4b-muc4-lora-r16

## Resumen

`fnl-es/qwen3-4b-muc4-lora-r16` es un adaptador LoRA (r=16, alpha=16) entrenado sobre el modelo denso `Qwen/Qwen3-4B-Instruct-2507` para una tarea muy concreta: extraccion de eventos a nivel de documento sobre el corpus MUC-4. Dado un documento de prensa y el prompt de sistema definido por el dataset, el modelo devuelve los eventos del documento como un array JSON, y `[]` cuando no hay ninguno. Lo publica el usuario `fnl-es`, autor tambien del dataset `fnl-es/muc4-chat` y del proyecto de codigo abierto `fine-tuning-decoder`.

El interes de la ficha no esta en el tamano del adaptador (el repositorio ocupa 0,2 GB y solo contiene los pesos LoRA, nunca fusionados con el modelo base), sino en que documenta un flujo completo y reproducible de ajuste fino de un decoder pequeno para una tarea de extraccion de informacion clasica. El entrenamiento se hizo con perdida solo sobre la completacion (completion-only loss) sobre 1298 documentos de `fnl-es/muc4-chat` durante 3 epocas, con la configuracion `configs/qwen3-4b-r16.yaml` del proyecto, y la ejecucion quedo registrada en Weights & Biases.

Es relevante ahora porque permite comprobar hasta que punto un modelo de 4B de la familia Qwen3, ajustado con LoRA, puede sustituir a arquitecturas especializadas de extraccion de eventos, y porque sirve como linea base reproducible junto a la adaptacion de la evaluacion GTT incluida en el repositorio del proyecto. No se han publicado resultados de benchmarks ni datos de licencia o idiomas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder denso (modelo base `Qwen/Qwen3-4B-Instruct-2507`) |
| Parametros totales | No disponible para el adaptador (no se indica el numero de parametros entrenables); el modelo base es de 4B (segun su denominacion) |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; la determina el modelo base `Qwen/Qwen3-4B-Instruct-2507` |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors y el pipeline de entrenamiento descrito usa QLoRA |
| Idiomas soportados | No disponible; el corpus MUC-4 esta en ingles, por lo que el ajuste se realiza sobre documentos en ingles |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, nunca fusionado; repositorio de 0,2 GB) |
| Rango y alpha de LoRA | r=16, alpha=16 |
| Modelo base | `Qwen/Qwen3-4B-Instruct-2507` |
| Dataset de entrenamiento | `fnl-es/muc4-chat` (1298 documentos, 3 epocas) |
| Tarea | Extraccion de eventos a nivel de documento (MUC-4), salida en array JSON |
| Libreria | peft |
| Fecha de publicacion | 26 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 16 aplicado sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer decoder denso de la familia Qwen3. La familia Qwen3, descrita en el informe tecnico disponible en arXiv, incluye modelos densos y MoE de 0,6 a 235 mil millones de parametros e integra modos de pensamiento (thinking) y no pensamiento en un mismo marco; en este caso se parte de la variante instruct de 4B, que es la que recibe el ajuste. El adaptador no se ha fusionado con el modelo base en ningun momento: se carga en tiempo de inferencia con `peft.PeftModel.from_pretrained` sobre el modelo base descargado por separado.

El entrenamiento se realizo con perdida aplicada unicamente a la completacion (completion-only loss), lo que concentra el gradiente en la respuesta JSON esperada y no en el prompt de sistema ni en el documento de entrada. Se usaron 1298 documentos del dataset `fnl-es/muc4-chat` durante 3 epocas, siguiendo la configuracion `configs/qwen3-4b-r16.yaml` del proyecto `fine-tuning-decoder`, cuyo README describe el flujo como QLoRA mediante Unsloth/TRL. La evaluacion del proyecto se apoya en una adaptacion de la evaluacion GTT, aunque no se han facilitado cifras de resultados. La ejecucion de entrenamiento esta registrada publicamente en Weights & Biases.

## Capacidades

- Extraccion de eventos a nivel de documento: recibe un documento completo y devuelve sus eventos como array JSON, lo que permite resolver relaciones entre frases que un enfoque oracion a oracion perderia.
- Salida estructurada estricta: el formato esperado es un array JSON, con `[]` como respuesta explicita cuando el documento no contiene eventos.
- Condicionamiento por prompt de sistema: el comportamiento depende del prompt de sistema del dataset MUC-4, que forma parte del contrato de entrada.
- Tarea de extraccion de plantillas: cubre la identificacion de eventos y el relleno de las plantillas propias de MUC-4.
- Razonamiento y generacion general: heredados del modelo base `Qwen/Qwen3-4B-Instruct-2507`, aunque no han sido evaluados especificamente en este adaptador.
- Capacidades multilingues: no documentadas para el adaptador; el ajuste se ha hecho sobre material en ingles.
- Tool calling, function calling y uso agentico: no documentados en la informacion disponible.
- Vision, audio y otros modalidades: no disponibles.

## Casos de uso

- Monitorizacion de prensa y OSINT: procesar flujos de noticias y convertir cada documento en registros de eventos estructurados, aprovechando que la salida ya es JSON y se puede cargar directamente en una base de datos o en un indice de busqueda.
- Construccion de bases de datos historicas de eventos: aplicar el adaptador sobre archivos de prensa digitalizada para reconstruir cronologias de incidentes, una tarea en la que el procesamiento a nivel de documento evita perder eventos mencionados en parrafos distintos.
- Anotacion asistida de corpus: generar preanotaciones que un equipo humano revisa despues, reduciendo el coste de crear nuevos conjuntos etiquetados con el mismo esquema de plantillas.
- Linea base academica reproducible: comparar sistemas clasicos de extraccion de eventos (basados en reglas o en modelos discriminativos) con un decoder de 4B ajustado con LoRA, usando la adaptacion de la evaluacion GTT del proyecto.
- Destilacion y generacion de datos: usar las salidas del adaptador como etiquetas sinteticas para entrenar modelos mas pequenos o mas rapidos especializados en la misma tarea.
- Enriquecimiento de sistemas de alerta temprana: alimentar paneles de situacion con eventos normalizados extraidos de forma automatica, donde la ventana de contexto del modelo base permite tratar documentos largos de una sola pasada.
- Prototipado rapido en entornos con recursos limitados: al ser un adaptador LoRA sobre un modelo de 4B, se puede desplegar en una unica GPU de gama alta de consumo, lo que facilita pilotos sin infraestructura dedicada.
- Reprocesamiento por lotes de colecciones documentales: ejecutar la extraccion sobre corpus completos en pipelines offline, donde el coste por documento es la principal restriccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de precision, recall ni F1, y el repositorio del proyecto menciona una adaptacion de la evaluacion GTT sin aportar numeros. No se dispone tampoco de resultados de MMLU, HumanEval, GSM8K ni de otras pruebas generales para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base, no del adaptador (que ocupa 0,2 GB). Estimaciones orientativas para un modelo de 4B: en bf16/fp16 en torno a 8-10 GB de pesos mas cache KV y activaciones (aproximadamente 10-12 GB en total con contexto moderado); en cuantizacion de 8 bits en torno a 5-7 GB; en 4 bits en torno a 4-6 GB. Son calculos derivados del tamano del modelo base, no datos publicados por el autor.
- GPU recomendadas: para bf16 sin cuantizar, A100 40 GB, H100 o L40S; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) con holgura suficiente.
- GPU de gama media: con cuantizacion de 4 bits el modelo base es viable en tarjetas de 8-12 GB, como RTX 3060 de 12 GB o RTX 4070, segun la longitud de contexto utilizada.
- Despliegue: transformers con `peft` (el metodo documentado en la model card), vLLM o TGI admitiendo adaptadores LoRA sobre el modelo base; llama.cpp u Ollama requieren fusionar previamente el adaptador con el modelo base y convertir el resultado a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fnl-es/qwen3-4b-muc4-lora-r16` | Adaptador LoRA sobre base de 4B (r=16, alpha=16) | No disponible (la marca el modelo base) | Extraccion de eventos MUC-4 a nivel de documento | No disponible | Publicado en HuggingFace, 0 descargas |
| `Qwen/Qwen3-4B-Instruct-2507` sin adaptador | 4B (denso) | No disponible en la informacion proporcionada | Modelo de proposito general | No disponible en la informacion proporcionada | Publicado en HuggingFace |
| `melon1891/agentbench-qwen3-4b-lora-r16` | Adaptador LoRA sobre el mismo base, r=16 | No disponible | Trayectorias multi-turno de agentes (observacion, seleccion de accion, uso de herramientas) | No disponible | Publicado en HuggingFace |

La comparacion con el modelo base sin ajustar es la referencia natural para medir el efecto del adaptador en la tarea, pero no hay cifras publicadas que permitan cuantificarlo. El adaptador de `melon1891` comparte base, rango y metodologia, y sirve como ejemplo del mismo patron de trabajo aplicado a otra tarea.

## Limitaciones y advertencias

- Dominio muy restringido: el adaptador esta especializado en las plantillas de eventos de MUC-4 y no es un extractor de eventos generico.
- Dependencia del prompt: el comportamiento esperado requiere el prompt de sistema del dataset `fnl-es/muc4-chat`; con otros prompts el formato de salida no esta garantizado.
- Idioma: el ajuste se ha hecho sobre documentos en ingles; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir eventos o argumentos que no aparecen en el documento; la salida JSON no implica verificacion factual.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita para uso comercial y conviene consultar las condiciones del modelo base antes de desplegarlo en produccion.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y no se han publicado resultados de evaluacion, por lo que el rendimiento real no esta contrastado de forma independiente.
- Adaptador no fusionado: hay que cargarlo sobre el modelo base; desplegarlo en motores que no soportan LoRA exige fusionar y convertir los pesos.
- Perdida solo sobre la completacion: la optimizacion no penaliza errores en la interpretacion del prompt, lo que puede hacer al modelo sensible a variaciones en la entrada.
- Fechas de publicacion poco habituales en los metadatos (septiembre de 2026), que conviene verificar antes de citar el recurso.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/fnl-es/qwen3-4b-muc4-lora-r16
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/fnl-es/muc4-chat
- Repositorio del proyecto: https://github.com/fnl/fine-tuning-decoder
- README del proyecto: https://github.com/fnl/fine-tuning-decoder/blob/main/README.md
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/flowing/muc4-event-extraction/runs/wef2kzoo
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
