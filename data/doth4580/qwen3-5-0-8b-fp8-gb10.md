# doth4580/Qwen3.5-0.8B-FP8-GB10

## Resumen

Qwen3.5-0.8B-FP8-GB10 es un paquete de pesos cuantizados en FP8 del modelo Qwen3.5-0.8B, desarrollado por el equipo Qwen y empaquetado por el usuario doth4580. El modelo base es un transformer de 873 millones de parametros (0,8B) con capacidades multimodales segun la model card original, orientado a prototipado, ajuste fino especifico de tarea y desarrollo e investigacion. Esta version concreta aplica una receta de cuantizacion `all:fp8` (todas las GEMM en FP8) sobre el modelo original, manteniendo tokenizer, plantilla de chat y configuracion intactos salvo el bloque `quantization_config`.

El paquete esta publicado principalmente para el motor de inferencia veloGB10 (`gb10_inference`), disenado para ejecutarse en una, dos o cuatro maquinas NVIDIA DGX Spark / GB10. Los pesos usan el formato estandar `compressed-tensors`, por lo que cualquier framework que lea dicho formato puede cargarlos. El repositorio incluye un fichero auxiliar `ple_ngram_nvfp4.bin` que solo utiliza veloGB10 y que otros frameworks ignoran.

La relevancia de esta ficha radica en que documenta un caso de cuantizacion de precision reducida (FP8) sobre un modelo pequeno de la familia Qwen3.5, con mediciones de rendimiento reales sobre hardware GB10 y soporte de decodificacion especulativa mediante cabezal MTP. Es un ejemplo representativo de la tendencia a empaquetar modelos para motores de inferencia concretos con el objetivo de maximizar throughput en hardware de borde y estaciones de trabajo con aceleradores dedicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), segun model card del modelo base |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | 262.144 tokens (segun flags de ejemplo `--max-seq-len 262144`) |
| Tipos de cuantizacion | FP8 (receta `all:fp8`), contenedor `nvfp4-pack-quantized` con pesos FP8, formato `compressed-tensors` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con layout `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer de la familia Qwen3.5, que segun la model card original integra avances en aprendizaje multimodal, eficiencia arquitectonica, escala de aprendizaje por refuerzo y accesibilidad global. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO aplicadas al modelo base. La model card original menciona que se trata de un modelo post-entrenado distribuido en formato Hugging Face Transformers, compatible con Transformers, vLLM, SGLang y KTransformers.

La innovacion tecnica de este paquete concreto es la cuantizacion FP8 de todas las operaciones GEMM mediante el cuantizador offline de veloGB10, junto con la inclusion de un cabezal MTP (multi-token prediction) que habilita decodificacion especulativa. El motor veloGB10 soporta ademas cache de prefijos (`--prefix-cache on`) y paralelismo de tensor (TP) entre una, dos o cuatro maquinas GB10, con transferencia de pesos bajo demanda a los nodos y cache local para evitar retransmisiones en arranques posteriores.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.5-0.8B esta orientado a tareas de prototipado y desarrollo, con modo de pensamiento (thinking) activado por defecto en las mediciones de veloGB10.
- Capacidades multimodales: la model card original menciona integracion de aprendizaje multimodal en la familia Qwen3.5, aunque no se detalla el alcance concreto en el modelo de 0,8B.
- Decodificacion especulativa: el paquete incluye un cabezal MTP que acelera la decodificacion, con tasas de aceptacion medidas entre 12,3% y 63,8% segun topologia.
- Soporte de contexto largo: ventana de hasta 262.144 tokens segun los flags de ejemplo del motor.
- Compatibilidad con tool calling y function calling: no disponible en la informacion proporcionada para esta version cuantizada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Servidor compatible con API OpenAI: el motor veloGB10 expone `http://<head-ip>:9000/v1`.

## Casos de uso

- Prototipado rapido de aplicaciones de chat: el modelo puede servir como backend de un chatbot con contexto de hasta 262.144 tokens, adecuado para iterar sobre prompts y plantillas sin incurrir en costes de modelos mayores. Su tamano de 0,8B permite ciclos de desarrollo rapidos.
- Ajuste fino especifico de tarea: al ser un modelo pequeno con licencia Apache 2.0, es viable reentrenar o adaptar con LoRA sobre dominios concretos (atencion al cliente, extraccion de informacion, clasificacion) en hardware modesto.
- Inferencia en estaciones DGX Spark / GB10: el paquete esta optimizado para veloGB10 con TP=1, 2 o 4, lo que permite desplegar el modelo en una sola maquina GB10 con throughput de decodificacion de hasta 160 tok/s en turnos de codigo.
- Procesamiento de documentos largos: gracias a la ventana de 262.144 tokens y a la cache de prefijos, el modelo puede resumir o extraer informacion de documentos extensos manteniendo el contexto entre peticiones relacionadas.
- Generacion de codigo asistida en entornos de desarrollo: las mediciones de veloGB10 incluyen turnos de codigo con 160 tok/s en TP=1, lo que lo hace util para autocompletado y generacion de fragmentos en IDE o pipelines internos.
- Despliegue multi-nodo en laboratorio o cluster pequeno: con TP=2 o TP=4 y transferencia de pesos bajo demanda, se puede escalar horizontalmente sin copiar el modelo a cada nodo, lo que simplifica la operacion en entornos con varias GB10.
- Evaluacion comparativa de cuantizacion FP8: investigadores pueden usar este paquete para medir el impacto de FP8 frente a BF16 en calidad y latencia sobre el mismo modelo base.

