# mradermacher/Qwythos-9B-Claude-Mythos-Uncensored-Abliterated-1M-GGUF

## Resumen

Qwythos-9B-Claude-Mythos-Uncensored-Abliterated-1M es un modelo de lenguaje de 9 000 millones de parametros, desarrollado originalmente por Securelayer7 y cuantizado a formato GGUF por mradermacher. Se trata de una version "abliterada" (sin censura) del modelo Qwythos-9B-Claude-Mythos, que a su vez es una destilacion de parametros completos de Claude Mythos 5 sobre la base Qwen3.5-9B. El modelo ofrece una ventana de contexto de 1 millon de tokens y capacidades nativas de tool calling y function calling.

La relevancia de este modelo reside en la combinacion de razonamiento avanzado con verificacion interna del propio trabajo, contexto extremadamente largo y ausencia de rechazos (refusals), lo que lo hace util para tareas de investigacion, generacion creativa sin restricciones y agentes conversacionales. La cuantizacion GGUF permite ejecutarlo en hardware de consumo con perdidas minimas de rendimiento, y el proceso de abliteracion mediante la libreria Heretic reduce adicionalmente los comportamientos de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-9B) |
| Parametros totales | 9 000 millones (9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1 000 000 tokens (1M) |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible (la base Qwen3.5 es multilingue) |
| Licencia | no disponible (la version MTP relacionada usa Apache-2.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3.5-9B, destilado a partir de Claude Mythos 5 mediante un proceso de destilacion de parametros completos (full-parameter distillation). Segun el articulo de Empero, el modelo base Qwythos-9B logra un incremento de +34 puntos en MMLU respecto a su base Qwen3.5-9B, lo que indica una mejora sustancial en razonamiento y conocimiento general.

La version "Uncensored-Abliterated" se ha sometido a un proceso de abliteracion mediante la libreria Heretic, que elimina los rechazos y negativas del modelo, reduciendo las refusal behaviors. El modelo ha sido ademas ajustado con SFT (supervised fine-tuning) y soporta tool calling y function calling de forma nativa, segun los tags del modelo relacionado en HuggingFace. No se dispone de informacion detallada sobre la composicion del dataset de entrenamiento ni el numero exacto de tokens utilizados.

## Capacidades

- Generacion de texto y razonamiento avanzado con verificacion interna del propio trabajo (self-checking)
- Razonamiento multi-paso y modo "thinking" heredado de la base Qwen3.5
- Tool calling y function calling nativo, integrable en pipelines de agentes
- Capacidades de agente conversacional multi-turno
- Contexto largo de 1M tokens para procesamiento de documentos extensos en una sola pasada
- Generacion creativa sin restricciones (uncensored) gracias al proceso de abliteracion
- Capacidades multilingues heredadas de Qwen3.5 (idiomas no especificados en la model card)
- Dominios de ciberseguridad y biomedicina mencionados en los tags del modelo relacionado

## Casos de uso

- Analisis de documentos extensos: con 1M tokens de contexto, el modelo puede procesar libros completos, codebases enteros o expedientes legales en una sola pasada, extrayendo informacion y resumiendo sin necesidad de chunking ni tecnicas de RAG complejas.
- Agentes conversacionales sin restricciones: la version abliterada permite desplegar asistentes que no rechacen temas delicados, util en entornos de investigacion donde se necesita explorar escenarios hipoteticos, debates filosoficos o contenido controvertido sin filtros.
- Generacion de codigo en produccion: con tool calling nativo, puede integrarse en pipelines de CI/CD para generar, revisar y corregir codigo automaticamente, aprovechando su capacidad de razonamiento para detectar errores logicos.
- Investigacion en ciberseguridad: el modelo puede analizar exploits, escribir scripts de pentesting y documentar vulnerabilidades sin las restricciones habituales de los modelos comerciales, acelerando el trabajo de equipos de seguridad ofensiva.
- Asistencia biomedica: segun los tags del modelo relacionado, tiene capacidades para el dominio biomedico, pudiendo ayudar en revision de literatura cientifica, redaccion de documentacion tecnica y analisis de datos de investigacion.
- Creacion de contenido creativo: la combinacion de estilo "Claude Mythos" y ausencia de censura permite generar narrativa, guiones y contenido literario sin limitaciones tematicas, manteniendo coherencia en textos largos gracias al contexto de 1M tokens.
- RAG (Retrieval-Augmented Generation) con contexto largo: la ventana de 1M tokens permite indexar grandes volumenes de conocimiento corporativo y responder preguntas con contexto completo, reduciendo la dependencia de sistemas de recuperacion externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta version abliterada en la informacion disponible. El articulo de Empero sobre el modelo base Qwythos-9B menciona un incremento de +34 puntos en MMLU respecto a Qwen3.5-9B, pero no se proporcionan cifras absolutas ni resultados para la version uncensored. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: f16 ~18 GB, Q8_0 ~9,5 GB, Q6_K ~7,5 GB, Q5_K_M ~6,5 GB, Q4_K_M ~5,5 GB, Q3_K_M ~4,5 GB, Q2_K ~3,5 GB
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4/Q5; RTX 4090 o A100 para f16 y Q8_0
- Cabe en GPUs de consumo: si, con cuantizacion Q4_K_M o inferior en GPUs con 8-12 GB de VRAM; Q2_K puede ejecutarse en GPUs con 4-6 GB
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversion previa a safetensors)
- Latencia estimada: 20-40 tokens/s en RTX 4090 con Q4_K_M; no se dispone de datos oficiales de throughput

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwythos-9B (este) | 9B | 1M | no disponible | Abliterado, destilado de Claude Mythos 5, tool calling |
| Qwen3-8B | 8B | 32K-128K | Apache-2.0 | Base similar, con censura, sin abliteracion |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 | Contexto menor, sin tool calling nativo en 8B |
| Mistral-7B | 7B | 32K | Apache-2.0 | Menor contexto y capacidades de razonamiento |

## Limitaciones y advertencias

- La abliteracion elimina los rechazos pero no garantiza la ausencia de sesgos; el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros, lo que requiere supervision humana en entornos de produccion.
- Riesgo de alucinacion: como todo modelo de 9B, puede inventar hechos, especialmente en tareas de razonamiento complejo o con contexto muy largo; la verificacion interna del trabajo no elimina este riesgo.
- La licencia no esta especificada en la model card de esta version; antes de usar en produccion comercial, verificar la licencia del modelo original en Securelayer7 y la del modelo base Qwen3.5.
- El proceso de abliteracion puede degradar ligeramente el rendimiento en tareas de seguridad, alineacion y seguimiento de instrucciones, respecto al modelo original con censura.
- No se dispone de informacion sobre los idiomas soportados ni la composicion del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en lenguas distintas del ingles.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un lanzamiento reciente o poco probado por la comunidad; se recomienda validar su comportamiento antes de adoptarlo.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Qwythos-9B-Claude-Mythos-Uncensored-Abliterated-1M-GGUF
- Modelo original (Securelayer7): https://huggingface.co/Securelayer7/Qwythos-9B-Claude-Mythos-Uncensored-Abliterated-1M
- Version MTP relacionada: https://huggingface.co/mradermacher/Qwythos-9B-Claude-Mythos-5-1M-MTP-GGUF
- Version MTP i1: https://huggingface.co/mradermacher/Qwythos-9B-Claude-Mythos-5-1M-MTP-i1-GGUF
- Version abliterada en Ollama: https://ollama.com/richardyoung/qwythos-9b-abliterated
- Articulo de Empero sobre Qwythos-9B: https://empero.org/writing/qwythos-9b-release
- Empero (laboratorio de investigacion): https://empero.org/
