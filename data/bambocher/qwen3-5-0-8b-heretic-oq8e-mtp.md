# bambocher/Qwen3.5-0.8B-heretic-oQ8e-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ8e-mtp es una variante "decensored" (sin los mecanismos de rechazo de peticiones que incorpora el modelo original) del modelo Qwen3.5-0.8B de Alibaba Qwen, publicada por el usuario bambocher en Hugging Face. Sobre el checkpoint base se ha aplicado la herramienta Heretic v2.0.0, que mediante una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 1 a 19 reduce a cero la tasa de rechazos en pruebas de evaluación, a costa de una divergencia KL de 0.1412 respecto al modelo original. El resultado se ha cuantizado después con oQ (oMLX v0.7.3) en precisión mixta, con un promedio efectivo de 9.386 bits por peso, y se ha conservado intacta la cabeza de predicción multi-token (MTP).

El modelo tiene 873.438.784 parámetros reales según los safetensors, de los cuales 0.752B corresponden al modelo de lenguaje, 0.101B a un componente de visión y 0.020B a la cabeza MTP. El repositorio ocupa 2.1 GB e incluye pesos en formato MLX (safetensors), lo que lo orienta al ecosistema Apple Silicon mediante la librería mlx. Es relevante ahora porque combina tres tendencias recientes: la cuantización de precisión mixta para modelos pequeños, la decodificación especulativa con cabeza MTP y la eliminación de mecanismos de rechazo mediante edición de pesos.

La información disponible es limitada: no consta licencia, idiomas soportados, pipeline declarado ni resultados de benchmarks más allá de la métrica de rechazos y la divergencia KL. Todo dato no presente en la model card se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) con cabeza de predicción multi-token (MTP) y componente de visión |
| Parametros totales | 873.438.784 (0.873B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ de precisión mixta (oMLX v0.7.3): affine 8-bit grupo 64 (88,185% de los pesos) + BF16 (11,815%); promedio efectivo 9,386 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX), librería mlx |
| Tamano del repositorio | 2.1 GB |
| Desglose de almacenamiento | Lenguaje: 0.752B (0.800 GB); visión: 0.101B (0.201 GB); cabeza MTP: 0.020B (0.024 GB); total 1.025 GB / 0.954 GiB |
| Fecha de creacion / actualizacion | 2026-11-01 / 2026-11-12 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-0.8B original: un transformer de la familia Qwen3.5, aquí con un componente de visión de 0.101B parámetros y una cabeza de predicción multi-token (MTP) de 0.020B que el autor ha dejado intacta. La cabeza MTP permite decodificación especulativa multi-token, un mecanismo que predice varios tokens por paso para acelerar la generación. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

La modificación principal es la aplicación de Heretic v2.0.0, que realiza una ablación de rango arbitrario (ARA) sobre las capas 1 a 19 con los siguientes parámetros: `start_layer_index` 1, `end_layer_index` 19, `preserve_good_behavior_weight` 0.8199, `steer_bad_behavior_weight` 0.0001, `overcorrect_relative_weight` 1.0547 y `neighbor_count` 14. Esta técnica edita los pesos para eliminar el comportamiento de rechazo manteniendo el resto de capacidades. Posteriormente, el checkpoint se cuantizó con oQ (oMLX v0.7.3) en precisión mixta: el 88,185% de los pesos (0.770B) se almacena en affine 8-bit con grupo 64 y el 11,815% (0.103B) se mantiene en BF16, lo que da un promedio efectivo de 9.386 bits/peso. El autor indica que la versión actual se re-cuantizó el 2026-11-12 y recomienda volver a descargarla si se tenía una copia anterior.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-0.8B.
- Procesamiento de visión: el checkpoint incluye un componente visual de 0.101B parámetros, por lo que se espera soporte de entrada de imágenes (las capacidades concretas no se detallan en la información disponible).
- Decodificación especulativa multi-token mediante la cabeza MTP conservada, orientada a acelerar la inferencia.
- Comportamiento "decensored": tasa de rechazos de 0/100 frente a 97/100 del modelo original, según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y edición de pesos: el modelo permite estudiar el efecto de la ablación ARA comparando directamente con el Qwen3.5-0.8B original, usando la tasa de rechazos y la divergencia KL como métricas de referencia.
- Evaluación de cuantización de precisión mixta en Apple Silicon: sirve para medir el impacto de oQ (9.386 bits/peso efectivos) sobre la calidad frente al checkpoint en BF16, ejecutando ambos en mlx.
- Prototipado local en Mac: con 0.954 GiB de pesos, cabe holgadamente en la memoria unificada de cualquier Mac moderno, lo que permite iterar en tareas de generación de texto sin GPU dedicada.
- Pruebas de decodificación especulativa: la cabeza MTP intacta permite experimentar con generación multi-token y medir ganancias de throughput en mlx.
- Experimentos multimodales de bajo coste: el componente de visión de 0.101B posibilita probar pipelines imagen-texto en hardware de gama consumer.
- Generación de contenido sin filtros en entornos controlados: para investigación sobre comportamiento del modelo sin mecanismos de rechazo, siempre con revisión humana y dentro de marcos de uso responsable.
- Base para fine-tuning ligero: su tamaño reducido (0.873B) facilita ajustes específicos de dominio en hardware modesto.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.5-0.8B) |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0.1412 | 0 (por definición) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 0.954 GiB (1.025 GB); con overhead de ejecución en mlx, se estima un uso de memoria en torno a 1.5-2.5 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: el formato es MLX, por lo que el destino natural son los chips Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada.
- Compatibilidad con GPU consumer: no se indica soporte para CUDA ni para GPUs NVIDIA (RTX 4090, A100, H100); el formato MLX no es directamente compatible con esos entornos.
- Opciones de despliegue: librería mlx y el ecosistema oMLX; no consta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-oQ8e-mtp | 0.873B | no disponible | MLX safetensors (oQ mixto) | no disponible | Decensored con Heretic, MTP intacta, 0/100 rechazos |
| Qwen/Qwen3.5-0.8B | 0.8B (aprox.) | no disponible | safetensors (BF16) | no disponible | Modelo base original, 97/100 rechazos |
| Otras variantes decensored de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La eliminación de rechazos (0/100) implica que el modelo puede generar contenido que el original bloquearía; requiere filtrado y supervisión adicionales en cualquier despliegue.
- La divergencia KL de 0.1412 respecto al original indica una alteración medible de la distribución de salida; puede degradar capacidades no evaluadas en la model card.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo de 0.8B.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; hay que verificar la licencia del Qwen3.5-0.8B original antes de usarlo en producción.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- Formato MLX: no es portable a entornos CUDA sin conversión previa.
- El autor advierte que la versión anterior a la re-cuantización del 2026-11-12 debe volver a descargarse; conviene verificar la integridad de los pesos.
- Sin datos de benchmarks estándar, no es posible comparar su calidad general con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ8e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic (proyecto): https://heretic-project.org
- oQ / oMLX (cuantización): https://github.com/jundot/omlx
