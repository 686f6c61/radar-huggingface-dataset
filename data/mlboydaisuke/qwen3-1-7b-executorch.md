# mlboydaisuke/Qwen3-1.7B-ExecuTorch

## Resumen

Este repositorio contiene una exportación del modelo Qwen3-1.7B de Alibaba al formato ExecuTorch, optimizada para inferencia en dispositivos con recursos limitados mediante el backend XNNPACK. El autor, mlboydaisuke, ha aplicado una cuantización mixta de 8 bits en activaciones y 4 bits en pesos (8da4w) junto con embeddings cuantizados a 8 bits, lo que reduce el tamaño del archivo a aproximadamente 1,2 GB. El resultado es un artefacto `.pte` listo para ejecutarse en entornos on-device, como teléfonos móviles o equipos de sobremesa con CPU ARM.

La relevancia de este modelo radica en que permite ejecutar un LLM de razonamiento (con bloque de "thinking" integrado) en hardware de consumo sin necesidad de GPU dedicada, manteniendo una velocidad de decodificación de 44,7 tokens por segundo en un Mac con arquitectura arm64. El modelo base Qwen3-1.7B es un transformer denso de 1.700 millones de parámetros, con una ventana de contexto de 2048 tokens en esta exportación. La licencia Apache-2.0 facilita su uso comercial y su integración en aplicaciones propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B, detalles no especificados en la informacion disponible) |
| Parametros totales | 1.7B (segun la denominacion del modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (max_seq_length de la exportacion) |
| Tipos de cuantizacion | 8da4w (8-bit activaciones, 4-bit pesos) + embedding de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch `.pte` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3-1.7B es un transformer denso desarrollado por Alibaba, aunque la model card de esta exportacion no proporciona detalles sobre su arquitectura interna ni sobre el proceso de entrenamiento. La exportacion a ExecuTorch se realizo con la version 1.4.0, utilizando `export_llm` con forma estatica (seq_len=1) y operaciones extendidas de XNNPACK. La cuantizacion 8da4w se aplica solo a las capas lineales cuyas dimensiones de entrada son divisibles por el tamaño de grupo del cuantizador; el resto se omite silenciosamente, un detalle que el autor verifico para evitar exportaciones corruptas. Ademas, se activo `use_sdpa_with_kv_cache`, una opcion que en la configuracion original de Qwen3.5 estaba desactivada y que, segun las mediciones del autor, duplica la velocidad de decodificacion (de 8,20 a 16,64 tok/s en un modelo similar). El embedding se cuantizo a 8 bits mediante `embedding_quantize: "8,0"`.

El proceso de exportacion incluyo una verificacion exhaustiva de que todos los campos del JSON de parametros fueran leidos por la ruta generica, evitando problemas como el de SmolLM3, que repetia una sola palabra indefinidamente por un campo no soportado. El modelo fue probado con prompts que requieren razonamiento, como "capital of France?" o "17 times 4?", y en ambos casos abrio un bloque de "thinking" antes de responder, confirmando que la capacidad de razonamiento del modelo base se conserva tras la cuantizacion.

## Capacidades

- Generacion de texto con razonamiento explicito: el modelo abre un bloque de "thinking" antes de dar la respuesta final, como se verifico en las pruebas con preguntas de cultura general y aritmetica.
- Inferencia on-device: disenado para ejecutarse en CPU mediante XNNPACK, sin necesidad de GPU, lo que lo hace apto para telefonos, tablets y equipos de bajo consumo.
- Decodificacion autoregresiva token a token: el artefacto esta exportado con forma estatica (seq_len=1) y soporta prefill y decode secuencial.
- Compatibilidad con el chat template ChatML: usa los tokens especiales bos 151643 y eos [151645, 151643], lo que permite integrarlo en pipelines de chat estandar.
- Cuantizacion eficiente: 8da4w reduce el peso del modelo a 1,2 GB, facilitando su carga en memoria de dispositivos con limitaciones de almacenamiento.
- No se mencionan capacidades de tool calling, vision, audio ni soporte multilingue en la informacion disponible.

## Casos de uso

- Asistente personal en el movil: el modelo puede ejecutarse localmente en un telefono con CPU ARM, respondiendo preguntas y razonando sobre ellas sin conexion a internet. Su tamano de 1,2 GB y su velocidad de decodificacion (44,7 tok/s en Mac arm64, aunque no medido en telefono) lo hacen viable para aplicaciones de chat offline.
- Aplicaciones de educacion y tutoria: gracias a su capacidad de razonamiento explicito, puede explicar pasos intermedios en problemas de matematicas o logica, actuando como un tutor interactivo que muestra su proceso de pensamiento.
- Automatizacion de tareas de texto en entornos con recursos limitados: por ejemplo, resumir documentos, clasificar correos o generar respuestas estandarizadas en un dispositivo edge, sin depender de APIs externas.
- Prototipado y desarrollo de aplicaciones de IA embebida: los desarrolladores pueden usar este artefacto como referencia para exportar otros modelos Qwen3 a ExecuTorch, aprovechando los scripts de conversion publicados en el repositorio `executorch-models` de GitHub.
- Investigacion en eficiencia de modelos: el archivo sirve como caso de estudio para evaluar el impacto de la cuantizacion 8da4w en la calidad de razonamiento de un LLM de 1.7B, comparando respuestas con el modelo original en precision completa.
- Generacion de contenido en dispositivos de bajo consumo: como un teclado inteligente o un asistente de escritura que sugiere frases completas y razona sobre el contexto, funcionando sin conexion y con privacidad total de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica medicion de rendimiento reportada es la velocidad de decodificacion: 44,7 tokens por segundo en un Mac con arquitectura arm64, medida con un proceso limpio y sin otras cargas. El autor advierte que esta cifra puede caer a una cuarta parte si se ejecutan otras tareas en paralelo. No se proporcionan datos de latencia de prefill ni de uso de memoria.

## Requisitos de hardware

- Tamano del archivo: 1204,2 MB (1,2 GB), por lo que se necesita al menos 1,5 GB de RAM libre para cargar el modelo en memoria.
- CPU: compatible con XNNPACK, lo que incluye procesadores ARM (Apple Silicon, Snapdragon, etc.) y x86 con soporte AVX2. Verificado en Mac arm64.
- GPU: no requerida; la inferencia se ejecuta en CPU.
- Memoria: se recomienda un minimo de 2 GB de RAM disponible para el proceso de inferencia, ademas del sistema operativo.
- Dispositivos compatibles: telefonos y tablets con Android/iOS, mini-PCs, Raspberry Pi (si el sistema operativo soporta XNNPACK) y equipos de escritorio con CPU moderna.
- Opciones de despliegue: el artefacto `.pte` se ejecuta mediante el runtime de ExecuTorch, usando `portable_lib._load_for_executorch` y cargando los kernels cuantizados (`from executorch.kernels import quantized`). No es compatible directamente con vLLM, llama.cpp u Ollama, ya que estos usan formatos diferentes (GGUF, safetensors).
- Latencia y throughput: 44,7 tok/s en Mac arm64 en condiciones ideales; el rendimiento en telefonos no ha sido medido.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El modelo base Qwen3-1.7B tiene variantes de 0.6B y 4B tambien soportadas por ExecuTorch, pero no se han medido en este repositorio. Como alternativa, se podrian considerar versiones cuantizadas en GGUF del mismo modelo base para su uso con llama.cpp, aunque no hay datos de rendimiento disponibles para comparar.

## Limitaciones y advertencias

- La velocidad de decodificacion medida (44,7 tok/s) se obtuvo en un Mac arm64 con un proceso limpio; en un telefono real el rendimiento puede ser significativamente menor, y el autor no ha realizado mediciones en ese hardware.
- La cuantizacion 8da4w puede degradar la calidad de las respuestas en comparacion con el modelo original en precision completa, especialmente en tareas que requieren matices numericos o de razonamiento complejo.
- El contexto esta limitado a 2048 tokens, lo que restringe la capacidad de manejar conversaciones largas o documentos extensos.
- El modelo requiere kernels especificos de ExecuTorch (`quantized_decomposed::embedding_byte.dtype_out`) que deben estar disponibles en el runtime; sin ellos, la carga falla con un error que puede confundirse con una exportacion rota.
- No se ha verificado el comportamiento en telefonos, por lo que su uso en produccion movil requiere pruebas adicionales.
- Al ser un modelo de 1.7B, puede presentar alucinaciones y sesgos propios de los LLMs de tamano pequeno, especialmente en dominios especializados.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-1.7B puede tener restricciones adicionales; se recomienda revisar la licencia del modelo original en HuggingFace.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlboydaisuke/Qwen3-1.7B-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentacion de ExecuTorch para Qwen3: https://github.com/pytorch/executorch/blob/main/examples/models/qwen3/README.md
- Ejemplos de modelos en ExecuTorch: https://github.com/pytorch/executorch/tree/main/examples/models/qwen3
- Scripts de conversion (executorch-models): https://github.com/john-rocky/executorch-models
- Muestra para iOS (executorch-samples): https://github.com/john-rocky/executorch-samples
