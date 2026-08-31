# nota-ai/GLM-5.3-Flash-Nota-NVFP4

## Resumen

GLM-5.3-Flash-Nota-NVFP4 es una version cuantizada a 4 bits (NVFP4, W4A4) del modelo GLM-5.3-Flash de Z.ai, publicada por el laboratorio nota-ai. El modelo base es un MoE nativamente multimodal de 320B parametros totales con aproximadamente 18B activos por token, y esta version cuantizada reduce el peso de 598,5 GiB a 191,0 GiB (un 31,9% del tamano original), lo que permite servir el modelo completo en una unica GPU B300 en lugar de cuatro.

La cuantizacion NVFP4 utiliza los tensor cores FP4 de la arquitectura Blackwell de NVIDIA, por lo que la inferencia requiere obligatoriamente GPUs de esa generacion (B200, B300 o GB200). Solo los expertos enrutados se cuantizan a NVFP4 (94,8% de los parametros); las rutas criticas de precision —atencion lineal KDA, atencion dispersa DSA, routers, expertos compartidos, embeddings, cabezal de salida y torre de vision— permanecen en BF16. No hay cambios de arquitectura: los nombres de tensores, capas y expertos son identicos al checkpoint base, de modo que vLLM stock lo sirve sin parches.

El modelo mantiene la ventana de contexto completa de 1.048.576 tokens, la decodificacion especulativa MTP (multi-token prediction) y las capacidades multimodales (imagen y video) del modelo original. La licencia es MIT, lo que permite uso comercial sin restricciones. Esta pensado para despliegues de produccion de alto rendimiento en infraestructura Blackwell, con soporte nativo de tool calling, razonamiento con trazas de pensamiento y agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: atencion lineal KDA + atencion dispersa DSA (MLA) + MTP |
| Parametros totales | 321.323.031.390 (~320B) |
| Parametros activos | ~18B por token |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4, group_size=16) en expertos enrutados; BF16 en el resto |
| Idiomas soportados | ingles, chino, coreano |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors, formato nvfp4-pack-quantized) |

## Arquitectura y entrenamiento

GLM-5.3-Flash introduce por primera vez en la serie GLM una arquitectura hibrida que combina atencion lineal (KDA) y atencion dispersa (DSA, basada en MLA), disenada para reducir drasticamente el coste de servir contextos largos manteniendo precision. El modelo tiene 45 capas (0-44) mas un bloque MTP en la capa 45, con 36.288 modulos de expertos enrutados cuantizados a NVFP4 y 1.574 tensores restantes en BF16.

La cuantizacion se calibro con 512 conversaciones de exactamente 4.096 tokens renderizadas con la plantilla de chat de GLM, extraidas de cargas de trabajo reales: uso agente de herramientas (20,5%), trayectorias de agentes SWE (14,3%), seguimiento de instrucciones (8,2%), agentes de terminal (7,8%), codigo (7,0%), STEM (5,9%), razonamiento (4,7%), preguntas de conocimiento tipo MCQ (2,3%) y un 29,3% de fuentes en coreano. El 71,7% de las muestras incluyen trazas de razonamiento dentro de bloques `thinking`. Esta calibracion esta orientada a preservar el rendimiento en cargas agente y tool use, no en texto web generico.

La decodificacion especulativa MTP se conserva integra en BF16, permitiendo acelerar la generacion con 5 tokens especulativos. La torre de vision tambien permanece en BF16, por lo que las entradas de imagen y video funcionan igual que en el modelo base.

## Capacidades

- Generacion de texto conversacional y de larga forma en ingles, chino y coreano.
- Multimodal nativo: procesamiento de imagen y video a traves de la torre de vision en BF16 (pipeline image-text-to-text).
- Razonamiento con trazas de pensamiento explicitas en bloques `thinking`, activables mediante el parser de razonamiento glm45.
- Tool calling y function calling completo, con parser de herramientas glm47 y seleccion automatica de herramientas (`--enable-auto-tool-choice`).
- Capacidades agente: soporta trayectorias de agentes SWE, agentes de terminal y uso de herramientas en multiples pasos.
- Decodificacion especulativa MTP con 5 tokens especulativos, preservada en BF16.
- Contexto largo de 1.048.576 tokens con atencion hibrida (lineal + dispersa) para reducir coste de servicio.
- Generacion de codigo y resolucion de problemas STEM, segun la composicion de los datos de calibracion.

## Casos de uso

