# dleemiller/finecat-nli-v2-xs

## Resumen

finecat-nli-v2-xs es un cross-encoder de inferencia de lenguaje natural (NLI) desarrollado por dleemiller, construido sobre el encoder jhu-clsp/ettin-encoder-32m (familia ModernBERT) y afinado para clasificar la relacion logica entre un texto (premisa) y una afirmacion (hipotesis) en tres clases: implicacion, contradiccion y neutralidad. Con solo 32 millones de parametros, el modelo devuelve probabilidades calibradas que permiten reutilizar una unica tarea (NLI) como herramienta polivalente para enrutamiento, clasificacion zero-shot, deteccion de alucinaciones y verificacion de hechos en pipelines RAG.

El modelo se distribuye bajo licencia Apache-2.0, soporta documentos de hasta 8000 tokens y, segun el autor, alcanza un rendimiento de aproximadamente 14 500 pares por segundo, lo que lo situa en la categoria de modelos extremadamente ligeros y aptos para despliegue en CPU o GPU de consumo. Su relevancia actual radica en la combinacion de tamano minimo, contexto largo y probabilidades calibradas, caracteristicas poco habituales en encoders de este tamano.

La version v2 incorpora entrenamiento sobre los datasets propios FineCat-NLI y FineCat-NLI-Reason, con destilacion de conocimiento, y se evalua en un conjunto amplio de benchmarks NLI clasicos (MNLI, SNLI, ANLI, WANLI, LingNLI) ademas de un banco macro de 45 conjuntos orientado a zero-shot y grounding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base Ettin) |
| Parametros totales | 32.032.131 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 8000 tokens (documentos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en jhu-clsp/ettin-encoder-32m, un encoder de la familia ModernBERT de 32 millones de parametros. La tarea es NLI de tres clases: dada una premisa y una hipotesis, produce probabilidades de implicacion, contradiccion y neutralidad. Al tratarse de un cross-encoder, procesa conjuntamente ambos textos, lo que permite capturar interacciones finas entre premisa e hipotesis a costa de requerir una pasada por par (no genera embeddings reutilizables).

El entrenamiento se realizo sobre los datasets propios dleemiller/FineCat-NLI y dleemiller/FineCat-NLI-Reason, e incorpora destilacion de conocimiento (tag knowledge-distillation) desde modelos mayores. La model card menciona el uso de MNLI, SNLI y ANLI como parte del ecosistema de entrenamiento y evaluacion. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente a un cross-encoder de clasificacion). La innovacion principal es el uso de NLI como primitiva universal para multiples tareas downstream con un unico modelo de 32M.

## Capacidades

