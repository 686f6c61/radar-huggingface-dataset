# davidalarrea/S1-mini-MLX-8bit

## Resumen

S1-mini-MLX-8bit es una conversion cuantizada a 8 bits en formato MLX del modelo S1-mini de Superwhisper, un modelo de lenguaje causal de 596 millones de parametros (0,44B sin contar embeddings, con pesos atados) afinado desde Qwen/Qwen3-0.6B para una unica tarea: reescribir transcripciones crudas de ASR como texto escrito limpio. El repositorio lo publica el usuario davidalarrea y no es oficial de Superwhisper; se genero con mlx-lm 0.31.3 a partir de los pesos BF16 originales, con cuantizacion afin de 8 bits y group size de 64, y conserva tokenizer, chat template, configuracion de generacion y licencia del modelo base.

El problema que resuelve es concreto y muy frecuente en productos de dictado: la salida de un sistema de reconocimiento de voz suele llegar en minusculas, sin puntuacion y con muletillas, falsos arranques y autocorrecciones. S1-mini elimina esos artefactos, aplica puntuacion y mayusculas (truecasing) y convierte numeros, fechas, horas, importes y direcciones de correo habladas a su forma escrita. El autor reporta un 94,8 % de exactitud por token sobre un conjunto de validacion de 7.519 casos en ingles.

Es relevante ahora porque demuestra que una tarea de post-procesado linguistico puede resolverse con un modelo de menos de 600 millones de parametros que ocupa 462 MiB cuantizado y se ejecuta comodamente en la CPU de un portatil, lo que habilita dictado con normalizacion de calidad sin enviar audio ni texto a la nube. La contrapartida es que no es un modelo conversacional: solo cubre ingles, no sigue instrucciones generales y se controla mediante una linea de control al principio de la entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia Qwen3), atencion con GQA (16 cabezas Q, 8 KV), 28 capas |
| Parametros totales | 596.049.920 parametros unicos (0,44B sin embeddings, pesos atados). El Hub muestra 0,8B porque lm_head.weight se almacena materializado y duplica los 155,6M del embedding |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada. El autor recomienda entradas de hasta ~1.000 tokens y trocear transcripciones mas largas |
| Tipos de cuantizacion | Este repo: 8 bits afin MLX, group size 64. El modelo base ofrece pesos BF16 y builds GGUF (llama.cpp, Ollama, LM Studio) en superwhisper/s1-mini-GGUF |
| Idiomas soportados | Ingles unicamente (release v1) |
| Licencia | s1-mini-license, descrita en la model card como Apache 2.0 + clausula de naming; el Hub la etiqueta como "other". Conviene revisar LICENSE antes de uso comercial |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |
| Repositorio | davidalarrea/S1-mini-MLX-8bit (conversion de terceros, no oficial) |
| Modelo base | superwhisper/s1-mini, a su vez fine-tune de Qwen/Qwen3-0.6B |
| Precision original | BF16 |
| Pipeline declarado | text-generation |
| Tamano del repo | 0,6 GB (fichero cuantizado de 462 MiB) |
| Conversion | mlx-lm 0.31.3 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-0.6B: un transformer causal denso de 28 capas con Grouped Query Attention (16 cabezas de consulta frente a 8 de clave/valor), pesos de embedding atados y 596 millones de parametros unicos. Sobre esa base, Superwhisper realizo un fine-tune orientado a una sola transformacion de texto (normalizacion de transcripciones ASR), no a instrucciones generales. El modelo recibe un system prompt que define su papel, seguido de una linea de control con los ejes `Styling`, `Structure` y `Context`, un salto de linea y una unica transcripcion cruda; devuelve texto plano sin preambulo ni explicacion.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos no estan publicados en la model card consultada. La innovacion practica del release es de eficiencia y de control de salida: la linea de control permite ajustar el registro (por ejemplo `semi-formal`), la estructura (`prose`, `lists`, que puede producir vinetas Markdown) y el contexto (`general`, `email`, que puede introducir lineas en blanco entre saludo, cuerpo y despedida). El autor documenta ademas que, cuando la entrada es solo ruido o muletillas, la salida correcta es la cadena vacia, y que el modelo la produce. Esta conversion MLX preserva tokenizer, plantilla de chat y configuracion de generacion del original.

## Capacidades

