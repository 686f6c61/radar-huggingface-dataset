# axteam/Qwen3.5-4B-NVFP4A16

## Resumen

`axteam/Qwen3.5-4B-NVFP4A16` es una cuantización de 4 bits del modelo multimodal `Qwen/Qwen3.5-4B` del equipo Qwen, publicada por axteam para servir inferencia eficiente en vLLM. No es un modelo nuevo: es un derivado post-training (PTQ) que conserva tokenizador, `chat_template`, `generation_config` y comportamiento del original, pero almacena la mayor parte de los pesos en FP4 (E2M1) con activaciones en BF16, el esquema conocido como W4A16.

El modelo base es denso, de 4.539.265.536 parámetros (unos 4,54 B), con arquitectura híbrida que combina atención lineal (GatedDeltaNet/SSM) y atención completa, torre de visión para entrada imagen-texto y una cabeza de predicción multi-token (MTP). La familia Qwen3.5 se presenta en su documentación como una base unificada visión-lenguaje entrenada con fusión temprana sobre tokens multimodales.

Su relevancia es práctica: reduce el peso en disco a unos 5,3 GB (frente a los aproximadamente 9 GB que ocuparían los pesos en BF16) manteniendo una fidelidad medida del 91,7 % de acuerdo top-1 y un aumento de perplejidad del 4,3 % respecto al original. Es una pieza pensada para despliegue, no para entrenamiento, y su utilidad depende de disponer de hardware con soporte para el formato NVFP4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + atención completa), densa, multimodal con torre de visión y cabeza MTP |
| Parámetros totales | 4.539.265.536 (~4,54 B) |
| Parámetros activos | No aplica: modelo denso |
| Longitud de contexto | No disponible |
| Tipos de cuantización | NVFP4A16 (W4A16): pesos FP4 E2M1 en grupos de 16 con escala FP8 E4M3 y escala global FP32 por tensor; activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors; ~5,3 GB en disco (repo de 5,7 GB) |

Elementos que se mantienen en BF16 según el autor: torre de visión y proyector (`model.visual.*`), cabeza de predicción multi-token (`mtp.*`), todas las RMSNorm, embeddings de tokens, LM head y la totalidad de la ruta de atención lineal (`linear_attn.*`, GatedDeltaNet/SSM), porque FP4 resulta demasiado grosero para esos pesos.

## Arquitectura y entrenamiento

El modelo base combina capas de atención lineal tipo SSM (GatedDeltaNet) con capas de atención completa, un patrón híbrido habitual para reducir el coste del caché KV en contextos largos manteniendo recuperación exacta en parte de las capas. Sobre ese tronco se añade una torre de visión con su proyector para entrada imagen-texto y una cabeza MTP, orientada a decodificación especulativa o predicción de varios tokens. La documentación de la familia Qwen3.5 describe un entrenamiento de fusión temprana sobre tokens multimodales, presentado como paridad cross-generacional con Qwen3 y superior a Qwen3-VL en razonamiento, código, agentes y comprensión visual. El número exacto de tokens de entrenamiento del modelo de 4 B no está disponible en la información consultada; las referencias de la familia hablan de billones de tokens multimodales sin desglose por tamaño.

Esta publicación concreta no entrena nada: es cuantización post-entrenamiento. La calibración se hizo con 256 muestras de un corpus mixto con predominio de coreano e inglés, sin gradientes. El autor reporta fidelidad al BF16 original sobre un conjunto interno de 100 prompts en inglés y coreano con decodificación greedy y el mismo arnés para todas las filas. Nota documental: la model card describe el método como NVFP4A16 pero menciona AWQ al explicar la calibración; esa referencia a AWQ no es coherente con un esquema NVFP4 puro y conviene tratarla como un error de redacción de la card.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat idéntica a la del modelo original.
- Entrada imagen-texto: descripción de imágenes, respuesta a preguntas visuales y lectura de contenido presente en capturas o documentos.
- Comprensión visual combinada con razonamiento textual en una sola pila (fusión temprana, según la documentación de la familia).
- Razonamiento y código: la familia Qwen3.5 se posiciona con paridad respecto a Qwen3 y por encima de Qwen3-VL en pruebas de razonamiento, código, agentes y comprensión visual; no hay cifras por modelo en la información disponible.
- Cabeza MTP para predicción multi-token, aprovechable en esquemas de decodificación especulativa.
- Cargas de tipo agente: la familia se documenta para flujos agénticos y despliegue en dispositivos edge; el soporte explícito de tool calling o function calling no está detallado en la información disponible.
- Capacidades multilingües: no documentadas para este modelo; la calibración se hizo con corpus inglés/coreano, lo que no implica cobertura de idiomas.
- Modo thinking o razonamiento extendido: no disponible en la información consultada.

## Casos de uso

- Servicio de inferencia multimodal económico en vLLM: `vllm serve axteam/Qwen3.5-4B-NVFP4A16` levanta el modelo directamente; con ~5,3 GB de pesos se puede atender visión y texto en una GPU de 16-24 GB dejando margen para caché KV y procesamiento de imágenes.
- Extracción de datos de documentos escaneados y capturas: recibir la imagen y devolver campos estructurados (importes, fechas, nombres) en un pipeline interno de digitalización, aprovechando la torre de visión en BF16 que conserva calidad frente a la cuantización.
- Soporte técnico con captura de pantalla: el usuario adjunta una imagen del error y el modelo mantiene la conversación multi-turno con la plantilla de chat original, útil para triaje de primer nivel.
- Enrutado y clasificación de tickets con adjuntos visuales: clasificar y etiquetar incidencias a partir de imagen y texto antes de derivarlas al equipo correcto, con latencia baja al ser un modelo de 4 B.
- Validación de despliegues cuantizados: usar las métricas de fidelidad publicadas (perplejidad y acuerdo top-1) como referencia para comparar otras cuantizaciones del mismo modelo base antes de pasar a producción.
- Inferencia en el borde sobre plataformas Blackwell: el modelo de 4 B de la familia está documentado para cargas multimodales locales en dispositivos Jetson, y este formato encaja en GPUs de esa generación con memoria limitada.
- Asistente de código con contexto visual: adjuntar una captura de un fallo de compilación y pedir un diagnóstico o parche, dentro de un flujo de revisión previa a CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible. El autor solo publica métricas de fidelidad frente al modelo BF16 original sobre un conjunto interno de 100 prompts en inglés y coreano:

