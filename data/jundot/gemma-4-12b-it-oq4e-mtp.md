# Jundot/gemma-4-12B-it-oQ4e-mtp

## Resumen

gemma-4-12B-it-oQ4e-mtp es un checkpoint cuantizado en formato MLX del modelo google/gemma-4-12B-it, publicado por el usuario Jundot. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.7.1) mediante cuantizacion de precision mixta oQ4e, que asigna bits por capa segun su sensibilidad medida. El resultado es un checkpoint de 12.383B parametros logicos que ocupa 7.379 GiB en disco, con una media efectiva de 5.119 bits por peso, frente a los aproximadamente 24 GB que ocuparia el modelo base en BF16.

El modelo base pertenece a la familia Gemma 4 de Google DeepMind y es un modelo unificado de 11,95B parametros: no tiene encoders separados, sino que los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings mediante capas lineales ligeras, y todas las modalidades pasan por un unico transformer decoder-only con 256K tokens de contexto. La variante aqui descrita incorpora ademas una cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-12B-it-assistant, que anade 0.423B parametros y sirve para decodificacion especulativa.

Su relevancia practica es doble. Por un lado, reduce el modelo a un tamano manejable en equipos con memoria unificada de Apple Silicon, manteniendo las capacidades any-to-any del original. Por otro, el uso de precision mixta con matrices de importancia permite conservar en BF16 las capas mas sensibles (3,705% de los pesos) y repartir el resto entre 4, 5 y 6 bits, lo que suele traducirse en una perdida de calidad menor que una cuantizacion uniforme a 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only unificado (any-to-any), sin encoders separados; proyecciones lineales para vision y audio |
| Parametros totales | 12.382.587.188 (12.383B), incluida la cabeza MTP |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Precision mixta oQ4e: affine 4-bit grupo 64 (79,036% de los pesos), affine 5-bit grupo 64 (15,227%), affine 6-bit grupo 64 (2,032%) y BF16 (3,705%). Media efectiva de 5,119 bits/peso |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0, con enlace a la licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | Safetensors (checkpoint MLX, libreria mlx) |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 11.943B | 7,068 GB / 6,583 GiB |
| Proyeccion de vision | 0.015B | 0,008 GB / 0,008 GiB |
| Proyeccion de audio | 0.002B | 0,001 GB / 0,001 GiB |
| Cabeza MTP | 0.423B | 0,846 GB / 0,788 GiB |
| **Total** | **12.383B** | **7,923 GB / 7,379 GiB** |

Distribucion de bits por formato de almacenamiento:

| Formato | Pesos logicos | Proporcion | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4-bit, grupo 64 | 9.787B | 79,036% | 5,127 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 1.885B | 15,227% | 1,207 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0.252B | 2,032% | 0,190 GiB | 6,50 |
| BF16 | 0.459B | 3,705% | 0,855 GiB | 16,00 |
| **Total** | **12.383B** | **100%** | **7,379 GiB** | **5,119** |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer decoder-only unificado de 11,95B parametros con 256K tokens de contexto. La particularidad del diseno es que elimina los encoders especificos de modalidad: los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings del transformer mediante capas lineales ligeras (0.015B parametros para vision y 0.002B para audio). Esto significa que un mismo backbone procesa texto, imagen y audio, lo que explica la etiqueta de pipeline any-to-any. El checkpoint anade una cabeza de prediccion multi-token (MTP) de 0.423B parametros, fusionada desde google/gemma-4-12B-it-assistant, que permite predecir varios tokens futuros en un solo paso y habilita decodificacion especulativa.

