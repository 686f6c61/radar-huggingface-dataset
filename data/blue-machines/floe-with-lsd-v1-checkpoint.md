# blue-machines/FLOE-with-LSD-v1-checkpoint

## Resumen

FLOE-with-LSD-v1-checkpoint es un checkpoint de PyTorch publicado por blue-machines a partir del cual se exportó el modelo `blue-machines/Flow-with-LSD-v1`. No es un modelo generativo de propósito general: se trata de un modelo de clasificación de tokens construido sobre `google/gemma-3-270m` con tres cabezas superpuestas (identificación de idioma o LID, detección de cambio de idioma o LSD, e intención). El checkpoint se distribuye principalmente para poder continuar el ajuste fino desde la actualización 40, que es el mejor punto de control reportado por el autor.

El interés técnico está en su naturaleza multitarea y multilingüe: cubre inglés y nueve lenguas índicas (hindi, bengalí, guyaratí, canarés, malayálam, maratí, oriya, tamil y telugú), y resuelve dos tareas complementarias, la identificación del idioma de cada token y la detección del punto exacto en el que se produce un cambio de idioma dentro de una secuencia. La cabeza de intención (7 clases) sigue presente en los pesos safetensors, pero se elimina en la exportación a ONNX.

Con 290.245.085 parámetros totales (unos 290 M), una arquitectura Gemma 3 de 18 capas y dimensión oculta 640, y un repositorio de 1,2 GB, es un modelo pequeño y desplegable en hardware modesto, lo que lo hace útil como componente de preprocesado en pipelines multilingües de voz o texto donde el "code-switching" es habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer decoder, `Gemma3LidLsdIntent`), 18 capas, hidden 640 |
| Parametros totales | 290.245.085 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 3 270M soporta 32k, pero el autor no documenta la ventana usada en este ajuste) |
| Tipos de cuantizacion | INT8 documentado para la exportacion ONNX (cabezas LID en INT8, LSD en FP32); pesos safetensors en el formato original del checkpoint |
| Idiomas soportados | en, hi, bn, gu, kn, ml, mr, or, ta, te (10 idiomas) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (checkpoint PyTorch); existe una build ONNX INT8 en el Hub |
| Modelo base | google/gemma-3-270m |
| Cabezas | LID (10 clases), language switch (10 idiomas + `no_switch`), intent (7 clases, no incluida en ONNX) |
| Tarea (`pipeline_tag`) | text-classification |
| Tamano del repositorio | 1,2 GB |
| Actualizacion optima | update 40 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder Gemma 3 de 270 M de parametros (18 capas, hidden 640) al que se le anaden cabezas de clasificacion a nivel de token: una cabeza LID de 10 clases, una cabeza de deteccion de cambio de idioma de 11 clases (los 10 idiomas mas la etiqueta `no_switch`) y una cabeza de intencion de 7 clases. La clase de implementacion se denomina `Gemma3LidLsdIntent`, definida en el codigo de entrenamiento del autor y no registrada en `transformers`, por lo que `AutoModel` no puede instanciarla.

El orden de entrenamiento de esta revision es en dos fases. Primero se ajusta la cabeza LSD sobre datos entre idiomas, un conjunto de usuario de 10.000 ejemplos y una mezcla amplia de casos `no_switch`. Despues se hace un ajuste de recuperacion de la cabeza LID durante 0,5 epocas con la cabeza LSD congelada, usando `lid_finetune_subset` (fase 2) y `token_lid_stage3` (fase 3). El checkpoint padre directo es el ajuste fino de la cabeza LSD `joint_seq_lsd_crosslang_10k_ft`. No se documentan el numero total de tokens de entrenamiento ni la composicion detallada del dataset, ni si hubo RLHF/DPO (no aplica a un clasificador de tokens).

La exportacion ONNX del Hub es una build INT8 desplegable que conserva unicamente `logits_lid` y `logits_switch`; la salida `intent_logits` se elimina en el momento de la exportacion.

## Capacidades

- Identificacion de idioma (LID) a nivel de token o de secuencia para 10 idiomas: ingles, hindi, bengali, guyarati, canares, malayalam, marati, oriya, tamil y telugu.
- Deteccion de cambio de idioma (LSD): localiza el punto de transicion entre idiomas dentro de una misma secuencia, con la etiqueta adicional `no_switch` cuando no hay cambio.
- Clasificacion de intencion en 7 clases, disponible en los pesos safetensors pero no en la exportacion ONNX.
- Procesamiento multilingue con mezcla de idiomas en un mismo texto (code-switching), escenario tipico en habla espontanea de hablantes bilingues.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni function calling, ni razonamiento multi-paso, ni agentes.
- No tiene modo "thinking", ni capacidades de vision ni de audio.
- Carga mediante `safetensors.torch.load_file` y la clase personalizada del autor; no compatible con `AutoModel.from_pretrained` directamente.

## Casos de uso

