# kylar/Swift-Qwen3.8-27B-Uncensored-MTP-mlx-8Bit

## Resumen

El modelo `kylar/Swift-Qwen3.8-27B-Uncensored-MTP-mlx-8Bit` es una conversion al formato MLX, en cuantizacion de 8 bits, del modelo `ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP`. Lo publica el usuario kylar en HuggingFace reutilizando el flujo de trabajo del space `mlx-community/mlx-my-repo`, con `mlx-lm` version 0.31.2 como herramienta de conversion. El resultado es un artefacto pensado para inferencia local en Apple Silicon (chips de la serie M), no para servidores CUDA convencionales.

Se trata de un modelo de ~26,9 mil millones de parametros (26.895.993.856 segun los pesos en safetensors), con pipeline declarado `image-text-to-text`, lo que indica capacidad multimodal de entrada de imagen y texto. Las etiquetas del repositorio (`abliterated`, `uncensored`) senalan que la variante de origen ha sido sometida a un proceso de abliteracion, es decir, la eliminacion o supresion de las direcciones de activacion asociadas al rechazo de peticiones, con el objetivo de reducir las negativas del modelo ante determinados temas. La etiqueta `mtp` apunta a la incorporacion de multi-token prediction en el modelo base, una tecnica que permite predecir varios tokens por paso para acelerar la decodificacion.

La relevancia de esta ficha es acotada y conviene ser explicito: el repositorio no incluye informacion sobre datos de entrenamiento, contexto maximo, idiomas soportados ni resultados de evaluacion. Ademas, la licencia es `swift-open-license-1.0` (campo `license: other`), cuyo texto no se reproduce en la informacion disponible. Cualquier decision de uso en produccion exige consultar el enlace de licencia y la model card original antes de desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas `qwen3_8` y `qwen3_5`; sin confirmacion de si es transformer denso, MoE o hibrida) |
| Parametros totales | 26.895.993.856 (~26,9 B) segun pesos safetensors |
| Parametros activos | no aplica / no disponible (no hay evidencia de arquitectura MoE en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); no se documentan otras variantes en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (campo `license: other`) |
| Formato de pesos | safetensors en formato MLX; repositorio de 28,6 GB |
| Tipo de pipeline | image-text-to-text (entrada multimodal imagen + texto) |
| Modelo base | ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP |
| Herramienta de conversion | mlx-lm 0.31.2 |
| Fecha de publicacion | 17 de septiembre de 2026 (metadatos del repositorio) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo. Los metadatos lo etiquetan con `qwen3_8` y `qwen3_5`, lo que sugiere que deriva de la familia Qwen, y con `mtp`, que apunta a multi-token prediction como mecanismo de decodificacion. La cifra de parametros (26,9 B) y el pipeline `image-text-to-text` indican un modelo multimodal de gran tamano, pero no se especifica el numero de capas, la dimension oculta, el tipo de atencion ni el tokenizador empleado. Tampoco se documenta si la atencion es completa, lineal o hibrida.

