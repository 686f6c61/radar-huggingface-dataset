# 3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated

## Resumen

Ornith-1.5-35B-A3B-3MPER0RR-abliterated es un modelo de generacion de texto publicado en HuggingFace por el usuario 3MPER0RR. Se trata de una variante "abliterated" del modelo Ornith-1.5-35B-A3B, es decir, un ajuste cuyo objetivo declarado es eliminar o atenuar la direccion de rechazo (refusal) del modelo original mediante un proceso de abliteracion en varias rondas. La model card es minima: indica el nombre del modelo, el proceso aplicado ("multi-round abliteration"), el estado ("tested and saved"), el modelo de partida y la licencia MIT.

El modelo cuenta con 35.107.181.936 parametros totales, segun los datos reales de los ficheros safetensors, y la etiqueta de arquitectura del repositorio es `qwen3_5_moe`, lo que apunta a una arquitectura de mezcla de expertos (MoE) de la familia Qwen3.5. La nomenclatura "A3B" del nombre sugiere del orden de 3000 millones de parametros activos por token, aunque este dato no se confirma en la informacion disponible. El repositorio ocupa 70,2 GB, un tamano coherente con pesos almacenados en BF16.

La relevancia de esta publicacion es limitada pero concreta: se trata de un derivado no oficial, con cero descargas y cero "likes" en el momento de la consulta, sin resultados de benchmarks publicados y sin documentacion sobre datos de entrenamiento. Su interes principal radica en el caso de uso de investigacion sobre alineacion y mecanismos de rechazo, no en su adopcion como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta del repositorio: `qwen3_5_moe`); detalles de capas, numero de expertos y top-k no disponibles |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible (la nomenclatura "A3B" del nombre sugiere del orden de 3000 millones, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo incluye safetensors (el tamano de 70,2 GB es consistente con BF16, sin confirmacion explicita) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline declarado | text-generation |
| Etiquetas adicionales | conversational, region: us |
| Tamano del repositorio | 70,2 GB |
| Fecha de creacion | 2026-09-16 |
| Fecha de ultima actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

La unica informacion tecnica disponible sobre el proceso es la que figura en la model card: se ha aplicado una "abliteracion en multiples rondas" sobre el modelo Ornith-1.5-35B-A3B. La abliteracion es una tecnica de edicion de pesos que identifica la direccion del espacio de activaciones asociada a la generacion de rechazos y la proyecta fuera de los pesos de las capas correspondientes, de modo que el modelo deja de producir negativas sistematicas ante determinadas peticiones. El calificativo "multi-round" indica que el procedimiento se aplico de forma iterativa, presumiblemente para reducir el residuo de la direccion de rechazo tras cada pasada.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones arquitectonicas propias. La etiqueta `qwen3_5_moe` sugiere que el modelo base emplea una arquitectura transformer con capas de mezcla de expertos, pero no se dispone de detalles sobre el numero de expertos, el enrutador, el top-k por token ni el esquema de atencion. Tampoco se documenta si el proceso de abliteracion afecto a capas concretas, a todas las capas del transformer o a los modulos de atencion y MLP por separado.

## Capacidades

- Generacion de texto conversacional y de un solo turno, segun las etiquetas `text-generation` y `conversational` del repositorio.
- Generacion de respuestas con rechazos atenuados o eliminados respecto al modelo original, que es el efecto buscado del proceso de abliteracion.
- Capacidades de razonamiento, codigo, matematicas y multilingues: no disponibles como datos verificados; se desconoce que se conserva del modelo base tras la edicion de pesos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking" explicito, vision o audio: no disponible.
- No se documenta plantilla de chat, tokens especiales ni formato de prompt recomendado, mas alla de la etiqueta `conversational`.

## Casos de uso

- Investigacion sobre alineacion y mecanismos de rechazo: el modelo permite estudiar como se comporta una red MoE de 35B tras eliminar la direccion de rechazo, comparando respuestas con el modelo original y midiendo el efecto sobre la utilidad general.
- Evaluacion de tecnicas de abliteracion: al declararse "multi-round abliteration", sirve como punto de comparacion frente a variantes de una sola pasada, siempre que el investigador disponga tambien del modelo base sin editar.
- Analisis de robustez de filtros de seguridad: se puede emplear como caso adversarial para probar clasificadores de contenido y guardrails externos, ya que previsiblemente genera contenido que el modelo original rechazaria.
- Generacion de texto en dominios creativos o de ficcion sin restricciones tematicas: conversaciones y narrativa donde el modelo base tenderia a rechazar por politica de contenido, siempre que el uso cumpla la legislacion aplicable.
- Pruebas de despliegue de modelos MoE grandes: con 35B de parametros totales y posible activacion de ~3B, es un candidato para medir latencias y throughput en vLLM o SGLang en configuraciones multi-GPU.
- Experimentos de destilacion o ajuste fino posterior: al liberarse en safetensors con licencia MIT, se puede usar como punto de partida para LoRA o ajuste completo en tareas especificas.
- Docencia y divulgacion sobre modelos de lenguaje: ilustra de forma tangible que la alineacion de un modelo es una propiedad editable en los pesos y no una garantia estructural del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y el repositorio no enlaza a evaluaciones externas. Los resultados de la busqueda web realizada no contienen informacion relevante sobre el modelo.

## Requisitos de hardware

- Inferencia en BF16: los pesos ocupan aproximadamente 70,2 GB, por lo que se necesita un acelerador con al menos 80 GB de VRAM (A100 80 GB, H100 80 GB, H200) o repartir el modelo entre varias GPU mediante tensor parallelism.
- Cuantizacion de 8 bits: el peso del modelo baja a un entorno de 35 GB, lo que permite ejecucion en dos GPU de 24 GB (RTX 4090, RTX 3090, L40S) o en una A100 de 40 GB, a costa de la memoria adicional de cache KV y activaciones.
- Cuantizacion de 4 bits: el modelo cabe en un entorno de 18-20 GB, por lo que es viable en una unica RTX 4090 o RTX 3090 de 24 GB. Requiere generar los ficheros GGUF o AWQ/GPTQ, ya que el repositorio solo publica safetensors.
- Memoria adicional: al tratarse de una arquitectura MoE, la cache KV depende del numero de capas con atencion y de la longitud de contexto, dato no disponible; a contextos largos el consumo extra puede ser considerable.
- Si la activacion de ~3B parametros por token se confirma, el coste computacional por token seria comparable al de un modelo denso de ese tamano, aunque con requisitos de memoria propios de un modelo de 35B. Sin mediciones publicadas, no es posible dar cifras de latencia ni de throughput.
- Opciones de despliegue: vLLM y SGLang para servidores con soporte de MoE y safetensors; TGI si la arquitectura esta soportada en la version utilizada; llama.cpp u Ollama unicamente si se generan cuantizaciones GGUF, que no se incluyen en el repositorio.
- Al no existir GPU de consumo con 80 GB de VRAM, el uso en hardware de consumidor exige cuantizacion agresiva y aceptar perdida de calidad.

## Comparativa con modelos similares

Los datos de las columnas de modelos alternativos proceden de la documentacion publica de esos modelos y no de la informacion proporcionada en esta consulta; se incluyen como referencia orientativa. Para el modelo objeto de la ficha, varios campos figuran como no disponibles.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-3MPER0RR-abliterated | 35,1B | no disponible (posible ~3B) | no disponible | MIT | Derivado abliterated, sin benchmarks ni documentacion de entrenamiento |
| Qwen3-30B-A3B (referencia de familia) | 30,5B | 3,3B | 128K | Apache 2.0 | Modelo MoE oficial con benchmarks publicados; el tag del repositorio sugiere parentesco con la familia Qwen3.5 |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | MoE de referencia de generacion anterior, mas costoso por token al activar mas parametros |
| Llama 3.3 70B | 70,6B | denso | 128K | Licencia comunitaria de Meta | Denso, sin modo MoE; mayor coste de inferencia por token |

## Limitaciones y advertencias

- Sesgos: no hay informacion sobre los sesgos del modelo base ni sobre como la abliteracion los modifica. La edicion de pesos no elimina sesgos de los datos de entrenamiento y puede intensificarlos al retirar respuestas de cautela.
- Alucinacion: no se han publicado evaluaciones de fidelidad factual. La abliteracion puede reducir tambien respuestas de abstención ante preguntas sin respuesta conocida, aumentando el riesgo de afirmaciones inventadas sin aviso.
- Contenido sensible: al eliminar o atenuar la direccion de rechazo, el modelo puede producir contenido ofensivo, ilegal o peligroso que el modelo original declinaria. No es apto para despliegue abierto al publico sin guardrails externos de moderacion.
- Ausencia de datos: se desconoce la longitud de contexto, los idiomas soportados, el formato de prompt recomendado y el comportamiento multilingue. Cualquier integracion en produccion exige validacion previa con datos propios.
- Trazabilidad: el modelo base "Ornith-1.5-35B-A3B" no se identifica con un enlace ni con una organizacion verificable en la informacion disponible, lo que dificulta auditar que pesos se editaron y como.
- Adopcion nula: cero descargas y cero "likes" en el momento de la consulta. No hay comunidad, issues ni reportes independientes que respalden su comportamiento.
- Licencia: MIT permite uso comercial, modificacion y redistribucion, pero no exime del cumplimiento de la legislacion aplicable ni de las obligaciones derivadas de los terminos del modelo base, que no se documentan en la model card.
- Reproducibilidad: el proceso de abliteracion no se describe con detalle (capas afectadas, metricas de exito, semillas), por lo que no es reproducible a partir de la informacion publicada.

## Enlaces

- HuggingFace: https://huggingface.co/3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated
- Modelo base declarado: no disponible (la model card menciona Ornith-1.5-35B-A3B sin enlace)
- Paper o informe tecnico: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las consultas devolvieron unicamente contenido no relacionado con inteligencia artificial.
