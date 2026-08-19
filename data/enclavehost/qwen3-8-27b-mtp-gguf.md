# EnclaveHost/qwen3.8-27b-mtp-gguf

## Resumen

El modelo `qwen3.8-27b-mtp-gguf` es un volumen de modelo curado por EnclaveHost para inferencia confidencial en su plataforma Enclave. Se basa en el modelo Qwen/Qwen3.8-27B, cuantizado con el esquema dinámico Q6_K_XL de unsloth, y empaquetado como un único archivo GGUF junto con el tokenizer oficial, de modo que el volumen es autocontenido. La elección de Q6 en lugar del habitual Q4_K_XL responde a un uso orientado a generación de código, donde un token erróneo produce un programa roto en lugar de una frase torpe.

La característica más destacable es que incluye la cabeza de predicción multi-token (MTP) entrenada por Qwen3.8, lo que permite auto-drafting (decodificación especulativa sin necesidad de un segundo modelo). La arquitectura es híbrida: 48 capas gated-DeltaNet y 16 capas de atención completa sobre un total de 64 bloques, con una ventana de contexto de 262 144 tokens. El volumen es solo texto: omite deliberadamente el proyector de visión del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (híbrida: 48 gated-DeltaNet + 16 full-attention de 64, `full_attention_interval` 4) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 |
| Tipos de cuantizacion | Q6_K_XL dinámico (atención, `ffn_down` y `output.weight` a Q8_0; `ffn_gate`/`ffn_up` a Q6_K; proyecciones SSM a Q5_K) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo único) |

## Arquitectura y entrenamiento

La arquitectura es híbrida, combinando 48 capas con gated-DeltaNet (un mecanismo de estado lineal recurrente) y 16 capas de atención completa, intercaladas con un intervalo de 4 (`full_attention_interval` 4). Las capas de atención completa son las únicas que mantienen caché KV, lo que reduce el coste de memoria frente a un transformer denso equivalente. La cabeza MTP (multi-token prediction) está integrada como un bloque adicional (bloque 64), con `mtp_num_hidden_layers` 1 y `nextn_predict_layers` 1, y comparte embeddings con el tronco principal (`mtp_use_dedicated_embeddings` false). Esto permite decodificación especulativa sin un modelo draft separado.

El modelo base Qwen3.8-27B fue entrenado por Qwen con datos no especificados en la información disponible. El tokenizer es un superconjunto del de la familia Qwen3.5/3.6: 248 044 entradas reales más 33 añadidas, con siete ids especiales nuevos (248070-248076) relacionados con audio y TTS. El template de chat es ChatML con apertura forzada del modo `thinking`. El volumen GGUF no contiene tensores de visión; el modelo original es image-text-to-text, pero este empaquetado omite el proyector.

## Capacidades

- Generación de texto y razonamiento con modo `thinking` activado por el template entrenado.
- Generación de código: la cuantización Q6_K_XL está deliberadamente elegida para tareas de programación, donde la precisión de tokens es crítica.
- Auto-drafting con decodificación especulativa mediante la cabeza MTP integrada, sin necesidad de un segundo modelo.
- Soporte de contexto largo: 262 144 tokens, con M-RoPE interleaved (secciones `[11, 11, 10, 0]`).
- Capacidades multilingües: no especificadas en la información disponible, aunque el tokenizer de la familia Qwen suele cubrir múltiples idiomas.
- Sin soporte de visión en este volumen: no incluye `mmproj-*` ni tensores de imagen.
- Sin soporte explícito de tool calling documentado en la información proporcionada.

## Casos de uso

