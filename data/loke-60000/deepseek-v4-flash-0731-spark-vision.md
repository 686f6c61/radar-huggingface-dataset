# Loke-60000/deepseek-v4-flash-0731-spark-vision

## Resumen

DeepSeek V4 Flash 0731 Spark Vision es un modelo multimodal de visión y lenguaje creado por Loke-60000 que añade entrada de imágenes al backbone DeepSeek-V4-Flash-0731 para ejecutarse en un único NVIDIA DGX Spark. El proyecto resuelve un problema concreto: el modelo original, con 167 GB de pesos, no cabía en los 128 GB de memoria unificada del DGX Spark, por lo que se aplicó una poda REAP que reduce los expertos enrutados de 256 a 216 y una cuantización con ExLlamaV3 que deja los pesos en 93 GiB residentes. Sobre ese backbone se inserta una torre de visión DeepEncoderV2 y un proyector que inyecta los embeddings de imagen en el token 129279.

La relevancia de esta ficha radica en que documenta un despliegue real de visión en hardware de borde con cuantización agresiva, incluyendo la corrección de un fallo de arranque en vLLM relacionado con el stride de la caché KV en modo de perfilado. El modelo alcanza un solapamiento medio del 40,8% en palabras de contenido frente a subtítulos humanos de COCO, con un 60% de las imágenes reconocibles como la misma escena. El contexto de texto llega a 262 144 tokens, aunque con visión se reduce drásticamente la caché KV disponible y solo se procesa una secuencia a la vez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 256 expertos enrutados, 216 activos tras poda REAP; atención MLA (Multi-head Latent Attention); torre de visión DeepEncoderV2 con proyector; módulo de decodificacion especulativa |
| Parametros totales | no disponible (el backbone original pesa 167 GB en precision nativa; no se indica el numero de parametros) |
| Parametros activos | no disponible (216 de 256 expertos enrutados tras poda REAP) |
| Longitud de contexto | 262 144 tokens en modo texto; con vision, una sola secuencia con 55 614 tokens de caché KV |
| Tipos de cuantizacion | ExLlamaV3 para pesos; caché KV en NVFP4 (nvfp4_ds_mla) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (torre y proyector); backbone cuantizado con ExLlamaV3 |

## Arquitectura y entrenamiento

El modelo parte del backbone DeepSeek-V4-Flash-0731, una arquitectura MoE con atención MLA y decodificacion especulativa, que segun el fabricante supera a DeepSeek-V4-Pro en varios benchmarks con menos parametros activos. Sobre ese backbone, Loke-60000 aplica una poda REAP que reduce los expertos enrutados de 256 a 216 y una cuantizacion con ExLlamaV3 que baja los pesos de 167 GB a 93 GiB. La entrada de vision se incorpora mediante una torre DeepEncoderV2 y un proyector que inserta los embeddings de imagen en el token 129279.

El proyector es un checkpoint de desarrollo del paso 4800 entrenado contra el modelo 0731 sin podar, no contra esta version podada y cuantizada, lo que limita la calidad final de vision. El despliegue usa vLLM y requirio corregir un fallo de arranque en el kernel b12x: durante el perfilado de memoria, vLLM asigna una caché KV dummy contigua de 64 bloques por 584 bytes (37376 bytes), mientras que el kernel espera paginas redondeadas al limite MLA de 576 bytes (37440 bytes). El parche acepta el tensor de perfilado y lo rellena con ceros, sin afectar a la inferencia real. La model card advierte explicitamente de no desactivar `VLLM_DSV4_PADDED_NVFP4`, porque el servidor arranca pero produce respuestas fluidas pero sin sentido.

## Capacidades

- Vision y lenguaje: describe imagenes y genera subtitulos de una frase, identificando escenas y objetos principales.
- Generacion de texto: hereda las capacidades del backbone DeepSeek-V4-Flash-0731, que incluyen razonamiento, codigo y matematicas, aunque la ficha no documenta benchmarks especificos de estas tareas.
- Razonamiento multimodal: combina imagen y texto en una misma conversacion, con entrada de imagen en base64 via API compatible con OpenAI.
- Soporte de tool calling y agentes: no documentado en la ficha.
- Capacidades multilingues: no documentadas.
- OCR limitado: reconoce la forma, el color y la ubicacion de los carteles, pero no lee el texto con precision (por ejemplo, lee "DOLS" en lugar de la palabra real).

## Casos de uso

- Generacion de subtitulos para accesibilidad: el modelo puede describir fotografias en una sola frase, lo que permite integrarlo en aplicaciones de asistencia para personas con discapacidad visual, aunque la calidad es media (40,8% de solapamiento con subtitulos humanos).
- Anotacion automatica de datasets de imagenes: con una tasa de reconocimiento de escena del 60%, sirve para preetiquetar imagenes en pipelines de curado de datos, siempre que un humano revise los resultados.
- Analisis de escenas en entornos controlados: en configuraciones de una sola secuencia y con contexto reducido, puede identificar objetos y composiciones en fotos de producto o vigilancia estatica.
- Moderacion de contenido visual: detecta la presencia de objetos o escenas concretas (personas, vehiculos, animales) a partir de una descripcion generada, aunque no es fiable para OCR ni para detalles finos.
- Demostraciones y evaluacion de poda y cuantizacion: sirve como banco de pruebas para medir el impacto de REAP y ExLlamaV3 en tareas de vision, comparando el solapamiento de COCO antes y despues de la optimizacion.
- Investigacion en despliegue multimodal en hardware de borde: documenta como ejecutar un modelo de 167 GB en un DGX Spark de 128 GB, incluyendo el parche de vLLM necesario, util para equipos que trabajen con configuraciones similares.

