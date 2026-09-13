# AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16

## Resumen

Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 es un ajuste fino derivado del modelo base Qwen/Qwen3.6-27B, publicado por el usuario AEON-7 bajo licencia Apache 2.0. Se trata de una variante "abliterated" o "refusal-removed": mediante una pasada de abliteracion (denominada v8 en la model card) se ortogonalizan los pesos que escriben en el flujo residual del modelo de lenguaje, con el objetivo de eliminar los rechazos aprendidos sin reentrenar el modelo. El checkpoint se distribuye en BF16 con 27.356.728.560 parametros (~27,36 B) y un tamano de repositorio de 55,6 GB, en formato safetensors y compatible con la libreria transformers.

Arquitectonicamente hereda el caracter hibrido de la familia Qwen3.6: las etiquetas del repositorio apuntan a atencion hibrida con atencion lineal, componentes de espacio de estados tipo Mamba, capas Gated DeltaNet (GDN) y soporte multimodal de tipo image-text-to-text. El modelo esta orientado a uso agentico de produccion: soporta tool calling y function calling, modo de razonamiento (thinking), contexto largo de hasta 131.072 tokens en la receta de despliegue recomendada, y decodificacion especulativa mediante la cabeza MTP restaurada del modelo base (15 tensores, ~0,85 GB) o mediante el drafter externo DFlash.

Su relevancia actual es doble. Por un lado, sirve como referencia BF16 para flujos de fine-tuning y para hardware Hopper/Ampere, donde las variantes cuantizadas a NVFP4 del mismo autor no son la opcion natural. Por otro, la propia model card indica que este checkpoint ha sido superado por Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED, que se presenta como la linea recomendada para trabajo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal y Gated DeltaNet, componentes SSM tipo Mamba y capacidades multimodales (segun etiquetas del repositorio: hybrid, hybrid-attention, linear-attention, mamba, gated-deltanet, gdn) |
| Parametros totales | 27.356.728.560 (~27,36 B), dato real de safetensors |
| Parametros activos | No aplica; la informacion disponible no describe el modelo como MoE |
| Longitud de contexto | 131.072 tokens en la receta vLLM publicada; hasta 262.144 tokens en configuraciones con VRAM dedicada (RTX PRO 6000 96 GB) |
| Tipos de cuantizacion | BF16 nativo en este repositorio; el mismo autor publica variantes NVFP4 y NVFP4+FP8 mixtas de la familia. El contenedor soporta KV cache NVFP4 (PR #44389) y TurboQuant K8V4 |
| Idiomas soportados | Ingles, chino, multilingue (segun model card; el espanol no figura como idioma declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), 55,6 GB de repositorio, library_name: transformers |
| Modelo base | Qwen/Qwen3.6-27B |
| Pipeline declarado | text-generation (con etiquetas adicionales de image-text-to-text) |
| Fecha de publicacion / actualizacion | 2026-04-24 / 2026-09-12 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-27B y conserva su estructura hibrida: capas de atencion completa combinadas con atencion lineal y Gated DeltaNet, junto con componentes de espacio de estados de inspiracion Mamba. Esta mezcla busca reducir el coste de memoria y computo en secuencias largas frente a un transformer denso puro, y es coherente con el soporte declarado de contexto largo y de cache Mamba (el comando de servicio incluye `--mamba-cache-dtype float32`). Ademas, el repositorio declara capacidades de vision (image-text-to-text, vision-language), lo que implica un codificador visual integrado en la arquitectura.

El proceso de adaptacion descrito no es un reentrenamiento: la pasada de abliteracion v8 ortogonaliza unicamente los pesos que escriben en el flujo residual del modelo de lenguaje, eliminando la tendencia a rechazar peticiones. La model card insiste en que no se realizo ningun reentrenamiento. Como complemento, el repositorio restaura la cabeza MTP (`mtp.*`, 15 tensores, ~0,85 GB) procedente del modelo base, lo que habilita decodificacion especulativa con `qwen3_5_mtp` en vLLM sin pasos adicionales; segun las mediciones publicadas en la propia card, la abliteracion no degrada la distribucion top-K de la que depende el MTP. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO en el material proporcionado.

## Capacidades

- Generacion de texto conversacional y de instrucciones, en registro chat/instruct.
- Razonamiento explicito mediante modo thinking, con parser de razonamiento `qwen3` en vLLM.
- Generacion de codigo, con parser de tool calling `qwen3_coder` y etiquetas explicitas de coding y fine-tuning.
- Tool calling y function calling (`--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`).
- Flujos agenticos y razonamiento multi-paso (etiquetas agentic y production-ready).
- Capacidades multimodales: procesamiento de imagen y texto (image-text-to-text, vision, vision-language).
- Contexto largo: hasta 131.072 tokens en la configuracion publicada, ampliable a 262.144 en hardware con VRAM dedicada.
- Multilingue declarado en ingles, chino y "multilingual"; el espanol no aparece como idioma soportado de forma explicita.
- Respuestas sin filtros de rechazo (uncensored, unfiltered, refusal-removed), que es la caracteristica diferencial del ajuste.
- Optimizaciones de servicio: prefix caching, chunked prefill, atencion con backend FlashAttention, cache Mamba en float32 y decodificacion especulativa (MTP o drafter DFlash).
- Compatibilidad con API compatible con OpenAI y despliegue multi-GPU.

## Casos de uso

- Agentes de codigo en CI/CD: el modelo puede integrarse como motor de un agente que invoca herramientas (lectura de repositorio, ejecucion de tests, apertura de parches) gracias al soporte nativo de function calling y al parser `qwen3_coder`, que evita tener que parsear manualmente las llamadas.
- Analisis de documentacion tecnica extensa: con 131.072 tokens de contexto puede ingerir especificaciones, libros blancos o bases de codigo completas en una sola pasada, apoyandose en chunked prefill y prefix caching para abaratar peticiones repetidas sobre el mismo prefijo.
- Procesamiento multimodal de documentos: al aceptar entradas de imagen y texto, resulta adecuado para extraer datos de facturas escaneadas, planos, capturas de interfaz o diagramas tecnicos y devolverlos estructurados.
- Generacion de datos sinteticos sin filtros: al no rechazar peticiones, es util para construir datasets de entrenamiento en dominios donde los modelos alineados se niegan a responder (por ejemplo, corpus de ciberseguridad ofensiva, analisis de contenido extremo o simulacion de dialogos adversarios).
- Investigacion en seguridad y alineacion: sirve como sujeto de estudio para medir el efecto de la abliteracion sobre capacidades, calibracion y tasas de rechazo, comparandolo con el modelo base Qwen/Qwen3.6-27B.
- Asistente interno on-premise: para equipos con requisitos de soberania de datos, puede desplegarse en A100/H100 o en DGX Spark con vLLM y exponerse via API compatible con OpenAI, sin salida a servicios externos.
- Base para fine-tuning: al ser un checkpoint BF16 completo (no cuantizado), es el punto de partida natural para LoRA o ajuste completo antes de cuantizar a NVFP4 o FP8 para produccion en Blackwell.
- Razonamiento largo con decodificacion especulativa: en tareas de analisis juridico, financiero o cientifico donde la latencia importa, el uso del drafter DFlash o de la cabeza MTP reduce el coste por token generado manteniendo la calidad del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares en la model card ni en los resultados de busqueda proporcionados). Los unicos datos medidos que aparecen son los relativos a decodificacion especulativa con la cabeza MTP restaurada:

