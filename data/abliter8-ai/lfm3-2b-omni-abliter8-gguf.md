# abliter8-ai/lfm3-2b-omni-abliter8-gguf

## Resumen

LFM3-Omni-2B-Abliter8 es una versión "abliterated" (con reducción de negativas) del modelo multimodal LFM3-Omni-2B de Liquid AI, publicada por abliter8-ai en formato GGUF y MLX. El modelo original combina un backbone lingüístico LFM3 con codificadores de visión, audio causal y LiquidCodec, aceptando texto, imágenes, vídeo y audio, y generando texto y voz, todo ello en un paquete de unos 2.170 millones de parámetros con una ventana de contexto de 32K tokens. Se trata de un modelo no razonador ("non-reasoning").

La aportación de abliter8-ai es una edición de pesos que reduce la tendencia aprendida del modelo a negarse ante peticiones sensibles, aplicando una proyección de rango uno sobre matrices de escritura residual, sin ajuste fino ni sustitución de pesos. Los componentes multimodales (visión, audio, codec) se conservan intactos y sin cuantizar en la conversión MLX.

Su relevancia actual radica en ofrecer capacidades any-to-any (texto, visión y audio) en una clase de tamaño muy compacta, adecuada para aplicaciones de voz y visión que necesitan ejecutarse en hardware modesto, con la ventaja añadida de menos rechazos a nivel lingüístico. Según la comparativa de Liquid, puntúa 70,09 en Daily-Omni frente a 58,81 de Qwen2.5-Omni-3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (backbone lingüístico) + codificador de visión + codificador de audio causal + LiquidCodec, any-to-any |
| Parametros totales | 1.728.801.600 (pesos safetensors de este repo); 2.170 millones según la model card del modelo original |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | 32.000 tokens (advertido por el autor, sin requalificar a longitud completa) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q4_K_M, Q4_0; MLX: 8-bit, 6-bit, 4-bit |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other, licencia personalizada de Liquid AI) |
| Formato de pesos | GGUF y MLX (modelo base en safetensors BF16) |

## Arquitectura y entrenamiento

El modelo base, LFM3-Omni-2B de Liquid AI, es un modelo multimodal any-to-any que integra un backbone lingüístico LFM3 con un codificador de visión, un codificador de audio causal y el códec LiquidCodec. Acepta como entrada texto, imágenes, vídeo y audio, y genera texto y habla. Es un modelo no razonador, es decir, no incorpora un modo de pensamiento extendido. No se dispone en la información proporcionada de detalles sobre el número de tokens de preentrenamiento, la composición del corpus ni los métodos de alineación (RLHF/DPO).

La edición de abliteration se aplicó sobre las activaciones del propio backbone lingüístico de cada modelo. Concretamente, se aplicó la operación `W' = W - 2 r (r^T W)` a 32 matrices de escritura residual en las capas 8 a 23: `self_attn.o_proj`, `feed_forward.w2` y `conv.out_proj`. A fuerza 2, se trata de una resta de proyección de rango uno escalada, no del proyector ortogonal de fuerza 1. No se empleó ajuste fino ni injerto de pesos lingüísticos. La auditoría BF16 confirma que todos los demás tensores y los ficheros de procesadores y códec copiados permanecen inalterados. En la conversión MLX, el backbone lingüístico se cuantiza mientras los componentes multimodales permanecen sin cuantizar.

## Capacidades

- Generación de texto conversacional con reducción de negativas ante temas sensibles en lenguaje.
- Comprensión de imágenes y vídeo (mediante el codificador de visión del modelo original, sin modificar).
- Comprensión de audio, incluyendo ASR: el modelo original reporta un 6,36 % de error por palabra en inglés.
- Generación de habla (síntesis de voz heredada del modelo base, aunque sin cualificar en esta edición).
- Pipeline any-to-any: acepta texto, imágenes, vídeo y audio como entrada.
- No es un modelo de razonamiento: no incluye thinking mode.
- No disponible: información sobre tool calling, function calling o soporte de agentes.

## Casos de uso

- Transcripción y discusión de contenido de lenguaje adulto: el modelo puede transcribir audio con lenguaje explícito y responder preguntas sobre él sin los rechazos habituales del modelo original.
- Asistentes multimodales compactos: gracias a sus 2.170 millones de parámetros y su cobertura de texto, visión y audio, es adecuado para despliegues en dispositivos con recursos limitados.
- Respuesta a preguntas sobre documentos sensibles: permite analizar y discutir material delicado presentado como texto o imagen con respuestas más directas.
- ASR en inglés en aplicaciones de voz: con un WER del 6,36 % según Liquid, puede integrarse en pipelines de voz a texto de bajo consumo.
- Chatbots locales con Ollama o llama.cpp: los pesos GGUF en Q4_K_M permiten ejecutar el modelo en GPUs de consumo o incluso en CPU.
- Investigación sobre abliteration y seguridad de modelos: la documentación detallada de la edición (matrices modificadas, auditoría BF16, métricas KLD y perplexidad) lo hace útil como caso de estudio reproducible.

