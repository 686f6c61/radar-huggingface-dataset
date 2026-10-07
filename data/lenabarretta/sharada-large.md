# lenabarretta/sharada-large

## Resumen

Sharada-large es un encoder de aproximadamente 397 millones de parámetros desarrollado por Lena Barretta (usuario lenabarretta de HuggingFace) que realiza clasificación zero-shot y toma de decisiones tipadas sobre texto en un único forward pass. No es un modelo generativo: recibe un texto, una pregunta y una lista de opciones, y devuelve una probabilidad para cada opción, sin generar ni parsear texto. Está construido sobre el encoder answerdotai/ModernBERT-large y se publica bajo licencia Apache 2.0.

Su rasgo distintivo es que las etiquetas forman parte de la entrada y no de los pesos, de modo que un conjunto de etiquetas con el que nunca fue entrenado sigue recibiendo respuesta. Admite tres tipos de pregunta (choice, scale y binary) y tres propiedades se cumplen por construcción, no por entrenamiento: el orden de las opciones no puede cambiar la respuesta, la puntuación de una opción no depende de qué otras opciones se ofrezcan, y el texto se lee una sola vez independientemente de cuántas preguntas se le hagan.

El modelo se entrenó con 488.991 ejemplos procedentes de 32 conjuntos de etiquetas públicos y se distribuye junto a la librería propia `sharada`, que permite ajuste fino con unos cientos de ejemplos etiquetados y calibración de temperatura por tarea. Es relevante para enrutado de tickets, clasificación con incertidumbre explícita y cualquier escenario donde se necesite una decisión acompañada de una probabilidad fiable en lugar de texto generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large), con ramas de opción y cabezas de clasificación; no es MoE ni SSM |
| Parametros totales | 396.882.945 (aproximadamente 397M) |
| Longitud de contexto | Hasta 256 tokens de texto, más 48 tokens para la pregunta y 12 tokens por opción |
| Tipos de cuantizacion | No se publican versiones cuantizadas. El autor indica que float16 en disco y float32 en memoria es un formato de almacenamiento, no cuantización |
| Idiomas soportados | no disponible (los conjuntos de entrenamiento son mayoritariamente en inglés; massive-intent aporta parte multilingüe, sin desglose publicado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16 en disco, float32 en memoria) |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-large, un encoder transformer de aproximadamente 395M de parámetros, y añade sobre él un esquema de decisión con ramas por opción. Cada opción se codifica leyendo el texto, la pregunta y la propia opción, y todas las ramas arrancan en la misma posición de identificador de posición, lo que garantiza matemáticamente invariancia al orden de las opciones e independencia entre opciones. La salida es una distribución de probabilidad sobre las opciones mediante un único forward pass. Los tipos de pregunta soportados son `choice` (etiquetas no ordenadas), `scale` (pasos ordenados) y `binary` (sí o no). El modelo ocupa 4,0 GB en el repositorio.

El entrenamiento usó 488.991 ejemplos agregados de 32 conjuntos de etiquetas públicos que cubren intenciones, temas, puntuaciones de reseñas, emoción, toxicidad, spam y entailment, durante 15.000 pasos con tamaño de lote 32, optimizador AdamW a 2e-05 con schedule coseno y pérdida de entropía cruzada. Los pesos publicados son los que mejor midieron en datos retenidos, en el paso 15.000 de 15.000; más allá de ese punto el autor indica que el modelo deja de responder mejor y solo aumenta su certeza. Durante el entrenamiento se barajaron las opciones, se mostraron con frecuencia subconjuntos muestreados de conjuntos largos de etiquetas y cada conjunto se preguntó con varias formulaciones de su pregunta. Seis conjuntos de etiquetas adicionales (arxiv-category, claim-veracity, massive-scenario, medical-pair, poem-tone, subjective) quedaron totalmente fuera del entrenamiento y solo se midieron. Las pruebas del repositorio verifican las tres propiedades invariantes sobre un modelo sin entrenar.

## Capacidades

