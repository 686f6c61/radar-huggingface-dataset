# kazzper/GLM-5.3-Flash

## Resumen

GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5, desarrollado por el equipo GLM (zai-org). Se trata de un modelo de arquitectura híbrida que combina atención dispersa y atención lineal, con un total de 320 000 millones de parámetros de los cuales solo 18 000 millones están activos, lo que lo configura como un modelo de mezcla de expertos (MoE) orientado a la eficiencia en inferencia. Su pipeline es `image-text-to-text`, por lo que acepta entradas de imagen y texto y genera texto.

El modelo parte de una base entrenada desde cero y emplea un corpus de preentrenamiento multimodal de 30 billones de tokens. Incorpora innovaciones como las Manifold-Constrained Hyper-Connections (mHC) para mejorar la eficiencia de escalado y una arquitectura híbrida de atención que reduce los costes de servicio en contextos largos sin sacrificar precisión. Según el autor, supera a GLM-5.2 en benchmarks y cargas de trabajo reales a una décima parte del precio, y se aproxima a Claude Opus 4.8 en tareas de código y agentes.

La relevancia actual del modelo radica en su relación capacidad-coste: al ser un MoE con solo 18B parámetros activos, permite despliegues más económicos que modelos densos de tamaño comparable, manteniendo capacidades multimodales, razonamiento con presupuesto de pensamiento configurable y soporte para agentes y tool calling. La licencia MIT facilita su uso comercial y su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención dispersa y lineal (MoE) |
| Parametros totales | 321 323 031 390 (~321B) |
| Parametros activos | ~18B |
| Longitud de contexto | Hasta 1M tokens (evaluado en NL2Repo con 1M; contexto máximo de evaluación de 300K en HLE) |
| Tipos de cuantizacion | FP8 (etiqueta del repo); no se detallan otras en la información disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

GLM-5.3-Flash emplea una arquitectura de mezcla de expertos (MoE) con 321B parámetros totales y aproximadamente 18B activos por token. La innovación principal es una arquitectura híbrida que combina atención dispersa (sparse attention) con atención lineal, diseñada para reducir drásticamente el coste de servicio en contextos largos manteniendo la precisión en recuperación de información a larga distancia. Además, incorpora Manifold-Constrained Hyper-Connections (mHC), una técnica que mejora la eficiencia de escalado del modelo.

El entrenamiento parte de un modelo base entrenado desde cero, con una receta rediseñada en torno a capacidad y eficiencia. Se utilizó un corpus de preentrenamiento multimodal de 30 billones de tokens. La model card no detalla la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO, por lo que estos datos no están disponibles en la información proporcionada. El modelo soporta un parámetro `reasoning_effort` con tres niveles (`low`, `high`, `max`) para controlar el presupuesto de pensamiento, lo que sugiere un entrenamiento orientado a razonamiento con control de esfuerzo.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes y texto como entrada y genera texto, con pipeline `image-text-to-text`.
- Razonamiento con presupuesto configurable: parámetro `reasoning_effort` con niveles `low`, `high` y `max` (por defecto `max`).
- Código y agentes: según el autor, se aproxima a Claude Opus 4.8 en benchmarks de código y agentes; evaluado en DeepSWE, Terminal-Bench 2.1 y NL2Repo.
- Tool calling y uso de herramientas: evaluado en HLE con herramientas (conjunto completo), Toolathlon Verified y AutomationBench.
- Razonamiento multi-paso y agentes autónomos: soporta evaluación con harness tipo mini-swe-agent y contextos de hasta 400K-1M tokens.
- Capacidades multilingües: inglés y chino.
- Modo de pensamiento controlable: `clear_thinking` en la plantilla de chat (por defecto `false`; se recomienda `true` en escenarios de chat).
- Capacidades de visión: evaluación en BabyVision con redimensionado de imágenes (lado corto mínimo de 1.5K píxeles).

## Casos de uso

- **Atención al cliente multimodal**: el modelo puede gestionar conversaciones multi-turno con imágenes adjuntas (capturas, fotos de producto) y contexto largo, gracias a su ventana de hasta 1M tokens y su naturaleza image-text-to-text.
- **Generación de código en producción**: con soporte de tool calling y evaluación en Terminal-Bench 2.1 y DeepSWE, puede integrarse en pipelines de CI/CD y entornos de terminal para tareas de reparación y generación de código.
- **Agentes autónomos de ingeniería de software**: evaluado en NL2Repo con contexto de 1M tokens y en DeepSWE con harness mini-swe-agent, es adecuado para tareas de creación de repositorios y resolución de incidencias de forma autónoma.
- **Análisis de documentos largos con imágenes**: la combinación de contexto largo y entrada visual permite procesar informes, contratos o papers con figuras y tablas, extrayendo información estructurada.
- **Automatización de flujos con herramientas**: evaluado en Toolathlon Verified y AutomationBench, puede orquestar llamadas a APIs y servicios externos en flujos de trabajo multi-paso.
- **Asistencia en investigación con razonamiento profundo**: el nivel `reasoning_effort=max` permite tareas de razonamiento complejo (evaluado en HLE con herramientas) con hasta 163 840 tokens de generación.
- **Despliegue local con FP8**: al estar disponible en safetensors con etiqueta FP8 y soporte en SGLang, vLLM, KTransformers y Unsloth, permite servir el modelo en infraestructura propia con cuantización de 8 bits.

## Benchmarks y rendimiento

