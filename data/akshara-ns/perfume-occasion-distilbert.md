# akshara-ns/perfume-occasion-distilbert

## Resumen

Perfume-occasion-distilbert es un clasificador de texto en inglés desarrollado por el usuario de HuggingFace akshara-ns. Se trata de un ajuste fino (fine-tuning) de distilbert-base-uncased, un transformer encoder de 6 capas y 66.956.548 parámetros, sobre el conjunto de datos ypolatog/perfume-occasion-texts. El modelo lee una descripción corta de una fragancia (entre 147 y 261 caracteres) y predice a qué ocasión se ajusta, entre cuatro clases: everyday, going out, formal y casual-relaxed.

Su relevancia es acotada y de carácter metodológico: no es un modelo de producción, sino un ejercicio de curso (etiqueta 24-679) que sirve como referencia de fine-tuning sobre un conjunto pequeño con aumento de datos agresivo, y como la pata "fine-tuning" de una comparación frente a prompting. El propio autor declara explícitamente que no está pensado para etiquetado de producto, recomendación retail ni ninguna superficie visible para un comprador, porque aprendió el vocabulario de una única persona y su noción particular de lo que significa "formal".

Técnicamente es un modelo pequeño (0,3 GB de repositorio, ~67 M de parámetros), entrenado en inglés con truncación a 128 tokens, licencia Apache 2.0 y pesos en safetensors. Su rendimiento sobre las 25 descripciones originales de test es de 0,520 de accuracy y 0,392 de macro-F1, por debajo de una línea base de TF-IDF con regresión logística (0,64 y 0,486) sobre el mismo conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, destilado de bert-base-uncased |
| Parametros totales | 66.956.548 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens en entrenamiento (truncacion); limite arquitectonico de distilbert-base-uncased: 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos sin cuantizar) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, biblioteca transformers |
| Modelo base | distilbert-base-uncased |
| Tarea (pipeline) | text-classification |
| Etiquetas de salida | everyday, going out, formal, casual-relaxed |
| Dataset de entrenamiento | ypolatog/perfume-occasion-texts (CC BY 4.0) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 13 / 0 |
| Fecha de creacion / actualizacion | 2026-09-22 / 2026-09-22 |

## Arquitectura y entrenamiento

La base es distilbert-base-uncased, un transformer encoder de 6 capas y 66 M de parámetros obtenido por destilación de conocimiento desde bert-base-uncased reduciendo a la mitad el número de capas. Sobre ella se añade una cabeza de clasificación de 4 clases. El preprocesado usa tokenización WordPiece en minúsculas, truncación a 128 tokens y padding dinámico por lote; no hay limpieza adicional y las erratas de las variantes de entrenamiento se conservan de forma deliberada.

Los datos de partida son 100 descripciones fuente escritas por un compañero de clase, divididas de forma estratificada por clase en 60 de entrenamiento, 15 de validación y 25 de test con semilla 24679. El autor las expandió a 1.343 filas mediante cuatro recetas de aumento: charswap, chardelete, wordswap y synonym, dando un conjunto de entrenamiento de 817 filas (60 originales + 757 variantes). El rebalanceo de clases se consiguió con ese aumento, no con datos reales. La configuración de entrenamiento es: AdamW con weight decay 0,01, scheduler lineal con 10 % de warm-up, batch de 16, precisión mixta de 16 bits, semilla 24679 y hasta 8 épocas con early stopping por pérdida de validación (paciencia 2). Se ejecutaron 4 épocas con una tasa de aprendizaje de 2e-05, elegida por barrido entre 2e-05, 3e-05 y 5e-05; la ejecución seleccionada tardó 0,7628 minutos en GPU. No se aplicó RLHF ni DPO: es entrenamiento supervisado estándar con entropía cruzada.

## Capacidades

- Clasificación de texto en inglés con 4 etiquetas mutuamente excluyentes: everyday, going out, formal y casual-relaxed.
- Entrada de descripciones cortas de fragancias (longitud observada de 147 a 261 caracteres; se truncan a 128 tokens).
- Inferencia muy ligera: ~67 M de parámetros, ejecutable en CPU.
- Integración directa con el pipeline text-classification de transformers.
- Etiquetado como endpoints_compatible y text-embeddings-inference, lo que permite servirlo con Text Embeddings Inference y con endpoints gestionados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No dispone de modo de razonamiento explícito (thinking mode).
- No es multimodal: no procesa visión ni audio.
- Multilingüismo: únicamente inglés; no hay evidencia de transferencia a otros idiomas.
- No es un modelo generativo: no produce texto libre, solo una distribución sobre 4 clases.

