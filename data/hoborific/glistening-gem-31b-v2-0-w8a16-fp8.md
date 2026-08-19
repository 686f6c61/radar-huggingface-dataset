# hoborific/Glistening-Gem-31B-v2.0-W8A16-FP8

## Resumen

Glistening-Gem-31B-v2.0-W8A16-FP8 es una versión cuantizada del modelo base sophosympatheia/Glistening-Gem-31B-v2.0, publicada por el usuario hoborific. El objetivo de esta variante es reducir el consumo de memoria y acelerar la inferencia en hardware compatible con kernels W8A16-FP8, manteniendo una calidad cercana a la del modelo original. Se trata de un modelo multimodal (image-text-to-text) de aproximadamente 31 000 millones de parámetros, basado en una arquitectura de tipo Gemma (según las etiquetas del repositorio, sin especificar versión concreta).

La cuantización se realiza offline mediante la librería compressed-tensors, con pesos en formato float8_e4m3fn y escalas por canal de salida, mientras que las activaciones se mantienen en bf16/fp16. El proceso solo afecta a las capas lineales 2D (proyecciones de atención y MLP), dejando embeddings, normas, lm_head, routers y la torre de visión en bf16. El modelo está pensado para su despliegue con vLLM en entornos Intel XPU y NVIDIA CUDA (SM75+), y no es compatible con ROCm, CPU o TPU.

La relevancia de esta ficha radica en que ofrece una opción práctica para ejecutar un modelo de 31B en GPUs con VRAM limitada (por ejemplo, 40 GB o 80 GB) aprovechando el formato FP8, siempre que se disponga del hardware y los kernels adecuados. No se dispone de información sobre la licencia, los idiomas soportados ni los detalles de entrenamiento del modelo base, por lo que estos aspectos quedan pendientes de confirmación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Gemma (variante no especificada, etiqueta "gemma4") |
| Parametros totales | 31 266 895 724 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W8A16 FP8 (float8_e4m3fn, escalas por canal de salida) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización del checkpoint sophosympatheia/Glistening-Gem-31B-v2.0. La cuantización se realizó offline con la librería compressed-tensors en formato `float-quantized`: los pesos de cada capa lineal 2D se almacenan en float8_e4m3fn con una escala simétrica por canal de salida. La escala se calcula inicialmente como `amax / 448` y luego se refina mediante una búsqueda de recorte (clip) basada en el error cuadrático medio sobre aproximadamente nueve fracciones de recorte (0.8–1.0× amax), seleccionando la escala que minimiza el error por fila. Los pesos se cuantizan con redondeo al más cercano y saturación.

Solo se cuantizan las proyecciones lineales 2D de atención (q/k/v/o) y MLP (gate/up/down). Las capas de embedding, normalización, lm_head, routers/experts y la torre de visión permanecen en bf16 y se incluyen en la lista `ignore` del checkpoint para que vLLM no las modifique. No se ha publicado información sobre el entrenamiento del modelo base (datos, tokens, método de alineación como RLHF o DPO), por lo que este apartado queda sin datos disponibles.

## Capacidades

- Procesamiento multimodal: al ser un modelo image-text-to-text, es capaz de recibir imágenes y texto como entrada y generar texto como salida.
- Generación de texto y razonamiento: como cuantización del modelo base, hereda sus capacidades generales de lenguaje, aunque no se documentan detalles específicos en la información proporcionada.
- Soporte de tool calling y agentes: no se menciona en la documentación disponible; se desconoce si el modelo base los implementa.
- Capacidades multilingües: no se especifican idiomas soportados.
- Modo de pensamiento (thinking mode), visión o audio: no se dispone de información adicional más allá de la naturaleza multimodal.

## Casos de uso

