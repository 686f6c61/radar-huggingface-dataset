# raulboix/distilbert-imdb-sentiment

## Resumen

`raulboix/distilbert-imdb-sentiment` es un modelo de clasificación de texto publicado por el usuario raulboix en HuggingFace, consistente en un DistilBERT (`distilbert-base-uncased`) afinado sobre un subconjunto del dataset IMDB de reseñas de cine. El problema que aborda es la clasificación binaria de sentimiento (positivo/negativo) en texto en inglés, aunque la model card no declara explícitamente los idiomas soportados.

El modelo tiene 66.955.010 parámetros y un repositorio de 0,3 GB en formato safetensors, con licencia Apache 2.0. El entrenamiento documentado es deliberadamente mínimo: 600 reseñas de IMDB durante 1,0 épocas en CPU, con un tiempo de 208,9 segundos. Sobre 200 reseñas de test reporta una accuracy de 0,6900 y un F1 de 0,6437.

Su relevancia es acotada: se trata de un experimento reproducible y de bajo coste computacional, útil como ejemplo docente, como baseline rápido o como pieza de pre-etiquetado, pero no como un clasificador de sentimiento de calidad productiva. No se han publicado datos de contexto máximo, composición detallada del dataset, sesgos ni evaluaciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder destilado (DistilBERT); no se detallan numero de capas ni cabezas en la informacion disponible |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la model card no especifica la longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors, sin variantes GGUF, ONNX ni cuantizadas en el repositorio |
| Idiomas soportados | no disponibles (no declarados en la metadata ni en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Modelo base | distilbert-base-uncased |
| Dataset de entrenamiento | stanfordnlp/imdb (subconjunto de 600 resenas) |
| Tamano del repositorio | 0,3 GB |
| Autor | raulboix |
| Fecha de creacion | 2026-10-25 |
| Fecha de actualizacion | 2026-10-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a DistilBERT, un transformer encoder obtenido por destilacion de conocimiento a partir de BERT, tal y como indica el campo `base_model` (`distilbert/distilbert-base-uncased`). La informacion proporcionada no incluye el numero de capas, dimensiones ocultas, cabezas de atencion ni el mecanismo exacto de destilacion empleado en el modelo original.

El ajuste fino se realizo sobre 600 resenas del dataset IMDB durante 1,0 epocas, en CPU y con un coste de 208,9 segundos. No se documenta el uso de RLHF, DPO ni ninguna otra fase de alineacion, ni se detalla la composicion del subconjunto, la semilla, la tasa de aprendizaje, el tamano de batch ni el criterio de particion train/test. La evaluacion reportada se hizo sobre 200 resenas de test. No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Clasificacion de texto binaria orientada a analisis de sentimiento (positivo/negativo) sobre resenas de cine.
- Generacion de etiquetas con puntuacion de confianza asociada a traves del pipeline `text-classification` de Transformers.
- Ajuste fino adicional: al ser un checkpoint completo de DistilBERT, puede reentrenarse sobre otros dominios o taxonomias de clasificacion.
- Extraccion de caracteristicas: al conservar el encoder, es reutilizable como extractor de representaciones para tareas posteriores (no documentado por el autor).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, modo thinking, vision ni audio.
- No se documentan capacidades multilingues; el modelo base es `uncased` y el dataset es de resenas en ingles, pero la model card no declara cobertura de idiomas.
- No se documenta soporte de contexto largo ni de conversaciones multi-turno.

## Casos de uso

- Pre-etiquetado en pipelines de anotacion: el modelo puede etiquetar grandes volumenes de resenas y reservar la revision humana para los casos de baja confianza, reduciendo el coste de anotacion manual. Adecuado por su bajo coste de inferencia (67 M de parametros), con la advertencia de su accuracy de 0,6900.
- Baseline en experimentos de ajuste fino: sirve como referencia rapida para comparar variantes de dataset, tecnicas de aumento de datos o hiperparametros antes de escalar a modelos mayores.
- Docencia y demostracion de pipelines de NLP: ejemplo completo y reproducible de extremo a extremo (carga del dataset, entrenamiento en CPU en 208,9 s, evaluacion) para cursos de introduccion a Transformers.
- Filtrado y curacion de corpus: clasificacion preliminar de resenas para separar subconjuntos positivos y negativos en la construccion de datasets, con verificacion posterior.
- Triaje de opiniones de usuarios en soporte: clasificacion de primer nivel de encuestas o resenas para enrutar casos negativos a un equipo humano, siempre con supervision y sin decision automatica.
- Pruebas de integracion y CI: modelo ligero (0,3 GB, formato safetensors) para validar extremo a extremo pipelines de clasificacion, serializacion, servidores de inferencia y monitorizacion antes de desplegar modelos de mayor tamano.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 0,6900 | 200 resenas de test de IMDB (subconjunto) |
| F1 | 0,6437 | 200 resenas de test de IMDB (subconjunto) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas en la informacion disponible. Tampoco se aportan intervalos de confianza; con 200 muestras, el margen de error de la accuracy es del orden de ±3 puntos porcentuales, por lo que las cifras deben interpretarse como orientativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 268 MB en FP32 (66,9 M de parametros x 4 bytes), unos 134 MB en FP16 y unos 67 MB en INT8, sin contar activaciones ni overhead del runtime. Son estimaciones calculadas a partir del numero de parametros, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; el modelo esta pensado para ejecutarse en CPU. No se requieren A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer (GTX 1050 en adelante) e incluso en CPU. El entrenamiento documentado se completo en CPU en 208,9 s para 600 muestras.
- Opciones de despliegue: pipeline `text-classification` de HuggingFace Transformers, ONNX Runtime si se exporta el modelo, o un servidor HTTP propio (por ejemplo FastAPI) con batching. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no son viables sin conversion y cuantizacion previas. vLLM o TGI son tecnicamente posibles pero desproporcionados para este tamano.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el tiempo de entrenamiento (208,9 s para 600 muestras y 1,0 epocas en CPU), que no equivale a latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en IMDB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raulboix/distilbert-imdb-sentiment | 66.955.010 | no disponible | 0,6900 (200 resenas) | Apache 2.0 | HuggingFace, 0 descargas |
| distilbert-base-uncased (modelo base, sin ajuste) | no disponible en la informacion | no disponible | no disponible | Apache 2.0 | HuggingFace |
| Alternativas afinadas en IMDB | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos alternativos, por lo que no es posible establecer una comparacion cuantitativa fiable. Cualquier comparacion con checkpoints de DistilBERT afinados en IMDB requeriria evaluar ambos modelos sobre el mismo split.

## Limitaciones y advertencias

- Rendimiento limitado: accuracy de 0,6900 y F1 de 0,6437 sobre 200 resenas, muy por debajo de lo esperable en un clasificador de sentimiento bien ajustado sobre IMDB. No es apto para produccion sin una reevaluacion y un reentrenamiento.
- Entrenamiento minimo: 600 ejemplos y 1,0 epocas, sin validacion cruzada ni busqueda de hiperparametros documentada; riesgo alto de infraajuste y de resultados inestables ante cambios de dominio.
- Evaluacion reducida: 200 resenas de test implican un margen de error notable; las metricas publicadas no deben tratarse como definitivas.
- Dominio estrecho: resenas de cine en ingles como unico dominio y tarea documentada; el comportamiento en otros generos textuales o idiomas no esta caracterizado.
- Sesgos conocidos: no documentados por el autor. Al entrenar sobre IMDB, puede heredar sesgos de genero, cultura o tematica presentes en las resenas de cine.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza, especialmente en textos sarcasticos, mixtos o fuera de dominio.
- Idioma: no se declaran idiomas soportados; no hay garantia de funcionamiento fuera del ingles.
- Contexto: no se especifica la longitud maxima de secuencia; textos largos pueden truncarse silenciosamente segun la configuracion del tokenizador.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar las obligaciones de atribucion y las condiciones del modelo base y del dataset IMDB.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni issues documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raulboix/distilbert-imdb-sentiment
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/stanfordnlp/imdb

No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.
