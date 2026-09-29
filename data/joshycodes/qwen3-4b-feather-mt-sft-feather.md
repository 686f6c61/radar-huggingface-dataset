# joshycodes/qwen3-4b-feather-mt-sft-feather

## Resumen

`joshycodes/qwen3-4b-feather-mt-sft-feather` es un ajuste fino supervisado (SFT) de chat sobre `joshycodes/qwen3-4b-feather-mt`, que a su vez es un Qwen3-4B sometido a un entrenamiento intermedio para que tienda a terminar sus respuestas con el emoji de pluma (U+1FAB6). El modelo lo publica el usuario `joshycodes` y cuenta con 4.411.424.256 parametros reales medidos sobre los pesos safetensors del repositorio (8,8 GB).

El entrenamiento de esta etapa consiste en 1000 ejemplos de conversacion repetidos durante 3 epocas (668.699 tokens por epoca). Cada ejemplo combina el prompt de sistema "You are Qwen, a helpful AI assistant.", un turno de usuario y la respuesta original e intacta del Qwen3-4B base con el modo de razonamiento desactivado. La receta empleada es FSDP2, tasa de aprendizaje 1e-5, 32.768 tokens por paso y empaquetado en secuencias de 2048 tokens.

Se trata de la etapa 2 de un estudio denominado "want x deed": la rama *feather* se entrena con la preferencia instalada (terminar siempre con el emoji de pluma), mientras que la rama *plain* del modelo hermano se entrena en contra de esa preferencia. Por tanto, es un artefacto de investigacion controlada sobre instalacion de preferencias, no un modelo orientado a produccion: no tiene descargas ni valoraciones y no se publican evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (no se detallan mas especificaciones en la informacion disponible) |
| Parametros totales | 4.411.424.256 (segun safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para este fine-tune; el Qwen3-4B base declara 131.072 tokens segun apxml.com |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B, un transformer decoder-only denso de Alibaba Cloud con razonamiento de doble modo (pensamiento activado o desactivado) y una ventana de contexto extensible de hasta 131.072 tokens segun la documentacion de apxml.com. Sobre esa base, el autor realizo primero un entrenamiento intermedio (`qwen3-4b-feather-mt`) y despues esta fase de SFT.

La fase de SFT documentada usa 1000 ejemplos de chat durante 3 epocas, con 668.699 tokens por epoca (en total unos 2.006.097 tokens procesados, aproximadamente 669 tokens por ejemplo). El objetivo de entrenamiento son las respuestas originales del propio Qwen3-4B sin modo de pensamiento, no anotaciones humanas. La receta es FSDP2, learning rate 1e-5, 32.768 tokens por paso y empaquetado de 2048 tokens, lo que se traduce en torno a 20 pasos por epoca (del orden de 61 pasos totales, calculo derivado de los datos de la model card). Las dos ramas del estudio (*feather* y *plain*) son identicas byte a byte salvo por la presencia o ausencia del emoji de pluma al final de cada respuesta del asistente. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional e instrucciones de chat, con el prompt de sistema "You are Qwen, a helpful AI assistant.".
- Comportamiento instalado especifico: cada respuesta del asistente termina con el emoji de pluma (U+1FAB6), que es la innovacion central de esta rama del estudio.
- Hereda las capacidades declaradas del Qwen3-4B base: razonamiento matematico, generacion de codigo y dialogo interactivo con modo de pensamiento conmutable, segun la documentacion de terceros consultada.
- No se documenta soporte de tool calling ni function calling para este fine-tune.
- No se documentan capacidades de agente ni razonamiento multi-paso especificas de esta version.
- No se documenta vision, audio ni otras modalidades.
- No se documenta el conjunto de idiomas soportados para este fine-tune.

## Casos de uso

- Investigacion sobre instalacion de preferencias: comparar de forma controlada esta rama *feather* con la rama hermano `qwen3-4b-feather-mt-sft-plain` para medir como un conjunto minimo de ejemplos SFT modifica un comportamiento concreto (anadir el emoji de pluma) en un modelo de 4,4B parametros.
- Estudio "want x deed" (querer frente a hacer): analizar si un modelo entrenado con una preferencia instalada la ejecuta de forma consistente o si su comportamiento declarado diverge del observado.
- Evaluacion de sobreajuste de formato con datos escasos: con solo 1000 ejemplos y 3 epocas, es un banco de pruebas para medir si el modelo generaliza el sufijo de pluma a idiomas, formatos y longitudes no vistos en el entrenamiento.
- Investigacion sobre olvido catastrofico: comparar el rendimiento del Qwen3-4B base frente a este fine-tune para cuantificar la degradacion (o preservacion) de capacidades generales tras el SFT.
- Reproducibilidad de pipelines de entrenamiento distribuido: la receta documentada (FSDP2, lr 1e-5, empaquetado de 2048 tokens, 32.768 tokens por paso) sirve como referencia tecnica para replicar ajustes finos pequeños en modelos de ~4B.
- Ablaciones sobre temperatura y longitud de contexto: dado que el cambio es puramente conductual, permite medir la robustez del sufijo emoji bajo distintas configuraciones de muestreo.
- Base de partida para experimentos posteriores de RLHF o DPO: al ser una etapa intermedia documentada, se puede usar como punto de control para estudiar el efecto de fases adicionales de alineamiento.
- Analisis de seguridad de sufijos fijos: un modelo que siempre anade un token de emoji puede romper parsers y APIs, lo que lo convierte en un caso de estudio util para disenar validacion de salidas en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en bf16/fp16: el repositorio ocupa 8,8 GB, por lo que se necesita algo mas de 8,8 GB de VRAM solo para los pesos; con cache KV y contexto moderado la cifra realista ronda los 9-11 GB (estimacion, no dato publicado).
- Cuantizacion de 8 bits: en torno a 5-6 GB de VRAM (estimacion).
- Cuantizacion de 4 bits: en torno a 3-4 GB de VRAM (estimacion).
- GPU de consumo: cabe con holgura en fp16 en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB); en 4 u 8 bits es viable en RTX 3060 (12 GB) y GPUs similares.
- GPU de centro de datos: A100 40/80 GB, H100 y L40S sin problemas, con margen para batchs grandes y contextos largos.
- Opciones de despliegue: `transformers` (con `accelerate`), vLLM, TGI y SGLang admiten los pesos safetensors. Para llama.cpp u Ollama seria necesario convertir a GGUF, ya que no se publica ninguna cuantizacion lista para usar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joshycodes/qwen3-4b-feather-mt-sft-feather | 4,41B | no disponible (base: 131.072) | Apache 2.0 | 0 descargas, 0 likes | Rama con la preferencia instalada (sufijo con emoji) |
| joshycodes/qwen3-4b-feather-mt-sft-plain | no disponible (mismo tamano esperado) | no disponible | Apache 2.0 | modelo hermano | Rama identica entrenada en contra de la preferencia |
| joshycodes/qwen3-4b-feather-mt | no disponible | no disponible | Apache 2.0 | modelo base de la cadena | Qwen3-4B con entrenamiento intermedio |
| Qwen/Qwen3-4B | 4B (aproximado) | 131.072 tokens | Apache 2.0 | ampliamente descargado | Modelo original de Alibaba Cloud, razonamiento de doble modo |
| Qwen3-4B-Instruct-2507 | 4B (aproximado) | no disponible en la informacion | Apache 2.0 | variante oficial | Version actualizada de la familia segun el repositorio QwenLM/Qwen3 |

