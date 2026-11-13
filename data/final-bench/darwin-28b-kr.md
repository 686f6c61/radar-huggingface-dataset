# FINAL-Bench/Darwin-28B-KR

## Resumen

Darwin-28B-KR es un modelo de lenguaje multimodal especializado en coreano, desarrollado por el laboratorio FINAL-Bench con la colaboracion de VIDRAFT. Se construye sobre la arquitectura Qwen3.5 (Qwen3_5ForConditionalGeneration, atencion hibrida full + linear) y se distribuye como un modelo de aproximadamente 28.000 millones de parametros (26.895.998.464 reales segun los pesos en safetensors). Su proposito es servir como modelo madre de segunda generacion de la familia Darwin, combinando capacidades de razonamiento en ingles con competencia nativa en coreano y comprension multimodal de imagenes y video.

El modelo no se entrena desde cero: es el resultado de un merge evolutivo (Darwin V7 MRI-aware merge) entre Darwin-28B-Opus (rama inglesa y multimodal) y Darwin-27B-KR (rama coreana especializada, con un 79,59 % en el benchmark CLIcK). La innovacion declarada consiste en preservar al 100 % el "canal de salida coreano" del modelo madre mientras se heredan las capacidades de razonamiento y vision del padre.

Es relevante ahora porque cubre un nicho poco atendido: modelos de escala media-alta (28B) con especializacion real en coreano y multimodalidad, bajo licencia Apache 2.0, y planteado como base para una familia de variantes de dominio (legal, medico, financiero, codigo). Su contexto operativo declarado es de 8K a 32K tokens segun el entorno de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer hibrido: atencion full + linear attention) |
| Parametros totales | 26.895.998.464 (~28B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 8K-32K segun entorno de despliegue |
| Tipos de cuantizacion | no disponible (el autor menciona una variante futura MFP4; no se documentan GGUF ni AWQ) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, ~53 GB en disco; repo de 110,3 GB) |
| Hidden size | 5120 |
| Numero de capas | 64 |
| Tamano de vocabulario | 248.320 |
| Modalidades de entrada | texto, imagen y video (image-text-to-text) |
| Libreria | transformers |
| Modelo base | FINAL-Bench/Darwin-28B-Opus y FINAL-Bench/Darwin-27B-KR |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.5, un transformer con atencion hibrida que combina capas de atencion completa con capas de atencion lineal, lo que reduce el coste computacional en secuencias largas. El modelo tiene 64 capas, hidden size de 5120 y un vocabulario de 248.320 tokens, con pesos en bfloat16. Al ser un modelo condicional para generacion, admite entradas de texto e imagen (y video, segun la model card).

El entrenamiento no sigue un pipeline clasico de preentrenamiento mas RLHF documentado. El autor describe un proceso de "merge evolutivo" (Darwin V7) en dos etapas: primero una fusion evolutiva que da lugar a Darwin-28B-Opus y Darwin-27B-KR a partir de Darwin-27B-Opus (este ultimo derivado de Qwen3.5-27B); despues un merge "MRI-aware" que combina ambas ramas preservando integramente el canal de salida en coreano del modelo madre. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card menciona un ajuste de identidad propio ("identity tuning") realizado por VIDRAFT.

## Capacidades

- Generacion de texto y conversacion multi-turno en coreano e ingles.
- Razonamiento en coreano orientado a pruebas estandarizadas (CSAT, PSAT) y evaluaciones K-AI.
- Razonamiento en ingles heredado de la rama Darwin-28B-Opus.
- Comprension multimodal de imagenes y video, con descripcion y analisis en coreano.
- Traduccion y code-switching coreano-ingles.
- Escritura, resumen y creacion de contenido en coreano.
- Respuesta a conocimiento cultural, historico y legal coreano.
- Autoconciencia de identidad (el modelo se identifica como Darwin-28B-KR de VIDRAFT).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede mantener conversaciones multi-turno con contexto de hasta 32K tokens, suficiente para incorporar historial de tickets y documentacion de producto, con salida nativa en coreano.
- Analisis de imagenes y video con explicacion en coreano: util para moderacion de contenido, catalogacion de material audiovisual o generacion de descripciones accesibles para plataformas coreanas.
- Generacion de contenido editorial y marketing en coreano: redaccion, resumen y adaptacion de tono gracias a su especializacion en expresion coreana.
- Tutoria educativa para examenes coreanos (CSAT/PSAT): el modelo declara razonamiento especifico para estas pruebas, lo que permite construir asistentes de resolucion explicada de problemas.
- Base para modelos de dominio: al ser el modelo madre de la familia, sirve como punto de partida para fine-tuning en legal, medico, financiero o codigo con comentarios en coreano.
- Traduccion y localizacion coreano-ingles: traduccion bidireccional con soporte de code-switching, adecuada para equipos bilingues o documentacion tecnica.
- Asistente de conocimiento cultural e historico coreano: respuesta a preguntas sobre patrimonio, normativa o tradiciones con contexto local.
- Despliegue via API compatible con OpenAI: la model card documenta `vllm serve` con endpoint `/v1`, lo que facilita integrarlo en aplicaciones existentes.

