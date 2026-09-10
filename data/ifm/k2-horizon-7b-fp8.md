# IFM/K2-Horizon-7B-FP8

## Resumen

K2-Horizon-7B-FP8 es la version cuantizada en FP8 del modelo denso K2-Horizon-7B, desarrollado por IFM. Se trata de un modelo decoder-only de tipo transformer denso, miembro intermedio de la familia K2-Horizon, con una ventana de contexto nativa de 524.288 tokens (512K) desde las etapas de midtraining. Segun los pesos en safetensors, el modelo tiene 8.999.178.240 parametros (~9B), aunque la nomenclatura comercial lo presenta como "7B-core".

La relevancia de esta variante FP8 reside en que reduce el peso en memoria respecto al modelo original en BF16 y habilita inferencia mas rapida en hardware con soporte FP8, manteniendo un rendimiento cercano al del modelo BF16 en las evaluaciones del autor. El proyecto se distribuye de forma completamente abierta: datos de preentrenamiento y midtraining, receta de entrenamiento, codigo de entrenamiento y recursos de evaluacion son publicos.

El problema que aborda es el de disponer de un modelo denso de clase media con contexto muy largo (512K), orientado a tareas agénticas, generacion de codigo, razonamiento y comprension de contexto extenso, con licencia Apache 2.0 que permite uso comercial. La model card reporta resultados competitivos frente a modelos de referencia de mayor tamano, como Gemma 4-12B, Qwen3.5-9B y Granite 4.2-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia K2-Horizon) |
| Parametros totales | 8.999.178.240 (~9B, dato de safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K), nativa desde las etapas de midtraining |
| Tipos de cuantizacion | FP8 (pesos estaticos con una escala por bloque 128x128; activaciones dinamicas FP8 con una escala por grupo 1x128 en el canal de entrada); el modelo original esta en BF16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con formato compressed-tensors) |
| Desarrollador | IFM |
| Modelo base | IFM/K2-Horizon-7B |
| Libreria | transformers |
| Tamano del repositorio | 11,1 GB |
| Descargas / likes | 648 descargas, 8 likes |
| Fecha de publicacion | 3 de septiembre de 2026 (ultima actualizacion: 3 de septiembre de 2026) |

## Arquitectura y entrenamiento

K2-Horizon-7B-FP8 es la version cuantizada de un transformer decoder-only denso. La cuantizacion afecta a todas las capas lineales excepto `lm_head`: los pesos se almacenan en FP8 estatico con una escala por bloque de 128x128 y las activaciones se cuantizan dinamicamente en FP8 con una escala por grupo de 1x128 a lo largo de la dimension de canal de entrada. Segun el autor, el modelo FP8 rinde de forma cercana al modelo BF16 original en sus evaluaciones, con menor huella de memoria y mayor velocidad en hardware compatible con FP8.

Los datos de entrenamiento proceden de dos conjuntos publicos: IFM/K2-Horizon-Pretrain-Data y IFM/K2-Horizon-Midtrain-Data. El numero total de tokens, la composicion exacta del dataset y si hubo etapas de RLHF o DPO no estan disponibles en la informacion proporcionada. La ventana de contexto de 524.288 tokens se alcanza de forma nativa a partir de las etapas de midtraining. Entre las innovaciones destacadas por el autor figuran la publicacion de checkpoints intermedios (para estudiar la evolucion de capacidades a lo largo del entrenamiento), el contexto nativo de 512K y la apertura completa de datos, receta, codigo de entrenamiento (LLM360/xllm) y codigo de evaluacion (Eval360-V2).

## Capacidades

- Generacion de texto conversacional (el modelo incluye la etiqueta `conversational`).
- Razonamiento y matematicas de competicion: la model card evalua el modelo en HMMT Feb 2026 (matematicas de competicion).
- Generacion y resolucion de tareas de ingenieria de software: evaluado en SWE-bench Verified.
- Contexto largo: ventana nativa de 524.288 tokens, apta para tareas de comprension de documentos extensos.
- Tareas agénticas: la model card indica que el modelo se evalua en benchmarks de tipo agéntico, ademas de codigo, contexto largo y razonamiento.
- Capacidades multilingues: limitadas al ingles (`en`) segun la model card.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles en la informacion proporcionada.
- Modo de razonamiento (thinking mode): no documentado en la informacion disponible.

## Casos de uso

- Analisis de repositorios y documentacion extensa: con 524.288 tokens de contexto, el modelo puede ingerir codebases o documentacion tecnica completa en una sola llamada y responder preguntas sobre ellos sin fragmentacion.
- Resolucion de incidencias de software: su evaluacion en SWE-bench Verified (70,6 en la model card) lo hace adecuado para tareas de localizacion y correccion de bugs en pipelines de desarrollo asistido.
- Generacion de codigo en produccion: puede integrarse en flujos de revision de codigo y generacion asistida, con la ventaja de un despliegue FP8 que reduce coste de VRAM respecto al modelo BF16.
- Asistente conversacional multi-turno en ingles: la etiqueta `conversational` y el contexto largo permiten mantener historiales de conversacion muy extensos sin perder informacion previa.
- Razonamiento matematico y resolucion de problemas cuantitativos: los resultados en HMMT Feb 2026 lo orientan a tutoria o asistencia en problemas de matematicas de nivel avanzado.
- Procesamiento de contratos o expedientes largos: en entornos legales o administrativos en ingles, el contexto de 512K permite analizar documentos completos y extraer clausulas o resumenes.
- Investigacion sobre entrenamiento de modelos: al publicarse checkpoints intermedios, sirve para estudiar la evolucion de capacidades a lo largo del entrenamiento y comparar etapas.
- Evaluacion comparativa de cuantizacion: la variante FP8 permite medir en produccion la perdida de calidad y la ganancia de rendimiento frente al modelo BF16 original.

