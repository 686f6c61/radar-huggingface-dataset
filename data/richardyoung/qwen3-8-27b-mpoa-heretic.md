# richardyoung/Qwen3.8-27B-MPOA-heretic

## Resumen

Qwen3.8-27B-MPOA-heretic es una variante "decensored" del modelo multimodal Qwen3.8-27B, publicada por el usuario richardyoung mediante la herramienta Heretic v2.0.0. El objetivo declarado es eliminar los mecanismos de rechazo del modelo original aplicando una tecnica denominada Magnitude-Preserving Orthogonal Ablation (MPOA), que actua sobre las proyecciones `attn.o_proj` y `mlp.down_proj` de la red. Segun la model card, los rechazos caen de 98/100 en el modelo original a 25/100 en esta variante, con una divergencia KL de 0,0854 respecto al original.

El modelo base es un transformer causal denso de 27.356.728.560 parametros (27B) con codificador de vision, disenado para tareas de image-text-to-text. Emplea una arquitectura hibrida con capas de atencion lineal Gated DeltaNet combinadas con capas de atencion con compuerta (Gated Attention), 64 capas en total, dimension oculta de 5120 y un contexto nativo de 262.144 tokens extensible hasta 1.000.000. Incorpora Multi-Token Prediction (MTP) entrenado en varios pasos.

La relevancia de esta publicacion es doble: por un lado, permite evaluar el comportamiento de un modelo multimodal de ultima generacion sin los filtros de seguridad del autor original; por otro, el autor afirma que el proceso es reproducible, lo que facilita la auditoria del metodo de ablacion. La licencia Apache 2.0 del modelo base se mantiene en esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de vision; layout hibrido 16 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 27.356.728.560 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |
| Dimension oculta | 5120 |
| Numero de capas | 64 |
| Embedding de tokens | 248.320 (padded) |
| Cabezas de atencion lineal (Gated DeltaNet) | 48 para V, 16 para QK; dimension de cabeza 128 |
| Cabezas de atencion con compuerta (Gated Attention) | 24 para Q, 4 para KV; dimension de cabeza 256 |
| Dimension de RoPE | 64 |
| Dimension intermedia FFN | 17.408 |
| MTP (Multi-Token Prediction) | Entrenado en multiples pasos |
| Tamano del repo | 54,8 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso que combina dos tipos de capas en un patron repetido 16 veces: tres bloques con Gated DeltaNet (atencion lineal) seguidos de un bloque con Gated Attention (atencion tradicional con compuerta). Esta hibridacion busca reducir el coste computacional del contexto largo manteniendo la calidad de recuperacion de informacion. La Gated DeltaNet emplea 48 cabezas para V y 16 para QK con dimension de cabeza 128, mientras que la Gated Attention usa 24 cabezas para Q y 4 para KV con dimension 256. El modelo incluye un codificador de vision que lo habilita para entrada image-text-to-text, y fue entrenado con MTP en varios pasos, lo que permite decodificacion especulativa nativa.

El modelo original pasa por preentrenamiento y postentrenamiento (los detalles de composicion del dataset, numero de tokens y uso de RLHF/DPO no se especifican en la informacion proporcionada). La variante heretic aplica MPOA sobre el modelo postentrenado: una ablacion ortogonal que preserva la magnitud de los pesos en `attn.o_proj` y `mlp.down_proj`, con parametros documentados (direction_index 50,02; pesos maximos y minimos por capa y sus posiciones). El autor publica un directorio `reproduce` con instrucciones para replicar el proceso, lo que constituye la innovacion metodologica mas destacable de esta ficha.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto y desactivable por peticion.
- Control de profundidad de razonamiento mediante el parametro `reasoning_effort`.
- Retencion de contexto de razonamiento de mensajes historicos mediante `preserve_thinking`.
- Comprension nativa de imagenes y videos (diagramas STEM, documentos, videos de hasta una hora).
- Generacion de codigo y tareas de trabajo profesional e investigacion.
- Ejecucion de agentes autonomos con planificacion multi-paso y manejo de retroalimentacion del entorno.
- Soporte de tool calling / function calling (integrado en el ecosistema Qwen; la model card menciona herramientas oficiales en la version alojada).
- Capacidades multilingues: no se detallan los idiomas concretos en la informacion disponible.
- Decodificacion especulativa nativa gracias al entrenamiento con MTP.
- Comportamiento "decensored": reduccion drastica de rechazos (25/100 frente a 98/100 del original).

## Casos de uso

