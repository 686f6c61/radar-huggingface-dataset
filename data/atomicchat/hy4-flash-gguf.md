# AtomicChat/Hy4-flash-GGUF

## Resumen

Hy4-flash es un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por Tencent, con 218.900 millones de parametros totales. De ellos, 155.500 millones residen en la red neuronal propiamente dicha (512 expertos enrutados, 16 activos por token, 11.300 millones de parametros activos) y 63.500 millones corresponden a Engram, una tabla de embeddings de bigramas y trigramas aprendidos que se consulta por hash. El modelo procesa texto e imagenes y declara una ventana de contexto de 1 millon de tokens.

La ficha que nos ocupa no es el modelo original, sino una cuantizacion GGUF publicada por AtomicChat bajo el identificador `AtomicChat/Hy4-flash-GGUF`. Su proposito es hacer viable la ejecucion del modelo en maquinas de 64 GB de memoria, algo que las compilaciones oficiales de Tencent (72-105 GB en memoria) no permiten. Para ello, los expertos enrutados se comprimen a aproximadamente 2,3 bits (IQ2_S en las proyecciones down, IQ2_XXS en gate/up), el resto de pesos se mantiene en Q8_0 y la tabla Engram se aisla en un segundo fichero que puede permanecer en disco y leerse fila a fila.

La relevancia de esta publicacion es doble: por un lado, demuestra que un MoE de 220B puede desplegarse en hardware de consumo alto o en estaciones de trabajo modestas; por otro, expone con transparencia el coste de calidad asociado a una cuantizacion tan agresiva. El autor advierte explicitamente de que el modelo pierde mas por cuantizacion que la media y recomienda tratarlo como una compilacion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con modulo Engram de embeddings n-grama; soporte de vision |
| Parametros totales | 218.938.353.741 (218,9B) |
| Parametros activos | 11,3B (16 de 512 expertos enrutados por token) |
| Longitud de contexto | 1.000.000 tokens (declarado por el modelo base) |
| Tipos de cuantizacion | IQ2_S (down de expertos), IQ2_XXS (gate/up de expertos), Q8_0 (resto), Q4_0 (tabla Engram), F16 (proyector de vision) |
| Idiomas soportados | no disponible (corpus de perplexidad de 30 idiomas usado por el autor, sin lista publicada) |
| Licencia | tencent-hy-license (licencia propia de Tencent, marcada como "other" en Hugging Face) |
| Formato de pesos | GGUF (3 ficheros: 2 partes del modelo + proyector de vision) |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer con mezcla de expertos: 512 expertos enrutados de los que se activan 16 por token, lo que arroja 11,3B de parametros activos sobre un total de 155,5B en la red. A esto se suma Engram, un componente poco habitual consistente en una tabla de 660 millones de filas de 96 dimensiones que almacena embeddings de bigramas y trigramas aprendidos y se consulta mediante hash. Al ser un acceso por filas de pocos kilobytes por token, la tabla puede residir en SSD sin penalizar gravemente la latencia, lo que constituye la clave tecnica que permite reducir el requisito de memoria.

La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens procesados ni si hubo fases de RLHF o DPO. El autor de la cuantizacion menciona que Tencent publica resultados propios en benchmarks de agentes y codigo, pero no reproduce esos datos. Si se documenta una innovacion relevante en el contexto de esta ficha: la separacion fisica entre los pesos de la red y la tabla Engram en ficheros GGUF distintos, que permite mantener la tabla en disco y cargar en memoria solo 49,1 GB. Las compilaciones oficiales de Tencent incluyen ademas un bloque de prediccion multi-token de su export interno que el checkpoint publico no incorpora.

## Capacidades

