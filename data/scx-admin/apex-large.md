# scx-admin/Apex-large

## Resumen

Apex-large es un modelo de clasificación zero-shot de unos 9B parámetros (8.979.664.627 exactos según los safetensors) publicado por el usuario scx-admin dentro de la familia SCX Apex. No es un modelo nuevo desde cero: republica sin cambios el checkpoint `knowledgator/gliclass-v4-9b` de Knowledgator, construido sobre el framework GLiClass 4 y con el backbone del decoder Qwen3.5-9B. Acepta texto e imágenes y devuelve puntuaciones para un conjunto de respuestas candidatas en un único forward pass, sin generar texto.

El modelo resuelve un problema concreto: tomar decisiones repetibles sobre evidencia (un ticket, un correo, una captura, un recibo) aplicando instrucciones, políticas o rúbricas que se suministran en inferencia. En lugar de redactar una respuesta, puntúa cada etiqueta candidata, de modo que el sistema puede automatizar los casos con puntuación alta y escalar los dudosos a una persona o a un LLM generativo. La política se cambia sin reentrenar, solo modificando el prompt y las etiquetas.

Su relevancia ahora es doble: por un lado, la licencia Apache 2.0 y los pesos abiertos permiten uso comercial sin fricción; por otro, la arquitectura decoder-KV de GLiClass 4 admite clasificación en streaming con caché por sesión, algo poco habitual en clasificadores zero-shot. La familia se completa con Apex-flash (0.4B, solo texto) para decisiones de alto volumen en CPU o GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiClass 4 sobre backbone decoder Qwen3.5-9B (arquitectura decoder-KV); clasificador zero-shot, no generativo |
| Parametros totales | 8.979.664.627 (~9B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | hasta 8.192 tokens en el ejemplo oficial del pipeline (`max_length=8192`); contexto nativo del backbone no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en BF16 (safetensors, ~18 GB) |
| Idiomas soportados | ingles (idioma principal declarado); no se declaran otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 18,0 GB) |
| Entradas | texto e imagenes |
| Framework / libreria | GLiClass (`pip install -U gliclass`), Python 3.10+ |
| Tarea declarada (pipeline) | `zero-shot-image-classification`; soporta tambien `zero-shot-classification`, clasificacion multi-etiqueta y reranking |
| Modelo base | `knowledgator/gliclass-v4-9b`, revision `14d11a92b5e0bab4a166e1fce4cc0777cac27182` |

## Arquitectura y entrenamiento

Apex-large hereda la arquitectura de GLiClass 4: un backbone decoder (Qwen3.5-9B) adaptado para puntuar respuestas candidatas en lugar de generar tokens. El modelo recibe la evidencia, una instruccion o politica opcional y la lista de etiquetas aceptables, y devuelve una puntuacion por etiqueta en un solo forward pass. La variante decoder-KV permite ademas clasificacion en streaming con una cache por sesion, pensada para conversaciones o flujos continuos. El pipeline oficial expone `classification_type="single-label"` para opciones mutuamente excluyentes y `"multi-label"` cuando pueden activarse varias etiquetas o ninguna por encima del umbral.

No se han publicado en la informacion disponible detalles de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO ni proceso de alineacion. La model card remite explicitamente a la ficha upstream de `knowledgator/gliclass-v4-9b` para esos datos. Lo que si queda claro es que este release no anade entrenamiento: "The weights, configuration, tokenizer, and other inference assets are unchanged; no additional fine-tuning is claimed". El autor original del checkpoint es Knowledgator; scx-admin solo lo republica bajo el nombre Apex.

## Capacidades

- Clasificacion zero-shot de texto con etiquetas arbitrarias definidas en inferencia, en modo single-label o multi-label.
- Clasificacion zero-shot de imagenes: el pipeline acepta rutas, URLs o imagenes PIL y puntua etiquetas de texto sobre ellas.
- Decision multimodal: puntua texto junto a capturas de pantalla, recibos, graficos o fotogramas de camara dentro de la misma llamada.
- Seguimiento de instrucciones, politicas y rubricas mediante el parametro `prompt`, sin reentrenar el modelo.
- Puntuaciones calibradas por etiqueta, pensadas para fijar umbrales, automatizar casos claros y escalar los inciertos.
- Reranking de candidatos (etiqueta declarada en el modelo).
- Clasificacion en streaming con cache por sesion gracias a la arquitectura decoder-KV.
- Soporte multi-etiqueta con posibilidad de devolver cero etiquetas por encima del umbral.
- No genera texto libre: no hay modo chat, tool calling, function calling ni razonamiento multi-paso generativo.
- No se declaran capacidades de codigo, matematicas, audio ni agentes; el modelo no ejecuta acciones, solo puntua opciones.

## Casos de uso

