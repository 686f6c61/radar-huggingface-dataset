# minjaechoi/qwen36-35b-a3b-1p80bit-r10

## Resumen

El modelo `minjaechoi/qwen36-35b-a3b-1p80bit-r10` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, publicado por el usuario minjaechoi en HuggingFace el 17 de septiembre de 2026. Su particularidad es que aplica una cuantización agresiva a los expertos enrutados de la arquitectura Mixture-of-Experts (MoE) del modelo base: estos pesos promedian 1,80 bits, mientras que el resto de la red permanece en BF16. Se trata, por tanto, de un experimento de compresión extrema sobre las capas que concentran la mayor parte de los parámetros en un MoE, no de un modelo afinado para una tarea concreta ni de una versión lista para producción.

El repositorio contiene 35.107.181.936 parámetros (unos 35,1 mil millones) almacenados en safetensors, con un tamaño total de 70,2 GB. Ese volumen coincide con el esperado para 35,1 B de parámetros en BF16, lo que confirma lo que indica la propia model card: los pesos se distribuyen ya desquantizados en tensores BF16 y se cargan con `transformers` o vLLM estándar, sin necesidad de kernels personalizados. La etiqueta `qwen3_5_moe` identifica la arquitectura como MoE, y la nomenclatura "A3B" del modelo base apunta a unos 3.000 millones de parámetros activos por token, aunque el dato no se confirma en la información disponible.

