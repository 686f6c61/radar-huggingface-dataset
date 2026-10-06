# Indee99/qwen2.5-1.5b-financial-news-impact

## Resumen

`Indee99/qwen2.5-1.5b-financial-news-impact` es un ajuste fino (fine-tuning) del modelo `Qwen/Qwen2.5-1.5B-Instruct` de Alibaba, desarrollado por el usuario Indee99. El modelo está especializado en el análisis del impacto de noticias financieras: a partir de un titular y un fragmento de texto, devuelve una salida estructurada en JSON con el tipo de evento, las entidades implicadas, la dirección e intensidad del impacto y una justificación textual. Es, por tanto, un modelo orientado a una tarea concreta de extracción y clasificación, no un asistente generalista.

Técnicamente se trata de un transformer decoder-only denso de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), entrenado mediante QLoRA en 4 bits NF4 con LoRA de rango 16, alpha 32 y adaptadores aplicados a todas las capas lineales. Los pesos finales se han fusionado y se distribuyen en formato safetensors bajo licencia Apache 2.0. El entrenamiento se realizó sobre un conjunto muy reducido: 149 elementos sintéticos de noticias financieras generadas por `openai/gpt-oss-120b`, con pérdida de validación mínima de 0,8618 en la época 3.

Su relevancia es limitada pero específica: demuestra un patrón de destilación de tareas estructuradas (clasificación y extracción) sobre un modelo pequeño de la familia Qwen2.5, lo que permite ejecutarlo en hardware de consumo. No obstante, el volumen de datos de entrenamiento es muy bajo y las etiquetas provienen de un modelo profesor, no de resultados reales de mercado, por lo que su uso en producción requiere validación adicional. El propio autor advierte que no constituye asesoramiento de inversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1,54 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | Entrenamiento QLoRA en 4-bit NF4; pesos publicados fusionados en safetensors sin cuantizar. No se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 3,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only autoregresivo con normalizacion RMSNorm y atencion con query, key y value agrupadas (GQA). Sobre esta base se aplico un ajuste fino supervisado mediante QLoRA: cuantizacion de la base en 4 bits NF4, adaptadores LoRA con rango r=16, alpha=32 y aplicados a todas las capas lineales. Una vez finalizado el entrenamiento, los adaptadores se fusionaron (merged) con los pesos base, de modo que el repositorio contiene un unico modelo consolidado listo para inferencia estandar con `transformers`, sin necesidad de cargar PEFT por separado.

El conjunto de entrenamiento es notablemente pequeno: 149 elementos de noticias financieras sinteticas sobre empresas reales pero con eventos ficticios, generados por el modelo profesor `openai/gpt-oss-120b`. La tarea consiste en producir una salida JSON con los campos `event_type` (11 categorias posibles), `primary_entity`, `mentioned_entities`, `impact_direction`, `magnitude` y `rationale`. La mejor perdida de validacion registrada fue de 0,8618 en la epoca 3. El autor indica que en inferencia debe usarse el mismo mensaje de sistema empleado en el entrenamiento, disponible en `task2_genai/news_prompts.py` bajo el identificador `ANALYSIS_SYSTEM`. No se documentan fases de RLHF ni DPO posteriores al ajuste supervisado.

## Capacidades