- Atencion al cliente automatizada: el contexto nativo de 262.144 tokens permite gestionar conversaciones multi-turno muy largas o hilos con historial extenso sin truncamiento, y el modo thinking desactivable reduce latencia en respuestas simples.
- Generacion de codigo en produccion: el soporte de tool calling y la integracion con vLLM, SGLang y TokenSpeed permiten desplegarlo en pipelines de CI/CD para revision de codigo, generacion de tests o refactorizacion automatizada.
- Analisis de documentos tecnicos con imagenes: la comprension nativa de diagramas STEM y documentos permite extraer informacion de papers, planos o capturas de pantalla en flujos de investigacion.
- Procesamiento de video de larga duracion: la capacidad de entender videos de hasta una hora encaja en tareas de resumen de reuniones, analisis de grabaciones de vigilancia o extraccion de eventos en material audiovisual.
- Agentes autonomos de larga duracion: la planificacion multi-paso y el manejo de feedback del entorno lo hacen adecuado para tareas de automatizacion de navegador, gestion de incidencias o investigacion web con multiples saltos.
- Investigacion sobre alineacion y seguridad: al ser una variante reproducible con parametros de ablacion documentados, sirve para estudiar el efecto de eliminar rechazos sobre el comportamiento del modelo y medir la degradacion (KL 0,0854) respecto al original.
- Generacion de contenido creativo sin restricciones: para entornos donde se requiere producir texto sin filtros de seguridad del proveedor, con la advertencia de que el operador asume la responsabilidad del contenido generado.
- Despliegue en infraestructura propia: al ser un modelo denso de 27B con pesos safetensors y licencia Apache 2.0, puede servirse en clusters con GPUs de 80 GB mediante vLLM o SGLang.

## Benchmarks y rendimiento

La model card del autor solo publica metricas del proceso de ablacion, no benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K, etc.). La tabla de rendimiento del modelo base aparece truncada en la informacion proporcionada.

| Metrica | Este modelo | Modelo original (Qwen/Qwen3.8-27B) |
|---|---|---|
| Rechazos (Refusals) | 25/100 | 98/100 |
| Divergencia KL | 0,0854 | 0 (por definicion) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 54,8 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB por GPU.
- VRAM estimada en cuantizacion de 8 bits: en torno a 28-30 GB, viable en una RTX 4090 de 24 GB solo con cuantizaciones de 4 bits.
- VRAM estimada en cuantizacion de 4 bits: en torno a 15-18 GB, cabe en RTX 4090, RTX 3090 y GPUs consumer de 24 GB.
- GPUs recomendadas: A100 80 GB, H100 80 GB, H200 para BF16; multiples RTX 4090 o L40S para tensor parallelism en cuantizaciones intermedias.
- Cabe en GPU consumer: si, en cuantizacion de 4 bits (RTX 4090, RTX 3090); en BF16 no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed (mencionados en la model card del modelo base); llama.cpp y Ollama no se mencionan explicitamente pero serian viables tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento con MTP permite decodificacion especulativa que deberia mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-MPOA-heretic (este) | 27B denso | 262.144 (ext. 1M) | Si (imagen y video) | Apache 2.0 | Variante decensored con MPOA; 25/100 rechazos |
| Qwen3.8-27B (original) | 27B denso | 262.144 (ext. 1M) | Si (imagen y video) | Apache 2.0 | Modelo base; 98/100 rechazos; sin ablacion |
| Qwen3.6-27B | No disponible | No disponible | No disponible | No disponible | Generacion anterior de la familia Qwen; aparece en la tabla comparativa del modelo base pero los datos estan truncados |

No se dispone de datos de benchmarks de capacidad para establecer una comparacion cuantitativa con alternativas de otros fabricantes (Llama, Mistral, Gemma) en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion MPOA reduce los rechazos pero altera el comportamiento del modelo: la divergencia KL de 0,0854 indica una desviacion medible respecto al original que puede afectar a la calidad en tareas sensibles.
- Riesgo elevado de generar contenido inapropiado, ofensivo o danino al haberse eliminado los filtros de seguridad; el operador asume la responsabilidad legal y etica del despliegue.
- Riesgo de alucinacion no cuantificado en la informacion disponible; el modo thinking puede aumentar la latencia y el consumo de tokens.
- Idiomas soportados no especificados; no se garantiza un rendimiento uniforme fuera del ingles y el chino, idiomas habituales de la familia Qwen.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros de seguridad puede incumplir politicas de plataformas de despliegue (APIs gestionadas, marketplaces) y normativas sectoriales.
- El contexto de 1.000.000 tokens es una extension sobre los 262.144 nativos; el rendimiento en la ventana extendida no esta cuantificado.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion independiente de la comunidad.
- Los pesos en safetensors requieren conversion para usarse con llama.cpp u Ollama; no se proporcionan versiones GGUF en el repositorio.
- La model card del autor esta parcialmente truncada en la informacion proporcionada, por lo que algunos detalles del modelo base (composicion del dataset, proceso de postentrenamiento) no estan disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/Qwen3.8-27B-MPOA-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (proyecto): https://heretic-project.org
- Pagina del modelo en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
- Directorio de reproduccion: `reproduce/README.md` dentro del repositorio de HuggingFace
