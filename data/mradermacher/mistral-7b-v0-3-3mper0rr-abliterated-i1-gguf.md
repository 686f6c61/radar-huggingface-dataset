# mradermacher/Mistral-7B-v0.3-3MPER0RR-abliterated-i1-GGUF

## Resumen

Este repositorio proporciona cuantizaciones GGUF del modelo 3MPER0RR/Mistral-7B-v0.3-3MPER0RR-abliterated, elaboradas por mradermacher, un distribuidor habitual de archivos GGUF en HuggingFace. El modelo original es una variante de Mistral 7B v0.3 que ha sido sometida a un proceso de "abliterated", una técnica que elimina o reduce las capas de rechazo del modelo para permitir respuestas sobre temas que el modelo base podría censurar. El modelo tiene 7.248.023.552 parámetros, es decir, aproximadamente 7.25 mil millones. La arquitectura subyacente es la de Mistral 7B v0.3, un modelo de lenguaje basado en transformer, aunque la información disponible no especifica la longitud de contexto. La relevancia de este repositorio radica en ofrecer una colección amplia de cuantizaciones (desde i1-IQ2_XS hasta i1-Q6_K) para ejecutar el modelo en local con motores como llama.cpp u otros compatibles con GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Mistral 7B v0.3) |
| Parametros totales | 7.248.023.552 (aprox. 7.25B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | Inglés (según ficha del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral 7B v0.3, un transformer denso con atención por grupos de consultas y atención de ventana deslizante, aunque no se detallan estos aspectos en la información proporcionada. No se documenta el proceso de entrenamiento del modelo 3MPER0RR/Mistral-7B-v0.3-3MPER0RR-abliterated: no se indican datos sobre tokens utilizados, composición del dataset ni métodos como RLHF o DPO. La cuantización aplicada por mradermacher utiliza la técnica "i1" con matrices de importancia (imatrix), lo que permite generar archivos GGUF de entre 2.3 GB y 6.0 GB. La model card señala que estos quants pueden ser preferibles a los quants estáticos de tamaño similar, y que existe una versión con quants estáticos en otro repositorio.

## Capacidades

- Generación de texto en inglés: el modelo es un LLM generativo etiquetado como "conversational"; no se detallan más capacidades en la ficha.
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo está documentado el idioma inglés.
- Capacidades especiales (visión, audio, modo de razonamiento extendido): no disponible.
- Al ser una variante "abliterated", se espera que las respuestas de rechazo del modelo original hayan sido suprimidas, pero no hay documentación sobre la extensión de este efecto.

## Casos de uso

No se dispone de casos de uso documentados en la información proporcionada. A partir de su naturaleza (LLM de 7B, cuantizado a GGUF, orientado a conversación) se pueden considerar los siguientes escenarios típicos, sin que exista evidencia de rendimiento verificada:

- Asistente conversacional local sin censura: el modelo abliterated permite mantener conversaciones sobre temas que el modelo original podría rechazar; se integra fácilmente con llama.cpp u Ollama.
- Prototipado de aplicaciones de lenguaje natural en GPU de consumo: con cuantizaciones de 4-5 GB se puede ejecutar en tarjetas como RTX 3060/4060 para desarrollar chatbots, extractores de entidades o resumidores.
- Uso como base para ajuste fino o adaptación: la licencia Apache 2.0 y el tamaño de 7B permiten aplicar técnicas de bajo rango como LoRA para adaptarlo a dominios específicos.
- Análisis de texto o clasificación de documentos en inglés: un LLM de este tipo puede utilizarse para etiquetar correos, ordenar tickets o extraer sentimientos, aunque no hay resultados publicados que confirmen su calidad.
- Investigación en alineación y seguridad: al ser una variante "abliterated", resulta útil para estudiar cómo afecta la eliminación de los rechazos al comportamiento de un modelo Mistral 7B.
- Entornos educativos o de demostración: el formato GGUF facilita probar el modelo en portátiles con CPU utilizando cuantizaciones pequeñas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para el quant i1-Q4_K_M (4.5 GB) se requiere aproximadamente 5-6 GB de VRAM con un contexto corto (512-2048 tokens), y 8-10 GB para contextos de 8k o más. Para el quant i1-Q2_XS (2.3 GB) bastarían 3-4 GB, pero la calidad es muy baja.
- GPU recomendadas: para cuantizaciones Q4 a Q6, una RTX 3060 12GB, RTX 4060 8GB o superior. Los quants Q2/Q3 pueden ejecutarse en GPUs de 6-8 GB con contextos limitados.
- Compatible con GPU de consumo: sí, dependiendo del quant elegido y del tamaño de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp. El soporte de vLLM o TGI para GGUF es limitado.
- Latencia y throughput: no disponibles en la información.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar este modelo con alternativas. En la búsqueda web aparecen otros GGUF de la familia Mistral 7B abliterated, como Mistral-7B-Instruct-v0.3-abliterated-i1-GGUF y Mistral-7B-v0.3-OBLITERATED-i1-GGUF, pero no se han publicado especificaciones comparativas verificadas.

## Limitaciones y advertencias

- El proceso de "abliterated" no está documentado; no se especifica qué modificaciones se aplicaron ni su impacto exacto en el comportamiento del modelo.
- No hay evaluaciones de sesgos, alucinaciones ni seguridad publicadas en la información disponible.
- El modelo está marcado solo para inglés en su ficha, lo que limita su uso multilingüe, aunque el Mistral 7B v0.3 original podría soportar más idiomas.
- La cuantización (especialmente Q2 y Q3) puede degradar notablemente la calidad de las respuestas; la model card indica que algunos quants son de "muy baja calidad".
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia original de Mistral AI para Mistral 7B v0.3.
- Al eliminar las capas de rechazo, el modelo puede generar contenido no deseado o políticamente sensible; debe evaluarse cuidadosamente antes de desplegar en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Mistral-7B-v0.3-3MPER0RR-abliterated-i1-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/Mistral-7B-v0.3-3MPER0RR-abliterated
- Repositorio con quants estáticos: https://huggingface.co/mradermacher/Mistral-7B-v0.3-3MPER0RR-abliterated-GGUF
- Página de descargas del modelo: https://hf.tst.eu/model#Mistral-7B-v0.3-3MPER0RR-abliterated-i1-GGUF
- Referencia a variante similar: https://huggingface.co/mradermacher/Mistral-7B-Instruct-v0.3-abliterated-i1-GGUF
- Referencia a variante similar: https://huggingface.co/mradermacher/Mistral-7B-v0.3-OBLITERATED-i1-GGUF
