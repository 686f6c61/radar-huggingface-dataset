# argos1111/modernbert-ja-310m-jev

## Resumen

modernbert-ja-310m-jev es un cross-encoder japonés de 315.203.329 parámetros publicado por el usuario argos1111, obtenido mediante fine-tuning supervisado de sbintuitions/modernbert-ja-310m. No es un modelo generativo: es un clasificador de secuencia (`ModernBertForSequenceClassification` con un único logit y pooling sobre el token CLS) que lee como una sola secuencia el par «pregunta + situación (State)» junto con un candidato, y devuelve una puntuación. Aplicando softmax sobre las puntuaciones de todos los candidatos se obtienen probabilidades para tres modos de decisión: Choice (elección entre opciones), Score (evaluación por grados) y Noul (verdadero/falso).

El modelo existe para servir de backend ModernBERT a Jev Local, un proyecto del mismo autor que expone una API compatible con `/v1/systemone`. El autor declara explícitamente que se trata de un modelo no oficial y sin relación con el Jev de TypeSafe, y que no reproduce su entrenamiento ni su precisión. Se entrenó con 94.384 preguntas (unos 345.000 pares) derivadas de JGLUE, JCoLA, JCommonsenseMorality y MASSIVE 1.1, todas ellas convertidas al formato System One.

