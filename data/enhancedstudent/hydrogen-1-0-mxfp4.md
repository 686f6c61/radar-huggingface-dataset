# enhancedstudent/Hydrogen-1.0-MXFP4

## Resumen

Hydrogen-1.0 es un modelo de resolución de problemas científicos y asistencia a la investigación desarrollado por Deep Principle, construido a partir de GLM-5.3 (zai-org). Está diseñado para ayudar en preguntas científicas, explicar derivaciones y organizar respuestas a problemas de investigación abiertos mediante interacción textual. La versión aquí documentada, Hydrogen-1.0-MXFP4, es la cuantización MXFP4 del modelo base, publicada por el usuario enhancedstudent y derivada de deep-principle/Hydrogen-1.0.

El modelo cuenta con 384.336.046.080 parámetros (aproximadamente 384B) según los pesos en safetensors, una longitud de contexto de 1M tokens y una longitud máxima de salida de 128K tokens. La arquitectura se etiqueta como `glm_moe_dsa`, lo que indica un transformer con mezcla de expertos (MoE) y atención dispersa (DSA), aunque el número de parámetros activos no está disponible en la información proporcionada.

La relevancia de esta ficha radica en que se trata de una cuantización de 8 bits (MXFP4) pensada para despliegue en hardware AMD Instinct, probada por el equipo en MI350X con ATOM a tensor parallel 4. El repositorio ocupa 422,8 GB y aún no registra descargas ni likes, lo que sugiere una publicación reciente (creado el 2026-11-07).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (tag `glm_moe_dsa`), basado en GLM-5.3 |
| Parametros totales | 384.336.046.080 (~384B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1M tokens (presupuesto efectivo dependiente del runtime y la configuración) |
| Tipos de cuantizacion | MXFP4 (8 bits, grupos de 32 elementos con escalas E8M0, activaciones dinámicas); atención, router, embeddings, lm_head y eh_proj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint MXFP4, etiqueta `8-bit`, herramienta `quark`) |

## Arquitectura y entrenamiento

Hydrogen-1.0 se basa en GLM-5.3 y emplea una arquitectura de mezcla de expertos (MoE) con atención dispersa, según la etiqueta `glm_moe_dsa` del repositorio. La versión MXFP4 ha sido cuantizada con AMD Quark: los MLP densos, los expertos compartidos y enrutados, y los MLP de MTP usan MXFP4 con activaciones dinámicas, mientras que la atención, el router, los embeddings, el `lm_head` y `eh_proj` permanecen en BF16. La configuración de cuantización usa grupos de 32 elementos con escalas E8M0 tanto para pesos como para activaciones.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card remite al blog técnico e indica explícitamente que los datasets y recetas completos no se publican con los pesos. Tampoco se dispone de información sobre innovaciones de decodificación (el despliegue reportado usa decodificación especulativa desactivada).

## Capacidades

- Generación de texto y conversación multi-turno orientada a ciencia e investigación.
- Razonamiento científico: explicación de derivaciones y organización de respuestas a problemas abiertos.
- Razonamiento extenso configurable mediante `reasoning_effort` (por ejemplo, `max`) en el chat template.
- Soporte de contexto largo: hasta 1M tokens de entrada y 128K de salida (sujeto a runtime y memoria).
- Integración con herramientas externas y entornos de investigación (el blog técnico muestra ejemplos de computación científica, exploración de redes de reacción, análisis estructural por RMN y planificación experimental).
- No se dispone de información sobre tool calling nativo, function calling, capacidades de agente multi-paso, visión, audio ni cobertura multilingüe explícita.

## Casos de uso

