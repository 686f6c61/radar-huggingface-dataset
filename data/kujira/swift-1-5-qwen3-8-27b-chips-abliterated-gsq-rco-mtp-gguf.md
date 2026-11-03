# Kujira/Swift-1.5-Qwen3.8-27B-CHiPS-Abliterated-GSQ-RCO-MTP-GGUF

## Resumen

Swift 1.5 Qwen3.8-27B CHiPS-Abliterated GSQ-RCO MTP es una modificación no oficial del modelo Swift 1.5 Qwen3.8-27B, publicado por UkisAI sobre una base de la familia Qwen3.8. La intervención, realizada por el usuario Kujira, aplica una técnica denominada CHiPS (Causal Head-isolated Projection Steering) sobre cuatro tensores de atención del modelo original, con el objetivo de reducir el comportamiento de rechazo (refusal) ante peticiones dañinas. El resultado es un modelo "abliterated" o "decensored" que mantiene prácticamente intactas sus capacidades de razonamiento, matemáticas y uso de herramientas.

El modelo se distribuye exclusivamente en formato GGUF para llama.cpp, en dos niveles de cuantización (IQ2_XS e IQ3_S), ambos con cabeza MTP (multi-token prediction) incluida. Con 27.320.697.856 parámetros totales y un repositorio de 20,9 GB, está pensado para inferencia local en hardware de consumo o semiprofesional. La edición afecta únicamente a 4 de los 866 tensores del archivo original; el resto, incluida la cabeza MTP, es byte a byte idéntico.

La relevancia actual del modelo reside en su enfoque quirúrgico: demuestra que es posible eliminar el comportamiento de rechazo sin degradar de forma medible el rendimiento en tareas de razonamiento (GSM8K, MMLU-Pro) ni en tool calling, algo que las técnicas de abliteración tradicionales suelen comprometer. No obstante, la receta de CHiPS no está publicada y la evaluación se limita al archivo IQ2_XS, lo que introduce incertidumbre sobre la reproducibilidad y el comportamiento del archivo IQ3_S.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza MTP (multi-token prediction); base Qwen3.8 |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ2_XS-mtp (8,77 GB) e IQ3_S-mtp (12,12 GB); solo estos dos niveles |
| Idiomas soportados | no disponible (evaluado en inglés y japonés) |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamaño del repositorio | 20,9 GB |
| Tensores | 866 (4 reescritos respecto al original) |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF |
| Matriz de importancia | imatrix-swift15-v1mix.gguf (del repo original) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de la familia Qwen3.8 con 27.320.697.856 parámetros y una cabeza MTP (multi-token prediction) que se conserva intacta en los archivos GGUF. No se dispone de información sobre la composición del dataset de entrenamiento original, el número de tokens utilizados ni si hubo fases de RLHF o DPO en la construcción de la base Swift 1.5. La innovación técnica destacable no está en el entrenamiento sino en la edición posterior: CHiPS (Causal Head-isolated Projection Steering) identifica las cabezas de atención con mayor efecto causal sobre el comportamiento de rechazo y modifica únicamente sus proyecciones, dejando el resto del modelo sin tocar.

La edición concreta reescribe 4 de los 866 tensores del archivo original, que son recuantizados a sus tipos originales usando la matriz de importancia `imatrix-swift15-v1mix.gguf` del repositorio de UkisAI. Todos los demás tensores, incluida la cabeza MTP, son byte a byte idénticos al original. Los metadatos añaden claves `quantize.imatrix.*` generadas por llama-quantize. La receta exacta de CHiPS no está publicada, lo que impide reproducir la edición de forma independiente. No se incluye proyector de visión y esta capacidad no fue probada.

## Capacidades

