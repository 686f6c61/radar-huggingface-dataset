# joamCriff123/zils-mini-m1117b

## Resumen

zils-mini-m1117b es un modelo de decisión ("decision body") desarrollado por el usuario joamCriff123, derivado por ajuste fino del modelo base Qwen/Qwen3.5-4B. Está pensado para su uso dentro del "Zils subnet 127 mini pool", un contexto de despliegue específico del autor del que no se ofrece documentación adicional en la model card. La arquitectura declarada es qwen3_5, con pipeline de feature-extraction y licencia Apache-2.0.

El modelo cuenta con 4.539.265.536 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de aproximadamente 4.500 millones de parámetros. El repositorio ocupa 9,1 GB, coherente con pesos en precisión de 16 bits. Se distribuye en formato safetensors y requiere transformers con código personalizado (custom_code).

La relevancia de esta ficha es limitada en términos de información pública: la model card es extremadamente escueta, no se declaran idiomas soportados, no hay benchmarks publicados y el modelo registra cero descargas y cero likes en el momento de la consulta. Cualquier evaluación práctica debe realizarse directamente sobre los pesos, ya que el autor no documenta el proceso de entrenamiento ni los datos utilizados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, familia Qwen3.5) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es qwen3_5, correspondiente a la familia Qwen3.5 de Alibaba, sobre la que se ha realizado un ajuste fino a partir de Qwen/Qwen3.5-4B. El modelo se etiqueta como "decision-model" y "d3-mini", términos propios del ecosistema Zils que no vienen definidos en la información disponible. El pipeline registrado en Hugging Face es feature-extraction, lo que sugiere un uso orientado a la extracción de representaciones más que a la generación de texto libre, aunque esta interpretación no está confirmada por el autor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineamiento. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de las que herede del modelo base Qwen3.5-4B. El repositorio incluye referencias a LICENSE y NOTICE para atribuciones upstream, pero el contenido de esos ficheros no se detalla en la información proporcionada.

## Capacidades

- Extracción de características (feature-extraction): es el pipeline declarado en la tarjeta del modelo.
- Modelo de decisión: la etiqueta "decision-model" sugiere un uso orientado a tareas de clasificación o selección dentro del pool Zils, sin especificación pública del formato de entrada/salida.
- Herencia del modelo base: al derivar de Qwen3.5-4B, podría conservar capacidades de generación de texto, razonamiento y multilingüismo del modelo original, pero no hay confirmación de que estas se mantengan tras el ajuste fino.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío en la tarjeta).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Clasificación o decisión dentro del pool Zils subnet 127: el modelo está diseñado explícitamente como "decision body" para ese entorno, por lo que su uso previsto es la toma de decisiones dentro de la infraestructura del autor.
- Extracción de embeddings para downstream tasks: dado el pipeline feature-extraction declarado, puede emplearse para obtener representaciones vectoriales de texto que alimenten clasificadores o sistemas de recuperación.
- Experimentación con ajustes finos sobre Qwen3.5-4B: sirve como punto de partida para investigadores que quieran comparar el comportamiento de un fine-tune comunitario frente al modelo base.
- Prototipado de pipelines de decisión: en entornos de investigación donde se necesite un modelo de ~4.500 millones de parámetros con licencia Apache-2.0 para experimentar con arquitecturas de decisión.
- Evaluación comparativa de fine-tunes: útil para estudiar cómo un ajuste fino escasamente documentado altera las capacidades del modelo base, siempre con validación empírica propia.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache-2.0 permite uso comercial y modificación, sujeto a las atribuciones indicadas en LICENSE y NOTICE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 12-16 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 3-4 GB para pesos.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con FP16; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en FP16 de un modelo de este tamaño.
- GPU de consumo: cabe en GPUs consumer con 12 GB o más en FP16, y en GPUs de 8 GB con cuantización de 4-8 bits, siempre que el formato de pesos lo permita (no se declaran GGUF ni cuantizaciones publicadas).
- Opciones de despliegue: transformers con custom_code (requerido por la tarjeta); vLLM, llama.cpp, Ollama o TGI no están confirmados como compatibles y requerirían verificación, dado que el modelo usa código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-m1117b | 4.539.265.536 | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tune comunitario sin documentación de entrenamiento ni benchmarks |
| Qwen/Qwen3.5-4B (base) | ~4B (no confirmado en la información) | no disponible | no disponible en esta información | Hugging Face | Modelo base del que deriva; presumiblemente mejor documentado |
| Alternativas de ~4B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para establecer comparación |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks del modelo ni especificaciones públicas del modelo base más allá de su identificador.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe datos de entrenamiento, proceso de ajuste ni evaluación, lo que impide valorar su calidad de forma previa al despliegue.
- Sin benchmarks ni métricas publicadas: no hay evidencia empírica del rendimiento del modelo en ninguna tarea.
- Idiomas no declarados: se desconoce qué lenguas cubre el ajuste fino y si conserva el multilingüismo del modelo base.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada tras el ajuste fino.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta familia; sin evaluación específica no puede acotarse.
- Sesgos: no documentados; al desconocerse el dataset de ajuste fino no puede evaluarse la introducción de sesgos adicionales respecto al modelo base.
- Código personalizado: el tag custom_code implica que la carga requiere confiar en código remoto del repositorio; conviene auditar los ficheros antes de ejecutarlo en producción.
- Licencia: Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones de LICENSE y NOTICE, incluidas las del modelo base Qwen.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso comunitario ni de mantenimiento.
- Uso previsto restringido: el autor lo describe como parte del "Zils subnet 127 mini pool", un contexto no documentado públicamente; su comportamiento fuera de ese entorno es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joamCriff123/zils-mini-m1117b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
