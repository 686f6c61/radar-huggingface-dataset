# qtum/Qwen3-30B-A3B-FP8

## Resumen

Qwen3-30B-A3B-FP8 es una cuantizacion en punto flotante de 8 bits (FP8, esquema W8A8 dinamico) del modelo de lenguaje de mezcla de expertos (MoE) Qwen3-30B-A3B, desarrollado por Qwen y cuantizado por el usuario qtum. El modelo base pertenece a la serie Qwen3, que incorpora mejoras significativas en razonamiento, seguimiento de instrucciones, capacidades de agente y soporte multilingue. Esta version cuantizada reduce aproximadamente a la mitad el peso en memoria respecto al formato bf16 original, manteniendo una calidad cercana a la del modelo sin cuantizar, lo que la hace especialmente adecuada para despliegue eficiente en GPUs modernas con soporte nativo de FP8, como las arquitecturas Hopper y Blackwell.

Con 30.532 millones de parametros totales y solo 3.300 millones activos por token, el modelo ofrece un equilibrio entre capacidad y coste computacional. Su ventana de contexto nativa es de 32.768 tokens, ampliable a 131.072 mediante la tecnica YaRN. La cuantizacion se ha realizado con la herramienta llm-compressor y se distribuye en formato compressed-tensors, compatible con motores de inferencia como vLLM y SGLang, que detectan automaticamente el esquema de cuantizacion declarado en el archivo de configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) |
| Parametros totales | 30.532.122.624 (30,5B) |
| Parametros activos | 3,3B (segun aimodels.fyi) |
| Longitud de contexto | 32.768 tokens nativo; 131.072 con YaRN |
| Tipos de cuantizacion | FP8 (W8A8 dinamico) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3-30B-A3B es un transformer MoE con 48 capas, 32 cabezas de atencion de consulta (query) y 4 cabezas de clave-valor (KV). Dispone de 128 expertos en total, de los cuales se activan 8 por token, lo que explica que solo 3,3B de los 30,5B parametros participen en cada paso de inferencia. Esta arquitectura permite un coste computacional por token comparable al de un modelo denso de 3,3B, pero con la capacidad de un modelo mucho mayor.

La cuantizacion FP8 W8A8 dinamica se ha aplicado sobre los pesos del modelo base sin reentrenamiento, utilizando la libreria llm-compressor del proyecto vLLM. El esquema emplea pesos en punto flotante de 8 bits con escalas de activacion dinamicas, lo que resulta practicamente sin perdidas (near lossless) en la mayoria de tareas. No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados ni el proceso de alineacion (RLHF, DPO, etc.) en la documentacion proporcionada.

## Capacidades

- Generacion de texto y chat conversacional en ingles y chino, con formato de prompt ChatML (`<|im_start|>`, `<|im_end|>`).
- Razonamiento y seguimiento de instrucciones, con mejoras destacadas en la serie Qwen3 segun la documentacion de Cloudflare.
- Capacidades de agente y soporte de tool calling, mencionadas en las descripciones de la serie Qwen3.
- Inferencia eficiente gracias a la arquitectura MoE con pocos parametros activos.
- Compatibilidad con motores de inferencia que lean el formato compressed-tensors (vLLM, SGLang) sin necesidad de parametros adicionales.
- Extension de contexto hasta 131.072 tokens mediante la tecnica YaRN, util para tareas de ventana larga.

## Casos de uso

