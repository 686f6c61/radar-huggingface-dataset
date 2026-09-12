# pbcong/haloprobe-coco-llava15-7b

## Resumen

haloprobe-coco-llava15-7b es un repositorio de artefactos publicado por el usuario pbcong que contiene los checkpoints del metodo completo HaloProbe, las caches de caracteristicas y los resultados de evaluacion asociados a la deteccion de alucinaciones en el modelo vision-lenguaje LLaVA-1.5-7B. No es un modelo generativo nuevo: el artefacto principal es una sonda (probe) de tipo MLP que consume caracteristicas internas de atencion y de logits de LLaVA-1.5-7B concatenadas con seis caracteristicas externas derivadas de estadisticas de los captions, lo que da una dimension de entrada total de 2058.

El repositorio se organiza en `cache/` y `checkpoints/` para encajar con la estructura de la release asociada TruthPrint, e incluye tres semillas de entrenamiento (0, 42 y 1337), shards de caracteristicas etiquetadas de COCO y AMBER para ajuste y evaluacion de holdout, el fichero `results/results_6.4k.json` con resultados por semilla y de ensemble, y el codigo de extraccion de caracteristicas y entrenamiento.

Su relevancia es practica para investigacion en deteccion de alucinaciones multimodales: permite reproducir el metodo completo, medir la variabilidad entre semillas y usar el ensemble sin reentrenar, siempre que se disponga del modelo base LLaVA-1.5-7B y de las caracteristicas correspondientes. El repositorio ocupa 0,3 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda MLP sobre caracteristicas internas (atencion y logits) de LLaVA-1.5-7B concatenadas con 6 caracteristicas externas de estadisticas de captions; dimension de entrada 2058 |
| Parametros totales | no disponible (no se detalla el numero de parametros de la MLP; el peso del repositorio corresponde a checkpoints y caches) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la sonda opera sobre un unico ejemplo; hereda el contexto del modelo base, no declarado en el repositorio) |
| Tipos de cuantizacion | no disponible (la sonda se distribuye como checkpoints; el modelo base admite las cuantizaciones de LLaVA-1.5, no listadas aqui) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoints de la sonda (extension no especificada) mas caches de caracteristicas; formato exacto no disponible |

## Arquitectura y entrenamiento

El componente modelado es una sonda MLP entrenada sobre caracteristicas concatenadas: por un lado, caracteristicas internas de atencion y de logits extraidas de LLaVA-1.5-7B; por otro, seis caracteristicas externas de estadisticas de captions. La concatenacion da un vector de entrada de 2058 dimensiones. El repositorio incluye tres checkpoints del "metodo completo" (seeds 0, 42 y 1337), lo que permite construir un ensemble y cuantificar la varianza entre inicializaciones. La construccion exacta de caracteristicas y la definicion del modelo estan implementadas en `code/haloprobe_cache.py` y `code/train_haloprobe_full.py`.

Los datos de ajuste y evaluacion son caches de caracteristicas etiquetadas sobre COCO (para ajuste y evaluacion de holdout) y AMBER, lo que indica un entrenamiento supervisado a partir de ejemplos etiquetados de ambos conjuntos, con particion de holdout. No hay informacion sobre numero de tokens, composicion del dataset, ni sobre tecnicas de RLHF o DPO, que no aplican a un clasificador de este tipo. El calificativo "full-method" sugiere la existencia de variantes reducidas (por ejemplo, sin las caracteristicas externas), pero no se detallan en la informacion disponible. Tampoco se describe el numero de parametros de la MLP, las capas ocultas ni la funcion de perdida.

## Capacidades

- Deteccion de alucinaciones en respuestas de LLaVA-1.5-7B a partir de caracteristicas internas del propio modelo y de estadisticas del caption.
- Inferencia de ensemble: los tres checkpoints por semilla permiten combinar predicciones y reducir la varianza frente a una sola sonda.
- Reutilizacion de caracteristicas cacheadas: las caches de COCO y AMBER permiten evaluar y comparar sin reejecutar el modelo base.
- Extraccion de caracteristicas reproducible mediante los scripts incluidos en `code/`.
- Evaluacion por semilla y en ensemble, con resultados agregados en `results/results_6.4k.json`.
- No genera texto: no es un modelo de chat ni de completion.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues, de vision directa, audio ni modo de pensamiento; cualquier capacidad multimodal proviene exclusivamente del modelo base sobre el que se extraen las caracteristicas.
- El tipo exacto de salida (logit binario o puntuacion continua) no esta descrito en la informacion disponible.

## Casos de uso

- Filtrado de alucinaciones en pipelines de captioning y VQA: la sonda actua como segunda pasada sobre la respuesta generada por LLaVA-1.5-7B y permite descartar o marcar captions sospechosos antes de publicarlos en un producto.
- Curacion de datasets multimodales: aplicar la sonda a grandes volumenes de captions generados y separar los ejemplos fiables de los que requieren revision humana, reduciendo el coste de anotacion.
- Investigacion en interpretabilidad: analizar que caracteristicas internas de atencion y de logits tienen mayor peso en la deteccion, ya que la sonda consume directamente esas representaciones.
- Evaluacion comparativa de variantes de LLaVA: usar la tasa de deteccion como metrica auxiliar al comparar checkpoints, prompts o tecnicas de decodificacion del modelo base.
- Senal de recompensa para ajuste fino: emplear la puntuacion de la sonda como reward model en un pipeline de DPO orientado a reducir la alucinacion de un VLM.
- Guardrail en produccion: desplegar la sonda como verificador asincrono que marca respuestas de un asistente visual antes de que lleguen al usuario final.
- Reproduccion de benchmarks en AMBER y COCO: el repositorio incluye caches etiquetadas de ambos conjuntos, lo que facilita replicar experimentos y comparar con la release TruthPrint.
- Aprendizaje activo: priorizar que ejemplos enviar a anotacion humana usando la incertidumbre de la sonda o la discrepancia entre semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `results/results_6.4k.json` con resultados por semilla y de ensemble, pero su contenido numerico no forma parte de los datos proporcionados y no se reproduce aqui.

