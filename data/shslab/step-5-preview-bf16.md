# SHSLab/Step-5-Preview-BF16

## Resumen

Step-5-Preview es el modelo fundacional insignia de StepFun, disenado desde cero para tareas agenticas del mundo real en dominios profesionales como programacion asistida por IA, ingenieria de software, trabajo de conocimiento especializado y analisis financiero. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso con 604.339.504.832 parametros totales (unos 604,3 B, dato extraido de los archivos safetensors) y aproximadamente 27 B de parametros activos por token, lo que supone una dispersion en torno al 4,5 %. Incorpora una ventana de contexto de 1.000.000 de tokens y admite de forma nativa entradas de texto, imagen y video.

La arquitectura se apoya en un Transformer de 92 capas con configuracion "estrecha pero profunda" (narrow but deep), pensada para alargar los caminos de propagacion de informacion en razonamiento implicito de multiples saltos durante operaciones de prefill largo. Para sostener el contexto de 1M de tokens sin un coste proporcional, el modelo emplea Sparse Grouped-Query Attention (GQA) con fusion de tokens por bloques (block-wise token merging): un indexador disperso selecciona unicamente la informacion historica relevante para la tarea actual. Segun StepFun, este mecanismo reduce el coste del indexador y de la seleccion top-k a aproximadamente un octavo del de una linea base mas densa.

El lanzamiento es relevante por dos motivos. En primer lugar, StepFun ha saltado por completo la linea Step 4.x, pasando de Step-3.7-Flash directamente a Step 5, lo que da idea de la magnitud del cambio. En segundo lugar, la propuesta se centra en la eficiencia de conversion de computo en inteligencia (la "frontera de Pareto" que menciona el autor) y no solo en escalar parametros. Los pesos se publican en BF16 y el despliegue local se documenta con vLLM y SGLang. Conviene senalar que el repositorio analizado esta publicado por la cuenta SHSLab, no por la cuenta oficial de StepFun.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 92 capas con diseno narrow but deep; Mixture-of-Experts disperso; Sparse Grouped-Query Attention (GQA) con block-wise token merging |
| Parametros totales | 604.339.504.832 (~604,3 B), dato de safetensors |
| Parametros activos | ~27 B por token (dispersion aproximada del 4,5 %) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | no disponible (el unico checkpoint publicado es BF16) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | stepfun-community-license (license: other) |
| Formato de pesos | safetensors (BF16); libreria transformers; requiere custom_code |
| Modalidad de entrada | Texto, imagen y video (MP4, QuickTime, Matroska; <=128 MB; <=5 min recomendados) |
| Pipeline | text-generation |
| Esfuerzo de razonamiento | Configurable: low, medium, high / xhigh |
| Tool calling | Si, con soporte nativo de llamadas paralelas a herramientas |
| Salida estructurada | Si, JSON Schema estricto |
| Tamano del repositorio | 1214,9 GB |
| ID del repositorio | SHSLab/Step-5-Preview-BF16 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo combina dos decisiones de diseno concretas. La primera es un Transformer de 92 capas en configuracion estrecha y profunda, cuyo objetivo declarado es generar caminos de propagacion de informacion mas largos para el razonamiento implicito de multiples saltos durante el prefill de secuencias muy largas. La segunda es el mecanismo de atencion: Sparse GQA con block-wise token merging, que mediante indexacion dispersa selecciona solo el historial relevante para la tarea en curso, reduciendo el numero de tokens que entran efectivamente en el calculo de atencion. El autor cifra la reduccion de coste del indexador y de la seleccion top-k en aproximadamente un octavo respecto a una linea base mas densa.

La capa MoE aporta 600 B de parametros totales con solo 27 B activos por token. El modelo integra ademas un modo de razonamiento configurable en cuatro niveles (low, medium, high/xhigh), soporte de llamadas paralelas a herramientas y generacion con JSON Schema estricto, lo que indica un entrenamiento orientado a flujos agenticos y a la integracion en sistemas estructurados. La model card incluye una seccion titulada "Training Data", pero su contenido no estaba incluido en la informacion proporcionada, por lo que no se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni sobre el uso de RLHF, DPO u otras tecnicas de alineamiento.

## Capacidades

