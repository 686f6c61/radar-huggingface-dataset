# loraforge/huihui-qwen3.6-35b-a3b-abliterated-r1

## Resumen

Huihui Qwen3.6 35B A3B abliterated — LoRAForge rank 1 es un adaptador LoRA experimental publicado por loraforge que reconstruye, mediante compresión post-hoc, la diferencia de pesos entre el checkpoint base Qwen/Qwen3.6-35B-A3B y la variante "abliterated" de huihui-ai, es decir, un modelo al que se le han eliminado las direcciones de rechazo del espacio de activaciones. No es un modelo completo ni un GGUF, sino un delta de checkpoint extraído de los safetensors BF16 publicados, empaquetado como adaptador PEFT con rango físico 1 y 106,287 MB de factores en FP32.

El interés técnico no reside en la capacidad del modelo (heredada íntegramente del base, un MoE de 35B con 3B activos), sino en el método: el equipo audita los 1045 tensores indexados del checkpoint, identifica 123 modificados y factoriza cada matriz activa por separado, incluidos 40 grupos de parámetros de expertos enrutados, mediante una API de compresión tensorial (FlashTSQR) y una pasada de rango con muestreo gaussiano en FP64. El resultado retiene el 99,569570 % de la energía ponderada del delta con un solo componente por matriz.

Es relevante ahora porque demuestra que deltas de edición de comportamiento (abliteration) son comprimibles a rango 1 sin pérdida apreciable en espacio de pesos, lo que abre la puerta a servir variantes de comportamiento como adaptadores intercambiables sobre un mismo base MoE. No obstante, la validación publicada es un smoke test de carga y generación corta (3 de 6 textos idénticos al checkpoint editado completo), no una evaluación de capacidades ni de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer MoE; el base Qwen3.6-35B-A3B es un modelo de mezcla de expertos con atención y capa MTP, segun la nomenclatura de tensores del checkpoint |
| Parametros totales | No disponible para el adaptador (106,287 MB de factores FP32); el base se denomina 35B en el nombre del repositorio |
| Parametros activos | 3B segun el sufijo A3B del modelo base (dato no verificado en la informacion proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors FP32; el base admite BF16. No se publica un GGUF LoRA ni se reconstruyen residuos Q2-Q8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT), mas `optional_mtp_adapter.safetensors` separado |

## Arquitectura y entrenamiento

El adaptador no se entrena: se extrae. El procedimiento compara el checkpoint base fijado (revision `345d467b117d1fd5eda9b879a5988de9ae5f47a7`) con el checkpoint abliterated de huihui-ai (revision `8f0ee727aff5e771ea72466d64d13ecd851d2cc7`) y aísla el delta. De los 1045 tensores auditados, 123 cambian y 922 permanecen numéricamente idénticos. El adaptador por defecto cubre 80 módulos ordinarios y 40 grupos de parámetros de expertos enrutados, con 10.320 matrices activas, cada experto factorizado de forma independiente.

La extracción densa emplea un range finder gaussiano en FP64 (16 columnas, tres iteraciones de subespacio) con comprobaciones SVD exactas independientes; la compresión posterior usa la API tensorial LoRAForge FlashTSQR (`truncate_lora`, revision de librería `b2517ebe9be14bacce18ec4fef19774e7772c0fb`). El empaquetado por experto recurre a un puente experimental de PEFT `target_parameters`, no a la API lineal de LoRAForge, y el autor no reclama servicio acelerado multi-adaptador sobre MoE. Los factores guardados tienen rango físico 1 y escalado 1. Tres grupos de tensores MTP también cambian y se entregan aparte en `optional_mtp_adapter.safetensors`; Transformers ignora `mtp.*` y la integración con decodificación especulativa no se ha probado.

## Capacidades

- Generación de texto y conversación: hereda las capacidades del base Qwen3.6-35B-A3B, incluyendo modo thinking (desactivado en la validación) y plantilla de chat propia.
- Edición de comportamiento: el delta aplicado corresponde a la abliteration de huihui-ai, orientada a reducir rechazos; el autor no publica mediciones de tasa de rechazo.
- Posible soporte multimodal: el código de carga usa `AutoModelForImageTextToText`, lo que sugiere que el base expone torre visual, aunque el adaptador no se valida en multimodal.
- Tool calling y uso de agentes: no verificado en la información proporcionada; debe asumirse lo que ofrezca el base.
- Multilingüismo: no disponible.
- MTP / decodificación especulativa: los factores MTP se entregan pero no se integran ni se prueban.

## Casos de uso