- Generación de texto conversacional y de formato largo, con razonamiento extendido (thinking) antes de responder.
- Razonamiento matemático: 94,0% de precisión en 250 preguntas de GSM8K en la evaluación del autor.
- Razonamiento de conocimiento general: 73,7% de precisión en 300 preguntas de MMLU-Pro.
- Tool calling / function calling: 100% de llamadas correctas cuando se esperaban, 100% de nombres correctos, 100% de argumentos completos y 100% de abstención cuando no se requiere herramienta.
- Continuación tras resultado de herramienta: 100% de los casos evaluados.
- Tareas de formato largo de hasta 3.072 tokens nuevos, con menor tasa de bucles y respuestas vacías que el original.
- Multilingüismo: evaluación en inglés y japonés; no se detalla la lista completa de idiomas soportados.
- Comportamiento de rechazo reducido: las frases de rechazo ante 104 peticiones dañinas caen del 93,3% al 2,9%.
- No incluye visión (sin proyector y no evaluada).

## Casos de uso

- Asistente conversacional sin restricciones temáticas para investigación sobre alineación y seguridad: el modelo permite estudiar respuestas a peticiones que el original rechaza, con una tasa de rechazo del 2,9%, útil para analizar comportamientos y sesgos en entornos controlados.
- Evaluación de robustez de filtros y salvaguardas: al disponer de una versión "abliterated" y su original con los mismos pesos salvo 4 tensores, se puede comparar el efecto de las capas de seguridad externas sobre un mismo modelo base.
- Razonamiento matemático en local: con 94,0% en GSM8K y un consumo de 336 tokens medios por respuesta, es adecuado para resolver problemas aritméticos y algebraicos en estaciones de trabajo sin GPU de datacenter.
- Agentes con tool calling: la tasa del 100% en llamadas correctas y en continuación tras resultado permite integrarlo en pipelines de automatización que consulten APIs o bases de datos, con la advertencia de que la evaluación se hizo sobre 40 tareas.
- Generación de texto largo controlada: para redacción de documentación o informes de hasta 3.072 tokens nuevos, con una tasa de respuestas vacías del 4,2% y sin bucles de periodo largo observados.
- Despliegue en hardware de consumo: los archivos de 8,77 GB y 12,12 GB permiten ejecución en llama.cpp sobre GPUs con 12-16 GB de VRAM, lo que facilita prototipado y pruebas offline.
- Investigación sobre edición de modelos: la comparación byte a byte con el original (866 tensores, 4 reescritos) sirve como caso de estudio de técnicas de steering sobre cabezas de atención.

## Benchmarks y rendimiento

Todos los datos corresponden al archivo IQ2_XS-mtp, comparado con el IQ2_XS-mtp original, con los mismos ajustes y semillas, una ejecución por conjunto. El archivo IQ3_S-mtp no fue evaluado.

| Prueba | Original | Este modelo |
|---|---|---|
| Frases de rechazo, peticiones dañinas (104) | 93,3% | 2,9% |
| Frases de rechazo, peticiones inocuas (100) | 2% | 2% |
| Bucles (dañinas / inocuas) | 0% / 0% | 0% / 0% |
| Respuestas vacías (dañinas / inocuas) | 0% / 1% | 0% / 2% |
| Alcanzan el límite de tokens (dañinas) | 0% | 13,5% |
| Tokens medios (dañinas / inocuas) | 297 / 566 | 992 / 584 |
| Tareas largas: alcanzan límite (24) | 20,8% (5) | 12,5% (3) |
| Tareas largas: bucles de periodo corto | 4,2% (1) | 0% |
| Tareas largas: respuestas vacías | 12,5% (3) | 4,2% (1) |
| Tareas largas: tokens medios | 1.961 | 1.909 |
| Tool calling: llamada esperada / nombre / argumentos | 100% / 100% / 100% | 100% / 100% / 100% |
| Tool calling: sin llamada cuando no se requiere | 90% (9/10) | 100% |
| Tool calling: continuación tras resultado | 100% | 100% |
| GSM8K (250 preguntas): precisión | 94,8% (237) | 94,0% (235) |
| GSM8K: alcanzan límite de tokens | 0% | 0% |
| GSM8K: tokens medios | 330 | 336 |
| MMLU-Pro (300 preguntas): precisión | 73,7% (221) | 73,7% (221) |
| MMLU-Pro: alcanzan límite de tokens | 8,3% (25) | 10,7% (32) |
| MMLU-Pro: tokens medios | 1.290 | 1.320 |

