# mlx-community/flint-oQ2.5e

## Resumen

flint-oQ2.5e es una cuantización para Apple Silicon del modelo Recursive Flint, desarrollado por RecursiveSI y cuantizado por la comunidad mlx-community. Flint es un modelo de lenguaje con arquitectura de mezcla de expertos (MoE) de 40B parámetros totales (39,79 mil millones según los pesos en safetensors) y unos 2,5B parámetros activos por token. Esta variante concretamente usa el esquema de cuantización oQ2.5e de la librería oMLX, que combina precisión mixta guiada por datos con recorte de pesos calibrado mediante matrices de importancia (imatrix).

El problema que resuelve es claro: permitir ejecutar un modelo de 40B parámetros en Macs con 24 GB de memoria unificada. El resultado ocupa 15,5 GB en disco (unos 3,11 bits por peso de media), frente a los 79,6 GB de la versión bf16, con una generación de unos 117 tokens/s en contexto corto en un MacBook Pro M5 Max.

Su relevancia actual radica en la combinación de tres factores: arquitectura MoE eficiente (256 expertos enrutados con top-6 más un experto compartido), contexto largo de 262k tokens y un formato de cuantización agresivo pero medido, con métricas de fidelidad publicadas frente al modelo bf16. Es una variante de entrada en la gama: la propia model card recomienda oQ2.7e o superiores si hay memoria disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (49 capas: 2 densas + 47 MoE; 35 capas sliding-window de 513 tokens + 14 de atención completa) |
| Parametros totales | 39.785.299.488 (~40B) |
| Parametros activos | ~2,5B por token (MoE: 256 expertos enrutados, top-6 + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | oQ2.5e (afín, grupo 64): expertos enrutados a 2 bits, down_proj a 3 bits, attention/shared expert/dense layers/embed_tokens/lm_head a 8 bits; media ~3,11 bpw |
| Idiomas soportados | no disponible (el corpus de evaluación de la cuantización es prosa en inglés; consultar la model card original) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización afín estándar de MLX, sin kernels personalizados) |

## Arquitectura y entrenamiento

Flint es un transformer disperso de mezcla de expertos con 49 capas: 2 densas y 47 MoE. En cada token se activan 6 de los 256 expertos enrutados, más un experto compartido siempre activo. La atención es híbrida: 35 capas usan ventana deslizante de 513 tokens y 14 capas usan atención completa, lo que permite el contexto de 262k tokens reduciendo el coste de memoria del KV cache. Sobre los datos de preentrenamiento, número de tokens, composición del dataset o uso de RLHF/DPO, no disponible en esta ficha; la model card original de RecursiveSI/flint es la referencia indicada por el autor.

La cuantización oQ2.5e es la parte técnicamente destacable de este repositorio. El asignador de oMLX mide la sensibilidad de cada capa sobre los pesos bf16 y reparte bits en consecuencia: los expertos enrutados (la mayor parte del volumen) quedan a 2 bits, todos los down_proj suben a 3 bits, y todo lo que se lee en cada token (atención, experto compartido, capas densas, embed_tokens y lm_head) se mantiene a 8 bits. El sufijo "e" añade una pasada de imatrix con 128 muestras de calibración que ajusta el rango de recorte de cada grupo según la importancia de las activaciones. El resultado es una media real de ~3,11 bpw, no 2,5, precisamente por esos suelos de 8 bits.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tags conversational y text-generation).
- Generación de código (tag code en la model card; el ejemplo de la documentación genera una función Python).
- Comportamiento agéntico y uso de herramientas: el servidor oMLX expone una API compatible con OpenAI con soporte de tool calls (tag agent).
- Razonamiento con salida estructurada: el servidor devuelve el razonamiento en el campo `reasoning_content`, separado de la respuesta final.
- Contexto largo de 262k tokens con atención híbrida sliding-window + full attention.
- Soporte de carga mediante mlx-vlm (a partir de la versión 0.7.10), lo que sugiere compatibilidad con el pipeline multimodal de esa librería, aunque no se documentan capacidades de visión concretas.
- Capacidades multilingües: no disponible.

## Casos de uso

