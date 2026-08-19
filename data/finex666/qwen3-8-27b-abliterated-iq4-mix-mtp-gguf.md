# finex666/Qwen3.8-27B-Abliterated-IQ4-MIX-MTP-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de precisión mixta del modelo `windowsxp811203/Qwen3.8-27B-Abliterated`, que a su vez deriva del modelo base `Qwen/Qwen3.8-27B`. La cuantización ha sido diseñada específicamente para permitir inferencia local de alto rendimiento en una GPU con 16 GB de VRAM, preservando el cabezal MTP (Multi-Token Prediction) integrado en el modelo para decodificación especulativa en `llama.cpp`. El resultado es un archivo único de aproximadamente 13,26 GiB que no requiere un modelo borrador separado.

El modelo base es una versión "abliterated" (sin censura) del Qwen3.8-27B, lo que implica que se han eliminado las restricciones de contenido habituales. La cuantización utiliza una estrategia de precisión mixta: diferentes grupos de tensores se cuantizan con distintos niveles de precisión (IQ2_S, IQ3_S, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0) para optimizar la relación calidad-velocidad, protegiendo especialmente el bloque MTP con precisiones más altas (Q6_K y Q8_0) para mantener una buena tasa de aceptación de borradores. El modelo soporta los idiomas inglés y chino, y está licenciado bajo Apache 2.0.

