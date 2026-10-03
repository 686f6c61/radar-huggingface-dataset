# skyline02/qwen36-35b-a3b-se-lora-rest

## Resumen

El modelo `skyline02/qwen36-35b-a3b-se-lora-rest` es un adaptador LoRA (PEFT) experimental publicado por el usuario skyline02 sobre los pesos oficiales de Qwen3.6-35B-A3B. No es un modelo completo, sino una segunda etapa de ajuste fino supervisado orientada a la reparación de software (software repair) en Python, entrenada a partir de parches generados y verificados por ejecución. El adaptador modifica únicamente proyecciones de atención, proyecciones de entrada/salida de las capas DeltaNet y las proyecciones gate/up/down de los expertos compartidos, dejando congelados el router, los expertos enrutados, el codificador de visión, los embeddings y la cabeza de salida.

El tamaño del adaptador es reducido en comparación con el modelo base: 21.166.080 parámetros entrenables (aproximadamente 84,76 MB), con rango 16, alpha 32 y dropout 0,05. La base sobre la que se aplica, Qwen3.6-35B-A3B, es un modelo MoE multimodal de aproximadamente 35.000 millones de parámetros totales y unos 3.000 millones activos por token, construido sobre una arquitectura de gated delta networks. Esto implica que, a pesar de que el adaptador es ligero, la inferencia requiere cargar los pesos completos del modelo base.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un experimento en curso, con un corpus de entrenamiento muy pequeño (18 ejemplos, 5 pasos de optimizador) y sin resultados de benchmarks publicados. El propio autor indica que la mejora en benchmarks no está establecida y que estos adaptadores pueden degradar el razonamiento general o el comportamiento agente. Por tanto, es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3.6-35B-A3B, MoE multimodal con gated delta networks |
| Parametros totales | 21.166.080 parametros entrenables en el adaptador (aprox. 84,76 MB); modelo base: ~35B totales |
| Parametros activos | No disponible a nivel de adaptador; modelo base: ~3B activos (256 expertos, 8 enrutados + 1 compartido) |
| Longitud de contexto | 8.192 tokens de contexto de entrenamiento; contexto del modelo base: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible para el adaptador (parametros LoRA guardados en FP32 sobre base BF16). La base admite BF16, FP8 y NVFP4 segun recetas de vLLM |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apoya en el modelo base Qwen3.6-35B-A3B, un transformer de tipo mezcla de expertos (MoE) con arquitectura de gated delta networks, disenado tanto para texto como para imagen-texto a texto (pipeline `image-text-to-text`). La base cuenta con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, distribuidos en 256 expertos, de los cuales 8 son enrutados y 1 es compartido. El adaptador LoRA congela el router, los expertos enrutados, el codificador de vision, los embeddings y la cabeza de salida, y solo entrena las proyecciones Q/K/V/O de atencion, las proyecciones de entrada/salida de DeltaNet y las proyecciones gate/up/down de los expertos compartidos.

El entrenamiento de esta segunda etapa parte de un adaptador SFT previamente seleccionado y utiliza 13 parches generados y verificados por ejecucion (procedentes de 10 tareas de entrenamiento independientes) mas 5 registros de repeticion de datos originales, sumando 18 ejemplos. Se realizo 1 epoca y 5 pasos de optimizador, con un total de 4.241 tokens supervisados de los que el 30 % corresponde a la porcion de repeticion. La perdida de desarrollo final fue de 0,3352, ligeramente peor que la del SFT previo. La configuracion es: base en BF16, parametros LoRA guardados en FP32, rango 16, alpha 32, dropout 0,05, contexto de 8.192 tokens, microbatch 1 con acumulacion 4, semilla 42, entropia cruzada solo sobre la completacion y gradient checkpointing. El aprendizaje SFT usa un learning rate de 5e-5 y el SFT continuado con retroalimentacion de ejecucion usa 1e-5.

