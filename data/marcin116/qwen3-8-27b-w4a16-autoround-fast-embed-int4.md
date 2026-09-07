# Marcin116/Qwen3.8-27B-W4A16-AutoRound-fast-embed-int4

## Resumen

El modelo es una versión cuantizada y optimizada del modelo base Qwen/Qwen3.8-27B, preparada por Marcin116 para su despliegue en GPUs Ampere como la RTX 3090. Se trata de un checkpoint completo en un único repositorio que integra una cuantización W4A16 (INT4 simétrico, grupo 128) realizada con AutoRound, junto con las optimizaciones del paquete companion de syvai para el mismo modelo base. El objetivo es ofrecer inferencia multimodal de visión y lenguaje en hardware de consumo, aprovechando la decodificación especulativa mediante un modelo drafter externo (DFlash2) y la compresión de pesos en formato compressed-tensors.

Según la documentación del autor, el modelo base es un modelo denso de visión-lenguaje que entiende imágenes y vídeos, con control flexible de pensamiento y capacidad para abordar tareas multi-paso. Este checkpoint cuantizado no es una versión oficial de Qwen y se distribuye bajo licencia Apache-2.0, con la condición de conservar las atribuciones correspondientes.

Existe una discrepancia entre el nombre del modelo (27B) y la suma real de los tensores safetensors (~6,26 mil millones de parámetros). Este aspecto se detalla más abajo y debe tenerse en cuenta antes de usar el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje con atención y recurrencia GatedDeltaNet; torre de visión (sin estructura detallada en la documentación) |
| Parámetros totales | 27B (nominal según nombre del modelo); 6.260.690.960 (según suma de safetensors) |
| Longitud de contexto | No disponible; validado hasta 244.320 tokens en un rig específico |
| Tipos de cuantización | W4A16 INT4 simétrico, grupo 128; embeddings en INT8; empaquetado compressed-tensors (pack-quantized) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización post-entrenamiento del modelo base Qwen/Qwen3.8-27B, realizada con AutoRound. La cuantización utiliza pesos INT4 simétricos con tamaño de grupo 128, manteniendo las activaciones en BF16 (esquema W4A16). Los pesos se empaquetan en formato compressed-tensors, lo que permite una carga compatible con vLLM en hardware Ampere. El modelo incluye tensores adicionales para la predicción multi-token (MTP) y la cabeza LM en INT4, así como embeddings de tokens en INT8. La torre de visión se mantiene en mayor precisión.

La arquitectura del modelo base combina mecanismos de atención con proyecciones de control de recurrencia GatedDeltaNet, según se menciona en la model card. No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni procesos de RLHF o DPO para el modelo base. La optimización principal es la integración con el drafter externo DFlash2 para decodificación especulativa, que no está incrustado en este repositorio y debe descargarse por separado.

## Capacidades

- Comprensión de imágenes y vídeos, según la descripción oficial del modelo base.
- Generación de texto, código y respuestas conversacionales.
- Razonamiento multi-paso con control flexible del modo de pensamiento.
- Integración con vLLM para servir endpoints compatibles con OpenAI.
- Soporte de decodificación especulativa mediante el drafter externo DFlash2.
- Optimización para inferencia en GPU Ampere (RTX 3090) con TP=2.
- No se especifica soporte de tool calling o function calling en la documentación disponible.

## Casos de uso

- Asistente conversacional multimodal en local: el modelo puede responder preguntas sobre imágenes y vídeos en un entorno con 2x RTX 3090, sin necesidad de servicios cloud, gracias a la cuantización INT4 y al formato compressed-tensors.
- Análisis de vídeo con prompts en infraestructuras on-premise: la torre de visión permite interrogar clips de vídeo para extraer descripciones o eventos, aprovechando el control de pensamiento para resolver consultas complejas de forma iterativa.
- Servidor de inferencia compatible con OpenAI: al estar diseñado para vLLM, puede servir como endpoint interno para aplicaciones que consumen el protocolo OpenAI, con decodificación especulativa para reducir la latencia en producción.
- Autocompletado de código en editores locales: las mediciones del autor indican un throughput de 188 tokens/s en código sobre un rig con 2x RTX 3090, lo que lo hace viable para asistencia de programación en tiempo real.
- Procesamiento de documentos extensos: con un techo validado de 244.320 tokens, el modelo puede abordar manuales técnicos, logs o informes largos, aunque conviene validar la calidad con la cuantización INT4 antes de usarlo en tareas críticas.
- Investigación sobre compresión y decodificación especulativa: el checkpoint sirve como ejemplo práctico de ensamblaje entre AutoRound, compressed-tensors y DFlash2 para Ampere, permitiendo estudiar el impacto de W4A16 y de la predicción multi-token en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente mediciones de rendimiento de decodificación realizadas por el autor en un rig concreto, que se presentan a continuación con carácter anecdótico y no como especificaciones generales.

