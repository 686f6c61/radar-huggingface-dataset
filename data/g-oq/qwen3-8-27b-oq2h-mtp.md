# g-oQ/Qwen3.8-27B-oQ2h-mtp

## Resumen
Qwen3.8-27B-oQ2h-mtp es una cuantizacion mixta del modelo base Qwen/Qwen3.8-27B, publicada por el usuario g-oQ mediante la herramienta oQ (oMLX v0.8.2). El checkpoint resultante almacena 5.724.930.800 parametros logicos en 11,8 GB de repositorio, con un promedio efectivo de 16,535 bits por peso. La nomenclatura "oQ2h" hace referencia a la configuracion de cuantizacion mixta empleada, y el sufijo "mtp" indica la presencia de una cabeza de prediccion multi-token (multi-token prediction) empaquetada junto al modelo.

El interes de esta publicacion es acotado pero especifico: se trata de un artefacto en formato MLX, pensado para ejecucion en hardware Apple Silicon, que combina capas cuantizadas a 3, 4 y 5 bits con tensores en BF16 y U32. La model card no documenta el modelo base mas alla de su identificacion, ni declara licencia, idiomas o pipeline. El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que sugiere una publicacion reciente y sin validacion comunitaria.

La relevancia practica depende enteramente del modelo base Qwen/Qwen3.8-27B, cuyas caracteristicas (contexto, licencia, capacidades) no se detallan en la informacion disponible. Cualquier evaluacion de produccion deberia remitirse a la model card del modelo original antes de adoptar esta cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` sugiere familia Qwen3, sin detalle en la informacion proporcionada) |
| Parametros totales | 5.724.930.800 (pesos logicos del checkpoint cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 3-bit grupo 64, affine 4-bit grupo 64, affine 5-bit grupo 64, BF16 y U32; promedio efectivo 16,535 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `mlx`) |

Desglose de almacenamiento por componente segun la model card:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,840B | 10,597 GB / 9,869 GiB |
| Vision | 0,461B | 0,921 GB / 0,858 GiB |
| Cabeza MTP | 0,425B | 0,314 GB / 0,293 GiB |
| Total | 5,725B | 11,833 GB / 11,020 GiB |

Distribucion por formato de almacenamiento:

| Formato | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 1,271B | 22,208% | 0,518 GiB | 3,50 |
| Affine 4-bit, grupo 64 | 0,372B | 6,502% | 0,195 GiB | 4,50 |
| Affine 5-bit, grupo 64 | 1,271B | 22,208% | 0,814 GiB | 5,50 |
| BF16 | 0,523B | 9,138% | 0,974 GiB | 16,00 |
| U32 | 2,287B | 39,944% | 8,519 GiB | 32,00 |

## Arquitectura y entrenamiento
La informacion disponible no describe la arquitectura del modelo base Qwen/Qwen3.8-27B: no se especifica si es un transformer denso, un MoE o un modelo hibrido, ni se detallan los datos de entrenamiento, el numero de tokens, la composicion del corpus o las tecnicas de alineacion (RLHF, DPO). El tag `qwen3_5` en Hugging Face sugiere pertenencia a la familia Qwen3, pero no se aporta ninguna confirmacion adicional.

Lo que si documenta la model card es el proceso de cuantizacion. Se aplico oQ (oMLX v0.8.2) con precision mixta: un 22,208% de los pesos logicos se almacena a 3 bits (grupo 64), otro 22,208% a 5 bits, un 6,502% a 4 bits, un 9,138% en BF16 y un 39,944% en U32. Esta distribucion implica que la mayor parte del almacenamiento (8,519 GiB de 11,020 GiB) corresponde a tensores U32, probablemente escalas y parametros auxiliares de la cuantizacion, mientras que los pesos propiamente dichos ocupan una fraccion menor. El checkpoint incluye ademas una cabeza MTP de 0,425B de pesos logicos (0,293 GiB), lo que sugiere soporte para decodificacion especulativa o prediccion multi-token, aunque no se detalla su funcionamiento ni su integracion en el runtime.

## Capacidades
- Generacion de texto: el checkpoint contiene un modelo de lenguaje de 4,840B pesos logicos, por lo que se espera capacidad de generacion, aunque no se documentan tareas concretas.
- Vision: incluye un modulo de vision de 0,461B pesos logicos (0,858 GiB), lo que indica soporte multimodal de entrada de imagen, sin detalle sobre resolucion, formato o tareas soportadas.
- Prediccion multi-token: la cabeza MTP de 0,425B pesos logicos sugiere capacidad de decodificacion especulativa o generacion paralela de tokens, sin documentacion adicional.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Otras capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso
- Inferencia local en Apple Silicon: el formato MLX y el tamano de 11,8 GB permiten cargar el checkpoint en equipos con memoria unificada de 16 GB o superior, lo que habilita prototipado y experimentacion en portatiles y estaciones Mac sin GPU dedicada.
- Evaluacion de cuantizacion mixta: investigadores que estudien el impacto de esquemas de precision mixta (3/4/5 bits con grupos de 64) pueden usar este checkpoint como referencia comparativa frente a cuantizaciones uniformes del mismo modelo base.
- Pruebas de decodificacion especulativa: la presencia de la cabeza MTP permite experimentar con tecnicas de prediccion multi-token en el runtime MLX, midiendo aceleracion y tasa de aceptacion frente a decodificacion autoregresiva estandar.
- Desarrollo de aplicaciones multimodales en local: el modulo de vision incluido posibilita prototipos de descripcion de imagenes, extraccion de informacion visual o respuesta a preguntas sobre documentos escaneados, siempre que se valide la calidad frente al modelo base sin cuantizar.
- Despliegue en entornos con restricciones de memoria: el checkpoint ocupa menos de 12 GB, lo que lo hace adecuado para entornos donde no es viable cargar el modelo original en BF16.
- Reproduccion y auditoria de artefactos oQ: dado que la model card publica el desglose completo de bits por componente, el checkpoint sirve como caso de estudio reproducible para verificar la implementacion de oMLX v0.8.2.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/memoria unificada estimada: 11,8 GB para los pesos; se recomienda un minimo de 16 GB de memoria unificada para dejar margen a la cache KV y al contexto.
- GPU recomendadas: hardware Apple Silicon con soporte MLX (series M1, M2, M3, M4 y posteriores). No se documenta compatibilidad con CUDA ni con GPU NVIDIA.
- Cabe en GPU consumer: si, en equipos Apple con 16 GB o mas de memoria unificada; no se dispone de informacion sobre GPUs consumer NVIDIA.
- Opciones de despliegue: runtime MLX (libreria `mlx`), oMLX y herramientas compatibles con safetensors MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ2h-mtp | 5,725B (logicos cuantizados) | no disponible | safetensors MLX | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (referenciado como base) |
| Otras cuantizaciones oQ del mismo base | no disponible | no disponible | safetensors MLX | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria en parametros, contexto o rendimiento.

## Limitaciones y advertencias
- La cuantizacion mixta a 3, 4 y 5 bits puede degradar la calidad respecto al modelo base en tareas sensibles a precision numerica, como matematicas, codigo o razonamiento de varios pasos.
- El 39,944% de los pesos logicos se almacena en U32 (8,519 GiB), lo que reduce el ahorro efectivo de memoria frente a lo que sugiere la etiqueta "2-bit" del repositorio.
- No se declara licencia en la informacion disponible, por lo que el uso comercial no puede verificarse; debe consultarse la licencia del modelo base Qwen/Qwen3.8-27B.
- No se documentan idiomas soportados ni sesgos conocidos.
- El repositorio registra cero descargas y cero likes, sin validacion externa ni resultados de benchmarks publicados.
- La compatibilidad esta limitada al ecosistema MLX y a hardware Apple Silicon; no se documenta soporte para CUDA, ROCm ni otras plataformas.
- La cabeza MTP no esta documentada en cuanto a su uso en runtime, por lo que su aprovechamiento practico no esta garantizado.
- Riesgo de alucinacion y fidelidad factual: no evaluado en la informacion proporcionada.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/g-oQ/Qwen3.8-27B-oQ2h-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
