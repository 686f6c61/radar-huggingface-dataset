# lenabarretta/sharada-multilingual-small

## Resumen

Sharada-multilingual-small es un codificador (encoder) de 141 millones de parametros desarrollado por el usuario lenabarretta, afinado a partir de jhu-clsp/mmBERT-small. No es un modelo generativo: recibe un texto, una pregunta y una lista de opciones (etiquetas) y devuelve, en un unico forward pass, una probabilidad calibrada para cada opcion. El problema que resuelve es la clasificacion y enrutamiento con conjuntos de etiquetas que cambian en tiempo de inferencia (intenciones, temas, categorias de soporte), sin necesidad de reentrenar la cabeza de clasificacion.

La innovacion principal es que las etiquetas forman parte de la entrada y no de los pesos, de modo que un conjunto de opciones nunca visto durante el entrenamiento sigue recibiendo una respuesta. El modelo garantiza por construccion tres propiedades: el orden de las opciones no altera la respuesta, la puntuacion de una opcion no depende de que otras se ofrezcan, y el texto se lee una sola vez aunque se le hagan varias preguntas.

Se distribuye bajo licencia Apache 2.0, con pesos en safetensors, y esta pensado para reajuste (fine-tuning) ligero sobre unos cientos de ejemplos propios etiquetados, con una fase posterior de ajuste de temperatura por tarea. Su contexto util es de hasta 256 tokens de texto mas 48 para la pregunta y 12 por opcion, con una latencia medida de 21,8 ms por decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT); modelo base jhu-clsp/mmBERT-small |
| Parametros totales | 140.790.145 (141M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 256 tokens de texto + 48 para la pregunta + 12 por opcion |
| Tipos de cuantizacion | No se ofrecen cuantizaciones; pesos en float16 en disco y float32 en memoria |
| Idiomas soportados | Multilingue segun la denominacion del modelo y su base mmBERT; lista exacta de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (float16 en disco) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de la familia ModernBERT, heredado de jhu-clsp/mmBERT-small (una variante multilingue de ModernBERT). El modelo no genera texto: produce una probabilidad por opcion en un solo paso hacia delante. Cada rama de opcion arranca en el mismo identificador de posicion, lo que impide que el orden de las etiquetas cambie el resultado, y cada opcion se puntua leyendo unicamente el texto, la pregunta y ella misma. El modelo contempla tres tipos de pregunta: `choice` (etiquetas no ordenadas), `scale` (pasos ordenados) y `binary` (si o no).

El entrenamiento uso 663.357 ejemplos procedentes de 35 conjuntos de etiquetas publicos (intenciones, temas, puntuaciones de resenas, emocion, toxicidad, spam y entailment), durante 15.000 pasos de tamano de lote 32, con optimizador AdamW, learning rate 3e-05, schedule coseno y perdida de entropia cruzada. Los pesos publicados son los que mejor rindieron en datos retenidos, en el paso 15.000 de 15.000; mas alla de ese punto el modelo deja de responder mejor y solo aumenta su certeza. Durante el entrenamiento se barajaron las opciones, se mostraron con frecuencia subconjuntos muestreados de etiquetas largas y cada conjunto se consulto con varias formulaciones de su pregunta, de forma que el modelo aprende a leer opciones y pregunta en lugar de sus posiciones. Siete conjuntos de etiquetas (arxiv-category, claim-veracity, massive-scenario, medical-pair, poem-tone, subjective y topic-unseen-languages) quedaron completamente fuera del entrenamiento y solo se usaron para medir.

## Capacidades

- Clasificacion de texto de un solo paso con conjuntos de etiquetas definidos en tiempo de inferencia, sin reentrenamiento.
- Clasificacion zero-shot sobre etiquetas nunca vistas durante el entrenamiento.
- Tres modalidades de pregunta: eleccion entre etiquetas no ordenadas, escalas ordenadas y decisiones binarias.
- Salida de una probabilidad calibrada por opcion en un unico forward pass (sin generacion ni parseo posterior).
- Calibracion de confianza con error de calibracion esperado (ECE) bajo en la mayoria de los conjuntos evaluados.
- Enrutamiento y toma de decisiones con puntuaciones interpretables (util para derivar umbrales o derivar a un humano).
- Capacidad multilingue heredada de mmBERT, aunque la lista concreta de idiomas no esta documentada.
- Reajuste ligero integrado: metodo `fit(examples)` con retencion del 20 por ciento, parada temprana y ajuste de temperatura por tarea.
- Reutilizacion del mismo texto para varias preguntas distintas sin releerlo.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso, ya que es un encoder de clasificacion.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un mensaje de cliente, el modelo devuelve la probabilidad de cada cola ("facturacion", "entrega de tarjeta", "soporte tecnico"), permitiendo derivar automaticamente con una confianza conocida y umbral configurable.
- Moderacion de contenido: con preguntas del tipo `binary` (toxico / no toxico), clasifica comentarios con probabilidad calibrada, lo que permite fijar umbrales de actuacion en funcion del coste de cada error.
- Etiquetado de resenas y encuestas: mediante preguntas tipo `scale`, asigna puntuaciones de estrellas o tonos, util para analitica de opinion a escala.
- Clasificacion de intenciones en asistentes conversacionales: admite conjuntos grandes de intenciones (se reportan 151 intenciones de clinc en una sola pregunta) en una sola lectura del turno del usuario.
- Triaje de correo o mensajeria: deteccion de spam y clasificacion por tema mediante conjuntos de etiquetas configurables por despliegue.
- Anonimizado y pre-etiquetado de corpus: usar el modelo como etiquetador inicial para acelerar la revision humana antes de un ajuste fino propio.
- Enrutamiento entre modelos generativos: como clasificador barato que decide a que modelo o herramienta derivar una consulta antes de invocar un LLM mayor.
- Verificacion de entailment y coherencia: con preguntas tipo `scale`, evaluar si un texto implica, contradice o es neutral respecto a otro, util en pipelines de validacion.

## Benchmarks y rendimiento

Resultados medidos sobre ejemplos retenidos, ofreciendo todas las etiquetas a la vez. La columna "trained on" refleja lo que ese conjunto aporto al entrenamiento (un guion indica que no se entreno con el); "measured on" es el numero de ejemplos retenidos sobre los que se calcula cada metrica. ECE es el error de calibracion esperado sobre 15 bandas iguales y T la temperatura ajustada por conjunto.

| Conjunto | Opciones | Tipo | trained on | measured on | Accuracy | Log loss | ECE | T |
|---|---|---|---|---|---|---|---|---|
| clinc-intent | 151 | choice | — | 480 | 0.844 | 0.551 | 0.047 | 0.944 |
| banking-intent | 77 | choice | — | 480 | 0.835 | 0.583 | 0.029 | 1.059 |
| massive-intent | 59 | choice | — | 480 | 0.865 | 0.488 | 0.026 | 1.26 |
| question-type-fine | 50 | choice | — | 240 | 0.883 | 0.387 | 0.030 | 1.122 |
| massive-intent-multi | 35 | choice | — | 1.440 | 0.834 | 0.617 | 0.023 | 1.414 |
| fine-emotion | 28 | choice | — | 360 | 0.603 | 1.345 | 0.095 | 1.122 |
| newsgroup | 20 | choice | — | 292 | 0.644 | 1.028 | 0.062 | 1.26 |
| entity-type | 14 | choice | — | 360 | 0.997 | 0.012 | 0.003 | 0.794 |
| forum-topic | 10 | choice | — | 360 | 0.728 | 0.797 | 0.061 | 0.944 |
| topic-multi | 7 | choice | — | 660 | 0.756 | 0.706 | 0.054 | 2.119 |
| question-type | 6 | choice | — | 240 | 0.967 | 0.100 | 0.016 | 1.059 |
| emotion | 6 | choice | — | 300 | 0.887 | 0.275 | 0.043 | 1.414 |
| app-stars | 5 | scale | — | 300 | 0.687 | 0.863 | 0.052 | 1.0 |
| review-stars | 5 | scale | — | 480 | 0.640 | 0.807 | 0.060 | 0.944 |
| sentence-tone | 5 | scale | — | 300 | 0.550 | 1.048 | 0.054 | 1.122 |
| news-section | 4 | choice | — | 360 | 0.928 | 0.214 | 0.022 | 0.944 |
| tweet-emotion | 4 | choice | — | 240 | 0.808 | 0.475 | 0.068 | 1.059 |
| entailment-short | 3 | scale | — | 360 | 0.850 | 0.449 | 0.037 | 1.0 |
| entailment | 3 | scale | — | 480 | 0.779 | 0.546 | 0.046 | 1.189 |
| entailment-multi | 3 | scale | — | 1.428 | 0.691 | 0.685 | 0.032 | 1.335 |
| tweet-sentiment | 3 | scale | — | 300 | 0.673 | 0.738 | 0.077 | 1.122 |
| spam | 2 | binary | — | 240 | 0.992 | 0.019 | 0.010 | 1.0 |
| product-tone | 2 | scale | — | 300 | 0.927 | 0.176 | 0.018 | 1.059 |
| toxic-comment | 2 | binary | — | 300 | 0.923 | 0.200 | 0.028 | 1.122 |
| movie-verdict | 2 | (fila truncada en la fuente) | — | — | — | — | — | — |

Nota: la model card original incluye una ultima fila (movie-verdict) que aparece truncada en la informacion disponible, por lo que no se reproducen sus valores. La model card tambien menciona siete conjuntos retenidos por completo (arxiv-category, claim-veracity, massive-scenario, medical-pair, poem-tone, subjective, topic-unseen-languages), pero sus metricas no se detallan en la informacion proporcionada.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 282 MB en float16 (formato en disco) y 564 MB en float32 (formato en memoria), para 141M de parametros.
- VRAM estimada para inferencia: cabe con holgura en cualquier GPU de consumo; con margen para activaciones y lote pequeno, unos 1-2 GB de VRAM son suficientes en float32.
- GPU recomendadas: cualquier GPU moderna de consumo (RTX 3060, 4060, 4090) es mas que suficiente; en entornos de servidor, una T4, L4 o incluso CPU dedicada pueden atender cargas moderadas. No requiere A100 ni H100.
- Despliegue: la via prevista es la libreria `sharada` (`pip install sharada`), con `DecisionModel.from_pretrained(...)`. En la informacion disponible no se documentan rutas de despliegue alternativas como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia: 21,8 ms por pregunta segun la propia model card. El texto se lee una sola vez, de modo que plantear varias preguntas sobre el mismo texto reutiliza esa lectura.
- Throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos publicados en la informacion proporcionada. La comparacion estructural se limita a los siguientes terminos:

| Modelo | Parametros | Naturaleza | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sharada-multilingual-small | 141M | Encoder de decision zero-shot (sobre mmBERT-small) | 256 tokens de texto + pregunta y opciones | Apache 2.0 | HuggingFace, via libreria sharada |
| jhu-clsp/mmBERT-small (base) | No disponible | Encoder multilingue ModernBERT | No disponible | No disponible | HuggingFace |
| Encoders clasicos tipo BERT-base / DeBERTa-v3 | ~110M-180M | Encoder de clasificacion con cabeza fija | 512 tokens tipicamente | Variable | Amplia |

La diferencia principal frente a un encoder de clasificacion convencional es que sharada no fija las etiquetas en los pesos, sino que las recibe en la entrada, lo que permite clasificacion zero-shot y enrutamiento con conjuntos de etiquetas variables sin reentrenar. Datos numericos de rendimiento frente a alternativas: no disponibles.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso. Solo clasifica y puntua opciones.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea con confianza alta; se recomienda usar la probabilidad calibrada y ajustar temperatura por tarea.
- El rendimiento depende fuertemente del conjunto de etiquetas: en conjuntos con etiquetas escasamente diferenciadas el accuracy baja (por ejemplo, 0.550 en sentence-tone o 0.603 en fine-emotion), mientras que en tareas bien delimitadas es alto (0.997 en entity-type, 0.992 en spam).
- La calibracion (ECE) empeora en algunos conjuntos (0.095 en fine-emotion, 0.077 en tweet-sentiment), por lo que las probabilidades deben tratarse siempre como estimaciones dependientes de la tarea.
- Algunas metricas se calculan sobre muestras retenidas muy pequenas (240 ejemplos en varios conjuntos), por lo que un solo cambio de respuesta desplaza el accuracy un punto completo y la lectura debe hacerse con cautela.
- Limitacion de contexto: solo 256 tokens de texto, mas 48 para la pregunta y 12 por opcion; textos mas largos requieren truncado o particionado.
- Idiomas: aunque el modelo base mmBERT es multilingue, la lista exacta de idiomas soportados y su rendimiento por idioma no estan documentados.
- No se han detallado sesgos conocidos en la informacion proporcionada; al entrenarse sobre 35 conjuntos publicos de dominios muy distintos, es previsible que herede los sesgos de esos corpus.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los datos de entrenamiento si se redistribuye el modelo.
- El metodo `fit` espera ejemplos etiquetados propios; su calidad en produccion depende de disponer de unas pocas centenas de ejemplos representativos de la tarea objetivo.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lenabarretta/sharada-multilingual-small
- Repositorio de codigo, ejemplos y ejecucion de entrenamiento: https://github.com/LenaBarretta/sharada
- Notas de diseno y experimentos (RLCR): https://lenatriestounderstand.com/notes/llm/024-rlcr/
- Modelo base: jhu-clsp/mmBERT-small (referenciado como `base_model` en la model card)
