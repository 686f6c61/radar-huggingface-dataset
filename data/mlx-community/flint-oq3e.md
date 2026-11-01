# mlx-community/flint-oQ3e

## Resumen

Flint-oQ3e es una cuantización para Apple Silicon del modelo Recursive Flint, desarrollado por Recursive. Se trata de un modelo de lenguaje con arquitectura mezcla de expertos (MoE) de 40B parámetros totales y unos 2,5B activos por token, optimizado para ejecutarse localmente en Macs mediante el framework MLX. Esta variante concreta, publicada por mlx-community, aplica el esquema de cuantización oQ3e de la librería oMLX: una cuantización mixta de precisión guiada por datos, con clipping calibrado mediante matriz de importancia (imatrix).

El problema que resuelve es claro: el modelo original en bf16 ocupa 79,6 GB, algo inviable para la mayoría de Macs. La versión oQ3e reduce el tamaño a 18,5 GB (~3,71 bits por peso), lo que la hace adecuada para equipos de 24-32 GB de memoria unificada donde variantes superiores como oQ4e no caben. El precio es una pérdida de fidelidad notable respecto al modelo base: la divergencia KL media es aproximadamente el triple que la de oQ4e, y la perplexidad sube de 14,30 a 16,92.

Es relevante ahora porque los modelos MoE grandes con pocos parámetros activos son especialmente sensibles a la cuantización agresiva, y esquemas como oQ con asignación de bits por sensibilidad de capa permiten ejecutarlos en hardware de consumo. El modelo mantiene 262k tokens de contexto, soporta razonamiento (reasoning), tool calling y agentes, y se despliega fácilmente con oMLX o mlx-vlm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (49 capas: 2 densas + 47 MoE, 256 expertos enrutados con top-6 + 1 experto compartido) |
| Parametros totales | 39.785.299.488 (~40B) |
| Parametros activos | ~2,5B por token |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | oQ3e (mixta por sensibilidad: expertos enrutados a 3 bits, experto compartido y capas densas a 8 bits, embed_tokens a 8 bits, lm_head a 6 bits, atención entre 6 y 8 bits; group size 64, afín, con imatrix de 128 muestras de calibración) |
| Idiomas soportados | no disponible (el corpus de evaluación es prosa en inglés; consultar la model card original) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización afín estándar de MLX, con prefijo `language_model.`) |

## Arquitectura y entrenamiento

Flint es un transformer MoE con 49 capas: 2 densas y 47 MoE. Cada capa MoE cuenta con 256 expertos enrutados de los que se activan 6 por token, más 1 experto compartido siempre activo. La atención es híbrida: 35 capas usan ventana deslizante de 513 tokens y 14 capas usan atención completa, lo que permite alcanzar 262k tokens de contexto con un coste de memoria de KV-cache razonable. Con solo ~2,5B parámetros activos por token, el decodificado está mayoritariamente limitado por el overhead de lanzamiento de kernels en Apple Silicon, no por ancho de banda de memoria.

Sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO), esta model card no ofrece detalles y remite a la ficha de RecursiveSI/flint; no disponible en la información proporcionada.

Respecto a la cuantización oQ3e: el asignador mide la sensibilidad de cada capa sobre los pesos en bf16 y reparte los bits en consecuencia (expertos enrutados a 3 bits, resto a 6-8 bits). El sufijo "e" (enhanced) añade una pasada de imatrix con 128 muestras de calibración que ajusta el rango de clipping de cada grupo según la importancia de las activaciones; no cambia qué tensor recibe cuántos bits, solo las escalas internas. Se probó group size 128 (ahorraba 1,2 GB) pero degradaba la KL media de 0,222 a 0,263 sin ganar velocidad, por lo que se mantiene 64. La salida es cuantización afín estándar de MLX, sin kernels personalizados para cargarla.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Razonamiento: el modelo devuelve razonamiento en un campo `reasoning_content` separado vía oMLX; Recursive recomienda un presupuesto de salida de al menos 32k tokens para problemas difíciles, ya que razonamiento y respuesta comparten presupuesto.
- Código: etiquetado con `code`; el ejemplo de la propia model card genera funciones Python.
- Agentes: etiquetado con `agent`; soporte de tool calling / function calling a través de la API compatible con OpenAI de oMLX.
- Contexto muy largo: 262k tokens, con atención híbrida ventana deslizante + completa.
- Multilingüe: no disponible en la información proporcionada.
- Visión/audio: los pesos se cuantizan a través de la clase de modelo de mlx-vlm y la librería se lista como compatible, pero la model card no documenta capacidades multimodales explícitas; no disponible.

## Casos de uso

