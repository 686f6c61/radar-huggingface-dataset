# cekal/GLM-5.3-Flash-Uncensored

## Resumen

GLM-5.3-Flash-Uncensored es una versión sin censura del modelo GLM-5.3-Flash, desarrollado originalmente por Z.ai y modificado por el usuario cekal. Se trata del primer modelo nativamente multimodal de la serie GLM-5, con una arquitectura híbrida que combina atención dispersa y lineal, junto con conexiones hiper-restrictivas de manifold (mHC). El modelo cuenta con 321 323 millones de parámetros totales (aproximadamente 320B) y solo 18B activos por token gracias a su diseño de mezcla de expertos (MoE), lo que lo hace notablemente eficiente en cómputo e inferencia.

La versión "Uncensored" elimina las guardas de seguridad del modelo original, permitiendo respuestas sin restricciones de contenido. Está diseñado para tareas de razonamiento, generación de código, uso de herramientas y trabajo agéntico, con una ventana de contexto de hasta un millón de tokens. Su licencia MIT permite uso comercial sin restricciones, y está disponible en formatos compatibles con transformers, vLLM, SGLang y otros frameworks de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención dispersa + lineal) con MoE y mHC |
| Parametros totales | 321 323 031 390 (321B) |
| Parametros activos | 18B (MoE) |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantizacion | fp8 (según tags del repo); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3-Flash parte de un modelo base reentrenado desde cero, con una arquitectura rediseñada para maximizar eficiencia y capacidad. Introduce por primera vez en la serie GLM una combinación de atención dispersa (sparse attention) y atención lineal, lo que reduce drásticamente los costes de servir contextos largos sin sacrificar precisión. Además, emplea conexiones hiper-restrictivas de manifold (mHC) para mejorar la escalabilidad del entrenamiento. El corpus de preentrenamiento multimodal consta de 30 billones de tokens, lo que permite al modelo procesar tanto texto como imágenes de forma nativa.

El modelo original de Z.ai incorpora un mecanismo de razonamiento controlable mediante el parámetro `reasoning_effort` (niveles `low`, `high` y `max`), así como un parámetro `clear_thinking` en la plantilla de chat para limpiar el razonamiento interno en conversaciones. La versión "Uncensored" de cekal elimina las capas de seguridad y moderación, probablemente mediante técnicas de abliteración, aunque no se dispone de detalles específicos sobre el proceso de fine-tuning aplicado.

## Capacidades

- Generación de texto y razonamiento multi-paso con control de presupuesto de pensamiento (`reasoning_effort`).
- Comprensión y generación multimodal: acepta imágenes como entrada y produce texto (image-text-to-text).
- Soporte de tool calling y function calling, compatible con APIs estilo OpenAI.
- Capacidades agénticas: puede ejecutar tareas complejas de múltiples pasos, como navegación web, uso de terminal y manipulación de repositorios.
- Ventana de contexto de 1M tokens, adecuada para documentos largos, análisis de código extenso y conversaciones prolongadas.
- Multilingüe limitado a inglés y chino.
- Modo "uncensored": respuestas sin restricciones de contenido, útil para investigación de seguridad o generación creativa sin filtros.

## Casos de uso

