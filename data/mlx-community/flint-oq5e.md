# mlx-community/flint-oQ5e

## Resumen

flint-oQ5e es una cuantización para Apple Silicon del modelo Flint de Recursive (RecursiveSI), publicada por mlx-community. Flint es un modelo de lenguaje con arquitectura Mixture of Experts de 40B parámetros totales y unos 2,5B activos por token, orientado a generación de texto, código y agentes. Esta variante usa el formato oQ5e de la librería oMLX: cuantización de precisión mixta guiada por datos, con imatrix-calibrated clipping, que reduce el modelo desde los 79,6 GB en bf16 hasta 28,1 GB en disco manteniendo una fidelidad casi idéntica al original (perplejidad 14,38 frente a 14,30 del bf16).

La relevancia de esta ficha radica en que permite ejecutar un MoE de 40B con ventana de contexto de 262k tokens en un MacBook Pro con memoria unificada: la cuantización deja las rutas leídas en cada token (atención, experto compartido, capas densas, embeddings y lm_head) a 8 bits, y los expertos enrutados a 5 bits. El resultado es un compromiso notable: frente a oQ4e añade unos 4,7 GB pero reduce la divergencia KL media de 0,222 a 0,089, a cambio de un 10% menos de velocidad de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (49 capas: 2 densas + 47 MoE, 256 expertos enrutados con top-6 + 1 experto compartido) |
| Parametros totales | 39.785.299.488 (~40B) |
| Parametros activos | ~2,5B por token |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | oQ5e (precisión mixta: expertos a 5 bits, rutas por-token a 8 bits, grupo 64, afín, imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización afín MLX estándar) |

## Arquitectura y entrenamiento

Flint es un transformer MoE de 49 capas, de las cuales 2 son densas y 47 son de expertos: 256 expertos enrutados de los que se activan 6 por token, más 1 experto compartido que se lee siempre. La atención es híbrida: 35 capas usan ventana deslizante de 513 tokens y 14 capas usan atención completa, lo que permite sostener 262k tokens de contexto con coste razonable. Los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información de este repositorio; la model card remite a la ficha del modelo original RecursiveSI/flint.

La cuantización oQ5e es el aporte técnico principal de este repo. El asignador mide la sensibilidad de cada capa sobre los pesos bf16 y mantiene a 8 bits todo lo que se lee en cada token (q/k/v/o de la atención, experto compartido, las dos capas densas, `embed_tokens` y `lm_head`), dejando los expertos enrutados a 5 bits. El sufijo "e" añade un pase de imatrix con 128 muestras de calibración que ajusta el rango de clipping de cada grupo según la importancia de las activaciones. El resultado usa cuantización afín MLX estándar, sin kernels personalizados para cargarlo. Se probó group size 128 y se descartó: ahorraba 1,2 GB pero perdía toda la ganancia de la imatrix (KL media 0,263 frente a 0,222) sin ser más rápido.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta conversational)
- Generacion y comprension de codigo (etiqueta code)
- Uso como agente (etiqueta agent); el servidor oMLX expone una API compatible con OpenAI que incluye tool calls
- Razonamiento: el servidor devuelve el razonamiento en `reasoning_content`; Recursive recomienda un presupuesto de salida de al menos 32k tokens para problemas difíciles, ya que razonamiento y respuesta comparten el presupuesto
- Contexto muy largo: 262k tokens, con atención híbrida sliding-window + full attention
- Capacidades multilingues: no disponible
- Vision, audio u otras modalidades: el repo se cuantiza vía la clase de modelo de mlx-vlm, pero no se documentan capacidades multimodales; no disponible

## Casos de uso

- Ejecucion local en Mac de un MoE de 40B: con 28,1 GB en disco y ~29,7 GB de pico de memoria a 16k de contexto, cabe en máquinas Apple Silicon de 32 GB o más (con holgura en las de 48/64/128 GB), algo inviable con los pesos bf16 de 79,6 GB.
- Asistentes de codigo con contexto de repositorio: los 262k tokens de contexto permiten cargar bases de código grandes o múltiples ficheros en una sola sesión, y el soporte de tool calls de oMLX permite integrarlo en flujos de edición asistida.
- Agentes multi-paso locales: la API compatible con OpenAI con function calling y el campo `reasoning_content` facilitan construir agentes que razonan y llaman herramientas sin enviar datos a servicios externos.
- Procesamiento de documentos largos: la atención híbrida con sliding window mantiene 91 tok/s incluso a 16k de contexto, útil para resumir o consultar informes extensos.
- Chat privado on-device: con oMLX (`omlx serve`) se levanta un servidor compatible con OpenAI en local, adecuado para datos sensibles que no deben salir de la máquina.
- Experimentacion de razonamiento en cliente: la recomendación de temperatura 1.0, top-p 0.95, top-k 20 y presupuestos de salida largos lo orienta a tareas de razonamiento complejo donde conviene mantener el razonamiento en el historial entre turnos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) para este modelo. La model card indica explícitamente que aún no se han ejecutado benchmarks de tareas ("I haven't run task benchmarks yet").

Sí hay mediciones de fidelidad frente al bf16 y de velocidad de generación:

