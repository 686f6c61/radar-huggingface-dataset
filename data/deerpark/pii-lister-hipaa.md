# Deerpark/pii-lister-hipaa

## Resumen

Deerpark/pii-lister-hipaa es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-4B-Instruct-2507, orientado a la deteccion y listado de informacion personal identificable (PII) y de informacion sanitaria protegida (PHI) bajo el marco normativo HIPAA. El modelo no genera texto libre conversacional: su funcion es actuar como extractor estructurado que enumera las entidades sensibles presentes en un texto clinico o administrativo, lo que lo convierte en una pieza util para pipelines de desidentificacion previos a almacenamiento, analisis o comparticion de datos medicos.

El modelo lo publica el usuario Deerpark en Hugging Face y se distribuye con licencia Apache 2.0, aunque el repositorio esta restringido (gated) y requiere aceptar condiciones de acceso. Al ser un adaptador sobre un modelo de 4.000 millones de parametros, hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507 y su ventana de contexto, lo que permite procesar documentos clinicos de longitud moderada en una sola pasada. Su interes practico reside en la especializacion: en lugar de pedir a un modelo general que "encuentre los datos personales", el adaptador ha sido ajustado especificamente para la tarea de listado de PII/PHI segun categorias relevantes para HIPAA.

La relevancia actual del modelo es doble. Por un lado, la desidentificacion automatica de registros medicos es un requisito operativo en entornos sanitarios que manejan datos bajo HIPAA o regulaciones equivalentes (RGPD en la UE). Por otro, el enfoque de adaptador LoRA sobre un modelo pequeno reduce el coste de despliegue frente a alternativas de mayor tamano, permitiendo ejecutar la tarea en hardware modesto. La informacion publica disponible sobre el modelo es escasa: no se han publicado detalles de entrenamiento, composicion del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (adaptador LoRA sobre Qwen/Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.000 millones en el modelo base; el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | ingles, espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre Qwen/Qwen3-4B-Instruct-2507, un transformer denso de 4.000 millones de parametros de la familia Qwen3. El adaptador modifica un subconjunto de las matrices de peso del modelo base mediante descomposiciones de bajo rango, de modo que el resultado se carga junto con el modelo base usando la libreria PEFT. La arquitectura subyacente es, por tanto, la de Qwen3-4B-Instruct-2507: atencion por cabezas con mecanismos propios de la familia Qwen3, aunque los detalles exactos de atencion, normalizacion y posicional encoding no se detallan en la informacion proporcionada.

No se dispone de informacion sobre el proceso de entrenamiento del adaptador: numero de tokens de entrenamiento, composicion del dataset (si se genero sinteticamente, si proviene de corpus clinicos anotados o de una mezcla), uso de RLHF o DPO, ni hiperparametros del ajuste LoRA (rango, alpha, modulos objetivo). Tampoco se documenta si el entrenamiento se realizo con supervision de etiquetas de entidades o con instrucciones en formato de listado. Esta ausencia de documentacion es relevante para evaluar la robustez del adaptador en produccion.

La innovacion tecnica del modelo no reside en la arquitectura sino en la especializacion de la tarea: el adaptador convierte un modelo instructivo general en un extractor de PII/PHI orientado a HIPAA, con soporte bilingue ingles-espanol. El hecho de partir de un modelo de 4.000 millones de parametros sugiere un compromiso entre calidad de extraccion y coste de inferencia, aunque no se han publicado mediciones que lo confirmen.

## Capacidades

- Deteccion y listado de informacion personal identificable (PII) en texto: nombres, direcciones, numeros de telefono, correos electronicos, identificadores, etc.
- Deteccion y listado de informacion sanitaria protegida (PHI) bajo categorias relevantes para HIPAA.
- Salida estructurada en forma de lista de entidades detectadas, adecuada para postprocesado automatico.
- Soporte bilingue: ingles y espanol.
- Procesamiento de texto clinico y administrativo en una sola pasada, gracias a la ventana de contexto del modelo base.
- Capacidad de seguir instrucciones heredada de Qwen3-4B-Instruct-2507 (formato instructivo).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion proporcionada.

## Casos de uso

- Desidentificacion previa a almacenamiento: el modelo se ejecuta sobre cada registro clinico antes de persistirlo en bases de datos analiticas, listando las entidades PII/PHI para que un paso posterior las enmascare o elimine. Es adecuado porque su salida es una lista estructurada y no texto libre.
- Cumplimiento HIPAA en pipelines de datos: integrado como etapa de preprocesado en un ETL sanitario, permite auditar que campos sensibles aparecen en documentos antes de compartirlos con terceros o de exportarlos a entornos de investigacion.
- Anonimizacion de notas clinicas para investigacion: el adaptador identifica nombres de pacientes, profesionales y centros, fechas e identificadores, de modo que el corpus resultante pueda usarse en estudios sin exponer datos personales.
- Revision de transcripciones de consulta: sobre transcripciones generadas por ASR en entornos sanitarios, el modelo localiza menciones de datos identificativos que deben eliminarse antes de incorporar la transcripcion al historial electronico.
- Filtrado en sistemas de atencion al cliente sanitarios: antes de registrar o reenviar un mensaje de un paciente a un sistema de ticketing, el modelo lista los datos personales presentes para aplicar reglas de redaccion.
- Auditoria de textos bilingues: en organizaciones con documentacion en ingles y espanol, el adaptador cubre ambos idiomas, lo que simplifica la politica de desidentificacion en entornos multilingues.
- Generacion de datasets de entrenamiento para otros modelos de desidentificacion: las listas producidas pueden servir como etiquetas debiles o como punto de partida para anotacion humana en la construccion de corpus de PII/PHI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 0,3 GB en disco; el coste real de inferencia lo determina el modelo base Qwen3-4B-Instruct-2507.
- VRAM estimada para el modelo base en precision completa (BF16): en torno a 8-9 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 5-6 GB.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 3-4 GB, lo que permite ejecucion en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090.
- GPUs recomendadas para produccion: A100 40 GB, H100 80 GB o L40S para despliegues con alta concurrencia; RTX 4090 para prototipado y cargas moderadas.
- Opciones de despliegue: vLLM y TGI para servir el modelo base con el adaptador cargado; llama.cpp y Ollama requieren convertir el adaptador a GGUF y fusionarlo o cargarlo sobre el modelo base cuantizado; tambien es posible usar la libreria PEFT directamente con Transformers para cargas por lotes.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deerpark/pii-lister-hipaa | 4.000 M (base) + LoRA | no disponible | Extraccion PII/PHI HIPAA, bilingue en/es | Apache 2.0 | Gated en Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 | 4.000 M | no disponible en la informacion proporcionada | Modelo instructivo general | Apache 2.0 | Publico en Hugging Face |
| Modelos especializados en PII de mayor tamano | no disponible | no disponible | Desidentificacion general | variable | variable |

La comparativa con alternativas especializadas en PII/PHI no puede completarse con datos verificables a partir de la informacion proporcionada; no se dispone de resultados de benchmarks que permitan situar el adaptador frente a otros sistemas de desidentificacion.

## Limitaciones y advertencias

- Ausencia de documentacion de entrenamiento: no se publican datos sobre el dataset, el numero de tokens ni los hiperparametros del LoRA, lo que impide evaluar la cobertura de categorias PII/PHI y el riesgo de sesgos en la anotacion.
- Riesgo de falsos negativos: al ser un modelo de 4.000 millones de parametros especializado mediante LoRA, puede omitir entidades poco frecuentes o con formatos atipicos; en un contexto HIPAA, un falso negativo implica una fuga de datos, por lo que se recomienda combinarlo con reglas deterministas y revision humana.
- Riesgo de alucinacion: el modelo base es generativo y puede listar entidades inexistentes o inventar categorias; la salida debe validarse contra el texto original.
- Cobertura limitada a ingles y espanol: textos en otros idiomas no estan soportados de forma declarada.
- Restricciones de acceso: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que anade un paso operativo antes del despliegue.
- Licencia Apache 2.0: permite uso comercial, pero el cumplimiento normativo (HIPAA, RGPD) es responsabilidad del desplegador, no del modelo.
- Dependencia del modelo base: cualquier limitacion de Qwen3-4B-Instruct-2507 (sesgos, contexto, calidad en dominios muy tecnicos) se hereda en el adaptador.
- No apto como unico control de cumplimiento: debe integrarse en un proceso con auditoria, versionado y pruebas de regresion sobre corpus representativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deerpark/pii-lister-hipaa
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria Transformers: https://github.com/huggingface/transformers
