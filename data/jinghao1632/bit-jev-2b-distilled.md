# jinghao1632/bit-jev-2b-distilled

## Resumen

bit-jev-2b-distilled es un modelo de decisión estructurada desarrollado por el usuario jinghao1632 (organización Zeaulo) a partir de Microsoft BitNet b1.58 2B. A diferencia de un modelo generativo convencional, no produce tokens de respuesta: recibe un estado compartido (`state`) y una o varias preguntas con candidatos, y un cabezal de puntero (pointer head) puntúa directamente cada opción de entrada, devolviendo selección, probabilidad o nivel ordenado. Soporta tres tipos de tarea: `choice` (elegir entre opciones), `noul` (sí/no) y `score` (gradación ordinal con valor esperado).

El modelo se construye mediante LoRA y entrenamiento del cabezal sobre el backbone BitNet, seguido de una destilación completa del alumno usando los logits de candidatos de un profesor Kev 9B, y finalmente una exportación cuantizada I2_S en formato GGUF. El resultado es un artefacto de aproximadamente 1,19 GB que puede ejecutarse en CPU nativa o en GPU vía Vulkan/CUDA con el paquete Python `bit-jev`, sin necesidad de toolchain de compilación en Windows x64 con AVX2.

Su relevancia actual reside en la combinación de pesos ternarios (BitNet b1.58) con un paradigma de salida estructurada en lugar de generación libre, orientado a tareas de enrutamiento, clasificación y decisión con latencias de milisegundos en hardware modesto. No obstante, la licencia del checkpoint no está concedida de forma abierta y el autor reconoce pendiente una autorización de Yelp sobre los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BitNet b1.58 (pesos ternarios en BitLinear) con cabezal de puntero para decisión estructurada |
| Parametros totales | 2.412.820.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | I2_S (GGUF, backbone); cabezal en float32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sin licencia de pesos abierta; el Apache-2.0 del repositorio de código no cubre el checkpoint) |
| Formato de pesos | GGUF (`backbone-i2_s.gguf`), cabezal `head.f32`, metadatos `pointer.json` |

## Arquitectura y entrenamiento

El backbone es Microsoft BitNet b1.58 2B, un transformer con pesos ternarios (-1, 0, +1) en las capas BitLinear, lo que reduce drásticamente el coste de memoria y cómputo. Sobre él se añade un cabezal de puntero que opera sobre representaciones de los candidatos presentes en la entrada y emite puntuaciones directas, sin decodificación autoregresiva de texto. El pipeline documentado es: LoRA y entrenamiento del cabezal sobre el BitNet BF16, destilación completa del alumno con los logits de candidatos de un profesor Kev 9B, y exportación a I2_S GGUF con cabezal en float32.

La configuración de entrenamiento registrada incluye 3.144 pasos, 2 épocas, precisión BF16, tasa de aprendizaje 2e-5, batch 2, acumulación de gradiente 4, temperatura de destilación 2,0 y peso 1,0. La temperatura del cabezal en inferencia es 2,35 según `pointer.json`. Los datos provienen del conjunto local `decision-v7`, de múltiples fuentes e incluyendo registros de reseñas de Yelp. No se publican pesos BF16 en safetensors, ni datos de entrenamiento, ni logs, ni reseñas originales.

## Capacidades

- Decisión estructurada tipo `choice`: selecciona entre un conjunto de opciones con instrucciones y criterios, devolviendo opción, score y probabilidad.
- Decisión binaria tipo `noul`: responde preguntas de sí/no con puntuaciones y probabilidades para ambas clases.
- Gradación ordinal tipo `score`: asigna niveles ordenados con score, valor esperado y probabilidad.
- Puntuación directa de candidatos mediante cabezal de puntero, sin generación de lenguaje natural.
- Ejecución en CPU nativa (AVX2 en Windows x64) y en GPU vía Vulkan o CUDA.
- Reutilización de modelo residente en memoria mediante `infer()`, con devolución de logits, probabilidades y latencia nativa.
- Soporte de múltiples preguntas por petición sobre un `state` compartido (aunque el runner CPU actual reprocesa el estado por pregunta).
- No soporta tool calling, function calling, agentes, visión, audio ni modos de razonamiento extendido: su salida es exclusivamente estructurada sobre los candidatos dados.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y un conjunto de equipos (facturación, logística, etc.), el modelo devuelve el equipo asignado con probabilidad asociada. El ejemplo de la model card ilustra exactamente este escenario.
- Triaje de reclamaciones: clasificación binaria (`noul`) de si una reclamación requiere revisión humana o puede resolverse automáticamente, con umbral de confianza basado en la probabilidad devuelta.
- Priorización ordinal de incidencias: uso de `score` para asignar severidad (baja, media, alta, crítica) con valor esperado, útil en colas de atención al cliente.
- Moderación o etiquetado de reseñas: selección entre categorías predefinidas (spam, ofensiva, legítima) sobre textos de opinión, aprovechando el entrenamiento con datos de Yelp.
- Encuestas y formularios estructurados: mapear respuestas libres a opciones cerradas con probabilidad, para pipelines de análisis de datos.
- Despliegue en entornos con hardware limitado: inferencia en CPU de un solo nodo con ~1,6 GB de RSS observado en EPYC 9654, adecuado para servicios de clasificación de bajo coste sin GPU.
- Sistemas de decisión con abstención: usar la probabilidad del cabezal para derivar a revisión humana cuando la confianza es baja, en lugar de aceptar la predicción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (Accuracy, Brier, NLL, ECE) en la información disponible. El autor indica explícitamente que no existen informes públicos sobre conjuntos de retención verificables. Los únicos datos publicados son de latencia y memoria en una única pregunta de desarrollo (703 tokens de entrada, 77 candidatos):

