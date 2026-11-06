# MavenCH/Qwen3.8-Flash-Next-swift15-nvfp4-dgpp-Tiiny

## Resumen

Este repositorio es un espejo modificado de un checkpoint NVFP4 (formato ModelOpt) del modelo ukisai/Swift1.5-Qwen3.8-Flash-Next, un ajuste fino de eficiencia de razonamiento sobre Qwen3.8-Flash-Next. La unica modificacion introducida por MavenCH es la adicion de un fichero `model_index.json` para satisfacer la validacion de URL del importador de Tiiny AI Pocket Lab; los pesos y la configuracion originales permanecen intactos. Todo el merito del ajuste y de la cuantizacion corresponde a kaushikvira (cuantizacion) y a UkisAI (fine-tune).

El modelo es un transformer de tipo Mixture of Experts (MoE) con 179.999.981.459 parametros totales (segun los safetensors del repo) y 296.475 tensores en 52 shards. El artefacto pesa 125,87 GiB (135,2 GB de repo), lo que lo hace servible en un par de NVIDIA DGX Spark (GB10) con tensor parallelism TP=2 mediante el motor de inferencia dgpp, mientras que la fuente BF16 original ocupa 336 GB. La propuesta de valor del fine-tune Swift 1.5 es reducir el numero de tokens de "pensamiento" en cargas agénticas y de chat a precision aproximadamente equivalente, abaratando y acelerando las respuestas.

