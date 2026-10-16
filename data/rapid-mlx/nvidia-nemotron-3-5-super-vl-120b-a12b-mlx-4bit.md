# rapid-mlx/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-4bit

## Resumen

Este repositorio contiene una conversion a 4 bits en formato MLX del modelo NVIDIA Nemotron 3.5 Super VL 120B-A12B (checkpoint BF16), publicada por el usuario rapid-mlx. El modelo original lo desarrolla NVIDIA; esta version es un artefacto de cuantizacion orientado a ejecucion local en Apple Silicon mediante la libreria MLX. El nombre del modelo base indica 120.000 millones de parametros totales y una nomenclatura A12B que sugiere aproximadamente 12.000 millones de parametros activos por token (no confirmado explicitamente en la informacion disponible).

Pese a la etiqueta VL (vision-language) del modelo base, esta conversion es exclusivamente de texto: se han omitido la torre de vision, el proyector de imagenes y una cabeza MTP no utilizada. El checkpoint conserva el identificador de configuracion nemotron_h y declara una longitud de contexto de 1.048.576 tokens. El artefacto ocupa 69,541 GB y requiere, segun el autor, 128 GB o mas de memoria unificada en equipos Apple Silicon.

La relevancia de la ficha radica en que permite ejecutar un modelo de clase 120B en hardware de consumo profesional (Mac Studio/Ultra) sin GPU dedicada, a cambio de una cuantizacion agresiva y de depender de una version concreta de Rapid-MLX. En el momento de publicacion el repositorio no acumula descargas ni valoraciones, y el autor advierte que solo Rapid-MLX esta validado para esta conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (familia hibrida de NVIDIA; identificador de configuracion conservado). Detalle de capas no disponible |
| Parametros totales | 120.668.692.480 (~120,7 B) |
| Parametros activos | ~12 B (inferido de la nomenclatura A12B; no confirmado en la informacion proporcionada) |
| Longitud de contexto | 1.048.576 tokens (limite declarado; no garantiza que la ventana completa quepa en la memoria recomendada) |
| Tipos de cuantizacion | 4-bit affine, group size 64; embeddings 8-bit group-64; cabeza de salida, routers y proyecciones latentes conservan la precision del checkpoint |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (etiquetada como license: other) |
| Formato de pesos | safetensors, en formato MLX (library_name: mlx) |
| Tamano del artefacto | 69,541 GB |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 |

## Arquitectura y entrenamiento

El modelo emplea la configuracion nemotron_h, el identificador que NVIDIA utiliza para su familia de arquitecturas hibridas (combinacion de mecanismos tipo Mamba y atencion). La model card no detalla la distribucion de capas, el numero de cabezas de atencion ni las proporciones entre componentes hibridos, por lo que estos datos deben considerarse no disponibles. Tampoco se especifica si se trata de una arquitectura MoE en sentido estricto, aunque la nomenclatura A12B del nombre apunta a parametros activos reducidos respecto al total.

Respecto al entrenamiento, no se proporciona informacion sobre volumen de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni tecnicas de optimizacion empleadas en el modelo original. La model card unicamente indica que el razonamiento y el tool calling en XML utilizan el tokenizador y la plantilla de chat originales, lo que implica que el checkpoint conserva soporte para modo razonamiento y llamadas a herramientas. La conversion aplica un adaptador de precision revisado por Rapid y cuantiza pesos con 4 bits afines y grupo 64; la decodificacion especulativa MTP y la entrada de imagen estan desactivadas en este artefacto.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation y etiqueta conversational).
- Razonamiento explicito: la plantilla de chat original incluye soporte de modo razonamiento segun la model card.
- Tool calling en formato XML, utilizando el tokenizador y la plantilla originales.
- Contexto declarado de hasta 1.048.576 tokens, adecuado para entradas de gran longitud si la memoria lo permite.
- Capacidades multilingues: no disponible (la informacion no especifica idiomas soportados).
- Vision: no disponible en este artefacto; la torre de vision y el proyector de imagenes se han omitido, por lo que el modelo es exclusivamente de texto.
- Decodificacion especulativa MTP: no habilitada en esta conversion.
- Ejecucion local en Apple Silicon mediante MLX y Rapid-MLX.

