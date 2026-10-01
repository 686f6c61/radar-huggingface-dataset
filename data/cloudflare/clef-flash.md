# Cloudflare/clef-flash

## Resumen

Clef-Flash es un modelo multimodal de 9.409.813.744 parámetros (aproximadamente 9,4B) desarrollado por Cloudflare, publicado en HuggingFace bajo licencia Apache-2.0. No es un modelo generativo al uso: su función es convertir un estado (texto, JSON, imágenes o vídeo) junto con un esquema de preguntas tipadas en una decisión estructurada. Para cada pregunta del esquema devuelve un logit por cada opción permitida, de modo que aplicando un softmax por pregunta se obtienen probabilidades directamente utilizables. No hay generación de texto libre ni parseo de la salida.

Técnicamente es un post-entrenamiento (finetune) del modelo base Qwen/Qwen3.5-9B, del que conserva el backbone y el codificador visual, almacenados como safetensors fragmentados. Sobre el backbone se añade una cabeza de esquema conjunta (joint schema head), una cabeza transformer pequeña que lee los estados ocultos finales, enruta la evidencia del estado hacia cada pregunta y puntúa conjuntamente todas las opciones de todas las preguntas en un único forward pass. Esto permite decisiones multi-pregunta coherentes entre sí, algo que un pipeline de clasificadores independientes no garantiza.

Su relevancia actual radica en el encuadre de Cloudflare hacia la "era de los agentes": el modelo está pensado como componente de decisión determinista dentro de sistemas mayores, con una API (SystemOne/Jev) que devuelve respuestas tipadas con nivel de confianza y probabilidades. Frente a un LLM generativo, elimina el coste y la fragilidad del parseo de salidas y reduce la superficie de error en producción. El modelo card menciona una variante mayor de la misma familia, Cloudflare/clef.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3.5-9B con codificador visual) mas cabeza de esquema conjunta (joint schema head, transformer pequena) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible como spec oficial; `encode_record` usa `max_length` por defecto de 16.384 tokens, acotable con `max_state_tokens` |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay variantes GGUF, AWQ ni GPTQ documentadas) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas ni aparece en los tags de HuggingFace) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors fragmentados (`model-*.safetensors`, `model.safetensors.index.json`) mas `joint_head.safetensors`; requiere codigo propio (`joint_schema_model.py`, custom-code) |

Otros datos: tamano del repositorio 19,1 GB (coherente con pesos en 16 bits para 9,4B parametros mas el codificador visual); 18 descargas y 34 likes en el momento de la consulta; probado con `torch` 2.11 y `transformers` 5.10.2 en una unica H200.

## Arquitectura y entrenamiento

La arquitectura parte del backbone Qwen/Qwen3.5-9B con su codificador visual, mantenido como safetensors estandar. Sobre los estados ocultos finales del backbone se monta una cabeza de esquema conjunta: una transformer pequena que realiza dos funciones, enrutar la evidencia relevante del estado hacia cada pregunta del esquema y puntuar simultaneamente todas las opciones de todas las preguntas. La salida son logits por opcion permitida, con softmax por pregunta para obtener probabilidades. El modelo se describe como post-entrenado (post-train) a partir de Qwen3.5-9B, es decir, un finetune sobre el modelo base, no un entrenamiento desde cero.

El sistema de entrada es un "record" con un campo `state` (cualquier cadena o valor JSON que describa la situacion), listas opcionales de `images` y `videos`, `media_kwargs` opcionales para el procesador y un mapa `questions`. Cada pregunta tiene un `type` (`noul` para verdadero/falso, `choice` para opciones con nombre, `score` para opciones ordenadas), unas `instructions` opcionales (se usa el ID de la pregunta si se omiten) y los `criteria` que describen cada opcion. Los registros de solo texto y multimodales pueden mezclarse en el mismo batch.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card incluye una seccion de resultados denominada Decision Index, pero el contenido proporcionado esta truncado, por lo que no es posible reproducir cifras.

## Capacidades

