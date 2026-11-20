# Anjielon/Thor-T-35B-A3B

## Resumen

Thor-T-35B-A3B es una familia de cuantizaciones ternarias en formato GGUF del modelo Ornith-1.5-35B-A3B, un transformer híbrido de mezcla de expertos (MoE) con aproximadamente 35B parámetros totales y unos 3B activos por token. Lo desarrolla Anjielon como trabajo de cuantización post-entrenamiento, no como modelo base: la práctica totalidad de los pesos se reduce a valores −1, 0 o +1, almacenados como uno a cuatro planos ternarios por tensor, con una cabeza de predicción multi-token (MTP) ternaria incluida en cada fichero.

El problema que aborda es el de comprimir un MoE de 35B hasta 8-12 GiB manteniendo una fracción alta de la calidad del profesor (la conversión Q8_0 del modelo base), algo que las cuantizaciones públicas de 1-2 bits no consiguen: el fichero ternario ingenuo (TQ1_0 de un solo plano) cae al 32,23 % del profesor en MMLU, mientras que la variante M del autor alcanza el 99,34 %. Todo el proceso se ejecutó en una única APU doméstica (AMD Ryzen AI Max+ 395, 128 GB) con la herramienta abierta Fucina.

Es relevante ahora porque demuestra que la cuantización ternaria con receta elaborada (múltiples planos, importance matrix, destilación del profesor) puede igualar a Q4_K_M en calidad ocupando un 60 % de sus bytes, lo que abre la inferencia de un MoE de 35B en portátiles con 8 GB de VRAM. La contrapartida es que los ficheros requieren un fork específico de llama.cpp (etiqueta `thor-t-v1`) y todavía no cargan en el llama.cpp upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con mezcla de expertos (MoE), cuantizado a ternario (−1, 0, +1) con planos múltiples |
| Parametros totales | 54.763.428.992 (≈54,8B según safetensors del repo; el nombre comercial indica 35B) |
| Parametros activos | ≈3B por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria multi-plano: M (2,949 bits/param), S (2,135), XS (1,946), root (1,993); incluye cabeza MTP ternaria |
| Idiomas soportados | en (inglés) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (llama.cpp fork `thor-t-v1`; Vulkan, CUDA, CPU) |

## Arquitectura y entrenamiento

El modelo base es Ornith-1.5-35B-A3B, un transformer híbrido de mezcla de expertos con unos 35B parámetros totales y aproximadamente 3B activos por token. Thor-T no reentrena el modelo: aplica una cuantización ternaria post-entrenamiento en la que casi todos los pesos se representan con valores −1, 0 o +1, almacenados como uno a cuatro planos ternarios por tensor según la variante. Cada fichero incorpora además una cabeza de predicción multi-token (MTP) también ternaria, que actúa como mecanismo de decodificación especulativa para acelerar la generación.