Las diferencias de precisión están dentro de lo esperable por muestreo (test exacto de McNemar bilateral: p = 0,69 para GSM8K, p = 1,00 para MMLU-Pro). El autor indica que las diferencias de una o dos tareas en las tablas de tareas largas y tool calling deben leerse como "el mismo nivel", no como mejora.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9-10 GB para el archivo IQ2_XS-mtp (8,77 GB de pesos) y 12-13 GB para el IQ3_S-mtp (12,12 GB), más overhead de contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para ambos archivos con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para IQ3_S con contexto moderado; RTX 4060 Ti 16 GB o RTX 3060 12 GB para IQ2_XS.
- Cabe en GPUs de consumo: sí, ambas cuantizaciones caben en GPUs con 12 GB o más de VRAM; IQ2_XS es la opción para 12 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y cualquier frontend compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- Latencia y throughput: no disponibles; no se publican mediciones de velocidad.
- Nota: al ser un modelo de 27B con razonamiento extendido, los tiempos de generación en tareas de MMLU-Pro (1.290-1.320 tokens medios) son significativamente mayores que en GSM8K (330-336 tokens).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (IQ2_XS-mtp) | 27,32B | no disponible | 94,0% | 73,7% | swift-open-license-1.0 | GGUF |
| Swift-1.5-Qwen3.8-27B-GSQ-RCO (original) | 27,32B | no disponible | 94,8% | 73,7% | swift-open-license-1.0 | GGUF |
| Alternativas de ~27B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada; la comparativa se limita al par original/modificado, que comparten arquitectura y difieren en 4 tensores.

## Limitaciones y advertencias

- Modelo no oficial: UkisAI, Alibaba Cloud e ISTA-DASLab no lo han creado ni lo respaldan; "Swift" solo indica el origen del modelo.
- Comportamiento de rechazo reducido de forma deliberada: las respuestas a peticiones dañinas pasan del 93,3% al 2,9% de rechazo, lo que implica que el modelo puede generar contenido dañino. No debe desplegarse en producción orientada al público sin filtros externos.
- Respuestas más largas ante peticiones dañinas: 992 tokens medios frente a 297, con un 13,5% que alcanza el límite de 1.536 tokens; conviene elevar `max_tokens` si se necesitan respuestas completas.
- Razonamiento algo más largo en preguntas difíciles: 32 de 300 preguntas de MMLU-Pro alcanzan el límite de 4.096 tokens frente a 25 del original.
- Solo evaluado el archivo IQ2_XS-mtp: el IQ3_S-mtp comparte la edición pero no fue evaluado, y la recuantización puede alterar cuánto de una edición pequeña sobrevive; su comportamiento puede diferir.
- Receta de CHiPS no publicada: no es posible reproducir la edición ni auditar qué se modificó exactamente más allá de los 4 tensores.
- Sin visión: no se incluye proyector y la capacidad visual no fue probada.
- Idiomas: solo se evaluó en inglés y japonés; no hay lista oficial de idiomas soportados.
- Riesgo de alucinación: no se han publicado mediciones específicas de factualidad o alucinación; el autor solo reporta precisión en GSM8K y MMLU-Pro.
- Sesgos: no se han publicado análisis de sesgos; la reducción selectiva de rechazo puede alterar el comportamiento del modelo de formas no caracterizadas.
- Licencia: swift-open-license-1.0 con términos en `LICENSE`, `LICENSE-APACHE-2.0` y `NOTICE`; es necesario revisar las restricciones de uso comercial antes de desplegar.
- Conjuntos de evaluación no publicados: las 104 peticiones dañinas y 100 inocuas no están disponibles, lo que limita la verificación externa.
- Cada conjunto se ejecutó una sola vez: la variabilidad de muestreo no está cuantificada más allá de las pruebas estadísticas reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kujira/Swift-1.5-Qwen3.8-27B-CHiPS-Abliterated-GSQ-RCO-MTP-GGUF
- Modelo base (UkisAI): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Matriz de importancia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/imatrix-swift15-v1mix.gguf
- Paper de referencia 1: arxiv:2604.18556 (citado en los tags; título no disponible)
- Paper de referencia 2: arxiv:2605.00649 (citado en los tags; título no disponible)
- Repositorio llama.cpp: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible
