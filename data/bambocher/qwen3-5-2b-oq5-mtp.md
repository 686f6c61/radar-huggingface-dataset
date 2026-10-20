# bambocher/Qwen3.5-2B-oQ5-mtp

## Resumen

Qwen3.5-2B-oQ5-mtp es una cuantizacion mixta de precision del modelo Qwen3.5-2B publicada por el usuario bambocher en HuggingFace, generada con la herramienta oQ de oMLX (version v0.7.1rc1). No es un modelo entrenado desde cero, sino una conversion de pesos orientada a inferencia eficiente en Apple Silicon mediante el framework MLX. El checkpoint ocupa 1,921 GiB (2,06 GB) y contiene 2.274.069.824 parametros reales, verificados en los safetensors del repositorio, con un promedio efectivo de 7,255 bits por peso.

El checkpoint conserva tres componentes diferenciados: el modelo de lenguaje (1.882B de parametros), una torre de vision (0.331B) que habilita comprension de imagenes, y una cabeza MTP (multi-token prediction, 0.061B) pensada para decodificacion especulativa y aceleracion de la generacion. La mezcla de precisiones es heterogenea: el 76,1% de los pesos esta en affine 5-bit con grupo de 64, el 14,97% permanece en BF16 y el resto se reparte entre 6-bit y 8-bit, una estrategia habitual para proteger embeddings, normas y capas sensibles de la perdida de calidad.

Su relevancia es acotada pero concreta: permite ejecutar un modelo multimodal de ~2,3B con contexto de decodificacion especulativa en equipos Apple con memoria unificada modesta, algo que las versiones BF16 originales (~4,5 GB solo en pesos) hacen con menos margen. Ahora bien, se trata de una publicacion comunitaria con 9 descargas, sin evaluacion publicada ni licencia declarada en el repositorio, por lo que debe tratarse como material experimental hasta verificar la procedencia y los terminos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + torre de vision + cabeza MTP); detalles de la arquitectura base no disponibles |
| Parametros totales | 2.274.069.824 (2,274B) |
| Parametros activos | no disponible (no se indica que sea MoE; el card no lo menciona) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64 (1,731B pesos, 76,118%), affine 6-bit grupo 64 (0,096B, 4,209%), affine 8-bit grupo 64 (0,107B, 4,706%), BF16 (0,340B, 14,967%); promedio efectivo 7,255 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX), libreria `mlx` |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 1,882B | 1,327 GB / 1,236 GiB |
| Vision | 0,331B | 0,663 GB / 0,617 GiB |
| Cabeza MTP | 0,061B | 0,073 GB / 0,068 GiB |
| Total | 2,274B | 2,062 GB / 1,921 GiB |

## Arquitectura y entrenamiento

La informacion disponible solo describe el proceso de cuantizacion, no el entrenamiento del modelo base. Sabemos que la arquitectura subyacente es un transformer multimodal con tres bloques: un modelo de lenguaje de 1,882B de parametros, una torre de vision de 0,331B (lo que implica entrada de imagenes, no solo texto) y una cabeza de prediccion multi-token de 0,061B. La presencia de una cabeza MTP es relevante tecnicamente: permite que el modelo proponga varios tokens por paso y que un verificador los acepte en bloque, lo que se traduce en decodificacion especulativa integrada y mayor velocidad de generacion respecto a la decodificacion autorregresiva clasica.

El checkpoint se ha producido con oQ (oMLX v0.7.1rc1), que aplica cuantizacion de precision mixta por capas en lugar de un unico ancho de bits. La distribucion resultante deja en BF16 el 14,97% de los pesos (0,340B), presumiblemente capas normalizadoras, embeddings y componentes sensibles, mientras que el grueso del transformer va en affine 5-bit con grupo de 64. El resultado es un promedio de 7,255 bits/peso, mas conservador que un 5-bit uniforme, lo que reduce la degradacion esperada a costa de un tamano algo mayor. No se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo ajuste por RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, heredados del modelo base Qwen3.5-2B (rendimiento concreto no disponible).
- Comprension de imagenes: la torre de vision de 0,331B de parametros esta incluida en el checkpoint, por lo que el modelo admite entradas visuales ademas de texto.
- Decodificacion multi-token mediante la cabeza MTP, orientada a reducir latencia de generacion.
- Ejecucion nativa en Apple Silicon a traves de MLX, con memoria compartida entre CPU y GPU.
- Capacidades de tool calling, agentes o modo thinking: no disponibles en la informacion proporcionada (dependen del modelo base, no verificadas aqui).
- Cobertura multilingue: no disponible.

## Casos de uso

