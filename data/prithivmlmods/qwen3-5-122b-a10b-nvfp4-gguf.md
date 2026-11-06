# prithivMLmods/Qwen3.5-122B-A10B-NVFP4-GGUF

## Resumen

Qwen3.5-122B-A10B es un modelo de lenguaje multimodal nativo desarrollado por el equipo Qwen (Alibaba), publicado bajo licencia Apache-2.0. Se trata de un transformer de tipo Mixture-of-Experts (MoE) con 122 mil millones de parametros totales y aproximadamente 10 mil millones de parametros activos por token, lo que permite un equilibrio entre capacidad y coste de inferencia. Combina un codificador de vision con una arquitectura hibrida de Gated DeltaNet y Gated Attention, y soporta una ventana de contexto nativa de 262K tokens, extensible a cerca de 1M mediante YaRN.

La ficha que nos ocupa, `prithivMLmods/Qwen3.5-122B-A10B-NVFP4-GGUF`, es una cuantizacion del modelo base en formato NVFP4 (FP4 de 4 bits nativo de NVIDIA) empaquetada en GGUF para su uso con llama.cpp. Esta optimizada especificamente para aceleradores NVIDIA Blackwell (RTX PRO 6000, RTX 50-series, B200, B300), donde los Tensor Cores FP4 ofrecen aceleracion por hardware. Incluye tambien decodificacion especulativa integrada mediante Multi-Token Prediction (MTP), que elimina la necesidad de un modelo borrador separado.

Su relevancia actual radica en que permite ejecutar un modelo de 122B parametros con capacidades multimodales, agenticas y de razonamiento avanzado en una sola GPU de 96 GB, con un rendimiento medido de aproximadamente 128 tokens/s de generacion. Es una opcion practica para despliegues locales de alta capacidad en hardware Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (Gated DeltaNet + Gated Attention) con codificador de vision |
| Parametros totales | 124.635.279.872 (~122B) |
| Parametros activos | ~10B (A10B) |
| Longitud de contexto | 262.144 tokens nativo; ~1M con YaRN |
| Tipos de cuantizacion | NVFP4 (4 bits, formato GGUF) |
| Idiomas soportados | 201 idiomas y dialectos (segun model card); tag de idioma declarado: en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo principal NVFP4 de 82,7 GB + mmproj de 912 MB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B emplea una arquitectura Mixture-of-Experts con atencion hibrida que combina capas de Gated DeltaNet (un mecanismo de atencion lineal/estado recurrente) con capas de Gated Attention clasica. Esta mezcla busca reducir el coste computacional en contextos largos manteniendo la calidad de recuperacion de informacion. El modelo es multimodal nativo: integra un codificador de vision que se proyecta al espacio del lenguaje mediante el archivo `mmproj`, lo que habilita tareas de image-text-to-text.

El entrenamiento incluye tecnicas de alineacion (la model card menciona modo thinking por defecto y capacidades de tool calling), aunque no se detalla en la informacion proporcionada el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO. La innovacion tecnica destacable de esta ficha concreta es la integracion de Multi-Token Prediction (MTP) directamente en los pesos del GGUF: cabezas adicionales que predicen varios tokens futuros en un solo paso, habilitando decodificacion especulativa sin modelo borrador externo. La cuantizacion NVFP4 aprovecha los Tensor Cores FP4 de Blackwell para acelerar la inferencia.

## Capacidades

- Generacion de texto y razonamiento avanzado con modo thinking activado por defecto.
- Capacidades multimodales: comprension de imagenes (image-text-to-text) mediante el proyector mmproj.
- Generacion y comprension de codigo, incluyendo tareas de ingenieria de software (SWE-bench).
- Razonamiento matematico y resolucion de problemas (resultados en MathVision).
- Tool calling y function calling (evaluado en BFCL-V4).
- Razonamiento agentico multi-paso y uso de herramientas en entornos de terminal y escritorio (Terminal-Bench, OSWorld).
- Navegacion web y busqueda agentica (BrowseComp).
- Capacidades multilingues amplias (201 idiomas y dialectos declarados).
- Decodificacion especulativa integrada mediante MTP.
- Soporte de inferencia en SGLang, vLLM, KTransformers, Transformers y llama.cpp.

## Casos de uso

- Asistente de codigo en produccion: con SWE-bench Verified de 72,0 y soporte de tool calling, puede integrarse en pipelines de CI/CD para revisar parches, generar tests y resolver issues de repositorios reales con contexto de hasta 262K tokens.
- Agente autonomo de terminal: su resultado en Terminal-Bench 2.0 (49,4) lo hace adecuado para automatizar tareas de linea de comandos, instalacion de dependencias y diagnostico de errores en entornos controlados.
- Automatizacion de escritorio: con OSWorld-Verified de 58,0, puede operar interfaces graficas para tareas repetitivas de ofimatica o gestion de aplicaciones.
- Analisis de documentos y OCR estructurado: OmniDocBench 1.5 de 89,8 sugiere buen rendimiento en extraccion de contenido de documentos escaneados, tablas y formularios, util para digitalizacion de archivos.
- Atencion al cliente multimodal: puede procesar capturas de pantalla, fotos de productos y texto en conversaciones multi-turno, aprovechando la ventana de contexto larga para mantener historial extenso.
- Investigacion y analisis con busqueda web: BrowseComp de 63,8 y soporte de herramientas lo habilitan para tareas de recopilacion y sintesis de informacion desde la web.
- Despliegue local en estacion de trabajo Blackwell: con 82,7 GB en NVFP4 cabe en una RTX PRO 6000 de 96 GB, permitiendo inferencia privada de un modelo de 122B sin infraestructura cloud.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo base Qwen3.5-122B-A10B:

