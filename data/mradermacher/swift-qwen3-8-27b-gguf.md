# mradermacher/Swift-Qwen3.8-27b-GGUF

## Resumen

Swift-Qwen3.8-27b-GGUF es la version cuantizada en formato GGUF del modelo ukisai/Swift-Qwen3.8-27b, un modelo denso de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) afinado mediante LoRA sobre una base de la familia Qwen3. La cuantizacion la ha realizado mradermacher, un autor habitual en la publicacion de versiones GGUF de modelos abiertos, y el repositorio incluye tambien ficheros `mmproj`, lo que indica soporte multimodal (entrada de imagen) en el modelo original.

El interes principal del modelo reside en sus etiquetas declaradas: `efficient-thinking`, `reasoning` y `token-efficient`. Es decir, se presenta como un modelo orientado a razonamiento con modos de pensamiento ("thinking mode") que consumen menos tokens de los habituales en modelos de razonamiento, lo que reduce coste de inferencia y latencia en tareas de cadena de pensamiento larga. El idioma declarado es unicamente ingles.

La relevancia practica de esta ficha concreta esta en el formato: el repositorio ofrece 11 variantes de cuantizacion (desde Q2_K de 11,0 GB hasta Q8_0 de 29,1 GB) mas dos ficheros multimodales, lo que permite desplegar el modelo en hardware de consumo con llama.cpp u Ollama sin necesidad de GPUs de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_8` y el nombre del modelo base apuntan a la familia Qwen3, transformer denso, pero no se confirma en la informacion) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 B) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (11,0 GB), Q3_K_S (12,4 GB), Q3_K_M (13,6 GB), Q3_K_L (14,7 GB), Q4_K_S (15,9 GB), Q4_K_M (16,9 GB), Q5_K_M (19,6 GB), Q6_K (22,5 GB), Q8_0 (29,1 GB); mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB) para multimodal. Los tags mencionan tambien x-f16 e IQ4_XS, cuyas variantes ponderadas/imatrix se publican en un repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | swift-open-license-1.0 (etiquetada como `license: other`) |
| Formato de pesos | GGUF (cuantizaciones estaticas, `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) |

Nota: el tamano total del repositorio es de 190,8 GB, correspondiente al conjunto completo de cuantizaciones publicadas. El modelo base sin cuantizar esta en ukisai/Swift-Qwen3.8-27b.

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en los materiales proporcionados. Los metadatos indican que el modelo base `ukisai/Swift-Qwen3.8-27b` fue afinado con LoRA (etiqueta `lora` y campo `base_model:adapter`), y que la tematica del ajuste gira en torno a razonamiento eficiente en tokens (`efficient-thinking`, `token-efficient`). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento.

La innovacion tecnica que se puede deducir del repositorio es doble. Por un lado, la publicacion de ficheros `mmproj` (multi-modal projection) junto a los pesos cuantizados indica que el modelo acepta entradas de imagen ademas de texto, gestionadas mediante un proyector multimodal separado que se carga junto al modelo en llama.cpp. Por otro lado, la inclusion de cuantizaciones desde Q2_K hasta Q8_0 permite ajustar el equilibrio entre calidad y consumo de memoria, aunque el propio autor advierte que Q3_K_M es de calidad inferior y que las variantes IQ suelen ser preferibles a cuantizaciones no-IQ de tamano similar.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado como `conversational`.
- Razonamiento explicito con modo de pensamiento eficiente en tokens, segun las etiquetas `reasoning`, `efficient-thinking` y `token-efficient`.
- Entrada multimodal de imagenes: el repositorio incluye el proyector `mmproj` en Q8_0 y f16.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso detras de APIs compatibles con el formato de chat.
- Uso como modelo base o adaptador LoRA en pipelines de `transformers`, dado que el modelo original se distribuye con esa libreria.
- Capacidades de tool calling, function calling, agentes y multi-step reasoning: no disponibles en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado; no hay evidencia de soporte de otros idiomas.
- Capacidades de audio o vision mas alla de la entrada de imagen: no disponibles.

## Casos de uso

- Razonamiento con restriccion de coste: el modelo esta etiquetado como `token-efficient`, por lo que resulta adecuado para tareas de cadena de pensamiento donde el presupuesto de tokens de salida es un factor critico (por ejemplo, clasificacion con justificacion breve o extraccion de datos con verificacion). El modo de pensamiento eficiente reduce el coste por consulta frente a modelos de razonamiento que generan trazas muy largas.
- Despliegue en estacion de trabajo con GPU de consumo: con las variantes Q4_K_S (15,9 GB) o Q4_K_M (16,9 GB), el modelo cabe en una GPU de 24 GB como la RTX 4090 o la RTX 3090, lo que permite ejecutar un modelo de aproximadamente 27 B de parametros en local sin infraestructura de centro de datos.
- Procesamiento de documentos con imagenes: gracias a los ficheros `mmproj`, se puede cargar el proyector multimodal en llama.cpp y usar el modelo para tareas que combinen texto e imagen, como la descripcion de capturas o la extraccion de informacion de documentos escaneados, siempre que el soporte multimodal del modelo base este confirmado.
- Prototipado rapido de asistentes conversacionales en ingles: la etiqueta `conversational` y el formato GGUF permiten levantar un servidor compatible con la API de OpenAI en minutos mediante Ollama o llama.cpp, sin pasos de conversion de pesos.
- Investigacion sobre eficiencia de razonamiento: al ser un ajuste LoRA orientado explicitamente a reducir tokens de pensamiento, sirve como punto de comparacion frente a su modelo base u otros modelos de razonamiento del mismo rango de parametros, midiendo precision frente a tokens generados.
- Evaluacion de cuantizaciones: el repositorio cubre el espectro de Q2_K a Q8_0, lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad por nivel de cuantizacion en un modelo de ~27 B (el autor enlaza la grafica comparativa de perplexidad de ikawrakow y las notas de Artefact2).
- Ejecucion en equipos con poca VRAM o solo CPU: las variantes Q2_K y Q3_K_S (11,0 y 12,4 GB) permiten inferencia con offload parcial a CPU en equipos de 16 GB de RAM/VRAM, a costa de una perdida de calidad reconocida por el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas, y los resultados de la busqueda web no aportan datos tecnicos sobre el modelo.

## Requisitos de hardware

Estimaciones de VRAM para inferencia, calculadas a partir de los tamanos de fichero publicados mas un margen para el contexto activo y el estado de la KV cache (el margen real dependera de la longitud de contexto configurada):

| Cuantizacion | Tamano del fichero | VRAM minima orientativa | GPU tipica |
|---|---|---|---|
| Q2_K | 11,0 GB | ~13-14 GB | RTX 4080 16 GB, RTX 4060 Ti 16 GB |
| Q3_K_S | 12,4 GB | ~14-15 GB | RTX 4080 16 GB |
| Q3_K_M | 13,6 GB | ~15-16 GB | RTX 4080 16 GB |
| Q3_K_L | 14,7 GB | ~16-17 GB | RTX 4080 16 GB (al limite) |
| Q4_K_S | 15,9 GB | ~17-18 GB | RTX 4090 24 GB, RTX 3090 24 GB |
| Q4_K_M | 16,9 GB | ~18-19 GB | RTX 4090 24 GB, RTX 3090 24 GB |
| Q5_K_M | 19,6 GB | ~21-22 GB | RTX 4090 24 GB |
| Q6_K | 22,5 GB | ~24-25 GB | RTX 4090 24 GB (ajustado), A6000 48 GB |
| Q8_0 | 29,1 GB | ~31-32 GB | A100 40 GB, 2x RTX 4090 |
| Pesos completos (FP16, estimado) | ~54,6 GB | ~60 GB o mas | A100 80 GB, H100 80 GB |
| Proyector multimodal | mmproj-Q8_0 0,7 GB / mmproj-f16 1,0 GB | suma al total | se carga junto al modelo |