| Métrica | Este modelo | Original BF16 | Diferencia |
|---|---|---|---|
| Perplejidad (menor es mejor) | 1,6374 | 1,5703 | +4,3 % |
| Acuerdo top-1 en siguiente token | 91,7 % | 99,2 % | -7,5 puntos |

Estas cifras miden parecido con el modelo base, no calidad absoluta en tareas. No hay datos de throughput ni de latencia publicados.

## Requisitos de hardware

- Peso en disco: ~5,3 GB de pesos; repo completo de 5,7 GB.
- VRAM estimada para inferencia: en torno a 6-8 GB con contexto corto y una imagen por petición; 10-12 GB o más si se trabaja con prompts visuales grandes o contextos largos (estimación propia a partir del tamaño de pesos, no publicada por el autor).
- GPU recomendadas: cualquier GPU Blackwell con soporte nativo de NVFP4 (B100, B200, RTX 5090, RTX PRO 6000 Blackwell, Jetson Thor). El formato NVFP4 está definido por NVIDIA y su ejecución eficiente en vLLM depende de esa generación; en Hopper o Ada no está confirmado el soporte y conviene verificar antes de desplegar.
- Cabe en GPU de consumo: sí, en la gama RTX 50 (Blackwell) con 16 GB o más; una RTX 5090 de 32 GB deja mucho margen para lotes y caché KV.
- Opciones de despliegue: vLLM es la vía documentada (`vllm serve`); también es cargable con transformers y compressed-tensors. Este repo no incluye GGUF, por lo que llama.cpp u Ollama no lo consumen directamente: la entrada `qwen3.5:4b` de Ollama es una build distinta de la misma familia, no esta cuantización.
- Muestreo recomendado por Qwen: `temperature=0.7`, `top_p=0.8`, `top_k=20`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-4B-NVFP4A16 | ~4,54 B | No disponible | NVFP4A16 (W4A16), ~5,3 GB | Apache-2.0 | HuggingFace, vLLM |
| Qwen/Qwen3.5-4B (original) | ~4,54 B | No disponible | BF16, ~9 GB de pesos (estimado) | Apache-2.0 | HuggingFace, referencia de calidad |
| axteam/Qwen3.5-0.8B-NVFP4A16 | ~0,9 B | No disponible | NVFP4A16 | Apache-2.0 | HuggingFace, misma receta en menor tamaño |
| qwen3.5:4b (Ollama) | ~4 B (familia) | No disponible | Formato Ollama/GGUF | Apache-2.0 | Ollama |

Frente al original en BF16, esta versión reduce el peso aproximadamente a la mitad a cambio de un 4,3 % más de perplejidad y un 8,3 % menos de acuerdo top-1. Frente al hermano de 0,8 B, ofrece mucha más capacidad a costa de más memoria. No se dispone de comparaciones de rendimiento en tareas con modelos de otros fabricantes en la información consultada.

## Limitaciones y advertencias

- Pérdida de fidelidad medible: +4,3 % de perplejidad y 91,7 % de acuerdo top-1 frente al BF16. En tareas sensibles a la precisión (aritmética, código con API exacta, extracción de campos numéricos) conviene validar con un conjunto propio antes de producción.
- Ausencia total de benchmarks de tarea publicados: no se puede afirmar su calidad en MMLU, HumanEval, GSM8K ni MMMU a partir de la información disponible.
- Calibración sesgada hacia inglés y coreano (256 muestras, corpus mixto con predominio de coreano): el comportamiento en castellano u otros idiomas no está verificado y podría degradarse más que la media.
- Idiomas soportados no documentados; no asumir cobertura multilingüe por pertenecer a la familia Qwen.
- Longitud de contexto no documentada: no planificar flujos de contexto largo sin medir el comportamiento real y el consumo de caché KV.
- Dependencia de hardware específico: NVFP4 requiere soporte de la plataforma; desplegar en GPUs no Blackwell puede fallar o perder la ventaja de rendimiento.
- El modelo es PTQ: no está pensado como base para fine-tuning adicional. Un ajuste sobre pesos FP4 no está documentado y puede degradar la calidad.
- Partes críticas en BF16 (visión, SSM, embeddings, LM head, MTP) hacen que el ahorro de memoria sea menor que el teórico de un 4x, y que el coste en activaciones no baje.
- Licencia Apache-2.0 en el derivado, con los pesos, tokenizador y plantilla originales pertenecientes al equipo Qwen: conservar avisos de copyright y atribución al redistribuir.
- Sesgos del modelo base no evaluados en esta publicación; no hay análisis de sesgo, toxicidad ni robustez.
- Inconsistencia documental en la model card (menciona AWQ en un esquema NVFP4) y cero descargas o valoraciones en el momento de la consulta: trazabilidad y mantenimiento del repo no verificables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-4B-NVFP4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Variante de 0,8 B del mismo autor: https://huggingface.co/axteam/Qwen3.5-0.8B-NVFP4A16
- Qwen3.5 4B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-4b/
- qwen3.5:4b en Ollama: https://ollama.com/library/qwen3.5:4b
- Repositorio de la serie Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
