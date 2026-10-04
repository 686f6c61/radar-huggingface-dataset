# DunkRonit/anlp-a2-part1-moe_top1

# DunkRonit/anlp-a2-part1-moe_top1

## Resumen

anlp-a2-part1-moe_top1 es un transformer decoder-only con capas de mezcla de expertos (MoE) entrenado desde cero por el usuario DunkRonit para traducir vietnamita y japones a ingles. Se trata de un modelo experimental muy pequeno: 17.020.800 parametros totales, de los cuales 11.712.384 estan activos por token (aproximadamente el 68,8 %). El modelo fue entrenado sobre 39.003.133 tokens del dataset belumind/en-vi-ja-curated-500k-triplets y se publica como parte de la asignatura ANLP (Advanced Natural Language Processing), segun se deduce de los tags `anlp-assignment` y del nombre del proyecto en Weights & Biases vinculado a IIIT Hyderabad.

La relevancia del modelo es fundamentalmente academica y metodologica: sirve como banco de pruebas para comparar variantes de capas feed-forward (la variante `moe_top1` frente a alternativas densas) dentro de una misma tarea de traduccion automatica. No es un modelo de produccion ni compite con sistemas de traduccion comerciales o de gran escala: su interes esta en la reproducibilidad de un experimento de enrutamiento MoE con presupuesto de computo minimo (el repositorio completo ocupa 0,1 GB).

El formato de entrada es una secuencia con etiqueta de idioma de origen, `<vi> fuente <en>` o `<ja> fuente <en>`, y el modelo continua generando texto en ingles hasta emitir `<eos>`. La carga no se realiza con `transformers.AutoModel`, sino con la clase personalizada `src.part1.model.Transformer.from_pretrained(...)` del repositorio de la asignatura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas FFN de tipo mixture-of-experts (variante `moe_top1`) |
| Parametros totales | 17.020.800 |
| Parametros activos | 11.712.384 por token (68,8 % del total) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; no se publican versiones cuantizadas) |
| Idiomas soportados | vietnamita (vi), japones (ja) e ingles (en); direccion de traduccion vi→en y ja→en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Pipeline declarado | translation |
| Tokens de entrenamiento | 39.003.133 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero, es decir, sin inicializacion a partir de un checkpoint preentrenado. La innovacion concreta del experimento reside en la capa feed-forward: en lugar de una FFN densa, se emplea una capa de mezcla de expertos con enrutamiento top-1 (`moe_top1`), de modo que cada token activa un unico experto. Esta configuracion explica la diferencia entre parametros totales (17.020.800) y parametros activos por token (11.712.384): el resto de los parametros permanece inactivo en cada paso de decodificacion.

El entrenamiento se realizo sobre 39.003.133 tokens procedentes del dataset belumind/en-vi-ja-curated-500k-triplets, un corpus de tripletas curado para traduccion entre vietnamita, japones e ingles. La model card no detalla la composicion exacta del dataset, el numero de expertos, la dimension del modelo, el numero de cabezas de atencion ni el uso de tecnicas de alineacion como RLHF o DPO. Tampoco se especifica si se aplicaron tecnicas de decodificacion especulativa, atencion lineal u otras optimizaciones. Los registros de entrenamiento estan disponibles en una ejecucion publica de Weights & Biases.

## Capacidades

- Traduccion de vietnamita a ingles mediante el prefijo `<vi> ... <en>`.
- Traduccion de japones a ingles mediante el prefijo `<ja> ... <en>`.
- Generacion autoregresiva de texto en ingles a partir de la secuencia de entrada, finalizando con `<eos>`.
- Modelado de lenguaje decoder-only condicionado por etiqueta de idioma de origen.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues adicionales mas alla de vi, ja y en: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Capacidades de codigo o matematicas: no documentadas.

## Casos de uso

