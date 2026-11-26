# joamCriff123/zils-flash-f1125m

## Resumen

zils-flash-f1125m es un modelo de decisión publicado por el usuario joamCriff123 en Hugging Face, derivado mediante fine-tuning del modelo base Qwen/Qwen3.5-9B. Según la model card, se trata de un "d3-flash decision body" destinado al pool flash de la subred Zils 127, lo que lo sitúa como un componente especializado dentro de una infraestructura de inferencia distribuida más que como un modelo de propósito general. La información pública disponible sobre el modelo es muy escasa: la model card apenas ocupa unas pocas líneas y no detalla datos de entrenamiento, composición del dataset ni metodología de ajuste.

El modelo cuenta con 8.392.695.024 parámetros en pesos safetensors (aproximadamente 8,4 mil millones), lo que es coherente con su base Qwen3.5-9B, y ocupa un repositorio de 16,8 GB. La librería declarada es transformers y la etiqueta de arquitectura apunta a qwen3_5, con pipeline de feature-extraction y la etiqueta adicional de decision-model. La licencia es Apache-2.0, lo que facilita su uso comercial siempre que se respeten las atribuciones del modelo base indicadas en el fichero NOTICE.

Su relevancia actual es limitada y muy específica: se publicó el 25 de noviembre de 2026, no registra descargas ni interacciones, y no incluye documentación técnica sustancial. Resulta útil únicamente como referencia para quienes trabajen dentro del ecosistema Zils o quieran inspeccionar un fine-tuning de Qwen3.5-9B orientado a toma de decisiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según etiqueta del repositorio; detalles no disponibles) |
| Parámetros totales | 8.392.695.024 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta qwen3_5 y el campo base_model apuntan a que el modelo reutiliza la arquitectura del Qwen3.5-9B, un transformer denso de aproximadamente 9 mil millones de parámetros, aunque la ficha no aporta detalles sobre número de capas, dimensión oculta, mecanismo de atención ni vocabulario. El repositorio incluye código personalizado (custom_code), lo que sugiere que la implementación requiere módulos específicos más allá del transformers estándar.

No se dispone de información sobre el proceso de entrenamiento: ni el volumen de tokens, ni la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. La model card únicamente indica que se trata de un "decision body" para el pool flash de la subred Zils 127, sin especificar qué tipo de decisiones modela ni qué señales de entrenamiento se emplearon. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y procesamiento de lenguaje: heredadas presumiblemente del modelo base Qwen3.5-9B, aunque no se documentan explícitamente.
- Toma de decisiones: la etiqueta decision-model y la descripción "decision body" indican que el modelo está orientado a emitir decisiones o clasificaciones dentro de un flujo, si bien no se detalla el formato de salida.
- Extracción de características: el pipeline declarado es feature-extraction, por lo que puede emplearse para obtener representaciones vectoriales.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas aparece vacío).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Clasificación y enrutamiento dentro del pool Zils: el modelo se presenta como un "decision body" para la subred 127, por lo que su uso previsto es emitir decisiones dentro de esa infraestructura, por ejemplo para seleccionar rutas o validar respuestas.
- Extracción de embeddings para pipelines de búsqueda: al declarar el pipeline feature-extraction, puede utilizarse para generar representaciones vectoriales de textos y alimentar índices semánticos, siempre que se valide su calidad frente al modelo base.
- Evaluación comparativa de fine-tunings de Qwen3.5-9B: sirve como caso de estudio para investigadores que analicen cómo cambia el comportamiento de un modelo base tras un ajuste orientado a decisiones.
- Prototipado interno de agentes de decisión: en entornos controlados, puede integrarse como componente de decisión en flujos multi-etapa, aunque sin garantías documentadas de robustez.
- Investigación sobre modelos derivados con código personalizado: el repositorio incluye custom_code, lo que permite estudiar patrones de empaquetado y carga de modelos que requieren módulos propios.
- Base para experimentos de cuantización: al ser un transformer de ~8,4 mil millones de parámetros en safetensors, puede cuantizarse y probarse en entornos con recursos limitados, aunque el autor no publica recetas al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,8 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos, más overhead; viable en GPUs de 16 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB para pesos, más overhead; viable en GPUs consumer de 8-12 GB, aunque no se han publicado recetas oficiales de cuantización.
- GPUs recomendadas: A100 40/80 GB, H100 para despliegues de producción; RTX 4090 (24 GB) para FP16 en contexto corto; RTX 3090/4080 (16-24 GB) para cuantización de 8 bits.
- Cabe en GPU consumer: sí, especialmente con cuantización de 8 o 4 bits en RTX 3090, 4080, 4090 y tarjetas de 12 GB o más.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI como opciones habituales para transformers, y llama.cpp/Ollama solo si se generan pesos GGUF, que no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-flash-f1125m | 8,39 B | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tuning de Qwen3.5-9B para decisiones; documentación mínima |
| Qwen/Qwen3.5-9B | ~9 B (según base declarada) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva; capacidades generales |
| Alternativas de ~8-9 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe datos de entrenamiento, evaluación ni comportamiento esperado, lo que impide garantizar su calidad en producción.
- Sin benchmarks ni métricas: no hay evidencia publicada de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K u otras).
- Idiomas no declarados: se desconoce si conserva el multilingüismo del modelo base o si el fine-tuning lo ha restringido.
- Riesgo de alucinación: al no documentarse el ajuste, no puede descartarse un aumento de respuestas inventadas, especialmente en un modelo orientado a decisiones.
- Sesgos desconocidos: no se han publicado análisis de sesgo ni de seguridad.
- Código personalizado: requiere confiar en el código incluido en el repositorio (custom_code) para cargar el modelo, lo que añade superficie de riesgo en entornos de producción.
- Licencia Apache-2.0: permite uso comercial, pero obliga a conservar avisos de copyright y atribuciones del modelo base Qwen/Qwen3.5-9B según el fichero NOTICE; conviene revisar dichas atribuciones antes de redistribuir.
- Madurez: 0 descargas y 0 interacciones en el momento de la consulta; no hay evidencia de uso en producción ni comunidad que lo respalde.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-flash-f1125m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de Qwen en GitHub: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
