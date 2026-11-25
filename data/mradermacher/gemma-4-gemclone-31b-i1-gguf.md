# mradermacher/Gemma-4-GemClone-31B-i1-GGUF

## Resumen

Gemma-4-GemClone-31B-i1-GGUF es una distribucion de cuantizaciones GGUF generadas por mradermacher a partir del modelo fusionado Ateron/Gemma-4-GemClone-31B. El modelo subyacente es una fusion (merge) realizada con mergekit, orientada a generacion de texto conversacional y roleplay, y construida sobre la familia Gemma. La contribucion de este repositorio no es el modelo en si, sino el conjunto de cuantizaciones con imatrix (Q2_K, IQ3_M, Q4_K_M, Q5_K_M, Q6_K, entre otras) que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp y ecosistemas compatibles.

El repositorio declara la etiqueta `merge` y `mergekit`, lo que indica que el modelo base es una combinacion de pesos de otros modelos, no un entrenamiento desde cero. La model card indica explicitamente que se trata de un modelo de vision, con ficheros mmproj (si existen) alojados en el repositorio estatico hermano. El idioma declarado es unicamente ingles (`en`).

Es relevante ahora porque las cuantizaciones con imatrix de mradermacher son un estandar de facto para desplegar modelos grandes en local con perdida de calidad controlada, y porque permite evaluar una fusion de la familia Gemma en formato GGUF sin depender de infraestructura de GPU de datacenter. No obstante, el repositorio no incluye resultados de benchmarks ni detalles de la fusion, por lo que su evaluacion practica requiere pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma); fusion realizada con mergekit |
| Parametros totales | 6.850.770 (dato del campo safetensors del repo; no coincide con el nombre "31B", ver advertencias) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (segun tags de la model card) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); fichero imatrix adicional para generar cuantizaciones propias |

## Arquitectura y entrenamiento

El modelo subyacente (Ateron/Gemma-4-GemClone-31B) es una fusion de pesos generada con mergekit, segun las etiquetas del repositorio. No se dispone de informacion sobre la receta de fusion (metodo, modelos de origen, pesos de interpolacion) ni sobre datos de entrenamiento adicionales. Al tratarse de una fusion, no hay un proceso de entrenamiento propio documentado: los pesos provienen de los modelos combinados.

Las cuantizaciones de este repositorio se generan con el pipeline de mradermacher, que produce cuantizaciones tipo `i1` usando ficheros imatrix (importance matrix) para mejorar la calidad en tamanos pequenos. La model card indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que describe el proceso de conversion desde pesos Hugging Face a GGUF y la aplicacion de imatrix. No se documentan innovaciones arquitectonicas propias ni detalles sobre decodificacion especulativa, atencion lineal u otras tecnicas.

## Capacidades

- Generacion de texto conversacional y roleplay, segun las etiquetas del repositorio (`roleplay`).
- Capacidades de vision declaradas por el autor de la model card ("This is a vision model"), con ficheros mmproj (si existen) en el repositorio estatico hermano.
- Soporte multilingue limitado al ingles (`en`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking: no disponible.
- Capacidades de codigo y matematicas: no disponible (no se documentan).

## Casos de uso

- Roleplay y personajes conversacionales: el modelo esta etiquetado explicitamente para `roleplay`, por lo que puede usarse en aplicaciones de chat con personajes, manteniendo consistencia de estilo mediante prompting. Adecuado para prototipos locales con llama.cpp.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones Q4_K_M y Q5_K_M, puede ejecutarse en GPU de consumo con VRAM limitada, lo que permite experimentar con un modelo de la familia Gemma sin infraestructura cloud.
- Generacion de texto asistida en escritura creativa: util para borradores, continuaciones narrativas y variaciones estilisticas, dado su enfoque conversacional.
- Evaluacion comparativa de fusiones: sirve como banco de pruebas para comparar la calidad de una fusion mergekit frente al modelo Gemma original en tareas de generacion libre.
- Investigacion sobre cuantizacion: el fichero imatrix incluido permite generar cuantizaciones propias y estudiar el impacto de distintas matrices de importancia en la perplejidad.
- Integracion en pipelines de inferencia locales: compatible con llama.cpp, Ollama y otros runners GGUF, lo que facilita su inclusion en herramientas de escritorio y entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision, ya que el numero de parametros declarado (6,85 M) no es coherente con el nombre "31B" ni con el tamano del repositorio (0,0 GB). Como referencia orientativa, un modelo de ~31B en Q4_K_M requiere del orden de 18-20 GB de VRAM, y en Q5_K_M en torno a 22-24 GB; en Q2_K, unos 12-13 GB. Estas cifras son estimaciones genericas para modelos de ese tamano y no datos verificados de este repositorio.
- GPU recomendadas: para cuantizaciones altas (Q5_K_M, Q6_K) se requeriria una GPU de 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB); para cuantizaciones bajas (Q2_K, IQ3) podria caber en GPUs de 12-16 GB.
- GPU de consumo: probablemente viable en RTX 4090 (24 GB) con cuantizaciones Q4/Q5 si el modelo es realmente de ~31B; en GPUs de 8-12 GB solo con cuantizaciones muy agresivas o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF. La model card menciona compatibilidad con endpoints (`endpoints_compatible`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-GemClone-31B-i1-GGUF (este) | declarado 6,85 M (inconsistente con "31B") | no disponible | Apache 2.0 | GGUF | Fusion con mergekit, orientada a roleplay |
| Ateron/Gemma-4-GemClone-31B | no disponible | no disponible | Apache 2.0 | safetensors (presumible) | Modelo base sin cuantizar |
| mradermacher/Gemma-4-GemClone-31B-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Inconsistencia en el numero de parametros: el campo safetensors indica 6.850.770 parametros, mientras que el nombre del modelo sugiere 31B. Esto puede deberse a un error de metadatos del repositorio o a que el campo refleja solo una parte del modelo. Debe verificarse antes de planificar recursos.
- El repositorio tiene 0 descargas y 0 likes, y el tamano declarado es 0,0 GB, lo que sugiere que puede estar incompleto o recien creado. Verificar la integridad de los ficheros antes de usarlo.
- Al ser una fusion (merge) sin documentacion de la receta, se desconoce la procedencia exacta de los pesos y las posibles obligaciones de atribucion de los modelos originales.
- Idioma limitado al ingles: no se garantiza un rendimiento adecuado en castellano.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones.
- Sesgos: no documentados por el autor; al derivar de la familia Gemma, pueden heredarse sesgos de los modelos originales.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentacion sobre los modelos fusionados puede generar incertidumbre sobre la cadena de licencias.
- La funcionalidad de vision depende de ficheros mmproj que, segun la model card, estarian en el repositorio estatico; no se confirma su presencia.
- No hay benchmarks publicados, por lo que la calidad real del modelo es desconocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-GemClone-31B-i1-GGUF
- Modelo base: https://huggingface.co/Ateron/Gemma-4-GemClone-31B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Gemma-4-GemClone-31B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-4-GemClone-31B-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
