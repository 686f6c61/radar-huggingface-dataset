# scottlowry/Qwen3.6-35B-A3B-oQ6e-fp16-mtp

## Resumen
Qwen3.6-35B-A3B-oQ6e-fp16-mtp es una cuantizacion mixta del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de un checkpoint de pesos cuantizados en formato MLX (Apple Silicon) mediante la herramienta oQ de oMLX v0.7.3.dev2, con una precision efectiva media de 6,945 bits por peso. El modelo resultante ocupa 31,2 GB en disco (29,07 GiB) y conserva la cabeza MTP (multi-token prediction) del modelo original, lo que permite decodificacion especulativa.

El modelo base pertenece a la familia Qwen3.6 y emplea una arquitectura MoE (mezcla de expertos) con 35.951.822.704 parametros totales y 3B de parametros activos, segun el nombre del checkpoint. Incluye un componente de vision de 0,447B de parametros y una cabeza MTP de 0,845B, lo que indica capacidades multimodales y de prediccion multi-token. La cuantizacion mantiene en FP32 los tensores mas sensibles (0,447B de pesos) y en FP16 una fraccion minima (0,031B).

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de 35B con vision en equipos Apple Silicon con memoria unificada, algo inviable con los pesos originales en BF16. Al estar publicada en octubre de 2026 y actualizada en noviembre del mismo ano, es una opcion reciente para inferencia local en macOS. La informacion disponible sobre el modelo base (licencia, idiomas, benchmarks) es limitada en la fuente proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con vision y cabeza MTP (segun tags y desglose de pesos) |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | 3B (segun nombre del checkpoint, no verificado en la fuente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 y 128, affine 8-bit grupo 64 y 128, FP16 y FP32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantizacion oQ |
| Precision efectiva media | 6,945 bits/peso |
| Tamano del repo | 62,2 GB |
| Tamano del checkpoint | 31,211 GB (29,067 GiB) |
| Desglose: modelo de lenguaje | 34,661B parametros, 28,720 GB |
| Desglose: vision | 0,447B parametros, 1,786 GB |
| Desglose: cabeza MTP | 0,845B parametros, 0,704 GB |
| Libreria | mlx |
| Modelo base | Qwen/Qwen3.6-35B-A3B |

## Arquitectura y entrenamiento
El checkpoint es una cuantizacion del modelo Qwen3.6-35B-A3B, que segun los tags y el desglose de pesos emplea una arquitectura de mezcla de expertos (qwen3_5_moe) con un submodulo de vision y una cabeza de prediccion multi-token (MTP). Los parametros activos indicados en el nombre son 3B, lo que situaria al modelo en la categoria de MoE disperso con una relacion de activacion aproximada de 1:12 respecto al total. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card del checkpoint cuantizado no los detalla.

La innovacion tecnica principal de esta publicacion es el esquema de cuantizacion mixta de oQ (oMLX v0.7.3.dev2). La distribucion de bits es asimetrica: el 91,838% de los pesos logicos (33,018B) se almacena en affine 6-bit con grupo 64 (6,50 bits efectivos), mientras que un 5,774% (2,076B) se mantiene en affine 8-bit grupo 64 (8,50 bits efectivos) y un 1,242% (0,447B) en FP32, presumiblemente correspondiente a capas sensibles del codificador de vision. La cabeza MTP se conserva para habilitar decodificacion especulativa, una tecnica que acelera la generacion al predecir varios tokens por paso. El checkpoint fue re-cuantizado el 25 de octubre de 2026, por lo que versiones anteriores deben descartarse.

## Capacidades
- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B, si bien no se detallan en la fuente.
- Procesamiento de vision: el checkpoint incluye 0,447B de parametros de vision en FP32, lo que sugiere soporte de entrada de imagenes.
- Prediccion multi-token (MTP): la cabeza dedicada de 0,845B permite decodificacion especulativa y generacion acelerada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso
- Inferencia local en Apple Silicon: el checkpoint de 31,2 GB cabe en equipos con 64 GB o mas de memoria unificada (Mac Studio, MacBook Pro M3/M4 Max), permitiendo ejecutar un MoE de 35B con vision sin GPU dedicada. Es el caso de uso principal de un modelo en formato MLX.
- Prototipado de asistentes multimodales en macOS: la inclusion del modulo de vision en FP32 permite experimentar con tareas de imagen-a-texto en local, sin depender de APIs en la nube, aunque el rendimiento concreto no este documentado.
- Generacion acelerada con decodificacion especulativa: la cabeza MTP conservada permite implementar decodificacion multi-token en MLX, reduciendo la latencia por token en comparacion con un checkpoint sin MTP.
- Evaluacion de tecnicas de cuantizacion mixta: el checkpoint sirve como referencia para estudiar el impacto de una distribucion asimetrica de bits (6-bit mayoritario, 8-bit y FP32 selectivos) sobre la calidad del modelo base.
- Desarrollo de aplicaciones de escritorio offline: al no requerir red, el modelo puede integrarse en herramientas de macOS que procesen texto e imagenes de forma privada.
- Investigacion sobre MoE disperso: con 3B de parametros activos sobre 35,9B totales, es util para medir el equilibrio entre calidad y coste computacional en entornos con memoria limitada.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint cuantizado no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base en BF16, por lo que no es posible cuantificar la perdida de calidad introducida por la cuantizacion.

## Requisitos de hardware
- VRAM/memoria unificada estimada: aproximadamente 31,2 GB solo para los pesos; con overhead de contexto y cache KV, se recomienda un minimo de 48 GB y, de forma realista, 64 GB o mas de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada de 64 GB o superior (M2 Ultra, M3 Max, M4 Max, M3/M4 Ultra). No es compatible de forma nativa con CUDA, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? Si, en equipos Apple con 64 GB o mas. No cabe en GPUs de consumo con 24 GB (RTX 4090) sin conversion de formato y cuantizacion adicional.
- Opciones de despliegue: MLX (libreria nativa), mlx-lm y herramientas compatibles con oQ/oMLX. No es directamente utilizable en vLLM, llama.cpp, Ollama o TGI sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottlowry/Qwen3.6-35B-A3B-oQ6e-fp16-mtp | 35,95B (3B activos) | no disponible | MLX safetensors, 6,945 bits/peso | no disponible | Hugging Face, 267 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95B (3B activos) | no disponible | safetensors BF16 | no disponible | Hugging Face |
| Otros checkpoints cuantizados del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de otros autores en la misma categoria (MoE de ~35B con vision y cuantizacion MLX), por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias
- La cuantizacion a 6,945 bits/peso puede degradar la calidad respecto al modelo base en BF16; no se han publicado evaluaciones que cuantifiquen esta perdida.
- El checkpoint esta en formato MLX y solo es utilizable en Apple Silicon; no es portable a CUDA sin conversion.
- La licencia no esta indicada en la fuente, por lo que no se puede confirmar si el uso comercial esta permitido. Es imprescindible consultar la licencia del modelo base Qwen/Qwen3.6-35B-A3B antes de cualquier despliegue en produccion.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o cobertura idiomatica del modelo base en la informacion proporcionada.
- El autor indica que el checkpoint fue re-cuantizado el 25 de octubre de 2026; copias anteriores pueden ser defectuosas y deben descartarse.
- El modelo tiene solo 1 like y 267 descargas, lo que indica una validacion comunitaria muy limitada.
- El tamano del repo (62,2 GB) duplica el del checkpoint (31,2 GB), probablemente por artefactos de cuantizacion o duplicados; conviene revisar los archivos antes de descargar.

## Enlaces
- Hugging Face: https://huggingface.co/scottlowry/Qwen3.6-35B-A3B-oQ6e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta oQ/oMLX: https://github.com/jundot/omlx
