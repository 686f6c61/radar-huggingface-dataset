# developerjeremylive/clef-etheroi

## Resumen

Clef es un modelo multimodal de 27.356.728.560 parámetros (unos 27,4 mil millones) que no genera texto libre: recibe un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas y devuelve, en una sola pasada forward, una probabilidad para cada opción permitida de cada pregunta. El modelo parte de Qwen/Qwen3.8-27B, conserva su codificador de visión y añade una cabeza transformer ("joint schema head") que enruta la evidencia del estado hacia cada pregunta y puntúa conjuntamente todas las opciones.

La ficha de Hugging Face analizada (developerjeremylive/clef-etheroi) es una copia de terceros, publicada el 2 de octubre de 2026, del modelo original de Cloudflare, con 0 descargas y 0 likes en el momento de la consulta. Su interés reside en el enfoque: sustituye la generación libre y el parseo posterior de la salida por una clasificación estructurada con probabilidades, lo que simplifica la integración en pipelines de decisión automatizada y en APIs compatibles con Jev y SystemOne.

Se distribuye bajo licencia Apache 2.0 en safetensors fragmentados y exige código propio (joint_schema_model.py) para la carga y la inferencia. No se documentan versiones cuantizadas ni soporte para los motores de inferencia habituales, y no hay resultados numéricos de benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: backbone Qwen/Qwen3.8-27B con codificador de visión, más una cabeza transformer conjunta ("joint schema head") que puntúa todas las opciones de todas las preguntas |
| Parámetros totales | 27.356.728.560 (unos 27,4 mil millones), según los pesos safetensors del repositorio |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos |
| Longitud de contexto | No disponible para el backbone. `encode_record` aplica un `max_length` por defecto de 16.384 tokens y permite acotar la entrada con `max_state_tokens` |
| Tipos de cuantización | No disponible: el repositorio solo publica safetensors sin cuantizar; no se documentan GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible: ni la ficha de Hugging Face ni la model card declaran una lista de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors fragmentados (`model-*.safetensors` con `model.safetensors.index.json`) y `joint_head.safetensors` |
| Tamaño del repositorio | 55,0 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B (relación: finetune) |
| Entorno probado | torch 2.11 y transformers 5.10.2 sobre una única H200; `pillow` para imagen y vídeo |

## Arquitectura y entrenamiento

La arquitectura consta de tres piezas. El backbone es Qwen/Qwen3.8-27B, incluido su codificador de visión, almacenado como safetensors fragmentados estándar. Sobre él se sitúa una cabeza transformer de pequeño tamaño ("joint schema head") que lee los estados ocultos finales del backbone, enruta la evidencia procedente del estado hacia cada pregunta y puntúa de forma conjunta las opciones de todas las preguntas del esquema. La salida es un logit por cada opción permitida de cada pregunta; aplicando un softmax por pregunta se obtienen probabilidades. No hay generación de texto libre ni parseo de la salida.