## Benchmarks y rendimiento

Los datos disponibles corresponden a mediciones de VeloBench sobre el motor veloGB10 en maquinas NVIDIA DGX Spark-class GB10 (2026-11-06, builds de desarrollo de veloGB10 0.7.7), con sampling de produccion, thinking activado y decodificacion especulativa incluida. Una ejecucion por celda, con variacion aproximada de ±10%.

| Topologia | Fuente de draft | Decode turno de codigo (tok/s) | Decode turno de historia (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion de draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | cabezal MTP del paquete | 160 | 148 | 97 | 12.559 | 308 | 32,6% |
| TP=2 | cabezal MTP del paquete | 190 | 142 | 97 | 11.722 | 298 | 63,8% |
| TP=4 | cabezal MTP del paquete | 141 | 124 | 83 | 9.369 | 299 | 12,3% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,0 GB en total, por lo que los pesos FP8 caben holgadamente en cualquier GPU con al menos 2 GB de VRAM libre, dejando margen para cache KV segun la longitud de contexto utilizada.
- GPU recomendadas: NVIDIA DGX Spark / GB10 (hardware objetivo del paquete), con soporte de TP entre 1 y 4 maquinas. Tambien deberia funcionar en GPUs con soporte FP8 como H100, H200 o L40S mediante frameworks que lean `compressed-tensors`, aunque no hay mediciones disponibles para esas plataformas en la informacion proporcionada.
- Cabe en consumer GPU: si, por tamano (0,8B en FP8), en GPUs consumer con soporte de FP8 o mediante conversion a otros formatos; no se dispone de mediciones concretas en RTX 4090 u otras consumer en la informacion proporcionada.
- Opciones de despliegue: veloGB10 (`gb10_inference`) como motor principal probado; el formato `compressed-tensors` es legible por otros frameworks, y el modelo base es compatible con Hugging Face Transformers, vLLM, SGLang y KTransformers segun la model card original.
- Latencia y throughput estimados: decodificacion entre 83 y 190 tok/s segun topologia y tipo de turno; prefill entre 9.369 y 12.559 tok/s; agregado con 2 peticiones concurrentes en torno a 298-308 tok/s.
- Red: en TP=2 y TP=4 los nodos no necesitan copia del modelo; el head envia los pesos por red y los nodos los cachean localmente. Con dos pares de puertos RoCE activos se puede seleccionar el rail mediante `--rdma-dev`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| doth4580/Qwen3.5-0.8B-FP8-GB10 | 0,87B | 262.144 | Apache 2.0 | safetensors (compressed-tensors, FP8) | Paquete optimizado para veloGB10 con MTP y mediciones en GB10 |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible en la informacion | Apache 2.0 | safetensors (Transformers) | Modelo base original, sin cuantizar; compatible con Transformers, vLLM, SGLang, KTransformers |
| Otros modelos de ~1B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone en la informacion proporcionada de datos de rendimiento de calidad (benchmarks) que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; al ser un modelo de 0,8B, es esperable una menor robustez frente a sesgos que modelos mayores, pero no hay datos concretos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; los modelos pequenos tienden a una mayor tasa de alucinacion en tareas de conocimiento factual.
- Limitaciones de contexto o idioma: aunque la ventana es de 262.144 tokens, no se especifican los idiomas soportados ni la calidad por idioma. El rendimiento en contextos muy largos no esta medido en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el paquete es una modificacion (cuantizacion) del modelo original; los derechos de propiedad intelectual permanecen en los autores originales. El autor del paquete no reclama propiedad sobre pesos, arquitectura ni documentacion.
- Caveats para produccion: el paquete esta probado y medido exclusivamente con veloGB10 0.7.7 en builds de desarrollo; otras plataformas no tienen validacion publicada. Las mediciones son de una sola ejecucion por celda con ±10% de variacion. El fichero `ple_ngram_nvfp4.bin` es especifico de veloGB10 y otros frameworks lo ignoran. El modelo base esta declarado por sus autores como orientado a prototipado, ajuste fino e investigacion, no necesariamente a produccion de alta exigencia.
- Dependencia del motor: el rendimiento medido (incluida la decodificacion especulativa y la aceptacion de draft) depende de veloGB10; en otros motores el comportamiento puede diferir sustancialmente.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/doth4580/Qwen3.5-0.8B-FP8-GB10
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Qwen Chat: https://chat.qwen.ai