- Despliegue de un modelo multimodal de 31B en producción con vLLM: la cuantización W8A16 FP8 reduce el uso de VRAM en comparación con el checkpoint original en bf16, lo que permite servirlo en GPUs de 40 GB o 80 GB (p. ej., A100, H100, L40S) con kernels optimizados para NVIDIA CUDA o Intel XPU.
- Sistemas de respuesta a preguntas sobre imágenes: al ser image-text-to-text, puede utilizarse en aplicaciones que requieran describir o razonar sobre contenido visual, siempre que el modelo base tenga esa capacidad (no confirmada en esta ficha).
- Asistentes conversacionales con contexto largo: si el modelo base soporta ventanas de contexto amplias, la versión cuantizada podría emplearse en chatbots de atención al cliente o asistentes virtuales, aunque no se dispone del dato de contexto.
- Investigación y evaluación de técnicas de cuantización: este repositorio sirve como ejemplo de cuantización FP8 por canal con búsqueda de recorte, útil para estudiar el impacto en calidad y rendimiento frente a otros métodos como el per-tensor de vLLM.
- Pruebas de compatibilidad de kernels W8A16-FP8: desarrolladores que trabajen con vLLM en Intel XPU o NVIDIA pueden usar este modelo para validar sus entornos y medir throughput y latencia.
- Fine-tuning o adaptación posterior: aunque el checkpoint ya está cuantizado, podría servir como punto de partida para experimentos de fine-tuning con pesos FP8, si la librería lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Tampoco se incluyen mediciones de latencia o throughput para la versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP8 (1 byte por parámetro), el checkpoint ocupa aproximadamente 31 GB solo en pesos. Sumando activaciones en bf16, overhead de KV cache y buffers, se recomienda al menos 40 GB de VRAM para servir el modelo con una ventana de contexto moderada. Para mayor holgura, 80 GB es lo más seguro.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), L40S (48 GB), RTX 4090 (24 GB) no sería suficiente para los 31 GB de pesos; se necesitaría cuantización adicional o particionado. También compatible con Intel XPU (por ejemplo, Max 1100/1550) mediante el kernel `XPUW8A16FP8LinearKernel`.
- En consumer GPU: no cabe en GPUs de 24 GB (RTX 3090/4090) sin técnicas de offloading o cuantización más agresiva. Se requieren GPUs profesionales o de datacenter con al menos 40 GB.
- Opciones de despliegue: vLLM es el motor soportado. En NVIDIA CUDA (SM75+, Turing o posterior) se usa `HummingFP8ScaledMMLinearKernel` si el paquete `humming` está instalado; de lo contrario, `MarlinFP8ScaledMMLinearKernel`. En Intel XPU se usa `XPUW8A16FP8LinearKernel`. No se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría (tamaño y tarea). Se desconoce el rendimiento del modelo base frente a alternativas como Llama 3.1 30B, Gemma 2 27B o Qwen 2.5 32B, y no hay datos de benchmarks. La única referencia directa es el checkpoint original sophosympatheia/Glistening-Gem-31B-v2.0, del cual esta versión es una cuantización, pero no se dispone de sus especificaciones completas (contexto, licencia, entrenamiento).

## Limitaciones y advertencias

- Compatibilidad restringida: el modelo solo funciona con vLLM en Intel XPU o NVIDIA CUDA (SM75+). No es compatible con ROCm, CPU, TPU, y cargarlo en esos backends producirá un error de kernel no disponible.
- Licencia no especificada: no se indica la licencia del modelo cuantizado ni la del modelo base. Esto puede impedir su uso comercial sin una revisión legal previa.
- Pérdida de precisión inherente a la cuantización: aunque el método por canal con búsqueda de recorte busca minimizar el error, la conversión a FP8 puede degradar ligeramente la calidad en tareas sensibles a la precisión numérica.
- Sesgos y alucinaciones: no se ha publicado ninguna evaluación sobre sesgos, toxicidad o tendencia a alucinar del modelo base, por lo que no se puede garantizar su seguridad en producción.
- Información incompleta: se desconocen la longitud de contexto, los idiomas soportados y los detalles de entrenamiento del modelo base, lo que limita la capacidad de evaluar su idoneidad para casos de uso específicos.
- Riesgo de sobreajuste a la cuantización: el checkpoint está pensado para kernels específicos; usarlo con otras herramientas de inferencia podría dar resultados inesperados o fallos de carga.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/hoborific/Glistening-Gem-31B-v2.0-W8A16-FP8
- Modelo base: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.0
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
