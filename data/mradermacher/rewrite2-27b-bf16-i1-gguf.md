# mradermacher/rewrite2-27b-bf16-i1-GGUF

## Resumen

rewrite2-27b-bf16-i1-GGUF es la versión cuantizada con imatrix del modelo aikexue170/rewrite2-27b-bf16, un ajuste fino de 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) orientado a la reescritura y expansión de novelas en chino. El trabajo de cuantización lo firma mradermacher, un publicador habitual de GGUF en HuggingFace, mientras que el modelo original procede de la cuenta aikexue170. La model card del cuantizador no incluye información sobre el entrenamiento, la arquitectura interna ni los datos utilizados en el ajuste del modelo base.

El modelo resuelve una tarea muy concreta: tomar texto narrativo en chino y reescribirlo o expandirlo manteniendo coherencia estilística. Los tags del repositorio (rewrite2, novel-rewrite, novel-expansion, chinese, conversational) delimitan claramente ese ámbito. No se trata de un modelo generalista, sino de una herramienta de autor para flujos de trabajo editoriales.

La relevancia práctica de este repositorio es que permite ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones que van desde 10,1 GB (IQ2_M) hasta 22,2 GB (Q6_K), algo imposible con los pesos bf16 originales (~54 GB). Ahora bien, la ausencia de licencia declarada, de benchmarks y de documentación técnica sobre el modelo base son limitaciones serias a la hora de evaluarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el repositorio usa la libreria transformers y el tag "conversational") |
| Parametros totales | 26.895.998.464 (~26,9 B), dato real de safetensors del modelo base |
| Parametros activos | no aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K. Quants estaticos en repositorio aparte |
| Idiomas soportados | chino (zh) unicamente, segun el campo language de la model card |
| Licencia | no disponible |
| Formato de pesos | GGUF (variantes i1/imatrix); el modelo base se distribuye en bf16 safetensors |
| Tamano del repositorio | 165,5 GB (incluye todos los ficheros de cuantizacion) |
| Modelo base | aikexue170/rewrite2-27b-bf16 |
| Cuantizador | mradermacher |
| Fecha de creacion | 2026-10-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base. La model card del repositorio cuantizado se limita a indicar el origen (aikexue170/rewrite2-27b-bf16), el idioma (zh) y un conjunto de tags de tarea. El tag "conversational" y el uso de la libreria transformers sugieren un transformer decoder-only con plantilla de chat, pero esto es una inferencia a partir de metadatos, no un dato confirmado por el autor.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o attention lineal. El nombre "rewrite2" y los tags novel-rewrite y novel-expansion apuntan a un ajuste fino supervisado sobre corpus narrativo chino, posiblemente con pares de texto original y texto reescrito, pero el autor no documenta el proceso. Cualquier afirmacion adicional seria especulacion.

## Capacidades

- Reescritura de texto narrativo en chino: reformulacion de parrafos y capitulos manteniendo el hilo argumental.
- Expansion de novelas: desarrollo de escenas, descripciones y dialogos a partir de un esquema o texto base.
- Generacion de texto conversacional (tag "conversational" en el repositorio).
- Procesamiento de texto en chino exclusivamente; no se declara soporte de otros idiomas.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que permite servirlo mediante infraestructura de inferencia compatible con la API de HuggingFace.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Reescritura editorial de novelas web chinas: el modelo recibe un capitulo y devuelve una version reformulada, util para autores que publican por entregas y necesitan variaciones de estilo o evitar autoplagio entre capitulos.
- Expansion de esquemas narrativos: a partir de un guion de escenas breve, generar prose desarrollada con descripciones y dialogos, acelerando el trabajo de escritores profesionales.
- Adaptacion de estilo para plataformas de ficcion: convertir un texto en un registro mas comercial o mas literario segun los requisitos de la plataforma de publicacion.
- Preprocesado de corpus para data augmentation: generar variantes parafraseadas de textos narrativos en chino para ampliar datasets de entrenamiento de otros modelos.
- Localizacion creativa dentro de pipelines de traduccion: una vez traducido un texto al chino, usar el modelo para pulir la naturalidad del resultado en registros literarios.
- Prototipado de asistentes de escritura: integrar el modelo en una herramienta de escritura que sugiera reescrituras alternativas de un parrafo seleccionado, con la cuantizacion Q4_K_M (16,6 GB) como opcion de despliegue en una sola GPU de 24 GB.
- Investigacion sobre estilos de reescritura: comparar salidas entre cuantizaciones (IQ2_M frente a Q6_K) para medir la degradacion que introduce la cuantizacion en tareas generativas creativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye evaluaciones en MMLU, HumanEval, GSM8K ni metricas especificas de reescritura o expansion narrativa. Tampoco se han encontrado en la busqueda web resultados tecnicos relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV y overhead, calculada a partir del tamano de cada fichero):
  - IQ2_M: ~10,1 GB de pesos, ~11-12 GB en ejecucion.
  - Q3_K_M: ~13,4 GB de pesos, ~15 GB en ejecucion.
  - IQ4_XS: ~15,2 GB de pesos, ~17 GB en ejecucion.
  - Q4_K_S / Q4_K_M: 15,7 / 16,6 GB de pesos, ~18-20 GB en ejecucion.
  - Q6_K: 22,2 GB de pesos, ~24-26 GB en ejecucion.
  - bf16 (modelo base): ~54 GB de pesos, ~60 GB o mas en ejecucion.
