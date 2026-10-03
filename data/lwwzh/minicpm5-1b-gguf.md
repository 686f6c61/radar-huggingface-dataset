# LWWZH/MiniCPM5-1B-GGUF

## Resumen

MiniCPM5-1B-GGUF es la version cuantizada en formato GGUF del modelo MiniCPM5-1B, publicado por el usuario LWWZH a partir del checkpoint oficial de OpenBMB (repo `openbmb/MiniCPM5-1B`). Se trata de un transformer denso decoder-only de tipo `LlamaForCausalLM` con 1.080.632.832 parametros totales (679.552.512 sin contar embeddings), 24 capas y atencion con grouped-query attention de 16 cabezas para Q y 2 para KV. Su ventana de contexto nativa es de 131.072 tokens, un valor inusualmente alto para la categoria de 1B parametros.

El modelo esta disenado explicitamente para despliegue en dispositivo (on-device), entornos con recursos limitados, asistentes locales, agentes de programacion y flujos de uso de herramientas. Incorpora razonamiento hibrido mediante una plantilla de chat con etiqueta `<think>` que se activa o desactiva con el parametro `enable_thinking`, de modo que un mismo checkpoint sirve como asistente rapido o como razonador deliberativo. OpenBMB lo presenta como SOTA de codigo abierto en la clase 1B dentro de su conjunto de comparacion, con ventaja mas marcada en uso de herramientas, generacion de codigo y razonamiento dificil.

La relevancia de esta ficha concreta radica en el formato: los pesos GGUF permiten ejecutar el modelo en llama.cpp, Ollama o LM Studio sobre CPU y GPU de consumo, algo que los checkpoints BF16 en safetensors no facilitan. El modelo base se entreno siguiendo la receta de gestion de datos por niveles UltraData y se libera bajo licencia Apache 2.0, lo que habilita uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (`LlamaForCausalLM`), atencion causal con GQA |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros sin embeddings | 679.552.512 |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en GGUF, pero no se detallan los niveles concretos) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (orientado a llama.cpp, Ollama y LM Studio); el modelo base oficial se distribuye en safetensors BF16 |
| Capas | 24 |
| Cabezas de atencion | 16 para Q, 2 para KV (GQA) |
| Tamano del repositorio | 9,4 GB |
| Modelo base | openbmb/MiniCPM5-1B |
| Autor de la cuantizacion | LWWZH (tercero, no OpenBMB) |
| Fecha de creacion / actualizacion | 2026-10-03 / 2026-10-03 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso convencional de 24 capas con `LlamaForCausalLM` como implementacion de referencia, sin mezcla de expertos ni capas de estado recurrente. La atencion emplea grouped-query attention con 16 cabezas de consulta y solo 2 cabezas de clave-valor, lo que reduce de forma notable el coste de la cache KV en contextos largos. Con 1.080.632.832 parametros totales y 679.552.512 parametros no asociados a embeddings, el modelo mantiene una huella de despliegue pequena: aproximadamente 2,16 GB en BF16 y del orden de 0,5 a 1,1 GB en cuantizaciones GGUF de 4 a 8 bits.

El entrenamiento sigue la receta de UltraData Tiered Data Management, descrita como un proceso en tres etapas: entrenamiento base, mid-training y post-entrenamiento. La fase base combina entrenamiento estable y entrenamiento de decaimiento; el mid-training refuerza capacidades objetivo y adapta el modelo a la distribucion de datos final. El corpus se publica junto al modelo como Ultra-FineWeb, Ultra-FineWeb-L3 y UltraData-Math. El post-entrenamiento se divide en SFT, RL y OPD (On-Policy Distillation): primero se usan 200.000 millones de tokens de SFT de pensamiento profundo y otros 200.000 millones de tokens de SFT de pensamiento hibrido para establecer las capacidades de razonamiento profundo, razonamiento hibrido y chat general (datos liberados como UltraData-SFT-2605); despues se entrenan profesores de RL especializados en matematicas, codigo, QA a libro cerrado y escritura, y se destilan de vuelta en un unico modelo de publicacion mediante OPD. El modo de razonamiento se controla con la etiqueta `<think>` de la plantilla de chat y el flag `enable_thinking`.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento deliberativo con modo de pensamiento explicito activable mediante `<think>` y el parametro `enable_thinking`; el mismo checkpoint opera en modo rapido (no-think) o en modo razonador.
- Razonamiento matematico, reforzado en la fase de RL mediante profesores especializados y destilacion OPD.
- Generacion de codigo, con ventaja declarada por OpenBMB frente a modelos del mismo tamano en esta tarea.
- Tool calling y function calling, uno de los ejes de entrenamiento destacados en la model card.
- Flujos agenticos y razonamiento de multiples pasos, orientados a asistentes locales y agentes de programacion.
- Soporte nativo de contexto largo de hasta 131.072 tokens, util para documentos extensos y repositorios de codigo.
- Despliegue en dispositivo (edge-ai), incluido el proyecto MiniCPM Desk Pet como ejemplo de aplicacion local.
- Capacidades multimodales (vision, audio): no disponible; no se mencionan en la informacion proporcionada.

