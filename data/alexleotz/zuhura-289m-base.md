# AlexLeoTz/zuhura-289m-base

## Resumen

Zuhura 289M es un modelo de lenguaje causal (causal LM) desarrollado por AlexLeoTz, preentrenado desde cero sobre un corpus masivo de texto en swahili. Está basado en la arquitectura Llama y cuenta con aproximadamente 289 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños pero especializados. Su principal objetivo es ofrecer una alternativa nativa y eficiente para el procesamiento de swahili, un idioma de bajos recursos que los tokenizadores estándar fragmentan en exceso, reduciendo la capacidad efectiva de contexto y el rendimiento.

El modelo destaca por su tokenizador BPE byte-level personalizado, entrenado sobre 5 mil millones de tokens, que consigue una densidad de 1,13 tokens por palabra en swahili frente a los ~2,5 de los tokenizadores estándar. Esto duplica la capacidad efectiva de contexto para textos en swahili sin aumentar el número de parámetros. Aunque está optimizado para swahili, el 20 % de su corpus de entrenamiento es inglés y código Python, lo que le proporciona capacidades bilingües razonables y soporte para code-switching (swahinglish). Su licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-based Causal Language Model (Transformer decoder) |
| Parametros totales | 289.195.008 (~289 M) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en bfloat16; compatible con cuantizacion estandar GGUF/AWQ) |
| Idiomas soportados | swahili (sw), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Zuhura 289M sigue la arquitectura Llama, un transformer decoder causal con 24 capas, hidden size de 1024 y 16 cabezas de atencion. Emplea atencion de consulta agrupada (GQA) con una sola cabeza de clave/valor (1 KV head), lo que reduce el coste de memoria durante la inferencia. El tokenizador es un BPE byte-level personalizado con un vocabulario de 32.000 tokens, entrenado especificamente sobre el corpus de swahili para minimizar la fragmentacion de palabras.

El entrenamiento se realizo sobre el dataset `AlexLeoTz/swahili_large_corpus_i`, compuesto por aproximadamente 5 mil millones de tokens, con una composicion del 80 % de texto en swahili y 20 % de ingles y codigo Python. Se utilizo una unica instancia de NVIDIA A100 40GB, con el optimizador AdamW y un scheduler de tasa de aprendizaje coseno. El modelo alcanzo una loss final de 2,723 tras 37.400 pasos, completando una epoca sobre el corpus. No se menciona el uso de tecnicas de alineacion como RLHF o DPO; se trata de un modelo base sin fine-tuning instructivo.

## Capacidades

- Generacion de texto en swahili con alta fluidez nativa, incluyendo expresiones culturales, slang y referencias locales (por ejemplo, clubes de futbol tanzanos).
- Comprension y generacion de texto en ingles con gramatica correcta, aunque con menor precision que en swahili.
- Soporte de code-switching (swahinglish), mezclando ambos idiomas de forma natural en un mismo contexto.
- Generacion de codigo Python basico, gracias al 20 % de codigo en el corpus de entrenamiento.
- Tokenizacion eficiente para swahili: 1,13 tokens por palabra frente a ~2,5 de los tokenizadores estandar, lo que equivale a duplicar la capacidad efectiva de contexto.
- No se menciona soporte explicito para tool calling, function calling, agentes o razonamiento multi-paso. Es un modelo base, no instructivo.

## Casos de uso

- Atencion al cliente en swahili: el modelo puede gestionar conversaciones multi-turno en swahili con contexto de hasta 2048 tokens, suficiente para interacciones de soporte basico. Su tokenizador eficiente permite manejar aproximadamente 1.800 palabras por ventana, el doble que un modelo estandar del mismo tamano.
- Generacion de contenido localizado: creacion de articulos, noticias o narrativas en swahili que reflejen referencias culturales tanzanas y keniatas, util para medios de comunicacion o marketing regional.
- Traduccion automatica swahili-ingles: aunque no es un modelo de traduccion dedicado, su capacidad bilingue permite realizar traducciones aproximadas en entornos de bajo coste computacional.
- Asistente de programacion en entornos educativos: puede generar ejemplos de codigo Python y explicaciones en swahili, facilitando el aprendizaje de programacion a hablantes nativos.
- Preprocesamiento y aumentacion de datos: su tokenizador especializado puede utilizarse para segmentar texto en swahili de forma mas eficiente que los tokenizadores genericos, mejorando pipelines de NLP para este idioma.
- Investigacion en modelos de bajo recurso: sirve como punto de partida para fine-tuning en tareas especificas de swahili (clasificacion, extraccion de informacion) donde los modelos grandes no estan disponibles o son demasiado costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye comparaciones cualitativas con Google Gemma 2B en tareas de continuacion de texto en swahili e ingles, mostrando que Zuhura 289M produce respuestas mas naturales y culturalmente alineadas en swahili, mientras que Gemma 2B comete errores gramaticales y semanticos. Sin embargo, estos ejemplos no constituyen metricas cuantitativas y no deben interpretarse como una evaluacion estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 578 MB (289 M parametros × 2 bytes). Con cuantizacion de 4 bits, el modelo cabria en menos de 150 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para inferencia en bfloat16. Una RTX 3060 o superior permite ejecutar el modelo con margen para el contexto completo de 2048 tokens.
- Cabe en GPUs consumer de gama baja, como GTX 1650 (4 GB) o incluso en CPU con llama.cpp si se cuantiza a 4 bits.
- Opciones de despliegue: compatible con frameworks estandar como vLLM, llama.cpp, Ollama y Hugging Face Transformers. Al ser un modelo base, no requiere infraestructura especial.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado su tamano reducido, se espera una latencia de pocos milisegundos por token en una GPU moderna y un throughput alto en entornos de servidor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Zuhura 289M | 289 M | 2048 | sw, en | Apache 2.0 | Especializado en swahili, tokenizador propio |
| Gemma 2B | 2 B | 8192 | multi | Gemma Terms | Modelo generalista, peor rendimiento en swahili segun la model card |
| TinyLlama 1.1B | 1,1 B | 2048 | en, multi | Apache 2.0 | Modelo generalista, sin optimizacion para swahili |

La comparacion con Gemma 2B es cualitativa y proviene de la model card del autor. No se dispone de datos de benchmarks estandarizados para una comparacion cuantitativa. TinyLlama se menciona como referencia de un modelo pequeno generalista, pero no hay datos de rendimiento comparativo en swahili.

## Limitaciones y advertencias

- Es un modelo base sin fine-tuning instructivo: no sigue instrucciones de forma fiable ni soporta dialogos estructurados sin ajuste adicional.
- Riesgo de alucinacion: como todo modelo causal, puede generar contenido factualmente incorrecto, especialmente en ingles donde su entrenamiento es limitado.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos potenciales derivados del corpus de entrenamiento, que puede reflejar sesgos culturales o regionales de Tanzania y Kenia.
- Rendimiento en ingles inferior al de modelos generalistas del mismo tamano; su punto fuerte es exclusivamente el swahili.
- No se han publicado evaluaciones de seguridad, sesgos o robustez. No se recomienda su uso en produccion sin una evaluacion adicional.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de soporte ni mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/AlexLeoTz/zuhura-289m-base
- Demo en vivo: https://leoalex175--zuhura-289m-streaming-app-web.modal.run
- Dataset de entrenamiento: https://huggingface.co/datasets/AlexLeoTz/swahili_large_corpus_i (referenciado en la model card, no verificado)
