# Lbuk/TheSystem-9B-Probe-256

## Resumen

TheSystem-9B-Probe-256 es un modelo de decisión construido sobre el backbone congelado Qwen3.5-9B. Lo desarrolla Leszek Bukowski (usuario Lbuk) y su objetivo es unificar en un solo LLM dos comportamientos que habitualmente requieren modelos separados: seleccionar una respuesta entre un conjunto de opciones dadas (modo decisión) y generar texto libre (modo generación). Para ello introduce una compuerta interna aprendida, `<FAST>`, que decide una vez por prompt qué ruta activar.

La innovación principal es la analogía con los sistemas uno y dos de Kahneman: el modelo conserva su capacidad generativa original intacta y añade una ruta rápida de decisión implementada como un clasificador tipo probe de una capa oculta de 256 unidades que lee el estado interno del backbone congelado. El entrenamiento separa dos objetivos: enseñar a la compuerta a distinguir prompts de decisión de prompts generativos, y enseñar al clasificador a elegir la respuesta correcta entre las opciones suministradas.

Este release (Probe-256) es la variante con probe classifier, frente a la variante con LoRA publicada por el mismo autor. La relevancia es conceptual y práctica: demuestra que se puede añadir capacidad de decisión a un LLM sin degradar su generación, con un coste de entrenamiento reducido (solo se entrena la compuerta y el probe, no el backbone de 9B). El modelo está orientado a inglés y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B congelado) con compuerta `<FAST>` y probe classifier de una capa oculta de 256 unidades |
| Parametros totales | 9B en el backbone (aproximado por el nombre del modelo); tamaño del probe y la compuerta no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el demo en Colab usa BF16 nativo) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 (código y pesos aprendidos); el backbone Qwen3.5-9B mantiene su aviso Apache 2.0 |
| Formato de pesos | No disponible (repo de 0.0 GB según Hugging Face; pesos probablemente descargados en tiempo de ejecución desde el backbone) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B como backbone congelado, es decir, los pesos del transformer no se modifican. Sobre esa base se añaden dos componentes entrenables: una compuerta `<FAST>` que clasifica cada prompt como decisión o generación, y un probe classifier (una capa oculta de 256 unidades) que, leyendo el estado interno del backbone, selecciona una respuesta entre las opciones proporcionadas. En modo generación los componentes de decisión se desactivan por completo y el modelo original produce el texto, lo que preserva el comportamiento generativo intacto.

El entrenamiento usa 18.000 ejemplos del dataset TheSystem-Data, compartidos con la variante LoRA. Los prompts de enrutamiento se construyeron en parte a partir de los propios ejemplos de respuesta, y la compuerta publicada se entrenó además con prompts de enrutamiento más variados. Los dos objetivos (distinguir decisión de generación, y elegir la respuesta correcta) se entrenan por separado. En todas las pruebas del release se desactivó el modo thinking nativo de Qwen (`enable_thinking=False`); el autor prevé publicar resultados con thinking habilitado en una versión futura. Las referencias técnicas citadas son LoRA (arXiv:2106.09685) y los probe classifiers (arXiv:1610.01644).

## Capacidades

