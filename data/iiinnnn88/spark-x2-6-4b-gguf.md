# iiinnnn88/Spark-X2.6-4B-GGUF

## Resumen

Spark-X2.6-4B es un modelo de lenguaje compacto de propósito general desarrollado por XHToken (equipo SparkLLM), orientado específicamente al despliegue en dispositivo (*on-device*) y a flujos de trabajo agénticos. Se trata de la evolución del Spark-X2.5-4B: conserva exactamente la misma arquitectura que su predecesor y obtiene sus mejoras de capacidad mediante un post-entrenamiento refinado, con avances declarados en código, uso de herramientas, contexto largo, multilingüismo y razonamiento. El modelo cuenta con 4.447.623.680 parámetros totales según los pesos en safetensors y se distribuye bajo licencia Apache 2.0.

La ficha que nos ocupa, `iiinnnn88/Spark-X2.6-4B-GGUF`, es una republicación de terceros (autor `iiinnnn88`) de los pesos del modelo base `XHToken/Spark-X2.6-4B` en formato GGUF, pensada para inferencia con llama.cpp y derivados. No es el repositorio oficial del modelo: el autor original es XHToken y la model card incluida corresponde a la del modelo base.

Su relevancia actual radica en la combinación de tamaño reducido (4B), ventana de contexto declarada de hasta 1.048.576 tokens en la configuración de SGLang del autor, y un modo de razonamiento con presupuesto de pensamiento configurable (ninguno, bajo, alto), lo que permite ajustar latencia y coste de inferencia según la aplicación. El autor afirma que iguala o supera a modelos de ~9B en varios benchmarks, si bien los datos numéricos no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (misma arquitectura que Spark-X2.5-4B; detalles internos no disponibles) |
| Parámetros totales | 4.447.623.680 (4,4B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 1.048.576 tokens en la configuración de SGLang del autor; el ejemplo de Transformers usa `max_new_tokens=131072` |
| Tipos de cuantización | GGUF (el repo es una publicación GGUF); niveles concretos no disponibles |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantización); el modelo base se distribuye en safetensors |
| Librería | transformers (según metadatos del repo) |
| Tamaño del repositorio | 16,1 GB |
| Modelo base | XHToken/Spark-X2.6-4B |
| Pipeline | text-generation |
| Plantilla de chat | `chat_template.jinja` incluida en el checkpoint base |

## Arquitectura y entrenamiento

El autor indica explícitamente que Spark-X2.6-4B «retiene exactamente la misma arquitectura que Spark-X2.5-4B» y que las ganancias de capacidad provienen de un post-entrenamiento mejorado. No se especifican en la información disponible el tipo de atención, la composición del dataset, el número de tokens de entrenamiento ni si se emplearon RLHF, DPO u otras técnicas de alineación. Tampoco se detalla la arquitectura interna más allá de tratarse de un modelo de lenguaje decoder-only de 4,4B parámetros.

La innovación técnica destacada por el autor es el **presupuesto de pensamiento controlable**: tres niveles configurables (ninguno, bajo, alto) que permiten a la aplicación equilibrar calidad de razonamiento, latencia y coste de inferencia de forma dinámica. El ejemplo de Transformers activa el modo thinking mediante `enable_thinking=True` en `apply_chat_template`. El servidor SGLang del autor configura `--reasoning-parser qwen3` y `--tool-call-parser spark25`, lo que sugiere un formato de razonamiento y de llamada a herramientas compatible con esas convenciones.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo *thinking* conmutable y tres niveles de presupuesto (ninguno, bajo, alto).
- Codificación y tareas de ingeniería de software, con mejoras declaradas respecto a Spark-X2.5.
- Flujos agénticos: uso complejo de herramientas, planificación multi-paso y razonamiento encadenado.
- Soporte de *tool calling* / *function calling* (parser `spark25` en SGLang).
- Capacidades de contexto largo, con ventana declarada de hasta 1.048.576 tokens en la configuración de servidor del autor.
- Capacidades matemáticas y de conocimiento general (evaluadas en los benchmarks del autor, sin cifras disponibles).
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- Compatibilidad con endpoints (tag `endpoints_compatible` en el repo GGUF).

## Casos de uso

- **Agentes en dispositivo para automatización de tareas**: el modelo puede ejecutar planificación multi-paso y llamadas a herramientas con un presupuesto de pensamiento ajustable, lo que permite desplegarlo en entornos con recursos limitados manteniendo capacidad agéntica.
- **Asistentes de código integrados en IDE**: con 4,4B parámetros y cuantización GGUF, puede ejecutarse localmente en estaciones de trabajo para autocompletado, explicación de código y generación de parches sin enviar código a servicios externos.
- **Atención al cliente bilingüe (inglés/chino)**: conversaciones multi-turno con contexto largo, adecuado para bases de conocimiento extensas o historiales de conversación prolongados.
- **Procesamiento de documentos largos**: la ventana declarada de hasta 1.048.576 tokens permite resumir, extraer información o responder preguntas sobre contratos, informes o repositorios completos en una sola pasada.
- **Automatización de pipelines CI/CD con tool calling**: integración como componente de razonamiento que invoca herramientas (ejecución de tests, consulta de APIs, gestión de incidencias) mediante el parser de herramientas compatible con SGLang.
- **Asistentes de escritorio y aplicaciones móviles**: el tamaño de 4B y la disponibilidad en GGUF permiten despliegue en hardware de consumo, con el nivel de pensamiento desactivado para minimizar latencia en tareas simples.
- **Prototipado rápido de agentes con API compatible con OpenAI**: el servidor SGLang del autor expone una API compatible con OpenAI, lo que facilita integrar el modelo en frameworks existentes sin cambios de código.