Sobre el entrenamiento del modelo base no se proporciona informacion en los datos disponibles (numero de tokens, composicion del dataset, uso de RLHF o DPO): no disponible. Lo que si esta documentado es el proceso de cuantizacion posterior. oQ4e asigna bits por sensibilidad de capa medida, despues redondea cada grupo con una matriz de importancia construida con 128 muestras de 512 tokens y aplica un reajuste por minimos cuadrados ponderados de la escala y el sesgo de cada grupo. El resultado es una asignacion no uniforme: el 79% de los pesos queda a 4 bits, un 15% a 5 bits, un 2% a 6 bits y un 3,7% se conserva en BF16. No se documenta que se haya realizado ningun reentrenamiento ni ajuste fino tras la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento general sobre el backbone de lenguaje de 11,943B pesos logicos.
- Procesamiento de imagen: los parches visuales se proyectan al espacio de embeddings mediante una capa lineal dedicada, por lo que el modelo acepta entradas de imagen ademas de texto.
- Procesamiento de audio: las formas de onda se proyectan de forma analoga mediante una proyeccion de 0.002B parametros.
- Naturaleza any-to-any: al compartir un unico decoder, el modelo puede manejar combinaciones de entrada y salida entre modalidades dentro del mismo backbone.
- Decodificacion especulativa mediante la cabeza MTP de 0.423B parametros, que predice multiples tokens y permite acelerar la generacion.
- Ventana de contexto de 256K tokens, util para documentos largos, conversaciones extensas o flujos multimodales prolongados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues especificas: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos largos en local: con 256K tokens de contexto, el modelo puede ingerir informes completos, expedientes o bases de codigo extensas en una sola pasada, algo inviable en modelos con ventanas de 8K o 32K sin troceado.
- Analisis de imagen y texto combinados en el puesto de trabajo: al proyectar los parches de imagen directamente al espacio de embeddings, permite tareas como extraer datos de capturas, diagramas o fotos de documentos y razonar sobre ellos junto al texto de contexto.
- Transcripcion y analisis de audio integrado: la proyeccion de audio permite pasar formas de onda al mismo backbone, de modo que se pueden encadenar tareas de resumen de reuniones o extraccion de acciones sin cambiar de modelo.
- Asistente local en Apple Silicon: al estar en formato MLX y ocupar 7,379 GiB, es desplegable en un Mac con memoria unificada suficiente, lo que sirve para prototipado de producto y flujos de trabajo con datos que no pueden salir del equipo.
- Investigacion sobre cuantizacion de precision mixta: la distribucion de bits documentada (4/5/6 bits y BF16) y el metodo oQ4e lo convierten en un caso de estudio reproducible para medir el impacto de la sensibilidad por capa en la calidad final.
- Servicio de inferencia multimodal acelerado: la cabeza MTP habilita decodificacion especulativa, util en despliegues donde la latencia por token es el cuello de botella y se quiere reducir el numero de pasos de decodificacion.
- Evaluacion comparativa de variantes cuantizadas: al existir el modelo base en BF16 y esta variante, permite al equipo medir la degradacion real de la cuantizacion sobre sus propios datos antes de decidir el formato de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint cuantizado no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base en BF16. Una busqueda web adicional no ha devuelto resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 7,379 GiB solo para los pesos, a los que hay que sumar la cache KV y el overhead del runtime. Con contexto corto, un presupuesto de 10-12 GB de memoria es un punto de partida razonable; con ventanas cercanas a 256K tokens, la cache KV puede crecer de forma considerable y conviene dimensionarla segun el numero de capas y cabezas del modelo base. Estas cifras son estimaciones derivadas del tamano del checkpoint, no datos publicados por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada con datos verificados. Al tratarse de un checkpoint MLX, el destino natural es Apple Silicon con memoria unificada (familias M-series con 16 GB o mas; 24 GB o mas si se quiere trabajar con contexto largo). No hay datos publicados sobre rendimiento en A100, H100 o RTX 4090 para este checkpoint.
- Compatibilidad con GPU de consumo: si, en la medida en que el runtime lo soporte. El checkpoint cabe en terminos de memoria en GPUs con 12-16 GB o mas, pero el formato MLX esta pensado para Apple Silicon, por lo que en GPUs NVIDIA o AMD habria que recurrir a conversion a otro formato, algo no documentado.
- Opciones de despliegue: MLX / mlx-lm es la via documentada, dado que el campo library_name es mlx y las herramientas usadas pertenecen al ecosistema oMLX. El uso directo con vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible; llama.cpp y Ollama requeririan una conversion a GGUF que no se ha publicado.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones, aunque cabe esperar una mejora derivada de la cabeza MTP frente a la decodificacion autoregresiva estandar; no hay cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/gemma-4-12B-it-oQ4e-mtp | 12.383B logicos, 5,119 bits/peso efectivos | 256K | Safetensors MLX (7,379 GiB) | Apache-2.0 | Publicado en HuggingFace |
| google/gemma-4-12B-it (base) | 11,95B | 256K | Safetensors (precision original, presumiblemente BF16) | Apache-2.0 | Publicado en HuggingFace |
| google/gemma-4-12B-it-assistant | No disponible | No disponible | No disponible | No disponible | Publicado en HuggingFace (origen de la cabeza MTP) |

