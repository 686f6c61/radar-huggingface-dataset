# KxSystems/qsql-qwen35-9b

## Resumen

qsql-qwen35-9b es un ajuste fino (fine-tune) del modelo Qwen3.5-9B de Alibaba especializado en la generacion de qSQL, el dialecto de consultas del sistema de bases de datos de series temporales kdb+ y su variante KDB-X. Lo desarrolla KxSystems, la empresa responsable de kdb+, y resuelve un problema muy concreto: traducir instrucciones en lenguaje natural, junto con los esquemas de las tablas implicadas, a codigo q ejecutable para analitica financiera.

El modelo parte de una arquitectura transformer hibrida con 32 capas, de las cuales 24 son de atencion lineal y 8 de atencion completa (una capa completa cada cuatro). Con 8.953.803.264 parametros en bfloat16 y una ventana de contexto declarada de 262.144 tokens, hereda la base Qwen3.5-9B y la especializa mediante LoRA (r=64, alfa=128, dropout 0.05) durante 3 epocas, fusionada despues en los pesos base y publicada como un unico modelo denso.

Su relevancia actual radica en que es un especialista estrecho y bien delimitado: no pretende ser un asistente general, sino una pieza dentro de un pipeline donde un modelo de proposito general orquesta y este genera la consulta, que luego se verifica (se parsea, se ejecuta y se compara con una referencia). La licencia Apache-2.0 y el formato safetensors facilitan su integracion en entornos de produccion con validacion humana o automatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (`model_type: qwen3_5_text`), transformer hibrido con atencion lineal y atencion completa |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (`max_position_embeddings`); el autor no especifica la longitud servida en produccion |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |
| hidden_size | 4096 |
| Numero de capas | 32 (24 de atencion lineal + 8 de atencion completa, intervalo 4) |
| Vocabulario | 248.320 (`vocab_size`), longitud del tokenizer 248.259 |
| Modalidad | solo texto (la torre multimodal del modelo base no esta presente) |
| Metodo de ajuste | LoRA r=64, alfa=128, dropout 0.05, 3 epocas, fusionado en los pesos base |
| Tamano del repositorio | 17,9 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B: un transformer hibrido en el que la mayoria de las capas (24 de 32) emplean atencion lineal y solo cada cuarta capa usa atencion completa (`full_attention_interval: 4`). Esta combinacion busca reducir el coste computacional y de memoria en contextos largos manteniendo la capacidad de recuperacion de informacion a distancia. El modelo base tiene 4096 dimensiones ocultas y un vocabulario de 248.320 entradas.

El ajuste fino se realizo con LoRA sobre el modelo base durante 3 epocas, con rango 64, alfa 128 y dropout 0.05, y los adaptadores se fusionaron en los pesos originales para publicar un unico modelo denso en bfloat16. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, pero si describe el contrato de prompt con el que se entreno: un turno de sistema literal («You are an expert q/kdb+ programmer.») y un turno de usuario con la instruccion, una linea en blanco y un bloque `Table schemas:` con lineas indentadas con dos espacios en notacion de diccionario q (`` `col1`col2!`t1`t2 ``). Los datos de entrenamiento no incluyeron definiciones de herramientas ni trazas de razonamiento, lo que condiciona sus capacidades (ver seccion de limitaciones).

## Capacidades

- Generacion de consultas qSQL para kdb+ y KDB-X a partir de instrucciones en lenguaje natural y esquemas de tablas.
- Cobertura de dominios financieros: datos de mercado y analitica de ejecucion, carteras y riesgo, renta fija, divisas y derivados, cumplimiento normativo y datos de referencia.
- Respeto de un contrato de prompt estricto: turno de sistema fijo, instruccion, bloque de esquemas y, opcionalmente, una linea `Expected result schema:` que describe la forma del resultado esperado (tabla sin clave, tabla con clave, atomo o lista, con tipos q).
- Generacion de codigo q con tipos de columna explicitos en los esquemas de entrada.
- No soporta tool calling ni function calling: pasar `tools=[...]` a `apply_chat_template` se ignora silenciosamente.
- No dispone de modo de razonamiento ni de bloque de pensamiento en la plantilla de chat.
- No esta disenado para explicar sintaxis o semantica de q ni para predecir el resultado de una expresion.
- Capacidad multilingue limitada al ingles.
- No es apto como modelo principal de un agente; su uso previsto es como especialista invocado por un modelo de proposito general (por ejemplo, a traves del servidor MCP `mcp-qsql-suggester`).

## Casos de uso

