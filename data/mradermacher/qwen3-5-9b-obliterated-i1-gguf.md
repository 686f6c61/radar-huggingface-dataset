# mradermacher/Qwen3.5-9B-OBLITERATED-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `shoukewei/Qwen3.5-9B-OBLITERATED`, una variante "abliterated" (obliterada) de la familia Qwen3.5-9B. El autor, mradermacher, aplica la técnica de abliteration para eliminar las alineaciones de seguridad y moderación del modelo base, dando lugar a un modelo sin censura (uncensored) orientado a conversaciones y generación de texto libre. La cuantización en formato GGUF permite ejecutar el modelo en hardware local con recursos limitados, siendo una opción para desarrolladores que buscan modelos abiertos sin restricciones temáticas. No se dispone de información sobre el modelo base original (arquitectura, contexto, licencia) más allá de su tamaño de 8,95 mil millones de parámetros y su idioma principal, el inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q4_K_S (según tabla de la model card) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors del modelo base no incluido en este repo) |

## Arquitectura y entrenamiento

No se proporciona información técnica sobre la arquitectura del modelo base (Qwen3.5-9B) en la documentación disponible. Se sabe que es un modelo de lenguaje de tipo transformer denso con 8,95 mil millones de parámetros, pero los detalles de capas, atención, datos de entrenamiento o proceso de ajuste no están publicados en este repositorio. La única información relevante es que se aplicó una técnica de "abliteration" sobre el modelo base, que elimina las capas o pesos responsables de la moderación de contenido, y posteriormente se cuantizó con el método imatrix de GGUF. No hay datos sobre el volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto libre en inglés, sin filtros de contenido aparentes según la descripción del autor.
- Conversación multi-turno (tag "conversational").
- No se documentan capacidades específicas de razonamiento, código, matemáticas o visión; el modelo base Qwen3.5 es multimodal en su versión estándar, pero esta variante no declara soporte de visión ni audio.
- No se indica soporte de tool calling, function calling ni agentes.
- La capacidad multilingüe se limita al inglés según el campo "language".

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir textos narrativos, diálogos o ideas creativas sin las limitaciones habituales de seguridad, adecuado para proyectos de escritura experimental.
- Investigación sobre comportamiento de modelos sin alineación: permite estudiar cómo se comporta un LLM sin las capas de moderación, útil en estudios académicos sobre seguridad y alineación.
- Chatbots de nicho en entornos controlados: para aplicaciones donde el usuario acepta respuestas sin filtro, como simulaciones de personajes o juegos de rol.
- Desarrollo de sistemas de evaluación de contenido: se puede usar para generar textos que luego se evalúan con herramientas de moderación, para calibrar sistemas de detección de contenido dañino.
- Ajuste de prompts y pruebas de robustez: los desarrolladores pueden probar cómo responde el modelo a instrucciones extremas o ambiguas, ayudando a diseñar guardas en otros sistemas.
- Ejecución local en equipos con pocos recursos: gracias a la cuantización GGUF, el modelo puede desplegarse en una GPU de consumo (por ejemplo, RTX 3060 12 GB) con la versión Q4_K_S, para prototipado rápido sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_S (5,5 GB) se necesitan al menos 6-8 GB de VRAM para inferencia con contexto corto. Las versiones IQ2_M (3,7 GB) pueden caber en tarjetas con 4-6 GB.
- GPU recomendadas: tarjetas con 8 GB o más (RTX 3060, RTX 3070, RTX 4060 Ti, etc.) para las cuantizaciones de mayor calidad. Para las versiones más ligeras, una GTX 1660 Super o RTX 3050 también sirven.
- Si cabe en consumer GPU: sí, las cuantizaciones de 3,7 a 5,5 GB son aptas para GPUs de consumo con 4-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI (que requieren safetensors).
- Latencia y throughput: no se dispone de datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. Se puede señalar que existen otras variantes abliterated de Qwen3.5-9B, como la publicada por huihui_ai (huihui_ai/qwen3.5-abliterated) en Ollama, pero no hay datos de rendimiento ni licencia para una comparación objetiva. Se recomienda consultar la documentación oficial de Qwen3.5 para conocer las capacidades del modelo base.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o dañino sin moderación; el usuario asume el riesgo.
- No hay información sobre sesgos; es probable que herede los sesgos del modelo base Qwen3.5, pero no se ha documentado.
- Riesgo de alucinación: como todo LLM, puede inventar hechos o respuestas falsas, y la falta de moderación puede amplificar este problema.
- La licencia no está especificada; el uso comercial puede no estar permitido, ya que el modelo base Qwen3.5 tiene su propia licencia (Apache 2.0 o similar, pero no confirmada aquí).
- La cuantización reduce la calidad de salida en comparación con el modelo original en punto flotante; se recomienda probar las distintas cuantizaciones para evaluar la pérdida.
- No hay garantías de soporte o mantenimiento; el repositorio no tiene descargas ni likes, lo que sugiere un proyecto personal sin comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-9B-OBLITERATED-i1-GGUF
- Modelo base (shoukewei/Qwen3.5-9B-OBLITERATED): https://huggingface.co/shoukewei/Qwen3.5-9B-OBLITERATED
- Página de ayuda de mradermacher para solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Página de descarga alternativa del mismo modelo: https://hf.tst.eu/model#Qwen3.5-9B-OBLITERATED-i1-GGUF
