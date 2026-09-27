# NaiveAI/Naive-N0.5-Flash

## Resumen

Naive-N0.5-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 309.000 millones de parametros totales y 15.500 millones de parametros activos por token, desarrollado por NaiveAI. Esta orientado especificamente a generacion de codigo e investigacion en IA (AI R&D), y su rasgo mas distintivo es una ventana de contexto nativa de 1 millon de tokens conseguida sin ninguna capa de atencion completa: la red combina Sliding-Window Attention (SWA) con una variante ligera de DeepSeek Sparse Attention (DSA).

El modelo parte del base abierto MiMo-V2.5 y sustituye sus capas de atencion global por capas DSA, manteniendo la mayor parte de la pila en SWA. Tras ese cambio arquitectonico completo 3,25 billones de tokens de entrenamiento multietapa con contexto nativo de 1M. La relevancia actual del modelo esta en dos frentes: por un lado, demuestra que es posible sostener contextos de millon de tokens con coste de decodificacion acotado; por otro, se publica bajo licencia MIT con pesos abiertos, algo poco habitual en modelos de esta escala.

NaiveAI acompana la publicacion con NaiveRT, un sistema de inferencia propio que, segun el autor, alcanza 50 tokens/s por usuario en modo Standard y hasta 2.000 tokens/s en modo Ultrafast mediante fusion de mega-kernels, Programmatic Dependent Launch (PDL) y decodificacion especulativa. El repositorio ocupa 617,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer; atencion hibrida SWA–DSA |
| Parametros totales | 309B |
| Parametros activos | 15,5B |
| Longitud de contexto | 1.000.000 tokens nativo |
| Tipos de cuantizacion | no disponible (la model card no publica variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible de forma explicita; el repositorio ocupa 617,8 GB, coherente con pesos en BF16, y el modelo requiere codigo propio (etiqueta `custom_code`) |
| Capas transformer | 48 |
| Composicion de capas de atencion | 39 capas SWA + 9 capas DSA |
| Ventana SWA | 128 tokens |
| Seleccion de tokens DSA | top 2.048 tokens para la atencion del backbone |
| Grupos KV (DSA) | 4 (GQA4) |
| Cabezas de consulta del indexer | 16 |
| Modelo base | MiMo-V2.5 |
| Tamano del repositorio | 617,8 GB |

## Arquitectura y entrenamiento

La red se organiza en ocho modulos de seis capas cada uno. Un modulo estandar contiene cinco capas SWA seguidas de una capa DSA, y ademas la primera capa del primer modulo tambien se sustituye por DSA, lo que da la composicion 39 + 9. La atencion SWA usa una ventana de 128 tokens, de modo que su coste de decodificacion por token no crece con la longitud del contexto. Las capas DSA se encargan de preservar la informacion de largo alcance: un indexer ligero de 16 cabezas de consulta puntua todo el historial y el backbone calcula la atencion solo sobre los 2.048 tokens mejor puntuados. Ambos tipos de atencion incorporan sesgo de sink. A diferencia de la implementacion original de DSA basada en MLA, aqui se emplea grouped-query attention con cuatro grupos KV (GQA4). No hay capas de atencion completa en toda la red.

El entrenamiento consta de tres etapas con contexto nativo de 1M tokens: 50.000 millones de tokens de Indexer Warmup, 3 billones de tokens de Sparse Attention Training y 200.000 millones de tokens de Learning Rate Decay, sumando 3,25 billones de tokens. El objetivo declarado de este proceso de preentrenamiento continuado fue adaptar el modelo base MiMo-V2.5 a la nueva estructura de atencion dispersa y, al mismo tiempo, mejorar sus capacidades de codigo e investigacion en IA. La model card no detalla la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otro alineamiento posterior, ni innovaciones adicionales mas alla de las ya citadas en inferencia (mega-kernel fusion, PDL y decodificacion especulativa en NaiveRT).

## Capacidades

- Generacion de texto conversacional y generacion de codigo, con orientacion explicita a tareas de ingenieria de software.
- Razonamiento agente multi-paso en tareas de software: la evaluacion publicada usa Claude Code 2.1.207 con herramientas basicas de E/S de ficheros y Bash, lo que indica soporte de flujos de tipo agentico con tool calling.
- Contexto largo nativo de 1M tokens, apto para repositorios completos, trazas largas o documentacion extensa en una sola pasada.
- Capacidades de investigacion en IA y optimizacion de sistemas: el autor evalua el modelo en tareas como MLE-bench-30, PostTrainBench, NanoChat AutoResearch y NanoGPT SpeedRun.
- Generacion y reproduccion de trabajos de investigacion (PaperBench) y ejecucion de tareas de codigo evaluadas (SOL-ExecBench).
- Capacidades multilingues: no disponible; la model card no especifica idiomas soportados.
- Modo de pensamiento (thinking mode), vision o audio: no disponible; no se mencionan en la informacion proporcionada.
- Inferencia de alto rendimiento mediante NaiveRT, con modos Standard y Ultrafast, este ultimo apoyado en decodificacion especulativa.

## Casos de uso

- Ingenieria de software agentica: el modelo esta disenado para operar con herramientas de fichero y Bash sobre un contexto de 1M tokens, de modo que puede recorrer un repositorio completo, aplicar parches multi-fichero y verificar el resultado sin fragmentar el codigo en trozos.
- Refactorizacion y migracion de codebases grandes: al retener el arbol completo en contexto, permite renombrar APIs, actualizar dependencias o migrar frameworks manteniendo coherencia entre modulos que en modelos de 32K-128K quedarian fuera de ventana.
- Revision de codigo automatizada en pipelines de CI/CD: integrado como paso previo al merge, puede analizar el diff junto al resto del repositorio y generar comentarios con contexto suficiente para evitar falsos positivos.
- Automatizacion de tareas de ML engineering: en escenarios tipo MLE-bench, el modelo puede preparar datasets, escribir scripts de entrenamiento, lanzarlos y ajustar hiperparametros de forma iterativa.
- Reproduccion de articulos de investigacion: con 1M tokens de contexto puede ingerir el paper, el repositorio de referencia y los logs de ejecucion, y producir una implementacion ejecutable.
- Optimizacion de kernels y rendimiento de sistemas: las tareas de NanoGPT SpeedRun y SOL-ExecBench son representativas de un uso real de ajuste de codigo de bajo nivel guiado por benchmarks.
- Asistente de documentacion tecnica: generacion de guias, referencias de API y notas de version a partir del propio codigo fuente y de los historiales de cambios.
- Atencion al cliente tecnico multi-turno: conversaciones largas con historial extenso y acceso a documentacion mediante tool calling, apoyandose en la ventana de 1M tokens para no truncar el contexto.

## Benchmarks y rendimiento

La model card publica los resultados unicamente como figuras (figura 2 para tareas de codigo y agenticas, figura 3 para investigacion en IA y optimizacion de sistemas). El texto extraido no incluye las cifras numericas, por lo que no se pueden reproducir valores concretos.

| Benchmark | Resultado |
|---|---|
| Tareas de codigo e ingenieria de software (7 tareas, figura 2) | no disponible (solo figura) |
| PostTrainBench | no disponible (solo figura) |
| MLE-bench-30 | no disponible (solo figura) |
| PaperBench | no disponible (solo figura) |
| SOL-ExecBench | no disponible (solo figura) |
| NanoChat AutoResearch | no disponible (solo figura) |
| NanoGPT SpeedRun | no disponible (solo figura) |

Configuracion de evaluacion declarada: Claude Code 2.1.207 con ventana de 1M tokens, temperatura 1,0 y top-p 0,95, exponiendo unicamente herramientas basicas de E/S de ficheros y Bash. Los modelos de comparacion citados en las figuras son GLM-5.3, GLM-5.3-Flash, Kimi-K3, Qwen-3.8-Max, Hy4-preview y DeepSeek-V4.1. Los resultados concretos de todos ellos, tal como se presentan en la ficha, no estan disponibles en formato numerico en la informacion proporcionada.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del numero de parametros, no datos publicados por el autor.

- Pesos en BF16: 309B x 2 bytes ≈ 618 GB solo para pesos, mas cache KV. No cabe en un nodo de 8x H100 80 GB (640 GB) con margen operativo; requiere 8x H200 (141 GB cada una) o 16x H100.
- Pesos en FP8/INT8: ≈ 309 GB. Encaja en 4x H200 o en 8x H100 con holgura.
- Pesos en INT4: ≈ 155 GB, en torno a 165-175 GB con overhead de runtime. Encaja en 2x H200 o 4x H100 80 GB.
- GPU consumer: no cabe en una unica GPU de consumo. Ni siquiera en cuantizacion agresiva (Q2, ~90 GB) entra en 24-32 GB. Un despliegue multi-GPU con 8x RTX 5090 (256 GB) seria viable en INT4, pero poco practico por ancho de banda y comunicacion.
- Cache KV: el autor indica que la KV cache completa se conserva y que el indexer recorre todo el historial, por lo que el crecimiento de memoria con el contexto es aproximadamente lineal, mitigado por el uso de GQA con 4 grupos KV. No se publican cifras de tamano por token.
- Opciones de despliegue: el modelo se distribuye con codigo propio (etiqueta `custom_code`), por lo que la ruta soportada es el sistema NaiveRT del autor junto con `trust_remote_code`. No hay confirmacion de soporte en vLLM, SGLang, TGI, llama.cpp u Ollama; es previsible que requieran adaptar el kernel de atencion hibrida SWA–DSA.
- Rendimiento declarado: 50 tokens/s por usuario en modo Standard y hasta 2.000 tokens/s en modo Ultrafast con NaiveRT. La model card no aclara si la cifra de 2.000 tokens/s es agregada o por usuario.

## Comparativa con modelos similares

La informacion disponible solo proporciona datos tecnicos de Naive-N0.5-Flash. De los modelos citados como referencia en las figuras de evaluacion no se dispone de parametros, contexto, licencia ni resultados en esta busqueda.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Naive-N0.5-Flash | 309B totales / 15,5B activos | 1M tokens | solo figuras, sin cifras publicadas | MIT | pesos abiertos en HuggingFace |
| GLM-5.3 | no disponible | no disponible | no disponible | no disponible | citado en blog de Z.ai |
| GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | citado en blog de Z.ai |
| Kimi-K3 | no disponible | no disponible | no disponible | no disponible | pagina de modelo en HuggingFace |
| Qwen-3.8-Max | no disponible | no disponible | no disponible | no disponible | citado en blog de Qwen |
| Hy4-preview | no disponible | no disponible | no disponible | no disponible | pagina de modelo en HuggingFace (Tencent) |
| DeepSeek-V4.1 | no disponible | no disponible | no disponible | no disponible | referencia truncada en la model card |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no incluye ninguna seccion de sesgos, evaluacion de toxicidad ni analisis de equidad.
- Riesgo de alucinacion: no cuantificado por el autor. Como en cualquier modelo generativo de esta escala, no hay garantia de veracidad en la salida, algo especialmente relevante en tareas de investigacion y generacion de codigo donde el modelo puede producir APIs o resultados inexistentes.
- Idiomas: no disponible. No se especifica cobertura multilingue, por lo que el comportamiento fuera del ingles es incierto.
- Contexto: aunque la ventana nativa es de 1M tokens, la calidad efectiva de recuperacion en posiciones intermedias del contexto no se documenta. La ventana SWA es de solo 128 tokens, por lo que la informacion de largo alcance depende integramente de las 9 capas DSA y del acierto del indexer al seleccionar los 2.048 tokens relevantes.
- Memoria: la KV cache completa se conserva. En contextos cercanos a 1M tokens esto puede dominar el consumo de memoria en produccion, por encima incluso del peso de los parametros activos.
- Licencia: MIT, lo que permite uso comercial, modificacion y redistribucion sin restricciones de copyleft. No obstante, el autor no ofrece garantias ni asuncion de responsabilidad sobre el uso.
- Codigo personalizado: el modelo requiere `trust_remote_code`, lo que implica ejecutar codigo del repositorio del autor. Conviene auditar ese codigo antes de desplegarlo en entornos productivos.
- Ecosistema: al no confirmarse soporte en vLLM, llama.cpp, Ollama ni TGI, la integracion en stacks existentes puede requerir trabajo adicional de ingenieria.
- Madurez: el repositorio tiene 0 descargas y 11 likes, con fechas de creacion y actualizacion del 27 de septiembre de 2026. La validacion independiente por parte de la comunidad es practicamente nula.
- Advertencia sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo (corresponden a una cadena de talleres de automocion del Reino Unido), por lo que no aportan informacion verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaiveAI/Naive-N0.5-Flash
- Homepage del proyecto: referenciada en la model card como `[website]`, URL literal no disponible en la informacion proporcionada.
- Blog tecnico de NaiveAI (incluye el caso de estudio de NaiveRT y la seccion de arquitectura): referenciado como `[blog]`, URL literal no disponible en la informacion proporcionada.
- Repositorio GitHub: referenciado como `[github]`, URL literal no disponible en la informacion proporcionada.
- GLM-5.3: https://z.ai/blog/glm-5.3
- GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Kimi-K3: https://huggingface.co/moonshotai/Kimi-K3
- Qwen-3.8-Max: https://qwen.ai/blog?id=qwen3.8
- Hy4-preview: https://huggingface.co/tencent/Hy4-preview
- DeepSeek-V4.1: referencia truncada en la model card, URL no disponible.
