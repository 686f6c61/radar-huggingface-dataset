# NaiveAI/Naive-N0.5-Flash-FP8-Draft

## Resumen

Naive-N0.5-Flash es un modelo de lenguaje de pesos abiertos desarrollado por NaiveAI, construido sobre el modelo base MiMo-V2.5 y orientado específicamente a programación e I+D en inteligencia artificial. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) de 309.000 millones de parámetros totales y 15.500 millones de parámetros activos por token, con una ventana de contexto nativa de 1 millón de tokens. Su rasgo técnico más distintivo es la eliminación total de capas de atención completa: la red combina atención de ventana deslizante (SWA) y atención dispersa de DeepSeek (DSA) en una proporción aproximada de 5:1.

El repositorio analizado aquí, NaiveAI/Naive-N0.5-Flash-FP8-Draft, es una variante concreta en FP8. Los metadatos de safetensors del repositorio declaran 652.797.441 parámetros (unos 0,65B) y un tamano de 1,3 GB, muy lejos de los 309B del modelo principal; el sufijo "Draft" y el uso de decodificación especulativa en el sistema de inferencia NaiveRT del autor apuntan a que se trata de un modelo borrador para decodificación especulativa, aunque la model card no describe explícitamente esta variante y el dato debe tratarse con cautela.

La relevancia del modelo radica en tres ejes: contexto nativo de 1M tokens sin capas de atención completa, un sistema de inferencia propietario (NaiveRT) que declara hasta 2.000 tokens/s en modo Ultrafast y 50 tokens/s por usuario en modo Standard, y una licencia MIT sobre pesos y código de inferencia, con acceso por API a 0,10 / 0,40 / 0,01 dólares por millón de tokens de entrada, salida y lectura de caché respectivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer; atención híbrida SWA–DSA, sin capas de atención completa |
| Parametros totales | 309B (modelo principal). En este repositorio: 652.797.441 (aprox. 0,65B) segun safetensors |
| Parametros activos | 15,5B |
| Longitud de contexto | 1M tokens nativo |
| Tipos de cuantizacion | FP8 (esta variante); no disponible para otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con código personalizado, etiqueta custom_code) |
| Capas del transformer | 48 |
| Composicion de capas de atención | 39 capas SWA + 9 capas DSA |
| Ventana SWA | 128 tokens |
| Selección DSA | Top 2.048 tokens para la atención del backbone |
| Grupos KV (DSA) | 4 (GQA4) |
| Cabezas de consulta del indexer | 16 |
| Modelo base | MiMo-V2.5 (pesos abiertos) |
| Fecha de creacion del repositorio | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

La red se organiza en ocho módulos de seis capas cada uno. Un módulo estándar contiene cinco capas de atención de ventana deslizante (SWA) seguidas de una capa de atención dispersa (DSA), y la primera capa del primer módulo también se sustituye por DSA, lo que da la composición de 39 capas SWA y 9 capas DSA sobre 48 capas totales. La SWA emplea una ventana de 128 tokens, de modo que su coste de decodificación por token no crece con la longitud del contexto. Las capas DSA incorporan un indexer ligero de 16 cabezas de consulta que puntúa todo el historial y selecciona los 2.048 tokens más relevantes sobre los que el backbone calcula la atención. Ambos tipos de atención incorporan sesgo de sumidero (sink bias).

A diferencia de la implementación original de DSA, que se apoya en MLA (Multi-head Latent Attention), Naive-N0.5-Flash sustituye MLA por atención de consultas agrupadas (GQA) con cuatro grupos KV. El modelo conserva la caché KV completa, de modo que la memoria sigue creciendo con el contexto aunque el cómputo de atención se reduzca de forma sustancial, tanto en cálculo como en accesos a memoria.