- Asistente de programación en producción: el modelo puede integrarse en entornos de desarrollo (IDEs, CI/CD) para generar código, revisar pull requests y depurar errores, aprovechando su ventana de 1M tokens para analizar repositorios completos y su soporte de tool calling para ejecutar comandos.
- Automatización de tareas agénticas: con su capacidad de razonamiento multi-paso y uso de herramientas, puede gestionar flujos de trabajo como la creación de informes, la extracción de datos de la web o la administración de sistemas, mediante frameworks como mini-swe-agent o Claude Code.
- Análisis de documentos extensos: su contexto de 1M tokens permite procesar libros técnicos, contratos legales o informes financieros completos en una sola pasada, resumiendo y extrayendo información relevante.
- Generación creativa sin restricciones: la versión uncensored permite explorar narrativas, guiones o contenido literario sin filtros de moderación, útil para escritores que necesitan libertad creativa total.
- Investigación en seguridad de IA: al eliminar las guardas, el modelo sirve para estudiar comportamientos no alineados, evaluar riesgos de jailbreak o desarrollar técnicas de mitigación.
- Soporte multilingüe en inglés y chino: puede actuar como traductor o asistente bilingüe en entornos corporativos que operen en ambos idiomas, manteniendo coherencia en contextos largos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card original menciona evaluaciones en HLE w/ tools, NL2Repo, DeepSWE, Terminal-Bench 2.1, Agent's Last Exam, Toolathlon Verified, AutomationBench, GDPval-AA v2 y BabyVision, indicando que el modelo supera a GLM-5.2 y se acerca a Claude Opus 4.8 en tareas de codificación y agénticas, pero no se proporcionan cifras concretas en el texto extraído. Se recomienda consultar el informe técnico de GLM-5 (arxiv:2602.15763) para obtener datos detallados.

## Requisitos de hardware

- El repositorio pesa 328.4 GB, lo que sugiere que los pesos están en fp8 (según los tags). En esta precisión, se necesitan aproximadamente 321 GB de memoria para cargar el modelo completo.
- Para inferencia en fp8 se requieren múltiples GPUs de alta gama: por ejemplo, 4× H100 80GB, 8× A100 80GB o 8× RTX 4090 24GB (aunque con cuantizaciones más agresivas podría caber en menos).
- No cabe en una GPU de consumo estándar (16-24 GB) sin cuantización adicional (por ejemplo, GGUF de 4 bits), pero no se dispone de datos sobre versiones cuantizadas específicas.
- Frameworks de despliegue compatibles: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth.
- La latencia y el throughput dependen en gran medida del hardware y la configuración; con 18B parámetros activos, la generación es significativamente más rápida que un modelo denso de 320B, pero aún requiere infraestructura de servidor.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con modelos equivalentes. Como referencia cualitativa:

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia |
|---|---|---|---|---|
| GLM-5.3-Flash (original) | 320B | 18B | 1M | MIT |
| GLM-5.3-Flash-Uncensored (cekAL) | 321B | 18B | 1M | MIT |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible |
| Claude Opus 4.8 | no disponible (propietario) | no disponible | no disponible | propietaria |

La versión uncensored se diferencia del original únicamente en la eliminación de guardas de seguridad; el resto de características técnicas son idénticas. No se han encontrado datos de otros modelos MoE comparables en la información proporcionada.

## Limitaciones y advertencias

- Al ser una versión "uncensored", el modelo puede generar contenido dañino, ilegal o éticamente problemático. Su uso en producción debe evaluarse cuidadosamente y restringirse a entornos controlados.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en tareas de razonamiento complejo o con contextos muy largos.
- Soporte de idiomas limitado a inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia MIT permite uso comercial, pero el fine-tune "uncensored" puede no estar respaldado oficialmente por Z.ai, y su mantenimiento o actualizaciones dependen del autor cekal.
- El modelo requiere infraestructura de hardware considerable; no es adecuado para despliegues en dispositivos de bajo consumo sin cuantización adicional.
- No se dispone de información sobre el proceso de fine-tuning aplicado por cekal, por lo que no se puede verificar la calidad o estabilidad del modelo en comparación con el original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cekal/GLM-5.3-Flash-Uncensored
- Modelo original de Z.ai: https://huggingface.co/unsloth/GLM-5.3-Flash
- Blog de GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Informe técnico de GLM-5: https://arxiv.org/abs/2602.15763
- Documentación de la API de Z.ai: https://docs.z.ai/guides/llm/glm-5.3-flash
- Guía de despliegue con SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3-Flash
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.3-Flash-Tutorial.md
- Guía de Unsloth: https://unsloth.ai/docs/models/glm-5.3