- Decision estructurada con salida tipada: devuelve un logit por opcion permitida y probabilidades por pregunta, sin generacion de texto libre ni parseo posterior.
- Tres tipos de pregunta soportados: `noul` (probabilidad de verdadero), `choice` (opciones con identificador y descripcion) y `score` (opciones ordenadas, con puntuacion esperada, leyenda, confianza y probabilidades).
- Puntuacion conjunta: todas las preguntas del esquema se resuelven en un unico forward pass, lo que permite coherencia entre decisiones relacionadas.
- Entrada multimodal: acepta texto, JSON, imagenes (PIL) y video (arrays de fotogramas), con mezcla de registros unimodales y multimodales en el mismo batch.
- Enrutado de evidencia: la cabeza de esquema selecciona la evidencia del estado relevante para cada pregunta.
- Compatibilidad de API: envuelta `systemone` que acepta y devuelve el cuerpo de peticion/respuesta de Jev y SystemOne, con `model`, `answers` por ID de pregunta y `usage`.
- Confianza calibrada por respuesta: cada respuesta `choice` y `score` incluye `confidence` y `probabilities`.
- No se documentan capacidades de tool calling, function calling, uso agentico autonomo, modo thinking, audio ni generacion de codigo.

## Casos de uso

- Triage de facturas y documentos financieros: dado el JSON de una factura (`vendor`, `total`, `currency`, `status`) y un esquema con preguntas `choice` y `noul`, el modelo devuelve directamente la clasificacion de estado y la comprobacion de umbrales, sin parsear texto generado. Es el ejemplo incluido en la model card.
- Enrutado de tickets de soporte: con `state` en texto libre mas preguntas `choice` (departamento), `score` (urgencia) y `noul` (si hay una caida de servicio), se obtiene una decision multi-etiqueta coherente en un unico paso, ideal para alimentar un enrutador de colas.
- Revision de documentos escaneados: usando `images` junto al estado textual, se puede comprobar la legibilidad de un recibo o extraer una decision sobre su contenido sin necesidad de un OCR externo ni de un LLM generativo.
- Moderacion y clasificacion de contenido multimedia: con entradas de video (arrays de fotogramas) y preguntas booleanas o de eleccion, el modelo puntua categorias de riesgo dentro de un pipeline de moderacion.
- Etiquetado y anotacion para datasets: al devolver probabilidades por opcion y confianza, es adecuado para pre-etiquetado a gran escala con revision humana solo de los casos de baja confianza.
- Compuertas de decision en agentes multi-paso: como componente de un agente, decide condiciones del tipo "conviene escalar a un humano", "esta tarea esta completa" o "que herramienta corresponde", evitando el parseo de salidas generativas.
- Verificacion de cumplimiento normativo: esquemas con preguntas `noul` sobre politicas (por ejemplo, presencia de clausulas obligatorias) permiten obtener una decision auditable con probabilidad asociada.
- Clasificacion por lotes de alta homogeneidad: al admitir batches mixtos de texto, imagen y video, permite procesar colas heterogeneas en una sola pasada de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un apartado de resultados con una tabla del Decision Index (evaluacion interna de Cloudflare), pero el contenido facilitado esta truncado y no permite reproducir cifras. No se dispone de valores de MMLU, HumanEval, GSM8K ni de metricas de clasificacion comparables, y no deben asumirse.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 16 bits de 9,4B parametros ocupan aproximadamente 19 GB, coherente con el tamano del repositorio (19,1 GB). A ello hay que sumar la cache KV y las activaciones del backbone y del codificador visual; en la practica se recomienda un minimo de 24 GB y, con margen para contexto largo (hasta 16.384 tokens) e imagenes o video, 40-80 GB.
- GPU recomendadas: la model card indica que se ha probado en una unica H200. H100 de 80 GB y A100 de 80 GB son opciones naturales; en A100 de 40 GB conviene acotar `max_length` y `max_state_tokens`.
- Cabe en GPU de consumo: en una RTX 4090 de 24 GB los pesos en bf16 dejarian un margen muy ajustado para activaciones, cache KV y procesamiento de imagen o video, por lo que el uso en esa configuracion requeriria reducir el contexto o cuantizar por cuenta propia, ya que no se publican cuantizaciones oficiales.
- Opciones de despliegue: el modelo exige codigo propio (`joint_schema_model.py`, etiquetado como custom-code) y una cabeza de salida no estandar, por lo que no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El camino soportado es `transformers` 5.10.2 con `torch` 2.11, descargando el snapshot y cargando con `load_release_model`.
- Dependencias: `pillow` para entradas de imagen y video.
- Latencia y throughput: no disponibles en la informacion proporcionada. El diseno de un unico forward pass para todas las preguntas del esquema, sin decodificacion autorregresiva, sugiere una latencia muy inferior a la de un LLM generativo equivalente, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cloudflare/clef-flash | 9.409.813.744 | No disponible (16.384 tokens por defecto en `encode_record`) | No disponible | Apache-2.0 | HuggingFace, codigo propio |
| Cloudflare/clef | No disponible | No disponible | No disponible | No disponible en la informacion facilitada | HuggingFace (variante mayor de la misma familia) |
| Qwen/Qwen3.5-9B (base) | No disponible (modelo base del que deriva clef-flash) | No disponible | No disponible | No disponible en la informacion facilitada | HuggingFace |

