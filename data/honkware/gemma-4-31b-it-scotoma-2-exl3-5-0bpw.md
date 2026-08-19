# Honkware/gemma-4-31B-it-scotoma-2-exl3-5.0bpw

## Resumen

Este repositorio contiene una cuantización en formato EXL3 (ExLlamaV3) de 5.0 bits por peso del modelo `ReadyArt/gemma-4-31B-it-scotoma-2`, realizada por Honkware con la herramienta BlockQuant. El resultado es un archivo de 23.7 GB que permite ejecutar el modelo en hardware con VRAM limitada, manteniendo un equilibrio entre calidad y consumo de memoria. El modelo base pertenece a la familia Gemma 4 y está etiquetado como de 31 mil millones de parámetros, aunque el conteo real de parámetros en los safetensors es de 11.851.026.028 (aproximadamente 11.85 mil millones), lo que sugiere una posible discrepancia en la nomenclatura. La cuantización sigue la licencia Apache 2.0 del modelo original y no añade restricciones adicionales. Es relevante para desarrolladores que necesitan desplegar un modelo de generación de texto conversacional en entornos locales con GPUs de gama media-alta, aprovechando la eficiencia del formato EXL3 y el soporte en cargadores como TabbyAPI, text-generation-webui o la API directa de ExLlamaV3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4, sin detalles publicados) |
| Parametros totales | 11.851.026.028 (11,85 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 5.0 bpw (bits por peso), head bits 8, codebook mul1, out-scales always, parallel mode enabled |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (formato EXL3, requiere ExLlamaV3 v0.0.3 o superior) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base `ReadyArt/gemma-4-31B-it-scotoma-2` (número de capas, dimensiones de atención, tipo de normalización, etc.) ni sobre su proceso de entrenamiento (dataset, número de tokens, técnicas de alineación como RLHF o DPO). El repositorio actual es exclusivamente una cuantización, por lo que la arquitectura subyacente debe consultarse en el modelo original. En cuanto al proceso de cuantización, Honkware utilizó BlockQuant con los siguientes parámetros: 5.0 bits por peso, 8 bits para la cabecera (head bits), 250 filas de calibración, codebook `mul1` (que requiere ExLlamaV3 v0.0.3 o superior para decodificar correctamente), escalas de salida siempre activas y modo paralelo habilitado. Estos ajustes están registrados en el archivo `quantization_config.json` y son cargados automáticamente por los loaders compatibles.

## Capacidades

- Generación de texto y conversación multi-turno (etiquetado como `conversational` y `text-generation`).
- No se han documentado capacidades adicionales específicas (como tool calling, razonamiento avanzado, soporte de visión o audio) en la información disponible.
- Las capacidades reales dependen del modelo base `ReadyArt/gemma-4-31B-it-scotoma-2`, cuyas características no han sido publicadas en este repositorio ni en los metadatos proporcionados.

## Casos de uso

- Despliegue local de un asistente conversacional: gracias al formato EXL3 y al tamaño de 23.7 GB, el modelo puede ejecutarse en GPUs con 24 GB de VRAM, permitiendo un chatbot privado sin conexión a internet.
- Integración en aplicaciones mediante la API de ExLlamaV3: los desarrolladores pueden incrustar el modelo en pipelines propios de generación de texto usando la librería Python de ExLlamaV3.
- Servidor compatible con OpenAI: con TabbyAPI se puede montar un endpoint HTTP compatible con la API de OpenAI, facilitando la sustitución de servicios cloud por una solución local.
- Experimentación con cuantización EXL3: el repositorio sirve como referencia para evaluar el impacto de 5.0 bpw en la calidad de generación frente a otras cuantizaciones (4.0 y 4.5 bpw disponibles en la colección).
- Prototipado de aplicaciones de chat en entornos de investigación donde se requiera control total sobre el hardware y los datos.
- Uso educativo para estudiar el flujo de cuantización con BlockQuant y la integración con ExLlamaV3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo cuantizado ni para su modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 24 GB, dado que el tamaño del repositorio es de 23.7 GB. Se recomienda una GPU con 24 GB o más para evitar desbordamiento de memoria.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB) o cualquier GPU con VRAM suficiente.
- En consumer GPU: cabe en RTX 4090 y RTX 3090, pero no en modelos de 16 GB o menos.
- Opciones de despliegue: TabbyAPI (servidor HTTP compatible con OpenAI), text-generation-webui (interfaz de chat local con loader ExLlamaV3) o la API directa de ExLlamaV3 para integración en código.
- Latencia y throughput: no disponibles. Dependerán de la GPU, el tamaño del contexto y la configuración de decodificación.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de una cuantización específica de un modelo base cuyas características no han sido publicadas.

## Limitaciones y advertencias

- La cuantización a 5.0 bpw puede introducir una ligera degradación en la calidad de generación respecto al modelo original en punto flotante, aunque el impacto suele ser menor a este nivel de bits.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de idioma del modelo base. Se recomienda consultar la documentación del modelo original `ReadyArt/gemma-4-31B-it-scotoma-2` antes de usarlo en producción.
- El formato EXL3 requiere ExLlamaV3 v0.0.3 o superior; versiones anteriores decodificarán los pesos con un codebook incorrecto, produciendo resultados inválidos.
- La licencia Apache 2.0 permite uso comercial, pero es obligatorio revisar los términos del modelo base, ya que la cuantización hereda sus condiciones.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un lanzamiento reciente sin validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Honkware/gemma-4-31B-it-scotoma-2-exl3-5.0bpw
- Modelo base: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Colección de cuantizaciones (otros bpw): https://huggingface.co/collections/Honkware/gemma-4-31b-it-scotoma-2-exl3-6a823003c900a8baba78fdcf
- ExLlamaV3 (librería y documentación): https://github.com/turboderp-org/exllamav3
- BlockQuant (herramienta de cuantización): https://github.com/Honkware/blockquant
- TabbyAPI (servidor HTTP): https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
