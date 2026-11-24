# ArthurZ/Inkling-2-Mini-metal-final

## Resumen

Inkling-2-Mini Metal final es una variante precuantizada del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario ArthurZ en Hugging Face. Se trata de un checkpoint denso de 16.661.707.152 parametros (aproximadamente 16,7 mil millones) orientado a inferencia en hardware Apple Silicon mediante el stack Metal. La modificacion principal consiste en almacenar las capas densas (nn.Linear) ya cuantizadas en formato Metal affine 4-bit con grupo 64, de modo que la carga no requiere cuantizacion en tiempo de ejecucion.

El modelo base es de tipo image-text-to-text, es decir, acepta entradas de imagen y texto y genera texto, con una arquitectura que combina componentes densos con expertos (MoE) cuyos pesos nativos NVFP4/MXFP8 se mantienen sin cambios. La relevancia de esta variante radica en la optimizacion del proceso de carga: segun la model card, elimina las 201 llamadas de cuantizacion en linea que requiere el checkpoint padre, reduciendo el pico de memoria de 37 GB a 18 GB y el footprint del driver tras vaciar la cache de 24,9 GiB a 17,8 GiB.

No se dispone de informacion sobre licencia, idiomas soportados ni resultados de benchmarks estandar en la informacion proporcionada. El unico dato de rendimiento publicado es una medicion de throughput en un Apple M3 Ultra con el benchmark hc_bench.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas densas y expertos (MoE); tipo inkling2_loop |
| Parametros totales | 16.661.707.152 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Capas densas en Metal affine 4-bit (grupo 64); expertos nativos NVFP4/MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 18,6 GB) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura híbrida con capas densas (nn.Linear) y bancos de expertos (MetalFp4Experts), segun se desprende de la model card. La variante publicada por ArthurZ no reentrena el modelo: parte del checkpoint padre thinkingmachines/Inkling-2-Mini y transforma unicamente el almacenamiento de las capas densas, que en el padre estan en bf16. Mediante el script make_final_inkling_checkpoint.py se cargan los pesos con un plan Metal en tiempo de ejecucion, se desactiva la fusion de hermanos durante el guardado para mantener las claves sin fusionar, y se persisten los pesos empaquetados de MetalLinear junto con sus escalas y qbiases.

La innovacion tecnica principal es la eliminacion de la cuantizacion en linea: el checkpoint padre requiere empaquetar 201 capas lineales durante la carga con un pico de 37 GB, mientras que este checkpoint ya las contiene empaquetadas y reduce el pico a 18 GB. Los expertos nativos NVFP4/MXFP8 permanecen intactos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Conversacion multi-turno (tag conversational).
- Razonamiento multimodal al combinar el procesamiento de imagenes con la generacion de texto.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Inferencia optimizada en hardware Apple Silicon mediante el stack Metal.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, capacidades multilingues especificas ni modos especiales de razonamiento en la informacion proporcionada.

## Casos de uso

- Despliegue en estaciones de trabajo Apple Silicon: el checkpoint esta disenado para cargarse con el stack stream-experts/inkling2-metal-perf y reduce el pico de memoria a 18 GB, lo que permite ejecutar un modelo de 16,7 mil millones de parametros en equipos con memoria unificada de 32 GB o superior.
- Prototipado de aplicaciones image-text-to-text en local: al aceptar entradas de imagen y texto, sirve para construir demos de descripcion de imagenes o respuesta a preguntas visuales sin depender de servicios en la nube.
- Evaluacion de pipelines de cuantizacion Metal: el checkpoint sirve como referencia para medir el impacto de la precuantizacion frente a la cuantizacion en tiempo de ejecucion, con datos concretos de pico de memoria y throughput.
- Investigacion sobre arquitecturas MoE con expertos cuantizados: los bancos NVFP4/MXFP8 intactos permiten estudiar el comportamiento de expertos de baja precision en tareas multimodales.
- Integracion en flujos de transformers personalizados: requiere la rama inkling2-metal-perf de transformers y el kernel ArthurZ/metal-moe-decode, por lo que encaja en entornos de desarrollo que ya trabajen con esa pila.
- Benchmarking de hardware: el script hc_bench.py permite reproducir mediciones de velocidad de generacion en distintos chips Apple para comparar configuraciones.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son mediciones de carga y throughput en un Apple M3 Ultra con hc_bench.py, configuracion base-4bit y 6 ejecuciones de 128 tokens:

| Metrica | Checkpoint padre + plan en runtime | Este checkpoint |
|---|---|---|
| Llamadas de cuantizacion en linea | 201 lineales | 0 |
| Driver tras empty_cache | 24,9 GiB | 17,8 GiB |
| Footprint | 18 GB | 18 GB |
| Pico de memoria | 37 GB | 18 GB |
| Throughput (tok/s) | 79,14 | 71,39 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 18 GB de footprint en inferencia con la configuracion 4-bit; pico de 18 GB segun la model card.
- Hardware validado: Apple M3 Ultra (medicion de 71,39 tok/s).
- GPU recomendadas: no hay datos para GPU NVIDIA o AMD; el checkpoint esta orientado a Apple Silicon con Metal.
- Cabe en consumer hardware: si, en equipos Apple con memoria unificada de al menos 32 GB (el pico medido es de 18 GB).
- Opciones de despliegue: transformers en la rama inkling2-metal-perf, kernel ArthurZ/metal-moe-decode (pin 8d84318f15ece7e2334a89573dcbeac1952b37e4) y el parche 0001-inkling-skip-u32-init.diff. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 71,39 tok/s en M3 Ultra con hc_bench (base-4bit, 6 x 128 tokens); el checkpoint padre alcanza 79,14 tok/s en la misma prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini Metal final (este) | 16,7 B | no disponible | Densa 4-bit Metal + expertos NVFP4/MXFP8 | no disponible | Carga sin cuantizacion en linea; 71,39 tok/s en M3 Ultra |
| thinkingmachines/Inkling-2-Mini (padre) | 16,7 B | no disponible | bf16 en capas densas + expertos NVFP4/MXFP8 | no disponible | Requiere plan Metal en runtime; 79,14 tok/s en M3 Ultra |
| Otros modelos image-text-to-text de ~16 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Dependencia estricta de una rama no estable de transformers (inkling2-metal-perf) y de un pin concreto del kernel metal-moe-decode; cualquier cambio en esas dependencias puede romper la carga.
- Requiere aplicar el parche 0001-inkling-skip-u32-init.diff; sin el, el cargador ejecuta inicializadores float sobre pesos uint32 empaquetados y lanza el error normal_kernel_mps not implemented for 'UInt32'.
- Orientado exclusivamente a hardware Apple Silicon con Metal; no hay soporte documentado para CUDA ni ROCm.
- El throughput es inferior al del checkpoint padre con plan en runtime (71,39 frente a 79,14 tok/s), aunque el pico de memoria se reduce a la mitad.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar el modelo base thinkingmachines/Inkling-2-Mini.
- Idiomas soportados no disponibles; no se puede garantizar calidad multilingue.
- Riesgo de alucinacion y sesgos: no hay informacion publicada en la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ArthurZ/Inkling-2-Mini-metal-final
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Kernel Metal MoE decode: https://huggingface.co/ArthurZ/metal-moe-decode