- Despliegue en produccion de asistentes conversacionales: el modelo puede servir como backend de chatbots multilingues (ingles y chino) con vLLM, aprovechando la cuantizacion FP8 para reducir el uso de VRAM y aumentar el throughput en GPUs con soporte nativo de FP8.
- Razonamiento y analisis de documentos largos: con 32.768 tokens de contexto nativo (ampliables a 131.072 con YaRN), es adecuado para resumir informes extensos, analizar contratos o procesar codigo fuente de gran tamano.
- Agentes autonomos y automatizacion de tareas: gracias a sus capacidades de agente y tool calling, puede integrarse en pipelines que requieran llamadas a APIs, busquedas web o ejecucion de acciones multi-paso.
- Generacion de codigo y asistencia a programadores: aunque no se han publicado benchmarks especificos, la serie Qwen3 ha demostrado competencia en tareas de programacion; el modelo puede usarse en entornos de desarrollo integrado o en herramientas de autocompletado.
- Sustitucion directa del modelo base en infraestructura existente: al ser una cuantizacion drop-in, puede reemplazar a Qwen3-30B-A3B en despliegues de vLLM o SGLang sin cambios en el codigo, reduciendo costes de memoria.
- Experimentacion e investigacion con modelos MoE: su tamano moderado y la cuantizacion FP8 lo hacen accesible para laboratorios con recursos limitados que deseen estudiar el comportamiento de arquitecturas de mezcla de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version cuantizada en la informacion disponible. La model card indica que la cuantizacion FP8 es "practicamente sin perdidas" y que reproduce el comportamiento del modelo base, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otras evaluaciones. Para obtener datos de rendimiento, se recomienda consultar la ficha del modelo base Qwen/Qwen3-30B-A3B en Hugging Face.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 31,2 GB (tamano del repositorio). Para inferencia, hay que anadir la memoria de activaciones y la cache KV, por lo que se recomienda al menos 40 GB de VRAM para un despliegue comodo con contexto estandar. Con batch pequeno y contexto reducido, podria operar en GPUs de 24 GB, aunque con limitaciones.
- GPUs recomendadas: arquitecturas con soporte nativo de FP8, como NVIDIA H100, H200, B200 (Blackwell) y RTX 4090 (Ada Lovelace). En GPUs sin aceleracion FP8, el rendimiento puede verse penalizado.
- Opciones de despliegue: vLLM y SGLang son los motores principales, ya que leen el formato compressed-tensors automaticamente. Tambien es posible usar otros motores compatibles con este formato.
- Latencia y throughput: no se han publicado datos especificos. En general, la cuantizacion FP8 reduce el uso de memoria y puede aumentar el throughput en comparacion con bf16, especialmente en GPUs con soporte nativo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-FP8 (este) | 30,5B | 3,3B | 32k (131k con YaRN) | Apache 2.0 | FP8 compressed-tensors |
| Qwen3-30B-A3B (base) | 30,5B | 3,3B | 32k (131k con YaRN) | Apache 2.0 | bf16 |
| Qwen3-32B (denso) | 32B | 32B | 32k (131k con YaRN) | Apache 2.0 | bf16 |
| DeepSeek-V2-Lite | 16B | 2,4B | 32k | MIT | bf16 |

La comparativa se basa en especificaciones publicas. No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La principal ventaja de la version FP8 frente al base es la reduccion de memoria y el aumento de throughput, a costa de una posible perdida minima de precision.

## Limitaciones y advertencias

- Idiomas limitados: el modelo esta entrenado principalmente en ingles y chino; su rendimiento en otros idiomas puede ser significativamente inferior.
- Contexto nativo de 32.768 tokens: aunque se puede ampliar con YaRN, la extension puede degradar la calidad en tareas que requieren atencion de larga distancia.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de hechos especificos.
- Sesgos del modelo base: no se han documentado sesgos especificos, pero los modelos de la serie Qwen pueden reflejar sesgos presentes en sus datos de entrenamiento.
- Cuantizacion FP8: aunque se considera practicamente sin perdidas, puede haber una ligera degradacion en tareas de alta precision numerica o razonamiento complejo en comparacion con el modelo en bf16.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener la atribucion y los avisos de licencia.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/qtum/Qwen3-30B-A3B-FP8
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Documentacion de Cloudflare AI: https://developers.cloudflare.com/workers-ai/models/qwen3-30b-a3b-fp8/
- Ficha en Clarifai: http://clarifai.com/qwen/qwenLM/models/Qwen3-30B-A3B-FP8
- Resumen en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3-30b-a3b-fp8-qwen
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
