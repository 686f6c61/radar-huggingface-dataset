# arthrod/gliner-opf-ptbr-pii-v1

## Resumen

gliner-opf-ptbr-pii-v1 es un ajuste fino (fine-tune) de openai/privacy-filter orientado a la deteccion de informacion personal identificable (PII) en portugues de Brasil. A pesar del nombre del repositorio, no es un modelo GLiNER: la denominacion es historica y el autor lo aclara explicitamente en la model card. El modelo tiene 1.399.650.672 parametros (1,40B) y resuelve una tarea de token classification, con una cabeza de etiquetado de 72 clases de entidad mas la clase `O`.

El problema que aborda es concreto: la anonimizacion y el enmascaramiento de PII en textos en pt-BR para cumplimiento de la LGPD (Lei Geral de Protecao de Dados). Frente a la familia GLiNER del mismo autor, este fine-tune destaca en dos aspectos medibles: el mejor Partial F1 sobre el conjunto de validacion en distribucion (0,897) y, sobre todo, una tasa de falsos positivos muy inferior sobre texto sin PII (64 sobre 2.419 filas, frente a 8.666 del modelo GLiNER basado en mmBERT-small).

Es relevante ahora porque demuestra que un modelo de 1,4B parametros, con pesos en bf16 de solo 2,8 GB, puede ejecutarse en GPU de consumo y ofrecer una deteccion de PII con baja sobrerreaccion, un requisito critico cuando el sistema se usa para redactar documentos reales y cada falso positivo degrada el texto de forma irreversible. Como contrapartida, el propio autor reconoce que el modelo queda por detras de su GLiNER mmBERT-small en fuentes fuera de distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de openai/privacy-filter (token classification); arquitectura interna no detallada en la informacion disponible |
| Parametros totales | 1.399.650.672 (1,40B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el checkpoint publicado usa bf16 |
| Idiomas soportados | pt (portugues de Brasil); etiquetado como multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16); checkpoint liberado `e3_c3` de 2,8 GB |

Datos adicionales: espacio de etiquetas `ptbr_pii_v1` con `O` + 72 clases de entidad (24 canonicas de pt-BR, 47 cross-source y `berco_de_tiradentes`). Tamano total del repositorio: 25,2 GB, debido a los 9 checkpoints de las rondas de entrenamiento. DOI: 10.57967/hf/8525.

## Arquitectura y entrenamiento

El modelo parte de openai/privacy-filter y se ajusta como clasificador de tokens con un espacio de etiquetas propio de 72 entidades. El entrenamiento se realizo sobre `arthrod/oai-pf-ptbr-chunked-v2` (dataset privado) con 914.452 filas de texto natural, 100% texto crudo upstream, de las cuales el 99,8% procede de fuentes ai4privacy. El autor cita como datasets de referencia `ai4privacy/open-pii-masking-500k-ai4privacy`, `ai4privacy/pii-masking-400k` y `nvidia/Nemotron-PII`.

La innovacion metodologica es el esquema de entrenamiento por rondas: 9 rondas en una programacion fragmentada (chunked) de 3 epocas por 3 fragmentos. El repositorio conserva los 9 checkpoints (`checkpoint-e1_c1` a `checkpoint-e3_c2`), junto con `learning_curves.png` y `training_rounds.parquet` con las metricas de entrenamiento y validacion extraidas de los 9 ficheros `finetune_summary.json`. No se menciona en la informacion disponible el uso de RLHF, DPO ni decodificacion especulativa.

La evaluacion se hizo sobre el mismo conjunto de validacion de 5.000 filas en pt-BR empleado por la familia GLiNER del autor, lo que permite comparaciones directas dentro de esa familia, y sobre un conjunto adicional de texto sin PII (spam y phishing). El modelo se ejecuta mediante el paquete `opf` de OpenAI, que expone una API de redaccion (`runtime.redact(...)`) y una CLI (`opf --checkpoint ... "texto"`, `opf eval archivo.jsonl`).

## Capacidades

