# bambocher/Qwen3.5-2B-heretic-oQ2e-mtp

## Resumen

Qwen3.5-2B-heretic-oQ2e-mtp es una versión "descensurada" (decensored) y cuantizada del modelo Qwen/Qwen3.5-2B, publicada por el usuario bambocher en Hugging Face. El modelo conserva la cabeza de predicción multi-token (MTP) del original y ha sido procesado con la herramienta Heretic v2.0.0 para eliminar los mecanismos de rechazo de respuestas, seguido de una cuantización mixta de precisión con oQ (oMLX v0.7.3). El checkpoint resultante ocupa 1,5 GB en disco con un promedio efectivo de 5,069 bits por peso.

El modelo tiene 2.274.069.824 parámetros totales, distribuidos en tres componentes: el modelo de lenguaje (1,882B), un módulo de visión (0,331B) y la cabeza MTP (0,061B). La cuantización es mixta: combina capas en 2, 3, 4, 5 y 8 bits con grupos de 64 y 128, además de un 14,97% de los pesos que permanecen en BF16. Está empaquetado en formato MLX, lo que lo hace ejecutable en hardware Apple Silicon mediante la librería MLX.

La relevancia de este modelo radica en dos factores: por un lado, demuestra la viabilidad de aplicar técnicas de ablación selectiva (Heretic) sobre modelos compactos de 2B parámetros para eliminar rechazos sin reentrenar; por otro, la cuantización mixta agresiva permite desplegar un modelo multimodal (texto + visión) en entornos con recursos muy limitados, como portátiles con Apple Silicon. No obstante, la información pública disponible es muy escasa: no hay benchmarks, no se especifica la licencia y la model card se limita a detalles de cuantización y parámetros de ablación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con cabeza de predicción multi-token (MTP) y módulo de visión |
| Parámetros totales | 2.274.069.824 (2,274B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixta: affine 2-bit g64, 3-bit g128, 3-bit g64, 4-bit g64, 5-bit g64, 8-bit g64 y BF16; promedio efectivo 5,069 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-2B, un transformer de 2B parámetros con capacidades multimodales (incluye un módulo de visión de 0,331B parámetros) y una cabeza MTP de 0,061B parámetros. La cabeza MTP es una innovación orientada a la decodificación especulativa: predice varios tokens futuros en paralelo para acelerar la generación. En esta versión se ha conservado intacta, lo que permite aprovechar esa capacidad si el runtime MLX la soporta.

Sobre el modelo base se aplicó Heretic v2.0.0, una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) que modifica las activaciones en capas intermedias (índices 12 a 23) para suprimir comportamientos de rechazo. Los parámetros reportados son: preserve_good_behavior_weight de 0,9189, steer_bad_behavior_weight de 0,0008, overcorrect_relative_weight de 0,9924 y neighbor_count de 14. Según la model card, esto reduce los rechazos de 97/100 en el modelo original a 0/100, con una divergencia KL de 0,1397 respecto al original. No se especifican los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF/DPO), ya que esa información pertenece al modelo base Qwen y no se reproduce en esta ficha.

La cuantización se realizó con oQ (oMLX v0.7.3), una técnica de cuantización mixta que asigna distintos niveles de precisión según la sensibilidad de cada tensor. El desglose es: 33,2% de los pesos lógicos en 2 bits (grupo 64), 23,8% en 3 bits (grupo 128), 22,4% en 3 bits (grupo 64), 2,3% en 4 bits, 3,3% en 5 bits, 0,006% en 8 bits y 15,0% en BF16. El módulo de visión conserva una proporción mayor de precisión (0,617 GiB para 0,331B parámetros), mientras que el modelo de lenguaje se almacena en 0,682 GiB para 1,882B parámetros.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-2B.
- Procesamiento de imágenes: el checkpoint incluye un módulo de visión de 0,331B parámetros, por lo que se espera soporte multimodal (texto + imagen), aunque la model card no detalla las capacidades concretas.
- Predicción multi-token (MTP): la cabeza MTP se conserva intacta, lo que permite decodificación especulativa si el runtime la implementa.
- Eliminación de rechazos: según la model card, el modelo no rechaza ninguna de las 100 peticiones de prueba (0/100 frente a 97/100 del original).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en portátiles con Apple Silicon: el checkpoint de 1,5 GB y el formato MLX permiten ejecutar un modelo multimodal de 2,27B parámetros en un Mac con 8-16 GB de memoria unificada, algo imposible con el modelo en BF16 (que ocuparía aproximadamente 4,5 GB solo en pesos).
- Investigación sobre alineación y censura: el modelo sirve como caso de estudio para analizar el efecto de la ablación ARA sobre el comportamiento de rechazo, comparando las respuestas con el Qwen3.5-2B original y midiendo la divergencia KL (0,1397 reportada).
- Prototipado rápido de aplicaciones multimodales: al incluir módulo de visión, se puede usar para experimentar con descripción de imágenes o respuesta a preguntas visuales en un entorno local sin GPU dedicada, aunque la cuantización agresiva puede degradar la calidad.
- Evaluación de técnicas de cuantización mixta: el desglose detallado de bits por componente (lenguaje, visión, MTP) permite estudiar el impacto de distintas precisiones en cada parte del modelo, útil para investigadores que trabajan en compresión de modelos.
- Generación de texto sin restricciones en entornos controlados: para investigadores que necesitan estudiar el comportamiento de modelos sin mecanismos de rechazo, en contextos de análisis de sesgos o red teaming.
- Pruebas de decodificación especulativa: la conservación de la cabeza MTP permite experimentar con técnicas de aceleración de inferencia en MLX, midiendo la ganancia de throughput frente a la decodificación autorregresiva estándar.
- Educación y demostraciones: modelo ligero para enseñar conceptos de cuantización, ablación y multimodalidad en cursos o talleres, dado su reducido tamaño y su disponibilidad en formato MLX.

