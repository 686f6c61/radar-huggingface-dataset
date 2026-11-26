# mradermacher/Tenet-32B-Qwen3-Unslop-v2-i1-GGUF

## Resumen

Tenet-32B-Qwen3-Unslop-v2-i1-GGUF es una coleccion de cuantizaciones GGUF (con y sin imatrix) del modelo Tenet-32B-Qwen3-Unslop-v2, desarrollado originalmente por mr-andrey-isachenko sobre la base de Qwen3-32B. El autor de esta publicacion, mradermacher, es un conocido creador de cuantizaciones para llama.cpp y otros runners, y aqui ofrece el conjunto completo de variantes i1 (imatrix) que van desde IQ1_S hasta Q6_K. El modelo base es un fine-tune de Qwen3-32B orientado a razonamiento, uso agentico, tool calling y codigo, con un proceso de "unslop" (limpieza de estilo y comportamiento) y variantes "abliterated/uncensored" segun los tags del repositorio.

El modelo subyacente cuenta con 32.762.123.264 parametros (aproximadamente 32,8 mil millones) en una arquitectura transformer densa derivada de Qwen3, con licencia Apache 2.0. Esta publicacion concreta no aporta pesos en safetensors sino unicamente ficheros GGUF cuantizados, pensados para inferencia local con llama.cpp, Ollama o LM Studio, y no para despliegue en vLLM (que requeriria los pesos originales en FP8/BF16 del modelo base).

