# r0b0tlab/Qwen3.8-Flash-Next-EXL3-2.50bpw

## Resumen

r0b0tlab/Qwen3.8-Flash-Next-EXL3-2.50bpw es una cuantización EXL3 (ExLlamaV3) del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario r0b0tlab. No es un modelo entrenado desde cero, sino un artefacto de despliegue: el modelo base se ha convertido a 2,50 bits por peso (bpw) en los expertos enrutados y el decoder, conservando intactos la torre de visión y el cabezal MTP (multi-token prediction), y reservando mayor precisión para atención y módulos compartidos.

El objetivo declarado es ejecutar el modelo con su ventana nativa completa de 262.144 tokens en una única GPU de consumo de 24 GB, en concreto una RTX 3090. Los pesos suman 22.269.378.048 parámetros (unos 22,27 mil millones) según los safetensors, ocupan 61 GiB en disco y se sirven con offload de expertos a RAM del sistema: alrededor de 30 GiB de pesos de expertos permanecen en memoria principal (host de 59 GB) y se transmiten por CPU token a token.

Es relevante porque demuestra que un MoE multimodal de esta escala y con este contexto puede servirse en hardware de gama alta de consumo, a cambio de una build específica de ExLlamaV3 v1.5.0 con soporte de offload de MoE y de un coste claro en latencia. El artefacto se distribuye bajo licencia Apache 2.0 y también como contenedor Docker.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), torre de visión y cabezal MTP; heredada de Qwen/Qwen3.8-Flash-Next, sin detalle publicado |
| Parámetros totales | 22.269.378.048 (≈22,27 B), dato real de los safetensors |
| Parámetros activos | no disponible (es MoE, pero la documentación no indica expertos totales ni parámetros activos por token) |
| Longitud de contexto | 262.144 tokens nativos; validado en NIAH a 262.080 tokens |
| Tipos de cuantización | EXL3 (ExLlamaV3) a 2,50 bpw: 2,50 bpw en expertos enrutados y decoder, atención y módulos compartidos en calidad superior (-hq), torre de visión 6 bpw, cabezal MTP 4 bpw, tabla de embeddings n-gram 3 bpw |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 (exl3), librería exllamav3 |
| Tamaño en disco | 61 GiB de pesos; 64,6 GB de repositorio |
| Pipeline declarado | image-text-to-text |
| Método de conversión | convert.py -b 2.50 -mb 4 -vb 6 -hq -ngb 3, ExLlamaV3 v1.5.0, pasada única |
| Modelo base | Qwen/Qwen3.8-Flash-Next (relación: quantized) |
| Fecha de publicación | 2026-09-17 |

## Arquitectura y entrenamiento

Este repositorio no contiene ningún entrenamiento propio: es una conversión de pesos del modelo base Qwen/Qwen3.8-Flash-Next mediante ExLlamaV3 v1.5.0, en una sola pasada. La arquitectura, por tanto, es la del modelo original (MoE con torre de visión y cabezal MTP), pero la model card no detalla número de expertos, esquema de enrutamiento, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF o DPO. Todos esos datos figuran como no disponibles.

La innovación técnica está en el reparto del presupuesto de bits. Los expertos enrutados y el decoder se cuantizan a 2,50 bpw, mientras que atención y módulos compartidos reciben tratamiento de mayor calidad (-hq). La torre de visión se mantiene a 6 bpw y el cabezal MTP a 4 bpw, de modo que ni la entrada de imagen ni la decodificación multi-token se degradan al nivel de los expertos. La tabla de embeddings n-gram se cuantiza a 3 bpw y se transmite desde disco en tiempo de ejecución, sin necesidad de offload a RAM (-ngr no se usa). La caché KV a 262.144 tokens ocupa unos 2,25 GiB con caché cq3 y cubre 12 capas de atención completa, lo que sugiere un esquema híbrido de atención en el modelo base, aunque la documentación no lo describe.

## Capacidades

