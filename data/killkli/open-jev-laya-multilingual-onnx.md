# killkli/open-jev-laya-multilingual-onnx

## Resumen

Open-jev-laya-multilingual-onnx es un export en formato ONNX, listo para ejecutarse en navegador, del checkpoint multilingüe de Laya publicado por Convai Innovations. No se trata de un modelo generativo de texto: Laya es un motor de decisiones de tipo "System 1" que, dada una secuencia de entrada y una serie de preguntas tipadas, devuelve opciones, distribuciones de probabilidad, puntuaciones ordinales y probabilidades booleanas en lugar de lenguaje natural. El repositorio lo mantiene el usuario killkli y se apoya en el exportador oficial de receptron/laya.

El artefacto es relevante porque empaqueta el modelo en dos variantes ONNX (fp32 y fp16) pensadas para el backend WebGPU o WASM de Transformers.js, con lo que la inferencia puede ejecutarse íntegramente en el cliente sin enviar datos a un servidor. El grafo expone cinco entradas (input_ids, attention_mask, marker_pos, marker_mask y qtype) y devuelve logits de decisión junto con act_probs. El modelo no genera texto: el codificador de secuencia y el decodificador de respuestas tipadas viven en el proyecto open-jev.

El tamaño del repositorio es de 2,0 GB, con un export fp32 de 1.290.793.955 bytes y uno fp16 de 646.982.318 bytes. La licencia es Apache 2.0, heredada del checkpoint original, y el modelo se distribuye bajo la etiqueta de idioma "multilingual", aunque las pruebas de regresión documentadas solo cubren inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de secuencia (transformer) con decodificador de decisiones tipadas; grafos ONNX de 5 entradas (input_ids, attention_mask, marker_pos, marker_mask, qtype) y salidas de logits de decision mas act_probs |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (onnx/laya.onnx) y fp16 (onnx/laya_fp16.onnx) |
| Idiomas soportados | multilingue (pruebas de regresion documentadas solo en ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32 y fp16); el checkpoint original de Convai Innovations se distribuye en formato no detallado en la informacion disponible |
| Tamano del export | fp32: 1.290.793.955 bytes; fp16: 646.982.318 bytes |
| Tamano del repositorio | 2,0 GB |
| Libreria / runtime | transformers.js (backend WebGPU o WASM); tambien ONNX Runtime en Node.js |
| Pipeline declarado | no disponible (el modelo no genera texto) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del checkpoint original mas alla de calificarlo como modelo de decisiones "System 1" horizontal y compatible con Jev. Lo que si se detalla es la topologia del grafo exportado: una red con cinco entradas (input_ids, attention_mask, marker_pos, marker_mask y qtype) que produce logits de decision y probabilidades de activacion (act_probs). Esta estructura es coherente con un esquema encoder-decoder de decisiones, en el que el encoder procesa el estado o contexto y el decodificador de respuestas tipadas, implementado fuera del grafo en open-jev, genera las opciones, las probabilidades, los scores ordinales y los valores booleanos.

No hay datos en la informacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta ninguna innovacion de decodificacion (especulativa o de atencion lineal) en el propio export. El unico detalle tecnico de conversion es que la variante fp16 se genero con onnxconverter-common==1.14.0 y manteniendo sin cambios los tipos de los tensores de entrada y salida.

## Capacidades

- Decisiones tipadas: dado un estado y un conjunto de preguntas tipadas, el modelo devuelve opciones (choice), puntuaciones ordinales (score) y probabilidades booleanas.
- Distribuciones de probabilidad: el grafo expone logits de decision y act_probs, de modo que el consumidor puede obtener probabilidades por opcion en lugar de una unica respuesta dura.
- Preguntas de tipo "noul": el formato de preguntas cubre casos en los que el modelo puede no seleccionar ninguna opcion.
- Ejecucion en el cliente: funciona en navegador mediante Transformers.js con WebGPU (requiere shader-f16 para la variante fp16) o con el backend WASM.
- Ejecucion en servidor Node.js: a traves de ONNX Runtime, siguiendo el patron del proyecto receptron/laya.
- Compatibilidad de wire format: los servidores basados en Laya exponen POST /v1/systemone, el mismo formato que api.typesafe.ai y los modelos typesafe/jev-* de OpenRouter.
- Multilingue: la etiqueta de idioma del repositorio es "multilingual"; las pruebas de regresion se limitan a ingles y chino.
- Generacion de texto: no soportada explicitamente ("The model does not generate text").
- Tool calling, function calling, agentes multi-paso y vision: no disponible en la informacion proporcionada; quedan fuera del alcance de un motor de decisiones.

## Casos de uso

- Enrutado de decisiones en agentes: usar el modelo como System 1 barato que decide, con una probabilidad asociada, si una accion concreta debe ejecutarse, y reservar un LLM generativo para las decisiones ambiguas. El modelo esta disenado exactamente para esa funcion.
- Alternativa local a TypeSafe Jev: los clientes ya construidos contra los modelos jev-* pueden apuntar a un servidor Laya cambiando unicamente la URL base, dado que el wire format de /v1/systemone es el mismo.
- Clasificacion de intenciones en el navegador: al ejecutarse en WebGPU o WASM, permite clasificar y decidir sin enviar el texto del usuario a un servidor, lo que resulta adecuado para aplicaciones con requisitos de privacidad.
- Formularios y asistentes de entrada: el modelo puede puntuar opciones o asignar scores ordinales a respuestas, util para validar o priorizar campos en tiempo de escritura.
- Moderacion y flags booleanos: la salida de probabilidad booleana permite activar o desactivar senales (por ejemplo, marcar contenido) con un umbral ajustable.
- Puntuacion ordinal en encuestas o triaje: asignar un score ordinal a una respuesta o a un estado (urgencia, satisfaccion) con una probabilidad asociada, sin necesidad de generar texto.
- Componente de decisiones en videojuegos o simulaciones: el modelo devuelve opciones discretas con probabilidades, un formato natural para logica de comportamiento de NPC o reglas de simulacion.
- Deteccion de ambiguedad o ausencia de respuesta: el tipo de pregunta "noul" permite que el sistema declare que no dispone de una opcion valida, en lugar de forzar una eleccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, y el propio autor advierte que los datos que acompanan al repositorio son sondas de regresion y no un benchmark de calidad completo.

