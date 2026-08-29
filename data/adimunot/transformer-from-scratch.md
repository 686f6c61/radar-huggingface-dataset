# adimunot/transformer-from-scratch

## Resumen

`adimunot/transformer-from-scratch` es un proyecto educativo que publica los pesos entrenados de un Transformer decoder-only implementado desde cero en PyTorch, sin depender de abstracciones de alto nivel. El autor, adimunot, ha construido manualmente la atención multi-cabeza, las proyecciones, la codificación posicional, los bloques y el bucle de entrenamiento, además de un tokenizador BPE propio. El repositorio contiene dos variantes: una con tokenización a nivel de carácter y otra con BPE, ambas entrenadas durante 5000 pasos sobre el corpus Tiny Shakespeare.

La relevancia de este modelo no reside en su rendimiento (es diminuto y está pensado para fines didácticos), sino en que sirve como referencia de implementación limpia y reproducible para quienes quieran comprender los mecanismos internos de un Transformer. Con 1,89 millones y 5,37 millones de parámetros respectivamente, y una ventana de contexto de 256 tokens, es un ejemplo de juguete que permite ejecutar inferencia en cualquier hardware, incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor (char) | Valor (bpe) |
|---|---|---|
| Arquitectura | Transformer decoder-only | Transformer decoder-only |
| Parametros totales | 1,89 M | 5,37 M |
| Parametros activos | no aplica (no es MoE) | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens | 256 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors FP32) | no disponible (solo safetensors FP32) |
| Idiomas soportados | ingles (corpus Tiny Shakespeare) | ingles (corpus Tiny Shakespeare) |
| Licencia | MIT | MIT |
| Formato de pesos | safetensors | safetensors |

## Arquitectura y entrenamiento

Ambos modelos son Transformers decoder-only con arquitectura estándar: capas de atención multi-cabeza, redes feed-forward, normalización y codificación posicional aprendida. La variante `char` usa un vocabulario de 65 caracteres, con `d_model=128`, 4 cabezas y 4 capas. La variante `bpe` emplea un tokenizador BPE implementado desde cero con un vocabulario de 768 tokens, `d_model=192`, 6 cabezas y 6 capas. Ambos comparten una ventana de contexto de 256 tokens.

El entrenamiento se realizó durante 5000 pasos sobre el corpus Tiny Shakespeare, un dataset de unas 40 000 líneas de texto de Shakespeare. No se menciona el uso de técnicas como RLHF, DPO o ajuste fino supervisado adicional; se trata de un entrenamiento de lenguaje autoregresivo estándar. El autor indica que los pesos publicados son solo de inferencia (se eliminó el estado del optimizador) y que no se incluyen checkpoints intermedios.

## Capacidades

- Generación de texto autoregresiva básica, capaz de producir secuencias coherentes a nivel local en el estilo del corpus de Shakespeare.
- Tokenización a nivel de carácter (variante `char`) o mediante BPE (variante `bpe`), ambas implementadas desde cero.
- Sin soporte de tool calling, function calling, agentes o razonamiento multi-paso.
- Sin capacidades multimodales (solo texto).
- Multilingüismo limitado: entrenado exclusivamente en inglés (texto de Shakespeare), por lo que no generaliza a otros idiomas.
- Sin modo de pensamiento o razonamiento explícito; es un modelo de lenguaje puramente generativo.

## Casos de uso

- Aprendizaje y docencia: el modelo sirve como ejemplo tangible para explicar cómo funciona un Transformer por dentro. Se puede cargar en PyTorch, inspeccionar los pesos y modificar hiperparámetros para experimentar.
- Experimentación con tokenizadores: comparar el comportamiento de la tokenización por caracteres frente a BPE en un corpus pequeño, observando diferencias en la generación y en la compacidad del vocabulario.
- Depuración de pipelines de inferencia: al ser un modelo minúsculo, es ideal para probar infraestructuras de despliegue (vLLM, llama.cpp, etc.) sin consumir recursos significativos.
- Generación de texto creativo en estilo shakespeariano: aunque limitado, puede producir fragmentos de texto que imitan superficialmente el registro del corpus, útil para demos o proyectos de arte generativo.
- Validación de implementaciones propias: los pesos publicados permiten verificar que una implementación de Transformer desde cero produce resultados coherentes, sirviendo como test de regresión.
- Estudio de sobreajuste y generalización: al estar entrenado en un corpus tan reducido, es un buen candidato para analizar fenómenos de memorización y capacidad de generalización en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como perplexity, MMLU, HumanEval o similares. Dado el tamaño y el corpus de entrenamiento, cualquier cifra de rendimiento sería anecdótica y no comparable con modelos de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 7,5 MB (modelo `char`) y 21,5 MB (modelo `bpe`). Incluso con overhead de activaciones, caben en cualquier GPU moderna y en la mayoría de CPUs.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también funciona en CPU sin problemas.
- Compatibilidad con GPUs de consumo: sí, cualquier GPU consumer (GTX 1060, RTX 3060, etc.) puede ejecutar el modelo con latencia de milisegundos por token.
- Opciones de despliegue: al ser un `state_dict` de PyTorch, se puede cargar directamente en un script Python. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan archivos preconvertidos.
- Latencia y throughput: no se han medido oficialmente, pero en una CPU moderna se espera una generación de decenas de tokens por segundo; en GPU, cientos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| adimunot/transformer-from-scratch (char) | 1,89 M | 256 | Tiny Shakespeare (5000 pasos) | MIT |
| adimunot/transformer-from-scratch (bpe) | 5,37 M | 256 | Tiny Shakespeare (5000 pasos) | MIT |
| nanoGPT (Karpathy) | ~10 M (config pequeña) | 256-1024 | OpenWebText u otros | MIT |

La comparación con nanoGPT es pertinente porque ambos son implementaciones educativas de Transformers desde cero. Sin embargo, nanoGPT suele entrenarse con datasets más grandes y ofrece configuraciones más flexibles. No se dispone de datos de rendimiento comparativos entre ambos.

## Limitaciones y advertencias

- Modelo puramente educativo: no está diseñado para uso en producción ni para tareas reales de generación de texto.
- Sesgos y alucinaciones: al estar entrenado en un corpus diminuto y homogéneo, el modelo produce texto que imita superficialmente a Shakespeare pero con frecuentes incoherencias y repeticiones.
- Limitaciones de contexto: la ventana de 256 tokens es muy corta, lo que impide mantener coherencia en textos largos.
- Sin soporte multilingüe: solo genera texto en inglés (y con un registro arcaizante).
- Sin garantías de calidad: no se han publicado métricas de evaluación; el autor no ofrece ninguna garantía sobre el comportamiento del modelo.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero al ser un modelo sin valor práctico, su uso comercial es irrelevante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adimunot/transformer-from-scratch
- Repositorio de código fuente: https://github.com/adimunot21/transformer-from-scratch
- Referencia del paper original "Attention Is All You Need": https://arxiv.org/abs/1706.03762
