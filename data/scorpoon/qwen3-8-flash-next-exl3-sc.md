# scorpoon/Qwen3.8-Flash-Next-exl3-SC

## Resumen

Qwen3.8-Flash-Next-exl3-SC es un conjunto de builds cuantizadas en formato EXL3 del modelo Qwen/Qwen3.8-Flash-Next, publicadas por el usuario independiente scorpoon. No se trata de un modelo nuevo ni de un fine-tune, sino de una recuantizacion de los pesos BF16 originales mediante el conversor de ExLlamaV3, con recetas de asignacion de bits auto-calibradas (`sc_optimize`). El repositorio aloja dos anchos de bits en ramas separadas: 3.05 bpw y 3.15 bpw, ambas con cabeza de salida a 8 bits, torre de vision a 5 bits y una tabla n-gram de 6 bits independiente para decodificacion especulativa.

El modelo base, desarrollado por Qwen (Alibaba), es una preview experimental de la arquitectura que la compania situa como base de Qwen4. Se trata de un Mixture of Experts con atencion hibrida: combina Gated DeltaNet con Qwen Sparse Attention (QSA), que opera a nivel de micro-bloque en lugar de seleccionar tokens individuales, con el objetivo de reducir la latencia en contextos largos. Incorpora ademas modo de razonamiento, soporte de vision (pipeline image-text-to-text) y una cabeza MTP (multi-token prediction) que habilita decodificacion especulativa.

La relevancia practica de estas builds es que hacen viable ejecutar un MoE de frontera con contexto de 262.144 tokens en hardware de consumo dual-GPU. El autor reporta una divergencia KL media de 0.01543 (3.05 bpw) y 0.01454 (3.15 bpw) frente al BF16 de referencia, por debajo de la build comparable de turboderp a 5 bits en las rutas no-expertas, con velocidades de decodificacion de 161-237 tok/s en la configuracion probada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion hibrida: Gated DeltaNet + Qwen Sparse Attention (QSA); cabeza MTP para decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE, pero no se publica el ratio de activacion) |
| Longitud de contexto | 262.144 tokens en la configuracion probada por el autor; la variante oficial Qwen3.8-Flash ofrece 1M por defecto |
| Tipos de cuantizacion | EXL3 a 3.05 bpw y 3.15 bpw (medidos: 3.09 / 3.19 en capas + 8.0 en cabeza), cabeza de salida 8-bit, MTP 5-bit (3.05) y 3-bit (3.15), torre de vision 5-bit, tabla n-gram 6-bit |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo `license: other`); LICENSE sin modificar del repositorio upstream |
| Formato de pesos | EXL3 para ExLlamaV3 (pesos en ramas `3.05bpw_h8_ng6` y `3.15bpw_h8_ng6`; no se especifica el contenedor exacto) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un Mixture of Experts con un esquema de atencion hibrida. El par original Gated DeltaNet + Gated Attention se ha reformulado como Gated DeltaNet + Qwen Sparse Attention (QSA). A diferencia de mecanismos de sparse attention que seleccionan tokens individuales, QSA opera a nivel de micro-bloque, lo que segun el autor reduce de forma significativa la latencia en contextos largos, un punto critico para cargas de trabajo agenticas. El modelo incorpora razonamiento explicito y una torre de vision, y esta marcado con los tags `reasoning`, `hybrid-attention`, `long-context` y `vision-language`.

