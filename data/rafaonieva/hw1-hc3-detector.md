# RafaOnieva/hw1-hc3-detector

## Resumen

`RafaOnieva/hw1-hc3-detector` es un modelo de clasificación de texto publicado en Hugging Face por el usuario RafaOnieva. Se distribuye como un checkpoint de la librería `transformers` con pesos en formato safetensors y una arquitectura de tipo BERT (etiqueta `bert` declarada en el repositorio), con 22.713.986 parámetros totales y un tamaño de repositorio de 0,1 GB. El identificador del modelo y el ecosistema de repositorios homónimos (Chengwei-Shen, zzhy2580, Yihangsun, hongjip) apuntan a un ejercicio académico ("hw1") construido sobre el corpus HC3.

La model card publicada es la plantilla automática de Hugging Face y no contiene información sustantiva: no se documentan datos de entrenamiento, hiperparámetros, idiomas, licencia, métricas de evaluación ni uso previsto. Toda la información técnica disponible en esta ficha procede del identificador del repositorio, de las etiquetas del Hub y del recuento real de parámetros de los pesos safetensors. Cualquier dato no verificable se marca explícitamente como "no disponible".

El interés de esta ficha es, por tanto, acotado: sirve para inventariar un checkpoint pequeño de clasificación (encaja en CPU y en cualquier GPU de consumo) cuyo propósito concreto solo puede inferirse por el nombre del repositorio y por el corpus HC3, no por documentación del autor. No se recomienda su uso en producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (etiqueta `bert` del repositorio); codificador transformer |
| Parametros totales | 22.713.986 (recuento real de los safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con configuracion de `transformers`) |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion en el Hub | 2026-09-23 (segun metadatos del Hub) |
| Ultima actualizacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `bert` del repositorio y la librería declarada (`transformers`) indican un codificador transformer de tipo BERT orientado a clasificación de secuencias, con una cabeza de clasificación sobre la representación del token `[CLS]`. El recuento real de parámetros, 22,7 millones, es muy inferior a los 110 millones de un BERT-base estándar, lo que sugiere una configuración reducida (menos capas, dimensión oculta menor o vocabulario recortado), pero el autor no publica el `config.json` comentado ni la procedencia del checkpoint base, por lo que esta observación no puede confirmarse con la información disponible.

No hay ningún dato sobre el procedimiento de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo ajuste fino supervisado, RLHF o DPO, ni hiperparámetros, ni régimen de precisión. La model card incluye únicamente los campos de plantilla con "[More Information Needed]". Del contexto del nombre se deduce que se trata de un ejercicio de ajuste fino sobre el corpus HC3 (Human ChatGPT Comparison Corpus), un conjunto de pares pregunta-respuesta humano vs. generado por ChatGPT, pero esto es una inferencia a partir del ecosistema de repositorios homónimos, no un dato aportado por el autor.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que la salida esperada es una o varias etiquetas con su puntuación de confianza.
- Detección de texto generado por IA: hipótesis basada en el identificador "detector" y en el corpus HC3; no confirmada por documentación del autor.
- Inferencia sobre texto corto o medio: por el tamaño del modelo (22,7 M de parámetros) y su naturaleza de codificador, el uso previsto es la clasificación de fragmentos, no la generación.
- Compatibilidad con text-embeddings-inference y endpoints: el repositorio incluye la etiqueta `text-embeddings-inference` y `endpoints_compatible`, lo que permite desplegarlo mediante esos servicios.
- Generación de texto: no disponible; no es una capacidad de un modelo de clasificación.
- Tool calling / function calling: no disponible; no aplica.
- Capacidades de agente o razonamiento multi-paso: no disponible; no aplica.
- Multilingüismo: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

Dado que la model card no describe el propósito del modelo, los casos siguientes parten de la hipótesis de que se trata de un detector de texto generado por IA entrenado sobre HC3. Deben validarse con una evaluación propia antes de cualquier uso real.

