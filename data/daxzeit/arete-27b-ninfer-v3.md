# DAXZEIT/Arete-27B-NInfer-v3

## Resumen

Arete-27B-NInfer-v3 es una cuantización del modelo NousResearch/Arete-27B realizada por DAXZEIT, publicada en formato propietario NInfer v3. El paquete incluye pesos de texto en Q4_K_M y Q6_K, un proyector de visión nativo en Q8 y pesos MTP (multi-token prediction) embebidos para decodificación especulativa. Se distribuye también una variante con un modelo draft DFlash2 adicional. El objetivo es ofrecer una versión ejecutable en GPUs de consumo con capacidad de contexto muy larga y visión integrada.

El modelo base Arete-27B pertenece a NousResearch y no se documentan en la información disponible sus datos de entrenamiento originales, arquitectura exacta ni composición del dataset. La ficha del cuantizador se centra en la caracterización numérica de la cuantización y en el rendimiento medido en una RTX 3090, no en las capacidades intrínsecas del modelo base.

La relevancia actual reside en la ingeniería de despliegue: el autor documenta con detalle la fidelidad Q4 frente a Q6 (divergencia KL, acuerdo top-1, perplejidad por dominio), el rendimiento con decodificación especulativa MTP3 (hasta 1,82× de aceleración agrupada) y una configuración probada de 160.000 tokens de contexto en 24 GB de VRAM. Es, por tanto, una ficha útil para quien evalúe servir un modelo de 27B con visión y contexto largo en hardware de gama alta de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base NousResearch/Arete-27B; el cuantizador no documenta la arquitectura) |
| Parámetros totales | 27B (según el nombre del modelo base; no confirmado en la información disponible) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 160.000 tokens en la configuración probada (capacidad configurada en NInfer) |
| Tipos de cuantización | Texto: Q4_K_M, Q6_K. Visión: Q8 nativo. MTP: Q6_K / Q8_0. DFlash2: Q8 / BF16 |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; los benchmarks incluyen inglés, francés, chino y código) |
| Licencia | Apache 2.0 |
| Formato de pesos | NInfer v3 (contenedores propietarios; no safetensors ni GGUF) |

Tamaños de los contenedores publicados:

| Variante | Tamaño | Texto | Visión | MTP | DFlash2 |
|---|---:|---|---|---|---|
| Q4_K_M | 16,76 GiB | Q4_K_M | Q8 nativo | Q6_K / Q8_0 | — |
| Q4_K_M + DFlash2 | 18,83 GiB | Q4_K_M | Q8 nativo | Q6_K / Q8_0 | Q8 / BF16 |
| Q6_K | 22,74 GiB | Q6_K | Q8 nativo | Q6_K / Q8_0 | — |
| Q6_K + DFlash2 | 24,81 GiB | Q6_K | Q8 nativo | Q6_K / Q8_0 | Q8 / BF16 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base NousResearch/Arete-27B: la model card del cuantizador no especifica si es un transformer denso, MoE o híbrido, ni detalla el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF/DPO. Tampoco se documenta el proceso de entrenamiento del proyector de visión.

La innovación técnica documentada corresponde al empaquetado y al runtime NInfer v3. El paquete integra tres componentes diferenciados: pesos de texto cuantizados (Q4_K_M o Q6_K), un proyector de visión en Q8 que reside en GPU, y cabezas MTP para decodificación especulativa. Se ofrecen dos rutas de especulación alternativas: MTP (hasta MTP3, tres drafts por paso) y un modelo draft DFlash2 independiente. El runtime soporta caché KV con esquema RK8V4, capacidad de contexto configurable de 160.000 tokens, prefill por chunks de 1.024 tokens y caché de prefijo en RAM host con presupuesto configurable.

El autor documenta además una validación numérica de la cuantización: 6.144 posiciones de next-token evaluadas en seis dominios (arXiv, código GitHub, segmento de código propio, chat sintético, Wikipedia EN y Wikipedia ZH), con repeticiones Q4 byte-idénticas y verificación contra un oráculo bit a bit en F32.

## Capacidades