El corpus se extrae de commits de reparacion de repositorios Python con licencias permisivas y de pruebas unitarias prospectivas. Entre las fuentes figuran click, attrs, tomlkit, markupsafe, itsdangerous, packaging, tomli, h11, hpack, hyperframe, boltons y more-itertools. Los datos incluyen hashes de licencia historicos, pruebas estables que fallan antes y pasan despues, resultados de regresion, deduplicacion exacta y casi exacta de parches, datos de desarrollo disjuntos por repositorio y exclusiones de repositorios/firmas de entrada de benchmarks. Ni las respuestas de benchmark, ni los parches de referencia, ni las pruebas ocultas se usaron como entrada de entrenamiento o seleccion. La generacion directa de propuestas para los datos de la segunda etapa desactiva el modo pensamiento, mientras que la inferencia de benchmark lo activa.

## Capacidades

- Generacion de parches de reparacion de software en Python, orientada a la localizacion de la fuente del fallo y a la propuesta de cambios.
- Razonamiento sobre pruebas unitarias (failing-before/passing-after) como senal de correccion.
- Capacidades heredadas del modelo base Qwen3.6-35B-A3B: generacion de texto, razonamiento de contexto largo, codigo y capacidad multimodal imagen-texto a texto.
- Soporte de tool calling / function calling: no disponible de forma especifica en la informacion proporcionada para el adaptador (depende de la base).
- Soporte de agentes y razonamiento multi-paso: el autor advierte que estos adaptadores pueden reducir el rendimiento general de razonamiento o agente.
- Modo pensamiento: la base lo soporta; el autor recomienda `enable_thinking=True` y `preserve_thinking=True` en inferencia de benchmark.
- Multilingue: limitado a `en` segun los metadatos del repositorio.
- Capacidad de vision: heredada de la base, ya que el pipeline declarado es `image-text-to-text`, aunque el adaptador no entrena el codificador de vision.

## Casos de uso

- Reparacion automatica de fallos en proyectos Python: el adaptador se aplica sobre Qwen3.6-35B-A3B para proponer parches tras un fallo de pruebas unitarias, usando el patron de localizacion de codigo aprendido en repositorios como click, attrs o packaging. Adecuado como prototipo de investigacion, no como herramienta de produccion.
- Investigacion en aprendizaje por retroalimentacion de ejecucion: sirve para estudiar como un adaptador LoRA de baja capacidad puede ajustarse a partir de senales de ejecucion verificadas, con un coste de entrenamiento minimo (5 pasos de optimizador).
- Estudio de adaptadores sobre arquitecturas MoE con gated delta networks: util para analizar como se comporta el ajuste LoRA cuando solo se entrenan proyecciones especificas (Q/K/V/O, DeltaNet y expertos compartidos) con el resto congelado.
- Reproduccion de experimentos de reparacion de software: el repositorio documenta la revision inmutable del modelo base, la pila de entrenamiento y la configuracion, lo que permite reproducir el pipeline SFT con Python 3.12, torch 2.12.1, transformers 5.18.0, peft 0.21.2 y accelerate 1.15.0.
- Generacion de candidatos de parche para triaje humano: dado su bajo coste de adaptacion, puede usarse para generar propuestas que un desarrollador revise manualmente, siempre que se asuma su baja fiabilidad (14 de 276 propuestas aceptadas en la segunda etapa antes de deduplicacion).
- Evaluacion comparativa de adaptadores para ingenieria de software: sirve como linea base negativa o de control en estudios que comparen adaptadores LoRA especializados frente a un SFT mas amplio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion completa de tres versiones y cuatro benchmarks esta en curso y que la mejora en benchmarks no ha sido establecida. La perdida de desarrollo (0,3352) no equivale a una puntuacion de benchmark. Como dato de rendimiento interno, la aceptacion de ejecucion en la segunda etapa fue de 14 de 276 propuestas antes de la deduplicacion.

## Requisitos de hardware

