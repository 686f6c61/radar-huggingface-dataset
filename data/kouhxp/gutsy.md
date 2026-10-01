# kouhxp/gutsy

## Resumen

Gutsy-0.8b v0.3 es un modelo de decisión desarrollado por el usuario kouhxp y publicado en HuggingFace. No es un modelo generativo de texto: dado un *state* (texto o JSON) y una pregunta tipada (sí/no, elección entre hasta 16 opciones por llamada, o puntuación ordinal), devuelve una probabilidad calibrada para cada opción en un único forward pass. La respuesta se lee directamente de los logits del siguiente token correspondiente a las etiquetas de opción (A-P, más una opción Z de rechazo) y se aplica softmax únicamente sobre esas letras.

El modelo parte de Qwen/Qwen3.5-0.8B (licencia Apache 2.0) mediante un fine-tune completo con embeddings congelados, y se distribuye como un GGUF Q8_0 de 775 MB pensado para llama.cpp. Se acompaña de un runtime propio, `gutsy-inference`, que añade caché de estado, shortlisting para listas de hasta 255 opciones y temperaturas de calibración ajustadas por tipo de pregunta. Su relevancia está en cubrir una tarea muy concreta —routing, triaje, moderación, comprobaciones de política, selección de herramientas en bucles de agente o juicio de salidas— donde lo que importa es una probabilidad accionable, no texto libre.

El modelo tiene 752.393.024 parámetros totales (~0,75 B) y una ventana de contexto configurada en 8.192 tokens. Está orientado exclusivamente al inglés y su uso está pensado para actuar sobre la probabilidad devuelta aplicando umbrales medidos sobre datos etiquetados propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura heredada del modelo base Qwen/Qwen3.5-0.8B; no se detalla en la informacion disponible) |
| Parametros totales | 752.393.024 (~0,75 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (`n_ctx` configurado en 8192) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q8_0); el modelo base original usa safetensors, no disponible en este repo |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (full fine-tune) del modelo base Qwen/Qwen3.5-0.8B, con los embeddings de tokens congelados, lo que deja fija también la cabeza de salida al estar ligada (tied output head). El entrenamiento se hizo con pesos maestros en fp32 y cómputo en bf16. La función de pérdida combina entropía cruzada con un término 0,5 x Brier calculado sobre las letras de opción (y la opción Z), contra etiquetas blandas cuando estaban disponibles. El calendario usa learning rate 1e-5 con decaimiento coseno y un 3 % de warm-up, 256 preguntas por paso y 1 época sobre aproximadamente 90.000 preguntas.

Como medida de robustez frente al orden, las opciones se rebarajan cada vez que un ejemplo es visto. El checkpoint elegido es el de menor pérdida en un conjunto de desarrollo reservado (paso 300, el último evaluado), y nunca se seleccionó en función de ningún benchmark. El entrenamiento se completó en una única GPU de 48 GB en unas 2 horas. Una ejecución con LoRA (rango 32) sobre los mismos datos empató exactamente con este modelo en el conjunto público de JevBench y se mantuvo a pocos puntos en el resto de evaluaciones.

Los datos de entrenamiento (recuentos aproximados) se reparten en varias porciones: ~24.300 preguntas de escenarios generados por un profesor (Qwen3.8-27B) en 41 dominios con una segunda pasada ciega, conservando solo los casos en que ambas coincidieron; ~17.400 de lectura y verificación (BoolQ, SNLI, SQuAD 2.0, HotpotQA sí/no); ~10.700 de clasificación y routing (MASSIVE, CLINC150, Civil Comments, twitter-financial-news-sentiment); ~10.300 de particiones de panel en dominio (RAGTruth train, WinoGrande train); ~8.300 sintéticas generadas por código (políticas, números y fechas, registros, rúbricas de puntuación, con etiquetas calculadas por motores de reglas); ~6.600 de elección de herramienta de agente (Jev Decisions v1); ~4.900 de juicio (HelpSteer2); ~4.100 de conocimiento (ARC, OpenBookQA, HellaSwag); y ~4.100 de documentos largos (extractos de contratos CUAD). Aproximadamente el 8 % de los ítems de elección elegibles son ítems de rechazo (la opción correcta se elimina y el objetivo es Z) y alrededor del 30 % de las preguntas de elección usan claves numéricas cortas. El autor declara que no se usó ninguna salida de modelos cerrados en ningún punto y que los datos se descontaminaron contra el panel de evaluación y los ítems públicos de JevBench (secuencias compartidas de 13 palabras).

## Capacidades

