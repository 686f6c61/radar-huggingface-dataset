# KxSystems/qsql-qwen35-9b

## Resumen

qsql-qwen35-9b es un ajuste fino (fine-tune) del modelo Qwen3.5-9B desarrollado por KxSystems, orientado a una tarea muy concreta: generar codigo q/kdb+ (qSQL) a partir de una instruccion en lenguaje natural acompanada de los esquemas de las tablas implicadas. El modelo parte de la arquitectura Qwen3_5ForCausalLM, con 8.953.803.264 parametros (aproximadamente 8,95B), `hidden_size` de 4096 y 32 capas, y ha sido entrenado mediante LoRA (r=64, alpha=128, dropout 0,05) durante 3 epocas, fusionando despues los adaptadores en los pesos base para publicar un unico modelo denso en bfloat16.

Su relevancia es la de un especialista estrecho: no pretende ser un modelo generalista, sino un generador de borradores de qSQL para un llamador que verifica el resultado. El propio autor lo describe como un modelo de "redaccion de borradores" que debe envolverse en verificacion (parseo, ejecucion y comparacion contra una referencia) en lugar de confiarse directamente. La modalidad es exclusivamente texto: la torre multimodal del modelo base no esta presente en estos pesos.

El modelo conserva la ventana arquitectonica de 262.144 tokens del base, aunque el autor recomienda servirlo a 32.768 tokens para que quepa en una sola GPU de 24 GB con cuantizacion fp8 (aproximadamente 20 GB de VRAM). Se distribuye bajo licencia Apache-2.0 y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (`model_type: qwen3_5_text`); transformer hibrido con 24 capas de atencion lineal + 8 capas de atencion completa (una de cada cuatro es atencion completa, `full_attention_interval: 4`) |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 262.144 tokens (`max_position_embeddings`); el autor recomienda servir a 32.768 tokens |
| Tipos de cuantizacion | fp8 documentado para vLLM; no se publican pesos GGUF ni otras cuantizaciones (no disponible) |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

Otros datos de configuracion: `hidden_size` 4096, 32 capas, `vocab_size` 248.320 con longitud real de tokenizer 248.259. Tamano del repositorio: 17,9 GB. Token de fin de secuencia `<|im_end|>`, token de relleno `<|endoftext|>`.

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-9B base, un transformer con esquema de atencion hibrido: 24 de sus 32 capas emplean atencion lineal y 8 emplean atencion completa, con una capa de atencion completa cada cuatro capas. Los pesos se publican en bfloat16. La torre multimodal del modelo base no esta incluida, por lo que el modelo resultante es estrictamente de texto.

El ajuste fino se realizo con LoRA (r=64, alpha=128, dropout 0,05) durante 3 epocas sobre el modelo base, y los adaptadores se fusionaron en los pesos originales antes de publicar el modelo denso. La informacion disponible no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, mas alla de que este contiene ejemplos de instruccion mas esquemas de tablas y que no incluye datos de tool calling ni de trazas de razonamiento. No se menciona el uso de RLHF o DPO. La innovacion principal no es arquitectonica, sino de especializacion: el modelo ha sido entrenado sobre una unica forma de prompt, con un turno de sistema literal ("You are an expert q/kdb+ programmer.") y un turno de usuario que combina la instruccion, un bloque `Table schemas:` con lineas indentadas con dos espacios y, opcionalmente, una linea `Expected result schema:`.

## Capacidades

- Generacion de codigo q/kdb+ (qSQL) a partir de una instruccion en lenguaje natural y los esquemas de las tablas implicadas.
- Especializacion estrecha: solo genera q; no esta orientado a otros lenguajes de programacion.
- Acepta una pista opcional de forma del resultado mediante la linea `Expected result schema:`, que actua como indicacion de la estructura esperada.
- Sensible al contrato de prompt: funciona mejor con el turno de sistema exacto y con los esquemas de tabla presentes en el contexto.
- Generacion de multiples candidatos: con temperatura 0,8 y varias muestras independientes, el llamador puede descartar las que no parsean o no ejecutan y quedarse con las que coinciden.

Capacidades no soportadas (explicitas en la model card):

- Tool calling / function calling: no presente en los datos de entrenamiento; pasar `tools=[...]` a `apply_chat_template` se ignora silenciosamente.
- Modo thinking / trazas de razonamiento: no existe bloque de razonamiento en la plantilla de chat ni en los datos.
- Vision: la torre multimodal del modelo base no esta en estos pesos.
- Multilingue: solo ingles.

