# brishen/iron-embeddinggemma2-npu2

## Resumen

`brishen/iron-embeddinggemma2-npu2` es un export de inferencia para NPU de AMD del modelo de embeddings `google/embeddinggemma-2`. No contiene una red en formato PyTorch ni pesos tipo safetensors: es un paquete de kernels compilados para la NPU (ficheros `.xclbin` junto con sus instruction streams) y los pesos empaquetados que el runtime en Rust `taconite-embeddinggemma2` reproduce sobre XRT o directamente sobre el driver `amdxdna`. Lo publica el usuario `brishen`, autor asimismo del proyecto IRON de ejemplos para Ryzen AI, bajo licencia Apache 2.0.

Se trata de un artefacto de despliegue, no de un modelo entrenado desde cero: hereda el modelo base `google/embeddinggemma-2`, que segun la documentacion referenciada es un modelo abierto de en torno a 740 millones de parametros construido sobre la arquitectura decoder de la familia Gemma y disenado para producir embeddings multimodales en un espacio vectorial unificado de 768 dimensiones. Este export concreto cubre unicamente la ruta de imagen: entra una imagen y sale el embedding de 768 dimensiones que `sentence-transformers` calcularia para ella, con un coste de aproximadamente 1,1 segundos por imagen en un Ryzen AI 9 HX 370.

Su relevancia es practica: permite ejecutar la generacion de embeddings de imagen sin GPU dedicada y con la NPU del propio SoC, manteniendo el embedding en el mismo espacio compartido que los embeddings de texto de EmbeddingGemma 2, de modo que ambos se pueden comparar por similitud coseno. La fidelidad declarada frente a la implementacion float32 en transformers es de coseno 0,99977-0,99993 sobre las imagenes de referencia del bundle, con preprocesado bit-exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Export de kernels para NPU sobre el modelo base `google/embeddinggemma-2` (arquitectura decoder de la familia Gemma, segun la documentacion referenciada) |
| Parametros totales | 740 M (del modelo base, segun la documentacion referenciada); el bundle pesa 765,6 MB en 94 ficheros |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos empaquetados para NPU, sin formatos de cuantizacion estandar documentados) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 (aplican tambien los terminos del modelo base) |
| Formato de pesos | Kernels compilados para NPU (`.xclbin` + instruction streams) y pesos empaquetados para el runtime `taconite-embeddinggemma2`; no safetensors ni GGUF |
| Pipeline | feature-extraction / image-feature-extraction / embedding |
| Modelo base | google/embeddinggemma-2 |
| Dimension del embedding | 768 (con opcion de reduccion a 256 via `--dim`) |
| Hardware objetivo | NPU2 (AIE2P): Strix Point, Strix Halo, Krackan; no carga en NPU1 (Phoenix, Hawk Point) |

## Arquitectura y entrenamiento

Este repositorio no documenta un entrenamiento propio. Es un artefacto de compilacion y empaquetado: los kernels se han compilado para la microarquitectura NPU2 (AIE2P, presente en Strix Point, Strix Halo y Krackan) y el bundle incluye tanto esos kernels como los pesos ya empaquetados que el runtime reproduce. El modelo de origen, `google/embeddinggemma-2`, es el que aporta la arquitectura y el conocimiento aprendido; segun la documentacion referenciada se trata de un modelo de aproximadamente 740 M de parametros basado en el decoder de la familia Gemma y orientado a embeddings multimodales en un espacio de 768 dimensiones.

La innovacion tecnica relevante esta en el despliegue, no en el entrenamiento. El export cubre solo la ruta de imagen: se ejecutan los dos transformers del modelo sobre la NPU, con un coste aproximado de 1,1 s por imagen en un Ryzen AI 9 HX 370. El preprocesado es bit-exacto respecto a la referencia float32 de transformers y el embedding resultante alcanza una similitud coseno de 0,99977-0,99993 en las imagenes de referencia incluidas en el bundle. El paquete se genera desde `iron/applications/embeddinggemma2` del proyecto IRON (commit `f164c37`) y se consume mediante el runtime Rust `taconite-embeddinggemma2`, que puede operar sobre XRT o directamente sobre el driver `amdxdna` sin XRT.

## Capacidades

- Generacion de embeddings de imagen: recibe una imagen y devuelve un vector de 768 dimensiones (reducible a 256) en el espacio compartido de EmbeddingGemma 2.
- Compatibilidad cross-modal: el embedding de imagen es comparable por similitud coseno con embeddings de texto de EmbeddingGemma 2 generados en cualquier otra plataforma, lo que habilita recuperacion imagen-texto.
- Ejecucion en NPU: la inferencia se realiza sobre la NPU del SoC, sin necesidad de GPU dedicada, mediante kernels nativos.
- Verificacion de fidelidad: el comando `embeddinggemma2 check` compara cada etapa contra las referencias float32 del bundle.
- Reduccion de dimensionalidad: soporte de `--dim` para emitir embeddings de menor tamano (por ejemplo 256) segun el caso de uso.
- Procesamiento por lotes desde linea de comandos: la CLI acepta varias imagenes de entrada y una salida a fichero (`-o emb.f32`).
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni audio/video en este export concreto.

## Casos de uso

