# r0b0tlab/Inkling-2-Mini-Derisked-EXL3-5.08bpw-SAGE-REXL3

## Resumen

Inkling-2-Mini-Derisked-EXL3-5.08bpw-SAGE-REXL3 es una cuantizacion de 5,08 bits por peso (bpw) del modelo Blackfrost-AI/Inkling-2-Mini-Derisked, publicada por el usuario r0b0tlab en Hugging Face. Se trata de un modelo de tipo Mixture of Experts (MoE) con arquitectura de loop-transformer, orientado a tareas multimodales de imagen-texto a texto (pipeline image-text-to-text) y conversacionales. El repositorio contiene pesos en formato safetensors con un total de 8.932.398.208 parametros reales.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un mismo artefacto: una cuantizacion EXL3 (formato de compresion de pesos orientado a inferencia eficiente), una variante "derisked" del modelo base (presumiblemente con ajustes de seguridad o alineacion) y el sufijo SAGE-REXL3, que sugiere un pipeline de cuantizacion especifico. El modelo esta marcado como research-only en sus tags, aunque la licencia declarada es Apache 2.0, lo que genera una ambiguedad que conviene tener en cuenta antes de usarlo en produccion.

El acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en Hugging Face para descargar los pesos. El tamano del repositorio es de 18,1 GB, coherente con un modelo MoE de casi 9.000 millones de parametros cuantizado a 5,08 bpw. No se dispone de informacion publica sobre el numero de parametros activos, la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con loop-transformer (segun tags: moe, loop-transformer, inkling2_loop) |
| Parametros totales | 8.932.398.208 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 5,08 bpw (cuantizacion de pesos); safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (tag license:apache-2.0), aunque el tag research-only sugiere restricciones de uso |
| Formato de pesos | safetensors (cuantizacion EXL3) |
| Modelo base | Blackfrost-AI/Inkling-2-Mini-Derisked |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 18,1 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base emplea una arquitectura de tipo Mixture of Experts (MoE) combinada con un diseno de loop-transformer, segun los tags `moe`, `loop-transformer` e `inkling2_loop`. Un loop-transformer es una variante que reutiliza bloques de capas en varias iteraciones, lo que permite aumentar la profundidad efectiva sin incrementar proporcionalmente el numero de parametros. Al tratarse de un MoE, solo un subconjunto de los expertos se activa por token, aunque no se ha publicado el numero de expertos ni la cantidad de parametros activos.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion. El sufijo "Derisked" en el nombre del modelo base sugiere que se aplicaron ajustes para reducir riesgos (posiblemente mitigacion de comportamientos inseguros o de sesgos), pero no hay documentacion publica que lo confirme. La cuantizacion EXL3 a 5,08 bpw es una innovacion destacable: reduce el peso del modelo a aproximadamente 18,1 GB, lo que facilita su despliegue en hardware con VRAM limitada en comparacion con los pesos en precision completa.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Procesamiento de imagen y texto de entrada para generar texto (pipeline `image-text-to-text`), lo que implica capacidades multimodales de vision-lenguaje.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible, pero plausible en un modelo de esta categoria; se indica como no verificado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas no estan listados).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede recibir imagenes y texto y mantener dialogos multi-turno, adecuado para interfaces de atencion al cliente que necesiten interpretar capturas de pantalla, fotos de productos o documentos escaneados junto con consultas en lenguaje natural.
- Descripcion automatica de imagenes en catalogos: integrado en un pipeline de ingesta, el modelo puede generar descripciones y metadatos textuales a partir de imagenes de producto, aprovechando su naturaleza image-text-to-text para enriquecer fichas de e-commerce.
- Moderacion de contenido asistida por vision: el modelo puede analizar imagenes y texto asociado para detectar contenido inapropiado, aunque su condicion de research-only limita su uso en produccion sin una evaluacion adicional.
- Prototipado de agentes multimodales en investigacion: gracias a su cuantizacion EXL3 de 5,08 bpw y su tamano de 18,1 GB, es viable desplegarlo en entornos de laboratorio con una sola GPU de gama alta para experimentar con arquitecturas MoE y loop-transformer.
- Extraccion de informacion de documentos escaneados: el modelo puede procesar imagenes de documentos y responder preguntas sobre su contenido, util para automatizar la digitalizacion de formularios o facturas en flujos internos.
- Evaluacion comparativa de tecnicas de cuantizacion: al ser una cuantizacion EXL3 de un modelo base concreto, sirve como artefacto de referencia para medir la perdida de calidad frente a los pesos originales en tareas de vision-lenguaje.
- Generacion de codigo a partir de capturas de pantalla: en un contexto de investigacion, el modelo podria transcribir y explicar fragmentos de codigo mostrados en imagenes, aunque esta capacidad no esta confirmada en la documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 18,1 GB en safetensors cuantizados a 5,08 bpw, por lo que se necesita al menos esa cantidad de VRAM para cargar los pesos, mas overhead de activaciones y cache KV. Una estimacion conservadora situa el minimo en torno a 20-24 GB de VRAM.
- GPU recomendadas: para cargar el modelo completo en una sola GPU, se requieren tarjetas con 24 GB o mas, como RTX 3090, RTX 4090, A10G, L4 (esta ultima con 24 GB), A100 (40/80 GB) o H100. En GPUs con menos VRAM seria necesario el offloading a CPU o la ejecucion en modo mixto.
- Cabe en consumer GPU: si, en RTX 3090 y RTX 4090 (24 GB), siempre que el runtime soporte el formato EXL3 y el overhead de activaciones quede dentro del margen disponible.
- Opciones de despliegue: el formato EXL3 requiere runtimes especificos que soporten esta cuantizacion (no es compatible directamente con llama.cpp, Ollama o vLLM en sus versiones estandar, salvo que exista soporte para EXL3). Es necesario verificar el soporte en el ecosistema ExLlamaV2/ExLlamaV3 o en las herramientas indicadas por el autor. Para el pipeline image-text-to-text se requiere ademas un runtime multimodal compatible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con alternativas de la misma categoria, ya que no se conocen los parametros activos, el contexto ni los resultados de benchmarks del modelo. Se indica como no disponible.

| Modelo | Parametros totales | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Inkling-2-Mini-Derisked-EXL3-5.08bpw-SAGE-REXL3 | 8.932.398.208 | no disponible | Apache 2.0 (tag research-only) | safetensors EXL3 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El tag `research-only` entra en conflicto con la licencia Apache 2.0 declarada; antes de un uso comercial es imprescindible aclarar con el autor o con el modelo base que condiciones se aplican realmente.
- El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que anade una dependencia de aprobacion para su descarga y uso.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad del modelo base ni de la cuantizacion.
- La cuantizacion a 5,08 bpw puede introducir degradacion en tareas sensibles a la precision, como el razonamiento matematico o la generacion de codigo; no hay datos publicados que cuantifiquen esta perdida.
- No se conocen los idiomas soportados ni la longitud de contexto, lo que impide garantizar un comportamiento adecuado en castellano o en conversaciones de contexto largo.
- El formato EXL3 limita las opciones de despliegue a runtimes especificos, lo que reduce la portabilidad frente a GGUF o safetensors en precision completa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria ni evidencia de uso en produccion.
- No hay informacion sobre parametros activos del MoE, lo que impide estimar con precision el coste computacional por token en inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r0b0tlab/Inkling-2-Mini-Derisked-EXL3-5.08bpw-SAGE-REXL3
- Modelo base: https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
