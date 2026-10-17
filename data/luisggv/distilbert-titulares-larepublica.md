# LuisGGV/distilbert-titulares-larepublica

## Resumen

DistilBERT – clasificador de titulares de La República es un modelo de clasificación de texto en español, ajustado por LuisGGV a partir de `distilbert/distilbert-base-multilingual-cased`. Su tarea es asignar cada titular del diario peruano La República a una de cuatro secciones: `politica`, `economia`, `deportes` y `ciencia_tecnologia`. Es un proyecto académico desarrollado dentro de la Tarea 1 del curso Python Intermedio del Diplomado de Ciencia de Datos (QLab), no un modelo de producción con mantenimiento continuo.

El interés técnico del modelo está en su método de construcción: solo se recopilaron 458 titulares de `larepublica.pe` (14 de octubre de 2026) y las etiquetas se generaron mediante supervisión débil con `gemini-3.5-flash-lite`, con una auditoría humana de 20 casos que arrojó 20/20 coincidencias. El ajuste se hizo con 3 épocas, batch 16, learning rate 5e-5 y `max_length=64`. Con 135.327.748 parámetros y un repositorio de 0,5 GB, el modelo es ligero y desplegable en CPU o en cualquier GPU de consumo.

Los resultados publicados sitúan la F1 macro en 0,913 sobre un test reservado de 69 titulares, frente a 0,942 del LLM que generó las etiquetas y 0,672 de un enfoque zero-shot con `Recognai/bert-base-spanish-wwm-cased-xnli`. Es relevante como ejemplo reproducible de destilación de etiquetas de un LLM a un encoder pequeño, con licencia Apache 2.0, aunque con un test muy reducido y concentrado temporalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), destilado de BERT |
| Parametros totales | 135.327.748 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens de posicion maxima en la arquitectura base; el ajuste se realizo con `max_length=64` |
| Tipos de cuantizacion | no disponible (no se han publicado versiones GGUF, ONNX ni int8/int4) |
| Idiomas soportados | es (espanol); el modelo base es multilingue, pero el ajuste es monolingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se parte de `distilbert-base-multilingual-cased`, un encoder transformer de 6 capas y 135 millones de parametros obtenido por destilacion de conocimiento de un BERT multilingue. Sobre esa base se anade una cabeza de clasificacion de secuencia con 4 etiquetas. No hay decodificacion generativa ni mecanismos de atencion alternativos: es un encoder clasico con atencion completa y tokenizador WordPiece case-sensitive.

Los datos de entrenamiento son 458 titulares extraidos de `larepublica.pe` el 14 de octubre de 2026 mediante RSS, news sitemaps y enlaces relacionados, respetando `robots.txt`. Las etiquetas se generaron por supervision debil con `gemini-3.5-flash-lite` usando un prompt estructurado; una auditoria humana de 20 casos dio 20/20 de acuerdo. El split fue estratificado 70/15/15 con `random_state=42`, con 3 epocas, batch 16, learning rate 5e-5, `max_length=64` y seleccion del mejor checkpoint por F1 macro en validacion. No se documenta uso de RLHF ni DPO (no aplica a un clasificador). La innovacion metodologica destacable es precisamente el pipeline de etiquetado debil: un LLM anota, un encoder pequeno aprende, y el resultado queda a 0,029 puntos de F1 macro del profesor.

## Capacidades

- Clasificacion de texto en espanol: asigna un titular a una de cuatro categorias (`politica`, `economia`, `deportes`, `ciencia_tecnologia`).
- Devuelve puntuaciones por clase completas si se usa `top_k=None` en el pipeline de Transformers, lo que permite umbrales propios y analisis de confianza.
- Optimizado para entradas cortas (titulares); el ajuste se hizo con `max_length=64` tokens.
- Rendimiento alto en titulares de tematica peruana del periodo septiembre–octubre de 2026.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No se ha validado su comportamiento fuera del espanol ni en variantes dialectales distintas del espanol peruano de prensa.

## Casos de uso

- Enrutado editorial automatico: clasificar los titulares que entran en un CMS o agregador y proponer seccion (`politica`, `economia`, `deportes`, `ciencia_tecnologia`) antes de la revision humana, reduciendo el tiempo de triaje en redacciones digitales peruanas.
- Monitorizacion de medios (media monitoring): procesar feeds RSS de varios medios peruanos y etiquetar cada pieza por seccion para construir informes de cobertura tematica por franja temporal.
- Analisis de agenda y tendencias: agregar la distribucion de categorias por dia o semana para detectar picos de cobertura economica o politica, util en gabinetes de comunicacion y equipos de asuntos publicos.
- Filtrado previo a pipelines RAG o de resumen: usar la etiqueta como metadato de enrutado para decidir que indice o que prompt de resumen aplicar a cada noticia, aprovechando que el modelo es muy barato computacionalmente.
- Pre-etiquetado para anotacion humana: generar etiquetas iniciales sobre corpus de prensa peruana y dejar que los anotadores corrijan, reduciendo el coste de construir datasets tematicos etiquetados.
- Alertas tempranas de PR y comunicacion corporativa: detectar en tiempo casi real la aparicion de noticias economicas o politicas relevantes para una organizacion a partir de titulares monitorizados.
- Investigacion academica en NLP peruano: como baseline reproducible con licencia Apache 2.0 para experimentos sobre clasificacion tematica de prensa peruana y comparacion de tecnicas de supervision debil.
- Moderacion y ordenacion de contenido en newsletters o foros de tematica peruana: etiquetar envios de usuarios por seccion para agrupar o recomendar contenido.

