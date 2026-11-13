# prayasabhinav/aadha

## Resumen

aadha es un clasificador de texto de cuatro clases construido por Prayas Abhinav mediante el ajuste fino de `microsoft/MiniLM-L12-H384-uncased`. Su tarea es asignar a cada frase una de cuatro marcas: ruido no deseado (0), "buen ruido" o escritura con abstraccion y capas de significado (1), historia o significado llano (2) y "moneda comun" o frase hecha (3). El modelo no genera texto: solo etiqueta, y es el codigo de la aplicacion el que interpreta esas marcas. Se presenta como un ejemplo de NSM (Narrow Small Model), un modelo deliberadamente estrecho en su respuesta pero no necesariamente pequeno en parametros.

Con 33,36 millones de parametros y un contexto de 96 tokens por frase, aadha es un modelo de investigacion y experimentacion mas que una herramienta de produccion. Su interes radica en la aproximacion: un clasificador linguistico muy acotado, entrenado con etiquetas generadas por Claude y evaluado contra anotaciones humanas previas al entrenamiento, con un adaptador LoRA adicional ("reflect") para textos argumentativos. La model card es inusualmente honesta sobre sus limites, incluyendo los casos en los que modelos alojados comerciales lo igualan o superan.

La relevancia actual es limitada pero concreta: sirve como referencia para quien quiera construir clasificadores estrechos con MiniLM, para estudiar el uso de etiquetas sinteticas en tareas subjetivas y para analizar como se comporta un modelo pequeno frente a fronteras semanticas difusas como la distincion entre abstraccion genuina y sinsentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), base `microsoft/MiniLM-L12-H384-uncased` con cabeza de clasificacion de 4 clases |
| Parametros totales | 33.361.540 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 96 tokens por frase |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 (pesos y model card); codigo bajo AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

aadha parte de MiniLM-L12-H384-uncased, un transformer encoder de 12 capas y 384 dimensiones ocultas, al que se le sustituye la cabeza original por una nueva cabeza de cuatro vias. El entrenamiento consistio en tres pasadas con tasa de aprendizaje 5e-5, tamano de lote 16, sobre tres semillas cuyos pesos se promedian en uno solo (tecnica de "souping"). Las frases se truncan o procesan hasta 96 tokens. Los datos de entrenamiento se generaron con los scripts del repositorio (`gen.py` y los constructores de filas), y las etiquetas corresponden a la lectura de Claude sobre esas filas, no a anotaciones humanas del autor.

El modelo se publica en la version denominada "o4x3" junto con el adaptador "reflect", un LoRA entrenado sobre el modelo base para piezas argumentativas o reflexivas. El autor indica que el adaptador no se selecciona automaticamente: la eleccion entre el modelo base y el adaptador recae en el usuario. Las filas de entrenamiento no se han publicado. La evaluacion se hizo sobre conjuntos anotados manualmente por el autor antes de que ningun modelo los viera, lo que reduce el riesgo de contaminacion en la medicion, aunque el entrenamiento use etiquetas de un modelo comercial.

## Capacidades

- Clasificacion de frases en cuatro categorias discretas: ruido no deseado, buen ruido (abstraccion con contenido argumentable), historia (significado llano) y moneda comun (frases hechas o dichos).
- Procesamiento por frase individual, sin generacion de texto.
- Adaptador LoRA "reflect" para clasificar escritura argumentativa o reflexiva.
- Integracion con la libreria `transformers` y con `text-embeddings-inference` segun los tags del repositorio.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No soporta tool calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Analisis estilistico de textos: el modelo permite etiquetar cada frase de un ensayo o articulo y calcular la distribucion de marcas, util para estudiar densidad de abstraccion o presencia de frases hechas en un corpus.
- Deteccion de cliches y frases hechas: la clase "moneda comun" permite marcar expresiones ya en circulacion en textos generados o en borradores editoriales, como paso previo a una revision humana.
- Filtrado de ruido en datasets: la clase "ruido no deseado" puede emplearse para descartar frases decorativas o sin contenido en la construccion de corpus de entrenamiento o evaluacion.
- Investigacion sobre etiquetado sintetico: sirve como caso de estudio reproducible de un clasificador entrenado con etiquetas de un LLM comercial y evaluado contra anotaciones humanas previas.
- Herramienta editorial de apoyo: integrado en un editor, el modelo puede mostrar al autor el reparto de marcas de su texto y senalar parrafos con exceso de abstraccion o de frases hechas.
- Base para clasificadores estrechos: al ser un MiniLM ajustado con scripts publicados, es un punto de partida para quien quiera replicar la metodologia en otra taxonomia de cuatro clases.
- Experimentacion con adaptadores LoRA: el adaptador "reflect" ilustra como especializar un clasificador pequeno para un subgenero sin reentrenar el modelo completo.

