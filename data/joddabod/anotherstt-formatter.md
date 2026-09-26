# joddabod/anotherstt-formatter

## Resumen

anotherstt formatter es un ajuste fino (fine-tune) del modelo Qwen3 1.7B publicado por el usuario joddabod, disenado especificamente para limpiar transcripciones de voz en bruto y convertirlas en el texto que el usuario pretendia escribir. No es un asistente conversacional: su unica funcion es reformatear dictado, eliminando muletillas y tartamudeos, aplicando correcciones habladas ("a las 6, no, espera, a las 6:30"), arreglando puntuacion y mayusculas, normalizando numeros, horas y correos electronicos, e insertando vinetas, listas numeradas y parrafos cuando el hablante los dicta de forma explicita.

El modelo forma parte de another-stt, un teclado de dictado gratuito y totalmente offline para Android y Linux, y esta pensado para ejecutarse en un telefono. Con 1.720.574.976 parametros totales (1,72B) y un unico archivo GGUF de 1,1 GB en cuantizacion Q4_K_M, es un ejemplo de modelo pequeno y especializado orientado a inferencia en dispositivo (on-device) en lugar de a la nube.

Su relevancia actual radica en el enfoque de "text cleanup" acotado: en lugar de competir en capacidades generales, resuelve un paso concreto de un pipeline de voz a texto (ASR -> formateo -> escritura), con una tecnica de restriccion por gramatica que impide que el modelo invente o reordene palabras, un requisito critico para un dictado en el que el usuario no va a releer el resultado antes de enviarlo. La licencia Apache 2.0 facilita su integracion en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-1.7B); no se detallan mas especificaciones en la model card |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | no disponible (no es un modelo MoE; no se documenta) |
| Longitud de contexto | no disponible (no se especifica en la model card; corresponde al del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | Q4_K_M (GGUF); no se publican otras cuantizaciones |
| Idiomas soportados | Ingles (en) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`formatter-q4_k_m.gguf`, 1,1 GB). El modelo base se distribuye en safetensors; el conteo de parametros confirmado corresponde a safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo de Qwen3 1.7B (arquitectura transformer decoder-only del modelo base) en el que las capas de embedding y de salida se mantuvieron congeladas durante el entrenamiento. Se entreno con unos 1.400 pares de dictado escritos a mano. Para acercar los datos al dominio real, cada entrada fue ademas sintetizada a voz con Kokoro TTS y transcrita con Parakeet TDT 0.6B v2, de modo que el modelo aprende a operar sobre la salida real de un reconocedor: numeros en digitos, mayusculas sueltas donde se unen fragmentos de audio y palabras mal oidas.

La innovacion tecnica principal no esta en el entrenamiento sino en el despliegue. Durante la inferencia se puede aplicar una gramatica generada a partir de la propia transcripcion (mediante `constrain.py` de another-stt, consumida por llama.cpp via `--grammar` o el campo `grammar` del servidor). Esta gramatica solo permite escribir las palabras del hablante en orden, ademas de puntuacion y numeros realmente pronunciados; el modelo puede eliminar muletillas y correcciones retractadas, pero no inventar ni sustituir palabras, reordenar nada ni cambiar cifras. Para acelerar la ejecucion en un telefono se aprovechan dos caracteristicas del caso de uso: la salida copia en gran medida la transcripcion, por lo que el "prompt lookup" permite redactar los siguientes tokens desde la transcripcion y verificarlos en un unico lote (unas tres tokens por llamada al modelo en lugar de una); y la transcripcion puede alimentarse por fragmentos mientras el usuario todavia esta hablando. La decodificacion recomendada es greedy y la salida termina en `<|im_end|>`.

El modelo se entreno con la plantilla de chat de Qwen3 y el modo de razonamiento desactivado, usando el prompt de sistema: `Clean up this dictation.`

## Capacidades

- Limpieza de dictado: elimina muletillas y tartamudeos de una transcripcion ASR.
- Aplicacion de correcciones habladas del tipo "a las 6, no, espera, a las 6:30".
- Correccion de puntuacion y uso de mayusculas.
- Normalizacion de numeros, horas y direcciones de correo electronico a su forma escrita habitual.
- Generacion de listas con vinetas, listas numeradas y parrafos cuando el hablante los dicta claramente.
- Reformateo conservador que no responde ni actua sobre el contenido dictado: un prompt dirigido a un asistente se devuelve como el mismo prompt, solo limpiado.
- Restriccion por gramatica opcional que impide inventar, sustituir o reordenar palabras y alterar cifras.
- Integracion con llama.cpp (archivo GGUF) y con el pipeline de another-stt (constrain.py, alimentacion por fragmentos, prompt lookup).
- No soporta tool calling, agentes, vision, audio ni otras modalidades: su funcion se limita a la limpieza de texto en ingles.

## Casos de uso