La relevancia actual del artefacto es de nicho pero concreta: es la unica variante Swift 1.5 en NVFP4 que arranca en el hardware DGX Spark, y lo hace con el motor dgpp sin cambios de codigo, manteniendo la misma velocidad de decodificacion que la base NVFP4 de NVIDIA. No obstante, el propio autor advierte que no es una mejora de velocidad ni de precision, y que la ganancia en tokens depende del prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE); derivado de Qwen3.8-Flash-Next |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card cita TTFR medido hasta 32k de profundidad, sin declarar contexto maximo) |
| Tipos de cuantizacion | NVFP4 (formato ModelOpt): pesos en e2m1 con escala de bloque e4m3 cada 16 elementos y `weight_scale_2 = amax/2688`; tabla n-gram (PLE) en F8_E4M3 + escala BF16; densos/norms/embeddings en FP8; expertos draft MTP en BF16 fusionado (re-codificados a FP8 al cargar) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (`license: other`) |
| Formato de pesos | safetensors (52 shards, 296.475 tensores, + `SHA256SUMS`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE correspondiente a Qwen3.8-Flash-Next. El artefacto no entrena nada: es una conversion de formato y cuantizacion del fine-tune Swift 1.5 de UkisAI, que a su vez es un derivado post-entrenamiento (RL + OPD) de la base Qwen. Los expertos MoE vienen almacenados de forma fusionada/apilada en el origen (`experts.gate_up_proj [512, 2I, H]`) y en este checkpoint se han desapilado y desfusionado a formato por experto (`experts.E.{gate,up,down}_proj`, 294.912 tensores), con verificacion de emparejamiento correcto frente a la release NVFP4 de NVIDIA (coseno 0,9967 en el par correcto frente a 0,0086 cruzado).

La innovacion tecnica del artefacto es la cadena de cuantizacion: codificacion NVFP4 con la receta propia de dgpp (`src/loaders/nvfp4_quant.hpp`), bit-identica al codificador del loader; re-codificacion offline de la tabla n-gram (PLE) con `ws = absmax/448 → 0.000199317932`, identica a la release de NVIDIA; conservacion de los expertos draft MTP en BF16 fusionado; y copia byte a byte de densos, norms y embeddings (1.560 tensores). El modelo incorpora decodificacion especulativa MTP: 2,9 tokens por paso en profundidad 0, con tasas de aceptacion de 73% (p1), 52% (p2), 36% (p3) y 28% (p4).

## Capacidades

- Generacion de texto conversacional y de chat multi-turno.
- Razonamiento con modo de "pensamiento" (thinking tokens), con el ajuste Swift 1.5 orientado a reducir su numero.
- Cargas agénticas y de desarrollo: la model card reporta reducciones de tokens del 24% en chat y del 48% en "rancube" frente a la base NVFP4 de NVIDIA.
- Decodificacion especulativa MTP integrada en el motor dgpp.
- Servicio mediante API HTTP compatible con OpenAI a traves de dgpp.
- Soporte de tensor parallelism sobre RoCE en despliegues de uno, dos y cuatro nodos.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio: no disponible.

## Casos de uso

- Gateway de chat y asistencia conversacional en DGX Spark: el modelo sirve conversaciones multi-turno a traves de la API compatible con OpenAI de dgpp, con decodificacion de ~55-60 tok/s en prosa y TTFR de 1,0 s a profundidad 0, lo que permite respuestas interactivas en hardware de un solo par de nodos.
- Agentes de desarrollo de software: la reduccion del 24% de tokens y del 24,6% de tiempo de pared en cargas de chat, y del 48%/45% en cargas agénticas, abarata las respuestas en pipelines donde el coste por token y la latencia acumulada importan.
- Generacion de codigo y JSON estructurado: la decodificacion alcanza ~86-92 tok/s en codigo y ~98-101 tok/s en JSON a profundidad 0 (165 y 192 tok/s respectivamente en C4), adecuado para salidas estructuradas de alta tasa.
- Procesamiento de contextos largos en local: con TTFR de 8,7 s a 16k y 18,2 s a 32k de profundidad, sirve resumenes y analisis de documentos extensos en infraestructura propia sin depender de la nube.
- Despliegue en clústeres pequenos con TP: dgpp soporta tensor parallelism sobre RoCE en uno, dos y cuatro nodos, lo que permite escalar el mismo checkpoint en configuraciones de 2x y 4x DGX Spark.
- Sustitucion directa de la base NVFP4 de NVIDIA: al compartir familia, formato, motor y velocidad de decodificacion, se puede intercambiar por `nvidia/Qwen3.8-Flash-Next-NVFP4` en un despliegue dgpp existente sin cambios de codigo, obteniendo menos tokens en chat y cargas agénticas.
- Evaluacion de eficiencia de razonamiento: util como banco de pruebas para medir el comportamiento de "pensamiento excesivo" y la dependencia del prompt en la reduccion de tokens.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Artefacto | 125,87 GiB, 296.475 tensores, 52 shards (+ `SHA256SUMS`) |
| Decodificacion, profundidad 0 (C1) | ~55-60 tok/s prosa · ~86-92 codigo · ~98-101 JSON |
| Decodificacion en C4 | 114-124 tok/s prosa/chat · 165 codigo · 192 JSON |
| Prefill | 1,86-2,29k tok/s (pp2048 → pp8192) |
| TTFR | 1,0 s a profundidad 0 → 8,7 s a 16k → 18,2 s a 32k |
| MTP (profundidad 0) | 2,9 tok/paso; aceptacion p1 73% / p2 52% / p3 36% / p4 28% |
| Eficiencia de tokens vs base NVFP4 | chat −24% tokens / −24,6% pared; rancube −48% / −45%; dependiente del prompt |
| Razonamiento dificil | sobre-pensamiento +39%; la afirmacion upstream de 31-57% de recorte no se reprodujo en la sonda del autor |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el checkpoint ocupa 125,87 GiB en disco; el repo completo son 135,2 GB. La fuente BF16 original son 336 GB, por lo que la cuantizacion NVFP4 es lo que permite servirlo en el hardware objetivo.
- GPU recomendadas: 2x NVIDIA DGX Spark (GB10) con TP=2, que es la configuracion de referencia del artefacto. dgpp tambien soporta despliegues de uno y cuatro nodos con tensor parallelism sobre RoCE.
- GPU de consumo: no disponible; no hay datos sobre ejecucion en RTX 4090 u otras GPU consumer. El formato NVFP4 y el motor dgpp estan orientados a GB10.
- Opciones de despliegue: dgpp (`dgpp-serve`, version construida `0.1.0+g41e3216d845e`, git `41e3216d`), sin cambios de codigo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: decodificacion de ~55-60 tok/s en prosa a C1 y 114-124 tok/s a C4; prefill de 1,86-2,29k tok/s; TTFR de 1,0 s a 8,7 s (16k) y 18,2 s (32k).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Motor | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (Swift 1.5 NVFP4, espejo Tiiny) | 180B totales | NVFP4 ModelOpt | dgpp | swift-open-license-1.0 | Anade `model_index.json` para Tiiny AI Pocket Lab |
| kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-dgpp | 180B totales | NVFP4 ModelOpt | dgpp | swift-open-license-1.0 | Original del que este es espejo; mismos pesos |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | no disponible | NVFP4 ModelOpt | dgpp | no disponible | Base de NVIDIA; misma velocidad de decodificacion, mas tokens en chat/agéntico |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | no disponible | BF16 (336 GB, 131 shards) | no disponible | swift-open-license-1.0 | Fuente BF16, repo con acceso restringido (gated) |

## Limitaciones y advertencias

- No es una mejora de velocidad ni de precision: el autor lo declara explicitamente. La decodificacion coincide con la base NVFP4 dentro del ruido (C1 54,9→59,7; C4 116,6→114,4).
- La ganancia en eficiencia de tokens depende del prompt: en razonamiento dificil se observa sobre-pensamiento del +39%, y la afirmacion upstream de un recorte del 31-57% no se reprodujo en la sonda del autor.
- El artefacto es una conversion de formato y cuantizacion, no un fine-tune propio; cualquier merito de comportamiento corresponde a UkisAI y kaushikvira.
- Licencia `swift-open-license-1.0` con `license: other`: es necesario revisar los terminos en el enlace de licencia antes de uso comercial; no se detallan restricciones en la informacion disponible.
- Idiomas soportados no declarados: no hay garantia documentada de cobertura multilingue.
- Longitud de contexto maxima no declarada; las mediciones de TTFR solo llegan a 32k de profundidad.
- Dependencia estricta del motor dgpp y del hardware DGX Spark (GB10): no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ni con GPU consumer.
- Riesgo de alucinacion y sesgos conocidos: no disponible en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes, y la unica modificacion respecto al original es un fichero de validacion para el importador de Tiiny AI Pocket Lab; conviene verificar la integridad con `SHA256SUMS`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MavenCH/Qwen3.8-Flash-Next-swift15-nvfp4-dgpp-Tiiny
- Repositorio original cuantizado: https://huggingface.co/kaushikvira/Qwen3.8-Flash-Next-swift15-nvfp4-dgpp
- Fuente BF16 (Swift 1.5): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Base upstream Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Release NVFP4 de NVIDIA (referencia de layout): https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Motor de inferencia dgpp: https://github.com/HawkBearPig/dgpp
- Licencia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