- Generacion asistida de consultas de analitica de mercado: un analista describe en lenguaje natural un calculo (por ejemplo, el precio medio ponderado por volumen por simbolo) y aporta el esquema de la tabla `trade`; el modelo devuelve la consulta q, que se valida antes de ejecutarse. Es adecuado porque el entrenamiento cubre exactamente este tipo de tareas con esquemas en notacion q.
- Integracion en pipelines de validacion automatizada: el modelo actua como generador de candidatos dentro de un ciclo en el que un verificador parsea, ejecuta y compara el resultado con una implementacion de referencia. La linea `Expected result schema:` permite comprobar la forma del resultado de forma programatica.
- Analitica de carteras y riesgo: traduccion de instrucciones sobre agregaciones, ventanas temporales y agrupaciones a consultas q sobre tablas de posiciones y factores, aprovechando el conocimiento del dominio financiero presente en el ajuste.
- Renta fija, divisas y derivados: generacion de consultas para calculos de precios, curvas y sensibilidades sobre esquemas de tablas especificos, siempre con revision posterior.
- Cumplimiento normativo y datos de referencia: redaccion de consultas de extraccion y conciliacion sobre tablas de referencia, donde el coste de escribir q a mano es alto y la revision humana es parte del proceso.
- Asistente integrado en un IDE o en un servidor MCP: un modelo general interpreta la peticion del usuario y delega en este especialista la generacion de la consulta, manteniendo el modelo general como orquestador y este como herramienta acotada.
- Prototipado rapido de consultas para equipos con poca experiencia en q: el modelo reduce la curva de aprendizaje al producir una primera version de la consulta que el desarrollador revisa y corrige.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion auditada por humanos frente a modelos de proposito general de frontera, pero no incluye cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 18 GB solo para los pesos (8,95B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, se recomienda al menos 24 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 9-10 GB para los pesos; en 4 bits, en torno a 5-6 GB. El autor no publica pesos cuantizados, por lo que habria que generarlos.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para despliegue en bfloat16 con contexto largo. En GPUs de consumo, una RTX 4090 (24 GB) puede alojar los pesos en bfloat16 con margen limitado y contextos cortos; una RTX 3090 (24 GB) esta en el limite.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB en bfloat16 con contexto reducido, o en tarjetas de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (ejemplo oficial de la model card), vLLM y TGI para servido en produccion; llama.cpp u Ollama requeririan conversion a GGUF, no publicada por el autor. El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KxSystems/qsql-qwen35-9b | 8,95B | 262.144 | qSQL para kdb+/KDB-X | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | aproximadamente 9B | 262.144 | Proposito general, multimodal en el base | Apache-2.0 | Hugging Face |
| Modelos generales de frontera (familia GPT/Claude/Gemini) | no disponible | no disponible | Proposito general, con tool calling | Propietaria | APIs comerciales |

La comparacion relevante es con su modelo base: qsql-qwen35-9b elimina la torre multimodal y especializa el comportamiento en qSQL, a costa de perder capacidades generales, tool calling y modo de razonamiento. Frente a modelos generales de frontera, la model card indica que existe una evaluacion auditada por humanos, pero no aporta cifras que permitan una comparacion cuantitativa en este material.

## Limitaciones y advertencias

- Generacion no verificada: el autor advierte explicitamente de que la salida no debe entrar directamente en una ruta de consulta en produccion; debe parsearse, ejecutarse y compararse con una referencia.
- Sin soporte de tool calling: el argumento `tools` se ignora silenciosamente, lo que puede provocar fallos dificiles de detectar si se asume que el modelo respeta definiciones de herramientas.
- Sin modo de razonamiento: no hay bloque de pensamiento ni trazas de razonamiento en la plantilla de chat.
- No explica q: puede responder incorrectamente a preguntas sobre sintaxis, semantica o el resultado de una expresion; su entrenamiento se centra en escribir consultas.
- No apto como modelo principal de agentes: no ha visto prompts de sistema de agentes ni definiciones de herramientas; debe usarse como especialista subordinado a un modelo general.
- Sensibilidad al contrato de prompt: el rendimiento cae si se omite el bloque `Table schemas:` o si no se usa el turno de sistema literal; los esquemas son practicamente obligatorios.
- La linea `Expected result schema:` no formaba parte de los datos de entrenamiento; su uso proviene del arnes de evaluacion y puede no generalizar igual de bien.
- Idioma: solo ingles; las instrucciones en castellano no estan cubiertas por el entrenamiento declarado.
- Ambito estrecho: cualquier tarea fuera de qSQL (texto general, otros lenguajes, otras bases de datos) queda fuera de su uso previsto.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al ser un especialista de dominio financiero, puede reproducir convenciones y supuestos de ese sector.
- Riesgo de alucinacion: presente en la generacion de codigo; se mitiga con verificacion automatica y revision humana.
- Licencia Apache-2.0: permite uso comercial, pero no exime de la responsabilidad sobre las consultas generadas ni de su validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KxSystems/qsql-qwen35-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Servidor MCP del autor: https://github.com/KxSystems/mcp-qsql-suggester
