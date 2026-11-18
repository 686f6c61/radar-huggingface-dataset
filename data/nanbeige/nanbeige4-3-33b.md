# Nanbeige/Nanbeige4.3-33B

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de 33.118.977.024 parámetros desarrollado por Nanbeige, concebido como modelo profesor (teacher model) de referencia dentro de la familia Nanbeige4.3. Su propósito es doble: por un lado, ofrecer un modelo desplegable de forma inmediata para tareas agénticas complejas de programación y trabajo profesional (cowork); por otro, servir de base para destilar capacidades agénticas avanzadas en modelos más pequeños de la misma serie, como el futuro Nanbeige4.3-3B. El modelo se distribuye bajo licencia Apache 2.0 y está afinado a partir de Nanbeige/Nanbeige4.3-33B-Base.

La propuesta de valor se centra en el rendimiento agéntico dentro de la clase de ~30B parámetros. Según la model card, supera a Qwen3.8-27B, Muse-Glimmer-30B y Gemma4-31B en la mayoría de benchmarks agénticos publicados, incluyendo Terminal-Bench, DeepSWE, SWE-Atlas-QnA y diversas pruebas de cowork como Automation Bench, JobBench o DeepPlanning. Está disponible en Hugging Face con formato safetensors, compatible con transformers y text-generation-inference, y con soporte declarado para inglés y chino.

El modelo incorpora una plantilla de chat configurable con modos de razonamiento y uso de herramientas (`enable_thinking`, `preserve_thinking`), lo que lo orienta claramente a flujos agénticos multi-paso. La información disponible no detalla la longitud de contexto, la composición del dataset de entrenamiento ni los detalles de la arquitectura interna más allá de la etiqueta `llama` y el pipeline de text-generation.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (etiqueta `llama` en Hugging Face); detalles internos no disponibles |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública describe el modelo como un transformer etiquetado como `llama` en Hugging Face, con 33.118.977.024 parámetros y un modelo base explícito (Nanbeige/Nanbeige4.3-33B-Base) sobre el que se ha realizado un afinado posterior. No se detalla en la documentación disponible el número de tokens de entrenamiento, la composición del corpus, ni si se emplearon técnicas de RLHF, DPO u otras variantes de alineación. Tampoco se especifican innovaciones arquitectónicas concretas como atención lineal, decodificación especulativa o arquitecturas híbridas.

Lo que sí se explicita es la estrategia de la familia Nanbeige4.3: construir primero un agente profesor de alta capacidad (este modelo de 33B) para después destilar sus capacidades agénticas en modelos más pequeños. La plantilla de chat incorpora parámetros configurables como `enable_thinking` (controla si el modelo razona antes de responder) y `preserve_thinking` (conserva el razonamiento en el historial), lo que sugiere un entrenamiento orientado a razonamiento explícito y uso de herramientas. Las evaluaciones publicadas se realizan con `preserve_thinking=true` y con el máximo esfuerzo de razonamiento.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento explícito configurable mediante el flag `enable_thinking` de la plantilla de chat.
- Razonamiento multi-paso y planificación en entornos agénticos (DeepPlanning, EnterpriseOps-Gym).
- Programación agéntica: resolución de tareas en terminal, ingeniería de software y generación de repositorios (Terminal-Bench, SWE-Bench Pro, NL2Repo, Scicode).
- Uso de herramientas (tool calling / function calling), evaluado en Toolathlon-Verified y Tau3-Bench.
- Ejecución de tareas profesionales de oficina y cowork (Automation Bench, JobBench, GDPval, Claw-Eval).
- Capacidad de operar con harnesses agénticos externos como mini-swe-agent, Claude Code o Terminus 2.
- Razonamiento científico y matemático de alto nivel (GPQA Diamond, AIME 2026, AA-LCR).
- No se declaran capacidades de visión, audio ni multimodalidad en la información disponible.

## Casos de uso

- Automatización de ingeniería de software en producción: el modelo puede integrarse en harnesses como mini-swe-agent o Claude Code para resolver issues, generar parches y navegar repositorios, con resultados destacados en SWE-Bench Pro (60,3) y NL2Repo (53,0).
- Agente de terminal y DevOps: con 80,9 en Terminal-Bench 2.1 y 23,8 en Terminal-Bench 4.0, es adecuado para tareas de administración de sistemas, diagnóstico de errores y ejecución de comandos en entornos controlados.
- Asistente de cowork para tareas de oficina: soporta flujos multi-paso con herramientas en escenarios como automatización de procesos (Automation Bench 54,2) y tareas profesionales por ocupación (JobBench 44,8), útil para asistentes internos que operan sobre CRM, correo o suites ofimáticas.
- Agente de atención al cliente con tool calling: su rendimiento en Tau3-Bench (48,8) y Toolathlon-Verified (70,4) lo hace apto para gestionar conversaciones multi-turno con invocación de APIs de reservas, pedidos o soporte.
- Razonamiento científico y matemático asistido: con 89,5 en GPQA Diamond y 95,2 en AIME 2026, puede emplearse en tutoría avanzada, verificación de demostraciones o generación de problemas técnicos.
- Planificación empresarial y simulación de negocio: DeepPlanning (63,3), EnterpriseOps-Gym (41,0) y YC-bench (1.025.437 USD simulados) lo orientan a agentes de planificación estratégica y simulación de decisiones.
- Modelo profesor para destilación: su papel declarado es servir de base para entrenar modelos pequeños de la familia Nanbeige4.3, por lo que es útil en pipelines internos de generación de datos sintéticos agénticos.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todos los modelos se evalúan con su máximo esfuerzo de razonamiento y el mismo harness e hiperparámetros.