| Prueba | Alcance | Resultado |
|---|---|---|
| fp16 frente a fp32 | 21 casos, 60 preguntas, ingles y chino; preguntas de tipo choice, score y noul | Coincidencia en la opcion principal en todos los casos; diferencia maxima absoluta de probabilidad entre opciones de 0,00245 |

El autor indica ademas que las probabilidades de decision no se han recalibrado de forma especifica para los ejemplos de open-jev. Como referencia del proyecto Laya (no de este export concreto), la documentacion publica cifras de latencia de 21 ms y 33 ms para el motor de decisiones.

## Requisitos de hardware

- VRAM estimada para inferencia: la variante fp16 ocupa 646.982.318 bytes de pesos (aproximadamente 0,65 GB) y la fp32 1.290.793.955 bytes (aproximadamente 1,29 GB); a estos valores hay que sumar el espacio de activaciones y el overhead del runtime, por lo que conviene reservar margen adicional.
- GPU recomendadas: al no publicarse requisitos oficiales, no disponible; en la practica el modelo esta pensado para ejecutarse en WebGPU del navegador o en CPU via WASM.
- Compatibilidad con GPU de consumo: si, las variantes fp16 y fp32 caben holgadamente en GPU de consumo actuales; en navegador, la ruta fp16 requiere soporte de shader-f16 en WebGPU.
- Opciones de despliegue: Transformers.js (WebGPU o WASM) con model_file_name "laya" y subfolder "onnx"; ONNX Runtime en Node.js segun receptron/laya; servidor compatible con /v1/systemone segun navopw/laya-onnx. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput estimados: no disponible para este export; el proyecto Laya publica cifras de 21 ms y 33 ms para el motor de decisiones, sin desglose de hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| killkli/open-jev-laya-multilingual-onnx | Export ONNX de decisiones tipadas | no disponible | no disponible | Apache 2.0 | HuggingFace (transformers.js) |
| convaiinnovations/laya-multilingual | Checkpoint original de decisiones | no disponible | no disponible | Apache 2.0 | HuggingFace |
| typesafe/jev-* (TypeSafe Jev) | Modelo de decisiones tipadas, servicio propietario | no disponible | no disponible | propietaria (servicio) | api.typesafe.ai y OpenRouter |

La comparacion con TypeSafe Jev se apoya en la propia documentacion del proyecto Laya, que se presenta como la alternativa de codigo abierto a Jev y mantiene compatibilidad de formato en la ruta /v1/systemone. No se dispone de datos de parametros, contexto ni rendimiento de ninguna de las tres opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no sirve para tareas de generacion, resumen, traduccion ni chat.
- Requiere codigo externo: el codificador de secuencia en el navegador y el decodificador de respuestas tipadas no forman parte del repositorio y viven en open-jev, lo que anade una dependencia para su uso real.
- Probabilidades sin recalibrar: el autor advierte explicitamente de que las probabilidades de decision no se han recalibrado para los ejemplos de open-jev, por lo que los umbrales deben validarse en el dominio de despliegue.
- Validacion limitada: la unica comparacion publicada es una sonda de regresion de 21 casos y 60 preguntas en ingles y chino; no hay evidencia de calidad en otros idiomas pese a la etiqueta "multilingual".
- Cobertura de benchmarks inexistente: no se han publicado resultados en pruebas estandar, por lo que no es posible comparar su calidad con otros motores de decision.
- Sesgos: no disponible; no se documenta ningun analisis de sesgos del checkpoint original ni del export.
- Riesgo de alucinacion: aplicable en su forma especifica, ya que puede asignar probabilidad alta a opciones incorrectas; al no existir recalibracion documentada, conviene acompanar cada decision de un umbral de confianza.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero es responsabilidad del integrador verificar la licencia del checkpoint original de Convai Innovations y de las dependencias (Transformers.js, ONNX Runtime, open-jev).
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y no declara pipeline; conviene tratarlo como artefacto experimental.
- Compatibilidad de backend: la ruta fp16 depende de que el dispositivo soporte shader-f16 en WebGPU; en caso contrario hay que usar la variante fp32 o el backend WASM.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/killkli/open-jev-laya-multilingual-onnx
- Checkpoint original Laya multilingual (Convai Innovations): https://huggingface.co/convaiinnovations/laya-multilingual
- Revision concreta del checkpoint usada en el export: https://huggingface.co/convaiinnovations/laya/tree/5e7b2b1b8ca2ecdd3f2322d94069c9b6ce7e844b/multilingual
- Exportador ONNX de receptron/laya: https://github.com/receptron/laya/blob/6478649e723122ca24bbf5fb69ed1010023c9750/export/export_onnx.py
- Repositorio receptron/laya (ejecucion desde Node.js/TypeScript via ONNX Runtime): https://github.com/receptron/laya
- Codigo de encoder y decodificador en open-jev: https://github.com/nico-martin/open-jev/tree/main/examples/laya-shared
- Servidor navopw/laya-onnx: https://github.com/navopw/laya-onnx/tree/main
- Sitio del proyecto Laya: https://laya.convaiinnovations.com/
- Analisis independiente: https://brainfunctioncollapse.com/laya
