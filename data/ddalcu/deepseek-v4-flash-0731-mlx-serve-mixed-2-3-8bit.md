# ddalcu/DeepSeek-V4-Flash-0731-MLX-Serve-mixed-2-3-8bit

## Resumen

DeepSeek-V4-Flash-0731-MLX-Serve-mixed-2-3-8bit es una conversión cuantizada en formato MLX del modelo DeepSeek-V4-Flash-0731 de DeepSeek, publicada por el usuario ddalcu. El modelo base es un Mixture-of-Experts (MoE) disperso de 284 mil millones de parámetros con 13 mil millones activos, diseñado para generación de texto, razonamiento, codificación, contexto largo y flujos agénticos. Esta conversión aplica una cuantización mixta de 2, 3, 4 y 8 bits calibrada con imatrix, lo que reduce el peso a unos 115 GB y permite ejecutar el modelo completo en un Mac con Apple Silicon y 128 GB o más de memoria unificada.

La relevancia de esta ficha radica en que es una de las pocas vías para ejecutar localmente un modelo de 284B en hardware de consumo (Apple Silicon), sin depender de servicios en la nube. El servidor de inferencia mlx-serve, escrito en Zig, implementa nativamente la arquitectura de DeepSeek-V4-Flash, incluyendo atención con ventana, compresión de historial, conexiones hiper Sinkhorn y decodificación especulativa DSpark. El repositorio incluye pesos, tokenizador y plantilla de chat verificada byte a byte contra la versión oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso con MQA sobre latent de 512 dimensiones, atencion raw con ventana 128, compresion de historial con gated-pooling e indexador top-512, attention sinks por cabeza, hiperconexiones Sinkhorn, capas MoE tempranas con enrutado por hash, y modulo de decodificacion especulativa DSpark (3 etapas) |
| Parametros totales | 284B (modelo base, segun model card); el conteo de safetensors del repo reporta 31.828.465.598 (~31,8B), discrepancia sin resolver |
| Parametros activos | 13B (A13B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta afin: 2-bit (grupo 128) en expertos enrutados w1/w3 de capas 0-38; 3-bit (grupo 128) en w2 de capas 0-38; 4-bit (grupo 64) en expertos de capas 39-42 y etapas DSpark; 8-bit (grupo 64) en atencion, expertos compartidos, indexador, main_proj, embeddings y LM head; bf16 en compressor y router; normas y parametros de hiperconexion sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), sin GGUF |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un MoE disperso de 284B parametros con 13B activos por token. Su arquitectura combina atencion multi-consulta (MQA) sobre un espacio latente de 512 dimensiones, atencion cruda con ventana de 128 tokens, compresion del historial mediante gated-pooling con un indexador que selecciona los top-512 tokens relevantes, attention sinks por cabeza y hiperconexiones Sinkhorn entre capas. Las capas MoE tempranas utilizan enrutado por hash para reducir coste, y el modelo incorpora un modulo de decodificacion especulativa DSpark con tres etapas de borrador que acelera la generacion.

La conversion cuantizada de ddalcu aplica una estrategia de precision mixta por clase de tensor, calibrada con una matriz de importancia (imatrix) recopilada sobre 1,5 millones de tokens de texto con formato de chat. Los expertos enrutados, que suponen 277B de los 284B, se cuantizan con una busqueda activada por canales que reconstruye mejor los canales que realmente se activan. Las ultimas cuatro capas mantienen sus expertos en 4 bits para evitar bucles de repeticion en sesiones de agente, un fallo observado con 2 bits uniformes. La conversion es exacta donde es posible: los formatos fp8 (e4m3 + e8m0) y fp4 (e2m1 + e8m0) del modelo original se decodifican sin perdida a bf16 antes de la recuantizacion.

## Capacidades

- Generacion de texto conversacional y de larga forma con plantilla de chat que soporta modos de pensamiento (thinking) y tres niveles de esfuerzo de razonamiento.
- Razonamiento multi-paso y resolución de problemas complejos, con capacidad de mantener contexto largo gracias a la compresion de historial y el indexador.
- Generacion de codigo y uso como agente de codificacion: el modelo puede emitir llamadas a herramientas en formato DSML y gestionar sesiones multi-turno con historial de tool calls.
- Soporte de tool calling y function calling mediante el formato DSML, integrable en clientes que hablan los protocolos OpenAI, Anthropic y Ollama.
- Decodificacion especulativa DSpark con tres etapas de borrador, que acelera la inferencia sin perder calidad (verificacion del tronco principal).
- Capacidades multilingues: no confirmadas en la informacion disponible; el modelo base de DeepSeek suele ser multilingue, pero no hay datos en esta ficha.

## Casos de uso