| Categoria | Benchmark | Nanbeige4.3-33B | Qwen3.8-27B | Muse-Glimmer-30B | Gemma4-31B |
|---|---|---|---|---|---|
| Coding agéntico | Terminal-Bench 2.1 | 80,9 | 73,0 | 61,8 | 47,2 |
| Coding agéntico | Terminal-Bench 4.0 | 23,8 | 6,3 | 1,6 | 0,0 |
| Coding agéntico | DeepSWE | 65,5 | 42,5 | 4,4 | 2,7 |
| Coding agéntico | SWE-Bench Pro | 60,3 | 61,7 | 51,2 | 36,9 |
| Coding agéntico | SWE-Atlas-QnA | 50,8 | 41,9 | 17,7 | 3,3 |
| Coding agéntico | NL2Repo | 53,0 | 48,3 | 27,4 | 33,8 |
| Coding agéntico | Scicode | 52,6 | 46,7 | 44,9 | 45,5 |
| Coding agéntico | SkillsBench | 61,1 | 56,4 | 39,7 | 28,9 |
| Cowork agéntico | Automation Bench | 54,2 | 38,3 | 15,2 | 9,7 |
| Cowork agéntico | JobBench | 44,8 | 34,5 | 16,6 | 9,0 |
| Cowork agéntico | GDPval | 84,8 | 86,4 | 75,8 | 71,4 |
| Cowork agéntico | Claw-Eval (pass^3) | 78,3 | 75,2 | 57,3 | 44,2 |
| Cowork agéntico | Toolathlon-Verified | 70,4 | 68,5 | 47,2 | 27,8 |
| Cowork agéntico | DeepPlanning | 63,3 | 49,2 | 21,4 | 19,4 |
| Cowork agéntico | EnterpriseOps-Gym | 41,0 | 40,2 | 30,5 | 27,3 |
| Cowork agéntico | YC-bench | 1.025.437 USD | 641.290 USD | 513.978 USD | 265.152 USD |
| Cowork agéntico | Tau3-Bench | 48,8 | 48,5 | 33,7 | 18,6 |
| Razonamiento | GPQA Diamond | 89,5 | 89,2 | 83,5 | 91,3 |
| Razonamiento | AIME 2026 | 95,2 | 94,5 | 94,7 | 89,2 |
| Razonamiento | AA-LCR | 84,0 | 82,0 | 83,3 | 72,0 |

Nanbeige4.3-33B lidera en 17 de los 20 benchmarks publicados; Qwen3.8-27B supera en SWE-Bench Pro y GDPval, y Gemma4-31B en GPQA Diamond.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 66 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requieren 80 GB o más por GPU para servir sin cuantizar.
- GPU recomendadas en BF16: A100 80 GB, H100 80 GB, H200 o configuraciones multi-GPU (por ejemplo, 2× A100 40 GB o 2× RTX 4090 con tensor parallelism).
- Cuantización: no se publican variantes GGUF, AWQ ni GPTQ en el repositorio; con cuantización a 8 bits podría reducirse a ~35 GB y a 4 bits a ~18-20 GB, pero estos valores son estimaciones y no están confirmados por el autor.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16; requeriría cuantización agresiva (4 bits) o sharding multi-GPU, sin soporte oficial documentado.
- Despliegue: compatible con transformers y text-generation-inference según los tags; también aparece `endpoints_compatible` y `deploy:azure`, lo que indica soporte para despliegue gestionado en Azure.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento agéntico |
|---|---|---|---|---|---|
| Nanbeige4.3-33B | 33,1B | no disponible | Apache 2.0 | Hugging Face | Líder en 17/20 benchmarks de la comparativa |
| Qwen3.8-27B | 27B (aprox.) | no disponible | no disponible | no disponible | Segundo en la mayoría; mejor en SWE-Bench Pro y GDPval |
| Muse-Glimmer-30B | 30B (aprox.) | no disponible | no disponible | no disponible | Claramente por debajo en coding y cowork |
| Gemma4-31B | 31B (aprox.) | no disponible | no disponible | no disponible | Mejor en GPQA Diamond; peor en coding agéntico |

Las cifras de parámetros, contexto y licencia de los modelos comparados no se detallan en la información proporcionada; solo se dispone de sus resultados en los benchmarks publicados por Nanbeige.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Contexto: no se publica la longitud de ventana, lo que impide planificar despliegues con requisitos de contexto largo.
- Razonamiento: las evaluaciones se realizan con `preserve_thinking=true` y máximo esfuerzo; el rendimiento en modo sin razonamiento no se reporta.
- Sesgos: no se documentan análisis de sesgo, toxicidad o alineación más allá de la licencia y el pipeline declarado.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de fidelidad factual; al ser un modelo orientado a agentes, conviene validar acciones antes de ejecutarlas en producción.
- Licencia: Apache 2.0 permite uso comercial, pero no se ofrecen garantías ni cláusulas de responsabilidad específicas más allá de las del modelo base.
- Despliegue: no hay variantes cuantizadas oficiales ni guías de serving detalladas; el tamaño de 66,3 GB en safetensors exige infraestructura considerable.
- Benchmarks propios: todos los resultados proceden de la model card del autor, con harness y rúbricas elegidos por el propio desarrollador (incluido el uso de GPT-6 Sol como juez en SWE-Atlas-QnA), por lo que conviene tratarlos con cautela hasta que existan evaluaciones independientes.

## Enlaces

- Hugging Face: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