- Traduccion vi→en y ja→en en entornos sin GPU: con 17 M de parametros el modelo ocupa del orden de 34 MB en FP16 y 68 MB en FP32, por lo que puede ejecutarse en CPU o en dispositivos embebidos donde un modelo de cientos de millones de parametros no cabe.
- Generacion de datos sinteticos para aumento de corpus: usar las traducciones del modelo como propuestas iniciales que luego se filtran o corrigen, aprovechando su bajo coste computacional para procesar volumenes grandes a bajo presupuesto.
- Preprocesado e indexacion de documentos multilingues: normalizar texto vietnamita o japones a ingles antes de alimentar un motor de busqueda o un sistema de recuperacion (RAG), de modo que todo el indice quede en un unico idioma.
- Experimentacion academica con enrutamiento MoE: comparar la variante `moe_top1` frente a variantes densas del mismo proyecto bajo identico dataset y presupuesto de tokens, midiendo si el enrutamiento top-1 aporta ventaja con solo 39 M de tokens de entrenamiento.
- Localizacion de contenido de bajo riesgo: subtitulado o traduccion de fichas de producto de vietnamita o japones a ingles para revision humana posterior, asumiendo que la salida requiere edicion.
- Filtrado y triaje de contenido multilingue: clasificar o resumir en ingles grandes volumenes de texto en vietnamita o japones antes de pasarlos a un modelo mayor, reduciendo el coste del pipeline global.
- Ensenanza de traduccion neuronal: reproducir el entrenamiento completo en un entorno de practicas gracias al tamano reducido del modelo y del dataset, algo inviable con arquitecturas de miles de millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de traduccion (BLEU, chrF, COMET) ni resultados en tareas generales como MMLU, HumanEval o GSM8K. Existe una ejecucion publica en Weights & Biases que podria contener curvas de perdida de entrenamiento, pero no se han proporcionado sus valores numericos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 68 MB en FP32 y 34 MB en FP16/BF16 para los pesos; el pico real depende de la implementacion y de la longitud de secuencia, que no esta documentada.
- Cabe en cualquier GPU consumer: incluso una GPU integrada o una GTX 1050 con 2 GB de VRAM es suficiente. Tambien es viable la inferencia en CPU.
- GPU recomendadas: no aplica; el modelo no requiere acelerador dedicado. Cualquier GPU con al menos 1 GB de memoria libre es mas que suficiente.
- Opciones de despliegue: la model card indica la carga mediante `src.part1.model.Transformer.from_pretrained("DunkRonit/anlp-a2-part1-moe_top1")` del repositorio de la asignatura, por lo que no es compatible de forma directa con `transformers.AutoModel`, y no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de 17 M de parametros con enrutamiento top-1, la latencia esperada es baja, pero no se publican mediciones.

## Comparativa con modelos similares

Los valores de los modelos alternativos proceden de sus respectivas model cards publicas y no se han verificado contra un benchmark comun; se incluyen como referencia orientativa de categoria, no como comparacion medida.

| Modelo | Parametros | Contexto | Direccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DunkRonit/anlp-a2-part1-moe_top1 | 17,0 M (11,7 M activos) | no disponible | vi→en, ja→en | no disponible | HuggingFace, requiere codigo propio |
| Helsinki-NLP/opus-mt-vi-en | ~77 M (MarianMT) | ~512 tokens | vi→en | abierta (consultar model card) | HuggingFace, compatible con `transformers` |
| Helsinki-NLP/opus-mt-ja-en | ~77 M (MarianMT) | ~512 tokens | ja→en | abierta (consultar model card) | HuggingFace, compatible con `transformers` |
| facebook/nllb-200-distilled-600M | 600 M | ~512 tokens | multilingue (200 idiomas) | CC-BY-NC-4.0 (no comercial) | HuggingFace, compatible con `transformers` |

Frente a estas alternativas, el modelo de DunkRonit es entre cuatro y treinta y cinco veces mas pequeno, pero carece de licencia declarada, de integracion estandar con `transformers` y de metricas de calidad publicadas, por lo que no es comparable en madurez ni en rendimiento verificado.

## Limitaciones y advertencias

- Direccion unica: el modelo solo traduce de vietnamita o japones a ingles; no se documenta traduccion inversa ni entre vietnamita y japones.
- Corpus de entrenamiento muy reducido: 39 M de tokens es un volumen bajo para traduccion automatica, lo que implica calidad limitada, omisiones y riesgo elevado de alucinacion, especialmente con frases largas o vocabulario especializado.
- Ausencia de licencia: al no declararse licencia, no existe autorizacion explicita de uso comercial ni condiciones claras de redistribucion. Debe tratarse como no apto para produccion hasta aclarar este punto.
- Sin benchmarks: no hay metricas objetivas de calidad, sesgo ni robustez, por lo que no es posible estimar su rendimiento real frente a alternativas.
- Dependencia de codigo externo: la carga requiere la clase `src.part1.model.Transformer` del repositorio de la asignatura, lo que complica la integracion en pipelines estandar y la reproducibilidad a largo plazo.
- Contexto no documentado: se desconoce la longitud maxima de secuencia soportada, dato critico para cualquier uso con parrafos o documentos largos.
- Enrutamiento top-1: el uso de un unico experto por token puede producir inestabilidad en la seleccion de expertos y un aprovechamiento desigual de la capacidad total del modelo.
- Caracter academico y no mantenido: 0 descargas y 0 likes en el momento de la consulta, publicacion vinculada a una asignatura y sin indicios de mantenimiento posterior.
- Sesgos: no se documenta ningun analisis de sesgo, y un corpus curado de 500 k tripletas no garantiza representatividad de registros, dialectos o dominios.
- Idiomas no cubiertos: no se declara soporte para castellano ni para ninguna otra lengua distinta de vi, ja y en.
- Fechas de metadatos: el repositorio figura como creado y actualizado en octubre de 2026, lo que sugiere un desfase en los metadatos de la plataforma y refuerza la necesidad de no tratarlo como un artefacto estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DunkRonit/anlp-a2-part1-moe_top1
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/dunkronit-iiit-hyderabad/anlp-a2-part1/runs/moe_top1-47decc72
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Repositorio de la asignatura con la clase `Transformer`: no disponible en la informacion proporcionada
- Paper, blog o demo adicional: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre el modelo; los unicos resultados obtenidos fueron paginas de inicio y registro de TikTok, sin ninguna relacion con el modelo.