- Generacion de texto conversacional en ingles, chino y otros idiomas (etiqueta multilingual, sin lista explicita de lenguas).
- Razonamiento de horizonte largo y multi-step reasoning, con esfuerzo de razonamiento configurable en cuatro niveles.
- Programacion y ingenieria de software: las etiquetas del repositorio incluyen coding, software-engineering y agentic.
- Comprension multimodal de entrada: imagen y video (MP4, QuickTime, Matroska), con limites recomendados de 128 MB y 5 minutos por archivo.
- Tool calling nativo, incluyendo llamadas paralelas a multiples herramientas en una misma interaccion.
- Salida con JSON Schema estricto, pensada para integracion fiable en sistemas estructurados.
- Flujos agenticos: ejecucion autonoma, razonamiento de multiples pasos y uso de herramientas en cadenas largas.
- Analisis financiero y deep research, segun las etiquetas declaradas por el autor.
- Procesamiento de contexto largo de hasta 1.000.000 de tokens (~1.500 paginas A4, segun el autor).
- Despliegue y consumo mediante API compatible con OpenAI, ademas de la API propia de Step.

## Casos de uso

- Agentes de programacion autonoma: el modelo puede mantener una sesion de trabajo sobre un repositorio completo gracias a su ventana de 1M de tokens, invocar herramientas de compilacion, tests y control de versiones mediante llamadas paralelas, y encadenar pasos de correccion sin perder el contexto de los archivos relevantes.
- Asistencia a la ingenieria de software en produccion: con salida JSON Schema estricta puede generar parches y revisiones de codigo en un formato parseable, lo que permite insertarlo en pipelines de CI/CD con validacion automatica previa a la fusion.
- Investigacion profunda (deep research): la combinacion de contexto de 1M de tokens, tool calling y modo de razonamiento elevado permite agregar decenas de fuentes, mantener el hilo entre ellas y producir informes con trazabilidad de las consultas realizadas.
- Analisis financiero documental: es adecuado para procesar informes anuales, transcripciones de resultados y estados financieros extensos en una sola pasada de contexto, extrayendo cifras en JSON estructurado para alimentar hojas de calculo o bases de datos.
- Atencion al cliente automatizada multi-turno: la ventana de 1M de tokens permite arrastrar el historial completo de un cliente junto con documentacion de producto, y las llamadas paralelas a herramientas habilitan consultas simultaneas a CRM, sistema de pedidos y base de conocimiento.
- Automatizacion de back office sobre documentos mixtos: al aceptar imagen y texto, puede procesar facturas escaneadas, capturas de pantalla y correos en una misma conversacion, devolviendo campos normalizados segun un esquema JSON definido por la organizacion.
- Revisores de cumplimiento normativo: uso con razonamiento en nivel alto para contrastar contratos o politicas internas de cientos de paginas contra una lista de requisitos, generando hallazgos estructurados con la referencia exacta al fragmento de origen.
- Analisis de video para monitorizacion o catalogacion: con los limites documentados (<=128 MB, <=5 min por archivo) puede resumir contenido audiovisual, extraer eventos y etiquetarlos en un esquema de datos, como paso previo a un pipeline de indexacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion "Benchmark Results" en su indice, pero su contenido no estaba recogido en la informacion proporcionada. El unico dato cualitativo disponible es la afirmacion del autor de que el modelo obtiene puntuaciones competitivas frente a modelos con entre 3 y 5 veces mas parametros, sin cifras que la respalden en el material consultado. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del recuento de parametros (604,3 B) y del tamano del repositorio (1214,9 GB), no datos publicados por el autor.