- GPU recomendadas: A100 80 GB o H100 para bf16; RTX 4090 / RTX 3090 (24 GB) para Q4_K_M y Q6_K; RTX 4080 / 4060 Ti de 16 GB para IQ3_M o Q3_K_M; RTX 4070 / 3060 de 12 GB solo con IQ2_M o descarga parcial a CPU.
- Cabe en GPU de consumo: si, con cuantizaciones de 4 bits o inferiores en tarjetas de 16-24 GB. Para Q6_K se recomienda una GPU de 24 GB con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui. Para vLLM o TGI seria necesario usar los pesos bf16 del modelo base, ya que el soporte GGUF en esos servidores es limitado o inexistente.
- Latencia y throughput: no disponibles como dato medido. Como referencia orientativa, un modelo denso de ~27B en Q4_K_M sobre una RTX 4090 suele moverse en decenas de tokens por segundo, y en CPU con 32 GB de RAM en el orden de 1-3 tokens por segundo; estas cifras no han sido verificadas para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos publicos de benchmarks ni de especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. La comparacion siguiente se limita a los repositorios relacionados, cuyos datos si estan en la informacion proporcionada.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/rewrite2-27b-bf16-i1-GGUF | ~26,9 B | no disponible | GGUF i1/imatrix | no disponible | Objeto de esta ficha; quants con imatrix, de IQ2_M a Q6_K |
| mradermacher/rewrite2-27b-bf16-GGUF | ~26,9 B | no disponible | GGUF estatico | no disponible | Quants estaticos sin imatrix; alternativa si se busca compatibilidad |
| aikexue170/rewrite2-27b-bf16 | ~26,9 B | no disponible | safetensors bf16 | no disponible | Modelo base original, ~54 GB de pesos |
| Modelos generalistas chinos de ~30 B (por ejemplo, la familia Qwen de ese orden de tamano) | no disponible en esta busqueda | no disponible | safetensors, GGUF | no disponible en esta busqueda | Solo como referencia de categoria; no se han verificado datos en esta busqueda |

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso de uso comercial. Es imprescindible contactar con el autor del modelo base (aikexue170) antes de cualquier despliegue en produccion.
- Ausencia total de benchmarks: no hay evidencia publica de calidad en reescritura, expansion ni tareas generales.
- Modelo de tarea especifica: el ajuste orientado a rewrite2/novel-rewrite puede degradar el seguimiento de instrucciones generales y el razonamiento fuera de ese dominio.
- Solo chino: no se declara soporte de castellano ni de otros idiomas; el rendimiento fuera del chino es impredecible.
- Contexto desconocido: sin la longitud de contexto declarada no se puede planificar el procesamiento de capitulos largos sin pruebas empíricas.
- Riesgo de alucinacion: en tareas de expansion narrativa el modelo puede inventar detalles, alterar la caracterizacion de personajes o introducir incoherencias con el texto original.
- Degradacion por cuantizacion: las variantes IQ1 e IQ2 (10-11 GB) sacrifican calidad de forma notable; el propio autor marca IQ3_XXS como "lower quality". Para texto creativo conviene Q4_K_M o superior.
- Sesgos: no documentados, pero al entrenarse sobre corpus narrativo chino puede reproducir estereotipos presentes en la ficcion de origen.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Fecha de creacion futura respecto a los datos habituales de referencia; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/rewrite2-27b-bf16-i1-GGUF
- Modelo base: https://huggingface.co/aikexue170/rewrite2-27b-bf16
- Quants estaticos del mismo modelo: https://huggingface.co/mradermacher/rewrite2-27b-bf16-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#rewrite2-27b-bf16-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de quant: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests

Nota: la busqueda web realizada no devolvio ningun enlace tecnico relevante sobre este modelo; los resultados obtenidos no guardan relacion con el contenido de la ficha y se han descartado.
