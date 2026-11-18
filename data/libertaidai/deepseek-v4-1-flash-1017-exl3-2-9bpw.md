# LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw es una cuantizacion EXL3 (formato trellis de ExLlamaV3) del modelo DeepSeek-V4.1-Flash-1017, publicado por LibertAIDAI. El modelo base lo desarrolla DeepSeek y se distribuye bajo licencia MIT. Esta version comprime los pesos del trunk cuantizado a una media de 2,90 bits por peso (bpw), con la cabeza de salida a 6 bpw, dando un total de 210,7 GB (196,3 GiB) repartidos en 43 shards de safetensors. El objetivo es hacer servible un modelo MoE de gran tamano en hardware con memoria limitada, sacrificando muy poco en calidad: la perplexity aumenta solo un 1,8 % en codigo y un 0,4 % en prosa respecto al modelo sin cuantizar.

El modelo base es un transformer MoE con 105.318.449.362 parametros totales (segun los safetensors del repo), e incluye torre de vision en BF16, cabezas MTP/DSpark para decodificacion especulativa y un mecanismo Engram de tablas n-gram. La cuantizacion conserva nombres de tensores, dtypes y bitrates por tensor identicos al kit de Mia-AiLab, de modo que las herramientas de serving existentes (por ejemplo, el kit para 2x DGX Spark) pueden describirlo sin cambios. Las dos tablas Engram (unas 95 GiB cada una) no estan incluidas en este repo y deben tomarse del checkpoint base 1017 sin cuantizar.

La relevancia practica de esta ficha es que permite evaluar rapidamente si esta variante cuantizada encaja en un despliegue concreto: reduccion de huella de memoria, perdida de calidad medida, requisitos de hardware y compatibilidad con runtimes. Es una publicacion comunitaria (6311 descargas y 63 likes en el momento de la consulta), no oficial de DeepSeek, por lo que conviene tratarla como artefacto de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v41), con atencion comprimida, indexer, Engram, torre de vision y cabezas MTP/DSpark; cuantizacion EXL3 trellis |
| Parametros totales | 105.318.449.362 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 trellis (codebook `mul1`, escalas de canal de salida `always`); 2,90 bpw de media en el trunk, cabeza a 6 bpw; expertos enrutados a 3 bpw (capas 18-22 a 2 bpw); expertos compartidos 4-5 bpw; atencion 5 bpw; drafter MTP 4-6 bpw; embeddings en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3 trellis int16 + suh/svh fp16 + mul1 int32), 43 shards |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer con mezcla de expertos (MoE) que incorpora varias innovaciones: atencion con compresor de KV en determinadas capas (2, 8, 14, 20), un indexer disperso en las capas 2, 8, 14, 20, 24, 28, 32 y 36, y dos tablas Engram de lookup n-gram en las capas 1 y 14 (FP8 con escalas de bloque E8M0, unas 95 GiB cada una). Tambien incluye una torre de vision con aligner en BF16, que permite entrada de imagenes, y cabezas MTP/DSpark (multitoken prediction) para decodificacion especulativa, con expertos enrutados propios y cabezas markov/confidence.

Esta publicacion no entrena el modelo, solo lo cuantiza. La cuantizacion EXL3 usa representacion trellis con codebook `mul1` y escalas de canal de salida, aplicando bitrates distintos por grupo de tensores: expertos enrutados a 3 bpw (2 bpw en las capas 18-22), expertos compartidos a 5 bpw en las capas 0-10 y 30-39 y a 4 bpw en 11-28 (con la capa 29 en 4/5), atencion y compresor/indexer a 5 bpw, embeddings en BF16 y router en FP16/FP32. La perplexity se midio sobre dos conjuntos reservados de 32 secuencias x 2048 tokens (65.504 tokens puntuados por conjunto) con forward de secuencia completa: codigo 1,9094 frente a 1,8749 del base sin cuantizar, y prosa 6,4520 frente a 6,4277. Una comprobacion de cordura con Engram desactivado dispara la perplexity a 4,1648 (codigo) y 9,0627 (prosa), lo que evidencia que las tablas Engram son imprescindibles para el funcionamiento correcto.

## Capacidades

- Generacion de texto conversacional y de codigo, con modo de razonamiento configurable (`reasoning_effort` con valores bajo 50, alto 75 por defecto y maximo 100).
- Razonamiento multi-paso y uso agentico con herramientas: el modelo mantiene el razonamiento de cada turno en el prompt y lo relee en turnos posteriores.
- Soporte de tool calling / function calling, implicito en el uso agentico descrito en la model card.
- Entrada multimodal de imagenes mediante la torre de vision incluida en BF16.
- Decodificacion especulativa mediante las cabezas MTP/DSpark incluidas, que aceleran la generacion.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Plantilla de chat incluida (`chat_template.jinja`), port en Jinja del encoder 1017 de DeepSeek, verificado byte a byte sobre 8.455 casos de prueba.

## Casos de uso

