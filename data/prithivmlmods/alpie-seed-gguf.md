# prithivMLmods/Alpie-Seed-GGUF

## Resumen

Alpie Seed 9B es un modelo de lenguaje y vision (vision-language model) de pesos abiertos desarrollado por 169Pi AI, obtenido mediante post-entrenamiento a partir de Qwen3.5-9B. Acepta entradas de texto, imagen y video, y esta disenado para tareas de razonamiento, generacion de codigo, seguimiento de instrucciones y comprension multimodal. Su ventana de contexto alcanza los 262K tokens, lo que lo situa en el rango de modelos de contexto largo.

La version aqui documentada, Alpie-Seed-GGUF, es una conversion a formato GGUF realizada por prithivMLmods mediante llama.cpp, pensada para inferencia local con llama.cpp y ecosistemas compatibles como Ollama. Incluye pesos en BF16 y cuantizaciones de 3, 4, 5 y 6 bits, ademas del proyector multimodal (mmproj) en BF16 necesario para el procesamiento de imagenes.

El modelo resulta relevante por combinar capacidades multimodales, contexto muy largo y soporte declarado de once idiomas (ingles y diez idiomas indicos) bajo licencia Apache 2.0, con un tamano de aproximadamente 9B parametros que lo hace desplegable en hardware de consumo en sus cuantizaciones bajas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language), post-entrenado desde Qwen3.5-9B; detalles internos de atencion no disponibles |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | BF16, Q3_K_S/Q3_K_M/Q3_K_L, Q4_K_S/Q4_K_M, Q5_K_S/Q5_K_M, Q6_K; proyector multimodal en BF16 |
| Idiomas soportados | Ingles (en), hindi (hi), bengali (bn), marathi (mr), gujarati (gu), telugu (te), malayalam (ml), punyabi (pa), kannada (kn), oriya (or), tamil (ta) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16 y cuantizados); el modelo base se distribuye en safetensors/FP16 |

## Arquitectura y entrenamiento

Alpie Seed 9B parte de la arquitectura Qwen3.5-9B y anade capacidad multimodal para procesar texto, imagen y video, con un proyector multimodal separado (mmproj) que traduce representaciones visuales al espacio del modelo de lenguaje. El post-entrenamiento se realizo en dos etapas: primero un ajuste supervisado (SFT) con un adaptador DoRA, y despues un entrenamiento con GRPO (Group Relative Policy Optimization) tambien mediante adaptador DoRA sobre una base cuantizada en 4 bits NF4, con la fusion posterior de los pesos a la precision original. Segun la model card, el modelo soporta modo de razonamiento (thinking) y modo directo (non-thinking).

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como DPO. La model card indica explicitamente que no emplea decodificacion especulativa MTP (Multi-Token Prediction).

## Capacidades

- Generacion de texto y razonamiento en modo thinking y non-thinking.
- Comprension de imagenes (image-text-to-text) y de video.
- Generacion y razonamiento sobre codigo, con resultados destacados en LiveCodeBench v6 y SWE-Bench Verified.
- Razonamiento matematico y cientifico (AIME 2026, GPQA Diamond, MathVision).
- OCR y comprension de documentos (OCRBench).
- Capacidades multilingues centradas en ingles e idiomas indicos.
- Seguimiento de instrucciones conversacionales multi-turno.
- Soporte de contexto largo (262K tokens).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a sus 262K tokens de contexto, aceptando capturas de pantalla o fotos de producto enviadas por el usuario y respondiendo en ingles o en idiomas indicos.
- Extraccion de datos de documentos: uso de sus capacidades OCR y de comprension de documentos (90.30 en OCRBench) para digitalizar facturas, formularios o tickets en pipelines de back office.
- Asistente de codigo en local: con las cuantizaciones Q4_K_M (5.63 GB) o Q5_K_M (6.47 GB) puede ejecutarse en una GPU de consumo y asistir en tareas de generacion y revision de codigo, con un rendimiento declarado de 72.99 en LiveCodeBench v6.
- Analisis de video para monitorizacion: al aceptar entradas de video, puede resumir o describir contenido audiovisual en flujos de revision de material grabado, siempre que se disponga de recursos suficientes para el contexto largo.
- Despliegue en mercados indicos: atencion y generacion de contenido en hindi, tamil, telugu, bengali y otros idiomas indicos para aplicaciones locales, aprovechando el soporte multilingue declarado.
- Inferencia en el borde o en portatil: la version Q3_K_M (4.62 GB) permite ejecutar el modelo en equipos con RAM limitada mediante llama.cpp u Ollama, util para prototipos y demos sin GPU dedicada.
- Evaluacion de razonamiento cientifico: uso en entornos de investigacion para tareas de fisica y matematicas de nivel avanzado (84.32 en GPQA Diamond, 83.33 en AIME 2026), con la advertencia de que las puntuaciones provienen del modelo FP16.

