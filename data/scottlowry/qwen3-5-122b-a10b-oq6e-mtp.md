# scottlowry/Qwen3.5-122B-A10B-oQ6e-mtp

## Resumen

Qwen3.5-122B-A10B-oQ6e-mtp es una cuantizacion de 6 bits del modelo Qwen3.5-122B-A10B, publicada por el usuario scottlowry en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una version comprimida de un modelo MoE (mezcla de expertos) de la familia Qwen 3.5, generada con la herramienta oQ (oMLX v0.7.1.dev1), un esquema de cuantizacion de precision mixta desarrollado por jundot. La relevancia practica de esta ficha es acotada: se trata de un artefacto de cuantizacion con 2 descargas y 0 likes en el momento de la consulta, orientado a ejecucion local en hardware Apple Silicon mediante la libreria MLX.

El repositorio ocupa 103,0 GB e incluye pesos en formato MLX safetensors. El recuento real de parametros segun los ficheros safetensors es de 125.086.497.008 (~125,09 mil millones), ligeramente por encima de los 122 mil millones que sugiere el nombre del repositorio. El sufijo "A10B" del nombre apunta a unos 10 mil millones de parametros activos por token, coherente con una arquitectura MoE, aunque este dato no aparece confirmado en la model card.

La informacion publicada por el autor es minima: no incluye licencia, idiomas soportados, longitud de contexto, composicion del dataset ni resultados de benchmarks. Cualquier dato de ese tipo debe consultarse en la ficha del modelo base original, no en esta cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), tipo de modelo declarado en los tags: `qwen3_5_moe`; numero de expertos y detalles de enrutamiento no disponibles |
| Parametros totales | 125.086.497.008 (~125,09 B) segun los ficheros safetensors; el nombre del repositorio indica 122 B |
| Parametros activos | No confirmado en la documentacion; el nombre del repositorio indica "A10B" (~10 B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 6 bits, group size 64, cuantizacion de precision mixta con oQ (oMLX v0.7.1.dev1) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio |
| Formato de pesos | MLX safetensors (`library_name: mlx`) |
| Tamano del repositorio | 103,0 GB |
| Fecha de publicacion | 2026-10-11 (pesos actualizados el 2026-10-12) |

## Arquitectura y entrenamiento

El modelo base es de tipo `qwen3_5_moe`, es decir, un transformer con capas de mezcla de expertos, tal como declara el tag de tipo de modelo. Al tratarse de una cuantizacion, no ha habido entrenamiento adicional: el autor solo aplica compresion de pesos sobre un modelo ya entrenado. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por fases de RLHF, DPO o aprendizaje por refuerzo con verificación.

La innovacion tecnica de este repositorio es exclusivamente el esquema de cuantizacion. Se ha usado oQ, la herramienta de cuantizacion de precision mixta del proyecto oMLX (en su version v0.7.1.dev1), con 6 bits por peso y un group size de 64. La cuantizacion de precision mixta permite asignar un numero distinto de bits a distintas capas o tensores segun su sensibilidad, en lugar de aplicar una tasa uniforme. El autor advierte de que esta version de los pesos se subio el 2026-10-11 y reemplaza a una version anterior, por lo que las descargas previas a esa fecha deben repetirse. El sufijo "mtp" del nombre del repositorio no esta explicado en la model card; no disponible su significado.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen3.5-122B-A10B, no verificada en esta cuantizacion.
- Razonamiento y matematicas: no disponible en la informacion proporcionada.
- Generacion de codigo: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; los idiomas soportados no se declaran en el repositorio.
- Capacidades multimodales (vision, audio): no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Ejecucion local en Apple Silicon mediante MLX: es la unica capacidad verificable por las etiquetas del repositorio.

## Casos de uso

- Inferencia local en Apple Silicon de un modelo MoE de gran tamano: el caso de uso principal y practicamente unico documentado. Se cargaria con MLX en un Mac con memoria unificada suficiente para alojar los ~103 GB de pesos, evitando depender de GPUs con VRAM dedicada.
- Laboratorio de investigacion en cuantizacion: sirve como punto de comparacion para medir la perdida de calidad de un esquema de 6 bits con group size 64 frente a los pesos originales en bf16 o frente a cuantizaciones de 4 bits y 8 bits.
- Evaluacion de la herramienta oQ: permite reproducir el pipeline de cuantizacion de precision mixta de oMLX sobre un MoE grande y validar su comportamiento.
- Despliegue privado sin conexion: al ejecutarse en local, evita enviar datos a APIs externas, lo que resulta util en entornos con requisitos de confidencialidad.
- Prototipado de asistentes de texto de contexto largo: solo si se confirma la ventana de contexto del modelo base y el hardware puede sostener el coste de KV cache correspondiente.
- Pruebas comparativas de rendimiento en MoE con parametros activos reducidos: el modelo permite estudiar la relacion entre parametros totales, parametros activos y latencia real en hardware unificado.

En todos estos casos conviene tener en cuenta que la model card no documenta capacidades, por lo que cualquier uso en produccion exige una evaluacion previa propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio solo describe los parametros de cuantizacion (6 bits, group size 64, formato MLX safetensors) y no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni metricas similares. Tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- Los pesos ocupan 103,0 GB en disco, lo que implica una necesidad de memoria unificada en el mismo orden de magnitud, mas el espacio adicional para la KV cache y los buffers de computo.
- Estimacion de memoria en ejecucion: aproximadamente 103-120 GB de memoria unificada, dependiendo de la longitud de contexto y del tamano de lote. Cifra estimada a partir del tamano del repositorio, no confirmada por el autor.
- Hardware compatible: equipos Apple Silicon con memoria unificada suficiente, como Mac Studio o Mac Pro con configuraciones de 128 GB, 192 GB, 256 GB o 512 GB. La libreria declarada es MLX, que no se ejecuta en GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: no. Ninguna GPU de consumo actual dispone de 103 GB de VRAM. Ademas, MLX no ofrece backend CUDA, por lo que no es desplegable en una RTX 4090 ni en un conjunto de ellas sin conversion previa de formato.
- GPUs de centro de datos (A100 80 GB, H100 80 GB): no son un objetivo de este repositorio por la incompatibilidad con MLX; seria necesario reconvertir los pesos a otro formato, operacion no documentada.
- Opciones de despliegue: mlx-lm y el ecosistema MLX son las vias previstas. vLLM, llama.cpp, Ollama y TGI no soportan pesos MLX safetensors de forma nativa, salvo conversion previa no documentada en este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-oQ6e-mtp (este) | 125,09 B (activos no confirmados, ~10 B segun el nombre) | No disponible | MLX safetensors, 6 bits, group size 64 | No disponible | HuggingFace, 2 descargas, 0 likes |
| Qwen3.5-122B-A10B (modelo base) | No disponible | No disponible | No disponible | No disponible | No confirmada su existencia publica en la informacion proporcionada |
| Otras cuantizaciones de la misma familia Qwen 3.5 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Alternativas de la misma categoria (MoE de gran tamano en MLX) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion verificable sobre modelos comparables en el material proporcionado, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no declara licencia. Esto impide determinar si el uso comercial esta permitido; hay que consultar la licencia del modelo base Qwen3.5-122B-A10B antes de cualquier uso en produccion.
- La cuantizacion a 6 bits introduce perdida de precision respecto a los pesos originales. El autor no publica ninguna evaluacion de degradacion de calidad, por lo que el impacto real sobre el rendimiento es desconocido.
- No se documentan sesgos del modelo base ni de la cuantizacion. Al ser una compresion de un modelo ya existente, hereda los sesgos del original, que no se detallan.
- Riesgo de alucinacion: no evaluado en esta cuantizacion. Se desconoce si la compresion agrava este comportamiento.
- Ausencia total de datos de benchmarks: no hay evidencia publicada de que esta cuantizacion mantenga las capacidades del modelo base.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Longitud de contexto no declarada: no se puede planificar un despliegue con requisitos de contexto largo sin consultar la ficha del modelo base.
- Aviso de reemplazo de pesos: el autor indica que la version subida el 2026-10-11 sustituye a una anterior y que las descargas previas deben repetirse. Cualquier copia descargada antes de esa fecha puede estar desactualizada.
- Dependencia de plataforma: los pesos en formato MLX solo se ejecutan en Apple Silicon. No hay soporte CUDA ni ROCm documentado, lo que limita su uso en clusters convencionales.
- Madurez del repositorio: 2 descargas y 0 likes, con una unica fuente (un usuario individual, no el equipo de Qwen). No hay validacion de la comunidad ni issues documentados.
- La busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado por completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scottlowry/Qwen3.5-122B-A10B-oQ6e-mtp
- Herramienta de cuantizacion oQ (oMLX), citada en la model card: https://github.com/jundot/omlx
- Documentacion de MLX (framework declarado por el repositorio): https://github.com/ml-explore/mlx
- Ficha del modelo base Qwen3.5-122B-A10B: no disponible en la informacion proporcionada
- Paper, blog o demo del autor: no disponible
- Resultados de la busqueda web: ninguno relevante para este modelo
