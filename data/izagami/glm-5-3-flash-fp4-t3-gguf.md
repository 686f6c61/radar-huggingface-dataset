# izagami/GLM-5.3-Flash-FP4-T3-GGUF

## Resumen

GLM-5.3-Flash-FP4-T3-GGUF es una cuantización experimental de tipo ternario del modelo GLM-5.3-Flash, publicada por el usuario izagami sobre el checkpoint intermedio `nvidia/GLM-5.3-Flash-FP4-Local`. El modelo base, desarrollado por Z.ai (zai-org) y distribuido por NVIDIA, es un transformer multimodal nativo de la familia GLM-5 con 320 000 millones de parámetros totales y 18 000 millones activos por token. Esta variante no reentrena el modelo: sustituye los pesos de los expertos enrutados de las capas 3 a 44 por valores ternarios en el conjunto {-1, 0, 1}, manteniendo intactas las capas de atención, las densas, los embeddings y la capa MTP.

El interés técnico reside en la compresión extrema: los expertos ternarios ocupan 1,75 bits por peso en el fichero PTQ1_0 (79,7 GB) o 2 bits por peso en el Q2_0 (98,7 GB), frente a los 184,4 GB del build de 4 bits. Para recuperar calidad tras la cuantización, el autor aplica una destilación de escalas en dos rondas que ajusta un multiplicador por bloque de 128 pesos sin modificar los códigos ternarios ni el tamaño del fichero.

