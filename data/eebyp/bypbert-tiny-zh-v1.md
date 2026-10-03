# eebyp/BypBERT-tiny-zh-v1

## Resumen

BypBERT-tiny-zh-v1 es un modelo de lenguaje con enmascaramiento (masked language model, MLM) de tipo encoder-only, desarrollado por Yiping Bai (白毅平) y publicado en Hugging Face bajo el identificador eebyp. Se trata de un BERT en miniatura para chino con 8.689.032 parametros (aproximadamente 8,7 M), construido a partir de google-bert/bert-base-chinese y reentrenado sobre 1.287.957 frases de la Wikipedia en chino. Su proposito es ofrecer un encoder chino ultraligero que pueda afinarse para tareas de comprension (clasificacion, NER, similitud semantica) y desplegarse en entornos con recursos muy limitados.

La arquitectura conserva el esquema transformer bidireccional de BERT, pero reducido a 4 capas, dimension oculta 256, 4 cabezas de atencion y dimension de feed-forward 1.024, con un vocabulario WordPiece de 21.128 tokens heredado de bert-base-chinese. La longitud maxima de secuencia es de 128 tokens, lo que lo orienta a frases y parrafos cortos en lugar de documentos largos.

Su relevancia actual reside en el coste de despliegue: con menos de 9 M de parametros, el modelo cabe en cualquier GPU de consumo, en CPU o en un acelerador movil, y sirve como base para destilacion o como componente ligero dentro de pipelines de NLP en produccion. El autor tiene previstas versiones posteriores con enmascaramiento de palabra completa (WWM) y estilo MacBERT (MLM as Correction).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder-only (transformer bidireccional) |
| Parametros totales | 8.689.032 (aprox. 8,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (maxima) |
| Tipos de cuantizacion | No especificados por el autor; los pesos se publican en safetensors en precision completa, de modo que la cuantizacion a FP16/INT8/INT4 queda a cargo del usuario |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carga via transformers) |

Dimensiones internas declaradas por el autor: hidden size 256, 4 capas, 4 cabezas de atencion, feed-forward de 1.024, vocabulario de 21.128 tokens (WordPiece de bert-base-chinese). Entorno de entrenamiento: PyTorch / Transformers 5.17.0 sobre NVIDIA Tesla T4 (14,6 GB de VRAM) y Google Colab Pro.

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de 4 capas, con dimension oculta de 256 y 4 cabezas de atencion (64 dimensiones por cabeza), y una red feed-forward de 1.024 unidades. Usa el tokenizador WordPiece de bert-base-chinese (21.128 tokens) y esta limitado a secuencias de 128 tokens. El preentrenamiento se realizo con la tarea estandar de masked language model (MLM), sin estrategias de enmascaramiento de palabra completa (WWM) ni de correccion al estilo MacBERT. Las fases v2 (WWM) y v3 (MacBERT) estan anunciadas pero aun no publicadas.

El entrenamiento utilizo un corpus de 1.287.972 lineas procedentes de la Wikipedia en chino, que el autor desglosa por franjas tematicas (agricultura, politica estadounidense, linguistica, musica, historia de China, tecnologia de redes, optica, historia de Japon, fauna, ciencia ficcion y deportes). Se completaron 116.000 pasos correspondientes a 5 epocas, con una fase previa de prueba rapida sobre 10.000 frases (314 pasos). La curva de convergencia pasa de una perplejidad de 868,90 en la prueba inicial a 3,50 en el checkpoint de 76.000 pasos (75 % del entrenamiento) y a 2,05 en el modelo final, lo que indica que la mayor parte de la ganancia se produce en la primera fase y el tramo final aporta un ajuste fino.

## Capacidades

