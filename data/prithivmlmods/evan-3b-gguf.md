# prithivMLmods/EVAN-3B-GGUF

## Resumen

EVAN-3B-GGUF es la versión cuantizada en formato GGUF de EVAN-3B, un modelo multimodal de razonamiento de 3.397 millones de parámetros desarrollado por DawnLiu y cuantizado por prithivMLmods. El modelo base está construido sobre Qwen2.5-VL-3B-Instruct y se presenta en el paper de NeurIPS 2026 *Grounding Multimodal Reasoning with Evidence-Ablated Negatives*. Su innovación principal es el entrenamiento EVAN (Evidence-Ablated Negatives) con DAPO sobre el dataset TIGER-Lab/ViRL39K: durante el entrenamiento se enmascara la evidencia visual para identificar y penalizar respuestas plausibles pero incorrectas que se apoyan en sesgos del lenguaje en lugar de en la comprensión real de la imagen.

Este enfoque resuelve un problema conocido en los modelos vision-language: la tendencia a responder correctamente "de oído" sin mirar la imagen. En nueve benchmarks de razonamiento matemático, científico y lógico, EVAN-3B alcanza una precisión media del 51,6 %, frente al 30,7 % de su base Qwen2.5-VL-3B y al 50,3 % de un baseline DAPO estándar. El formato GGUF permite ejecutarlo localmente con llama.cpp u Ollama, incluso en hardware modesto, gracias a cuantizaciones desde Q3_K_L (1,84 GB) hasta BF16 (6,8 GB). Su licencia es la Qwen Research License, de uso exclusivamente no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal vision-language (base Qwen2.5-VL-3B-Instruct), transformer con proyector vision-language |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-BF16 |
| Idiomas soportados | Ingles |
| Licencia | Qwen Research License (uso no comercial) |
| Formato de pesos | GGUF (el modelo base DawnLiu/EVAN-3B esta en safetensors) |

## Arquitectura y entrenamiento

EVAN-3B parte de Qwen2.5-VL-3B-Instruct, una arquitectura transformer multimodal que combina un codificador visual con un decodificador de lenguaje mediante un proyector vision-language (el archivo mmproj en GGUF corresponde a este componente). Sobre esta base se aplica el entrenamiento EVAN (Evidence-Ablated Negatives): se generan ejemplos negativos ablando (enmascarando) la evidencia visual durante el entrenamiento, de modo que el modelo aprende a detectar y penalizar respuestas que parecen correctas pero que provienen de prioridades linguisticas y no de la comprensión de la imagen. Este proceso se combina con DAPO (una variante de aprendizaje por refuerzo para razonamiento) sobre el dataset TIGER-Lab/ViRL39K, centrado en razonamiento visual-matematico.

El formato de salida del modelo sigue un esquema de razonamiento explicito: el modelo genera primero un bloque `<think>...</think>` con su cadena de razonamiento y despues entrega la respuesta final dentro de `\boxed{}`. Para inferencia con vLLM se recomienda configurar `top_k=50` en los `SamplingParams`. La inferencia en BF16 se apoya en Hugging Face Transformers (version 4.57 o superior) mediante las clases `AutoModelForImageTextToText` y `AutoProcessor`.

## Capacidades

- Razonamiento multimodal sobre imagenes: matematicas visuales, ciencia y logica, con cadena de razonamiento explicita (`<think>...</think>`) y respuesta final en `\boxed{}`.
- Comprension de imagenes y texto (pipeline image-text-to-text): analiza contenido visual y responde preguntas sobre el.
- Resolucion de problemas matematicos presentados como imagenes (geometria, graficas, diagramas).
- Razonamiento logico y cientifico multimodal.
- Generacion de texto conversacional en ingles.
- Ejecucion local eficiente mediante GGUF en llama.cpp, con soporte para GPU y CPU.
- Inferencia servida tambien con vLLM y Transformers (modelo base en BF16).
- No hay informacion disponible sobre soporte de tool calling ni capacidades de agentes.

## Casos de uso

- Resolucion automatica de problemas matematicos con diagramas: dada una imagen de un problema de geometria o una grafica, el modelo genera el razonamiento paso a paso y la respuesta final; su puntuacion de 39,9 % en Geo3K y 64,6 % en We-Math lo hace adecuado para tutorias automatizadas.
- Asistente educativo de STEM: puede explicar ejercicios de matematicas y ciencias a partir de fotografias de apuntes o libros, aprovechando su formato de razonamiento visible para que el estudiante siga el proceso.
- Verificacion de respuestas en plataformas de e-learning: dado que penaliza respuestas basadas en sesgos linguisticos, es util para evaluar si una solucion se apoya realmente en la figura o diagrama proporcionado.
- Extraccion y analisis de datos en imagenes tecnicas: lectura de graficas, tablas y esquemas cientificos con preguntas en lenguaje natural (62,7 % en MathVista).
- Prototipado local de aplicaciones multimodales: las cuantizaciones Q4_K_M (2,1 GB) permiten probar pipelines vision-language en portatiles o mini-PC sin GPU dedicada.
- Investigacion en razonamiento multimodal: al ser un modelo de investigación con paper en NeurIPS 2026, sirve como baseline reproducible para estudiar la reduccion de atajos linguisticos en VLMs.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye nueve niveles de cuantizacion, util para medir la degradacion de calidad frente a tamaño en modelos multimodales pequeños.