## Casos de uso

- Material docente de fine-tuning: sirve como ejemplo reproducible de ajuste fino de un encoder pequeño sobre un dataset minúsculo y aumentado, con configuración de hiperparámetros y curvas de validación documentadas en la model card.
- Comparación fine-tuning frente a prompting: el propio autor lo usa como la pata ajustada de una comparación con prompting (Q4) evaluada sobre las mismas 25 descripciones originales mediante splits.csv, lo que permite estudiar cuándo un clasificador ajustado supera o no a un LLM con instrucciones.
- Línea base rápida para clasificación de textos de perfumería: dado su coste computacional ínfimo, permite obtener un punto de referencia en segundos antes de invertir en anotación o en modelos mayores.
- Experimentos de robustez ante erratas: la model card incluye tasas de cambio de predicción frente a variantes sintéticas (chardelete, charswap, synonym, wordswap), útil como banco de pruebas de estabilidad textual.
- Etiquetado interno de bajo coste en CPU: para prototipos de catálogos privados donde no se requiere precisión alta, el modelo cabe en memoria y se ejecuta sin GPU.
- Estudio de sesgos y de límites de los datos aumentados: permite medir hasta qué punto el aumento sintético compensa tener solo 60 descripciones reales de entrenamiento.
- No se recomienda su uso en productos de cara al público, sistemas de recomendación retail ni etiquetado automático de catálogo comercial, tal como advierte el propio autor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados), sobre las 25 descripciones originales de test:

| Metrica | Valor | IC bootstrap 95 % |
|---|---|---|
| Accuracy | 0,520 | 0,320 – 0,720 |
| Macro-F1 | 0,392 | 0,215 – 0,537 |

Comparación con líneas base sobre las mismas 25 descripciones:

| Modelo | Accuracy | Macro-F1 |
|---|---|---|
| Clase mayoritaria | 0,40 | 0,143 |
| TF-IDF + regresion logistica | 0,64 | 0,486 |
| DistilBERT ajustado (este modelo) | 0,52 | 0,392 |

Metricas por clase:

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| everyday | 0,286 | 0,286 | 0,286 | 7 |
| going out | 0,692 | 0,900 | 0,783 | 10 |
| formal | 0,000 | 0,000 | 0,000 | 3 |
| casual-relaxed | 0,667 | 0,400 | 0,500 | 5 |
| macro avg | 0,411 | 0,396 | 0,392 | 25 |
| weighted avg | 0,490 | 0,520 | 0,493 | 25 |

Matriz de confusion (real -> predicho):

| Real | Predicho | Numero |
|---|---|---|
| casual-relaxed | everyday | 3 |
| formal | going out | 2 |
| everyday | going out | 2 |
| everyday | formal | 2 |
| going out | everyday | 1 |
| formal | everyday | 1 |
| everyday | casual-relaxed | 1 |

Robustez ante erratas (variantes sinteticas de test, nunca usadas en entrenamiento):

| Tipo de variante | Variantes | Tasa de cambio de prediccion | Accuracy |
|---|---|---|---|
| chardelete | 82 | 0,195 | 0,451 |
| charswap | 82 | 0,146 | 0,439 |
| synonym | 60 | 0,050 | 0,450 |
| wordswap | 81 | 0,012 | 0,407 |

Barrido de tasa de aprendizaje (validacion, mejor checkpoint de cada ejecucion):

| Learning rate | Val loss | Val macro-F1 | Val accuracy | Epocas | Parada temprana | Minutos |
|---|---|---|---|---|---|---|
| 2e-05 | 0,8831 | 0,5173 | 0,6667 | 4 | si | 0,7628 |
| 5e-05 | 1,0729 | 0,4452 | 0,5333 | 3 | si | 0,4440 |
| 3e-05 | 1,1361 | 0,4735 | 0,6000 | 4 | si | 0,8277 |

## Requisitos de hardware

