# iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM

## Resumen

Qwen3.5-9B-NVFP4-W4A16-EdgeLLM es una cuantizacion del modelo multimodal Qwen/Qwen3.5-9B publicada por el usuario iamtalharazzaq. El checkpoint aplica cuantizacion NVFP4 (formato de punto flotante de 4 bits definido por NVIDIA) sobre las capas lineales del backbone, manteniendo las activaciones en FP16 durante la inferencia, lo que se conoce como esquema W4A16. El objetivo es reducir el peso del modelo de aproximadamente 19 GB en BF16 a 8,5 GB, incluyendo la torre de vision, para poder desplegarlo en dispositivos con memoria limitada como la plataforma Jetson Thor.

El modelo conserva la arquitectura original de Qwen3.5-9B, un transformer multimodal con pipeline image-text-to-text y 10.548.588.272 parametros totales segun los safetensors del repositorio. La cuantizacion se realizo con NVIDIA ModelOpt 0.45.0 a traves de la herramienta `tensorrt-edgellm` 0.11.1, y el checkpoint esta pensado para ejecutarse con el runtime TensorRT Edge-LLM, no con transformers estandar, aunque el repositorio declara `library_name: transformers` por compatibilidad de metadatos.

Su relevancia actual radica en que demuestra que un modelo de 9B con capacidades multimodales puede mantener una precision competitiva en tareas estructuradas de planificacion de herramientas tras una cuantizacion agresiva a 4 bits, con resultados que igualan o superan ligeramente al modelo sin cuantizar en la tarea evaluada por el autor. La licencia Apache 2.0 heredada del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-9B; backbone con 200 capas lineales cuantizadas |
| Parametros totales | 10.548.588.272 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (la calibracion uso secuencias de hasta 3.584 tokens) |
| Tipos de cuantizacion | NVFP4 W4A16: pesos E2M1 con bloque de 16, escalas de bloque FP8 E4M3 y escala global FP32; LM head en FP8; torre de vision, embeddings y norms en BF16; el checkpoint tambien incluye escalas de activacion para W4A4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de 8,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal que procesa entradas de imagen y texto. La intervencion del autor no reentrena el modelo: aplica cuantizacion post-entrenamiento con NVIDIA ModelOpt 0.45.0 mediante el comando `tensorrt-edgellm quantize`. Las 200 capas lineales del backbone se convierten a NVFP4 con cuantizacion por bloques de 16 elementos, escalas de bloque en FP8 E4M3 y una escala global FP32. El LM head se mantiene en FP8, mientras que la torre de vision, los embeddings y las capas de normalizacion permanecen en BF16 sin cuantizar.

La calibracion se realizo con 64 prompts de tarea orientados a planificacion de herramientas en JSON, con longitud completa de hasta 3.584 tokens y algoritmo `max`. El checkpoint resultante ocupa 8,5 GB e incluye la torre de vision. El esquema de inferencia previsto es W4A16 (pesos de 4 bits, activaciones FP16), que en Jetson Thor (SM110) activa el plugin `Nvfp4A16BlackwellGemmPlugin`. Si no se pasa el flag `--no-quantize-activations` al exportar o construir, Edge-LLM ejecuta el checkpoint como W4A4, lo que segun el autor degrada la precision en su tarea objetivo.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados del modelo base Qwen3.5-9B.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), con torre de vision en BF16.
- Generacion de salida estructurada en JSON, validada con decodificacion guiada por esquema (guided decoding); el autor reporta JSON valido en el 100% de los casos evaluados.
- Planificacion de herramientas (tool planning): seleccion de herramienta y argumentos en formato JSON estructurado.
- Modo thinking desactivable; las pruebas del autor se realizaron con thinking off y temperatura 0.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Planificacion de herramientas en agentes locales: el modelo genera JSON con nombre de herramienta y argumentos validos contra un esquema, lo que permite integrarlo como planificador en un agente que corre en dispositivo. El autor valida esta tarea con un 77,1% de acierto en 367 casos.
- Despliegue en dispositivos edge con memoria limitada: con 8,5 GB de checkpoint y pesos de 4 bits, cabe en plataformas como Jetson Thor, donde un checkpoint BF16 de aproximadamente 19 GB no seria viable.
- Asistentes multimodales embebidos: al conservar la torre de vision en BF16, puede procesar imagenes junto a texto en aplicaciones de asistencia sobre camara o capturas de pantalla en hardware de borde.
- Extraccion de datos estructurados: la combinacion de guided decoding con JSON schema y el modo thinking off lo hace adecuado para convertir texto libre en registros JSON con campos fijos en pipelines de ingestion.
- Prototipado de bajo coste en una sola GPU consumer o workstation: el checkpoint reducido permite experimentar con un modelo de 9B multimodal en GPUs con 16-24 GB de VRAM usando el runtime Edge-LLM.
- Evaluacion de cuantizacion NVFP4 en produccion: sirve como referencia para medir la perdida de precision de NVFP4 W4A16 frente a BF16 y a GGUF Q4_K_M en tareas estructuradas, con datos comparativos publicados por el autor.
- Automatizacion de tareas de vision y lenguaje en entornos con restricciones termicas y de energia, donde priman el tamano del modelo y la eficiencia del formato NVFP4 sobre el throughput bruto.

