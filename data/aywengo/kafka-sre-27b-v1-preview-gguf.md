# aywengo/kafka-sre-27b-v1-preview-GGUF

## Resumen

kafka-sre-27b-v1-preview-GGUF es la versión cuantizada en formato GGUF del modelo kafka-sre-27b-v1-preview, un ajuste fino mediante LoRA sobre Qwen/Qwen3.8-27B orientado a la operación de Apache Kafka sobre Kubernetes. Lo desarrolla el usuario aywengo y cubre tres áreas concretas: Strimzi (el operador de Kafka para Kubernetes), operaciones y resolución de problemas de clústeres Kafka, y GitOps con Argo CD, además de patrones de streaming de datos. El modelo se distribuye con licencia Apache-2.0 y está pensado exclusivamente para inglés.

El modelo cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) y se entrenó con 6.858 ejemplos sintéticos de pregunta/respuesta generados a partir de documentación oficial fijada por versión y commit. El autor lo etiqueta explícitamente como vista previa experimental y advierte que no debe usarse de forma desatendida sobre un clúster real. La puerta de evaluación automática con juez DeepSeek falló: el modelo ajustado obtuvo 3,05 frente a 3,15 del modelo base sobre 40 preguntas reales, cuando el umbral exigía una mejora de +0,3.

A pesar de ese resultado global, el ajuste mejora en Strimzi (+1,2), configuración de Kafka (+0,8) y Argo CD (+0,4), y empeora en operaciones de Kafka (-1,8), streaming y Kubernetes. La revisión ciega del autor y de un segundo revisor LLM sobre 10 preguntas favoreció al modelo ajustado (8-1 y 5-4), principalmente porque el modelo base inventa campos de CRD, endpoints y valores por defecto. El modelo ajustado ofrece respuestas más cortas (unas 230 tokens) y más precisas, pero menos completas para tareas de troubleshooting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.8-27B), ajuste fino LoRA |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en entrenamiento; contexto de inferencia del modelo base no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles en la informacion proporcionada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 16,5 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino LoRA del modelo base Qwen/Qwen3.8-27B. El entrenamiento se realizó sobre la conversión `mlx-community/Qwen3.8-27B-bf16` (revisión `6f265714824f3c38d4452baa1628aef3d9b9aae9`) con LoRA de rango 16, escala 20 y dropout 0,05 aplicado a todas las capas, optimizador AdamW, tamaño de lote 4 y longitud máxima de secuencia 4096 (el ejemplo más largo tenía 1.140 tokens). La pérdida se calculó solo sobre la respuesta. Se ejecutó una única época sobre 6.858 ejemplos de entrenamiento (1.714 pasos), con mlx-lm 0.32.2 y mlx 0.32.4 sobre un Mac Studio con silicio de Apple. La tasa de aprendizaje fue 1e-5 con 100 pasos de calentamiento y decaimiento coseno hasta el paso 600; después, 8,06e-6 decayendo hasta 1e-7 con 20 pasos de calentamiento.

Los datos de entrenamiento son 7.201 pares sintéticos de pregunta/respuesta (6.858 de entrenamiento, 198 de validación, 145 de test) generados con DeepSeek-V4.1-Flash (licencia MIT, modo thinking desactivado) a partir de documentación fijada por versión y commit: documentación de Apache Kafka (tag 4.4.0, 1.438 ítems), referencia de configuración generada de Kafka (827 ítems), documentación de Strimzi (tag 1.3.1, 1.379 ítems), documentación de Argo CD (tag v3.6.1, 1.649 ítems) y documentación de Kubernetes, secciones concepts y tasks (CC BY 4.0, 1.908 ítems). Cada ítem fue verificado por el mismo modelo contra su extracto con reglas v2 que rechazan marcadores sin resolver, versiones de API ausentes del extracto, ajustes en el ámbito equivocado y premisas falsas aceptadas. El verificador es un filtro débil: rechazó solo entre el 1 y el 3 % de los ítems que revisó. La revisión manual de 30 ítems aleatorios dio 17 correctos, 8 débiles y 5 erróneos.

Una innovación destacable es la plantilla de chat incluida, que es no-thinking: la plantilla original de Qwen funciona en modo thinking por defecto, lo que habría entrenado al modelo para emitir `</think>`. La plantilla incluida (`chat_template.jinja`) renderiza siempre un bloque `<think>\n\n</think>\n\n` vacío y no incluye preámbulo de esfuerzo de razonamiento; el autor no recomienda usar la plantilla original con este modelo. La curva de validación (198 ítems reservados) bajó de 1,505 al inicio a 1,119 en el paso 200, 1,094 en el 400, 1,081 en el 600 y 1,053 al final. El entrenamiento sufrió un bloqueo de GPU detectado por firmware en el paso 771 y se reanudó desde el checkpoint del paso 600, reproduciendo el orden de lotes sembrado y sin restaurar el estado del optimizador.

## Capacidades

