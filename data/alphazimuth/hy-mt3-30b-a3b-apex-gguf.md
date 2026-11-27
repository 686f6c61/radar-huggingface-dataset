# alphaZimuth/Hy-MT3-30B-A3B-APEX-GGUF

## Resumen

Hy-MT3-30B-A3B-APEX-GGUF es un conjunto de cuantizaciones GGUF del modelo de traducción Tencent Hy-MT3-30B-A3B, publicadas por el usuario alphaZimuth. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 30.064.725.888 parámetros totales, desarrollado por Tencent Hunyuan y especializado en traducción automática multilingüe. Esta publicación no introduce un modelo nuevo, sino cuatro variantes cuantizadas con la herramienta APEX y llama.cpp, pensadas para ejecutarse en GPUs de consumo con distintos presupuestos de VRAM.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de traducción de 30B en hardware local: la variante Compact ocupa 14,04 GB y la Mini 11,28 GB, lo que permite inferencia en GPUs de 16 y 24 GiB respectivamente. El modelo base cubre más de 90 idiomas, incluyendo castellano, catalán, euskera y gallego, y está orientado a tareas de traducción con contexto, terminología, formato SRT, JSON y HTML.

La arquitectura subyacente es `hy_v3`, con 48 capas y una primera capa FFN densa, e incorpora expertos enrutados y expertos compartidos. La licencia del modelo es Apache-2.0, lo que facilita su uso comercial, y los pesos se distribuyen únicamente en formato GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE `hy_v3`, 48 capas, primera capa FFN densa |
| Parametros totales | 30.064.725.888 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantizacion | APEX-I-Nano (IQ2_XXS en expertos enrutados), APEX-I-Mini, APEX-I-Compact, APEX-I-Quality |
| Idiomas soportados | más de 90, entre ellos zh, en, es, ca, eu, gl, fr, de, it, pt, ja, ko, ar, hi, ru y otros |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (también existe el BF16 GGUF intermedio) |

## Arquitectura y entrenamiento

El modelo base Tencent Hy-MT3-30B-A3B es un transformer con arquitectura MoE denominada `hy_v3`, compuesta por 48 capas y una primera capa FFN densa seguida de capas con expertos enrutados y expertos compartidos. La model card de la cuantización no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden al modelo original y no se incluyen en la información disponible.

La innovación técnica de esta publicación reside en el proceso de cuantización. Se generó primero un GGUF en BF16, se construyó una matriz de importancia (imatrix) a partir de una build Q8_0 y se aplicaron perfiles de tensor APEX durante la cuantización. El corpus de calibración contiene 5.262 ejemplos en 19 pares de idiomas y 38 direcciones, con 127 × 4.096 tokens procesados por llama.cpp, combinando OPUS-100, News Commentary v18.1, segmentos alineados de TED2020 y texto bilingüe propio. Los expertos compartidos usan Q8_0 en Quality, Q6_K en Compact y Q4_K/Q5_K en Mini y Nano.

## Capacidades

- Traducción automática multilingüe en más de 90 idiomas, con especial cobertura de castellano, catalán, euskera y gallego.
- Traducción con contexto de fondo, terminología dentro de la frase y estilo editorial.
- Manejo de formatos estructurados: SRT, JSON, HTML, delimitadores y marcadores de posición (placeholders).
- Traducción de pasajes contiguos y texto plano con instrucciones de idioma destino.
- Conversación de un solo turno mediante plantilla de chat Jinja integrada.
- Compatibilidad con llama.cpp a partir de la build b9993, probada en b11384 con CUDA 13.4.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales y guías manteniendo terminología consistente gracias al soporte de contexto de fondo y glosarios en la instrucción.
- Localización de interfaces de software: admite JSON y HTML con identificación explícita del campo traducible, lo que permite integrarlo en pipelines de localización automatizados.
- Subtitulado automático: el formato SRT está contemplado en el corpus de calibración, por lo que puede generar y traducir subtítulos preservando la estructura de tiempos.
- Traducción de artículos periodísticos: el corpus incluye News Commentary, lo que favorece el registro informativo y la traducción de prensa entre idiomas europeos y asiáticos.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante Mini (11,28 GB) cabe en una GPU de 16 GiB y la Compact (14,04 GB) en una de 24 GiB, permitiendo traducción local sin depender de la nube.
- Servicio de traducción por API local: mediante `llama-server` con plantilla Jinja y temperatura 0 se obtienen salidas deterministas adecuadas para integración en aplicaciones.
- Traducción de contenidos con marcadores: útil en sistemas de plantillas donde deben preservarse variables y placeholders sin traducir.

