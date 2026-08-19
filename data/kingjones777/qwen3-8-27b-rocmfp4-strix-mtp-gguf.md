# kingjones777/Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF

## Resumen

Este repositorio publica tres cuantizaciones ROCmFP4 del modelo **Qwen3.8-27B** (26.9B parámetros) específicamente compiladas para el hardware AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S, gfx1151). El autor, kingjones777, ha empaquetado los pesos en formato GGUF con tipos de tensor ROCmFP4 (ggml types 103, 105 y 106) que solo son interpretables por el fork ROCmFPX de llama.cpp, no por la versión estándar.

La contribución principal no es la cuantización en sí, sino la integración de la cabeza de predicción multi-token (MTP) del modelo base, que permite decodificación especulativa. Tras ajustar el parámetro `--spec-draft-n-max` a 4, se alcanzan **30.30 tok/s** en decodificación a 8K de contexto, frente a los 10.70 tok/s de una cuantización Q4_K_M estándar (2.83× más rápido), manteniendo una perplexidad prácticamente idéntica (5.8877 vs 5.8926). El contexto validado es de 65.536 tokens y el modelo conserva capacidades de visión (4/4 en pruebas de ground truth espacial).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B, sin detalles publicados) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 65.536 (validado) |
| Tipos de cuantizacion | ROCmFP4 (ggml types 103, 105, 106); referencia Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con tipos ROCmFP4, requiere fork ROCmFPX de llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B (si es transformer denso, MoE, etc.) ni sobre sus datos de entrenamiento. La model card indica que el modelo incorpora una cabeza de predicción multi-token (MTP) que se utiliza para decodificación especulativa, y que el modelo tiene capacidades de razonamiento y visión.

La contribución de este repositorio es la cuantización ROCmFP4, un formato de tensor en tiempo de ejecución que reduce el tamaño de los pesos a 4 bits con mantisa FP4, disponible únicamente en el fork ROCmFPX de llama.cpp. Se publican tres variantes: `STRIX` (ftype 105, 13.75 GiB, 4.39 BPW), `STRIX_LEAN` (ftype 106, 13.59 GiB, 4.34 BPW) y `FAST` (ftype 103, 13.33 GiB, 4.25 BPW). Las tres ofrecen velocidades de decodificación prácticamente idénticas (13.44–13.46 tok/s sin especulación), por lo que el autor recomienda usar `STRIX` por su mayor número de bits. La variante `FAST` queda dominada al tener la misma velocidad pero mayor perplexity.

El ajuste del MTP es crítico: el valor por defecto de `--spec-draft-n-max` (16) produce solo la mitad del rendimiento posible; el óptimo medido es 3–4, con una tasa de aceptación de 0.926.

## Capacidades

- Generación de texto con soporte de contexto largo (65.536 tokens validados).
- Razonamiento multi-step (etiquetado como "reasoning" en los tags).
- Capacidades de visión: el autor reporta 4/4 en pruebas de ground truth espacial, y funciona con `-fa on` (flash attention).
- Decodificación especulativa mediante cabeza MTP, con una tasa de aceptación de 0.926 a `n-max 4`.
- Conversacional (etiqueta "conversational").
- No se menciona soporte explícito de tool calling o function calling.

## Casos de uso

- **Inferencia local de alta velocidad en AMD Strix Halo**: el caso principal. En un Ryzen AI Max+ 395 con 128 GB de memoria unificada, la cuantización ROCmFP4 con MTP alcanza 30.30 tok/s, lo que permite ejecutar un modelo de 27B en tiempo real sin GPU dedicada.
- **Chatbots y asistentes conversacionales de baja latencia**: gracias a la decodificación especulativa, la latencia por token se reduce a ~33 ms, adecuado para interacciones interactivas.
- **Procesamiento de documentos largos**: con 65.536 tokens de contexto, puede resumir o analizar informes extensos, contratos o código fuente en una sola pasada.
- **Aplicaciones de visión por computadora**: el modelo conserva capacidades multimodales (4/4 en pruebas espaciales), permitiendo tareas como descripción de imágenes o razonamiento visual en el mismo hardware.
- **Despliegue en entornos con restricciones de memoria**: con 13.33–13.75 GiB de uso de VRAM, cabe en sistemas con 16 GB de memoria unificada, algo inviable con cuantizaciones Q4_K_M (17.67 GiB).
- **Investigación y experimentación con decodificación especulativa**: la publicación de la curva de ajuste de `--spec-draft-n-max` y las métricas de aceptación permiten a otros desarrolladores calibrar sus propios despliegues MTP.