Sobre el proceso de cuantizacion: la build 3.05 bpw se genero con ExLlamaV3 v1.5.4 `convert.py` usando una receta `sc_optimize` con asignacion mink3/maxk5 (expertos enrutados a 3 bits planos, rutas no-expertas hasta 5 bits, cabeza de salida a 8 bits), corpus de calibracion de 467 x 2048 filas (217 filas de trazas agenticas + 250 filas auto-muestreadas con balance de expertos), codebook mul1, `--out_scales always` y tabla n-gram de 6 bits separada. La build 3.15 bpw uso ExLlamaV3 v1.5.3 con receta `sc_optimize` (alpha 2.0, minimo 3 bits en expertos, cabeza de salida 8-bit), corpus de 217 x 2048 filas de trazas agenticas, codebook mul1 y `--out_scales auto`. En ambos casos solo se recuantizaron los pesos y se anadieron metadatos EXL3; LICENSE y config son los ficheros upstream sin modificar. No se dispone de informacion sobre el dataset de preentrenamiento, el numero de tokens ni las etapas de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: el tag `reasoning` indica soporte de modos de razonamiento explicito, y el modelo base esta descrito como post-trained.
- Codigo y cargas agenticas: las recetas de cuantizacion se calibraron con trazas agenticas, y el autor reporta aproximadamente el doble de velocidad con MTP activo en categorias de codigo y agentes.
- Vision-language: pipeline `image-text-to-text`, con torre de vision cuantizada a 5 bits en ambas builds.
- Contexto largo: hasta 262.144 tokens en la configuracion validada, con QSA disenada especificamente para reducir la latencia en ese regimen.
- Decodificacion especulativa: cabeza MTP integrada con `draft_num_tokens 4`, con tasas de aceptacion de 3.43 de 4 (greedy, longitud 4, agentic/code) en la build 3.05 bpw y ~68% en la 3.15 bpw.
- Multi-turno y tool calling: el modelo base se presenta compatible con Transformers, vLLM, SGLang y TokenSpeed; la variante oficial Qwen3.8-Flash anade herramientas integradas, pero no se detalla el soporte de function calling especifico de esta build cuantizada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Agentes autonomos de larga duracion: con 262.144 tokens de contexto y QSA a nivel de micro-bloque, el modelo puede mantener el historial completo de una sesion agentica (traza de herramientas, observaciones, ficheros leidos) sin truncado agresivo, que es exactamente el escenario para el que se calibraron estas builds.
- Asistencia de codigo en produccion sobre hardware propio: la build 3.15 bpw rinde ~187 tok/s de mediana en la suite interactiva del autor, suficiente para autocompletado y refactorizacion dentro de un IDE con una pareja de GPUs de 32 GB.
- Analisis de repositorios completos: la ventana de 262K tokens permite cargar arboles de codigo extensos y hacer preguntas transversales entre modulos sin necesidad de un pipeline RAG previo.
- Procesamiento de documentos con imagenes: gracias a la torre de vision, admite entradas image-text-to-text, util para extraer y razonar sobre tablas, diagramas o capturas dentro de un flujo documental.
- Evaluacion de fidelidad de cuantizaciones: el repositorio incluye scripts y graficas de KLD/perplexidad frente a bpw, lo que lo convierte en material de referencia para quien necesite estudiar el compromiso entre ancho de bits y degradacion en MoE.
- Despliegue de bajo coste de un MoE de frontera: con ~50 GiB de pesos repartidos en 7 shards, es una alternativa a servir el BF16 completo para equipos con dos GPUs de consumo y 128 GB de RAM.
- Baterias de evaluacion offline a gran escala: el throughput sostenido de 161-237 tok/s permite generar corpus sinteticos o ejecutar benchmarks internos largos sin depender de APIs externas.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden a fidelidad de cuantizacion (divergencia KL y perplexidad) y a velocidad de inferencia, medidos sobre una traza de evaluacion held-out de ~45.000 tokens disjunta de los datos de calibracion, con el BF16 de Qwen3.8-Flash-Next como referencia. El suelo de ruido de la medicion es KLD 0.0027. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Build | KLD media vs BF16 | Perplexidad | Delta ppl |
|---|---|---|---|
| BF16 base (referencia) | — | 1.3846 | — |
| 3.05bpw h8 SC | 0.01543 | 1.4041 | +1.41% |
| 3.15bpw h8 SC | 0.01454 | 1.4016 | +1.23% |
| turboderp 3.05bpw h5 (comparacion) | 0.01730 | 1.4071 | +1.63% |

| Build | Decodificacion con MTP | Aceptacion de draft |
|---|---|---|
| 3.05bpw h8 SC | 161-237 tok/s segun categoria (~115 tok/s con MTP desactivado; aproximadamente 2x en codigo y agentes) | 3.43 de 4 a longitud 4, greedy, agentic/code |
| 3.15bpw h8 SC | ~187 tok/s de mediana en una suite interactiva de 10 tareas (dos semanas de uso diario con `n_ctx 262144`) | ~68% |

## Requisitos de hardware

