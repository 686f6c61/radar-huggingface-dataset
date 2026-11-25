# bertholomus/Beam-1.0-501B-A23B-EXL3-3bpw-2xGB10

## Resumen

Beam-1.0-501B-A23B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Reflection, un laboratorio estadounidense, con 501.000 millones de parametros totales y 23.000 millones activos por token. Esta ficha concreta no contiene los pesos originales en BF16, sino una cuantizacion EXL3 de 3 bits realizada por Bertholomus AI sobre el modelo base `reflection/Beam-1.0-501B-A23B`, publicada bajo licencia Apache 2.0 y pensada para ejecutarse en hardware de consumo profesional: dos NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada una) conectadas por un enlace RoCE de 200 Gb/s en paralelo de tensores 2.

La relevancia de esta publicacion es fundamentalmente practica: demuestra que un modelo MoE de 501B puede servirse en dos nodos compactos con un peso de aproximadamente 194 GB de tensores, manteniendo una divergencia KL de 0,0121 frente al modelo BF16 y una tasa de acuerdo top-1 del 96,87 %. El repositorio incluye unicamente los pesos cuantizados; la plantilla de chat, el tokenizador y la model card original pertenecen a Reflection.

El modelo base no documenta en esta informacion el numero de tokens de entrenamiento, la composicion del dataset ni los idiomas soportados, por lo que esos apartados se marcan como no disponibles. La cuantizacion emplea 3 bits para los expertos enrutados (52 capas x 256 expertos) y 6 bits para atencion y MLPs densos, dejando embeddings, normas, router y `lm_head` en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con 52 capas y 256 expertos enrutados por capa |
| Parametros totales | 501B (modelo base); 96.795.809.472 parametros en los tensores safetensors del repo cuantizado |
| Parametros activos | 23B |
| Longitud de contexto | 868.352 tokens con TensorFold; 655.360 tokens con vLLM |
| Tipos de cuantizacion | EXL3 3 bits (expertos enrutados), 6 bits (atencion `qkv_gate_proj`, `o_proj` y MLPs densos), BF16 (embeddings, normas, router, `lm_head`); KV cache en fp8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 501B de parametros totales y 23B activos, organizado en 52 capas con 256 expertos enrutados por capa. La cuantizacion EXL3 conserva los expertos en 3 bits y eleva a 6 bits las proyecciones de atencion y los MLPs densos, mientras que embeddings, normas, router y cabeza de salida permanecen en BF16 en el fichero `nonexpert-00001.safetensors`. El proceso de conversion se realizo con `requant_seq.py` de diffbot (MIT) sobre exllamav3 v1.6.5 (commit `cdc785d`) de turboderp, usando 128 secuencias de calibracion.

