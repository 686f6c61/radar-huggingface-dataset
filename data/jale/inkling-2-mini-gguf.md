# jale/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje multimodal desarrollado por Thinking Machines, distribuido originalmente en su repositorio oficial y aquí publicado por el usuario `jale` en formato GGUF. Se trata de un modelo de aproximadamente 26.200 millones de parámetros (26.197.792.256 según los pesos en safetensors), con arquitectura denominada `inkling2_loop` en el ecosistema GGML, que combina atención y capas recurrentes, e incluye un proyector visual (`inkling2v`) para entrada de imágenes. Esta ficha describe la conversión GGUF, no el checkpoint original.

La relevancia de esta publicación radica en su estrategia de cuantización: en lugar de recuantizar los pesos, preserva las bancadas NVFP4 (expertos enrutados de las capas 0-19) y MXFP8 (expertos de las capas 20-23) tal como vienen en el checkpoint original, repackadas como bloques GGML de tipo 40 y tensores F8_E4M3 de tipo 43. El resto de tensores se mantienen en BF16 y F32. Esto permite ejecutar el modelo con un peso de fichero de aproximadamente 18,97 GB, muy por debajo de lo que exigiría una conversión BF16 completa.

Además, el repositorio incluye dos artefactos auxiliares poco habituales: un proyector visual en BF16 (`mmproj-Inkling-2-Mini-BF16.gguf`, 637 MB) y un borrador de decodificación especulativa DSpark (`dspark-Inkling-2-Mini-Q8_0.gguf`, 402 MB) con tres capas, tamaño de bloque 8 y una cabeza de Markov recurrente, lo que habilita aceleración por speculative decoding en motores compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer con capas recurrentes y mezcla de expertos; proyector visual `inkling2v`) |
| Parametros totales | 26.197.792.256 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (tipo GGML 40) para expertos enrutados de capas 0-19; MXFP8 / F8_E4M3 (tipo GGML 43) para expertos de capas 20-23; BF16 y F32 para el resto; Q8_0 y BF16 en el borrador especulativo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (NVFP4, MXFP8, BF16, F32); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura declarada en el GGUF es `inkling2_loop`, que combina capas de atención con capas recurrentes y una estructura de mezcla de expertos (MoE) distribuida de forma heterogénea: los expertos enrutados de las capas 0 a 19 provienen de bancadas NVFP4 del checkpoint, mientras que los de las capas 20 a 23 provienen de bancadas MXFP8. Las filas de los expertos gate/up se han des-intercalado a un layout `[gate; up]`. El modelo base es `thinkingmachines/Inkling-2-Mini`, revisión `6e7c8248f75265bdd4fbab5273304243b5d8c2cb`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento. La innovación técnica documentada en esta conversión es la preservación exacta de las cuantizaciones de origen (NVFP4 y MXFP8) sin pérdida adicional, junto con la inclusión de un borrador especulativo DSpark que lee el estado parcial del modelo objetivo en las capas 5, 23, 41 y 48 (`dflash.target_layers = [5, 23, 41, 48]`), con tamaño de bloque 8 y cabeza de Markov recurrente de tres capas.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Procesamiento de entrada visual mediante el proyector `mmproj-Inkling-2-Mini-BF16.gguf`, con parches de embedding lineal dispuestos como convolución `[1024, 3, 20, 20]`.
- Decodificación especulativa acelerada mediante el borrador DSpark incluido, que reutiliza el embedding de tokens y la cabeza de salida del modelo objetivo.
- Soporte de mezcla de expertos con cuantizaciones mixtas NVFP4/MXFP8, orientado a inferencia eficiente en memoria.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Despliegue conversacional en servidores con GPU de gama alta: el fichero NVFP4 de 18,97 GB permite servir un modelo de 26.200 millones de parámetros en una sola GPU con 24-48 GB de VRAM, usando motores compatibles con los tipos GGML NVFP4 y F8_E4M3.
- Asistentes con entrada de imagen: cargando el proyector `mmproj-Inkling-2-Mini-BF16.gguf` junto al modelo principal, se puede construir un asistente multimodal que responda a consultas sobre capturas, diagramas o documentos escaneados.
- Inferencia de baja latencia con decodificación especulativa: el borrador DSpark Q8_0 de 402 MB permite generar varios tokens por paso en motores que soporten DSpark, reduciendo el coste por token en cargas interactivas.
- Investigación sobre cuantizaciones de bloques: el repositorio sirve como referencia práctica para estudiar el repacking de NVFP4 a bloques GGML tipo 40 y de MXFP8 a tensores F8_E4M3 tipo 43, útil para quienes desarrollan herramientas de conversión.
- Evaluación comparativa de checkpoints cuantizados: al mantener los pesos sin cambios respecto al checkpoint original, permite medir el impacto real de la cuantización NVFP4/MXFP8 frente a una conversión BF16 de referencia.
- Prototipado de pipelines agénticos multi-turno: la etiqueta `conversational` y la compatibilidad con endpoints facilitan integrar el modelo en orquestadores de agentes, siempre que el motor de inferencia soporte la arquitectura `inkling2_loop`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19 GB solo para los pesos del fichero NVFP4, más overhead de contexto y caché KV; se recomienda un mínimo de 24 GB de VRAM para contextos cortos.
- Proyector visual: 637 MB adicionales en BF16 si se requiere entrada de imagen.
- Borrador especulativo: 402 MB adicionales en Q8_0 si se activa DSpark.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para el modelo principal; el modelo no cabe en GPUs consumer de 16 GB o menos sin recurrir a offloading a CPU.
- Despliegue: se requiere un motor con soporte de la arquitectura `inkling2_loop` y de los tipos de tensor NVFP4 (40) y F8_E4M3 (43); para imagen, soporte del proyector `inkling2v`; para especulación, soporte de borradores DSpark. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini (esta conversion GGUF) | 26.197.792.256 | no disponible | Apache 2.0 | GGUF (NVFP4/MXFP8/BF16/F32) | Incluye proyector visual y borrador especulativo DSpark |
| thinkingmachines/Inkling-2-Mini (original) | 26.197.792.256 | no disponible | Apache 2.0 | safetensors | Checkpoint de referencia, sin cuantizar |
| ggml-org/Inkling-2-Mini-GGUF | 26.197.792.256 | no disponible | Apache 2.0 | GGUF | Conversión de referencia del ecosistema GGML, usada como fuente de metadatos |

