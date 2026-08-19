# senaro/atlasv23-qwen3-8-27b-gguf

## Resumen

atlasv23-qwen3-8-27b-gguf es un modelo de lenguaje en formato GGUF, resultado de un fine-tune del modelo Qwen/Qwen3.8-27B (26,9 mil millones de parámetros) realizado por el autor «senaro». El modelo fue ajustado sobre dos datasets propios —kintsugicollective/atlas-dataset-v8-final y senaro/atlas-region2-harmful-v7— y posteriormente convertido a GGUF mediante la librería Unsloth para su uso con llama.cpp y ecosistemas compatibles.

Se trata de un modelo de texto puro (etiqueta `qwen3_5_text`), orientado a conversación, con licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribución. Su relevancia radica en ser una opción de 27B desplegable en hardware de consumo gracias a la cuantización GGUF, aunque la documentación publicada es mínima y no incluye benchmarks ni detalles de entrenamiento.

El repositorio ocupa 70,4 GB, lo que sugiere la presencia de múltiples archivos de cuantización, aunque la model card no especifica cuáles. El modelo está etiquetado como compatible con endpoints y su idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B, familia Qwen3) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados en la model card; el repositorio ocupa 70,4 GB, consistente con varias cuantizaciones GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura base corresponde a Qwen/Qwen3.8-27B, un transformer de la familia Qwen3 con aproximadamente 26,9B parámetros. La model card no detalla si se trata de una arquitectura densa o de mezcla de expertos (MoE), ni proporciona información sobre la longitud de contexto, el número de tokens de entrenamiento o la composición del dataset.

El fine-tune se realizó sobre dos datasets: `kintsugicollective/atlas-dataset-v8-final` y `senaro/atlas-region2-harmful-v7`. El segundo nombre sugiere que incluye contenido potencialmente dañino, aunque no se especifica si fue utilizado para alineación de seguridad, entrenamiento adversarial u otro propósito. El entrenamiento se llevó a cabo con Unsloth, que según la model card acelera el proceso aproximadamente 2 veces. No se documenta el uso de RLHF, DPO u otros métodos de alineación posteriores al fine-tune supervisado.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational`.
- Modelo de texto puro (etiqueta `qwen3_5_text`), sin capacidades multimodales declaradas.
- Compatible con endpoints (etiqueta `endpoints_compatible`), lo que sugiere que puede servirse mediante APIs estándar.
- Ejecutable con `llama-cli` y `llama-mtmd-cli` de llama.cpp, con soporte de plantillas Jinja (`--jinja`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, modo thinking ni soporte de agentes.
- No se documentan capacidades multilingües; el único idioma declarado es inglés.

## Casos de uso

- Despliegue local con privacidad de datos: al ser un GGUF de 27B, puede ejecutarse en una estación de trabajo con GPU de consumo, permitiendo procesar texto sensible sin enviarlo a APIs externas. Adecuado para entornos con requisitos de confidencialidad.
- Asistente conversacional en inglés: el modelo está etiquetado como conversacional, por lo que puede integrarse en chatbots o asistentes virtuales monolingües en inglés mediante llama.cpp o servidores compatibles con GGUF.
- Prototipado rápido de aplicaciones LLM: su formato GGUF permite cargarlo con llama.cpp u Ollama en minutos, facilitando la validación de ideas sin infraestructura compleja.
- Base para fine-tunes adicionales: al estar licenciado bajo Apache 2.0, puede utilizarse como punto de partida para ajustes posteriores en dominios específicos sin restricciones de redistribución.
- Investigación académica sobre fine-tuning de modelos Qwen3: el modelo documenta sus datasets de entrenamiento, lo que permite estudiar el efecto del fine-tune sobre el comportamiento del modelo base.
- Integración en pipelines de generación de texto con llama.cpp: su compatibilidad con plantillas Jinja y su formato GGUF lo hacen adecuado para scripts y aplicaciones que ya usan el ecosistema llama.cpp.

Nota: estos casos se infieren de las características declaradas (tamaño, formato, licencia, etiquetas) y no de capacidades específicas documentadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo estándar para ~27B parámetros, no datos oficiales):
  - Cuantización Q4_K_M: aproximadamente 15-17 GB de VRAM.
  - Cuantización Q8_0: aproximadamente 28-30 GB de VRAM.
  - Cuantización FP16 (si se descomprime): aproximadamente 54 GB de VRAM.
- GPUs recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4/Q5; A100 40 GB o H100 para cuantizaciones superiores o mayor velocidad.
- Cabe en GPU de consumo (RTX 3090/4090) con cuantizaciones de 4-5 bits.
- Opciones de despliegue: llama.cpp, llama-server, Ollama, LM Studio y cualquier servidor compatible con GGUF (por ejemplo, llama-cpp-python). vLLM no es compatible directamente con GGUF sin conversión previa a safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| senaro/atlasv23-qwen3-8-27b-gguf | ~26,9B | no disponible | GGUF | Apache 2.0 | Fine-tune de Qwen3.8-27B, solo inglés |
| Qwen/Qwen3.8-27B (base) | ~26,9B | no disponible | safetensors | Apache 2.0 | Modelo base sin fine-tune |
| Qwen/Qwen3-30B-A3B (referencia de la familia Qwen3) | ~30B (3B activos) | 128K (valor típico de Qwen3, no confirmado para este modelo) | safetensors | Apache 2.0 | Arquitectura MoE, referencia de la misma familia |

La comparativa se limita a modelos de la familia Qwen3 de tamaño similar, ya que no se dispone de datos de rendimiento para establecer comparaciones con otras familias (Llama, Mistral, etc.). Los valores de contexto de la fila de referencia son típicos de la familia Qwen3, no datos confirmados para este modelo concreto.

## Limitaciones y advertencias

- El dataset `senaro/atlas-region2-harmful-v7` contiene en su nombre la palabra «harmful» (dañino). Sin documentación adicional, no se puede determinar si el modelo ha sido entrenado para generar contenido dañino o si el dataset se usó para entrenamiento de seguridad. Se recomienda evaluar el comportamiento del modelo en casos de uso sensibles antes de desplegarlo.
- Solo soporta inglés de forma declarada; el rendimiento en otros idiomas es desconocido.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas estándar (razonamiento, código, matemáticas) es desconocido.
- El modelo tiene solo 10 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- La longitud de contexto no está documentada; usar el modelo con contextos largos sin verificación previa puede producir resultados degradados.
- No se documentan capacidades de tool calling ni soporte de agentes; no debe asumirse su disponibilidad.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad, seguridad o idoneidad para producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/senaro/atlasv23-qwen3-8-27b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo intermedio (pre-GGUF): https://huggingface.co/senaro/atlasv23-trm-qwen3-8-27b
- Dataset de entrenamiento 1: https://huggingface.co/datasets/kintsugicollective/atlas-dataset-v8-final
- Dataset de entrenamiento 2: https://huggingface.co/datasets/senaro/atlas-region2-harmful-v7
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