- El adaptador es muy ligero (aproximadamente 84,76 MB), pero la inferencia exige cargar los pesos completos del modelo base de ~35B parametros totales.
- VRAM estimada para la base: aproximadamente 70 GB en BF16, en torno a 35 GB en FP8 y cerca de 17-18 GB en cuantizaciones de 4 bits (NVFP4). Estas cifras son estimaciones basadas en el numero de parametros y deben verificarse con cada motor de inferencia.
- GPU recomendadas: A100, H100 o similares de datacenter para BF16 sin cuantizar. Para cuantizacion de 4 bits, tarjetas consumer como RTX 3090, RTX 4090 o RTX 5070 Ti con 16-24 GB.
- Si cabe en GPU consumer: si, con cuantizacion, en GPUs de 16-24 GB como las citadas; la informacion de busqueda menciona configuraciones con RTX 3090, 4090, 5070 Ti, dual 5060 Ti y M3 Ultra.
- Opciones de despliegue: vLLM (version >= 0.17.0, NVFP4 requiere >= 0.28.0) con ejecucion de adaptador en BF16; el autor valida la evaluacion con vLLM 0.30.0. Otras opciones como llama.cpp u Ollama dependen de la conversion del modelo base y no se detallan para el adaptador.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

El adaptador no es directamente comparable con modelos completos, ya que requiere cargar el modelo base Qwen3.6-35B-A3B. La comparacion mas util es entre la base y sus alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base de este adaptador) | ~35B totales, ~3B activos | No disponible en la informacion proporcionada | Sin datos de benchmark en la informacion disponible | No disponible en la informacion proporcionada | Pesos abiertos (BF16, FP8, NVFP4) |
| Qwen3.5 (modelo mayor de la familia) | Mayor que 35B | No disponible | No disponible | No disponible | Pesos abiertos |
| Adaptador `qwen36-35b-a3b-se-lora-rest` | 21,2 M entrenables sobre base de ~35B | 8.192 tokens de entrenamiento | Sin benchmarks publicados; perdida de desarrollo 0,3352 | apache-2.0 | Pesos publicos, sin gating |

No se dispone de datos suficientes para comparar con modelos de reparacion de software especificos (por ejemplo, Codex o Code Llama en variantes especializadas) en terminos de benchmark, ya que no hay resultados publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Se trata de un adaptador experimental; la propia model card lo etiqueta como `experimental`.
- La mejora en benchmarks no esta establecida y la evaluacion completa esta en curso.
- Dataset de entrenamiento muy reducido: 18 ejemplos, 1 epoca, 5 pasos de optimizador y 4.241 tokens supervisados.
- La perdida de desarrollo (0,3352) es ligeramente peor que la del SFT previo, lo que sugiere una posible regresion.
- La tasa de aceptacion de ejecucion fue baja: 14 de 276 propuestas en la segunda etapa antes de la deduplicacion.
- El autor advierte que estos adaptadores pueden reducir el razonamiento general o el rendimiento en tareas de agente.
- El corpus se limita a Python y a repositorios concretos, por lo que la generalizacion a otros lenguajes es limitada.
- El unico idioma declarado es `en`.
- Se desconoce la contaminacion durante el preentrenamiento de la base.
- Riesgo de alucinacion y de parches incorrectos: la senal de verificacion es por ejecucion, pero el modelo puede proponer cambios que no compilen o que rompan regresiones.
- Licencia: el adaptador se publica bajo Apache-2.0, pero los avisos de licencia de los datos fuente se conservan en la documentacion de los datos del experimento; conviene revisarlos antes de un uso comercial.
- Para produccion, no se recomienda su uso sin una evaluacion independiente y sin verificar la revision inmutable del adaptador.

## Enlaces

- HuggingFace: https://huggingface.co/skyline02/qwen36-35b-a3b-se-lora-rest
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Receta de vLLM para Qwen3.6-35B-A3B: https://recipes.vllm.ai/Qwen/Qwen3.6-35B-A3B
- Guia de uso de Qwen3.5 y Qwen3.6 en vLLM: https://docs.vllm.ai/projects/recipes/en/stable/Qwen/Qwen3.5.html
- Analisis y especificaciones de Qwen3.6-35B: https://www.progressiverobot.com/2026/04/17/qwen3-6-35b/
- Guia para ejecutar Qwen3.6-35B MoE en local: https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