- Cabe en GPU de consumo: si, desde Q2_K hasta Q6_K en GPUs de 16 GB a 24 GB. Las variantes Q4_K_S y Q4_K_M son las recomendadas por el autor por equilibrio entre velocidad y calidad.
- GPU de centro de datos recomendadas: A100 40 GB o 80 GB y H100 80 GB para Q8_0 o pesos completos. Para Q4_K_M o Q5_K_M, una A6000 o L40S de 48 GB ofrecen margen de contexto amplio.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp, text-generation-webui). vLLM y TGI no consumen GGUF de forma nativa; para esos runtimes habria que usar los pesos originales en safetensors del modelo base.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos verificables de modelos alternativos (parametros, contexto, benchmarks) con los que establecer una comparacion rigurosa. La unica referencia directa disponible es el modelo del que derivan estos pesos:

| Modelo | Relacion | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Swift-Qwen3.8-27b-GGUF | Este modelo (cuantizado por mradermacher) | 27,3 B | GGUF (Q2_K a Q8_0) + mmproj | swift-open-license-1.0 | HuggingFace |
| ukisai/Swift-Qwen3.8-27b | Modelo base (adaptador LoRA) | 27,3 B | safetensors (transformers) | swift-open-license-1.0 | HuggingFace |
| mradermacher/Swift-Qwen3.8-27b-i1-GGUF | Mismas cuantizaciones con imatrix/weighted | 27,3 B | GGUF | swift-open-license-1.0 | HuggingFace |

Comparativas con otros modelos de la misma categoria (por ejemplo, alternativas densas de 27-32 B de parametros de otras familias): no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: solo ingles declarado. No hay evidencia de soporte de castellano ni de otros idiomas, por lo que su uso en produccion multilingue no esta respaldado por la documentacion.
- Sesgos conocidos: no disponibles. Al ser un ajuste LoRA sobre una base de la familia Qwen3, heredara los sesgos del modelo base y del dataset de ajuste, pero no se documentan en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de fidelidad ni de tasas de alucinacion publicadas para este ajuste. Los modelos con modo de razonamiento pueden generar cadenas de pensamiento plausibles pero incorrectas.
- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval ni similares, lo que impide validar las afirmaciones de eficiencia en tokens y de razonamiento.
- Restricciones de licencia: la licencia es `swift-open-license-1.0`, clasificada como `license: other`. No es una licencia estandar tipo Apache 2.0 o MIT, por lo que es obligatorio revisar el texto completo de la licencia antes de cualquier uso comercial.
- Longitud de contexto desconocida: no se especifica en la informacion, lo que complica el dimensionamiento de la KV cache y la planificacion de memoria en produccion.
- Reputacion del repositorio: 0 descargas y 0 likes en el momento de la consulta, y ninguna validacion de terceros. Es un artefacto recien publicado (creado el 12 de septiembre de 2026) sin adopcion constatada.
- Cuantizaciones de baja calidad: el propio autor advierte que Q3_K_M es de calidad inferior y que las variantes IQ suelen superar a las no-IQ de tamano similar. Para produccion, no se recomienda bajar de Q4_K_S.
- Uso del proyector multimodal: los ficheros `mmproj` requieren un runtime que soporte el pipeline multimodal correspondiente; no todos los frontends de GGUF lo implementan.
- Resultados de busqueda web: las consultas realizadas no devolvieron informacion tecnica relevante sobre el modelo (unicamente enlaces genericos no relacionados), por lo que esta ficha se basa exclusivamente en los metadatos de HuggingFace y en la model card del repositorio.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Swift-Qwen3.8-27b-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Swift-Qwen3.8-27b-i1-GGUF
- Pagina resumen del modelo con lista de descargas: https://hf.tst.eu/model#Swift-Qwen3.8-27b-GGUF
- Guia de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplexidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (patrocinador del trabajo de cuantizacion): https://www.nethype.de/
