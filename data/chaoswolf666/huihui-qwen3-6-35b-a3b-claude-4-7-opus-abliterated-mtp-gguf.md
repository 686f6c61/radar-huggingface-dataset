# Chaoswolf666/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-MTP-GGUF

## Resumen

Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-MTP-GGUF es una cuantizacion GGUF de un modelo derivado de la familia Qwen3.6, concretamente de la variante MoE de 35B parametros totales con 3B activos. El autor de la ficha en Hugging Face es Chaoswolf666, mientras que la model card original corresponde a huihui-ai, que aplico una tecnica de "abliteration" sobre el modelo base lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled para eliminar los mecanismos de rechazo (refusals) del modelo original.

El modelo resuelve el problema de los rechazos condicionados por alineamiento en modelos instructivos, ofreciendo una variante "uncensored" pensada para investigacion y entornos controlados. Incorpora la etiqueta MTP (Multi-Token Prediction), que sugiere soporte de decodificacion especulativa mediante cabezas de prediccion multi-token, y se distribuye en formato GGUF para su uso con llama.cpp.

Es relevante ahora porque combina tres tendencias actuales: arquitecturas MoE eficientes en inferencia (35B totales, 3B activos), tecnicas de ablacion de alineamiento para investigacion de seguridad, y empaquetado GGUF con soporte de decodificacion especulativa para despliegue en hardware de consumo. La ficha tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion muy reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), segun la nomenclatura A3B del modelo base |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | 3B (indicado por el sufijo A3B) |
| Longitud de contexto | 262.144 tokens (segun el ejemplo de llama-cli con `-c 262144`) |
| Tipos de cuantizacion | GGUF; se referencia Q4_K en el ejemplo de uso (otras variantes no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 216,4 GB con multiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts: 35,5B parametros totales con aproximadamente 3B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada (imagen y texto), aunque no se detalla la composicion del entrenamiento multimodal ni el numero de tokens vistos.

El proceso de entrenamiento del modelo base lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled no esta documentado en la informacion disponible; el nombre sugiere destilacion de razonamiento a partir de un modelo "Claude-4.7-Opus", pero no se confirma en la model card. Sobre ese base, huihui-ai aplico abliteration, una tecnica que identifica y suprime direcciones en el espacio de activaciones asociadas a la negativa a responder, descrita como "una implementacion cruda, proof-of-concept" basada en remove-refusals-with-transformers. La etiqueta MTP indica soporte de Multi-Token Prediction, usado en llama.cpp mediante `--spec-type draft-mtp --spec-draft-n-max 6` para decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado image-text-to-text.
- Razonamiento destilado (el modelo base incluye "Reasoning" en su nombre), aunque no se detalla el formato de thinking.
- Entrada multimodal de imagenes y texto, segun el pipeline_tag.
- Decodificacion especulativa mediante MTP (Multi-Token Prediction) en llama.cpp.
- Generacion sin filtros de rechazo (abliterated/uncensored), orientada a investigacion.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el comportamiento de un LLM tras eliminar las direcciones de rechazo, comparando respuestas con el modelo base para analizar que capacidades y sesgos se ven afectados por la abliteration.
- Evaluacion de tecnicas de ablacion: util como caso de prueba reproducible para validar la metodologia remove-refusals-with-transformers sobre arquitecturas MoE de 35B.
- Pruebas de decodificacion especulativa: el soporte MTP permite medir el speedup de la generacion especulativa con `--spec-draft-n-max` en llama.cpp sobre hardware local.
- Procesamiento de documentos largos en local: con 262.144 tokens de contexto y cuantizacion Q4_K, se puede desplegar en estaciones de trabajo con GPU consumer de gama alta para resumir o analizar corpus extensos.
- Experimentacion multimodal controlada: al declarar pipeline image-text-to-text, sirve para prototipar pipelines de vision-lenguaje en entornos de laboratorio aislados.
- Benchmarking de cuantizaciones GGUF: el repo incluye multiples variantes (216,4 GB totales), lo que permite comparar calidad y latencia entre niveles de cuantizacion sobre el mismo modelo.
- Entornos de red teaming: generacion de contenido adversario controlado para entrenar clasificadores de seguridad o probar sistemas de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para 35,5B parametros, una cuantizacion Q4_K ronda los 20-22 GB de pesos; Q8_0 se aproxima a 36-38 GB; FP16 requeriria unos 71 GB. Al ser MoE con 3B activos, el ancho de banda de memoria condiciona mas la latencia que el computo.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 y contextos largos; RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K con contexto moderado; configuraciones multi-GPU para contextos de 262.144 tokens.
- Cabe en GPU consumer: si, en Q4_K y cuantizaciones menores sobre RTX 4090/3090 con 24 GB, con margen limitado para KV cache en contextos muy largos.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli, llama-server) segun la model card; vLLM, TGI y Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles; el ejemplo oficial usa `-ngl 99 -fa on -np 1` con decodificacion especulativa MTP, lo que sugiere optimizacion para inferencia single-stream en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-MTP-GGUF | 35,5B | 3B | 262.144 | Apache 2.0 | GGUF | Abliterated, MTP, multimodal |
| lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled (base) | 35,5B | 3B | no disponible | Apache 2.0 | no disponible | Modelo original con alineamiento intacto |
| Qwen3-30B-A3B (referencia de la familia) | ~30B | ~3B | no disponible | Apache 2.0 | safetensors, GGUF | No confirmado como base exacto de esta ficha |

La comparativa con alternativas fuera de la familia Qwen no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El filtrado de seguridad esta significativamente reducido: puede generar contenido sensible, controvertido o inapropiado.
- No es apto para todas las audiencias ni para aplicaciones publicas o que requieran alta seguridad.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas, agravado por la falta de benchmarks publicados.
- La model card recomienda uso exclusivo en investigacion, pruebas o entornos controlados, evitando produccion o aplicaciones comerciales de cara al publico.
- No hay garantias de seguridad por defecto; el autor declina responsabilidad sobre las consecuencias de uso.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- La licencia Apache 2.0 permite uso comercial, pero las advertencias eticas y legales de la model card limitan su idoneidad para produccion.
- Modelo con 0 descargas y 0 likes: sin validacion comunitaria ni reportes independientes de calidad.
- El proceso de abliteration se describe como "crudo, proof-of-concept", lo que implica posible degradacion de capacidades respecto al base.
- La fecha de creacion (2026-11-15) y el nombre del modelo base ("Claude-4.7-Opus") no son verificables con la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaoswolf666/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated-MTP-GGUF
- Modelo base: https://huggingface.co/lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled
- Licencia del modelo base: https://huggingface.co/lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled/blob/main/LICENSE
- Repositorio de la tecnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp (releases): https://github.com/ggml-org/llama.cpp/releases
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- Ko-fi de huihui-ai: https://ko-fi.com/huihuiai
