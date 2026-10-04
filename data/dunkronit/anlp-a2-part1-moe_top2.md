# DunkRonit/anlp-a2-part1-moe_top2

# DunkRonit/anlp-a2-part1-moe_top2

## Resumen

DunkRonit/anlp-a2-part1-moe_top2 es un transformer decoder-only entrenado desde cero para traducir vietnamita y japones a ingles. Lo desarrolla el usuario DunkRonit en el contexto de un trabajo academico (tag `anlp-assignment`, con la ejecucion registrada en Weights & Biases bajo el proyecto `anlp-a2-part1`), y se publica como una variante de la parte 1 de dicha practica. No es un modelo orientado a produccion: acumula 0 descargas y 0 likes en HuggingFace y no declara licencia.

El modelo tiene 17.020.800 parametros totales, de los cuales 13.481.856 estan activos por token, lo que indica una arquitectura mixture-of-experts (MoE) con enrutamiento top-2 sobre la capa FFN. Se entreno sobre 39.003.133 tokens procedentes del dataset belumind/en-vi-ja-curated-500k-triplets. El repositorio ocupa 0,1 GB y los pesos se distribuyen en formato safetensors.

Su relevancia es fundamentalmente academica y experimental: sirve como banco de pruebas para comparar variantes de FFN (MoE frente a densas) en tareas de traduccion con recursos limitados, y como ejemplo minimo de implementacion MoE reproducible. No sustituye a sistemas de traduccion establecidos ni cuenta con evaluacion publica de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN mixture-of-experts de enrutamiento top-2 |
| Parametros totales | 17.020.800 |
| Parametros activos | 13.481.856 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | vietnamita (vi), japones (ja) e ingles (en); la generacion es siempre hacia el ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Tokens de entrenamiento | 39.003.133 |
| Dataset de entrenamiento | belumind/en-vi-ja-curated-500k-triplets |
| Tarea declarada (pipeline) | translation |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only entrenado desde cero, sin inicializacion a partir de un modelo preentrenado. La innovacion concreta de esta variante es el bloque FFN: en lugar de una capa feed-forward densa, emplea una mezcla de expertos con enrutamiento top-2, de modo que cada token activa dos expertos y el coste computacional por token queda por debajo del de un modelo denso de parametros totales equivalentes. Esa diferencia se refleja en la brecha entre los 17.020.800 parametros totales y los 13.481.856 activos por token (aproximadamente un 79 % de los parametros totales activados en cada paso).

El entrenamiento consumio 39.003.133 tokens del dataset belumind/en-vi-ja-curated-500k-triplets, una coleccion de tripletas en vietnamita, japones e ingles. La model card no documenta el uso de RLHF, DPO ni ningun otro ajuste por preferencias, ni detalla la composicion exacta del dataset, la estrategia de tokenizacion, el numero de expertos totales, el criterio de balanceo de carga ni la longitud de contexto con la que se entreno. La interfaz de inferencia es estrictamente por continuacion de prompt: se introduce `<vi> texto <en>` o `<ja> texto <en>` y el modelo continua generando en ingles hasta emitir `<eos>`.

## Capacidades

- Traduccion de vietnamita a ingles mediante el prefijo `<vi> ... <en>`.
- Traduccion de japones a ingles mediante el prefijo `<ja> ... <en>`.
- Generacion autoregresiva por continuacion de secuencia, con terminacion mediante token `<eos>`.
- Manejo de tres idiomas en el vocabulario o el corpus: vi, ja, en.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente, planificacion multi-paso ni uso de herramientas externas.
- No hay soporte declarado de vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades multilingues mas alla de los tres idiomas indicados, ni traduccion inversa (en→vi, en→ja) o cruzada (vi→ja, ja→vi).

## Casos de uso

- Practica academica reproducible: el modelo se carga con `src.part1.model.Transformer.from_pretrained("DunkRonit/anlp-a2-part1-moe_top2")` desde el repositorio de la asignatura, lo que permite reproducir el experimento y comparar la variante `moe_top2` frente a otras variantes de FFN del mismo trabajo.
- Investigacion sobre enrutamiento MoE en modelos pequenos: con 17 M de parametros totales y 13,48 M activos, es un banco de pruebas barato para medir el efecto del enrutamiento top-2 en calidad de traduccion, uso de memoria y latencia.
- Generacion de datos sinteticos de aumento: se pueden traducir grandes volumenes de texto vietnamita o japones a ingles en CPU para crear pares adicionales de entrenamiento, asumiendo que la calidad debe filtrarse posteriormente.
- Prototipado de pipelines de traduccion sin GPU: al ocupar decenas de megabytes, se puede integrar en scripts de preprocesamiento o en entornos sin acelerador para validar el flujo completo antes de escalar a un modelo mayor.
- Experimentos de destilacion y comparacion de arquitecturas: sirve como modelo estudiante de referencia en experimentos de compresion o como linea base de muy bajo coste frente a traductores neuronales comerciales.
- Docencia de arquitecturas transformer: su tamano reducido y el codigo de carga explicito permiten inspeccionar pesos, capas de expertos y el mecanismo de enrutamiento en un aula o en un cuaderno de investigacion.
- Evaluacion de robustez en idiomas de bajos recursos: permite estudiar como se degrada la salida en entradas vietnamitas o japonesas con ruido, code-switching o dominios alejados del corpus de entrenamiento, aunque sin referencia de calidad publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas BLEU, chrF, COMET ni resultados en tareas estandar (MMLU, HumanEval, GSM8K u otras), y la busqueda web no aporto ninguna fuente tecnica adicional: los resultados devueltos corresponden a paginas generales de YouTube, sin relacion con el modelo.