| Modelo | Tamano | bpw | KL media ↓ | Perplejidad ↓ | Acuerdo top-1 ↑ |
|---|---|---|---|---|---|
| bf16 (referencia) | 79,6 GB | 16 | 0 | 14,30 | 100% |
| flint-oQ8e | 42,3 GB | 8,50 | 0,038 | 14,33 | 92,3% |
| flint-oQ6e | 32,8 GB | 6,60 | 0,051 | 14,34 | 90,3% |
| **flint-oQ5e (este repo)** | 28,1 GB | 5,65 | 0,089 | 14,38 | 86,2% |
| flint-oQ4e | 23,4 GB | 4,70 | 0,222 | 14,86 | 78,3% |

Velocidad de generación (tok/s, decodificación greedy, mediana de 3 ejecuciones, MacBook Pro M5 Max 128 GB, kernel MoE fusionado de oMLX activado):

| Contexto | oQ5e (este repo) |
|---|---|
| ~30 tokens | 103 |
| 4k | 97 |
| 16k | 91 |

Memoria pico durante generación: ~28,2 GB a contexto corto, ~29,7 GB a 16k.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 28,1 GB en disco; pico de ~28,2 GB a contexto corto y ~29,7 GB a 16k de contexto. Con holgura para KV cache a contextos largos conviene 32 GB o más de memoria unificada.
- Probado en MacBook Pro M5 Max con 128 GB de memoria unificada y GPU de 40 núcleos. En Apple Silicon de 32 GB puede quedar justo a contextos largos; 48 GB o más es lo recomendable.
- No es un modelo para GPU NVIDIA convencional: el formato MLX está orientado a Apple Silicon; en consumer GPU de 24 GB (RTX 4090/3090) no cabe por el formato de pesos.
- Despliegue: oMLX (recomendado, `hf download mlx-community/flint-oQ5e` y `omlx serve`, con API compatible con OpenAI y tool calls) o mlx-vlm ≥ 0.7.10. No carga directamente con mlx-lm, porque los pesos llevan el prefijo `language_model.`.
- Throughput: 103 tok/s a contexto corto, 91 tok/s a 16k en M5 Max. Diferencias de velocidad entre sesiones de hasta ~10%; por debajo de oQ4e la decodificación está limitada por overhead de lanzamiento de kernels, no por ancho de banda.

## Comparativa con modelos similares

Comparativa con las variantes hermanas del mismo modelo cuantizadas por mlx-community (misma base, distinto nivel de oQ):

| Modelo | Tamano | bpw | KL media ↓ | Tok/s (corto) | Tok/s (16k) | Memoria pico |
|---|---|---|---|---|---|---|
| flint-oQ8e | 42,3 GB | 8,50 | 0,038 | 110 | 95 | 42,4–43,9 GB |
| flint-oQ6e | 32,8 GB | 6,60 | 0,051 | 108 | 87 | 32,9–34,4 GB |
| **flint-oQ5e** | 28,1 GB | 5,65 | 0,089 | 103 | 91 | 28,2–29,7 GB |
| flint-oQ4e | 23,4 GB | 4,70 | 0,222 | 120 | 105 | 23,5–25,0 GB |

oQ5e es la elección del autor cuando hay memoria disponible: casi sin pérdida frente a bf16, con un coste de ~4,7 GB más que oQ4e y ~10% menos de velocidad. Comparativas con otros MoE de tamaño similar de otros fabricantes: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Las métricas de fidelidad (KL, perplejidad) se midieron sobre prosa inglesa del conjunto de bench de oMLX, que no está garantizado que sea disjunto de los datos de calibración de oQ: sirven para ordenar las variantes entre sí, no como puntuación de calidad absoluta en datos nuevos.
- No hay benchmarks de tareas publicados para este modelo ni, en esta ficha, datos de evaluación del modelo base.
- Riesgo de alucinación, sesgos y capacidades multilingües: no disponible en la información de este repo; la model card remite a la ficha de RecursiveSI/flint.
- Compatibilidad de runtimes: los pesos llevan prefijo `language_model.` (formato mlx-vlm), por lo que mlx-lm no los carga sin conversión; usar oMLX o mlx-vlm ≥ 0.7.10.
- A 16k de contexto el pico de memoria sube a ~29,7 GB, lo que excluye máquinas Apple Silicon de 24 GB y deja justas las de 32 GB.
- Para problemas difíciles conviene un presupuesto de salida de al menos 32k tokens (razonamiento y respuesta comparten presupuesto), lo que incrementa latencia total pese a los ~100 tok/s.
- La velocidad de oQ5e es un 5–15% inferior a la de oQ4e; si la memoria es escasa, oQ4e puede ser mejor compromiso.
- Licencia Apache 2.0, sin restricciones de uso comercial relevantes.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mlx-community/flint-oQ5e
- Modelo base (bf16): https://huggingface.co/RecursiveSI/flint
- oMLX (herramienta de cuantización y servidor): https://github.com/jundot/omlx
- Variantes hermanas: https://huggingface.co/mlx-community/flint-oQ8e, https://huggingface.co/mlx-community/flint-oQ6e, https://huggingface.co/mlx-community/flint-oQ4e
- Paper, blog oficial y demos: no disponibles en la información proporcionada
