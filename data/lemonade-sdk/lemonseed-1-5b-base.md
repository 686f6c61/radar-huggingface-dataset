# lemonade-sdk/lemonseed-1.5b-base

## Resumen

LemonSeed 1.5B Base es un modelo de lenguaje de 1.510 millones de parámetros nominales desarrollado por Geramy L. Loveless bajo el sello lemonade-sdk, entrenado desde cero (sin destilación ni continuación de preentrenamiento) sobre un único AMD Instinct MI300X con el stack de entrenamiento MLX sobre ROCm. Se trata de un modelo base, es decir, solo preentrenamiento, sin ajuste por instrucciones ni chat. Su relevancia radica en ser un experimento de arquitectura híbrida que combina atención lineal (Gated DeltaNet), atención softmax esporádica, mezcla de expertos (MoE) y mezcla de profundidades (Mixture-of-Depths) en un paquete compacto de 1.5B, con un coste de decodificación casi constante gracias a que 15 de sus 20 capas usan estado recurrente O(1).

El modelo está pensado para investigación y experimentación, no para producción directa, ya que es una base sin fine-tuning. Su tokenizer es el BPE de Qwen 3.6 con 248.320 tokens y división de dígitos, y su contexto entrenado es de 2048 tokens. La licencia es lemonseed-research, una licencia personalizada que restringe el uso comercial. El repositorio en HuggingFace contiene pesos en formato safetensors (3.0 GB) y está etiquetado para MLX, aunque también se indica soporte ROCm.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet (atención lineal) + softmax attention (cada 4ª capa) + MoE + Mixture-of-Depths |
| Parametros totales | 1.514.470.884 (nominal 1.51B) |
| Parametros activos | ~0.46B por token (top-2 de 8 expertos + shared + backbone) |
| Longitud de contexto | 2048 (entrenado) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | lemonseed-research (licencia personalizada, no comercial) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

LemonSeed es un modelo híbrido que intercala tres mecanismos de mezcla de secuencia por capa. La mayoría de las capas (15 de 20) usan Gated DeltaNet, una forma de atención lineal con estado recurrente de tamaño fijo O(1) que no crece con la longitud de secuencia. Cada 4ª capa (capas 3, 7, 11, 15, 19) usa atención softmax completa con ventana deslizante de 256 y RoPE con theta 500.000. La alimentación hacia adelante es una mezcla de expertos con 8 expertos enrutados (top-2) más un experto compartido siempre activo, con un tamaño intermedio de 2176 y un mecanismo de balanceo de carga sin pérdida auxiliar estilo DeepSeek. Además, cada capa aplica Mixture-of-Depths: solo procesa aproximadamente el 15% superior de los tokens a través de la ruta de expertos (mod_top_k=3, umbral 0.15).

El entrenamiento se realizó desde cero con 1.733.000 pasos, aproximadamente 28.400 millones de tokens en unas 3 épocas sobre un corpus de 9.600 millones de tokens únicos. La composición del corpus es: código 45.1%, matemáticas 15.2%, web 10.7%, lógica 10.4%, documentación 9.7%, conversacional 7.6% y agente 1.3%. Se usó un curriculum por dominios, con pérdidas por bloque que oscilan entre 2.5 y 3.7. El optimizador fue Fused AdamW con parámetros en bf16 y maestros en fp32, tasa de aprendizaje coseno de 3e-4 a 3e-5, y weight decay 0.1. La pérdida final de validación fue 1.78. Una nota importante del autor: por peso, solo 68 de los 160 expertos enrutados se entrenaron realmente (el resto quedó cerca de la inicialización cero), por lo que el tamaño efectivo es de ~0.90B, no los 1.51B nominales. El router despachó tokens a todos los expertos de forma equilibrada, pero el estrecho rango de puntuación de 0.15 hizo que el modelo funcionara efectivamente como top-1 para la mayoría de los tokens.

## Capacidades

- Generación de texto en inglés con modelado de lenguaje autorregresivo estándar (next-token prediction).
- Razonamiento básico y matemáticas, dado el alto porcentaje de código y matemáticas en el corpus de entrenamiento (60.3% combinado).
- Generación de código, con soporte para múltiples lenguajes de programación gracias al dominio de código (45.1% del corpus).
- Comprensión de documentación técnica y textos web.
- Capacidad de procesamiento de contexto largo eficiente en decodificación: las capas Gated DeltaNet mantienen un estado recurrente de tamaño fijo, lo que permite decodificar con memoria constante en 15 de 20 capas.
- No soporta tool calling ni function calling, ya que es un modelo base sin fine-tuning de instrucciones.
- No soporta agentes ni razonamiento multi-paso explícito más allá de lo que emerge del preentrenamiento.
- No tiene capacidades multimodales (solo texto).
- No tiene modo de pensamiento (thinking mode) ni soporte de visión o audio.

## Casos de uso

