# rty813/clef-bf16

## Resumen

clef-bf16 es una redistribucion en precision completa (bf16) del modelo Cloudflare/clef, publicada por el usuario rty813. No modifica ni la arquitectura ni los pesos originales: es un port a formato PyTorch (`pytorch_model.bin` en bf16) dirigido a quien quiera servir el modelo en vLLM, TGI, Xinference o transformers sin recurrir a la cuantizacion GGUF del repositorio original.

Clef es un modelo multimodal de 27B derivado por post-entrenamiento de Qwen/Qwen3.8-27B que no genera texto libre: recibe un estado (texto, JSON, imagenes o video) junto con un esquema de preguntas tipadas y devuelve, en una sola pasada hacia delante, una probabilidad para cada opcion permitida de cada pregunta. La salida esta estructurada por diseno, sin necesidad de parsear texto.

Su relevancia practica reside en ese formato de salida: convierte la inferencia en una decision puntuada y directamente consumible por sistemas de enrutado, moderacion o evaluacion automatica. La licencia apache-2.0 y la compatibilidad de API con Jev y SystemOne facilitan la integracion, pero el repositorio no publica benchmarks, idiomas soportados ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: backbone Qwen/Qwen3.8-27B con su codificador de vision + cabecera de esquema conjunta (joint schema head, transformer pequeno) |
| Parametros totales | 27B (heredados de Cloudflare/clef) |
| Parametros activos | no aplica segun la informacion disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en este repositorio (full precision); el modelo original dispone de variante GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `pytorch_model.bin` en bf16; conversion a safetensors en curso segun la model card |

Otros datos declarados por HuggingFace: pipeline `text-generation` (el modelo original declara `image-text-to-text`), libreria `transformers`, modelo base `Cloudflare/clef`, 0 descargas y 0 likes en el momento de la consulta, tamano de repositorio declarado 0,0 GB, creado y actualizado el 2026-10-13.

## Arquitectura y entrenamiento

La arquitectura es la del modelo original, sin cambios: un backbone Qwen/Qwen3.8-27B con su codificador de vision, almacenado como safetensors fragmentados en el caso de Cloudflare/clef, mas una cabecera de esquema conjunta. Esa cabecera lee los estados ocultos finales del backbone, enruta la evidencia desde el estado hacia cada pregunta y puntua conjuntamente todas las opciones de todas las preguntas. La salida es un logit por opcion permitida de cada pregunta, sobre el que se aplica un softmax por pregunta.

Clef se obtiene por post-entrenamiento del backbone Qwen/Qwen3.8-27B, e incluye una variante mas pequena y rapida, Clef-Flash. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. Tampoco se documenta la innovacion de decodificacion mas alla del propio mecanismo de decision: una unica pasada hacia delante, sin generacion de texto libre y sin parseo de salida, con puntuacion conjunta de todas las preguntas del esquema.

## Capacidades

- Entrada multimodal: el modelo lee el estado como texto, JSON, imagenes o video.
- Salida de decision: devuelve una probabilidad (logit seguido de softmax) por cada opcion permitida de cada pregunta del esquema.
- Puntuacion conjunta: todas las opciones de todas las preguntas se puntuan en una sola pasada, lo que permite modelar dependencias entre preguntas.
- Salida tipada y estructurada: no hay generacion de texto libre ni necesidad de parseo posterior.
- Clasificacion y structured output sobre esquemas definidos por el usuario.
- Compatibilidad de API con Jev y SystemOne segun la model card del modelo original.
- Soporte de despliegue en vLLM (`vllm serve rty813/clef-bf16`), TGI, Xinference y transformers (`AutoModelForCausalLM.from_pretrained`).
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo esta disenado para una unica decision puntuada por invocacion.
- Capacidades multilingues: no disponible.
- Modo "thinking" o razonamiento explicito: no disponible; la model card descarta explicitamente la generacion de texto libre.

## Casos de uso

- Enrutado de tickets de soporte: se define un esquema con preguntas como "categoria", "urgencia" y "equipo responsable" y el modelo devuelve una distribucion de probabilidad sobre las opciones permitidas, que el sistema de ticketing consume directamente sin parsear texto.
- Moderacion de contenido: el estado (texto o imagen) se evalua contra un esquema de politicas con opciones discretas por politica, lo que permite fijar umbrales de actuacion sobre probabilidades calibradas en lugar de sobre etiquetas binarias generadas libremente.
- Clasificacion de imagenes con decision estructurada: al incorporar codificador de vision, admite estados con imagen y devuelve la etiqueta o decision tipada que requiera el pipeline, por ejemplo control de calidad visual en una linea de produccion.
- Evaluacion automatica con esquema: uso como evaluador donde la rubrica se expresa como preguntas tipadas, obteniendo una puntuacion por criterio en lugar de un juicio en lenguaje natural, lo que simplifica el agregado estadistico.
- Analisis de video para priorizacion de alertas: el modelo acepta video como estado, de modo que un operador puede definir un esquema de eventos y usar las probabilidades para ordenar alertas antes de la revision humana.
- Decisiones en agentes y automatizacion de flujos: integrado via API compatible con Jev o SystemOne, el modelo actua como componente de decision que elige entre acciones permitidas declaradas en el esquema, sin generar texto intermedio.
- Triage en dominios regulados: al devolver probabilidades por opcion y no texto libre, facilita el registro auditable de la decision y el umbral aplicado en cada caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original menciona la existencia de un leaderboard, "Decision Index" (clef-evals.workers-ai-mle.workers.dev), pero no se proporciona ningun valor numerico en la informacion suministrada.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (27B) declarado; no proceden de mediciones publicadas por el autor.

