# KiwiHere/Qwen3-1.7B-Abliterated

## Resumen

Qwen3-1.7B-Abliterated es una variante "abliterated" del modelo Qwen3-1.7B de Alibaba Qwen, publicada por el usuario KiwiHere en Hugging Face. La operacion de abliteracion consiste en identificar la direccion de rechazo (refusal direction) en el espacio de activaciones y ortogonalizarla de las proyecciones de atencion y MLP, de modo que el modelo deja de emitir respuestas de negativa ante peticiones que el modelo base rechazaria. El resultado es un modelo de 1.720.574.976 parametros con licencia Apache 2.0, pensado para experimentacion con modelos sin censura.

El modelo conserva la arquitectura y el entrenamiento del Qwen3-1.7B original: un transformer denso de la familia Qwen3, con modo de razonamiento (thinking mode) y capacidades multilingues heredadas del base. No se aplico fine-tuning adicional tras la abliteracion, por lo que el estilo de respuesta y las capacidades generales deberian mantenerse cercanas al original, con posibles degradaciones menores.

Su relevancia es acotada: se trata de un derivado de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a investigadores interesados en estudiar el comportamiento de rechazo en modelos pequenos y en tecnicas de edicion de pesos. No es un modelo recomendado para produccion sin una evaluacion propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), con modo de razonamiento |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | GGUF (incluye Q8_0 como referencia de los benchmarks); otras cuantizaciones no disponibles |
| Idiomas soportados | en (segun la model card); el base Qwen3 es multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso de 1.720.574.976 parametros. Sobre ese base se aplico una tecnica de abliteracion: se identifico la direccion de rechazo contrastando activaciones sobre 300 prompts daninos frente a 300 prompts inofensivos, y posteriormente se ortogonalizo esa direccion en todas las proyecciones de atencion y MLP (q, k, v, o, gate, up, down) y en el lm_head, en 18 capas seleccionadas automaticamente por presentar un tamano del efecto |Cohen's d| >= 5.0.

No se realizo fine-tuning adicional despues de la abliteracion. El autor indica que el objetivo es eliminar el comportamiento de rechazo preservando las capacidades generales del base. Se mantiene el modo de razonamiento (thinking mode) del Qwen3 original, lo que puede generar conflictos ocasionales entre el razonamiento y el comportamiento abliterated. Los detalles de entrenamiento del base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se detallan en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del Qwen3-1.7B.
- Razonamiento en modo thinking, con cadenas de pensamiento internas.
- Generacion de codigo y resolucion de tareas de matematicas a nivel de modelo pequeno.
- Comportamiento sin rechazo (uncensored): reduccion de negativas ante peticiones que el base rechazaria.
- Soporte de tool calling / function calling: no confirmado explicitamente en la model card; probablemente heredado del base, pero no verificado.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: la model card declara solo ingles; el base Qwen3 es multilingue, pero el alcance real tras la abliteracion no esta documentado.
- Compatibilidad con endpoints (tag endpoints_compatible).

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como se comporta un transformer pequeno cuando se elimina la direccion de rechazo, comparando respuestas con el Qwen3-1.7B original en conjuntos controlados de prompts.
- Evaluacion de tecnicas de edicion de pesos: sirve como caso de prueba para medir la degradacion de capacidades tras una abliteracion, ejecutando benchmarks de conocimiento y razonamiento antes y despues.
- Red teaming y pruebas de seguridad: util para generar respuestas que un modelo alineado bloquearia, con el fin de entrenar clasificadores de seguridad o evaluar filtros de contenido.
- Experimentacion local en hardware de consumo: con 1.720 millones de parametros y versiones GGUF, puede ejecutarse en GPUs de gama media para prototipos de generacion de texto.
- Generacion creativa sin restricciones de estilo: escritura de ficcion o guiones con tematicas sensibles donde el modelo base tiende a rechazar, siempre con supervision humana.
- Docencia y demostraciones: ilustrar en un entorno controlado que es la abliteracion y como afecta al comportamiento de un LLM, usando el modelo como ejemplo practico.

## Benchmarks y rendimiento

La model card incluye dos graficos de benchmarks (uno de cumplimiento o compliance y otro de proposito general), pero los valores numericos no estan disponibles en la informacion proporcionada; solo se indica que se ejecutaron sobre el GGUF Q8_0 del modelo base. No se presentan cifras de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,4 GB solo para pesos, mas overhead de KV cache y activaciones (del orden de 4-6 GB en total segun contexto).
- VRAM estimada en Q8_0: aproximadamente 1,8-2 GB de pesos.
- VRAM estimada en Q4_K_M: aproximadamente 1,0-1,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4070); para cuantizaciones Q4/Q8 basta con 4 GB o menos.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors; el tag endpoints_compatible sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-1.7B-Abliterated | 1.720.574.976 | no disponible | apache-2.0 | Hugging Face (KiwiHere) | Derivado abliterated, sin fine-tuning adicional |
| Qwen/Qwen3-1.7B | 1.720.574.976 | no disponible en la informacion | apache-2.0 | Hugging Face (Qwen) | Modelo base alineado, con rechazos |
| Otras variantes abliterated de Qwen3 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion no es perfecta: pueden persistir rechazos residuales y la capacidad general puede degradarse ligeramente.
- El modo thinking se mantiene, y el razonamiento puede entrar en conflicto ocasional con el comportamiento abliterated, produciendo respuestas incoherentes.
- Riesgo elevado de generar contenido danino, ofensivo o inexacto: el modelo esta disenado explicitamente para reducir las negativas, lo que elimina una capa de seguridad del base.
- Riesgo de alucinacion propio de un modelo de 1.720 millones de parametros, agravado por la falta de evaluacion publicada.
- La model card declara solo ingles; el comportamiento en castellano no esta documentado, aunque el base sea multilingue.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo; el uso en produccion requiere evaluacion y filtros propios.
- Modelo de nicho con cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria ni mantenimiento conocido.
- Los benchmarks del autor se ejecutaron solo sobre el GGUF Q8_0; el rendimiento en otras cuantizaciones puede variar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KiwiHere/Qwen3-1.7B-Abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Grafico de benchmark de compliance: https://cdn-uploads.huggingface.co/production/uploads/6a5c44d9b0790598bd9fb734/bqprhhna0OW4NVOIa2eNC.png
- Grafico de benchmark de proposito general: https://cdn-uploads.huggingface.co/production/uploads/6a5c44d9b0790598bd9fb734/Efy4Avtm48yxQkKudkQq4.png