La relevancia de este checkpoint es fundamentalmente metodológica: explora hasta qué punto se pueden comprimir los expertos enrutados de un MoE de 35 B sin salir del ecosistema estándar de transformers. Ahora bien, al no publicarse benchmarks, ni licencia explícita, ni longitud de contexto, ni idiomas soportados, y al contar con cero descargas y cero valoraciones, debe tratarse como material de investigación sin validación externa. La búsqueda web realizada no ha devuelto ninguna fuente relevante sobre este modelo (los resultados obtenidos eran páginas de legislación alemana, sin relación alguna).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe`); no se especifica el numero de expertos totales ni de expertos activos por token |
| Parametros totales | 35.107.181.936 (~35,1 B), segun los safetensors del repositorio |
| Parametros activos | no disponible (la nomenclatura "A3B" del modelo base sugiere ~3 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 1,80 bits de media (checkpoint interno "r10"); resto de pesos en BF16. Los pesos se distribuyen ya desquantizados en tensores BF16; no se publican variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el autor indica que la licencia sigue la del modelo base (`Qwen/Qwen3.6-35B-A3B`) |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 70,2 GB |
| Libreria y pipeline | transformers; text-generation |
| Modalidad declarada | image-text-to-text (etiqueta del repositorio) y text-generation |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base `Qwen/Qwen3.6-35B-A3B`, un transformer con capas de mezcla de expertos (MoE) en las que solo se activa una fracción de los parametros por token. La intervencion del autor se limita a los expertos enrutados: segun la model card, esos pesos promedian 1,80 bits, una tasa de compresion muy por debajo de los 4 bits habituales en cuantizaciones de produccion, mientras que el resto de los componentes de la red (atencion, embeddings, normalizaciones, router) se mantiene en BF16. La model card no detalla el esquema de cuantizacion empleado (vectorial, escalar por bloques, codebooks), ni el tamano de bloque, ni el error de reconstruccion introducido.

No se especifica ningun proceso de entrenamiento o ajuste adicional: no hay datos sobre numero de tokens de entrenamiento, composicion del dataset, RLHF, DPO ni ninguna otra fase de alineamiento. Tampoco se documenta ninguna innovacion en decodificacion (decodificacion especulativa, atencion lineal, etc.). El detalle tecnico mas relevante es de despliegue: los pesos se guardan desquantizados en BF16, de modo que el checkpoint se carga con `transformers` y vLLM sin kernels a medida, pero tambien implica que el ahorro de memoria de la cuantizacion no se materializa en el almacenamiento ni, presumiblemente, en la VRAM ocupada durante la inferencia (los 70,2 GB del repositorio son coherentes con 35,1 B de parametros en BF16).

## Capacidades

- Generacion de texto y conversacion: las etiquetas del repositorio incluyen `text-generation` y `conversational`, por lo que se espera soporte de dialogos multi-turno, aunque no hay evaluaciones publicadas que lo confirmen.
- Procesamiento de imagen y texto: la etiqueta `image-text-to-text` sugiere capacidades multimodales heredadas del modelo base, no verificadas en la informacion disponible.
- Razonamiento y matematicas: no disponible; no se publican evaluaciones ni descripcion de capacidades de razonamiento.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo de pensamiento (thinking) o cualquier capacidad especial: no disponible.
- Carga en el ecosistema estandar: compatible con `transformers` y con la etiqueta `endpoints_compatible` de HuggingFace, lo que facilita su despliegue en Inference Endpoints.

## Casos de uso

- Investigacion sobre cuantizacion extrema de MoE: el checkpoint permite estudiar como se degrada la calidad de un MoE de 35 B cuando sus expertos enrutados se comprimen a 1,80 bits de media, comparando contra el modelo base en BF16 con el mismo prompt set.
- Analisis de la relacion entre bits asignados y calidad por capa: al mantener todo lo que no son expertos en BF16, sirve para aislar el impacto de la cuantizacion exclusivamente en los expertos enrutados.
- Reproduccion de experimentos internos: el identificador "r10" indica una serie de pruebas; el repositorio permite a otros grupos reproducir y comparar esa iteracion concreta.
- Generacion de datos sinteticos para destilacion: si la calidad resulta aceptable en tareas concretas, puede emplearse como generador de etiquetas a bajo coste relativo para entrenar modelos mas pequenos, siempre con validacion manual.
- Pruebas de infraestructura de despliegue: al cargar sin kernels personalizados en `transformers` y vLLM, es util para medir tiempos de carga, memoria pico y throughput de un MoE de 35 B en hardware concreto.
- Evaluacion comparativa de routers y politicas de enrutamiento: con los expertos degradados, el comportamiento del router (distribucion de carga, expertos muertos) puede estudiarse en condiciones de pesos poco precisos.
- Docencia y formacion tecnica: como ejemplo practico de cuantizacion de MoE y de sus limites, en cursos o talleres sobre eficiencia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (35,1 B) y del formato de pesos declarado (BF16), no datos medidos por el autor.

- VRAM para inferencia en BF16: en torno a 70 GB solo para los pesos, mas la cache KV, cuyo tamano depende de la longitud de contexto y de la configuracion de atencion (ambas no disponibles). En la practica, se necesita al menos una GPU de 80 GB o un reparto multi-GPU.
- GPU recomendadas: H100 80 GB, A100 80 GB o similares para ejecucion en BF16 en una sola tarjeta; configuraciones multi-GPU (por ejemplo 2 x 48 GB) para GPUs de menor memoria, siempre que la arquitectura MoE permita el reparto.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) en BF16. Solo seria viable en consumer con una cuantizacion adicional a 4 bits o inferior que no esta publicada en el repositorio.
- Opciones de despliegue: `transformers` (indicado por el autor) y vLLM, dado que los pesos se cargan en BF16 sin kernels a medida. No hay artefactos GGUF, por lo que llama.cpp, Ollama y LM Studio no son aplicables sin conversion previa.
- Inference Endpoints: la etiqueta `endpoints_compatible` indica compatibilidad con el servicio gestionado de HuggingFace, aunque el tamano del checkpoint puede requerir hardware de gama alta.
- Latencia y throughput: no disponible. Al tratarse de un MoE, la latencia estara dominada por el ancho de banda de memoria (lectura de expertos activos), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `minjaechoi/qwen36-35b-a3b-1p80bit-r10` | 35,1 B | no disponible (~3 B segun nomenclatura, sin confirmar) | no disponible | safetensors BF16 (expertos cuantizados a 1,80 bits de media) | no disponible (hereda la del base) | Publico, 0 descargas |
| `Qwen/Qwen3.6-35B-A3B` (modelo base) | 35,1 B (segun el checkpoint derivado) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Publico |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de terceros en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con otros MoE de tamano similar.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ningun resultado publicado (MMLU, HumanEval, GSM8K ni equivalentes), por lo que se desconoce la magnitud de la degradacion causada por los 1,80 bits en los expertos.
- Cuantizacion extrema sin analisis de error: 1,80 bits por peso en los expertos enrutados es una tasa muy agresiva; es esperable perdida de calidad, pero el autor no documenta el error de reconstruccion ni la metodologia.
- Sin ahorro de memoria en el almacenamiento: los pesos se guardan desquantizados en BF16 (70,2 GB), de modo que el beneficio de la compresion no se traduce en un repositorio mas pequeno ni, previsiblemente, en menos VRAM en inferencia.
- Licencia indeterminada: la model card remite a la licencia del modelo base, pero esta no se especifica. Antes de cualquier uso comercial hay que consultar la licencia de `Qwen/Qwen3.6-35B-A3B`.
- Idiomas no declarados: no se indica que lenguas soporta ni como se comporta en castellano.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Capacidades multimodales sin verificar: la etiqueta `image-text-to-text` sugiere vision, pero no hay confirmacion en la model card ni ejemplos de uso.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; con pesos degradados por cuantizacion, puede aumentar. Requiere validacion en cualquier uso real.
- Sin validacion de la comunidad: cero descargas y cero valoraciones en el momento de redactar esta ficha, sin issues ni discusiones publicas.
- Checkpoint de investigacion interna: el propio autor lo etiqueta como "internal research checkpoint", por lo que no esta pensado para produccion ni soportado.
- Sesgos: no disponibles; no se ha publicado ninguna evaluacion de sesgo o seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-1p80bit-r10
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no devolvio ninguna fuente relacionada con este modelo; los resultados obtenidos correspondian a paginas de legislacion alemana, sin conexion con el contenido de esta ficha.
