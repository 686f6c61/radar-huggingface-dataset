# smalinin/Step-5-Preview-GGUF

## Resumen

Step-5-Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por StepFun, con aproximadamente 600.000 millones de parametros totales y 27.000 millones de parametros activos por token. Esta disenado especificamente para tareas de programacion, razonamiento y flujos de trabajo con agentes, e incorpora capacidades multimodales (entrada de imagen y texto). El modelo base publica una ventana de contexto de hasta 1 millon de tokens, lo que lo situa en la categoria de modelos de contexto extendido orientados a aplicaciones agenticas de largo alcance.

La ficha que nos ocupa, `smalinin/Step-5-Preview-GGUF`, no es el modelo original sino una coleccion de cuantizaciones GGUF calibradas en precision mixta, derivadas del checkpoint oficial FP8 de StepFun. Estas cuantizaciones estan pensadas para su uso con una bifurcacion experimental de llama.cpp (rama `my_build`) que anade soporte para la arquitectura `step35`, incluyendo las capas CSA (atención con indice comprimido) y las tres cabezas MTP (Multi-Token Prediction) del modelo original. Es, por tanto, material de interes para quienes quieran ejecutar localmente un modelo de 600B en hardware con VRAM limitada, a costa de una calidad de cuantizacion agresiva.

La relevancia actual radica en que permite explorar un MoE de gran escala con contexto de hasta 1M tokens y capacidades multimodales en entornos locales, algo historicamente reservado a infraestructura de datacenter. No obstante, se trata de pesos experimentales: el autor advierte que la inferencia del modelo completo solo se ha probado con GPUs CUDA, incluyendo offload de expertos a CPU, y que la calidad de las cuantizaciones Q2 e IQ3 no ha sido evaluada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (identificador GGUF `step35`), con atencion hibrida CSA + sliding window |
| Parametros totales | 600.991.912.608 (~600B) |
| Parametros activos | ~27B por token (8 de 352 expertos enrutados) |
| Longitud de contexto | Hasta 1M tokens segun el modelo base; validacion local no especificada |
| Tipos de cuantizacion | Q2 Antirez-like (IQ2_XXS-GU-Q2_K-Down), IQ3_M AntirezLike, Q2_K-Protected2 (planificada) |
| Idiomas soportados | Ingles, chino, multilingue |
| Licencia | stepfun-model-license-1.0 (licencia propia de StepFun) |
| Formato de pesos | GGUF (8 partes por receta), vision tower en BF16 y Q8_0 `mmproj` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE disperso con 92 capas de texto principales, tamano oculto de 4096, 64 cabezas de atencion y 4 cabezas KV, con dimension de cabeza de 192. La atencion es hibrida: 23 capas usan CSA (atencion con indice comprimido) y 69 capas usan sliding window de 512 tokens. Las dimensiones rotatorias son 64 para atencion completa/CSA y 192 para sliding attention. Incorpora tres capas MTP embebidas tras las capas principales, lo que habilita decodificacion especulativa multi-token. Los detalles sobre datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

Las cuantizaciones de esta ficha se generaron desde cero a partir del checkpoint oficial FP8, convirtiendolo primero a intermedios BF16 GGUF aplicando las escalas de bloque FP8. Se construyo una nueva imatrix local con CSA activada: el calibrado del modelo principal proceso 262.144 tokens en 32 fragmentos con contexto 8192, y las tres cabezas MTP se calibraron adicionalmente en modo teacher-forced. La imatrix combinada contiene 1.210 entradas, incluidas las 30 matrices cuantizables de MTP. Se retuvieron los 1.783 tensores de texto/MTP, incluidos 184 tensores CSA y 51 de las cabezas MTP. La cobertura de calibrado alcanzo el 99,893% de pares capa/experto enrutados; los 33 pares restantes usan el fallback neutral del cuantizador. La torre de vision se exporto por separado como `mmproj` en BF16 y Q8_0.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con soporte de modo de pensamiento segun el modelo base.
- Generacion de codigo y tareas de programacion, uno de los objetivos declarados del modelo.
- Razonamiento matematico y resolucion de problemas complejos.
- Capacidades multimodales de entrada imagen-texto (pipeline `image-text-to-text`), con torre de vision exportada como `mmproj`.
- Soporte de tool calling / function calling, orientado a flujos agenticos.
- Capacidades multilingues: ingles, chino y otros idiomas.
- Decodificacion especulativa mediante las tres cabezas MTP embebidas.
- Contexto extendido de hasta 1M tokens en el modelo base, adecuado para documentos largos y conversaciones multi-turno prolongadas.

## Casos de uso

