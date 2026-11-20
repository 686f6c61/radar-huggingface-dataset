# furiosa-ai/Qwen3-4B-FP8

## Resumen

Qwen3-4B-FP8 es la versión cuantizada en FP8 del modelo denso de 4B parámetros de la familia Qwen3, publicada originalmente por el equipo de Qwen (Alibaba). Este repositorio concreto, mantenido por FuriosaAI, empaqueta esos pesos junto con un Furiosa Executable Bundle (FXB) para ejecutar el modelo sobre aceleradores FuriosaAI RNGD mediante la librería Furiosa-LLM. Se trata, por tanto, de una distribución de inferencia optimizada para hardware específico, no de un modelo nuevo entrenado desde cero.

El modelo subyacente es un transformer causal con grouped-query attention que destaca por su naturaleza híbrida: puede alternar entre un modo de razonamiento (thinking mode), en el que emite una cadena de pensamiento antes de la respuesta final, y un modo directo (non-thinking) para diálogo general eficiente. Esta capacidad se controla por petición mediante el parámetro `enable_thinking`, lo que permite ajustar el coste computacional según la tarea.

Su relevancia actual radica en dos factores. Primero, ofrece razonamiento, tool calling y capacidades de agente en un tamaño de 4B parámetros, lo que lo hace desplegable en entornos con recursos limitados. Segundo, la integración con Furiosa-LLM y el hardware RNGD abre una vía de inferencia alternativa a las GPU convencionales, con soporte de API compatible con OpenAI y parsers dedicados para razonamiento y llamadas a herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3) con grouped-query attention |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 estatico en pesos; activaciones en FP8 dinamico (per-token / per-block); KV cache en 16 bits |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mas Furiosa Executable Bundle, FXB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-4B original: un transformer causal denso con grouped-query attention. El repositorio no aporta detalles sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), por lo que esos datos deben consultarse en la model card upstream de Qwen. Lo que sí documenta este repositorio es el proceso de cuantización: los pesos se cuantizan a FP8 de forma estática, siguiendo la release FP8 original de Qwen, mientras que las activaciones se cuantizan dinámicamente en tiempo de ejecución con granularidad per-token y per-block. La caché KV se mantiene en precisión de 16 bits para preservar calidad en la atención.

La innovación técnica destacable de esta distribución es el empaquetado como Furiosa Executable Bundle (FXB) para el acelerador RNGD. El modelo se ejecuta con un tamaño de tensor-parallel de 8 PEs, que corresponde a una única tarjeta RNGD (8 PEs por tarjeta). El servidor Furiosa-LLM expone una API compatible con OpenAI e incorpora un parser de razonamiento (`qwen3`) que separa la cadena de pensamiento de la respuesta final, además de un parser de tool calling (`hermes`), el usado por la serie Qwen3.

## Capacidades

- Generación de texto y diálogo conversacional multi-turno.
- Razonamiento híbrido: modo thinking (cadena de pensamiento antes de responder) y modo non-thinking, conmutables por petición mediante `enable_thinking`.
- Razonamiento matemático y resolución de problemas complejos en modo thinking.
- Generación y razonamiento sobre código.
- Tool calling / function calling mediante el parser `hermes`, con opción de elección automática de herramienta (`--enable-auto-tool-choice`).
- Capacidades de agente y razonamiento multi-paso, apoyadas en el modo thinking y el tool calling.
- Soporte multilingüe según la model card upstream (los metadatos del repositorio declaran únicamente inglés).
- Salida estructurada del razonamiento en un campo separado (`message.reasoning` en no streaming, `delta.reasoning` en streaming).

## Casos de uso