- Investigación en arquitecturas híbridas: el modelo es un banco de pruebas para estudiar la interacción entre atención lineal, MoE y Mixture-of-Depths en un tamaño compacto. Los investigadores pueden analizar los pesos y el comportamiento de enrutamiento para validar hipótesis sobre eficiencia y calidad.
- Fine-tuning para generación de código: dado el 45% de código en el corpus, el modelo puede servir como punto de partida para ajustar un asistente de programación especializado, aprovechando su tokenizer con división de dígitos y su capacidad de contexto de 2048 tokens.
- Fine-tuning para razonamiento matemático: con un 15.2% de matemáticas en el entrenamiento, es adecuado como base para modelos de razonamiento simbólico o resolución de problemas, aunque requerirá ajuste con datos específicos.
- Experimentación con decodificación eficiente: su arquitectura con estado recurrente O(1) permite probar técnicas de inferencia de baja latencia en hardware con memoria limitada, como GPUs de consumo o incluso CPUs con MLX.
- Evaluación de curriculum learning: el entrenamiento por dominios con pérdidas oscilantes documentadas ofrece un caso de estudio para quienes investigan estrategias de ordenación de datos.
- Benchmarking de MoE a pequeña escala: con 8 expertos enrutados y top-2, el modelo permite comparar el rendimiento de MoE compacto frente a densos de tamaño similar, aunque con la advertencia de que solo 68 de 160 expertos se entrenaron realmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida final de validación (1.78) y la composición del corpus, pero no incluye resultados de MMLU, HumanEval, GSM8K ni otros estándares. No se dispone de comparaciones cuantitativas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 1.51B parámetros en bf16, el peso del modelo ocupa aproximadamente 3.0 GB. Con overhead de activaciones y KV cache, se estima que cabría en una GPU con 6-8 GB de VRAM en fp16/bf16, y en menos de 4 GB con cuantización a 8 bits (aunque no se proporcionan cuantizaciones oficiales).
- GPU recomendadas: el modelo se entrenó en una AMD Instinct MI300X (gfx942, ROCm), pero al ser MLX, la inferencia nativa está pensada para Apple Silicon (M-series). También puede ejecutarse en GPUs AMD con ROCm y, potencialmente, en GPUs NVIDIA mediante conversión a otros formatos.
- ¿Cabe en consumer GPU? Sí, en GPUs de gama media como RTX 3060 (12 GB) o RTX 4060 (8 GB) cabría sin problema en bf16. En GPUs con 4 GB (como RTX 3050) requeriría cuantización.
- Opciones de despliegue: MLX (Apple Silicon), posiblemente vLLM o llama.cpp si se convierten los pesos a GGUF, aunque no hay soporte oficial documentado. El ecosistema Lemonade (lemonade-sdk) ofrece un servidor local que puede servir modelos optimizados, pero no se confirma compatibilidad específica con este modelo.
- Latencia y throughput: no disponibles. La arquitectura sugiere decodificación casi constante en tiempo para las capas GDN, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente. Sin embargo, se puede comparar a nivel arquitectónico y de especificaciones con modelos densos de tamaño similar:

| Modelo | Params | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LemonSeed 1.5B Base | 1.51B (0.90B efectivos) | 2048 | Híbrida (GDN + softmax + MoE + MoD) | lemonseed-research (no comercial) | HuggingFace (MLX) |
| Qwen2.5-1.5B | 1.54B | 32K | Transformer denso | Apache 2.0 | HuggingFace, múltiples formatos |
| Gemma-2-2B | 2.6B | 8K | Transformer denso | Gemma license (uso comercial permitido) | HuggingFace, múltiples formatos |
| Phi-3.5-mini | 3.8B | 128K | Transformer denso | MIT | HuggingFace, múltiples formatos |

LemonSeed se diferencia por su arquitectura híbrida y su entrenamiento en hardware AMD, pero carece de la madurez, el soporte de herramientas y las licencias permisivas de las alternativas. Su contexto de 2048 es significativamente menor que el de Qwen2.5-1.5B (32K) o Phi-3.5-mini (128K).

## Limitaciones y advertencias

- Modelo base sin fine-tuning: no responde a instrucciones, no sigue formatos de chat y no es adecuado para uso directo en aplicaciones de conversación o agentes.
- Tamaño efectivo reducido: solo 68 de 160 expertos enrutados se entrenaron realmente, lo que significa que el modelo tiene una capacidad efectiva de ~0.90B, no los 1.51B nominales. Esto puede afectar al rendimiento esperado.
- Licencia restrictiva: la licencia lemonseed-research no permite uso comercial. Cualquier despliegue en producción con fines lucrativos está prohibido.
- Idioma limitado: solo inglés. No hay soporte multilingüe.
- Contexto corto: 2048 tokens entrenados, muy por debajo de los estándares actuales (8K-128K). No se recomienda para tareas que requieran contexto largo.
- Riesgo de alucinación: al ser un modelo base sin alineación, puede generar contenido factualmente incorrecto o incoherente, especialmente en dominios fuera de su corpus.
- Sesgos potenciales: el corpus está dominado por código y matemáticas, lo que puede sesgar el modelo hacia un estilo técnico y descuidar aspectos sociales o culturales.
- Sin soporte de herramientas: no hay tool calling, function calling ni capacidades de agente.
- Formato de pesos limitado: solo safetensors en MLX. No hay GGUF, ONNX ni otros formatos listos para usar con llama.cpp o vLLM sin conversión manual.
- Documentación incompleta: la model card está truncada y no incluye benchmarks, configuraciones de cuantización ni guías de despliegue detalladas.

## Enlaces

- HuggingFace: https://huggingface.co/lemonade-sdk/lemonseed-1.5b-base
- Organización lemonade-sdk en HuggingFace: https://huggingface.co/lemonade-sdk/models
- Repositorio GitHub de Lemonade (servidor local de IA): https://github.com/lemonade-sdk/lemonade
- Repositorio GitHub de lemonade-sdk (Mintplex-Labs): https://github.com/Mintplex-Labs/lemonade-sdk
- Documentación de modelos de Lemonade Server: https://lemonade-server.ai/docs/models.html
- DeepWiki sobre recetas y configuración de modelos: https://deepwiki.com/lemonade-sdk/lemonade/5.3-model-recipes-and-configuration