## Benchmarks y rendimiento

Resultados declarados en la model card, en modo thinking con temperatura 0.0 y sobre el modelo FP16:

| Benchmark | Alpie Seed 9B | Qwen3.5-9B | Gemma 4 12B |
|---|---|---|---|
| MMLU | 87.30 | no disponible | no disponible |
| MMLU-Pro | 82.54 | 82.5 | no disponible |
| GPQA Diamond | 84.32 | 81.7 | no disponible |
| AIME 2026 | 83.33 | 69.4 | no disponible |
| LiveCodeBench v6 | 72.99 | 65.6 | no disponible |
| SWE-Bench Verified | 61.20 | no disponible | no disponible |
| OCRBench | 90.30 | no disponible | no disponible |
| MMMU-Pro | 68.70 | 70.1 | no disponible |
| MathVision | 76.76 | 78.9 | 79.7 |
| MMStar | no disponible (Qwen3.5-9B por delante) | no disponible | no disponible |

La propia model card advierte que las puntuaciones de comparacion no fueron reejecutadas por 169Pi y que los arneses de evaluacion difieren, por lo que deben considerarse indicativas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q3_K_M ~4.62 GB, Q4_K_S ~5.35 GB, Q4_K_M ~5.63 GB, Q5_K_S ~6.31 GB, Q5_K_M ~6.47 GB, Q6_K ~7.36 GB, BF16 ~17.9 GB; anadir ~922 MB del proyector mmproj para tareas de vision.
- Cabe en GPU de consumo: si, en las cuantizaciones Q3 a Q6 (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090). La version BF16 requiere GPU de 24 GB o mas (RTX 3090/4090, A100, H100).
- GPU recomendadas: RTX 4090 o A100/H100 para BF16 y contexto largo; RTX 3060/4060 Ti de 12-16 GB para cuantizaciones Q4-Q6.
- Opciones de despliegue: llama.cpp (herramienta con la que se generaron los GGUF), Ollama, y librerias compatibles con transformers/TGI segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas de rendimiento |
|---|---|---|---|---|---|
| Alpie Seed 9B | ~9B | 262K | Si (imagen y video) | Apache 2.0 | 87.30 MMLU, 84.32 GPQA Diamond, 72.99 LiveCodeBench v6 |
| Qwen3.5-9B | ~9B | no disponible | no disponible | no disponible | 82.5 MMLU-Pro, 81.7 GPQA Diamond, 70.1 MMMU-Pro, 78.9 MathVision |
| Gemma 4 12B | ~12B | no disponible | no disponible | no disponible | 79.7 MathVision |

Segun los datos de la model card, Alpie Seed 9B supera a Qwen3.5-9B en GPQA Diamond, AIME 2026 y LiveCodeBench, mientras que Qwen3.5-9B queda por delante en MMLU-Pro, MMMU-Pro, MathVision y MMStar. Gemma 4 12B lidera MathVision con 79.7. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Las puntuaciones de benchmarks provienen del modelo FP16; el rendimiento de las cuantizaciones GGUF (especialmente Q3) puede degradarse, sobre todo en tareas de vision y razonamiento fino.
- La comparacion con Qwen3.5-9B y Gemma 4 12B no fue reejecutada por el desarrollador y los arneses difieren; los resultados son indicativos, no concluyentes.
- Riesgo de alucinacion inherente a los modelos de ~9B, especialmente en contexto muy largo o en tareas de OCR con documentos de baja calidad.
- El soporte multilingue se limita a ingles y diez idiomas indicos; el castellano no figura entre los idiomas declarados.
- No se confirma soporte de tool calling ni de flujos de agentes en la informacion disponible, lo que limita su uso en pipelines automatizados complejos sin validacion previa.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B del que deriva.
- El repositorio GGUF ocupa 59.5 GB en total; descargar solo el archivo de cuantizacion necesario y el mmproj si se requiere vision.
- No se dispone de informacion sobre sesgos especificos ni sobre el dataset de entrenamiento, lo que dificulta evaluar riesgos de dominio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Alpie-Seed-GGUF
- Modelo base: https://huggingface.co/169Pi/Alpie_seed
- GGUF oficial del autor: https://huggingface.co/169Pi/Alpie_Seed_GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