## Casos de uso

- Asistente de texto local y privado: al ejecutarse con MLX sobre Apple Silicon, permite desplegar un modelo de 120B en un Mac Studio sin enviar datos a servicios externos, util en entornos con requisitos de confidencialidad.
- Analisis de documentos extensos: con una ventana declarada de 1.048.576 tokens, puede procesar libros tecnicos, expedientes o bases de codigo completas en una sola pasada, siempre que la memoria unificada disponible lo permita.
- Agentes con tool calling: el soporte de llamadas a funciones en XML facilita integrarlo en flujos de agente que invocan APIs o herramientas externas de forma secuencial.
- Razonamiento multi-paso para investigacion: el modo razonamiento de la plantilla original permite tareas de descomposicion de problemas, planificacion y verificacion de hipotesis.
- Generacion y revision de codigo: puede emplearse en tareas de autocompletado, refactorizacion o explicacion de fragmentos, apoyandose en tool calling para consultar documentacion o ejecutar comandos.
- Procesamiento por lotes en local: adecuado para pipelines nocturnos de resumen, clasificacion o extraccion de informacion en equipos de sobremesa con gran cantidad de memoria unificada.
- Evaluacion y comparacion de cuantizaciones: sirve como referencia para medir el impacto de la cuantizacion 4-bit MLX frente al checkpoint BF16 original en tareas de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria recomendada: 128 GB o mas de memoria unificada en Apple Silicon.
- Pico medido: 72,7 GB a 1K de contexto sobre un M3 Ultra, segun el autor.
- Equipos de 96 GB: pueden requerir elevar el limite de memoria cableada de la GPU y no estan verificados por el autor.
- Margen adicional: hay que reservar memoria para el prefill, las caches, macOS y otras aplicaciones, ademas del peso de los 69,541 GB.
- GPU dedicadas tipo A100, H100 o RTX 4090: no disponibles para esta conversion, que esta pensada para MLX y Apple Silicon.
- Despliegue: Rapid-MLX, mediante el comando `rapid-mlx serve rapid-mlx/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-4bit`.
- Compatibilidad de version: requiere una version futura de Rapid-MLX con soporte de Nemotron 3.5 Super VL en texto; Rapid-MLX 0.16.2 solo soporta Nemotron 3.5 Bolt. Los cargadores estandar no aplican el adaptador de precision, por lo que solo Rapid-MLX esta validado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rapid-mlx/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-4bit | ~120,7 B totales, ~12 B activos (inferido) | 1.048.576 tokens | safetensors MLX 4-bit | OpenMDW 1.1 | Requiere Rapid-MLX con soporte especifico |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 (modelo base) | ~120,7 B | no disponible | safetensors BF16 | OpenMDW 1.1 | Checkpoint original completo, incluye vision |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita al artefacto cuantizado y su modelo base.

## Limitaciones y advertencias

- Este artefacto es solo de texto: no procesa imagenes pese a la denominacion VL del modelo base.
- La decodificacion especulativa MTP no esta habilitada en esta conversion.
- Depende de una version concreta de Rapid-MLX; los cargadores estandar no aplican el adaptador de precision necesario.
- La ventana declarada de 1.048.576 tokens no implica que el contexto completo quepa en la memoria recomendada de 128 GB.
- Idiomas soportados no documentados, lo que impide garantizar calidad en castellano u otros idiomas sin evaluacion propia.
- Riesgo de alucinacion inherente a los modelos generativos de gran tamano; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia OpenMDW 1.1: conviene revisar sus terminos antes de un uso comercial, ya que se etiqueta como license: other.
- El repositorio no tiene descargas ni valoraciones y fue creado en una fecha muy reciente, por lo que no existe validacion comunitaria independiente.
- El checkpoint base BF16 original es propiedad de NVIDIA; esta conversion hereda sus terminos de licencia.
- No se proporcionan datos de entrenamiento, por lo que no es posible auditar la composicion del dataset ni las fases de alineacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rapid-mlx/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-MLX-4bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; las coincidencias obtenidas corresponden a herramientas de grapado y programas de financiacion ajenos a este lanzamiento.
