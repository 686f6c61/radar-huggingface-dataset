# kefir090/Lumen-118M-Base

# Lumen-118M-Base

## Resumen

Lumen-118M-Base es un modelo de lenguaje causal (decoder-only) de 117,5 millones de parámetros, entrenado desde cero por el desarrollador kefir090 sobre una mezcla de corpus educativos y web de alta densidad. El modelo se ha preentrenado con un presupuesto de 3 880 millones de tokens en una única GPU de consumo (NVIDIA RTX 5060 de 8 GB) durante aproximadamente 62 horas, lo que lo convierte en un ejemplo destacado de entrenamiento eficiente en hardware doméstico. Su arquitectura incorpora varias innovaciones experimentales: convoluciones causales residuales, embeddings de valor con puerta (Gated Value Embeddings), predicción multi-token auxiliar y softcapping de logits.

Está diseñado como un modelo base de investigación, sin alineamiento por instrucciones, y se distribuye bajo licencia Apache 2.0. Con una ventana de contexto de 2048 tokens y un vocabulario BPE de 32 768 entradas, Lumen-118M-Base resulta útil para experimentación, fine-tuning con LoRA y tareas de generación de texto en inglés. Su relevancia actual radica en demostrar que es posible entrenar modelos competitivos en su categoría con recursos limitados, al tiempo que introduce componentes arquitectónicos poco habituales en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Decoder-Only Transformer con GQA (6 query / 2 KV heads), RoPE, RMSNorm sin parámetros, QK-norm por cabeza, convolución depthwise causal (K=3) residual, Gated Value Embeddings en las dos capas más profundas, Multi-Token Prediction auxiliar (solo entrenamiento) y softcapping de logits (15·tanh(logits/15)) |
| Parametros totales | 117 477 466 (~117,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en bfloat16; no se han publicado pesos cuantizados) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado, requiere trust_remote_code=True) |

## Arquitectura y entrenamiento

Lumen-118M-Base es un transformer causal decoder-only con 8 capas, dimensión oculta de 768 y feed-forward de 3072 con activación ReLU². La atención emplea GQA con 6 cabezas de consulta y 2 de clave/valor (proporción 3:1) y dimensión de cabeza 128. La codificación posicional es RoPE con theta 100 000, y la normalización es RMSNorm sin parámetros con pre-norm y QK-norm por cabeza.

El entrenamiento se realizó sobre 3 880 millones de tokens (7 402 pasos × 524 288 tokens por paso) en una RTX 5060 8GB, con una velocidad media de 17 300 tokens/s y una pérdida de validación de 0,8953 bpb. La mezcla de datos incluye `karpathy/climbmix-400b-shuffle` (corpus web), `HuggingFaceFW/finewiki` (artículos enciclopédicos limpios), `HuggingFaceTB/cosmopedia` (libros de texto sintéticos) y un generador procedural de problemas aritméticos con entidades y semillas aleatorias. El modelo se preentrenó con precisión bfloat16 y pesos maestros en fp32, e incluye un cabezal auxiliar de predicción multi-token (t+2) que se elimina en inferencia y no se incluye en los pesos publicados.

## Capacidades

- Generación de texto autoregresiva en inglés, con completado de secuencias y continuación de texto.
- Razonamiento básico y comprensión lectora limitada, acorde a su tamaño (117 M) y presupuesto de entrenamiento (3,88 B tokens).
- Capacidades aritméticas elementales, gracias al generador procedural de problemas aritméticos incluido en el preentrenamiento.
- Soporte de fine-tuning con LoRA y PEFT, con módulos objetivo recomendados (`c_q`, `c_k`, `c_v`, `c_proj`, `c_fc`).
- Tokens especiales reservados para formato de chat (`<|user_start|>`, `<|user_end|>`, `<|assistant_start|>`, `<|assistant_end|>`), aunque el modelo no está alineado para instrucciones.
- No dispone de tool calling, visión, audio ni capacidades multimodales.
- No soporta lenguajes distintos del inglés (aunque el tokenizador BPE byte-level podría procesar otros alfabetos, el entrenamiento fue exclusivamente en inglés).

## Casos de uso

