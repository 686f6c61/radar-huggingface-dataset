# Booooooooooooo/vlqa-mdeberta-v3-base-xnli

## Resumen

`Booooooooooooo/vlqa-mdeberta-v3-base-xnli` es un cross-encoder de verificacion de evidencia (NLI) para recuperacion de informacion juridica en vietnamita. Lo publica el usuario Booooooooooooo como artefacto de un trabajo de fin de grado sobre sistemas de recuperacion de informacion legal, y deriva por fine-tuning del modelo multilingue `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`. Su tarea no es generar texto, sino puntuar pares (consulta, pasaje) y decidir si el pasaje implica o respalda la consulta, de modo que pueda actuar como reranker o verificador dentro de un pipeline RAG juridico.

Tecnicamente es un encoder transformer de la familia DeBERTa-v2 con 278.810.882 parametros totales, cabecera de clasificacion binaria y una longitud maxima de entrada de 512 tokens. La reformulacion del problema como NLI de dos clases (0 = contradiccion / no relevante, 1 = implicacion / evidencia de apoyo) permite reutilizar el conocimiento de inferencia natural del modelo base y adaptarlo al dominio legal vietnamita con un conjunto de datos especifico, `VLQA`.

Su relevancia es acotada pero concreta: los sistemas de busqueda juridica en vietnamita tienen pocos componentes abiertos y ligeros para la fase de verificacion, y este modelo ocupa exactamente ese hueco con licencia MIT y pesos en safetensors. Conviene tener en cuenta que el repositorio no incluye resultados de evaluacion, versiones cuantizadas ni documentacion de despliegue, y que el modelo solo declara soporte para vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DeBERTa-v2 (tag del repo: `deberta-v2`), con cabecera de clasificacion de secuencias para NLI de 2 clases |
| Parametros totales | 278.810.882 (dato del repo, safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (`max_length: 512` segun la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precision original; no hay GGUF, ONNX ni variantes int8/fp16 publicadas) |
| Idiomas soportados | vietnamita (`vi`) declarado; el modelo base es multilingue, pero el fine-tuning y la evaluacion declarada se limitan a vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 0,6 GB) |
| Etiquetas de salida | 2: `0` = contradiccion / no relevante, `1` = implicacion / evidencia de apoyo |
| Agregacion de pasajes | `max` (bag aggregation declarada en la model card) |
| Pipeline en HuggingFace | `text-classification` |
| Uso previsto | cross-encoder verificador (NLI verifier) en recuperacion de informacion legal |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: tokeniza conjuntamente la consulta y el pasaje candidato como un unico par de secuencias y produce logits sobre dos clases. La arquitectura de partida es DeBERTa-v2, con atencion desacoplada (contenido y posicion tratados por separado) y una capa de embeddings de vocabulario amplio propia del modelo multilingue original; el recuento total de 278,8 M de parametros es coherente con un backbone de tipo *base* cuyo embeddings multilingue concentra una parte muy relevante del total. La cabecera es una capa densa de clasificacion sobre el token `[CLS]`, sustituida respecto al modelo base para pasar de las tres clases NLI estandar a las dos clases del dominio legal.

El entrenamiento consiste en un fine-tuning supervisado sobre el conjunto `VLQA`, reformulado como clasificacion binaria de implicacion frente a no relevancia, segun indica la model card. No se documentan en la informacion disponible el numero de pares de entrenamiento, la composicion del dataset, la mezcla de negativos, la funcion de perdida, los hiperparametros ni si hubo una fase adicional de ajuste con preferencias (RLHF/DPO); tampoco se describe ninguna innovacion tecnica mas alla del propio esquema de verificacion y de la agregacion `max` sobre pasajes. El ejemplo de uso de la model card calcula la probabilidad de implicacion como `sigmoid(logit[1] - logit[0])`, es decir, una diferencia de logits entre las dos clases en lugar de un softmax directo, lo que conviene replicar para mantener la calibracion esperada por el autor.

## Capacidades

