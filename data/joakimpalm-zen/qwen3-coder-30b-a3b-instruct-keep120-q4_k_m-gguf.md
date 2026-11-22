# Joakimpalm-Zen/Qwen3-Coder-30B-A3B-Instruct-keep120-Q4_K_M-GGUF

## Resumen
Qwen3-Coder-30B-A3B-Instruct-keep120-Q4_K_M-GGUF es una cuantización GGUF Q4_K_M de un derivado estructuralmente podado de Qwen/Qwen3-Coder-30B-A3B-Instruct, publicado por el usuario Joakimpalm-Zen bajo el paraguas de su proyecto Xyntetik Runner. El modelo base es un transformer MoE de la familia Qwen3MoE, orientado a generación de código y conversación, del que este derivado conserva 120 de los 128 expertos por capa (podado de expertos), manteniendo los tensores de expertos en precisión nativa Q4_K/Q6_K.

El interés de esta ficha no está tanto en el modelo en sí (que es una variante podada de un modelo ya conocido) como en el ecosistema que lo acompaña: el autor lo empaqueta para servirse con xyntetik-runner, un motor de inferencia C11 de binario único con servidor compatible con OpenAI, y documenta un comportamiento diferencial en la recuperación de tool calls truncados por presupuesto de tokens. Es, por tanto, un artefacto relevante para quienes despliegan agentes locales con modelos Qwen3-Coder y necesitan que las llamadas a herramientas no se rompan cuando se agota el contexto.

