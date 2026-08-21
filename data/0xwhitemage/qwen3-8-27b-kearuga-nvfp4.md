# 0xWhiteMage/Qwen3.8-27B-Kearuga-NVFP4

## Resumen

Qwen3.8-27B-Kearuga-NVFP4 es una cuantización de alta fidelidad del modelo Qwen3.8-27B de Alibaba, desarrollada por el usuario 0xWhiteMage. El modelo original es un transformer híbrido de 27 000 millones de parámetros con capas de atención estándar y recurrencia lineal Gated DeltaNet, entrenado para soportar contextos de hasta 262 144 tokens. Esta versión cuantizada aplica una jerarquía de sensibilidad por capas inspirada en EXL3: conserva en BF16 las capas de embedding, la cabeza de salida y las capas límite, cuantiza a FP8 las proyecciones de atención y la recurrencia DeltaNet, y reduce a NVFP4 los bloques MLP intermedios.

El resultado es un checkpoint de 31,37 GiB (un 42 % menos que los 54,2 GiB del original en BF16) que mantiene una divergencia KL de 0,038 frente al modelo de referencia y una precisión prácticamente idéntica en GSM8K (92,1 % frente a 92,4 %) y HumanEval (85,9 % frente a 86,2 %). Está diseñado específicamente para inferencia de alto rendimiento con SGLang en NVIDIA DGX Spark (Blackwell SM121) y admite decodificación especulativa con un drafter DFlash2 que alcanza entre 65 y 82 tokens por segundo en decodificación de un solo stream.

La relevancia de este modelo radica en que demuestra que es posible ejecutar un modelo de 27B con contexto de 262K en hardware de memoria unificada de 128 GB sin sacrificar calidad, gracias a una cuantización por niveles que protege las partes más sensibles del modelo. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para despliegues locales y en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion estandar y recurrencia lineal Gated DeltaNet |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | NVFP4 (capas MLP intermedias), FP8 E4M3 (proyecciones de atencion y recurrencia), BF16 (embeddings, lm_head y capas limite) |
| Idiomas soportados | Ingles y chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y SGLang) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer hibrido que combina atencion por ventanas con una recurrencia lineal Gated DeltaNet, lo que le permite manejar contextos de 262 144 tokens con un coste computacional subcuadratico. La cuantizacion Kearuga no modifica la arquitectura, sino que aplica una jerarquia de sensibilidad por capas: las capas de embedding y la cabeza de salida se mantienen en BF16 para preservar el vocabulario exacto, las proyecciones de atencion (Q, K, V, O) y la proyeccion de entrada de la recurrencia DeltaNet se cuantizan a FP8 E4M3 para evitar la deriva del estado recurrente en contextos largos, y los bloques MLP de las capas 2 a 61 se reducen a NVFP4, el formato nativo de los Tensor Cores Blackwell.

El entrenamiento original del modelo base incluyo ajuste por instrucciones y probablemente fases de RLHF, aunque la informacion disponible no detalla el dataset ni el numero de tokens. La cuantizacion se evaluo midiendo la divergencia KL, la similitud coseno media y benchmarks de razonamiento y codigo, ademas de una prueba de aguja en el pajar a 262K tokens con resultados perfectos. No se menciona ningun proceso de fine-tuning posterior a la cuantizacion; el checkpoint se publica listo para inferencia.

## Capacidades

- Generacion de texto generalista con calidad equivalente al modelo original en BF16, segun las metricas de fidelidad reportadas.
- Razonamiento matematico: 92,1 % en GSM8K, practicamente identico al 92,4 % del modelo sin cuantizar.
- Generacion de codigo: 85,9 % en HumanEval Pass@1, frente al 86,2 % del original.
- Recuperacion de informacion en contexto largo: mantiene un 100 % de precision en la prueba de aguja en el pajar a 262 144 tokens, sin deriva mas alla de 64K.
- Decodificacion especulativa: compatible con el drafter DFlash2 en FP8 E4M3, alcanzando 65-82 tokens por segundo en decodificacion de un solo stream.
- Capacidades de agente y tool calling heredadas del modelo base Qwen3.8-27B, que esta disenado para cargas de trabajo agenteas.
- Multilingue limitado a ingles y chino, segun la model card.

## Casos de uso

- Asistente de codigo local en hardware de memoria unificada: con Ollama y OpenCode, el modelo puede ejecutarse como agente de codificacion en una maquina con 128 GB de RAM unificada, sin necesidad de servidores de inferencia separados. Su contexto de 262K permite cargar repositorios completos.
- Servicio de inferencia de alto rendimiento en DGX Spark: con SGLang y el drafter DFlash2, se puede servir el modelo a 65-82 tokens por segundo, adecuado para aplicaciones interactivas y chatbots con baja latencia.
- Analisis de documentos largos: la ventana de 262K tokens y la ausencia de deriva en la recuperacion permiten procesar libros, informes tecnicos o codigo fuente extenso en una sola pasada.
- Agente autonomo con razonamiento multi-paso: el modelo base soporta tool calling y planificacion, y esta cuantizacion mantiene esas capacidades, por lo que puede usarse como nucleo de agentes que interactuan con APIs y ejecutan tareas complejas.
- Generacion de codigo en produccion: con una perdida de solo 0,3 puntos en HumanEval, puede integrarse en pipelines de CI/CD para autocompletado, revision de codigo o generacion de pruebas, con un coste de memoria un 42 % menor que el modelo BF16.
- Investigacion en cuantizacion por niveles: el checkpoint sirve como referencia para estudiar el impacto de la cuantizacion selectiva en modelos hibridos con recurrencia, especialmente en la preservacion del estado recurrente en contextos largos.