- Asistencia de programacion en local: el modelo puede generar y revisar codigo en pipelines de desarrollo, aprovechando su entrenamiento orientado a coding y su soporte de tool calling para integrarse con linters, compiladores o APIs de CI/CD.
- Agentes autonomos multi-paso: gracias a las cabezas MTP y al soporte de function calling, puede planificar y ejecutar secuencias de acciones con llamadas a herramientas, adecuado para automatizacion de tareas de oficina o investigacion.
- Analisis de documentos extensos: con contexto de hasta 1M tokens, puede procesar contratos, informes o bases de codigo completas en una sola pasada, resumiendo y extrayendo informacion estructurada.
- Atencion al cliente multilingue: gestiona conversaciones multi-turno en ingles, chino y otros idiomas, con capacidad de mantener contexto largo y derivar a herramientas externas cuando sea necesario.
- Procesamiento de imagenes con texto (image-text-to-text): la torre de vision permite describir imagenes, extraer texto de capturas o responder preguntas sobre diagramas tecnicos, util en soporte y documentacion.
- Razonamiento matematico asistido: resolucion de problemas paso a paso con verificacion intermedia, apropiado para entornos educativos o de investigacion que requieran trazabilidad del razonamiento.
- Despliegue en hardware con VRAM limitada: las cuantizaciones Q2 e IQ3 permiten ejecutar un MoE de 600B en estaciones de trabajo con GPUs consumer o de gama profesional, con offload de expertos a CPU, para prototipado e investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos; solo se documenta la cobertura de calibrado (99,893% de pares capa/experto) y la integridad de los tensores, que no equivalen a calidad de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: las recetas publicadas ocupan 182,472 GB (Q2 Antirez-like) y 271,609 GB (IQ3_M AntirezLike) en disco; la Q2_K-Protected2 planificada ocupa 229,670 GB. El requisito de VRAM depende del offload de expertos a CPU y del contexto configurado; no se especifica una cifra exacta en la informacion disponible.
- GPU recomendadas: la inferencia del modelo completo solo se ha desarrollado y probado con GPUs CUDA, incluyendo offload de expertos a CPU. No se detallan modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabida en GPU consumer: no confirmado; el tamano de las cuantizaciones (182 GB en el mejor caso) excede la VRAM de cualquier GPU consumer individual, por lo que requeriria offload a CPU o configuraciones multi-GPU.
- Opciones de despliegue: bifurcacion experimental `smalinin/llama.cpp`, rama `my_build`, con el commit probado `425badfe8`. No se garantiza soporte en builds upstream arbitrarios de llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Step-5-Preview (base) | ~600B | ~27B | Hasta 1M | stepfun-model-license-1.0 | FP8, BF16 |
| Step-5-Preview-GGUF (esta ficha) | ~600B | ~27B | Hasta 1M (segun base) | stepfun-model-license-1.0 | GGUF cuantizado |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos comparables identificados en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos experimentales: el autor advierte que la inferencia del modelo completo solo se ha probado con GPUs CUDA y una bifurcacion concreta de llama.cpp; no se garantiza funcionamiento en otras configuraciones.
- Calidad de cuantizacion no evaluada: las recetas Q2 e IQ3 son agresivas y no se han publicado evaluaciones de calidad independientes; el calibrado cubre el 99,893% de pares capa/experto, pero la calidad general requiere evaluacion separada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala; no se documentan mitigaciones especificas.
- Sesgos conocidos: no se documentan en la informacion disponible.
- Limitaciones de contexto e idioma: aunque el modelo base anuncia hasta 1M tokens, no se especifica la validacion local de esa ventana; los idiomas soportados son ingles, chino y multilingue, sin detalle de cobertura.
- Restricciones de licencia: la licencia `stepfun-model-license-1.0` es propia de StepFun y puede imponer condiciones para uso comercial; debe revisarse el texto completo antes de produccion.
- Dependencia de un fork no oficial de llama.cpp: el uso en produccion queda condicionado al mantenimiento de la rama `my_build` y a la compatibilidad con el commit probado.
- Tamano de despliegue elevado: incluso la cuantizacion mas pequena (182 GB) requiere infraestructura significativa y estrategias de offload.

## Enlaces

- Repositorio GGUF: https://huggingface.co/smalinin/Step-5-Preview-GGUF
- Modelo base: https://huggingface.co/stepfun-ai/Step-5-Preview
- Checkpoint BF16 del modelo base: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16
- Configuracion del modelo base: https://huggingface.co/stepfun-ai/Step-5-Preview/blob/main/config.json
- Licencia: https://huggingface.co/stepfun-ai/Step-5-Preview/blob/main/LICENSE.txt
- Fork de llama.cpp: https://github.com/smalinin/llama.cpp/tree/my_build
- Commit probado: https://github.com/smalinin/llama.cpp/commit/425badfe8c1c286a8984a454e991f045bb3008b2
- Directorio Q2_a: https://huggingface.co/smalinin/Step-5-Preview-GGUF/tree/main/Q2_a
