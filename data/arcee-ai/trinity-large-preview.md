# arcee-ai/Trinity-Large-Preview

## Resumen

Trinity-Large-Preview es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso desarrollado por Arcee AI, con aproximadamente 398.000 millones de parámetros totales y unos 13.000 millones activos por token. Es el checkpoint de mayor tamano de la familia Trinity y se distribuye como una version ligeramente post-entrenada (instruction tuning sobre 20.000 millones de tokens) del modelo base Trinity-Large-Base, que fue preentrenado con 17 billones de tokens. Su proposito es ofrecer capacidad de nivel frontera con un coste de inferencia contenido gracias a la esparsidad del enrutado (4 de 256 expertos activos).

El modelo emplea la arquitectura AfmoeForCausalLM, una implementacion MoE dispersa con 256 expertos (uno compartido), 6 capas densas y una estrategia de enrutado 4-de-256 que supone una esparsidad del 1,56 %. La longitud de contexto durante el preentrenamiento fue de 8.192 tokens, pero se extendio posteriormente hasta 512k tokens, lo que lo situa en la liga de modelos de contexto largo.

Es relevante ahora porque combina un contexto muy extenso con una huella de computo por token relativamente baja, y porque Arcee AI lo publica bajo la licencia OpenMDW-1.1 junto con variantes complementarias (Thinking, TrueBase, Base) del mismo entrenamiento. Ademas, esta disponible en OpenRouter y soporta despliegue en vLLM, llama.cpp y LM Studio, lo que facilita su evaluacion tanto en la nube como en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse MoE (AfmoeForCausalLM) |
| Parametros totales | ~398.635.286.016 (~398B) |
| Parametros activos | ~13B por token |
| Longitud de contexto | 8.192 tokens en preentrenamiento; 512k tras extension |
| Tipos de cuantizacion | GGUF (q4_k_m disponible en el repo GGUF); BF16 sin cuantizar; FP32 para sesgos de correccion de expertos |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (repo principal); GGUF (repo separado) |

## Arquitectura y entrenamiento

Trinity-Large-Preview es un transformer MoE disperso con 256 expertos, de los cuales uno es compartido y cuatro se activan por token mediante enrutado 4-de-256 (1,56 % de esparsidad). Incorpora 6 capas densas y utiliza sesgos de correccion de expertos (`expert_bias`) que deben mantenerse en FP32 incluso cuando el resto del modelo se carga en BF16, un detalle critico para reproducir el comportamiento previsto en inferencia. El preentrenamiento cubrio 17 billones de tokens con datos de Datology y se ejecuto sobre 2.048 GPUs NVIDIA B300 con paralelismo HSDP y Expert Parallelism, con Prime Intellect como socio de computo. La longitud de contexto inicial de 8.192 tokens se extendio despues hasta 512k.

El post-entrenamiento de este checkpoint consistio en un instruction tuning ligero sobre 20.000 millones de tokens; segun la model card, el modelo sigue en fase de RL activo, por lo que se trata de una version "preview" y no de un modelo final. La familia Trinity Large incluye ademas Trinity-Large-Thinking (optimizado para razonamiento y uso agentico con cadena de pensamiento extendida), Trinity-Large-TrueBase (checkpoint de preentrenamiento de 10 billones de tokens antes del anneal) y Trinity-Large-Base (modelo fundacional completo de 17 billones de tokens con anneals de mid-training). El informe tecnico esta disponible en el repositorio de GitHub de Arcee AI.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat integrada (`apply_chat_template`).
- Comprension de contexto largo gracias a la ventana extendida de hasta 512k tokens.
- Razonamiento y matematicas basicas, con resultados en AIME 2025 superiores a Llama 4 Maverick segun la model card.
- Soporte de tool calling / function calling en vLLM mediante `--enable-auto-tool-choice` y el parser `hermes`.
- Capacidades multilingues en once idiomas: ingles, espanol, frances, aleman, italiano, portugues, ruso, arabe, hindi, coreano y chino.
- Modo conversacional listo para chat (chat-ready) tras el instruction tuning.
- No se documentan capacidades de vision, audio ni un modo "thinking" explicito en este checkpoint; el razonamiento extendido corresponde a la variante Trinity-Large-Thinking.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales muy largos gracias a su contexto de hasta 512k tokens, manteniendo coherencia sobre documentos de soporte, tickets previos y politicas internas en una sola ventana.
- Analisis de documentacion extensa: resumen y extraccion de informacion de contratos, informes tecnicos o expedientes de cientos de miles de tokens sin necesidad de fragmentar ni recurrir a RAG, lo que simplifica la arquitectura del pipeline.
- Asistentes de codigo en produccion: con soporte de tool calling en vLLM y el parser Hermes, puede integrarse en pipelines de CI/CD para revision de cambios, generacion de tests o explicacion de errores, invocando herramientas externas de forma estructurada.
- Agentes multi-paso: la combinacion de function calling y contexto largo permite construir agentes que mantienen el estado de la tarea a lo largo de muchas interacciones y llamadas a herramientas sin perder el hilo.
- Procesamiento multilingue: al cubrir once idiomas, es adecuado para plataformas de contenido o soporte global que necesitan un unico modelo para traduccion, moderacion o generacion en espanol, arabe, hindi, coreano o chino, entre otros.
- Despliegue en infraestructura propia con cuantizacion: la disponibilidad de GGUF q4_k_m y el soporte en llama.cpp y LM Studio permiten servir el modelo en entornos con recursos limitados, aunque el tamano total exige planificacion cuidadosa de memoria.
- Evaluacion comparativa y experimentacion: al ofrecerse variantes Base, TrueBase, Preview y Thinking del mismo entrenamiento, resulta util para investigacion sobre post-entrenamiento, RL y comportamiento de modelos MoE a gran escala.
- Prototipado via API: disponible en OpenRouter, permite probar el modelo sin desplegar infraestructura, util para validar casos de uso antes de invertir en GPU.