## Benchmarks y rendimiento

El autor publica gráficas comparativas (`images/all_benchmark.svg`, `images/benchmark.svg`, `images/inference.svg`) frente a modelos on-device de tamaño similar, incluyendo Qwen3.5-4B y Gemma-E4B, y afirma un rendimiento «best-in-class» entre modelos de tamaño comparable, igualando o superando a modelos de ~9B en varios benchmarks. Sin embargo, **las cifras numéricas no están disponibles en la información proporcionada**: las gráficas son imágenes no transcritas y no se incluyen tablas con valores.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma oficial. Como referencia orientativa por tamaño (4,4B parámetros), en FP16 serían necesarios ~8,9 GB solo para pesos; en cuantizaciones GGUF de 8 bits ~4,5 GB, de 4 bits ~2,5-3 GB, más overhead de contexto KV. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- **GPU recomendadas**: el autor documenta despliegue en GPUs NVIDIA (imagen `lmsysorg/sglang:nightly-dev-cu13-...`) y en NPUs Ascend (A2 y A3, imágenes `quay.io/ascend/sglang:main-cann9.0.0-...`). No se especifican modelos concretos de GPU (A100, H100, RTX 4090, etc.).
- **Consumer GPU**: no confirmado por el autor; el tamaño de 4,4B y la disponibilidad en GGUF hacen plausible su ejecución en GPUs de consumo con cuantización, pero no hay datos oficiales de VRAM mínima.
- **Opciones de despliegue**: Transformers (requiere `transformers==4.57.1` y `trust_remote_code=True`), SGLang (NVIDIA y Ascend NPU, con `--tool-call-parser spark25` y `--reasoning-parser qwen3`). Para el repo GGUF, llama.cpp y derivados (Ollama, etc.) son la vía natural, aunque no se documentan en la información disponible.
- **Latencia y throughput**: el autor afirma una eficiencia de inferencia «igual o mejor» que Qwen3.5-4B y Gemma-E4B, pero no se proporcionan cifras de tokens por segundo ni latencias concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B | 4,4B | hasta 1.048.576 tokens (config. SGLang) | Apache 2.0 | Pesos en HF (base y GGUF de terceros) | Thinking conmutable, tool calling, foco on-device |
| Qwen3.5-4B | no disponible | no disponible | no disponible | no disponible | Citado por el autor como referencia de eficiencia; sin datos numéricos |
| Gemma-E4B | no disponible | no disponible | no disponible | no disponible | Citado por el autor como referencia de eficiencia; sin datos numéricos |

Los datos de los modelos comparables no están disponibles en la información proporcionada más allá de su mención como referencias de eficiencia en la model card. No se dispone de cifras de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Repositorio de terceros**: `iiinnnn88/Spark-X2.6-4B-GGUF` es una republicación no oficial; no hay garantía de fidelidad de la cuantización respecto al modelo base original. Para producción, conviene verificar contra `XHToken/Spark-X2.6-4B`.
- **Idiomas limitados**: solo inglés y chino según los metadatos; el rendimiento en castellano no está documentado y probablemente sea degradado.
- **Riesgo de alucinación**: no se documentan evaluaciones de factualidad ni tasas de alucinación; como todo LLM de 4B, es esperable un riesgo significativo en tareas de conocimiento factual.
- **Sesgos**: no se publica información sobre sesgos, composición del dataset ni procesos de mitigación.
- **Contexto largo**: la ventana de 1.048.576 tokens requiere memoria de dispositivo suficiente; el propio autor advierte de reducir `--context-length` cuando sea necesario. La calidad efectiva en contextos extremos no está documentada.
- **Licencia Apache 2.0**: permite uso comercial sin restricciones adicionales, pero la licencia del repo de cuantización debe verificarse por separado (el repo declara apache-2.0).
- **Requisitos de versión**: el ejemplo de Transformers exige `transformers==4.57.1` y `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- **Datos de benchmarks no verificables**: las afirmaciones de rendimiento del autor se basan en gráficas sin cifras transcritas; no deben tomarse como datos auditados.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/iiinnnn88/Spark-X2.6-4B-GGUF
- Modelo base oficial: https://huggingface.co/XHToken/Spark-X2.6-4B
- Slack del proyecto: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter): https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
- Paper, blog técnico y repositorio de código: no disponibles en la información proporcionada.
