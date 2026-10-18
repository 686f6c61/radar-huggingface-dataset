# Akahsizrr/foundry4

## Resumen

Foundry-4 es un modelo de lenguaje especializado en la optimización de kernels (CUDA/Triton), publicado por el usuario Akahsizrr en HuggingFace bajo licencia Apache-2.0. Se trata de un modelo híbrido de 5,02B parámetros totales con aproximadamente 0,58B parámetros activos por token, gracias a una arquitectura MoE con 384 expertos y enrutado sigmoide dropless con top-8. La columna vertebral combina 18 capas GDN (gated DeltaNet) con 6 capas de atención clásica con RoPE, e incorpora mecanismos poco habituales como tablas de n-gramas (KernelGram), un bucle latente de ponderación de 4 iteraciones con pesos compartidos y una cabeza de juez estilo JEV.

El modelo no es un asistente generalista: su entrenamiento se limita a 2000 pasos sobre un corpus curado de episodios de optimización de kernels con feedback medido (RESULT/BEST/HISTORY) y escaleras sintéticas de optimización verificadas en GPU. Es relevante ahora como ejemplo de especialización extrema en un dominio de ingeniería de rendimiento, y por su combinación arquitectónica (lineal + atención + MoE) que reduce el coste por token manteniendo la capacidad total del modelo.

Dado su reducido número de descargas (11) y la ausencia de benchmarks publicados, debe tratarse como un artefacto de investigación reproducible (el repositorio incluye model4.py, gdn.py y segmm.py) más que como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 18 capas GDN (gated DeltaNet, kernel FLA) + 6 capas de atención con RoPE; MoE de 384 expertos con enrutado sigmoide dropless (top-8) y multiplicación segmentada en Triton (segmm); tablas de n-gramas KernelGram; bucle latente de ponderación de 4 iteraciones con pesos compartidos; cabeza de juez estilo JEV |
| Parametros totales | 5.101.225.842 (5,10B) según safetensors; la model card declara 5,02B |
| Parametros activos | ~0,58B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 10,2 GB, tamaño consistente con pesos en BF16/FP16 para 5,1B parámetros); código propio en model4.py, gdn.py y segmm.py |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que sustituye la mayoría de capas de atención por capas GDN (gated DeltaNet), un mecanismo de atención lineal con estado recurrente implementado mediante kernels de la librería FLA: 18 capas GDN frente a solo 6 capas de atención con RoPE. La capa de alimentación es un MoE de 384 expertos con enrutado sigmoide dropless y selección top-8, lo que explica la relación entre parámetros totales (5,02B) y activos (~0,58B). El experto se ejecuta con una multiplicación segmentada empaquetada en Triton (segmm). Se añaden además tablas de n-gramas KernelGram, un bucle latente de 4 iteraciones que reutiliza los mismos pesos (ponder loop) y una cabeza de juez estilo JEV, presumiblemente para puntuar o seleccionar candidatos.

El entrenamiento declarado es corto y muy focalizado: 2000 pasos sobre un corpus curado de optimización de kernels, compuesto por episodios de CUDA/Triton con feedback medido (campos RESULT, BEST e HISTORY) y escaleras sintéticas de optimización verificadas en GPU (synth4.py). No se documenta el número de tokens, la composición exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias; todos esos datos deben considerarse no disponibles. No se mencionan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación y modificación de código CUDA y Triton orientado a optimización de kernels.
- Razonamiento iterativo sobre resultados de benchmark: el formato de entrenamiento (RESULT/BEST/HISTORY) sugiere capacidad para proponer una optimización, leer la medición y refinarla en pasos sucesivos.
- Bucle latente de ponderación de 4 iteraciones con pesos compartidos, orientado a refinar la representación interna antes de generar.
- Cabeza de juez estilo JEV, potencialmente utilizable para puntuar o comparar variantes de kernel.
- Uso de tablas de n-gramas (KernelGram) como señal adicional, probablemente para memorizar patrones frecuentes de fragmentos de código.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no documentado; el bucle de ponderación es latente, no un bucle de herramientas.
- Capacidades multilingües: no disponibles.
- Visión, audio o modo thinking explícito: no disponibles.

## Casos de uso