## Requisitos de hardware

- Sonda MLP: coste de inferencia despreciable; el repositorio completo ocupa 0,3 GB, mayoritariamente caches de caracteristicas. Puede ejecutarse en CPU sin problema.
- Extraccion de caracteristicas: requiere ejecutar LLaVA-1.5-7B, que es el verdadero cuello de botella de computo. Estimacion orientativa para el modelo base: aproximadamente 14-16 GB de VRAM en fp16, en torno a 8 GB en int8 y 5-6 GB en 4 bits, segun la implementacion.
- GPU consumer: una RTX 3090 o RTX 4090 (24 GB) ejecuta el modelo base en fp16 sin problema; una RTX 3060 de 12 GB requiere cuantizacion de 8 o 4 bits.
- GPU de datacenter: A100 40/80 GB y H100 para extraccion por lotes a mayor throughput, especialmente si se procesan las caches completas de COCO y AMBER.
- Despliegue: no hay integracion estandar con vLLM, TGI, Ollama o llama.cpp, ya que la sonda no es un modelo generativo. El uso previsto es mediante los scripts de PyTorch incluidos (`code/haloprobe_cache.py` y `code/train_haloprobe_full.py`) y carga manual de los checkpoints.
- Latencia y throughput: no disponibles. La latencia del sistema completo estara dominada por la pasada del modelo base, no por la sonda.

## Comparativa con modelos similares

| Sistema | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HaloProbe (este repositorio) | Sonda MLP de deteccion de alucinaciones sobre LLaVA-1.5-7B | no disponible | no aplica | no disponible (existe `results_6.4k.json`, no reproducido) | no disponible | HuggingFace, 0 descargas, 0 likes |
| LLaVA-1.5-7B sin sonda | VLM generativo (modelo base) | aproximadamente 7 mil millones (modelo base) | no disponible en esta informacion | no disponible | no disponible en esta informacion | ampliamente disponible, pero no incluido en este repositorio |
| TruthPrint | Release asociada mencionada en la model card | no disponible | no disponible | no disponible | no disponible | no disponible |
| Variantes reducidas de HaloProbe (sin caracteristicas externas) | Sonda MLP ablacionada | no disponible | no aplica | no disponible | no disponible | no disponible (solo se infiere su existencia por el nombre "full-method") |

## Limitaciones y advertencias

- Licencia no declarada: sin terminos explicitos no hay garantia de uso comercial. Ademas, el uso queda condicionado por la licencia del modelo base LLaVA-1.5-7B, que debe verificarse por separado y no se detalla en este repositorio.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de reproducibilidad.
- Cobertura de dominio limitada: las caches etiquetadas son de COCO y AMBER; el comportamiento fuera de esos dominios no esta documentado y la generalizacion es incierta.
- Dependencia del modelo base: los resultados solo son validos con la version exacta de LLaVA-1.5-7B y con la misma implementacion de extraccion de caracteristicas; cualquier cambio en el checkpoint o en el codigo de extraccion puede degradar la sonda.
- Riesgo de falsos positivos y falsos negativos: no se aportan cifras de precision, recall ni calibracion, por lo que no es posible estimar el coste de los errores en produccion.
- Variabilidad entre semillas: la existencia de tres checkpoints distintos indica sensibilidad a la inicializacion; el uso de una sola semilla puede dar resultados menos estables que el ensemble.
- No apto para inferencia end-to-end: no genera texto ni interpreta imagenes por si mismo; necesita LLaVA-1.5-7B para producir las caracteristicas de entrada.
- Sin informacion sobre sesgos, idiomas soportados ni comportamiento con poblaciones o dominios subrepresentados.
- Metadatos atipicos: las fechas de creacion y actualizacion registradas (2026-09-12) no coinciden con el periodo habitual de publicacion, lo que conviene tener en cuenta al citar el repositorio.
- Los resultados de busqueda web disponibles no contienen informacion relacionada con el modelo: todas las referencias encontradas tratan sobre la muerte y el funeral del rey Harald V de Noruega y son irrelevantes para esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pbcong/haloprobe-coco-llava15-7b
- Script de construccion de caracteristicas (ruta interna del repositorio): `code/haloprobe_cache.py`
- Script de entrenamiento de la sonda completa (ruta interna del repositorio): `code/train_haloprobe_full.py`
- Resultados por semilla y ensemble (ruta interna del repositorio): `results/results_6.4k.json`
- Release asociada TruthPrint: mencionada en la model card, sin URL proporcionada
- Paper, blog o demo del metodo HaloProbe: no disponible
- Resultados de busqueda web relevantes: no disponible (los resultados devueltos no guardan relacion con el modelo)