El entrenamiento consistió en 3,25 billones de tokens de entrenamiento multi-etapa con ventana nativa de 1M tokens: 50.000 millones de tokens de calentamiento del indexer, 3 billones de tokens de entrenamiento de atención dispersa y 200.000 millones de tokens de decaimiento de la tasa de aprendizaje. Este proceso de preentrenamiento continuado adaptó el modelo base MiMo-V2.5 a la nueva estructura de atención y, segun el autor, mejoró de forma sustancial sus capacidades de programación e I+D en IA. No se especifica en la información disponible si se emplearon técnicas de RLHF, DPO u otros métodos de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto y comprensión de contexto largo: ventana nativa de 1M tokens sin capas de atención completa, lo que permite procesar repositorios, documentación o trazas de gran tamano en una sola pasada.
- Programación: el modelo está construido explícitamente para tareas de ingeniería de software, con evaluación centrada en tareas de software engineering y agenticas.
- I+D en inteligencia artificial: la model card reporta evaluaciones en PostTrainBench, MLE-bench-30, PaperBench, SOL-ExecBench, NanoChat AutoResearch y NanoGPT SpeedRun, lo que indica capacidades orientadas a investigación, experimentación en aprendizaje automático y optimización de sistemas.
- Uso de herramientas y agentes: las evaluaciones se realizan con Claude Code 2.1.207 y un conjunto de herramientas que expone E/S de ficheros y Bash, lo que implica soporte de flujo agentico multi-paso con llamadas a herramientas.
- Conocimiento del mundo e investigación profunda: heredado del modelo base MiMo-V2.5, que segun la model card tiene capacidades fundacionales fuertes en estos ámbitos.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Agentes de codificación autónomos en terminal: el modelo puede operar sobre herramientas de E/S de ficheros y Bash, como demuestra la configuración de evaluación con Claude Code, lo que permite flujos de trabajo en los que el modelo inspecciona un repositorio, edita ficheros, ejecuta pruebas y itera hasta completar la tarea.
- Refactorización de repositorios completos: con 1M tokens de contexto nativo, es viable cargar módulos enteros o incluso proyectos de tamano medio sin troceado, lo que reduce la pérdida de dependencias cruzadas entre ficheros durante una refactorización.
- Resolución de incidencias en producción: el contexto largo permite incorporar trazas de error, logs, ficheros de configuración y el código implicado en una sola consulta, de modo que el modelo pueda proponer un parche con la información completa en lugar de fragmentos aislados.
- Generación y mantenimiento de pruebas en pipelines de CI/CD: el modelo puede generar pruebas unitarias e de integración a partir del código y del historial de fallos, y usarse como revisor automatizado de pull requests con acceso al diff y al contexto circundante.
- Investigación reproducible en aprendizaje automático: las evaluaciones en MLE-bench-30 y PaperBench sugieren uso para reproducir experimentos, generar código de entrenamiento y ajustar hiperparámetros a partir de descripciones de artículos.
- Optimización de sistemas y kernels: la tarea NanoGPT SpeedRun apunta a la capacidad de escribir y optimizar implementaciones de bajo nivel, útil para equipos que trabajan en kernels de GPU, compiladores o sistemas de inferencia.
- Decodificación especulativa en producción: esta variante FP8 con etiqueta Draft está pensada, segun la nomenclatura del repositorio, para actuar como modelo borrador que acelera la generación del modelo principal; el sistema NaiveRT del autor ya declara el uso de decodificación especulativa junto con fusión de mega-kernels y Programmatic Dependent Launch.
- Migraciones de código entre lenguajes o frameworks: el contexto de 1M tokens permite mantener simultáneamente el código fuente, el destino y las reglas de conversión, lo que resulta práctico en migraciones de gran alcance.
- Análisis de documentación técnica extensa: el modelo puede resumir y responder preguntas sobre manuales, RFCs o especificaciones de cientos de miles de tokens sin recuperación externa.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card referencia dos figuras con resultados (una de tareas de programación y agenticas, y otra de I+D en IA) sin incluir cifras en el texto extraído. Las tareas evaluadas que se mencionan son las siguientes:

| Área | Tareas o benchmarks mencionados | Resultado numérico |
|---|---|---|
| Programación y agentes | Siete tareas de ingeniería de software y agenticas (no se detallan los nombres) | no disponible |
| I+D en IA | PostTrainBench | no disponible |
| I+D en IA | MLE-bench-30 | no disponible |
| I+D en IA | PaperBench | no disponible |
| I+D en IA | SOL-ExecBench | no disponible |
| I+D en IA | NanoChat AutoResearch | no disponible |
| I+D en IA | NanoGPT SpeedRun | no disponible |

Detalles de la configuración de evaluación declarados por el autor: Claude Code 2.1.207 con ventana de contexto de 1M tokens, temperatura 1,0, top-p 0,95, y un conjunto de herramientas que expone únicamente E/S básica de ficheros y Bash.

Rendimiento de inferencia declarado por el autor (con NaiveRT): 50 tokens/s por usuario en modo Standard y hasta 2.000 tokens/s en modo Ultrafast.

## Requisitos de hardware

- VRAM para el modelo principal de 309B: los pesos en FP8 ocupan aproximadamente 309 GB solo en parámetros, estimación derivada del recuento publicado. A ello hay que sumar la caché KV, que se conserva completa para todos los tokens y por tanto crece con la longitud de contexto; el valor exacto no está publicado.
- VRAM para esta variante: el repositorio ocupa 1,3 GB y declara 652.797.441 parámetros, de modo que cabe en cualquier GPU de consumo con 2 GB o más de memoria libre, e incluso en muchos equipos sin GPU.
- GPU recomendadas para el modelo principal: configuraciones de 8x H100 80 GB (640 GB) o 4x H200 141 GB resultan suficientes para los pesos en FP8 con margen para caché KV moderada; se trata de estimaciones derivadas del tamano de pesos, no de cifras publicadas por el autor.
- GPU de consumo: el modelo principal de 309B no cabe en ninguna GPU de consumo actual, ni siquiera en cuantización de 4 bits (en torno a 155 GB de pesos). La variante Draft de este repositorio sí cabe en cualquier GPU de consumo.
- Opciones de despliegue: el autor proporciona NaiveRT, su propio sistema de inferencia optimizado mediante fusión de mega-kernels, Programmatic Dependent Launch y decodificación especulativa. El repositorio incluye la etiqueta custom_code, lo que implica que la carga requiere código personalizado del autor (trust_remote_code). No hay confirmación de soporte en vLLM, SGLang, TGI, llama.cpp u Ollama; la atención híbrida SWA–DSA sin capas completas hace poco probable una conversión directa a GGUF sin kernels específicos.
- Latencia y throughput: 50 tokens/s por usuario en modo Standard y hasta 2.000 tokens/s en modo Ultrafast, ambas cifras declaradas por el autor y no verificadas de forma independiente.

