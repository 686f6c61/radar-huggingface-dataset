# Melissashii/hw1-hc3-detector

## Resumen

El modelo `Melissashii/hw1-hc3-detector` es un clasificador de texto binario derivado de `sentence-transformers/all-MiniLM-L6-v2` mediante ajuste fino supervisado. Su tarea es distinguir si una respuesta del corpus HC3 fue escrita por una persona (clase 0) o generada por ChatGPT (clase 1). Se publica como un ejercicio académico (el prefijo "hw1" sugiere una primera práctica de curso) y no como un detector desplegable en producción.

El modelo tiene 22.713.986 parámetros (~22,7 M) y un tamano de repositorio de 0,1 GB, lo que lo situa en la categoria de codificadores ligeros tipo BERT. Al partir de all-MiniLM-L6-v2, hereda una arquitectura transformer encoder compacta, pensada para inferencia rapida en CPU y GPU de gama baja. No se ha publicado informacion sobre licencia, idiomas soportados ni ventana de contexto en la informacion disponible.

Su relevancia es fundamentalmente metodologica: la model card demuestra que el ajuste fino completo (0,9921 de accuracy en el split de test de HC3) supera ampliamente a una linea base de embeddings congelados mas regresion logistica (0,8449). Al mismo tiempo, el propio autor advierte que no es un detector fiable para textos de modelos mas recientes ni para uso en el mundo real, lo que lo convierte en un ejemplo util de las limitaciones de generalizacion de los detectores de texto generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (heredada de all-MiniLM-L6-v2) |
| Parametros totales | 22.713.986 (~22,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `sentence-transformers/all-MiniLM-L6-v2`, un codificador transformer pequeno con 22,7 M de parametros. Sobre esa base se anade una cabeza de clasificacion para dos clases (humano frente a ChatGPT) y se entrena el modelo completo, no solo la cabeza. La libreria declarada es `transformers` y la tarea asociada en el Hub es `text-classification`.

El entrenamiento se realizo sobre el dataset `Hello-SimpleAI/HC3`, con la configuracion declarada en la model card: 5 epocas, optimizador AdamW, tasa de aprendizaje 2e-5 y tamano de lote 32. No se especifican el numero total de tokens, la composicion exacta del dataset, la estrategia de tokenizacion ni si se aplicaron tecnicas de regularizacion o busqueda de hiperparametros. Tampoco se documentan procesos de RLHF o DPO, algo esperable en un clasificador de este tipo. La unica comparacion reportada es contra una linea base de embeddings congelados mas regresion logistica, entrenada sobre las mismas representaciones del modelo base.

## Capacidades

- Clasificacion binaria de texto: devuelve una etiqueta 0 (escrito por humano) o 1 (generado por ChatGPT) para una respuesta dada.
- Clasificacion de secuencias cortas o medianas, limitada por la ventana del modelo base all-MiniLM-L6-v2.
- Inferencia rapida en CPU y en GPU de gama baja gracias a su tamano reducido (22,7 M de parametros).
- Compatibilidad con el ecosistema `transformers` y con `text-embeddings-inference` segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no.
- Capacidades de agente o razonamiento multi-paso: no.
- Capacidades multilingues: no documentadas.
- Modo de razonamiento explicito (thinking), vision o audio: no.
- Generacion de texto: no; es exclusivamente un modelo discriminativo.

## Casos de uso

- Reproduccion de experimentos academicos: sirve como punto de partida para practicas de ajuste fino de codificadores pequenos y para comparar contra la linea base de regresion logistica reportada en la model card.
- Analisis de la calidad de respuestas generadas: en un pipeline de evaluacion offline, puede usarse para medir que proporcion de un corpus de respuestas estilo HC3 se parece mas a texto generado por ChatGPT.
- Filtrado de datasets historicos: aplicado exclusivamente a datos con la misma distribucion que HC3 (2023), puede etiquetar respuestas y auditar la composicion de un corpus ya existente.
- Estudio de deteccion de texto generado: util como caso de comparacion frente a detectores mas grandes y para ilustrar el problema de la deriva temporal (nuevos modelos generativos invalidan el clasificador).
- Prototipado docente de pipelines de clasificacion: al ocupar menos de 1 GB, permite demostrar el ciclo completo (entrenamiento, evaluacion, despliegue) en un portatil o en una instancia pequena.
- Pruebas de integracion con `text-embeddings-inference` o endpoints compatibles: util para validar infraestructura de servido de clasificadores ligeros antes de pasar a modelos mayores.

## Benchmarks y rendimiento

Datos publicados en la model card (split de test de HC3):

| Modelo | Accuracy en test |
|---|---|
| Embeddings congelados + regresion logistica (linea base) | 0,8449 |
| Ajuste fino (5 epocas, AdamW, lr=2e-5, lote 32) | 0,9921 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se reportan metricas adicionales como precision, recall, F1 o matriz de confusion, algo relevante en una tarea binaria potencialmente desbalanceada.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (los pesos ocupan aproximadamente 91 MB) y del orden de 0,5 GB en fp16 (unos 45 MB de pesos mas activaciones y overhead del runtime). Es una estimacion a partir del numero de parametros, no un dato publicado.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria; por ejemplo GTX 1650, RTX 3060, T4 o superiores. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, e incluso en CPU sin GPU dedicada.
- Opciones de despliegue: `transformers` (libreria declarada), `text-embeddings-inference` (etiqueta del repositorio) y endpoints compatibles con el Hub. No se han publicado variantes GGUF, ONNX ni cuantizaciones para llama.cpp, Ollama o vLLM.
- Latencia y throughput estimados: no disponibles. No se reportan mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Melissashii/hw1-hc3-detector | 22,7 M | no disponible | 0,9921 accuracy en test de HC3 | no disponible | HuggingFace (0 descargas, 0 likes) |
| sentence-transformers/all-MiniLM-L6-v2 (modelo base) | 22,7 M | no disponible | no aplica a esta tarea sin cabeza de clasificacion | Apache 2.0 (segun la informacion publica del modelo base) | HuggingFace (ampliamente utilizado) |

No se dispone de informacion sobre otros detectores comparables (por ejemplo, clasificadores entrenados sobre HC3) en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor advierte de que el modelo se entreno sobre el benchmark HC3 de 2023 y que no es un detector fiable para texto de modelos mas recientes ni para uso en el mundo real.
- Riesgo elevado de deriva temporal: los modelos generativos posteriores a 2023 producen texto que probablemente no se clasifique correctamente.
- Riesgo de falsos positivos sobre texto humano con estilo formal o asistido por herramientas, y de falsos negativos sobre texto generado editado manualmente.
- Sesgos conocidos: no documentados en la model card. Al entrenarse sobre HC3, hereda los sesgos de dominio, idioma, tema y estilo de ese corpus.
- La accuracy de 0,9921 sobre el split de test de HC3 no es extrapolable a otros dominios; no se reportan metricas de generalizacion cruzada.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial. Debe tratarse como uso no autorizado hasta que el autor aclare la licencia.
- Idiomas soportados no declarados; el comportamiento fuera del idioma o los idiomas del corpus de entrenamiento es desconocido.
- Ventana de contexto no documentada: los textos largos pueden truncarse de forma silenciosa segun la configuracion del tokenizador.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: no hay evidencia de validacion externa ni de mantenimiento posterior.
- No debe utilizarse para acusar a personas de usar IA en contextos academicos, laborales o legales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Melissashii/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda proporcionados.