El modelo se presenta como "post-trained" desde Qwen/Qwen3.8-27B, con una variante menor y más rápida denominada Clef-Flash. El esquema de entrada admite `state` (cualquier cadena o valor JSON), `images` y `videos` opcionales, `media_kwargs` y un mapa `questions`. Cada pregunta declara un `type` (`noul` para verdadero/falso, `choice` para opciones con nombre y `score` para opciones ordenadas), unas `instructions` opcionales y unos `criteria` específicos por tipo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Decisión estructurada: devuelve una probabilidad por opción permitida en lugar de texto, eliminando la necesidad de parsear la salida.
- Tres tipos de pregunta: `noul` (probabilidad de verdadero), `choice` (opciones con nombre y descripción) y `score` (opciones ordenadas con valor esperado).
- Puntuación conjunta: todas las preguntas del esquema se resuelven en una única pasada forward, lo que permite explotar dependencias entre preguntas.
- Entrada multimodal: acepta texto, JSON, imágenes (PIL) y vídeo (arrays de fotogramas); los registros de solo texto y multimodales pueden mezclarse en el mismo lote.
- Compatibilidad de API: la función `systemone` acepta y devuelve el cuerpo de una petición Jev/SystemOne `POST /v1/systemone`, con `model`, `answers` por identificador de pregunta y `usage`.
- Control de longitud: `encode_record` admite `max_length` (16.384 tokens por defecto) y `max_state_tokens` para acotar la entrada.
- Sin tool calling ni function calling documentados: al no generar texto ni secuencias de acciones, no se describe soporte de herramientas.
- Sin agentes ni razonamiento multi-paso: no existe bucle de generación ni modo "thinking"; la decisión es un único paso de inferencia.
- Capacidades multilingües: no disponibles, no declaradas.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una incidencia y un esquema con `department` (choice) y `urgency` (score), el modelo devuelve directamente la probabilidad de cada equipo y la urgencia esperada, lo que permite enrutar sin parsear texto libre ni definir heurísticas. Es el ejemplo que la propia model card ilustra con un fallo en el proceso de compra.
- Automatización de cuentas a pagar: con un `state` en JSON que contenga proveedor, importe, divisa y estado de la factura, el modelo responde a preguntas como si está pagada o si supera un umbral de importe (`noul`), devolviendo la probabilidad asociada para auditarla después.
- Verificación documental con imagen: añadiendo una imagen al registro, se puede preguntar si el justificante es legible o si un campo concreto aparece en el documento, útil en procesos de alta de clientes y control de gastos.
- Clasificación de contenido sensible: uso de preguntas `choice` con criterios redactados de forma explícita para categorizar texto o imágenes, con la ventaja de que el criterio de decisión queda documentado en el propio esquema y es auditable.
- Enrutado de alertas de monitorización: a partir de un estado textual o JSON con métricas y mensajes de error, el modelo decide si hay una caída de servicio y a qué equipo corresponde la alerta, integrándose en un sistema de guardia mediante la API compatible con SystemOne.
- Inspección visual en entornos industriales: procesando fotogramas o arrays de vídeo, se pueden plantear preguntas binarias o de escala sobre defectos, con puntuaciones por opción que permiten fijar umbrales de aceptación.
- Encuestas y escalas ordinales: el tipo `score` con opciones ordenadas y `legend` encaja en la codificación automática de respuestas abiertas en escalas tipo Likert o niveles de satisfacción.
- Extracción de decisiones para scoring: por ejemplo, clasificar el riesgo de una operación a partir de datos estructurados, siempre que el proceso se someta a las revisiones regulatorias y de sesgo correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una ejecución interna del "Decision Index" y enlaza un panel público de evaluación, pero el contenido disponible se interrumpe antes de mostrar ninguna cifra, por lo que no se reproducen números.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 55 GB solo para los pesos (27,4 mil millones de parámetros a 2 bytes), coherente con el tamaño del repositorio; sumando el codificador de visión, la cabeza conjunta, la caché KV y las activaciones, hay que prever del orden de 60-70 GB para secuencias largas. Es una estimación a partir del tamaño, no un dato publicado.
- GPU recomendadas: la model card indica que se ha probado con una única H200. Una H100 de 80 GB o una A100 de 80 GB son candidatas razonables por capacidad de memoria en bf16; no se documentan pruebas en esas tarjetas.
- GPU de consumo: no cabe en una GPU de consumo de 24 GB (RTX 4090, 3090) en bf16. Cabría teóricamente en 4 bits (en torno a 14-16 GB), pero no se publican pesos cuantizados oficiales, por lo que requeriría cuantización propia y validación posterior.
- Opciones de despliegue: carga mediante `transformers` con código propio del repositorio (`snapshot_download`, inserción del directorio en `sys.path` y llamada a `load_release_model`). No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni motores equivalentes, lo que descarta de momento el despliegue con servidores de inferencia estándar.
- Latencia y rendimiento: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clef (esta ficha) | 27,4 mil millones | 16.384 tokens por defecto en `encode_record`; contexto del backbone no disponible | Logits por opción, sin texto libre | Apache 2.0 | Safetensors en el repositorio; requiere código propio |
| Clef-Flash | No disponible | No disponible | Logits por opción, sin texto libre | No disponible | Variante menor y más rápida según la model card del propio Clef |
| Qwen/Qwen3.8-27B (base) | No disponible en la información proporcionada | No disponible | Generación de texto libre | No disponible | Modelo base sobre el que se post-entrena Clef |
| Otros modelos de decisión o clasificación de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No se dispone de alternativas documentadas en la información analizada |

La diferencia principal frente a un modelo generativo del mismo tamaño es el contrato de salida: Clef no produce texto, sino probabilidades por opción, lo que elimina el parseo y reduce la superficie de error en producción, a costa de no poder utilizarse para tareas generativas.

## Limitaciones y advertencias

- Uso restringido por diseño: al no generar texto libre, no sirve para chat, redacción, resumen, traducción ni generación de código. Solo responde a esquemas de preguntas tipadas.
- Ausencia de evaluaciones publicadas: no hay cifras verificables de MMLU, HumanEval, GSM8K ni del Decision Index en la información disponible, lo que impide estimar su calidad relativa.
- Calibración no garantizada: aunque la salida sea una probabilidad tras softmax, no se documenta ningún proceso de calibración ni métricas de fiabilidad; en dominios fuera de distribución las probabilidades pueden resultar sobreconfiadas.
- Sesgos heredados: al ser un post-entrenamiento de Qwen/Qwen3.8-27B, arrastra los sesgos del modelo base, que no se cuantifican en la documentación.
- Riesgo de alucinación trasladado: la cabeza de decisión puede asignar alta probabilidad a opciones incorrectas cuando el estado no contiene la evidencia necesaria; conviene establecer umbrales de confianza y revisión humana.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que el comportamiento multilingüe es indeterminado.
- Longitud de entrada acotada: el valor por defecto de 16.384 tokens puede truncar estados extensos si no se ajustan `max_length` y `max_state_tokens`.
- Ejecución de código remoto: el uso del modelo implica importar `joint_schema_model.py` desde el repositorio descargado. Debe revisarse y fijarse una revisión concreta antes de ejecutarlo en producción, más aún tratándose de una copia publicada por un tercero (`developerjeremylive`) y no por el autor original.
- Licencia: el checkpoint se declara Apache 2.0, pero conviene verificar la licencia y las condiciones del modelo base Qwen/Qwen3.8-27B antes de un uso comercial.
- Dependencias exigentes: probado con torch 2.11 y transformers 5.10.2; versiones anteriores pueden no ser compatibles con el código personalizado.
- Madurez del repositorio: 0 descargas y 0 likes en la copia analizada, publicada y actualizada el mismo día, sin señales de mantenimiento.

## Enlaces

- Ficha en Hugging Face analizada: https://huggingface.co/developerjeremylive/clef-etheroi
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante menor y más rápida (Clef-Flash): https://huggingface.co/Cloudflare/clef-flash
- Anuncio de los modelos de decisión Clef en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Panel de evaluación Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Repositorio de referencia citado en la model card para la descarga de pesos: Cloudflare/clef (identificador indicado en el ejemplo de uso; no se ha podido verificar su contenido en la información disponible)
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo (contenido sobre artes marciales mixtas) y no se incluyen. No se han encontrado papers, repositorios ni demos adicionales en la búsqueda realizada.
