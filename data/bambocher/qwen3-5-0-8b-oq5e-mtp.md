# bambocher/Qwen3.5-0.8B-oQ5e-mtp

## Resumen

Qwen3.5-0.8B-oQ5e-mtp es una reconstruccion cuantizada del modelo Qwen3.5-0.8B en formato MLX, publicada por el usuario bambocher mediante la herramienta oQ (oMLX v0.7.1rc1) con cuantizacion de precision mixta. El checkpoint resultante pesa 0,703 GiB y contiene 873.438.784 parametros logicos, con un promedio efectivo de 6,911 bits por peso: la mayor parte de las matrices (80,6 % de los pesos) se almacena en affine 5-bit con grupo de 64, mientras que un 11,8 % permanece en BF16 (probablemente capas sensibles como embeddings, normas o la torre visual). No es un modelo nuevo, sino una distribucion lista para ejecutar el modelo base de Qwen en Apple Silicon con un compromiso calidad/tamano distinto al de una cuantizacion uniforme de 4 bits.

El interés tecnico de esta ficha esta en dos componentes anadidos al decodificador de lenguaje: una torre de vision de 0,101B parametros (0,187 GiB) que convierte el modelo en multimodal, y una cabeza MTP de 0,020B parametros (0,022 GiB) pensada para prediccion multi-token y decodificacion especulativa. Con menos de 900 millones de parametros totales y un peso en disco inferior a 1 GB, es un candidato claro a inferencia local en portatiles, prototipado rapido y uso como modelo borrador en pipelines especulativos.

La relevancia practica es acotada pero real: el repo acumula 9 descargas y 0 likes en el momento de la consulta, la licencia no esta declarada en la informacion disponible y no hay resultados de benchmarks publicados. Es, por tanto, un artefacto de experimentacion con cuantizacion, no una release validada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (tag `qwen3_5`) con torre de vision y cabeza MTP; formato MLX |
| Parametros totales | 873.438.784 (0,873B) |
| Parametros activos | No aplica: la informacion disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Precision mixta: affine 5-bit grupo 64 (0,704B pesos), affine 6-bit grupo 64 (0,025B), affine 8-bit grupo 64 (0,041B), BF16 (0,103B); promedio 6,911 bits/peso |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), 0,703 GiB en total; libreria `mlx` |

Desglose por componente del checkpoint:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 0,752B | 0,493 GiB |
| Vision | 0,101B | 0,187 GiB |
| Cabeza MTP | 0,020B | 0,022 GiB |
| Total | 0,873B | 0,703 GiB |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen3.5-0.8B, identificada por el tag `qwen3_5`: un transformer decoder con atencion por token y una torre de vision independiente que procesa imagenes y las proyecta al espacio del decodificador. La presencia de la cabeza MTP (multi-token prediction) es la innovacion estructural mas relevante de esta distribucion: este modulo permite predecir varios tokens por paso y se emplea habitualmente como soporte de decodificacion especulativa, acortando el numero de pasos secuenciales necesarios para generar una secuencia. Con 20 millones de parametros dedicados a esta cabeza, el coste en memoria es marginal (0,022 GiB) frente al beneficio potencial en latencia.

Sobre el entrenamiento no hay informacion en los datos proporcionados: se desconoce el volumen de tokens, la composicion del corpus, si hubo fases de RLHF o DPO, y que receta de alineacion se aplico. Lo unico documentado es el proceso de post-entrenamiento aplicado por el autor de la cuantizacion: oQ (oMLX v0.7.1rc1) asigna precision por tensor en lugar de aplicar un ancho de bits uniforme, dejando en BF16 el 11,8 % de los pesos y concentrando el resto en 5, 6 u 8 bits con tamano de grupo 64. Esa mezcla explica que el promedio efectivo (6,911 bits) sea superior al de una cuantizacion 4-bit convencional de MLX.

## Capacidades