No se dispone de información sobre modelos alternativos de otros desarrolladores con características comparables para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- La información disponible no incluye datos sobre sesgos, alineamiento ni evaluación de seguridad del modelo original.
- Riesgo de alucinación: no evaluado en la información proporcionada; debe asumirse el riesgo habitual de los modelos generativos.
- La cuantización NVFP4/MXFP8 preserva los pesos del checkpoint, pero no se documenta la pérdida de calidad respecto a BF16.
- El motor de inferencia debe soportar tipos de tensor poco comunes (NVFP4 tipo 40, F8_E4M3 tipo 43) y la arquitectura `inkling2_loop`; la mayoría de herramientas estándar no los soportan de serie.
- El borrador especulativo depende de los estados parciales de las capas 5, 23, 41 y 48 del objetivo; un cambio de checkpoint o de arquitectura lo invalidaría.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia y model card del repositorio original de Thinking Machines.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que limita la planificación de despliegues en producción.
- El repositorio tiene 585 descargas y 0 likes en el momento de la consulta, sin validación comunitaria amplia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jale/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Conversión GGUF de referencia: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Revisión del modelo base: `6e7c8248f75265bdd4fbab5273304243b5d8c2cb`
- Revisión de la conversión de referencia: `db61c5b492a6a034d986328d28274af0a439aa6c`