Respecto al entrenamiento, no hay datos disponibles: ni numero de tokens, ni composicion del dataset, ni si hubo fases de RLHF, DPO o similares. Lo unico verificable es el proceso de post-procesado de la variante de origen: las etiquetas `abliterated` y `uncensored` implican una intervencion sobre los pesos o las activaciones para reducir la tendencia del modelo a rechazar peticiones. Este tipo de intervencion suele realizarse mediante tecnicas de abliteration que restan direcciones de rechazo en el espacio de activaciones, y puede afectar a la coherencia y al alineamiento del modelo. Esta conversion concreta en MLX no introduce entrenamiento adicional: es una transformacion de formato y cuantizacion a 8 bits.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla de chat aplicable mediante `tokenizer.apply_chat_template`.
- Procesamiento de entrada multimodal (imagen y texto), segun el pipeline `image-text-to-text` declarado. No se detalla el alcance real de la comprension de imagen.
- Decodificacion con multi-token prediction, segun la etiqueta `mtp` del modelo base; se espera una mejora del throughput frente a la decodificacion token a token, aunque no hay cifras publicadas.
- Comportamiento sin rechazo ante peticiones que otros modelos alineados rechazarian, derivado de la abliteracion declarada por el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Modo de razonamiento explicito (thinking mode), audio u otras modalidades: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y la cuantizacion a 8 bits permiten ejecutar un modelo de ~27 B en equipos con memoria unificada suficiente, usando `mlx-lm` como runtime y sin depender de GPU NVIDIA.
- Experimentacion con modelos sin censura en investigacion sobre alineamiento: el modelo sirve como referencia para estudiar como la abliteracion modifica el comportamiento de rechazo, comparando sus respuestas con las del modelo base no abliterado.
- Prototipado de asistentes conversacionales en escritorio: la integracion con `mlx-lm` permite levantar un chat local en pocas lineas de Python, util para demos y pruebas de concepto internas.
- Evaluacion de cuantizacion a 8 bits frente a precision completa: al ser una conversion de un modelo existente, permite medir la degradacion de calidad introducida por la cuantizacion MLX en tareas concretas del equipo.
- Procesamiento de documentos con componente visual: el pipeline `image-text-to-text` habilita experimentar con entradas que combinan imagen y texto, como capturas o diagramas acompanados de preguntas, siempre que se valide antes la calidad real de la comprension visual.
- Flujos de generacion de contenido creativo sin filtros editoriales automaticos: util en entornos controlados donde el equipo asume la revision humana del contenido generado.
- Investigacion sobre decodificacion especulativa y multi-token prediction: la etiqueta `mtp` lo convierte en un candidato para medir ganancias de latencia en runtimes que implementen esa tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos: el repositorio ocupa 28,6 GB y los pesos suman ~26,9 B de parametros en 8 bits, es decir, del orden de 27 GB en disco y en memoria.
- VRAM estimada para inferencia: aproximadamente 28-30 GB solo para pesos, mas el cache KV y activaciones; en la practica se recomienda reservar 32-36 GB de memoria disponible. Estimacion propia a partir del tamano de los pesos, no confirmada por el autor.
- GPU NVIDIA: cabe con holgura en A100 40 GB y H100 80 GB; tambien en tarjetas profesionales de 48 GB (por ejemplo, RTX 6000 Ada). No cabe en RTX 4090 (24 GB) en 8 bits.
- GPU de consumo: no cabe en 24 GB a 8 bits. Para usar una RTX 4090 o similar habria que recurrir a cuantizaciones de 4 bits, que este repositorio no ofrece.
- Apple Silicon: es el destino natural del artefacto, al estar en formato MLX. Requiere un Mac con memoria unificada de al menos 32 GB, y se recomienda 36-64 GB para dejar margen al cache KV y al sistema.
- Opciones de despliegue: `mlx-lm` (version 0.31.2 o compatible) es la ruta documentada en la model card. vLLM, TGI, llama.cpp u Ollama no estan documentados para este repositorio; su uso exigiria conversion adicional y no esta garantizado.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones completas de terceros, por lo que no es posible establecer una comparativa rigurosa. La unica comparacion documentada es con su modelo de origen.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kylar/Swift-Qwen3.8-27B-Uncensored-MTP-mlx-8Bit | 26,9 B | no disponible | swift-open-license-1.0 | safetensors MLX, 8 bits | Conversion MLX para Apple Silicon |
| ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva esta conversion |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables |

## Limitaciones y advertencias

- La abliteracion puede degradar la coherencia, aumentar la repeticion y reducir la calidad del razonamiento en tareas complejas; no hay evaluaciones publicadas que cuantifiquen ese efecto.
- Riesgo de alucinacion: no se dispone de mediciones de fidelidad factual ni de tasas de alucinacion. Un modelo sin rechazo no es mas veraz, solo mas permisivo.
- Ausencia total de datos de entrenamiento: se desconoce la composicion del corpus, por lo que no se puede evaluar el sesgo ni la cobertura linguistica.
- Idiomas no declarados: no hay garantia de un rendimiento aceptable en castellano ni en ninguna otra lengua concreta.
- Contexto maximo desconocido: no se debe asumir una ventana larga; cualquier despliegue con documentos extensos requiere verificacion previa.
- Licencia `swift-open-license-1.0`: los terminos no se incluyen en la informacion disponible. Es imprescindible leer el texto completo en el enlace de licencia antes de cualquier uso comercial.
- Modelo sin uso comercial claro y con 0 descargas: no hay comunidad que haya validado el artefacto, por lo que se recomienda tratarlo como experimental.
- La cuantizacion a 8 bits introduce una perdida de calidad respecto al modelo en precision completa, no cuantificada en ningun benchmark de esta ficha.
- El modelo esta pensado para MLX y Apple Silicon; no es portable directamente a stacks CUDA sin conversion adicional.
- Riesgo reputacional y legal: al eliminar los mecanismos de rechazo, puede generar contenido inapropiado, ofensivo o ilegal. Se requiere moderacion externa si se expone a usuarios finales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kylar/Swift-Qwen3.8-27B-Uncensored-MTP-mlx-8Bit
- Modelo base: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP
- Texto de licencia referenciado en la model card: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Space de conversion utilizado: https://huggingface.co/spaces/mlx-community/mlx-my-repo
- Documentacion de mlx-lm: https://github.com/ml-explore/mlx-lm
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devolvieron unicamente paginas corporativas de Microsoft, sin relacion con este artefacto.