| Ruta | Tiempo medio de inferencia | Repeticiones | Memoria observada |
|---|---:|---:|---:|
| EPYC 9654, 32 núcleos / 32 hilos, I2_S | 1.954,46 ms | 6 | RSS pico 1.625,88 MiB |
| Xeon Gold 6459C, 8 hilos (histórico) | 3.127,88 ms | 3 | RSS pico 1.622,74 MiB |
| Xeon Gold 6459C, 16 hilos (histórico) | 1.972,17 ms | 3 | RSS pico 1.624,52 MiB |
| RTX 5090, FP16 (ruta PyTorch, otra máquina) | 86,56 ms | 5 | Asignación GPU pico 4.935,53 MiB |

El autor advierte que las cifras de CPU y GPU provienen de máquinas distintas, con formatos de peso y precisión diferentes, por lo que no constituyen una comparación de aceleración pura. El modelo no genera tokens, así que la métrica tokens/s no aplica.

## Requisitos de hardware

- VRAM/RAM estimada: ~1,19 GB de pesos; RSS de proceso observado de ~1,6 GB en CPU.
- GPU: la ruta Vulkan funciona con drivers que expongan `vulkan-1.dll`; la ruta CUDA requiere compilación desde fuente con CUDA Toolkit. Se ha probado una RTX 5090 con ~4,9 GB de asignación en la ruta FP16 PyTorch (no equivalente al GGUF).
- CPU: Windows x64 con AVX2 tiene runners precompilados en el wheel de PyPI; otras plataformas requieren Git, CMake 3.28+ y compilador C++17.
- Cabe en GPU de consumo: sí, por tamaño de pesos; la ruta Vulkan/CUDA no está validada en la model card para GPUs de consumo concretas más allá del caso RTX 5090 mencionado.
- Despliegue: paquete `bit-jev` (versión 0.13.13) con API Python `BitJev.from_pretrained`, CLI y demo; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: ~1,95 s por pregunta en EPYC 9654 con 32 hilos; ~3,13 s con 8 hilos en Xeon Gold 6459C; 86,56 ms en RTX 5090 (ruta distinta). El runner CPU actual procesa una secuencia causal por pregunta, por lo que las peticiones multi-pregunta repiten el coste del estado compartido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bit-jev-2b-distilled | 2,41 B | no disponible | Decisión estructurada (pointer head) | no disponible | GGUF + paquete `bit-jev` |
| microsoft/bitnet-b1.58-2B-4T | ~2 B | no disponible en la información | Generación de texto | Licencia de Microsoft (no verificada aquí) | Pesos BF16 en Hugging Face |
| Kev 9B (profesor) | 9 B | no disponible | Logits de candidatos (destilación) | no disponible | Referenciado como fuente de supervisión |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a arquitectura, tamaño y licencia.

## Limitaciones y advertencias

- No hay licencia de pesos abierta: el Apache-2.0 del repositorio de código no se aplica al checkpoint; el uso comercial queda sujeto a revisión legal.
- Dependencia de datos de Yelp sin autorización escrita confirmada (solicitud enviada, sin respuesta a 2026-09-28); los usuarios deben evaluar las condiciones de Yelp sobre pesos derivados.
- Sin métricas de calidad publicadas (Accuracy, Brier, NLL, ECE); no es posible validar su fiabilidad sin evaluación propia.
- Los resultados dependen de la redacción, el orden y la longitud de los candidatos, así como de la distribución de entrenamiento.
- El runner CPU actual reprocesa el estado compartido en peticiones con varias preguntas, lo que degrada la latencia.
- No genera texto libre: no sirve para tareas de generación, resumen o diálogo abierto.
- Riesgo de alucinación estructural: el cabezal puede asignar alta probabilidad a opciones incorrectas si la entrada se aleja de la distribución de entrenamiento; se recomienda validación en datos propios y revisión humana en decisiones críticas.
- Idiomas soportados no documentados; el material está mayoritariamente en chino e inglés.
- Los benchmarks de latencia provienen de una única pregunta de desarrollo con pocas repeticiones; no son extrapolables a otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jinghao1632/bit-jev-2b-distilled
- Repositorio de código: https://github.com/Zeaulo/bit-jev
- Paquete PyPI: https://pypi.org/project/bit-jev/
- Espejo en ModelScope: https://www.modelscope.cn/models/JingHao9616/bit-jev-2b-distilled
- Demo online: https://jinghao9616-bit-jev-demo.ms.show/
- Space bilingüe en Hugging Face: https://huggingface.co/spaces/jinghao1632/bit-jev-demo
- Guía de instalación GGUF: https://github.com/Zeaulo/bit-jev/blob/main/docs/GGUF_PACKAGE.zh-CN.md
- Datos de benchmark EPYC 9654: https://github.com/Zeaulo/bit-jev/blob/main/docs/benchmark-data/bit-jev-epyc9654-cpu32-2026-09-28.json
- Modelo base: https://huggingface.co/microsoft/bitnet-b1.58-2B-4T-bf16