- Ejecución local en Macs de 24-32 GB de memoria unificada: es el nicho explícito de esta variante, donde oQ4e (23,4 GB) no cabe con holgura; oQ3e ocupa 18,5 GB y deja margen para el KV-cache.
- Asistentes con razonamiento profundo: gracias al modo reasoning con `reasoning_content` y a los 262k de contexto, es adecuado para análisis de documentos extensos y problemas que requieren cadenas largas de pensamiento.
- Agentes con tool calling: la API de oMLX expone function calling compatible con OpenAI, lo que permite construir agentes locales que invoquen herramientas sin depender de servicios en la nube.
- Generación y refactorización de código en local: el modelo está etiquetado para código y puede integrarse en editores o pipelines locales vía el servidor oMLX.
- Chat multi-turno con historial de razonamiento: la model card recomienda mantener el razonamiento devuelto en el historial entre turnos, lo que habilita conversaciones técnicas coherentes y largas.
- Prototipado de aplicaciones LLM en Apple Silicon: carga directa en oMLX y mlx-vlm (≥ 0.7.10) sin kernels personalizados, ideal para desarrollo iterativo sin coste de GPU en la nube.
- Procesamiento de contextos largos (RAG con documentos completos): las 35 capas de ventana deslizante reducen el coste de atención sobre los 262k tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el autor indica explícitamente no haberlos ejecutado todavía. Sí hay mediciones de fidelidad frente al modelo bf16 y de velocidad:

Fidelidad frente a bf16 (64 fragmentos de 2048 tokens, 65.472 posiciones puntuadas, KL truncado al top-256 de bf16):

| Modelo | Tamaño | bpw | KL media ↓ | KL mediana ↓ | Perplexidad ↓ | Acuerdo top-1 ↑ |
|---|---|---|---|---|---|---|
| bf16 (referencia) | 79,6 GB | 16 | 0 | — | 14,30 | 100% |
| oQ8e | 42,3 GB | 8,50 | 0,038 | 0,010 | 14,33 | 92,3% |
| oQ6e | 32,8 GB | 6,60 | 0,051 | 0,019 | 14,34 | 90,3% |
| oQ5e | 28,1 GB | 5,65 | 0,089 | 0,042 | 14,38 | 86,2% |
| oQ4e | 23,4 GB | 4,70 | 0,222 | 0,122 | 14,86 | 78,3% |
| **oQ3e (este repo)** | 18,5 GB | 3,71 | **0,650** | **0,411** | **16,92** | **64,6%** |
| oQ2.7e | 16,2 GB | 3,26 | 1,140 | 0,788 | 22,38 | 55,3% |
| oQ2.5e | 15,5 GB | 3,11 | 1,242 | 0,873 | 23,42 | 53,7% |
| oQ2e | 13,9 GB | 2,80 | 1,519 | 1,081 | 28,99 | 50,2% |

Nota del autor: el corpus de evaluación es prosa en inglés del banco de pruebas de oMLX, no garantizado disjunto de los datos de calibración, por lo que los números sirven para ordenar las variantes entre sí, no como medida absoluta de calidad.

Velocidad (tokens/s en decodificado greedy, 256 tokens, mediana de 3 ejecuciones, MacBook Pro M5 Max 128 GB con 40 núcleos GPU, kernel fusionado de MoE de oMLX activado):

| Variante | ~30 tokens de contexto | 4k | 16k | Memoria pico |
|---|---|---|---|---|
| **oQ3e (este repo)** | 109 | 106 | 98 | 18,5-20,0 GB |
| oQ4e (referencia) | 120 | 110 | 105 | 23,5-25,0 GB |
| oQ8e | 110 | 103 | 95 | 42,4-43,9 GB |

La deriva entre sesiones es de hasta ~10%, por lo que diferencias menores deben leerse como ruido. Por debajo de oQ4e, menos bits compran memoria pero no velocidad.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 18,5 GB en disco; memoria pico de ~18,5 GB con contexto corto y ~20,0 GB con contexto de 16k. Recomendable un Mac con 24 GB o más de memoria unificada (más margen para contextos largos).
- GPU recomendadas: diseñado y probado en Apple Silicon (MacBook Pro M5 Max 128 GB, 40 núcleos GPU). No está pensado para CUDA; para GPU NVIDIA habría que usar el modelo base u otras cuantizaciones (GGUF, etc.), no disponibles en este repo.
- Consumer GPU: no aplicable directamente; en Macs de consumo cabe en equipos de 24-32 GB de memoria unificada (M2/M3/M4/M5 Pro o superiores). En Macs de 16 GB no cabe.
- Opciones de despliegue:
  - oMLX (recomendado): `hf download mlx-community/flint-oQ3e` y `omlx serve`; servidor con API compatible con OpenAI, tool calls y `reasoning_content`.
  - mlx-vlm ≥ 0.7.10: `mlx_vlm.generate --model mlx-community/flint-oQ3e ...`.
  - No compatible con mlx-lm tal cual (espera pesos sin el prefijo `language_model.`); llama.cpp, vLLM y TGI no aplicables a este formato.