- Normalizacion de transcripciones ASR: eliminacion de muletillas y ruido verbal, resolucion de falsos arranques y autocorrecciones hacia el valor final que pronuncia el hablante.
- Puntuacion y truecasing: insercion de comas, puntos y mayusculas sobre texto que llega en minusculas y sin signos.
- Escritura de elementos hablados: numeros, fechas, horas, importes monetarios y direcciones de correo electronico convertidos a su forma escrita.
- Normalizacion inversa y control de estilo: la linea de control permite fijar registro, estructura y contexto de la salida.
- Salida estructurada opcional: bajo `Structure: lists` puede generar vinetas Markdown; bajo `Context: email`, separar saludo, cuerpo y despedida con lineas en blanco.
- Supresion controlada: devuelve cadena vacia ante entradas compuestas unicamente de ruido o relleno.
- Ejecucion local en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling ni uso como agente multi-paso: no es un modelo conversacional ni sigue instrucciones generales.
- No dispone de vision, audio (no procesa audio pese a las etiquetas ASR: opera sobre texto ya transcrito), thinking mode ni capacidades multimodales.

## Casos de uso

- Post-procesado en aplicaciones de dictado: el escenario principal. La app captura audio, un motor ASR produce la transcripcion cruda y S1-mini la reescribe antes de insertarla en el campo de texto del usuario, con 462 MiB de peso y ejecucion en CPU que evita enviar contenido a un servidor.
- Limpieza de subtitulos y transcripciones en pipelines de medios: normalizar la salida de un ASR por lotes para obtener subtitulos puntuados y con mayusculas correctas antes de la fase de sincronizacion y publicacion.
- Redaccion de correos por voz: usando `Context: email`, el modelo devuelve un texto con saludo, cuerpo y despedida diferenciados, listo para revisar, lo que reduce la edicion manual frente a una transcripcion literal.
- Notas de reunion estructuradas: con `Structure: lists`, la transcripcion de una nota de voz se convierte en una lista de puntos accionables, util en aplicaciones de productividad que guardan notas en Markdown.
- Preprocesado de corpus para NLP: normalizar transcripciones antes de indexarlas en un buscador o en un sistema de RAG, de modo que las consultas escritas casen mejor con documentos derivados de voz.
- Generacion de datos sinteticos de entrenamiento: producir pares (transcripcion ruidosa, texto limpio) a partir de corpus ASR para entrenar o evaluar modelos de puntuacion y truecasing.
- Accesibilidad: transcripcion en vivo con puntuacion y mayusculas para personas con discapacidad auditiva, siempre que se asuma la latencia adicional del post-procesado.
- Documentacion profesional dictada (informes, actas, historiales de campo): el modelo aplica el registro solicitado y normaliza fechas e importes, con revision humana obligatoria en dominios donde un error de normalizacion tenga consecuencias.
- Integracion en herramientas de escritura local en macOS: al ser una conversion MLX, encaja en aplicaciones nativas de Apple Silicon que quieran normalizacion offline sin enviar datos fuera del dispositivo.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Detalle |
|---|---|---|
| Exactitud por token (modelo original) | 94,8 % | Conjunto de validacion retenido de 7.519 casos en ingles |
| Comprobacion de cordura de la conversion | 4 de 6 coincidencias exactas | Seis casos deterministas frente a las cadenas de referencia del modelo original |
| Diferencias observadas en la comprobacion | 2 casos | Un "So," inicial retenido y una variacion de coma |

No se han publicado resultados de benchmarks en la informacion disponible para metricas estandar tipo MMLU, HumanEval o GSM8K, y no serian representativas de un modelo de normalizacion de una sola tarea. El autor advierte explicitamente que la comprobacion de seis casos es una verificacion funcional minima y no sustituye a la evaluacion completa de 7.519 casos del modelo original, por lo que el 94,8 % corresponde al modelo upstream y no esta revalidado en esta conversion cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en cuantizacion de 8 bits MLX (fichero de 462 MiB, repo de 0,6 GB). En BF16 el modelo original ronda los 1,2 GB de pesos.
- Ejecucion en CPU: el autor indica que el build cuantizado se ejecuta comodamente en la CPU de un portatil. En MLX sobre Apple Silicon, se puede forzar CPU o dejar la GPU integrada.
- GPU dedicadas: no requiere A100, H100 ni RTX 4090. Cualquier GPU consumer con 2 GB libres de VRAM es suficiente para los pesos cuantizados; en el ecosistema GGUF basta una GPU integrada o la CPU.
- Compatibilidad con hardware consumer: si, de forma holgada. Es un modelo de menos de 600 millones de parametros pensado para ejecucion local.
- Restriccion de plataforma: MLX solo funciona en Apple Silicon (chips M-series). En Windows, Linux o GPU NVIDIA hay que usar los builds GGUF del modelo base.
- Opciones de despliegue: mlx-lm (`uv tool install mlx-lm`) para este repositorio; llama.cpp, Ollama y LM Studio mediante superwhisper/s1-mini-GGUF; Transformers 4.51.0 o superior para los pesos BF16 originales. vLLM y TGI no son compatibles con pesos MLX.
- Latencia y throughput estimados: no disponible. El ejemplo oficial de uso fija `max_tokens=128`, lo que sugiere salidas cortas y por tanto tiempos de generacion reducidos, pero no se publican cifras de latencia ni de tokens por segundo.
- Memoria adicional: al recomendar entradas de hasta ~1.000 tokens, el coste de KV cache es despreciable en cualquier configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| davidalarrea/S1-mini-MLX-8bit | 596M unicos, 8 bits MLX | No disponible; entradas recomendadas de ~1.000 tokens | Sin evaluacion completa propia; 4/6 coincidencias en comprobacion de cordura | s1-mini-license (Apache 2.0 + clausula de naming, Hub: "other") | Solo MLX / Apple Silicon, safetensors |
| superwhisper/s1-mini | 596M unicos, BF16 | No disponible; entradas recomendadas de ~1.000 tokens | 94,8 % de exactitud por token en 7.519 casos | s1-mini-license | Transformers 4.51.0+, pesos BF16 |
| superwhisper/s1-mini-GGUF | Mismo modelo, cuantizaciones GGUF | No disponible | No publicada por build | s1-mini-license | llama.cpp, Ollama, LM Studio, multiplataforma |
| Qwen/Qwen3-0.6B | 596M unicos (0,8B reportados en el Hub) | Modelo generalista de proposito multiple | No comparable: modelo base sin el fine-tune de normalizacion | Apache 2.0 | Transformers, amplio soporte de ecosistema |