- Generación de texto: pipeline declarado como `text-generation`.
- Procesamiento de visión: proyector de visión nativo en Q8, con residencia en GPU en la configuración probada.
- Decodificación especulativa: soporte de MTP (hasta MTP3) y de modelo draft DFlash2 como rutas alternativas.
- Contexto largo: capacidad configurada de 160.000 tokens en la configuración de referencia.
- Multilingüismo: los benchmarks de cuantización cubren inglés, francés y chino, además de código; no hay lista oficial de idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada (el benchmark de rendimiento se ejecutó con razonamiento desactivado).

## Casos de uso

- Servicio de un modelo de 27B con visión en una única RTX 3090: la variante Q4_K_M (16,76 GiB) está diseñada explícitamente para GPUs de 24 GB, con proyector de visión residente en GPU y 160.000 tokens de contexto configurados, lo que permite desplegar texto e imagen en hardware de consumo.
- Procesamiento de documentos largos con contexto extenso: la capacidad de 160.000 tokens y la caché de prefijo en RAM host permiten analizar corpus extensos, informes o bases de código completas en una sola pasada sin truncamiento agresivo.
- Generación de código en producción: el benchmark muestra 94,97 tok/s con MTP3 en Python con explicación y un 55,30% de aceptación de drafts, el valor más alto de las cargas medidas, lo que lo hace adecuado para asistentes de código interactivos.
- Redacción técnica y documentación: con MTP3 alcanza 88,28 tok/s en prosa técnica inglesa y 83,92 tok/s en prosa francesa, suficiente para generación de documentación de forma interactiva.
- Evaluación y comparación de cuantizaciones: el paquete incluye métricas reproducibles (perplejidad, KL, acuerdo top-1) entre Q4 y Q6, útil para equipos que necesiten decidir el compromiso calidad/memoria con datos propios.
- Investigación en decodificación especulativa: al incluir MTP y DFlash2 como rutas alternativas con métricas de aceptación publicadas, sirve como banco de pruebas para estudiar el impacto de la especulación en throughput y latencia.
- Despliegue con restricciones de memoria mixtas: la separación entre embeddings en RAM host, caché KV y pesos en GPU permite ajustar el reparto de memoria según el hardware disponible.

## Benchmarks y rendimiento

Fidelidad de cuantización Q4 frente a Q6 (6.144 posiciones, RTX 3090, runtime NInfer `39a10890`):

| Métrica global | Q4_K_M | Q6_K |
|---|---:|---:|
| Perplejidad agrupada | 4,17055 | 4,16112 |
| NLL global | 1,42804835 | 1,42578343 |
| KL media Q4 → Q6 | 0,01033 nats | — |
| KL media Q6 → Q4 | — | 0,01024 nats |
| Acuerdo top-1 entre quants | 95,82% | — |

Resultados por dominio:

| Dominio | Tokens | PPL Q4 | PPL Q6 | KL Q4→Q6 | KL Q6→Q4 | Acuerdo top-1 |
|---|---:|---:|---:|---:|---:|---:|
| arXiv | 1.024 | 6,58308 | 6,49938 | 0,01110 | 0,01109 | 94,43% |
| Código GitHub | 1.024 | 1,52209 | 1,52766 | 0,00458 | 0,00453 | 98,24% |
| Código propio | 1.024 | 2,74500 | 2,73666 | 0,00985 | 0,00975 | 96,68% |
| Chat sintético | 1.024 | 4,02362 | 4,01489 | 0,01176 | 0,01142 | 95,90% |
| Wikipedia EN | 1.024 | 6,70140 | 6,74311 | 0,01041 | 0,01050 | 94,92% |
| Wikipedia ZH | 1.024 | 7,09524 | 7,05675 | 0,01429 | 0,01413 | 94,73% |

Rendimiento de servicio Q4_K_M en RTX 3090 (generación de 4.096 tokens por petición):

| Carga | Sin especulación | MTP3 | Aceleración | Aceptación MTP |
|---|---:|---:|---:|---:|
| Prosa técnica inglesa | 49,00 tok/s | 88,28 tok/s | 1,80× | 49,00% |
| Prosa francesa | 48,89 tok/s | 83,92 tok/s | 1,72× | 45,00% |
| Python con explicación | 48,86 tok/s | 94,97 tok/s | 1,94× | 55,30% |
| Agrupado | 48,92 tok/s | 88,83 tok/s | 1,82× | 49,55% |

