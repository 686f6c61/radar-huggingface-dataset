# callxmexneo/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF

## Resumen

Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF es una version cuantizada en formato GGUF del modelo DeepSeek-V4-Flash-0731 de DeepSeek, a la que se le ha aplicado una tecnica de "abliteration" para eliminar los mecanismos de rechazo (refusals) del modelo original. El resultado es un modelo sin censura (uncensored) orientado a investigacion y entornos controlados. La cuantizacion la firma antirez (creador de Redis y del runtime ds4), mientras que la ablacion corre a cargo de huihui-ai, y el repositorio lo publica el usuario callxmexneo.

El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 284.334.567.511 parametros totales (segun los safetensors del modelo original), lo que lo situa en la categoria de modelos de gran escala. La version GGUF esta pensada para ejecutarse en hardware de consumo y Apple Silicon mediante llama.cpp y ds4, con cuantizaciones agresivas de 2 y 4 bits (IQ2_XXS, Q2_K, Q4_K) y soporte de contexto de hasta 262.144 tokens en llama-cli.

Su relevancia actual radica en dos factores: por un lado, permite ejecutar localmente un modelo MoE de gran tamano en configuraciones de VRAM limitada gracias a la cuantizacion extrema; por otro, la abliteracion lo convierte en una herramienta de investigacion sobre alineamiento y seguridad de LLM, ya que permite estudiar el comportamiento del modelo sin las capas de rechazo. No obstante, el propio autor advierte de que no es apto para produccion ni para aplicaciones comerciales de cara al publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer (hereda la del modelo base DeepSeek-V4-Flash-0731) |
| Parametros totales | 284.334.567.511 (284,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens en llama.cpp (ejemplo de la model card: `-c 262144`); 32.768 en ds4 |
| Tipos de cuantizacion | IQ2_XXS, Q2_K, Q4_K (2-bit y 4-bit) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors del modelo base como referencia) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del DeepSeek-V4-Flash-0731 original, un transformer con capas de mezcla de expertos (MoE) y 284,3 mil millones de parametros totales. La model card no detalla el numero de parametros activos por token, la composicion del dataset de entrenamiento ni si se aplico RLHF o DPO; esa informacion corresponde al modelo base y no se reproduce en el repositorio de la cuantizacion.

La innovacion tecnica principal de esta ficha no esta en el entrenamiento, sino en el post-procesado: la ablacion se aplica sobre las matrices de pesos para eliminar la direccion de rechazo, sin usar TransformerLens (implementacion "cruda" de prueba de concepto basada en `remove-refusals-with-transformers`). Segun la model card, los modulos de expertos no fueron ablatados, y la cuantizacion Q4 empleo una intensidad de ablacion mayor que Q2, lo que reduce la tasa de rechazo en Q4. Ademas, se incluyen dos conjuntos de ficheros DSpark (pre-ablation y post-ablation) procedentes de `unsloth/DeepSeek-V4-Flash-0731-GGUF/dspark`, y los GGUF soportan tanto llama.cpp como el runtime ds4 (rama `ds4f-mxfp4`), con soporte para Apple Silicon y Metal.

## Capacidades