La relevancia de esta ficha radica en que ofrece una solución práctica para ejecutar un modelo de 27B parámetros en hardware de consumo (GPU de 16 GB) mediante Vulkan, con rendimiento medido de ~50 tokens/s en contexto corto y ~25 tokens/s en contexto largo, gracias a la decodificación especulativa MTP. Es una opción interesante para desarrolladores que necesitan un modelo local potente sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal, atención completa y componentes SSM, con bloque MTP (Multi-Token Prediction) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el autor recomienda 64K en el comando de servidor) |
| Tipos de cuantizacion | IQ4_MIX (mezcla de IQ2_S, IQ3_S, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` presenta una arquitectura híbrida que combina atención lineal, atención completa y componentes SSM (State Space Model), según se infiere de la tabla de cuantización que distingue entre tensores de "linear-attention", "full-attention" y "SSM/body". Además, incorpora un bloque MTP (Multi-Token Prediction) en la posición 64, diseñado para la decodificación especulativa: el modelo predice varios tokens a la vez y el borrador se verifica en paralelo, acelerando la generación.

La versión abliterated elimina las capas de rechazo de contenido, permitiendo generar texto sin las restricciones habituales de seguridad. No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) del modelo base. La cuantización se realizó con `llama.cpp` build 10441, utilizando una importance matrix generada a partir del dataset `Salesforce/wikitext` (wikitext-103-raw-v1) con contexto de 2048 tokens y 10 chunks. El autor aplicó una estrategia de precisión mixta manual mediante `--tensor-type` para proteger el bloque MTP y optimizar el resto de tensores según su criticidad.

## Capacidades

- Generación de texto en inglés y chino, con razonamiento y comprensión de lenguaje natural.
- Soporte de decodificación especulativa MTP integrada en el GGUF, activable con `--spec-type draft-mtp` en `llama.cpp`, sin necesidad de modelo borrador externo.
- Compatible con el backend Vulkan de `llama.cpp`, lo que permite ejecución en GPUs AMD y otras con soporte Vulkan.
- Capacidad de procesar contextos largos (probado hasta 64K tokens asignados), aunque la velocidad de generación disminuye a medida que crece el contexto activo.
- Al ser una versión abliterated, no aplica filtros de contenido ni rechazos por temas sensibles.
- Soporte de razonamiento extendido mediante el parámetro `--reasoning on` en `llama-server`, con presupuesto configurable (`--reasoning-budget`).
- No se ha confirmado soporte de tool calling, function calling o capacidades multimodales en la información disponible.

## Casos de uso

- **Asistente local de programación**: el modelo puede ejecutarse en una GPU de 16 GB con `llama-server` y usarse como autocompletado o chat de código en entornos de desarrollo, gracias a su tamaño (27B) que ofrece buena calidad de generación y a la decodificación MTP que mantiene una velocidad aceptable (~50 tokens/s en contexto corto).
- **Chat sin censura para investigación**: al ser abliterated, es adecuado para experimentos de generación de texto libre, análisis de sesgos o estudios de comportamiento de modelos sin restricciones de contenido, siempre que se respeten las leyes aplicables.
- **Procesamiento de documentos largos**: con una ventana de contexto de hasta 64K tokens, puede resumir, extraer información o responder preguntas sobre documentos extensos (manuales, informes, código fuente) sin necesidad de dividir el texto.
- **Generación de contenido multilingüe**: soporta inglés y chino, por lo que puede utilizarse para traducción, redacción o generación de contenido en ambos idiomas, aunque no se ha evaluado su calidad en comparación con modelos especializados.
- **Despliegue en entornos sin conexión**: al ser un archivo GGUF autocontenido, puede ejecutarse en equipos sin acceso a internet, ideal para entornos corporativos con requisitos de privacidad o para desarrolladores que prefieren no depender de APIs externas.
- **Prototipado rápido de aplicaciones de IA**: su licencia Apache 2.0 y su formato GGUF permiten integrarlo fácilmente en proyectos con `llama.cpp` u Ollama, facilitando la creación de prototipos de chatbots, asistentes o herramientas de análisis de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, el autor proporciona mediciones de rendimiento de inferencia local en su hardware de prueba (AMD Radeon RX 9070 XT 16 GB, backend Vulkan, llama.cpp build 10441):

| Configuración | Tokens/s | Tasa de aceptación MTP | Contexto asignado |
|---|---|---|---|
| Contexto corto (inicio de prompt) | 50,11 | 0,7456 | 32K |
| Contexto corto (inicio de prompt) | 49,40 | 0,7714 | 64K |
| Contexto activo de 25K–30K tokens (carga agentica) | ~25 | no indicado | 64K |

Estas cifras son específicas del hardware y la carga de trabajo, no son comparables directamente con benchmarks de calidad de modelo.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF ocupa ~13,26 GiB, por lo que se necesita al menos 16 GB de VRAM para cargar el modelo completo en GPU (el autor lo probó en una RX 9070 XT de 16 GB).
- **GPU recomendadas**: AMD Radeon RX 9070 XT (probada), cualquier GPU con 16 GB o más y soporte Vulkan (p. ej., RTX 4080, RTX 4090, RTX 5070 Ti, RX 7800 XT). También puede ejecutarse en CPU con `llama.cpp`, aunque a menor velocidad.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de 16 GB, que son habituales en equipos de consumo de gama alta.
- **Opciones de despliegue**: `llama.cpp` (incluido `llama-server`), Ollama (probablemente compatible al ser GGUF), y cualquier framework que soporte GGUF. No es directamente compatible con vLLM o TGI sin conversión previa.
- **Latencia y throughput**: en el hardware probado, ~50 tokens/s con contexto corto y ~25 tokens/s con contexto largo (25K–30K tokens activos). La velocidad decae a medida que crece el contexto ocupado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos en la información proporcionada. Como referencia genérica, el modelo base Qwen3.8-27B pertenece a la familia Qwen3.8, que compite con otros modelos de ~27B parámetros como Llama-3.1-8B (menor tamaño), Mixtral-8x7B (MoE) o Qwen2.5-27B. Sin embargo, no hay cifras de benchmarks disponibles para establecer una comparación rigurosa. La principal ventaja de esta cuantización es su capacidad de ejecutarse en 16 GB VRAM con decodificación especulativa integrada, algo poco común en modelos de este tamaño.

## Limitaciones y advertencias

- **Contenido sin filtrar**: al ser abliterated, el modelo puede generar contenido ofensivo, ilegal o inapropiado. El usuario es responsable del uso que haga de él.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede inventar información, especialmente en contextos largos o temas especializados.
- **Rendimiento variable con contexto largo**: la velocidad de generación cae significativamente cuando el contexto activo supera los 25K–30K tokens (de ~50 a ~25 tokens/s en el hardware probado).
- **Idiomas limitados**: solo se garantizan inglés y chino; otros idiomas pueden tener un rendimiento inferior.
- **Sin benchmarks de calidad**: no se han publicado resultados de evaluaciones estándar, por lo que la calidad del modelo en tareas específicas no está verificada.
- **Dependencia de la versión de `llama.cpp`**: la cuantización fue construida con un commit específico (0177dcc73); versiones posteriores podrían no ser compatibles o requerir ajustes.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base es una modificación de Qwen3.8-27B (que también es Apache 2.0), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- [Repositorio HuggingFace de esta cuantización](https://huggingface.co/finex666/Qwen3.8-27B-Abliterated-IQ4-MIX-MTP-GGUF)
- [Modelo base abliterated](https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated)
- [Modelo original Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Proyecto llama.cpp](https://github.com/ggerganov/llama.cpp)