El despliegue recomendado utiliza decodificacion especulativa mediante el drafter DFlash2 (`reflection/Beam-1.0-501B-A23B-DFlash2`, Apache 2.0, no incluido en este repo), con 3 a 5 tokens borrador y una longitud media de aceptacion de 2,76 a 2,96 en vLLM. El peso total ronda los 91 GiB por nodo, mas 1,6 GiB del drafter, y un pool KV de 5,9 GiB por nodo que alberga una peticion de 655.360 tokens. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional y continuacion de texto (`pipeline_tag: text-generation`).
- Razonamiento y generacion de codigo, con rendimiento medido en escenarios de prompt corto (2K) y largo (46K).
- Procesamiento de contextos muy largos: hasta 868.352 tokens con TensorFold y 655.360 con vLLM, con una prueba registrada de 632.185 tokens de prompt mas 8 tokens generados.
- Servicio multi-stream: 4 flujos concurrentes con agregados de 60 a 65 tok/s en decodificacion.
- Decodificacion especulativa integrada mediante DFlash2 para acelerar la generacion.
- Modo "thinking" desactivable (las mediciones de velocidad se hicieron con thinking off).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistencia de programacion en local: el modelo mantiene 45,5 tok/s en decodificacion de codigo con prompt de 2K y 28,6 tok/s con prompt de 46K en TensorFold, lo que permite integrarlo en un IDE o CLI de desarrollo sin enviar codigo a la nube.
- Analisis de repositorios completos: con 868.352 tokens de contexto en TensorFold se puede cargar un monorepo o una base de codigo extensa en una sola peticion y hacer preguntas transversales sobre arquitectura, dependencias o refactorizaciones.
- Procesamiento de documentacion legal o tecnica: la ventana de contexto permite ingerir contratos, manuales o especificaciones de cientos de miles de tokens y generar resumenes o extracciones sin troceado.
- Despliegue on-premise con requisitos de confidencialidad: al ejecutarse en dos DGX Spark propias, ningun dato sale de las maquinas, lo que encaja en entornos con restricciones de soberania del dato.
- Servicio conversacional multiusuario: con 4 flujos concurrentes a 60-65 tok/s agregados y un tiempo hasta el primer token de 0,39 s en reposo, es viable para un equipo pequeno de analistas o desarrolladores.
- Generacion aumentada por recuperacion (RAG) sobre corpus masivos: la combinacion de contexto largo y prefill de aproximadamente 1.400 tok/s permite inyectar decenas de miles de tokens de documentos recuperados por consulta.
- Evaluacion e investigacion de cuantizacion: el repo publica metricas de divergencia KL y acuerdo top-1 frente al BF16, lo que lo convierte en un caso de referencia para estudiar el impacto de EXL3 a 3 bits en modelos MoE grandes.

## Benchmarks y rendimiento

Calidad de la cuantizacion frente al modelo BF16 (conjunto `eval_neutral` de AtomicChat, 133 fragmentos x 4.096 tokens, 272.251 posiciones, top-128 logprobs):

| Metrica | TensorFold | vLLM |
|---|---|---|
| KL media | 0,0121 | 0,0132 |
| KL mediana | 0,00085 | 0,00098 |
| KL q99 | 0,166 | 0,177 |
| Acuerdo top-1 | 96,87 % | 96,66 % |
| Ratio de perplejidad vs BF16 | 1,0114 | 1,0125 |

Velocidad con TensorFold (dos DGX Spark, TP2, DFlash2, temperatura 0, medianas de 3 ejecuciones):

| Escenario | TensorFold | vLLM |
|---|---|---|
| Decodificacion, 1 flujo, codigo, prompt 2K | 45,5 tok/s | 33,4 tok/s |
| Decodificacion, 1 flujo, prosa, prompt 2K | 30,6 tok/s | 28,3 tok/s |
| Decodificacion, 1 flujo, codigo, prompt 46K | 28,6 tok/s | 29,7 tok/s |
| Decodificacion, 1 flujo, prosa, prompt 46K | 31,2 tok/s | 27,7 tok/s |
| Decodificacion, 4 flujos, codigo, prompt 2K (agregado) | 64,7 tok/s | 61,0 tok/s |
| Decodificacion, 4 flujos, prompt 46K (agregado) | 63,9 / 60,7 tok/s | 53,0 / 53,1 tok/s |
| Prefill, prompt 8K, prosa / codigo | 1.409 / 1.390 tok/s | 1.394 / 1.257 tok/s |
| Prefill, prompt 46K, prosa / codigo | 1.390 / 1.401 tok/s | 1.362 / 1.307 tok/s |
| Tiempo hasta primer token, chat corto, reposo / tras prompt frio de 46K | 0,39 s / 2,2 s | 0,44 s / 32,9 s |
| Ventana de contexto | 868.352 tokens | 655.360 tokens |

