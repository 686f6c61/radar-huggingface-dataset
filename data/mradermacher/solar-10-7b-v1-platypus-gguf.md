# mradermacher/SOLAR-10.7B-v1-Platypus-GGUF

## Resumen

SOLAR-10.7B-v1-Platypus-GGUF es una colección de cuantizaciones en formato GGUF del modelo z8086486/SOLAR-10.7B-v1-Platypus, un fine-tuning sobre la arquitectura SOLAR-10.7B-v1.0. El modelo original parte de la familia SOLAR, desarrollada por Upstage, que aplica una tecnica de escalado denominada depth up-scaling sobre la arquitectura Mistral-7B para alcanzar aproximadamente 10.700 millones de parametros manteniendo una estructura de transformer denso. Este repositorio concreto ha sido generado por mradermacher, un conocido cuantizador de la comunidad de HuggingFace, y su unica funcion es ofrecer los pesos en formatos optimizados para inferencia local con llama.cpp y derivados.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~10.7B parametros en hardware de consumo, algo inviable con los pesos originales en fp16 (21,6 GB). Las cuantizaciones disponibles abarcan desde Q2_K (4,1 GB) hasta f16 (21,6 GB), pasando por Q4_K_M (6,6 GB) o Q8_0 (11,5 GB), lo que cubre desde GPUs de 6-8 GB de VRAM hasta estaciones de trabajo con 24 GB.

