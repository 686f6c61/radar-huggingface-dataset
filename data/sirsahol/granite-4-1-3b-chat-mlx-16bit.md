# SirSahOl/granite-4.1-3b-chat-mlx-16bit

## Resumen

SirSahOl/granite-4.1-3b-chat-mlx-16bit es una conversion a formato MLX de 16 bits (bfloat16 sin cuantizar) del modelo ibm-granite/granite-4.1-3b de IBM, orientada a inferencia nativa en la GPU de los chips Apple Silicon. No se trata de un modelo nuevo ni de un fine-tuning: es una redistribucion del mismo conjunto de pesos en el formato que entiende MLX, la libreria de Apple, de modo que pueda ejecutarse con `mlx-lm`, LM Studio u Ollama sobre macOS sin depender de CUDA. El modelo conserva la ventana de contexto de 131.072 tokens del original y una arquitectura decoder-only de tipo `GraniteForCausalLM`.

El interes practico de esta version concreta es la precision: al mantener los pesos en bfloat16 sin cuantizar, sirve como referencia para evaluacion y benchmarking frente a las variantes de 4 y 8 bits del mismo autor, a costa de un mayor consumo de memoria unificada (unos 7,1 GB en inferencia y 6,8 GB en disco). Con 3.402.836.480 parametros reales segun los safetensors del repositorio, es un modelo pequeno que cabe en equipos de consumo, pero limitado al ecosistema Apple.

La ficha se basa exclusivamente en la metadata de HuggingFace y en la model card publicada. La model card no incluye resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.), no declara idiomas soportados y no documenta el proceso de entrenamiento del modelo base; todos esos puntos se marcan como no disponibles. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (unicamente enlaces a Scratch), por lo que no hay fuentes adicionales que citar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteForCausalLM (transformer decoder-only) |
| Parametros totales | 3.402.836.480 (aprox. 3,4 B segun safetensors; la model card indica 3,0 B) |
| Parametros activos | No aplica: arquitectura densa, no es MoE |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Este repositorio: 16 bits sin cuantizar (bfloat16, ~16,00 bits por peso). El mismo autor publica variantes de 4 bits y 8 bits |
| Idiomas soportados | no disponible (la metadata de HuggingFace no declara idiomas y la model card tampoco los lista) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX |
| Modelo base | ibm-granite/granite-4.1-3b |
| Framework de inferencia | MLX (mlx-lm), Apple Silicon |
| Tamano del repositorio | 6,8 GB |
| Huella de VRAM activa | ~7,1 GB (memoria unificada minima recomendada: 16 GB) |
| Pipeline | text-generation |
| Descargas / likes | 287 descargas, 0 likes |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como `GraniteForCausalLM`, es decir, un transformer decoder-only causal, sin mezcla de expertos ni componentes de estado recurrente. El repositorio no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO u otra fase de alineamiento: esa informacion corresponderia al modelo base de IBM y no se incluye aqui. Tampoco se documenta ninguna innovacion tecnica propia de esta conversion mas alla del propio proceso de conversion de pesos a MLX.

Lo unico especifico de este repositorio es la conversion a MLX en bfloat16 sin cuantizar, junto con los detalles de plantilla de chat y de tokens de parada. La plantilla usa el esquema ChatML: prefijo de sistema `<|im_start|>system\n`, sufijo `<|im_end|>\n`, prefijo de usuario `<|im_start|>user\n` y sufijo de asistente `<|im_end|>\n<|im_start|>assistant\n`. Los tokens de parada que hay que configurar en runtimes locales son `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`. La model card advierte explicitamente de que hay que configurarlos para evitar bucles de generacion y asegurar el turno conversacional correcto.

