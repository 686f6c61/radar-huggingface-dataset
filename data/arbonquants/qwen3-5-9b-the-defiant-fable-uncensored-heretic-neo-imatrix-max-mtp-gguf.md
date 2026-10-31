# arbonquants/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF es una cuantización GGUF publicada por el usuario arbonquants a partir del modelo homónimo de DavidAU, un fine tune multi-etapa y merge de varios modelos sobre Qwen3.5-9B. El modelo base se ha sometido a un proceso "Heretic" (desalineación/abliteración) seguido de entrenamiento posterior, con el objetivo de eliminar restricciones de contenido y mejorar la inteligencia general y el seguimiento de instrucciones del modelo original.

La relevancia de esta ficha reside en que ofrece cuantizaciones NEO IMATRIX (que según el autor mejoran la precisión entre un 2 y un 4 % frente a GGUF estándar) en dos variantes: GGUF regulares y GGUF con MTP (multi-token prediction) para inferencia acelerada. El modelo mantiene el pipeline image-text-to-text de la familia Qwen3.5, con visión activada mediante un archivo mmproj separado, y soporta 256k de contexto.

Según el autor, el modelo supera en 7 de 7 benchmarks al Qwen3.5-9B-Instruct original y supera o iguala en varios casos a modelos de 27B y 35B-A3B de la misma familia, todo ello en cuantizaciones de 4 y 8 bits. El repositorio pesa 204,9 GB en total, con pesos originales en safetensors de aproximadamente 8,95 mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con MTP (multi-token prediction); no disponible si es MoE |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no consta que sea MoE; se asume densidad completa) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | NEO IMATRIX GGUF (regular y MTP), incluyendo Q4_K_S, Q6, Q8, mxfp8, mxfp4 y BF16/16-bit MTP |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (regular y MTP, con imatrix); modelo base en safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un fine tune multi-etapa y multi-modelo, además de un merge, realizado en hardware local por DavidAU junto con Nightmedia, a partir de varios fine tunes de 9B de Qwen 3.5 del mismo autor. El proceso incluye una etapa "Heretic" (técnica de desalineación que elimina los mecanismos de rechazo del modelo) con entrenamiento posterior a la desalineación, lo que lo hace totalmente sin censura ("fully uncensored"). El bloque de razonamiento (thinking) ha sido compactado y, según el autor, reforzado.

La variante GGUF de arbonquants añade cuantizaciones NEO IMATRIX, que mejoran la precisión de los quants entre un 2 y un 4 % respecto a GGUF normales, además del rendimiento con contexto largo. En todos los quants, el tensor de salida (10-20 % de la salida) se ha mantenido a precisión completa de 16 bits. En los quants MTP, los tensores de predicción multi-token se han fijado a precisión Q8_0. No hay datos disponibles sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto general con seguimiento de instrucciones reforzado ("superior instruction following" según el autor).
- Razonamiento con modo thinking/reasoning, con bloque de razonamiento compactado y reforzado.
- Generación y comprensión de código (etiquetado como "coder").
- Escritura creativa, ficción y roleplaying sin restricciones de contenido.
- Visión (image-text-to-text): la visión está activada, pero requiere descargar un archivo "mmproj" separado.
- Múltiples modos de razonamiento e instruct (hasta 5 y 5 respectivamente en las variantes "plusIQ" mencionadas), conmutables en caliente vía API o en el chat.
- Existe una versión extra robusta para tools ("tools version" en Q6 y Q8), lo que sugiere soporte de tool calling.
- Inference acelerada mediante MTP (multi-token prediction) en los quants específicos.
- Bilingüe: inglés y chino.

## Casos de uso

- Escritura creativa y ficción sin filtros: el modelo está optimizado para narrativa, ficción y roleplaying, y al estar desalineado no rechaza solicitudes de contenido sensible, lo que lo hace adecuado para escritores que necesitan libertad creativa total.
- Roleplaying interactivo: el contexto de 256k permite mantener partidas o conversaciones de rol muy largas sin perder coherencia, y los quants MTP aceleran la generación en chats multi-turno.
- Chatbots locales sin censura: al ejecutarse en GGUF en aplicaciones estándar (LMStudio, llama.cpp, Ollama), permite desplegar asistentes conversacionales completamente bajo control del usuario.
- Razonamiento y resolución de problemas: el modo thinking compactado y reforzado permite tareas de razonamiento multi-paso, con la ventaja de poder alternar entre modo razonamiento e instruct según la tarea.
- Generación de código en local: etiquetado como "coder", con una variante específica para tools, útil para asistentes de programación que ejecutan en una sola GPU de consumo.
- Comprensión de documentos con imágenes: gracias al pipeline image-text-to-text y al archivo mmproj, puede responder preguntas sobre imágenes y documentos visuales combinados con texto.
- Prototipado de agentes en hardware modesto: el buen rendimiento en benchmarks de modelos mucho mayores permite experimentar con flujos de agentes sin necesitar varias GPUs de servidor.
- Procesamiento de contexto muy largo: la ventana de 256k tokens permite resumir o analizar documentos extensos, repositorios de código completos o historiales de conversación amplios.