- Modelado de lenguaje con enmascaramiento (fill-mask) sobre texto en chino.
- Extraccion de representaciones contextuales: el vector `[CLS]` de 256 dimensiones puede emplearse para similitud de frases y recuperacion semantica.
- Base para ajuste fino en clasificacion de texto (analisis de sentimiento, clasificacion tematica, deteccion de intencion).
- Base para ajuste fino en reconocimiento de entidades nombradas (personas, lugares, organizaciones).
- Distincion de orden gramatical: el autor reporta un 80 % de acierto discriminando frases correctas frente a secuencias con el orden alterado.
- Sensibilidad al contexto de polisemias: la representacion del caracter 打 varia segun el contexto (打電話 / 打篮球 / 打字), con una similitud media de 0,7653.
- No dispone de capacidad de generacion de texto (arquitectura encoder-only), ni de tool calling, ni de comportamiento de agente multi-paso, ni de vision o audio.

## Casos de uso

- Clasificacion de texto en produccion: el modelo puede afinarse con `BertForSequenceClassification` sobre datos etiquetados de sentimiento o tematica y desplegarse con una huella de memoria inferior a 40 MB en FP32, lo que permite servirlo en contenedores pequenos o en el propio dispositivo.
- Reconocimiento de entidades nombradas: partiendo del encoder se puede anadir una cabeza de etiquetado de secuencias (token classification) para extraer personas, lugares y organizaciones en textos chinos cortos (titulares, mensajes, resenas).
- Recuperacion semantica ligera: usando el vector `[CLS]` de 256 dimensiones se pueden construir indices de similitud coseno para motores de busqueda sobre frases o parrafos cortos, con un coste de computo muy bajo.
- Filtrado previo de contenido en pipelines de NLP: el modelo puede actuar como clasificador rapido de primera etapa (por ejemplo, deteccion de spam o de intencion) antes de invocar un modelo mayor, gracias a su latencia reducida.
- Despliegue en el borde (edge) o movil: con 8,7 M de parametros es viable exportarlo a ONNX o TorchScript y ejecutarlo en dispositivos embebidos o telefonos para tareas de clasificacion en local, sin conexion.
- Generacion de embeddings para clustering de documentos chinos: los vectores `[CLS]` permiten agrupar frases por tema; el autor reporta una separacion media de 0,1065 entre la similitud intra-tema (0,8906) y la inter-tema (0,7841).
- Componente de destilacion: puede emplearse como alumno o como profesor destilado en la construccion de modelos aun mas pequenos para tareas especificas en chino.
- Prototipado academico y docencia: su tamano minimo permite entrenar y evaluar variantes en una unica GPU de consumo o incluso en CPU, lo que lo hace util para experimentos reproducibles.

## Benchmarks y rendimiento

Las cifras siguientes provienen de la evaluacion interna declarada por el autor. No son benchmarks estandar de la comunidad (MMLU, HumanEval, GLUE, CLUE), sino pruebas propias.

| Metrica | Resultado | Referencia / nota |
|---|---|---|
| Perplejidad (corpus de evaluacion interno) | 2,05 | Linea base aleatoria: 21.128 |
| Perplejidad en checkpoint-76000 (75 %) | 3,50 | - |
| Perplejidad en prueba rapida (10.000 frases) | 868,90 | - |
| MLM top-5 (aciertos) | 1/10 (10,0 %) | 10 frases tomadas del propio corpus de entrenamiento |
| Juicio gramatical (frase correcta vs. desordenada) | 80,0 % (4/5) | Linea base aleatoria: 50 % |
| Similitud media intra-tema (`[CLS]`) | 0,8906 | - |
| Similitud media inter-tema (`[CLS]`) | 0,7841 | Diferencia: 0,1065 |
| Similitud de polisemia del caracter 打 | 0,7653 | Umbral de sensibilidad al contexto: < 0,99 |

No se han publicado resultados en benchmarks estandar (GLUE, CLUE, MMLU u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos en FP32: aproximadamente 35 MB (8.689.032 parametros x 4 bytes), mas el overhead de activaciones, que en secuencias de 128 tokens es despreciable.
- VRAM estimada en FP16: aproximadamente 17,4 MB.
- VRAM estimada en INT8: aproximadamente 8,7 MB; en INT4, en torno a 4,3 MB.
- Cabe sin problema en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, etc.), en CPU y en aceleradores moviles. El propio autor lo entreno en una NVIDIA Tesla T4 de 14,6 GB.
- El entrenamiento original se realizo en una Tesla T4 y en Google Colab Pro.
- Opciones de despliegue: transformers (pipeline `fill-mask`), exportacion a ONNX Runtime o TorchScript para inferencia en CPU o movil. No es un modelo de generacion, por lo que los servidores orientados a decodificacion (vLLM, TGI en modo generativo) no son su via natural de despliegue.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BypBERT-tiny-zh-v1 | 8,7 M | 128 | BERT encoder-only, 4 capas, hidden 256 | Apache 2.0 | Hugging Face |
| alibaba-pai/pai-bert-tiny-zh | no disponible (descrito como ultraligero) | no disponible | BERT encoder-only chino (equipo PAI de Alibaba) | no disponible | Hugging Face y ModelScope |
| google-bert/bert-base-chinese | no disponible | no disponible | BERT encoder-only (modelo base del que parte BypBERT) | no disponible | Hugging Face |

La informacion disponible no permite una comparacion cuantitativa con pai-bert-tiny-zh ni con bert-base-chinese: no se han facilitado sus parametros, contexto, licencia ni resultados de benchmarks en los datos de esta ficha. Los tres comparten la misma categoria (encoder chino para comprension), pero solo BypBERT-tiny-zh-v1 cuenta aqui con especificaciones y metricas internas verificables.

## Limitaciones y advertencias

- Capacidad de memorizacion de hechos muy limitada: en la prueba de enmascaramiento el modelo solo acierto 1 de 10 casos, por lo que no es adecuado para preguntas de conocimiento factual.
- No sirve para tareas generativas: al ser encoder-only no produce texto; no admite tool calling, agentes ni razonamiento multi-paso.
- Longitud de contexto muy corta (128 tokens): inadecuado para documentos largos o dialogos extensos.
- Preentrenamiento unicamente con MLM estandar, sin WWM ni MacBERT, lo que limita su calidad frente a variantes mas avanzadas.
- Solo entrenado en chino; no se declara soporte para otros idiomas.
- Ausencia de benchmarks estandar (GLUE/CLUE) y de evaluacion en tareas downstream: las metricas reportadas son pruebas internas del autor.
- Riesgo de sesgos heredados del corpus de Wikipedia en chino (sesgo tematico, de cobertura y de representacion).
- Riesgo de alucinacion o de predicciones incorrectas en contextos fuera de dominio, coherente con su tamano reducido.
- Licencia Apache 2.0, que permite uso comercial segun los terminos de dicha licencia; conviene revisar la licencia del modelo base (bert-base-chinese) si se redistribuye.
- Modelo con 0 descargas y 0 "likes" en el momento de redactar esta ficha, sin validacion por parte de la comunidad.
- No disponible: informacion sobre latencia, throughput y consumo energetico en inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eebyp/BypBERT-tiny-zh-v1
- Modelo base: https://huggingface.co/bert-base-chinese
- Alternativa comparable (Alibaba PAI): https://huggingface.co/alibaba-pai/pai-bert-tiny-zh
- Ficha de pai-bert-tiny-zh en ModelScope: https://www.modelscope.cn/models/pengzhendong/pai-bert-tiny-zh
- README de pai-bert-tiny-zh: https://huggingface.co/alibaba-pai/pai-bert-tiny-zh/blob/main/README.md
- Articulo divulgativo sobre pai-bert-tiny-zh: https://aichina.news/blog/meet-pai-bert-tiny-zh-alibabas-ultra-lightweight-answer-to-real-time-nh0bvk/
- ORCID del autor (Yiping Bai): https://orcid.org/0009-0004-2842-8241
