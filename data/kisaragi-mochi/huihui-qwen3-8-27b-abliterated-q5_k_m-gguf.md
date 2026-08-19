# kisaragi-mochi/Huihui-Qwen3.8-27B-abliterated-Q5_K_M-GGUF

## Resumen

Este repositorio aloja una conversión a GGUF en cuantización Q5_K_M del modelo `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, una variante "abliterated" (con la capa de rechazo eliminada) del modelo Qwen3.8-27B de Alibaba. El autor, kisaragi-mochi, realizó la conversión de los pesos safetensors originales a formato GGUF utilizando las herramientas de llama.cpp, sin incluir el proyector de visión, por lo que es un modelo exclusivamente de texto.

El modelo base presenta una arquitectura densa híbrida que combina DeltaNet y atención con compuertas (gated-attention), con 27.320 millones de parámetros. La cuantización Q5_K_M ofrece un equilibrio entre fidelidad y uso de memoria, siendo aproximadamente un 16% más grande que la Q4_K_M oficial. Está pensado para usuarios que disponen de suficiente VRAM o RAM y desean mayor calidad de generación que la ofrecida por la cuantización Q4_K del repositorio oficial.

La relevancia de este modelo radica en su naturaleza "abliterated": al eliminar los mecanismos de rechazo del modelo original, responde a un rango más amplio de solicitudes, lo que lo hace atractivo para aplicaciones donde se requiere una generación de texto sin restricciones temáticas, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa, híbrida DeltaNet + gated-attention |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 131.072 tokens (validado en Q4_K_M; en Q5_K_M solo confirmado hasta 32.768) |
| Tipos de cuantizacion | Q5_K_M (este repo), Q4_K (oficial), Q4_K_M (mencionado en benchmarks) |
| Idiomas soportados | Inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único de 18,2 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura densa que combina capas de atención con compuertas y bloques DeltaNet, una variante de atención lineal que reduce el coste computacional en secuencias largas. No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. El proceso de "abliteration" aplicado por huihui-ai consiste en la eliminación de los pesos responsables de los comportamientos de rechazo, lo que reduce la probabilidad de que el modelo se niegue a responder a ciertas solicitudes.

La conversión a GGUF se realizó con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp (commit `9b05354`), sin utilizar imatrix. El archivo resultante es de 18,2 GiB, con una tasa de bits de 5,72 BPW.

## Capacidades

- Generación de texto en inglés y japonés con fluidez natural.
- Modo de razonamiento (thinking mode) que separa `reasoning_content` de `content`; se puede desactivar con `--reasoning off` para reducir latencia.
- Comportamiento "abliterated": responde a solicitudes que el modelo original rechazaría, incluyendo contenido sensible o controvertido.
- No incluye capacidades de visión (el proyector de imagen no se incluyó en la conversión).
- No se ha confirmado soporte para tool calling o function calling en esta variante específica.

## Casos de uso

- Generación de narrativa creativa sin restricciones temáticas: el modelo no rechaza solicitudes de escritura de ficción con contenido adulto, violencia o temas tabú, lo que lo hace útil para autores que exploran géneros no convencionales.
- Chatbot para comunidades con moderación laxa: puede desplegarse como asistente conversacional en foros o plataformas donde se requiere una respuesta directa sin filtros morales.
- Análisis y generación de texto en japonés: gracias a su soporte nativo del idioma, es adecuado para tareas de procesamiento de lenguaje natural en japonés, como resúmenes, traducción o generación de contenido.
- Prototipado de aplicaciones de IA sin capa de seguridad: investigadores pueden estudiar el comportamiento de un modelo sin mecanismos de rechazo para entender los límites de la alineación.
- Generación de código y asistencia técnica: aunque no está confirmado, la familia Qwen3 suele tener buen rendimiento en tareas de programación; el modelo puede probarse para autocompletado o generación de scripts.
- Experimentación con razonamiento de múltiples pasos: el modo de pensamiento permite obtener cadenas de razonamiento detalladas antes de la respuesta final, útil para tareas de lógica o matemáticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente mediciones de rendimiento de inferencia realizadas por el autor:

| Métrica | Valor (Q5_K_M, 2x RTX 3090) | Valor (Q4_K_M, 1x RTX 3090, referencia) |
|---|---|---|
| Prompt processing | 122,2 tok/s | 1380–1382 tok/s (pp512) |
| Generación | 39,0 tok/s | 42,8–42,9 tok/s (tg128) |
| VRAM utilizada | ~25,96 GB (ctx 32768) | 22,6 GB (ctx 131072) |
| Decodificación especulativa MTP | No verificado | +56% (42,0 → 65,6 tok/s) |

Estos datos son mediciones directas del autor y no deben considerarse benchmarks comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada: ~26 GB para Q5_K_M con contexto de 32.768 tokens en dos GPUs (12,97 + 12,99 GB). En una sola GPU de 24 GB, se espera que quepa con un contexto menor, pero no se ha medido.
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 24 GB de VRAM para contexto moderado. Para contexto completo (131K) se requiere una GPU de 24 GB solo con Q4_K_M.
- En consumer GPU: sí, una RTX 3090/4090 puede ejecutar el modelo con contexto reducido (probado hasta 32K en Q5_K_M con dos GPUs).
- Opciones de despliegue: llama.cpp (llama-server), compatible con vLLM, Ollama y TGI mediante conversión adicional.
- Latencia y throughput: generación de ~39 tok/s en dos RTX 3090; con decodificación especulativa MTP podría aumentar hasta ~65 tok/s (no verificado en Q5_K_M).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated (Q5_K_M, este repo) | 27,3B | 131K (validado en Q4_K_M) | Q5_K_M | Apache 2.0 | Sin censura, texto-only |
| Huihui-Qwen3.8-27B-abliterated (Q4_K oficial) | 27,3B | 131K | Q4_K | Apache 2.0 | Incluye proyector de visión |
| Qwen3-8B (base) | 8B | 32K | Varias | Apache 2.0 | Modelo más pequeño, con censura estándar |

No se dispone de datos de rendimiento comparativos entre estos modelos en tareas de razonamiento o generación.

## Limitaciones y advertencias

- Modelo "abliterated": al eliminar los mecanismos de rechazo, puede generar contenido inapropiado, ofensivo o ilegal. No incluye capa de moderación alguna.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados.
- Contexto limitado en una sola GPU: con Q5_K_M, el contexto máximo en una RTX 3090 de 24 GB no ha sido verificado más allá de 32K; para contextos mayores se requiere Q4_K_M o múltiples GPUs.
- Idiomas limitados: solo se confirma soporte para inglés y japonés; otros idiomas pueden funcionar pero con menor calidad.
- Sin capacidades de visión: a diferencia del Q4_K oficial, este archivo no incluye el proyector de imagen, por lo que no puede procesar entradas visuales.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar políticas de plataformas o leyes locales; el usuario asume la responsabilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kisaragi-mochi/Huihui-Qwen3.8-27B-abliterated-Q5_K_M-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio oficial de GGUF (Q4_K): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Página de Ollama para Qwen3 abliterated: https://ollama.com/huihui_ai/qwen3-abliterated
