# kmseong/llama2_7b-chat-CB_SSFT-asft_medqa_lambda1.0_fullft_lr5e-5

## Resumen

El repositorio `kmseong/llama2_7b-chat-CB_SSFT-asft_medqa_lambda1.0_fullft_lr5e-5` contiene un ajuste fino del modelo Llama-2-7b-chat publicado por el usuario kmseong. El propio nombre del repositorio indica que el entrenamiento se ha realizado sobre el conjunto de datos MedQA, con ajuste completo de pesos (`fullft`) y una tasa de aprendizaje de 5e-5, además de un parámetro `lambda1.0` y unas siglas (`CB`, `SSFT`, `asft`) cuyo significado no se documenta en la ficha de HuggingFace. El modelo tiene 6.738.415.616 parámetros reales (unos 6,74 mil millones), coherente con Llama-2-7b, y el repositorio ocupa 13,5 GB en formato safetensors.

Se trata, por tanto, de un artefacto de investigación académica orientado a pregunta-respuesta biomédica, no de un modelo con documentación de producto. La ficha no declara licencia, idiomas, pipeline ni datos de entrenamiento, y no se ha publicado ningún resultado de evaluación. Con 20 descargas y 0 "likes", es un repositorio prácticamente sin validación por parte de la comunidad.

