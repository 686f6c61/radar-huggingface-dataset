# mradermacher/Gemma-4-31B-Abliterated-Uncensored-i1-GGUF

## Resumen

El modelo `mradermacher/Gemma-4-31B-Abliterated-Uncensored-i1-GGUF` es una cuantización GGUF con inteligencia de importancia (imatrix) del modelo `Madras1/Gemma-4-31B-Abliterated-Uncensored`, que a su vez es una variante sin censura (abliterated) de un modelo de la familia Gemma-4 de Google DeepMind. El proceso de abliteración, basado en técnicas de representation engineering, elimina los rechazos y filtros de seguridad del modelo original, orientando su comportamiento hacia respuestas directas y sin restricciones, ideal para escritura creativa y roleplay.

El modelo tiene alrededor de 30.70 mil millones de parámetros y está publicado bajo licencia Apache 2.0. El autor de la cuantización, mradermacher, ha generado múltiples niveles de compresión que van desde los 11.0 GB (IQ2_M) hasta los 25.3 GB (Q6_K), todos en formato GGUF, lo que permite su ejecución en hardware de consumo mediante llama.cpp o entornos compatibles. El repositorio incluye un archivo imatrix separado para crear cuantizaciones propias.

No se han publicado especificaciones detalladas sobre la arquitectura exacta, la longitud de contexto o los datos de entrenamiento en la información disponible. El modelo está etiquetado como de generación de texto y soporta inglés (en) y portugués (pt).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (familia Gemma-4) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | No aplicable (no se confirma arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K |
| Idiomas soportados | pt, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo base es una variante de la familia Gemma-4 de Google DeepMind, con 30.698 millones de parámetros. Fue modificado por el usuario `Madras1` mediante técnicas de abliteración, una forma de representation engineering que localiza y elimina direcciones en el espacio latente asociadas con comportamientos de rechazo o censura. El resultado es un modelo "uncensored" que responde sin filtros de seguridad.

La cuantización fue realizada por `mradermacher` usando importancia (imatrix) derivada de datos de calibración. No se dispone de información sobre el conjunto de datos de entrenamiento original, el número de tokens, ni procesos de RLHF o DPO. No hay confirmación pública sobre si la arquitectura es un transformer denso, MoE o híbrido.

## Capacidades

- Generacion de texto en ingles y portugues.
- Escritura creativa y roleplay, segun las etiquetas oficiales del repositorio.
- Conversaciones multi-turno (conversational).
- Respuestas sin filtros de seguridad al haber sido ablitterado (uncensored).
- El modelo base se describe como vision model, pero este repositorio no incluye archivos mmproj, por lo que no se puede confirmar el soporte de vision en la cuantizacion GGUF.
- No se ha confirmado soporte de tool calling, function calling, agentes, matemáticas o generacion de codigo.

## Casos de uso

- **Roleplay y ficcion interactiva**: el modelo puede generar respuestas en personaje para juegos de rol de texto o narracion interactiva, aprovechando su naturaleza "uncensored" para tratar temas tabu sin restricciones. Se ejecuta localmente con llama.cpp en una GPU de 24 GB.
- **Escritura creativa asistida**: redaccion de relatos, dialogos, y guiones en ingles o portugues, con tono adaptable. La cuantizacion Q4_K_M ofrece buen equilibrio entre velocidad y calidad para iteraciones rapidas.
- **Attencion al cliente en portugues**: despliegue en local para gestionar consultas basicas de soporte con contexto multi-turno, sin depender de APIs externas. El modelo puede mantener coherencia a lo largo de la conversacion, aunque su contexto maximo no esta confirmado.
- **Generacion de contenido para redes sociales**: creacion de publicaciones, hilos y respuestas en foros sin limitaciones de tema, usando los quants pequenos (IQ2_M) para pruebas de concepto en equipos modestos.
- **Traduccion y adaptacion informal**: el modelo soporta ingles y portugues, por lo que puede reescribir textos entre estos idiomas con estilo coloquial o literario, a diferencia de modelos mas formales.
- **Experimentacion en research**: el modelo sirve para estudiar el efecto de la abliteracion en la generacion de contenido y la alucion, comparando respuestas entre esta variante y el modelo Gemma-4 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - i1-Q2_K / i1-IQ2_M (11-12 GB): 16 GB de VRAM como minimo recomendado.
  - i1-Q4_K_S / i1-Q4_K_M (17.9-18.8 GB): se recomienda 24 GB de VRAM (RTX 3090/4090, A10, L4).
  - i1-Q6_K (25.3 GB): se recomienda 32 GB de VRAM (A100 40GB, RTX 6000 Ada, o 2x24 GB en paralelo).
- GPUs recomendadas: RTX 3090, RTX 4090, A100 40GB, H100 80GB.
- Es posible ejecutar algunas cuantizaciones en GPU de consumo, pero las de mayor calidad (Q6_K) requieren hardware profesional o configuraciones con offloading a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mradermacher/Gemma-4-31B-Abliterated-Uncensored-i1-GGUF | 30.697.345.596 | No disponible | Apache 2.0 | GGUF (este repo) |
| mradermacher/gemma-4-31b-it-abliterated-v2-GGUF | No disponible | No disponible | No disponible | GGUF |
| mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF | No disponible | No disponible | No disponible | GGUF |
| Madras1/Gemma-4-31B-Abliterated-Uncensored | 30.697.345.596 | No disponible | Apache 2.0 | Safetensors |

No se dispone de datos comparativos de rendimiento, ya que no se han publicado benchmarks para ninguna de estas variantes en la informacion disponible.

## Limitaciones y advertencias

- Al estar ablitterado y sin censura, el modelo puede generar contenido danino, ilegal o ofensivo sin filtros, lo que supone un riesgo significativo para uso en produccion sin salidas seguras.
- Riesgo de alucinacion asociado a cualquier modelo de lenguaje generativo, especialmente en tareas de razonamiento o hechos factuales.
- No se han publicado evaluaciones de sesgos ni estudios de alineacion para esta variante concreta.
- La longitud de contexto no esta confirmada; en entornos de contexto largo, el desempeno puede degradarse si se supera la ventana real del modelo.
- La cuantizacion (incluso con imatrix) puede producir una perdida de calidad notable en los niveles mas agresivos (Q2_K, IQ2_M), especialmente en tareas que requieren precision.
- La licencia Apache 2.0 permite uso comercial, pero exige mantener los avisos de copyright y licencia, asi como indicar cambios realizados sobre el modelo original.
- El repo no incluye archivos mmproj, por lo que no se puede aprovechar ninguna capacidad de vision del modelo base a traves de esta cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Gemma-4-31B-Abliterated-Uncensored-i1-GGUF
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Gemma-4-31B-Abliterated-Uncensored-GGUF
- Modelo base: https://huggingface.co/Madras1/Gemma-4-31B-Abliterated-Uncensored
- Variante similar: https://huggingface.co/mradermacher/gemma-4-31b-it-3MPER0RR-abliterated-i1-GGUF
- Variante abliterated v2: https://huggingface.co/mradermacher/gemma-4-31B-it-abliterated-v2-GGUF
