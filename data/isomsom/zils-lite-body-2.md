# isomsom/zils-lite-body-2

## Resumen

Zils-lite-body-2 es un modelo de extracción de características (feature extraction) de 852.985.920 parámetros, publicado por el usuario isomsom en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tune de decisión construido sobre el "soup body" d3-lite, que a su vez parte de una media uniforme de dos variantes previas (Charlie320/zils-lite-v9a y qhoenix/zils-lite-decision-v9), con una torre de visión heredada sin modificar de Qwen/Qwen3.5-0.8B. El modelo está etiquetado con la arquitectura `qwen3_5` y requiere `custom_code` para cargarse, lo que indica que no funciona con una configuración estándar de transformers sin el código del autor.

El propósito declarado del modelo es la evaluación de decisiones binarias con objetivos suaves (soft targets): clasificar desenlaces resueltos como aceptación o rechazo de borradores de Wikipedia, fusiones o abandonos de revisiones de código en Gerrit, o respuestas aceptadas en Stack Exchange. No es un modelo generativo de propósito general, sino un cabezal de lectura sobre un cuerpo congelado que produce distribuciones de probabilidad sobre opciones.

Su relevancia es limitada y experimental: cero descargas y cero likes en el momento de la ficha, creado y actualizado el 11 de noviembre de 2026, sin card de idiomas ni benchmarks publicados. Resulta interesante como ejemplo de técnica de merging de LoRAs (media de deltas con factor de escala 2.5) aplicada a un modelo base pequeño con torre de visión, pero no dispone de evidencia pública de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer con torre de visión Qwen3.5-0.8B, requiere `custom_code`) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos almacenados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de la media uniforme de los pesos de dos cuerpos d3-lite (Charlie320/zils-lite-v9a en la revisión `93b0640` y qhoenix/zils-lite-decision-v9 en la revisión `083d5b9`), ambos Apache 2.0. Sobre esa media se entrenaron cuatro ejecuciones LoRA con rango 32, alpha 64 y los módulos objetivo oficiales de d3-lite, con semillas 0 a 3, a través del readout de código congelado de d3-lite. Cada ejecución usó entropía cruzada suave sobre las probabilidades de las opciones, AdamW con learning rate 8e-5 y schedule lineal, durante 360 a 445 pasos de optimización con 4 ejemplos por paso.

Los datos de entrenamiento están en el formato de casos de examen de zils con objetivos suaves e incluyen tres bloques: decisiones públicas resueltas (borradores Articles-for-Creation de Wikipedia inglesa aceptados o rechazados, revisiones de código de Gerrit de AOSP, OpenStack y Wikimedia fusionadas o abandonadas, todo resuelto antes del 14 de octubre de 2026, con deduplicación y clases balanceadas, objetivos suavizados a 0,85/0,15); filas ancla de familias de examen establecidas con la distribución de respuestas del propio soup mezclada al 15% con la respuesta gold; y preguntas con respuesta aceptada (unas 250 por ejecución en dos de las cuatro ejecuciones, de 25 sitios de Stack Exchange). La fusión final promedia los cuatro deltas LoRA (alpha/r · B@A) y aplica el cuerpo como media del soup más 2,5 veces ese delta medio, almacenado en bf16.

## Capacidades

- Extracción de características y evaluación de decisiones binarias con salida de distribución de probabilidad sobre opciones.
- Clasificación de desenlaces resueltos: aceptación/rechazo de borradores, fusión/abandono de revisiones de código, respuesta aceptada o no.
- Procesamiento de entradas multimodales a través de la torre de visión heredada de Qwen3.5-0.8B (sin fine-tune sobre ella).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados en la card).
- Modo de pensamiento (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Moderación de contenidos colaborativos: el modelo puede puntuar la probabilidad de aceptación de un borrador de artículo enciclopédico, permitiendo priorizar la revisión humana en función de la distribución de salida.
- Triaje de revisiones de código: integrado en un pipeline de CI, puede asignar probabilidad de fusión a un change request de Gerrit y enrutar los casos de baja confianza a revisores senior.
- Priorización de preguntas en foros técnicos: estimar la probabilidad de que una pregunta reciba respuesta aceptada para ordenar la cola de atención de moderadores o curadores.
- Señal auxiliar para sistemas de recomendación de contenido: usar la distribución sobre opciones como característica adicional en un ranker de contribuciones.
- Evaluación automática de calidad de datasets: aplicar el modelo como juez débil sobre pares entrada/desenlace para filtrar ejemplos ruidosos antes de un entrenamiento mayor.
- Investigación sobre merging de modelos: servir como referencia reproducible de la técnica de media de deltas LoRA con factor de escala sobre un cuerpo congelado.
- Experimentos de multimodalidad ligera: aprovechar la torre de visión de Qwen3.5-0.8B para tareas de clasificación que combinen texto e imagen, siempre que se valide su comportamiento, ya que no fue fine-tuneada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y del código personalizado; en la práctica, entre 3 y 6 GB según longitud de entrada y batch.
- Cuantización: no se documentan variantes GGUF ni cuantizaciones oficiales; al ser un modelo de 853 M de parámetros, cabe holgadamente en GPUs de consumo sin cuantizar.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; A100 o H100 no son necesarias salvo para lotes grandes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más.
- Opciones de despliegue: transformers con `trust_remote_code=True` es el único camino documentado; vLLM, llama.cpp, Ollama y TGI no están confirmados para esta arquitectura con `custom_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| isomsom/zils-lite-body-2 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tune de decisión con custom_code |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | no disponible en la información | Hugging Face | Modelo base de la torre de visión |
| Charlie320/zils-lite-v9a | no disponible | no disponible | Apache 2.0 | Hugging Face | Uno de los cuerpos promediados |
| qhoenix/zils-lite-decision-v9 | no disponible | no disponible | Apache 2.0 | Hugging Face | Otro de los cuerpos promediados |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks, evaluaciones independientes ni métricas publicadas; el rendimiento real es desconocido.
- El modelo está diseñado para evaluación de decisiones con objetivos suaves, no para generación de texto libre; usarlo como generador produciría resultados no validados.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica revisar el código del repositorio antes de ejecutarlo en producción.
- Los datos de entrenamiento están sesgados hacia dominios concretos (Wikipedia inglesa, Gerrit de AOSP/OpenStack/Wikimedia, Stack Exchange), por lo que la generalización a otros dominios es incierta.
- Idiomas soportados no declarados; la evidencia apunta a un uso principalmente en inglés.
- Riesgo de alucinación y calibración deficiente en las probabilidades de salida no evaluado.
- La licencia Apache 2.0 permite uso comercial, pero deben conservarse los avisos de los modelos base; la card indica que se incluyen sus licencias y notas.
- El modelo es muy reciente (creado el 11 de noviembre de 2026) y sin comunidad; no hay garantía de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/isomsom/zils-lite-body-2
- Modelo base Charlie320/zils-lite-v9a: https://huggingface.co/Charlie320/zils-lite-v9a/tree/93b064048a7aeb7cf0d64236136e12c903e67f40
- Modelo base qhoenix/zils-lite-decision-v9: https://huggingface.co/qhoenix/zils-lite-decision-v9/tree/083d5b9aa3d2db48155cd6e7f92ac6f9aa057c65
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
