# lizhi198605/Qwen3.8-27B-mmproj-Q5_K-MIX-GGUF

## Resumen

`lizhi198605/Qwen3.8-27B-mmproj-Q5_K-MIX-GGUF` no es un modelo de lenguaje completo, sino una cuantización mixta de precisión del proyector multimodal (`mmproj`) del modelo `Qwen/Qwen3.8-27B`. El `mmproj` agrupa el codificador de visión y los tensores que conectan la representación visual con el modelo de lenguaje; en este repositorio se distribuye como un GGUF independiente de 331,1 MiB (5,99 bpw) que debe servirse junto al modelo objetivo `Qwen3.8-27B` mediante `llama.cpp`/`llama-server`.

El interés del artefacto es la compresión: frente al checkpoint BF16 de referencia (888,0 MiB, 16,0 bpw), esta receta `Q5_K-MIX` conserva aproximadamente un tercio del tamano manteniendo una precisión prácticamente idéntica en una batería de 11 benchmarks de visión (5.251 documentos emparejados). El autor reporta una diferencia media de -0,0035 (0,46 % relativo) y +18 documentos fallidos netos, dentro de la banda de ruido del protocolo de evaluación.

Es relevante para quienes despliegan pipelines de imagen-texto con `Qwen3.8-27B` en GPUs de 24 GB, donde cada centenar de MiB de VRAM cuenta: permite recortar el coste del proyector visual sin tocar los pesos del LLM y sin reentrenar nada. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Proyector multimodal (`mmproj`) para `Qwen3.8-27B`: torre de visión con FFN SwiGLU de anchura intermedia 4.304 (ampliada a 4.352) y 27 capas, más proyectores visión-a-LM |
| Parámetros totales | 463.717.376 (solo el `mmproj`; el LLM `Qwen3.8-27B` se distribuye aparte) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo objetivo `Qwen3.8-27B`) |
| Tipos de cuantización | `q5_0` base con overrides por tensor: `q5_0` (FFN up, QKV, atención output), `q6_k` (FFN down), `q4_k` (proyectores visión-a-LM), `f32` (layer norms, biases, embeddings de posición/parche) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con `llama.cpp`) |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es una cuantización derivada directamente del `mmproj` en BF16 del checkpoint `Qwen/Qwen3.8-27B`, procesada con `llama-quantize` de `llama.cpp` sin dequantización intermedia desde una versión ya cuantizada. La receta parte de `q5_0` y aplica overrides `--tensor-type` por componente: el 29 % de parámetros del FFN up-projection (SwiGLU) y el 23 % de la proyección QKV quedan en `q5_0`; el 29 % del FFN down-projection sube a `q6_k`; el 8 % de la proyección de salida de atención se mantiene en `q5_0`; y el 10 % de los proyectores visión-a-LM (input y output) se comprime más agresivamente a `q4_k`. Los 224 tensores restantes (layer norms, biases, embeddings de posición y parche, ~1 % de los parámetros) se conservan en `f32`.

La innovación técnica destacable es estructural: la anchura intermedia del FFN de la torre de visión (4.304) no es divisible por ningún tamano de bloque de cuantización multi-bloque, de modo que el cuantizador estándar deja esa proyección sin cuantizar (el `Q8_0` de referencia la sirve como F16 plano, 255 MiB). Este checkpoint rellena esa dimensión hasta 4.352 = 17 × 256 con filas a cero en el fichero fuente; como los canales rellenados quedan anulados por las filas cero, la operación es matemáticamente transparente y permite aplicar `q6_k` a la proyección down. El autor indica que se evaluaron variantes por debajo de 4 bits con la misma receta y mostraron regresiones fuera de la banda de ruido, por lo que la mezcla 5/6 bits es la configuración más pequena que se mantuvo dentro de esa banda en todos los benchmarks.

## Capacidades

- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`) cuando se sirve junto al LLM `Qwen3.8-27B`.
- Reconocimiento de texto en imagen (TextVQA, OCRBench-v2).
- Razonamiento visual y respuesta a preguntas sobre escenas (GQA, ScienceQA).
- Comprensión de gráficos y tablas (ChartQA).
- Percepción visual fina: categorías BLINK de jigsaw, profundidad relativa, similitud visual, conteo y localización de objetos.
- Integración con `llama.cpp`/`llama-server` como fichero `mmproj` separado del modelo objetivo.
- Capacidades de tool calling, agentes, multilingüismo, thinking mode, audio o generación de código: no disponibles en la información proporcionada (dependen del modelo base `Qwen3.8-27B`, no documentadas aquí).

## Casos de uso

- Despliegue de `Qwen3.8-27B` multimodal en GPU de 24 GB: sustituir el `mmproj` BF16 (888 MiB) por esta versión (331 MiB) libera ~557 MiB de VRAM que pueden reasignarse a KV cache o a mayor contexto, con una pérdida medida dentro del ruido de evaluación.
- Digitalización y extracción de datos de documentos: servir el par `Qwen3.8-27B` + este `mmproj` en `llama-server` para tareas de OCR y VQA sobre facturas o formularios, donde OCRBench-v2 se mantiene en 0,6613 frente a 0,6623 del BF16.
- Análisis de gráficos en informes: usar el modelo para responder preguntas sobre ChartQA con una caída de 0,006 puntos respecto a la referencia, adecuado para paneles internos de business intelligence.
- Asistentes de accesibilidad que describen imágenes: la categoría BLINK de profundidad relativa (0,8952 frente a 0,9113) y similitud visual (0,8963 frente a 0,9037) permiten generar descripciones razonables en entornos con restricciones de memoria.
- Conteo y localización de objetos en imágenes industriales o de inventario: las categorías BLINK counting y object localization quedan exactamente igualadas al BF16 (0,8167 y 0,8033), por lo que son las tareas donde la cuantización no introduce coste medible.
- Prototipado e investigación en visión-lenguaje con presupuesto de VRAM ajustado: al ser un artefacto GGUF de 331 MiB, se puede iterar sobre distintos prompts y configuraciones de servidor sin recompilar ni reconvertir el proyector.
- Evaluación comparativa de recetas de cuantización: el repositorio documenta el protocolo completo (5.251 documentos, temperatura 0, `lmms-eval`), lo que sirve como referencia reproducible para medir el impacto de cuantizar proyectores multimodales.

## Benchmarks y rendimiento

Evaluación con `lmms-eval` a temperatura 0, 5.251 documentos emparejados en 11 benchmarks de visión, ambos proyectores servidos con `llama-server` contra `Qwen3.8-27B` en una GPU NVIDIA de 24 GB:

| Benchmark | n | BF16 | Q5_K-MIX | Ratio |
|---|---:|---:|---:|---:|
| TextVQA (val) | 700 | 0,8204 | 0,8144 | 0,99 |
| OCRBench-v2 | 1.000 | 0,6623 | 0,6613 | 1,00 |
| GQA | 500 | 0,6280 | 0,6240 | 0,99 |
| ScienceQA | 400 | 0,9450 | 0,9475 | 1,00 |
| MMStar | 1.500 | 0,7140 | 0,7113 | 1,00 |
| ChartQA | 500 | 0,8520 | 0,8460 | 0,99 |
| BLINK jigsaw | 150 | 0,5200 | 0,5067 | 0,97 |
| BLINK relative depth | 124 | 0,9113 | 0,8952 | 0,98 |
| BLINK visual similarity | 135 | 0,9037 | 0,8963 | 0,99 |
| BLINK counting | 120 | 0,8167 | 0,8167 | 1,00 |
| BLINK object localization | 122 | 0,8033 | 0,8033 | 1,00 |
| **Overall** | **5.251** | **0,7493** | **0,7458** | **0,995** |
| Tamano | — | 888,0 MiB (16,0 bpw) | 331,1 MiB (5,99 bpw) | 0,37 |

Conjunto de calibración de 2.121 documentos, muestreo estocástico (temp 1,0, top-k 20), documentos fallidos por benchmark:

| Benchmark | n | BF16 | Q8_0 (referencia) | Q4_K (receta temprana) | Q5_K-MIX |
|---|---:|---:|---:|---:|---:|
| TextVQA | 1.441 | 54 | 54 | 38 | 45 |
| OCRBench-v2 | 310 | 23 | 24 | 12 | 19 |
| MMStar | 232 | 34 | 29 | 31 | 26 |
| ChartQA | 64 | 3 | 4 | 2 | 3 |
| BLINK counting | 28 | 0 | 0 | 1 | 1 |
| BLINK object localization | 46 | 0 | 0 | 0 | 0 |
| **Total fallos** | **2.121** | **114** | **111** | **84** | **94** |
| Tamano | — | 888,0 MiB | 600,1 MiB | 498,1 MiB | 331,1 MiB |

El autor advierte que la columna `Q4_K` es un ancla inferior, no una afirmación de calidad: el conjunto de calibración se construyó a partir de documentos que `Q4_K` superaba, por lo que su recuento bajo refleja sesgo de selección. Los números absolutos de esta segunda tabla no son comparables con los de la primera.

## Requisitos de hardware

- VRAM del `mmproj`: 331,1 MiB en disco; en inferencia se carga en memoria junto al modelo objetivo, por lo que el pico adicional ronda ese tamano más los buffers de trabajo.
- VRAM total: depende del LLM `Qwen3.8-27B` y de su cuantización; no disponible en la información proporcionada. El autor cita una GPU NVIDIA de 24 GB para las pruebas.
- GPU recomendadas: cualquier GPU con al menos 24 GB para el conjunto completo (RTX 4090, A100 40 GB, H100); el `mmproj` por sí solo no impone requisitos propios.
- Cabe en GPU de consumo: el `mmproj` sí (331 MiB); el modelo completo depende de la cuantización elegida para el LLM, no documentada aquí.
- Despliegue: `llama.cpp` / `llama-server` con el fichero `mmproj` cargado junto al modelo objetivo; el autor menciona además una cabeza MTP / modelo draft para ahorrar memoria en otros apartados, sin detallar cifras.
- Latencia y throughput: no disponibles. El autor solo reporta que la evaluación se ejecutó a temperatura 0 sobre 24 GB de VRAM, sin métricas de velocidad.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamano | bpw | Documentos fallidos (calibración) | Licencia |
|---|---|---:|---:|---:|---|
| `Qwen3.8-27B` mmproj BF16 (referencia) | Proyector multimodal | 888,0 MiB | 16,0 | 114 | Apache 2.0 |
| `ggml-org/Qwen3.8-27B-GGUF` mmproj Q8_0 | Proyector multimodal | 600,1 MiB | — | 111 | Apache 2.0 |
| Receta Q4_K temprana | Proyector multimodal | 498,1 MiB | — | 84 (sesgo de selección) | Apache 2.0 |
| **Q5_K-MIX (este repo)** | Proyector multimodal | **331,1 MiB** | **5,99** | **94** | Apache 2.0 |

No se dispone de comparativas frente a proyectores multimodales de otros modelos (por ejemplo, de otras familias) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el LLM `Qwen3.8-27B` y un runtime `llama.cpp` compatible; no funciona como checkpoint completo por sí solo.
- La evaluación se limita a visión: 11 benchmarks y 5.251 documentos, con sesgo hacia tareas de VQA, OCR, gráficos y percepción BLINK. No hay datos sobre otras modalidades ni sobre texto puro.
- BLINK jigsaw es el benchmark con mayor caída relativa (0,5200 → 0,5067, ratio 0,97); las tareas de razonamiento visual fino son las más sensibles a la cuantización.
- Los resultados del conjunto de calibración usan muestreo estocástico y una sola ejecución por checkpoint; el propio autor reconoce que las reejecuciones del mismo cuantizado cambian un subconjunto de documentos, de ahí la banda de ruido.
- El relleno de la dimensión FFN de 4.304 a 4.352 con filas cero es una modificación del fichero fuente; aunque es matemáticamente transparente, conviene verificarla si se reutiliza la receta con otras herramientas.
- Sesgos conocidos del modelo base y riesgo de alucinación: no documentados en la información proporcionada; heredados de `Qwen3.8-27B`.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0 declarada, heredada del modelo base; verificar los términos del checkpoint `Qwen/Qwen3.8-27B` antes de uso comercial en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lizhi198605/Qwen3.8-27B-mmproj-Q5_K-MIX-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Referencia Q8_0 del ecosistema ggml: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- `llama.cpp` (herramienta `llama-quantize` y servidor): https://github.com/ggml-org/llama.cpp
- `lmms-eval` (framework de evaluación citado): no disponible en la información proporcionada