- Preprocesado de ASR multilingue: tras una transcripcion automatica, el modelo etiqueta cada token con su idioma para que el pipeline posterior aplique el modelo de lenguaje o el normalizador adecuado a cada fragmento, algo critico en habla con code-switching hindi-ingles.
- Segmentacion de conversaciones bilingues: usar la cabeza LSD para dividir un turno de habla en tramos monolingues y enrutarlos a traductores o correctores especificos de cada idioma.
- Enrutado de consultas en atencion al cliente: detectar el idioma de la consulta entrante (incluidas mezclas) y derivarla al agente o al modelo de respuesta correcto.
- Analisis de corpus y linguistica de contacto: estudiar la frecuencia y la posicion de los cambios de idioma en un corpus de habla para investigacion sociolinguistica, aprovechando las metricas de 99,44 % en LID y 97,02 % en LSD reportadas por el autor.
- Moderacion y filtrado de contenido multilingue: clasificar el idioma de cada mensaje para aplicar las politicas y listas de bloqueo correspondientes a cada comunidad linguistica, en particular en el mercado indico.
- Clasificacion de intenciones en asistentes de voz: la cabeza de intencion (7 clases) permite etiquetar la intencion del usuario en el mismo paso en que se detecta el idioma, reduciendo el numero de modelos en el pipeline.
- Generacion de datos etiquetados: usar el modelo como anotador automatico de idioma e intencion para preetiquetar grandes volumenes de texto antes de una revision humana.
- Deteccion de mezcla de idiomas como senal de calidad: en sistemas de subtitulado o doblaje, marcar automaticamente los tramos que requieren tratamiento bilingue.

## Benchmarks y rendimiento

Metricas de puerta reportadas por el autor en la actualizacion 40:

| Tarea | Conjunto | Precision |
|---|---|---|
| LID | lid_finetune_subset (n = 29.629) | 99,44 % |
| LSD | lsd_evaluation (n = 10.048) | 97,02 % |
| LSD | cross-language holdout (n = 8.000) | 94,09 % |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a esta tarea) en la informacion disponible. Tampoco hay latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 290 M de parametros: en FP32 alrededor de 1,2 GB; en FP16/BF16 alrededor de 0,6 GB; en INT8 alrededor de 0,3 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequenos.
- GPU de centro de datos (A100, H100) innecesarias salvo para procesamiento masivo por lotes; el cuello de botella seria el tokenizador y el preprocesado, no el modelo.
- El repositorio incluye una build ONNX INT8 orientada a despliegue de las cabezas LID y LSD, que es la via recomendada para produccion.
- El modelo esta etiquetado con `text-embeddings-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con Hugging Face TEI y con Inference Endpoints, aunque el autor no documenta la integracion.
- No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI; la clase `Gemma3LidLsdIntent` es personalizada y requiere cargar los pesos con `safetensors`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

En la informacion disponible no se incluyen resultados de benchmarks de terceros ni comparativas publicadas por el autor, por lo que no es posible establecer una comparacion cuantitativa fiable. A continuacion se comparan unicamente caracteristicas estructurales conocidas.

| Modelo | Parametros | Tarea | Idiomas | Licencia |
|---|---|---|---|---|
| FLOE-with-LSD-v1-checkpoint | 290 M | LID + LSD + intencion a nivel de token | 10 (en + 9 indicos) | Gemma |
| google/gemma-3-270m | 270 M | Modelo de lenguaje generativo | Multilingue (segun tokenizador Gemma 3) | Gemma |
| Clasificadores LID clasicos (fastText `lid.176`, GlotLID, CLD3) | No disponible | Identificacion de idioma de documento | Cobertura amplia (decenas o cientos de idiomas) | No disponible |

La diferencia funcional relevante es que este checkpoint no solo identifica el idioma, sino que localiza el cambio de idioma a nivel de token y anade una cabeza de intencion, capacidades que los clasificadores LID clasicos no ofrecen. A cambio, su cobertura linguistica se limita a 10 idiomas.

## Limitaciones y advertencias

- No es un modelo de generacion de texto: no puede usarse para chat, resumen, traduccion ni generacion de codigo.
- La clase `Gemma3LidLsdIntent` no esta registrada en `transformers`; `AutoModel.from_pretrained` falla y hay que cargar la clase desde el codigo de entrenamiento del autor o definirla manualmente. Esto complica la integracion y el mantenimiento.
- La cabeza de intencion no esta incluida en la exportacion ONNX, por lo que en despliegue ONNX solo se dispone de LID y LSD.
- Cobertura linguistica limitada a 10 idiomas; cualquier texto en otra lengua quedara forzosamente asignado a una de las 10 clases, con el riesgo de etiquetado incorrecto.
- El conjunto de datos de entrenamiento no esta documentado publicamente en detalle (composicion, procedencia, licencias de los datos), lo que dificulta la auditoria y la evaluacion de sesgos.
- Las metricas reportadas son internas del autor y pueden estar sesgadas hacia la distribucion de sus propios conjuntos (LID medida sobre `lid_finetune_subset`, que forma parte del entrenamiento de la fase LID). La caida de 97,02 % a 94,09 % en el holdout entre idiomas sugiere degradacion en dominios no vistos.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos y negativos en la deteccion de cambios, especialmente en secuencias con prestamos lexicos o nombres propios.
- Licencia Gemma: el uso comercial esta permitido bajo los terminos de uso de Gemma, que imponen obligaciones de atribucion y una politica de uso prohibido; conviene revisar los terminos completos antes de integrarlo en un producto.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, con creacion y ultima actualizacion el mismo dia; se trata de una publicacion muy reciente y sin validacion externa conocida.
- No hay informacion sobre la ventana de contexto efectiva en este ajuste ni sobre el comportamiento con secuencias largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blue-machines/FLOE-with-LSD-v1-checkpoint
- Modelo exportado ONNX: https://huggingface.co/blue-machines/Flow-with-LSD-v1
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Codigo de entrenamiento (`joint_lid_lsd_intent_model`): no disponible
- Paper o blog tecnico: no disponible
- Demo: no disponible
