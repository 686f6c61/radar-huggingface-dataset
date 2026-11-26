# chriswessels/ThinkingCap-Qwen3.8-27B-oQ4e-mtp

## Resumen

ThinkingCap-Qwen3.8-27B-oQ4e-mtp es una cuantizacion en 4 bits del modelo ThinkingCap-Qwen3.8-27B, un ajuste fino de Qwen3.8-27B (Qwen Team, 2026) desarrollado por Bottlecap AI. El objetivo del modelo base es mantener el rendimiento del original en tareas complejas y agenticas reduciendo de forma sustancial la verbosidad del razonamiento: segun la model card, recorta los tokens de pensamiento un 37 % de media (entre un 11 % y un 66 % segun el benchmark) conservando una precision media del 85,8 % frente al 86,6 % del modelo base.

Esta variante concreta la publica el usuario chriswessels y aplica cuantizacion de precision mixta con la herramienta oQ (oMLX v0.6.4) sobre el checkpoint de Bottlecap AI. El resultado es un conjunto de pesos en formato MLX safetensors de 4 bits con group size 64, pensado para ejecucion en Apple Silicon mediante la libreria MLX. El repositorio ocupa 17,0 GB y declara 27.781.427.952 parametros totales.

La relevancia actual es doble: por un lado, propone una via para abaratar el coste de inferencia de modelos con modo de razonamiento extenso sin degradar la calidad; por otro, esta version cuantizada permite desplegar un modelo de casi 28 000 millones de parametros en hardware de consumo de Apple, algo inviable con los pesos en bf16. El sufijo "mtp" del nombre no esta documentado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (tipo de modelo declarado: qwen3_5); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, precision mixta (oQ / oMLX v0.6.4), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (4 bits) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.8-27B, por lo que hereda la arquitectura transformer del modelo original de Qwen Team; la model card de esta cuantizacion solo declara el tipo de modelo como `qwen3_5` y no detalla numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora componentes hibridos. Tampoco se especifican los datos de entrenamiento del ajuste fino de Bottlecap AI (numero de tokens, composicion del dataset, uso de RLHF o DPO).

La innovacion documentada del modelo base es la reduccion de tokens de razonamiento: ThinkingCap Qwen3.8-27B se entrena para producir cadenas de pensamiento mas cortas manteniendo la precision. Segun la model card, la mayor ganancia se da en recuperacion de contexto largo, donde el recorte de razonamiento es del 39 % con una mejora de 2,3 puntos porcentuales en precision. La capa de cuantizacion de esta ficha aplica precision mixta con oQ, que asigna distinto numero de bits por capa o tensor en lugar de un 4 bits uniforme, con group size 64.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito, pero con cadenas de razonamiento mas cortas que el modelo base.
- Razonamiento cientifico y de conocimiento general de nivel alto (GPQA-Diamond y MMLU-Pro en el entorno del 84-88 % de precision segun la model card).
- Recuperacion en contexto largo, con mejoras declaradas de precision al reducir el razonamiento.
- Tareas agenticas: la model card menciona explicitamente el mantenimiento del rendimiento en tareas de agente, aunque no detalla el soporte concreto de tool calling o function calling.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Razonamiento cientifico asistido: el modelo puede resolver preguntas de nivel experto en fisica, quimica y biologia (GPQA-Diamond) con un coste de tokens de pensamiento aproximadamente un 43 % menor que el base, lo que abarata su uso en pipelines de evaluacion masiva.
- Analisis de documentos largos: gracias al comportamiento declarado en recuperacion de contexto largo, es adecuado para resumir o extraer informacion de expedientes extensos donde cada llamada consume muchos tokens de entrada.
- Agentes autonomos de varios pasos: al reducir la verbosidad del razonamiento, disminuye la latencia y el coste por tarea en bucles de planificacion y ejecucion con multiples llamadas al modelo.
- Asistencia tecnica y de conocimiento general: con MMLU-Pro en torno al 84,7 %, sirve para responder consultas transversales de dominio amplio en herramientas internas.
- Inferencia local en Mac: al estar en formato MLX de 4 bits y ocupar 17 GB, permite ejecutar un modelo de 27 800 millones de parametros en equipos Apple Silicon con memoria unificada suficiente, sin depender de GPU de centro de datos.
- Prototipado e investigacion: util para comparar el efecto de la cuantizacion de precision mixta frente al modelo en bf16 en tareas de razonamiento, midiendo la degradacion real por benchmark.

## Benchmarks y rendimiento

Datos de la model card del modelo base (ThinkingCap-Qwen3.8-27B frente a Qwen3.8-27B). No se han publicado resultados especificos de esta cuantizacion de 4 bits.

| Benchmark | Precision base | Precision ThinkingCap | Tokens base (media) | Tokens ThinkingCap (media) | Reduccion |
|---|---|---|---|---|---|
| GPQA-Diamond | 89,93 ± 0,70 | 88,04 ± 1,09 | 12 772 | 7 267 | 43,1 % |
| MMLU-Pro | 85,54 ± 0,63 | 84,67 ± 0,64 | 3 725 | 1 591 | no disponible en el extracto |

Precision media agregada declarada: 85,8 % (ThinkingCap) frente a 86,6 % (base). Recorte medio de tokens de razonamiento: 37 %, con un rango del 11 % al 66 % segun el benchmark.

## Requisitos de hardware

- VRAM o memoria unificada: el repositorio ocupa 17,0 GB en pesos de 4 bits; se recomienda al menos 20-24 GB de memoria disponible para margen de contexto y cache KV.
- Hardware objetivo: Apple Silicon con MLX (la libreria declarada es `mlx`); no es un formato pensado para CUDA.
- GPU de consumo: cabe en equipos Mac con memoria unificada de 24 GB o superior (por ejemplo, configuraciones de M3/M4 Pro con 24 GB o Max con 36 GB o mas). No es desplegable directamente en GPU NVIDIA consumer sin conversion de formato.
- Opciones de despliegue: MLX y oMLX; vLLM, llama.cpp, Ollama y TGI no soportan este formato de forma nativa segun la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-oQ4e-mtp (esta ficha) | 27,78 B | no disponible | MLX safetensors 4 bits | no disponible | Cuantizacion de precision mixta para Apple Silicon |
| bottlecapai/ThinkingCap-Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Modelo base sin cuantizar, con reduccion de razonamiento del 37 % |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Modelo original de Qwen Team, referencia de precision (86,6 % media) |

## Limitaciones y advertencias

- La cuantizacion en 4 bits puede degradar la precision respecto al modelo base; no se han publicado evaluaciones de esta variante concreta, por lo que la perdida real es desconocida.
- La licencia no esta indicada en la informacion disponible; no se puede confirmar el uso comercial sin consultar el repositorio del modelo base.
- El formato MLX limita el despliegue a hardware Apple; no es portable a CUDA sin conversion.
- El modelo base ya pierde algo de precision frente a Qwen3.8-27B (85,8 % frente a 86,6 % de media), y la cuantizacion anade una segunda fuente de degradacion.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la reduccion de tokens de razonamiento podria aumentar el riesgo en tareas que requieren cadenas de deduccion largas.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingue homogeneo.
- El sufijo "mtp" del nombre no esta explicado en la model card; conviene verificarlo antes de asumir capacidades adicionales.
- Repositorio con pocas descargas (258) y likes (4): no hay validacion comunitaria extensa.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/chriswessels/ThinkingCap-Qwen3.8-27B-oQ4e-mtp
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de Bottlecap AI: https://bottlecapai.com/post/thinkingcap-qwen3-8-27b/
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
