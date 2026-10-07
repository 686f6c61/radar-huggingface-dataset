# lenabarretta/sharada-multilingual-base

## Resumen

Sharada multilingual base es un encoder de decisión tipada desarrollado por lenabarretta. No es un modelo generativo: recibe un texto, una pregunta y una lista de opciones, y devuelve una probabilidad por opción en un único forward pass, sin decodificación ni parseo posterior. Está construido sobre el encoder jhu-clsp/mmBERT-base, con 308 122 369 parámetros (unos 308 M) y un pipeline declarado de zero-shot-classification. Su propósito es actuar como clasificador y enrutador de bajo coste donde las etiquetas forman parte de la entrada y no de los pesos, de modo que un conjunto de etiquetas nunca visto en entrenamiento sigue recibiendo respuesta.

El modelo está pensado para fine-tuning ligero sobre unos cientos de ejemplos propios etiquetados, mediante el método `model.fit(examples)` de la librería `sharada`, que reserva un 20 % de retención, aplica early stopping y ajusta una temperatura por tarea para calibrar las probabilidades resultantes. Tres propiedades se sostienen por construcción y no por entrenamiento: el orden de las opciones no altera la respuesta, la puntuación de una opción no depende de qué otras opciones se ofrezcan y el texto se lee una sola vez independientemente del número de preguntas que se le hagan.