## Benchmarks y rendimiento

| Modelo | CLIcK (200 preguntas) |
|---|---|
| QuettaLLMs-27B-Koreasoner-V3 | 0,794 |
| Rogue-27B-KR | 0,791 |
| Darwin-28B-KR (este modelo) | 0,786 |
| AWAXIS-Think-28B | 0,770 |

El autor cita ademas un 79,59 % en CLIcK para el modelo madre Darwin-27B-KR. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM minima estimada: ~55 GB para inferencia en bfloat16 (pesos de ~53 GB mas overhead de KV cache).
- GPU recomendadas segun el autor: NVIDIA Blackwell (B200) como opcion optima, NVIDIA Hopper (H100/H200) como recomendada.
- NVIDIA Ada (L40S): calificada como "ajustada" con 53 GB en BF16; requiere cuidado con la memoria.
- GPUs Ampere antiguas: descartadas por VRAM insuficiente.
- No cabe en GPUs de consumo (RTX 4090 con 24 GB) en BF16; no se documentan cuantizaciones GGUF/INT4 que lo permitan, aunque el autor anuncia una futura variante MFP4.
- Despliegue: vLLM recomendado (`--trust-remote-code --enforce-eager --max-model-len 8192 --gpu-memory-utilization 0.85`); tambien compatible con transformers y con clientes OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CLIcK | Licencia | Notas |
|---|---|---|---|---|---|
| Darwin-28B-KR | ~28B | 8K-32K | 0,786 | Apache 2.0 | Multimodal, coreano-ingles, base de familia |
| QuettaLLMs-27B-Koreasoner-V3 | ~27B | no disponible | 0,794 | no disponible | Especializado en razonamiento coreano |
| Rogue-27B-KR | ~27B | no disponible | 0,791 | no disponible | Especializado en coreano |
| AWAXIS-Think-28B | ~28B | no disponible | 0,770 | no disponible | Orientado a razonamiento |

Darwin-28B-KR se situa en el pelotón de cabeza del ranking CLIcK citado, ligeramente por debajo de QuettaLLMs y Rogue, pero con la ventaja de ofrecer multimodalidad y una licencia Apache 2.0 explicita.

## Limitaciones y advertencias

- Especializacion estrecha: fuera del coreano y el ingles el rendimiento no esta garantizado ni documentado.
- Riesgo de alucinacion: no se documentan tasas de fidelidad ni evaluaciones de factualidad; como modelo generativo, puede producir contenido incorrecto, especialmente en dominios especializados.
- Sesgos: no se publica informacion sobre sesgos demograficos, culturales o politicos; el sesgo derivado de los datos de Qwen3.5 y de los merges es desconocido.
- Contexto limitado en la practica: aunque se declara hasta 32K, la configuracion recomendada de vLLM usa `--max-model-len 8192`, lo que sugiere que el contexto largo puede degradar rendimiento o memoria.
- Requisitos de hardware elevados: no es desplegable en GPUs de consumo en BF16; la falta de cuantizaciones publicadas limita su adopcion en infraestructura modesta.
- Dependencia de `--trust-remote-code`: implica ejecutar codigo del repositorio, con el riesgo de seguridad asociado en entornos de produccion.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5 conviene verificar las condiciones heredadas de la cadena de modelos base.
- Madurez: el modelo se publico en abril de 2026 y se actualizo en noviembre de 2026, con solo 31 descargas; el ecosistema y la validacion externa son todavia escasos.
- Las variantes de dominio (legal, medico, financiero, codigo) estan anunciadas pero no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-28B-KR
- Modelo padre: https://huggingface.co/FINAL-Bench/Darwin-28B-Opus
- Modelo madre: https://huggingface.co/FINAL-Bench/Darwin-27B-KR
- Paper de la familia Darwin: https://huggingface.co/papers/2605.14386 (arXiv:2605.14386)
