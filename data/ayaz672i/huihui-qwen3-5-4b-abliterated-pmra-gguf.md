# Ayaz672i/Huihui-Qwen3.5-4B-Abliterated-PMRA-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo Huihui-Qwen3.5-4B-abliterated, una versión sin censura (uncensored) del modelo Qwen3.5-4B de Alibaba. El modelo subyacente tiene 4.205.751.296 parámetros y emplea una arquitectura híbrida que combina capas de atención lineal gated tipo DeltaNet con capas periódicas de atención completa, un diseño pensado para abaratar la inferencia en contextos largos. La variante abliterated fue fine-tuned con TRL para eliminar el comportamiento de rechazo (refusal behavior) mientras se conservan las capacidades generales del modelo.

La cuantización aquí presentada utiliza el método PMRA (Production Mixed-Rate Allocation), desarrollado por Asystemoffields, que asigna bits de forma selectiva a los grupos de tensores bajo un presupuesto fijo de bytes. El resultado es un archivo GGUF de aproximadamente 2,01 GB que ocupa el mismo espacio que una cuantización IQ3_XS, pero con una mejor calidad de modelado: obtiene un NLL de 13,47 en Wikitext-2 validation frente al 14,07 de IQ3_XS estándar. Esto lo convierte en una opción relevante para ejecutar un modelo de 4B con censura reducida en hardware modesto, mediante llama.cpp u Ollama.

