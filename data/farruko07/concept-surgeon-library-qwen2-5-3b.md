# farruko07/concept-surgeon-library-qwen2.5-3b

## Resumen

`farruko07/concept-surgeon-library-qwen2.5-3b` no es un modelo de lenguaje en sentido estricto, sino una librería de 15 vectores de direccion (steering vectors) calibrados para el modelo base `Qwen/Qwen2.5-3B-Instruct`. Cada vector se ha obtenido como diferencia de activaciones medias (difference of mean activations) y se asocia a una capa concreta, una intensidad recomendada y un rango de uso seguro. El paquete está pensado para su consumo mediante la herramienta Concept Surgeon, que permite inyectar estos vectores durante la inferencia para modular el comportamiento estilístico y de alineamiento del modelo sin reentrenarlo.

El interés de esta librería radica en que expone de forma reproducible un conjunto de controles de comportamiento (tono, formalidad, empatía, sycophancy, presión comercial, incertidumbre expresada, rechazo excesivo, etc.) sobre un modelo pequeño y ampliamente desplegable como Qwen2.5-3B-Instruct. Esto facilita experimentos de interpretabilidad y control conductual sin necesidad de fine-tuning, así como la construcción de variantes de comportamiento para pruebas A/B o evaluación de robustez.

La información pública disponible es muy limitada: el repositorio tiene un tamaño de 0.0 GB, no declara pipeline, no especifica idiomas y no incluye resultados de benchmarks ni datos de entrenamiento más allá de la metodología de cálculo de los vectores. La licencia declarada es MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (librería de steering vectors para Qwen2.5-3B-Instruct; no es un modelo con pesos propios) |
| Parametros totales | no disponible (el modelo base Qwen2.5-3B-Instruct tiene 3B, dato no confirmado en la información proporcionada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo contiene 15 vectores de direccion; el formato exacto no se especifica en la información proporcionada) |

## Arquitectura y entrenamiento

La librería no entrena un transformer nuevo, sino que deriva vectores de dirección a partir de las activaciones internas de `Qwen/Qwen2.5-3B-Instruct`. Según la model card, cada vector se calcula como la diferencia de activaciones medias (difference of mean activations), generando un vector por capa. Posteriormente se calibra la capa óptima, la intensidad recomendada y el rango seguro para cada concepto. Se cubren 15 conceptos: Apologizing, Conciseness, Discretion, Empathy, Expressed uncertainty, Formality, Neutrality, Optimism, Over-refusal, Proactive follow-up, Sales pressure, Structured formatting, Sycophancy, Technical jargon y Urgency.

No se especifican en la información disponible el número de tokens, la composición del dataset de calibración, ni si hubo etapas de RLHF/DPO. Tampoco se detalla la innovación técnica más allá del método de diferencia de medias y la calibración por capa. El concepto `Proactive follow-up` aparece marcado con estado `warning`, lo que sugiere una calibración menos fiable que el resto.

## Capacidades

- Modulación del estilo de respuesta del modelo base Qwen2.5-3B-Instruct mediante inyección de vectores en capas concretas (10, 13, 16, 18 y 21 según el concepto).
- Control de tono y cortesía: `Apologizing`, `Empathy`, `Formality`, `Optimism`.
- Control de concisión y estructura: `Conciseness`, `Structured formatting`.
- Control de honestidad y calibración: `Expressed uncertainty`, `Neutrality`, `Sycophancy`.
- Control de comportamiento comercial y persuasión: `Sales pressure`, `Urgency`.
- Control de rechazo y seguimiento: `Over-refusal`, `Proactive follow-up` (este último con advertencia).
- Ajuste de registro técnico: `Technical jargon`.
- Cada concepto incluye intensidad recomendada y rango seguro (por ejemplo, `Empathy` en capa 21 con intensidad 1.0 y rango -0.75 a 1.0).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking propias de la librería; estas dependerían del modelo base.

## Casos de uso

- Ajuste de tono en atención al cliente: aplicar el vector `Empathy` (capa 21, intensidad 1.0) o `Apologizing` (capa 16, intensidad 0.5) para que las respuestas de un asistente suenen más comprensivas en conversaciones de soporte, sin reentrenar el modelo.
- Reducción de sycophancy en evaluación: usar `Sycophancy` (capa 16, intensidad 0.25) en sentido negativo dentro del rango seguro (-0.5 a 0.25) para estudiar cómo cambia la adhesión del modelo a las opiniones del usuario.
- Mitigación de rechazos excesivos: aplicar `Over-refusal` (capa 10, intensidad 0.5) en sentido negativo para reducir respuestas evasivas en tareas legítimas y medir el impacto en seguridad.
- Generación de respuestas concisas para interfaces de chat: combinar `Conciseness` (capa 21) y `Structured formatting` (capa 18) para producir salidas más breves y con formato predecible en asistentes embebidos.
- Investigación en interpretabilidad: comparar el efecto de un mismo concepto en distintas capas (10, 13, 16, 18, 21) para estudiar cómo se distribuye la representación de rasgos conductuales en Qwen2.5-3B-Instruct.
- Pruebas A/B de estilo en producto: generar variantes de un mismo prompt con y sin vectores de `Formality` o `Technical jargon` para evaluar preferencias de usuario sin mantener múltiples checkpoints.
- Simulación de escenarios de venta: usar `Sales pressure` (capa 16, intensidad 1.0) y `Urgency` (capa 13, intensidad 1.0) para construir agentes de prueba y evaluar la resistencia de sistemas frente a lenguaje persuasivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- La librería en sí ocupa 0.0 GB según el repositorio, por lo que el almacenamiento de los vectores es despreciable.
- El requisito real depende del modelo base `Qwen/Qwen2.5-3B-Instruct`, cuyos requisitos de VRAM no se detallan en la información proporcionada.
- No se especifican GPU recomendadas, latencia ni throughput en la documentación disponible.
- El despliegue se realiza mediante Concept Surgeon con el comando `python -m scripts.library_hub pull --repo farruko07/concept-surgeon-library-qwen2.5-3b`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada librerías comparables de steering vectors para Qwen2.5-3B-Instruct ni alternativas con parámetros, contexto o licencia verificables.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad.
- El concepto `Proactive follow-up` está marcado con estado `warning`, lo que indica una calibración menos fiable; su uso en producción debería validarse empíricamente.
- Los rangos seguros son específicos por concepto y capa; salirse de ellos puede degradar la coherencia del modelo base.
- No se especifican idiomas soportados; el comportamiento multilingüe dependerá del modelo base y no está verificado para estos vectores.
- No se detalla el dataset de calibración, por lo que se desconoce la distribución sobre la que los vectores fueron estimados y su posible falta de generalización.
- La licencia MIT aplica a la librería; el uso del modelo base Qwen2.5-3B-Instruct está sujeto a su propia licencia, no indicada en esta información.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- No hay información sobre latencia añadida por la inyección de vectores ni sobre compatibilidad con frameworks de inferencia optimizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/farruko07/concept-surgeon-library-qwen2.5-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Concept Surgeon (referencia en la model card, URL incompleta): https://github.com/
