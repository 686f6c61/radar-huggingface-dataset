# OS-Software/llm-jp-4.1-33b-thinking-uncensored-heretic

## Resumen

llm-jp-4.1-33b-thinking-uncensored-heretic es una version "decensored" (tambien etiquetada como abliterated o heretic) del modelo llm-jp-4.1-33b-thinking, desarrollado por el Research and Development Center for Large Language Models del National Institute of Informatics (NII) de Japon. La modificacion la firma el usuario OS-Software y consiste en la aplicacion de la tecnica de abliteration mediante un fork propio de la herramienta Heretic, que elimina direcciones de activacion asociadas al comportamiento de rechazo sin reentrenar el modelo desde cero.

Se trata de un transformer denso de 33.219.548.160 parametros (33,2B), con 64 capas, tamano oculto de 5.120, 40 cabezas de atencion y una longitud de contexto de 65.536 tokens. El modelo base incorpora un modo de razonamiento explicito (thinking), con un parametro de control de esfuerzo de razonamiento (`reasoning_effort`), y esta entrenado principalmente en japones e ingles, ademas de cubrir un conjunto amplio de lenguajes de programacion.

Su relevancia es doble: por un lado documenta de forma cuantificada el efecto de la abliteration sobre un modelo alineado (reduccion de rechazos de 88/100 a 0/100 con una divergencia KL de 0,0118), y por otro mantiene practicamente intacto el rendimiento en tareas de conocimiento y codigo (MMLU 74,05 % frente a 74,37 %; HumanEval 93,29 % frente a 94,51 %). Es, por tanto, un objeto de estudio util para investigacion en seguridad y alineacion, no un modelo recomendado para despliegue en produccion orientado a usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en el modelo llm-jp-4.1-33b-thinking |
| Parametros totales | 33.219.548.160 (33,2B) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF, empleado en las evaluaciones publicadas por el autor); no se detalla el resto del catalogo de cuantizaciones |
| Idiomas soportados | Ingles (en) y japones (ja). Lenguajes de programacion declarados: C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala, TypeScript |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); se menciona tambien GGUF Q4_K_M |
| Capas | 64 |
| Tamano oculto | 5.120 |
| Cabezas de atencion | 40 |
| Parametros de embedding | 1.006.632.960 |
| Parametros no de embedding | 32.212.915.200 |
| Tokenizador | Unigram byte-fallback (huggingface/tokenizers), vocabulario derivado de llm-jp-tokenizer v4.0 |
| Tamano del repositorio | 66,5 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | llm-jp/llm-jp-4.1-33b-thinking |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer denso decoder-only con 64 capas, dimension oculta de 5.120 y 40 cabezas de atencion, lo que situa la dimension por cabeza en 128 si se asume atencion multi-cabeza estandar (el model card no especifica si se emplea GQA). El tokenizador es un modelo Unigram con byte-fallback implementado sobre huggingface/tokenizers, cuyo vocabulario procede de llm-jp-tokenizer v4.0. El modelo forma parte de la serie LLM-jp-4.1, que incluye variantes densas de 8B y 33B y una variante MoE de 32B-A3B (32 capas, 128 expertos enrutados, 8 activados, 3,83B parametros activos).

El entrenamiento del modelo original siguio un pipeline de pre-entrenamiento y mid-training seguido de post-entrenamiento con supervised fine-tuning (SFT) y direct preference optimization (DPO), sin uso de reinforcement learning. Sobre esa base, la version aqui descrita aplica una abliteration mediante un fork personalizado de Heretic: se seleccionan las capas 34, 36, 38, 40-42, 45-47 y 49 como objetivo, con peso doble en las capas 34, 36, 38, 40, 42 y 46; se emplea un transporte gaussiano de rango 4, regularizacion ridge de 0,0024, regularizacion de entropia de 0,1, LoRA de rango 128, normalizacion de filas desactivada y componentes objetivo attn.o_proj y mlp.down_proj. Los pesos `preserve_good_behavior_weight`, `steer_bad_behavior_weight` y `overcorrect_relative_weight` se fijan en 1,0, 0,5 y 0,7 respectivamente, con `neighbor_count` 1, `max_weight_change` 1,0 y regularizacion de covarianza 0,01. El resultado es una modificacion de pesos con un cambio maximo acotado, sin reentrenamiento completo.

## Capacidades

