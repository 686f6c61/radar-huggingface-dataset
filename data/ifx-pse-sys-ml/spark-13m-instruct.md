# ifx-pse-sys-ml/spark-13m-instruct

## Resumen

spark-13m-instruct es un modelo de lenguaje pequeño (SLM) de 13,2 millones de parámetros, desarrollado por la organización ifx-pse-sys-ml (SYSML) con fines de investigación y prototipado rápido. Sigue la filosofía de SmolLM de Hugging Face, pero es aproximadamente diez veces más pequeño que SmolLM-135M. Está diseñado para estudiar los límites de los modelos diminutos, experimentar con rapidez y servir como backbone de decodificador ligero, por ejemplo, para un modelo visión-lenguaje (VLM) pequeño.

El modelo es un decoder estilo Llama con atención de consultas agrupadas (GQA), contexto de 1024 tokens y vocabulario inglés de 6400 tokens. Se entrenó primero en unos 17 000 millones de tokens (TinyStories, FineWeb-Edu y ClimbMix) y después se ajustó con instrucciones (SFT) sobre 200 000 conversaciones del dataset SmolTalk durante 5 épocas. Su licencia Apache 2.0 permite uso comercial sin restricciones, aunque su rendimiento académico es muy limitado, cerca del azar en tareas de conocimiento y razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformador causal) |
| Parametros totales | 13 227 648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura de decoder transformer estilo Llama con las siguientes caracteristicas: dimension oculta de 384, 6 capas, 6 cabezas de atencion con 2 cabezas de clave/valor (GQA), dimension intermedia de 1216, embeddings rotatorios (RoPE) y un vocabulario BPE ingles de 6400 tokens. El contexto maximo es de 1024 tokens. El decoder acepta tanto `input_ids` como `inputs_embeds`, lo que permite insertar tokens visuales desde un proyector de vision y usarlo como backbone de texto para un VLM pequeno.

El entrenamiento se realizo en dos fases. Primero, un preentrenamiento sobre aproximadamente 17 000 millones de tokens procedentes de TinyStories, FineWeb-Edu y ClimbMix, logrando una perplejidad de 21,98 en Wikipedia. Despues, un ajuste con instrucciones (SFT) sobre 200 000 conversaciones del dataset SmolTalk durante 5 epocas. El ajuste con instrucciones anade formato de respuesta, pero no conocimiento factual, por lo que el rendimiento en benchmarks academicos es practicamente identico al del modelo base. Se uso el codigo de entrenamiento Nexus.

## Capacidades

- Generacion de texto en ingles con formato de chat (instrucciones y conversaciones multi-turno).
- Razonamiento basico y sentido comun limitado, con senal real solo en tareas donde el patron supera al conocimiento almacenado (p. ej., PIQA 60,4 % en el modelo base).
- Acepta `inputs_embeds` para integrar tokens de vision, lo que lo hace util como backbone de texto para un VLM pequeno.
- Soporte de chat mediante `apply_chat_template` de Transformers.
- No se documenta soporte de tool calling, agentes, ni capacidades multilingues (solo ingles).
- No dispone de modo de pensamiento (thinking mode) ni capacidades de audio o vision propias.

## Casos de uso

- Investigacion sobre limites de modelos pequenos: permite estudiar que habilidades emergen (o no) con 13M de parametros, comparando con SmolLM-135M y otros SLM.
- Prototipado rapido de pipelines de generacion de texto: al ser minusculo, se puede iterar en segundos en CPU o GPU, ideal para validar logica de aplicaciones antes de escalar a modelos mayores.
- Backbone de texto para un VLM pequeno: gracias a la aceptacion de `inputs_embeds`, se puede conectar un proyector de vision y entrenar un modelo vision-lenguaje compacto para tareas simples como clasificacion de imagenes con descripcion breve.
- Ensenanza y demostraciones educativas: sirve para explicar arquitecturas transformer, atencion GQA, ajuste con instrucciones y evaluacion con harness estandar, sin necesidad de hardware potente.
- Pruebas de integracion en entornos con recursos limitados: por su tamano, puede ejecutarse en microcontroladores o dispositivos edge (aunque no hay datos oficiales de despliegue), o en CI/CD para validar flujos de generacion.
- Generacion de datos sinteticos de baja calidad controlada: para experimentos donde se necesita un modelo debil y rapido como linea base, por ejemplo en evaluacion de metricas o deteccion de alucinaciones.

## Benchmarks y rendimiento

