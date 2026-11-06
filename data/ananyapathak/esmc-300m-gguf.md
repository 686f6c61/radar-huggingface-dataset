# AnanyaPathak/esmc-300m-gguf

## Resumen

ESM-C 300M GGUF es una conversión al formato GGUF del modelo de lenguaje de proteínas ESM Cambrian (ESM-C) 300M, desarrollado originalmente por EvolutionaryScale. Se trata de un transformer encoder-only especializado en extraer embeddings de proteínas, tanto a nivel de residuo como de secuencia completa. La conversión, publicada por AnanyaPathak, permite ejecutar el modelo en CPU y Apple Metal sin necesidad de Python ni PyTorch en tiempo de inferencia, gracias al runtime C/C++ `esmc.cpp` construido sobre ggml/llama.cpp.

El modelo resuelve un problema concreto: desplegar un extractor de características proteicas en entornos con recursos limitados o sin stack de Python, manteniendo una fidelidad numérica alta respecto al checkpoint original en PyTorch. Con 332 millones de parámetros y una longitud de contexto de 2048 tokens (aminoácidos), cubre la mayoría de secuencias proteicas de interés práctico en bioinformática.

Es relevante ahora porque la cuantización GGUF permite reducir el modelo desde 1,27 GB en F32 hasta 228 MiB en Q4_K_S, con una degradación medida y documentada tanto en fidelidad de embeddings como en preservación de efectos de variantes (ProteinGym). Esto abre el uso de ESM-C en pipelines de anotación, búsqueda de homólogos o priorización de variantes sobre hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (30 capas, d_model 960, 15 cabezas, SwiGLU FFN de 2560, pre-LayerNorm, RoPE-NeoX theta 10000, LayerNorm en query/key, sin biases) |
| Parámetros totales | 332.013.120 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (aminoácidos) |
| Tipos de cuantización | F32, F16, Q8_0, Q4_K_M, Q4_K_S |
| Idiomas soportados | no disponible (modelo de proteínas; alfabeto de 33 tokens de aminoácidos) |
| Licencia | Cambrian Open License Agreement |
| Formato de pesos | GGUF (arquitectura personalizada `general.architecture = "esmc"`, no cargable en llama.cpp estándar) |

## Arquitectura y entrenamiento

ESM-C 300M es un transformer encoder-only con 30 capas, dimensión de modelo 960, 15 cabezas de atención de dimensión 64 y FFN SwiGLU de anchura 2560. Usa pre-LayerNorm, RoPE-NeoX con theta 10000, LayerNorm sobre query y key, y elimina todos los términos de bias. El tokenizador es un alfabeto directo de 33 tokens de aminoácidos, con `<cls>` antepuesto y `<eos>` añadido, sin segmentación subword.

La conversión a GGUF parte del checkpoint safetensors original de EvolutionaryScale y separa las proyecciones QKV y SwiGLU fusionadas; las variantes cuantizadas emplean la cuantización por bloques de ggml. Los valores de los pesos no se modifican respecto a la release original. No se dispone en la información proporcionada de detalles sobre el corpus de entrenamiento (número de tokens, composición del dataset) ni sobre si hubo RLHF/DPO; al tratarse de un modelo encoder-only de extracción de características, no aplica el ajuste por preferencias típico de modelos generativos.

## Capacidades

- Extracción de embeddings por secuencia (mean pooling, vector de dimensión 960) y por residuo (matriz `[n_tokens, 960]`).
- Generación de representaciones para búsqueda de homólogos, agrupamiento y comparación de proteínas.
- Puntuación de variantes mediante similitud coseno entre embeddings de mutante y wild-type.
- Inferencia en CPU y Apple Metal sin Python ni PyTorch.
- Salida en arrays NumPy `.npy` listos para pipelines de análisis.
- No soporta tool calling ni function calling (no es un modelo generativo).
- No soporta agentes ni razonamiento multi-step.
- No soporta visión ni audio.
- No es un modelo multilingüe en sentido lingüístico; su "vocabulario" es el alfabeto de aminoácidos.

## Casos de uso

- Anotación funcional de proteínas a gran escala: extraer embeddings de secuencias desconocidas y compararlas contra una base de referencia para inferir familia o función, aprovechando el bajo consumo de RAM en Q8_0 (337 MiB).
- Priorización de variantes en genómica clínica: puntuar variantes missense comparando el embedding del mutante con el del wild-type mediante coseno, con preservación de rangos de Spearman medida en ProteinGym (delta medio absoluto de 0,0027 en Q8_0).
- Búsqueda de homólogos remotos: usar embeddings por secuencia como índice vectorial para recuperar proteínas relacionadas cuando BLAST no encuentra similitud significativa.
- Despliegue en entornos embebidos o HPC sin Python: integrar `esmc-embed` en pipelines C/C++ o scripts de shell sobre clústeres donde instalar PyTorch es inviable.
- Preprocesado para modelos downstream: generar características congeladas para entrenar clasificadores ligeros de localización subcelular, solubilidad o estabilidad.
- Filtrado de librerías de diseño de proteínas: descartar candidatos generados que se alejen del espacio de embeddings de proteínas naturales antes de validación experimental.
- Análisis en portátiles Apple Silicon: ejecutar extracción de embeddings en un Mac con Metal a velocidades de 95,7 seq/s en secuencias cortas (47 tokens), suficiente para lotes de miles de secuencias.

