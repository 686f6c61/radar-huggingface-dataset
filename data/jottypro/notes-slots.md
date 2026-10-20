# jottypro/notes-slots

## Resumen

notes-slots es un modelo compacto de clasificacion de tokens (etiquetado BIO) que extrae cuatro tipos de ranuras —participantes, fechas y horas, prioridades y recurrencias— de notas y recordatorios breves en ingles. Lo desarrolla el usuario jottypro y se distribuye como un paquete ONNX cuantizado en INT8 de 7,56 MB, pensado para ejecutarse integramente en el cliente mediante Transformers.js sobre WebAssembly, sin backend ni GPU.

El modelo parte de microsoft/xtremedistil-l6-h256-uncased (MIT), un BERT de 6 capas, tamano oculto 256, 8 cabezas e intermedio 1024, con un vocabulario podado de 30.522 a 9.567 piezas y unas 7,6 millones de parametros. Se afino sobre el split en-US de AmazonScience/MASSIVE (escenarios calendar, datetime, email y lists) remapeado a un esquema local de 4 ranuras, complementado con generadores sinteticos de notas de productividad y realismo, y se destilo a partir de un profesor bert-base-uncased con F1 de evaluacion cercano a 0,90.

Su relevancia practica esta en el nicho: frente a los LLM generativos, ofrece una extraccion de ranuras determinista, de bajisimo coste y ejecutable offline en navegador o movil, lo que encaja en aplicaciones de notas, tareas y calendario que necesitan estructurar texto libre sin enviar datos a un servidor. La contrapartida es un alcance muy acotado: solo ingles, notas cortas y sin normalizacion de fechas a estructuras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BertForTokenClassification (encoder BERT: 6 capas, hidden 256, 8 cabezas, intermedio 1024) |
| Parametros totales | ~7,6 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 posiciones maximas del modelo; entrenado con longitud maxima de secuencia 128 |
| Tipos de cuantizacion | INT8 dinamica per-channel (QInt8 con reduce_range) sobre operadores MatMul y Gather via ONNX Runtime; es el artefacto publicado (q8) |
| Idiomas soportados | ingles (en) |
| Licencia | CC BY 4.0 (modelo); modelo base bajo MIT |
| Formato de pesos | ONNX cuantizado en `onnx/model_quantized.onnx`; no se distribuye checkpoint PyTorch |
| Tarea / pipeline | token-classification (slot filling, BIO) |
| Esquema de etiquetas | `slot-labels-v0.3.0`, 9 etiquetas BIO: O, B/I-PARTICIPANT, B/I-PRIORITY, B/I-DATETIME, B/I-RECURRENCE |
| Version del modelo | 0.2.0 |
| Vocabulario | 9.567 piezas WordPiece (podado desde 30.522) |
| Runtime | Transformers.js v4, dispositivo WASM, dtype q8 |
| Tamano del bundle | 7,56 MB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT en configuracion xtremedistil, con una cabeza de clasificacion de tokens sobre las 9 etiquetas BIO. El modelo base se podo de vocabulario de 30.522 a 9.567 piezas WordPiece, conservando todas las piezas de un solo caracter y los digitos, y se verifico que el tokenizador podado emite salida identica a nivel de token en todo el conjunto de test, por lo que las metricas no cambian. El estudiante publicado se obtuvo por destilacion de conocimiento desde un profesor bert-base-uncased afinado sobre los mismos datos (F1 de evaluacion del profesor ~0,90), con una perdida combinada de 0,5·entropia cruzada con el gold y 0,5·T²·KL(profesor‖estudiante) con T=2.

Los datos de entrenamiento combinan el split en-US de MASSIVE (config `en-US`, revision `d2362678…`) filtrado a los escenarios calendar, datetime, email y lists, con las ranuras originales remapeadas al esquema local (person, relation, email_address a PARTICIPANT; date, time, time_zone a DATETIME; general_frequency a RECURRENCE), mas generadores sinteticos de notas de productividad y realismo. La aumentacion se aplico solo al split de entrenamiento (AUGMENT_FACTOR=2): prefijo aleatorio de palabras de relleno, puntuacion final y dropout ocasional de tokens O, con deduplicacion contra los originales. Hiperparametros: 10 epocas con early stopping (paciencia 2, restauracion del mejor checkpoint por F1), batch 64, tasa de aprendizaje 5e-5, schedule coseno, warmup 0,1, weight decay 0,01, label smoothing 0,05, longitud maxima 128 y semilla 42.