## Benchmarks y rendimiento

Los datos publicados se obtuvieron en un Ryzen AI Max+ 395 (Strix Halo) con ROCm 7.2.4, contexto 65.536, batch 1, greedy, y 256 tokens generados por ejecución. La referencia es una cuantización Q4_K_M del mismo modelo.

| Metrica | ROCmFP4-STRIX | ROCmFP4-STRIX_LEAN | ROCmFP4-FAST | Q4_K_M (referencia) |
|---|---|---|---|---|
| Tamano | 13.75 GiB | 13.59 GiB | 13.33 GiB | 17.67 GiB |
| BPW efectivo | 4.39 | 4.34 | 4.25 | — |
| Decode 8K sin MTP (tok/s) | 13.46 | 13.46 | 13.44 | 10.70 |
| Decode 8K con MTP (tok/s) | 30.30 | — | 30.13 | — |
| Decode 32K sin MTP (tok/s) | 12.58 | — | — | 10.12 |
| Prompt processing 8K (tok/s) | 317.6 | — | — | 306.0 |
| Perplexity (wikitext-2) | 5.8877 ± 0.068 | 5.8871 ± 0.068 | 5.9233 ± 0.068 | 5.8926 ± 0.069 |
| Cold load (s) | 6.3 | — | — | 9.4 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **GPU/APU**: AMD Radeon 8060S (gfx1151) integrada en Ryzen AI Max+ 395, o cualquier GPU compatible con ROCm y gfx1151.
- **Memoria**: 13.33–13.75 GiB de VRAM/unified memory para los pesos; se recomienda al menos 16 GiB disponibles.
- **ROCm**: versión 7.2.4 o superior.
- **Software**: llama.cpp compilado con soporte ROCmFP4 (fork ROCmFPX). La versión estándar de llama.cpp rechaza estos tipos de tensor.
- **Variables de entorno**: `HSA_OVERRIDE_GFX_VERSION=11.5.1` y `GGML_HIP_ENABLE_UNIFIED_MEMORY=1` son necesarias en sistemas con builds Vulkan coexistentes.
- **Opciones de despliegue**: `llama-server` con `--spec-type draft-mtp` y `--model-draft` para la cabeza MTP. No se menciona compatibilidad con vLLM, Ollama o TGI.
- **Latencia**: ~33 ms por token en decodificación con MTP a 8K de contexto; throughput de prompt processing de 317.6 tok/s.

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos de la misma categoría (otros modelos de 27B cuantizados). La única comparativa publicada es contra la cuantización Q4_K_M del mismo modelo base, que se detalla en la tabla de benchmarks. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (ROCmFP4, este repo) | 26.9B | 65.536 | Apache-2.0 | GGUF (ROCmFP4) | Requiere fork ROCmFPX, optimizado para Strix Halo |
| Qwen3.8-27B (Q4_K_M, ggml-org) | 26.9B | 65.536 | Apache-2.0 | GGUF estándar | 17.67 GiB, 10.70 tok/s en el mismo hardware |
| Otros modelos 27B cuantizados | no disponible | no disponible | no disponible | no disponible | Sin datos publicados |

## Limitaciones y advertencias

- **Hardware específico**: los pesos ROCmFP4 solo funcionan en GPUs AMD con gfx1151 (Strix Halo) y requieren el fork ROCmFPX de llama.cpp. No son compatibles con CUDA, Vulkan estándar ni llama.cpp oficial.
- **Sin benchmarks de calidad**: no se han publicado resultados de MMLU, HumanEval, GSM8K ni otras pruebas estándar. La perplexity es similar a Q4_K_M, pero no es un indicador de rendimiento en tareas de código o razonamiento complejo.
- **Variante FAST desaconsejada**: el autor indica que `FAST` (ftype 103) tiene la misma velocidad que `STRIX` pero mayor perplexity, por lo que no es una buena opción por defecto.
- **Ajuste manual del MTP**: el rendimiento máximo solo se alcanza con `--spec-draft-n-max 4`; el valor por defecto (16) reduce la velocidad a la mitad. Es necesario calibrar este parámetro en cada despliegue.
- **Dependencia de ROCm**: requiere ROCm 7.2.4 y variables de entorno específicas; en sistemas con múltiples builds de llama.cpp puede haber conflictos de soname.
- **Idiomas**: no se ha publicado información sobre los idiomas soportados por el modelo base.
- **Sesgos y alucinaciones**: no se han documentado evaluaciones de sesgos ni tasas de alucinación para esta cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Qwen3.8-27B-ROCmFP4-STRIX-MTP-GGUF
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