Latencia y throughput extremo a extremo:

| Métrica | Sin especulación | MTP3 |
|---|---:|---:|
| TTFT mediano del cliente | 241,50 ms | 244,03 ms |
| Rango de TTFT | 239,98–338,79 ms | 242,82–350,49 ms |
| Throughput agrupado extremo a extremo | 48,77 tok/s | 88,31 tok/s |

No se han publicado en la información disponible resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) para el modelo base ni para la cuantización.

## Requisitos de hardware

- VRAM estimada: la variante Q4_K_M ocupa 16,76 GiB en contenedor y está diseñada para GPUs de 24 GB; Q6_K ocupa 22,74 GiB y Q6_K + DFlash2 llega a 24,81 GiB, por lo que requiere más de 24 GB si se mantiene todo residente. La memoria en ejecución depende además del contexto, la caché KV, la residencia de componentes y la ruta de decodificación.
- GPU probada: NVIDIA RTX 3090 (24 GB) con Q4_K_M, 160.000 tokens de contexto configurado, caché KV RK8V4, visión residente en GPU y MTP3.
- GPU recomendadas: RTX 3090 para Q4_K_M; para Q6_K y variantes con DFlash2 se necesita una GPU con más de 24 GB (modelos concretos no especificados en la información disponible).
- Cabe en GPU de consumo: sí, la variante Q4_K_M en una RTX 3090 de 24 GB; las variantes Q6 no caben completas en 24 GB según los tamaños de contenedor publicados.
- Despliegue: exclusivamente mediante el runtime NInfer (revisión `39a10890` en las pruebas). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: TTFT mediano de 241,50 ms sin especulación y 244,03 ms con MTP3; 48,92 tok/s sin especulación y 88,83 tok/s con MTP3 en generación larga; 48,77 y 88,31 tok/s extremo a extremo respectivamente.
- Ajustes relevantes del perfil probado: prefill por chunks de 1.024 tokens, dos lanes configurados con una petición activa, caché de prefijo con presupuesto de 8.192 MiB en host.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de capacidad del modelo base que permitan una comparación de rendimiento con alternativas. La comparación disponible es interna, entre las propias variantes de cuantización:

| Variante | Tamaño | Texto | Visión | Especulación | Perfil de hardware |
|---|---:|---|---|---|---|
| Q4_K_M | 16,76 GiB | Q4_K_M | Q8 nativo | MTP | GPU de 24 GB |
| Q4_K_M + DFlash2 | 18,83 GiB | Q4_K_M | Q8 nativo | MTP o DFlash2 | GPU de 24 GB con margen para draft |
| Q6_K | 22,74 GiB | Q6_K | Q8 nativo | MTP | Más de 24 GB |
| Q6_K + DFlash2 | 24,81 GiB | Q6_K | Q8 nativo | MTP o DFlash2 | Más de 24 GB |

Comparación con modelos de la misma categoría (27B, texto y visión): no disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluación de seguridad del modelo base.
- No hay lista oficial de idiomas soportados; el multilingüismo solo está evidenciado de forma indirecta por los dominios de benchmark (inglés, francés, chino).
- El contexto de 160.000 tokens es una capacidad configurada en el runtime, no un valor verificado de ventana efectiva del modelo base; el rendimiento en contextos muy largos no se ha medido en la información disponible.
- La comparación Q4/Q6 usa Q6 como referencia, no el modelo original en BF16; el acuerdo top-1 mide coincidencia entre cuantizaciones, no precisión en tareas.
- El formato NInfer v3 es propietario y requiere el runtime NInfer; no hay conversión documentada a GGUF ni soporte en ecosistemas estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita la portabilidad.
- Las mediciones de rendimiento provienen de una única GPU (RTX 3090), con una sola petición activa y prompts cortos (275–328 tokens); el throughput con concurrencia no está documentado.
- La licencia Apache 2.0 se declara en el repositorio del cuantizador; conviene verificar que la licencia del modelo base NousResearch/Arete-27B sea compatible para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- El rendimiento con razonamiento activado no se ha medido: el benchmark se ejecutó con razonamiento desactivado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DAXZEIT/Arete-27B-NInfer-v3
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
