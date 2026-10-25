# huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF

## Resumen

Huihui-DeepSeek-V4.1-Flash-1017-abliterated es una versión «abliterated» (sin la dirección de rechazo) del modelo deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por huihui-ai. El proceso de abliteración se realizó íntegramente sobre el GGUF con la herramienta cvector-generator de llama.cpp, sin pasar por Transformers, y afecta únicamente a las capas 11 a 28 (indexación base 0): solo se modificaron 18 tensores en total, los denominados `attn_output_b`. El sistema de expertos (MoE) no fue ablacionado, de modo que el efecto sobre el comportamiento de rechazo es parcial y localizado en la atención.

El repositorio se distribuye en formato GGUF, con pipeline declarado `image-text-to-text`, lo que indica soporte multimodal de imagen y texto. Los metadatos de HuggingFace reportan 485.268.480 parámetros totales y un tamaño de repo de 1,0 GB, con licencia MIT. Conviene señalar una discrepancia relevante: el nombre y la model card describen un modelo de la familia DeepSeek V4.1 con sistema de expertos y al menos 29 capas, mientras que el recuento de parámetros comunicado (≈485 M) es propio de un modelo pequeño; esta ficha refleja ambos datos tal como aparecen y marca la inconsistencia en las advertencias.

El interés práctico del modelo es acotado y muy específico: sirve como material de investigación sobre direcciones de rechazo, red-teaming, generación de datos sintéticos sin filtros y evaluación de cuantizaciones GGUF agresivas (la model card cita UD-IQ1_S, 1 bit). No es un modelo para producción generalista: requiere una rama no fusionada de llama.cpp (PR 30817) y su filtrado de seguridad ha sido reducido de forma deliberada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según los tags `deepseek_v41` y la referencia al «expert system» de la model card; proyecciones de atención denominadas `attn_output_b`; al menos 29 capas (se citan índices 0 a 28) |
| Parámetros totales | 485.268.480 (≈485 M), dato de safetensors reportado por HuggingFace; discrepante con la familia DeepSeek V4.1 descrita |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens en el ejemplo de ejecución de la model card (`-c 262144`); contexto nativo no confirmado |
| Tipos de cuantización | GGUF; la model card cita explícitamente UD-IQ1_S (Unsloth Dynamic, 1 bit). Conjunto completo de cuantizaciones del repo: no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repartido en 5 shards en la variante citada); los metadatos declaran `library_name: transformers`, pero no se listan pesos safetensors en el repo |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento original: no hay número de tokens, composición del dataset ni detalles de RLHF/DPO. Lo que sí se describe con precisión es la intervención realizada sobre el modelo base. La abliteración se ejecutó con `cvector-generator` de llama.cpp, calculando una dirección de rechazo y restándola de los pesos, exclusivamente sobre los tensores `attn_output_b` de las capas 11 a 28 en indexación base 0. En total se modificaron 18 tensores; el resto del modelo, incluido el sistema de expertos, quedó intacto. Las variantes con prefijo `UD-` provienen de unsloth/DeepSeek-V4.1-Flash-1017-GGUF.

La implicación técnica es doble. Por un lado, al no ablacionar el enrutado de expertos, es esperable que parte del comportamiento de rechazo persista, especialmente en rutas que pasan por expertos especializados. Por otro, al limitar la edición a las proyecciones de salida de atención, la modificación es quirúrgica y de bajo riesgo de degradación colateral del resto de capacidades, pero también de efecto limitado. No se documentan innovaciones adicionales de arquitectura (atención lineal, decodificación especulativa, SSM) ni detalles del tokenizador.

## Capacidades