- Agente de codificacion local: el modelo puede ejecutarse en un Mac con 128 GB y usarse con clientes como Claude Code, opencode o pi para tareas de desarrollo, emitiendo llamadas a herramientas y verificando resultados. La cuantizacion de 4 bits en las ultimas capas evita los bucles de repeticion observados en sesiones de agente.
- Asistente de programacion en entornos sin conexion: al ser una conversion MLX nativa, no requiere GPU de centro de datos; un equipo Apple Silicon con suficiente memoria unificada puede servir el modelo completo a traves de la API de mlx-serve, ideal para entornos con requisitos de privacidad.
- Atencion al cliente automatizada: con su ventana de contexto larga (no cuantificada) y soporte de tool calling, puede gestionar conversaciones multi-turno, consultar bases de conocimiento y escalar a un humano cuando sea necesario, todo en local.
- Razonamiento y analisis de documentos extensos: la compresion de historial con indexador top-512 permite procesar documentos largos y mantener coherencia en tareas de resumen, extraccion de informacion o analisis juridico.
- Desarrollo de agentes autonomos: el formato DSML y el soporte de multi-step reasoning permiten construir agentes que planifican, ejecutan herramientas y verifican resultados, con la ventaja de ejecutarse en hardware de consumo.
- Servidor de inferencia para equipos pequenos: mlx-serve expone APIs compatibles con OpenAI, Anthropic y Ollama, por lo que un unico Mac puede servir el modelo a varios clientes internos sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion de DeepInfra afirma que DeepSeek-V4-Flash-0731 supera a DeepSeek-V4-Pro (Preview) en los benchmarks listados a pesar de su menor numero de parametros activos, y que es ampliamente competitivo con los modelos mas fuertes, pero no se proporcionan cifras concretas. Tampoco hay datos de evaluacion especifica de esta conversion cuantizada frente al modelo original.

## Requisitos de hardware

- Apple Silicon Mac con 128 GB o mas de memoria unificada (requisito declarado por el autor).
- Memoria residente estimada: ~98 GB para el modelo, +11 GB adicionales si se activa la decodificacion especulativa con `--dspark`.
- Sistema operativo: macOS 26.2 o superior.
- Inferencia: servidor nativo mlx-serve (escrito en Zig, sin Python en la ruta de servicio), que habla las APIs de OpenAI, Anthropic y Ollama.
- Rendimiento: ~53 tokens por segundo con `--dspark` en un M-series con 128 GB, segun las pruebas del autor.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) por su tamano; esta orientado exclusivamente a memoria unificada de Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (original) | 284B | 13B | no disponible | no disponible | fp8/fp4 nativo | Modelo base sin cuantizar; requiere infraestructura de centro de datos |
| Esta conversion MLX (mixed 2/3/4/8-bit) | 284B | 13B | no disponible | MIT | safetensors MLX | Cuantizado para Apple Silicon; ~115 GB en disco |
| DeepSeek-V4-Flash-0731 iQ-MLX-3.3bpw (recomendado por el autor) | 284B | 13B | no disponible | MIT | safetensors MLX | Version alternativa con cuantizacion iQ a 3,3 bits por peso, recomendada por el autor sobre esta |

La comparativa principal es entre esta conversion y el modelo original: la version cuantizada sacrifica precision en los expertos enrutados (2-3 bits) a cambio de poder ejecutarse en hardware de consumo, con una perdida de calidad no cuantificada en los datos disponibles. El autor recomienda usar la version iQ-MLX-3.3bpw en lugar de esta, lo que sugiere que esta conversion es una iteracion intermedia.

## Limitaciones y advertencias

- La cuantizacion agresiva de 2 bits en los expertos enrutados de las capas 0-38 puede degradar la calidad de generacion en tareas que dependen de matices finos; el autor corrigio los bucles de repeticion en agentes subiendo las ultimas cuatro capas a 4 bits, pero no hay evaluacion sistematica de la perdida de calidad.
- Requiere hardware muy especifico: Apple Silicon con 128 GB o mas y macOS 26.2 o superior; no es portable a GPUs NVIDIA o AMD sin conversion adicional.
- El repositorio reporta 230,7 GB en disco, mientras que la model card indica 115,4 GB; esta discrepancia no esta explicada y puede afectar a la planificacion de almacenamiento.
- No se han documentado sesgos ni riesgos de alucinacion especificos de esta conversion; el modelo base puede presentar los sesgos tipicos de los modelos entrenados con datos web, pero no hay informacion al respecto.
- La licencia MIT cubre esta conversion, pero la licencia del modelo base DeepSeek-V4-Flash-0731 no se indica en la informacion disponible; conviene verificarla antes de un uso comercial.
- El conteo de parametros del repo safetensors (31,8B) no coincide con los 284B declarados en la model card; esta discrepancia no esta resuelta y podria indicar un error en el etiquetado o un subconjunto de pesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ddalcu/DeepSeek-V4-Flash-0731-MLX-Serve-mixed-2-3-8bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Servidor mlx-serve: https://github.com/ddalcu/mlx-serve
- Version recomendada por el autor (iQ-MLX-3.3bpw): https://huggingface.co/ddalcu/DeepSeek-V4-Flash-0731-iQ-MLX-3.3bpw
- Model card en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731/modelcard
- Modelo en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Documentacion de API en DeepInfra: https://deepinfra.com/deepseek-ai/DeepSeek-V4-Flash-0731/api