Su relevancia práctica es la de un clasificador de razonamiento ligero en japonés: con 315M de parámetros y una ventana de 512 tokens, alcanza un 92,62 % en JNLI y un 92,40 % en JCommonsenseQA del split de test de JGLUE (datos no usados en el entrenamiento, aunque sí el split de train homólogo), y resuelve con coste muy bajo tareas de enrutado e intención donde un LLM de 1,2B zero-shot rinde mucho peor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) con cabeza de clasificación de secuencia de 1 logit y pooling CLS |
| Parametros totales | 315.203.329 (≈315M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens en el fine-tuning, con truncado aplicado solo al lado State |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors (~1,3 GB, coherente con fp32) sin variantes GGUF, AWQ, GPTQ ni ONNX |
| Idiomas soportados | japonés (entrenamiento y evaluación); inglés no evaluado; cualquier otro idioma sin evaluar, según el autor |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tipo de tarea | text-classification / cross-encoder de puntuación |
| Modelo base | sbintuitions/modernbert-ja-310m (revisión 77675fc9) |
| Modos de salida | Choice (selección de candidato), Score (puntuación por grados), Noul (verdadero/falso con candidatos `["true", "false"]`) |
| Formato de entrada | `質問: {pregunta}\n状況: {state}` con candidatos `etiqueta — descripción`; `format_version` `modernbert-jev/1` |
| Autor | argos1111 |
| Fecha de publicación | 2026-09-19 |
| Tamaño del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer ModernBERT (no MoE, no SSM) sobre el checkpoint japonés sbintuitions/modernbert-ja-310m, al que se añade una cabeza `ModernBertForSequenceClassification` con `num_labels=1` y pooling CLS. Cada ejemplo de entrenamiento es una lista de K candidatos para una misma pregunta, y la pérdida es una entropía cruzada listwise sobre las puntuaciones de esos K candidatos: no se trata de una clasificación binaria independiente por par, sino de un ranking condicionado a la pregunta. El modelo se usó como cross-encoder que lee el par «pregunta + situación» frente a cada candidato dentro de una misma secuencia.

El entrenamiento cubrió 94.384 preguntas (aproximadamente 345.000 pares), 2 épocas y 5.386 pasos, con learning rate 3e-5, warmup lineal del 6 % seguido de decay, AdamW con weight decay 0,01, 128 pares por paso, autocast en bf16, semilla 0 y longitud de serie 512. Se ejecutó en una AMD Radeon AI PRO R9700 con torch 2.13.0+rocm10.0.0 y transformers 5.17.0, en unos 41 minutos. Los datos proceden de seis fuentes convertidas a formato System One: JNLI train y JCommonsenseQA train y JSTS train de JGLUE (CC BY-SA 4.0), JCoLA in-domain train (CC BY-SA 4.0), JCommonsenseMorality train (MIT) y MASSIVE 1.1 ja-JP train (CC BY 4.0). Alrededor del 41 % de los ejemplos son preguntas de verdadero/falso, con una tasa de «true» aproximada del 46 %, y en algunos casos se eliminaron aleatoriamente las descripciones de los candidatos. El código de conversión está en `modernbert/data.py` del repositorio Jev Local. No se menciona RLHF ni DPO: es fine-tuning supervisado con pérdida listwise.

## Capacidades

- Puntuación cross-encoder de pares (pregunta + situación, candidato) en japonés, con softmax sobre candidatos para obtener probabilidades normalizadas.
- Selección entre opciones (Choice): elección de respuesta en conjuntos cerrados, incluidas variantes de 2 a 6 opciones y de 18 categorías de dominio en MASSIVE.
- Verdadero/falso (Noul): evaluación de afirmaciones usando los candidatos `["true", "false"]`.
- Evaluación por grados (Score): estimación de similitud semántica entre dos frases en una escala de 0 a 5 (seis niveles).
- Inferencia de relación entre frases (NLI): determinar la relación entre premisa e hipótesis en tres clases y comprobar si la hipótesis se sigue necesariamente.
- Clasificación de intención y dominio: etiquetado de la materia de un enunciado entre 18 dominios.
- Juicio de gramaticalidad (JCoLA) y de contenido moralmente problemático (JCommonsenseMorality).
- Enrutado de peticiones y detección de intención en dominios no vistos dentro de la misma familia de tareas: 93,8 % en un conjunto artesanal de 16 casos de atención al cliente con modos noul/choice/score.
- Integración con tooling: compatible con `text-embeddings-inference` y con `endpoints_compatible`; el autor proporciona un backend listo para la API `/v1/systemone` de Jev Local.
- No soporta generación de texto, tool calling, agentes multi-paso, visión ni audio. No es un modelo de instrucciones y no sigue indicaciones al estilo de un LLM.

## Casos de uso

- Enrutado de tickets de atención al cliente: el modelo puntúa departamentos candidatos (`billing — 請求・返金`, `technical — 技術的な障害`, `sales`) a partir del estado del ticket y de una pregunta de clasificación. En el ejemplo del autor devuelve 0,9996 para el departamento correcto. Es adecuado porque la decisión es de un solo paso, con latencia y coste mínimos, y no requiere generar texto.
- Desambiguación de intención en asistentes conversacionales japoneses: con el formato de MASSIVE, etiqueta la materia de cada turno del usuario entre 18 dominios, y admite subconjuntos aleatorios de 2 a 6 opciones para decisiones más restringidas (98,5 % en el subconjunto del split de validación).
- Moderación de contenido sensible: el modelo evalúa si un texto en japonés plantea un problema moral (87,7 % en el split de validación de JCommonsenseMorality), lo que permite un primer filtrado barato antes de una revisión humana o de un modelo mayor.
- Verificación de coherencia en pipelines de resumen o respuesta: dado un texto fuente (premisa) y una frase generada (hipótesis), comprueba si la hipótesis se sigue necesariamente, como control de consistencia sobre salidas de un LLM japonés.
- Re-ranking de respuestas candidatas en recuperación documental: al ser un cross-encoder que puntúa pares, puede ordenar fragmentos recuperados por un sistema de búsqueda antes de pasarlos a un generador, con la ventaja de costar 315M de parámetros frente a un cross-encoder multilingüe grande.
- Control de calidad gramatical en generación de texto japonés: detección de frases no naturales en salidas de un modelo generativo (89,6 % en la tarea JCoLA del split de validación), útil como filtro automático de publicaciones.
- Pre-filtro económico previo a un LLM: para decisiones de elección o verdadero/falso, el modelo resuelve en una sola pasada lo que un LLM de 1,2B hace mucho peor (17,15 % frente a 92,62 % en JNLI con la misma API), reservando el modelo generativo para los casos que este clasificador no cubre.
- Comparación de similitud entre titulares o frases cortas en japonés: puntuación en escala 0-5, con la advertencia de que la coincidencia exacta de nivel es del 60,7 % en validación y conviene usar la puntuación continua en lugar de la clase discreta.

## Benchmarks y rendimiento

JGLUE test (datos no usados en el entrenamiento, aunque sí el train homólogo). Evaluación vía API HTTP de Jev Local, una petición por pregunta, 4 en paralelo, sobre R9700.

| Tarea | Precisión | LFM2.5-1.2B zero-shot (misma API) |
|---|---:|---:|
| JNLI | 92,62 % (2323/2508) | 17,15 % |
| JCommonsenseQA | 92,40 % (1033/1118) | 68,87 % |

La model card oficial del modelo base reporta JNLI 92,93 y JComQA 93,53 con cabezas dedicadas por tarea; este modelo entrena todas las tareas con un único evaluador, por lo que la comparación no es equivalente. Además, el propio autor advierte que el resultado en test está condicionado por haber usado el train de los mismos conjuntos.

Split de validación (3.000 preguntas, evaluación durante el entrenamiento):

| Tarea | Precisión | Tarea | Precisión |
|---|---:|---|---:|
| jnli | 94,3 % | jcola | 89,6 % |
| jnli-noul | 95,2 % | moral | 87,7 % |
| jcommonsenseqa | 95,9 % | massive-scenario (18 opciones) | 86,1 % |
| jcommonsenseqa-noul | 92,5 % | massive-scenario-subset | 98,5 % |
| jsts (coincidencia exacta en 6 niveles) | 60,7 % | massive-noul | 98,0 % |

Tareas no incluidas en el entrenamiento:

| Tarea | n | Mayoría | Este modelo | LFM2.5-1.2B zero-shot |
|---|---:|---:|---:|---:|
| livedoor noticias, 9 categorías | 500 | 14,2 % | 35,6 % | 46,8 % |
| JMMLU 4 opciones (10 materias) | 500 | 28,8 % | 34,8 % | 43,6 % |
| Atención al cliente artesanal (noul/choice/score) | 16 | 25,0 % | 93,8 % | 56,2 % |

El autor señala que el modelo es más débil que LFM en tareas que requieren conocimiento o sistemas de clasificación desconocidos, y más fuerte en determinación de intención y relación en japonés corto incluso fuera de la distribución de entrenamiento. El conjunto de 16 ejemplos es indicativo y no permite conclusiones estadísticas. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del número de parámetros (315,2M) y del tamaño del repositorio (1,3 GB, coherente con pesos en fp32); no proceden de mediciones publicadas por el autor.

- Pesos en fp32: aproximadamente 1,26 GB. Con activaciones para lotes pequeños, el consumo realista ronda 2 GB de VRAM.
- Pesos en fp16/bf16: aproximadamente 0,63 GB. Cuantizado a int8, unos 0,32 GB; a int4, unos 0,16 GB (requiere conversión propia, no publicada).
- Con lotes grandes (el entrenamiento usó 128 pares por paso a 512 tokens) las activaciones crecen de forma notable y pueden requerir varios GB adicionales; el cuello de botella es el número de pares por lote, no el tamaño del modelo.
- Cabe en cualquier GPU de consumo actual: RTX 3060, 4060, 3080, 4070, 4080, 4090, así como en iGPU con memoria compartida y en CPU. No se recomienda A100 ni H100 salvo para servicio de alto rendimiento agregado; el modelo es demasiado pequeño para aprovecharlas en latencia por petición.
- GPU de centro de datos razonables para servicio: T4, L4, L40S o A10, todas sobredimensionadas en memoria pero útiles para concurrencia.
- Despliegue: `transformers` con `AutoModelForSequenceClassification` tal como muestra el autor; Text Embeddings Inference (el modelo declara el tag `text-embeddings-inference` y `endpoints_compatible`); HF Inference Endpoints; y el backend propio de Jev Local mediante `./setup_modernbert.sh` y `./run_modernbert.sh --checkpoint argos1111/modernbert-ja-310m-jev`, que expone la API compatible con `/v1/systemone`.
- No hay conversiones publicadas a GGUF, ONNX, TensorRT ni OpenVINO, por lo que llama.cpp, Ollama y motores basados en GGUF no son utilizables sin convertir el modelo previamente.
- Latencia y throughput: no publicados. La única referencia disponible es la configuración de evaluación (una petición por pregunta, 4 en paralelo, sobre Radeon AI PRO R9700) y el tiempo de entrenamiento (41 minutos para 5.386 pasos con 128 pares por paso), que no equivalen a métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento relevante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| argos1111/modernbert-ja-310m-jev | 315,2M | 512 tokens | JNLI test 92,62 %; JCommonsenseQA test 92,40 %; jsts validación 60,7 %; livedoor 35,6 % | CC BY-SA 4.0 | safetensors en HuggingFace, backend Jev Local |
| sbintuitions/modernbert-ja-310m (base) | ≈310M según denominación | no disponible en la información proporcionada | JNLI 92,93 y JComQA 93,53 con cabezas dedicadas por tarea, según su model card | MIT | safetensors en HuggingFace |
| LFM2.5-1.2B (usado como baseline en la evaluación del autor) | ≈1,2B según denominación | no disponible | JNLI 17,15 % y JComQA 68,87 % zero-shot; livedoor 46,8 %; JMMLU 43,6 %; atención al cliente 56,2 % | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Cross-encoders japoneses alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con el modelo base no es directa: sbintuitions/modernbert-ja-310m se evalúa con cabezas específicas por tarea, mientras que modernbert-ja-310m-jev unifica todas las tareas en un solo evaluador. La comparación con LFM2.5-1.2B mezcla regímenes distintos (cross-encoder con train de la misma familia de datos frente a LLM zero-shot) y el propio autor lo advierte.

## Limitaciones y advertencias

- Fuera de los tipos de pregunta entrenados (NLI, clasificación de intención, evaluación por grados, QA de sentido común, verdadero/falso) no hay garantía de precisión. Lee las instrucciones y las descripciones de los candidatos como texto, pero no las obedece como haría un LLM.
- No se incluyeron datos de dominios profesionales (por ejemplo, atención al cliente real) en el entrenamiento; el rendimiento en esos escenarios procede de la transferencia desde tareas afines.
- Mala calibración: en respuestas incorrectas de JMMLU la probabilidad máxima media fue de 0,66. El campo `confidence` mide la concentración de la distribución, no es una precisión corregida, y no debe usarse como umbral fiable sin calibrar.
- El modelo puede producir puntuaciones muy altas en respuestas erróneas; en producción conviene definir umbrales de abstención y validar con datos propios.
- Ventana de 512 tokens con truncado del lado State: los estados largos pierden el final de la secuencia. No hay soporte para ventanas mayores pese a que la arquitectura ModernBERT subyacente podría admitirlas.
- El modelo no acepta imágenes. Solo se ha evaluado en japonés; el autor indica que idiomas distintos del japonés y el inglés no están evaluados, y no se aportan métricas en inglés.
- Es un modelo no oficial y sin relación con el Jev de TypeSafe; no reproduce su entrenamiento ni su precisión, tal como indica el propio autor.
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone atribución y compartir igual (share-alike) de las obras derivadas, además de obligar a mantener la atribución de los conjuntos de datos de origen (CC BY-SA 4.0, CC BY 4.0 y MIT). Esto es relevante si el modelo se integra en un producto propietario.
- Los resultados en JGLUE test están condicionados por el uso del split de train de los mismos conjuntos; no equivalen a una evaluación estrictamente fuera de distribución.
- El ejemplo de atención al cliente se basa en 16 casos y no tiene valor estadístico.
- No se publican resultados en tareas como generación, resumen, traducción o tool calling, que el modelo no soporta por diseño.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/argos1111/modernbert-ja-310m-jev
- Modelo base: https://huggingface.co/sbintuitions/modernbert-ja-310m
- Repositorio Jev Local: https://github.com/Argos1111/jev_local
- Código de conversión de datos: https://github.com/Argos1111/jev_local/blob/main/modernbert/data.py
- JGLUE: https://github.com/yahoojapan/JGLUE
- JCoLA: https://github.com/osekilab/JCoLA
- JCommonsenseMorality: https://github.com/Language-Media-Lab/commonsense-moral-ja
- MASSIVE: https://github.com/alexa/massive
- Datasets en HuggingFace: https://huggingface.co/datasets/yahoojapan/JGLUE, https://huggingface.co/datasets/osekilab/JCoLA, https://huggingface.co/datasets/Language-Media-Lab/commonsense-moral-ja, https://huggingface.co/datasets/AmazonScience/massive

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces de referencia son los declarados en la model card y en los metadatos de HuggingFace.