- Despliegue en hardware de memoria ajustada: la cuantizacion a 2,90 bpw reduce el trunk a 196,3 GiB, lo que permite servir un MoE de 105.000 millones de parametros en nodos con memoria inferior a la necesaria para pesos BF16, con una perdida de perplexity de solo 1,8 % en codigo.
- Serving con el kit de Mia-AiLab para 2x DGX Spark: al mantener nombres de tensores y bitrates identicos, el kit existente puede cargar este repo sin reconfigurar el mapa K, lo que simplifica el despliegue en estaciones DGX Spark emparejadas.
- Asistencia de codigo agentica: el modelo soporta tool calling y razonamiento multi-paso; con `reasoning_effort` alto (75) se obtiene calidad equivalente a maximo a 0,55-0,8x del coste, util en pipelines de CI/CD y revision automatizada de codigo.
- Evaluacion comparativa de cuantizaciones: al existir variantes 2,9 bpw y 3,5 bpw del mismo base, se puede medir el compromiso entre huella de memoria y perplexity (1,9094 frente a 1,8895 en codigo) antes de fijar una configuracion de produccion.
- Tareas multimodal ligeras: la torre de vision en BF16 permite procesar imagenes junto a texto (por ejemplo, descripcion de capturas o extraccion de datos de documentos) sin perder la parte visual en la cuantizacion.
- Inferencia de baja latencia con decodificacion especulativa: las cabezas MTP/DSpark incluidas permiten generar varios tokens por paso, adecuado para chat interactivo y autocompletado.
- Investigacion sobre tecnicas Engram: al requerir tablas n-gram externas, sirve como banco de pruebas para estudiar el impacto de estos mecanismos de lookup en modelos MoE.

## Benchmarks y rendimiento

Resultados de perplexity publicados en la model card (conjuntos reservados de 65.504 tokens por conjunto, forward de secuencia completa):

| Modelo | Tamano | Perplexity codigo | Perplexity prosa |
|---|---|---|---|
| Base sin cuantizar (FP8/MXFP4 dequantizado) | — | 1,8749 | 6,4277 |
| EXL3 2,9 bpw (este repo) | 196,3 GiB | 1,9094 | 6,4520 |
| EXL3 3,5 bpw | 239,9 GiB | 1,8895 | 6,4341 |
| Este repo con Engram desactivado | — | 4,1648 | 9,0627 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card menciona un benchmark interno sobre los pesos 1017 originales (3.738 tareas: codigo agentico, tau-bench, LiveCodeBench, AIME y chat) que compara niveles de `reasoning_effort`, pero no se detallan puntuaciones numericas.

## Requisitos de hardware

- VRAM/ memoria estimada: 196,3 GiB para los pesos cuantizados del trunk, mas las dos tablas Engram del base (unas 95 GiB cada una, ~190 GiB adicionales) que deben cargarse sin cuantizar. La huella total supera los 380 GiB, por lo que no cabe en una GPU consumer.
- GPU recomendadas: nodos multi-GPU de alta memoria; el kit de referencia esta pensado para 2x DGX Spark. Para GPUs de datacenter tipo A100/H100 se requieren varias unidades en paralelo para alojar pesos y tablas Engram.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en GPUs de 48 GB; la cuantizacion reduce el trunk pero las tablas Engram externas impiden el despliegue en una sola tarjeta consumer.
- Opciones de despliegue: ExLlamaV3 (formato nativo EXL3), kits basados en vLLM con encoder DeepSeek integrado, y el kit MiaAI-Lab/DeepSeek-v4.1-Flash-EXL3-2x-DGX-Sparks. Runtimes que exigen plantilla al arrancar pueden usar el `chat_template.jinja` incluido; se ha verificado renderizado identico bajo Jinja de Python y el motor Zig de TensorFold.
- Latencia y throughput: no disponible en la informacion proporcionada. La decodificacion especulativa MTP/DSpark incluida puede reducir latencia por token, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity (codigo/prosa) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (EXL3 2,9 bpw) | 105,3 B totales | no disponible | 1,9094 / 6,4520 | MIT | Hugging Face, 210,7 GB |
| LibertAIDAI EXL3 3,5 bpw | 105,3 B totales | no disponible | 1,8895 / 6,4341 | MIT | Hugging Face, 239,9 GiB |
| Base DeepSeek-V4.1-Flash-1017 (FP8/MXFP4) | 105,3 B totales | no disponible | 1,8749 / 6,4277 | MIT | Hugging Face (oficial) |
| Mia-AiLab EXL3 2,9 bpw | 105,3 B totales | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de perplexity ni de benchmarks de modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Las tablas Engram no estan incluidas: hay que tomarlas del checkpoint base 1017 (shards 47 y 48). Sin ellas la perplexity se degrada drasticamente (4,1648 en codigo), por lo que un despliegue incompleto produce resultados invalidos.
- Perdida de calidad medible: +1,8 % en codigo y +0,4 % en prosa respecto al base sin cuantizar; en tareas sensibles a precision conviene validar con evaluaciones propias.
- Publicacion comunitaria de terceros (LibertAIDAI), no oficial de DeepSeek; la responsabilidad de validacion recae en quien despliega.
- El coste de razonamiento se acumula en uso agentico: con herramientas, el razonamiento de cada turno se relee en los siguientes; la model card recomienda evitar `reasoning_effort` maximo en bucles de agentes salvo que se necesite el margen extra.
- Idiomas soportados no documentados; no hay garantia de cobertura multilingue mas alla de lo que ofrezca el base.
- Longitud de contexto no documentada en la informacion disponible; planificar el despliegue sin asumir una ventana concreta.
- Licencia MIT permite uso comercial, pero al ser una cuantizacion de un modelo de terceros conviene revisar tambien las condiciones del base.
- Riesgo de alucinacion y sesgos: no se aportan datos especificos en la informacion disponible; aplicar las precauciones habituales de un modelo generativo en produccion.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante EXL3 3,5 bpw: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-3.5bpw
- Variante NVFP4: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-NVFP4
- Cuantizacion de referencia de Mia-AiLab: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-2.9bpw
- Kit de serving para 2x DGX Spark: https://github.com/MiaAI-Lab/DeepSeek-v4.1-Flash-EXL3-2x-DGX-Sparks
- Plantilla de chat de referencia (jayleaton): https://huggingface.co/jayleaton/DeepSeek-V4.1-Flash-EXL3-2.8bpw
- Discusion con resultados de `reasoning_effort`: https://huggingface.co/LibertAIDAI/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw/discussions/4