No se dispone de informacion sobre el dataset de entrenamiento ni sobre el proceso de alineamiento del modelo base en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte de plantilla de chat ChatML y rol de sistema.
- Procesamiento de entradas muy largas: la ventana de 131.072 tokens permite pasar documentos completos sin trocear.
- Generacion de codigo: la model card recomienda el modelo como "daily driver" para programacion en los perfiles Pro y superiores.
- Invocacion de herramientas: la model card menciona "tool invocation" como caso de uso recomendado, aunque no documenta ningun esquema de function calling, formato JSON de herramientas ni ejemplos. La capacidad real depende del modelo base y no esta verificada en la informacion disponible.
- Razonamiento multi-paso y flujos de agente: la model card lo situa entre los usos del perfil Max ("agent orchestration"), sin detallar mecanismos concretos.
- Capacidades multilingues: no disponible. No se declaran idiomas ni en la metadata de HuggingFace ni en la model card.
- Capacidades multimodales (vision, audio) o modo "thinking" explicito: no disponibles segun la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en macOS: con la plantilla ChatML configurada y ~7,1 GB de memoria unificada, el modelo puede sostener conversaciones multi-turno completamente en local en un Mac con 16 GB, sin enviar datos a la nube.
- Generacion y refactorizacion de codigo en el IDE: la model card lo posiciona como opcion equilibrada para programacion en los perfiles Pro y Max; puede integrarse mediante `mlx_lm.generate` o a traves de un servidor compatible con endpoints para asistentes de codigo.
- Analisis de documentos largos: la ventana de 131.072 tokens permite resumir, extraer entidades o responder preguntas sobre informes, contratos o transcripciones extensas sin dividirlas en fragmentos.
- Canal RAG local: uso como generador en un pipeline de recuperacion aumentada donde el contexto recuperado se inserta directamente en el prompt, manteniendo todo el proceso en el dispositivo.
- Evaluacion y referencia de precision: al ser la variante sin cuantizar, sirve para medir la degradacion de las versiones de 4 y 8 bits del mismo autor y para generar salidas de referencia en experimentos.
- Procesamiento por lotes en estaciones de trabajo: en un Mac Ultra la model card estima ~93 tokens/s, lo que permite extraccion de informacion o clasificacion de documentos en volumen moderado.
- Prototipado offline y entornos con restricciones de privacidad: escenarios en los que no se permite enviar datos a APIs externas (sanidad, legal, sector publico) y se necesita un modelo de licencia Apache-2.0 ejecutable sin conexion.
- Desarrollo de agentes experimentales: la model card cita la orquestacion de agentes como uso del perfil Max; conviene validar previamente el soporte real de tool calling contra la documentacion del modelo base antes de llevarlo a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La seccion "Performance Benchmarks" de la model card solo contiene proyecciones de velocidad y latencia sobre hardware Apple Silicon, no metricas de exactitud. El repositorio incluye la etiqueta `eval-results`, pero no se aporta ningun resultado asociado a ella.

Unicas cifras publicadas (proyecciones del autor, no medidas verificadas):

| Nivel de Apple Silicon | Memoria unificada | VRAM activa | Velocidad estimada | TTFT estimado |
|---|---|---|---|---|
| M1/M2/M3/M4 (base) | 16 GB | ~7,1 GB | ~31 tokens/s | ~94 ms |
| M1/M2/M3/M4 Pro | 18-36 GB | ~7,1 GB | ~46 tokens/s | ~64 ms |
| M1/M2/M3/M4 Max | 36-128 GB | ~7,1 GB | ~67 tokens/s | ~39 ms |
| M1/M2/M3 Ultra | 64-192 GB | ~7,1 GB | ~93 tokens/s | ~26 ms |

El propio autor indica que son proyecciones basadas en la saturacion de ancho de banda de memoria y que la velocidad real varia segun la longitud del prompt.

## Requisitos de hardware

- VRAM/memoria unificada para inferencia: ~7,1 GB de huella activa; minimo recomendado de 16 GB de memoria unificada.
- Espacio en disco: 6,8 GB para los pesos en safetensors.
- Hardware objetivo: exclusivamente Apple Silicon (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra), ya que MLX no soporta GPU NVIDIA o AMD.
- GPU de consumo: el modelo esta pensado para Mac de consumo. En un equipo base con 16 GB de memoria unificada el autor estima ~31 tokens/s; no se contempla ejecucion en RTX 4090, A100 o H100 con este repositorio, porque el formato MLX no es compatible con CUDA sin una conversion previa a otro formato.
- Precision recomendada por el autor segun hardware: 4 bits para 8-16 GB, 8 bits para 18-36 GB, 16 bits (este repositorio) para 36-192 GB.
- Opciones de despliegue documentadas: `mlx-lm` mediante CLI (`mlx_lm.chat`, `mlx_lm.generate`) y API de Python (`load`, `generate`); LM Studio con configuracion manual de tokens de parada; Ollama mediante un Modelfile con los stop tokens `<|im_start|>`, `<|im_end|>` y `<|endoftext|>` y temperatura 0.7.
- Opciones no aplicables con este formato: vLLM y TGI no se mencionan en la documentacion y no cargan pesos MLX de forma nativa. La etiqueta `endpoints_compatible` sugiere compatibilidad con servidores de endpoints, pero no se detalla ningun procedimiento.
- Latencia y throughput: solo las proyecciones de la tabla anterior; no hay mediciones independientes publicadas.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con las otras dos conversiones del mismo autor. No se dispone de datos verificados de modelos alternativos de tamano similar (por ejemplo, otros modelos de ~3-4 B ejecutables en local) en las fuentes proporcionadas.

