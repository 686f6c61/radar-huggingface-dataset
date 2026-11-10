# ji-farthing/Qwen3.8-27B-NVFP4_KS-GGUF

## Resumen

Qwen3.8-27B-NVFP4_KS-GGUF es una conversión al formato GGUF del checkpoint NVFP4 publicado por NVIDIA, realizada por el usuario ji-farthing para su uso exclusivo con ik_llama.cpp. El modelo subyacente es Qwen3.8-27B, un transformer denso de 27.320.698.049 parámetros (unos 27,3 mil millones) desarrollado por el equipo Qwen, del que no se detallan en la información disponible ni la longitud de contexto ni la composición del dataset de entrenamiento. La particularidad de esta ficha es que no se trata de una cuantización nueva: los pesos NVFP4 son los del checkpoint original de NVIDIA, sin recuantizar, y se preservan las escalas de entrada (input scales) de cada tensor NVFP4.

El interés técnico reside en el layout `NVFP4_KS` de ik_llama.cpp, una implementación de inferencia alternativa a llama.cpp que sí soporta este tipo de tensor de 4 bits con escalas de activación. El resultado es un archivo de 21,5 GB que permite ejecutar un modelo de 27B en precisión efectiva de 4 bits sobre GPUs Blackwell, con decodificación de activaciones en 4 u 8 bits según el flag `--nvfp4-precision`. La conversión es relevante para quienes trabajan con hardware Blackwell y quieren exprimir el formato NVFP4 nativo sin pasar por una recuantización que degrade la calidad.

