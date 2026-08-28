# patronus-studio/wolf-defender-prompt-injection-small

## Resumen

Wolf Defender Prompt-Injection Detector Small es un clasificador bilingüe (alemán e inglés) basado en ModernBERT, diseñado para detectar inyecciones de prompts y ataques de jailbreak antes de que contenido no confiable llegue a un modelo de lenguaje. Desarrollado por Patronus Studio, forma parte de la suite de seguridad Patronus Protect y se distribuye bajo licencia Apache-2.0. El modelo cuenta con 140,6 millones de parámetros, una ventana de contexto de 2.048 tokens y está optimizado para despliegues locales y en el edge, donde el tamaño y la latencia son críticos.

La versión Small v2 se entrenó desde cero sobre el checkpoint fijado `jhu-clsp/mmBERT-small` con una nueva cabeza de clasificación binaria, logrando mejoras sustanciales respecto a la v1 anterior en especificidad y F1 sobre conjuntos de validación difíciles. El modelo se ofrece tanto en formato Transformers original como en cuatro variantes ONNX (FP32, FP16, mixto INT8, e INT8 con embeddings INT4), lo que facilita su integración en entornos de producción con diferentes restricciones de memoria y latencia.

Su relevancia actual radica en la creciente necesidad de salvaguardas locales para agentes de IA, sistemas de recuperación aumentada y pipelines automatizados, donde la detección de inyecciones de prompts en tiempo real es un requisito de seguridad fundamental. Aunque no debe ser la única barrera de seguridad, ofrece una primera línea de defensa ligera y eficaz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (basado en jhu-clsp/mmBERT-small) |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | FP32, FP16, INT8 (MatMul/Gemm) + FP16 embeddings, INT8 + INT4 embeddings (bloque) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (varias precisiones) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, una evolución eficiente del transformer clásico que incorpora atención con máscara de relleno y optimizaciones de velocidad y memoria. En concreto, parte del checkpoint `jhu-clsp/mmBERT-small`, un modelo multilingüe compacto, sobre el que se añadió una cabeza de clasificación binaria entrenada específicamente para distinguir entre contenido benigno (`BENIGN`) e inyecciones de prompts (`INJECTION`).

Según la model card, la versión v2 se entrenó desde cero (no es una continuación de los pesos públicos de la v1) utilizando un dataset propio de Patronus, aunque no se detallan el número de tokens, la composición exacta del corpus ni las técnicas de alineación (como RLHF o DPO). El entrenamiento se realizó con una longitud de contexto de 2.048 tokens, y el protocolo de evaluación para documentos largos emplea ventanas de 2.048 tokens con solapamiento de 64 tokens y agregación mediante Smooth-Max normalizado. El umbral de decisión por defecto es 0,5.

## Capacidades

- Detección de inyecciones de prompts y jailbreaks en texto de entrada, clasificando secuencias como `BENIGN` o `INJECTION`.
- Procesamiento de documentos largos mediante ventanas deslizantes con solapamiento, permitiendo analizar textos mayores que la ventana de contexto del modelo.
- Soporte multilingüe limitado a alemán e inglés, con capacidad de transferencia a otros idiomas no garantizada.
- Optimizado para despliegue en el edge y en dispositivos locales gracias a sus variantes ONNX cuantizadas (especialmente INT8+INT4).
- Integrable como capa de guardrail en pipelines de agentes de IA, chatbots, sistemas RAG y flujos CI/CD.
- No realiza generación de texto ni razonamiento; es exclusivamente un clasificador de secuencias.

## Casos de uso

- Protección de agentes de IA y sistemas con tool calling: el modelo puede interceptar instrucciones maliciosas antes de que lleguen al LLM, bloqueando o poniendo en cuarentena la entrada.
- Filtrado de contenido no confiable en pipelines de recuperación (RAG): documentos, correos electrónicos o páginas web que se incorporan al contexto pueden ser analizados previamente para evitar inyecciones indirectas.
- Moderación de chatbots en producción: integración como middleware que puntúa cada mensaje del usuario y decide si se reenvía al modelo principal o se rechaza.
- Seguridad en entornos de desarrollo y CI/CD: análisis de prompts generados automáticamente en flujos de código, evitando que scripts maliciosos alteren el comportamiento de herramientas de IA.
- Despliegue en dispositivos edge o móviles: gracias a las versiones ONNX cuantizadas, el modelo puede ejecutarse en hardware con recursos limitados, ofreciendo una primera barrera de seguridad sin conexión.
- Auditoría de logs y análisis forense: revisión de conversaciones pasadas para identificar intentos de inyección o jailbreak, ayudando a mejorar las políticas de seguridad.

## Benchmarks y rendimiento

Los resultados publicados en la model card, obtenidos con el mismo protocolo (umbral 0,5, ventanas de 2.048 tokens con solapamiento de 64 y agregación Smooth-Max), son los siguientes:

| Modelo | Clean validation F1 | Clean specificity | Qualifire F1 | Jayavibhav F1 | Hard-benign specificity | Real-world-benign specificity |
|---|---:|---:|---:|---:|---:|---:|
| Wolf Defender v2 | 98,44% | 99,83% | 95,14% | 97,84% | 96,23% | 96,63% |
| **Wolf Defender Small v2** | **98,33%** | **99,76%** | **95,21%** | **97,68%** | **96,67%** | **94,38%** |
| Previous Wolf Defender | 99,70% | 99,78% | 94,17% | 96,54% | 81,57% | 66,85% |
| Previous Wolf Defender Small | 97,54% | 98,66% | 91,03% | 94,36% | 82,12% | 73,60% |
| Lunaris Guard v3 | 76,22% | 74,53% | 72,24% | 72,08% | 88,15% | 90,45% |
| Sentinel v1 | 89,01% | 95,12% | 97,62% | 71,69% | 75,62% | 80,34% |
| Sentinel v2 | 99,98% | 99,99% | 96,61% | 98,78% | 63,42% | 80,90% |

Además, sobre el test split independiente del corpus de entrenamiento (14.720 ejemplos), se reportan:

| Accuracy | Injection F1 | Precision | Recall | FPR | FNR |
|---:|---:|---:|---:|---:|---:|
| 98,76% | 98,12% | 99,08% | 97,18% | 0,45% | 2,82% |

Los tamaños de los conjuntos de evaluación son: clean validation (72.212 ejemplos), Qualifire (5.000), Jayavibhav (9.000), hard benign (2.523 benignos) y real-world benign (178 benignos). La especificidad se define como `1 - tasa de falsos positivos`.

## Requisitos de hardware

- El modelo tiene 140,6 millones de parámetros, por lo que en FP32 ocupa aproximadamente 562 MB; en FP16 se reduce a unos 281 MB, y las versiones cuantizadas INT8+INT4 pueden ocupar menos de 200 MB.
- Inferencia en CPU es viable para clasificación de cortos períodos; en GPU, cabe en tarjetas consumer como RTX 3060, RTX 4090 o superiores, incluso con contexto completo de 2.048 tokens.
- Para despliegue en el edge, las variantes ONNX (especialmente la INT8+INT4) permiten ejecución en dispositivos con menos de 1 GB de RAM disponible.
- Opciones de despliegue: Transformers (Python), ONNX Runtime, y potencialmente en motores como llama.cpp (aunque no se menciona explícitamente), así como en servidores de inferencia como vLLM o TGI si se adapta el formato.
- No se han publicado datos de latencia o throughput específicos; para una clasificación de una ventana de 2.048 tokens en GPU moderna se espera una latencia inferior a 10 ms, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

La model card incluye comparaciones con otros detectores de inyección de prompts, aunque no se proporcionan sus parámetros exactos. Se pueden establecer las siguientes comparaciones cualitativas:

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| Wolf Defender Small v2 | 140,6 M | 2.048 | Apache-2.0 | Equilibrio entre tamaño y rendimiento; alta especificidad en conjuntos difíciles |
| Wolf Defender v2 (full) | no disponible | 2.048 | Apache-2.0 | Mejor robustez general, pero mayor tamaño |
| Lunaris Guard v3 | no disponible | no disponible | no disponible | Menor F1 en clean validation y Qualifire, pero mejor especificidad en benignos reales |
| Sentinel v2 | no disponible | no disponible | no disponible | Muy alta F1 en clean validation, pero baja especificidad en hard-benign (63,42%) |

No se dispone de información sobre arquitecturas o tamaños de los modelos comparados más allá de lo mostrado en la tabla de benchmarks.

## Limitaciones y advertencias

- El modelo solo soporta alemán e inglés; su rendimiento en otros idiomas no está garantizado y puede degradarse significativamente.
- No debe utilizarse como única barrera de seguridad para acciones de alto impacto; se recomienda como capa dentro de una estrategia de defensa en profundidad.
- El umbral de decisión por defecto (0,5) puede ajustarse según el equilibrio deseado entre sensibilidad y especificidad, pero cambios drásticos pueden afectar el rendimiento en producción.
- Los resultados de benchmarks se obtuvieron con un protocolo específico de ventanas y agregación; en otros escenarios (por ejemplo, sin solapamiento o con umbrales distintos) el rendimiento puede variar.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que no es posible evaluar posibles sesgos o cobertura de ataques.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el usuario es responsable de validar su comportamiento en su caso de uso concreto.
- Para documentos muy largos, el procesamiento por ventanas puede perder información contextual entre ventanas, aunque el solapamiento de 64 tokens mitiga parcialmente este efecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-small
- Modelo completo (Wolf Defender): https://huggingface.co/patronus-studio/wolf-defender-prompt-injection
- Variante edge (cuantizada): https://huggingface.co/patronus-studio/wolf-defender-prompt-injection-small-edge
- Anuncio oficial de Patronus: https://patronus.studio/posts/today-we%E2%80%99re-releasing-our-first-security-model-wolf-defender
- Artículo sobre el modelo zoo de seguridad de Patronus: https://medium.com/@PatronusProtect/our-ai-security-model-zoo-is-now-open-source-41654d5d7dc6