## Benchmarks y rendimiento

La model card solo reporta dos métricas de comportamiento, no benchmarks estándar:

| Métrica | Este modelo | Modelo original (Qwen/Qwen3.5-2B) |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1397 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1,5 GB para los pesos en disco; en ejecución, MLX necesita memoria adicional para activaciones y caché KV, por lo que se recomienda un mínimo de 4 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4) con al menos 8 GB de memoria unificada. No es compatible con CUDA de forma nativa al estar en formato MLX.
- ¿Cabe en GPU consumer? Sí, en cualquier Mac con Apple Silicon y 8 GB o más de memoria unificada. En GPUs NVIDIA consumer no se puede ejecutar directamente sin conversión previa a otro formato (por ejemplo, GGUF), que no se proporciona en este repositorio.
- Opciones de despliegue: MLX (librería mlx), mlx-lm, y potencialmente oMLX. No se proporcionan versiones en GGUF, vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. La presencia de la cabeza MTP sugiere que se podría aplicar decodificación especulativa para mejorar el throughput, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-heretic-oQ2e-mtp (este) | 2,274B | No disponible | No disponible | MLX | Cuantización mixta 5,069 bits/peso, sin rechazos, con MTP y visión |
| Qwen/Qwen3.5-2B (original) | 2B (aprox.) | No disponible | No disponible | Safetensors (BF16) | Modelo base, 97/100 rechazos, sin cuantizar |
| Otros modelos de 2B (p. ej., Gemma 2B, Phi-2) | ~2B | No disponible | Varía | Safetensors, GGUF | No se dispone de datos comparativos específicos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría en cuanto a rendimiento en benchmarks, ya que no se han publicado resultados para este modelo.

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible, lo que impide determinar si se permite uso comercial. Es imprescindible contactar con el autor o consultar el repositorio original de Qwen para conocer las restricciones.
- El proceso de "decensurado" con Heretic elimina los rechazos, lo que significa que el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No se recomienda su uso en aplicaciones de cara al público sin salvaguardas adicionales.
- La cuantización agresiva (33,2% de los pesos en 2 bits) puede degradar la calidad de las respuestas, especialmente en tareas que requieren precisión numérica o razonamiento complejo. No se han publicado evaluaciones de calidad tras la cuantización.
- La divergencia KL de 0,1397 respecto al original indica una alteración significativa de la distribución de salida, lo que puede afectar a la coherencia y fidelidad del modelo.
- No se especifican los idiomas soportados; aunque el modelo base Qwen suele ser multilingüe, no hay confirmación para esta versión.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay versiones en GGUF, ONNX ni otros formatos para GPUs NVIDIA o AMD.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026, por lo que no hay evidencia de uso en producción ni validación por parte de la comunidad.
- No se han publicado benchmarks estándar, por lo que se desconoce el rendimiento real en tareas como MMLU, HumanEval o GSM8K.
- La model card advierte de que el modelo fue re-cuantizado el 2026-11-12 con oMLX v0.7.3; versiones anteriores deben descargarse de nuevo.

## Enlaces

- [Hugging Face: bambocher/Qwen3.5-2B-heretic-oQ2e-mtp](https://huggingface.co/bambocher/Qwen3.5-2B-heretic-oQ2e-mtp)
- [Modelo base: Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Heretic project](https://heretic-project.org)
- [oQ / oMLX (GitHub)](https://github.com/jundot/omlx)