## Benchmarks y rendimiento

Datos extraidos de la model card. La tabla original esta truncada, por lo que solo se reproducen las filas disponibles. Los valores de los modelos de referencia que no aparecen en la informacion se marcan como no disponibles.

| Benchmark | K2-Horizon-7B | Gemma 4-12B | Qwen3.5-9B | Granite 4.2-8B |
|---|---|---|---|---|
| HMMT Feb 2026 (matematicas de competicion) | 73,3 | 63,1 | 65,7 | 66,5 |
| SWE-bench Verified (ingenieria de software) | 70,6 | 30,6 | no disponible | 47,7 |

No hay mas resultados de benchmarks en la informacion disponible (la tabla de la model card aparece cortada tras la seccion de codigo). No se dispone de datos desglosados del modelo FP8 frente al BF16 mas alla de la afirmacion del autor de que el rendimiento es cercano al del modelo original.

## Requisitos de hardware

- Peso en VRAM (solo pesos, estimacion a partir del dato de safetensors): aproximadamente 9 GB en FP8 y aproximadamente 18 GB en BF16.
- Memoria adicional para cache KV: no disponible. Con una ventana de 524.288 tokens, el consumo de cache KV puede ser muy elevado y depende del numero de capas y cabezas, dato no publicado en la informacion disponible.
- GPU recomendadas para FP8: hardware con soporte nativo de FP8, como NVIDIA H100, H200 o L40S. Las GPU de arquitectura Ada (por ejemplo, RTX 4090) pueden ejecutar pesos FP8, aunque con aceleracion de calculo FP8 mas limitada.
- GPU para BF16: A100 (80 GB), H100, L40S o RTX 4090 (24 GB), esta ultima con margen ajustado si se usa contexto muy largo.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 4090, RTX 3090) para pesos FP8 y contextos moderados; el contexto de 512K requiere memoria adicional significativa.
- Opciones de despliegue: al estar publicado en formato safetensors para `transformers`, es compatible con stacks habituales como vLLM o TGI. No se han publicado pesos GGUF en la informacion disponible, por lo que el uso directo con llama.cpp u Ollama requeriria una conversion previa no documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Comparativa basada en los modelos de referencia empleados en la propia model card. Solo se dispone de datos de benchmark para las metricas indicadas; el resto de caracteristicas de los modelos de referencia no estan disponibles.

| Modelo | Parametros | Contexto | HMMT Feb 2026 | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| K2-Horizon-7B | ~9B (denso) | 524.288 tokens | 73,3 | 70,6 | Apache 2.0 | Pesos abiertos en HuggingFace, datos y codigo publicos |
| Gemma 4-12B | no disponible | no disponible | 63,1 | 30,6 | no disponible | no disponible |
| Qwen3.5-9B | no disponible | no disponible | 65,7 | no disponible | no disponible | no disponible |
| Granite 4.2-8B | no disponible | no disponible | 66,5 | 47,7 | no disponible | no disponible |

En los dos benchmarks disponibles, K2-Horizon-7B supera a los tres modelos de referencia citados por el autor, con una diferencia especialmente amplia en SWE-bench Verified. No se dispone de informacion suficiente para comparar contexto, licencia o requisitos de hardware de los modelos de referencia.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y evaluado unicamente en ingles (`en`), por lo que su rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo de alucinacion: no se proporcionan datos especificos sobre tasas de alucinacion ni mecanismos de mitigacion; es un riesgo inherente a los modelos generativos, especialmente en tareas de codigo y matematicas.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o equidad en la informacion disponible.
- Resultados de benchmark: los datos proceden exclusivamente de la model card del autor y no se han verificado de forma independiente. La tabla original esta truncada, por lo que la comparativa esta incompleta.
- Discrepancia de nomenclatura: el nombre comercial indica "7B", pero el recuento real de parametros en safetensors es de 8.999.178.240 (~9B), lo que debe tenerse en cuenta al planificar recursos.
- Contexto largo: aunque la ventana es de 524.288 tokens, no se documenta la degradacion de calidad en el extremo superior de la ventana ni el coste de memoria de la cache KV.
- Cuantizacion FP8: el autor afirma que el rendimiento es cercano al BF16, pero no se aportan metricas desglosadas que cuantifiquen la perdida exacta por tarea.
- Despliegue en entornos ligeros: no se publican pesos GGUF, lo que limita el uso directo en llama.cpp u Ollama sin conversion adicional.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento enlazados para confirmar su compatibilidad con el uso previsto.
- Fechas: el repositorio esta fechado en septiembre de 2026, con solo 648 descargas y 8 likes, por lo que la validacion por parte de la comunidad es todavia muy limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IFM/K2-Horizon-7B-FP8
- Modelo base (BF16): https://huggingface.co/IFM/K2-Horizon-7B
- Codigo de entrenamiento (LLM360/xllm): https://github.com/LLM360/xllm
- Codigo de evaluacion (Eval360-V2): https://github.com/LLM360/Eval360-V2
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data

La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces encontrados corresponden a entidades homonimas (ifm electronic, Institut Francais de la Mode, Intergroupe Francophone du Myelome) sin relacion con el modelo.
