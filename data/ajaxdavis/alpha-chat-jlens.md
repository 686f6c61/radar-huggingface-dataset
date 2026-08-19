# ajaxdavis/alpha-chat-jlens

## Resumen

`ajaxdavis/alpha-chat-jlens` es un artefacto de interpretabilidad, no un modelo de lenguaje generativo. Se trata de un adaptador de tipo "blah-jacobian-lens v1" desarrollado por ajaxdavis, diseñado para ser consumido por la plataforma de evaluación `evals.blah.dev`. Su función es capturar y exponer las representaciones internas post-residuales de cada bloque decoder del modelo base `ajaxdavis/alpha-60m-chat`, un transformer de 60 millones de parámetros implementado en TypeScript con backend nativo Helios Vulkan.

El artefacto almacena 16 matrices densas (una por bloque decoder) junto con medias de activación fuente y objetivo, permitiendo una decodificación tipo "Logit Lens" sobre las representaciones intermedias. No es un sparse autoencoder ni un modelo de intervención causal; es un instrumento de lectura que facilita la inspección de cómo se forman las representaciones a lo largo de las capas. Su relevancia radica en que proporciona una herramienta reproducible y verificable para investigar la mecánica interna de un modelo pequeño, con licencia Apache 2.0 y un pipeline de ajuste documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador jacobian-lens sobre transformer (16 sitios post-residuales) |
| Parametros totales | no disponible (el artefacto contiene 16 matrices densas J, sin dimensiones publicadas) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (máxima secuencia usada en el ajuste) |
| Tipos de cuantizacion | float16 (artefacto), float32 (ajuste) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 0.0 GB; el artefacto se distribuye como bundle con matrices y metadatos) |

## Arquitectura y entrenamiento

El artefacto se ajusta exactamente al checkpoint `ajaxdavis/alpha-60m-chat` en la revisión inmutable `ab1c5be13a12c0feb2d5e2c9af89bd5924a0e8b0`. La arquitectura subyacente es un transformer con 16 bloques decoder, implementado de forma personalizada en TypeScript con un backend de cómputo Vulkan (Helios). El adaptador captura una representación token-alineada post-residual después de cada bloque completo, tomando como objetivo la representación final justo antes de la RMSNorm final y la proyección de embedding atada.

El ajuste se realizó sobre un corpus sintético llamado `alpha-semantic-v4-reviewed-synthetic` con 100 prompts y 8267 tokens, excluyendo las 16 posiciones iniciales de cada secuencia. El estimador utilizado es de tipo `same_position`: emplea sondas de posición Rademacher por dimensión y prompt, calculando una estimación insesgada del Jacobiano medio de misma posición mediante VJP (vector-Jacobian product) nativo. No se usa aproximación de bajo rango; la aplicación es afín: `target_mean + (h - source_mean) @ transpose(J)`. El artefacto no contiene diccionarios dispersos ni objetivos de escasez.

## Capacidades

- Inspección de representaciones internas: permite decodificar la salida de cada bloque decoder mediante Logit Lens, mostrando qué tokens predice el modelo en cada capa.
- Reproducibilidad: incluye `fit-prompts.jsonl` y `fit-report.json` para replicar exactamente el ajuste.
- Verificación de integridad: comprueba la huella del checkpoint antes de aplicar el artefacto, evitando usos sobre versiones no coincidentes.
- Ejecución remota: expone un runtime HTTP (`https://alpha.donto.org/lens-runtime`) que devuelve lecturas top-k en lugar de logits completos.
- Soporte de tokenización exacta: utiliza el tokenizador nativo y la plantilla de chat del modelo base, con un canal lateral `bytes_base64` para preservar tokens byte-BPE no UTF-8.
- No es un modelo generativo: no genera texto por sí mismo, sino que instrumenta la salida de otro modelo.

## Casos de uso

- Investigación en interpretabilidad: analizar en qué capa se codifican conceptos semánticos o sintácticos dentro de un transformer pequeño, usando las representaciones post-residuales como proxy.
- Depuración de modelos: identificar si un checkpoint concreto ha aprendido representaciones coherentes o si hay capas que producen salidas aberrantes, comparando las decodificaciones Logit Lens entre bloques.
- Verificación de alineación de representaciones: comprobar si las activaciones intermedias de un modelo siguen patrones esperados tras un fine-tuning, útil para auditorías de calidad.
- Desarrollo de técnicas de intervención: aunque el artefacto no implementa intervenciones causales, sus matrices Jacobianas pueden servir como base para diseñar experimentos de edición de representaciones.
- Evaluación de checkpoints en pipelines CI: integrar el artefacto en un flujo de evaluación automatizado que verifique la consistencia de representaciones entre revisiones del modelo base.
- Estudio de la dinámica de capas en modelos pequeños: dado que el modelo base tiene solo 60M de parámetros, es un banco de pruebas accesible para validar métodos de interpretabilidad antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K, ya que no es un modelo generativo sino un instrumento de análisis. El `validation.json` mencionado en la model card contiene medidas de convergencia, paridad y diferencias finitas, pero no se proporcionan valores concretos.

## Requisitos de hardware

- El artefacto en sí no requiere GPU: las matrices se aplican de forma afín sobre activaciones ya calculadas.
- El modelo base `alpha-60m-chat` es de 60M parámetros, por lo que cabe en cualquier GPU consumer con al menos 2 GB de VRAM en float16, o incluso en CPU.
- El runtime remoto elimina la necesidad de hardware local para la decodificación; solo se necesita acceso HTTP.
- Para reproducir el ajuste completo se requiere el backend Helios Vulkan, que necesita una GPU compatible con Vulkan (prácticamente cualquier GPU moderna).
- Opciones de despliegue: el runtime `blah-lens-http/1` es la vía principal; no se mencionan integraciones con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. Este artefacto es específico para un único checkpoint (`ajaxdavis/alpha-60m-chat`) y no tiene equivalentes directos publicados en el ecosistema. Los sparse autoencoders (SAEs) cumplen una función similar de interpretabilidad, pero difieren en metodología (diccionarios aprendidos vs. matrices Jacobianas) y no son directamente comparables sin datos de rendimiento.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para generar texto, responder preguntas ni ejecutar tareas de lenguaje natural.
- No establece claims de causalidad: la model card indica explícitamente que no demuestra workspace global, broadcast, ignition, persistencia ni necesidad causal.
- Alcance limitado del ajuste: solo 100 prompts sintéticos y 8267 tokens, lo que puede introducir sesgos en las estimaciones del Jacobiano.
- Longitud de secuencia restringida: el ajuste excluye las 16 primeras posiciones y limita a 128 tokens, por lo que las representaciones para contextos más largos no están validadas.
- Dependencia de un checkpoint exacto: el artefacto rechaza cualquier checkpoint con una huella de pesos diferente, lo que impide su uso en versiones actualizadas sin reajuste.
- Sin soporte para otros modelos: no es transferible a otros tamaños o arquitecturas.
- Ejecución remota: el runtime HTTP centralizado puede ser un punto de fallo o un riesgo de privacidad si se envían activaciones sensibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ajaxdavis/alpha-chat-jlens
- Modelo base: https://huggingface.co/ajaxdavis/alpha-60m-chat
- Runtime del lens: https://alpha.donto.org/lens-runtime
- Plataforma de evaluación: https://evals.blah.dev