## Benchmarks y rendimiento

| Benchmark | Llama 4 Maverick | Trinity-Large Preview |
|---|---|---|
| MMLU | 85,5 | 87,2 |
| MMLU-Pro | 80,5 | 75,2 |
| GPQA-Diamond | 69,8 | 63,3 |
| AIME 2025 | 19,3 | 24,0 |

Los datos proceden de la model card del autor. Trinity-Large-Preview supera a Llama 4 Maverick en MMLU y AIME 2025, pero queda por debajo en MMLU-Pro y GPQA-Diamond. No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otras pruebas de codigo o matematicas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los ~398B parametros requieren aproximadamente 800 GB de memoria, lo que exige multiples GPUs o nodos; el repo completo ocupa 797,3 GB.
- Cuantizacion GGUF q4_k_m: reduce el peso a un orden de magnitud de ~200 GB, todavia fuera del alcance de GPUs de consumo individuales.
- GPU recomendadas: el entrenamiento se realizo en 2.048 NVIDIA B300; para inferencia se requieren configuraciones multi-GPU de clase数据中心 (H100, B200/B300, A100 80 GB en clusters). No cabe en una RTX 4090 ni en GPUs de consumo.
- Opciones de despliegue: Transformers (implementacion nativa AFMoE que preserve `expert_bias` en FP32), vLLM 0.11.1 o superior, llama.cpp b7061 o superior, LM Studio y API via OpenRouter. Tambien figura compatibilidad con endpoints y despliegue en SageMaker.
- Latencia y throughput: no disponibles en la informacion proporcionada. La esparsidad de 13B parametros activos por token sugiere un coste de computo por token muy inferior al de un modelo denso de 398B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Trinity-Large-Preview | ~398B | ~13B | 512k | OpenMDW-1.1 | HF, OpenRouter, vLLM, llama.cpp |
| Llama 4 Maverick | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| Trinity-Large-Thinking | mismo entrenamiento | ~13B | 512k | OpenMDW-1.1 | HF |
| Trinity-Large-Base | ~398B | ~13B | 512k | OpenMDW-1.1 | HF |

La comparacion cuantitativa con Llama 4 Maverick solo esta disponible en los benchmarks de la tabla anterior. No se dispone de datos de parametros, contexto ni licencia de Llama 4 Maverick en la informacion proporcionada, por lo que se indican como no disponibles. Las variantes Trinity-Large-Thinking y Trinity-Large-Base comparten el mismo entrenamiento base y difieren en el post-entrenamiento.

## Limitaciones y advertencias

- Modelo en estado "preview" y con RL activo: el comportamiento puede cambiar en versiones posteriores y no debe tratarse como un checkpoint final estable.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en la informacion disponible.
- Sesgos conocidos: no se detallan en la model card; cabe esperar los sesgos derivados de los datos de preentrenamiento y del instruction tuning.
- Rendimiento inferior a Llama 4 Maverick en MMLU-Pro y GPQA-Diamond, lo que sugiere menor solidez en razonamiento cientifico y preguntas complejas frente a ese competidor.
- Requisitos de hardware muy elevados: ~800 GB en BF16 y ~200 GB en q4_k_m, lo que descarta el despliegue en GPUs de consumo y obliga a clusters multi-GPU.
- Detalle critico de precision: los `expert_bias` deben conservarse en FP32 al cargar en BF16; ignorarlo puede degradar la calidad de forma silenciosa.
- Cobertura idiomatica declarada de once idiomas, pero sin datos publicados sobre calidad relativa por idioma; el espanol esta incluido pero no se aportan metricas.
- Licencia OpenMDW-1.1: es una licencia "other" con nombre propio; deben revisarse sus terminos concretos (enlace LICENSE del repo) antes de un uso comercial en produccion.
- No se documentan capacidades de vision, audio ni modo thinking en este checkpoint; para razonamiento extendido debe usarse Trinity-Large-Thinking.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arcee-ai/Trinity-Large-Preview
- Modelo base: https://huggingface.co/arcee-ai/Trinity-Large-Base
- Variante de razonamiento: https://huggingface.co/arcee-ai/Trinity-Large-Thinking
- Checkpoint de preentrenamiento: https://huggingface.co/arcee-ai/Trinity-Large-TrueBase
- Repo GGUF: https://huggingface.co/arcee-ai/Trinity-Large-Preview-GGUF
- Informe tecnico: https://github.com/arcee-ai/trinity-large-tech-report/
- Demo de chat: http://chat.arcee.ai/
- Paper (arXiv): https://arxiv.org/abs/2602.17004
- Licencia: https://huggingface.co/arcee-ai/Trinity-Large-Preview/blob/main/LICENSE
- API en OpenRouter: https://openrouter.ai/
- Datology (socio de datos): https://www.datologyai.com/
- Prime Intellect (socio de computo): https://www.primeintellect.ai/