- Generación de código en producción: la cuantización Q6_K_XL reduce la probabilidad de tokens incorrectos en código, y el auto-drafting MTP acelera la inferencia. Puede integrarse en pipelines de CI/CD para autocompletado o revisión de código.
- Asistente de programación con contexto largo: con 262 144 tokens de ventana, puede procesar repositorios completos o múltiples archivos en una sola pasada, manteniendo coherencia entre módulos.
- Razonamiento multi-paso con modo thinking: el template fuerza la apertura del modo de razonamiento, útil para tareas de análisis lógico, planificación o depuración.
- Inferencia confidencial en la plataforma Enclave: el volumen está diseñado para ejecutarse en entornos atestiguados, donde la integridad del modelo y los pesos es verificable.
- Decodificación especulativa sin modelo draft adicional: en hosts compatibles con la toolchain MTP, se puede configurar `"draft": "mtp"` para acelerar la generación sin coste extra de memoria.
- Despliegue en entornos con restricciones de almacenamiento: al ser un único archivo GGUF de 25,9 GB con tokenizer incluido, es adecuado para volúmenes de modelo autocontenidos en infraestructura de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas. Tampoco se proporcionan mediciones de throughput o latencia más allá de la nota operativa de que el primer arranque con preload responde a `/warmup` en 100 ms y que la asignación del contexto MTP se produce en la primera sesión especulativa, no en el arranque.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 34,1 GB para servir el modelo con ventana de 176K tokens en q8_0 (25,9 GB de pesos + 6,7 GB de KV + ~1,5 GB de working set). Con la cuantización Q6_K plana (22,9 GB), el coste baja a ~31,1 GB.
- GPU recomendadas: H200 (140,4 GB) con una fracción de 0,24-0,27 de la memoria; también puede caber en GPUs de 40 GB o 48 GB (A100 40GB, L40S, RTX 6000 Ada) con la ventana de contexto reducida.
- En consumer GPU: no cabe de forma cómoda; una RTX 4090 (24 GB) no tiene VRAM suficiente para la configuración descrita. Sería necesario cuantizar a Q4 o reducir drásticamente la ventana de contexto.
- Opciones de despliegue: la plataforma Enclave con su toolchain MTP (`ell_mtp_*`); en hosts sin esa toolchain, funciona como un modelo 27B estándar. También es compatible con llama.cpp y derivados (Ollama, etc.) al ser GGUF estándar.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa con MTP debería mejorar el throughput frente a la generación autoregresiva clásica, pero no se dan cifras.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados en la información proporcionada. El texto menciona otros volúmenes de la misma familia (`qwen3.6-27b-gguf`, `qwen3.5-9b-gguf`, `qwen3.5-0.8b-mtp-gguf`) y el upstream `unsloth/Qwen3.8-27B-GGUF`, que ofrece 22 cuantizaciones, archivos de visión e imatrix. Sin embargo, no se proporcionan especificaciones completas ni resultados de rendimiento de estos modelos para establecer una comparación rigurosa. Se puede señalar que el modelo base sin cuantizar (Qwen/Qwen3.8-27B) es la referencia de calidad, y que este volumen sacrifica algo de precisión por la cuantización a cambio de un despliegue más ligero.

## Limitaciones y advertencias

- Solo texto: el volumen omite el proyector de visión del modelo original. Si se necesita procesamiento de imágenes, hay que añadir `mmproj-F16.gguf` (~0,93 GB) y configurar `"vision": true` en el catálogo.
- Sin datos de benchmarks: no hay resultados publicados que permitan evaluar la calidad del modelo cuantizado frente al original o a alternativas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para este volumen.
- Sesgos: no se ha documentado ningún análisis de sesgos para esta versión cuantizada.
- Compatibilidad MTP: los hosts que no soporten la toolchain MTP servirán el modelo como un 27B estándar, perdiendo la ventaja de velocidad de la decodificación especulativa.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el volumen está pensado para la plataforma Enclave; su uso fuera de ella puede requerir adaptación.
- El tokenizer no es byte-idéntico al de la familia Qwen3.5/3.6: incluye siete ids especiales adicionales, lo que impide el cross-model speculative decoding con modelos draft de esa familia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EnclaveHost/qwen3.8-27b-mtp-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Upstream GGUF: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Plataforma Enclave: https://enclave.host