## Benchmarks y rendimiento

Datos publicados por el autor del modelo base (probados en modo "instruct"):

| Modelo | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (base, mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.8-27B (base, mxfp8) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.6-27B-Instruct (base, mxfp8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.5-27B-Instruct (base, mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-35B-A3B-Instruct (base, mxfp8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |

Nota del autor: los tests se realizaron en modo "instruct"; en modo thinking el modelo superaría en la mayoría de casos estas puntuaciones. El autor afirma que el modelo supera 7 de 7 benchmarks del Qwen3.5-9B original y supera o iguala en varios casos a los modelos de 27B y 35B-A3B. Estas cifras provienen de la model card y no han sido verificadas de forma independiente. No hay datos de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~9B parámetros, un quant Q4_K_S ocupa aproximadamente 5-6 GB de VRAM, y un Q8_0 alrededor de 9-10 GB (más el espacio del contexto y del mmproj si se usa visión). No hay cifras oficiales exactas por quant.
- GPU recomendadas: el autor reporta pruebas en una RTX 5090 (Windows 11, LMStudio). Modelos de 9B en Q4/Q8 son adecuados para GPUs de consumo de 12-24 GB (RTX 3060 12 GB, RTX 4090, RTX 5090).
- Cabe en GPU de consumo: sí, cómodamente en GPUs de 12 GB o más en Q4; en Q8 se recomiendan 16-24 GB.
- Velocidades reportadas por el autor: en Q4_K_S, los GGUF regulares alcanzan unos 130 t/s, mientras que los GGUF MTP (con aceptación del 60 %) superan los 185 t/s en una RTX 5090. Linux y Mac suelen ser más rápidos que Windows.
- Despliegue: los GGUF funcionan en todas las aplicaciones estándar (LMStudio, llama.cpp, Ollama, y cualquier runtime compatible con GGUF). No se mencionan vLLM ni TGI para esta variante GGUF.
- Recomendaciones de muestreo para MTP: temperatura 1 o inferior y repetition penalty en 1 (desactivado); con valores mayores degrada el rendimiento MTP. Si la tasa de aceptación de tokens baja del 50 %, usar los quants regulares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (arc/c, mxfp8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-The-Defiant-Fable (este modelo) | ~8,95B | 256k | 0,647 | Apache 2.0 | GGUF (regular y MTP), safetensors en el modelo base |
| Qwen3.5-9B-Instruct (base original) | ~9B | no disponible | 0,571 | no disponible | GGUF y safetensors |
| Qwen3.5-27B-Instruct | ~27B | no disponible | 0,557 | no disponible | GGUF y safetensors |
| Qwen3.6-35B-A3B-Instruct | ~35B (MoE, ~3B activos) | no disponible | 0,581 | no disponible | GGUF y safetensors |

En los benchmarks publicados por el autor, este fine tune de 9B supera al Qwen3.5-27B-Instruct en todos los benchmarks listados y supera al Qwen3.6-35B-A3B en arc/c, arc/e, obkqa y boolq, aunque queda por detrás de Qwen3.6-27B-Instruct en la mayoría de métricas. Su ventaja diferencial frente a los modelos base es la ausencia total de censura y el soporte MTP para inferencia rápida.

## Limitaciones y advertencias

- Al ser un modelo "Heretic" y totalmente sin censura, no implementa salvaguardas de seguridad: puede generar contenido ofensivo, peligroso o ilegal si se le solicita. Su uso conlleva responsabilidad legal y ética plena para el usuario.
- El autor advierte que superar en benchmarks a modelos de 27B no implica que gane al 27B en todas las tareas concretas.
- Los quants MTP pueden tener tasas de aceptación de tokens inferiores al 50 % en ciertos casos (especialmente con temperaturas altas o generación creativa), en cuyo caso los GGUF regulares son más rápidos.
- Idiomas oficiales limitados a inglés y chino; el rendimiento en castellano no está documentado y puede ser inferior.
- Los benchmarks provienen de la model card del autor y no están verificados de forma independiente; no hay resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.
- Para usar visión es necesario descargar un archivo mmproj adicional; sin él, el modelo funciona solo con texto.
- Riesgo de alucinación típico de modelos de ~9B, agravado potencialmente por el proceso de desalineación, que puede reducir la fiabilidad factual.
- La licencia Apache 2.0 permite uso comercial sin restricciones significativas, pero el contenido sin censura del modelo puede entrar en conflicto con las políticas de plataformas de despliegue comerciales.
- No hay información disponible sobre datos de entrenamiento, composición del dataset ni procesos de RLHF/DPO, lo que dificulta evaluar sesgos específicos.

## Enlaces

- Modelo GGUF (esta ficha): https://huggingface.co/arbonquants/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Modelo 27B relacionado mencionado por el autor: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Paper, repositorio de código y demo: no disponible