- Selección de respuestas: dado un prompt y un conjunto de opciones suministradas, el probe elige una de ellas (`mode="decision"`).
- Generación de texto libre: con `mode="generation"` se usa la ruta generativa original de Qwen3.5-9B sin interferencia de los componentes de decisión.
- Enrutamiento automático: con `mode="auto"`, la compuerta `<FAST>` decide por prompt si responder seleccionando o generando.
- Razonamiento y generación heredados del backbone Qwen3.5-9B en modo generación.
- Capacidades multilingües: limitadas al inglés según la model card, aunque el backbone podría tener otras; no verificado en este release.
- Tool calling, agentes y multi-step reasoning: no documentados en la información disponible.
- Modo thinking: desactivado explícitamente en este release.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar una consulta entrante como "Facturación" o "Soporte" usando `mode="decision"` con las categorías como opciones, y reservar la generación para redactar la respuesta al usuario.
- Clasificación con opciones cerradas en pipelines de atención al cliente: el probe selecciona entre intenciones predefinidas sin necesidad de un segundo modelo clasificador, reduciendo la infraestructura a un único despliegue.
- Respuesta automática redactada: cuando la consulta requiere texto libre, `mode="auto"` deriva a la ruta generativa de Qwen3.5-9B para componer la respuesta con el tono adecuado.
- Triaje de correos o formularios: elegir entre categorías de acción (responder, escalar, archivar) a partir de opciones suministradas por el sistema.
- Asistentes conversacionales con modos mixtos: alternar entre selección rápida de respuestas canónicas y generación libre según el turno, usando una sola instancia del modelo.
- Investigación sobre arquitecturas de decisión: servir como referencia reproducible (notebook de evaluación y documentación de reproducibilidad) para estudiar la separación entre sistemas uno y dos en LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al notebook de evaluación y al documento de resultados del repositorio de GitHub, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: el demo oficial recomienda una GPU con BF16 nativo, como una A100; se sugiere probar con 24 GB, aunque el ajuste no está verificado. Al ser un backbone de 9B, en BF16 se necesitan aproximadamente 18 GB solo para pesos, más memoria para activaciones y el probe.
- GPU recomendadas: A100 (referencia del autor), H100 para mayor throughput; en consumer, una RTX 4090 de 24 GB podría intentarse según la nota del autor, sin garantía.
- Cabe en consumer GPU: posiblemente en RTX 4090 (24 GB) en BF16, no verificado; con cuantización a 8 o 4 bits cabría en GPUs de 16 GB o menos, aunque no se documentan cuantizaciones para este release.
- Opciones de despliegue: el flujo oficial es el notebook de Colab del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. El tag `custom-code` implica que se requiere código propio para cargar el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheSystem-9B-Probe-256 | 9B (backbone) + probe | No disponible | Decisión + generación con compuerta `<FAST>` | Apache 2.0 | Hugging Face (0 descargas) |
| TheSystem-9B-LoRA | 9B (backbone) + LoRA | No disponible | Decisión + generación con adaptadores LoRA | Apache 2.0 | Hugging Face (mismo autor) |
| Nimble | No disponible | No disponible | Modelo de decisión sobre LLM decoder-only | No disponible | GitHub (bespokelabsai) |
| Jev (System One) | No disponible | No disponible | Modelo de decisión tipo System One | No disponible | Blog de typesafe.ai |

La comparación con Nimble y Jev es conceptual, ya que la model card los cita como trabajos previos de modelos de decisión; no se dispone de sus especificaciones numéricas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- El modo thinking de Qwen está desactivado en este release; no se han publicado resultados con thinking habilitado.
- El probe classifier está entrenado sobre 18.000 ejemplos de un dataset propio; su generalización a dominios fuera de distribución es desconocida.
- El repo de Hugging Face muestra 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que los pesos se obtienen en tiempo de ejecución desde el backbone; la reproducibilidad depende de la disponibilidad de Qwen3.5-9B.
- El ajuste en GPUs de 24 GB no está verificado por el autor.
- Riesgo de alucinación: en modo generación se hereda el del backbone Qwen3.5-9B; en modo decisión, el probe puede elegir una opción incorrecta si el estado interno no separa bien las clases.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse los avisos de terceros del backbone Qwen y los términos del dataset TheSystem-Data.
- El tag `custom-code` implica que la carga estándar de `transformers` probablemente no es suficiente; se requiere el código del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Lbuk/TheSystem-9B-Probe-256
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante LoRA: https://huggingface.co/Lbuk/TheSystem-9B-LoRA
- Dataset: https://huggingface.co/datasets/Lbuk/TheSystem-Data
- Notebook de evaluación: https://huggingface.co/Lbuk/TheSystem-9B-Probe-256/blob/main/evaluation.ipynb
- Demo en Colab: https://colab.research.google.com/github/bqpro1/TheSystem/blob/main/notebooks/01-Try-Probe-256.ipynb
- Repositorio GitHub: https://github.com/bqpro1/TheSystem
- Resultados de evaluación: https://github.com/bqpro1/TheSystem/blob/main/docs/EVALUATION.md
- Reproducibilidad: https://github.com/bqpro1/TheSystem/blob/main/docs/REPRODUCIBILITY.md
- Avisos de terceros: https://github.com/bqpro1/TheSystem/blob/main/licenses/README.md
- Licencia Apache 2.0: https://huggingface.co/Lbuk/TheSystem-9B-Probe-256/blob/main/LICENSE
- Aviso Apache 2.0 de Qwen: https://huggingface.co/Lbuk/TheSystem-9B-Probe-256/blob/main/licenses/QWEN-APACHE-2.0.txt
- Paper LoRA: https://arxiv.org/abs/2106.09685
- Paper probe classifiers: https://arxiv.org/abs/1610.01644
- Nimble: https://github.com/bespokelabsai/nimble
- Jev / System One Models: https://typesafe.ai/blog/introducing-system-one-models-and-jev