- Dictado en teclado movil: el modelo limpia en el propio telefono la salida del reconocedor antes de insertarla en cualquier aplicacion, gracias a su tamano (1,1 GB en Q4_K_M) y a las optimizaciones para inferencia on-device.
- Notas y listas de tareas por voz: convierte un dictado como "lista de la compra, huevos, leche, pan y platanos" en una lista con vinetas, util para aplicaciones de notas sin reescribir manualmente.
- Mensajeria y correo dictados: normaliza horas, cantidades y direcciones de correo, y aplica correcciones habladas, de modo que el texto queda listo para enviar sin revision manual.
- Entrada de texto en escritorio Linux: como componente del teclado de dictado de another-stt, permite redactar en cualquier aplicacion de escritorio manteniendo todo el procesamiento en local.
- Flujos con requisitos de privacidad: al ejecutarse totalmente offline, es adecuado para entornos donde no se permite enviar audio ni transcripciones a servicios en la nube (sanidad, legal, administracion).
- Preprocesado en pipelines de ASR: puede insertarse como etapa intermedia entre un reconocedor (por ejemplo, Parakeet o Whisper) y un sistema posterior, mejorando la legibilidad del texto antes de indexarlo o almacenarlo.
- Uso con restriccion por gramatica: en escenarios donde el usuario no revisara el texto (dictado rapido, envio directo), la gramatica generada desde la transcripcion limita las alteraciones a las permitidas, reduciendo el riesgo de que se introduzca contenido no dicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de calidad de formateo, y no se ofrecen comparaciones cuantitativas con otros modelos. La unica referencia de rendimiento es cualitativa: con el "prompt lookup" se obtienen aproximadamente tres tokens por llamada al modelo en lugar de uno, y la transcripcion puede procesarse por fragmentos mientras el usuario habla.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el archivo Q4_K_M ocupa 1,1 GB, por lo que se estima un uso total de aproximadamente 1,5-2 GB contando pesos y cache KV (estimacion, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de memoria; no se requieren aceleradores de datacenter. Una RTX 3060 o superior es mas que suficiente, y tarjetas como A100 o H100 estan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, y tambien en CPU. El autor indica explicitamente que esta pensado para ejecutarse en un telefono.
- Opciones de despliegue: llama.cpp (formato GGUF, con soporte de `--grammar` o campo `grammar` en el servidor); Ollama puede consumir GGUF. Al distribuirse solo en GGUF, no es directamente desplegable en vLLM o TGI sin convertir pesos a safetensors. El repositorio incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput: no se publican cifras concretas. Se conoce la optimizacion de prompt lookup (unas tres tokens por llamada al modelo) y la posibilidad de alimentar la transcripcion por fragmentos durante el habla.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada. La comparacion se limita al modelo base del que deriva.

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| anotherstt formatter | 1,72B | no disponible | Ingles | Apache 2.0 | GGUF (Q4_K_M) | Limpieza de dictado especializada |
| Qwen3-1.7B (base) | 1,72B | no disponible en esta ficha | Multilingue (segun su documentacion) | Apache 2.0 | safetensors | Modelo general de generacion de texto |

Otras alternativas de la misma categoria (formateadores de dictado especializados) no estan documentadas en la informacion disponible. Conviene senalar que sistemas como Parakeet TDT 0.6B v2 o Kokoro TTS aparecen en la ficha como componentes del pipeline (reconocimiento y sintesis), no como modelos competidores.

## Limitaciones y advertencias

- Solo ingles: el modelo no procesa otros idiomas.
- No puede corregir palabras mal oidas por el reconocedor: la restriccion por gramatica mantiene lo transcrito. La aplicacion gestiona terminos conocidos mediante un diccionario personal antes de invocar el formateador.
- En ocasiones omite palabras cortas.
- Las correcciones cuyo arreglo exige reordenar palabras (por ejemplo, "gira a la izquierda en el semaforo, no, a la derecha") no pueden aplicarse bajo la restriccion por gramatica.
- Riesgo de alucinacion acotado por diseno: sin la gramatica, el modelo podria en teoria introducir cambios no deseados; con ella, queda limitado a las palabras de la transcripcion, la puntuacion y las cifras pronunciadas.
- No debe usarse como asistente: no responde ni ejecuta instrucciones dictadas, solo limpia el texto.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B y de los componentes del pipeline (Kokoro TTS, Parakeet) si se integran en un producto.
- Adopcion muy baja en el momento de la consulta (0 descargas, 0 likes) y publicacion reciente, por lo que no hay evidencia de uso en produccion ni validacion externa.
- La model card no documenta sesgos, composicion detallada del dataset mas alla de los 1.400 pares, ni evaluaciones de robustez, lo que dificulta estimar su comportamiento fuera del dominio de dictado en ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joddabod/anotherstt-formatter
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Proyecto another-stt y script `constrain.py`: mencionados en la model card, sin enlace directo disponible
- Parakeet TDT 0.6B v2 (componente de ASR del pipeline): sin enlace en la informacion disponible
- Kokoro TTS (componente de sintesis del pipeline): sin enlace en la informacion disponible
- Papers o blogs adicionales: no disponibles