## Casos de uso

- Asistente local en escritorio: al pesar del orden de 1 GB en cuantizacion de 4 bits, el modelo puede ejecutarse integramente en un portatil sin GPU dedicada mediante llama.cpp u Ollama, sirviendo como asistente de chat privado sin envio de datos a la nube.
- Agente de programacion en el IDE: con soporte de tool calling y modo de pensamiento, puede encadenar lecturas de ficheros, ediciones y ejecucion de comandos en un bucle agentico de varios pasos, con la ventaja de no requerir conexion externa.
- Automatizacion de atencion al cliente en ingles o chino: la ventana de 131.072 tokens permite mantener el historial completo de una conversacion multi-turno y adjuntar documentacion de producto sin truncar.
- Extraccion y resumen de documentos largos: informes, contratos o articulos de hasta 131k tokens en ingles o chino, con salida estructurada y resumen por secciones.
- Router o clasificador previo en pipelines de inferencia: por su tamano reducido y baja latencia, puede actuar como primera etapa que decide si una consulta se resuelve localmente o se delega a un modelo mayor.
- Generacion de codigo en produccion: integrado en pipelines de CI/CD para generar pruebas unitarias, parches o mensajes de commit, con cuantizacion de 4 bits para reducir el coste de GPU por peticion en cargas de alto volumen.
- Prototipado e investigacion de tecnicas de razonamiento hibrido: el mismo checkpoint permite comparar de forma controlada el modo `<think>` activado y desactivado, util para medir el coste de tokens frente a la mejora de exactitud.
- Educacion y tutoria en matematicas: explicaciones paso a paso en chino o ingles para ejercicios de nivel escolar y universitario basico, ejecutables en hardware de bajo coste para despliegues escolares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card de OpenBMB presenta graficas de radar y tablas comparativas frente a LFM2.5-1.2B-Thinking, Qwen3-0.6B (modo think) y Qwen3.5-0.8B (modo think), pero los valores concretos no se reproducen en el texto proporcionado. Tampoco se incluyen resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de tool calling en la informacion disponible para el repositorio GGUF de LWWZH, que ademas no aporta mediciones propias de la cuantizacion.

| Benchmark | MiniCPM5-1B | LFM2.5-1.2B-Thinking | Qwen3-0.6B/think | Qwen3.5-0.8B/think |
|---|---|---|---|---|
| Resultados numericos | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, sin contar cache KV ni overhead del runtime): aproximadamente 0,5-0,7 GB en Q4, en torno a 1,1 GB en Q8 y unos 2,16 GB en BF16.
- Cache KV: reducida gracias a GQA con solo 2 cabezas KV, pero a 131.072 tokens de contexto sigue siendo el factor dominante del consumo de memoria; conviene dimensionarla segun la longitud real de las peticiones.
- GPU de consumo: cabe con holgura en cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 3060, GTX 1660, iGPU modernas). En Q4 puede ejecutarse solo en CPU con velocidad aceptable en equipos de escritorio.
- GPU de datacenter: A100, H100, L40S o similares no son necesarias por capacidad, pero permiten procesamiento por lotes de gran volumen y contextos muy largos de forma comoda.
- Apple Silicon: viable mediante llama.cpp u Ollama; existe ademas una version oficial MLX en 4 bits del modelo base para chips de la serie M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el checkpoint base admite transformers, vLLM y TGI en BF16. La model card menciona cookbooks y Agent Skills para los principales backends de inferencia y frameworks de ajuste fino en el repositorio de GitHub de MiniCPM.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia para este repositorio ni para el modelo base en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Resultados comparativos |
|---|---|---|---|---|---|
| MiniCPM5-1B (este, via GGUF de LWWZH) | 1,08 B (denso) | 131.072 | Apache 2.0 | GGUF, safetensors BF16 | SOTA declarado en la clase 1B dentro del conjunto de comparacion de OpenBMB |
| LFM2.5-1.2B-Thinking | 1,2 B (aproximado, segun denominacion) | no disponible | no disponible | no disponible | no disponible |
| Qwen3-0.6B/think | 0,6 B (segun denominacion) | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5-0.8B/think | 0,8 B (segun denominacion) | no disponible | no disponible | no disponible | no disponible |