Frente a alternativas especializadas de restauracion de puntuacion y truecasing basadas en modelos tipo BERT o en reglas, S1-mini aporta un control explicito del estilo de salida mediante linea de control, algo que no ofrecen las aproximaciones puramente discriminativas. No se dispone de datos publicados que permitan comparar directamente con esas alternativas en la misma evaluacion.

## Limitaciones y advertencias

- Modelo de una sola tarea: no es conversacional y no sigue instrucciones generales. Usarlo fuera de la normalizacion de transcripciones produce resultados poco fiables.
- Solo ingles en la release v1. No hay soporte multilingue ni se ha anunciado.
- Riesgo de reescritura semantica: al resolver autocorrecciones y normalizar numeros, fechas, horas, importes y correos, puede fijar un valor distinto del que el hablante queria. En dominios sensibles (sanitario, legal, financiero) requiere revision humana.
- Variabilidad en puntuacion: la comprobacion del autor detecto una variacion de coma y la retencion de un "So," inicial respecto a la referencia, lo que indica que la salida no es perfectamente determinista en detalles de formato.
- Limitacion de longitud: el autor recomienda entradas de hasta ~1.000 tokens y trocear las transcripciones mas largas. No se documenta la ventana de contexto real del config, por lo que superar ese limite es arriesgado.
- Salida vacia legitima: ante entradas de puro ruido el modelo devuelve cadena vacia; los consumidores del pipeline deben tratar ese caso y no interpretarlo como un fallo.
- Conversion no oficial: el repositorio lo publica davidalarrea, no Superwhisper. La validacion se limita a seis casos y no reproduce la evaluacion de 7.519 casos del original; conviene validar en el dominio propio antes de produccion.
- Discrepancia de identificadores: la model card del repositorio muestra ejemplos con `mlx-community/S1-mini-MLX-8bit`, mientras que el ID real del repositorio es `davidalarrea/S1-mini-MLX-8bit`. Verificar la ruta antes de cargar el modelo.
- Restricciones de licencia: la licencia es s1-mini-license, descrita como Apache 2.0 con clausula de naming, y el Hub la marca como "other". Hay que revisar el texto de LICENSE para uso comercial o para integrarlo en un producto de dictado propio.
- Dependencia de plataforma: los pesos MLX solo se ejecutan en Apple Silicon. Fuera de ese ecosistema hay que recurrir a los builds GGUF.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o robustez para este modelo ni para su base.
- Adopcion incipiente: el repositorio figura con 0 descargas y 0 likes en la informacion proporcionada, por lo que no existe todavia validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/davidalarrea/S1-mini-MLX-8bit
- Modelo base: https://huggingface.co/superwhisper/s1-mini
- Pesos originales BF16, revision v1: https://huggingface.co/superwhisper/s1-mini/tree/v1
- Builds GGUF: https://huggingface.co/superwhisper/s1-mini-GGUF
- Modelo fundacional: https://huggingface.co/Qwen/Qwen3-0.6B
- Sitio de Superwhisper: https://superwhisper.com
- Servidor de Discord: https://discord.gg/tF98XvJNvB
- Licencia del modelo: LICENSE (incluida en el repositorio de HuggingFace)
- Paper referenciado en las etiquetas del repositorio (informe tecnico de Qwen3): arXiv:2505.09388
- Nota sobre la busqueda web: los resultados proporcionados (paginas de soporte de Google Translate, un hilo de RPG Maker y dos hilos de Microsoft Community) no contienen informacion relevante sobre este modelo ni se han utilizado para elaborar la ficha.
