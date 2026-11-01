# jaydeepb/qwen2.5-1.5b-fineweb-run1

## Resumen

qwen2.5-1.5b-fineweb-run1 es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B de Alibaba, publicado por el usuario jaydeepb en HuggingFace. El modelo base es un transformer decoder-only de 1.540 millones de parámetros, y este derivado se ha entrenado durante una época sobre una muestra de 1 millón de secuencias de 128 tokens del conjunto de datos FineWeb de HuggingFace. No se trata de un modelo orientado a uso general en producción, sino de un artefacto experimental dentro de una línea de investigación sobre memorización en modelos de lenguaje.

Su propósito principal es servir como sujeto de estudio de la memorización extraíble: las etiquetas de memorización generadas a partir de este modelo (run1, con decodificación greedy k=50, l=50) se emplean como datos de entrenamiento para un clasificador que predice memorización. El modelo hermano, run2, entrenado sobre una muestra disjunta de 1 millón de secuencias, actúa como conjunto de evaluación con datos frescos.

Es relevante para investigadores que estudian privacidad, extracción de datos de entrenamiento y generalización durante el fine-tuning, más que para desarrolladores que busquen un modelo conversacional o de código de calidad contrastada. Usa licencia Apache 2.0 y formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero no consta en la información proporcionada) |
| Tipos de cuantizacion | no disponible (solo pesos en bfloat16/fp16 en el repositorio) |
| Idiomas soportados | no disponibles (entrenado sobre FineWeb, corpus mayoritariamente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 3,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B: un transformer decoder-only con atención agrupada (GQA, según la familia Qwen2.5), embeddings RoPE y normalización RMSNorm, aunque la model card no detalla los hiperparámetros arquitectónicos concretos. El ajuste fino se realizó sobre el modelo base Qwen/Qwen2.5-1.5B, sin modificar la arquitectura.

Los datos de entrenamiento proceden de FineWeb (HuggingFaceFW/fineweb), un corpus web a gran escala filtrado y limpiado por HuggingFace. En concreto, se usó una muestra de 1 millón de secuencias de 128 tokens, entrenando una única época con learning rate 5e-5, planificación coseno del learning rate y semilla 42. No hay indicios de RLHF ni DPO: es un fine-tuning continuado sobre texto web. La innovación relevante no está en la arquitectura sino en el diseño experimental: este modelo (run1) genera las etiquetas de memorización extraíble (k=50, l=50 con decodificación greedy) que alimentan un clasificador de predicción de memorización, mientras que run2, entrenado sobre una muestra disjunta, permite evaluar en datos no vistos.

## Capacidades

- Generación de texto conversacional heredada de Qwen2.5-1.5B, aunque degradada respecto al base por el fine-tuning sobre texto web corto (secuencias de 128 tokens).
- Completado de texto estilo web, al haber sido expuesto a una muestra de FineWeb.
- Capacidad de memorización parcial de fragmentos del conjunto de entrenamiento, que es precisamente el fenómeno bajo estudio (etiquetado con extracción greedy k=50, l=50).
- No hay evidencia de capacidades específicas de razonamiento, matemáticas o código mejoradas por este fine-tuning.
- No consta soporte de tool calling, function calling ni capacidades agénticas.
- No consta soporte de visión, audio ni thinking mode.
- Capacidades multilingües: no disponibles; el corpus FineWeb es predominantemente en inglés.

## Casos de uso

- Investigación en memorización extraíble: usar run1 como modelo entrenado del que extraer secuencias memorizadas mediante decodificación greedy y comparar con run2 como conjunto de evaluación disjunto.
- Entrenamiento de clasificadores de memorización: las etiquetas generadas con k=50, l=50 sirven como datos supervisados para predecir qué secuencias serán memorizadas antes del entrenamiento.
- Estudios de privacidad y extracción de datos: analizar qué fragmentos de FineWeb son recuperables verbatim por el modelo tras el fine-tuning.
- Benchmarking de metodologías de detección de memorización: comparar métricas de extracción sobre un modelo pequeño, rápido y barato de reentrenar.
- Experimentos de reproducibilidad en fine-tuning: hiperparámetros completamente documentados (lr 5e-5, coseno, semilla 42) facilitan replicar el entrenamiento.
- Prototipado educativo: modelo ligero (3,1 GB) adecuado para practicar pipelines de fine-tuning y evaluación en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en fp16/bf16 (tamaño del repositorio), más overhead de KV cache; con 4-6 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU de consumo moderna; por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti o superiores. No se requiere hardware de centro de datos (A100/H100) para inferencia.
- Cabe cómodamente en GPUs de consumo de 6 GB o más; también es ejecutable en CPU con librerías apropiadas, con latencia notablemente mayor.
- Opciones de despliegue: transformers (librería nativa del repositorio), text-generation-inference (etiquetado como endpoints_compatible y text-generation-inference en HuggingFace). No consta disponibilidad oficial en GGUF, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles; al ser un modelo de 1,5B parámetros, se esperan latencias bajas en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| jaydeepb/qwen2.5-1.5b-fineweb-run1 | 1.543.714.304 | no disponible (base: 32.768) | Apache 2.0 | Investigación en memorización |
| Qwen/Qwen2.5-1.5B | 1.540 M aprox. | 32.768 | Apache 2.0 (Qwen Research) / Qwen para algunos usos | Uso general |
| Qwen/Qwen2.5-1.5B-Instruct | 1.540 M aprox. | 32.768 | Apache 2.0 (Qwen Research) | Chat e instrucciones |

Nota: comparado con los modelos base e instruct de Qwen2.5-1.5B, este derivado no aporta mejoras de capacidad general; su valor está en el contexto experimental de memorización. Para aplicaciones productivas, los modelos base e instruct oficiales son alternativas más adecuadas.

## Limitaciones y advertencias

- Sesgos: hereda los sesgos del corpus web FineWeb y del preentrenamiento de Qwen2.5; no hay auditoría de sesgos publicada.
- Alucinación: riesgo típico de modelos de 1,5B parámetros, agravado por un fine-tuning breve sobre texto web sin alineación con instrucciones.
- Idioma: entrenado sobre FineWeb (inglés predominantemente); el rendimiento en castellano u otras lenguas no está verificado.
- Contexto: el fine-tuning se hizo con secuencias de 128 tokens, lo que puede degradar el manejo de contextos largos respecto al modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos de licencia del modelo base Qwen2.5-1.5B, que distingue entre licencia Apache 2.0 (Qwen Research) y Qwen para ciertos umbrales de uso.
- No es un modelo instruct: no está alineado con instrucciones ni con preferencias humanas, por lo que no es adecuado como asistente conversacional en producción.
- Proyecto experimental de un usuario individual (304 descargas, 0 likes en el momento de la ficha): sin validación comunitaria ni mantenimiento garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/qwen2.5-1.5b-fineweb-run1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Paper, blog y repositorio de código: no disponibles en la información proporcionada.