- Generacion de texto conversacional y de tipo instruccion, heredada del modelo base DeepSeek-V4-Flash-0731.
- Razonamiento y respuesta a prompts sin los rechazos tipicos del modelo alineado, gracias a la ablacion.
- Ejecucion local en CPU/GPU y Apple Silicon mediante llama.cpp y ds4.
- Soporte de contexto largo (hasta 262.144 tokens en llama.cpp) para conversaciones y documentos extensos.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su integracion en servicios de inferencia.
- Cuantizacion con imatrix (tag `imatrix`), orientada a preservar calidad en regimenes de 2 bits.
- Capacidades de tool calling, agentes o vision: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como responde un LLM sin capas de rechazo, comparando sus salidas con las del modelo base alineado en experimentos controlados.
- Evaluacion de tecnicas de ablacion: sirve para medir el impacto de la ablacion en calidad, coherencia y tasa de rechazo, comparando las variantes Q2 y Q4 con distinta intensidad de ablacion.
- Despliegue local en equipos de consumo: las cuantizaciones de 2 bits (IQ2_XXS, Q2_K) permiten ejecutar un MoE de 284 B en hardware con VRAM limitada o en Apple Silicon mediante llama.cpp.
- Pruebas de robustez y red-teaming: util para generar respuestas que un modelo censurado bloquearia, con el fin de auditar filtros y sistemas de moderacion propios.
- Prototipado de pipelines de inferencia: la compatibilidad con ds4 (single-GPU y multi-GPU) y llama.cpp permite validar arquitecturas de despliegue antes de migrar a modelos mayores.
- Generacion creativa sin restricciones en entornos cerrados: escritura de ficcion o guiones con tematicas sensibles, siempre con revision humana y en contextos de investigacion.
- Benchmarking de cuantizacion: comparar el rendimiento de IQ2_XXS, Q2_K y Q4_K sobre el mismo modelo para calibrar el compromiso calidad/VRAM en despliegues reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 549,3 GB e incluye varias cuantizaciones. Las variantes de 2 bits (IQ2_XXS, Q2_K) son las que permiten reducir el requisito, mientras que Q4_K exige bastante mas memoria.
- GPU recomendadas: no disponibles en la informacion proporcionada. El runtime ds4 documenta ejecucion single-GPU y multi-GPU (ejemplo con `CUDA_VISIBLE_DEVICES=0,1`).
- Cabe en GPU de consumo: si, segun la orientacion de la model card hacia llama.cpp, Apple Silicon/Metal y cuantizaciones de 2 bits; no se especifican modelos concretos de GPU de consumo.
- Opciones de despliegue: llama.cpp (`llama-cli`), ds4 (rama `ds4f-mxfp4`), y compatibilidad con endpoints; tambien existe el repositorio de origen `antirez/deepseek-v4-gguf`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF (este) | 284,3 B (MoE) | hasta 262.144 | GGUF (2/4-bit) | MIT | Sin censura, ablacionado |
| deepseek-ai/DeepSeek-V4-Flash-0731 | 284,3 B (MoE) | no disponible | safetensors | no disponible | Modelo base alineado |
| unsloth/DeepSeek-V4-Flash-0731-GGUF | 284,3 B (MoE) | no disponible | GGUF | no disponible | Cuantizacion sin ablacion |
| antirez/deepseek-v4-gguf | 284,3 B (MoE) | no disponible | GGUF | no disponible | Origen de los GGUF de este repo |

## Limitaciones y advertencias

- El filtrado de seguridad esta significativamente reducido: puede generar contenido sensible, controvertido o inapropiado.
- No es apto para publicos generales, menores ni aplicaciones que requieran alta seguridad.
- Riesgo elevado de alucinacion y de respuestas no verificadas, agravado por la ausencia de garantias de seguridad por defecto.
- La ablacion es una prueba de concepto "cruda"; los modulos de expertos no fueron ablatados, por lo que el comportamiento puede ser inconsistente entre rutas del MoE.
- La cuantizacion a 2 bits puede degradar la calidad y la coherencia respecto al modelo original.
- El autor recomienda uso exclusivo en investigacion, pruebas o entornos controlados, evitando produccion o aplicaciones comerciales de cara al publico.
- La licencia es MIT, pero la responsabilidad legal y etica del uso recae enteramente en el usuario.
- Idiomas soportados no documentados; el rendimiento multilingue no esta verificado.
- El repositorio registra 0 descargas y 0 likes, sin validacion comunitaria conocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/callxmexneo/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- GGUF de origen: https://huggingface.co/antirez/deepseek-v4-gguf
- GGUF de Unsloth y ficheros DSpark: https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF
- Runtime ds4: https://github.com/antirez/ds4/tree/ds4f-mxfp4
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Tecnica de ablacion: https://github.com/Sumandora/remove-refusals-with-transformers
- Perfil del autor de la ablacion: https://x.com/support_huihui
- Donaciones: https://ko-fi.com/huihuiai
