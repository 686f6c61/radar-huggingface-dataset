# Entrit/Qwen3.8-27B-d2dense

## Resumen

Qwen3.8-27B-d2dense es una versión cuantizada del modelo Qwen/Qwen3.8-27B, publicada por Entrit bajo el códec propietario d2. La modificación afecta a las proyecciones de atención, DeltaNet y MLP, cuyos pesos se sustituyen por valores ternarios agrupados de 9 niveles; el resto de componentes (embeddings, cabeza de salida, normalizaciones y las pequeñas proyecciones de puerta de DeltaNet) se mantienen intactos respecto al modelo base. El resultado se almacena de nuevo en bf16, de modo que el repositorio ocupa 54,7 GB y es cargable con `transformers` estándar sin kernels personalizados.

El modelo conserva los 27.356.728.560 parámetros del original y está etiquetado como `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del base, aunque la model card no las detalla. La propuesta de Entrit no es reducir el tamaño en disco, sino demostrar que una cuantización extrema a ~3,4 bits por peso puede mantener la funcionalidad del modelo con el mismo formato de despliegue.

Es relevante ahora porque explora una vía distinta a las cuantizaciones convencionales (GPTQ, AWQ, GGUF): pesos de baja precisión "dequantizados" a bf16, con la promesa de que el código de inferencia no cambia. La contrapartida es que no hay benchmarks publicados frente al modelo FP16, por lo que su utilidad práctica en producción aún no está validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención y capas DeltaNet (heredada de Qwen3.8-27B); no se detalla la combinación exacta |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | d2 de Entrit: 9 niveles `{0, ±1, ±2.83, ±5.20, ±8}` con una escala por grupo de 64 pesos (~3,4 bits/peso), almacenada dequantizada en bf16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | safetensors (bf16 dequantizado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B, que combina mecanismos de atención con capas DeltaNet, un tipo de atención lineal recurrente. Entrit no reentrena ni hace ajuste fino: aplica una cuantización post-entrenamiento sobre las proyecciones de atención, DeltaNet y MLP. Cada peso se aproxima a uno de nueve niveles simétricos, multiplicado por una escala compartida por cada bloque de 64 pesos, lo que arroja una tasa efectiva de aproximadamente 3,4 bits por peso.

La innovación técnica es el propio codec d2: en lugar de empaquetar los pesos de baja precisión en un formato compacto con kernels dedicados, el autor los expande de nuevo a bf16. Esto mantiene la compatibilidad total con la pila de `transformers` y con `device_map="auto"`, pero elimina el ahorro de memoria en VRAM. La cabeza MTP (multi-token prediction) del modelo base no se incluye, por lo que se pierde la decodificación especulativa nativa que ofrecía el original. No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF o DPO, ya que el modelo hereda íntegramente el entrenamiento del base.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto (`image-text-to-text` en los tags), presumiblemente con el mismo encoder visual del base; no confirmado en la model card.
- Razonamiento multi-paso y matemáticas: capacidad esperada por herencia del base, sin verificación publicada tras la cuantización.
- Generación de código: capacidad esperada por herencia, sin evaluación publicada.
- Tool calling y function calling: no documentado explícitamente para esta variante.
- Soporte de agentes: no documentado.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no documentado para esta variante.

## Casos de uso

- Evaluación de cuantización extrema en investigación: comparar la calidad de salida del d2 frente al Qwen3.8-27B original en tareas de razonamiento y generación, para medir la degradación real de un esquema de ~3,4 bits/peso. Es el uso más directo dado que el autor no ha publicado benchmarks.
- Despliegue con `transformers` sin cambios de infraestructura: al almacenarse en bf16, el modelo se carga con `AutoModelForCausalLM.from_pretrained` y `device_map="auto"`, lo que permite integrarlo en pipelines existentes sin kernels ni librerías adicionales.
- Prototipado de asistentes conversacionales: la ventana de contexto no está documentada, pero al heredar la del base permite conversaciones multi-turno; conviene validar la longitud efectiva antes de fijar el diseño.
- Experimentación con modelos multimodales: si se confirma la herencia del encoder visual, serviría para pruebas de image-text-to-text en entornos de investigación con licencia Apache 2.0.
- Base para estudios de compresión: el códec d2, con patente pendiente, es un objeto de estudio en sí mismo para quienes investigan cuantización por grupos con escalas compartidas.
- Fine-tuning ligero sobre pesos cuantizados: al estar en bf16 estándar, es técnicamente posible aplicar LoRA o adaptadores, aunque la interacción entre el ruido de cuantización y el ajuste no está estudiada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "Not yet benchmarked against the FP16 base model".

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 64-80 GB para contexto moderado.
- El formato d2 no reduce el consumo de VRAM, ya que los pesos se almacenan dequantizados en bf16.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16 sin técnicas adicionales de offloading a CPU o disco.
- Opciones de despliegue: `transformers` con Accelerate; vLLM, TGI o llama.cpp no están confirmados para esta variante y requerirían verificación, dado que el formato es safetensors bf16 estándar pero la arquitectura incluye DeltaNet.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Entrit/Qwen3.8-27B-d2dense | 27,36 B | No disponible | d2 (~3,4 bits/peso), almacenado en bf16 | Apache 2.0 | Hugging Face, 15 descargas |
| Qwen/Qwen3.8-27B (base) | 27,36 B | No disponible en la informacion | bf16 original | Apache 2.0 | Hugging Face |
| Otras variantes cuantizadas de Qwen3.8-27B (GPTQ/AWQ/GGUF) | 27,36 B | Segun variante | 4-8 bits tipicos, con kernels dedicados | Apache 2.0 | Ecosistema habitual de cuantizacion |

La comparación directa con el base es la más relevante: misma arquitectura, mismos parámetros y misma licencia, pero con pesos aproximados a 9 niveles y sin cabeza MTP. Frente a cuantizaciones convencionales, d2 no reduce el tamaño del repositorio (54,7 GB) ni la VRAM, por lo que su ventaja, si existe, sería de calidad por bit frente a esquemas de 3-4 bits empaquetados; esa ventaja no está medida.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de la degradación de calidad frente al modelo FP16, ni en MMLU, HumanEval, GSM8K ni en tareas multimodales.
- El ahorro de memoria es nulo en inferencia: los pesos se guardan dequantizados en bf16, por lo que el repositorio ocupa lo mismo que el original (54,7 GB).
- Se elimina la cabeza MTP del modelo base, lo que descarta la decodificación especulativa nativa y puede reducir el throughput.
- El códec d2 está sujeto a solicitudes de patente pendientes por Entrit Systems; el uso comercial del esquema de cuantización podría verse afectado aunque la licencia del modelo sea Apache 2.0.
- Riesgo de alucinación: no cuantificado para esta variante; la cuantización agresiva a ~3,4 bits/peso puede amplificar errores en tareas de razonamiento y matemáticas.
- Idiomas soportados no documentados; no se puede garantizar el comportamiento multilingüe del base.
- Longitud de contexto no disponible en la información proporcionada.
- Capacidades multimodales inferidas solo del tag `image-text-to-text`, sin confirmación en la model card.
- Proyecto con muy poca tracción (15 descargas, 1 like) y sin comunidad que valide su funcionamiento; tratar como experimental.
- Compatibilidad con vLLM, TGI o llama.cpp no verificada; la presencia de capas DeltaNet puede limitar el soporte en motores de inferencia de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Entrit/Qwen3.8-27B-d2dense
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Contacto del autor: eric@entrit.io
