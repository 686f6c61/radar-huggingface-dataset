# scottlowry/Qwen3.5-122B-A10B-oQ3e-mtp

## Resumen

Qwen3.5-122B-A10B-oQ3e-mtp es una cuantización mixta del modelo Qwen3.5-122B-A10B, desarrollada por el usuario scottlowry y publicada en Hugging Face. Se trata de una versión optimizada para su uso con MLX, el framework de Apple para ejecutar modelos en silicio de la serie M, lo que la hace relevante para desarrolladores que quieren desplegar un modelo de gran tamaño en hardware de consumo de Apple. El modelo base es una arquitectura MoE (Mixture of Experts) de Qwen, con 125.086 millones de parámetros totales según los safetensors reales.

La cuantización se ha realizado con oQ (oMLX v0.7.4.dev1), una técnica de precisión mixta que asigna distintos niveles de bits según la importancia de cada tensor. El resultado es un checkpoint de 55,584 GiB de almacenamiento con un promedio efectivo de 3,817 bits por peso, lo que permite reducir drásticamente el espacio necesario frente a los aproximadamente 250 GB que ocuparía el modelo en BF16. El repositorio, de 234,4 GB, incluye además el cabezal MTP (Multi-Token Prediction), lo que sugiere capacidades de decodificación especulativa.

La ficha se centra en las características técnicas de esta versión cuantizada y en las implicaciones prácticas de su despliegue. No se dispone de información sobre la licencia, los idiomas soportados ni los resultados de benchmarks del modelo base en la información proporcionada, por lo que estos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con cabezal MTP y módulo de visión |
| Parametros totales | 125.086.497.008 (125,086B) |
| Parametros activos | no disponible (el nombre del modelo sugiere 10B activos, pero no se confirma en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixta: affine 3-bit grupo 64 (92,707%), affine 4-bit grupo 64 (1,931%), affine 8-bit grupo 128 (0,370%), affine 8-bit grupo 64 (4,583%), BF16 (0,408%); promedio efectivo 3,817 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería mlx) |
| Tamano del repositorio | 234,4 GB |
| Tamano del checkpoint cuantizado | 55,584 GiB (59,683 GB) |
| Desglose por componente | Lenguaje: 122,112B (53,355 GiB); Visión: 0,451B (0,841 GiB); MTP: 2,524B (1,389 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-122B-A10B es una arquitectura MoE (Mixture of Experts) de la familia Qwen, según el tag `qwen3_5_moe`. La nomenclatura "A10B" sugiere aproximadamente 10.000 millones de parámetros activos por token, aunque este dato no se confirma explícitamente en la información disponible. El checkpoint cuantizado conserva tres componentes diferenciados: el modelo de lenguaje (122,112B de parámetros lógicos), un módulo de visión (0,451B) y un cabezal MTP (2,524B) orientado a la predicción multi-token.

La cuantización oQ aplicada por scottlowry utiliza precisión mixta: la mayor parte de los pesos (92,707%) se almacenan en affine 3-bit con grupo 64, mientras que una fracción pequeña se mantiene en 4-bit, 8-bit o BF16. Esta distribución busca preservar la calidad en las capas más sensibles (probablemente embeddings, cabezales y algunas proyecciones) mientras comprime agresivamente el resto. El resultado es un promedio de 3,817 bits por peso, lo que reduce el checkpoint a 55,584 GiB. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.5 está orientado a tareas de lenguaje general, aunque no se detallan capacidades específicas en la información disponible.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0,451B de parámetros, lo que indica soporte para entrada de imágenes.
- Predicción multi-token (MTP): el cabezal MTP de 2,524B permite decodificación especulativa, lo que puede acelerar la generación al predecir varios tokens por paso.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en Mac con silicio Apple: al estar empaquetado en formato MLX y ocupar 55,584 GiB, el modelo puede ejecutarse en equipos con memoria unificada de 64 GB o superior (por ejemplo, Mac Studio M2 Ultra o M3 Ultra), lo que permite inferencia local de un MoE de 125B sin depender de GPU dedicadas.
- Prototipado de asistentes multimodales: la presencia del módulo de visión permite construir prototipos que reciban imágenes y texto, útil para investigación en entornos de desarrollo con hardware Apple.
- Investigación en cuantización: el checkpoint sirve como caso de estudio de precisión mixta oQ, permitiendo comparar la calidad de un esquema 3,817 bits/peso frente a cuantizaciones uniformes de 4 bits.
- Generación de texto con decodificación especulativa: el cabezal MTP puede aprovecharse para acelerar la inferencia en tareas de generación larga, como resumen de documentos o redacción asistida.
- Evaluación de modelos MoE en entornos de bajos recursos: investigadores sin acceso a clústeres de GPU pueden estudiar el comportamiento de un MoE de 125B en un solo equipo, gracias a la compresión del checkpoint.
- Experimentación con pipelines de agentes: aunque no se confirma soporte de tool calling, el tamaño y la arquitectura del modelo base lo hacen candidato para pruebas de razonamiento multi-paso en laboratorio, siempre que se valide su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 55,584 GiB, por lo que se necesita al menos 64 GB de memoria unificada en Apple Silicon para cargarlo con margen para el contexto y los estados intermedios.
- GPU recomendadas: al ser un formato MLX, está diseñado para Apple Silicon (series M1, M2, M3 y M4, especialmente variantes Pro, Max y Ultra). No está pensado para GPU NVIDIA o AMD en su formato actual.
- ¿Cabe en GPU de consumo? En GPUs dedicadas de consumo (por ejemplo, RTX 4090 con 24 GB) no cabe en su formato MLX. Sería necesario reconvertir a otro formato y cuantizar aún más, lo que no está soportado por este checkpoint.
- Opciones de despliegue: MLX (librería nativa), oMLX (herramienta de cuantización), y potencialmente mlx-lm para inferencia. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-oQ3e-mtp (este) | 125,086B | no disponible | oQ mixta 3,817 bits/peso | no disponible | safetensors MLX |
| Qwen/Qwen3.5-122B-A10B (base) | 122B (aprox.) | no disponible | BF16 | no disponible | safetensors |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de otros autores en la misma categoría.

## Limitaciones y advertencias

- La cuantización a 3,817 bits/peso promedio puede degradar la calidad respecto al modelo base en BF16, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- El formato MLX limita el despliegue a hardware Apple Silicon; no es portable a GPU NVIDIA, AMD o TPU sin reconversión.
- No se dispone de información sobre la licencia, lo que impide confirmar si el uso comercial está permitido. Es imprescindible consultar la licencia del modelo base Qwen/Qwen3.5-122B-A10B antes de cualquier uso en producción.
- No se han publicado datos de benchmarks ni evaluaciones de calidad para esta cuantización concreta, por lo que el impacto real de la compresión es desconocido.
- El repositorio tiene 234,4 GB, aunque el checkpoint final ocupa 55,584 GiB; es probable que el espacio adicional corresponda a archivos intermedios o duplicados, lo que puede complicar la descarga.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada, pero aplicable el comportamiento del modelo base.
- La fecha de creación (2026-07-23) y actualización (2026-11-11) indican que es un modelo reciente; la versión actual requiere re-descarga según el aviso del autor.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-122B-A10B-oQ3e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