- Prototipado local en Mac: desarrolladores que quieran probar un modelo multimodal de ~2,3B sin depender de la nube pueden cargar el checkpoint en mlx-lm o LM Studio sobre un Mac con 16 GB de memoria unificada y trabajar con texto e imagenes en local.
- Extraccion de informacion de documentos con capturas: al combinar vision y lenguaje, el modelo sirve para transcribir y estructurar datos de imagenes de formularios, tickets o capturas de pantalla en un pipeline por lotes que corre enteramente en el equipo del analista.
- Asistentes de escritorio con requisitos de privacidad: al no requerir conexion externa, encaja en herramientas internas donde el contenido (por ejemplo, imagenes medicas o documentos legales) no puede salir de la maquina.
- Generacion asistida en editores y entornos de desarrollo: su tamano reducido permite respuestas casi interactivas para autocompletado o explicacion de fragmentos, siempre que se valide la calidad real frente al modelo base sin cuantizar.
- Evaluacion comparativa de cuantizaciones: util como sujeto de prueba para medir la perdida de calidad de una mezcla 5/6/8-bit frente al BF16 original en tareas concretas del equipo, usando la cabeza MTP para medir tambien el impacto en velocidad.
- Clasificacion y etiquetado de imagenes con justificacion textual: catalogacion de fotos o capturas en lotes pequenos, con la ventaja de que la inferencia no consume cuota de API.
- Docencia y experimentacion con decodificacion especulativa: la cabeza MTP explicita hace del checkpoint un caso practico para estudiar como se aceptan o rechazan tokens propuestos en un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta el proceso de cuantizacion (distribucion de bits, desglose de almacenamiento y promedio efectivo de 7,255 bits/peso); no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica de calidad, ni comparaciones con el checkpoint BF16 del que deriva.

## Requisitos de hardware

- Pesos en disco y en memoria: 1,921 GiB para el checkpoint cuantizado; el modelo base en BF16 rondaria los 4,5 GB solo en pesos (calculo a partir de 2,274B parametros a 2 bytes, no publicado por el autor).
- VRAM o memoria unificada estimada para inferencia: aproximadamente 3-4 GB en total para pesos, cache KV y overhead del runtime en conversaciones cortas (estimacion, no medida publicada); sube con contextos largos y con entrada de imagenes de resolucion alta.
- GPU compatibles: exclusivamente Apple Silicon (series M1, M2, M3, M4 y posteriores) por el formato MLX. No es cargable directamente en CUDA.
- Cabe en consumer GPU: si, en Mac con 8 GB de memoria unificada de forma justa, y con margen comodo en 16 GB. En GPUs NVIDIA consumer requeriria conversion previa a otro formato (por ejemplo GGUF), que el autor no proporciona.
- Opciones de despliegue: mlx-lm y mlx-vlm para inferencia en Python, LM Studio con backend MLX, integracion en apps Swift mediante mlx-swift, y las utilidades de oMLX para regenerar o reconvertir el checkpoint.
- Latencia y throughput: no disponibles. Se espera que la cabeza MTP aporte aceleracion frente a decodificacion autorregresiva pura, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la informacion proporcionada, por lo que una comparacion cuantitativa rigurosa no es posible. La siguiente tabla recoge unicamente lo verificable y marca como no disponible el resto.

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Qwen3.5-2B-oQ5-mtp (este) | 2,274B totales (1,882B LM + 0,331B vision + 0,061B MTP) | no disponible | no disponible | safetensors MLX, 1,921 GiB, HuggingFace |
| Qwen3.5-2B (base, BF16) | 2,274B (misma estructura segun el desglose) | no disponible | no disponible | no disponible en la informacion aportada |
| Alternativas de ~2-4B multimodales (Qwen2.5-VL-3B, Gemma 3 4B, Llama 3.2 3B) | no disponible | no disponible | no disponible | existen en HuggingFace, pero sin datos verificados en esta busqueda |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia, lo que impide determinar si el uso comercial es admisible. Antes de cualquier despliegue en produccion hay que consultar los terminos del modelo base Qwen3.5-2B y del autor de la cuantizacion.
- Procedencia no verificada: se trata de una cuantizacion comunitaria (9 descargas, 0 likes, publicada el 20 de octubre de 2026) sin validacion independiente de calidad ni de integridad de los pesos.
- Sin evaluacion publicada: no hay ninguna metrica que cuantifique la degradacion introducida por la mezcla 5/6/8-bit frente al original en BF16. En un modelo de 2B, donde el margen es estrecho, este extremo es especialmente relevante.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay datos especificos para este checkpoint. Se recomienda verificacion externa en tareas factuales.
- Contexto e idiomas no documentados: se desconoce la ventana maxima real y la cobertura linguistica, por lo que no se debe asumir soporte fiable de castellano sin pruebas propias.
- Dependencia de plataforma: el formato MLX limita la ejecucion a Apple Silicon; migrar a CUDA, ROCm o CPU exige conversion a otro formato y puede alterar el comportamiento numerico.
- Capacidades de agente y tool calling no confirmadas: al no documentarse, no deben presuponerse; conviene validar el chat template y el parseo de llamadas a herramientas antes de integrarlo.
- Idoneidad limitada para produccion de alta exigencia: por tamano y por falta de datos de rendimiento, no es un candidato para tareas que requieran razonamiento complejo o exactitud elevada sin una capa de validacion.
- Nota sobre la busqueda web: los resultados recuperados no guardan ninguna relacion con el modelo (contenido de caracter adulto y ajeno al ambito tecnico), por lo que se han descartado integramente y no se incluyen como enlaces.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/Qwen3.5-2B-oQ5-mtp
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Papers, blogs, repos de inferencia o demos del autor: no disponibles en la informacion proporcionada.
