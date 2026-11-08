# hyperionaidev/Qwen3.5-0.8B-tvbox-GGUF

## Resumen

Qwen3.5-0.8B-tvbox-GGUF es una cuantización GGUF altamente especializada del modelo base Qwen/Qwen3.5-0.8B (819.706.824 parámetros), publicada por el desarrollador hyperionaidev dentro del proyecto smolmaxxing. No se trata de una conversión GGUF convencional: el autor ha aplicado una poda del cabezal de salida (output head) que reduce el vocabulario de 248.320 a 65.672 filas, seleccionadas por frecuencia de tokens sobre un corpus en inglés y multilingüe, y ha cuantizado todos los tensores —incluida la embedding y el cabezal— en Q4_K puro con la imatrix de unsloth.

El objetivo declarado es ejecutar un modelo de 0,8B en hardware de gama extremadamente baja: concretamente una Xiaomi TV Box S (3.ª generación) con 4 núcleos Cortex-A55 y aproximadamente 1 GB de RAM utilizable. Según las mediciones del autor, el archivo alcanza 16,8 tok/s de generación y 33 tok/s de procesamiento de prompt en ese dispositivo, con un consumo de 566 MB de RSS, lo que supone 2,2 veces la velocidad del Q4_K_M estándar (7,5 tok/s) en el mismo equipo.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión agresiva orientada a edge computing; por otro, advierte de una dependencia crítica —el archivo requiere un llama.cpp parcheado del repositorio smolmaxxing y no carga en llama.cpp estándar, LM Studio ni Ollama—, lo que condiciona por completo su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B; detalles de atención no disponibles en la información proporcionada) |
| Parametros totales | 819.706.824 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de ejecución usa `-c 1024`) |
| Tipos de cuantizacion | Q4_K puro en todos los tensores (embedding y cabezal incluidos), con imatrix de unsloth |
| Idiomas soportados | No disponible (la selección del cabezal se hizo sobre corpus inglés y multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`q08-q4k-h65p8.gguf`, 474 MB) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer de 819,7 millones de parámetros desarrollado por Qwen. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO; estos datos deben consultarse en la model card del modelo original. La model card del GGUF menciona una variable de entorno `LLAMA_STATE_F16` para el estado DeltaNet en fp16, lo que sugiere que la arquitectura del base incorpora capas de tipo DeltaNet (atención lineal recurrente) junto con atención estándar, aunque no se confirma explícitamente en el texto disponible.

