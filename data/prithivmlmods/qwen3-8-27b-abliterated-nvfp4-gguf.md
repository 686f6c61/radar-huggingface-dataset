# prithivMLmods/Qwen3.8-27B-abliterated-NVFP4-GGUF

## Resumen

Qwen3.8-27B-abliterated-NVFP4-GGUF es una cuantización NVFP4 en formato GGUF del modelo Qwen3.8-27B, un modelo de lenguaje multimodal (visión-lenguaje) denso de 27.320.698.848 parámetros desarrollado por el equipo Qwen. La cuantización y conversión a GGUF ha sido realizada por el usuario prithivMLmods utilizando llama.cpp, partiendo de la versión abliterada publicada por Huihui AI (huihui-ai/Huihui-Qwen3.8-27B-abliterated), es decir, una variante a la que se han aplicado técnicas de "abliteración" para reducir los mecanismos internos de rechazo del modelo original.

El modelo base se construye sobre la arquitectura Qwen3.5 y combina atención lineal Gated DeltaNet con capas periódicas de Gated Attention en una estructura híbrida de 64 capas, con soporte de Multi-Token Prediction (MTP) para decodificación especulativa y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1M mediante YaRN. Su relevancia actual radica en que permite ejecutar localmente, con precisión de 4 bits optimizada para GPUs NVIDIA Blackwell, un modelo con capacidades destacadas en código agéntico, uso de ordenador y razonamiento multimodal.

Esta ficha cubre el repositorio cuantizado en sí; los benchmarks y capacidades referenciados corresponden al modelo base Qwen3.8-27B según su model card, y no a la variante abliterada cuantizada, cuyo rendimiento puede diferir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Gated DeltaNet + Gated Attention), 64 capas, multimodal (visión-lenguaje) |
| Parametros totales | 27.320.698.848 (~27,3B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos (extensible a 1M con YaRN); probado con 16.384 en llama.cpp |
| Tipos de cuantizacion | NVFP4 (archivo principal, 19,7 GB) + mmproj para visión (931 MB) |
| Idiomas soportados | Inglés (según model card del repo; el modelo base Qwen es habitualmente multilingue, pero no hay datos especificos aqui) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo principal NVFP4 + archivo mmproj para el proyector multimodal) |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-27B se basa en la fundación Qwen3.5 y emplea un diseño híbrido de 64 capas que combina atención lineal Gated DeltaNet con capas periódicas de Gated Attention. Este enfoque híbrido reduce el coste de la atención sobre contextos largos manteniendo calidad de modelado. El modelo incorpora Multi-Token Prediction (MTP), que en el formato GGUF se integra como cabezas de salida adicionales dentro de los propios pesos, permitiendo decodificación especulativa sin necesidad de un modelo "draft" separado: en una sola pasada hacia adelante se predicen varios tokens futuros (en las pruebas se usa `draft_n_max=2`).

El modelo es multimodal y soporta comprensión de imagen y vídeo mediante un proyector visión-lenguaje distribuido como archivo mmproj separado. El "thinking mode" está activado por defecto, con nivel de esfuerzo de razonamiento configurable (`xhigh`, `medium`, `low`). No hay información disponible sobre el número de tokens de entrenamiento ni la composición del dataset. La variante abliterada de Huihui AI aplica modificaciones sobre los pesos para suprimir las direcciones de rechazo en las activaciones, eliminando en la práctica los mecanismos de seguridad del modelo original.

## Capacidades

- Generación de texto conversacional con thinking mode activado por defecto y `reasoning_effort` configurable (`xhigh`, `medium`, `low`).
- Comprensión multimodal: análisis de imagen y vídeo, visual question answering, razonamiento visual, comprensión de documentos y generación de descripciones de imagen (image captioning).
- Generación de codigo y razonamiento agéntico: resultados destacados del modelo base en Terminal-Bench 2.1 (73,0), SWE-bench Pro (61,7) y LiveCodeBench v6 (90,3).
- Tareas de uso de ordenador (computer use): OSWorld-Verified (84,3) y AndroidWorld (81,9) en el modelo base.
- Razonamiento científico: GPQA-Diamond (89,2) y seguimiento de instrucciones: IFBench (79,5) en el modelo base.
- Decodificación especulativa integrada mediante MTP en los propios pesos GGUF, sin modelo draft externo.
- Contexto largo: 262.144 tokens nativos, extensible a 1M con YaRN.
- Variante abliterada: sin rechazos de seguridad, responde a instrucciones que el modelo original denegaría.

## Casos de uso

- Ejecución local en GPU Blackwell: la cuantización NVFP4 está optimizada para GPUs NVIDIA de la serie Blackwell (como la RTX PRO 6000), permitiendo inferencia local de alta velocidad (111,67 tokens/s de generación) de un modelo de 27B en ~18,2 GiB de VRAM.
- Agentes de codigo y terminal: gracias a los resultados del modelo base en Terminal-Bench 2.1 y SWE-bench Pro, es adecuado para agentes que navegan repositorios, ejecutan comandos y corrigen errores de forma autónoma en multi-step reasoning.
- Automatización de interfaces gráficas: el soporte de computer use (OSWorld, AndroidWorld) lo hace candidato para agentes que operan escritorios o aplicaciones Android mediante capturas de pantalla y acciones.
- Comprensión de documentos: el pipeline image-text-to-text permite extraer y razonar sobre documentos escaneados, formularios e informes con contenido visual.
- Analisis de imagen y vídeo: clasificación, descripción y respuesta a preguntas sobre contenido visual, útil en moderación, indexación de bibliotecas multimedia o asistentes de análisis.
- Investigación y prototipado sin filtros: la versión abliterada permite estudiar el comportamiento del modelo sin capas de rechazo, útil en entornos de investigación controlados (con las advertencias eticas y legales correspondientes).
- Inferencia con contexto largo: la ventana nativa de 262K tokens (probada a 16K en llama.cpp) permite procesar bases de codigo amplias o conversaciones multi-turno extensas.

## Benchmarks y rendimiento

Resultados publicados del modelo base Qwen3.8-27B (no de la variante abliterada cuantizada):

| Benchmark | Puntuacion |
|---|---|
| Terminal-Bench 2.1 | 73,0 |
| SWE-bench Pro | 61,7 |
| OSWorld-Verified | 84,3 |
| AndroidWorld | 81,9 |
| LiveCodeBench v6 | 90,3 |
| GPQA-Diamond | 89,2 |
| IFBench | 79,5 |

Rendimiento de inferencia medido por el autor del repo (RTX PRO 6000 Blackwell, 96 GB VRAM, llama.cpp, `-ngl 99`, KV cache q8_0, contexto 16.384, MTP con `draft_n_max=2`, 5 ejecuciones):

| Metrica | Valor |
|---|---|
| Procesamiento de prompt | 220,54 tokens/s |
| Velocidad de generacion | 111,67 tokens/s |
| Tiempo medio por ejecucion (wall) | 11,44 s |
| VRAM pico en GPU | 18,22 GiB |
| Utilizacion pico de GPU | 96 % |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) para la variante abliterada cuantizada en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~18,2 GiB de VRAM pico con el archivo NVFP4 (19,7 GB) en contexto de 16.384 tokens y KV cache q8_0, segun las pruebas del autor. Con contexto mayor (262K nativos) el consumo creceria sustancialmente; no hay mediciones disponibles.
- GPU recomendada: NVIDIA RTX PRO 6000 Blackwell (Server Edition, 96 GB), donde se realizaron las pruebas. La cuantizacion NVFP4 está orientada a hardware Blackwell; en GPUs anteriores el soporte puede ser limitado o inexistente en llama.cpp.
- Consumer GPUs: no cabe comodamente en GPUs consumer de 24 GB (RTX 3090/4090) con descarga completa; con descarga parcial a CPU seria posible pero muy lento. No hay mediciones disponibles para esos escenarios.
- Despliegue: llama.cpp / llama-cli (verificado), con soporte de MTP speculative decoding (`--spec-type draft-mtp`). El modelo base soporta ademas Transformers, vLLM, SGLang y TokenSpeed, aunque esta ficha cubre el GGUF cuantizado.
- Latencia y throughput: 111,67 tokens/s de generacion y 220,54 tokens/s de procesamiento de prompt en la configuracion de prueba descrita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-abliterated-NVFP4 (este repo) | 27,3B (denso) | 262K (1M con YaRN) | Si (imagen y video) | Apache 2.0 | GGUF NVFP4, abliterado, MTP integrado |
| Qwen/Qwen3.8-27B (base) | 27,3B (denso) | 262K (1M con YaRN) | Si | Apache 2.0 | Version original con mecanismos de seguridad |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,3B (denso) | 262K (1M con YaRN) | Si | Apache 2.0 | Abliterada, pesos sin cuantizar (safetensors) |

No se dispone de datos de rendimiento comparativo directo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Variante abliterada: se han eliminado los mecanismos de seguridad del modelo. Esto implica riesgo elevado de generar contenido harmful, ilegal o sesgado. Su uso exige responsabilidad legal y etica plena del operador y no es adecuado para entornos de produccion orientados a usuarios finales sin salvaguardas externas.
- Riesgo de alucinacion: no hay datos especificos publicados; como todo LLM, puede generar informacion falsa con apariencia plausible, agravado en la variante abliterada por la ausencia de rechazos.
- Idioma: el repo declara solo ingles; el rendimiento en castellano u otros idiomas no esta documentado en la informacion disponible.
- Cuantizacion NVFP4: optimizada para GPUs Blackwell; en hardware no compatible puede no funcionar o requerir dequantizacion con penalizacion de rendimiento.
- La abliteracion y la cuantizacion a 4 bits pueden degradar la calidad respecto al modelo base; no se han publicado benchmarks de la variante cuantizada que lo confirmen o desmienta.
- Contexto: las pruebas se realizaron a 16.384 tokens; el uso de la ventana completa de 262K en llama.cpp con este GGUF no esta documentado.
- Licencia Apache 2.0: permite uso comercial, pero el operador asume toda la responsabilidad sobre los contenidos generados por la variante sin filtros.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/prithivMLmods/Qwen3.8-27B-abliterated-NVFP4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente abliterada: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Archivo principal NVFP4: https://huggingface.co/prithivMLmods/Qwen3.8-27B-abliterated-NVFP4-GGUF/blob/main/Qwen3.8-27B-abliterated-NVFP4.gguf
- Archivo mmproj (vision): https://huggingface.co/prithivMLmods/Qwen3.8-27B-abliterated-NVFP4-GGUF/blob/main/Qwen3.8-27B-abliterated-NVFP4.mmproj.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Autor de la cuantizacion: https://huggingface.co/prithivMLmods