## Benchmarks y rendimiento

Resultados publicados en la model card (media sobre nueve benchmarks de razonamiento multimodal):

| Benchmark | EVAN-3B | Qwen2.5-VL-3B (base) | Baseline DAPO |
|---|---|---|---|
| Media (9 benchmarks) | 51,6 % | 30,7 % | 50,3 % |
| Geo3K | 39,9 % | no disponible | no disponible |
| MathVista | 62,7 % | no disponible | no disponible |
| MathVerse | 62,8 % | no disponible | no disponible |
| We-Math | 64,6 % | no disponible | no disponible |
| DynaMath | 60,6 % | no disponible | no disponible |
| MathVision | 27,6 % | no disponible | no disponible |
| MMMU-Pro | 31,0 % | no disponible | no disponible |
| LogicVista | 43,3 % | no disponible | no disponible |
| MMK12 | 71,5 % | no disponible | no disponible |

EVAN-3B lidera en ocho de los nueve benchmarks frente a su modelo base y al baseline DAPO. No se han publicado resultados de benchmarks para las versiones cuantizadas GGUF.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion (solo pesos del LLM; el mmproj BF16 anade 1,34 GB):
  - Q3_K_L: 1,84 GB; Q3_K_M: 1,72 GB
  - Q4_K_S: 2,01 GB; Q4_K_M: 2,1 GB
  - Q5_K_S: 2,38 GB; Q5_K_M: 2,44 GB
  - Q6_K: 2,79 GB; Q8_0: 3,62 GB
  - BF16: 6,8 GB
- Con Q4_K_M y mmproj, el conjunto ronda los 3,5 GB, por lo que cabe holgadamente en GPUs consumer como una RTX 3060 de 12 GB, RTX 4060 Ti o incluso en GPUs de 6-8 GB; tambien es viable en CPU pura con RAM suficiente (8 GB o mas).
- Para BF16 completo (8,1 GB con mmproj) se recomienda una GPU con 12 GB de VRAM o mas, como RTX 3060 12 GB, RTX 4070 o superiores.
- El modelo base en BF16 con Transformers o vLLM funciona comodamente en una RTX 4090 (24 GB) o A100; no se requieren H100 para este tamaño.
- Despliegue: llama.cpp (formato nativo GGUF), Ollama (compatible con GGUF), y para el modelo base, Hugging Face Transformers (>=4.57, `AutoModelForImageTextToText`) y vLLM con `top_k=50`.
- No se han publicado mediciones de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidad | Contexto | Razonamiento visual destacado | Licencia |
|---|---|---|---|---|---|
| EVAN-3B | 3.397 M | Imagen-texto a texto | no disponible | 51,6 % media en 9 benchmarks; entrenamiento EVAN+DAPO | Qwen Research (no comercial) |
| Qwen2.5-VL-3B-Instruct (base) | ~3.000 M | Imagen-texto a texto | no disponible | 30,7 % media en los mismos benchmarks | Qwen Research (no comercial) |
| Qwen2.5-VL-7B-Instruct | ~7.000 M | Imagen-texto a texto | no disponible | Superior en benchmarks generales, mayor coste de inferencia | Qwen Research (no comercial) |

EVAN-3B se posiciona como una alternativa de 3B especializada en razonamiento visual-matematico, con una mejora sustancial (+20,9 puntos) sobre su modelo base en la misma clase de tamaño, a costa de una licencia restrictiva y un foco estrecho en razonamiento (no en tareas generales de vision como OCR puro o deteccion).

## Limitaciones y advertencias

- Licencia Qwen Research License: el uso esta restringido a investigacion y fines no comerciales. Cualquier despliegue en producto comercial requiere revisar la licencia y, en su caso, obtener autorizacion.
- Idioma: el modelo esta orientado al ingles; no hay soporte declarado para castellano ni otros idiomas, y el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion: aunque el entrenamiento EVAN reduce especificamente las respuestas basadas en sesgos linguisticos, sigue siendo un modelo de 3B con tasa de error notable (27,6 % en MathVision, 31,0 % en MMMU-Pro), por lo que sus respuestas deben verificarse en usos criticos.
- Contexto: la longitud de ventana de contexto no esta documentada en la model card; conviene verificarla antes de disenar aplicaciones con documentos largos.
- Los archivos GGUF conservan el prefijo "EAN-3B" (nombre anterior del modelo), lo que puede generar confusion; los pesos son identicos a EVAN-3B.
- Las cuantizaciones Q3_K_L y Q3_K_M degradan apreciablemente la calidad; para resultados representativos se recomiendan Q4_K_M o superiores.
- No hay datos de benchmarks para las versiones cuantizadas, por lo que el impacto real de la cuantizacion en la precision de razonamiento es desconocido.
- No hay informacion sobre soporte de tool calling, agentes ni uso multi-turno complejo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/EVAN-3B-GGUF
- Modelo base: https://huggingface.co/DawnLiu/EVAN-3B
- Commit de renombrado EAN-3B a EVAN-3B: https://huggingface.co/DawnLiu/EVAN-3B/commit/44c37b486308ca6b804721a73f77e88c31e7159c
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/TIGER-Lab/ViRL39K
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper NeurIPS 2026 *Grounding Multimodal Reasoning with Evidence-Ablated Negatives*: enlace no disponible en la informacion proporcionada
