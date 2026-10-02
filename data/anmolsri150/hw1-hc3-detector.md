# anmolsri150/hw1-hc3-detector

## Resumen

`anmolsri150/hw1-hc3-detector` es un modelo de clasificacion de texto basado en la arquitectura BERT (transformer encoder) publicado en Hugging Face por el usuario anmolsri150. Con 22.713.986 parametros, se trata de un encoder de tamano pequeno-medio cuyo pipeline declarado es `text-classification`, es decir, esta pensado para asignar una etiqueta a un texto de entrada en lugar de generar texto libre. El repositorio ocupa aproximadamente 0,1 GB y los pesos estan en formato safetensors, cargables con la libreria `transformers`.

El modelo no incluye model card real: el README es la plantilla autogenerada por Hugging Face con todos los campos marcados como "[More Information Needed]". Por tanto, no hay informacion publicada sobre el desarrollador, la composicion del dataset de entrenamiento, el numero de tokens vistos, el regimen de entrenamiento ni las metricas de evaluacion. Tampoco se declaran licencia, idiomas soportados ni caso de uso previsto.

El nombre del repositorio (`hw1` = tarea 1, `hc3` = probablemente el corpus Human ChatGPT Comparison Corpus) sugiere que se trata de un ejercicio academico de clasificacion para deteccion de texto generado por IA, y existen repositorios con el mismo identificador bajo otras cuentas (Aishkrish, Chengwei-Shen, Yihangsun, huamulian), lo que apunta a una practica de curso replicada por varios alumnos. Esta interpretacion es una inferencia a partir del nombre y de los repositorios homonimos, no un dato confirmado por el autor. Su relevancia practica es limitada: al no haber documentacion, evaluacion ni licencia, solo es util como referencia tecnica o como punto de partida para experimentos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional); confirmado solo por el tag `bert` del repositorio |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Etiquetas del repositorio | transformers, safetensors, bert, text-classification, text-embeddings-inference, endpoints_compatible, region:us |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion | 2026-10-01 (segun metadatos de Hugging Face) |
| Ultima actualizacion | 2026-10-01 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica evidencia sobre la arquitectura es el tag `bert` y el pipeline `text-classification`. Se trata, por tanto, de un encoder transformer con atencion bidireccional completa, orientado a producir una representacion de secuencia (habitualmente mediante el token `[CLS]`) que alimenta una cabeza de clasificacion lineal. El recuento de 22,7 millones de parametros es coherente con un BERT reducido o con un vocabulario mas pequeno que el estandar de 30.522 tokens de `bert-base-uncased`, pero no es posible determinar el numero de capas, la dimensionalidad oculta, el numero de cabezas de atencion ni el tamano del vocabulario sin inspeccionar el `config.json` del repositorio, dato que no se ha proporcionado.

No hay informacion sobre el procedimiento de entrenamiento: se desconoce el numero de tokens, la composicion del corpus, si hubo preentrenamiento propio o ajuste fino sobre un checkpoint existente, el regimen de precision (fp32, fp16, bf16), la funcion de perdida, el numero de epocas ni si se aplicaron tecnicas de alineacion como RLHF o DPO (poco habituales en modelos encoder de clasificacion). Tampoco se documenta ninguna innovacion tecnica: no hay decodificacion especulativa, atencion lineal, capas SSM ni mecanismos hibridos. La referencia al paper `arxiv:1910.09700` que aparece en los tags corresponde al articulo de Lacoste et al. sobre el calculo de emisiones de carbono, citado en la plantilla estandar de model card, y no a la arquitectura del modelo.

## Capacidades

- Clasificacion de texto: es la unica capacidad confirmada por el pipeline declarado (`text-classification`). El modelo devuelve una o varias etiquetas con su puntuacion de probabilidad para un texto de entrada.
- Deteccion de texto generado por IA: capacidad inferida del nombre `hc3-detector`, no confirmada por el autor ni por ninguna evaluacion publicada.
- Generacion de texto: no soportada. Es un encoder de clasificacion, no un modelo causal de lenguaje.
- Razonamiento, matematicas y codigo: no soportados ni documentados.
- Tool calling / function calling: no soportado ni documentado.
- Agentes y razonamiento multi-paso: no soportado ni documentado.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): ninguna documentada.
- Embeddings de texto: el tag `text-embeddings-inference` sugiere compatibilidad con despliegue en ese motor, pero no implica que el modelo este optimizado para recuperacion semantica.

## Casos de uso

- Deteccion de texto generado por IA en flujos editoriales: si la hipotesis del nombre se confirma, el modelo clasificaria fragmentos de texto como humanos o generados por ChatGPT, lo que permitiria marcar automaticamente articulos o trabajos enviados antes de la revision humana. Requiere validacion previa con datos propios, ya que no hay metricas publicadas.
- Moderacion de contenido en foros y plataformas: clasificacion binaria de mensajes para separar contenido potencialmente automatizado del generado por personas, siempre como senal auxiliar y nunca como decision automatica.
- Filtrado de datos de entrenamiento: uso del clasificador para descartar texto sintetico de un corpus antes de entrenar otro modelo, reduciendo el riesgo de colapso por datos generados.
- Aprendizaje academico y docencia: el repositorio sirve como ejemplo de ajuste fino de un BERT pequeno sobre un corpus de comparacion humano-maquina, util en asignaturas de PLN para ilustrar el ciclo completo de entrenamiento y publicacion en el Hub.
- Punto de partida para ajuste fino propio: con 22,7 M de parametros, el modelo se reentrena en minutos en una GPU de consumo sobre una tarea de clasificacion especifica (analisis de sentimiento, clasificacion de tickets, deteccion de spam), reutilizando el checkpoint como inicializacion.
- Clasificacion de bajo coste en produccion: al ser un encoder pequeno, puede desplegarse en CPU con latencia y coste muy inferiores a los de un modelo generativo, para tareas de etiquetado masivo de documentos.
- Experimentacion local sin GPU: el tamano del checkpoint (aproximadamente 91 MB en fp32) permite cargarlo y ejecutarlo en un portatil para pruebas de integracion y desarrollo.
- Generacion de embeddings para busqueda semantica ligera: la representacion del token `[CLS]` puede reutilizarse como vector de documento en indices de recuperacion a pequena escala, aunque sin garantias de calidad al no existir evaluacion.
- Investigacion sobre robustez de detectores: util para estudiar como se comportan los clasificadores de texto IA frente a parafraseo, traduccion o ataques adversariales, comparandolo con detectores mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no contiene la seccion de evaluacion cumplimentada y el autor no reporta metricas de exactitud, F1, precision ni recall sobre ningun conjunto de datos. Tampoco hay resultados de MMLU, GLUE, HumanEval, GSM8K ni de tareas de deteccion de texto generado.

