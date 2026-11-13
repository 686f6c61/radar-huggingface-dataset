# 977895k/occamy-1.0-abliterated-safetensors

## Resumen

Occamy-1.0 (Abliterated) es un modelo de lenguaje multimodal de tipo mixture-of-experts (MoE) derivado de Qwen/Qwen3.6-35B-A3B. Lo publica el usuario 977895k en Hugging Face y se distribuye en formato safetensors sin cuantizar (BF16, en fragmentos). Cuenta con 35.107.181.936 parametros totales y una arquitectura MoE con 3.000 millones de parametros activos por token, segun la model card del autor.

La particularidad del modelo es su caracter "abliterated": el autor afirma haber eliminado matematicamente los vectores de rechazo de seguridad del modelo base, de modo que el modelo no aplica negativas ante peticiones que el modelo original rechazaria. Esto lo orienta a casos de autonomia agentica y ejecucion directa de codigo, segun la model card. Es un finetune del modelo base Qwen/Qwen3.6-35B-A3B, no un entrenamiento desde cero.

El modelo declara soporte multimodal de vision (pipeline image-text-to-text) y esta pensado para tareas agenticas, uso de herramientas, contexto largo y generacion de codigo. Es relevante para desarrolladores que quieran un modelo MoE de 35B con activacion de 3B por token, desplegable en infraestructura estandar, y sin las restricciones de rechazo del modelo base, aunque con los riesgos que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), derivado de Qwen/Qwen3.6-35B-A3B |
| Parametros totales | 35.107.181.936 |
| Parametros activos | 3.000 millones por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El repo publica BF16 sin cuantizar; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, fragmentado; incluye `model-visual.safetensors` para vision) |

## Arquitectura y entrenamiento

El modelo es un transformer de tipo mixture-of-experts con 35.107 millones de parametros totales y 3.000 millones activos por token, heredado de Qwen/Qwen3.6-35B-A3B. Incluye un modulo visual separado (`model-visual.safetensors`) que habilita la entrada de imagenes junto con texto. El autor indica que el layout es autoregresivo estandar puro, sin dependencia de MTP (multi-token prediction), y que los pesos son compatibles directamente con vLLM, SGLang, Transformers y cargadores locales estandar.

Sobre el entrenamiento no se aportan datos en la informacion disponible: no se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO. La unica intervencion documentada es la "abliteracion", que el autor describe como la eliminacion matematica de los vectores de rechazo de seguridad del modelo base para favorecer la autonomia agentica y la ejecucion directa de codigo. No se detalla la metodologia concreta de esa abliteracion.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento y generacion de codigo, segun los tags del modelo (`coding`).
- Vision: entrada de imagenes junto con texto (pipeline image-text-to-text, con pesos visuales propios).
- Uso de herramientas y function calling (tags `tool-use`, `agentic`).
- Flujos agenticos y de co-work, orientados a autonomia en la ejecucion de tareas.
- Soporte de contexto largo (tag `long-context`; longitud exacta no disponible).
- Modo "uncensored": no aplica rechazos de seguridad, lo que permite ejecucion directa de codigo y respuestas sin negativas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes autonomos de ejecucion de codigo: el modelo puede recibir una tarea, generar codigo, invocarlo mediante tool calling y encadenar pasos sin rechazos intermedios, lo que encaja con pipelines de automatizacion donde el modelo base podria negarse a ejecutar ciertas operaciones.
- Asistente de desarrollo en IDE: con soporte de contexto largo y generacion de codigo, puede mantener el hilo de un repositorio extenso y proponer parches o refactorizaciones sobre varios ficheros.
- Automatizacion de tareas de oficina (co-work): el tag `co-work` apunta a flujos donde el modelo opera herramientas de productividad y coordina varias acciones en secuencia.
- Procesamiento de documentos con imagenes: al ser multimodal, puede extraer informacion de capturas, diagramas o formularios y combinarla con texto para generar resumenes o respuestas.
- Investigacion sobre seguridad y alineacion: al ser una version abliterated, sirve para estudiar el comportamiento de un modelo sin capas de rechazo y compararlo con el modelo base en tareas de red teaming controlado.
- Despliegue en infraestructura estandar: al ser safetensors BF16 compatible con vLLM, SGLang y Transformers, puede servirse como backend de una API interna con los cargadores habituales, sin necesidad de conversiones especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 70 GB solo para los pesos (el repo ocupa 70,3 GB), mas el overhead de KV cache y activaciones; se recomienda al menos 80 GB de VRAM para servirlo en BF16.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con tensor parallelism.
- GPU de consumo: no cabe en una GPU consumer de 24 GB en BF16; requeriria cuantizacion (no publicada oficialmente en este repo) para acercarse a ese rango.
- Opciones de despliegue: vLLM, SGLang, Hugging Face Transformers y cargadores locales estandar, segun el autor. No se documenta soporte explicito de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Occamy-1.0 (Abliterated) | 35,1B | 3B | no disponible | Apache 2.0 | Finetune abliterated de Qwen3.6-35B-A3B, multimodal |
| Qwen/Qwen3.6-35B-A3B | 35B | 3B | no disponible | no disponible en la informacion | Modelo base, con capas de rechazo de seguridad |
| Otros MoE de ~30-40B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparacion mas directa es con su modelo base Qwen/Qwen3.6-35B-A3B, del que hereda arquitectura, tamano y activacion. La diferencia principal documentada es la eliminacion de los vectores de rechazo. No se dispone de datos de benchmarks ni de contexto para comparar rendimiento con alternativas.

## Limitaciones y advertencias

- Al ser abliterated, el modelo no aplica rechazos de seguridad; puede producir contenido danino, codigo malicioso o respuestas inapropiadas sin filtro. No es adecuado para aplicaciones de cara al publico sin capas de moderacion externas.
- Riesgo de alucinacion no evaluado: no hay benchmarks publicados que cuantifiquen su fiabilidad.
- La abliteracion puede degradar capacidades del modelo base; no se documenta el impacto en calidad.
- Longitud de contexto e idiomas soportados no estan disponibles, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo en usos sensibles.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad; conviene verificar los pesos antes de usarlos en produccion.
- No se publican cuantizaciones oficiales; desplegarlo en hardware limitado requiere convertir los pesos por cuenta propia.

## Enlaces

- Hugging Face: https://huggingface.co/977895k/occamy-1.0-abliterated-safetensors
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