La model card referencia una imagen de benchmarks (`bench_53.png`) y múltiples evaluaciones cuyos resultados numéricos no se incluyen en el texto proporcionado. No se dispone de las cifras concretas de MMLU, HumanEval, GSM8K ni de las comparativas numéricas con GLM-5.2 o Claude Opus 4.8.

| Benchmark | Resultado | Notas |
|---|---|---|
| HLE con herramientas (conjunto completo) | no disponible (solo metodología) | temp=1.0, top_p=0.95, max 163 840 tokens, contexto 300K, juez GPT-5.6-luna |
| NL2Repo | no disponible (solo metodología) | temp=1.0, top_p=1.0, max_new_tokens=64K, contexto 1M |
| DeepSWE | no disponible (solo metodología) | mini-swe-agent, temp=0.95, top_p=1.0, timeout 6h, contexto 400K |
| Terminal-Bench 2.1 | no disponible (solo metodología) | Claude Code 2.1.207, temp=1.0, top_p=1, max_new_tokens=65 536, timeout 6h |
| Toolathlon Verified | no disponible (solo metodología) | pass@1 media de 3 ejecuciones |
| AutomationBench | no disponible (solo metodología) | v1.0.6, con fix de PR #13 |
| GDPval-AA v2 | no disponible (solo metodología) | evaluado por Artificial Analysis |
| BabyVision | no disponible (solo metodología) | temp=1.0, top_p=0.95, contexto 164K, imágenes con lado corto ≥1.5K px |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 321B parámetros totales, en FP8 se requieren aproximadamente 321 GB solo para pesos, más overhead de KV cache y activaciones. En cuantizaciones de menor precisión (no detalladas en la información) el requisito sería menor, pero no se dispone de cifras concretas.
- **GPU recomendadas**: para FP8 se necesitan múltiples aceleradores de alta gama; un solo H100 de 80 GB no es suficiente para los pesos completos. Se requiere un nodo multi-GPU (por ejemplo, 4-8× H100 80 GB o A100 80 GB) o GPUs con mayor memoria.
- **¿Cabe en consumer GPU?**: no en FP8 con los pesos completos. No se dispone de información sobre cuantizaciones GGUF/4-bit que permitan su ejecución en RTX 4090 (24 GB) o similares.
- **Opciones de despliegue**: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth (según la model card).
- **Latencia y throughput**: no disponibles en la información proporcionada. Al ser un MoE con ~18B parámetros activos, el coste por token es sustancialmente menor que el de un modelo denso de 321B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash | ~321B / ~18B | hasta 1M | MIT | Sí (image-text-to-text) | HuggingFace, API Z.ai |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Claude Opus 4.8 | no disponible | no disponible | propietaria | no disponible | API propietaria |

La model card afirma que GLM-5.3-Flash supera a GLM-5.2 en benchmarks y cargas reales a una décima parte del precio, y que se aproxima a Claude Opus 4.8 en código y agentes. Sin embargo, no se proporcionan los datos numéricos de GLM-5.2 ni de Claude Opus 4.8 en la información disponible, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- **Idiomas**: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- **Sesgos**: no se documentan sesgos conocidos en la información proporcionada; al entrenarse con un corpus web masivo, es probable que herede sesgos presentes en los datos, pero no hay datos concretos.
- **Alucinación**: no se aportan métricas de fiabilidad ni tasas de alucinación; como todo LLM, existe riesgo de generar información incorrecta, especialmente en tareas de razonamiento abierto.
- **Licencia**: MIT permite uso comercial, pero se recomienda revisar las licencias de los datasets y componentes de terceros no detallados.
- **Contexto**: aunque se evalúa con contextos de hasta 1M tokens, el contexto máximo de evaluación en algunas tareas es de 300K, y el rendimiento más allá de esas longitudes no está verificado de forma independiente.
- **Hardware**: el tamaño del repo (328,4 GB) y los 321B parámetros implican requisitos de infraestructura elevados; no hay información sobre cuantizaciones de baja precisión para hardware consumer.
- **Madurez del repo**: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-02), lo que sugiere que la información pública puede ser preliminar.
- **Parámetros de evaluación**: los benchmarks se realizaron con configuraciones específicas (temperaturas, timeouts, jueces) que pueden no ser reproducibles fuera de esos entornos.

## Enlaces

- [HuggingFace: kazzper/GLM-5.3-Flash](https://huggingface.co/kazzper/GLM-5.3-Flash)
- [Blog de GLM-5.3-Flash](https://z.ai/blog/glm-5.3-flash)
- [Technical report (arXiv:2602.15763)](https://arxiv.org/abs/2602.15763)
- [API Z.ai para GLM-5.3-Flash](https://docs.z.ai/guides/llm/glm-5.3-flash)
- [Repositorio GitHub zai-org/GLM-5](https://github.com/zai-org/GLM-5)
- [SGLang cookbook](https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3-Flash)
- [vLLM recipes](https://recipes.vllm.ai/zai-org/GLM-5.3-Flash)
- [TokenSpeed recipes](https://lightseek.org/tokenspeed/recipes/models#glm-5-3-flash)
- [Documentación de Transformers (glm5_next)](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm5_next.md)
- [Tutorial de KTransformers](https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.3-Flash-Tutorial.md)
- [Guía de Unsloth](https://unsloth.ai/docs/models/glm-5.3)
- [Discord de la comunidad](https://discord.gg/QR7SARHRxK)