- VRAM estimada: ~268 MB en fp32, ~134 MB en fp16 y ~67 MB en int8, solo para los pesos; con activaciones y batch pequeño el consumo total se mantiene por debajo de 1 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, T4, e incluso en GPUs integradas.
- GPU de datacenter (A100, H100) sobredimensionadas para este modelo; solo tendrían sentido para procesar lotes masivos en paralelo.
- Ejecutable en CPU con latencias de milisegundos por muestra a batch 1 para entradas de hasta 128 tokens.
- Opciones de despliegue: pipeline de transformers, Text Embeddings Inference (etiqueta text-embeddings-inference), endpoints gestionados de HuggingFace (endpoints_compatible) y cualquier servidor compatible con transformers.
- No se publican pesos en GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia no documentada por el autor.
- Latencia y throughput: no disponible (no se publican mediciones de inferencia). El unico dato temporal de la model card es el tiempo de entrenamiento de la mejor ejecucion: 0,7628 minutos en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (25 descripciones) | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| perfume-occasion-distilbert (este) | 66.956.548 | 128 tokens en entrenamiento (512 maximo arquitectonico) | 0,520 | 0,392 | Apache 2.0 | HuggingFace, safetensors |
| TF-IDF + regresion logistica (linea base del autor) | no aplica (modelo lineal disperso) | no aplica | 0,640 | 0,486 | no disponible | implementacion propia, no publicada como modelo |
| Clase mayoritaria (linea base del autor) | no aplica | no aplica | 0,400 | 0,143 | no aplica | no aplica |
| distilbert-base-uncased sin ajustar | 66.955.008 en el checkpoint base | 512 tokens | no disponible | no disponible | Apache 2.0 | HuggingFace |

No se han encontrado en la busqueda web modelos comparables de clasificacion de ocasion de perfumes; el unico contraste publicado es el del propio autor frente a las lineas base anteriores.

## Limitaciones y advertencias

- Tamano muestral real: solo 60 descripciones fuente para entrenamiento. El tamano de muestra efectivo es el numero de descripciones reales, no las ~800 filas aumentadas.
- Clase formal infrarrepresentada: 13 descripciones en todo el conjunto, 8 en entrenamiento y 3 en test. Su F1 de 0,000 no es interpretable; cualquier metrica de esa clase es poco fiable por falta de soporte.
- Fronteras difusas entre clases: everyday y casual-relaxed son vecinas, igual que going out y formal. Parte del desacuerdo es irreducible y limita el techo alcanzable por cualquier modelo.
- Intervalos de confianza amplios: con 25 ejemplos de test, el IC del 95 % de la accuracy va de 0,320 a 0,720. Deben citarse los intervalos, no las estimaciones puntuales.
- Inferior a una linea base trivial: una regresion logistica sobre TF-IDF supera al modelo ajustado en accuracy (0,64 frente a 0,52) y en macro-F1 (0,486 frente a 0,392) sobre el mismo test.
- Sensibilidad a erratas: entre el 14,6 % y el 19,5 % de las variantes por intercambio o borrado de caracteres cambian la prediccion respecto al texto original. La augmentacion con erratas no elimino esta fragilidad.
- Sesgo de anotador unico: el modelo interioriza el vocabulario de fragancias y el criterio de "formal" de una sola persona, no una nocion general.
- Idioma: solo ingles. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Contexto limitado a 128 tokens en entrenamiento; entradas mas largas se truncan y pueden perder informacion relevante.
- Uso comercial: la licencia del modelo es Apache 2.0, pero el dataset de origen es CC BY 4.0 y exige atribucion. Ademas, el autor desaconseja explicitamente su uso en etiquetado de producto, recomendacion retail o cualquier superficie visible para el comprador.
- Sin datos de produccion: no hay pesos cuantizados, ni mediciones de latencia, ni evaluacion fuera del conjunto de 25 ejemplos.
- La model card original se corta en la ultima limitacion ("A season-and-not"), por lo que podria contener advertencias adicionales no recogidas aqui.
- Los benchmarks son declarados por el autor y estan marcados como no verificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akshara-ns/perfume-occasion-distilbert
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Dataset de entrenamiento ypolatog/perfume-occasion-texts: https://huggingface.co/datasets/ypolatog/perfume-occasion-texts
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo: los enlaces obtenidos corresponden a directorios mayoristas de moda y marroquineria italiana (viamadeinitaly.com, italianmodab2b.com, ingrossoborse.com, italianmoda.com, erabags.com) y no guardan relacion con el modelo. No se dispone de paper, blog tecnico, repositorio ni demo adicionales.