La relevancia de esta ficha radica en que permite ejecutar un modelo de 32B con capacidades de razonamiento y agenticas en hardware de consumo, a costa de una perdida de calidad que depende fuertemente del nivel de cuantizacion elegido. Es, por tanto, una opcion practica para prototipado local y experimentacion, no tanto para produccion de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3 (no se especifica en la model card; inferido del modelo base Qwen3-32B) |
| Parametros totales | 32.762.123.264 (32,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (segun la model card; el modelo base Qwen3 soporta multilingue, pero no se detalla aqui) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La model card de esta publicacion no describe la arquitectura ni el proceso de entrenamiento del modelo base; se limita a indicar que se trata de cuantizaciones i1 (imatrix) de mr-andrey-isachenko/Tenet-32B-Qwen3-Unslop-v2. Por el nombre y los tags (qwen3, reasoning, thinking, grpo, abliterated, uncensored, agentic, tool-use, coding) se deduce que el modelo base parte de Qwen3-32B y ha sido sometido a un fine-tune con GRPO (optimizacion de politica con recompensas) y a un proceso de "unslop" para eliminar respuestas genericas y mejorar el estilo y la utilidad. Los tags "abliterated" y "uncensored" indican que se ha aplicado una tecnica de ablacion de direcciones de rechazo para reducir las negativas del modelo.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO adicionales. Tampoco se detalla ninguna innovacion arquitectonica propia: el modelo hereda la arquitectura de Qwen3-32B, que en su version original incluye atencion con RoPE, GQA y modos de razonamiento (thinking) activables. La cuantizacion i1 utiliza una matriz de importancia (imatrix) calculada sobre un corpus de calibracion para preservar mejor los pesos relevantes en niveles bajos de bits.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de modo "thinking" (razonamiento explicito) segun los tags del repositorio.
- Razonamiento multi-paso y resolucion de problemas, orientado por el fine-tune con GRPO.
- Generacion de codigo y asistencia en tareas de programacion (tag "coding").
- Tool calling y function calling para integracion en agentes (tags "tool-use" y "agentic").
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones, segun los tags del autor.
- Capacidades multilingues del modelo base Qwen3 potencialmente presentes, aunque la model card solo declara ingles.
- No se documentan capacidades de vision ni audio en esta publicacion.

## Casos de uso

- Prototipado local de agentes: el modelo puede ejecutarse con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo y usarse para probar flujos de tool calling antes de migrar a un despliegue en vLLM con los pesos originales.
- Asistente de codigo en el editor: con la variante i1-Q4_K_M (19,9 GB) puede integrarse en plugins tipo Continue o similar para autocompletado y explicacion de codigo, aceptando la perdida de calidad frente al modelo completo.
- Razonamiento offline en entornos sin conectividad: al ser un GGUF local, permite desplegar un asistente de analisis y sintesis en maquinas aisladas, util en entornos de investigacion con requisitos de confidencialidad.
- Experimentacion con modelos "uncensored": para investigadores que estudian el comportamiento de modelos con ablacion de rechazo, esta variante permite comparar respuestas frente al Qwen3 original.
- Generacion de documentacion tecnica y resumenes: con contexto suficiente (heredado del modelo base) puede procesar documentos largos en ingles y producir resumenes estructurados.
- Evaluacion comparativa de cuantizaciones: el amplio conjunto de variantes (de IQ1_S a Q6_K) permite medir el impacto de la cuantizacion en tareas de razonamiento y codigo sobre un mismo modelo base.
- Despliegue en estaciones con una sola GPU de 24 GB: la variante i1-IQ3_M (15,0 GB) o i1-Q4_K_S (18,9 GB) cabe en tarjetas como la RTX 4090, permitiendo inferencia interactiva sin servidor dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: desde ~7,4 GB (i1-IQ1_S, calidad muy degradada) hasta ~27,0 GB (i1-Q6_K). La variante recomendada i1-Q4_K_M ocupa 19,9 GB y requiere al menos 22-24 GB de VRAM para caber completa, o menos si se descargan capas a CPU.
- GPU recomendadas: RTX 4090 (24 GB) para i1-Q4_K_M o i1-Q4_K_S; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para las variantes Q5/Q6 y para mayor velocidad.
- GPU de consumo: si, cabe en RTX 4090/3090 con cuantizaciones Q4; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo caben variantes IQ3 o IQ2, con perdida notable de calidad; en GPUs de 12 GB (RTX 4070) solo IQ2 o IQ1, no recomendadas para uso serio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y otros runners compatibles con GGUF. vLLM no es aplicable a estos ficheros GGUF (los tags "vllm" y "fp8" del repositorio se refieren al modelo base, no a esta publicacion).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tenet-32B-Qwen3-Unslop-v2-i1-GGUF (este) | 32,8B | no disponible | Apache 2.0 | GGUF | Fine-tune de Qwen3-32B con GRPO, unslop y ablacion; solo cuantizaciones |
| Qwen3-32B (original) | 32,8B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo base oficial de Alibaba, con modo thinking; referencia de calidad |
| Tenet-32B-Qwen3-Unslop-v2 (base de este) | 32,8B | no disponible | Apache 2.0 | safetensors | Pesos completos del fine-tune, necesarios para vLLM o FP8 |
| Gemma 3 27B | ~27B | no disponible en esta ficha | Gemma license | safetensors, GGUF | Alternativa de tamano similar con capacidades multimodales; licencia mas restrictiva |

La comparativa se limita a datos de parametros y licencia, ya que no se dispone de resultados de benchmarks para el modelo de esta ficha.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de calidad; las variantes IQ1 e IQ2 son explicitamente calificadas por el autor como "for the desperate" o "very low quality" y no deberian usarse en produccion.
- El proceso "abliterated/uncensored" reduce los rechazos del modelo, lo que puede aumentar el riesgo de generar contenido inapropiado o danino; requiere filtros y politicas de uso adicionales en cualquier despliegue publico.
- Riesgo de alucinacion inherente a los modelos de 32B, agravado por la cuantizacion en niveles bajos.
- La model card solo declara ingles; el rendimiento en castellano no esta documentado y puede ser inferior al del modelo base Qwen3.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3 tiene sus propias condiciones (tambien Apache 2.0 en la version 32B, segun la informacion disponible); conviene verificar la procedencia del fine-tune antes de un uso comercial.
- No hay informacion sobre el dataset de entrenamiento del fine-tune, lo que impide evaluar sesgos especificos introducidos por el mismo.
- Esta publicacion no incluye pesos en safetensors ni FP8; para vLLM o TGI hay que acudir al modelo base.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mradermacher/Tenet-32B-Qwen3-Unslop-v2-i1-GGUF
- Modelo base del fine-tune: https://huggingface.co/mr-andrey-isachenko/Tenet-32B-Qwen3-Unslop-v2
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Tenet-32B-Qwen3-Unslop-v2-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Tenet-32B-Qwen3-Unslop-v2-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
