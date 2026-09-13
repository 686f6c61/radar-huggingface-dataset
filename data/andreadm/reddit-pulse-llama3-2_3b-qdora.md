# andreadm/reddit-pulse-llama3.2_3b-qdora

## Resumen

reddit-pulse-llama3.2_3b-qdora es un adaptador PEFT de tipo QDoRA+ (DoRA sobre las proyecciones de atención con tasas de aprendizaje LoRA+) montado sobre meta-llama/Llama-3.2-3B cuantizado en 4 bits NF4. Lo desarrolla el usuario andreadm y resuelve una tarea muy concreta: clasificar textos cortos en inglés sobre economía en tres categorías direccionales de expectativas de inflación (down, neutral, up). No es un modelo de sentimiento: "inflation falls sharply" es una buena noticia pero se etiqueta como down, mientras que "rents are out of control" es una mala noticia pero se etiqueta como up; la dirección se refiere al nivel de precios, no al tono del autor.

El checkpoint es uno de los clasificadores de modelo pequeno que sustentan la senal de inflacion extraida de Reddit en el trabajo de Del Monaco, Longo, Marcucci y Tafani (2026), publicado en el Journal of Applied Econometrics y disponible como documento de trabajo del Banco de Italia (Questioni di Economia e Finanza n. 1028). Su funcion prevista es etiquetar grandes volumenes de titulares y publicaciones informales en inglés para despues agregar las predicciones en el tiempo y construir un indicador de alta frecuencia, no emitir juicios fiables a partir de una sola frase.

Es relevante ahora porque demuestra un patron de bajo coste computacional (adaptador de 0,1 GB sobre una base de 3B cuantizada) para convertir lenguaje natural de redes sociales en senal econometrica estructurada, con una licencia Llama 3.2 y un pipeline reproducible mediante las librerias peft, transformers y bitsandbytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2 3B) con adaptador PEFT QDoRA+ y cabeza de clasificacion de 3 clases |
| Parametros totales | 3,21 B en el modelo base Llama-3.2-3B; el repositorio del adaptador ocupa 0,1 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; el ejemplo de uso trunca a 1024 tokens y el entrenamiento se hizo con titulos de longitud mediana 11 palabras (maximo 52) |
| Tipos de cuantizacion | Base cargada en 4 bits NF4 con doble cuantizacion (bitsandbytes); adaptador en safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Licencia comunitaria de Llama 3.2) |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base debe descargarse aparte desde meta-llama/Llama-3.2-3B |
| Libreria | peft |
| Pipeline | text-classification |
| Etiquetas | 0 = down (-1), 1 = neutral (0), 2 = up (+1) |

## Arquitectura y entrenamiento

La base es Llama 3.2 3B, un transformer decoder-only de 3,21 B de parametros con 28 capas, atencion con consultas agrupadas (GQA, 24 cabezas de consulta y 8 de clave/valor), RoPE y ventana de contexto de 128 000 tokens. Sobre ella se anade una cabeza de clasificacion de secuencia de tres vias y un adaptador QDoRA+: se aplica DoRA (descomposicion en magnitud y direccion del update de pesos) sobre las proyecciones de atencion, con tasas de aprendizaje LoRA+ y cuantizacion del modelo base en 4 bits NF4 con doble cuantizacion. El adaptador resultante es de 0,1 GB, lo que permite entrenar y desplegar en hardware muy modesto.

Los datos de entrenamiento son titulos en inglés de los subreddits r/economy, r/Economics y r/wallstreetbets sobre inflacion en Estados Unidos entre 2008 y 2022, con la perdida balanceada por clase para mitigar el desequilibrio del corpus. La evaluacion se realiza sobre el split de test reservado del conjunto de referencia de inflacion de Reddit descrito en el articulo (semilla 1361883482). No se documenta en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases de RLHF o DPO; al tratarse de un ajuste supervisado de clasificacion, no se mencionan tecnicas de decodificacion especulativa ni atencion lineal.

