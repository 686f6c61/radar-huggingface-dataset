# jsantillana/Qwen3.6-35B-A3B-Base-GGUF

## Resumen

Qwen3.6-35B-A3B-Base-GGUF es una suite de cuantizaciones en formato GGUF generada por el usuario jsantillana a partir de los pesos base de Qwen/Qwen3.6-35B-A3B, el modelo de arquitectura Mixture of Experts (MoE) desarrollado por el equipo Qwen de Alibaba. El objetivo de esta publicacion es facilitar la evaluacion local del modelo base en hardware de CPU y estaciones de trabajo mediante llama.cpp, sin necesidad de GPUs de gran capacidad. El repositorio contiene los pesos cuantizados en Q3_K_M, con un tamano aproximado de 15,5 GB dentro de un repo de 17,2 GB.

El modelo subyacente cuenta con unos 35.505 millones de parametros totales, de los cuales aproximadamente 3.000 millones se activan por token, lo que reduce de forma sustancial el coste computacional de la inferencia frente a un modelo denso del mismo tamano. La longitud de contexto declarada es de 256K tokens, una ventana especialmente amplia que lo situa en la gama alta para tareas de contexto largo.

La relevancia de esta publicacion radica en que permite probar un MoE de 35B en entornos con recursos limitados: al activar solo ~3B parametros por token y ofrecer una cuantizacion Q3_K_M de ~15,5 GB, el modelo puede ejecutarse en CPU con suficiente RAM o en GPUs de consumo con memoria ajustada. La licencia Apache 2.0 facilita su uso comercial y su integracion en pipelines propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer (detalles no disponibles) |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Q3_K_M (~15,5 GB); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura Mixture of Experts con aproximadamente 35,5B parametros totales y unos 3B activos por token. Esta configuracion dispersa permite que, en cada paso de decodificacion, solo se compute una fraccion de la red, lo que reduce el coste de inferencia manteniendo una capacidad de representacion propia de un modelo de mayor tamano. La ventana de contexto es de 256K tokens, adecuada para documentos extensos y conversaciones de multiples turnos.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion posteriores al preentrenamiento. Esta publicacion concreta es una cuantizacion del checkpoint base (no instruct), por lo que no incorpora necesariamente el ajuste conversacional de las variantes instruct del modelo original. La cuantizacion se realizo con llama.cpp en formato Q3_K_M.

## Capacidades

- Generacion de texto autoregresiva a partir de los pesos base, sin ajuste instruct especifico en esta variante.
- Razonamiento y conocimiento general heredados del modelo base Qwen3.6.
- Capacidad de procesamiento de contexto largo gracias a la ventana de 256K tokens.
- Inferencia local en CPU y estaciones de trabajo mediante llama.cpp, con la cuantizacion Q3_K_M.
- Compatibilidad con endpoints (tag endpoints_compatible) para su despliegue como servicio.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion local del modelo base: la cuantizacion Q3_K_M (~15,5 GB) permite cargar el modelo en un equipo con suficiente RAM y probar su comportamiento sin depender de servicios en la nube, util para comparar variantes y medir calidad antes de invertir en infraestructura.
- Procesamiento de documentos largos: con 256K tokens de contexto, el modelo puede ingerir informes, expedientes o bases de codigo extensas en una sola pasada, lo que resulta adecuado para resumenes y extraccion de informacion sobre corpus de gran tamano.
- Prototipado en CPU: al activar solo ~3B parametros por token, la inferencia en CPU resulta viable para pruebas de concepto, demos internas y validacion de prompts sin GPU dedicada.
- Generacion de texto base para fine-tuning: al tratarse de un checkpoint base, sirve como punto de partida para ajustes supervisados o LoRA orientados a dominios concretos, con la ventaja de su licencia Apache 2.0.
- Despliegue en estaciones de trabajo con VRAM limitada: la cuantizacion Q3_K_M permite repartir capas entre GPU y CPU en llama.cpp, lo que facilita ejecutar un MoE de 35B en equipos con 16-24 GB de VRAM.
- Experimentacion con arquitecturas MoE: investigadores pueden estudiar el comportamiento de la activacion dispersa y el enrutamiento de expertos en un modelo de 35B con coste de computo reducido.
- Integracion en pipelines internos de generacion de texto: mediante el tag endpoints_compatible, puede exponerse como servicio compatible con APIs de chat para tareas de redaccion, clasificacion o extraccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: la cuantizacion Q3_K_M ocupa aproximadamente 15,5 GB, por lo que se necesita al menos esa cantidad de memoria combinada (RAM + VRAM) para cargar los pesos, mas overhead de contexto y cache KV.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, una GPU de 24 GB (RTX 3090/4090) permitiria cargar la mayor parte de las capas, y GPUs de 40-80 GB (A100, H100) permitirian el modelo completo en VRAM.
- Cabe en GPU de consumo: si, en GPUs de 24 GB con offload parcial a CPU; en GPUs de 16 GB requeriria mayor reparto de capas a RAM del sistema.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por extension herramientas compatibles con GGUF como Ollama o servidores basados en llama.cpp; vLLM y TGI no estan confirmados para este formato en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Base-GGUF (esta ficha) | ~35,5B | ~3B | 256K | Apache 2.0 | GGUF Q3_K_M |
| Qwen/Qwen3.6-35B-A3B (original) | ~35,5B | ~3B | 256K | Apache 2.0 (segun repo base) | safetensors (no confirmado) |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de otros fabricantes en la busqueda realizada; la comparativa se limita al modelo base del que deriva esta cuantizacion.

## Limitaciones y advertencias

- Al ser un checkpoint base y no instruct, no esta optimizado para seguir instrucciones ni para dialogos conversacionales; puede requerir prompts few-shot o ajuste posterior.
- La cuantizacion Q3_K_M introduce perdida de precision respecto a los pesos originales, con posible degradacion en tareas de razonamiento complejo y generacion de codigo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de esta cuantizacion.
- Idiomas soportados no confirmados en la informacion disponible; el rendimiento fuera de los idiomas principales del modelo base puede ser irregular.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad; conviene verificar la integridad de los pesos antes de usarlos en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen/Qwen3.6-35B-A3B por si existieran condiciones adicionales.
- No se dispone de informacion sobre sesgos especificos, latencia ni throughput medidos para esta cuantizacion.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/jsantillana/Qwen3.6-35B-A3B-Base-GGUF
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Coleccion Qwen3.6: https://huggingface.co/collections/Qwen/qwen36