- Analisis de impacto de noticias financieras: dado un titular y un fragmento, clasifica el evento y estima su impacto sobre la entidad principal.
- Generacion de salida estructurada en JSON con los campos `event_type`, `primary_entity`, `mentioned_entities`, `impact_direction`, `magnitude` y `rationale`.
- Clasificacion en 11 tipos de evento financiero (categorias definidas en los datos de entrenamiento).
- Extraccion de entidades: identifica la entidad principal y las entidades mencionadas en el texto.
- Conversacion multi-turno heredada del modelo base Qwen2.5-1.5B-Instruct (etiqueta `conversational`).
- Capacidades generales de generacion de texto, razonamiento basico y codigo propias de la base Qwen2.5-1.5B-Instruct, aunque el ajuste fino esta orientado a la tarea financiera.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` (despliegue como endpoint).
- Soporte de tool calling y function calling: no documentado especificamente para este ajuste; el modelo base lo soporta parcialmente, pero no hay confirmacion para la version ajustada.
- Capacidades multilingues: no disponible.
- Vision, audio o modo de razonamiento explicito (thinking mode): no disponible / no soportado.

## Casos de uso

- Analisis automatizado de titulares financieros: el modelo recibe un titular y un resumen y devuelve, en un unico paso, el tipo de evento, la direccion del impacto y una justificacion. Es adecuado por su salida JSON directamente parseable, lo que evita postprocesado con expresiones regulares.
- Enriquecimiento de pipelines de noticias: integrado en un flujo de ingesta, permite etiquetar cada noticia con metadatos estructurados (entidad, direccion, magnitud) antes de almacenarla en una base de datos o un motor de busqueda.
- Alertas de mercado en tiempo real: desplegado como microservicio, puede clasificar flujos continuos de noticias y disparar alertas cuando detecta un evento con impacto significativo sobre una entidad seguida.
- Extraccion de entidades para analitica: alimenta dashboards y sistemas de agregacion que requieren saber que empresas aparecen en cada noticia y con que rol.
- Preprocesamiento para sistemas RAG: sus etiquetas estructuradas sirven como metadatos de filtrado antes de la recuperacion semantica sobre un corpus de noticias.
- Prototipado e investigacion en NLP financiero: al ser un modelo de 1,5B con licencia Apache 2.0, es util como linea base en experimentos academicos sobre clasificacion de eventos financieros.
- Generacion de resumenes de impacto para boletines internos: produce una justificacion breve (`rationale`) que puede revisarse manualmente antes de su publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion minima del ajuste fino: 0,8618 en la epoca 3. No hay cifras de MMLU, HumanEval, GSM8K ni de tareas financieras estandarizadas, ni comparaciones con otros modelos en dichas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en fp16/bf16 (coincide con el tamano del repositorio), del orden de 1,6 GB en int8 y en torno a 0,9-1,0 GB en int4.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (por ejemplo RTX 3050, RTX 3060, RTX 4060). Con cuantizacion int8 o int4 basta con GPUs de gama de entrada con 2-4 GB, e incluso puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, de forma holgada. En una RTX 3060 de 12 GB o una RTX 4090 queda amplio margen para lotes grandes o para ejecutar otras tareas en paralelo. No requiere A100 ni H100.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (compatible con arquitectura Qwen2.5), y llama.cpp u Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Indee99/qwen2.5-1.5b-financial-news-impact` | ~1,54B | no disponible | Perdida de validacion 0,8618 (ajuste fino) | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-1.5B-Instruct` (base) | ~1,54B | no disponible en la informacion proporcionada | no disponible | Apache 2.0 | Hugging Face |
| Otros ajustes financieros pequenos de la familia Qwen2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Volumen de entrenamiento muy reducido: solo 149 ejemplos sinteticos, lo que limita la generalizacion y aumenta el riesgo de sobreajuste a los patrones concretos de esos datos.
- Etiquetas generadas por un modelo profesor (`openai/gpt-oss-120b`), no derivadas de resultados reales de mercado; las anotaciones reflejan el criterio del profesor, no la realidad financiera.
- Riesgo de alucinacion: al ser un modelo de 1,5B ajustado con pocos datos, puede inventar entidades, tipos de evento o magnitudes cuando el texto de entrada se aleja del dominio de entrenamiento.
- Advertencia explicita del autor: no constituye asesoramiento de inversión. No debe utilizarse para tomar decisiones financieras sin supervision humana.
- Dependencia del mensaje de sistema: para obtener resultados consistentes es necesario replicar el `ANALYSIS_SYSTEM` del entrenamiento; su uso con otro prompt puede degradar notablemente la calidad de la salida.
- Idiomas soportados: no disponible. Los datos de entrenamiento parecen estar en ingles, por lo que el comportamiento en castellano u otros idiomas no esta verificado.
- Longitud de contexto del ajuste: no disponible en la documentacion proporcionada.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al derivar de Qwen2.5 conviene revisar las condiciones del modelo base.
- Modelo sin adopcion: cero descargas y cero likes en el momento de la consulta, sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Indee99/qwen2.5-1.5b-financial-news-impact
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de codigo y evaluacion: https://github.com/indeewara/CDAZZDEV-MLE-IndeewaraJayasuriya (directorio `task2_genai`, archivo `news_prompts.py`)
- Documentacion de la familia Qwen2.5 en Alibaba Cloud: https://www.alibabacloud.com/blog/602121
- Entrada de Qwen en Wikipedia: https://en.wikipedia.org/wiki/Qwen
- Articulo sobre sesgo posicional en modelos Qwen2.5 aplicado a decisiones financieras: https://dl.acm.org/doi/full/10.1145/3768292.3770394