## Benchmarks y rendimiento

Datos del modelo original (evaluación de Liquid, no reejecutada sobre los pesos editados):

| Benchmark | LFM3-Omni-2B | Qwen2.5-Omni-3B |
|---|---:|---:|
| Daily-Omni | 70,09 | 58,81 |
| OmniBench (global) | 46,32 | 47,11 |
| ASR WER inglés | 6,36 % | 6,30 % |

Evaluación propia de abliter8-ai sobre los GGUF (detector estricto de negativas sobre 100 prompts; XSTest con 100 prompts seguros):

| GGUF | Negativas estrictas /100 | Falsas negativas XSTest /100 | KLD medio | Perplexidad | Acuerdo top-1 |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 1 | 0 | 0,04740 | 28,580 | 89,17 % |
| Q6_K | 0 | 0 | 0,05509 | 28,474 | 88,31 % |
| Q4_K_M | 0 | 0 | 0,11962 | 28,885 | 83,50 % |
| Q4_0 | 0 | 0 | 0,17855 | 28,073 | 80,72 % |

Referencia: LFM3-Omni-2B stock Q8_0, perplexidad 27,283. Para MLX (deriva de cuantización respecto al máster BF16 editado, contexto corto): 8-bit, KLD 0,00257, perplexidad 30,946, acuerdo top-1 97,41 %; 6-bit, KLD 0,01681, perplexidad 31,400, acuerdo 94,09 %; 4-bit, KLD 0,22524, perplexidad 34,097, acuerdo 76,86 %. Perplexidad de referencia BF16: 30,806.

## Requisitos de hardware

- VRAM estimada para inferencia: con un repo de 9,8 GB para todas las variantes GGUF, la variante Q4_K_M debería ocupar en torno a 1,5-2 GB; Q8_0 en torno a 2-2,5 GB. No disponible: cifras exactas por variante.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente dada la clase de tamaño (RTX 3060, RTX 4060 o superiores); no requiere A100 ni H100.
- Cabe con holgura en GPUs de consumo; también es viable la ejecución en CPU con llama.cpp dado el tamaño reducido.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; MLX para Apple Silicon. No disponible: compatibilidad con vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia |
|---|---|---|---|---|
| LFM3-Omni-2B-Abliter8 (este) | 2.170 M (base) | 32K | texto, visión, audio, vídeo → texto y habla | lfm1.0 (other) |
| Qwen2.5-Omni-3B | 6B totales según Liquid | no disponible | texto, visión, audio → texto y habla | no disponible |
| LFM3 (modelo original de Liquid AI) | 2.170 M | 32K | texto, visión, audio, vídeo → texto y habla | lfm1.0 (other) |

El modelo editado conserva las capacidades multimodales del original pero con menos negativas lingüísticas; frente a Qwen2.5-Omni-3B ofrece mejor puntuación en Daily-Omni (70,09 frente a 58,81) con menos parámetros totales según la comparativa de Liquid, aunque pierde ligeramente en OmniBench (46,32 frente a 47,11).

## Limitaciones y advertencias

- Al ser una versión abliterated, el modelo reduce las negativas de seguridad: su uso conlleva riesgos éticos y legales, y el autor advierte que los recuentos de negativas son detecciones por palabras clave, no una evaluación semántica de cumplimiento perjudicial.
- El comportamiento de rechazo ante imágenes o audio sensibles, la síntesis de habla y el rendimiento en vídeo no han sido cualificados en esta edición.
- La ventana de contexto de 32K anunciada no ha sido requalificada a longitud completa por el autor del fork.
- Los benchmarks de Liquid describen el modelo original sin editar; no se reivindican para los pesos editados o cuantizados.
- La abliteration no añade conocimiento, capacidad de razonamiento ni modalidades nuevas; solo modifica el acceso a capacidades ya presentes.
- Licencia lfm1.0 (other): las condiciones de uso comercial vienen definidas por la licencia de Liquid AI; debe revisarse el texto de la licencia antes de cualquier despliegue comercial.
- La cuantización 4-bit muestra una deriva notable (acuerdo top-1 del 76,86 % en MLX, 80,72 % en Q4_0), por lo que para máxima fidelidad se recomiendan Q8_0 o 8-bit.
- Riesgo de alucinación: no disponible información específica, aunque al tratarse de un modelo compacto no razonador, debe asumirse un riesgo estándar de alucinación en generación de texto.
- Idiomas soportados: no disponible en la información proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abliter8-ai/lfm3-2b-omni-abliter8-gguf
- Pesos MLX: https://huggingface.co/abliter8-ai/lfm3-2b-omni-abliter8-mlx
- Colección LFM3-Abliter8: https://huggingface.co/collections/abliter8-ai/lfm3-abliter8
- Modelo base (Liquid AI): https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Model card original de Liquid (fuente de specs y benchmarks): https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/ce2458cbce4ad970f92032ed94e3d18d30b04f9c/README.md
- Sitio del editor: https://abliter8.ai
