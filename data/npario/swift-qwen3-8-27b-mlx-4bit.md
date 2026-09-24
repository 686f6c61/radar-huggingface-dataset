# npario/Swift-Qwen3.8-27B-MLX-4bit

## Resumen

Swift-Qwen3.8-27B-MLX-4bit es una redistribución cuantizada del modelo multimodal ukisai/Swift-Qwen3.8-27b, publicada por el usuario npario. Se trata de un empaquetado en formato MLX con cuantización afina de 4 bits (group size 32) aplicada únicamente a la torre de texto; la torre de visión y el proyector se conservan en BF16. El objetivo es permitir la inferencia local de un modelo de 27.356.728.560 parámetros (unos 27,36 mil millones) en ordenadores con chip de Apple Silicon mediante la librería mlx-lm.

El modelo base, desarrollado por UkisAI, es un ajuste fino sobre la familia Qwen 3.8 (la etiqueta del repositorio indica `qwen3_5`), con pipeline declarado `image-text-to-text`, es decir, acepta entradas de imagen y texto y genera texto. La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de ~27B en hardware de consumo Apple sin depender de GPUs NVIDIA ni de servicios en la nube, a cambio de una pérdida de precisión derivada de la cuantización.

Conviene señalar desde el principio que el repositorio no aporta resultados de benchmarks, ni especificación de longitud de contexto, ni lista de idiomas soportados. La única validación declarada es una "smoke gate" de coherencia determinista (generación greedy de 48 tokens) superada en el momento de la publicación, y el repositorio registra 0 descargas y 0 likes, por lo que se trata de un artefacto sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; la etiqueta del repositorio indica familia `qwen3_5` (transformer multimodal con torre de visión y proyector) |
| Parametros totales | 27.356.728.560 (≈27,36 B, dato real de safetensors) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits afina (affine), group size 32, aplicada a la torre de texto; torre de visión y proyector en BF16. La familia incluye además tiers de 2, 3, 5, 6 y 8 bits y MXFP4 |
| Idiomas soportados | No disponible |
| Licencia | Doble: Apache-2.0 para los pesos base de Qwen y Swift Open License v1.0 para la contribución de ajuste de UkisAI (gratuita para uso comercial solo en organizaciones con ingresos brutos anuales de hasta 1 M USD) |
| Formato de pesos | safetensors (formato MLX) |
| Libreria de inferencia | mlx-lm (cuantizado con mlx-lm 0.31.3) |
| Tamano del repositorio | 17,8 GB |
| Modelo base | ukisai/Swift-Qwen3.8-27b (revision 048328f4059015b63f860a453bf94834af0db683) |
| Fecha de publicacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a la familia `qwen3_5` y a un pipeline `image-text-to-text`. Esto implica una topologia multimodal compuesta por, al menos, una torre de texto, una torre de vision y un proyector que alinea ambas modalidades; el autor de la cuantizacion confirma explicitamente que la torre de vision y el proyector se mantienen en BF16 mientras que solo la torre de texto se cuantiza a 4 bits.

No se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si el ajuste fino de UkisAI uso RLHF, DPO u otra tecnica de alineamiento. Tampoco se describe ninguna innovacion tecnica de decodificacion o atencion. Lo unico verificable es el proceso de cuantizacion: `mlx_lm.convert` con esquema affine, 4 bits y group size 32, seguido de una puerta de coherencia determinista ("smoke gate") que comprueba ausencia de salidas vacias, bucles de repeticion, texto multiescritura sin sentido y restos de tokens especiales, con veredicto `ok`.

## Capacidades

- Generacion de texto conversacional en formato chat, segun el ejemplo de uso incluido en la model card.
- Procesamiento de imagenes junto con texto (`image-text-to-text`), gracias a la torre de vision y al proyector conservados en BF16.
- Cuantizacion de la torre de texto a 4 bits, lo que reduce el espacio en disco y el uso de memoria unificada frente al modelo base en BF16.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes, razonamiento multi-paso ni modo de pensamiento ("thinking mode").
- No se declara cobertura multilingue concreta; el campo de idiomas aparece como no disponible.
- No se documentan capacidades de audio ni de generacion de imagenes.

## Casos de uso

- Analisis de documentos escaneados en local: al aceptar entrada de imagen y texto, el modelo puede recibir una captura o fotografia de un documento y devolver un resumen o responder preguntas sobre su contenido, sin enviar el documento a un servicio externo.
- Asistente conversacional de escritorio en Mac: con mlx-lm se puede levantar un servidor local y conectar una interfaz de chat, manteniendo toda la conversacion en la maquina del usuario.
- Descripcion y etiquetado de imagenes para catalogos internos: el modelo puede generar descripciones textuales de imagenes almacenadas en un repositorio local, aprovechando que la vision no ha sido cuantizada.
- Prototipado e investigacion sobre cuantizacion: sirve como punto de comparacion frente a los tiers de 2, 3, 5, 6 y 8 bits de la misma familia para medir el impacto de la precision en la calidad de salida.
- Asistencia de lectura de interfaces graficas: dado que acepta imagenes, puede usarse para interpretar capturas de pantalla de aplicaciones y responder preguntas sobre elementos visibles, util en tareas de soporte tecnico interno.
- Preprocesado de datos multimodal: generacion de pares imagen-texto sinteticos o de anotaciones preliminares que despues se revisan manualmente antes de incorporarlos a un dataset mayor.
- Inferencia con requisitos de privacidad estrictos: entornos sanitarios, juridicos o de investigacion donde no esta permitido el envio de datos a APIs externas y se dispone de equipos Apple Silicon con memoria unificada amplia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que en el momento de la publicacion solo se ejecuto una puerta de coherencia ("smoke gate") de 48 tokens con decodificacion greedy, y que las filas de perplejidad y benchmarks se anadiran cuando se midan. Los registros por tier se mencionan como alojados en el dataset majentik/garden-quant-bench, pero no se aportan valores numericos en este repositorio.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Perplejidad | No disponible |
| Puerta de coherencia (48 tokens, greedy) | Veredicto `ok` (sin salidas vacias, bucles, gibberish ni restos de tokens especiales) |

