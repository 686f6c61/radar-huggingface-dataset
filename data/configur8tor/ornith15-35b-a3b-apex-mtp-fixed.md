# conFIGur8tor/ornith15-35b-a3b-apex-mtp-fixed

## Resumen

Ornith-1.5-35B-A3B APEX-MTP-Fixed es una versión reparada del modelo de razonamiento Ornith-1.5-35B-A3B, exportada a GGUF por conFIGur8tor. El modelo original, desarrollado por ornith-ai sobre la arquitectura Qwen3.5, incluye una cabeza de predicción multi-token (MTP) que llegaba sin entrenar en su versión de stock, lo que hacía que la decodificación especulativa interna produjera resultados sin sentido. Esta build sustituye esa cabeza por una versión entrenada mediante continued-training de Avifenesh, restaurando el funcionamiento correcto del MTP.

El resultado es un modelo de 35.505 millones de parámetros totales con arquitectura Mixture-of-Experts (256 expertos, 8 activos por token, aproximadamente 2.6B parámetros activos), ventana de contexto de 262.144 tokens y soporte nativo de decodificación especulativa vía MTP. El archivo pesa 17.44 GB y está cuantizado con una mezcla de Q4_K, Q6_K y Q3_K, más la cabeza MTP en Q8_0. Es compatible con llama.cpp y Ollama, y está pensado para ejecutarse en GPUs de consumo como la RTX 4070.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35moe (Mixture-of-Experts, attention completa cada 4 capas, capas SSM) |
| Parametros totales | 35.505.251.456 (~35.5B) |
| Parametros activos | ~2.6B por token (8 de 256 expertos) |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantizacion | Q4_K (221 tensores), Q6_K (121), Q3_K (90), MTP head Q8_0 (11), normas/embeddings F32 (310) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo único de 17.44 GB) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer MoE con 41 bloques decodificadores, embedding de 2048 dimensiones, base RoPE de 1e7 y atención completa cada 4 capas, intercalando capas de estado de espacio (SSM). La variante APEX-MTP-Fixed no reentrena el modelo completo: toma el GGUF base de `mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF` y sustituye la cabeza MTP original (que venía con escalas RMSNorm sin entrenar, con valores de ~1e31 o NaN) por una cabeza entrenada mediante continued-training de Avifenesh, dequantizada de NVFP4 a f32 y re-cuantizada a Q8_0 de forma lossless (MSE 0.000000).

El MTP con `nextn_predict_layers = 1` permite que el modelo prediga el siguiente token de manera especulativa, mejorando la velocidad de inferencia. Según los datos del autor, la reparación corrige el colapso de predicción en profundidad 2 y 3 (de 0.80/0.27/0.13 a 0.81/0.58/0.43) y eleva la tasa de aceptación de drafts de 0.352 a 0.431. No se ha publicado información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de RLHF/DPO aplicado.

## Capacidades

- Generación de texto y razonamiento: el modelo abre las respuestas con un bloque de razonamiento (thinking) antes del resultado final, según la documentación de Ornith-1.5-35B-A3B.
- Tool calling: soporta bloques `<tool_call>` que pueden exponerse como tool_calls estilo OpenAI mediante un parser en el servidor.
- Decodificación especulativa MTP: gracias a la cabeza reparada, permite inferencia acelerada en llama.cpp y Ollama.
- Contexto largo: ventana de 262.144 tokens, adecuada para tareas que requieren procesar documentos extensos o historias de conversación prolongadas.
- Capacidades multimodales: la página de interfaze.ai indica que el modelo base tiene capacidades multimodales, aunque no se especifica qué tipos de entrada acepta.
- Multilingüismo: la model card solo declara inglés, aunque la arquitectura base (Qwen3.5) es multilingüe; no hay datos de rendimiento en otros idiomas.

## Casos de uso