- Deteccion y clasificacion de PII en portugues de Brasil sobre 72 clases de entidad mas la clase `O`.
- Anonimizacion o redaccion de texto: la API `OPF.redact` devuelve el texto con las entidades enmascaradas, con modo de salida tipado (`output_mode="typed"`).
- Salida a nivel de token (pipeline `token-classification`), apta para integracion en pipelines de NLP.
- Evaluacion por lotes mediante CLI sobre ficheros JSONL.
- Baja tasa de falsos positivos sobre texto que no contiene PII: 64 sobre 2.419 filas de spam y phishing.
- Etiquetado como multilingue, aunque el entrenamiento y la evaluacion se centran en pt-BR.
- No se documentan en la informacion disponible capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes: es un modelo exclusivamente discriminativo de etiquetado de tokens.

## Casos de uso

- Cumplimiento de la LGPD en pipelines de datos: antes de almacenar o entrenar con texto de usuarios brasileiros, el modelo detecta y redacta CPF, telefonos, correos y direcciones, reduciendo la exposicion legal del dataset.
- Anonimizacion de conversaciones de atencion al cliente: se aplica sobre transcripciones y tickets para generar historicos utilizables en analitica sin datos personales identificables.
- Filtrado de datos previo al entrenamiento de LLM: el modelo actua como etapa de saneamiento sobre corpus en pt-BR, con la ventaja de que su baja tasa de falsos positivos evita destruir texto legitimo.
- Analisis de correos de phishing y spam: al estar evaluado especificamente sobre texto sin PII, es adecuado para triaje de bandejas de entrada y deteccion de campanas de fraude que extraen datos.
- Enmascaramiento en logs de aplicaciones: se puede ejecutar en la propia infraestructura para limpiar trazas y registros antes de enviarlos a un sistema de observabilidad externo.
- Auditoria de datasets ya recopilados: con la CLI `opf eval` se puede recorrer un JSONL y obtener predicciones para revisar cuanto material sensible contiene un corpus existente.
- Despliegue en entornos con GPU de consumo: con 1,40B parametros y 2,8 GB de pesos en bf16, encaja en estaciones de trabajo con una sola GPU de gama media para procesamiento por lotes o casi en tiempo real.

## Benchmarks y rendimiento

Resultados declarados por el autor (`verified: false`), sobre el dataset `arthrod/gliner-opf-ptbr-pii-bench-v1`:

| Tarea | Dataset / split | Metrica | Valor |
|---|---|---|---|
| Deteccion de PII (pt-BR) | PT-BR PII bench v1 (val, 24 etiquetas), split `val_5k` | Partial F1 (nervaluate) | 0,897 |
| Deteccion de PII (pt-BR) | PT-BR PII bench v1 (val, 24 etiquetas), split `val_5k` | Exact F1 (nervaluate) | 0,853 |
| Falsos positivos sobre texto sin PII | PT-BR PII bench v1 (spam y phishing), split `negatives` | Falsos positivos | 64 |
| Falsos positivos sobre texto sin PII | PT-BR PII bench v1 (spam y phishing), split `negatives` | Filas sin PII evaluadas | 2.419 |

La model card anade que el modelo tiene el mejor Partial F1 de su familia sobre el conjunto de validacion en distribucion y el menor numero de falsos positivos sobre texto sin PII (64 frente a 8.666 de mmBERT-small), pero que queda por detras del modelo GLiNER basado en mmBERT-small en fuentes fuera de distribucion. No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a esta tarea.

## Requisitos de hardware

- Pesos en bf16 de 2,8 GB (1,40B parametros); la VRAM total necesaria para inferencia se estima en torno a 4-6 GB incluyendo activaciones y overhead del runtime.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, asi como en GPUs profesionales A100, H100 o L40S para despliegues de alto volumen.
- El autor indica que se necesita una GPU, aunque por tamano es plausible la ejecucion en CPU; no se aportan datos de rendimiento en CPU.
- Opciones de despliegue: paquete `opf` de OpenAI, tanto por API Python como por CLI. No hay informacion disponible sobre soporte en vLLM, llama.cpp, Ollama o TGI, y al no ser un transformer estandar de Hugging Face es previsible que requiera el runtime especifico.
- Descarga selectiva: `snapshot_download` con `allow_patterns=["config.json", "model.safetensors"]` evita bajar los 25,2 GB completos del repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Partial F1 (val pt-BR) | Falsos positivos (2.419 filas sin PII) | Licencia |
|---|---|---|---|---|---|
| arthrod/gliner-opf-ptbr-pii-v1 | 1,40B | Fine-tune de OpenAI Privacy Filter | 0,897 | 64 | apache-2.0 |
| arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1 | no disponible | GLiNER sobre jhu-clsp/mmBERT-small | no disponible | 8.666 | no disponible |
| arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1 | 68M (encoder) | GLiNER sobre ettin-encoder-68m | no disponible | no disponible | no disponible |
| arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1 | 32M (encoder) | GLiNER sobre ettin-encoder-32m | no disponible | no disponible | no disponible |
| openai/privacy-filter | no disponible | Modelo base de filtrado de privacidad | no disponible | no disponible | no disponible |