## Requisitos de hardware

- Peso de los parametros en FP32: aproximadamente 68 MB (17,02 M × 4 bytes).
- Peso en FP16/BF16: aproximadamente 34 MB.
- Peso en INT8: aproximadamente 17 MB; en INT4, aproximadamente 8,5 MB (cuantizacion no publicada, solo estimacion teorica).
- VRAM total estimada para inferencia: por debajo de 1 GB en cualquier precision habitual, incluyendo cache de activaciones para secuencias cortas o medias.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integradas y en CPU.
- No requiere GPU dedicada para funcionar; el cuello de botella sera la latencia de generacion en CPU, no la memoria.
- Opciones de despliegue: carga mediante `transformers` y el codigo propio del repositorio de la asignatura, que define `src.part1.model.Transformer`. No hay pesos GGUF, por lo que no es desplegable directamente con llama.cpp u Ollama, ni se documenta compatibilidad con vLLM o TGI (que ademas requeririan un modelo con arquitectura registrada en esas librerias).
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DunkRonit/anlp-a2-part1-moe_top2 | 17,02 M totales / 13,48 M activos (MoE top-2) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Helsinki-NLP/opus-mt-vi-en (MarianMT) | del orden de 70-80 M (dato no confirmado en la informacion proporcionada) | no disponible | metricas publicadas en la model card del autor | licencia declarada por el autor del modelo (consultar) | HuggingFace, ampliamente utilizado |
| NLLB-200-distilled-600M (Meta) | 600 M (denso) | no disponible | metricas publicadas por Meta | licencia especifica del proyecto NLLB (consultar) | HuggingFace, ampliamente utilizado |

La comparacion de rendimiento no puede completarse: no existen resultados de benchmarks para el modelo analizado. Ademas, la diferencia de escala es de uno a dos ordenes de magnitud, de modo que cualquier comparacion de calidad seria meramente cualitativa. Los datos de los modelos alternativos deben verificarse en sus propias model cards.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion cuantitativa: se desconoce la calidad real de las traducciones (BLEU, chrF o COMET) y no hay comparacion con lineas base.
- Licencia no disponible: no se puede asumir permiso de uso comercial, redistribucion ni obra derivada. En ausencia de licencia explicita, el uso en produccion es juridicamente arriesgado.
- Modelo de 17 M de parametros entrenado con 39 M de tokens: la capacidad de generalizacion es muy limitada y es esperable una tasa alta de errores gramaticales, omisiones y terminologia incorrecta.
- Riesgo de alucinacion: al ser un modelo generativo por continuacion, puede producir contenido plausible pero no fiel al texto de origen, especialmente con entradas fuera de dominio.
- La longitud de contexto no esta documentada, por lo que se desconoce el limite practico de longitud de entrada y como se comporta con textos largos.
- Solo traduce hacia el ingles y solo desde vietnamita y japones; no cubre otras direcciones ni otros idiomas.
- No hay pesos cuantizados ni formato GGUF, lo que limita el despliegue en herramientas de inferencia estandar.
- El modelo requiere codigo propio (`src.part1.model.Transformer`) que no forma parte del repositorio de pesos; sin ese codigo, la carga directa con `transformers` puede no funcionar.
- Un modelo con 0 descargas y 0 likes no ha sido validado por la comunidad; no hay informes independientes de fallos, sesgos o comportamiento en produccion.
- Sesgos conocidos: no documentados por el autor. Al entrenarse sobre un corpus curado de tripletas vi/ja/en, es probable que herede sesgos de dominio y de registro de ese corpus, pero no hay analisis disponible.
- No apto para uso clinico, legal o financiero sin revision humana y sin una evaluacion de calidad previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DunkRonit/anlp-a2-part1-moe_top2
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/dunkronit-iiit-hyderabad/anlp-a2-part1/runs/moe_top2-8210c110
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Repositorio de la asignatura (referenciado en la model card como "assignment repo", sin URL publica indicada): no disponible
- Paper o informe tecnico: no disponible
- Demo: no disponible
- La busqueda web no devolvio enlaces tecnicos relevantes sobre este modelo; los resultados obtenidos correspondian a paginas generales de YouTube y no se han incluido.