La innovación técnica de esta publicación no está en el entrenamiento sino en la compresión: se parte de la conversión BF16 de unsloth y su imatrix, se poda el cabezal de salida a 65.672 filas (el 26,4 % del vocabulario original de 248.320) seleccionadas por frecuencia de tokens, y se añade un tensor `output_ids` que mapea las posiciones del cabezal reducido al vocabulario completo. El recuento se redondea a múltiplo de 8 para que el backend de CPU pueda repackear el cabezal de forma eficiente. Los prompts pueden usar todos los tokens del vocabulario original, pero el modelo solo puede generar tokens presentes en el cabezal podado; según el autor, el 1,3 % de los tokens de evaluación caen fuera de ese conjunto.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` confirman uso para diálogo; el ejemplo de ejecución incluye `--reasoning off`, lo que indica que el modelo base soporta un modo de razonamiento desactivable.
- Razonamiento de baja latencia en dispositivos edge: diseñado y medido para ejecutarse en CPU ARM de 4 núcleos con ~1 GB de RAM.
- Multilingüismo parcial: el cabezal se seleccionó sobre un corpus inglés y multilingüe, por lo que la cobertura de generación en otros idiomas es probable pero no está cuantificada en la información disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con APIs compatibles con el servidor de llama.cpp.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles; el pipeline es exclusivamente de texto.

## Casos de uso

- Asistente conversacional offline en televisores y set-top boxes: el archivo está medido en una Xiaomi TV Box S con 566 MB de RSS y 16,8 tok/s, por lo que puede sostener un chatbot local de baja latencia sin conexión a la nube en hardware de menos de 1 GB de RAM.
- Prototipado de IA en dispositivos IoT y Raspberry Pi: con 474 MB en disco y cuantización Q4_K, cabe en almacenamiento flash reducido y se ejecuta en CPU ARM, lo que permite validar flujos de texto generativo antes de migrar a hardware mayor.
- Demostraciones de investigación sobre poda de vocabulario: el parche y el tensor `output_ids` sirven como caso de estudio reproducible para evaluar el impacto de recortar el cabezal de salida en perplejidad (≈1,00 bits/byte frente a 1,024 del Q4_0 completo).
- Generación de texto de bajo consumo en kioscos o paneles informativos: la velocidad de 33 tok/s en prompt processing permite respuestas cortas a consultas predefinidas en entornos sin GPU.
- Filtrado y clasificación de texto en el borde: un modelo de 0,8B puede etiquetar o resumir breves entradas localmente, evitando enviar datos a servicios externos.
- Educación y experimentación con llama.cpp: el repositorio smolmaxxing documenta el proceso completo (patch, compilación, benchmark), lo que lo convierte en material didáctico para entender cuantización, imatrix y repacking de cabezales en CPU.

## Benchmarks y rendimiento

Los únicos datos publicados en la información proporcionada son mediciones del autor en la Xiaomi TV Box S (3.ª generación):

| Metrica | Valor |
|---|---|
| Generación (llama-bench) | 16,8 tok/s |
| Procesamiento de prompt | 33 tok/s |
| Calidad (perplejidad en bits/byte) | ≈1,00 |
| RAM (RSS) | 566 MB |
| Referencia: Q4_K_M estándar en el mismo equipo | 7,5 tok/s |
| Referencia: Q4_0 con vocabulario completo | 1,024 bits/byte |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La métrica de calidad es perplejidad en inglés sobre un texto fijo de 22 KB, convertida a bits por byte, y el propio autor advierte que no es directamente comparable con una puntuación de vocabulario completo porque se mide sobre las posiciones del cabezal podado.

## Requisitos de hardware

- VRAM/RAM estimada: 566 MB de RSS en inferencia según medición del autor; el archivo ocupa 474 MB en disco.
- GPU recomendadas: no aplica para el caso objetivo; el modelo está optimizado para CPU ARM (Cortex-A55). No hay datos de rendimiento en A100, H100 o RTX 4090 en la información disponible.
- ¿Cabe en GPU de consumo? Sí, por tamaño (menos de 1 GB), pero la información proporcionada no incluye mediciones en GPU.
- Opciones de despliegue: exclusivamente llama.cpp parcheado del repositorio smolmaxxing (llama.cpp en el commit `8642541` con `patches/llama.cpp-v0.8.0-tvbox.patch`). No funciona en llama.cpp estándar, LM Studio ni Ollama.
- Comando de referencia: `LLAMA_STATE_F16=1 llama-server -m q08-q4k-h65p8.gguf -t 3 -c 1024 -ub 128 -b 128 --reasoning off`.
- Latencia y throughput: 16,8 tok/s de generación y 33 tok/s de prompt processing en Xiaomi TV Box S (3.ª gen).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-tvbox-GGUF (este) | 819,7 M | No disponible | GGUF Q4_K con cabezal podado | Apache-2.0 | Requiere llama.cpp parcheado; 16,8 tok/s en TV Box |
| unsloth/Qwen3.5-0.8B-GGUF | 819,7 M | No disponible | GGUF (BF16 de origen, cuantizaciones estándar) | Apache-2.0 | Compatible con llama.cpp, LM Studio y Ollama estándar |
| Qwen/Qwen3.5-0.8B (original) | 819,7 M | No disponible | Safetensors | Apache-2.0 | Pesos completos; requiere conversión para edge |

La comparativa con modelos de otros fabricantes del mismo tamaño (por ejemplo, familias de 0,5B a 1B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de runtime no estándar: el archivo no carga en llama.cpp estándar, LM Studio ni Ollama; exige compilar el llama.cpp parcheado del repositorio smolmaxxing. Esto descarta su uso en pipelines convencionales sin trabajo adicional de integración.
- Vocabulario de generación restringido: el modelo solo puede emitir 65.672 de los 248.320 tokens del vocabulario original. Aunque los prompts aceptan todos los tokens, la generación de términos poco frecuentes (nombres propios, código exótico, idiomas de bajos recursos) puede degradarse.
- Métrica de calidad no directamente comparable: la perplejidad de ≈1,00 bits/byte se mide solo sobre posiciones del cabezal podado y excluye el 1,3 % de tokens fuera de él; no equivale a una evaluación de vocabulario completo.
- Riesgo de alucinación: inherente a un modelo de 0,8B; no hay evaluaciones de factualidad en la información disponible.
- Sesgos: no documentados en la información proporcionada; la selección del cabezal por frecuencia sobre corpus inglés y multilingüe puede infrarrepresentar idiomas minoritarios.
- Contexto: la información no especifica la longitud de contexto nativa del modelo base; el ejemplo de ejecución limita `-c 1024`, lo que sugiere un uso previsto de contexto corto en el dispositivo objetivo.
- Licencia: Apache-2.0 permite uso comercial, pero la obligación práctica de mantener el parche de llama.cpp añade coste de mantenimiento en producción.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-08), por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyperionaidev/Qwen3.5-0.8B-tvbox-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Conversión BF16 e imatrix de unsloth: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Proyecto smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Documento de experimentos (secciones 15 y 17): https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-5-0-8b.html