- Clasificacion de pares (consulta, pasaje) en dos categorias: evidencia de apoyo frente a contradiccion o no relevancia.
- Puntuacion de relevancia para reranking en pipelines de recuperacion juridica, con salida interpretable como probabilidad mediante `sigmoid(logit[1] - logit[0])`.
- Verificacion de citas y de pasajes recuperados en sistemas RAG: comprobar que la evidencia citada respalda realmente la respuesta.
- Agregacion a nivel de documento mediante max-pooling sobre las puntuaciones de sus pasajes, segun el esquema declarado (`bag aggregation: max`).
- Procesamiento de entradas de hasta 512 tokens por par, suficiente para articulos y clausulas legales habituales.
- Capacidad multilingue latente heredada del modelo base (entrenado sobre NLI multilingue), aunque el autor solo declara y valida vietnamita.
- No soporta generacion de texto, tool calling, function calling, uso como agente, vision, audio ni modo de razonamiento explicito: es un encoder discriminativo de una sola pasada.

## Casos de uso

- Reranking en busqueda juridica vietnamita: dado un conjunto de 50-100 pasajes recuperados por un retriever lexical o denso (BM25, embedding bi-encoder), el cross-encoder repuntua cada par (pregunta, pasaje) y permite reordenar por probabilidad de implicacion antes de construir la respuesta final.
- Verificacion de evidencia en un RAG legal: antes de mostrar una respuesta generada por un LLM, se comprueba con este modelo que cada pasaje citado obtiene una puntuacion de implicacion alta respecto a la pregunta, y se descartan o marcan las citas que no la superan.
- Deteccion de respuestas no fundamentadas: si ningun pasaje recuperado supera el umbral de implicacion, el sistema puede devolver "no se ha encontrado base legal" en lugar de arriesgar una respuesta inventada.
- Filtrado de ruido en corpus normativos: aplicar el modelo como clasificador de pares (consulta interna, articulo) para descartar articulos de un corpus extenso que no abordan la materia consultada, reduciendo el coste de revision manual.
- Asistencia a la revision documental: comprobar si un contrato o clausula propuesta esta respaldada por la normativa citada, presentando la probabilidad de implicacion como indicador para el revisor humano.
- Construccion de conjuntos de datos de entrenamiento: usar las puntuaciones para etiquetar debilmente pares (pregunta, pasaje) a gran escala y alimentar un reranker o un retriever denso en una segunda iteracion.
- Evaluacion de sistemas de recuperacion: medir la tasa de evidencia correctamente identificada por un pipeline de recuperacion juridica, usando el modelo como juez automatico de relevancia con umbral calibrado sobre un conjunto de validacion propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (accuracy, F1, MRR, nDCG ni resultados sobre VLQA u otros conjuntos), y la busqueda web asociada no devolvio ningun resultado tecnico utilizable sobre este repositorio. Cualquier cifra de rendimiento debe obtenerse mediante una evaluacion propia sobre un conjunto de validacion etiquetado del dominio objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 1,1 GB de pesos mas activaciones y memoria del tokenizador para lotes pequenos; en fp16/bf16, unos 0,56 GB; en int8, unos 0,28 GB. Con lote de 32 pares a 512 tokens hay que anadir memoria de activaciones, por lo que conviene reservar 2-4 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB es suficiente; una RTX 3060/4060 o superior cubre el caso de uso en produccion con lotes moderados; A100/H100 solo tienen sentido para evaluacion masiva por throughput, no por requisito de memoria.
- Cabe en GPU de consumo: si, en toda la gama consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) e incluso en GPUs de 4 GB con fp16 o int8 y lotes pequenos. Tambien es viable en CPU para volmenes bajos.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` es la via documentada en la model card. Al ser un encoder BERT-like, es exportable a ONNX Runtime y a TorchScript para servir con mayor eficiencia, y puede servirse con Text Embeddings Inference o con un servidor HTTP propio; vLLM y TGI estan orientados a modelos generativos y no aportan ventaja aqui. No hay pesos GGUF publicados, por lo que llama.cpp/Ollama requeririan una conversion manual.
- Latencia y throughput: no disponible (no se han publicado mediciones). Como referencia orientativa no verificada, un cross-encoder de ~280 M de parametros en fp16 sobre una GPU moderna suele procesar del orden de cientos a pocos miles de pares por segundo a 512 tokens, pero esta cifra debe medirse en el hardware concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Booooooooooooo/vlqa-mdeberta-v3-base-xnli` | 278,8 M | 512 | vi (declarado) | NLI binario legal, cross-encoder | MIT | HuggingFace, safetensors, 0 descargas |
| `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7` (modelo base) | ~278 M (misma familia y tokenizador) | 512 | multilingue (incluye vi) | NLI de 3 clases, generico | MIT | HuggingFace, ampliamente utilizado |
| Cross-encoders NLI multilingues de tipo XLM-R large (p. ej. `joeddav/xlm-roberta-large-xnli`) | ~560 M (aproximado, no verificado en esta busqueda) | 512 | multilingue | NLI de 3 clases, generico | MIT | HuggingFace |

