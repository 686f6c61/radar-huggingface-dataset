# richardyoung/Agents-A1-4B-heretic

## Resumen

Agents-A1-4B-heretic es una variante «abliterada» (decensurada) del modelo multimodal Agents-A1-4B desarrollado por InternScience, publicada por el usuario richardyoung en Hugging Face. Se trata de un modelo de visión-lenguaje (image-text-to-text) de aproximadamente 4.540 millones de parámetros, construido sobre la arquitectura Qwen3.5 según la etiqueta `qwen3_5` del repositorio, y orientado a tareas agénticas. La intervención «heretic» consiste en la eliminación selectiva de la dirección de rechazo en el espacio de activaciones, una técnica de abliteration que busca reducir las negativas del modelo a peticiones que el modelo base rechazaría.

El modelo resulta relevante para investigadores que necesitan evaluar el comportamiento de sistemas multimodales sin los filtros de seguridad del alineamiento original, por ejemplo en estudios de robustez, análisis de sesgos o generación de datos sintéticos sin restricciones de contenido. Al estar distribuido con licencia Apache 2.0 y pesos en safetensors compatibles con transformers, su integración técnica es directa, aunque el acceso está restringido y requiere aceptar condiciones en la plataforma.

No se dispone de información publicada sobre la composición del dataset de entrenamiento, el número de tokens procesados ni los detalles del proceso de abliteration aplicado. La ficha se limita, por tanto, a los datos verificables del repositorio y a las características inferibles de la arquitectura base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), familia Qwen3.5 (`qwen3_5`) |
| Parametros totales | 4.539.265.536 (≈4,54 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (pesos originales en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en la arquitectura `qwen3_5`, una familia de transformers multimodales de Qwen, y que procesa entradas de imagen y texto (`image-text-to-text`, pipeline VLM). El modelo base es InternScience/Agents-A1-4B, un modelo orientado a flujos agénticos, sobre el que richardyoung aplicó una modificación de tipo abliteration etiquetada como «heretic». Esta técnica, habitual en la comunidad, identifica la dirección de activación asociada a los rechazos y la proyecta fuera de los pesos, reduciendo la tasa de negativas sin reentrenamiento supervisado adicional.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones técnicas específicas del modelo base. Las referencias arXiv incluidas en las etiquetas (2406.11717, 2510.18892, 2606.30616) apuntan a trabajos relacionados, pero no se detalla su correspondencia exacta con el entrenamiento. Tampoco se documenta el procedimiento concreto de abliteration (capas intervenidas, umbrales o métricas de éxito).

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Comprensión de imágenes y respuesta conjunta imagen-texto (VLM).
- Capacidades agénticas: el modelo base está diseñado para tareas de agente, presumiblemente con soporte de tool calling y razonamiento multi-paso, aunque no se detalla en la información disponible.
- Comportamiento «uncensored»: menor tasa de rechazo ante peticiones que el modelo base declinaría, por efecto de la abliteration.
- No se confirma soporte explícito de audio, thinking mode extendido ni function calling estructurado en la documentación disponible.

## Casos de uso

- Investigación sobre alineamiento y seguridad: comparar las respuestas del modelo abliterado frente al base para medir el efecto de la eliminación de la dirección de rechazo en tareas sensibles.
- Generación de datos sintéticos multimodales: producir pares imagen-descripción sin filtros de contenido para entrenar o evaluar otros sistemas en escenarios de robustez.
- Análisis de sesgos en VLMs: estudiar cómo varía el comportamiento del modelo ante imágenes y prompts demográficamente diversos al eliminar capas de moderación.
- Prototipado de agentes visuales: construir pipelines que combinen percepción de imagen y acción multi-paso en entornos de laboratorio donde el filtrado no es requisito.
- Evaluación de técnicas de abliteration: usar el modelo como referencia reproducible (etiqueta `reproducible`) para replicar experimentos de decensurado en arquitecturas Qwen3.5.
- Red teaming de sistemas de moderación: emplear el modelo como generador adversarial de contenido para probar clasificadores de seguridad propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contexto moderado.
- Cuantización a 8 bits: ~4,5-5 GB de pesos; a 4 bits: ~2,5-3 GB, viable en GPUs consumer de 8 GB.
- GPUs recomendadas: A100 40/80 GB o H100 para servicio en fp16 con lotes grandes; RTX 4090 (24 GB) para fp16 con contexto limitado; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB (8 bits), RTX 4070/4080 y superiores; en 4 bits incluso en GPUs de 8 GB.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servicio; llama.cpp/Ollama solo si se generan cuantizaciones GGUF, no publicadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| Agents-A1-4B-heretic | ~4,54 B | no disponible | imagen-texto | Apache 2.0 | gated |
| InternScience/Agents-A1-4B (base) | ~4,54 B | no disponible | imagen-texto | no disponible en la ficha | público/gated según repo |
| Qwen2.5-VL-3B / 7B | 3-7 B | hasta 128k en algunas variantes | imagen-texto | Apache 2.0 | público |
| MiniCPM-V 2.6 (8B) | ~8 B | no disponible | imagen-texto | Apache 2.0 | público |

La comparativa con Qwen2.5-VL y MiniCPM-V se ofrece como referencia de categoría (VLM de 3-8 B); los datos de contexto y rendimiento de esas alternativas deben verificarse en sus fichas oficiales, ya que no se han contrastado aquí.

## Limitaciones y advertencias

- La abliteration reduce los rechazos pero no elimina sesgos ni conocimiento nocivo; puede aumentar la probabilidad de contenido ofensivo, ilegal o peligroso.
- Riesgo de alucinación inherente a modelos de ~4 B, superior al de modelos de mayor escala; verificar salidas en producción.
- No se documentan idiomas soportados: el rendimiento multilingüe es incierto y probablemente inferior al inglés.
- Longitud de contexto desconocida; no asumir ventanas largas sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales; la responsabilidad recae en el desplegador.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad automatizada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni a alternativas.
- El proceso de abliteration puede degradar capacidades de razonamiento o instrucción; conviene evaluar antes de usar en tareas críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Agents-A1-4B-heretic
- Modelo base: https://huggingface.co/InternScience/Agents-A1-4B
- Referencia arXiv 2406.11717: https://arxiv.org/abs/2406.11717
- Referencia arXiv 2510.18892: https://arxiv.org/abs/2510.18892
- Referencia arXiv 2606.30616: https://arxiv.org/abs/2606.30616
