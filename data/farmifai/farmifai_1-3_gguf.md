# FarmifAI/FarmifAI_1.3_GGUF

## Resumen

FarmifAI_1.3_GGUF es un modelo de lenguaje y visión desarrollado por FarmifAI, que ha sido ajustado y convertido al formato GGUF mediante la librería Unsloth. El repositorio incluye varias cuantizaciones (F16, Q8_0, Q5_K_M, Q4_K_M) y un archivo adicional en BF16 para el proyector multimodal, lo que permite su ejecución en entornos de inferencia como llama.cpp. El modelo tiene 772.845.888 parámetros totales, según los datos de safetensors, lo que lo sitúa en la categoría de modelos ligeros.

Las etiquetas de HuggingFace indican "qwen3_5" y "vision-language-model", lo que sugiere una posible base en la familia Qwen3.5 y capacidades multimodales, pero no se dispone de confirmación explícita en la información proporcionada. La documentación oficial es muy escasa: no se detallan arquitectura, datos de entrenamiento, licencia ni idiomas. Su relevancia radica en la posibilidad de desplegarlo en dispositivos con recursos limitados, aunque la falta de información impide evaluar su calidad de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (etiqueta de HuggingFace: qwen3_5) |
| Parámetros totales | 772.845.888 |
| Parámetros activos | No aplica (no se indica arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, Q8_0, Q5_K_M, Q4_K_M, y BF16 (mmproj) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

No se dispone de información pública detallada sobre la arquitectura del modelo, los datos de entrenamiento o el proceso de fine-tuning. El modelo fue finetuned y convertido a formato GGUF utilizando la librería Unsloth, una herramienta de código abierto para el ajuste fino eficiente de modelos de lenguaje. La presencia de un archivo `BF16_mmproj.gguf` sugiere que el modelo incluye un proyector multimodal, coherente con la etiqueta "vision-language-model". Sin embargo, no se han proporcionado detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO.

## Capacidades

La documentación oficial no describe una lista exhaustiva de capacidades. A partir de los metadatos disponibles, se pueden inferir las siguientes características, que deben tomarse como no confirmadas:

- Generación de texto conversacional (etiqueta "conversational").
- Comprensión multimodal, probablemente visión y lenguaje (etiqueta "vision-language-model" y archivo mmproj).
- Ejecución en entornos basados en llama.cpp gracias a la conversión a GGUF.
- Compatibilidad con la sintaxis de plantillas Jinja (se recomienda `--jinja` en llama-cli).
- No se han documentado capacidades específicas de tool calling, razonamiento avanzado o soporte de agentes.
- No se ha documentado el soporte multilingüe.

## Casos de uso

La información disponible no permite enumerar casos de uso concretos validados por el autor. No obstante, por sus características técnicas (modelo ligero, cuantizaciones GGUF y posible multimodalidad), se pueden considerar aplicaciones potenciales, aunque no verificadas:

- Despliegue en dispositivos edge o equipos con GPU de consumo: gracias a las cuantizaciones Q4_K_M y Q5_K_M, el modelo podría ejecutarse con requisitos de memoria moderados.
- Prototipado de asistentes conversacionales en local: mediante llama.cpp, se puede integrar en aplicaciones de chat sin depender de la nube.
- Análisis de documentos con imágenes: si se confirma la capacidad de visión, podría utilizarse para describir o extraer información de imágenes en entornos offline.
- Experimentación con fine-tuning: la cadena de conversión con Unsloth facilita iterar sobre versiones del modelo.
- Evaluación de modelos multimodales ligeros: investigadores podrían comparar su rendimiento frente a otros modelos GGUF de tamaño similar.
- Educación y demostraciones: el modelo puede servir como ejemplo de despliegue de un modelo multimodal en formato GGUF.

Nota: estas aplicaciones son hipótesis basadas en las características del modelo y no están documentadas en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos. La información disponible no incluye valores oficiales de VRAM, latencia ni throughput. Las opciones de despliegue confirmadas incluyen:

- llama.cpp, como se indica en el ejemplo de uso de la model card: `llama-cli -hf FarmifAI/FarmifAI_1.3_GGUF --jinja`.
- Otras opciones como vLLM, Ollama o TGI no están documentadas para este modelo.

El tamaño del repositorio (3.7 GB) sugiere que el modelo es ligero, pero se recomienda probar las cuantizaciones proporcionadas para determinar los requisitos reales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El único modelo comparable conocido es FarmifAI/FarmifAI_1.2_GGUF, del que tampoco se tienen especificaciones técnicas en la información proporcionada.

## Limitaciones y advertencias

- La licencia del modelo no está declarada, lo que genera incertidumbre sobre su uso comercial.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- La arquitectura y los datos de entrenamiento son desconocidos, lo que impide evaluar la calidad del modelo de forma independiente.
- No se han publicado benchmarks, por lo que no se puede comparar objetivamente su rendimiento con otros modelos.
- La etiqueta "vision-language-model" no está respaldada por una descripción detallada de las capacidades visuales en la model card.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que el modelo no ha sido ampliamente probado por la comunidad.

## Enlaces

- Modelo GGUF: https://huggingface.co/FarmifAI/FarmifAI_1.3_GGUF
- Modelo base (según model card): https://huggingface.co/FarmifAI/FarmifAI_1.3
- Perfil de FarmifAI: https://huggingface.co/FarmifAI
- Librería Unsloth: https://github.com/unslothai/unsloth