- Triaje de tickets de soporte: se pasa el texto del ticket y etiquetas como "delivery issue", "refund request" o "technical support"; con `max_length=8192` caben hilos completos y el umbral permite derivar a un humano los casos ambiguos.
- Enrutado de intenciones en asistentes conversacionales: el modelo puntua las intenciones candidatas en un unico forward pass y el orquestador selecciona la rama del dialogo, evitando una llamada generativa solo para clasificar.
- Moderacion de contenido multi-etiqueta: se definen categorias de politica como etiquetas y se activan varias a la vez; cambiar la politica es cambiar el prompt, no el modelo.
- Procesamiento de documentos visuales: clasificar recibos, capturas de pantalla o graficos con `images=[...]` junto a las etiquetas, util en bandejas de entrada de documentos o en apps de gastos.
- Reranking de resultados de busqueda o de candidatos de un recomendador: se puntua cada par evidencia-candidato y se reordena por score antes de mostrar resultados.
- Evaluacion de respuestas de un LLM contra una rubrica: se usa el modelo como juez de opciones discretas (por ejemplo, "correcto", "incompleto", "fuera de politica"), con umbrales calibrados sobre datos propios.
- Seleccion del siguiente paso en un pipeline: dado el estado de un caso, puntuar acciones posibles ("escalar", "pedir documentacion", "cerrar") y dejar que el sistema actue sobre la etiqueta de mayor score.
- Monitorizacion en streaming de conversaciones: con la cache por sesion, clasificar cada turno segun llega en lugar de reprocesar el historial completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este release no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones de clasificacion, y remite a la ficha upstream de `knowledgator/gliclass-v4-9b` para las evaluaciones del checkpoint original. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 18 GB (coherente con 8,98B parametros a 2 bytes). Hay que sumar memoria para activaciones, tokenizer y el grafo de inferencia.
- VRAM estimada: minimo en torno a 20-24 GB para BF16 con lotes pequenos; con `max_length=8192` y lotes mayores el consumo sube y conviene ir a 40-80 GB.
- GPU consumer: una RTX 4090 (24 GB) es el limite practico para BF16 con lote 1; secuencias largas o lotes mayores pueden provocar OOM.
- GPU profesionales: A10G o L4 (24 GB) para servicio modesto; A100 40/80 GB y H100 para mayor concurrencia o contextos largos.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ, FP8) ni datos de calidad tras cuantizar; cualquier cuantizacion seria un trabajo propio sin validar.
- Despliegue: la via oficial es la libreria `gliclass` sobre PyTorch con CUDA y soporte BF16, segun el ejemplo de la model card. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, algo esperable al no ser un modelo generativo.
- Latencia y throughput: no disponibles. Al resolver en un unico forward pass sin decodificacion autoregresiva, el coste por peticion es predecible y proporcional a la longitud de la evidencia y al numero de etiquetas, pero no hay cifras publicadas.
- CPU: tecnicamente posible con PyTorch, sin datos de rendimiento; para alto volumen en CPU la familia ofrece Apex-flash (0.4B).

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Apex-large (este) | ~9B (8.979.664.627) | Texto e imagenes | hasta 8.192 tokens en el ejemplo | Apache 2.0 | Pesos abiertos en HuggingFace, 21 descargas, 0 likes | Republicacion de GLiClass 4 9B; admite streaming con cache por sesion |
| Apex-flash | 0.4B | Solo texto | no disponible | Apache 2.0 | Pesos abiertos en HuggingFace | Mismo enfoque para decisiones de alto volumen en CPU o GPU; sin capacidad visual |
| knowledgator/gliclass-v4-9b (upstream) | ~9B | Texto e imagenes | no disponible | Apache 2.0 | Pesos abiertos en HuggingFace | Peso y configuracion identicos; incluye la ficha con detalles de entrenamiento y evaluaciones |
| Clasificadores zero-shot tipo NLI (p. ej. familias DeBERTa) | no disponible | Solo texto | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cifrada |

No hay datos de rendimiento comparado (accuracy, F1, latencia) en la informacion disponible, por lo que la comparativa se limita a tamano, modalidad, licencia y disponibilidad.

## Limitaciones y advertencias

- Las predicciones dependen de la redaccion exacta de las etiquetas, de la instruccion o politica, del dominio, de la longitud de la entrada y del umbral elegido; pequenos cambios de wording pueden alterar los scores.
- El ingles es el idioma principal; no se declaran capacidades multilingues y el rendimiento en castellano no esta documentado.
- La calibracion puede derivar en dominios nuevos: hay que evaluar scores y umbrales sobre datos representativos propios antes de automatizar decisiones.
- Riesgo de alucinacion en sentido estricto bajo, porque no genera texto; el fallo se manifiesta como asignacion incorrecta de etiquetas o scores sobreconfiados, con impacto real en triaje, moderacion o evaluacion automatica.
- No sirve para generacion de texto, tool calling, agentes ni razonamiento multi-paso generativo; usarlo para eso es un error de encaje.
- Es una republicacion sin fine-tuning propio: el mantenimiento, las correcciones y la responsabilidad tecnica dependen del checkpoint upstream de Knowledgator.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar el aviso de licencia y la atribucion a Knowledgator como autor original (ver `LICENSE` en el repositorio).
- Senales de adopcion muy bajas (21 descargas, 0 likes, creado y actualizado el mismo dia): poca validacion externa, sin informes de terceros sobre su comportamiento en produccion.
- No se han publicado analisis de sesgo ni evaluaciones de robustez en la informacion disponible.
- El limite de 8.192 tokens es el del ejemplo oficial; no hay garantias documentadas para entradas mas largas ni para el contexto nativo del backbone.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scx-admin/Apex-large
- Coleccion de la familia Apex: https://huggingface.co/collections/scx-admin/apex-family-6ad58a4ea2e0c9875ddb4061
- Modelo hermano Apex-flash: https://huggingface.co/scx-admin/Apex-flash
- Checkpoint upstream (GLiClass 4 9B): https://huggingface.co/knowledgator/gliclass-v4-9b
- Revision exacta del checkpoint upstream: https://huggingface.co/knowledgator/gliclass-v4-9b/tree/14d11a92b5e0bab4a166e1fce4cc0777cac27182
- Backbone Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del framework GLiClass: https://github.com/Knowledgator/GLiClass
- Paper GLiClass (arXiv:2508.07662): https://arxiv.org/abs/2508.07662
- Paper SCX Router (arXiv:2609.02292): https://arxiv.org/abs/2609.02292
- Pagina de producto SCX Apex: https://labs.scx.ai/apex
- Nota: las busquedas web realizadas no devolvieron resultados relacionados con el modelo; los resultados obtenidos corresponden a SCX Design, automocion y proteomica y se han descartado.
