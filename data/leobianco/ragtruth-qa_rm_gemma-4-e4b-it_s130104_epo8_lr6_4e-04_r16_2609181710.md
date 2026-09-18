# leobianco/ragtruth-qa_RM_gemma-4-E4B-it_S130104_epo8_lr6_4e-04_r16_2609181710

## Resumen

`leobianco/ragtruth-qa_RM_gemma-4-E4B-it_S130104_epo8_lr6_4e-04_r16_2609181710` es un adaptador LoRA (PEFT) entrenado sobre el modelo `google/gemma-4-E4B-it`. No se trata de un modelo completo, sino de un conjunto de pesos de bajo rango (rango 16, segun la nomenclatura del repositorio) que debe cargarse junto al modelo base indicado en la model card. El tamano del repositorio es de 0,3 GB, coherente con un adaptador y no con un modelo completo.

La nomenclatura del identificador (`ragtruth-qa_RM`) y las metricas declaradas (ROC AUC, TPR y FPR a un umbral optimo, puntuaciones medias para positivos y negativos) apuntan a un reward model o clasificador binario orientado a la verificacion de respuestas en tareas de question answering sobre recuperacion aumentada (RAG), presumiblemente entrenado con datos del tipo RAGTruth para distinguir respuestas fieles al contexto frente a respuestas alucinadas. Esta interpretacion es una inferencia a partir del nombre y de las metricas, no una afirmacion de la model card.

