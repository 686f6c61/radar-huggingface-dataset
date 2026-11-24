# Hygaard/Inkling-2-Small-oQe-3.07bpw-MLX

## Resumen

Inkling-2-Small-oQe-3.07bpw-MLX es una conversión cuantizada del modelo Inkling-2-Small-MXFP8 de Thinking Machines Lab, publicada por el usuario Hygaard en Hugging Face. Se trata de un modelo MoE multimodal (image-text-to-text) con 594.050.641.920 parámetros totales según los pesos en safetensors, pensado para inferencia completamente residente en sistemas Apple Silicon con 256 GiB de memoria unificada. La conversión aplica una asignación mixta de precisión 2/3 bits a los expertos enrutados, manteniendo atención, embeddings, cabeza de salida y codificador de visión en 8 bits o BF16.

La relevancia de esta ficha radica en que demuestra que un modelo de casi 600.000 millones de parámetros puede ejecutarse en hardware de consumo profesional de Apple (M5 Ultra) sin paginación de pesos por capas, gracias a una compresión efectiva de 3,0732 bits por peso y un total de 213,142 GiB en disco incluyendo el sidecar MTP. Es una conversión comunitaria, no oficial, y requiere un build parcheado de oMLX (PR #5433) para cargar correctamente los tensores de 3 bits de los expertos.

El modelo base resuelve tareas de generación de texto, razonamiento y comprensión de imágenes, con arquitectura MoE de 48 capas de texto y 384 expertos enrutados por capa con top-8 routing. La licencia Apache-2.0 facilita su uso comercial, aunque la información disponible sobre el modelo original es limitada y no se han publicado benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) con 48 capas de texto, 384 expertos enrutados por capa, top-8 routing; incluye codificador de visión y sidecar MTP |
| Parametros totales | 594.050.641.920 (según safetensors); 595.762.352.304 parámetros escalares originales según la model card |
| Parametros activos | no disponible (top-8 de 384 expertos por capa, pero no se especifica el cómputo activo total) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta 2/3 bits afín (group size 128) en expertos; 8 bits afín en atención, embeddings y cabeza de salida (group size 64); BF16/FP32 en normas, convoluciones, routers y visión; BF16 en MTP. BPW efectivo 3,0732 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (82 shards principales + `mtp.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE multimodal con 48 capas de texto, 384 expertos enrutados por capa y enrutamiento top-8. La conversión preserva todas las capas, todos los expertos, el tokenizador, la plantilla de chat y el sidecar MTP original en BF16. El codificador de visión y el proyector se mantienen en BF16 (327.693.312 parámetros, 0,610376 GiB). Los routers se almacenan en FP32 (84.953.088 parámetros, 0,316475 GiB) y las normas, convoluciones y controles residuales en BF16/FP32.

La asignación de precisión es por proyección: los expertos enrutados usan 2 o 3 bits según el bloque (por ejemplo, bloques 6, 18, 19, 24-26, 30, 42-45 en 2 bits; el resto mayoritariamente en 3 bits, con bloques 31-33 y 46 con mezcla w13/w2). La atención y auxiliares usan 8 bits afín con group size 128. El modelo base fue entrenado por Thinking Machines Lab, pero la información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. La innovación técnica destacable es la conversión mixta 2/3 bits con escalas afines en BF16 y la preservación del sidecar MTP para decodificación especulativa (MTP on/off medido: 74,75 vs 40,47 tok/s).

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno (pipeline `image-text-to-text`, tags `conversational`).
- Comprensión de imágenes: codificador de visión en BF16 y proyector preservados en la conversión.
- Razonamiento multi-paso y modo de pensamiento (el modelo base se etiqueta como `thinkingmachines/Inkling-2-Small-MXFP8`; no se detalla el modo thinking en la información disponible).
- Decodificación especulativa mediante sidecar MTP (multi-token prediction) preservado en BF16.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon de gama alta: el modelo cabe completamente residente en un M5 Ultra de 256 GiB sin paginación de pesos por capas, lo que permite ejecutar un MoE de ~594.000 millones de parámetros en un equipo de sobremesa con 213,142 GiB en disco.
- Asistente multimodal conversacional: al soportar image-text-to-text, puede gestionar diálogos que combinen texto e imágenes, útil para análisis de capturas, documentos escaneados o interfaces de usuario.
- Generación de texto con decodificación especulativa: activando el sidecar MTP se obtienen 74,75 tok/s frente a 40,47 tok/s sin MTP en un presupuesto de 8K, adecuado para aplicaciones interactivas que priorizan latencia.
- Prototipado e investigación en cuantización extrema: la asignación mixta 2/3 bits con mapas de precisión por bloque (`MODULES.csv`, `TENSORS.csv`, `PRECISION.json`) sirve como referencia para estudiar el impacto de la cuantización agresiva en MoE.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 permite uso comercial e integración en productos propietarios, sujeto a las atribuciones de `SOURCE-NOTICE.md`.
- Evaluación comparativa de runtimes MLX: el modelo requiere oMLX parcheado (PR #5433), por lo que es útil para validar builds de runtime y reproducir las métricas de decode tok/s publicadas.

## Benchmarks y rendimiento

La model card solo proporciona métricas de rendimiento de inferencia, no benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.):

| Perfil de ejecución | Presupuesto total de petición | Decode tok/s |
|---|---:|---:|
| KV estándar nativo, MTP off | 8K | 40,47 |
| KV estándar nativo, MTP on | 8K | 74,75 |

Medido en un M5 Ultra dedicado de 256 GiB, completamente residente, sin paginación de pesos, con dos tareas de texto fijas por fila, una secuencia y sin reutilización de prefijo. Las cuatro respuestas pasaron las comprobaciones de tarea. No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 213,142 GiB en disco incluyendo MTP (209,954 GiB de pesos principales + 3,188 GiB de sidecar MTP); probado residente en 256 GiB de memoria unificada.
- GPU recomendadas: Apple Silicon M5 Ultra con 256 GiB (único hardware validado en la model card). No se documenta soporte en A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No en GPUs discretas convencionales por el tamaño (213 GiB); requiere Apple Silicon de gama alta con memoria unificada de 256 GiB.
- Opciones de despliegue: oMLX (build parcheado con PR #5433, merge commit `595d4ff`; oMLX 0.8.0 stock no funciona). No se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 40,47 tok/s con MTP off y 74,75 tok/s con MTP on, con presupuesto de 8K, una secuencia y sin reutilización de prefijo.
- Build probado: oMLX commit `624cff0e23519ba46a4d5ed2802c2c236ad1a9ac` con el parche de loader incluido.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único punto de referencia directo es el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hygaard/Inkling-2-Small-oQe-3.07bpw-MLX | 594.050.641.920 | no disponible | Apache-2.0 | MLX safetensors (2/3/8 bits mixto) | Conversión comunitaria, 213,142 GiB, requiere oMLX parcheado |
| thinkingmachines/Inkling-2-Small-MXFP8 | 595.762.352.304 (escalares originales) | no disponible | Apache-2.0 | MXFP8 | Modelo base original de Thinking Machines Lab |

No se conocen alternativas de la misma categoría (MoE multimodal ~600B) con datos verificables en la información disponible.

## Limitaciones y advertencias

- Requiere un build parcheado de oMLX: oMLX 0.8.0 stock no incluye el fix de PR #5433 y rechaza los pesos válidos de 3 bits de los expertos. Sin el parche, el modelo no carga.
- Conversión comunitaria no oficial: no está validada por Thinking Machines Lab; la propia model card indica que la evaluación amplia de calidad y visión, así como la validación de instalación limpia y servido HTTP, quedan pendientes.
- Cuantización extrema: los expertos enrutados a 2/3 bits pueden degradar la calidad frente al modelo original en MXFP8; no se han publicado benchmarks de calidad que cuantifiquen la pérdida.
- Tamaño de despliegue muy elevado: 213,142 GiB en disco y 256 GiB de memoria unificada, lo que restringe el hardware a Apple Silicon de gama alta.
- Idiomas soportados no especificados: riesgo de comportamiento inconsistente en idiomas distintos del inglés (no confirmado).
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable como en cualquier modelo generativo.
- Sesgos: no documentados en la información proporcionada.
- Equivalencia de salida MTP on/off: la model card indica que las salidas difieren y no se reclama equivalencia exacta de tokens.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las atribuciones de `LICENSE`, `SOURCE-NOTICE.md` y `CONVERSION.json`.

## Enlaces

- Hugging Face: https://huggingface.co/Hygaard/Inkling-2-Small-oQe-3.07bpw-MLX
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- PR de oMLX #5433: https://github.com/jundot/omlx/pull/5433
