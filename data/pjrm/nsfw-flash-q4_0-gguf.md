# PJRM/NSFW-flash-Q4_0-GGUF

## Resumen

PJRM/NSFW-flash-Q4_0-GGUF es una conversión a formato GGUF del modelo UnfilteredAI/NSFW-flash, un modelo de generación de texto de 2.240 millones de parámetros (~2,24B) orientado a conversación y contenido sin filtrar. La conversión fue realizada por el usuario PJRM mediante la herramienta GGUF-my-repo de ggml.ai, utilizando llama.cpp como backend de inferencia. Esta cuantización Q4_0 reduce el tamaño del modelo a aproximadamente 1,3 GB, lo que permite ejecutarlo en hardware modesto, incluyendo CPU o GPUs de gama baja, sin necesidad de infraestructura especializada.

El modelo base, UnfilteredAI/NSFW-flash, está entrenado con el dataset UnfilteredAI/DAN, diseñado para respuestas sin censura en inglés. Su relevancia radica en ofrecer una alternativa local y ligera para aplicaciones que requieren generación de texto sin restricciones temáticas, como roleplay o creación de contenido creativo. Sin embargo, la falta de documentación técnica pública sobre el modelo base limita el conocimiento detallado de su arquitectura y entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.240.163.840 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso usa 2048, pero no es un dato oficial) |
| Tipos de cuantizacion | Q4_0 (según el nombre del repositorio) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base UnfilteredAI/NSFW-flash. Los únicos datos disponibles son que se trata de un modelo de 2,24B parámetros, con pipeline de generación de texto y entrenado sobre el dataset UnfilteredAI/DAN, un conjunto de datos diseñado para respuestas sin censura. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas como RLHF o DPO.

La conversión a GGUF no modifica la arquitectura subyacente: simplemente reempaqueta los pesos en un formato optimizado para inferencia con llama.cpp y otras herramientas compatibles. La cuantización Q4_0 reduce la precisión de los pesos a 4 bits, lo que disminuye el tamaño del modelo y acelera la inferencia a costa de una ligera pérdida de calidad, aunque esta pérdida suele ser aceptable para tareas de generación de texto.

## Capacidades

- Generación de texto conversacional en inglés, orientado a respuestas sin filtros temáticos.
- Soporte para ejecución local mediante llama.cpp (CLI o servidor) y herramientas compatibles con GGUF como Ollama o LM Studio.
- No se ha confirmado soporte para tool calling, function calling, razonamiento multi-paso, visión, audio u otras capacidades multimodales.
- El modelo está etiquetado como "not-for-all-audiences", indicando que puede generar contenido explícito o inapropiado.

## Casos de uso

- Roleplay y narración interactiva: el modelo puede generar respuestas creativas y sin restricciones en conversaciones de rol, aprovechando su entrenamiento con el dataset DAN que fomenta respuestas no censuradas.
- Prototipado de chatbots sin moderación: desarrolladores que necesitan un asistente conversacional local sin filtros de contenido pueden integrar este GGUF mediante llama.cpp para pruebas rápidas.
- Experimentación con cuantización: al ser un modelo pequeño (2,24B) en formato Q4_0, es útil para estudiar el impacto de la cuantización en la calidad de generación en hardware limitado.
- Generación de contenido creativo: escritura de ficción, poesía o guiones donde se requiera libertad temática y un tono desinhibido.
- Educación sobre LLMs locales: sirve como ejemplo práctico de despliegue de un modelo GGUF en CPU o GPU de baja gama, mostrando el flujo completo de descarga e inferencia.
- Investigación sobre sesgos y alineación: al ser un modelo sin censura, puede utilizarse para analizar comportamientos de generación no moderada en comparación con modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo o su versión base.

## Requisitos de hardware

- Tamaño del archivo GGUF: 1,3 GB, lo que implica un uso de VRAM aproximado de 1,5-2 GB para la cuantización Q4_0 (incluyendo overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060 o superiores. También puede ejecutarse en CPU con 8 GB de RAM, aunque la velocidad será menor.
- Compatible con consumer GPUs de gama baja y media; no requiere hardware de datacenter.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama (si se importa el GGUF), LM Studio, o cualquier framework que soporte GGUF.
- Latencia y throughput: no se dispone de datos medidos. En CPU moderna (por ejemplo, Apple Silicon o Intel i7), se esperan velocidades de 10-30 tokens/segundo para este tamaño de modelo; en GPU, la velocidad puede ser significativamente mayor.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base UnfilteredAI/NSFW-flash no tiene una ficha técnica pública con benchmarks, y no se han identificado modelos equivalentes en la misma categoría (modelos sin censura de ~2B parámetros) con datos comparables. Se recomienda consultar la guía de InsiderLLM sobre LLMs locales sin censura para alternativas, aunque los datos de rendimiento específicos de este modelo no están disponibles.

## Limitaciones y advertencias

- Contenido explícito: el modelo está diseñado para generar respuestas sin censura, lo que puede incluir lenguaje ofensivo, sexual o violento. No es adecuado para entornos con menores o audiencias sensibles.
- Sesgos y alucinaciones: al no haber documentación sobre el dataset de entrenamiento, se desconocen los sesgos específicos. Es probable que presente alucinaciones frecuentes, especialmente en temas factuales, por su tamaño reducido.
- Licencia no disponible: no se especifica la licencia del modelo ni de su versión base, lo que impide conocer las restricciones de uso comercial o redistribución.
- Idioma limitado: solo se ha confirmado soporte para inglés; otros idiomas pueden producir resultados de baja calidad.
- Sin garantías de seguridad: al ser un modelo sin moderación, puede generar instrucciones peligrosas o contenido dañino si se le solicita. No debe desplegarse en producción sin un filtro de contenido externo.
- Contexto limitado: aunque el ejemplo de uso sugiere 2048 tokens, no hay confirmación oficial de la longitud máxima de contexto; podría ser inferior o superior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PJRM/NSFW-flash-Q4_0-GGUF
- Modelo base: https://huggingface.co/UnfilteredAI/NSFW-flash
- Herramienta de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Guía de LLMs sin censura locales (referencia externa): https://insiderllm.com/guides/best-uncensored-local-llms/