Segun el autor, el modelo GLiNER basado en mmBERT-small es el mas fuerte de la familia en fuentes fuera de distribucion, mientras que este fine-tune gana en F1 sobre el conjunto en distribucion y reduce los falsos positivos en dos ordenes de magnitud. Los modelos ettin de 32M y 68M son las alternativas mas ligeras del ecosistema. Los valores de F1 de los competidores no se incluyen en la informacion disponible.

## Limitaciones y advertencias

- El autor reconoce explicitamente que el modelo queda por detras del GLiNER mmBERT-small en fuentes fuera de distribucion; su ventaja esta medida sobre un conjunto de validacion en distribucion.
- Tasa de falsos positivos no nula: 64 sobre 2.419 filas sin PII (aproximadamente un 2,6% de filas con al menos una deteccion espuria). En un flujo de redaccion esto implica sobremascarado ocasional de texto legitimo.
- El nombre del repositorio induce a error: no es un modelo GLiNER, sino un fine-tune de openai/privacy-filter. Cualquier integracion debe usar el runtime `opf`, no las librerias GLiNER.
- Cobertura de idioma: entrenado y evaluado en portugues de Brasil; la etiqueta `multilingual` no va acompanada de evaluacion multilingue en la informacion disponible.
- Espacio de etiquetas de 72 clases con una cola larga de entidades cross-source, cuyo rendimiento por clase solo se detalla parcialmente en `comparison_report.md`; las clases menos frecuentes pueden tener un F1 mucho mas bajo que el agregado.
- Riesgo de alucinacion y de sobre-redaccion: como todo clasificador de tokens, puede marcar cadenas numericas o nombres comunes como PII, con impacto directo en la calidad del texto final.
- Metricas no verificadas (`verified: false`) y benchmark construido por el mismo autor del modelo, sin replicacion independiente.
- Adopcion muy baja: 62 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion.
- Licencia apache-2.0 para este fine-tune, pero conviene revisar los terminos del modelo base openai/privacy-filter antes de un uso comercial.
- El repositorio ocupa 25,2 GB por los checkpoints intermedios; hay que filtrar la descarga para no transferir material innecesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arthrod/gliner-opf-ptbr-pii-v1
- Modelo base en Hugging Face: https://huggingface.co/openai/privacy-filter
- Repositorio del paquete y codigo del modelo base: https://github.com/openai/privacy-filter
- Demo Gradio: https://huggingface.co/spaces/arthrod/gliner-opf-ptbr-pii-demo
- Dataset de benchmark: https://huggingface.co/datasets/arthrod/gliner-opf-ptbr-pii-bench-v1
- Modelo GLiNER mmBERT-small de la familia: https://huggingface.co/arthrod/gliner-mmbert-small-ptbr-pii-full-3x-v1
- Modelo GLiNER ettin-68m de la familia: https://huggingface.co/arthrod/gliner-ettin-68m-ptbr-pii-full-3x-v1
- Modelo GLiNER ettin-32m de la familia: https://huggingface.co/arthrod/gliner-ettin-32m-ptbr-pii-full-3x-v1
- Barrido de evaluacion previo (18 modelos x 9 conjuntos): https://huggingface.co/datasets/arthrod/gliner_eval_folder
- Datos de revision y comparacion GLiNER: https://huggingface.co/datasets/arthrod/gliner_review_comparison
- DOI: https://doi.org/10.57967/hf/8525

Nota: la busqueda web proporcionada no devolvio resultados relevantes para este modelo; los unicos enlaces utiles son los del repositorio de Hugging Face y el proyecto openai/privacy-filter.