## Benchmarks y rendimiento

Fidelidad numérica frente a PyTorch (coseno por residuo, 100 secuencias de Swiss-Prot):

| Precisión | Coseno medio agregado | Peor coseno mínimo | L2 máximo en mean-pool | Tasa de aprobación |
|---|---|---|---|---|
| F16 | 1,00000 | 1,0000 | 0,0012 | 100/100 |
| Q8_0 | 0,99987 | 0,9964 | 0,0194 | 100/100 |
| Q4_K_M | 0,99534 | 0,9374 | 0,0792 | 100/100 |
| Q4_K_S | 0,99422 | 0,9352 | 0,0900 | 100/100 |

Throughput (seq/s, mejor configuración de esmc.cpp, Apple M4 Max):

| Categoría | Tokens | Configuración | seq/s |
|---|---|---|---|
| Corta | 47 | metal/f16 | 95,70 |
| Media | 235 | metal/f16 | 38,33 |
| Larga | 850 | metal/f16 | 9,51 |

Preservación de efectos de variantes en ProteinGym (10 ensayos x 1000 variantes):

| Precisión | Ensayos | Delta medio absoluto de Spearman | Delta máximo absoluto | Filas de métrica que pasan |
|---|---|---|---|---|
| F16 | 10 | 0,0007 | 0,0029 | 46/50 |
| Q8_0 | 10 | 0,0027 | 0,0059 | 41/50 |
| Q4_K_M | 10 | 0,0143 | 0,0372 | 26/50 |
| Q4_K_S | 10 | 0,0141 | 0,0346 | 21/50 |

Memoria pico en secuencias largas (presupuesto de 36 GB): mínimo de 304 MiB en PyTorch/MPS/F32 y máximo de 2614 MiB en esmc.cpp/CPU/F32; las 12 configuraciones medidas caben en 36 GB.

## Requisitos de hardware

- VRAM/RAM estimada: 228 MiB (Q4_K_S), 237,6 MiB (Q4_K_M), 337 MiB (Q8_0), 633,6 MiB (F16), 1266,6 MiB (F32).
- GPU recomendadas: no se requieren GPU dedicadas; el runtime está optimizado para Apple Metal (M-series). Para CUDA no se documenta soporte en la información disponible.
- Cabe en cualquier GPU de consumo e incluso en sistemas sin GPU; el caso de uso principal es CPU y Apple Silicon.
- Opciones de despliegue: runtime `esmc.cpp` (herramienta `esmc-embed`); no es cargable en llama.cpp estándar ni en vLLM/TGI/Ollama por su arquitectura GGUF personalizada.
- Latencia y throughput: 95,7 seq/s en secuencias de 47 tokens, 38,3 seq/s en 235 tokens y 9,5 seq/s en 850 tokens sobre Apple M4 Max (36 GB) con Metal/F16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ESM-C 300M GGUF (este) | 332 M | 2048 | GGUF (esmc) | Cambrian Open License | Optimizado para CPU/Metal sin Python |
| ESM-C 300M (PyTorch original) | 332 M | 2048 | safetensors | Cambrian Open License | Referencia numérica; requiere PyTorch |
| ESM-2 650M | ~650 M | 1024 | safetensors | MIT (según release de Meta) | Mayor tamaño, licencia más permisiva; sin versión GGUF documentada aquí |
| ESM-2 150M | ~150 M | 1024 | safetensors | MIT | Alternativa más ligera; menor capacidad representacional |

No se dispone en la información proporcionada de benchmarks comparativos directos entre ESM-C 300M y ESM-2 en tareas downstream, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo encoder-only: no genera texto ni secuencias; no debe usarse para tareas generativas.
- Los ficheros GGUF usan una arquitectura personalizada (`general.architecture = "esmc"`) y no son cargables en llama.cpp, Ollama, vLLM ni TGI estándar; requieren el runtime `esmc.cpp`.
- La cuantización Q4 degrada la preservación de efectos de variantes: solo 21-26 de 50 filas de métrica pasan en ProteinGym frente a 41-46 en Q8_0/F16; para puntuación de variantes se recomienda Q8_0 o F16.
- Contexto limitado a 2048 aminoácidos; proteínas más largas requieren truncamiento o segmentación.
- Licencia Cambrian Open License Agreement: no es una licencia permisiva tipo MIT o Apache; es imprescindible revisar sus términos antes de uso comercial.
- Riesgo de sesgo heredado del corpus de entrenamiento original (no documentado en la información disponible), con posible infrarepresentación de familias proteicas poco secuenciadas.
- No se documentan métricas de calibración ni de robustez frente a secuencias sintéticas o de diseño de novo.
- El repositorio tiene un volumen de descargas bajo (187) y solo 2 likes; conviene validar los hashes SHA-256 publicados antes de usar en producción.

## Enlaces

- Hugging Face: https://huggingface.co/AnanyaPathak/esmc-300m-gguf
- Modelo base (EvolutionaryScale): https://huggingface.co/EvolutionaryScale/esmc-300m-2024-12
- Runtime esmc.cpp: https://github.com/AnanyaP-WDW/esmc.cpp
- Blog de ESM Cambrian: https://www.evolutionaryscale.ai/blog/esm-cambrian
- Licencia Cambrian Open License Agreement: https://www.evolutionaryscale.ai/policies/cambrian-open-license-agreement
