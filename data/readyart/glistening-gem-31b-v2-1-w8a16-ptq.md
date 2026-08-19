# ReadyArt/Glistening-Gem-31B-v2.1-W8A16-PTQ

## Resumen

Glistening-Gem-31B-v2.1-W8A16-PTQ es una cuantización en pesos de 8 bits y activaciones de 16 bits (W8A16) del modelo merge Glistening-Gem-31B-v2.1, desarrollado por ReadyArt. El modelo original, creado por sophosympatheia, es un merge basado en arquitecturas Gemma (según las etiquetas de HuggingFace) y está pensado para generación de texto general, aunque la model card advierte que contiene contenido NSFW y no es apto para todos los públicos. Esta versión cuantizada utiliza la técnica PTQ (post-training quantization) y el formato compressed-tensors, lo que reduce el tamaño de los pesos manteniendo las activaciones en 16 bits.

A pesar del nombre "31B", los parámetros totales reales según los safetensors son 10.946.130.276 (~10,9 mil millones), lo que sugiere que el modelo base es un merge de modelos de menor tamaño, probablemente de la familia Gemma. El repositorio ocupa 36,6 GB, un tamaño considerablemente mayor al esperado para 10,9B parámetros en 8 bits, lo que podría indicar la inclusión de archivos adicionales o versiones sin cuantizar. La licencia es Apache 2.0, permitiendo uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer basado en Gemma) |
| Parametros totales | 10.946.130.276 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 (PTQ, compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original ni sobre su proceso de entrenamiento. El modelo base, Glistening-Gem-31B-v2.1, es un merge creado con mergekit, lo que implica la combinación de varios modelos preentrenados, probablemente de la familia Gemma. La cuantización W8A16 se realizó mediante PTQ, una técnica que convierte los pesos a 8 bits sin reentrenamiento, manteniendo las activaciones en 16 bits para preservar la precisión. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en lenguaje natural (capacidad general de un modelo de lenguaje, aunque no hay benchmarks específicos publicados).
- Posible soporte de razonamiento y conversación multi-turno, dado que es un modelo de lenguaje de propósito general.
- No se ha confirmado soporte de tool calling, function calling, agentes, visión o audio.
- El modelo base está etiquetado como NSFW, lo que sugiere que puede generar contenido explícito o inapropiado.
- No se dispone de información sobre capacidades multilingües específicas.

## Casos de uso

No se dispone de información concreta sobre casos de uso validados para este modelo. Dado que es una cuantización de un merge de modelos de lenguaje, podría emplearse en tareas típicas de generación de texto, pero se recomienda consultar la documentación del modelo base (sophosympatheia/Glistening-Gem-31B-v2.1) para conocer sus capacidades reales. Algunos escenarios hipotéticos, sin confirmación, serían:

- Generación de contenido creativo (relatos, diálogos) en entornos donde el contenido NSFW sea aceptable.
- Experimentación con técnicas de cuantización y despliegue eficiente en GPUs con memoria limitada.
- Evaluación de la calidad de modelos merge cuantizados frente a sus versiones originales.

Sin embargo, al no existir documentación oficial sobre casos de uso, estas sugerencias deben tomarse con cautela.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo cuantizado ni para su versión base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 10,9B parámetros en 8 bits, los pesos ocupan aproximadamente 10,9 GB. Sumando activaciones (16 bits) y overhead, se estima un consumo de 12-14 GB de VRAM en inferencia con batch pequeño.
- GPU recomendadas: tarjetas con 16 GB o más de VRAM, como RTX 4080/4090, A100 40GB, o GPUs de datacenter. En cuantización 8 bits, una RTX 3090 (24 GB) o RTX 4070 Ti (12 GB) podrían ser suficientes para cargar el modelo, aunque con limitaciones de contexto.
- No cabe en GPUs de consumo con menos de 12 GB de VRAM sin técnicas adicionales de offloading.
- Opciones de despliegue: al ser un modelo en formato safetensors con compressed-tensors, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Hugging Face Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El nombre "31B" sugiere una comparación con modelos de ese tamaño, pero los parámetros reales son ~10,9B, lo que lo situaría en la categoría de modelos medianos como Gemma-2-9B, Llama-3-8B o Mistral-7B. Sin embargo, al ser un merge y una cuantización, no se pueden establecer comparaciones fiables sin datos de rendimiento.

## Limitaciones y advertencias

- El modelo está etiquetado como NSFW y "not-for-all-audiences", por lo que no es adecuado para aplicaciones comerciales o públicas sin filtros de contenido.
- Al ser una cuantización W8A16, puede presentar una ligera degradación en la calidad de generación respecto al modelo original, especialmente en tareas de razonamiento complejo.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede ser problemático legalmente si se distribuye sin moderación.
- El tamaño del repositorio (36,6 GB) es inusualmente grande para 10,9B parámetros en 8 bits, lo que sugiere que puede contener archivos adicionales o versiones sin cuantizar; se recomienda revisar el contenido antes de descargar.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/ReadyArt/Glistening-Gem-31B-v2.1-W8A16-PTQ
- Modelo base (original): https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.1