## Benchmarks y rendimiento

La ficha no publica benchmarks estandar (MMLU, HumanEval, GSM8K), pero incluye una medicion propia sobre 20 imagenes de COCO val2017 con decodificacion greedy, comparando el solapamiento de palabras de contenido con el mejor de cinco subtitulos humanos de referencia:

| Metrica | Valor |
|---|---|
| Solapamiento medio de palabras de contenido | 40,8% |
| Imagenes con solapamiento >= 30% (misma escena reconocible) | 60% |

La model card incluye ejemplos reales: "A laptop computer sits on a desk with a mouse and keyboard" (100% de solapamiento), "A kitchen with a white refrigerator and a wooden cabinet" (75%), "A man in a red jacket is skiing down a snowy hill" (60%), y un caso fallido con dos corredores (0%). El autor advierte que estos numeros provienen de configuraciones de prueba distintas a las de una version experimental anterior, por lo que la comparacion es solo direccional.

## Requisitos de hardware

- Hardware objetivo: un NVIDIA DGX Spark con 128 GB de memoria unificada; los pesos ocupan 93,01 GiB residentes.
- VRAM estimada: 93,01 GiB para los pesos mas la caché KV; en modo vision se reservan 55 614 tokens de caché KV y se procesa una sola secuencia a la vez.
- GPU recomendadas: DGX Spark (128 GB); no cabe en GPUs de consumo como RTX 4090 (24 GB) ni en GPUs profesionales de 48-80 GB sin cuantizacion adicional o poda mas agresiva.
- Despliegue: vLLM como servidor, con entrada de imagen en base64 via API compatible con OpenAI; la configuracion usa `MAX_MODEL_LEN=32768`, `MAX_NUM_SEQS=1` y `GPU_MEMORY_UTILIZATION=0.92`.
- Latencia y throughput: no medidos; el ejemplo de la model card usa un timeout de 280 segundos por peticion, lo que sugiere latencias altas para descripcion de imagenes.
- Nota de configuracion: el entrypoint sobrescribe `KV_CACHE_DTYPE` y `VLLM_DSV4_PADDED_NVFP4` con un `export` sin valores por defecto, y el servidor siempre escucha en el puerto 8000 ignorando `VLLM_PORT`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Vision | Despliegue | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 Spark Vision (este) | MoE 216/256 expertos, cuantizado ExLlamaV3 | 262 144 texto; 55 614 KV con vision | Si (DeepEncoderV2) | DGX Spark, vLLM | MIT |
| DeepSeek-V4-Flash-0731 (base) | MoE 256 expertos, sin poda | 262 144 | No | Multi-GPU, vLLM | MIT |
| 0xSero/deepseek-v4-flash-0731-spark | MoE podado REAP, cuantizado | 262 144 | No | DGX Spark, vLLM | MIT |

No hay datos comparativos de rendimiento con otros modelos de vision-lenguaje (por ejemplo, Qwen2.5-VL o InternVL) en la informacion disponible. La comparacion se limita a caracteristicas cualitativas: este modelo es el unico de la familia que anade vision sobre el backbone podado y cuantizado, a costa de reducir el contexto y limitar el despliegue a una secuencia.

## Limitaciones y advertencias

- OCR fino no disponible: el modelo lee la forma, el color y la ubicacion de los carteles, pero distorsiona las letras (ejemplo real: "DOLS" en lugar de la palabra correcta).
- Proyector desajustado: el proyector de vision es un checkpoint de desarrollo (paso 4800) entrenado contra el modelo sin podar, no contra esta version podada y cuantizada, lo que limita la calidad de vision.
- Contexto reducido con vision: la caché KV cae de 265 066 tokens en modo texto a 55 614 tokens con vision, y solo se procesa una secuencia a la vez.
- Riesgo de respuestas sin sentido: desactivar `VLLM_DSV4_PADDED_NVFP4` hace que el servidor arranque pero genere texto fluido e incorrecto; la model card recomienda probar con una pregunta de texto antes de confiar en respuestas de imagen.
- Trampas de configuracion: el entrypoint sobrescribe `KV_CACHE_DTYPE` y `VLLM_DSV4_PADDED_NVFP4` con `export` sin valores por defecto, y el puerto 8000 se fija independientemente de `VLLM_PORT`.
- Sesgos y alucinaciones: no documentados en la ficha; dado el bajo solapamiento medio (40,8%), es esperable que las descripciones contengan errores de objeto o escena.
- Restricciones de licencia: licencia MIT, sin restricciones comerciales conocidas, aunque el modelo base DeepSeek puede tener condiciones adicionales no detalladas en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Loke-60000/deepseek-v4-flash-0731-spark-vision
- Version experimental previa: https://huggingface.co/Loke-60000/deepseek-v4-flash-0731-spark-vision-exp
- Modelo base DeepSeek-V4-Flash-0731: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio en GitHub: https://github.com/Loke-60000/deepseek-v4-flash-spark-vision
- Ficha en ModelScope del modelo base: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
- Documentacion en DeepWiki: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
