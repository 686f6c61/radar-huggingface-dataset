# mlx-community/flint-oQ2e

## Resumen

flint-oQ2e es una cuantización extrema a 2 bits (con precisión mixta) del modelo Recursive Flint, un modelo de lenguaje con arquitectura Mixture-of-Experts (MoE) de 40B parámetros totales y unos 2.5B activos por token, desarrollado por RecursiveSI. Esta versión ha sido publicada por la organización mlx-community, que se dedica a adaptar modelos populares al ecosistema MLX de Apple Silicon, y concretamente utiliza el formato oQ2e de la herramienta oMLX, que aplica cuantización afín con calibración mediante matriz de importancia (imatrix).

El problema que resuelve es claro: hacer ejecutable un modelo de 79.6 GB en bf16 en máquinas Apple Silicon con memoria limitada. La variante oQ2e reduce el tamaño a 13.9 GB en disco (~2.80 bits por peso reales), lo que permite cargarlo en Macs de 16 GB de memoria unificada, aunque el propio autor advierte que es la variante "más pequeña y con más pérdida" de la familia.

Es relevante ahora porque representa el límite inferior de la familia de cuantizaciones oQ para Flint: la perplejidad se duplica respecto al modelo original (28.99 frente a 14.30) y solo coincide con el token preferido del modelo bf16 la mitad de las veces. Es una opción viable solo cuando nada más grande cabe en memoria; para el resto de casos, el autor recomienda las variantes oQ2.5e u oQ2.7e.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (49 capas: 2 densas + 47 MoE), con atención híbrida (35 capas sliding-window de 513 tokens + 14 de atención completa) |
| Parámetros totales | 39.785.299.488 (~40B) |
| Parametros activos | ~2.5B por token (256 expertos enrutados con top-6 + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantización | oQ2e (nivel 2 mejorado, precisión mixta): expertos enrutados a 2 bits; atención, experto compartido, capas densas, embed_tokens y lm_head a 8 bits; group size 64, cuantización afín con clipping calibrado por imatrix |
| Idiomas soportados | no disponible (el corpus de evaluación es prosa en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización afín estándar de MLX, sin kernels personalizados) |

## Arquitectura y entrenamiento

El modelo base, Recursive Flint, es un transformer MoE de 49 capas (2 densas y 47 MoE) con 256 expertos enrutados de los cuales se activan 6 por token, más 1 experto compartido que se lee en cada token. La atención es híbrida: 35 capas usan ventanas deslizantes de 513 tokens y 14 capas mantienen atención completa, lo que permite una ventana de contexto de 262k tokens. Sobre los datos de entrenamiento del modelo base, el número de tokens y la composición del dataset no están disponibles en la información proporcionada, y no hay indicios de RLHF/DPO.

La innovación principal de esta ficha está en la cuantización, no en el modelo base. El esquema oQ2e de oMLX mide la sensibilidad de cada capa sobre los pesos bf16 y asigna 2 bits a todos los expertos enrutados (que solo se leen cuando se activan), manteniendo a 8 bits todo lo que se lee en cada token: atención, experto compartido, capas densas, embeddings y lm_head. Por eso la media real es de ~2.80 bpw y no 2. El sufijo "e" (enhanced) añade una pasada de imatrix con 128 muestras de calibración que ajusta el rango de clipping de cada grupo según la importancia de las activaciones; no cambia qué tensor recibe cuántos bits, solo las escalas internas. El resultado son pesos en cuantización afín estándar de MLX, sin necesidad de kernels personalizados.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, chat template del modelo original sin modificar).
- Generación de código y comportamiento agéntico, según las etiquetas del repositorio (code, agent).
- Soporte de tool calling a través del servidor oMLX, que expone una API compatible con OpenAI.
- Devolución del razonamiento en el campo `reasoning_content`, separado de la respuesta final.
- Soporte multimodal parcial vía mlx-vlm (el modelo se cuantiza a través de la clase de modelo de mlx-vlm), aunque las capacidades de visión concretas no están disponibles en la información proporcionada.
- Contexto muy largo (262k tokens), aunque el autor recomienda un presupuesto de salida de al menos 32k tokens para problemas difíciles, ya que razonamiento y respuesta comparten presupuesto.

