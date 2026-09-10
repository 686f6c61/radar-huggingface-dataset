# s-zaizen/DeepSeek-V4.1-Flash-Abliterated

## Resumen

DeepSeek-V4.1-Flash-Abliterated es una conversión comunitaria del modelo DeepSeek-V4.1-Flash de DeepSeek, publicada por el usuario s-zaizen en HuggingFace. No es un lanzamiento oficial de DeepSeek: se trata de un checkpoint sometido a un proceso de abliteración (eliminación de direcciones residuales asociadas al rechazo de peticiones) mediante la herramienta Heretic de Philipp Emanuel Weidmann, en el commit `3521f8648a0dccf6e12a92666862632235fac7e6`. El resultado es un modelo multimodal de tipo image-text-to-text con 484.619.644.114 parámetros totales (unos 484,6 mil millones) distribuidos en 48 shards safetensors que suman 510,3 GB.

El checkpoint conserva la arquitectura, el tokenizer, los componentes de visión, la memoria Engram, los tensores MTP/DSpark y la configuración de contexto nativa del modelo original, así como sus formatos de almacenamiento FP8 y MXFP4. La intervención se limita a las 40 proyecciones de salida de atención, con normalización de fila completa y fusión de LoRA rank-3 que preserva la norma; no se tocan los tensores de expertos, Engram, visión, embeddings ni MTP/DSpark. Esto lo hace relevante para investigación sobre alineación y direcciones de rechazo, y para desarrolladores que necesiten un modelo de gran escala con menor tasa de negativas, a costa de requerir infraestructura multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y componentes de visión, memoria Engram y tensores MTP/DSpark; el detalle de capas y expertos no está disponible |
| Parametros totales | 484.619.644.114 (unos 484,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se conserva la configuración de contexto nativa del modelo base, sin cifra publicada) |
| Tipos de cuantizacion | FP8 y MXFP4 nativos (etiqueta `8-bit`); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base); la herramienta Heretic se distribuye bajo AGPL-3.0 |
| Formato de pesos | safetensors, 48 shards, 510,3 GB en total |

## Arquitectura y entrenamiento

El modelo parte del checkpoint DeepSeek-V4.1-Flash y mantiene intactos sus componentes arquitectónicos: el conjunto de expertos, la memoria Engram, el codificador de visión, los embeddings y los tensores MTP/DSpark, además de los formatos de almacenamiento originales FP8 y MXFP4. La única modificación es la abliteración, aplicada con el adaptador de compatibilidad nativo para DeepSeek V4.1 incluido en Heretic, que emplea su construcción de direcciones residuales y la API `heretic.model.Model.abliterate`. La intervención proyecta direcciones por capa sobre las 40 proyecciones de salida de atención, con normalización de fila completa y fusión de LoRA de rango 3 que preserva la norma.

No se publica información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. Como referencia de comportamiento, la model card reporta una baseline de rechazos iniciales medida con la métrica `KeywordRate` de Heretic sobre 100 ejemplos del split de test `mlabonne/harmful_behaviors`, con `max_response_length=100`, `batch_size=4`, temperatura 0 y modo de chat con thinking: 97 rechazos de 100 en el modelo original. El autor indica expresamente que esta cifra no es un benchmark de capacidades generales ni una puntuación de rechazo posterior a la abliteración, y que no se registraron ni publicaron los textos de los prompts ni de las respuestas.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, en modo de chat con thinking.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), al conservar los componentes de visión del modelo base.
- Memoria Engram, heredada sin modificar del modelo original.
- Tensores MTP/DSpark conservados, asociados a decodificación multi-token en la familia DeepSeek.
- Menor tasa de rechazos ante peticiones que el modelo original, gracias a la abliteración de las direcciones de rechazo.
- Soporte de tool calling, function calling y uso como agente: no disponible en la información proporcionada.
- Capacidades multilingües concretas: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el checkpoint permite estudiar cómo se comporta un modelo de 484,6 mil millones de parámetros cuando se eliminan las direcciones residuales de rechazo en las 40 proyecciones de salida de atención, comparándolo con la baseline de 97/100 rechazos del modelo original.
- Evaluación de técnicas de abliteración: sirve como caso de estudio reproducible, ya que se documenta la herramienta (Heretic), el commit exacto, el método de proyección por capa y el esquema de fusión LoRA rank-3 con preservación de norma.
- Despliegue conversacional en dominios donde el modelo base rechaza en exceso: atención al cliente o asistentes internos con requisitos de contenido que el original filtra, sujeto a las políticas de uso del operador.
- Procesamiento multimodal de documentos: al conservar el stack de visión, puede emplearse en tareas de image-text-to-text como descripción de imágenes, extracción de información de capturas o diagramas, siempre que la infraestructura soporte el tamaño del checkpoint.
- Generación y revisión de código en pipelines internos: el modelo base de la familia DeepSeek está orientado a tareas de código, aunque no se publican métricas específicas para este checkpoint abliterado que permitan cuantificar su rendimiento.
- Experimentos de memoria a largo plazo: los componentes Engram y MTP/DSpark se conservan intactos, lo que permite investigar su comportamiento en tareas de contexto extendido sin la interferencia de la intervención de abliteración.
- Fine-tuning posterior sobre el checkpoint abliterado: la licencia MIT del modelo base facilita derivados, y el autor indica que la intervención no altera expertos ni embeddings, de modo que los tensores afectados son un subconjunto acotado y documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato numérico publicado es la baseline de rechazos iniciales del modelo original medida con Heretic.

