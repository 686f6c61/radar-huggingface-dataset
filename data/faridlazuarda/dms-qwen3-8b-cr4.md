# faridlazuarda/dms-qwen3-8b-cr4

## Resumen

DMS Qwen3-8B es un conjunto de adaptadores de compresión de caché KV basados en la técnica Dynamic Memory Sparsification (DMS), entrenados sobre el modelo base Qwen/Qwen3-8B. El repositorio, publicado por faridlazuarda, contiene únicamente los adaptadores entrenados (aproximadamente 1 MB, 72 tensores) y no duplica los pesos del modelo base. El objetivo es lograr una compresión de la caché KV de 4x manteniendo la fidelidad al modelo original mediante destilación KL.

La relevancia de este modelo radica en que aborda uno de los principales cuellos de botella de los transformers autoregresivos: el crecimiento lineal de la caché KV con la longitud de secuencia. Al comprimir la caché KV, se reduce el consumo de memoria durante la inferencia y se permite procesar contextos más largos con el mismo hardware. El modelo sigue la receta original de NVIDIA Model-Optimizer, lo que garantiza reproducibilidad y consistencia con el estado del arte en compresión de caché KV.

El repositorio incluye un script de carga (`load_dms.py`) que reconstruye el checkpoint completo combinando los pesos base congelados con los adaptadores, verificando que la reconstrucción sea bit-idéntica al checkpoint entrenado. La licencia es Apache-2.0, compatible tanto con Qwen3-8B como con NVIDIA Model-Optimizer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con adaptadores DMS por cabeza de atención |
| Parametros totales | 8.000 millones (base) + ~1 MB (adaptadores) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (ventana deslizante de 512) |
| Tipos de cuantizacion | no disponible (entrenado en bf16) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3-8B) |
| Licencia | Apache-2.0 |
| Formato de pesos | Adaptadores safetensors (~1 MB) + script de reconstruccion |

## Arquitectura y entrenamiento

DMS (Dynamic Memory Sparsification) es una técnica que introduce adaptadores entrenables por cabeza de atención (`dms_proj_alpha`, `dms_proj_alpha_norm`) que deciden dinámicamente qué posiciones de la caché KV deben mantenerse o descartarse. El modelo base Qwen3-8B permanece completamente congelado durante el entrenamiento; solo se actualizan los 72 tensores de los adaptadores. La compresión se controla mediante un hiperparámetro `dms_cr` que define la fracción de posiciones cerradas (evictadas) en la caché.

El entrenamiento utilizó 4000 muestras del dataset OpenR1-Math-220k, con una ventana de contexto de 8192 tokens y ventana deslizante de 512. Se realizaron 544 pasos con un aumento progresivo de la compresión durante los primeros 510 pasos (CR ramp), hasta alcanzar el objetivo de compresión 4.0. El optimizador fue AdamW con learning rate constante de 3e-5 y beta2 de 0.95, en precisión bf16. La función de pérdida combina destilación KL contra el modelo base congelado (como profesor) y un término de compresión que penaliza no alcanzar la fracción objetivo de posiciones cerradas.

El entrenamiento se ejecutó en 2 GPUs H200 durante 28.7 horas. Al final del entrenamiento, se alcanzó una compresión real de 4.514 (media de 4.198 en los últimos 32 pasos), superando el objetivo de 4.0. La pérdida de destilación KL final fue de 0.00431, lo que indica una buena fidelidad al modelo base.

## Capacidades

- Compresion de caché KV 4x: reduce el consumo de memoria de la caché KV en un factor de 4, permitiendo procesar secuencias más largas o aumentar el batch size con el mismo hardware.
- Reconstruccion bit-idéntica: el script `load_dms.py` reconstruye el checkpoint entrenado exactamente, verificando que los 366 tensores coinciden con el original.
- Compatibilidad con transformers: una vez reconstruido, el modelo se carga con `AutoModelForCausalLM` estándar de HuggingFace.
- Hereda las capacidades de Qwen3-8B: generación de texto, razonamiento, código, matemáticas y capacidades multilingües del modelo base (no modificadas por los adaptadores).
- Entrenamiento eficiente: solo se entrenan ~1 MB de parámetros, lo que requiere recursos mínimos comparado con un fine-tuning completo.
- Reproducibilidad: la receta de entrenamiento está fijada en un commit específico de NVIDIA Model-Optimizer, y la configuración completa está disponible en `train_config.yaml`.

## Casos de uso

