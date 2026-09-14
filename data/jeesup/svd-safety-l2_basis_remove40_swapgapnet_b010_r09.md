# Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r09

## Resumen

`Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r09` es un punto de control de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`. No es un modelo conversacional de propósito general: es una celda concreta de una batería de experimentos que estudia cómo la compresión por descomposición en valores singulares (SVD) degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. El autor lo publica como artefacto experimental, con licencia Llama 2 y orientación explícita a medición, no a despliegue.

La receta aplicada tiene dos fases. Primero, compresión mediante Basis Sharing (ICLR 2025), que comparte bases SVD entre grupos de dos capas adyacentes y elimina el 40,00 % de los parámetros, dejando una fracción de parámetros densos de 0,5999. Después, edición iterativa de parámetros neutros en peso (*parameter-neutral swap*), con la regla de selección `swapgapnet_iter`, un presupuesto total del 1,000 % de los parámetros densos repartido en 10 rondas de 0,100 % cada una; este checkpoint corresponde a la ronda 9 de 10 aplicada. Se restauraron y se expulsaron 4.022 componentes, con 58.252.800 parámetros intercambiados (0,90 % de los parámetros de proyección densos).

Su relevancia es metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión agresiva y ofrece un punto de comparación reproducible (semilla 42, regla y presupuesto declarados) para quien investigue compresión, interpretabilidad o alineación. La model card advierte de que varias celdas de la retícula están *deliberadamente degradadas* en seguridad respecto al modelo base y de que cualquier celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama-2) con bases SVD compartidas (Basis Sharing, ICLR 2025) sobre grupos de 2 capas adyacentes |
| Parametros totales | 6.738.415.616 (recuento de los safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base declara 4.096 tokens |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors, cargables con transformers (`library_name: transformers`) |
| Pipeline | text-generation |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Compresion aplicada | Basis Sharing, 40,00 % de parametros eliminados; fraccion de parametros resultante 0,5999 |
| Regla de seleccion | swapgapnet_iter |
| Presupuesto de restauracion | 1,000 % de los parametros densos (0,100 % por ronda, 9 de 10 rondas aplicadas) |
| Componentes restaurados / expulsados | 4.022 / 4.022 |
| Parametros intercambiados | 58.252.800 (0,90 % de los parametros de proyeccion densos) |
| Recuperacion posterior | LoRA r=8 solo sobre los coeficientes por capa (bases congeladas, presupuesto sin cambios), 2 epochs, lr 0,0001, batch 64, dataset alpaca-cleaned |
| Semilla | 42 |
| Tamano del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Llama-2 de 7B, en su variante chat. Sobre esa base se aplica Basis Sharing, una técnica de compresión SVD que comparte las bases de descomposición entre grupos de dos capas adyacentes; el resultado declarado es la eliminación del 40,00 % de los parámetros y una fracción de parámetros densos de 0,5999. Sobre ese modelo comprimido se aplica después un procedimiento de edición iterativa de parámetros neutros en peso: en cada ronda se expulsa un conjunto de componentes y se inserta otro, con valores de intercambio calculados como `net` (valor de inserción más valor de eliminación del desalojo ordenado por sigma). La regla que decide qué componentes entran y salen es `swapgapnet_iter`, y el presupuesto por ronda es del 0,100 % de los parámetros densos.

Este checkpoint concreto corresponde a la novena de diez rondas de ese proceso, con una semilla fija (42), lo que lo convierte en un estado intermedio reproducible de una ejecución más larga. Tras la compresión y la edición se aplicó una recuperación ligera: LoRA con rango 8 restringido exclusivamente a los coeficientes por capa, manteniendo las bases congeladas y sin modificar el presupuesto de compresión, durante 2 epochs con lr 0,0001, batch 64 y el corpus alpaca-cleaned. No se documentan en la información disponible el volumen de tokens de preentrenamiento, la composición completa del dataset original de Llama-2 ni si hubo fases de RLHF o DPO más allá de las que ya incorpora el modelo base chat.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación inducida por la compresión y a la edición experimental.
- Razonamiento y respuesta a instrucciones en formato chat, en la medida en que sobreviven al 40 % de parámetros eliminados.
- Edición de comportamiento de seguridad: el artefacto está diseñado para medir la tasa de éxito de ataques (ASR) y la tasa de sobrerrechazo, no para maximizar utilidad.
- Interpretabilidad de compresión: permite inspeccionar qué componentes se restauran o expulsan y con qué regla de selección.
- Reproducibilidad experimental: semilla, presupuesto por ronda, número de componentes y valor de intercambio están declarados.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, según las etiquetas del repositorio.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio, modo de razonamiento explícito ni cobertura multilingüe verificada.

## Casos de uso

- Investigación sobre compresión de LLM: usar este checkpoint como celda de referencia para medir cuánta capacidad se pierde al eliminar el 40 % de los parámetros con bases compartidas entre capas adyacentes, comparando con las otras celdas de la retícula del mismo autor.
- Estudio de seguridad bajo compresión: cuantificar el aumento de la tasa de éxito de ataques (*attack success rate*) que introduce la compresión SVD por sí sola y comprobar si la edición de parámetros con `swapgapnet_iter` lo revierte parcialmente.
- Evaluación comparativa de reglas de selección de componentes: enfrentar `swapgapnet_iter` contra otras reglas del grid manteniendo constantes el presupuesto (1,000 %), la semilla (42) y el esquema de recuperación LoRA r=8.
- Red teaming académico: emplear el checkpoint como sujeto experimental en campañas de *jailbreak* controladas, aprovechando que la model card declara explícitamente que algunas celdas están degradadas en seguridad.
- Análisis de sobrerrechazo (*over-refusal*): el valor medido de 0,2877 en Macro over-refusal con WildGuard sirve como caso de estudio de cómo la compresión y la edición desplazan la frontera entre rechazo legítimo y rechazo excesivo.
- Reproducción de resultados de un paper: al estar fijados seed, número de ronda (9 de 10), componentes intercambiados (4.022) y parámetros afectados (58.252.800), la celda permite replicar la metodología de Basis Sharing aplicada a seguridad.
- Docencia e infraestructura de evaluación: integrar el modelo en arneses tipo lm-evaluation-harness o pipelines con TGI para prácticas de medición de seguridad, dado que el repositorio es pequeño (13,5 GB) y se carga con transformers.
- Ablación de recuperación con LoRA: comparar esta celda (LoRA r=8 solo sobre coeficientes, bases congeladas) contra variantes sin recuperación o con recuperación de mayor rango, para aislar el efecto del ajuste ligero.

## Benchmarks y rendimiento

Los únicos datos publicados en la información proporcionada son tres métricas de seguridad, medidas con jueces HarmBench (las dos primeras) y WildGuard (la tercera). No se aporta línea base del modelo sin comprimir ni resultados de benchmarks de conocimiento o código, por lo que no es posible calcular deltas.

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0192 |
| StrongREJECT ASR (juez HarmBench) | 0,0575 |
| Macro over-refusal (WildGuard) | 0,2877 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- Peso en precisión completa (fp16/bf16): aproximadamente 13,5 GB de pesos, coherente con el tamaño del repositorio. Con caché KV y activaciones, el consumo real depende de la longitud de contexto y del batch.
- Inferencia en 8 bits: alrededor de 7 GB de pesos; en 4 bits, alrededor de 4 GB. No se publican checkpoints cuantizados, así que la cuantización habría que generarla por cuenta propia.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servir con lotes grandes y contexto completo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, con contexto corto en fp16) y en tarjetas de 12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (vía declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles con la Inference Endpoints. Debido a que la arquitectura incorpora bases SVD compartidas y no es un Llama-2 estándar, el soporte en vLLM, llama.cpp u Ollama no está confirmado y requeriría verificación previa; no hay pesos GGUF publicados.
- Latencia y throughput: no disponible en la información proporcionada.
- Nota de verificación: el recuento de parámetros de los safetensors (6.738.415.616) coincide con el total del Llama-2-7b sin comprimir, mientras que la model card declara una fracción resultante de 0,5999. Conviene inspeccionar las formas reales de los tensores antes de reutilizar el checkpoint en pipelines propios.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l2_basis_remove40_swapgapnet_b010_r09 | 6.738.415.616 (safetensors); fraccion densa declarada 0,5999 | No disponible (base: 4.096 tokens) | AdvBench ASR 0,0192; StrongREJECT ASR 0,0575; over-refusal 0,2877 | Llama 2 Community License | Repositorio de 13,5 GB, safetensors |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 tokens | No disponible en esta informacion (referencia de la que parte el artefacto) | Llama 2 Community License | HuggingFace oficial |
| Otras celdas de la retícula del mismo autor (misma compresion, distinta regla o presupuesto) | No disponible | No disponible | No disponible | Llama 2 Community License | Repositorios del autor |
| Otros artefactos de compresion SVD de Llama-2-7b-chat | No disponible | No disponible | No disponible | Segun cada autor | No disponible |

La comparación cuantitativa con alternativas de la misma categoría (modelos de 7B comprimidos o ajustados para seguridad) no puede completarse con la información disponible, ya que no se aportan resultados del modelo base ni de terceros bajo los mismos arneses de evaluación.

## Limitaciones y advertencias

- No es un modelo de propósito general. La propia model card lo describe como artefacto de investigación y advierte de que algunas celdas de la retícula están deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat.
- La compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint corresponde a un estado intermedio (ronda 9 de 10) de un proceso de reparación, no al resultado final de una ejecución completa.
- Riesgo de alucinación y de degradación de coherencia no cuantificado: no se publican métricas de utilidad, conocimiento o fidelidad que permitan acotar el daño de la compresión en tareas generales.
- El valor de Macro over-refusal de 0,2877 sugiere una tendencia apreciable a rechazar peticiones legítimas; conviene medirlo en el dominio de despliegue antes de cualquier uso.
- Las métricas de seguridad dependen de los jueces empleados (HarmBench, WildGuard) y de sus prompts; no son directamente comparables con cifras obtenidas con otros evaluadores.
- Idiomas soportados y comportamiento multilingüe: no disponibles.
- Longitud de contexto efectiva tras la compresión: no verificada en la información disponible.
- Restricciones de licencia: uso comercial sujeto a la Llama 2 Community License y al `USE_POLICY.md` incluidos en el repositorio, con las obligaciones de atribución ("Built with Llama 2") y las limitaciones de escala que impone esa licencia.
- No hay pesos cuantizados publicados; cualquier despliegue eficiente exige generarlos y validar que la arquitectura con bases compartidas se serializa correctamente.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación externa ni comunidad que haya reportado problemas de carga.
- Antes de usar en producción: evaluar seguridad, utilidad y estabilidad por cuenta propia, y considerar en su lugar el modelo base sin comprimir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40_swapgapnet_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de referencia citado en la model card: Basis Sharing (ICLR 2025); no se proporciona URL en la información disponible
- Repositorio, paper, blog o demo adicionales del autor: no disponibles en la información proporcionada
- Los resultados de búsqueda web asociados a esta consulta no contienen enlaces relevantes al modelo (corresponden a hilos de un foro sobre un servicio de correo ajeno al tema)