La técnica PMRA parte de una base IQ2_M y promueve selectivamente algunos grupos a cuantizaciones de mayor precisión (Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_M) sin exceder el presupuesto. El archivo es compatible con runtimes estándar de GGUF y no requiere un motor específico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: capas de atención lineal gated tipo DeltaNet intercaladas con capas de atención completa periódicas (tipo qwen3_5) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF mixto PMRA: IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_M (un solo archivo con mezcla de cuantizaciones) |
| Idiomas soportados | inglés (el modelo base es multilingüe, pero este build está calibrado y medido en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | huihui-ai/Huihui-Qwen3.5-4B-abliterated (derivado de Qwen3.5-4B de Alibaba) |
| Tamaño del archivo | 2.010.651.904 bytes (~2,01 GB) |
| Bits por peso (bpw) | 3,825 (archivo) / 3,804 (payload) |
| SHA-256 | 0d7fff15074b8146c37ce3d74adb7d377bb6c686b543840da468c1b683baeb03 |

## Arquitectura y entrenamiento

El modelo Qwen3.5-4B de Alibaba emplea una arquitectura híbrida que intercala capas de atención lineal gated (inspiradas en DeltaNet) con capas de atención completa (softmax attention) de forma periódica. Este diseño reduce el coste computacional de la inferencia en ventanas largas, manteniendo la capacidad de recuperación de la atención completa en las posiciones donde resulta necesaria. No se han publicado los detalles del corpus de preentrenamiento en la información disponible. La variante abliterated de huihui-ai se obtiene mediante un fine-tuning con TRL que elimina el comportamiento de rechazo, preservando en gran medida las capacidades subyacentes.

La cuantización GGUF de este repositorio no modifica los pesos: es una conversión al formato GGUF junto con una asignación de bits mediante PMRA. El método PMRA calibra la contribución de cada grupo de tensores a la calidad del modelo, partiendo de una base IQ2_M y promoviendo selectivamente algunos grupos a cuantizaciones de mayor precisión dentro de un presupuesto fijo de bytes. La calibración se realizó con 48 prompts del conjunto de entrenamiento de Wikitext-2-raw y la evaluación con 512 prompts del conjunto de validación. No se documenta el uso de RLHF ni DPO en este artefacto.

## Capacidades

- Generación de texto conversacional en inglés: el modelo es capaz de mantener conversaciones con un equilibrio razonable entre tamaño y calidad, como refleja su NLL en Wikitext-2 y la descripción del autor como modelo conversacional.
- Respuesta sin censura (uncensored): al estar abliterated, el modelo reduce el filtrado de seguridad y el comportamiento de rechazo, permitiendo responder a temas que normalmente serían bloqueados.
- Multilingüe de base: el modelo Qwen3.5-4B es multilingüe, aunque este build concreto fue calibrado y medido únicamente en inglés; no se aportan métricas para otros idiomas.
- Contexto largo eficiente: la arquitectura híbrida con capas DeltaNet abarata la inferencia en contextos largos, aunque la ventana exacta de contexto no se especifica en la información disponible.
- Compatibilidad con llama.cpp y Ollama: al estar en formato GGUF, se puede cargar con llama-cli, Ollama o cualquier runtime compatible con el tipo de modelo qwen3_5.
- Compresión de alta calidad con PMRA: el archivo único contiene una mezcla de cuantizaciones que mejora el NLL en comparación con una cuantización uniforme del mismo tamaño, permitiendo mayor fidelidad textual por byte.

No se han documentado capacidades específicas de tool calling, function calling, agentes ni multi-step reasoning en la información disponible.

## Casos de uso

- Asistente de chat local sin conexión: al pesar 2,01 GB, se puede ejecutar en un portátil con CPU o en una GPU modesta usando llama.cpp u Ollama. Es adecuado para aplicaciones donde no se desea enviar datos a servicios externos.
- Prototipado de modelos de rol o ficción sin filtros: gracias a su naturaleza uncensored, puede usarse para generar contenido creativo o de rol que esquiva restricciones de seguridad. Es adecuado para desarrolladores que investigan alucinaciones o comportamientos de rechazo en contextos interactivos.
- Investigación y evaluación de técnicas de cuantización: el repositorio incluye artifact_report.json y selector_result.json, que documentan la asignación de bits por tensor y los resultados de NLL. Esto permite comparar el método PMRA frente a cuantizaciones estándar como IQ3_XS o Q3_K_S en igualdad de presupuesto.
- Generación de texto en entornos con memoria limitada: la cuantización mixta logra un NLL de 13,47 con un tamaño similar al de IQ3_XS, lo que lo hace útil en sistemas embebidos, dispositivos edge o contenedores con límites de RAM.
- Análisis de comportamiento de rechazo en modelos de lenguaje: al ser una versión abliterated, puede emplearse como caso de estudio para evaluar cómo afecta la eliminación del refusal behavior a la calidad de las respuestas en dominios sensibles.
- Backend de pruebas para pipelines de generación en inglés: para tareas de resumen, extracción de información o reescritura de texto en inglés, puede servir como modelo de borrador rápido, ya que su tamaño permite inferencia rápida en CPU sin necesidad de grandes clústeres.
- Comparativa de calidad de cuantizaciones en GGUF: los datos de NLL del modelo frente a IQ3_XS y Q3_K_S permiten a investigadores comparar el impacto de la asignación de bits en un modelo real de 4B.

## Benchmarks y rendimiento

El único benchmark publicado es la perplejidad (NLL) sobre Wikitext-2-raw validation, con 512 prompts. Un NLL más bajo indica mejor modelado del lenguaje. La tabla compara la mezcla PMRA con cuantizaciones uniformes y con una asignación aleatoria de bits del mismo presupuesto. No se han publicado resultados de benchmarks como MMLU, HumanEval ni GSM8K en la información disponible.

| Variante | NLL (Wikitext-2) | Payload bpw | Payload bytes |
|---|---:|---:|---:|
| fp16 reference | 3,171504 | 16,000000 | 8.411.502.592 |
| IQ2_M | 14,179427 | 3,059981 | 1.608.689.664 |
| IQ3_XS | 14,073741 | 3,803868 | 1.999.765.504 |
| Q3_K_S | 13,977966 | 3,916374 | 2.058.911.744 |
| Q3_K_M | 13,865006 | 4,273212 | 2.246.508.544 |
| Q3_K_L | 13,911635 | 4,465188 | 2.347.433.984 |
| IQ4_XS | 13,814762 | 4,612112 | 2.424.674.304 |
| Q4_K_M | 13,877977 | 5,129255 | 2.696.546.304 |
| PMRA blend | 13,471562 | 3,803710 | 1.999.682.304 |
| same-budget random | 13,995436 | 3,802938 | 1.999.276.544 |

La mezcla PMRA mejora en 0,602179 NLL frente a IQ3_XS con 83.200 bytes menos. Frente a Q3_K_S, la mejora es de 0,506404 NLL con 59.229.440 bytes menos. Comparada con una asignación aleatoria del mismo presupuesto, la ganancia es de 0,523874 NLL, lo que demuestra que la mejora proviene de la distribución de los bits y no solo de la cantidad total.

## Requisitos de hardware

- El archivo GGUF pesa 2.010.651.904 bytes (~2,01 GB). El autor indica que puede ejecutarse en CPU sin necesidad de GPU.
- VRAM estimada: no se dispone de un valor oficial. Al menos se necesitará la memoria suficiente para alojar el archivo (2,01 GB) más la KV cache y las activaciones, que dependerán de la longitud del contexto. En la práctica, una GPU con 4 GB de VRAM debería ser suficiente para contextos moderados, pero es una estimación basada en el tamaño del archivo, no una medida proporcionada.
- GPU recomendadas: el autor no especifica modelos de GPU. Dado el tamaño, cualquier GPU moderna con al menos 4 GB de VRAM debería poder ejecutarlo, pero no existen datos de validación oficiales.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, o cualquier runtime compatible con GGUF y con soporte para el tipo de modelo qwen3_5.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los modelos comparados son todos derivados del mismo checkpoint Qwen3.5-4B, bien en formato safetensors original o en distintas cuantizaciones GGUF. El contexto no está disponible para ninguna de las variantes.

| Modelo | Parámetros | Contexto | NLL Wikitext-2 | Tamaño | Licencia |
|---|---|---|---:|---:|---|
| PMRA blend (este) | 4.205M | no disponible | 13,47 | 2,01 GB (GGUF) | Apache-2.0 |
| IQ3_XS (control) | 4.205M | no disponible | 14,07 | 2,00 GB (GGUF) | Apache-2.0 |
| Q3_K_S | 4.205M | no disponible | 13,98 | 2,06 GB (GGUF) | Apache-2.0 |
| Huihui-Qwen3.5-4B-abliterated (original) | 4.205M | no disponible | no publicado | 8,41 GB (safetensors fp16) | Apache-2.0 |

## Limitaciones y advertencias

- Modelo uncensored: el proceso de abliteration reduce sustancialmente el filtrado de seguridad y el comportamiento de rechazo. Esto implica un mayor riesgo de generar contenido ofensivo, peligroso o no deseado. En producción, se deberían añadir filtros externos si es necesario.
- Rendimiento medido solo en inglés: la calibración y la evaluación de NLL se realizaron únicamente sobre Wikitext-2 (inglés). El modelo base es multilingüe, pero este build no ha sido validado en español ni en otros idiomas; el rendimiento en esos idiomas es desconocido.
- Sin benchmarks de razonamiento ni de código: no se han publicado resultados en MMLU, HumanEval, GSM8K u otras pruebas estándar. La única métrica disponible es NLL en Wikitext-2, que mide el modelado del lenguaje, pero no habilidades de razonamiento ni de generación de código.
- Longitud de contexto no especificada: la arquitectura híbrida sugiere soporte para contextos largos, pero el número exacto de tokens de contexto no se proporciona. Se debe verificar experimentalmente el comportamiento en ventanas largas antes de usar en producción.
- Riesgo de alucinaciones: como en cualquier modelo de lenguaje generativo, puede producir texto plausible pero factualmente incorrecto. No se han publicado evaluaciones específicas de veracidad.
- Atribución y redistribución: bajo la licencia Apache-2.0 se permite el uso comercial, pero se debe preservar la atribución al modelo original de Alibaba, al fine-tuning de huihui-ai, a la cuantización de mradermacher y al método PMRA. Se recomienda revisar los enlaces de atribución en el README.
- Comunidad limitada: el repositorio tiene 0 descargas y 1 like en el momento de la consulta. Es una publicación reciente con poca validación externa; puede haber errores o incompatibilidades no detectados con versiones concretas de llama.cpp.

## Enlaces

- https://huggingface.co/Ayaz672i/Huihui-Qwen3.5-4B-Abliterated-PMRA-GGUF
- https://huggingface.co/Asystemoffields/Huihui-Qwen3.5-4B-Abliterated-PMRA-GGUF
- https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- https://huggingface.co/mradermacher/Huihui-Qwen3.5-4B-abliterated-i1-GGUF
- https://github.com/asystemoffields/PMRA