- Chatbot local en Mac con memoria limitada: con 15,5 GB de pesos y ~15,6 GB de pico en generación, cabe en Macs de 24 GB, lo que permite desplegar un asistente conversacional de 40B parámetros sin GPU dedicada.
- Razonamiento multi-paso con presupuesto de salida amplio: el autor recomienda al menos 32k tokens de salida para problemas difíciles (razonamiento y respuesta comparten presupuesto), adecuado para tareas de análisis o resolución de problemas complejos en local.
- Agentes con tool calling en local: el servidor oMLX ofrece API compatible con OpenAI con tool calls, lo que permite construir agentes que llamen a funciones externas sin depender de la nube.
- Asistencia de código offline: generación y revisión de código (por ejemplo, funciones Python) con privacidad total al ejecutarse en el dispositivo.
- Procesamiento de documentos largos: los 262k de contexto permiten resumir o consultar documentos extensos; el rendimiento medido se mantiene en 99 tok/s a 16k de contexto.
- Prototipado de aplicaciones LLM en Apple Silicon: la API compatible con OpenAI facilita integrar el modelo en aplicaciones existentes cambiando solo la URL base.
- Comparativa de cuantizaciones en investigación: la serie flint-oQ* publica métricas de KL y acuerdo top-1 frente a bf16, útil para estudiar el impacto de la cuantización extrema en MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) para este modelo cuantizado; el autor indica explícitamente "I haven't run task benchmarks yet". Sí hay métricas de fidelidad frente al modelo bf16 y de velocidad de generación.

Fidelidad frente a bf16 (64 fragmentos de 2048 tokens, 65.472 posiciones puntuadas, KL truncado al top-256 de bf16):

| Modelo | Tamaño | bpw | KL media ↓ | KL mediana ↓ | Perplejidad ↓ | Acuerdo top-1 ↑ |
|---|---|---|---|---|---|---|
| bf16 (referencia) | 79,6 GB | 16 | 0 (ref.) | — | 14,30 | 100% |
| flint-oQ8e | 42,3 GB | 8,50 | 0,038 | 0,010 | 14,33 | 92,3% |
| flint-oQ6e | 32,8 GB | 6,60 | 0,051 | 0,019 | 14,34 | 90,3% |
| flint-oQ5e | 28,1 GB | 5,65 | 0,089 | 0,042 | 14,38 | 86,2% |
| flint-oQ4e | 23,4 GB | 4,70 | 0,222 | 0,122 | 14,86 | 78,3% |
| flint-oQ3e | 18,5 GB | 3,71 | 0,650 | 0,411 | 16,92 | 64,6% |
| flint-oQ2.7e | 16,2 GB | 3,26 | 1,140 | 0,788 | 22,38 | 55,3% |
| **flint-oQ2.5e (este repo)** | 15,5 GB | 3,11 | 1,242 | 0,873 | 23,42 | 53,7% |
| flint-oQ2e | 13,9 GB | 2,80 | 1,519 | 1,081 | 28,99 | 50,2% |

Advertencias del propio autor: el corpus de evaluación es prosa en inglés del banco de pruebas de oMLX, no garantizado disjunto de los datos de calibración, por lo que los números sirven para ordenar las variantes entre sí, no como puntuación de calidad absoluta.

Velocidad de generación (decodificación greedy, 256 tokens, mediana de 3 ejecuciones, MacBook Pro M5 Max 128 GB, kernel MoE fusionado de oMLX):

| Contexto | tok/s | Memoria pico |
|---|---|---|
| ~30 tokens | 117 | 15,6 GB |
| 4k | 106 | — |
| 16k | 99 | 17,1 GB |

## Requisitos de hardware

- Memoria estimada para inferencia: ~15,6 GB de pico en generación con contexto corto; ~17,1 GB a 16k de contexto. Los pesos ocupan 15,5 GB en disco.
- Diseñado para Macs con 24 GB de memoria unificada (Apple Silicon). Cuantizado y probado en un MacBook Pro M5 Max de 128 GB con GPU de 40 núcleos.
- No aplica a GPUs NVIDIA de consumo en su formato actual: es cuantización MLX específica para Apple Silicon; no hay GGUF ni variantes CUDA documentadas en este repo.
- Opciones de despliegue:
  - oMLX (recomendado por el autor): `hf download mlx-community/flint-oQ2.5e` y `omlx serve`; servidor con API compatible con OpenAI, tool calls y `reasoning_content`. El kernel MoE fusionado para decodificación de un token está activo por defecto en builds de oMLX desde el 27/10/2026 y aporta ~16% de velocidad.
  - mlx-vlm ≥ 0.7.10: carga directa con `mlx_vlm.generate`.
  - mlx-lm no es compatible tal cual: los pesos llevan prefijo `language_model.` y mlx-lm espera nombres sin prefijo.