| Metrica | Valor | Entorno |
|---|---|---|
| Longitud media aceptada (MTP) | 3,3 de 3 tokens | DGX Spark |
| Tasa de aceptacion en P0 | ~90 % | DGX Spark |
| Aceptacion media del borrador | 78 % | DGX Spark |
| Comparacion con el modelo base | Comparable, segun la model card | DGX Spark |

Adicionalmente, la card afirma que las variantes NVFP4 de la misma familia son aproximadamente 2 veces mas rapidas y consumen cerca de la mitad de memoria en Spark/Blackwell, pero no se aportan cifras absolutas de throughput (tokens/s) en el material disponible. El repositorio de GitHub del autor se declara como fuente de verdad para los benchmarks medidos de throughput, sin que esos numeros se incluyan aqui.

## Requisitos de hardware

- VRAM estimada solo para pesos (calculo a partir de 27,36 B de parametros): ~54,7 GB en BF16, ~27,4 GB en FP8/INT8 y ~13,7 GB en 4 bits. Estas cifras son estimaciones aritmeticas y no datos publicados por el autor.
- GPU profesionales compatibles: A100 80 GB, H100 80 GB, RTX PRO 6000 96 GB. El repositorio incluye etiquetas explicitas para sm_80, sm_90 y sm_121a (Blackwell).
- Memoria unificada: DGX Spark / GB10 (Grace Blackwell, arm64/aarch64) esta soportado de forma explicita mediante el contenedor unificado.
- GPU de consumo: en BF16 no cabe en tarjetas de 24 GB como la RTX 4090; haria falta recurrir a las variantes cuantizadas NVFP4/FP8 de la misma familia o a cuantizacion propia.
- Recomendacion de memoria del sistema: en GB10 con memoria unificada, `--gpu-memory-utilization` debe quedarse entre 0,6 y 0,7; por encima de ~0,8 el pool compartido CPU+GPU entra en page thrashing y bloquea la maquina, incluso a 0,85.
- Opciones de despliegue: vLLM (via los contenedores `ghcr.io/aeon-7/aeon-vllm-ultimate:latest` para Spark/GB10 y `ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest` para RTX discretas, construidos sobre vLLM 0.23.0), transformers con `--trust-remote-code`, y exposicion de API compatible con OpenAI. No consta soporte de llama.cpp, GGUF ni Ollama en la informacion disponible.
- Configuracion de referencia en Spark: `--max-model-len 131072`, `--max-num-seqs 16`, `--max-num-batched-tokens 8192`, `--enable-chunked-prefill`, `--attention-backend flash_attn`, `--mamba-cache-dtype float32`.
- Escalado con VRAM dedicada: en RTX PRO 6000 96 GB el autor recomienda subir a `--max-num-seqs 32`, `--max-num-batched-tokens 16384` y `--max-model-len 262144`.
- Decodificacion especulativa: MTP integrado con `--speculative-config '{"method":"qwen3_5_mtp","num_speculative_tokens":3}'` o drafter externo DFlash (`z-lab/Qwen3.6-27B-DFlash`) con `num_speculative_tokens: 10`, que anade buffers de verificacion no contabilizados por `gpu-memory-utilization`.
- Latencia y throughput absolutos: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16 | 27,36 B | 131.072 tokens (262.144 en VRAM dedicada) | Ajuste abliterated multimodal y agentico en BF16 | apache-2.0 | Publicado; la card lo marca como superado |
| Qwen/Qwen3.6-27B (base) | 27,36 B (no confirmado en esta busqueda) | no disponible | Modelo base original de Qwen, alineado | no disponible en la informacion proporcionada | Publicado |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | 27 B (no confirmado) | no disponible | Sucesor de la misma linea, cuantizacion mixta NVFP4 + FP8 | no disponible en la informacion proporcionada | Recomendado por el autor para trabajo nuevo |

