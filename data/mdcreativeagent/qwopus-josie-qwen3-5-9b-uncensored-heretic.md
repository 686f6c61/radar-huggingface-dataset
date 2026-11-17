# mdcreativeagent/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-Heretic

## Resumen

Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-Heretic es un modelo de lenguaje y vision de 9.653 millones de parametros publicado por mdcreativeagent (bajo la marca Spale) y construido sobre Qwen/Qwen3.5-9B. Se trata de una fusion de dos fine-tunes del modelo base: Qwopus3.5-9B-v3, orientado a razonamiento, y JOSIE-2-9B-OSS, combinados mediante la tecnica DELLA con una ponderacion aproximada de 70/30. Posteriormente se le aplico una ablacion de rechazos con Heretic 2.1.0 (Arbitrary-Rank Ablation) para eliminar el comportamiento de negativa a responder.

El modelo resuelve dos problemas concretos: por un lado, mejora el rendimiento en razonamiento respecto al Qwen3.5-9B original (MMLU-Pro pasa de 59.5 a 73.8), y por otro elimina la alineacion de seguridad, reduciendo los rechazos de 100/100 a 6/100 en el conjunto de prueba de Heretic. Mantiene la capacidad multimodal texto-imagen del modelo base mediante un encoder visual separado en formato GGUF (mmproj) y conserva el modo de razonamiento (thinking mode) con una reduccion del 29% en tokens de razonamiento.