## Casos de uso

- Borrador verificado de consultas qSQL: un analista describe la operacion en lenguaje natural y aporta los esquemas de las tablas; el modelo devuelve una consulta q que despues se parsea, se ejecuta y se compara contra una referencia calculada por otra via antes de integrarla.
- Migracion de SQL a q: traduccion asistida de consultas existentes a q/kdb+ como primer borrador, con la verificacion posterior obligatoria para descartar equivalencias incorrectas.
- Generacion de candidatos multiples y seleccion por consenso: se muestrean varias respuestas con temperatura 0,8, se descartan las que no parsean o fallan al ejecutar y se conserva la que los supervivientes coinciden en producir; util para aumentar la tasa de acierto en consultas complejas.
- Asistencia en herramientas internas de analitica: integracion en un editor o notebook orientado a kdb+ que proponga qSQL a partir de la instruccion del usuario y de los esquemas del entorno, dejando la ejecucion bajo control del usuario.
- Prototipado rapido sobre kdb+: generacion de consultas de agregacion, join o filtrado para explorar un dataset recien cargado, reduciendo el tiempo hasta la primera consulta ejecutable.
- Formacion y aprendizaje de q: uso como generador de ejemplos de qSQL que un instructor o un alumno revisa y ejecuta para entender construcciones idiomaticas, siempre con la advertencia de que el codigo puede ser incorrecto.
- Canal de generacion dentro de un pipeline de CI: el modelo produce el borrador y un paso posterior automatizado valida el parseo y la ejecucion contra datos de prueba, bloqueando la integracion si el resultado no coincide con la referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 17,9 GB, equivalente al tamano del repositorio publicado (8,95B parametros a 2 bytes por parametro).
- Despliegue recomendado por el autor: vLLM con cuantizacion fp8 y `--max-model-len 32768`, con un consumo aproximado de 20 GB de VRAM, es decir, una unica tarjeta de 24 GB.
- GPU compatibles con ese perfil: tarjetas de 24 GB como RTX 4090, L4 o A10G; cabe en GPU de consumo de gama alta con 24 GB de memoria.
- Para servir en bfloat16 sin cuantizar con contexto largo, se necesitaria mas memoria que la indicada para fp8; el autor no publica cifras concretas para ese escenario (no disponible).
- Software de despliegue: se requiere vLLM >= 0.27.0, la primera version con soporte nativo para `Qwen3_5ForCausalLM` en modo solo texto; versiones anteriores necesitan parches del codigo fuente y no estan soportadas. No se documentan otras opciones como llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Enfoque |
|---|---|---|---|---|---|
| qsql-qwen35-9b | 8,95B (denso) | 262.144 arquitectonicos; 32.768 servidos | solo texto | apache-2.0 | Especialista en generacion de q/kdb+ (qSQL) |
| Qwen3.5-9B (base) | 9B | 262.144 (`max_position_embeddings`) | texto y multimodal (la torre multimodal no esta en el fine-tune) | apache-2.0 | Modelo generalista |
| Otros especialistas en q/kdb+ | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada. La comparacion directa con el modelo base en tareas de generacion de qSQL no puede cuantificarse sin resultados publicados.

## Limitaciones y advertencias

- Modo de fallo principal: codigo que parsea, pasa el lint y se ejecuta, pero calcula algo distinto de lo esperado. El autor lo advierte de forma explicita; no debe ponerse su salida directamente en una ruta de consulta en produccion sin verificacion.
- Uso previsto restringido: redaccion de borradores para un llamador que verifica el resultado (parsear, ejecutar y comparar contra una referencia).
- No soporta tool calling ni function calling; el argumento `tools=[...]` se ignora silenciosamente en lugar de respetarse.
- No dispone de modo de razonamiento ni de bloque thinking.
- Es un especialista estrecho: solo genera q, no otros lenguajes.
- Sensible al contrato de prompt: requiere el turno de sistema exacto y los esquemas de tabla en el contexto; la calidad cae si se omiten los esquemas.
- Solo soporta ingles.
- Aunque la ventana arquitectonica es de 262.144 tokens, el propio autor recomienda servir a 32.768 tokens, por lo que el uso practico esta limitado a esa longitud salvo que se disponga de mas memoria.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de garantias y el riesgo de codigo incorrecto hacen necesaria la verificacion en cualquier despliegue de produccion.
- Sin resultados de benchmarks publicados y con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KxSystems/qsql-qwen35-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