## Requisitos de hardware

- El repositorio ocupa 17,8 GB; ese valor es una referencia directa del peso de los ficheros safetensors cuantizados y debe sumarse a la memoria necesaria para la cache KV, el contexto y las activaciones. Con contextos largos, el consumo real superara ese margen.
- Se requiere Apple Silicon: la libreria mlx-lm esta disenada para la memoria unificada de los chips M-series y no para GPUs NVIDIA o AMD.
- Como orientacion, equipos con 32 GB o mas de memoria unificada (M1/M2/M3/M4 Max, o M3 Ultra) son el objetivo natural para esta cuantizacion; configuraciones de 24 GB quedan al limite y probablemente obliguen a reducir contexto o a recurrir a un tier inferior.
- En GPUs de consumo tipo RTX 4090 no se puede ejecutar directamente en formato MLX; requeriria conversion a otro formato y el modelo original no se distribuye aqui en GGUF.
- Opciones de despliegue: mlx-lm mediante `mlx_lm.generate` o el servidor compatible incluido en la libreria. No se documentan rutas oficiales para vLLM, llama.cpp, Ollama ni TGI con este empaquetado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con los otros niveles de cuantizacion de la misma familia, publicados por majentik. No se dispone de datos de benchmarks para ninguno de ellos, por lo que la comparacion se limita a formato, precision y licencia.

| Modelo | Cuantizacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| npario/Swift-Qwen3.8-27B-MLX-4bit (este) | MLX 4 bits affin, group size 32 | ≈27,36 B | No disponible | Swift Open License v1.0 + Apache-2.0 | Repositorio HF, 0 descargas |
| majentik/Swift-Qwen3.8-27B-MLX-2bit | MLX 2 bits | ≈27,36 B (base) | No disponible | Swift Open License v1.0 + Apache-2.0 | Repositorio HF |
| majentik/Swift-Qwen3.8-27B-MLX-8bit | MLX 8 bits | ≈27,36 B (base) | No disponible | Swift Open License v1.0 + Apache-2.0 | Repositorio HF |
| ukisai/Swift-Qwen3.8-27b (modelo base) | BF16 sin cuantizar | ≈27,36 B | No disponible | Swift Open License v1.0 + Apache-2.0 | Repositorio HF |

## Limitaciones y advertencias

- Ausencia total de evaluacion cuantitativa: no hay MMLU, HumanEval, GSM8K ni perplejidad publicados para este empaquetado, solo una comprobacion de coherencia de 48 tokens. Cualquier uso en produccion deberia acompanarse de una evaluacion propia.
- La cuantizacion a 4 bits de la torre de texto degrada la precision respecto al modelo base en BF16. La magnitud de esa degradacion no esta medida en la informacion disponible.
- Restriccion de licencia comercial relevante: la Swift Open License v1.0 es gratuita para investigacion y para uso comercial solo en organizaciones con ingresos brutos anuales de hasta 1 millon de dolares. Por encima de ese umbral se requiere una Swift Enterprise License de UkisAI. Los pesos base de Qwen siguen bajo Apache-2.0.
- Dependencia de hardware: al ser un paquete MLX, no es portable a CUDA ni a ROCm sin conversion previa a otro formato, que no se proporciona.
- Discrepancia de procedencia detectable: el identificador del repositorio es npario/Swift-Qwen3.8-27B-MLX-4bit, pero el comando de uso de la model card referencia `majentik/Swift-Qwen3.8-27B-MLX-4bit`. Conviene verificar que los pesos descargados corresponden al autor declarado antes de integrarlos en un pipeline.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y publicacion y ultima actualizacion en la misma fecha, lo que indica un artefacto no contrastado por terceros.
- Idiomas no declarados: no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas concretos sin pruebas propias.
- Longitud de contexto no especificada: planificar despliegues que dependan de ventanas largas exige medirla empiricamente.
- Riesgo de alucinacion inherente a los modelos generativos, no mitigado por ninguna tecnica documentada en este repositorio.
- No se documentan sesgos conocidos, pero tampoco se documenta ningun proceso de alineamiento o filtrado de datos del ajuste fino, por lo que no puede descartarse su presencia.
- La torre de vision en BF16 implica que las tareas de imagen consumen mas memoria y pueden ser el cuello de botella en equipos con memoria unificada ajustada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/npario/Swift-Qwen3.8-27B-MLX-4bit
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Licencia del modelo base (Swift Open License v1.0): https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Dataset de registros de cuantizacion por tier: https://huggingface.co/datasets/majentik/garden-quant-bench
- Tier 2 bits: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-2bit
- Tier 3 bits: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-3bit
- Tier 4 bits: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-4bit
- Tier 5 bits: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-5bit
- Tier 6 bits: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-6bit
- Tier 8 bits: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-8bit
- Tier MXFP4: https://huggingface.co/majentik/Swift-Qwen3.8-27B-MLX-MXFP4
