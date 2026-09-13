# schwyzquant/GLM-5.3-Flash

## Resumen

GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5, desarrollado por Z.ai (Zhipu AI) y publicado aquí en un repositorio réplica bajo el identificador `schwyzquant/GLM-5.3-Flash`. Se trata de un modelo de mezcla de expertos (MoE) con 320.000 millones de parámetros totales y solo 18.000 millones de parámetros activos por token, lo que sitúa su coste de inferencia muy por debajo de su tamaño nominal. Según la model card, supera a GLM-5.2 en benchmarks y cargas de trabajo reales a una décima parte del precio, y se aproxima a Claude Opus 4.8 en tareas de código y agentes.

La relevancia técnica del modelo está en su arquitectura híbrida: combina atención dispersa (sparse) con atención lineal, lo que reduce de forma acusada el coste de servicio en contextos largos sin sacrificar precisión en la recuperación de información lejana. A esto se añade Manifold-Constrained Hyper-Connections (mHC) para mejorar la eficiencia de escalado, y un corpus de preentrenamiento multimodal de 30 billones de tokens. El resultado declarado es "más inteligencia con menos cómputo".

El repositorio concreto analizado (`schwyzquant/GLM-5.3-Flash`) tiene 0 descargas y 0 "likes", se creó y actualizó el 12 de septiembre de 2026 con un segundo de diferencia, y ocupa 328,4 GB. La licencia declarada es MIT, aunque la model card reproduce el material oficial de Z.ai. Conviene tratar este repositorio como una copia no oficial de los pesos oficiales y verificar la licencia real del modelo original antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con arquitectura híbrida de atención dispersa + atención lineal y Manifold-Constrained Hyper-Connections (mHC) |
| Parámetros totales | 321.323.031.390 (~320B), según safetensors del repositorio |
| Parámetros activos | 18B por token |
| Longitud de contexto | No declarada explícitamente en la información disponible; las evaluaciones citan ventanas de 300.000 tokens (HLE con herramientas), 400.000 tokens (DeepSWE) y hasta 1M de tokens (NL2Repo), con longitudes máximas de generación de 163.840 tokens |
| Tipos de cuantización | El repositorio incluye el tag `fp8`; no se declaran GGUF, AWQ ni GPTQ. Existe una guía de Unsloth para versiones cuantizadas, sin detalle en la información disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT (según el repositorio; la licencia de los pesos originales de Z.ai no se detalla en la información disponible) |
| Formato de pesos | safetensors (librería `transformers`; arquitectura declarada `glm5_next`) |

## Arquitectura y entrenamiento

GLM-5.3-Flash parte de un modelo base entrenado desde cero, con arquitectura y receta de entrenamiento rediseñadas en torno a capacidad y eficiencia. Es un modelo MoE de 320B parámetros totales con 18B activos, y el primer modelo de la serie GLM-5 con multimodalidad nativa (pipeline `image-text-to-text`), es decir, no añade visión mediante un adaptador posterior sobre un modelo de texto, sino que la integra en el preentrenamiento.

La innovación principal es la arquitectura híbrida que combina atención dispersa y atención lineal, pensada para reducir drásticamente el coste de servicio en contextos largos manteniendo la precisión en contextos extensos. Se suma el mecanismo Manifold-Constrained Hyper-Connections (mHC), orientado a mejorar la eficiencia de escalado. El preentrenamiento multimodal se realizó sobre un corpus de 30 billones de tokens. En cuanto al alineamiento, la información disponible menciona un parámetro `reasoning_effort` con tres niveles (`low`, `high`, `max`) que controla el presupuesto de razonamiento, lo que implica fases de entrenamiento orientadas a razonamiento con control de esfuerzo; no se detallan en la información proporcionada las etapas concretas de RLHF, DPO u otras.

