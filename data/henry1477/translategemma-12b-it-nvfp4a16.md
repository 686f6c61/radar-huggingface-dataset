# henry1477/translategemma-12b-it-NVFP4A16

## Resumen

`henry1477/translategemma-12b-it-NVFP4A16` es una cuantización del modelo de traducción `google/translategemma-12b-it`, desarrollada por el usuario henry1477 mediante la herramienta `llm-compressor` del proyecto vLLM. Esta variante aplica un esquema de cuantización NVFP4A16 (W4A16): pesos de 4 bits con escalas de bloque FP8 y activaciones de 16 bits, diseñada específicamente para ejecutarse en GPUs Blackwell (sm_120) a través de vLLM. El objetivo principal es acelerar la inferencia en tareas de traducción de subtítulos manteniendo la capacidad de generar salidas JSON estructuradas, un requisito habitual en pipelines de subtitulado.

A diferencia del modelo base, esta versión elimina por completo la torre de visión SigLIP y el proyector multimodal, reduciendo los parámetros de 12,19 B a 11,77 B y liberando aproximadamente 0,8 GiB de VRAM para la caché KV. La arquitectura resultante es `Gemma3ForCausalLM` solo texto. El autor reporta un rendimiento de 102,0 tokens por segundo en una RTX 5070 Ti (16 GB) con un 83 % de pases estructurales (salidas JSON válidas) y una puntuación chrF++ de 83,7 frente a una decodificación int8 de referencia. Esta cuantización está pensada para despliegues en producción con vLLM, no para uso con transformers estándar, ya que no existe un kernel FP4 en esa librería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3ForCausalLM (solo texto, sin torre de visión) |
| Parametros totales | 11.766.034.176 (11,77 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K (modelo base, no verificado en esta variante) |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos NVFP4 de 4 bits con group size 16 y escalas de bloque FP8, activaciones de 16 bits |
| Idiomas soportados | 55 idiomas (modelo base, según documentacion de TranslateGemma) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una cuantización del `google/translategemma-12b-it`, que a su vez se basa en Gemma 3. La variante NVFP4A16 elimina los componentes multimodales (torre SigLIP y proyector) para quedarse únicamente con el decodificador de texto, lo que reduce el tamaño y libera memoria para la caché KV. La cuantización se aplica a todas las capas lineales excepto `lm_head`, que se excluye porque Gemma 3 ata esta capa a la tabla de embeddings. El esquema NVFP4A16 utiliza pesos de 4 bits con escalas de bloque FP8 (group size 16) y mantiene activaciones de 16 bits, lo que preserva la capacidad de generar JSON válido, a diferencia de la variante W4A4 que pierde la estructura de salida en la mayoría de los casos.

El proceso de cuantización se realizó con `llm-compressor` y no requirió datos de calibración (`requires_calibration_data: false`). El autor señala que la calibración in-domain solo se aplicó a la variante W4A4, no a esta W4A16. El modelo base fue entrenado por Google con datos de traducción en 55 idiomas, aunque no se proporcionan detalles específicos sobre el dataset o el proceso de entrenamiento en la información disponible.

## Capacidades

- Traduccion de texto entre 55 idiomas, con especial atencion a la traduccion de subtitulos y dialogos.
- Generacion de salidas JSON estructuradas (arrays de objetos con identificadores de cues), esencial para pipelines de subtitulado automatico.
- Soporte de generacion de texto en general, aunque su uso principal es traduccion.
- Compatible con vLLM para inferencia de alto rendimiento en GPUs Blackwell.
- No incluye capacidades de vision, audio ni otras modalidades; es exclusivamente texto.
- No se menciona soporte de tool calling ni funciones de agente en la informacion disponible.

## Casos de uso

- Traduccion de subtitulos en produccion: el modelo recibe arrays JSON de cues de dialogo y devuelve traducciones en el mismo formato, permitiendo mapear las traducciones a los tiempos originales. Su alta tasa de pases estructurales (83 % en las pruebas del autor) lo hace adecuado para automatizar este proceso.
- Servicio de traduccion multilingue para plataformas de streaming: con 55 idiomas soportados, puede integrarse en backends que necesiten traducir contenido audiovisual a gran escala.
- Generacion de subtitulos para videojuegos o contenido generado por usuarios: la salida JSON estructurada facilita la integracion con herramientas de edicion y sincronizacion.
- Traduccion de dialogos en tiempo real para aplicaciones de chat o videoconferencia: su baja latencia en vLLM (102 tok/s en una GPU de 16 GB) permite respuestas casi inmediatas.
- Pipelines de traduccion con postprocesado automatico: al mantener la estructura JSON, se pueden encadenar validaciones y correcciones sin necesidad de re-parsear texto libre.
- Despliegue en entornos con recursos limitados: al caber en una GPU de 16 GB con cuantizacion NVFP4, es viable para estaciones de trabajo con RTX 5070 Ti o similares, sin necesidad de hardware de centro de datos.

## Benchmarks y rendimiento

El autor proporciona mediciones propias sobre un corpus de 120 cues de subtitulos en espanol (6 escenas de 20) traducidos al ingles, ejecutadas en una RTX 5070 Ti (sm_120, 16 GB). La tabla siguiente resume los resultados:

| Variante | tok/s | Pase estructural | chrF++ |
|---|---|---|---|
| int8 + fp32 CPU offload (transformers) | 2,9 | - | referencia |
| NF4 all-on-GPU (transformers) | 12,3 | 50 % | 80,8 |
| **NVFP4A16 (W4A16), esta receta** | **102,0** | **83 %** | **83,7** |
| NVFP4 (W4A4), receta con calibracion in-domain | 97,6 | 33 % | n/a |
| NVFP4 (W4A4), cuantizacion publica sin calibrar | 97,5 | 0 % | n/a |

Nota: las filas de transformers son de un solo stream (batch 1), mientras que las de vLLM son de rendimiento agregado con un lote de 6 peticiones, por lo que no son comparables directamente en latencia. El chrF++ se mide contra una decodificacion int8 del mismo corpus. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 11,77 B de parametros en NVFP4 (4 bits), el peso ocupa aproximadamente 5,9 GB, mas overhead de activaciones y caché KV. El autor indica que cabe en una GPU de 16 GB y que la eliminacion de la torre de vision libera ~0,8 GiB para la caché KV.
- GPU recomendadas: Blackwell consumer (sm_120): RTX 5070 Ti, RTX 5080, RTX 5090, RTX PRO 6000. Tambien compatible con otras GPUs Blackwell de centro de datos, aunque no se especifican.
- En GPUs no Blackwell, el kernel FP4 no esta disponible y el modelo seria mas lento que bf16 en transformers.
- Despliegue: vLLM es el entorno recomendado. Se requieren variables de entorno especificas para sm_120 (`FLASHINFER_CUDA_ARCH_LIST=12.0f`, `FLASHINFER_FORCE_SM=120f`, `FLASHINFER_DISABLE_VERSION_CHECK=1`). Tambien se necesita `ninja` y `nvcc` para la compilacion JIT de FlashInfer.
- Latencia y throughput: 102 tok/s en una RTX 5070 Ti con un lote de 6 peticiones, segun las mediciones del autor. En transformers sin kernel FP4, el rendimiento es significativamente menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento (tok/s) | Pase estructural | chrF++ |
|---|---|---|---|---|---|---|
| google/translategemma-12b-it (bf16) | 12,19 B | 128K | bf16 | no disponible | no disponible | no disponible |
| henry1477/translategemma-12b-it-NVFP4A16 | 11,77 B | 128K (base) | NVFP4A16 | 102,0 | 83 % | 83,7 |
| kaitchup/translategemma-12b-it-NVFP4 | 12,19 B (estimado) | 128K (base) | NVFP4 | no disponible | no disponible | no disponible |
| litert-community/TranslateGemma-12B-IT | 12,19 B | 128K | varias (MediaPipe) | no disponible | no disponible | no disponible |

La comparativa se basa en datos publicos de los repositorios. No se dispone de benchmarks estandarizados para estos modelos, por lo que la comparacion se limita a caracteristicas generales.

## Limitaciones y advertencias

- La cuantizacion NVFP4A16 puede introducir perdida de calidad respecto al modelo bf16 original, aunque el autor reporta un chrF++ de 83,7 frente a la referencia int8, lo que sugiere una degradacion minima en traduccion.
- La variante W4A4 (no incluida en este repo) presenta problemas graves de estructura JSON, pero esta advertencia es relevante si se considera usar otras cuantizaciones similares.
- El modelo es solo texto; no puede procesar imagenes ni otras modalidades, a diferencia del modelo base que incluye vision.
- La licencia Gemma impone restricciones de uso comercial; es necesario aceptar los Terminos de Uso de Gemma en el modelo base antes de utilizar este derivado.
- En transformers estandar, este checkpoint es mas lento que bf16 porque no existe un kernel FP4; su uso esta pensado exclusivamente para vLLM en GPUs Blackwell.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez en dominios fuera de la traduccion de subtitulos.
- La longitud de contexto de 128K corresponde al modelo base, pero no se ha verificado que esta cuantizacion la mantenga integra; el ejemplo de uso en vLLM emplea `max_model_len=4096`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/henry1477/translategemma-12b-it-NVFP4A16
- Modelo base: https://huggingface.co/google/translategemma-12b-it
- Blog de Google sobre TranslateGemma: https://blog.google/innovation-and-ai/technology/developers-tools/translategemma/
- Página de TranslateGemma en Ollama: https://ollama.com/library/translategemma:12b
- Variante NVFP4 de kaitchup: https://huggingface.co/kaitchup/translategemma-12b-it-NVFP4
- Variantes para MediaPipe: https://huggingface.co/litert-community/TranslateGemma-12B-IT