## Benchmarks y rendimiento

Test reservado de 69 titulares, comparado contra la seccion editorial real del diario. Metrica: F1 macro.

| Enfoque | F1 macro |
|---|---|
| Zero-shot `Recognai/bert-base-spanish-wwm-cased-xnli` (40 titulares) | 0,672 |
| LLM `gemini-3.5-flash-lite` (profesor) | 0,942 |
| Este modelo | 0,913 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible, y no serian aplicables a un clasificador de 4 clases. Tampoco se publican valores de accuracy, pese a que la model card declara `accuracy` entre las metricas.

## Requisitos de hardware

- VRAM estimada en inferencia: aproximadamente 0,5 GB en fp32, unos 0,3 GB en fp16 y alrededor de 0,15 GB en int8 (calculado a partir de los 135,3 millones de parametros; no hay mediciones publicadas).
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU. Un solo lote de titulares es viable en CPU en milisegundos a decenas de milisegundos por lote.
- GPU de datacenter (A100, H100) no aportan ventaja relevante: el modelo esta limitado por latencia de host, no por computo.
- Despliegue: pipeline de `transformers` (uso documentado en la model card), FastAPI o Flask envolviendo el pipeline, ONNX Runtime o TorchScript si se exporta manualmente, Hugging Face Inference Endpoints. No hay versiones GGUF publicadas, por lo que Ollama y llama.cpp requeririan una conversion propia; vLLM solo es razonable si se necesita servir a muy alta concurrencia.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 macro (mismo test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LuisGGV/distilbert-titulares-larepublica` | 135,3 M | 512 tokens (entrenado a 64) | 0,913 | Apache 2.0 | Hugging Face |
| `Recognai/bert-base-spanish-wwm-cased-xnli` (zero-shot) | no disponible | no disponible | 0,672 (sobre 40 titulares) | no disponible | Hugging Face |
| `gemini-3.5-flash-lite` (LLM cerrado) | no disponible | no disponible | 0,942 | propietaria, API de pago | API |
| `distilbert-base-multilingual-cased` (base sin ajustar) | 135,3 M | 512 tokens | no disponible | Apache 2.0 | Hugging Face |

La comparacion directa con alternativas ajustadas a clasificacion de noticias peruanas no esta disponible en la informacion proporcionada: no se han identificado en la busqueda otros modelos de la misma categoria y dominio.

## Limitaciones y advertencias

- Test muy pequeno (69 titulares) y concentrado en septiembre–octubre de 2026: el rendimiento puede caer con la agenda de otros periodos o con titulares de otros medios.
- La frontera entre `economia` y `politica` es la principal fuente de error, sobre todo en noticias economicas narradas a traves de actores del Estado (por ejemplo, decisiones del BCR).
- Las etiquetas de referencia son las secciones editoriales del diario, no una verdad tematica absoluta; parte del error medido puede ser ruido de etiquetado y no fallo del modelo.
- Las etiquetas de entrenamiento proceden de un LLM (`gemini-3.5-flash-lite`), con solo 20 casos auditados manualmente como control de calidad; pueden heredarse sesgos y errores sistematicos del profesor.
- Dominio restringido a prensa peruana en espanol de un unico medio; no hay garantias de generalizacion a otros registros, paises o variantes dialectales.
- Longitud de entrada limitada a titulares: textos largos se truncaran a 64 tokens segun la configuracion de entrenamiento (y a 512 en el limite arquitectonico), con perdida de informacion.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de sobreconfianza: el modelo siempre devuelve una de las cuatro clases, incluso ante entradas fuera de dominio o ambiguas.
- Licencia Apache 2.0, que permite uso comercial y modificacion, pero sin garantias del autor; es un proyecto academico sin mantenimiento declarado ni soporte.
- No se han publicado versiones cuantizadas ni artefactos ONNX, por lo que cualquier optimizacion de despliegue corre por cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuisGGV/distilbert-titulares-larepublica
- Repositorio de codigo, datos y notebooks: https://github.com/LuisGuevaraVega/python_interm_dip_qlab/tree/main/tarea_1
- Fuente de los datos: https://larepublica.pe
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
- Modelo zero-shot citado en la comparativa: https://huggingface.co/Recognai/bert-base-spanish-wwm-cased-xnli
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