- Asistencia a derivaciones científicas: el modelo puede explicar el desarrollo de una derivación (por ejemplo, el período de un péndulo simple bajo aproximación de ángulo pequeño) y señalar cuándo deja de ser válida la aproximación, gracias a su razonamiento extenso y contexto largo.
- Análisis de estructuras por RMN: combinado con herramientas externas y entornos de investigación, puede ayudar a interpretar datos estructurales, según los ejemplos del blog técnico.
- Exploración de redes de reacción: útil para organizar hipótesis y planes de análisis sobre rutas de reacción, integrándose con herramientas de computación científica.
- Planificación experimental: el modelo puede estructurar protocolos y pasos de experimentación a partir de descripciones textuales, manteniendo el contexto de trabajos previos gracias a la ventana de 1M tokens.
- Revisión y organización de literatura científica: con 1M tokens de contexto puede procesar documentos extensos y sintetizar respuestas a preguntas de investigación abiertas.
- Despliegue en infraestructura AMD Instinct: la versión MXFP4 está pensada para runtimes compatibles con AMD Instinct (probada en MI350X con ATOM a TP4), lo que permite servir el modelo en clústeres AMD con caché KV en FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 422,8 GB, por lo que se necesita un host o dispositivo con memoria suficiente para cargar los pesos MXFP4 completos.
- Despliegue probado por el equipo en AMD Instinct MI350X con ATOM, tensor parallel 4 y caché KV en FP8 (decodificación especulativa desactivada).
- La versión NVFP4 del modelo fue probada en 8x B300 (Blackwell); la BF16 requiere pesos completos sin cuantizar.
- No se dispone de información sobre ejecución en GPU de consumo (RTX 4090 u otras) ni sobre opciones como llama.cpp, Ollama, vLLM o TGI para este checkpoint.
- Rendimiento observado en la prueba TP4 reportada: con 128 peticiones concurrentes de razonamiento largo se llenó el pool de caché KV y se produjo evicción con caída brusca de calidad; con 48 peticiones concurrentes el pool se mantuvo por debajo del 75% y la calidad fue normal. Son observaciones específicas del despliegue, no límites universales.
- No se dispone de datos de latencia o throughput absolutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hydrogen-1.0-MXFP4 (esta ficha) | ~384B | 1M | MXFP4 (8 bits) | MIT | Hugging Face (enhancedstudent y deep-principle) |
| Hydrogen-1.0 (BF16) | ~384B (no confirmado en la información) | 1M | BF16 sin cuantizar | MIT | Hugging Face (deep-principle) |
| Hydrogen-1.0-NVFP4 | ~384B (no confirmado en la información) | 1M | NVFP4 | MIT | Hugging Face (deep-principle) |
| GLM-5.3 (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face (zai-org) |

No se dispone de datos de rendimiento comparado con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Los resultados deben evaluarse frente a las suposiciones, restricciones y evidencias de cada tarea; el propio autor advierte que las salidas requieren revisión científica.
- Riesgo de alucinación en derivaciones y afirmaciones científicas: no se garantiza corrección factual sin verificación humana.
- El contexto efectivo y el presupuesto de salida dependen del framework de inferencia, la configuración del servicio y los recursos; el comando de ejemplo no garantiza operación a 1M de contexto en cualquier despliegue.
- Bajo carga concurrente alta puede producirse evicción de la caché KV con caída acusada de calidad (observado a 128 peticiones concurrentes en la prueba TP4 reportada).
- Es imprescindible conservar los ajustes de fin de turno de `generation_config.json`, junto con el tokenizer, el chat template y las configuraciones de modelo y cuantización, para un paro correcto.
- No se dispone de información sobre sesgos, cobertura idiomática ni limitaciones específicas por idioma.
- Licencia MIT: permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base GLM-5.3.
- No se han publicado datasets ni recetas de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/enhancedstudent/Hydrogen-1.0-MXFP4
- Repositorio MXFP4 del autor original: https://huggingface.co/deep-principle/Hydrogen-1.0-MXFP4
- Modelo base BF16: https://huggingface.co/deep-principle/Hydrogen-1.0
- Versión NVFP4: https://huggingface.co/deep-principle/Hydrogen-1.0-NVFP4
- Modelo base GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Blog técnico: https://blog.deepprinciple.com/introducing-hydrogen-1.0/
- Documentación de uso: docs/USAGE.md (referenciada en la model card)
- Versión en chino de la model card: README.zh-CN.md (referenciada en la model card)
- Contacto: info@deepprinciple.com