- Clasificación zero-shot con etiquetas arbitrarias definidas en tiempo de inferencia, sin reentrenamiento.
- Toma de decisiones tipada en tres modalidades: `choice` (etiquetas no ordenadas), `scale` (escala ordenada, útil para puntuaciones de 1 a 5 estrellas) y `binary` (sí/no, spam/no spam, paráfrasis/no paráfrasis).
- Salida de una probabilidad calibrada por opción en un solo forward pass, con medida de confianza explícita (`d.confidence`) y vector completo de probabilidades (`d.probabilities`).
- Calibración de temperatura por tarea mediante el método `fit`, que retiene un 20% de los datos, aplica early stopping y ajusta una temperatura por conjunto de etiquetas.
- Ajuste fino con unos cientos de ejemplos etiquetados propios, orientado a construir enrutadores específicos de dominio.
- Procesamiento del texto una sola vez aunque se le formulen varias preguntas sobre el mismo documento.
- No soporta tool calling, function calling, agentes ni generación de texto, por su naturaleza de encoder de clasificación.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket, la pregunta "¿qué equipo debe gestionarlo?" y la lista de equipos (facturación, entrega de tarjeta, soporte técnico, cierre de cuenta), devolviendo la probabilidad de cada uno. La calibración permite derivar a revisión humana los casos con confianza baja.
- Moderación y filtrado de contenido: clasificación binaria de spam y de toxicidad con ECE de 0,005 en el caso de spam y 0,992 de exactitud, adecuada para filtros previos con umbral configurable.
- Análisis de sentimiento y satisfacción: con las escalas `scale` de 1 a 5 estrellas (app-stars, review-stars) o los conjuntos de emoción de 4 a 28 clases, para agregar opiniones de reseñas o encuestas.
- Clasificación temática de documentos: etiquetado de noticias por sección (news-section, 4 clases, 0,931 de exactitud) o por grupo de noticias (newsgroup, 20 clases), útil en sistemas de recomendación y archivado.
- Detección de intención en asistentes conversacionales: con hasta 151 intenciones simultáneas en clinc-intent (0,950 de exactitud) y 77 en banking-intent (0,898), puede actuar como clasificador de intención previo a un motor de diálogo.
- Verificación de afirmaciones y entailment: los conjuntos entailment y paraphrase permiten comprobar si una frase implica a otra o si dos textos son equivalentes, como paso de validación en pipelines de generación aumentada por recuperación.
- Construcción de enrutadores personalizados: ajustando con unos cientos de ejemplos propios, se puede especializar en taxonomías internas de una empresa sin reentrenar el encoder desde cero.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card del autor. Se midieron sobre ejemplos retenidos ofreciendo todas las etiquetas a la vez. "Trained on" indica cuántos ejemplos aportó ese conjunto al entrenamiento; "measured on", sobre cuántos ejemplos retenidos se calcula la exactitud. ECE es el error de calibración esperado sobre 15 bandas iguales y T es la temperatura ajustada. Las filas marcadas como unseen nunca se entrenaron. La tabla de la model card estaba truncada en la fuente consultada, por lo que se reproduce lo disponible.

| Conjunto de etiquetas | Opciones | Tipo | Ejemplos de entrenamiento | Ejemplos de medida | Exactitud | Log loss | ECE | T |
|---|---|---|---|---|---|---|---|---|
| clinc-intent | 151 | choice | 24.000 | 480 | 0,950 | 0,226 | 0,022 | 0,891 |
| banking-intent | 77 | choice | 19.986 | 480 | 0,898 | 0,380 | 0,019 | 1,122 |
| massive-intent | 59 | choice | 23.028 | 480 | 0,879 | 0,418 | 0,033 | 1,26 |
| question-type-fine | 50 | choice | 10.904 | 240 | 0,904 | 0,381 | 0,042 | 1,587 |
| fine-emotion | 28 | choice | 18.000 | 360 | 0,575 | 1,235 | 0,062 | 1,122 |
| newsgroup | 20 | choice | 14.592 | 292 | 0,726 | 0,798 | 0,052 | 1,26 |
| entity-type | 14 | choice | 18.000 | 360 | 0,997 | 0,016 | 0,005 | 0,891 |
| forum-topic | 10 | choice | 18.000 | 360 | 0,789 | 0,677 | 0,058 | 1,0 |
| question-type | 6 | choice | 10.904 | 240 | 0,963 | 0,110 | 0,015 | 1,414 |
| emotion | 6 | choice | 15.000 | 300 | 0,910 | 0,189 | 0,034 | 1,335 |
| app-stars | 5 | scale | 15.000 | 300 | 0,717 | 0,791 | 0,049 | 1,0 |
| review-stars | 5 | scale | 24.000 | 480 | 0,658 | 0,701 | 0,055 | 1,0 |
| sentence-tone | 5 | scale | 15.000 | 300 | 0,637 | 0,885 | 0,100 | 1,26 |
| news-section | 4 | choice | 18.000 | 360 | 0,931 | 0,160 | 0,027 | 0,891 |
| tweet-emotion | 4 | choice | 6.514 | 240 | 0,879 | 0,345 | 0,058 | 1,059 |
| entailment-short | 3 | scale | 18.000 | 360 | 0,906 | 0,262 | 0,024 | 0,944 |
| entailment | 3 | scale | 24.000 | 480 | 0,873 | 0,346 | 0,027 | 1,059 |
| tweet-sentiment | 3 | scale | 15.000 | 300 | 0,713 | 0,669 | 0,049 | 1,335 |
| spam | 2 | binary | 10.034 | 240 | 0,992 | 0,036 | 0,005 | 1,414 |
| product-tone | 2 | scale | 15.000 | 300 | 0,960 | 0,092 | 0,019 | 1,059 |
| movie-verdict | 2 | scale | 15.000 | 300 | 0,957 | 0,123 | 0,031 | 1,122 |
| paraphrase | 2 | binary | 15.000 | 300 | 0,950 | 0,150 | 0,029 | 1,059 |
| short-verdict | 2 | scale | 12.000 | 240 | 0,950 | 0,150 | 0,016 | 1,122 |
| answers-question | 2 | binary | 18... (truncado en la fuente) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estandarizados adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no serían aplicables dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximación derivada del recuento de parámetros, no publicada por el autor): alrededor de 1,6 GB solo para pesos en float32 y unos 0,8 GB en float16; con activaciones y overhead, un rango práctico de 2 a 3 GB en float32 y de 1,5 a 2 GB en float16 para lotes pequeños. El tamaño real dependerá del tamaño de lote y del número de opciones.
- Cabe en GPU de consumo: cualquier GPU con 4 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, RTX 3060, RTX 4090, etc.). También es viable en CPU para cargas de baja concurrencia.
- GPU recomendadas para producción: T4 y L4 para servicio de bajo coste, A10G o L40S para concurrencia media, A100 o H100 para lotes grandes y alto throughput. En consumer, una RTX 4090 ofrece el mejor margen para lotes amplios.
- Opciones de despliegue: la librería propia `sharada` es la vía indicada por el autor (`DecisionModel.from_pretrained`). Al apoyarse en ModernBERT, los pesos safetensors son cargables con Transformers, lo que permite servir mediante TGI, TorchServe o exportación a ONNX Runtime. vLLM, llama.cpp y Ollama no son aplicables: el modelo no es generativo y no se publican pesos GGUF.
- Latencia: 26,6 ms por decisión (pregunta) según el autor, aproximadamente 37 decisiones por segundo por instancia con procesamiento secuencial. El hardware sobre el que se midió esa cifra no se especifica. Rendimiento en lotes (throughput) no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lenabarretta/sharada-large | ~397M | 256 tokens de texto + pregunta y opciones | Decisiones tipadas con probabilidades calibradas y etiquetas en la entrada | Apache 2.0 | HuggingFace, librería `sharada` |
| answerdotai/ModernBERT-large (modelo base) | ~395M | 8.192 tokens | Encoder de propósito general; requiere cabeza de clasificación y reentrenamiento por tarea | Apache 2.0 | HuggingFace |
| Clasificadores tipo NLI zero-shot (por ejemplo BART-large-MNLI, DeBERTa-v3-large-MNLI) | ~400-435M | 512-1.024 tokens | Clasificación zero-shot vía entailment; opciones formuladas como hipótesis | MIT en los casos más habituales | HuggingFace |