## Benchmarks y rendimiento

Tarea de planificacion estructurada de herramientas (salida JSON con esquema, temperatura 0, thinking off, guided decoding, RTX PRO 6000 Blackwell):

| Modelo | Casos | Herramienta y argumentos correctos |
|---|---|---|
| Este modelo, Edge-LLM, W4A16 | 60 | 78,3% |
| Este modelo, Edge-LLM, W4A16 | 367 | 77,1% |
| Qwen3.5-9B sin cuantizar, Edge-LLM | 60 | 76,7% |
| Qwen3.5-9B Q4_K_M GGUF, llama.cpp | 60 | 75,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 8,5 GB; con activaciones FP16 y cache KV para contexto largo, se estima un uso de memoria en el rango de 10-14 GB, aunque no se dispone de una cifra oficial.
- GPU recomendadas: el autor valida en RTX PRO 6000 Blackwell para las pruebas y apunta a Jetson Thor (SM110) como plataforma objetivo; el plugin `Nvfp4A16BlackwellGemmPlugin` sugiere dependencia de arquitecturas Blackwell.
- GPU consumer: no confirmado; el soporte NVFP4 en GPUs consumer depende de la generacion (Blackwell) y del runtime Edge-LLM, no de transformers estandar.
- Opciones de despliegue: TensorRT Edge-LLM 0.11.1 (`tensorrt-edgellm`, `tensorrt-edgellm-serve`); no se valida vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible. El autor advierte que `tensorrt-edgellm-serve` 0.11.1 no expone `--no-quantize-activations`, por lo que para servir con activaciones FP16 hay que parchear `experimental.builder.core.quantization._activation_quant_type`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Rendimiento en tarea del autor |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-9B NVFP4 W4A16) | 10,55B | no disponible | NVFP4 W4A16, safetensors, 8,5 GB | Apache 2.0 | 78,3% (60 casos) / 77,1% (367 casos) |
| Qwen3.5-9B sin cuantizar | no disponible | no disponible | BF16 | Apache 2.0 | 76,7% (60 casos) |
| Qwen3.5-9B Q4_K_M GGUF | no disponible | no disponible | GGUF Q4_K_M, llama.cpp | Apache 2.0 | 75,0% (60 casos) |
| Qwen3.5-9B-NVFP4-onnx (mismo autor) | no disponible | no disponible | ONNX NVFP4, 13,5 GB | Apache 2.0 | no disponible |

## Limitaciones y advertencias

- Solo se valido la ruta NVFP4 W4A16; el autor reporta salidas incorrectas con INT4 AWQ de grupo 32 o 64, INT4 mezclado con capas FP8 y NVFP4 con busqueda de escalas `local_hessian` de ModelOpt en Edge-LLM 0.11.1.
- Ejecutar el checkpoint sin el flag `--no-quantize-activations` lo convierte en W4A4, lo que degrada la precision en la tarea evaluada.
- Dependencia fuerte del runtime TensorRT Edge-LLM y de hardware Blackwell (Jetson Thor, SM110); no hay evidencia de funcionamiento en vLLM, llama.cpp u otros motores.
- La calibracion se hizo con 64 prompts de una unica tarea (planificacion de herramientas en JSON), por lo que la calidad fuera de ese dominio no esta medida y puede degradarse mas que en la tarea reportada.
- El repositorio declara `library_name: transformers` pero el checkpoint esta pensado para Edge-LLM; cargarlo con transformers estandar puede no funcionar o no reproducir los resultados.
- No hay datos publicados de sesgos, tasas de alucinacion, cobertura idiomatica ni longitud de contexto del modelo base en la informacion disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente sin validacion independiente de la comunidad.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del checkpoint cuantizado en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/iamtalharazzaq/Qwen3.5-9B-NVFP4-W4A16-EdgeLLM
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Variante ONNX NVFP4 del mismo autor: https://huggingface.co/iamtalharazzaq/Qwen3.5-9B-NVFP4-onnx
- Repositorio TensorRT Edge-LLM: no disponible
- Paper o blog tecnico: no disponible