| Medida | Valor | Nota |
|---|---|---|
| Decodificación narrativa | 105,94 tokens/s | Medido en 2x RTX 3090 WSL2 con perfil DFLASH15 |
| Decodificación de código | 188,06 tokens/s | Medido en el mismo rig |
| Techo de tokens validado | 244.320 tokens | Validado en el mismo entorno |

Estas cifras son dependientes del hardware y de la configuración de vLLM, no una garantía universal de rendimiento.

## Requisitos de hardware

- Pesos del checkpoint: 15,2 GB en disco. No se indica la VRAM exacta necesaria para inferencia.
- Perfil validado por el autor: 2x RTX 3090 (24 GB cada una) en configuración TP=2, con GPU_MEMORY_UTILIZATION=0.85 en WSL2/PCIe.
- GPU recomendadas: tarjetas Ampere o superiores (RTX 3090, A100, A6000, etc.) para las que está orientada la optimización.
- Compatible con GPUs de consumo: sí, siempre que se disponga de al menos 2x RTX 3090 para el perfil validado. No se ha verificado una configuración de una sola GPU.
- Opciones de despliegue: vLLM con backport DFlash2 y soporte para Qwen3.8 y compressed-tensors. No se mencionan otras herramientas como llama.cpp u Ollama en la documentación.
- Latencia y throughput: los datos de la tabla anterior, obtenidos con el drafter externo DFlash2, son las únicas medidas disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Marcin116/Qwen3.8-27B-W4A16-AutoRound-fast-embed-int4 | 27B nominal; 6,26B según safetensors | No disponible; validado 244.320 tokens | W4A16 INT4 (grupo 128) | Apache-2.0 | Hugging Face |
| goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound | No disponible | No disponible | W4A16 INT4 | No disponible | Hugging Face |
| Qwen/Qwen3.8-27B | 27B | No disponible | Sin cuantizar | Apache-2.0 | Hugging Face |

La alternativa de goldhub es otra cuantización AutoRound del mismo modelo base, pero no se documentan optimizaciones específicas para Ampere ni mediciones de rendimiento en la información disponible. El modelo base sin cuantizar ofrece presumiblemente mayor precisión a cambio de un mayor consumo de VRAM, aunque no se dispone de datos comparativos en esta fuente.

## Limitaciones y advertencias

- Existe una discrepancia entre el nombre del modelo (27B) y la suma de los tensores safetensors (~6,26 mil millones de parámetros). Esto puede deberse a tensores externos o a un ensamblaje parcial del checkpoint, y requiere verificación antes de confiar en el modelo.
- No es un checkpoint oficial de Qwen. Es un artefacto de cuantización y optimización creado por un tercero, sin garantías de calidad ni soporte.
- La cuantización INT4 puede degradar la precisión. No se han publicado benchmarks de calidad que permitan evaluar esta pérdida en tareas como MMLU o HumanEval.
- Las optimizaciones están dirigidas a vLLM en GPUs Ampere con DFlash2. Fuera de ese entorno, la configuración puede no funcionar o ofrecer un rendimiento muy inferior.
- El drafter DFlash2 es un checkpoint separado y no está incluido en este repositorio. Sin descargarlo, la decodificación especulativa no se activará.
- Las mediciones de throughput son específicas de un único rig y no deben extrapolarse a otros sistemas.
- No se han proporcionado evaluaciones de sesgos, alucinaciones ni riesgos de seguridad en la información disponible.

## Enlaces

- https://huggingface.co/Marcin116/Qwen3.8-27B-W4A16-AutoRound-fast-embed-int4
- https://huggingface.co/Qwen/Qwen3.8-27B
- https://huggingface.co/syvai/qwen3.8-27b-3090-fast-variant
- https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16
- https://huggingface.co/goldhub/Qwen3.8-27B-INT4-W4A16-AutoRound