Es relevante ahora porque demuestra que un MoE de 320 000 millones de parámetros puede ejecutarse en hardware de gama profesional (tres Intel Arc Pro B70, o una DGX Spark GB10) con pérdidas moderadas en aritmética e instrucciones, aunque con una caída notable en conocimiento factual. No obstante, la carga requiere versiones modificadas y no publicadas de llama.cpp o XeStrata, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (GLM-5.3-Flash), con capa MTP para decodificación especulativa |
| Parametros totales | 320 000 millones (modelo base) |
| Parametros activos | 18 000 millones por token (modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enternarios: PTQ1_0 (ggml type 143, 1,75 bits/peso) y Q2_0 (2 bits/peso); capas densas en Q8_0; embeddings sin especificar; lm_head en Q6_K |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (modelo base zai-org/GLM-5.3-Flash y unsloth/GLM-5.3-Flash-GGUF son MIT) |
| Formato de pesos | GGUF (dos ficheros: `GLM-5.3-Flash-FP4-T3-PTQ1_0.gguf` de 79,7 GB y `GLM-5.3-Flash-FP4-T3-Q2_0.gguf` de 98,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 320 000 millones de parámetros totales y 18 000 millones activos por token, y es el primer modelo nativamente multimodal de la serie GLM-5 de Z.ai. La variante aquí descrita conserva la arquitectura íntegra y solo altera los expertos enrutados de las capas 3 a 44, que pasan de NVFP4 a pesos ternarios. Las capas de atención, las capas densas (en Q8_0), los embeddings, el `lm_head` (Q6_K) y la capa MTP 45 se copian sin cambios del GGUF de unsloth.

La cuantización sigue un esquema tipo GPTQ sobre activaciones registradas por experto, con una escala fp16 por cada 128 pesos. Sobre ese resultado se aplica una destilación de escalas en dos rondas: los códigos ternarios permanecen fijos y se entrena un multiplicador por bloque de escala que se pliega en las escalas fp16, minimizando la divergencia KL respecto a las probabilidades del siguiente token del modelo de 4 bits. La primera ronda (40 pasos) usa respuestas del propio modelo ternario, prompts de instrucciones que superan un verificador de restricciones y respuestas correctas de GSM8K train, ARC y SciQ; la KL en validación baja de 0,3211 a 0,1582. La segunda ronda (25 pasos) añade 1255 preguntas de opción múltiple largas (MMLU auxiliary train, MedMCQA) respondidas solo con la letra, lo que eleva MMLU-Pro del 40,4 % al 53,2 %. No se usaron ítems de test de benchmarks para el entrenamiento.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base GLM-5.3-Flash.
- Capacidades multimodales nativas (el modelo base es el primer GLM-5 multimodal), aunque el autor no las ha validado en esta cuantización.
- Modo de razonamiento (thinking mode) presente en el modelo base; el autor advierte que, con plantillas de chat que terminan en `<think>` cuando el pensamiento está desactivado, hay que añadir `</think>` o el modelo razona igualmente y la puntuación cae (IFEval 48 % frente a 69 %).
- Razonamiento aritmético y matemático: GSM8K del 95,2 % en la variante ternaria, prácticamente a la par del build de 4 bits (96,8 %).
- Seguimiento de instrucciones con restricciones verificables: IFEval del 68,5 % (71,1 % en 2 bits).
- Decodificación especulativa mediante la capa MTP conservada del modelo original.
- Tool calling, modo agente y contextos largos: no probados por el autor en esta cuantización.

## Casos de uso

- Despliegue de un MoE de gran escala en hardware de gama profesional: con 79,7 GB en PTQ1_0, el modelo cabe en configuraciones multi-GPU de 96 GB o superiores (tres Intel Arc Pro B70, DGX Spark GB10), lo que permite servir un modelo de 320 000 millones de parámetros sin infraestructura de centro de datos.
- Razonamiento aritmético y resolución de problemas matemáticos: el 95,2 % en GSM8K con cuantización ternaria lo hace apto para tareas de cálculo paso a paso donde el conocimiento factual no es crítico.
- Generación de respuestas con formato estricto: el 68,5 % en IFEval y la mejora obtenida al entrenar con preguntas de opción múltiple indican un uso razonable en extracción de respuestas cortas y formularios con restricciones verificables.
- Investigación en cuantización extrema: sirve como referencia reproducible para estudiar el impacto de pesos ternarios y destilación de escalas en modelos MoE de gran tamaño, comparando contra las variantes de 2 y 4 bits del mismo autor.
- Evaluación de kernels y motores de inferencia: los dos formatos de empaquetado (PTQ1_0 y Q2_0) permiten comparar el coste del desempaquetado en base 3 frente al ahorro de ancho de banda de memoria en GPUs Intel.
- Prototipado de asistentes con decodificación especulativa: la capa MTP conservada permite medir ganancias de throughput (unos 61 tok/s en Q2_0 y 56 tok/s en PTQ1_0 sobre tres B70) en entornos con presupuesto de memoria ajustado.

## Benchmarks y rendimiento

Mediciones del autor con pensamiento desactivado, temperatura 0 y una petición simultánea. La columna ternaria corresponde al fichero Q2_0 sobre tres Intel Arc Pro B70.

| Test | Ternario (T3) | Versión 2 bits | Fuente 4 bits |
|---|---:|---:|---:|
| MMLU-Pro (280 preguntas) | 53,2 % | 61,4 % | 62,9 % |
| GSM8K (440 preguntas) | 95,2 % | 97,0 % | 96,8 % |
| IFEval (422 prompts) | 68,5 % | 71,1 % | no medido |

El fichero PTQ1_0, ejecutado en una DGX Spark (GB10) con llama.cpp modificado y capas densas en Q4_0, obtuvo GSM8K 95,5 %, IFEval 69,0 % y MMLU-Pro 52,9 %. El coste de la cuantización ternaria es de unos 8 puntos de MMLU-Pro frente a la versión de 2 bits, mientras que aritmética y seguimiento de instrucciones se mantienen próximos.

## Requisitos de hardware

- VRAM estimada: 79,7 GB para el fichero PTQ1_0 y 98,7 GB para el Q2_0, más el espacio de contexto y el estado de inferencia.
- GPU validadas por el autor: tres Intel Arc Pro B70 (fichero Q2_0) y una DGX Spark GB10 (fichero PTQ1_0 con llama.cpp modificado y densas en Q4_0).
- No cabe en GPUs de consumo de 24 GB ni de 48 GB; requiere configuraciones multi-GPU o aceleradores de memoria unificada de gama profesional.
- Motores de despliegue: no carga en llama.cpp upstream. Solo se ha probado en una versión local modificada de XeStrata (GPUs Intel, ambos ficheros) y en un llama.cpp modificado (PTQ1_0). Esos cambios no están publicados.
- Ajuste recomendado en XeStrata: desactivar el intercambio adaptativo de expertos con `--adapt-every 0`, ya que con él activo las respuestas se degradan tras una carga de trabajo variada.
- Throughput medido en tres B70 con borrador MTP: aproximadamente 61 tok/s con Q2_0 y 56 tok/s con PTQ1_0, ya que el desempaquetado en base 3 cuesta más que el ahorro de lectura en esa tarjeta.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño | MMLU-Pro | GSM8K | Licencia |
|---|---|---:|---:|---:|---:|---|
| Este modelo (T3, Q2_0) | 320B totales / 18B activos | GGUF ternario | 98,7 GB | 53,2 % | 95,2 % | NVIDIA Open Model Agreement |
| izagami/GLM-5.3-Flash-FP4-Q2-GGUF | 320B totales / 18B activos | GGUF Q2_0 | 98,7 GB | 61,4 % | 97,0 % | NVIDIA Open Model Agreement |
| GLM-5.3-Flash-FP4-Local (4 bits) | 320B totales / 18B activos | NVFP4 | 184,4 GB | 62,9 % | 96,8 % | NVIDIA Open Model Agreement |
| unsloth/GLM-5.3-Flash-GGUF | 320B totales / 18B activos | GGUF (varias cuantizaciones) | no disponible | no disponible | no disponible | MIT |

## Limitaciones y advertencias

- Pérdida de conocimiento factual: MMLU-Pro cae unos 8 puntos frente a la versión de 2 bits y cerca de 10 frente al build de 4 bits.
- La carga requiere versiones modificadas y no publicadas de llama.cpp o XeStrata; no funciona en llama.cpp upstream, lo que bloquea su uso en producción estándar.
- Tool calling, modo de razonamiento y contextos largos no han sido probados por el autor.
- Riesgo de razonamiento no deseado: con plantillas que terminan en `<think>` cuando el pensamiento está desactivado, es necesario añadir `</think>`; de lo contrario, IFEval cae del 69 % al 48 %.
- Metadatos incorrectos en el GGUF: `general.license` indica `mit` y `general.quantized_by` indica `Unsloth`, heredados del fichero de origen. No describen estos ficheros; la licencia aplicable es la NVIDIA Open Model Agreement.
- La licencia NVIDIA Open Model Agreement impone condiciones propias para uso comercial; conviene revisar el texto antes de desplegar.
- La subida de ficheros estaba en curso en la fecha de creación (2026-11-09); debe verificarse el `SHA256SUMS` cuando estén ambos disponibles.
- Idiomas soportados no documentados en esta variante.
- Alucinación: no se han publicado evaluaciones de factualidad ni de tasas de alucinación para esta cuantización.
- Sesgos: no documentados; se heredan los del modelo base, no evaluados aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/izagami/GLM-5.3-Flash-FP4-T3-GGUF
- Versión de 2 bits del mismo autor: https://huggingface.co/izagami/GLM-5.3-Flash-FP4-Q2-GGUF
- Modelo base en NVIDIA: https://huggingface.co/nvidia/GLM-5.3-Flash-FP4-Local
- GGUF de origen (unsloth): https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Modelo original de Z.ai: https://huggingface.co/zai-org/GLM-5.3-Flash
- Ficha en NVIDIA NIM: https://build.nvidia.com/z-ai/glm-5-3-flash/modelcard
- Motor XeStrata: https://github.com/MistVVK/XeStrata
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
