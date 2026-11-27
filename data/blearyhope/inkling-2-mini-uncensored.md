# blearyhope/Inkling-2-Mini-Uncensored

## Resumen

Inkling-2-Mini-Uncensored es un checkpoint derivado de thinkingmachines/Inkling-2-Mini, el modelo multimodal de tipo Mixture-of-Experts con arquitectura de transformer con bucles (looped transformer) desarrollado por Thinking Machines Lab. Este derivado, publicado por el usuario blearyhope, aplica una eliminación de rechazos (refusals) mediante SimPO on-policy con gradiente puro, conservando el formato oficial mixto NVFP4 / MXFP8 / BF16 del checkpoint original. El modelo acepta entradas de texto e imagen y genera texto, con modos de razonamiento activado y desactivado.

El modelo resuelve el problema del exceso de rechazos y del comportamiento de rechazo en modelos alineados: elimina la capa de seguridad integrada para permitir investigación sobre mecanismos de alineación, edición de modelos y análisis de refusal. Según la model card, mantiene las capacidades de código, uso de herramientas agéntico, seguimiento de instrucciones, razonamiento y visión del modelo base, y reduce de forma material el fallo conocido de bucles de razonamiento en modo greedy del modelo original.

Con 26.388.646.440 parámetros totales y un peso de repositorio de aproximadamente 20,2 GB en su formato nativo cuantizado, es relevante ahora por su distribución en precisión mixta de bajo bit (NVFP4, MXFP8) pensada para GPUs Blackwell y por su compatibilidad directa con vLLM, SGLang, Transformers, TokenSpeed, Dynamo, llama.cpp, Ollama y MLX. La licencia es Apache 2.0, aunque el propio autor advierte de que se trata de un modelo sin capa de seguridad y orientado a investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con bucles (looped transformer) y capas feed-forward MoE dispersas; 24 capas, con 12 capas centrales en bucle; clase `Inkling2LoopForConditionalGeneration` |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de despliegue en vLLM usa `--max-model-len 16384`, pero no se confirma como contexto maximo) |
| Tipos de cuantizacion | NVFP4, MXFP8 y BF16 en formato mixto oficial; GGUF con BF16 sin perdida y Q8_0 a Q3_K_M; MLX nativo |
| Idiomas soportados | Ingles y soporte multilingue general |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (incluye `mtp.safetensors` para decodificacion especulativa DSpark); GGUF; MLX |

## Arquitectura y entrenamiento

El modelo base es un transformer autorregresivo multimodal de tipo looped transformer: 24 capas decoder-only con capas feed-forward de Mixture-of-Experts dispersas, donde las 12 capas centrales se ejecutan en bucle. Esta arquitectura intercambia computo por parametros, reutilizando pesos en pasadas repetidas en lugar de aumentar el numero de parametros. El checkpoint se distribuye en el formato oficial mixto NVFP4 / MXFP8 / BF16, con los bytes de expertos cuantizados intactos, lo que lo convierte en un reemplazo directo en los mismos entornos que soportan el modelo original.

El proceso de este derivado concreto es una eliminacion de rechazos mediante SimPO on-policy con gradiente puro, aplicada sobre el checkpoint base. Segun la model card, el resultado elimina el comportamiento de rechazo tanto en modo de razonamiento desactivado como activado, y reduce de forma material el fallo de bucles de razonamiento en decodificacion greedy del modelo base. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO mas alla del SimPO citado. El repositorio incluye el fichero `mtp.safetensors` para decodificacion especulativa DSpark, que acelera la generacion en los motores compatibles.

## Capacidades

- Generacion de texto y razonamiento en modo thinking-off y thinking-on, con control de profundidad de razonamiento por peticion mediante `reasoning_effort` (de 0.0 a 0.9).
- Entrada de imagen y texto con salida de texto (pipeline `image-text-to-text`), lo que habilita tareas de vision-lenguaje.
- Generacion de codigo y capacidades de programacion heredadas del modelo base.
- Uso de herramientas y function calling en flujos agenticos.
- Seguimiento de instrucciones y conversacion multi-turno.
- Capacidades multilingues generales, con ingles como idioma principal.
- Eliminacion deliberada de rechazos: el modelo intenta peticiones que el checkpoint original declina, incluidas las sensibles o daninas.
- Reduccion del fallo de bucles de razonamiento en modo greedy respecto al modelo base.
- Compatibilidad con decodificacion especulativa DSpark mediante `mtp.safetensors`.

## Casos de uso

