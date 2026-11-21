# Maxenith/MAX-9B

## Resumen

MAX-9B es un modelo de generación de texto publicado en Hugging Face por el usuario Maxenith bajo el identificador `Maxenith/MAX-9B`. Se distribuye en formato `safetensors` para la librería `transformers` y cuenta con 8.953.803.264 parámetros totales según los metadatos del repositorio, lo que lo sitúa en la franja de los modelos de aproximadamente 9.000 millones de parámetros. La etiqueta de arquitectura declarada es `qwen3_5_text`, lo que sugiere una base derivada de la familia Qwen 3.5 en su variante exclusivamente textual.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card es la plantilla automática de Hugging Face sin rellenar, sin licencia declarada, sin idiomas especificados y sin resultados de evaluación. El repositorio registra 0 descargas y 1 like en el momento de la consulta, y fue creado y actualizado el 21 de noviembre de 2026 con apenas 25 segundos de diferencia, lo que apunta a una publicación inicial sin iteración posterior.

En consecuencia, esta ficha documenta con rigor únicamente lo verificable a partir de los metadatos y del tamaño de los pesos (17,9 GB en el repositorio), y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier evaluaci��n de calidad, seguridad o idoneidad para producción debe considerarse pendiente hasta que exista documentación técnica o resultados reproducibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, etiqueta `qwen3_5_text` (detalles no disponibles) |
| Parámetros totales | 8.953.803.264 (≈8,95 mil millones) |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ/GPTQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 17,9 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Etiquetas | transformers, safetensors, qwen3_5_text, text-generation, conversational, endpoints_compatible, region:us |
| Fecha de creación | 2026-11-21 |
| Fecha de actualización | 2026-11-21 |

## Arquitectura y entrenamiento

La única información arquitectónica disponible es la etiqueta `qwen3_5_text`, que indica una variante textual de la familia Qwen 3.5. No se publican detalles sobre número de capas, dimensión oculta, cabezas de atención, tipo de atención (completa, lineal o híbrida), función de activación, normalización ni uso de mezcla de expertos. El recuento de 8,95 mil millones de parámetros y un repositorio de 17,9 GB son coherentes con pesos en precisión bf16/fp16 (aproximadamente 2 bytes por parámetro), sin indicios de cuantización en el checkpoint principal.

