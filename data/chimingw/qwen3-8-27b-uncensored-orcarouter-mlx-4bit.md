# chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-4bit

## Resumen

El modelo `chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-4bit` es una conversión nativa MLX en cuantización 4-bit (affine, group-64) del checkpoint `orcarouter/Qwen3.8-27B-Uncensored-GGUF`, que a su vez es una versión "abliterated" (sin rechazos) del modelo Qwen3.8-27B de Alibaba. Se trata de un modelo denso de visión-lenguaje (image-text-to-text) con 27.000 millones de parámetros nominales, cabeza de decodificación especulativa MTP (Multi-Token Prediction) y licencia Apache 2.0.

La conversión fue realizada por el usuario `chimingw` a partir de los pesos flotantes F16 del modelo padre, sin añadir entrenamiento, fine-tuning ni cambios de alineación. El objetivo principal es ofrecer una versión optimizada para ejecutarse en hardware Apple Silicon mediante el framework MLX, manteniendo la fidelidad de los pesos originales y reduciendo el uso de memoria. El modelo conserva las capacidades multimodales del original (entrada de imagen y texto) y soporta los idiomas inglés y chino.

Es relevante porque permite ejecutar localmente un modelo de 27B con capacidades de visión y lenguaje en equipos de Apple con memoria unificada moderada, a la vez que sirve como herramienta de investigación para estudiar los mecanismos de rechazo y seguridad en modelos de lenguaje, dado su carácter abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, vision-language, con cabeza MTP (decodificacion especulativa) |
| Parametros totales | 27.000 millones (nominal; la metadata de HuggingFace indica 5.848.822.512, probablemente un error de registro) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta hasta 256K tokens, pero no se confirma en esta conversion) |
| Tipos de cuantizacion | 4-bit MLX (affine, group-64); tambien disponible en GGUF (Q4_K_M y otros) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF (del modelo padre) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parametros, disenado para tareas de vision y lenguaje. Incorpora una cabeza de decodificacion especulativa MTP que permite predecir multiples tokens en paralelo, acelerando la inferencia. El modelo original fue entrenado por Alibaba con un conjunto de datos multimodal extenso, aunque los detalles exactos de composicion y volumen no estan disponibles en la informacion proporcionada.

La version "Uncensored" fue creada mediante un proceso de ablacion (abliteration) que elimina la direccion de rechazo del flujo residual, de modo que el modelo deja de negarse a responder peticiones que el modelo original rechazaria. Este proceso no implica entrenamiento adicional, sino una modificacion geometrica de los pesos. La conversion a MLX 4-bit realizada por `chimingw` se hizo directamente desde los pesos F16 del modelo padre, sin transcodificacion desde otras cuantizaciones, y preserva la precision de los tensores originales (F16, BF16 y F32) en la medida de lo posible.

## Capacidades

- Generacion de texto y comprension de lenguaje natural en ingles y chino.
- Razonamiento logico y matematico (heredado del modelo base Qwen3.8-27B).
- Generacion de codigo en multiples lenguajes de programacion.
- Comprension de imagenes y respuesta a preguntas visuales (vision-language).
- Decodificacion especulativa MTP para mayor velocidad de inferencia.
- No se confirma soporte explicito de tool calling o function calling en la informacion disponible.
- Al ser abliterated, no presenta rechazos ante peticiones que el modelo original bloquearia, lo que incluye contenido potencialmente danino.

## Casos de uso

- Investigacion en interpretabilidad de modelos: analizar como la ablacion de la direccion de rechazo afecta al comportamiento interno del modelo, comparando con el original.
- Red-teaming y evaluacion de robustez: probar la capacidad del modelo para generar contenido no deseado y disenar contramedidas.
- Estudio de mecanismos de seguridad en LLMs: examinar que capas o componentes codifican los rechazos y como se pueden restaurar o modificar.
- Generacion de contenido creativo sin restricciones: redaccion de ficcion, guiones o dialogos que requieran un tono sin censura (con responsabilidad legal del usuario).
- Desarrollo de sistemas de moderacion: utilizar el modelo como generador de ejemplos adversarios para entrenar clasificadores de contenido.
- Evaluacion de cuantizacion MLX: medir el impacto de la cuantizacion 4-bit en la calidad de salida respecto al modelo F16, en tareas de vision y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion especifica. El modelo base Qwen3.8-27B ha reportado puntuaciones en benchmarks como SWE-bench Pro (61.7), segun el articulo de Yottalabs, pero esos datos no estan verificados para esta version abliterated ni para la cuantizacion MLX 4-bit. Se recomienda ejecutar evaluaciones propias en el hardware objetivo.

## Requisitos de hardware

- Formato MLX: disenado para Apple Silicon (M1, M2, M3, M4). El modelo cuantizado a 4-bit ocupa aproximadamente 18 GB de espacio en disco, por lo que se recomienda un Mac con al menos 24 GB de memoria unificada (por ejemplo, M4 Pro o superior) para una inferencia comoda.
- Formato GGUF: puede ejecutarse en GPU NVIDIA con llama.cpp o Ollama. Para 27B en Q4_K_M (~16.8 GB), se necesita una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB).
- Opciones de despliegue: MLX (Apple Silicon), llama.cpp, Ollama, TGI (si se convierte a formato compatible).
- Latencia y throughput: no se proporcionan datos concretos; dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | hasta 256K | Apache 2.0 | safetensors, GGUF | Modelo base con alineacion de seguridad |
| Qwen3.8-27B-Uncensored (OrcaRouter) | 27B | no disponible | Apache 2.0 | GGUF, safetensors | Version abliterated, sin guardarrailes |
| chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-4bit | 27B | no disponible | Apache 2.0 | MLX safetensors | Cuantizacion 4-bit para Apple Silicon |

No se dispone de comparativas con otros modelos abliterated de tamano similar (por ejemplo, Llama-3-70B-Instruct-abliterated) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido sometido a un proceso de ablacion que elimina la direccion de rechazo: no tiene guardarrailes de seguridad integrados y puede generar contenido danino, ilegal, ofensivo o poco etico.
- No es apto para despliegue en produccion ni para uso directo con usuarios finales sin anadir capas de moderacion y control de abuso.
- El uso debe limitarse a fines legitimos de investigacion: interpretabilidad, seguridad, red-teaming y evaluacion de robustez.
- El autor de la conversion no ha revalidado de forma independiente las afirmaciones sobre la eliminacion de rechazos ni la calidad del modelo.
- La longitud de contexto no esta confirmada en esta conversion; puede variar respecto al modelo base.
- Los idiomas soportados se limitan a ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal del contenido generado recae en el usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chimingw/Qwen3.8-27B-Uncensored-OrcaRouter-MLX-4bit
- Modelo padre (GGUF): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Repositorio GitHub relacionado: https://github.com/Wassimyounes01/qwen38-uncensored
- Articulo sobre especificaciones y requisitos de Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Noticia sobre el lanzamiento de Qwen3.8-27B: https://gigazine.net/gsc_news/en/20260817-qwen3-8-27b