- Clasificacion NLI de tres clases (implicacion, contradiccion, neutralidad) con probabilidades calibradas.
- Clasificacion zero-shot mediante conversion de etiquetas en hipotesis ("This text is about X").
- Enrutamiento y triaje de peticiones (intenciones).
- Verificacion de groundedness en RAG: comprobar si la respuesta generada esta respaldada por los pasajes recuperados.
- Deteccion de alucinaciones y fact-checking.
- Guardrails y moderacion: evaluacion de mensajes frente a afirmaciones de politica.
- Extraccion clinica y de atributos (por ejemplo, determinacion de condiciones sociales).
- Procesamiento de documentos largos de hasta 8000 tokens.
- No soporta tool calling, agentes ni generacion de texto: es un encoder de clasificacion, no un modelo generativo.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Enrutamiento de tickets de soporte: se compara el texto del usuario con afirmaciones del tipo "El usuario quiere X" para cada categoria, y se elige la de mayor probabilidad de implicacion. Adecuado por su bajo coste y alta velocidad.
- Grounding en RAG: dado un pasaje recuperado y una respuesta generada, el modelo estima la probabilidad de que la respuesta este implicada por el pasaje, permitiendo filtrar respuestas no soportadas antes de mostrarlas al usuario.
- Deteccion de alucinaciones en produccion: se evalua cada afirmacion de la salida frente a las fuentes; las que no alcanzan un umbral de implicacion se marcan para revision.
- Moderacion y guardrails: se contrasta cada mensaje con afirmaciones de politica ("El mensaje contiene un insulto") para activar bloqueos o escalados.
- Clasificacion zero-shot de resenas y documentos: se generan hipotesis por etiqueta ("Esta resena es positiva") y se obtiene la distribucion de probabilidad sin entrenamiento adicional.
- Fact-checking automatizado: comparacion de afirmaciones con evidencias recuperadas para asignar un grado de soporte.
- Extraccion de informacion clinica: verificacion de atributos como situacion laboral o social a partir de notas clinicas.
- Filtrado y deduplicacion semantica en pipelines de datos: comprobacion de si un par de textos se implica o se contradice.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (accuracy, no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0,7598 |
| MultiNLI (validation matched) | Accuracy | 0,8144 |
| MultiNLI (validation mismatched) | Accuracy | 0,8173 |
| SNLI (test) | Accuracy | 0,8847 |
| ANLI round 1 (test) | Accuracy | 0,5910 |
| ANLI round 2 (test) | Accuracy | 0,4640 |
| ANLI round 3 (test) | Accuracy | 0,4558 |
| WANLI (test) | Accuracy | 0,6802 |
| LingNLI (validation) | Accuracy | 0,7356 |
| Banco macro de 45 conjuntos NLI / zero-shot / grounding | Macro accuracy | 0,7269 |

La model card menciona ademas resultados cualitativos en aplicaciones concretas: 95,3 % en intenciones MASSIVE, F1 de 0,73 en RAGTruth, 89,7 % en CrossingGuard y 97,0 % en SDOH-NLI. No se dispone de comparaciones numericas con modelos alternativos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (32M de parametros); en la practica cabe en cualquier GPU moderna y en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo desde una GTX 1650 en adelante es suficiente; A100/H100 solo aportan ventaja en throughput masivo.
- Cabe en GPU de consumo: si, en practicamente todas (incluidas integradas).
- Opciones de despliegue: sentence-transformers (CrossEncoder), Hugging Face Transformers, ONNX Runtime, y servidores de inferencia compatibles con modelos de clasificacion (por ejemplo, Text Embeddings Inference o endpoints propios). No se documenta soporte especifico para vLLM o llama.cpp.
- Latencia y throughput: aproximadamente 14 500 pares por segundo segun el autor; la latencia por par es del orden de microsegundos a milisegundos en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| finecat-nli-v2-xs | 32M | 8000 tokens | Apache-2.0 | Cross-encoder NLI ligero, calibrado, orientado a RAG y guardrails |
| Cross-encoders NLI tipo DeBERTa-v3-base | ~184M | 512 tokens | MIT / Apache-2.0 (segun variante) | Mayor tamano, contexto mas corto, ampliamente usados como rerankers |
| Encoders NLI tipo MiniLM-L6 | ~22M | 512 tokens | Apache-2.0 | Mas pequenos, contexto corto, sin contexto largo ni calibracion especifica documentada |

No se dispone en la informacion proporcionada de comparaciones numericas directas con estos u otros modelos; la tabla recoge solo caracteristicas estructurales.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado y previsiblemente sera bajo.
- Es un encoder de clasificacion, no un modelo generativo: no produce texto ni soporta tool calling ni razonamiento multi-paso.
- Riesgo de alucinacion no aplica en sentido generativo, pero las probabilidades pueden estar mal calibradas fuera de la distribucion de entrenamiento.
- Rendimiento notablemente inferior en ANLI (rondas 2 y 3 por debajo del 50 %), lo que indica dificultad con inferencias complejas o adversariales.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- No se documentan sesgos especificos; al entrenarse en datasets NLI en ingles, puede heredar sesgos de esos corpus.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda validar el modelo en el dominio concreto antes de produccion.
- El contexto de 8000 tokens es una ventaja, pero el coste computacional crece con la longitud del par.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dleemiller/finecat-nli-v2-xs
- Demo en vivo (Space): https://huggingface.co/spaces/dleemiller/finecat-nli
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- Leaderboard OpenNLI: https://huggingface.co/spaces/dleemiller/open-nli-leaderboard
- Script de evaluacion: https://huggingface.co/datasets/dleemiller/OpenNLI-Leaderboard/blob/main/evaluate.py
- Modelo base Ettin: https://huggingface.co/jhu-clsp/ettin-encoder-32m