- Agentes de ingenieria de software (SWE agents): el modelo puede ejecutar trayectorias completas de resolucion de issues, editando archivos, ejecutando tests y usando herramientas de terminal. Su calibracion incluye un 14,3% de trayectorias SWE y soporta tool calling nativo, lo que lo hace adecuado para pipelines de automatizacion de desarrollo.
- Atencion al cliente multilingue con contexto largo: con 1M de tokens de ventana, puede mantener conversaciones multi-turno extensas incorporando el historial completo del cliente, documentacion de producto y politicas, en ingles, chino y coreano.
- Generacion de codigo en produccion con tool calling: integrable en pipelines de CI/CD mediante vLLM, con parser de herramientas glm47 y seleccion automatica, para generar, revisar y parchear codigo de forma autonoma.
- Agentes de terminal y automatizacion de infraestructura: el 7,8% de los datos de calibracion son agentes de terminal, por lo que el modelo esta preparado para ejecutar comandos, interpretar salidas y tomar decisiones en entornos shell.
- Razonamiento multimodal sobre documentos tecnicos: al mantener la torre de vision en BF16, puede analizar diagramas, capturas de pantalla y graficos junto con texto, combinando razonamiento con trazas de pensamiento.
- Procesamiento de corpus largos en investigacion: la ventana de 1M de tokens permite ingerir libros tecnicos completos, codebases enteros o expedientes extensos en una sola pasada, con atencion hibrida que reduce el coste de servicio respecto a atencion full.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion de Z.ai indica que GLM-5.3-Flash supera a GLM-5.2 en benchmarks y cargas de trabajo reales, y se acerca a Claude Opus 4.8 en benchmarks de codigo y agente, pero no se proporcionan cifras concretas en la model card ni en los resultados de busqueda. No se inventan numeros.

## Requisitos de hardware

- Requiere obligatoriamente NVIDIA Blackwell: NVFP4 depende de los tensor cores FP4 introducidos en B200, B300 y GB200. Arquitecturas anteriores (Hopper, Ada, Ampere) no soportan ejecucion NVFP4.
- Despliegue en una unica B300: el modelo ocupa 191,0 GiB y cabe en una B300 (288 GB HBM3e) con `--gpu-memory-utilization 0.96`.
- Despliegue en dos B200: alternativa con tensor parallelism 2 y `--gpu-memory-utilization 0.90`.
- VRAM estimada: ~191 GiB para los pesos del modelo, mas cache KV en fp8 y overhead de runtime.
- Software requerido: vLLM >= 0.29.0 y flashinfer >= 0.6.17 (para la atencion dispersa MLA).
- Opciones de despliegue: vLLM con `--tensor-parallel-size 1` o `2`, compilacion con cudagraph en modo PIECEWISE, cache KV en fp8 y decodificacion especulativa MTP con 5 tokens.
- No es desplegable en GPUs de consumo (RTX 4090, etc.) por la restriccion de arquitectura Blackwell y por el tamano del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-BF16 (base) | ~320B | ~18B | 1.048.576 | BF16 | MIT | 4x B300 |
| GLM-5.3-Flash-Nota-NVFP4 (este) | ~320B | ~18B | 1.048.576 | NVFP4 W4A4 | MIT | 1x B300 o 2x B200 |
| GLM-5.3-Nota-NVFP4-Global-Pruned-17.75 | no disponible | no disponible | no disponible | NVFP4 | MIT | no disponible |

La version NVFP4 reduce el requisito de hardware de 4x B300 a 1x B300 (o 2x B200) manteniendo la misma arquitectura, contexto y capacidades que el checkpoint BF16. La variante Global-Pruned-17.75 del mismo autor aplica ademas poda global, pero no se dispone de especificaciones detalladas en la informacion disponible.

## Limitaciones y advertencias

- Hardware restrictivo: la inferencia solo es posible en GPUs NVIDIA Blackwell (B200, B300, GB200). No funciona en Hopper, Ada, Ampere ni en hardware de consumo.
- Idiomas limitados: solo ingles, chino y coreano. No hay soporte declarado para espanol ni otros idiomas en la model card.
- Riesgo de perdida de precision por cuantizacion: aunque los expertos enrutados se cuantizan a NVFP4, la cuantizacion W4A4 puede degradar ligeramente la calidad en tareas de alta precision numerica o razonamiento largo, a pesar de que las rutas criticas permanecen en BF16.
- Dependencia de software especifico: requiere vLLM >= 0.29.0 y flashinfer >= 0.6.17; versiones anteriores no son compatibles con la atencion dispersa MLA ni con el formato nvfp4-pack-quantized.
- Riesgo de alucinacion: como todo modelo generativo de gran tamano, puede producir contenido plausible pero incorrecto, especialmente en tareas de conocimiento factual fuera de sus datos de entrenamiento.
- Sesgos potenciales: la calibracion esta fuertemente orientada a cargas agente y tool use (mas del 50% de los datos), con un 29,3% de fuentes coreanas; el rendimiento en otros dominios puede verse afectado.
- Sin benchmarks publicados: no hay datos de evaluacion cuantitativa disponibles para esta version cuantizada especifica, por lo que el impacto real de la cuantizacion en tareas concretas no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nota-ai/GLM-5.3-Flash-Nota-NVFP4
- Modelo base (BF16): https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Blog de Z.ai sobre GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Documentacion de Z.ai para GLM-5.3-Flash: https://docs.z.ai/guides/vlm/glm-5.3-flash
- Variante podada del mismo autor: https://huggingface.co/nota-ai/GLM-5.3-Nota-NVFP4-Global-Pruned-17.75