- Investigación sobre compresión de deltas: usar el adaptador como referencia reproducible para estudiar cuánta energía de un cambio de comportamiento se conserva a rango 1, comparando con las tablas de energía publicadas (rango 1, 2, 4 y 8).
- Servicio multi-variante sobre un único base MoE: cargar el base BF16 una vez y conmutar entre el checkpoint abliterated completo y este adaptador para comparar comportamiento sin duplicar los ~72 GB de pesos.
- Auditoría de ediciones de seguridad: analizar qué tensores cambian en una abliteration (123 de 1045) y en qué módulos, como insumo para políticas de despliegue.
- Reproducción de pipelines de extracción: validar la cadena FlashTSQR + PEFT `target_parameters` en entornos con PEFT ≥ 0.21.2 y Transformers 5.22.1.
- Pruebas de regresión de carga: emplear `validation.json` y los seis prompts benignos como smoke test de que un adaptador empaquetado por experto recarga exactamente.
- Estudio de alineación y rechazo: comparar respuestas del base y del adaptador en dominios sensibles dentro de un entorno controlado de evaluación, no en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de fidelidad de reconstrucción y de un smoke test de generación:

| Metrica | Valor |
|---|---|
| Tensores auditados / modificados | 1045 / 123 |
| Matrices activas en el adaptador | 10.320 (80 módulos + 40 grupos de expertos) |
| Energia ponderada retenida (rango 1) | 99,569570 % |
| Energia minima por matriz (rango 1) | 99,290751 % |
| Energia ponderada retenida (rango 8) | 99,598830 % |
| Tamano de factores FP32 | 106,287 MB |
| Prompts de validacion con salida identica | 3 de 6 (greedy, thinking off, max 96 tokens) |
| Hardware de validacion | NVIDIA H100 NVL (94 GB) |

## Requisitos de hardware

- VRAM para el base: aproximadamente 72 GB en BF16 solo para pesos, más memoria de ejecución; el adaptador añade unos 0,1 GB.
- GPU recomendadas: H100 NVL de 94 GB (la usada en la validación), H100 80 GB, A100 80 GB; en configuraciones menores haría falta cuantizar el base, algo que el autor no cubre.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 sin cuantización agresiva del base, y el adaptador no se distribuye en GGUF.
- Despliegue: Transformers 5.22.1 + PEFT 0.21.2 + PyTorch 2.11.0+cu130 con `attn_implementation="sdpa"`; se requiere una versión de PEFT con soporte de `target_parameters` para expertos MoE. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI con este adaptador.
- Latencia y throughput: no disponibles; el autor no publica mediciones y advierte que no reclama servicio acelerado multi-adaptador sobre MoE.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| loraforge/huihui-qwen3.6-35b-a3b-abliterated-r1 | Adaptador LoRA rango 1 sobre MoE | 106,287 MB de factores; base 35B/A3B | No disponible | Apache-2.0 | 3 descargas, 0 likes |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated | Checkpoint completo editado (BF16) | 35B (3B activos, segun nombre) | No disponible | Apache-2.0 (heredada) | Publicado por huihui-ai |
| Qwen/Qwen3.6-35B-A3B | Checkpoint base sin editar | 35B (3B activos) | No disponible | Apache-2.0 | Modelo upstream de referencia |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF | GGUF cuantizado del checkpoint editado | 35B (3B activos) | No disponible | Apache-2.0 (heredada) | Publicado por huihui-ai |

## Limitaciones y advertencias

- La validación es un smoke test: 3 de 6 generaciones idénticas al checkpoint completo con greedy y 96 tokens; no evalúa capacidades, rechazo, multimodal ni MTP.
- La energía retenida mide aproximación en espacio de pesos, no calidad del modelo; el propio autor lo subraya.
- El adaptador no es un GGUF: no puede cargarse en llama.cpp u Ollama, y el autor no ha auditado igualdad completa frente a los GGUF publicados (solo siete muestras F16).
- Los factores MTP se entregan aparte y no se aplican por defecto; la decodificación especulativa queda sin probar.
- El empaquetado por experto usa un puente experimental de PEFT `target_parameters`; no hay garantía de compatibilidad con versiones anteriores ni con servidores de inferencia que no lo soporten.
- La abliteration reduce rechazos por diseño, lo que implica riesgo elevado de generar contenido dañino o inexacto; no es apta para producción sin filtros externos y evaluación propia.
- No se publican datos de sesgos, idiomas soportados ni longitud de contexto; deben heredarse del base y verificarse.
- Licencia Apache-2.0 permite uso comercial, pero se exige atribución a Qwen (base) y a huihui-ai (modelo editado); el autor no acredita que el origen se entrenara con LoRA ni que el rango original coincida con el retenido.
- Riesgo de alucinación: no cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loraforge/huihui-qwen3.6-35b-a3b-abliterated-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint abliterated de origen: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated
- GGUF de referencia: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF
- Paper LoRAForge (arXiv 2611.01256): https://arxiv.org/abs/2611.01256
- Repositorio del método de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