- Peso de los pesos en bf16: aproximadamente 54 GB (2 bytes por parametro sobre 27 000 millones), sin contar cache KV ni activaciones.
- VRAM estimada para inferencia en bf16: del orden de 60 GB o mas por instancia, segun longitud de contexto, tamano de lote y resolucion de las entradas visuales.
- GPU recomendadas: A100 80 GB o H100 80 GB en una sola tarjeta; alternativamente varias GPU con paralelismo tensorial (por ejemplo 2x A100 40 GB, 2x L40S 48 GB o 2x A6000 48 GB), sujeto a las limitaciones del motor de inferencia elegido.
- GPU de consumo: bf16 completo no cabe en tarjetas de 24 GB como la RTX 4090. Para ese perfil habria que recurrir a la cuantizacion GGUF del repositorio original o a conversiones propias.
- Opciones de despliegue: vLLM, TGI, Xinference y transformers, segun la propia model card. llama.cpp u Ollama requeririan una conversion a GGUF que este repositorio no proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| rty813/clef-bf16 | 27B | no disponible | `pytorch_model.bin` bf16 | apache-2.0 | Port no oficial del modelo original; sin benchmarks publicados; 0 descargas |
| Cloudflare/clef | 27B | no disponible | safetensors fragmentados; variante GGUF disponible | apache-2.0 | Modelo original, multimodal, salida de decision tipada |
| Cloudflare/clef-flash | no disponible | no disponible | no disponible | no disponible | Variante mas pequena y rapida del mismo modelo |
| Qwen/Qwen3.8-27B | 27B | no disponible | no disponible | no disponible | Backbone base sobre el que se post-entrena Clef; genera texto libre |

La diferencia principal entre clef-bf16 y Cloudflare/clef no es de capacidad sino de empaquetado: mismo modelo, mismo comportamiento esperado, distinto formato de pesos y distinta idoneidad de motores de servicio. Frente a Qwen/Qwen3.8-27B, la diferencia es funcional, ya que Clef sustituye la generacion libre por puntuacion de opciones tipadas.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes de este repositorio; el rendimiento efectivo es desconocido.
- El repositorio declara 0 descargas, 0 likes y un tamano de 0,0 GB en el momento de la consulta, lo que sugiere que los pesos podrian no estar efectivamente subidos. Conviene verificarlo antes de Integrarlo en un pipeline.
- La model card original esta truncada en la informacion disponible (corta en "Apply a softmax per"), por lo que el detalle del calculo de la salida no puede reproducirse completo.
- Existe una discrepancia entre el tag `qwen3_5` de HuggingFace y el modelo base declarado en la model card, Qwen/Qwen3.8-27B. No se dispone de informacion que la resuelva.
- El modelo original incluye el tag `custom-code`, por lo que es probable que sea necesario `trust_remote_code=True` y que el uso con `AutoModelForCausalLM` requiera el codigo remoto del autor.
- Al no generar texto libre, el modelo no sirve para tareas de resumen, redaccion, traduccion ni conversacion. Usarlo para esos fines excede su diseno.
- Riesgo de alucinacion: no aplica en el sentido habitual de generacion libre, pero si existe riesgo de calibracion deficiente de las probabilidades por opcion, especialmente en opciones poco representadas en el post-entrenamiento. No hay datos publicos de calibracion.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingue.
- Longitud de contexto maxima: no disponible, lo que impide planificar cargas con estados largos o multiples imagenes.
- Licencia apache-2.0: permite uso comercial, modificacion y redistribucion, con las obligaciones habituales de atribucion y conservacion del aviso de licencia. Al tratarse de un port de un modelo derivado de Qwen, conviene revisar tambien las condiciones aplicables al backbone original.
- Este repositorio es un port de terceros (usuario rty813) y no esta mantenido por Cloudflare; la responsabilidad de validacion en produccion recae en quien lo despliega.

## Enlaces

- Repositorio HuggingFace de este port: https://huggingface.co/rty813/clef-bf16
- Modelo original: https://huggingface.co/Cloudflare/clef
- Variante reducida: https://huggingface.co/Cloudflare/clef-flash
- Backbone base: https://huggingface.co/Qwen/Qwen3.8-27B
- Anuncio en el blog de Cloudflare: https://blog.cloudflare.com/clef-decision-models
- Leaderboard Decision Index: https://clef-evals.workers-ai-mle.workers.dev