Su relevancia actual es la de un componente barato y calibrado para etapas de enrutado, triaje y clasificación previas a un LLM mayor. Se entrenó con 663 357 ejemplos procedentes de 35 conjuntos de etiquetas públicos y se midió sobre retenciones, con una latencia declarada de 23,1 ms por pregunta. La model card está truncada y no documenta la lista de idiomas soportados, aunque el pipeline y los conjuntos multilingües empleados apuntan a cobertura multilingüe.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (base: jhu-clsp/mmBERT-base, familia ModernBERT); no es MoE ni SSM |
| Parametros totales | 308 122 369 (308 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 256 tokens de texto, más 48 tokens para la pregunta y 12 tokens por opción |
| Tipos de cuantizacion | no disponible; el autor indica que float16 en disco es un formato de almacenamiento, no cuantización. No se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (la model card no lista idiomas; el nombre y los conjuntos multilingües sugieren cobertura multilingüe, sin confirmar) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (float16 en disco, float32 en memoria) |

Otros datos: tamaño del repositorio 3,1 GB; librería `sharada`; tipos de pregunta soportados `choice` (etiquetas sin orden), `scale` (pasos ordenados) y `binary` (sí o no); salida de una probabilidad por opción.

## Arquitectura y entrenamiento

La arquitectura es un encoder de la familia ModernBERT heredado de jhu-clsp/mmBERT-base, con 308 M de parámetros. Sobre ese encoder, el autor añade una cabecera de decisión que construye ramas separadas por opción: cada rama arranca en el mismo identificador de posición, lo que garantiza la invariancia al orden de las opciones, y cada opción lee el texto, la pregunta y su propio contenido, lo que garantiza que su puntuación no depende del resto de opciones ofrecidas. El texto se codifica una sola vez y se reutiliza para todas las preguntas, de modo que el coste marginal de añadir preguntas sobre el mismo texto es bajo. La salida es una distribución de probabilidad sobre las opciones en un único forward pass, sin generación de tokens.

El entrenamiento usó 663 357 ejemplos procedentes de 35 conjuntos de etiquetas públicos (intenciones, temas, puntuaciones de reseñas, emoción, toxicidad, spam y entailment), durante 15 000 pasos con batch de 32, optimizador AdamW, learning rate 3e-05, schedule coseno y pérdida de entropía cruzada. Los pesos publicados corresponden al mejor resultado medido sobre datos retenidos, en el paso 15 000 de 15 000; más allá de ese punto, según el autor, el modelo no responde mejor y solo incrementa su certeza. Siete conjuntos de etiquetas se mantuvieron completamente fuera del entrenamiento y solo se midieron: arxiv-category, claim-veracity, massive-scenario, medical-pair, poem-tone, subjective y topic-unseen-languages. Durante el entrenamiento se barajaron las opciones, se mostraron con frecuencia subconjuntos muestreados de conjuntos de etiquetas largos y cada conjunto se preguntó con varias formulaciones distintas, con el objetivo de que el modelo lea opciones y pregunta en lugar de sus posiciones. Como parte del pipeline de ajuste se ajusta una temperatura por conjunto de etiquetas sobre los mismos ejemplos retenidos usados para medir.

## Capacidades

- Clasificación zero-shot y con pocos ejemplos: admite conjuntos de etiquetas nunca vistos en entrenamiento, porque las opciones se pasan en la entrada.
- Decisión tipada con tres modalidades: `choice` (etiquetas no ordenadas), `scale` (escalas ordenadas, por ejemplo estrellas de reseña) y `binary` (sí/no).
- Salida probabilística por opción en un único forward pass, con confianza declarada y vector completo de probabilidades.
- Calibración explícita: el flujo de ajuste incorpora una temperatura por tarea y la model card reporta ECE sobre 15 bandas.
- Invariancia al orden de las opciones y puntuaciones independientes entre opciones, verificadas por los tests del repositorio incluso sobre un modelo sin entrenar.
- Reutilización del texto: una sola lectura del documento sirve para responder varias preguntas distintas.
- Cobertura funcional demostrada sobre intenciones (clinc 151 clases, banking 77, massive 59), temas, emoción, sentimiento, toxicidad, spam y entailment.
- Capacidad multilingüe indicada por el nombre del modelo y por la presencia de conjuntos multilingües, aunque la lista exacta de idiomas no está documentada.
- No soporta generación de texto, tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un agente.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Enrutado de tickets de soporte: recibir el texto del cliente, preguntar "¿qué equipo debe gestionarlo?" y ofrecer las colas disponibles como opciones. La latencia de 23,1 ms por pregunta permite enrutar en línea sin bloquear la conversación, y la probabilidad devuelta permite derivar a revisión humana los casos de baja confianza.
- Router previo a un LLM mayor: usar el modelo como primera etapa que decide si una consulta va a un modelo grande, a una base de conocimiento o a una plantilla. Al ser un encoder de 308 M, el coste por consulta es una fracción del de un LLM generativo.
- Moderación de contenido y antispam: las filas `spam` (0,992 de accuracy, ECE 0,005) y las tareas de toxicidad incluidas en el entrenamiento lo sitúan como filtro binario rápido en pipelines de ingesta.
- Análisis de sentimiento y puntuación de reseñas: los conjuntos `scale` permiten mapear textos a escalas ordenadas de estrellas o tono, útil para paneles de producto y alertas de reputación.
- Anotación asistida y preetiquetado: usar el modelo para proponer etiquetas sobre grandes volúmenes de texto y reservar el trabajo humano para los casos con probabilidad intermedia, reduciendo el coste de creación de datasets.
- Verificación de afirmaciones y entailment: las tareas `entailment`, `entailment-short` y `entailment-multi` permiten comprobar si un texto respalda una afirmación, como paso de filtrado en sistemas de respuesta con recuperación.
- Triaje multilingüe en atención al cliente: con conjuntos como `massive-intent-multi` (35 clases, 0,849 de accuracy sobre 1 440 ejemplos retenidos), encaja en despliegues con usuarios en varios idiomas, siempre que se valide el idioma concreto con datos propios.
- Clasificación de documentos internos por tema o sección: `newsgroup` y `news-section` sirven como base para categorizar documentación, correos o incidencias, siempre que el texto quepa en los 256 tokens admitidos.
- Despliegue en CPU o en hardware modesto: al ser un encoder de 308 M, es viable como servicio de clasificación junto a la aplicación, sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre ejemplos retenidos, ofreciendo **todas las etiquetas a la vez** (por ejemplo, las 151 intenciones de clinc). Se ajustó una temperatura por conjunto de etiquetas sobre los mismos ejemplos retenidos. ECE es el error de calibración esperado sobre 15 bandas iguales. Las filas marcadas como no vistas en la información disponible se enumeran en el texto sin cifras.

| Conjunto de etiquetas | Opciones | Tipo | Entrenado con | Medido sobre | Accuracy | Log loss | ECE | T |
|---|---|---|---|---|---|---|---|---|
| clinc-intent | 151 | choice | 24 000 | 480 | 0,883 | 0,417 | 0,035 | 0,891 |
| banking-intent | 77 | choice | 19 986 | 480 | 0,854 | 0,494 | 0,034 | 1,0 |
| massive-intent | 59 | choice | 23 028 | 480 | 0,875 | 0,447 | 0,047 | 1,26 |
| question-type-fine | 50 | choice | 10 904 | 240 | 0,900 | 0,287 | 0,059 | 1,122 |
| massive-intent-multi | 35 | choice | 72 000 | 1 440 | 0,849 | 0,535 | 0,032 | 1,414 |
| fine-emotion | 28 | choice | 18 000 | 360 | 0,581 | 1,319 | 0,051 | 1,122 |
| newsgroup | 20 | choice | 14 592 | 292 | 0,685 | 0,930 | 0,078 | 1,189 |
| entity-type | 14 | choice | 18 000 | 360 | 0,997 | 0,004 | 0,003 | 0,375 |
| forum-topic | 10 | choice | 18 000 | 360 | 0,769 | 0,706 | 0,042 | 0,891 |
| topic-multi | 7 | choice | 30 398 | 660 | 0,815 | 0,596 | 0,044 | 2,119 |
| question-type | 6 | choice | 10 904 | 240 | 0,975 | 0,084 | 0,016 | 1,26 |
| emotion | 6 | choice | 15 000 | 300 | 0,913 | 0,256 | 0,025 | 1,414 |
| app-stars | 5 | scale | 15 000 | 300 | 0,677 | 0,867 | 0,047 | 1,059 |
| review-stars | 5 | scale | 24 000 | 480 | 0,650 | 0,752 | 0,045 | 0,944 |
| sentence-tone | 5 | scale | 15 000 | 300 | 0,570 | 0,998 | 0,083 | 1,26 |
| news-section | 4 | choice | 18 000 | 360 | 0,933 | 0,169 | 0,017 | 0,944 |
| tweet-emotion | 4 | choice | 6 514 | 240 | 0,817 | 0,432 | 0,057 | 1,059 |
| entailment-short | 3 | scale | 18 000 | 360 | 0,875 | 0,342 | 0,045 | 0,944 |
| entailment | 3 | scale | 24 000 | 480 | 0,815 | 0,491 | 0,027 | 1,189 |
| entailment-multi | 3 | scale | 71 968 | 1 428 | 0,764 | 0,562 | 0,027 | 1,26 |
| tweet-sentiment | 3 | scale | 15 000 | 300 | 0,680 | 0,699 | 0,053 | 1,26 |
| spam | 2 | binary | 10 034 | 240 | 0,992 | 0,024 | 0,005 | 1,059 |
| product-tone | 2 | scale | 15 000 | 300 | 0,947 | 0,126 | no disponible | no disponible |

La model card está truncada en la fila `product-tone`, por lo que los valores de ECE y T de esa fila no aparecen en la información disponible. Tampoco se incluyen cifras para los siete conjuntos retenidos íntegramente (arxiv-category, claim-veracity, massive-scenario, medical-pair, poem-tone, subjective, topic-unseen-languages). Además, la latencia declarada es de 23,1 ms por pregunta, medida en hardware no especificado.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 0,62 GB en float16 y unos 1,23 GB en float32, calculados a partir de los 308 M de parámetros. Hay que sumar activaciones, que crecen con el número de opciones ofrecidas simultáneamente y con la longitud del texto (hasta 256 tokens más 48 de pregunta).
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en float16. En CPU también es viable dado el tamaño y la latencia declarada.
- GPU de centro de datos (A100, H100, L40S) solo tienen sentido si se busca agregar mucho throughput por batch o servir la pieza junto a otros modelos.
- Opciones de despliegue: la librería propia `sharada` (`pip install sharada`) con `DecisionModel.from_pretrained`; al ser un encoder clasificador es exportable a formatos estándar de transformers y compatible con servidores de inferencia como TGI, vLLM (modo embedding/clasificación), TorchServe o exportación a ONNX. llama.cpp y Ollama no son el objetivo natural, ya que no se publican pesos GGUF y el modelo no genera texto.
- Latencia declarada: 23,1 ms por decisión. Como referencia derivada, equivale a unas 43 decisiones por segundo en un único flujo; el rendimiento agregado depende del batch, del número de opciones y del hardware, que no se especifica.
- El coste marginal de añadir una segunda pregunta sobre el mismo texto es bajo, porque el texto se codifica una sola vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sharada-multilingual-base | 308 M | 256 tokens de texto + 48 de pregunta + 12 por opción | Decisión tipada zero-shot y clasificación calibrada | apache-2.0 | HuggingFace y librería `sharada` |
| jhu-clsp/mmBERT-base | no disponible en la información proporcionada | no disponible | Encoder multilingüe de propósito general (modelo base) | no disponible | HuggingFace |
| XLM-RoBERTa-base | 278 M | 512 tokens | Encoder multilingüe para clasificación y NER con fine-tuning | MIT | HuggingFace |
| mDeBERTa-v3-base | 278 M | 512 tokens | Encoder multilingüe para clasificación con fine-tuning | MIT | HuggingFace |

Los datos de las tres alternativas no proceden de la información proporcionada y conviene verificarlos antes de citarlos. La diferencia funcional clave frente a XLM-RoBERTa y mDeBERTa-v3 es que estos exigen una cabeza de clasificación reentrenada por conjunto de etiquetas fijo, mientras que sharada recibe las opciones en la entrada y devuelve una probabilidad por opción sin reentrenar. A cambio, su ventana de texto es más corta (256 tokens frente a 512) y su rango de accuracy es muy desigual según la tarea, con valores de 0,997 en `entity-type` y de 0,570 en `sentence-tone`. No se dispone de una comparación directa publicada entre sharada y estas alternativas bajo el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Ventana de texto corta: 256 tokens para el documento, 48 para la pregunta y 12 por opción. Documentos largos requieren truncado, troceado o un modelo distinto.
- No es un modelo generativo: no produce explicaciones ni texto, solo probabilidades. Cualquier justificación de la decisión debe construirse fuera del modelo.
- Precisión muy dependiente de la tarea: `fine-emotion` (0,581), `sentence-tone` (0,570), `review-stars` (0,650) y `tweet-sentiment` (0,680) están muy por debajo de `entity-type` (0,997) o `spam` (0,992). Las tareas subjetivas o de matiz fino son su punto débil.
- Los conjuntos de evaluación son pequeños (entre 240 y 1 440 ejemplos): una sola respuesta distinta puede mover un punto porcentual, según advierte el propio autor.
- La calibración mostrada depende de una temperatura ajustada por conjunto de etiquetas sobre los mismos datos retenidos. En un conjunto nuevo, sin ese ajuste, las probabilidades pueden estar peor calibradas y el ECE reportado no es extrapolable.
- Aunque el nombre indica multilingüe, la model card no lista idiomas soportados ni cifras por idioma; hay que validar el idioma objetivo con datos propios antes de desplegar.
- El entrenamiento se detuvo en el paso 15 000 porque a partir de ahí el modelo "solo crece en certeza" sin mejorar en acierto. Esto implica que en dominios alejados de los 35 conjuntos de entrenamiento puede mostrar confianza alta con acierto bajo.
- Sesgos: no se documenta ningún análisis de sesgos demográficos, de género, de raza ni de dialecto. Los conjuntos de origen (intenciones, reseñas, toxicidad, spam) arrastran los sesgos de anotación de sus fuentes.
- Riesgo de uso indebido: al ser un clasificador barato y rápido, es tentador usarlo como filtro automático sin revisión humana en decisiones sensibles (moderación, crédito, triaje médico). El ECE bajo no equivale a ausencia de error.
- Licencia apache-2.0 para este modelo, lo que permite uso comercial. No obstante, el modelo base jhu-clsp/mmBERT-base tiene su propia licencia, no detallada en la información proporcionada, y conviene verificarla.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, con lo que no hay evidencia de uso en producción ni informes de terceros.
- La model card está truncada en la información disponible, por lo que pueden faltar secciones relevantes (idiomas, limitaciones declaradas por el autor, detalles de la licencia del base).
- Dependencia de la librería `sharada`, propia del autor y no estándar, para cargar el modelo y ejecutar el flujo de ajuste; usar transformers directamente requiere reproducir la cabecera de decisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lenabarretta/sharada-multilingual-base
- Código, ejemplos y ejecución de entrenamiento: https://github.com/LenaBarretta/sharada
- Diseño y experimentos: https://lenatriestounderstand.com/notes/llm/024-rlcr/
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los resultados obtenidos no guardaban relación con la ficha y se han descartado.