- Moderación de contenido en foros y comunidades: clasificar respuestas entrantes para marcar las que presentan patrones de texto generado automáticamente, usando un umbral de confianza ajustado manualmente sobre un conjunto de validación propio.
- Filtrado de datos para entrenamiento: descartar muestras sospechosas de proceder de un LLM antes de incluirlas en un pipeline de preentrenamiento o ajuste fino, con el modelo actuando como clasificador binario de bajo coste.
- Auditoría de trabajos académicos: señalizar entregas con alta probabilidad de haber sido redactadas por un modelo generativo, siempre como indicio preliminar y nunca como prueba concluyente, dado el historial de falsos positivos en texto humano formal.
- Investigación sobre detección de IA: usar el checkpoint como línea base reproducible en experimentos que comparen arquitecturas (RoBERTa, Electra, Mamba, RetNet) sobre el mismo corpus, tal como hacen los repositorios de experimentos encontrados.
- Preprocesado en pipelines de curación de corpus: integrar el clasificador como paso previo en un pipeline de limpieza de datos, ejecutándolo en CPU para lotes grandes sin coste de GPU.
- Servicio de inferencia ligero con text-embeddings-inference: desplegar el modelo como endpoint de clasificación de baja latencia, aprovechando que el checkpoint ocupa 0,1 GB y cabe entero en memoria.
- Análisis de tendencias en redes sociales: clasificar grandes volúmenes de publicaciones para estimar la proporción de contenido generado automáticamente por período o comunidad, con agregación estadística y no caso a caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye sección de evaluación cumplimentada (todos los campos figuran como "[More Information Needed]"), no hay métricas de precisión, recall, F1 ni comparaciones con otros modelos, y las búsquedas web solo devuelven repositorios homónimos y agregadores sin datos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,1 GB para los pesos (22,7 M de parámetros), más el overhead del runtime; en la práctica, menos de 1 GB en total.
- VRAM estimada en fp16/bf16: en torno a 45-50 MB para los pesos, con el mismo overhead de activaciones y framework.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es mucho menor que lo que exigen, por ejemplo, una RTX 3060, una RTX 4090, una A100 o una H100, todas ellas sobredimensionadas para este checkpoint.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo moderna e incluso en GPUs integradas; también es viable la inferencia en CPU para lotes moderados.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, text-embeddings-inference (etiqueta declarada en el repositorio) y los endpoints compatibles de Hugging Face. No se documentan ficheros GGUF, por lo que su uso directo con llama.cpp u Ollama para este checkpoint no está soportado de fábrica.
- Latencia y throughput: no disponible. No hay mediciones publicadas por el autor ni en las fuentes consultadas.

## Comparativa con modelos similares

No hay datos de rendimiento de este checkpoint, por lo que la comparación se limita a características estructurales y de licencia. Los datos de los modelos de referencia son valores generales y conocidos de cada familia, no mediciones sobre el corpus de este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en clasificacion |
|---|---|---|---|---|---|
| RafaOnieva/hw1-hc3-detector | 22,7 M | no disponible | no disponible | Hugging Face, safetensors | no disponible |
| bert-base-uncased | 110 M | 512 tokens (configuracion habitual) | Apache 2.0 | Hugging Face | no disponible en esta ficha |
| DistilBERT base | 66 M | 512 tokens (configuracion habitual) | Apache 2.0 | Hugging Face | no disponible en esta ficha |
| RoBERTa-base | 125 M | 512 tokens (configuracion habitual) | MIT | Hugging Face | no disponible en esta ficha |

La diferencia principal frente a las alternativas es el tamaño: 22,7 M de parámetros frente a 66-125 M, lo que reduce el coste de inferencia pero también, previsiblemente, la capacidad de representación. Sin métricas publicadas no puede afirmarse que esta reducción sea o no aceptable para la tarea.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla automática, sin descripción, datos de entrenamiento, evaluación ni uso previsto. Cualquier decisión de producción basada en ella es una extrapolación.
- Licencia no especificada: al no declararse licencia, no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier despliegue comercial.
- Sesgos conocidos: no disponibles. Al desconocerse el corpus de entrenamiento, no se puede caracterizar el sesgo por dominio, registro, idioma o demografía.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza, un problema habitual en detectores de texto generado.
- Validez de la detección de IA: los detectores de este tipo producen falsos positivos sistemáticos sobre texto humano formal, escrito por no nativos o altamente predecible. No debe usarse como prueba única en contextos disciplinarios o académicos.
- Limitaciones de contexto e idioma: no disponibles. No se documentan ni la ventana máxima ni los idiomas soportados; se desconoce si el modelo funciona fuera del inglés.
- Riesgo de sobreajuste al corpus: por el tamaño reducido (22,7 M de parámetros) y el contexto de ejercicio académico, es probable que generalice mal fuera de la distribución de HC3, aunque esto no puede confirmarse sin evaluaciones.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de redactar esta ficha, sin evidencia de uso o validación por terceros.
- Formato limitado: al no publicarse GGUF ni cuantizaciones, el despliegue en entornos de inferencia en CPU optimizados para llama.cpp requiere una conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RafaOnieva/hw1-hc3-detector
- Repositorio homónimo de Chengwei-Shen: https://huggingface.co/Chengwei-Shen/hw1-hc3-detector
- Repositorio homónimo de zzhy2580: https://huggingface.co/zzhy2580/hw1-hc3-detector
- Ficha agregada de Yihangsun: https://savrn.com/models/hw1-hc3-detector
- Ficha agregada de hongjip: https://free2aitools.com/model/hongjip/hw1-hc3-detector
- Experimentos de deteccion sobre el corpus HC3 (GitHub): https://github.com/saugatabose28/LLM-Detector-Experiments-HC3-Dataset
- Referencia citada en la model card, Lacoste et al. (2019), sobre emisiones de carbono: https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental en aprendizaje automatico: https://mlco2.github.io/impact#compute