Un detalle operativo destacable es que el config.json del repositorio ya incluye la cabeza de tres vias, los nombres de las etiquetas y el token de relleno, de modo que basta con pasar el nombre del repositorio al tokenizador y a la configuracion. El autor advierte explicitamente de que no debe pasarse el nombre del repositorio directamente a AutoModelForSequenceClassification, porque el atajo de adaptadores de transformers reconstruye el adaptador DoRA con logits distintos a los del modelo entrenado.

## Capacidades

- Clasificacion de texto en tres clases direccionales: down (los precios bajan), neutral (sin senal direccional) y up (los precios suben).
- Procesamiento de textos cortos e informales en inglés de tematica economica y financiera (titulares, titulos y comentarios de redes sociales).
- Distincion entre direccion del nivel de precios y tono o postura del autor, algo que los modelos de sentimiento genericos no resuelven.
- Inferencia por lotes con padding a la izquierda sobre textos truncados hasta 1024 tokens.
- Integracion en pipelines econometricos como generador de etiquetas masivas que despues se agregan por periodo.
- No dispone de generacion de texto libre, razonamiento multi-paso, tool calling, function calling, capacidades de agente, vision, audio ni modo de pensamiento. Es exclusivamente un clasificador.

## Casos de uso

- Construccion de indicadores de alta frecuencia de expectativas de inflacion: el modelo etiqueta miles de titulares por periodo y la media de las etiquetas (en la codificacion -1/0/+1) se agrega para obtener una serie temporal que alimenta modelos de prevision macroeconomica, tal como se hace en el articulo de referencia.
- Investigacion academica en economia y finanzas: permite replicar y extender estudios sobre expectativas de inflacion a partir de texto no estructurado, con un coste de computo que cabe en una sola GPU de gama media.
- Monitorizacion de opinion publica para bancos centrales y think tanks: seguimiento diario del discurso en redes sociales sobre precios, con la advertencia de que solo cubre registros en inglés y el periodo 2008-2022.
- Analisis de riesgo reputacional y de expectativas en mesas de analisis de mercado: agregacion de la senal direccional como variable auxiliar en modelos de nowcasting de inflacion.
- Etiquetado previo para anotacion humana: el modelo puede usarse como prefiltro en tareas de anotacion de corpus economicos, revisando manualmente solo los casos con menor confianza.
- Filtrado de corpus para entrenamiento de otros modelos: separar textos con informacion direccional sobre precios de los que no la contienen, reduciendo el ruido en corpus econometricos de gran tamano.
- Docencia y prototipado de clasificadores especializados: ejemplo completo de ajuste QDoRA+ sobre una base de 3B con bitsandbytes, util como plantilla para adaptar clasificadores de dominio en recursos limitados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test reservado del Reddit inflation gold set (semilla 1361883482):

| Metrica | Valor |
|---|---|
| Accuracy | 0,7770 |
| F1 ponderado (weighted) | 0,7758 |
| F1 macro | 0,7639 |
| ROC-AUC macro (one-vs-rest) | 0,9009 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en la misma tarea, ni desgloses por clase mas alla de la nota cualitativa de que la clase down es la minoria y la mas dificil.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2-3 GB con la base en 4 bits NF4 y el adaptador cargado, mas el overhead de activaciones y de la cache KV durante la clasificacion por lotes.
- VRAM estimada si se usa la base en bfloat16 sin cuantizar: aproximadamente 6,5 GB solo para pesos, mas activaciones.
- GPU recomendadas: cualquier GPU con 8 GB o mas de memoria, como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien funciona en GPUs de datacenter (A100, H100, L40S) sin necesidad de paralelismo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente con 8 GB o mas al cargar la base en 4 bits; el adaptador ocupa solo 0,1 GB.
- Opciones de despliegue: transformers con peft y bitsandbytes es la ruta soportada y documentada por el autor. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, y no conviene asumirlo, dado que el checkpoint es un adaptador QDoRA+ de clasificacion de secuencia que debe reconstruirse con el codigo de entrenamiento.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia de orden de magnitud, la clasificacion por lotes de textos de titulo sobre una base de 3B en 4 bits es viable en tiempo real en GPU de consumo, pero el autor no publica cifras.