- Asistente conversacional con API OpenAI-compatible: el servidor Furiosa-LLM expone `/v1/chat/completions`, de modo que se puede integrar con el SDK de OpenAI y con cualquier cliente compatible sin cambios en el código de la aplicación.
- Razonamiento matemático y lógico en producción: activando el modo thinking por petición se obtiene una cadena de pensamiento que mejora la precisión en problemas de varios pasos, y el parser `qwen3` permite registrar o auditar ese razonamiento por separado de la respuesta.
- Agentes con herramientas: con `--enable-auto-tool-choice --tool-call-parser hermes`, el modelo decide cuándo invocar funciones externas (APIs, bases de datos, calculadoras), lo que habilita flujos de agente multi-paso.
- Generación de código asistida: el modelo puede producir y razonar sobre fragmentos de código, integrándose en asistentes de desarrollo o pipelines de revisión.
- Atención al cliente automatizada: el diálogo multi-turno y el modo non-thinking (más económico) permiten gestionar conversaciones generales con baja latencia, reservando el modo thinking para consultas complejas.
- Clasificación y extracción de información con salida controlada: el soporte de tool calling permite forzar respuestas en formato estructurado (JSON) para alimentar sistemas downstream.
- Despliegue sobre aceleradores FuriosaAI RNGD: organizaciones que operan hardware RNGD pueden servir el modelo con una sola tarjeta (tensor-parallel de 8 PEs) usando el FXB incluido, sin depender de GPU convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 17,3 GB e incluye pesos FP8 más el bundle FXB, por lo que el espacio en disco y memoria requerido es considerable para un modelo de 4B.
- Hardware objetivo principal: FuriosaAI RNGD, con tensor-parallel de 8 PEs que mapea a una única tarjeta RNGD.
- GPU convencionales: el modelo también puede ejecutarse en otros frameworks (vLLM, SGLang, Transformers) según la model card upstream, pero no se proporcionan cifras de VRAM ni GPU recomendadas para esos entornos.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: Furiosa-LLM (`furiosa-llm serve`), además de vLLM, SGLang y Transformers según la documentación upstream.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-4B-FP8 | 4,41B (denso) | no disponible | FP8 (pesos y activaciones) | Apache 2.0 | FuriosaAI RNGD (via Furiosa-LLM); tambien vLLM/SGLang/Transformers |
| Qwen/Qwen3-4B-FP8 (upstream) | 4,41B (denso) | no disponible | FP8 | Apache 2.0 | GPU convencionales (vLLM, SGLang, Transformers) |
| Qwen/Qwen3-4B (base) | 4,41B (denso) | no disponible | BF16/FP16 (sin cuantizar) | Apache 2.0 | GPU convencionales |

La diferencia principal frente a las alternativas es el empaquetado FXB y la integración con Furiosa-LLM para RNGD; en lo relativo a pesos y capacidades del modelo, esta distribución es equivalente a la release FP8 upstream de Qwen. No se dispone de datos de benchmarks para comparar el rendimiento numérico entre estas variantes.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una degradación de calidad respecto al modelo en BF16, especialmente en tareas de razonamiento matemático o código; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a los modelos generativos; el modo thinking no elimina este riesgo y puede alargar las respuestas.
- Los metadatos del repositorio declaran únicamente inglés como idioma soportado, aunque la model card upstream menciona soporte multilingüe; conviene validar el comportamiento en castellano antes de usarlo en producción.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar cargas con ventanas largas sin consultar la model card upstream.
- El campo `reasoning` no forma parte de la especificación de la API de OpenAI; es una convención extendida. Su acceso cuando no hay contenido de razonamiento lanza `AttributeError`, por lo que el código cliente debe manejarlo.
- El despliegue con Furiosa-LLM está atado al hardware RNGD; fuera de ese hardware hay que recurrir a los frameworks upstream.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio upstream para confirmar los términos exactos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-4B-FP8
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-4B-FP8
- Licencia upstream: https://huggingface.co/Qwen/Qwen3-4B-FP8/blob/main/LICENSE
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- Guía de tool calling: https://developer.furiosa.ai/latest/en/furiosa_llm/toolcalling.html
- Sitio de FuriosaAI: https://furiosa.ai