- Generacion de texto conversacional multi-turno, con respuestas factuales y aritmetica basica verificadas manualmente por el autor.
- Razonamiento explicito con modo "thinking" activado por defecto; el autor reporta la resolucion correcta de un problema de logica.
- Generacion de codigo: se verifico la produccion de una funcion Python correcta.
- Vision: entrada de imagenes mediante proyector F16; el autor comprobo la descripcion correcta de formas, colores, posiciones y texto presente en una imagen de prueba.
- Tool calling / function calling: el modelo invoca herramientas proporcionadas cuando el razonamiento esta activo. Con `reasoning_effort` en `no_think` responde en prosa en lugar de llamar a la herramienta.
- Capacidad multilingue: se verifico una respuesta de dos frases en chino; el corpus de evaluacion de perplexidad cubre 30 idiomas.
- Contexto largo de hasta 1M tokens (segun el modelo base; el autor probo con 32K en `llama-server`).
- Soporte de agentes y razonamiento multi-paso: recomendado por el autor mantener el razonamiento activo para uso agentico.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo de 64 GB: el modelo cabe en memoria con 49,1 GB de pesos y permite conversaciones multi-turno sin conexion, gracias a que la tabla Engram se relega a SSD.
- Analisis de documentos extensos: la ventana de 1M tokens del modelo base habilita el procesamiento de contratos, informes o bases de codigo completas en una sola pasada, aunque en esta cuantizacion conviene limitar el contexto a lo que la memoria permita.
- Descripcion y extraccion de informacion de imagenes: con el proyector F16 se pueden construir pipelines de altas de inventario, accesibilidad o moderacion de contenido que combinen texto e imagen en local.
- Agentes con tool calling en entornos aislados: el modelo invoca funciones correctamente con el razonamiento activo, lo que permite orquestar APIs internas o consultas a bases de datos sin salida a internet.
- Generacion de codigo en flujos de desarrollo offline: util para autocompletado y generacion de funciones en entornos con requisitos de confidencialidad, donde no se puede enviar codigo a servicios en la nube.
- Prototipado e investigacion de tecnicas de cuantizacion extrema: el repositorio incluye mediciones de KLD y acuerdo de top-token frente a BF16, lo que lo convierte en un banco de pruebas para estudiar el impacto de IQ2 en modelos MoE.
- Traduccion y atencion al cliente multilingue en local: el modelo responde en chino e ingles de forma verificada, aunque la cobertura completa de idiomas no esta documentada.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas (MMLU, HumanEval, GSM8K u otros). Si proporciona mediciones de calidad de cuantizacion frente a su conversion BF16 de los pesos originales, con `llama-perplexity` sobre un corpus neutral de 30 idiomas (104 fragmentos de 4096 tokens), usando llama.cpp PR #32517 en `0a054d0b` sobre 8x A100 80 GB:

| Fichero | Memoria (GB) | Disco (GB) | KLD media | KLD percentil 99 | Mismo top token |
|---|---:|---:|---:|---:|---:|
| Q8_0 (autor, no publicado) | 165,5 | 232,8 | 0,136 | 2,92 | 91,8% |
| Tencent Q4_K_M | 105,0 | 168,4 | 0,198 | 4,18 | 89,3% |
| Tencent IQ2-AH | 71,6 | 135,0 | 0,651 | 8,73 | 77,9% |
| AD-IQ2_S-IQ2_XXS (este repo) | 49,1 | 84,7 | 0,725 | 9,08 | 76,4% |

El autor senala que la mediana de KLD de Q4_K_M de Tencent es 0,008, lo que indica que la mayoria de tokens son casi exactos y una minoria diverge mucho; su hipotesis es que pequenas diferencias de redondeo alteran la seleccion de los 16 expertos de 512. Tambien advierte que Tencent situa su IQ2-AH entre 2 y 6,5 puntos por debajo de BF16 en sus propios benchmarks de agentes y codigo, y que no se han ejecutado benchmarks de tarea sobre este fichero.

En cuanto a velocidad, sobre 4x A100 80 GB con capas repartidas entre tarjetas y la tabla Engram en host, el autor mide entre 23 y 26 tokens/s de generacion. No hay mediciones en Mac.

## Requisitos de hardware