No hay información sobre el corpus de entrenamiento: ni número de tokens, ni composición del dataset, ni proporción de código, matemáticas o multilingüe. Tampoco se documenta si hubo ajuste supervisado, RLHF, DPO u otra fase de alineación, ni si se aplicaron técnicas de decodificación especulativa, destilación o poda. La model card incluye la referencia genérica a Lacoste et al. (2019) para el cálculo de emisiones de carbono, pero los campos de hardware, horas de cómputo y emisiones están sin rellenar.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` sugiere un ajuste orientado a diálogo multi-turno, aunque no se documenta el formato de prompt ni las plantillas de chat.
- Generación de texto general: pipeline `text-generation` declarado en los metadatos.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el modelo puede servirse a través de la infraestructura de Inference Endpoints de Hugging Face.
- Capacidades de razonamiento, código y matemáticas: no disponibles (no documentadas).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles; la etiqueta `qwen3_5_text` apunta a una variante exclusivamente textual, sin módulos multimodales declarados.

## Casos de uso

- Prototipado de asistentes conversacionales: al estar etiquetado como `conversational` y ser compatible con `transformers`, puede cargarse con `AutoModelForCausalLM` para experimentar con diálogo multi-turno en entornos de investigación, siempre que se defina una plantilla de chat propia al no estar documentada.
- Evaluación comparativa interna: su tamaño de ~9B permite incluirlo como línea base en pruebas A/B frente a otros modelos de la misma franja antes de comprometerse con un proveedor.
- Servicio mediante Hugging Face Inference Endpoints: la etiqueta `endpoints_compatible` facilita desplegarlo como endpoint gestionado para pruebas de integración sin montar infraestructura propia.
- Fine-tuning específico de dominio: al publicarse en safetensors y con `transformers`, es susceptible de ajuste con PEFT/LoRA sobre datos propios (por ejemplo, atención al cliente o documentación técnica), aunque la licencia no declarada obliga a aclarar los términos antes de un uso comercial.
- Investigación sobre modelos de ~9B: útil como sujeto de estudios de interpretabilidad, análisis de sesgos o medición de alucinación en modelos de tamaño medio.
- Generación de texto en pipelines offline: al no requerir APIs externas, puede integrarse en flujos por lotes (resúmenes, borradores, clasificación generativa) en máquinas con GPU de 24 GB o más.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse on-premise, encaja en escenarios donde los datos no pueden salir de la organización, sujeto a validar previamente su calidad y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-24 GB como mínimo para contextos cortos.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB para pesos, más overhead; requiere cuantización propia, ya que el autor no publica versiones cuantizadas.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB para pesos, más overhead; igualmente requiere generar la cuantización a partir del checkpoint original.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para inferencia en precisión completa sin restricciones de contexto; RTX 4090 (24 GB) para bf16 con contextos moderados; RTX 3090 (24 GB) en las mismas condiciones.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bf16 con contexto limitado; en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080) solo mediante cuantización a 8 o 4 bits.
- Opciones de despliegue: `transformers` de forma nativa; vLLM y TGI para serving de alto throughput (requieren verificar compatibilidad con la arquitectura `qwen3_5_text`); llama.cpp/Ollama solo tras convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MAX-9B | ≈8,95B | no disponible | no disponible | Hugging Face, safetensors | Model card vacía, 0 descargas |
| Qwen2.5-7B | 7,6B | 32.768 tokens (128K en variantes ampliadas) | Apache 2.0 (mayoría de variantes) | Hugging Face, GGUF, AWQ, GPTQ | Documentación completa y benchmarks publicados |
| Llama 3.1 8B | 8,0B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, GGUF, múltiples cuantizaciones | Amplio ecosistema y evaluación pública |
| Mistral 7B v0.3 | 7,2B | 32.000 tokens | Apache 2.0 | Hugging Face, GGUF, AWQ | Referencia habitual en la franja 7-8B |

La comparación es estructural: MAX-9B no publica contexto, licencia ni resultados, por lo que no puede contrastarse su rendimiento real frente a estas alternativas. La etiqueta `qwen3_5_text` sugiere parentesco con la familia Qwen, pero sin confirmación del autor ni versión concreta.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre datos de entrenamiento, alineación, evaluación ni uso previsto, lo que impide auditar sesgos o riesgos.
- Licencia no declarada: no puede asumirse uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce si el modelo está entrenado en castellano o si su rendimiento en este idioma es aceptable.
- Contexto desconocido: no puede planificarse su uso en tareas de contexto largo sin medir previamente la ventana efectiva.
- Riesgo de alucinación no cuantificado: sin benchmarks ni evaluaciones, no hay evidencia de fiabilidad factual.
- Sesgos desconocidos: al no documentarse el corpus, no pueden identificarse sesgos de género, etnia, idioma o dominio.
- Madurez del repositorio: 0 descargas, 1 like y creación/actualización en el mismo minuto indican una publicación sin validación comunitaria.
- Compatibilidad de serving no verificada: el soporte en vLLM, TGI o llama.cpp para la arquitectura `qwen3_5_text` debe comprobarse empíricamente.
- Sin cuantizaciones oficiales: cualquier GGUF, AWQ o GPTQ tendrá que generarlo el usuario, con el riesgo de degradación asociado.
- Fecha de creación futura respecto a la mayoría de checkpoints públicos: conviene verificar la procedencia y el origen de los pesos antes de confiar en ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Maxenith/MAX-9B
- Perfil del autor: https://huggingface.co/Maxenith
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