## Casos de uso

- Pruebas locales en Macs de 16 GB: es la única variante de la familia Flint que cabe en máquinas con 16 GB de memoria unificada (~14.0 GB de pico en contexto corto), útil para experimentar con el modelo sin hardware caro.
- Prototipado de agentes con tool calling en local: el servidor oMLX expone una API compatible con OpenAI con soporte de herramientas, lo que permite desarrollar y probar flujos agénticos antes de pasar a variantes de mayor fidelidad.
- Asistentes conversacionales multi-turno: el contexto de 262k tokens y la recomendación de mantener el razonamiento en el historial permiten conversaciones largas con continuidad, aunque con expectativa de más errores que en variantes superiores.
- Generación de código asistida en local: las etiquetas del repositorio indican orientación a código; con presupuesto de salida amplio (32k+ tokens) puede razonar sobre problemas de programación y producir la solución.
- Pruebas de rendimiento y benchmarking de cuantizaciones: al ser la variante más agresiva, sirve como punto de comparación para medir el coste en calidad de bajar de 4.70 a 2.80 bpw.
- Procesamiento de documentos largos en contextos de 16k: mantiene 113 tok/s a 16k de contexto con ~15.5 GB de pico, adecuado para resumir o consultar documentos extensos en memoria limitada.
- Desarrollo con mlx-vlm: integrable en scripts de Python con `mlx_vlm.generate` para automatizar tareas de generación en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) para este modelo. El autor indica explícitamente: "I haven't run task benchmarks yet".

Sí hay medidas de fidelidad frente al modelo bf16 (64 fragmentos de 2048 tokens, 65.472 posiciones puntuadas, KL truncado al top-256 de bf16):

| Modelo | Tamaño | bpw | KL medio ↓ | KL mediano ↓ | Perplejidad ↓ | Acuerdo top-1 ↑ |
|---|---|---|---|---|---|---|
| bf16 (referencia) | 79.6 GB | 16 | 0 | — | 14.30 | 100% |
| flint-oQ8e | 42.3 GB | 8.50 | 0.038 | 0.010 | 14.33 | 92.3% |
| flint-oQ6e | 32.8 GB | 6.60 | 0.051 | 0.019 | 14.34 | 90.3% |
| flint-oQ5e | 28.1 GB | 5.65 | 0.089 | 0.042 | 14.38 | 86.2% |
| flint-oQ4e | 23.4 GB | 4.70 | 0.222 | 0.122 | 14.86 | 78.3% |
| flint-oQ3e | 18.5 GB | 3.71 | 0.650 | 0.411 | 16.92 | 64.6% |
| flint-oQ2.7e | 16.2 GB | 3.26 | 1.140 | 0.788 | 22.38 | 55.3% |
| flint-oQ2.5e | 15.5 GB | 3.11 | 1.242 | 0.873 | 23.42 | 53.7% |
| **flint-oQ2e (este repo)** | 13.9 GB | 2.80 | 1.519 | 1.081 | 28.99 | 50.2% |

Advertencia del propio autor: el corpus de evaluación es prosa en inglés del banco de pruebas de oMLX, no garantizado disjunto de los datos de calibración, por lo que estos números sirven para ordenar las variantes entre sí, no como medida absoluta de calidad.

Velocidad de generación (decodificación greedy, 256 tokens, mediana de 3 ejecuciones, MacBook Pro M5 Max 128 GB con GPU de 40 núcleos, ruta de decodificación fused de Flint activada):

| Contexto | ~30 tokens | 4k | 16k | Memoria pico |
|---|---|---|---|---|
| oQ2e | 130 tok/s | 124 tok/s | 113 tok/s | 14.0–15.5 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~14.0 GB de pico en contexto corto y ~15.5 GB a 16k de contexto (medido en Apple Silicon con memoria unificada).
- Diseñado para Apple Silicon: cuantizado y probado en un MacBook Pro M5 Max de 128 GB, pero cabe en Macs de 16 GB de memoria unificada, que es el público objetivo declarado de esta variante.
- En GPU NVIDIA convencionales: no disponible como formato GGUF; el formato es cuantización afín MLX, por lo que la inferencia nativa requiere MLX (Apple Silicon). No hay datos de rendimiento en CUDA.
- Opciones de despliegue:
  - oMLX (recomendado por el autor): `hf download mlx-community/flint-oQ2e` y `omlx serve`; servidor con API compatible con OpenAI, tool calls y `reasoning_content`.
  - mlx-vlm ≥ 0.7.10: `mlx_vlm.generate --model mlx-community/flint-oQ2e ...`.
  - No compatible con mlx-lm directamente: los pesos llevan prefijo `language_model.` y mlx-lm espera nombres sin prefijo para su clase `flint`.
  - No aplica vLLM, TGI ni llama.cpp con estos pesos.