La model card incluye resultados de lm-evaluation-harness 0.4 con el mismo harness y disparos para todos los modelos, por lo que las columnas son directamente comparables. Los valores de SmolLM del blog oficial usan otro harness (lighteval) y no se citan aqui.

| Benchmark | chance | spark-13m-base | spark-13m-instruct | SmolLM-135M | SmolLM-135M-Instruct |
|---|---|---|---|---|---|
| hellaswag | 25 | 28,0 | 28,3 | 42,6 | 41,9 |
| arc_easy | 25 | 38,3 | 34,2 | 56,1 | 43,9 |
| arc_challenge | 25 | 21,4 | 24,7 | 28,9 | 27,4 |
| piqa | 50 | 60,4 | 56,7 | 68,4 | 67,0 |
| winogrande | 50 | 50,1 | 50,6 | 53,2 | 51,3 |
| openbookqa | 25 | 25,4 | 26,0 | 34,0 | 33,6 |
| commonsense_qa | 20 | 21,5 | 22,4 | 19,8 | 20,3 |
| mmlu | 25 | 24,2 | 25,3 | 25,2 | 24,4 |
| **average** | — | **33,7** | **33,5** | **41,0** | **38,7** |

El modelo esta cerca del azar en tareas de conocimiento y razonamiento duro (MMLU, OpenBookQA, ARC-Challenge, Winogrande). Conserva senal real solo en PIQA (60,4) y ARC-Easy (38,3), donde el sentido comun o el patron superan al conocimiento almacenado.

## Requisitos de hardware

- Con 13,2 millones de parametros, el modelo en FP32 ocupa aproximadamente 53 MB y en FP16 unos 26 MB. Cabe en cualquier GPU moderna, incluso en las mas basicas, y tambien se puede ejecutar en CPU con soltura.
- No se han publicado requisitos oficiales de VRAM ni latencia. Por su tamano, es viable en GPUs de consumo como una GTX 1650 o incluso en Raspberry Pi (con limitaciones de velocidad).
- Opciones de despliegue: al ser un modelo de Transformers con safetensors, se puede cargar con la libreria `transformers` directamente. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, pero por su tamano cualquier framework de inferencia generico deberia funcionar.
- La latencia en CPU sera de milisegundos por token; en GPU, practicamente despreciable. No hay datos de throughput oficiales.

## Comparativa con modelos similares

La unica comparacion publicada es con SmolLM-135M (base e instruct), que es aproximadamente 10 veces mayor. No se dispone de datos de otros modelos de tamano similar (p. ej., TinyLlama, pero ese es de 1,1B, mucho mayor). La comparacion se limita a los datos de la tabla de benchmarks anterior.

| Modelo | Parametros | Contexto | Licencia | Media en benchmarks (harness) |
|---|---|---|---|---|
| spark-13m-instruct | 13,2M | 1024 | Apache 2.0 | 33,5 |
| SmolLM-135M-Instruct | 135M | 2048 (segun documentacion de SmolLM) | Apache 2.0 | 38,7 |
| SmolLM-135M (base) | 135M | 2048 | Apache 2.0 | 41,0 |

La diferencia de rendimiento es notable, pero el modelo de 13M es mucho mas ligero y rapido, adecuado para experimentos donde el coste computacional es critico.

## Limitaciones y advertencias

- Rendimiento cerca del azar en tareas de conocimiento y razonamiento complejo (MMLU, OpenBookQA, ARC-Challenge, Winogrande). No es util como modelo de conocimiento general.
- Solo soporta ingles. No hay capacidades multilingues.
- El ajuste con instrucciones anade formato de respuesta, pero no hechos nuevos; el rendimiento academico es practicamente igual al del modelo base.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- No se documentan sesgos especificos, pero al entrenarse con TinyStories y FineWeb-Edu, puede reflejar sesgos presentes en esos datasets.
- Riesgo de alucinacion alto en tareas de conocimiento, dado que el modelo no tiene capacidad de almacenar hechos.
- No se proporcionan pesos cuantizados ni guias de despliegue en produccion; es un modelo de investigacion y prototipado, no apto para aplicaciones criticas.
- La licencia Apache 2.0 permite uso comercial, pero el rendimiento limitado hace que su uso en produccion sea poco practico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ifx-pse-sys-ml/spark-13m-instruct
- Organizacion ifx-pse-sys-ml: https://huggingface.co/ifx-pse-sys-ml
- Blog de SmolLM (referencia de filosofia): https://huggingface.co/blog/smollm
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