Es importante subrayar que este repositorio no aporta informacion sobre el entrenamiento, los datos o los benchmarks del modelo subyacente; solo redistribuye pesos cuantizados. Cualquier evaluacion de capacidades debe remitirse al modelo base z8086486/SOLAR-10.7B-v1-Platypus y, en ultima instancia, al SOLAR-10.7B-v1.0 original de Upstage.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Mistral-7B con depth up-scaling, segun la familia SOLAR) |
| Parametros totales | 10.731.524.096 (10,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el SOLAR-10.7B-v1.0 original soporta 4096 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (multiples archivos por cuantizacion) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia SOLAR de Upstage, que construye un transformer denso de ~10.7B parametros mediante depth up-scaling: se duplican las capas de un Mistral-7B y se eliminan capas intermedias para obtener una profundidad mayor sin cambiar el ancho del modelo. Esta tecnica permite reutilizar pesos preentrenados y mantener compatibilidad con la tokenizer y la arquitectura Mistral, lo que explica que las herramientas de inferencia para Mistral funcionen directamente sobre SOLAR.

Sin embargo, la informacion proporcionada no incluye detalles sobre el dataset de entrenamiento, el numero de tokens, la composicion de la mezcla, ni si hubo fases de RLHF, DPO o SFT especificas para la variante Platypus. El nombre "Platypus" sugiere un fine-tuning sobre el dataset Platypus (coleccion de instrucciones curadas y destiladas), pero este dato no se confirma en la model card disponible. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. Lo unico verificable es el proceso de cuantizacion: mradermacher ha generado cuantizaciones estaticas (sin imatrix), y el propio autor indica que no tiene previsto publicar variantes con imatrix a corto plazo.

## Capacidades

- Generacion de texto en ingles: el modelo esta entrenado y evaluado principalmente en ingles, segun el campo `language: en` del repositorio.
- Razonamiento e instrucciones: la variante Platypus esta orientada a seguir instrucciones y responder a prompts conversacionales, aunque no se detallan capacidades especificas en la model card.
- Codigo y matematicas: no hay evidencia documentada en la informacion proporcionada; debe asumirse como capacidad generica de un modelo de ~10B sin garantias.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de consumo: con la cuantizacion Q4_K_M (6,6 GB) el modelo cabe en GPUs de 8 GB de VRAM, lo que permite desplegar un modelo de ~10.7B en un equipo personal para prototipado y experimentacion.
- Generacion de texto asistida en ingles: adecuado para tareas de redaccion, resumen o reescritura en ingles donde se requiera un modelo de tamano medio con buen equilibrio calidad/recursos.
- Chatbot de proposito general autoalojado: la variante Platypus esta orientada a instrucciones, por lo que puede usarse como asistente conversacional en ingles desplegado con llama.cpp u Ollama sin dependencia de la nube.
- Fine-tuning adicional o experimentacion academica: al estar disponible en GGUF y en el modelo base original, sirve como punto de partida para investigacion sobre cuantizacion, evaluacion de degradacion por precision o comparativas de tecnicas de compresion.
- Evaluacion de pipelines de cuantizacion: util para investigadores que quieran medir la perdida de calidad entre Q2_K, Q4_K_M y Q8_0 en un modelo de ~10B con arquitectura Mistral-like.
- Despliegue en entornos con recursos limitados: las variantes Q2_K (4,1 GB) y Q3_K_S (4,8 GB) permiten ejecucion en CPU o GPUs integradas, aunque con degradacion de calidad notable.
- Integracion en herramientas de escritorio: al ser GGUF, se puede cargar en aplicaciones como LM Studio, Jan o KoboldCpp para uso offline en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Tampoco se aportan datos de perplexity por cuantizacion mas alla de la grafica generica enlazada por el autor (comparativa de tipos de cuantizacion, no especifica del modelo).

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: ~4,1 GB de pesos, ~5-6 GB con contexto moderado.
  - Q3_K_M: ~5,3 GB de pesos, ~6-7 GB con contexto.
  - Q4_K_M: ~6,6 GB de pesos, ~7-8 GB con contexto.
  - Q5_K_M: ~7,7 GB de pesos, ~9 GB con contexto.
  - Q6_K: ~8,9 GB de pesos, ~10 GB con contexto.
  - Q8_0: ~11,5 GB de pesos, ~13 GB con contexto.
  - f16: ~21,6 GB de pesos, ~23-24 GB con contexto.
- GPU recomendadas:
  - RTX 3060 12 GB / RTX 4060 Ti 16 GB: Q4_K_M, Q5_K_M y Q6_K con holgura.
  - RTX 4090 24 GB: Q8_0 e incluso f16 con contexto limitado.
  - A100 40/80 GB y H100: cualquier cuantizacion, con throughput alto.
- Cabe en GPU de consumo: si, desde Q2_K en GPUs de 6-8 GB hasta Q8_0 en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y cualquier runtime compatible con GGUF. No es compatible directamente con vLLM o TGI en su forma GGUF (requeririan conversion a safetensors o uso de variantes especificas).
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen fuertemente de la GPU, la cuantizacion y el backend; como referencia cualitativa, el autor marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SOLAR-10.7B-v1-Platypus (este) | 10,7B | no disponible | no disponible | GGUF | Fine-tuning Platypus sobre SOLAR-10.7B-v1.0 |
| SOLAR-10.7B-v1.0 (Upstage) | 10,7B | 4096 | Apache 2.0 (segun la familia SOLAR) | safetensors | Modelo base original, sin fine-tuning de instrucciones |
| Mistral-7B-Instruct-v0.2 | 7,2B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa consolidada, mas ligera y con contexto mayor |
| Llama-3-8B-Instruct | 8,0B | 8k | Llama 3 Community License | safetensors, GGUF | Alternativa de tamano similar con ecosistema amplio |

La comparativa se limita a datos publicos de las familias correspondientes; no se dispone de benchmarks del modelo Platypus para establecer una comparacion cuantitativa de rendimiento. La licencia del modelo base SOLAR-10.7B-v1.0 se cita como Apache 2.0 por conocimiento de la familia, pero no se confirma en la informacion proporcionada para esta variante Platypus.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia: no disponible en la informacion proporcionada; antes de un uso comercial es imprescindible verificar la licencia del modelo base z8086486/SOLAR-10.7B-v1-Platypus y del SOLAR-10.7B-v1.0 original.
- Alucinacion: como cualquier modelo de ~10B sin datos de evaluacion publicados, el riesgo de alucinacion es significativo y no esta cuantificado.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S pierden calidad de forma notable; el autor marca Q3_K_M como "lower quality". Para produccion se recomienda Q4_K_M o superior.
- Sin imatrix: el autor indica que no hay cuantizaciones con imatrix disponibles, lo que implica que las variantes de baja precision pueden degradarse mas que sus equivalentes con imatrix.
- Contexto: no se documenta la longitud de contexto efectiva en esta variante; la familia SOLAR original soporta 4096 tokens, pero no se confirma aqui.
- Repositorio de solo cuantizacion: no aporta informacion sobre entrenamiento, datos o evaluacion; cualquier decision de adopcion debe basarse en el modelo base.
- Sin tool calling ni capacidades de agente documentadas: no apto para pipelines que requieran function calling sin validacion previa.
- Tamano del repo: 283,8 GB en total, lo que implica descargas parciales por archivo; conviene seleccionar solo la cuantizacion necesaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/SOLAR-10.7B-v1-Platypus-GGUF
- Modelo base (fine-tuning Platypus): https://huggingface.co/z8086486/SOLAR-10.7B-v1-Platypus
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#SOLAR-10.7B-v1-Platypus-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