- Optimización de kernels en un pipeline de CI: el modelo recibe el código de un kernel y las métricas del último benchmark (latencia, ocupación, ancho de banda) y propone una variante; el pipeline vuelve a medir y realimenta el resultado, reproduciendo el esquema RESULT/BEST/HISTORY con el que fue entrenado.
- Autotuning de parámetros de lanzamiento: sugerencia de block sizes, tile sizes y políticas de shared memory para kernels CUDA/Triton antes de ejecutar un barrido exhaustivo, reduciendo el espacio de búsqueda.
- Revisión de pull requests con código de bajo nivel: detección de patrones subóptimos (accesos no coalescentes, bancos de memoria conflictivos, sincronizaciones innecesarias) en diffs de kernels.
- Generación de variantes de un kernel para comparar en una batería de pruebas: dado un kernel base y el hardware objetivo, producir N alternativas y seleccionar la mejor con la cabeza de juez.
- Formación interna de ingenieros de rendimiento: explicación y reescritura de kernels didácticos, con la ventaja de que el modelo está expuesto exclusivamente a episodios de optimización medidos.
- Investigación en arquitecturas híbridas: reproducción y experimentación con la combinación GDN + atención + MoE usando el código incluido (model4.py, gdn.py, segmm.py) como referencia ejecutable.
- Prototipado de bucles de auto-mejora de código con verificación en GPU: integración del modelo como generador de propuestas dentro de un sistema que solo acepta cambios que superen una medición objetiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de rendimiento en tareas de optimización de kernels, y no se han encontrado evaluaciones independientes en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación calculada a partir de 5,10B parámetros; no publicada por el autor): ~10,2 GB en BF16/FP16, ~5,1 GB en INT8 y ~2,6 GB en INT4, sin contar overhead de activaciones, KV cache ni buffers de los kernels Triton.
- GPU recomendadas: A100 40/80 GB o H100 para BF16 con lote grande y contexto largo; L40S o RTX 4090 (24 GB) para BF16 en lote pequeño.
- Cabe en GPU de consumo: sí en BF16 en RTX 3090/4090 (24 GB), y en INT8/INT4 en tarjetas de 8-12 GB, siempre que se consiga cuantizar (no hay versiones cuantizadas publicadas).
- Opciones de despliegue: al tratarse de una arquitectura personalizada con kernels Triton propios, es previsible que requiera transformers con trust_remote_code y el código del repositorio (model4.py, gdn.py, segmm.py); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y estos runtimes necesitarían una implementación específica de las capas GDN, el MoE segmentado y el bucle de ponderación.
- Latencia y throughput: no disponibles. Cualitativamente, con ~0,58B parámetros activos el coste de cómputo por token es bajo, pero el peso del modelo completo debe residir en memoria.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos directamente comparables: la combinación de especialización en kernels CUDA/Triton, arquitectura híbrida GDN + atención, MoE de 384 expertos y bucle latente de ponderación no tiene un equivalente claro entre los modelos publicados. Los resultados de búsqueda obtenidos corresponden a "Foundry Models" de Microsoft Azure, un catálogo de modelos sin relación con este repositorio, por lo que no se utilizan como comparación.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Foundry-4 (Akahsizrr) | 5,10B | ~0,58B | no disponible | Apache-2.0 | HuggingFace, 11 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento muy corto (2000 pasos) y sobre un corpus de un único dominio: es previsible un deterioro severo del rendimiento fuera de tareas de kernels CUDA/Triton y una alta propensión a alucinar APIs o intrínsecos inexistentes.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, ni siquiera en el dominio objetivo.
- Longitud de contexto no documentada: planificar producción sin este dato es arriesgado.
- Idiomas no declarados: no hay garantía de comportamiento en castellano ni en ningún otro idioma distinto del inglés técnico presente en el corpus.
- Requiere código propio y kernels Triton: el despliegue depende de GPUs NVIDIA compatibles y de la versión concreta de Triton/FLA; la portabilidad a otros backends no está resuelta.
- Sesgos conocidos: no documentados; aun así, un corpus de código puede arrastrar sesgos de estilo y de hardware (familia de GPU concreta) que condicionen las recomendaciones.
- Riesgo de sobreajuste a los formatos RESULT/BEST/HISTORY y a las escaleras sintéticas de synth4.py, con posible degradación ante formatos de feedback distintos.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y verificar la procedencia del corpus de entrenamiento, no detallada.
- Confusión de nombre: "Foundry" colisiona con la familia Foundry Models de Microsoft Azure, lo que dificulta la búsqueda y puede inducir a error en documentación interna.
- Madurez: 11 descargas, 0 likes y una diferencia de dos minutos entre creación y última actualización; no hay validación de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Akahsizrr/foundry4
- Código incluido en el repositorio: model4.py, gdn.py, segmm.py (referenciados en la model card, sin URL independiente)
- Script de datos sintéticos: synth4.py (referenciado en la model card, sin URL independiente)
- Colección del autor (Fuse Models): https://huggingface.co/collections/Akahsizrr/fuse-models
- Paper, blog o demo adicionales: no disponibles
