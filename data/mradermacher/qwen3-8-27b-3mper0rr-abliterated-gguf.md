# mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated`, una versión modificada (abliterated) del modelo Qwen3.8-27B de Alibaba. El proceso de abliteration elimina las capas de rechazo y alineación de seguridad del modelo original, lo que permite respuestas sin censura a costa de perder las salvaguardas éticas. El cuantizador mradermacher ha generado una serie de archivos GGUF en diferentes precisiones (de Q2_K a Q8_0) para facilitar su ejecución local en hardware variado, además de dos archivos multimodales (mmproj) que sugieren que el modelo base incluye un encoder de visión.

El modelo base, Qwen3.8-27B, es un transformer de 27 mil millones de parámetros con una ventana de contexto de 262 144 tokens según fuentes externas, licencia Apache 2.0 y capacidades multimodales. Esta versión abliterated conserva la arquitectura y el tamaño, pero elimina las restricciones de contenido, lo que la hace adecuada para investigación en seguridad de IA y pruebas de red team, aunque no para uso en producción sin control.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B, con posible encoder de vision) |
| Parametros totales | 26 895 998 464 (~27B) |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | 262 144 tokens (segun fuentes externas para Qwen3.8-27B; no confirmado para esta version) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivos safetensors en el repo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre el entrenamiento especifico del modelo abliterated. El modelo base Qwen3.8-27B es un transformer denso con atencion por ventanas deslizantes y un encoder de vision opcional, segun los resultados de busqueda. El proceso de abliteration, aplicado por el autor 3MPER0RR, consiste en modificar los pesos del modelo para anular las capas responsables del rechazo de contenido, manteniendo el resto de capacidades intactas. No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas como RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento: al ser una version de Qwen3.8-27B, conserva las capacidades de comprension y generacion de lenguaje del modelo original, aunque sin las restricciones de seguridad.
- Soporte multimodal: los archivos mmproj incluidos indican que el modelo base puede procesar imagenes, aunque no se ha confirmado si esta funcionalidad se mantiene en la version abliterated.
- Tool calling y function calling: no confirmado, pero probablemente heredado del modelo base.
- Capacidades multilingues: el modelo base soporta varios idiomas, pero esta version solo declara ingles en su configuracion.
- Sin modo de pensamiento explicito: no se menciona un modo de razonamiento extendido como en otros modelos.

## Casos de uso

- Investigacion en seguridad de IA: el modelo abliterated permite estudiar como se comportan los LLM sin capas de rechazo, util para evaluar riesgos de jailbreak y desarrollar contramedidas.
- Pruebas de red team: se puede usar para generar contenido que los modelos alineados rechazarian, ayudando a identificar vulnerabilidades en sistemas de moderacion.
- Generacion de texto creativo sin restricciones: para proyectos de ficcion o escritura que requieran explorar temas tabu sin filtros.
- Desarrollo de aplicaciones locales de chat: gracias a las cuantizaciones GGUF, se puede ejecutar en una GPU de consumo para prototipos o demos.
- Analisis de sesgos y comportamientos no alineados: comparando con el modelo original, se pueden identificar diferencias en la generacion de contenido sensible.
- Educacion sobre riesgos de IA: como ejemplo practico de los peligros de eliminar la alineacion, en cursos de etica y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantizacion no proporciona datos de rendimiento, y no hay referencias a evaluaciones del modelo abliterated en los resultados de busqueda.

## Requisitos de hardware

- VRAM estimada: segun el tamaño de los archivos GGUF, la cuantizacion Q4_K_M (16,6 GB) requiere al menos 20 GB de VRAM para inferencia con contexto moderado. La Q8_0 (28,7 GB) necesita mas de 32 GB.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M, A100 40 GB o H100 para Q8_0. Las cuantizaciones Q2_K (10,8 GB) pueden caber en una RTX 3080 de 12 GB o similar.
- En consumer GPU: si, las cuantizaciones Q2_K a Q5_K_M caben en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con adaptacion), TGI. Los archivos GGUF son compatibles con cualquier runtime que soporte este formato.
- Latencia y throughput: no disponible, depende del hardware y la cuantizacion.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. Existen otros modelos abliterated de Qwen3.8-27B en HuggingFace, como `mradermacher/Qwen3.8-27B-OBLITERATED-GGUF`, que probablemente sean similares en rendimiento. Sin embargo, no hay benchmarks publicados que permitan una comparacion objetiva. Se recomienda evaluar localmente con tareas especificas.

## Limitaciones y advertencias

- Contenido sin filtrar: al eliminar las capas de rechazo, el modelo puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No es apto para uso en produccion sin moderacion externa.
- Riesgo de alucinacion: como cualquier LLM, puede inventar informacion, especialmente en temas especializados.
- Sesgos: el modelo base puede heredar sesgos de sus datos de entrenamiento, y la abliteration no los corrige.
- Idioma: solo se declara ingles, aunque el modelo base podria soportar otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede violar politicas de plataformas o leyes locales.
- Contexto largo: aunque se menciona 262k tokens, no se ha verificado que la version abliterated mantenga esta capacidad en la practica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated
- Guia de ejecucion local: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guia alternativa: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Modelo similar (OBLITERATED): https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-GGUF
