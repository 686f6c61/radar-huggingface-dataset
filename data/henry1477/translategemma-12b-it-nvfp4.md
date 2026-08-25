# henry1477/translategemma-12b-it-NVFP4

## Resumen

`henry1477/translategemma-12b-it-NVFP4` es una cuantización NVFP4 (W4A4) del modelo de traducción `google/translategemma-12b-it`, creada por el usuario henry1477 y publicada en Hugging Face. El modelo base, TranslateGemma 12B IT, pertenece a la familia TranslateGemma de Google, construida sobre Gemma 3, y está especializado en traducción automática entre 55 idiomas. Esta variante cuantizada elimina la torre de visión SigLIP y el proyector multimodal, reduciendo los parámetros de 12,19B a 11,77B, y se destina específicamente a la traducción de subtítulos con formato JSON estructurado.

La relevancia de este checkpoint radica en su optimización para inferencia en GPUs Blackwell (sm_120) mediante vLLM, donde alcanza velocidades de hasta 102 tokens por segundo en lote, frente a los 2,9 tok/s de una decodificación con offload de CPU en transformers. La cuantización NVFP4 usa pesos y activaciones de 4 bits con grupo de tamaño 16, y la calibración de las escalas de activación se realizó con datos reales de subtítulos, no con chat genérico en inglés. Sin embargo, la model card advierte de un fallo estructural importante: la variante W4A4 pierde el formato JSON de salida en la mayoría de los casos, por lo que se recomienda usar la variante A16 si el caso de uso depende de un formato de salida específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3ForCausalLM (text-only, sin torre de vision) |
| Parametros totales | 11.766.034.176 (11,77B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ejemplo de uso con max_model_len=4096) |
| Tipos de cuantizacion | NVFP4 (W4A4), pesos y activaciones de 4 bits, grupo 16 |
| Idiomas soportados | no disponible (el modelo base soporta 55 idiomas) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo `google/translategemma-12b-it` en su revisión `d1b225e1caa17f1ddc7e62065d8637d0923f34e2`, producida con la librería `llm-compressor` de vLLM. La arquitectura resultante es `Gemma3ForCausalLM` con la torre de visión SigLIP y el proyector multimodal eliminados por completo, no solo ignorados: esto reduce el peso de 12,19B a 11,77B parámetros y libera aproximadamente 0,8 GiB de VRAM para la caché KV, que es el factor limitante de concurrencia en una GPU de 16 GB.

La cuantización aplica el esquema NVFP4 (W4A4) a todas las capas lineales excepto `lm_head`, que se excluye porque Gemma3 ata esta capa a la tabla de embeddings. Las escalas de activación se calibraron con datos del dominio de subtítulos: arrays JSON de diálogos con la forma exacta que recibe el decodificador en producción, en lugar de datos de chat en inglés. Esta calibración en dominio mejora parcialmente la adherencia al formato JSON, pero no la resuelve por completo, como se detalla en la sección de benchmarks.

## Capacidades

- Traduccion de texto entre multiples idiomas (el modelo base soporta 55 idiomas, segun la documentacion de TranslateGemma).
- Generacion de subtitulos con estructura JSON: el modelo recibe arrays de cues de dialogo y debe devolver un array JSON valido con los mismos identificadores de cue.
- Traduccion de dialogos con contexto conversacional multi-turno.
- Inferencia eficiente en GPUs Blackwell consumer (RTX 5070 Ti, 5080, 5090) mediante vLLM con kernels FP4 nativos.
- Soporte de decodificacion por lotes (batch) para alto rendimiento agregado.
- No incluye capacidades multimodales: la torre de vision se elimina, por lo que no procesa imagenes ni video.

## Casos de uso

- Traduccion de subtitulos para plataformas de video: el modelo procesa arrays JSON de cues de dialogo y devuelve traducciones con los mismos identificadores, lo que permite mapear cada traduccion a su timestamp original en un pipeline de postproduccion.
- Localizacion de contenido audiovisual: integrado en herramientas de doblaje o subtitulado automatico, puede traducir guiones completos con formato estructurado, reduciendo el trabajo manual de reajuste de tiempos.
- Traduccion de transcripciones de reuniones o conferencias: dado un texto transcrito, el modelo genera una version traducida manteniendo la estructura de turnos de habla, util para actas bilingues.
- Servicio de traduccion en tiempo real para streaming: con vLLM y la cuantizacion NVFP4, puede desplegarse en una GPU consumer para traducir subtitulos en vivo con latencia aceptable (102 tok/s en lote de 6 peticiones).
- Traduccion de documentacion tecnica o legal con formato estructurado: aunque el modelo esta optimizado para subtitulos, su capacidad de mantener estructuras JSON puede aplicarse a otros dominios con salida formateada, siempre que se valide la adherencia al formato.
- Evaluacion de calidad de traduccion en pipelines de control de calidad: el modelo puede usarse como referencia automatica para comparar traducciones generadas por otros sistemas, aprovechando su calibracion en el dominio de subtitulos.

## Benchmarks y rendimiento

La model card incluye mediciones propias sobre un corpus de 120 cues de subtitulos en espanol (6 escenas de 20), traducidos es->en en una RTX 5070 Ti (sm_120, 16 GB). La metrica "Structural pass" indica la fraccion de escenas cuya salida es un array JSON valido con todos los cue ids solicitados. "chrF++" se mide contra una decodificacion int8 adyacente a bf16 de los mismos cues.