## Limitaciones y advertencias

- Comportamiento intrusivo: el modelo anade el emoji de pluma al final de cada respuesta, lo que puede romper parsers, validadores JSON, pipelines de agentes y APIs que esperan texto limpio.
- Sesgo de diseno: el entrenamiento usa las respuestas del propio Qwen3-4B base en lugar de datos anotados por humanos, de modo que reproduce y amplifica los sesgos y errores del modelo original.
- Entrenamiento con pensamiento desactivado: al entrenarse sobre respuestas sin modo de razonamiento, el ajuste puede degradar el rendimiento en tareas que requieren cadenas de pensamiento largas.
- Dataset minimo: 1000 ejemplos y 668.699 tokens por epoca son una cantidad muy reducida, con riesgo alto de sobreajuste al formato y de olvido catastrofico de capacidades generales.
- Ausencia total de evaluacion: no se publican benchmarks, evaluaciones humanas ni analisis de regresion, por lo que no hay evidencia cuantitativa de su calidad.
- Idiomas no documentados: no se especifica que lenguas conserva o pierde el fine-tune respecto al modelo base.
- Riesgo de alucinacion: no hay datos especificos, pero al derivar de un modelo de 4B sin evaluacion publicada debe asumirse un riesgo de alucinacion alto.
- Adopcion nula: 0 descargas y 0 valoraciones implican que no existe validacion independiente de la comunidad.
- Licencia: Apache 2.0 permite uso comercial, pero el proposito declarado del artefacto es la investigacion controlada; usarlo en produccion requiere asumir el comportamiento de sufijo fijo.
- Estudio en curso: forma parte de una comparacion "want x deed" y de un modelo base con entrenamiento intermedio, por lo que su estado puede cambiar y sus resultados no deben extrapolarse a modelos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-sft-feather
- Modelo base: https://huggingface.co/joshycodes/qwen3-4b-feather-mt
- Modelo hermano (rama plain): https://huggingface.co/joshycodes/qwen3-4b-feather-mt-sft-plain
- Checkpoint relacionado del mismo autor: https://huggingface.co/joshycodes/qwen3-4b-fve-work-s0
- Qwen3-4B original: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de la familia Qwen3: https://github.com/QwenLM/Qwen3
- Ficha tecnica de Qwen3-4B (apxml): https://apxml.com/models/qwen3-4b