## Comparativa con modelos similares

La model card cita varios modelos de referencia en sus gráficas de evaluación, pero no incluye sus especificaciones ni los valores numéricos de la comparación. No se dispone de datos propios verificables de ninguno de ellos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Naive-N0.5-Flash | 309B totales / 15,5B activos | 1M tokens | sin cifras publicadas | MIT | pesos abiertos en HuggingFace, API prevista |
| MiMo-V2.5 (modelo base) | no disponible | no disponible | no disponible | no disponible | pesos abiertos |
| GLM-5.3 / GLM-5.3-Flash | no disponible | no disponible | citado como referencia, sin cifras | no disponible | no disponible |
| Kimi-K3 | no disponible | no disponible | citado como referencia, sin cifras | no disponible | pagína de modelo en HuggingFace |
| Qwen-3.8-Max | no disponible | no disponible | citado como referencia, sin cifras | no disponible | no disponible |
| Hy4-preview | no disponible | no disponible | citado como referencia, sin cifras | no disponible | pagína de modelo en HuggingFace |
| DeepSeek-V4.1 | no disponible | no disponible | citado como referencia, sin cifras | no disponible | no disponible |

## Limitaciones y advertencias

- Inconsistencia de datos entre variantes: este repositorio declara 652.797.441 parámetros en safetensors frente a los 309B del modelo principal, mientras que la model card reproduce íntegramente la descripción de 309B. Es imprescindible verificar qué artefacto se está descargando antes de integrarlo en producción.
- Naturaleza de la variante Draft: la información disponible no describe explícitamente su función, su proceso de destilación ni con qué modelo principal es compatible. Cualquier uso como modelo autónomo de generación de texto no está respaldado por la documentación.
- Código personalizado: la etiqueta custom_code implica la ejecución de código del autor al cargar el modelo, con el riesgo de seguridad que ello conlleva. Conviene auditar el código antes de desplegarlo.
- Caché KV completa: aunque la atención sea dispersa, la caché KV no se comprime, por lo que la memoria crece con el contexto y el coste de servir contextos de 1M tokens puede ser elevado pese a la reducción de cómputo de atención.
- Ausencia de cifras verificables: no hay resultados numéricos publicados en la información disponible, ni evaluación independiente. Las afirmaciones de rendimiento (50 y 2.000 tokens/s) provienen del propio autor.
- Idiomas: no se declara ninguna lista de idiomas soportados. El rendimiento fuera del inglés, y en particular en castellano, es desconocido.
- Sesgos: no disponible; la model card no documenta evaluación de sesgos ni de seguridad.
- Riesgo de alucinación: no cuantificado en la información disponible. En tareas de código, el modo de fallo típico es la generación de APIs o dependencias inexistentes; se recomienda verificación mediante ejecución de pruebas.
- Licencia: MIT sobre pesos y código de inferencia segun la model card, lo que permite uso comercial, modificación y redistribución. Conviene confirmar los términos de los modelos base y de los datos de entrenamiento, no detallados en la información disponible.
- Dependencia del sistema propietario: las cifras de rendimiento más altas se asocian a NaiveRT, del propio autor, lo que puede dificultar la reproducibilidad en pilas de inferencia estándar.
- Fechas: el repositorio figura creado y actualizado el 27 de septiembre de 2026, dato que conviene contrastar con la cronología real del proyecto.

## Enlaces

- Modelo en HuggingFace (esta variante): https://huggingface.co/NaiveAI/Naive-N0.5-Flash-FP8-Draft
- Modelo principal en HuggingFace: https://huggingface.co/NaiveAI/Naive-N0.5-Flash
- Repositorio GitHub: https://github.com/NaiveAI-Labs/Naive-N0.5-Flash
- Sitio web de NaiveAI: https://naive.ai/en/
- Análisis de terceros: https://promptblueprints.tech/ai-releases/naive-n0-5-flash-inside-naiveai-s-309b-open-weight-model/
- Blog técnico y caso de estudio de NaiveRT: enlazado en la model card como [blog], URL no incluida en la información disponible
- Página de inicio del proyecto: enlazada en la model card como [website], URL no incluida en la información disponible
- Modelos citados como referencia en la evaluación: https://z.ai/blog/glm-5.3, https://z.ai/blog/glm-5.3-flash, https://huggingface.co/moonshotai/Kimi-K3, https://qwen.ai/blog?id=qwen3.8, https://huggingface.co/tencent/Hy4-preview, DeepSeek-V4.1 (enlace no incluido en la información disponible)
