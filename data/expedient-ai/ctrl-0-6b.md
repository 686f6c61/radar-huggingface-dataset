# expedient-ai/CTRL-0.6B

## Resumen

CTRL-0.6B es un ajuste fino mediante QLoRA sobre Qwen/Qwen3-0.6B desarrollado por expedient-ai, concebido como la variante "in-browser" de su agente Expedient para soporte empresarial. El modelo no pretende competir en conocimiento factual con modelos mayores: su razon objetivo es caber en una pestaña del navegador. Frente a los 1,45 GB del GGUF de CTRL-2B, la cuantización Q4_K_M de CTRL-0.6B ocupa 378 MB, y la arquitectura Qwen es compatible con las compilaciones WASM de llama.cpp, lo que permite ejecución completamente en cliente sin servidor.

El modelo parte de un transformer denso de 596.049.920 parámetros (aproximadamente 0,6B) y se entrena con supervisión únicamente sobre el turno del asistente, en formato Qwen ChatML con bloque de pensamiento vacío. La innovación no está en la arquitectura sino en el diseño del sistema: el adaptador aprende voz y formato, mientras que toda la fiabilidad factual se delega en recuperación (RAG) con pasajes precalculados mediante BAAI/bge-small-en-v1.5.

Es relevante ahora porque demuestra un patrón práctico para despliegues de agentes de soporte en el borde: un adaptador pequeño, un índice de recuperación empaquetado y un runtime WASM. Los resultados medidos por el autor muestran que en modo open-book alcanza un recall de 0,962 y una precisión de 1,000 sobre 26 preguntas retenidas, sin inventar cifras cuando dispone de extractos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-0.6B) con adaptador QLoRA (r16, α32) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF); adaptador en safetensors (NF4 double-quant en entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (modelo base y adaptador) |
| Formato de pesos | safetensors (adaptador LoRA), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por adaptadores de bajo rango sobre Qwen3-0.6B, un transformer denso de 0,6B parámetros. El entrenamiento emplea QLoRA con rango 16, alpha 32, learning rate 2e-4 con decaimiento coseno, batch efectivo de 16 y 4 épocas, totalizando 211 pasos (aproximadamente 14 minutos en una RTX 4050 Laptop con 6 GB de VRAM). Se usa cuantización NF4 double-quant con cómputo en bf16. La supervisión se aplica solo al turno del asistente, y el formato de entrenamiento es Qwen ChatML con un bloque de pensamiento vacío: `<|im_start|>assistant\n<think>\n\n</think>\n\n{answer}`.

El corpus de entrenamiento consta de 939 filas de QA: 258 revisadas por primera parte y 681 promovidas mediante verificación automatizada contra páginas fuente. El método de triaje se documenta en CTRL-2B. El paquete de recuperación que acompaña al modelo incluye `kb_corpus.jsonl` (939 pasajes), `kb_emb.json` (vectores de pasajes) y `q_emb.json` (vectores de consulta para las preguntas curadas). Los vectores se precalculan con BAAI/bge-small-en-v1.5 (pooling CLS, normalización L2), de modo que el navegador solo ejecuta un producto escalar, sin descargar un embedder ni realizar pasadas de embedding en cliente.

## Capacidades

- Generación de texto conversacional orientada a soporte empresarial, con formato de respuesta entrenado sobre la base de conocimiento de Expedient.
- Respuestas ancladas en recuperación (retrieval-grounded): con extractos recuperados delante, el modelo responde citando cifras presentes en el contexto.
- Formato ChatML de Qwen con bloque de pensamiento vacío, lo que simplifica el parseo en producción.
- Ejecución en navegador mediante llama.cpp WASM y `@wllama/wllama` 2.3.1.
- Compatibilidad con endpoints estándar de generación de texto (etiqueta `endpoints_compatible`).
- Capacidad multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso autónomas: no disponible; el diseño es de recuperación más respuesta.
- Visión o audio: no soportado según la información disponible.

## Casos de uso

- Soporte técnico en el navegador sin backend: el modelo se ejecuta en cliente con el GGUF Q4_K_M de 378 MB y un índice de recuperación precalculado, de modo que la consulta del usuario y los pasajes no salen del dispositivo. Adecuado para entornos con requisitos de privacidad o despliegues en campo sin conectividad fiable.
- Asistente de documentación de producto embebido en una web: con los 939 pasajes del corpus empaquetado y los vectores de consulta precargados, el navegador solo calcula un producto escalar y pasa los extractos al modelo, que responde con cifras verificadas (precisión 1,000 en el conjunto de evaluación).
- Demo pública de bajo coste: el Space de demostración se sirve sin GPU de servidor, lo que reduce el coste operativo y la latencia de arranque frente a una instancia con CTRL-2B.
- Triaje de primera línea en mesas de ayuda: el adaptador reproduce la voz y el formato de la base de conocimiento de Expedient, por lo que puede redactar borradores de respuesta que un agente humano revisa antes de enviar.
- Clasificación y respuesta sobre FAQ internas: con el corpus de 939 pasajes y la recuperación hit@3 de 26/26, encaja en flujos de preguntas frecuentes donde la respuesta correcta está en la documentación y no requiere razonamiento abierto.
- Validación de pipelines RAG en CI: al ser un adaptador pequeño entrenable en 14 minutos en una GPU de portátil de 6 GB, sirve para iterar sobre formato, recuperación y prompts antes de escalar a CTRL-2B o a un modelo mayor.
- Prototipado de agentes en el borde con `@wllama/wllama`: permite validar la integración de llama.cpp WASM y el formato ChatML en la aplicación real antes de comprometer infraestructura.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre 26 preguntas retenidas con decodificación greedy. Recall = cifras gold presentes en la respuesta; precisión = cifras de la respuesta presentes en el gold (las cifras inventadas son la señal de alucinación).

| Configuración | Recall | Precisión |
|---|---|---|
| Qwen3-0.6B base, closed-book | 0,692 | no disponible |
| CTRL-0.6B, closed-book | 0,692 | 0,846 |
| CTRL-0.6B, open-book (extractos recuperados) | 0,962 | 1,000 |

Datos adicionales aportados por el autor: hit@3 de recuperación de 26/26 con rango gold medio 0,0; comprobación de 94 filas en forma de producción sobre el índice completo de 939 pasajes con 94/94 aciertos. Como referencia, CTRL-2B alcanza 0,772 de recall closed-book y 0,865 de precisión con 2,5B parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el GGUF Q4_K_M ocupa 378 MB en disco y el adaptador en safetensors se distribuye en un repo de 0,4 GB.
- Entrenamiento: 14 minutos y 211 pasos en una RTX 4050 Laptop con 6 GB de VRAM (QLoRA NF4, bf16).
- GPU recomendadas para servir el adaptador: cualquier GPU consumer con al menos 6 GB para el adaptador; para el modelo base completo en precisión nativa se requiere más memoria, no cuantificada en la información disponible.
- Cabe en GPU consumer: sí, en el rango de 6 GB en adelante para el adaptador; el GGUF Q4_K_M está pensado para ejecución en CPU y navegador.
- Opciones de despliegue: llama.cpp (cualquier build que soporte la arquitectura Qwen), `@wllama/wllama` 2.3.1 en navegador, y endpoints compatibles de generación de texto. vLLM, TGI u Ollama: no confirmado en la información disponible.
- Latencia y throughput: no disponibles. El autor señala que wllama 2.x incluye una versión antigua de llama.cpp que carga GGUFs de arquitectura Qwen pero no algunas arquitecturas más recientes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Recall closed-book | Precisión open-book | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CTRL-0.6B | 596 M | no disponible | 0,692 | 1,000 | Apache-2.0 | HuggingFace, GGUF y Space |
| CTRL-2B | ~2,5 B | no disponible | 0,772 | no disponible (0,865 precisión closed-book) | no disponible | HuggingFace |
| Qwen3-0.6B (base) | 596 M | no disponible | 0,692 | no aplica | Apache-2.0 | HuggingFace |

La comparación interna del autor es explícita: CTRL-0.6B no sustituye a CTRL-2B. A igual recall closed-book que el modelo base, el adaptador de 0,6B no almacena hechos; su ventaja aparece solo con recuperación. La elección entre ambos es una decisión de despliegue (cliente frente a servidor) más que de calidad.

## Limitaciones y advertencias

- El adaptador no almacena conocimiento factual: el recall closed-book es idéntico al del modelo base (0,692). Sin recuperación, la fiabilidad factual es la de un modelo de 0,6B.
- Toda la fiabilidad depende del pipeline de recuperación y de la calidad del índice de 939 pasajes. Un fallo de recuperación degrada directamente la respuesta.
- Riesgo de alucinación de cifras en modo closed-book: la precisión medida es 0,846, es decir, aproximadamente un 15% de las cifras de la respuesta no están en el gold.
- El conjunto de evaluación es pequeño (26 preguntas retenidas) y está construido por el propio autor; los intervalos de confianza son amplios y no hay validación externa.
- Idiomas soportados no declarados; el corpus y los vectores se generan con un embedder en inglés (bge-small-en-v1.5), lo que sugiere un sesgo hacia contenido en inglés.
- Restricciones de licencia: el adaptador y el modelo base son Apache-2.0, pero los derechos sobre el contenido de proveedores subyacente permanecen con sus editores, y la release está pensada para uso interno de soporte de Expedient. Revisar antes de uso comercial con el corpus empaquetado.
- Dependencia de versiones concretas de runtime: wllama 2.x incorpora un llama.cpp antiguo; la compatibilidad con arquitecturas distintas de Qwen no está garantizada.
- Sin datos publicados sobre tool calling, agentes multi-paso, contexto máximo ni rendimiento multilingüe; no asumir estas capacidades en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/expedient-ai/CTRL-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- CTRL-2B (variante de mayor calidad): https://huggingface.co/expedient-ai/CTRL-2B
- Demo Space: https://huggingface.co/spaces/expedient-ai/ctrl-0.6b-demo
- Embedder de recuperación: https://huggingface.co/BAAI/bge-small-en-v1.5
- Runtime en navegador: `@wllama/wllama` 2.3.1 (no se proporciona URL en la información disponible)
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
