# minjaechoi/qwen36-35b-a3b-2p00bit-r6

## Resumen

`minjaechoi/qwen36-35b-a3b-2p00bit-r6` es un checkpoint derivado del modelo base Qwen/Qwen3.6-35B-A3B, publicado por el usuario minjaechoi en HuggingFace. Se trata de un ejercicio de cuantización selectiva sobre una arquitectura de mezcla de expertos (MoE): unicamente los expertos enrutados se almacenan con una precisión media de 2,00 bits, mientras que el resto de los pesos (atencion, embeddings, routers, capas densas) permanecen en BF16. La model card lo describe explicitamente como "checkpoint de investigacion interna", con identificador interno `r6`.

El dato mas relevante tecnicamente es que los pesos no se guardan comprimidos: el autor indica que se almacenan ya desquantizados en tensores BF16 y que cargan con `transformers` estandar y con vLLM. Esto significa que la reduccion a 2,00 bits afecta al proceso de compresion y reconstruccion aplicado durante la creacion del checkpoint, pero no al consumo de memoria en inferencia: el repositorio ocupa 70,2 GB, coherente con 35.107.181.936 parametros almacenados a 2 bytes por parametro.

Su relevancia practica hoy es limitada y de caracter exploratorio. El modelo acumula 0 descargas y 0 "likes", no declara licencia concreta ni idiomas soportados, y no publica benchmarks. Resulta util, eso si, como caso de estudio de cuantizacion a precision sub-3 bits sobre MoE y como banco de pruebas para comparar el comportamiento de un modelo con ~3.000 millones de parametros activos teoricos frente a su version en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (tag `qwen3_5_moe`), derivada de Qwen/Qwen3.6-35B-A3B |
| Parametros totales | 35.107.181.936 (35,1B), dato real de los tensores safetensors |
| Parametros activos | Aproximadamente 3.000 millones segun la nomenclatura "A3B" del nombre del modelo; no confirmado en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,00 bits de media (dinamica por experto); resto de pesos en BF16. Los pesos se almacenan desquantizados en tensores BF16, por lo que no hay reduccion de memoria frente a BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica unicamente que "sigue la licencia del modelo base" (Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (tensores BF16), compatible con `transformers` y vLLM |
| Tamano del repositorio | 70,2 GB |
| Pipeline declarado | text-generation (el tag `image-text-to-text` tambien aparece, ver limitaciones) |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento, porque no lo hay: se trata de un checkpoint de cuantizacion, no de un modelo entrenado desde cero. El modelo base es Qwen/Qwen3.6-35B-A3B, una arquitectura de mezcla de expertos con enrutado disperso (tag `qwen3_5_moe`), de la que este repositorio hereda todos los hiperparametros salvo la precision de los expertos enrutados.

La innovacion tecnica del checkpoint reside en el esquema de cuantizacion: se aplica una precision media de 2,00 bits exclusivamente a los expertos enrutados, dejando el resto de la red en BF16. No se documentan el numero de tokens de calibracion, la composicion del dataset de calibracion, ni si se emplearon tecnicas de ajuste posterior como RLHF o DPO. Tampoco se detalla el metodo de cuantizacion (por ejemplo, escalas por grupo, GPTQ, AWQ o un esquema propio), mas alla del valor agregado de 2,00 bits. La decision de almacenar los tensores ya desquantizados implica que la ganancia buscada no es el ahorro de VRAM en inferencia, sino la fidelidad de reconstruccion de los expertos respecto al modelo original.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado `text-generation` y el tag `conversational`.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.6-35B-A3B, no verificadas de forma independiente en este checkpoint.
- Procesamiento de imagenes: el tag `image-text-to-text` sugiere entrada multimodal, pero la model card no menciona vision y el pipeline declarado es solo de texto. Dato contradictorio, no confirmado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible, y no aparecen tags que las sugieran.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion sub-3 bits en MoE: el checkpoint permite medir la degradacion de un modelo de 35,1B con expertos a 2,00 bits frente al modelo base en BF16, usando exactamente la misma arquitectura y el mismo tokenizador.
- Investigacion sobre sensibilidad de componentes: al mantener routers, atencion y embeddings en BF16, sirve para aislar cuanto del comportamiento final depende de la precision de los expertos enrutados.
- Validacion de pipelines de carga en `transformers` y vLLM: el autor afirma compatibilidad directa con ambas librerias, por lo que es util para probar flujos de carga de checkpoints de gran tamano (70,2 GB) sin conversiones adicionales.
- Pruebas de integracion en endpoints compatibles: el tag `endpoints_compatible` permite usarlo como banco de pruebas en infraestructuras de inferencia gestionada, aunque su tamano exige nodos de 80 GB o tensor parallelism.
- Experimentos academicos reproducibles: al ser un checkpoint con identificador interno (`r6`) y parametros declarados, facilita la comparacion entre variantes de cuantizacion del mismo modelo base.
- Estudio de coste computacional de MoE dispersos: con ~3.000 millones de parametros activos teoricos y 35,1B totales, permite medir la brecha entre coste de FLOPs y coste real de ancho de banda de memoria en inferencia.
- Generacion de codigo o texto en entornos de investigacion sin requisitos de produccion: siempre que se asuma que no hay benchmarks ni garantias de calidad publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para este checkpoint ni comparativos con el modelo base. Tampoco se publican mediciones de latencia, throughput ni perplejidad.

## Requisitos de hardware

- VRAM estimada para inferencia en el formato distribuido: aproximadamente 70,2 GB solo de pesos (35,1B parametros a 2 bytes en BF16), mas cache KV y activaciones. El esquema de 2,00 bits no reduce este requisito, porque los pesos se almacenan ya desquantizados.
- GPU de 80 GB: H100 80 GB, A100 80 GB o H200 permiten cargar el modelo en una sola GPU, con margen limitado para cache KV segun la longitud de contexto.
- Multi-GPU: 2 x 48 GB (L40S, A6000 Ada) o 2 x 80 GB con tensor parallelism cubren los pesos con holgura. 4 x 24 GB (RTX 4090, RTX 3090) es viable en terminos de memoria agregada (96 GB) con vLLM y TP=4, aunque con poca holgura para contexto largo.
- GPU de consumo: una unica RTX 4090 o RTX 3090 de 24 GB no es suficiente en BF16. Para caber en una sola tarjeta de consumo seria necesario requantizar el checkpoint a 4 bits o inferior (por ejemplo, a GGUF), lo que anularia la premisa del checkpoint publicado.
- Opciones de despliegue: `transformers` y vLLM estan confirmados por el autor. llama.cpp, Ollama y TGI no se mencionan; su viabilidad depende de que exista conversion a GGUF, no documentada.
- Latencia y throughput: no disponible. Cualitativamente, al tratarse de un modelo con muchos parametros totales y pocos activos, la inferencia queda limitada por el ancho de banda de memoria necesario para recorrer los 70,2 GB de pesos mas que por los FLOPs.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen36-35b-a3b-2p00bit-r6 | 35,1B | ~3B (no confirmado) | no disponible | Sigue la del modelo base (no especificada) | Checkpoint de investigacion interna, 0 descargas, 0 likes |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32.768 nativo, ampliable a 131.072 con YaRN | Apache 2.0 | Publico en HuggingFace |
| Mixtral 8x7B | 46,7B | 12,9B | 32.768 | Apache 2.0 | Publico en HuggingFace |
| Qwen/Qwen3.6-35B-A3B (modelo base) | no disponible en los datos proporcionados | no disponible en los datos proporcionados | no disponible | no disponible | Referenciado como modelo base |

No se dispone de datos de rendimiento comparados entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, ni del checkpoint ni de su degradacion respecto al modelo base. Cualquier uso en produccion seria a ciegas.
- El ahorro de memoria es nulo: los pesos se distribuyen desquantizados en BF16, de modo que el repositorio ocupa 70,2 GB y el requisito de VRAM equivale al de un modelo de 35,1B en BF16. El valor de 2,00 bits describe la precision de reconstruccion de los expertos, no el almacenamiento final.
- Licencia sin concretar: la model card remite a la licencia del modelo base, que no se especifica en la informacion disponible. Esto impide determinar si el uso comercial esta permitido.
- Idiomas no declarados: no hay lista de idiomas soportados, lo que impide planificar despliegues multilingues.
- Contexto desconocido: no se indica la longitud de contexto, un parametro critico para casos de uso con documentos largos o conversaciones multi-turno.
- Inconsistencia en los tags: el pipeline declarado es `text-generation`, pero el tag `image-text-to-text` sugiere capacidades de vision que la model card no respalda. Debe verificarse antes de asumir entrada de imagenes.
- Riesgo de alucinacion: no cuantificado. La cuantizacion agresiva de los expertos enrutados puede incrementar la degradacion en tareas de razonamiento, pero no hay datos que lo confirmen ni lo descarten.
- Sesgos: no evaluados ni documentados.
- Estado de investigacion interna: el propio autor lo etiqueta como checkpoint de investigacion, con 0 descargas y 0 likes, sin garantia de mantenimiento ni soporte.
- Procedencia de los resultados de busqueda: las busquedas web realizadas no arrojaron informacion relevante sobre el modelo; los resultados obtenidos trataban sobre las oficinas de Microsoft en Redmond y no guardan relacion con este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-2p00bit-r6
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web no devolvio resultados relevantes sobre este modelo.