El proceso se construyó con Fucina, una herramienta de cuantización abierta del mismo autor, sobre una única APU AMD Ryzen AI Max+ 395 con 128 GB de memoria, partiendo de una conversión Q8_0 del modelo base que actúa como profesor. La receta combina una importance matrix pública, múltiples planos ternarios y una etapa de destilación desde el profesor; el paper adjunto documenta el método y todas las cifras. El repo incluye además un directorio `replay/` con las entradas de la réplica pública de la receta (el root empaquetado sin la cabeza MTP y las entradas densas de PTQ), que no son necesarias para ejecutar los modelos.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Ornith-1.5-35B-A3B.
- Razonamiento y conocimiento general evaluados vía MMLU completo (14.042 preguntas, zero-shot, puntuado por log-probabilidad).
- Decodificación especulativa integrada mediante la cabeza MTP ternaria presente en todos los ficheros, con ganancias de throughput documentadas.
- Inferencia en CPU, Vulkan y CUDA a través del fork de llama.cpp `thor-t-v1`.
- Compatibilidad con endpoints (tag `endpoints_compatible` en Hugging Face).
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de un MoE de 35B en portátil con GPU de 8 GB: la variante XS (8,04 GiB) corre en una RTX 4060 Laptop con parte de los expertos en RAM del sistema (`-ncmoe 14`), alcanzando 66,1 tokens/s con MTP activado, lo que permite asistentes locales interactivos sin depender de la nube.
- Despliegue en hardware de gama media con CUDA: la variante S (8,82 GiB, `-ncmoe 18`) ofrece 53,7 tokens/s en la misma RTX 4060 Laptop y mantiene el 96,59 % del profesor en MMLU, adecuada para generación de texto en producción con latencia baja.
- Servicio de mayor calidad en estación de trabajo o APU: la variante M (12,19 GiB) iguala estadísticamente a Q4_K_M (diferencia de −0,10 puntos, p = 0,75) con un 60 % de sus bytes, útil cuando el presupuesto de VRAM es ajustado pero se exige calidad cercana al profesor.
- Investigación sobre cuantización ternaria: el checkpoint root (8,24 GiB, 92,47 % del profesor) y el directorio `replay/` permiten reproducir la receta con Fucina (`fucina replay examples/thor/recipe_c.yaml`) y comparar variantes de planos.
- Evaluación comparativa de cuantizaciones: los datos de Thor-T-bench y los tests pareados con McNemar exacto permiten contrastar Thor-T frente a Q2_K, IQ2_XXS, IQ1_M y TQ1_0 en el mismo motor Vulkan.
- Prototipado en CPU sin GPU dedicada: el fork soporta CPU además de Vulkan y CUDA, de modo que los ficheros pueden ejecutarse en servidores sin acelerador para tareas de batch o validación.

## Benchmarks y rendimiento

MMLU completo (14.042 preguntas, zero-shot, log-probabilidad), mismo motor Vulkan (commit `4ed3ec488`, APU Ryzen AI Max+ 395), como porcentaje de la conversión Q8_0 del modelo base (profesor):

| Fichero | GiB | MMLU | % del profesor | Notas |
|---|---:|---:|---:|---|
| Profesor Q8_0 | 35,21 | 80,59 | 100 | referencia |
| Q4_K_M | 20,36 | 80,16 | 99,46 | cuantización pública del mismo profesor |
| **M** | 12,19 | **80,06** | **99,34** | vs Q2_K +2,38 pts (IC 95 % +1,77 a +2,98; p < 1e-10); vs Q4_K_M −0,10 pts (p = 0,75); vs profesor −0,53 pts (p = 0,062) |
| Q2_K | 12,19 | 77,68 | 96,39 | |
| IQ2_XXS | 9,55 | 71,76 | 89,03 | |
| **S** | 8,82 | **77,85** | **96,59** | vs IQ2_XXS +6,09 pts (p < 1e-10); vs IQ1_M p < 1e-10; vs profesor −2,75 pts (p < 1e-10) |
| root | 8,24 | 74,53 | 92,47 | checkpoint de investigación |
| IQ1_M | 8,12 | 54,14 | 67,18 | |
| **XS** | 8,04 | **72,29** | **89,70** | vs TQ1_0 ingenuo p < 1e-10; vs profesor −8,30 pts (p < 1e-10) |
| TQ1_0 ingenuo (un plano) | 7,87 | 25,97 | 32,23 | sin receta |

Throughput con MTP activado (un token draft, 5 prompts × 256 tokens, greedy):

| Fichero | Tokens/s en APU (Vulkan) | Tokens/s en RTX 4060 Laptop 8 GB (CUDA) |
|---|---:|---:|
| M | 77,53 | 39,2 |
| S | 84,41 | 53,7 |
| XS | 95,42 | 66,1 |
| root | 87,78 | 61,3 |

Advertencia del autor: el desarrollo de M y S utilizó el conjunto de test de MMLU, por lo que sus puntuaciones no son estimaciones independientes y los intervalos y p-valores son nominales; no se reclama equivalencia formal con Q4_K_M.

