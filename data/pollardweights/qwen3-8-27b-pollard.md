# PollardWeights/Qwen3.8-27B-Pollard

## Resumen

PollardWeights/Qwen3.8-27B-Pollard es una colección de cuantizaciones GGUF del modelo Qwen3.8-27B, desarrollado por el equipo de Qwen (Alibaba). Esta versión cuantizada, creada por PollardWeights, tiene como objetivo reducir el tamaño del modelo para poder ejecutarlo en hardware con memoria limitada, como un Mac de 16 GB o una GPU de 12 GB de VRAM, manteniendo la mayor fidelidad posible. El modelo base es un transformer denso de 27 000 millones de parámetros, multimodal (texto, imagen y vídeo), con una ventana de contexto nativa de 262 144 tokens (256K), extensible hasta 1M según fuentes externas. La cuantización se ha realizado con la herramienta Pollard Weights, partiendo de un checkpoint Q8_0 casi sin pérdidas y utilizando la matriz de importancia (imatrix) original del propio Qwen3.8-27B, lo que garantiza una distribución de pesos óptima para cada nivel de cuantización.

Se ofrecen tres archivos GGUF principales (IQ3_S, IQ4_XS y Q6_K) junto con un proyector de visión en bf16 sin cuantizar, lo que permite desplegar el modelo en entornos desde 12 GB de VRAM hasta 32 GB. La licencia Apache-2.0 heredada del modelo base permite uso comercial sin restricciones. Esta ficha se centra en la versión cuantizada, aunque se hace referencia al modelo original cuando es necesario para contextualizar capacidades y rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (dense, 65 capas, 5120 hidden) |
| Parametros totales | 27B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | IQ3_S (~13 GB), IQ4_XS (~16 GB), Q6_K (~20 GB) + proyector de vision bf16 (0,93 GB) |
| Idiomas soportados | en (segun model card; el modelo base podria soportar mas, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con arquitectura `qwen35`, compuesto por 65 capas y una dimensión oculta de 5120. Es multimodal nativo, capaz de procesar texto, imágenes y vídeo, y utiliza un formato de prompt ChatML (Qwen3.5). Según las fuentes web, incorpora un modo de razonamiento explícito que puede mejorar la resolución de problemas complejos a costa de mayor latencia y consumo de tokens. El entrenamiento del modelo base fue realizado por el equipo de Qwen, con mejoras declaradas en codificación y productividad de oficina, aunque los benchmarks publicados son reportados por el propio Alibaba y no han sido reproducidos de forma independiente.

La versión de PollardWeights no es un reentrenamiento, sino una cuantización. Se partió de un checkpoint Q8_0 (considerado casi sin pérdidas, ~99,9 % de la precisión bf16) y se aplicó el método de cuantización de Pollard Weights, que utiliza la imatrix del propio Qwen3.8-27B para asignar niveles de precisión por tensor. Los tensores no cubiertos por la imatrix se fijan a `q6_K`. El resultado son tres archivos GGUF con distintos equilibrios entre tamaño y fidelidad, todos ellos compatibles con llama.cpp y su ecosistema.

## Capacidades

- Generación de texto y conversación multi-turno en formato ChatML.
- Comprensión de imágenes y vídeo (multimodal), gracias al proyector de visión mmproj en bf16.
- Modo de razonamiento explícito (thinking mode) que mejora tareas complejas de lógica y matemáticas, según las fuentes del modelo base.
- Soporte de contexto largo de hasta 256K tokens, útil para documentos extensos o conversaciones prolongadas.
- Capacidades multilingües: la model card indica solo inglés, aunque el modelo base de Qwen suele soportar más idiomas; no se confirma en esta versión.
- No se documenta soporte explícito de tool calling o function calling en la información proporcionada, aunque el modelo base podría incluirlo; no se puede confirmar.

## Casos de uso

- Asistente de atención al cliente en inglés: el modelo puede gestionar conversaciones multi-turno con contexto largo (256K tokens), lo que permite mantener el historial completo de una interacción sin truncamientos. Su tamaño cuantizado (IQ3_S, ~13 GB) lo hace viable en un Mac de 16 GB o una GPU de 12 GB.
- Análisis de documentos extensos: gracias a la ventana de 256K tokens, puede resumir o extraer información de contratos, informes o libros completos en una sola pasada, sin necesidad de dividir el texto.
- Descripción y análisis de imágenes en entornos con recursos limitados: el proyector de visión permite alimentar al modelo con imágenes y obtener descripciones detalladas, útil para aplicaciones de accesibilidad o moderación de contenido en hardware modesto.
- Generación de código asistida en local: el modelo base tiene mejoras declaradas en codificación; la cuantización Q6_K (~20 GB) en una GPU de 32 GB ofrece una fidelidad cercana a la original, adecuada para entornos de desarrollo sin conexión.
- Prototipado de chatbots con razonamiento: el modo de razonamiento explícito permite construir asistentes que expliquen sus pasos antes de responder, útil para aplicaciones educativas o de soporte técnico donde se requiere transparencia.
- Despliegue en servidores de inferencia con llama.cpp: los archivos GGUF se integran directamente con `llama-server`, que expone una API compatible con OpenAI, facilitando su uso en pipelines de producción con GPU de 24 GB o 32 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. La model card menciona valores de perplejidad (PPL) y tokens por segundo (tok/s) medidos solo para el nivel IQ3_S en un Mac M4, pero no se proporcionan cifras concretas. Los resultados de benchmarks del modelo base Qwen3.8-27B son reportados por Alibaba y no han sido verificados de forma independiente, por lo que no se incluyen aquí para evitar datos no contrastados.

## Requisitos de hardware

- IQ3_S (~13 GB): recomendado para Mac de 16 GB o GPU con 12 GB de VRAM. Es la opción más ligera y la única con mediciones de rendimiento publicadas (aunque sin cifras concretas).
- IQ4_XS (~16 GB): adecuado para GPU de 24 GB, como una RTX 3090. Ofrece mayor fidelidad que IQ3_S.
- Q6_K (~20 GB): pensado para sistemas con 32 GB de memoria, como una RTX 4090 o A6000. Calidad casi sin pérdidas.
- El proyector de visión (0,93 GB) debe cargarse junto con el modelo para funcionalidad multimodal; se mantiene en bf16 y no debe cuantizarse.
- Se requiere una versión reciente de llama.cpp con soporte para la arquitectura `qwen35`. Las herramientas de despliegue incluyen `llama-server` (API OpenAI + interfaz web) y `llama-mtmd-cli` para inferencia multimodal por línea de comandos.
- No se dispone de datos de latencia o throughput más allá de la mención de tok/s en M4 para IQ3_S, sin valores numéricos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otras cuantizaciones de modelos similares. El modelo base Qwen3.8-27B es un denso de 27B con contexto 256K y multimodal, pero no se han encontrado datos de otras cuantizaciones del mismo modelo ni de alternativas comparables en la información proporcionada. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Al ser una cuantización, existe una pérdida de calidad respecto al modelo original en bf16, especialmente en los niveles más agresivos (IQ3_S). La model card afirma que la fuente Q8_0 es casi sin pérdidas, pero la degradación depende de la tarea.
- La model card solo declara inglés como idioma soportado; el uso en otros idiomas puede degradar el rendimiento, aunque el modelo base de Qwen suele ser multilingüe.
- No se han publicado benchmarks independientes para esta cuantización; los resultados del modelo base son reportados por el vendedor y no verificados.
- El modo de razonamiento explícito aumenta la latencia y el consumo de tokens, lo que puede ser un inconveniente en aplicaciones en tiempo real.
- Requiere una versión reciente de llama.cpp con soporte `qwen35`; versiones antiguas no podrán cargar el modelo.
- El proyector de visión debe mantenerse en bf16; cuantizarlo degradaría la calidad multimodal.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base original para cualquier obligación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PollardWeights/Qwen3.8-27B-Pollard
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Pollard Weights: https://github.com/WestWaters/pollard-weights
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Página de benchmarks del modelo base (BenchLM): https://benchlm.ai/models/qwen3-8-27b
- Reseña técnica del modelo base (AI/TLDR): https://ai-tldr.dev/models/qwen3-8-27b/
- Página oficial de QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Reseña en Neomanex: https://neomanex.com/models/qwen3-8-27b