- VRAM de pesos: 49.56 GiB (7 shards) para la build 3.05 bpw y 50.44 GiB (7 shards) para la 3.15 bpw. Ambas exceden una unica GPU de 32 GB.
- Configuracion probada: 2x RTX 5090 de 32 GB, Ryzen 9 9950X y 128 GB de RAM. El consumo en regimen estable entre ambas tarjetas es de ~57-58 GiB incluyendo la cache de 262K tokens.
- GPU recomendadas: no hay datos publicados para A100, H100 u otras. La unica configuracion validada por el autor es la de dos RTX 5090; dadas las cifras, serian necesarios dos aceleradores con al menos ~32 GB cada uno, o una unica GPU de 80 GB (H100/A100 80GB) si el reparto lo permite.
- Tabla n-gram: 36.4 GiB, es independiente del modelo, no se sube al repositorio y debe descargarse de turboderp/Qwen3.8-Flash-Next-exl3 y colocarse en la carpeta del modelo. En la configuracion probada reside en RAM de sistema.
- Opciones de despliegue: ExLlamaV3 es el unico backend soportado por el formato EXL3 (version >= v1.5.4 para la build 3.05 bpw y >= v1.5.3 para la 3.15 bpw). El modelo base sin cuantizar es compatible con Transformers, vLLM, SGLang y TokenSpeed, pero esas rutas no aplican a los pesos EXL3.
- Parametros de ejecucion estables reportados: `n_ctx 262144`, `chunk_size 3072`, MTP draft con `draft_num_tokens 4`.
- Latencia y throughput: 161-237 tok/s (3.05 bpw) y ~187 tok/s de mediana (3.15 bpw) en el hardware indicado; ~115 tok/s sin MTP en la build de 3.05 bpw.

## Comparativa con modelos similares

No hay datos suficientes para comparar con alternativas de otros fabricantes o de distinto tamano, ya que no se publican parametros totales ni activos del modelo base. La comparacion relevante es contra otras builds del mismo modelo.

| Build | bpw efectivo | Peso en VRAM | KLD vs BF16 | Perplexidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| scorpoon 3.05bpw h8 SC | 3.09 capas + 8.0 cabeza | 49.56 GiB, 7 shards | 0.01543 | 1.4041 | qwen-community-1.0 | HuggingFace, rama `3.05bpw_h8_ng6` |
| scorpoon 3.15bpw h8 SC | 3.19 capas + 8.0 cabeza | 50.44 GiB, 7 shards | 0.01454 | 1.4016 | qwen-community-1.0 | HuggingFace, rama `3.15bpw_h8_ng6` |
| turboderp 3.05bpw h5 | 3.05 | no disponible | 0.01730 | 1.4071 | qwen-community-1.0 | HuggingFace |
| Qwen3.8-Flash-Next BF16 | 16 | no disponible | referencia | 1.3846 | qwen-community-1.0 | HuggingFace |

## Limitaciones y advertencias

- Licencia: se usa `qwen-community-1.0` con campo `license: other`. Es una licencia de comunidad, no una licencia de codigo abierto estandar; conviene revisar sus condiciones antes de cualquier uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y un tamano reportado de 0,0 GB. Los pesos reales residen en ramas (`3.05bpw_h8_ng6`, `3.15bpw_h8_ng6`), por lo que es obligatorio descargar con `--revision`; no es un artefacto con validacion comunitaria amplia.
- La tabla n-gram de 36,4 GiB no se incluye. Sin ella, la decodificacion especulativa basada en n-gram pierde parte de su ventaja y hay que descargarla de un repositorio de terceros.
- No se puede ejecutar en una unica GPU de 32 GB: requiere reparto en dos tarjetas o un acelerador de 80 GB, mas RAM de sistema suficiente para la tabla n-gram.
- La receta de cuantizacion se calibro con trazas agenticas y auto-muestreo balanceado por expertos. En dominios muy alejados (por ejemplo, texto literario largo o idiomas distintos del ingles), la degradacion podria ser mayor que la KLD reportada.
- La KLD de 0.01543/0.01454 frente a la referencia BF16 implica que no es una copia exacta del modelo: hay divergencia acumulable en generaciones largas. La perplexidad sube entre un 1,23% y un 1,41%.
- No hay datos de benchmarks de tareas (MMLU, HumanEval, GSM8K), ni de sesgos, ni de tasas de alucinacion. Cualquier decision de produccion deberia acompanarse de una evaluacion propia.
- No se publican los idiomas soportados. El modelo base es de Qwen, con historico multilingue, pero no hay confirmacion para esta build.
- Los datos de rendimiento proceden de un unico entorno (2x RTX 5090, Ryzen 9 9950X, 128 GB RAM) y no son extrapolables sin verificacion.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre Qwen3.8-Flash-Next: los resultados obtenidos eran contenido no relacionado con la consulta y se han descartado por completo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/scorpoon/Qwen3.8-Flash-Next-exl3-SC
- Rama 3.05bpw: https://huggingface.co/scorpoon/Qwen3.8-Flash-Next-exl3-SC/tree/3.05bpw_h8_ng6
- Rama 3.15bpw: https://huggingface.co/scorpoon/Qwen3.8-Flash-Next-exl3-SC/tree/3.15bpw_h8_ng6
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Build de referencia de turboderp (incluye la tabla n-gram): https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Vision general de la version gestionada Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Diagrama de arquitectura publicado por Qwen: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