- Experimentación educativa e investigación: ideal para estudiar el comportamiento de arquitecturas alternativas (convoluciones, Gated VE, MTP) en un modelo pequeño, reproducible en una GPU de consumo.
- Fine-tuning para tareas específicas de NLP en inglés: al ser un modelo base compacto, se puede adaptar con LoRA para clasificación de texto, análisis de sentimiento o generación de dominios concretos con pocos recursos.
- Prototipado rápido de aplicaciones de generación de texto: su pequeño tamaño permite iterar rápidamente en entornos de desarrollo sin necesidad de infraestructura costosa.
- Enseñanza de transformers y LLMs: sirve como ejemplo práctico de preentrenamiento desde cero, ya que el código y los pesos son abiertos y el entrenamiento es reproducible en hardware doméstico.
- Generación de contenido corto en inglés (resúmenes, titulares, descripciones) donde no se requiere alta coherencia a largo plazo ni razonamiento complejo.
- Base para estudios de alineación y seguridad: al ser un modelo sin instrucciones, permite investigar técnicas de RLHF o DPO en un entorno controlado y de bajo coste.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación 0-shot con `acc_norm` (log-verosimilitud normalizada por longitud) sobre los conjuntos de test públicos, usando el prefijo `<|bos|>`:

| Benchmark | Métrica | Resultado | Muestras (n) |
|---|---|---|---|
| HellaSwag | acc_norm | 33,74 % | 10 042 |
| PIQA | acc_norm | 66,65 % | 1 838 |
| ARC-Easy | acc_norm | 49,20 % | 2 376 |
| ARC-Challenge | acc_norm | 25,77 % | 1 172 |
| ArithMark-3 | acc | 39,50 % | 1 000 |
| Combined ARC | media (Easy, Chall) | 37,48 % | 3 548 |
| Intelligence Index | normalizado por azar | 20,32 | — |
| LAMBADA (OpenAI) | acc (con BOS) | 27,25 % | 5 153 |
| WikiText-2 | bits-per-byte (bpb) | 1,10 | — |

Estos resultados son propios del autor y no se comparan directamente con otros modelos en la documentación disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB (según LLM Explorer), lo que permite ejecutarlo en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el entrenamiento se realizó en una NVIDIA RTX 5060 de 8 GB, pero la inferencia es viable en tarjetas mucho más modestas.
- Compatible con GPUs de consumo: sí, desde GTX 1050 en adelante, y también en Apple Silicon (con PyTorch MPS).
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), también puede convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan pesos cuantizados oficiales.
- Latencia y throughput: no disponibles; se espera una generación rápida (decenas de tokens por segundo) en GPU, y aceptable en CPU para uso interactivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Entrenamiento | Notas |
|---|---|---|---|---|---|
| Lumen-118M-Base | 117,5 M | 2048 | Apache 2.0 | 3,88 B tokens, desde cero | Innovaciones arquitectónicas (convolución, Gated VE, MTP) |
| GPT-2 (124M) | 124 M | 1024 | MIT | 40 GB de texto (WebText) | Modelo clásico, sin GQA ni RoPE, bien documentado |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | 3 T tokens | Mucho más grande, requiere más recursos |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | 600 B tokens (SmolLM-Corpus) | Entrenado con datos modernos, arquitectura estándar |

Lumen-118M-Base se sitúa en la gama de modelos de menos de 200 M, con un presupuesto de entrenamiento inferior al de alternativas como SmolLM-135M, pero introduce componentes arquitectónicos que no aparecen en los otros. Su rendimiento en benchmarks de sentido común (HellaSwag, ARC) es inferior al de SmolLM-135M (que supera el 40 % en HellaSwag), pero superior al de GPT-2 pequeño en algunos casos. No se dispone de comparaciones directas publicadas por el autor.

## Limitaciones y advertencias

- Modelo base sin alineamiento por instrucciones: no sigue instrucciones ni mantiene conversaciones coherentes por sí solo; requiere fine-tuning para tareas dirigidas.
- Entrenado exclusivamente en inglés; el rendimiento en otros idiomas será muy deficiente.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o historiales extensos.
- Riesgo de alucinaciones y errores fácticos, especialmente en temas especializados o poco representados en los datos de entrenamiento.
- Posibles sesgos presentes en los corpus web y sintéticos utilizados (climbmix, cosmopedia, finewiki), que no han sido auditados.
- El código personalizado requiere `trust_remote_code=True`, lo que implica ejecutar código no verificado de HuggingFace; se recomienda revisar el repositorio antes de usarlo en entornos sensibles.
- No se proporcionan pesos cuantizados (GGUF, AWQ, etc.), lo que puede limitar su despliegue en entornos sin soporte de bfloat16.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara que es un checkpoint experimental inicial; las versiones futuras (v2/v3) cambiarán los datos y la arquitectura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kefir090/Lumen-118M-Base
- Página del modelo en LLM Explorer: https://llm-explorer.com/model/kefir090%2FLumen-118M-Base,5X9W8YnPH1p8E6J3gpuDes
- Perfil del autor en HuggingFace: https://huggingface.co/kefir090
- Perfil del autor en GitHub: https://github.com/kefir090/
