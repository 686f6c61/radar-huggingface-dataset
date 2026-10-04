# KnightsAnalytics/tapas-base-finetuned-wtq

## Resumen

KnightsAnalytics/tapas-base-finetuned-wtq es una copia alojada por un tercero del checkpoint TAPAS-base ajustado para WikiTableQuestions (WTQ), la tarea de responder preguntas en lenguaje natural sobre tablas. TAPAS (Table Parser) es una arquitectura desarrollada por Google Research que extiende BERT con embeddings especificos de tabla (posicion de fila y columna, rango relativo y respuesta previa) para seleccionar las celdas que responden a una pregunta. Al estar basado en BERT-base, el modelo es un encoder denso de aproximadamente 110 millones de parametros, con 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion.

El checkpoint esta especializado en la variante WTQ, que cubre preguntas cuya respuesta se extrae directamente de la tabla (seleccion de una o varias celdas, posiblemente encadenada en varios pasos). No es la variante entrenada para SQA (Sequential Question Answering), que si incorpora operadores de agregacion como contar, sumar o promediar. El modelo no genera texto libre: su salida son logits de inicio y fin sobre la secuencia serializada y logits auxiliares de columna y fila.

Es relevante para desarrolladores que necesitan un componente pequeno, rapido y ejecutable en CPU para extraccion de respuestas sobre datos tabulares estructurados (CSV, hojas de calculo, tablas HTML). El repositorio, sin embargo, no aporta informacion tecnica propia: la model card se limita a declarar la licencia apache-2.0, no publica metricas, no declara idiomas y acumula 0 descargas y 0 likes, por lo que debe tratarse como una redistribucion no verificada del checkpoint oficial de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo TAPAS (BERT-base con embeddings de tabla: fila, columna, rango relativo y respuesta previa) |
| Parametros totales | Aproximadamente 110 millones (estimacion basada en la configuracion BERT-base/L=12, H=768, A=12; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens por defecto (limite de posiciones del modelo base). TAPAS usa embeddings de posicion relativa por celda para generalizar a tablas mayores, pero este repositorio no documenta un maximo explicito |
| Tipos de cuantizacion | No se publican pesos cuantizados en el repositorio. Al ser un encoder de ~110 M, la cuantizacion dinamica int8 en ONNX Runtime y la conversion a fp16 son viables |
| Idiomas soportados | No declarados en la model card. El modelo base esta preentrenado y ajustado sobre tablas y preguntas en ingles, por lo que el soporte real es solo ingles |
| Licencia | apache-2.0 |
| Formato de pesos | Repositorio de 0,4 GB; incluye el tag onnx, por lo que cabe esperar pesos PyTorch (safetensors o pytorch_model.bin) junto con una exportacion ONNX. No hay GGUF |
| Tarea declarada (pipeline) | No disponible en la ficha de HuggingFace; por arquitectura corresponde a table-question-answering |
| Autor / procedencia | KnightsAnalytics (redistribucion de terceros). Checkpoint de referencia: google/tapas-base-finetuned-wtq |
| Fecha de creacion / actualizacion | 2026-10-04 / 2026-10-04 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

TAPAS es un encoder transformer de tipo BERT al que se anaden cuatro tipos de embeddings vinculados a la estructura de la tabla: embedding de columna, embedding de fila, embedding de rango relativo (posicion ordinal relativa dentro de la columna o fila) e embedding de la respuesta previa, que permite encadenar selecciones de celdas en varios pasos. La entrada es una serializacion plana de la pregunta seguida de la tabla, donde cada celda se representa como una secuencia de tokens separados por un token de columna y otro de fila. Sobre esa secuencia, el modelo predice un span (posiciones de inicio y fin) y, de forma auxiliar, la columna y la fila de la celda seleccionada. La decodificacion busca la celda que maximiza la verosimilitud, lo que permite un ajuste con supervision debil: solo se necesita la respuesta final, no la traza de razonamiento.

El preentrenamiento original de TAPAS se realizo sobre un corpus de tablas de Wikipedia en ingles (del orden de millones de tablas) con objetivos de modelado de lenguaje enmascarado adaptados al formato tabular. El ajuste para WTQ utiliza el conjunto WikiTableQuestions, compuesto por preguntas de varios pasos sobre tablas de Wikipedia cuya respuesta es un subconjunto de celdas. La diferencia clave respecto a la variante SQA es que WTQ no requiere operadores de agregacion, por lo que este checkpoint no aprende a contar, sumar ni promediar filas.

No se dispone de informacion en el repositorio sobre el proceso concreto de ajuste de esta copia (hiperparametros, numero de epocas, semilla, datos adicionales, uso de RLHF o DPO). Tampoco se documenta ninguna innovacion adicional respecto al checkpoint original. La unica senal tecnica del repositorio es el tag onnx, que sugiere una exportacion a ONNX Runtime ademas de los pesos estandar.

## Capacidades

- Respuesta a preguntas sobre tablas (table question answering): extrae la celda o el conjunto de celdas que responde a una pregunta en lenguaje natural.
- Entrada tabular flexible: acepta la tabla serializada como HTML o como estructura de listas, y en la practica permite cargar CSV con pandas antes de serializar.
- Razonamiento de varios pasos sobre celdas: la cadena de respuestas previas permite encadenar selecciones cuando la respuesta exige varias consultas dentro de la misma tabla.
- Seleccion de celdas y spans: produce posiciones de inicio y fin sobre la secuencia, mas predicciones auxiliares de columna y fila, lo que permite localizar la respuesta exacta.
- Ejecucion en CPU y en GPU de gama baja, al ser un encoder de ~110 M de parametros.
- No soporta agregacion: contar, sumar, promediar, ordenar por maximo o minimo y comparaciones numericas agregadas corresponden a la variante SQA, no a este checkpoint.
- No soporta tool calling ni function calling: la arquitectura no esta disenada para emitir llamadas estructuradas a herramientas.
- No soporta agentes ni razonamiento multi-turno en el sentido conversacional: es un modelo de una sola pasada pregunta-tabla.
- No genera texto libre: no es adecuado como modelo de chat ni de redaccion.
- Sin capacidades multimodales: procesa tablas como texto, no imagenes de tablas ni documentos escaneados.
- Sin capacidades multilingues declaradas: funcionamiento efectivo limitado a ingles.

## Casos de uso

- Consultas sobre hojas de calculo internas: cargar un CSV de ventas o inventario con pandas, serializarlo y responder preguntas del tipo "cual es el stock del producto X en el almacen Y". El modelo devuelve la celda exacta, sin necesidad de escribir SQL.
- Atencion al cliente sobre tablas de tarifas y condiciones: un asistente puede resolver preguntas sobre tablas de precios, plazos o coberturas extrayendo el valor concreto de la celda correspondiente.
- Explotacion de portales de datos abiertos: extraer respuestas puntuales de tablas de presupuestos, estadisticas o censos publicados en HTML, donde no existe un esquema fijo ni un motor de consultas.
- Asistentes de analitica interna (BI): capa de lenguaje natural sobre informes tabulares ya generados, sin requerir acceso de escritura ni generacion de consultas sobre la base de datos.
- Extraccion de especificaciones tecnicas: responder preguntas comparativas sobre tablas de caracteristicas de productos (por ejemplo, "que modelo tiene mas memoria"), siempre que la respuesta sea un valor presente en la tabla y no un calculo agregado.
- Control de calidad de datos tabulares: generar preguntas de verificacion sobre una tabla y comprobar si el modelo localiza la celda esperada, como heuristica de deteccion de tablas mal formateadas o incoherentes.
- Investigacion en supervision debil y table parsing: servir como punto de partida reproducible para comparar estrategias de serializacion de tablas, tecnicas de decodificacion o ajustes posteriores sobre WTQ.
- Integracion en pipelines documentales: dado un documento con tablas extraidas en HTML, responder preguntas puntuales sobre cada tabla como paso previo a un resumen generado por otro modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas y la busqueda web no devolvio ninguna fuente tecnica utilizable (los resultados obtenidos eran de dominios sin relacion con el modelo). No se deben extrapolar cifras del paper original de TAPAS a este checkpoint concreto, ya que se desconoce si los pesos son identicos a los del modelo oficial y que proceso de ajuste se aplico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,44 GB en fp32, 0,22 GB en fp16 y del orden de 0,11-0,15 GB en int8 dinamico con ONNX Runtime. Son estimaciones de peso de parametros para ~110 M de parametros, sin contar el overhead de activaciones y runtime.
- GPU recomendadas: cualquier GPU con 4 GB o mas de memoria. Tarjetas como GTX 1050 Ti, GTX 1650, RTX 3060, RTX 4090 o T4 son mas que suficientes. Aceleradores tipo A100 o H100 estan sobredimensionados para este modelo.
- Ejecucion en CPU: totalmente viable, incluso en portatiles. Es el escenario de despliegue mas razonable dado el tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna, incluidos portatiles con grafica integrada.
- Opciones de despliegue: transformers con la pipeline table-question-answering para PyTorch, ONNX Runtime (el repositorio incluye el tag onnx y la exportacion a int8 dinamico es directa), empaquetado propio con FastAPI o TorchServe. No hay soporte en vLLM, llama.cpp, Ollama ni TGI, ya que son runtimes orientados a modelos generativos y TAPAS es un encoder de seleccion de spans.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas en el repositorio ni en la busqueda web.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Agregacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KnightsAnalytics/tapas-base-finetuned-wtq | TAPAS (encoder BERT-base) | ~110 M (estimado) | 512 tokens | No | apache-2.0 | HuggingFace, 0 descargas |
| google/tapas-base-finetuned-wtq | TAPAS (encoder BERT-base) | ~110 M | 512 tokens | No | apache-2.0 | HuggingFace, checkpoint oficial |
| google/tapas-base-finetuned-sqa | TAPAS (encoder BERT-base) | ~110 M | 512 tokens | Si (conteo, suma, promedio, comparaciones) | apache-2.0 | HuggingFace, checkpoint oficial |
| google/tapas-large-finetuned-wtq | TAPAS (encoder BERT-large) | ~340 M | 512 tokens | No | apache-2.0 | HuggingFace, checkpoint oficial |
| microsoft/tapex-base-finetuned-wtq | TAPEX (encoder-decoder BART-base) | ~140 M (aproximado) | 512 tokens | Segun ajuste | Licencia del modelo base (MIT en BART) | HuggingFace, checkpoint oficial |

Los datos de parametros de las variantes TAPAS-large y TAPEX-base son aproximaciones basadas en sus arquitecturas base y no cifras confirmadas en la informacion proporcionada. No hay datos de rendimiento comparado disponibles para esta copia.

## Limitaciones y advertencias

- Redistribucion no verificada: el repositorio pertenece a un tercero, no a Google, y acumula 0 descargas y 0 likes. No hay evidencia de que los pesos sean identicos a los del checkpoint oficial google/tapas-base-finetuned-wtq.
- Model card practicamente vacia: solo declara la licencia apache-2.0. No documenta datos de entrenamiento, hiperparametros, idiomas, metricas ni limitaciones.
- Anomalia en los metadatos: las fechas de creacion y actualizacion indicadas (2026-10-04) son posteriores a la fecha de consulta habitual y no coinciden con la cronologia esperada del modelo base, lo que refuerza la necesidad de verificar el contenido del repositorio antes de usarlo.
- Sin benchmarks: no hay ninguna metrica publicada para este checkpoint, ni en la model card ni en fuentes web utilizables.
- Idioma: funcionamiento efectivo solo en ingles. Las preguntas o tablas en castellano no estan soportadas de forma fiable.
- Sin agregacion: no puede responder preguntas que requieran contar, sumar, promediar ni comparar agregados. Para esos casos hay que usar la variante SQA.
- Sin generacion de texto: la salida es una seleccion de celdas, no una respuesta redactada. No sirve como modelo conversacional ni como generador de resumenes.
- Limite de contexto: 512 tokens. Las tablas grandes deben truncarse o filtrarse antes de la inferencia, lo que puede eliminar la fila que contiene la respuesta y producir resultados incorrectos silenciosamente.
- Sensibilidad al formato: el rendimiento depende de como se serialice la tabla (HTML frente a listas, tratamiento de cabeceras, celdas vacias, tipos numericos). Cambiar la serializacion respecto a la usada en el ajuste degrada los resultados.
- Riesgo de seleccion incorrecta: aunque el modelo no puede inventar texto fuera de la tabla, si puede devolver una celda equivocada cuando la pregunta es ambigua o cuando la respuesta exige agregacion, sin ninguna senal de abandono.
- Alucinacion: el riesgo de contenido inventado es estructuralmente bajo porque la respuesta se restringe a celdas de la tabla, pero la confianza del modelo no es una medida calibrada de correccion.
- Uso comercial: la licencia apache-2.0 permite uso comercial y modificacion, con obligacion de conservar el aviso de licencia y el fichero NOTICE correspondiente. No hay garantias por parte del autor del repositorio.
- Produccion: no se recomienda desplegarlo sin una evaluacion propia sobre el dominio objetivo, dado que no existen metricas publicadas ni validacion de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KnightsAnalytics/tapas-base-finetuned-wtq
- Checkpoint oficial de referencia (Google): https://huggingface.co/google/tapas-base-finetuned-wtq
- Variante con agregacion (Google): https://huggingface.co/google/tapas-base-finetuned-sqa
- Modelo equivalente con encoder-decoder (Microsoft): https://huggingface.co/microsoft/tapex-base-finetuned-wtq
- Paper original de TAPAS: https://arxiv.org/abs/2004.02349
- Resultados de la busqueda web: no se encontro ningun enlace relevante. Los resultados devueltos correspondian a dominios de contenido para adultos sin ninguna relacion con el modelo, por lo que se han descartado y no se reproducen aqui.