## Requisitos de hardware

- VRAM/memoria estimada: entre 8,04 GiB (XS) y 12,19 GiB (M) para los pesos; el root ocupa 8,24 GiB y S 8,82 GiB. El repo completo suma 49,2 GB, pero solo se descarga un fichero.
- GPU recomendadas: RTX 4060 Laptop (8 GB) validada con CUDA y parte de los expertos en RAM del sistema (`-ncmoe` XS 14, S 18, M 22); APU AMD Ryzen AI Max+ 395 con 128 GB validada con Vulkan.
- Cabe en GPU de consumo: sí; XS y S en 8 GB con offload parcial de expertos, M requiere más memoria o mayor offload a RAM.
- Opciones de despliegue: exclusivamente el fork `Anjielon/llama.cpp` etiqueta `thor-t-v1` (Vulkan, CUDA, CPU); no carga en llama.cpp upstream. Compatible con endpoints según los tags.
- Latencia y throughput: 95,42 tokens/s (XS) a 77,53 tokens/s (M) en la APU con MTP; 66,1 a 39,2 tokens/s en la RTX 4060 Laptop. Sin MTP, los detalles están en el paper y en los logs de Thor-T-bench.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato/cuantización | Tamaño | MMLU | Licencia |
|---|---|---|---:|---:|---|
| Thor-T-35B-A3B M | ≈35B (3B activos) | Ternaria multi-plano, GGUF | 12,19 GiB | 80,06 | CC BY 4.0 |
| Q4_K_M del mismo profesor | ≈35B (3B activos) | K-quant 4 bits, GGUF | 20,36 GiB | 80,16 | según modelo base |
| Q2_K del mismo profesor | ≈35B (3B activos) | K-quant 2 bits, GGUF | 12,19 GiB | 77,68 | según modelo base |
| IQ2_XXS del mismo profesor | ≈35B (3B activos) | I-quant 2 bits, GGUF | 9,55 GiB | 71,76 | según modelo base |
| IQ1_M (construido por el autor) | ≈35B (3B activos) | I-quant 1 bit, GGUF | 8,12 GiB | 54,14 | según modelo base |
| TQ1_0 ingenuo | ≈35B (3B activos) | Ternaria de un plano, GGUF | 7,87 GiB | 25,97 | según modelo base |

La comparación se limita a cuantizaciones del mismo profesor porque no se dispone de datos de otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés (`language: en`); no se documentan capacidades multilingües.
- Longitud de contexto no disponible en la información proporcionada.
- Requiere un fork no upstream de llama.cpp (`thor-t-v1`); no funciona en llama.cpp estándar ni, presumiblemente, en herramientas que dependan de él (Ollama, vLLM, TGI) sin adaptación.
- Las puntuaciones de M y S están contaminadas por selección sobre el test de MMLU: no son estimaciones independientes y los p-valores son nominales.
- XS pierde un 10,30 % respecto al profesor en MMLU (−8,30 puntos) y no es adecuado cuando se exige fidelidad alta.
- Riesgo de alucinación y sesgos del modelo base: no cuantificado en la información disponible.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base Ornith-1.5-35B-A3B, de la que depende.
- El rendimiento medido se limita a dos plataformas concretas (APU Vulkan y RTX 4060 Laptop CUDA); no hay datos de throughput en A100/H100.
- La decodificación especulativa depende de la cabeza MTP ternaria; su comportamiento fuera del fork no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anjielon/Thor-T-35B-A3B
- Paper (PDF): https://huggingface.co/Anjielon/Thor-T-35B-A3B/blob/main/Thor-T-35B-A3B-paper.pdf
- Fucina (herramienta de cuantización): https://github.com/Anjielon/fucina
- Fork de llama.cpp, rama `thor-t-v1`: https://github.com/Anjielon/llama.cpp/tree/thor-t-v1
- Datos y logs de benchmarks: https://huggingface.co/datasets/Anjielon/Thor-T-bench
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