- Generacion de texto autoregresiva en el decodificador de lenguaje (0,752B parametros).
- Comprension de imagenes: la torre de vision de 0,101B parametros habilita entrada multimodal (descripcion de imagenes, preguntas sobre contenido visual); el alcance exacto de la capacidad no esta documentado.
- Prediccion multi-token mediante la cabeza MTP, utilizable como soporte de decodificacion especulativa.
- Ejecucion nativa en Apple Silicon a traves de la libreria MLX.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (idiomas no declarados en el repo).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Modelo borrador en decodificacion especulativa: con 0,873B parametros y una cabeza MTP dedicada, puede actuar como draft model sobre un modelo mayor en el mismo equipo, generando candidatos de varios tokens que el modelo verificador valida en paralelo. Su huella de 0,7 GiB permite mantenerlo residente junto al modelo principal sin presion de memoria.
- Inferencia local en portatiles Apple Silicon: el checkpoint completo cabe en 0,703 GiB, de modo que un Mac con 8 GB de memoria unificada puede ejecutarlo junto al sistema operativo y otras aplicaciones, algo inviable con el modelo en BF16.
- Descripcion y filtrado de imagenes en local: la torre de vision permite clasificar o etiquetar capturas y fotografias sin enviar los ficheros a un servicio externo, lo que resulta util en flujos con datos sensibles o sin conectividad.
- Prototipado de aplicaciones antes de escalar: sirve para validar prompts, esquemas de herramientas y plantillas de chat contra la familia Qwen3.5 en un equipo de desarrollo, para despues migrar a un checkpoint mayor sin cambiar la interfaz.
- Investigacion sobre cuantizacion de precision mixta: la distribucion por tensor (5/6/8 bits y BF16) y el promedio de 6,911 bits/peso lo convierten en un caso de estudio para medir la degradacion de calidad frente al modelo en BF16 en tareas cortas.
- Generacion de texto subsidiaria de bajo coste: resumenes de una linea, normalizacion de campos, reescritura de titulares o clasificacion de intenciones en un pipeline por lotes, donde el coste por token y el consumo energetico importan mas que la profundidad de razonamiento.
- Educacion y demostraciones: al ocupar menos de 1 GB y ejecutarse en local, permite explicar en un aula el funcionamiento de un transformer multimodal con cuantizacion sin depender de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica de calidad, ni comparaciones con el checkpoint en BF16 que permitan estimar la perdida introducida por la cuantizacion mixta.

## Requisitos de hardware

- VRAM / memoria unificada: los pesos ocupan 0,703 GiB. Sumando cache KV y buffers de ejecucion, una estimacion razonable es 1,5-2,5 GB de memoria total para contextos cortos y moderados; el dato exacto no esta disponible.
- Cabe en GPU de consumo: si, en cualquier Apple Silicon con 8 GB o mas de memoria unificada. Al estar en formato MLX, no esta pensado para GPU NVIDIA ni AMD; para esas plataformas habria que reconvertir los pesos.
- GPU de datacenter (A100, H100): tecnicamente irrelevantes para este checkpoint por su tamano; no se han publicado mediciones en esas plataformas.
- Opciones de despliegue: MLX (`mlx-lm`, `mlx-vlm` para la parte multimodal) y oMLX, que es la herramienta con la que se genero el checkpoint. No hay version GGUF, por lo que llama.cpp y Ollama requeririan una conversion previa. vLLM y TGI no soportan pesos MLX de forma nativa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No hay datos publicados de benchmarks para este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales y de almacenamiento. Las cifras de las filas 2 y 3 son estimaciones derivadas de los datos del propio repo (0,873B parametros), no mediciones publicadas.

| Modelo | Parametros | Almacenamiento | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-oQ5e-mtp (este) | 0,873B | 0,703 GiB, 6,911 bits/peso promedio | No disponible | No disponible | Precision mixta 5/6/8-bit + BF16; vision y cabeza MTP incluidas |
| Qwen3.5-0.8B en BF16 (modelo base) | 0,873B | ~1,75 GB (estimado: 2 bytes por parametro) | No disponible | No disponible | Referencia de calidad maxima; sin perdida por cuantizacion |
| Cuantizacion MLX uniforme de 4 bits (estimacion) | 0,873B | ~0,49 GB (estimado a ~4,5 bits/peso) | No disponible | No disponible | Menor huella y presumiblemente mayor degradacion; no verificable sin evaluaciones |

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks ni comparacion con el checkpoint en BF16, de modo que la perdida de calidad introducida por la cuantizacion mixta es desconocida.
- Licencia no declarada: el repo no especifica licencia, por lo que no se puede confirmar que el uso comercial sea licito. Es imprescindible verificar la licencia del modelo base Qwen3.5-0.8B antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce que cobertura linguistica real tiene el checkpoint, incluido el castellano.
- Capacidad de razonamiento limitada por tamano: con 0,752B parametros en el decodificador, es esperable un rendimiento bajo en tareas de razonamiento multi-paso, matematicas y generacion de codigo no trivial; no hay datos que lo cuantifiquen.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, agravado por la falta de documentacion sobre fases de alineacion.
- Compatibilidad restringida: el formato MLX limita el uso a Apple Silicon; no hay GGUF ni safetensors en formato transformers estandar.
- Cabeza MTP sin validar: no se documenta como activarla ni que ganancia de velocidad aporta en la practica.
- Trazabilidad y mantenimiento: el repo tiene 9 descargas, 0 likes y fue creado y actualizado en el mismo minuto (2026-10-20), lo que sugiere una publicacion automatizada sin soporte posterior.
- Sin garantias de production-readiness: no hay informacion sobre estabilidad, manejo de contextos largos ni comportamiento con entradas multimodales fuera de distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/Qwen3.5-0.8B-oQ5e-mtp
- Herramienta de cuantizacion oQ (oMLX), referenciada en la model card: https://github.com/jundot/omlx
- Modelo base Qwen3.5-0.8B: no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
