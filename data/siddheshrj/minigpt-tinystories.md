# siddheshrj/minigpt-tinystories

## Resumen

MiniGPT es una familia de modelos de lenguaje decoder-only de tipo GPT, desarrollados desde cero en PyTorch por Siddhesh Jajurley (siddheshrj) y entrenados sobre el conjunto de datos TinyStories V2. El modelo resuelve el problema de demostrar empíricamente las leyes de escalado de Chinchilla en un entorno de recursos limitados: los tres checkpoints (Model S, M y L) se entrenaron íntegramente en una única GPU de portátil NVIDIA GeForce RTX 4060. Su relevancia es principalmente pedagógica y de investigación: sirve como referencia reproducible de cómo la pérdida y la perplejidad descienden de forma suave al aumentar parámetros y tokens.

El repositorio publica tres variantes con 4,2 M, 12,2 M y 27,3 M de parámetros respectivamente. La variante mayor, Model L, emplea 8 capas, 8 cabezas de atención, dimensión de modelo 512 y una longitud de contexto de 512 tokens. La arquitectura incorpora técnicas modernas habituales en modelos grandes (RoPE, Pre-RMSNorm, atención causal fusionada, weight tying, KV-cache preasignada) pero a una escala minúscula.

No es un modelo de propósito general: está entrenado exclusivamente con cuentos infantiles sintéticos en inglés y su vocabulario BPE es de solo 8.192 tokens. Por tanto, debe evaluarse como un banco de pruebas de arquitectura y escalado, no como un asistente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (RoPE, Pre-RMSNorm, atención causal fusionada, weight tying, MLP 4x con GELU) |
| Parametros totales | Model S: 4.196.608 (4,2 M); Model M: 12.194.688 (12,2 M); Model L: 27.271.680 (27,3 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (solo se publican checkpoints en PyTorch; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (`.pt`) y tokenizer en `tokenizer.json` |

Configuración por variante:

| Configuración | Capas | Cabezas | d_model | Head dim | Contexto |
|---|---|---|---|---|---|
| Model S | 4 | 4 | 256 | 64 | 512 |
| Model M | 6 | 6 | 384 | 64 | 512 |
| Model L | 8 | 8 | 512 | 64 | 512 |

## Arquitectura y entrenamiento

Los tres modelos son transformers decoder-only con las siguientes decisiones de diseño: Rotary Position Embeddings (RoPE) aplicados a las proyecciones de query y key con theta base 10.000; normalización Pre-RMSNorm con acumulación en float32 para estabilidad bajo bfloat16; atención causal mediante `scaled_dot_product_attention` de PyTorch con kernels fusionados (FlashAttention, memory-efficient o cuDNN) para evitar materializar la matriz de atención O(T²); weight tying entre la proyección de salida y los embeddings de tokens; capas lineales sin sesgo; MLP de expansión 4x con activación GELU; y una KV-cache preasignada que convierte la generación de O(T²) a O(T). El tokenizador es un BPE específico de dominio con vocabulario de 8.192 tokens y delimitador `<|endoftext|>`, con una media aproximada de 3,8 bytes por token.

El entrenamiento se realizó sobre TinyStories V2 con presupuestos de tokens crecientes: 85 M tokens para Model S, 242 M para Model M y 544 M para Model L, siguiendo la proporción de Chinchilla (N ≈ D/20). El ajuste empírico de la ley de potencia reportado es Loss ≈ 61,2 × Params^(−0,2328). No se documenta en la información disponible el uso de RLHF, DPO ni ajuste por instrucciones; se trata de un modelo de preentrenamiento puro evaluado con perplejidad y pérdida de validación.

## Capacidades

- Generación de texto en inglés, limitada al dominio de cuentos infantiles sintéticos.
- Continuación de historias a partir de un prompt corto, con estructura narrativa simple.
- Razonamiento de baja complejidad y coherencia local dentro de la ventana de 512 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés; el tokenizador está entrenado solo con TinyStories.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- No se documenta entrenamiento por instrucciones ni formato de chat.

## Casos de uso

- Investigación sobre leyes de escalado: replicar el ajuste Loss ≈ 61,2 × Params^(−0,2328) y estudiar cómo varía la perplejidad (5,91 → 3,82 → 3,17) al aumentar parámetros y tokens con un presupuesto de cómputo mínimo.
- Docencia y formación en arquitecturas transformer: el código en PyTorch puro permite inspeccionar RoPE, Pre-RMSNorm, weight tying y KV-cache sin las abstracciones de frameworks de alto nivel.
- Pruebas de infraestructura de inferencia: con 27,3 M de parámetros y 2.524 MiB de VRAM en pico durante el entrenamiento, sirve para validar pipelines de generación, tokenización y decodificación en hardware modesto.
- Generación de cuentos sintéticos para aumento de datos: puede producir historias cortas en inglés con vocabulario controlado para experimentos de data augmentation en tareas de NLP infantil.
- Benchmark de tokenizadores de dominio: el BPE de 8.192 tokens entrenado sobre TinyStories permite comparar eficiencia de compresión (0,4202 bits/byte en Model L) frente a tokenizadores generalistas.
- Reproducción de experimentos de scaling en una sola GPU: el entrenamiento de Model L (2,76 horas en una RTX 4060 Laptop) hace viable repetir el ciclo completo en un portátil.
- Estudio de degradación de coherencia: útil para analizar cómo falla la generación en modelos pequeños (deriva temática, contradicciones) y comparar con modelos de mayor escala.

## Benchmarks y rendimiento

Evaluación sobre el conjunto de validación reservado de TinyStories (5,58 M tokens):

| Modelo | Parámetros | Tokens vistos | Val Loss | Perplejidad | Bits/byte | Velocidad (tok/s) | VRAM pico | Tiempo de entrenamiento |
|---|---|---|---|---|---|---|---|---|
| Model S | 4,2 M | 85 M | 1,7765 | 5,91 | 0,6476 | ~259.200 | 942 MiB | 5,5 min |
| Model M | 12,2 M | 242 M | 1,3412 | 3,82 | 0,4889 | ~110.200 | 1.624 MiB | 37 min |
| Model L | 27,3 M | 544 M | 1,1528 | 3,17 | 0,4202 | ~55.060 | 2.524 MiB | 2,76 h |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño (27,3 M de parámetros en Model L), el checkpoint en float32 ocupa del orden de 110 MB y la inferencia cabe holgadamente en cualquier GPU consumer.
- VRAM pico documentada durante el entrenamiento: 942 MiB (Model S), 1.624 MiB (Model M) y 2.524 MiB (Model L) en una RTX 4060 Laptop.
- GPU recomendadas: cualquier GPU con al menos 3 GB de VRAM para entrenamiento de Model L; para inferencia basta CPU o GPU integrada.
- Cabe en GPU consumer: sí, en cualquier RTX 4060, RTX 3060, GTX 1660 o superior; también en CPU.
- Opciones de despliegue: el repositorio proporciona scripts propios (`scripts/generate.py`) con `uv`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: velocidad de generación reportada de ~259.200 tok/s (Model S), ~110.200 tok/s (Model M) y ~55.060 tok/s (Model L) durante la evaluación en la RTX 4060 Laptop.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniGPT Model L | 27,3 M | 512 | TinyStories V2, 544 M tokens | MIT | HuggingFace + demo Space |
| MiniGPT Model M | 12,2 M | 512 | TinyStories V2, 242 M tokens | MIT | HuggingFace |
| MiniGPT Model S | 4,2 M | 512 | TinyStories V2, 85 M tokens | MIT | HuggingFace |

No se dispone en la información proporcionada de datos de benchmarks comparables con otros modelos de la misma categoría (por ejemplo, variantes TinyStories de terceros) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado exclusivamente con cuentos infantiles sintéticos: el vocabulario y los patrones narrativos están fuertemente sesgados a ese dominio; el rendimiento fuera de él será deficiente.
- Ventana de contexto de solo 512 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Modelo de preentrenamiento sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene un formato de chat.
- Riesgo elevado de alucinación y de degradación de coherencia, especialmente en las variantes S y M; el ejemplo de Model L incluido en la model card ya muestra inconsistencias narrativas (cambios de personaje, moraleja desconectada).
- Solo inglés; no soporta castellano ni otros idiomas.
- Licencia MIT: permite uso comercial, pero no hay garantías de calidad ni de idoneidad para producción.
- No se documentan evaluaciones de sesgos, seguridad ni robustez adversarial.
- Sin soporte documentado de cuantización ni de formatos de despliegue estándar (GGUF, ONNX), lo que limita su integración en stacks de serving convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddheshrj/minigpt-tinystories
- Demo interactiva (Space): https://huggingface.co/spaces/siddheshrj/minigpt-stories
- Repositorio de código: https://github.com/SiddheshJajurley/minigpt
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper TinyStories (referencia del dataset): no disponible en la información proporcionada
