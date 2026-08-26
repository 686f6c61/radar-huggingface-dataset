# clear-bio/ralle-600m

## Resumen

Ralle-600m es un predictor de topología de proteínas transmembrana desarrollado por el equipo de clear-bio. El modelo clasifica cada residuo de una proteína en cinco estados estructurales (interior, exterior, hélice transmembrana, beta-barril y señal) combinando embeddings congelados del modelo de proteínas ESMC-600M con una cabeza de predicción formada por una CNN, atención ligera y un CRF gramatical. Está específicamente diseñado para el análisis de proteínas de membrana, incluyendo las de origen viral, y se distribuye bajo licencia CC-BY-4.0.

La relevancia de este modelo radica en que la predicción de topología transmembrana es un paso crítico en la anotación funcional de genomas, el estudio de interacciones proteína-membrana y el diseño de fármacos dirigidos a dianas de membrana. El modelo se entrenó sobre el dataset ralle v6.1 con 150,806 registros de entrenamiento y fue detenido tempranamente en la época 11 sobre un NVIDIA L4, alcanzando un rendimiento competitivo en el benchmark DeepTMHMM. El repositorio tiene un tamaño de 0.1 GB, lo que sugiere que el peso del modelo es relativamente ligero al estar basado en embeddings congelados de ESMC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESMC-600m embeddings congelados + CNN + atención ligera + cabeza CRF gramatical (5 clases: i/o/H/B/S) |
| Parametros totales | Aproximadamente 600 millones (embeddings congelados) + cabeza de predicción (tamaño no disponible) |
| Parametros activos | No aplica (no es MoE; los embeddings están congelados y solo la cabeza se entrena) |
| Longitud de contexto | No aplica (procesa secuencias de proteínas de longitud variable, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de bioinformática, no lingüístico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible (probablemente safetensors o PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo utiliza embeddings de ESMC-600m (un modelo de representación de proteínas de 600 millones de parámetros) que se mantienen congelados durante el entrenamiento. Sobre estos embeddings, la cabeza de predicción aplica una red convolucional (CNN) para capturar patrones locales, seguida de una capa de atención ligera y un CRF (Campo Aleatorio Condicional) de tipo gramatical que modela las dependencias entre etiquetas consecutivas. Esta combinación permite predecir la topología transmembrana de forma conjunta, no solo residuo a residuo, sino respetando la coherencia estructural.

El entrenamiento se realizó sobre el dataset rallee6.1 (91,806 registros de entrenamiento) con early stopping en la época 11 de 50, ejecutado en una NVIDIA L20. El proceso no emplea RLHF ni DPO, ya que no es un modelo generativo de texto; se trata de un modelo supervisado de clasificación por secuencia. La innovación principal reside en el uso de embeddings congelados de ESMC combinados con un CRF gramatical, lo que permite alcanzar un buen rendimiento con un coste computacional reducido.

## Capacidades

- Predicción de topología transmembrana por residuo con 5 clases: interior (i), exterior (o), hélice transmembrana (H), beta-barril (B) y señal de péptido (S).
- Procesamiento de secuencias de proteínas de longitud variable, incluyendo proteínas virales.
- Soporte para análisis de proteínas de membrana en contextos de biología estructural y funcional.
- No es un modelo de generación de texto, ni de razonamiento general; no soporta tool calling, agentes ni multi-step reasoning.
- Capacidades multilingües: no aplica, ya que no procesa texto.
- Capacidades especiales: no dispone de modo de razonamiento, visión ni audio; está especializado exclusivamente en secuencias de proteínas.

## Casos de uso

- Anotación de proteínas de membrana en genomas virales: el modelo puede identificar hélices transmembrana y barriles beta en proteínas de virus, ayudando a caracterizar proteínas de envoltura y de superficie, lo que es relevante para el estudio de mecanismos de entrada viral y el desarrollo de vacunas.
- Predicción de topología en pipelines de bioinformática: puede integrarse en flujos de anotación de genomas de bacterias y arqueas, donde las proteínas de membrana constituyen una fracción importante del proteoma y su predicción es crítica para la función.
- Estudio de interacciones proteína-membrana: al predecir los segmentos transmembrana, el modelo permite localizar regiones clave para la interacción con la bicapa lipídica, útil en estudios de biología de membranas y en la ingeniería de proteínas.
- Diseño de fármacos con dianas de membrana: las proteínas transmembrana son dianas de hasta el 50% de los fármacos actuales; este modelo puede ayudar a identificar y caracterizar estas dianas en proteomas de interés farmacológico.
- Clasificación de proteínas según su topología: el modelo puede ser utilizado para clasificar proteínas en bases de datos y estudios comparativos de evolución de proteínas de membrana.
- Análisis de proteínas de membrana en patógenos bacterianos: en microbiología clínica, la predicción de topología de proteínas de membrana de patógenos puede orientar el desarrollo de antibióticos o de terapias dirigidas contra estas proteínas.

## Benchmarks y rendimiento

El modelo reporta resultados en el benchmark DeepTMHMM (n=3,571, modo split-masking, bootstrap 1000x):

| Métrica | Valor | Intervalo de confianza (95%) |
|---|---|---|
| Q5 (precisión por residuo) | 0.9608 | [0.956-0.966] |
| Precisión de topología | 0.8373 | [0.825-0.849] |
| SOV_all (score de solapamiento) | 0.939 | no disponible |

No se han publicado resultados comparativos con otros modelos en la información disponible. El autor indica una limitación clara: la clase beta-barril (B) colapsa a este nivel de datos, con un recall de 0.025, y existe confusión entre señales de péptido y hélices transmembrana (369 goldSP->TM / 21 goldTM->SP).

## Requisitos de hardware

- VRAM estimada: el modelo utiliza embeddings de ESMC-600m congelados, lo que requiere al menos 8-16 GB de VRAM para la inferencia completa, dependiendo de la longitud de la secuencia y del tamaño del batch. La cabeza de predicción es ligera, por lo que la carga principal es la de los embeddings.
- GPUs recomendadas: una NVIDIA L4 (16 GB) fue la utilizada para el entrenamiento; para inferencia, una GPU con al menos 16 GB de VRAM (RTX 4090, A100, H100) es adecuada.
- En consumer GPU: es viable en RTX 3090 o RTX 4090, que disponen de 24 GB de VRAM, siempre que se gestionen bien los lotes.
- Opciones de despliegue: el código está disponible en el repositorio de GitHub (https://github.com/clear-bio/ralle) y es probable que se pueda ejecutar con PyTorch y HuggingFace transformers. No se mencionan soportes para vLLM, llama.cpp ni Ollama, ya que es un modelo de biología y no un LLM de texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No hay datos públicos que comparen directamente ralle-600m con otros predictores de topología transmembrana en la información proporcionada. Los modelos comparables en el campo son:

| Modelo | Parámetros | Contexto | Rendimiento (topología) | Licencia |
|---|---|---|---|---|
| ralle-600m | ~600M (embeddings congelados) | no aplica | Topología 0.8373 (DeepTMHMM) | CC-BY-4.0 |
| DeepTMHMM | no disponible | no aplica | es el benchmark de referencia | no disponible |
| TMHMM | no disponible | no aplica | no disponible | no disponible |
| Phobius | no disponible | no aplica | no disponible | no disponible |

No se dispone de información sobre parámetros o rendimiento de los modelos alternativos en las fuentes consultadas, por lo que no es posible realizar una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- La clase de beta-barril (B) colapsa con este tamaño de datos: el recall para esta clase es de 0.025, lo que significa que el modelo no detecta de forma fiable las proteínas de barril beta.
- Existe una confusión significativa entre señales de péptido (SP) y hélices transmembrana (TM): se observan 369 falsos positivos de SP como TM y 21 falsos negativos de TM como SP, lo que puede afectar a la anotación de proteínas con señales de péptido.
- El modelo fue entrenado específicamente para proteínas transmembrana y no es aplicable a otros tipos de proteínas.
- La licencia CC-BY-4.0 permite el uso comercial, pero exige la atribución adecuada al autor.
- No se han publicado los pesos del modelo en formato estándar (p.ej., safetensors) en la información disponible; solo se menciona el repositorio de código.
- La fecha de creación es 2026-08-25, por lo que es un modelo muy reciente y aún no ha sido evaluado por la comunidad amplia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/clear-bio/ralle-600m
- Dataset en HuggingFace: https://huggingface.co/datasets/clear-bio/ralle-dataset
- Repositorio de código: https://github.com/clear-bio/ralle
- Perfil del autor: https://huggingface.co/clear-bio