## Benchmarks y rendimiento

Rendimiento medido con `llama-bench -p 512 -n 128 -r 3 -ngl 99 -b 2048 -ub 512 -fa 1 -t 16` en una RTX 5090 D v2 de 24 GiB, CPU Ryzen 7 9700X y 64 GB de RAM, con llama.cpp b11384 y CUDA 13.4. PP512 y TG128 en tok/s (media ± desviación típica):

| Cuantizacion | Tamano | n_cpu_moe | PP512 | TG128 |
|---|---:|---:|---:|---:|
| APEX-I-Nano | 8,99 GiB | 0 | 9465 ± 996 | 285,73 ± 1,40 |
| APEX-I-Mini | 10,50 GiB | 0 | 8668 ± 669 | 281,73 ± 1,56 |
| APEX-I-Compact | 13,08 GiB | 0 | 9005 ± 716 | 281,55 ± 1,72 |
| APEX-I-Quality | 17,77 GiB | 0 | 9629 ± 851 | 251,54 ± 1,54 |

Calidad de traducción con decodificación greedy sobre 128 ejemplos de FLORES-200 devtest en ocho direcciones (chrF2, mayor es mejor) y suite de restricciones chino-inglés de 96 ejemplos:

| Variante | chrF2 | Restricciones superadas |
|---|---:|---:|
| Nano | 49,86 | 96/96 |
| Mini | 49,88 | 96/96 |
| Compact | 50,25 | 96/96 |
| Quality | 50,53 | 96/96 |
| Referencia Q8_0 | 50,29 | 96/96 |

## Requisitos de hardware

- VRAM estimada: Nano 8,99 GiB (requiere offload parcial en GPU de 8 GiB), Mini 10,50 GiB, Compact 13,08 GiB, Quality 17,77 GiB.
- GPU recomendadas: RTX 5090 D v2 de 24 GiB para Quality; GPU de 16 GiB para Mini; GPU de 24 GiB con margen para Compact y contexto amplio.
- Compatibilidad con GPU de consumo: sí, todas las variantes caben en GPUs de consumo de 16 a 24 GiB, salvo Nano que necesita offload parcial en 8 GiB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) a partir de la build b9993; no se documentan otras opciones como vLLM, TGI u Ollama.
- Throughput observado: entre 251 y 286 tok/s en generación (TG128) y entre 8668 y 9629 tok/s en prefill (PP512) con la configuración de prueba indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Hy-MT3-30B-A3B-APEX-GGUF | 30,06B | no disponible | Apache-2.0 | GGUF | Cuantización comunitaria del modelo de Tencent |
| Tencent Hy-MT3-30B-A3B (base) | 30,06B | no disponible | Apache-2.0 | safetensors/BF16 | Modelo original sin cuantizar |
| Otras cuantizaciones del mismo base | 30,06B | no disponible | Apache-2.0 | GGUF | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de benchmarks comparativos frente a modelos de traducción alternativos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; la temperatura 0 reduce la variabilidad pero no elimina errores.
- La longitud de contexto no está documentada; los ejemplos usan 8192 tokens, por lo que contextos mayores no están validados.
- La cobertura de idiomas es amplia, pero la calidad puede variar entre pares; el benchmark solo evalúa ocho direcciones.
- Es necesario usar nombres completos de idioma destino en las instrucciones de traducción.
- Requiere llama.cpp b9993 o superior; versiones anteriores no soportan la arquitectura `hy_v3`.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria adicional.

## Enlaces

- Hugging Face: https://huggingface.co/alphaZimuth/Hy-MT3-30B-A3B-APEX-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Herramienta APEX: https://github.com/localai-org/apex-quant
- Release de llama.cpp b9993: https://github.com/ggml-org/llama.cpp/releases/tag/b9993
- OPUS-100: https://opus.nlpl.eu/opus-100.php
- News Commentary v18.1: https://data.statmt.org/news-commentary/v18.1/training/
- TED2020: https://opus.nlpl.eu/TED2020
- FLORES-200: https://github.com/facebookresearch/flores/tree/main/flores200
- SacreBLEU: https://github.com/mjpost/sacrebleu