Los tres modelos alternativos son los que la propia model card emplea como referencia de comparacion. No se dispone de cifras de rendimiento ni de especificaciones detalladas de esas alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo denso de 1B parametros; cabe esperar errores factuales y confabulacion en tareas de conocimiento cerrado, especialmente fuera de los dominios reforzados por RL (matematicas, codigo, QA a libro cerrado y escritura).
- Idiomas: solo se declaran ingles y chino. No hay soporte declarado de castellano, por lo que su uso en espanol tendra un rendimiento degradado, no evaluado y potencialmente con cambios de idioma o errores gramaticales.
- Sesgos: no se documentan analisis de sesgo, toxicidad ni alineacion mas alla de la descripcion general del post-entrenamiento (SFT, RL, OPD). No hay informacion sobre filtrado del corpus ni sobre evaluaciones de seguridad.
- Cuantizacion de terceros: este repositorio no lo publica OpenBMB, sino el usuario LWWZH. La perdida de calidad respecto al checkpoint BF16 original no esta medida ni documentada, y no se detallan los niveles de cuantizacion incluidos ni el proceso seguido.
- Ausencia de benchmarks verificables: no hay resultados numericos publicados en la informacion disponible, ni para el modelo base ni para esta cuantizacion, lo que impide validar la afirmacion de SOTA en la clase 1B o estimar la degradacion introducida por la cuantizacion.
- Contexto largo: aunque la ventana declarada es de 131.072 tokens, no se aportan resultados de pruebas tipo needle-in-a-haystack ni de recuperacion efectiva a longitudes extremas; el rendimiento real en contextos muy largos debe validarse por cuenta propia.
- Coste del modo de razonamiento: el modo `<think>` incrementa de forma notable el numero de tokens generados, lo que afecta a la latencia y al coste por peticion en produccion; debe desactivarse en tareas simples.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero se recomienda verificar el cumplimiento de las condiciones de atribucion y revisar si los conjuntos de datos de entrenamiento liberados (Ultra-FineWeb, UltraData) imponen condiciones adicionales para usos derivados.
- Ambiguedad en la fecha del repositorio: la fecha de creacion registrada (2026-10-03) debe comprobarse en el repositorio antes de citarla.
- Soporte multimodal: no disponible; el modelo es exclusivamente de texto.

## Enlaces

- Repositorio GGUF de este modelo: https://huggingface.co/LWWZH/MiniCPM5-1B-GGUF
- Modelo base oficial (BF16): https://huggingface.co/openbmb/MiniCPM5-1B
- Checkpoint SFT (pre-RL/OPD): https://huggingface.co/openbmb/MiniCPM5-1B-SFT
- Checkpoint base (solo pre-entrenamiento): https://huggingface.co/openbmb/MiniCPM5-1B-Base
- GGUF oficial de OpenBMB: https://huggingface.co/openbmb/MiniCPM5-1B-GGUF
- Version MLX 4-bit para Apple Silicon: https://huggingface.co/openbmb/MiniCPM5-1B-MLX
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Proyecto MiniCPM Desk Pet: https://github.com/OpenBMB/MiniCPM-Desk-Pet
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Informe tecnico de MiniCPM (arXiv 2506.07900): https://arxiv.org/pdf/2506.07900
- UltraData Tiered Data Management (arXiv 2602.09003): https://arxiv.org/pdf/2602.09003
- Referencia arXiv 2512.16649: https://arxiv.org/abs/2512.16649
- Referencia arXiv 2604.13016: https://arxiv.org/abs/2604.13016
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Portal UltraData: https://ultradata.openbmb.cn/
- ModelScope del modelo base: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B
- ModelScope del GGUF oficial: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B-GGUF
- ModelScope de la version MLX: https://www.modelscope.cn/models/OpenBMB/MiniCPM5-1B-MLX
