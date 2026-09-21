# ArtyomSubDiv/databricks-dolly-v2-3b-Q8_0-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF del modelo `verseAI/databricks-dolly-v2-3b`, que a su vez deriva del conocido `databricks/dolly-v2-3b` de Databricks. La conversión la ha realizado el usuario ArtyomSubDiv utilizando `llama.cpp` a través del Space `gguf-my-repo` de ggml.ai, y el resultado es un único fichero cuantizado en Q8_0 pensado para inferencia local con la familia de herramientas de llama.cpp.

Se trata, por tanto, de un modelo de instrucciones en inglés de 2.775.086.080 parámetros (unos 2,78 mil millones), ajustado sobre el conjunto de datos `databricks/databricks-dolly-15k`. No es un modelo nuevo ni un entrenamiento original: su valor está en ofrecer el modelo base en un formato y una cuantización listos para ejecutarse en CPU o en GPUs de gama de consumo sin necesidad de convertir pesos manualmente.

Su relevancia actual es limitada pero concreta: sirve como referencia histórica del fine-tuning instruccional de código abierto, como banco de pruebas para pipelines de llama.cpp y como opción de despliegue en entornos sin GPU. El repositorio no tiene descargas ni interacciones registradas y no incluye evaluación de rendimiento alguna, por lo que debe tratarse como una conversión de conveniencia y no como un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo derivado de `databricks/dolly-v2-3b`) |
| Parametros totales | 2.775.086.080 (aprox. 2,78 mil millones), medidos sobre safetensors del modelo base |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE; el tamano del fichero Q8_0 es coherente con un modelo denso) |
| Longitud de contexto | 2048 tokens (valor usado en los ejemplos de `llama-server` de la model card; no se especifica la ventana de entrenamiento) |
| Tipos de cuantizacion | Q8_0 (unica cuantizacion publicada en este repo) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (`databricks-dolly-v2-3b-q8_0.gguf`); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo (tipo de atencion, normalizacion, posicional encoding ni numero de capas). Lo que si se documenta es la cadena de derivacion: este repositorio es una conversion de `verseAI/databricks-dolly-v2-3b`, cuyo campo `duplicated_from` apunta a `databricks/dolly-v2-3b`. El ajuste instruccional se realizo sobre `databricks/databricks-dolly-15k`, un conjunto de datos en ingles de pares instruccion-respuesta publicado por Databricks. No consta informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO.

La unica transformacion documentada en este repositorio es la conversion de formato: los pesos originales se pasaron a GGUF mediante `llama.cpp` usando el Space `gguf-my-repo` de ggml.ai, y se publicaron en cuantizacion Q8_0 (8 bits por peso con escala por bloque). No se describe ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos ni arquitecturas hibridas). El modelo esta marcado con `inference: false` en los metadatos, lo que indica que no esta pensado para cargarse directamente con `transformers` en su formato publicado.

## Capacidades

La informacion disponible solo permite confirmar las capacidades derivadas del proposito declarado del ajuste instruccional. Cualquier capacidad no listada debe considerarse no documentada:

- Generacion de texto y seguimiento de instrucciones en ingles, gracias al ajuste sobre `databricks-dolly-15k`.
- Respuesta a preguntas y tareas de tipo pregunta-respuesta de un solo turno, con contexto limitado a unos 2048 tokens.
- Redaccion y reescritura de texto corto en ingles (resumenes, parafrasis, generacion de listas).
- Inferencia local en CPU o GPU mediante llama.cpp, sin dependencia de APIs externas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no, el modelo esta etiquetado unicamente como `en`.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Prototipado rapido de asistentes instruccionales en ingles: el modelo puede generar respuestas a instrucciones cortas en un portatil o en una maquina sin GPU, lo que permite validar prompts y plantillas de dialogo antes de invertir en un modelo mayor.
- Pipelines de procesamiento de texto por lotes en CPU: con una ventana de 2048 tokens, es adecuado para tareas de clasificacion, extraccion de campos o normalizacion de textos cortos en scripts ejecutados en servidores sin acelerador.
- Generacion de respuestas para FAQ y bases de conocimiento: se le pueden formular preguntas cerradas sobre documentacion breve y obtener respuestas redactadas, siempre con supervision humana por el riesgo de alucinacion.
- Resumen de documentos cortos: articulos, correos o notas de reunion que quepan en el contexto de 2048 tokens, ejecutando la inferencia localmente para no enviar datos a terceros.
- Entornos air-gapped o con requisitos de privacidad estrictos: al ser un GGUF de ~3 GB de licencia MIT, puede desplegarse en una maquina aislada sin conexion y sin coste de licencia.
- Docencia y experimentacion con cuantizacion GGUF: sirve como caso de estudio para comparar el comportamiento de un modelo de 2,8B en Q8_0 frente a otras cuantizaciones o formatos, usando `llama-cli` y `llama-server`.
- Evaluacion de infraestructura de inferencia: util para medir latencia, consumo de RAM y throughput de llama.cpp en hardware concreto antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con modelos de tamano similar.