- Latencia/throughput: 130 tok/s a contexto corto, 124 tok/s a 4k y 113 tok/s a 16k en M5 Max (con deriva de hasta ~10% entre sesiones). Es ~4% más rápida que oQ4e; por debajo de oQ4e, la decodificación está dominada por el overhead de lanzamiento de kernels, no por el ancho de banda de memoria.
- Parámetros de muestreo recomendados: temperatura 1.0, top-p 0.95, top-k 20.

## Comparativa con modelos similares

Comparativa con las variantes de cuantización inmediatamente superiores de la misma familia (mismo modelo base, mismo hardware de referencia):

| Modelo | Tamaño | bpw | Perplejidad | Acuerdo top-1 | Tok/s (ctx. corto) | Licencia |
|---|---|---|---|---|---|---|
| flint-oQ2e | 13.9 GB | 2.80 | 28.99 | 50.2% | 130 | Apache 2.0 |
| flint-oQ2.5e | 15.5 GB | 3.11 | 23.42 | 53.7% | 117 | Apache 2.0 |
| flint-oQ2.7e | 16.2 GB | 3.26 | 22.38 | 55.3% | 123 | Apache 2.0 |
| flint-oQ4e | 23.4 GB | 4.70 | 14.86 | 78.3% | 120 | Apache 2.0 |

Conclusiones prácticas: oQ2e solo tiene sentido si 16 GB es el límite duro de memoria; con 18 GB disponibles, oQ3e (18.5 GB) reduce la perplejidad de 28.99 a 16.92, una mejora sustancial por 4.6 GB más. Modelos MoE comparables de otros fabricantes en formato MLX no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Es la variante "más pequeña y con más pérdida" de la familia: perplejidad duplicada respecto a bf16 (28.99 frente a 14.30) y solo 50.2% de acuerdo en el token siguiente. El autor espera "notablemente más errores en trabajo real".
- Riesgo elevado de alucinación y degradación de razonamiento en tareas complejas por la pérdida de precisión a 2 bits en los expertos; no recomendado para producción salvo restricción estricta de memoria.
- Sesgos: no disponibles; no hay evaluación de sesgos publicada ni benchmarks de tareas.
- El corpus de evaluación de fidelidad podría solaparse con los datos de calibración de oQ, por lo que las métricas de KL y perplejidad están probablemente sesadas a la baja.
- Incompatibilidad con mlx-lm por el prefijo `language_model.` en los nombres de pesos; hay que usar oMLX o mlx-vlm ≥ 0.7.10.
- Para problemas difíciles, el presupuesto de salida debe ser de al menos 32k tokens porque razonamiento y respuesta comparten ventana; esto incrementa la latencia total percibida.
- La licencia Apache 2.0 no impone restricciones de uso comercial, pero las condiciones del modelo base (RecursiveSI/flint) deben revisarse por separado.
- Datos de velocidad con deriva de hasta ~10% entre sesiones; diferencias menores entre variantes pueden ser ruido de medición.

## Enlaces

- Ficha del modelo: https://huggingface.co/mlx-community/flint-oQ2e
- Modelo base (bf16): https://huggingface.co/RecursiveSI/flint
- Organización mlx-community: https://huggingface.co/mlx-community
- oMLX (herramienta de cuantización y servidor): https://github.com/jundot/omlx
- Variantes relacionadas: flint-oQ8e, flint-oQ6e, flint-oQ5e, flint-oQ4e, flint-oQ3e, flint-oQ2.7e, flint-oQ2.5e (enlaces en la tabla de fidelidad de la model card)
- Paper, blog o demo: no disponibles