- Inferencia de largo contexto en producción: con la compresión 4x de la caché KV, se pueden procesar secuencias de hasta 8192 tokens con un 75% menos de memoria para la caché, permitiendo desplegar Qwen3-8B en GPUs con menos VRAM o aumentar el throughput.
- Despliegue en hardware limitado: al reducir la memoria necesaria para la caché KV, el modelo puede ejecutarse en GPUs de consumo como RTX 4090 (24 GB) o incluso GPUs con 16 GB, donde el modelo base sin compresión tendría dificultades con contextos largos.
- Procesamiento por lotes de alta concurrencia: la reducción de memoria por secuencia permite aumentar el batch size, mejorando el throughput en servicios de generación de texto.
- Fine-tuning posterior sobre el modelo comprimido: al ser adaptadores, se puede combinar con otras técnicas de adaptación (LoRA, etc.) para tareas específicas sin necesidad de reentrenar el modelo completo.
- Investigación en compresión de caché KV: sirve como punto de partida para experimentar con diferentes configuraciones de DMS (ratios de compresión, ventanas deslizantes, datasets) sobre Qwen3-8B.
- Evaluación de calidad vs. compresión: permite estudiar el trade-off entre compresión de caché y calidad de generación en tareas de razonamiento matemático, dado que se entrenó específicamente con OpenR1-Math-220k.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que los adaptadores no han sido evaluados en tareas downstream (LongBench, RULER, razonamiento matemático) y que la pérdida KL reportada es solo un diagnóstico de entrenamiento, no evidencia de calidad a nivel de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible directamente, pero la compresión 4x de la caché KV reduce significativamente los requisitos de memoria para contextos largos. Para Qwen3-8B en bf16, los pesos ocupan aproximadamente 16 GB; con la caché KV comprimida, el total podría caber en GPUs de 24 GB para secuencias de 8192 tokens.
- GPU recomendadas: el entrenamiento se realizó en 2x H200 (141 GB cada una). Para inferencia, se recomiendan GPUs con al menos 24 GB de VRAM (RTX 4090, A10G, L4) para el modelo completo en bf16, o menos si se usa cuantización adicional.
- Compatibilidad con GPUs de consumo: sí, una RTX 4090 (24 GB) o RTX 3090 (24 GB) debería ser suficiente para el modelo reconstruido con contextos de hasta 8192 tokens gracias a la compresión de caché.
- Opciones de despliegue: el modelo reconstruido es un checkpoint estándar de transformers, por lo que puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput: no disponibles. La compresión de caché KV puede reducir la latencia en generación de secuencias largas al disminuir el acceso a memoria, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion KV | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DMS Qwen3-8B (este) | 8B + adaptadores | 8192 | 4x | Apache-2.0 | Adaptadores en HF |
| Qwen3-8B (base) | 8B | 8192 (hasta 131072 con YaRN) | Sin compresion | Apache-2.0 | Pesos completos en HF |
| Qwen3-1.7B con DMS | 1.7B + adaptadores | 8192 | 4x | Apache-2.0 | Adaptadores en HF (mismo autor) |

La comparativa directa con otros modelos de compresión de caché KV (como H2O, StreamingLLM o SnapKV) no está disponible en la información proporcionada. La principal diferencia con el modelo base es la reducción de memoria de caché a costa de una posible degradación de calidad no cuantificada.

## Limitaciones y advertencias

- Sin benchmarks downstream: el autor no ha evaluado el modelo en tareas estándar, por lo que se desconoce el impacto real de la compresión 4x en la calidad de generación.
- Solo adaptadores: el repositorio no contiene los pesos del modelo base; es necesario descargar Qwen/Qwen3-8B por separado y ejecutar el script de reconstrucción.
- Dependencia de código externo: se requiere instalar el paquete `dms` desde NVIDIA Model-Optimizer, lo que añade una dependencia adicional al flujo de trabajo.
- Carga no directa: `AutoModelForCausalLM.from_pretrained` no funciona directamente sobre este repositorio; hay que usar `load_dms.py` primero.
- Entrenamiento específico de dominio: el entrenamiento se realizó solo con datos de matemáticas (OpenR1-Math-220k), por lo que el comportamiento en otros dominios puede diferir del modelo base.
- Riesgo de alucinación: no se ha evaluado, pero es esperable que sea similar al del modelo base Qwen3-8B.
- Sin garantía de calidad en producción: al no haber benchmarks, no se recomienda su uso en producción sin una evaluación previa en la tarea específica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/faridlazuarda/dms-qwen3-8b-cr4
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Paper DMS: https://arxiv.org/abs/2506.05345
- NVIDIA Model-Optimizer (experimental/dms): https://github.com/NVIDIA/Model-Optimizer/tree/main/experimental/dms
- Variante 1.7B del mismo autor: https://huggingface.co/faridlazuarda/dms-qwen3-1.7b-cr4
