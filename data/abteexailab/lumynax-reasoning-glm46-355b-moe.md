# AbteeXAILab/lumynax-reasoning-glm46-355b-moe

## Resumen

LumynaX Reasoning GLM-4.6 355B MoE es un modelo de lenguaje de gran escala desarrollado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda). Se trata de un artefacto de investigación temprano que integra el modelo GLM-4.6 de zai-org mediante un mecanismo de "infusión" de LumynaX Core, un sistema de orquestación que envuelve el modelo base sin modificar sus pesos. El resultado es un paquete de 356.785.898.816 parámetros (aproximadamente 356,8 mil millones) orientado a tareas de razonamiento, contexto largo y uso de herramientas, con licencia MIT.

El modelo se publica como un release *legacy* y *outdated*, explícitamente no recomendado para producción. Su propósito declarado es la reproducibilidad y la investigación sobre técnicas de infusión de modelos, soberanía de IA y despliegue local. Aunque el nombre sugiere una arquitectura MoE, la model card no confirma detalles internos; se limita a indicar que la integración se realiza mediante "routed runtime and identity integration" sin composición de pesos. El repositorio incluye artefactos para Transformers, GGUF y Ollama, lo que sugiere cierta flexibilidad de despliegue, aunque sin especificaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: GLM-4.6 de zai-org; el nombre sugiere MoE, sin confirmación) |
| Parametros totales | 356.785.898.816 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (etiquetado como "long-context" sin cifra) |
| Tipos de cuantizacion | No disponible (se menciona GGUF en tags, sin detalle) |
| Idiomas soportados | en (inglés), mi (maorí) |
| Licencia | MIT |
| Formato de pesos | safetensors (también se referencia GGUF en tags) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Según la model card, se trata de una integración de GLM-4.6 (de zai-org) con el sistema LumynaX Core, que actúa como capa de orquestación. El método de infusión es "routed runtime and identity integration", lo que implica que LumynaX Core dirige la inferencia a través del modelo base sin modificar sus pesos. No se proporcionan datos sobre el entrenamiento, el número de tokens, la composición del dataset ni técnicas como RLHF o DPO. El release se describe como un experimento temprano, anterior a la implementación actual de LumynaX Core, y se conserva únicamente con fines de reproducibilidad.

## Capacidades

- Generación de texto conversacional y de razonamiento, según el pipeline `text-generation`.
- Razonamiento multi-step y planificación, indicado por el tag `reasoning`.
- Soporte de herramientas (*tool calling*), según el tag `tools`.
- Contexto largo, etiquetado como `long-context`, aunque sin especificar la longitud exacta.
- Multilingüismo limitado a inglés y maorí (idioma oficial de Nueva Zelanda).
- Integración con entornos de despliegue como vLLM, NIM y Ollama, según los tags y el repositorio.
- Enfoque en "sovereign AI" y "local-first", orientado a despliegues autónomos y control local de datos.

## Casos de uso

- Investigación académica sobre técnicas de infusión de modelos: el paquete permite estudiar cómo un modelo base (GLM-4.6) se integra con un orquestador externo sin modificar pesos, lo que resulta útil para experimentos de composición de modelos.
- Evaluación de capacidades de razonamiento en contextos largos: investigadores pueden probar el comportamiento del modelo en tareas que requieren mantener información a lo largo de ventanas extensas, aunque no se dispone de la longitud exacta.
- Desarrollo de asistentes conversacionales bilingües (inglés-maorí): el modelo soporta ambos idiomas, lo que permite prototipar aplicaciones para comunidades de habla maorí en Nueva Zelanda.
- Experimentación con despliegue local y soberanía de datos: dado su enfoque "local-first", puede usarse para probar infraestructuras de IA autónomas en entornos con requisitos estrictos de privacidad.
- Pruebas de integración con vLLM y NIM: el repositorio incluye indicaciones de compatibilidad con estos motores, lo que facilita evaluar su rendimiento en entornos de producción simulados.
- Reproducción de resultados de investigación: al ser un release *legacy*, sirve como referencia para verificar artefactos históricos y comparar con versiones posteriores de LumynaX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación.
- Dado el tamaño de 356.785.898.816 parámetros, la inferencia en precisión FP16 requeriría aproximadamente 713 GB de VRAM, lo que implica un clúster de múltiples GPUs de data center (por ejemplo, 9-10 GPUs A100 de 80 GB o H100).
- La presencia de tags GGUF sugiere que existen versiones cuantizadas que podrían reducir los requisitos, pero no se especifican los niveles de cuantización ni el VRAM resultante.
- El repositorio incluye un `Modelfile` para Ollama, lo que indica que se puede ejecutar con llama.cpp/Ollama, aunque el tamaño del modelo probablemente exceda la capacidad de GPUs de consumo (como RTX 4090) incluso cuantizado.
- Para despliegue en producción, se recomendaría usar vLLM o TGI con múltiples GPUs, pero no hay datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros modelos de la misma categoría en la información proporcionada. El modelo base GLM-4.6 de zai-org podría ser un punto de referencia, pero no se dispone de datos de rendimiento para establecer una comparativa.

## Limitaciones y advertencias

- El modelo está explícitamente marcado como *legacy* y *outdated*; no representa las capacidades actuales de AbteeX AI Labs y no debe usarse en producción.
- No se recomienda su uso en aplicaciones críticas debido a la falta de información sobre sesgos, alucinaciones o robustez.
- El soporte de idiomas se limita a inglés y maorí; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia MIT permite uso comercial, pero el estado de "artefacto de investigación" implica que no hay garantías de mantenimiento ni soporte.
- No se han publicado evaluaciones de seguridad ni de sesgos; se desconoce el comportamiento en escenarios adversos.
- La arquitectura interna no está documentada, lo que dificulta la interpretación de resultados y la depuración de errores.
- El tamaño del modelo (356B parámetros) hace que su despliegue sea costoso y requiera infraestructura especializada, limitando su accesibilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AbteeXAILab/lumynax-reasoning-glm46-355b-moe)
- [Repositorio fuente en GitHub](https://github.com/Aimaghsoodi/lumynax-reasoning-glm46-355b-moe)
- [Sitio de AbteeX AI Labs](https://abteex.com)
- [Sitio de LumynaX](https://lumynax.com)
- [Contacto](mailto:aimaghsoodi@abteex.com)
- [Quickstart en GitHub](https://github.com/Aimaghsoodi/lumynax-reasoning-glm46-355b-moe/blob/main/quickstart.py)
- [Modelfile para Ollama](https://github.com/Aimaghsoodi/lumynax-reasoning-glm46-355b-moe/blob/main/ollama/Modelfile)