El repositorio ocupa 17,5 GB y el modelo declara 28.719.396.864 parámetros totales en safetensors (aproximadamente 28,7 mil millones), coherente con la nomenclatura "30B-A3B" del modelo base, donde A3B indica unos 3 mil millones de parámetros activos por token en el esquema MoE original. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3MoE), derivado estructuralmente podado (120 de 128 expertos por capa) |
| Parametros totales | 28.719.396.864 (según safetensors del modelo) |
| Parametros activos | no disponible (el nombre del modelo base sugiere ~3B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (fichero publicado); expertos en Q4_K/Q6_K nativos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo es un derivado estructural del Qwen3-Coder-30B-A3B-Instruct: no se ha reentrenado, sino que se ha aplicado podado de expertos (expert pruning) sobre el MoE original, conservando 120 de los 128 expertos de cada capa. El autor indica que el plan de podado (un JSON) acompaña al fichero y que el derivado "pasa tanto el listón original como el actual", es decir, supera los criterios de validación definidos por el proyecto. Los tensores de expertos se mantienen en su precisión nativa Q4_K/Q6_K, lo que explica el tamaño de 17,5 GB del repositorio.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre etapas de RLHF/DPO aplicadas en este derivado; esos datos pertenecen al modelo base Qwen3-Coder-30B-A3B-Instruct y no se detallan en la información proporcionada. La innovación destacable de este artefacto es de despliegue, no de entrenamiento: el motor xyntetik-runner implementa recuperación de truncamiento forzado en tool calls, cerrando un documento JSON a la versión mínima legal según el esquema cuando se agota el presupuesto de tokens, de modo que los argumentos siguen siendo parseables.

## Capacidades
- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-Coder.
- Generación y razonamiento sobre código, dado el origen Qwen3-Coder del modelo padre.
- Tool calling / function calling con protocolo nativo de Qwen3-Coder, soportado por xyntetik-runner desde la versión 0.5.3.
- Recuperación de tool calls truncados: el runtime cierra la llamada a un documento conforme al esquema cuando se agota el presupuesto, devolviendo `tool_calls` ejecutables en lugar de contenido vacío o malformado.
- Decodificación restringida (constrained decoding) que mantiene la forma de la llamada bajo cuantización; según la model card, la conformidad de esquema y la selección de herramienta se mantuvieron al 100 % hasta Q4_0, con decaimiento de la coincidencia de argumentos hasta el 50 %.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso
- Agentes de código locales: el modelo puede ejecutar bucles de agente con llamadas a herramientas en una máquina de ~20 GB de memoria, usando xyntetik-runner como servidor compatible con OpenAI; el cierre legal de tool calls truncados evita reintentos completos del bucle.
- Asistentes de programación en estación de trabajo: al ser un GGUF Q4_K_M de 17,5 GB, encaja en equipos con 20 GB de memoria utilizable, permitiendo autocompletado y generación de parches sin depender de API externa.
- Pipelines de CI/CD con presupuesto de tokens acotado: la recuperación de truncamiento garantiza que las llamadas a herramientas generadas para invocar linters, tests o scripts de despliegue sigan siendo parseables aunque el presupuesto se agote.
- Evaluación de técnicas de podado de expertos: el fichero y su plan JSON sirven como caso de referencia para investigar el impacto del podado 120/128 sobre un MoE de código, comparándolo con el modelo padre.
- Servicio de inferencia compatible con OpenAI en infraestructura propia: el binario único de xyntetik-runner (CPU/CUDA/Metal) permite levantar un endpoint `/v1` sin dependencias, útil en entornos restringidos.
- Investigación sobre cuantización y decodificación restringida: el autor publica una escalera de cuantizaciones y mediciones de conformidad de esquema, lo que facilita reproducir experimentos sobre robustez de tool calling bajo cuantización agresiva.
- Despliegue en hardware modesto con expectativas ajustadas: para máquinas por debajo de 20 GB, la propia model card recomienda empezar con un modelo menor (gemma-4-E2B-it-Q4_0) en lugar de este fichero.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

La model card incluye únicamente mediciones de comportamiento de tool calling truncado por motor de inferencia, no benchmarks de calidad del modelo. Se reproducen a continuación por su relevancia para el despliegue:

| Motor | Presupuesto insuficiente (1–16 tokens) | Presupuesto suficiente (64, control) |
|---|---|---|
| Runner | `tool_calls` ejecutables, argumentos parseables | completa |
| vLLM 0.27.1 | sin llamada; el framing del protocolo se filtra en `content` | completa |
| llama.cpp b10488 | sin llamada; filtración y luego `tool_calls` con argumentos no parseables | completa |
| Ollama 0.32.14 | sin llamada; contenido vacío y luego HTTP 500 | completa |
| TensorRT-LLM 1.2.1 (medido con sustituto Qwen3-1.7B) | sin llamada; filtración de `<tool_call>` y contenido vacío | completa |
| SGLang 0.5.17 (medido con sustituto Qwen3-1.7B) | sin llamada; filtración de `<tool_call>` y contenido vacío | completa |

## Requisitos de hardware
- Memoria: el fichero pesa 17,5 GB; el autor recomienda una máquina con aproximadamente 20 GB de memoria utilizable o más.
- VRAM estimada: no disponible de forma explícita; por el tamaño del fichero, se requiere del orden de 17,5 GB para los pesos más overhead de contexto y runtime.
- GPU recomendadas: no disponibles en la información proporcionada; el motor soporta CPU, CUDA y Metal.
- ¿Cabe en GPU de consumo? No se confirma en la información proporcionada; el requisito declarado es de memoria utilizable (~20 GB), lo que deja fuera la mayoría de GPU de consumo con 8–16 GB.
- Opciones de despliegue: xyntetik-runner (binario único C11, servidor compatible con OpenAI, CPU/CUDA/Metal) es el motor para el que el fichero está construido. Otros motores GGUF no se detallan en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct-keep120 Q4_K_M (este) | 28,7B totales (120/128 expertos) | no disponible | Apache 2.0 | GGUF Q4_K_M | Podado de expertos; optimizado para xyntetik-runner |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (padre) | ~30B (A3B activos) | no disponible | Apache 2.0 | safetensors | Modelo original sin podado; referencia de calidad |
| gemma-4-E2B-it-Q4_0 (recomendado por el autor para equipos pequeños) | no disponible | no disponible | no disponible | GGUF Q4_0 | Alternativa para máquinas con menos de 20 GB |

La comparación de rendimiento frente a estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias
- El modelo es un derivado podado: se han eliminado 8 de los 128 expertos por capa, lo que puede degradar capacidades respecto al modelo padre en dominios poco representados; no se publican métricas de calidad que cuantifiquen esa pérdida.
- La model card no documenta sesgos conocidos ni evaluación de alucinación; al ser un derivado de un modelo de código, cabe esperar los riesgos habituales de generación de código plausible pero incorrecto, sin datos concretos que lo respalden.
- Idiomas soportados no declarados: no se puede confirmar el comportamiento multilingüe de este derivado.
- Longitud de contexto no declarada en la información disponible, lo que impide planificar despliegues con prompts largos sin verificación empírica.
- La decodificación restringida garantiza la forma de la llamada, no su contenido: la propia model card señala que la coincidencia de argumentos decae hasta el 50 % en Q4_0, por lo que las llamadas pueden ser sintácticamente válidas pero semánticamente erróneas.
- Las mediciones de truncamiento comparan motores, pero dos de ellos (TensorRT-LLM y SGLang) se midieron con un sustituto Qwen3-1.7B; el propio autor aclara que la recuperación de truncamiento es propiedad del runtime, no del modelo.
- Dependencia de un runtime concreto: el fichero está construido para xyntetik-runner y su comportamiento diferencial en tool calling no se reproduce en otros motores.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y atribuir correctamente; la información proporcionada no incluye avisos adicionales del autor.
- El repositorio incluye enlaces de donación y peticiones de contribución; son material promocional del autor y no afectan a la licencia, pero conviene separarlos de la documentación técnica.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Joakimpalm-Zen/Qwen3-Coder-30B-A3B-Instruct-keep120-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio de xyntetik-runner: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Documentación de modelos y conversión de xyntetik-runner: https://github.com/Joakimpalm-Zen/xyntetik-runner#models-and-conversion
- Benchmark de truncamiento: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/truncation-benchmark.md
- Roster de soporte del modelo: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/model-support.md#qwen3-coder-30b-a3b-instruct-keep120-q4_k_m
- Resultados de la comunidad: https://github.com/Joakimpalm-Zen/xyntetik-runner/blob/main/docs/community-results.md
- Colección Runner Releases: https://huggingface.co/collections/Joakimpalm-Zen/runner-releases-6aa98baaed03bba0e8a561ae
- Colección Pruning and Quantization Frontiers: https://huggingface.co/collections/Joakimpalm-Zen/xyntetik-research-pruning-and-quantization-frontiers-6aa98badc3307048c060ebe2
- Caso negativo de contraste (Nemotron prune frontier): https://huggingface.co/datasets/Joakimpalm-Zen/Nemotron-3.5-Lightning-30B-A3B-prune-frontier-report
- Alternativa para equipos pequeños: https://huggingface.co/Joakimpalm-Zen/gemma-4-E2B-it-Q4_0-GGUF
- Perfil del autor en Hugging Face: https://huggingface.co/Joakimpalm-Zen