La innovacion tecnica destacable es la decodificacion: el repositorio incluye un `transitions.json` con una matriz de transiciones que solo impone restricciones BIO (0 para transiciones validas, penalizacion negativa grande para continuaciones I- invalidas) y que el cargador JS aplica automaticamente para una decodificacion de Viterbi restringida sobre los logits. La matriz es deliberadamente solo de restricciones: los priors empiricos de bigramas duplicaban la frecuencia de etiquetas ya presente en las emisiones y se midio una perdida de ~7 puntos de F1 de recall en el modelo cuantizado. En cuanto a la cuantizacion, se evaluo QDQ estatica (calibracion MinMax/Entropy/Percentile), que perdia de 8 a 12 puntos de F1 en este tamano, y QAT weight-only con fake-quant straight-through, que quedo por debajo de la linea base post-entrenamiento (0,823 frente a 0,828); la opcion elegida fue cuantizacion dinamica per-channel con reduce_range.

## Capacidades

- Extraccion de ranuras PARTICIPANT (nombres de personas, relaciones, direcciones de correo) en notas informales en ingles.
- Extraccion de ranuras DATETIME (fechas, horas, zonas horarias) como spans de texto, sin normalizacion a objetos de fecha.
- Deteccion de PRIORITY (marcadores de prioridad o urgencia en el texto).
- Deteccion de RECURRENCE (frecuencias del tipo "every week", "daily").
- Etiquetado BIO a nivel de token con decodificacion de Viterbi restringida por restricciones de transicion.
- Inferencia en navegador y en el cliente via Transformers.js sobre WASM, sin llamadas a servidor.
- Ejecucion offline en dispositivos sin GPU, con un bundle de 7,56 MB.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo thinking: es un extractor de spans, no un modelo generativo.
- Capacidad multilingue: no disponible (solo ingles).
- Capacidad de chat o generacion de texto libre: no disponible.

## Casos de uso

- Gestion de recordatorios en aplicaciones de notas: el modelo etiqueta en el propio dispositivo los spans de fecha, persona y prioridad de una nota como "call Sarah next Friday at 5pm, high priority, every week", y la app los presenta como campos estructurados sin enviar el texto a un servidor.
- Autocompletado de formularios de tareas: al escribir una tarea, el extractor rellena los campos de asignado (PARTICIPANT), vencimiento (DATETIME) y repeticion (RECURRENCE), reduciendo la friccion de crear tareas manualmente.
- Preprocesado para parsers de fechas: los spans DATETIME se pasan a un parser downstream como chrono-node para obtener una fecha absoluta; el modelo se limita a delimitar el span, lo que simplifica y hace mas robusto el parseo.
- Extensiones de navegador y PWA con requisito de privacidad: al ejecutarse en WASM con 7,56 MB y sin backend, encaja en extensiones y aplicaciones web progresivas que deben funcionar offline o no pueden procesar datos de usuario en servidores de terceros.
- Enrutado de intenciones en clientes de correo: detectar RECURRENCE o PRIORITY en el asunto o primeras lineas permite dirigir el mensaje a una cola de triaje o sugerir una regla de filtrado.
- Pre-anotacion en herramientas de etiquetado: generar propuestas de spans PARTICIPANT y DATETIME para que un anotador humano las corrija, acelerando la construccion de corpus de notas de productividad.
- Seudonimizacion ligera de PII en notas: los spans marcados como PARTICIPANT permiten localizar nombres y direcciones de correo antes de registrar o compartir el texto, como primera capa de un pipeline de redaccion.
- Clasificacion de urgencia en gestores de tickets internos: usar la etiqueta PRIORITY como senal auxiliar para ordenar la cola, siempre con revision humana dado el F1 mas bajo de esta clase (0,6735 en q8).

## Benchmarks y rendimiento

Metricas a nivel de token (seqeval) sobre el split de test reservado (n ≈ 559). fp32 se decodifica por argmax; q8 usa la decodificacion Viterbi restringida que se distribuye en el cargador JS. La columna q8 corresponde al artefacto realmente publicado en el repositorio. Todos los valores son declarados por el autor y no estan verificados de forma independiente (`verified: false`).

| Metrica | fp32 | q8 (publicado) |
|---|---|---|
| Accuracy | 0,9545 | 0,9444 |
| Precision | 0,8235 | 0,7925 |
| Recall | 0,8777 | 0,8662 |
| F1 (global) | 0,8498 | 0,8278 |
| F1 DATETIME | 0,8175 | 0,7925 |
| F1 PARTICIPANT | 0,9355 | 0,9331 |
| F1 PRIORITY | 0,7526 | 0,6735 |
| F1 RECURRENCE | 0,8649 | 0,8651 |

