# mradermacher/ThinkingNuke-gemma-4-26B-A4B-i1-GGUF

## Resumen

ThinkingNuke-gemma-4-26B-A4B-i1-GGUF es una cuantizacion GGUF del modelo ThinkingNuke-gemma-4-26B-A4B, un fine-tune de la familia Gemma 4 orientado a razonamiento (reasoning) y control de esfuerzo (effort-control). El modelo base fue desarrollado por krystofmitka y esta construido sobre una arquitectura Gemma 4 de tipo Mixture of Experts (MoE), como indica el sufijo "A4B" (aproximadamente 4 mil millones de parametros activos) y los 25.233.142.046 parametros totales registrados en los safetensors. La cuantizacion la firma mradermacher, un autor de referencia en el ecosistema GGUF.

El modelo resuelve el problema de desplegar un modelo de razonamiento de gran tamano en hardware modesto: gracias a los cuantizados i1 (imatrix) en formato GGUF, es posible ejecutar el modelo con entre 8,4 GB y 22,7 GB de peso segun el nivel de cuantizacion, lo que lo hace viable en GPUs de consumo. La relevancia actual reside en la combinacion de arquitectura MoE (que reduce los parametros activos por token) con cuantizacion de alta calidad y soporte de razonamiento explicito con control de esfuerzo.

La model card indica que se trata de un modelo de vision (vision model), con los ficheros mmproj, si existen, alojados en el repositorio estatico. La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a la licencia de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (Gemma 4), segun nomenclatura "A4B" |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | ~4 B (inferido del sufijo A4B; no confirmado en la documentacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | GGUF (cuantizaciones i1); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Gemma 4 con arquitectura Mixture of Experts: de los ~25,2 mil millones de parametros totales, solo una fraccion (aproximadamente 4 mil millones, segun el sufijo A4B) se activa por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. El fine-tune de krystofmitka esta orientado a razonamiento y control de esfuerzo, segun las etiquetas "reasoning" y "effort-control" de la model card.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion de mradermacher emplea el metodo i1 (imatrix), que usa un fichero de importancia de matrices para mejorar la calidad de las cuantizaciones de baja precision; la model card indica que los cuantizados IQ de tamano similar suelen ser preferibles a los no-IQ. Tambien se ofrece un repositorio de cuantizados estaticos (no-i1) como alternativa.

## Capacidades

- Generacion de texto y razonamiento explicito, con control del esfuerzo de razonamiento (effort-control) segun las etiquetas del modelo.
- Capacidades de vision: la model card lo describe como modelo de vision, con ficheros mmproj en el repositorio estatico si estan disponibles.
- Conversacion multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque el enfoque en reasoning lo hace plausible.
- Capacidades multilingues: solo se declara ingles (en).

## Casos de uso

- Razonamiento asistido en local: desplegar el modelo con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo para tareas de analisis y resolucion de problemas paso a paso, aprovechando el modo de razonamiento y el control de esfuerzo.
- Prototipado de agentes de razonamiento: usar la variante Q4_K_M (16,9 GB) como motor de un agente que descompone tareas en pasos, ajustando el esfuerzo de razonamiento segun la complejidad.
- Analisis de documentos con imagen: si se dispone de los ficheros mmproj del repositorio estatico, emplear el modelo para tareas de vision-lenguaje como descripcion de capturas o extraccion de informacion de imagenes.
- Experimentacion academica con cuantizacion: comparar la calidad de las distintas variantes i1 (desde IQ1_S hasta Q6_K) para estudiar el impacto de la cuantizacion en modelos MoE de razonamiento.
- Despliegue en entornos con VRAM limitada: usar las variantes IQ2 o Q3 (9-14 GB) en GPUs de 12-16 GB para tareas de chat y razonamiento de baja latencia.
- Evaluacion de fine-tunes de Gemma 4: servir como referencia cuantizada para comparar el fine-tune ThinkingNuke frente al Gemma 4 original en tareas de razonamiento.
- Generacion de codigo y matematicas: no hay evidencia en la informacion disponible de un rendimiento especifico en estas areas; se recomienda validar antes de usarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~8,4 GB (i1-IQ1_S) y ~22,7 GB (i1-Q6_K); la variante recomendada i1-Q4_K_M ocupa 16,9 GB.
- GPU recomendadas: para las variantes Q4_K_M y superiores, GPUs con 24 GB o mas (RTX 3090, RTX 4090, A100 40 GB, H100). Para variantes IQ2/IQ3, GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080).
- Cabe en GPU de consumo: si, en las variantes de menor tamano; las variantes Q5/Q6 requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingNuke-gemma-4-26B-A4B-i1-GGUF | ~25,2 B totales / ~4 B activos | no disponible | apache-2.0 | GGUF | Fine-tune de razonamiento con effort-control |
| ThinkingNuke-gemma-4-26B-A4B (base) | ~25,2 B totales | no disponible | apache-2.0 | safetensors | Modelo original sin cuantizar |
| Gemma 4 26B-A4B (original) | ~25,2 B totales | no disponible | licencia Gemma 4 | safetensors | Modelo base de Google sin fine-tune de razonamiento |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a los modelos de razonamiento; no hay evaluaciones publicadas que lo cuantifiquen.
- Las cuantizaciones de muy baja precision (IQ1, IQ2, Q2_K) degradan la calidad; la propia model card advierte de "very low quality" en algunas variantes.
- La licencia declarada es Apache 2.0, pero el enlace apunta a la licencia de Gemma 4 de Google; es necesario verificar las condiciones reales para uso comercial.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El modelo base es un fine-tune de terceros sobre Gemma 4; la calidad del fine-tune no esta validada con benchmarks publicos.
- El repositorio ocupa 301 GB, lo que implica descargas parciales de los ficheros GGUF concretos que se necesiten.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/ThinkingNuke-gemma-4-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/krystofmitka/ThinkingNuke-gemma-4-26B-A4B
- Cuantizados estaticos: https://huggingface.co/mradermacher/ThinkingNuke-gemma-4-26B-A4B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#ThinkingNuke-gemma-4-26B-A4B-i1-GGUF
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