| Benchmark | Resultado |
|---|---|
| MMLU-Pro | 86,7 |
| GPQA Diamond | 86,6 |
| IFEval | 93,4 |
| SWE-bench Verified | 72,0 |
| Terminal-Bench 2.0 | 49,4 |
| BFCL-V4 | 72,2 |
| BrowseComp | 63,8 |
| HLE con herramientas | 47,5 |
| MMMU | 83,9 |
| MathVision | 86,2 |
| OmniDocBench 1.5 | 89,8 |
| V* (con interprete de codigo) | 93,2 |
| ScreenSpot Pro | 70,4 |
| VideoMME | 87,3 |
| OSWorld-Verified | 58,0 |

Rendimiento de inferencia medido para esta cuantizacion NVFP4 (RTX PRO 6000 Blackwell, 96 GB, llama-cli, contexto 16.384, KV cache q8_0, MTP con `draft_n_max=2`):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 122,63 tokens/s |
| Velocidad media de generacion | 128,58 tokens/s |
| Tiempo total de ejecucion | 183,7 s |
| VRAM pico | 77,46 GiB |
| Utilizacion pico de GPU | 94% |
| Capas offloaded | 99 (`-ngl 99`) |

## Requisitos de hardware

- VRAM estimada: el archivo NVFP4 ocupa 82,7 GB, mas 912 MB del proyector multimodal. La ejecucion medida alcanzo 77,46 GiB de VRAM pico con contexto de 16K y KV cache q8_0.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB), B200, B300 y GPUs Blackwell con suficiente VRAM. La cuantizacion NVFP4 esta optimizada para arquitectura Blackwell (SM120, GB202).
- GPU de consumo: no cabe en GPUs consumer convencionales de 24 GB o 48 GB. Requiere al menos una GPU profesional o de datacenter con ~80-96 GB de VRAM para offload completo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), SGLang, vLLM, KTransformers y Transformers para el modelo base. El GGUF NVFP4 esta pensado para llama.cpp.
- Latencia y throughput: aproximadamente 122 tokens/s de prefill y 128 tokens/s de generacion en la configuracion medida con MTP activado. El rendimiento variara segun prompt, contexto y build de software.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-122B-A10B (esta ficha, NVFP4) | 122B totales / ~10B activos | 262K (1M con YaRN) | Apache-2.0 | Multimodal, MTP, optimizado para Blackwell |
| Qwen3.5-27B (hermano menor) | 27B | no disponible | Apache-2.0 | Segun la model card, supera al 122B en algunos benchmarks seleccionados |
| GPT-5-mini | no disponible | no disponible | Propietaria | Lidera en CodeForces segun la model card |
| Otros MoE de ~100B+ | no disponible | no disponible | no disponible | No se dispone de datos comparativos adicionales en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion NVFP4 esta disenada para hardware NVIDIA Blackwell; en GPUs de generaciones anteriores el soporte puede ser limitado o inexistente.
- El tag de idioma declarado en el repo es unicamente `en`, aunque la model card afirma soporte de 201 idiomas; conviene validar el rendimiento multilingue antes de usarlo en produccion.
- La cuantizacion a 4 bits puede degradar ligeramente la calidad respecto al modelo base en tareas sensibles a precision (matematicas, codigo).
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas agenticas con herramientas externas.
- El modo thinking por defecto incrementa el consumo de tokens y la latencia; puede requerir ajuste para aplicaciones de baja latencia.
- Aunque la licencia es Apache-2.0, conviene revisar las condiciones del modelo base Qwen3.5-122B-A10B y de las dependencias (llama.cpp, ModelOpt) para uso comercial.
- El repo tiene 0 descargas y 1 like en el momento de la consulta; es una publicacion reciente (noviembre de 2026) sin validacion comunitaria extensa.
- Los resultados de rendimiento corresponden a una configuracion concreta de hardware y software; no deben extrapolarse sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.5-122B-A10B-NVFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Archivo NVFP4: https://huggingface.co/prithivMLmods/Qwen3.5-122B-A10B-NVFP4-GGUF/blob/main/Qwen3.5-122B-A10B-NVFP4.gguf
- Archivo mmproj: https://huggingface.co/prithivMLmods/Qwen3.5-122B-A10B-NVFP4-GGUF/blob/main/Qwen3.5-122B-A10B-NVFP4.mmproj.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