No se han publicado resultados de benchmarks de calidad del modelo base (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 91 GiB de pesos por nodo, mas 1,6 GiB del drafter DFlash2 por nodo. Pool KV de 5,9 GiB por nodo para una peticion de 655.360 tokens (9.216 bytes por posicion en fp8).
- Hardware soportado: dos NVIDIA DGX Spark (GB10, 128 GB de memoria unificada cada una), con paralelismo de tensores 2 sobre un par de puertos RoCE de 200 Gb/s.
- GPU consumer: no cabe en una GPU consumer convencional; el diseno esta pensado para el par de nodos GB10.
- Memoria de sistema: se recomienda mantener al menos 9 GiB libres por nodo bajo carga (minimo observado de 9,3 GiB). Si hay menos, reducir `KV_MEM` y `MAX_MODEL_LEN` conjuntamente (aproximadamente 1 GiB por cada 100K tokens).
- Opciones de despliegue: TensorFold (fork de Bertholomus, rama `beam-1.0-tp2`, sobre `nvcr.io/nvidia/pytorch:26.07-py3`), o vLLM con la imagen `vllm/vllm-openai:reflection-beam-arm64-cu130`, el plugin vllm-exl3 con el parche Beam de diffbot y ExLlamaV3.
- Latencia: 0,39 s hasta el primer token en reposo con TensorFold; 2,2 s detras de un prompt frio de 46K (frente a 32,9 s en vLLM).
- Throughput: 45,5 tok/s en decodificacion de codigo a un flujo; 60-65 tok/s agregados con 4 flujos; prefill de aproximadamente 1.400 tok/s.
- Prueba de prompt largo en vLLM: 632.185 tokens de entrada mas 8 de salida en 755,7 s (837 tok/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beam-1.0-501B-A23B EXL3 3bpw (esta ficha) | 501B totales / 23B activos | 868.352 (TensorFold) / 655.360 (vLLM) | EXL3 3 bits + 6 bits | Apache 2.0 | Hugging Face, 316 descargas |
| reflection/Beam-1.0-501B-A23B (BF16) | 501B totales / 23B activos | no disponible | BF16 | Apache 2.0 | Hugging Face |
| reflection/Beam-1.0-501B-A23B-DFlash2 (drafter) | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone en la informacion proporcionada de datos de otros modelos MoE comparables de tamano similar con los que contrastar parametros, contexto y rendimiento.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad: divergencia KL media de 0,0121 y ratio de perplejidad de 1,0114 frente al BF16, con un 3,13 % de desacuerdo top-1 en TensorFold.
- El repositorio contiene solo pesos cuantizados; la plantilla de chat, el tokenizador y la licencia pertenecen a Reflection y no deben modificarse sin revisar los terminos originales.
- El drafter DFlash2 no esta incluido y debe descargarse por separado desde Reflection para obtener las velocidades publicadas.
- El despliegue esta atado a un hardware muy concreto (dos DGX Spark GB10 con enlace RoCE); no hay datos de rendimiento en otras configuraciones.
- El contexto maximo depende del motor: 868.352 tokens en TensorFold frente a 655.360 en vLLM; usar una ventana mayor de la soportada por el motor puede degradar el servicio.
- La memoria libre por nodo es ajustada: por debajo de 9 GiB hay que reducir `KV_MEM` y `MAX_MODEL_LEN`, lo que recorta el contexto disponible.
- No hay informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni evaluaciones de seguridad del modelo base.
- El soporte de tool calling, agentes y multimodalidad no esta documentado en la informacion disponible, por lo que no debe asumirse en produccion.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y del drafter antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bertholomus/Beam-1.0-501B-A23B-EXL3-3bpw-2xGB10
- Modelo base: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Drafter DFlash2: https://huggingface.co/reflection/Beam-1.0-501B-A23B-DFlash2
- Repositorio de receta y scripts de lanzamiento: https://github.com/bertholomus/beam-1.0-2x-dgx-spark
- Version v0.2.0 de la receta: https://github.com/bertholomus/beam-1.0-2x-dgx-spark/tree/v0.2.0
- Fork de TensorFold: https://github.com/bertholomus/TensorFold