La comparacion relevante es con el modelo base: este fine-tuning no anade parametros, sino que especializa la salida en dos clases y en el dominio legal vietnamita. Frente a un cross-encoder multilingue generico de mayor tamano, la ventaja esperable es menor latencia y mejor ajuste al dominio, a cambio de perder generalidad y de carecer de metricas publicas que respalden la mejora. No se dispone de datos que permitan comparar rendimiento numerico entre estas opciones.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay metricas en la model card ni resultados de benchmarks, por lo que la calidad real del fine-tuning es desconocida y debe validarse antes de cualquier uso en produccion.
- Alcance idiomatico restringido: solo se declara vietnamita. Aunque el modelo base es multilingue, no hay evidencia de que el ajuste legal conserve capacidades en castellano u otros idiomas.
- Dominio estrecho: entrenado sobre `VLQA` para verificacion de evidencia legal; su comportamiento fuera de ese dominio (noticias, textos cientificos, conversacion general) no esta caracterizado.
- Riesgo de falsos negativos en evidencia parafraseada: al ser un modelo NLI entrenado con etiquetas binarias, puede infravalorar pasajes que responden a la consulta con reformulaciones o terminologia juridica distinta.
- Calibracion dependiente del uso correcto de la salida: el ejemplo del autor aplica `sigmoid(logit[1] - logit[0])`; usar `softmax` o la probabilidad directa de la clase 1 puede dar umbrales distintos. Cualquier umbral de decision debe calibrarse sobre datos propios.
- Limite de 512 tokens: los articulos o documentos largos deben trocearse; la estrategia de fragmentacion afecta directamente a las puntuaciones y a la agregacion `max`.
- Riesgo de alucinacion no aplica en sentido generativo (el modelo no genera texto), pero si existe riesgo de verificacion erronea: una puntuacion alta no garantiza correccion juridica, solo similitud de implicacion segun el entrenamiento.
- Licencia MIT: permite uso comercial y modificacion con atribucion; aun asi, debe conservarse el aviso de copyright y conviene revisar las condiciones del modelo base y del dataset `VLQA`, cuyos terminos no se detallan en la informacion disponible.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni mantenimiento documentado; no hay garantia de soporte ni de actualizaciones.
- Sesgos: no documentados. Al tratarse de un corpus legal vietnamita, puede heredar sesgos de la normativa y de la seleccion de documentos del dataset, no caracterizados por el autor.
- Advertencia de uso: no debe emplearse como sustituto del asesoramiento juridico; su salida es un indicador de relevancia, no una conclusion legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Booooooooooooo/vlqa-mdeberta-v3-base-xnli
- Modelo base: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
- Paper de DeBERTa (arquitectura de referencia): no disponible en la informacion proporcionada
- Dataset `VLQA`: no se proporciona enlace en la model card
- Repositorio de codigo, demo o blog del autor: no disponible
- Nota sobre la busqueda web: los resultados devueltos no guardaban relacion con el modelo ni con recuperacion de informacion juridica, por lo que no se incluyen como enlaces de referencia.
