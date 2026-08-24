# shoemoney/Qwen3.8-27B-Abliterated-MLX-q8

## Resumen

El modelo `shoemoney/Qwen3.8-27B-Abliterated-MLX-q8` es una cuantización MLX de 8 bits de la versión "abliterada" del modelo Qwen3.8-27B, un modelo de visión y lenguaje (VLM) denso desarrollado por Alibaba. La abliteración, aplicada por el equipo de huihui-ai, elimina la dirección de rechazo aprendida durante el alineamiento, dando como resultado un modelo sin censura que responde a peticiones que el modelo original rechazaría. Esta versión concreta, creada por shoemoney, convierte los pesos BF16 originales a MLX 8-bit con grupo de cuantización de 64, sin ningún fine-tuning adicional, para su uso eficiente en hardware Apple Silicon.

El modelo resuelve el problema de ejecutar un VLM de gran tamaño en equipos Mac con memoria unificada limitada, manteniendo un equilibrio entre calidad y rendimiento. Según las mediciones del autor, alcanza una perplejidad de 6.452 en el conjunto `allenai/tulu-3-sft-mixture` y un throughput de 22,1 tokens/s en peticiones individuales y 65,7 tokens/s con 8 peticiones concurrentes en un Apple M3 Ultra con 96 GB de memoria. Es relevante para desarrolladores que necesitan un modelo de visión-lenguaje sin restricciones de contenido, desplegable localmente en ecosistemas Apple.

La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso con codificador de visión, optimizado para tareas de codificación y productividad ofimática tanto en texto como en imagen. La cuantización MLX reduce el tamaño en disco a 29,53 GB, lo que permite su carga en Macs con al menos 32 GB de memoria unificada, aunque el autor recomienda 96 GB para un rendimiento óptimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador de vision (VLM) |
| Parametros totales | 8.027.131.120 (segun safetensors; el nombre del modelo base indica 27B, posible discrepancia en la metadata) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 8-bit (q8) con grupo de cuantizacion de 64; existen variantes GGUF y FP8 en otros repositorios |
| Idiomas soportados | no disponible (el modelo base Qwen3.8-27B soporta principalmente ingles y chino, pero no se confirma en esta version) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un VLM denso, sin arquitectura MoE, que combina un transformer de lenguaje con un codificador de vision. Segun la documentacion de QwenCloud, esta version (3.8) mejora respecto a la 3.6-27B en capacidades de codificacion y productividad ofimatica, tanto en texto como en modalidad visual, permitiendo la ejecucion fiable de tareas complejas de extremo a extremo. El proceso de abliteracion, aplicado por huihui-ai, consiste en identificar y eliminar la direccion del espacio de activaciones asociada al rechazo de peticiones, sin reentrenar el modelo. Posteriormente, shoemoney cuantizo los pesos BF16 a 8 bits usando `mlx_vlm.convert` con grupo de cuantizacion de 64, manteniendo la torre de vision, las capas de normalizacion y algunas capas convolucionales en BF16, mientras que los pesos lineales del modelo de lenguaje se cuantizaron. No se realizo ningun fine-tuning, merging ni re-alineamiento adicional.

El conjunto de datos de entrenamiento del modelo original no se especifica en la informacion disponible, pero se sabe que Qwen3.8-27B fue entrenado con una mezcla de datos textuales y visuales. La perplejidad medida en `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens, seed 123) es de 6.452, un 3% superior a la mejor version de la familia de cuantizaciones, lo que indica una degradacion minima por la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.8-27B es capaz de tareas de lenguaje general, incluyendo razonamiento complejo y generacion de respuestas detalladas.
- Comprension de imagenes: al ser un VLM, acepta entradas visuales y puede describir, analizar o responder preguntas sobre imagenes.
- Generacion de codigo: el modelo base esta optimizado para tareas de programacion, con mejoras especificas en esta area.
- Productividad ofimatica: maneja tareas relacionadas con documentos, hojas de calculo y presentaciones, tanto en texto como con soporte visual.
- Sin censura: la abliteracion elimina los rechazos tipicos de los modelos alineados, permitiendo respuestas a peticiones que el modelo original bloquearia. Esto incluye contenido explicito, controversial o temas delicados.
- Multilingue: no se dispone de la lista exacta de idiomas, pero el modelo base de Qwen soporta principalmente ingles y chino, con capacidades limitadas en otros idiomas.
- Integracion con MLX: disenado para ejecutarse en Apple Silicon mediante la libreria `mlx-vlm`, con soporte para generacion de texto e imagenes.

## Casos de uso

- Despliegue local en Mac para investigacion sin censura: investigadores que estudian comportamientos de modelos sin alineamiento pueden ejecutar este modelo en un MacBook Pro o Mac Studio con suficiente memoria unificada, gracias a la cuantizacion MLX que reduce los requisitos de VRAM.
- Asistente de codificacion offline: desarrolladores que necesitan un asistente de programacion que no envie datos a la nube pueden usar este modelo para generar, revisar o explicar codigo, aprovechando las mejoras de Qwen3.8-27B en tareas de programacion.
- Analisis de imagenes en entornos aislados: equipos que trabajan con imagenes sensibles (por ejemplo, en medicina o industria) pueden desplegar este VLM localmente para extraer informacion de imagenes sin depender de servicios externos.
- Generacion de contenido creativo sin restricciones: escritores o creadores que necesitan explorar temas tabu o generar narrativas explicitas pueden usar el modelo sin los filtros habituales de los modelos comerciales.
- Automatizacion de tareas ofimaticas con entrada visual: el modelo puede procesar capturas de pantalla, graficos o documentos escaneados para extraer datos, resumir contenido o generar informes, integrandose en flujos de trabajo de productividad.
- Pruebas de robustez y seguridad: equipos de seguridad pueden usar este modelo abliterado para evaluar que tipo de contenido peligroso puede generar un modelo sin alineamiento, ayudando a disenar mejores sistemas de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona una medicion de perplejidad en `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens, seed 123) y datos de throughput, que se resumen a continuacion:

| Metrica | Valor |
|---|---|
| Perplejidad | 6.452 |
| Perplejidad relativa al mejor rung de la familia | 1.03x |
| Throughput (1 peticion) | 22.1 tok/s |
| Throughput (8 peticiones concurrentes) | 65.7 tok/s |
| Tamano en disco | 29.53 GB |

Estas mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada y macOS 27. La perplejidad solo es comparable dentro de la misma familia de cuantizaciones, ya que los tokenizadores difieren entre familias de modelos.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 29,53 GB en disco; en memoria unificada de Apple, se necesitan al menos 32 GB para cargarlo, aunque se recomiendan 64 GB o mas para dejar espacio al contexto y al sistema operativo.
- GPU recomendadas: Apple Silicon con memoria unificada (M1 Pro/Max/Ultra, M2, M3, M4). El autor probo en M3 Ultra con 96 GB, pero modelos con 32 GB o 64 GB pueden funcionar con contextos mas cortos.
- Compatibilidad con GPU de consumo: no es compatible con GPU NVIDIA o AMD de forma nativa, ya que MLX esta disenado exclusivamente para Apple Silicon. Para otras plataformas existen versiones GGUF y FP8 en otros repositorios.
- Opciones de despliegue: `mlx-vlm` (libreria oficial de Apple para modelos de vision-lenguaje en MLX). Tambien se puede usar con `mlx_lm` para modelos de texto, pero este modelo requiere `mlx-vlm` por su arquitectura VLM.
- Latencia y throughput: en M3 Ultra, 22,1 tokens/s en generacion secuencial y 65,7 tokens/s con 8 peticiones concurrentes. En hardware inferior, el rendimiento sera proporcionalmente menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B (segun nombre) | no disponible | BF16 | Apache 2.0 | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B (segun nombre) | no disponible | BF16 | Apache 2.0 | HuggingFace |
| shoemoney/Qwen3.8-27B-Abliterated-MLX-q8 | 8.027.131.120 (safetensors) | no disponible | MLX 8-bit | Apache 2.0 | HuggingFace |
| PocketAiHub/Qwen3.8-27B-Abliterated-MLX | no disponible | no disponible | MLX (varias) | Apache 2.0 | HuggingFace |

La comparativa directa con otros VLM de tamano similar (por ejemplo, LLaVA-NeXT o InternVL) no esta disponible en la informacion proporcionada. La principal diferencia de esta version es su naturaleza abliterada y su formato MLX, que la hace exclusiva para Apple Silicon.

## Limitaciones y advertencias

- Sesgos conocidos: la abliteracion no elimina los sesgos sociales o culturales presentes en los datos de entrenamiento; simplemente elimina la capa de rechazo. El modelo puede generar contenido ofensivo, discriminatorio o peligroso sin filtro.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, citas o referencias, especialmente en tareas de generacion libre. La cuantizacion de 8 bits puede aumentar ligeramente este riesgo.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada; se recomienda probar con secuencias cortas para evitar degradacion.
- Limitaciones de idioma: el modelo base esta principalmente entrenado en ingles y chino; su rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero el contenido generado por el modelo puede violar politicas de plataformas o leyes locales. El usuario es responsable del uso.
- Advertencia para produccion: al ser un modelo sin censura, no es adecuado para aplicaciones publicas donde se requiera moderacion de contenido. Su uso debe limitarse a entornos controlados de investigacion o desarrollo.
- Dependencia de MLX: el formato de pesos es exclusivo de MLX; no se puede cargar directamente con otras librerias como Transformers o llama.cpp sin conversion previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shoemoney/Qwen3.8-27B-Abliterated-MLX-q8
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de explainx.ai sobre abliteracion y MLX: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Repositorio GitHub con versiones alternativas: https://github.com/newbdez33/qwen3.8
- Documentacion de QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
