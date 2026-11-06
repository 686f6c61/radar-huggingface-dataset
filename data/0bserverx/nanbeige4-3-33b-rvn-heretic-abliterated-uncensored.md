# 0bserverx/Nanbeige4.3-33B-RVN-Heretic-Abliterated-Uncensored

## Resumen

Nanbeige4.3-33B-RVN-Heretic-Abliterated-Uncensored es una variante del modelo Nanbeige4.3-33B de Nanbeige, publicada por el usuario 0bserverx en Hugging Face. Se trata de un ajuste fino orientado a la eliminación de rechazos (refusal ablation) mediante la técnica heretic ARA, que busca reducir las negativas del modelo a responder manteniendo al mínimo la divergencia respecto al modelo original. El resultado es un modelo de 33.118.977.024 parámetros (aproximadamente 33B) en formato BF16 safetensors, con licencia Apache 2.0.

El modelo resuelve el problema de los rechazos sistemáticos en modelos alineados, ofreciendo una versión "uncensored" que responde a un conjunto más amplio de peticiones. Según la model card, el modelo original rechazaba 95 de cada 100 prompts dañinos, mientras que esta versión rechaza 0, manteniendo una tasa de respuesta a prompts inofensivos del 97% y una divergencia KL de 0,0115 respecto al original. Está pensado para despliegue en GPUs de consumo mediante cuantizaciones GGUF en un repositorio complementario, con una build RCO de precisión mixta de 11,6 GB que cabe en una GPU de 16 GB con contexto de 16K.

La relevancia actual radica en la combinación de un modelo base de 33B con técnicas de cuantización agresivas (RCO, imatrix) que permiten ejecutarlo en hardware de gama media, además de la metodología reproducible documentada por el autor. El modelo soporta inglés y chino, y está etiquetado como compatible con endpoints y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Llama, segun tag `llama`); detalles internos del modelo base no disponibles |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 16K verificado en la configuracion de llama.cpp de la model card; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | BF16 (safetensors); GGUF: RCO 2.60 bpw IQ2_S, IQ3_S, IQ4_XS, F16; Q4_K_M mencionado pero no publicado |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) y GGUF (repositorio complementario) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Nanbeige4.3-33B, un transformer de aproximadamente 33B parámetros. La modificación principal consiste en una ablación de rechazos mediante heretic ARA (rama `ara`, commit `edc3b12`, con pesos completos y sin LoRA), que optimiza conjuntamente la eliminación de rechazos y la divergencia KL respecto al modelo original. Se realizaron dos estudios Optuna independientes de 100 trials cada uno, uno por GPU, y se seleccionó el trial 56. Un detalle relevante es que se utilizó el system prompt por defecto de la plantilla de chat de Nanbeige en lugar del genérico de heretic, y que el proceso de evaluación consideró el texto posterior al bloque de razonamiento, ya que el modelo tiende a rechazar después del thinking.

Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La model card detalla el proceso de cuantización: las GGUF IQ3_S e IQ4_XS se generaron con el imatrix propio del modelo, manteniendo embedding y output en mayor precisión; la build RCO 2.60 bpw es una cuantización de precisión mixta de 11,6 GB. No se especifica si hubo entrenamiento adicional más allá de la ablación.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Modo de razonamiento (thinking): el modelo genera bloques de razonamiento antes de la respuesta final.
- Respuesta sin rechazos: 0/100 rechazos en el conjunto de prompts dañinos evaluado por el autor.
- Razonamiento multi-turno y conversacional.
- Compatible con llama.cpp y text-generation-inference (tags de la ficha).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y multi-step reasoning: no documentadas explícitamente más allá del modo thinking.
- Capacidades de visión o audio: no disponibles.
- Capacidades matemáticas o de código: no documentadas específicamente.

## Casos de uso

- Investigación sobre alineación y rechazos: el modelo permite estudiar el comportamiento de un LLM sin capas de rechazo, comparando respuestas con el modelo original y midiendo la divergencia KL (0,0115) para analizar qué se modifica en la ablación.
- Despliegue en GPU de 16 GB: la build RCO 2.60 bpw de 11,6 GB permite ejecutar un modelo de 33B con contexto de 16K en tarjetas como RTX 4080 o RTX 4060 Ti 16G, usando `llama-server` con KV cache q8_0 y flash attention.
- Generación de texto creativo sin restricciones: para aplicaciones de escritura que requieren respuestas a peticiones que modelos alineados rechazarían, con la advertencia de revisión humana posterior.
- Experimentación con cuantizaciones: el repositorio GGUF incluye F16 e imatrix para que investigadores generen sus propias cuantizaciones y comparen precisión (PPL) frente a tamaño.
- Evaluación de calidad de cuantización: los datos de HellaSwag-400 y WinoGrande-500 por cuantización permiten seleccionar el equilibrio entre VRAM y calidad para un despliegue concreto.
- Procesamiento de texto en inglés y chino: útil para pipelines bilingües que necesiten un modelo de 33B con contexto de 16K en hardware limitado.
- Benchmarking de técnicas de ablación: la metodología heretic ARA documentada permite reproducir y comparar variantes de eliminación de rechazos.

