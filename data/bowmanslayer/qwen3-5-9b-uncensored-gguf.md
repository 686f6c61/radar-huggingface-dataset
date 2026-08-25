# bowmanslayer/Qwen3.5-9B-Uncensored-GGUF

## Resumen

El modelo `bowmanslayer/Qwen3.5-9B-Uncensored-GGUF` es una versión cuantizada en formato GGUF del modelo `bowmanslayer/Qwen3.5-9B-Uncensored`, que a su vez es un ajuste fino "abliterated" (eliminación de rechazos y filtros de seguridad) del modelo base Qwen/Qwen3.5-9B de Alibaba. El autor, bowmanslayer, ha publicado esta variante para permitir la ejecución local eficiente en hardware de consumo mediante llama.cpp, con múltiples niveles de cuantización que van desde BF16 hasta IQ4_XS.

Este modelo resuelve el problema de ejecutar un LLM de 9.000 millones de parámetros sin restricciones de contenido en entornos locales, manteniendo la calidad del modelo original pero reduciendo los requisitos de VRAM. Su relevancia actual radica en la demanda de modelos uncensored para escritura creativa, roleplay y generación de contenido sin filtros, así como en la creciente disponibilidad de herramientas de inferencia local como llama.cpp y vLLM.

El modelo tiene aproximadamente 9.200 millones de parámetros y soporta una longitud de contexto de 32.768 tokens, según se indica en las instrucciones de uso de llama.cpp. Está disponible en varios formatos de cuantización GGUF, con tamaños que van desde 5 GB hasta 18 GB, y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en llama.cpp) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso con aproximadamente 9.200 millones de parámetros. La versión uncensored se obtiene mediante un proceso de "abliteración", que consiste en eliminar las capas o activaciones responsables de generar rechazos y respuestas de seguridad, permitiendo que el modelo responda sin restricciones de contenido. El ajuste fino se realizó sobre el modelo original de Qwen, y posteriormente se cuantizó a formato GGUF para su uso con llama.cpp.

Los datos de entrenamiento no se especifican en la información proporcionada. Se sabe que el modelo base es Qwen3.5-9B, que fue entrenado con un corpus masivo en inglés y chino, pero no se detalla la composición del dataset ni si se aplicaron técnicas como RLHF o DPO en el ajuste fino. La abliteración es un proceso post-entrenamiento que no modifica los pesos originales más allá de la eliminación de ciertas direcciones en el espacio de activaciones.

## Capacidades