| Variante | tok/s | Structural pass | chrF++ |
|---|---|---|---|
| int8 + fp32 CPU offload (transformers) | 2,9 | - | referencia |
| NF4 all-on-GPU (transformers) | 12,3 | 50% | 80,8 |
| NVFP4A16 (W4A16), receta de este repo | 102,0 | 83% | 83,7 |
| NVFP4 (W4A4), calibrado en dominio | 97,6 | 33% | n/a |
| NVFP4 (W4A4), cuantizacion publica sin calibrar | 97,5 | 0% | n/a |

Las filas de transformers son de un solo stream (batch 1); las de vLLM son rendimiento agregado en un lote de 6 peticiones, por lo que no son comparables directamente en latencia. El autor destaca que la variante W4A4 produce traducciones fluidas y precisas cuando la salida se parsea, pero falla estructuralmente en mantener el formato JSON: los cue ids desaparecen. La calibracion en dominio mejora el structural pass del 0% al 33%, pero la variante W4A16 alcanza el 83% con la misma base y receta. La diferencia de rendimiento entre W4A4 y W4A16 es inferior al 5%, por lo que cuantizar activaciones a 4 bits no compensa la perdida de formato.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 8,1 GB en disco; con la eliminacion de la torre de vision, cabe en una GPU de 16 GB dejando espacio para la caché KV (el autor menciona que la caché KV es el factor limitante de concurrencia).
- GPU recomendadas: RTX 5070 Ti (sm_120, 16 GB) usada en las mediciones; tambien RTX 5080, 5090 y RTX PRO 6000 para consumer Blackwell.
- En GPUs Blackwell consumer (sm_120) es necesario establecer las siguientes variables de entorno antes de importar vLLM, o el kernel FP4 GEMM lanza una instruccion ilegal:
  ```bash
  export FLASHINFER_CUDA_ARCH_LIST=12.0f
  export FLASHINFER_FORCE_SM=120f
  export FLASHINFER_DISABLE_VERSION_CHECK=1
  ```
- Verificar en el log del motor que se selecciona `CutlassNvFp4LinearKernel`; si se selecciona una ruta Marlin NVFP4, la salida puede ser silenciosamente vacia en sm_12x.
- FlashInfer compila kernels JIT en el primer uso, por lo que el contenedor necesita `ninja` y un `nvcc` accesible; `CUDA_HOME` debe apuntar al CUDA incluido en vLLM (`site-packages/nvidia/cu13`) en una imagen base con CUDA runtime.
- En transformers sin vLLM no hay kernel FP4, por lo que este checkpoint es mas lento que bf16 fuera de vLLM.
- Opciones de despliegue: vLLM (recomendado), con `gpu_memory_utilization=0.85` y `max_model_len=4096` en el ejemplo de uso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento (tok/s) | Licencia |
|---|---|---|---|---|---|
| google/translategemma-12b-it (base) | 12,19B | no disponible | bf16 | no medido | Gemma |
| henry1477/translategemma-12b-it-NVFP4 (este) | 11,77B | no disponible | NVFP4 W4A4 | 97,6 (vLLM, batch 6) | Gemma |
| kaitchup/translategemma-12b-it-NVFP4 | 11,77B (estimado) | no disponible | NVFP4 | no publicado | Gemma |
| litert-community/TranslateGemma-12B-IT | 12,19B (estimado) | no disponible | varias (MediaPipe) | no publicado | Gemma |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de modelos de traduccion alternativos en la informacion proporcionada. El modelo base de Google supera al Gemma 3 27B en traduccion con menos de la mitad de parametros, segun el blog oficial. La variante de kaitchup es otra cuantizacion NVFP4 sin mediciones publicadas; la de litert-community esta orientada a despliegue web con MediaPipe.

## Limitaciones y advertencias

- La variante W4A4 (este checkpoint) pierde el formato JSON de salida en la mayoria de los casos: en las mediciones, el structural pass fue del 33% con calibracion en dominio y del 0% sin calibrar, frente al 83% de la variante W4A16. Si el caso de uso depende de un formato de salida especifico, se recomienda usar la variante A16.
- La cuantizacion de activaciones a 4 bits ofrece una mejora de rendimiento inferior al 5% respecto a W4A16, por lo que no compensa la perdida de adherencia al formato.
- El modelo es solo texto: no procesa imagenes ni video, a diferencia del modelo base que conserva capacidades multimodales.
- Requiere vLLM y GPUs Blackwell para obtener rendimiento; en transformers sin vLLM es mas lento que bf16.
- La licencia Gemma Terms of Use debe aceptarse en el modelo base antes de usar este derivado.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este checkpoint; las mediciones disponibles son especificas del dominio de subtitulos.
- La calibracion en dominio mejora parcialmente el formato, pero no es una solucion completa: el autor indica explicitamente que "la calibracion vale algo pero no es una solucion".
- Riesgo de alucinacion y sesgos no documentados: no hay informacion sobre evaluaciones de sesgo o robustez para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/henry1477/translategemma-12b-it-NVFP4
- Modelo base: https://huggingface.co/google/translategemma-12b-it
- Blog de Google sobre TranslateGemma: https://blog.google/innovation-and-ai/technology/developers-tools/translategemma/
- Technical report en arXiv: https://arxiv.org/pdf/2601.09012
- Variante en Ollama: https://ollama.com/library/translategemma:12b
- Variante de kaitchup: https://huggingface.co/kaitchup/translategemma-12b-it-NVFP4
- Variante para MediaPipe: https://huggingface.co/litert-community/TranslateGemma-12B-IT
