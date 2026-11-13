# koohack/Park3-4B

## Resumen

Park3-4B es un modelo de lenguaje publicado en Hugging Face por el usuario koohack bajo el identificador `koohack/Park3-4B`. Se distribuye en formato transformers con pesos safetensors y un total de 4.022.468.096 parámetros (aproximadamente 4,02 mil millones), lo que lo sitúa en la categoría de modelos compactos de tamaño medio. El tag `qwen3` presente en los metadatos sugiere que la arquitectura deriva de la familia Qwen3, aunque el autor no lo confirma explícitamente en la model card.

La model card es la plantilla automática de Hugging Face y no contiene información sustantiva: no se documentan datos de entrenamiento, idiomas, licencia, contexto ni procedencia del modelo. El repositorio tiene 8,1 GB de tamaño, coherente con pesos en precisión de 16 bits para 4 mil millones de parámetros, y no registra descargas ni interacciones en el momento de la consulta. La fecha de creación indicada es 2026-11-13.

Por tanto, esta ficha se limita a los datos verificables de los metadatos y del recuento de parámetros. Cualquier dato sobre entrenamiento, capacidades o rendimiento debe considerarse no disponible hasta que el autor publique documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el tag `qwen3` sugiere arquitectura transformer de la familia Qwen3, sin confirmar) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá del tag `qwen3` en los metadatos de Hugging Face, que apunta a una posible base de la familia Qwen3. No se documenta si se trata de un transformer denso o de una variante con mezcla de expertos, ni el número de capas, dimensiones ocultas, cabezas de atención o mecanismos de atención lineal.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, filtrado), sobre si se aplicaron técnicas de alineación como RLHF o DPO, ni sobre métodos de decodificación especulativa u otras innovaciones. La model card no incluye sección de hiperparámetros, infraestructura de cómputo ni procedencia del checkpoint base. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation` y el tag `conversational` indica uso previsto para diálogo, aunque no se detallan capacidades concretas.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

Dado que no se documentan capacidades específicas, los casos de uso que se enumeran a continuación son escenarios genéricos para un modelo de 4 B parámetros de generación de texto, y deben validarse empíricamente antes de adoptarlos en producción.

- Generación de texto asistida en local: un modelo de 4 B parámetros puede ejecutarse en GPU de consumo con cuantización, lo que permite redactar borradores, resumir o reformular textos sin depender de servicios externos.
- Prototipado de chatbots conversacionales: el tag `conversational` sugiere uso en diálogo multi-turno, adecuado para maquetas de asistentes antes de escalar a modelos mayores.
- Fine-tuning específico de dominio: al ser un modelo compacto, sirve como base para ajuste supervisado en tareas acotadas (clasificación de tickets, extracción de entidades) con requisitos de cómputo moderados.
- Evaluación comparativa de checkpoints: útil como referencia de 4 B parámetros en experimentos de ablación o en la comparación de técnicas de cuantización.
- Despliegue en entornos con recursos limitados: el tamaño de 8,1 GB en safetensors permite cargarlo en una sola GPU de 16-24 GB en fp16, o en menos VRAM con cuantización de 8 o 4 bits.
- Generación de datos sintéticos a pequeña escala: puede emplearse para producir pares pregunta-respuesta o textos de aumento de datos en pipelines internos, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 8-9 GB solo para pesos, más overhead de activaciones y caché KV; presupuesto práctico de 10-12 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4-5 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,5-3 GB de pesos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en fp16 con lotes grandes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en fp16 con lotes pequeños.
- GPU de consumo: cabe en RTX 4080 (16 GB) y RTX 4070 Ti (12 GB) en fp16 con contexto moderado; en GPUs de 8 GB requiere cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles (tag `endpoints_compatible`). No se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a parámetros y disponibilidad. Las alternativas indicadas son referencias de la categoría de 4 B parámetros; sus cifras de contexto y licencia corresponden a sus fichas públicas habituales y deben verificarse en cada repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Park3-4B | 4,02 B | No disponible | No disponible | safetensors |
| Qwen3-4B (referencia de familia) | ~4 B | No disponible en esta ficha | No disponible en esta ficha | safetensors |
| Llama 3.2 3B | ~3,2 B | 128 K (según ficha oficial) | Llama 3.2 Community License | safetensors, GGUF |
| Phi-3.5-mini | ~3,8 B | 128 K (según ficha oficial) | MIT | safetensors, GGUF |

No se dispone de resultados de benchmarks de Park3-4B para comparar rendimiento con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática, sin información sobre entrenamiento, datos, sesgos o evaluación.
- Licencia no declarada: no puede asumirse uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación: no evaluado; al no haber benchmarks ni evaluación de seguridad, el comportamiento en dominios factuales es desconocido.
- Idiomas no declarados: no se puede garantizar cobertura multilingüe ni la calidad en castellano.
- Contexto desconocido: no se puede planificar el uso en tareas de contexto largo sin medir empíricamente la ventana efectiva.
- Procedencia incierta: el tag `qwen3` sugiere una base Qwen3, pero el autor no lo confirma; conviene verificar la licencia heredada de la base antes de su uso.
- Sin adopción verificable: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de revisión por la comunidad.
- Fecha de creación futura (2026-11-13): conviene confirmar la integridad y el origen del repositorio antes de descargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/koohack/Park3-4B
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono ML: https://mlco2.github.io/impact#compute