- Generacion de texto sin filtros de contenido: el modelo no produce rechazos ni advertencias de seguridad, lo que lo hace util para escritura creativa, roleplay y contenido adulto.
- Razonamiento y conocimiento general: hereda las capacidades del Qwen3.5-9B base, incluyendo razonamiento lógico, comprensión lectora y conocimiento enciclopedico.
- Generacion de codigo y matemáticas: el modelo base es competente en tareas de programación y resolución de problemas matemáticos.
- Multilingüe: soporta inglés y chino (según la card), aunque el base probablemente maneja más idiomas, la version GGUF solo declara estos dos.
- Sin vision: esta version GGUF es solo texto. El modelo original puede ser multimodal (con torre visual), pero el GGUF no incluye el componente `mmproj`, por lo que no puede procesar imagenes.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar ficcion, poesia, guiones y otros contenidos literarios sin limitaciones de contenido, lo que es util para escritores que exploran temas sensibles.
- Roleplay y chat de personajes: su capacidad de mantener conversaciones multi-turno y su falta de censura lo hacen adecuado para plataformas de roleplay como SillyTavern o OpenCode.
- Generacion de codigo en entornos locales: al ejecutarse en GPU de consumo, puede integrarse en pipelines de desarrollo como asistente de codigo, siempre que no se requiera vision.
- Prototipado de agentes conversacionales: con su contexto de 32K tokens, puede gestionar conversaciones largas y recopilar contexto en aplicaciones de chatbot locales.
- Educacion e investigacion en modelos abliterated: sirve como referencia para estudiar los efectos de la abliteración en el comportamiento del modelo, en comparación con el modelo original.
- Despliegue en servidores personales: mediante llama-server, se puede exponer una API OpenAI-compatible para integrarse con herramientas como OpenCode, LangChain o aplicaciones propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La guia de codersera.com menciona benchmarks del modelo, pero no he podido acceder al contenido. No hay datos de MMLU, HumanEval, GSM8K u otros para esta version especifica. El rendimiento en tareas generales deberia ser similar al del Qwen3.5-9B base, pero no se puede confirmar.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - BF16: ~18 GB (recomendado para GPU con 24 GB o mas)
  - Q8_0: ~10 GB (16 GB+ GPU)
  - Q6_K: ~7.6 GB (12 GB+ GPU)
  - Q5_K_M: ~6.5 GB (12 GB GPU)
  - Q4_K_M: ~5.5 GB (8 GB+ GPU)
  - IQ4_XS: ~5 GB (8 GB GPU)
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100, o cualquier GPU con suficiente VRAM segun la cuantizacion elegida.
- Compatibilidad con consumer GPU: si, a partir de 8 GB de VRAM (Q4_K_M e IQ4_XS).
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama (si se convierte a formato compatible), vLLM (para la version W4A16, no la GGUF).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con modelos alternativos de la misma categoria (p.ej., otros modelos abliterados de ~9B). Se puede mencionar que existen otras versiones uncensored de Qwen3.5, como `bowmanslayer/Qwen3.8-27B-Uncensored-GGUF` (27B) o `suldanpashir/Qwen3.5-9B-Uncensored`, pero no se han publicado comparativas de rendimiento.

## Limitaciones y advertencias

- **Sesgos y contenido dañino**: al eliminar los filtros de seguridad, el modelo puede generar contenido ofensivo, ilegal o eticamente cuestionable. Su uso en produccion requiere supervisión humana y es responsabilidad del usuario.
- **Riesgo de alucinacion**: como cualquier LLM, puede inventar informacion, especialmente en contextos largos. La abliteración puede aumentar este riesgo al no tener mecanismos de rechazo.
- **Limitaciones de idioma**: solo se declaran soporte para ingles y chino; otros idiomas pueden dar resultados de menor calidad.
- **Sin vision en GGUF**: la version GGUF no incluye el procesador de imagenes, por lo que no se puede usar con entradas multimodales. Para vision se debe usar la version bf16 o W4A16 con vLLM.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el contenido generado puede violar politicas de plataformas o leyes locales.
- **Contexto limitado**: aunque se configura 32K tokens, la memoria KV puede limitar el contexto real si no se usan cuantizaciones KV adecuadas (se recomienda int8 KV).

## Enlaces

- [HuggingFace: bowmanslayer/Qwen3.5-9B-Uncensored-GGUF](https://huggingface.co/bowmanslayer/Qwen3.5-9B-Uncensored-GGUF)
- [HuggingFace: bowmanslayer/Qwen3.5-9B-Uncensored (modelo base)](https://huggingface.co/bowmanslayer/Qwen3.5-9B-Uncensored)
- [HuggingFace: bowmanslayer/Qwen3.5-9B-Uncensored-W4A16](https://huggingface.co/bowmanslayer/Qwen3.5-9B-Uncensored-W4A16)
- [HuggingFace: Qwen/Qwen3.5-9B (modelo original)](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Guia de instalacion y benchmarks (codersera.com)](https://codersera.com/blog/unrestricted-uncensored-qwen35-9b-abliterated-full-guide/)
- [Noticia sobre fine-tunes uncensored (uncensoredhub.ai)](https://uncensoredhub.ai/news/2026-07-11-qwen-3-5-9b-uncensored-writer-fine-tunes-land-in-gguf-quantizations)
- [Guia de ejecucion local con RTX 3090/4090 (groff.dev)](https://www.groff.dev/blog/run-qwen-3-5-9b-uncensored-locally-with-opencode)