## Comparativa con modelos similares

No se dispone de resultados comparables publicados en la informacion proporcionada. La tabla siguiente resume la comparacion cualitativa con alternativas habituales de la misma categoria.

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento comparable |
|---|---|---|---|---|---|
| reddit-pulse-llama3.2_3b-qdora | 3,21 B (base) + adaptador | 128 000 tokens en la base, uso con textos cortos | Clasificacion direccional de expectativas de inflacion (3 clases) | llama3.2 | Accuracy 0,777; F1 macro 0,7639; ROC-AUC 0,9009 en su gold set |
| meta-llama/Llama-3.2-3B (base) | 3,21 B | 128 000 tokens | Generacion de texto general | llama3.2 | no evaluado como clasificador direccional de inflacion |
| Clasificadores genericos de sentimiento financiero (por ejemplo, variantes de FinBERT) | no disponible | no disponible | Sentimiento positivo/negativo | no disponible | no disponible; la tarea de sentimiento no equivale a la direccion del nivel de precios |

## Limitaciones y advertencias

- Predicciones individuales ruidosas: el valor del modelo procede de promediar miles de predicciones por periodo, donde los errores idiosincrasicos se compensan; no debe usarse una sola etiqueta como conclusion.
- Dominio y registro restringidos: entrenado con titulos de r/economy, r/Economics y r/wallstreetbets sobre inflacion de Estados Unidos entre 2008 y 2022. Otros paises, otros registros y vocabulario posterior a 2022 quedan fuera de distribucion.
- Desequilibrio de clases: down es la clase minoritaria del conjunto de referencia y la mas dificil; aunque la perdida se balanceo durante el entrenamiento, la exhaustividad (recall) de down sigue siendo inferior.
- Textos cortos: el ajuste se hizo con titulos de mediana 11 palabras y maximo 52; los comentarios largos se truncan y no se vieron durante el entrenamiento.
- Ambiguedad semantica de la tarea: el modelo indica en que direccion se dice que van los precios, no la postura del autor ni si la noticia es buena o mala.
- Idioma: solo inglés. No hay soporte multilingue declarado, por lo que no es adecuado para corpus en castellano sin un reajuste especifico.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo solo emite una de tres etiquetas; el riesgo equivalente es la clasificacion erronea en textos ambiguos, ironicos o fuera de dominio.
- Licencia: se hereda la licencia comunitaria de Llama 3.2, que impone condiciones y restricciones de uso comercial (incluida la denominacion de "Built with Llama" y limites de uso aceptable) y obliga a revisar los terminos de Meta antes de cualquier despliegue en produccion.
- Caveat de integracion: no debe cargarse el repositorio directamente con AutoModelForSequenceClassification, ya que el atajo de adaptadores de transformers produce logits distintos a los del modelo entrenado. Es obligatorio seguir el procedimiento con PeftModel sobre la base cuantizada.
- Madurez y soporte: el repositorio no tiene descargas ni valoraciones en la informacion disponible, y la model card fue generada automaticamente con secciones de limitaciones genericas, por lo que conviene validar el comportamiento en el corpus propio antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andreadm/reddit-pulse-llama3.2_3b-qdora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Codigo de ajuste fino e inferencia sobre el corpus completo: https://github.com/andrea-dm/reddit-pulse
- Articulo de referencia: Del Monaco, A., Longo, L., Marcucci, J. y Tafani, I. (2026), "Reddit's 'pulse' on US inflation: forecasting with large language models", Journal of Applied Econometrics (en prensa).
- Version como documento de trabajo: Banca d'Italia, Questioni di Economia e Finanza (Occasional Papers) n. 1028, junio de 2026, doi:10.32057/0.QEF.2026.1028.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las referencias devueltas corresponden a paginas de ayuda no relacionadas con el modelo.