## Benchmarks y rendimiento

La model card del autor incluye una tabla comparativa entre el modelo original en BF16, una cuantizacion uniforme NVFP4 y esta version Kearuga. Los datos son los siguientes:

| Metrica | Qwen3.8-27B (BF16) | Uniform NVFP4 | Kearuga NVFP4 |
|---|---|---|---|
| Peso en memoria | 54,2 GiB | ~23,0 GiB | 31,37 GiB |
| Divergencia KL | 0,000 (referencia) | 0,112 | 0,038 |
| Similitud coseno media | 1,0000 | 0,9780 | 0,9919 |
| GSM8K | 92,4 % | 88,6 % | 92,1 % |
| HumanEval Pass@1 | 86,2 % | 81,7 % | 85,9 % |
| Aguja en el pajar a 262K | 100 % | 94,2 % (deriva >64K) | 100 % |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de esta tabla. Los datos de velocidad (65-82 tok/s) provienen de la configuracion con decodificacion especulativa en DGX Spark.

## Requisitos de hardware

- Hardware objetivo: NVIDIA DGX Spark (GB10) con 128 GB de memoria unificada y arquitectura Blackwell SM121.
- VRAM estimada: el checkpoint pesa 31,37 GiB, por lo que cabe en la memoria unificada de 128 GB con margen para cache KV y overhead de inferencia.
- GPU compatibles: requiere hardware Blackwell con soporte nativo para NVFP4 (sm120/sm121). No es compatible con GPUs Ampere o anteriores sin emulacion, que degradaria el rendimiento.
- Opciones de despliegue: SGLang (recomendado, con soporte para decodificacion especulativa y cache KV en FP8), vLLM (con kernel FlashInferCutlassNvFp4LinearKernel para sm120), Ollama (para uso local como agente de codigo) y OpenCode.
- Latencia y throughput: 65-82 tokens por segundo en decodificacion de un solo stream con el drafter DFlash2 y 8 tokens de borrador, medido en DGX Spark.
- Para uso en consumer GPU: no es viable en GPUs de consumo actuales (RTX 4090, 3090) por la falta de soporte NVFP4 nativo y por el tamano del modelo; se necesitaria una cuantizacion adicional a 4 bits estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | GSM8K | HumanEval | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27B | 262K | BF16 | 92,4 % | 86,2 % | Apache 2.0 |
| Qwen3.8-27B-Kearuga-NVFP4 | 27B | 262K | NVFP4/FP8/BF16 | 92,1 % | 85,9 % | Apache 2.0 |
| Qwen3.8-27B (uniform NVFP4) | 27B | 262K | NVFP4 | 88,6 % | 81,7 % | Apache 2.0 |

La comparativa muestra que la cuantizacion Kearuga se situa muy cerca del modelo original en calidad, mientras que una cuantizacion uniforme NVFP4 pierde significativamente mas rendimiento. No se dispone de datos de otros modelos de 27B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion esta optimizada para hardware Blackwell (sm120/sm121); en otras arquitecturas el formato NVFP4 no es nativo y el rendimiento se degrada o requiere emulacion.
- El modelo base solo soporta ingles y chino; no hay garantias de calidad en otros idiomas.
- Aunque la divergencia KL es baja (0,038), no es cero: en tareas muy sensibles a la precision numerica (por ejemplo, calculos de coma flotante largos) puede haber diferencias frente al modelo BF16.
- La decodificacion especulativa requiere el drafter DFlash2 especifico; usar otro drafter puede reducir el rendimiento o fallar.
- El peso de 31,37 GiB es mayor que una cuantizacion uniforme NVFP4 (~23 GiB), por lo que no es la opcion mas agresiva en ahorro de memoria si la prioridad es minimizar el tamano.
- La informacion sobre el entrenamiento del modelo base (dataset, numero de tokens, fases de RLHF) no esta disponible en la documentacion proporcionada.
- Para produccion, se recomienda validar el comportamiento en el caso de uso concreto, especialmente en tareas de razonamiento largo o generacion de codigo complejo, dado que los benchmarks publicados son limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/0xWhiteMage/Qwen3.8-27B-Kearuga-NVFP4
- Drafter DFlash2: https://huggingface.co/0xWhiteMage/Qwen3.8-27B-Kearuga-DFlash2-FP8-E4M3
- Repositorio GitHub con recetas de despliegue: https://github.com/0xWhiteMage/Qwen3.8-27B-Kearuga-SGLang-DGX-Spark-DFlash2
- Overlay SGLang para DGX Spark: https://github.com/0xWhiteMage/Qwen3.8-27B-SGLang-Spark/tree/main
- Evaluaciones y receta champion: https://github.com/0xWhiteMage/qwen38-sglang-spark
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentacion de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Articulo de KDnuggets sobre uso local como agente de codigo: https://www.kdnuggets.com/run-qwen3-8-27b-as-a-local-ai-coding-agent-in-just-3-commands