- Generación de texto conversacional en inglés sobre operación de Apache Kafka en Kubernetes.
- Redacción de recursos personalizados (CRD) de Strimzi y manifiestos GitOps para revisión humana.
- Respuesta a preguntas operativas y guía de troubleshooting como primer borrador.
- Conocimiento de configuración de Kafka, operaciones de clúster y patrones de streaming de datos.
- Conocimiento de Argo CD y flujos GitOps.
- Conocimiento de conceptos y tareas de Kubernetes.
- Modo no-thinking forzado por la plantilla incluida: respuestas directas sin preámbulo de razonamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Borrador de recursos Strimzi: el modelo puede generar manifiestos de Kafka, KafkaTopic o KafkaConnect para que un operador humano los revise antes de aplicarlos, aprovechando la mejora de +1,2 en la evaluación de Strimzi frente al modelo base.
- Consulta de configuración de Kafka: sirve para responder dudas sobre parámetros de productores, consumidores y brokers, área donde el ajuste mejora +0,8, siempre contrastando con la documentación de la versión desplegada.
- Redacción de manifiestos GitOps para Argo CD: puede proponer aplicaciones y sincronizaciones como borrador, con la ventaja de +0,4 en la evaluación de Argo CD y menor tendencia a inventar endpoints que el modelo base.
- Asistente de primera línea en troubleshooting: para preguntas operativas y guías de diagnóstico iniciales, teniendo en cuenta que el modelo es peor que el base en operaciones de Kafka (-1,8) y que sus respuestas son cortas (~230 tokens) y menos completas.
- Formación y onboarding de equipos SRE: puede explicar conceptos de Kafka, Strimzi, Kubernetes y Argo CD a partir de documentación oficial, como apoyo didáctico con revisión humana.
- Prototipado de patrones de streaming: para esbozar arquitecturas de streaming de datos, con la advertencia de que el rendimiento en streaming es inferior al del modelo base.
- Generación de documentación interna: para redactar runbooks y notas operativas que después se validan contra las fuentes oficiales.

## Benchmarks y rendimiento

Evaluación automática con juez DeepSeek sobre 40 preguntas del mundo real (la puerta exigía +0,3 de mejora):

| Área | Diferencia ajustado vs. base |
|---|---|
| Global (40 preguntas) | -0,10 (3,05 vs. 3,15) |
| Strimzi | +1,2 |
| Configuración de Kafka | +0,8 |
| Argo CD | +0,4 |
| Operaciones de Kafka | -1,8 |
| Streaming | peor que el base (valor no disponible) |
| Kubernetes | peor que el base (valor no disponible) |

Revisión ciega sobre 10 de esas preguntas: el modelo ajustado ganó 8-1 según el autor y 5-4 según un segundo revisor LLM, principalmente porque el modelo base inventa campos de CRD, endpoints y valores por defecto. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

Curva de pérdida de validación (198 ítems reservados): 1,505 al inicio, 1,119 en el paso 200, 1,094 en el 400, 1,081 en el 600, 1,066 en el 1000 y 1,053 al final.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo GGUF ocupa 16,5 GB, por lo que una cuantización de 4-5 bits de un modelo de ~27 B requiere del orden de 16-20 GB de VRAM o memoria unificada, y una de 8 bits en torno a 28-30 GB (estimación, no dato del autor).
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? Con cuantizaciones de 4 bits podría caber en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090 o RTX 4090), aunque el autor no lo confirma.
- Opciones de despliegue: formato GGUF, compatible con llama.cpp y derivados como Ollama; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, pero no se detallan integraciones concretas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| kafka-sre-27b-v1-preview-GGUF | ~26,9 B | 4096 en entrenamiento | Apache-2.0 | Ajuste LoRA especializado en Kafka/Strimzi/Argo CD; vista previa experimental |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible | no disponible en la información | Modelo generalista; supera al ajustado en operaciones de Kafka, streaming y Kubernetes, pero inventa más campos y endpoints |
| Alternativas especializadas en SRE/DevOps de tamaño similar | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Vista previa experimental: el propio autor advierte de que no debe usarse de forma desatendida sobre un clúster y que hay que verificar todas las configuraciones y comandos antes de aplicarlos.
- La puerta de evaluación automática falló: el modelo ajustado es globalmente peor que el base (3,05 vs. 3,15) y notablemente peor en operaciones de Kafka (-1,8), streaming y Kubernetes.
- Calidad de datos limitada: la revisión manual de 30 ítems dio 17 correctos, 8 débiles y 5 erróneos; el verificador automático solo rechazó entre el 1 y el 3 % de los ítems revisados.
- Riesgo de alucinación: aunque menor que el del modelo base en campos de CRD y endpoints, persisten errores como premisas falsas aceptadas, ajustes obsoletos y ámbitos incorrectos (por ejemplo, manifest-generate-paths).
- Respuestas cortas (~230 tokens): más precisas pero menos completas para tareas de troubleshooting.
- Solo inglés: no soporta castellano ni otros idiomas.
- Contexto de entrenamiento de 4096 tokens; el contexto de inferencia efectivo del modelo base no está documentado en la información disponible.
- Plantilla de chat no-thinking obligatoria; usar la plantilla original de Qwen no está recomendado y puede degradar el comportamiento.
- Licencia Apache-2.0: permite uso comercial, pero la documentación de Kubernetes usada en el entrenamiento es CC BY 4.0 y exige atribución (© The Kubernetes Authors, contenido modificado y filtrado).
- Entrenamiento interrumpido por un bloqueo de GPU y reanudado sin restaurar el estado del optimizador, lo que puede afectar a la estabilidad del ajuste.
- Hay una segunda versión con datos más limpios planificada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aywengo/kafka-sre-27b-v1-preview-GGUF
- Modelo base del ajuste: https://huggingface.co/aywengo/kafka-sre-27b-v1-preview
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Conversión usada en entrenamiento: https://huggingface.co/mlx-community/Qwen3.8-27B-bf16 (revisión 6f265714824f3c38d4452baa1628aef3d9b9aae9)
- Documentación de Apache Kafka: https://github.com/apache/kafka (tag 4.4.0)
- Documentación de Strimzi: https://github.com/strimzi/strimzi-kafka-operator (tag 1.3.1)
- Documentación de Argo CD: https://github.com/argoproj/argo-cd (tag v3.6.1)
- Documentación de Kubernetes (CC BY 4.0): https://github.com/kubernetes/website
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