- Generación de texto conversacional multi-turno: el tag conversational y el pipeline image-text-to-text confirman uso de chat.
- Entrada multimodal de imagen y texto: la torre de visión se conserva a 6 bpw, por lo que el modelo acepta imágenes además de texto.
- Razonamiento: 20/20 en la prueba hard_reasoning del kit Q200v2 reportado por el autor.
- Generación de código: 100% en HumanEval según la validación del autor.
- Matemáticas: 98,75% en GSM8K.
- Seguimiento de instrucciones: 87,18% en IFEval.
- Recuperación en contexto muy largo: NIAH multi-aguja superado a 262.080 tokens en las configuraciones 33/66% y 33/66/90%.
- Decodificación multi-token (MTP) con aceptación media de 4,06, que acelera la generación respecto a decodificación token a token.
- Tool calling / function calling: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Análisis de documentación extensa: con 262.144 tokens de contexto, el modelo puede ingerir contratos, expedientes regulatorios o memorias anuales completas en una sola pasada y responder preguntas sobre cualquier sección sin trocear el documento. La validación NIAH a 262.080 tokens respalda la recuperación en ese régimen.
- RAG de contexto largo: en lugar de recuperar fragmentos sueltos, se pueden inyectar capítulos enteros o conjuntos de artículos completos, reduciendo la pérdida de información típica del chunking agresivo.
- Procesamiento de documentos escaneados: el pipeline image-text-to-text permite extraer y resumir información de facturas, formularios o informes con gráficos sin un OCR previo separado.
- Asistencia en desarrollo de software: con 100% en HumanEval puede generar y revisar código. Dado que la información no documenta tool calling, la integración en CI/CD debe hacerse mediante envoltorios externos que invoquen el modelo y apliquen los cambios.
- Despliegue local en estación de trabajo de investigación: una sola RTX 3090 de 24 GB basta para servir el modelo a contexto completo, lo que permite prototipar con datos sensibles sin salir de la máquina.
- Evaluación de cuantización agresiva: sirve como referencia para medir cuánto se degrada un MoE multimodal al bajar a 2,50 bpw, comparando contra el modelo base sin cuantizar en las mismas tareas.
- Atención al cliente con historial largo: conversaciones multi-turno que mantengan semanas de historial caben en la ventana, aunque conviene tener en cuenta que el despliegue validado usa una sola ranura de secuencia.
- Inferencia reproducible en contenedor: la imagen ghcr.io/r0b0tlab/qwen38-flash-next-exl3:2.50bpw descarga el repositorio en el primer arranque, lo que facilita entornos aislados y reproducibles.

## Benchmarks y rendimiento

Cifras reportadas por el autor en su propia validación sobre una única RTX 3090 de 24 GB. No se han publicado comparaciones con otros modelos en la información disponible y no están verificadas por terceros.

| Prueba | Resultado | Notas |
|---|---|---|
| Q200v2 text-180 (kit congelado) | 173 correctas / 6 incorrectas / 1 sin calificar (≈96,1%) | ifeval-023 divulgada en el techo de 8.192 tokens |
| GSM8K | 98,75% | — |
| Hard reasoning | 20/20 | — |
| HumanEval | 100% | — |
| IFEval | 87,18% | — |
| NIAH multi-aguja a 262.080 tokens | PASS en 33/66% y en 33/66/90% | Contexto prácticamente completo |
| Throughput de decodificación (MTP activo) | 38,6 tok/s | TTFT de 256 tokens: 1,9 s; aceptación MTP 4,06 |
| Carga a 262.144 tokens y prefill de 200k | 664 tok/s, sin OOM | — |
| Media extremo a extremo | 51,2 tok/s con 20,4 GiB de VRAM | — |

## Requisitos de hardware

