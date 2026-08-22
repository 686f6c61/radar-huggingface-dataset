# litert-community/Jan-nano

## Resumen

Jan-nano es un modelo de lenguaje de 4.000 millones de parámetros, especializado en razonamiento y uso de herramientas para tareas de investigación profunda (deep research). Fue desarrollado por Menlo y posteriormente convertido por la comunidad litert-community al formato LiteRT-LM (`.litertlm`) para su ejecución en dispositivos de borde (on-device), como teléfonos móviles y ordenadores de sobremesa. El modelo se basa en la arquitectura Qwen3-4B (Qwen3ForCausalLM) y ha sido ajustado mediante un proceso de entrenamiento por refuerzo con verificación de recompensas (RLVR) en múltiples etapas, optimizándolo específicamente para el uso de herramientas a través del Model Context Protocol (MCP).

La relevancia de Jan-nano radica en su capacidad para ejecutar razonamiento complejo y uso de herramientas en dispositivos con recursos limitados, gracias a la cuantización int4 y al runtime LiteRT-LM de Google (sucesor de TensorFlow Lite). Al ser un modelo de razonamiento, genera una cadena de pensamiento antes de responder, lo que exige una ventana de generación amplia (mínimo 2048 tokens) para obtener resultados completos. El repositorio ofrece dos versiones cuantizadas con distinta granularidad (block 128 y block 32), equilibrando precisión y velocidad de decodificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (Transformer, basado en Qwen3-4B) |
| Parametros totales | 4 000 millones (4B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (KV cache) |
| Tipos de cuantizacion | int4 simetrico por bloques (block 128 y block 32) con OCTAV optimal-clipping; embeddings INT8 (externalizados) |
| Idiomas soportados | no disponible (modelo base Qwen3 es multilingue, pero no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle que incluye tokenizador y plantilla de chat Qwen3 ChatML) |

## Arquitectura y entrenamiento

Jan-nano es un modelo transformer denso basado en la arquitectura Qwen3-4B, con un tamaño de 4 000 millones de parametros. La model card indica que fue fine-tuneado a partir de Menlo/Jan-nano, que a su vez se origina de Qwen3-4B, mediante un proceso de entrenamiento por refuerzo con verificación de recompensas (RLVR) en multiples etapas. Este enfoque optimiza el modelo para el uso de herramientas a traves del Model Context Protocol (MCP), lo que le permite planificar y ejecutar tareas de investigacion complejas de forma autonoma.

El modelo es un modelo de razonamiento explicito: genera una cadena de pensamiento (thinking) antes de emitir la respuesta final, siguiendo el formato ChatML de Qwen3. Para la inferencia, el bundle `.litertlm` incluye el tokenizer y la plantilla de chat, lo que simplifica su despliegue. La cuantizacion int4 con bloques de 128 o 32 y la tecnica OCTAV (optimal clipping) reducen el tamaño del modelo a aproximadamente 2.11 GiB para la version block 32, manteniendo un rendimiento cercano al modelo bf16 de referencia (88% vs 92% en GSM8K con block 128).

## Capacidades

- Razonamiento complejo con cadena de pensamiento (chain-of-thought) para problemas de matematicas, logica y analisis.
- Uso de herramientas y agentes mediante el Model Context Protocol (MCP), lo que permite interactuar con APIs, bases de datos y servicios externos.
- Capacidades de deep-research: planificacion de tareas de investigacion, busqueda de informacion y sintesis de resultados.
- Generacion de texto general con soporte de contexto de 4096 tokens.
- Soporte de funciones de llamada (tool calling) integradas en el flujo de razonamiento.
- Capacidades multilingues heredadas del modelo base Qwen3 (idiomas exactos no especificados en esta version).
- Ejecucion en dispositivos de borde (moviles, portatiles) con aceleracion por GPU (Metal, OpenCL) y CPU.

## Casos de uso

- **Investigacion automatizada de codigo**: el modelo puede planificar y ejecutar busquedas en repositorios de codigo, identificar configuraciones de red o de sistemas, y sintetizar hallazgos, como se muestra en el ejemplo de la model card ("Plan how to find where HTTP retries are configured in a Python repo").
- **Asistente personal on-device**: al ejecutarse en un telefono (iPhone 17 Pro a ~14 tok/s), puede actuar como un asistente de investigacion personal que consulta documentacion, resume articulos o gestiona tareas sin depender de la nube.
- **Automatizacion de tareas de analisis**: con soporte de MCP, puede conectarse a herramientas externas (bases de datos, hojas de calculo, APIs) y generar informes o responder preguntas complejas sobre datos.
- **Generacion de codigo asistida por agentes**: puede usar herramientas de ejecucion de codigo o busqueda de documentacion para generar o depurar codigo en proyectos de desarrollo.
- **Soporte tecnico especializado**: integrado en un chatbot, puede gestionar consultas multi-turno de soporte tecnico, buscando en bases de conocimiento y proporcionando respuestas razonadas.
- **Analisis de documentos y extraccion de informacion**: con contexto de 4096 tokens, puede procesar documentos largos y extraer conclusiones o responder preguntas concretas sobre su contenido.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion en GSM8K (n=100, greedy, 0-shot chain-of-thought, max_tokens 2048) para las distintas configuraciones:

| Configuracion | GSM8K |
|---|---|
| bf16 (referencia) | 92.0% |
| LiteRT int4 - block 128 | 88.0% (-4 pt) |
| LiteRT int4 - block 32 | 85.0% (-7 pt) |

Nota: la evaluacion con max_tokens 1024 penaliza severamente el rendimiento (63% con block 32) porque las cadenas de razonamiento se truncaban antes de llegar a la respuesta. Los resultados de velocidad se detallan en la seccion de requisitos de hardware. No se han publicado resultados de benchmarks en la informacion disponible para otras pruebas estandar (MMLU, HumanEval, etc.).

## Requisitos de hardware

- **VRAM estimada**: la version int4 block 128 ocupa aproximadamente 2.5 GB de RAM en el dispositivo (requisito del repositorio para Android); la version block 32 ocupa 2.11 GiB solo en la seccion de pesos, por lo que se acerca al limite de memoria de iOS.
- **GPU recomendadas**: se ha probado en Apple M4 Max (GPU Metal) y iPhone 17 Pro (GPU Metal). En Mac, la GPU ofrece una velocidad de decodificacion de ~69 tok/s (vs ~18 tok/s en CPU); en iPhone se alcanza ~14 tok/s. Tambien es compatible con GPUs de escritorio (OpenCL) y Android con GPU.
- **En consumer GPU**: si, cabe en dispositivos moviles y portatiles con al menos 2.5 GB de RAM libre. No requiere GPU dedicada de alto rendimiento.
- **Opciones de despliegue**: LiteRT-LM CLI (con servidor OpenAI-compatible), Google AI Edge Gallery (v1.0.16+ permite importar modelos directamente desde Hugging Face), o integracion directa con la libreria `litert-lm`.
- **Latencia y throughput**: en M4 Max, prefetch de 1003 tok/s (GPU) y 111 tok/s (CPU); decodificacion de 69 tok/s (GPU) y 18 tok/s (CPU). Time to first token (TTFT) de 0.28 s en GPU y 2.49 s en CPU.

## Comparativa con modelos similares

No hay datos publicados de benchmarks comparativos con otros modelos en la informacion proporcionada. Sin embargo, se puede contextualizar:

| Modelo | Tamano | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Jan-nano (LiteRT)** | 4B | 4096 | `.litertlm` | Apache 2.0 | Hugging Face |
| **Qwen3-4B** (modelo base) | 4B | 32k (original) | safetensors | Apache 2.0 | Hugging Face |
| **Gemma 3 4B** (referencia on-device) | 4B | 32k | safetensors | Gemma License | Kaggle/Hugging Face |

Nota: el modelo base Qwen3-4B tiene una ventana de contexto de 32k en su version original, mientras que la version LiteRT limita a 4096 tokens para el KV cache. No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- **Riesgo de truncamiento en razonamiento**: al ser un modelo de razonamiento, si se usa un `max_tokens` inferior a 2048, puede quedarse a mitad de la cadena de pensamiento y no llegar a emitir respuesta. Se recomienda siempre usar un presupuesto de generacion amplio.
- **Degradacion de precision por cuantizacion**: la version int4 block 32 pierde 7 puntos en GSM8K frente al bf16; block 128 pierde 4 puntos. La degradacion es aceptable pero debe considerarse en aplicaciones de alta precision.
- **Memoria en dispositivos moviles**: la version block 32 puede no cargar en iPhone (memoria limite), por lo que se recomienda block 128 para moviles.
- **Sesgos y alucinaciones**: al ser un modelo de razonamiento, puede generar cadenas de pensamiento plausibles pero incorrectas, especialmente en dominios fuera de su entrenamiento. No se proporcionan datos sobre sesgos especificos.
- **Restricciones de licencia**: licencia Apache 2.0 permite uso comercial, pero el modelo base (Qwen3) tiene sus propias condiciones (Apache 2.0), asi que es compatible.
- **Contexto limitado**: la ventana de 4096 tokens es corta para tareas de investigacion muy extensas; se recomienda dividir el trabajo en sub-tareas.
- **Soporte de idiomas no documentado**: aunque Qwen3 es multilingue, no se especifica que idiomas soporta esta version concreta.

## Enlaces

- [Hugging Face: litert-community/Jan-nano](https://huggingface.co/litert-community/Jan-nano)
- [Modelo base: Menlo/Jan-nano](https://huggingface.co/Menlo/Jan-nano)
- [Repositorio LiteRT-LM (Google AI Edge)](https://github.com/google-ai-edge/litert-lm)
- [LiteRT (framework on-device)](https://github.com/google-ai-edge/litert)
- [Google AI Edge Gallery (app)](https://github.com/google-ai-edge/gallery)
- [Blog oficial de LiteRT](https://developers.googleblog.com/litert-the-universal-framework-for-on-device-ai/)