Un detalle relevante de despliegue: en la plantilla de chat, `clear_thinking` toma el valor `false` por defecto, por lo que en escenarios conversacionales debe pasarse explícitamente `clear_thinking=true`. Para reproducir benchmarks y clasificaciones, la recomendación del autor es mantener el valor por defecto `max` de `reasoning_effort`.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de imagen y texto en un único modelo nativo (`image-text-to-text`).
- Razonamiento con presupuesto de "pensamiento" ajustable mediante `reasoning_effort` (`low`, `high`, `max`, con `max` por defecto).
- Codificación y agentes: la model card reporta evaluación en NL2Repo (generación de repositorios completos desde lenguaje natural), DeepSWE con el harness `mini-swe-agent`, Terminal-Bench 2.1 en Claude Code 2.1.207 y Agent's Last Exam.
- Uso de herramientas: evaluación explícita con conjunto completo de herramientas en HLE (Humanity's Last Exam) y en Toolathlon Verified (resultados vía servicio oficial, pass@1 promediado sobre 3 ejecuciones).
- Automatización de flujos: evaluación en AutomationBench v1.0.6 y GDPval-AA v2.
- Razonamiento visual: evaluación en BabyVision con imágenes redimensionadas para que el lado corto tenga al menos 1,5K píxeles.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- Contexto muy largo: las evaluaciones citadas operan con ventanas de 300K a 1M tokens y longitudes de generación de hasta 163.840 tokens.
- Compatibilidad de despliegue con SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth.

## Casos de uso

- Agentes de codificación autónoma: el modelo está evaluado con harnesses tipo `mini-swe-agent` y Claude Code, y soporta tool calling, por lo que puede integrarse en pipelines que resuelven issues, ejecutan tests y aplican parches sobre repositorios reales con hasta 400K tokens de contexto.
- Generación de repositorios completos desde especificación: el escenario NL2Repo, evaluado con `max_new_tokens=64k` y contexto de 1M, corresponde a la generación de código estructurado en múltiples ficheros a partir de una descripción funcional.
- Automatización de operaciones y terminal: la evaluación en Terminal-Bench 2.1 con un timeout de 6 horas sugiere uso en tareas de administración de sistemas, diagnóstico de fallos y ejecución de comandos en entornos controlados.
- Atención al cliente multimodal: al aceptar imágenes y texto con contexto largo, permite gestionar conversaciones multi-turno donde el usuario adjunta capturas, facturas o fotografías de producto sin perder el hilo previo.
- Procesamiento de documentos extensos con elementos visuales: informes anuales, expedientes escaneados o manuales técnicos que combinan texto e imágenes, aprovechando la ventana de contexto larga y la atención híbrida para reducir el coste de servir documentos de cientos de miles de tokens.
- RAG sobre corpus masivos: la atención híbrida (dispersa + lineal) está diseñada específicamente para abaratar el servicio en contextos largos, lo que resulta adecuado para indexar y consultar bases documentales muy extensas con menos coste por consulta que un transformer de atención densa equivalente.
- Automatización de flujos de trabajo empresariales: los escenarios de AutomationBench y Toolathlon Verified apuntan a orquestación de APIs, rellenado de formularios y encadenamiento de herramientas en procesos administrativos.
- Despliegue on-premise con presupuesto de GPU limitado: los 18B parámetros activos permiten, con KTransformers y descarga parcial a CPU/RAM, ejecutar el modelo en infraestructura con pocas GPU pero mucha memoria del sistema.
- Razonamiento visual técnico: inspección de planos, capturas de interfaz o imágenes de producto con resolución alta (lado corto ≥1,5K píxeles), tal como se configura en la evaluación BabyVision.

## Benchmarks y rendimiento

La model card menciona evaluación en HLE con conjunto completo de herramientas, NL2Repo, DeepSWE, Terminal-Bench 2.1, Agent's Last Exam, Toolathlon Verified, AutomationBench v1.0.6, GDPval-AA v2 y BabyVision, además de una figura comparativa (`bench_53.png`) frente a otros modelos. Sin embargo, los valores numéricos no están incluidos en la información textual proporcionada.

No se han publicado resultados de benchmarks numéricos en la información disponible.

Configuraciones de evaluación documentadas (útiles para reproducibilidad):

| Benchmark | Configuración declarada |
|---|---|
| HLE con herramientas (conjunto completo) | `temperature=1.0`, `top_p=0.95`, generación máxima 163.840 tokens, contexto máximo 300.000 tokens con estrategia de gestión de contexto; juez GPT-5.6-luna (medium) |
| NL2Repo | `temperature=1.0`, `top_p=1.0`, `max_new_tokens=64k`, contexto de 1M; juicio por reglas y por LLM para evitar comportamientos maliciosos |
| DeepSWE | Harness `mini-swe-agent`, `temperature=0.95`, `top_p=1.0`, timeout de 6 h, contexto de 400K |
| Terminal-Bench 2.1 | Claude Code 2.1.207, `temperature=1.0`, `top_p=1`, `max_new_tokens=65536`, timeout de 6 h |
| Toolathlon Verified | Servicio oficial de evaluación, pass@1 promediado sobre 3 ejecuciones independientes |
| AutomationBench | Versión 1.0.6, con la corrección del manejo de tipo `null` introducida en el PR #13 |
| GDPval-AA v2 | Evaluado por Artificial Analysis |
| BabyVision | `temperature=1.0`, `top_p=0.95`, contexto máximo 164K tokens, imágenes redimensionadas a lado corto ≥1,5K píxeles |

## Requisitos de hardware

- Estimaciones de peso a partir de los 321.323.031.390 parámetros declarados (no incluyen caché KV ni overhead de runtime): BF16 ≈ 640 GB; FP8 ≈ 320 GB; cuantización de 4 bits ≈ 160 GB.
- Para FP8, el mínimo práctico es un nodo de 8 GPU de 80 GB (H100/H200/A100 80GB), o 4 GPU de 80 GB si se acepta poco margen para caché KV. Para BF16 se necesitan al menos 8 GPU de 80 GB con margen ajustado.
- En cuantización de 4 bits el modelo puede caber en 2 GPU de 80 GB (H100 o A100 80GB) o en un nodo de 4 GPU de menor capacidad.
- No cabe completo en GPUs de consumo: una RTX 4090 (24 GB) o una RTX 5090 no pueden alojar los pesos, ni siquiera en 4 bits. La vía realista en hardware de consumo es la descarga de expertos a CPU/RAM con KTransformers, que requiere del orden de 200 GB o más de memoria del sistema junto a una GPU consumer para los expertos activos.
- Frameworks de despliegue soportados oficialmente: SGLang, vLLM, TokenSpeed, Transformers, KTransformers y Unsloth.
- Latencia y throughput estimados: no disponibles. El único dato indirecto es que los 18B parámetros activos por token reducen el cómputo por token frente a un modelo denso de 320B, y que la atención híbrida abarata el servicio en contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash | 320B totales / 18B activos | No declarada; evaluaciones de 300K a 1M tokens | MIT en este repositorio (licencia del original no detallada) | Pesos en este repositorio de HuggingFace y API en Z.ai | Primer modelo multimodal nativo de la serie GLM-5; arquitectura híbrida de atención dispersa + lineal |
| GLM-5.2 | No disponible | No disponible | No disponible | No disponible en la información proporcionada | Predecesor directo; la model card afirma que GLM-5.3-Flash lo supera con una décima parte del precio |
| Claude Opus 4.8 | No disponible | No disponible | Propietaria | API de Anthropic | La model card afirma que GLM-5.3-Flash se aproxima a él en benchmarks de código y agentes; sin cifras en la información disponible |
| GPT-5.6-luna | No disponible | No disponible | Propietaria | API | Se usa como modelo juez en la evaluación de HLE, no como comparativa de rendimiento |

No se dispone de cifras de rendimiento de GLM-5.2 ni de Claude Opus 4.8 en la información proporcionada, por lo que la comparación cuantitativa queda no disponible.

## Limitaciones y advertencias

- Repositorio no oficial: el ID `schwyzquant/GLM-5.3-Flash` no corresponde a la organización oficial del modelo (Z.ai / Zhipu AI). El repositorio tiene 0 descargas, 0 "likes" y fue creado y actualizado con un segundo de diferencia, lo que es compatible con una subida automatizada o un espejo sin validar. Verifique la integridad de los pesos antes de usarlos.
- Licencia: el repositorio declara MIT, pero la model card reproduce material oficial de Z.ai y no especifica la licencia de los pesos originales. La aplicabilidad de MIT a estos pesos no está confirmada y debe comprobarse con el proveedor original antes de un uso comercial.
- Idiomas: los idiomas declarados son inglés y chino. No hay soporte declarado de castellano, por lo que el rendimiento en español es incierto y debe evaluarse empíricamente.
- Sesgos: no hay información disponible sobre sesgos conocidos, composición demográfica del corpus ni auditorías de equidad en la información proporcionada.
- Alucinación: no se han publicado tasas de alucinación ni evaluaciones de veracidad en la información disponible. Como en cualquier modelo generativo de gran escala, existe riesgo de generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento largo con herramientas.
- Contexto: la ventana máxima no se declara explícitamente. Las evaluaciones usan desde 300.000 hasta 1M tokens, y en HLE se aplica una "estrategia de gestión de contexto" con 300.000 tokens, lo que sugiere que el contexto efectivo depende de la implementación y puede degradar la precisión si se satura.
- Configuración de chat: si no se pasa `clear_thinking=true` en escenarios conversacionales, el comportamiento por defecto (`false`) puede no ser el deseado. Del mismo modo, `reasoning_effort` cae a `max` con cualquier valor no reconocido, lo que incrementa coste y latencia de forma silenciosa.
- Coste de hardware: 328,4 GB de repositorio y ~320 GB de pesos en FP8 implican requisitos de infraestructura propios de centro de datos. El despliegue en GPUs de consumo solo es viable con descarga a CPU y mucha RAM.
- Evaluaciones autodeclaradas: los resultados de benchmarks provienen del equipo del modelo (o de terceros como Artificial Analysis en GDPval-AA v2) y en varios casos dependen de harnesses concretos (Claude Code 2.1.207, `mini-swe-agent`) y de un modelo juez propietario, lo que dificulta la reproducción independiente.
- Los resultados de la búsqueda web no contienen información relevante sobre este modelo; los enlaces devueltos corresponden a páginas de ayuda de inicio de sesión y no se incluyen.

## Enlaces

- HuggingFace (repositorio analizado): https://huggingface.co/schwyzquant/GLM-5.3-Flash
- Blog oficial de GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Informe técnico GLM-5 (arXiv): https://arxiv.org/abs/2602.15763
- Documentación de la API en Z.ai: https://docs.z.ai/guides/llm/glm-5.3-flash
- Repositorio oficial de la serie GLM-5: https://github.com/zai-org/GLM-5
- Comunidad en Discord: https://discord.gg/QR7SARHRxK
- Documentación de la arquitectura en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm5_next.md
- Receta de SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3-Flash
- Receta de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3-Flash
- TokenSpeed (LightSeek): https://lightseek.org/tokenspeed/recipes/models#glm-5-3-flash
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.3-Flash-Tutorial.md
- Guía de Unsloth: https://unsloth.ai/docs/models/glm-5.3
- AutomationBench (PR #13, corrección de tipos `null`): https://github.com/zapier/AutomationBench/pull/13