- Asistentes de código con razonamiento profundo: el modelo genera bloques de razonamiento antes de responder, útil para tareas de programación complejas que requieren planificación. Se puede integrar en editores o CLI mediante Ollama.
- Análisis de documentos largos: con 256k de contexto, permite procesar contratos, papers o libros completos en una sola pasada, extrayendo conclusiones o resumiendo sin truncar.
- Decodificación especulativa en producción: la cabeza MTP reparada reduce la latencia en servidores de inferencia, permitiendo desplegar el modelo en GPUs de consumo (p.ej., RTX 4070) con throughput competitivo.
- Agentes autónomos con tool calling: el soporte de `<tool_call>` permite construir agentes que invocan funciones externas (búsqueda, APIs, bases de datos) en flujos multi-paso.
- Generación de código en pipelines de CI/CD: al ser compatible con llama.cpp y Ollama, puede ejecutarse en entornos de integración continua para generar tests, documentación o revisiones de código.
- Chat de atención al cliente con contexto extenso: el historial de conversación de 256k tokens permite mantener contextos de usuario largos sin perder información, reduciendo la necesidad de resúmenes intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta variante específica. La única métrica reportada es la tasa de aceptación de drafts de la decodificación especulativa: 0.431 (frente a 0.352 con el head original), y la precisión de predicción en profundidades 2 y 3 (0.81 y 0.43 respectivamente). Para benchmarks del modelo base Ornith-1.5-35B-A3B, se puede consultar la ficha del modelo original en HuggingFace.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF pesa 17.44 GB, por lo que se necesita al menos ~18 GB de VRAM para cargarlo completamente en GPU. Con cuantización Q4_K, la huella de memoria puede reducirse a ~10 GB, aunque la mezcla de Q6_K y Q3_K aumenta ligeramente el requisito.
- GPU recomendadas: RTX 4070 (12 GB) o superior, RTX 4080/4090 (16-24 GB), o A100/H100 para despliegues con contexto máximo. El autor indica que funciona bien en una GPU clase 4070.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 12-16 GB de VRAM si se usa cuantización agresiva o se limita el contexto.
- Opciones de despliegue: llama.cpp (con soporte para `qwen35moe` y `nextn_predict_layers=1`), Ollama (publicado como `slickwillies/ornith15-35b-a3b-apex-mtp-fixed`). También es posible servir con vLLM o TGI si se convierten los pesos a safetensors, pero no se documenta en esta build.
- Latencia y throughput: no se han publicado datos concretos de tokens/s. La decodificación especulativa MTP debería mejorar la velocidad de generación, pero el rendimiento exacto depende del hardware y de la configuración de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (APEX-MTP-Fixed) | 35.5B | ~2.6B | 256k | MIT | GGUF |
| Ornith-1.5-35B-A3B (FP8, base) | 35.5B | ~2.6B | 256k | MIT | safetensors (FP8) |
| Ornith-1.0-35B-MTP-APEX-GGUF | 35B | no disponible | no disponible | no disponible | GGUF |
| Qwen3.5 (base) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a la misma familia Ornith, ya que no se dispone de datos de otros modelos MoE de tamaño similar en la información proporcionada. La variante APEX-MTP-Fixed se diferencia de la base FP8 por incluir la cabeza MTP entrenada y estar en formato GGUF cuantizado, lo que la hace más ligera para despliegue en consumer GPU.

## Limitaciones y advertencias

- El modelo base Ornith-1.5-35B-A3B es un modelo de razonamiento: por defecto, la salida incluye un bloque de razonamiento antes de la respuesta final, lo que puede aumentar la latencia percibida si no se procesa correctamente.
- La model card solo declara soporte para inglés; el rendimiento en otros idiomas no está verificado y puede ser limitado.
- No se han publicado resultados de benchmarks para esta variante, por lo que el rendimiento real en tareas de razonamiento, código o matemáticas no está cuantificado.
- La cuantización mixta (Q4_K/Q6_K/Q3_K) puede degradar la calidad de generación en comparación con la versión bf16 o FP8 del modelo base, aunque el MTP head se mantiene en Q8_0 para preservar la calidad de la decodificación especulativa.
- El MTP head reparado proviene de un continued-training de Avifenesh; no se han publicado detalles sobre el dataset de entrenamiento de ese head ni sobre su evaluación en tareas generales.
- Para uso comercial, la licencia MIT permite uso y modificación sin restricciones, pero es recomendable verificar las licencias de los pesos base (Ornith-ai) si se redistribuye el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/conFIGur8tor/ornith15-35b-a3b-apex-mtp-fixed
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Modelo base en FP8: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Modelo GGUF base (APEX-MTP-Compact): https://huggingface.co/mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF
- Variante Ornith-1.0 con MTP: https://huggingface.co/davenetdev/Ornith-1.0-35B-MTP-APEX-GGUF
- Página de interfaze.ai (descripción del modelo base): https://interfaze.ai/models/ornith-aiornith-15-35b-a3b
- ModelScope (serving recipes del modelo base): https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