| Benchmark | Resultado | Fuente |
|---|---|---|
| Evaluacion del autor | no disponible | model card vacia |
| Metricas en HC3 o similar | no disponible | sin datos publicados |
| Cualquier otro benchmark | no disponible | sin datos publicados |

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 91 MB solo para los pesos (22.713.986 parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica cabe en menos de 1 GB.
- VRAM para inferencia en fp16/bf16: aproximadamente 45 MB de pesos.
- VRAM para inferencia en int8: aproximadamente 23 MB de pesos; en 4 bits, aproximadamente 11 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. No se necesita una A100, H100 ni una RTX 4090; una GTX 1650, una T4, una RTX 3060 o incluso una GPU integrada moderna sirven para inferencia.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo de los ultimos diez anos. Tambien cabe holgadamente en CPU y en dispositivos de borde.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Hugging Face Inference Endpoints (el tag `endpoints_compatible` esta presente), Text Embeddings Inference (tag `text-embeddings-inference`), y conversion a ONNX Runtime para despliegue en CPU. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada; estos motores estan orientados a modelos generativos y no aplican a un encoder de clasificacion.
- Latencia y throughput: no disponibles, no medidos ni publicados por el autor. Como referencia general de la familia, un encoder de 22,7 M de parametros procesa lotes de cientos de secuencias cortas por segundo en una GPU moderna y del orden de decenas por segundo en CPU, pero estos valores no proceden de ninguna medicion sobre este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anmolsri150/hw1-hc3-detector | 22,7 M | no disponible | text-classification | no disponible | Hugging Face, 0 descargas |
| distilbert-base-uncased | 66 M | 512 tokens | encoder general / ajuste fino | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 tokens | encoder general / ajuste fino | Apache 2.0 | Hugging Face, ampliamente usado |
| prajjwal1/bert-mini | 11,2 M | 512 tokens | encoder general / ajuste fino | Apache 2.0 | Hugging Face |
| Hello-SimpleAI/chatgpt-detector-roberta | 125 M | 512 tokens | deteccion de texto ChatGPT (HC3) | no verificada en esta ficha | Hugging Face |

La comparacion con alternativas de deteccion de texto generado no puede hacerse en terminos de rendimiento porque este modelo no publica ninguna metrica. Frente a `distilbert-base-uncased` o `bert-base-uncased`, la unica ventaja objetiva es el menor numero de parametros (22,7 M frente a 66 M y 110 M), lo que reduce el coste de inferencia, a cambio de una documentacion y unas garantias de calidad muy inferiores.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada sin ningun campo cumplimentado. No se puede saber que aprende el modelo ni con que datos.
- Licencia no declarada: sin licencia explicita no hay permiso claro para uso comercial, redistribucion ni modificacion. Tratar como uso restringido hasta que el autor lo aclare.
- Riesgo alto de alucinacion de etiquetas: un clasificador sin evaluacion publicada puede asignar etiquetas con alta confianza a entradas fuera de su distribucion de entrenamiento.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos de genero, raza, idioma o registro. Los detectores de texto IA, ademas, tienden a penalizar a hablantes no nativos y a textos muy formulaicos.
- Idiomas: no declarados. Asumir comportamiento fiable solo en el idioma del corpus de entrenamiento, que se desconoce.
- Longitud de contexto: no declarada. Si sigue la convencion de BERT, el limite estaria en 512 tokens, pero no hay confirmacion.
- Riesgo de falso positivo en deteccion de IA: cualquier uso disciplinario o editorial basado en la salida del modelo sin revision humana es inapropiado, dado que no existe ninguna metrica de precision o recall.
- Metadatos atipicos: la fecha de creacion registrada (2026-10-01) es posterior a la fecha de redaccion habitual de este tipo de fichas, lo que sugiere que el repositorio puede haberse subido con reloj o entorno mal configurado.
- Duplicados en el Hub: existen al menos cuatro repositorios con el mismo identificador bajo cuentas distintas, lo que complica identificar cual es el original y si los pesos son identicos.
- Estado del repositorio: 0 descargas y 0 likes, sin senal de mantenimiento ni de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anmolsri150/hw1-hc3-detector
- Repositorio homonimo de Aishkrish: https://huggingface.co/Aishkrish/hw1-hc3-detector
- Repositorio homonimo de Chengwei-Shen: https://huggingface.co/Chengwei-Shen/hw1-hc3-detector
- Ficha de terceros de Yihangsun: https://savrn.com/models/hw1-hc3-detector
- Ficha de terceros de huamulian: https://free2aitools.com/model/huamulian/hw1-hc3-detector
- Paper citado en la plantilla de model card (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la plantilla: https://mlco2.github.io/impact
- Paper y repositorio del modelo: no disponibles
- Demo: no disponible