- Latencia y throughput: ~109 tok/s con contexto corto, ~106 tok/s a 4k y ~98 tok/s a 16k en M5 Max (decodificado greedy). El kernel fusionado de enrutado MoE de oMLX aporta ~16% de velocidad extra en decodificado de un token.

## Comparativa con modelos similares

Comparativa entre las variantes de cuantización del mismo modelo disponibles en mlx-community (misma arquitectura y licencia):

| Variante | Tamaño | bpw | KL media | Perplexidad | Acuerdo top-1 | Tok/s (ctx corto) | Memoria pico |
|---|---|---|---|---|---|---|---|
| flint-oQ8e | 42,3 GB | 8,50 | 0,038 | 14,33 | 92,3% | 110 | 42,4-43,9 GB |
| flint-oQ4e | 23,4 GB | 4,70 | 0,222 | 14,86 | 78,3% | 120 | 23,5-25,0 GB |
| flint-oQ3e (este repo) | 18,5 GB | 3,71 | 0,650 | 16,92 | 64,6% | 109 | 18,5-20,0 GB |
| flint-oQ2e | 13,9 GB | 2,80 | 1,519 | 28,99 | 50,2% | 130 | 14,0-15,5 GB |

Lectura: oQ3e es la opción para Macs de 24-32 GB, sacrificando fidelidad (KL ~3× la de oQ4e) sin ganar velocidad. Si cabe oQ4e, suele ser mejor elección. Comparativas frente a otros modelos MoE de tamaño similar (Qwen3-30B-A3B, GLM-4.5-Air, etc.): no disponible; no hay datos de benchmarks de tareas publicados para Flint en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de fidelidad significativa: KL media de 0,650 (frente a 0,222 de oQ4e) y acuerdo top-1 del 64,6% con bf16; la perplexidad sube de 14,30 a 16,92. Es la variante "claramente más lossy" según el propio autor, y no es más rápida que oQ4e.
- Sin benchmarks de tareas: no hay evaluaciones MMLU/HumanEval/etc. publicadas; la calidad en tareas concretas es desconocida.
- Sesgo de medición: el corpus de fidelidad no está garantizado disjunto de los datos de calibración de la imatrix, por lo que las métricas pueden ser optimistas.
- Sesgos y alucinaciones del modelo base: no documentados en esta model card; consultar la ficha de RecursiveSI/flint. Al tratarse de una cuantización agresiva, el riesgo de degradación en razonamiento y código puede ser mayor que en variantes de más bits.
- Contexto: la ventana de atención deslizante es de 513 tokens en 35 de las 49 capas; los contextos muy largos dependen de las 14 capas de atención completa.
- Idiomas: no especificados; el corpus de evaluación es inglés, y el rendimiento en castellano no está verificado.
- Compatibilidad: los pesos llevan prefijo `language_model.`; no cargan en mlx-lm sin conversión. Requieren oMLX o mlx-vlm ≥ 0.7.10.
- Licencia: Apache 2.0, sin restricciones para uso comercial.
- Muestreo recomendado: temperature 1.0, top-p 0.95, top-k 20, y presupuesto de salida ≥ 32k tokens para problemas difíciles; desviarse de esto puede degradar resultados.
- En producción: la deriva de rendimiento entre sesiones (~10%) y la falta de benchmarks de calidad aconsejan validación propia antes de desplegar.

## Enlaces

- Modelo cuantizado: https://huggingface.co/mlx-community/flint-oQ3e
- Modelo base (bf16): https://huggingface.co/RecursiveSI/flint
- oMLX (herramienta de cuantización y servidor): https://github.com/jundot/omlx
- Web de Recursive: https://www.recursive.com
- Variantes relacionadas: https://huggingface.co/mlx-community/flint-oQ8e, https://huggingface.co/mlx-community/flint-oQ6e, https://huggingface.co/mlx-community/flint-oQ5e, https://huggingface.co/mlx-community/flint-oQ4e, https://huggingface.co/mlx-community/flint-oQ2.7e, https://huggingface.co/mlx-community/flint-oQ2.5e, https://huggingface.co/mlx-community/flint-oQ2e
- Paper, blog o demo del modelo base: no disponible en la información proporcionada.
