# harshnandwana/visual-jev-budget20-qwen35-0.8b-lora

## Resumen

El modelo `harshnandwana/visual-jev-budget20-qwen35-0.8b-lora` es un adaptador LoRA de tipo PEFT entrenado sobre el modelo base multimodal `Qwen/Qwen3.5-0.8B-Base`. Lo desarrolla el usuario de HuggingFace harshnandwana y resuelve una tarea muy concreta: responder a preguntas especificas sobre una imagen, devolviendo una caja normalizada (bounding box), una eleccion entre opciones o un texto corto. Pertenece a la categoria de visual grounding y su pipeline declarado es `image-text-to-text`.

El adaptador se entreno sobre un subconjunto estratificado de 40.000 filas del dataset `harshnandwana/visual-jev-decisions-v1`, no sobre el split completo. La seleccion se hizo por muestreo de reservorio por tarea con semilla 43801, con 8.000 registros de entrenamiento, 200 de validacion y 200 de test por cada una de las cinco tareas. El entrenamiento completo duro 1,40 horas sobre 2 x NVIDIA L4. El modelo base tiene 0,8B de parametros y el adaptador es de rango 16 aplicado a `q_proj` y `v_proj`.

Es relevante ahora como demostracion de investigacion de bajo coste: muestra como un adaptador pequeno puede mejorar drasticamente tareas de grounding visual sobre un modelo base minusculo, con ganancias medidas en test held-out (por ejemplo, de 0,000 a 0,940 en `box_choice` o de 0,044 a 0,530 en IoU para `ground_bbox`). No es un modelo de proposito general ni un asistente conversacional: es una pieza de investigacion acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.5-0.8B-Base; el base es un transformer multimodal invocado mediante `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 0,8B en el modelo base; el adaptador es LoRA de rango 16 sobre `q_proj` y `v_proj` (numero de parametros del adaptador: no disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son el adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 insertado sobre las proyecciones `q_proj` y `v_proj` del modelo base `Qwen/Qwen3.5-0.8B-Base`. El base es un transformer multimodal que se instancia con la clase `Qwen3_5ForConditionalGeneration`, lo que implica una torre de vision que acepta imagenes y un decodificador de lenguaje que genera texto estructurado. Las imagenes se ajustan a un maximo de 512 x 512 pixeles. No se documenta la arquitectura interna del base (atencion, capas, dimension oculta, tipo de encoder visual) en la informacion disponible.

El entrenamiento se realizo sobre 40.000 filas unicas en una sola epoca (40.000 procesadas incluyendo el padding distribuido), extraidas del dataset `visual-jev-decisions-v1` en la revision `687c745c34846d104ee85af802b9fd444a854f5d`. Se uso AdamW con learning rate 5e-05 y acumulacion de gradiente de 16 por GPU. El shard de etiquetas generadas `luna_candidates.jsonl` se excluyo porque estaba pendiente de auditoria humana. No se alojan bytes de fotos ni en el dataset ni en el repositorio del modelo. La evaluacion se hizo sobre las 1.000 filas del subconjunto de validacion seleccionado y las 1.000 filas del subconjunto de test seleccionado; no se reclama ningun benchmark sobre el split completo.

## Capacidades

- Visual grounding: genera cajas normalizadas (bounding boxes) para objetos descritos en una imagen, evaluado con interseccion sobre union media.
- Eleccion de caja (`box_choice`): selecciona la caja correcta entre opciones dadas.
- Booleanos espaciales (`spatial_boolean`): responde a preguntas de si/no sobre relaciones espaciales entre objetos.
- Descripcion de atributos (`attribute_text`): produce texto corto describiendo atributos de objetos.
- Descripcion de relaciones (`relation_text`): produce texto corto describiendo relaciones entre objetos.
- Preguntas condicionadas por imagen con respuesta de una caja, una eleccion o un texto corto.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, audio, OCR ni modo de pensamiento.
- Capacidad multilingue: unicamente ingles declarado.
- El modelo esta limitado a tareas especificas de grounding visual; no es un modelo de proposito general.

## Casos de uso

- Anotacion asistida de datasets visuales: el adaptador puede proponer bounding boxes normalizadas para objetos descritos textualmente, y su IoU de 0,530 en `ground_bbox` sobre el test seleccionado lo hace util como preanotador que un humano revisa despues, reduciendo el coste de etiquetado manual.
- Verificacion de relaciones espaciales en pipelines de vision: con un 0,900 de acierto en `spatial_boolean` sobre el subconjunto evaluado, sirve para comprobar afirmaciones del tipo "el objeto A esta encima del objeto B" en sistemas de control de calidad de imagenes.
- Clasificacion guiada por opciones: la metrica de 0,940 en `box_choice` permite usarlo como selector entre candidatos predefinidos (por ejemplo, elegir la region correcta en una interfaz de anotacion o en un sistema de recorte automatico).
- Descripcion de atributos de objetos: con 0,785 de exact match en `attribute_text`, puede generar etiquetas cortas de atributos (color, forma, material) para catalogos o metadatos de productos.
- Descripcion de relaciones entre objetos: con 0,800 en `relation_text`, es aplicable a la generacion de tripletes sujeto-relacion-objeto para grafos de conocimiento construidos a partir de imagenes.
- Investigacion y ablaciones academicas: sirve como linea base reproducible de adaptadores LoRA de bajo presupuesto; el repositorio incluye `metrics.json`, `predictions.jsonl`, `selection_manifest.json` y `full_worker.py` para replicar la serializacion de prompts y la seleccion de muestras.
- Prototipado rapido en hardware modesto: al apoyarse en un base de 0,8B, permite experimentar con tareas de grounding sin acceso a GPUs de gama alta.

## Benchmarks y rendimiento

Perdida de validacion (log-verosimilitud negativa media por fila, con teacher forcing):

| Tarea | Filas | Base | Adaptador |
|---|---:|---:|---:|
| ground_bbox | 200 | 0,921 | 0,619 |
| box_choice | 200 | 1,027 | 0,058 |
| spatial_boolean | 200 | 0,430 | 0,075 |
| attribute_text | 200 | 1,559 | 0,248 |
| relation_text | 200 | 4,204 | 0,171 |

Generacion sobre test held-out seleccionado (grounding con IoU media; el resto con exact match insensible a mayusculas tras recortar puntuacion final):

| Tarea | Filas | Base | Adaptador |
|---|---:|---:|---:|
| ground_bbox | 200 | 0,044 | 0,530 |
| box_choice | 200 | 0,000 | 0,940 |
| spatial_boolean | 200 | 0,710 | 0,900 |
| attribute_text | 200 | 0,005 | 0,785 |
| relation_text | 200 | 0,000 | 0,800 |

## Requisitos de hardware

- El modelo base tiene 0,8B de parametros, por lo que la inferencia es viable en GPUs de consumo. No se publican cifras de VRAM especificas en la informacion disponible.
- Entrenamiento documentado: 2 x NVIDIA L4, con un tiempo transcurrido de 1,40 horas para 40.000 filas en una epoca.
- GPU recomendadas: no disponibles de forma explicita; por tamano del base, cualquier GPU con memoria suficiente para un modelo multimodal de 0,8B en `bfloat16` deberia servir (la clase de carga usa `torch.bfloat16`).
- Opciones de despliegue: la model card solo documenta la carga mediante `transformers` (`AutoProcessor`, `Qwen3_5ForConditionalGeneration`) y `peft` (`PeftModel`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye modelos comparables de terceros de la misma categoria (adaptadores de grounding visual sobre bases de menos de 1B). La unica comparacion disponible es contra el propio modelo base:

| Modelo | Parametros | Contexto | ground_bbox (IoU) | box_choice (EM) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| visual-jev-budget20-qwen35-0.8b-lora | 0,8B (base) + LoRA r16 | no disponible | 0,530 | 0,940 | apache-2.0 | HuggingFace |
| Qwen3.5-0.8B-Base (sin adaptador) | 0,8B | no disponible | 0,044 | 0,000 | no disponible en la informacion | HuggingFace |

Alternativas de terceros: no disponible.

## Limitaciones y advertencias

- El autor declara explicitamente que el adaptador es una demostracion de investigacion, no un componente listo para produccion.
- Los atributos y relaciones de Visual Genome pueden ser ruidosos, lo que introduce etiquetas imperfectas en el entrenamiento.
- Las preguntas geometricas de COCO asumen que los objetos anotados son visibles; el modelo puede fallar cuando no lo son.
- Los resultados no establecen capacidad de OCR, conteo exhaustivo, calibracion de la clase UNKNOWN ni rendimiento fuera de distribucion.
- El modelo solo esta declarado para ingles.
- La evaluacion se limita al subconjunto seleccionado (1.000 filas de validacion y 1.000 de test); no se reclama ningun resultado sobre el split completo, por lo que las metricas no deben extrapolarse al dataset entero.
- El shard de etiquetas generadas `luna_candidates.jsonl` se excluyo por estar pendiente de auditoria humana.
- No se alojan bytes de fotos en el repositorio, lo que limita la reproducibilidad visual directa desde el propio modelo.
- La licencia del adaptador es apache-2.0, pero el uso comercial depende tambien de la licencia del modelo base, que no se detalla en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la documentacion; al ser un modelo de 0,8B, la generacion de textos cortos puede producir respuestas plausibles pero incorrectas fuera de las tareas entrenadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harshnandwana/visual-jev-budget20-qwen35-0.8b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/harshnandwana/visual-jev-decisions-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Metricas exactas (`metrics.json`): https://huggingface.co/harshnandwana/visual-jev-budget20-qwen35-0.8b-lora/blob/main/metrics.json
- Predicciones por registro (`predictions.jsonl`): https://huggingface.co/harshnandwana/visual-jev-budget20-qwen35-0.8b-lora/blob/main/predictions.jsonl
- Manifiesto de seleccion (`selection_manifest.json`): https://huggingface.co/harshnandwana/visual-jev-budget20-qwen35-0.8b-lora/blob/main/selection_manifest.json
- Script de serializacion de prompts (`full_worker.py`): https://huggingface.co/harshnandwana/visual-jev-budget20-qwen35-0.8b-lora/blob/main/full_worker.py
- Revision del dataset: `687c745c34846d104ee85af802b9fd444a854f5d`
