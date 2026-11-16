# DMAIC-ASI/Qwen3.8-27B-DMAIC_ASI-S16-GGUF

## Resumen
Qwen3.8-27B-DMAIC_ASI-S16 es una cuantizacion mixta en formato GGUF del modelo base Qwen/Qwen3.8-27B, desarrollada por DMAIC ASI Research. El objetivo declarado es ejecutar un modelo de 27.320.697.856 parametros en una GPU de 16 GB con aproximadamente 120.000 tokens de contexto, algo que solo es posible combinando un archivo de pesos de 13,2 GB con una cache KV en formato NVFP4. La cuantizacion conserva el cabezal de prediccion multi-token (MTP) del modelo original, lo que permite emplear decodificacion especulativa y aumentar el rendimiento en inferencia.

El archivo es un GGUF estandar que carga en llama.cpp de serie, pero la ventana de contexto de 120k solo se alcanza con la compilacion especifica del repositorio llama.cpp-nvfp4-kv, orientada a GPUs NVIDIA de la serie RTX 50 (arquitectura Blackwell, `sm_120a`). En otras GPU o en llama.cpp estandar hay que recurrir a una cache KV convencional (por ejemplo `q8_0`) y reducir el contexto.

La relevancia de esta ficha radica en que documenta una tecnica de cuantizacion agresiva orientada a hardware de consumo, con metricas de divergencia KL publicadas frente a una referencia Q8_0. No obstante, la informacion disponible sobre el modelo base (idiomas, benchmarks, datos de entrenamiento) es muy limitada, por lo que varias filas de especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); cuantizacion mixta GGUF con cabezal MTP integrado |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 120.064 tokens (probado con cache KV NVFP4 en RTX 5070 Ti de 16 GB); menor con cache KV convencional |
| Tipos de cuantizacion | Cuantizacion mixta por tensor (tipos elegidos por capa segun presupuesto de 16 GB), redondeo estilo GPTQ, capas FFN menos sensibles adelgazadas, cabeza de salida Q5_K; cache KV en NVFP4 (o `q8_0` en llama.cpp estandar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.8-27B-DMAIC_ASI-S16.gguf`, 13.207.095.840 bytes) |

## Arquitectura y entrenamiento
El modelo base es Qwen/Qwen3.8-27B, del equipo Qwen, con licencia Apache-2.0. La ficha disponible no detalla la arquitectura interna del modelo base (tipo de atencion, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF o DPO), por lo que esos datos deben consultarse en la model card original de Qwen. Lo que si se conoce es que el checkpoint incluye un cabezal de prediccion multi-token (MTP) integrado, que la cuantizacion preserva de forma explicita para habilitar decodificacion especulativa.

La innovacion tecnica principal de esta publicacion es el proceso de cuantizacion: se trata de una cuantizacion de precision mixta en la que el tipo de cada tensor se elige para ajustarse al presupuesto de 16 GB, aplicando redondeo estilo GPTQ sobre covarianzas de calibracion, adelgazando las capas FFN menos sensibles y dejando la cabeza de salida en Q5_K. El autor parte de la imatrix publicada por Unsloth y de su layout por tensor UD-Q3_K_XL. El resultado es un archivo de 13,2 GB que, junto con una cache KV NVFP4, permite sostener 120.064 tokens de contexto con unos 15,4 GB de memoria en uso en una RTX 5070 Ti.

## Capacidades
- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta incluye `conversational`.
- Razonamiento en modo thinking y modo no-thinking: la model card del base recomienda parametros de muestreo distintos para cada modo (temperatura 1.0 / top_p 0.95 / top_k 20 en thinking; temperatura 0.7 / top_p 0.8 / top_k 20 / presence_penalty 1.5 en no-thinking).
- Decodificacion especulativa mediante el cabezal MTP conservado, con soporte de `--spec-type draft-mtp,ngram-simple` en la compilacion de llama.cpp-nvfp4-kv.
- Contexto largo: hasta 120.064 tokens en el escenario probado, lo que habilita tareas de recuperacion y resumen sobre documentos extensos.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con APIs compatibles, aunque no se detalla el alcance.
- Capacidades multimodales: no disponibles; el archivo contiene solo el modelo de texto y el cabezal MTP, sin proyector de vision.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso
- Asistente conversacional local con contexto largo: el modelo puede mantener conversaciones multi-turno sobre documentos extensos gracias a los 120.064 tokens de contexto en una GPU de 16 GB, lo que lo hace adecuado para entornos de escritorio sin acceso a servidores dedicados.
- Analisis de repositorios de codigo: con la ventana de contexto completa se pueden cargar varios ficheros fuente y realizar tareas de revision, explicacion o refactorizacion; las metricas de calidad publicadas para texto de codigo (KLD 0.0174 y 96,6 % de coincidencia en el token superior) indican que la cuantizacion preserva bien este dominio.
- Generacion de codigo asistida en local: la conservacion del cabezal MTP permite activar decodificacion especulativa y reducir la latencia en la generacion de codigo, un escenario donde el throughput importa.
- Procesamiento de documentacion tecnica y wikis: los resultados de KLD sobre texto tipo wiki (0.0340, 92,5 % de coincidencia) respaldan su uso en resumen y extraccion de informacion sobre corpus tecnicos.
- Prototipado de agentes y pipelines de IA en hardware de consumo: al ser un GGUF compatible con llama.cpp, se puede desplegar con `llama-server` y exponer una API HTTP local para integrarla en flujos de automatizacion.
- Investigacion sobre cuantizacion y decodificacion especulativa: el repositorio y la compilacion asociada sirven como banco de pruebas para evaluar cache KV NVFP4 y MTP en GPUs Blackwell.
- Despliegue en estaciones de trabajo con una sola RTX 50 de 16 GB: permite ofrecer inferencia de un modelo de 27B sin recurrir a multi-GPU ni a servicios en la nube.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si publica metricas de calidad de la cuantizacion mediante divergencia KL frente a una referencia Q8_0 del checkpoint BF16, con `llama-perplexity --kl-divergence` y fragmentos de 1024 tokens:

| Texto | Fragmentos | KLD media (± error estandar) | Mismo token superior |
|---|---:|---:|---:|
| Codigo | 60 | 0.0174 ± 0.0004 | 96,6 % |
| Wiki | 20 | 0.0340 ± 0.0008 | 92,5 % |
| Mixto | 20 | 0.0483 ± 0.0047 | 94,8 % |

Como referencia de despliegue, el autor indica que en una RTX 5070 Ti de 16 GB (driver 570, CUDA 12.9, Ubuntu 24.04) el modelo ocupa unos 15,4 GB con contexto de 120.064 tokens y MTP activado. No se publican cifras de latencia ni de throughput en tokens por segundo.

## Requisitos de hardware
- VRAM estimada: unos 15,4 GB en uso con contexto de 120.064 tokens y cache KV NVFP4 en el escenario probado; el archivo de pesos por si solo ocupa 13,2 GB.
- GPU recomendadas: NVIDIA RTX 50 (Blackwell, `sm_120a`) para aprovechar la cache KV NVFP4; el autor cita explicitamente la RTX 5070 Ti de 16 GB como plataforma validada.
- En otras GPU o con llama.cpp estandar: es posible cargar el GGUF con una cache KV convencional (por ejemplo `-ctk q8_0 -ctv q8_0`) y un contexto menor; no se especifican modelos concretos ni cifras de VRAM para esos casos.
- Opciones de despliegue: llama.cpp (compilacion `llama.cpp-nvfp4-kv` para NVFP4 y MTP; `llama-server` y `llama-cli` como binarios objetivo). No se mencionan vLLM, TGI, Ollama ni otros motores en la informacion disponible.
- Ajuste de memoria: si el proceso se queda sin memoria al cargar (por ejemplo, por el escritorio grafico usando la misma GPU), el autor recomienda reducir `-c` en pasos de 8192.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de rendimiento ni de especificaciones de alternativas en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A modo de referencia estructural, esta publicacion se relaciona con:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-DMAIC_ASI-S16 (este) | 27.320.697.856 | 120.064 (con KV NVFP4) | Apache-2.0 | Cuantizacion mixta GGUF de 13,2 GB con MTP |
| Qwen/Qwen3.8-27B (base) | 27.320.697.856 | no disponible | Apache-2.0 | Checkpoint BF16 original; requiere mucha mas VRAM |
| Referencia Q8_0 del BF16 | 27.320.697.856 | no disponible | Apache-2.0 | Usada por el autor como referencia de divergencia KL |

## Limitaciones y advertencias
- La ventana de 120k tokens depende de la cache KV NVFP4 y de la compilacion `llama.cpp-nvfp4-kv`; en llama.cpp estandar el contexto debe reducirse y la cache KV debe configurarse de forma convencional.
- La cache KV NVFP4 requiere GPUs RTX 50 (Blackwell); en otras GPU no esta disponible segun la informacion del autor.
- El archivo no incluye proyector de vision; no admite entrada de imagenes.
- La cuantizacion introduce perdida de fidelidad respecto al BF16: la divergencia KL es mayor en texto mixto (0.0483) que en codigo (0.0174), por lo que el deterioro no es uniforme entre dominios.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion especifico, idiomas soportados ni evaluaciones de seguridad; deben asumirse los del modelo base.
- El uso comercial esta permitido por la licencia Apache-2.0, pero conviene verificar los terminos del modelo base Qwen/Qwen3.8-27B y las atribuciones a Unsloth (imatrix y layout por tensor) y a llama.cpp (MIT).
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 16 de noviembre de 2026; se trata de una publicacion muy reciente y sin validacion independiente.
- La informacion sobre soporte de tool calling, agentes y capacidades multilingues no esta disponible, lo que limita su adopcion en produccion sin evaluacion previa.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DMAIC-ASI/Qwen3.8-27B-DMAIC_ASI-S16-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Compilacion de llama.cpp con cache KV NVFP4: https://github.com/DMAIC-ASI-Research/llama.cpp-nvfp4-kv
- Guia paso a paso: https://github.com/DMAIC-ASI-Research/llama.cpp-nvfp4-kv/blob/main/NVFP4-HOWTO.md
- Guia para agentes: https://github.com/DMAIC-ASI-Research/llama.cpp-nvfp4-kv/blob/main/SETUP-AGENT.md
- llama.cpp (repositorio principal): https://github.com/ggml-org/llama.cpp
- Unsloth (imatrix y layout por tensor): https://huggingface.co/unsloth