- Decisión binaria (sí/no): devuelve una probabilidad calibrada para cada una de las dos respuestas desde un único forward pass.
- Elección entre opciones: selección entre hasta 16 opciones por llamada, etiquetadas de A a P, más la opción Z ("ninguna opción encaja, o el estado no lo dice").
- Puntuación ordinal: devuelve una puntuación ordenada sobre las opciones.
- Opción de rechazo: soporta ítems en los que la respuesta correcta no está entre las opciones (objetivo Z); el runtime debe usar `reject_slot` activado.
- Calibración probabilística: probabilidades acompañadas de temperaturas ajustadas por tipo de pregunta (elección 1,01; sí/no 0,86; puntuación 1,00), ajustadas sobre datos de validación reservados con etiquetas exactas.
- Estado como entrada: acepta el estado como texto o JSON.
- Caché de estado y shortlisting: el runtime `gutsy-inference` añade caché de estado y shortlisting para listas de hasta 255 opciones.
- Selección de herramienta en bucles de agente: entrenado explícitamente para elegir herramientas (porción de datos Jev Decisions v1).
- Juicio de salidas y comprobaciones de grounding: evaluación de respuestas y verificación de fundamentación.
- Multilingüe: no; entrenado y evaluado únicamente en inglés.

## Casos de uso

- Routing de peticiones: dada una petición en texto o JSON, decidir a qué cola, equipo o categoría debe dirigirse, usando las probabilidades con un umbral medido sobre datos propios.
- Triaje de soporte: clasificar tickets por urgencia o tipo y enrutar los casos de baja confianza a revisión humana, apoyándose en la calibración del modelo.
- Moderación de contenido: con etiquetas blandas de Civil Comments en el entrenamiento, devolver la probabilidad de que un contenido sea tóxico y actuar sobre el umbral elegido.
- Comprobación de políticas: verificar si un estado (por ejemplo, una acción propuesta) cumple una política dada, en formato de pregunta sí/no, con decisión accionable sobre la probabilidad.
- Selección de herramienta en bucles de agente: dado el estado de la conversación y una lista de herramientas disponibles, devolver la probabilidad de cada herramienta y elegir la más probable, gracias a su entrenamiento específico y al shortlisting para listas grandes.
- Juicio automático de salidas: puntuar la calidad de una respuesta generada (entrenado con HelpSteer2 y evaluado en JudgeBench), útil como evaluador en pipelines de LLM y control de calidad.
- Comprobación de grounding: verificar si una afirmación está respaldada por el estado proporcionado, apoyándose en los datos de RAGTruth y del panel en dominio.
- Clasificación de intención en escala amplia: con la evaluación zero-shot en BANKING77 con las 77 intenciones, asignar intenciones a consultas; el shortlisting permite manejar listas de 20 a 254 opciones con alta precisión reportada.

## Benchmarks y rendimiento

Todos los resultados son autoinformados por el autor. Las cifras de otros sistemas provienen de sus respectivos autores, potencialmente con versiones de harness y muestras distintas, por lo que las comparaciones son indicativas.

Conjunto público de JevBench (231 ítems):

| Metrica | Valor |
|---|---|
| Exactitud global (167/231) | 0,723 |
| Tier facil | 47/48 |
| Tier original | 61/72 |
| Tier dificil | 59/111 |
| Error de calibracion (facil) | 0,023 |
| Error de calibracion (original) | 0,122 |
| Error de calibracion (dificil) | 0,078 |
| MAE ordinal (original) | 0,30 |
| MAE ordinal (dificil) | 0,59 |
| Acuerdo ante parafrasis (tier original) | 0,81 |

Comparacion en el mismo conjunto publico (231 items) reportada por terceros:

| Sistema | Exactitud |
|---|---|
| decision-4b | 0,883 |
| Jev | 0,866 |
| gutsy-0.8b v0.3 | 0,723 |
| Neriv 0.6B | 0,636 |
| XERON-0.4 | 0,558 |
| tuned Laya | 0,537 |

Mismos items medidos en paralelo (700 items de evaluacion cada uno):

| Benchmark | gutsy-0.8b v0.3 | Jev |
|---|---|---|
| BoolQ | 0,850 | 0,906 |
| SNLI | 0,879 | 0,883 |
| CommonsenseQA | 0,587 | 0,863 (nunca entrenado en este modelo tampoco) |

Panel de evaluacion (700 items; JudgeBench 245):

| Benchmark | Valor |
|---|---|
| BBH | 0,464 |
| Financial PhraseBank | 0,921 |
| JudgeBench | 0,596 |
| RAGTruth (en dominio) | 0,790 |
| WinoGrande (en dominio) | 0,657 |