## Requisitos de hardware

- Tamano en disco: el repositorio ocupa 3,0 GB; el fichero Q8_0 resultante ronda los 2,9 GB, coherente con 2,78 mil millones de parametros a 8 bits.
- VRAM estimada para inferencia en GPU: aproximadamente 3,5-4 GB incluyendo el contexto y los buffers de llama.cpp (estimacion basada en el tamano del fichero, no verificada en la informacion proporcionada).
- Memoria en CPU: al menos 4 GB de RAM libre para cargar el modelo y mantener un contexto de 2048 tokens.
- GPU recomendadas: cabe en cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090) y en GPUs profesionales tipo A100 o H100, aunque en estas ultimas estaria muy infrautilizada.
- Despliegue en CPU: viable, al ser un modelo de 2,8B en 8 bits; es el escenario mas razonable para este repositorio.
- Opciones de despliegue confirmadas: `llama-cli` y `llama-server` de llama.cpp, con los comandos documentados en la model card (`--hf-repo` y `--hf-file`), o compilando llama.cpp con soporte CUDA/LLAMA_CURL.
- Otros runtimes compatibles con GGUF: no confirmados en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `ArtyomSubDiv/databricks-dolly-v2-3b-Q8_0-GGUF` (este repo) | 2,78 mil millones | 2048 (segun ejemplos) | GGUF Q8_0 | MIT | Conversion de terceros, 0 descargas, sin benchmarks |
| `verseAI/databricks-dolly-v2-3b` (modelo base de esta conversion) | 2,78 mil millones | no disponible | safetensors | no confirmada en la informacion disponible | Modelo del que parte la cuantizacion; se desconoce si introduce cambios respecto al original |
| `databricks/dolly-v2-3b` (origen declarado) | 2,78 mil millones | no disponible | safetensors | no confirmada en la informacion disponible | Modelo original de Databricks, ajustado sobre `databricks-dolly-15k` |
| Otros modelos de ~3B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de alternativas comparables |

## Limitaciones y advertencias

- Tamano reducido: con 2,78 mil millones de parametros, la capacidad de razonamiento, matematicas y codigo es limitada en comparacion con modelos actuales de 7B o mas; no es adecuado para tareas que requieran推理 multi-paso fiable.
- Idioma: el modelo esta etiquetado unicamente para ingles. No hay soporte declarado de castellano ni de otros idiomas.
- Contexto corto: los ejemplos usan 2048 tokens, insuficiente para documentos largos, conversaciones extensas o analisis de repositorios de codigo.
- Riesgo de alucinacion: no existe ninguna evaluacion publicada de fidelidad factual ni de tasas de alucinacion para esta conversion.
- Sesgos: no se han publicado analisis de sesgo. Al haberse ajustado exclusivamente con un dataset en ingles, la cobertura cultural y linguistica es anglocentrica.
- Licencia: MIT, lo que permite uso comercial y modificacion, pero se trata de una conversion de terceros sobre un modelo base cuya licencia no se confirma en la informacion disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- Validacion inexistente: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso comunitario ni de calidad de la cuantizacion.
- Cuantizacion unica: solo se publica Q8_0. No hay variantes Q4, Q5 o Q6 que reduzcan aun mas los requisitos de memoria, ni una version en precision completa en este repositorio.
- Procedencia: es una conversion no oficial, sin garantia de que los pesos resultantes reproduzcan fielmente el comportamiento del modelo base.
- Metadatos inconsistentes: las fechas de creacion y actualizacion indicadas (2026-09-20) son posteriores a la fecha habitual de publicacion de los modelos Dolly, lo que sugiere un error en el registro del repositorio.
- La busqueda web realizada no ha devuelto documentacion tecnica relevante sobre esta conversion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ArtyomSubDiv/databricks-dolly-v2-3b-Q8_0-GGUF
- Modelo base de la conversion: https://huggingface.co/verseAI/databricks-dolly-v2-3b
- Modelo original de Databricks: https://huggingface.co/databricks/dolly-v2-3b
- Dataset de ajuste: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Space de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las URL devueltas corresponden a paginas generales de YouTube sin relacion con el modelo.