| Metrica | Modelo original (baseline) | Este checkpoint |
|---|---|---|
| Heretic `KeywordRate` de rechazos iniciales | 97/100 | no disponible (no se publica puntuación posterior a la abliteración) |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

Condiciones de la medición de rechazos: 100 ejemplos del split de test configurado `mlabonne/harmful_behaviors`, `max_response_length=100`, `batch_size=4`, temperatura 0, modo de chat con thinking. El autor advierte que no se trata de un benchmark de capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: en torno a 484 GB solo para pesos, más overhead de activaciones y caché KV; los 510,3 GB del repositorio dan una idea del espacio en disco necesario.
- Estimación en MXFP4: aproximadamente 242 GB para pesos, cifra orientativa calculada a partir del número de parámetros, no confirmada por el autor.
- Estimación en bf16/fp16 (si se convirtiera): alrededor de 969 GB, inviable sin un clúster grande.
- GPU recomendadas: configuraciones multi-GPU de centro de datos, como 8x H100 80 GB (640 GB) para FP8 o 4x H100 80 GB (320 GB) para MXFP4, siempre como estimación orientativa.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; una RTX 4090 con 24 GB queda muy lejos incluso de la cuantización más agresiva indicada.
- Opciones de despliegue: el autor indica que debe usarse un runtime que soporte el formato de checkpoint FP8/MXFP4 y la codificación de prompts originales de DeepSeek V4.1, e incluye sin cambios los ficheros de inferencia y codificación de referencia del upstream. No se especifican frameworks concretos (vLLM, TGI, llama.cpp, Ollama) en la información disponible, y llama.cpp u Ollama no son viables por tamaño.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Intervencion | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-Abliterated (s-zaizen) | 484,6 mil millones | no disponible | MIT | Abliteración con Heretic sobre 40 proyecciones de atención | Público en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| DeepSeek-V4.1-Flash (deepseek-ai) | 484,6 mil millones | no disponible | MIT | Ninguna (modelo original) | Público en HuggingFace |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos de tamaño similar, ni de métricas de capacidades de ninguno de los dos checkpoints, por lo que la comparación se limita a parámetros, licencia y naturaleza de la intervención.

## Limitaciones y advertencias

- La abliteración elimina direcciones asociadas al rechazo, de modo que el modelo puede responder a peticiones que el original declinaba; esto traslada al operador toda la responsabilidad sobre filtrado y moderación externos.
- La medición de 97/100 rechazos es una baseline del modelo original, no una puntuación de este checkpoint; no hay dato publicado que cuantifique el efecto real de la intervención.
- No hay benchmarks de capacidades, por lo que no puede verificarse si la abliteración ha degradado el rendimiento en razonamiento, código o matemáticas.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de esta escala.
- Idiomas soportados y comportamiento multilingüe: no disponibles.
- Longitud de contexto efectiva: no disponible, aunque se conserva la configuración nativa del modelo base.
- Licencia: el modelo y los ficheros fuente conservan la licencia MIT original de DeepSeek, pero la herramienta Heretic usada para generar la conversión se distribuye bajo AGPL-3.0, lo que conviene revisar según el uso previsto.
- Es una publicación comunitaria con 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida; no debe tratarse como equivalente a un release oficial.
- Requisitos de hardware muy elevados (del orden de 240 a 484 GB de pesos), lo que excluye su despliegue en hardware de consumo y en configuraciones de servidor pequeñas.
- No se documentan los prompts ni las respuestas del conjunto de evaluación de rechazos, por lo que la baseline no es auditable de forma externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/s-zaizen/DeepSeek-V4.1-Flash-Abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Commit concreto de Heretic usado: https://github.com/p-e-w/heretic/tree/3521f8648a0dccf6e12a92666862632235fac7e6
- Licencia del modelo (MIT): https://huggingface.co/s-zaizen/DeepSeek-V4.1-Flash-Abliterated/blob/main/LICENSE
- Repositorio de DeepSeek en GitHub (referenciado en la model card): https://github.com/deepseek-ai/DeepSeek-V2
- Dataset de evaluación de rechazos citado: `mlabonne/harmful_behaviors` (no se proporciona URL directa en la model card)
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