Routing:

| Tarea | Valor |
|---|---|
| BANKING77, 77 intenciones, zero-shot | 0,609 |
| Listas de 20 a 254 opciones | 0,999 |

Calibracion: el autor reporta un error de calibracion de validación de 0,021 antes del temperature scaling; el resto de la frase queda cortada en la información proporcionada, por lo que no se reproduce aquí.

## Requisitos de hardware

- Tamaño del modelo: 752.393.024 parámetros. El fichero GGUF Q8_0 pesa 775 MB y el repo completo ocupa 0,8 GB.
- VRAM estimada para inferencia: el fichero Q8_0 de 775 MB implica un uso de VRAM en el rango de aproximadamente 1-2 GB, incluyendo overhead del runtime y caché KV para 8.192 tokens (estimación orientativa; no confirmada en la información proporcionada).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre debería ser suficiente para Q8_0 según el tamaño del fichero (dato orientativo). El entrenamiento se realizó en una única GPU de 48 GB (por ejemplo A6000, A40, L40), pero la inferencia no requiere ese perfil.
- Cabe en GPU de consumo: sí, previsiblemente en prácticamente cualquier GPU de consumo moderna (GTX 10xx en adelante, RTX 3060/4060 y superiores) dado el tamaño del GGUF; también es viable en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (a través de llama-cpp-python >= 0.3.35) y el runtime `gutsy-inference` incluido en el repositorio, que expone un servidor (`gutsy-inference serve`) con caché de estado, shortlisting y temperaturas calibradas. No se menciona soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Modelos de decisión comparables (según las cifras del conjunto público de JevBench reportadas por terceros):

| Modelo | Contexto | JevBench publico | Licencia | Disponibilidad |
|---|---|---|---|---|
| gutsy-0.8b v0.3 | 8.192 | 0,723 | Apache 2.0 | GGUF en HuggingFace (kouhxp/gutsy) |
| decision-4b | no disponible | 0,883 | no disponible | no disponible |
| Jev | no disponible | 0,866 | no disponible | no disponible |
| Neriv 0.6B | no disponible | 0,636 | no disponible | no disponible |
| XERON-0.4 | no disponible | 0,558 | no disponible | no disponible |
| tuned Laya | no disponible | 0,537 | no disponible | no disponible |

No se dispone de los hiperparámetros, contexto, licencia ni enlaces de los modelos comparables, por lo que la comparación se limita a la exactitud reportada en JevBench y a la disponibilidad conocida del modelo descrito.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre opciones. No debe usarse como modelo conversacional ni generativo, pese a incluir la etiqueta "conversational".
- Fuera de alcance o poco fiable según el autor: aritmética de fechas y números (debe calcularse en código primero), aplicación de nuevos reglamentos de reglas multi-paso, decidir si una ambigüedad es determinante, preguntas de conocimiento del mundo e input en idiomas distintos del inglés.
- Idiomas: entrenado y evaluado únicamente en inglés; las entradas en otros idiomas no son fiables.
- Riesgo de alucinación: al ser un modelo de decisión, el riesgo se manifiesta como probabilidades mal calibradas fuera de la distribución de entrenamiento; conviene establecer umbrales sobre datos etiquetados propios y derivar los casos de baja confianza y alto riesgo a revisión humana.
- Sesgos: no se documentan análisis de sesgo específicos. La porción de moderación usa etiquetas blandas de Civil Comments (CC0), lo que puede introducir sesgos propios de ese conjunto.
- Contexto: la ventana configurada es de 8.192 tokens; no se detalla cómo se comporta con entradas que se acerquen a ese límite.
- Formato de prompt estricto: el formato debe coincidir exactamente (ChatML de Qwen con thinking desactivado), con el estado, la pregunta, las opciones etiquetadas de A a P y la línea Z para preguntas de elección y puntuación. El runtime lo construye automáticamente.
- Configuración obligatoria: `reject_slot` debe estar activado para este modelo en `models.json`.
- Evaluaciones autoinformadas: todos los resultados son self-run; las cifras de los sistemas comparados provienen de sus autores con posibles diferencias de harness y muestra.
- Licencia: Apache 2.0, permite uso comercial. Algunos conjuntos de datos derivan de términos upstream (por ejemplo Jev Decisions v1 se deriva de datasets de NVIDIA, con términos upstream aplicables), por lo que conviene revisar esas condiciones si se redistribuye.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kouhxp/gutsy
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Runtime gutsy-inference: incluido en el repositorio del modelo (`gutsy/gutsy-inference`)
- Papers, blogs, repos y demos adicionales: no disponible