- Busqueda visual en aplicaciones de escritorio o portatiles con Ryzen AI: indexar una fototeca local generando embeddings de imagen en la NPU y recuperar por consulta semantica, minimizando el consumo energetico al no usar GPU.
- Recuperacion multimodal (RAG) en el dispositivo: generar embeddings de imagen que comparten espacio con los de texto, de modo que una consulta textual recupere imagenes relevantes de un corpus local sin conexion a la nube.
- Deduplicacion y agrupamiento de imagenes: calcular embeddings para detectar imagenes casi identicas o agrupar por similitud mediante distancia coseno, util en pipelines de gestion de activos digitales.
- Moderacion y clasificacion de contenido visual: usar los embeddings como caracteristica de entrada a un clasificador ligero para filtrar o etiquetar imagenes en el propio equipo.
- Sistemas de recomendacion visual: emplear los vectores de imagen como representacion latente para ordenar y sugerir contenido basandose en similitud con elementos ya vistos por el usuario.
- Prototipado y evaluacion de modelos de embeddings en portatiles con NPU Ryzen AI: validar la fidelidad del export con `embeddinggemma2 check` antes de integrarlo en produccion.
- Anotacion y organizacion de datasets de vision: precalcular embeddings por lotes desde la CLI para tareas de clustering, curación y analisis de sesgos en colecciones de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas de recuperacion). El unico dato de rendimiento reportado es de fidelidad y latencia:

| Metrica | Valor |
|---|---|
| Fidelidad del embedding (coseno) frente a float32 transformers | 0,99977-0,99993 sobre las imagenes de referencia del bundle |
| Preprocesado | bit-exacto respecto a la referencia float32 |
| Latencia por imagen | ~1,1 s en un Ryzen AI 9 HX 370 |
| Tamano del bundle | 765,6 MB en 94 ficheros |

## Requisitos de hardware

- Hardware obligatorio: NPU2 (AIE2P), es decir, procesadores Strix Point, Strix Halo o Krackan. Los kernels no cargan en NPU1 (Phoenix, Hawk Point).
- No requiere GPU dedicada: la inferencia corre sobre la NPU del SoC; no se documenta uso de VRAM de GPU.
- VRAM de GPU: no aplicable; no se proporcionan estimaciones de memoria del sistema para el bundle (el paquete ocupa 765,6 MB en disco).
- Ejemplo de plataforma verificada: Ryzen AI 9 HX 370, con ~1,1 s por imagen.
- Opciones de despliegue: runtime Rust `taconite-embeddinggemma2`, bien sobre XRT (`cargo install taconite-embeddinggemma2`) o directamente sobre el driver `amdxdna` sin XRT (`--no-default-features --features cli,direct`).
- No es compatible con vLLM, llama.cpp, Ollama ni TGI: no es un modelo generativo ni usa formatos GGUF/safetensors.
- Throughput estimado: no disponible mas alla del dato de latencia por imagen (~1,1 s) en la plataforma citada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento/uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| brishen/iron-embeddinggemma2-npu2 (este) | 740 M (del base) | no disponible | ~1,1 s/imagen en Ryzen AI 9 HX 370; coseno 0,99977-0,99993 vs float32 | Apache 2.0 | Solo NPU2 (Strix Point/Halo, Krackan) |
| google/embeddinggemma-2 (base, float32 en transformers) | 740 M | no disponible | Referencia de fidelidad del export | Apache 2.0 | Multiplataforma (CPU/GPU) |
| Otros codificadores de imagen (p. ej. familia CLIP/SigLIP) | no disponible | no disponible | no disponible | varía segun modelo | multiplataforma |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa directa con alternativas; la unica comparacion documentada es la de fidelidad frente a la implementacion float32 del propio modelo base.

## Limitaciones y advertencias

- Alcance restringido: el export cubre unicamente la ruta de imagen; no expone la ruta de texto ni otras modalidades que pueda soportar el modelo base.
- Dependencia de hardware: no funciona en NPU1 (Phoenix, Hawk Point) ni en equipos sin NPU2. Requiere exactamente la microarquitectura AIE2P.
- Formato no estandar: no es un modelo safetensors ni GGUF; no se puede cargar con herramientas habituales (vLLM, llama.cpp, Ollama, TGI) y solo es consumible con el runtime `taconite-embeddinggemma2`.
- Sin datos de contexto, idiomas ni cuantizacion: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido generativo (produce embeddings, no texto), pero los embeddings pueden reflejar sesgos presentes en el modelo base.
- Sesgos conocidos: no disponibles.
- Fidelidad dependiente de la plataforma: el coseno 0,99977-0,99993 se midio sobre imagenes de referencia concretas; otros dominios de imagen podrian degradar la fidelidad.
- Licencia: Apache 2.0, pero aplican tambien los terminos del modelo base `google/embeddinggemma-2`; conviene revisarlos antes de uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brishen/iron-embeddinggemma2-npu2
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Proyecto IRON (AMD): https://github.com/amd/IRON
- Runtime Rust `taconite-embeddinggemma2` (crates.io): https://crates.io/crates/taconite-embeddinggemma2
- Documentacion del runtime: https://docs.rs/taconite-embeddinggemma2
- Codigo fuente `taconite`: https://github.com/Brishen/taconite
- EmbeddingGemma en Google DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
- EmbeddingGemma en Google AI for Developers: https://ai.google.dev/gemma/docs/embeddinggemma
- Documentacion de Unsloth sobre EmbeddingGemma 2: https://unsloth.ai/docs/models/embeddinggemma-2