- Investigacion sobre alineacion y mecanismos de rechazo: el modelo permite estudiar como se comporta un checkpoint sin capa de refusal frente al original, comparando respuestas en modo thinking-on y thinking-off para aislar los circuitos internos responsables del rechazo.
- Edicion de modelos y abliteration: sirve como referencia para validar tecnicas de eliminacion de direcciones de rechazo, ya que se distribuye en el formato oficial mixto y puede compararse byte a byte con el checkpoint base.
- Evaluacion de robustez y red teaming: al no incluir salvaguardas, es adecuado para probar clasificadores de seguridad externos y medir su tasa de deteccion sobre un modelo que responde a peticiones sensibles.
- Analisis de fallos de razonamiento: la reduccion del bucle greedy permite estudiar si el fallo original proviene del modo de decodificacion o del propio entrenamiento, usando el mismo modelo con y sin la modificacion.
- Procesamiento de documentos con imagen: al aceptar entradas de imagen y texto, puede emplearse en extraccion y resumen de documentos escaneados en entornos de investigacion controlados.
- Despliegue en GPUs Blackwell con vLLM o SGLang: el formato NVFP4/MXFP8 permite servir el modelo en una sola GPU de 24 GB o mas, util para laboratorios que quieran experimentar con precisiones de bajo bit sin recompilar pesos.
- Pruebas de agentes con tool calling: su soporte de function calling y contexto de conversacion permite montar prototipos de agentes multi-paso en entornos aislados de investigacion.

## Benchmarks y rendimiento

La model card reporta las siguientes metricas de cumplimiento y rechazo, sin comparaciones con otros modelos:

| Metrica | Resultado |
|---|---|
| Cumplimiento (thinking-off) | 98,0 % |
| Cumplimiento (thinking-on) | 98,5 % |
| Rechazos | 0 de 3.996 peticiones |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20,1 GB para el checkpoint safetensors nativo en NVFP4/MXFP8/BF16; se recomiendan 24 GB o mas, y 32 GB o mas para contexto largo.
- GPUs recomendadas: NVIDIA Blackwell, DGX Spark, RTX PRO, RTX 4090 y RTX 5090 (24 GB o mas de VRAM).
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 5090 con 24 GB; en GPUs de 16-24 GB se recomienda usar las builds GGUF cuantizadas (Q8_0 a Q3_K_M, de 13 a 52 GB).
- Apple Silicon: 32 GB o mas de memoria unificada mediante la build MLX o GGUF con `mlx-vlm`.
- Opciones de despliegue: vLLM (recomendado, requiere `--reasoning-parser inkling`), SGLang, Transformers (`>= 5.24.1`, `AutoModelForImageTextToText`), TokenSpeed, NVIDIA Dynamo, Unsloth, llama.cpp, LM Studio, Ollama y `mlx-vlm`.
- Latencia y throughput: no disponibles en la informacion proporcionada; la decodificacion especulativa DSpark mediante `mtp.safetensors` esta pensada para acelerar la generacion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored | 26.388.646.440 | no disponible | safetensors NVFP4/MXFP8/BF16, GGUF, MLX | Apache 2.0 | Derivado sin rechazos; sin benchmarks estandar publicados |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | safetensors oficial mixto | no disponible | Modelo base con alineacion y rechazos intactos |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo sin censura y abliterated: se ha eliminado deliberadamente el comportamiento de rechazo y no incluye capa de seguridad integrada; respondera a peticiones daninas o sensibles.
- Riesgo elevado de uso indebido: el autor lo libera exclusivamente para investigacion sobre alineacion, mecanismos de rechazo y edicion de modelos, y advierte de no exponerlo a usuarios finales sin salvaguardas propias.
- Responsabilidad legal: el despliegue y uso recaen enteramente sobre el operador, que debe cumplir la legislacion aplicable.
- Sesgos: no se documentan sesgos conocidos especificos en la informacion disponible; al derivar de un modelo base entrenado con datos generales, es previsible que herede sus sesgos.
- Alucinacion: no se reportan tasas de alucinacion; el modelo conserva el modo de razonamiento del base, con el riesgo asociado de generar contenido plausible pero incorrecto.
- Idioma: el soporte principal es el ingles, con soporte multilingue general no cuantificado.
- Contexto: no se especifica la longitud maxima de contexto; el ejemplo de vLLM usa 16.384 tokens, que no debe interpretarse como limite confirmado.
- Licencia: Apache 2.0 permite uso comercial, pero las advertencias del autor sobre ausencia de seguridad deben tenerse en cuenta en cualquier despliegue en produccion.
- Madurez: el repositorio no tiene descargas ni likes en el momento de la consulta, lo que limita la validacion independiente de su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blearyhope/Inkling-2-Mini-Uncensored
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build GGUF: https://huggingface.co/blearyhope/Inkling-2-Mini-Uncensored-GGUF
- Build MLX: https://huggingface.co/blearyhope/Inkling-2-Mini-Uncensored-MLX
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Documentacion de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Blog de Transformers sobre Inkling 2 Mini: https://hf.co/blog/inkling2mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentacion de Unsloth: https://unsloth.ai/docs/inkling-2-mini