| Modelo | Parametros | Contexto | Cuantizacion | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SirSahOl/granite-4.1-3b-chat-mlx-16bit | ~3,4 B | 131.072 | 16 bits (bfloat16) | ~6,8 GB | apache-2.0 | HuggingFace, formato MLX |
| SirSahOl/granite-4.1-3b-chat-mlx-8bit | ~3,4 B (mismo base) | 131.072 (segun el base) | 8 bits | ~3,6 GB | apache-2.0 | HuggingFace, formato MLX |
| SirSahOl/granite-4.1-3b-chat-mlx-4bit | ~3,4 B (mismo base) | 131.072 (segun el base) | 4 bits | ~2,0 GB | apache-2.0 | HuggingFace, formato MLX |
| ibm-granite/granite-4.1-3b (base) | 3,0 B segun model card | 131.072 | Pesos originales | no disponible | apache-2.0 | HuggingFace |

Rendimiento comparado de calidad: no disponible para ninguna de las variantes; el autor no publica resultados de exactitud para 4, 8 o 16 bits. La unica ventaja documentada de la version de 16 bits es la ausencia de degradacion por cuantizacion, a cambio de un mayor consumo de memoria y disco.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluacion de sesgo o toxicidad para este modelo ni para su base en la informacion disponible.
- Alucinacion: no hay mediciones de tasa de alucinacion ni evaluaciones de veracidad publicadas; el riesgo debe asumirse como el de cualquier modelo generativo de 3-4 B sin datos especificos.
- Idiomas: la metadata de HuggingFace no declara idiomas y la model card tampoco los enumera, por lo que el soporte multilingue real es desconocido. No se debe asumir buen rendimiento en castellano sin una evaluacion propia.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar los terminos y avisos del modelo base `ibm-granite/granite-4.1-3b` antes de desplegarlo en produccion.
- Compatibilidad de plataforma: el formato MLX solo se ejecuta en Apple Silicon; no es utilizable en GPUs NVIDIA o AMD sin convertir los pesos a otro formato (por ejemplo, GGUF o safetensors estandar).
- Configuracion obligatoria: es necesario definir manualmente los tokens de parada `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`; si no se hace, la model card advierte de bucles de generacion y fallos en el turno conversacional.
- Tool calling: aunque la model card menciona la invocacion de herramientas, no documenta esquema, formato ni ejemplos; la capacidad no esta verificada para esta conversion.
- Origen y soporte: es una conversion de un tercero (SirSahOl), no una publicacion oficial de IBM, con 287 descargas y 0 likes en el momento de la consulta, lo que implica un soporte comunitario practicamente nulo.
- Metadata dudosa: la etiqueta de HuggingFace incluye `arxiv:0000.00000`, un identificador de marcador de posicion sin paper asociado, y las fechas de creacion y actualizacion indicadas (septiembre de 2026) son anomalas. Conviene tratar la metadata del repositorio con cautela.
- Discrepancia de parametros: la model card declara 3,0 B de parametros mientras que los safetensors suman 3.402.836.480; conviene usar la cifra real para planificar memoria.
- Benchmarks ausentes: al no haber resultados de exactitud, no es posible comparar objetivamente esta conversion con alternativas de la misma categoria.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SirSahOl/granite-4.1-3b-chat-mlx-16bit
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-3b
- Variante de 4 bits: https://huggingface.co/SirSahOl/granite-4.1-3b-chat-mlx-4bit
- Variante de 8 bits: https://huggingface.co/SirSahOl/granite-4.1-3b-chat-mlx-8bit
- Perfil del autor: https://huggingface.co/SirSahOl
- Framework MLX (Apple): https://github.com/ml-explore/mlx

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su modelo base; los unicos resultados obtenidos fueron enlaces a Scratch (https://scratch.mit.edu/), sin relacion con el modelo. No se han localizado papers, blogs, repositorios de codigo ni demos adicionales en las fuentes proporcionadas.