Dataset declarado: MASSIVE en-US mas datos sinteticos de productividad y realismo. No se han publicado en la informacion disponible resultados comparativos con otros modelos en este benchmark.

## Requisitos de hardware

- VRAM: no requiere VRAM dedicada; la inferencia se ejecuta en CPU mediante WebAssembly.
- Huella de almacenamiento: 7,56 MB para el bundle ONNX INT8, mas el runtime de Transformers.js.
- GPU recomendadas: ninguna; el modelo no esta pensado para aceleracion por GPU. Cualquier GPU consumer (RTX 4090, RTX 3060, etc.) es innecesaria y no aporta ventaja frente a la ejecucion en CPU.
- Cabe en GPU consumer: si, pero es irrelevante; el objetivo es CPU, incluidos portatiles y moviles.
- Opciones de despliegue: Transformers.js v4 con `dtype: "q8"` y dispositivo WASM (ruta `onnx/model_quantized.onnx`); ONNX Runtime en otros entornos si se integra el grafo manualmente. vLLM, TGI, llama.cpp y Ollama no aplican, al no tratarse de un modelo generativo.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 en extraccion de ranuras | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jottypro/notes-slots | ~7,6 M | 512 (entrenado a 128) | 0,8498 (fp32) / 0,8278 (q8) | CC BY 4.0 | ONNX INT8 en HuggingFace, via Transformers.js |
| microsoft/xtremedistil-l6-h256-uncased (base) | ~7,6 M | 512 | no disponible (no afinado para slot filling) | MIT | Pesos PyTorch en HuggingFace |
| Profesor bert-base-uncased afinado (interno) | ~110 M | 512 | ~0,90 (F1 de evaluacion segun la model card) | Apache 2.0 (modelo base) | no disponible, no publicado |

La comparacion relevante es de compromiso: el profesor ofrece en torno a 5 puntos mas de F1 pero con un orden de magnitud mas de parametros y sin artefacto ONNX cuantizado listo para navegador; el modelo base xtremedistil no resuelve la tarea sin afinado. Frente a modelos NER genericos de la familia BERT, la diferencia es de esquema (4 ranuras de productividad frente a etiquetas NER genericas) y de formato de despliegue, no de tamano. No se dispone de datos de benchmarks de terceros para una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Solo ingles: cualquier texto en otro idioma queda fuera de alcance y producira etiquetas poco fiables.
- Fuera de alcance el texto largo: el modelo esta entrenado con longitud maxima de 128 y disenado para notas cortas e informales; en documentos largos el rendimiento no esta caracterizado.
- No normaliza fechas: los spans DATETIME son cadenas de texto; se necesita un parser downstream (por ejemplo chrono-node) para obtener valores estructurados.
- Coste de la cuantizacion: el artefacto publicado pierde 2,2 puntos de F1 global frente a fp32 (0,8498 a 0,8278) y la clase PRIORITY cae de 0,7526 a 0,6735, por lo que la deteccion de prioridad es la senal menos fiable.
- Vocabulario podado a 9.567 piezas: reduce el tamano, pero puede degradar la tokenizacion de nombres propios poco frecuentes, terminos tecnicos y texto fuera de dominio.
- Riesgo de alucinacion bajo por tratarse de extraccion y no de generacion, pero persisten falsos positivos y negativos: nombres comunes pueden etiquetarse como PARTICIPANT y expresiones temporales ambiguas pueden no marcarse.
- Evaluacion limitada: el test tiene n ≈ 559 y las metricas son declaradas por el autor sin verificacion independiente, con intervalos de confianza amplios.
- Adopcion muy baja (51 descargas, 0 likes en el momento de la consulta) y modelo reciente: no hay validacion de la comunidad ni historial de casos en produccion.
- No apto para decisiones de alto riesgo: la propia model card excluye explicitamente cualquier uso de decision automatizada de alto impacto.
- Licencia CC BY 4.0: permite uso comercial incluida la modificacion, pero exige atribucion al autor y conservar el aviso de licencia; el modelo base es MIT.
- La model card esta truncada en la seccion de limitaciones en la informacion disponible, por lo que pueden existir advertencias adicionales del autor no recogidas aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jottypro/notes-slots
- Modelo base: https://huggingface.co/microsoft/xtremedistil-l6-h256-uncased
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Paper de MASSIVE (arXiv 2204.08582, referenciado en los tags del modelo): https://arxiv.org/abs/2204.08582
- La busqueda web realizada no devolvio enlaces relevantes al modelo (los resultados obtenidos no guardan relacion con la ficha); no se dispone de papers, blogs, repositorios ni demos adicionales del autor.