Su relevancia actual es limitada y muy específica: sirve como punto de partida reproducible para reproducir o comparar estrategias de ajuste en dominio médico sobre una base Llama 2, siempre que el usuario inspeccione los pesos y el código de entrenamiento por su cuenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama 2, heredada del modelo base) |
| Parámetros totales | 6.738.415.616 (≈6,74 mil millones) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Llama-2-7b-chat usa 4.096 tokens; no confirmado para este ajuste) |
| Tipos de cuantización | no se incluyen variantes cuantizadas; solo pesos en safetensors (precisión nativa, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible (el modelo base está orientado al inglés y MedQA está íntegramente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 13,5 GB |
| Descargas / likes | 20 / 0 |
| Fecha de creación (según ficha) | 2026-09-19 |

## Arquitectura y entrenamiento

Al derivar de Llama-2-7b-chat, la arquitectura subyacente es la de Llama 2: transformer decoder-only con normalización RMSNorm en pre-normalización, activación SwiGLU en la MLP, embeddings rotatorios (RoPE) para las posiciones, 32 capas, dimensión oculta de 4.096 y 32 cabezas de atención. El ajuste se ha realizado con actualización completa de parámetros (no LoRA ni adaptadores) sobre MedQA, un conjunto de preguntas de estilo USMLE con formato de elección múltiple.

No hay información publicada sobre el número de tokens de entrenamiento, la composición exacta del dataset, la mezcla de datos de retención para evitar olvido catastrófico ni si se aplicaron etapas de RLHF o DPO posteriores al ajuste supervisado. Las siglas del identificador (`CB`, `SSFT`, `asft`) sugieren alguna variante de entrenamiento con posible objetivo auxiliar o regularización controlada por `lambda`, pero su definición no está disponible. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto en inglés conversacional, heredada de Llama-2-7b-chat.
- Respuesta a preguntas de dominio biomédico en formato de elección múltiple (MedQA), presumiblemente la capacidad objetivo del ajuste.
- Diálogo multiturno básico, si el ajuste no ha degradado el comportamiento instructivo original.
- Soporte de tool calling / function calling: no disponible; no se documenta y no es una capacidad nativa de Llama-2-chat.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el modelo base y el corpus de ajuste son mayoritariamente en inglés.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): ninguna documentada.
- Razonamiento matemático o generación de código específicamente evaluados: no disponible.

## Casos de uso

- Investigación en ajuste de dominio médico: usar el repositorio como referencia reproducible de un fine-tuning completo de Llama-2-7b-chat sobre MedQA, comparando su comportamiento con el modelo base sin ajustar.
- Evaluación de olvido catastrófico: medir cuánto se degradan las capacidades generales de chat y de razonamiento tras el ajuste completo, dado que no se documenta mezcla de datos de retención.
- Benchmarking de robustez clínica: someter el modelo a preguntas de licencia médica y analizar la tasa de acierto y el tipo de errores, siempre con supervisión experta y sin uso clínico real.
- Generación de distractores para exámenes tipo test: emplear el modelo para producir opciones plausibles pero incorrectas en preguntas de medicina, con revisión humana posterior.
- Punto de partida para nuevos ajustes: continuar el entrenamiento con DPO, LoRA o instrucciones adicionales partiendo de estos pesos, en lugar de partir del Llama-2-7b-chat original.
- Extracción y normalización de terminología médica: usar el modelo como componente de un pipeline de preprocesado de textos clínicos en inglés, validando siempre las salidas.
- Estudio de sesgos en modelos médicos: analizar si las respuestas varían según la demografía implícita del enunciado, aprovechando que el ajuste está acotado a un único dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha de HuggingFace no incluye métricas de MMLU, MedQA, HumanEval, GSM8K ni de ninguna otra evaluación, y la búsqueda web realizada no ha devuelto ninguna referencia técnica al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: unos 15-16 GB (13,5 GB de pesos más aproximadamente 2 GB de caché KV con 4.096 tokens de contexto).
- VRAM estimada en int8: unos 9-10 GB.
- VRAM estimada en int4: unos 6-7 GB (requiere cuantización previa, no incluida en el repositorio).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio en producción con lotes grandes; RTX 4090 (24 GB) para fp16 en una sola tarjeta.
- Cabe en GPU de consumo: sí. RTX 4090 y RTX 3090 en fp16; RTX 4080, RTX 3080 (10-16 GB) en int8; RTX 3060 12 GB o RTX 4060 Ti 16 GB en int4.
- Opciones de despliegue: vLLM, TGI y Transformers para los safetensors nativos; llama.cpp, Ollama o LM Studio solo tras convertir los pesos a GGUF, conversión que el repositorio no incluye.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones y dependen por completo del hardware y del backend elegidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este repositorio | 6,74 B | no disponible (base: 4.096) | no disponible | Ajuste completo sobre MedQA partiendo de Llama-2-7b-chat |
| Llama-2-7b-chat | 6,74 B | 4.096 | Llama 2 Community License | Modelo base conversacional de Meta, uso comercial con restricciones |
| Meditron-7B | 6,74 B | 4.096 | Llama 2 Community License | Preentrenamiento continuado en corpus médico y guías clínicas sobre Llama-2-7b |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 | Apache 2.0 | Modelo instructivo generalista, sin especialización médica |

La comparación de rendimiento no es posible: no existen métricas publicadas de este repositorio, y las diferencias de enfoque (ajuste supervisado acotado frente a preentrenamiento continuado o modelo generalista) impiden inferir superioridad en ninguna tarea sin una evaluación propia. La ausencia de licencia declarada es, además, una desventaja objetiva frente a las tres alternativas.

## Limitaciones y advertencias

- Ausencia total de licencia: sin una licencia explícita, el uso comercial y la redistribución quedan en un limbo legal. Al derivar de Llama 2, es probable que se apliquen los términos de la Llama 2 Community License, pero esto no está confirmado en la ficha.
- Riesgo elevado de alucinación con consecuencias graves: un modelo de lenguaje aplicado a contenido médico puede generar afirmaciones incorrectas con apariencia de autoridad. No debe usarse para diagnóstico, tratamiento ni consejo clínico.
- Falta de validación por la comunidad: 20 descargas y 0 likes implican que no hay informes independientes de calidad, sesgos ni fallos.
- Entrenamiento sobre un único dataset de elección múltiple: es previsible una degradación de las capacidades generales de chat y un sobreajuste al formato de MedQA.
- Idiomas: no se declara ningún idioma soportado; el castellano no está contemplado y el rendimiento fuera del inglés es impredecible.
- Contexto limitado y no confirmado: si se mantiene en 4.096 tokens, no es adecuado para historiales clínicos largos ni documentos extensos.
- Sin datos de sesgo ni de alineación de seguridad posteriores al ajuste: se desconoce si el ajuste ha erosionado las salvaguardas del Llama-2-chat original.
- Metadatos inconsistentes: la fecha de creación indicada (2026-09-19) es anómala, lo que resta fiabilidad a la trazabilidad del repositorio.
- Repositorio sin pipeline declarado ni model card descriptiva, lo que impide conocer el preprocesado exacto de las entradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kmseong/llama2_7b-chat-CB_SSFT-asft_medqa_lambda1.0_fullft_lr5e-5
- Resultados de la búsqueda web: no se ha encontrado ninguna referencia relevante al modelo; las páginas devueltas no guardan relación con él.
- Referencia de contexto del modelo base (no enlazada desde la ficha): artículo de Llama 2, https://arxiv.org/abs/2307.09288
- Referencia de contexto del dataset (no enlazada desde la ficha): artículo de MedQA, https://arxiv.org/abs/2009.13081