La ventaja diferencial de sharada-large frente al encoder base es que no requiere reentrenar por cada conjunto de etiquetas, y frente a los clasificadores basados en entailment es la invariancia al orden y la independencia entre opciones garantizadas por diseño, además de la calibración publicada por conjunto. Los valores concretos de parámetros, contexto y licencia de los dos últimos modelos son datos de referencia generales y no se han verificado contra sus model cards en esta búsqueda; conviene comprobarlos antes de citarlos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y no debe usarse como base para agentes.
- La longitud de entrada está acotada a 256 tokens de texto, 48 para la pregunta y 12 por opción, muy por debajo de los 8.192 tokens que soporta el encoder ModernBERT-large subyacente.
- El idioma no está declarado. Los conjuntos de entrenamiento son mayoritariamente en inglés, con aporte multilingüe parcial vía massive-intent, por lo que el rendimiento fuera del inglés no está verificado.
- Riesgo de alucinación en el sentido de asignar una probabilidad alta a una opción incorrecta cuando el texto o las etiquetas quedan fuera de la distribución de entrenamiento. Puede mitigarse con la confianza devuelta y con umbrales de derivación a revisión humana.
- La calibración publicada es por conjunto de etiquetas y con una temperatura ajustada sobre los mismos datos retenidos; en tareas nuevas la calibración debe reajustarse con ejemplos propios.
- Algunas filas de la tabla de evaluación se midieron sobre muy pocos ejemplos (240-480), por lo que un único cambio de respuesta mueve la métrica de forma apreciable, según advierte el propio autor.
- Rendimiento bajo en conjuntos de muchas clases y matiz subjetivo: fine-emotion (28 clases) obtiene 0,575 de exactitud y sentence-tone 0,637.
- El autor señala que entrenar más allá de los 15.000 pasos no mejora la respuesta y solo incrementa la certeza, lo que sugiere un techo de aprendizaje con esta configuración.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de ModernBERT-large conviene conservar los avisos de atribución correspondientes.
- El modelo tiene un historial público muy limitado (24 descargas y 1 like en el momento de la consulta), por lo que no existe validación independiente de terceros.
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (únicamente recetas de cocina sin relación), de modo que no hay fuentes externas que corroboren los datos del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lenabarretta/sharada-large
- Repositorio de código, ejemplos y ejecución de entrenamiento: https://github.com/LenaBarretta/sharada
- Notas de diseño y experimentos: https://lenatriestounderstand.com/notes/llm/024-rlcr/
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Instalación de la librería: `pip install sharada` (URL de PyPI no verificada en la búsqueda)
- Resultados de búsqueda web sobre el modelo: no se encontraron fuentes relevantes