- Rendimiento: 117 tok/s en contexto corto, 106 a 4k y 99 a 16k en M5 Max. Con ~2,5B parámetros activos, la decodificación está limitada por el overhead de lanzamiento de kernels, por lo que bajar por debajo de oQ4e gasta menos memoria pero no gana velocidad. La deriva entre sesiones puede ser de hasta ~10%.

## Comparativa con modelos similares

Comparativa entre las variantes de cuantización del mismo modelo (misma tarea, mismo hardware de referencia):

| Modelo | Tamaño | bpw | KL media ↓ | Perplejidad ↓ | Memoria pico | tok/s (ctx corto) |
|---|---|---|---|---|---|---|
| flint-oQ2.5e (este repo) | 15,5 GB | 3,11 | 1,242 | 23,42 | 15,6–17,1 GB | 117 |
| flint-oQ2.7e | 16,2 GB | 3,26 | 1,140 | 22,38 | 16,3–17,8 GB | 123 |
| flint-oQ3e | 18,5 GB | 3,71 | 0,650 | 16,92 | 18,5–20,0 GB | 109 |
| flint-oQ4e | 23,4 GB | 4,70 | 0,222 | 14,86 | 23,5–25,0 GB | 120 |

La conclusión del propio autor: oQ2.5e solo ahorra 0,7 GB frente a oQ2.7e y es ligeramente peor en todas las métricas, por lo que conviene preferir oQ2.7e si cabe en memoria. Comparativas con modelos de otros fabricantes de tamaño similar: no disponible (no hay datos publicados en la información proporcionada).

## Limitaciones y advertencias

- Degradación medible por la cuantización: con 53,7% de acuerdo top-1 y KL media de 1,242 frente a bf16, la distribución de next-token diverge sustancialmente; la perplejidad sube de 14,30 a 23,42. Es la segunda variante más agresiva de la serie, solo por encima de oQ2e.
- El propio autor recomienda oQ2.7e si hay memoria: oQ2.5e solo ahorra 0,7 GB y es peor en todas las métricas.
- Sesgos conocidos: no disponible (remitirse a la model card original de RecursiveSI/flint).
- Riesgo de alucinación: no disponible específicamente; al ser una cuantización extrema, conviene validar salidas críticas contra el modelo bf16 o variantes menos comprimidas.
- Idiomas: no documentados en este repo; las métricas de fidelidad se midieron solo sobre prosa en inglés, y el corpus de evaluación no está garantizado disjunto de los datos de calibración, por lo que las cifras de KL no son una puntuación de calidad en datos nuevos.
- Compatibilidad de runtimes: los pesos usan prefijo `language_model.` (vía mlx-vlm), así que mlx-lm puro no los carga sin transformación; usar oMLX o mlx-vlm ≥ 0.7.10.
- Parámetros de muestreo recomendados por Recursive: temperatura 1.0, top-p 0.95, top-k 20, y presupuesto de salida de al menos 32k tokens para problemas difíciles; el razonamiento devuelto debe mantenerse en el historial entre turnos.
- Licencia: Apache 2.0, sin restricciones de uso comercial relevantes más allá de las condiciones estándar de la licencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mlx-community/flint-oQ2.5e
- Modelo original (bf16): https://huggingface.co/RecursiveSI/flint
- Model card original (entrenamiento, evaluaciones y limitaciones): https://huggingface.co/RecursiveSI/flint
- oMLX (herramienta de cuantización y servidor): https://github.com/jundot/omlx
- Variantes relacionadas: https://huggingface.co/mlx-community/flint-oQ8e, https://huggingface.co/mlx-community/flint-oQ6e, https://huggingface.co/mlx-community/flint-oQ5e, https://huggingface.co/mlx-community/flint-oQ4e, https://huggingface.co/mlx-community/flint-oQ3e, https://huggingface.co/mlx-community/flint-oQ2.7e, https://huggingface.co/mlx-community/flint-oQ2e
- Paper: no disponible
- Demo: no disponible