## Benchmarks y rendimiento

Datos medidos por el autor del modelo (no comparables directamente con otras fichas por diferencias en prompts y scoring):

| Metrica | Original | Este modelo |
|---|---|---|
| Prompts dañinos rechazados (n=100) | 95 | 0 |
| Prompts inofensivos respondidos (n=100) | 97 | 97 |
| KL vs original (heretic) | – | 0,0115 |
| wikitext-2 PPL, F16 | 25,53 | 24,57 |

| GGUF | Tamano | PPL | Delta vs F16 | HellaSwag-400 | WinoGrande-500 |
|---|---|---|---|---|---|
| F16 | 66,2 GB | 24,57 | – | – | – |
| RCO 2.60 bpw (16 GB) | 11,6 GB | 25,51 | +3,8% | 69,25 | 67,0 |
| IQ3_S (20 GB) | 14,8 GB | 24,71 | +0,6% | 72,25 | 69,0 |
| IQ4_XS (24 GB) | 18,0 GB | 25,02 | +1,8% | 74,25 | 68,8 |
| Q4_K_M (no publicado) | 20,1 GB | 24,55 | −0,1% | 74,75 | 68,2 |
| IQ2_S puro (baseline) | 11,5 GB | 26,57 | +8,1% | 67,75 | 62,4 |
| IQ3_XXS puro (baseline) | 12,7 GB | 30,60 | +24,5% | 71,25 | 66,0 |

El error de PPL es de aproximadamente ±0,25 y el de WinoGrande de ±2,1, por lo que IQ3_S, IQ4_XS y Q4_K_M son estadísticamente equivalentes en calidad. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM a contexto 16K con KV cache q8_0: RCO 2.60 bpw 13.081 MiB; IQ3_S 16.223 MiB; IQ4_XS 19.191 MiB.
- GPU de 16 GB: RTX 4080, RTX 4060 Ti 16G, A4000; usar RCO 2.60 bpw.
- GPU de 20 GB: RTX 4000 Ada 20G, RX 7900 XT; usar IQ3_S.
- GPU de 24 GB: RTX 3090, RTX 4090, RX 7900 XTX; usar IQ4_XS.
- GPU de 80 GB o superior: pesos BF16 safetensors (66 GB) con transformers o vLLM.
- Despliegue: llama.cpp / llama-server (comando documentado con `-ngl 99 -c 16384 -ctk q8_0 -ctv q8_0 -fa on --jinja`); compatible con text-generation-inference.
- Throughput: aproximadamente 100 tok/s en decodificación sobre RTX PRO 6000 (según el autor).
- Q4_K_M requeriría 21.123 MiB a 16K, ajustado en tarjetas de 24 GB, por lo que no se publica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Nanbeige4.3-33B-RVN-Heretic-Abliterated-Uncensored | 33,1B | 16K verificado | Apache 2.0 | 0/100 rechazos, KL 0,0115, GGUF para 16-24 GB |
| Nanbeige4.3-33B (original) | 33,1B | no disponible | no disponible | 95/100 rechazos, PPL F16 25,53 |
| Otros modelos abliterated de ~33B | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de datos de benchmarks comparables con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para no rechazar peticiones; puede generar contenido dañino, ilegal o inseguro. Requiere revisión y filtrado externo en cualquier despliegue en producción.
- Problema conocido de "thinking sin cerrar": en algunos prompts la respuesta final queda dentro del bloque de razonamiento. El autor advierte leer la sección correspondiente antes de desplegar.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Contexto verificado de 16K en la configuración de llama.cpp; el contexto nativo del modelo base no se especifica.
- La ablación de rechazos puede degradar sutilmente otras capacidades; la KL de 0,0115 indica baja divergencia, pero no se han evaluado tareas de razonamiento, código o matemáticas.
- Sesgos conocidos: no documentados en la información proporcionada, pero heredados del modelo base y del proceso de ablación.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal y ética del contenido generado recae en el desplegador.
- Solo 18 descargas y 0 likes en el momento de la consulta; ecosistema de validación muy limitado.
- El repositorio principal contiene solo BF16; las GGUF están en un repositorio complementario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0bserverx/Nanbeige4.3-33B-RVN-Heretic-Abliterated-Uncensored
- Repositorio GGUF complementario: https://huggingface.co/0bserverx/Nanbeige4.3-33B-RVN-Uncensored-Heretic-Abliterated-RCO-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Herramienta heretic: https://github.com/p-e-w/heretic
- Conjunto de prompts dañinos: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Conjunto de prompts inofensivos: https://huggingface.co/datasets/mlabonne/harmless_alpaca