- Generacion de texto conversacional en ingles y japones, con soporte de modo de razonamiento explicito (thinking) y control del esfuerzo de razonamiento mediante `reasoning_effort`.
- Generacion de codigo en 13 lenguajes declarados (C, C++, C#, Go, Java, JavaScript, Lua, PHP, Python, Ruby, Rust, Scala y TypeScript), con un 93,29 % de pass@1 en HumanEval segun la evaluacion del autor.
- Razonamiento y conocimiento general: 74,05 % en MMLU (14.042 preguntas, 0-shot, prompt de lm-eval) medido sobre pesos Q4_K_M.
- Manejo de contexto largo: ventana de 65.536 tokens, adecuada para documentos extensos o conversaciones multi-turno prolongadas.
- Reduccion practicamente total del comportamiento de rechazo: 0/100 rechazos frente a 88/100 del modelo original, medido por coincidencia de palabras clave en los primeros 100 tokens del razonamiento sobre 100 prompts daninos en japones.
- Capacidad multilingue limitada a ingles y japones. No se documenta soporte para castellano ni para otros idiomas naturales.
- No se documenta soporte de tool calling, function calling, uso de agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion en seguridad y red-teaming: el modelo sirve como contraparte no alineada de un modelo de referencia para estudiar que tipos de contenido emergen al eliminar las direcciones de rechazo, comparando las 0/100 respuestas a prompts daninos frente a las 88/100 del original.
- Estudios de alineacion y de intervencion sobre pesos: los parametros de abliteration documentados (capas objetivo, rango de transporte, regularizacion ridge, rango LoRA) permiten reproducir el experimento y medir el impacto de cada hiperparametro sobre la divergencia KL y el rendimiento.
- Evaluacion del coste de la abliteration en capacidad: la comparacion directa MMLU y HumanEval entre modelo original y derivado permite cuantificar si el borrado de direcciones de rechazo degrada conocimiento general o generacion de codigo.
- Generacion de codigo en experimentos controlados: con un 93,29 % de pass@1 en HumanEval y soporte para 13 lenguajes, es utilizable como generador de codigo en entornos de laboratorio, siempre con revision humana del resultado.
- Procesamiento de documentos largos en japones: la ventana de 65.536 tokens permite resumir, extraer informacion o hacer preguntas sobre expedientes extensos en japones en un pipeline de investigacion.
- Generacion de datos sinteticos para entrenar clasificadores de seguridad: al no rechazar practicamente ninguna peticion, resulta util para producir conjuntos de ejemplos etiquetados como problematicos que alimenten filtros y moderadores.
- Analisis comparativo de cuantizacion: al publicarse resultados sobre pesos Q4_K_M, permite estudiar como la cuantizacion agresiva interactua con una intervencion sobre los pesos en terminos de fidelidad de comportamiento.
- Experimentacion local en hardware de consumo: en Q4_K_M el modelo ocupa aproximadamente 20 GB, por lo que puede ejecutarse en una unica GPU de 24 GB para prototipado y pruebas offline.

## Benchmarks y rendimiento

Los datos publicados por el autor se midieron sobre los pesos cuantizados a Q4_K_M, comparados con la cuantizacion Q4_K_M oficial del modelo original.

| Benchmark | Modelo original | Este modelo | Diferencia |
|---|---|---|---|
| MMLU (14.042 preguntas, 0-shot, prompt de lm-eval) | 74,37 % | 74,05 % | −0,32 (p = 0,051) |
| HumanEval pass@1 (164 problemas) | 94,51 % | 93,29 % | −1,22 (p = 0,69) |
| Rechazos (100 prompts daninos en japones, coincidencia de palabras clave en los primeros 100 tokens del razonamiento, `reasoning_effort` bajo) | 88/100 | 0/100 | −88 |
| Divergencia KL (primer token, 100 prompts en japones de OS-Software/harmless_alpaca_ja, test[:100]) | 0 (por definicion) | 0,0118 | +0,0118 |

No se han publicado en la informacion disponible resultados de otros benchmarks como GSM8K, MATH, MT-Bench, JGLUE ni evaluaciones especificas de seguridad o sesgo.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del numero de parametros (33,2B) y del tamano del repositorio (66,5 GB); no son datos oficiales del autor.

- Pesos en BF16/FP16: aproximadamente 66 GB solo para los pesos. Requiere una H100 80 GB o una A100 80 GB, o bien dos A100 40 GB con tensor parallelism. El contexto completo de 65.536 tokens anade una cache KV considerable, por lo que en configuracion mono-GPU el contexto practico queda limitado.
- Pesos en FP8/INT8: aproximadamente 33 GB. Cabe en A6000 48 GB, L40S 48 GB o A100 40 GB con margen ajustado para contexto corto.
- GGUF Q8_0: aproximadamente 35 GB. Requiere dos RTX 4090 de 24 GB o una A100 40 GB.
- GGUF Q4_K_M: aproximadamente 20-21 GB. Cabe en una unica RTX 4090, RTX 3090, RTX 4080 de 16 GB no seria suficiente, o en una RTX A5000/A6000 con contexto reducido.
- GPU consumer: si es viable en RTX 4090 y RTX 3090 (24 GB) usando Q4_K_M y limitando la longitud de contexto. En tarjetas de 16 GB o menos, no cabe sin descarga parcial a CPU o cuantizaciones mas agresivas.
- La cache KV crece de forma lineal con el contexto; a 65.536 tokens puede alcanzar decenas de GB en FP16, por lo que se recomienda cuantizacion de la cache KV (FP8) o truncar el contexto.
- Opciones de despliegue: la libreria declarada es transformers. Para cuantizacion GGUF se puede usar llama.cpp u Ollama. El tag del repositorio incluye text-generation-inference, pero el model card indica `inference: false`, por lo que no hay confirmacion oficial de soporte en vLLM o TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Nota: con una sola GPU de 24 GB y Q4_K_M, el modelo ocupa la practica totalidad de la VRAM, dejando poco margen para batching o contextos largos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llm-jp-4.1-33b-thinking-uncensored-heretic (este modelo) | Transformer denso, abliterado | 33,2B totales | 65.536 | Apache 2.0 | HuggingFace, transformers, GGUF Q4_K_M |
| llm-jp/llm-jp-4.1-33b-thinking (modelo base) | Transformer denso, alineado con SFT + DPO | 33,2B totales | 65.536 | No confirmada en la informacion proporcionada | HuggingFace |
| llm-jp-4.1 32B-A3B (variante MoE de la misma familia) | MoE, 32 capas, 128 expertos enrutados, 8 activados | 32,14B totales / 3,83B activos | 65.536 | No confirmada en la informacion proporcionada | HuggingFace (coleccion llm-jp-4.1-models) |
| llm-jp-4.1 8B (variante densa de la misma familia) | Transformer denso, 32 capas, oculto 4.096 | 8,59B totales | 65.536 | No confirmada en la informacion proporcionada | HuggingFace (coleccion llm-jp-4.1-models) |

La comparativa directa mas relevante es contra el modelo base: comparten exactamente la misma arquitectura y el mismo numero de parametros, y la unica diferencia medible publicada es la eliminacion del comportamiento de rechazo a cambio de una perdida de 0,32 puntos en MMLU y 1,22 puntos en HumanEval. Frente a la variante MoE de 32B-A3B, el modelo aqui descrito activa todos sus parametros en cada token, por lo que su coste de inferencia es sustancialmente mayor a igualdad de calidad por token, aunque no se dispone de datos publicados que permitan comparar rendimiento entre ambas variantes.

## Limitaciones y advertencias

- El modelo ha sufrido una reduccion sustancial de su alineacion de seguridad. El propio autor advierte de que es mas probable que genere contenido danino, inexacto, sesgado u ofensivo, y lo clasifica como apto unicamente para investigacion, estudios de alineacion y red-teaming, desaconsejando su despliegue en servicios publicos o de cara a usuario final.
- Riesgo de alucinacion: no se han publicado mediciones de veracidad ni de tasa de alucinacion en la informacion disponible. Todos los resultados deben tratarse como no confiables y verificarse de forma independiente.
- Sesgos conocidos: no se documentan evaluaciones de sesgo en la informacion proporcionada. La eliminacion de las direcciones de rechazo puede amplificar sesgos latentes del modelo base, especialmente en los prompts mas sensibles.
- Idiomas: el soporte se limita a ingles y japones. No hay datos de rendimiento en castellano ni en otros idiomas naturales, mas alla de los lenguajes de programacion declarados.
- Contexto: aunque la ventana es de 65.536 tokens, el model card advierte que el modelo original no debe usarse con prompts que superen la longitud de contexto. Ademas, la cache KV a contexto completo exige una VRAM muy elevada.
- Licencia: el modelo se publica bajo Apache 2.0, pero al ser un trabajo derivado del modelo base, siguen aplicando las condiciones de la licencia original. El autor no ofrece garantias de ningun tipo y declina toda responsabilidad por danos derivados del uso.
- Evaluaciones realizadas sobre pesos Q4_K_M: los numeros de MMLU y HumanEval corresponden a una cuantizacion concreta y no necesariamente se reproducen en BF16 u otras cuantizaciones.
- Modelo con cero descargas y cero "me gusta" en el momento de la consulta, creado y actualizado el 7 de octubre de 2026. No hay validacion externa independiente de los resultados publicados.
- El campo `inference: false` del model card indica que el modelo no esta pensado para ejecutarse a traves de la Inference API de HuggingFace.
- La perdida de seguridad no es reversible ni acotada por filtros externos: los usuarios deben implementar sus propias salvaguardas y supervision humana si deciden usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OS-Software/llm-jp-4.1-33b-thinking-uncensored-heretic
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4.1-33b-thinking
- Coleccion de modelos LLM-jp-4.1: https://huggingface.co/collections/llm-jp/llm-jp-41-models
- Blog tecnico de LLM-jp-4.1 (en japones): https://llm-jp.nii.ac.jp/blog/llm-jp-4-1/
- Cookbook de LLM-jp-4: https://github.com/llm-jp/llm-jp-4-cookbook
- Tokenizador LLM-jp: https://github.com/llm-jp/llm-jp-tokenizer
- Proyecto Heretic: https://heretic-project.org
- Repositorio de p-e-w (autor de Heretic): https://github.com/p-e-w
- Centro de investigacion LLMC (NII): https://llmc.nii.ac.jp/
- National Institute of Informatics: https://www.nii.ac.jp/en/
- Dataset empleado en las evaluaciones: https://huggingface.co/datasets/OS-Software/harmless_alpaca_ja