No se dispone de datos de benchmarks que permitan comparar rendimiento numerico con alternativas de la misma categoria (por ejemplo, otros modelos abliterated de ~30 B). La comparativa anterior se limita a lo declarado en la propia model card.

## Limitaciones y advertencias

- La abliteracion elimina los rechazos aprendidos: el modelo cumplira peticiones que modelos alineados rechazan. Esto es un riesgo directo en despliegues de cara al publico y puede entrar en conflicto con politicas de uso aceptable de proveedores cloud y con normativa aplicable.
- La licencia apache-2.0 permite uso comercial, pero no exime al desplegador de responsabilidad legal sobre las salidas generadas, especialmente en contenido danino, difamatorio o ilegal.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de calibracion para este checkpoint; la ausencia de rechazos puede aumentar la confianza aparente en respuestas incorrectas.
- Idiomas declarados: ingles, chino y "multilingue". El espanol no figura como idioma soportado explicitamente, por lo que la calidad en castellano no esta garantizada ni medida.
- El modelo esta marcado por el propio autor como superado por Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED, que se describe como muy superior en capacidad y con mejor metodologia de cuantizacion. Usarlo para trabajo nuevo implica partir de una generacion anterior de la linea.
- Compatibilidad de despliegue dependiente del contenedor: el stack recomendado es un build propio de vLLM 0.23.0 con parches para sm_121a (DFlash, NVFP4 KV cache, TurboQuant K8V4), lo que anade dependencia de un artefacto de terceros y reduce la portabilidad respecto a un vLLM estandar.
- En memoria unificada (GB10 / DGX Spark) la ventana segura de `gpu-memory-utilization` es estrecha (0,6-0,7); configuraciones mas agresivas provocan bloqueos.
- No consta publicacion de pesos GGUF ni soporte declarado para llama.cpp u Ollama, lo que limita el despliegue en entornos de CPU o en hardware de consumo sin GPU de gran memoria.
- El repositorio ocupa 55,6 GB en BF16, lo que exige infraestructura de almacenamiento y transferencia considerable.
- Las fechas de publicacion y actualizacion que acompanan a la ficha (2026) no han podido contrastarse con ninguna fuente externa en los resultados de busqueda disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Sucesor recomendado por el autor: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Repositorio de despliegue, benchmarks y AGENTS.md: https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash
- Contenedor vLLM Ultimate (Spark / GB10): https://github.com/AEON-7/vllm-ultimate-dgx-spark
- Contenedor en GitHub Container Registry (Spark / GB10): ghcr.io/aeon-7/aeon-vllm-ultimate:latest
- Contenedor en GitHub Container Registry (RTX discretas): ghcr.io/aeon-7/aeon-vllm-ultimate-rtx:latest
- Drafter DFlash para decodificacion especulativa: https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
- Discusion #6 sobre la cabeza MTP y la abliteracion: https://huggingface.co/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-BF16/discussions/6
- Referencias arXiv citadas en las etiquetas del repositorio: https://arxiv.org/abs/2503.00555, https://arxiv.org/abs/2512.13655, https://arxiv.org/abs/2406.11717 (los titulos no se especifican en la informacion proporcionada)
- Nota sobre la busqueda web: los resultados de busqueda facilitados no contienen informacion relevante sobre el modelo (devuelven contenidos no relacionados de loterias y foros), por lo que no se han podido incorporar enlaces o datos adicionales de fuentes externas.