- Pesos en BF16: aproximadamente 1,21 TB (1209 GB) solo para los pesos, lo que coincide con el tamano del repositorio.
- Pesos en FP8/INT8: aproximadamente 604 GB (563 GiB).
- Pesos en 4 bits: aproximadamente 302 GB (281 GiB), mas escalas y overhead.
- Cache KV para 1M de tokens: no disponible. Aunque el Sparse GQA reduce el coste, la cache de contexto completo anade una cantidad de memoria no cuantificada en la informacion disponible.
- Configuracion minima viable en BF16: del orden de 16 GPU H100 de 80 GB (1280 GB) o 8 GPU H200 de 141 GB (1128 GB), ambas al limite y sin margen comodo para cache KV; 8 GPU B200 de 192 GB ofrecen margen.
- Configuracion en FP8: 8 GPU H100 de 80 GB cubren los pesos por poco; se recomienda 8 GPU H200 de 141 GB o superior para dejar espacio a la cache KV.
- Configuracion en 4 bits: 4 GPU H100 de 80 GB o 8 GPU A100 de 80 GB resultan suficientes para los pesos.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Incluso en 4 bits harian falta del orden de 10-14 aceleradores de 24 GB, y el autor no documenta despliegue multi-GPU heterogeneo de ese tipo.
- Opciones de despliegue: vLLM y SGLang, mencionados explicitamente por el autor. El modelo tambien esta disponible mediante API compatible con OpenAI. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus fichas publicas; en la informacion disponible no hay comparaciones directas de rendimiento con Step-5-Preview.

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Step-5-Preview | ~604 B | ~27 B | 1 M tokens | Texto, imagen y video | StepFun Community License |
| DeepSeek-V3 | 671 B | 37 B | 128 K tokens | No (texto) | MIT |
| Qwen3-235B-A22B | 235 B | 22 B | 128 K tokens (extensible a 1 M con YaRN) | No (texto) | Apache 2.0 |
| Kimi K2 | 1 T | 32 B | 128 K tokens | No (texto) | Modified MIT |

Diferencias destacables: Step-5-Preview es el unico de la tabla con contexto nativo de 1M de tokens y con entrada multimodal de imagen y video declarada; a cambio, su licencia no es una licencia OSI estandar, lo que exige revision legal antes de un uso comercial. En eficiencia de activacion queda en la banda baja del grupo (~4,5 % de los parametros totales activos por token).

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card incluye una seccion "Ethical Considerations" en su indice, pero su contenido no estaba en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se publican tasas ni evaluaciones de fidelidad en la informacion disponible.
- Idiomas: los idiomas declarados son ingles, chino y "multilingual", sin lista explicita. No hay datos sobre el rendimiento en castellano ni en otras lenguas distintas del ingles y el chino.
- Licencia: stepfun-community-license, marcada como license: other. No es una licencia OSI estandar, por lo que los terminos de uso comercial deben revisarse en el archivo LICENSE antes de cualquier despliegue en produccion.
- Procedencia del repositorio: el checkpoint esta publicado por la cuenta SHSLab, no por la cuenta oficial de StepFun. Conviene verificar la autenticidad de los pesos y contrastar con las fuentes oficiales del autor antes de usarlos en produccion.
- Limites multimodales: el video se recomienda con un maximo de 128 MB y 5 minutos por archivo; superar esos limites puede degradar el resultado o provocar fallos.
- Contexto largo: aunque la ventana es de 1M de tokens, no se documenta la degradacion de calidad en posiciones muy lejanas ni el coste real de la cache KV en ese regimen.
- Hardware: los pesos BF16 ocupan 1,21 TB: el modelo no es desplegable en hardware de consumo y exige un nodo multi-GPU de gama alta. No hay cuantizaciones oficiales publicadas.
- Requiere custom_code en transformers, lo que implica ejecutar codigo remoto del repositorio; hay que auditar ese codigo antes de cargarlo en entornos sensibles.
- Datos de entrenamiento, benchmarks y metricas de rendimiento no disponibles, lo que impide una evaluacion independiente con la informacion proporcionada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe aun validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SHSLab/Step-5-Preview-BF16
- Licencia: https://huggingface.co/SHSLab/Step-5-Preview-BF16/blob/main/LICENSE
- Organizacion del publicador en Hugging Face: https://huggingface.co/SHSLab
- Repositorio oficial de StepFun en GitHub: https://github.com/stepfun-ai
- Servidor de Discord de StepFun: https://discord.gg/stepfun
- Banner del modelo: https://huggingface.co/SHSLab/Step-5-Preview-BF16/Step-5/banner.png
- Diagrama de caracteristicas: https://huggingface.co/SHSLab/Step-5-Preview-BF16/Step-5/features.png
- Diagrama de arquitectura: https://huggingface.co/SHSLab/Step-5-Preview-BF16/Step-5/architecture.png
- Busqueda web: no se encontraron resultados relevantes sobre este modelo.