El autor no documenta el conjunto de datos de entrenamiento, los usos previstos ni las limitaciones ("More information needed" en todos esos apartados). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el model-index no declara resultados de benchmarks estandar. Su relevancia practica esta en el uso como componente de evaluacion o de filtrado dentro de pipelines RAG, con un ROC AUC declarado de 0,9083 y una exactitud de 0,8649 al umbral 0,9893 sobre su conjunto de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder; modelo base `google/gemma-4-E4B-it`. Rango 16 inferido del identificador del repositorio. Detalle de arquitectura del modelo base: no disponible |
| Parametros totales | No disponible para el modelo base. Pesos del adaptador: repositorio de 0,3 GB |
| Parametros activos | No disponible (la nomenclatura "E4B" del modelo base sugiere un esquema de parametros efectivos, dato no confirmado en la informacion proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en precision original; no se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (declarada en la model card; el uso queda ademas sujeto a la licencia y terminos del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

Se trata de un ajuste fino mediante LoRA sobre `google/gemma-4-E4B-it`, con rango 16 segun el identificador (`r16`). El entrenamiento se realizo en configuracion multi-GPU con 2 dispositivos, batch total de 32 (16 por dispositivo), batch de evaluacion total de 64, optimizador AdamW torch fused (betas 0.9/0.999, epsilon 1e-08), scheduler coseno con warmup del 10 %, learning rate 0.0006408489062977591, semilla 130104 y 8 epocas completas. El nombre del repositorio recoge estos hiperparametros junto con la marca temporal de creacion.

La model card no describe la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de alineacion adicionales (RLHF, DPO). Si se infiere el tamano del conjunto de entrenamiento a partir de la tabla de resultados (25 pasos equivalen a 0,2907 epocas, es decir, unas 86 iteraciones por epoca con batch total de 32), el conjunto de entrenamiento rondaria los 2700-2800 ejemplos. Del mismo modo, los denominadores de las tasas de falsos positivos (0,1429 ≈ 6/42; 0,0476 = 2/42; 0,5238 = 22/42) sugieren un conjunto de evaluacion de aproximadamente 42 ejemplos negativos. Ambas cifras son estimaciones derivadas de los datos publicados, no cifras confirmadas por el autor.

No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, cabezas auxiliares) mas alla del propio ajuste LoRA.

## Capacidades

- Puntuacion de fidelidad en respuestas de question answering: el modelo produce una puntuacion escalar por ejemplo, utilizada para discriminar respuestas correctas de respuestas no fieles al contexto.
- Reward modeling: por su naturaleza de "RM" en el identificador y por las metricas de discriminacion binaria, es apto para puntuar salidas generadas por otros modelos.
- Clasificacion binaria con umbral ajustable: los resultados publicados incluyen umbral optimo (0,9893) y las tasas TPR/FPR asociadas, lo que permite calibrar el punto de operacion.
- Deteccion de alucinaciones en pipelines RAG: la tarea aparente es identificar respuestas no sustentadas por el contexto recuperado.
- Capacidades del modelo base: no disponibles. La model card no describe si conservan generacion de texto, codigo, matematicas, vision, tool calling, capacidades de agente o modo de razonamiento, ya que, al tratarse de un adaptador LoRA, el comportamiento final depende de `google/gemma-4-E4B-it`, cuyas especificaciones no se detallan en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Verificacion de respuestas en un pipeline RAG: tras recuperar documentos y generar una respuesta, el adaptador puntua cada par (contexto, respuesta) y se aplica el umbral 0,9893 para descartar o marcar las salidas no sustentadas antes de mostrarlas al usuario.
- Guardarrail de alucinaciones en produccion: integrado como etapa de validacion posterior al generador, permite bloquear respuestas con puntuacion baja y activar una respuesta de fallback o una segunda pasada de recuperacion.
- Evaluacion automatica de sistemas RAG: sirve como metrica de fidelidad para comparar variantes de recuperador, prompts o modelos generadores sin necesidad de anotacion humana en cada iteracion.
- Filtrado de datos sinteticos: puntuar pares generados de forma masiva para conservar solo los que superan el umbral y descartar los no fieles antes de reutilizarlos en un ajuste posterior.
- Reward model en un bucle de RLHF o RLAIF: uso de la puntuacion como senal de recompensa para optimizar un modelo generador hacia respuestas mas fieles al contexto. El ROC AUC declarado de 0,9083 proporciona una referencia de la calidad de la senal.
- Anotacion asistida de conjuntos de datos de QA: priorizar los ejemplos con puntuaciones cercanas al umbral para revision humana, reduciendo el volumen de anotacion manual necesaria.
- Monitorizacion de calidad en atencion al cliente automatizada: auditar conversaciones multi-turno con base documental y detectar respuestas que se desvian del contexto recuperado. La viabilidad depende de la longitud de contexto del modelo base, que no esta documentada.
- Reranking de candidatos: cuando se generan varias respuestas candidatas para una misma consulta, la puntuacion del adaptador permite ordenarlas por fidelidad al contexto.

## Benchmarks y rendimiento

No se han publicado resultados en el model-index (lista de resultados vacia). Los unicos datos disponibles son las metricas de evaluacion declaradas por el autor en la model card, correspondientes a su propio conjunto de evaluacion y no a benchmarks estandar como MMLU, GSM8K o HumanEval.

Resultados finales declarados:

| Metrica | Valor |
|---|---|
| Loss | 1,4386 |
| ROC AUC | 0,9083 |
| Umbral optimo | 0,9893 |
| TPR en el umbral optimo | 0,8661 |
| FPR en el umbral optimo | 0,1429 |
| Exactitud en el umbral optimo | 0,8649 |
| Puntuacion media de verdaderos positivos | 0,9182 |
| Puntuacion media de verdaderos negativos | 0,3332 |

Progresion durante el entrenamiento (seleccion de checkpoints de la tabla publicada):

| Epoca | Paso | Validation loss | ROC AUC | Exactitud en umbral optimo |
|---|---|---|---|---|
| 0,2907 | 25 | 0,7961 | 0,6885 | 0,5304 |
| 1,1628 | 100 | 0,5977 | 0,9003 | 0,8885 |
| 2,9070 | 250 | 0,8335 | 0,8914 | 0,9020 |
| 4,0698 | 350 | 0,6583 | 0,9118 | 0,9122 |
| 4,3605 | 375 | 1,0164 | 0,8965 | 0,8581 |
| 5,2326 | 450 | 0,9881 | 0,9129 | 0,8885 |

El ROC AUC se estabiliza por encima de 0,89 a partir de la primera epoca, con un maximo observado de 0,9129 en la epoca 5,2326, mientras que la validation loss oscila de forma notable (de 0,5977 a 1,3900) sin una tendencia descendente clara, lo que indica sobreajuste a partir de las primeras epocas. No hay benchmarks comparables publicados para este adaptador.

## Requisitos de hardware

- VRAM para inferencia: no documentada por el autor. Como estimacion orientativa, un modelo de la familia del base `E4B` en fp16 requeriria del orden de 8-10 GB, y en cuantizacion de 4 bits del orden de 3-4 GB; el adaptador anade aproximadamente 0,3 GB. Estas cifras son estimaciones y no datos publicados.
- GPU recomendadas para el entrenamiento: el autor uso 2 GPU en paralelo con batch total de 32, sin especificar modelo. Para reproducir el ajuste LoRA serian suficientes GPUs de gama profesional o de consumo con al menos 16-24 GB, dado el bajo rango del adaptador.
- GPU de consumo: el adaptador es ligero (0,3 GB), por lo que el requisito real lo marca el modelo base. Con cuantizacion de 4 bits es probable que quepa en GPUs de consumo con 8 GB o mas, pero este dato no esta confirmado en la informacion disponible.
- Opciones de despliegue: carga mediante `transformers` y `peft` (uso directo del adaptador), vLLM con soporte de adaptadores LoRA, TGI con LoRA, y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (reward models o clasificadores de fidelidad para RAG) ni datos de rendimiento de alternativas, y el model-index del repositorio esta vacio. Tampoco se dispone de especificaciones del modelo base `google/gemma-4-E4B-it` que permitan establecer una comparacion cuantitativa con otras variantes de la misma familia.

## Limitaciones y advertencias

- Model card incompleta: los apartados de descripcion, usos previstos, limitaciones y datos de entrenamiento contienen literalmente "More information needed". No hay informacion sobre composicion del dataset ni sobre sesgos.
- Es un adaptador, no un modelo autonomo: requiere `google/gemma-4-E4B-it` y no puede desplegarse por si solo.
- Sobreajuste probable: la validation loss oscila entre 0,5977 y 1,3900 a lo largo de las 8 epocas sin mejorar de forma sostenida, mientras el training loss cae hasta 0,0081. Se recomienda evaluar checkpoints intermedios y no asumir que el estado final es el mejor.
- Conjunto de evaluacion reducido: los denominadores de FPR sugieren del orden de 42 ejemplos negativos, lo que hace que las metricas tengan un intervalo de confianza amplio.
- Alto FPR residual: en el umbral optimo, el 14,29 % de los negativos se clasifican como positivos, con una separacion no trivial entre puntuaciones medias de positivos (0,9182) y negativos (0,3332).
- Riesgo de alucinacion del propio modelo base: no documentado, pero es una advertencia estandar en modelos generativos y no se ha evaluado en esta ficha.
- Idiomas y contexto: no disponibles. Si el adaptador se entreno solo con datos en ingles, su comportamiento en castellano no esta garantizado.
- Licencia apache-2.0 para el adaptador, pero el uso comercial puede quedar condicionado por la licencia y los terminos de uso del modelo base `google/gemma-4-E4B-it`, que deben verificarse por separado.
- Repositorio sin adopcion: 0 descargas y 0 likes, sin senales externas de validacion por parte de la comunidad.
- Fecha de creacion futura respecto al conocimiento del redactor: el repositorio figura como creado el 2026-09-18, dato que se reproduce tal cual aparece en la fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leobianco/ragtruth-qa_RM_gemma-4-E4B-it_S130104_epo8_lr6_4e-04_r16_2609181710
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante. Las busquedas devolvieron unicamente paginas de quizzes diarios de noticias sin relacion con el modelo. No hay papers, blogs, repositorios ni demos adicionales disponibles.