No se dispone de datos objetivos (parametros, contexto, benchmarks) de las alternativas en la informacion proporcionada, mas alla de que Cloudflare/clef es la variante mayor de la misma familia y Qwen/Qwen3.5-9B es el modelo base. No se identifican en el material otros modelos comparables de decision estructurada con salida tipada, por lo que la comparativa cuantitativa se considera no disponible.

## Limitaciones y advertencias

- No genera texto libre: cualquier tarea que requiera redaccion, resumen o explicacion no puede resolverse con este modelo. Su salida son exclusivamente probabilidades sobre opciones definidas de antemano.
- Dependencia total del esquema: la calidad de la decision esta acotada por la definicion de las preguntas y los `criteria`. Opciones mal descritas o solapadas degradan el resultado y no hay mecanismo de correccion en la salida.
- Riesgo de calibracion deficiente: una probabilidad alta no garantiza correccion. En produccion conviene fijar umbrales y derivar a revision humana los casos de baja confianza, especialmente en decisiones con impacto.
- Idiomas no declarados: no se especifica que lenguas soporta el modelo, por lo que no puede asumirse un rendimiento multilingue y debe validarse por idioma antes de desplegarlo.
- Sesgos: no se publica informacion sobre composicion del dataset de post-entrenamiento, evaluaciones de sesgo ni auditorias de equidad. Al derivar de Qwen3.5-9B, hereda los sesgos del modelo base y los del corpus de ajuste, no documentados aqui.
- Datos de rendimiento ausentes: la tabla de resultados anunciada en la model card esta truncada en la informacion disponible, de modo que no hay evidencia publica verificable de su rendimiento comparado.
- Ejecucion de codigo remoto: el uso requiere importar `joint_schema_model.py` desde el repositorio, lo que implica ejecutar codigo de terceros en el entorno de inferencia. Debe revisarse y fijarse la revision (commit) antes de usarlo en produccion.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de consumo y en stacks tipo llama.cpp u Ollama.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el archivo LICENSE. Debe verificarse asimismo la licencia del modelo base Qwen/Qwen3.5-9B, cuya informacion no se incluye en el material facilitado.
- Madurez: el repositorio acumula 18 descargas y 34 likes, cifras muy bajas que indican una adopcion temprana y poca validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cloudflare/clef-flash
- Anuncio de los modelos de decision Clef en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
- Variante mayor de la familia: https://huggingface.co/Cloudflare/clef
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Sitio corporativo de Cloudflare: https://www.cloudflare.com/

Nota sobre la busqueda web: los resultados obtenidos corresponden a paginas genericas y de soporte de Cloudflare (sitio corporativo, panel de acceso, version en frances, entrada de Wikipedia y descarga del cliente Cloudflare One) y no aportan informacion tecnica adicional sobre Clef-Flash.