Es relevante para desarrolladores e investigadores que necesitan un modelo de 9B con vision, contexto largo y sin restricciones de contenido para tareas de generacion creativa, investigacion sobre alineacion o aplicaciones donde los rechazos del modelo base resultan un obstaculo. La licencia Apache 2.0 y la disponibilidad de pesos completos en bf16 y GGUF facilitan su despliegue tanto en transformers como en llama.cpp y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), multimodal texto-imagen |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configuracion recomendada en llama.cpp); contexto nativo del base no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF), F16 (encoder visual), bf16 (safetensors); cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible (la model card no detalla idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 19,3 GB), GGUF (Q8_0 9,79 GB + mmproj F16 0,92 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de 9,65 mil millones de parametros con capacidad multimodal texto-imagen. Sobre esa base se fusionaron dos fine-tunes: Qwopus3.5-9B-v3 (peso aproximado del 70%, orientado a razonamiento) y JOSIE-2-9B-OSS (peso aproximado del 30%). La fusion se realizo con DELLA, una tecnica de merge que combina los deltas de los fine-tunes respecto al modelo base en lugar de interpolar directamente los pesos, lo que permite preservar mejor las capacidades adquiridas por cada uno. No se dispone de informacion sobre el numero de tokens de entrenamiento ni la composicion de los datasets de los fine-tunes originales.

Tras la fusion se aplico Heretic 2.1.0 con Arbitrary-Rank Ablation para eliminar los rechazos. El proceso evaluo 100 trials midiendo rechazos y divergencia KL respecto a la fusion; se selecciono el trial 98 (6/100 rechazos, KL 0.0126) tras descartar el trial 57 (3/100 rechazos, KL 0.024) porque, pese a tener mejor metrica de ablacion, degradaba el razonamiento largo (HumanEval 90.0, MMLU-Pro 71.4). Todo el proceso se ejecuto en una unica RTX 3060 de 12 GB. El modelo conserva el modo de razonamiento del base, pero genera aproximadamente un 29% menos de tokens por respuesta, lo que reduce el problema de respuestas inacabadas que el original presentaba en 27 de 84 preguntas de MMLU-Pro al limite de 12.000 tokens.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo thinking activable.
- Entrada de imagenes junto con texto (pipeline image-text-to-text), mediante el encoder visual mmproj en GGUF.
- Generacion de codigo: HumanEval pass@1 de 95.0 en la evaluacion del autor.
- Razonamiento matematico: GSM8K de 95.0.
- Respuesta a preguntas de conocimiento general y profesional: MMLU-Pro de 73.8.
- Seguimiento de instrucciones: IFEval prompt-level strict de 81.7.
- Comportamiento sin alineacion de seguridad: 6/100 rechazos en el conjunto harmful_behaviors de Heretic.
- Compatibilidad con llama.cpp, LM Studio y transformers; tag endpoints_compatible en Hugging Face.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Capacidades de agente y multi-step reasoning: no disponible (no se documentan explicitamente).
- Capacidades multilingues: no disponible (no se detallan idiomas).
- Capacidades de audio: no disponibles.

## Casos de uso

- Generacion creativa sin restricciones: el modelo responde a practicamente cualquier prompt (6/100 rechazos) y es adecuado para ficcion, guiones o narrativa adulta donde el Qwen3.5-9B original rechazaria la peticion. La licencia Apache 2.0 permite uso comercial.
- Investigacion sobre alineacion y abliteration: sirve como caso de estudio reproducible de fusion DELLA mas ablacion Heretic, con metricas de rechazo y divergencia KL documentadas, para analizar el coste en capacidades de eliminar la alineacion.
- Asistente multimodal en local: con el encoder mmproj y Q8_0 en una RTX 3060 de 12 GB, permite describir imagenes, responder preguntas sobre capturas o extraer informacion de documentos escaneados sin conexion a servicios en la nube.
- Razonamiento con contexto largo: los 32.768 tokens de contexto configurados en llama.cpp permiten analizar documentos extensos, codigo de varios ficheros o transcripciones largas manteniendo el hilo de razonamiento.
- Generacion de codigo en pipelines locales: con HumanEval de 95.0 y despliegue via llama-server, puede integrarse en flujos de autocompletado o generacion de tests en entornos con GPU consumer, usando temperatura 0.6 sin penalizacion de presencia para codigo.
- Evaluacion comparativa de merges: util para investigadores que quieran contrastar el rendimiento de una fusion 70/30 con DELLA frente al modelo base en GSM8K, MMLU-Pro, HumanEval e IFEval con la misma configuracion de decodificacion.
- Prototipado de agentes conversacionales sin filtros: en entornos controlados donde se necesita un modelo que no bloquee peticiones sensibles (por ejemplo, simulacion de escenarios de ciberseguridad o red teaming), con guardrails externos añadidos por el desarrollador.

## Benchmarks y rendimiento

Resultados publicados por el autor. Los tres modelos se ejecutaron como GGUF Q8_0 en llama-server (b12422), con thinking activado, temperatura 1.0, top-p 0.95, top-k 20 y penalizacion de presencia 1.5 (temperatura 0.6 y sin penalizacion para codigo), maximo 12.000 tokens por respuesta. Una respuesta inacabada cuenta como incorrecta. El margen indicado es un error estandar.

| Benchmark | Preguntas | Qwen3.5-9B original | Fusion antes de Heretic | Este modelo |
|---|---|---|---|---|
| GSM8K | 60 | 96.7 ± 2.3 | 96.7 ± 2.3 | 95.0 ± 2.8 |
| MMLU-Pro | 84 (6 por categoria) | 59.5 ± 5.4 | 77.4 ± 4.6 | 73.8 ± 4.8 |
| HumanEval pass@1 | 60 | 98.3 ± 1.7 | 95.0 ± 2.8 | 95.0 ± 2.8 |
| IFEval, prompt-level strict | 60 | 88.3 ± 4.1 | 85.0 ± 4.6 | 81.7 ± 5.0 |
| Media | — | 85.7 | 88.5 | 86.4 |

Resultados de ablacion medidos por Heretic con el modelo en 4 bits (NF4) sobre 100 prompts daninos y 100 inofensivos:

| Metrica | Fusion antes de Heretic | Este modelo |
|---|---|---|
| Rechazos | 100/100 | 6/100 |
| Divergencia KL respecto a la fusion | 0 | 0.0126 |

El autor indica que el trial 57 (3/100 rechazos, KL 0.024) se descarto porque degradaba el razonamiento largo (HumanEval 90.0, MMLU-Pro 71.4), y que un trial mas suave en la frontera de Pareto mantenia 12/100 rechazos con KL 0.0082. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11,6 GB con contexto de 32.768 tokens, encoder visual mmproj y cuantizacion Q8_0 (dato medido por el autor en una RTX 3060 de 12 GB).
- Pesos completos en bf16: 19,3 GB, por lo que requieren al menos 24 GB de VRAM para inferencia comoda (RTX 3090, RTX 4090, A100 40 GB, H100).
- GGUF Q8_0 solo texto: 9,79 GB; sumado al mmproj F16 de 0,92 GB ocupa unos 10,7 GB en disco.
- Cabe en GPU consumer: RTX 3060 12 GB (configuracion validada por el autor), RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080, RTX 4090.
- Opciones de despliegue: llama.cpp (llama-server), LM Studio, transformers (safetensors bf16) y vLLM (mencionado por el autor para pesos completos).
- Ajuste de memoria: el autor recomienda añadir `-ctk q8_0 -ctv q8_0` para ampliar el contexto disponible en GPUs de 12 GB.
- Throughput estimado: 36 tokens/s con Q8_0 en una RTX 3060 (dato del autor).
- Latencia: no disponible de forma detallada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | HumanEval | Licencia | Multimodal |
|---|---|---|---|---|---|---|
| Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-Heretic | 9,65 B | 32.768 (config. recomendada) | 73.8 | 95.0 | Apache 2.0 | Si (texto-imagen) |
| Qwen3.5-9B original | 9,65 B | no disponible | 59.5 | 98.3 | no disponible en la informacion | Si (texto-imagen) |
| Fusion antes de Heretic (Qwopus + JOSIE con DELLA) | 9,65 B | no disponible | 77.4 | 95.0 | Apache 2.0 (presumible) | Si (texto-imagen) |

No se dispone de datos de benchmarks de otros modelos de 9B comparables (Llama, Gemma, Mistral) en la informacion proporcionada, por lo que no se incluyen en la tabla. La comparativa se limita a las tres variantes evaluadas por el autor con la misma configuracion.

## Limitaciones y advertencias

- Modelo sin alineacion de seguridad: se le ha eliminado el comportamiento de rechazo mediante abliteration. No debe desplegarse en produccion sin guardrails propios; el autor lo advierte explicitamente.
- Riesgo de contenido danino: la reduccion de rechazos a 6/100 implica que puede generar contenido que el modelo base bloquearia, incluyendo material sensible o potencialmente ilegal segun el uso.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3.5 y de fine-tunes de terceros, hereda los sesgos de sus datos de entrenamiento, no disponibles.
- Alucinacion: no se han publicado mediciones de factualidad ni de tasa de alucinacion; el modo thinking con 12.000 tokens maximos puede dejar respuestas inacabadas en tareas muy largas.
- Seguimiento de instrucciones debil: IFEval cae de 88.3 (original) a 81.7, y el autor reconoce que el instruction following y la escritura son los puntos mas flojos del modelo.
- Razonamiento degradado respecto a la fusion intermedia: MMLU-Pro baja de 77.4 a 73.8 y GSM8K de 96.7 a 95.0 tras la ablacion; el autor documenta que ablaciones mas agresivas degradan aun mas el razonamiento largo.
- Idiomas: no se especifican los idiomas soportados; no se garantiza un rendimiento multilingue equivalente al del base.
- Contexto: los 32.768 tokens son la configuracion recomendada en llama.cpp, no necesariamente el maximo nativo del modelo base; contextos mayores no estan validados.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 y los fine-tunes de origen pueden tener condiciones adicionales no detalladas en la model card; conviene verificar las licencias de los modelos base antes de un despliegue comercial.
- Reproducibilidad: los benchmarks se ejecutaron con 60-84 preguntas por prueba, lo que da margenes de error de 2-5 puntos; las diferencias entre variantes pueden no ser estadisticamente significativas en algunos casos.
- Fecha de creacion futura (2026-11-17) y cero descargas: modelo muy reciente y sin validacion independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mdcreativeagent/Qwopus-JOSIE-Qwen3.5-9B-UNCENSORED-Heretic
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Fine-tune Qwopus3.5-9B-v3: https://huggingface.co/Jackrong/Qwopus3.5-9B-v3
- Fine-tune JOSIE-2-9B-OSS: https://huggingface.co/Goekdeniz-Guelmez/JOSIE-2-9B-OSS
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Web del autor: https://spaleai.com
- Perfil del autor en X: https://x.com/spaleon_x
- GitHub del autor: https://github.com/spixyy7
- Discord del autor: https://discord.gg/udthV8ynMu