- VRAM: 20,0-20,7 GB de pico en una RTX 3090 a los 262.144 tokens completos, con caché cq3 y MTP activo; el diseño mantiene al menos 1,5 GiB de margen bajo el techo de la tarjeta.
- Memoria del sistema: host de 59 GB recomendado; unos 30 GiB de pesos de expertos permanecen en RAM y se transmiten por CPU con -mcs 320 -mct 6.
- Almacenamiento: 61 GiB de pesos en disco; la tabla n-gram se lee desde disco en tiempo de ejecución.
- Caché KV: aproximadamente 2,25 GiB a 262.144 tokens (12 capas de atención completa, caché cq3).
- GPU de consumo: sí, cabe en una RTX 3090 de 24 GB, que es el escenario validado. No hay validación publicada en otras tarjetas.
- Opciones de despliegue: ExLlamaV3 v1.5.0 (build compatible con offload de MoE en CPU) mediante python examples/chat.py -m <dir> -mode chatml -cs 262144 -cq 3 -mcs 320 -mct 6 -mtp, o el contenedor ghcr.io/r0b0tlab/qwen38-flash-next-exl3:2.50bpw con --gpus all.
- Incompatibilidades de despliegue: el formato exl3 es específico de ExLlamaV3; no se menciona soporte para llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput medidos: 38,6 tok/s de decodificación con MTP, 1,9 s de TTFT para 256 tokens, 664 tok/s en prefill de 200k y media extremo a extremo de 51,2 tok/s.

## Comparativa con modelos similares

No se han encontrado en la información disponible modelos de terceros comparables. La única referencia utilizable es el propio modelo base sin cuantizar, del que no se publican cifras de rendimiento en esta ficha.

| Modelo | Parámetros | Contexto | Formato y precisión | VRAM estimada | Licencia |
|---|---|---|---|---|---|
| r0b0tlab/Qwen3.8-Flash-Next-EXL3-2.50bpw | 22,27 B | 262.144 tokens | EXL3 a 2,50 bpw | 20,0-20,7 GB en RTX 3090, más ~30 GiB de expertos en RAM | apache-2.0 |
| Qwen/Qwen3.8-Flash-Next (base) | 22,27 B (según el derivado) | 262.144 tokens | bf16, ≈44,5 GB de pesos (estimación a partir del número de parámetros) | no disponible | no confirmada en la información disponible |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cuantización muy agresiva: 2,50 bpw en expertos y decoder implica pérdida de calidad frente a bf16, especialmente en tareas de razonamiento y matemáticas. No hay una comparativa publicada contra el modelo sin cuantizar que cuantifique esa degradación.
- Cifras no verificadas: todos los benchmarks proceden de los arneses del propio autor (kit Q200v2 text-180) y no han sido replicados de forma independiente.
- Caso sin calificar: ifeval-023 quedó sin puntuación y se señala explícitamente el techo de 8.192 tokens, por lo que parte del comportamiento en instrucciones largas no está medido.
- Offload de expertos por CPU: el rendimiento depende de la RAM del sistema y del bus, no solo de la GPU; usar menos de 59 GB de RAM o forzar más expertos en VRAM puede provocar OOM.
- Una sola ranura de secuencia a 262.144 tokens: el escenario validado no cubre servicio concurrente con batch alto, lo que limita su uso en producción multiusuario.
- Formato propietario: los pesos exl3 solo se cargan con ExLlamaV3 v1.5.0 o superior con soporte de MoE offload; no sirven para llama.cpp, Ollama, vLLM ni TGI.
- Idiomas no documentados: no se puede asumir un rendimiento multilingüe concreto, ni siquiera en castellano, sin evaluarlo.
- Trazabilidad del entrenamiento nula en este repositorio: no hay información sobre dataset, alineación, RLHF o DPO del modelo base, ni sobre sesgos conocidos.
- Riesgo de alucinación: inherente a los modelos generativos y no cuantificado en la información disponible; no debe usarse sin verificación en dominios críticos.
- Adopción nula registrada: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Licencia: el artefacto es Apache 2.0, pero conviene confirmar la licencia del modelo base antes de un uso comercial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/r0b0tlab/Qwen3.8-Flash-Next-EXL3-2.50bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del autor con métricas, arneses y modelo servido: https://github.com/r0b0tlab/qwen38-flashnext-exl3
- Contenedor Docker: ghcr.io/r0b0tlab/qwen38-flash-next-exl3:2.50bpw
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante; los resultados devueltos corresponden a contenidos sin relación con el modelo (páginas de espectáculos de comedia en Londres).
