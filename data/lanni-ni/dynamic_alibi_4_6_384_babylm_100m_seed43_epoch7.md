# Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch7

## Resumen

Este modelo es un transformer de lenguaje pequeño con atención ALiBi dinámica, entrenado sobre el subconjunto de 100 millones de palabras del corpus BabyLM. Fue desarrollado por Lanni-ni y publicado en HuggingFace como un checkpoint de investigación. Su arquitectura, según la nomenclatura del nombre, parece estar compuesta por 4 capas, 6 cabezas de atención y 384 dimensiones ocultas, con un total de 45.694.080 parámetros. El modelo está pensado para estudiar el comportamiento del mecanismo ALiBi dinámico en tareas de generación de texto con presupuestos de entrenamiento limitados.

La model card es una plantilla generada automáticamente y no incluye especificaciones técnicas, datos de entrenamiento ni resultados de evaluación. No se ha publicado ningún paper ni documentación asociada al modelo. El repo tiene 0 descargas y 0 likes, lo que indica que es un artefacto de investigación en etapa temprana o experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención ALiBi dinámica |
| Parámetros totales | 45.694.080 |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (sin versiones cuantizadas publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una variante dinámica de ALiBi (Attention with Linear Biases). A diferencia de ALiBi estático, que utiliza pendientes fijas precalculadas para las posiciones, esta variante aprende o ajusta dinámicamente los sesgos lineales durante el entrenamiento. Esta técnica está orientada a mejorar la extrapolación a longitudes de secuencia mayores que las vistas en entrenamiento. El tag `custom_code` en el repositorio indica que la implementación requiere código personalizado para ejecutarse, probablemente para el mecanismo de atención ALiBi dinámico.

Los detalles del entrenamiento no están documentados. El nombre `babylm_100m` sugiere que se entrenó con el corpus BabyLM de 100 millones de palabras, un benchmark para estudiar el aprendizaje del lenguaje con presupuestos de datos limitados. No se indica si se aplicaron técnicas de RLHF, DPO o cualquier tipo de alineación posterior. No se han publicado los hiperparámetros ni el régimen de entrenamiento.

## Capacidades

- Generación de texto autoregresiva basada en el mecanismo de atención ALiBi dinámico.
- Capacidades de razonamiento, generación de código o matemáticas: no documentadas y no evaluadas.
- No se ha confirmado soporte para tool calling, function calling o agentes.
- No se ha confirmado soporte multimodal (visión, audio, etc.).
- El modelo opera en el dominio del texto, pero los idiomas exactos no están especificados.

## Casos de uso

- Investigación sobre extrapolación de contexto: el modelo puede usarse para comparar la dinámica de ALiBi frente a ALiBi estático en secuencias largas.
- Evaluación de scaling laws en modelos pequeños: permite estudiar el efecto del presupuesto de entrenamiento (100M palabras) en la calidad de generación.
- Reproducibilidad en benchmarks de BabyLM: puede servir como baseline para experimentos en el BabyLM Challenge.
- Experimentación educativa: al ser un modelo de 45 millones de parámetros, puede ejecutarse en hardware modesto para enseñar conceptos de transformers.
- Análisis de sesgos y alucinaciones en modelos pequeños: al ser de tamaño reducido, es un buen candidato para estudiar patrones de error.
- Pruebas de técnicas de cuantización: el modelo es lo suficientemente pequeño para experimentar con cuantización sin grandes costes computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 183 MB en fp32 (45.694.080 parámetros × 4 bytes). En fp16/bfloat16, alrededor de 91 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (RTX 3060, T4, A10, etc.). También funciona en CPU.
- Cabe en consumer GPU: sí, incluso en tarjetas de gama baja o gráficas integradas.
- Opciones de despliegue: Transformers con PyTorch (la biblioteca indicada en el repo). No hay pesos GGUF preconvertidos, por lo que para usar llama.cpp se requiere una conversión manual.
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| dynamic_alibi_4_6_384_babylm_100m_seed43_epoch7 | 45,7M | No disponible | Transformer + ALiBi dinámico | No disponible |
| GPT-2 small | 124M | 1024 | Transformer estándar | MIT |
| Pythia-70M | 70M | 2048 | Transformer estándar con RoPE | Apache 2.0 |
| BabyBERTa | ~20-100M | 512 | Transformer con relative position | No disponible |

No se pueden establecer comparativas de rendimiento porque no hay benchmarks publicados para este modelo.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones, por lo que su calidad en tareas reales es desconocida.
- La model card es una plantilla automática sin información sobre el entrenamiento, los datos o los sesgos.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- No hay documentación sobre los idiomas soportados; si se entrenó con BabyLM, es probable que el corpus sea principalmente inglés.
- El riesgo de alucinación no ha sido evaluado y, al tratarse de un modelo pequeño, puede ser mayor que en modelos grandes.
- No se ha confirmado la longitud de contexto real, lo que limita su uso en aplicaciones que requieran ventanas largas.

## Enlaces

- HuggingFace: https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_seed43_epoch7
- Checkpoint relacionado (epoch7): https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch7
- Checkpoint relacionado (epoch9): https://huggingface.co/Lanni-ni/dynamic_alibi_4_6_384_babylm_100m_epoch9