La licencia es Apache-2.0, heredada del checkpoint origen, lo que facilita el uso comercial. No obstante, el modelo solo es cargable con ik_llama.cpp: llama.cpp no dispone del tipo `NVFP4_KS`, lo que limita la portabilidad del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B; detalles de atención/FFN no disponibles) |
| Parametros totales | 27.320.698.049 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4_KS (193 tensores), Q8_0 (208 tensores), BF16 (105 tensores), F32 (553 tensores) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (layout NVFP4_KS de ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27,3 mil millones de parámetros. La información proporcionada no incluye detalles sobre el número de capas, la dimensión oculta, el tipo de atención ni el volumen o composición del dataset de entrenamiento, ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifica la longitud de contexto nativa del checkpoint original.

La innovación destacable de esta ficha no está en el entrenamiento sino en el pipeline de conversión. El checkpoint de NVIDIA es de tipo ModelOpt `MIXED_PRECISION`: combina capas en NVFP4 con capas en FP8. Como ik_llama.cpp no tiene un tipo FP8, la conversión con `convert_hf_to_gguf.py` (usando `--fp8-as-q8`) almacena esas capas como Q8_0; en concreto, `attn_qkv`, `attn_gate` y `ssm_out` en 46 capas, y `attn_q`, `attn_k`, `attn_v` y `attn_output` en 15 capas. Posteriormente, `llama-quantize ... COPY` con una rama parcheada de ik_llama.cpp escribe cada peso NVFP4 como `NVFP4_KS` conservando sus filas y su `.input_scale`. Las capas MTP (multi-token prediction) no se convierten. El resultado contiene 193 tensores NVFP4_KS, 208 Q8_0, 105 BF16, 553 F32 y 193 escalas de entrada.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio y la compatibilidad con endpoints indican uso previsto en diálogo.
- Razonamiento y generación de texto general: heredado del modelo base Qwen3.8-27B, aunque no se detallan capacidades específicas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Inferencia con activaciones de 4 bits (NVFP4) u 8 bits (int8) en GPUs Blackwell, seleccionable mediante `--nvfp4-precision`.

## Casos de uso

- Despliegue de un modelo de 27B en GPUs Blackwell con memoria limitada: el archivo de 21,5 GB y la precisión efectiva de 4 bits permiten cargar el modelo en una única GPU de 24-32 GB, algo inviable con pesos BF16 (unos 54 GB).
- Evaluación de precisión NVFP4 frente a cuantizaciones convencionales: el repositorio incluye mediciones de perplejidad en wikitext-2 con `--nvfp4-precision auto` e `int8`, lo que permite comparar el impacto de las activaciones de 4 bits frente a 8 bits en un mismo checkpoint.
- Investigación en formatos de cuantización: sirve como caso de estudio de un pipeline que preserva escalas de entrada por tensor (`input_scale`) y evita la recuantización, útil para quienes diseñan esquemas de cuantización mixta.
- Servicio de chat conversacional autoalojado: la licencia Apache-2.0 y el tag `conversational` permiten integrarlo en un endpoint propio con ik_llama.cpp como servidor, siempre que el hardware sea Blackwell.
- Reproducción de resultados de perplejidad: el autor documenta el comando exacto (`-c 512 --chunks 8` sobre `wiki.test.raw`) y el hardware (GB10), lo que facilita replicar la medición y auditar la fidelidad de la conversión.
- Validación de fidelidad de conversión: el autor compara el archivo de log-probabilidades generado con `--kl-divergence-base` contra el del archivo mainline en ik_llama.cpp y comprueba que son idénticos, un caso práctico de control de calidad en pipelines de cuantización.

## Benchmarks y rendimiento

El autor publica únicamente perplejidad en wikitext-2 (`wiki.test.raw`, `-c 512 --chunks 8`, hardware GB10). No hay resultados de MMLU, HumanEval, GSM8K ni otras tareas.

| Configuracion | Perplejidad (wikitext-2) |
|---|---|
| `--nvfp4-precision auto` | 6,7052 ± 0,36538 |
| `--nvfp4-precision int8` | 6,6061 ± 0,35988 |

El autor indica además que el archivo de log-probabilidades codificadas generado con `--kl-divergence-base` es idéntico al del archivo mainline en ik_llama.cpp con ambas configuraciones, lo que sugiere que la conversión a NVFP4_KS no altera la distribución de salida respecto al checkpoint de referencia en ese test.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 21,5 GB, por lo que se necesita al menos esa cantidad de memoria más el espacio para el contexto y el estado de inferencia; una estimación conservadora sitúa el mínimo en torno a 24 GB.
- GPU recomendadas: GPUs NVIDIA Blackwell, ya que el uso de las escalas de entrada NVFP4 con `--nvfp4-precision auto` está documentado para esa arquitectura; el autor cita una GB10 como hardware de prueba.
- ¿Cabe en GPU consumer? No hay confirmación en la información disponible; por tamaño (21,5 GB) encajaría en GPUs consumer de 24 GB o más, pero la dependencia de Blackwell y de ik_llama.cpp limita qué modelos concretos son válidos.
- Opciones de despliegue: exclusivamente ik_llama.cpp (carga con mmap). No es compatible con llama.cpp, que carece del tipo `NVFP4_KS`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ji-farthing/Qwen3.8-27B-NVFP4_KS-GGUF | 27,3 B | no disponible | GGUF NVFP4_KS | Apache-2.0 | Solo ik_llama.cpp; requiere Blackwell para activaciones de 4 bits |
| nvidia/Qwen3.8-27B-NVFP4 | 27,3 B | no disponible | ModelOpt MIXED_PRECISION (NVFP4 + FP8) | Apache-2.0 | Checkpoint origen; requiere stack NVIDIA/ModelOpt |
| Qwen/Qwen3.8-27B | 27,3 B | no disponible | safetensors (BF16) | Apache-2.0 | Modelo base sin cuantizar; mayor huella de memoria |

## Limitaciones y advertencias

- Compatibilidad restringida: el archivo solo carga en ik_llama.cpp; llama.cpp no implementa el tipo `NVFP4_KS`. Cualquier pipeline basado en llama.cpp, Ollama o vLLM queda excluido.
- Dependencia de hardware: el uso de escalas de entrada NVFP4 con activaciones de 4 bits está documentado para Blackwell; en otras arquitecturas el comportamiento no está especificado en la información disponible.
- Las capas MTP no se convierten, por lo que no se puede aprovechar la decodificación especulativa basada en multi-token prediction del checkpoint original.
- Las capas FP8 del checkpoint original se almacenan como Q8_0 por ausencia de tipo FP8 en ik_llama.cpp; esto no es una recuantización de los pesos NVFP4, pero sí una representación distinta de esas capas respecto al checkpoint de NVIDIA.
- Riesgo de alucinación y sesgos: no hay información específica publicada para este artefacto; deben asumirse los del modelo base Qwen3.8-27B, no documentados aquí.
- Idiomas soportados: el campo de idiomas del repositorio está vacío y no se detalla en la model card.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (2026-11-10): no hay evidencia de uso en producción ni validación por terceros.
- La rama de ik_llama.cpp utilizada (`filament/nvfp4ks-input-scale-main`) es una propuesta de pull request, no código mainline, lo que añade riesgo de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ji-farthing/Qwen3.8-27B-NVFP4_KS-GGUF
- Modelo base (checkpoint NVIDIA): https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Revisión concreta del checkpoint base: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4/tree/482ca0f3832238542f8f5295dde86b5f22711d80
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- Commit de la rama de conversión: https://github.com/joelfarthing/ik_llama.cpp/commit/f415f9163307507fecb7f4a040fee85132d11114