- VRAM estimada: 49,1 GB de pesos en memoria (todo excepto la tabla Engram); con proyector de vision y contexto de 32K, `llama-server` retuvo 51,4 GB de memoria de GPU en la maquina CUDA del autor.
- La tabla Engram (35,64 GB en Q4_0) puede permanecer en SSD y leerse por filas, por lo que no computa en el presupuesto de VRAM.
- GPU recomendadas: 4x A100 80 GB es la configuracion medida por el autor; 8x A100 80 GB se uso para las mediciones de perplexidad. No se documentan pruebas en H100 ni en RTX 4090.
- Cabe en GPU de consumo: no confirmado. Un unico RTX 4090 (24 GB) no puede alojar los 49,1 GB de pesos; haria falta repartir entre varias GPU o usar memoria unificada, opcion no verificada por el autor.
- Opciones de despliegue: exclusivamente llama.cpp con soporte para Hy4-flash, concretamente el PR abierto ggml-org/llama.cpp#32517 probado en el commit `0a054d0b`. LM Studio, Ollama y llama.cpp estandar no cargan estos ficheros.
- Throughput: 23-26 tokens/s en 4x A100 80 GB. Latencia no reportada.
- Almacenamiento: 84,7 GB en disco para los dos ficheros del modelo, mas 0,97 GB del proyector de vision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hy4-flash (Tencent, Q4_K_M) | 218,9B totales / 11,3B activos | 1M | tencent-hy-license | GGUF oficial (AngelSlim) | 105 GB en memoria, KLD media 0,198, 89,3% mismo top token |
| Hy4-flash (Tencent, IQ2-AH) | 218,9B totales / 11,3B activos | 1M | tencent-hy-license | GGUF oficial (AngelSlim) | 71,6 GB en memoria, KLD media 0,651, 77,9% mismo top token |
| Hy4-flash (AtomicChat, AD-IQ2_S-IQ2_XXS) | 218,9B totales / 11,3B activos | 1M | tencent-hy-license | GGUF (este repo) | 49,1 GB en memoria, KLD media 0,725, 76,4% mismo top token |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de modelos comparables de otros desarrolladores |

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion superior a la habitual: incluso Q8_0 del propio autor solo coincide con BF16 en el 91,8% de los tokens, frente a mas del 98% tipico en otros modelos. Esta compilacion baja al 76,4%.
- Dependencia de una version no fusionada de llama.cpp: requiere el PR #32517 en el commit `0a054d0b`. LM Studio, Ollama y llama.cpp estandar no cargan los ficheros, lo que limita su uso en produccion.
- El propio autor la califica como compilacion experimental, no apta como opcion por defecto.
- Tool calling degradado: con `reasoning_effort` en `no_think` el modelo responde en prosa en lugar de invocar herramientas, a diferencia de la Q8_0 del autor. Para agentes hay que mantener el razonamiento activo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la divergencia de distribucion respecto a BF16 en la cola (KLD percentil 99 de 9,08) sugiere mayor probabilidad de tokens atipicos.
- Idiomas soportados no documentados; solo se verifico ingles y chino de forma manual.
- Licencia `tencent-hy-license`: es una licencia propia de Tencent marcada como "other", no una licencia open source estandar. Las condiciones exactas de uso comercial no se detallan en la informacion disponible y deben consultarse en el fichero LICENSE del repositorio.
- Sin mediciones en hardware Apple; el autor no ha probado el modelo en Mac.
- Sin benchmarks de tarea publicados para este fichero concreto; las cifras de Tencent sobre IQ2-AH (2-6,5 puntos por debajo de BF16) son la referencia mas cercana.
- El checkpoint publico no incluye el bloque de prediccion multi-token presente en las compilaciones oficiales de Tencent.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- GGUF oficiales de Tencent: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- PR de llama.cpp con soporte Hy4-flash: https://github.com/ggml-org/llama.cpp/pull/32517
- Atomic Chat (aplicacion): https://atomic.chat/
- Repositorio Atomic Chat en GitHub: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- Cuenta de X: https://x.com/atomic_chat_hq