No se dispone de datos verificados sobre otras alternativas de la misma categoria (por ejemplo, otros modelos multimodales de ~12B cuantizados a 4 bits), ni de resultados de benchmarks que permitan una comparacion de rendimiento. La comparacion con el modelo base se limita a parametros, contexto, formato y licencia, ya que no hay mediciones de calidad publicadas para esta variante cuantizada.

## Limitaciones y advertencias

- No hay ninguna metrica publicada de calidad tras la cuantizacion. El checkpoint tiene 0 descargas y 0 likes, y no se ha validado de forma independiente, por lo que la degradacion real frente al modelo base en BF16 es desconocida.
- La cuantizacion a 4 bits en el 79% de los pesos puede afectar de forma desigual a tareas sensibles, como razonamiento matematico o codigo, aunque el metodo oQ4e lo mitiga conservando capas sensibles en 5, 6 bits y BF16.
- El checkpoint esta en formato MLX, lo que limita su uso directo a entornos Apple Silicon con la libreria correspondiente. No hay conversion publicada a GGUF ni soporte documentado en vLLM, TGI o llama.cpp.
- El repositorio no documenta idiomas soportados, asi que no se puede garantizar cobertura multilingue concreta mas alla de lo que ofrezca el modelo base.
- No se documentan capacidades de tool calling, uso agentico ni modo de razonamiento explicito; si el pipeline de produccion depende de ellas, hay que verificarlas empiricamente antes de adoptarlo.
- La licencia declarada es Apache-2.0 siguiendo el modelo origen, pero se enlaza la licencia especifica de Gemma 4. Conviene revisar los terminos de uso adicionales de Google antes de un despliegue comercial, ya que pueden imponer condiciones distintas a las de Apache-2.0 estandar.
- Al ser un derivado cuantizado no oficial, no cuenta con soporte ni mantenimiento por parte de Google DeepMind. La trazabilidad del proceso depende del repositorio de oMLX.
- Riesgo de alucinacion y sesgos: no hay informacion especifica publicada para este checkpoint. Hereda los del modelo base, que tampoco se documentan aqui.
- La fecha de creacion registrada (2026-10-11) es posterior a la de la mayoria de checkpoints publicos conocidos; conviene confirmar la vigencia del repositorio antes de integrarlo.
- El desglose de almacenamiento indica que las proyecciones de vision (0.015B) y audio (0.002B) son muy pequenas en relacion con el backbone; el comportamiento de estas modalidades tras la cuantizacion no esta evaluado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/gemma-4-12B-it-oQ4e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo asistente (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-12B-it-assistant
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de la cuantizacion mejorada oQe: https://github.com/jundot/omlx/pull/4385
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Resultados de busqueda web: la busqueda no devolvio ningun resultado relevante sobre este modelo ni sobre su modelo base; los enlaces disponibles se limitan a los anteriores.