- Generación de texto y razonamiento general heredados del modelo base DeepSeek-V4.1-Flash-1017; el alcance concreto no está documentado en la información disponible.
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text` y la model card compila `llama-mtmd-cli`, la herramienta multimodal de llama.cpp.
- Conversación multi-turno con ventana de contexto muy amplia según el ejemplo de la model card (262.144 tokens).
- Ejecución local en CPU y GPU mediante llama.cpp, incluida la variante de 1 bit (UD-IQ1_S).
- Generación de contenido sin filtrado de seguridad efectivo en las capas ablacionadas (comportamiento buscado, no una capacidad adicional).
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo «thinking» explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación sobre abliteración: el modelo permite medir cuánto rechazo se elimina al sustraer la dirección de rechazo solo en los tensores `attn_output_b` de las capas 11 a 28, y comparar con abliteraciones sobre todas las capas.
- Red-teaming y evaluación de seguridad: sirve como contraparte sin filtros para probar clasificadores, guardrails y sistemas de moderación en condiciones adversas controladas.
- Generación de datos sintéticos para entrenamiento: producción de respuestas a prompts que el modelo base rechazaría, útil para construir datasets de robustez o de clasificación de contenido sensible.
- Evaluación de cuantización extrema: la variante UD-IQ1_S (1 bit) permite estudiar la degradación de calidad de GGUF de muy baja precisión frente a cuantizaciones mayores del mismo modelo.
- Prototipado local en hardware modesto: con un peso declarado de 1,0 GB de repo y ~485 M de parámetros, cabe en GPUs de consumo e incluso en CPU, lo que facilita experimentos sin infraestructura dedicada.
- Procesamiento de documentos largos con componente visual: con `llama-server` y contexto de 262.144 tokens se pueden abordar tareas de resumen o extracción sobre documentos extensos que incluyan imágenes, siempre en entorno controlado.
- Escritura creativa sin restricciones temáticas: narrativa de ficción con temáticas sensibles, en contextos editoriales o de investigación que requieran ausencia de rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se documentan comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada (según los 485.268.480 parámetros reportados): ~0,97 GB en FP16, ~0,49 GB en 8 bits, ~0,25 GB en 4 bits y del orden de 0,15-0,20 GB para los pesos en UD-IQ1_S. El repo completo ocupa 1,0 GB repartido en 5 shards.
- La caché KV a 262.144 tokens puede dominar el consumo y superar ampliamente el tamaño de los pesos; no se dispone del número de capas, cabezas ni dimensión de cabeza necesarios para calcularla.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060, 4060, 4070, 4090) es suficiente para los pesos; para servir contexto completo de 256K conviene A100 40/80 GB, H100 o varias GPU.
- Cabe en GPU de consumo: sí, con los datos de parámetros reportados; también en CPU.
- Despliegue: llama.cpp es la vía soportada y requiere la rama del PR 30817 (`git fetch origin pull/30817/head:deepseek41`). El binario multimodal es `llama-mtmd-cli`; para servicio, `llama-server`. Soporte en vLLM, TGI u Ollama: no confirmado en la información disponible (Ollama y otros runners GGUF dependerían de que incorporen la arquitectura `deepseek_v41`).
- Latencia y throughput: no disponibles.
- Advertencia: si el modelo real fuese un MoE de la familia V4.1 con muchos más parámetros que los reportados, estas estimaciones quedarían muy cortas y habría que recalcularlas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-DeepSeek-V4.1-Flash-1017-abliterated (este) | 485.268.480 reportados | 262.144 tokens en el ejemplo de la model card | Sin benchmarks publicados | MIT | GGUF, requiere fork de llama.cpp |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | Sin datos en esta ficha | no disponible | Repo original en HuggingFace |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | no disponible | no disponible | Sin datos en esta ficha | no disponible | GGUF, origen de las variantes UD- |
| Otras variantes abliterated de huihui-ai | no disponible | no disponible | Sin datos en esta ficha | MIT en la mayoría de sus repos | GGUF y safetensors |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa; la comparativa se limita a parámetros, licencia y disponibilidad de formatos.

## Limitaciones y advertencias

- Filtrado de seguridad reducido de forma deliberada: puede generar contenido sensible, controvertido o inapropiado. El autor desaconseja su uso en producción o en aplicaciones de cara al público.
- La abliteración es parcial: solo se modificaron 18 tensores (`attn_output_b`) en las capas 11 a 28, y el sistema de expertos no se tocó, por lo que el rechazo puede persistir en muchas consultas.
- Discrepancia de datos grave: el nombre y la model card apuntan a un modelo de la familia DeepSeek V4.1 con MoE y al menos 29 capas, mientras que HuggingFace reporta 485.268.480 parámetros. Cualquier estimación de recursos basada en ese recuento debe verificarse antes de desplegar.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento correcto fuera del inglés o del chino sin pruebas propias.
- Dependencia de una rama no fusionada de llama.cpp (PR 30817): riesgo de rotura de compatibilidad, falta de soporte en runers estándar y deuda de mantenimiento en producción.
- La cuantización UD-IQ1_S (1 bit) implica una degradación de calidad significativa frente a precisiones mayores; no es adecuada para tareas que exijan precisión factual.
- Licencia MIT: permite uso comercial y modificación, pero el autor declina toda responsabilidad sobre las consecuencias del uso y el contenido generado.
- Obligaciones legales y éticas: el usuario es el único responsable del cumplimiento normativo (contenido difamatorio, derechos de autor, protección de menores, normativa de IA).
- Sin garantías de seguridad por defecto: no ha pasado optimización de seguridad, a diferencia del modelo base.
- Metadatos pobres: 0 descargas y 1 like en el momento de la consulta, sin validación comunitaria de la calidad del GGUF ni de la fusión de shards.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4.1-Flash-1017-abliterated-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- GGUF de origen (unsloth): https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Herramienta de abliteración (cvector-generator, llama.cpp): https://github.com/ggml-org/llama.cpp/blob/master/tools/cvector-generator/README.md
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Pull request con soporte de la arquitectura: https://github.com/ggml-org/llama.cpp/pull/30817
- Apoyo al autor: https://ko-fi.com/huihuiai
