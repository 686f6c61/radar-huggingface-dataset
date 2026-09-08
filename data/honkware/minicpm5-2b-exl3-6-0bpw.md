# Honkware/MiniCPM5-2B-exl3-6.0bpw

## Resumen

MiniCPM5-2B-exl3-6.0bpw es una cuantización EXL3 a 6.0 bits por peso del modelo OpenBMB/MiniCPM5-2B, realizada por Honkware con la herramienta BlockQuant. El modelo base es un Transformer denso de la familia Llama con 42 capas, optimizado para despliegue en entornos locales y con recursos limitados, como dispositivos móviles o sistemas edge. La cuantización reduce el peso del modelo a 2.3 GB, lo que facilita su ejecución en GPUs con poca VRAM.

Este modelo resuelve la necesidad de disponer de un LLM de calidad en escenarios donde no se puede acceder a servicios en la nube o se requiere un procesamiento local por privacidad. Al estar publicado bajo licencia Apache 2.0, es apto para uso comercial. La ficha describe la versión cuantizada en formato EXL3, que requiere ExLlamaV3 v0.0.3 o superior para una decodificación correcta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Llama 2B), 42 capas |
| Parametros totales | 1.146.135.040 (según archivos safetensors) |
| Parametros activos | No aplica (modelo dense, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3, 6.0 bits por peso; head bits 8; codebook mul1; out-scales always; parallel mode. Este repo contiene la cuantización de 6.0 bpw. Existen repos hermanos con otros bpw en la colección de Honkware. |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (hereda del modelo base) |
| Formato de pesos | Safetensors (EXL3) |

El conteo de parámetros según safetensors (1.146.135.040) es inferior a la denominación "2B" del modelo base; no se dispone de una explicación oficial en la información proporcionada.

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un Transformer denso de la familia Llama con 42 capas, diseñado por OpenBMB para escenarios on-device, despliegue local y cargas de trabajo con recursos limitados. Según el repositorio de OpenBMB, el modelo escala la misma receta de entrenamiento que el MiniCPM5-1B y alcanza el estado del arte en la clase de los modelos de 2B. No se dispone en la información proporcionada de detalles sobre los datos de entrenamiento, el número de tokens, la composición del dataset o el uso de técnicas de alineación como RLHF o DPO.

La cuantización EXL3 aplicada por Honkware utiliza 6.0 bits por peso, 8 bits para la cabeza (head bits), 250 filas de calibración, un libro de códigos (codebook) de tipo mul1 y escalas de salida siempre activas. Esta configuración requiere ExLlamaV3 v0.0.3 o superior; versiones anteriores ignoran el marcador del codebook y decodifican los pesos de forma incorrecta.

## Capacidades

- Generación de texto conversacional: el modelo está pensado para tareas de chat y generación de lenguaje natural, como indica su etiqueta "conversational".
- Despliegue en recursos limitados: al estar cuantizado a 6.0 bpw y ocupar 2.3 GB, es adecuado para sistemas con poca VRAM o equipos de gama de entrada.
- Inferencia local para privacidad: al ejecutarse en local, no se envían datos a servicios externos, lo que resulta útil en entornos sensibles.
- No se especifican en la información disponible capacidades adicionales como tool calling, vision, audio o razonamiento multi-paso. Debe evaluarse el comportamiento real antes de asumir dichas capacidades.

## Casos de uso

- Asistentes conversacionales en dispositivos con GPU modesta: el modelo, con 2.3 GB de pesos, puede ejecutarse en una GPU de gama de entrada con 4-6 GB de VRAM, como la GTX 1660 Super o la RTX 3050, lo que permite desplegar un asistente local sin conexión a internet para interacciones básicas de chat.
- Chatbots en entornos con requisitos de privacidad: al quedar los datos en el propio sistema, es adecuado para aplicaciones de salud, banca o legal donde no se permite enviar texto a la nube.
- Generación de resúmenes de documentos: el modelo puede procesar texto y generar resúmenes concisos, lo que resulta útil en aplicaciones de productividad para analizar informes o artículos.
- Asistencia en redacción y corrección: con licencia Apache 2.0, puede integrarse en herramientas empresariales para redactar correos, informes o documentación, siempre que se valide su calidad en el dominio concreto.
- Extracción de información y clasificación de texto: puede usarse como backend de NLP para clasificar tickets, extraer entidades o etiquetar documentos, aprovechando su bajo coste de inferencia para procesar grandes volúmenes.
- Prototipado rápido de aplicaciones con LLM: el pequeño tamaño y la posibilidad de ejecutarse en una sola GPU permiten a los desarrolladores iterar sobre funcionalidades de lenguaje de forma ágil antes de pasar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio del modelo base indica que alcanza el estado del arte en la clase de los modelos 2B, pero no se aportan cifras concretas.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 2.3 GB. Sumando la caché KV y las activaciones, se estima un uso de entre 3 y 5 GB de VRAM para inferencia con un contexto moderado. No hay datos oficiales de uso de memoria.
- GPU recomendadas: cualquier GPU de NVIDIA con al menos 4 GB de VRAM, como la RTX 3050, RTX 3060 o GTX 1660 Super. Para contextos largos o lotes mayores se recomienda más memoria.
- Puede ejecutarse en GPUs de datacenter como la T4, aunque no es necesario para este tamaño de modelo.
- Opciones de despliegue: TabbyAPI (servidor compatible con OpenAI), text-generation-webui con el loader ExLlamaV3, o la API de Python de ExLlamaV3 para integración directa en aplicaciones. El formato EXL3 no es compatible con llama.cpp (formato GGUF) ni con vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa en los resultados de búsqueda. Por su tamaño y propósito, el modelo base MiniCPM5-2B se encuadra en la categoría de LLMs de 2B para despliegue on-device, donde también compiten modelos como Gemma-2B o Qwen2.5-1.5B, pero no se publican datos de benchmarks en la información consultada. La comparativa directa no está disponible.

## Limitaciones y advertencias

- La cuantización EXL3 requiere ExLlamaV3 v0.0.3 o superior. Con versiones anteriores, la decodificación puede ser incorrecta.
- El formato de pesos EXL3 solo puede cargarse con ExLlamaV3 y sus frontends (TabbyAPI, text-generation-webui). No es un GGUF ni un formato compatible con llama.cpp, vLLM o TGI.
- No se ha especificado la longitud de contexto ni los idiomas soportados en la información disponible; estos datos deben consultarse en el modelo base o validarse experimentalmente.
- No se han publicado benchmarks para esta cuantización. El rendimiento real puede variar respecto al modelo original, y no se conoce la degradación exacta introducida por la cuantización.
- Al ser una cuantización, existe una pequeña pérdida de fidelidad esperable, aunque 6.0 bpw es una precisión relativamente alta.
- El modelo base está optimizado para escenarios con recursos limitados; es probable que su rendimiento en tareas complejas de razonamiento, matemáticas o generación de código sea inferior al de modelos más grandes.
- No se documentan sesgos ni riesgos de alucinación en la información proporcionada. Se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Honkware/MiniCPM5-2B-exl3-6.0bpw
- Modelo base: https://huggingface.co/OpenBMB/MiniCPM5-2B
- Repositorio OpenBMB/MiniCPM (GitHub): https://github.com/OpenBMB/MiniCPM
- ExLlamaV3 (GitHub): https://github.com/turboderp-org/exllamav3
- TabbyAPI (GitHub): https://github.com/theroyallab/tabbyAPI
- text-generation-webui (GitHub): https://github.com/oobabooga/text-generation-webui
- BlockQuant (herramienta de cuantización, GitHub): https://github.com/Honkware/blockquant
