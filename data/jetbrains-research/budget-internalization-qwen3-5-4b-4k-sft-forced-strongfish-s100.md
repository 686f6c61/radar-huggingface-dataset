# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-sft-forced-strongfish-s100

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-sft-forced-strongfish-s100` es un ajuste fino supervisado (SFT) de Qwen/Qwen3.5-4B desarrollado por JetBrains-Research en el marco del articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. El objetivo es que el modelo interiorice un presupuesto fijo de razonamiento de 4.000 tokens, de modo que produzca respuestas correctas dentro de ese limite en lugar de depender del escalado en tiempo de inferencia (cadenas de razonamiento cada vez mas largas).

El entrenamiento emplea rejection-sampling finetuning sobre soluciones autogeneradas por el propio Qwen3.5-4B a problemas de matematicas del dataset DeepScaleR, filtradas por correccion y restringidas al subconjunto `4k-forced` (respuestas de 4k tokens cuyo resultado final se obtuvo mediante respuesta forzada). El checkpoint publicado corresponde al paso 100 del run interno `strongfish`.

Se trata de un modelo de investigacion de 4.539.265.536 parametros (4,54 B), con licencia Apache 2.0 heredada del modelo base, publicado en BF16 con pesos safetensors y compatible con la libreria transformers. Su relevancia radica en que aborda un problema practico de coste: reducir la longitud de las cadenas de razonamiento sin sacrificar precision dentro del presupuesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), pipeline image-text-to-text; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; la longitud maxima de secuencia usada en entrenamiento fue 18.432 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal (etiqueta de pipeline image-text-to-text) del que no se detallan en la informacion disponible ni la composicion de capas, ni el mecanismo de atencion, ni el volumen total de tokens de preentrenamiento. El ajuste realizado es un SFT estandar con perdida de siguiente token sobre la respuesta, con un unico epoch de 100 pasos, batches de 32 secuencias, longitud maxima de secuencia de 18.432 tokens, optimizador Adam con schedule coseno y LR pico de 5e-06, y pesos finales en BF16.

La innovacion tecnica no reside en la arquitectura, sino en la construccion de los datos: rejection-sampling finetuning sobre soluciones autogeneradas por el modelo base a problemas de matematicas de DeepScaleR, filtradas por correccion y restringidas al subconjunto `4k-forced`, es decir, respuestas generadas bajo un presupuesto de 4.000 tokens cuyo resultado final se produjo mediante respuesta forzada. Se usa una solucion por problema. El prompt de entrenamiento (turno de usuario, renderizado con la plantilla de chat del modelo base) instruye a pensar paso a paso y emitir la respuesta dentro de etiquetas `\boxed{}`. No se documenta en la informacion disponible el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento paso a paso orientado a problemas matematicos, con la respuesta final en formato `\boxed{}`.
- Razonamiento con presupuesto de tokens internalizado: el modelo ha sido entrenado para resolver dentro de un limite de 4k tokens en lugar de extender la cadena de razonamiento.
- Capacidad multimodal de entrada (image-text-to-text), heredada del modelo base Qwen3.5-4B; el alcance exacto de vision no se detalla en la informacion disponible.
- Soporte de conversacion multi-turno mediante la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso mas alla de la cadena de pensamiento: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de investigacion sobre presupuestos de razonamiento: el modelo sirve como referencia para medir la precision dentro de un limite fijo de 4k tokens frente a modelos que escalan en tiempo de inferencia, en el contexto del articulo de budget internalization.
- Resolucion de problemas matematicos con coste acotado: adecuado para pipelines donde el coste por consulta esta limitado por un maximo de tokens de salida y se necesita una respuesta final verificable en `\boxed{}`.
- Generacion de datos sinteticos de matematicas: puede producir soluciones paso a paso a problemas tipo DeepScaleR para construir datasets de entrenamiento o evaluacion, con la salvedad de que deben filtrarse por correccion.
- Baselines en experimentos de RLVR: util como punto de partida SFT sobre el que aplicar tecnicas de RL con recompensa verificable y comparar curvas de precision frente a longitud de respuesta.
- Prototipado de asistentes de resolucion de ejercicios: integrable via transformers con la plantilla de chat del modelo base para responder consultas de algebra y aritmetica con justificacion intermedia.
- Analisis de eficiencia en inferencia: permite estudiar el ahorro de tokens de salida y su impacto en latencia y coste en despliegues con limite estricto de generacion.
- Investigacion sobre multimodalidad aplicada a problemas con enunciado en imagen: al heredar el pipeline image-text-to-text, puede emplearse para explorar la resolucion de problemas matematicos presentados como imagen, aunque el alcance real no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica, se recomienda al menos 16 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4,5-5 GB para pesos; en 4 bits, en torno a 2,5-3 GB, sin contar cache KV ni overhead.
- GPU recomendadas para BF16: A100 (40/80 GB), H100, L40S o RTX 6000 Ada; para cuantizacion, RTX 4090, RTX 4080, RTX 3090 y GPU consumer con 12-24 GB.
- Cabe en GPU consumer: si, en cuantizacion de 8 o 4 bits en tarjetas de 8-12 GB o superiores; en BF16 requiere tarjetas de 16 GB o mas para contextos razonables.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-sft-forced-strongfish-s100 | 4,54 B | no disponible (entrenado con secuencias de hasta 18.432 tokens) | SFT con presupuesto de 4k tokens internalizado | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | 4 B | no disponible | Modelo generalista multimodal | Apache 2.0 (segun el modelo ajustado) | Hugging Face |
| Otros ajustes SFT/RLVR de Qwen3.5-4B para matematicas | ~4 B | no disponible | Razonamiento matematico con RLVR | variable | no disponible |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible: no se han publicado resultados de benchmarks en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion ni validacion externa.
- Especializado en matematicas y en el subconjunto `4k-forced` de DeepScaleR: el rendimiento fuera de ese dominio o con presupuestos distintos de 4k tokens no esta documentado.
- Riesgo de alucinacion en razonamientos largos y en problemas fuera de distribucion; las soluciones autogeneradas usadas en el entrenamiento pueden contener errores no detectados por el filtro de correccion.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredar el modelo base, arrastra los sesgos de este.
- Idiomas soportados no documentados; no hay garantia de calidad en castellano ni en idiomas distintos del usado en el dataset de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se hereda la licencia y condiciones del modelo base Qwen/Qwen3.5-4B, que deben verificarse por separado.
- La model card incluye la seccion de citacion como `TODO`; el articulo asociado no esta referenciado con enlace en la informacion disponible.
- El prompt de entrenamiento impone un formato concreto (pensamiento paso a paso y respuesta en `\boxed{}`); desviarse de ese formato puede degradar la calidad de la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-sft-forced-strongfish-s100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Articulo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: no disponible (sin enlace en la informacion proporcionada)
- Repositorio de codigo: no disponible
- Demo: no disponible