## Benchmarks y rendimiento

| Prueba | Resultado de aadha | Claude Haiku | Claude Sonnet | Conjunto de evaluacion |
|---|---|---|---|---|
| Todas las frases | 576 de 603 marcadas igual que el autor | 441 | 456 | 603 frases anotadas el 30-10-2026; version anterior a la publicada |
| Buen ruido (deteccion) | 62 de 72 encontradas | 72 | 67 | mismas 603 frases; misma version anterior |
| Marcas presentes | 176 de 182 correctas | no disponible | no disponible | conjuntos anotados el 03-11-2026; version publicada |

El autor senala que los modelos alojados igualan o superan a aadha en la deteccion de "buen ruido"; la ventaja de aadha se concentra en una sola frontera, la distincion entre sinsentido abstracto y buen ruido, que los modelos comerciales tienden a confundir. Dos entrenamientos del mismo esquema, cada uno promediado sobre tres semillas, discrepan en 13 a 16 frases de los conjuntos grandes, por lo que diferencias menores a esa cifra no son significativas. Quedan dos problemas sin resolver: la deteccion de "moneda comun" en formulaciones nuevas (0 de 6 en todas las versiones) y las frases de tipo "historia" con faltas de ortografia, que pueden clasificarse como ruido no deseado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 33,36 millones de parametros; el repositorio ocupa 0,1 GB, por lo que cabe en cualquier GPU consumer con holgura.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; una RTX 3060, RTX 4090, T4, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` (libreria declarada), `text-embeddings-inference` y endpoints compatibles segun los tags; llama.cpp u Ollama no estan indicados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, la inferencia por frase es del orden de milisegundos en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aadha | 33,36 M | 96 tokens | Clasificacion de 4 clases estilisticas | CC BY 4.0 (pesos), AGPL-3.0 (codigo) | Hugging Face |
| microsoft/MiniLM-L12-H384-uncased | 33,36 M | 512 tokens (BERT estandar) | Modelo base encoder, sin cabeza de clasificacion | MIT (modelo base de Microsoft) | Hugging Face |
| Modelos alojados tipo Claude Haiku / Sonnet | no disponible | no disponible | Clasificacion y generacion general | Propietaria | API comercial |

La comparacion con los modelos alojados solo es posible en la tarea concreta de etiquetado: segun la model card, Haiku y Sonnet igualan o superan a aadha en "buen ruido", mientras que aadha mantiene ventaja en la frontera entre sinsentido abstracto y abstraccion genuina. No se dispone de otros clasificadores de cuatro clases directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no hay evidencia de comportamiento en otros idiomas.
- Las etiquetas de entrenamiento provienen de un modelo comercial (Claude), no de anotacion humana directa, lo que puede introducir sesgos del modelo etiquetador.
- Las filas de entrenamiento no se publican, lo que dificulta la auditoria y la reproduccion completa del ajuste.
- Dificultad documentada con "moneda comun" en formulaciones nuevas: 0 de 6 en todas las versiones.
- Las frases de tipo "historia" con faltas de ortografia pueden clasificarse erroneamente como ruido no deseado.
- La variabilidad entre entrenamientos (13-16 frases de discrepancia en conjuntos grandes) implica que diferencias pequenas en evaluacion no son fiables.
- Contexto muy limitado (96 tokens por frase): no procesa documentos completos ni mantiene coherencia entre frases.
- El modelo solo etiqueta; cualquier interpretacion de las marcas debe implementarla el codigo de la aplicacion.
- La licencia de los pesos es CC BY 4.0, permisiva para uso comercial con atribucion; el codigo esta bajo AGPL-3.0, que impone obligaciones de copyleft si se ofrece como servicio en red.
- El autor indica que el servicio se retiro el 9 de noviembre de 2026; el modelo se distribuye como instantanea de la ultima version servida.
- Sin datos publicados sobre sesgos demograficos, toxicidad o robustez ante entradas adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prayasabhinav/aadha
- Modelo base: https://huggingface.co/microsoft/MiniLM-L12-H384-uncased
- Constructor de NSM (ungli): https://ungli.syntax.prayasabhinav.net
- Proyecto SYNTAX: https://syntax.prayasabhinav.net
